'use client';

import React, { useMemo, useState } from 'react';
import { getStorefrontCopy, LanguageCode } from '@webzy/core';
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
  'festival',
  'business',
];

export function ThemesCatalogueClient({
  themes,
  initialOccasion = 'all',
}: ThemesCatalogueClientProps) {
  const { language } = useLanguage();
  const copy = getStorefrontCopy(language);
  const [occasion, setOccasion] = useState<string>(
    OCCASIONS.includes(initialOccasion as 'all' | ThemeOccasion) ? initialOccasion : 'all',
  );
  const [langFilter, setLangFilter] = useState<'all' | LanguageCode>('all');
  const [maxPrice, setMaxPrice] = useState<number>(0);

  const filtered = useMemo(() => {
    return themes.filter((t) => {
      if (occasion !== 'all' && t.occasion !== occasion) return false;
      if (langFilter !== 'all' && !t.languages.includes(langFilter)) return false;
      if (maxPrice > 0 && t.price.base > maxPrice) return false;
      return true;
    });
  }, [themes, occasion, langFilter, maxPrice]);

  function resetFilters() {
    setOccasion('all');
    setLangFilter('all');
    setMaxPrice(0);
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
      <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-webzy-tint bg-webzy-surface/60 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setOccasion(item)}
              aria-pressed={occasion === item}
              className={`min-h-[44px] rounded-full px-4 text-xs font-bold transition sm:text-sm ${
                occasion === item
                  ? 'bg-webzy-primary text-white shadow-sm'
                  : 'border border-webzy-tint bg-white text-webzy-ink hover:border-webzy-primary'
              }`}
            >
              {item === 'all' ? 'All occasions' : OCCASION_LABELS[item][language]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-webzy-ink">
            <span>Language:</span>
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value as 'all' | LanguageCode)}
              className="min-h-[44px] rounded-xl border border-webzy-tint bg-white px-3 text-xs font-semibold text-webzy-ink"
            >
              <option value="all">All</option>
              <option value="hinglish">Hinglish</option>
              <option value="hi">हिन्दी</option>
              <option value="en">English</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-webzy-ink">
            <span>Budget:</span>
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="min-h-[44px] rounded-xl border border-webzy-tint bg-white px-3 text-xs font-semibold text-webzy-ink"
            >
              <option value={0}>Any price</option>
              <option value={29}>₹29 only</option>
              <option value={49}>₹49 or less</option>
              <option value={79}>₹79 or less</option>
              <option value={99}>₹99 or less</option>
            </select>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-webzy-tint bg-webzy-surface p-8 text-center">
          <p className="font-heading text-lg font-bold text-webzy-ink">
            No themes match these filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-5 py-2 text-sm font-bold text-white"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {filtered.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      )}
    </div>
  );
}
