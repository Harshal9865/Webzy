'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { getSiteCopy } from '@webzy/core';
import { useLanguage } from '../shell/LanguageProvider';
import { formatInrComma, type WeddingEditionMeta } from './weddingCatalog';

interface WeddingEditionCardProps {
  edition: WeddingEditionMeta;
  index: number;
}

export function WeddingEditionCard({ edition, index }: WeddingEditionCardProps) {
  const { language } = useLanguage();
  const site = getSiteCopy(language);
  const [sceneFailed, setSceneFailed] = useState(false);
  const savings = Math.max(0, edition.compareAtInr - edition.priceInr);
  const isDark = edition.isDarkTheme;
  const editionNumber = String(index + 1).padStart(2, '0');

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#C9A243]/35 bg-[#FFFDF9] p-2 shadow-[0_14px_34px_-20px_rgba(26,16,20,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C9A243]/70 hover:shadow-[0_22px_44px_-20px_rgba(26,16,20,0.3)] sm:rounded-[22px] sm:p-3">
      <div>
        {/* Compact Framed Heritage Scene Art */}
        <Link
          href={`/weddings/${edition.id}`}
          aria-label={`Preview ${edition.editorialName}`}
          className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#C9A243]/25 bg-[#161013] sm:aspect-[5/4] sm:rounded-2xl"
          style={{
            background: `linear-gradient(155deg, ${edition.palette.primary} 0%, ${edition.palette.primaryHover} 100%)`,
          }}
        >
          {!sceneFailed ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={edition.sceneArtUrl}
              alt={`${edition.editorialName} wedding invitation artwork`}
              onError={() => setSceneFailed(true)}
              className="h-full w-full object-cover object-bottom transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          ) : null}

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: isDark
                ? 'linear-gradient(180deg, rgba(20,9,13,0.48) 0%, rgba(20,9,13,0.12) 45%, rgba(20,9,13,0.72) 100%)'
                : 'linear-gradient(180deg, rgba(255,253,247,0.45) 0%, rgba(20,13,16,0.06) 45%, rgba(20,13,16,0.68) 100%)',
            }}
          />

          {/* Top Compact Badges */}
          <div className="pointer-events-none absolute inset-x-1.5 top-1.5 flex items-center justify-between gap-1 sm:inset-x-2.5 sm:top-2.5">
            <span className="max-w-[58%] truncate rounded-full border border-[#E4C77B]/35 bg-[#161013]/80 px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.06em] text-[#F5E0A3] backdrop-blur-xs sm:px-2.5 sm:text-[10px]">
              {edition.traditionLabel}
            </span>
            {savings > 0 ? (
              <span className="shrink-0 rounded-full bg-[#154230]/92 px-1.5 py-0.5 text-[8.5px] font-bold text-[#ECFAF3] shadow-xs sm:px-2 sm:text-[10px]">
                {site.common.save} {formatInrComma(savings)}
              </span>
            ) : null}
          </div>

          {/* Bottom Calligraphy Specimen */}
          <div className="pointer-events-none absolute inset-x-2 bottom-1.5 flex items-end justify-between gap-1 sm:inset-x-3 sm:bottom-2.5">
            <div className="min-w-0">
              <p className="truncate font-royal-script text-base leading-none text-[#FFF9EC] drop-shadow sm:text-2xl">
                {edition.specimenCouple}
              </p>
              <p className="mt-0.5 truncate text-[8.5px] font-semibold uppercase tracking-[0.14em] text-[#F2DFAD]/90 sm:text-[10px]">
                {edition.specimenCity} · {editionNumber}
              </p>
            </div>
            <span className="hidden rounded-full border border-white/25 bg-black/35 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-xs sm:inline-flex">
              {edition.validityDays}d live
            </span>
          </div>
        </Link>

        {/* Compact Title + Dynamic Price */}
        <div className="px-1 pt-2 sm:px-1.5 sm:pt-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-1.5 gap-y-0.5">
            <h3 className="font-royal-serif text-[14px] font-semibold leading-tight text-[#1F1419] sm:text-lg">
              {edition.editorialName}
            </h3>
            <div className="flex shrink-0 items-baseline gap-1 font-tabular">
              <span className="text-[10px] font-medium text-[#1F1419]/40 line-through sm:text-xs">
                {formatInrComma(edition.compareAtInr)}
              </span>
              <span className="font-royal-serif text-sm font-bold text-[#1F1419] sm:text-lg">
                {formatInrComma(edition.priceInr)}
              </span>
            </div>
          </div>

          <p className="mt-0.5 line-clamp-1 text-[10.5px] font-medium text-[#6B574C] sm:text-xs">
            {edition.collectionSubtitle}
          </p>
        </div>
      </div>

      {/* Compact Action Footer (Zero Awkward Wrapping in 2-Up Mobile) */}
      <div className="mt-2.5 flex flex-col gap-1.5 px-1 pb-0.5 sm:mt-3 sm:grid sm:grid-cols-[1.3fr_0.9fr] sm:px-1.5">
        <Link
          href={`/weddings/${edition.id}/customize`}
          className="btn-spring inline-flex min-h-[38px] items-center justify-center rounded-full px-2.5 text-[11px] font-bold tracking-[0.04em] text-[#FAF6EE] shadow-xs transition hover:brightness-110 sm:min-h-[42px] sm:text-xs"
          style={{ backgroundColor: edition.palette.primary }}
        >
          {site.weddings.card.customizeAndPay}
        </Link>
        <Link
          href={`/weddings/${edition.id}`}
          className="btn-spring inline-flex min-h-[36px] items-center justify-center rounded-full border border-[#C9A243]/45 bg-[#FAF6EE] px-2.5 text-[11px] font-bold text-[#3B2A2F] transition hover:border-[#8C6B22] hover:bg-white sm:min-h-[42px] sm:text-xs"
        >
          {site.weddings.card.interactiveDemo}
        </Link>
      </div>
    </article>
  );
}
