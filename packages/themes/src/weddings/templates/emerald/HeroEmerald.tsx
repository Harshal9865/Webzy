'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getLocaleCode, getWeddingUiCopy } from '../../i18n';
import type { WeddingInvitation, WeddingLanguage } from '../../schema';
import { GoldenTempleScene, MangalKalashCrest, MarigoldToran } from '../../shared/WeddingArt';

interface HeroEmeraldProps {
  data: WeddingInvitation;
  guestName?: string | null;
  language?: WeddingLanguage;
  compact?: boolean;
  onNextCard?: () => void;
  nextCardLabel?: string;
}

const JHAROKHA_ART_PATH = '/templates/wedding-emerald-01/art/jharokha-scene.jpg';
const JHAROKHA_WIDE_ART_PATH = '/templates/wedding-emerald-01/art/jharokha-scene-wide.jpg';

function formatWeddingDate(iso: string, language: WeddingLanguage): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(getLocaleCode(language), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return iso;
  }
}

const FLOATING_PETALS = [
  { left: '12%', delay: '0s', duration: '12s', size: 7, kind: 'petal', desktopOnly: false },
  { left: '34%', delay: '3.2s', duration: '13.5s', size: 4.5, kind: 'pollen', desktopOnly: false },
  { left: '66%', delay: '1.6s', duration: '11.5s', size: 4.5, kind: 'pollen', desktopOnly: false },
  { left: '86%', delay: '4.8s', duration: '12.5s', size: 7, kind: 'petal', desktopOnly: false },
  { left: '22%', delay: '2.1s', duration: '14s', size: 6, kind: 'petal', desktopOnly: true },
  { left: '78%', delay: '5.4s', duration: '13s', size: 5.5, kind: 'pollen', desktopOnly: true },
] as const;

