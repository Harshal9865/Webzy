'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ADDON_CATALOG,
  type AddonId,
  formatInr,
  getSiteCopy,
  isValidityAddonId,
  STOREFRONT_VALIDITY_ADDON_IDS,
  type StorefrontValidityAddonId,
} from '@webzy/core';
import type { CatalogPricingSummary } from '@webzy/themes';
import { useLanguage } from '../shell/LanguageProvider';

export interface CustomOrderBucketCapacity {
  acceptingOrders: boolean;
  remainingSlots: number;
  limit: number;
  activeCount: number;
  paused: boolean;
  capacityMessage: string;
}

export interface CustomOrderCapacity {
  wedding: CustomOrderBucketCapacity;
  studio: CustomOrderBucketCapacity;
  capacityMessage: string;
}

interface PricingClientProps {
  catalogPricing: CatalogPricingSummary;
  capacity: CustomOrderCapacity;
}

type PricingTierId = 'ready_made' | 'semi_custom' | 'studio_bespoke';

const FEATURE_ADDON_IDS: readonly AddonId[] = ['pin', 'video'];
const PREFERRED_ADDONS_KEY = 'webzy_preferred_addons';

const VALIDITY_PILL_META: Record<
  StorefrontValidityAddonId,
  { title: string; subtitle: string }
> = {
  extend_14d: { title: '14 Days', subtitle: 'Two weeks live' },
  extend_21d: { title: '21 Days', subtitle: 'Three weeks live' },
  lifetime: { title: 'Lifetime', subtitle: 'Never expires' },
};

const TIER_ART: Record<PricingTierId, { src: string; alt: string; gradient: string }> = {
  ready_made: {
    src: '/templates/pricing/occasions-art.jpg?v=1',
    alt: 'Scalloped keepsake card, beeswax candle, vintage camera and rosebuds',
    gradient: 'linear-gradient(135deg, #FFF1F5 0%, #FFE4EC 55%, #FDF8F3 100%)',
  },
  semi_custom: {
    src: '/templates/pricing/weddings-art.jpg?v=1',
    alt: 'Gold-foil arch invitation on raw silk with a velvet envelope and marigold garland',
    gradient: 'linear-gradient(135deg, #FAF3E2 0%, #EFE2C4 55%, #FDFBF5 100%)',
  },
  studio_bespoke: {
    src: '/templates/pricing/custom-made-art.jpg?v=1',
    alt: 'Design folio, terracotta disc, rangefinder camera and fountain pen on linen',
    gradient: 'linear-gradient(135deg, #F6F2EA 0%, #EDE4D6 55%, #FAF8F3 100%)',
  },
};

function ArtPlate({
  tierId,
  className = '',
  imgClassName = '',
}: {
  tierId: PricingTierId;
  className?: string;
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const art = TIER_ART[tierId];
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: art.gradient }}>
      {!failed ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={art.src}
          alt={art.alt}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover object-center ${imgClassName}`}
        />
      ) : null}
    </div>
  );
}

function OrnamentDivider({ tone = 'text-webzy-primary/65' }: { tone?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${tone}`} aria-hidden="true">
      <span className="h-px w-10 bg-current opacity-40 sm:w-16" />
      <svg className="h-4 w-12 shrink-0" viewBox="0 0 64 20" fill="none">
        <path d="M4 10 C12 4, 20 4, 24 10 C20 16, 12 16, 4 10 Z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M60 10 C52 4, 44 4, 40 10 C44 16, 52 16, 60 10 Z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M32 3 L37 10 L32 17 L27 10 Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="32" cy="10" r="1.6" fill="currentColor" />
      </svg>
      <span className="h-px w-10 bg-current opacity-40 sm:w-16" />
    </div>
  );
}

