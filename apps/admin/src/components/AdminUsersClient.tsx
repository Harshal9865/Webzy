'use client';

import React, { useState } from 'react';

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
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const filtered = users.filter((u) => {
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

  async function handleToggleBan(user: AdminUserItem) {
    const nextBan = !user.is_banned;
    const confirmMsg = nextBan
      ? `Are you sure you want to restrict ${user.email}? They will not be able to create or edit Webzys.`
      : `Unban ${user.email}?`;
    if (!window.confirm(confirmMsg)) return;

    setBusyId(user.id);
    setErrorMsg('');
    setNotice('');
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isBanned: nextBan }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to update user status.');

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_banned: nextBan } : u)),
      );
      setNotice(`User ${user.email} is now ${nextBan ? 'banned' : 'active'}.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error updating user.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-webzy-tint bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-xl font-bold text-webzy-ink">Users Directory</h2>
            <span className="rounded-full bg-webzy-tint px-2.5 py-0.5 text-xs font-bold text-webzy-primary">
              {totalRegistered} Registered Accounts
            </span>
          </div>
          <p className="mt-1 text-xs text-webzy-ink/70">
            Every user here verified their email with OTP during preview or checkout, creating an account in <code>public.profiles</code>.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <input
            suppressHydrationWarning
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="min-h-[42px] w-full rounded-xl border border-webzy-tint bg-webzy-surface px-3 text-xs text-webzy-ink outline-none focus:border-webzy-primary"
          />
        </div>
      </div>

      {/* Mini Funnel Pill Bar */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-webzy-tint bg-webzy-surface/50 p-3 text-center">
          <p className="text-[11px] font-semibold text-webzy-ink/60">Registered Accounts</p>
          <p className="font-heading text-xl font-bold text-webzy-ink">{totalRegistered}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 text-center">
          <p className="text-[11px] font-semibold text-emerald-800">Paid Customers</p>
          <p className="font-heading text-xl font-bold text-emerald-700">{totalPaidCustomers}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3 text-center">
          <p className="text-[11px] font-semibold text-amber-800">Restricted / Banned</p>
          <p className="font-heading text-xl font-bold text-amber-700">{totalBanned}</p>
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

      {/* Users Table */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-webzy-tint font-bold text-webzy-ink/70">
              <th className="pb-3 pr-4">User</th>
              <th className="pb-3 pr-4">Role</th>
              <th className="pb-3 pr-4">Paid Orders</th>
              <th className="pb-3 pr-4">Live Webzys</th>
              <th className="pb-3 pr-4">Joined</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-webzy-tint/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-webzy-ink/60">
                  {query ? 'No matching users found.' : 'No registered users yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-webzy-surface/30">
                  <td className="py-3 pr-4">
                    <p className="font-bold text-webzy-ink">{user.full_name || 'No name'}</p>
                    <p className="font-mono text-[11px] text-webzy-ink/65">{user.email}</p>
                    {user.phone ? (
                      <p className="text-[11px] text-webzy-ink/50">{user.phone}</p>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-webzy-surface text-webzy-ink/70'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`font-semibold ${
                        user.ordersCount > 0 ? 'text-emerald-700' : 'text-webzy-ink/50'
                      }`}
                    >
                      {user.ordersCount} paid
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-semibold text-webzy-ink">{user.sitesCount} links</span>
                  </td>
                  <td suppressHydrationWarning className="py-3 pr-4 text-webzy-ink/65">
                    {user.created_at ? user.created_at.slice(0, 10) : '—'}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        user.is_banned
                          ? 'bg-red-100 text-red-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {user.is_banned ? 'Restricted' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {user.role !== 'admin' ? (
                      <button
                        suppressHydrationWarning
                        type="button"
                        disabled={busyId === user.id}
                        onClick={() => handleToggleBan(user)}
                        className={`min-h-[30px] rounded-lg px-2.5 text-[11px] font-bold transition disabled:opacity-50 ${
                          user.is_banned
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'border border-red-200 bg-red-50 text-red-800 hover:bg-red-100'
                        }`}
                      >
                        {busyId === user.id ? '...' : user.is_banned ? 'Unban' : 'Ban'}
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-webzy-ink/40">Founder</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
