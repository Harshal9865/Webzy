'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { ADDON_CATALOG, type AddonId, getSiteCopy, isValidityAddonId } from '@webzy/core';
import { parseWeddingLanguage, WeddingScroll } from '@webzy/themes';
import { AdaptivePreviewStage } from '../shell/AdaptivePreviewStage';
import { useLanguage } from '../shell/LanguageProvider';
import {
  formatInrComma,
  WEDDING_EDITIONS,
  type WeddingTemplateId,
} from './weddingCatalog';
import { WeddingEditionCard } from './WeddingEditionCard';

type StudioTabId = 'editions' | 'art' | 'links' | 'pricing';

const HERO_STEP_PILLS: Array<{
  step: string;
  label: string;
  targetTab: StudioTabId;
}> = [
  { step: '1', label: '1 · Tap Sealed Cover', targetTab: 'editions' },
  { step: '2', label: '2 · Click 6 Interactive Cards', targetTab: 'art' },
  { step: '3', label: '3 · 9 Indian Languages', targetTab: 'links' },
  { step: '4', label: '4 · ₹499 All-Inclusive', targetTab: 'pricing' },
];

const STUDIO_TABS: Array<{
  id: StudioTabId;
  numeral: string;
  label: string;
  subtag: string;
}> = [
  {
    id: 'editions',
    numeral: '01',
    label: '01 · Six Royal Editions',
    subtag: 'Hindu & Christian',
  },
  {
    id: 'art',
    numeral: '02',
    label: '02 · Interactive Art Plates',
    subtag: 'Cover · Inside · Ceremony',
  },
  {
    id: 'links',
    numeral: '03',
    label: '03 · Family Link Generator',
    subtag: '1-Tap ?to= Greeting',
  },
  {
    id: 'pricing',
    numeral: '04',
    label: '04 · ₹499 Pricing & Add-Ons',
    subtag: 'All-Inclusive Pass',
  },
];

const GUEST_SUGGESTIONS = [
  'Sharma Family',
  'Dr. Mehta & Family',
  'Kapoor Parivar',
  'Pereira Family',
  'Subramanian Family',
] as const;

const FAMILY_LINK_TAGS = [
  'Unlimited Family Links',
  'Custom ?to= Greeting',
  '9 Indian Languages',
  '1-Tap WhatsApp Share',
  'Private · Not on Google',
  'Veg & Jain RSVP',
] as const;

const BASE_INCLUDED_BADGES = [
  '7 Days Live Hosting',
  '6 Click-Through Cards',
  'Unlimited ?to= Family Links',
  'Ceremony & Dress Swatches',
  '1-Tap Google Maps',
  'Veg · Jain · Non-Veg RSVP',
  'Optional UPI Shagun',
  '9 Indian Languages',
  '24h Free Typo Edits',
  'GST Invoice Included',
] as const;

const OPTIONAL_ADDONS: Array<{
  id: AddonId;
  roman: string;
  shortTitle: string;
  shortTag: string;
  badges: string[];
}> = [
  {
    id: 'pin',
    roman: 'I',
    shortTitle: 'Secret PIN · ₹9',
    shortTag: '4-Digit Family Lock',
    badges: ['Private Passcode', 'Photo Protection'],
  },
  {
    id: 'video',
    roman: 'II',
    shortTitle: 'Status Video · ₹19',
    shortTag: '1080p Vertical MP4',
    badges: ['WhatsApp Status', 'Insta Story Ready'],
  },
  {
    id: 'extend_14d',
    roman: 'III',
    shortTitle: '14 Days · +₹9',
    shortTag: '2 Weeks Total Live',
    badges: ['+7 Extra Days', 'Family RSVPs'],
  },
  {
    id: 'extend_21d',
    roman: 'IV',
    shortTitle: '21 Days · +₹14',
    shortTag: '3 Weeks Total Live',
    badges: ['+14 Extra Days', 'Reception Ready'],
  },
  {
    id: 'extend',
    roman: 'V',
    shortTitle: '3 Months · +₹19',
    shortTag: '90 Days Total Live',
    badges: ['Post-Wedding Photos', 'Extended Archive'],
  },
];

const PAPER_GRAIN_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

