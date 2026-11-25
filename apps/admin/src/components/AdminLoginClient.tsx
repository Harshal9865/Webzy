'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { getSupabaseBrowserClient } from '../../../../infra/supabase/browser';

interface AdminLoginClientProps {
  supabaseConfigured: boolean;
  initialError?: string;
}

function mapAdminAuthError(rawError: unknown, fallback: string): string {
  const raw =
    typeof rawError === 'string'
      ? rawError
      : rawError && typeof rawError === 'object' && 'message' in rawError && typeof rawError.message === 'string'
        ? rawError.message
        : '';

  const normalized = raw.trim().toLowerCase();
  if (!normalized) return fallback;

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid_credentials')
  ) {
    return 'Incorrect email or password. Verify your admin credentials and try again.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'This admin email has not been confirmed yet. Confirm the account or re-run the admin seed script.';
  }
  if (
    normalized.includes('rate limit') ||
    normalized.includes('too many requests') ||
    normalized.includes('over_email_send_rate_limit') ||
    normalized.includes('security purposes')
  ) {
    return 'Too many sign-in attempts. Please wait a minute and try again.';
  }
  if (
    normalized.includes('otp') ||
    normalized.includes('token has expired') ||
    normalized.includes('invalid token') ||
    normalized.includes('expired')
  ) {
    return 'That verification code or link is invalid or expired. Request a new code and retry.';
  }
  if (normalized.includes('signups not allowed') || normalized.includes('user not found')) {
    return 'No seeded admin account matches that email address.';
  }
  if (
    normalized.includes('network') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('fetch')
  ) {
    return 'Unable to reach the authentication service. Check your connection and try again.';
  }
  if (
    normalized.includes('admin login link') ||
    normalized.includes('missing admin login code') ||
    normalized.includes('access denied')
  ) {
    return raw.trim();
  }

  return fallback;
}

