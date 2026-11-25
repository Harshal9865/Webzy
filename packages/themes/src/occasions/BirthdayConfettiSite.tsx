'use client';

import React, { useEffect, useState } from 'react';
import {
  type CoreLanguageCode,
  pickLocalizedText,
  toCoreLanguageCode,
} from '@webzy/core';
import {
  OccasionArtworkBackdrop,
  OccasionCassettePlayer,
  OccasionChapterNav,
  OccasionFilmstripGallery,
  OccasionPhotoGallery,
  type OccasionSiteProps,
  getReplayLabel,
  getWebzyFooterLabel,
} from './shared/OccasionPrimitives';

type ConfettiChapterId = 'cake' | 'journal' | 'filmstrip' | 'surprises';

interface LocalizedConfettiCopy {
  coverBadge: string;
  fromLabel: string;
  tapButton: string;
  hintText: string;
  tabs: Record<ConfettiChapterId, string>;
  cakePrompt: string;
  candleTapHint: string;
  candlesLitStatus: (out: number, total: number) => string;
  wishUnlocked: string;
  relightHint: string;
  noteLabel: string;
  journalTag: string;
  journalBinderTitle: string;
  signedPrefix: string;
  filmstripHeader: string;
  memoriesLabel: string;
  cassetteHeader: string;
  cassettePrompt: string;
  cassettePlaying: string;
  balloonsHeader: string;
  tapToPop: string;
  allUnlocked: string;
  launchConfetti: string;
  nextChapter: string;
  relations: Record<string, string>;
}

const CONFETTI_COPY: Record<CoreLanguageCode, LocalizedConfettiCopy> = {
  hinglish: {
    coverBadge: 'Aapke liye ek khaas birthday box',
    fromLabel: 'Bheja hai:',
    tapButton: 'Tap to Celebrate',
    hintText: 'Celebrate karne ke liye envelope ya button par tap karein',
    tabs: {
      cake: 'Cake & Wish',
      journal: 'Scrapbook',
      filmstrip: '35mm Reel',
      surprises: 'Mixtape & Balloons',
    },
    cakePrompt: 'Teeno candles par tap karke wish maango',
    candleTapHint: 'Har candle tap karke bujhaayein ya ek saath blow out karein',
    candlesLitStatus: (out, total) => `${out}/${total} Candles Out`,
    wishUnlocked: 'Wish Unlocked!',
    relightHint: 'Dobara candles jalaane ke liye tap karein',
    noteLabel: 'Postage Stamp Note',
    journalTag: 'FAV HUMAN EDITION',
    journalBinderTitle: 'Birthday Chronicle',
    signedPrefix: 'Pyaar ke saath,',
    filmstripHeader: '35mm Photo Booth Reel',
    memoriesLabel: 'Polaroid Snapshots',
    cassetteHeader: 'Mini Cassette Mixtape',
    cassettePrompt: 'Click Me · Birthday Chime',
    cassettePlaying: 'Spinning Birthday Chime...',
    balloonsHeader: 'Balloons tap karke secrets kholo:',
    tapToPop: 'Tap karke padho...',
    allUnlocked: 'All Unlocked',
    launchConfetti: 'Phir se Confetti udaao',
    nextChapter: 'Next Section',
    relations: {
      friend: 'Best Friend',
      partner: 'Partner',
      sibling: 'Bhai / Didi',
    },
  },
  hi: {
    coverBadge: 'आपके लिए एक खास बर्थडे उपहार',
    fromLabel: 'प्रेषक:',
    tapButton: 'जश्न मनाने के लिए खोलें',
    hintText: 'खोलने के लिए लिफ़ाफ़े या बटन पर टैप करें',
    tabs: {
      cake: 'केक और विश',
      journal: 'स्क्रैपबुक',
      filmstrip: 'फ़ोटो रील',
      surprises: 'कैसेट और गुब्बारे',
    },
    cakePrompt: 'तीनों मोमबत्तियों पर टैप कर विश मांगें',
    candleTapHint: 'हर मोमबत्ती को टैप करें या एक साथ बुझाएँ',
    candlesLitStatus: (out, total) => `${out}/${total} मोमबत्तियाँ बुझीं`,
    wishUnlocked: 'विश अनलॉक हुई!',
    relightHint: 'मोमबत्तियाँ फिर से जलाने के लिए टैप करें',
    noteLabel: 'खास डाक पत्र',
    journalTag: 'खास जन्मदिन अंक',
    journalBinderTitle: 'यादों की डायरी',
    signedPrefix: 'स्नेह सहित,',
    filmstripHeader: '35mm यादगार फ़ोटो रील',
    memoriesLabel: 'पोलरॉइड यादें',
    cassetteHeader: 'रेट्रो कैसेट प्लेयर',
    cassettePrompt: 'टैप करें · बर्थडे धुन',
    cassettePlaying: 'बर्थडे धुन बज रही है...',
    balloonsHeader: 'गुब्बारों पर टैप कर संदेश खोलें:',
    tapToPop: 'पढ़ने के लिए टैप करें...',
    allUnlocked: 'सभी खुल गए',
    launchConfetti: 'फिर से कन्फेटी उड़ाएं',
    nextChapter: 'अगला भाग',
    relations: {
      friend: 'पक्का दोस्त',
      partner: 'जीवनसाथी',
      sibling: 'भाई / बहन',
    },
  },
  en: {
    coverBadge: 'A special birthday keepsake for you',
    fromLabel: 'From:',
    tapButton: 'Tap to Celebrate',
    hintText: 'Tap the envelope or button to unwrap your birthday card',
    tabs: {
      cake: 'Cake & Wish',
      journal: 'Scrapbook',
      filmstrip: '35mm Reel',
      surprises: 'Mixtape & Balloons',
    },
    cakePrompt: 'Blow out all 3 candles to unlock your wish',
    candleTapHint: 'Tap each candle flame individually or tap the cake button',
    candlesLitStatus: (out, total) => `${out}/${total} Candles Out`,
    wishUnlocked: 'Wish Unlocked!',
    relightHint: 'Tap to relight the candles',
    noteLabel: 'Postage Stamp Note',
    journalTag: 'MY FAV HUMAN EDITION',
    journalBinderTitle: 'Birthday Scrapbook',
    signedPrefix: 'Always cheering for you,',
    filmstripHeader: '35mm Filmstrip Reel',
    memoriesLabel: 'Taped Polaroid Snapshots',
    cassetteHeader: 'Retro Birthday Cassette',
    cassettePrompt: 'Click Me · Birthday Chime',
    cassettePlaying: 'Playing Birthday Chime...',
    balloonsHeader: 'Pop the balloons for hidden wishes:',
    tapToPop: 'Tap balloon to read...',
    allUnlocked: 'All Unlocked',
    launchConfetti: 'Launch Confetti Again',
    nextChapter: 'Next Chapter',
    relations: {
      friend: 'Best Friend',
      partner: 'Partner',
      sibling: 'Sibling',
    },
  },
};

