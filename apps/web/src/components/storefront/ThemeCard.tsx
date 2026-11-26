'use client';

import Link from 'next/link';
import React from 'react';
import { formatInr, getSiteCopy, getStorefrontCopy, pickLocalizedText } from '@webzy/core';
import { ThemeCardArt, ThemeManifest } from '@webzy/themes';
import { useLanguage } from '../shell/LanguageProvider';

interface ThemeCardProps {
  theme: ThemeManifest;
}

export function ThemeCard({ theme }: ThemeCardProps) {
  const { language } = useLanguage();
  const copy = getStorefrontCopy(language);
  const site = getSiteCopy(language);
  const hasDiscount = Boolean(theme.price.compareAt && theme.price.compareAt > theme.price.base);
  const savings = hasDiscount ? theme.price.compareAt! - theme.price.base : 0;
  const demoHref = theme.occasion === 'wedding' ? `/weddings/${theme.id}` : `/themes/${theme.id}`;

  return (
    <article className="card-physical group flex flex-col justify-between rounded-2xl p-2 sm:rounded-3xl sm:p-4">
      <div>
        <Link href={demoHref} className="relative block overflow-hidden rounded-xl sm:rounded-2xl">
          <ThemeCardArt theme={theme} />
          {theme.id === 'birthday-confetti-01' || theme.id === 'portfolio-01' ? (
            <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-webzy-ink shadow-xs sm:right-2 sm:top-2 sm:text-[10px]">
              3 Styles
            </span>
          ) : theme.id === 'small-business-01' ? (
            <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-webzy-ink shadow-xs sm:right-2 sm:top-2 sm:text-[10px]">
              4 Styles · 3D
            </span>
          ) : null}
          {hasDiscount ? (
            <span className="absolute bottom-1.5 left-1.5 z-10 rounded-full bg-emerald-700/95 px-2 py-0.5 text-[9.5px] font-bold text-white shadow-sm backdrop-blur-[2px] sm:bottom-2 sm:left-2 sm:px-2.5 sm:text-[10px]">
              {site.common.save} {formatInr(savings)}
            </span>
          ) : null}
        </Link>

        <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-x-1.5 gap-y-0.5 sm:mt-3.5">
          <h3 className="font-heading text-[13px] font-bold leading-snug tracking-tight text-webzy-ink sm:text-base lg:text-lg">
            {pickLocalizedText(theme.name, language)}
          </h3>
          <div className="flex shrink-0 items-baseline gap-1 font-tabular sm:gap-1.5">
            {hasDiscount ? (
              <span className="text-[10.5px] font-medium text-webzy-ink/40 line-through sm:text-xs">
                {formatInr(theme.price.compareAt!)}
              </span>
            ) : null}
            <span className="font-heading text-[13.5px] font-extrabold text-emerald-700 sm:text-base lg:text-lg">
              {formatInr(theme.price.base)}
            </span>
          </div>
        </div>

        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-webzy-ink/75 sm:text-xs md:text-sm">
          {pickLocalizedText(theme.audience, language)}
        </p>
      </div>

      <div className="mt-2.5 flex items-center gap-2 sm:mt-4">
        <Link
          href={demoHref}
          className="btn-spring inline-flex min-h-[38px] w-full items-center justify-center rounded-xl bg-webzy-primary px-2.5 py-2 text-xs font-bold text-white shadow-btn-primary hover:opacity-95 sm:min-h-[44px] sm:px-4 sm:text-sm"
        >
          {copy.tryDemo}
        </Link>
      </div>
    </article>
  );
}
