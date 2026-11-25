'use client';

import React, { useEffect, useState } from 'react';

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

function getThemeId(site: AdminSiteItem): string {
  const rel = site.theme_versions;
  if (!rel) return '';
  return (Array.isArray(rel) ? rel[0]?.theme_id : rel.theme_id) || '';
}

function formatIstDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    }).format(d);
  } catch {
    return iso.slice(0, 10);
  }
}

function isExpiringWithin7Days(site: AdminSiteItem): boolean {
  if (!site.expires_at || site.status === 'expired') return false;
  const expMs = Date.parse(site.expires_at);
  if (Number.isNaN(expMs)) return false;
  const diffMs = expMs - Date.now();
  return diffMs > 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
}

function hasSecretPin(site: AdminSiteItem): boolean {
  const content = (site.content_json as Record<string, unknown>) || {};
  return typeof content.secretPinHash === 'string' && content.secretPinHash.length >= 32;
}

export interface SiteRsvpEntry {
  guestName: string;
  phone?: string;
  attending: boolean;
  guestCount: number;
  mealPreference?: string | null;
  wishes?: string;
  submittedAt?: string;
}

function extractRsvpResponses(site: AdminSiteItem): SiteRsvpEntry[] {
  const content = (site.content_json as Record<string, unknown>) || {};
  const list = content.rsvpResponses;
  if (!Array.isArray(list)) return [];
  return list.filter(
    (entry): entry is SiteRsvpEntry =>
      Boolean(entry && typeof entry === 'object' && typeof (entry as SiteRsvpEntry).guestName === 'string'),
  );
}

function extractSiteParticipants(site: AdminSiteItem): {
  receiverDisplay: string;
  senderDisplay: string;
  brideName: string;
  groomName: string;
  personalMessage: string;
} {
  const content = (site.content_json as Record<string, unknown>) || {};
  const wd =
    content.weddingData && typeof content.weddingData === 'object'
      ? (content.weddingData as Record<string, unknown>)
      : null;
  const couple =
    wd?.couple && typeof wd.couple === 'object' ? (wd.couple as Record<string, unknown>) : null;

  const brideName =
    (typeof wd?.brideName === 'string' && wd.brideName.trim()) ||
    (typeof couple?.brideName === 'string' && couple.brideName.trim()) ||
    '';
  const groomName =
    (typeof wd?.groomName === 'string' && wd.groomName.trim()) ||
    (typeof couple?.groomName === 'string' && couple.groomName.trim()) ||
    '';
  const coupleCombined =
    brideName && groomName ? `${brideName} & ${groomName}` : brideName || groomName;

  const topReceiver =
    typeof content.receiverName === 'string' ? content.receiverName.trim() : '';
  const topSender = typeof content.senderName === 'string' ? content.senderName.trim() : '';
  const parentsFallback =
    (typeof wd?.brideParents === 'string' && wd.brideParents.trim()) ||
    (typeof wd?.groomParents === 'string' && wd.groomParents.trim()) ||
    '';
  const personalMessage =
    (typeof content.message === 'string' && content.message) ||
    (typeof wd?.personalMessage === 'string' && wd.personalMessage) ||
    '';

  return {
    receiverDisplay: topReceiver || coupleCombined || 'Recipient',
    senderDisplay: topSender || parentsFallback || 'Host',
    brideName,
    groomName,
    personalMessage,
  };
}

type QuickPillFilter = 'all' | 'wedding' | 'occasion' | 'pin_locked' | 'expiring_7d';

