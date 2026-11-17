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

    let query = guard.admin
      .from('profiles')
      .select('id, email, full_name, phone, role, is_banned, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (q) {
      query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%,phone.ilike.%${q}%`);
    }

    const { data: profiles, error: pErr } = await query;
    if (pErr) {
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    // Enhance each profile with order count and live sites count
    const userIds = (profiles || []).map((p) => p.id);
    let orderCounts: Record<string, number> = {};
    let siteCounts: Record<string, number> = {};

    if (userIds.length > 0) {
      const [ordersRes, sitesRes] = await Promise.all([
        guard.admin
          .from('orders')
          .select('user_id')
          .in('user_id', userIds)
          .eq('status', 'paid'),
        guard.admin
          .from('sites')
          .select('user_id')
          .in('user_id', userIds)
          .is('deleted_at', null),
      ]);

      (ordersRes.data || []).forEach((row) => {
        orderCounts[row.user_id] = (orderCounts[row.user_id] || 0) + 1;
      });
      (sitesRes.data || []).forEach((row) => {
        siteCounts[row.user_id] = (siteCounts[row.user_id] || 0) + 1;
      });
    }

    const users = (profiles || []).map((p) => ({
      ...p,
      ordersCount: orderCounts[p.id] || 0,
      sitesCount: siteCounts[p.id] || 0,
    }));

    return NextResponse.json({ ok: true, users });
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

    const isBanned = Boolean(body.isBanned);
    const reason = (body.reason || '').trim().slice(0, 200) || `Admin toggled banned=${isBanned}`;

    const { error: updateErr } = await guard.admin
      .from('profiles')
      .update({ is_banned: isBanned })
      .eq('id', userId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    await writeAuditLog({
      actorId: guard.userId,
      action: isBanned ? 'admin.user_banned' : 'admin.user_unbanned',
      entity: 'profiles',
      entityId: userId,
      meta: { reason, email: guard.email },
    });

    logEvent('info', 'admin.user.ban_toggled', { userId, isBanned });
    return NextResponse.json({ ok: true, isBanned });
  } catch (err) {
    return NextResponse.json({ error: 'Server error updating user.' }, { status: 500 });
  }
}
