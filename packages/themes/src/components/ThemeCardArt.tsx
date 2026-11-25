'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { ThemeManifest } from '../schema';

interface ThemeCardArtProps {
  theme: ThemeManifest;
}

const WEDDING_ART_PREVIEW: Record<
  string,
  { scene: string; couple: string; city: string; eyebrow: string; bg: string; isDark: boolean }
> = {
  'wedding-emerald-01': {
    scene: '/templates/wedding-emerald-01/art/jharokha-scene-wide.jpg',
    couple: 'Aanya & Kabir',
    city: 'Udaipur',
    eyebrow: 'Udaipur · Hindu Vivah',
    bg: 'linear-gradient(155deg, #2D4F35 0%, #1E3524 100%)',
    isDark: false,
  },
  'wedding-royal-red-01': {
    scene: '/templates/wedding-royal-red-01/art/mughal-scene-wide.jpg',
    couple: 'Riya & Siddharth',
    city: 'Jaipur',
    eyebrow: 'Jaipur · Royal Vivah',
    bg: 'linear-gradient(155deg, #6B0F1E 0%, #3A0710 100%)',
    isDark: true,
  },
  'wedding-royal-blue-01': {
    scene: '/templates/wedding-royal-blue-01/art/jodhpur-scene-wide.jpg',
    couple: 'Meera & Dev',
    city: 'Jodhpur',
    eyebrow: 'Jodhpur · Marwar Vivah',
    bg: 'linear-gradient(155deg, #132447 0%, #091326 100%)',
    isDark: true,
  },
  'wedding-temple-gold-01': {
    scene: '/templates/wedding-temple-gold-01/art/temple-gold-scene-wide.jpg',
    couple: 'Ananya & Karthik',
    city: 'Chennai',
    eyebrow: 'Chennai · Temple Muhurtham',
    bg: 'linear-gradient(155deg, #5A1812 0%, #310C09 100%)',
    isDark: false,
  },
  'wedding-rose-ivory-01': {
    scene: '/templates/wedding-rose-ivory-01/art/rose-palace-scene-wide.jpg',
    couple: 'Tara & Vihaan',
    city: 'Jaipur',
    eyebrow: 'Samode · Rose Garden Vivah',
    bg: 'linear-gradient(155deg, #6E3044 0%, #46202C 100%)',
    isDark: false,
  },
  'wedding-christian-ivory-01': {
    scene: '/templates/wedding-christian-ivory-01/art/chapel-scene-wide.jpg',
    couple: 'Claire & Aaron',
    city: 'South Goa',
    eyebrow: 'South Goa · Holy Matrimony',
    bg: 'linear-gradient(155deg, #2F3F33 0%, #202C24 100%)',
    isDark: false,
  },
};

const OCCASION_ART_PREVIEW: Record<
  string,
  { cover: string; isDark?: boolean }
> = {
  'birthday-confetti-01': {
    cover: '/templates/occasions/birthday-confetti/cover.jpg',
    isDark: true,
  },
  'birthday-ashirwad-01': {
    cover: '/templates/occasions/birthday-ashirwad/cover.jpg',
  },
  'will-you-01': {
    cover: '/templates/occasions/will-you/cover.jpg',
    isDark: true,
  },
  'our-timeline-01': {
    cover: '/templates/occasions/our-timeline/cover.jpg',
  },
  'maan-jao-01': {
    cover: '/templates/occasions/maan-jao/cover.jpg',
  },
  'make-them-smile-01': {
    cover: '/templates/occasions/make-them-smile/cover.jpg',
  },
  'our-year-01': {
    cover: '/templates/occasions/our-year/cover.jpg',
    isDark: true,
  },
  'harvest-greeting-01': {
    cover: '/templates/occasions/harvest-greeting/cover.jpg',
  },
  'business-greeting-01': {
    cover: '/templates/occasions/business-greeting/cover.jpg',
    isDark: true,
  },
};

