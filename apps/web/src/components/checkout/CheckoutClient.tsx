'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import {
  ADDON_CATALOG,
  type AddonId,
  computeOrderPricingPaise,
  formatPaiseAsInr,
  LanguageCode,
} from '@webzy/core';
import type { ThemeManifest } from '@webzy/themes';
import { getSupabaseBrowserClient } from '../../../../../infra/supabase/browser';

interface CheckoutClientProps {
  theme: ThemeManifest;
  draftToken: string;
  language: LanguageCode;
  hasPhotos: boolean;
  isAuthenticated: boolean;
  initialFullName: string;
  initialPhone: string;
  payButtonDisabled: boolean;
  defaultValidityDays: number;
}

const ADDON_META: Record<AddonId, { title: string; subtitle: string; icon: React.ReactNode }> = {
  pin: {
    title: 'Secret PIN Lock',
    subtitle: 'Recipient unlocks with 4-digit code',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  video: {
    title: 'Status Video Export',
    subtitle: '1080p MP4 for WhatsApp Status & Stories',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  extend: {
    title: 'Extra 90 Days Validity',
    subtitle: 'Total 120 days of active online access',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
};

export function CheckoutClient({
  theme,
  draftToken,
  language,
  hasPhotos,
  isAuthenticated,
  initialFullName,
  initialPhone,
  payButtonDisabled,
  defaultValidityDays,
}: CheckoutClientProps) {
  const router = useRouter();
  const [selectedAddons, setSelectedAddons] = useState<AddonId[]>([]);
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [photoPermConfirmed, setPhotoPermConfirmed] = useState(!hasPhotos);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Inline email OTP auth state for unauthenticated users
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authSent, setAuthSent] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [authError, setAuthError] = useState('');

  async function handleSendInlineOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = authEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    setAuthBusy(true);
    setAuthNotice('');
    setAuthError('');
    try {
      document.cookie = `webzy_pending_draft=${encodeURIComponent(draftToken)}; path=/; max-age=3600; SameSite=Lax`;
      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/checkout?draft=${draftToken}`)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo,
        },
      });
      if (error) {
        setAuthError(error.message);
        return;
      }
      setAuthSent(true);
      setAuthNotice(`Verification code sent to ${cleanEmail}. Enter the 6-digit code below.`);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unable to send code right now.');
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleVerifyInlineOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = authEmail.trim().toLowerCase();
    const cleanCode = authOtp.replace(/\s+/g, '');
    if (cleanCode.length < 6) {
      setAuthError('Please enter the 6-digit code from your email.');
      return;
    }
    setAuthBusy(true);
    setAuthNotice('');
    setAuthError('');
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanCode,
        type: 'email',
      });
      if (error) {
        setAuthError(error.message || 'Invalid or expired code. Please retry.');
        return;
      }
      await fetch('/api/auth/attach-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftToken }),
      }).catch(() => {});
      router.refresh();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setAuthBusy(false);
    }
  }

  const pricing = useMemo(
    () =>
      computeOrderPricingPaise({
        basePriceInr: theme.price.base,
        allowedAddons: theme.price.addons,
        selectedAddons,
        defaultValidityDays,
      }),
    [theme.price.base, theme.price.addons, selectedAddons, defaultValidityDays],
  );

  function toggleAddon(id: AddonId) {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    if (payButtonDisabled) {
      setErrorMsg('Payments are temporarily paused while Mock mode is restricted in production.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftToken,
          addons: selectedAddons,
          fullName,
          phone,
          consent: {
            ageOrParentConfirmed: ageConfirmed,
            termsAndRefundAccepted: termsAccepted,
            photoPermissionConfirmed: hasPhotos ? photoPermConfirmed : true,
          },
        }),
      });
      const data = (await res.json()) as {
        redirectUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.redirectUrl) {
        throw new Error(data.error || 'Could not start payment. Please retry.');
      }
      router.push(data.redirectUrl);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Checkout error. Please retry.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Link
          href={`/create/${theme.id}?draft=${encodeURIComponent(draftToken)}`}
          className="inline-flex min-h-[44px] items-center text-xs font-bold text-webzy-primary hover:underline"
        >
          ← Back to edit draft
        </Link>
        <h1 className="font-heading text-3xl font-bold text-webzy-ink">
          Review & Pay ({formatPaiseAsInr(pricing.totalPaise)})
        </h1>
      </div>

      {!isAuthenticated ? (
        <div className="rounded-3xl border border-webzy-tint bg-webzy-surface p-6 shadow-sm sm:p-8">
          <span className="inline-flex rounded-full bg-webzy-tint px-3 py-1 text-xs font-bold text-webzy-primary">
            Step 1 · Quick Email Verification
          </span>
          <h2 className="mt-3 font-heading text-2xl font-bold text-webzy-ink">
            Where should we send your receipt and live link?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-webzy-ink/80">
            No password needed. Enter your email below to verify with a quick 6-digit code, and finish checkout right here.
          </p>

          {!authSent ? (
            <form onSubmit={handleSendInlineOtp} className="mt-6 max-w-md space-y-3">
              <div>
                <label htmlFor="chk-auth-email" className="block text-xs font-bold text-webzy-ink">
                  Your email address
                </label>
                <input
                  suppressHydrationWarning
                  id="chk-auth-email"
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="mt-1 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink outline-none focus:border-webzy-primary"
                />
              </div>

              {authError ? (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900">
                  {authError}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={authBusy}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white shadow-sm disabled:opacity-50"
                >
                  {authBusy ? 'Sending code...' : 'Send 6-Digit Code →'}
                </button>
                <Link
                  href={`/login?next=${encodeURIComponent(`/checkout?draft=${draftToken}`)}&draftToken=${encodeURIComponent(draftToken)}`}
                  className="text-xs text-webzy-ink/65 hover:text-webzy-primary hover:underline"
                >
                  Or open separate sign-in page →
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyInlineOtp} className="mt-6 max-w-md space-y-3">
              {authNotice ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900">
                  {authNotice}
                </div>
              ) : null}

              <div>
                <label htmlFor="chk-auth-code" className="block text-xs font-bold text-webzy-ink">
                  Enter 6-digit verification code
                </label>
                <input
                  suppressHydrationWarning
                  id="chk-auth-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  value={authOtp}
                  onChange={(e) => setAuthOtp(e.target.value)}
                  placeholder="123456"
                  className="mt-1 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 font-mono text-center text-lg tracking-widest text-webzy-ink outline-none focus:border-webzy-primary"
                />
              </div>

              {authError ? (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900">
                  {authError}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={authBusy}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white shadow-sm disabled:opacity-50"
                >
                  {authBusy ? 'Verifying...' : 'Verify Code & Continue →'}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthSent(false)}
                  className="text-xs text-webzy-ink/65 hover:text-webzy-primary hover:underline"
                >
                  Change email
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <form onSubmit={handleCheckout} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="space-y-5 rounded-3xl border border-webzy-tint bg-webzy-surface/60 p-6 lg:col-span-7">
            <h2 className="font-heading text-xl font-bold text-webzy-ink">
              Your details & consent
            </h2>

            <div>
              <label htmlFor="chk-name" className="block text-xs font-bold text-webzy-ink">
                Full name (shown on receipt)
              </label>
              <input
                id="chk-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="mt-1 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink"
              />
            </div>

            <div>
              <label htmlFor="chk-phone" className="block text-xs font-bold text-webzy-ink">
                WhatsApp / Phone (optional)
              </label>
              <input
                id="chk-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98XXXXXXXX"
                className="mt-1 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink"
              />
            </div>

            {theme.price.addons.length > 0 ? (
              <div className="rounded-2xl bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-webzy-ink">Optional Add-Ons</p>
                  <span className="text-[11px] text-webzy-ink/50">Tap to include</span>
                </div>
                <div className="mt-3 space-y-2.5">
                  {theme.price.addons.map((addonId) => {
                    const isSelected = selectedAddons.includes(addonId);
                    const catalog = ADDON_CATALOG[addonId];
                    const meta = ADDON_META[addonId];
                    const savingsInr = catalog.compareAtInr - catalog.priceInr;

                    return (
                      <label
                        key={addonId}
                        className={`flex min-h-[56px] cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500/20'
                            : 'border-webzy-tint bg-white hover:border-webzy-tint/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleAddon(addonId)}
                            className="h-4 w-4 accent-emerald-600"
                          />
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              isSelected
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-webzy-surface text-webzy-ink/70'
                            }`}
                          >
                            {meta?.icon}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-webzy-ink">
                              {meta?.title || catalog.label[language]}
                            </p>
                            <p className="text-[11px] text-webzy-ink/60">
                              {meta?.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="flex items-baseline justify-end gap-1.5">
                            <span className="text-[11px] text-webzy-ink/40 line-through">
                              ₹{catalog.compareAtInr}
                            </span>
                            <span className="font-heading text-xs font-bold text-emerald-700">
                              +₹{catalog.priceInr}
                            </span>
                          </div>
                          {savingsInr > 0 ? (
                            <span className="inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 border border-emerald-200/60">
                              Save ₹{savingsInr}
                            </span>
                          ) : null}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="space-y-2.5 rounded-2xl bg-white p-4 text-xs">
              <p className="font-bold text-webzy-ink">Required confirmations:</p>
              <label className="flex min-h-[40px] cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  required
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-webzy-primary"
                />
                <span>I am 18 or older, or I am paying with a parent.</span>
              </label>
              <label className="flex min-h-[40px] cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-webzy-primary"
                />
                <span>
                  I accept the{' '}
                  <Link href="/terms" className="font-bold text-webzy-primary underline">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link href="/refund" className="font-bold text-webzy-primary underline">
                    Refund policy
                  </Link>
                  .
                </span>
              </label>
              {hasPhotos ? (
                <label className="flex min-h-[40px] cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    required
                    checked={photoPermConfirmed}
                    onChange={(e) => setPhotoPermConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-webzy-primary"
                  />
                  <span>I have permission to use the uploaded photos of others.</span>
                </label>
              ) : null}
            </div>

            {errorMsg ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900"
              >
                {errorMsg}
              </div>
            ) : null}
          </section>

          <aside className="rounded-3xl border border-webzy-tint bg-white p-6 shadow-sm lg:col-span-5">
            <h2 className="font-heading text-xl font-bold text-webzy-ink">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-webzy-ink/75">{theme.name[language]}</dt>
                <dd className="font-semibold">{formatPaiseAsInr(pricing.basePaise)}</dd>
              </div>
              {pricing.addonsPaise > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-webzy-ink/75">Add-ons</dt>
                  <dd className="font-semibold">{formatPaiseAsInr(pricing.addonsPaise)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-webzy-tint pt-2.5 text-base font-bold text-webzy-ink">
                <dt>Total (GST-inclusive)</dt>
                <dd className="font-extrabold text-emerald-700">{formatPaiseAsInr(pricing.totalPaise)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-webzy-ink/60">
              Link validity: {pricing.validityDays} days · Includes instant link delivery
            </p>

            <button
              suppressHydrationWarning
              type="submit"
              disabled={submitting || payButtonDisabled}
              className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {payButtonDisabled
                ? 'Pay temporarily disabled'
                : submitting
                  ? 'Creating order...'
                  : `Pay ${formatPaiseAsInr(pricing.totalPaise)} by UPI →`}
            </button>
          </aside>
        </form>
      )}
    </div>
  );
}
