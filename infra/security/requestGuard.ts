import { NextResponse, type NextRequest } from 'next/server';
import { getWebzyPublicConfig, logEvent } from '@webzy/core';
import { consumeRateLimit, hashIpForRateLimit } from '../supabase/rateLimit';

function extractHostname(rawUrlOrHost: string | null | undefined): string | null {
  if (!rawUrlOrHost) return null;
  const trimmed = rawUrlOrHost.trim();
  if (!trimmed) return null;
  try {
    if (trimmed.includes('://')) {
      return new URL(trimmed).host.toLowerCase();
    }
    return trimmed.split(',')[0].trim().toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Silent CSRF / Same-Origin protection for browser-triggered API mutations.
 * Compares Origin (or Referer fallback) against Host / X-Forwarded-Host and
 * configured Web/Admin origins.
 */
export function verifySameOriginRequest(request: Request): boolean {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true;
  }

  const originHeader = request.headers.get('origin');
  const refererHeader = request.headers.get('referer');
  const sourceHost = extractHostname(originHeader) || extractHostname(refererHeader);

  // If browser sent neither Origin nor Referer in strict non-browser calls, allow only in local/non-browser cron flows (which enforce Bearer secrets separately)
  if (!sourceHost) {
    return process.env.NEXT_PUBLIC_APP_ENV !== 'production';
  }

  const cfg = getWebzyPublicConfig();
  const allowedHosts = new Set<string>();
  const requestHost =
    extractHostname(request.headers.get('x-forwarded-host')) ||
    extractHostname(request.headers.get('host'));
  if (requestHost) allowedHosts.add(requestHost);

  const webHost = extractHostname(cfg.webUrl);
  const adminHost = extractHostname(cfg.adminUrl);
  if (webHost) allowedHosts.add(webHost);
  if (adminHost) allowedHosts.add(adminHost);

  return allowedHosts.has(sourceHost);
}

export function extractClientIp(request: Request | NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    '127.0.0.1'
  );
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