function GoldOrnamentDivider({ centered = false }: { centered?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 ${centered ? 'justify-center' : 'justify-center lg:justify-start'}`}
      aria-hidden="true"
    >
      <span className="h-px w-10 bg-[#C9A243]/55" />
      <span className="h-1.5 w-1.5 rotate-45 border border-[#C9A243] bg-[#C9A243]/30" />
      <span className="h-px w-10 bg-[#C9A243]/55" />
    </div>
  );
}

export function WeddingsClient() {
  const { language } = useLanguage();
  const site = getSiteCopy(language);
  const w = site.weddings;
  const activeWeddingLang = parseWeddingLanguage(language) ?? 'en';

  const [activeId, setActiveId] = useState<WeddingTemplateId>('wedding-emerald-01');
  const [studioTab, setStudioTab] = useState<StudioTabId>('editions');
  const [traditionFilter, setTraditionFilter] = useState<'all' | 'hindu' | 'christian'>('all');
  const [previewKey, setPreviewKey] = useState(0);
  const [sampleGuestName, setSampleGuestName] = useState('Sharma Family');
  const [copiedGuestLink, setCopiedGuestLink] = useState(false);
  const [artGalleryId, setArtGalleryId] = useState<WeddingTemplateId>('wedding-emerald-01');
  const [activeArtPlate, setActiveArtPlate] = useState<'all' | 'cover' | 'inside' | 'ceremony'>('all');
  const [selectedAddons, setSelectedAddons] = useState<Record<AddonId, boolean>>({
    pin: false,
    video: false,
    extend_14d: false,
    extend_21d: false,
    extend: false,
  });
  const [heroMuralFailed, setHeroMuralFailed] = useState(false);
  const [failedArtUrls, setFailedArtUrls] = useState<Record<string, boolean>>({});

  const filteredEditions = useMemo(
    () =>
      traditionFilter === 'all'
        ? WEDDING_EDITIONS
        : WEDDING_EDITIONS.filter((ed) => ed.tradition === traditionFilter),
    [traditionFilter],
  );

  function markArtFailed(url: string) {
    setFailedArtUrls((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
  }

  const activeEdition =
    WEDDING_EDITIONS.find((e) => e.id === activeId) ?? WEDDING_EDITIONS[0];
  const galleryEdition =
    WEDDING_EDITIONS.find((e) => e.id === artGalleryId) ?? WEDDING_EDITIONS[0];

  const localizedStageData = useMemo(
    () => ({
      ...activeEdition.defaultData,
      language: activeWeddingLang,
    }),
    [activeEdition.defaultData, activeWeddingLang],
  );

  const baseEdition = WEDDING_EDITIONS[0];
  const baseSavings = baseEdition.compareAtInr - baseEdition.priceInr;

  const addonsTotalInr = useMemo(() => {
    let sum = 0;
    (Object.keys(selectedAddons) as AddonId[]).forEach((id) => {
      if (selectedAddons[id]) {
        sum += ADDON_CATALOG[id].priceInr;
      }
    });
    return sum;
  }, [selectedAddons]);

  const cleanGuest = sampleGuestName.trim() || 'Sharma Family';
  const personalizedPath = `/i/${activeEdition.demoSlug}?lang=${activeWeddingLang}&to=${encodeURIComponent(cleanGuest)}`;

  function handleSelectStage(id: WeddingTemplateId) {
    setActiveId(id);
    setArtGalleryId(id);
    setPreviewKey((k) => k + 1);
  }

  function handleCopyGuestLink() {
    if (typeof window === 'undefined') return;
    const fullUrl = `${window.location.origin}${personalizedPath}`;
    void navigator.clipboard.writeText(fullUrl);
    setCopiedGuestLink(true);
    setTimeout(() => setCopiedGuestLink(false), 2000);
  }

  function toggleAddon(id: AddonId) {
    setSelectedAddons((prev) => {
      if (isValidityAddonId(id)) {
        const nextVal = !prev[id];
        return {
          ...prev,
          extend_14d: id === 'extend_14d' ? nextVal : false,
          extend_21d: id === 'extend_21d' ? nextVal : false,
          extend: id === 'extend' ? nextVal : false,
        };
      }
      return { ...prev, [id]: !prev[id] };
    });
  }

  return (
    <div className="relative overflow-x-clip bg-[#F7F3EC] text-[#1F1419]">
      {/* Subtle Hand-Pressed Paper Grain Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.032] mix-blend-multiply"
        aria-hidden="true"
        style={{ backgroundImage: PAPER_GRAIN_SVG }}
      />

      {/* SECTION 1: CLICK-FIRST HERO + LIVE INTERACTIVE EXHIBITION STAGE */}
      <section className="relative overflow-hidden border-b border-[#C9A243]/25">
        {/* Hand-Painted Udaipur Lake Palace Atmospheric Backdrop */}
        {!heroMuralFailed ? (
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/templates/weddings/art/atelier-palace-hero.jpg"
              alt=""
              onError={() => setHeroMuralFailed(true)}
              className="h-full w-full object-cover object-center opacity-[0.24]"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(247,243,236,0.9) 0%, rgba(247,243,236,0.72) 48%, rgba(247,243,236,0.55) 100%), linear-gradient(180deg, rgba(247,243,236,0.65) 0%, rgba(247,243,236,0.35) 45%, rgba(247,243,236,0.92) 100%)',
              }}
            />
          </div>
        ) : null}

        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 14% 20%, rgba(201,162,67,0.13), transparent 52%), radial-gradient(ellipse at 86% 24%, rgba(107,15,30,0.06), transparent 50%)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-10">
            {/* Left: Click-First Editorial Masthead (Short Dignified Words, Zero Paragraphs) */}
            <div className="text-center lg:col-span-6 lg:text-left">
              <div className="inline-flex items-center gap-3">
                <span className="h-px w-7 bg-[#C9A243]" aria-hidden="true" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8C6B22]">
                  {w.heroEyebrow}
                </span>
                <span className="h-px w-7 bg-[#C9A243] lg:hidden" aria-hidden="true" />
              </div>

              <h1 className="mt-4 font-royal-serif text-3xl font-medium leading-[1.06] tracking-[-0.02em] text-[#1F1419] sm:mt-5 sm:text-5xl lg:text-[62px]">
                {w.heroTitleLead}{' '}
                <span className="font-normal italic text-[#8C6B22]">
                  {w.heroTitleAccent}
                </span>
              </h1>

              <div className="mt-4 sm:mt-5">
                <GoldOrnamentDivider />
              </div>

              {/* 4 Crisp Interactive Step Pills (Replaces Long Hero Paragraph) */}
              <div
                className="mt-5 flex flex-nowrap items-center justify-start gap-2 overflow-x-auto pb-1 scrollbar-none sm:mt-6 sm:flex-wrap sm:justify-center sm:pb-0 lg:justify-start"
                aria-label="Interactive wedding card flow"
              >
                {HERO_STEP_PILLS.map((pill) => {
                  const isActiveTab = studioTab === pill.targetTab;
                  return (
                    <a
                      key={pill.step}
                      href="#wedding-studio-workspace"
                      onClick={() => setStudioTab(pill.targetTab)}
                      className={`inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 py-2 text-[11px] font-semibold tracking-[0.04em] transition ${
                        isActiveTab
                          ? 'border-[#C9A243] bg-[#1A1317] text-[#F5E0A3] shadow-sm'
                          : 'border-[#C9A243]/45 bg-[#FFFDF9]/90 text-[#3B2A2F] hover:border-[#8C6B22] hover:bg-[#FFFDF9]'
                      }`}
                    >
                      {pill.label}
                    </a>
                  );
                })}
              </div>

              {/* Quick Edition Selector Chips on Left Hero */}
              <div className="mt-5 rounded-2xl border border-[#C9A243]/35 bg-[#FFFDF9]/85 p-3.5 shadow-sm backdrop-blur-sm sm:mt-6">
                <div className="flex items-center justify-between gap-2 pb-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C6B22] sm:tracking-[0.22em]">
                    Tap Edition · Switch Live Stage
                  </span>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5B4942] sm:tracking-[0.16em]">
                    {activeEdition.traditionLabel} · ₹499
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5 lg:justify-start">
                  {WEDDING_EDITIONS.map((ed) => {
                    const selected = ed.id === activeId;
                    return (
                      <button
                        key={ed.id}
                        type="button"
                        onClick={() => handleSelectStage(ed.id)}
                        className={`inline-flex min-h-[40px] sm:min-h-[38px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-[0.04em] transition ${
                          selected
                            ? 'border-[#C9A243] bg-[#1A1317] text-[#F5E0A3] shadow-sm'
                            : 'border-[#C9A243]/35 bg-[#FAF6EE] text-[#3B2A2F] hover:border-[#8C6B22] hover:bg-white'
                        }`}
                      >
                        <span
                          className="h-2 w-2 rounded-full border border-white/60"
                          style={{ backgroundColor: ed.palette.primary }}
                          aria-hidden="true"
                        />
                        <span>{ed.editorialName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href={`/weddings/${activeEdition.id}/customize`}
                  className="btn-spring inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full border border-[#C9A243]/40 bg-[#1A1317] px-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#FAF6EE] shadow-[0_14px_30px_-10px_rgba(26,19,23,0.45)] transition hover:bg-[#2A1E25] sm:w-auto"
                >
                  <span>
                    {w.customizePrefix} {activeEdition.editorialName} · ₹499 →
                  </span>
                </Link>

                <a
                  href="#wedding-studio-workspace"
                  onClick={() => setStudioTab('editions')}
                  className="btn-spring inline-flex min-h-[50px] w-full items-center justify-center rounded-full border border-[#C9A243]/65 bg-[#FFFDF9]/90 px-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#5D4314] transition hover:border-[#8C6B22] hover:bg-[#FFFDF9] hover:text-[#1F1419] sm:w-auto"
                >
                  {w.exploreCollectionCta}
                </a>
              </div>

              {/* Dignified 4-Point Atelier Guarantee Bar */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-[#C9A243]/30 pt-5 text-[11px] font-medium tracking-[0.04em] text-[#5B4942] lg:justify-start">
                {w.guarantees.map((item, idx) => (
                  <React.Fragment key={item}>
                    {idx > 0 ? (
                      <span
                        className="hidden h-1 w-1 rotate-45 bg-[#C9A243] sm:inline-block"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-1 w-1 rotate-45 bg-[#C9A243] sm:hidden"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Right: Illuminated Obsidian Gallery Plinth */}
            <div className="relative w-full lg:col-span-6">
              <div className="relative overflow-hidden rounded-[24px] border border-[#C9A243]/35 bg-[#FFFDF9] p-3.5 shadow-[0_24px_60px_-28px_rgba(31,20,25,0.2)] sm:p-5 lg:rounded-[28px] lg:border-[#C9A243]/40 lg:bg-[#161013] lg:p-7 lg:shadow-[0_38px_84px_-24px_rgba(16,9,13,0.68)]">
                <div
                  className="pointer-events-none absolute inset-3 hidden rounded-[20px] border border-[#C9A243]/20 lg:block"
                  aria-hidden="true"
                />

                <div
                  className="pointer-events-none absolute inset-0 hidden lg:block"
                  aria-hidden="true"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 50% 44%, rgba(212,175,55,0.2) 0%, rgba(122,22,40,0.12) 42%, transparent 72%)',
                  }}
                />

                <div className="relative mb-4 hidden items-center justify-between border-b border-[#C9A243]/20 pb-3 lg:flex">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#E4C77B]/85">
                    Royal Wedding Edition · {activeEdition.editorialName}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#FAF6EE]/65">
                    {activeEdition.specimenCity} · {activeEdition.specimenDate}
                  </span>
                </div>

                <div className="relative w-full">
                  <AdaptivePreviewStage
                    title={activeEdition.editorialName}
                    accentColor={activeEdition.palette.primary}
                    mobileHeightClassName="h-[410px] sm:h-[470px]"
                    onReplay={() => setPreviewKey((k) => k + 1)}
                    externalFullScreenHref={`/i/${activeEdition.demoSlug}`}
                    toolbar={
                      <div
                        role="tablist"
                        aria-label="Choose live wedding edition"
                        className="hidden lg:inline-flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-[#C9A243]/35 bg-[#22191E]/95 p-1 shadow-sm"
                      >
                        {WEDDING_EDITIONS.map((ed) => {
                          const selected = ed.id === activeId;
                          return (
                            <button
                              key={ed.id}
                              type="button"
                              role="tab"
                              aria-selected={selected}
                              onClick={() => handleSelectStage(ed.id)}
                              className={`min-h-[32px] rounded-xl px-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${
                                selected
                                  ? 'bg-[#C9A243] text-[#161013] shadow-sm'
                                  : 'text-[#5A4840] hover:text-[#1F1419] lg:text-[#E5D5B5]/70 lg:hover:text-[#FAF6EE]'
                              }`}
                            >
                              {ed.editorialName}
                            </button>
                          );
                        })}
                      </div>
                    }
                    fullscreenChildren={
                      <WeddingScroll
                        key={`fs-${activeEdition.id}-${activeWeddingLang}-${previewKey}`}
                        data={localizedStageData}
                        guestName={cleanGuest}
                      />
                    }
                  >
                    <WeddingScroll
                      key={`${activeEdition.id}-${activeWeddingLang}-${previewKey}`}
                      data={localizedStageData}
                      guestName={cleanGuest}
                      embedded
                    />
                  </AdaptivePreviewStage>

                  <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B574C] lg:text-[#E4C77B]/85">
                    Tap the Royal Seal to Open & Explore Chapters
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CLICK-FIRST INTERACTIVE ATELIER WORKSPACE (4-TAB STUDIO) */}
      <section
        id="wedding-studio-workspace"
        className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16"
      >
        <div id="wedding-collection" className="sr-only" aria-hidden="true" />

        {/* Adaptive 4-Tab Interactive Click Bar (Desktop/Tablet sticky single strip, non-locking on mobile) */}
        <div className="mb-8 rounded-[20px] border border-[#C9A243]/45 bg-[#FFFDF9]/95 p-1.5 shadow-[0_14px_34px_-18px_rgba(26,16,20,0.18)] backdrop-blur-md md:sticky md:top-[70px] md:z-20 sm:mb-10 sm:rounded-[22px] sm:p-2">
          <div
            role="tablist"
            aria-label="Wedding Interactive Studio Tabs"
            className="flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-none lg:grid lg:grid-cols-4"
          >
            {STUDIO_TABS.map((tab) => {
              const active = studioTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStudioTab(tab.id)}
                  className={`flex min-h-[44px] shrink-0 flex-col items-center justify-center rounded-xl px-3.5 py-2.5 text-center transition sm:rounded-2xl sm:px-4 sm:py-3 ${
                    active
                      ? 'bg-[#1A1317] text-[#F5E0A3] shadow-sm'
                      : 'bg-[#FAF6EE]/75 text-[#3B2A2F] hover:bg-[#FAF6EE] hover:text-[#1F1419]'
                  }`}
                >
                  <span className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.11em] sm:tracking-[0.12em]">
                    {tab.label}
                  </span>
                  <span
                    className={`mt-0.5 hidden whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.14em] sm:block ${
                      active ? 'text-[#E4C77B]/85' : 'text-[#8C6B22]'
                    }`}
                  >
                    {tab.subtag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 01: SIX ROYAL EDITIONS */}
        {studioTab === 'editions' && (
          <div>
            <div className="flex flex-col items-start justify-between gap-4 border-b border-[#C9A243]/25 pb-6 sm:flex-row sm:items-center">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8C6B22]">
                  01 · Click-Through Collection
                </span>
                <h2 className="mt-1 font-royal-serif text-2xl font-medium text-[#1F1419] sm:text-3xl lg:text-4xl">
                  Six Royal Editions · ₹499 Each
                </h2>
              </div>

              {/* Tradition Filter Pills */}
              <div
                role="tablist"
                aria-label="Filter wedding editions by tradition"
                className="flex max-w-full flex-wrap items-center gap-1.5 rounded-2xl border border-[#C9A243]/45 bg-[#FFFDF9] p-1.5 shadow-sm sm:rounded-full"
              >
                {(
                  [
                    { id: 'all', label: `All (${WEDDING_EDITIONS.length})` },
                    {
                      id: 'hindu',
                      label: `Hindu Vivah (${WEDDING_EDITIONS.filter((e) => e.tradition === 'hindu').length})`,
                    },
                    {
                      id: 'christian',
                      label: `Christian Wedding (${WEDDING_EDITIONS.filter((e) => e.tradition === 'christian').length})`,
                    },
                  ] as const
                ).map((tab) => {
                  const active = traditionFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setTraditionFilter(tab.id)}
                      className={`min-h-[44px] rounded-full px-3.5 text-xs font-bold uppercase tracking-[0.1em] transition sm:px-4 sm:tracking-[0.12em] ${
                        active
                          ? 'bg-[#1A1317] text-[#F5E0A3] shadow-sm'
                          : 'text-[#5A4840] hover:bg-[#FAF6EE] hover:text-[#1F1419]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
              {filteredEditions.map((edition) => (
                <WeddingEditionCard key={edition.id} edition={edition} />
              ))}
            </div>
          </div>
        )}

        {/* TAB 02: INTERACTIVE ART PLATES */}
        {studioTab === 'art' && (
          <div className="overflow-hidden rounded-[26px] border border-[#C9A243]/40 bg-[#161013] p-6 text-[#FAF6EE] shadow-[0_28px_68px_-24px_rgba(16,9,13,0.65)] sm:p-8">
            <div className="flex flex-col items-center justify-between gap-4 border-b border-[#C9A243]/25 pb-6 lg:flex-row">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E4C77B]">
                  02 · Hand-Painted Plates · Zero Paragraphs
                </span>
                <h2 className="mt-1 font-royal-serif text-3xl font-medium text-[#FAF6EE] sm:text-4xl">
                  {galleryEdition.editorialName} · {galleryEdition.moodLabel}
                </h2>
              </div>

              {/* Edition Switcher Pills */}
              <div
                role="tablist"
                aria-label="Inspect edition artwork"
                className="inline-flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-[#C9A243]/40 bg-[#22191E] p-1"
              >
                {WEDDING_EDITIONS.map((ed) => {
                  const selected = ed.id === artGalleryId;
                  return (
                    <button
                      key={ed.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setArtGalleryId(ed.id)}
                      className={`min-h-[34px] rounded-xl px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] transition ${
                        selected
                          ? 'bg-[#D4AF37] text-[#161013]'
                          : 'text-[#E5D5B5]/75 hover:text-[#FAF6EE]'
                      }`}
                    >
                      {ed.editorialName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-bar: Plate Filter Buttons + 2-Word Pigment Swatches */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'all', label: 'All 3 Plates' },
                    { id: 'cover', label: 'I · Cover' },
                    { id: 'inside', label: 'II · Inside' },
                    { id: 'ceremony', label: 'III · Ceremony' },
                  ] as const
                ).map((plate) => {
                  const active = activeArtPlate === plate.id;
                  return (
                    <button
                      key={plate.id}
                      type="button"
                      onClick={() => setActiveArtPlate(plate.id)}
                      className={`rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                        active
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-[#161013]'
                          : 'border-[#C9A243]/35 bg-[#22191E] text-[#E5D5B5] hover:border-[#D4AF37]'
                      }`}
                    >
                      {plate.label}
                    </button>
                  );
                })}
              </div>

              {/* 2-Word Pigment Swatches */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: 'Royal Base', hex: galleryEdition.palette.primary },
                  { label: 'Silk Surface', hex: galleryEdition.palette.surface },
                  { label: 'Zari Gold', hex: galleryEdition.palette.accent },
                  { label: 'Deep Ink', hex: galleryEdition.palette.ink },
                ].map((swatch) => (
                  <span
                    key={swatch.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A243]/30 bg-[#22191E] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#FAF6EE]"
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-white/40"
                      style={{ backgroundColor: swatch.hex }}
                      aria-hidden="true"
                    />
                    <span>{swatch.label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 3 Hand-Painted Art Plates Grid */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-5">
              {(activeArtPlate === 'all' || activeArtPlate === 'cover') && (
                <figure
                  className={`overflow-hidden rounded-[20px] border border-[#C9A243]/35 bg-[#1E161B] ${
                    activeArtPlate === 'cover' ? 'sm:col-span-3' : ''
                  }`}
                >
                  <div
                    className="relative h-[240px] w-full overflow-hidden sm:h-[260px] lg:h-[340px]"
                    style={{ backgroundColor: galleryEdition.palette.ink }}
                  >
                    {!failedArtUrls[galleryEdition.coverArtUrl] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={galleryEdition.coverArtUrl}
                        alt={`${galleryEdition.editorialName} I Cover`}
                        onError={() => markArtFailed(galleryEdition.coverArtUrl)}
                        className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
                      />
                    ) : null}
                    <span className="absolute bottom-3 left-3 rounded-full border border-[#E4C77B]/35 bg-[#161013]/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F2DFAD]">
                      I · Cover · {galleryEdition.coverSealLabel}
                    </span>
                  </div>
                </figure>
              )}

              {(activeArtPlate === 'all' || activeArtPlate === 'inside') && (
                <figure
                  className={`overflow-hidden rounded-[20px] border border-[#C9A243]/35 bg-[#1E161B] ${
                    activeArtPlate === 'inside' ? 'sm:col-span-3' : ''
                  }`}
                >
                  <div
                    className="relative h-[240px] w-full overflow-hidden sm:h-[260px] lg:h-[340px]"
                    style={{ backgroundColor: galleryEdition.palette.primary }}
                  >
                    {!failedArtUrls[galleryEdition.sceneArtUrl] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={galleryEdition.sceneArtUrl}
                        alt={`${galleryEdition.editorialName} II Inside`}
                        onError={() => markArtFailed(galleryEdition.sceneArtUrl)}
                        className="h-full w-full object-cover object-bottom transition-transform duration-700 hover:scale-[1.03]"
                      />
                    ) : null}
                    <span className="absolute bottom-3 left-3 rounded-full border border-[#E4C77B]/35 bg-[#161013]/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F2DFAD]">
                      II · Inside · {galleryEdition.specimenCity}
                    </span>
                  </div>
                </figure>
              )}

              {(activeArtPlate === 'all' || activeArtPlate === 'ceremony') && (
                <figure
                  className={`overflow-hidden rounded-[20px] border border-[#C9A243]/35 bg-[#1E161B] ${
                    activeArtPlate === 'ceremony' ? 'sm:col-span-3' : ''
                  }`}
                >
                  <div
                    className="relative h-[240px] w-full overflow-hidden sm:h-[260px] lg:h-[340px]"
                    style={{ backgroundColor: galleryEdition.palette.ink }}
                  >
                    {!failedArtUrls[galleryEdition.ceremonyArtUrl] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={galleryEdition.ceremonyArtUrl}
                        alt={`${galleryEdition.editorialName} III Ceremony`}
                        onError={() => markArtFailed(galleryEdition.ceremonyArtUrl)}
                        className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
                      />
                    ) : null}
                    <span className="absolute bottom-3 left-3 rounded-full border border-[#E4C77B]/35 bg-[#161013]/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F2DFAD]">
                      III · Ceremony · {galleryEdition.ceremonyArtCaption}
                    </span>
                  </div>
                </figure>
              )}
            </div>

            {/* 6 Click-Deck Chapters Summary Chips + Action CTA */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#C9A243]/25 pt-5">
              <div className="flex flex-wrap items-center gap-1.5">
                {galleryEdition.includedSections.map((sec) => (
                  <span
                    key={sec.title}
                    className="rounded-full border border-[#C9A243]/30 bg-[#22191E] px-3 py-1 text-[10.5px] font-semibold tracking-[0.03em] text-[#E5D5B5]"
                  >
                    {sec.title} · {sec.detail}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href={`/weddings/${galleryEdition.id}`}
                  className="btn-spring inline-flex min-h-[42px] items-center rounded-full border border-[#C9A243]/50 bg-transparent px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#FAF6EE] hover:bg-white/10"
                >
                  Interactive Demo
                </Link>
                <Link
                  href={`/weddings/${galleryEdition.id}/customize`}
                  className="btn-spring inline-flex min-h-[42px] items-center rounded-full bg-[#D4AF37] px-6 text-xs font-bold uppercase tracking-[0.16em] text-[#161013]"
                >
                  Customize {galleryEdition.editorialName} · ₹499 →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* TAB 03: FAMILY LINK GENERATOR */}
        {studioTab === 'links' && (
          <div className="overflow-hidden rounded-[24px] border border-[#C9A243]/40 bg-[#FFFDF9] p-2.5 shadow-[0_26px_64px_-30px_rgba(31,20,25,0.2)] sm:p-3">
            <div className="rounded-[18px] border border-[#C9A243]/22 bg-[#FFFDF9] px-6 py-8 sm:px-10 sm:py-10">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                {/* Left: 1-Click Family Preset Selector + Short Tag Pills */}
                <div className="lg:col-span-6">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8C6B22]">
                    03 · Personalized ?to= Family Links
                  </span>

                  <h2 className="mt-2 font-royal-serif text-3xl font-medium leading-[1.08] tracking-[-0.01em] text-[#1F1419] sm:text-4xl">
                    1-Click Family Name Tester
                  </h2>

                  {/* Short 2-3 Word Bullet Tag Pills (Replaces Long Paragraphs) */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {FAMILY_LINK_TAGS.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#C9A243]/35 bg-[#FAF6EE] px-3 py-1 text-[10.5px] font-semibold tracking-[0.03em] text-[#3B2A2F]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Quick Family Presets */}
                  <div className="mt-6">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A786B]">
                      Tap a Family Name:
                    </span>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {GUEST_SUGGESTIONS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setSampleGuestName(preset)}
                          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                            sampleGuestName === preset
                              ? 'border-[#C9A243] bg-[#1A1317] text-[#F5E0A3]'
                              : 'border-[#C9A243]/35 bg-[#FAF6EE] text-[#3B2A2F] hover:border-[#8C6B22]'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={sampleGuestName}
                      onChange={(e) => setSampleGuestName(e.target.value)}
                      maxLength={50}
                      placeholder="Type family name..."
                      aria-label="Family greeting name"
                      className="min-h-[46px] flex-1 rounded-full border border-[#C9A243]/45 bg-[#FAF6EE]/65 px-5 text-sm font-medium text-[#1F1419] placeholder:text-[#8A786B] outline-none transition focus:border-[#8C6B22] focus:bg-[#FFFDF9]"
                    />
                    <Link
                      href={personalizedPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-spring inline-flex min-h-[46px] items-center justify-center whitespace-nowrap rounded-full border border-[#C9A243]/40 bg-[#1A1317] px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FAF6EE] shadow-sm transition hover:bg-[#2B1F26]"
                    >
                      Open Live Card →
                    </Link>
                  </div>
                </div>

                {/* Right: Live Specimen Calligraphy Preview Plaque */}
                <div className="lg:col-span-6">
                  <div className="rounded-[18px] border border-[#C9A243]/45 bg-gradient-to-b from-[#FCF9F2] to-[#F3ECDF] p-6 shadow-sm sm:p-7">
                    <div className="text-center">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8C6B22]">
                        {activeEdition.editorialName} · {activeEdition.specimenCouple}
                      </span>

                      <div className="mt-4">
                        <span className="font-royal-serif text-xs uppercase tracking-[0.24em] text-[#7A6656]">
                          Dear
                        </span>
                        <p className="mt-1 break-words font-royal-script text-4xl font-normal leading-[1.15] text-[#6B0F1E] sm:text-[44px]">
                          {cleanGuest}
                        </p>
                      </div>

                      <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-1.5">
                        <span className="rounded-full border border-[#C9A243]/40 bg-[#FFFDF9] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5D4314]">
                          With Elder Blessings
                        </span>
                        <span className="rounded-full border border-[#C9A243]/40 bg-[#FFFDF9] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5D4314]">
                          Shubh Vivah Nimantran
                        </span>
                      </div>
                    </div>

                    <div className="my-5">
                      <GoldOrnamentDivider centered />
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C6B22]">
                        <span>WhatsApp Family Link</span>
                        <span>Unlimited Families</span>
                      </div>

                      <div className="flex flex-col gap-2.5 rounded-xl border border-[#C9A243]/30 bg-[#FFFDF9]/90 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="break-all font-mono text-[11px] text-[#3E2F34]">
                          webzy.in{personalizedPath}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyGuestLink}
                          className="btn-spring shrink-0 rounded-full border border-[#C9A243]/55 bg-[#FFFDF9] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5D4314] transition hover:border-[#8C6B22] hover:bg-[#FAF3E2]"
                        >
                          {copiedGuestLink ? 'Copied' : 'Copy Link'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 04: ₹499 PRICING & ADD-ONS */}
        {studioTab === 'pricing' && (
          <div id="wedding-pricing" className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
            {/* Left: Obsidian Luxury Pricing Folio with Short 2-to-4 Word Badges */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#C9A243]/45 bg-[#1A1317] p-2.5 text-[#FAF6EE] shadow-[0_30px_72px_-24px_rgba(20,12,16,0.58)] sm:p-3 lg:col-span-7">
              <div className="relative flex h-full flex-col justify-between rounded-[18px] border border-[#C9A243]/25 px-6 py-7 sm:px-8 sm:py-9">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#E4C77B]">
                      04 · Complete Click-Card Pass
                    </span>
                    <span className="rounded-full border border-[#72C8A2]/30 bg-[#154532] px-3 py-1 text-[10px] font-semibold tracking-[0.08em] text-[#EAF9F1]">
                      Save {formatInrComma(baseSavings)}
                    </span>
                  </div>

                  <h3 className="mt-3 font-royal-serif text-3xl font-medium tracking-[-0.01em] text-[#FAF6EE] sm:text-4xl">
                    {activeEdition.editorialName} · All-Inclusive
                  </h3>

                  <div className="mt-5 flex flex-wrap items-baseline gap-3 border-y border-[#C9A243]/25 py-4 font-tabular">
                    <span className="font-royal-serif text-5xl font-semibold leading-none text-[#E4C77B]">
                      {formatInrComma(baseEdition.priceInr + addonsTotalInr)}
                    </span>
                    <span className="text-lg font-normal text-[#FAF6EE]/35 line-through">
                      {formatInrComma(baseEdition.compareAtInr)}
                    </span>
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E4D6C4]/75">
                      GST Inclusive · One-Time
                    </span>
                  </div>

                  {/* Crisp 2-to-4 Word Feature Badges */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {BASE_INCLUDED_BADGES.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A243]/35 bg-[#241A20] px-3 py-1.5 text-xs font-semibold text-[#FAF6EE]"
                      >
                        <span className="h-1.5 w-1.5 rotate-45 bg-[#E4C77B]" aria-hidden="true" />
                        <span>{badge}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-7 pt-2">
                  <Link
                    href={`/weddings/${activeEdition.id}/customize`}
                    className="btn-spring inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-[#D4AF37] px-7 text-xs font-bold uppercase tracking-[0.18em] text-[#1A1317] shadow-md transition hover:bg-[#E2C258]"
                  >
                    Customize Selected Edition ({activeEdition.editorialName}) →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: 3 Interactive Add-On Cards (Short 4-Word Tags) */}
            <div className="flex flex-col justify-between rounded-[24px] border border-[#C9A243]/35 bg-[#FFFDF9] p-6 shadow-[0_20px_50px_-28px_rgba(31,20,25,0.16)] sm:p-7 lg:col-span-5">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8C6B22]">
                  Tap to Preview Total
                </span>
                <h3 className="mt-1 font-royal-serif text-2xl font-medium text-[#1F1419] sm:text-3xl">
                  Optional Checkout Add-Ons
                </h3>

                <div className="mt-5 space-y-3">
                  {OPTIONAL_ADDONS.map((addon) => {
                    const catalog = ADDON_CATALOG[addon.id];
                    const isSelected = selectedAddons[addon.id];
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? 'border-[#C9A243] bg-[#FAF3E2] shadow-sm'
                            : 'border-[#C9A243]/30 bg-[#FAF6EE]/60 hover:border-[#C9A243]/70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-royal-serif text-sm italic text-[#8C6B22]">
                                {addon.roman}.
                              </span>
                              <span className="font-royal-serif text-lg font-semibold text-[#1F1419]">
                                {addon.shortTitle}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#6B574C]">
                              {addon.shortTag}
                            </p>
                          </div>

                          <div className="shrink-0 text-right font-tabular">
                            <span className="block text-[11px] text-[#1F1419]/40 line-through">
                              {formatInrComma(catalog.compareAtInr)}
                            </span>
                            <span className="inline-flex rounded-full border border-[#C9A243]/50 bg-[#FFFDF9] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#164A36]">
                              {isSelected ? 'Added' : `+₹${catalog.priceInr}`}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {addon.badges.map((b) => (
                            <span
                              key={b}
                              className="rounded-full border border-[#C9A243]/30 bg-[#FFFDF9] px-2.5 py-0.5 text-[10px] font-semibold text-[#3B2A2F]"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#C9A243]/25 bg-[#FAF6EE] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3B2A2F]">
                <span>One-Time UPI Payment</span>
                <span>Zero Per-Guest Fees</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
