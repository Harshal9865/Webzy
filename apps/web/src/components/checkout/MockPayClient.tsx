'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { formatPaiseAsInr } from '@webzy/core';

interface MockPayClientProps {
  orderId: string;
  providerOrderId: string;
  amountPaise: number;
  status: string;
  validityDays?: number;
  showQaControls?: boolean;
}

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', short: 'GPay', suffix: '@okicici', accent: '#1A73E8' },
  { id: 'phonepe', name: 'PhonePe', short: 'PhonePe', suffix: '@ybl', accent: '#5F259F' },
  { id: 'paytm', name: 'Paytm UPI', short: 'Paytm', suffix: '@paytm', accent: '#00BAF2' },
  { id: 'bhim', name: 'BHIM / Any UPI', short: 'BHIM', suffix: '@upi', accent: '#D97706' },
] as const;

const STATUS_LABELS: Record<string, string> = {
  payment_pending: 'Awaiting Confirmation',
  paid: 'Payment Captured',
  published: 'Link Live',
  failed: 'Retry Required',
};

function buildDeterministicQrMatrix(seedStr: string, size = 13): boolean[][] {
  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i += 1) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const markFinder = (ox: number, oy: number) => {
    for (let y = 0; y < 5; y += 1) {
      for (let x = 0; x < 5; x += 1) {
        const border = x === 0 || x === 4 || y === 0 || y === 4;
        const core = x === 2 && y === 2;
        grid[oy + y][ox + x] = border || core;
      }
    }
  };

  markFinder(0, 0);
  markFinder(size - 5, 0);
  markFinder(0, size - 5);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const inTL = x < 6 && y < 6;
      const inTR = x >= size - 6 && y < 6;
      const inBL = x < 6 && y >= size - 6;
      if (inTL || inTR || inBL) continue;
      hash ^= (hash << 13) ^ (y * 31 + x * 17);
      hash = Math.imul(hash, 1597334677);
      grid[y][x] = (hash & 3) === 0 || (hash & 5) === 5;
    }
  }
  return grid;
}

