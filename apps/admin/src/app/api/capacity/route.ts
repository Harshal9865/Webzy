import { NextResponse, type NextRequest } from 'next/server';
import { logEvent } from '@webzy/core';
import { writeAuditLog } from '../../../../../../infra/supabase/auth';
import {
  getCustomOrderCapacity,
  updateCustomOrderCapacity,
  validateCapacityPatchPayload,
} from '../../../../../../infra/supabase/capacity';
import { requireVerifiedAdmin } from '../../../lib/requireAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const capacity = await getCustomOrderCapacity(guard.admin);
    return NextResponse.json(
      { ok: true, capacity },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    logEvent('error', 'admin.capacity.get_failed', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Failed to load capacity settings.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireVerifiedAdmin(request);
  if (!guard.ok) return guard.response;

  try {
    const raw = await request.json().catch(() => null);
    const validated = validateCapacityPatchPayload(raw);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const capacity = await updateCustomOrderCapacity(
      guard.admin,
      validated.patch,
      guard.userId,
    );

    await writeAuditLog({
      actorId: guard.userId,
      action: 'admin.capacity_updated',
      entity: 'platform_settings',
      entityId: 'global',
      meta: {
        weddingPaused: capacity.wedding.paused,
        weddingLimit: capacity.wedding.limit,
        studioPaused: capacity.studio.paused,
        studioLimit: capacity.studio.limit,
      },
    });

    logEvent('info', 'admin.capacity.updated', {
      weddingPaused: capacity.wedding.paused,
      weddingLimit: capacity.wedding.limit,
      studioPaused: capacity.studio.paused,
      studioLimit: capacity.studio.limit,
    });

    return NextResponse.json({ ok: true, capacity });
  } catch (err) {
    logEvent('error', 'admin.capacity.patch_failed', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Failed to update capacity settings.' }, { status: 500 });
  }
}
