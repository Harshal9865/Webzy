'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { formatPaiseAsInr } from '@webzy/core';

interface SuccessClientProps {
  orderId: string;
  siteId?: string;
  siteSlug: string;
  liveUrl: string;
  invoiceNo: string;
  amountPaise: number;
  isTest: boolean;
  businessName: string;
  businessAddress: string;
  freeEditUntil?: string;
}

export function SuccessClient({
  orderId,
  siteId,
  siteSlug,
  liveUrl,
  invoiceNo,
  amountPaise,
  isTest,
  businessName,
  businessAddress,
  freeEditUntil,
}: SuccessClientProps) {
  const [copied, setCopied] = useState(false);

  const waShareHref = `https://wa.me/?text=${encodeURIComponent(
    `I made a special Webzy surprise for you! Tap here to open it: ${liveUrl}`,
  )}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(liveUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-webzy-tint bg-webzy-surface p-6 shadow-sm sm:p-8">
        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
          Published & Ready to Share
        </span>

        <h1 className="mt-3 font-heading text-3xl font-bold text-webzy-ink sm:text-4xl">
          Your Webzy is live!
        </h1>
        <p className="mt-2 text-sm text-webzy-ink/80">
          We also sent the link and receipt to your email. Whoever you share this link with can
          open it directly without logging in:
        </p>

        <div className="mt-5 rounded-2xl border border-webzy-tint bg-white p-4">
          <p className="text-xs font-semibold text-webzy-ink/60">Your shareable Webzy link</p>
          <p className="mt-1 break-all font-mono text-sm font-bold text-webzy-primary">{liveUrl}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/s/${siteSlug}`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white shadow-sm"
            >
              Open Live Page →
            </Link>
            <a
              href={waShareHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#15803D] px-6 text-sm font-bold text-white"
            >
              Share on WhatsApp
            </a>
            <button
              suppressHydrationWarning
              type="button"
              onClick={handleCopy}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-webzy-tint bg-white px-5 text-sm font-bold text-webzy-ink"
            >
              {copied ? '✓ Link copied' : 'Copy link'}
            </button>
            {siteId ? (
              <Link
                href={`/edit/${siteId}`}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-webzy-tint bg-white px-5 text-sm font-bold text-webzy-ink"
              >
                Free 24h Edit
              </Link>
            ) : null}
          </div>
          {freeEditUntil ? (
            <p suppressHydrationWarning className="mt-3 text-[11px] text-webzy-ink/60">
              Free edit window open until{' '}
              {new Intl.DateTimeFormat('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'Asia/Kolkata',
              }).format(new Date(freeEditUntil))}{' '}
              IST.
            </p>
          ) : null}
        </div>

        {/* Receipt & Invoice Summary */}
        <div className="mt-6 rounded-2xl border border-webzy-tint bg-white p-5 text-xs leading-relaxed">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-webzy-ink">
              Invoice: {invoiceNo || `WEBZY-${orderId.slice(0, 6)}`}
            </span>
            {isTest ? (
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 font-bold text-red-800">
                TEST, not a tax invoice
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-webzy-ink/75">
            Amount paid: <strong>{formatPaiseAsInr(amountPaise)}</strong> (GST-inclusive) · Issuer:{' '}
            {businessName}, {businessAddress}
          </p>
          <p className="mt-1 text-webzy-ink/60">
            Live page path: <code>/s/{siteSlug}</code>
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/account"
            className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-white px-5 text-xs font-bold text-webzy-ink"
          >
            Go to My Webzys
          </Link>
          <Link
            href="/themes"
            className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-white px-5 text-xs font-bold text-webzy-primary"
          >
            Create another Webzy
          </Link>
        </div>
      </div>
    </div>
  );
}
