'use client';

import React, { useEffect, useState } from 'react';
import { getLocaleCode, getWeddingUiCopy } from '../../i18n';
import type { WeddingInvitation, WeddingLanguage } from '../../schema';
import { MangalKalashCrest } from '../../shared/WeddingArt';
import type { CoutureThemeKey } from './GateCouture';

interface HeroCoutureProps {
  theme: CoutureThemeKey;
  data: WeddingInvitation;
  guestName?: string | null;
  language?: WeddingLanguage;
  compact?: boolean;
  onNextCard?: () => void;
  nextCardLabel?: string;
}

interface HeroSpec {
  mobileArt: string;
  wideArt: string;
  isDark: boolean;
  bgClass: string;
  haloBg: string;
  edgeCushionBg: string;
  bottomFade: string;
  blessingColor: string;
  guestColor: string;
  introColor: string;
  nameColor: string;
  connectorColor: string;
  dateColor: string;
  scrollCueColor: string;
  ruleHex: string;
  textShadow: string;
  defaultBlessing: string;
  particleKind: 'stars' | 'jasmine' | 'rose' | 'lily';
}

const HERO_SPECS: Record<CoutureThemeKey, HeroSpec> = {
  'royal-blue': {
    mobileArt: '/templates/wedding-royal-blue-01/art/jodhpur-scene.jpg',
    wideArt: '/templates/wedding-royal-blue-01/art/jodhpur-scene.jpg',
    isDark: true,
    bgClass: 'bg-[#091326] text-[#FFF8E6]',
    haloBg:
      'radial-gradient(ellipse 66% 36% at 50% 26%, rgba(10, 20, 42, 0.72) 0%, rgba(10, 20, 42, 0.28) 54%, rgba(10, 20, 42, 0) 84%)',
    edgeCushionBg:
      'linear-gradient(90deg, rgba(7, 15, 32, 0.78) 0%, rgba(7, 15, 32, 0.25) 18%, transparent 32%, transparent 68%, rgba(7, 15, 32, 0.25) 82%, rgba(7, 15, 32, 0.78) 100%)',
    bottomFade:
      'linear-gradient(to top, rgba(8, 16, 33, 0.92) 0%, rgba(8, 16, 33, 0.45) 58%, rgba(8, 16, 33, 0) 100%)',
    blessingColor: 'text-[#F8E2A0]',
    guestColor: 'text-[#FFF4DC]/90',
    introColor: 'text-[#EBD08A]',
    nameColor: 'text-[#FBE6A4]',
    connectorColor: 'text-[#FFF4D6]',
    dateColor: 'text-[#F7DF9A]',
    scrollCueColor: 'text-[#F7DF9A]',
    ruleHex: '#DFBE6B',
    textShadow: '0 2px 16px rgba(5, 10, 24, 0.92), 0 0 22px rgba(223, 190, 107, 0.22)',
    defaultBlessing: '|| Om Shri Ganeshay Namah ||',
    particleKind: 'stars',
  },
  'temple-gold': {
    mobileArt: '/templates/wedding-temple-gold-01/art/temple-gold-scene.jpg',
    wideArt: '/templates/wedding-temple-gold-01/art/temple-gold-scene.jpg',
    isDark: false,
    bgClass: 'bg-[#FDF4DF] text-[#4A140F]',
    haloBg:
      'radial-gradient(ellipse 66% 36% at 50% 28%, rgba(255, 253, 245, 0.88) 0%, rgba(255, 250, 236, 0.42) 55%, rgba(255, 250, 236, 0) 84%)',
    edgeCushionBg:
      'linear-gradient(90deg, rgba(66, 20, 14, 0.65) 0%, rgba(253, 244, 223, 0.22) 18%, transparent 32%, transparent 68%, rgba(253, 244, 223, 0.22) 82%, rgba(66, 20, 14, 0.65) 100%)',
    bottomFade:
      'linear-gradient(to top, rgba(46, 12, 9, 0.88) 0%, rgba(46, 12, 9, 0.4) 55%, rgba(46, 12, 9, 0) 100%)',
    blessingColor: 'text-[#8A4E14]',
    guestColor: 'text-[#5A1812]/90',
    introColor: 'text-[#7A3516]',
    nameColor: 'text-[#54140F]',
    connectorColor: 'text-[#9A5E18]',
    dateColor: 'text-[#7B4412]',
    scrollCueColor: 'text-[#FFF2CE]',
    ruleHex: '#C88D2E',
    textShadow: '0 1px 12px rgba(255, 253, 246, 0.95)',
    defaultBlessing: '|| Shubhamastu ||',
    particleKind: 'jasmine',
  },
  'rose-ivory': {
    mobileArt: '/templates/wedding-rose-ivory-01/art/rose-palace-scene.jpg',
    wideArt: '/templates/wedding-rose-ivory-01/art/rose-palace-scene.jpg',
    isDark: false,
    bgClass: 'bg-[#FCEFEE] text-[#522432]',
    haloBg:
      'radial-gradient(ellipse 66% 36% at 50% 28%, rgba(255, 253, 252, 0.88) 0%, rgba(255, 248, 249, 0.42) 55%, rgba(255, 248, 249, 0) 84%)',
    edgeCushionBg:
      'linear-gradient(90deg, rgba(245, 218, 223, 0.72) 0%, rgba(252, 239, 238, 0.24) 18%, transparent 32%, transparent 68%, rgba(252, 239, 238, 0.24) 82%, rgba(245, 218, 223, 0.72) 100%)',
    bottomFade:
      'linear-gradient(to top, rgba(83, 46, 59, 0.86) 0%, rgba(83, 46, 59, 0.36) 55%, rgba(83, 46, 59, 0) 100%)',
    blessingColor: 'text-[#8C5D30]',
    guestColor: 'text-[#622B3C]/90',
    introColor: 'text-[#7A3C4E]',
    nameColor: 'text-[#552232]',
    connectorColor: 'text-[#9C6C3A]',
    dateColor: 'text-[#7C4C28]',
    scrollCueColor: 'text-[#FFF6F7]',
    ruleHex: '#C7985A',
    textShadow: '0 1px 12px rgba(255, 253, 252, 0.96)',
    defaultBlessing: '|| Shri Ganeshay Namah ||',
    particleKind: 'rose',
  },
  'christian-ivory': {
    mobileArt: '/templates/wedding-christian-ivory-01/art/chapel-scene.jpg',
    wideArt: '/templates/wedding-christian-ivory-01/art/chapel-scene.jpg',
    isDark: false,
    bgClass: 'bg-[#F8F5EE] text-[#28362B]',
    haloBg:
      'radial-gradient(ellipse 68% 38% at 50% 28%, rgba(255, 255, 253, 0.92) 0%, rgba(255, 253, 248, 0.45) 56%, rgba(255, 253, 248, 0) 84%)',
    edgeCushionBg:
      'linear-gradient(90deg, rgba(235, 228, 214, 0.72) 0%, rgba(248, 245, 238, 0.25) 18%, transparent 32%, transparent 68%, rgba(248, 245, 238, 0.25) 82%, rgba(235, 228, 214, 0.72) 100%)',
    bottomFade:
      'linear-gradient(to top, rgba(44, 58, 47, 0.88) 0%, rgba(44, 58, 47, 0.36) 55%, rgba(44, 58, 47, 0) 100%)',
    blessingColor: 'text-[#826028]',
    guestColor: 'text-[#314235]/90',
    introColor: 'text-[#4B5F4E]',
    nameColor: 'text-[#243428]',
    connectorColor: 'text-[#926E30]',
    dateColor: 'text-[#6E5120]',
    scrollCueColor: 'text-[#FFFDF8]',
    ruleHex: '#C49A55',
    textShadow: '0 1px 12px rgba(255, 255, 252, 0.96)',
    defaultBlessing: 'Love is patient, love is kind — 1 Corinthians 13:4',
    particleKind: 'lily',
  },
};

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

