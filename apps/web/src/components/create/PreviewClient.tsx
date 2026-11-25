'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { formatInr, LanguageCode, pickLocalizedText } from '@webzy/core';
import {
  buildThemePayloadFromDraft,
  getWeddingMockByTemplateId,
  isWeddingTemplateId,
  ThemeManifest,
  ThemeRenderer,
  WeddingScroll,
  type WeddingInvitation,
} from '@webzy/themes';
import { AdaptivePreviewStage } from '../shell/AdaptivePreviewStage';

interface PreviewClientProps {
  theme: ThemeManifest;
  draftToken: string;
  language: LanguageCode;
  content: Record<string, unknown>;
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
  const [replayKey, setReplayKey] = useState(0);
  const isWedding = theme.occasion === 'wedding';

  const weddingData: WeddingInvitation | null = isWedding
    ? (() => {
        const fallback = getWeddingMockByTemplateId(theme.id);
        const saved =
          content.weddingData && typeof content.weddingData === 'object'
            ? (content.weddingData as Partial<WeddingInvitation>)
            : {};
        return {
          ...fallback,
          ...saved,
          templateId: isWeddingTemplateId(theme.id) ? theme.id : fallback.templateId,
          gallery:
            photoUrls.length > 0
              ? photoUrls
              : saved.gallery && saved.gallery.length > 0
                ? saved.gallery
                : fallback.gallery,
        };
      })()
    : null;

  const stringContent = content as Record<string, string>;
  const payload = !isWedding
    ? buildThemePayloadFromDraft(theme, {
        receiverName: stringContent.receiverName,
        senderName: stringContent.senderName,
        relation: stringContent.relation,
        message: stringContent.message,
        whatsappPhone: stringContent.whatsappPhone,
        photos: photoUrls,
        revealAt: revealAt || undefined,
      })
    : null;

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const editHref = isWedding
    ? `/weddings/${theme.id}/customize?draft=${encodeURIComponent(draftToken)}`
    : `/create/${theme.id}?draft=${encodeURIComponent(draftToken)}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <AdaptivePreviewStage
            title={
              weddingData
                ? `${weddingData.brideName} & ${weddingData.groomName}`
                : pickLocalizedText(theme.name, language)
            }
            caption="Free preview — test before paying"
            accentColor={theme.palette.primary}
            onReplay={() => setReplayKey((k) => k + 1)}
            fullscreenChildren={
              weddingData ? (
                <div className="relative">
                  <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-amber-300/60 bg-black/75 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200 shadow-lg backdrop-blur-sm">
                    Preview Only · webzy.in
                  </div>
                  <WeddingScroll key={`fs-${replayKey}`} data={weddingData} />
                </div>
              ) : (
                <ThemeRenderer
                  key={`fs-${replayKey}`}
                  manifest={theme}
                  data={payload ?? undefined}
                  language={language}
                  watermarked
                />
              )
            }
          >
            {weddingData ? (
              <div className="relative">
                <div className="pointer-events-none sticky top-2 z-50 mx-auto w-fit rounded-full border border-amber-300/60 bg-black/75 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200 shadow-md backdrop-blur-sm">
                  Preview Only · webzy.in
                </div>
                <WeddingScroll key={`emb-${replayKey}`} data={weddingData} embedded />
              </div>
            ) : (
              <ThemeRenderer
                key={`emb-${replayKey}`}
                manifest={theme}
                data={payload ?? undefined}
                language={language}
                watermarked
              />
            )}
          </AdaptivePreviewStage>
        </div>

        <aside className="rounded-2xl border border-webzy-ink/[0.09] bg-white p-6 lg:col-span-6">
          <p className="text-xs font-semibold text-webzy-primary">
            Free Preview
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-webzy-ink">
            {weddingData
              ? `${weddingData.brideName} & ${weddingData.groomName}`
              : `${pickLocalizedText(theme.name, language)} Preview`}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-webzy-ink/75">
            {isWedding
              ? 'Preview your wedding invitation across phone, tablet, and full screen. Continue to checkout when ready to publish your live shareable link.'
              : 'Ye preview bilkul free hai. Checkout activate hone par watermark hat jaayega aur aapko apna final shareable link + QR code milega.'}
          </p>

          <div className="mt-5 flex flex-col gap-3">
            <Link
              href={`/checkout?draft=${encodeURIComponent(draftToken)}`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {isWedding
                ? `Publish & Pay (${formatInr(theme.price.base)}) →`
                : `Remove Watermark & Pay (${formatInr(theme.price.base)}) →`}
            </Link>

            <button
              suppressHydrationWarning
              type="button"
              onClick={handleCopy}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white"
            >
              {copied ? 'Preview link copied' : 'Copy free preview link'}
            </button>

            <Link
              href={editHref}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-webzy-tint bg-white px-6 text-sm font-bold text-webzy-ink"
            >
              {isWedding ? 'Edit wedding details' : 'Edit draft details'}
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-webzy-ink/[0.07] bg-webzy-surface/40 p-4 text-xs text-webzy-ink/75">
            Price (GST-inclusive): <strong>{formatInr(theme.price.base)}</strong> ·{' '}
            {isWedding ? '90-day live wedding link with unlimited family links.' : 'Instant shareable link after payment.'}
          </div>
        </aside>
      </div>
    </div>
  );
}
