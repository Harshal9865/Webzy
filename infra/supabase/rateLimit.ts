import crypto from 'node:crypto';
import { logEvent, resolveAppEnvironment } from '@webzy/core';
import { getSupabaseEnv } from './env';
import { createSupabaseAdminClient } from './server';

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const EPHEMERAL_BOOT_SALT = crypto.randomBytes(32).toString('hex');

function getRateLimitSalt(): string {
  const configured =
    process.env.RATE_LIMIT_SALT?.trim() ||
    process.env.MOCK_WEBHOOK_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (configured) {
    return configured;
  }

  if (resolveAppEnvironment() === 'local') {
    return 'webzy-rate-limit-salt';
  }

  return EPHEMERAL_BOOT_SALT;
}

function fallbackRateLimitDecision(params: {
  maxHits: number;
  failClosed?: boolean;
}): RateLimitDecision {
  if (params.failClosed && resolveAppEnvironment() === 'production') {
    return { allowed: false, remaining: 0, retryAfterSeconds: 60 };
  }
  return { allowed: true, remaining: params.maxHits, retryAfterSeconds: 0 };
}

export function hashIpForRateLimit(ip: string): string {
  const salt = getRateLimitSalt();
  return crypto.createHmac('sha256', salt).update(ip || 'unknown').digest('hex').slice(0, 24);
}

export async function consumeRateLimit(params: {
  key: string;
  maxHits: number;
  windowSeconds: number;
  blockSeconds?: number;
  failClosed?: boolean;
}): Promise<RateLimitDecision> {
  if (!getSupabaseEnv().adminConfigured) {
    return fallbackRateLimitDecision(params);
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.rpc('consume_rate_limit', {
      p_key: params.key,
      p_max_hits: params.maxHits,
      p_window_seconds: params.windowSeconds,
      p_block_seconds: params.blockSeconds ?? 0,
    });

    if (error || !Array.isArray(data) || data.length === 0) {
      logEvent('warn', 'infra.rate_limit.degraded', {
        dbCode: error?.code || 'empty',
        failClosed: Boolean(params.failClosed),
      });
      return fallbackRateLimitDecision(params);
    }

    const row = data[0] as {
      allowed: boolean;
      remaining: number;
      retry_after_seconds: number;
    };

    return {
      allowed: Boolean(row.allowed),
      remaining: Number(row.remaining ?? 0),
      retryAfterSeconds: Number(row.retry_after_seconds ?? 0),
    };
  } catch (err) {
    logEvent('warn', 'infra.rate_limit.exception', {
      message: err instanceof Error ? err.message.slice(0, 80) : 'unknown',
      failClosed: Boolean(params.failClosed),
    });
    return fallbackRateLimitDecision(params);
  }
}
