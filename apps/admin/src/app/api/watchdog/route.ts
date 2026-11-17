import { NextResponse, type NextRequest } from 'next/server';
import { getWebzyPublicConfig, logEvent } from '@webzy/core';
import { runPaymentWatchdog } from '../../../../../../infra/supabase/payments';
import { requireVerifiedAdmin } from '../../../lib/requireAdmin';

export async function POST(request: NextRequest) {
  try {
    const guard = await requireVerifiedAdmin();
    if (!guard.ok) return guard.response;

    const cfg = getWebzyPublicConfig();
    const body = (await request.json().catch(() => ({}))) as { includeRecentForTest?: boolean };
    const summary = await runPaymentWatchdog(guard.admin, {
      includeRecentForTest: cfg.appEnv !== 'production' ? Boolean(body.includeRecentForTest) : false,
    });

    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    logEvent('error', 'admin.watchdog.exception', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Watchdog execution failed.' }, { status: 500 });
  }
}
