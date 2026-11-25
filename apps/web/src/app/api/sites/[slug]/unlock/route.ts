import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import {
  extractClientIp,
  guardMutationRequest,
  signPinUnlockCookie,
} from '../../../../../../../../infra/security/requestGuard';
import { getSupabaseEnv } from '../../../../../../../../infra/supabase/env';
import { hashIpForRateLimit } from '../../../../../../../../infra/supabase/rateLimit';
import { createSupabaseAdminClient } from '../../../../../../../../infra/supabase/server';

const MAX_FAILED_PIN_ATTEMPTS = 5;
const PIN_LOCKOUT_MS = 15 * 60 * 1000;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'site_pin_unlock',
      maxHits: 15,
      windowSeconds: 900,
    });
    if (guard) return guard;

    const { slug } = await context.params;
    if (!slug || !/^[A-Za-z0-9_-]{6,64}$/.test(slug)) {
      return NextResponse.json({ error: 'Invalid link.' }, { status: 400 });
    }

    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 });
    }

    const body = (await request.json().catch(() => ({}))) as { pin?: string };
    const cleanPin = typeof body.pin === 'string' ? body.pin.replace(/\D/g, '') : '';
    if (cleanPin.length !== 4) {
      return NextResponse.json(
        { error: 'Please enter the 4-digit PIN.' },
        { status: 400 },
      );
    }

    const admin = createSupabaseAdminClient();
    const { data: site } = await admin
      .from('sites')
      .select('id, slug, content_json, deleted_at, status')
      .eq('slug', slug)
      .maybeSingle();

    if (!site || site.deleted_at || site.status === 'removed') {
      return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
    }

    const rawContent = (site.content_json as Record<string, unknown> | null) || {};
    const expectedHash = typeof rawContent.secretPinHash === 'string' ? rawContent.secretPinHash : '';
    const pinSalt = typeof rawContent.pinSalt === 'string' ? rawContent.pinSalt : site.id;

    if (!expectedHash) {
      return NextResponse.json({ ok: true });
    }

    const ipHash = hashIpForRateLimit(extractClientIp(request));
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();

    const { data: attemptRow } = await admin
      .from('site_pin_attempts')
      .select('failed_attempts, locked_until')
      .eq('site_id', site.id)
      .eq('limiter_key', ipHash)
      .maybeSingle();

    const lockedUntilMs = attemptRow?.locked_until ? Date.parse(attemptRow.locked_until) : 0;
    if (lockedUntilMs > nowMs) {
      const retryAfterSeconds = Math.max(1, Math.ceil((lockedUntilMs - nowMs) / 1000));
      const retryMinutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
      return NextResponse.json(
        {
          error: `Too many incorrect PIN attempts. Please try again in ${retryMinutes} minute${retryMinutes === 1 ? '' : 's'}.`,
          retryAfterSeconds,
          retryable: true,
        },
        { status: 429 },
      );
    }

    const candidateHash = crypto
      .createHash('sha256')
      .update(`webzy-pin:${pinSalt}:${cleanPin}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedHash, 'utf8');
    const candidateBuf = Buffer.from(candidateHash, 'utf8');
    const isMatch =
      expectedBuf.length === candidateBuf.length &&
      crypto.timingSafeEqual(expectedBuf, candidateBuf);

    if (!isMatch) {
      const priorFailed =
        lockedUntilMs > 0 && lockedUntilMs <= nowMs
          ? 0
          : Number(attemptRow?.failed_attempts ?? 0);
      const nextFailed = priorFailed + 1;
      const isNowLocked = nextFailed >= MAX_FAILED_PIN_ATTEMPTS;
      const nextLockedUntil = isNowLocked ? new Date(nowMs + PIN_LOCKOUT_MS).toISOString() : null;

      await admin.from('site_pin_attempts').upsert(
        {
          site_id: site.id,
          limiter_key: ipHash,
          failed_attempts: nextFailed,
          locked_until: nextLockedUntil,
          last_attempt_at: nowIso,
        },
        { onConflict: 'site_id,limiter_key' },
      );

      if (isNowLocked) {
        return NextResponse.json(
          {
            error: 'Too many incorrect PIN attempts. Please try again in 15 minutes.',
            retryAfterSeconds: Math.ceil(PIN_LOCKOUT_MS / 1000),
            retryable: true,
          },
          { status: 429 },
        );
      }

      return NextResponse.json(
        { error: 'Incorrect PIN. Please check the 4-digit code and try again.' },
        { status: 401 },
      );
    }

    await admin
      .from('site_pin_attempts')
      .delete()
      .eq('site_id', site.id)
      .eq('limiter_key', ipHash);

    const signedCookieValue = signPinUnlockCookie({ slug, expectedHash });
    if (!signedCookieValue) {
      return NextResponse.json(
        { error: 'PIN unlock is temporarily unavailable.' },
        { status: 503 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(`webzy_unlock_${slug}`, signedCookieValue, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: `/s/${slug}`,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Could not verify PIN right now. Please retry.' },
      { status: 500 },
    );
  }
}
