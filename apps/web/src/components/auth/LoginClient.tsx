'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { getSiteCopy, sanitizeRedirectPath } from '@webzy/core';
import { getSupabaseBrowserClient } from '../../../../../infra/supabase/browser';
import { useLanguage } from '../shell/LanguageProvider';

interface LoginClientProps {
  supabaseConfigured: boolean;
  nextPath: string;
  draftToken?: string;
  initialError?: string;
}

type LoginStep = 'email' | 'otp';

async function verifyEmailOtpWithFallback(cleanEmail: string, cleanCode: string) {
  const supabase = getSupabaseBrowserClient();
  const attemptTypes = ['email', 'magiclink', 'signup'] as const;
  let lastError: { message?: string } | null = null;

  for (const otpType of attemptTypes) {
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanCode,
      type: otpType,
    });
    if (!error && data.session) {
      return { ok: true as const, error: null };
    }
    lastError = error;
    // If token is explicitly expired or invalid format, still try fallback once in case of signup vs email
  }

  return {
    ok: false as const,
    error: lastError?.message || 'Invalid or expired code. Please check your inbox or resend.',
  };
}

export function LoginClient({
  supabaseConfigured,
  nextPath,
  draftToken,
  initialError,
}: LoginClientProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const site = getSiteCopy(language);
  const safeNext = sanitizeRedirectPath(nextPath, '/orders');

  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState(initialError || '');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (step === 'otp') {
      const t = window.setTimeout(() => otpInputRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = window.setTimeout(() => setResendCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [resendCooldown]);

  async function requestEmailOtp(cleanEmail: string) {
    if (!supabaseConfigured) {
      setErrorMessage('Authentication keys are not configured in this environment.');
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
            'Email sending limit reached for this hour. If you already received a code in your inbox, tap "Enter existing code" below.',
          );
        } else {
          setErrorMessage(error.message || 'Unable to send login code right now. Please retry.');
        }
        return;
      }

      setStep('otp');
      setResendCooldown(30);
      setNoticeMessage(`Code & magic link sent to ${cleanEmail}. Check inbox or spam.`);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to send login code right now. Please retry.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleSendSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    await requestEmailOtp(cleanEmail);
  }

  function handleJumpToExistingOtp() {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Enter your email address first so we know which account to verify.');
      return;
    }
    setErrorMessage('');
    setNoticeMessage(`Enter the verification code sent to ${cleanEmail}.`);
    setStep('otp');
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setErrorMessage('Authentication keys are not configured in this environment.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = otpCode.replace(/\D/g, '');
    if (cleanCode.length < 6) {
      setErrorMessage('Please enter the 6 to 8 digit verification code from your email.');
      return;
    }

    setBusy(true);
    setErrorMessage('');

    try {
      const result = await verifyEmailOtpWithFallback(cleanEmail, cleanCode);
      if (!result.ok) {
        setErrorMessage(result.error);
        return;
      }

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
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not verify code right now. Please retry.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-[82vh] overflow-x-clip bg-gradient-to-b from-[#FFF8FA] via-white to-[#FDF6F0] px-4 py-10 sm:px-6 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-webzy-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-amber-300/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-md">
        <div className="overflow-hidden rounded-[28px] border border-webzy-tint bg-white shadow-[0_24px_60px_-24px_rgba(32,16,28,0.18)]">
          {/* Header Accent Strip */}
          <div className="border-b border-webzy-tint/80 bg-gradient-to-r from-[#241320] via-[#3A172D] to-[#241320] px-6 py-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-webzy-primary font-heading text-base font-bold text-white shadow-sm">
                  w
                </span>
                <div>
                  <p className="font-heading text-base font-bold leading-tight">Webzy Account</p>
                  <p className="text-[11px] text-white/70">Passwordless Email OTP Sign-In</p>
                </div>
              </div>
              <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-200">
                {step === 'email' ? 'Step 1 / 2' : 'Step 2 / 2'}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            {/* Clean 2-Step Progress Pills */}
            <div className="mb-5 grid grid-cols-2 gap-2">
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${
                  step === 'email'
                    ? 'border-webzy-primary bg-webzy-surface text-webzy-primary'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/15 text-[10px]">
                  {step === 'otp' ? '✓' : '1'}
                </span>
                <span>Email</span>
              </div>
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${
                  step === 'otp'
                    ? 'border-webzy-primary bg-webzy-surface text-webzy-primary'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/15 text-[10px]">
                  2
                </span>
                <span>Verify OTP</span>
              </div>
            </div>

            <h1 className="font-heading text-2xl font-bold tracking-tight text-webzy-ink">
              {step === 'email' ? site.account.signInTitle : 'Enter verification code'}
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-webzy-ink/70 sm:text-sm">
              {step === 'email'
                ? 'We will email you a one-time verification code (and instant sign-in link). No password needed.'
                : `Enter the code sent to ${email.trim().toLowerCase()}, or tap the link in your email.`}
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
                className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-900"
              >
                {noticeMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-900"
              >
                {errorMessage}
              </div>
            ) : null}

            {step === 'email' ? (
              <form onSubmit={handleSendSubmit} className="mt-5 space-y-4">
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
                    className="mt-1.5 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink shadow-2xs outline-none transition focus:border-webzy-primary focus:ring-2 focus:ring-webzy-primary/15"
                  />
                </div>

                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={busy || !supabaseConfigured}
                  className="btn-spring inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 py-3 text-sm font-bold text-white shadow-btn-primary transition hover:opacity-95 disabled:opacity-50"
                >
                  {busy ? 'Sending OTP code...' : 'Send Verification Code →'}
                </button>

                <button
                  type="button"
                  onClick={handleJumpToExistingOtp}
                  className="inline-flex min-h-[40px] w-full items-center justify-center rounded-full border border-webzy-tint bg-webzy-surface/60 px-4 text-xs font-bold text-webzy-ink/80 transition hover:border-webzy-primary/40 hover:text-webzy-primary"
                >
                  Already have a code in your inbox? Enter it here
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-otp" className="block text-xs font-bold text-webzy-ink">
                      Verification code (6–8 digits)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setOtpCode('');
                        setErrorMessage('');
                        setNoticeMessage('');
                      }}
                      className="text-[11px] font-bold text-webzy-primary hover:underline"
                    >
                      Change email
                    </button>
                  </div>
                  <input
                    ref={otpInputRef}
                    suppressHydrationWarning
                    id="login-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                    placeholder="• • • • • •"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^\d]/g, '').slice(0, 8))}
                    className="mt-1.5 min-h-[54px] w-full rounded-xl border-2 border-webzy-primary/35 bg-webzy-surface/40 px-4 text-center font-mono text-2xl font-extrabold tracking-[0.35em] text-webzy-ink outline-none transition focus:border-webzy-primary focus:bg-white"
                  />
                  <p className="mt-1.5 text-[11px] text-webzy-ink/60">
                    Tip: Paste the digits directly from your email, or click the sign-in button inside
                    the email.
                  </p>
                </div>

                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={busy || otpCode.replace(/\D/g, '').length < 6}
                  className="btn-spring inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 py-3 text-sm font-bold text-white shadow-btn-primary transition hover:opacity-95 disabled:opacity-50"
                >
                  {busy ? 'Verifying...' : 'Verify & Sign In'}
                </button>

                <button
                  type="button"
                  disabled={busy || resendCooldown > 0}
                  onClick={() => void requestEmailOtp(email.trim().toLowerCase())}
                  className="inline-flex min-h-[40px] w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
                </button>
              </form>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-webzy-tint/70 pt-4 text-xs">
              <Link href="/" className="font-bold text-webzy-primary hover:underline">
                ← Back to Webzy
              </Link>
              <Link href="/privacy" className="font-medium text-webzy-ink/55 hover:text-webzy-ink">
                DPDP Private Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
