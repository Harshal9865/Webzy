import { NextResponse, type NextRequest } from 'next/server';
import { reportServerError } from '../../../../../../infra/sentry/monitor';
import { runLifecycleMaintenance } from '../../../../../../infra/supabase/lifecycle';
import { requireVerifiedAdmin } from '../../../lib/requireAdmin';

export async function POST(request: NextRequest) {
  const guard = await requireVerifiedAdmin(request);
  if (!guard.ok) return guard.response;

  try {
    const summary = await runLifecycleMaintenance(guard.admin);
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    reportServerError(err, { route: '/api/lifecycle', app: 'web' });
    return NextResponse.json({ error: 'Lifecycle job failed.' }, { status: 500 });
  }
}
