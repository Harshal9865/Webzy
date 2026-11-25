'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { getWeddingUiCopy } from '../../i18n';
import type { WeddingLanguage, WeddingThemeKey } from '../../schema';

export type CoutureThemeKey = 'royal-blue' | 'temple-gold' | 'rose-ivory' | 'christian-ivory';

interface GateCoutureProps {
  theme: CoutureThemeKey;
  onOpen: () => void;
  isOpen: boolean;
  brideName: string;
  groomName: string;
  guestName?: string | null;
  familyBlessingLine?: string;
  language?: WeddingLanguage;
  compact?: boolean;
}

interface GateThemeSpec {
  mechanism: 'doors' | 'envelope';
  coverArtUrl: string;
  doorBg: string;
  outerWingBgLeft: string;
  outerWingBgRight: string;
  pillarBgLeft: string;
  pillarBgRight: string;
  featherHex: string;
  seamGradient: string;
  lightShaftBg: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  badgeSubText: string;
  medallionFillStops: [string, string, string];
  medallionGoldStops: [string, string, string];
  medallionBorder: string;
  medallionTitle: string;
  medallionSub: string;
  sparkleHex: string;
  defaultBlessing: string;
  defaultInitials: [string, string];
  emblem: 'crescent' | 'kalash' | 'lotus' | 'cross';
  knockerLabel: 'ring' | 'bell' | 'cross';
  isLightDoor: boolean;
}

const SCALLOP_MEDALLION_PATH =
  'M80 4 C86 4 90 10 95 12 C100 14 107 10 112 13 C117 16 118 23 122 27 C126 31 134 30 138 35 C142 40 140 47 143 52 C146 57 153 59 155 65 C157 71 152 77 153 82 C154 88 158 94 155 100 C152 106 145 107 142 112 C139 117 141 124 136 129 C131 134 124 132 119 135 C114 138 113 146 107 149 C101 152 95 148 90 150 C85 152 80 157 74 156 C68 155 65 149 59 148 C53 147 47 151 42 147 C37 143 37 136 33 132 C29 128 21 129 17 124 C13 119 16 112 13 107 C10 102 4 99 3 93 C2 87 7 81 7 76 C7 70 2 64 5 58 C8 52 15 51 18 46 C21 41 19 34 24 29 C29 24 36 26 41 23 C46 20 47 12 53 9 C59 6 65 11 70 9 C74 7 76 4 80 4 Z';

