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
import { guardMutationRequest } from '../../../../../../infra/security/requestGuard';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';

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
    // Reject invalid or non-HTTP(S) schemes such as javascript:, data:, blob:
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

export async function POST(request: NextRequest) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'draft_create',
      maxHits: 40,
      windowSeconds: 3600,
    });
    if (guard) return guard;

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
    if (
      theme.occasion === 'wedding' &&
      rawContent.weddingData !== undefined
    ) {
      const cleanedWedding = sanitizeWeddingPayload(rawContent.weddingData);
      const serialized = JSON.stringify(cleanedWedding);
      if (serialized.length > 50_000) {
        throw new WebzyError('Wedding invitation payload is too large. Please trim long fields.', {
          code: 'WEDDING_PAYLOAD_TOO_LARGE',
          statusCode: 413,
        });
      }
      sanitizedContent.weddingData = cleanedWedding;
    }

    const admin = createSupabaseAdminClient();
    let { data: versionRow, error: verErr } = await admin
      .from('theme_versions')
      .select('id')
      .eq('theme_id', theme.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Auto-seed newly added catalog themes (such as Hindu Vivah editions) if Postgres seed migration hasn't run yet
    if (verErr || !versionRow) {
      await admin.from('themes').upsert(
        {
          id: theme.id,
          mode: theme.mode,
          occasion: theme.occasion,
          languages: theme.languages,
          price_inr: theme.price.base,
          status: 'active',
        },
        { onConflict: 'id' },
      );

      const { data: seededVersion } = await admin
        .from('theme_versions')
        .upsert(
          {
            theme_id: theme.id,
            version: theme.version || '1.0.0',
            field_schema: theme.fields.map((f) => f.key),
            addons: theme.price.addons,
            status: 'active',
          },
          { onConflict: 'theme_id,version' },
        )
        .select('id')
        .maybeSingle();

      if (seededVersion) {
        versionRow = seededVersion;
        verErr = null;
      }
    }

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

    const resumeUrl =
      theme.occasion === 'wedding'
        ? `/weddings/${theme.id}/customize?draft=${draftToken}`
        : `/create/${theme.id}?draft=${draftToken}`;

    const response = NextResponse.json(
      {
        draftId: inserted.id,
        draftToken,
        themeId: theme.id,
        expiresAt: inserted.expires_at,
        resumeUrl,
        previewUrl: `/preview/${draftToken}`,
      },
      { status: 201 },
    );

    response.cookies.set('webzy_pending_draft', draftToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
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
