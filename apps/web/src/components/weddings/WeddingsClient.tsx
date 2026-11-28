'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ADDON_CATALOG,
  type AddonId,
  getSiteCopy,
  isValidityAddonId,
} from '@webzy/core';
import { parseWeddingLanguage, WeddingScroll } from '@webzy/themes';
import { AdaptivePreviewStage } from '../shell/AdaptivePreviewStage';
import { useLanguage } from '../shell/LanguageProvider';
import {
  formatInrComma,
  WEDDING_EDITIONS,
  type WeddingTemplateId,
} from './weddingCatalog';
import { WeddingEditionCard } from './WeddingEditionCard';

type WeddingOptionalAddonId = 'pin' | 'video' | 'extend_14d' | 'extend_21d' | 'lifetime';
const PREFERRED_ADDONS_KEY = 'webzy_preferred_addons';

export interface WeddingCapacityView {
  paused?: boolean;
  limit: number;
  activeCount: number;
  remainingSlots: number;
  acceptingOrders: boolean;
  capacityMessage?: string | null;
}

export interface WeddingsClientProps {
  weddingCapacity?: WeddingCapacityView;
  capacityMessage?: string | null;
  supportWhatsapp?: string;
  supportEmail?: string;
}

const DEFAULT_WEDDING_CAPACITY: WeddingCapacityView = {
  paused: false,
  limit: 3,
  activeCount: 0,
  remainingSlots: 3,
  acceptingOrders: true,
  capacityMessage: null,
};

const CUSTOM_BUDGET_TIERS = [
  { value: '1999', label: '₹1,999', tag: 'Launch Minimal', detail: 'Single-scroll custom design' },
  { value: '3499', label: '₹3,499', tag: 'Multi-Ceremony', detail: 'Events, gallery, maps & RSVP' },
  { value: '5999', label: '₹5,999', tag: 'Bespoke Suite', detail: 'Custom art + domain at actuals' },
] as const;

const BESPOKE_STEPS = [
  {
    step: '01',
    title: 'Share Your Story & Aesthetic',
    detail: 'Note your ceremonies, colours, traditions, and inspiration in a short brief.',
  },
  {
    step: '02',
    title: '15-Min Google Meet via Email or WhatsApp',
    detail: 'Confirm layout, timelines, and optional custom domain directly with the designer.',
  },
  {
    step: '03',
    title: 'Personal Craft & Launch',
    detail: 'Built hand-in-hand with preview iterations before your family links go live.',
  },
] as const;

const GUEST_SUGGESTIONS = [
  'Sharma Family',
  'Dr. Mehta & Family',
  'Kapoor Parivar',
  'Pereira Family',
  'Subramanian Family',
] as const;

const OPTIONAL_ADDONS: Array<{
  id: WeddingOptionalAddonId;
  shortTitle: string;
  shortTag: string;
  fallbackPriceInr: number;
  fallbackCompareAtInr: number;
}> = [
  {
    id: 'pin',
    shortTitle: 'Secret PIN',
    shortTag: '4-digit lock',
    fallbackPriceInr: 9,
    fallbackCompareAtInr: 19,
  },
  {
    id: 'video',
    shortTitle: 'Status Video',
    shortTag: '1080p MP4',
    fallbackPriceInr: 19,
    fallbackCompareAtInr: 49,
  },
  {
    id: 'extend_14d',
    shortTitle: '14 Days Total',
    shortTag: '2 weeks live',
    fallbackPriceInr: 9,
    fallbackCompareAtInr: 19,
  },
  {
    id: 'extend_21d',
    shortTitle: '21 Days Total',
    shortTag: '3 weeks live',
    fallbackPriceInr: 14,
    fallbackCompareAtInr: 29,
  },
  {
    id: 'lifetime',
    shortTitle: 'Lifetime Hosting',
    shortTag: 'Ready-Made only',
    fallbackPriceInr: 500,
    fallbackCompareAtInr: 999,
  },
];

function GoldOrnamentDivider({ tone = 'text-[#8C6B22]' }: { tone?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${tone}`} aria-hidden="true">
      <span className="h-px w-10 bg-current opacity-40 sm:w-16" />
      <svg className="h-4 w-12 shrink-0" viewBox="0 0 64 20" fill="none">
        <path d="M4 10 C12 4, 20 4, 24 10 C20 16, 12 16, 4 10 Z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M60 10 C52 4, 44 4, 40 10 C44 16, 52 16, 60 10 Z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M32 3 L37 10 L32 17 L27 10 Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="32" cy="10" r="1.5" fill="currentColor" />
      </svg>
      <span className="h-px w-10 bg-current opacity-40 sm:w-16" />
    </div>
  );
}

function JharokhaArchSvg() {
  return (
    <svg className="h-8 w-8 text-[#E4C77B] sm:h-10 sm:w-10" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="36" height="36" rx="10" fill="#2A1F24" stroke="#C9A243" strokeOpacity="0.45" strokeWidth="1.2" />
      <path d="M13 33 V20 C13 15.5 17.5 13.5 22 10.5 C26.5 13.5 31 15.5 31 20 V33 Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 33 V22 C17 19 19.5 17.5 22 15.5 C24.5 17.5 27 19 27 22 V33" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.2" />
      <circle cx="22" cy="24" r="1.8" fill="currentColor" />
    </svg>
  );
}

function LotusSealSvg() {
  return (
    <svg className="h-8 w-8 text-[#E4C77B] sm:h-10 sm:w-10" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="36" height="36" rx="10" fill="#2A1F24" stroke="#C9A243" strokeOpacity="0.45" strokeWidth="1.2" />
      <circle cx="22" cy="22" r="10.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M22 14 C24.5 18 24.5 22 22 27 C19.5 22 19.5 18 22 14 Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M15 21 C18 20.5 20.5 22.5 22 27 C18.5 26 16 24 15 21 Z" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.2" />
      <path d="M29 21 C26 20.5 23.5 22.5 22 27 C25.5 26 28 24 29 21 Z" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.2" />
    </svg>
  );
}

function LanguageScrollSvg() {
  return (
    <svg className="h-8 w-8 text-[#E4C77B] sm:h-10 sm:w-10" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="36" height="36" rx="10" fill="#2A1F24" stroke="#C9A243" strokeOpacity="0.45" strokeWidth="1.2" />
      <rect x="13" y="12" width="18" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M17 18 H27 M17 22.5 H25 M17 27 H23" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function JourneyStepSvg({ step }: { step: number }) {
  return (
    <svg className="h-7 w-7 text-[#7A5915]" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="32" height="32" rx="9" fill="#FAF3E2" stroke="#C9A243" strokeOpacity="0.45" strokeWidth="1.1" />
      {step === 0 ? (
        <path d="M11 24 V14 C11 11.8 14.5 10.5 18 8.5 C21.5 10.5 25 11.8 25 14 V24 Z" stroke="currentColor" strokeWidth="1.5" />
      ) : step === 1 ? (
        <path d="M12 24 L15 23.5 L24 14.5 L21.5 12 L12.5 21 Z M19.5 14 L22 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : step === 2 ? (
        <path d="M14.5 21.5 L21.5 14.5 M13 16 L16 13 C17.5 11.5 20 11.5 21.5 13 M23 20 L20 23 C18.5 24.5 16 24.5 14.5 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <path d="M11 18.5 L15.5 23 L25 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function CheckMark({ className = 'h-3.5 w-3.5 text-emerald-700' }: { className?: string }) {
  return (
    <svg className={`shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CollagePlate({
  src,
  alt,
  caption,
  fallback,
  className,
}: {
  src: string;
  alt: string;
  caption: string;
  fallback: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`rounded-xl bg-[#FFFDF9] p-1.5 shadow-[0_22px_44px_-18px_rgba(26,16,20,0.38)] ring-1 ring-[#C9A243]/30 sm:p-2 ${className}`}>
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg" style={{ background: fallback }}>
        {!failed ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover object-center"
          />
        ) : null}
      </div>
      <p className="px-1 pb-0.5 pt-1 text-center font-handwritten text-sm text-[#4A3520] sm:text-base">
        {caption}
      </p>
    </div>
  );
}

