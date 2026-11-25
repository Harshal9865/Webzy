'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { getWeddingUiCopy } from '../../i18n';
import type { WeddingLanguage } from '../../schema';

interface GateRoyalRedProps {
  onOpen: () => void;
  isOpen: boolean;
  brideName: string;
  groomName: string;
  guestName?: string | null;
  familyBlessingLine?: string;
  language?: WeddingLanguage;
  compact?: boolean;
}

const VELVET_ART_PATH = '/templates/wedding-royal-red-01/art/velvet-embossed.jpg';

const EMBER_BURST = [
  { angle: 8, dist: 92, size: 5, delay: '0ms' },
  { angle: 26, dist: 120, size: 3.5, delay: '30ms' },
  { angle: 44, dist: 78, size: 4.5, delay: '15ms' },
  { angle: 62, dist: 130, size: 3, delay: '50ms' },
  { angle: 80, dist: 98, size: 5.5, delay: '20ms' },
  { angle: 98, dist: 112, size: 3.5, delay: '42ms' },
  { angle: 116, dist: 86, size: 4.5, delay: '10ms' },
  { angle: 134, dist: 126, size: 3, delay: '55ms' },
  { angle: 152, dist: 102, size: 5, delay: '24ms' },
  { angle: 170, dist: 118, size: 3.5, delay: '62ms' },
  { angle: 188, dist: 90, size: 5, delay: '0ms' },
  { angle: 206, dist: 124, size: 3, delay: '36ms' },
  { angle: 224, dist: 80, size: 4.5, delay: '16ms' },
  { angle: 242, dist: 132, size: 3.5, delay: '58ms' },
  { angle: 260, dist: 96, size: 5.5, delay: '22ms' },
  { angle: 278, dist: 114, size: 3.5, delay: '46ms' },
  { angle: 296, dist: 88, size: 4.5, delay: '12ms' },
  { angle: 314, dist: 128, size: 3, delay: '52ms' },
  { angle: 332, dist: 100, size: 5, delay: '26ms' },
  { angle: 350, dist: 116, size: 3.5, delay: '64ms' },
] as const;