const CHAPTER_ORDER: readonly ConfettiChapterId[] = ['cake', 'journal', 'filmstrip', 'surprises'];

const CONFETTI_PIECES = [
  { left: '8%', delay: '0ms', duration: '1550ms', color: '#E11D63', shape: 'ribbon', rotate: '-18deg' },
  { left: '16%', delay: '120ms', duration: '1700ms', color: '#F59E0B', shape: 'diamond', rotate: '25deg' },
  { left: '25%', delay: '60ms', duration: '1500ms', color: '#FB7185', shape: 'circle', rotate: '0deg' },
  { left: '34%', delay: '180ms', duration: '1680ms', color: '#FFFFFF', shape: 'diamond', rotate: '40deg' },
  { left: '43%', delay: '40ms', duration: '1600ms', color: '#F59E0B', shape: 'ribbon', rotate: '-24deg' },
  { left: '52%', delay: '140ms', duration: '1750ms', color: '#E11D63', shape: 'circle', rotate: '0deg' },
  { left: '61%', delay: '90ms', duration: '1580ms', color: '#F59E0B', shape: 'ribbon', rotate: '22deg' },
  { left: '70%', delay: '200ms', duration: '1650ms', color: '#FB7185', shape: 'diamond', rotate: '-35deg' },
  { left: '79%', delay: '70ms', duration: '1540ms', color: '#FFFFFF', shape: 'ribbon', rotate: '16deg' },
  { left: '88%', delay: '150ms', duration: '1720ms', color: '#F59E0B', shape: 'circle', rotate: '0deg' },
  { left: '94%', delay: '30ms', duration: '1620ms', color: '#E11D63', shape: 'diamond', rotate: '-20deg' },
] as const;

