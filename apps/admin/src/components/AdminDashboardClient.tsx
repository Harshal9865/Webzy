'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { formatInr, formatPaiseAsInr } from '@webzy/core';
import type {
  AdminDashboardSnapshot,
  ExecutiveMetrics,
} from '../../../../infra/supabase/adminSnapshot';

export type { ExecutiveMetrics };
import { getSupabaseBrowserClient, isBrowserSupabaseConfigured } from '../../../../infra/supabase/browser';
import {
  AdminCustomBuildsClient,
  type CustomRequestRow,
  type StudioBuildRow,
} from './AdminCustomBuildsClient';
import {
  AdminModerationClient,
  type AdminReportRow,
  type AdminTakedownRow,
} from './AdminModerationClient';
import { AdminOrdersClient, type AdminOrderRow } from './AdminOrdersClient';
import { type AdminCustomRequestRow } from './AdminRequestsClient';
import { AdminSignOutButton } from './AdminSignOutButton';
import { AdminSitesClient, type AdminSiteItem } from './AdminSitesClient';
import { AdminUsersClient, type AdminUserItem } from './AdminUsersClient';
import { type AdminWaitlistItem } from './AdminWaitlistClient';

export type DashboardTab = 'overview' | 'orders' | 'sites' | 'users' | 'safety' | 'studio' | 'logs';

const VALID_TABS: readonly DashboardTab[] = [
  'overview',
  'orders',
  'sites',
  'users',
  'safety',
  'studio',
  'logs',
];

export interface AdminAuditEntry {
  id: string;
  action: string;
  entity: string;
  entity_id?: string | null;
  meta?: Record<string, unknown> | null;
  at: string;
}

export interface AdminDashboardClientProps {
  config: {
    appEnv: string;
    webUrl: string;
  };
  sessionEmail: string;
  requireMfa: boolean;
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
  executiveMetrics?: ExecutiveMetrics;
  userItems: AdminUserItem[];
  siteItems: AdminSiteItem[];
  recentOrders: AdminOrderRow[];
  recentReports: AdminReportRow[];
  recentTakedowns: AdminTakedownRow[];
  customRequests: AdminCustomRequestRow[];
  waitlistItems: AdminWaitlistItem[];
  recentModLogs: Array<{ id: string; what: string; why: string; when_at: string }>;
  recentAudits: AdminAuditEntry[];
  statsLoadError: boolean;
  signOutRedirect?: string;
}

function formatIstTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    }).format(d);
  } catch {
    return iso;
  }
}