export function AdminLoginClient({ supabaseConfigured, initialError }: AdminLoginClientProps) {
  const router = useRouter();
  const [authTab, setAuthTab] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'busy' | 'otp_sent' | 'verifying_otp' | 'error'>(
    initialError ? 'error' : 'idle',
  );
  const [errorMsg, setErrorMsg] = useState(
    initialError ? mapAdminAuthError(initialError, 'Unable to verify admin sign-in link.') : '',
  );

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setStatus('error');
      setErrorMsg('Supabase environment variables are missing in .env.local.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !password) {
      setStatus('error');
      setErrorMsg('Please enter both your admin email and password.');
      return;
    }

    setStatus('busy');
    setErrorMsg('');

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) {
        setStatus('error');
        setErrorMsg(
          mapAdminAuthError(error, 'Unable to sign in. Verify your credentials and try again.'),
        );
        return;
      }
      router.push('/');
      router.refresh();
    } catch (err) {
      setStatus('error');
      setErrorMsg(mapAdminAuthError(err, 'Unable to sign in right now. Please retry.'));
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setStatus('error');
      setErrorMsg('Supabase environment variables are missing in .env.local.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setStatus('error');
      setErrorMsg('Please enter your seeded founder admin email.');
      return;
    }

    setStatus('busy');
    setErrorMsg('');

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setStatus('error');
        setErrorMsg(mapAdminAuthError(error, 'Unable to send admin login code right now.'));
        return;
      }
      setStatus('otp_sent');
    } catch (err) {
      setStatus('error');
      setErrorMsg(mapAdminAuthError(err, 'Unable to send admin login code.'));
    }
  }

  async function handleVerifyEmailOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = otpCode.replace(/\s+/g, '');
    if (cleanCode.length < 6) {
      setErrorMsg('Please enter the 6-digit code sent to your email.');
      return;
    }

    setStatus('verifying_otp');
    setErrorMsg('');

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanCode,
        type: 'email',
      });
      if (error) {
        setStatus('otp_sent');
        setErrorMsg(mapAdminAuthError(error, 'Invalid or expired verification code.'));
        return;
      }
      router.push('/');
      router.refresh();
    } catch (err) {
      setStatus('otp_sent');
      setErrorMsg(mapAdminAuthError(err, 'Unable to verify that code. Please retry.'));
    }
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-900">
      <main
        className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12 sm:px-6"
        suppressHydrationWarning
      >
        <div
          className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8"
          suppressHydrationWarning
        >
          {/* Brand Emblem + Console Tag */}
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2.5 font-heading text-xl font-bold tracking-tight text-slate-900">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-webzy-primary text-sm font-bold text-white shadow-xs"
                aria-hidden="true"
              >
                w
              </span>
              <span className="font-heading tracking-tight">Webzy</span>
            </div>
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
              Operations Console
            </span>
          </div>

          <h1 className="mt-5 font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Admin Sign In
          </h1>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
            Sign in with your administrator password or request a 6-digit email verification code.
          </p>

          {/* Auth Method Tabs */}
          <div
            className="mt-5 grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-100/80 p-1"
            suppressHydrationWarning
          >
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => {
                setAuthTab('password');
                setStatus('idle');
                setErrorMsg('');
              }}
              className={`min-h-[44px] rounded-lg px-3 text-xs font-semibold transition ${
                authTab === 'password'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin Password
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => {
                setAuthTab('otp');
                setStatus('idle');
                setErrorMsg('');
              }}
              className={`min-h-[44px] rounded-lg px-3 text-xs font-semibold transition ${
                authTab === 'otp'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Email Code / Link
            </button>
          </div>

          {/* Tab 1: Password Login */}
          {authTab === 'password' ? (
            <form
              onSubmit={handlePasswordLogin}
              className="mt-5 space-y-4"
              suppressHydrationWarning
            >
              <div>
                <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-700">
                  Admin email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  suppressHydrationWarning
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@webzy.in"
                  className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Admin password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    suppressHydrationWarning
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your admin password"
                    className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-1 top-1/2 inline-flex min-h-[44px] -translate-y-1/2 items-center rounded-lg px-2.5 text-xs font-semibold text-slate-600 transition hover:text-slate-900"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {errorMsg ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-900"
                >
                  {errorMsg}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={status === 'busy' || !supabaseConfigured}
                suppressHydrationWarning
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50"
              >
                {status === 'busy' ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Signing in...</span>
                  </span>
                ) : (
                  'Sign In to Console →'
                )}
              </button>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
                <strong className="text-slate-800">Founder Configuration Note:</strong> To set or
                update your password anytime, run:
                <code className="mt-1.5 block rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-[10px] text-slate-800">
                  npm run seed:admin -- your@email.com YourPassword
                </code>
              </div>
            </form>
          ) : status === 'otp_sent' || status === 'verifying_otp' ? (
            /* Tab 2: OTP Sent & Verify */
            <form
              onSubmit={handleVerifyEmailOtp}
              className="mt-5 space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4"
              suppressHydrationWarning
            >
              <div>
                <p className="text-xs font-semibold text-emerald-950">Code sent to {email}</p>
                <p className="mt-0.5 text-[11px] text-emerald-800">
                  Check your inbox for the 6-digit verification code.
                </p>
              </div>

              <div>
                <label htmlFor="admin-otp" className="block text-xs font-semibold text-slate-700">
                  6-digit email code
                </label>
                <input
                  id="admin-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  suppressHydrationWarning
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="mt-1.5 min-h-[44px] w-full rounded-xl border border-emerald-300 bg-white px-4 text-center font-mono text-lg tracking-widest text-slate-900 font-tabular outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              {errorMsg ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-900"
                >
                  {errorMsg}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={status === 'verifying_otp'}
                suppressHydrationWarning
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50"
              >
                {status === 'verifying_otp' ? 'Verifying...' : 'Verify Code →'}
              </button>

              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setStatus('idle');
                  setOtpCode('');
                  setErrorMsg('');
                }}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-50"
              >
                Resend or change email
              </button>
            </form>
          ) : (
            /* Tab 2: Send OTP Form */
            <form
              onSubmit={handleSendOtp}
              className="mt-5 space-y-4"
              suppressHydrationWarning
            >
              <div>
                <label
                  htmlFor="admin-email-otp"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Admin email
                </label>
                <input
                  id="admin-email-otp"
                  type="email"
                  required
                  suppressHydrationWarning
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@webzy.in"
                  className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              {errorMsg ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-900"
                >
                  {errorMsg}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={status === 'busy' || !supabaseConfigured}
                suppressHydrationWarning
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50"
              >
                {status === 'busy' ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Sending code...</span>
                  </span>
                ) : (
                  'Send 6-Digit Email Code'
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
