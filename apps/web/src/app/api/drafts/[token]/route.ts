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
import { extractClientIp, guardMutationRequest } from '../../../../../../../infra/security/requestGuard';
import { getAuthSessionState } from '../../../../../../../infra/supabase/auth';
import { getSupabaseEnv } from '../../../../../../../infra/supabase/env';
import { consumeRateLimit, hashIpForRateLimit } from '../../../../../../../infra/supabase/rateLimit';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

function sanitizeHttpUrl(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString().slice(0, 1000);
    }
  } catch {
    // Reject non-HTTP(S) URLs
  }
  return '';
}

function cleanText(raw: unknown, maxLen: number): string | undefined {
  if (typeof raw !== 'string') return undefined;
  return raw.trim().slice(0, maxLen);
}

function sanitizeWeddingPayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new WebzyError('Invalid wedding invitation payload.', {
      code: 'INVALID_WEDDING_PAYLOAD',
      statusCode: 400,
    });
  }
  const input = raw as Record<string, unknown>;
  const cleaned: Record<string, unknown> = {};

  const scalarLimits: Array<[string, number]> = [
    ['templateId', 64],
    ['language', 16],
    ['slug', 64],
    ['brideName', 80],
    ['groomName', 80],
    ['couple', 120],
    ['coupleTagline', 160],
    ['tagline', 160],
    ['hashtag', 60],
    ['weddingDate', 64],
    ['weddingDateDisplay', 80],
    ['venueName', 120],
    ['venueCity', 120],
    ['city', 120],
    ['brideParents', 160],
    ['groomParents', 160],
    ['familyBlessingLine', 160],
    ['personalMessage', 500],
    ['storyTitle', 100],
    ['storyText', 500],
  ];

  for (const [key, maxLen] of scalarLimits) {
    const val = cleanText(input[key], maxLen);
    if (val !== undefined) {
      cleaned[key] = val;
    }
  }

  if (input.tradition === 'hindu' || input.tradition === 'christian') {
    cleaned.tradition = input.tradition;
  }

  if (typeof input.musicUrl === 'string') {
    const safeMusicUrl = sanitizeHttpUrl(input.musicUrl);
    if (safeMusicUrl) {
      cleaned.musicUrl = safeMusicUrl;
    }
  }

  if (Array.isArray(input.gallery)) {
    cleaned.gallery = input.gallery
      .map((u) => sanitizeHttpUrl(u))
      .filter((u) => Boolean(u))
      .slice(0, 6);
  }

  if (input.venueHighlight && typeof input.venueHighlight === 'object' && !Array.isArray(input.venueHighlight)) {
    const vh = input.venueHighlight as Record<string, unknown>;
    const distanceNote = cleanText(vh.distanceNote, 160);
    cleaned.venueHighlight = {
      name: cleanText(vh.name, 120) ?? '',
      city: cleanText(vh.city, 120) ?? '',
      tagline: cleanText(vh.tagline, 160) ?? '',
      mapUrl: sanitizeHttpUrl(vh.mapUrl),
      ...(distanceNote !== undefined ? { distanceNote } : {}),
    };
  }

  if (Array.isArray(input.events)) {
    cleaned.events = input.events
      .slice(0, 8)
      .filter((ev): ev is Record<string, unknown> => Boolean(ev && typeof ev === 'object' && !Array.isArray(ev)))
      .map((item) => {
        const dressCode = cleanText(item.dressCode, 120);
        const palette = Array.isArray(item.eventDressPalette)
          ? item.eventDressPalette
              .filter((c): c is string => typeof c === 'string' && /^#[0-9A-Fa-f]{3,8}$/.test(c.trim()))
              .map((c) => c.trim())
              .slice(0, 6)
          : undefined;
        return {
          id: cleanText(item.id, 64) ?? '',
          title: cleanText(item.title, 120) ?? '',
          dateTime: cleanText(item.dateTime, 64) ?? '',
          venueName: cleanText(item.venueName, 120) ?? '',
          address: cleanText(item.address, 200) ?? '',
          mapUrl: sanitizeHttpUrl(item.mapUrl),
          ...(dressCode !== undefined ? { dressCode } : {}),
          ...(palette !== undefined ? { eventDressPalette: palette } : {}),
          iconKey: cleanText(item.iconKey, 32) ?? 'ganesha',
        };
      });
  }

  if (Array.isArray(input.storyMilestones)) {
    cleaned.storyMilestones = input.storyMilestones
      .slice(0, 6)
      .filter((m): m is Record<string, unknown> => Boolean(m && typeof m === 'object' && !Array.isArray(m)))
      .map((m) => ({
        year: cleanText(m.year, 24) ?? '',
        title: cleanText(m.title, 100) ?? '',
        caption: cleanText(m.caption, 200) ?? '',
      }));
  }

  if (Array.isArray(input.hospitalityNotes)) {
    cleaned.hospitalityNotes = input.hospitalityNotes
      .slice(0, 6)
      .filter((n): n is Record<string, unknown> => Boolean(n && typeof n === 'object' && !Array.isArray(n)))
      .map((n) => ({
        title: cleanText(n.title, 100) ?? '',
        detail: cleanText(n.detail, 240) ?? '',
      }));
  }

  if (input.rsvp && typeof input.rsvp === 'object' && !Array.isArray(input.rsvp)) {
    const r = input.rsvp as Record<string, unknown>;
    const whatsappNumber =
      typeof r.whatsappNumber === 'string' ? r.whatsappNumber.replace(/[^0-9+]/g, '').slice(0, 16) : undefined;
    const deadlineDate = cleanText(r.deadlineDate, 40);
    const maxGuests =
      typeof r.maxGuests === 'number' && Number.isFinite(r.maxGuests)
        ? Math.min(20, Math.max(1, Math.floor(r.maxGuests)))
        : 4;
    cleaned.rsvp = {
      enabled: Boolean(r.enabled),
      ...(whatsappNumber !== undefined ? { whatsappNumber } : {}),
      ...(deadlineDate !== undefined ? { deadlineDate } : {}),
      maxGuests,
      askMealPreference: typeof r.askMealPreference === 'boolean' ? r.askMealPreference : true,
    };
  }

  if (input.shagun && typeof input.shagun === 'object' && !Array.isArray(input.shagun)) {
    const s = input.shagun as Record<string, unknown>;
    const upiId = cleanText(s.upiId, 80);
    const beneficiaryName = cleanText(s.beneficiaryName, 100);
    cleaned.shagun = {
      enabled: Boolean(s.enabled),
      ...(upiId !== undefined ? { upiId } : {}),
      ...(beneficiaryName !== undefined ? { beneficiaryName } : {}),
    };
  }

  if (input.themeOverrides && typeof input.themeOverrides === 'object' && !Array.isArray(input.themeOverrides)) {
    const to = input.themeOverrides as Record<string, unknown>;
    if (typeof to.accentColor === 'string' && /^#[0-9A-Fa-f]{3,8}$/.test(to.accentColor.trim())) {
      cleaned.themeOverrides = { accentColor: to.accentColor.trim() };
    }
  }

  return cleaned;
}

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
    const ip = extractClientIp(request);
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
      .limit(6);

    const photos: Array<{ assetId: string; signedUrl: string; width: number; height: number }> = [];
    const validRows = (assetRows || []).filter(
      (row): row is typeof row & { storage_key: string } => Boolean(row.storage_key),
    );
    const keys = validRows.map((row) => row.storage_key);

    if (keys.length > 0) {
      const { data: signedList } = await admin.storage
        .from('webzy-media')
        .createSignedUrls(keys, 900);

      const urlByKey = new Map<string, string>();
      for (const item of signedList || []) {
        if (item.path && item.signedUrl) {
          urlByKey.set(item.path, item.signedUrl);
        }
      }

      for (const row of validRows) {
        const signedUrl = urlByKey.get(row.storage_key);
        if (signedUrl) {
          photos.push({
            assetId: row.id,
            signedUrl,
            width: row.width ?? 0,
            height: row.height ?? 0,
          });
        }
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

    if (draft.user_id) {
      const session = await getAuthSessionState();
      if (!session.user || session.user.id !== draft.user_id) {
        return NextResponse.json(
          { error: 'This draft belongs to a signed-in account. Please sign in as the owner to edit it.' },
          { status: 403 },
        );
      }
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
    if (typeof incoming.headline === 'string') {
      nextContent.headline = incoming.headline.trim()
        ? assertSafeReadyMadeText('Custom headline', incoming.headline.slice(0, 90))
        : '';
    }
    if (typeof incoming.message === 'string') {
      nextContent.message = incoming.message.trim()
        ? assertSafeReadyMadeText('Message', incoming.message.slice(0, 320))
        : '';
    }
    if (theme.occasion === 'business' && typeof incoming.offerTag === 'string') {
      nextContent.offerTag = incoming.offerTag.trim()
        ? assertSafeReadyMadeText('Offer badge', incoming.offerTag.slice(0, 120))
        : '';
    }
    if (Array.isArray(incoming.highlights)) {
      const cleanedHighlights = incoming.highlights
        .slice(0, 4)
        .filter((h): h is Record<string, unknown> => Boolean(h && typeof h === 'object' && !Array.isArray(h)))
        .map((h, idx) => {
          const rawTitle = typeof h.title === 'string' ? h.title.trim().slice(0, 60) : '';
          const rawDetail = typeof h.detail === 'string' ? h.detail.trim().slice(0, 180) : '';
          return {
            title: rawTitle ? assertSafeReadyMadeText(`Card ${idx + 1} title`, rawTitle) : '',
            detail: rawDetail ? assertSafeReadyMadeText(`Card ${idx + 1} note`, rawDetail) : '',
          };
        });
      nextContent.highlights = cleanedHighlights.some((h) => h.title || h.detail)
        ? cleanedHighlights
        : [];
    }
    const allowsWhatsapp =
      theme.occasion === 'business' ||
      theme.fields.some((f) => f.key === 'whatsappPhone');
    if (allowsWhatsapp && typeof incoming.whatsappPhone === 'string') {
      nextContent.whatsappPhone = validateBusinessWhatsappNumber(incoming.whatsappPhone) || '';
    }
    if (
      theme.occasion === 'wedding' &&
      incoming.weddingData !== undefined
    ) {
      const cleanedWedding = sanitizeWeddingPayload(incoming.weddingData);
      const serialized = JSON.stringify(cleanedWedding);
      if (serialized.length > 50_000) {
        throw new WebzyError('Wedding invitation payload is too large. Please trim long fields.', {
          code: 'WEDDING_PAYLOAD_TOO_LARGE',
          statusCode: 413,
        });
      }
      nextContent.weddingData = cleanedWedding;
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
