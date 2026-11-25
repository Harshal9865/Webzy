'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { getWeddingUiCopy } from '../../i18n';
import type { WeddingLanguage } from '../../schema';

interface GateEmeraldProps {
  onOpen: () => void;
  isOpen: boolean;
  brideName: string;
  groomName: string;
  guestName?: string | null;
  familyBlessingLine?: string;
  language?: WeddingLanguage;
  compact?: boolean;
}

const DOORS_ART_PATH = '/templates/wedding-emerald-01/art/doors-embossed.jpg';

const SPARKLE_BURST = [
  { angle: 0, dist: 86, size: 5, delay: '0ms' },
  { angle: 18, dist: 112, size: 3.5, delay: '35ms' },
  { angle: 36, dist: 74, size: 4.5, delay: '15ms' },
  { angle: 54, dist: 124, size: 3, delay: '60ms' },
  { angle: 72, dist: 92, size: 5.5, delay: '20ms' },
  { angle: 90, dist: 108, size: 3.5, delay: '45ms' },
  { angle: 108, dist: 82, size: 4.5, delay: '10ms' },
  { angle: 126, dist: 120, size: 3, delay: '55ms' },
  { angle: 144, dist: 96, size: 5, delay: '25ms' },
  { angle: 162, dist: 114, size: 3.5, delay: '70ms' },
  { angle: 180, dist: 88, size: 5, delay: '0ms' },
  { angle: 198, dist: 118, size: 3, delay: '40ms' },
  { angle: 216, dist: 78, size: 4.5, delay: '18ms' },
  { angle: 234, dist: 126, size: 3.5, delay: '65ms' },
  { angle: 252, dist: 94, size: 5.5, delay: '22ms' },
  { angle: 270, dist: 110, size: 3.5, delay: '50ms' },
  { angle: 288, dist: 84, size: 4.5, delay: '12ms' },
  { angle: 306, dist: 122, size: 3, delay: '58ms' },
  { angle: 324, dist: 98, size: 5, delay: '28ms' },
  { angle: 342, dist: 115, size: 3.5, delay: '68ms' },
] as const;

// 16-petal heritage scalloped medallion SVG path centered at (80, 80)
const SCALLOP_MEDALLION_PATH =
  'M80 4 C86 4 90 10 95 12 C100 14 107 10 112 13 C117 16 118 23 122 27 C126 31 134 30 138 35 C142 40 140 47 143 52 C146 57 153 59 155 65 C157 71 152 77 153 82 C154 88 158 94 155 100 C152 106 145 107 142 112 C139 117 141 124 136 129 C131 134 124 132 119 135 C114 138 113 146 107 149 C101 152 95 148 90 150 C85 152 80 157 74 156 C68 155 65 149 59 148 C53 147 47 151 42 147 C37 143 37 136 33 132 C29 128 21 129 17 124 C13 119 16 112 13 107 C10 102 4 99 3 93 C2 87 7 81 7 76 C7 70 2 64 5 58 C8 52 15 51 18 46 C21 41 19 34 24 29 C29 24 36 26 41 23 C46 20 47 12 53 9 C59 6 65 11 70 9 C74 7 76 4 80 4 Z';

