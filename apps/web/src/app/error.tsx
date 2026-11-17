'use client';

import Link from 'next/link';
import React from 'react';

export default function WebErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