const GATE_SPECS: Record<CoutureThemeKey, GateThemeSpec> = {
  'royal-blue': {
    mechanism: 'doors',
    coverArtUrl: '/templates/wedding-royal-blue-01/art/indigo-doors.jpg',
    doorBg: '#0D1B36',
    outerWingBgLeft: 'linear-gradient(90deg, #071021 0%, #0E1D3A 55%, #132548 100%)',
    outerWingBgRight: 'linear-gradient(270deg, #071021 0%, #0E1D3A 55%, #132548 100%)',
    pillarBgLeft: 'linear-gradient(90deg, #070F20 0%, #122446 55%, #0D1B36 100%)',
    pillarBgRight: 'linear-gradient(270deg, #070F20 0%, #122446 55%, #0D1B36 100%)',
    featherHex: '#0D1B36',
    seamGradient: 'linear-gradient(180deg, #FAF0CA 0%, #DFBE6B 50%, #8E6E27 100%)',
    lightShaftBg:
      'radial-gradient(ellipse 44% 96% at 50% 50%, rgba(255, 245, 208, 0.96) 0%, rgba(223, 190, 107, 0.56) 38%, rgba(15, 28, 54, 0) 78%)',
    badgeBg: 'bg-[#09142A]/82',
    badgeBorder: 'border-[#DFBE6B]/45',
    badgeText: 'text-[#FFF7DF]',
    badgeSubText: 'text-[#EBD08A]',
    medallionFillStops: ['#1A315E', '#102143', '#071024'],
    medallionGoldStops: ['#FAF0C4', '#DFBE6B', '#8E6D22'],
    medallionBorder: '#DFBE6B',
    medallionTitle: 'text-[#FCE6A6]',
    medallionSub: 'text-[#E3C574]',
    sparkleHex: '#FCE7A6',
    defaultBlessing: '|| Om Shri Ganeshay Namah ||',
    defaultInitials: ['M', 'D'],
    emblem: 'crescent',
    knockerLabel: 'ring',
    isLightDoor: false,
  },
  'temple-gold': {
    mechanism: 'doors',
    coverArtUrl: '/templates/wedding-temple-gold-01/art/kanjeevaram-cover.jpg',
    doorBg: '#4A120E',
    outerWingBgLeft: 'linear-gradient(90deg, #2A0806 0%, #4A120E 55%, #5E1913 100%)',
    outerWingBgRight: 'linear-gradient(270deg, #2A0806 0%, #4A120E 55%, #5E1913 100%)',
    pillarBgLeft: 'linear-gradient(90deg, #260705 0%, #4E140F 55%, #3A0E0A 100%)',
    pillarBgRight: 'linear-gradient(270deg, #260705 0%, #4E140F 55%, #3A0E0A 100%)',
    featherHex: '#4A120E',
    seamGradient: 'linear-gradient(180deg, #FFF2C4 0%, #E8BA55 50%, #9E6518 100%)',
    lightShaftBg:
      'radial-gradient(ellipse 44% 96% at 50% 50%, rgba(255, 244, 198, 0.96) 0%, rgba(232, 186, 85, 0.56) 38%, rgba(74, 18, 14, 0) 78%)',
    badgeBg: 'bg-[#2E0907]/82',
    badgeBorder: 'border-[#E8BA55]/45',
    badgeText: 'text-[#FFF8E4]',
    badgeSubText: 'text-[#F4CE79]',
    medallionFillStops: ['#781F17', '#4E120D', '#2D0806'],
    medallionGoldStops: ['#FFF1BD', '#E8BA55', '#9C6218'],
    medallionBorder: '#E8BA55',
    medallionTitle: 'text-[#FFF1BC]',
    medallionSub: 'text-[#F0C972]',
    sparkleHex: '#FFF0B8',
    defaultBlessing: '|| Shubhamastu ||',
    defaultInitials: ['A', 'K'],
    emblem: 'kalash',
    knockerLabel: 'bell',
    isLightDoor: false,
  },
  'rose-ivory': {
    mechanism: 'envelope',
    coverArtUrl: '/templates/wedding-rose-ivory-01/art/rose-folio-cover.jpg',
    doorBg: '#F4D8DC',
    outerWingBgLeft: 'linear-gradient(90deg, #E4BCC4 0%, #F4D8DC 55%, #FBECEE 100%)',
    outerWingBgRight: 'linear-gradient(270deg, #E4BCC4 0%, #F4D8DC 55%, #FBECEE 100%)',
    pillarBgLeft: 'linear-gradient(90deg, #D9AAB4 0%, #EFCFD5 55%, #E7C0C8 100%)',
    pillarBgRight: 'linear-gradient(270deg, #D9AAB4 0%, #EFCFD5 55%, #E7C0C8 100%)',
    featherHex: '#F4D8DC',
    seamGradient: 'linear-gradient(180deg, #FFF7E4 0%, #C7985A 50%, #8C6030 100%)',
    lightShaftBg:
      'radial-gradient(circle at 50% 48%, rgba(255, 250, 246, 0.96) 0%, rgba(242, 206, 214, 0.6) 38%, rgba(244, 216, 220, 0) 76%)',
    badgeBg: 'bg-[#FFFBFB]/88',
    badgeBorder: 'border-[#C7985A]/50',
    badgeText: 'text-[#5A2636]',
    badgeSubText: 'text-[#8F6232]',
    medallionFillStops: ['#FBE5EA', '#DF99A7', '#A85769'],
    medallionGoldStops: ['#F8E5B8', '#C7985A', '#8A5F2D'],
    medallionBorder: '#C7985A',
    medallionTitle: 'text-[#FFF9FA]',
    medallionSub: 'text-[#FFF0F3]',
    sparkleHex: '#F9E4BC',
    defaultBlessing: '|| Shri Ganeshay Namah ||',
    defaultInitials: ['T', 'V'],
    emblem: 'lotus',
    knockerLabel: 'ring',
    isLightDoor: true,
  },
  'christian-ivory': {
    mechanism: 'doors',
    coverArtUrl: '/templates/wedding-christian-ivory-01/art/chapel-cover.jpg',
    doorBg: '#F4EFE5',
    outerWingBgLeft: 'linear-gradient(90deg, #E2D9C9 0%, #F1EBE0 55%, #FAF7F0 100%)',
    outerWingBgRight: 'linear-gradient(270deg, #E2D9C9 0%, #F1EBE0 55%, #FAF7F0 100%)',
    pillarBgLeft: 'linear-gradient(90deg, #DBD1BE 0%, #ECE4D6 55%, #E4DAC8 100%)',
    pillarBgRight: 'linear-gradient(270deg, #DBD1BE 0%, #ECE4D6 55%, #E4DAC8 100%)',
    featherHex: '#F4EFE5',
    seamGradient: 'linear-gradient(180deg, #FFF9EA 0%, #C49A55 50%, #89632B 100%)',
    lightShaftBg:
      'radial-gradient(ellipse 44% 96% at 50% 50%, rgba(255, 255, 255, 0.98) 0%, rgba(244, 226, 184, 0.58) 40%, rgba(244, 239, 229, 0) 78%)',
    badgeBg: 'bg-[#FFFEFB]/92',
    badgeBorder: 'border-[#C49A55]/50',
    badgeText: 'text-[#28362B]',
    badgeSubText: 'text-[#86642A]',
    medallionFillStops: ['#FFFFFF', '#FAF6EE', '#E6DBC6'],
    medallionGoldStops: ['#FAF0CE', '#C49A55', '#87612B'],
    medallionBorder: '#C49A55',
    medallionTitle: 'text-[#28362B]',
    medallionSub: 'text-[#846229]',
    sparkleHex: '#F7E3B5',
    defaultBlessing: 'Love is patient, love is kind — 1 Corinthians 13:4',
    defaultInitials: ['C', 'A'],
    emblem: 'cross',
    knockerLabel: 'cross',
    isLightDoor: true,
  },
};

