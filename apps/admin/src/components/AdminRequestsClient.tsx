'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export interface AdminCustomRequestRow {
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
  created_at: string;
}

interface AdminRequestsClientProps {
  requests: AdminCustomRequestRow[];
}

export function AdminRequestsClient({ requests }: AdminRequestsClientProps) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<
    Record<string, { status: string; quote: string; notes: string }>
  >(() => {
    const init: Record<string, { status: string; quote: string; notes: string }> = {};
    for (const r of requests) {
      init[r.id] = {
        status: r.status,
        quote: r.quoted_amount_inr ? String(r.quoted_amount_inr) : '',
        notes: r.admin_notes || '',
      };
    }
    return init;
  });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function saveRequest(requestId: string, sendQuoteEmail: boolean) {
    const item = drafts[requestId];
    if (!item) return;

    setBusyId(requestId);
    setNotice('');
    setErrorMsg('');
    try {
      const quotedNum = item.quote.trim() ? Number(item.quote.trim()) : null;
      const res = await fetch('/api/custom-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          status: sendQuoteEmail ? 'quoted' : item.status,
          quotedAmountInr: quotedNum,
          adminNotes: item.notes,
          sendQuoteEmail,
        }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error || 'Could not update request.');
      setNotice(data.message || 'Saved.');
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-webzy-tint bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-heading text-xl font-bold text-webzy-ink">
          Custom Website Requests &amp; Quotes ({requests.length})
        </h2>
        <p className="text-xs text-webzy-ink/65">
          Review incoming /request briefs, set quote estimates, and email clients directly.
        </p>
      </div>

      {notice ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-950">
          {notice}
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

      {requests.length === 0 ? (
        <p className="mt-4 text-sm text-webzy-ink/65">No custom requests submitted yet.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {requests.map((req) => {
            const state = drafts[req.id] ?? {
              status: req.status,
              quote: req.quoted_amount_inr ? String(req.quoted_amount_inr) : '',
              notes: req.admin_notes || '',
            };
            return (
              <div
                key={req.id}
                className="rounded-2xl border border-webzy-tint bg-webzy-surface/40 p-4 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-webzy-tint px-2.5 py-0.5 font-bold uppercase text-webzy-primary">
                      {req.occasion}
                    </span>
                    <span className="font-bold text-webzy-ink">
                      {req.requester_name} ({req.requester_email})
                    </span>
                    {req.requester_phone ? (
                      <span className="text-webzy-ink/70">· {req.requester_phone}</span>
                    ) : null}
                  </div>
                  <span className="font-semibold text-webzy-ink/70">
                    Budget: ₹{req.budget_tier} · Target: {req.target_date || 'Flexible'}
                  </span>
                </div>

                <p className="mt-2 rounded-xl bg-white p-3 leading-relaxed text-webzy-ink">
                  {req.brief}
                </p>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-12">
                  <select
                    suppressHydrationWarning
                    value={state.status}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [req.id]: { ...state, status: e.target.value },
                      }))
                    }
                    className="min-h-[38px] rounded-xl border border-webzy-tint bg-white px-2.5 font-semibold sm:col-span-3"
                  >
                    <option value="new">New</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="quoted">Quoted</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                    <option value="completed">Completed</option>
                  </select>

                  <input
                    suppressHydrationWarning
                    type="number"
                    min={999}
                    placeholder="Quote ₹ (e.g. 3499)"
                    value={state.quote}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [req.id]: { ...state, quote: e.target.value },
                      }))
                    }
                    className="min-h-[38px] rounded-xl border border-webzy-tint bg-white px-3 sm:col-span-3"
                  />

                  <input
                    suppressHydrationWarning
                    type="text"
                    placeholder="Internal / quote notes..."
                    value={state.notes}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [req.id]: { ...state, notes: e.target.value },
                      }))
                    }
                    className="min-h-[38px] rounded-xl border border-webzy-tint bg-white px-3 sm:col-span-6"
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    suppressHydrationWarning
                    type="button"
                    disabled={busyId === req.id}
                    onClick={() => void saveRequest(req.id, false)}
                    className="min-h-[36px] rounded-full border border-webzy-tint bg-white px-4 font-bold text-webzy-ink disabled:opacity-50"
                  >
                    Save Status
                  </button>
                  <button
                    suppressHydrationWarning
                    type="button"
                    disabled={busyId === req.id || !state.quote.trim()}
                    onClick={() => void saveRequest(req.id, true)}
                    className="min-h-[36px] rounded-full bg-webzy-primary px-4 font-bold text-white disabled:opacity-50"
                  >
                    Save &amp; Email Quote
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
