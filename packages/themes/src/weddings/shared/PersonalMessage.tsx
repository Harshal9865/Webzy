'use client';

import React from 'react';
import { getWeddingUiCopy } from '../i18n';
import type { WeddingLanguage, WeddingThemeKey } from '../schema';
import { getWeddingThemePalette } from '../themePalettes';
import { MangalKalashCrest, MarigoldToran, VarmalaDiyaDivider } from './WeddingArt';

interface PersonalMessageProps {
  message: string;
  brideName?: string;
  groomName?: string;
  brideParents?: string;
  groomParents?: string;
  hashtag?: string;
  guestName?: string | null;
  language?: WeddingLanguage;
  theme?: WeddingThemeKey;
  compact?: boolean;
}

const HINDU_CHAPTER_EYEBROW: Record<WeddingLanguage, string> = {
  en: 'I · Shubh Aamantran',
  hi: 'I · शुभ आमंत्रण',
  gu: 'I · શુભ આમંત્રણ',
  mr: 'I · शुभ आमंत्रण',
  pa: 'I · ਸ਼ੁਭ ਸੱਦਾ',
  bn: 'I · শুভ নিমন্ত্রণ',
  ta: 'I · சுப அழைப்பிதழ்',
  te: 'I · శుభ ఆహ్వానం',
  kn: 'I · ಶುಭ ಆಮಂತ್ರಣ',
};

const CHRISTIAN_CHAPTER_EYEBROW: Record<WeddingLanguage, string> = {
  en: 'I · Cordial Invitation',
  hi: 'I · सादर निमंत्रण',
  gu: 'I · સ્નેહભર્યું આમંત્રણ',
  mr: 'I · स्नेहपूर्वक निमंत्रण',
  pa: 'I · ਪਿਆਰ ਭਰਿਆ ਸੱਦਾ',
  bn: 'I · সাদর আমন্ত্রণ',
  ta: 'I · அன்பான அழைப்பிதழ்',
  te: 'I · ఆత్మీయ ఆహ్వానం',
  kn: 'I · ಆತ್ಮೀಯ ಆಮಂತ್ರಣ',
};

