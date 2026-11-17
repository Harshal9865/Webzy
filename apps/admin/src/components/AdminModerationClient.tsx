'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export interface AdminReportRow {
  id: string;
  site_id: string;
  site_slug: string;
  site_status: string;
  site_hidden: boolean;
  reason: string;
  status: string;
  created_at: string;
}

export interface AdminTakedownRow {
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

interface LookupSiteResult {
  site: {
    id: string;
    slug: string;
    status: string;
    hidden: boolean;
    views_count?: number;
    content_json?: { receiverName?: string; senderName?: string };
  };
  owner?: {
    id: string;
    email: string;
    full_name: string;
    is_banned: boolean;
  } | null;
}

interface AdminModerationClientProps {
  reports: AdminReportRow[];
  takedowns: AdminTakedownRow[];
  webUrl: string;
}

export function AdminModerationClient({
  reports,
  takedowns,
  webUrl,
}: AdminModerationClientProps) {
  const router = useRouter();
  const [slugInput, setSlugInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [lookupResult, setLookupResult] = useState<LookupSiteResult | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleQueueAction(
    kind: 'report' | 'takedown',
    id: string,
    action: 'restore' | 'remove' | 'ban_user' | 'hide_site' | 'dismiss',
  ) {
    setBusyKey(`${kind}:${id}`);
    setNotice('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/moderation/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, id, action }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error || 'Action failed.');
      setNotice(data.message || 'Moderation saved.');
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Moderation error.');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleSiteLookupOrAction(
    action: 'lookup' | 'pause' | 'restore' | 'remove' | 'ban_owner',
  ) {
    if (!slugInput.trim()) return;
    setBusyKey(`site:${action}`);
    setNotice('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/moderation/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slugInput.trim(),
          action,
          reason: reasonInput.trim(),
        }),
      });
      const data = (await res.json()) as LookupSiteResult & { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error || 'Lookup failed.');
      setLookupResult({ site: data.site, owner: data.owner });
      if (data.message) setNotice(data.message);
      if (action !== 'lookup') router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Site moderation error.');
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-webzy-tint bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-webzy-ink">
            Trust, Safety &amp; Content Moderation
          </h2>
          <p className="text-xs text-webzy-ink/65">
            Receiver reports auto-hide pages immediately. Restore clean pages, remove violations,
            or ban abusive senders with immutable logs.
          </p>
        </div>
      </div>

      {/* Direct Slug Lookup */}
      <div className="mt-5 rounded-2xl border border-webzy-tint bg-webzy-surface/50 p-4">
        <p className="text-xs font-bold text-webzy-ink">Inspect or Moderate Any Page by Link / Slug</p>
        <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
          <input
            suppressHydrationWarning
            type="text"
            value={slugInput}
            onChange={(e) => setSlugInput(e.target.value)}
            placeholder="Paste /s/xxxxxxxxxxxx or full link"
            className="min-h-[42px] flex-1 rounded-xl border border-webzy-tint bg-white px-3.5 text-xs text-webzy-ink"
          />
          <input
            suppressHydrationWarning
            type="text"
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            placeholder="Optional audit reason..."
            className="min-h-[42px] flex-1 rounded-xl border border-webzy-tint bg-white px-3.5 text-xs text-webzy-ink"
          />
          <button
            suppressHydrationWarning
            type="button"
            disabled={busyKey !== null}
            onClick={() => void handleSiteLookupOrAction('lookup')}
            className="min-h-[42px] rounded-xl bg-webzy-ink px-5 text-xs font-bold text-white disabled:opacity-50"
          >
            Lookup
          </button>
        </div>

        {lookupResult ? (
          <div className="mt-4 rounded-xl border border-webzy-tint bg-white p-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono font-bold text-webzy-primary">
                  /s/{lookupResult.site.slug} · status={lookupResult.site.status} (hidden=
                  {String(lookupResult.site.hidden)})
                </p>
                <p className="mt-1 text-webzy-ink/75">
                  Owner: {lookupResult.owner?.email || 'Unknown'}{' '}
                  {lookupResult.owner?.is_banned ? (
                    <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 font-bold text-red-800">
                      BANNED
                    </span>
                  ) : null}{' '}
                  · For: {lookupResult.site.content_json?.receiverName || '—'} · From:{' '}
                  {lookupResult.site.content_json?.senderName || '—'}
                </p>
              </div>
              <a
                href={`${webUrl}/s/${lookupResult.site.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-webzy-primary underline"
              >
                Open Page ↗
              </a>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                suppressHydrationWarning
                type="button"
                disabled={busyKey !== null}
                onClick={() => void handleSiteLookupOrAction('pause')}
                className="min-h-[36px] rounded-lg border border-amber-300 bg-amber-50 px-3 font-bold text-amber-900"
              >
                Pause Page
              </button>
              <button
                suppressHydrationWarning
                type="button"
                disabled={busyKey !== null}
                onClick={() => void handleSiteLookupOrAction('restore')}
                className="min-h-[36px] rounded-lg border border-emerald-300 bg-emerald-50 px-3 font-bold text-emerald-900"
              >
                Restore Live
              </button>
              <button
                suppressHydrationWarning
                type="button"
                disabled={busyKey !== null}
                onClick={() => void handleSiteLookupOrAction('remove')}
                className="min-h-[36px] rounded-lg bg-red-600 px-3 font-bold text-white"
              >
                Remove Page
              </button>
              <button
                suppressHydrationWarning
                type="button"
                disabled={busyKey !== null}
                onClick={() => void handleSiteLookupOrAction('ban_owner')}
                className="min-h-[36px] rounded-lg bg-red-950 px-3 font-bold text-white"
              >
                Ban Owner &amp; Remove All
              </button>
            </div>
          </div>
        ) : null}
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

      {/* Receiver Reports */}
      <div className="mt-6">
        <h3 className="text-sm font-bold text-webzy-ink">
          Receiver Reports ({reports.length})
        </h3>
        {reports.length === 0 ? (
          <p className="mt-2 text-xs text-webzy-ink/60">No receiver reports submitted yet.</p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-webzy-tint bg-webzy-surface/30 p-4 sm:flex-row sm:items-center"
              >
                <div className="text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-webzy-primary">
                      /s/{rep.site_slug}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        rep.status === 'pending'
                          ? 'bg-red-100 text-red-900'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      report: {rep.status}
                    </span>
                    <span className="text-webzy-ink/60">site: {rep.site_status}</span>
                  </div>
                  <p className="mt-1 font-semibold text-webzy-ink">Reason: {rep.reason}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    suppressHydrationWarning
                    type="button"
                    disabled={busyKey === `report:${rep.id}`}
                    onClick={() => void handleQueueAction('report', rep.id, 'restore')}
                    className="min-h-[36px] rounded-full border border-emerald-300 bg-white px-3.5 text-xs font-bold text-emerald-800 disabled:opacity-50"
                  >
                    Restore Live
                  </button>
                  <button
                    suppressHydrationWarning
                    type="button"
                    disabled={busyKey === `report:${rep.id}`}
                    onClick={() => void handleQueueAction('report', rep.id, 'remove')}
                    className="min-h-[36px] rounded-full bg-red-600 px-3.5 text-xs font-bold text-white disabled:opacity-50"
                  >
                    Remove
                  </button>
                  <button
                    suppressHydrationWarning
                    type="button"
                    disabled={busyKey === `report:${rep.id}`}
                    onClick={() => void handleQueueAction('report', rep.id, 'ban_user')}
                    className="min-h-[36px] rounded-full bg-red-950 px-3.5 text-xs font-bold text-white disabled:opacity-50"
                  >
                    Ban Sender
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formal Takedown Notices */}
      <div className="mt-6">
        <h3 className="text-sm font-bold text-webzy-ink">
          Formal Takedown Notices ({takedowns.length})
        </h3>
        {takedowns.length === 0 ? (
          <p className="mt-2 text-xs text-webzy-ink/60">
            No formal /takedown notices submitted yet.
          </p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {takedowns.map((td) => (
              <div
                key={td.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-webzy-tint bg-webzy-surface/30 p-4 sm:flex-row sm:items-center"
              >
                <div className="max-w-xl text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                      {td.category}
                    </span>
                    <span className="font-mono font-bold text-webzy-primary">
                      {td.site_slug ? `/s/${td.site_slug}` : 'No slug provided'}
                    </span>
                    <span className="text-webzy-ink/60">status: {td.status}</span>
                  </div>
                  <p className="mt-1 font-semibold text-webzy-ink">
                    {td.reporter_name} ({td.reporter_email})
                  </p>
                  <p className="mt-0.5 text-webzy-ink/75">{td.details}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {td.site_id ? (
                    <>
                      <button
                        suppressHydrationWarning
                        type="button"
                        disabled={busyKey === `takedown:${td.id}`}
                        onClick={() => void handleQueueAction('takedown', td.id, 'hide_site')}
                        className="min-h-[36px] rounded-full border border-amber-300 bg-white px-3.5 text-xs font-bold text-amber-900 disabled:opacity-50"
                      >
                        Keep Hidden
                      </button>
                      <button
                        suppressHydrationWarning
                        type="button"
                        disabled={busyKey === `takedown:${td.id}`}
                        onClick={() => void handleQueueAction('takedown', td.id, 'remove')}
                        className="min-h-[36px] rounded-full bg-red-600 px-3.5 text-xs font-bold text-white disabled:opacity-50"
                      >
                        Remove Site
                      </button>
                    </>
                  ) : null}
                  <button
                    suppressHydrationWarning
                    type="button"
                    disabled={busyKey === `takedown:${td.id}`}
                    onClick={() => void handleQueueAction('takedown', td.id, 'dismiss')}
                    className="min-h-[36px] rounded-full border border-webzy-tint bg-white px-3.5 text-xs font-bold text-webzy-ink disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
