'use client';

import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { formatPaiseAsInr } from '@webzy/core';

export interface AdminOrderRow {
  id: string;
  status: string;
  amount_paise: number;
  invoice_no: string | null;
  buyer_name: string;
  buyer_email: string;
  provider: string;
  created_at: string;
  site_slug?: string | null;
}

interface AdminOrdersClientProps {
  orders: AdminOrderRow[];
  webUrl?: string;
}

export function AdminOrdersClient({ orders, webUrl = 'http://localhost:3000' }: AdminOrdersClientProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copyFeedbackId, setCopyFeedbackId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  async function handleCopyLink(orderId: string, slug: string) {
    const cleanBase = webUrl.replace(/\/+$/, '');
    const fullUrl = `${cleanBase}/s/${slug}`;
    await navigator.clipboard.writeText(fullUrl).catch(() => {});
    setCopyFeedbackId(orderId);
    setTimeout(() => setCopyFeedbackId(null), 2500);
  }

  async function handleRefund(orderId: string) {
    setBusyId(orderId);
    setStatusMsg('');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Admin full refund issued within test/policy workflow',
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        error?: string;
        providerRefundId?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Refund failed.');
      }
      setStatusMsg(data.message || 'Refund processed.');
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Refund error.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleRunWatchdog() {
    setBusyId('watchdog');
    setStatusMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/watchdog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeRecentForTest: true }),
      });
      const data = (await res.json()) as {
        recoveredCount?: number;
        alertedCount?: number;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || 'Watchdog failed.');
      setStatusMsg(
        `Watchdog ran: recovered=${data.recoveredCount ?? 0}, alertsSent=${data.alertedCount ?? 0}.`,
      );
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Watchdog error.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleRunLifecycle() {
    setBusyId('lifecycle');
    setStatusMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/lifecycle', { method: 'POST' });
      const data = (await res.json()) as {
        unlockedScheduledCount?: number;
        expiredSitesCount?: number;
        cleanedDraftsCount?: number;
        purgedAssetsCount?: number;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || 'Lifecycle cleanup failed.');
      setStatusMsg(
        `Lifecycle ran: unlocked=${data.unlockedScheduledCount ?? 0}, expired=${data.expiredSitesCount ?? 0}, draftsCleaned=${data.cleanedDraftsCount ?? 0}, assetsPurged=${data.purgedAssetsCount ?? 0}.`,
      );
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lifecycle cleanup error.');
    } finally {
      setBusyId(null);
    }
  }

  // Filter orders by search query and status
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((ord) => {
      // Status filter
      if (filterStatus === 'paid_published') {
        if (ord.status !== 'paid' && ord.status !== 'published') return false;
      } else if (filterStatus === 'refunded') {
        if (ord.status !== 'refunded' && ord.status !== 'partially_refunded') return false;
      } else if (filterStatus === 'pending_failed') {
        if (ord.status !== 'payment_pending' && ord.status !== 'failed' && ord.status !== 'draft') return false;
      }

      // Search filter
      if (!q) return true;
      const matchName = (ord.buyer_name || '').toLowerCase().includes(q);
      const matchEmail = (ord.buyer_email || '').toLowerCase().includes(q);
      const matchInvoice = (ord.invoice_no || '').toLowerCase().includes(q);
      const matchId = ord.id.toLowerCase().includes(q);
      const matchSlug = (ord.site_slug || '').toLowerCase().includes(q);
      const matchProvider = (ord.provider || '').toLowerCase().includes(q);

      return matchName || matchEmail || matchInvoice || matchId || matchSlug || matchProvider;
    });
  }, [orders, searchQuery, filterStatus]);

  const paidCount = orders.filter((o) => o.status === 'paid' || o.status === 'published').length;
  const refundedCount = orders.filter((o) => o.status === 'refunded').length;

  return (
    <section className="mt-8 rounded-3xl border border-webzy-tint bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-webzy-ink">
            Orders, GST Accounting &amp; Link Delivery
          </h2>
          <p className="text-xs text-webzy-ink/65">
            Search orders, copy live links for customers, issue single-click refunds, or export CSV for GST filing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export for Indian Accountants / GST Filing */}
          <a
            href="/api/export/orders"
            download
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-4 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export Orders CSV</span>
          </a>

          <button
            suppressHydrationWarning
            type="button"
            disabled={busyId === 'lifecycle'}
            onClick={handleRunLifecycle}
            className="inline-flex min-h-[40px] items-center rounded-full border border-webzy-tint bg-webzy-surface px-4 text-xs font-bold text-webzy-ink disabled:opacity-50"
          >
            {busyId === 'lifecycle' ? 'Cleaning...' : 'Run Lifecycle'}
          </button>
          <button
            suppressHydrationWarning
            type="button"
            disabled={busyId === 'watchdog'}
            onClick={handleRunWatchdog}
            className="inline-flex min-h-[40px] items-center rounded-full bg-webzy-ink px-4 text-xs font-bold text-white disabled:opacity-50"
          >
            {busyId === 'watchdog' ? 'Checking...' : 'Run Watchdog'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {statusMsg ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-950">
          {statusMsg}
        </div>
      ) : null}

      {errorMsg ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900"
        >
          {errorMsg}
        </div>
      ) : null}

      {/* Search & Status Filters */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-webzy-tint/60 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`min-h-[32px] rounded-full px-3 text-xs font-bold transition ${
              filterStatus === 'all'
                ? 'bg-webzy-ink text-white'
                : 'border border-webzy-tint bg-webzy-surface text-webzy-ink'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setFilterStatus('paid_published')}
            className={`min-h-[32px] rounded-full px-3 text-xs font-bold transition ${
              filterStatus === 'paid_published'
                ? 'bg-emerald-700 text-white'
                : 'border border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            Paid &amp; Live ({paidCount})
          </button>
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setFilterStatus('refunded')}
            className={`min-h-[32px] rounded-full px-3 text-xs font-bold transition ${
              filterStatus === 'refunded'
                ? 'bg-red-700 text-white'
                : 'border border-red-200 bg-red-50 text-red-800'
            }`}
          >
            Refunded ({refundedCount})
          </button>
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setFilterStatus('pending_failed')}
            className={`min-h-[32px] rounded-full px-3 text-xs font-bold transition ${
              filterStatus === 'pending_failed'
                ? 'bg-amber-700 text-white'
                : 'border border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            Pending / Failed
          </button>
        </div>

        <div className="w-full sm:w-auto">
          <input
            suppressHydrationWarning
            type="search"
            placeholder="Search buyer name, email, invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-[36px] w-full rounded-xl border border-webzy-tint bg-webzy-surface px-3.5 text-xs text-webzy-ink outline-none sm:w-64"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <p className="mt-6 text-center text-xs font-semibold text-webzy-ink/60">
          {searchQuery ? 'No orders match your search query.' : 'No orders in this status category.'}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {filteredOrders.map((ord) => {
            const isLive = ord.status === 'paid' || ord.status === 'published';
            const cleanBase = webUrl.replace(/\/+$/, '');
            const liveUrl = ord.site_slug ? `${cleanBase}/s/${ord.site_slug}` : null;

            return (
              <div
                key={ord.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-webzy-tint bg-webzy-surface/40 p-4 text-xs transition hover:border-webzy-primary/40 hover:bg-white"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-webzy-ink">
                      {ord.invoice_no || `Order ${ord.id.slice(0, 8)}`}
                    </span>
                    <span className="font-heading text-sm font-extrabold text-emerald-700">
                      {formatPaiseAsInr(ord.amount_paise)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        isLive
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : ord.status === 'refunded'
                            ? 'bg-red-100 text-red-900 border border-red-200'
                            : 'bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                    <span className="text-[10px] text-webzy-ink/50 uppercase tracking-wider">
                      via {ord.provider}
                    </span>
                  </div>

                  <p className="mt-1 text-webzy-ink/80">
                    <strong className="text-webzy-ink">{ord.buyer_name || 'Guest'}</strong> ·{' '}
                    <span>{ord.buyer_email || 'No email'}</span> ·{' '}
                    <span suppressHydrationWarning className="text-webzy-ink/60">
                      {ord.created_at ? ord.created_at.slice(0, 16).replace('T', ' ') : ''}
                    </span>
                  </p>

                  {ord.site_slug ? (
                    <p className="mt-1 font-mono text-[11px] text-webzy-primary">
                      /s/{ord.site_slug}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Copy Link & Visit Webzy actions */}
                  {ord.site_slug && liveUrl ? (
                    <>
                      <button
                        suppressHydrationWarning
                        type="button"
                        onClick={() => handleCopyLink(ord.id, ord.site_slug!)}
                        className="inline-flex min-h-[36px] items-center rounded-full border border-webzy-tint bg-white px-3.5 text-xs font-bold text-webzy-ink transition hover:border-webzy-primary hover:text-webzy-primary"
                      >
                        {copyFeedbackId === ord.id ? '✓ Link copied' : 'Copy Link'}
                      </button>
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-[36px] items-center rounded-full border border-webzy-tint bg-webzy-surface px-3 text-xs font-bold text-webzy-primary hover:bg-webzy-tint"
                      >
                        Visit ↗
                      </a>
                    </>
                  ) : null}

                  {/* Refund action */}
                  {isLive ? (
                    <button
                      suppressHydrationWarning
                      type="button"
                      disabled={busyId === ord.id}
                      onClick={() => handleRefund(ord.id)}
                      className="inline-flex min-h-[36px] items-center rounded-full bg-red-600 px-3.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                    >
                      {busyId === ord.id ? 'Refunding...' : 'Refund'}
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-webzy-ink/50">
                      {ord.status === 'refunded' ? 'Refunded' : ord.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
