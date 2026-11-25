'use client';

import React, { useEffect, useState } from 'react';

export interface AdminUserItem {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  role: string;
  is_banned: boolean;
  created_at: string;
  ordersCount: number;
  sitesCount: number;
}

interface AdminUsersClientProps {
  initialUsers: AdminUserItem[];
}

export function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(initialUsers.length >= 50);
  const [loadingMore, setLoadingMore] = useState(false);
  const [query, setQuery] = useState('');
  const [segment, setSegment] = useState<'all' | 'paid' | 'banned' | 'admins'>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Inline Ban / Unban modal
  const [banTarget, setBanTarget] = useState<AdminUserItem | null>(null);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    setUsers(initialUsers);
    setTotalCount(null);
    setHasMore(initialUsers.length >= 50);
  }, [initialUsers]);

  useEffect(() => {
    if (!banTarget) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setBanTarget(null);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [banTarget]);

  async function handleLoadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/users?limit=50&offset=${users.length}`);
      const data = (await res.json()) as {
        ok?: boolean;
        users?: AdminUserItem[];
        pagination?: { limit: number; offset: number; total: number };
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to load more users.');
      }
      const incoming = data.users || [];
      const total = typeof data.pagination?.total === 'number' ? data.pagination.total : null;
      if (total !== null) {
        setTotalCount(total);
      }
      const existingIds = new Set(users.map((u) => u.id));
      const uniqueIncoming = incoming.filter((item) => !existingIds.has(item.id));
      const nextCount = users.length + uniqueIncoming.length;

      setUsers((prev) => {
        const seen = new Set(prev.map((u) => u.id));
        const deduped = incoming.filter((item) => !seen.has(item.id));
        return [...prev, ...deduped];
      });

      if (total !== null) {
        setHasMore(nextCount < total && incoming.length > 0);
      } else {
        setHasMore(incoming.length >= 50);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error loading more users.');
    } finally {
      setLoadingMore(false);
    }
  }

  const filtered = users.filter((u) => {
    if (segment === 'paid' && u.ordersCount <= 0) return false;
    if (segment === 'banned' && !u.is_banned) return false;
    if (segment === 'admins' && u.role !== 'admin') return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q))
    );
  });

  const totalRegistered = users.length;
  const totalPaidCustomers = users.filter((u) => u.ordersCount > 0).length;
  const totalBanned = users.filter((u) => u.is_banned).length;

  async function handleConfirmToggleBan(e: React.FormEvent) {
    e.preventDefault();
    if (!banTarget) return;
    const nextBan = !banTarget.is_banned;

    setBusyId(banTarget.id);
    setErrorMsg('');
    setNotice('');
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: banTarget.id,
          isBanned: nextBan,
          reason: banReason.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to update user status.');

      setUsers((prev) =>
        prev.map((u) => (u.id === banTarget.id ? { ...u, is_banned: nextBan } : u)),
      );
      setNotice(`Account ${banTarget.email} is now ${nextBan ? 'restricted' : 'active'}.`);
      setBanTarget(null);
      setBanReason('');
      window.dispatchEvent(new Event('webzy_admin_mutated'));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error updating user.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-xl font-bold text-webzy-ink">Users Directory</h2>
            <span className="rounded-full bg-webzy-tint px-2.5 py-0.5 text-xs font-bold text-webzy-primary font-tabular">
              {totalCount ?? totalRegistered} Accounts
            </span>
          </div>
          <p className="mt-1 text-xs text-webzy-ink/70">
            Search registered customer and admin profiles, inspect order counts, and manage account restrictions.
          </p>
        </div>

        <input
          suppressHydrationWarning
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs text-webzy-ink outline-none focus:border-webzy-primary focus:bg-white sm:w-72"
        />
      </div>

      {/* Filter Segment Pills */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(
          [
            { id: 'all', label: `All (${totalRegistered})` },
            { id: 'paid', label: `Paying Customers (${totalPaidCustomers})` },
            { id: 'banned', label: `Restricted (${totalBanned})` },
            { id: 'admins', label: `Admins (${users.filter((u) => u.role === 'admin').length})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSegment(tab.id)}
            className={`inline-flex min-h-[44px] items-center rounded-full px-4 text-xs font-bold transition ${segment === tab.id
              ? 'bg-webzy-primary text-white shadow-btn-primary'
              : 'border border-slate-200 bg-slate-50/70 text-webzy-ink hover:border-webzy-primary/40 hover:bg-slate-100'
              }`}
          >
            {tab.label}
          </button>
        ))}
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

      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70">
            <tr className="border-b border-slate-200 font-bold text-slate-600">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Paid Orders</th>
              <th className="px-4 py-3">Sites</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-webzy-ink/60">
                  {query ? 'No matching users found.' : 'No users in this segment.'}
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <p className="font-bold text-webzy-ink">{user.full_name || 'Unnamed User'}</p>
                    <p className="font-mono text-[11px] text-webzy-ink/65">{user.email}</p>
                    {user.phone ? <p className="text-[11px] text-webzy-ink/50 font-tabular">{user.phone}</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${user.role === 'admin'
                        ? 'bg-purple-100 text-purple-900'
                        : 'border border-slate-200 bg-slate-50 text-webzy-ink/70'
                        }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-tabular">
                    <span
                      className={`font-semibold ${user.ordersCount > 0 ? 'text-emerald-700' : 'text-webzy-ink/50'
                        }`}
                    >
                      {user.ordersCount} paid
                    </span>
                  </td>
                  <td className="px-4 py-3 font-tabular">
                    <span className="font-semibold text-webzy-ink">{user.sitesCount} links</span>
                  </td>
                  <td suppressHydrationWarning className="px-4 py-3 text-webzy-ink/65 font-tabular">
                    {user.created_at ? user.created_at.slice(0, 10) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${user.is_banned
                        ? 'bg-red-100 text-red-900'
                        : 'bg-emerald-100 text-emerald-900'
                        }`}
                    >
                      {user.is_banned ? 'Restricted' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.role !== 'admin' ? (
                      <button
                        suppressHydrationWarning
                        type="button"
                        disabled={busyId === user.id}
                        onClick={() => {
                          setBanTarget(user);
                          setBanReason('');
                        }}
                        className={`inline-flex min-h-[44px] items-center rounded-xl px-3.5 text-xs font-bold transition disabled:opacity-50 ${user.is_banned
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'border border-red-200 bg-red-50 text-red-800 hover:bg-red-100'
                          }`}
                      >
                        {busyId === user.id ? '...' : user.is_banned ? 'Unban' : 'Restrict'}
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-webzy-ink/40">Protected</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-600 font-tabular">
          Showing {users.length}
          {totalCount !== null ? ` of ${totalCount}` : ''} loaded users
        </p>
        {hasMore && (totalCount === null || users.length < totalCount) ? (
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => void handleLoadMore()}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-800 shadow-xs transition hover:border-webzy-primary/50 hover:bg-slate-50 disabled:opacity-50"
          >
            {loadingMore ? 'Loading more...' : 'Load More'}
          </button>
        ) : null}
      </div>

      {/* Inline Restrict / Unban Confirmation Modal */}
      {banTarget ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ban-modal-title"
          onClick={() => setBanTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-in w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 id="ban-modal-title" className="font-heading text-lg font-bold text-webzy-ink">
                {banTarget.is_banned ? 'Restore Account Access' : 'Restrict User Account'}
              </h3>
              <button
                type="button"
                aria-label="Close user restriction modal"
                onClick={() => setBanTarget(null)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-webzy-ink/60 hover:bg-slate-100"
              >
                ×
              </button>
            </div>
            <p className="mt-1 text-xs text-webzy-ink/70">
              {banTarget.is_banned
                ? `Unban ${banTarget.email} so they can create and edit Webzy pages again.`
                : `Restrict ${banTarget.email} from creating or editing Webzy pages.`}
            </p>
            <form onSubmit={handleConfirmToggleBan} className="mt-4 space-y-3 text-xs">
              <div>
                <label htmlFor="ban-reason" className="block font-bold text-webzy-ink">
                  Audit Note (optional)
                </label>
                <input
                  id="ban-reason"
                  type="text"
                  maxLength={180}
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Reason for audit log..."
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-webzy-ink outline-none focus:border-webzy-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBanTarget(null)}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-slate-200 px-4 font-bold text-webzy-ink hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busyId === banTarget.id}
                  className={`inline-flex min-h-[44px] items-center rounded-full px-5 font-bold text-white disabled:opacity-50 ${banTarget.is_banned ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                  {banTarget.is_banned ? 'Confirm Unban' : 'Confirm Restrict'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
