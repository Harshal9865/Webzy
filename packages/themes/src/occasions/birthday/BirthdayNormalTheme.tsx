'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  AtmosphericGrainOverlay,
  playCandleBlowSfx,
  playPaperUnsealSfx,
} from '../shared/OccasionCraftPrimitives';
import {
  BIRTHDAY_THEMES_COPY,
  type BirthdayThemeComponentProps,
  getValidPhotos,
  hiSafeStyle,
  useBirthdayReducedMotion,
} from './birthdayTypes';

const CANDLE_COUNT = 7;

interface CutoutTileStyle {
  bg: string;
  color: string;
  fontClass: string;
  rotate: number;
  padClass: string;
  forceCase?: 'upper' | 'lower';
}

const HAPPY_CUTOUTS: CutoutTileStyle[] = [
  { bg: '#1557B0', color: '#F5F1E6', fontClass: 'font-zine tracking-wide', rotate: -4, padClass: 'px-2 sm:px-2.5 py-0.5 sm:py-1' },
  { bg: '#F5F1E6', color: '#1A1A1A', fontClass: 'font-heading font-black', rotate: 3, padClass: 'px-1.5 sm:px-2 py-0.5' },
  { bg: '#2E8BE0', color: '#F5F1E6', fontClass: 'font-playful font-bold', rotate: -2, padClass: 'px-2 sm:px-2.5 py-0.5 sm:py-1' },
  { bg: '#9AC4E8', color: '#0F356E', fontClass: 'font-zine', rotate: 4, padClass: 'px-2 sm:px-2.5 py-0.5' },
  { bg: '#F5F1E6', color: '#1557B0', fontClass: 'font-heading font-black', rotate: -3, padClass: 'px-1.5 sm:px-2 py-0.5 sm:py-1' },
];

const BIRTHDAY_CUTOUTS: CutoutTileStyle[] = [
  { bg: '#0F356E', color: '#F5F1E6', fontClass: 'font-heading font-black', rotate: -3, padClass: 'px-1.5 sm:px-2 py-0.5', forceCase: 'upper' },
  { bg: '#9AC4E8', color: '#1557B0', fontClass: 'font-playful font-bold', rotate: 4, padClass: 'px-1.5 sm:px-2 py-0.5 sm:py-1', forceCase: 'lower' },
  { bg: '#FCE4B8', color: '#1A1A1A', fontClass: 'font-heading font-extrabold', rotate: -5, padClass: 'px-1.5 sm:px-2 py-0.5', forceCase: 'upper' },
  { bg: '#2E8BE0', color: '#F5F1E6', fontClass: 'font-playful font-bold', rotate: 2, padClass: 'px-1.5 sm:px-2 py-0.5 sm:py-1', forceCase: 'lower' },
  { bg: '#D94426', color: '#FCE4B8', fontClass: 'font-zine', rotate: -4, padClass: 'px-1.5 sm:px-2 py-0.5', forceCase: 'upper' },
  { bg: '#F5F1E6', color: '#1A1A1A', fontClass: 'font-heading font-black', rotate: 5, padClass: 'px-1.5 sm:px-2 py-0.5', forceCase: 'lower' },
  { bg: '#0F356E', color: '#F5F1E6', fontClass: 'font-playful font-bold', rotate: -2, padClass: 'px-1.5 sm:px-2 py-0.5 sm:py-1', forceCase: 'lower' },
  { bg: '#2E8BE0', color: '#FCE4B8', fontClass: 'font-zine', rotate: 3, padClass: 'px-1.5 sm:px-2 py-0.5', forceCase: 'upper' },
];

interface CandleSpec {
  x: number;
  topY: number;
  height: number;
  fill: string;
  stripeColor?: string;
}

const CANDLE_SPECS: CandleSpec[] = [
  { x: 96, topY: 74, height: 52, fill: '#F59E2D' },
  { x: 124, topY: 66, height: 58, fill: '#7DAAD3', stripeColor: '#F5F1E6' },
  { x: 152, topY: 72, height: 54, fill: '#FCE4B8', stripeColor: '#D94426' },
  { x: 180, topY: 62, height: 62, fill: '#1557B0' },
  { x: 208, topY: 70, height: 56, fill: '#D94426', stripeColor: '#FDFBF7' },
  { x: 236, topY: 67, height: 58, fill: '#FCE4B8', stripeColor: '#0F356E' },
  { x: 264, topY: 75, height: 51, fill: '#2E8BE0' },
];

interface SprinkleSpec {
  x: number;
  y: number;
  angle: number;
  color: string;
}

const CAKE_SPRINKLES: SprinkleSpec[] = [
  { x: 95, y: 124, angle: 25, color: '#D94426' },
  { x: 108, y: 129, angle: -40, color: '#1557B0' },
  { x: 118, y: 121, angle: 65, color: '#F59E2D' },
  { x: 132, y: 127, angle: -18, color: '#2E9E6B' },
  { x: 145, y: 122, angle: 42, color: '#D94426' },
  { x: 158, y: 130, angle: -55, color: '#2E8BE0' },
  { x: 170, y: 123, angle: 12, color: '#F59E2D' },
  { x: 184, y: 128, angle: -32, color: '#D946EF' },
  { x: 196, y: 121, angle: 50, color: '#1557B0' },
  { x: 210, y: 129, angle: -24, color: '#2E9E6B' },
  { x: 224, y: 122, angle: 36, color: '#D94426' },
  { x: 238, y: 128, angle: -62, color: '#F59E2D' },
  { x: 250, y: 123, angle: 19, color: '#2E8BE0' },
  { x: 263, y: 127, angle: -44, color: '#D94426' },
  { x: 102, y: 148, angle: 32, color: '#F59E2D' },
  { x: 116, y: 158, angle: -28, color: '#2E8BE0' },
  { x: 136, y: 144, angle: 70, color: '#D94426' },
  { x: 152, y: 162, angle: -15, color: '#2E9E6B' },
  { x: 168, y: 149, angle: 48, color: '#1557B0' },
  { x: 188, y: 156, angle: -52, color: '#F59E2D' },
  { x: 204, y: 143, angle: 22, color: '#D946EF' },
  { x: 220, y: 160, angle: -36, color: '#D94426' },
  { x: 242, y: 148, angle: 58, color: '#1557B0' },
  { x: 258, y: 156, angle: -20, color: '#2E9E6B' },
  { x: 84, y: 184, angle: -42, color: '#1557B0' },
  { x: 106, y: 196, angle: 28, color: '#D94426' },
  { x: 126, y: 188, angle: -60, color: '#F59E2D' },
  { x: 148, y: 202, angle: 15, color: '#2E8BE0' },
  { x: 170, y: 190, angle: -34, color: '#2E9E6B' },
  { x: 192, y: 198, angle: 44, color: '#D94426' },
  { x: 214, y: 187, angle: -25, color: '#F59E2D' },
  { x: 236, y: 196, angle: 52, color: '#D946EF' },
  { x: 256, y: 189, angle: -48, color: '#1557B0' },
  { x: 274, y: 198, angle: 20, color: '#2E8BE0' },
  { x: 96, y: 212, angle: 64, color: '#F59E2D' },
  { x: 162, y: 214, angle: -19, color: '#D94426' },
  { x: 226, y: 213, angle: 37, color: '#2E9E6B' },
];

