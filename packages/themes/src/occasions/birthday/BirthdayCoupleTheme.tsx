'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  AtmosphericGrainOverlay,
  playLanternPullChime,
  playPaperUnsealSfx,
} from '../shared/OccasionCraftPrimitives';
import {
  BIRTHDAY_THEMES_COPY,
  type BirthdayThemeComponentProps,
  getValidPhotos,
  hiSafeStyle,
  useBirthdayReducedMotion,
} from './birthdayTypes';

type SceneStage = 'desk' | 'bow' | 'poster' | 'binder';
type BinderPage = 0 | 1 | 2;

const BOW_ORIGIN = { x: 120, y: 344 };
const HEART_TARGET = { x: 206, y: 138 };
const BOW_ANGLE_DEG =
  (Math.atan2(HEART_TARGET.y - BOW_ORIGIN.y, HEART_TARGET.x - BOW_ORIGIN.x) * 180) / Math.PI;
const MAX_PULL_PX = 76;

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Happy Birthday Couple Edition:
 * Velvet Crimson Desk -> Interactive Bow & Arrow -> Golden Sunbeam Poster -> 3-Ring Binder Flipbook & 35mm Filmstrip.
 */
export function BirthdayCoupleTheme({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
  onOpenPhoto,
}: BirthdayThemeComponentProps) {
  const uid = useId().replace(/:/g, '');
  const reducedMotion = useBirthdayReducedMotion();
  const coreLang = toCoreLanguageCode(language);
  const copy = BIRTHDAY_THEMES_COPY[coreLang].couple;
  const replayLabel = BIRTHDAY_THEMES_COPY[coreLang].replay;
  const langSafe = hiSafeStyle(language);

  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const rawValidPhotos = useMemo(() => getValidPhotos(data.photos), [data.photos]);
  const visiblePhotos = useMemo(
    () =>
      rawValidPhotos
        .map((url, originalIdx) => ({ url, originalIdx }))
        .filter((item) => !failedUrls[item.url]),
    [rawValidPhotos, failedUrls],
  );

  const [scene, setScene] = useState<SceneStage>('desk');
  const [envelopeOpening, setEnvelopeOpening] = useState(false);

  // Scene 2: Bow & Arrow state
  const [pullPx, setPullPx] = useState(0);
  const [isDraggingBow, setIsDraggingBow] = useState(false);
  const [arrowPhase, setArrowPhase] = useState<'ready' | 'drawing' | 'flying' | 'hit'>('ready');
  const [flightProgress, setFlightProgress] = useState(0);

  // Scene 3: 3-ring binder flipbook state
  const [activePage, setActivePage] = useState<BinderPage>(0);
  const [turnDir, setTurnDir] = useState<'next' | 'prev'>('next');

  const stageSvgRef = useRef<SVGSVGElement | null>(null);
  const sparkCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const pullPxRef = useRef(0);
  const arrowPhaseRef = useRef<'ready' | 'drawing' | 'flying' | 'hit'>('ready');
  const timersRef = useRef<number[]>([]);
  const rafIdsRef = useRef<number[]>([]);
  const bowRunIdRef = useRef(0);
  const openedNotifiedRef = useRef(false);

  arrowPhaseRef.current = arrowPhase;

  const clearAsyncWork = useCallback(() => {
    bowRunIdRef.current += 1;
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
    for (const id of rafIdsRef.current) {
      window.cancelAnimationFrame(id);
    }
    rafIdsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearAsyncWork();
    };
  }, [clearAsyncWork]);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const handlePhotoError = useCallback((url: string) => {
    setFailedUrls((prev) => ({ ...prev, [url]: true }));
  }, []);

  const handleOpenDesk = useCallback(() => {
    if (envelopeOpening || scene !== 'desk') return;
    setEnvelopeOpening(true);
    playPaperUnsealSfx(1);
    if (!openedNotifiedRef.current) {
      openedNotifiedRef.current = true;
      onOpened?.();
    }
    if (reducedMotion) {
      setScene('bow');
      return;
    }
    scheduleTimeout(() => {
      setScene('bow');
    }, 380);
  }, [envelopeOpening, onOpened, reducedMotion, scene, scheduleTimeout]);

  const triggerGoldSparkRing = useCallback(() => {
    const canvas = sparkCanvasRef.current;
    if (!canvas || reducedMotion) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Map SVG target (206, 138) inside 400x460 viewBox to canvas CSS pixels
    const cx = (HEART_TARGET.x / 400) * rect.width;
    const cy = (HEART_TARGET.y / 460) * rect.height;

    const colors = ['#FFF4C7', '#E5C158', '#FFD166', '#FF9EAA', '#FAF5EC'];
    const particles: SparkParticle[] = Array.from({ length: 30 }, (_, idx) => {
      const angle = (idx / 30) * Math.PI * 2 + (Math.random() - 0.5) * 0.18;
      const speed = 1.9 + Math.random() * 2.6;
      return {
        x: cx + Math.cos(angle) * 8,
        y: cy + Math.sin(angle) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.8 + Math.random() * 2.5,
        alpha: 1,
        decay: 0.018 + Math.random() * 0.014,
        color: colors[idx % colors.length],
      };
    });

    const runId = bowRunIdRef.current;
    let ringRadius = 10;
    let ringAlpha = 0.92;

    const step = () => {
      if (bowRunIdRef.current !== runId) {
        ctx.clearRect(0, 0, rect.width, rect.height);
        return;
      }
      ctx.clearRect(0, 0, rect.width, rect.height);
      if (ringAlpha > 0.02) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(229, 193, 88, ${ringAlpha.toFixed(3)})`;
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.restore();
        ringRadius += 2.8;
        ringAlpha *= 0.91;
      }

      let alive = ringAlpha > 0.03;
      for (const p of particles) {
        if (p.alpha <= 0.02) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (alive) {
        const id = window.requestAnimationFrame(step);
        rafIdsRef.current.push(id);
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height);
      }
    };

    const id = window.requestAnimationFrame(step);
    rafIdsRef.current.push(id);
  }, [reducedMotion]);

  const fireArrowFromPull = useCallback(
    (startPull: number) => {
      const phase = arrowPhaseRef.current;
      if (phase === 'flying' || phase === 'hit') return;
      if (reducedMotion) {
        pullPxRef.current = 0;
        arrowPhaseRef.current = 'hit';
        setPullPx(0);
        setFlightProgress(1);
        setArrowPhase('hit');
        playLanternPullChime();
        scheduleTimeout(() => {
          setScene('poster');
        }, 280);
        return;
      }

      arrowPhaseRef.current = 'flying';
      setArrowPhase('flying');
      const runId = bowRunIdRef.current;
      const durationMs = 280;
      const startTime = performance.now();

      const animateFlight = (now: number) => {
        if (bowRunIdRef.current !== runId) return;
        const elapsed = now - startTime;
        const t = clamp(elapsed / durationMs, 0, 1);
        const eased = 1 - Math.pow(1 - t, 2.2);
        const nextPull = lerp(startPull, 0, clamp(t * 2.6, 0, 1));
        pullPxRef.current = nextPull;
        setPullPx(nextPull);
        setFlightProgress(eased);

        if (t < 1) {
          const id = window.requestAnimationFrame(animateFlight);
          rafIdsRef.current.push(id);
        } else {
          pullPxRef.current = 0;
          arrowPhaseRef.current = 'hit';
          setPullPx(0);
          setFlightProgress(1);
          setArrowPhase('hit');
          playLanternPullChime();
          triggerGoldSparkRing();
          scheduleTimeout(() => {
            if (bowRunIdRef.current === runId) {
              setScene('poster');
            }
          }, 760);
        }
      };

      const id = window.requestAnimationFrame(animateFlight);
      rafIdsRef.current.push(id);
    },
    [reducedMotion, scheduleTimeout, triggerGoldSparkRing],
  );

  const handleAutoDrawAndShoot = useCallback(() => {
    if (arrowPhaseRef.current !== 'ready') return;
    if (reducedMotion) {
      fireArrowFromPull(0);
      return;
    }

    arrowPhaseRef.current = 'drawing';
    setArrowPhase('drawing');
    const runId = bowRunIdRef.current;
    const drawMs = 230;
    const startTime = performance.now();

    const animateDraw = (now: number) => {
      if (bowRunIdRef.current !== runId) return;
      const t = clamp((now - startTime) / drawMs, 0, 1);
      const currentPull = 58 * (1 - Math.pow(1 - t, 2));
      pullPxRef.current = currentPull;
      setPullPx(currentPull);
      if (t < 1) {
        const id = window.requestAnimationFrame(animateDraw);
        rafIdsRef.current.push(id);
      } else {
        fireArrowFromPull(58);
      }
    };

    const id = window.requestAnimationFrame(animateDraw);
    rafIdsRef.current.push(id);
  }, [fireArrowFromPull, reducedMotion]);

  const handleBowPointerDown = useCallback(
    (e: React.PointerEvent<SVGGElement>) => {
      if (arrowPhaseRef.current !== 'ready') return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      setIsDraggingBow(true);
    },
    [],
  );

  const handleBowPointerMove = useCallback(
    (e: React.PointerEvent<SVGGElement>) => {
      if (!isDraggingBow || !dragStartRef.current || arrowPhaseRef.current !== 'ready') return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      // Reward pulling downward or back-left along the bow draw vector
      const projected = dy * 0.9 - dx * 0.35;
      const rawDist = Math.max(dy, projected);
      const clamped = clamp(rawDist, 0, MAX_PULL_PX);
      pullPxRef.current = clamped;
      setPullPx(clamped);
    },
    [isDraggingBow],
  );

  const handleBowPointerEnd = useCallback(
    (e: React.PointerEvent<SVGGElement>) => {
      if (!isDraggingBow) return;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      setIsDraggingBow(false);
      dragStartRef.current = null;

      if (arrowPhaseRef.current !== 'ready') return;
      const currentPull = pullPxRef.current;
      if (currentPull >= 16) {
        fireArrowFromPull(currentPull);
      } else {
        pullPxRef.current = 0;
        setPullPx(0);
        handleAutoDrawAndShoot();
      }
    },
    [fireArrowFromPull, handleAutoDrawAndShoot, isDraggingBow],
  );

  const handleSelectPage = useCallback(
    (nextPage: BinderPage) => {
      if (nextPage === activePage) return;
      setTurnDir(nextPage > activePage ? 'next' : 'prev');
      setActivePage(nextPage);
      playPaperUnsealSfx(nextPage);
    },
    [activePage],
  );

  const handleSwipeStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    swipeStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleSwipeEnd = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!swipeStartRef.current) return;
      const dx = e.clientX - swipeStartRef.current.x;
      const dy = e.clientY - swipeStartRef.current.y;
      swipeStartRef.current = null;
      if (Math.abs(dx) < 46 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
      if (dx < 0 && activePage < 2) {
        handleSelectPage((activePage + 1) as BinderPage);
      } else if (dx > 0 && activePage > 0) {
        handleSelectPage((activePage - 1) as BinderPage);
      }
    },
    [activePage, handleSelectPage],
  );

  const handleReplay = useCallback(() => {
    clearAsyncWork();
    pullPxRef.current = 0;
    arrowPhaseRef.current = 'ready';
    setEnvelopeOpening(false);
    setPullPx(0);
    setIsDraggingBow(false);
    setArrowPhase('ready');
    setFlightProgress(0);
    setActivePage(0);
    setTurnDir('next');
    setScene('desk');
  }, [clearAsyncWork]);

  const pullRatio = clamp(pullPx / MAX_PULL_PX, 0, 1);
  const receiverName = data.receiverName?.trim() || 'You';
  const senderName = data.senderName?.trim() || 'Yours';
  const localizedMessage = pickLocalizedText(data.message, language);

  // Bow & arrow SVG local geometry calculations
  const limbFlex = pullRatio * 9;
  const stringApexX = -10 - pullRatio * 28;
  const arrowLocalStartX = stringApexX + 6;
  const distToHeart = Math.hypot(
    HEART_TARGET.x - BOW_ORIGIN.x,
    HEART_TARGET.y - BOW_ORIGIN.y,
  );
  const arrowCurrentX =
    arrowPhase === 'flying' || arrowPhase === 'hit'
      ? lerp(arrowLocalStartX, distToHeart - 52, flightProgress)
      : arrowLocalStartX;

  const heartScale =
    arrowPhase === 'hit'
      ? 1.09
      : 1 + pullRatio * 0.13;

  return (
    <section
      data-theme-id={manifest.id}
      data-watermarked={watermarked ? 'true' : 'false'}
      aria-label={copy.envelopeScript}
      className="relative flex min-h-[560px] sm:min-h-[620px] w-full min-w-0 flex-1 flex-col overflow-x-hidden select-none text-[#FAF5EC]"
      style={{
        background:
          'radial-gradient(circle at 50% 42%, #B51D24 0%, #9E171D 58%, #6D0E13 100%)',
      }}
    >
      <style>{`
        @keyframes bcFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes bcSunbeamSpin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.06); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes bcPageTurnNext {
          0% { opacity: 0.25; transform: rotateY(-12deg) translateX(14px); }
          100% { opacity: 1; transform: rotateY(0deg) translateX(0px); }
        }
        @keyframes bcPageTurnPrev {
          0% { opacity: 0.25; transform: rotateY(12deg) translateX(-14px); }
          100% { opacity: 1; transform: rotateY(0deg) translateX(0px); }
        }
        .bc-float { animation: bcFloat 3.2s ease-in-out infinite; }
        .bc-sunbeam-spin { animation: bcSunbeamSpin 24s linear infinite; }
        .bc-page-next { animation: bcPageTurnNext 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .bc-page-prev { animation: bcPageTurnPrev 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .bc-float, .bc-sunbeam-spin, .bc-page-next, .bc-page-prev {
            animation: none !important;
          }
        }
      `}</style>

      <AtmosphericGrainOverlay opacity={0.05} />

      {/* Top-right subtle Replay pill */}
      {scene !== 'desk' ? (
        <div className="pointer-events-none absolute right-3 top-3 z-30 flex justify-end">
          <button
            type="button"
            onClick={handleReplay}
            className="pointer-events-auto inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#FAF5EC]/25 bg-[#5E0B10]/90 px-3.5 text-xs font-semibold tracking-wide text-[#FAF5EC] shadow-sm transition hover:bg-[#5E0B10] active:scale-95"
            style={langSafe}
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5"
              />
            </svg>
            <span>{replayLabel}</span>
          </button>
        </div>
      ) : null}

      {/* =====================================================================
          SCENE 1 (desk): Open Cream Envelope + White Camera + Rose Bouquet
      ====================================================================== */}
      {scene === 'desk' ? (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8">
          <button
            type="button"
            onClick={handleOpenDesk}
            aria-label={`${copy.envelopeScript} — ${copy.clickMe}`}
            className="group relative flex min-h-[44px] w-full max-w-[420px] flex-col items-center justify-center rounded-2xl p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF5EC]/80"
          >
            {/* Physical collage SVG directly on crimson */}
            <div className="relative w-full max-w-[360px] sm:max-w-[420px] transition-transform duration-300 group-hover:scale-[1.015] group-active:scale-[0.985]">
              <svg
                viewBox="0 0 420 275"
                className="h-auto w-full overflow-visible drop-shadow-[0_22px_26px_rgba(45,4,8,0.48)]"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id={`envBody-${uid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5EFE4" />
                    <stop offset="100%" stopColor="#E6DCCB" />
                  </linearGradient>
                  <linearGradient id={`envInside-${uid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D7CCB8" />
                    <stop offset="100%" stopColor="#C9BCA5" />
                  </linearGradient>
                  <linearGradient id={`camBody-${uid}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="65%" stopColor="#F3EFE9" />
                    <stop offset="100%" stopColor="#DED8CE" />
                  </linearGradient>
                  <linearGradient id={`chromeRing-${uid}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="35%" stopColor="#D4D4D8" />
                    <stop offset="70%" stopColor="#8E929B" />
                    <stop offset="100%" stopColor="#F4F4F5" />
                  </linearGradient>
                  <linearGradient id={`wrapIvory-${uid}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FAF5EC" />
                    <stop offset="100%" stopColor="#E4D9C5" />
                  </linearGradient>
                  <linearGradient id={`satinRed-${uid}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#E63946" />
                    <stop offset="50%" stopColor="#B91C1C" />
                    <stop offset="100%" stopColor="#7A0E13" />
                  </linearGradient>
                </defs>

                {/* 1. Open Cream Envelope (Center) */}
                <g transform="translate(102, 24)">
                  {/* Open Top Flap */}
                  <path
                    d="M 8 88 L 108 8 L 208 88 Z"
                    fill="#F5EFE4"
                    stroke="#D4C7B2"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                  {/* Envelope Interior */}
                  <rect x="8" y="88" width="200" height="128" rx="4" fill={`url(#envInside-${uid})`} />

                  {/* Peek-out Cream Note Card */}
                  <g
                    style={{
                      transform: envelopeOpening ? 'translateY(-18px)' : 'translateY(0px)',
                      transition: 'transform 360ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    <rect
                      x="24"
                      y="38"
                      width="168"
                      height="112"
                      rx="3"
                      fill="#FCF9F2"
                      stroke="#E2D8C7"
                      strokeWidth="1"
                    />
                    {/* Note lines subtle */}
                    <line x1="42" y1="126" x2="174" y2="126" stroke="#EADFD0" strokeWidth="1" />
                    <text
                      x="108"
                      y="82"
                      textAnchor="middle"
                      fill="#7A0E13"
                      fontSize="20"
                      className="font-handwritten"
                      style={langSafe}
                    >
                      {copy.envelopeScript}
                    </text>
                  </g>

                  {/* Envelope Front Pocket & Side Flaps */}
                  <path
                    d="M 8 88 L 108 156 L 8 216 Z"
                    fill="#EFE7D8"
                    stroke="#D8CCBA"
                    strokeWidth="0.8"
                  />
                  <path
                    d="M 208 88 L 108 156 L 208 216 Z"
                    fill="#EAE0CE"
                    stroke="#D8CCBA"
                    strokeWidth="0.8"
                  />
                  <path
                    d="M 8 216 L 108 144 L 208 216 Z"
                    fill={`url(#envBody-${uid})`}
                    stroke="#D8CCBA"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />

                  {/* Tiny Red Heart Stickers Bottom-Right */}
                  <g transform="translate(166, 166)">
                    <path
                      d="M 10 4 C 10 1 6 0 4 2.5 C 2 0 -2 1 -2 4 C -2 7.5 4 11 4 11 C 4 11 10 7.5 10 4 Z"
                      fill="#D62828"
                      transform="rotate(-10)"
                    />
                    <path
                      d="M 7 3 C 7 1 4.5 0.2 3 2 C 1.5 0.2 -1 1 -1 3 C -1 5.5 3 8 3 8 C 3 8 7 5.5 7 3 Z"
                      fill="#E63950"
                      transform="translate(15, 14) rotate(12)"
                    />
                    <path
                      d="M 6 2.5 C 6 0.8 4 0.2 2.5 1.8 C 1 0.2 -1 0.8 -1 2.5 C -1 4.8 2.5 7 2.5 7 C 2.5 7 6 4.8 6 2.5 Z"
                      fill="#B91C1C"
                      transform="translate(-4, 21) rotate(-18)"
                    />
                  </g>
                </g>

                {/* 2. Leaning Left: Pearl-White Retro Compact Camera */}
                <g transform="translate(18, 134) rotate(-8)">
                  {/* Top Shutter & Mode Dial */}
                  <rect x="20" y="-5" width="16" height="6" rx="2" fill="#D4D4D8" />
                  <rect x="78" y="-4" width="22" height="5" rx="2" fill="#E4E4E7" />
                  {/* Camera Body */}
                  <rect
                    x="0"
                    y="0"
                    width="126"
                    height="82"
                    rx="12"
                    fill={`url(#camBody-${uid})`}
                    stroke="#D6CFC4"
                    strokeWidth="1"
                  />
                  {/* Subtle Grip Seam */}
                  <path d="M 18 2 L 18 80" stroke="#E5DFD5" strokeWidth="1.2" />
                  {/* Flash & Viewfinder */}
                  <rect x="26" y="10" width="24" height="12" rx="3" fill="#E7E5E4" stroke="#C7C2BA" strokeWidth="0.8" />
                  <rect x="92" y="11" width="12" height="8" rx="2" fill="#27272A" />
                  <circle cx="15" cy="14" r="3" fill="#B91C1C" opacity="0.7" />
                  {/* Chrome Lens Ring */}
                  <circle cx="68" cy="46" r="27" fill={`url(#chromeRing-${uid})`} stroke="#A1A1AA" strokeWidth="0.8" />
                  <circle cx="68" cy="46" r="21" fill="#27272A" />
                  <circle cx="68" cy="46" r="15" fill="#18181B" stroke="#52525B" strokeWidth="1.5" />
                  <rect x="59" y="38" width="18" height="16" rx="3" fill="#09090B" />
                  <circle cx="64" cy="42" r="3.5" fill="#93C5FD" opacity="0.35" />
                  <circle cx="72" cy="50" r="1.5" fill="#FDA4AF" opacity="0.5" />

                  {/* Delicate Blush Ribbon Bow on Right Strap Lug */}
                  <g transform="translate(124, 18) rotate(12)">
                    <circle cx="0" cy="0" r="2.8" fill="#A1A1AA" />
                    <path
                      d="M 0 0 C -11 -10 -18 -3 -12 4 C -8 8 -2 3 0 0 Z"
                      fill="#F4A7B9"
                      stroke="#D96B88"
                      strokeWidth="0.8"
                    />
                    <path
                      d="M 0 0 C 11 -10 18 -3 12 4 C 8 8 2 3 0 0 Z"
                      fill="#F7B8C7"
                      stroke="#D96B88"
                      strokeWidth="0.8"
                    />
                    <path d="M -2 2 Q -7 15 -12 22" fill="none" stroke="#E98099" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M 2 2 Q 7 15 11 23" fill="none" stroke="#E98099" strokeWidth="2.2" strokeLinecap="round" />
                    <circle cx="0" cy="0" r="3" fill="#E98099" />
                  </g>
                </g>

                {/* 3. Overlapping Right (+14deg): Folded Ivory Parchment Rose Bouquet */}
                <g transform="translate(262, 54) rotate(14)">
                  {/* Back Ivory Parchment Cone */}
                  <path
                    d="M 12 44 L 116 34 L 74 178 L 52 178 Z"
                    fill="#EDE4D3"
                    stroke="#D6C9B4"
                    strokeWidth="1"
                  />
                  {/* Sage Eucalyptus Leaves */}
                  <g fill="#6E8E71" stroke="#4D6B50" strokeWidth="0.7">
                    <ellipse cx="32" cy="44" rx="10" ry="6" transform="rotate(-35 32 44)" />
                    <ellipse cx="46" cy="30" rx="11" ry="6" transform="rotate(-15 46 30)" />
                    <ellipse cx="72" cy="24" rx="10" ry="5.5" transform="rotate(14 72 24)" />
                    <ellipse cx="94" cy="36" rx="10" ry="6" transform="rotate(36 94 36)" />
                    <ellipse cx="22" cy="64" rx="9" ry="5.5" transform="rotate(-48 22 64)" />
                    <ellipse cx="100" cy="58" rx="9" ry="5.5" transform="rotate(42 100 58)" />
                  </g>

                  {/* Cluster of 7 Spiral Crimson Roses */}
                  {[
                    { cx: 52, cy: 42, r: 15, c: '#B91C1C' },
                    { cx: 76, cy: 44, r: 15, c: '#9E1328' },
                    { cx: 36, cy: 60, r: 14, c: '#C81D25' },
                    { cx: 62, cy: 60, r: 16, c: '#D62828' },
                    { cx: 88, cy: 62, r: 14, c: '#A61420' },
                    { cx: 48, cy: 78, r: 14, c: '#9E1328' },
                    { cx: 74, cy: 78, r: 14, c: '#B91C1C' },
                  ].map((rose, idx) => (
                    <g key={idx} transform={`translate(${rose.cx}, ${rose.cy})`}>
                      <circle r={rose.r} fill={rose.c} />
                      <circle r={rose.r * 0.72} fill="#7A0E13" opacity="0.45" />
                      <path
                        d={`M 0 -${rose.r * 0.45} C ${rose.r * 0.5} -${rose.r * 0.4} ${rose.r * 0.45} ${rose.r * 0.4} 0 ${rose.r * 0.45} C -${rose.r * 0.45} ${rose.r * 0.4} -${rose.r * 0.4} -${rose.r * 0.15} 0 -${rose.r * 0.15}`}
                        fill="none"
                        stroke="#FDE8EA"
                        strokeOpacity="0.45"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </g>
                  ))}

                  {/* Tiny Baby's Breath Dots */}
                  <g fill="#FAF5EC">
                    <circle cx="42" cy="46" r="2.2" />
                    <circle cx="64" cy="36" r="2" />
                    <circle cx="84" cy="50" r="2.2" />
                    <circle cx="58" cy="70" r="2" />
                    <circle cx="34" cy="74" r="1.8" />
                    <circle cx="82" cy="72" r="2" />
                  </g>

                  {/* Folded Front Ivory Parchment Wrap */}
                  <path
                    d="M 16 74 L 62 96 L 76 184 L 48 184 Z"
                    fill={`url(#wrapIvory-${uid})`}
                    stroke="#D6C9B4"
                    strokeWidth="0.9"
                  />
                  <path
                    d="M 110 70 L 62 96 L 50 184 L 78 184 Z"
                    fill="#F5EFE4"
                    stroke="#D6C9B4"
                    strokeWidth="0.9"
                  />

                  {/* Glossy Red Satin Bow */}
                  <g transform="translate(63, 128)">
                    <path
                      d="M 0 0 C -18 -14 -28 -2 -18 9 C -10 15 -3 5 0 0 Z"
                      fill={`url(#satinRed-${uid})`}
                    />
                    <path
                      d="M 0 0 C 18 -14 28 -2 18 9 C 10 15 3 5 0 0 Z"
                      fill={`url(#satinRed-${uid})`}
                    />
                    <path d="M -2 3 Q -12 24 -20 38" fill="none" stroke="#B91C1C" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M 2 3 Q 11 24 18 39" fill="none" stroke="#9E1328" strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="0" cy="0" r="5" fill="#D62828" />
                  </g>
                </g>
              </svg>
            </div>

            {/* Single Floating Handwritten Cue */}
            <span
              className="bc-float mt-2 inline-block font-handwritten text-2xl sm:text-3xl tracking-wide text-[#FAF5EC] drop-shadow-[0_2px_6px_rgba(40,0,6,0.45)]"
              style={langSafe}
            >
              {copy.clickMe}
            </span>
          </button>
        </div>
      ) : null}

      {/* =====================================================================
          SCENE 2A (bow): Interactive Bow & Arrow -> Volumetric Glossy 3D Heart
      ====================================================================== */}
      {scene === 'bow' ? (
        <div
          className="relative z-10 flex flex-1 flex-col items-center justify-between px-3 py-6 sm:px-6 animate-fade-in"
          style={{
            backgroundColor: '#F3EFE6',
            color: '#4A151B',
          }}
        >
          <div className="relative mx-auto flex w-full max-w-[440px] flex-1 items-center justify-center">
            <div className="relative aspect-[400/460] w-full max-w-[400px]">
              <svg
                ref={stageSvgRef}
                viewBox="0 0 400 460"
                className="h-full w-full overflow-visible"
                role="img"
                aria-label={copy.bowCue}
              >
              <defs>
                {/* Rose ambient glow behind heart */}
                <radialGradient id={`heartAura-${uid}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E63950" stopOpacity={0.44 + pullRatio * 0.25} />
                  <stop offset="52%" stopColor="#F48FB1" stopOpacity={0.22 + pullRatio * 0.14} />
                  <stop offset="100%" stopColor="#F3EFE6" stopOpacity="0" />
                </radialGradient>

                {/* Volumetric glossy 3D red heart */}
                <radialGradient id={`heartVol-${uid}`} cx="34%" cy="30%" r="72%">
                  <stop offset="0%" stopColor="#FF9EAA" />
                  <stop offset="38%" stopColor="#E63950" />
                  <stop offset="82%" stopColor="#B8142E" />
                  <stop offset="100%" stopColor="#8A0D20" />
                </radialGradient>

                {/* Walnut recurve bow wood */}
                <linearGradient id={`walnutWood-${uid}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8C5530" />
                  <stop offset="55%" stopColor="#5C3116" />
                  <stop offset="100%" stopColor="#3B1D0A" />
                </linearGradient>

                <filter id={`heartBlur-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="16" />
                </filter>
              </defs>

              {/* Ambient rose aura */}
              <circle
                cx={HEART_TARGET.x}
                cy={HEART_TARGET.y}
                r={118 + pullRatio * 18}
                fill={`url(#heartAura-${uid})`}
                filter={`url(#heartBlur-${uid})`}
              />

              {/* Volumetric Glossy 3D Heart */}
              <g
                transform={`translate(${HEART_TARGET.x}, ${HEART_TARGET.y}) scale(${heartScale})`}
                style={{
                  transition: isDraggingBow ? 'none' : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                {/* Subtle soft drop shadow */}
                <path
                  d="M 0 42 C -14 31 -50 8 -50 -20 C -50 -38 -35 -50 -19 -50 C -9 -50 -3 -44 0 -37 C 3 -44 9 -50 19 -50 C 35 -50 50 -38 50 -20 C 50 8 14 31 0 42 Z"
                  fill="#7A0E13"
                  opacity="0.16"
                  transform="translate(2, 6)"
                />
                {/* Main sculpted 3D heart */}
                <path
                  d="M 0 42 C -14 31 -50 8 -50 -20 C -50 -38 -35 -50 -19 -50 C -9 -50 -3 -44 0 -37 C 3 -44 9 -50 19 -50 C 35 -50 50 -38 50 -20 C 50 8 14 31 0 42 Z"
                  fill={`url(#heartVol-${uid})`}
                />
                {/* Top-left crisp white specular highlight */}
                <ellipse
                  cx="-24"
                  cy="-27"
                  rx="11"
                  ry="6"
                  transform="rotate(-32 -24 -27)"
                  fill="#FFFFFF"
                  opacity="0.72"
                />
                <circle cx="-13" cy="-16" r="3" fill="#FFFFFF" opacity="0.55" />
                {/* Bottom-right soft bounce light */}
                <path
                  d="M 26 8 C 36 -2 40 -12 39 -22"
                  fill="none"
                  stroke="#FFC2CC"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.35"
                />
              </g>

              {/* Interactive Walnut Recurve Bow & Crimson-Fletched Arrow */}
              <g
                transform={`translate(${BOW_ORIGIN.x}, ${BOW_ORIGIN.y}) rotate(${BOW_ANGLE_DEG})`}
                onPointerDown={handleBowPointerDown}
                onPointerMove={handleBowPointerMove}
                onPointerUp={handleBowPointerEnd}
                onPointerCancel={handleBowPointerEnd}
                style={{ touchAction: 'none', cursor: arrowPhase === 'ready' ? 'grab' : 'default' }}
              >
                {/* Invisible generous hit target for 1-thumb drag */}
                <circle cx="0" cy="0" r="88" fill="transparent" />

                {/* Bowstring V-path */}
                <path
                  d={`M ${-6 - limbFlex} -54 L ${stringApexX} 0 L ${-6 - limbFlex} 54`}
                  fill="none"
                  stroke="#57534E"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Curved Walnut Recurve Bow Limbs */}
                <path
                  d={`M ${-6 - limbFlex} -54 Q 10 -46 14 -22 Q 16 -8 10 0 Q 16 8 14 22 Q 10 46 ${-6 - limbFlex} 54`}
                  fill="none"
                  stroke={`url(#walnutWood-${uid})`}
                  strokeWidth="6.5"
                  strokeLinecap="round"
                />
                {/* Recurve tips */}
                <circle cx={-6 - limbFlex} cy="-54" r="2.6" fill="#D4AF37" />
                <circle cx={-6 - limbFlex} cy="54" r="2.6" fill="#D4AF37" />
                {/* Leather center grip */}
                <rect x="6" y="-11" width="9" height="22" rx="3" fill="#3B1D0A" />

                {/* Crimson-Fletched Arrow */}
                <g transform={`translate(${arrowCurrentX}, 0)`}>
                  {/* Shaft */}
                  <line
                    x1="-22"
                    y1="0"
                    x2="48"
                    y2="0"
                    stroke="#4A2812"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                  {/* Brass collar */}
                  <line x1="40" y1="0" x2="46" y2="0" stroke="#D4AF37" strokeWidth="3.4" />
                  {/* Broadhead tip */}
                  <polygon points="46,-5 59,0 46,5 49,0" fill="#27272A" />
                  {/* Crimson feather fletching */}
                  <path d="M -22 0 L -32 -7 L -16 -5 L -10 0 Z" fill="#B91C1C" />
                  <path d="M -22 0 L -32 7 L -16 5 L -10 0 Z" fill="#E63950" />
                </g>
              </g>
            </svg>

            {/* Canvas Gold Spark Ring Overlay */}
            <canvas
              ref={sparkCanvasRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
            />
            </div>
          </div>

          {/* Dual interaction control bar (1-thumb friendly Shoot button + drag hint) */}
          <div className="relative z-20 flex flex-col items-center gap-1.5 pb-2 text-center">
            <button
              type="button"
              disabled={arrowPhase !== 'ready'}
              onClick={handleAutoDrawAndShoot}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#9E171D]/30 bg-[#9E171D] px-6 text-sm font-semibold text-[#FAF5EC] shadow-md transition hover:bg-[#7A0E13] active:scale-95 disabled:opacity-60"
              style={langSafe}
            >
              <span>{copy.bowCue}</span>
            </button>
            <span className="font-handwritten text-lg text-[#7A0E13]/80" style={langSafe}>
              {copy.tapBowHint}
            </span>
          </div>
        </div>
      ) : null}

      {/* =====================================================================
          SCENE 2B (poster): Golden Sunbeam Editorial Poster
      ====================================================================== */}
      {scene === 'poster' ? (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-12 text-center animate-fade-in">
          {/* Warm Golden Champagne Radial Sunbeam Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] sm:h-[440px] sm:w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(255,244,199,0.92) 0%, rgba(246,215,128,0.52) 26%, rgba(229,193,88,0.18) 52%, rgba(158,23,29,0) 76%)',
            }}
          />
          <div
            aria-hidden="true"
            className="bc-sunbeam-spin pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(255,244,199,0.45) 18deg, transparent 42deg, rgba(255,244,199,0.3) 96deg, transparent 132deg, rgba(255,244,199,0.4) 198deg, transparent 236deg, rgba(255,244,199,0.35) 300deg, transparent 360deg)',
              maskImage: 'radial-gradient(circle, black 10%, transparent 72%)',
              WebkitMaskImage: 'radial-gradient(circle, black 10%, transparent 72%)',
            }}
          />

          <div className="relative z-10 flex w-full min-w-0 max-w-md flex-col items-center">
            <p
              className="font-romance italic text-base sm:text-lg text-[#FAF5EC]/90 drop-shadow-xs"
              style={langSafe}
            >
              {copy.makeAWish}
            </p>

            <h1
              className={`mt-2 w-full max-w-full break-words font-romance text-4xl sm:text-6xl font-normal tracking-tight text-[#FAF5EC] drop-shadow-[0_4px_18px_rgba(65,6,10,0.45)] ${
                language === 'hi' ? 'leading-[1.18]' : 'leading-[1.03]'
              }`}
              style={langSafe}
            >
              <span className="block">{copy.happyBirthday}</span>
              <span
                className={`mt-1 block ${language === 'hi' ? '' : 'italic'}`}
                style={langSafe}
              >
                {receiverName}
              </span>
            </h1>

            {/* Sketchy Antique Gold Underline Swoosh */}
            <svg
              viewBox="0 0 220 26"
              className="mt-3 h-5 w-44 sm:w-52"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M 10 15 Q 112 4 210 12 Q 124 16 42 20"
                stroke="#E5C158"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <button
              type="button"
              onClick={() => {
                playPaperUnsealSfx(0);
                setScene('binder');
              }}
              className="mt-7 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#FAF5EC] px-7 py-2.5 text-sm font-semibold text-[#7A0E13] shadow-[0_10px_24px_-6px_rgba(45,4,8,0.65)] transition hover:bg-white active:scale-95"
              style={langSafe}
            >
              {copy.openScrapbook}
            </button>
          </div>
        </div>
      ) : null}

      {/* =====================================================================
          SCENE 3 (binder): Interactive 3-Ring White Binder Flipbook
      ====================================================================== */}
      {scene === 'binder' ? (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-3 pb-6 pt-14 sm:px-5 animate-fade-in">
          {/* Top Ivory Divider Page Tabs */}
          <div
            role="tablist"
            aria-label="Scrapbook pages"
            className="mx-auto flex w-full max-w-[660px] items-end gap-1.5 px-2"
          >
            {copy.pages.map((label, idx) => {
              const pageIdx = idx as BinderPage;
              const isActive = activePage === pageIdx;
              return (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelectPage(pageIdx)}
                  className={`min-h-[44px] flex-1 truncate rounded-t-xl border border-b-0 px-2.5 text-xs font-semibold transition ${
                    isActive
                      ? 'border-[#E5DAC8] bg-[#FAF5EC] text-[#7A0E13] shadow-xs'
                      : 'border-white/15 bg-[#EADFCB]/85 text-[#5A2024] hover:bg-[#FAF5EC]/90'
                  }`}
                  style={langSafe}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* 3-Ring Binder Body */}
          <div
            onPointerDown={handleSwipeStart}
            onPointerUp={handleSwipeEnd}
            className="relative mx-auto w-full max-w-[660px] min-w-0 perspective-[1400px]"
          >
            <div
              key={`page-${activePage}`}
              className={`relative min-h-[380px] sm:min-h-[410px] w-full overflow-hidden rounded-2xl border border-[#DFD3C0] shadow-[0_24px_48px_-14px_rgba(35,3,6,0.72)] ${
                activePage === 2 ? 'bg-[#9E171D]' : 'bg-[#FAF5EC]'
              } ${turnDir === 'next' ? 'bc-page-next' : 'bc-page-prev'}`}
              style={{ transformOrigin: 'center center' }}
            >
              {/* Metallic Chrome 3-Ring Spine Overlay (Center on sm+, Left Edge on 360px mobile for Spread 1 & 2) */}
              {activePage !== 2 ? (
                <ChromeBinderRings uid={uid} centeredOnDesktop={activePage === 0} />
              ) : null}

              {/* -------------------------------------------------------------
                  SPREAD 1: Cover (Number/Title + Cupcake + Striped Polaroid)
              -------------------------------------------------------------- */}
              {activePage === 0 ? (
                <div className="grid min-h-[380px] sm:min-h-[410px] grid-cols-1 sm:grid-cols-2">
                  {/* Left Column */}
                  <div className="flex min-w-0 flex-col items-center justify-center border-b border-[#E7DEC9] px-5 py-7 pl-12 sm:border-b-0 sm:border-r sm:pl-6 sm:pr-8 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <h2
                        className="break-words font-romance text-3xl sm:text-4xl font-normal leading-tight text-[#C82333]"
                        style={langSafe}
                      >
                        <span className="block">{copy.happyBirthday}</span>
                        <span className="block font-semibold">{receiverName}</span>
                      </h2>
                      {/* Hand-drawn frosted cupcake SVG */}
                      <svg
                        viewBox="0 0 54 64"
                        className="h-12 w-10 shrink-0"
                        aria-hidden="true"
                      >
                        {/* Candle */}
                        <rect x="25" y="6" width="4" height="12" rx="1" fill="#FDE68A" stroke="#D97706" strokeWidth="0.8" />
                        <path d="M 27 0 C 30 3 30 6 27 7 C 24 6 24 3 27 0 Z" fill="#F97316" />
                        {/* Frosting swirl */}
                        <path
                          d="M 10 34 C 9 25 18 22 21 19 C 24 16 30 16 33 19 C 36 22 45 25 44 34 Z"
                          fill="#FDE8EA"
                          stroke="#E11D48"
                          strokeWidth="1.2"
                        />
                        <circle cx="27" cy="18" r="3" fill="#D62828" />
                        {/* Pleated wrapper */}
                        <polygon points="11,34 43,34 37,56 17,56" fill="#E9B872" stroke="#B45309" strokeWidth="1.1" />
                        <line x1="20" y1="34" x2="22" y2="56" stroke="#B45309" strokeWidth="0.9" opacity="0.6" />
                        <line x1="27" y1="34" x2="27" y2="56" stroke="#B45309" strokeWidth="0.9" opacity="0.6" />
                        <line x1="34" y1="34" x2="32" y2="56" stroke="#B45309" strokeWidth="0.9" opacity="0.6" />
                      </svg>
                    </div>

                    <p
                      className="mt-4 max-w-[230px] break-words font-literary text-xs sm:text-sm leading-relaxed text-[#4A2525]/85"
                      style={langSafe}
                    >
                      {copy.makeAWish}
                    </p>
                    <span
                      className="mt-3 font-handwritten text-xl text-[#9E171D]"
                      style={langSafe}
                    >
                      {copy.alwaysYours}
                    </span>
                  </div>

                  {/* Right Column: Candy Stripes + Masking-Taped Tilted Polaroid */}
                  <div className="relative flex min-w-0 flex-col items-center justify-center px-5 py-8 pl-12 sm:pl-9">
                    <div
                      className="relative flex w-full max-w-[215px] items-center justify-center rounded-xl p-4 shadow-inner"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(90deg, #C82333 0 9px, #FAF5EC 9px 18px)',
                      }}
                    >
                      {/* Masking Tape Top */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-2 left-1/2 z-20 h-4 w-14 -translate-x-1/2 rotate-[-3deg] rounded-[2px] bg-[#EFE5CE]/90 shadow-xs"
                      />
                      {/* Tiny red heart & silver star stickers */}
                      <svg
                        viewBox="0 0 24 24"
                        className="pointer-events-none absolute -left-2 -top-2 z-20 h-6 w-6 -rotate-12 drop-shadow-xs"
                        aria-hidden="true"
                      >
                        <path
                          d="M 12 20 C 8 16.5 3 12.5 3 8.2 C 3 5.5 5.2 3.5 7.8 3.5 C 9.5 3.5 11 4.4 12 5.9 C 13 4.4 14.5 3.5 16.2 3.5 C 18.8 3.5 21 5.5 21 8.2 C 21 12.5 16 16.5 12 20 Z"
                          fill="#D62828"
                          stroke="#FAF5EC"
                          strokeWidth="1.2"
                        />
                      </svg>
                      <svg
                        viewBox="0 0 36 24"
                        className="pointer-events-none absolute -bottom-2 -right-2 z-20 h-6 w-9 rotate-6 drop-shadow-xs"
                        aria-hidden="true"
                      >
                        <polygon
                          points="11,2 13.5,8 20,8.5 15,12.5 16.5,19 11,15.5 5.5,19 7,12.5 2,8.5 8.5,8"
                          fill="#D4D4D8"
                          stroke="#A1A1AA"
                          strokeWidth="0.7"
                        />
                        <polygon
                          points="26,7 27.8,11 32,11.5 28.8,14.2 29.8,18.5 26,16.2 22.2,18.5 23.2,14.2 20,11.5 24.2,11"
                          fill="#E4E4E7"
                          stroke="#A1A1AA"
                          strokeWidth="0.7"
                        />
                      </svg>

                      {visiblePhotos.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => onOpenPhoto?.(visiblePhotos[0].originalIdx)}
                          aria-label={`${copy.favoritePerson} — ${receiverName}`}
                          className="group relative z-10 flex min-h-[44px] w-full flex-col rounded-md bg-white p-2 pb-4 text-center shadow-[0_10px_22px_rgba(45,4,8,0.28)] -rotate-2 transition hover:rotate-0 hover:scale-[1.03] active:scale-95"
                        >
                          <div className="aspect-square w-full overflow-hidden rounded-[3px] bg-[#F5EFE4]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={visiblePhotos[0].url}
                              alt={copy.favoritePerson}
                              onError={() => handlePhotoError(visiblePhotos[0].url)}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span
                            className="mt-2 block truncate font-handwritten text-lg text-[#C82333]"
                            style={langSafe}
                          >
                            {copy.favoritePerson}
                          </span>
                        </button>
                      ) : (
                        <div className="relative z-10 flex w-full flex-col rounded-md bg-white p-2 pb-4 text-center shadow-[0_10px_22px_rgba(45,4,8,0.28)] -rotate-2">
                          <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[3px] bg-[#FAF5EC]">
                            <RomanticRosesMoonArt uid={uid} />
                          </div>
                          <span
                            className="mt-2 block truncate font-handwritten text-lg text-[#C82333]"
                            style={langSafe}
                          >
                            {copy.favoritePerson}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* -------------------------------------------------------------
                  SPREAD 2: Letter (Candy-Striped Oval Love Letter)
              -------------------------------------------------------------- */}
              {activePage === 1 ? (
                <div
                  className="flex min-h-[380px] sm:min-h-[410px] items-center justify-center px-4 py-7 pl-12 sm:px-10 sm:py-8 sm:pl-14"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, #D62828 0 11px, #FAF5EC 11px 22px)',
                  }}
                >
                  <div className="relative flex w-full max-w-[440px] flex-col items-center rounded-[72px] sm:rounded-[140px] border-2 border-[#B91C1C]/35 bg-[#FAF5EC] px-6 py-8 sm:px-12 sm:py-10 text-center shadow-[0_16px_36px_-10px_rgba(45,4,8,0.45)] ring-1 ring-[#FAF5EC] ring-offset-4 ring-offset-[#FAF5EC]/80">
                    {/* LOVE LETTER small caps header */}
                    <span
                      className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-[#B91C1C]"
                      style={langSafe}
                    >
                      {copy.loveLetterHeader}
                    </span>

                    {/* Hand-drawn crimson ribbon bow SVG */}
                    <svg
                      viewBox="0 0 92 36"
                      className="my-2 h-8 w-20 text-[#C82333]"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M 46 16 C 30 2 10 6 14 19 C 18 28 36 22 46 16 Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="#FDE8EA"
                      />
                      <path
                        d="M 46 16 C 62 2 82 6 78 19 C 74 28 56 22 46 16 Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="#FDE8EA"
                      />
                      <path d="M 43 18 Q 34 27 28 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M 49 18 Q 58 27 64 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="46" cy="16" r="3.5" fill="currentColor" />
                    </svg>

                    <p
                      className="max-w-full break-words font-handwritten text-2xl sm:text-3xl text-[#7A0E13]"
                      style={langSafe}
                    >
                      {copy.dearPrefix} {receiverName},
                    </p>

                    <p
                      className="mt-3 max-w-[330px] break-words font-literary text-sm leading-relaxed text-[#3A1F1F]"
                      style={langSafe}
                    >
                      {localizedMessage}
                    </p>

                    <p
                      className="mt-5 max-w-full break-words font-handwritten text-xl text-[#9E171D]"
                      style={langSafe}
                    >
                      — {senderName}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* -------------------------------------------------------------
                  SPREAD 3: Film (Transparent-Sprocket 35mm Filmstrip + Zine Collage)
              -------------------------------------------------------------- */}
              {activePage === 2 ? (
                <div className="relative flex min-h-[380px] sm:min-h-[410px] flex-col items-center justify-center gap-5 overflow-hidden bg-[#9E171D] px-4 py-7">
                  {/* Angled Matte Obsidian 35mm Filmstrip (-3deg) */}
                  <div className="relative w-full max-w-[590px] -rotate-[3deg] py-2">
                    {/* Hand-drawn white ink ribbon bow SVG pinned top-left */}
                    <svg
                      viewBox="0 0 80 54"
                      className="pointer-events-none absolute -left-2 -top-4 z-20 h-12 w-16 text-[#FAF5EC] drop-shadow-sm"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M 40 22 C 24 4 6 10 10 24 C 14 34 32 26 40 22 Z"
                        stroke="currentColor"
                        strokeWidth="2.3"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 40 22 C 56 4 74 10 70 24 C 66 34 48 26 40 22 Z"
                        stroke="currentColor"
                        strokeWidth="2.3"
                        strokeLinecap="round"
                      />
                      <path d="M 38 24 Q 28 38 24 50" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                      <path d="M 42 24 Q 52 38 56 50" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                      <circle cx="40" cy="22" r="3" fill="currentColor" />
                    </svg>

                    {/* SVG Mask creating true transparent sprocket perforations so #9E171D bleeds through */}
                    <div className="relative overflow-hidden rounded-[4px] shadow-[0_18px_34px_-10px_rgba(20,0,4,0.68)]">
                      <svg
                        viewBox="0 0 600 184"
                        preserveAspectRatio="none"
                        className="pointer-events-none absolute inset-0 h-full w-full"
                        aria-hidden="true"
                      >
                        <defs>
                          <mask id={`filmMask-${uid}`}>
                            <rect x="0" y="0" width="600" height="184" fill="white" />
                            {/* Top rail sprocket holes */}
                            {Array.from({ length: 22 }, (_, i) => (
                              <rect
                                key={`top-${i}`}
                                x={12 + i * 27}
                                y={6}
                                width="12"
                                height="10"
                                rx="2"
                                fill="black"
                              />
                            ))}
                            {/* Bottom rail sprocket holes */}
                            {Array.from({ length: 22 }, (_, i) => (
                              <rect
                                key={`bot-${i}`}
                                x={12 + i * 27}
                                y={168}
                                width="12"
                                height="10"
                                rx="2"
                                fill="black"
                              />
                            ))}
                          </mask>
                        </defs>
                        <rect
                          x="0"
                          y="0"
                          width="600"
                          height="184"
                          fill="#121212"
                          mask={`url(#filmMask-${uid})`}
                        />
                      </svg>

                      {/* Top film rail markings */}
                      <div className="relative z-10 flex justify-between px-4 pt-[20px] font-mono text-[8px] tracking-[0.2em] text-[#D8CFC0]/65">
                        <span>KODAK 400</span>
                        <span>1A</span>
                        <span>2A</span>
                        <span>3A</span>
                        <span>4A</span>
                      </div>

                      {/* 4 Filmstrip Frames */}
                      <div className="relative z-10 grid grid-cols-4 gap-2 px-3 py-1.5">
                        {[0, 1, 2, 3].map((frameIdx) => {
                          const item = visiblePhotos[frameIdx];
                          if (item) {
                            return (
                              <button
                                key={`${item.originalIdx}-${item.url}`}
                                type="button"
                                onClick={() => onOpenPhoto?.(item.originalIdx)}
                                aria-label={`Film frame ${frameIdx + 1}`}
                                className="group relative aspect-[4/3] min-h-[44px] w-full overflow-hidden rounded-[2px] border border-white/15 bg-[#1E1E1E] transition hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF5EC]"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.url}
                                  alt={`Memory ${frameIdx + 1}`}
                                  onError={() => handlePhotoError(item.url)}
                                  className="h-full w-full object-cover"
                                />
                              </button>
                            );
                          }
                          return (
                            <div
                              key={frameIdx}
                              className="flex aspect-[4/3] w-full items-center justify-center rounded-[2px] border border-[#FAF5EC]/15 bg-[#1B1214] p-1"
                            >
                              <FilmLineArtMotif index={frameIdx} />
                            </div>
                          );
                        })}
                      </div>

                      {/* Bottom film rail markings */}
                      <div className="relative z-10 flex justify-between px-4 pb-[20px] font-mono text-[8px] tracking-[0.2em] text-[#D8CFC0]/65">
                        <span>SAFETY FILM</span>
                        <span>35MM</span>
                        <span>LOVE · ED</span>
                      </div>
                    </div>
                  </div>

                  {/* Adaptive content below filmstrip */}
                  {visiblePhotos.length === 0 ? (
                    <p
                      className="font-handwritten text-2xl sm:text-3xl text-[#FAF5EC] drop-shadow-xs"
                      style={langSafe}
                    >
                      {copy.alwaysYours}
                    </p>
                  ) : null}

                  {visiblePhotos.length === 1 ? (
                    <div className="relative flex flex-col items-center">
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-2 left-1/2 z-20 h-3.5 w-14 -translate-x-1/2 rotate-[-3deg] rounded-[2px] bg-[#EFE5CE]/90 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => onOpenPhoto?.(visiblePhotos[0].originalIdx)}
                        aria-label={copy.favoritePerson}
                        className="min-h-[44px] w-[150px] rounded-md bg-white p-1.5 pb-3 text-center shadow-[0_14px_26px_rgba(20,0,4,0.5)] rotate-2 transition hover:rotate-0 hover:scale-[1.03]"
                      >
                        <div className="aspect-square w-full overflow-hidden rounded-[3px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={visiblePhotos[0].url}
                            alt={copy.favoritePerson}
                            onError={() => handlePhotoError(visiblePhotos[0].url)}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span
                          className="mt-1.5 block truncate font-handwritten text-base text-[#9E171D]"
                          style={langSafe}
                        >
                          {copy.alwaysYours}
                        </span>
                      </button>
                    </div>
                  ) : null}

                  {visiblePhotos.length >= 2 ? (
                    <div className="relative flex w-full max-w-[490px] flex-col items-center justify-center gap-3 rounded-xl bg-[#FAF5EC] px-4 py-4 text-[#D62828] shadow-[0_16px_30px_-8px_rgba(25,2,5,0.55)] sm:flex-row sm:justify-between">
                      <div className="min-w-0 text-center sm:text-left">
                        <p
                          className="font-zine text-2xl sm:text-3xl uppercase leading-none tracking-wide text-[#D62828]"
                          style={langSafe}
                        >
                          {copy.youAndMe}
                        </p>
                        <p
                          className="mt-1 font-zine text-xl sm:text-2xl uppercase leading-none tracking-wide text-[#7A0E13]"
                          style={langSafe}
                        >
                          {copy.myFavHuman}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {visiblePhotos.slice(0, 2).map((item, i) => (
                          <button
                            key={`${item.originalIdx}-${item.url}`}
                            type="button"
                            onClick={() => onOpenPhoto?.(item.originalIdx)}
                            aria-label={`${copy.favoritePerson} ${i + 1}`}
                            className={`relative min-h-[44px] w-[76px] rounded-[4px] bg-white p-1 pb-2.5 shadow-md transition hover:rotate-0 hover:scale-105 ${
                              i === 0 ? '-rotate-3' : 'rotate-3'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute -top-1.5 left-1/2 h-2.5 w-7 -translate-x-1/2 rounded-[1px] bg-[#EADBC0]/90"
                            />
                            <div className="aspect-square w-full overflow-hidden rounded-[2px]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.url}
                                alt={`${copy.youAndMe} ${i + 1}`}
                                onError={() => handlePhotoError(item.url)}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Prev / Next Corner Controls */}
            <div className="mt-3 flex items-center justify-between gap-3 px-1">
              <button
                type="button"
                disabled={activePage === 0}
                onClick={() => handleSelectPage((activePage - 1) as BinderPage)}
                aria-label="Previous page"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#FAF5EC]/25 bg-[#5E0B10]/70 px-4 text-xs font-semibold text-[#FAF5EC] transition hover:bg-[#5E0B10] active:scale-95 disabled:opacity-30"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#FAF5EC]/75">
                0{activePage + 1} / 03
              </span>

              <button
                type="button"
                disabled={activePage === 2}
                onClick={() => handleSelectPage((activePage + 1) as BinderPage)}
                aria-label="Next page"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#FAF5EC]/25 bg-[#5E0B10]/70 px-4 text-xs font-semibold text-[#FAF5EC] transition hover:bg-[#5E0B10] active:scale-95 disabled:opacity-30"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

/** 3 metallic chrome C-ring spiral bindings & dark punched binder holes. */
function ChromeBinderRings({
  uid,
  centeredOnDesktop,
}: {
  uid: string;
  centeredOnDesktop: boolean;
}) {
  const positions = ['22%', '50%', '78%'];
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 z-20 ${
        centeredOnDesktop
          ? 'left-2 sm:left-1/2 sm:-translate-x-1/2'
          : 'left-2'
      } flex w-8 flex-col justify-between py-12`}
    >
      {positions.map((pos, idx) => (
        <div
          key={pos}
          className="relative flex h-6 w-8 items-center justify-center"
        >
          <svg viewBox="0 0 40 22" className="h-6 w-9 overflow-visible drop-shadow-xs">
            <defs>
              <linearGradient id={`ringGrad-${uid}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#D4D4D8" />
                <stop offset="70%" stopColor="#71717A" />
                <stop offset="100%" stopColor="#E4E4E7" />
              </linearGradient>
            </defs>
            {/* Dark punched binder holes */}
            <circle cx="7" cy="11" r="3.4" fill="#3F2124" />
            <circle cx="33" cy="11" r="3.4" fill="#3F2124" />
            {/* Metallic chrome C-ring */}
            <path
              d="M 7 10 C 12 4, 28 4, 33 10"
              fill="none"
              stroke={`url(#ringGrad-${uid}-${idx})`}
              strokeWidth="4.2"
              strokeLinecap="round"
            />
            <path
              d="M 9 11 C 14 7, 26 7, 31 11"
              fill="none"
              stroke="#FFFFFF"
              strokeOpacity="0.65"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

/** Bespoke crimson-and-cream fine-art romantic roses + crescent moon illustration for 0-photo Polaroid. */
function RomanticRosesMoonArt({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={`moonGlow-${uid}`} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FAF5EC" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="120" height="120" fill="#FAF5EC" />
      <circle cx="62" cy="44" r="38" fill={`url(#moonGlow-${uid})`} />
      {/* Crescent Moon */}
      <path
        d="M 68 20 A 20 20 0 1 0 84 48 A 15 15 0 1 1 68 20 Z"
        fill="#D4AF37"
        opacity="0.85"
      />
      {/* Twinkling stars */}
      <circle cx="34" cy="28" r="1.5" fill="#B91C1C" opacity="0.6" />
      <circle cx="88" cy="26" r="1.8" fill="#B91C1C" opacity="0.55" />
      <circle cx="28" cy="52" r="1.2" fill="#D4AF37" />
      {/* Two Romantic Crimson Roses */}
      <g fill="#5C7C5E">
        <ellipse cx="40" cy="84" rx="10" ry="5" transform="rotate(-24 40 84)" />
        <ellipse cx="78" cy="86" rx="10" ry="5" transform="rotate(24 78 86)" />
      </g>
      <g transform="translate(52, 82)">
        <circle r="13" fill="#B91C1C" />
        <path d="M -5 -4 C 2 -8 8 -1 3 5 C -2 8 -8 3 -3 -2" fill="none" stroke="#FDE8EA" strokeWidth="1.2" />
      </g>
      <g transform="translate(70, 88)">
        <circle r="11" fill="#9E1328" />
        <path d="M -4 -3 C 2 -6 6 -1 2 4 C -2 6 -6 2 -2 -1" fill="none" stroke="#FDE8EA" strokeWidth="1.1" />
      </g>
      <path d="M 52 95 Q 56 108 58 118" fill="none" stroke="#5C7C5E" strokeWidth="2" />
      <path d="M 70 99 Q 66 110 64 118" fill="none" stroke="#5C7C5E" strokeWidth="2" />
    </svg>
  );
}

/** 4 bespoke crimson/ivory romantic line-art film motifs for empty filmstrip frames. */
function FilmLineArtMotif({ index }: { index: number }) {
  if (index === 0) {
    // Crescent Moon
    return (
      <svg viewBox="0 0 48 36" className="h-7 w-9 text-[#FAF5EC]" fill="none" aria-hidden="true">
        <path
          d="M 27 6 A 11 11 0 1 0 36 23 A 8.5 8.5 0 1 1 27 6 Z"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="#E5C158"
          fillOpacity="0.22"
        />
        <circle cx="13" cy="11" r="1.2" fill="#E5C158" />
        <circle cx="36" cy="10" r="1" fill="#FAF5EC" />
      </svg>
    );
  }
  if (index === 1) {
    // Wrapped Rose
    return (
      <svg viewBox="0 0 48 36" className="h-7 w-9 text-[#E63950]" fill="none" aria-hidden="true">
        <circle cx="24" cy="13" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 22 12 C 25 10 27 14 23 16" stroke="#FAF5EC" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M 24 19 L 24 31" stroke="#87A88A" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 19 25 Q 24 22 29 25" stroke="#FAF5EC" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (index === 2) {
    // Two Cups
    return (
      <svg viewBox="0 0 48 36" className="h-7 w-9 text-[#FAF5EC]" fill="none" aria-hidden="true">
        <path d="M 11 16 H 21 V 23 A 5 5 0 0 1 11 23 Z" stroke="currentColor" strokeWidth="1.4" />
        <path d="M 27 16 H 37 V 23 A 5 5 0 0 1 27 23 Z" stroke="currentColor" strokeWidth="1.4" />
        <path d="M 15 11 Q 16 8 15 6" stroke="#E63950" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 32 11 Q 33 8 32 6" stroke="#E63950" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  // Glowing Heart
  return (
    <svg viewBox="0 0 48 36" className="h-7 w-9 text-[#E63950]" fill="none" aria-hidden="true">
      <path
        d="M 24 29 C 19 25 13 20 13 14 C 13 10.5 15.8 8 19 8 C 21.2 8 23 9.2 24 11 C 25 9.2 26.8 8 29 8 C 32.2 8 35 10.5 35 14 C 35 20 29 25 24 29 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="#E63950"
        fillOpacity="0.25"
      />
      <circle cx="24" cy="18" r="11" stroke="#FAF5EC" strokeOpacity="0.25" strokeDasharray="2 3" />
    </svg>
  );
}
