'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { getSiteCopy } from '@webzy/core';
import { useLanguage } from '../shell/LanguageProvider';
import { formatInrComma, type WeddingEditionMeta } from './weddingCatalog';

interface WeddingEditionCardProps {
  edition: WeddingEditionMeta;
}

export function WeddingEditionCard({ edition }: WeddingEditionCardProps) {
  const { language } = useLanguage();
  const site = getSiteCopy(language);
  const [coverFailed, setCoverFailed] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [ceremonyFailed, setCeremonyFailed] = useState(false);

  const savings = edition.compareAtInr - edition.priceInr;
  const coupleInitials = edition.monogram;
  const editionIndex = edition.editionRoman;
  const isDark = edition.isDarkTheme;

  const badgePills = Array.from(
    new Set([
      ...edition.highlights,
      'Click-Through Deck',
      '9 Languages',
      `${edition.validityDays} Days Live`,
    ]),
  );

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] border border-[#C9A243]/35 bg-[#FFFDF9] p-2.5 shadow-[0_24px_56px_-26px_rgba(26,16,20,0.22)] transition-all duration-500 hover:border-[#C9A243]/65 hover:shadow-[0_32px_70px_-24px_rgba(26,16,20,0.3)] sm:p-3">
      <div className="flex h-full flex-col justify-between overflow-hidden rounded-[16px] border border-[#C9A243]/20 bg-[#FFFDF9]">
        <div>
          {/* 3 Hand-Painted Art Plates: I · Cover + II · Inside + III · Ceremony */}
          <Link
            href={`/weddings/${edition.id}`}
            className="relative block overflow-hidden bg-[#161013]"
            aria-label={`Preview ${edition.editorialName}`}
          >
            <div className="grid aspect-[16/11] w-full grid-cols-2">
              {/* Left Plate: Tactile Opening Cover */}
              <div
                className="relative h-full w-full overflow-hidden border-r border-[#D4AF37]/45"
                style={{
                  background: `linear-gradient(160deg, ${edition.palette.primary} 0%, ${edition.palette.primaryHover} 100%)`,
                }}
              >
                {!coverFailed ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={edition.coverArtUrl}
                    alt={`${edition.editorialName} animated opening cover`}
                    onError={() => setCoverFailed(true)}
                    className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.06]"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[#120A0D]/65 via-[#120A0D]/15 to-[#120A0D]/25" />

                {/* Centered Embossed Medallion / Hand-Pressed Wax Seal Specimen */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                  <div
                    className={`flex h-[70px] w-[70px] flex-col items-center justify-center rounded-full border shadow-[0_12px_28px_rgba(0,0,0,0.35)] transition-transform duration-500 ease-out group-hover:scale-110 sm:h-[76px] sm:w-[76px] ${
                      !isDark
                        ? 'border-[#D4AF37] bg-[#FFFDF8]/95 text-[#1F3524] ring-4 ring-[#D4AF37]/20'
                        : 'border-[#F2D28B]/80 bg-[#180E16]/90 text-[#FAF0D7] ring-4 ring-[#D4AF37]/25'
                    }`}
                  >
                    <span className="font-royal-script text-lg font-normal leading-none sm:text-xl">
                      {coupleInitials}
                    </span>
                    <span className="mt-1 font-royal-serif text-[7px] font-semibold uppercase tracking-[0.26em] opacity-80">
                      {edition.coverSealLabel}
                    </span>
                  </div>
                </div>

                <span className="absolute bottom-3 left-3 rounded-full border border-[#E4C77B]/25 bg-[#161013]/75 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#FAF6EE]/90 backdrop-blur-sm">
                  I · Cover
                </span>
              </div>

              {/* Right Plate: Revealed Inside Palace Scene */}
              <div
                className="relative h-full w-full overflow-hidden"
                style={{
                  background: !isDark
                    ? `linear-gradient(180deg, #FDFBF5 0%, ${edition.palette.surface} 100%)`
                    : `linear-gradient(180deg, ${edition.palette.primary} 0%, ${edition.palette.primaryHover} 100%)`,
                }}
              >
                {!sceneFailed ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={edition.sceneArtUrl}
                    alt={`${edition.editorialName} revealed architectural scene`}
                    onError={() => setSceneFailed(true)}
                    className="h-full w-full object-cover object-bottom transition-transform duration-1000 ease-out group-hover:scale-[1.06]"
                  />
                ) : null}

                {/* Couple Calligraphy Specimen Positioned in Upper Sky Cavity */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-start px-3 pt-9 sm:pt-11 text-center ${
                    !isDark
                      ? 'bg-gradient-to-b from-[#FFFDF7]/65 via-[#FFFDF7]/25 to-[#140D10]/20'
                      : 'bg-gradient-to-b from-[#14070B]/55 via-[#14070B]/20 to-[#14070B]/35'
                  }`}
                >
                  <span
                    className={`font-royal-serif text-[9px] font-semibold uppercase tracking-[0.28em] ${
                      !isDark ? 'text-[#735619]' : 'text-[#F0CF78]'
                    }`}
                  >
                    {edition.specimenCity}
                  </span>
                  <p
                    className={`mt-1 font-royal-script text-lg leading-tight drop-shadow-sm xs:text-2xl sm:text-[28px] ${
                      !isDark ? 'text-[#1D3222]' : 'text-[#FFF7E2]'
                    }`}
                  >
                    {edition.specimenCouple}
                  </p>
                  <span
                    className={`mt-1 sm:mt-1.5 border-y px-2 py-0.5 font-royal-serif text-[8.5px] font-semibold uppercase tracking-[0.16em] sm:px-2.5 sm:text-[9px] sm:tracking-[0.2em] ${
                      !isDark
                        ? 'border-[#C9A243]/75 text-[#5F4512]'
                        : 'border-[#E5C158]/60 text-[#F5DC93]'
                    }`}
                  >
                    {edition.specimenDate}
                  </span>
                </div>

                <span className="absolute bottom-2.5 right-2.5 rounded-full border border-[#E4C77B]/25 bg-[#161013]/75 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#FAF6EE]/90 backdrop-blur-sm sm:bottom-3 sm:right-3 sm:tracking-[0.2em]">
                  II · Inside
                </span>
              </div>
            </div>

            {/* Top Velvet Tradition & Savings Plaques */}
            <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-center justify-between gap-2 sm:inset-x-3 sm:top-3">
              <span className="rounded-full border border-[#E4C77B]/35 bg-[#161013]/82 px-2.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.14em] text-[#F2DFAD] backdrop-blur-sm sm:px-3 sm:py-1 sm:text-[9px] sm:tracking-[0.18em]">
                {edition.traditionLabel}
              </span>
              {savings > 0 ? (
                <span className="ml-auto rounded-full border border-[#72C8A2]/30 bg-[#154230]/90 px-2.5 py-0.5 text-[9.5px] font-semibold tracking-[0.04em] text-[#ECFAF3] shadow-sm backdrop-blur-sm sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-[0.06em]">
                  {site.common.save} {formatInrComma(savings)}
                </span>
              ) : null}
            </div>

            {/* Bottom Panoramic Ceremony Miniature Plate */}
            {!ceremonyFailed ? (
              <div className="relative aspect-[16/8] w-full overflow-hidden border-t border-[#D4AF37]/45 bg-[#161013]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={edition.ceremonyArtUrl}
                  alt={`${edition.editorialName} ${edition.ceremonyArtCaption}`}
                  onError={() => setCeremonyFailed(true)}
                  className={`h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04] ${
                    edition.id === 'wedding-temple-gold-01' || edition.id === 'wedding-rose-ivory-01'
                      ? 'object-bottom scale-[1.04]'
                      : 'object-center'
                  } ${
                    edition.id === 'wedding-royal-red-01' ? 'scale-[1.06]' : ''
                  }`}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#120A0D]/55 via-transparent to-[#120A0D]/15" />
                <span className="absolute bottom-2.5 left-3 rounded-full border border-[#E4C77B]/30 bg-[#161013]/75 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#FAF6EE]/90 backdrop-blur-sm">
                  III · Ceremony · {edition.ceremonyArtCaption}
                </span>
              </div>
            ) : null}
          </Link>

          {/* Crisp Tag Header & Tactile Pill Badges (Zero Long Paragraphs) */}
          <div className="px-4 pb-4 pt-4 sm:px-6 sm:pt-6">
            <div className="flex flex-wrap items-start justify-between gap-2.5 sm:flex-nowrap sm:gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C6B22] sm:tracking-[0.22em]">
                  {editionIndex} · {edition.collectionSubtitle}
                </p>
                <h3 className="mt-1 font-royal-serif text-2xl font-semibold leading-[1.06] tracking-[-0.01em] text-[#1F1419] sm:text-[32px]">
                  {edition.editorialName}
                </h3>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B574C] sm:tracking-[0.14em]">
                  {edition.storyLead}
                </p>
              </div>

              <div className="shrink-0 text-left font-tabular sm:text-right">
                <div className="flex items-baseline gap-2 sm:justify-end">
                  <span className="text-xs font-medium text-[#1F1419]/40 line-through">
                    {formatInrComma(edition.compareAtInr)}
                  </span>
                  <span className="font-royal-serif text-2xl font-semibold leading-none text-[#1F1419] sm:text-3xl">
                    {formatInrComma(edition.priceInr)}
                  </span>
                </div>
                <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-[#7A685B]">
                  {site.common.gstInclusive}
                </span>
              </div>
            </div>

            {/* Tactile Pill Badges Row */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-[#C9A243]/25 pt-3.5">
              {badgePills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-[#C9A243]/35 bg-[#FAF6EE] px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.03em] text-[#3B2A2F]"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sculptural Atelier Action Footer */}
        <div className="space-y-2 border-t border-[#C9A243]/20 bg-[#FAF6EE]/65 px-4 py-4 sm:px-6">
          <Link
            href={`/weddings/${edition.id}/customize`}
            className="btn-spring flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full border border-[#E4C77B]/30 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#FAF6EE] shadow-sm transition hover:brightness-110 sm:tracking-[0.16em]"
            style={{ backgroundColor: edition.palette.primary }}
          >
            <span>
              {site.weddings.card.customizeAndPay} {formatInrComma(edition.priceInr)} →
            </span>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/weddings/${edition.id}`}
              className="btn-spring flex min-h-[44px] items-center justify-center rounded-full border border-[#C9A243]/40 bg-[#FFFDF9] px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3B2A2F] transition hover:border-[#8C6B22] hover:text-[#1F1419] sm:tracking-[0.14em]"
            >
              {site.weddings.card.interactiveDemo}
            </Link>
            <Link
              href={`/i/${edition.demoSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-spring flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-[#C9A243]/40 bg-[#FFFDF9] px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3B2A2F] transition hover:border-[#8C6B22] hover:text-[#1F1419] sm:tracking-[0.14em]"
            >
              <span>{site.weddings.card.fullScreen}</span>
              <svg
                className="h-3.5 w-3.5 opacity-65"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