const DRIFT_MOTES = [
  { left: '10%', top: '16%', size: 6.5, duration: '12.5s', delay: '0s', desktopOnly: false },
  { left: '26%', top: '28%', size: 4.5, duration: '14s', delay: '2.4s', desktopOnly: true },
  { left: '38%', top: '20%', size: 4, duration: '11.5s', delay: '1.2s', desktopOnly: false },
  { left: '64%', top: '18%', size: 4.5, duration: '13s', delay: '3.1s', desktopOnly: false },
  { left: '78%', top: '32%', size: 6, duration: '13.8s', delay: '1.8s', desktopOnly: true },
  { left: '88%', top: '22%', size: 6.5, duration: '12s', delay: '4.2s', desktopOnly: false },
] as const;

export function HeroCouture({
  theme,
  data,
  guestName,
  language,
  compact = false,
  onNextCard,
  nextCardLabel,
}: HeroCoutureProps) {
  const activeLang = language ?? data.language ?? 'en';
  const copy = getWeddingUiCopy(activeLang);
  const spec = HERO_SPECS[theme];
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [theme]);

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

  const cityOrVenue = data.venueHighlight?.city || data.venueHighlight?.name || '';
  const dateText = formatWeddingDate(data.weddingDate, activeLang);
  const unifiedDateCity = cityOrVenue ? `${dateText}  ·  ${cityOrVenue}` : dateText;
  const connectorWord = activeLang === 'en' ? '&' : copy.hero.andWord;
  const isChristian = theme === 'christian-ivory';

  return (
    <section
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setParallax({ x: 0, y: 0 })}
      className={`relative w-full overflow-hidden flex flex-col justify-between select-none ${spec.bgClass} ${
        compact ? 'min-h-[540px]' : 'min-h-[640px] md:min-h-[88dvh] lg:min-h-[100dvh]'
      }`}
    >
      {/* Layer 1: Responsive Screen-Optimized Fine-Art Scene (Full-Bleed on Mobile, Triptych Framed on Desktop so Arch & Palace Never Crop) */}
      {!compact && !imgError && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={spec.mobileArt}
          alt=""
          aria-hidden="true"
          onError={() => setImgError(true)}
          className="hidden md:block pointer-events-none absolute inset-0 h-full w-full object-cover object-center scale-110 blur-2xl opacity-55"
        />
      )}
      {!imgError && (
        <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={spec.mobileArt}
            alt=""
            aria-hidden="true"
            onError={() => setImgError(true)}
            className={`h-full w-full object-cover object-bottom ${
              compact
                ? ''
                : 'md:max-w-[560px] lg:max-w-[620px] xl:max-w-[680px] md:shadow-[0_0_90px_rgba(0,0,0,0.38)]'
            }`}
            style={{
              transform: reducedMotion
                ? 'scale(1.01)'
                : `translate3d(${parallax.x}px, ${parallax.y}px, 0) scale(1.02)`,
              willChange: 'transform',
            }}
          />
        </div>
      )}

      {/* Layer 1b: Subtle Desktop Ultra-Wide Edge Cushion */}
      {!compact && (
        <div
          className="hidden lg:block pointer-events-none absolute inset-0"
          style={{ background: spec.edgeCushionBg }}
          aria-hidden="true"
        />
      )}

      {/* Layer 2: Soft Upper Typography Halo */}
      <div className="pointer-events-none absolute inset-0" style={{ background: spec.haloBg }} />

      {/* Layer 3: Theme-Tailored Floating Petals / Starlight / Jasmine Motes */}
      {!reducedMotion && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-10" aria-hidden="true">
          {DRIFT_MOTES.map((m, idx) => {
            const isStar = spec.particleKind === 'stars';
            const bg =
              spec.particleKind === 'stars'
                ? 'radial-gradient(circle, #FFF5C8 0%, rgba(223,190,107,0) 75%)'
                : spec.particleKind === 'rose'
                  ? 'linear-gradient(135deg, rgba(244,180,194,0.85), rgba(222,134,154,0.45))'
                  : spec.particleKind === 'jasmine'
                    ? 'linear-gradient(135deg, rgba(255,252,240,0.9), rgba(236,192,98,0.45))'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(208,186,136,0.45))';

            return (
              <span
                key={idx}
                className={`absolute ${m.desktopOnly ? 'hidden md:block' : 'block'} ${isStar ? '' : '-top-4'}`}
                style={{
                  left: m.left,
                  ...(isStar ? { top: m.top } : {}),
                  width: `${m.size}px`,
                  height: isStar ? `${m.size}px` : `${m.size * 1.35}px`,
                  borderRadius: isStar ? '9999px' : '60% 40% 60% 40%',
                  background: bg,
                  boxShadow: isStar ? '0 0 10px rgba(245, 214, 123, 0.85)' : 'none',
                  animation: isStar
                    ? `weddingGoldFloat ${m.duration} ease-in-out ${m.delay} infinite`
                    : `weddingPetalDrift ${m.duration} linear ${m.delay} infinite`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Upper Typography Sweet Spot (Seated Cleanly in Open Sky Top 42%) */}
      <div
        className={`relative z-20 flex flex-col items-center text-center px-6 ${
          compact ? 'pt-7 pb-1' : 'pt-8 sm:pt-10 md:pt-12 lg:pt-14 pb-2'
        }`}
      >
        <p
          className={`font-royal-serif font-bold tracking-[0.2em] ${spec.blessingColor} ${
            compact ? 'text-[10px]' : 'text-[10px] sm:text-xs md:text-[13px]'
          } ${isChristian ? 'italic' : 'uppercase'}`}
          style={{ textShadow: spec.textShadow }}
        >
          {data.familyBlessingLine || spec.defaultBlessing}
        </p>

        {guestName ? (
          <p
            className={`mt-1 font-royal-serif italic truncate ${spec.guestColor} ${
              compact ? 'text-xs max-w-[270px]' : 'text-xs sm:text-[13px] md:text-sm lg:text-base max-w-[270px] md:max-w-lg'
            }`}
            style={{ textShadow: spec.textShadow }}
          >
            {copy.hero.dearGuestPrefix} {guestName}
          </p>
        ) : null}

        <div className={compact ? 'mt-2.5' : 'mt-3 sm:mt-4 md:mt-5'}>
          <MangalKalashCrest
            theme={theme}
            className={compact ? 'h-8 w-8 mx-auto mb-1' : 'h-10 w-10 md:h-11 md:w-11 lg:h-12 lg:w-12 mx-auto mb-1.5'}
          />

          <p
            className={`font-royal-serif font-bold uppercase tracking-[0.24em] ${spec.introColor} ${
              compact ? 'text-[9.5px]' : 'text-[10px] sm:text-[11px] md:text-xs lg:tracking-[0.28em]'
            }`}
            style={{ textShadow: spec.textShadow }}
          >
            {isChristian ? copy.hero.underGraceAlmighty : copy.hero.togetherWithFamilies}
          </p>

          <h1
            className={`font-royal-script tracking-wide leading-[1.06] break-words ${spec.nameColor} ${
              compact ? 'my-1.5' : 'my-2 sm:my-2.5 md:my-3'
            }`}
            style={{ textShadow: spec.textShadow }}
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
                className={`h-[1px] ${compact ? 'w-8' : 'w-8 md:hidden'}`}
                style={{ background: `linear-gradient(90deg, transparent, ${spec.ruleHex})` }}
                aria-hidden="true"
              />
              <span
                className={`font-royal-serif italic ${spec.connectorColor} ${
                  compact ? 'text-sm' : 'text-base sm:text-lg md:text-2xl lg:text-3xl'
                }`}
              >
                {connectorWord}
              </span>
              <span
                className={`h-[1px] ${compact ? 'w-8' : 'w-8 md:hidden'}`}
                style={{ background: `linear-gradient(270deg, transparent, ${spec.ruleHex})` }}
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

          <p
            className={`mt-1.5 md:mt-2 font-royal-serif font-bold uppercase tracking-[0.2em] ${spec.dateColor} ${
              compact ? 'text-[11px]' : 'text-[11px] sm:text-xs md:text-[13px] lg:text-sm md:tracking-[0.26em]'
            }`}
            style={{ textShadow: spec.textShadow }}
          >
            {unifiedDateCity}
          </p>
        </div>
      </div>

      {/* Bottom Ground Vignette & Scroll Cue */}
      <div className="relative z-20 mt-auto w-full h-24">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
          style={{ background: spec.bottomFade }}
          aria-hidden="true"
        />
        <div
          className={`absolute inset-x-0 bottom-3 md:bottom-5 z-20 flex flex-col items-center justify-center ${spec.scrollCueColor}`}
        >
          {onNextCard ? (
            <button
              type="button"
              onClick={onNextCard}
              className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/75 bg-[#161013]/82 px-4 py-1.5 font-royal-serif text-[10px] md:text-[11px] font-bold uppercase tracking-[0.22em] text-[#FAF6EE] shadow-md backdrop-blur-sm transition hover:scale-105 hover:bg-[#161013] active:scale-95"
            >
              <span>{nextCardLabel || copy.nav.events}</span>
              <svg className="h-3.5 w-3.5 text-[#E5C158]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <span className="font-royal-serif text-[10px] md:text-[11px] font-bold uppercase tracking-[0.26em]">
              {copy.nav.events}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
