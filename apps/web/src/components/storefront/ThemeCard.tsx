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
    <article className="card-physical group flex flex-col justify-between rounded-2xl p-3 sm:rounded-3xl sm:p-4">
      <div>
        <Link href={demoHref} className="relative block overflow-hidden rounded-xl sm:rounded-2xl">
          <ThemeCardArt theme={theme} />
          {hasDiscount ? (
            <span className="absolute bottom-2 left-2 z-10 rounded-full bg-emerald-700/95 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-[2px]">
              {site.common.save} {formatInr(savings)}
            </span>
          ) : null}
        </Link>

        <div className="mt-3 flex flex-col gap-1 sm:mt-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
          <h3 className="font-heading text-[15px] font-bold leading-snug tracking-tight text-webzy-ink sm:text-lg">
            {pickLocalizedText(theme.name, language)}
          </h3>
          <div className="flex shrink-0 items-baseline gap-1.5 font-tabular">
            {hasDiscount ? (
              <span className="text-xs font-medium text-webzy-ink/40 line-through">
                {formatInr(theme.price.compareAt!)}
              </span>
            ) : null}
            <span className="font-heading text-base font-extrabold text-emerald-700 sm:text-lg">
              {formatInr(theme.price.base)}
            </span>
          </div>
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-webzy-ink/75 sm:text-sm">
          {pickLocalizedText(theme.audience, language)}
        </p>
      </div>

      <div className="mt-3.5 sm:mt-4 flex items-center gap-2">
        <Link
          href={demoHref}
          className="btn-spring inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-webzy-primary px-3.5 py-2 text-xs font-bold text-white shadow-btn-primary hover:opacity-95 sm:px-4 sm:text-sm"
        >
          {copy.tryDemo}
        </Link>
      </div>
    </article>
  );
}
