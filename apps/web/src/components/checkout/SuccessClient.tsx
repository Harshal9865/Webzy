'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
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
  isWedding?: boolean;
  coupleTitle?: string;
  hasPinAddon?: boolean;
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
  isWedding = false,
  coupleTitle,
  hasPinAddon = false,
}: SuccessClientProps) {
  const [copied, setCopied] = useState(false);
  const [guestName, setGuestName] = useState('Sharma Family');
  const [guestCopied, setGuestCopied] = useState(false);
  const [bulkGuestText, setBulkGuestText] = useState(
    'Sharma Family\nKapoor Family\nDr. Mehta & Family',
  );
  const [copiedBulkKey, setCopiedBulkKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.removeItem('webzy_draft_cart');
      const savedGuests = window.localStorage.getItem('webzy_wedding_guest_list');
      if (savedGuests && savedGuests.trim()) {
        setBulkGuestText(savedGuests);
        const firstGuest = savedGuests
          .split(/\r?\n|,/)
          .map((s) => s.trim())
          .find(Boolean);
        if (firstGuest) {
          setGuestName(firstGuest);
        }
      }
      window.dispatchEvent(new Event('webzy_orders_updated'));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const bulkGuests = useMemo(() => {
    return bulkGuestText
      .split(/\r?\n|,/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 100);
  }, [bulkGuestText]);

  const isProvisioning = !siteId;
  const cleanGuest = guestName.trim();
  const personalizedUrl =
    isWedding && cleanGuest
      ? `${liveUrl}?to=${encodeURIComponent(cleanGuest)}`
      : liveUrl;

  const waShareHref = `https://wa.me/?text=${encodeURIComponent(
    isWedding
      ? `Warm greetings! With immense joy, we invite you and your family to celebrate the wedding of ${coupleTitle || 'our family'}. Open your invitation here: ${liveUrl}`
      : `I made a special Webzy surprise for you! Tap here to open it: ${liveUrl}`,
  )}`;

  const personalizedWaHref = `https://wa.me/?text=${encodeURIComponent(
    `Dear ${cleanGuest || 'Family'}, with immense joy we invite you to celebrate the wedding of ${coupleTitle || 'our family'}. Open your personal invitation here: ${personalizedUrl}`,
  )}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(liveUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function handleCopyPersonalized() {
    await navigator.clipboard.writeText(personalizedUrl).catch(() => {});
    setGuestCopied(true);
    setTimeout(() => setGuestCopied(false), 2200);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-webzy-ink/[0.09] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold text-emerald-700">
          Published
        </p>

        <h1 className="mt-2 font-heading text-3xl font-bold text-webzy-ink sm:text-4xl">
          Your Webzy is live!
        </h1>
        <p className="mt-2 text-sm text-webzy-ink/80">
          We also sent the link and receipt to your email. Whoever you share this link with can
          open it directly without logging in:
        </p>

        {isProvisioning ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Payment received · Finalizing your live page
            </p>
            <p className="mt-1.5 text-sm text-amber-950/85">
              Your payment succeeded and your shareable link is finishing publishing. Refresh in a
              moment to see your live link.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-amber-900 px-5 text-xs font-bold text-white"
            >
              Refresh Status
            </button>
          </div>
        ) : (
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
        )}

        {/* Personalized Family Link Generator for Paid Wedding Websites */}
        {isWedding && !isProvisioning ? (
          <div className="mt-6 rounded-2xl border border-[#C9A243]/40 bg-[#FAF6EE] p-5 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#8C6B22]">
                Send Personalized Family Links (/s/{siteSlug}?to=...)
              </p>
              <p className="mt-1 text-xs leading-relaxed text-webzy-ink/75">
                Type a single family name or paste your full guest list (one family per line) to generate permanent personalized WhatsApp invitation links.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input
                type="text"
                aria-label="Guest or family name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                maxLength={50}
                placeholder="e.g. Sharma Family"
                className="min-h-[44px] flex-1 rounded-xl border border-[#C9A243]/45 bg-white px-3.5 text-sm text-webzy-ink outline-none focus:border-[#8C6B22]"
              />
              <button
                type="button"
                onClick={handleCopyPersonalized}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#C9A243]/55 bg-white px-4 text-xs font-bold text-[#5D4314] hover:bg-[#FFFDF9]"
              >
                {guestCopied ? 'Copied' : 'Copy Family Link'}
              </button>
              <a
                href={personalizedWaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#15803D] px-4 text-xs font-bold text-white hover:bg-[#166534]"
              >
                Send on WhatsApp
              </a>
            </div>
            <p className="break-all font-mono text-[11px] text-webzy-ink/65">
              {personalizedUrl}
            </p>

            {/* Bulk Family Guest List Generator */}
            <div className="border-t border-[#C9A243]/30 pt-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="success-bulk-guests" className="text-xs font-bold text-webzy-ink">
                  Bulk Family List ({bulkGuests.length} families)
                </label>
                {bulkGuests.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const allLines = bulkGuests
                        .map((g) => `${g}: ${liveUrl}?to=${encodeURIComponent(g)}`)
                        .join('\n');
                      void navigator.clipboard.writeText(allLines).catch(() => {});
                      setCopiedBulkKey('all');
                      setTimeout(() => setCopiedBulkKey(null), 2200);
                    }}
                    className="rounded-lg border border-[#C9A243]/60 bg-white px-3 py-1 text-[11px] font-bold text-[#5D4314] hover:bg-[#FFFDF9]"
                  >
                    {copiedBulkKey === 'all' ? 'Copied All Links!' : 'Copy All Links'}
                  </button>
                ) : null}
              </div>

              <textarea
                id="success-bulk-guests"
                rows={3}
                value={bulkGuestText}
                onChange={(e) => {
                  setBulkGuestText(e.target.value);
                  try {
                    window.localStorage.setItem('webzy_wedding_guest_list', e.target.value);
                  } catch {
                    // Ignore storage errors
                  }
                }}
                placeholder="One family name per line..."
                className="w-full rounded-xl border border-[#C9A243]/40 bg-white px-3.5 py-2 text-xs text-webzy-ink outline-none focus:border-[#8C6B22]"
              />

              {bulkGuests.length > 0 ? (
                <div className="max-h-52 space-y-1.5 overflow-y-auto rounded-xl border border-[#C9A243]/30 bg-white/80 p-2.5">
                  {bulkGuests.map((fam, idx) => {
                    const famUrl = `${liveUrl}?to=${encodeURIComponent(fam)}`;
                    const famWa = `https://wa.me/?text=${encodeURIComponent(
                      `Dear ${fam}, with immense joy we invite you to celebrate the wedding of ${coupleTitle || 'our family'}. Open your personal invitation here: ${famUrl}`,
                    )}`;
                    return (
                      <div
                        key={fam + idx}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200/80 bg-white px-3 py-1.5 text-xs"
                      >
                        <span className="font-bold text-webzy-ink">{fam}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              void navigator.clipboard.writeText(famUrl).catch(() => {});
                              setCopiedBulkKey(`g-${idx}`);
                              setTimeout(() => setCopiedBulkKey(null), 1800);
                            }}
                            className="rounded-md border border-stone-200 px-2.5 py-1 text-[11px] font-bold text-stone-700 hover:border-[#8C6B22]"
                          >
                            {copiedBulkKey === `g-${idx}` ? 'Copied' : 'Copy Link'}
                          </button>
                          <a
                            href={famWa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md bg-[#15803D] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#166534]"
                          >
                            Send on WhatsApp
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Active Add-On Fulfillment Card (PIN Lock) */}
        {!isProvisioning && hasPinAddon ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs leading-relaxed text-emerald-950">
              <p className="font-bold uppercase tracking-wider text-emerald-800">
                Secret PIN Lock Active
              </p>
              <p className="mt-1">
                Your page is protected by the 4-digit PIN you set at checkout. Remember to share
                that 4-digit PIN with your recipient so they can unlock the page.
              </p>
            </div>
          </div>
        ) : null}

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