/** Five-point tangerine star sticker with dark navy stroke and die-cut white border. */
function TangerineStarSticker({
  rotateDeg,
  className = '',
}: {
  rotateDeg: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className={`h-7 w-7 shrink-0 sm:h-9 sm:w-9 ${className}`}
      style={{
        transform: `rotate(${rotateDeg}deg)`,
        filter: 'drop-shadow(0 2px 0 rgba(15,53,110,0.22))',
      }}
    >
      <polygon
        points="24,4 29.8,16.6 43.6,18.2 33.4,27.8 36.1,41.6 24,34.7 11.9,41.6 14.6,27.8 4.4,18.2 18.2,16.6"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <polygon
        points="24,5 29.5,16.9 42.6,18.4 32.9,27.5 35.5,40.5 24,34 12.5,40.5 15.1,27.5 5.4,18.4 18.5,16.9"
        fill="#F59E2D"
        stroke="#0F356E"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Cascading silver-cream & cobalt tinsel party streamers anchored to top corners. */
function TinselStreamerCluster({
  side,
  reducedMotion,
}: {
  side: 'left' | 'right';
  reducedMotion: boolean;
}) {
  const isRight = side === 'right';
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 150"
      className={`pointer-events-none absolute top-0 z-10 h-24 w-20 sm:h-32 sm:w-28 ${
        isRight ? 'right-0 -scale-x-100' : 'left-0'
      } ${reducedMotion ? '' : 'birthday-streamer-sway motion-reduce:animate-none'}`}
      style={{ transformOrigin: isRight ? '100% 0%' : '0% 0%' }}
    >
      <path
        d="M8,-4 C18,28 6,54 22,86 C30,104 20,124 28,142"
        fill="none"
        stroke="#0F356E"
        strokeWidth="5.5"
        strokeLinecap="round"
        opacity="0.88"
      />
      <path
        d="M8,-4 C18,28 6,54 22,86 C30,104 20,124 28,142"
        fill="none"
        stroke="#F5F1E6"
        strokeWidth="2.5"
        strokeDasharray="6 7"
        strokeLinecap="round"
      />
      <path
        d="M22,-4 C34,26 48,46 44,78 C40,102 58,118 52,136"
        fill="none"
        stroke="#7DAAD3"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M22,-4 C34,26 48,46 44,78 C40,102 58,118 52,136"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeDasharray="4 8"
        strokeLinecap="round"
      />
      <path
        d="M36,-4 C52,20 72,38 78,66 C82,84 96,94 102,110"
        fill="none"
        stroke="#1557B0"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M36,-4 C52,20 72,38 78,66 C82,84 96,94 102,110"
        fill="none"
        stroke="#FCE4B8"
        strokeWidth="1.8"
        strokeDasharray="5 6"
        strokeLinecap="round"
      />
      {/* Foil star confetti droplets */}
      <polygon points="28,142 30,147 35,147 31,150 32,155 28,152 24,155 25,150 21,147 26,147" fill="#1557B0" />
      <polygon points="52,135 54,139 58,139 55,142 56,146 52,143 48,146 49,142 46,139 50,139" fill="#F59E2D" />
      <polygon points="94,104 95.5,107.5 99,107.5 96.5,109.5 97.5,113 94,111 90.5,113 91.5,109.5 89,107.5 92.5,107.5" fill="#0F356E" />
    </svg>
  );
}

/** Bespoke vintage frosted cupcake & postal stars illustration when 0 photos are provided. */
function SpecialDeliveryCupcakeSvg({ label }: { label: string }) {
  return (
    <div className="flex aspect-[4/5] w-full flex-col items-center justify-between rounded-[3px] border border-[#0F356E]/15 bg-[#FCF8EE] p-3 text-center">
      <div className="flex w-full items-center justify-between px-1 text-[#7DAAD3]">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
          <path d="M12 2L14.2 9.2L21.5 11.5L14.2 13.8L12 21L9.8 13.8L2.5 11.5L9.8 9.2Z" fill="#0F356E" />
        </svg>
        <svg aria-hidden="true" viewBox="0 0 64 14" className="h-3 w-14 text-[#1557B0]/65">
          <path d="M2 4 Q10 1 18 4 T34 4 T50 4 T62 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M2 10 Q10 7 18 10 T34 10 T50 10 T62 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
          <path d="M12 2L14.2 9.2L21.5 11.5L14.2 13.8L12 21L9.8 13.8L2.5 11.5L9.8 9.2Z" fill="#F59E2D" />
        </svg>
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 180 180"
        className="h-auto w-full max-w-[165px]"
      >
        {/* Subtle circular stationery seal behind cupcake */}
        <circle cx="90" cy="94" r="64" fill="#EAF2FA" stroke="#7DAAD3" strokeWidth="1.5" strokeDasharray="4 4" />
        {/* Twinkling stars */}
        <polygon points="36,56 39,63 46,64 41,69 42,76 36,72 30,76 31,69 26,64 33,63" fill="#F59E2D" stroke="#0F356E" strokeWidth="1.2" />
        <polygon points="145,48 147.5,53.5 153.5,54.5 149,58.5 150,64.5 145,61.5 140,64.5 141,58.5 136.5,54.5 142.5,53.5" fill="#1557B0" />
        <circle cx="144" cy="112" r="3" fill="#D94426" />
        <circle cx="34" cy="116" r="2.5" fill="#1557B0" />

        {/* Single lit birthday candle on cupcake */}
        <rect x="85" y="29" width="10" height="28" rx="3" fill="#2E8BE0" stroke="#0F356E" strokeWidth="1.5" />
        <path d="M85 38 L95 34 M85 48 L95 44" stroke="#F5F1E6" strokeWidth="2.2" />
        <line x1="90" y1="29" x2="90" y2="23" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M90 10 C95 16 96 22 90 25 C84 22 85 16 90 10 Z" fill="#F59E2D" />
        <path d="M90 15 C92.5 18.5 92.5 22 90 23.5 C87.5 22 87.5 18.5 90 15 Z" fill="#FFFBEB" />

        {/* Swirled buttercream frosting */}
        <path
          d="M46 100 C36 92 44 76 58 76 C56 62 72 52 90 54 C108 52 124 62 122 76 C136 76 144 92 134 100 C128 106 116 105 108 102 C100 107 80 107 72 102 C64 105 52 106 46 100 Z"
          fill="#FDFBF7"
          stroke="#0F356E"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M62 78 C74 84 106 84 118 76"
          fill="none"
          stroke="#E5D8C5"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Sprinkles on cupcake */}
        <rect x="64" y="68" width="6" height="2.4" rx="1.2" transform="rotate(-24 67 69)" fill="#D94426" />
        <rect x="108" y="67" width="6" height="2.4" rx="1.2" transform="rotate(28 111 68)" fill="#1557B0" />
        <rect x="88" y="69" width="6" height="2.4" rx="1.2" transform="rotate(14 91 70)" fill="#F59E2D" />
        <rect x="74" y="88" width="6" height="2.4" rx="1.2" transform="rotate(-35 77 89)" fill="#2E9E6B" />
        <rect x="103" y="89" width="6" height="2.4" rx="1.2" transform="rotate(40 106 90)" fill="#D94426" />
        <rect x="54" y="88" width="5" height="2.2" rx="1" transform="rotate(18 56 89)" fill="#2E8BE0" />

        {/* Fluted paper cupcake wrapper */}
        <path
          d="M48 100 L132 100 L120 148 C119 152 115 154 110 154 L70 154 C65 154 61 152 60 148 Z"
          fill="#7DAAD3"
          stroke="#0F356E"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <line x1="64" y1="101" x2="71" y2="153" stroke="#1557B0" strokeWidth="2.2" />
        <line x1="81" y1="101" x2="84" y2="153" stroke="#F5F1E6" strokeWidth="2.2" />
        <line x1="99" y1="101" x2="96" y2="153" stroke="#1557B0" strokeWidth="2.2" />
        <line x1="116" y1="101" x2="109" y2="153" stroke="#F5F1E6" strokeWidth="2.2" />
      </svg>

      <div className="w-full border-t border-dashed border-[#7DAAD3] pt-2">
        <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#0F356E]">
          {label}
        </span>
      </div>
    </div>
  );
}

