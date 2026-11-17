'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { formatPaiseAsInr } from '@webzy/core';

interface MockPayClientProps {
  orderId: string;
  providerOrderId: string;
  amountPaise: number;
  status: string;
}

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', short: 'GPay', accent: '#1A73E8' },
  { id: 'phonepe', name: 'PhonePe', short: 'PhonePe', accent: '#5F259F' },
  { id: 'paytm', name: 'Paytm UPI', short: 'Paytm', accent: '#00BAF2' },
  { id: 'bhim', name: 'BHIM / Other', short: 'BHIM', accent: '#F59E0B' },
] as const;

export function MockPayClient({
  orderId,
  providerOrderId,
  amountPaise,
  status,
}: MockPayClientProps) {
  const router = useRouter();
  const [selectedApp, setSelectedApp] = useState<(typeof UPI_APPS)[number]['id']>('gpay');
  const [upiId, setUpiId] = useState('harshalkr@okicici');
  const [busy, setBusy] = useState(false);
  const [stageText, setStageText] = useState('');
  const [notice, setNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function triggerMockAction(action: string, delayMs = 0) {
    setBusy(true);
    setErrorMsg('');
    setNotice('');
    setStageText(
      delayMs > 0
        ? 'Simulating 30-second bank confirmation...'
        : action === 'success'
          ? 'Confirming UPI payment & publishing your Webzy link...'
          : 'Processing...',
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
        router.push(data.redirectUrl);
        return;
      }

      setNotice(data.message || 'Done.');
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
        role="banner"
        className="mb-4 flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-950"
      >
        <span>TEST MODE · No real money is charged</span>
        <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-amber-900">
          {status}
        </span>
      </div>

      {/* Sleek Razorpay-style UPI Checkout Card */}
      <div className="overflow-hidden rounded-3xl border border-webzy-tint bg-white shadow-lg">
        {/* Merchant Header */}
        <div className="bg-webzy-ink px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-webzy-primary font-heading text-lg font-bold text-white">
                W
              </div>
              <div>
                <p className="text-sm font-bold">Webzy Digital</p>
                <p className="font-mono text-[11px] text-white/65">Order #{orderId.slice(0, 8)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/65">Payable (GST incl.)</p>
              <p className="font-heading text-2xl font-bold text-white">
                {formatPaiseAsInr(amountPaise)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Quick UPI App Selector */}
          <p className="text-xs font-bold uppercase tracking-wide text-webzy-ink/65">
            Pay with UPI App
          </p>
          <div className="mt-2.5 grid grid-cols-4 gap-2">
            {UPI_APPS.map((app) => (
              <button
                key={app.id}
                type="button"
                disabled={busy}
                onClick={() => setSelectedApp(app.id)}
                className={`flex min-h-[56px] flex-col items-center justify-center rounded-2xl border px-2 text-center transition ${
                  selectedApp === app.id
                    ? 'border-webzy-primary bg-webzy-surface shadow-sm'
                    : 'border-webzy-tint bg-white hover:border-webzy-primary/50'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: app.accent }}
                  aria-hidden="true"
                />
                <span className="mt-1 text-xs font-bold text-webzy-ink">{app.short}</span>
              </button>
            ))}
          </div>

          {/* Scan QR or UPI ID Box */}
          <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-webzy-tint bg-webzy-surface/50 p-4 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-webzy-tint bg-white p-2">
              <svg viewBox="0 0 64 64" className="h-full w-full text-webzy-ink" aria-hidden="true">
                <rect x="4" y="4" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="10" y="10" width="6" height="6" fill="currentColor" />
                <rect x="42" y="4" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="48" y="10" width="6" height="6" fill="currentColor" />
                <rect x="4" y="42" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="10" y="48" width="6" height="6" fill="currentColor" />
                <path
                  d="M28 8h8v8h-8zm0 14h8v8h-8zm14 14h14v8H42zm-14 6h8v14h-8zm14 12h14v6H42zM8 28h14v8H8z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="flex-1">
              <label htmlFor="mock-upi-id" className="block text-xs font-bold text-webzy-ink">
                Or enter UPI ID ({UPI_APPS.find((a) => a.id === selectedApp)?.name})
              </label>
              <input
                id="mock-upi-id"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@okaxis"
                className="mt-1.5 min-h-[42px] w-full rounded-xl border border-webzy-tint bg-white px-3 text-xs font-medium text-webzy-ink outline-none focus:border-webzy-primary"
              />
              <p className="mt-1.5 text-[11px] text-webzy-ink/60">
                Simulated instant approval for test orders · Ref: {providerOrderId}
              </p>
            </div>
          </div>

          {/* Primary Pay Button */}
          <button
            suppressHydrationWarning
            type="button"
            disabled={busy}
            onClick={() => triggerMockAction('success')}
            className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy ? stageText || 'Confirming payment...' : `Pay ${formatPaiseAsInr(amountPaise)} via UPI →`}
          </button>

          <p className="mt-3 text-center text-[11px] text-webzy-ink/60">
            Instant link activation · Dedicated celebration URL ready in seconds
          </p>

          {notice ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-950">
              {notice}
              {status === 'published' ? (
                <Link href={`/success/${orderId}`} className="ml-2 underline">
                  Open Success Page →
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

          {/* Collapsed Developer / QA Controls */}
          <details className="mt-6 rounded-2xl border border-webzy-tint/60 bg-webzy-surface/30 px-4 py-2.5">
            <summary className="cursor-pointer text-[11px] font-semibold text-webzy-ink/40 hover:text-webzy-ink/70">
              Testing & simulation controls
            </summary>
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => triggerMockAction('fail')}
                  className="min-h-[40px] rounded-xl bg-red-600 px-3 text-xs font-bold text-white disabled:opacity-50"
                >
                  Simulate payment fails
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => triggerMockAction('close_tab_paid')}
                  className="min-h-[40px] rounded-xl border border-webzy-tint bg-white px-3 text-xs font-bold text-webzy-ink disabled:opacity-50"
                >
                  Close tab after pay (pending)
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => triggerMockAction('duplicate_success')}
                  className="min-h-[40px] rounded-xl border border-webzy-tint bg-white px-3 text-xs font-bold text-webzy-ink disabled:opacity-50"
                >
                  Duplicate success event
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => triggerMockAction('delayed_success', 30000)}
                  className="min-h-[40px] rounded-xl border border-webzy-tint bg-white px-3 text-xs font-bold text-webzy-ink disabled:opacity-50"
                >
                  Delayed success (30s)
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => triggerMockAction('out_of_order_late_fail')}
                  className="min-h-[40px] rounded-xl border border-webzy-tint bg-white px-3 text-xs font-bold text-webzy-ink disabled:opacity-50"
                >
                  Success then late fail
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => triggerMockAction('wrong_signature')}
                  className="min-h-[40px] rounded-xl border border-webzy-tint bg-white px-3 text-xs font-bold text-webzy-ink disabled:opacity-50"
                >
                  Wrong webhook signature
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => triggerMockAction('paid_only_for_watchdog_alert')}
                  className="min-h-[40px] rounded-xl border border-webzy-tint bg-white px-3 text-xs font-bold text-webzy-ink disabled:opacity-50"
                >
                  Paid unpublished (&gt;5m)
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={runWatchdogNow}
                  className="min-h-[40px] rounded-xl bg-webzy-ink px-3 text-xs font-bold text-white disabled:opacity-50"
                >
                  Run Watchdog Recovery
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
