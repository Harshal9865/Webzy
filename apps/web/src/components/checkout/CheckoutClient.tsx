'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ADDON_CATALOG,
  type AddonId,
  computeOrderPricingPaise,
  expandThemeAddons,
  formatPaiseAsInr,
  getSiteCopy,
  isValidityAddonId,
  LanguageCode,
  pickLocalizedText,
  STOREFRONT_VALIDITY_ADDON_IDS,
  type StorefrontValidityAddonId,
  VALIDITY_TARGET_DAYS,
  type ValidityAddonId,
} from '@webzy/core';
import type { ThemeManifest } from '@webzy/themes';
import {
  getSupabaseBrowserClient,
  isBrowserSupabaseConfigured,
} from '../../../../../infra/supabase/browser';
import { useAuth } from '../auth/AuthProvider';
import { useLanguage } from '../shell/LanguageProvider';

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

const CALENDAR_ICON = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

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
  extend_14d: {
    title: '14 Days Total Validity',
    subtitle: 'Extend from 7 days to 14 days live hosting',
    icon: CALENDAR_ICON,
  },
  extend_21d: {
    title: '21 Days Total Validity',
    subtitle: 'Extend from 7 days to 21 days live hosting',
    icon: CALENDAR_ICON,
  },
  lifetime: {
    title: 'Lifetime Hosting (Ready-Made)',
    subtitle: 'Never expires — keep your celebration site online permanently',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  extend: {
    title: '3 Months (90 Days) Validity',
    subtitle: 'Full 90 days of active online access',
    icon: CALENDAR_ICON,
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
  const { language: siteLang } = useLanguage();
  const site = getSiteCopy(siteLang);
  const {
    isAuthenticated: clientAuthenticated,
    loading: authLoading,
    profile: clientProfile,
    refreshAuth,
  } = useAuth();
  const effectiveAuthenticated = authLoading ? isAuthenticated : clientAuthenticated;
  const supabaseConfigured = isBrowserSupabaseConfigured();

  const [selectedAddons, setSelectedAddons] = useState<AddonId[]>([]);
  const [secretPin, setSecretPin] = useState('');
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [photoPermConfirmed, setPhotoPermConfirmed] = useState(!hasPhotos);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const expandedAllowedAddons = useMemo(
    () => expandThemeAddons(theme.price.addons),
    [theme.price.addons],
  );
  const featureAddons = useMemo(
    () => expandedAllowedAddons.filter((id) => !isValidityAddonId(id)),
    [expandedAllowedAddons],
  );
  const validityAddons = useMemo(
    () => expandedAllowedAddons.filter(isValidityAddonId),
    [expandedAllowedAddons],
  );
  const selectedValidityAddon = useMemo(
    () => validityAddons.find((id) => selectedAddons.includes(id)) ?? null,
    [validityAddons, selectedAddons],
  );
  const visibleValidityAddons = useMemo(() => {
    const allowedSet = new Set(expandedAllowedAddons);
    const list: Array<StorefrontValidityAddonId | ValidityAddonId> =
      STOREFRONT_VALIDITY_ADDON_IDS.filter((id) => allowedSet.has(id));
    if (selectedValidityAddon === 'extend' && allowedSet.has('extend')) {
      list.push('extend');
    }
    return list;
  }, [expandedAllowedAddons, selectedValidityAddon]);

  // Pre-select any add-ons the user toggled on the /pricing page
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('webzy_preferred_addons');
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const allowed = new Set(expandedAllowedAddons);
        const rawValid = parsed.filter(
          (id): id is AddonId => typeof id === 'string' && allowed.has(id as AddonId),
        );
        const chosenValidity = (['lifetime', 'extend', 'extend_21d', 'extend_14d'] as const).find((vId) =>
          rawValid.includes(vId),
        );
        const valid = Array.from(
          new Set([
            ...rawValid.filter((id) => !isValidityAddonId(id)),
            ...(chosenValidity ? [chosenValidity] : []),
          ]),
        );
        if (valid.length > 0) {
          setSelectedAddons(valid);
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }, [expandedAllowedAddons]);

  // Auto-fill profile fields if user signs in via modal/inline auth while on checkout
  useEffect(() => {
    if (!clientProfile) return;
    setFullName((prev) => (prev.trim() ? prev : clientProfile.full_name || ''));
    setPhone((prev) => (prev.trim() ? prev : clientProfile.phone || ''));
  }, [clientProfile]);

  // Inline email OTP auth state for unauthenticated users
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authSent, setAuthSent] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [authError, setAuthError] = useState('');

  async function handleSendInlineOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setAuthError('Authentication keys are not configured in this environment.');
      return;
    }
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
    if (!supabaseConfigured) {
      setAuthError('Authentication keys are not configured in this environment.');
      return;
    }
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
      await refreshAuth();
      window.dispatchEvent(new Event('webzy_auth_updated'));
      window.dispatchEvent(new Event('webzy_orders_updated'));
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
        productType: 'ready_made',
      }),
    [theme.price.base, theme.price.addons, selectedAddons, defaultValidityDays],
  );

  function toggleAddon(id: AddonId) {
    setSelectedAddons((prev) => {
      if (isValidityAddonId(id)) {
        const alreadySelected = prev.includes(id);
        const withoutValidity = prev.filter((item) => !isValidityAddonId(item));
        return alreadySelected ? withoutValidity : [...withoutValidity, id];
      }
      return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
    });
  }

  function selectValidityAddon(id: ValidityAddonId | null) {
    setSelectedAddons((prev) => {
      const withoutValidity = prev.filter((item) => !isValidityAddonId(item));
      return id ? [...withoutValidity, id] : withoutValidity;
    });
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    if (payButtonDisabled) {
      setErrorMsg('Payments are temporarily paused while Mock mode is restricted in production.');
      return;
    }

    const pinSelected = selectedAddons.includes('pin');
    const cleanPin = secretPin.replace(/\D/g, '').slice(0, 4);
    if (pinSelected && cleanPin.length !== 4) {
      setErrorMsg('Please enter a 4-digit Secret PIN (numbers only) to lock your page.');
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
          secretPin: pinSelected ? cleanPin : undefined,
          fullName,
          phone,
          consent: {
            ageOrParentConfirmed: ageConfirmed,
            termsAndRefundAccepted: termsAccepted,
            photoPermissionConfirmed: hasPhotos ? photoPermConfirmed : true,
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        redirectUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.redirectUrl) {
        throw new Error(data.error || 'Could not start payment. Please retry.');
      }
      window.dispatchEvent(new Event('webzy_orders_updated'));
      router.push(data.redirectUrl);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Checkout error. Please retry.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-3.5 py-5 sm:px-6 sm:py-10">
      <div className="mb-4 sm:mb-6">
        <Link
          href={
            theme.occasion === 'wedding'
              ? `/weddings/${theme.id}/customize?draft=${encodeURIComponent(draftToken)}`
              : `/create/${theme.id}?draft=${encodeURIComponent(draftToken)}`
          }
          className="inline-flex min-h-[44px] items-center text-xs font-bold text-webzy-primary hover:underline"
        >
          ← Back to edit draft
        </Link>
        <h1 className="font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
          {site.account.checkoutReviewAndPay} ({formatPaiseAsInr(pricing.totalPaise)})
        </h1>
      </div>

      {!effectiveAuthenticated ? (
        <div className="rounded-2xl border border-webzy-ink/[0.09] bg-white p-4 shadow-sm sm:p-8">
          <p className="text-xs font-semibold text-webzy-primary">
            Step 1 of 2
          </p>
          <h2 className="mt-2 font-heading text-xl font-bold text-webzy-ink sm:text-2xl">
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
                  autoComplete="one-time-code"
                  maxLength={8}
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
                  onClick={() => {
                    setAuthSent(false);
                    setAuthOtp('');
                    setAuthError('');
                    setAuthNotice('');
                  }}
                  className="text-xs text-webzy-ink/65 hover:text-webzy-primary hover:underline"
                >
                  Change email
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <form onSubmit={handleCheckout} className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
          <section className="space-y-4 sm:space-y-5 rounded-2xl sm:rounded-3xl border border-webzy-tint bg-webzy-surface/60 p-4 sm:p-6 lg:col-span-7">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-webzy-ink">
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

            {expandedAllowedAddons.length > 0 ? (
              <div className="rounded-2xl bg-white p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-webzy-ink">{site.account.checkoutOptionalAddons}</p>
                  <span className="text-[11px] text-webzy-ink/50">{site.common.tapToSelect}</span>
                </div>
                <div className="mt-2.5 sm:mt-3 space-y-2 sm:space-y-2.5">
                  {featureAddons.map((addonId) => {
                    const isSelected = selectedAddons.includes(addonId);
                    const catalog = ADDON_CATALOG[addonId];
                    const meta = ADDON_META[addonId];
                    const savingsInr = catalog.compareAtInr - catalog.priceInr;

                    return (
                      <label
                        key={addonId}
                        className={`flex min-h-[52px] sm:min-h-[56px] cursor-pointer items-center justify-between gap-2.5 sm:gap-3 rounded-2xl border p-3 sm:p-3.5 transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500/20'
                            : 'border-webzy-tint bg-white hover:border-webzy-tint/80'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleAddon(addonId)}
                            className="h-4 w-4 shrink-0 accent-emerald-600"
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
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-webzy-ink">
                              {site.pricing.addons[addonId]?.title ||
                                meta?.title ||
                                pickLocalizedText(catalog.label, language)}
                            </p>
                            <p className="text-[11px] text-webzy-ink/60">
                              {site.pricing.addons[addonId]?.description || meta?.subtitle}
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

                {visibleValidityAddons.length > 0 ? (
                  <div className="mt-3.5 sm:mt-4 border-t border-webzy-tint/70 pt-3 sm:pt-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                      <p className="text-xs font-bold text-webzy-ink">
                        Link Validity Duration
                      </p>
                      <span className="text-[11px] text-webzy-ink/60 font-tabular">
                        {pricing.isLifetime
                          ? 'Lifetime Hosting (No Expiry)'
                          : `${pricing.validityDays} ${site.common.daysLink}`}
                      </span>
                    </div>
                    <div
                      role="radiogroup"
                      aria-label="Link Validity Duration"
                      className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4"
                    >
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selectedValidityAddon === null}
                        onClick={() => selectValidityAddon(null)}
                        className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                          selectedValidityAddon === null
                            ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500/25'
                            : 'border-webzy-tint bg-white hover:border-webzy-ink/25'
                        }`}
                      >
                        <span className="text-xs font-bold text-webzy-ink">
                          {defaultValidityDays} Days
                        </span>
                        <span className="mt-0.5 text-[10px] font-semibold text-emerald-700">
                          Included · Free
                        </span>
                      </button>

                      {visibleValidityAddons.map((vId) => {
                        const isSelected = selectedValidityAddon === vId;
                        const catalog = ADDON_CATALOG[vId];
                        const isLifetimeOption = vId === 'lifetime';
                        const targetDays = isLifetimeOption
                          ? null
                          : VALIDITY_TARGET_DAYS[vId as Exclude<ValidityAddonId, 'lifetime'>];
                        const durationTitle =
                          vId === 'lifetime'
                            ? 'Lifetime Hosting'
                            : vId === 'extend_14d'
                              ? '14 Days'
                              : vId === 'extend_21d'
                                ? '21 Days'
                                : '3 Months';

                        return (
                          <button
                            key={vId}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => selectValidityAddon(vId)}
                            className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition font-tabular ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500/25'
                                : 'border-webzy-tint bg-white hover:border-webzy-ink/25'
                            }`}
                          >
                            <span className="text-xs font-bold text-webzy-ink">
                              {durationTitle}
                            </span>
                            <span className="text-[10px] text-webzy-ink/60">
                              {isLifetimeOption
                                ? 'No Expiry · Ready-Made'
                                : `${targetDays} ${site.common.daysLink}`}
                            </span>
                            <div className="mt-1 flex items-baseline gap-1">
                              <span className="text-[10px] text-webzy-ink/40 line-through">
                                ₹{catalog.compareAtInr}
                              </span>
                              <span className="text-[11px] font-bold text-emerald-700">
                                +₹{catalog.priceInr}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {selectedAddons.includes('pin') ? (
                  <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label htmlFor="chk-secret-pin" className="text-xs font-bold text-emerald-950">
                        Set your 4-digit Secret PIN *
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setSecretPin(String(Math.floor(1000 + Math.random() * 9000)))
                        }
                        className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950"
                      >
                        Pick random PIN
                      </button>
                    </div>
                    <input
                      id="chk-secret-pin"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      maxLength={4}
                      required
                      value={secretPin}
                      onChange={(e) => setSecretPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="e.g. 2408"
                      className="mt-2 min-h-[48px] w-full rounded-xl border border-emerald-300 bg-white px-4 text-center font-mono text-lg font-bold tracking-[0.35em] text-webzy-ink outline-none focus:border-emerald-600"
                    />
                    <p className="mt-1.5 text-[11px] text-emerald-900/80">
                      Only people who enter this 4-digit PIN can unlock and view your live page.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2 sm:space-y-2.5 rounded-2xl bg-white p-3 sm:p-4 text-xs">
              <p className="font-bold text-webzy-ink">Required confirmations:</p>
              <label className="flex min-h-[40px] cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  required
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-webzy-primary"
                />
                <span>I am 18 or older, or I am paying with a parent.</span>
              </label>
              <label className="flex min-h-[40px] cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-webzy-primary"
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
                    className="mt-0.5 h-4 w-4 shrink-0 accent-webzy-primary"
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

          <aside className="rounded-2xl sm:rounded-3xl border border-webzy-tint bg-white p-4 sm:p-6 shadow-sm lg:col-span-5">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-webzy-ink">{site.account.checkoutOrderSummary}</h2>
            <dl className="mt-3.5 sm:mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="min-w-0 text-webzy-ink/75">{pickLocalizedText(theme.name, siteLang)}</dt>
                <dd className="shrink-0 font-semibold font-tabular">{formatPaiseAsInr(pricing.basePaise)}</dd>
              </div>
              {pricing.addonsPaise > 0 ? (
                <div className="flex justify-between gap-3">
                  <dt className="min-w-0 text-webzy-ink/75">{site.account.checkoutOptionalAddons}</dt>
                  <dd className="shrink-0 font-semibold font-tabular">{formatPaiseAsInr(pricing.addonsPaise)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3 border-t border-webzy-tint pt-2.5 text-base font-bold text-webzy-ink">
                <dt>{site.account.checkoutTotalGst}</dt>
                <dd className="shrink-0 font-extrabold text-emerald-700 font-tabular">{formatPaiseAsInr(pricing.totalPaise)}</dd>
              </div>
            </dl>
            {(() => {
              const totalInr = pricing.totalPaise / 100;
              const halfGst = Number(((totalInr - totalInr / 1.18) / 2).toFixed(2));
              const taxable = Number((totalInr - halfGst * 2).toFixed(2));
              return (
                <div className="mt-3 rounded-2xl border border-webzy-tint/80 bg-webzy-surface/50 px-3.5 py-2.5 text-[11px] text-webzy-ink/70 font-tabular">
                  <div className="flex justify-between gap-2">
                    <span>Taxable Value (SAC 998314):</span>
                    <span className="shrink-0">₹{taxable.toFixed(2)}</span>
                  </div>
                  <div className="mt-0.5 flex justify-between gap-2">
                    <span>CGST (9%) + SGST (9%):</span>
                    <span className="shrink-0">₹{halfGst.toFixed(2)} + ₹{halfGst.toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}
            <p className="mt-2 text-xs text-webzy-ink/60">
              {pricing.isLifetime
                ? 'Lifetime Hosting (No Expiry)'
                : `${pricing.validityDays} ${site.common.daysLink}${pricing.validityDays === 90 ? ' (3 months)' : ''}`}
            </p>

            <button
              suppressHydrationWarning
              type="submit"
              disabled={submitting || payButtonDisabled}
              className="mt-4 sm:mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-emerald-600 px-5 sm:px-6 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {payButtonDisabled
                ? 'Pay temporarily disabled'
                : submitting
                  ? 'Creating order...'
                  : `${site.account.checkoutPayByUpi} (${formatPaiseAsInr(pricing.totalPaise)}) →`}
            </button>
          </aside>
        </form>
      )}
    </div>
  );
}
