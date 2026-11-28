'use client';

import type React from 'react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

export interface SerendipityVistaOption {
  id: string;
  label: string;
  subtitle: string;
  primarySrc: string;
  fallbackSrc: string;
  skyTint: string;
  lanternX: number;
  lanternY: number;
}

export interface SerendipityInkRevealProps {
  title?: string;
  subtitle?: string;
  hintLabel?: string;
  revealButtonLabel?: string;
  resetButtonLabel?: string;
  compact?: boolean;
  initialRevealed?: boolean;
  className?: string;
}

interface BrushDab {
  id: number;
  x: number;
  y: number;
  baseRadius: number;
  angle: number;
  aspect: number;
  createdAt: number;
}

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 720;
const DAB_LIFETIME_MS = 3500;
const MAX_TRAIL_DABS = 14;

export const SERENDIPITY_VISTAS: readonly SerendipityVistaOption[] = [
  {
    id: 'serendipity-temple',
    label: 'Serendipity Temple',
    subtitle: 'Golden Eaves & Indigo Clouds',
    primarySrc: '/templates/travel/serendipity-vista.jpg',
    fallbackSrc: '/templates/travel/serendipity-vista.jpg',
    skyTint: '#15233A',
    lanternX: 735,
    lanternY: 485,
  },
  {
    id: 'noto-cranes',
    label: 'Noto Mountain Cranes',
    subtitle: 'Dawn Peaks & Soaring Flock',
    primarySrc: '/templates/travel/mountain-cranes.jpg',
    fallbackSrc: '/templates/travel/serendipity-vista.jpg',
    skyTint: '#251E46',
    lanternX: 760,
    lanternY: 270,
  },
  {
    id: 'jaipur-birds',
    label: 'Jaipur Sunset Birds',
    subtitle: 'Pink Sandstone & Dusk Horizon',
    primarySrc: '/templates/travel/jaipur-slices.jpg',
    fallbackSrc: '/templates/travel/serendipity-vista.jpg',
    skyTint: '#2E1C1A',
    lanternX: 520,
    lanternY: 365,
  },
];

interface BirdSpec {
  id: string;
  startX: number;
  startY: number;
  scale: number;
  glideClass: string;
  flapDuration: string;
  delay: string;
  fill: string;
}

const SOARING_BIRDS: readonly BirdSpec[] = [
  {
    id: 'crane-1',
    startX: 250,
    startY: 176,
    scale: 1.05,
    glideClass: 'wz-sr-glide-a',
    flapDuration: '0.86s',
    delay: '0s',
    fill: '#111D30',
  },
  {
    id: 'crane-2',
    startX: 342,
    startY: 148,
    scale: 0.84,
    glideClass: 'wz-sr-glide-b',
    flapDuration: '0.74s',
    delay: '-1.4s',
    fill: '#182A44',
  },
  {
    id: 'crane-3',
    startX: 438,
    startY: 194,
    scale: 0.92,
    glideClass: 'wz-sr-glide-c',
    flapDuration: '0.94s',
    delay: '-2.6s',
    fill: '#111D30',
  },
  {
    id: 'crane-4',
    startX: 545,
    startY: 132,
    scale: 0.72,
    glideClass: 'wz-sr-glide-a',
    flapDuration: '0.68s',
    delay: '-3.8s',
    fill: '#F7EFE2',
  },
  {
    id: 'crane-5',
    startX: 625,
    startY: 172,
    scale: 0.88,
    glideClass: 'wz-sr-glide-b',
    flapDuration: '0.82s',
    delay: '-0.9s',
    fill: '#16263E',
  },
  {
    id: 'crane-6',
    startX: 712,
    startY: 214,
    scale: 0.66,
    glideClass: 'wz-sr-glide-c',
    flapDuration: '1.05s',
    delay: '-4.2s',
    fill: '#F5E8D3',
  },
];

interface PetalSpec {
  id: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  driftClass: string;
  delay: string;
  color: string;
}

const PLUM_PETALS: readonly PetalSpec[] = [
  { id: 'pt-1', cx: 165, cy: 240, rx: 5.5, ry: 3.1, driftClass: 'wz-sr-petal-a', delay: '0s', color: '#C9443A' },
  { id: 'pt-2', cx: 235, cy: 310, rx: 4.5, ry: 2.6, driftClass: 'wz-sr-petal-b', delay: '-1.8s', color: '#DE5A48' },
  { id: 'pt-3', cx: 310, cy: 270, rx: 5.2, ry: 2.8, driftClass: 'wz-sr-petal-a', delay: '-3.2s', color: '#B8332C' },
  { id: 'pt-4', cx: 390, cy: 365, rx: 4.2, ry: 2.4, driftClass: 'wz-sr-petal-b', delay: '-0.7s', color: '#E26A56' },
  { id: 'pt-5', cx: 470, cy: 295, rx: 5.0, ry: 2.9, driftClass: 'wz-sr-petal-a', delay: '-4.1s', color: '#C9443A' },
  { id: 'pt-6', cx: 560, cy: 405, rx: 4.6, ry: 2.5, driftClass: 'wz-sr-petal-b', delay: '-2.5s', color: '#D64F3E' },
  { id: 'pt-7', cx: 285, cy: 420, rx: 4.0, ry: 2.2, driftClass: 'wz-sr-petal-a', delay: '-5.0s', color: '#E57A63' },
  { id: 'pt-8', cx: 635, cy: 335, rx: 4.8, ry: 2.7, driftClass: 'wz-sr-petal-b', delay: '-1.1s', color: '#C53B32' },
];

