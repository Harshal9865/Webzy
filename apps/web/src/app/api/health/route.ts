import { NextResponse } from 'next/server';
import { getWebzyPublicConfig, logEvent } from '@webzy/core';
import { getThemesRegistrySummary } from '@webzy/themes';
import { describePendingJobPipelines } from '@webzy/jobs';
import { checkSupabaseConnection } from '../../../../../../infra/supabase/health';
import { getSentryStatus, reportServerError } from '../../../../../../infra/sentry/monitor';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getWebzyPublicConfig();
    const [supabase, sentry] = await Promise.all([
      checkSupabaseConnection(),
      Promise.resolve(getSentryStatus()),
    ]);

    const status = supabase.status === 'error' ? 'degraded' : 'ok';

    logEvent('info', 'web.api.health.checked', {
      appEnv: config.appEnv,
      supabaseStatus: supabase.status,
      paymentProvider: config.paymentProvider,
    });

    return NextResponse.json(
      {
        status,
        service: 'webzy-web',
        appEnv: config.appEnv,
        paymentProvider: config.paymentProvider,
        payButtonDisabled: config.payButtonDisabled,
        supabase,
        sentry,
        themes: getThemesRegistrySummary(),
        jobs: describePendingJobPipelines(),
        checkedAt: new Date().toISOString(),
      },
      { status: status === 'ok' ? 200 : 503 },
    );
  } catch (error) {
    reportServerError(error, { route: '/api/health', app: 'web' });
    return NextResponse.json(
      {
        status: 'error',
        service: 'webzy-web',
        message: 'Health check failed. Please retry in a few seconds.',
        retryable: true,
      },
      { status: 500 },
    );
  }
}
