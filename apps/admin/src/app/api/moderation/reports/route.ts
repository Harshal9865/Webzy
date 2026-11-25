import { NextResponse } from 'next/server';
import { logEvent } from '@webzy/core';
import { reportServerError } from '../../../../../../../infra/sentry/monitor';
import { writeAuditLog } from '../../../../../../../infra/supabase/auth';
import { requireVerifiedAdmin } from '../../../../lib/requireAdmin';

export async function POST(request: Request) {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      kind?: 'report' | 'takedown';
      id?: string;
      action?: 'restore' | 'remove' | 'ban_user' | 'hide_site' | 'dismiss';
      note?: string;
    };

    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const note = (body.note || '').trim().slice(0, 200) || 'Admin moderation decision';

    if (!id || !body.kind || !body.action) {
      return NextResponse.json({ error: 'Missing moderation parameters.' }, { status: 400 });
    }

    if (body.kind === 'report') {
      const { data: report } = await guard.admin
        .from('reports')
        .select('id, site_id, reason, status')
        .eq('id', id)
        .maybeSingle();

      if (!report) {
        return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
      }

      const { data: site } = await guard.admin
        .from('sites')
        .select('id, slug, user_id, reveal_at, expires_at')
        .eq('id', report.site_id)
        .maybeSingle();

      if (body.action === 'restore') {
        await guard.admin
          .from('reports')
          .update({ status: 'restored', decided_by: guard.userId })
          .eq('id', report.id);

        if (site) {
          const isScheduled = site.reveal_at && Date.parse(site.reveal_at) > Date.now();
          await guard.admin
            .from('sites')
            .update({ hidden: false, status: isScheduled ? 'scheduled' : 'live' })
            .eq('id', site.id);
        }

        await guard.admin.from('moderation_log').insert({
          who: guard.userId,
          what: 'report_restored_site',
          why: `${note} (report ${report.id})`,
        });
        await writeAuditLog({
          actorId: guard.userId,
          action: 'admin_restore_reported_site',
          entity: 'reports',
          entityId: report.id,
          meta: { siteId: report.site_id, note },
        });
        return NextResponse.json({ ok: true, message: 'Page restored to live.' });
      }

      if (body.action === 'remove' || body.action === 'ban_user') {
        await guard.admin
          .from('reports')
          .update({ status: 'removed', decided_by: guard.userId })
          .eq('id', report.id);

        if (site) {
          if (body.action === 'ban_user') {
            if (site.user_id === guard.userId) {
              return NextResponse.json({ error: 'Cannot ban your own admin account.' }, { status: 403 });
            }
            const { data: targetOwner } = await guard.admin
              .from('profiles')
              .select('role')
              .eq('id', site.user_id)
              .maybeSingle();
            if (targetOwner?.role === 'admin') {
              return NextResponse.json({ error: 'Cannot ban an admin account.' }, { status: 403 });
            }

            const { error: banErr } = await guard.admin
              .from('profiles')
              .update({ is_banned: true })
              .eq('id', site.user_id);
            if (banErr) {
              reportServerError(banErr, {
                route: '/api/moderation/reports',
                app: 'admin',
                action: 'ban_user',
              });
              return NextResponse.json(
                { error: 'Unable to ban user account right now.' },
                { status: 500 },
              );
            }

            await guard.admin
              .from('sites')
              .update({ hidden: true, status: 'removed' })
              .eq('user_id', site.user_id);
          } else {
            await guard.admin
              .from('sites')
              .update({ hidden: true, status: 'removed' })
              .eq('id', site.id);
          }
        }

        await guard.admin.from('moderation_log').insert({
          who: guard.userId,
          what: body.action === 'ban_user' ? 'report_banned_user_and_removed' : 'report_removed_site',
          why: `${note} (report ${report.id})`,
        });
        await writeAuditLog({
          actorId: guard.userId,
          action: body.action === 'ban_user' ? 'admin_ban_sender' : 'admin_remove_reported_site',
          entity: 'reports',
          entityId: report.id,
          meta: { siteId: report.site_id, userId: site?.user_id, note },
        });
        return NextResponse.json({
          ok: true,
          message:
            body.action === 'ban_user'
              ? 'Sender banned and all their pages removed.'
              : 'Page permanently removed.',
        });
      }
    }

    if (body.kind === 'takedown') {
      const { data: td } = await guard.admin
        .from('takedown_requests')
        .select('id, site_id, site_slug, category')
        .eq('id', id)
        .maybeSingle();

      if (!td) {
        return NextResponse.json({ error: 'Takedown request not found.' }, { status: 404 });
      }

      const nextStatus =
        body.action === 'dismiss' || body.action === 'restore'
          ? 'dismissed'
          : body.action === 'remove'
            ? 'removed_site'
            : 'hidden_site';

      const { error: tdUpdateErr } = await guard.admin
        .from('takedown_requests')
        .update({
          status: nextStatus,
          decided_by: guard.userId,
          resolution_note: note,
        })
        .eq('id', td.id);

      if (tdUpdateErr) {
        reportServerError(tdUpdateErr, {
          route: '/api/moderation/reports',
          app: 'admin',
          action: 'takedown_update',
        });
        return NextResponse.json(
          { error: 'Unable to update takedown request right now.' },
          { status: 500 },
        );
      }

      if (td.site_id) {
        if (nextStatus === 'removed_site') {
          await guard.admin
            .from('sites')
            .update({ hidden: true, status: 'removed' })
            .eq('id', td.site_id);
        } else if (nextStatus === 'hidden_site') {
          await guard.admin
            .from('sites')
            .update({ hidden: true, status: 'hidden' })
            .eq('id', td.site_id);
        } else if (body.action === 'restore') {
          await guard.admin
            .from('sites')
            .update({ hidden: false, status: 'live' })
            .eq('id', td.site_id);
        }
      }

      await guard.admin.from('moderation_log').insert({
        who: guard.userId,
        what: `takedown_${nextStatus}`,
        why: `${note} (takedown ${td.id})`,
      });
      await writeAuditLog({
        actorId: guard.userId,
        action: `admin_takedown_${nextStatus}`,
        entity: 'takedown_requests',
        entityId: td.id,
        meta: { siteId: td.site_id, slug: td.site_slug, note },
      });

      return NextResponse.json({ ok: true, message: `Takedown marked ${nextStatus}.` });
    }

    return NextResponse.json({ error: 'Unsupported moderation action.' }, { status: 400 });
  } catch (err) {
    reportServerError(err, { route: '/api/moderation/reports', app: 'admin' });
    logEvent('error', 'admin.moderation_error', {
      message: err instanceof Error ? err.message.slice(0, 80) : 'unknown',
    });
    return NextResponse.json({ error: 'Moderation update failed.' }, { status: 500 });
  }
}
