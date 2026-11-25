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
  VALIDITY_EXTENSION_ADDON_IDS,
  type ValidityAddonId,
} from '@webzy/core';
import { useLanguage } from '../shell/LanguageProvider';

type PricingTierId = 'ready_made' | 'semi_custom' | 'studio_bespoke';

interface PricingTierConfig {
  id: PricingTierId;
  isPopular: boolean;
  priceLabel: string;
  compareLabel: string;
  sampleBaseInr: number;
  supportsAddons: boolean;
  ctaHref: string;
}

const TIER_CONFIGS: readonly PricingTierConfig[] = [
  {
    id: 'ready_made',
    isPopular: false,
    priceLabel: '₹29 – ₹99',
    compareLabel: '₹99 – ₹249',
    sampleBaseInr: 49,
    supportsAddons: true,
    ctaHref: '/themes',
  },
  {
    id: 'semi_custom',
    isPopular: true,
    priceLabel: '₹499',
    compareLabel: '₹1,499',
    sampleBaseInr: 499,
    supportsAddons: true,
    ctaHref: '/weddings',
  },
  {
    id: 'studio_bespoke',
    isPopular: false,
    priceLabel: '₹1,499+',
    compareLabel: '₹2,999+',
    sampleBaseInr: 1499,
    supportsAddons: false,
    ctaHref: '/studio',
  },
] as const;

const FEATURE_ADDON_IDS: readonly AddonId[] = ['pin', 'video'];
const VALIDITY_PILL_LABELS: Record<ValidityAddonId, string> = {
  extend_14d: '14 Days',
  extend_21d: '21 Days',
  extend: '3 Months',
};
const PREFERRED_ADDONS_KEY = 'webzy_preferred_addons';

