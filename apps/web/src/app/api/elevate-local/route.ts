import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { getWebzyPublicConfig, logEvent } from '@webzy/core';
import { getAuthSessionState, writeAuditLog } from '../../../../../../infra/supabase/auth';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';

export async function POST(request: NextRequest) {
  const config = getWebzyPublicConfig();
  if (process.env.NODE_ENV !== 'development' || config.appEnv !== 'local') {
    return NextResponse.json(
      { error: 'Local dev admin elevation is strictly disabled outside local environment.' },
      { status: 403 },
    );
  }

  const hostHeader = (request.headers.get('host') ?? '').trim().toLowerCase();
  if (!/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(hostHeader)) {
    return NextResponse.json(
      { error: 'Local dev admin elevation is only allowed from a loopback host.' },
      { status: 403 },
    );
  }

  const elevateSecret = process.env.ADMIN_LOCAL_ELEVATE_SECRET?.trim();
  if (elevateSecret) {
    const providedSecret = request.headers.get('x-local-elevate-secret') ?? '';
    const providedBuf = Buffer.from(providedSecret, 'utf8');
    const expectedBuf = Buffer.from(elevateSecret, 'utf8');
    if (
      providedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(providedBuf, expectedBuf)
    ) {
      return NextResponse.json({ error: 'Invalid local elevation secret.' }, { status: 403 });
    }
  }

  const session = await getAuthSessionState();
  if (!session.configured || !session.user) {
    return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from('profiles').upsert(
      {
        id: session.user.id,
        email: session.user.email || '',
        full_name:
          session.profile?.full_name ||
          (typeof session.user.user_metadata?.full_name === 'string'
            ? session.user.user_metadata.full_name
            : 'Founder Admin'),
        role: 'admin',
        is_banned: false,
      },
      { onConflict: 'id' },
    );

    if (error) {
      logEvent('error', 'web.elevate_local.upsert_failed', {
        code: error.code || 'unknown',
        message: error.message.slice(0, 120),
      });
      return NextResponse.json({ error: 'Could not grant local admin access.' }, { status: 500 });
    }

    await writeAuditLog({
      actorId: session.user.id,
      action: 'local_dev_admin_elevated',
      entity: 'profiles',
      entityId: session.user.id,
      meta: { email: session.user.email || null },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logEvent('error', 'web.elevate_local.exception', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Could not grant local admin access.' }, { status: 500 });
  }
}
