'use client';

import React, { useState } from 'react';

export interface AdminWaitlistItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  business_name: string;
  city: string;
  notes: string;
  status: 'waitlisted' | 'contacted' | 'converted';
  created_at: string;
}

interface AdminWaitlistClientProps {
  initialWaitlist: AdminWaitlistItem[];
}

export function AdminWaitlistClient({ initialWaitlist }: AdminWaitlistClientProps) {
  const [items, setItems] = useState<AdminWaitlistItem[]>(initialWaitlist);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const filtered = items.filter((item) => {
    if (filterCat !== 'all' && item.category !== filterCat) return false;
    return true;
  });

  async function handleStatusChange(id: string, newStatus: 'waitlisted' | 'contacted' | 'converted') {
    setBusyId(id);
    setErrorMsg('');
    setNotice('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to update status.');

      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i)),
      );
      setNotice(`Updated lead status to ${newStatus}.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error updating status.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-webzy-tint bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-xl font-bold text-webzy-ink">
              Studio Waitlist (15-Day Pipeline)
            </h2>
            <span className="rounded-full bg-webzy-tint px-2.5 py-0.5 text-xs font-bold text-webzy-primary">
              {items.length} Leads
            </span>
          </div>
          <p className="mt-1 text-xs text-webzy-ink/70">
            Incoming coaching institutes, clinics, and e-commerce stores waiting for Webzy Studio scratch builds.
          </p>
        </div>

        <div>
          <select
            suppressHydrationWarning
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="min-h-[40px] rounded-xl border border-webzy-tint bg-webzy-surface px-3 text-xs text-webzy-ink outline-none"
          >
            <option value="all">All Categories</option>
            <option value="coaching">Coaching &amp; Institutes</option>
            <option value="medical">Doctors &amp; Clinics</option>
            <option value="ecommerce">E-Commerce &amp; Retail</option>
            <option value="custom_business">Local Services</option>
          </select>
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
              <th className="pb-3 pr-4">Lead / Business</th>
              <th className="pb-3 pr-4">Category</th>
              <th className="pb-3 pr-4">Contact</th>
              <th className="pb-3 pr-4">Requirements</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-webzy-tint/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-webzy-ink/60">
                  No waitlist leads yet in this category.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const cleanPhone = item.phone.replace(/[^0-9]/g, '');
                const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : '';
                return (
                  <tr key={item.id} className="hover:bg-webzy-surface/30">
                    <td className="py-3 pr-4">
                      <p className="font-bold text-webzy-ink">{item.name}</p>
                      <p className="text-[11px] text-webzy-ink/70">
                        {item.business_name || 'Personal/New brand'}
                      </p>
                      {item.city ? (
                        <p className="text-[11px] text-webzy-ink/50">City: {item.city}</p>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-webzy-surface px-2.5 py-0.5 text-[10px] font-bold uppercase text-webzy-ink/80">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-mono text-[11px] text-webzy-ink">{item.email}</p>
                      {item.phone ? (
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[11px] text-webzy-ink/70">{item.phone}</span>
                          {waLink ? (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-200"
                            >
                              WhatsApp ↗
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 max-w-xs text-[11px] text-webzy-ink/80">
                      {item.notes || 'No specific notes'}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          item.status === 'converted'
                            ? 'bg-emerald-100 text-emerald-900'
                            : item.status === 'contacted'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <select
                        suppressHydrationWarning
                        disabled={busyId === item.id}
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(
                            item.id,
                            e.target.value as 'waitlisted' | 'contacted' | 'converted',
                          )
                        }
                        className="rounded-lg border border-webzy-tint bg-white px-2 py-1 text-[11px] font-medium text-webzy-ink outline-none"
                      >
                        <option value="waitlisted">Waitlisted</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                      </select>
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
