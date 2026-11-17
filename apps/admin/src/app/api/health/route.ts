import { NextResponse } from 'next/server';
import { getWebzyPublicConfig, logEvent } from '@webzy/core';
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

    logEvent('info', 'admin.api.health.checked', {
      appEnv: config.appEnv,
      supabaseStatus: supabase.status,
      payButtonDisabled: config.payButtonDisabled,
    });

    return NextResponse.json(
      {
        status,
        service: 'webzy-admin',
        appEnv: config.appEnv,
        paymentProvider: config.paymentProvider,
        payButtonDisabled: config.payButtonDisabled,
        supabase,
        sentry,
        checkedAt: new Date().toISOString(),
      },
      { status: status === 'ok' ? 200 : 503 },
    );
  } catch (error) {
    reportServerError(error, { route: '/api/health', app: 'admin' });
    return NextResponse.json(
      {
        status: 'error',
        service: 'webzy-admin',
        message: 'Admin health check failed. Please retry.',
        retryable: true,
      },
      { status: 500 },
    );
  }
}