export function PersonalMessage({
  message,
  brideName,
  groomName,
  brideParents,
  groomParents,
  hashtag,
  guestName,
  language = 'en',
  theme = 'emerald',
  compact = false,
}: PersonalMessageProps) {
  const copy = getWeddingUiCopy(language);
  const pal = getWeddingThemePalette(theme);
  const isChristian = pal.tradition === 'christian';
  const chapterEyebrow = isChristian
    ? (CHRISTIAN_CHAPTER_EYEBROW[language] ?? CHRISTIAN_CHAPTER_EYEBROW.en)
    : (HINDU_CHAPTER_EYEBROW[language] ?? HINDU_CHAPTER_EYEBROW.en);

  const outerBorder = pal.outerBorder;
  const innerRuleBorder = pal.innerRuleBorder;
  const paperSurface = pal.paperSurface;
  const accentText = pal.accentText;
  const proseText = pal.proseText;
  const mutedInk = pal.mutedInk;
  const goldInk = pal.goldInk;
  const goldStroke = pal.goldStroke;
  const plaqueTint = pal.plaqueTint;

  const hasBothParents = Boolean(brideParents && groomParents);
  const brideInitial = brideName?.trim().charAt(0).toUpperCase() || pal.defaultInitials[0];
  const groomInitial = groomName?.trim().charAt(0).toUpperCase() || pal.defaultInitials[1];
  const watermarkMonogram = `${brideInitial} & ${groomInitial}`;

  return (
    <section
      className={
        compact
          ? 'w-full py-7 px-3.5'
          : 'w-full py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8'
      }
    >
      <div
        className={`relative mx-auto overflow-hidden border text-center ${paperSurface} ${outerBorder} ${
          compact
            ? 'max-w-md rounded-[20px] px-5 py-9 shadow-[0_14px_36px_-22px_rgba(32,26,18,0.22)]'
            : 'max-w-4xl rounded-[22px] md:rounded-[26px] px-6 py-11 sm:px-11 sm:py-14 md:px-16 md:py-16 lg:px-20 lg:py-20 shadow-[0_24px_60px_-34px_rgba(32,26,18,0.24)]'
        }`}
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(232, 205, 134, 0.14) 0%, rgba(255, 253, 248, 0) 68%)',
        }}
      >
        {/* Heirloom Double-Hairline Inner Inset Frame */}
        <div
          className={`pointer-events-none absolute border ${innerRuleBorder} ${
            compact
              ? 'inset-2 rounded-[14px]'
              : 'inset-2.5 sm:inset-3.5 md:inset-4 rounded-[15px] md:rounded-[18px]'
          }`}
          aria-hidden="true"
        />

        {/* Delicate Engraved Corner Brackets on Inner Frame */}
        <svg
          className={`pointer-events-none absolute ${
            compact ? 'top-2.5 left-2.5 h-5 w-5' : 'top-4 left-4 md:top-5 md:left-5 h-6 w-6'
          }`}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M2 14V4C2 2.9 2.9 2 4 2H14" stroke={goldStroke} strokeWidth="1.15" strokeOpacity="0.7" />
          <path d="M6 6L9 6L6 9Z" fill={goldStroke} fillOpacity="0.45" />
        </svg>
        <svg
          className={`pointer-events-none absolute ${
            compact ? 'top-2.5 right-2.5 h-5 w-5' : 'top-4 right-4 md:top-5 md:right-5 h-6 w-6'
          }`}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M22 14V4C22 2.9 21.1 2 20 2H10" stroke={goldStroke} strokeWidth="1.15" strokeOpacity="0.7" />
          <path d="M18 6L15 6L18 9Z" fill={goldStroke} fillOpacity="0.45" />
        </svg>
        <svg
          className={`pointer-events-none absolute ${
            compact ? 'bottom-2.5 left-2.5 h-5 w-5' : 'bottom-4 left-4 md:bottom-5 md:left-5 h-6 w-6'
          }`}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M2 10V20C2 21.1 2.9 22 4 22H14" stroke={goldStroke} strokeWidth="1.15" strokeOpacity="0.7" />
          <path d="M6 18L9 18L6 15Z" fill={goldStroke} fillOpacity="0.45" />
        </svg>
        <svg
          className={`pointer-events-none absolute ${
            compact ? 'bottom-2.5 right-2.5 h-5 w-5' : 'bottom-4 right-4 md:bottom-5 md:right-5 h-6 w-6'
          }`}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M22 10V20C22 21.1 21.1 22 20 22H10" stroke={goldStroke} strokeWidth="1.15" strokeOpacity="0.7" />
          <path d="M18 18L15 18L18 15Z" fill={goldStroke} fillOpacity="0.45" />
        </svg>

        {/* Whisper-Light Corner Toran Drape */}
        <div className="pointer-events-none absolute top-0 inset-x-0 opacity-55" aria-hidden="true">
          {compact ? (
            <MarigoldToran theme={theme} />
          ) : (
            <>
              <MarigoldToran theme={theme} className="md:hidden" />
              <MarigoldToran theme={theme} wide className="hidden md:block" />
            </>
          )}
        </div>

        {/* Faint Centered Couple Monogram Watermark Behind Blessing Prose */}
        <div
          className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden"
          aria-hidden="true"
        >
          <span
            className={`font-royal-script leading-none tracking-wider ${accentText} ${
              compact
                ? 'text-[92px] opacity-[0.045] -translate-y-8'
                : 'text-[120px] sm:text-[168px] md:text-[210px] lg:text-[240px] opacity-[0.042] -translate-y-6'
            }`}
          >
            {watermarkMonogram}
          </span>
        </div>

        <div className="relative z-10 flex flex-col items-center pt-3">
          {/* Sacred Mangal Kalash Crown */}
          <MangalKalashCrest
            theme={theme}
            className={compact ? 'h-14 w-14 mb-3.5' : 'h-14 w-14 md:h-16 md:w-16 mb-4 md:mb-5'}
          />

          {/* Roman Chapter Eyebrow with Flanking Antique-Gold Hairlines */}
          <div className={`flex items-center justify-center gap-3 ${compact ? 'mb-4' : 'mb-5 md:mb-6'}`}>
            <span
              className="h-[1px] w-7 sm:w-11"
              style={{ background: `linear-gradient(90deg, transparent, ${goldStroke})` }}
              aria-hidden="true"
            />
            <span
              className={`font-royal-serif font-bold uppercase tracking-[0.28em] ${goldInk} ${
                compact ? 'text-[9.5px]' : 'text-[10px] sm:text-[11px]'
              }`}
            >
              {chapterEyebrow}
            </span>
            <span
              className="h-[1px] w-7 sm:w-11"
              style={{ background: `linear-gradient(270deg, transparent, ${goldStroke})` }}
              aria-hidden="true"
            />
          </div>

          {/* Unboxed Personalized Guest Salutation */}
          {guestName ? (
            <div className={compact ? 'mb-4' : 'mb-5 md:mb-7'}>
              <span
                className={`font-royal-serif text-[10px] md:text-[11px] font-bold uppercase tracking-[0.26em] block ${goldInk}`}
              >
                {copy.message.dearPrefix}
              </span>
              <p
                className={`font-royal-script leading-tight mt-1 break-words ${accentText} ${
                  compact ? 'text-3xl' : 'text-3xl sm:text-4xl md:text-[44px]'
                }`}
              >
                {guestName}
              </p>
            </div>
          ) : null}

          {/* Refined Engraved Quotation Ornament */}
          <svg
            className={compact ? 'h-4 w-8 mb-2.5 opacity-65' : 'h-5 w-10 mb-3.5 opacity-70'}
            viewBox="0 0 48 20"
            fill="none"
            aria-hidden="true"
          >
            <path d="M2 10H16" stroke={goldStroke} strokeWidth="0.9" strokeOpacity="0.65" />
            <path d="M32 10H46" stroke={goldStroke} strokeWidth="0.9" strokeOpacity="0.65" />
            <path
              d="M24 3L28.5 10L24 17L19.5 10L24 3Z"
              stroke={goldStroke}
              strokeWidth="1"
              fill={goldStroke}
              fillOpacity="0.14"
            />
            <circle cx="24" cy="10" r="1.5" fill={goldStroke} />
          </svg>

          {/* Spacious Italic Vivah Patrika Invitation Prose */}
          <p
            className={`mx-auto font-royal-serif italic ${proseText} ${
              compact
                ? 'max-w-[320px] text-[15px] leading-[1.85]'
                : 'max-w-2xl text-base sm:text-[17.5px] md:text-xl leading-relaxed md:leading-[1.9]'
            }`}
          >
            &ldquo;{message}&rdquo;
          </p>

          {/* Engraved Vadhu Paksha & Var Paksha Host Plaques */}
          {(brideParents || groomParents) && (
            <div
              className={`w-full border-t border-[#C5A059]/25 ${
                compact ? 'mt-8 pt-6' : 'mt-10 md:mt-12 lg:mt-14 pt-7 md:pt-9'
              }`}
            >
              <span
                className={`font-royal-serif text-[10px] font-bold uppercase tracking-[0.26em] block ${goldInk} ${
                  compact ? 'mb-5' : 'mb-6 md:mb-8 md:text-[11px]'
                }`}
              >
                {copy.message.withLoveBlessings}
              </span>

              <div
                className={
                  compact
                    ? 'relative grid grid-cols-1 gap-4 text-center'
                    : hasBothParents
                      ? 'relative grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-12 text-center items-stretch'
                      : 'relative grid grid-cols-1 max-w-md mx-auto text-center'
                }
              >
                {/* Delicate Antique-Gold Vertical Diamond Spindle (Desktop / Tablet 2-Column Divider) */}
                {!compact && hasBothParents && (
                  <div
                    className="pointer-events-none hidden md:flex flex-col items-center justify-center absolute inset-y-2 left-1/2 -translate-x-1/2"
                    aria-hidden="true"
                  >
                    <span
                      className="w-[1px] flex-1"
                      style={{ background: `linear-gradient(180deg, transparent, ${goldStroke})` }}
                    />
                    <span
                      className="my-2 h-2.5 w-2.5 rotate-45 border"
                      style={{
                        borderColor: goldStroke,
                        backgroundColor: '#FFFDF9',
                      }}
                    />
                    <span
                      className="w-[1px] flex-1"
                      style={{ background: `linear-gradient(180deg, ${goldStroke}, transparent)` }}
                    />
                  </div>
                )}

                {brideParents && (
                  <div
                    className={`rounded-2xl border flex flex-col items-center justify-center ${plaqueTint} ${
                      compact ? 'px-4 py-5' : 'px-5 py-6 md:px-7 md:py-7'
                    }`}
                  >
                    <span
                      className={`font-royal-serif text-[10px] md:text-[10.5px] font-bold uppercase tracking-[0.24em] block ${goldInk}`}
                    >
                      {copy.message.bridesFamily}
                    </span>
                    {brideName && (
                      <p
                        className={`font-royal-script leading-tight mt-1.5 ${accentText} ${
                          compact ? 'text-[26px]' : 'text-[28px] md:text-3xl lg:text-[34px]'
                        }`}
                      >
                        {brideName}
                      </p>
                    )}
                    <p className={`text-[10px] md:text-[11px] uppercase tracking-[0.18em] mt-1.5 ${mutedInk}`}>
                      {copy.message.daughterOf}
                    </p>
                    <p
                      className={`font-royal-serif font-semibold mt-1.5 leading-snug ${accentText} ${
                        compact ? 'text-xs' : 'text-xs sm:text-sm md:text-[15px]'
                      }`}
                    >
                      {brideParents}
                    </p>
                  </div>
                )}

                {/* Mobile / Compact Horizontal Diamond Spindle Between Both Families */}
                {hasBothParents && (
                  <div
                    className={`flex items-center justify-center gap-3 ${compact ? '' : 'md:hidden'}`}
                    aria-hidden="true"
                  >
                    <span
                      className="h-[1px] w-14"
                      style={{ background: `linear-gradient(90deg, transparent, ${goldStroke})` }}
                    />
                    <span
                      className="h-2 w-2 rotate-45 border"
                      style={{ borderColor: goldStroke }}
                    />
                    <span
                      className="h-[1px] w-14"
                      style={{ background: `linear-gradient(270deg, transparent, ${goldStroke})` }}
                    />
                  </div>
                )}

                {groomParents && (
                  <div
                    className={`rounded-2xl border flex flex-col items-center justify-center ${plaqueTint} ${
                      compact ? 'px-4 py-5' : 'px-5 py-6 md:px-7 md:py-7'
                    }`}
                  >
                    <span
                      className={`font-royal-serif text-[10px] md:text-[10.5px] font-bold uppercase tracking-[0.24em] block ${goldInk}`}
                    >
                      {copy.message.groomsFamily}
                    </span>
                    {groomName && (
                      <p
                        className={`font-royal-script leading-tight mt-1.5 ${accentText} ${
                          compact ? 'text-[26px]' : 'text-[28px] md:text-3xl lg:text-[34px]'
                        }`}
                      >
                        {groomName}
                      </p>
                    )}
                    <p className={`text-[10px] md:text-[11px] uppercase tracking-[0.18em] mt-1.5 ${mutedInk}`}>
                      {copy.message.sonOf}
                    </p>
                    <p
                      className={`font-royal-serif font-semibold mt-1.5 leading-snug ${accentText} ${
                        compact ? 'text-xs' : 'text-xs sm:text-sm md:text-[15px]'
                      }`}
                    >
                      {groomParents}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Understated Engraved Hashtag Seal */}
          {hashtag ? (
            <div
              className={
                compact
                  ? 'mt-7 flex flex-col items-center gap-2.5'
                  : 'mt-9 md:mt-11 flex flex-col items-center gap-3'
              }
            >
              <VarmalaDiyaDivider theme={theme} className="opacity-80" />
              <div
                className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 ${plaqueTint}`}
              >
                <span
                  className="h-1.5 w-1.5 rotate-45 shrink-0"
                  style={{ backgroundColor: goldStroke }}
                  aria-hidden="true"
                />
                <p
                  className={`font-royal-serif font-bold tracking-[0.2em] ${accentText} ${
                    compact ? 'text-[11px]' : 'text-xs sm:text-[13px]'
                  }`}
                >
                  {hashtag}
                </p>
                <span
                  className="h-1.5 w-1.5 rotate-45 shrink-0"
                  style={{ backgroundColor: goldStroke }}
                  aria-hidden="true"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
