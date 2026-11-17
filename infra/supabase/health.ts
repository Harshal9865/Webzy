import { logEvent, WebzyError } from '@webzy/core';

export interface SupabaseHealthResult {
  status: 'ok' | 'not_configured' | 'error';
  message: string;
  retryable: boolean;
  checkedAt: string;
}

export async function checkSupabaseConnection(
  env: NodeJS.ProcessEnv = process.env,
): Promise<SupabaseHealthResult> {
  const checkedAt = new Date().toISOString();
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    logEvent('info', 'infra.supabase.not_configured', {
      hasUrl: Boolean(url),
      hasAnonKey: Boolean(anonKey),
    });
    return {
      status: 'not_configured',
      message: 'Supabase keys are not set yet in .env.local (expected in Phase 0 local mode).',
      retryable: false,
      checkedAt,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

  try {
    const cleanUrl = url.replace(/\/+$/, '');
    const response = await fetch(`${cleanUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
      },
      signal: controller.signal,
    });

    if (!response.ok && response.status >= 500) {
      throw new WebzyError(`Supabase health endpoint returned HTTP ${response.status}.`, {
        code: 'SUPABASE_HTTP_ERROR',
        statusCode: response.status,
        retryable: true,
      });
    }

    logEvent('info', 'infra.supabase.ok', { statusCode: response.status });
    return {
      status: 'ok',
      message: 'Supabase reachable.',
      retryable: false,
      checkedAt,
    };
  } catch (error) {
    const wrapped =
      error instanceof WebzyError
        ? error
        : new WebzyError('Unable to reach Supabase right now.', {
            code: 'SUPABASE_UNREACHABLE',
            statusCode: 503,
            retryable: true,
          });

    logEvent('warn', 'infra.supabase.error', {
      code: wrapped.code,
      retryable: wrapped.retryable,
    });

    return {
      status: 'error',
      message: wrapped.message,
      retryable: wrapped.retryable,
      checkedAt,
    };
  } finally {
    clearTimeout(timer);
  }
}
