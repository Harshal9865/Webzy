'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface PinGateClientProps {
  slug: string;
}

export function PinGateClient({ slug }: PinGateClientProps) {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    const clean = pin.replace(/\D/g, '').slice(0, 4);
    if (clean.length !== 4) {
      setErrorMsg('Please enter all 4 digits of your secret PIN.');
      return;
    }

    setBusy(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/sites/${encodeURIComponent(slug)}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: clean }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Incorrect PIN. Please try again.');
      }
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to unlock. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-webzy-surface via-white to-webzy-surface/60 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-webzy-tint bg-white p-7 text-center shadow-lg sm:p-9">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-webzy-primary/10 text-webzy-primary"
          aria-hidden="true"
        >
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h1 className="mt-5 font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
          Enter Secret PIN
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-webzy-ink/75">
          This private Webzy page is protected. Type the 4-digit PIN shared with you to open it.
        </p>

        <form onSubmit={handleUnlock} className="mt-6 space-y-4">
          <div>
            <label htmlFor="pin-gate-input" className="sr-only">
              4-digit secret PIN
            </label>
            <input
              id="pin-gate-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              autoFocus
              required
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="••••"
              className="min-h-[58px] w-full rounded-2xl border-2 border-webzy-tint bg-webzy-surface/40 px-4 text-center font-mono text-2xl font-bold tracking-[0.45em] text-webzy-ink outline-none transition focus:border-webzy-primary focus:bg-white"
            />
          </div>

          {errorMsg ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-900"
            >
              {errorMsg}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy || pin.length < 4}
            className="btn-spring inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white shadow-md transition hover:opacity-95 disabled:opacity-50"
          >
            {busy ? 'Checking PIN...' : 'Unlock Page →'}
          </button>
        </form>
      </div>
    </div>
  );
}
