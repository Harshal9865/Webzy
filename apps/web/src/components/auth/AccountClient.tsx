'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import type { UserProfileRecord } from '@webzy/core';
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

interface AccountClientProps {
  profile: UserProfileRecord;
  consentRecordsCount: number;
  sites: AccountSiteItem[];
}

export function AccountClient({ profile, consentRecordsCount, sites }: AccountClientProps) {
  const router = useRouter();
  const [siteItems, setSiteItems] = useState<AccountSiteItem[]>(sites);
  const [copiedId, setCopiedId] = useState<string>('');
  const [togglingId, setTogglingId] = useState<string>('');
  const [siteActionError, setSiteActionError] = useState<string>('');

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-webzy-tint px-3 py-1 text-xs font-bold text-webzy-primary">
            Signed in as {profile.email}
          </span>
          <h1 className="mt-2 font-heading text-3xl font-bold text-webzy-ink">
            My Webzys & Account
          </h1>
        </div>

        <button
          suppressHydrationWarning
          type="button"
          onClick={handleSignOut}
          className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-white px-5 text-xs font-bold text-webzy-ink hover:bg-webzy-surface"
        >
          Sign out
        </button>
      </div>

      {/* My Webzys Live Links Section */}
      <section className="mt-8 rounded-3xl border border-webzy-tint bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold text-webzy-ink">
              My Webzys ({siteItems.length})
            </h2>
            <p className="mt-1 text-xs text-webzy-ink/70">
              Open your live links, copy to WhatsApp, view recipient reactions, or edit within 24
              hours of publishing.
            </p>
          </div>
          <Link
            href="/themes"
            className="inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-5 text-xs font-bold text-white"
          >
            + Create new Webzy
          </Link>
        </div>

        {siteActionError ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900"
          >
            {siteActionError}
          </div>
        ) : null}

        {siteItems.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-webzy-tint bg-webzy-surface/50 p-6 text-center">
            <p className="text-sm font-semibold text-webzy-ink">No published Webzys yet.</p>
            <p className="mt-1 text-xs text-webzy-ink/70">
              Pick any ready-made theme starting at ₹29 and customize it in under 2 minutes.
            </p>
            <Link
              href="/themes"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-5 text-xs font-bold text-white"
            >
              Browse themes →
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {siteItems.map((site) => (
              <article
                key={site.id}
                className="flex flex-col justify-between rounded-2xl border border-webzy-tint bg-webzy-surface/40 p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-webzy-primary">
                        {site.themeName}
                      </p>
                      <h3 className="mt-0.5 font-heading text-lg font-bold text-webzy-ink">
                        For {site.receiverName}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
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

                  <p className="mt-2 truncate font-mono text-xs text-webzy-ink/70">
                    /s/{site.slug} · {site.viewsCount} view{site.viewsCount === 1 ? '' : 's'}
                  </p>

                  {site.replyText ? (
                    <div className="mt-3 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-950">
                      <strong>Reply from {site.receiverName}:</strong> “{site.replyText}”
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/s/${site.slug}`}
                    className="inline-flex min-h-[38px] items-center rounded-full bg-webzy-primary px-4 text-xs font-bold text-white"
                  >
                    Open Link
                  </Link>
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => void handleCopy(site)}
                    className="inline-flex min-h-[38px] items-center rounded-full border border-webzy-tint bg-white px-4 text-xs font-bold text-webzy-ink"
                  >
                    {copiedId === site.id ? '✓ Copied' : 'Copy'}
                  </button>
                  {site.canFreeEdit ? (
                    <Link
                      href={`/edit/${site.id}`}
                      className="inline-flex min-h-[38px] items-center rounded-full border border-webzy-tint bg-white px-4 text-xs font-bold text-webzy-primary"
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
                      className="inline-flex min-h-[38px] items-center rounded-full border border-webzy-tint bg-white px-4 text-xs font-bold text-webzy-ink/75 disabled:opacity-50"
                    >
                      {togglingId === site.id
                        ? 'Updating...'
                        : site.hidden
                          ? 'Unhide'
                          : 'Pause'}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Customer Details Section */}
      <section className="mt-6 rounded-3xl border border-webzy-tint bg-webzy-surface/60 p-6">
        <h2 className="font-heading text-xl font-bold text-webzy-ink">Customer details</h2>
        <p className="mt-1 text-xs text-webzy-ink/70">
          Used for receipts and support. Only you can view or edit your profile row.
        </p>

        <form onSubmit={handleSave} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="acc-name" className="block text-xs font-bold text-webzy-ink">
              Full name
            </label>
            <input
              suppressHydrationWarning
              id="acc-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="mt-1 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink"
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
              className="mt-1 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink"
            />
          </div>

          <div className="space-y-2 rounded-2xl bg-white p-4 text-xs sm:col-span-2">
            <p className="font-bold text-webzy-ink">
              Account preferences & terms:
            </p>
            <label className="flex min-h-[36px] cursor-pointer items-center gap-2.5">
              <input
                suppressHydrationWarning
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="h-4 w-4 accent-webzy-primary"
              />
              <span>I am 18 or older, or I am paying with a parent</span>
            </label>
            <label className="flex min-h-[36px] cursor-pointer items-center gap-2.5">
              <input
                suppressHydrationWarning
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 accent-webzy-primary"
              />
              <span>I accept the Terms and Refund policy</span>
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
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save details'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
