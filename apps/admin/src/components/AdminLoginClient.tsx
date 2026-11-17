'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../../../../infra/supabase/browser';

interface AdminLoginClientProps {
  supabaseConfigured: boolean;
  initialError?: string;
}

export function AdminLoginClient({ supabaseConfigured, initialError }: AdminLoginClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authTab, setAuthTab] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'busy' | 'otp_sent' | 'verifying_otp' | 'error'>(
    initialError ? 'error' : 'idle',
  );
  const [errorMsg, setErrorMsg] = useState(initialError || '');

  useEffect(() => {
    setMounted(true);
  }, []);

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
        setErrorMsg(error.message);
        return;
      }
      router.push('/');
      router.refresh();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Unable to sign in right now. Please retry.');
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
        setErrorMsg(error.message);
        return;
      }
      setStatus('otp_sent');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Unable to send admin login code.');
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
        setErrorMsg(error.message || 'Invalid or expired code.');
        return;
      }
      router.push('/');
      router.refresh();
    } catch (err) {
      setStatus('otp_sent');
      setErrorMsg(err instanceof Error ? err.message : 'Verification error.');
    }
  }

  return (
    <main
      className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12 sm:px-6"
      suppressHydrationWarning
    >
      <div
        className="rounded-3xl border border-webzy-tint bg-webzy-surface p-7 shadow-sm sm:p-9"
        suppressHydrationWarning
      >
        {/* Brand Tag */}
        <div className="flex items-center justify-between">
          <span className="inline-flex rounded-full bg-webzy-tint px-3 py-1 text-xs font-bold text-webzy-primary">
            Webzy Founder Console
          </span>
          <span className="text-[11px] font-semibold text-webzy-ink/50">Admin Ops</span>
        </div>

        <h1 className="mt-3 font-heading text-3xl font-bold text-webzy-ink">Admin Sign In</h1>
        <p className="mt-1.5 text-xs leading-relaxed text-webzy-ink/75 sm:text-sm">
          Sign in directly with your Admin Password or request a 6-digit email code.
        </p>

        {/* Auth Method Tabs */}
        <div
          className="mt-5 grid grid-cols-2 gap-1.5 rounded-2xl border border-webzy-tint bg-white p-1"
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
            className={`min-h-[40px] rounded-xl text-xs font-bold transition ${
              authTab === 'password'
                ? 'bg-webzy-primary text-white shadow-sm'
                : 'text-webzy-ink/70 hover:text-webzy-ink'
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
            className={`min-h-[40px] rounded-xl text-xs font-bold transition ${
              authTab === 'otp'
                ? 'bg-webzy-primary text-white shadow-sm'
                : 'text-webzy-ink/70 hover:text-webzy-ink'
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
              <label htmlFor="admin-email" className="block text-xs font-bold text-webzy-ink">
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
                placeholder="harshalkr220@gmail.com"
                className="mt-1 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink outline-none transition focus:border-webzy-primary"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold text-webzy-ink">
                Admin password
              </label>
              <div className="relative mt-1">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  suppressHydrationWarning
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your admin password"
                  className="min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 pr-11 text-sm text-webzy-ink outline-none transition focus:border-webzy-primary"
                />
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-xs font-semibold text-webzy-ink/70 hover:text-webzy-ink"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {errorMsg ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900"
              >
                {errorMsg}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={status === 'busy' || !supabaseConfigured}
              suppressHydrationWarning
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
            >
              {status === 'busy' ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                'Sign In to Console →'
              )}
            </button>

            <div className="rounded-2xl border border-webzy-tint bg-white/70 p-3 text-[11px] leading-relaxed text-webzy-ink/65">
              <strong>Founder Configuration Note:</strong> To set or update your password anytime, run:
              <code className="mt-1 block rounded bg-webzy-surface px-2 py-1 font-mono text-[10px] text-webzy-ink">
                npm run seed:admin -- your@email.com YourPassword
              </code>
            </div>
          </form>
        ) : status === 'otp_sent' || status === 'verifying_otp' ? (
          /* Tab 2: OTP Sent & Verify */
          <form
            onSubmit={handleVerifyEmailOtp}
            className="mt-5 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
            suppressHydrationWarning
          >
            <div>
              <p className="text-xs font-bold text-emerald-950">Code sent to {email}</p>
              <p className="mt-0.5 text-[11px] text-emerald-800/80">
                Check your inbox for the 6-digit verification code.
              </p>
            </div>

            <div>
              <label htmlFor="admin-otp" className="block text-xs font-bold text-webzy-ink">
                6-digit email code
              </label>
              <input
                id="admin-otp"
                type="text"
                inputMode="numeric"
                maxLength={8}
                suppressHydrationWarning
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="mt-1 min-h-[48px] w-full rounded-xl border border-emerald-300 bg-white px-4 text-center font-mono text-lg tracking-widest text-webzy-ink outline-none focus:border-webzy-primary"
              />
            </div>

            {errorMsg ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900"
              >
                {errorMsg}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={status === 'verifying_otp'}
              suppressHydrationWarning
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
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
              className="w-full text-center text-xs font-bold text-emerald-900 underline"
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
              <label htmlFor="admin-email-otp" className="block text-xs font-bold text-webzy-ink">
                Admin email
              </label>
              <input
                id="admin-email-otp"
                type="email"
                required
                suppressHydrationWarning
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="harshalkr220@gmail.com"
                className="mt-1 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink outline-none transition focus:border-webzy-primary"
              />
            </div>

            {errorMsg ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900"
              >
                {errorMsg}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={status === 'busy' || !supabaseConfigured}
              suppressHydrationWarning
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
            >
              {status === 'busy' ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
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
  );
}
