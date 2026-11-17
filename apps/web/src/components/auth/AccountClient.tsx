'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { formatInr, type UserProfileRecord } from '@webzy/core';
import { getSupabaseBrowserClient } from '../../../../../infra/supabase/browser';

export interface AccountSiteItem {
  id: string;
  slug: string;
  liveUrl: string;
  themeName: string;
  receiverName: string;
  status: string;
  hidden: boolean;
  viewsCount: number;
  firstOpenedAt: string | null;
  replyText: string | null;
  canFreeEdit: boolean;
  freeEditUntil: string | null;
  expiresAt: string;
}

export interface AccountOrderItem {
  id: string;
  amountInr: number;
  status: string;
  invoiceNumber: string;
  createdAt: string;
  paymentId: string | null;
  siteSlug: string | null;
}

interface AccountClientProps {
  profile: UserProfileRecord;
  consentRecordsCount: number;
  sites: AccountSiteItem[];
  orders?: AccountOrderItem[];
}

function formatDateIst(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function AccountClient({
  profile,
  consentRecordsCount,
  sites,
  orders = [],
}: AccountClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'sites' | 'orders' | 'privacy' | 'profile'>('sites');
  const [siteItems, setSiteItems] = useState<AccountSiteItem[]>(sites);
  const [orderItems] = useState<AccountOrderItem[]>(orders);
  const [copiedId, setCopiedId] = useState<string>('');
  const [togglingId, setTogglingId] = useState<string>('');
  const [siteActionError, setSiteActionError] = useState<string>('');

  // Receipt Modal State
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<AccountOrderItem | null>(null);

  // Photo Purge State
  const [purgingSite, setPurgingSite] = useState<AccountSiteItem | null>(null);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeNotice, setPurgeNotice] = useState('');

  // Profile Form State
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [consentTotal, setConsentTotal] = useState(consentRecordsCount);

  async function handleCopy(site: AccountSiteItem) {
    await navigator.clipboard.writeText(site.liveUrl).catch(() => {});
    setCopiedId(site.id);
    setTimeout(() => setCopiedId(''), 2000);
  }

  async function handleToggleVisibility(site: AccountSiteItem) {
    setTogglingId(site.id);
    setSiteActionError('');
    try {
      const action = site.hidden ? 'unhide' : 'hide';
      const res = await fetch('/api/sites/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: site.id, action }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        hidden?: boolean;
        status?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Could not update page visibility.');
      }
      setSiteItems((prev) =>
        prev.map((item) =>
          item.id === site.id
            ? { ...item, hidden: Boolean(data.hidden), status: data.status || item.status }
            : item,
        ),
      );
      router.refresh();
    } catch (err) {
      setSiteActionError(err instanceof Error ? err.message : 'Unable to update page status.');
    } finally {
      setTogglingId('');
    }
  }

  async function handleConfirmPurgePhotos(site: AccountSiteItem) {
    setIsPurging(true);
    setSiteActionError('');
    setPurgeNotice('');
    try {
      const res = await fetch('/api/uploads/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: site.id }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to purge photos.');
      }

      setPurgeNotice(`All photos for "${site.receiverName}" were permanently deleted from cloud storage.`);
      setPurgingSite(null);
      router.refresh();
    } catch (err) {
      setSiteActionError(err instanceof Error ? err.message : 'Unable to purge photos right now.');
    } finally {
      setIsPurging(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedNotice('');
    setErrorMsg('');

    try {
      const payload: Record<string, unknown> = {
        fullName,
        phone,
      };
      if (ageConfirmed || termsAccepted) {
        payload.consent = {
          ageOrParentConfirmed: ageConfirmed,
          termsAndRefundAccepted: termsAccepted,
        };
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        error?: string;
        consentRecorded?: number;
      };

      if (!res.ok) {
        setErrorMsg(data.error || 'Could not save profile. Please retry.');
        return;
      }

      if (typeof data.consentRecorded === 'number' && data.consentRecorded > 0) {
        setConsentTotal((prev) => prev + data.consentRecorded!);
      }
      setSavedNotice('Details saved cleanly.');
    } catch {
      setErrorMsg('Network error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } finally {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-webzy-tint px-3 py-1 text-xs font-bold text-webzy-primary">
            Signed in as {profile.email}
          </span>
          <h1 className="mt-2 font-heading text-3xl font-bold text-webzy-ink">
            My Account & Orders
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/themes"
            className="inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-5 text-xs font-bold text-white shadow-sm hover:opacity-95"
          >
            + Create New Webzy
          </Link>
          <button
            suppressHydrationWarning
            type="button"
            onClick={handleSignOut}
            className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-white px-5 text-xs font-bold text-webzy-ink hover:bg-webzy-surface"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-8 flex border-b border-webzy-tint gap-2 overflow-x-auto pb-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('sites')}
          className={`min-h-[42px] rounded-t-2xl px-5 transition ${
            activeTab === 'sites'
              ? 'border-b-2 border-webzy-primary bg-white text-webzy-primary shadow-xs'
              : 'text-webzy-ink/70 hover:text-webzy-ink hover:bg-white/40'
          }`}
        >
          My Webzys ({siteItems.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`min-h-[42px] rounded-t-2xl px-5 transition ${
            activeTab === 'orders'
              ? 'border-b-2 border-webzy-primary bg-white text-webzy-primary shadow-xs'
              : 'text-webzy-ink/70 hover:text-webzy-ink hover:bg-white/40'
          }`}
        >
          Orders & Tax Invoices ({orderItems.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`min-h-[42px] rounded-t-2xl px-5 transition ${
            activeTab === 'privacy'
              ? 'border-b-2 border-webzy-primary bg-white text-webzy-primary shadow-xs'
              : 'text-webzy-ink/70 hover:text-webzy-ink hover:bg-white/40'
          }`}
        >
          Privacy & Photo Vault
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`min-h-[42px] rounded-t-2xl px-5 transition ${
            activeTab === 'profile'
              ? 'border-b-2 border-webzy-primary bg-white text-webzy-primary shadow-xs'
              : 'text-webzy-ink/70 hover:text-webzy-ink hover:bg-white/40'
          }`}
        >
          Profile Settings
        </button>
      </div>

      {purgeNotice ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 animate-fade-in">
          {purgeNotice}
        </div>
      ) : null}

      {siteActionError ? (
        <div
          role="alert"
          className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 animate-fade-in"
        >
          {siteActionError}
        </div>
      ) : null}

      {/* TAB 1: MY WEBZYS */}
      {activeTab === 'sites' ? (
        <section className="mt-6">
          {siteItems.length === 0 ? (
            <div className="rounded-3xl border border-webzy-tint bg-white p-10 text-center shadow-sm">
              <p className="font-heading text-lg font-bold text-webzy-ink">No published Webzys yet</p>
              <p className="mt-1 text-xs text-webzy-ink/70">
                Pick any ready-made theme starting at ₹29 and customize it in under 2 minutes.
              </p>
              <Link
                href="/themes"
                className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-6 text-xs font-bold text-white shadow-sm"
              >
                Browse themes →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {siteItems.map((site) => (
                <article
                  key={site.id}
                  className="flex flex-col justify-between rounded-3xl border border-webzy-tint bg-white p-6 shadow-card hover:shadow-card-hover transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-webzy-primary">
                          {site.themeName}
                        </p>
                        <h3 className="mt-1 font-heading text-xl font-bold text-webzy-ink">
                          For {site.receiverName}
                        </h3>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                          site.hidden || site.status === 'hidden'
                            ? 'bg-amber-100 text-amber-900'
                            : site.status === 'expired'
                              ? 'bg-gray-200 text-gray-700'
                              : site.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {site.hidden ? 'Paused' : site.status}
                      </span>
                    </div>

                    <p className="mt-2.5 truncate font-mono text-xs text-webzy-ink/70">
                      /s/{site.slug} · {site.viewsCount} view{site.viewsCount === 1 ? '' : 's'}
                    </p>

                    {site.replyText ? (
                      <div className="mt-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs text-emerald-950">
                        <strong>Reply from {site.receiverName}:</strong> “{site.replyText}”
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-webzy-tint/60 pt-4">
                    <Link
                      href={`/s/${site.slug}`}
                      className="inline-flex min-h-[38px] items-center rounded-full bg-webzy-primary px-4 text-xs font-bold text-white shadow-xs hover:opacity-95"
                    >
                      Open Link ↗
                    </Link>
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() => void handleCopy(site)}
                      className="inline-flex min-h-[38px] items-center rounded-full border border-webzy-tint bg-white px-4 text-xs font-bold text-webzy-ink hover:bg-webzy-surface"
                    >
                      {copiedId === site.id ? '✓ Copied' : 'Copy'}
                    </button>
                    {site.canFreeEdit ? (
                      <Link
                        href={`/edit/${site.id}`}
                        className="inline-flex min-h-[38px] items-center rounded-full border border-webzy-tint bg-white px-4 text-xs font-bold text-webzy-primary hover:bg-webzy-surface"
                      >
                        Free Edit
                      </Link>
                    ) : null}
                    {site.status !== 'removed' && site.status !== 'expired' ? (
                      <button
                        suppressHydrationWarning
                        type="button"
                        disabled={togglingId === site.id}
                        onClick={() => void handleToggleVisibility(site)}
                        className="inline-flex min-h-[38px] items-center rounded-full border border-webzy-tint bg-white px-4 text-xs font-bold text-webzy-ink/75 hover:bg-webzy-surface disabled:opacity-50"
                      >
                        {togglingId === site.id
                          ? 'Updating...'
                          : site.hidden
                            ? 'Unhide'
                            : 'Pause'}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setPurgingSite(site)}
                      className="inline-flex min-h-[38px] items-center rounded-full border border-red-200 bg-red-50/50 px-3.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                    >
                      Purge Photos
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {/* TAB 2: ORDERS & INVOICES */}
      {activeTab === 'orders' ? (
        <section className="mt-6">
          {orderItems.length === 0 ? (
            <div className="rounded-3xl border border-webzy-tint bg-white p-10 text-center shadow-sm">
              <p className="font-heading text-lg font-bold text-webzy-ink">No orders found</p>
              <p className="mt-1 text-xs text-webzy-ink/70">
                Invoices and payment receipts will appear here automatically when you complete a purchase.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderItems.map((o) => (
                <div
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-webzy-tint bg-white p-5 shadow-card hover:shadow-card-hover transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-webzy-primary">
                        {o.invoiceNumber}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                          o.status === 'paid' || o.status === 'published'
                            ? 'bg-emerald-100 text-emerald-900'
                            : o.status === 'refunded'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-webzy-ink/70">
                      Paid on {formatDateIst(o.createdAt)}
                    </p>
                    {o.siteSlug ? (
                      <p className="mt-0.5 font-mono text-xs text-webzy-ink/60">
                        Live site: /s/{o.siteSlug}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-heading text-xl font-bold text-webzy-ink">
                      {formatInr(o.amountInr)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedReceiptOrder(o)}
                      className="inline-flex min-h-[40px] items-center rounded-full border border-webzy-tint bg-white px-4 text-xs font-bold text-webzy-ink shadow-xs hover:bg-webzy-surface"
                    >
                      View Receipt
                    </button>
                    {o.siteSlug ? (
                      <Link
                        href={`/s/${o.siteSlug}`}
                        className="inline-flex min-h-[40px] items-center rounded-full bg-webzy-surface px-4 text-xs font-bold text-webzy-primary hover:bg-webzy-tint/50"
                      >
                        Visit Link ↗
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {/* TAB 3: PRIVACY & PHOTO VAULT */}
      {activeTab === 'privacy' ? (
        <section className="mt-6 rounded-3xl border border-webzy-tint bg-white p-6 shadow-sm">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              DPDP Act 2023 Compliant Vault
            </span>
            <h2 className="mt-3 font-heading text-2xl font-bold text-webzy-ink">
              Your Personal Data & Image Privacy
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-webzy-ink/75">
              At Webzy, personal celebration memories are sacred. We treat your private face and family photos with bank-grade encryption and zero permanence.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-webzy-tint bg-webzy-surface/40 p-4">
                <h4 className="font-bold text-xs text-webzy-ink">1. Zero Google Indexing Shield</h4>
                <p className="mt-1 text-xs text-webzy-ink/70">
                  All <code>/s/[slug]</code> and <code>/preview</code> URLs carry strict <code>X-Robots-Tag: noindex, nofollow, noimageindex</code> headers and robots.txt disallows. Search engines cannot index your greeting or photos.
                </p>
              </div>

              <div className="rounded-2xl border border-webzy-tint bg-webzy-surface/40 p-4">
                <h4 className="font-bold text-xs text-webzy-ink">2. Automatic Location & EXIF Stripping</h4>
                <p className="mt-1 text-xs text-webzy-ink/70">
                  Every photo is processed through our pure-TypeScript metadata sanitizer. Camera GPS coordinates, timestamps, and device fingerprints are permanently removed before cloud storage.
                </p>
              </div>

              <div className="rounded-2xl border border-webzy-tint bg-webzy-surface/40 p-4">
                <h4 className="font-bold text-xs text-webzy-ink">3. Ephemeral 15-Minute Signed URLs</h4>
                <p className="mt-1 text-xs text-webzy-ink/70">
                  Photos are kept in a strictly private storage bucket. They are only rendered via 15-minute temporary signed links that expire automatically.
                </p>
              </div>

              <div className="rounded-2xl border border-webzy-tint bg-webzy-surface/40 p-4">
                <h4 className="font-bold text-xs text-webzy-ink">4. 30-Day Auto Purge & Right to Erasure</h4>
                <p className="mt-1 text-xs text-webzy-ink/70">
                  Under DPDP Section 8(7), celebration media is automatically deleted after 30 days. You can also self-service purge photos from any of your Webzys anytime using the "Purge Photos" button.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-webzy-surface p-4 text-xs text-webzy-ink/80">
              <p>
                <strong>Audit Ledger Status:</strong> {consentTotal} immutable consent and privacy event{consentTotal === 1 ? '' : 's'} recorded on your account ledger.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* TAB 4: PROFILE SETTINGS */}
      {activeTab === 'profile' ? (
        <section className="mt-6 rounded-3xl border border-webzy-tint bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold text-webzy-ink">Customer Details & Settings</h2>
          <p className="mt-1 text-xs text-webzy-ink/70">
            Used for tax invoices and customer support. Only you can view or edit your profile row.
          </p>

          <form onSubmit={handleSave} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="acc-name" className="block text-xs font-bold text-webzy-ink">
                Full Name
              </label>
              <input
                suppressHydrationWarning
                id="acc-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="mt-1.5 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink focus:border-webzy-primary"
              />
            </div>

            <div>
              <label htmlFor="acc-phone" className="block text-xs font-bold text-webzy-ink">
                WhatsApp / Phone (optional)
              </label>
              <input
                suppressHydrationWarning
                id="acc-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98XXXXXXXX"
                className="mt-1.5 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink focus:border-webzy-primary"
              />
            </div>

            <div className="space-y-2 rounded-2xl bg-webzy-surface/60 p-4 text-xs sm:col-span-2">
              <p className="font-bold text-webzy-ink">Account preferences & legal declarations:</p>
              <label className="flex min-h-[36px] cursor-pointer items-center gap-2.5">
                <input
                  suppressHydrationWarning
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="h-4 w-4 accent-webzy-primary"
                />
                <span>I am 18 or older, or I am purchasing with parental guidance</span>
              </label>
              <label className="flex min-h-[36px] cursor-pointer items-center gap-2.5">
                <input
                  suppressHydrationWarning
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 accent-webzy-primary"
                />
                <span>I accept the Terms of Service and Refund Policy</span>
              </label>
            </div>

            {errorMsg ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900 sm:col-span-2"
              >
                {errorMsg}
              </div>
            ) : null}

            {savedNotice ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-900 sm:col-span-2">
                {savedNotice}
              </div>
            ) : null}

            <div className="sm:col-span-2">
              <button
                suppressHydrationWarning
                type="submit"
                disabled={saving}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save details'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {/* MODAL 1: PHOTO PURGE CONFIRMATION */}
      {purgingSite ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8 animate-scale-in">
            <div className="flex items-center gap-3 text-red-600">
              <h3 className="font-heading text-xl font-bold text-webzy-ink">Purge Photos Permanently?</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-webzy-ink/80">
              This will <strong>instantly and permanently delete</strong> all uploaded photos for{' '}
              <strong>{purgingSite.receiverName}</strong> from our encrypted cloud storage servers.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-webzy-ink/70">
              Your greeting text, music, and celebratory animations will remain live at{' '}
              <code className="font-mono text-webzy-primary">/s/{purgingSite.slug}</code>. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPurgingSite(null)}
                disabled={isPurging}
                className="rounded-full border border-webzy-tint px-5 py-2.5 text-xs font-bold text-webzy-ink hover:bg-webzy-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmPurgePhotos(purgingSite)}
                disabled={isPurging}
                className="rounded-full bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-sm disabled:opacity-50"
              >
                {isPurging ? 'Deleting photos...' : 'Yes, Delete Photos Now'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL 2: PRINTABLE TAX INVOICE RECEIPT */}
      {selectedReceiptOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8 animate-scale-in">
            <div className="flex items-center justify-between border-b border-webzy-tint pb-4">
              <div>
                <span className="font-heading text-xl font-extrabold text-webzy-primary">WEBZY</span>
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-webzy-ink/60">
                  Tax Invoice / Receipt
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="rounded-full p-1 text-webzy-ink/60 hover:bg-webzy-surface hover:text-webzy-ink"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-webzy-ink">
              <div className="flex justify-between">
                <span className="text-webzy-ink/70">Invoice Number:</span>
                <span className="font-mono font-bold text-webzy-ink">{selectedReceiptOrder.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-webzy-ink/70">Payment Date:</span>
                <span>{formatDateIst(selectedReceiptOrder.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-webzy-ink/70">Billed To:</span>
                <span>{fullName || profile.email}</span>
              </div>
              {selectedReceiptOrder.paymentId ? (
                <div className="flex justify-between">
                  <span className="text-webzy-ink/70">Payment Reference:</span>
                  <span className="font-mono text-[11px]">{selectedReceiptOrder.paymentId}</span>
                </div>
              ) : null}

              <div className="mt-4 rounded-2xl border border-webzy-tint bg-webzy-surface/50 p-4">
                <div className="flex justify-between font-bold">
                  <span>Webzy Personalized Digital Website</span>
                  <span>{formatInr(selectedReceiptOrder.amountInr)}</span>
                </div>
                {selectedReceiptOrder.siteSlug ? (
                  <p className="mt-0.5 font-mono text-[11px] text-webzy-ink/60">
                    Destination: /s/{selectedReceiptOrder.siteSlug}
                  </p>
                ) : null}

                <div className="mt-3 space-y-1 border-t border-webzy-tint/60 pt-2 text-[11px] text-webzy-ink/70">
                  <div className="flex justify-between">
                    <span>Taxable Value:</span>
                    <span>₹{(selectedReceiptOrder.amountInr / 1.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST (9%):</span>
                    <span>₹{((selectedReceiptOrder.amountInr / 1.18) * 0.09).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (9%):</span>
                    <span>₹{((selectedReceiptOrder.amountInr / 1.18) * 0.09).toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-2 flex justify-between border-t border-webzy-ink/10 pt-2 font-bold text-sm text-webzy-ink">
                  <span>Total Amount Paid:</span>
                  <span className="text-emerald-700">{formatInr(selectedReceiptOrder.amountInr)}</span>
                </div>
              </div>

              <p className="text-center text-[10px] text-webzy-ink/50">
                GST inclusive @ 18% · Computer-generated tax invoice issued by Webzy.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-webzy-tint pt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full border border-webzy-tint bg-white px-5 py-2.5 text-xs font-bold text-webzy-ink hover:bg-webzy-surface"
              >
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="rounded-full bg-webzy-primary px-5 py-2.5 text-xs font-bold text-white hover:opacity-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
