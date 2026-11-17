/**
 * Structured PII-Safe Logger & Retryable Error Class (Section 0 & Section 19)
 * Automatically masks email addresses, 10-digit Indian phone numbers, and secret keys.
 */

const SENSITIVE_KEY_RE = /(email|phone|mobile|token|secret|password|authorization|cookie|pin|ip)/i;
const EMAIL_VALUE_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_VALUE_RE = /(?:\+91[\s-]?)?[6-9]\d{9}\b/g;

export type LogMetaValue = string | number | boolean | null | undefined;

function scrubString(input: string): string {
  return input
    .replace(EMAIL_VALUE_RE, '[redacted-email]')
    .replace(PHONE_VALUE_RE, '[redacted-phone]');
}

function sanitizeMeta(
  meta: Record<string, LogMetaValue>,
): Record<string, LogMetaValue> {
  const safe: Record<string, LogMetaValue> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEY_RE.test(key)) {
      safe[key] = value ? '[redacted]' : value;
      continue;
    }
    safe[key] = typeof value === 'string' ? scrubString(value).slice(0, 240) : value;
  }
  return safe;
}

export class WebzyError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly retryable: boolean;

  constructor(
    message: string,
    options: { code: string; statusCode?: number; retryable?: boolean },
  ) {
    super(message);
    this.name = 'WebzyError';
    this.code = options.code;
    this.statusCode = options.statusCode ?? 500;
    this.retryable = options.retryable ?? true;
  }
}

export function logEvent(
  level: 'info' | 'warn' | 'error',
  event: string,
  meta: Record<string, LogMetaValue> = {},
): void {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    ...sanitizeMeta(meta),
  };
  const line = JSON.stringify(payload);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.info(line);
  }
}
