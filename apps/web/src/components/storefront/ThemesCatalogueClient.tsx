'use client';

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
  'wedding',
  'birthday',
  'love',
  'anniversary',
  'family',
  'festival',
  'business',
];

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

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return themes.filter((t) => {
      if (occasion !== 'all' && t.occasion !== occasion) return false;
      if (langFilter !== 'all' && !t.languages.includes(langFilter)) return false;
      if (maxPrice > 0 && t.price.base > maxPrice) return false;
      if (q) {
        const hay = `${t.id} ${t.occasion} ${pickLocalizedText(t.name, language)} ${pickLocalizedText(t.audience, language)}`.toLowerCase();
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-heading text-3xl font-bold text-webzy-ink sm:text-4xl">
          {copy.featuredTitle}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-webzy-ink/75 sm:text-base">
          {copy.featuredSubtitle}
        </p>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3.5 rounded-3xl border border-webzy-tint bg-webzy-surface/60 p-3.5 sm:p-5">
        <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 scrollbar-none -mx-0.5 px-0.5 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap">
          {OCCASIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setOccasion(item)}
              aria-pressed={occasion === item}
              className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-full px-4 text-xs font-bold transition sm:text-sm ${
                occasion === item
                  ? 'bg-webzy-primary text-white shadow-sm'
                  : 'border border-webzy-tint bg-white text-webzy-ink hover:border-webzy-primary'
              }`}
            >
              {item === 'all' ? site.common.allOccasions : pickLocalizedText(OCCASION_LABELS[item], language)}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search birthday, wedding, diwali, ₹29..."
              className="min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-base font-medium text-webzy-ink outline-none focus:border-webzy-primary sm:w-64 sm:text-xs"
            />
            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-3">
              <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-webzy-ink sm:flex-row sm:items-center sm:gap-2">
                <span className="text-[11px] sm:text-xs">{site.common.languageLabel}:</span>
                <select
                  value={langFilter}
                  onChange={(e) => setLangFilter(e.target.value as 'all' | LanguageCode)}
                  className="min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3 text-sm font-semibold text-webzy-ink sm:w-auto sm:text-xs"
                >
                  <option value="all">{site.common.allOccasions}</option>
                  <option value="hinglish">Hinglish</option>
                  <option value="hi">हिन्दी</option>
                  <option value="en">English</option>
                </select>
              </label>

              <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-webzy-ink sm:flex-row sm:items-center sm:gap-2">
                <span className="text-[11px] sm:text-xs">{site.common.budgetLabel}:</span>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3 text-sm font-semibold text-webzy-ink sm:w-auto sm:text-xs"
                >
                  <option value={0}>{site.common.anyPrice}</option>
                  <option value={29}>₹29</option>
                  <option value={49}>≤ ₹49</option>
                  <option value={79}>≤ ₹79</option>
                  <option value={99}>≤ ₹99</option>
                  <option value={499}>≤ ₹499</option>
                </select>
              </label>
            </div>
          </div>

          <span className="self-start rounded-full border border-webzy-tint bg-white px-3 py-1.5 text-xs font-bold text-webzy-primary font-tabular sm:self-auto">
            {filtered.length} {filtered.length === 1 ? 'theme' : 'themes'}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-webzy-tint bg-webzy-surface p-8 text-center">
          <p className="font-heading text-lg font-bold text-webzy-ink">
            {site.common.noThemesMatch}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-5 py-2 text-sm font-bold text-white"
          >
            {site.common.resetFilters}
          </button>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-1 gap-3.5 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {filtered.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      )}
    </div>
  );
}
