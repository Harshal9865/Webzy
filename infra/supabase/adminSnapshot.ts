import { checkSupabaseConnection } from './health';
import { createSupabaseAdminClient } from './server';

export interface ExecutiveAddonStats {
  pinCount: number;
  videoCount: number;
  extendCount: number;
  ordersWithAddons: number;
  attachRatePct: number;
}

export interface ExecutiveMetrics {
  livePaidOrdersCount: number;
  testPaidOrdersCount: number;
  combinedPaidOrdersCount: number;
  aovPaise: number;
  combinedAovPaise: number;
  refundedLivePaise: number;
  refundedLiveCount: number;
  estimatedGstPaise: number;
  estimatedGatewayFeePaise: number;
  combinedEstimatedGstPaise: number;
  combinedEstimatedGatewayFeePaise: number;
  addonStats: ExecutiveAddonStats;
  combinedAddonStats: ExecutiveAddonStats;
  totalViewsCount: number;
  activeDraftsCount: number;
  pipelineQuotedInr: number;
  totalPayingCustomers: number;
}

export interface AdminAuditEntry {
  id: string;
  action: string;
  entity: string;
  entity_id?: string | null;
  meta?: Record<string, unknown> | null;
  at: string;
}

export interface SnapshotUserItem {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  role: string;
  is_banned: boolean;
  created_at: string;
  ordersCount: number;
  sitesCount: number;
}

export interface SnapshotSiteItem {
  id: string;
  slug: string;
  user_id: string;
  status: string;
  hidden: boolean;
  views_count: number;
  reveal_at: string | null;
  expires_at: string | null;
  created_at: string;
  content_json?: Record<string, unknown> | null;
  theme_versions?: { theme_id?: string } | Array<{ theme_id?: string }> | null;
}

export interface SnapshotOrderRow {
  id: string;
  status: string;
  amount_paise: number;
  invoice_no: string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string | null;
  addons_json?: Record<string, boolean> | null;
  provider: string;
  is_test?: boolean;
  created_at: string;
  site_slug?: string | null;
}

export interface SnapshotReportRow {
  id: string;
  site_id: string;
  site_slug: string;
  site_status: string;
  site_hidden: boolean;
  reason: string;
  status: string;
  created_at: string;
}

export interface SnapshotTakedownRow {
  id: string;
  site_slug: string;
  site_id: string | null;
  reporter_name: string;
  reporter_email: string;
  category: string;
  details: string;
  status: string;
  created_at: string;
}

export interface SnapshotCustomRequestRow {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  occasion: string;
  budget_tier: string;
  target_date: string | null;
  brief: string;
  status: string;
  quoted_amount_inr: number | null;
  admin_notes: string;
  checklist?: Record<string, boolean> | null;
  preview_url?: string | null;
  live_url?: string | null;
  created_at: string;
}

export type WaitlistLeadStatus =
  | 'waitlisted'
  | 'contacted'
  | 'in_progress'
  | 'made'
  | 'converted'
  | 'archived';

export interface SnapshotWaitlistItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  business_name: string;
  city: string;
  notes: string;
  status: WaitlistLeadStatus;
  created_at: string;
  checklist?: Record<string, boolean> | null;
  preview_url?: string | null;
  live_url?: string | null;
  quote_amount_inr?: number | null;
}

export interface AdminDashboardSnapshot {
  supabaseHealth: {
    status: string;
    latencyMs?: number;
  };
  counts: {
    registeredUsers: number;
    paidCustomers: number;
    liveSites: number;
    liveRevenuePaise: number;
    testRevenuePaise: number;
    totalRevenuePaise: number;
    pendingSafety: number;
    newRequests: number;
    waitlistCount: number;
    audits: number;
  };
  executiveMetrics: ExecutiveMetrics;
  userItems: SnapshotUserItem[];
  siteItems: SnapshotSiteItem[];
  recentOrders: SnapshotOrderRow[];
  recentReports: SnapshotReportRow[];
  recentTakedowns: SnapshotTakedownRow[];
  customRequests: SnapshotCustomRequestRow[];
  waitlistItems: SnapshotWaitlistItem[];
  recentModLogs: Array<{ id: string; what: string; why: string; when_at: string }>;
  recentAudits: AdminAuditEntry[];
  statsLoadError: boolean;
  syncedAt: string;
}