/** Detailed Vintage Cobalt Blue & Cream Retro Camera SVG. */
function RetroCobaltCameraSvg({ flashing }: { flashing: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 112 82" className="h-16 w-[88px] sm:h-20 sm:w-[108px]">
      {/* Top dials & viewfinder bump */}
      <rect x="14" y="10" width="14" height="7" rx="2" fill="#E5DDD0" stroke="#0F356E" strokeWidth="1.6" />
      <rect x="34" y="5" width="38" height="12" rx="3" fill="#1557B0" stroke="#0F356E" strokeWidth="1.6" />
      <rect x="42" y="8" width="12" height="6" rx="1.5" fill="#9AC4E8" stroke="#0F356E" strokeWidth="1.2" />
      <circle cx="84" cy="12" r="4.5" fill="#F5F1E6" stroke="#0F356E" strokeWidth="1.5" />

      {/* Main camera body */}
      <rect x="6" y="16" width="100" height="60" rx="8" fill="#1557B0" stroke="#0F356E" strokeWidth="2" />
      {/* Cream leatherette band */}
      <rect x="8" y="30" width="96" height="36" fill="#F5F1E6" stroke="#0F356E" strokeWidth="1.5" />
      {/* Subtle cobalt grip stripe */}
      <rect x="13" y="34" width="14" height="28" rx="3" fill="#0F356E" opacity="0.16" />

      {/* Flash bulb window */}
      <rect x="80" y="21" width="18" height="11" rx="2.5" fill={flashing ? '#FFFFFF' : '#FCE4B8'} stroke="#0F356E" strokeWidth="1.5" />

      {/* Multi-ring optical lens */}
      <circle cx="56" cy="48" r="21" fill="#E6DEC8" stroke="#0F356E" strokeWidth="2" />
      <circle cx="56" cy="48" r="16" fill="#0F356E" />
      <circle cx="56" cy="48" r="11" fill="#1557B0" stroke="#9AC4E8" strokeWidth="1.4" />
      <circle cx="56" cy="48" r="6" fill="#091D42" />
      <circle cx="51" cy="43" r="2.6" fill="#FFFFFF" opacity="0.9" />
      <circle cx="60" cy="52" r="1.3" fill="#9AC4E8" opacity="0.85" />
    </svg>
  );
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  angle: number;
  spin: number;
  tilt: number;
  tiltSpeed: number;
}

const CONFETTI_COLORS = ['#7DAAD3', '#1557B0', '#F59E2D', '#D94426', '#FCE4B8', '#2E8BE0', '#0F356E'];

