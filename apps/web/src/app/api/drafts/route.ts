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
import { getAuthSessionState } from '../../../../../../infra/supabase/auth';
import { getSupabaseEnv } from '../../../../../../infra/supabase/env';
import { consumeRateLimit, hashIpForRateLimit } from '../../../../../../infra/supabase/rateLimit';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';

export async function POST(request: NextRequest) {
  try {
    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json(
        {
          error:
            'Supabase service keys are not configured in .env.local yet. Live preview works, and saving drafts activates once keys are set.',
          code: 'SUPABASE_NOT_CONFIGURED',
          retryable: false,
        },
        { status: 503 },
      );
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'local';
    const rl = await consumeRateLimit({
      key: `draft_create:${hashIpForRateLimit(ip)}`,
      maxHits: 40,
      windowSeconds: 3600,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: 'Too many drafts created recently. Please wait a minute and retry.',
          retryAfterSeconds: rl.retryAfterSeconds,
          retryable: true,
        },
        { status: 429 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      themeId?: string;
      language?: string;
      content?: Record<string, unknown>;
    };

    const config = getWebzyPublicConfig();
    const theme = getThemeById(body.themeId || '', {
      includeMaanJao: config.flags.maanJaoTheme,
    });
    if (!theme) {
      throw new WebzyError('Selected theme is unavailable.', {
        code: 'THEME_NOT_FOUND',
        statusCode: 404,
      });
    }

    const language = parseLanguageCode(body.language);
    const rawContent = body.content ?? {};
    const sanitizedContent: Record<string, unknown> = {};

    if (typeof rawContent.receiverName === 'string' && rawContent.receiverName.trim()) {
      sanitizedContent.receiverName = assertSafeReadyMadeText(
        'Receiver name',
        rawContent.receiverName.slice(0, 40),
      );
    }
    if (typeof rawContent.senderName === 'string' && rawContent.senderName.trim()) {
      sanitizedContent.senderName = assertSafeReadyMadeText(
        'Your name',
        rawContent.senderName.slice(0, 40),
      );
    }
    if (typeof rawContent.relation === 'string' && rawContent.relation.trim()) {
      sanitizedContent.relation = rawContent.relation.trim().slice(0, 32);
    }
    if (typeof rawContent.message === 'string' && rawContent.message.trim()) {
      sanitizedContent.message = assertSafeReadyMadeText(
        'Message',
        rawContent.message.slice(0, 320),
      );
    }
    if (theme.occasion === 'business' && typeof rawContent.whatsappPhone === 'string') {
      const normalizedWa = validateBusinessWhatsappNumber(rawContent.whatsappPhone);
      if (normalizedWa) sanitizedContent.whatsappPhone = normalizedWa;
    }

    const admin = createSupabaseAdminClient();
    const { data: versionRow, error: verErr } = await admin
      .from('theme_versions')
      .select('id')
      .eq('theme_id', theme.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (verErr || !versionRow) {
      logEvent('error', 'web.drafts.missing_theme_version', { themeId: theme.id });
      throw new WebzyError(
        'Theme schema is not seeded in Postgres yet. Run 0002_seed_themes_and_assets.sql.',
        { code: 'THEME_VERSION_NOT_SEEDED', statusCode: 503, retryable: false },
      );
    }

    const session = await getAuthSessionState();
    const draftToken = crypto.randomBytes(32).toString('base64url');
    const draftTokenHash = crypto.createHash('sha256').update(draftToken).digest('hex');

    const { data: inserted, error: insErr } = await admin
      .from('drafts')
      .insert({
        theme_id: theme.id,
        theme_version_id: versionRow.id,
        user_id: session.user?.id ?? null,
        draft_token: draftToken,
        draft_token_hash: draftTokenHash,
        content_json: sanitizedContent,
        language,
      })
      .select('id, expires_at')
      .single();

    if (insErr || !inserted) {
      logEvent('error', 'web.drafts.create_failed', { dbCode: insErr?.code || 'unknown' });
      throw new WebzyError('Unable to create draft right now. Please retry.', {
        code: 'DRAFT_CREATE_FAILED',
        statusCode: 500,
        retryable: true,
      });
    }

    logEvent('info', 'web.drafts.created', {
      draftId: inserted.id,
      themeId: theme.id,
      hasUser: Boolean(session.user),
    });

    const response = NextResponse.json(
      {
        draftId: inserted.id,
        draftToken,
        themeId: theme.id,
        expiresAt: inserted.expires_at,
        resumeUrl: `/create/${theme.id}?draft=${draftToken}`,
        previewUrl: `/preview/${draftToken}`,
      },
      { status: 201 },
    );

    response.cookies.set('webzy_pending_draft', draftToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err) {
    if (err instanceof WebzyError) {
      return NextResponse.json(
        { error: err.message, code: err.code, retryable: err.retryable },
        { status: err.statusCode },
      );
    }
    logEvent('error', 'web.drafts.post_exception', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json(
      { error: 'Unable to save draft right now. Please retry.', retryable: true },
      { status: 500 },
    );
  }
}
