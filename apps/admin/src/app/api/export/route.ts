import { NextResponse } from 'next/server';
import { logEvent } from '@webzy/core';
import { requireVerifiedAdmin } from '../../../lib/requireAdmin';

export async function GET() {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const admin = guard.admin;

    const [profiles, sites, orders, reports, takedowns, customRequests, waitlist] =
      await Promise.all([
        admin.from('profiles').select('*').limit(2000),
        admin.from('sites').select('*').limit(2000),
        admin.from('orders').select('*').limit(2000),
        admin.from('reports').select('*').limit(1000),
        admin.from('takedown_requests').select('*').limit(1000),
        admin.from('custom_requests').select('*').limit(1000),
        admin.from('business_waitlist').select('*').limit(1000),
      ]);

    const snapshot = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      exportedBy: guard.email,
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
      stats: {
        profilesCount: profiles.data?.length ?? 0,
        sitesCount: sites.data?.length ?? 0,
        ordersCount: orders.data?.length ?? 0,
        reportsCount: reports.data?.length ?? 0,
        waitlistCount: waitlist.data?.length ?? 0,
      },
      data: {
        profiles: profiles.data || [],
        sites: sites.data || [],
        orders: orders.data || [],
        reports: reports.data || [],
        takedown_requests: takedowns.data || [],
        custom_requests: customRequests.data || [],
        business_waitlist: waitlist.data || [],
      },
    };

    logEvent('info', 'admin.backup.snapshot_exported', {
      exportedBy: guard.email,
      profiles: snapshot.stats.profilesCount,
      sites: snapshot.stats.sitesCount,
      orders: snapshot.stats.ordersCount,
    });

    const filename = `webzy-backup-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    return new NextResponse(JSON.stringify(snapshot, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    logEvent('error', 'admin.backup.export_error', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Failed to create backup export snapshot.' }, { status: 500 });
  }
}
