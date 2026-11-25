import { NextResponse } from 'next/server';
import { loadAdminDashboardSnapshot } from '../../../../../../infra/supabase/adminSnapshot';
import { requireVerifiedAdmin } from '../../../lib/requireAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const snapshot = await loadAdminDashboardSnapshot();
    return NextResponse.json(
      { ok: true, ...snapshot },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
    );
  } catch {
    return NextResponse.json({ error: 'Realtime sync failed.' }, { status: 500 });
  }
}