function resolveRelationLabel(relation: string | undefined, copy: LocalizedConfettiCopy): string | null {
  if (!relation?.trim()) return null;
  const normalized = relation.trim().toLowerCase();
  if (copy.relations[normalized]) return copy.relations[normalized];
  return relation.trim().replace(/\b\w/g, (char) => char.toUpperCase());
}

function ScallopedBunting({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <svg
      viewBox="0 0 360 44"
      className="pointer-events-none h-9 w-full shrink-0"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0 4 Q90 22 180 6 T360 8" fill="none" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1.5" />
      <path d="M12 6 L34 6 L23 28 Z" fill={primary} />
      <path d="M46 11 L68 11 L57 32 Z" fill={secondary} />
      <path d="M80 14 L102 13 L91 34 Z" fill="#FFFDF9" />
      <path d="M114 13 L136 11 L125 32 Z" fill={primary} />
      <path d="M148 9 L170 7 L159 29 Z" fill={secondary} />
      <path d="M188 7 L210 10 L199 30 Z" fill="#FFFDF9" />
      <path d="M222 12 L244 14 L233 34 Z" fill={secondary} />
      <path d="M256 14 L278 13 L267 33 Z" fill={primary} />
      <path d="M290 12 L312 10 L301 31 Z" fill="#FFFDF9" />
      <path d="M324 9 L346 8 L335 28 Z" fill={secondary} />
    </svg>
  );
}

function ConfettiBurstLayer({ burstId }: { burstId: number }) {
  if (burstId === 0) return null;

  return (
    <div
      key={burstId}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden motion-reduce:hidden"
    >
      {CONFETTI_PIECES.map((piece, idx) => (
        <span
          key={`${burstId}-${idx}`}
          className="wc-confetti-piece absolute -top-4 block"
          style={{
            left: piece.left,
            backgroundColor: piece.color,
            width: piece.shape === 'ribbon' ? '7px' : '9px',
            height: piece.shape === 'ribbon' ? '14px' : '9px',
            borderRadius: piece.shape === 'circle' ? '9999px' : '2px',
            transform: piece.shape === 'diamond' ? 'rotate(45deg)' : `rotate(${piece.rotate})`,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
          }}
        />
      ))}
    </div>
  );
}

