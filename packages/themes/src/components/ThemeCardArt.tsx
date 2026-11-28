'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { ThemeManifest } from '../schema';

interface ThemeCardArtProps {
  theme: ThemeManifest;
  priority?: boolean;
}

interface CoverArtConfig {
  src: string;
  alt: string;
  bg: string;
  objectPosition?: string;
  isDark?: boolean;
  eyebrow?: string;
  couple?: string;
}

const WEDDING_ART_PREVIEW: Record<string, CoverArtConfig> = {
  'wedding-emerald-01': {
    src: '/templates/wedding-emerald-01/art/jharokha-scene-wide.jpg',
    alt: 'Emerald palace jharokha garden wedding invitation suite',
    couple: 'Aanya & Kabir',
    eyebrow: 'Udaipur · Hindu Vivah',
    bg: 'linear-gradient(155deg, #2D4F35 0%, #1E3524 100%)',
    isDark: false,
  },
  'wedding-royal-red-01': {
    src: '/templates/wedding-royal-red-01/art/mughal-scene-wide.jpg',
    alt: 'Crimson Mughal courtyard royal wedding invitation suite',
    couple: 'Riya & Siddharth',
    eyebrow: 'Jaipur · Royal Vivah',
    bg: 'linear-gradient(155deg, #6B0F1E 0%, #3A0710 100%)',
    isDark: true,
  },
  'wedding-royal-blue-01': {
    src: '/templates/wedding-royal-blue-01/art/jodhpur-scene-wide.jpg',
    alt: 'Indigo Jodhpur palace doors wedding invitation suite',
    couple: 'Meera & Dev',
    eyebrow: 'Jodhpur · Marwar Vivah',
    bg: 'linear-gradient(155deg, #132447 0%, #091326 100%)',
    isDark: true,
  },
  'wedding-temple-gold-01': {
    src: '/templates/wedding-temple-gold-01/art/temple-gold-scene-wide.jpg',
    alt: 'South Indian temple gold muhurtham invitation suite',
    couple: 'Ananya & Karthik',
    eyebrow: 'Chennai · Temple Muhurtham',
    bg: 'linear-gradient(155deg, #5A1812 0%, #310C09 100%)',
    isDark: false,
  },
  'wedding-rose-ivory-01': {
    src: '/templates/wedding-rose-ivory-01/art/rose-palace-scene-wide.jpg',
    alt: 'Rose ivory Samode palace garden wedding invitation suite',
    couple: 'Tara & Vihaan',
    eyebrow: 'Samode · Rose Garden Vivah',
    bg: 'linear-gradient(155deg, #6E3044 0%, #46202C 100%)',
    isDark: false,
  },
  'wedding-christian-ivory-01': {
    src: '/templates/wedding-christian-ivory-01/art/chapel-scene-wide.jpg',
    alt: 'Ivory Goa chapel matrimony wedding invitation suite',
    couple: 'Claire & Aaron',
    eyebrow: 'South Goa · Holy Matrimony',
    bg: 'linear-gradient(155deg, #2F3F33 0%, #202C24 100%)',
    isDark: false,
  },
};