export function GateRoyalRed({
  onOpen,
  isOpen,
  brideName,
  groomName,
  guestName,
  familyBlessingLine,
  language = 'en',
  compact = false,
}: GateRoyalRedProps) {
  // Staggered real-envelope choreography:
  // idle -> cracking (wax fractures & embers) -> topOpen (top velvet flap lifts) -> allOpen (side & bottom flaps unfold)
  const [stage, setStage] = useState<'idle' | 'cracking' | 'topOpen' | 'allOpen'>('idle');
  const [reducedMotion, setReducedMotion] = useState(false);
  const timersRef = useRef<number[]>([]);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const seamGoldAId = `royal-seam-gold-a-${uid}`;
  const seamGoldBId = `royal-seam-gold-b-${uid}`;
  const waxBlushId = `wax-blush-grad-${uid}`;
  const waxInnerId = `wax-inner-well-${uid}`;

  const copy = getWeddingUiCopy(language);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
      setStage('idle');
    }
  }, [isOpen]);

  function handleTap() {
    if (stage !== 'idle' || isOpen) return;

    if (reducedMotion) {
      setStage('allOpen');
      onOpen();
      return;
    }

    // Beat 1: Wax seal cracks with luminous gold fracture lines & ember burst
    setStage('cracking');

    // Beat 2: Top velvet flap folds upward first, spilling golden light from inside
    const t1 = window.setTimeout(() => {
      setStage('topOpen');
    }, 340);

    // Beat 3: Left, Right & Bottom flaps unfold smoothly + Hero scene glides into focus
    const t2 = window.setTimeout(() => {
      setStage('allOpen');
      onOpen();
    }, 680);

    timersRef.current.push(t1, t2);
  }

  const sealBroken = stage !== 'idle' || isOpen;
  const topFlapUp = stage === 'topOpen' || stage === 'allOpen' || isOpen;
  const sideFlapsOpen = stage === 'allOpen' || isOpen;

  const monogram = `${brideName ? brideName.trim().charAt(0).toUpperCase() : 'R'} & ${
    groomName ? groomName.trim().charAt(0).toUpperCase() : 'S'
  }`;

  const velvetBgStyle: React.CSSProperties = {
    backgroundImage: `url('${VELVET_ART_PATH}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div
      className={`relative h-full w-full overflow-hidden select-none ${
        compact ? '' : 'lg:flex lg:items-center lg:justify-center lg:p-10 xl:p-14'
      } ${isOpen ? 'pointer-events-none' : 'pointer-events-auto'}`}
      style={{ perspective: '1600px' }}
      aria-label={copy.gate.openAriaLabel}
    >
      {/* Full-Bleed Deep Burgundy Velvet Candlelight Stage Backdrop (Desktop lg:+, Dissolves Seamlessly on Unfold) */}
      {!compact && (
        <div
          className="hidden lg:block pointer-events-none absolute inset-0 z-0 transition-opacity duration-[1100ms] ease-out"
          style={{
            background:
              'radial-gradient(ellipse 68% 64% at 50% 50%, #580C1B 0%, #34050E 55%, #1A0207 100%)',
            opacity: sideFlapsOpen ? 0 : 1,
          }}
          aria-hidden="true"
        >
          {/* Subtle Ambient Velvet Texture Wash */}
          <div
            className="absolute inset-0 opacity-30"
            style={velvetBgStyle}
          />
          {/* Warm Candlelight Vignette & Architectural Outer Hairline */}
          <div
            className="absolute inset-6 rounded-[26px] border border-[#E5C158]/20 transition-opacity duration-500"
            style={{ opacity: sealBroken ? 0 : 1 }}
          >
            {/* Subtle Corner Rose Filigree Accents */}
            <svg
              className="absolute top-3 left-3 h-10 w-10 text-[#E5C158]/45"
              viewBox="0 0 40 40"
              fill="none"
            >
              <path d="M2 38 L2 8 C2 4.7 4.7 2 8 2 L38 2" stroke="currentColor" strokeWidth="1.1" />
              <path d="M8 22 L8 10 C8 8.9 8.9 8 10 8 L22 8" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 2" />
              <circle cx="11" cy="11" r="2" fill="currentColor" fillOpacity="0.65" />
            </svg>
            <svg
              className="absolute top-3 right-3 h-10 w-10 text-[#E5C158]/45 rotate-90"
              viewBox="0 0 40 40"
              fill="none"
            >
              <path d="M2 38 L2 8 C2 4.7 4.7 2 8 2 L38 2" stroke="currentColor" strokeWidth="1.1" />
              <path d="M8 22 L8 10 C8 8.9 8.9 8 10 8 L22 8" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 2" />
              <circle cx="11" cy="11" r="2" fill="currentColor" fillOpacity="0.65" />
            </svg>
            <svg
              className="absolute bottom-3 left-3 h-10 w-10 text-[#E5C158]/45 -rotate-90"
              viewBox="0 0 40 40"
              fill="none"
            >
              <path d="M2 38 L2 8 C2 4.7 4.7 2 8 2 L38 2" stroke="currentColor" strokeWidth="1.1" />
              <path d="M8 22 L8 10 C8 8.9 8.9 8 10 8 L22 8" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 2" />
              <circle cx="11" cy="11" r="2" fill="currentColor" fillOpacity="0.65" />
            </svg>
            <svg
              className="absolute bottom-3 right-3 h-10 w-10 text-[#E5C158]/45 rotate-180"
              viewBox="0 0 40 40"
              fill="none"
            >
              <path d="M2 38 L2 8 C2 4.7 4.7 2 8 2 L38 2" stroke="currentColor" strokeWidth="1.1" />
              <path d="M8 22 L8 10 C8 8.9 8.9 8 10 8 L22 8" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 2" />
              <circle cx="11" cy="11" r="2" fill="currentColor" fillOpacity="0.65" />
            </svg>
          </div>
        </div>
      )}

      {/* Radiant Warm Diya-Gold Light Pouring Out As Envelope Opens */}
      <div
        className="pointer-events-none absolute inset-0 z-[25] transition-all duration-[1100ms] ease-out"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(255, 236, 174, 0.96) 0%, rgba(238, 185, 76, 0.54) 36%, rgba(75, 8, 18, 0) 74%)',
          opacity: stage === 'topOpen' ? 0.95 : stage === 'cracking' ? 0.65 : 0,
          transform: stage === 'topOpen' ? 'scale(1.35)' : stage === 'cracking' ? 'scale(0.92)' : 'scale(0.65)',
        }}
      />

      {/* 4-FLAP BURGUNDY VELVET ENVELOPE (No overflow-hidden on preserve-3d stage so unfolding 3D flaps aren't flattened or clipped) */}
      <div
        className={`relative z-10 bg-transparent transition-shadow duration-700 ${
          compact
            ? 'h-full w-full'
            : `h-full w-full lg:h-[min(84dvh,760px)] lg:w-[min(86vw,640px)] lg:rounded-[22px] ${
                sideFlapsOpen
                  ? 'lg:shadow-none lg:ring-0'
                  : 'lg:shadow-[0_32px_96px_rgba(12,0,3,0.82)] lg:ring-1 lg:ring-[#E5C158]/35'
              }`
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Base Velvet Liner (Dissolves swiftly once top flap opens so Hero reveals in real time) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            background: 'radial-gradient(circle at 50% 50%, #5F1020 0%, #3E0712 65%, #220309 100%)',
            opacity: topFlapUp ? 0 : 1,
          }}
        />

        {/* LEFT VELVET FLAP (Unfolds Beat 3) */}
        <div
          className="absolute inset-0 z-10 origin-left"
          style={{
            clipPath: 'polygon(0 0, 50% 50%, 0 100%)',
            transform: !reducedMotion && sideFlapsOpen ? 'rotateY(-170deg)' : 'rotateY(0deg)',
            opacity: sideFlapsOpen ? 0 : 1,
            transition: reducedMotion
              ? 'opacity 360ms ease-out'
              : 'transform 1650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 800ms ease-out 780ms',
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="absolute inset-0 bg-[#4A0A17]" style={velvetBgStyle} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(24, 2, 7, 0.45) 0%, rgba(90, 14, 28, 0.1) 52%, rgba(16, 2, 5, 0.48) 100%)',
            }}
          />
        </div>

        {/* RIGHT VELVET FLAP (Unfolds Beat 3) */}
        <div
          className="absolute inset-0 z-10 origin-right"
          style={{
            clipPath: 'polygon(100% 0, 100% 100%, 50% 50%)',
            transform: !reducedMotion && sideFlapsOpen ? 'rotateY(170deg)' : 'rotateY(0deg)',
            opacity: sideFlapsOpen ? 0 : 1,
            transition: reducedMotion
              ? 'opacity 360ms ease-out'
              : 'transform 1650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 800ms ease-out 780ms',
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="absolute inset-0 bg-[#4A0A17]" style={velvetBgStyle} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(270deg, rgba(24, 2, 7, 0.45) 0%, rgba(90, 14, 28, 0.1) 52%, rgba(16, 2, 5, 0.48) 100%)',
            }}
          />
        </div>

        {/* BOTTOM VELVET POCKET FLAP (Unfolds slightly staggered after sides) */}
        <div
          className="absolute inset-0 z-[15] origin-bottom"
          style={{
            clipPath: 'polygon(0 100%, 50% 50%, 100% 100%)',
            transform: !reducedMotion && sideFlapsOpen ? 'rotateX(170deg)' : 'rotateX(0deg)',
            opacity: sideFlapsOpen ? 0 : 1,
            transition: reducedMotion
              ? 'opacity 360ms ease-out'
              : 'transform 1750ms cubic-bezier(0.22, 1, 0.36, 1) 140ms, opacity 850ms ease-out 900ms',
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="absolute inset-0 bg-[#520B19]" style={velvetBgStyle} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(0deg, rgba(20, 2, 6, 0.52) 0%, rgba(98, 16, 34, 0.1) 58%, rgba(18, 2, 6, 0.36) 100%)',
            }}
          />
        </div>

        {/* TOP VELVET FLAP (Primary Fold — Opens FIRST in Beat 2!) */}
        <div
          className="absolute inset-0 z-20 origin-top"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 50% 50%)',
            transform: !reducedMotion && topFlapUp ? 'rotateX(-176deg)' : 'rotateX(0deg)',
            opacity: sideFlapsOpen ? 0 : 1,
            transition: reducedMotion
              ? 'opacity 360ms ease-out'
              : 'transform 1350ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease-out 650ms',
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            filter: topFlapUp ? 'none' : 'drop-shadow(0 14px 26px rgba(0, 0, 0, 0.65))',
          }}
        >
          <div className="absolute inset-0 bg-[#641020]" style={velvetBgStyle} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(255, 224, 150, 0.08) 0%, rgba(112, 20, 38, 0.1) 50%, rgba(20, 2, 6, 0.5) 100%)',
            }}
          />
        </div>

        {/* CRISP DOUBLE-PIPED METALLIC GOLD X-SEAMS & CORNERS */}
        <svg
          className={`pointer-events-none absolute inset-0 h-full w-full z-[22] transition-opacity duration-500 ${
            topFlapUp ? 'opacity-0' : 'opacity-90'
          }`}
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={seamGoldAId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9A6D1C" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#FCE18F" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#9A6D1C" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id={seamGoldBId} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9A6D1C" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#FCE18F" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#9A6D1C" stopOpacity="0.45" />
            </linearGradient>
          </defs>
          {/* Main Metallic X Seams */}
          <line x1="0" y1="0" x2="100" y2="100" stroke={`url(#${seamGoldAId})`} strokeWidth="0.5" />
          <line x1="100" y1="0" x2="0" y2="100" stroke={`url(#${seamGoldBId})`} strokeWidth="0.5" />
          {/* Delicate Inner Double Stitch */}
          <rect
            x="2.2"
            y="1.5"
            width="95.6"
            height="97"
            fill="none"
            stroke="#E5C158"
            strokeOpacity="0.38"
            strokeWidth="0.28"
          />
          <rect
            x="3.6"
            y="2.5"
            width="92.8"
            height="95"
            fill="none"
            stroke="#E5C158"
            strokeOpacity="0.22"
            strokeWidth="0.18"
            strokeDasharray="1.2 1.2"
          />
        </svg>

        {/* TOP GOLD-FOIL SANSKRIT INVOCATION (Dissolves when top flap lifts) */}
        <div
          className={`pointer-events-none absolute inset-x-0 z-[25] flex flex-col items-center px-6 text-center transition-all duration-500 ${
            compact ? 'top-6' : 'top-7 sm:top-9 lg:top-10'
          } ${sealBroken ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F3D27A]/40 bg-[#2C040C]/70 px-4 py-1 lg:px-5 lg:py-1.5 backdrop-blur-sm shadow-sm">
            <span className="h-1 w-1 rounded-full bg-[#F5D67B]" />
            <span className="font-royal-serif text-[10px] sm:text-[11px] lg:text-xs font-bold uppercase tracking-[0.24em] text-[#F8DF94]">
              {familyBlessingLine || '|| Shri Ganeshay Namah ||'}
            </span>
            <span className="h-1 w-1 rounded-full bg-[#F5D67B]" />
          </div>
        </div>

        {/* BOTTOM PERSONALIZED GUEST PLAQUE ON ENVELOPE */}
        <div
          className={`pointer-events-none absolute inset-x-0 z-[25] flex flex-col items-center px-6 text-center transition-all duration-500 ${
            compact ? 'bottom-6' : 'bottom-7 sm:bottom-9 lg:bottom-10'
          } ${sealBroken ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
        >
          <div className="rounded-2xl border border-[#F3D27A]/35 bg-[#2C040C]/75 px-5 py-2 lg:px-7 lg:py-2.5 backdrop-blur-sm shadow-md">
            {guestName ? (
              <>
                <span className="block font-royal-serif text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.26em] text-[#E9C46A]">
                  {copy.gate.royalInvitation}
                </span>
                <span className="mt-0.5 block font-royal-serif text-sm sm:text-base lg:text-lg font-semibold tracking-wide text-[#FFF7E6]">
                  {copy.hero.dearGuestPrefix} {guestName}
                </span>
              </>
            ) : (
              <>
                <span className="block font-royal-serif text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.26em] text-[#E9C46A]">
                  {copy.gate.royalInvitation}
                </span>
                <span className="mt-0.5 block font-royal-serif text-sm sm:text-base lg:text-lg font-semibold tracking-wider text-[#FFF7E6]">
                  {brideName} &amp; {groomName}
                </span>
              </>
            )}
          </div>
        </div>

        {/* SCULPTED 3D BLUSH-ROSE WAX SEAL */}
        <button
          type="button"
          onClick={handleTap}
          aria-label={`${copy.gate.pressToOpen} — ${brideName} & ${groomName}`}
          className={`group absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5D67B] focus-visible:ring-offset-4 focus-visible:ring-offset-[#420813] transition-all duration-500 ${
            stage === 'cracking'
              ? 'pointer-events-none scale-95 opacity-100'
              : topFlapUp
                ? 'pointer-events-none scale-[1.4] opacity-0'
                : 'scale-100 opacity-100 hover:scale-105 active:scale-95'
          }`}
        >
          {/* Warm Amber Aura Halo */}
          <span
            className="pointer-events-none absolute -inset-6 rounded-full blur-xl opacity-80"
            style={{
              background:
                'radial-gradient(circle, rgba(248, 204, 108, 0.56) 0%, rgba(212, 175, 55, 0) 70%)',
              animation: reducedMotion ? 'none' : 'pulse 2.8s ease-in-out infinite',
            }}
          />

          {/* Outer Dotted Gold Shimmer Halo */}
          <span
            className="pointer-events-none absolute -inset-2.5 rounded-full border border-dashed border-[#F4D688]/55"
            style={{
              animation: reducedMotion ? 'none' : 'weddingSlowSpin 26s linear infinite',
            }}
          />

          {/* Organic Sculpted Wax Seal with 3D Bevel, Laurel Wreath & Fracture Lines */}
          <div
            className={`relative flex items-center justify-center transition-transform duration-300 ${
              compact
                ? 'h-[120px] w-[120px]'
                : 'h-[136px] w-[136px] sm:h-[152px] sm:w-[152px] lg:h-[168px] lg:w-[168px]'
            } ${stage === 'cracking' ? 'rotate-6 scale-105' : ''}`}
          >
            <svg
              className="absolute inset-0 h-full w-full drop-shadow-[0_18px_32px_rgba(0,0,0,0.72)]"
              viewBox="0 0 120 120"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id={waxBlushId} cx="32%" cy="26%" r="76%">
                  <stop offset="0%" stopColor="#FAD0D6" />
                  <stop offset="42%" stopColor="#DB7F8D" />
                  <stop offset="82%" stopColor="#AD4A59" />
                  <stop offset="100%" stopColor="#7C2534" />
                </radialGradient>
                <radialGradient id={waxInnerId} cx="68%" cy="72%" r="72%">
                  <stop offset="0%" stopColor="#EA9AA5" />
                  <stop offset="60%" stopColor="#C4606E" />
                  <stop offset="100%" stopColor="#8E2E3E" />
                </radialGradient>
              </defs>

              {/* Organic Molten Wax Outer Silhouette */}
              <path
                d="M60 3 C75 2, 87 7, 97 16 C108 25, 115 38, 116 54 C117 70, 111 86, 100 98 C89 110, 73 117, 57 116 C40 116, 24 109, 14 96 C5 84, 2 67, 4 50 C6 34, 16 19, 29 11 C40 4, 50 4, 60 3 Z"
                fill={`url(#${waxBlushId})`}
              />
              {/* Specular Molten Wax Highlight Rim */}
              <path
                d="M28 24 C38 14, 54 10, 70 12"
                fill="none"
                stroke="#FFF2F4"
                strokeOpacity="0.55"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Stamped Inner Well */}
              <circle
                cx="60"
                cy="60"
                r="45"
                fill={`url(#${waxInnerId})`}
                stroke="#FBE0E4"
                strokeOpacity="0.52"
                strokeWidth="1.6"
              />
              <circle
                cx="60"
                cy="60"
                r="40"
                fill="none"
                stroke="#76202E"
                strokeOpacity="0.58"
                strokeWidth="1.5"
              />
              {/* Engraved Micro Laurel Beading */}
              <circle
                cx="60"
                cy="60"
                r="35.5"
                fill="none"
                stroke="#FFF0F2"
                strokeOpacity="0.5"
                strokeWidth="0.9"
                strokeDasharray="2.2 2.4"
              />
              {/* Luminous Golden Fracture Cracks on Tap */}
              {stage === 'cracking' && (
                <g stroke="#FFF1B8" strokeWidth="2.1" strokeLinecap="round" opacity="1">
                  <path d="M60 15 L56 41 L64 58 L52 80 L60 105" fill="none" />
                  <path d="M18 51 L43 57 L64 58 L86 48 L102 55" fill="none" />
                  <path d="M64 58 L84 82" fill="none" />
                  <path d="M43 57 L30 78" fill="none" />
                </g>
              )}
            </svg>

            {/* Subtle Sweeping Luster Sheen */}
            <span
              className="pointer-events-none absolute inset-4 overflow-hidden rounded-full"
              aria-hidden="true"
            >
              <span
                className="absolute inset-y-0 -left-1/2 w-1/2 rotate-[25deg] bg-gradient-to-r from-transparent via-white/40 to-transparent"
                style={{
                  animation: reducedMotion ? 'none' : 'weddingGoldSheen 4.8s ease-in-out infinite',
                }}
              />
            </span>

            {/* Monogram & Callout Stamped Inside Wax Well */}
            <div className="relative z-10 flex flex-col items-center justify-center px-3 text-center">
              <span
                className={`font-royal-script font-bold leading-none text-[#FFF8F9] tracking-wide ${
                  compact ? 'text-2xl' : 'text-[28px] sm:text-3xl lg:text-[36px]'
                }`}
                style={{ textShadow: '0 1px 4px rgba(84, 15, 25, 0.78)' }}
              >
                {monogram}
              </span>
              <span className="mt-1 h-[1px] w-8 lg:w-10 bg-gradient-to-r from-transparent via-[#FFE8EC]/70 to-transparent" />
              <span
                className={`mt-1 font-royal-serif font-bold uppercase tracking-[0.2em] text-[#FFF0F2] leading-tight ${
                  compact ? 'text-[8px]' : 'text-[9px] lg:text-[10px]'
                }`}
              >
                {copy.gate.pressToOpen}
              </span>
            </div>
          </div>
        </button>

        {/* RADIAL GOLDEN EMBER BURST WHEN WAX SEAL CRACKS */}
        {!reducedMotion && sealBroken && (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2"
            aria-hidden="true"
          >
            {EMBER_BURST.map((p, idx) => {
              const rad = (p.angle * Math.PI) / 180;
              const tx = Math.round(Math.cos(rad) * p.dist);
              const ty = Math.round(Math.sin(rad) * p.dist);
              return (
                <span
                  key={idx}
                  className="absolute rounded-full bg-[#FFE9A6]"
                  style={
                    {
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      boxShadow: '0 0 12px 2px rgba(248, 200, 88, 0.92)',
                      '--tx': `${tx}px`,
                      '--ty': `${ty}px`,
                      animation: `weddingSparkleOut 1100ms cubic-bezier(0.16, 1, 0.3, 1) ${p.delay} forwards`,
                    } as React.CSSProperties
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
