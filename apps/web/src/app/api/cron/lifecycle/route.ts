import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { getWebzyPublicConfig, logEvent } from '@webzy/core';
import { getSupabaseEnv } from '../../../../../../../infra/supabase/env';
import { runLifecycleMaintenance } from '../../../../../../../infra/supabase/lifecycle';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

export async function POST(request: NextRequest) {
  try {
    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
    }

    const cfg = getWebzyPublicConfig();
    const secret = process.env.UPTIME_PING_SECRET?.trim();

    if (cfg.appEnv !== 'local' && !secret) {
      return NextResponse.json({ error: 'Cron secret not configured.' }, { status: 503 });
    }

    if (secret) {
      const authHeader = request.headers.get('authorization') ?? '';
      const expected = `Bearer ${secret}`;
      const authBuf = Buffer.from(authHeader, 'utf8');
      const expectedBuf = Buffer.from(expected, 'utf8');
      if (
        authBuf.length !== expectedBuf.length ||
        !crypto.timingSafeEqual(authBuf, expectedBuf)
      ) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
      }
    }

    const admin = createSupabaseAdminClient();
    const summary = await runLifecycleMaintenance(admin);

    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    logEvent('error', 'web.cron.lifecycle_exception', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Lifecycle maintenance run failed.' }, { status: 500 });
  }
}
