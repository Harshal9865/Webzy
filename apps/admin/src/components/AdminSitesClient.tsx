'use client';

import React, { useState } from 'react';

export interface AdminSiteItem {
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

interface AdminSitesClientProps {
  initialSites: AdminSiteItem[];
  webUrl: string;
}

export function AdminSitesClient({ initialSites, webUrl }: AdminSitesClientProps) {
  const [sites, setSites] = useState<AdminSiteItem[]>(initialSites);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const filtered = sites.filter((site) => {
    if (filterStatus !== 'all' && site.status !== filterStatus) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const content = (site.content_json as Record<string, string>) || {};
    const receiver = (content.receiverName || '').toLowerCase();
    const sender = (content.senderName || '').toLowerCase();
    return site.slug.toLowerCase().includes(q) || receiver.includes(q) || sender.includes(q);
  });

  async function handleSiteAction(siteId: string, action: 'pause' | 'unpause' | 'extend_30d') {
    setBusyId(siteId);
    setErrorMsg('');
    setNotice('');
    try {
      const res = await fetch('/api/sites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, action }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || 'Action failed.');

      setSites((prev) =>
        prev.map((s) => {
          if (s.id !== siteId) return s;
          if (action === 'pause') return { ...s, hidden: true, status: 'hidden' };
          if (action === 'unpause') return { ...s, hidden: false, status: 'live' };
          if (action === 'extend_30d') {
            const base = s.expires_at ? Date.parse(s.expires_at) : Date.now();
            return {
              ...s,
              status: 'live',
              hidden: false,
              expires_at: new Date(Math.max(Date.now(), base) + 30 * 86400000).toISOString(),
            };
          }
          return s;
        }),
      );
      setNotice(`Site action "${action}" completed successfully.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error executing action.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-webzy-tint bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-xl font-bold text-webzy-ink">Live Webzys Explorer</h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
              {sites.filter((s) => s.status === 'live' && !s.hidden).length} Active Live Links
            </span>
          </div>
          <p className="mt-1 text-xs text-webzy-ink/70">
            Monitor and manage published recipient links, view counts, expiry windows, or pause content.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            suppressHydrationWarning
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="min-h-[40px] rounded-xl border border-webzy-tint bg-webzy-surface px-3 text-xs text-webzy-ink outline-none"
          >
            <option value="all">All statuses</option>
            <option value="live">Live only</option>
            <option value="hidden">Paused / Hidden</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
          </select>

          <input
            suppressHydrationWarning
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search slug or names..."
            className="min-h-[40px] w-48 rounded-xl border border-webzy-tint bg-webzy-surface px-3 text-xs text-webzy-ink outline-none focus:border-webzy-primary sm:w-60"
          />
        </div>
      </div>

      {notice ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900">
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

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-webzy-tint font-bold text-webzy-ink/70">
              <th className="pb-3 pr-4">Link / Slug</th>
              <th className="pb-3 pr-4">Receiver &amp; Sender</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Views</th>
              <th className="pb-3 pr-4">Expires</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-webzy-tint/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-webzy-ink/60">
                  No Webzy links match current filters.
                </td>
              </tr>
            ) : (
              filtered.map((site) => {
                const content = (site.content_json as Record<string, string>) || {};
                const liveUrl = `${webUrl.replace(/\/$/, '')}/s/${site.slug}`;
                const isHidden = site.hidden || site.status === 'hidden';
                return (
                  <tr key={site.id} className="hover:bg-webzy-surface/30">
                    <td className="py-3 pr-4">
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono font-bold text-webzy-primary hover:underline"
                      >
                        /s/{site.slug} ↗
                      </a>
                      <p suppressHydrationWarning className="text-[11px] text-webzy-ink/50">
                        Created {site.created_at ? site.created_at.slice(0, 10) : '—'}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-bold text-webzy-ink">
                        For {content.receiverName || 'Recipient'}
                      </p>
                      <p className="text-[11px] text-webzy-ink/65">
                        From {content.senderName || 'Anonymous'}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          isHidden
                            ? 'bg-amber-100 text-amber-900'
                            : site.status === 'expired'
                              ? 'bg-gray-200 text-gray-700'
                              : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {isHidden ? 'Paused' : site.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-webzy-ink">
                      {site.views_count} view{site.views_count === 1 ? '' : 's'}
                    </td>
                    <td suppressHydrationWarning className="py-3 pr-4 text-webzy-ink/70">
                      {site.expires_at ? site.expires_at.slice(0, 10) : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          suppressHydrationWarning
                          type="button"
                          disabled={busyId === site.id}
                          onClick={() => handleSiteAction(site.id, isHidden ? 'unpause' : 'pause')}
                          className={`min-h-[28px] rounded-lg px-2 text-[11px] font-semibold transition disabled:opacity-50 ${
                            isHidden
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                          }`}
                        >
                          {isHidden ? 'Resume' : 'Pause'}
                        </button>
                        <button
                          suppressHydrationWarning
                          type="button"
                          disabled={busyId === site.id}
                          onClick={() => handleSiteAction(site.id, 'extend_30d')}
                          className="min-h-[28px] rounded-lg border border-webzy-tint bg-white px-2 text-[11px] font-semibold text-webzy-ink hover:bg-webzy-surface disabled:opacity-50"
                        >
                          +30 Days
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