function CraftMarginArtSvg() {
  return (
    <svg className="h-8 w-8 text-webzy-primary sm:h-10 sm:w-10" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="36" height="36" rx="10" fill="#FFF0F5" stroke="#FBCFE8" strokeWidth="1.2" />
      <path d="M13 27 L19 20 L24 24 L31 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 15 H31 V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15" cy="15" r="2.2" fill="#F59E0B" fillOpacity="0.85" />
      <path d="M12 31 H32" stroke="#E11D63" strokeOpacity="0.3" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function HostingLinkArtSvg() {
  return (
    <svg className="h-8 w-8 text-emerald-700 sm:h-10 sm:w-10" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="36" height="36" rx="10" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1.2" />
      <path
        d="M18.5 25.5 L15.7 28.3 C14 30 11.3 30 9.6 28.3 C7.9 26.6 7.9 23.9 9.6 22.2 L14.1 17.7 C15.8 16 18.5 16 20.2 17.7"
        transform="translate(4 0)"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M21.5 18.5 L24.3 15.7 C26 14 28.7 14 30.4 15.7 C32.1 17.4 32.1 20.1 30.4 21.8 L25.9 26.3 C24.2 28 21.5 28 19.8 26.3"
        transform="translate(0 -1)"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="31.5" cy="12.5" r="2" fill="#10B981" />
    </svg>
  );
}

function DomainCompassArtSvg() {
  return (
    <svg className="h-8 w-8 text-[#7C5A16] sm:h-10 sm:w-10" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="36" height="36" rx="10" fill="#FEF9EC" stroke="#E5C878" strokeWidth="1.2" />
      <circle cx="22" cy="22" r="10.5" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="22" cy="22" rx="4.8" ry="10.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11.8 22 H32.2 M13.5 16.8 H30.5 M13.5 27.2 H30.5" stroke="currentColor" strokeOpacity="0.65" strokeWidth="1.1" />
    </svg>
  );
}

function CheckIcon({ className = 'h-4 w-4 text-emerald-600' }: { className?: string }) {
  return (
    <svg
      className={`shrink-0 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function PricingClient({ catalogPricing, capacity }: PricingClientProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const site = getSiteCopy(language);
  const p = site.pricing;

  const [selectedTierId, setSelectedTierId] = useState<PricingTierId>('semi_custom');
  const [selectedAddons, setSelectedAddons] = useState<AddonId[]>([]);

  // Restore any previously chosen add-ons (ignoring legacy 90d extend)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREFERRED_ADDONS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const rawValid = parsed.filter(
          (item): item is AddonId =>
            typeof item === 'string' &&
            (item === 'pin' ||
              item === 'video' ||
              STOREFRONT_VALIDITY_ADDON_IDS.includes(item as StorefrontValidityAddonId)),
        );
        const chosenValidity = (['lifetime', 'extend_21d', 'extend_14d'] as const).find((vId) =>
          rawValid.includes(vId),
        );
        const valid = Array.from(
          new Set([
            ...rawValid.filter((item) => !isValidityAddonId(item)),
            ...(chosenValidity ? [chosenValidity] : []),
          ]),
        );
        if (valid.length > 0) {
          setSelectedAddons(valid);
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  // Persist chosen add-ons so CheckoutClient pre-selects them automatically
  useEffect(() => {
    try {
      window.localStorage.setItem(PREFERRED_ADDONS_KEY, JSON.stringify(selectedAddons));
    } catch {
      // Ignore storage write errors
    }
  }, [selectedAddons]);

  const baseDays = catalogPricing.validity.baseDays;
  const lifetimeLabel = formatInr(catalogPricing.validity.lifetimeReadyMadeInr);

  const tierDefinitions = useMemo(
    () => [
      {
        id: 'ready_made' as const,
        shortName: 'Occasions',
        priceLabel: `${formatInr(catalogPricing.occasions.minInr)} – ${formatInr(catalogPricing.occasions.maxInr)}`,
        fromLabel: formatInr(catalogPricing.occasions.minInr),
        compareLabel: `Up to ${formatInr(catalogPricing.occasions.compareAtMaxInr)}`,
        sampleBaseInr: catalogPricing.occasions.minInr,
        supportsAddons: true,
        ctaHref: '/themes',
        blurb:
          'Birthdays, romance, anniversaries, family notes and business greetings. Pick a theme, add your photos and words, and share a link in five minutes.',
        meta: `${catalogPricing.occasions.count} themes`,
        delivery: 'Instant, about 5 minutes',
        bestFor: 'Gifts, surprises and greetings',
      },
      {
        id: 'semi_custom' as const,
        shortName: 'Weddings',
        priceLabel:
          catalogPricing.weddings.maxInr > catalogPricing.weddings.minInr
            ? `${formatInr(catalogPricing.weddings.minInr)} – ${formatInr(catalogPricing.weddings.maxInr)}`
            : formatInr(catalogPricing.weddings.minInr),
        fromLabel: formatInr(catalogPricing.weddings.minInr),
        compareLabel: formatInr(catalogPricing.weddings.compareAtMaxInr),
        sampleBaseInr: catalogPricing.weddings.minInr,
        supportsAddons: true,
        ctaHref: '/weddings',
        blurb: `${catalogPricing.weddings.count} heirloom invitation editions with opening doors, family-name links and one-tap RSVP, plus a bespoke commission option.`,
        meta: `${catalogPricing.weddings.count}-edition suite`,
        delivery: 'Instant, plus optional bespoke build',
        bestFor: 'Shaadi and ceremony invitations',
      },
      {
        id: 'studio_bespoke' as const,
        shortName: 'Custom Made',
        priceLabel: `From ${formatInr(catalogPricing.customMade.startingInr)}`,
        fromLabel: formatInr(catalogPricing.customMade.startingInr),
        compareLabel: `Weddings from ${formatInr(catalogPricing.customMade.customWeddingStartingInr)}`,
        sampleBaseInr: catalogPricing.customMade.startingInr,
        supportsAddons: false,
        ctaHref: '/studio',
        blurb:
          'A website built around you: coaching institutes, clinics, shops and bespoke weddings. It starts with a 15-minute call, then we build.',
        meta: capacity.studio.acceptingOrders
          ? 'One-on-one hand-built'
          : 'Currently fully booked',
        delivery: '15-minute call, then hand-built',
        bestFor: 'Businesses and one-of-a-kind sites',
      },
    ],
    [catalogPricing, capacity.studio],
  );

  const activeTierConfig =
    tierDefinitions.find((t) => t.id === selectedTierId) ?? tierDefinitions[1];
  const activeTierCopy = p.tiers[activeTierConfig.id];

  const activeValidityId: StorefrontValidityAddonId | null =
    STOREFRONT_VALIDITY_ADDON_IDS.find((vId) => selectedAddons.includes(vId)) ?? null;

  const addonsTotalInr = useMemo(() => {
    if (!activeTierConfig.supportsAddons) return 0;
    return selectedAddons.reduce((sum, id) => sum + (ADDON_CATALOG[id]?.priceInr ?? 0), 0);
  }, [activeTierConfig.supportsAddons, selectedAddons]);

  const estimatedTotalInr = activeTierConfig.sampleBaseInr + addonsTotalInr;

  function persistPreferredAddons(addons: AddonId[]) {
    try {
      window.localStorage.setItem(PREFERRED_ADDONS_KEY, JSON.stringify(addons));
    } catch {
      // Ignore storage write errors
    }
  }

  function navigateToTier(href: string) {
    persistPreferredAddons(selectedAddons);
    router.push(href);
  }

  function toggleFeatureAddon(id: AddonId) {
    if (!activeTierConfig.supportsAddons) return;
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function selectValidityAddon(id: StorefrontValidityAddonId | null) {
    if (!activeTierConfig.supportsAddons) return;
    setSelectedAddons((prev) => {
      const withoutValidity = prev.filter((item) => !isValidityAddonId(item));
      return id ? [...withoutValidity, id] : withoutValidity;
    });
  }

  function jumpToPath(tierId: PricingTierId) {
    setSelectedTierId(tierId);
    document.getElementById('pricing-paths')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const timelineSteps: Array<{
    id: StorefrontValidityAddonId | null;
    title: string;
    subtitle: string;
    priceLabel: string;
  }> = [
    { id: null, title: `${baseDays} Days`, subtitle: 'Included', priceLabel: formatInr(0) },
    ...STOREFRONT_VALIDITY_ADDON_IDS.map((vId) => ({
      id: vId,
      title: VALIDITY_PILL_META[vId].title,
      subtitle: VALIDITY_PILL_META[vId].subtitle,
      priceLabel: `+${formatInr(ADDON_CATALOG[vId].priceInr)}`,
    })),
  ];
  const activeStepIdx = Math.max(
    0,
    timelineSteps.findIndex((s) => s.id === activeValidityId),
  );

  const comparisonRows: Array<{ label: string; values: [string, string, string] }> = [
    {
      label: 'Starting price',
      values: [
        tierDefinitions[0].priceLabel,
        tierDefinitions[1].priceLabel,
        tierDefinitions[2].priceLabel,
      ],
    },
    {
      label: 'Delivery',
      values: [tierDefinitions[0].delivery, tierDefinitions[1].delivery, tierDefinitions[2].delivery],
    },
    {
      label: 'Link hosting',
      values: [`${baseDays} days included`, `${baseDays} days included`, 'Scoped in your quote'],
    },
    {
      label: 'Lifetime Hosting',
      values: [`${lifetimeLabel} one-time`, `${lifetimeLabel} one-time`, 'Not applicable'],
    },
    {
      label: 'PIN lock and video',
      values: ['Optional add-ons', 'Optional add-ons', 'Scoped in your quote'],
    },
    {
      label: 'Custom domain',
      values: ['Not needed', 'Not needed', 'Optional, at actuals'],
    },
    {
      label: 'Best for',
      values: [tierDefinitions[0].bestFor, tierDefinitions[1].bestFor, tierDefinitions[2].bestFor],
    },
  ];

  return (
    <div className="relative overflow-x-clip bg-[#FFFBF8]">
      {/* ===== 1. HERO: Editorial split with art collage ===== */}
      <section className="relative border-b border-webzy-tint/70">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(60% 50% at 85% 10%, rgba(225,29,99,0.10) 0%, transparent 60%), radial-gradient(45% 40% at 5% 90%, rgba(201,162,67,0.14) 0%, transparent 65%)',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-9 sm:px-6 sm:py-14 lg:grid-cols-12 lg:gap-10 lg:py-20">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-webzy-primary/25 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-webzy-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-webzy-primary" aria-hidden="true" />
              Launch tariff, GST inclusive
            </p>
            <h1 className="mt-4 font-heading text-[34px] font-extrabold leading-[1.05] tracking-tight text-webzy-ink sm:text-5xl lg:text-6xl">
              {p.headline}
            </h1>
            <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-webzy-ink/75 sm:mt-5 sm:text-lg">
              {p.subtitle}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-3">
              {tierDefinitions.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => jumpToPath(tier.id)}
                  className="group rounded-2xl border border-webzy-ink/10 bg-white/90 p-2.5 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-webzy-primary/45 hover:shadow-md sm:p-4"
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-webzy-ink/55 sm:text-[11px]">
                    {tier.shortName}
                  </span>
                  <span className="mt-1 block text-[10px] font-semibold text-webzy-ink/50 sm:text-xs">
                    from
                  </span>
                  <span className="block font-heading text-lg font-extrabold leading-none text-webzy-ink sm:text-3xl">
                    {tier.fromLabel}
                  </span>
                  <span className="mt-1.5 hidden text-[11px] font-semibold text-webzy-primary group-hover:underline sm:block">
                    See what is inside
                  </span>
                </button>
              ))}
            </div>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-semibold text-webzy-ink/70 sm:text-sm">
              <li className="flex items-center gap-1.5">
                <CheckIcon /> One-time payment
              </li>
              <li className="flex items-center gap-1.5">
                <CheckIcon /> No subscriptions
              </li>
              <li className="flex items-center gap-1.5">
                <CheckIcon /> {baseDays} days hosting included
              </li>
            </ul>
          </div>

          {/* Collage of three art plates, printed-photo style */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto h-[290px] w-full max-w-[440px] sm:h-[380px] sm:max-w-[520px] lg:h-[440px]">
              <div className="absolute left-0 top-8 w-[56%] -rotate-6 rounded-xl bg-white p-1.5 shadow-[0_20px_40px_-18px_rgba(31,20,25,0.35)] sm:p-2">
                <ArtPlate tierId="ready_made" className="aspect-[4/3] rounded-lg" />
                <p className="px-1 pb-0.5 pt-1.5 text-center font-handwritten text-sm text-webzy-ink/70 sm:text-lg">
                  Occasions
                </p>
              </div>
              <div className="absolute right-0 top-0 z-10 w-[58%] rotate-3 rounded-xl bg-white p-1.5 shadow-[0_24px_46px_-18px_rgba(140,107,34,0.45)] sm:p-2">
                <ArtPlate tierId="semi_custom" className="aspect-[4/3] rounded-lg" />
                <p className="px-1 pb-0.5 pt-1.5 text-center font-handwritten text-sm text-[#6B4E12] sm:text-lg">
                  Royal Weddings
                </p>
              </div>
              <div className="absolute bottom-0 left-[16%] z-20 w-[56%] -rotate-1 rounded-xl bg-white p-1.5 shadow-[0_24px_46px_-18px_rgba(31,20,25,0.4)] sm:p-2">
                <ArtPlate tierId="studio_bespoke" className="aspect-[4/3] rounded-lg" />
                <p className="px-1 pb-0.5 pt-1.5 text-center font-handwritten text-sm text-webzy-ink/70 sm:text-lg">
                  Custom Made
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. CHOOSE YOUR PATH: tabbed showcase ===== */}
      <section id="pricing-paths" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-9 sm:px-6 sm:py-16">
        <div className="text-center">
          <OrnamentDivider />
          <h2 className="mt-3 font-heading text-2xl font-bold text-webzy-ink sm:text-4xl">
            Choose your path
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-webzy-ink/70 sm:text-base">
            Three ways to build with Webzy. Tap one to see exactly what it includes, then go
            straight to it.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Product families"
          className="mx-auto mt-6 grid max-w-xl grid-cols-3 gap-1 rounded-full border border-webzy-ink/10 bg-white p-1 shadow-xs sm:mt-8"
        >
          {tierDefinitions.map((tier) => {
            const isActive = selectedTierId === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedTierId(tier.id)}
                className={`min-h-[42px] rounded-full px-2 text-xs font-bold transition sm:text-sm ${
                  isActive
                    ? 'bg-webzy-ink text-white shadow-sm'
                    : 'text-webzy-ink/70 hover:bg-webzy-surface hover:text-webzy-ink'
                }`}
              >
                {tier.shortName}
              </button>
            );
          })}
        </div>

        <div
          key={activeTierConfig.id}
          className={`mx-auto mt-5 grid max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border bg-white shadow-[0_22px_48px_-26px_rgba(31,20,25,0.26)] animate-fade-in sm:mt-6 sm:rounded-3xl lg:grid-cols-12 ${
            activeTierConfig.id === 'semi_custom' ? 'border-[#C9A243]/55' : 'border-webzy-ink/10'
          }`}
        >
          {/* Art side */}
          <div className="relative lg:col-span-5">
            <ArtPlate
              tierId={activeTierConfig.id}
              className="h-[140px] w-full sm:h-[200px] lg:h-full lg:min-h-[380px]"
              imgClassName="transition-transform duration-700 hover:scale-[1.04]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
            <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2 sm:inset-x-4 sm:top-4">
              <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-webzy-ink shadow-xs">
                {activeTierCopy.badge}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold shadow-xs ${
                  activeTierConfig.id === 'studio_bespoke' && !capacity.studio.acceptingOrders
                    ? 'border border-amber-300 bg-amber-50 text-amber-900'
                    : 'border border-emerald-200 bg-emerald-50 text-emerald-900'
                }`}
              >
                {activeTierConfig.meta}
              </span>
            </div>
            <div className="absolute inset-x-4 bottom-4 text-white">
              <p className="font-heading text-xl font-bold drop-shadow sm:text-2xl">
                {activeTierCopy.title}
              </p>
              <p className="mt-0.5 text-xs font-medium text-white/85 sm:text-sm">
                {activeTierConfig.bestFor}
              </p>
            </div>
          </div>

          {/* Details side */}
          <div className="flex flex-col justify-between p-4 sm:p-6 lg:col-span-7 lg:p-8">
            <div>
              <p className="text-xs leading-relaxed text-webzy-ink/80 sm:text-sm">
                {activeTierConfig.blurb}
              </p>

              <div className="mt-3.5 flex flex-wrap items-end gap-x-4 gap-y-1 border-y border-webzy-ink/[0.08] py-3 font-tabular sm:mt-4">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-webzy-ink/50 sm:text-[11px]">
                    {activeTierConfig.id === 'studio_bespoke' ? 'Business sites' : 'Price'}
                  </span>
                  <span className="font-heading text-3xl font-extrabold leading-none text-webzy-ink sm:text-4xl">
                    {activeTierConfig.priceLabel}
                  </span>
                </div>
                <span className="pb-1 text-xs font-medium text-webzy-ink/45 line-through sm:text-sm">
                  {activeTierConfig.id === 'studio_bespoke' ? '' : activeTierConfig.compareLabel}
                </span>
                {activeTierConfig.id === 'studio_bespoke' ? (
                  <span className="pb-1 text-xs font-semibold text-webzy-ink/70 sm:text-sm">
                    {activeTierConfig.compareLabel}
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-xs font-medium text-webzy-ink/65 sm:text-sm">
                {activeTierConfig.supportsAddons
                  ? `${baseDays} days hosting included. Optional ${lifetimeLabel} Lifetime Hosting.`
                  : `Lifetime ${lifetimeLabel} applies to Ready-Made sites only. Custom Made is quoted per build.`}
              </p>

              <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1.5 text-xs text-webzy-ink/85 sm:grid-cols-2 sm:gap-y-2 sm:text-[13px]">
                {activeTierCopy.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {activeTierConfig.id === 'studio_bespoke' &&
              !capacity.studio.acceptingOrders &&
              capacity.studio.capacityMessage ? (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-xs font-medium leading-snug text-amber-950">
                  {capacity.studio.capacityMessage}
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href={activeTierConfig.ctaHref}
                onClick={() => persistPreferredAddons(selectedAddons)}
                className={`btn-spring inline-flex min-h-[46px] flex-1 items-center justify-center rounded-full px-6 text-sm font-bold shadow-md transition hover:opacity-95 ${
                  activeTierConfig.id === 'semi_custom'
                    ? 'bg-[#1A1317] text-[#F5E0A3]'
                    : 'bg-webzy-primary text-white'
                }`}
              >
                {activeTierConfig.id === 'studio_bespoke' && !capacity.studio.acceptingOrders
                  ? 'Check batch status'
                  : activeTierCopy.ctaLabel}
              </Link>
              {activeTierConfig.id === 'semi_custom' ? (
                <Link
                  href="/weddings#custom-wedding"
                  onClick={() => persistPreferredAddons(selectedAddons)}
                  className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-[#C9A243]/45 bg-[#FAF6EE] px-5 text-xs font-bold text-[#5D4314] transition hover:border-[#8C6B22] sm:text-sm"
                >
                  Bespoke from {formatInr(catalogPricing.customMade.customWeddingStartingInr)}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. SIDE-BY-SIDE COMPARISON ===== */}
      <section className="border-y border-webzy-tint/70 bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-webzy-primary">
              Side by side
            </p>
            <h2 className="mt-1.5 font-heading text-2xl font-bold text-webzy-ink sm:text-4xl">
              Compare in one glance
            </h2>
          </div>

          <div className="-mx-4 mt-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="min-w-[620px] overflow-hidden rounded-2xl border border-webzy-ink/10 bg-white shadow-xs sm:rounded-3xl">
              <div className="grid grid-cols-[1.05fr_1fr_1fr_1fr] border-b border-webzy-ink/10 bg-webzy-surface/60 text-xs font-bold text-webzy-ink sm:text-sm">
                <div className="p-3.5 sm:p-5" />
                {tierDefinitions.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => navigateToTier(tier.ctaHref)}
                    className={`p-3.5 text-left transition hover:text-webzy-primary sm:p-5 ${
                      tier.id === 'semi_custom' ? 'bg-[#FAF3E2]/70' : ''
                    }`}
                  >
                    <span className="block font-heading text-sm sm:text-lg">{tier.shortName}</span>
                    <span className="mt-0.5 block text-[11px] font-semibold text-webzy-primary">
                      Open page
                    </span>
                  </button>
                ))}
              </div>
              {comparisonRows.map((row, rowIdx) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[1.05fr_1fr_1fr_1fr] text-xs text-webzy-ink/85 sm:text-sm ${
                    rowIdx % 2 === 1 ? 'bg-webzy-surface/30' : ''
                  }`}
                >
                  <div className="p-3.5 font-bold text-webzy-ink sm:p-5">{row.label}</div>
                  {row.values.map((value, colIdx) => (
                    <div
                      key={`${row.label}-${colIdx}`}
                      className={`p-3.5 leading-snug sm:p-5 ${
                        colIdx === 1 ? 'bg-[#FAF3E2]/45' : ''
                      }`}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4. HOSTING TIMELINE + ADD-ONS ESTIMATOR ===== */}
      <section className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-webzy-primary">
            {p.optionalExtrasEyebrow}
          </p>
          <h2 className="mt-1.5 font-heading text-2xl font-bold text-webzy-ink sm:text-4xl">
            How long should your link live?
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-webzy-ink/70 sm:text-base">
            {p.addonsSubhead}
          </p>
        </div>

        <div className="mt-5 inline-flex w-full flex-wrap gap-1 rounded-2xl border border-webzy-tint bg-white p-1 sm:w-auto">
          {tierDefinitions.map((tier) => (
            <button
              key={tier.id}
              type="button"
              aria-pressed={selectedTierId === tier.id}
              onClick={() => setSelectedTierId(tier.id)}
              className={`min-h-[38px] flex-1 rounded-xl px-4 text-xs font-bold transition sm:flex-initial ${
                selectedTierId === tier.id
                  ? 'bg-webzy-primary text-white'
                  : 'text-webzy-ink/70 hover:bg-webzy-surface'
              }`}
            >
              {tier.shortName}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-3xl border border-webzy-ink/10 bg-white p-4 shadow-sm sm:p-8">
          {!activeTierConfig.supportsAddons ? (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs font-medium leading-relaxed text-amber-950">
              The {lifetimeLabel} Lifetime Hosting option and checkout extras apply to Ready-Made
              Occasion and Royal Wedding sites only. Custom Made builds are quoted per project, with
              optional custom domains passed through at registrar actuals.
            </div>
          ) : null}

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-[12.5%] right-[12.5%] top-[19px] h-[3px] rounded-full bg-webzy-ink/10" />
            <div
              className="absolute left-[12.5%] top-[19px] h-[3px] rounded-full bg-emerald-600 transition-all duration-500"
              style={{
                width: `${activeTierConfig.supportsAddons ? (activeStepIdx / (timelineSteps.length - 1)) * 75 : 0}%`,
              }}
            />
            <div className="relative grid grid-cols-4 gap-1">
              {timelineSteps.map((step, idx) => {
                const reached = activeTierConfig.supportsAddons && idx <= activeStepIdx;
                const isCurrent = activeTierConfig.supportsAddons && idx === activeStepIdx;
                const disabled = !activeTierConfig.supportsAddons;
                return (
                  <button
                    key={step.title}
                    type="button"
                    disabled={disabled}
                    aria-pressed={isCurrent}
                    onClick={() => selectValidityAddon(step.id)}
                    className="group flex flex-col items-center text-center disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-extrabold transition ${
                        reached
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-webzy-ink/20 bg-white text-webzy-ink/60 group-hover:border-emerald-500'
                      } ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}`}
                    >
                      {step.id === 'lifetime' ? (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.2 12c0 2-1.6 3.5-3.6 3.5S11 12 9 12s-3.2 1.5-3.2 3.5M5.8 12c0-2 1.6-3.5 3.6-3.5S13 12 15 12s3.2-1.5 3.2-3.5" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <span className="mt-2 text-xs font-bold text-webzy-ink sm:text-sm">
                      {step.title}
                    </span>
                    <span className="text-[10px] font-medium text-webzy-ink/55 sm:text-xs">
                      {step.subtitle}
                    </span>
                    <span
                      className={`mt-1 font-tabular text-xs font-extrabold sm:text-sm ${
                        reached ? 'text-emerald-700' : 'text-webzy-ink/70'
                      }`}
                    >
                      {step.priceLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature add-ons */}
          <div className="mt-7 grid grid-cols-1 gap-2.5 border-t border-webzy-ink/[0.08] pt-6 sm:grid-cols-2 sm:gap-4">
            {FEATURE_ADDON_IDS.map((addonId) => {
              const addonCopy = p.addons[addonId];
              const catalog = ADDON_CATALOG[addonId];
              const isSelected = selectedAddons.includes(addonId);
              const disabledForTier = !activeTierConfig.supportsAddons;
              return (
                <button
                  key={addonId}
                  type="button"
                  aria-pressed={isSelected && !disabledForTier}
                  disabled={disabledForTier}
                  onClick={() => toggleFeatureAddon(addonId)}
                  className={`flex items-start justify-between gap-3 rounded-2xl border-2 p-3.5 text-left transition disabled:cursor-not-allowed disabled:opacity-55 sm:p-5 ${
                    isSelected && !disabledForTier
                      ? 'border-emerald-600 bg-emerald-50/60 ring-4 ring-emerald-500/15'
                      : 'border-webzy-ink/10 bg-white hover:border-emerald-500/50'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-webzy-ink/55">
                      {addonCopy.badge}
                    </span>
                    <h3 className="font-heading text-sm font-bold text-webzy-ink sm:text-lg">
                      {addonCopy.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-webzy-ink/70 sm:text-sm">
                      {addonCopy.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right font-tabular">
                    <span className="block font-heading text-base font-extrabold text-webzy-ink sm:text-xl">
                      +{formatInr(catalog.priceInr)}
                    </span>
                    <span className="block text-[11px] text-webzy-ink/40 line-through">
                      {formatInr(catalog.compareAtInr)}
                    </span>
                    <span
                      className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        isSelected && !disabledForTier
                          ? 'bg-emerald-600 text-white'
                          : 'border border-webzy-ink/15 text-webzy-ink/65'
                      }`}
                    >
                      {isSelected && !disabledForTier ? p.addedLabel : p.addLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live estimate bar */}
        <div className="sticky bottom-3 z-20 mt-5">
          <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-webzy-ink/10 bg-white/95 p-4 shadow-[0_18px_40px_-16px_rgba(31,20,25,0.3)] backdrop-blur-sm sm:flex-row sm:items-center sm:p-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-webzy-primary">
                {p.yourSelectedPlan}
              </p>
              <p className="font-heading text-lg font-bold text-webzy-ink sm:text-xl">
                {activeTierCopy.title}
                {activeTierConfig.supportsAddons && selectedAddons.length > 0
                  ? ` (+${selectedAddons.length})`
                  : ''}
              </p>
            </div>
            <div className="flex w-full items-center justify-between gap-4 sm:w-auto">
              <div className="font-tabular sm:text-right">
                <p className="text-[11px] font-semibold text-webzy-ink/60">{p.estimatedTotal}</p>
                <p className="font-heading text-2xl font-extrabold text-emerald-700">
                  {activeTierConfig.id === 'studio_bespoke' || activeTierConfig.id === 'ready_made'
                    ? `${p.fromPrefix} ${formatInr(estimatedTotalInr)}`
                    : formatInr(estimatedTotalInr)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateToTier(activeTierConfig.ctaHref)}
                className="btn-spring inline-flex min-h-[48px] items-center justify-center rounded-full bg-webzy-primary px-5 text-sm font-bold text-white shadow-md transition hover:opacity-95 sm:px-6"
              >
                Continue
              </button>
            </div>
          </div>
        </div>

        {selectedAddons.length > 0 ? (
          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => setSelectedAddons([])}
              className="min-h-[40px] text-xs font-bold text-webzy-ink/60 underline hover:text-webzy-ink"
            >
              {p.clearExtras}
            </button>
          </div>
        ) : null}
      </section>

      {/* ===== 5. LAUNCH ECONOMICS: dark editorial band ===== */}
      <section className="bg-webzy-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5E0A3]">
              Where your rupee goes
            </p>
            <h2 className="mt-1.5 font-heading text-2xl font-bold sm:text-4xl">
              Why launch prices start this low
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-white/70 sm:text-base">
              Every rupee is split between the craft of the build and the infrastructure that keeps
              your link online. Nothing hidden, nothing recurring.
            </p>
          </div>

        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="font-heading text-2xl font-extrabold text-white/20 sm:text-4xl">01</span>
                <CraftMarginArtSvg />
              </div>
              <h3 className="mt-2 font-heading text-sm font-bold leading-snug sm:mt-3 sm:text-lg">Accessible first, no retainers</h3>
              <p className="mt-1 text-xs leading-snug text-white/70 sm:mt-1.5 sm:text-sm sm:leading-relaxed">
                Occasions start at {formatInr(catalogPricing.occasions.minInr)} and wedding suites
                at {formatInr(catalogPricing.weddings.minInr)}, kept at minimal margin so anyone can
                send a crafted page instead of a generic forward.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="font-heading text-2xl font-extrabold text-white/20 sm:text-4xl">02</span>
                <HostingLinkArtSvg />
              </div>
              <h3 className="mt-2 font-heading text-sm font-bold leading-snug sm:mt-3 sm:text-lg">Free standard link hosting</h3>
              <p className="mt-1 text-xs leading-snug text-white/70 sm:mt-1.5 sm:text-sm sm:leading-relaxed">
                Clean <code className="font-mono text-xs text-[#F5E0A3]">/s/slug</code> and{' '}
                <code className="font-mono text-xs text-[#F5E0A3]">/i/slug</code> links stay free
                for {baseDays} days. Extend to 14 or 21 days, or keep a Ready-Made site forever
                for {lifetimeLabel}.
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.05] p-3 sm:p-6 md:col-span-1">
              <div className="flex items-center justify-between gap-3">
                <span className="font-heading text-2xl font-extrabold text-white/20 sm:text-4xl">03</span>
                <DomainCompassArtSvg />
              </div>
              <h3 className="mt-2 font-heading text-sm font-bold leading-snug sm:mt-3 sm:text-lg">Custom domains at actuals</h3>
              <p className="mt-1 text-xs leading-snug text-white/70 sm:mt-1.5 sm:text-sm sm:leading-relaxed">
                {catalogPricing.customMade.domainPassThroughNote}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 6. PROMISES + FINAL CTA ===== */}
      <section className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-16">
        <div className="text-center">
          <OrnamentDivider />
          <h2 className="mt-3 font-heading text-2xl font-bold text-webzy-ink sm:text-4xl">
            Our promises
          </h2>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4 lg:grid-cols-4">
          {p.guarantees.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-webzy-ink/10 bg-white p-3.5 shadow-xs sm:p-5"
            >
              <CheckIcon className="h-5 w-5 text-emerald-600" />
              <p className="mt-2 text-xs font-bold text-webzy-ink sm:text-base">{item.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-webzy-ink/70 sm:text-sm">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="relative mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-webzy-primary via-[#C2185B] to-[#7A1040] p-6 text-white shadow-[0_28px_60px_-24px_rgba(225,29,99,0.5)] sm:mt-12 sm:p-12">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-14 left-1/3 h-40 w-40 rounded-full bg-white/10"
            aria-hidden="true"
          />
          <div className="relative max-w-xl">
            <h2 className="font-heading text-2xl font-bold sm:text-4xl">
              Ready when you are.
            </h2>
            <p className="mt-2 text-sm text-white/85 sm:text-base">
              Start with a theme from {formatInr(catalogPricing.occasions.minInr)}, or tell us what
              you want built.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => navigateToTier('/themes')}
                className="btn-spring inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-webzy-primary shadow-md transition hover:bg-zinc-50"
              >
                Browse occasion themes
              </button>
              <button
                type="button"
                onClick={() => navigateToTier('/weddings')}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/40 px-6 text-sm font-bold text-white transition hover:bg-white/10"
              >
                See wedding editions
              </button>
              <button
                type="button"
                onClick={() => navigateToTier('/studio')}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/40 px-6 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Talk about a custom build
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
