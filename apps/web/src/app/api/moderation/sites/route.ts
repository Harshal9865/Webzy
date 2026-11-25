import { NextResponse } from 'next/server';
import { logEvent } from '@webzy/core';
import { reportServerError } from '../../../../../../../infra/sentry/monitor';
import { writeAuditLog } from '../../../../../../../infra/supabase/auth';
import { requireVerifiedAdmin } from '../../../../lib/requireAdmin';

function normalizeSlug(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/\/s\/([A-Za-z0-9_-]{6,64})/);
  if (match?.[1]) return match[1];
  return trimmed;
}

export async function POST(request: Request) {
  const guard = await requireVerifiedAdmin(request);
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      slug?: string;
      action?: 'lookup' | 'pause' | 'restore' | 'remove' | 'ban_owner';
      reason?: string;
    };

    const slug = normalizeSlug(body.slug || '');
    if (!slug || !/^[A-Za-z0-9_-]{6,64}$/.test(slug)) {
      return NextResponse.json({ error: 'Enter a valid slug or /s/<slug> URL.' }, { status: 400 });
    }

    const { data: site } = await guard.admin
      .from('sites')
      .select(
        'id, slug, user_id, status, hidden, reveal_at, expires_at, views_count, content_json, created_at',
      )
      .eq('slug', slug)
      .is('deleted_at', null)
      .maybeSingle();

    if (!site) {
      return NextResponse.json({ error: `No page found for /s/${slug}.` }, { status: 404 });
    }

    const { data: owner } = await guard.admin
      .from('profiles')
      .select('id, email, full_name, role, is_banned')
      .eq('id', site.user_id)
      .maybeSingle();

    if (body.action === 'lookup' || !body.action) {
      return NextResponse.json({ ok: true, site, owner });
    }

    const reason = (body.reason || '').trim().slice(0, 200) || `Admin ${body.action} on /s/${slug}`;

    if (body.action === 'pause') {
      const { error } = await guard.admin
        .from('sites')
        .update({ hidden: true, status: 'hidden' })
        .eq('id', site.id);
      if (error) {
        reportServerError(error, { route: '/api/moderation/sites', app: 'web', action: 'pause' });
        return NextResponse.json({ error: 'Unable to pause site right now.' }, { status: 500 });
      }
    } else if (body.action === 'restore') {
      const isScheduled = site.reveal_at && Date.parse(site.reveal_at) > Date.now();
      const { error } = await guard.admin
        .from('sites')
        .update({ hidden: false, status: isScheduled ? 'scheduled' : 'live' })
        .eq('id', site.id);
      if (error) {
        reportServerError(error, { route: '/api/moderation/sites', app: 'web', action: 'restore' });
        return NextResponse.json({ error: 'Unable to restore site right now.' }, { status: 500 });
      }
    } else if (body.action === 'remove') {
      const { error } = await guard.admin
        .from('sites')
        .update({ hidden: true, status: 'removed' })
        .eq('id', site.id);
      if (error) {
        reportServerError(error, { route: '/api/moderation/sites', app: 'web', action: 'remove' });
        return NextResponse.json({ error: 'Unable to remove site right now.' }, { status: 500 });
      }
    } else if (body.action === 'ban_owner') {
      if (site.user_id === guard.userId || owner?.role === 'admin') {
        return NextResponse.json(
          { error: 'Admin / Founder accounts cannot be banned.' },
          { status: 403 },
        );
      }
      const { error: banErr } = await guard.admin
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', site.user_id);
      if (banErr) {
        reportServerError(banErr, {
          route: '/api/moderation/sites',
          app: 'web',
          action: 'ban_owner',
        });
        return NextResponse.json(
          { error: 'Unable to ban site owner right now.' },
          { status: 500 },
        );
      }
      await guard.admin
        .from('sites')
        .update({ hidden: true, status: 'removed' })
        .eq('user_id', site.user_id);
    }

    await guard.admin.from('moderation_log').insert({
      who: guard.userId,
      what: `direct_site_${body.action}`,
      why: reason,
    });
    await writeAuditLog({
      actorId: guard.userId,
      action: `admin_site_${body.action}`,
      entity: 'sites',
      entityId: site.id,
      meta: { slug, reason },
    });

    const { data: refreshed } = await guard.admin
      .from('sites')
      .select(
        'id, slug, user_id, status, hidden, reveal_at, expires_at, views_count, content_json, created_at',
      )
      .eq('id', site.id)
      .single();

    return NextResponse.json({
      ok: true,
      site: refreshed,
      owner,
      message: `Site /s/${slug} updated (${body.action}).`,
    });
  } catch (err) {
    reportServerError(err, { route: '/api/moderation/sites', app: 'web' });
    logEvent('error', 'admin.site_lookup_error', {
      message: err instanceof Error ? err.message.slice(0, 80) : 'unknown',
    });
    return NextResponse.json({ error: 'Site moderation request failed.' }, { status: 500 });
  }
}