export function BirthdayNormalTheme({
  manifest,
  data,
  language,
  watermarked,
  onOpened,
  onOpenPhoto,
}: BirthdayThemeComponentProps) {
  void manifest;
  void watermarked;

  const coreLang = toCoreLanguageCode(language);
  const copy = BIRTHDAY_THEMES_COPY[coreLang]?.normal ?? BIRTHDAY_THEMES_COPY.en.normal;
  const replayLabel = BIRTHDAY_THEMES_COPY[coreLang]?.replay ?? BIRTHDAY_THEMES_COPY.en.replay;
  const reducedMotion = useBirthdayReducedMotion();
  const stampId = useId().replace(/:/g, '');

  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const rawValidPhotos = useMemo(() => getValidPhotos(data.photos), [data.photos]);
  const visiblePhotos = useMemo(
    () =>
      rawValidPhotos
        .map((url, originalIdx) => ({ url, originalIdx }))
        .filter((item) => !failedUrls[item.url]),
    [rawValidPhotos, failedUrls],
  );

  const [cameraFlash, setCameraFlash] = useState(false);
  const [litCandles, setLitCandles] = useState<boolean[]>(() => Array(CANDLE_COUNT).fill(true));
  const [windStrength, setWindStrength] = useState(0);
  const [micState, setMicState] = useState<'idle' | 'listening' | 'denied'>('idle');
  const [celebrateTick, setCelebrateTick] = useState(0);

  const litRef = useRef<boolean[]>(litCandles);
  litRef.current = litCandles;

  const isMountedRef = useRef(true);
  const isStartingMicRef = useRef(false);
  const openedNotifiedRef = useRef(false);
  const flashTimerRef = useRef<number | null>(null);
  const staggerTimersRef = useRef<number[]>([]);
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiRafRef = useRef<number | null>(null);

  // Mic refs for guaranteed cleanup
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micRafRef = useRef<number | null>(null);
  const blowingTriggeredRef = useRef(false);

  const allOut = litCandles.every((lit) => !lit);

  const clearStaggerTimers = useCallback(() => {
    staggerTimersRef.current.forEach((id) => window.clearTimeout(id));
    staggerTimersRef.current = [];
  }, []);

  const stopMic = useCallback(() => {
    if (micRafRef.current !== null) {
      cancelAnimationFrame(micRafRef.current);
      micRafRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    blowingTriggeredRef.current = false;
    setWindStrength(0);
    setMicState((prev) => (prev === 'listening' ? 'idle' : prev));
  }, []);

  const stopConfetti = useCallback(() => {
    if (confettiRafRef.current !== null) {
      cancelAnimationFrame(confettiRafRef.current);
      confettiRafRef.current = null;
    }
    const canvas = confettiCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Full cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (flashTimerRef.current !== null) window.clearTimeout(flashTimerRef.current);
      clearStaggerTimers();
      stopMic();
      stopConfetti();
    };
  }, [clearStaggerTimers, stopConfetti, stopMic]);

  const notifyOpenedOnce = useCallback(() => {
    if (!openedNotifiedRef.current) {
      openedNotifiedRef.current = true;
      onOpened?.();
    }
  }, [onOpened]);

  const triggerCelebration = useCallback(() => {
    stopMic();
    notifyOpenedOnce();
    setCelebrateTick((t) => t + 1);
  }, [notifyOpenedOnce, stopMic]);

  // Lightweight HTML5 2D Canvas confetti burst (~70 scraps over ~2.4s)
  useEffect(() => {
    if (celebrateTick === 0 || reducedMotion) return;
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.offsetWidth || 360;
    const height = canvas.offsetHeight || 420;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const originX = width * 0.5;
    const originY = height * 0.42;

    const pieces: ConfettiPiece[] = Array.from({ length: 72 }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const speed = 3.2 + Math.random() * 5.8;
      return {
        x: originX + (Math.random() - 0.5) * 90,
        y: originY + (Math.random() - 0.5) * 24,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.4,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.22,
        tilt: Math.random() * Math.PI,
        tiltSpeed: 0.08 + Math.random() * 0.14,
      };
    });

    const durationMs = 2400;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const alpha = progress < 0.65 ? 1 : Math.max(0, 1 - (progress - 0.65) / 0.35);

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = alpha;

      for (const p of pieces) {
        p.vy += 0.16;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.tilt += p.tiltSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.scale(1, Math.max(0.25, Math.abs(Math.cos(p.tilt))));
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (progress < 1) {
        confettiRafRef.current = requestAnimationFrame(step);
      } else {
        ctx.clearRect(0, 0, width, height);
        confettiRafRef.current = null;
      }
    };

    confettiRafRef.current = requestAnimationFrame(step);

    return () => {
      stopConfetti();
    };
  }, [celebrateTick, reducedMotion, stopConfetti]);

  const extinguishCandle = useCallback(
    (idx: number) => {
      const current = litRef.current;
      if (!current[idx]) return;
      const next = current.map((lit, i) => (i === idx ? false : lit));
      litRef.current = next;
      setLitCandles(next);
      const nowAllOut = next.every((lit) => !lit);
      playCandleBlowSfx(nowAllOut);
      if (nowAllOut) {
        triggerCelebration();
      }
    },
    [triggerCelebration],
  );

  const blowRemainingSequential = useCallback(
    (staggerMs: number) => {
      clearStaggerTimers();
      const remainingIndices = litRef.current
        .map((lit, idx) => (lit ? idx : -1))
        .filter((idx) => idx !== -1);
      if (remainingIndices.length === 0) return;

      if (reducedMotion || staggerMs <= 0) {
        const next = Array(CANDLE_COUNT).fill(false);
        litRef.current = next;
        setLitCandles(next);
        playCandleBlowSfx(true);
        triggerCelebration();
        return;
      }

      remainingIndices.forEach((candleIdx, stepIdx) => {
        const timerId = window.setTimeout(() => {
          extinguishCandle(candleIdx);
        }, stepIdx * staggerMs);
        staggerTimersRef.current.push(timerId);
      });
    },
    [clearStaggerTimers, extinguishCandle, reducedMotion, triggerCelebration],
  );

  const handleStartMic = useCallback(async () => {
    if (allOut || isStartingMicRef.current) return;
    if (micState === 'listening') {
      stopMic();
      return;
    }

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setMicState('denied');
      return;
    }

    isStartingMicRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        stream.getTracks().forEach((t) => t.stop());
        setMicState('denied');
        return;
      }

      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close().catch(() => {});
        return;
      }

      const source = ctx.createMediaStreamSource(stream);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 450;
      filter.Q.value = 0.7;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;

      source.connect(filter);
      filter.connect(analyser);

      micStreamRef.current = stream;
      audioCtxRef.current = ctx;
      blowingTriggeredRef.current = false;
      setMicState('listening');

      const buffer = new Uint8Array(analyser.fftSize);
      let sustainedSince: number | null = null;

      const sampleMic = () => {
        if (!isMountedRef.current || !micStreamRef.current || !audioCtxRef.current) return;
        analyser.getByteTimeDomainData(buffer);

        let sumSq = 0;
        for (let i = 0; i < buffer.length; i += 1) {
          const v = (buffer[i] - 128) / 128;
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / buffer.length);
        const normalizedWind = Math.min(1, Math.max(0, (rms - 0.015) / 0.14));
        setWindStrength((prev) => prev * 0.55 + normalizedWind * 0.45);

        const now = performance.now();
        if (rms > 0.065) {
          if (sustainedSince === null) {
            sustainedSince = now;
          } else if (now - sustainedSince >= 200 && !blowingTriggeredRef.current) {
            blowingTriggeredRef.current = true;
            blowRemainingSequential(80);
            return;
          }
        } else {
          sustainedSince = null;
        }

        micRafRef.current = requestAnimationFrame(sampleMic);
      };

      micRafRef.current = requestAnimationFrame(sampleMic);
    } catch {
      stopMic();
      if (isMountedRef.current) {
        setMicState('denied');
      }
    } finally {
      isStartingMicRef.current = false;
    }
  }, [allOut, blowRemainingSequential, micState, stopMic]);

  const handleCameraTap = useCallback(() => {
    if (flashTimerRef.current !== null) window.clearTimeout(flashTimerRef.current);
    setCameraFlash(true);
    playPaperUnsealSfx(2);
    notifyOpenedOnce();
    flashTimerRef.current = window.setTimeout(() => {
      setCameraFlash(false);
    }, 140);
    if (visiblePhotos.length >= 1) {
      onOpenPhoto?.(visiblePhotos[0].originalIdx);
    }
  }, [notifyOpenedOnce, onOpenPhoto, visiblePhotos]);

  const handleRelight = useCallback(() => {
    clearStaggerTimers();
    stopMic();
    stopConfetti();
    const relit = Array(CANDLE_COUNT).fill(true);
    litRef.current = relit;
    setLitCandles(relit);
    setCelebrateTick(0);
    setMicState('idle');
  }, [clearStaggerTimers, stopConfetti, stopMic]);

  const handleReplay = useCallback(() => {
    if (flashTimerRef.current !== null) window.clearTimeout(flashTimerRef.current);
    setCameraFlash(false);
    openedNotifiedRef.current = false;
    handleRelight();
  }, [handleRelight]);

  const receiverName = data.receiverName?.trim() || 'You';
  const senderName = data.senderName?.trim() || 'A friend';
  const messageText = pickLocalizedText(data.message, language);
  const isLongNote = messageText.length > 180;
  const langSafe = hiSafeStyle(language);

  const happyChars = Array.from(copy.happyWord);
  const birthdayChars = Array.from(copy.birthdayWord);

  return (
    <div
      className="relative flex w-full min-w-0 flex-col overflow-x-hidden bg-[#F5F1E6] text-[#0F356E]"
      style={{
        backgroundColor: '#F5F1E6',
        backgroundImage:
          'radial-gradient(#7DAAD3 5px, transparent 5.5px), radial-gradient(#7DAAD3 5px, transparent 5.5px)',
        backgroundSize: '52px 52px',
        backgroundPosition: '0 0, 26px 26px',
      }}
    >
      {/* Inline scoped keyframes for hanging streamers, flame flicker & rising smoke */}
      <style>{`
        @keyframes birthdayStreamerSway {
          0%, 100% { transform: rotate(-2.5deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes birthdayFlameFlicker {
          0%, 100% { transform: scale(1) rotate(-1.5deg); }
          33% { transform: scale(1.04, 0.96) rotate(2deg); }
          66% { transform: scale(0.96, 1.05) rotate(-1deg); }
        }
        @keyframes birthdaySmokeRise {
          0% { opacity: 0; transform: translateY(4px) scale(0.75); }
          25% { opacity: 0.65; }
          100% { opacity: 0; transform: translateY(-22px) scale(1.35); }
        }
        .birthday-streamer-sway {
          animation: birthdayStreamerSway 4.8s ease-in-out infinite;
        }
        .birthday-flame-flicker {
          animation: birthdayFlameFlicker 1.15s ease-in-out infinite;
        }
        .birthday-smoke-rise {
          animation: birthdaySmokeRise 2.1s ease-out infinite;
        }
      `}</style>

      {/* Tactile film/paper grain */}
      <AtmosphericGrainOverlay opacity={0.045} className="z-20" />

      {/* Hanging party streamers */}
      <TinselStreamerCluster side="left" reducedMotion={reducedMotion} />
      <TinselStreamerCluster side="right" reducedMotion={reducedMotion} />

      {/* Quiet Top-Right Replay Control */}
      <div className="relative z-30 flex justify-end px-3 pt-3 sm:px-5 sm:pt-4">
        <button
          type="button"
          onClick={handleReplay}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#0F356E]/25 bg-[#F5F1E6]/95 px-3.5 text-xs font-bold tracking-wide text-[#0F356E] shadow-xs transition hover:bg-white active:scale-95"
          style={langSafe}
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 10a6 6 0 1 1 1.76 4.24" strokeLinecap="round" />
            <path d="M4 14.5V10h4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{replayLabel}</span>
        </button>
      </div>

      {/* HERO SCRAPBOOK SPREAD: Awning-Stripe Postage Frame + Ransom-Note Banner */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-3 pb-6 pt-1 sm:px-6 sm:pt-2">
        <div className="grid grid-cols-1 items-center gap-7 md:grid-cols-12 md:gap-6">
          {/* Left Panel: Powder-Blue Vertical Awning Stripes + Scalloped Stamp Frame */}
          <div
            className="relative flex justify-center rounded-[4px] border border-[#0F356E]/15 px-4 py-7 shadow-[0_6px_18px_rgba(15,53,110,0.1),inset_0_0_0_1px_rgba(255,255,255,0.45)] sm:px-6 sm:py-9 md:col-span-5"
            style={{
              backgroundColor: '#F5F1E6',
              backgroundImage: 'repeating-linear-gradient(90deg, #7DAAD3 0 22px, #F5F1E6 22px 44px)',
            }}
          >
            {/* Scalloped Postage-Stamp Frame */}
            <div className="relative w-full max-w-[232px] sm:max-w-[276px]">
              {/* Scalloped SVG paper border */}
              <svg
                aria-hidden="true"
                viewBox="0 0 260 320"
                preserveAspectRatio="none"
                className="pointer-events-none absolute -inset-3 h-[calc(100%+24px)] w-[calc(100%+24px)]"
                style={{ filter: 'drop-shadow(0 10px 18px rgba(15,53,110,0.22))' }}
              >
                <defs>
                  <mask id={`stamp-mask-${stampId}`}>
                    <rect x="0" y="0" width="260" height="320" fill="white" />
                    {/* Top & bottom circular perforations */}
                    {Array.from({ length: 13 }).map((_, idx) => {
                      const cx = 10 + idx * 20;
                      return (
                        <React.Fragment key={`tb-${idx}`}>
                          <circle cx={cx} cy="0" r="6.2" fill="black" />
                          <circle cx={cx} cy="320" r="6.2" fill="black" />
                        </React.Fragment>
                      );
                    })}
                    {/* Left & right circular perforations */}
                    {Array.from({ length: 16 }).map((_, idx) => {
                      const cy = 10 + idx * 20;
                      return (
                        <React.Fragment key={`lr-${idx}`}>
                          <circle cx="0" cy={cy} r="6.2" fill="black" />
                          <circle cx="260" cy={cy} r="6.2" fill="black" />
                        </React.Fragment>
                      );
                    })}
                  </mask>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="260"
                  height="320"
                  fill="#F5F1E6"
                  mask={`url(#stamp-mask-${stampId})`}
                />
              </svg>

              {/* Twin overlapping dark-navy stars top-left */}
              <svg
                aria-hidden="true"
                viewBox="0 0 76 68"
                className="pointer-events-none absolute -left-4 -top-5 z-20 h-14 w-16 sm:-left-6 sm:-top-6 sm:h-16 sm:w-[72px]"
                style={{ filter: 'drop-shadow(0 3px 5px rgba(15,53,110,0.28))' }}
              >
                <polygon
                  points="32,4 38.5,18.2 54,20.2 42.6,31 45.5,46.4 32,38.8 18.5,46.4 21.4,31 10,20.2 25.5,18.2"
                  fill="#0F356E"
                  stroke="#9AC4E8"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <polygon
                  points="20,26 24.5,35.8 35.2,37.2 27.3,44.6 29.3,55.2 20,50 10.7,55.2 12.7,44.6 4.8,37.2 15.5,35.8"
                  fill="#0F356E"
                  stroke="#9AC4E8"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Tilted newsprint sticker top-right (ZERO personal names) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -top-4 z-20 rotate-[12deg] border border-[#1A1A1A]/35 bg-[#EFEAE0] px-2.5 py-1 shadow-[0_3px_6px_rgba(15,53,110,0.2)] sm:-right-4"
              >
                <span
                  className="block font-heading text-xs font-black tracking-[0.12em] text-[#1A1A1A] sm:text-sm"
                  style={langSafe}
                >
                  {copy.stickerLabel}
                </span>
              </div>

              {/* Adaptive Photo Slot or Bespoke Cupcake Illustration */}
              <div className="relative z-10 p-1.5">
                {visiblePhotos.length >= 1 ? (
                  <button
                    type="button"
                    onClick={() => onOpenPhoto?.(visiblePhotos[0].originalIdx)}
                    className="group relative block min-h-[44px] w-full -rotate-2 text-left transition-transform duration-200 hover:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1557B0] active:scale-[0.99]"
                    aria-label={copy.tapPhotoHint}
                  >
                    {/* Translucent top masking tape */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-2.5 left-1/2 z-20 h-5 w-20 -translate-x-1/2 rotate-1 border border-[#D8CBAF]/70 bg-[#F4E7C8]/85 shadow-2xs"
                    />
                    <div className="aspect-[4/5] w-full overflow-hidden rounded-[2px] border border-[#0F356E]/15 bg-[#EAE0CE] shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={visiblePhotos[0].url}
                        alt={receiverName}
                        onError={() =>
                          setFailedUrls((prev) => ({ ...prev, [visiblePhotos[0].url]: true }))
                        }
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span
                      className="mt-1.5 block pl-0.5 font-handwritten text-base font-bold text-[#1557B0] opacity-90 transition group-hover:opacity-100"
                      style={langSafe}
                    >
                      {copy.tapPhotoHint}
                    </span>
                  </button>
                ) : (
                  <div className="-rotate-1">
                    <SpecialDeliveryCupcakeSvg label={copy.stampSub} />
                  </div>
                )}
              </div>

              {/* Interactive Vintage Cobalt Blue Retro Camera overlapping bottom-right */}
              <button
                type="button"
                onClick={handleCameraTap}
                aria-label={visiblePhotos.length >= 1 ? copy.tapPhotoHint : copy.stampSub}
                className="group absolute -bottom-5 -right-2 z-30 min-h-[44px] min-w-[44px] -rotate-12 rounded-xl p-1 transition-transform duration-200 hover:-rotate-6 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1557B0] active:scale-95 sm:-bottom-6 sm:-right-4"
              >
                <div className="relative">
                  <RetroCobaltCameraSvg flashing={cameraFlash} />
                  {/* 140ms white lens flash ring */}
                  {cameraFlash ? (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-white/80 shadow-[0_0_26px_8px_rgba(255,255,255,0.95)]"
                    />
                  ) : null}
                </div>
              </button>
            </div>
          </div>

          {/* Right Panel: Ransom-Note Cutout HAPPY BIRTHDAY Banner + Masking-Tape Name */}
          <div className="flex min-w-0 flex-col items-center justify-center px-1 pt-2 text-center md:col-span-7">
            {/* Line 1: Stars + HAPPY */}
            <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <TangerineStarSticker rotateDeg={-12} />
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
                {happyChars.map((ch, idx) => {
                  const styleSpec = HAPPY_CUTOUTS[idx % HAPPY_CUTOUTS.length];
                  return (
                    <span
                      key={`h-${idx}`}
                      className={`inline-flex h-10 min-w-[2.1rem] items-center justify-center border-[2.5px] border-white text-2xl leading-none shadow-[0_2px_0_rgba(15,53,110,0.28),0_5px_12px_rgba(15,53,110,0.16)] sm:h-12 sm:min-w-[2.7rem] sm:text-3xl ${styleSpec.fontClass} ${styleSpec.padClass}`}
                      style={{
                        backgroundColor: styleSpec.bg,
                        color: styleSpec.color,
                        transform: `rotate(${styleSpec.rotate}deg)`,
                      }}
                    >
                      {ch}
                    </span>
                  );
                })}
              </div>
              <TangerineStarSticker rotateDeg={14} />
            </div>

            {/* Line 2: BIRTHDAY ransom cutouts */}
            <div className="mt-2 flex max-w-full flex-wrap items-center justify-center gap-1 sm:mt-2.5 sm:gap-1.5">
              {birthdayChars.map((ch, idx) => {
                const styleSpec = BIRTHDAY_CUTOUTS[idx % BIRTHDAY_CUTOUTS.length];
                const displayChar =
                  styleSpec.forceCase === 'lower'
                    ? ch.toLowerCase()
                    : styleSpec.forceCase === 'upper'
                      ? ch.toUpperCase()
                      : ch;
                return (
                  <span
                    key={`b-${idx}`}
                    className={`inline-flex h-8 min-w-[1.6rem] items-center justify-center border-[2.5px] border-white text-[19px] leading-none shadow-[0_2px_0_rgba(15,53,110,0.28),0_5px_12px_rgba(15,53,110,0.16)] xs:h-9 xs:min-w-[1.8rem] xs:text-xl sm:h-12 sm:min-w-[2.45rem] sm:text-3xl ${styleSpec.fontClass} ${styleSpec.padClass}`}
                    style={{
                      backgroundColor: styleSpec.bg,
                      color: styleSpec.color,
                      transform: `rotate(${styleSpec.rotate}deg)`,
                    }}
                  >
                    {displayChar}
                  </span>
                );
              })}
            </div>

            {/* Recipient Name on Cream Masking-Tape Strip */}
            <div className="mt-6 max-w-full">
              <div
                className="relative inline-block max-w-full -rotate-1 border border-[#DFD2B5] bg-[#F7EED7]/95 px-6 py-2 shadow-[0_4px_12px_rgba(15,53,110,0.12)]"
                style={{
                  clipPath:
                    'polygon(2% 0%, 98% 2%, 100% 24%, 98% 52%, 100% 80%, 97% 100%, 3% 98%, 0% 74%, 2% 45%, 0% 18%)',
                }}
              >
                <span
                  className="block break-words font-handwritten text-2xl font-bold text-[#0F356E] sm:text-3xl"
                  style={hiSafeStyle(language)}
                >
                  {receiverName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE CANDLE BLOW STAGE */}
      <section className="relative z-10 mx-auto w-full max-w-3xl px-3 pb-8 pt-4 sm:px-6 sm:pt-6">
        {/* Canvas 2D Confetti Burst Overlay */}
        <canvas
          ref={confettiCanvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 h-full w-full"
        />

        {/* Handwritten Brush Cue + Subtle Starburst Doodle */}
        <div className="relative mb-2 flex items-center justify-center gap-2 text-center">
          <h2
            className="min-w-0 break-words font-handwritten text-3xl font-bold text-[#1A1A1A] sm:text-4xl"
            style={hiSafeStyle(language)}
          >
            {copy.candlesCue}
          </h2>
          <svg aria-hidden="true" viewBox="0 0 44 44" className="h-8 w-8 shrink-0 text-[#0F356E]/65">
            <line x1="22" y1="3" x2="22" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="22" y1="30" x2="22" y2="41" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="3" y1="22" x2="14" y2="22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="30" y1="22" x2="41" y2="22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="8" y1="8" x2="16" y2="16" stroke="#7DAAD3" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="28" y1="28" x2="36" y2="36" stroke="#7DAAD3" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="36" y1="8" x2="28" y2="16" stroke="#F59E2D" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="16" y1="28" x2="8" y2="36" stroke="#F59E2D" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>

        {/* Interactive Frosted Buttercream Cake Stage */}
        <div className="relative mx-auto w-full max-w-[380px]">
          <svg
            aria-hidden="true"
            viewBox="0 0 360 280"
            className="h-auto w-full select-none drop-shadow-[0_12px_20px_rgba(15,53,110,0.14)]"
          >
            {/* Ceramic Cake Stand */}
            <ellipse cx="180" cy="259" rx="74" ry="11" fill="#91715A" />
            <path d="M158 228 L202 228 L210 258 L150 258 Z" fill="#A88870" />
            <ellipse cx="180" cy="228" rx="128" ry="16" fill="#A88870" />
            <ellipse cx="180" cy="224" rx="124" ry="13" fill="#BFA189" />

            {/* Lower Cake Tier */}
            <path
              d="M68 170 L292 170 L292 220 C292 228 242 234 180 234 C118 234 68 228 68 220 Z"
              fill="#F4ECE0"
              stroke="#DFD2BE"
              strokeWidth="1.5"
            />
            {/* Lower Tier Undulating Icing Drips */}
            <path
              d="M67 170 C67 162 293 162 293 170 L293 190 C286 196 278 192 274 184 C269 198 258 202 252 187 C245 196 234 195 229 183 C222 204 208 205 202 186 C194 197 182 197 176 184 C169 201 154 203 148 186 C140 195 129 193 124 183 C117 201 102 200 96 185 C89 194 76 195 67 188 Z"
              fill="#FDFBF7"
              stroke="#EAE0D0"
              strokeWidth="1.2"
            />

            {/* Upper Cake Tier */}
            <path
              d="M84 124 L276 124 L276 168 C276 174 233 179 180 179 C127 179 84 174 84 168 Z"
              fill="#F4ECE0"
              stroke="#DFD2BE"
              strokeWidth="1.5"
            />
            {/* Upper Tier Top & Icing Drips */}
            <ellipse cx="180" cy="124" rx="97" ry="14" fill="#FDFBF7" stroke="#EAE0D0" strokeWidth="1.2" />
            <path
              d="M83 124 L277 124 L277 146 C270 155 258 153 254 140 C246 158 234 159 228 142 C221 152 211 150 206 139 C199 161 184 162 178 141 C171 153 159 152 153 140 C145 159 131 158 125 141 C117 151 106 151 100 139 C93 149 87 149 83 144 Z"
              fill="#FDFBF7"
              stroke="#EAE0D0"
              strokeWidth="1.2"
            />

            {/* 35+ Rainbow Jimmies / Sprinkles */}
            {CAKE_SPRINKLES.map((sp, i) => (
              <rect
                key={`sp-${i}`}
                x={sp.x}
                y={sp.y}
                width="5.5"
                height="2.2"
                rx="1.1"
                fill={sp.color}
                transform={`rotate(${sp.angle} ${sp.x + 2.75} ${sp.y + 1.1})`}
              />
            ))}

            {/* 7 Slender Striped/Pastel Candles + Flames + Smoke */}
            {CANDLE_SPECS.map((c, idx) => {
              const isLit = litCandles[idx];
              const flameBaseY = c.topY - 6;
              const skewDeg = (windStrength * 32).toFixed(1);
              const scaleY = (1 - windStrength * 0.45).toFixed(2);
              return (
                <g key={`candle-${idx}`}>
                  {/* Candle wax stick */}
                  <rect
                    x={c.x - 4.5}
                    y={c.topY}
                    width="9"
                    height={c.height}
                    rx="3"
                    fill={c.fill}
                    stroke="#0F356E"
                    strokeWidth="1.2"
                  />
                  {c.stripeColor ? (
                    <g stroke={c.stripeColor} strokeWidth="2.2">
                      <line x1={c.x - 3.5} y1={c.topY + 11} x2={c.x + 3.5} y2={c.topY + 7} />
                      <line x1={c.x - 3.5} y1={c.topY + 23} x2={c.x + 3.5} y2={c.topY + 19} />
                      <line x1={c.x - 3.5} y1={c.topY + 35} x2={c.x + 3.5} y2={c.topY + 31} />
                    </g>
                  ) : null}

                  {/* Wick */}
                  <line
                    x1={c.x}
                    y1={c.topY}
                    x2={c.x}
                    y2={flameBaseY}
                    stroke="#2B1B2E"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />

                  {isLit ? (
                    <g
                      style={{
                        transformBox: 'fill-box',
                        transformOrigin: 'bottom center',
                        transform: `skewX(${skewDeg}deg) scaleY(${scaleY})`,
                      }}
                    >
                      <g
                        className={reducedMotion ? '' : 'birthday-flame-flicker motion-reduce:animate-none'}
                        style={{
                          transformBox: 'fill-box',
                          transformOrigin: 'bottom center',
                          animationDelay: `${idx * 0.14}s`,
                        }}
                      >
                        {/* Warm glow */}
                        <ellipse
                          cx={c.x}
                          cy={flameBaseY - 10}
                          rx="11"
                          ry="14"
                          fill="#F59E2D"
                          opacity="0.24"
                        />
                        {/* Outer flame teardrop */}
                        <path
                          d={`M${c.x} ${flameBaseY - 22} C${c.x + 7} ${flameBaseY - 13} ${c.x + 6} ${flameBaseY - 3} ${c.x} ${flameBaseY} C${c.x - 6} ${flameBaseY - 3} ${c.x - 7} ${flameBaseY - 13} ${c.x} ${flameBaseY - 22} Z`}
                          fill="#F59E2D"
                        />
                        {/* Inner bright flame core */}
                        <path
                          d={`M${c.x} ${flameBaseY - 15} C${c.x + 3.5} ${flameBaseY - 9} ${c.x + 3} ${flameBaseY - 3} ${c.x} ${flameBaseY - 1} C${c.x - 3} ${flameBaseY - 3} ${c.x - 3.5} ${flameBaseY - 9} ${c.x} ${flameBaseY - 15} Z`}
                          fill="#FFFBEB"
                        />
                      </g>
                    </g>
                  ) : (
                    /* Rising smoke wisp after candle extinguishes */
                    <g
                      className={reducedMotion ? 'opacity-50' : 'birthday-smoke-rise motion-reduce:animate-none'}
                      style={{ animationDelay: `${idx * 0.12}s` }}
                    >
                      <path
                        d={`M${c.x} ${flameBaseY - 2} C${c.x - 4} ${flameBaseY - 10} ${c.x + 5} ${flameBaseY - 18} ${c.x - 1} ${flameBaseY - 28}`}
                        fill="none"
                        stroke="#7D8A99"
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.7"
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* 44px+ Accessible Invisible Hit Targets Over Each Candle Flame */}
          {CANDLE_SPECS.map((c, idx) => {
            const isLit = litCandles[idx];
            const leftPct = (c.x / 360) * 100;
            const topPct = ((c.topY - 34) / 280) * 100;
            return (
              <button
                key={`candle-btn-${idx}`}
                type="button"
                disabled={!isLit}
                onClick={() => extinguishCandle(idx)}
                aria-label={`${copy.candlesCue} (${idx + 1}/${CANDLE_COUNT})`}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  transform: 'translateX(-50%)',
                }}
                className={`absolute z-20 min-h-[48px] min-w-[44px] rounded-full focus-visible:outline-2 focus-visible:outline-[#1557B0] ${
                  isLit ? 'cursor-pointer' : 'pointer-events-none'
                }`}
              />
            );
          })}
        </div>

        {/* Candle Interaction Controls & Wish Stamp */}
        <div className="mt-3 flex flex-col items-center justify-center gap-2.5 text-center">
          {!allOut ? (
            <>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={handleStartMic}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-xs font-bold tracking-wide transition active:scale-95 sm:text-sm ${
                    micState === 'listening'
                      ? 'border-[#1557B0] bg-[#1557B0] text-white shadow-sm'
                      : 'border-[#0F356E]/30 bg-[#F5F1E6] text-[#0F356E] hover:bg-white'
                  }`}
                  style={langSafe}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 10a7 7 0 0 0 14 0" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                  </svg>
                  <span>
                    {micState === 'listening'
                      ? copy.micListening
                      : micState === 'denied'
                        ? copy.micDenied
                        : copy.micIdle}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => blowRemainingSequential(65)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#0F356E]/25 bg-[#9AC4E8]/45 px-4 text-xs font-bold tracking-wide text-[#0F356E] transition hover:bg-[#9AC4E8]/70 active:scale-95 sm:text-sm"
                  style={langSafe}
                >
                  <span>{copy.blowAllBtn}</span>
                </button>
              </div>

              {micState === 'listening' ? (
                <div className="flex items-center gap-2" aria-hidden="true">
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[#0F356E]/15">
                    <div
                      className="h-full rounded-full bg-[#1557B0] transition-[width] duration-75"
                      style={{ width: `${Math.round(windStrength * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p
                  className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0F356E]/70"
                  style={langSafe}
                >
                  {copy.tapCandlesHint}
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <div className="-rotate-2 rounded-[3px] border-2 border-dashed border-[#1557B0] bg-[#FAF6EC]/95 px-5 py-1.5 shadow-xs">
                <span
                  className="block font-handwritten text-2xl font-bold text-[#1557B0] sm:text-3xl"
                  style={langSafe}
                >
                  {copy.wishMadeStamp}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRelight}
                className="inline-flex min-h-[44px] items-center rounded-full border border-[#0F356E]/25 bg-[#F5F1E6] px-4 text-xs font-bold tracking-wide text-[#0F356E] transition hover:bg-white active:scale-95"
                style={langSafe}
              >
                {copy.relightBtn}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* MINIMAL HANDWRITTEN NOTE + ADAPTIVE EXTRA POLAROIDS */}
      <section className="relative z-10 mx-auto w-full max-w-4xl px-3 pb-16 pt-2 sm:px-6 sm:pb-20">
        {/* Taped Cream Cotton Paper Note Card */}
        <div className="relative mx-auto max-w-xl -rotate-1 rounded-[4px] border border-[#E2D6BE] bg-[#FBF7EE] px-5 pb-6 pt-7 shadow-[0_10px_24px_-8px_rgba(15,53,110,0.2)] sm:px-8 sm:pb-7 sm:pt-8">
          {/* Masking tape corners */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-3 -top-2.5 h-5 w-16 -rotate-12 border border-[#DACBA8]/70 bg-[#F3E5C5]/85 shadow-2xs"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-3 -top-2.5 h-5 w-16 rotate-12 border border-[#DACBA8]/70 bg-[#F3E5C5]/85 shadow-2xs"
          />

          <p
            className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#1557B0]"
            style={langSafe}
          >
            {copy.noteLabel}
          </p>

          <p
            className={`mt-3 min-w-0 break-words text-[#1A1A1A] ${
              isLongNote
                ? 'font-literary text-base leading-relaxed sm:text-lg'
                : 'font-handwritten text-xl leading-relaxed sm:text-2xl'
            }`}
            style={langSafe}
          >
            {messageText}
          </p>

          <p
            className="mt-4 min-w-0 break-words text-right font-handwritten text-xl font-bold text-[#0F356E] sm:text-2xl"
            style={langSafe}
          >
            {copy.signedPrefix} {senderName}
          </p>
        </div>

        {/* Adaptive Extra Polaroids (2/3/4 photos) */}
        {visiblePhotos.length > 1 ? (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            {visiblePhotos.slice(1).map((item, extraIdx) => {
              const rotations = ['-rotate-3', 'rotate-2', '-rotate-1'];
              const tiltClass = rotations[extraIdx % rotations.length];
              return (
                <button
                  key={`polaroid-${item.originalIdx}-${item.url}`}
                  type="button"
                  onClick={() => onOpenPhoto?.(item.originalIdx)}
                  aria-label={`${copy.tapPhotoHint} ${item.originalIdx + 1}`}
                  className={`group relative min-h-[44px] w-[165px] max-w-full bg-[#FDFBF7] p-2.5 pb-7 shadow-[0_10px_22px_-6px_rgba(15,53,110,0.24)] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1557B0] active:scale-95 sm:w-[190px] ${tiltClass}`}
                >
                  {/* Diagonal masking tape */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-2.5 left-1/2 z-10 h-5 w-16 -translate-x-1/2 -rotate-2 border border-[#DACBA8]/70 bg-[#F3E5C5]/85 shadow-2xs"
                  />
                  <div className="aspect-[4/5] w-full overflow-hidden rounded-[1px] bg-[#E8DFCE]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={`${receiverName} ${item.originalIdx + 1}`}
                      onError={() =>
                        setFailedUrls((prev) => ({ ...prev, [item.url]: true }))
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="mt-2 block text-center font-mono text-[10px] font-bold uppercase tracking-wider text-[#1557B0]/80">
                    0{item.originalIdx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      {/* Bottom-Right Jagged Torn Blue-Gingham Paper Patch */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 z-0 h-28 w-44 sm:h-36 sm:w-64"
        style={{ filter: 'drop-shadow(-3px -3px 6px rgba(15,53,110,0.16))' }}
      >
        <div
          className="h-full w-full"
          style={{
            clipPath:
              'polygon(10% 34%, 22% 16%, 35% 26%, 48% 8%, 62% 19%, 76% 4%, 90% 14%, 100% 6%, 100% 100%, 0% 100%, 4% 78%, 1% 56%)',
            backgroundColor: '#F5F1E6',
            backgroundImage:
              'linear-gradient(90deg, rgba(125, 170, 211, 0.45) 50%, transparent 50%), linear-gradient(rgba(125, 170, 211, 0.45) 50%, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />
      </div>
    </div>
  );
}