export function MockPayClient({
  orderId,
  providerOrderId,
  amountPaise,
  status,
  validityDays = 7,
  showQaControls = false,
}: MockPayClientProps) {
  const router = useRouter();
  const [selectedApp, setSelectedApp] = useState<(typeof UPI_APPS)[number]['id']>('gpay');
  const [payMethod, setPayMethod] = useState<'qr' | 'upi_id'>('upi_id');
  const [upiId, setUpiId] = useState('');
  const [busy, setBusy] = useState(false);
  const [stageText, setStageText] = useState('');
  const [notice, setNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const qrCells = useMemo(
    () => buildDeterministicQrMatrix(`${providerOrderId}:${amountPaise}`),
    [providerOrderId, amountPaise],
  );

  const activeApp = UPI_APPS.find((a) => a.id === selectedApp) || UPI_APPS[0];
  const humanStatus = STATUS_LABELS[status] || 'Ready to Pay';

  function applySuffix(suffix: string) {
    const base = upiId.split('@')[0]?.trim();
    setUpiId(base ? `${base}${suffix}` : '');
  }

  async function triggerMockAction(action: string, delayMs = 0) {
    setBusy(true);
    setErrorMsg('');
    setNotice('');
    setStageText(
      delayMs > 0
        ? 'Waiting for bank confirmation...'
        : action === 'success'
          ? 'Verifying UPI & publishing your link...'
          : 'Updating payment status...',
    );

    try {
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      const res = await fetch(`/api/mock-pay/${encodeURIComponent(orderId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json()) as {
        redirectUrl?: string;
        message?: string;
        error?: string;
      };

      if (!res.ok && !data.message) {
        throw new Error(data.error || 'Payment could not be verified. Please retry.');
      }

      if (data.redirectUrl) {
        window.dispatchEvent(new Event('webzy_orders_updated'));
        window.dispatchEvent(new Event('webzy_admin_mutated'));
        router.push(data.redirectUrl);
        return;
      }

      setNotice(data.message || 'Done.');
      window.dispatchEvent(new Event('webzy_orders_updated'));
      window.dispatchEvent(new Event('webzy_admin_mutated'));
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Payment error. Please retry.');
    } finally {
      setStageText('');
      setBusy(false);
    }
  }

  async function runWatchdogNow() {
    setBusy(true);
    setErrorMsg('');
    setNotice('');
    setStageText('Running watchdog recovery check...');
    try {
      const res = await fetch('/api/cron/watchdog', {
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
      setNotice(
        `Watchdog completed: recovered=${data.recoveredCount ?? 0}, alertsSent=${data.alertedCount ?? 0}. Refreshing status...`,
      );
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Watchdog error.');
    } finally {
      setStageText('');
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <div
        role="status"
        className="mb-4 flex items-center justify-between gap-2 rounded-2xl border border-amber-300/80 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-950"
      >
        <span>Sandbox UPI Checkout · No real money debited</span>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-amber-900 shadow-2xs">
          {humanStatus}
        </span>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-webzy-tint bg-white shadow-xl">
        {/* Merchant & Order Summary Header */}
        <div className="bg-gradient-to-br from-[#1B1222] via-[#27182E] to-[#3B1931] px-6 py-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-webzy-primary font-heading text-lg font-bold text-white shadow-btn-primary">
                w
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold tracking-tight">Webzy Digital</p>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/90">
                    {validityDays >= 90 ? '3 Months' : `${validityDays} Days Live`}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-white/70">
                  Order #{orderId.slice(0, 8).toUpperCase()} · Verified Merchant
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/70">Total Payable</p>
              <p className="font-heading text-2xl font-bold tracking-tight text-white">
                {formatPaiseAsInr(amountPaise)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {/* Payment Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-webzy-surface p-1">
            <button
              type="button"
              disabled={busy}
              onClick={() => setPayMethod('upi_id')}
              className={`min-h-[44px] rounded-xl text-xs font-bold transition ${
                payMethod === 'upi_id'
                  ? 'bg-white text-webzy-ink shadow-sm'
                  : 'text-webzy-ink/65 hover:text-webzy-ink'
              }`}
            >
              UPI App / ID
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setPayMethod('qr')}
              className={`min-h-[44px] rounded-xl text-xs font-bold transition ${
                payMethod === 'qr'
                  ? 'bg-white text-webzy-ink shadow-sm'
                  : 'text-webzy-ink/65 hover:text-webzy-ink'
              }`}
            >
              Scan UPI QR
            </button>
          </div>

          {payMethod === 'upi_id' ? (
            <div className="mt-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-webzy-ink/60">
                Choose your UPI App
              </p>
              <div className="mt-2.5 grid grid-cols-4 gap-2">
                {UPI_APPS.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setSelectedApp(app.id);
                      applySuffix(app.suffix);
                    }}
                    className={`flex min-h-[56px] flex-col items-center justify-center rounded-2xl border px-2 text-center transition ${
                      selectedApp === app.id
                        ? 'border-webzy-primary bg-webzy-surface shadow-sm'
                        : 'border-webzy-tint bg-white hover:border-webzy-primary/50'
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: app.accent }}
                      aria-hidden="true"
                    />
                    <span className="mt-1.5 text-xs font-bold text-webzy-ink">{app.short}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-webzy-tint bg-webzy-surface/50 p-4">
                <label htmlFor="mock-upi-id" className="block text-xs font-bold text-webzy-ink">
                  Enter UPI ID ({activeApp.name})
                </label>
                <input
                  id="mock-upi-id"
                  type="text"
                  inputMode="email"
                  autoComplete="off"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder={`yourname${activeApp.suffix}`}
                  className="mt-2 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm font-medium text-webzy-ink outline-none focus:border-webzy-primary"
                />
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {['@okicici', '@ybl', '@paytm', '@oksbi'].map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      disabled={busy}
                      onClick={() => applySuffix(handle)}
                      className="min-h-[32px] rounded-full border border-webzy-tint bg-white px-2.5 text-[11px] font-semibold text-webzy-ink/75 hover:border-webzy-primary/60 hover:text-webzy-ink"
                    >
                      {handle}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center rounded-2xl border border-webzy-tint bg-webzy-surface/50 p-5 text-center">
              <div className="rounded-2xl border border-webzy-tint bg-white p-3 shadow-sm">
                <svg
                  viewBox="0 0 13 13"
                  className="h-36 w-36 text-webzy-ink"
                  shapeRendering="crispEdges"
                  aria-label="Sandbox UPI QR code"
                >
                  {qrCells.map((row, y) =>
                    row.map((filled, x) =>
                      filled ? (
                        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
                      ) : null,
                    ),
                  )}
                </svg>
              </div>
              <p className="mt-3 text-xs font-bold text-webzy-ink">
                Scan with GPay, PhonePe, Paytm or any UPI app
              </p>
              <p className="mt-1 text-[11px] text-webzy-ink/60">
                Or tap confirm below to complete sandbox approval
              </p>
            </div>
          )}

          {/* Primary Pay Button */}
          <button
            suppressHydrationWarning
            type="button"
            disabled={busy}
            onClick={() => triggerMockAction('success')}
            className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {busy ? stageText || 'Verifying payment...' : `Pay ${formatPaiseAsInr(amountPaise)} & Publish Now`}
          </button>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-webzy-ink/60">
            <span>Instant link & QR unlock</span>
            <span>·</span>
            <span>GST-inclusive receipt</span>
            <span>·</span>
            <span>256-bit TLS</span>
          </div>

          {notice ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-950">
              {notice}
              {status === 'published' ? (
                <Link href={`/success/${orderId}`} className="ml-2 underline">
                  Open Success Page
                </Link>
              ) : null}
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

          {showQaControls ? (
            <details className="mt-6 rounded-2xl border border-webzy-tint/60 bg-webzy-surface/30 px-4 py-2.5">
              <summary className="cursor-pointer text-[11px] font-semibold text-webzy-ink/50 hover:text-webzy-ink/80">
                Developer simulation controls
              </summary>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => triggerMockAction('fail')}
                  className="min-h-[44px] rounded-xl bg-red-600 px-3 text-xs font-bold text-white disabled:opacity-50"
                >
                  Simulate payment fails
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => triggerMockAction('close_tab_paid')}
                  className="min-h-[44px] rounded-xl border border-webzy-tint bg-white px-3 text-xs font-bold text-webzy-ink disabled:opacity-50"
                >
                  Close tab after pay
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => triggerMockAction('duplicate_success')}
                  className="min-h-[44px] rounded-xl border border-webzy-tint bg-white px-3 text-xs font-bold text-webzy-ink disabled:opacity-50"
                >
                  Duplicate success event
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => triggerMockAction('delayed_success', 30000)}
                  className="min-h-[44px] rounded-xl border border-webzy-tint bg-white px-3 text-xs font-bold text-webzy-ink disabled:opacity-50"
                >
                  Delayed success (30s)
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => triggerMockAction('out_of_order_late_fail')}
                  className="min-h-[44px] rounded-xl border border-webzy-tint bg-white px-3 text-xs font-bold text-webzy-ink disabled:opacity-50"
                >
                  Success then late fail
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => triggerMockAction('wrong_signature')}
                  className="min-h-[44px] rounded-xl border border-webzy-tint bg-white px-3 text-xs font-bold text-webzy-ink disabled:opacity-50"
                >
                  Wrong webhook signature
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => triggerMockAction('paid_only_for_watchdog_alert')}
                  className="min-h-[44px] rounded-xl border border-webzy-tint bg-white px-3 text-xs font-bold text-webzy-ink disabled:opacity-50"
                >
                  Paid unpublished (&gt;5m)
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={runWatchdogNow}
                  className="min-h-[44px] rounded-xl bg-webzy-ink px-3 text-xs font-bold text-white disabled:opacity-50"
                >
                  Run Watchdog Recovery
                </button>
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </div>
  );
}
