'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { ThemeManifest } from '../schema';
import { ThemeRenderer } from './ThemeRenderer';

interface ThemeCardArtProps {
  theme: ThemeManifest;
}

const VIRTUAL_VIEWPORT_WIDTH = 390;

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

export function ThemeCardArt({ theme }: ThemeCardArtProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.58);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const weddingPreview = WEDDING_ART_PREVIEW[theme.id];

  useEffect(() => {
    setImgFailed(false);
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setImgLoaded(true);
    } else {
      setImgLoaded(false);
    }
  }, [theme.id]);

  // Measure card width so the live occasion website preview scales crisply to fill the exact card frame.
  useEffect(() => {
    if (weddingPreview) return;
    const node = stageRef.current;
    if (!node) return;

    const updateScale = () => {
      const width = node.clientWidth;
      if (width > 0) {
        setPreviewScale(width / VIRTUAL_VIEWPORT_WIDTH);
      }
    };

    updateScale();

    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(updateScale);
      ro.observe(node);
      return () => ro.disconnect();
    }

    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [weddingPreview, theme.id]);

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
            className={`absolute inset-0 h-full w-full object-cover object-bottom transition-all duration-500 group-hover:scale-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : null}

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
          className={`relative z-10 flex h-full flex-col items-center p-2.5 text-center sm:p-3 ${
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
            className={`mt-0.5 font-royal-script text-xl leading-tight sm:mt-1 sm:text-2xl ${
              showLightOverlay ? 'text-[#1E3524]' : 'text-[#FFF7E2]'
            }`}
          >
            {weddingPreview.couple}
          </p>
          <span
            className={`mt-1 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] sm:mt-1.5 sm:tracking-[0.18em] ${
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

  const { primary, surface } = theme.palette;

  return (
    <div
      ref={stageRef}
      className="relative aspect-[5/4] w-full overflow-hidden rounded-xl border border-black/10 sm:rounded-2xl"
      style={{
        backgroundColor: surface,
        contain: 'layout style paint',
        contentVisibility: 'auto',
      }}
      aria-hidden="true"
    >
      {/* Live scaled miniature of the exact website opened when clicking this card */}
      <div
        className="pointer-events-none absolute left-0 top-0 select-none overflow-hidden"
        style={{
          width: `${VIRTUAL_VIEWPORT_WIDTH}px`,
          height: '520px',
          transform: `scale(${previewScale})`,
          transformOrigin: 'top left',
        }}
      >
        <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]">
          <ThemeRenderer
            manifest={theme}
            data={theme.demoData}
            language="en"
            watermarked={false}
          />
        </div>
      </div>

      {/* Subtle top/bottom edge scrim + clean occasion pill & tap prompt */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between bg-gradient-to-t from-black/40 via-transparent to-black/15 p-2 sm:p-2.5">
        <div className="flex items-start justify-between">
          <span
            className="rounded-full px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-white shadow-xs backdrop-blur-[2px] sm:text-[9.5px]"
            style={{ backgroundColor: `${primary}E6` }}
          >
            {theme.occasion}
          </span>
        </div>

        <div className="flex items-end justify-end">
          <span
            className="rounded-full bg-white/95 px-2.5 py-0.5 text-[9px] font-bold shadow-xs backdrop-blur-xs sm:text-[10px]"
            style={{ color: primary }}
          >
            Tap to open
          </span>
        </div>
      </div>
    </div>
  );
}