export function PricingClient() {
  const router = useRouter();
  const { language } = useLanguage();
  const site = getSiteCopy(language);
  const p = site.pricing;

  const [selectedTierId, setSelectedTierId] = useState<PricingTierId>('semi_custom');
  const [selectedAddons, setSelectedAddons] = useState<AddonId[]>([]);

  // Restore any previously chosen add-ons
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREFERRED_ADDONS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const rawValid = parsed.filter(
          (item): item is AddonId =>
            typeof item === 'string' &&
            (item === 'pin' || item === 'video' || isValidityAddonId(item)),
        );
        const chosenValidity = (['extend', 'extend_21d', 'extend_14d'] as const).find((vId) =>
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

  const activeTierConfig =
    TIER_CONFIGS.find((t) => t.id === selectedTierId) ?? TIER_CONFIGS[1];
  const activeTierCopy = p.tiers[activeTierConfig.id];

  const addonsTotalInr = useMemo(() => {
    if (!activeTierConfig.supportsAddons) return 0;
    return selectedAddons.reduce((sum, id) => sum + (ADDON_CATALOG[id]?.priceInr ?? 0), 0);
  }, [activeTierConfig.supportsAddons, selectedAddons]);

  const estimatedTotalInr = activeTierConfig.sampleBaseInr + addonsTotalInr;

  function toggleAddon(id: AddonId) {
    setSelectedAddons((prev) => {
      if (isValidityAddonId(id)) {
        const already = prev.includes(id);
        const withoutValidity = prev.filter((item) => !isValidityAddonId(item));
        return already ? withoutValidity : [...withoutValidity, id];
      }
      return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
    });
  }

  function handleContinueWithEstimate() {
    try {
      window.localStorage.setItem(PREFERRED_ADDONS_KEY, JSON.stringify(selectedAddons));
    } catch {
      // Ignore storage write errors
    }
    router.push(activeTierConfig.ctaHref);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-webzy-ink sm:text-4xl lg:text-5xl">
          {p.headline}
        </h1>
        <p className="mx-auto mt-3.5 max-w-2xl text-sm leading-relaxed text-webzy-ink/80 sm:mt-4 sm:text-lg">
          {p.subtitle}
        </p>
      </div>

      {/* 3 Core Pricing Cards with Tactile Hover & Selected Effects */}
      <div
        role="radiogroup"
        aria-label={p.headline}
        className="mt-8 grid grid-cols-1 items-stretch gap-5 sm:mt-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
      >
        {TIER_CONFIGS.map((tier) => {
          const tierCopy = p.tiers[tier.id];
          const isSelected = selectedTierId === tier.id;
          return (
            <div
              key={tier.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => setSelectedTierId(tier.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedTierId(tier.id);
                }
              }}
              className={`group relative flex cursor-pointer flex-col justify-between rounded-3xl border-2 p-6 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-webzy-primary/30 sm:p-8 ${
                isSelected
                  ? '-translate-y-1 border-webzy-primary bg-gradient-to-b from-webzy-primary/[0.045] via-white to-white shadow-[0_22px_48px_-16px_rgba(190,24,93,0.22)] ring-4 ring-webzy-primary/15'
                  : 'border-webzy-ink/[0.1] bg-white shadow-xs hover:-translate-y-1.5 hover:border-webzy-primary/45 hover:shadow-[0_18px_38px_-16px_rgba(31,20,25,0.16)]'
              }`}
            >
              <div>
                {/* Top Status Row */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span
                    className={`rounded-full px-3 py-1 font-bold transition-colors ${
                      isSelected
                        ? 'bg-webzy-primary text-white'
                        : tier.isPopular
                          ? 'border border-rose-200 bg-rose-50 text-rose-800'
                          : 'bg-webzy-surface text-webzy-ink/75'
                    }`}
                  >
                    {tierCopy.badge}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${
                      isSelected
                        ? 'text-webzy-primary'
                        : 'text-webzy-ink/45 group-hover:text-webzy-ink/75'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-webzy-primary text-white">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span>{site.common.selected}</span>
                      </>
                    ) : (
                      <span>{site.common.tapToSelect}</span>
                    )}
                  </span>
                </div>

                <h2 className="mt-4 font-heading text-2xl font-bold text-webzy-ink">
                  {tierCopy.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-webzy-ink/75">
                  {tierCopy.subtitle}
                </p>

                {/* Price Stack */}
                <div className="mt-6 border-y border-webzy-ink/[0.08] py-5">
                  <div className="flex items-baseline gap-2.5 font-tabular">
                    <span className="font-heading text-3xl font-extrabold text-webzy-ink sm:text-4xl">
                      {tier.priceLabel}
                    </span>
                    <span className="text-sm font-medium text-webzy-ink/45 line-through">
                      {tier.compareLabel}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-webzy-ink/65">
                    {tierCopy.validity} · {site.common.oneTimePayment}
                  </p>
                </div>

                {/* Feature Checklist */}
                <ul className="mt-6 space-y-3 text-sm text-webzy-ink/85">
                  {tierCopy.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Action */}
              <div className="mt-8 border-t border-webzy-tint/60 pt-5">
                <Link
                  href={tier.ctaHref}
                  onClick={(e) => e.stopPropagation()}
                  className={`btn-spring inline-flex min-h-[50px] w-full items-center justify-center rounded-full px-5 text-sm font-bold transition ${
                    isSelected
                      ? 'bg-webzy-primary text-white shadow-md hover:opacity-95'
                      : 'border border-webzy-ink/15 bg-webzy-surface/70 text-webzy-ink hover:border-webzy-primary hover:bg-webzy-primary hover:text-white'
                  }`}
                >
                  {tierCopy.ctaLabel}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Optional Add-Ons + Live Calculator */}
      <div className="mt-12 sm:mt-14 rounded-3xl border border-webzy-tint bg-white p-5 shadow-sm sm:p-7 lg:p-10">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-webzy-primary">
              {p.optionalExtrasEyebrow}
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
              {p.addonsHeading}
            </h2>
            <p className="mt-1.5 text-sm text-webzy-ink/75">{p.addonsSubhead}</p>
          </div>
          {selectedAddons.length > 0 ? (
            <button
              type="button"
              onClick={() => setSelectedAddons([])}
              className="inline-flex min-h-[44px] items-center self-start text-xs font-bold text-webzy-ink/60 underline hover:text-webzy-ink sm:self-auto"
            >
              {p.clearExtras}
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 sm:mt-7">
          {FEATURE_ADDON_IDS.map((addonId) => {
            const addonCopy = p.addons[addonId];
            const catalog = ADDON_CATALOG[addonId];
            const isSelected = selectedAddons.includes(addonId);
            const disabledForTier = !activeTierConfig.supportsAddons;

            return (
              <button
                key={addonId}
                type="button"
                aria-pressed={isSelected}
                disabled={disabledForTier}
                onClick={() => toggleAddon(addonId)}
                className={`group flex flex-col justify-between rounded-2xl border-2 p-5 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55 ${
                  isSelected && !disabledForTier
                    ? '-translate-y-0.5 border-emerald-600 bg-emerald-50/55 shadow-md ring-4 ring-emerald-500/15'
                    : 'border-webzy-ink/[0.1] bg-white hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-webzy-ink/55">
                      {addonCopy.badge}
                    </span>
                    <span
                      className={`inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-bold transition ${
                        isSelected && !disabledForTier
                          ? 'bg-emerald-600 text-white'
                          : 'border border-webzy-ink/15 bg-webzy-surface/60 text-webzy-ink/65 group-hover:border-emerald-500/40'
                      }`}
                    >
                      {isSelected && !disabledForTier ? p.addedLabel : p.addLabel}
                    </span>
                  </div>

                  <h3 className="mt-2.5 font-heading text-lg font-bold text-webzy-ink">
                    {addonCopy.title}
                  </h3>

                  <p className="mt-1.5 text-sm leading-relaxed text-webzy-ink/75">
                    {addonCopy.description}
                  </p>

                  <p className="mt-3 text-xs font-semibold text-emerald-800">
                    {addonCopy.highlight}
                  </p>
                </div>

                <div className="mt-5 border-t border-webzy-ink/[0.08] pt-3.5">
                  <div className="flex items-baseline gap-2 font-tabular">
                    <span className="font-heading text-xl font-extrabold text-webzy-ink">
                      +{formatInr(catalog.priceInr)}
                    </span>
                    <span className="text-xs font-medium text-webzy-ink/45 line-through">
                      {formatInr(catalog.compareAtInr)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {(() => {
            const activeValidityId: ValidityAddonId | null =
              VALIDITY_EXTENSION_ADDON_IDS.find((vId) => selectedAddons.includes(vId)) ?? null;
            const displayValidityId: ValidityAddonId = activeValidityId ?? 'extend_14d';
            const addonCopy = p.addons[displayValidityId];
            const catalog = ADDON_CATALOG[displayValidityId];
            const disabledForTier = !activeTierConfig.supportsAddons;
            const isSelected = activeValidityId !== null && !disabledForTier;

            return (
              <div
                role="group"
                aria-label="Validity extension options"
                className={`flex flex-col justify-between rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                  disabledForTier ? 'opacity-55' : ''
                } ${
                  isSelected
                    ? '-translate-y-0.5 border-emerald-600 bg-emerald-50/55 shadow-md ring-4 ring-emerald-500/15'
                    : 'border-webzy-ink/[0.1] bg-white hover:border-emerald-500/50 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-webzy-ink/55">
                      {addonCopy.badge}
                    </span>
                    <span
                      className={`inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-bold transition ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'border border-webzy-ink/15 bg-webzy-surface/60 text-webzy-ink/65'
                      }`}
                    >
                      {isSelected ? p.addedLabel : 'Pick duration'}
                    </span>
                  </div>

                  <h3 className="mt-2.5 font-heading text-lg font-bold text-webzy-ink">
                    {addonCopy.title}
                  </h3>

                  <p className="mt-1.5 text-sm leading-relaxed text-webzy-ink/75">
                    {addonCopy.description}
                  </p>

                  <div className="mt-3.5 grid grid-cols-3 gap-1.5 font-tabular">
                    {VALIDITY_EXTENSION_ADDON_IDS.map((vId) => {
                      const pillSelected = activeValidityId === vId && !disabledForTier;
                      const vCat = ADDON_CATALOG[vId];
                      return (
                        <button
                          key={vId}
                          type="button"
                          disabled={disabledForTier}
                          aria-pressed={pillSelected}
                          onClick={() => toggleAddon(vId)}
                          className={`flex flex-col items-center rounded-xl border px-2 py-2 text-center transition disabled:cursor-not-allowed ${
                            pillSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                              : 'border-webzy-ink/15 bg-webzy-surface/60 text-webzy-ink hover:border-emerald-500/60'
                          }`}
                        >
                          <span className="text-[11px] font-bold">{VALIDITY_PILL_LABELS[vId]}</span>
                          <span
                            className={`text-[10px] font-semibold ${
                              pillSelected ? 'text-emerald-50' : 'text-emerald-700'
                            }`}
                          >
                            +{formatInr(vCat.priceInr)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 border-t border-webzy-ink/[0.08] pt-3.5">
                  <div className="flex items-baseline justify-between gap-2 font-tabular">
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading text-xl font-extrabold text-webzy-ink">
                        +{formatInr(catalog.priceInr)}
                      </span>
                      <span className="text-xs font-medium text-webzy-ink/45 line-through">
                        {formatInr(catalog.compareAtInr)}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800">
                      {addonCopy.highlight}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Live Interactive Estimate Bar */}
        <div className="mt-7 flex flex-col items-start justify-between gap-4 rounded-2xl border border-webzy-ink/10 bg-webzy-surface/70 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-webzy-primary">
              {p.yourSelectedPlan}
            </p>
            <p className="mt-1 font-heading text-xl font-bold text-webzy-ink">
              {activeTierCopy.title}
              {activeTierConfig.supportsAddons && selectedAddons.length > 0
                ? ` (+${selectedAddons.length})`
                : ''}
            </p>
            <p className="mt-0.5 text-xs text-webzy-ink/70">
              {activeTierConfig.supportsAddons ? activeTierCopy.baseNote : p.studioAddonsNote}
            </p>
          </div>

          <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="font-tabular sm:text-right">
              <p className="text-xs font-semibold text-webzy-ink/60">{p.estimatedTotal}</p>
              <p className="font-heading text-2xl font-extrabold text-emerald-700">
                {activeTierConfig.id === 'studio_bespoke'
                  ? `${p.fromPrefix} ${formatInr(estimatedTotalInr)}`
                  : formatInr(estimatedTotalInr)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleContinueWithEstimate}
              className="btn-spring inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white shadow-md transition hover:opacity-95 sm:w-auto"
            >
              {activeTierCopy.ctaLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Trust & Transparency Guarantee Bar */}
      <div className="mt-10 grid grid-cols-1 gap-4 rounded-3xl border border-webzy-tint bg-webzy-surface/60 p-6 sm:grid-cols-2 lg:grid-cols-4">
        {p.guarantees.map((item) => (
          <div key={item.title}>
            <p className="text-sm font-bold text-webzy-ink">{item.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-webzy-ink/75">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