export function AdminDashboardClient({
  config,
  sessionEmail,
  requireMfa,
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
  signOutRedirect = '/login',
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [isRefreshPending, startRefreshTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [runningWatchdog, setRunningWatchdog] = useState(false);
  const [runningLifecycle, setRunningLifecycle] = useState(false);
  const [opsNotice, setOpsNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [logSearch, setLogSearch] = useState('');
  const [revenueScope, setRevenueScope] = useState<'all' | 'live'>(() =>
    counts.liveRevenuePaise === 0 && counts.testRevenuePaise > 0 ? 'all' : 'all',
  );

  // Global Quick-Jump Search
  const [commandQuery, setCommandQuery] = useState('');
  const [commandOpen, setCommandOpen] = useState(false);
  const commandBoxRef = useRef<HTMLDivElement | null>(null);

  // Reactive Live Snapshot State (Updated via Realtime WebSocket + Heartbeat Poll + Mutations)
  const [liveHealth, setLiveHealth] = useState(supabaseHealth);
  const [liveCounts, setLiveCounts] = useState(counts);
  const [liveMetrics, setLiveMetrics] = useState<ExecutiveMetrics | undefined>(executiveMetrics);
  const [liveUsers, setLiveUsers] = useState<AdminUserItem[]>(userItems);
  const [liveSites, setLiveSites] = useState<AdminSiteItem[]>(siteItems);
  const [liveOrders, setLiveOrders] = useState<AdminOrderRow[]>(recentOrders);
  const [liveReports, setLiveReports] = useState<AdminReportRow[]>(recentReports);
  const [liveTakedowns, setLiveTakedowns] = useState<AdminTakedownRow[]>(recentTakedowns);
  const [liveCustomRequests, setLiveCustomRequests] = useState<AdminCustomRequestRow[]>(customRequests);
  const [liveWaitlist, setLiveWaitlist] = useState<AdminWaitlistItem[]>(waitlistItems);
  const [liveModLogs, setLiveModLogs] = useState(recentModLogs);
  const [liveAudits, setLiveAudits] = useState<AdminAuditEntry[]>(recentAudits);
  const [liveStatsError, setLiveStatsError] = useState(statsLoadError);

  const [autoSync, setAutoSync] = useState(true);
  const [syncState, setSyncState] = useState<'connected' | 'syncing' | 'paused' | 'error'>('connected');
  const [lastSyncedAtMs, setLastSyncedAtMs] = useState<number>(() => Date.now());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const inFlightSyncRef = useRef(false);

  const showToast = useCallback((text: string, kind: 'success' | 'error' = 'success') => {
    setToast({ kind, text });
  }, []);

  // Re-align local state when SSR props change
  useEffect(() => {
    setLiveHealth(supabaseHealth);
    setLiveCounts(counts);
    setLiveMetrics(executiveMetrics);
    setLiveUsers(userItems);
    setLiveSites(siteItems);
    setLiveOrders(recentOrders);
    setLiveReports(recentReports);
    setLiveTakedowns(recentTakedowns);
    setLiveCustomRequests(customRequests);
    setLiveWaitlist(waitlistItems);
    setLiveModLogs(recentModLogs);
    setLiveAudits(recentAudits);
    setLiveStatsError(statsLoadError);
    setLastSyncedAtMs(Date.now());
    setSecondsAgo(0);
  }, [
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
  ]);

  const fetchRealtimeSnapshot = useCallback(
    async (silent = true) => {
      if (inFlightSyncRef.current) return;
      inFlightSyncRef.current = true;
      if (!silent) {
        setSyncState('syncing');
      }

      try {
        const res = await fetch('/api/realtime', {
          method: 'GET',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) {
          throw new Error('Sync error');
        }
        const snap = (await res.json()) as { ok?: boolean } & AdminDashboardSnapshot;
        if (!snap || !snap.counts) {
          throw new Error('Malformed realtime payload');
        }

        // Notify if new customer activity arrived during background sync
        if (silent) {
          if (snap.counts.liveRevenuePaise > liveCounts.liveRevenuePaise) {
            showToast(
              `Realtime: New live payment received (+${formatPaiseAsInr(snap.counts.liveRevenuePaise - liveCounts.liveRevenuePaise)}).`,
            );
          } else if (snap.counts.totalRevenuePaise > liveCounts.totalRevenuePaise) {
            showToast(
              `Realtime: New test payment settled (+${formatPaiseAsInr(snap.counts.totalRevenuePaise - liveCounts.totalRevenuePaise)}).`,
            );
          } else if (snap.counts.pendingSafety > liveCounts.pendingSafety) {
            showToast('Realtime Alert: New safety report or takedown queued.', 'error');
          } else if (snap.counts.newRequests > liveCounts.newRequests) {
            showToast('Realtime: New custom website brief arrived.');
          }
        }

        setLiveHealth(snap.supabaseHealth);
        setLiveCounts(snap.counts);
        setLiveMetrics(snap.executiveMetrics);
        setLiveUsers(snap.userItems as AdminUserItem[]);
        setLiveSites(snap.siteItems as AdminSiteItem[]);
        setLiveOrders(snap.recentOrders as AdminOrderRow[]);
        setLiveReports(snap.recentReports as AdminReportRow[]);
        setLiveTakedowns(snap.recentTakedowns as AdminTakedownRow[]);
        setLiveCustomRequests(snap.customRequests as AdminCustomRequestRow[]);
        setLiveWaitlist(snap.waitlistItems as AdminWaitlistItem[]);
        setLiveModLogs(snap.recentModLogs);
        setLiveAudits(snap.recentAudits as AdminAuditEntry[]);
        setLiveStatsError(snap.statsLoadError);
        setLastSyncedAtMs(Date.now());
        setSecondsAgo(0);
        setSyncState(autoSync ? 'connected' : 'paused');
        if (!silent) {
          showToast('Live metrics and queues synced.');
        }
      } catch {
        setSyncState('error');
        if (!silent) {
          showToast('Realtime sync failed. Check network or admin session.', 'error');
        }
      } finally {
        inFlightSyncRef.current = false;
      }
    },
    [
      autoSync,
      liveCounts.liveRevenuePaise,
      liveCounts.totalRevenuePaise,
      liveCounts.pendingSafety,
      liveCounts.newRequests,
      showToast,
    ],
  );

  // Elapsed timer badge ("Synced 4s ago")
  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsAgo(Math.max(0, Math.floor((Date.now() - lastSyncedAtMs) / 1000)));
    }, 1000);
    return () => window.clearInterval(id);
  }, [lastSyncedAtMs]);

  // Dual Real-Time Engine: Supabase WebSocket postgres_changes + 6s fallback polling
  useEffect(() => {
    if (!autoSync) {
      setSyncState('paused');
      return;
    }
    setSyncState('connected');

    let channel: ReturnType<ReturnType<typeof getSupabaseBrowserClient>['channel']> | null = null;
    try {
      if (isBrowserSupabaseConfigured()) {
        const supabase = getSupabaseBrowserClient();
        channel = supabase
          .channel('webzy-admin-live')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
            void fetchRealtimeSnapshot(true);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'sites' }, () => {
            void fetchRealtimeSnapshot(true);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
            void fetchRealtimeSnapshot(true);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
            void fetchRealtimeSnapshot(true);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'takedown_requests' }, () => {
            void fetchRealtimeSnapshot(true);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_requests' }, () => {
            void fetchRealtimeSnapshot(true);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'business_waitlist' }, () => {
            void fetchRealtimeSnapshot(true);
          })
          .subscribe();
      }
    } catch {
      // Fall back cleanly to 6s polling when Realtime socket unavailable
    }

    const pollTimer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void fetchRealtimeSnapshot(true);
      }
    }, 6000);

    return () => {
      window.clearInterval(pollTimer);
      if (channel) {
        try {
          void getSupabaseBrowserClient().removeChannel(channel);
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [autoSync, fetchRealtimeSnapshot]);

  // Instant refresh whenever any sub-client performs a mutation
  useEffect(() => {
    const onMutated = () => {
      void fetchRealtimeSnapshot(true);
    };
    window.addEventListener('webzy_admin_mutated', onMutated);
    return () => window.removeEventListener('webzy_admin_mutated', onMutated);
  }, [fetchRealtimeSnapshot]);

  // Click outside handler for Global Search Dropdown
  useEffect(() => {
    if (!commandOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (commandBoxRef.current && e.target instanceof Node && !commandBoxRef.current.contains(e.target)) {
        setCommandOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [commandOpen]);

  const metrics: ExecutiveMetrics = liveMetrics ?? {
    livePaidOrdersCount: 0,
    testPaidOrdersCount: 0,
    combinedPaidOrdersCount: 0,
    aovPaise: 0,
    combinedAovPaise: 0,
    refundedLivePaise: 0,
    refundedLiveCount: 0,
    estimatedGstPaise: Math.round(liveCounts.liveRevenuePaise - liveCounts.liveRevenuePaise / 1.18),
    estimatedGatewayFeePaise: Math.round(liveCounts.liveRevenuePaise * 0.0236),
    combinedEstimatedGstPaise: Math.round(liveCounts.totalRevenuePaise - liveCounts.totalRevenuePaise / 1.18),
    combinedEstimatedGatewayFeePaise: Math.round(liveCounts.totalRevenuePaise * 0.0236),
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
    totalViewsCount: liveSites.reduce((sum, s) => sum + (s.views_count || 0), 0),
    activeDraftsCount: 0,
    pipelineQuotedInr: 0,
    totalPayingCustomers: liveCounts.paidCustomers,
  };

  const activeGrossRevenuePaise =
    revenueScope === 'all' ? liveCounts.totalRevenuePaise : liveCounts.liveRevenuePaise;
  const activePaidOrdersCount =
    revenueScope === 'all' ? metrics.combinedPaidOrdersCount : metrics.livePaidOrdersCount;
  const activeAovPaise = revenueScope === 'all' ? metrics.combinedAovPaise : metrics.aovPaise;
  const activeGstPaise =
    revenueScope === 'all' ? metrics.combinedEstimatedGstPaise : metrics.estimatedGstPaise;
  const activeGatewayFeePaise =
    revenueScope === 'all'
      ? metrics.combinedEstimatedGatewayFeePaise
      : metrics.estimatedGatewayFeePaise;
  const activeAddonStats = revenueScope === 'all' ? metrics.combinedAddonStats : metrics.addonStats;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Dismiss floating toast on Escape when visible
  useEffect(() => {
    if (!toast) return;
    function handleToastEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setToast(null);
      }
    }
    window.addEventListener('keydown', handleToastEscape);
    return () => window.removeEventListener('keydown', handleToastEscape);
  }, [toast]);

  const selectTab = useCallback((tab: DashboardTab) => {
    setActiveTab(tab);
    setCommandOpen(false);
    try {
      window.sessionStorage.setItem('webzy_admin_tab', tab);
      window.history.replaceState(null, '', `#${tab}`);
    } catch {
      // Ignore storage/history failures
    }
  }, []);

  // Restore persisted tab on mount
  useEffect(() => {
    try {
      const hashTab = window.location.hash.replace(/^#/, '') as DashboardTab;
      if (VALID_TABS.includes(hashTab)) {
        setActiveTab(hashTab);
        return;
      }
      const savedTab = window.sessionStorage.getItem('webzy_admin_tab') as DashboardTab | null;
      if (savedTab && VALID_TABS.includes(savedTab)) {
        setActiveTab(savedTab);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  // Global keyboard shortcuts: Alt+1..Alt+7 to switch tabs, Esc to dismiss notices/dropdowns
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpsNotice(null);
        setToast(null);
        setCommandOpen(false);
        return;
      }
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const index = Number(e.key) - 1;
        if (index >= 0 && index < VALID_TABS.length) {
          e.preventDefault();
          selectTab(VALID_TABS[index]);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectTab]);

  const isRefreshing = syncState === 'syncing' || isRefreshPending;

  function handleRefreshAll() {
    void fetchRealtimeSnapshot(false);
    startRefreshTransition(() => {
      router.refresh();
    });
  }

  async function triggerWatchdog() {
    setRunningWatchdog(true);
    setOpsNotice(null);
    try {
      const res = await fetch('/api/watchdog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeRecentForTest: true }),
      });
      const data = (await res.json()) as {
        checkedPending?: number;
        recoveredCount?: number;
        failedCount?: number;
        alertedCount?: number;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || 'Watchdog trigger failed.');
      const msg = `Payment Watchdog completed: ${data.checkedPending ?? 0} pending scanned, ${data.recoveredCount ?? 0} recovered to paid, ${data.failedCount ?? 0} marked failed, ${data.alertedCount ?? 0} alerts sent.`;
      setOpsNotice({ kind: 'success', text: msg });
      showToast(`Watchdog scanned ${data.checkedPending ?? 0} pending orders.`);
      void fetchRealtimeSnapshot(true);
    } catch (err) {
      const errMsg = `Watchdog error: ${err instanceof Error ? err.message : 'Failed to execute.'}`;
      setOpsNotice({ kind: 'error', text: errMsg });
      showToast(errMsg, 'error');
    } finally {
      setRunningWatchdog(false);
    }
  }

  async function triggerLifecycle() {
    setRunningLifecycle(true);
    setOpsNotice(null);
    try {
      const res = await fetch('/api/lifecycle', { method: 'POST' });
      const data = (await res.json()) as {
        unlockedScheduledCount?: number;
        expiredSitesCount?: number;
        cleanedDraftsCount?: number;
        purgedAssetsCount?: number;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || 'Lifecycle run failed.');
      const msg = `Lifecycle Sweep completed: ${data.unlockedScheduledCount ?? 0} scheduled unlocked, ${data.expiredSitesCount ?? 0} expired, ${data.cleanedDraftsCount ?? 0} stale drafts cleaned, ${data.purgedAssetsCount ?? 0} expired assets purged.`;
      setOpsNotice({ kind: 'success', text: msg });
      showToast('Lifecycle Sweep completed.');
      void fetchRealtimeSnapshot(true);
    } catch (err) {
      const errMsg = `Lifecycle error: ${err instanceof Error ? err.message : 'Failed to execute.'}`;
      setOpsNotice({ kind: 'error', text: errMsg });
      showToast(errMsg, 'error');
    } finally {
      setRunningLifecycle(false);
    }
  }

  async function handleQuickCopyLink(orderId: string, slug: string) {
    const cleanBase = config.webUrl.replace(/\/+$/, '');
    const fullUrl = `${cleanBase}/s/${slug}`;
    await navigator.clipboard.writeText(fullUrl).catch(() => {});
    setCopiedOrderId(orderId);
    showToast(`Copied ${fullUrl} to clipboard.`);
    setTimeout(() => setCopiedOrderId(null), 2000);
  }

  const studioBuildRows: StudioBuildRow[] = useMemo(
    () =>
      liveWaitlist.map((item) => {
        const raw = item as unknown as Partial<StudioBuildRow>;
        return {
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone || '',
          category: item.category || 'local_business',
          business_name: item.business_name || '',
          city: item.city || '',
          notes: item.notes || '',
          status: item.status || 'waitlisted',
          checklist: raw.checklist || null,
          preview_url: raw.preview_url || null,
          live_url: raw.live_url || null,
          quote_amount_inr: raw.quote_amount_inr ?? null,
          created_at: item.created_at,
        };
      }),
    [liveWaitlist],
  );

  const customRequestRows: CustomRequestRow[] = useMemo(
    () =>
      liveCustomRequests.map((item) => {
        const raw = item as unknown as Partial<CustomRequestRow>;
        return {
          id: item.id,
          requester_name: item.requester_name,
          requester_email: item.requester_email,
          requester_phone: item.requester_phone,
          occasion: item.occasion,
          budget_tier: item.budget_tier,
          target_date: item.target_date,
          brief: item.brief,
          status: item.status,
          quoted_amount_inr: item.quoted_amount_inr,
          admin_notes: item.admin_notes,
          checklist: raw.checklist || null,
          preview_url: raw.preview_url || null,
          live_url: raw.live_url || null,
          created_at: item.created_at,
        };
      }),
    [liveCustomRequests],
  );

  // Global Search Results across Orders, Sites, Users, and Studio Leads
  const globalSearchHits = useMemo(() => {
    const q = commandQuery.trim().toLowerCase();
    if (!q) return [];
    const hits: Array<{ key: string; title: string; subtitle: string; tab: DashboardTab; badge: string }> = [];

    liveSites.forEach((s) => {
      if (s.slug.toLowerCase().includes(q)) {
        hits.push({
          key: `site-${s.id}`,
          title: `/s/${s.slug}`,
          subtitle: `${s.status} · ${s.views_count} views`,
          tab: 'sites',
          badge: 'Site',
        });
      }
    });

    liveOrders.forEach((o) => {
      if (
        (o.buyer_name || '').toLowerCase().includes(q) ||
        (o.buyer_email || '').toLowerCase().includes(q) ||
        (o.invoice_no || '').toLowerCase().includes(q)
      ) {
        hits.push({
          key: `ord-${o.id}`,
          title: `${o.buyer_name || o.buyer_email} (${formatPaiseAsInr(o.amount_paise)})`,
          subtitle: `${o.invoice_no || o.id.slice(0, 8)} · ${o.status}`,
          tab: 'orders',
          badge: 'Order',
        });
      }
    });

    liveUsers.forEach((u) => {
      if (
        u.email.toLowerCase().includes(q) ||
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q)
      ) {
        hits.push({
          key: `usr-${u.id}`,
          title: u.full_name || u.email,
          subtitle: `${u.email} · ${u.ordersCount} paid`,
          tab: 'users',
          badge: 'User',
        });
      }
    });

    liveCustomRequests.forEach((cr) => {
      if (
        cr.requester_name.toLowerCase().includes(q) ||
        cr.requester_email.toLowerCase().includes(q)
      ) {
        hits.push({
          key: `cr-${cr.id}`,
          title: cr.requester_name,
          subtitle: `Custom ${cr.occasion} · ${cr.status}`,
          tab: 'studio',
          badge: 'Studio',
        });
      }
    });

    return hits.slice(0, 8);
  }, [commandQuery, liveSites, liveOrders, liveUsers, liveCustomRequests]);

  const filteredAudits = useMemo(() => {
    const q = logSearch.trim().toLowerCase();
    if (!q) return liveAudits;
    return liveAudits.filter(
      (row) =>
        row.action.toLowerCase().includes(q) ||
        row.entity.toLowerCase().includes(q) ||
        (row.entity_id || '').toLowerCase().includes(q),
    );
  }, [liveAudits, logSearch]);

  const filteredModLogs = useMemo(() => {
    const q = logSearch.trim().toLowerCase();
    if (!q) return liveModLogs;
    return liveModLogs.filter(
      (row) => row.what.toLowerCase().includes(q) || row.why.toLowerCase().includes(q),
    );
  }, [liveModLogs, logSearch]);

  const activeWaitlistLeadsCount = useMemo(
    () =>
      liveWaitlist.filter(
        (w) => !w.status || w.status === 'waitlisted' || w.status === 'in_progress',
      ).length,
    [liveWaitlist],
  );
  const activeStudioPipelineCount = liveCounts.newRequests + activeWaitlistLeadsCount;
  const totalStudioPipelineCount = liveCounts.waitlistCount + liveCustomRequests.length;

  const weddingSitesCount = liveSites.filter((s) => {
    const rel = s.theme_versions;
    const tid = Array.isArray(rel) ? rel[0]?.theme_id : rel?.theme_id;
    return Boolean(tid && tid.startsWith('wedding-'));
  }).length;

  const totalWeddingRsvps = useMemo(() => {
    return liveSites.reduce((sum, site) => {
      const rsvps = (site.content_json as Record<string, unknown> | null)?.rsvpResponses;
      return sum + (Array.isArray(rsvps) ? rsvps.length : 0);
    }, 0);
  }, [liveSites]);

  const netScopedRevenuePaise = Math.max(
    0,
    activeGrossRevenuePaise - activeGstPaise - activeGatewayFeePaise,
  );
  const viralViewsPerSite =
    liveCounts.liveSites > 0 ? (metrics.totalViewsCount / liveCounts.liveSites).toFixed(1) : '0.0';

  const navItems: Array<{
    id: DashboardTab;
    label: string;
    shortcut: string;
    badge?: number | string;
    tooltip?: string;
    alert?: boolean;
  }> = [
    { id: 'overview', label: 'Overview', shortcut: 'Alt+1' },
    { id: 'orders', label: 'Orders & GST', shortcut: 'Alt+2', badge: liveOrders.length },
    { id: 'sites', label: 'Live Sites & RSVPs', shortcut: 'Alt+3', badge: liveCounts.liveSites },
    { id: 'users', label: 'Users Directory', shortcut: 'Alt+4', badge: liveCounts.registeredUsers },
    {
      id: 'safety',
      label: 'Safety & Moderation',
      shortcut: 'Alt+5',
      badge: liveCounts.pendingSafety,
      alert: liveCounts.pendingSafety > 0,
    },
    {
      id: 'studio',
      label: 'Studio & Custom Pipeline',
      shortcut: 'Alt+6',
      badge: activeStudioPipelineCount,
      tooltip: `${activeStudioPipelineCount} active / unquoted (${totalStudioPipelineCount} total in pipeline)`,
      alert: liveCounts.newRequests > 0,
    },
    { id: 'logs', label: 'Audit & Ops Logs', shortcut: 'Alt+7', badge: liveCounts.audits },
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50/90 text-slate-900">
      {/* Top Executive Utility Header with Realtime Status + Global Quick-Jump */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
        <div className="h-0.5 w-full bg-slate-900" aria-hidden="true" />
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <a
              href={config.webUrl}
              className="group inline-flex min-h-[44px] shrink-0 items-center gap-2.5 font-heading text-xl font-bold tracking-tight text-slate-900 transition-transform active:scale-[0.98]"
              title="Open Webzy Storefront"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-webzy-primary text-base font-bold text-white shadow-xs transition-transform duration-200 group-hover:scale-105"
                aria-hidden="true"
              >
                w
              </span>
              <span className="font-heading tracking-tight">Webzy</span>
            </a>
            <div className="min-w-0 border-l border-slate-200/90 pl-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                  Operations Console
                </h1>

                {/* Realtime Status Pill */}
                <button
                  type="button"
                  onClick={() => setAutoSync((v) => !v)}
                  title="Click to pause or resume realtime database sync"
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition font-tabular ${
                    syncState === 'error'
                      ? 'border-red-200 bg-red-50 text-red-900 hover:bg-red-100'
                      : autoSync
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                        : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      syncState === 'error'
                        ? 'bg-red-600'
                        : autoSync
                          ? 'animate-pulse bg-emerald-600'
                          : 'bg-slate-400'
                    }`}
                  />
                  <span>
                    {syncState === 'syncing'
                      ? 'Syncing…'
                      : autoSync
                        ? `Realtime · ${secondsAgo}s ago`
                        : 'Paused'}
                  </span>
                </button>

                <span className="hidden sm:inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                  {config.appEnv}
                </span>
                <span
                  className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-semibold font-tabular ${
                    liveHealth.status === 'ok'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-amber-200 bg-amber-50 text-amber-900'
                  }`}
                >
                  DB: {liveHealth.status}
                  {typeof liveHealth.latencyMs === 'number' ? ` (${liveHealth.latencyMs}ms)` : ''}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[11px] text-slate-500">
                {requireMfa ? '2FA Verified · ' : ''}Signed in as{' '}
                <strong className="font-semibold text-slate-700">{sessionEmail}</strong>
              </p>
            </div>
          </div>

          {/* Global Quick-Jump Search Bar */}
          <div ref={commandBoxRef} className="relative order-3 w-full lg:order-2 lg:w-72">
            <input
              type="search"
              value={commandQuery}
              onFocus={() => setCommandOpen(true)}
              onChange={(e) => {
                setCommandQuery(e.target.value);
                setCommandOpen(true);
              }}
              placeholder="Quick jump: /s/slug, buyer, email..."
              className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
            />
            {commandOpen && commandQuery.trim().length > 0 ? (
              <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevation-3">
                {globalSearchHits.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-slate-500">
                    No matching orders, sites, or users.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100 text-xs">
                    {globalSearchHits.map((hit) => (
                      <li key={hit.key}>
                        <button
                          type="button"
                          onClick={() => {
                            selectTab(hit.tab);
                            setCommandQuery('');
                          }}
                          className="flex min-h-[44px] w-full items-center justify-between gap-2 px-3.5 py-2 text-left transition hover:bg-slate-50"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{hit.title}</p>
                            <p className="truncate text-[11px] text-slate-500">{hit.subtitle}</p>
                          </div>
                          <span className="shrink-0 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            {hit.badge}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>

          <div className="order-2 flex flex-wrap items-center gap-2 lg:order-3">
            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="btn-spring inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
            >
              <span>{isRefreshing ? 'Syncing…' : 'Sync Now'}</span>
            </button>

            <a
              href={config.webUrl}
              className="btn-spring inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              Storefront ↗
            </a>

            {config.appEnv !== 'production' ? (
              <Link
                href="/api/health"
                target="_blank"
                className="btn-spring hidden xl:inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                Health JSON
              </Link>
            ) : null}

            <AdminSignOutButton redirectTo={signOutRedirect} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Left Navigation Sidebar */}
        <aside className="min-w-0 lg:col-span-3">
          <nav
            aria-label="Admin sections"
            className="scrollbar-none flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-24 lg:flex-col lg:gap-1 lg:overflow-visible lg:rounded-2xl lg:border lg:border-slate-200/90 lg:bg-white lg:p-2.5 lg:shadow-xs"
          >
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.tooltip || `${item.label} (${item.shortcut})`}
                  onClick={() => selectTab(item.id)}
                  className={`flex min-h-[44px] shrink-0 items-center justify-between gap-2 rounded-xl px-3.5 py-2 text-left text-xs font-semibold transition ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'border border-slate-200/90 bg-white text-slate-700 lg:border-transparent hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  <span className="flex items-center gap-1.5">
                    {item.badge !== undefined ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-tabular ${
                          item.alert
                            ? 'bg-red-600 text-white'
                            : active
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                    <kbd
                      className={`kbd-hint hidden xl:inline-flex ${
                        active
                          ? '!border-white/25 !bg-white/15 !text-slate-100'
                          : '!border-slate-200 !bg-slate-50 !text-slate-500'
                      }`}
                    >
                      {item.shortcut}
                    </kbd>
                  </span>
                </button>
              );
            })}

            <div className="mt-2 hidden border-t border-slate-200/90 pt-3 lg:block">
              <p className="mb-2 px-1.5 text-[11px] font-medium text-slate-500 font-tabular">
                Pipeline: {activeStudioPipelineCount} active / {totalStudioPipelineCount} total
              </p>
              <a
                href="/api/export"
                download
                className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
              >
                Backup Snapshot (JSON)
              </a>
            </div>
          </nav>
        </aside>

        {/* Main Workspace Canvas */}
        <main className="min-w-0 space-y-6 lg:col-span-9">
          {opsNotice ? (
            <div
              role="status"
              className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold shadow-xs ${
                opsNotice.kind === 'error'
                  ? 'border-red-200 bg-red-50 text-red-900'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-950'
              }`}
            >
              <span>{opsNotice.text}</span>
              <button
                type="button"
                onClick={() => setOpsNotice(null)}
                className="inline-flex min-h-[44px] shrink-0 items-center px-2 underline"
              >
                Dismiss
              </button>
            </div>
          ) : null}

          {liveStatsError ? (
            <div
              role="alert"
              className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-950 shadow-xs"
            >
              Some database metrics could not be loaded right now. Check Supabase connectivity or pending SQL migrations.
            </div>
          ) : null}

          {(liveCounts.pendingSafety > 0 || liveCounts.newRequests > 0) && activeTab === 'overview' ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-xs text-amber-950 shadow-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Attention
                </span>
                {liveCounts.pendingSafety > 0 ? (
                  <span>
                    <strong className="font-tabular">{liveCounts.pendingSafety}</strong> safety report / takedown item(s) awaiting review.
                  </span>
                ) : null}
                {liveCounts.newRequests > 0 ? (
                  <span>
                    <strong className="font-tabular">{liveCounts.newRequests}</strong> new custom website brief(s) waiting for quote.
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {liveCounts.pendingSafety > 0 ? (
                  <button
                    type="button"
                    onClick={() => selectTab('safety')}
                    className="inline-flex min-h-[44px] items-center rounded-xl bg-red-600 px-3.5 text-xs font-semibold text-white transition hover:bg-red-700"
                  >
                    Open Safety Queue →
                  </button>
                ) : null}
                {liveCounts.newRequests > 0 ? (
                  <button
                    type="button"
                    onClick={() => selectTab('studio')}
                    className="inline-flex min-h-[44px] items-center rounded-xl bg-slate-900 px-3.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    Review Briefs →
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Executive KPI Grid */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-5">
                <button
                  type="button"
                  onClick={() => selectTab('orders')}
                  className="interactive-card flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-xs transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">Total Revenue</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 font-tabular">
                      INR · {metrics.combinedPaidOrdersCount} paid
                    </span>
                  </div>
                  <p className="mt-2 font-sans text-2xl font-bold tracking-tight text-slate-900 font-tabular">
                    {formatPaiseAsInr(liveCounts.totalRevenuePaise)}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 font-tabular">
                    Live: {formatPaiseAsInr(liveCounts.liveRevenuePaise)}
                    {liveCounts.testRevenuePaise > 0
                      ? ` · Test: ${formatPaiseAsInr(liveCounts.testRevenuePaise)}`
                      : ` · ${metrics.totalPayingCustomers || liveCounts.paidCustomers} buyers`}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => selectTab('sites')}
                  className="interactive-card flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-xs transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">
                      Live Sites &amp; RSVPs
                    </span>
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      Active
                    </span>
                  </div>
                  <p className="mt-2 font-sans text-2xl font-bold tracking-tight text-slate-900 font-tabular">
                    {liveCounts.liveSites}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 font-tabular">
                    {weddingSitesCount} weddings · {totalWeddingRsvps} RSVPs
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => selectTab('users')}
                  className="interactive-card flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-xs transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">Users</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      Profiles
                    </span>
                  </div>
                  <p className="mt-2 font-sans text-2xl font-bold tracking-tight text-slate-900 font-tabular">
                    {liveCounts.registeredUsers}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">Registered accounts</p>
                </button>

                <button
                  type="button"
                  onClick={() => selectTab('safety')}
                  className={`interactive-card flex flex-col justify-between rounded-2xl border p-4 text-left shadow-xs transition hover:shadow-sm ${
                    liveCounts.pendingSafety > 0
                      ? 'border-red-300 bg-red-50/40 hover:border-red-400'
                      : 'border-slate-200/90 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">Safety Queue</span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        liveCounts.pendingSafety > 0
                          ? 'bg-red-600 text-white'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {liveCounts.pendingSafety > 0 ? 'Action' : 'Clear'}
                    </span>
                  </div>
                  <p
                    className={`mt-2 font-sans text-2xl font-bold tracking-tight font-tabular ${
                      liveCounts.pendingSafety > 0 ? 'text-red-700' : 'text-emerald-700'
                    }`}
                  >
                    {liveCounts.pendingSafety}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">Reports &amp; takedowns</p>
                </button>

                <button
                  type="button"
                  onClick={() => selectTab('studio')}
                  className="interactive-card flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-xs transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">
                      Studio Pipeline
                    </span>
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 font-tabular">
                      {activeStudioPipelineCount} Active
                    </span>
                  </div>
                  <p className="mt-2 font-sans text-2xl font-bold tracking-tight text-slate-900 font-tabular">
                    {totalStudioPipelineCount}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 font-tabular">
                    {liveCounts.waitlistCount} Studio · {liveCustomRequests.length} Briefs
                  </p>
                </button>
              </div>

              {/* CEO Unit Economics, Add-On Attach Rate & Conversion Funnel Strip */}
              <section className="animate-slide-up rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/90 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Founder &amp; CEO Executive Intelligence
                    </span>
                    <h2 className="mt-0.5 font-heading text-base font-bold text-slate-900">
                      Unit Economics, Add-On Attach Rate &amp; Viral Conversion Funnel
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setRevenueScope('all')}
                        className={`min-h-[44px] rounded-lg px-3 transition font-tabular ${
                          revenueScope === 'all'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All ({metrics.combinedPaidOrdersCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setRevenueScope('live')}
                        className={`min-h-[44px] rounded-lg px-3 transition font-tabular ${
                          revenueScope === 'live'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Live ({metrics.livePaidOrdersCount})
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-600">
                        {revenueScope === 'all' ? 'Net Total Revenue & AOV' : 'Net Live Revenue & AOV'}
                      </span>
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-900 font-tabular">
                        AOV {formatPaiseAsInr(activeAovPaise)}
                      </span>
                    </div>
                    <p className="mt-2 font-sans text-xl font-bold tracking-tight text-slate-900 font-tabular">
                      {formatPaiseAsInr(netScopedRevenuePaise)}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600 font-tabular">
                      Net after 18% GST ({formatPaiseAsInr(activeGstPaise)}) &amp; Gateway ({formatPaiseAsInr(activeGatewayFeePaise)})
                    </p>
                    <p className="mt-1.5 text-[10px] font-medium text-slate-500 font-tabular">
                      Refunded: {metrics.refundedLiveCount} order(s) ({formatPaiseAsInr(metrics.refundedLivePaise)})
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-600">
                        Add-On Attach Rate
                      </span>
                      <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-800 font-tabular">
                        {activeAddonStats.attachRatePct}% Attach
                      </span>
                    </div>
                    <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full border border-slate-200 bg-white">
                      <div
                        className="animate-shimmer h-full rounded-full bg-slate-900 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(4, activeAddonStats.attachRatePct))}%` }}
                      />
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px] font-semibold font-tabular">
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-slate-700">
                        Secret PIN: {activeAddonStats.pinCount}
                      </span>
                      <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-900">
                        Video Export: {activeAddonStats.videoCount}
                      </span>
                      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-900">
                        Extended Validity: {activeAddonStats.extendCount}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-600">
                        Conversion &amp; Viral K-Factor
                      </span>
                      <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-800 font-tabular">
                        {viralViewsPerSite} views/site
                      </span>
                    </div>
                    <div className="mt-2.5 grid grid-cols-4 gap-1 text-center font-tabular">
                      <div className="rounded-lg border border-slate-200 bg-white p-1.5">
                        <p className="font-sans text-xs font-bold text-slate-900">
                          {metrics.activeDraftsCount}
                        </p>
                        <p className="text-[9px] text-slate-500">Drafts</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-1.5">
                        <p className="font-sans text-xs font-bold text-slate-900">
                          {activePaidOrdersCount}
                        </p>
                        <p className="text-[9px] text-slate-500">Orders</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-1.5">
                        <p className="font-sans text-xs font-bold text-slate-900">
                          {liveCounts.liveSites}
                        </p>
                        <p className="text-[9px] text-slate-500">Live</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-1.5">
                        <p className="font-sans text-xs font-bold text-emerald-700">
                          {metrics.totalViewsCount}
                        </p>
                        <p className="text-[9px] text-slate-500">Views</p>
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-500">
                      Drafts → Paid Orders → Live Sites → Guest Views
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-600">
                        B2B &amp; Custom Studio Pipeline
                      </span>
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                        Quoted Value
                      </span>
                    </div>
                    <p className="mt-2 font-sans text-xl font-bold tracking-tight text-slate-900 font-tabular">
                      {formatInr(metrics.pipelineQuotedInr)}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600 font-tabular">
                      {activeStudioPipelineCount} active / unquoted leads · {totalStudioPipelineCount} total briefs
                    </p>
                    <button
                      type="button"
                      onClick={() => selectTab('studio')}
                      className="mt-2 inline-flex min-h-[44px] items-center text-xs font-semibold text-slate-900 underline-offset-2 hover:underline"
                    >
                      Open Studio Pipeline →
                    </button>
                  </div>
                </div>
              </section>

              {/* Operations Control Center */}
              <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-heading text-base font-bold text-slate-900">
                      Automated Maintenance &amp; Reconciliation
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Run payment recovery, unlock scheduled surprises, expire finished links, and export backups.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <button
                    type="button"
                    onClick={triggerWatchdog}
                    disabled={runningWatchdog}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {runningWatchdog ? 'Scanning Pending Orders…' : 'Run Payment Watchdog'}
                  </button>

                  <button
                    type="button"
                    onClick={triggerLifecycle}
                    disabled={runningLifecycle}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-800 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {runningLifecycle ? 'Running Sweep…' : 'Run Lifecycle Sweep'}
                  </button>

                  <a
                    href="/api/export/orders?liveOnly=true"
                    download
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100"
                  >
                    Download Live Orders CSV
                  </a>

                  <a
                    href="/api/export"
                    download
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-800 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Download JSON Snapshot
                  </a>
                </div>
              </section>

              {/* Split Activity Feed */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading text-base font-bold text-slate-900">
                      Latest Customer Orders
                    </h3>
                    <button
                      type="button"
                      onClick={() => selectTab('orders')}
                      className="inline-flex min-h-[44px] items-center px-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline font-tabular"
                    >
                      View All ({liveOrders.length}) →
                    </button>
                  </div>

                  {liveOrders.length === 0 ? (
                    <p className="mt-4 text-xs text-slate-500">No orders recorded yet.</p>
                  ) : (
                    <div className="mt-3 divide-y divide-slate-100">
                      {liveOrders.slice(0, 6).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between gap-3 py-3 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="truncate font-semibold text-slate-900">
                                {order.buyer_name || 'Guest'}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                  order.status === 'paid' || order.status === 'published'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : order.status === 'refunded'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {order.status}
                              </span>
                              {order.is_test ? (
                                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-700">
                                  TEST
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-0.5 truncate text-[11px] text-slate-500 font-tabular">
                              {order.buyer_email} · {order.invoice_no || order.id.slice(0, 8)}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="font-sans text-sm font-bold text-slate-900 font-tabular">
                              {formatPaiseAsInr(order.amount_paise)}
                            </p>
                            {order.site_slug ? (
                              <button
                                type="button"
                                onClick={() => handleQuickCopyLink(order.id, order.site_slug!)}
                                className="mt-0.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700 transition hover:bg-slate-100"
                              >
                                {copiedOrderId === order.id ? 'Copied' : `/s/${order.site_slug}`}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading text-base font-bold text-slate-900">
                      Recent Audit Trail
                    </h3>
                    <button
                      type="button"
                      onClick={() => selectTab('logs')}
                      className="inline-flex min-h-[44px] items-center px-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline font-tabular"
                    >
                      View All ({liveCounts.audits}) →
                    </button>
                  </div>

                  {liveAudits.length === 0 ? (
                    <p className="mt-4 text-xs text-slate-500">No audit events recorded yet.</p>
                  ) : (
                    <div className="mt-3 divide-y divide-slate-100">
                      {liveAudits.slice(0, 6).map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start justify-between gap-3 py-3 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-mono text-[11px] font-semibold text-slate-900">
                              {log.action}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {log.entity}
                              {log.entity_id ? ` · ${log.entity_id.slice(0, 10)}` : ''}
                            </p>
                          </div>
                          <span
                            suppressHydrationWarning
                            className="shrink-0 text-[11px] text-slate-500 font-tabular"
                          >
                            {formatIstTimestamp(log.at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <AdminOrdersClient orders={liveOrders} webUrl={config.webUrl} />
          )}

          {activeTab === 'sites' && (
            <AdminSitesClient initialSites={liveSites} webUrl={config.webUrl} />
          )}

          {activeTab === 'users' && <AdminUsersClient initialUsers={liveUsers} />}

          {activeTab === 'safety' && (
            <AdminModerationClient
              reports={liveReports}
              takedowns={liveTakedowns}
              webUrl={config.webUrl}
            />
          )}

          {activeTab === 'studio' && (
            <AdminCustomBuildsClient
              studioLeads={studioBuildRows}
              customRequests={customRequestRows}
            />
          )}

          {activeTab === 'logs' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-900">
                    Security Audit &amp; Moderation Logs
                  </h2>
                  <p className="text-xs text-slate-500">
                    Filter immutable operational actions, refunds, takedowns, and admin updates.
                  </p>
                </div>
                <input
                  type="search"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Filter by action, entity, or reason..."
                  className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white sm:w-72"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                  <h3 className="font-heading text-base font-bold text-slate-900 font-tabular">
                    Moderation Log ({filteredModLogs.length})
                  </h3>
                  {filteredModLogs.length === 0 ? (
                    <p className="mt-4 text-xs text-slate-500">No matching moderation actions.</p>
                  ) : (
                    <ul className="mt-4 divide-y divide-slate-100 text-xs">
                      {filteredModLogs.map((row) => (
                        <li key={row.id} className="py-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[11px] font-semibold text-slate-900">
                              {row.what}
                            </span>
                            <span
                              suppressHydrationWarning
                              className="text-[10px] text-slate-500 font-tabular"
                            >
                              {formatIstTimestamp(row.when_at)}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-600">{row.why}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                  <h3 className="font-heading text-base font-bold text-slate-900 font-tabular">
                    Audit Log Trail ({filteredAudits.length})
                  </h3>
                  {filteredAudits.length === 0 ? (
                    <p className="mt-4 text-xs text-slate-500">No matching audit events.</p>
                  ) : (
                    <ul className="mt-4 divide-y divide-slate-100 text-xs">
                      {filteredAudits.map((row) => (
                        <li key={row.id} className="py-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[11px] font-semibold text-slate-900">
                              {row.action}
                            </span>
                            <span
                              suppressHydrationWarning
                              className="text-[10px] text-slate-500 font-tabular"
                            >
                              {formatIstTimestamp(row.at)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-600">
                            Entity: <strong className="text-slate-800">{row.entity}</strong>
                            {row.entity_id ? ` · ID: ${row.entity_id}` : ''}
                          </p>
                          {row.meta && Object.keys(row.meta).length > 0 ? (
                            <pre className="mt-1.5 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-2 font-mono text-[10px] text-slate-700">
                              {JSON.stringify(row.meta)}
                            </pre>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Toast Notification Banner */}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={`toast-enter fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold shadow-elevation-3 ${
            toast.kind === 'error'
              ? 'border-red-400/50 bg-red-950 text-white'
              : 'border-slate-700 bg-slate-900 text-white'
          }`}
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              toast.kind === 'error' ? 'bg-red-400' : 'bg-emerald-400'
            }`}
          />
          <span className="leading-snug">{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-1 shrink-0 rounded px-1.5 py-0.5 text-[10px] text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Esc
          </button>
        </div>
      ) : null}
    </div>
  );
}
