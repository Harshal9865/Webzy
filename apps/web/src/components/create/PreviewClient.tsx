'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { formatInr, LanguageCode } from '@webzy/core';
import { buildThemePayloadFromDraft, ThemeManifest, ThemeRenderer } from '@webzy/themes';
import { PhoneFrame } from '../shell/PhoneFrame';

interface PreviewClientProps {
  theme: ThemeManifest;
  draftToken: string;
  language: LanguageCode;
  content: Record<string, string>;
  photoUrls: string[];
  revealAt: string | null;
}

export function PreviewClient({
  theme,
  draftToken,
  language,
  content,
  photoUrls,
  revealAt,
}: PreviewClientProps) {
  const [copied, setCopied] = useState(false);

  const payload = buildThemePayloadFromDraft(theme, {
    receiverName: content.receiverName,
    senderName: content.senderName,
    relation: content.relation,
    message: content.message,
    whatsappPhone: content.whatsappPhone,
    photos: photoUrls,
    revealAt: revealAt || undefined,
  });

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <PhoneFrame caption="Watermarked free preview — share or test before paying">
            <ThemeRenderer manifest={theme} data={payload} language={language} watermarked />
          </PhoneFrame>
        </div>

        <aside className="rounded-3xl border border-webzy-tint bg-webzy-surface/60 p-6 lg:col-span-6">
          <span className="inline-flex rounded-full bg-webzy-tint px-3 py-1 text-xs font-bold text-webzy-primary">
            Free Watermarked Preview
          </span>
          <h1 className="mt-3 font-heading text-3xl font-bold text-webzy-ink">
            {theme.name[language]} Preview
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-webzy-ink/75">
            Ye preview bilkul free hai. Checkout (Mock UPI) activate hone par watermark hat jaayega
            aur aapko apna final shareable link + QR code milega.
          </p>

          <div className="mt-5 flex flex-col gap-3">
            <Link
              href={`/checkout?draft=${encodeURIComponent(draftToken)}`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm"
            >
              Remove Watermark &amp; Pay ({formatInr(theme.price.base)}) →
            </Link>

            <button
              suppressHydrationWarning
              type="button"
              onClick={handleCopy}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white"
            >
              {copied ? '✓ Preview link copied' : 'Copy free preview link'}
            </button>

            <Link
              href={`/create/${theme.id}?draft=${encodeURIComponent(draftToken)}`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-webzy-tint bg-white px-6 text-sm font-bold text-webzy-ink"
            >
              Edit draft details
            </Link>
          </div>

          <div className="mt-6 rounded-2xl bg-white p-4 text-xs text-webzy-ink/75">
            Theme price (GST-inclusive): <strong>{formatInr(theme.price.base)}</strong> · Test with
            Mock UPI (zero real money charged).
          </div>
        </aside>
      </div>
    </div>
  );
}
