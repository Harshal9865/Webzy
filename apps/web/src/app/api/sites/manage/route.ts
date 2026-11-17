import { NextResponse, type NextRequest } from 'next/server';
import { logEvent } from '@webzy/core';
import { guardMutationRequest } from '../../../../../../../infra/security/requestGuard';
import { getAuthSessionState } from '../../../../../../../infra/supabase/auth';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

export async function POST(request: NextRequest | Request) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'site_manage',
      maxHits: 20,
      windowSeconds: 60,
    });
    if (guard) return guard;

    const session = await getAuthSessionState();
    if (!session.user) {
      return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      siteId?: string;
      action?: 'hide' | 'unhide';
    };
    const siteId = typeof body.siteId === 'string' ? body.siteId.trim() : '';
    const action = body.action;

    if (!siteId || (action !== 'hide' && action !== 'unhide')) {
      return NextResponse.json({ error: 'Invalid site action.' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: site } = await admin
      .from('sites')
      .select('id, user_id, status, hidden, reveal_at, expires_at, deleted_at')
      .eq('id', siteId)
      .eq('user_id', session.user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (!site) {
      return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
    }

    if (site.status === 'removed' || site.status === 'expired') {
      return NextResponse.json({ error: 'This site cannot be toggled.' }, { status: 409 });
    }

    if (action === 'unhide') {
      const { data: pendingReport } = await admin
        .from('reports')
        .select('id')
        .eq('site_id', site.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (pendingReport) {
        return NextResponse.json(
          { error: 'This page is paused for a pending safety review and cannot be unhidden yet.' },
          { status: 403 },
        );
      }

      const isScheduled = site.reveal_at && Date.parse(site.reveal_at) > Date.now();
      const nextStatus = isScheduled ? 'scheduled' : 'live';
      await admin
        .from('sites')
        .update({ hidden: false, status: nextStatus })
        .eq('id', site.id);

      logEvent('info', 'web.site.sender_unhidden', { siteId: site.id, userId: session.user.id });
      return NextResponse.json({ ok: true, hidden: false, status: nextStatus });
    }

    await admin
      .from('sites')
      .update({ hidden: true, status: 'hidden' })
      .eq('id', site.id);

    logEvent('info', 'web.site.sender_hidden', { siteId: site.id, userId: session.user.id });
    return NextResponse.json({ ok: true, hidden: true, status: 'hidden' });
  } catch (err) {
    logEvent('warn', 'web.site.manage_error', {
      message: err instanceof Error ? err.message.slice(0, 80) : 'unknown',
    });
    return NextResponse.json({ error: 'Could not update site status.' }, { status: 500 });
  }
}