function CelebrationCakeStage({
  blownCandles,
  onToggleSingleCandle,
  primaryColor,
  secondaryColor,
}: {
  blownCandles: boolean[];
  onToggleSingleCandle: (idx: number) => void;
  primaryColor: string;
  secondaryColor: string;
}) {
  const candlePositions = [78, 110, 142];
  const allOut = blownCandles.every(Boolean);

  return (
    <div className="relative mx-auto flex w-full max-w-[260px] flex-col items-center">
      <svg viewBox="0 0 220 165" className="h-40 w-full max-w-[230px] drop-shadow-sm" fill="none">
        {/* Soft halo behind cake */}
        <circle
          cx="110"
          cy="78"
          r="62"
          fill={allOut ? '#FEF3C7' : '#FFE8EF'}
          className="transition-colors duration-500"
        />

        {/* Sparkles unlocked when all candles are blown out */}
        <g
          className={`transition-all duration-500 ${
            allOut ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{ transformOrigin: '110px 65px' }}
        >
          <path d="M40 38 L43.5 46 L51.5 49.5 L43.5 53 L40 61 L36.5 53 L28.5 49.5 L36.5 46 Z" fill={secondaryColor} />
          <path d="M178 34 L181 41 L188 44 L181 47 L178 54 L175 47 L168 44 L175 41 Z" fill={primaryColor} />
          <circle cx="60" cy="22" r="3" fill={primaryColor} />
          <circle cx="160" cy="22" r="3" fill={secondaryColor} />
        </g>

        {/* Candles — each independently tappable */}
        {candlePositions.map((x, idx) => {
          const isOut = blownCandles[idx];
          return (
            <g
              key={x}
              onClick={() => onToggleSingleCandle(idx)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`Candle ${idx + 1} ${isOut ? 'out' : 'lit'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleSingleCandle(idx);
                }
              }}
            >
              {/* Generous invisible hit area for effortless finger taps */}
              <rect x={x - 14} y="8" width="28" height="58" fill="transparent" />
              <rect
                x={x - 4.5}
                y="38"
                width="9"
                height="26"
                rx="3"
                fill={idx === 1 ? primaryColor : secondaryColor}
              />
              <path d={`M${x - 4.5} 46 L${x + 4.5} 43 M${x - 4.5} 54 L${x + 4.5} 51`} stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.7" />
              <line x1={x} y1="34" x2={x} y2="38" stroke="#2B1B2E" strokeWidth="1.6" strokeLinecap="round" />

              <g
                className={`wc-flame transition-all duration-300 ${
                  isOut ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                }`}
                style={{
                  transformOrigin: `${x}px 33px`,
                  animationDelay: `${idx * 140}ms`,
                }}
              >
                <ellipse cx={x} cy="25" rx="7.5" ry="10" fill={secondaryColor} fillOpacity="0.25" />
                <path
                  d={`M${x} 16 C${x + 5.5} 23, ${x + 5.5} 32, ${x} 34 C${x - 5.5} 32, ${x - 5.5} 23, ${x} 16 Z`}
                  fill={secondaryColor}
                />
                <path
                  d={`M${x} 22 C${x + 2.8} 26, ${x + 2.8} 31, ${x} 32.5 C${x - 2.8} 31, ${x - 2.8} 26, ${x} 22 Z`}
                  fill="#FFFBEB"
                />
              </g>

              {isOut ? (
                <path
                  d={`M${x} 32 C${x - 4} 26, ${x + 4} 20, ${x - 1} 14`}
                  stroke="#2B1B2E"
                  strokeOpacity="0.35"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="wc-smoke"
                  style={{ animationDelay: `${idx * 110}ms` }}
                />
              ) : null}
            </g>
          );
        })}

        {/* Frosted polka-dot 2-tier cake inspired by birthday cake reference */}
        <rect x="64" y="63" width="92" height="36" rx="10" fill="#FFFFFF" stroke="#2B1B2E" strokeOpacity="0.14" strokeWidth="1.5" />
        <path
          d="M64 70 C64 65, 68 63, 74 63 L146 63 C152 63, 156 65, 156 70 L156 76 C151 79, 147 75, 142 78 C137 81, 133 74, 127 77 C121 80, 117 75, 110 79 C103 82, 99 74, 93 77 C87 80, 82 75, 76 78 C71 80, 67 76, 64 75 Z"
          fill={secondaryColor}
        />
        <circle cx="80" cy="87" r="2.2" fill={primaryColor} />
        <circle cx="96" cy="91" r="2.2" fill="#3B82F6" />
        <circle cx="110" cy="87" r="2.2" fill={secondaryColor} />
        <circle cx="126" cy="91" r="2.2" fill={primaryColor} />
        <circle cx="140" cy="87" r="2.2" fill="#3B82F6" />

        <rect x="44" y="96" width="132" height="44" rx="12" fill={primaryColor} />
        <path
          d="M44 103 C44 98, 48 96, 54 96 L166 96 C172 96, 176 98, 176 103 L176 108 C169 112, 163 106, 156 110 C149 114, 143 107, 136 111 C128 115, 121 107, 110 112 C100 116, 92 107, 84 111 C76 115, 69 107, 61 110 C55 113, 49 108, 44 108 Z"
          fill="#FFFDF9"
        />
        <circle cx="64" cy="126" r="3" fill="#FFFBEB" />
        <circle cx="92" cy="128" r="3" fill={secondaryColor} />
        <circle cx="112" cy="124" r="2.5" fill="#93C5FD" />
        <circle cx="132" cy="128" r="3" fill="#FFFBEB" />
        <circle cx="156" cy="126" r="3" fill={secondaryColor} />

        <rect x="30" y="139" width="160" height="8" rx="4" fill="#2B1B2E" fillOpacity="0.16" />
        <rect x="34" y="136" width="152" height="7" rx="3.5" fill="#FFFFFF" stroke="#2B1B2E" strokeOpacity="0.14" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

/**
 * Multi-chapter tactile Birthday Confetti keepsake microsite modeled on the crimson envelope,
 * polka-dot cake candles, postage-stamp journal, 35mm filmstrip, and clickable cassette references.
 */
