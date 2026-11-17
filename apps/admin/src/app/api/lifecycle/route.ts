import { NextResponse } from 'next/server';
import { logEvent } from '@webzy/core';
import { runLifecycleMaintenance } from '../../../../../../infra/supabase/lifecycle';
import { requireVerifiedAdmin } from '../../../lib/requireAdmin';

export async function POST() {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const summary = await runLifecycleMaintenance(guard.admin);
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    logEvent('error', 'admin.lifecycle_error', {
      message: err instanceof Error ? err.message.slice(0, 80) : 'unknown',
    });
    return NextResponse.json({ error: 'Lifecycle job failed.' }, { status: 500 });
  }
}
