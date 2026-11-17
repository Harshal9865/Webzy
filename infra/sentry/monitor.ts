import { logEvent } from '@webzy/core';

export interface SentryStatus {
  configured: boolean;
}

export function getSentryStatus(env: NodeJS.ProcessEnv = process.env): SentryStatus {
  return {
    configured: Boolean(env.SENTRY_DSN?.trim()),
  };
}

export function reportServerError(
  error: unknown,
  context: Record<string, string | number | boolean | null | undefined> = {},
): void {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const name = error instanceof Error ? error.name : 'UnknownError';
  logEvent('error', 'monitor.server_error', {
    errorName: name,
    errorMessage: message.slice(0, 200),
    sentryConfigured: Boolean(process.env.SENTRY_DSN?.trim()),
    ...context,
  });
}