const SPARKLE_BURST = [
  { angle: 0, dist: 88, size: 5, delay: '0ms' },
  { angle: 18, dist: 114, size: 3.5, delay: '32ms' },
  { angle: 36, dist: 76, size: 4.5, delay: '14ms' },
  { angle: 54, dist: 124, size: 3, delay: '54ms' },
  { angle: 72, dist: 94, size: 5.5, delay: '20ms' },
  { angle: 90, dist: 110, size: 3.5, delay: '42ms' },
  { angle: 108, dist: 84, size: 4.5, delay: '10ms' },
  { angle: 126, dist: 122, size: 3, delay: '52ms' },
  { angle: 144, dist: 98, size: 5, delay: '24ms' },
  { angle: 162, dist: 116, size: 3.5, delay: '64ms' },
  { angle: 180, dist: 90, size: 5, delay: '0ms' },
  { angle: 198, dist: 120, size: 3, delay: '38ms' },
  { angle: 216, dist: 80, size: 4.5, delay: '16ms' },
  { angle: 234, dist: 126, size: 3.5, delay: '60ms' },
  { angle: 252, dist: 96, size: 5.5, delay: '22ms' },
  { angle: 270, dist: 112, size: 3.5, delay: '48ms' },
  { angle: 288, dist: 86, size: 4.5, delay: '12ms' },
  { angle: 306, dist: 124, size: 3, delay: '56ms' },
  { angle: 324, dist: 100, size: 5, delay: '28ms' },
  { angle: 342, dist: 116, size: 3.5, delay: '66ms' },
] as const;

