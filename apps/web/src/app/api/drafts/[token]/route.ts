import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import {
  assertSafeReadyMadeText,
  getWebzyPublicConfig,
  logEvent,
  parseLanguageCode,
  validateBusinessWhatsappNumber,
  WebzyError,
} from '@webzy/core';
import { getThemeById } from '@webzy/themes';
import { guardMutationRequest } from '../../../../../../../infra/security/requestGuard';
import { getSupabaseEnv } from '../../../../../../../infra/supabase/env';
import { consumeRateLimit, hashIpForRateLimit } from '../../../../../../../infra/supabase/rateLimit';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

async function findActiveDraft(token: string) {
  if (!token || !/^[A-Za-z0-9_-]{24,128}$/.test(token)) return null;
  const admin = createSupabaseAdminClient();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const nowIso = new Date().toISOString();

  const { data, error } = await admin
    .from('drafts')
    .select('id, theme_id, theme_version_id, user_id, content_json, language, ai_generations_used, reveal_at, timezone, expires_at')
    .eq('draft_token_hash', tokenHash)
    .is('deleted_at', null)
    .gt('expires_at', nowIso)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'local';
    const rl = await consumeRateLimit({
      key: `draft_get:${hashIpForRateLimit(ip)}`,
      maxHits: 60,
      windowSeconds: 60,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.', retryable: true },
        { status: 429 },
      );
    }

    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
    }

    const { token } = await params;
    const draft = await findActiveDraft(token);
    if (!draft) {
      return NextResponse.json({ error: 'Draft not found or expired.' }, { status: 404 });
    }

    const admin = createSupabaseAdminClient();
    const { data: assetRows } = await admin
      .from('assets')
      .select('id, storage_key, width, height')
      .eq('draft_id', draft.id)
      .eq('status', 'ready')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(3);

    const photos: Array<{ assetId: string; signedUrl: string; width: number; height: number }> = [];
    for (const row of assetRows || []) {
      const { data: signed } = await admin.storage
        .from('webzy-media')
        .createSignedUrl(row.storage_key, 900);
      if (signed?.signedUrl) {
        photos.push({
          assetId: row.id,
          signedUrl: signed.signedUrl,
          width: row.width ?? 0,
          height: row.height ?? 0,
        });
      }
    }

    return NextResponse.json({
      draftId: draft.id,
      themeId: draft.theme_id,
      language: draft.language,
      content: draft.content_json,
      aiGenerationsUsed: draft.ai_generations_used ?? 0,
      revealAt: draft.reveal_at,
      timezone: draft.timezone,
      photos,
    });
  } catch (err) {
    logEvent('error', 'web.drafts.get_error', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json(
      { error: 'Unable to load draft. Please retry.', retryable: true },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'draft_patch',
      maxHits: 120,
      windowSeconds: 3600,
    });
    if (guard) return guard;

    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
    }

    const { token } = await params;
    const draft = await findActiveDraft(token);
    if (!draft) {
      return NextResponse.json({ error: 'Draft not found or expired.' }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      language?: string;
      revealAt?: string | null;
      content?: Record<string, unknown>;
    };

    const config = getWebzyPublicConfig();
    const theme = getThemeById(draft.theme_id, {
      includeMaanJao: config.flags.maanJaoTheme,
    });
    if (!theme) {
      return NextResponse.json({ error: 'Theme is no longer active.' }, { status: 404 });
    }

    const existing = (draft.content_json as Record<string, unknown>) || {};
    const incoming = body.content ?? {};
    const nextContent: Record<string, unknown> = { ...existing };

    if (typeof incoming.receiverName === 'string') {
      nextContent.receiverName = incoming.receiverName.trim()
        ? assertSafeReadyMadeText('Receiver name', incoming.receiverName.slice(0, 40))
        : '';
    }
    if (typeof incoming.senderName === 'string') {
      nextContent.senderName = incoming.senderName.trim()
        ? assertSafeReadyMadeText('Your name', incoming.senderName.slice(0, 40))
        : '';
    }
    if (typeof incoming.relation === 'string') {
      nextContent.relation = incoming.relation.trim().slice(0, 32);
    }
    if (typeof incoming.message === 'string') {
      nextContent.message = incoming.message.trim()
        ? assertSafeReadyMadeText('Message', incoming.message.slice(0, 320))
        : '';
    }
    if (theme.occasion === 'business' && typeof incoming.whatsappPhone === 'string') {
      nextContent.whatsappPhone = validateBusinessWhatsappNumber(incoming.whatsappPhone) || '';
    }

    let revealAtIso: string | null = draft.reveal_at;
    if (typeof body.revealAt === 'string' && body.revealAt.trim()) {
      // Normalize naive YYYY-MM-DDTHH:mm(:ss) explicitly in IST (+05:30)
      const raw = body.revealAt.trim();
      const istCandidate = /(?:Z|[+-]\d{2}:\d{2})$/.test(raw)
        ? raw
        : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)
          ? `${raw}:00+05:30`
          : `${raw}+05:30`;
      const parsed = Date.parse(istCandidate);
      if (Number.isNaN(parsed)) {
        throw new WebzyError('Invalid reveal date/time.', { code: 'INVALID_REVEAL_AT', statusCode: 400 });
      }
      revealAtIso = new Date(parsed).toISOString();
    } else if (body.revealAt === null || body.revealAt === '') {
      revealAtIso = null;
    }

    const admin = createSupabaseAdminClient();
    const { error: updErr } = await admin
      .from('drafts')
      .update({
        language: body.language ? parseLanguageCode(body.language) : draft.language,
        content_json: nextContent,
        reveal_at: revealAtIso,
        timezone: 'Asia/Kolkata',
      })
      .eq('id', draft.id);

    if (updErr) {
      logEvent('error', 'web.drafts.patch_db_failed', { dbCode: updErr.code || 'unknown' });
      throw new WebzyError('Failed to save draft changes. Please retry.', {
        code: 'DRAFT_SAVE_FAILED',
        statusCode: 500,
        retryable: true,
      });
    }

    logEvent('info', 'web.drafts.saved', { draftId: draft.id });
    return NextResponse.json({
      ok: true,
      draftId: draft.id,
      content: nextContent,
      revealAt: revealAtIso,
    });
  } catch (err) {
    if (err instanceof WebzyError) {
      return NextResponse.json(
        { error: err.message, code: err.code, retryable: err.retryable },
        { status: err.statusCode },
      );
    }
    logEvent('error', 'web.drafts.patch_exception', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json(
      { error: 'Unable to save draft right now. Please retry.', retryable: true },
      { status: 500 },
    );
  }
}
