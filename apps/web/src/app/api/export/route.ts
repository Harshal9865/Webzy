import { NextResponse } from 'next/server';
import { logEvent } from '@webzy/core';
import { reportServerError } from '../../../../../../infra/sentry/monitor';
import { requireVerifiedAdmin } from '../../../lib/requireAdmin';

const SENSITIVE_EXPORT_KEY_RE =
  /^(secretPinHash|pinSalt|secretPin|pinHash|draftToken|draft_token_hash|accessToken|refreshToken|authToken|idToken|sessionToken|password|secret|token)$/i;

function scrubExportJsonBlob(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => scrubExportJsonBlob(item));
  }
  if (!value || typeof value !== 'object') {
    return value;
  }
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (
      SENSITIVE_EXPORT_KEY_RE.test(key) ||
      /(pinhash|pinsalt|authtoken|accesstoken|refreshtoken|sessiontoken|tokenhash|password|secretkey)/i.test(
        key,
      )
    ) {
      continue;
    }
    clean[key] = scrubExportJsonBlob(val);
  }
  return clean;
}

export async function GET() {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const admin = guard.admin;

    const [profiles, sites, orders, reports, takedowns, customRequests, waitlist] =
      await Promise.all([
        admin
          .from('profiles')
          .select('id, email, full_name, phone, role, is_banned, created_at')
          .limit(2000),
        admin
          .from('sites')
          .select(
            'id, slug, user_id, order_id, draft_id, status, hidden, views_count, reveal_at, expires_at, content_json, created_at, updated_at, deleted_at',
          )
          .limit(2000),
        admin
          .from('orders')
          .select(
            'id, user_id, draft_id, status, amount_paise, subtotal_paise, discount_paise, fee_estimate_paise, currency, provider, provider_order_id, invoice_no, buyer_name, buyer_email, buyer_phone, addons_json, pricing_breakdown, theme_version_id, is_test, idempotency_key, content_snapshot, created_at',
          )
          .limit(2000),
        admin
          .from('reports')
          .select('id, site_id, reason, status, decided_by, created_at')
          .limit(1000),
        admin
          .from('takedown_requests')
          .select(
            'id, site_slug, site_id, reporter_name, reporter_email, category, details, status, decided_by, resolution_note, created_at',
          )
          .limit(1000),
        admin
          .from('custom_requests')
          .select(
            'id, requester_name, requester_email, requester_phone, occasion, budget_tier, target_date, brief, status, quoted_amount_inr, admin_notes, handled_by, created_at',
          )
          .limit(1000),
        admin
          .from('business_waitlist')
          .select('id, name, email, phone, category, business_name, city, notes, status, created_at')
          .limit(1000),
      ]);

    const safeSites = (sites.data || []).map((site) => ({
      ...site,
      content_json: scrubExportJsonBlob(site.content_json),
    }));

    const safeOrders = (orders.data || []).map((order) => ({
      ...order,
      content_snapshot: scrubExportJsonBlob(order.content_snapshot),
    }));

    const snapshot = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      exportedBy: guard.email,
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
      stats: {
        profilesCount: profiles.data?.length ?? 0,
        sitesCount: safeSites.length,
        ordersCount: safeOrders.length,
        reportsCount: reports.data?.length ?? 0,
        waitlistCount: waitlist.data?.length ?? 0,
      },
      data: {
        profiles: profiles.data || [],
        sites: safeSites,
        orders: safeOrders,
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
    reportServerError(err, { route: '/api/export', app: 'web' });
    logEvent('error', 'admin.backup.export_error', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Failed to create backup export snapshot.' }, { status: 500 });
  }
}
