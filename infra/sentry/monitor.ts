import { logEvent, type LogMetaValue } from '@webzy/core';

export interface SentryStatus {
  configured: boolean;
}

export interface ParsedSentryDsn {
  endpointUrl: string;
  publicKey: string;
  projectId: string;
}

const SENSITIVE_KEY_RE =
  /(email|phone|mobile|token|secret|password|authorization|cookie|pin|ip|full_?name|buyer_?name)/i;
const EMAIL_VALUE_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_VALUE_RE = /(?:\+91[\s-]?)?[6-9]\d{9}\b/g;
const BEARER_VALUE_RE = /Bearer\s+[A-Za-z0-9._-]+/gi;
const QUERY_SECRET_RE =
  /([?&](?:token|secret|password|pin|auth|key|code|apikey|access_token|refresh_token)=)[^&\s]+/gi;
const KV_SECRET_RE =
  /((?:secret|password|token|pin|authorization|cookie|api[_-]?key)\s*[:=]\s*)['"]?[^\s,'";]+['"]?/gi;

function scrubPiiText(input: string): string {
  return input
    .replace(EMAIL_VALUE_RE, '[redacted-email]')
    .replace(PHONE_VALUE_RE, '[redacted-phone]')
    .replace(BEARER_VALUE_RE, 'Bearer [redacted]')
    .replace(QUERY_SECRET_RE, '$1[redacted]')
    .replace(KV_SECRET_RE, '$1[redacted]');
}

function sanitizeContext(
  context: Record<string, LogMetaValue>,
): Record<string, LogMetaValue> {
  const safe: Record<string, LogMetaValue> = {};
  for (const [key, value] of Object.entries(context)) {
    if (SENSITIVE_KEY_RE.test(key)) {
      safe[key] = value ? '[redacted]' : value;
      continue;
    }
    safe[key] = typeof value === 'string' ? scrubPiiText(value).slice(0, 240) : value;
  }
  return safe;
}

function extractErrorDetails(error: unknown): {
  name: string;
  message: string;
  stack: string;
} {
  if (error instanceof Error) {
    return {
      name: error.name || 'Error',
      message: error.message || 'Unknown error',
      stack: typeof error.stack === 'string' ? error.stack : '',
    };
  }
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    const message = typeof obj.message === 'string' ? obj.message : 'Unknown error';
    const code = typeof obj.code === 'string' ? obj.code : '';
    const name =
      typeof obj.name === 'string'
        ? obj.name
        : code
          ? `DbError(${code})`
          : 'ObjectError';
    return { name, message, stack: '' };
  }
  if (typeof error === 'string') {
    return { name: 'Error', message: error, stack: '' };
  }
  return { name: 'UnknownError', message: 'Unknown error', stack: '' };
}

function createEventId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID().replace(/-/g, '');
  }
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

export function parseSentryDsn(rawDsn?: string): ParsedSentryDsn | null {
  const trimmed = rawDsn?.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null;
    }

    const publicKey = parsed.username.trim();
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const projectId = pathParts.pop() || '';
    if (
      !publicKey ||
      !parsed.host ||
      !projectId ||
      !/^[A-Za-z0-9_-]+$/.test(publicKey) ||
      !/^[A-Za-z0-9_-]+$/.test(projectId)
    ) {
      return null;
    }

    const basePath = pathParts.length > 0 ? `/${pathParts.join('/')}` : '';
    return {
      endpointUrl: `${parsed.protocol}//${parsed.host}${basePath}/api/${projectId}/store/`,
      publicKey,
      projectId,
    };
  } catch {
    return null;
  }
}

export function getSentryStatus(env: NodeJS.ProcessEnv = process.env): SentryStatus {
  return {
    configured: Boolean(parseSentryDsn(env.SENTRY_DSN)),
  };
}

export function reportServerError(
  error: unknown,
  context: Record<string, LogMetaValue> = {},
): void {
  const raw = extractErrorDetails(error);
  const safeName = scrubPiiText(raw.name).slice(0, 80) || 'Error';
  const safeMessage = scrubPiiText(raw.message).slice(0, 240) || 'Unknown error';
  const stackSummary = raw.stack
    ? scrubPiiText(
        raw.stack
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, 8)
          .join('\n'),
      ).slice(0, 1200)
    : '';
  const safeContext = sanitizeContext(context);
  const dsn = parseSentryDsn(process.env.SENTRY_DSN);

  logEvent('error', 'monitor.server_error', {
    errorName: safeName,
    errorMessage: safeMessage.slice(0, 200),
    sentryConfigured: Boolean(dsn),
    ...safeContext,
  });

  if (!dsn || typeof fetch !== 'function') {
    return;
  }

  const sentryTags: Record<string, string> = {};
  for (const tagKey of ['app', 'route', 'source', 'action', 'digest'] as const) {
    const val = safeContext[tagKey];
    if (typeof val === 'string' && val) {
      sentryTags[tagKey] = val.slice(0, 120);
    }
  }

  const payload = {
    event_id: createEventId(),
    timestamp: new Date().toISOString(),
    platform: 'node',
    level: 'error',
    logger: 'webzy.monitor',
    server_name: 'webzy',
    environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development',
    message: {
      formatted: `${safeName}: ${safeMessage}`,
    },
    exception: {
      values: [
        {
          type: safeName,
          value: safeMessage,
        },
      ],
    },
    tags: sentryTags,
    extra: {
      ...safeContext,
      ...(stackSummary ? { stackSummary } : {}),
    },
  };

  const authHeader = [
    'Sentry sentry_version=7',
    'sentry_client=webzy-monitor/1.0',
    `sentry_timestamp=${Math.floor(Date.now() / 1000)}`,
    `sentry_key=${dsn.publicKey}`,
  ].join(', ');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);
  if (
    typeof timeoutId === 'object' &&
    timeoutId !== null &&
    'unref' in timeoutId &&
    typeof timeoutId.unref === 'function'
  ) {
    timeoutId.unref();
  }

  void fetch(dsn.endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Sentry-Auth': authHeader,
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
    .catch(() => {})
    .finally(() => {
      clearTimeout(timeoutId);
    });
}
