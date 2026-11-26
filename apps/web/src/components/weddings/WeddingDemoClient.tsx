'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { getSiteCopy } from '@webzy/core';
import {
  parseWeddingLanguage,
  WEDDING_LANGUAGE_OPTIONS,
  WeddingScroll,
  type WeddingLanguage,
} from '@webzy/themes';
import { AdaptivePreviewStage } from '../shell/AdaptivePreviewStage';
import { useLanguage } from '../shell/LanguageProvider';
import { formatInrComma, type WeddingEditionMeta } from './weddingCatalog';

interface WeddingDemoClientProps {
  edition: WeddingEditionMeta;
}

const PAPER_GRAIN_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

export function WeddingDemoClient({ edition }: WeddingDemoClientProps) {
  const { language } = useLanguage();
  const site = getSiteCopy(language);
  const w = site.weddings;
  const [lang, setLang] = useState<WeddingLanguage>(() => parseWeddingLanguage(language) ?? 'en');
  const [guestName, setGuestName] = useState(edition.sampleGuest);
  const [replayKey, setReplayKey] = useState(0);
  const [startOpened, setStartOpened] = useState(false);

  // Sync wedding preview script whenever user picks a language in the global header selector
  useEffect(() => {
    const mapped = parseWeddingLanguage(language);
    if (mapped) {
      setLang(mapped);
    } else {
      setLang('en');
    }
  }, [language]);

  const previewData = useMemo(
    () => ({
      ...edition.defaultData,
      language: lang,
    }),
    [edition.defaultData, lang],
  );

  const savings = edition.compareAtInr - edition.priceInr;
  const discountPct = Math.round((savings / edition.compareAtInr) * 100);
  const cleanGuest = guestName.trim();
  const fullScreenHref = `/i/${edition.demoSlug}?lang=${lang}${
    cleanGuest ? `&to=${encodeURIComponent(cleanGuest)}` : ''
  }`;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#F7F3EC] text-[#1F1419]">
      {/* Subtle Hand-Pressed Paper Grain Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.032] mix-blend-multiply"
        aria-hidden="true"
        style={{ backgroundImage: PAPER_GRAIN_SVG }}
      />

      <div className="relative mx-auto max-w-6xl px-3.5 py-5 sm:px-6 lg:py-12">
        {/* Atelier Top Bar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#C9A243]/25 pb-4 sm:mb-8 sm:pb-5">
          <Link
            href="/weddings"
            className="inline-flex min-h-[42px] items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C6B22] transition hover:text-[#1F1419]"
          >
            <span>←</span>
            <span>{w.demo.backToWeddings}</span>
          </Link>

          <Link
            href={fullScreenHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-spring inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#C9A243]/45 bg-[#FFFDF9] px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3B2A2F] shadow-sm transition hover:border-[#8C6B22] hover:text-[#1F1419]"
          >
            <span>{w.demo.openFullScreen}</span>
            <svg
              className="h-3.5 w-3.5 opacity-65"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-10">
          {/* Left: Illuminated Obsidian Gallery Plinth */}
          <div className="w-full lg:sticky lg:top-8 lg:col-span-6">
            <div className="relative overflow-hidden rounded-[24px] border border-[#C9A243]/35 bg-[#FFFDF9] p-3.5 shadow-[0_24px_60px_-28px_rgba(31,20,25,0.2)] sm:p-5 lg:rounded-[28px] lg:border-[#C9A243]/40 lg:bg-[#161013] lg:p-8 lg:shadow-[0_38px_84px_-24px_rgba(16,9,13,0.68)]">
              <div
                className="pointer-events-none absolute inset-3 hidden rounded-[20px] border border-[#C9A243]/20 lg:block"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-0 hidden lg:block"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 50% 42%, rgba(212,175,55,0.2) 0%, rgba(122,22,40,0.12) 42%, transparent 72%)',
                }}
              />

              <div className="relative mb-5 hidden items-center justify-between border-b border-[#C9A243]/20 pb-3 lg:flex">
                <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#E4C77B]/80">
                  Live Edition Studio
                </span>
                <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#FAF6EE]/55">
                  {edition.specimenCity} · {edition.specimenDate}
                </span>
              </div>

              <div className="relative w-full">
                <AdaptivePreviewStage
                  title={edition.editorialName}
                  accentColor={edition.palette.primary}
                  onReplay={() => {
                    setStartOpened(false);
                    setReplayKey((k) => k + 1);
                  }}
                  externalFullScreenHref={fullScreenHref}
                  toolbar={
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <div className="relative inline-flex items-center">
                        <select
                          aria-label="Choose wedding invitation language"
                          value={lang}
                          onChange={(e) => setLang(e.target.value as WeddingLanguage)}
                          className="min-h-[42px] appearance-none rounded-full border border-[#C9A243]/45 bg-[#FAF6EE] pl-4 pr-9 text-xs font-bold text-[#1F1419] outline-none transition hover:border-[#8C6B22] lg:border-[#C9A243]/40 lg:bg-[#22191E]/95 lg:text-[#FAF6EE]"
                        >
                          {WEDDING_LANGUAGE_OPTIONS.map((item) => (
                            <option
                              key={item.code}
                              value={item.code}
                              className="bg-[#FAF6EE] text-[#1F1419]"
                            >
                              {item.nativeLabel} ({item.englishLabel})
                            </option>
                          ))}
                        </select>
                        <svg
                          className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-[#8C6B22] lg:text-[#E4C77B]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.2}
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setStartOpened((prev) => !prev);
                          setReplayKey((k) => k + 1);
                        }}
                        className="min-h-[42px] rounded-full border border-[#C9A243]/45 bg-[#FFFDF9] px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3B2A2F] transition hover:border-[#8C6B22] lg:border-[#C9A243]/35 lg:bg-[#22191E]/95 lg:text-[#E4C77B] lg:hover:border-[#E4C77B]"
                      >
                        {startOpened ? w.demo.showOpeningGate : w.demo.jumpInside}
                      </button>
                    </div>
                  }
                  fullscreenChildren={
                    <WeddingScroll
                      key={`fs-${edition.id}-${replayKey}-${startOpened ? 'open' : 'gate'}`}
                      data={previewData}
                      guestName={cleanGuest || null}
                      initialOpen={startOpened}
                    />
                  }
                >
                  <WeddingScroll
                    key={`${edition.id}-${replayKey}-${startOpened ? 'open' : 'gate'}`}
                    data={previewData}
                    guestName={cleanGuest || null}
                    embedded
                    initialOpen={startOpened}
                  />
                </AdaptivePreviewStage>

                <p className="mt-4 text-center text-[11px] font-medium tracking-[0.06em] text-[#6B574C] lg:text-[#E4C77B]/75">
                  {edition.id === 'wedding-royal-red-01'
                    ? 'Tap the wax seal to unfold the velvet envelope and explore every chapter'
                    : edition.id === 'wedding-rose-ivory-01'
                      ? 'Press the rose wax seal to unfold the blush-silk envelope and explore every chapter'
                      : edition.id === 'wedding-christian-ivory-01'
                        ? 'Tap the olive-and-cross medallion to open the cathedral doors'
                        : 'Tap the center medallion to open the invitation doors and explore every chapter'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Archival Edition Folio, Guest Tester, Pricing Sheet & Included Chapters */}
          <aside className="rounded-2xl border border-[#C9A243]/35 bg-[#FFFDF9] p-2 shadow-[0_24px_60px_-28px_rgba(31,20,25,0.18)] sm:rounded-3xl sm:p-3 lg:col-span-6">
            <div className="rounded-xl border border-[#C9A243]/20 p-4 sm:rounded-2xl sm:p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8C6B22]">
                  {edition.moodLabel}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7A685B]">
                  {edition.validityDays}-Day Link · Instant Setup
                </span>
              </div>

              <h1 className="mt-3 font-royal-serif text-4xl font-medium leading-[1.05] tracking-[-0.015em] text-[#1F1419] sm:text-5xl">
                {edition.editorialName}
              </h1>
              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8A786B]">
                {edition.collectionSubtitle}
              </p>
              <p className="mt-4 text-sm leading-[1.75] text-[#4E3E43]">{edition.storyLead}</p>

              {/* Dignified Obsidian GST Pricing Sheet */}
              <div className="mt-5 rounded-[18px] border border-[#C9A243]/40 bg-[#1A1317] p-4 text-[#FAF6EE] sm:mt-6 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E4C77B]">
                    One-Time GST-Inclusive Tariff
                  </p>
                  <span className="rounded-full border border-[#72C8A2]/30 bg-[#154532] px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-[#EAF9F1]">
                    Save {formatInrComma(savings)} ({discountPct}% off)
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-3 font-tabular">
                  <p className="font-royal-serif text-4xl font-semibold leading-none text-[#E4C77B]">
                    {formatInrComma(edition.priceInr)}
                  </p>
                  <span className="text-base font-normal text-[#FAF6EE]/35 line-through">
                    {formatInrComma(edition.compareAtInr)}
                  </span>
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-[#E4D6C4]/75">
                  Includes unlimited personalized WhatsApp family links,{' '}
                  {edition.tradition === 'christian' ? 'dietary & guest RSVP' : 'Veg & Jain RSVP'}{' '}
                  tracking, and 24-hour free typo edits. Optional add-ons available at checkout.
                </p>
              </div>

              {/* Live Calligrapher's Guest Name Tester */}
              <div className="mt-4 rounded-[18px] border border-[#C9A243]/35 bg-[#FAF6EE]/80 p-4 sm:mt-5 sm:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <label
                    htmlFor="demo-guest-tester"
                    className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8C6B22]"
                  >
                    {w.demo.guestTesterLabel}
                  </label>
                  <span className="font-royal-script text-xl leading-none text-[#6B0F1E]">
                    {cleanGuest || 'Dear Guest'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#6B574C]">
                  {w.demo.guestTesterHint}
                </p>
                <input
                  id="demo-guest-tester"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Sharma Family"
                  maxLength={50}
                  className="mt-3 min-h-[44px] w-full rounded-full border border-[#C9A243]/45 bg-[#FFFDF9] px-4 text-sm font-medium text-[#1F1419] placeholder:text-[#8A786B] outline-none transition focus:border-[#8C6B22]"
                />
              </div>

              {/* Numbered Included Chapters (01 - 06) */}
              <div className="mt-7">
                <div className="flex items-center gap-3">
                  <h2 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8C6B22]">
                    {w.demo.insideEdition}
                  </h2>
                  <span className="h-px flex-1 bg-[#C9A243]/25" aria-hidden="true" />
                </div>

                <ol className="mt-3 divide-y divide-[#C9A243]/20 border-b border-[#C9A243]/25">
                  {edition.includedSections.map((item, idx) => (
                    <li key={item.title} className="flex items-start gap-4 py-3.5">
                      <span className="mt-0.5 font-royal-serif text-xl font-normal leading-none text-[#C9A243]">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="font-royal-serif text-lg font-semibold leading-snug text-[#1F1419]">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-[#5A484C]">
                          {item.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Prominent Primary CTA */}
              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href={`/weddings/${edition.id}/customize`}
                  className="btn-spring flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-[#E4C77B]/35 px-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#FAF6EE] shadow-md transition hover:brightness-110"
                  style={{ backgroundColor: edition.palette.primary }}
                >
                  <span>{w.card.customizeAndPay} {formatInrComma(edition.priceInr)} →</span>
                </Link>
                <p className="text-center text-[11px] tracking-[0.03em] text-[#756254]">
                  {w.demo.noAccountNote}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
