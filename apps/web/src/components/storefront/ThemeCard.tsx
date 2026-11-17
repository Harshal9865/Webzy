'use client';

import Link from 'next/link';
import React from 'react';
import { formatInr, getStorefrontCopy } from '@webzy/core';
import { ThemeCardArt, ThemeManifest } from '@webzy/themes';
import { useLanguage } from '../shell/LanguageProvider';

interface ThemeCardProps {
  theme: ThemeManifest;
}

export function ThemeCard({ theme }: ThemeCardProps) {
  const { language } = useLanguage();
  const copy = getStorefrontCopy(language);
  const hasDiscount = Boolean(theme.price.compareAt && theme.price.compareAt > theme.price.base);
  const savings = hasDiscount ? theme.price.compareAt! - theme.price.base : 0;

  return (
    <article className="flex flex-col justify-between rounded-3xl border border-webzy-tint bg-white p-3.5 shadow-sm transition hover:border-webzy-primary/40 hover:shadow-md">
      <div>
        <Link href={`/themes/${theme.id}`} className="relative block">
          <ThemeCardArt theme={theme} />
          {hasDiscount ? (
            <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-emerald-700 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
              Save {formatInr(savings)}
            </span>
          ) : null}
        </Link>

        <div className="mt-3 flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-bold leading-snug text-webzy-ink sm:text-lg">
            {theme.name[language]}
          </h3>
          <div className="flex shrink-0 items-baseline gap-1.5">
            {hasDiscount ? (
              <span className="text-xs font-medium text-webzy-ink/40 line-through">
                {formatInr(theme.price.compareAt)}
              </span>
            ) : null}
            <span className="font-heading text-base font-extrabold text-emerald-700 sm:text-lg">
              {formatInr(theme.price.base)}
            </span>
          </div>
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-webzy-ink/75 sm:text-sm">
          {theme.audience[language]}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/themes/${theme.id}`}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-webzy-primary px-4 py-2 text-xs font-bold text-white transition hover:opacity-95 sm:text-sm"
        >
          {copy.tryDemo}
        </Link>
      </div>
    </article>
  );
}
