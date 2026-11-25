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

interface ProfileClientProps {
  profile: UserProfileRecord;
  consentRecordsCount: number;
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

export function ProfileClient({ profile, consentRecordsCount }: ProfileClientProps) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const site = getSiteCopy(language);
  const { signOut } = useAuth();

  const [fullName, setFullName] = useState(profile.full_name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  // Photo Vault & DPDP Purge State
  const [isPurging, setIsPurging] = useState(false);
  const [purgeNotice, setPurgeNotice] = useState<string | null>(null);
  const [purgeError, setPurgeError] = useState<string | null>(null);

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

      {/* Quick Navigation to Orders Banner */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-webzy-primary/20 bg-gradient-to-r from-webzy-surface via-white to-webzy-surface p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-webzy-primary text-white shadow-btn-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <p className="font-heading text-sm font-bold text-webzy-ink">Looking for your celebration orders?</p>
            <p className="text-xs text-webzy-ink/70">Check live delivery signals, fix typos in name/message, and view GST receipts.</p>
          </div>
        </div>
        <Link
          href="/orders"
          className="btn-spring inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-webzy-ink px-4 text-xs font-bold text-white shadow-sm hover:bg-webzy-ink/90"
        >
          <span>Go to Orders Page</span>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
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
          <section className="card-physical rounded-3xl p-6">
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
                  className={`btn-spring min-h-[46px] rounded-xl border px-3 py-2 text-left transition ${language === opt.code
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
                  <strong className="text-webzy-ink">Deleted after 30 days:</strong>
                  <p className="text-[11px] text-webzy-ink/70">Uploaded photos are automatically removed after 30 days.</p>
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

          {/* Account Meta */}
          <div className="rounded-2xl border border-webzy-tint/60 bg-webzy-surface/40 p-4 text-[11px] text-webzy-ink/60 space-y-1">
            <p suppressHydrationWarning>Member since {formatDateIst(profile.created_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