const OCCASION_COVER_ART: Record<string, CoverArtConfig> = {
  'birthday-confetti-01': {
    src: '/templates/occasions/birthday-confetti/cover.jpg',
    alt: 'Handcrafted birthday keepsake with cake, velvet ribbon, filmstrip and watercolor balloon tree',
    bg: 'linear-gradient(135deg, #FBF6EE 0%, #F4E9DC 100%)',
    objectPosition: 'object-center',
  },
  'birthday-ashirwad-01': {
    src: '/templates/occasions/birthday-ashirwad/cover.jpg',
    alt: 'Sunlit sandstone jharokha courtyard with marigold toran and glowing brass diya',
    bg: 'linear-gradient(135deg, #FAF1DF 0%, #EBD6B3 100%)',
    objectPosition: 'object-center',
  },
  'will-you-01': {
    src: '/templates/occasions/will-you/cover.jpg',
    alt: 'Crimson velvet and red gingham keepsake box with wax-sealed letter, rose bouquet and polaroids',
    bg: 'linear-gradient(135deg, #4A0912 0%, #8F1522 100%)',
    objectPosition: 'object-center',
    isDark: true,
  },
  'our-timeline-01': {
    src: '/templates/occasions/our-timeline/cover.jpg',
    alt: 'Archival 35mm film strip, taped polaroids, brass compass and pressed lavender on handmade paper',
    bg: 'linear-gradient(135deg, #F4ECE1 0%, #E6D9C7 100%)',
    objectPosition: 'object-center',
  },
  'maan-jao-01': {
    src: '/templates/occasions/maan-jao/cover.jpg',
    alt: 'Rain-to-sunshine meadow sky with pink gingham spiral apology notebook and clipped peace notes',
    bg: 'linear-gradient(135deg, #2C3E5E 0%, #D47A92 100%)',
    objectPosition: 'object-center',
    isDark: true,
  },
  'make-them-smile-01': {
    src: '/templates/occasions/make-them-smile/cover.jpg',
    alt: 'Cozy pastel twilight retro desktop with pixel folders, polaroids, fairy lights and tabby cat',
    bg: 'linear-gradient(135deg, #2F2449 0%, #583F6E 100%)',
    objectPosition: 'object-center',
    isDark: true,
  },
  'our-year-01': {
    src: '/templates/occasions/our-year/cover.jpg',
    alt: 'Prismatic luminous 3D glass crystal waves drifting over obsidian night sky',
    bg: 'linear-gradient(135deg, #120B24 0%, #261447 100%)',
    objectPosition: 'object-center',
    isDark: true,
  },
  'harvest-greeting-01': {
    src: '/templates/occasions/harvest-greeting/cover.jpg',
    alt: 'Festive kites, marigold garland, brass pongal pot and golden sugarcane harvest illustration',
    bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    objectPosition: 'object-center',
  },
  'portfolio-01': {
    src: '/templates/occasions/portfolio/cover.jpg',
    alt: 'Minimalist architectural monograph, matte black rangefinder camera and fountain pen on linen',
    bg: 'linear-gradient(135deg, #F5F0E6 0%, #E7DCCB 100%)',
    objectPosition: 'object-center',
  },
  'small-business-01': {
    src: '/templates/occasions/small-business/cover.jpg',
    alt: 'Artisan dark chocolate berry tart, crystal light prism and boutique cotton garment on travertine',
    bg: 'linear-gradient(135deg, #F4EFE7 0%, #E6DDD0 100%)',
    objectPosition: 'object-center',
  },
  'business-greeting-01': {
    src: '/templates/occasions/business-greeting/cover.jpg',
    alt: 'Ivory gift box tied with royal navy satin ribbon, gold wax seal and artisanal truffles',
    bg: 'linear-gradient(135deg, #0D1B35 0%, #1B2D4E 100%)',
    objectPosition: 'object-center',
    isDark: true,
  },
  'travel-voyage-01': {
    src: '/templates/travel/serendipity-vista.jpg',
    alt: 'Woodblock heritage temple eaves beneath indigo clouds and a warm glowing hanging lantern',
    bg: 'linear-gradient(135deg, #15233A 0%, #2C4160 100%)',
    objectPosition: 'object-center',
    isDark: true,
  },
  'cafe-artisan-01': {
    src: '/templates/cafe/maison-rouge.jpg',
    alt: 'Sculptural ivory ranunculus and deep crimson garden roses in an oxblood luxury floral studio',
    bg: 'linear-gradient(135deg, #3D0810 0%, #5B0E1A 100%)',
    objectPosition: 'object-center',
    isDark: true,
  },
  'creative-voxel-01': {
    src: '/templates/creative/creatie-hills.jpg',
    alt: 'Sunlit rolling emerald hills dotted with wildflowers beneath a cerulean sky and cumulus cloud',
    bg: 'linear-gradient(135deg, #2D5A82 0%, #4E6D28 100%)',
    objectPosition: 'object-center',
  },
};

export function ThemeCardArt({ theme, priority = false }: ThemeCardArtProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const weddingPreview = WEDDING_ART_PREVIEW[theme.id];
  const occasionCover = OCCASION_COVER_ART[theme.id];

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
        className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#D4AF37]/35 sm:rounded-2xl"
        style={{ background: weddingPreview.bg }}
        aria-hidden="true"
      >
        {!imgFailed ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={weddingPreview.src}
            ref={imgRef}
            src={weddingPreview.src}
            alt={weddingPreview.alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgLoaded(false);
              setImgFailed(true);
            }}
            className={`absolute inset-0 h-full w-full object-cover object-bottom transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : null}

        <div
          className={`relative z-10 flex h-full flex-col items-center p-2.5 text-center sm:p-3 ${
            imgLoaded ? 'justify-start pt-3 sm:pt-4' : 'justify-center'
          }`}
          style={{
            background: showLightOverlay
              ? 'linear-gradient(180deg, rgba(255, 253, 246, 0.72) 0%, rgba(255, 253, 246, 0.22) 45%, rgba(20, 38, 24, 0.08) 100%)'
              : 'linear-gradient(180deg, rgba(24, 4, 9, 0.56) 0%, rgba(24, 4, 9, 0.16) 48%, rgba(0, 0, 0, 0.14) 100%)',
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
            className={`mt-0.5 font-royal-script text-xl leading-tight sm:mt-1 sm:text-2xl ${
              showLightOverlay ? 'text-[#1E3524]' : 'text-[#FFF7E2]'
            }`}
          >
            {weddingPreview.couple}
          </p>
        </div>
      </div>
    );
  }

  const { primary, surface } = theme.palette;
  const coverSrc = occasionCover?.src ?? '';
  const coverBg = occasionCover?.bg ?? surface;

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-black/[0.07] sm:rounded-2xl"
      style={{
        background: coverBg,
        contain: 'layout style paint',
      }}
      aria-hidden="true"
    >
      {coverSrc && !imgFailed ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={coverSrc}
          ref={imgRef}
          src={coverSrc}
          alt={occasionCover?.alt ?? ''}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgLoaded(false);
            setImgFailed(true);
          }}
          className={`h-full w-full object-cover ${occasionCover?.objectPosition ?? 'object-center'} transition-all duration-700 ease-out group-hover:scale-[1.045] ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center p-4 text-center"
          style={{
            background: `radial-gradient(circle at 30% 25%, ${primary}28 0%, ${surface} 72%)`,
          }}
        >
          <span
            className="font-heading text-base font-bold tracking-tight"
            style={{ color: primary }}
          >
            {theme.name.en}
          </span>
        </div>
      )}

      {/* Subtle architectural vignette on hover for tactile gallery depth */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/[0.04] opacity-70 transition-opacity duration-300 group-hover:opacity-45"
      />
    </div>
  );
}