const SERENDIPITY_KEYFRAMES_CSS = `
@keyframes wzSrWingFlapLeft {
  0%, 100% { transform: rotate(-16deg) scaleY(1); }
  50% { transform: rotate(22deg) scaleY(0.56); }
}
@keyframes wzSrWingFlapRight {
  0%, 100% { transform: rotate(16deg) scaleY(1); }
  50% { transform: rotate(-22deg) scaleY(0.56); }
}
@keyframes wzSrGlideA {
  0% { transform: translate3d(-44px, 14px, 0) rotate(-3deg); }
  50% { transform: translate3d(32px, -16px, 0) rotate(2deg); }
  100% { transform: translate3d(-44px, 14px, 0) rotate(-3deg); }
}
@keyframes wzSrGlideB {
  0% { transform: translate3d(38px, -10px, 0) rotate(2deg); }
  50% { transform: translate3d(-34px, 18px, 0) rotate(-3deg); }
  100% { transform: translate3d(38px, -10px, 0) rotate(2deg); }
}
@keyframes wzSrGlideC {
  0% { transform: translate3d(-26px, -14px, 0) rotate(-1deg); }
  50% { transform: translate3d(42px, 12px, 0) rotate(3deg); }
  100% { transform: translate3d(-26px, -14px, 0) rotate(-1deg); }
}
@keyframes wzSrLanternPulse {
  0%, 100% { opacity: 0.72; transform: scale(0.96); }
  50% { opacity: 1; transform: scale(1.07); }
}
@keyframes wzSrMistDriftSlow {
  0%, 100% { transform: translate3d(-22px, 0px, 0); opacity: 0.34; }
  50% { transform: translate3d(28px, -6px, 0); opacity: 0.52; }
}
@keyframes wzSrMistDriftFast {
  0%, 100% { transform: translate3d(24px, 4px, 0); opacity: 0.24; }
  50% { transform: translate3d(-26px, -4px, 0); opacity: 0.44; }
}
@keyframes wzSrPetalDriftA {
  0% { transform: translate3d(0px, -18px, 0) rotate(0deg); opacity: 0; }
  18% { opacity: 0.92; }
  82% { opacity: 0.82; }
  100% { transform: translate3d(68px, 92px, 0) rotate(135deg); opacity: 0; }
}
@keyframes wzSrPetalDriftB {
  0% { transform: translate3d(12px, -14px, 0) rotate(-25deg); opacity: 0; }
  20% { opacity: 0.88; }
  80% { opacity: 0.76; }
  100% { transform: translate3d(-42px, 86px, 0) rotate(110deg); opacity: 0; }
}
.wz-sr-glide-a {
  animation: wzSrGlideA 11s ease-in-out infinite;
}
.wz-sr-glide-b {
  animation: wzSrGlideB 13.5s ease-in-out infinite;
}
.wz-sr-glide-c {
  animation: wzSrGlideC 15s ease-in-out infinite;
}
.wz-sr-wing-l {
  transform-box: fill-box;
  transform-origin: 100% 55%;
  animation-name: wzSrWingFlapLeft;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
.wz-sr-wing-r {
  transform-box: fill-box;
  transform-origin: 0% 55%;
  animation-name: wzSrWingFlapRight;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
.wz-sr-lantern-glow {
  transform-box: fill-box;
  transform-origin: center;
  animation: wzSrLanternPulse 3.6s ease-in-out infinite;
}
.wz-sr-mist-slow {
  animation: wzSrMistDriftSlow 16s ease-in-out infinite;
}
.wz-sr-mist-fast {
  animation: wzSrMistDriftFast 12s ease-in-out infinite;
}
.wz-sr-petal-a {
  transform-box: fill-box;
  transform-origin: center;
  animation: wzSrPetalDriftA 8.5s ease-in-out infinite;
}
.wz-sr-petal-b {
  transform-box: fill-box;
  transform-origin: center;
  animation: wzSrPetalDriftB 9.8s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .wz-sr-glide-a,
  .wz-sr-glide-b,
  .wz-sr-glide-c,
  .wz-sr-wing-l,
  .wz-sr-wing-r,
  .wz-sr-lantern-glow,
  .wz-sr-mist-slow,
  .wz-sr-mist-fast,
  .wz-sr-petal-a,
  .wz-sr-petal-b {
    animation: none !important;
  }
}
`;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mediaQuery.matches);
    sync();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', sync);
      return () => mediaQuery.removeEventListener('change', sync);
    }
    return undefined;
  }, []);

  return reduced;
}

/**
 * Interactive gallery-white ink-wash reveal canvas inspired by the "SERENDIPITY — Thought Epiphany" woodblock poster.
 * Sweeping the mouse or dragging on touch organically tears open a ragged brushstroke aperture into a living vista
 * complete with wing-flapping soaring cranes, drifting mist, glowing bamboo lantern, crimson plum petals, and
 * grounded traveler silhouettes.
 */
