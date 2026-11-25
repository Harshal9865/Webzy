'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../../../../infra/supabase/browser';

interface MfaClientProps {
  adminEmail: string;
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
      setErrorMsg(err instanceof Error ? err.message : 'Unable to load 2FA settings.');
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
      setErrorMsg(err instanceof Error ? err.message : 'Invalid 2FA code. Please retry.');
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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <div className="rounded-3xl border border-webzy-tint bg-webzy-surface p-7 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 font-heading text-xl font-bold tracking-tight text-webzy-ink">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-webzy-primary text-sm font-bold text-white shadow-btn-primary"
              aria-hidden="true"
            >
              w
            </span>
            <span className="font-heading tracking-tight">Webzy</span>
          </div>
          <span className="inline-flex rounded-full bg-webzy-tint px-3 py-1 text-[11px] font-bold text-webzy-primary">
            Step 2 of 2 · 2FA
          </span>
        </div>

        <h1 className="mt-3 font-heading text-2xl font-bold text-webzy-ink">
          {mode === 'enroll' ? 'Set up Authenticator 2FA' : 'Enter 6-digit 2FA Code'}
        </h1>
        <p className="mt-1 text-xs text-webzy-ink/70">Admin account: {adminEmail}</p>

        {mode === 'loading' ? (
          <p className="mt-6 text-sm text-webzy-ink/75">Checking 2FA enrollment...</p>
        ) : mode === 'error' ? (
          <div className="mt-5 space-y-4">
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900"
            >
              {errorMsg || 'Unable to load 2FA configuration.'}
            </div>
            <button
              type="button"
              onClick={initMfa}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white"
            >
              Retry 2FA setup
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex min-h-[44px] w-full items-center justify-center text-xs font-semibold text-webzy-ink/70 hover:text-webzy-ink"
            >
              Sign out and switch account
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="mt-5 space-y-4">
            {mode === 'enroll' && qrCodeUrl ? (
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <p className="text-xs font-semibold text-webzy-ink">
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
                    className="h-48 w-48 rounded-lg border border-black/10 bg-white p-3"
                  />
                </div>
                {manualSecret ? (
                  <div className="mt-3 rounded-xl bg-webzy-surface p-2.5">
                    <p className="break-all font-mono text-[11px] text-webzy-ink">
                      {manualSecret}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(manualSecret).catch(() => {});
                        setCopiedSecret(true);
                        setTimeout(() => setCopiedSecret(false), 2000);
                      }}
                      className="mt-2 inline-flex min-h-[32px] items-center rounded-full border border-webzy-tint bg-white px-3 text-[11px] font-bold text-webzy-primary"
                    >
                      {copiedSecret ? 'Setup Key Copied' : 'Copy Manual Setup Key'}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div>
              <label htmlFor="totp-code" className="block text-xs font-bold text-webzy-ink">
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
                className="mt-1 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-center font-mono text-lg tracking-widest text-webzy-ink"
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
              disabled={submitting}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white disabled:opacity-50"
            >
              {submitting ? 'Verifying...' : 'Verify & enter Admin'}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex min-h-[44px] w-full items-center justify-center text-xs font-semibold text-webzy-ink/70 hover:text-webzy-ink"
            >
              Sign out and switch account
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
