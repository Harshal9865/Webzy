'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
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
}

interface AdminOrdersClientProps {
  orders: AdminOrderRow[];
}

export function AdminOrdersClient({ orders }: AdminOrdersClientProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  return (
    <section className="mt-8 rounded-3xl border border-webzy-tint bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-webzy-ink">
            Recent Orders &amp; Single-Click Refunds
          </h2>
          <p className="text-xs text-webzy-ink/65">
            Idempotent refund runs once per order; Watchdog recovers stuck orders; Lifecycle unlocks
            scheduled reveals and cleans expired drafts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            suppressHydrationWarning
            type="button"
            disabled={busyId === 'lifecycle'}
            onClick={handleRunLifecycle}
            className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-webzy-surface px-4 text-xs font-bold text-webzy-ink disabled:opacity-50"
          >
            {busyId === 'lifecycle' ? 'Cleaning...' : 'Run Lifecycle Cleanup'}
          </button>
          <button
            suppressHydrationWarning
            type="button"
            disabled={busyId === 'watchdog'}
            onClick={handleRunWatchdog}
            className="inline-flex min-h-[44px] items-center rounded-full bg-webzy-ink px-4 text-xs font-bold text-white disabled:opacity-50"
          >
            {busyId === 'watchdog' ? 'Running Watchdog...' : 'Run Watchdog Now'}
          </button>
        </div>
      </div>

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

      {orders.length === 0 ? (
        <p className="mt-4 text-sm text-webzy-ink/70">No orders yet.</p>
      ) : (
        <div className="mt-4 space-y-2.5">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-webzy-tint bg-webzy-surface/40 p-4 text-xs"
            >
              <div>
                <p className="font-bold text-webzy-ink">
                  {ord.invoice_no || ord.id.slice(0, 8)} · {formatPaiseAsInr(ord.amount_paise)} ·{' '}
                  <span className="rounded-full bg-white px-2 py-0.5 text-webzy-primary">
                    {ord.status}
                  </span>
                </p>
                <p className="mt-1 text-webzy-ink/70">
                  {ord.buyer_name || 'Buyer'} ({ord.buyer_email || '—'}) · provider: {ord.provider}
                </p>
              </div>

              {ord.status === 'paid' || ord.status === 'published' ? (
                <button
                  suppressHydrationWarning
                  type="button"
                  disabled={busyId === ord.id}
                  onClick={() => handleRefund(ord.id)}
                  className="inline-flex min-h-[44px] items-center rounded-full bg-red-600 px-4 text-xs font-bold text-white disabled:opacity-50"
                >
                  {busyId === ord.id ? 'Refunding...' : 'Issue Full Refund'}
                </button>
              ) : (
                <span className="font-semibold text-webzy-ink/60">
                  {ord.status === 'refunded' ? 'Refunded (Locked)' : ord.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