export function GateEmerald({
  onOpen,
  isOpen,
  brideName,
  groomName,
  guestName,
  familyBlessingLine,
  language = 'en',
  compact = false,
}: GateEmeraldProps) {
  // Stage choreography: idle -> pressed (medallion shimmer & burst) -> parting (3D doors swing + light shaft)
  const [stage, setStage] = useState<'idle' | 'pressed' | 'parting'>('idle');
  const [reducedMotion, setReducedMotion] = useState(false);
  const timersRef = useRef<number[]>([]);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const medallionBgId = `emerald-medallion-bg-${uid}`;
  const medallionGoldId = `emerald-medallion-gold-${uid}`;

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
      setStage('parting');
      onOpen();
      return;
    }

    // Beat 1: Medallion presses, ignites golden sparkle burst, lifts off seam
    setStage('pressed');

    // Beat 2: Doors begin 3D hinged swing + center golden light shaft blooms
    const t1 = window.setTimeout(() => {
      setStage('parting');
    }, 280);

    // Beat 3: Notify parent so inner Hero executes cinematic push-in simultaneously
    const t2 = window.setTimeout(() => {
      onOpen();
    }, 440);

    timersRef.current.push(t1, t2);
  }

  const doorsParting = stage === 'parting' || isOpen;
  const medallionGone = stage !== 'idle' || isOpen;
  const monogram = `${brideName ? brideName.trim().charAt(0).toUpperCase() : 'A'} & ${
    groomName ? groomName.trim().charAt(0).toUpperCase() : 'K'
  }`;

  const doorTransition = reducedMotion
    ? 'opacity 360ms ease-out'
    : 'transform 2250ms cubic-bezier(0.22, 1, 0.36, 1), opacity 850ms ease-out 1350ms, box-shadow 1800ms ease-out';

  return (
    <div
      className={`relative h-full w-full overflow-hidden select-none ${
        isOpen ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      style={{ perspective: '1500px' }}
      aria-label={copy.gate.openAriaLabel}
    >
      {/* Golden Sunbeam Light Shaft Pouring Through the Widening Center Seam */}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-all duration-[1200ms] ease-out"
        style={{
          background:
            'radial-gradient(ellipse 42% 96% at 50% 50%, rgba(255, 244, 204, 0.96) 0%, rgba(242, 211, 130, 0.56) 38%, rgba(255, 250, 235, 0) 78%)',
          opacity: stage === 'parting' ? 0.95 : stage === 'pressed' ? 0.5 : 0,
          transform: stage === 'parting' ? 'scaleX(2.6) scaleY(1.08)' : 'scaleX(0.22) scaleY(0.95)',
        }}
      />

      {/* Ambient Seam Crack Glow (ignites right on tap before doors swing) */}
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-[10px] -translate-x-1/2 blur-md transition-opacity duration-500"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,240,185,0) 0%, rgba(255,234,165,0.95) 50%, rgba(255,240,185,0) 100%)',
          opacity: stage === 'pressed' ? 1 : 0,
        }}
      />

      {/* LEFT 3D HINGED EMBOSSED PALACE DOOR */}
      <div
        className="absolute top-0 bottom-0 left-0 w-1/2 z-10 overflow-hidden bg-[#273E2D] border-r border-[#DFC16E]/65 origin-left"
        style={{
          transform:
            !reducedMotion && doorsParting
              ? 'translate3d(-24%, 0, 0) rotateY(-82deg)'
              : 'translate3d(0, 0, 0) rotateY(0deg)',
          opacity: doorsParting ? (reducedMotion ? 0 : 0.08) : 1,
          transition: doorTransition,
          boxShadow: doorsParting
            ? '18px 0 42px rgba(8, 18, 11, 0.55), inset -16px 0 32px rgba(10, 22, 14, 0.5)'
            : 'inset -12px 0 28px rgba(10, 22, 14, 0.45), inset 3px 3px 8px rgba(255, 250, 230, 0.14)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Outer Desktop Architectural Wing Wainscoting (Visible on lg:+ behind inner door leaf) */}
        {!compact && (
          <div
            className="hidden lg:block absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, #1E3324 0%, #294330 42%, #2C4532 100%)',
            }}
            aria-hidden="true"
          />
        )}

        {/* Seamless Half-Artwork Layer (Full width on mobile/tablet; crisp centered palace leaf on desktop) */}
        <div
          className={`absolute inset-y-0 right-0 overflow-hidden ${
            compact ? 'left-0' : 'left-0 lg:left-auto lg:w-[min(100%,480px)] xl:w-[min(100%,540px)]'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={DOORS_ART_PATH}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute top-0 left-0 h-full w-[200%] max-w-none object-cover object-center select-none"
          />
          {/* Soft Feather Blend into Desktop Outer Courtyard Wing */}
          {!compact && (
            <div
              className="hidden lg:block absolute inset-y-0 left-0 w-24 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, #273E2D 0%, rgba(39, 62, 45, 0.65) 45%, rgba(39, 62, 45, 0) 100%)',
              }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Desktop Tall Outer Gilded Palace Border Column (Far Left) */}
        {!compact && (
          <div
            className="hidden lg:flex absolute top-0 bottom-0 left-0 w-16 xl:w-20 flex-col justify-between py-10 items-center border-r border-[#DFC16E]/35 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, #182A1D 0%, #243C2A 55%, #1E3223 100%)',
              boxShadow: 'inset -6px 0 18px rgba(8, 18, 11, 0.45)',
            }}
            aria-hidden="true"
          >
            <div className="h-full w-8 border-x border-[#DFC16E]/30 flex flex-col justify-between py-6 items-center">
              <span className="h-2.5 w-2.5 rotate-45 border border-[#F5DF9B]/70 bg-[#C99D3B]/30" />
              <span className="h-full w-[1px] my-4 bg-gradient-to-b from-[#E5C87B]/50 via-[#E5C87B]/20 to-[#E5C87B]/50" />
              <span className="h-2.5 w-2.5 rotate-45 border border-[#F5DF9B]/70 bg-[#C99D3B]/30" />
            </div>
          </div>
        )}

        {/* Tactile Paper Studio Side-Lighting & Deep Courtyard Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(125deg, rgba(255, 248, 224, 0.09) 0%, rgba(26, 46, 31, 0.14) 48%, rgba(12, 24, 16, 0.42) 100%)',
          }}
        />

        {/* Subtle Carved Gold Filigree Frame (lets embossed art remain crisp) */}
        <svg
          className={`absolute inset-y-0 h-full opacity-25 pointer-events-none ${
            compact ? 'left-0 w-full' : 'left-0 w-full lg:left-16 xl:left-20 lg:w-[calc(100%-4rem)] xl:w-[calc(100%-5rem)]'
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M 190 14 L 14 14 L 14 586 L 190 586" fill="none" stroke="#E8CA7A" strokeWidth="1" />
          <path d="M 22 22 L 40 22 M 22 22 L 22 40" stroke="#F5DF9B" strokeWidth="1.1" />
          <path d="M 22 578 L 40 578 M 22 578 L 22 560" stroke="#F5DF9B" strokeWidth="1.1" />
        </svg>

        {/* Miniature Antique Brass Courtyard Ring-Knocker (Left of Seam) */}
        <div
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 flex flex-col items-center opacity-80 ${
            compact ? 'right-5' : 'right-5 md:right-10 lg:right-14'
          }`}
          aria-hidden="true"
        >
          <span
            className={`rounded-full border border-[#F6E2A5] bg-gradient-to-b from-[#E5C158] to-[#8F6818] shadow-sm ${
              compact ? 'h-2.5 w-2.5' : 'h-2.5 w-2.5 lg:h-3.5 lg:w-3.5'
            }`}
          />
          <span
            className={`-mt-0.5 rounded-full border-2 border-[#DFBD5F] shadow-[0_3px_6px_rgba(0,0,0,0.45)] ${
              compact ? 'h-5 w-5' : 'h-5 w-5 lg:h-7 lg:w-7'
            }`}
          />
        </div>

        {/* Fine Vertical Antique Gold Seam Hairline */}
        <div
          className="absolute top-0 bottom-0 right-0 w-[3px]"
          style={{
            background: 'linear-gradient(180deg, #F8E8B8 0%, #D3A84B 50%, #996E1B 100%)',
            boxShadow: '-1px 0 8px rgba(0, 0, 0, 0.35)',
          }}
        />
      </div>

      {/* RIGHT 3D HINGED EMBOSSED PALACE DOOR */}
      <div
        className="absolute top-0 bottom-0 right-0 w-1/2 z-10 overflow-hidden bg-[#273E2D] border-l border-[#DFC16E]/65 origin-right"
        style={{
          transform:
            !reducedMotion && doorsParting
              ? 'translate3d(24%, 0, 0) rotateY(82deg)'
              : 'translate3d(0, 0, 0) rotateY(0deg)',
          opacity: doorsParting ? (reducedMotion ? 0 : 0.08) : 1,
          transition: doorTransition,
          boxShadow: doorsParting
            ? '-18px 0 42px rgba(8, 18, 11, 0.55), inset 16px 0 32px rgba(10, 22, 14, 0.5)'
            : 'inset 12px 0 28px rgba(10, 22, 14, 0.45), inset -3px 3px 8px rgba(255, 250, 230, 0.14)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Outer Desktop Architectural Wing Wainscoting (Visible on lg:+ behind inner door leaf) */}
        {!compact && (
          <div
            className="hidden lg:block absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(270deg, #1E3324 0%, #294330 42%, #2C4532 100%)',
            }}
            aria-hidden="true"
          />
        )}

        {/* Seamless Half-Artwork Layer (Full width on mobile/tablet; crisp centered palace leaf on desktop) */}
        <div
          className={`absolute inset-y-0 left-0 overflow-hidden ${
            compact ? 'right-0' : 'right-0 lg:right-auto lg:w-[min(100%,480px)] xl:w-[min(100%,540px)]'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={DOORS_ART_PATH}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute top-0 right-0 h-full w-[200%] max-w-none object-cover object-center select-none"
          />
          {/* Soft Feather Blend into Desktop Outer Courtyard Wing */}
          {!compact && (
            <div
              className="hidden lg:block absolute inset-y-0 right-0 w-24 pointer-events-none"
              style={{
                background:
                  'linear-gradient(270deg, #273E2D 0%, rgba(39, 62, 45, 0.65) 45%, rgba(39, 62, 45, 0) 100%)',
              }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Desktop Tall Outer Gilded Palace Border Column (Far Right) */}
        {!compact && (
          <div
            className="hidden lg:flex absolute top-0 bottom-0 right-0 w-16 xl:w-20 flex-col justify-between py-10 items-center border-l border-[#DFC16E]/35 pointer-events-none"
            style={{
              background:
                'linear-gradient(270deg, #182A1D 0%, #243C2A 55%, #1E3223 100%)',
              boxShadow: 'inset 6px 0 18px rgba(8, 18, 11, 0.45)',
            }}
            aria-hidden="true"
          >
            <div className="h-full w-8 border-x border-[#DFC16E]/30 flex flex-col justify-between py-6 items-center">
              <span className="h-2.5 w-2.5 rotate-45 border border-[#F5DF9B]/70 bg-[#C99D3B]/30" />
              <span className="h-full w-[1px] my-4 bg-gradient-to-b from-[#E5C87B]/50 via-[#E5C87B]/20 to-[#E5C87B]/50" />
              <span className="h-2.5 w-2.5 rotate-45 border border-[#F5DF9B]/70 bg-[#C99D3B]/30" />
            </div>
          </div>
        )}

        {/* Tactile Paper Studio Side-Lighting & Deep Courtyard Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(235deg, rgba(255, 248, 224, 0.09) 0%, rgba(26, 46, 31, 0.14) 48%, rgba(12, 24, 16, 0.42) 100%)',
          }}
        />

        {/* Subtle Carved Gold Filigree Frame (lets embossed art remain crisp) */}
        <svg
          className={`absolute inset-y-0 h-full opacity-25 pointer-events-none ${
            compact ? 'left-0 w-full' : 'left-0 w-full lg:w-[calc(100%-4rem)] xl:w-[calc(100%-5rem)]'
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M 10 14 L 186 14 L 186 586 L 10 586" fill="none" stroke="#E8CA7A" strokeWidth="1" />
          <path d="M 178 22 L 160 22 M 178 22 L 178 40" stroke="#F5DF9B" strokeWidth="1.1" />
          <path d="M 178 578 L 160 578 M 178 578 L 178 560" stroke="#F5DF9B" strokeWidth="1.1" />
        </svg>

        {/* Miniature Antique Brass Courtyard Ring-Knocker (Right of Seam) */}
        <div
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 flex flex-col items-center opacity-80 ${
            compact ? 'left-5' : 'left-5 md:left-10 lg:left-14'
          }`}
          aria-hidden="true"
        >
          <span
            className={`rounded-full border border-[#F6E2A5] bg-gradient-to-b from-[#E5C158] to-[#8F6818] shadow-sm ${
              compact ? 'h-2.5 w-2.5' : 'h-2.5 w-2.5 lg:h-3.5 lg:w-3.5'
            }`}
          />
          <span
            className={`-mt-0.5 rounded-full border-2 border-[#DFBD5F] shadow-[0_3px_6px_rgba(0,0,0,0.45)] ${
              compact ? 'h-5 w-5' : 'h-5 w-5 lg:h-7 lg:w-7'
            }`}
          />
        </div>

        {/* Fine Vertical Antique Gold Seam Hairline */}
        <div
          className="absolute top-0 bottom-0 left-0 w-[3px]"
          style={{
            background: 'linear-gradient(180deg, #F8E8B8 0%, #D3A84B 50%, #996E1B 100%)',
            boxShadow: '1px 0 8px rgba(0, 0, 0, 0.35)',
          }}
        />
      </div>

      {/* TOP ENGRAVED SANSKRIT INVOCATION PLAQUE (Dissolves softly as doors open) */}
      <div
        className={`pointer-events-none absolute inset-x-0 z-20 flex flex-col items-center px-6 text-center transition-all duration-700 ${
          compact ? 'top-6' : 'top-7 sm:top-9 lg:top-11'
        } ${medallionGone ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}
      >
        <div className="inline-flex items-center gap-2.5 rounded-full border border-[#E5C87B]/40 bg-[#1B2F20]/65 px-4 py-1 lg:px-5 lg:py-1.5 backdrop-blur-sm shadow-sm">
          <span className="h-1 w-1 rounded-full bg-[#F2D98D]" />
          <span className="font-royal-serif text-[10px] sm:text-[11px] lg:text-xs font-bold uppercase tracking-[0.26em] text-[#F7E4A6]">
            {familyBlessingLine || '|| Shri Ganeshay Namah ||'}
          </span>
          <span className="h-1 w-1 rounded-full bg-[#F2D98D]" />
        </div>
      </div>

      {/* BOTTOM ENGRAVED DEDICATION RIBBON (Personalized Guest Name or Couple Names) */}
      <div
        className={`pointer-events-none absolute inset-x-0 z-20 flex flex-col items-center px-6 text-center transition-all duration-700 ${
          compact ? 'bottom-6' : 'bottom-7 sm:bottom-9 lg:bottom-11'
        } ${medallionGone ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
      >
        <div className="rounded-2xl border border-[#E5C87B]/35 bg-[#1B2F20]/70 px-5 py-2 lg:px-7 lg:py-2.5 backdrop-blur-sm shadow-md">
          {guestName ? (
            <>
              <span className="block font-royal-serif text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.26em] text-[#E9CE82]">
                {copy.gate.royalInvitation}
              </span>
              <span className="mt-0.5 block font-royal-serif text-sm sm:text-base lg:text-lg font-semibold tracking-wide text-[#FFF7DF]">
                {copy.hero.dearGuestPrefix} {guestName}
              </span>
            </>
          ) : (
            <>
              <span className="block font-royal-serif text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.26em] text-[#E9CE82]">
                {copy.gate.weddingReveal}
              </span>
              <span className="mt-0.5 block font-royal-serif text-sm sm:text-base lg:text-lg font-semibold tracking-wider text-[#FFF7DF]">
                {brideName} &amp; {groomName}
              </span>
            </>
          )}
        </div>
      </div>

      {/* CENTER SCULPTED 16-PETAL SCALLOPED HERITAGE MEDALLION */}
      <button
        type="button"
        onClick={handleTap}
        aria-label={`${copy.gate.tapToOpen} — ${brideName} & ${groomName}`}
        className={`group absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE29F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#2C4532] transition-all duration-700 ${
          stage === 'pressed'
            ? 'pointer-events-none scale-[1.15] opacity-0 -translate-y-[58%]'
            : doorsParting
              ? 'pointer-events-none scale-125 opacity-0 -translate-y-[70%]'
              : 'scale-100 opacity-100 hover:scale-105 active:scale-95'
        }`}
      >
        {/* Warm Breathing Golden Aura */}
        <span
          className="pointer-events-none absolute -inset-6 rounded-full blur-xl opacity-75"
          style={{
            background:
              'radial-gradient(circle, rgba(250, 224, 150, 0.58) 0%, rgba(212, 175, 55, 0) 70%)',
            animation: reducedMotion ? 'none' : 'pulse 2.8s ease-in-out infinite',
          }}
        />

        {/* Outer Rotating Dotted Halo */}
        <span
          className="pointer-events-none absolute -inset-3 rounded-full border border-dashed border-[#F4DF9F]/65"
          style={{
            animation: reducedMotion ? 'none' : 'weddingSlowSpin 28s linear infinite',
          }}
        />

        {/* 16-Petal Scalloped SVG Medallion Body */}
        <div
          className={`relative flex items-center justify-center ${
            compact ? 'h-32 w-32' : 'h-36 w-36 sm:h-40 sm:w-40 lg:h-44 lg:w-44'
          }`}
        >
          <svg
            className="absolute inset-0 h-full w-full drop-shadow-[0_20px_36px_rgba(8,18,11,0.62)]"
            viewBox="0 0 160 160"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id={medallionBgId} cx="34%" cy="28%" r="72%">
                <stop offset="0%" stopColor="#FFFDF9" />
                <stop offset="56%" stopColor="#FDF3E3" />
                <stop offset="100%" stopColor="#EED6B8" />
              </radialGradient>
              <linearGradient id={medallionGoldId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F9E7AC" />
                <stop offset="50%" stopColor="#C99D3B" />
                <stop offset="100%" stopColor="#946B17" />
              </linearGradient>
            </defs>

            {/* Scalloped Outer Rim */}
            <path
              d={SCALLOP_MEDALLION_PATH}
              fill={`url(#${medallionBgId})`}
              stroke={`url(#${medallionGoldId})`}
              strokeWidth="2.8"
            />
            {/* Inner Beaded Filigree Rings */}
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="none"
              stroke="#C89E40"
              strokeWidth="1"
              strokeDasharray="2.5 2.5"
              opacity="0.85"
            />
            <circle cx="80" cy="80" r="54" fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.5" />
          </svg>

          {/* Subtle Sweeping Metallic Sheen Over Medallion */}
          <span
            className="pointer-events-none absolute inset-4 overflow-hidden rounded-full"
            aria-hidden="true"
          >
            <span
              className="absolute inset-y-0 -left-1/2 w-1/2 rotate-[25deg] bg-gradient-to-r from-transparent via-white/55 to-transparent"
              style={{
                animation: reducedMotion ? 'none' : 'weddingGoldSheen 4.4s ease-in-out infinite',
              }}
            />
          </span>

          {/* Medallion Center Content */}
          <div className="relative z-10 flex flex-col items-center justify-center px-3 text-center">
            {/* Botanical Olive Sprig Emblem */}
            <svg
              className={`${compact ? 'h-4 w-4' : 'h-5 w-5 lg:h-6 lg:w-6'} text-[#2E4B35] mb-1`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.6}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20V10m0 0C12 6.8 9.2 4.5 5.5 4.5c0 3.8 2.4 6.5 6.5 5.5zm0 0c0-3.2 2.8-5.5 6.5-5.5 0 3.8-2.4 6.5-6.5 5.5z"
              />
            </svg>

            <span
              className={`font-royal-script font-bold leading-none text-[#1E3524] tracking-wide ${
                compact ? 'text-xl' : 'text-[26px] sm:text-3xl lg:text-[34px]'
              }`}
            >
              {monogram}
            </span>

            <span className="mt-1.5 h-[1px] w-10 bg-gradient-to-r from-transparent via-[#C89E40] to-transparent" />

            <span
              className={`mt-1.5 font-royal-serif font-bold uppercase tracking-[0.2em] text-[#83621A] leading-tight ${
                compact ? 'text-[8px]' : 'text-[9.5px] lg:text-[10.5px]'
              }`}
            >
              {copy.gate.tapToOpen}
            </span>
          </div>
        </div>
      </button>

      {/* RADIAL GOLDEN SPARKLE BURST ON TAP */}
      {!reducedMotion && stage !== 'idle' && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          {SPARKLE_BURST.map((p, idx) => {
            const rad = (p.angle * Math.PI) / 180;
            const tx = Math.round(Math.cos(rad) * p.dist);
            const ty = Math.round(Math.sin(rad) * p.dist);
            return (
              <span
                key={idx}
                className="absolute rounded-full bg-[#FFF0B8]"
                style={
                  {
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    boxShadow: '0 0 10px 2px rgba(246, 206, 102, 0.9)',
                    '--tx': `${tx}px`,
                    '--ty': `${ty}px`,
                    animation: `weddingSparkleOut 1050ms cubic-bezier(0.16, 1, 0.3, 1) ${p.delay} forwards`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