export function WeddingsClient({
  weddingCapacity = DEFAULT_WEDDING_CAPACITY,
  capacityMessage = null,
  supportWhatsapp = '+919800000000',
  supportEmail = 'support@webzy.in',
}: WeddingsClientProps) {
  const { language } = useLanguage();
  const site = getSiteCopy(language);
  const w = site.weddings;
  const activeWeddingLang = parseWeddingLanguage(language) ?? 'en';

  const [activeId, setActiveId] = useState<WeddingTemplateId>('wedding-emerald-01');
  const [traditionFilter, setTraditionFilter] = useState<'all' | 'hindu' | 'christian'>('all');
  const [previewKey, setPreviewKey] = useState(0);
  const [sampleGuestName, setSampleGuestName] = useState('Sharma Family');
  const [copiedGuestLink, setCopiedGuestLink] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<Record<WeddingOptionalAddonId, boolean>>({
    pin: false,
    video: false,
    extend_14d: false,
    extend_21d: false,
    lifetime: false,
  });
  const [failedArtUrls, setFailedArtUrls] = useState<Record<string, boolean>>({});

  // Custom bespoke wedding inquiry form state
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqTargetDate, setReqTargetDate] = useState('');
  const [reqBudgetTier, setReqBudgetTier] = useState<string>('1999');
  const [reqBrief, setReqBrief] = useState('');
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [reqSubmittedId, setReqSubmittedId] = useState('');
  const [reqErrorMsg, setReqErrorMsg] = useState('');
  const [capacityFullOverride, setCapacityFullOverride] = useState(false);

  // Persist chosen add-ons for checkout continuity
  useEffect(() => {
    const activeIds: AddonId[] = (Object.keys(selectedAddons) as WeddingOptionalAddonId[]).filter(
      (k) => selectedAddons[k],
    );
    try {
      if (activeIds.length > 0) {
        window.localStorage.setItem(PREFERRED_ADDONS_KEY, JSON.stringify(activeIds));
      }
    } catch {
      // Ignore storage write errors
    }
  }, [selectedAddons]);

  const filteredEditions = useMemo(
    () =>
      traditionFilter === 'all'
        ? WEDDING_EDITIONS
        : WEDDING_EDITIONS.filter((ed) => ed.tradition === traditionFilter),
    [traditionFilter],
  );

  const activeEdition =
    WEDDING_EDITIONS.find((e) => e.id === activeId) ?? WEDDING_EDITIONS[0];

  const localizedStageData = useMemo(
    () => ({
      ...activeEdition.defaultData,
      language: activeWeddingLang,
    }),
    [activeEdition.defaultData, activeWeddingLang],
  );

  const minEditionPrice = useMemo(
    () => Math.min(...WEDDING_EDITIONS.map((e) => e.priceInr)),
    [],
  );
  const baseEdition = WEDDING_EDITIONS[0];
  const basePriceLabel = formatInrComma(minEditionPrice);
  const addonCatalogLookup = ADDON_CATALOG as Record<
    string,
    { priceInr: number; compareAtInr: number } | undefined
  >;
  const lifetimeAddonPrice = addonCatalogLookup.lifetime?.priceInr ?? 500;

  const addonsTotalInr = useMemo(() => {
    let sum = 0;
    OPTIONAL_ADDONS.forEach((addon) => {
      if (selectedAddons[addon.id]) {
        sum += addonCatalogLookup[addon.id]?.priceInr ?? addon.fallbackPriceInr;
      }
    });
    return sum;
  }, [selectedAddons, addonCatalogLookup]);

  const effectiveAcceptingOrders = weddingCapacity.acceptingOrders && !capacityFullOverride;
  const resolvedCapacityMessage = capacityMessage ?? weddingCapacity.capacityMessage ?? null;
  const waDigits = supportWhatsapp.replace(/\D/g, '') || '919800000000';
  const priorityWaitlistWaHref = `https://wa.me/${waDigits}?text=${encodeURIComponent(
    'Hello Webzy! Please add me to the priority list for the next custom wedding website batch.',
  )}`;
  const meetScheduleWaHref = `https://wa.me/${waDigits}?text=${encodeURIComponent(
    `Hello Webzy! I submitted custom wedding brief${reqSubmittedId ? ` (#${reqSubmittedId.slice(0, 8)})` : ''} for ${reqName || 'our wedding'}. Let us schedule our 15-minute Google Meet.`,
  )}`;

  const cleanGuest = sampleGuestName.trim() || 'Sharma Family';
  const personalizedPath = `/i/${activeEdition.demoSlug}?lang=${activeWeddingLang}&to=${encodeURIComponent(cleanGuest)}`;

  function markArtFailed(url: string) {
    setFailedArtUrls((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
  }

  function handleSelectStage(id: WeddingTemplateId) {
    setActiveId(id);
    setPreviewKey((k) => k + 1);
  }

  function handleCopyGuestLink() {
    if (typeof window === 'undefined') return;
    const fullUrl = `${window.location.origin}${personalizedPath}`;
    void navigator.clipboard.writeText(fullUrl);
    setCopiedGuestLink(true);
    setTimeout(() => setCopiedGuestLink(false), 2000);
  }

  function toggleAddon(id: WeddingOptionalAddonId) {
    setSelectedAddons((prev) => {
      if (isValidityAddonId(id)) {
        const nextVal = !prev[id];
        return {
          ...prev,
          extend_14d: id === 'extend_14d' ? nextVal : false,
          extend_21d: id === 'extend_21d' ? nextVal : false,
          lifetime: id === 'lifetime' ? nextVal : false,
        };
      }
      return { ...prev, [id]: !prev[id] };
    });
  }

  async function handleCustomWeddingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setReqSubmitting(true);
    setReqErrorMsg('');

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterName: reqName,
          requesterEmail: reqEmail,
          requesterPhone: reqPhone,
          name: reqName,
          email: reqEmail,
          phone: reqPhone,
          occasion: 'wedding',
          budgetTier: reqBudgetTier,
          targetDate: reqTargetDate || undefined,
          brief: reqBrief,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        requestId?: string;
        code?: string;
        error?: string;
      };

      if (res.status === 429 && data.code === 'CAPACITY_FULL') {
        setCapacityFullOverride(true);
        return;
      }

      if (!res.ok || !data.requestId) {
        throw new Error(data.error || 'Could not submit your custom wedding inquiry.');
      }

      setReqSubmittedId(data.requestId);
    } catch (err) {
      setReqErrorMsg(err instanceof Error ? err.message : 'Unable to submit request right now.');
    } finally {
      setReqSubmitting(false);
    }
  }

  const journeySteps = [
    { num: '01', title: 'Choose Edition', detail: 'Pick from 6 Hindu & Christian heirloom styles.' },
    { num: '02', title: 'Personalise', detail: 'Add couple names, ceremonies, photos & maps.' },
    { num: '03', title: 'Share ?to= Links', detail: 'Send each family a link addressed by name.' },
    { num: '04', title: 'Collect RSVPs', detail: 'Track meal preferences and blessings live.' },
  ];

  const comparisonRows: Array<{ label: string; ready: string; bespoke: string }> = [
    { label: 'Starting price', ready: `${basePriceLabel} one-time`, bespoke: 'From ₹1,999' },
    { label: 'Launch time', ready: 'Instant, about 5 minutes', bespoke: '15-min Meet, then hand-built' },
    { label: 'Link hosting', ready: `7 days included · +${formatInrComma(lifetimeAddonPrice)} Lifetime`, bespoke: 'Scoped in quote · custom domain at actuals' },
    { label: 'Languages', ready: '9 Indian languages included', bespoke: 'Custom regional script & motifs' },
    { label: 'Family links & RSVP', ready: 'Unlimited ?to= links + RSVP', bespoke: 'Unlimited ?to= links + bespoke modules' },
  ];

  return (
    <div className="relative overflow-x-clip bg-[#FAF6EF] text-[#1F1419]">
      {/* ===== 1. EDITORIAL HERO + TILTED ART COLLAGE ===== */}
      <section className="relative border-b border-[#C9A243]/25">
        <div
          className="pointer-events-none absolute inset-0 opacity-75"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(58% 48% at 86% 12%, rgba(201,162,67,0.18) 0%, transparent 62%), radial-gradient(45% 42% at 6% 90%, rgba(107,15,30,0.09) 0%, transparent 65%)',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-7 px-4 py-8 sm:px-6 sm:py-14 lg:grid-cols-12 lg:gap-10 lg:py-18">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#C9A243]/45 bg-[#FFFDF9]/90 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#7A5915]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A243]" aria-hidden="true" />
              {w.heroEyebrow}
            </p>

            <h1 className="mt-3.5 font-royal-serif text-[34px] font-semibold leading-[1.06] tracking-[-0.015em] text-[#1F1419] sm:text-5xl lg:text-[54px]">
              {w.heroTitleLead}{' '}
              <span className="italic text-[#6B0F1E]">{w.heroTitleAccent}</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#4C3A3F] sm:mt-4 sm:text-base">
              {w.heroSubtitle}
            </p>

            {/* Primary CTAs */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-6">
              <a
                href="#atelier-collection"
                className="btn-spring inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#1A1317] px-5 text-xs font-bold uppercase tracking-[0.14em] text-[#F5E0A3] shadow-sm transition hover:bg-[#2B1F26] sm:px-6"
              >
                {w.exploreCollectionCta}
              </a>
              <a
                href="#custom-wedding"
                className="btn-spring inline-flex min-h-[46px] items-center justify-center rounded-full border border-[#C9A243]/55 bg-[#FFFDF9] px-5 text-xs font-bold uppercase tracking-[0.12em] text-[#5D4314] transition hover:border-[#8C6B22] hover:bg-[#FAF3E2]"
              >
                Commission Bespoke
              </a>
            </div>

            {/* 3 Compact Price & Speed Chips */}
            <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-7 sm:gap-3">
              <a
                href="#atelier-collection"
                className="rounded-2xl border border-[#C9A243]/30 bg-[#FFFDF9]/95 p-2.5 shadow-xs transition hover:-translate-y-0.5 hover:border-[#8C6B22] sm:p-3.5"
              >
                <span className="block text-[9.5px] font-bold uppercase tracking-wider text-[#7A5915] sm:text-[10.5px]">
                  Ready-Made
                </span>
                <span className="mt-0.5 block font-royal-serif text-lg font-bold leading-tight text-[#1F1419] font-tabular sm:text-2xl">
                  {basePriceLabel}
                </span>
                <span className="block text-[10px] text-[#6B574C]">6 editions</span>
              </a>

              <a
                href="#custom-wedding"
                className="rounded-2xl border border-[#C9A243]/30 bg-[#FFFDF9]/95 p-2.5 shadow-xs transition hover:-translate-y-0.5 hover:border-[#8C6B22] sm:p-3.5"
              >
                <span className="block text-[9.5px] font-bold uppercase tracking-wider text-[#7A5915] sm:text-[10.5px]">
                  Bespoke
                </span>
                <span className="mt-0.5 block font-royal-serif text-lg font-bold leading-tight text-[#1F1419] font-tabular sm:text-2xl">
                  ₹1,999+
                </span>
                <span className="block text-[10px] text-[#6B574C]">
                  {effectiveAcceptingOrders ? 'Hand-built' : 'Booked'}
                </span>
              </a>

              <a
                href="#wedding-spotlight"
                className="rounded-2xl border border-[#C9A243]/30 bg-[#FFFDF9]/95 p-2.5 shadow-xs transition hover:-translate-y-0.5 hover:border-[#8C6B22] sm:p-3.5"
              >
                <span className="block text-[9.5px] font-bold uppercase tracking-wider text-[#7A5915] sm:text-[10.5px]">
                  Lifetime
                </span>
                <span className="mt-0.5 block font-royal-serif text-lg font-bold leading-tight text-[#1F1419] font-tabular sm:text-2xl">
                  +{formatInrComma(lifetimeAddonPrice)}
                </span>
                <span className="block text-[10px] text-[#6B574C]">No expiry</span>
              </a>
            </div>

            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-[#4C3A3F]">
              <li className="flex items-center gap-1.5">
                <CheckMark /> 7 days hosting included
              </li>
              <li className="flex items-center gap-1.5">
                <CheckMark /> Unlimited ?to= family links
              </li>
              <li className="flex items-center gap-1.5">
                <CheckMark /> 9 Indian languages
              </li>
            </ul>
          </div>

          {/* Right: 3 Tilted Printed-Stationery Art Cards */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto h-[275px] w-full max-w-[430px] sm:h-[360px] sm:max-w-[500px] lg:h-[410px]">
              <CollagePlate
                src="/templates/wedding-emerald-01/art/jharokha-scene.jpg"
                alt="Emerald palace jharokha wedding invitation scene"
                caption="Swarna Vatika"
                fallback="linear-gradient(150deg, #2D4F35 0%, #1C3221 100%)"
                className="absolute left-0 top-7 w-[55%] -rotate-6"
              />
              <CollagePlate
                src="/templates/pricing/weddings-art.jpg?v=1"
                alt="Gold-foil arch wedding invitation with velvet envelope and marigold blossoms"
                caption="Royal Heritage"
                fallback="linear-gradient(150deg, #FAF3E2 0%, #E6D2A8 100%)"
                className="absolute right-0 top-0 z-10 w-[57%] rotate-3"
              />
              <CollagePlate
                src="/templates/wedding-royal-red-01/art/mughal-scene.jpg"
                alt="Royal crimson mahal wedding invitation scene"
                caption="Sindoora Mahal"
                fallback="linear-gradient(150deg, #6B0F1E 0%, #3A0710 100%)"
                className="absolute bottom-0 left-[17%] z-20 w-[55%] -rotate-1"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. SIX ROYAL EDITIONS (2-UP ON PHONES, 3-UP ON DESKTOP) ===== */}
      <section
        id="atelier-collection"
        className="mx-auto max-w-6xl scroll-mt-20 px-3.5 py-9 sm:px-6 sm:py-14"
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#8C6B22]">
              {w.collectionEyebrow}
            </p>
            <h2 className="mt-1 font-royal-serif text-2xl font-semibold text-[#1F1419] sm:text-4xl">
              {w.collectionHeading}
            </h2>
            <p className="mt-1 max-w-xl text-xs text-[#5B4942] sm:text-sm">
              {w.collectionSubtitle}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter editions by tradition"
            className="inline-flex rounded-full border border-[#C9A243]/40 bg-[#FFFDF9] p-1 shadow-xs"
          >
            {(
              [
                { id: 'all', label: `All (${WEDDING_EDITIONS.length})` },
                { id: 'hindu', label: 'Hindu Vivah' },
                { id: 'christian', label: 'Christian' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={traditionFilter === tab.id}
                onClick={() => setTraditionFilter(tab.id)}
                className={`min-h-[36px] rounded-full px-3 text-[11px] font-bold transition sm:px-4 sm:text-xs ${
                  traditionFilter === tab.id
                    ? 'bg-[#1A1317] text-[#F5E0A3]'
                    : 'text-[#5B4942] hover:text-[#1F1419]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-7 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {filteredEditions.map((edition, idx) => (
            <WeddingEditionCard key={edition.id} edition={edition} index={idx} />
          ))}
        </div>
      </section>

      {/* ===== 3. COMPACT ATELIER SPOTLIGHT + LIVE PHONE PREVIEW + ADD-ONS ===== */}
      <section
        id="wedding-spotlight"
        className="border-y border-[#C9A243]/25 bg-[#F4EFE5]/80 py-9 sm:py-14"
      >
        <div className="mx-auto max-w-5xl px-3.5 sm:px-6">
          <div className="text-center">
            <GoldOrnamentDivider />
            <h2 className="mt-2.5 font-royal-serif text-2xl font-semibold text-[#1F1419] sm:text-4xl">
              Try any edition live
            </h2>
            <p className="mx-auto mt-1.5 max-w-lg text-xs text-[#5B4942] sm:text-sm">
              Tap the palace doors inside the phone below, switch editions, and estimate your exact total.
            </p>
          </div>

          {/* Edition Selector Chips */}
          <div className="mt-5 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap sm:justify-center">
            {WEDDING_EDITIONS.map((ed) => {
              const isSelected = ed.id === activeEdition.id;
              return (
                <button
                  key={ed.id}
                  type="button"
                  onClick={() => handleSelectStage(ed.id)}
                  className={`min-h-[38px] shrink-0 rounded-full border px-3.5 text-xs font-bold transition ${
                    isSelected
                      ? 'border-[#C9A243] bg-[#1A1317] text-[#F5E0A3] shadow-xs'
                      : 'border-[#C9A243]/35 bg-[#FFFDF9] text-[#3B2A2F] hover:border-[#8C6B22]'
                  }`}
                >
                  {ed.editorialName}
                </button>
              );
            })}
          </div>

          {/* Compact Spotlight Card */}
          <div className="mt-5 grid grid-cols-1 gap-5 rounded-2xl border border-[#C9A243]/40 bg-[#FFFDF9] p-4 shadow-[0_20px_48px_-26px_rgba(26,16,20,0.22)] sm:rounded-3xl sm:p-6 lg:grid-cols-12 lg:items-start lg:gap-7">
            {/* Left: Live Phone Preview + 3 Miniature Art Plates */}
            <div className="flex flex-col items-center lg:col-span-5">
              <AdaptivePreviewStage
                title={activeEdition.editorialName}
                caption={`${activeEdition.specimenCouple} · ${activeEdition.specimenCity}`}
                accentColor={activeEdition.palette.primary}
                externalFullScreenHref={`/i/${activeEdition.demoSlug}?lang=${activeWeddingLang}`}
                onReplay={() => setPreviewKey((k) => k + 1)}
                fullscreenChildren={
                  <WeddingScroll key={`fs-${activeEdition.id}-${previewKey}`} data={localizedStageData} />
                }
              >
                <WeddingScroll
                  key={`stage-${activeEdition.id}-${previewKey}`}
                  data={localizedStageData}
                  embedded
                />
              </AdaptivePreviewStage>

              {/* Compact 3-Plate Mini Strip */}
              <div className="mt-4 grid w-full max-w-[330px] grid-cols-3 gap-1.5">
                {[
                  { url: activeEdition.coverArtUrl, label: 'Cover' },
                  { url: activeEdition.sceneArtUrl, label: 'Inside' },
                  { url: activeEdition.ceremonyArtUrl, label: 'Ceremony' },
                ].map((plate) => (
                  <div
                    key={plate.label}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[#C9A243]/30 bg-[#1A1317]"
                  >
                    {!failedArtUrls[plate.url] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={plate.url}
                        alt={`${activeEdition.editorialName} ${plate.label}`}
                        onError={() => markArtFailed(plate.url)}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                    <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-[#F5E0A3]">
                      {plate.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Compact Details, Included Cards & Add-On Toggles */}
            <div className="flex flex-col justify-between lg:col-span-7">
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#C9A243]/25 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C6B22]">
                      {activeEdition.traditionLabel} · {activeEdition.editionRoman}
                    </span>
                    <h3 className="font-royal-serif text-2xl font-semibold text-[#1F1419] sm:text-3xl">
                      {activeEdition.editorialName}
                    </h3>
                  </div>
                  <div className="text-right font-tabular">
                    <span className="mr-1.5 text-xs text-[#1F1419]/40 line-through">
                      {formatInrComma(activeEdition.compareAtInr)}
                    </span>
                    <span className="font-royal-serif text-3xl font-bold text-[#1F1419]">
                      {formatInrComma(activeEdition.priceInr + addonsTotalInr)}
                    </span>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B574C]">
                      GST Inclusive · One-time
                    </span>
                  </div>
                </div>

                {/* 6 Included Sections in a Tidy 2-Col Grid */}
                <div className="mt-3.5 grid grid-cols-2 gap-2">
                  {activeEdition.includedSections.map((sec) => (
                    <div
                      key={sec.title}
                      className="rounded-xl border border-[#C9A243]/25 bg-[#FAF6EE]/70 px-2.5 py-2"
                    >
                      <p className="text-[11px] font-bold text-[#1F1419] sm:text-xs">{sec.title}</p>
                      <p className="text-[10px] text-[#6B574C] sm:text-[11px]">{sec.detail}</p>
                    </div>
                  ))}
                </div>

                {/* Optional Add-Ons (Mutually Exclusive Validity + Ready-Made Lifetime) */}
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#8C6B22]">
                      Optional Checkout Add-Ons (7d included free)
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {OPTIONAL_ADDONS.map((addon) => {
                      const active = selectedAddons[addon.id];
                      const price = addonCatalogLookup[addon.id]?.priceInr ?? addon.fallbackPriceInr;
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleAddon(addon.id)}
                          className={`flex flex-col items-start rounded-xl border px-2.5 py-2 text-left transition ${
                            active
                              ? 'border-[#154230] bg-[#154230] text-[#ECFAF3] shadow-xs'
                              : 'border-[#C9A243]/35 bg-[#FFFDF9] text-[#1F1419] hover:border-[#8C6B22]'
                          }`}
                        >
                          <div className="flex w-full items-center justify-between gap-1">
                            <span className="text-[11px] font-bold leading-tight">
                              {addon.shortTitle}
                            </span>
                            <span
                              className={`font-tabular text-[10.5px] font-extrabold ${
                                active ? 'text-[#A7F3D0]' : 'text-[#154230]'
                              }`}
                            >
                              +₹{price}
                            </span>
                          </div>
                          <span
                            className={`mt-0.5 text-[9.5px] ${
                              active ? 'text-[#ECFAF3]/80' : 'text-[#6B574C]'
                            }`}
                          >
                            {addon.shortTag}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/weddings/${activeEdition.id}/customize`}
                  className="btn-spring inline-flex min-h-[46px] flex-1 items-center justify-center rounded-full bg-[#1A1317] px-5 text-xs font-bold uppercase tracking-[0.14em] text-[#F5E0A3] shadow-sm transition hover:bg-[#2B1F26]"
                >
                  Customize {activeEdition.editorialName} · {formatInrComma(activeEdition.priceInr + addonsTotalInr)} →
                </Link>
                <Link
                  href={`/weddings/${activeEdition.id}`}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[#C9A243]/50 bg-[#FAF6EE] px-5 text-xs font-bold text-[#5D4314] transition hover:border-[#8C6B22]"
                >
                  Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4. HOW IT UNFOLDS (2x2 MOBILE / 4-COL DESKTOP) ===== */}
      <section className="mx-auto max-w-6xl px-3.5 py-9 sm:px-6 sm:py-14">
        <div className="text-center">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#8C6B22]">
            Simple 4-Step Flow
          </p>
          <h2 className="mt-1 font-royal-serif text-2xl font-semibold text-[#1F1419] sm:text-3xl">
            How your invitation unfolds
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-7 sm:grid-cols-4 sm:gap-4">
          {journeySteps.map((step, idx) => (
            <div
              key={step.num}
              className="rounded-2xl border border-[#C9A243]/30 bg-[#FFFDF9] p-3 shadow-xs sm:p-4"
            >
              <div className="flex items-center justify-between">
                <JourneyStepSvg step={idx} />
                <span className="font-royal-serif text-lg font-bold text-[#C9A243]/60">
                  {step.num}
                </span>
              </div>
              <h3 className="mt-2.5 font-royal-serif text-sm font-semibold text-[#1F1419] sm:text-base">
                {step.title}
              </h3>
              <p className="mt-1 text-[11px] leading-snug text-[#5B4942] sm:text-xs">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 5. FAMILY ?to= LINK STUDIO (COMPACT WHATSAPP PREVIEW) ===== */}
      <section className="border-y border-[#C9A243]/25 bg-[#FFFDF9] py-9 sm:py-14">
        <div className="mx-auto max-w-5xl px-3.5 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-[#C9A243]/40 bg-[#FAF6EE]/65 p-4 sm:rounded-3xl sm:p-7 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8C6B22]">
                Personalised ?to= Family Links
              </span>
              <h2 className="mt-1 font-royal-serif text-2xl font-semibold text-[#1F1419] sm:text-3xl">
                Greet every household by name
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-[#5B4942] sm:text-sm">
                One invitation generates unlimited family-named links for WhatsApp — zero extra cost per guest.
              </p>

              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {GUEST_SUGGESTIONS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSampleGuestName(preset)}
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                      sampleGuestName === preset
                        ? 'border-[#C9A243] bg-[#1A1317] text-[#F5E0A3]'
                        : 'border-[#C9A243]/35 bg-[#FFFDF9] text-[#3B2A2F] hover:border-[#8C6B22]'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="mt-3.5 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={sampleGuestName}
                  onChange={(e) => setSampleGuestName(e.target.value)}
                  maxLength={50}
                  placeholder="Type family name..."
                  aria-label="Family greeting name"
                  className="min-h-[44px] flex-1 rounded-full border border-[#C9A243]/45 bg-[#FFFDF9] px-4 text-sm text-[#1F1419] outline-none focus:border-[#8C6B22]"
                />
                <Link
                  href={personalizedPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-spring inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#1A1317] px-5 text-xs font-bold text-[#F5E0A3] shadow-xs hover:bg-[#2B1F26]"
                >
                  Open Card →
                </Link>
              </div>
            </div>

            {/* Faux WhatsApp Bubble + Specimen Plaque */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-[#C9A243]/40 bg-[#FFFDF9] p-4 shadow-sm sm:p-5">
                <div className="rounded-xl border border-emerald-200/80 bg-[#ECFDF5]/65 p-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#154230]">
                    <span>WhatsApp Family Greeting</span>
                    <span>{activeEdition.editorialName}</span>
                  </div>
                  <p className="mt-2 font-royal-script text-3xl leading-tight text-[#6B0F1E]">
                    Dear {cleanGuest}
                  </p>
                  <p className="mt-1 text-xs text-[#3B2A2F]">
                    With elder blessings, you are warmly invited to the wedding of{' '}
                    <strong>{activeEdition.specimenCouple}</strong>.
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-[#C9A243]/30 bg-[#FAF6EE] px-3 py-2">
                  <span className="truncate font-mono text-[11px] text-[#3E2F34]">
                    webzy.in{personalizedPath}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyGuestLink}
                    className="btn-spring shrink-0 rounded-full border border-[#C9A243]/55 bg-[#FFFDF9] px-3.5 py-1.5 text-[10.5px] font-bold text-[#5D4314] hover:bg-[#FAF3E2]"
                  >
                    {copiedGuestLink ? 'Copied' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 6. READY-MADE VS BESPOKE COMPARISON ===== */}
      <section className="mx-auto max-w-5xl px-3.5 py-9 sm:px-6 sm:py-14">
        <div className="max-w-xl">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#8C6B22]">
            Compare Options
          </p>
          <h2 className="mt-1 font-royal-serif text-2xl font-semibold text-[#1F1419] sm:text-3xl">
            Ready-Made Suite vs. Bespoke Commission
          </h2>
        </div>

        <div className="-mx-3.5 mt-4 overflow-x-auto px-3.5 sm:mx-0 sm:px-0">
          <div className="min-w-[520px] overflow-hidden rounded-2xl border border-[#C9A243]/35 bg-[#FFFDF9] shadow-xs">
            <div className="grid grid-cols-[1fr_1.1fr_1.1fr] border-b border-[#C9A243]/25 bg-[#FAF3E2]/70 text-xs font-bold text-[#1F1419]">
              <div className="p-3 sm:p-4" />
              <a href="#atelier-collection" className="p-3 hover:text-[#6B0F1E] sm:p-4">
                <span className="block font-royal-serif text-sm sm:text-base">Ready-Made Suite</span>
                <span className="text-[10.5px] text-[#8C6B22]">Instant · {basePriceLabel}</span>
              </a>
              <a href="#custom-wedding" className="bg-[#1A1317] p-3 text-[#F5E0A3] sm:p-4">
                <span className="block font-royal-serif text-sm sm:text-base">Bespoke Commission</span>
                <span className="text-[10.5px] text-[#E4C77B]/80">Hand-built · From ₹1,999</span>
              </a>
            </div>
            {comparisonRows.map((row, idx) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1fr_1.1fr_1.1fr] text-xs text-[#3B2A2F] ${
                  idx % 2 === 1 ? 'bg-[#FAF6EE]/55' : ''
                }`}
              >
                <div className="p-3 font-bold text-[#1F1419] sm:p-4">{row.label}</div>
                <div className="p-3 sm:p-4">{row.ready}</div>
                <div className="bg-[#FAF3E2]/35 p-3 font-medium text-[#1F1419] sm:p-4">
                  {row.bespoke}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7. DARK OBSIDIAN & GOLD PROMISES BAND (2-UP MOBILE, 3-UP DESKTOP) ===== */}
      <section className="bg-[#1A1317] text-[#FAF6EE]">
        <div className="mx-auto max-w-6xl px-3.5 py-9 sm:px-6 sm:py-14">
          <div className="max-w-xl">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#E4C77B]">
              Built for Indian Families
            </p>
            <h2 className="mt-1 font-royal-serif text-2xl font-semibold sm:text-4xl">
              Crafted with reverence, priced honestly
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-7 sm:gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#C9A243]/25 bg-white/[0.04] p-3 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-royal-serif text-2xl font-bold text-[#E4C77B]/35 sm:text-4xl">
                  01
                </span>
                <JharokhaArchSvg />
              </div>
              <h3 className="mt-2 font-royal-serif text-sm font-semibold leading-snug sm:mt-3 sm:text-lg">
                Zero per-guest fees
              </h3>
              <p className="mt-1 text-xs leading-snug text-[#FAF6EE]/70 sm:text-sm">
                Send your invitation to 50 or 5,000 guests across WhatsApp groups with unlimited personalised family links.
              </p>
            </div>

            <div className="rounded-2xl border border-[#C9A243]/25 bg-white/[0.04] p-3 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-royal-serif text-2xl font-bold text-[#E4C77B]/35 sm:text-4xl">
                  02
                </span>
                <LotusSealSvg />
              </div>
              <h3 className="mt-2 font-royal-serif text-sm font-semibold leading-snug sm:mt-3 sm:text-lg">
                Private &amp; DPDP-safe
              </h3>
              <p className="mt-1 text-xs leading-snug text-[#FAF6EE]/70 sm:text-sm">
                Hidden from Google search, optional 4-digit PIN lock, and automatic photo cleanup after expiry unless Lifetime is chosen.
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-[#C9A243]/25 bg-white/[0.04] p-3 sm:p-5 md:col-span-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-royal-serif text-2xl font-bold text-[#E4C77B]/35 sm:text-4xl">
                  03
                </span>
                <LanguageScrollSvg />
              </div>
              <h3 className="mt-2 font-royal-serif text-sm font-semibold leading-snug sm:mt-3 sm:text-lg">
                9 Indian languages
              </h3>
              <p className="mt-1 text-xs leading-snug text-[#FAF6EE]/70 sm:text-sm">
                Guests can switch seamlessly between English, Hindi, Gujarati, Marathi, Punjabi, Bengali, Tamil, Telugu, and Kannada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 8. BESPOKE CUSTOM WEDDING COMMISSION + LIVE ADMIN CAPACITY ===== */}
      <section
        id="custom-wedding"
        className="scroll-mt-20 border-t border-[#C9A243]/30 bg-[#F4EFE5] py-9 sm:py-14"
      >
        <div className="mx-auto max-w-5xl px-3.5 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-[#C9A243]/45 bg-[#FFFDF9] p-4 shadow-[0_22px_54px_-28px_rgba(31,20,25,0.22)] sm:rounded-3xl sm:p-7">
            {effectiveAcceptingOrders ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                {/* Left: Editorial Overview & 3 Compact Steps */}
                <div className="flex flex-col justify-between lg:col-span-5">
                  <div>
                    <span className="inline-flex items-center rounded-full border border-[#C9A243]/45 bg-[#FAF4E8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7A5915]">
                      Bespoke Wedding Atelier
                    </span>

                    <h2 className="mt-3.5 font-royal-serif text-2xl font-semibold leading-[1.1] text-[#1F1419] sm:text-3xl">
                      Commission a Custom Wedding Website in Your Own Style
                    </h2>

                    <p className="mt-2 text-xs leading-relaxed text-[#4C3A3F] sm:text-sm">
                      Want bespoke ceremony art, regional motifs, or your own custom domain? Crafted
                      one-on-one from your moodboard starting at{' '}
                      <strong className="text-[#1F1419]">₹1,999</strong>.
                    </p>

                    <div className="mt-4 space-y-2.5">
                      {BESPOKE_STEPS.map((item) => (
                        <div
                          key={item.step}
                          className="flex items-start gap-3 rounded-xl border border-[#C9A243]/30 bg-[#FAF6EE]/80 p-3"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1A1317] font-royal-serif text-[11px] font-bold text-[#F5E0A3]">
                            {item.step}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-[#1F1419]">{item.title}</p>
                            <p className="mt-0.5 text-[11px] leading-snug text-[#5B4942]">
                              {item.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-[#1A1317] p-3.5 text-[#FAF6EE]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E4C77B]">
                        Launch Pricing
                      </span>
                      <span className="font-royal-serif text-base font-semibold text-[#E4C77B]">
                        From ₹1,999
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#FAF6EE]/75">
                      Custom domain (.in / .com) billed at registrar actuals. Questions? Email{' '}
                      <a href={`mailto:${supportEmail}`} className="underline text-[#E4C77B]">
                        {supportEmail}
                      </a>
                      .
                    </p>
                  </div>
                </div>

                {/* Right: Inline Bespoke Commission Form */}
                <div className="lg:col-span-7">
                  {reqSubmittedId ? (
                    <div className="flex h-full flex-col justify-center rounded-2xl border border-[#C9A243]/45 bg-[#FAF6EE] p-5 text-center sm:p-7">
                      <span className="mx-auto inline-flex rounded-full bg-[#154230] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ECFAF3]">
                        Bespoke Brief Received
                      </span>
                      <h3 className="mt-3 font-royal-serif text-2xl font-semibold text-[#1F1419]">
                        Thank you, {reqName}
                      </h3>
                      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#4C3A3F] sm:text-sm">
                        Reference{' '}
                        <code className="rounded bg-white px-2 py-0.5 font-mono text-xs font-bold text-[#1F1419]">
                          #{reqSubmittedId.slice(0, 8)}
                        </code>{' '}
                        is logged. We will reach out to <strong>{reqEmail}</strong> to schedule your
                        15-minute Google Meet.
                      </p>
                      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                        <a
                          href={meetScheduleWaHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-spring inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#154230] px-5 text-xs font-bold text-[#ECFAF3] hover:bg-[#103426]"
                        >
                          Schedule Google Meet on WhatsApp →
                        </a>
                        <a
                          href="#atelier-collection"
                          className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[#C9A243]/55 bg-[#FFFDF9] px-5 text-xs font-bold text-[#5D4314]"
                        >
                          Explore Ready-Made Editions
                        </a>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleCustomWeddingSubmit}
                      className="rounded-2xl border border-[#C9A243]/35 bg-[#FAF6EE]/65 p-4 sm:p-6"
                    >
                      <div className="border-b border-[#C9A243]/25 pb-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C6B22]">
                          Bespoke Commission Form
                        </span>
                        <h3 className="mt-0.5 font-royal-serif text-xl font-semibold text-[#1F1419]">
                          Tell Us About Your Celebration
                        </h3>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="custom-wedding-name"
                            className="block text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#3B2A2F]"
                          >
                            Your Name *
                          </label>
                          <input
                            id="custom-wedding-name"
                            type="text"
                            required
                            maxLength={80}
                            value={reqName}
                            onChange={(e) => setReqName(e.target.value)}
                            placeholder="Bride, Groom, or Family Member"
                            className="mt-1 min-h-[44px] w-full rounded-xl border border-[#C9A243]/40 bg-[#FFFDF9] px-3 text-sm text-[#1F1419] placeholder:text-[#8A786B] outline-none focus:border-[#8C6B22]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="custom-wedding-email"
                            className="block text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#3B2A2F]"
                          >
                            Email *
                          </label>
                          <input
                            id="custom-wedding-email"
                            type="email"
                            required
                            maxLength={120}
                            value={reqEmail}
                            onChange={(e) => setReqEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="mt-1 min-h-[44px] w-full rounded-xl border border-[#C9A243]/40 bg-[#FFFDF9] px-3 text-sm text-[#1F1419] placeholder:text-[#8A786B] outline-none focus:border-[#8C6B22]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="custom-wedding-phone"
                            className="block text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#3B2A2F]"
                          >
                            WhatsApp Phone *
                          </label>
                          <input
                            id="custom-wedding-phone"
                            type="tel"
                            required
                            maxLength={20}
                            value={reqPhone}
                            onChange={(e) => setReqPhone(e.target.value)}
                            placeholder="+91 98XXXXXXXX"
                            className="mt-1 min-h-[44px] w-full rounded-xl border border-[#C9A243]/40 bg-[#FFFDF9] px-3 text-sm text-[#1F1419] placeholder:text-[#8A786B] outline-none focus:border-[#8C6B22]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="custom-wedding-date"
                            className="block text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#3B2A2F]"
                          >
                            Wedding Date
                          </label>
                          <input
                            id="custom-wedding-date"
                            type="date"
                            value={reqTargetDate}
                            onChange={(e) => setReqTargetDate(e.target.value)}
                            className="mt-1 min-h-[44px] w-full rounded-xl border border-[#C9A243]/40 bg-[#FFFDF9] px-3 text-sm text-[#1F1419] outline-none focus:border-[#8C6B22]"
                          />
                        </div>
                      </div>

                      <div className="mt-3.5">
                        <span className="block text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#3B2A2F]">
                          Preferred Budget Tier
                        </span>
                        <div className="mt-1.5 grid grid-cols-3 gap-1.5 sm:gap-2">
                          {CUSTOM_BUDGET_TIERS.map((tier) => {
                            const selected = reqBudgetTier === tier.value;
                            return (
                              <button
                                key={tier.value}
                                type="button"
                                onClick={() => setReqBudgetTier(tier.value)}
                                aria-pressed={selected}
                                className={`flex min-h-[54px] flex-col items-start justify-center rounded-xl border px-2 py-2 text-left transition sm:p-2.5 ${
                                  selected
                                    ? 'border-[#C9A243] bg-[#1A1317] text-[#FAF6EE]'
                                    : 'border-[#C9A243]/35 bg-[#FFFDF9] text-[#1F1419] hover:border-[#8C6B22]'
                                }`}
                              >
                                <span className={`font-tabular text-xs font-extrabold ${selected ? 'text-[#E4C77B]' : 'text-[#1F1419]'}`}>
                                  {tier.label}
                                </span>
                                <span className={`text-[10px] font-semibold leading-tight ${selected ? 'text-[#FAF6EE]/90' : 'text-[#3B2A2F]'}`}>
                                  {tier.tag}
                                </span>
                                <span className={`hidden text-[9.5px] sm:block ${selected ? 'text-[#FAF6EE]/65' : 'text-[#6B574C]'}`}>
                                  {tier.detail}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-3.5">
                        <label
                          htmlFor="custom-wedding-brief"
                          className="block text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#3B2A2F]"
                        >
                          Your Style, Functions &amp; Ideas *
                        </label>
                        <textarea
                          id="custom-wedding-brief"
                          required
                          minLength={15}
                          maxLength={1000}
                          rows={3}
                          value={reqBrief}
                          onChange={(e) => setReqBrief(e.target.value)}
                          placeholder="Share your wedding city, ceremonies (Haldi, Mehendi, Sangeet, Pheras, Reception), colour mood, or reference links..."
                          className="mt-1 w-full rounded-xl border border-[#C9A243]/40 bg-[#FFFDF9] p-3 text-sm text-[#1F1419] placeholder:text-[#8A786B] outline-none focus:border-[#8C6B22]"
                        />
                        <div className="mt-1 flex items-center justify-between text-[10.5px] text-[#6B574C]">
                          <span>Minimum 15 characters</span>
                          <span className="font-tabular">{reqBrief.length}/1000</span>
                        </div>
                      </div>

                      {reqErrorMsg ? (
                        <div role="alert" className="mt-2.5 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-900">
                          {reqErrorMsg}
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="submit"
                          disabled={reqSubmitting}
                          className="btn-spring inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#1A1317] px-6 text-xs font-bold uppercase tracking-[0.14em] text-[#FAF6EE] shadow-sm transition hover:bg-[#2B1F26] disabled:opacity-50"
                        >
                          {reqSubmitting ? 'Submitting Brief...' : 'Request Custom Wedding Slot →'}
                        </button>
                        <span className="text-[11px] text-[#5B4942]">
                          No advance payment needed
                        </span>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              /* Capacity-Full / Paused State */
              <div className="mx-auto max-w-2xl py-4 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#C9A243]/55 bg-[#FAF3E2] px-4 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6A4E16]">
                  {weddingCapacity.paused
                    ? 'Commissions Paused Temporarily'
                    : 'Currently Fully Booked'}
                </span>

                <h2 className="mt-3.5 font-royal-serif text-2xl font-semibold text-[#1F1419] sm:text-4xl">
                  Bespoke Wedding Batch Currently at Capacity
                </h2>

                <p className="mx-auto mt-2.5 max-w-xl text-xs leading-relaxed text-[#4C3A3F] sm:text-sm">
                  Every custom wedding website is hand-built personally so each illustration,
                  ceremony card, and family link gets unhurried care. New bespoke slots pause once
                  active commissions reach capacity.
                </p>

                {resolvedCapacityMessage ? (
                  <div className="mx-auto mt-4 max-w-lg rounded-xl border border-[#C9A243]/45 bg-[#FAF6EE] px-4 py-3 text-xs font-medium text-[#3B2A2F]">
                    {resolvedCapacityMessage}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                  <a
                    href="#atelier-collection"
                    className="btn-spring inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-[#1A1317] px-6 text-xs font-bold text-[#F5E0A3] hover:bg-[#2B1F26] sm:w-auto"
                  >
                    Customize a Ready-Made Edition ({basePriceLabel} + {formatInrComma(lifetimeAddonPrice)} Lifetime) →
                  </a>
                  <a
                    href={priorityWaitlistWaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full border border-[#C9A243]/60 bg-[#FAF6EE] px-5 text-xs font-bold text-[#5D4314] hover:bg-white sm:w-auto"
                  >
                    Join Next Batch on WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== 9. CLOSING CTA BAND ===== */}
      <section className="mx-auto max-w-6xl px-3.5 py-9 sm:px-6 sm:py-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6B0F1E] via-[#4A0B16] to-[#1A1317] p-6 text-[#FAF6EE] shadow-[0_26px_58px_-24px_rgba(74,11,22,0.55)] sm:p-10">
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[#C9A243]/15" aria-hidden="true" />
          <div className="relative max-w-xl">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#E4C77B]">
              Shubh Vivah · Digital Keepsake
            </p>
            <h2 className="mt-1.5 font-royal-serif text-2xl font-semibold sm:text-4xl">
              Your family invitation, ready in five minutes.
            </h2>
            <p className="mt-2 text-xs text-[#FAF6EE]/80 sm:text-sm">
              Choose one of {WEDDING_EDITIONS.length} royal editions starting at {basePriceLabel},
              or reserve a bespoke commission tailored to your celebration.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <a
                href="#atelier-collection"
                className="btn-spring inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#D4AF37] px-6 text-xs font-bold uppercase tracking-[0.14em] text-[#1A1317] shadow-md transition hover:bg-[#E2C258]"
              >
                Pick a Ready-Made Edition
              </a>
              <Link
                href="/pricing"
                className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[#E4C77B]/45 px-6 text-xs font-bold uppercase tracking-[0.14em] text-[#FAF6EE] transition hover:bg-white/10"
              >
                Compare All Prices
              </Link>
              <Link
                href={`/weddings/${baseEdition.id}/customize`}
                className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-white/25 px-6 text-xs font-bold uppercase tracking-[0.14em] text-[#FAF6EE] transition hover:bg-white/10"
              >
                Start Customizing →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
