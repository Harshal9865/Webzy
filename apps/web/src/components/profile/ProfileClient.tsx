'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import {
  getSiteCopy,
  SUPPORTED_LANGUAGES,
  type UserProfileRecord,
} from '@webzy/core';
import { useAuth } from '../auth/AuthProvider';
import { useLanguage } from '../shell/LanguageProvider';
import { compressImageForMobileUpload } from '../../lib/compressImage';
import { openCookieSettingsModal } from '../../lib/cookieConsent';
import {
  getSupabaseBrowserClient,
  isBrowserSupabaseConfigured,
} from '../../../../../infra/supabase/browser';

export interface ProfileSavedDraftItem {
  id: string;
  draftToken: string;
  themeId: string;
  receiverName: string | null;
  updatedAt: string;
  expiresAt: string;
}

export interface ProfileCustomRequestItem {
  id: string;
  occasion: string;
  budgetTier: string;
  status: string;
  targetDate: string | null;
  quotedAmountInr: number | null;
  createdAt: string;
}

interface ProfileClientProps {
  profile: UserProfileRecord;
  consentRecordsCount: number;
  paidOrdersCount?: number;
  liveSitesCount?: number;
  savedDrafts?: ProfileSavedDraftItem[];
  customRequests?: ProfileCustomRequestItem[];
  initialAvatarUrl?: string | null;
}

