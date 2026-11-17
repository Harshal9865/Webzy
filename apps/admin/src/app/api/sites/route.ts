import { NextResponse, type NextRequest } from 'next/server';
import { logEvent } from '@webzy/core';
import { writeAuditLog } from '../../../../../../infra/supabase/auth';
import { requireVerifiedAdmin } from '../../../lib/requireAdmin';

export async function GET(request: NextRequest) {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const status = searchParams.get('status');

    let query = guard.admin
      .from('sites')
      .select('id, slug, user_id, status, hidden, views_count, reveal_at, expires_at, created_at, content_json, theme_versions(theme_id)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (q) {
      query = query.ilike('slug', `%${q}%`);
    }

    const { data: sites, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, sites: sites || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Server error loading sites.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      siteId?: string;
      action?: 'pause' | 'unpause' | 'extend_30d';
    };

    const siteId = typeof body.siteId === 'string' ? body.siteId.trim() : '';
    if (!siteId || !body.action) {
      return NextResponse.json({ error: 'Missing siteId or action.' }, { status: 400 });
    }

    const { data: site } = await guard.admin
      .from('sites')
      .select('id, slug, status, hidden, expires_at, reveal_at')
      .eq('id', siteId)
      .maybeSingle();

    if (!site) {
      return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
    }

    if (body.action === 'pause') {
      await guard.admin.from('sites').update({ hidden: true, status: 'hidden' }).eq('id', site.id);
    } else if (body.action === 'unpause') {
      const isScheduled = site.reveal_at && Date.parse(site.reveal_at) > Date.now();
      await guard.admin
        .from('sites')
        .update({ hidden: false, status: isScheduled ? 'scheduled' : 'live' })
        .eq('id', site.id);
    } else if (body.action === 'extend_30d') {
      const currentExp = site.expires_at ? Date.parse(site.expires_at) : Date.now();
      const baseMs = Math.max(Date.now(), currentExp);
      const newExpiresAt = new Date(baseMs + 30 * 24 * 60 * 60 * 1000).toISOString();
      await guard.admin
        .from('sites')
        .update({ expires_at: newExpiresAt, status: 'live', hidden: false })
        .eq('id', site.id);
    }

    await writeAuditLog({
      actorId: guard.userId,
      action: `admin.site_${body.action}`,
      entity: 'sites',
      entityId: site.id,
      meta: { slug: site.slug, action: body.action },
    });

    logEvent('info', 'admin.site.action_completed', { siteId: site.id, action: body.action });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error updating site.' }, { status: 500 });
  }
}
