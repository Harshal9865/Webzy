'use client';

import Link from 'next/link';
import React from 'react';
import { formatInr, getStorefrontCopy, pickLocalizedText } from '@webzy/core';
import { OCCASION_LABELS, ThemeCardArt, ThemeManifest } from '@webzy/themes';
import { useLanguage } from '../shell/LanguageProvider';

interface ThemeCardProps {
  theme: ThemeManifest;
  priority?: boolean;
}

const STYLE_COUNT_BADGE: Record<string, string> = {
  'birthday-confetti-01': '3 Styles',
  'portfolio-01': '3 Styles',
  'small-business-01': '4 Styles · 3D',
  'travel-voyage-01': 'Ink Reveal · 3 Modes',
  'cafe-artisan-01': '2 Modes · Cart',
  'creative-voxel-01': '3D Canvas · 3 Worlds',
};

export function ThemeCard({ theme, priority = false }: ThemeCardProps) {
  const { language } = useLanguage();
  const copy = getStorefrontCopy(language);
  const hasDiscount = Boolean(theme.price.compareAt && theme.price.compareAt > theme.price.base);
  const discountPct = hasDiscount
    ? Math.round(((theme.price.compareAt! - theme.price.base) / theme.price.compareAt!) * 100)
    : 0;
  const demoHref = theme.occasion === 'wedding' ? `/weddings/${theme.id}` : `/themes/${theme.id}`;
  const customizeHref =
    theme.occasion === 'wedding' ? `/weddings/${theme.id}/customize` : `/create/${theme.id}`;
  const styleBadge = STYLE_COUNT_BADGE[theme.id];
  const occasionLabel = pickLocalizedText(OCCASION_LABELS[theme.occasion], language);

  return (
    <article className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-webzy-ink/[0.08] bg-white p-2 shadow-[0_1px_2px_rgba(26,18,28,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-webzy-primary/30 hover:shadow-[0_18px_36px_-18px_rgba(43,27,46,0.18)] sm:rounded-[22px] sm:p-3">
      <div className="flex flex-col">
        {/* Unobstructed Art Plate */}
        <Link
          href={demoHref}
          aria-label={`Preview ${pickLocalizedText(theme.name, language)}`}
          className="relative block overflow-hidden rounded-xl sm:rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-webzy-primary"
        >
          <ThemeCardArt theme={theme} priority={priority} />
          {styleBadge ? (
            <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-full border border-black/10 bg-white/92 px-2 py-0.5 text-[9px] font-bold tracking-wide text-webzy-ink shadow-2xs backdrop-blur-xs sm:px-2.5 sm:text-[10px]">
              {styleBadge}
            </span>
          ) : null}
        </Link>

        {/* Quiet Metadata Row (Outside the art plate so nothing covers the artwork) */}
        <div className="mt-2.5 flex items-center justify-between gap-1.5 px-0.5 sm:mt-3">
          <span
            className="truncate text-[10px] font-bold uppercase tracking-[0.12em] sm:text-[10.5px]"
            style={{ color: theme.palette.primary || '#E11D63' }}
          >
            {occasionLabel}
          </span>
          {hasDiscount && discountPct > 0 ? (
            <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-700 sm:px-2 sm:text-[10px]">
              {discountPct}% off
            </span>
          ) : null}
        </div>

        {/* Title (Uniform single line so adjacent cards align cleanly) */}
        <Link href={demoHref} className="mt-1 block px-0.5">
          <h3 className="line-clamp-1 font-heading text-[13.5px] font-bold leading-snug tracking-tight text-webzy-ink transition-colors group-hover:text-webzy-primary sm:text-[15.5px]">
            {pickLocalizedText(theme.name, language)}
          </h3>
        </Link>

        {/* Audience Description (Uniform 2-line slot) */}
        <p className="mt-1 line-clamp-2 min-h-[2.45em] px-0.5 text-[11px] leading-snug text-webzy-ink/65 sm:text-xs">
          {pickLocalizedText(theme.audience, language)}
        </p>
      </div>

      {/* Clean Footer: Price + Actions */}
      <div className="mt-3 border-t border-webzy-ink/[0.07] pt-2.5 sm:mt-3.5 sm:pt-3">
        <div className="flex items-baseline justify-between gap-2 px-0.5">
          <div className="flex items-baseline gap-1.5 font-tabular">
            <span className="font-heading text-[15px] font-extrabold text-webzy-ink sm:text-[17px]">
              {formatInr(theme.price.base)}
            </span>
            {hasDiscount ? (
              <span className="text-[11px] font-medium text-webzy-ink/40 line-through sm:text-xs">
                {formatInr(theme.price.compareAt!)}
              </span>
            ) : null}
          </div>
          <span className="hidden text-[10px] font-medium text-webzy-ink/45 sm:inline">
            One-time
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 sm:mt-2.5 sm:gap-2">
          <Link
            href={demoHref}
            className="btn-spring inline-flex min-h-[36px] flex-1 items-center justify-center rounded-xl bg-webzy-primary px-2.5 py-1.5 text-[11.5px] font-bold text-white shadow-btn-primary transition hover:opacity-95 sm:min-h-[40px] sm:px-3.5 sm:text-xs"
          >
            {copy.tryDemo}
          </Link>
          <Link
            href={customizeHref}
            aria-label={`Personalize ${pickLocalizedText(theme.name, language)}`}
            title="Personalize now"
            className="btn-spring hidden min-h-[40px] shrink-0 items-center justify-center rounded-xl border border-webzy-ink/[0.12] bg-white px-3 text-xs font-bold text-webzy-ink/85 transition hover:border-webzy-primary/40 hover:bg-webzy-surface/60 hover:text-webzy-primary sm:inline-flex"
          >
            Edit
          </Link>
        </div>
      </div>
    </article>
  );
}