export function HeroEmerald({
  data,
  guestName,
  language,
  compact = false,
  onNextCard,
  nextCardLabel,
}: HeroEmeraldProps) {
  const activeLang = language ?? data.language ?? 'en';
  const copy = getWeddingUiCopy(activeLang);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [artLoaded, setArtLoaded] = useState(false);
  const [artError, setArtError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setArtError(false);
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setArtLoaded(true);
    } else {
      setArtLoaded(false);
    }
  }, [compact]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
    if (reducedMotion || compact || e.pointerType === 'touch') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: nx * -8, y: ny * -6 });
  }

  function handlePointerLeave() {
    setParallax({ x: 0, y: 0 });
  }

  const cityOrVenue = data.venueHighlight?.city || data.venueHighlight?.name || '';
  const dateText = formatWeddingDate(data.weddingDate, activeLang);
  const unifiedDateCity = cityOrVenue ? `${dateText}  ·  ${cityOrVenue}` : dateText;
  const connectorWord = activeLang === 'en' ? '&' : copy.hero.andWord;

  return (
    <section
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative w-full overflow-hidden bg-[#F5F3EB] text-[#1F3525] flex flex-col justify-between select-none ${
        compact ? 'min-h-[540px]' : 'min-h-[640px] md:min-h-[88dvh] lg:min-h-[100dvh]'
      }`}
    >
      {/* Layer 0: Warm Sunlit Ivory-Sage Atmospheric Canvas */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 85% 68% at 50% 34%, #FFFDF8 0%, #F1F4EC 58%, #DDE6DC 100%)',
        }}
      />

      {/* Layer 1: Screen-Optimized Painted Golden Temple Artwork (9:16 Portrait on Phones/Portrait Tablets, 16:9 Panoramic on Landscape Tablets/Desktops) */}
      {!artError ? (
        <picture className="pointer-events-none absolute -inset-3 block h-[calc(100%+24px)] w-[calc(100%+24px)]">
          {!compact ? (
            <source
              media="(min-width: 768px) and (orientation: landscape)"
              srcSet={JHAROKHA_WIDE_ART_PATH}
            />
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={JHAROKHA_ART_PATH}
            alt=""
            aria-hidden="true"
            onLoad={() => setArtLoaded(true)}
            onError={() => {
              setArtLoaded(false);
              setArtError(true);
            }}
            className={`h-full w-full object-cover object-bottom transition-opacity duration-500 ease-out ${
              artLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: reducedMotion
                ? 'scale(1.02)'
                : `translate3d(${parallax.x}px, ${parallax.y}px, 0) scale(1.03)`,
              willChange: 'transform',
            }}
          />
        </picture>
      ) : null}

      {/* Layer 1b: Subtle Ultra-Wide Ambient Edge Cushion on Desktop */}
      {!compact && (
        <div
          className={`hidden lg:block pointer-events-none absolute inset-0 transition-opacity duration-500 ${
            artLoaded ? 'opacity-65' : 'opacity-45'
          }`}
          style={{
            background:
              'linear-gradient(90deg, rgba(244, 245, 236, 0.36) 0%, rgba(244, 245, 236, 0) 14%, rgba(244, 245, 236, 0) 86%, rgba(244, 245, 236, 0.36) 100%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Layer 2: Soft Ivory Radial Halo Behind Upper-Middle Typography Sweet Spot */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: artLoaded
            ? 'radial-gradient(ellipse 62% 34% at 50% 30%, rgba(255, 253, 248, 0.84) 0%, rgba(255, 252, 245, 0.38) 54%, rgba(255, 252, 245, 0) 82%)'
            : 'radial-gradient(ellipse 70% 44% at 50% 34%, rgba(255, 253, 248, 0.78) 0%, rgba(255, 252, 245, 0) 80%)',
        }}
      />

      {/* Layer 3: Inline Hindu Marigold & Mango-Leaf Bandanwar Toran (Shown when painted .jpg is not loaded) */}
      <div
        className={`pointer-events-none absolute top-0 inset-x-0 z-10 transition-opacity duration-500 ${
          artLoaded ? 'opacity-0 invisible' : 'opacity-100 visible'
        }`}
        aria-hidden="true"
      >
        {compact ? (
          <MarigoldToran theme="emerald" />
        ) : (
          <>
            <div className="md:hidden">
              <MarigoldToran theme="emerald" />
            </div>
            <div className="hidden md:block">
              <MarigoldToran theme="emerald" wide />
            </div>
          </>
        )}
      </div>

      {/* Layer 4: Delicate Floating Blossom Petals & Gold Pollen */}
      {!reducedMotion && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-10" aria-hidden="true">
          {FLOATING_PETALS.map((p, idx) => (
            <span
              key={idx}
              className={`absolute -top-4 ${p.desktopOnly ? 'hidden md:block' : 'block'}`}
              style={{
                left: p.left,
                width: `${p.size}px`,
                height: p.kind === 'petal' ? `${p.size * 1.35}px` : `${p.size}px`,
                borderRadius: p.kind === 'petal' ? '60% 40% 60% 40%' : '9999px',
                background:
                  p.kind === 'petal'
                    ? 'linear-gradient(135deg, rgba(246, 188, 198, 0.78), rgba(235, 148, 168, 0.45))'
                    : 'radial-gradient(circle, rgba(218, 178, 86, 0.8), rgba(218, 178, 86, 0))',
                animation: `weddingPetalDrift ${p.duration} linear ${p.delay} infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* UPPER-MIDDLE EDITORIAL SWEET SPOT (Cleanly above the Golden Temple domes) */}
      <div
        className={`relative z-20 flex flex-col items-center text-center px-6 ${
          compact ? 'pt-7 pb-1' : 'pt-8 sm:pt-10 md:pt-12 lg:pt-12 pb-2 md:pb-3'
        }`}
      >
        {/* 1. TOP: Unboxed Sanskrit Invocation & Whisper-Clean Guest Salutation */}
        <p
          className={`font-royal-serif font-bold uppercase tracking-[0.26em] text-[#7D5E18] ${
            compact ? 'text-[10px]' : 'text-[10px] sm:text-xs md:text-[13px] lg:tracking-[0.3em]'
          }`}
          style={{ textShadow: '0 1px 10px rgba(255, 253, 248, 0.95)' }}
        >
          {data.familyBlessingLine || '|| Shri Ganeshay Namah ||'}
        </p>

        {guestName ? (
          <p
            className={`mt-1 font-royal-serif italic text-[#2B4631]/90 truncate ${
              compact ? 'text-xs max-w-[270px]' : 'text-xs sm:text-[13px] md:text-sm lg:text-base max-w-[270px] md:max-w-lg'
            }`}
            style={{ textShadow: '0 1px 8px rgba(255, 253, 248, 0.95)' }}
          >
            {copy.hero.dearGuestPrefix} {guestName}
          </p>
        ) : null}

        {/* 2. CENTER FOCAL POINT: Sacred Kalash Mark, One Intro Line, Grand Names, Unified Date & City */}
        <div className={compact ? 'mt-2.5' : 'mt-3 sm:mt-4 md:mt-5 lg:mt-5'}>
          <MangalKalashCrest
            theme="emerald"
            className={
              compact
                ? 'h-8 w-8 mx-auto mb-1'
                : 'h-9 w-9 md:h-11 md:w-11 lg:h-12 lg:w-12 mx-auto mb-1.5 md:mb-2'
            }
          />

          <p
            className={`font-royal-serif font-bold uppercase tracking-[0.24em] text-[#35533C] ${
              compact ? 'text-[9.5px]' : 'text-[10px] sm:text-[11px] md:text-xs lg:tracking-[0.28em]'
            }`}
            style={{ textShadow: '0 1px 10px rgba(255, 253, 248, 0.95)' }}
          >
            {copy.hero.togetherWithFamilies}
          </p>

          <h1
            className={`font-royal-script text-[#1B3322] tracking-wide leading-[1.06] break-words ${
              compact ? 'my-1.5' : 'my-2 sm:my-2.5 md:my-3'
            }`}
            style={{
              textShadow: '0 2px 18px rgba(255, 253, 248, 0.96)',
            }}
          >
            <span
              className={`block ${
                compact
                  ? 'text-[2.15rem]'
                  : 'text-[2.45rem] md:inline md:text-[3.5rem] lg:text-[4.25rem] xl:text-[4.85rem]'
              }`}
            >
              {data.brideName}
            </span>

            <span
              className={`flex items-center justify-center gap-3 ${
                compact ? 'my-0.5' : 'my-0.5 md:my-0 md:inline-flex md:mx-4 md:align-middle'
              }`}
            >
              <span
                className={`h-[1px] bg-gradient-to-r from-transparent to-[#C5A059]/75 ${
                  compact ? 'w-8' : 'w-8 md:hidden'
                }`}
                aria-hidden="true"
              />
              <span
                className={`font-royal-serif italic text-[#8B681C] ${
                  compact ? 'text-sm' : 'text-base sm:text-lg md:text-2xl lg:text-3xl'
                }`}
              >
                {connectorWord}
              </span>
              <span
                className={`h-[1px] bg-gradient-to-l from-transparent to-[#C5A059]/75 ${
                  compact ? 'w-8' : 'w-8 md:hidden'
                }`}
                aria-hidden="true"
              />
            </span>

            <span
              className={`block ${
                compact
                  ? 'text-[2.15rem]'
                  : 'text-[2.45rem] md:inline md:text-[3.5rem] lg:text-[4.25rem] xl:text-[4.85rem]'
              }`}
            >
              {data.groomName}
            </span>
          </h1>

          {/* Single Unified Date & City Line */}
          <p
            className={`mt-1.5 md:mt-2 font-royal-serif font-bold uppercase tracking-[0.2em] text-[#755715] ${
              compact ? 'text-[11px]' : 'text-[11px] sm:text-xs md:text-[13px] lg:text-sm md:tracking-[0.26em]'
            }`}
            style={{ textShadow: '0 1px 10px rgba(255, 253, 248, 0.96)' }}
          >
            {unifiedDateCity}
          </p>
        </div>
      </div>

      {/* 3. LOWER THIRD: Radiant Golden Temple Foreground & 4. Minimalist Bottom Scroll Cue */}
      <div className="relative z-20 mt-auto w-full">
        {/* Inline Golden Temple SVG (Hidden when painted .jpg loads to prevent double temples & hidden SVG repaints) */}
        <div
          className={`w-full transition-opacity duration-500 ${
            artLoaded ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'
          }`}
        >
          {compact ? (
            <GoldenTempleScene theme="emerald" />
          ) : (
            <>
              <div className="md:hidden">
                <GoldenTempleScene theme="emerald" />
              </div>
              <div className="hidden md:block w-full">
                <GoldenTempleScene theme="emerald" wide />
              </div>
            </>
          )}
        </div>

        {/* Soft Bottom Ground Wash for Crisp Minimalist Scroll Cue */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 md:h-20"
          style={{
            background:
              'linear-gradient(to top, rgba(246, 244, 236, 0.92) 0%, rgba(246, 244, 236, 0.45) 58%, rgba(246, 244, 236, 0) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Interactive Next Card Pill Cue */}
        <div className="absolute inset-x-0 bottom-3 sm:bottom-4 md:bottom-5 z-20 flex flex-col items-center justify-center text-[#2B4631]">
          {onNextCard ? (
            <button
              type="button"
              onClick={onNextCard}
              className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/75 bg-[#FFFDF8]/92 px-4 py-1.5 font-royal-serif text-[10px] md:text-[11px] font-bold uppercase tracking-[0.22em] text-[#1F3525] shadow-md backdrop-blur-sm transition hover:scale-105 hover:bg-[#FFFDF8] active:scale-95"
            >
              <span>{nextCardLabel || copy.nav.events}</span>
              <svg className="h-3.5 w-3.5 text-[#8C6D23]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <span
              className="font-royal-serif text-[10px] md:text-[11px] font-bold uppercase tracking-[0.26em]"
              style={{ textShadow: '0 1px 8px rgba(255, 253, 248, 0.96)' }}
            >
              {copy.nav.events}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
