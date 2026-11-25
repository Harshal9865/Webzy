'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { formatPaiseAsInr } from '@webzy/core';

export interface AdminOrderRow {
  id: string;
  status: string;
  amount_paise: number;
  invoice_no: string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string | null;
  addons_json?: Record<string, boolean> | string[] | null;
  provider: string;
  is_test?: boolean;
  created_at: string;
  site_slug?: string | null;
}

interface AdminOrdersClientProps {
  orders: AdminOrderRow[];
  webUrl?: string;
}

type OrderSort = 'newest' | 'amount_desc' | 'amount_asc' | 'buyer_asc';

const REFUND_PRESETS = [
  'Customer requested cancellation before sharing',
  'Duplicate payment made by customer',
  'Technical issue during order fulfillment',
] as const;

function sanitizePhoneForWa(phone?: string | null): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return digits;
  return digits;
}

function formatIst(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    }).format(d);
  } catch {
    return iso;
  }
}

function parseOrderAddons(raw?: Record<string, boolean> | string[] | null) {
  const isArr = Array.isArray(raw);
  const validityLabel = isArr
    ? raw.includes('extend') || raw.includes('extendValidity90d')
      ? '3m (90d) Validity'
      : raw.includes('extend_21d')
        ? '21d Validity'
        : raw.includes('extend_14d')
          ? '14d Validity'
          : null
    : raw?.extendValidity90d || raw?.extend
      ? '3m (90d) Validity'
      : raw?.extend21d
        ? '21d Validity'
        : raw?.extend14d
          ? '14d Validity'
          : null;

  return {
    hasPin: isArr
      ? raw.includes('pin') || raw.includes('secretPin')
      : Boolean(raw?.secretPin || raw?.pin),
    hasVideo: isArr
      ? raw.includes('video') || raw.includes('videoCard')
      : Boolean(raw?.videoCard || raw?.video),
    validityLabel,
  };
}

