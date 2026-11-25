'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../../../../infra/supabase/browser';

interface MfaClientProps {
  adminEmail: string;
}

function mapMfaError(err: unknown, fallback: string): string {
  const raw =
    typeof err === 'string'
      ? err
      : err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
        ? err.message
        : '';

  const normalized = raw.trim().toLowerCase();
  if (!normalized) return fallback;

  if (
    normalized.includes('invalid totp') ||
    normalized.includes('invalid code') ||
    normalized.includes('verification failed') ||
    normalized.includes('invalid token')
  ) {
    return 'Invalid 6-digit authenticator code. Check your device clock and enter the current code.';
  }
  if (normalized.includes('rate limit') || normalized.includes('too many')) {
    return 'Too many verification attempts. Please wait a moment and try again.';
  }
  if (normalized.includes('factor') && normalized.includes('not found')) {
    return '2FA enrollment session expired. Retry 2FA setup to generate a fresh QR code.';
  }
  if (
    normalized.includes('not authenticated') ||
    normalized.includes('session') ||
    normalized.includes('jwt')
  ) {
    return 'Your admin session expired. Sign out and sign in again to complete 2FA.';
  }
  if (
    normalized.includes('network') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('fetch')
  ) {
    return 'Unable to reach the authentication service. Check your connection and retry.';
  }

  return fallback;
}

export function MfaClient({ adminEmail }: MfaClientProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'loading' | 'enroll' | 'verify' | 'error'>('loading');
  const [factorId, setFactorId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const initMfa = useCallback(async () => {
    setMode('loading');
    setErrorMsg('');
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: factorsData, error: listErr } = await supabase.auth.mfa.listFactors();
      if (listErr) throw listErr;

      const verified = factorsData.totp.find((f) => f.status === 'verified');
      if (verified) {
        setFactorId(verified.id);
        setMode('verify');
        return;
      }

      // Remove abandoned unverified TOTP factors before fresh enrollment
      for (const stale of factorsData.all.filter(
        (f) => f.factor_type === 'totp' && f.status === 'unverified',
      )) {
        try {
          await supabase.auth.mfa.unenroll({ factorId: stale.id });
        } catch {
          // Ignore stale factor unenroll error so enrollment continues cleanly
        }
      }

      const { data: enrolled, error: enrollErr } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Webzy Admin Authenticator',
      });

      if (enrollErr || !enrolled) {
        throw enrollErr ?? new Error('Unable to start 2FA enrollment.');
      }

      setFactorId(enrolled.id);
      setQrCodeUrl(enrolled.totp.qr_code);
      setManualSecret(enrolled.totp.secret);
      setMode('enroll');
    } catch (err) {
      setErrorMsg(mapMfaError(err, 'Unable to load 2FA settings. Please retry.'));
      setMode('error');
    }
  }, []);

  useEffect(() => {
    initMfa();
  }, [initMfa]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || code.trim().length < 6) {
      setErrorMsg('Enter the 6-digit code from your authenticator app.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: challengeData, error: chalErr } = await supabase.auth.mfa.challenge({
        factorId,
      });
      if (chalErr || !challengeData) {
        throw chalErr ?? new Error('2FA challenge failed.');
      }

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: code.trim(),
      });

      if (verifyErr) {
        throw verifyErr;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setErrorMsg(mapMfaError(err, 'Invalid 2FA code. Please verify and retry.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch {
      setErrorMsg('Sign out failed. Please clear browser cookies and retry.');
    }
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-900">
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
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
              Step 2 of 2 · 2FA
            </span>
          </div>

          <h1 className="mt-5 font-heading text-2xl font-bold tracking-tight text-slate-900">
            {mode === 'enroll' ? 'Set up Authenticator 2FA' : 'Enter 6-digit 2FA Code'}
          </h1>
          <p className="mt-1 truncate text-xs text-slate-600">Admin account: {adminEmail}</p>

          {mode === 'loading' ? (
            <p className="mt-6 text-sm text-slate-600">Checking 2FA enrollment...</p>
          ) : mode === 'error' ? (
            <div className="mt-5 space-y-3">
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-900"
              >
                {errorMsg || 'Unable to load 2FA configuration.'}
              </div>
              <button
                type="button"
                onClick={initMfa}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800"
              >
                Retry 2FA setup
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Sign out and switch account
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="mt-5 space-y-4">
              {mode === 'enroll' && qrCodeUrl ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center">
                  <p className="text-xs font-semibold text-slate-800">
                    Open an <strong>Authenticator app</strong> (Google Authenticator, Microsoft
                    Authenticator, or Authy) and scan this QR code:
                  </p>
                  <p className="mt-1 text-[11px] text-amber-800">
                    Do not use Google Lens or regular camera — it only works inside an Authenticator
                    app, or paste the setup key below.
                  </p>
                  <div className="mt-3 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeUrl}
                      alt="TOTP 2FA QR Code"
                      className="h-48 w-48 rounded-xl border border-slate-200 bg-white p-3"
                    />
                  </div>
                  {manualSecret ? (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                      <p className="break-all font-mono text-[11px] text-slate-800">
                        {manualSecret}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText(manualSecret).catch(() => {});
                          setCopiedSecret(true);
                          setTimeout(() => setCopiedSecret(false), 2000);
                        }}
                        className="mt-2.5 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100"
                      >
                        {copiedSecret ? 'Setup Key Copied' : 'Copy Manual Setup Key'}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div>
                <label htmlFor="totp-code" className="block text-xs font-semibold text-slate-700">
                  6-digit verification code
                </label>
                <input
                  id="totp-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-4 text-center font-mono text-lg tracking-widest text-slate-900 font-tabular outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
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
                disabled={submitting}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50"
              >
                {submitting ? 'Verifying...' : 'Verify & enter Admin'}
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Sign out and switch account
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