export function ThemeCardArt({ theme }: ThemeCardArtProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const weddingPreview = WEDDING_ART_PREVIEW[theme.id];
  const occasionPreview = OCCASION_ART_PREVIEW[theme.id];

  useEffect(() => {
    setImgFailed(false);
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setImgLoaded(true);
    } else {
      setImgLoaded(false);
    }
  }, [theme.id]);

  if (weddingPreview) {
    const showLightOverlay = imgLoaded && !weddingPreview.isDark;

    return (
      <div
        className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-[#D4AF37]/40"
        style={{ background: weddingPreview.bg }}
        aria-hidden="true"
      >
        {!imgFailed ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={weddingPreview.scene}
            ref={imgRef}
            src={weddingPreview.scene}
            alt=""
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgLoaded(false);
              setImgFailed(true);
            }}
            className={`h-full w-full object-cover object-bottom transition-all duration-500 group-hover:scale-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : null}

        {/* Heritage Arch Filigree SVG shown cleanly whenever artwork .jpg is absent */}
        {!imgLoaded ? (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-45"
            viewBox="0 0 240 192"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M16 178 L16 64 C16 42, 42 28, 72 24 C92 20, 108 15, 120 10 C132 15, 148 20, 168 24 C198 28, 224 42, 224 64 L224 178 Z"
              stroke="#E5C158"
              strokeWidth="1.2"
            />
            <path
              d="M24 170 L24 68 C24 50, 46 37, 74 33 C94 30, 108 25, 120 20 C132 25, 146 30, 166 33 C194 37, 216 50, 216 68 L216 170 Z"
              stroke="#F5D67B"
              strokeWidth="0.7"
              strokeDasharray="3 3"
            />
          </svg>
        ) : null}

        <div
          className={`absolute inset-0 flex flex-col items-center p-2.5 sm:p-3 text-center ${
            imgLoaded ? 'justify-start pt-3 sm:pt-4' : 'justify-center'
          }`}
          style={{
            background: showLightOverlay
              ? 'linear-gradient(180deg, rgba(255, 253, 246, 0.72) 0%, rgba(255, 253, 246, 0.25) 45%, rgba(20, 38, 24, 0.08) 100%)'
              : 'linear-gradient(180deg, rgba(24, 4, 9, 0.56) 0%, rgba(24, 4, 9, 0.18) 48%, rgba(0, 0, 0, 0.14) 100%)',
          }}
        >
          <span
            className={`font-royal-serif text-[8px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.24em] ${
              showLightOverlay ? 'text-[#846218]' : 'text-[#F6DC88]'
            }`}
          >
            {weddingPreview.eyebrow}
          </span>
          <p
            className={`mt-0.5 sm:mt-1 font-royal-script text-xl sm:text-2xl leading-tight ${
              showLightOverlay ? 'text-[#1E3524]' : 'text-[#FFF7E2]'
            }`}
          >
            {weddingPreview.couple}
          </p>
          <span
            className={`mt-1 sm:mt-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] sm:tracking-[0.18em] ${
              showLightOverlay
                ? 'border-[#C9A243]/70 bg-white/85 text-[#2D4F35]'
                : 'border-[#E5C158]/60 bg-black/35 text-[#F8DF94]'
            }`}
          >
            Tap to Open
          </span>
        </div>
      </div>
    );
  }

  const { primary, secondary, surface, ink } = theme.palette;
  const showOccasionPhoto = Boolean(occasionPreview && !imgFailed);

  return (
    <div
      className="relative aspect-[5/4] w-full overflow-hidden rounded-xl sm:rounded-2xl border border-black/8"
      style={{
        background: `linear-gradient(150deg, ${surface} 0%, #ffffff 100%)`,
      }}
      aria-hidden="true"
    >
      {/* Bespoke Occasion Product Cover Artwork (synced automatically into /templates/occasions/...) */}
      {showOccasionPhoto ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={occasionPreview.cover}
          ref={imgRef}
          src={occasionPreview.cover}
          alt=""
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgLoaded(false);
            setImgFailed(true);
          }}
          className={`h-full w-full object-cover object-center transition-all duration-700 group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : null}

      {/* Fallback Ambient Shapes When Artwork Not Loaded Yet */}
      {!imgLoaded ? (
        <>
          <div
            className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20"
            style={{ backgroundColor: secondary }}
          />
          <div
            className="absolute -bottom-8 -left-6 h-28 w-28 rounded-full opacity-15"
            style={{ backgroundColor: primary }}
          />
        </>
      ) : null}

      {/* Frosted/Scrimmed Editorial Overlay Preserving Text Contrast Across All Card Sizes */}
      <div
        className={`relative flex h-full flex-col justify-between p-2.5 sm:p-3.5 ${
          imgLoaded
            ? occasionPreview?.isDark
              ? 'bg-gradient-to-b from-black/65 via-black/35 to-black/70'
              : 'bg-gradient-to-b from-white/88 via-white/45 to-white/85'
            : ''
        }`}
      >
        <div
          className={`flex h-full flex-col justify-between rounded-lg sm:rounded-xl p-2 sm:p-2.5 ${
            imgLoaded
              ? ''
              : 'border border-black/5 bg-white/90 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            <span
              className="hidden h-2 w-8 rounded-full sm:inline-block sm:h-2.5 sm:w-12"
              style={{ backgroundColor: imgLoaded && occasionPreview?.isDark ? '#F59E0B' : primary }}
            />
            <span
              className="ml-auto rounded-full px-2 py-0.5 text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-white shadow-xs"
              style={{ backgroundColor: primary }}
            >
              {theme.occasion}
            </span>
          </div>

          <div className="my-auto py-1.5">
            <p
              className="line-clamp-1 font-heading text-sm font-bold"
              style={{ color: imgLoaded && occasionPreview?.isDark ? '#FFFFFF' : ink }}
            >
              {theme.demoData.headline.hinglish}
            </p>
            <p
              className="mt-1 line-clamp-2 text-[11px] leading-snug"
              style={{ color: imgLoaded && occasionPreview?.isDark ? 'rgba(255,255,255,0.86)' : `${ink}CC` }}
            >
              {theme.demoData.message.hinglish}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full ring-1 ring-white/50" style={{ backgroundColor: primary }} />
              <span className="h-2.5 w-2.5 rounded-full ring-1 ring-white/50" style={{ backgroundColor: secondary }} />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FFE8EF] ring-1 ring-black/10" />
            </div>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold shadow-xs"
              style={{
                backgroundColor: imgLoaded ? '#FFFFFF' : surface,
                color: primary,
              }}
            >
              Tap to open
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