export function SerendipityInkReveal({
  title = 'SERENDIPITY',
  subtitle = 'Thought Epiphany',
  hintLabel = 'Move cursor or drag across the canvas to unveil the hidden vista',
  revealButtonLabel = 'Reveal Full Vista',
  resetButtonLabel = 'Reset Canvas',
  compact = false,
  initialRevealed = false,
  className = '',
}: SerendipityInkRevealProps) {
  const rawUid = useId();
  const uid = useMemo(() => rawUid.replace(/[^a-zA-Z0-9_-]/g, ''), [rawUid]);
  const filterId = `wz-sr-ink-filter-${uid}`;
  const maskId = `wz-sr-ink-mask-${uid}`;
  const lanternGradId = `wz-sr-lantern-${uid}`;
  const mistGradId = `wz-sr-mist-${uid}`;
  const skyWashId = `wz-sr-skywash-${uid}`;

  const reducedMotion = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [activeVistaId, setActiveVistaId] = useState<string>(SERENDIPITY_VISTAS[0].id);
  const [failedPrimaryMap, setFailedPrimaryMap] = useState<Record<string, boolean>>({});
  const [fullRevealed, setFullRevealed] = useState<boolean>(initialRevealed);
  const [hasInteracted, setHasInteracted] = useState<boolean>(initialRevealed);

  // Render-synced state driven smoothly by requestAnimationFrame lerp + rolling brush-dab trail
  const [renderState, setRenderState] = useState<{
    pointerX: number;
    pointerY: number;
    pointerActive: boolean;
    pointerRadius: number;
    dabs: Array<BrushDab & { opacity: number; radius: number }>;
    fullProgress: number;
  }>({
    pointerX: 460,
    pointerY: 320,
    pointerActive: false,
    pointerRadius: 0,
    dabs: [],
    fullProgress: initialRevealed ? 1 : 0,
  });

  // Mutable animation physics refs so RAF stays silky without re-subscribing effects
  const physicsRef = useRef({
    targetX: 460,
    targetY: 320,
    currentX: 460,
    currentY: 320,
    pointerInside: false,
    pointerRadius: 0,
    lastDabX: -999,
    lastDabY: -999,
    lastDabAt: 0,
    dabCounter: 0,
    dabs: [] as BrushDab[],
    fullRevealed: initialRevealed,
    fullProgress: initialRevealed ? 1 : 0,
    reducedMotion: false,
  });

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    physicsRef.current.fullRevealed = fullRevealed;
  }, [fullRevealed]);

  useEffect(() => {
    physicsRef.current.reducedMotion = reducedMotion;
    if (reducedMotion) {
      setRenderState((prev) => ({
        ...prev,
        fullProgress: physicsRef.current.fullRevealed ? 1 : 0,
      }));
    }
  }, [reducedMotion]);

  const stepAnimation = useCallback(() => {
    rafRef.current = null;
    const p = physicsRef.current;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();

    // Spring-like exponential lerp for cursor coordinates
    const lerpFactor = 0.16;
    p.currentX += (p.targetX - p.currentX) * lerpFactor;
    p.currentY += (p.targetY - p.currentY) * lerpFactor;

    const targetPointerRadius = p.pointerInside ? 148 : 0;
    p.pointerRadius += (targetPointerRadius - p.pointerRadius) * 0.14;

    const targetFull = p.fullRevealed ? 1 : 0;
    p.fullProgress += (targetFull - p.fullProgress) * 0.1;
    if (Math.abs(targetFull - p.fullProgress) < 0.004) {
      p.fullProgress = targetFull;
    }

    // Expire dabs older than DAB_LIFETIME_MS (~3.5s)
    p.dabs = p.dabs.filter((d) => now - d.createdAt < DAB_LIFETIME_MS);

    const computedDabs = p.dabs.map((d) => {
      const age = now - d.createdAt;
      const life = Math.max(0, Math.min(1, age / DAB_LIFETIME_MS));
      // Bloom smoothly over first 14% of lifetime, then softly fade out
      const bloom = life < 0.14 ? 0.65 + (life / 0.14) * 0.42 : 1.07 + (life - 0.14) * 0.14;
      const fade = life < 0.18 ? 1 : Math.pow(1 - (life - 0.18) / 0.82, 1.45);
      return {
        ...d,
        radius: d.baseRadius * bloom,
        opacity: Math.max(0, Math.min(1, fade)),
      };
    });

    setRenderState({
      pointerX: p.currentX,
      pointerY: p.currentY,
      pointerActive: p.pointerInside || p.pointerRadius > 2,
      pointerRadius: p.pointerRadius,
      dabs: computedDabs,
      fullProgress: p.fullProgress,
    });

    const stillMoving =
      p.pointerInside ||
      p.pointerRadius > 1.5 ||
      p.dabs.length > 0 ||
      Math.abs(targetFull - p.fullProgress) > 0.004 ||
      Math.hypot(p.targetX - p.currentX, p.targetY - p.currentY) > 0.8;

    if (stillMoving && !p.reducedMotion && typeof window !== 'undefined') {
      rafRef.current = window.requestAnimationFrame(stepAnimation);
    }
  }, []);

  const ensureRafRunning = useCallback(() => {
    if (physicsRef.current.reducedMotion || typeof window === 'undefined') return;
    if (rafRef.current === null) {
      rafRef.current = window.requestAnimationFrame(stepAnimation);
    }
  }, [stepAnimation]);

  // Kick animation when user clicks Reveal / Reset
  useEffect(() => {
    if (reducedMotion) {
      setRenderState((prev) => ({
        ...prev,
        fullProgress: fullRevealed ? 1 : 0,
      }));
      return;
    }
    ensureRafRunning();
  }, [fullRevealed, reducedMotion, ensureRafRunning]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null && typeof window !== 'undefined') {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const mapClientToSvg = useCallback((clientX: number, clientY: number) => {
    const el = stageRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const nx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    return {
      x: nx * SVG_WIDTH,
      y: ny * SVG_HEIGHT,
    };
  }, []);

  const pushBrushDab = useCallback((x: number, y: number, forceLarge = false) => {
    const p = physicsRef.current;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const dist = Math.hypot(x - p.lastDabX, y - p.lastDabY);
    if (!forceLarge && dist < 24 && now - p.lastDabAt < 65) return;

    p.dabCounter += 1;
    p.lastDabX = x;
    p.lastDabY = y;
    p.lastDabAt = now;

    // Slight organic diagonal angle echo of the Serendipity woodblock tear (-36deg to -18deg)
    const angle = -32 + ((p.dabCounter * 17) % 24);
    const baseRadius = forceLarge ? 132 : 84 + ((p.dabCounter * 19) % 34);
    const aspect = 1.48 + ((p.dabCounter * 7) % 5) * 0.08;

    const nextDab: BrushDab = {
      id: p.dabCounter,
      x,
      y,
      baseRadius,
      angle,
      aspect,
      createdAt: now,
    };

    const nextTrail = [...p.dabs, nextDab];
    if (nextTrail.length > MAX_TRAIL_DABS) {
      nextTrail.splice(0, nextTrail.length - MAX_TRAIL_DABS);
    }
    p.dabs = nextTrail;
  }, []);

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const pt = mapClientToSvg(e.clientX, e.clientY);
      if (!pt) return;
      const p = physicsRef.current;
      p.pointerInside = true;
      p.targetX = pt.x;
      p.targetY = pt.y;
      if (!p.dabs.length) {
        p.currentX = pt.x;
        p.currentY = pt.y;
      }
      setHasInteracted(true);
      pushBrushDab(pt.x, pt.y, false);
      ensureRafRunning();
    },
    [reducedMotion, mapClientToSvg, pushBrushDab, ensureRafRunning],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const pt = mapClientToSvg(e.clientX, e.clientY);
      if (!pt) return;
      const p = physicsRef.current;
      p.pointerInside = true;
      p.targetX = pt.x;
      p.targetY = pt.y;
      if (!hasInteracted) setHasInteracted(true);
      pushBrushDab(pt.x, pt.y, false);
      ensureRafRunning();
    },
    [reducedMotion, mapClientToSvg, hasInteracted, pushBrushDab, ensureRafRunning],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const pt = mapClientToSvg(e.clientX, e.clientY);
      if (!pt) return;
      const p = physicsRef.current;
      p.pointerInside = true;
      p.targetX = pt.x;
      p.targetY = pt.y;
      p.currentX = pt.x;
      p.currentY = pt.y;
      setHasInteracted(true);
      pushBrushDab(pt.x, pt.y, true);
      ensureRafRunning();
    },
    [reducedMotion, mapClientToSvg, pushBrushDab, ensureRafRunning],
  );

  const handlePointerLeave = useCallback(() => {
    physicsRef.current.pointerInside = false;
    ensureRafRunning();
  }, [ensureRafRunning]);

  const handleToggleReveal = useCallback(() => {
    setHasInteracted(true);
    setFullRevealed((prev) => {
      const next = !prev;
      if (!next) {
        physicsRef.current.dabs = [];
        physicsRef.current.pointerInside = false;
      }
      return next;
    });
  }, []);

  const activeVista = useMemo(
    () => SERENDIPITY_VISTAS.find((v) => v.id === activeVistaId) ?? SERENDIPITY_VISTAS[0],
    [activeVistaId],
  );

  const activeImageSrc = failedPrimaryMap[activeVista.id]
    ? activeVista.fallbackSrc
    : activeVista.primarySrc;

  // Normalized parallax offsets in [-1, 1] reacting subtly to pointer
  const parallaxNormX = reducedMotion
    ? 0
    : ((renderState.pointerX / SVG_WIDTH) - 0.5) * 2;
  const parallaxNormY = reducedMotion
    ? 0
    : ((renderState.pointerY / SVG_HEIGHT) - 0.5) * 2;

  const bgShiftX = parallaxNormX * -14;
  const bgShiftY = parallaxNormY * -10;
  const birdShiftX = parallaxNormX * -24;
  const birdShiftY = parallaxNormY * -15;
  const lanternShiftX = parallaxNormX * 11;
  const lanternShiftY = parallaxNormY * 8;

  const isHeaderOverInk =
    fullRevealed ||
    renderState.fullProgress > 0.35 ||
    reducedMotion ||
    (renderState.pointerActive && renderState.pointerX < 420 && renderState.pointerY < 260) ||
    renderState.dabs.some((d) => d.opacity > 0.28 && d.x < 420 && d.y < 260);

  return (
    <div className={`w-full ${className}`}>
      <style>{SERENDIPITY_KEYFRAMES_CSS}</style>

      {/* Hidden HTML image probe guarantees reliable cross-browser onError fallback from primary to fallback asset */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={activeImageSrc}
        alt=""
        aria-hidden="true"
        onError={() => {
          if (!failedPrimaryMap[activeVista.id]) {
            setFailedPrimaryMap((prev) => ({ ...prev, [activeVista.id]: true }));
          }
        }}
        className="pointer-events-none absolute h-px w-px opacity-0"
      />

      {/* GALLERY CANVAS OUTER FRAME */}
      <div className="relative overflow-hidden rounded-[22px] border border-[#6F7C8C]/55 bg-[#FAF9F6] p-2.5 shadow-[0_24px_60px_-28px_rgba(21,35,58,0.22)] sm:p-4">
        {/* Refined Architectural Inner Double-Border */}
        <div
          ref={stageRef}
          onPointerEnter={handlePointerEnter}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerLeave}
          onPointerLeave={handlePointerLeave}
          onPointerCancel={handlePointerLeave}
          role="region"
          aria-label={`${title} ${subtitle} interactive ink reveal canvas`}
          className={`relative w-full select-none overflow-hidden rounded-[14px] border border-[#6F7C8C]/45 bg-[#FAF9F6] ${
            compact ? 'aspect-[4/3] min-h-[300px]' : 'aspect-[10/7.2] min-h-[340px] sm:min-h-[430px]'
          }`}
          style={{
            touchAction: 'pan-y',
            cursor: reducedMotion ? 'default' : 'crosshair',
          }}
        >
          {/* Subtle cotton paper grain & inner hairline inset frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-2 z-20 rounded-[9px] border border-[#6F7C8C]/30"
          />

          {/* Architectural corner registration ticks */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-3.5 z-20 h-3 w-3 border-l border-t border-[#6F7C8C]/55"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-3.5 z-20 h-3 w-3 border-r border-t border-[#6F7C8C]/55"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3.5 left-3.5 z-20 h-3 w-3 border-b border-l border-[#6F7C8C]/55"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3.5 right-3.5 z-20 h-3 w-3 border-b border-r border-[#6F7C8C]/55"
          />

          {/* SVG INK-MASKED LIVING VISTA STAGE */}
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            preserveAspectRatio="xMidYMid slice"
            className="block h-full w-full"
            aria-hidden="true"
          >
            <defs>
              {/* Organic ragged woodblock brush edge displacement filter */}
              <filter id={filterId} x="-18%" y="-18%" width="136%" height="136%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.025"
                  numOctaves="3"
                  seed="9"
                  result="inkNoise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="inkNoise"
                  scale="34"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>

              <radialGradient id={lanternGradId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF2C6" stopOpacity="0.95" />
                <stop offset="32%" stopColor="#F5B84B" stopOpacity="0.68" />
                <stop offset="68%" stopColor="#D97B29" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#D97B29" stopOpacity="0" />
              </radialGradient>

              <linearGradient id={mistGradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FAF7F0" stopOpacity="0" />
                <stop offset="30%" stopColor="#FAF7F0" stopOpacity="0.58" />
                <stop offset="70%" stopColor="#F4ECD8" stopOpacity="0.46" />
                <stop offset="100%" stopColor="#FAF7F0" stopOpacity="0" />
              </linearGradient>

              <linearGradient id={skyWashId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={activeVista.skyTint} stopOpacity="0.22" />
                <stop offset="55%" stopColor={activeVista.skyTint} stopOpacity="0.04" />
                <stop offset="100%" stopColor={activeVista.skyTint} stopOpacity="0.28" />
              </linearGradient>

              {/* Dynamic Ragged Brushstroke Aperture Mask */}
              <mask
                id={maskId}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={SVG_WIDTH}
                height={SVG_HEIGHT}
              >
                <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill="#000000" />

                <g filter={`url(#${filterId})`}>
                  {/* Subtle static lower-right ink-wisp teaser so unhovered canvas whispers what lies beneath while keeping top-left serif header on crisp gallery white */}
                  <ellipse
                    cx="824"
                    cy="542"
                    rx="108"
                    ry="58"
                    transform="rotate(32 824 542)"
                    fill="#FFFFFF"
                    fillOpacity="0.92"
                  />
                  <circle cx="724" cy="482" r="18" fill="#FFFFFF" fillOpacity="0.72" />
                  <circle cx="696" cy="458" r="9" fill="#FFFFFF" fillOpacity="0.58" />

                  {/* Delicate upper-right sky & crane whisper */}
                  <ellipse
                    cx="858"
                    cy="158"
                    rx="64"
                    ry="34"
                    transform="rotate(-24 858 158)"
                    fill="#FFFFFF"
                    fillOpacity="0.68"
                  />

                  {/* Pre-revealed poetic diagonal woodblock aperture when reducedMotion is enabled */}
                  {reducedMotion && !fullRevealed ? (
                    <polygon
                      points="-40,-20 565,-20 915,650 615,665 -40,185"
                      fill="#FFFFFF"
                    />
                  ) : null}

                  {/* Smooth expanding diagonal-to-full brush reveal when "Reveal Full Vista" is toggled */}
                  {renderState.fullProgress > 0.01 ? (
                    <g opacity={Math.min(1, renderState.fullProgress * 1.15)}>
                      {/* First phase diagonal Serendipity tear */}
                      <ellipse
                        cx="480"
                        cy="345"
                        rx={280 + renderState.fullProgress * 540}
                        ry={170 + renderState.fullProgress * 420}
                        transform="rotate(30 480 345)"
                        fill="#FFFFFF"
                      />
                      <ellipse
                        cx="220"
                        cy="160"
                        rx={120 + renderState.fullProgress * 420}
                        ry={110 + renderState.fullProgress * 360}
                        fill="#FFFFFF"
                      />
                      <ellipse
                        cx="780"
                        cy="540"
                        rx={120 + renderState.fullProgress * 420}
                        ry={110 + renderState.fullProgress * 360}
                        fill="#FFFFFF"
                      />
                    </g>
                  ) : null}

                  {/* Rolling trail of ~14 organic brush dabs that bloom and softly fade over ~3.5s */}
                  {renderState.dabs.map((dab) => (
                    <g key={dab.id} opacity={dab.opacity}>
                      <ellipse
                        cx={dab.x}
                        cy={dab.y}
                        rx={dab.radius * dab.aspect}
                        ry={dab.radius * 0.78}
                        transform={`rotate(${dab.angle} ${dab.x} ${dab.y})`}
                        fill="#FFFFFF"
                      />
                      {/* Painterly ink splatter specks beside each brush stroke */}
                      <circle
                        cx={dab.x + dab.radius * 0.92}
                        cy={dab.y + dab.radius * 0.42}
                        r={Math.max(4, dab.radius * 0.12)}
                        fill="#FFFFFF"
                      />
                      <circle
                        cx={dab.x - dab.radius * 0.85}
                        cy={dab.y - dab.radius * 0.48}
                        r={Math.max(3, dab.radius * 0.09)}
                        fill="#FFFFFF"
                      />
                    </g>
                  ))}

                  {/* Primary live spring-interpolated pointer brush window */}
                  {renderState.pointerActive && renderState.pointerRadius > 2 ? (
                    <g>
                      <ellipse
                        cx={renderState.pointerX}
                        cy={renderState.pointerY}
                        rx={renderState.pointerRadius * 1.62}
                        ry={renderState.pointerRadius * 0.94}
                        transform={`rotate(28 ${renderState.pointerX} ${renderState.pointerY})`}
                        fill="#FFFFFF"
                      />
                      <ellipse
                        cx={renderState.pointerX - 28}
                        cy={renderState.pointerY - 16}
                        rx={renderState.pointerRadius * 0.88}
                        ry={renderState.pointerRadius * 0.72}
                        transform={`rotate(-18 ${renderState.pointerX - 28} ${renderState.pointerY - 16})`}
                        fill="#FFFFFF"
                      />
                      <circle
                        cx={renderState.pointerX + renderState.pointerRadius * 1.15}
                        cy={renderState.pointerY + renderState.pointerRadius * 0.56}
                        r={12}
                        fill="#FFFFFF"
                      />
                    </g>
                  ) : null}
                </g>
              </mask>
            </defs>

            {/* BASE GALLERY PAPER CANVAS */}
            <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill="#FAF9F6" />

            {/* REVEALED LIVING ARTWORK LAYER (MASKED BY ORGANIC RAGGED INK WASH) */}
            <g mask={`url(#${maskId})`}>
              {/* Rich fallback tone behind photo while loading */}
              <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill={activeVista.skyTint} />

              {/* High-art Travel Vista Image with subtle cursor parallax */}
              <g
                style={{
                  transform: `translate3d(${bgShiftX.toFixed(1)}px, ${bgShiftY.toFixed(1)}px, 0)`,
                  transition: reducedMotion ? 'none' : 'transform 120ms linear',
                }}
              >
                <image
                  href={activeImageSrc}
                  x="-32"
                  y="-24"
                  width={SVG_WIDTH + 64}
                  height={SVG_HEIGHT + 48}
                  preserveAspectRatio="xMidYMid slice"
                />
              </g>

              {/* Soft atmospheric indigo-gold depth wash */}
              <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill={`url(#${skyWashId})`} />

              {/* Drifting Semi-Transparent Mist Clouds */}
              <g className="wz-sr-mist-slow">
                <path
                  d="M-30 228 Q 140 198, 285 218 T 595 204 T 930 226 L 1040 264 L -30 268 Z"
                  fill={`url(#${mistGradId})`}
                />
              </g>
              <g className="wz-sr-mist-fast">
                <path
                  d="M40 318 Q 220 296, 410 316 T 760 298 T 1020 322 L 1020 352 L 40 352 Z"
                  fill={`url(#${mistGradId})`}
                  opacity="0.72"
                />
              </g>

              {/* Warm Golden Bamboo-Lantern Glow Orb + Woven Lattice Accent */}
              <g
                style={{
                  transform: `translate3d(${lanternShiftX.toFixed(1)}px, ${lanternShiftY.toFixed(1)}px, 0)`,
                  transition: reducedMotion ? 'none' : 'transform 140ms linear',
                }}
              >
                <circle
                  cx={activeVista.lanternX}
                  cy={activeVista.lanternY}
                  r="142"
                  fill={`url(#${lanternGradId})`}
                  className="wz-sr-lantern-glow"
                />
                <circle
                  cx={activeVista.lanternX}
                  cy={activeVista.lanternY}
                  r="42"
                  fill="#FFE9A8"
                  fillOpacity="0.34"
                  className="wz-sr-lantern-glow"
                />
                {/* Delicate woven lantern glow halo rings */}
                <ellipse
                  cx={activeVista.lanternX}
                  cy={activeVista.lanternY}
                  rx="24"
                  ry="34"
                  fill="none"
                  stroke="#FFE6A3"
                  strokeOpacity="0.45"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
              </g>

              {/* 6 Detailed Animated Soaring Birds / Cranes with Wing-Flapping & Cursor Parallax */}
              <g
                style={{
                  transform: `translate3d(${birdShiftX.toFixed(1)}px, ${birdShiftY.toFixed(1)}px, 0)`,
                  transition: reducedMotion ? 'none' : 'transform 140ms linear',
                }}
              >
                {SOARING_BIRDS.map((bird) => (
                  <g
                    key={bird.id}
                    transform={`translate(${bird.startX}, ${bird.startY}) scale(${bird.scale})`}
                  >
                    <g className={bird.glideClass} style={{ animationDelay: bird.delay }}>
                      {/* Left Wing */}
                      <path
                        d="M0 0 C -9 -14, -24 -18, -36 -8 C -25 -5, -14 -2, 0 2 Z"
                        fill={bird.fill}
                        className="wz-sr-wing-l"
                        style={{
                          animationDuration: bird.flapDuration,
                          animationDelay: bird.delay,
                        }}
                      />
                      {/* Right Wing */}
                      <path
                        d="M0 0 C 10 -15, 26 -17, 37 -6 C 25 -4, 14 -1, 0 2 Z"
                        fill={bird.fill}
                        className="wz-sr-wing-r"
                        style={{
                          animationDuration: bird.flapDuration,
                          animationDelay: bird.delay,
                        }}
                      />
                      {/* Sleek Crane Body & Tail */}
                      <path
                        d="M-6 2 Q 2 -2, 13 3 Q 4 5, -9 6 Z"
                        fill={bird.fill}
                      />
                    </g>
                  </g>
                ))}
              </g>

              {/* Gently Drifting Crimson Plum Blossom Petals */}
              {PLUM_PETALS.map((petal) => (
                <g key={petal.id} transform={`translate(${petal.cx}, ${petal.cy})`}>
                  <ellipse
                    cx="0"
                    cy="0"
                    rx={petal.rx}
                    ry={petal.ry}
                    fill={petal.color}
                    className={petal.driftClass}
                    style={{ animationDelay: petal.delay }}
                  />
                </g>
              ))}
            </g>

            {/* ANCHORED POETIC TRAVELER SILHOUETTES & SLATE GROUND SHADOW ON THE WHITE GALLERY FLOOR */}
            <g className="pointer-events-none">
              {/* Sweeping indigo-slate woodblock ground shadow */}
              <path
                d="M170 668 C 305 654, 495 652, 690 656 C 795 658, 868 666, 892 674 C 755 680, 560 684, 385 682 C 260 680, 195 675, 170 668 Z"
                fill="#2E425D"
                fillOpacity="0.82"
              />
              <ellipse cx="486" cy="669" rx="190" ry="6.5" fill="#17263D" fillOpacity="0.45" />

              {/* Left smaller serene traveler figure */}
              <g transform="translate(442, 608)">
                <circle cx="8" cy="8" r="4.6" fill="#141F32" />
                <path
                  d="M4 14 C 1 24, 0 40, 2 55 L 15 56 C 17 42, 14 25, 11 14 Z"
                  fill="#17243A"
                />
                <path
                  d="M2 54 L 6 61 L 11 61 L 14 54 Z"
                  fill="#101A2B"
                />
                {/* Subtle ochre robe sash accent */}
                <path d="M4 34 L 14 35 L 14 38 L 3 37 Z" fill="#C98A3A" fillOpacity="0.78" />
              </g>

              {/* Right taller contemplative traveler silhouette with flowing robe */}
              <g transform="translate(490, 594)">
                <circle cx="11" cy="8.5" r="5.3" fill="#141F32" />
                <path
                  d="M4 16 C 0 28, 1 46, 5 69 L 17 70 C 20 55, 25 48, 28 45 C 23 36, 22 25, 17 16 Z"
                  fill="#141F32"
                />
                <path d="M6 68 L 8 76 L 13 76 L 15 68 Z" fill="#0F1828" />
                <path d="M16 42 Q 26 48 31 58 Q 21 59 15 54 Z" fill="#1C2B45" />
              </g>
            </g>
          </svg>

          {/* POETIC TOP-LEFT CALLIGRAPHY / SERIF MASTHEAD OVERLAY (CONSTRAINED ON SMALL PHONES TO PREVENT BUTTON OVERLAP) */}
          <div className="pointer-events-none absolute left-3.5 top-3.5 z-30 max-w-[54%] sm:left-6 sm:top-5 sm:max-w-[64%]">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Geometric Ink Seal Mark */}
              <svg
                viewBox="0 0 28 28"
                className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="2"
                  width="24"
                  height="24"
                  rx="4"
                  fill="none"
                  stroke={isHeaderOverInk ? '#E8B15B' : '#B83B3B'}
                  strokeWidth="1.5"
                />
                <path
                  d="M8 10 H20 M14 7 V21 M9 16 C12 15, 16 15, 19 19"
                  fill="none"
                  stroke={isHeaderOverInk ? '#E8B15B' : '#B83B3B'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={`truncate font-mono text-[8px] font-semibold uppercase tracking-[0.18em] transition-colors duration-500 sm:text-[9px] sm:tracking-[0.26em] ${
                  isHeaderOverInk
                    ? 'text-[#F4D292] drop-shadow-[0_1px_6px_rgba(10,18,32,0.85)]'
                    : 'text-[#526072]'
                }`}
              >
                {title} · {subtitle}
              </span>
            </div>

            <p
              className={`mt-1 truncate font-editorial text-lg leading-none tracking-[0.06em] transition-colors duration-500 sm:text-3xl ${
                isHeaderOverInk
                  ? 'text-[#F6D393] drop-shadow-[0_2px_12px_rgba(12,20,36,0.9)]'
                  : 'text-[#314155]'
              }`}
            >
              {title}
            </p>
            <p
              className={`mt-0.5 line-clamp-1 font-literary text-[10px] italic transition-colors duration-500 sm:text-xs ${
                isHeaderOverInk
                  ? 'text-[#F5EFE4]/90 drop-shadow-[0_1px_8px_rgba(12,20,36,0.85)]'
                  : 'text-[#627182]'
              }`}
            >
              {activeVista.subtitle}
            </p>
          </div>

          {/* ACCESSIBLE REVEAL / RESET PILL BUTTON (TOP-RIGHT — COMPACT ON SMALL PHONES) */}
          <div className="absolute right-3 top-3 z-30 sm:right-5 sm:top-5">
            <button
              type="button"
              onClick={handleToggleReveal}
              aria-pressed={fullRevealed}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10.5px] font-semibold tracking-wide shadow-sm backdrop-blur-md transition-all active:scale-95 sm:min-h-[44px] sm:gap-2 sm:px-3.5 sm:py-2 sm:text-[11px] ${
                fullRevealed
                  ? 'border-white/30 bg-[#15233A]/85 text-[#FAF7F0] hover:bg-[#15233A]'
                  : 'border-[#6F7C8C]/45 bg-[#FAF9F6]/90 text-[#1E2C3E] hover:border-[#15233A] hover:bg-white'
              }`}
            >
              <svg
                viewBox="0 0 20 20"
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                {fullRevealed ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 10a6 6 0 1 0 1.76-4.24L4 7.5M4 4v3.5h3.5"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.5 10s3-5.2 7.5-5.2S17.5 10 17.5 10s-3 5.2-7.5 5.2S2.5 10 2.5 10Zm7.5 2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
                  />
                )}
              </svg>
              <span className="sm:hidden">{fullRevealed ? 'Reset' : 'Reveal'}</span>
              <span className="hidden sm:inline">{fullRevealed ? resetButtonLabel : revealButtonLabel}</span>
            </button>
          </div>

          {/* GENTLE INTERACTION HINT (FADES SOFTLY ONCE PAINTING STARTS) */}
          <div
            className={`pointer-events-none absolute inset-x-4 bottom-5 z-30 flex justify-center transition-opacity duration-500 ${
              hasInteracted || reducedMotion ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6F7C8C]/35 bg-[#FAF9F6]/95 px-3.5 py-1.5 text-center shadow-xs backdrop-blur-xs">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-[#B83B3B] animate-pulse"
                aria-hidden="true"
              />
              <span className="font-sans text-[11px] font-medium text-[#3C4B5E]">
                {hintLabel}
              </span>
            </div>
          </div>
        </div>

        {/* 3-VISTA CURATED SELECTOR BAR (SINGLE SCROLLABLE RAIL ON MOBILE) */}
        <div
          role="tablist"
          aria-label="Select hidden vista artwork"
          className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-0.5 sm:px-1"
        >
          <div className="flex w-full flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none sm:w-auto sm:flex-wrap sm:overflow-visible">
            {SERENDIPITY_VISTAS.map((vista, index) => {
              const isSelected = vista.id === activeVista.id;
              return (
                <button
                  key={vista.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveVistaId(vista.id)}
                  className={`inline-flex min-h-[38px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[10.5px] font-semibold transition-all active:scale-95 sm:min-h-[42px] sm:px-3.5 sm:py-1.5 sm:text-[11px] ${
                    isSelected
                      ? 'border-[#15233A] bg-[#15233A] text-[#FAF9F6] shadow-xs'
                      : 'border-[#6F7C8C]/35 bg-white/80 text-[#3B4A5D] hover:border-[#15233A]/55 hover:bg-white'
                  }`}
                >
                  <span className="font-mono text-[9.5px] opacity-70">0{index + 1}</span>
                  <span>{vista.label}</span>
                </button>
              );
            })}
          </div>

          <span className="hidden font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#607083] sm:inline">
            INK WASH EDITION · LIVE CANVAS
          </span>
        </div>
      </div>
    </div>
  );
}