function GateEmblem({ emblem, color }: { emblem: GateThemeSpec['emblem']; color: string }) {
  if (emblem === 'cross') {
    return (
      <svg className="h-5 w-5 lg:h-6 lg:w-6 mb-1" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" d="M12 3v18M7 9h10" />
        <circle cx="12" cy="9" r="2.2" fill="#FFFDF8" stroke={color} strokeWidth={1.2} />
      </svg>
    );
  }
  if (emblem === 'crescent') {
    return (
      <svg className="h-5 w-5 lg:h-6 lg:w-6 mb-1" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 4.5A8 8 0 1019.5 15a6.4 6.4 0 01-4-10.5z" />
        <circle cx="16.8" cy="7.2" r="1.3" fill={color} />
      </svg>
    );
  }
  if (emblem === 'lotus') {
    return (
      <svg className="h-5 w-5 lg:h-6 lg:w-6 mb-1" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4c2.6 3.5 2.6 8 0 11.5C9.4 12 9.4 7.5 12 4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 10.5c3.2 0 5.8 2.5 6.5 5.5-3.8 0-6.5-2.2-6.5-5.5zm13 0c-3.2 0-5.8 2.5-6.5 5.5 3.8 0 6.5-2.2 6.5-5.5z" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 lg:h-6 lg:w-6 mb-1" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6l1.5 6.5a4.5 4.5 0 01-9 0L9 10z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4c1.5 1.8 1.5 4.2 0 6-1.5-1.8-1.5-4.2 0-6zM8 7l2 3m6-3l-2 3" />
    </svg>
  );
}

export function GateCouture({
  theme,
  onOpen,
  isOpen,
  brideName,
  groomName,
  guestName,
  familyBlessingLine,
  language = 'en',
  compact = false,
}: GateCoutureProps) {
  const [stage, setStage] = useState<'idle' | 'pressed' | 'mid' | 'parting'>('idle');
  const [reducedMotion, setReducedMotion] = useState(false);
  const timersRef = useRef<number[]>([]);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const medFillId = `couture-med-fill-${uid}`;
  const medGoldId = `couture-med-gold-${uid}`;
  const seamAId = `couture-seam-a-${uid}`;
  const seamBId = `couture-seam-b-${uid}`;

  const spec = GATE_SPECS[theme];
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

    setStage('pressed');
    if (spec.mechanism === 'envelope') {
      const t1 = window.setTimeout(() => setStage('mid'), 320);
      const t2 = window.setTimeout(() => {
        setStage('parting');
        onOpen();
      }, 660);
      timersRef.current.push(t1, t2);
    } else {
      const t1 = window.setTimeout(() => setStage('parting'), 280);
      const t2 = window.setTimeout(() => onOpen(), 440);
      timersRef.current.push(t1, t2);
    }
  }

  const doorsParting = stage === 'parting' || isOpen;
  const topFlapUp = stage === 'mid' || stage === 'parting' || isOpen;
  const medallionGone = stage !== 'idle' || isOpen;
  const monogram = `${brideName ? brideName.trim().charAt(0).toUpperCase() : spec.defaultInitials[0]} & ${
    groomName ? groomName.trim().charAt(0).toUpperCase() : spec.defaultInitials[1]
  }`;

  const doorTransition = reducedMotion
    ? 'opacity 360ms ease-out'
    : 'transform 2250ms cubic-bezier(0.22, 1, 0.36, 1), opacity 850ms ease-out 1350ms, box-shadow 1800ms ease-out';

  // ENVELOPE MECHANISM FOR GULAB BAGH (4-Flap Rose-Silk Letterpress Folio + Wax Seal Fracture)
  if (spec.mechanism === 'envelope') {
    const folioBgStyle: React.CSSProperties = {
      backgroundImage: `url('${spec.coverArtUrl}')`,
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
        {/* Desktop Rose-Silk Table Stage */}
        {!compact && (
          <div
            className="hidden lg:block pointer-events-none absolute inset-0 z-0 transition-opacity duration-[1100ms] ease-out"
            style={{
              background:
                'radial-gradient(ellipse 68% 64% at 50% 50%, #F7E0E4 0%, #E7C2CA 58%, #CFA2AE 100%)',
              opacity: doorsParting ? 0 : 1,
            }}
            aria-hidden="true"
          >
            <div className="absolute inset-0 opacity-28" style={folioBgStyle} />
            <div
              className="absolute inset-6 rounded-[26px] border border-[#C7985A]/45 transition-opacity duration-500"
              style={{ opacity: medallionGone ? 0 : 1 }}
            />
          </div>
        )}

        {/* Warm Champagne Light Blooming Inside */}
        <div
          className="pointer-events-none absolute inset-0 z-[25] transition-all duration-[1100ms] ease-out"
          style={{
            background: spec.lightShaftBg,
            opacity: stage === 'mid' ? 0.96 : stage === 'pressed' ? 0.65 : 0,
            transform: stage === 'mid' ? 'scale(1.35)' : stage === 'pressed' ? 'scale(0.92)' : 'scale(0.65)',
          }}
        />

        {/* 4-Flap Blush-Silk Envelope */}
        <div
          className={`relative z-10 bg-transparent transition-shadow duration-700 ${
            compact
              ? 'h-full w-full'
              : `h-full w-full lg:h-[min(84dvh,760px)] lg:w-[min(86vw,640px)] lg:rounded-[22px] ${
                  doorsParting
                    ? 'lg:shadow-none lg:ring-0'
                    : 'lg:shadow-[0_32px_90px_rgba(92,42,58,0.34)] lg:ring-1 lg:ring-[#C7985A]/55'
                }`
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-700"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #FDF2F4 0%, #F3D4DA 65%, #E3BAC3 100%)',
              opacity: topFlapUp ? 0 : 1,
            }}
          />

          {/* LEFT FLAP */}
          <div
            className="absolute inset-0 z-10 origin-left"
            style={{
              clipPath: 'polygon(0 0, 50% 50%, 0 100%)',
              transform: !reducedMotion && doorsParting ? 'rotateY(-170deg)' : 'rotateY(0deg)',
              opacity: doorsParting ? 0 : 1,
              transition: reducedMotion
                ? 'opacity 360ms ease-out'
                : 'transform 1650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 800ms ease-out 780ms',
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="absolute inset-0 bg-[#F4D9DE]" style={folioBgStyle} />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, rgba(130, 68, 86, 0.16) 0%, rgba(255, 250, 250, 0.08) 55%, rgba(130, 68, 86, 0.2) 100%)',
              }}
            />
          </div>

          {/* RIGHT FLAP */}
          <div
            className="absolute inset-0 z-10 origin-right"
            style={{
              clipPath: 'polygon(100% 0, 100% 100%, 50% 50%)',
              transform: !reducedMotion && doorsParting ? 'rotateY(170deg)' : 'rotateY(0deg)',
              opacity: doorsParting ? 0 : 1,
              transition: reducedMotion
                ? 'opacity 360ms ease-out'
                : 'transform 1650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 800ms ease-out 780ms',
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="absolute inset-0 bg-[#F4D9DE]" style={folioBgStyle} />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(270deg, rgba(130, 68, 86, 0.16) 0%, rgba(255, 250, 250, 0.08) 55%, rgba(130, 68, 86, 0.2) 100%)',
              }}
            />
          </div>

          {/* BOTTOM FLAP */}
          <div
            className="absolute inset-0 z-[15] origin-bottom"
            style={{
              clipPath: 'polygon(0 100%, 50% 50%, 100% 100%)',
              transform: !reducedMotion && doorsParting ? 'rotateX(170deg)' : 'rotateX(0deg)',
              opacity: doorsParting ? 0 : 1,
              transition: reducedMotion
                ? 'opacity 360ms ease-out'
                : 'transform 1750ms cubic-bezier(0.22, 1, 0.36, 1) 140ms, opacity 850ms ease-out 900ms',
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="absolute inset-0 bg-[#F7E2E6]" style={folioBgStyle} />
          </div>

          {/* TOP FLAP (Opens First) */}
          <div
            className="absolute inset-0 z-20 origin-top"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 50% 50%)',
              transform: !reducedMotion && topFlapUp ? 'rotateX(-176deg)' : 'rotateX(0deg)',
              opacity: doorsParting ? 0 : 1,
              transition: reducedMotion
                ? 'opacity 360ms ease-out'
                : 'transform 1350ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease-out 650ms',
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
              filter: topFlapUp ? 'none' : 'drop-shadow(0 12px 22px rgba(96, 44, 60, 0.26))',
            }}
          >
            <div className="absolute inset-0 bg-[#FCECEF]" style={folioBgStyle} />
          </div>

          {/* Champagne-Gold Envelope X-Seams & Stitched Double Border */}
          <svg
            className={`pointer-events-none absolute inset-0 h-full w-full z-[22] transition-opacity duration-500 ${
              topFlapUp ? 'opacity-0' : 'opacity-90'
            }`}
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={seamAId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9A6F38" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#E6C386" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#9A6F38" stopOpacity="0.45" />
              </linearGradient>
              <linearGradient id={seamBId} x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9A6F38" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#E6C386" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#9A6F38" stopOpacity="0.45" />
              </linearGradient>
            </defs>
            <line x1="0" y1="0" x2="100" y2="100" stroke={`url(#${seamAId})`} strokeWidth="0.5" />
            <line x1="100" y1="0" x2="0" y2="100" stroke={`url(#${seamBId})`} strokeWidth="0.5" />
            <rect x="2.4" y="1.6" width="95.2" height="96.8" fill="none" stroke="#C7985A" strokeOpacity="0.48" strokeWidth="0.3" />
          </svg>

          {/* TOP BLESSING PLAQUE */}
          <div
            className={`pointer-events-none absolute inset-x-0 z-[25] flex flex-col items-center px-6 text-center transition-all duration-500 ${
              compact ? 'top-6' : 'top-7 sm:top-9 lg:top-10'
            } ${medallionGone ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}
          >
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-sm shadow-sm ${spec.badgeBg} ${spec.badgeBorder}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-[#C7985A]" />
              <span className={`font-royal-serif text-[10px] sm:text-[11px] lg:text-xs font-bold uppercase tracking-[0.22em] ${spec.badgeText}`}>
                {familyBlessingLine || spec.defaultBlessing}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#C7985A]" />
            </div>
          </div>

          {/* BOTTOM DEDICATION PLAQUE */}
          <div
            className={`pointer-events-none absolute inset-x-0 z-[25] flex flex-col items-center px-6 text-center transition-all duration-500 ${
              compact ? 'bottom-6' : 'bottom-7 sm:bottom-9 lg:bottom-10'
            } ${medallionGone ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
          >
            <div className={`rounded-2xl border px-5 py-2.5 lg:px-7 backdrop-blur-sm shadow-md ${spec.badgeBg} ${spec.badgeBorder}`}>
              <span className={`block font-royal-serif text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.26em] ${spec.badgeSubText}`}>
                {copy.gate.royalInvitation}
              </span>
              <span className={`mt-0.5 block font-royal-serif text-sm sm:text-base lg:text-lg font-semibold ${spec.badgeText}`}>
                {guestName ? `${copy.hero.dearGuestPrefix} ${guestName}` : `${brideName} & ${groomName}`}
              </span>
            </div>
          </div>

          {/* ORGANIC 3D ROSE-QUARTZ WAX SEAL WITH FRACTURE CRACKS */}
          <button
            type="button"
            onClick={handleTap}
            aria-label={`${copy.gate.pressToOpen} — ${brideName} & ${groomName}`}
            className={`group absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C7985A] transition-all duration-500 ${
              stage === 'pressed'
                ? 'pointer-events-none scale-95 opacity-100'
                : topFlapUp
                  ? 'pointer-events-none scale-[1.4] opacity-0'
                  : 'scale-100 opacity-100 hover:scale-105 active:scale-95'
            }`}
          >
            <span
              className="pointer-events-none absolute -inset-3 rounded-full border border-dashed border-[#C7985A]/65"
              style={{ animation: reducedMotion ? 'none' : 'weddingSlowSpin 26s linear infinite' }}
            />
            <div
              className={`relative flex items-center justify-center transition-transform duration-300 ${
                compact
                  ? 'h-[124px] w-[124px]'
                  : 'h-[138px] w-[138px] sm:h-[154px] sm:w-[154px] lg:h-[168px] lg:w-[168px]'
              } ${stage === 'pressed' ? 'rotate-6 scale-105' : ''}`}
            >
              <svg className="absolute inset-0 h-full w-full drop-shadow-[0_16px_30px_rgba(94,40,57,0.45)]" viewBox="0 0 120 120" aria-hidden="true">
                <defs>
                  <radialGradient id={medFillId} cx="32%" cy="26%" r="76%">
                    <stop offset="0%" stopColor={spec.medallionFillStops[0]} />
                    <stop offset="48%" stopColor={spec.medallionFillStops[1]} />
                    <stop offset="100%" stopColor={spec.medallionFillStops[2]} />
                  </radialGradient>
                </defs>
                <path
                  d="M60 3 C75 2, 87 7, 97 16 C108 25, 115 38, 116 54 C117 70, 111 86, 100 98 C89 110, 73 117, 57 116 C40 116, 24 109, 14 96 C5 84, 2 67, 4 50 C6 34, 16 19, 29 11 C40 4, 50 4, 60 3 Z"
                  fill={`url(#${medFillId})`}
                />
                <circle cx="60" cy="60" r="44" fill="none" stroke="#FFF4F6" strokeOpacity="0.6" strokeWidth="1.5" />
                <circle cx="60" cy="60" r="37" fill="none" stroke="#FFF4F6" strokeOpacity="0.45" strokeWidth="0.9" strokeDasharray="2.2 2.4" />
                {stage === 'pressed' && (
                  <g stroke="#FFF6D6" strokeWidth="2.1" strokeLinecap="round">
                    <path d="M60 15 L56 41 L64 58 L52 80 L60 105" fill="none" />
                    <path d="M18 51 L43 57 L64 58 L86 48 L102 55" fill="none" />
                  </g>
                )}
              </svg>
              <span className="pointer-events-none absolute inset-4 overflow-hidden rounded-full" aria-hidden="true">
                <span
                  className="absolute inset-y-0 -left-1/2 w-1/2 rotate-[25deg] bg-gradient-to-r from-transparent via-white/45 to-transparent"
                  style={{ animation: reducedMotion ? 'none' : 'weddingGoldSheen 4.6s ease-in-out infinite' }}
                />
              </span>
              <div className="relative z-10 flex flex-col items-center justify-center px-3 text-center">
                <GateEmblem emblem="lotus" color="#FFF7F8" />
                <span className={`font-royal-script font-bold leading-none ${spec.medallionTitle} ${compact ? 'text-2xl' : 'text-[28px] sm:text-3xl lg:text-[36px]'}`}>
                  {monogram}
                </span>
                <span className="mt-1 h-[1px] w-9 bg-gradient-to-r from-transparent via-[#FFF0F3]/80 to-transparent" />
                <span className={`mt-1 font-royal-serif font-bold uppercase tracking-[0.2em] ${spec.medallionSub} ${compact ? 'text-[8px]' : 'text-[9px] lg:text-[10px]'}`}>
                  {copy.gate.pressToOpen}
                </span>
              </div>
            </div>
          </button>

          {/* SPARKLE BURST */}
          {!reducedMotion && medallionGone && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
              {SPARKLE_BURST.map((p, idx) => {
                const rad = (p.angle * Math.PI) / 180;
                return (
                  <span
                    key={idx}
                    className="absolute rounded-full"
                    style={
                      {
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: spec.sparkleHex,
                        boxShadow: `0 0 10px 2px ${spec.sparkleHex}`,
                        '--tx': `${Math.round(Math.cos(rad) * p.dist)}px`,
                        '--ty': `${Math.round(Math.sin(rad) * p.dist)}px`,
                        animation: `weddingSparkleOut 1080ms cubic-bezier(0.16, 1, 0.3, 1) ${p.delay} forwards`,
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

  // 3D HINGED ARCHITECTURAL DOORS MECHANISM (Neela Rajwada, Kashi Swarna, Grace Cathedral)
  return (
    <div
      className={`relative h-full w-full overflow-hidden select-none ${
        isOpen ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      style={{ perspective: '1500px' }}
      aria-label={copy.gate.openAriaLabel}
    >
      {/* Radiance Shaft Pouring Through Widening Seam */}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-all duration-[1200ms] ease-out"
        style={{
          background: spec.lightShaftBg,
          opacity: stage === 'parting' ? 0.96 : stage === 'pressed' ? 0.52 : 0,
          transform: stage === 'parting' ? 'scaleX(2.6) scaleY(1.08)' : 'scaleX(0.22) scaleY(0.95)',
        }}
      />

      {/* Ambient Seam Crack Glow */}
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-[10px] -translate-x-1/2 blur-md transition-opacity duration-500"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,240,185,0) 0%, rgba(255,234,165,0.95) 50%, rgba(255,240,185,0) 100%)',
          opacity: stage === 'pressed' ? 1 : 0,
        }}
      />

      {/* LEFT 3D HINGED ARCHITECTURAL DOOR */}
      <div
        className="absolute top-0 bottom-0 left-0 w-1/2 z-10 overflow-hidden origin-left border-r border-[#DFC16E]/60"
        style={{
          backgroundColor: spec.doorBg,
          transform:
            !reducedMotion && doorsParting
              ? 'translate3d(-24%, 0, 0) rotateY(-82deg)'
              : 'translate3d(0, 0, 0) rotateY(0deg)',
          opacity: doorsParting ? (reducedMotion ? 0 : 0.08) : 1,
          transition: doorTransition,
          boxShadow: doorsParting
            ? '18px 0 42px rgba(8, 12, 22, 0.52), inset -16px 0 32px rgba(8, 12, 22, 0.45)'
            : 'inset -12px 0 28px rgba(8, 12, 22, 0.36)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
        }}
      >
        {!compact && (
          <div
            className="hidden lg:block absolute inset-0 pointer-events-none"
            style={{ background: spec.outerWingBgLeft }}
            aria-hidden="true"
          />
        )}
        <div
          className={`absolute inset-y-0 right-0 overflow-hidden ${
            compact ? 'left-0' : 'left-0 lg:left-auto lg:w-[min(100%,480px)] xl:w-[min(100%,540px)]'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={spec.coverArtUrl}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute top-0 left-0 h-full w-[200%] max-w-none object-cover object-center select-none"
          />
          {!compact && (
            <div
              className="hidden lg:block absolute inset-y-0 left-0 w-24 pointer-events-none"
              style={{
                background: `linear-gradient(90deg, ${spec.featherHex} 0%, transparent 100%)`,
              }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Desktop Tall Outer Carved Border Pilaster (Far Left) */}
        {!compact && (
          <div
            className="hidden lg:flex absolute top-0 bottom-0 left-0 w-16 xl:w-20 flex-col justify-between py-10 items-center border-r border-[#DFC16E]/35 pointer-events-none"
            style={{ background: spec.pillarBgLeft }}
            aria-hidden="true"
          >
            <div className="h-full w-8 border-x border-[#DFC16E]/35 flex flex-col justify-between py-6 items-center">
              <span className="h-2.5 w-2.5 rotate-45 border border-[#F5DF9B]/75 bg-[#C99D3B]/35" />
              <span className="h-full w-[1px] my-4 bg-gradient-to-b from-[#E5C87B]/55 via-[#E5C87B]/20 to-[#E5C87B]/55" />
              <span className="h-2.5 w-2.5 rotate-45 border border-[#F5DF9B]/75 bg-[#C99D3B]/35" />
            </div>
          </div>
        )}

        {/* Carved Door Filigree Frame */}
        <svg
          className={`absolute inset-y-0 h-full opacity-35 pointer-events-none ${
            compact ? 'left-0 w-full' : 'left-0 w-full lg:left-16 xl:left-20 lg:w-[calc(100%-4rem)] xl:w-[calc(100%-5rem)]'
          }`}
          viewBox="0 0 200 600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M 190 14 L 14 14 L 14 586 L 190 586" fill="none" stroke={spec.medallionBorder} strokeWidth="1.2" />
          <path d="M 22 22 L 42 22 M 22 22 L 22 42" stroke={spec.medallionBorder} strokeWidth="1.3" />
          <path d="M 22 578 L 42 578 M 22 578 L 22 558" stroke={spec.medallionBorder} strokeWidth="1.3" />
        </svg>

        {/* Antique Door Handle / Brass Ring Knocker (Left of Seam) */}
        <div
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 flex flex-col items-center opacity-85 ${
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
            className={`-mt-0.5 rounded-full border-2 border-[#DFBD5F] shadow-[0_3px_6px_rgba(0,0,0,0.4)] ${
              compact ? 'h-5 w-5' : 'h-5 w-5 lg:h-7 lg:w-7'
            }`}
          />
        </div>

        <div className="absolute top-0 bottom-0 right-0 w-[3px]" style={{ background: spec.seamGradient }} />
      </div>

      {/* RIGHT 3D HINGED ARCHITECTURAL DOOR */}
      <div
        className="absolute top-0 bottom-0 right-0 w-1/2 z-10 overflow-hidden origin-right border-l border-[#DFC16E]/60"
        style={{
          backgroundColor: spec.doorBg,
          transform:
            !reducedMotion && doorsParting
              ? 'translate3d(24%, 0, 0) rotateY(82deg)'
              : 'translate3d(0, 0, 0) rotateY(0deg)',
          opacity: doorsParting ? (reducedMotion ? 0 : 0.08) : 1,
          transition: doorTransition,
          boxShadow: doorsParting
            ? '-18px 0 42px rgba(8, 12, 22, 0.52), inset 16px 0 32px rgba(8, 12, 22, 0.45)'
            : 'inset 12px 0 28px rgba(8, 12, 22, 0.36)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
        }}
      >
        {!compact && (
          <div
            className="hidden lg:block absolute inset-0 pointer-events-none"
            style={{ background: spec.outerWingBgRight }}
            aria-hidden="true"
          />
        )}
        <div
          className={`absolute inset-y-0 left-0 overflow-hidden ${
            compact ? 'right-0' : 'right-0 lg:right-auto lg:w-[min(100%,480px)] xl:w-[min(100%,540px)]'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={spec.coverArtUrl}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute top-0 right-0 h-full w-[200%] max-w-none object-cover object-center select-none"
          />
          {!compact && (
            <div
              className="hidden lg:block absolute inset-y-0 right-0 w-24 pointer-events-none"
              style={{
                background: `linear-gradient(270deg, ${spec.featherHex} 0%, transparent 100%)`,
              }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Desktop Tall Outer Carved Border Pilaster (Far Right) */}
        {!compact && (
          <div
            className="hidden lg:flex absolute top-0 bottom-0 right-0 w-16 xl:w-20 flex-col justify-between py-10 items-center border-l border-[#DFC16E]/35 pointer-events-none"
            style={{ background: spec.pillarBgRight }}
            aria-hidden="true"
          >
            <div className="h-full w-8 border-x border-[#DFC16E]/35 flex flex-col justify-between py-6 items-center">
              <span className="h-2.5 w-2.5 rotate-45 border border-[#F5DF9B]/75 bg-[#C99D3B]/35" />
              <span className="h-full w-[1px] my-4 bg-gradient-to-b from-[#E5C87B]/55 via-[#E5C87B]/20 to-[#E5C87B]/55" />
              <span className="h-2.5 w-2.5 rotate-45 border border-[#F5DF9B]/75 bg-[#C99D3B]/35" />
            </div>
          </div>
        )}

        <svg
          className={`absolute inset-y-0 h-full opacity-35 pointer-events-none ${
            compact ? 'left-0 w-full' : 'left-0 w-full lg:w-[calc(100%-4rem)] xl:w-[calc(100%-5rem)]'
          }`}
          viewBox="0 0 200 600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M 10 14 L 186 14 L 186 586 L 10 586" fill="none" stroke={spec.medallionBorder} strokeWidth="1.2" />
          <path d="M 178 22 L 158 22 M 178 22 L 178 42" stroke={spec.medallionBorder} strokeWidth="1.3" />
          <path d="M 178 578 L 158 578 M 178 578 L 178 558" stroke={spec.medallionBorder} strokeWidth="1.3" />
        </svg>

        {/* Antique Door Handle / Brass Ring Knocker (Right of Seam) */}
        <div
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 flex flex-col items-center opacity-85 ${
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
            className={`-mt-0.5 rounded-full border-2 border-[#DFBD5F] shadow-[0_3px_6px_rgba(0,0,0,0.4)] ${
              compact ? 'h-5 w-5' : 'h-5 w-5 lg:h-7 lg:w-7'
            }`}
          />
        </div>

        <div className="absolute top-0 bottom-0 left-0 w-[3px]" style={{ background: spec.seamGradient }} />
      </div>

      {/* TOP BLESSING / SCRIPTURE PLAQUE */}
      <div
        className={`pointer-events-none absolute inset-x-0 z-20 flex flex-col items-center px-6 text-center transition-all duration-700 ${
          compact ? 'top-6' : 'top-7 sm:top-9 lg:top-11'
        } ${medallionGone ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}
      >
        <div className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 backdrop-blur-sm shadow-sm ${spec.badgeBg} ${spec.badgeBorder}`}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: spec.medallionBorder }} />
          <span className={`font-royal-serif text-[10px] sm:text-[11px] lg:text-xs font-bold tracking-[0.18em] ${spec.badgeText} ${theme === 'christian-ivory' ? 'italic' : 'uppercase'}`}>
            {familyBlessingLine || spec.defaultBlessing}
          </span>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: spec.medallionBorder }} />
        </div>
      </div>

      {/* BOTTOM DEDICATION PLAQUE */}
      <div
        className={`pointer-events-none absolute inset-x-0 z-20 flex flex-col items-center px-6 text-center transition-all duration-700 ${
          compact ? 'bottom-6' : 'bottom-7 sm:bottom-9 lg:bottom-11'
        } ${medallionGone ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
      >
        <div className={`rounded-2xl border px-5 py-2.5 lg:px-7 lg:py-3 backdrop-blur-sm shadow-md ${spec.badgeBg} ${spec.badgeBorder}`}>
          <span className={`block font-royal-serif text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.26em] ${spec.badgeSubText}`}>
            {theme === 'christian-ivory'
              ? guestName
                ? 'Wedding Invitation'
                : 'Holy Matrimony'
              : guestName
                ? copy.gate.royalInvitation
                : copy.gate.weddingReveal}
          </span>
          <span className={`mt-0.5 block font-royal-serif text-sm sm:text-base lg:text-lg font-semibold tracking-wide ${spec.badgeText}`}>
            {guestName ? `${copy.hero.dearGuestPrefix} ${guestName}` : `${brideName} & ${groomName}`}
          </span>
        </div>
      </div>

      {/* SCULPTED 16-PETAL SCALLOPED HERITAGE MEDALLION WITH SWEEPING GOLD SHEEN */}
      <button
        type="button"
        onClick={handleTap}
        aria-label={`${copy.gate.tapToOpen} — ${brideName} & ${groomName}`}
        className={`group absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBE6B] transition-all duration-700 ${
          stage === 'pressed'
            ? 'pointer-events-none scale-[1.15] opacity-0 -translate-y-[58%]'
            : doorsParting
              ? 'pointer-events-none scale-125 opacity-0 -translate-y-[70%]'
              : 'scale-100 opacity-100 hover:scale-105 active:scale-95'
        }`}
      >
        <span
          className="pointer-events-none absolute -inset-6 rounded-full blur-xl opacity-75"
          style={{
            background: `radial-gradient(circle, ${spec.sparkleHex}99 0%, transparent 70%)`,
            animation: reducedMotion ? 'none' : 'pulse 2.8s ease-in-out infinite',
          }}
        />
        <span
          className="pointer-events-none absolute -inset-3 rounded-full border border-dashed"
          style={{
            borderColor: `${spec.medallionBorder}99`,
            animation: reducedMotion ? 'none' : 'weddingSlowSpin 28s linear infinite',
          }}
        />
        <div
          className={`relative flex items-center justify-center ${
            compact ? 'h-32 w-32' : 'h-36 w-36 sm:h-40 sm:w-40 lg:h-44 lg:w-44'
          }`}
        >
          <svg className="absolute inset-0 h-full w-full drop-shadow-[0_20px_36px_rgba(8,12,22,0.55)]" viewBox="0 0 160 160" aria-hidden="true">
            <defs>
              <radialGradient id={medFillId} cx="34%" cy="28%" r="72%">
                <stop offset="0%" stopColor={spec.medallionFillStops[0]} />
                <stop offset="56%" stopColor={spec.medallionFillStops[1]} />
                <stop offset="100%" stopColor={spec.medallionFillStops[2]} />
              </radialGradient>
              <linearGradient id={medGoldId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={spec.medallionGoldStops[0]} />
                <stop offset="50%" stopColor={spec.medallionGoldStops[1]} />
                <stop offset="100%" stopColor={spec.medallionGoldStops[2]} />
              </linearGradient>
            </defs>
            <path d={SCALLOP_MEDALLION_PATH} fill={`url(#${medFillId})`} stroke={`url(#${medGoldId})`} strokeWidth="2.8" />
            <circle cx="80" cy="80" r="60" fill="none" stroke={spec.medallionBorder} strokeWidth="1" strokeDasharray="2.5 2.5" opacity="0.85" />
            <circle cx="80" cy="80" r="54" fill="none" stroke={spec.medallionBorder} strokeWidth="0.6" opacity="0.5" />
          </svg>

          <span className="pointer-events-none absolute inset-4 overflow-hidden rounded-full" aria-hidden="true">
            <span
              className="absolute inset-y-0 -left-1/2 w-1/2 rotate-[25deg] bg-gradient-to-r from-transparent via-white/50 to-transparent"
              style={{ animation: reducedMotion ? 'none' : 'weddingGoldSheen 4.4s ease-in-out infinite' }}
            />
          </span>

          <div className="relative z-10 flex flex-col items-center justify-center px-3 text-center">
            <GateEmblem emblem={spec.emblem} color={spec.medallionBorder} />
            <span className={`font-royal-script font-bold leading-none tracking-wide ${spec.medallionTitle} ${compact ? 'text-xl' : 'text-[26px] sm:text-3xl lg:text-[34px]'}`}>
              {monogram}
            </span>
            <span className="mt-1.5 h-[1px] w-10" style={{ background: `linear-gradient(90deg, transparent, ${spec.medallionBorder}, transparent)` }} />
            <span className={`mt-1.5 font-royal-serif font-bold uppercase tracking-[0.2em] leading-tight ${spec.medallionSub} ${compact ? 'text-[8px]' : 'text-[9.5px] lg:text-[10.5px]'}`}>
              {copy.gate.tapToOpen}
            </span>
          </div>
        </div>
      </button>

      {/* 20-POINT RADIAL SPARKLE BURST */}
      {!reducedMotion && stage !== 'idle' && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
          {SPARKLE_BURST.map((p, idx) => {
            const rad = (p.angle * Math.PI) / 180;
            return (
              <span
                key={idx}
                className="absolute rounded-full"
                style={
                  {
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: spec.sparkleHex,
                    boxShadow: `0 0 10px 2px ${spec.sparkleHex}`,
                    '--tx': `${Math.round(Math.cos(rad) * p.dist)}px`,
                    '--ty': `${Math.round(Math.sin(rad) * p.dist)}px`,
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

export function isCoutureThemeKey(theme: WeddingThemeKey): theme is CoutureThemeKey {
  return (
    theme === 'royal-blue' ||
    theme === 'temple-gold' ||
    theme === 'rose-ivory' ||
    theme === 'christian-ivory'
  );
}
