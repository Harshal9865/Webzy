import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { logEvent } from '@webzy/core';
import { consumeRateLimit, hashIpForRateLimit } from '../supabase/rateLimit';
import { verifySameOriginRequest } from './origin';

export { verifySameOriginRequest };

function normalizeIpCandidate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const firstHop = raw.split(',')[0]?.trim();
  if (!firstHop) return null;
  const cleaned = firstHop.replace(/[\r\n\t\s]/g, '').slice(0, 64);
  return cleaned || null;
}

export function extractClientIp(request: Request | NextRequest): string {
  return (
    normalizeIpCandidate(request.headers.get('cf-connecting-ip')) ||
    normalizeIpCandidate(request.headers.get('x-vercel-forwarded-for')) ||
    normalizeIpCandidate(request.headers.get('x-real-ip')) ||
    normalizeIpCandidate(request.headers.get('x-forwarded-for')) ||
    '127.0.0.1'
  );
}

function resolvePinCookieSecret(expectedHash: string): string | null {
  const serverSecret =
    process.env.PIN_COOKIE_SECRET?.trim() ||
    process.env.MOCK_WEBHOOK_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (serverSecret) return serverSecret;
  if (process.env.NEXT_PUBLIC_APP_ENV === 'production' || process.env.NODE_ENV === 'production') {
    return null;
  }
  return expectedHash || null;
}

/**
 * Signs an HttpOnly PIN-unlock cookie bound to the site slug, PIN hash prefix, and expiry timestamp.
 */
export function signPinUnlockCookie(params: {
  slug: string;
  expectedHash: string;
  ttlSeconds?: number;
  nowMs?: number;
}): string | null {
  const { slug, expectedHash, ttlSeconds = 60 * 60 * 24 * 7, nowMs = Date.now() } = params;
  if (!slug || !expectedHash) return null;
  const secret = resolvePinCookieSecret(expectedHash);
  if (!secret) return null;

  const expMs = nowMs + ttlSeconds * 1000;
  const payload = `${expMs}:${slug}:${expectedHash.slice(0, 16)}`;
  const hmacHex = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${expMs}.${hmacHex}`;
}

/**
 * Verifies an HMAC-SHA256 signed PIN-unlock cookie using constant-time signature comparison.
 */
export function verifyPinUnlockCookie(params: {
  token: string | undefined | null;
  slug: string;
  expectedHash: string;
  nowMs?: number;
}): boolean {
  const { token, slug, expectedHash, nowMs = Date.now() } = params;
  if (!token || typeof token !== 'string' || !slug || !expectedHash) return false;

  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0 || dotIdx !== token.lastIndexOf('.')) return false;

  const expStr = token.slice(0, dotIdx);
  const sigHex = token.slice(dotIdx + 1);
  if (!/^\d{10,16}$/.test(expStr) || !/^[a-f0-9]{64}$/i.test(sigHex)) {
    return false;
  }

  const expMs = Number(expStr);
  if (!Number.isFinite(expMs) || expMs <= nowMs) {
    return false;
  }

  const secret = resolvePinCookieSecret(expectedHash);
  if (!secret) return false;

  const payload = `${expStr}:${slug}:${expectedHash.slice(0, 16)}`;
  const expectedHex = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  const providedBuf = Buffer.from(sigHex.toLowerCase(), 'hex');
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  if (providedBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * Shared silent guard combining Same-Origin CSRF verification + IP-hashed persistent rate limiting.
 */
export async function guardMutationRequest(
  request: Request | NextRequest,
  options: {
    bucket: string;
    maxHits: number;
    windowSeconds: number;
    blockSeconds?: number;
    skipOriginCheck?: boolean;
  },
): Promise<NextResponse | null> {
  if (!options.skipOriginCheck && !verifySameOriginRequest(request)) {
    logEvent('warn', 'security.origin_rejected', { bucket: options.bucket });
    return NextResponse.json(
      { error: 'Request could not be verified. Please reload and try again.' },
      { status: 403 },
    );
  }

  const ipHash = hashIpForRateLimit(extractClientIp(request));
  const rl = await consumeRateLimit({
    key: `${options.bucket}:${ipHash}`,
    maxHits: options.maxHits,
    windowSeconds: options.windowSeconds,
    blockSeconds: options.blockSeconds,
  });

  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests from your connection. Please wait a moment and try again.',
        retryAfterSeconds: rl.retryAfterSeconds,
        retryable: true,
      },
      { status: 429 },
    );
  }

  return null;
}

/**
 * Optional silent Cloudflare Turnstile verification when TURNSTILE_SECRET_KEY is configured.
 * If no Turnstile keys are configured yet (local / pre-Turnstile), cleanly returns true.
 */
export async function verifyTurnstileIfConfigured(
  request: Request,
  token: string | undefined,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return true;
  if (!token || token.trim().length < 10) return false;

  try {
    const form = new URLSearchParams();
    form.set('secret', secret);
    form.set('response', token.trim());
    form.set('remoteip', extractClientIp(request));

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}
