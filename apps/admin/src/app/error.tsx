'use client';

import Link from 'next/link';
import React from 'react';

export default function AdminErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