export function AdminOrdersClient({ orders, webUrl = 'http://localhost:3000' }: AdminOrdersClientProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copyFeedbackId, setCopyFeedbackId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<'all' | 'live' | 'test'>('all');
  const [sortBy, setSortBy] = useState<OrderSort>('newest');

  // Safe Refund Confirmation Modal state
  const [refundTarget, setRefundTarget] = useState<AdminOrderRow | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    if (!refundTarget) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setRefundTarget(null);
        setModalError('');
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [refundTarget]);

  async function handleCopyText(feedbackKey: string, value: string) {
    await navigator.clipboard.writeText(value).catch(() => {});
    setCopyFeedbackId(feedbackKey);
    setTimeout(() => setCopyFeedbackId(null), 2200);
  }

  async function handleCopyLink(orderId: string, slug: string) {
    const cleanBase = webUrl.replace(/\/+$/, '');
    const fullUrl = `${cleanBase}/s/${slug}`;
    await handleCopyText(`link:${orderId}`, fullUrl);
  }

  async function handleConfirmRefund(e: React.FormEvent) {
    e.preventDefault();
    if (!refundTarget) return;
    const trimmedReason = refundReason.trim();
    if (trimmedReason.length < 5) {
      const msg = 'Please enter a refund reason (at least 5 characters) for the audit log.';
      setModalError(msg);
      setErrorMsg(msg);
      return;
    }

    setBusyId(refundTarget.id);
    setStatusMsg('');
    setErrorMsg('');
    setModalError('');

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(refundTarget.id)}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: trimmedReason }),
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
      setRefundTarget(null);
      setRefundReason('');
      setModalError('');
      window.dispatchEvent(new Event('webzy_admin_mutated'));
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Refund error.';
      setModalError(msg);
      setErrorMsg(msg);
    } finally {
      setBusyId(null);
    }
  }

  const modeFilteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (modeFilter === 'live' && ord.is_test) return false;
      if (modeFilter === 'test' && !ord.is_test) return false;
      return true;
    });
  }, [orders, modeFilter]);

  const paidOrders = useMemo(
    () => modeFilteredOrders.filter((o) => o.status === 'paid' || o.status === 'published'),
    [modeFilteredOrders],
  );
  const refundedOrders = useMemo(
    () =>
      modeFilteredOrders.filter(
        (o) => o.status === 'refunded' || o.status === 'partially_refunded',
      ),
    [modeFilteredOrders],
  );
  const pendingCount = useMemo(
    () =>
      modeFilteredOrders.filter(
        (o) =>
          o.status === 'payment_pending' || o.status === 'failed' || o.status === 'draft',
      ).length,
    [modeFilteredOrders],
  );
  const testCount = useMemo(() => orders.filter((o) => o.is_test).length, [orders]);

  const ledgerSummary = useMemo(() => {
    let grossPaise = 0;
    let liveGrossPaise = 0;
    let testGrossPaise = 0;
    let addonAttached = 0;

    for (const o of paidOrders) {
      const amt = o.amount_paise || 0;
      grossPaise += amt;
      if (o.is_test) {
        testGrossPaise += amt;
      } else {
        liveGrossPaise += amt;
      }
      const { hasPin, hasVideo, validityLabel } = parseOrderAddons(o.addons_json);
      if (hasPin || hasVideo || Boolean(validityLabel)) addonAttached += 1;
    }

    const refundedPaise = refundedOrders.reduce((s, o) => s + (o.amount_paise || 0), 0);
    const taxablePaise = Math.round(grossPaise / 1.18);
    const gstPaise = grossPaise - taxablePaise;
    const aovPaise = paidOrders.length > 0 ? Math.round(grossPaise / paidOrders.length) : 0;

    return {
      grossPaise,
      liveGrossPaise,
      testGrossPaise,
      taxablePaise,
      gstPaise,
      aovPaise,
      addonAttached,
      refundedPaise,
    };
  }, [paidOrders, refundedOrders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = modeFilteredOrders.filter((ord) => {
      if (filterStatus === 'paid_published') {
        if (ord.status !== 'paid' && ord.status !== 'published') return false;
      } else if (filterStatus === 'refunded') {
        if (ord.status !== 'refunded' && ord.status !== 'partially_refunded') return false;
      } else if (filterStatus === 'pending_failed') {
        if (ord.status !== 'payment_pending' && ord.status !== 'failed' && ord.status !== 'draft') {
          return false;
        }
      }

      if (!q) return true;
      return (
        (ord.buyer_name || '').toLowerCase().includes(q) ||
        (ord.buyer_email || '').toLowerCase().includes(q) ||
        (ord.buyer_phone || '').toLowerCase().includes(q) ||
        (ord.invoice_no || '').toLowerCase().includes(q) ||
        ord.id.toLowerCase().includes(q) ||
        (ord.site_slug || '').toLowerCase().includes(q) ||
        (ord.provider || '').toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'amount_desc') return (b.amount_paise || 0) - (a.amount_paise || 0);
      if (sortBy === 'amount_asc') return (a.amount_paise || 0) - (b.amount_paise || 0);
      if (sortBy === 'buyer_asc') return (a.buyer_name || '').localeCompare(b.buyer_name || '');
      return Date.parse(b.created_at) - Date.parse(a.created_at);
    });
  }, [modeFilteredOrders, searchQuery, filterStatus, sortBy]);

  return (
    <div className="space-y-5 font-sans text-webzy-ink animate-fade-in">
      {/* Colored Executive Financial & Tax Strip */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="interactive-card rounded-2xl border border-webzy-primary/25 bg-gradient-to-br from-webzy-surface via-white to-white p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-webzy-ink/75">Settled Revenue</p>
            <span className="rounded-full bg-webzy-tint px-2 py-0.5 text-[10px] font-bold text-webzy-primary">
              {paidOrders.length} Paid
            </span>
          </div>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-webzy-primary font-tabular">
            {formatPaiseAsInr(ledgerSummary.grossPaise)}
          </p>
          <p className="mt-1 text-xs text-webzy-ink/65 font-tabular">
            Live: <strong className="text-emerald-700">{formatPaiseAsInr(ledgerSummary.liveGrossPaise)}</strong> · Test:{' '}
            <strong className="text-amber-800">{formatPaiseAsInr(ledgerSummary.testGrossPaise)}</strong>
          </p>
        </div>

        <div className="interactive-card rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50/75 via-white to-white p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-sky-950/80">Taxable Base</p>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
              SAC 998314
            </span>
          </div>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-sky-900 font-tabular">
            {formatPaiseAsInr(ledgerSummary.taxablePaise)}
          </p>
          <p className="mt-1 text-xs text-sky-900/70 font-tabular">
            18% GST Included: <strong>{formatPaiseAsInr(ledgerSummary.gstPaise)}</strong>
          </p>
        </div>

        <div className="interactive-card rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/75 via-white to-white p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-indigo-950/80">Average Order Value</p>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
              AOV
            </span>
          </div>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-indigo-900 font-tabular">
            {formatPaiseAsInr(ledgerSummary.aovPaise)}
          </p>
          <p className="mt-1 text-xs text-indigo-900/70 font-tabular">
            {ledgerSummary.addonAttached} order(s) with add-ons
          </p>
        </div>

        <div className="interactive-card rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-white p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-amber-950/80">Refunds &amp; Pending</p>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
              {refundedOrders.length} Refunded
            </span>
          </div>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-amber-900 font-tabular">
            {formatPaiseAsInr(ledgerSummary.refundedPaise)}
          </p>
          <p className="mt-1 text-xs text-amber-950/70 font-tabular">
            {pendingCount} pending / failed checkout(s)
          </p>
        </div>
      </div>

      {/* Branded Orders & GST Ledger Container */}
      <section className="rounded-3xl border border-webzy-tint bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-webzy-primary">
              Revenue &amp; Tax Reconciliation
            </span>
            <h2 className="mt-0.5 text-xl font-bold tracking-tight text-webzy-ink">
              Orders &amp; GST Ledger
            </h2>
            <p className="mt-0.5 text-xs text-webzy-ink/70">
              Review customer purchases, GST splits, share links, WhatsApp outreach, and audited refunds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/export/orders?liveOnly=true"
              download
              className="btn-spring inline-flex min-h-[38px] items-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
            >
              Export Live CSV (GST)
            </a>
            <a
              href="/api/export/orders"
              download
              className="btn-spring inline-flex min-h-[38px] items-center rounded-xl border border-webzy-tint bg-webzy-surface px-4 text-xs font-bold text-webzy-ink hover:border-webzy-primary/40 hover:bg-webzy-tint/60"
            >
              Export All CSV
            </a>
          </div>
        </div>

        {statusMsg ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-950 animate-fade-in">
            {statusMsg}
          </div>
        ) : null}

        {errorMsg ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900 animate-fade-in"
          >
            {errorMsg}
          </div>
        ) : null}

        {/* Search, Mode & Filter Bar */}
        <div className="mt-5 flex flex-col gap-3 border-y border-webzy-tint/75 py-3.5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: `All (${modeFilteredOrders.length})` },
                { id: 'paid_published', label: `Paid & Live (${paidOrders.length})` },
                { id: 'refunded', label: `Refunded (${refundedOrders.length})` },
                { id: 'pending_failed', label: `Pending / Failed (${pendingCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                suppressHydrationWarning
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`min-h-[34px] rounded-full px-3.5 text-xs font-bold transition active:scale-95 ${
                  filterStatus === tab.id
                    ? 'bg-webzy-primary text-white shadow-btn-primary'
                    : 'border border-webzy-tint bg-webzy-surface/80 text-webzy-ink hover:border-webzy-primary/45 hover:bg-webzy-tint/50'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <div className="inline-flex rounded-full border border-webzy-tint bg-webzy-surface/80 p-0.5 text-xs font-bold">
              {(
                [
                  { id: 'all', label: `All (${orders.length})` },
                  { id: 'live', label: `Live (${orders.length - testCount})` },
                  { id: 'test', label: `Test (${testCount})` },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModeFilter(m.id)}
                  className={`rounded-full px-3 py-1 transition ${
                    modeFilter === m.id
                      ? m.id === 'live'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : m.id === 'test'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-webzy-ink text-white shadow-xs'
                      : 'text-webzy-ink/70 hover:text-webzy-ink'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Sort ledger"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as OrderSort)}
              className="min-h-[38px] rounded-xl border border-webzy-tint bg-webzy-surface/75 px-3 text-xs font-bold text-webzy-ink outline-none focus:border-webzy-primary focus:bg-white"
            >
              <option value="newest">Recent First</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
              <option value="buyer_asc">Buyer: A to Z</option>
            </select>

            <input
              suppressHydrationWarning
              type="search"
              placeholder="Search buyer, email, invoice, slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-[38px] w-full rounded-xl border border-webzy-tint bg-webzy-surface/75 px-3.5 text-xs text-webzy-ink placeholder:text-webzy-ink/45 outline-none focus:border-webzy-primary focus:bg-white sm:w-64"
            />
          </div>
        </div>

        {/* Branded Structured Ledger Cards */}
        {filteredOrders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-webzy-tint bg-webzy-surface/50 p-8 text-center">
            <p className="text-sm font-bold text-webzy-ink">
              {searchQuery ? 'No orders match your search query.' : 'No orders in this filter.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setModeFilter('all');
              }}
              className="mt-3 rounded-xl border border-webzy-tint bg-white px-4 py-1.5 text-xs font-bold text-webzy-primary hover:border-webzy-primary"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3.5">
            {filteredOrders.map((ord) => {
              const isLive = ord.status === 'paid' || ord.status === 'published';
              const isRefunded =
                ord.status === 'refunded' || ord.status === 'partially_refunded';
              const cleanBase = webUrl.replace(/\/+$/, '');
              const liveUrl = ord.site_slug ? `${cleanBase}/s/${ord.site_slug}` : null;
              const { hasPin, hasVideo, validityLabel } = parseOrderAddons(ord.addons_json);
              const addonList = [
                hasPin ? 'PIN Lock' : null,
                hasVideo ? 'Status Video' : null,
                validityLabel,
              ]
                .filter(Boolean)
                .join(' · ');

              const waPhone = sanitizePhoneForWa(ord.buyer_phone);
              const waText = encodeURIComponent(
                `Namaste ${ord.buyer_name || 'there'}, this is Webzy Support regarding your order ${ord.invoice_no || ord.id.slice(0, 8)}${liveUrl ? ` (${liveUrl})` : ''}. How can we help you today?`,
              );
              const isExpanded = expandedOrderId === ord.id;
              const taxablePaise = Math.round(ord.amount_paise / 1.18);
              const halfGstPaise = Math.round((ord.amount_paise - taxablePaise) / 2);

              return (
                <article
                  key={ord.id}
                  className="overflow-hidden rounded-2xl border border-webzy-tint bg-white shadow-xs transition hover:border-webzy-primary/45 hover:shadow-sm"
                >
                  {/* Top Semantic Brand Accent Line */}
                  <div
                    className={`h-1 w-full ${
                      isLive
                        ? ord.is_test
                          ? 'bg-gradient-to-r from-webzy-primary via-amber-400 to-emerald-500'
                          : 'bg-gradient-to-r from-emerald-500 via-webzy-primary to-amber-400'
                        : isRefunded
                          ? 'bg-red-500'
                          : 'bg-amber-400'
                    }`}
                  />

                  {/* Top Order Metadata Strip in Soft Webzy Rose Tint */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-webzy-tint/80 bg-webzy-surface/65 px-4 py-2.5 text-xs">
                    <div className="flex flex-wrap items-center gap-5 sm:gap-7">
                      <div>
                        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-webzy-ink/55">
                          Order Date
                        </p>
                        <p suppressHydrationWarning className="font-semibold text-webzy-ink font-tabular">
                          {ord.created_at ? formatIst(ord.created_at) : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-webzy-ink/55">
                          Amount
                        </p>
                        <p className="font-extrabold text-webzy-primary font-tabular">
                          {formatPaiseAsInr(ord.amount_paise)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-webzy-ink/55">
                          Mode &amp; Gateway
                        </p>
                        <p className="flex items-center gap-1.5 font-semibold text-webzy-ink/85">
                          <span>{ord.provider.toUpperCase()}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              ord.is_test
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {ord.is_test ? 'Test Mode' : 'Live Production'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="Click to copy invoice / order ID"
                        onClick={() => void handleCopyText(`inv:${ord.id}`, ord.invoice_no || ord.id)}
                        className="rounded-lg border border-webzy-tint bg-white px-2.5 py-1 font-mono text-xs font-bold text-webzy-ink hover:border-webzy-primary hover:text-webzy-primary transition"
                      >
                        {copyFeedbackId === `inv:${ord.id}`
                          ? 'Copied ID!'
                          : ord.invoice_no || `Order ${ord.id.slice(0, 8)}`}
                      </button>
                    </div>
                  </div>

                  {/* Card Body: Status + Buyer + Colorful Action Stack */}
                  <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isLive
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                              : isRefunded
                                ? 'border border-red-200 bg-red-50 text-red-800'
                                : 'border border-amber-200 bg-amber-50 text-amber-900'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isLive ? 'bg-emerald-600' : isRefunded ? 'bg-red-600' : 'bg-amber-500'
                            }`}
                          />
                          <span className="capitalize">{ord.status.replace(/_/g, ' ')}</span>
                        </span>

                        {addonList ? (
                          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-900">
                            Add-ons: {addonList}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-webzy-ink">
                        <strong className="font-bold text-webzy-ink">{ord.buyer_name || 'Guest'}</strong>
                        {ord.buyer_email ? (
                          <>
                            <span className="text-webzy-tint">·</span>
                            <button
                              type="button"
                              title="Copy customer email"
                              onClick={() => void handleCopyText(`email:${ord.id}`, ord.buyer_email)}
                              className="text-xs font-semibold text-webzy-ink/75 underline decoration-dotted hover:text-webzy-primary"
                            >
                              {copyFeedbackId === `email:${ord.id}` ? 'Copied Email' : ord.buyer_email}
                            </button>
                          </>
                        ) : null}
                        {ord.buyer_phone ? (
                          <>
                            <span className="text-webzy-tint">·</span>
                            <button
                              type="button"
                              title="Copy customer phone"
                              onClick={() => void handleCopyText(`phone:${ord.id}`, ord.buyer_phone!)}
                              className="font-mono text-xs font-semibold text-webzy-ink/75 underline decoration-dotted hover:text-webzy-primary"
                            >
                              {copyFeedbackId === `phone:${ord.id}` ? 'Copied Phone' : ord.buyer_phone}
                            </button>
                          </>
                        ) : null}
                      </div>

                      {ord.site_slug ? (
                        <p className="font-mono text-xs font-bold text-webzy-primary">
                          Live URL: /s/{ord.site_slug}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                        className={`btn-spring inline-flex min-h-[36px] items-center rounded-xl border px-3 text-xs font-bold transition ${
                          isExpanded
                            ? 'border-webzy-primary bg-webzy-tint text-webzy-primary'
                            : 'border-webzy-tint bg-webzy-surface/80 text-webzy-ink hover:border-webzy-primary/50 hover:text-webzy-primary'
                        }`}
                      >
                        {isExpanded ? 'Hide GST' : 'GST Breakdown'}
                      </button>

                      {waPhone ? (
                        <a
                          href={`https://wa.me/${waPhone}?text=${waText}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-spring inline-flex min-h-[36px] items-center rounded-xl border border-emerald-300 bg-emerald-50 px-3 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
                        >
                          WhatsApp
                        </a>
                      ) : null}

                      {ord.site_slug && liveUrl ? (
                        <>
                          <button
                            suppressHydrationWarning
                            type="button"
                            onClick={() => void handleCopyLink(ord.id, ord.site_slug!)}
                            className="btn-spring inline-flex min-h-[36px] items-center rounded-xl border border-webzy-tint bg-white px-3 text-xs font-bold text-webzy-ink hover:border-webzy-primary hover:text-webzy-primary"
                          >
                            {copyFeedbackId === `link:${ord.id}` ? 'Copied!' : 'Copy Link'}
                          </button>
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-spring inline-flex min-h-[36px] items-center rounded-xl border border-webzy-primary/30 bg-webzy-tint/60 px-3 text-xs font-bold text-webzy-primary hover:bg-webzy-tint"
                          >
                            Visit ↗
                          </a>
                        </>
                      ) : null}

                      {isLive ? (
                        <button
                          suppressHydrationWarning
                          type="button"
                          disabled={busyId === ord.id}
                          onClick={() => {
                            setErrorMsg('');
                            setModalError('');
                            setRefundTarget(ord);
                            setRefundReason('');
                          }}
                          className="btn-spring inline-flex min-h-[36px] items-center rounded-xl bg-red-600 px-3.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 disabled:opacity-50"
                        >
                          {busyId === ord.id ? 'Refunding...' : 'Issue Refund'}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Animated Inline GST Breakdown Drawer */}
                  <div
                    className={`grid transition-all duration-300 ${
                      isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="grid grid-cols-2 gap-3 border-t border-webzy-tint/70 bg-webzy-surface/55 px-4 py-3 text-xs sm:grid-cols-4 font-tabular">
                        <div>
                          <p className="text-webzy-ink/60">Taxable Base</p>
                          <p className="font-bold text-webzy-ink">{formatPaiseAsInr(taxablePaise)}</p>
                        </div>
                        <div>
                          <p className="text-webzy-ink/60">CGST (9%) + SGST (9%)</p>
                          <p className="font-bold text-webzy-ink">
                            {formatPaiseAsInr(halfGstPaise)} + {formatPaiseAsInr(halfGstPaise)}
                          </p>
                        </div>
                        <div>
                          <p className="text-webzy-ink/60">Order UUID</p>
                          <button
                            type="button"
                            onClick={() => void handleCopyText(`uuid:${ord.id}`, ord.id)}
                            className="font-mono font-bold text-webzy-primary hover:underline"
                          >
                            {copyFeedbackId === `uuid:${ord.id}` ? 'Copied UUID' : ord.id.slice(0, 14)}
                          </button>
                        </div>
                        <div>
                          <p className="text-webzy-ink/60">Gateway Fee Estimate</p>
                          <p className="font-bold text-webzy-ink">
                            {formatPaiseAsInr(Math.round(ord.amount_paise * 0.0236))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Safe Refund Confirmation Modal */}
      {refundTarget ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="refund-modal-title"
          onClick={() => {
            setRefundTarget(null);
            setModalError('');
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-in w-full max-w-md rounded-2xl border border-webzy-tint bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 id="refund-modal-title" className="text-lg font-bold text-red-900">
                Confirm Full Refund ({formatPaiseAsInr(refundTarget.amount_paise)})
              </h3>
              <button
                type="button"
                aria-label="Close refund modal"
                onClick={() => {
                  setRefundTarget(null);
                  setModalError('');
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-webzy-ink/60 hover:bg-webzy-surface"
              >
                ×
              </button>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-webzy-ink/75">
              This will refund <strong>{refundTarget.buyer_name || refundTarget.buyer_email}</strong>,
              disable live page{' '}
              <code>{refundTarget.site_slug ? `/s/${refundTarget.site_slug}` : refundTarget.id.slice(0, 8)}</code>,
              and send an automated refund email.
            </p>

            <form onSubmit={handleConfirmRefund} className="mt-4 space-y-3 text-xs">
              {modalError ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-900"
                >
                  {modalError}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-1.5">
                {REFUND_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setRefundReason(preset);
                      setModalError('');
                    }}
                    className="rounded-full border border-webzy-tint bg-webzy-surface px-2.5 py-1 text-[11px] font-semibold text-webzy-ink hover:border-webzy-primary"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div>
                <label htmlFor="refund-reason-input" className="block font-bold text-webzy-ink">
                  Audit Reason (required, min 5 characters)
                </label>
                <textarea
                  id="refund-reason-input"
                  rows={3}
                  required
                  minLength={5}
                  value={refundReason}
                  onChange={(e) => {
                    setRefundReason(e.target.value);
                    if (modalError) setModalError('');
                  }}
                  placeholder="Enter exact reason for refund..."
                  className="mt-1 w-full rounded-xl border border-webzy-tint p-3 text-sm text-webzy-ink outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRefundTarget(null);
                    setModalError('');
                  }}
                  className="min-h-[40px] rounded-xl border border-webzy-tint px-4 font-bold text-webzy-ink hover:bg-webzy-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busyId === refundTarget.id || refundReason.trim().length < 5}
                  className="min-h-[40px] rounded-xl bg-red-600 px-5 font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {busyId === refundTarget.id ? 'Processing...' : 'Confirm Full Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
