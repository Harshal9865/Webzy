import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { getWebzyPublicConfig, logEvent } from '@webzy/core';
import { getSupabaseEnv } from '../../../../../../../infra/supabase/env';
import { runLifecycleMaintenance } from '../../../../../../../infra/supabase/lifecycle';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorizedCronRequest(request: NextRequest, appEnv: string): { ok: boolean; status?: number; error?: string } {
  const secrets = [process.env.CRON_SECRET?.trim(), process.env.UPTIME_PING_SECRET?.trim()].filter(
    (s): s is string => Boolean(s),
  );

  if (appEnv !== 'local' && secrets.length === 0) {
    return { ok: false, status: 503, error: 'Cron secret not configured.' };
  }

  if (secrets.length === 0) {
    return { ok: true };
  }

  const authHeader = request.headers.get('authorization') ?? '';
  const authBuf = Buffer.from(authHeader, 'utf8');

  for (const secret of secrets) {
    const expectedBuf = Buffer.from(`Bearer ${secret}`, 'utf8');
    if (authBuf.length === expectedBuf.length && crypto.timingSafeEqual(authBuf, expectedBuf)) {
      return { ok: true };
    }
  }

  return { ok: false, status: 401, error: 'Unauthorized.' };
}

async function handleLifecycle(request: NextRequest) {
  try {
    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
    }

    const cfg = getWebzyPublicConfig();
    const auth = isAuthorizedCronRequest(request, cfg.appEnv);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status ?? 401 });
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

// Vercel Cron sends GET requests with Authorization: Bearer <CRON_SECRET>
export async function GET(request: NextRequest) {
  return handleLifecycle(request);
}

// GitHub Actions / manual triggers send POST requests
export async function POST(request: NextRequest) {
  return handleLifecycle(request);
}
