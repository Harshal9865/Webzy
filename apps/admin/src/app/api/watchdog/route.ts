import { NextResponse, type NextRequest } from 'next/server';
import { getWebzyPublicConfig } from '@webzy/core';
import { reportServerError } from '../../../../../../infra/sentry/monitor';
import { runPaymentWatchdog } from '../../../../../../infra/supabase/payments';
import { requireVerifiedAdmin } from '../../../lib/requireAdmin';

export async function POST(request: NextRequest) {
  try {
    const guard = await requireVerifiedAdmin(request);
    if (!guard.ok) return guard.response;

    const cfg = getWebzyPublicConfig();
    const body = (await request.json().catch(() => ({}))) as { includeRecentForTest?: boolean };
    const summary = await runPaymentWatchdog(guard.admin, {
      includeRecentForTest: cfg.appEnv !== 'production' ? Boolean(body.includeRecentForTest) : false,
    });

    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    reportServerError(err, { route: '/api/watchdog', app: 'admin' });
    return NextResponse.json({ error: 'Watchdog execution failed.' }, { status: 500 });
  }
}
