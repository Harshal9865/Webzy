'use client';

import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

export default function WebErrorBoundary({
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
        message: (error?.message || 'Unhandled UI error').slice(0, 240),
        digest: typeof error?.digest === 'string' ? error.digest.slice(0, 64) : undefined,
        route,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="rounded-3xl border border-webzy-tint bg-webzy-surface p-8">
        <h1 className="font-heading text-2xl font-bold text-webzy-ink">
          Something went wrong — please try again
        </h1>
        <p className="mt-2 text-sm text-webzy-ink/75">
          We hit a small hiccup loading this page. Click retry or return to the homepage.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-5 text-sm font-bold text-white"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-white px-5 text-sm font-bold text-webzy-ink"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