function formatThemeLabel(themeId: string): string {
  return themeId
    .replace(/-\d+$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDateIst(isoString?: string | null): string {
  if (!isoString) return 'Recently joined';
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return 'Recently joined';
    return d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Recently joined';
  }
}

function CheckIcon() {
  return (
    <svg
      className="h-2.5 w-2.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function ProfileClient({
  profile,
  consentRecordsCount,
  paidOrdersCount = 0,
  liveSitesCount = 0,
  savedDrafts = [],
  customRequests = [],
  initialAvatarUrl = null,
}: ProfileClientProps) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const site = getSiteCopy(language);
  const { user, signOut, refreshAuth } = useAuth();

  const [fullName, setFullName] = useState(profile.full_name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  // Profile Avatar Photo Upload State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarNotice, setAvatarNotice] = useState<string | null>(null);
  const avatarAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (user?.avatarUrl !== undefined) {
      setAvatarUrl(user.avatarUrl ?? null);
    }
  }, [user?.avatarUrl]);

  async function handleAvatarChange(file: File | null) {
    if (!file) return;
    setAvatarError(null);
    setAvatarNotice(null);
    setUploadingAvatar(true);

    const controller = new AbortController();
    avatarAbortRef.current = controller;

    try {
      const compressed = await compressImageForMobileUpload(file);
      if (controller.signal.aborted) return;

      const formData = new FormData();
      formData.append('file', compressed);

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        avatarUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.avatarUrl) {
        throw new Error(data.error || 'Could not upload profile photo.');
      }

      setAvatarUrl(data.avatarUrl);
      setAvatarNotice('Profile photo updated.');
      await refreshAuth();
      window.dispatchEvent(new Event('webzy_auth_updated'));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setAvatarNotice('Photo upload cancelled.');
      } else {
        setAvatarError(err instanceof Error ? err.message : 'Could not upload profile photo.');
      }
    } finally {
      avatarAbortRef.current = null;
      setUploadingAvatar(false);
    }
  }

  function handleCancelAvatarUpload() {
    avatarAbortRef.current?.abort();
  }

  async function handleRemoveAvatar() {
    setRemovingAvatar(true);
    setAvatarError(null);
    setAvatarNotice(null);
    try {
      const res = await fetch('/api/profile/avatar', { method: 'DELETE' });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Could not remove photo.');
      setAvatarUrl(null);
      setAvatarNotice('Profile photo removed.');
      await refreshAuth();
      window.dispatchEvent(new Event('webzy_auth_updated'));
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Could not remove photo.');
    } finally {
      setRemovingAvatar(false);
    }
  }

  const initials = (() => {
    const cleaned = (fullName || profile.email || 'W').trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : cleaned.slice(0, 2).toUpperCase();
  })();

  // Photo Vault & DPDP Purge State
  const [isPurging, setIsPurging] = useState(false);
  const [purgeNotice, setPurgeNotice] = useState<string | null>(null);
  const [purgeError, setPurgeError] = useState<string | null>(null);

  // Set / Change Password State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('reset=1')) {
      setShowPasswordForm(true);
    }
  }, []);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordNotice(null);
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (!isBrowserSupabaseConfigured()) {
      setPasswordError('Authentication is not configured in this environment.');
      return;
    }
    setSavingPassword(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message || 'Could not update password.');
        return;
      }
      setNewPassword('');
      setConfirmPassword('');
      setPasswordNotice('Password saved! You can now sign in anytime with your email and password.');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setSavingPassword(false);
    }
  }

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    };
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    const cleanedName = fullName.trim();
    if (cleanedName.length < 2 || cleanedName.length > 80) {
      setProfileError('Please enter your full name (2 to 80 characters).');
      return;
    }

    setSavingProfile(true);
    setProfileNotice(null);
    setProfileError(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cleanedName,
          phone: phone.trim(),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        profile?: UserProfileRecord;
      };

      if (!res.ok) {
        throw new Error(data.error || 'Could not save profile.');
      }

      if (data.profile) {
        setFullName(data.profile.full_name || cleanedName);
        setPhone(data.profile.phone || '');
      }

      window.dispatchEvent(new Event('webzy_auth_updated'));
      router.refresh();
      setProfileNotice('Profile updated! Your contact details will now auto-fill in customizers.');
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = window.setTimeout(() => setProfileNotice(null), 3500);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not save profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePurgePhotos() {
    if (!window.confirm('Delete all photos you have uploaded to Webzy? Your text messages will stay, but the photos will be permanently removed.')) {
      return;
    }

    setIsPurging(true);
    setPurgeNotice(null);
    setPurgeError(null);

    try {
      const res = await fetch('/api/privacy/purge-photos', {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });

      if (res.status === 404) {
        setPurgeError(
          'Instant photo deletion is not enabled here yet. Uploaded photos are automatically deleted after 30 days, or you can request removal using the link below.',
        );
        return;
      }

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        purgedCount?: number;
      };
      if (!res.ok) throw new Error(data.error || 'Could not delete photos.');

      setPurgeNotice(`Deleted ${data.purgedCount ?? 0} uploaded photos from your account.`);
    } catch (err) {
      setPurgeError(err instanceof Error ? err.message : 'Could not delete photos right now.');
    } finally {
      setIsPurging(false);
    }
  }

  function handleDownloadData() {
    const safeId = (profile.id || 'account').slice(0, 8);
    const dataObj = {
      profile: {
        ...profile,
        full_name: fullName.trim(),
        phone: phone.trim(),
      },
      consentRecordsCount,
      exportTimestamp: new Date().toISOString(),
      governingLaw: 'Digital Personal Data Protection Act 2023 (DPDP), India',
    };
    const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webzy-user-data-${safeId}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      router.push('/');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-webzy-ink/[0.08] pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-webzy-ink">
            {site.account.profileTitle}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-webzy-ink/70">
            {site.account.profileSubtitle}
          </p>
        </div>

        <button
          type="button"
          disabled={signingOut}
          onClick={handleSignOut}
          className="btn-spring inline-flex min-h-[40px] items-center justify-center rounded-full border border-red-200 bg-red-50/70 px-4 text-xs font-bold text-red-700 hover:bg-red-100/80 active:scale-95 transition-all disabled:opacity-50"
        >
          {signingOut ? site.common.signingOut : site.common.signOut}
        </button>
      </div>

      {/* Account Summary Metrics (2x2 on phones, 4-up on desktop) */}
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <Link
          href="/orders"
          className="rounded-2xl border border-webzy-tint bg-white p-3.5 shadow-2xs transition hover:border-webzy-primary/50"
        >
          <p className="text-[11px] font-semibold text-webzy-ink/60">Paid Orders</p>
          <p className="mt-0.5 font-heading text-xl font-bold text-webzy-ink font-tabular">
            {paidOrdersCount}
          </p>
        </Link>
        <Link
          href="/orders"
          className="rounded-2xl border border-webzy-tint bg-white p-3.5 shadow-2xs transition hover:border-emerald-400"
        >
          <p className="text-[11px] font-semibold text-webzy-ink/60">Live Websites</p>
          <p className="mt-0.5 font-heading text-xl font-bold text-emerald-700 font-tabular">
            {liveSitesCount}
          </p>
        </Link>
        <a
          href="#saved-drafts"
          className="rounded-2xl border border-webzy-tint bg-white p-3.5 shadow-2xs transition hover:border-webzy-primary/50"
        >
          <p className="text-[11px] font-semibold text-webzy-ink/60">Saved Drafts</p>
          <p className="mt-0.5 font-heading text-xl font-bold text-webzy-ink font-tabular">
            {savedDrafts.length}
          </p>
        </a>
        <a
          href="#studio-requests"
          className="rounded-2xl border border-webzy-tint bg-white p-3.5 shadow-2xs transition hover:border-webzy-primary/50"
        >
          <p className="text-[11px] font-semibold text-webzy-ink/60">Studio Requests</p>
          <p className="mt-0.5 font-heading text-xl font-bold text-webzy-ink font-tabular">
            {customRequests.length}
          </p>
        </a>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Left Column: Personal Identity & Info */}
        <div className="space-y-6 md:col-span-7">
          <section className="card-physical rounded-3xl p-6">
            <h2 className="font-heading text-lg font-bold text-webzy-ink flex items-center gap-2">
              <svg className="h-5 w-5 text-webzy-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Personal Information</span>
            </h2>

            {profileNotice ? (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900">
                {profileNotice}
              </div>
            ) : null}

            {profileError ? (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-900">
                {profileError}
              </div>
            ) : null}

            {/* Profile Avatar Upload Block */}
            <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-webzy-tint bg-webzy-surface/50 p-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-webzy-ink text-lg font-bold text-white shadow-sm">
                {avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={avatarUrl}
                    alt={fullName || 'Profile avatar'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-webzy-ink">Profile Photo</p>
                <p className="mt-0.5 text-[11px] text-webzy-ink/65">
                  JPG, PNG or WebP (auto-optimized, private &amp; EXIF-stripped).
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <label className="btn-spring inline-flex min-h-[36px] cursor-pointer items-center rounded-full bg-webzy-ink px-3.5 text-[11px] font-bold text-white hover:bg-webzy-ink/90">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={uploadingAvatar || removingAvatar}
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        e.target.value = '';
                        void handleAvatarChange(file);
                      }}
                      className="sr-only"
                    />
                    <span>
                      {uploadingAvatar
                        ? 'Uploading...'
                        : avatarUrl
                          ? 'Change Photo'
                          : 'Upload Photo'}
                    </span>
                  </label>

                  {uploadingAvatar ? (
                    <button
                      type="button"
                      onClick={handleCancelAvatarUpload}
                      className="inline-flex min-h-[36px] items-center rounded-full border border-slate-300 bg-white px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  ) : null}

                  {avatarUrl && !uploadingAvatar ? (
                    <button
                      type="button"
                      disabled={removingAvatar}
                      onClick={() => void handleRemoveAvatar()}
                      className="inline-flex min-h-[36px] items-center rounded-full border border-red-200 bg-white px-3 text-[11px] font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {removingAvatar ? 'Removing...' : 'Remove'}
                    </button>
                  ) : null}
                </div>

                {avatarNotice ? (
                  <p className="mt-2 text-[11px] font-semibold text-emerald-800">{avatarNotice}</p>
                ) : null}
                {avatarError ? (
                  <p className="mt-2 text-[11px] font-semibold text-red-700">{avatarError}</p>
                ) : null}
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4 text-xs">
              <div>
                <label htmlFor="profile-full-name" className="block font-bold text-webzy-ink">
                  Full Name
                </label>
                <input
                  id="profile-full-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="mt-1 min-h-[42px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink outline-none focus:border-webzy-primary shadow-sm"
                />
              </div>

              <div>
                <label htmlFor="profile-email" className="block font-bold text-webzy-ink">
                  Email Address
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    id="profile-email"
                    type="email"
                    disabled
                    value={profile.email || ''}
                    className="min-h-[42px] flex-1 rounded-xl border border-webzy-tint bg-webzy-surface px-3.5 text-sm text-webzy-ink/70 outline-none"
                  />
                  <span className="text-xs font-semibold text-emerald-700">Verified</span>
                </div>
              </div>

              <div>
                <label htmlFor="profile-phone" className="block font-bold text-webzy-ink">
                  Phone / WhatsApp Number
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="mt-1 min-h-[42px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink outline-none focus:border-webzy-primary shadow-sm"
                />
                <p className="mt-1 text-[11px] text-webzy-ink/60">
                  Used optionally for instant WhatsApp link delivery and receipt notifications.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-spring inline-flex min-h-[42px] items-center rounded-full bg-webzy-primary px-6 text-xs font-bold text-white shadow-btn-primary hover:opacity-95 disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </section>

          {/* Preferences Section */}
          <section className="card-physical rounded-3xl p-5 sm:p-6">
            <h2 className="font-heading text-lg font-bold text-webzy-ink">
              {site.account.preferredLanguageTitle}
            </h2>
            <p className="mt-1 text-xs text-webzy-ink/70">
              {site.account.preferredLanguageSubtitle}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SUPPORTED_LANGUAGES.map((opt) => (
                <button
                  suppressHydrationWarning
                  key={opt.code}
                  type="button"
                  aria-pressed={language === opt.code}
                  onClick={() => setLanguage(opt.code)}
                  className={`btn-spring min-h-[44px] rounded-xl border px-3 py-2 text-left transition ${language === opt.code
                    ? 'border-webzy-primary bg-webzy-tint text-webzy-primary shadow-sm'
                    : 'border-webzy-tint bg-white text-webzy-ink hover:border-webzy-primary/40'
                    }`}
                >
                  <span className="block text-xs font-bold">{opt.nativeLabel}</span>
                  <span className="block text-[10px] opacity-70">{opt.englishLabel}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Saved Unfinished Drafts Section */}
          <section id="saved-drafts" className="card-physical rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-heading text-lg font-bold text-webzy-ink">
                  Saved Drafts
                </h2>
                <p className="mt-0.5 text-xs text-webzy-ink/65">
                  Pick up where you left off before your draft expires.
                </p>
              </div>
              <Link
                href="/themes"
                className="shrink-0 text-xs font-bold text-webzy-primary hover:underline"
              >
                + New Card
              </Link>
            </div>

            {savedDrafts.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-webzy-tint bg-webzy-surface/40 p-4 text-center text-xs text-webzy-ink/65">
                No unfinished drafts right now. Start personalizing any theme in minutes.
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {savedDrafts.map((draft) => {
                  const editHref = draft.themeId.startsWith('wedding-')
                    ? `/weddings/${draft.themeId}/customize?draft=${encodeURIComponent(draft.draftToken)}`
                    : `/create/${draft.themeId}?draft=${encodeURIComponent(draft.draftToken)}`;
                  const checkoutHref = `/checkout?draft=${encodeURIComponent(draft.draftToken)}`;
                  return (
                    <div
                      key={draft.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-webzy-tint bg-white p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-webzy-ink">
                          {formatThemeLabel(draft.themeId)}
                          {draft.receiverName ? ` · For ${draft.receiverName}` : ''}
                        </p>
                        <p suppressHydrationWarning className="text-[11px] text-webzy-ink/55">
                          Saved {formatDateIst(draft.updatedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={editHref}
                          className="inline-flex h-8 items-center rounded-full border border-webzy-tint px-3 text-[11px] font-bold text-webzy-ink hover:border-webzy-primary/50"
                        >
                          Resume
                        </Link>
                        <Link
                          href={checkoutHref}
                          className="inline-flex h-8 items-center rounded-full bg-webzy-primary px-3 text-[11px] font-bold text-white hover:opacity-95"
                        >
                          Checkout →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Custom / Bespoke Studio Requests Tracker */}
          <section id="studio-requests" className="card-physical rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-heading text-lg font-bold text-webzy-ink">
                  Custom Studio Requests
                </h2>
                <p className="mt-0.5 text-xs text-webzy-ink/65">
                  Track your bespoke wedding &amp; custom-made website commissions.
                </p>
              </div>
              <Link
                href="/studio"
                className="shrink-0 text-xs font-bold text-webzy-primary hover:underline"
              >
                Request Custom →
              </Link>
            </div>

            {customRequests.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-webzy-tint bg-webzy-surface/40 p-4 text-center text-xs text-webzy-ink/65">
                No custom studio requests yet. Need a 1-of-1 bespoke build? Visit Custom Made.
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {customRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-webzy-tint bg-white p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold capitalize text-webzy-ink">
                        {req.occasion} Commission · ₹{req.budgetTier}
                      </p>
                      <p suppressHydrationWarning className="text-[11px] text-webzy-ink/55">
                        Submitted {formatDateIst(req.createdAt)}
                        {req.targetDate ? ` · Event: ${req.targetDate}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.quotedAmountInr ? (
                        <span className="font-mono text-xs font-bold text-emerald-700">
                          ₹{req.quotedAmountInr.toLocaleString('en-IN')}
                        </span>
                      ) : null}
                      <span className="rounded-full bg-webzy-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-webzy-primary">
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Photos & Privacy */}
        <div className="space-y-6 md:col-span-5">
          <section className="card-physical rounded-3xl p-6">
            <h2 className="font-heading text-lg font-bold text-webzy-ink">
              Your Photos &amp; Privacy
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-webzy-ink/75">
              Your uploaded photos and celebration links stay private to the people you share them with.
            </p>

            <div className="mt-4 space-y-3 rounded-2xl bg-webzy-surface/60 p-4 text-xs">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckIcon />
                </span>
                <div>
                  <strong className="text-webzy-ink">Auto photo cleanup:</strong>
                  <p className="text-[11px] text-webzy-ink/70">Uploaded photos are automatically removed 30 days after expiry (unless Lifetime Hosting is selected).</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckIcon />
                </span>
                <div>
                  <strong className="text-webzy-ink">Hidden from Google:</strong>
                  <p className="text-[11px] text-webzy-ink/70">Your private links and photos never show up in Google Search.</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckIcon />
                </span>
                <div>
                  <strong className="text-webzy-ink">Location details removed:</strong>
                  <p className="text-[11px] text-webzy-ink/70">Hidden camera location info is cleared before your photo is saved.</p>
                </div>
              </div>
            </div>

            {purgeNotice ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900">
                {purgeNotice}
              </div>
            ) : null}

            {purgeError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-900">
                {purgeError}
              </div>
            ) : null}

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                disabled={isPurging}
                onClick={handlePurgePhotos}
                className="btn-spring flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{isPurging ? 'Deleting photos...' : 'Delete all my uploaded photos'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadData}
                className="btn-spring flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-xl border border-webzy-tint bg-white text-xs font-bold text-webzy-ink hover:bg-webzy-surface"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download my account details</span>
              </button>

              <Link
                href="/takedown"
                className="btn-spring flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-xl border border-webzy-tint/80 bg-webzy-surface/60 text-xs font-semibold text-webzy-ink/80 hover:border-webzy-primary/40 hover:text-webzy-primary"
              >
                <span>Report or request content removal</span>
              </Link>
            </div>
          </section>

          {/* Account Meta, Security & Quick Support */}
          <div className="rounded-2xl border border-webzy-tint/70 bg-webzy-surface/40 p-4 text-xs text-webzy-ink/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-webzy-ink">Account Security &amp; Cookies</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Account Verified
              </span>
            </div>
            <p suppressHydrationWarning className="text-[11px]">
              Member since {formatDateIst(profile.created_at)} · {consentRecordsCount}{' '}
              {consentRecordsCount === 1 ? 'consent' : 'consents'} recorded
            </p>

            {showPasswordForm ? (
              <form
                onSubmit={handleUpdatePassword}
                className="space-y-2.5 rounded-xl border border-webzy-tint bg-white p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-webzy-ink">Set or Change Password</span>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="text-[11px] font-semibold text-webzy-ink/55 hover:text-webzy-ink"
                  >
                    Close
                  </button>
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="New password (min 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="min-h-[38px] w-full rounded-lg border border-webzy-tint px-3 text-xs text-webzy-ink outline-none focus:border-webzy-primary"
                />
                <input
                  type="password"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="min-h-[38px] w-full rounded-lg border border-webzy-tint px-3 text-xs text-webzy-ink outline-none focus:border-webzy-primary"
                />
                {passwordNotice ? (
                  <p className="text-[11px] font-semibold text-emerald-700">{passwordNotice}</p>
                ) : null}
                {passwordError ? (
                  <p className="text-[11px] font-semibold text-red-700">{passwordError}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex min-h-[36px] items-center rounded-full bg-webzy-primary px-4 text-[11px] font-bold text-white hover:opacity-95 disabled:opacity-50"
                >
                  {savingPassword ? 'Saving...' : 'Save New Password'}
                </button>
              </form>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPasswordForm((prev) => !prev)}
                className="inline-flex h-8 items-center rounded-full border border-webzy-tint bg-white px-3 text-[11px] font-bold text-webzy-ink hover:border-webzy-primary/40"
              >
                {showPasswordForm ? 'Hide Password Form' : 'Set / Change Password'}
              </button>
              <button
                type="button"
                onClick={openCookieSettingsModal}
                className="inline-flex h-8 items-center rounded-full border border-webzy-tint bg-white px-3 text-[11px] font-bold text-webzy-ink hover:border-webzy-primary/40"
              >
                Cookie Preferences
              </button>
              {profile.role === 'admin' ? (
                <Link
                  href="/admin"
                  className="inline-flex h-8 items-center rounded-full bg-webzy-ink px-3 text-[11px] font-bold text-white hover:bg-webzy-ink/90"
                >
                  Admin Console →
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