export function AdminSitesClient({ initialSites, webUrl }: AdminSitesClientProps) {
  const [sites, setSites] = useState<AdminSiteItem[]>(initialSites);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'wedding' | 'occasion'>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmPurgeId, setConfirmPurgeId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState('');

  // Live Typo Hot-Fixer Modal
  const [editingSite, setEditingSite] = useState<AdminSiteItem | null>(null);
  const [editReceiverName, setEditReceiverName] = useState('');
  const [editSenderName, setEditSenderName] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Live Wedding RSVPs Inspector Modal
  const [rsvpInspectSite, setRsvpInspectSite] = useState<AdminSiteItem | null>(null);

  useEffect(() => {
    setSites(initialSites);
  }, [initialSites]);

  useEffect(() => {
    if (!editingSite && !rsvpInspectSite) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setEditingSite(null);
        setRsvpInspectSite(null);
        setErrorMsg('');
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editingSite, rsvpInspectSite]);

  const filtered = sites.filter((site) => {
    const themeId = getThemeId(site);
    const isWedding = themeId.startsWith('wedding-');
    if (typeFilter === 'wedding' && !isWedding) return false;
    if (typeFilter === 'occasion' && isWedding) return false;
    if (filterStatus !== 'all' && site.status !== filterStatus) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const content = (site.content_json as Record<string, string>) || {};
    const receiver = (content.receiverName || '').toLowerCase();
    const sender = (content.senderName || '').toLowerCase();
    return (
      site.slug.toLowerCase().includes(q) ||
      receiver.includes(q) ||
      sender.includes(q) ||
      themeId.toLowerCase().includes(q)
    );
  });

  async function handleCopy(url: string, id: string) {
    await navigator.clipboard.writeText(url).catch(() => { });
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  }

  function openEditModal(site: AdminSiteItem) {
    const content = (site.content_json as Record<string, unknown>) || {};
    const wd =
      content.weddingData && typeof content.weddingData === 'object'
        ? (content.weddingData as Record<string, string>)
        : null;
    setEditingSite(site);
    setEditReceiverName(
      (typeof content.receiverName === 'string' && content.receiverName) ||
      (wd ? `${wd.brideName || ''} & ${wd.groomName || ''}`.trim() : ''),
    );
    setEditSenderName(
      (typeof content.senderName === 'string' && content.senderName) ||
      wd?.brideParents ||
      '',
    );
    setEditMessage(
      (typeof content.message === 'string' && content.message) ||
      wd?.personalMessage ||
      '',
    );
  }

  async function handleSaveContent(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSite) return;

    setSavingEdit(true);
    setErrorMsg('');
    setNotice('');

    try {
      const res = await fetch('/api/sites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: editingSite.id,
          action: 'update_content',
          content: {
            receiverName: editReceiverName,
            senderName: editSenderName,
            message: editMessage,
          },
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to update site content.');

      setSites((prev) =>
        prev.map((s) => {
          if (s.id !== editingSite.id) return s;
          const currentContent = (s.content_json as Record<string, unknown>) || {};
          return {
            ...s,
            content_json: {
              ...currentContent,
              receiverName: editReceiverName,
              senderName: editSenderName,
              message: editMessage,
            },
          };
        }),
      );

      setNotice(`Hot-fixed live content for /s/${editingSite.slug}.`);
      setEditingSite(null);
      window.dispatchEvent(new Event('webzy_admin_mutated'));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error updating content.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleSiteAction(
    siteId: string,
    action: 'pause' | 'unpause' | 'extend_30d' | 'purge_photos' | 'clear_pin',
  ) {
    setBusyId(siteId);
    setErrorMsg('');
    setNotice('');
    try {
      const res = await fetch('/api/sites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, action }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; expires_at?: string };
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
              expires_at: data.expires_at || new Date(Math.max(Date.now(), base) + 30 * 86400000).toISOString(),
            };
          }
          if (action === 'clear_pin') {
            const nextContent = { ...((s.content_json as Record<string, unknown>) || {}) };
            delete nextContent.secretPinHash;
            delete nextContent.secretPinEnabled;
            return { ...s, content_json: nextContent };
          }
          if (action === 'purge_photos') {
            const currentContent = (s.content_json as Record<string, unknown>) || {};
            return { ...s, content_json: { ...currentContent, photos: [] } };
          }
          return s;
        }),
      );
      setConfirmPurgeId(null);
      setNotice(`Site action "${action.replace('_', ' ')}" completed successfully.`);
      window.dispatchEvent(new Event('webzy_admin_mutated'));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error executing action.');
    } finally {
      setBusyId(null);
    }
  }

  const editingIsWedding = editingSite ? getThemeId(editingSite).startsWith('wedding-') : false;

  return (
    <section className="rounded-3xl border border-webzy-tint bg-white p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-xl font-bold text-webzy-ink">
              Live Sites &amp; Typo Hot-Fixer
            </h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
              {sites.filter((s) => s.status === 'live' && !s.hidden).length} Active
            </span>
          </div>
          <p className="mt-1 text-xs text-webzy-ink/70">
            Hot-fix spelling typos (both Occasions and Weddings), unlock forgotten PINs, extend validity, or purge photos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter site type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'wedding' | 'occasion')}
            className="min-h-[38px] rounded-xl border border-webzy-tint bg-webzy-surface px-3 text-xs font-semibold text-webzy-ink outline-none"
          >
            <option value="all">All types</option>
            <option value="wedding">Weddings only</option>
            <option value="occasion">Occasions only</option>
          </select>

          <select
            suppressHydrationWarning
            aria-label="Filter site status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="min-h-[38px] rounded-xl border border-webzy-tint bg-webzy-surface px-3 text-xs font-semibold text-webzy-ink outline-none"
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
            placeholder="Search slug, couple, or theme..."
            className="min-h-[38px] w-48 rounded-xl border border-webzy-tint bg-webzy-surface px-3 text-xs text-webzy-ink outline-none focus:border-webzy-primary sm:w-56"
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
              <th className="pb-3 pr-4">Link / Theme</th>
              <th className="pb-3 pr-4">Recipient &amp; Sender</th>
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
                const content = (site.content_json as Record<string, unknown>) || {};
                const themeId = getThemeId(site);
                const isWedding = themeId.startsWith('wedding-');
                const hasPin = typeof content.secretPinHash === 'string' && content.secretPinHash.length >= 32;
                const rsvpList = isWedding ? extractRsvpResponses(site) : [];
                const liveUrl = `${webUrl.replace(/\/$/, '')}/s/${site.slug}`;
                const isHidden = site.hidden || site.status === 'hidden';

                return (
                  <tr key={site.id} className="transition-colors hover:bg-webzy-surface/50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono font-bold text-webzy-primary hover:underline"
                        >
                          /s/{site.slug}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopy(liveUrl, site.id)}
                          className="rounded-md border border-webzy-tint bg-white px-2 py-0.5 text-[10px] font-semibold text-webzy-ink hover:bg-webzy-surface"
                        >
                          {copiedId === site.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase ${isWedding
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-webzy-surface text-webzy-ink/70'
                            }`}
                        >
                          {isWedding ? 'Wedding' : 'Occasion'}
                        </span>
                        {hasPin ? (
                          <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-indigo-900">
                            PIN Locked
                          </span>
                        ) : null}
                        <span suppressHydrationWarning className="text-[10.5px] text-webzy-ink/50">
                          {site.created_at ? site.created_at.slice(0, 10) : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-bold text-webzy-ink">
                        {String(content.receiverName || 'Recipient')}
                      </p>
                      <p className="text-[11px] text-webzy-ink/65">
                        From {String(content.senderName || 'Host')}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${isHidden
                          ? 'bg-amber-100 text-amber-900'
                          : site.status === 'expired'
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-emerald-100 text-emerald-900'
                          }`}
                      >
                        {isHidden ? 'Paused' : site.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-webzy-ink font-tabular">
                      {site.views_count}
                    </td>
                    <td suppressHydrationWarning className="py-3 pr-4 text-webzy-ink/70 font-tabular">
                      {site.expires_at ? site.expires_at.slice(0, 10) : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(site)}
                          className="min-h-[30px] rounded-lg border border-webzy-tint bg-white px-2.5 text-[11px] font-semibold text-webzy-primary hover:bg-webzy-surface"
                        >
                          Hot-Fix
                        </button>
                        {isWedding ? (
                          <button
                            type="button"
                            onClick={() => setRsvpInspectSite(site)}
                            className={`min-h-[30px] rounded-lg border px-2.5 text-[11px] font-semibold transition ${rsvpList.length > 0
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                              : 'border-webzy-tint bg-white text-webzy-ink/70 hover:bg-webzy-surface'
                              }`}
                          >
                            RSVPs ({rsvpList.length})
                          </button>
                        ) : null}
                        {hasPin ? (
                          <button
                            type="button"
                            disabled={busyId === site.id}
                            onClick={() => void handleSiteAction(site.id, 'clear_pin')}
                            className="min-h-[30px] rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 text-[11px] font-semibold text-indigo-900 hover:bg-indigo-100 disabled:opacity-50"
                          >
                            Unlock PIN
                          </button>
                        ) : null}
                        <button
                          suppressHydrationWarning
                          type="button"
                          disabled={busyId === site.id}
                          onClick={() => handleSiteAction(site.id, isHidden ? 'unpause' : 'pause')}
                          className={`min-h-[30px] rounded-lg px-2.5 text-[11px] font-semibold transition disabled:opacity-50 ${isHidden
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
                          className="min-h-[30px] rounded-lg border border-webzy-tint bg-white px-2.5 text-[11px] font-semibold text-webzy-ink hover:bg-webzy-surface disabled:opacity-50"
                        >
                          +30d
                        </button>
                        {confirmPurgeId === site.id ? (
                          <button
                            type="button"
                            disabled={busyId === site.id}
                            onClick={() => void handleSiteAction(site.id, 'purge_photos')}
                            className="min-h-[30px] rounded-lg bg-red-600 px-2.5 text-[11px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Confirm Purge
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={busyId === site.id}
                            onClick={() => setConfirmPurgeId(site.id)}
                            className="min-h-[30px] rounded-lg border border-red-200 bg-red-50 px-2.5 text-[11px] font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            Purge Media
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Inline Content Typo Hot-Fixer Modal */}
      {editingSite ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-webzy-tint pb-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-webzy-ink">
                  Hot-Fix Live Content: /s/{editingSite.slug}
                </h3>
                <p className="text-xs text-webzy-ink/60">
                  {editingIsWedding
                    ? 'Updates both top-level metadata and weddingData immediately.'
                    : 'Fix typos instantly without changing the live URL.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSite(null)}
                aria-label="Close modal"
                className="flex h-8 w-8 items-center justify-center rounded-full text-webzy-ink/60 hover:bg-webzy-surface"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveContent} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-webzy-ink">
                  {editingIsWedding ? 'Bride & Groom Names (e.g. Aanya & Kabir)' : 'Recipient Name'}
                </label>
                <input
                  type="text"
                  required
                  value={editReceiverName}
                  onChange={(e) => setEditReceiverName(e.target.value)}
                  className="mt-1 min-h-[40px] w-full rounded-xl border border-webzy-tint px-3 text-sm text-webzy-ink outline-none focus:border-webzy-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-webzy-ink">
                  {editingIsWedding ? 'Host Family / Parents Line' : 'Sender Name'}
                </label>
                <input
                  type="text"
                  value={editSenderName}
                  onChange={(e) => setEditSenderName(e.target.value)}
                  className="mt-1 min-h-[40px] w-full rounded-xl border border-webzy-tint px-3 text-sm text-webzy-ink outline-none focus:border-webzy-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-webzy-ink">
                  {editingIsWedding ? 'Personal Family Invitation Message' : 'Message Body'}
                </label>
                <textarea
                  rows={4}
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-webzy-tint p-3 text-sm text-webzy-ink outline-none focus:border-webzy-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSite(null)}
                  className="rounded-full border border-webzy-tint px-4 py-2 font-bold text-webzy-ink hover:bg-webzy-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-full bg-webzy-primary px-5 py-2 font-bold text-white hover:opacity-95 disabled:opacity-50"
                >
                  {savingEdit ? 'Updating Live Site...' : 'Save & Hot-Fix Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Live Wedding RSVPs Inspector Modal */}
      {rsvpInspectSite ? (() => {
        const inspectRsvps = extractRsvpResponses(rsvpInspectSite);
        const participants = extractSiteParticipants(rsvpInspectSite);
        const confirmedGuests = inspectRsvps.reduce(
          (sum, r) => sum + (r.attending ? Math.max(1, r.guestCount || 1) : 0),
          0,
        );
        const vegCount = inspectRsvps.filter((r) => r.attending && r.mealPreference === 'veg').length;
        const jainCount = inspectRsvps.filter((r) => r.attending && r.mealPreference === 'jain').length;
        const nonVegCount = inspectRsvps.filter((r) => r.attending && r.mealPreference === 'nonveg').length;

        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rsvp-inspect-title"
            onClick={() => setRsvpInspectSite(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="animate-scale-in flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-webzy-tint px-6 py-4">
                <div>
                  <h3 id="rsvp-inspect-title" className="font-heading text-lg font-bold text-webzy-ink">
                    Live Wedding RSVPs: {participants.receiverDisplay}
                  </h3>
                  <p className="text-xs text-webzy-ink/60">
                    /s/{rsvpInspectSite.slug} · {inspectRsvps.length} response(s) · {confirmedGuests} confirmed guest(s)
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close RSVP modal"
                  onClick={() => setRsvpInspectSite(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-webzy-ink/60 hover:bg-webzy-surface"
                >
                  ×
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-b border-webzy-tint/60 bg-webzy-surface/40 px-6 py-3 text-xs font-bold font-tabular">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900">
                  Attending Guests: {confirmedGuests}
                </span>
                <span className="rounded-full bg-white border border-webzy-tint px-3 py-1 text-webzy-ink">
                  Pure Veg: {vegCount}
                </span>
                <span className="rounded-full bg-white border border-webzy-tint px-3 py-1 text-webzy-ink">
                  Jain / Special: {jainCount}
                </span>
                <span className="rounded-full bg-white border border-webzy-tint px-3 py-1 text-webzy-ink">
                  Non-Veg: {nonVegCount}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {inspectRsvps.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-webzy-tint p-8 text-center text-xs text-webzy-ink/65">
                    No guest RSVPs recorded yet on /s/{rsvpInspectSite.slug}. Responses appear here in real time when families confirm attendance.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inspectRsvps.map((entry, idx) => {
                      const cleanPhone = (entry.phone || '').replace(/\D/g, '');
                      const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                      return (
                        <div
                          key={`${entry.guestName}-${idx}`}
                          className="rounded-2xl border border-webzy-tint bg-webzy-surface/35 p-4 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-webzy-ink">{entry.guestName}</span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${entry.attending
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-zinc-200 text-zinc-700'
                                  }`}
                              >
                                {entry.attending ? `Attending (${entry.guestCount || 1})` : 'Declined'}
                              </span>
                              {entry.mealPreference ? (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                                  {entry.mealPreference}
                                </span>
                              ) : null}
                            </div>
                            {entry.submittedAt ? (
                              <span className="text-[11px] text-webzy-ink/50 font-tabular">
                                {formatIstDate(entry.submittedAt)}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-webzy-ink/75">
                            {entry.phone ? (
                              <>
                                <span className="font-mono">{entry.phone}</span>
                                {waPhone ? (
                                  <a
                                    href={`https://wa.me/${waPhone}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-bold text-emerald-700 hover:underline"
                                  >
                                    WhatsApp ↗
                                  </a>
                                ) : null}
                              </>
                            ) : null}
                            {entry.wishes ? <span className="italic">&ldquo;{entry.wishes}&rdquo;</span> : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })() : null}
    </section>
  );
}
