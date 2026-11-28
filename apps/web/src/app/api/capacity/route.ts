import { NextResponse } from 'next/server';
import { logEvent } from '@webzy/core';
import {
  buildDefaultCapacityState,
  getCustomOrderCapacity,
} from '../../../../../../infra/supabase/capacity';
import { getSupabaseEnv } from '../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';

export const dynamic = 'force-dynamic';

const EDGE_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
};

export async function GET() {
  try {
    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json(
        { ok: true, capacity: buildDefaultCapacityState() },
        { headers: EDGE_CACHE_HEADERS },
      );
    }

    const admin = createSupabaseAdminClient();
    const capacity = await getCustomOrderCapacity(admin);
    return NextResponse.json(
      { ok: true, capacity },
      { headers: EDGE_CACHE_HEADERS },
    );
  } catch (err) {
    logEvent('warn', 'web.capacity.get_failed', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json(
      { ok: true, capacity: buildDefaultCapacityState() },
      { headers: EDGE_CACHE_HEADERS },
    );
  }
}
