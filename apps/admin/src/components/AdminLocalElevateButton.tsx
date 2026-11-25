'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export function AdminLocalElevateButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleElevate() {
    setBusy(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/elevate-local', { method: 'POST' });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Could not enable local admin access.');
      }
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Elevation failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void handleElevate()}
        className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-webzy-primary px-5 text-xs font-bold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
      >
        {busy ? 'Enabling Admin Access...' : 'Grant Admin Role (Local Dev)'}
      </button>
      {errorMsg ? <p className="text-xs font-semibold text-red-700">{errorMsg}</p> : null}
    </div>
  );
}
