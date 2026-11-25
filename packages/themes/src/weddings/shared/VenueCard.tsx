'use client';

import React, { useState } from 'react';
import { getWeddingUiCopy } from '../i18n';
import type { WeddingLanguage, WeddingThemeKey, WeddingVenueHighlight } from '../schema';
import { getWeddingThemePalette } from '../themePalettes';
import { WeddingMandapArt } from './WeddingArt';

interface VenueCardProps {
  venue?: WeddingVenueHighlight;
  language?: WeddingLanguage;
  theme?: WeddingThemeKey;
  compact?: boolean;
}

export function VenueCard({
  venue,
  language = 'en',
  theme = 'emerald',
  compact = false,
}: VenueCardProps) {
  const [copiedVenue, setCopiedVenue] = useState(false);
  if (!venue) return null;

  async function handleCopyVenue() {
    if (!venue) return;
    const text = `${venue.name}, ${venue.city}`;
    await navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedVenue(true);
    setTimeout(() => setCopiedVenue(false), 2000);
  }

  const copy = getWeddingUiCopy(language);
  const pal = getWeddingThemePalette(theme);
  const isChristian = pal.tradition === 'christian';

  const bandBgClass = pal.bandBgClass;
  const bandStyle: React.CSSProperties = {
    backgroundImage: pal.venueBandGradient,
  };

  const goldAccent = pal.goldAccent;
  const chapterLabel =
    language === 'en'
      ? isChristian
        ? 'IV · The Chapel & Venue'
        : 'IV · The Palace'
      : `IV · ${copy.venue.eyebrow}`;

  const ctaTextColor = pal.ctaTextColor;
  const ctaStyle: React.CSSProperties = {
    background: pal.ctaGradient,
    boxShadow: '0 10px 26px -10px rgba(230, 190, 92, 0.55)',
  };

  return (
    <section
      id="wedding-venue"
      className={`relative w-full overflow-hidden border-y border-[#D4AF37]/45 text-[#FFFDF8] ${bandBgClass} ${
        compact
          ? 'py-10 px-4 scroll-mt-16'
          : 'py-14 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20'
      }`}
      style={bandStyle}
    >
      {/* Top & Bottom Inner Antique-Gold Double Hairlines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[6px] h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent 4%, ${goldAccent}66 50%, transparent 96%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[6px] h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent 4%, ${goldAccent}66 50%, transparent 96%)`,
        }}
      />

      {/* Whisper-Light Architectural Jaali Lattice Atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `radial-gradient(${goldAccent} 0.85px, transparent 0.85px)`,
          backgroundSize: '28px 28px',
        }}
      />

      <div
        className={`relative z-10 mx-auto ${
          compact
            ? 'max-w-md text-center'
            : 'max-w-6xl text-center md:text-left'
        }`}
      >
        <div
          className={
            compact
              ? 'flex flex-col items-center'
              : 'flex flex-col items-center md:grid md:grid-cols-12 md:items-center md:gap-10 lg:gap-14'
          }
        >
          {/* Left 5 Cols (Tablet/Desktop) / Portrait Centerpiece (Mobile): Pointed Palace Jharokha Arch Framing WeddingMandapArt */}
          <div
            className={
              compact
                ? 'order-2 my-5 w-60 mx-auto'
                : 'order-2 md:order-1 my-6 md:my-0 w-64 sm:w-72 md:w-full md:col-span-5 mx-auto'
            }
          >
            <div className="relative mx-auto max-w-[330px] px-5 pt-10 pb-7 sm:px-7 sm:pt-12 sm:pb-8">
              {/* Warm Candlelight Radial Illumination Behind WeddingMandapArt */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-4 rounded-full blur-2xl"
                style={{
                  background:
                    'radial-gradient(circle at 50% 56%, rgba(248, 214, 122, 0.28) 0%, rgba(212, 165, 62, 0.08) 48%, transparent 74%)',
                }}
              />

              {/* Ornate Pointed Palace Jharokha Arch Frame SVG */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 320 340"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
              >
                {/* Outer Pointed Cusped Arch */}
                <path
                  d="M 12 328 L 12 128 C 12 88, 38 62, 74 48 C 106 36, 136 24, 160 8 C 184 24, 214 36, 246 48 C 282 62, 308 88, 308 128 L 308 328 Z"
                  fill="rgba(255, 244, 210, 0.035)"
                  stroke={goldAccent}
                  strokeOpacity="0.58"
                  strokeWidth="1.25"
                />
                {/* Inner Delicate Filigree Arch Hairline */}
                <path
                  d="M 21 320 L 21 132 C 21 96, 44 72, 78 59 C 108 47, 138 35, 160 20 C 182 35, 212 47, 242 59 C 276 72, 299 96, 299 132 L 299 320 Z"
                  stroke={goldAccent}
                  strokeOpacity="0.26"
                  strokeWidth="0.9"
                />
                {/* Crown Finial Pip */}
                <circle cx="160" cy="8" r="2.5" fill="#F8E2A0" />
                {/* Plinth Accent Line */}
                <line x1="28" y1="312" x2="292" y2="312" stroke={goldAccent} strokeOpacity="0.3" strokeWidth="0.8" />
              </svg>

              <div className="relative z-10 flex flex-col items-center">
                <WeddingMandapArt
                  theme={theme}
                  className="w-full h-auto max-w-[252px] mx-auto drop-shadow-[0_10px_22px_rgba(0,0,0,0.35)]"
                />
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Monumental Palace Editorial Details */}
          <div
            className={
              compact
                ? 'contents'
                : 'contents md:flex md:flex-col md:items-start md:order-2 md:col-span-7'
            }
          >
            {/* Roman Chapter Eyebrow */}
            <div
              className={`flex items-center justify-center md:justify-start gap-3 ${
                compact ? 'order-1' : 'order-1 md:order-none'
              }`}
            >
              <span
                className="h-[1px] w-7 sm:w-10"
                style={{ background: `linear-gradient(90deg, transparent, ${goldAccent})` }}
                aria-hidden="true"
              />
              <span
                className={`font-royal-serif font-bold uppercase tracking-[0.28em] text-[#ECCD78] ${
                  compact ? 'text-[9.5px]' : 'text-[10.5px] md:text-[11px]'
                }`}
              >
                {chapterLabel}
              </span>
              <span
                className="h-[1px] w-7 sm:w-10 md:hidden"
                style={{ background: `linear-gradient(270deg, transparent, ${goldAccent})` }}
                aria-hidden="true"
              />
            </div>

            {/* Monumental Luminous Cream-Gold Venue Title */}
            <h2
              className={`font-royal-serif font-semibold tracking-wide leading-[1.12] text-[#FFF9EC] ${
                compact
                  ? 'order-3 text-2xl'
                  : 'order-3 md:order-none md:mt-3 text-3xl sm:text-4xl lg:text-5xl'
              }`}
              style={{ textShadow: '0 4px 20px rgba(0, 0, 0, 0.35)' }}
            >
              {venue.name}
            </h2>

            {/* City with Flanking Gold Hairlines */}
            <div
              className={`mt-2.5 flex items-center justify-center md:justify-start gap-3 ${
                compact ? 'order-4' : 'order-4 md:order-none md:mt-3'
              }`}
            >
              <span
                className="h-[1px] w-7 sm:w-10"
                style={{ background: `linear-gradient(90deg, transparent, ${goldAccent})` }}
                aria-hidden="true"
              />
              <span
                className="h-1.5 w-1.5 rotate-45 shrink-0"
                style={{ backgroundColor: goldAccent }}
                aria-hidden="true"
              />
              <p
                className={`font-royal-serif font-bold uppercase tracking-[0.26em] text-[#EED07E] ${
                  compact ? 'text-[11px]' : 'text-xs md:text-[13px]'
                }`}
              >
                {venue.city}
              </p>
              <span
                className="h-1.5 w-1.5 rotate-45 shrink-0"
                style={{ backgroundColor: goldAccent }}
                aria-hidden="true"
              />
              <span
                className="h-[1px] w-7 sm:w-10"
                style={{ background: `linear-gradient(270deg, transparent, ${goldAccent})` }}
                aria-hidden="true"
              />
            </div>

            {/* Poetic Venue Narrative */}
            <p
              className={`mt-4 leading-[1.85] font-royal-serif text-[#F7EFE0]/90 ${
                compact
                  ? 'order-5 text-[13px] max-w-[310px] mx-auto'
                  : 'order-5 md:order-none md:mt-5 text-sm sm:text-[15px] lg:text-base max-w-md mx-auto md:max-w-xl md:mx-0'
              }`}
            >
              {venue.tagline}
            </p>

            {/* Travel / Transfer Concierge Badge */}
            {venue.distanceNote ? (
              <div
                className={`mt-5 inline-flex items-center gap-2.5 rounded-xl border border-[#D4AF37]/35 bg-black/20 px-4 py-2.5 text-left ${
                  compact
                    ? 'order-6 max-w-[310px] mx-auto'
                    : 'order-6 md:order-none md:mt-6 max-w-md mx-auto md:max-w-xl md:mx-0'
                }`}
              >
                <svg
                  className="h-4 w-4 shrink-0 text-[#ECCD78]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21c4.5-4.3 7-7.7 7-11a7 7 0 10-14 0c0 3.3 2.5 6.7 7 11z"
                  />
                  <circle cx="12" cy="10" r="2.2" />
                </svg>
                <p
                  className={`font-medium leading-snug text-[#F6E3AF]/90 ${
                    compact ? 'text-[11px]' : 'text-xs lg:text-[13px]'
                  }`}
                >
                  {venue.distanceNote}
                </p>
              </div>
            ) : null}

            {/* Gleaming Antique-Gold Google Maps CTA + Copy Venue */}
            <div
              className={`mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3 ${
                compact ? 'order-7' : 'order-7 md:order-none md:mt-8'
              }`}
            >
              <a
                href={venue.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={ctaStyle}
                className={`btn-spring group inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-full px-6 py-2.5 font-royal-serif text-xs font-bold uppercase tracking-[0.18em] transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5E3B3] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${ctaTextColor} ${
                  compact ? '' : 'md:px-8 md:text-[12.5px]'
                }`}
              >
                <span>{copy.venue.openGoogleMaps}</span>
                <svg
                  className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
                </svg>
              </a>

              <button
                type="button"
                onClick={handleCopyVenue}
                className="btn-spring inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-[#F5D67B]/45 bg-black/20 px-5 py-2.5 font-royal-serif text-xs font-bold uppercase tracking-[0.16em] text-[#FCE4A0] transition hover:border-[#F5D67B] hover:bg-black/35 active:scale-95"
              >
                <span>{copiedVenue ? 'Venue Copied' : 'Copy Address'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
