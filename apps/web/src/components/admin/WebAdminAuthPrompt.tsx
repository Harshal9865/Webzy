'use client';

import Link from 'next/link';
import React from 'react';
import { useAuth } from '../components/auth/AuthProvider';

export function WebAdminAuthPrompt({ webUrl }: { webUrl: string }) {
  const { openAuthModal } = useAuth();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-12 bg-[#FAF8F6]">
      <div className="rounded-3xl border border-webzy-tint bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={webUrl || '/'}
            className="group inline-flex items-center gap-2 font-heading text-xl font-bold tracking-tight text-webzy-ink"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-webzy-primary text-sm font-bold text-white shadow-btn-primary transition-transform duration-200 group-hover:scale-105"
              aria-hidden="true"
            >
              w
            </span>
            <span className="font-heading tracking-tight">Webzy</span>
          </Link>
          <span className="inline-flex rounded-full bg-webzy-tint px-3 py-1 text-[11px] font-bold text-webzy-primary">
            Operations Console
          </span>
        </div>
        <h1 className="mt-4 font-heading text-2xl font-bold text-webzy-ink">
          Sign In To Connect Admin
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-webzy-ink/75">
          Sign in with your Webzy founder account to view realtime revenue, orders, live sites, wedding RSVPs, and safety moderation.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              openAuthModal({
                reason: 'Sign in with your Founder / Admin account to open Webzy Operations Console.',
              })
            }
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-webzy-primary px-6 text-xs font-bold text-white shadow-sm hover:opacity-95"
          >
            Sign In Now
          </button>
          <Link
            href={webUrl || '/'}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-webzy-tint bg-white px-5 text-xs font-bold text-webzy-ink hover:bg-webzy-surface"
          >
            Back to Storefront
          </Link>
        </div>
      </div>
    </main>
  );
}
