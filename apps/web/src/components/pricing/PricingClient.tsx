'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const FEATURE_ADDON_IDS: readonly AddonId[] = ['pin'];
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
  const addonsHydratedRef = useRef(false);

  // Restore any previously chosen add-ons (ignoring legacy 90d extend)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREFERRED_ADDONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          const rawValid = parsed.filter(
            (item): item is AddonId =>
              typeof item === 'string' &&
              (item === 'pin' ||
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
      }
    } catch {
      // Ignore storage read errors
    } finally {
      addonsHydratedRef.current = true;
    }
  }, []);

  // Persist chosen add-ons so CheckoutClient pre-selects them automatically
  useEffect(() => {
    if (!addonsHydratedRef.current) return;
    try {
      if (selectedAddons.length > 0) {
        window.localStorage.setItem(PREFERRED_ADDONS_KEY, JSON.stringify(selectedAddons));
      } else {
        window.localStorage.removeItem(PREFERRED_ADDONS_KEY);
      }
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
      label: 'Secret PIN lock',
      values: ['Optional add-on (+₹9)', 'Optional add-on (+₹9)', 'Scoped in your quote'],
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
    <div className="relative overflow-x-clip bg-[#FCF9F4]">
      {/* ===== 1. HERO: Editorial split with interactive printed-folio collage ===== */}
      <section className="relative border-b border-webzy-ink/[0.08] bg-gradient-to-b from-white via-[#FCF9F4] to-[#FAF4EC]">
        <div
          className="pointer-events-none absolute inset-0 opacity-65"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(55% 48% at 84% 12%, rgba(225,29,99,0.07) 0%, transparent 60%), radial-gradient(45% 40% at 8% 88%, rgba(201,162,67,0.12) 0%, transparent 65%)',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-7 px-4 py-8 sm:px-6 sm:py-11 lg:grid-cols-12 lg:gap-10 lg:py-14">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-webzy-ink/12 bg-white px-3.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-webzy-primary shadow-2xs">
              ONE-TIME PRICING · GST INCLUDED
            </p>
            <h1 className="mt-3.5 font-heading text-[32px] font-extrabold leading-[1.06] tracking-tight text-webzy-ink sm:text-5xl lg:text-[52px]">
              {p.headline}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-webzy-ink/70 sm:mt-4 sm:text-base lg:text-lg">
              {p.subtitle}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-7 sm:gap-3">
              {tierDefinitions.map((tier) => {
                const isSelected = selectedTierId === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => jumpToPath(tier.id)}
                    className={`group rounded-2xl border p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 sm:p-4 ${
                      isSelected
                        ? 'border-webzy-ink bg-webzy-ink text-white shadow-md'
                        : 'border-webzy-ink/10 bg-white text-webzy-ink shadow-2xs hover:border-webzy-primary/45 hover:shadow-md'
                    }`}
                  >
                    <span
                      className={`block font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] sm:text-[10.5px] ${
                        isSelected ? 'text-[#F5E0A3]' : 'text-webzy-ink/50'
                      }`}
                    >
                      {tier.shortName}
                    </span>
                    <span
                      className={`mt-1 block text-[10px] font-medium sm:text-[11px] ${
                        isSelected ? 'text-white/70' : 'text-webzy-ink/45'
                      }`}
                    >
                      from
                    </span>
                    <span className="block font-heading text-lg font-extrabold leading-none font-tabular sm:text-[26px]">
                      {tier.fromLabel}
                    </span>
                    <span
                      className={`mt-2 hidden text-[11px] font-semibold group-hover:underline sm:block ${
                        isSelected ? 'text-white/90' : 'text-webzy-primary'
                      }`}
                    >
                      Inspect plan →
                    </span>
                  </button>
                );
              })}
            </div>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-semibold text-webzy-ink/75 sm:text-[13px]">
              <li className="flex items-center gap-1.5">
                <CheckIcon /> One-time UPI or Card
              </li>
              <li className="flex items-center gap-1.5">
                <CheckIcon /> Zero monthly renewals
              </li>
              <li className="flex items-center gap-1.5">
                <CheckIcon /> Free 24h post-publish edits
              </li>
            </ul>
          </div>

          {/* Interactive printed-photo collage (tap any plate to inspect that tier) */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto h-[270px] w-full max-w-[430px] sm:h-[360px] sm:max-w-[500px] lg:h-[400px]">
              <button
                type="button"
                onClick={() => jumpToPath('ready_made')}
                className="group absolute left-0 top-7 w-[55%] -rotate-6 rounded-2xl border border-webzy-ink/[0.08] bg-white p-1.5 text-left shadow-[0_20px_40px_-18px_rgba(31,20,25,0.32)] transition duration-300 hover:z-30 hover:-rotate-2 hover:scale-[1.03] sm:p-2"
              >
                <ArtPlate tierId="ready_made" className="aspect-[4/3] rounded-xl" />
                <p className="px-1 pb-0.5 pt-1.5 text-center font-handwritten text-sm text-webzy-ink/75 sm:text-lg">
                  Occasions · from {tierDefinitions[0].fromLabel}
                </p>
              </button>
              <button
                type="button"
                onClick={() => jumpToPath('semi_custom')}
                className="group absolute right-0 top-0 z-10 w-[57%] rotate-3 rounded-2xl border border-[#C9A243]/40 bg-white p-1.5 text-left shadow-[0_24px_46px_-18px_rgba(140,107,34,0.42)] transition duration-300 hover:z-30 hover:rotate-1 hover:scale-[1.03] sm:p-2"
              >
                <ArtPlate tierId="semi_custom" className="aspect-[4/3] rounded-xl" />
                <p className="px-1 pb-0.5 pt-1.5 text-center font-handwritten text-sm text-[#6B4E12] sm:text-lg">
                  Royal Weddings · {tierDefinitions[1].fromLabel}
                </p>
              </button>
              <button
                type="button"
                onClick={() => jumpToPath('studio_bespoke')}
                className="group absolute bottom-0 left-[17%] z-20 w-[55%] -rotate-1 rounded-2xl border border-webzy-ink/[0.08] bg-white p-1.5 text-left shadow-[0_24px_46px_-18px_rgba(31,20,25,0.38)] transition duration-300 hover:z-30 hover:rotate-0 hover:scale-[1.03] sm:p-2"
              >
                <ArtPlate tierId="studio_bespoke" className="aspect-[4/3] rounded-xl" />
                <p className="px-1 pb-0.5 pt-1.5 text-center font-handwritten text-sm text-webzy-ink/75 sm:text-lg">
                  Custom Made · from {tierDefinitions[2].fromLabel}
                </p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. CHOOSE YOUR PATH: tabbed showcase ===== */}
      <section id="pricing-paths" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-9 sm:px-6 sm:py-14">
        <div className="text-center">
          <OrnamentDivider />
          <h2 className="mt-3 font-heading text-2xl font-bold text-webzy-ink sm:text-4xl">
            Choose your path
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-webzy-ink/65 sm:text-base">
            Three clear ways to build with Webzy. Switch tabs to inspect every inclusion before you begin.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Product families"
          className="mx-auto mt-6 grid max-w-xl grid-cols-3 gap-1 rounded-full border border-webzy-ink/10 bg-white p-1 shadow-2xs sm:mt-7"
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
                    : 'text-webzy-ink/70 hover:bg-[#FAF6F0] hover:text-webzy-ink'
                }`}
              >
                {tier.shortName}
              </button>
            );
          })}
        </div>

        <div
          key={activeTierConfig.id}
          className={`mx-auto mt-5 grid max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border bg-white shadow-[0_22px_48px_-26px_rgba(31,20,25,0.22)] animate-fade-in sm:mt-6 sm:rounded-3xl lg:grid-cols-12 ${
            activeTierConfig.id === 'semi_custom' ? 'border-[#C9A243]/55' : 'border-webzy-ink/10'
          }`}
        >
          {/* Art side */}
          <div className="relative lg:col-span-5">
            <ArtPlate
              tierId={activeTierConfig.id}
              className="h-[170px] w-full sm:h-[220px] lg:h-full lg:min-h-[380px]"
              imgClassName="transition-transform duration-700 hover:scale-[1.04]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/15" />
            <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2 sm:inset-x-4 sm:top-4">
              <span className="rounded-full bg-white/95 px-3 py-1 text-[10.5px] font-bold text-webzy-ink shadow-xs">
                {activeTierCopy.badge}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-[10.5px] font-bold shadow-xs ${
                  activeTierConfig.id === 'studio_bespoke' && !capacity.studio.acceptingOrders
                    ? 'border border-amber-300 bg-amber-50 text-amber-900'
                    : 'border border-white/25 bg-black/45 text-white backdrop-blur-xs'
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
              <p className="text-xs leading-relaxed text-webzy-ink/75 sm:text-sm">
                {activeTierConfig.blurb}
              </p>

              <div className="mt-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-y border-webzy-ink/[0.08] py-3.5 font-tabular">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <div>
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-webzy-ink/50">
                      {activeTierConfig.id === 'studio_bespoke' ? 'Business builds' : 'One-time price'}
                    </span>
                    <span className="font-heading text-3xl font-extrabold leading-none text-webzy-ink sm:text-4xl">
                      {activeTierConfig.priceLabel}
                    </span>
                  </div>
                  {activeTierConfig.id === 'semi_custom' ? (
                    <span className="text-xs font-medium text-webzy-ink/40 line-through sm:text-sm">
                      {activeTierConfig.compareLabel}
                    </span>
                  ) : activeTierConfig.id === 'studio_bespoke' ? (
                    <span className="text-xs font-semibold text-webzy-ink/70 sm:text-sm">
                      · {activeTierConfig.compareLabel}
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                      Launch pricing · GST incl.
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-webzy-ink/55">
                  {activeTierConfig.delivery}
                </span>
              </div>

              <p className="mt-3 text-xs font-medium text-webzy-ink/65 sm:text-sm">
                {activeTierConfig.supportsAddons
                  ? `${baseDays} days hosting included. Optional ${lifetimeLabel} Lifetime Hosting available at checkout.`
                  : `Lifetime ${lifetimeLabel} applies to Ready-Made sites only. Custom Made sites include dedicated deployment options.`}
              </p>

              <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-xs text-webzy-ink/85 sm:grid-cols-2 sm:text-[13px]">
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

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link
                href={activeTierConfig.ctaHref}
                onClick={() => persistPreferredAddons(selectedAddons)}
                className={`btn-spring inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full px-6 text-sm font-bold shadow-md transition hover:opacity-95 ${
                  activeTierConfig.id === 'semi_custom'
                    ? 'bg-[#1A1317] text-[#F5E0A3]'
                    : 'bg-webzy-primary text-white'
                }`}
              >
                {activeTierConfig.id === 'studio_bespoke' && !capacity.studio.acceptingOrders
                  ? 'Join Priority Waitlist →'
                  : activeTierCopy.ctaLabel}
              </Link>
              {activeTierConfig.id === 'semi_custom' ? (
                <Link
                  href="/weddings#custom-wedding"
                  onClick={() => persistPreferredAddons(selectedAddons)}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#C9A243]/45 bg-[#FAF6EE] px-5 text-xs font-bold text-[#5D4314] transition hover:border-[#8C6B22] sm:text-sm"
                >
                  Bespoke from {formatInr(catalogPricing.customMade.customWeddingStartingInr)}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. SIDE-BY-SIDE COMPARISON ===== */}
      <section className="border-y border-webzy-ink/[0.08] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-14">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-webzy-primary">
                SIDE BY SIDE
              </p>
              <h2 className="mt-1 font-heading text-2xl font-bold text-webzy-ink sm:text-4xl">
                Compare in one glance
              </h2>
            </div>
            <p className="text-xs font-medium text-webzy-ink/55">
              All prices include 18% GST · No hidden setup fees
            </p>
          </div>

          <div className="-mx-4 mt-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="min-w-[620px] overflow-hidden rounded-2xl border border-webzy-ink/10 bg-white shadow-2xs sm:rounded-3xl">
              <div className="grid grid-cols-[1.05fr_1fr_1fr_1fr] border-b border-webzy-ink/10 bg-[#FAF6F0] text-xs font-bold text-webzy-ink sm:text-sm">
                <div className="p-3.5 sm:p-5" />
                {tierDefinitions.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => navigateToTier(tier.ctaHref)}
                    className={`p-3.5 text-left transition hover:text-webzy-primary sm:p-5 ${
                      tier.id === 'semi_custom' ? 'bg-[#F7EEDB]/80' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-heading text-sm sm:text-lg">{tier.shortName}</span>
                      {tier.id === 'semi_custom' ? (
                        <span className="rounded-full bg-[#1A1317] px-2 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-wider text-[#F5E0A3]">
                          Popular
                        </span>
                      ) : null}
                    </div>
                    <span className="mt-0.5 block text-[11px] font-semibold text-webzy-primary">
                      Explore collection →
                    </span>
                  </button>
                ))}
              </div>
              {comparisonRows.map((row, rowIdx) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[1.05fr_1fr_1fr_1fr] text-xs text-webzy-ink/85 sm:text-sm ${
                    rowIdx % 2 === 1 ? 'bg-[#FCF9F4]/70' : ''
                  }`}
                >
                  <div className="p-3.5 font-bold text-webzy-ink sm:p-5">{row.label}</div>
                  {row.values.map((value, colIdx) => (
                    <div
                      key={`${row.label}-${colIdx}`}
                      className={`p-3.5 leading-snug sm:p-5 ${
                        colIdx === 1 ? 'bg-[#FAF3E2]/45 font-medium' : ''
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
      <section className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-14">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-webzy-primary">
              {p.optionalExtrasEyebrow}
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-webzy-ink sm:text-4xl">
              How long should your link live?
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-webzy-ink/65 sm:text-base">
              {p.addonsSubhead}
            </p>
          </div>

          <div className="inline-flex w-full shrink-0 gap-1 rounded-full border border-webzy-ink/10 bg-white p-1 sm:w-auto">
            {tierDefinitions.map((tier) => (
              <button
                key={tier.id}
                type="button"
                aria-pressed={selectedTierId === tier.id}
                onClick={() => setSelectedTierId(tier.id)}
                className={`min-h-[36px] flex-1 rounded-full px-3.5 text-xs font-bold transition sm:flex-initial ${
                  selectedTierId === tier.id
                    ? 'bg-webzy-ink text-white'
                    : 'text-webzy-ink/70 hover:bg-[#FAF6F0]'
                }`}
              >
                {tier.shortName}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-webzy-ink/10 bg-white p-4 shadow-xs sm:p-8">
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

          {/* Feature add-on (Secret PIN Lock) */}
          <div className="mt-7 grid grid-cols-1 gap-2.5 border-t border-webzy-ink/[0.08] pt-6 sm:gap-4">
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
                      ? 'border-emerald-600 bg-emerald-50/50 ring-4 ring-emerald-500/12'
                      : 'border-webzy-ink/10 bg-[#FCF9F4]/50 hover:border-emerald-500/50 hover:bg-white'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-webzy-ink/50">
                      {addonCopy.badge}
                    </span>
                    <h3 className="mt-0.5 font-heading text-sm font-bold text-webzy-ink sm:text-lg">
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
          <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-webzy-ink/12 bg-white/95 p-4 shadow-[0_18px_40px_-16px_rgba(31,20,25,0.28)] backdrop-blur-md sm:flex-row sm:items-center sm:p-5">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-webzy-primary">
                {p.yourSelectedPlan}
              </p>
              <p className="font-heading text-lg font-bold text-webzy-ink sm:text-xl">
                {activeTierCopy.title}
                {activeTierConfig.supportsAddons && selectedAddons.length > 0
                  ? ` (+${selectedAddons.length} extra${selectedAddons.length === 1 ? '' : 's'})`
                  : ''}
              </p>
            </div>
            <div className="flex w-full items-center justify-between gap-4 sm:w-auto">
              <div className="font-tabular sm:text-right">
                <p className="text-[11px] font-semibold text-webzy-ink/55">{p.estimatedTotal}</p>
                <p className="font-heading text-2xl font-extrabold text-emerald-700">
                  {activeTierConfig.id === 'studio_bespoke' || activeTierConfig.id === 'ready_made'
                    ? `${p.fromPrefix} ${formatInr(estimatedTotalInr)}`
                    : formatInr(estimatedTotalInr)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateToTier(activeTierConfig.ctaHref)}
                className="btn-spring inline-flex min-h-[46px] items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white shadow-md transition hover:opacity-95"
              >
                Continue →
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

      {/* ===== 5. PROMISES + PRICING FAQ + FINAL CTA ===== */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="text-center">
          <OrnamentDivider />
          <h2 className="mt-3 font-heading text-2xl font-bold text-webzy-ink sm:text-4xl">
            Included with every Webzy
          </h2>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4 lg:grid-cols-4">
          {p.guarantees.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-webzy-ink/[0.09] bg-white p-3.5 shadow-2xs sm:p-5"
            >
              <CheckIcon className="h-5 w-5 text-emerald-600" />
              <p className="mt-2 text-xs font-bold text-webzy-ink sm:text-base">{item.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-webzy-ink/70 sm:text-sm">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        {/* Common Pricing Questions */}
        <div className="mx-auto mt-10 max-w-3xl sm:mt-14">
          <p className="text-center font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-webzy-primary">
            COMMON QUESTIONS
          </p>
          <h3 className="mt-1 text-center font-heading text-xl font-bold text-webzy-ink sm:text-2xl">
            Pricing &amp; hosting details
          </h3>
          <div className="mt-5 space-y-2.5">
            {[
              {
                q: 'Are there any recurring monthly or hidden fees?',
                a: 'Never. Every Ready-Made Occasion and Royal Wedding purchase is a single GST-inclusive payment via UPI or Card. You only pay again if you voluntarily choose to extend hosting.',
              },
              {
                q: 'What happens after the included 7 days?',
                a: 'Your page gracefully shows an archived message after 7 days unless you choose 14 Days (+₹9), 21 Days (+₹14), or Lifetime Hosting (+₹500 for Ready-Made sites) during checkout.',
              },
              {
                q: 'Can I preview my personalized site before paying?',
                a: 'Yes. You can add all your photos, names, and messages and interact with a full live preview on your phone before paying a single rupee.',
              },
              {
                q: 'How does payment work for Custom Made websites?',
                a: 'Start with a free brief or 15-minute call — zero advance needed to inquire. We share an exact fixed quote and interactive prototype before you commit.',
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-webzy-ink/[0.09] bg-white px-5 py-3 shadow-2xs"
              >
                <summary className="flex min-h-[42px] cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-webzy-ink">
                  <span>{item.q}</span>
                  <span className="text-webzy-primary transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="pb-1.5 pt-1 text-xs leading-relaxed text-webzy-ink/70 sm:text-sm">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Architectural Final CTA */}
        <div className="relative mt-10 overflow-hidden rounded-3xl bg-[#1A1614] p-6 text-white shadow-xl sm:mt-14 sm:p-11">
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-webzy-primary/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#E4C285]">
                START IN MINUTES
              </p>
              <h2 className="mt-1.5 font-heading text-2xl font-bold sm:text-4xl">
                Ready when you are.
              </h2>
              <p className="mt-2 text-sm text-white/75 sm:text-base">
                Personalize a ready-made keepsake from {formatInr(catalogPricing.occasions.minInr)},
                or commission our atelier for a custom-built website.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => navigateToTier('/themes')}
                className="btn-spring inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-[#1A1614] shadow-md transition hover:bg-[#F5EFE6]"
              >
                Browse occasion themes
              </button>
              <button
                type="button"
                onClick={() => navigateToTier('/weddings')}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#E4C285]/45 px-6 text-sm font-bold text-[#F5E0A3] transition hover:bg-white/10"
              >
                See wedding editions
              </button>
              <button
                type="button"
                onClick={() => navigateToTier('/studio')}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/25 px-6 text-sm font-bold text-white transition hover:bg-white/10"
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
