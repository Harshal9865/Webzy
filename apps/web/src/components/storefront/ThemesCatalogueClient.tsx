'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { getSiteCopy, getStorefrontCopy, pickLocalizedText } from '@webzy/core';
import { OCCASION_LABELS, ThemeManifest, ThemeOccasion } from '@webzy/themes';
import { useLanguage } from '../shell/LanguageProvider';
import { ThemeCard } from './ThemeCard';

interface ThemesCatalogueClientProps {
  themes: ThemeManifest[];
  initialOccasion?: string;
}

const OCCASIONS: Array<'all' | ThemeOccasion> = [
  'all',
  'birthday',
  'love',
  'anniversary',
  'family',
  'travel',
  'business',
  'portfolio',
  'festival',
];

type SortMode = 'featured' | 'price_asc' | 'price_desc';

export function ThemesCatalogueClient({
  themes,
  initialOccasion = 'all',
}: ThemesCatalogueClientProps) {
  const { language } = useLanguage();
  const copy = getStorefrontCopy(language);
  const site = getSiteCopy(language);

  const normalizedInitial = OCCASIONS.includes(initialOccasion as 'all' | ThemeOccasion)
    ? initialOccasion
    : 'all';

  const [occasion, setOccasion] = useState<string>(normalizedInitial);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortMode>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync URL query navigation (e.g. clicking a hub link to /themes?occasion=love)
  useEffect(() => {
    setOccasion(normalizedInitial);
  }, [normalizedInitial]);

  const nonWeddingThemes = useMemo(
    () => themes.filter((t) => t.occasion !== 'wedding'),
    [themes],
  );

  const hasBudget29 = useMemo(
    () => nonWeddingThemes.some((t) => t.price.base <= 29),
    [nonWeddingThemes],
  );

  // Live counts per occasion pill so visitors immediately know what is inside each shelf
  const occasionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: nonWeddingThemes.length };
    for (const item of nonWeddingThemes) {
      counts[item.occasion] = (counts[item.occasion] ?? 0) + 1;
    }
    return counts;
  }, [nonWeddingThemes]);

  const visibleOccasions = useMemo(
    () => OCCASIONS.filter((item) => item === 'all' || (occasionCounts[item] ?? 0) > 0),
    [occasionCounts],
  );

  const activeExtraFilterCount = (maxPrice > 0 ? 1 : 0) + (sortBy !== 'featured' ? 1 : 0);
  const hasAnyFilter =
    occasion !== 'all' ||
    maxPrice > 0 ||
    sortBy !== 'featured' ||
    searchQuery.trim().length > 0;

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = nonWeddingThemes.filter((t) => {
      if (occasion !== 'all' && t.occasion !== occasion) return false;
      if (maxPrice > 0 && t.price.base > maxPrice) return false;
      if (q) {
        const hay = `${t.id} ${t.occasion} ₹${t.price.base} ${t.price.base} ${pickLocalizedText(t.name, language)} ${pickLocalizedText(t.audience, language)} ${pickLocalizedText(t.signatureMoment, language)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'price_asc') {
      return [...list].sort((a, b) => a.price.base - b.price.base);
    }
    if (sortBy === 'price_desc') {
      return [...list].sort((a, b) => b.price.base - a.price.base);
    }
    return list;
  }, [nonWeddingThemes, occasion, maxPrice, sortBy, searchQuery, language]);

  function resetFilters() {
    setOccasion('all');
    setMaxPrice(0);
    setSortBy('featured');
    setSearchQuery('');
  }

  return (
    <div className="min-h-screen bg-[#FCFAF7]">
      {/* Compact Sticky-Ready Filter & Search Bar */}
      <section className="border-b border-webzy-ink/[0.08] bg-white">
        <div className="mx-auto max-w-7xl px-3.5 py-3.5 sm:px-6 sm:py-4">
          <h1 className="sr-only">{copy.featuredTitle}</h1>

          {/* Search + Controls Row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:max-w-sm">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-webzy-ink/45"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search birthday, love, travel, cafe, ₹29..."
                aria-label="Search themes"
                className="h-10 w-full rounded-full border border-webzy-ink/[0.12] bg-[#FAF8F5] pl-9 pr-8 text-xs font-medium text-webzy-ink outline-none transition placeholder:text-webzy-ink/40 focus:border-webzy-primary focus:bg-white"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-stone-200/80 text-[11px] font-bold text-stone-700 hover:bg-stone-300"
                >
                  ×
                </button>
              ) : null}
            </div>

            {/* Mobile Filter Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
              aria-expanded={mobileFiltersOpen}
              className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold transition sm:hidden ${mobileFiltersOpen || activeExtraFilterCount > 0
                  ? 'border-webzy-primary bg-webzy-surface text-webzy-primary'
                  : 'border-webzy-ink/[0.12] bg-white text-webzy-ink/80'
                }`}
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12m-9 6h6" />
              </svg>
              <span>Filter</span>
              {activeExtraFilterCount > 0 ? (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-webzy-primary px-1 text-[10px] text-white">
                  {activeExtraFilterCount}
                </span>
              ) : null}
            </button>

            {/* Desktop Inline Filters */}
            <div className="hidden items-center gap-2 sm:flex">
              <select
                aria-label={site.common.budgetLabel}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="h-10 rounded-full border border-webzy-ink/[0.12] bg-white px-3.5 text-xs font-semibold text-webzy-ink outline-none transition hover:border-webzy-primary/50 focus:border-webzy-primary"
              >
                <option value={0}>{site.common.anyPrice}</option>
                {hasBudget29 ? <option value={29}>₹29</option> : null}
                <option value={49}>Up to ₹49</option>
                <option value={79}>Up to ₹79</option>
                <option value={99}>Up to ₹99</option>
              </select>

              <select
                aria-label="Sort themes"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortMode)}
                className="h-10 rounded-full border border-webzy-ink/[0.12] bg-white px-3.5 text-xs font-semibold text-webzy-ink outline-none transition hover:border-webzy-primary/50 focus:border-webzy-primary"
              >
                <option value="featured">Curated order</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>

              {hasAnyFilter ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="h-10 rounded-full px-3 text-xs font-bold text-webzy-primary transition hover:bg-webzy-surface"
                >
                  Reset
                </button>
              ) : null}
            </div>
          </div>

          {/* Mobile Secondary Filter Drawer */}
          {mobileFiltersOpen ? (
            <div className="mt-2.5 grid grid-cols-2 gap-2 rounded-2xl border border-webzy-ink/[0.08] bg-[#FAF6F0] p-2.5 sm:hidden">
              <select
                aria-label={site.common.budgetLabel}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="h-9 w-full rounded-xl border border-webzy-ink/[0.1] bg-white px-2 text-[11px] font-semibold text-webzy-ink"
              >
                <option value={0}>{site.common.anyPrice}</option>
                {hasBudget29 ? <option value={29}>₹29</option> : null}
                <option value={49}>≤ ₹49</option>
                <option value={79}>≤ ₹79</option>
                <option value={99}>≤ ₹99</option>
              </select>

              <select
                aria-label="Sort themes"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortMode)}
                className="h-9 w-full rounded-xl border border-webzy-ink/[0.1] bg-white px-2 text-[11px] font-semibold text-webzy-ink"
              >
                <option value="featured">Curated</option>
                <option value="price_asc">Low → High</option>
                <option value="price_desc">High → Low</option>
              </select>
            </div>
          ) : null}

          {/* Occasion Category Rail with Live Counts */}
          <div className="-mx-3.5 mt-3.5 flex flex-nowrap items-center gap-1.5 overflow-x-auto px-3.5 pb-0.5 scrollbar-none sm:mx-0 sm:px-0">
            {visibleOccasions.map((item) => {
              const active = occasion === item;
              const count = occasionCounts[item] ?? 0;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setOccasion(item)}
                  aria-pressed={active}
                  className={`inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[11.5px] font-bold transition sm:h-9 sm:px-3.5 sm:text-xs ${active
                      ? 'bg-webzy-ink text-white shadow-2xs'
                      : 'border border-webzy-ink/[0.1] bg-white text-webzy-ink/80 hover:border-webzy-ink/30 hover:text-webzy-ink'
                    }`}
                >
                  <span>
                    {item === 'all'
                      ? 'All Occasions'
                      : pickLocalizedText(OCCASION_LABELS[item], language)}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-tabular ${active ? 'bg-white/20 text-white' : 'bg-stone-100 text-webzy-ink/55'
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
            {hasAnyFilter ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full px-2.5 text-[11px] font-bold text-webzy-primary hover:bg-webzy-surface sm:hidden"
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* Main Product Gallery */}
      <div className="mx-auto max-w-7xl px-3.5 pb-14 pt-5 sm:px-6 sm:pt-7">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-webzy-ink/[0.08] bg-white p-8 text-center shadow-2xs">
            <p className="font-heading text-base font-bold text-webzy-ink sm:text-lg">
              {site.common.noThemesMatch}
            </p>
            <p className="mt-1 text-xs text-webzy-ink/60">
              Try clearing your filters or explore our full collection.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex h-10 items-center rounded-full bg-webzy-primary px-6 text-xs font-bold text-white shadow-btn-primary"
            >
              {site.common.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((theme, idx) => (
              <ThemeCard key={theme.id} theme={theme} priority={idx < 4} />
            ))}
          </div>
        )}

        {/* Dual Storefront Pathways: Weddings Gallery + Custom Made Atelier */}
        <div className="mt-10 grid grid-cols-1 gap-3.5 sm:mt-12 md:grid-cols-2 md:gap-5">
          <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#C9A243]/40 bg-[#FBF7EE] p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C6B22]">
                WEDDING COLLECTION
              </p>
              <p className="mt-1 font-heading text-base font-bold text-[#1F1419] sm:text-lg">
                Planning a Wedding?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#4A383E]">
                Explore 6 royal wedding invitation suites with opening palace gates, multi-day itineraries &amp; guest RSVPs.
              </p>
            </div>
            <Link
              href="/weddings"
              className="btn-spring inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#1A1317] px-5 text-xs font-bold text-[#F5E0A3] shadow-2xs transition hover:bg-[#2B1F26]"
            >
              Explore Weddings →
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-3xl border border-webzy-ink/10 bg-[#1B1714] p-5 text-white sm:flex-row sm:items-center sm:p-6">
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#E4C285]">
                BESPOKE STUDIO
              </p>
              <p className="mt-1 font-heading text-base font-bold text-white sm:text-lg">
                Need a custom-built website?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/75">
                Designed one-on-one for cafés, travel brands, boutiques, clinics, and studios — preview before you pay.
              </p>
            </div>
            <Link
              href="/studio"
              className="btn-spring inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-white px-5 text-xs font-bold text-[#1B1714] transition hover:bg-[#F5EFE6]"
            >
              Visit Custom Atelier →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