export function BirthdayConfettiSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const [opened, setOpened] = useState(false);
  const [activeChapter, setActiveChapter] = useState<ConfettiChapterId>('cake');
  const [showTapHint, setShowTapHint] = useState(false);
  const [blownCandles, setBlownCandles] = useState<boolean[]>([false, false, false]);
  const [popped, setPopped] = useState<number[]>([]);
  const [confettiBurstKey, setConfettiBurstKey] = useState(0);

  const coreLang = toCoreLanguageCode(language);
  const copy = CONFETTI_COPY[coreLang] ?? CONFETTI_COPY.en;

  const primaryColor = manifest.palette.primary || '#E11D63';
  const secondaryColor = manifest.palette.secondary || '#F59E0B';
  const inkColor = manifest.palette.ink || '#2B1B2E';
  const highlights = data.highlights ?? [];
  const relationLabel = resolveRelationLabel(data.relation, copy);
  const candlesOutCount = blownCandles.filter(Boolean).length;
  const allCandlesOut = candlesOutCount === 3;
  const allPopped = highlights.length > 0 && popped.length === highlights.length;
  const musicLabel = manifest.music[0]?.label || 'Warm Confetti Chime';

  useEffect(() => {
    if (opened) return;
    const hintTimer = setTimeout(() => setShowTapHint(true), 7000);
    return () => clearTimeout(hintTimer);
  }, [opened]);

  function triggerConfetti() {
    setConfettiBurstKey((prev) => prev + 1);
  }

  function handleOpen() {
    setOpened(true);
    setActiveChapter('cake');
    setConfettiBurstKey((prev) => prev + 1);
    onOpened?.();
  }

  function handleReplay() {
    setOpened(false);
    setShowTapHint(false);
    setActiveChapter('cake');
    setBlownCandles([false, false, false]);
    setPopped([]);
    setConfettiBurstKey(0);
  }

  function handleToggleSingleCandle(idx: number) {
    setBlownCandles((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      if (next.every(Boolean)) triggerConfetti();
      return next;
    });
  }

  function handleBlowAllCandles() {
    setBlownCandles((prev) => {
      const shouldBlow = !prev.every(Boolean);
      if (shouldBlow) triggerConfetti();
      return [shouldBlow, shouldBlow, shouldBlow];
    });
  }

  function toggleBalloon(idx: number) {
    setPopped((prev) => (prev.includes(idx) ? prev.filter((item) => item !== idx) : [...prev, idx]));
  }

  function goNextChapter() {
    const idx = CHAPTER_ORDER.indexOf(activeChapter);
    const next = CHAPTER_ORDER[(idx + 1) % CHAPTER_ORDER.length];
    setActiveChapter(next);
  }

  const chapterTabs = CHAPTER_ORDER.map((id) => ({ id, label: copy.tabs[id] }));

  return (
    <div
      className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#9B1C2E] text-white"
      style={{ color: inkColor }}
    >
      <style>{`
        @keyframes wcConfettiFall {
          0% { opacity: 0; transform: translate3d(0, -12px, 0) scale(0.85) rotate(0deg); }
          12% { opacity: 1; }
          85% { opacity: 1; }
          100% { opacity: 0; transform: translate3d(10px, 460px, 0) scale(1) rotate(240deg); }
        }
        @keyframes wcFlameFlicker {
          0%, 100% { transform: scaleY(1) scaleX(1) rotate(-1deg); }
          50% { transform: scaleY(1.08) scaleX(0.94) rotate(2deg); }
        }
        @keyframes wcSmokeRise {
          0% { opacity: 0; transform: translateY(4px) scale(0.8); }
          35% { opacity: 0.6; }
          100% { opacity: 0; transform: translateY(-14px) scale(1.15); }
        }
        .wc-confetti-piece {
          animation-name: wcConfettiFall;
          animation-timing-function: cubic-bezier(0.22, 0.7, 0.35, 1);
          animation-fill-mode: forwards;
        }
        .wc-flame {
          animation: wcFlameFlicker 1.15s ease-in-out infinite;
        }
        .wc-smoke {
          animation: wcSmokeRise 1.6s ease-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .wc-confetti-piece, .wc-flame, .wc-smoke { animation: none !important; }
        }
      `}</style>

      <ConfettiBurstLayer burstId={confettiBurstKey} />

      {watermarked ? (
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-20 flex justify-center border-b border-white/15 bg-[#7F1423]/95 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#FEF3C7]"
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      {!opened ? (
        /* COVER: Deep crimson keepsake tabletop with scalloped bunting & cream envelope card */
        <div
          role="button"
          tabIndex={0}
          onClick={handleOpen}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpen();
            }
          }}
          aria-label={`${copy.tapButton} - ${data.receiverName}`}
          className="relative flex flex-1 cursor-pointer flex-col justify-between overflow-hidden px-5 pb-6 pt-2 text-center"
        >
          <OccasionArtworkBackdrop
            src="/templates/occasions/birthday-confetti/cover.jpg"
            fallbackGradient="radial-gradient(circle at 50% 35%, #BE123C 0%, #881337 65%, #4C0519 100%)"
            className="object-cover object-center opacity-40"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#7F1423]/65 via-[#881337]/50 to-[#4C0519]/85"
          />

          <div className="relative z-10 -mx-5">
            <ScallopedBunting primary="#FFE8EF" secondary={secondaryColor} />
          </div>

          {/* Centered Open Envelope Keepsake Card */}
          <div className="relative z-10 mx-auto my-auto w-full max-w-[340px] rounded-[24px] border-2 border-[#FEF3C7]/60 bg-[#FFFDF9]/96 p-5 pb-6 text-center shadow-[0_22px_48px_-14px_rgba(28,5,12,0.7)]">
            {/* Washi tape top strip */}
            <span
              aria-hidden="true"
              className="pointer-events-none mx-auto -mt-8 mb-3 block h-5 w-20 -rotate-2 rounded-xs bg-[#F59E0B]/70 shadow-xs"
            />

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE8EF] px-3 py-1 text-[11px] font-bold text-[#9B1C2E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E11D63]" aria-hidden="true" />
              {copy.coverBadge}
            </span>

            <h2 className="mt-3.5 max-w-full break-words font-heading text-3xl font-bold leading-tight text-[#2B1B2E] sm:text-4xl">
              {data.receiverName}
            </h2>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-[#2B1B2E]/75">
              <span>
                {copy.fromLabel} <strong className="text-[#2B1B2E]">{data.senderName}</strong>
              </span>
              {relationLabel ? (
                <span className="rounded-full border border-[#F59E0B]/45 bg-[#FEF3C7] px-2.5 py-0.5 text-[10px] font-bold text-[#92400E]">
                  {relationLabel}
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpen();
              }}
              className={`mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#F59E0B]/55 bg-[#9B1C2E] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98] ${
                showTapHint ? 'animate-bounce motion-reduce:animate-none' : ''
              }`}
            >
              <span>{copy.tapButton}</span>
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10h10m-4-4l4 4-4 4" />
              </svg>
            </button>

            {showTapHint ? (
              <p className="mt-2.5 text-xs font-semibold text-[#9B1C2E] animate-pulse">{copy.hintText}</p>
            ) : null}
          </div>

          <div className="relative z-10 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FEF3C7]/75">
            {pickLocalizedText(manifest.name, language)}
          </div>
        </div>
      ) : (
        /* INSIDE DEDICATED 4-CHAPTER BIRTHDAY WEBSITE */
        <div className="relative z-10 flex flex-1 flex-col justify-between gap-3.5 px-4 pb-4 pt-3 animate-fade-in motion-reduce:animate-none">
          {/* Header Bar */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold text-[#FEF3C7]">
                <span>{pickLocalizedText(manifest.name, language)}</span>
              </span>
              <button
                type="button"
                onClick={handleReplay}
                className="inline-flex min-h-[40px] items-center rounded-full border border-white/25 bg-white/15 px-3.5 text-xs font-semibold text-white transition hover:bg-white/25"
              >
                {getReplayLabel(language)}
              </button>
            </div>

            <OccasionChapterNav
              tabs={chapterTabs}
              activeId={activeChapter}
              onSelect={(id) => setActiveChapter(id as ConfettiChapterId)}
              accentColor={primaryColor}
              dark
            />
          </div>

          {/* CHAPTER 1: Interactive Candle-Blowing Stage */}
          {activeChapter === 'cake' ? (
            <section className="flex flex-1 flex-col justify-center rounded-[24px] border-2 border-[#FEF3C7]/45 bg-[#FFFDF9] p-4 text-center shadow-xl animate-fade-in">
              <div className="flex items-center justify-between gap-2 px-1">
                <span className="rounded-full bg-[#FFE8EF] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#9B1C2E]">
                  {copy.candlesLitStatus(candlesOutCount, 3)}
                </span>
                <span className="text-[11px] font-semibold text-[#2B1B2E]/60">
                  {copy.candleTapHint}
                </span>
              </div>

              <div className="mt-2 rounded-2xl border border-[#2B1B2E]/10 bg-[radial-gradient(#93C5FD_1.4px,transparent_1.4px)] [background-size:18px_18px] bg-[#F8FAFC] px-3 py-3">
                <CelebrationCakeStage
                  blownCandles={blownCandles}
                  onToggleSingleCandle={handleToggleSingleCandle}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
                <button
                  type="button"
                  onClick={handleBlowAllCandles}
                  className={`mt-1 inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold transition active:scale-95 ${
                    allCandlesOut
                      ? 'border border-[#F59E0B]/55 bg-[#FEF3C7] text-[#92400E] animate-pop-bounce'
                      : 'bg-[#9B1C2E] text-white shadow-sm hover:brightness-110'
                  }`}
                >
                  <span>{allCandlesOut ? copy.wishUnlocked : copy.cakePrompt}</span>
                </button>
              </div>

              <h3 className="mt-4 break-words font-heading text-2xl font-bold leading-snug text-[#2B1B2E]">
                {pickLocalizedText(data.headline, language)}
              </h3>
              {allCandlesOut ? (
                <p className="mt-1 text-[11px] font-medium text-[#9B1C2E]">{copy.relightHint}</p>
              ) : null}

              <button
                type="button"
                onClick={goNextChapter}
                className="mt-4 inline-flex min-h-[42px] items-center justify-center self-center rounded-full border border-[#9B1C2E]/25 bg-[#FFF5F8] px-5 text-xs font-bold text-[#9B1C2E] transition hover:bg-[#FFE8EF]"
              >
                {copy.nextChapter}: {copy.tabs.journal} →
              </button>
            </section>
          ) : null}

          {/* CHAPTER 2: Ring-Bound Postage Stamp Scrapbook */}
          {activeChapter === 'journal' ? (
            <section className="flex flex-1 flex-col justify-center gap-3.5 animate-fade-in">
              {/* Scalloped Postage Stamp Card */}
              <div className="relative rounded-2xl border-4 border-dashed border-[#FFE8EF] bg-[#FFFDF9] p-5 text-left shadow-lg">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-2.5 right-6 h-5 w-16 rotate-2 rounded-[2px] bg-[#F59E0B]/55"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-[#9B1C2E] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
                    {copy.journalTag}
                  </span>
                  <span className="text-[11px] font-bold text-[#9B1C2E]">{copy.noteLabel}</span>
                </div>

                <h4 className="mt-3 font-heading text-xl font-bold text-[#2B1B2E]">
                  {copy.journalBinderTitle} · {data.receiverName}
                </h4>

                <p className="mt-2.5 break-words border-l-2 border-[#E11D63]/45 pl-3 text-sm leading-relaxed text-[#2B1B2E]/90">
                  {pickLocalizedText(data.message, language)}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#2B1B2E]/10 pt-3">
                  <p className="text-xs font-semibold text-[#2B1B2E]/75">
                    {copy.signedPrefix} <strong className="text-[#9B1C2E]">{data.senderName}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={goNextChapter}
                    className="rounded-full bg-[#FFE8EF] px-3.5 py-1.5 text-[11px] font-bold text-[#9B1C2E]"
                  >
                    {copy.tabs.filmstrip} →
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {/* CHAPTER 3: 35mm Filmstrip Reel & Polaroid Booth */}
          {activeChapter === 'filmstrip' ? (
            <section className="flex flex-1 flex-col justify-center gap-3.5 rounded-[24px] bg-[#FFFDF9] p-4 text-left shadow-xl animate-fade-in">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#9B1C2E]">
                  {copy.filmstripHeader}
                </p>
                <div className="mt-2">
                  <OccasionFilmstripGallery
                    photos={data.photos}
                    fallbackImage="/templates/occasions/birthday-confetti/cover.jpg"
                    accentColor={primaryColor}
                    caption={`${data.receiverName.toUpperCase()} · BIRTHDAY REEL`}
                  />
                </div>
              </div>

              {data.photos && data.photos.length > 0 ? (
                <div>
                  <p className="text-xs font-bold text-[#2B1B2E]">{copy.memoriesLabel}</p>
                  <OccasionPhotoGallery
                    photos={data.photos}
                    accentColor={primaryColor}
                    surfaceTint="#FFF5F8"
                    variant="polaroid"
                  />
                </div>
              ) : null}

              <button
                type="button"
                onClick={goNextChapter}
                className="mt-1 inline-flex min-h-[42px] items-center justify-center self-center rounded-full bg-[#9B1C2E] px-5 text-xs font-bold text-white shadow-xs"
              >
                {copy.nextChapter}: {copy.tabs.surprises} →
              </button>
            </section>
          ) : null}

          {/* CHAPTER 4: Retro Cassette Mixtape + Pop-the-Balloons */}
          {activeChapter === 'surprises' ? (
            <section className="flex flex-1 flex-col justify-between gap-3 rounded-[24px] bg-[#FFFDF9] p-4 text-left shadow-xl animate-fade-in">
              <div className="space-y-3">
                <div>
                  <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#9B1C2E]">
                    {copy.cassetteHeader}
                  </p>
                  <OccasionCassettePlayer
                    trackTitle={`${musicLabel} · ${data.receiverName}`}
                    mood="birthday"
                    tapLabel={copy.cassettePrompt}
                    playingLabel={copy.cassettePlaying}
                    accentColor={primaryColor}
                  />
                </div>

                {highlights.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between px-0.5">
                      <p className="text-xs font-bold text-[#9B1C2E]">{copy.balloonsHeader}</p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          allPopped
                            ? 'bg-[#FEF3C7] text-[#92400E] ring-1 ring-[#F59E0B]/40'
                            : 'bg-[#FFE8EF] text-[#E11D63]'
                        }`}
                      >
                        {allPopped ? copy.allUnlocked : `${popped.length}/${highlights.length}`}
                      </span>
                    </div>

                    {highlights.map((item, idx) => {
                      const isOpen = popped.includes(idx);
                      const balloonAccent = idx % 2 === 0 ? primaryColor : secondaryColor;
                      return (
                        <button
                          key={`${pickLocalizedText(item.title, 'en', 'highlight')}-${idx}`}
                          type="button"
                          onClick={() => toggleBalloon(idx)}
                          aria-expanded={isOpen}
                          className={`flex min-h-[48px] w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition-all duration-300 active:scale-[0.98] ${
                            isOpen
                              ? 'border-[#E11D63]/55 bg-white shadow-sm animate-pop-bounce'
                              : 'border-[#E11D63]/20 bg-[#FFE8EF]/45 hover:bg-white'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-xs font-bold text-[#9B1C2E]">
                              {pickLocalizedText(item.title, language)}
                            </p>
                            <p className="mt-0.5 break-words text-xs text-[#2B1B2E]/85">
                              {isOpen ? pickLocalizedText(item.detail, language) : copy.tapToPop}
                            </p>
                          </div>

                          <span
                            aria-hidden="true"
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                              isOpen ? 'bg-[#FEF3C7] text-[#F59E0B]' : 'bg-white text-[#E11D63]'
                            }`}
                          >
                            {isOpen ? (
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l2.2 6.3L20.5 10l-6.3 2.2L12 18.5l-2.2-6.3L3.5 10l6.3-1.7L12 2z" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={balloonAccent} strokeWidth={1.9}>
                                <ellipse cx="12" cy="9.5" rx="5.5" ry="6.5" fill={`${balloonAccent}22`} />
                                <path strokeLinecap="round" d="M12 16v5m-1.5-5h3" />
                              </svg>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={triggerConfetti}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[#9B1C2E]/25 bg-[#FFF5F8] px-4 py-2 text-xs font-bold text-[#9B1C2E] transition hover:bg-[#FFE8EF]"
              >
                <span>{copy.launchConfetti}</span>
              </button>
            </section>
          ) : null}

          <footer className="border-t border-white/15 pt-2.5 text-center text-[11px] font-medium text-[#FEF3C7]/80">
            {getWebzyFooterLabel(language)}
          </footer>
        </div>
      )}
    </div>
  );
}
