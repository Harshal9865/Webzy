'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { sanitizeRedirectPath } from '@webzy/core';
import { getSupabaseBrowserClient } from '../../../../../infra/supabase/browser';

interface LoginClientProps {
  supabaseConfigured: boolean;
  nextPath: string;
  draftToken?: string;
  initialError?: string;
}

type AuthMode = 'signin' | 'signup' | 'magic' | 'forgot';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginClient({
  supabaseConfigured,
  nextPath,
  draftToken,
  initialError,
}: LoginClientProps) {
  const router = useRouter();
  const safeNext = sanitizeRedirectPath(nextPath, '/orders');

  const [mode, setMode] = useState<AuthMode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState(initialError || '');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setErrorMessage('');
    setNoticeMessage('');
  }

  async function finalizeSession() {
    if (draftToken) {
      await fetch('/api/auth/attach-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftToken }),
      }).catch(() => {});
    }
    window.dispatchEvent(new Event('webzy_auth_updated'));
    window.dispatchEvent(new Event('webzy_orders_updated'));
    router.push(safeNext);
    router.refresh();
  }

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setErrorMessage('Authentication keys are not configured in this environment.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setNoticeMessage('');

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const lower = (error.message || '').toLowerCase();
        if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
          setErrorMessage(
            'Incorrect email or password. If you signed up earlier with an email link, tap "Forgot password?" to set a password, or use "Email Link" below.',
          );
        } else {
          setErrorMessage(error.message || 'Unable to sign in right now. Please try again.');
        }
        return;
      }

      await finalizeSession();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to sign in right now. Please retry.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setErrorMessage('Authentication keys are not configured in this environment.');
      return;
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Please choose a password with at least 8 characters.');
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setNoticeMessage('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cleanName,
          email: cleanEmail,
          password,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        code?: string;
        error?: string;
      };

      if (!res.ok) {
        if (res.status === 409 || data.code === 'ACCOUNT_EXISTS') {
          setErrorMessage(
            data.error ||
              'An account with this email already exists. Switch to Sign In or use Forgot Password.',
          );
        } else {
          setErrorMessage(data.error || 'Could not create your account. Please retry.');
        }
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInErr) {
        setNoticeMessage('Account created! Please sign in with your new email and password.');
        setMode('signin');
        return;
      }

      await finalizeSession();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not create your account right now.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setErrorMessage('Authentication keys are not configured in this environment.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setNoticeMessage('');

    try {
      if (draftToken) {
        document.cookie = `webzy_pending_draft=${encodeURIComponent(draftToken)}; path=/; max-age=3600; SameSite=Lax`;
      }

      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        const lower = (error.message || '').toLowerCase();
        if (lower.includes('rate limit') || lower.includes('too many')) {
          setErrorMessage(
            'Email sending limit reached for this hour. Please use standard Email & Password sign-in instead — it works instantly.',
          );
        } else {
          setErrorMessage(error.message || 'Unable to send sign-in link right now.');
        }
        return;
      }

      setCooldown(45);
      setNoticeMessage(
        `One-click sign-in link sent to ${cleanEmail}. Open the email (check Spam/Promotions too) and tap the button to sign in.`,
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to send sign-in link right now.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setErrorMessage('Authentication keys are not configured in this environment.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setNoticeMessage('');

    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/profile?reset=1')}`;

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });

      if (error) {
        const lower = (error.message || '').toLowerCase();
        if (lower.includes('rate limit') || lower.includes('too many')) {
          setErrorMessage('Email reset limit reached for this hour. Please try again shortly.');
        } else {
          setErrorMessage(error.message || 'Could not send reset email right now.');
        }
        return;
      }

      setCooldown(45);
      setNoticeMessage(
        `Password reset link sent to ${cleanEmail}. Click the link in your email to choose a new password on your Profile page.`,
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not send reset email right now.',
      );
    } finally {
      setBusy(false);
    }
  }

  const headingByMode: Record<AuthMode, { title: string; subtitle: string }> = {
    signin: {
      title: 'Welcome back',
      subtitle: 'Sign in with your email and password to access your orders, live websites, and saved drafts.',
    },
    signup: {
      title: 'Create your Webzy account',
      subtitle: 'Works with any email address (Gmail, Outlook, Yahoo, etc.). Instant access — no waiting for emails.',
    },
    magic: {
      title: 'Sign in with Email Link',
      subtitle: 'Prefer no password? We will email you a direct one-click sign-in link.',
    },
    forgot: {
      title: 'Reset your password',
      subtitle: 'Enter your email address and we will send you a secure link to set a new password.',
    },
  };

  return (
    <div className="relative min-h-[82vh] overflow-x-clip bg-gradient-to-b from-[#FFF8FA] via-white to-[#FDF6F0] px-4 py-8 sm:px-6 sm:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-webzy-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-amber-300/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-md">
        <div className="overflow-hidden rounded-[26px] border border-webzy-tint bg-white shadow-[0_24px_60px_-24px_rgba(32,16,28,0.18)]">
          {/* Header Strip */}
          <div className="border-b border-webzy-tint/80 bg-gradient-to-r from-[#241320] via-[#3A172D] to-[#241320] px-5 py-4 sm:px-6 sm:py-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-webzy-primary font-heading text-base font-bold text-white shadow-sm">
                  w
                </span>
                <div>
                  <p className="font-heading text-base font-bold leading-tight">Webzy Account</p>
                  <p className="text-[11px] text-white/70">Secure Email &amp; Password Sign-In</p>
                </div>
              </div>
              <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                Free Account
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {/* Primary Tabs: Sign In | Create Account */}
            <div className="mb-5 grid grid-cols-2 rounded-2xl border border-webzy-tint bg-webzy-surface/60 p-1">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`min-h-[40px] rounded-xl text-xs font-bold transition ${
                  mode === 'signin' || mode === 'forgot'
                    ? 'bg-white text-webzy-primary shadow-sm'
                    : 'text-webzy-ink/65 hover:text-webzy-ink'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`min-h-[40px] rounded-xl text-xs font-bold transition ${
                  mode === 'signup'
                    ? 'bg-white text-webzy-primary shadow-sm'
                    : 'text-webzy-ink/65 hover:text-webzy-ink'
                }`}
              >
                Create Account
              </button>
            </div>

            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-webzy-ink">
              {headingByMode[mode].title}
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-webzy-ink/70 sm:text-[13px]">
              {headingByMode[mode].subtitle}
            </p>

            {!supabaseConfigured ? (
              <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs leading-relaxed text-amber-950">
                <strong>Setup needed:</strong> Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your environment variables.
              </div>
            ) : null}

            {noticeMessage ? (
              <div
                role="status"
                className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold leading-relaxed text-emerald-900"
              >
                {noticeMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-red-900"
              >
                {errorMessage}
              </div>
            ) : null}

            {mode === 'signin' ? (
              <form onSubmit={handlePasswordSignIn} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-xs font-bold text-webzy-ink">
                    Email address
                  </label>
                  <input
                    suppressHydrationWarning
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 min-h-[46px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink shadow-2xs outline-none transition focus:border-webzy-primary focus:ring-2 focus:ring-webzy-primary/15"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="block text-xs font-bold text-webzy-ink">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[11px] font-bold text-webzy-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <input
                      suppressHydrationWarning
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="min-h-[46px] w-full rounded-xl border border-webzy-tint bg-white pl-3.5 pr-16 text-sm text-webzy-ink shadow-2xs outline-none transition focus:border-webzy-primary focus:ring-2 focus:ring-webzy-primary/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[11px] font-bold text-webzy-ink/60 hover:text-webzy-ink"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={busy || !supabaseConfigured}
                  className="btn-spring inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 py-2.5 text-sm font-bold text-white shadow-btn-primary transition hover:opacity-95 disabled:opacity-50"
                >
                  {busy ? 'Signing in...' : 'Sign In →'}
                </button>
              </form>
            ) : null}

            {mode === 'signup' ? (
              <form onSubmit={handleCreateAccount} className="mt-5 space-y-3.5">
                <div>
                  <label htmlFor="signup-name" className="block text-xs font-bold text-webzy-ink">
                    Full Name
                  </label>
                  <input
                    suppressHydrationWarning
                    id="signup-name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={80}
                    autoComplete="name"
                    placeholder="e.g. Aarav Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1.5 min-h-[46px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink shadow-2xs outline-none transition focus:border-webzy-primary focus:ring-2 focus:ring-webzy-primary/15"
                  />
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-xs font-bold text-webzy-ink">
                    Email address
                  </label>
                  <input
                    suppressHydrationWarning
                    id="signup-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 min-h-[46px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink shadow-2xs outline-none transition focus:border-webzy-primary focus:ring-2 focus:ring-webzy-primary/15"
                  />
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-xs font-bold text-webzy-ink">
                    Create Password
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      suppressHydrationWarning
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      maxLength={72}
                      autoComplete="new-password"
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="min-h-[46px] w-full rounded-xl border border-webzy-tint bg-white pl-3.5 pr-16 text-sm text-webzy-ink shadow-2xs outline-none transition focus:border-webzy-primary focus:ring-2 focus:ring-webzy-primary/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[11px] font-bold text-webzy-ink/60 hover:text-webzy-ink"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={busy || !supabaseConfigured}
                  className="btn-spring inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 py-2.5 text-sm font-bold text-white shadow-btn-primary transition hover:opacity-95 disabled:opacity-50"
                >
                  {busy ? 'Creating account...' : 'Create Account & Sign In →'}
                </button>
              </form>
            ) : null}

            {mode === 'magic' ? (
              <form onSubmit={handleMagicLink} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="magic-email" className="block text-xs font-bold text-webzy-ink">
                    Email address
                  </label>
                  <input
                    suppressHydrationWarning
                    id="magic-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 min-h-[46px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink shadow-2xs outline-none transition focus:border-webzy-primary focus:ring-2 focus:ring-webzy-primary/15"
                  />
                </div>

                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={busy || cooldown > 0 || !supabaseConfigured}
                  className="btn-spring inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 py-2.5 text-sm font-bold text-white shadow-btn-primary transition hover:opacity-95 disabled:opacity-50"
                >
                  {busy
                    ? 'Sending sign-in link...'
                    : cooldown > 0
                      ? `Link sent — retry in ${cooldown}s`
                      : 'Email Me a Sign-In Link →'}
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="inline-flex min-h-[38px] w-full items-center justify-center rounded-full border border-webzy-tint bg-white px-4 text-xs font-bold text-webzy-ink/80 hover:border-webzy-primary/40 hover:text-webzy-primary"
                >
                  Back to Email &amp; Password
                </button>
              </form>
            ) : null}

            {mode === 'forgot' ? (
              <form onSubmit={handleForgotPassword} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-bold text-webzy-ink">
                    Account email address
                  </label>
                  <input
                    suppressHydrationWarning
                    id="forgot-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 min-h-[46px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink shadow-2xs outline-none transition focus:border-webzy-primary focus:ring-2 focus:ring-webzy-primary/15"
                  />
                </div>

                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={busy || cooldown > 0 || !supabaseConfigured}
                  className="btn-spring inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 py-2.5 text-sm font-bold text-white shadow-btn-primary transition hover:opacity-95 disabled:opacity-50"
                >
                  {busy
                    ? 'Sending reset link...'
                    : cooldown > 0
                      ? `Reset link sent (${cooldown}s)`
                      : 'Send Password Reset Link →'}
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="inline-flex min-h-[38px] w-full items-center justify-center rounded-full border border-webzy-tint bg-white px-4 text-xs font-bold text-webzy-ink/80 hover:border-webzy-primary/40 hover:text-webzy-primary"
                >
                  Back to Sign In
                </button>
              </form>
            ) : null}

            {/* Secondary Passwordless Option */}
            {mode === 'signin' || mode === 'signup' ? (
              <div className="mt-5 border-t border-webzy-tint/70 pt-4 text-center">
                <button
                  type="button"
                  onClick={() => switchMode('magic')}
                  className="text-xs font-semibold text-webzy-ink/65 hover:text-webzy-primary hover:underline"
                >
                  Prefer passwordless? Sign in with a direct Email Link
                </button>
              </div>
            ) : null}

            <div className="mt-5 flex items-center justify-between border-t border-webzy-tint/70 pt-4 text-xs">
              <Link href="/" className="font-bold text-webzy-primary hover:underline">
                ← Back to Webzy
              </Link>
              <Link href="/privacy" className="font-medium text-webzy-ink/55 hover:text-webzy-ink">
                DPDP Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
