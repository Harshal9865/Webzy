import { NextResponse } from 'next/server';
import { logEvent } from '@webzy/core';
import {
  buildDefaultCapacityState,
  getCustomOrderCapacity,
} from '../../../../../../infra/supabase/capacity';
import { getSupabaseEnv } from '../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json(
        { ok: true, capacity: buildDefaultCapacityState() },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const admin = createSupabaseAdminClient();
    const capacity = await getCustomOrderCapacity(admin);
    return NextResponse.json(
      { ok: true, capacity },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    logEvent('warn', 'web.capacity.get_failed', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json(
      { ok: true, capacity: buildDefaultCapacityState() },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
