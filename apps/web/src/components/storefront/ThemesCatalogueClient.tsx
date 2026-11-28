'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { getSiteCopy, getStorefrontCopy, LanguageCode, pickLocalizedText } from '@webzy/core';
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
  'portfolio',
  'business',
  'love',
  'anniversary',
  'family',
];

const ALL_LANGUAGES_LABEL: Record<string, string> = {
  en: 'All languages',
  hinglish: 'All languages',
  hi: 'सभी भाषाएँ',
};

export function ThemesCatalogueClient({
  themes,
  initialOccasion = 'all',
}: ThemesCatalogueClientProps) {
  const { language } = useLanguage();
  const copy = getStorefrontCopy(language);
  const site = getSiteCopy(language);
  const [occasion, setOccasion] = useState<string>(
    OCCASIONS.includes(initialOccasion as 'all' | ThemeOccasion) ? initialOccasion : 'all',
  );
  const [langFilter, setLangFilter] = useState<'all' | LanguageCode>('all');
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeExtraFilterCount = (langFilter !== 'all' ? 1 : 0) + (maxPrice > 0 ? 1 : 0);
  const hasAnyFilter =
    occasion !== 'all' || langFilter !== 'all' || maxPrice > 0 || searchQuery.trim().length > 0;

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return themes.filter((t) => {
      if (t.occasion === 'wedding') return false;
      if (occasion !== 'all' && t.occasion !== occasion) return false;
      if (langFilter !== 'all' && !t.languages.includes(langFilter)) return false;
      if (maxPrice > 0 && t.price.base > maxPrice) return false;
      if (q) {
        const hay = `${t.id} ${t.occasion} ₹${t.price.base} ${t.price.base} ${pickLocalizedText(t.name, language)} ${pickLocalizedText(t.audience, language)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [themes, occasion, langFilter, maxPrice, searchQuery, language]);

  function resetFilters() {
    setOccasion('all');
    setLangFilter('all');
    setMaxPrice(0);
    setSearchQuery('');
  }

  const allLanguagesText = ALL_LANGUAGES_LABEL[language] || 'All languages';

  return (
    <div className="mx-auto max-w-7xl px-3.5 pb-12 pt-4 sm:px-6 sm:pt-6">
      {/* Compact Top Header Row: Title + Live Count + Quick Weddings Link */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h1 className="truncate font-heading text-xl font-bold tracking-tight text-webzy-ink sm:text-3xl">
              {copy.featuredTitle}
            </h1>
            <span className="shrink-0 rounded-full bg-webzy-surface px-2 py-0.5 text-[11px] font-bold text-webzy-primary font-tabular">
              {filtered.length}
            </span>
          </div>
          <p className="mt-0.5 hidden text-xs text-webzy-ink/65 sm:block sm:text-sm">
            {copy.featuredSubtitle}
          </p>
        </div>

        <Link
          href="/weddings"
          className="btn-spring inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-[#C9A243]/50 bg-[#1A1317] px-3 text-[11px] font-bold text-[#F5E0A3] shadow-2xs transition hover:bg-[#2B1F26] sm:h-9 sm:px-4 sm:text-xs"
        >
          <span>Weddings</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Sleek Compact Filter Bar (Zero bloated container; mobile-first collapsible drawer for secondary filters) */}
      <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
        {/* Row 1: Search + Inline Selects (Desktop) / Filter Toggle Pill (Mobile) */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-webzy-ink/45"
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
              placeholder="Search birthday, shop, ₹29..."
              aria-label="Search themes"
              className="h-9 w-full rounded-full border border-webzy-tint bg-white pl-8 pr-8 text-xs font-medium text-webzy-ink shadow-2xs outline-none transition focus:border-webzy-primary sm:h-9"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 hover:bg-slate-200"
              >
                ×
              </button>
            ) : null}
          </div>

          {/* Mobile Secondary Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            aria-expanded={mobileFiltersOpen}
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition sm:hidden ${
              mobileFiltersOpen || activeExtraFilterCount > 0
                ? 'border-webzy-primary bg-webzy-surface text-webzy-primary'
                : 'border-webzy-tint bg-white text-webzy-ink/80'
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

          {/* Desktop Inline Language & Budget Dropdowns (Same Row — Zero Extra Vertical Height) */}
          <div className="hidden items-center gap-2 sm:flex">
            <select
              aria-label={site.common.languageLabel}
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value as 'all' | LanguageCode)}
              className="h-9 rounded-full border border-webzy-tint bg-white px-3 text-xs font-semibold text-webzy-ink outline-none transition hover:border-webzy-primary/50 focus:border-webzy-primary"
            >
              <option value="all">{allLanguagesText}</option>
              <option value="hinglish">Hinglish</option>
              <option value="hi">हिन्दी</option>
              <option value="en">English</option>
            </select>

            <select
              aria-label={site.common.budgetLabel}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="h-9 rounded-full border border-webzy-tint bg-white px-3 text-xs font-semibold text-webzy-ink outline-none transition hover:border-webzy-primary/50 focus:border-webzy-primary"
            >
              <option value={0}>{site.common.anyPrice}</option>
              <option value={29}>₹29</option>
              <option value={49}>≤ ₹49</option>
              <option value={79}>≤ ₹79</option>
              <option value={99}>≤ ₹99</option>
            </select>

            {hasAnyFilter ? (
              <button
                type="button"
                onClick={resetFilters}
                className="h-9 rounded-full px-2.5 text-xs font-bold text-webzy-primary hover:bg-webzy-surface"
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>

        {/* Collapsible Mobile Secondary Filters (Hidden by default so cards show above the fold) */}
        {mobileFiltersOpen ? (
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-webzy-tint bg-webzy-surface/60 p-2.5 sm:hidden">
            <select
              aria-label={site.common.languageLabel}
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value as 'all' | LanguageCode)}
              className="h-9 w-full rounded-xl border border-webzy-tint bg-white px-2.5 text-xs font-semibold text-webzy-ink"
            >
              <option value="all">{allLanguagesText}</option>
              <option value="hinglish">Hinglish</option>
              <option value="hi">हिन्दी</option>
              <option value="en">English</option>
            </select>

            <select
              aria-label={site.common.budgetLabel}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="h-9 w-full rounded-xl border border-webzy-tint bg-white px-2.5 text-xs font-semibold text-webzy-ink"
            >
              <option value={0}>{site.common.anyPrice}</option>
              <option value={29}>₹29</option>
              <option value={49}>≤ ₹49</option>
              <option value={79}>≤ ₹79</option>
              <option value={99}>≤ ₹99</option>
            </select>
          </div>
        ) : null}

        {/* Row 2: Single Compact Horizontal Scroll Rail of Occasion Chips */}
        <div className="-mx-3.5 flex flex-nowrap items-center gap-1.5 overflow-x-auto px-3.5 pb-0.5 scrollbar-none sm:mx-0 sm:px-0">
          {OCCASIONS.map((item) => {
            const active = occasion === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setOccasion(item)}
                aria-pressed={active}
                className={`inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full px-3 text-[11.5px] font-bold transition sm:h-8 sm:px-3.5 sm:text-xs ${
                  active
                    ? 'bg-webzy-primary text-white shadow-2xs'
                    : 'border border-webzy-tint bg-white text-webzy-ink/85 hover:border-webzy-primary/60 hover:text-webzy-ink'
                }`}
              >
                {item === 'all'
                  ? 'All'
                  : pickLocalizedText(OCCASION_LABELS[item], language)}
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

      {/* Product Grid — Immediately Visible Above the Fold on Mobile & Desktop */}
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-webzy-tint bg-webzy-surface/60 p-7 text-center">
          <p className="font-heading text-base font-bold text-webzy-ink sm:text-lg">
            {site.common.noThemesMatch}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 inline-flex h-10 items-center rounded-full bg-webzy-primary px-5 text-xs font-bold text-white"
          >
            {site.common.resetFilters}
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {filtered.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      )}

      {/* Slim Wedding Gallery Footer Strip (Below the grid so occasions stay front and center) */}
      <div className="mt-7 flex flex-col justify-between gap-2.5 rounded-2xl border border-[#C9A243]/40 bg-[#FBF7EE] px-4 py-3 sm:mt-9 sm:flex-row sm:items-center sm:px-5">
        <div className="min-w-0">
          <p className="font-heading text-sm font-bold text-[#1F1419]">
            Planning a Wedding?
          </p>
          <p className="text-[11.5px] text-[#4A383E] sm:text-xs">
            Explore 6 royal wedding invitation suites &amp; bespoke wedding builds in the Wedding Gallery.
          </p>
        </div>
        <Link
          href="/weddings"
          className="btn-spring inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-[#1A1317] px-4 text-xs font-bold text-[#F5E0A3] shadow-2xs transition hover:bg-[#2B1F26]"
        >
          Explore Weddings →
        </Link>
      </div>
    </div>
  );
}
