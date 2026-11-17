'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { sanitizeRedirectPath } from '@webzy/core';
import { getSupabaseBrowserClient } from '../../../../../infra/supabase/browser';

interface LoginClientProps {
  supabaseConfigured: boolean;
  nextPath: string;
  draftToken?: string;
  initialError?: string;
}

export function LoginClient({
  supabaseConfigured,
  nextPath,
  draftToken,
  initialError,
}: LoginClientProps) {
  const router = useRouter();
  const safeNext = sanitizeRedirectPath(nextPath, '/account');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'error'>(
    initialError ? 'error' : 'idle',
  );
  const [errorMessage, setErrorMessage] = useState(initialError || '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setStatus('error');
      setErrorMessage('Supabase keys are missing in .env.local.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

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
        setStatus('error');
        setErrorMessage(error.message);
        return;
      }

      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to send login code right now. Please retry.',
      );
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = otpCode.replace(/\s+/g, '');
    if (cleanCode.length < 6) {
      setErrorMessage('Please enter the 6-digit code from your email.');
      return;
    }

    setStatus('verifying');
    setErrorMessage('');

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanCode,
        type: 'email',
      });

      if (error) {
        setStatus('sent');
        setErrorMessage(error.message || 'Invalid or expired code. Please check or resend.');
        return;
      }

      if (draftToken) {
        await fetch('/api/auth/attach-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ draftToken }),
        }).catch(() => {});
      }

      router.push(safeNext);
      router.refresh();
    } catch (err) {
      setStatus('sent');
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not verify code right now. Please retry.',
      );
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-webzy-tint bg-webzy-surface/60 p-6 shadow-sm sm:p-8">
        <span className="inline-flex rounded-full bg-webzy-tint px-3 py-1 text-xs font-bold text-webzy-primary">
          No password needed · 6-digit code or link
        </span>

        <h1 className="mt-3 font-heading text-3xl font-bold text-webzy-ink">
          Sign in with your email
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-webzy-ink/75">
          We will send a 6-digit verification code and sign-in link to your email. Stay right on
          this tab and enter the code — no password required.
        </p>

        {!supabaseConfigured ? (
          <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950">
            <strong>Setup needed first:</strong> Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, then restart{' '}
            <code>npm run dev:web</code>.
          </div>
        ) : null}

        {status === 'sent' || status === 'verifying' ? (
          <form
            onSubmit={handleVerifyOtp}
            className="mt-6 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5"
          >
            <div>
              <p className="text-sm font-bold text-emerald-950">Verification sent to {email}</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-900">
                Enter the 6-digit code from your email below to continue right here (or tap the
                sign-in link in the email).
              </p>
            </div>

            <div>
              <label htmlFor="login-otp" className="block text-xs font-bold text-webzy-ink">
                6-digit verification code
              </label>
              <input
                suppressHydrationWarning
                id="login-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="mt-1.5 min-h-[48px] w-full rounded-xl border border-emerald-300 bg-white px-4 text-center font-mono text-lg font-bold tracking-[0.25em] text-webzy-ink outline-none focus:border-webzy-primary"
              />
            </div>

            {errorMessage ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900"
              >
                {errorMessage}
              </div>
            ) : null}

            <button
              suppressHydrationWarning
              type="submit"
              disabled={status === 'verifying'}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
            >
              {status === 'verifying' ? 'Verifying code...' : 'Verify & Continue'}
            </button>

            <button
              suppressHydrationWarning
              type="button"
              onClick={() => {
                setStatus('idle');
                setOtpCode('');
                setErrorMessage('');
              }}
              className="inline-flex min-h-[40px] w-full items-center justify-center rounded-full border border-emerald-300 bg-white px-4 text-xs font-bold text-emerald-900"
            >
              Change email or resend
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                className="mt-1.5 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink outline-none focus:border-webzy-primary"
              />
            </div>

            {status === 'error' ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900"
              >
                {errorMessage}
              </div>
            ) : null}

            <button
              suppressHydrationWarning
              type="submit"
              disabled={status === 'sending' || !supabaseConfigured}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending code & link...' : 'Send login code'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs font-bold text-webzy-primary hover:underline">
            ← Back to Webzy home
          </Link>
        </div>
      </div>
    </div>
  );
}
