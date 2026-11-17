import Link from 'next/link';
import { redirect } from 'next/navigation';
import { evaluateAdminAccess, formatPaiseAsInr, getWebzyPublicConfig, isAdminMfaRequired } from '@webzy/core';
import { getAuthSessionState } from '../../../../infra/supabase/auth';
import { checkSupabaseConnection } from '../../../../infra/supabase/health';
import { createSupabaseAdminClient } from '../../../../infra/supabase/server';
import {
  AdminModerationClient,
  type AdminReportRow,
  type AdminTakedownRow,
} from '../components/AdminModerationClient';
import { AdminCustomBuildsClient } from '../components/AdminCustomBuildsClient';
import { AdminOrdersClient, type AdminOrderRow } from '../components/AdminOrdersClient';
import {
  AdminRequestsClient,
  type AdminCustomRequestRow,
} from '../components/AdminRequestsClient';
import { AdminSignOutButton } from '../components/AdminSignOutButton';
import { AdminSitesClient, type AdminSiteItem } from '../components/AdminSitesClient';
import { AdminUsersClient, type AdminUserItem } from '../components/AdminUsersClient';
import { AdminWaitlistClient, type AdminWaitlistItem } from '../components/AdminWaitlistClient';

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  const config = getWebzyPublicConfig();
  const [supabaseHealth, session] = await Promise.all([
    checkSupabaseConnection(),
    getAuthSessionState(),
  ]);

  if (!session.configured) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-5 py-12">
        <div className="rounded-3xl border border-webzy-tint bg-webzy-surface p-7 shadow-sm">
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
            Webzy Admin · Setup Required
          </span>
          <h1 className="mt-4 font-heading text-3xl font-bold text-webzy-ink">
            Connect Supabase &amp; Seed Admin First
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-webzy-ink/80">
            Add Supabase keys in <code>.env.local</code> and run <code>npm run seed:admin</code>.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/api/health"
              className="inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-5 text-xs font-bold text-white"
            >
              Check /api/health
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const requireMfa = isAdminMfaRequired();
  const gate = evaluateAdminAccess({
    isAuthenticated: Boolean(session.user),
    role: session.profile?.role,
    aal: session.aal,
    isBanned: session.profile?.is_banned,
    requireMfa,
  });

  if (gate === 'unauthenticated') {
    redirect('/login');
  }
  if (gate === 'mfa_required') {
    redirect('/mfa');
  }
  if (gate === 'forbidden') {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-12">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-7 text-red-950">
          <h1 className="font-heading text-2xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm">
            Your signed-in account does not have the <code>admin</code> role. Run{' '}
            <code>npm run seed:admin -- your@email.com</code> as the founder to grant access.
          </p>
          <div className="mt-5">
            <AdminSignOutButton />
          </div>
        </div>
      </main>
    );
  }

  let counts = {
    registeredUsers: 0,
    paidCustomers: 0,
    liveSites: 0,
    totalRevenuePaise: 0,
    pendingSafety: 0,
    newRequests: 0,
    waitlistCount: 0,
    audits: 0,
  };
  let userItems: AdminUserItem[] = [];
  let siteItems: AdminSiteItem[] = [];
  let waitlistItems: AdminWaitlistItem[] = [];
  let recentAudits: Array<{ id: string; action: string; entity: string; at: string }> = [];
  let recentModLogs: Array<{ id: string; what: string; why: string; when_at: string }> = [];
  let recentOrders: AdminOrderRow[] = [];
  let recentReports: AdminReportRow[] = [];
  let recentTakedowns: AdminTakedownRow[] = [];
  let customRequests: AdminCustomRequestRow[] = [];
  let statsLoadError = false;

  try {
    const adminClient = createSupabaseAdminClient();
    const [
      pRes,
      sitesRes,
      aRes,
      recentRes,
      ordersRes,
      reportsRes,
      modRes,
      paidOrdersRes,
      profilesListRes,
      sitesListRes,
      waitlistRes,
      tdRes,
      crRes,
    ] = await Promise.all([
      adminClient.from('profiles').select('id', { count: 'exact', head: true }),
      adminClient
        .from('sites')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'live')
        .eq('hidden', false)
        .is('deleted_at', null),
      adminClient.from('audit_log').select('id', { count: 'exact', head: true }),
      adminClient
        .from('audit_log')
        .select('id, action, entity, at')
        .order('at', { ascending: false })
        .limit(8),
      adminClient
        .from('orders')
        .select('id, status, amount_paise, invoice_no, buyer_name, buyer_email, provider, created_at, sites(slug)')
        .order('created_at', { ascending: false })
        .limit(100),
      adminClient
        .from('reports')
        .select('id, site_id, reason, status, created_at, sites(slug, status, hidden)')
        .order('created_at', { ascending: false })
        .limit(15),
      adminClient
        .from('moderation_log')
        .select('id, what, why, when_at')
        .order('when_at', { ascending: false })
        .limit(10),
      adminClient
        .from('orders')
        .select('amount_paise, user_id')
        .in('status', ['paid', 'published']),
      adminClient
        .from('profiles')
        .select('id, email, full_name, phone, role, is_banned, created_at')
        .order('created_at', { ascending: false })
        .limit(50),
      adminClient
        .from('sites')
        .select('id, slug, user_id, status, hidden, views_count, reveal_at, expires_at, created_at, content_json, theme_versions(theme_id)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50),
      adminClient
        .from('business_waitlist')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
      adminClient
        .from('takedown_requests')
        .select('id, site_slug, site_id, reporter_name, reporter_email, category, details, status, created_at')
        .order('created_at', { ascending: false })
        .limit(15),
      adminClient
        .from('custom_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    if (pRes.error || aRes.error || ordersRes.error) {
      statsLoadError = true;
    }

    const paidOrders = paidOrdersRes.data || [];
    const totalRev = paidOrders.reduce((acc, row) => acc + (row.amount_paise || 0), 0);
    const payingUserIds = new Set(paidOrders.map((r) => r.user_id));

    // Calculate per-user order and site counts
    const userOrderCounts: Record<string, number> = {};
    const userSiteCounts: Record<string, number> = {};
    paidOrders.forEach((o) => {
      if (o.user_id) userOrderCounts[o.user_id] = (userOrderCounts[o.user_id] || 0) + 1;
    });
    (sitesListRes.data || []).forEach((s) => {
      if (s.user_id) userSiteCounts[s.user_id] = (userSiteCounts[s.user_id] || 0) + 1;
    });

    userItems = (profilesListRes.data || []).map((p) => ({
      ...p,
      ordersCount: userOrderCounts[p.id] || 0,
      sitesCount: userSiteCounts[p.id] || 0,
    }));

    siteItems = (sitesListRes.data as AdminSiteItem[] | null) ?? [];
    waitlistItems = (waitlistRes.data as AdminWaitlistItem[] | null) ?? [];
    recentAudits = (recentRes.data as typeof recentAudits | null) ?? [];
    recentModLogs = (modRes.data as typeof recentModLogs | null) ?? [];
    if (ordersRes.data) {
      recentOrders = ordersRes.data.map((o) => {
        const siteRel = o.sites as
          | { slug?: string }
          | Array<{ slug?: string }>
          | null;
        const s = Array.isArray(siteRel) ? siteRel[0] : siteRel;
        return {
          id: o.id,
          status: o.status,
          amount_paise: o.amount_paise,
          invoice_no: o.invoice_no,
          buyer_name: o.buyer_name,
          buyer_email: o.buyer_email,
          provider: o.provider,
          created_at: o.created_at,
          site_slug: s?.slug || null,
        };
      });
    }

    if (reportsRes.data) {
      recentReports = reportsRes.data.map((r) => {
        const siteRel = r.sites as
          | { slug?: string; status?: string; hidden?: boolean }
          | Array<{ slug?: string; status?: string; hidden?: boolean }>
          | null;
        const s = Array.isArray(siteRel) ? siteRel[0] : siteRel;
        return {
          id: r.id,
          site_id: r.site_id,
          site_slug: s?.slug || r.site_id.slice(0, 8),
          site_status: s?.status || 'unknown',
          site_hidden: Boolean(s?.hidden),
          reason: r.reason,
          status: r.status,
          created_at: r.created_at,
        };
      });
    }

    if (!tdRes.error && tdRes.data) {
      recentTakedowns = tdRes.data as AdminTakedownRow[];
    }
    if (!crRes.error && crRes.data) {
      customRequests = crRes.data as AdminCustomRequestRow[];
    }

    const pendingReportsCount = recentReports.filter((r) => r.status === 'pending').length;
    const pendingTakedownsCount = recentTakedowns.filter(
      (t) => t.status === 'pending' || t.status === 'hidden_site',
    ).length;

    counts = {
      registeredUsers: pRes.count ?? 0,
      paidCustomers: payingUserIds.size,
      liveSites: sitesRes.count ?? 0,
      totalRevenuePaise: totalRev,
      pendingSafety: pendingReportsCount + pendingTakedownsCount,
      newRequests: customRequests.filter((c) => c.status === 'new').length,
      waitlistCount: waitlistItems.length,
      audits: aRes.count ?? 0,
    };
  } catch {
    statsLoadError = true;
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      {/* Top Header & Fast Backup Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-webzy-tint/60 pb-6">
        <div>
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
            {requireMfa ? 'Admin Verified · 2FA Active' : 'Admin Verified · Founder Session'}
          </span>
          <h1 className="mt-2 font-heading text-3xl font-bold text-webzy-ink">
            Webzy Operations Console
          </h1>
          <p className="mt-1 text-xs text-webzy-ink/70">
            Signed in as {session.profile?.email} · Environment: {config.appEnv} · Database:{' '}
            {supabaseHealth.status}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1-Click Backup Export Snapshot */}
          <a
            href="/api/export"
            download
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-webzy-primary bg-webzy-surface px-4 text-xs font-bold text-webzy-primary shadow-xs transition hover:bg-webzy-tint"
            title="Download an air-gapped JSON snapshot of all database tables"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export Backup Snapshot (JSON)</span>
          </a>
          <Link
            href="/api/health"
            className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-white px-4 text-xs font-bold text-webzy-ink hover:bg-webzy-surface"
          >
            Health
          </Link>
          <AdminSignOutButton />
        </div>
      </div>

      {/* KPI Cards with Explicit Definitions */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-3xl border border-webzy-tint bg-webzy-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-webzy-ink/70">Registered Users</p>
            <span className="text-[10px] text-webzy-ink/50" title="Accounts created via email OTP during preview or checkout">
              profiles
            </span>
          </div>
          <p className="mt-1 font-heading text-3xl font-bold text-webzy-ink">
            {counts.registeredUsers}
          </p>
          <p className="mt-1 text-[11px] text-emerald-700 font-medium">
            {counts.paidCustomers} paid customers
          </p>
        </div>

        <div className="rounded-3xl border border-webzy-tint bg-webzy-surface p-5">
          <p className="text-xs font-semibold text-webzy-ink/70">Live Webzys</p>
          <p className="mt-1 font-heading text-3xl font-bold text-emerald-700">
            {counts.liveSites}
          </p>
          <p className="mt-1 text-[11px] text-webzy-ink/60">Active /s/[slug] pages</p>
        </div>

        <div className="rounded-3xl border border-webzy-tint bg-webzy-surface p-5">
          <p className="text-xs font-semibold text-webzy-ink/70">Total Revenue</p>
          <p className="mt-1 font-heading text-3xl font-bold text-webzy-primary">
            {formatPaiseAsInr(counts.totalRevenuePaise)}
          </p>
          <p className="mt-1 text-[11px] text-webzy-ink/60">From settled orders</p>
        </div>

        <div className="rounded-3xl border border-webzy-tint bg-webzy-surface p-5">
          <p className="text-xs font-semibold text-webzy-ink/70">Safety Queue</p>
          <p className="mt-1 font-heading text-3xl font-bold text-red-700">
            {counts.pendingSafety}
          </p>
          <p className="mt-1 text-[11px] text-webzy-ink/60">Reports &amp; takedowns</p>
        </div>

        <div className="rounded-3xl border border-webzy-tint bg-webzy-surface p-5">
          <p className="text-xs font-semibold text-webzy-ink/70">Custom &amp; Studio Pipeline</p>
          <p className="mt-1 font-heading text-3xl font-bold text-purple-700">
            {counts.waitlistCount + customRequests.length}
          </p>
          <p className="mt-1 text-[11px] text-webzy-ink/60">
            {counts.waitlistCount} Studio · {customRequests.length} Custom Briefs
          </p>
        </div>
      </div>

      {statsLoadError ? (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950"
        >
          Some admin database counts could not be loaded right now. Check Supabase connectivity or
          run pending SQL migrations (<code>0005</code>, <code>0006</code>, and <code>0007</code>).
        </div>
      ) : null}

      {/* 1. Registered Users Directory */}
      <AdminUsersClient initialUsers={userItems} />

      {/* 2. Live Webzys Explorer */}
      <AdminSitesClient initialSites={siteItems} webUrl={config.webUrl} />

      {/* 3. Orders, GST Accounting & Link Delivery */}
      <AdminOrdersClient orders={recentOrders} webUrl={config.webUrl} />

      {/* 4. Moderation & Safety Queue */}
      <AdminModerationClient
        reports={recentReports}
        takedowns={recentTakedowns}
        webUrl={config.webUrl}
      />

      {/* 5. Custom Builds & Studio Projects Pipeline (Requirements & Build Checklist) */}
      <AdminCustomBuildsClient
        studioLeads={waitlistItems}
        customRequests={customRequests}
      />

      {/* Email Quote Dispatcher for /request Leads */}
      <AdminRequestsClient requests={customRequests} />

      {/* 6. Moderation & Audit Logs */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-webzy-tint bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold text-webzy-ink">Moderation Log</h2>
          {recentModLogs.length === 0 ? (
            <p className="mt-2 text-sm text-webzy-ink/70">No moderation actions recorded yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-webzy-tint text-xs">
              {recentModLogs.map((row) => (
                <li key={row.id} className="py-2.5">
                  <p className="font-bold text-webzy-ink">{row.what}</p>
                  <p className="mt-0.5 text-webzy-ink/75">{row.why}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-webzy-tint bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold text-webzy-ink">Recent Audit Log</h2>
          {recentAudits.length === 0 ? (
            <p className="mt-2 text-sm text-webzy-ink/70">No audit events recorded yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-webzy-tint text-xs">
              {recentAudits.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span className="font-semibold text-webzy-ink">
                    {row.action} <span className="text-webzy-ink/60">({row.entity})</span>
                  </span>
                  <span className="text-webzy-ink/60">{row.at}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
