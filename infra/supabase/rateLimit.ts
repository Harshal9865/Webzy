import crypto from 'node:crypto';
import { logEvent } from '@webzy/core';
import { getSupabaseEnv } from './env';
import { createSupabaseAdminClient } from './server';

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function hashIpForRateLimit(ip: string): string {
  const salt = process.env.MOCK_WEBHOOK_SECRET || 'webzy-rate-limit-salt';
  return crypto.createHmac('sha256', salt).update(ip || 'unknown').digest('hex').slice(0, 24);
}

export async function consumeRateLimit(params: {
  key: string;
  maxHits: number;
  windowSeconds: number;
  blockSeconds?: number;
}): Promise<RateLimitDecision> {
  if (!getSupabaseEnv().adminConfigured) {
    return { allowed: true, remaining: params.maxHits, retryAfterSeconds: 0 };
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
      });
      return { allowed: true, remaining: params.maxHits, retryAfterSeconds: 0 };
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
    });
    return { allowed: true, remaining: params.maxHits, retryAfterSeconds: 0 };
  }
}