interface AdminOrderMetricsRpcRow {
  live_revenue_paise?: number | string | null;
  test_revenue_paise?: number | string | null;
  live_paid_orders_count?: number | string | null;
  test_paid_orders_count?: number | string | null;
  refunded_live_paise?: number | string | null;
  refunded_live_count?: number | string | null;
  live_gateway_fee_paise?: number | string | null;
  test_gateway_fee_paise?: number | string | null;
  live_pin_count?: number | string | null;
  live_video_count?: number | string | null;
  live_extend_count?: number | string | null;
  live_extend_14d_count?: number | string | null;
  live_extend_21d_count?: number | string | null;
  live_orders_with_addons?: number | string | null;
  test_pin_count?: number | string | null;
  test_video_count?: number | string | null;
  test_extend_count?: number | string | null;
  test_extend_14d_count?: number | string | null;
  test_extend_21d_count?: number | string | null;
  test_orders_with_addons?: number | string | null;
  live_paying_customers?: number | string | null;
  total_paying_customers?: number | string | null;
}

export async function loadAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
  let counts = {
    registeredUsers: 0,
    paidCustomers: 0,
    liveSites: 0,
    liveRevenuePaise: 0,
    testRevenuePaise: 0,
    totalRevenuePaise: 0,
    pendingSafety: 0,
    newRequests: 0,
    waitlistCount: 0,
    audits: 0,
  };
  let userItems: SnapshotUserItem[] = [];
  let siteItems: SnapshotSiteItem[] = [];
  let waitlistItems: SnapshotWaitlistItem[] = [];
  let recentAudits: AdminAuditEntry[] = [];
  let recentModLogs: Array<{ id: string; what: string; why: string; when_at: string }> = [];
  let recentOrders: SnapshotOrderRow[] = [];
  let recentReports: SnapshotReportRow[] = [];
  let recentTakedowns: SnapshotTakedownRow[] = [];
  let customRequests: SnapshotCustomRequestRow[] = [];
  let executiveMetrics: ExecutiveMetrics = {
    livePaidOrdersCount: 0,
    testPaidOrdersCount: 0,
    combinedPaidOrdersCount: 0,
    aovPaise: 0,
    combinedAovPaise: 0,
    refundedLivePaise: 0,
    refundedLiveCount: 0,
    estimatedGstPaise: 0,
    estimatedGatewayFeePaise: 0,
    combinedEstimatedGstPaise: 0,
    combinedEstimatedGatewayFeePaise: 0,
    addonStats: {
      pinCount: 0,
      videoCount: 0,
      extendCount: 0,
      ordersWithAddons: 0,
      attachRatePct: 0,
    },
    combinedAddonStats: {
      pinCount: 0,
      videoCount: 0,
      extendCount: 0,
      ordersWithAddons: 0,
      attachRatePct: 0,
    },
    totalViewsCount: 0,
    activeDraftsCount: 0,
    pipelineQuotedInr: 0,
    totalPayingCustomers: 0,
  };
  let statsLoadError = false;

  const supabaseHealth = await checkSupabaseConnection();

  try {
    const adminClient = createSupabaseAdminClient();
    const [
      pRes,
      sitesRes,
      aRes,
      pendingReportsCountRes,
      pendingTakedownsCountRes,
      newRequestsCountRes,
      waitlistCountRes,
      recentRes,
      ordersRes,
      reportsRes,
      modRes,
      metricsRpcRes,
      profilesListRes,
      sitesListRes,
      waitlistRes,
      tdRes,
      crRes,
      draftsCountRes,
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
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      adminClient
        .from('takedown_requests')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'hidden_site']),
      adminClient
        .from('custom_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
      adminClient.from('business_waitlist').select('id', { count: 'exact', head: true }),
      adminClient
        .from('audit_log')
        .select('id, action, entity, entity_id, meta, at')
        .order('at', { ascending: false })
        .limit(30),
      adminClient
        .from('orders')
        .select(
          'id, status, amount_paise, invoice_no, buyer_name, buyer_email, buyer_phone, addons_json, fee_estimate_paise, provider, is_test, created_at, sites(slug)',
        )
        .order('created_at', { ascending: false })
        .limit(100),
      adminClient
        .from('reports')
        .select('id, site_id, reason, status, created_at, sites(slug, status, hidden)')
        .order('created_at', { ascending: false })
        .limit(30),
      adminClient
        .from('moderation_log')
        .select('id, what, why, when_at')
        .order('when_at', { ascending: false })
        .limit(25),
      adminClient.rpc('get_admin_order_metrics'),
      adminClient
        .from('profiles')
        .select('id, email, full_name, phone, role, is_banned, created_at')
        .order('created_at', { ascending: false })
        .limit(100),
      adminClient
        .from('sites')
        .select(
          'id, slug, user_id, status, hidden, views_count, reveal_at, expires_at, created_at, content_json, theme_versions(theme_id)',
        )
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(100),
      adminClient
        .from('business_waitlist')
        .select(
          'id, name, email, phone, category, business_name, city, notes, status, checklist, preview_url, live_url, quote_amount_inr, created_at',
        )
        .order('created_at', { ascending: false })
        .limit(100),
      adminClient
        .from('takedown_requests')
        .select(
          'id, site_slug, site_id, reporter_name, reporter_email, category, details, status, created_at',
        )
        .order('created_at', { ascending: false })
        .limit(30),
      adminClient
        .from('custom_requests')
        .select(
          'id, requester_name, requester_email, requester_phone, occasion, budget_tier, target_date, brief, status, quoted_amount_inr, admin_notes, checklist, preview_url, live_url, created_at',
        )
        .order('created_at', { ascending: false })
        .limit(100),
      adminClient
        .from('drafts')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null),
    ]);

    if (
      pRes.error ||
      sitesRes.error ||
      aRes.error ||
      ordersRes.error ||
      profilesListRes.error ||
      sitesListRes.error
    ) {
      statsLoadError = true;
    }

    const profilesList = profilesListRes.data || [];
    const userIds = profilesList.map((p) => p.id);
    const rpcMetricsRaw = !metricsRpcRes.error
      ? Array.isArray(metricsRpcRes.data)
        ? (metricsRpcRes.data[0] as AdminOrderMetricsRpcRow | undefined)
        : (metricsRpcRes.data as AdminOrderMetricsRpcRow | null)
      : null;

    const [boundedSitesRes, boundedOrdersOrFallbackRes] = await Promise.all([
      userIds.length > 0
        ? adminClient
            .from('sites')
            .select('user_id')
            .in('user_id', userIds)
            .is('deleted_at', null)
        : Promise.resolve({ data: [] as Array<{ user_id: string | null }>, error: null }),
      rpcMetricsRaw
        ? userIds.length > 0
          ? adminClient
              .from('orders')
              .select('user_id')
              .in('user_id', userIds)
              .in('status', ['paid', 'published'])
          : Promise.resolve({ data: [] as Array<{ user_id: string | null }>, error: null })
        : adminClient
            .from('orders')
            .select('amount_paise, user_id, is_test, addons_json, fee_estimate_paise, status')
            .in('status', ['paid', 'published', 'refunded', 'partially_refunded'])
            .limit(5000),
    ]);

    if (!rpcMetricsRaw && boundedOrdersOrFallbackRes.error) {
      statsLoadError = true;
    }

    let liveRev = 0;
    let testRev = 0;
    let livePaidOrdersCount = 0;
    let testPaidOrdersCount = 0;
    let refundedLivePaise = 0;
    let refundedLiveCount = 0;
    let estimatedGatewayFeePaise = 0;
    let testGatewayFeePaise = 0;
    let pinCount = 0;
    let videoCount = 0;
    let extendCount = 0;
    let ordersWithAddons = 0;
    let testPinCount = 0;
    let testVideoCount = 0;
    let testExtendCount = 0;
    let testOrdersWithAddons = 0;
    let livePayingCustomersCount = 0;
    let totalPayingCustomersCount = 0;
    const userOrderCounts: Record<string, number> = {};

    if (rpcMetricsRaw) {
      liveRev = Number(rpcMetricsRaw.live_revenue_paise) || 0;
      testRev = Number(rpcMetricsRaw.test_revenue_paise) || 0;
      livePaidOrdersCount = Number(rpcMetricsRaw.live_paid_orders_count) || 0;
      testPaidOrdersCount = Number(rpcMetricsRaw.test_paid_orders_count) || 0;
      refundedLivePaise = Number(rpcMetricsRaw.refunded_live_paise) || 0;
      refundedLiveCount = Number(rpcMetricsRaw.refunded_live_count) || 0;
      estimatedGatewayFeePaise = Number(rpcMetricsRaw.live_gateway_fee_paise) || 0;
      testGatewayFeePaise = Number(rpcMetricsRaw.test_gateway_fee_paise) || 0;
      pinCount = Number(rpcMetricsRaw.live_pin_count) || 0;
      videoCount = Number(rpcMetricsRaw.live_video_count) || 0;
      extendCount = Number(rpcMetricsRaw.live_extend_count) || 0;
      ordersWithAddons = Number(rpcMetricsRaw.live_orders_with_addons) || 0;
      testPinCount = Number(rpcMetricsRaw.test_pin_count) || 0;
      testVideoCount = Number(rpcMetricsRaw.test_video_count) || 0;
      testExtendCount = Number(rpcMetricsRaw.test_extend_count) || 0;
      testOrdersWithAddons = Number(rpcMetricsRaw.test_orders_with_addons) || 0;
      livePayingCustomersCount = Number(rpcMetricsRaw.live_paying_customers) || 0;
      totalPayingCustomersCount = Number(rpcMetricsRaw.total_paying_customers) || 0;

      ((boundedOrdersOrFallbackRes.data || []) as Array<{ user_id: string | null }>).forEach((o) => {
        if (o.user_id) {
          userOrderCounts[o.user_id] = (userOrderCounts[o.user_id] || 0) + 1;
        }
      });
    } else {
      const paidOrders = (boundedOrdersOrFallbackRes.data || []) as Array<{
        amount_paise: number | null;
        user_id: string | null;
        is_test: boolean | null;
        addons_json: unknown;
        fee_estimate_paise: number | null;
        status: string;
      }>;
      const payingUserIds = new Set<string>();
      const allPayingUserIds = new Set<string>();

      const parseAddons = (raw: unknown) => {
        if (Array.isArray(raw)) {
          return {
            hasPin: raw.includes('pin') || raw.includes('secretPin'),
            hasVideo: raw.includes('video') || raw.includes('videoCard'),
            hasExtend:
              raw.includes('extend_14d') ||
              raw.includes('extend_21d') ||
              raw.includes('extend') ||
              raw.includes('extendValidity90d'),
          };
        }
        if (raw && typeof raw === 'object') {
          const obj = raw as Record<string, boolean>;
          return {
            hasPin: Boolean(obj.secretPin || obj.pin),
            hasVideo: Boolean(obj.videoCard || obj.video),
            hasExtend: Boolean(
              obj.extend14d || obj.extend21d || obj.extendValidity90d || obj.extend,
            ),
          };
        }
        return { hasPin: false, hasVideo: false, hasExtend: false };
      };

      paidOrders.forEach((o) => {
        const amount = o.amount_paise || 0;
        const isPaidOrPublished = o.status === 'paid' || o.status === 'published';
        const isRefunded = o.status === 'refunded' || o.status === 'partially_refunded';

        if (isPaidOrPublished) {
          if (o.user_id) {
            allPayingUserIds.add(o.user_id);
            userOrderCounts[o.user_id] = (userOrderCounts[o.user_id] || 0) + 1;
          }
          const feeEst =
            typeof o.fee_estimate_paise === 'number' && o.fee_estimate_paise > 0
              ? o.fee_estimate_paise
              : Math.round(amount * 0.0236);
          const { hasPin, hasVideo, hasExtend } = parseAddons(o.addons_json);

          if (o.is_test) {
            testRev += amount;
            testPaidOrdersCount += 1;
            testGatewayFeePaise += feeEst;
            if (hasPin) testPinCount += 1;
            if (hasVideo) testVideoCount += 1;
            if (hasExtend) testExtendCount += 1;
            if (hasPin || hasVideo || hasExtend) testOrdersWithAddons += 1;
          } else {
            liveRev += amount;
            livePaidOrdersCount += 1;
            if (o.user_id) {
              payingUserIds.add(o.user_id);
            }
            estimatedGatewayFeePaise += feeEst;
            if (hasPin) pinCount += 1;
            if (hasVideo) videoCount += 1;
            if (hasExtend) extendCount += 1;
            if (hasPin || hasVideo || hasExtend) ordersWithAddons += 1;
          }
        } else if (isRefunded && !o.is_test) {
          refundedLivePaise += amount;
          refundedLiveCount += 1;
        }
      });

      livePayingCustomersCount = payingUserIds.size;
      totalPayingCustomersCount = allPayingUserIds.size;
    }

    const userSiteCounts: Record<string, number> = {};
    (boundedSitesRes.data || []).forEach((s) => {
      if (s.user_id) userSiteCounts[s.user_id] = (userSiteCounts[s.user_id] || 0) + 1;
    });

    userItems = profilesList.map((p) => ({
      ...p,
      ordersCount: userOrderCounts[p.id] || 0,
      sitesCount: userSiteCounts[p.id] || 0,
    }));

    siteItems = (sitesListRes.data as SnapshotSiteItem[] | null) ?? [];
    const allowedWaitlistStatuses = new Set<WaitlistLeadStatus>([
      'waitlisted',
      'contacted',
      'in_progress',
      'made',
      'converted',
      'archived',
    ]);
    waitlistItems = ((waitlistRes.data as Array<Record<string, unknown>> | null) ?? []).map((w) => {
      const rawStatus = typeof w.status === 'string' ? w.status : 'waitlisted';
      const status: WaitlistLeadStatus = allowedWaitlistStatuses.has(rawStatus as WaitlistLeadStatus)
        ? (rawStatus as WaitlistLeadStatus)
        : 'waitlisted';
      return {
        id: String(w.id || ''),
        name: String(w.name || ''),
        email: String(w.email || ''),
        phone: typeof w.phone === 'string' ? w.phone : '',
        category: String(w.category || ''),
        business_name: typeof w.business_name === 'string' ? w.business_name : '',
        city: typeof w.city === 'string' ? w.city : '',
        notes: typeof w.notes === 'string' ? w.notes : '',
        status,
        created_at: String(w.created_at || ''),
        checklist:
          w.checklist && typeof w.checklist === 'object'
            ? (w.checklist as Record<string, boolean>)
            : null,
        preview_url: typeof w.preview_url === 'string' ? w.preview_url : null,
        live_url: typeof w.live_url === 'string' ? w.live_url : null,
        quote_amount_inr: typeof w.quote_amount_inr === 'number' ? w.quote_amount_inr : null,
      };
    });
    recentAudits = (recentRes.data as AdminAuditEntry[] | null) ?? [];
    recentModLogs = (modRes.data as typeof recentModLogs | null) ?? [];

    if (ordersRes.data) {
      recentOrders = ordersRes.data.map((o) => {
        const siteRel = o.sites as { slug?: string } | Array<{ slug?: string }> | null;
        const s = Array.isArray(siteRel) ? siteRel[0] : siteRel;
        return {
          id: o.id,
          status: o.status,
          amount_paise: o.amount_paise,
          invoice_no: o.invoice_no,
          buyer_name: o.buyer_name,
          buyer_email: o.buyer_email,
          buyer_phone: o.buyer_phone || null,
          addons_json:
            o.addons_json && typeof o.addons_json === 'object'
              ? (o.addons_json as Record<string, boolean>)
              : null,
          provider: o.provider,
          is_test: Boolean(o.is_test),
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
          site_slug: s?.slug || (r.site_id || '').slice(0, 8) || 'unknown',
          site_status: s?.status || 'unknown',
          site_hidden: Boolean(s?.hidden),
          reason: r.reason,
          status: r.status,
          created_at: r.created_at,
        };
      });
    }

    if (!tdRes.error && tdRes.data) {
      recentTakedowns = tdRes.data as SnapshotTakedownRow[];
    }
    if (!crRes.error && crRes.data) {
      customRequests = crRes.data as SnapshotCustomRequestRow[];
    }

    const totalViewsCount = siteItems.reduce((sum, s) => sum + (s.views_count || 0), 0);
    const customPipelineInr = customRequests.reduce(
      (sum, r) => sum + (typeof r.quoted_amount_inr === 'number' ? r.quoted_amount_inr : 0),
      0,
    );
    const waitlistPipelineInr = waitlistItems.reduce((sum, w) => {
      const rawQuote = w.quote_amount_inr;
      return sum + (typeof rawQuote === 'number' ? rawQuote : 0);
    }, 0);

    const combinedRev = liveRev + testRev;
    const combinedPaidOrdersCount = livePaidOrdersCount + testPaidOrdersCount;
    const combinedOrdersWithAddons = ordersWithAddons + testOrdersWithAddons;

    executiveMetrics = {
      livePaidOrdersCount,
      testPaidOrdersCount,
      combinedPaidOrdersCount,
      aovPaise: livePaidOrdersCount > 0 ? Math.round(liveRev / livePaidOrdersCount) : 0,
      combinedAovPaise:
        combinedPaidOrdersCount > 0 ? Math.round(combinedRev / combinedPaidOrdersCount) : 0,
      refundedLivePaise,
      refundedLiveCount,
      estimatedGstPaise: Math.round(liveRev - liveRev / 1.18),
      estimatedGatewayFeePaise,
      combinedEstimatedGstPaise: Math.round(combinedRev - combinedRev / 1.18),
      combinedEstimatedGatewayFeePaise: estimatedGatewayFeePaise + testGatewayFeePaise,
      addonStats: {
        pinCount,
        videoCount,
        extendCount,
        ordersWithAddons,
        attachRatePct:
          livePaidOrdersCount > 0 ? Math.round((ordersWithAddons / livePaidOrdersCount) * 100) : 0,
      },
      combinedAddonStats: {
        pinCount: pinCount + testPinCount,
        videoCount: videoCount + testVideoCount,
        extendCount: extendCount + testExtendCount,
        ordersWithAddons: combinedOrdersWithAddons,
        attachRatePct:
          combinedPaidOrdersCount > 0
            ? Math.round((combinedOrdersWithAddons / combinedPaidOrdersCount) * 100)
            : 0,
      },
      totalViewsCount,
      activeDraftsCount: draftsCountRes.count ?? 0,
      pipelineQuotedInr: customPipelineInr + waitlistPipelineInr,
      totalPayingCustomers: totalPayingCustomersCount,
    };

    counts = {
      registeredUsers: pRes.count ?? 0,
      paidCustomers: livePayingCustomersCount,
      liveSites: sitesRes.count ?? 0,
      liveRevenuePaise: liveRev,
      testRevenuePaise: testRev,
      totalRevenuePaise: liveRev + testRev,
      pendingSafety: (pendingReportsCountRes.count ?? 0) + (pendingTakedownsCountRes.count ?? 0),
      newRequests: newRequestsCountRes.count ?? 0,
      waitlistCount: waitlistCountRes.count ?? waitlistItems.length,
      audits: aRes.count ?? 0,
    };
  } catch {
    statsLoadError = true;
  }

  return {
    supabaseHealth,
    counts,
    executiveMetrics,
    userItems,
    siteItems,
    recentOrders,
    recentReports,
    recentTakedowns,
    customRequests,
    waitlistItems,
    recentModLogs,
    recentAudits,
    statsLoadError,
    syncedAt: new Date().toISOString(),
  };
}
