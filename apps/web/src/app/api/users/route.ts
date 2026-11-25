import { NextResponse, type NextRequest } from 'next/server';
import { logEvent } from '@webzy/core';
import { writeAuditLog } from '../../../../../../infra/supabase/auth';
import { requireVerifiedAdmin } from '../../../lib/requireAdmin';

function escapeIlikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

function parsePagination(searchParams: URLSearchParams): { limit: number; offset: number } {
  const limitParam = searchParams.get('limit');
  const parsedLimit = limitParam !== null && limitParam.trim() !== '' ? Number(limitParam) : NaN;
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(100, Math.max(1, Math.trunc(parsedLimit)))
    : 50;

  const offsetParam = searchParams.get('offset');
  const parsedOffset = offsetParam !== null && offsetParam.trim() !== '' ? Number(offsetParam) : NaN;
  const offset = Number.isFinite(parsedOffset) ? Math.max(0, Math.trunc(parsedOffset)) : 0;

  return { limit, offset };
}

export async function GET(request: NextRequest) {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const rawQ = (searchParams.get('q') || '').trim().toLowerCase();
    const q = rawQ.replace(/[^a-z0-9@._+\-\s]/gi, '').slice(0, 80);
    const { limit, offset } = parsePagination(searchParams);

    let query = guard.admin
      .from('profiles')
      .select('id, email, full_name, phone, role, is_banned, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) {
      const escapedQ = escapeIlikePattern(q);
      query = query.or(
        `email.ilike.%${escapedQ}%,full_name.ilike.%${escapedQ}%,phone.ilike.%${escapedQ}%`,
      );
    }

    const { data: profiles, count, error: pErr } = await query;
    if (pErr) {
      logEvent('error', 'admin.users.query_failed', {
        code: pErr.code || 'db_error',
        message: pErr.message.slice(0, 120),
      });
      return NextResponse.json({ error: 'Failed to load users.' }, { status: 500 });
    }

    const userIds = (profiles || []).map((p) => p.id);
    const orderCounts: Record<string, number> = {};
    const siteCounts: Record<string, number> = {};

    if (userIds.length > 0) {
      const [ordersRes, sitesRes] = await Promise.all([
        guard.admin
          .from('orders')
          .select('user_id')
          .in('user_id', userIds)
          .in('status', ['paid', 'published']),
        guard.admin
          .from('sites')
          .select('user_id')
          .in('user_id', userIds)
          .is('deleted_at', null),
      ]);

      (ordersRes.data || []).forEach((row) => {
        if (row.user_id) orderCounts[row.user_id] = (orderCounts[row.user_id] || 0) + 1;
      });
      (sitesRes.data || []).forEach((row) => {
        if (row.user_id) siteCounts[row.user_id] = (siteCounts[row.user_id] || 0) + 1;
      });
    }

    const users = (profiles || []).map((p) => ({
      ...p,
      ordersCount: orderCounts[p.id] || 0,
      sitesCount: siteCounts[p.id] || 0,
    }));

    return NextResponse.json({
      ok: true,
      users,
      pagination: { limit, offset, total: count ?? 0 },
    });
  } catch (err) {
    logEvent('error', 'admin.users.get_error', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Server error loading users.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      userId?: string;
      isBanned?: boolean;
      reason?: string;
    };

    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId.' }, { status: 400 });
    }

    if (userId === guard.userId) {
      return NextResponse.json(
        { error: 'You cannot restrict your own active admin account.' },
        { status: 403 },
      );
    }

    const { data: targetProfile } = await guard.admin
      .from('profiles')
      .select('id, role, email')
      .eq('id', userId)
      .maybeSingle();

    if (!targetProfile) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (targetProfile.role === 'admin') {
      return NextResponse.json(
        { error: 'Admin / Founder accounts cannot be banned from the console.' },
        { status: 403 },
      );
    }

    const isBanned = Boolean(body.isBanned);
    const reason = (body.reason || '').trim().slice(0, 200) || `Admin toggled banned=${isBanned}`;

    const { error: updateErr } = await guard.admin
      .from('profiles')
      .update({ is_banned: isBanned })
      .eq('id', userId);

    if (updateErr) {
      logEvent('error', 'admin.users.update_failed', {
        userId,
        code: updateErr.code || 'db_error',
        message: updateErr.message.slice(0, 120),
      });
      return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
    }

    await writeAuditLog({
      actorId: guard.userId,
      action: isBanned ? 'admin.user_banned' : 'admin.user_unbanned',
      entity: 'profiles',
      entityId: userId,
      meta: { reason, targetEmail: targetProfile.email, actorEmail: guard.email },
    });

    logEvent('info', 'admin.user.ban_toggled', { userId, isBanned });
    return NextResponse.json({ ok: true, isBanned });
  } catch (err) {
    logEvent('error', 'admin.users.patch_error', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Server error updating user.' }, { status: 500 });
  }
}
