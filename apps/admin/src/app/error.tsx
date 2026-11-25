'use client';

import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const reportedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${error?.name || 'Error'}:${error?.message || ''}:${error?.digest || ''}`;
    if (reportedKeyRef.current === key) return;
    reportedKeyRef.current = key;

    const route =
      typeof window !== 'undefined' ? window.location.pathname.slice(0, 120) : '/';

    void fetch('/api/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        name: (error?.name || 'Error').slice(0, 64),
        message: (error?.message || 'Unhandled admin UI error').slice(0, 240),
        digest: typeof error?.digest === 'string' ? error.digest.slice(0, 64) : undefined,
        route,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12 text-center">
      <div className="rounded-3xl border border-red-200 bg-red-50 p-7 text-red-950">
        <h1 className="font-heading text-2xl font-bold">Admin Console Error</h1>
        <p className="mt-2 text-sm">
          An unexpected error occurred loading this internal view. Retry below.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-5 text-xs font-bold text-white"
          >
            Retry
          </button>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-full border border-red-200 bg-white px-5 text-xs font-bold text-red-950"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
