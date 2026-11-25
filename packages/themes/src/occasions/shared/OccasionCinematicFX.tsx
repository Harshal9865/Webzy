'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    return undefined;
  }, []);

  return reduced;
}

interface ConstellationGlyph {
  stars: readonly [number, number][];
  edges: readonly [number, number][];
}

/** 5x7 (x: 0..4, y: 0..6) astronomical star-dot coordinate map for A-Z and 0-9. */
const CONSTELLATION_GLYPHS: Record<string, ConstellationGlyph> = {
  A: {
    stars: [
      [0, 6],
      [1, 3],
      [2, 0],
      [3, 3],
      [4, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 3],
    ],
  },
  B: {
    stars: [
      [0, 0],
      [3, 0],
      [4, 1],
      [3, 3],
      [0, 3],
      [4, 5],
      [3, 6],
      [0, 6],
    ],
    edges: [
      [0, 4],
      [4, 7],
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [3, 5],
      [5, 6],
      [6, 7],
    ],
  },
  C: {
    stars: [
      [4, 1],
      [2, 0],
      [0, 2],
      [0, 4],
      [2, 6],
      [4, 5],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
  },
  D: {
    stars: [
      [0, 0],
      [2, 0],
      [4, 2],
      [4, 4],
      [2, 6],
      [0, 6],
    ],
    edges: [
      [0, 5],
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
  },
  E: {
    stars: [
      [4, 0],
      [0, 0],
      [0, 3],
      [3, 3],
      [0, 6],
      [4, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4],
      [4, 5],
    ],
  },
  F: {
    stars: [
      [4, 0],
      [0, 0],
      [0, 3],
      [3, 3],
      [0, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4],
    ],
  },
  G: {
    stars: [
      [4, 1],
      [2, 0],
      [0, 2],
      [0, 4],
      [2, 6],
      [4, 5],
      [4, 3],
      [2, 3],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
    ],
  },
  H: {
    stars: [
      [0, 0],
      [0, 3],
      [0, 6],
      [4, 0],
      [4, 3],
      [4, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [3, 4],
      [4, 5],
      [1, 4],
    ],
  },
  I: {
    stars: [
      [1, 0],
      [2, 0],
      [3, 0],
      [2, 3],
      [1, 6],
      [2, 6],
      [3, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 5],
      [4, 5],
      [5, 6],
    ],
  },
  J: {
    stars: [
      [1, 0],
      [3, 0],
      [4, 0],
      [3, 4],
      [2, 6],
      [0, 5],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 4],
      [4, 5],
    ],
  },
  K: {
    stars: [
      [0, 0],
      [0, 3],
      [0, 6],
      [4, 0],
      [4, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ],
  },
  L: {
    stars: [
      [0, 0],
      [0, 3],
      [0, 6],
      [4, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  M: {
    stars: [
      [0, 6],
      [0, 0],
      [2, 3],
      [4, 0],
      [4, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  N: {
    stars: [
      [0, 6],
      [0, 0],
      [4, 6],
      [4, 0],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  O: {
    stars: [
      [2, 0],
      [0, 2],
      [0, 4],
      [2, 6],
      [4, 4],
      [4, 2],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
    ],
  },
  P: {
    stars: [
      [0, 6],
      [0, 3],
      [0, 0],
      [3, 0],
      [4, 1],
      [3, 3],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 1],
    ],
  },
  Q: {
    stars: [
      [2, 0],
      [0, 2],
      [0, 4],
      [2, 6],
      [4, 4],
      [4, 2],
      [3, 5],
      [4, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
      [6, 7],
    ],
  },
  R: {
    stars: [
      [0, 6],
      [0, 3],
      [0, 0],
      [3, 0],
      [4, 1],
      [3, 3],
      [4, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 1],
      [1, 6],
    ],
  },
  S: {
    stars: [
      [4, 1],
      [2, 0],
      [0, 1],
      [2, 3],
      [4, 5],
      [2, 6],
      [0, 5],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
    ],
  },
  T: {
    stars: [
      [0, 0],
      [2, 0],
      [4, 0],
      [2, 3],
      [2, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 4],
    ],
  },
  U: {
    stars: [
      [0, 0],
      [0, 4],
      [2, 6],
      [4, 4],
      [4, 0],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  V: {
    stars: [
      [0, 0],
      [1, 3],
      [2, 6],
      [3, 3],
      [4, 0],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  W: {
    stars: [
      [0, 0],
      [1, 6],
      [2, 3],
      [3, 6],
      [4, 0],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  X: {
    stars: [
      [0, 0],
      [2, 3],
      [4, 6],
      [4, 0],
      [0, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [3, 1],
      [1, 4],
    ],
  },
  Y: {
    stars: [
      [0, 0],
      [2, 3],
      [4, 0],
      [2, 6],
    ],
    edges: [
      [0, 1],
      [2, 1],
      [1, 3],
    ],
  },
  Z: {
    stars: [
      [0, 0],
      [4, 0],
      [2, 3],
      [0, 6],
      [4, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  '0': {
    stars: [
      [2, 0],
      [0, 2],
      [0, 4],
      [2, 6],
      [4, 4],
      [4, 2],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
      [1, 4],
    ],
  },
  '1': {
    stars: [
      [1, 1],
      [2, 0],
      [2, 3],
      [1, 6],
      [2, 6],
      [3, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 4],
      [3, 4],
      [4, 5],
    ],
  },
  '2': {
    stars: [
      [0, 1],
      [2, 0],
      [4, 1],
      [2, 4],
      [0, 6],
      [4, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
  },
  '3': {
    stars: [
      [0, 1],
      [2, 0],
      [4, 1],
      [2, 3],
      [4, 5],
      [2, 6],
      [0, 5],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
    ],
  },
  '4': {
    stars: [
      [3, 6],
      [3, 0],
      [0, 4],
      [4, 4],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  '5': {
    stars: [
      [4, 0],
      [0, 0],
      [0, 3],
      [3, 3],
      [4, 5],
      [2, 6],
      [0, 5],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
    ],
  },
  '6': {
    stars: [
      [3, 0],
      [1, 1],
      [0, 4],
      [2, 6],
      [4, 4],
      [2, 3],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 2],
    ],
  },
  '7': {
    stars: [
      [0, 0],
      [4, 0],
      [2, 3],
      [1, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  '8': {
    stars: [
      [2, 0],
      [0, 1],
      [2, 3],
      [4, 1],
      [0, 5],
      [2, 6],
      [4, 5],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [2, 4],
      [4, 5],
      [5, 6],
      [6, 2],
    ],
  },
  '9': {
    stars: [
      [2, 3],
      [0, 2],
      [2, 0],
      [4, 2],
      [3, 5],
      [1, 6],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [3, 4],
      [4, 5],
    ],
  },
};

export interface ConstellationNameSkyProps {
  recipientName: string;
  subtitle: string;
  pullPrompt: string;
  unlocked: boolean;
  onUnlock: () => void;
  children?: React.ReactNode;
}

/**
 * Interactive night-sky prologue and constellation sanctuary.
 * Starts as a dark obsidian lantern sky with a dangling pull-orb cord, then reveals
 * a starlit indigo sky with a custom 5x7 SVG constellation spelling `recipientName`.
 */
export function ConstellationNameSky({
  recipientName,
  subtitle,
  pullPrompt,
  unlocked,
  onUnlock,
  children,
}: ConstellationNameSkyProps) {
  const reducedMotion = usePrefersReducedMotion();
  const uid = useId().replace(/:/g, '');
  const [pullOffset, setPullOffset] = useState(0);
  const dragStartY = useRef<number | null>(null);
  const suppressNextClickRef = useRef(false);

  const normalizedChars = useMemo(() => {
    const cleaned = recipientName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, '')
      .slice(0, 10);
    return (cleaned || 'STAR').split('');
  }, [recipientName]);

  const constellationLayout = useMemo(() => {
    const viewW = 340;
    const count = normalizedChars.length;
    const maxW = 304;
    const stepX = Math.min(34, maxW / Math.max(count, 1));
    const glyphW = stepX * 0.68;
    const glyphH = glyphW * 1.45;
    const totalW = (count - 1) * stepX + glyphW;
    const startX = (viewW - totalW) / 2;
    const baseY = 30;

    const nodes: { x: number; y: number; delay: number; r: number }[] = [];
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

    normalizedChars.forEach((ch, charIdx) => {
      if (ch === ' ') return;
      const glyph = CONSTELLATION_GLYPHS[ch];
      if (!glyph) return;

      const ox = startX + charIdx * stepX;
      const oy = baseY + (charIdx % 2 === 0 ? 0 : 3.5);
      const baseIndex = nodes.length;

      glyph.stars.forEach(([gx, gy], sIdx) => {
        nodes.push({
          x: ox + (gx / 4) * glyphW,
          y: oy + (gy / 6) * glyphH,
          delay: ((charIdx * 3 + sIdx) % 7) * 0.35,
          r: sIdx === 0 || sIdx === 2 ? 2.1 : 1.55,
        });
      });

      glyph.edges.forEach(([a, b]) => {
        const p1 = nodes[baseIndex + a];
        const p2 = nodes[baseIndex + b];
        if (p1 && p2) {
          lines.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
        }
      });
    });

    return { viewW, nodes, lines };
  }, [normalizedChars]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    dragStartY.current = e.clientY;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore pointer capture errors on synthetic events
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragStartY.current === null) return;
    const dy = Math.max(0, Math.min(26, e.clientY - dragStartY.current));
    setPullOffset(dy);
  };

  const handlePointerUp = () => {
    if (dragStartY.current !== null && pullOffset >= 14) {
      suppressNextClickRef.current = true;
      onUnlock();
    }
    dragStartY.current = null;
    setPullOffset(0);
  };

  const handleClick = () => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    onUnlock();
  };

  return (
    <section
      className="relative w-full overflow-hidden rounded-3xl border border-white/15 text-white shadow-2xl transition-colors duration-700"
      style={{
        background: unlocked
          ? 'linear-gradient(180deg, #0B1230 0%, #121A40 55%, #171E4A 100%)'
          : '#070A16',
      }}
    >
      <style>{`
        @keyframes webzy-lantern-sway-${uid} {
          0%, 100% { transform: rotate(-3.5deg); }
          50% { transform: rotate(3.5deg); }
        }
        @keyframes webzy-star-twinkle-${uid} {
          0%, 100% { opacity: 0.55; transform: scale(0.92); }
          50% { opacity: 1; transform: scale(1.25); }
        }
        @keyframes webzy-orb-pulse-${uid} {
          0%, 100% { box-shadow: 0 0 14px rgba(251, 191, 36, 0.45); }
          50% { box-shadow: 0 0 26px rgba(251, 191, 36, 0.85); }
        }
        @media (prefers-reduced-motion: reduce) {
          .webzy-sway-${uid}, .webzy-twinkle-${uid}, .webzy-orb-${uid} {
            animation: none !important;
          }
        }
      `}</style>

      {!unlocked ? (
        <div className="relative flex min-h-[340px] flex-col items-center justify-between px-5 py-7 text-center">
          {/* Subtle obsidian dust stars */}
          <svg
            aria-hidden="true"
            viewBox="0 0 340 220"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-55"
          >
            {[
              [34, 42],
              [92, 26],
              [248, 34],
              [304, 72],
              [52, 165],
              [286, 178],
            ].map(([cx, cy], idx) => (
              <circle key={idx} cx={cx} cy={cy} r={idx % 2 === 0 ? 1.2 : 0.9} fill="#FDE68A" opacity={0.55} />
            ))}
          </svg>

          {/* Hanging swaying brass lantern SVG */}
          <div className="relative flex flex-col items-center">
            <div
              className={`webzy-sway-${uid} origin-top`}
              style={
                reducedMotion
                  ? undefined
                  : { animation: `webzy-lantern-sway-${uid} 4.2s ease-in-out infinite` }
              }
            >
              <svg
                width="108"
                height="148"
                viewBox="0 0 108 148"
                fill="none"
                aria-hidden="true"
                className="drop-shadow-[0_12px_28px_rgba(245,158,11,0.32)]"
              >
                <defs>
                  <radialGradient id={`lantern-glow-${uid}`} cx="50%" cy="55%" r="50%">
                    <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
                    <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* Chain */}
                <line x1="54" y1="0" x2="54" y2="28" stroke="#D97706" strokeWidth="2" strokeDasharray="3 2" />
                <circle cx="54" cy="31" r="4" stroke="#FBBF24" strokeWidth="2" />
                {/* Brass roof */}
                <path d="M36 46 L54 34 L72 46 Z" fill="#B45309" stroke="#FCD34D" strokeWidth="1.2" />
                <rect x="33" y="46" width="42" height="5" rx="2.5" fill="#D97706" />
                {/* Warm radial aura */}
                <circle cx="54" cy="82" r="46" fill={`url(#lantern-glow-${uid})`} />
                {/* Lantern glass chamber */}
                <rect
                  x="37"
                  y="51"
                  width="34"
                  height="52"
                  rx="6"
                  fill="#1F160A"
                  fillOpacity="0.72"
                  stroke="#F59E0B"
                  strokeWidth="1.8"
                />
                <line x1="47" y1="51" x2="47" y2="103" stroke="#FBBF24" strokeOpacity="0.4" strokeWidth="1.1" />
                <line x1="61" y1="51" x2="61" y2="103" stroke="#FBBF24" strokeOpacity="0.4" strokeWidth="1.1" />
                {/* Inner flame */}
                <path
                  d="M54 67 C59 75 61 81 54 88 C47 81 49 75 54 67 Z"
                  fill="#FDE047"
                />
                <path
                  d="M54 74 C56.5 78 57 82 54 85.5 C51 82 51.5 78 54 74 Z"
                  fill="#FFFBEB"
                />
                {/* Brass base */}
                <rect x="34" y="103" width="40" height="6" rx="2.5" fill="#B45309" stroke="#FCD34D" strokeWidth="1" />
                <path d="M44 109 L64 109 L54 118 Z" fill="#92400E" />
              </svg>
            </div>
          </div>

          <div className="relative z-10 mt-2 space-y-2">
            <p className="mx-auto max-w-[260px] text-xs font-medium tracking-wide text-amber-100/80">
              {subtitle}
            </p>
          </div>

          {/* Dangling pull-orb cord button */}
          <div className="relative z-10 mt-4 flex flex-col items-center">
            <div
              aria-hidden="true"
              className="w-px bg-gradient-to-b from-amber-300/70 to-amber-200 transition-all duration-150"
              style={{ height: `${22 + pullOffset}px` }}
            />
            <button
              type="button"
              onClick={handleClick}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`webzy-orb-${uid} group relative flex min-h-[48px] items-center gap-2.5 rounded-full border border-amber-200/50 bg-amber-400/15 px-5 py-2.5 text-xs font-bold tracking-wide text-amber-100 backdrop-blur-sm transition-transform duration-150 hover:bg-amber-400/25 active:scale-95`}
              style={{
                transform: `translateY(${pullOffset}px)`,
                animation: reducedMotion ? undefined : `webzy-orb-pulse-${uid} 2.6s ease-in-out infinite`,
              }}
            >
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 shadow-[0_0_10px_rgba(252,211,77,0.9)]"
              />
              <span>{pullPrompt}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col justify-between overflow-hidden pb-4 transition-opacity duration-700">
          {/* Starlit indigo sky + moon + constellation + fairy bunting + treehouse */}
          <div className="relative w-full">
            <svg
              viewBox={`0 0 ${constellationLayout.viewW} 210`}
              className="block w-full"
              role="img"
              aria-label={`Constellation sky spelling ${recipientName}`}
            >
              <defs>
                <radialGradient id={`moon-halo-${uid}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FEF9C3" stopOpacity="0.6" />
                  <stop offset="55%" stopColor="#FDE68A" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#171E4A" stopOpacity="0" />
                </radialGradient>
                <filter id={`star-glow-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="1.4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background scattered starfield */}
              {[
                [24, 22, 0.9],
                [58, 48, 0.7],
                [112, 18, 1.0],
                [172, 16, 0.8],
                [226, 20, 1.1],
                [264, 52, 0.8],
                [318, 88, 0.9],
                [36, 98, 0.7],
                [88, 122, 1.0],
                [256, 118, 0.9],
                [146, 132, 0.7],
                [202, 128, 0.8],
              ].map(([cx, cy, r], i) => (
                <circle key={i} cx={cx} cy={cy} r={r} fill="#E0E7FF" opacity={0.5} />
              ))}

              {/* Friendly glowing crescent moon */}
              <circle cx="298" cy="36" r="34" fill={`url(#moon-halo-${uid})`} />
              <path
                d="M302 20 A15 15 0 1 0 315 44 A12 12 0 1 1 302 20 Z"
                fill="#FEF08A"
              />

              {/* Constellation connecting lines */}
              {constellationLayout.lines.map((line, i) => (
                <line
                  key={`line-${i}`}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="#93C5FD"
                  strokeOpacity="0.48"
                  strokeWidth="1.05"
                  strokeDasharray="2 1.8"
                />
              ))}

              {/* Constellation stars */}
              {constellationLayout.nodes.map((node, i) => (
                <g key={`star-${i}`} filter={`url(#star-glow-${uid})`}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r}
                    fill="#FEF9C3"
                    className={`webzy-twinkle-${uid}`}
                    style={
                      reducedMotion
                        ? undefined
                        : {
                            transformOrigin: `${node.x}px ${node.y}px`,
                            animation: `webzy-star-twinkle-${uid} 2.8s ease-in-out ${node.delay}s infinite`,
                          }
                    }
                  />
                </g>
              ))}

              {/* Fairy-light bunting above treehouse */}
              <path
                d="M0 156 Q85 174 170 158 Q255 174 340 156"
                fill="none"
                stroke="#475569"
                strokeWidth="1"
              />
              {[
                [28, 161, '#FDE047'],
                [64, 166, '#FCA5A5'],
                [102, 165, '#FDE047'],
                [140, 161, '#93C5FD'],
                [198, 161, '#FDE047'],
                [238, 165, '#FDBA74'],
                [276, 166, '#FDE047'],
                [312, 161, '#FCA5A5'],
              ].map(([bx, by, color], idx) => (
                <g key={`bulb-${idx}`}>
                  <circle cx={Number(bx)} cy={Number(by)} r="5.5" fill={String(color)} opacity="0.22" />
                  <circle cx={Number(bx)} cy={Number(by)} r="2.2" fill={String(color)} />
                </g>
              ))}

              {/* Cozy treehouse silhouette & hillside */}
              <path
                d="M0 210 L0 190 Q85 176 170 188 Q255 198 340 182 L340 210 Z"
                fill="#090D24"
              />
              {/* Tree trunk & canopy */}
              <path d="M236 196 L246 150 L258 150 L266 196 Z" fill="#0D1330" />
              <circle cx="236" cy="148" r="24" fill="#0E173A" />
              <circle cx="266" cy="146" r="22" fill="#0E173A" />
              <circle cx="252" cy="130" r="22" fill="#111C44" />
              {/* Wooden treehouse cabin */}
              <rect x="234" y="144" width="34" height="22" rx="2" fill="#17204A" stroke="#334155" strokeWidth="1" />
              <path d="M229 145 L251 131 L273 145 Z" fill="#1E295B" />
              {/* Warm lit window */}
              <rect x="246" y="150" width="10" height="10" rx="1.5" fill="#FDE047" />
              <line x1="251" y1="150" x2="251" y2="160" stroke="#78350F" strokeWidth="1" />
              <line x1="246" y1="155" x2="256" y2="155" stroke="#78350F" strokeWidth="1" />
            </svg>
          </div>

          <div className="px-5 pt-1 text-center">
            <p className="text-xs font-medium tracking-wide text-indigo-100/85">{subtitle}</p>
          </div>

          {children ? <div className="mt-4 px-4">{children}</div> : null}
        </div>
      )}
    </section>
  );
}

export interface LaserHeartCanvasProps {
  accentHue?: 'cyan-pink' | 'crimson-gold' | 'violet-amber';
  heightClass?: string;
  interactiveLabel?: string;
  subtitle?: string;
}

interface HeartSpark {
  t: number;
  z: number;
  jitterX: number;
  jitterY: number;
  size: number;
  glyph: 'dot' | '0' | '1' | '+' | '*';
  phase: number;
  primary: boolean;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const LASER_PALETTES = {
  'cyan-pink': {
    beam: '#22D3EE',
    beamRgb: '34, 211, 238',
    heart: '#F472B6',
    heartRgb: '244, 114, 182',
    badge: 'border-cyan-400/35 bg-cyan-400/15 text-cyan-200',
  },
  'crimson-gold': {
    beam: '#FBBF24',
    beamRgb: '251, 191, 36',
    heart: '#FB7185',
    heartRgb: '251, 113, 133',
    badge: 'border-amber-400/35 bg-amber-400/15 text-amber-200',
  },
  'violet-amber': {
    beam: '#F59E0B',
    beamRgb: '245, 158, 11',
    heart: '#A78BFA',
    heartRgb: '167, 139, 250',
    badge: 'border-violet-400/35 bg-violet-400/15 text-violet-200',
  },
} as const;

/**
 * High-DPI canvas hologram firing upward beams into a pulsing volumetric 3D particle heart.
 * Tapping anywhere spawns a burst of heart sparks and boosts pulse energy.
 */
export function LaserHeartCanvas({
  accentHue = 'cyan-pink',
  heightClass = 'h-64',
  interactiveLabel = 'Tap sky to pulse heart',
  subtitle,
}: LaserHeartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [energy, setEnergy] = useState(0);

  const burstsRef = useRef<BurstParticle[]>([]);
  const pulseBoostRef = useRef(0);
  const kickLoopRef = useRef<(() => void) | null>(null);

  const palette = LASER_PALETTES[accentHue];

  const heartParticles = useMemo<HeartSpark[]>(() => {
    const glyphs: HeartSpark['glyph'][] = ['dot', 'dot', '0', '1', '+', '*'];
    const items: HeartSpark[] = [];
    const total = 150;
    for (let i = 0; i < total; i++) {
      const t = (i / total) * Math.PI * 2;
      const pseudo = Math.sin(i * 12.9898) * 43758.5453;
      const frac = pseudo - Math.floor(pseudo);
      const pseudo2 = Math.sin(i * 78.233) * 19341.123;
      const frac2 = pseudo2 - Math.floor(pseudo2);
      items.push({
        t,
        z: (frac - 0.5) * 10,
        jitterX: (frac - 0.5) * 2.4,
        jitterY: (frac2 - 0.5) * 2.4,
        size: 1.2 + frac * 1.8,
        glyph: glyphs[i % glyphs.length],
        phase: frac * Math.PI * 2,
        primary: i % 3 !== 0,
      });
    }
    return items;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let width = 320;
    let height = 240;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(200, rect.width);
      height = Math.max(160, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const startTime = performance.now();

    const drawFrame = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const rotY = reducedMotion ? 0.25 : elapsed * 0.72;
      const cosR = Math.cos(rotY);
      const sinR = Math.sin(rotY);

      pulseBoostRef.current *= 0.92;
      const beat = reducedMotion
        ? 1
        : 1 + 0.065 * Math.sin(elapsed * 3.1) + pulseBoostRef.current * 0.14;

      ctx.fillStyle = '#05050A';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.43;
      const scale = Math.min(width, height) * 0.0235 * beat;
      const emitterX = cx;
      const emitterY = height - 8;

      // Emitter glow base
      const emitterGrad = ctx.createRadialGradient(emitterX, emitterY, 2, emitterX, emitterY, 56);
      emitterGrad.addColorStop(0, `rgba(${palette.beamRgb}, 0.85)`);
      emitterGrad.addColorStop(1, `rgba(${palette.beamRgb}, 0)`);
      ctx.fillStyle = emitterGrad;
      ctx.fillRect(cx - 60, emitterY - 56, 120, 64);

      // Radiant upward beam rays
      const rayCount = 16;
      ctx.lineWidth = 1.1;
      for (let i = 0; i < rayCount; i++) {
        const t = (i / rayCount) * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const rx = hx * cosR;
        const px = cx + rx * scale;
        const py = cy + hy * scale;

        const beamGrad = ctx.createLinearGradient(emitterX, emitterY, px, py);
        beamGrad.addColorStop(0, `rgba(${palette.beamRgb}, 0.28)`);
        beamGrad.addColorStop(1, `rgba(${palette.heartRgb}, 0.04)`);
        ctx.strokeStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(emitterX, emitterY);
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      // Volumetric 3D heart particles & micro-glints
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 9px ui-monospace, SFMono-Regular, Menlo, monospace';

      for (let i = 0; i < heartParticles.length; i++) {
        const p = heartParticles[i];
        const hx = 16 * Math.pow(Math.sin(p.t), 3) + p.jitterX;
        const hy =
          -(13 * Math.cos(p.t) - 5 * Math.cos(2 * p.t) - 2 * Math.cos(3 * p.t) - Math.cos(4 * p.t)) +
          p.jitterY;
        const rx = hx * cosR - p.z * sinR;
        const rz = hx * sinR + p.z * cosR;
        const depthAlpha = Math.max(0.28, Math.min(1, (rz + 18) / 34));
        const twinkle = reducedMotion ? 0.85 : 0.65 + 0.35 * Math.sin(elapsed * 4.2 + p.phase);

        const sx = cx + rx * scale;
        const sy = cy + hy * scale;
        const rgb = p.primary ? palette.heartRgb : palette.beamRgb;
        ctx.fillStyle = `rgba(${rgb}, ${(depthAlpha * twinkle).toFixed(3)})`;

        if (p.glyph === 'dot') {
          ctx.beginPath();
          ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillText(p.glyph, sx, sy);
        }
      }

      // Interactive tap bursts
      const nextBursts: BurstParticle[] = [];
      for (let i = 0; i < burstsRef.current.length; i++) {
        const b = burstsRef.current[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.025;
        b.life -= 1;
        if (b.life > 0) {
          const alpha = b.life / b.maxLife;
          ctx.fillStyle = b.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          nextBursts.push(b);
        }
      }
      burstsRef.current = nextBursts;

      if (!reducedMotion || burstsRef.current.length > 0) {
        rafId = requestAnimationFrame(drawFrame);
      } else {
        rafId = 0;
      }
    };

    kickLoopRef.current = () => {
      if (rafId === 0) {
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    rafId = requestAnimationFrame(drawFrame);

    return () => {
      kickLoopRef.current = null;
      if (rafId !== 0) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [heartParticles, palette, reducedMotion]);

  const handleCanvasTap = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pulseBoostRef.current = 1.25;
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const speed = 1.2 + (i % 4) * 0.55;
      burstsRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.6,
        life: 32,
        maxLife: 32,
        color: i % 2 === 0 ? palette.heart : palette.beam,
        size: i % 3 === 0 ? 2.4 : 1.7,
      });
    }
    kickLoopRef.current?.();
    setEnergy((prev) => prev + 1);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/15 bg-[#05050A] shadow-2xl">
      <canvas
        ref={canvasRef}
        onPointerDown={handleCanvasTap}
        aria-label={interactiveLabel}
        className={`block w-full cursor-pointer touch-manipulation ${heightClass}`}
      />
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-xs ${palette.badge}`}
        >
          <span>{interactiveLabel}</span>
          {energy > 0 ? <span>+{energy}</span> : null}
        </span>
        {subtitle ? (
          <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white/80 backdrop-blur-xs">
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export interface AmbientRainCanvasProps {
  density?: 'light' | 'medium';
  tint?: string;
  fireflies?: boolean;
}

/**
 * Lightweight pointer-events-none HTML5 canvas rendering diagonal night rain
 * or warm drifting fireflies. Respects prefers-reduced-motion.
 */
export function AmbientRainCanvas({
  density = 'light',
  tint,
  fireflies = false,
}: AmbientRainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let width = 360;
    let height = 360;

    const count = fireflies ? (density === 'medium' ? 28 : 16) : density === 'medium' ? 54 : 28;
    const strokeTint = tint ?? (fireflies ? 'rgba(253, 224, 71, 0.85)' : 'rgba(186, 230, 253, 0.4)');

    const particles = Array.from({ length: count }, (_, idx) => {
      const s1 = Math.sin(idx * 19.13) * 43758.5453;
      const r1 = s1 - Math.floor(s1);
      const s2 = Math.sin(idx * 53.71) * 29341.123;
      const r2 = s2 - Math.floor(s2);
      return {
        x: r1,
        y: r2,
        speed: fireflies ? 0.15 + r1 * 0.25 : 4.2 + r2 * 3.4,
        len: 10 + r1 * 12,
        radius: 1.4 + r2 * 1.9,
        phase: r1 * Math.PI * 2,
      };
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(120, rect.width);
      height = Math.max(120, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();

    const render = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      if (fireflies) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (!reducedMotion) {
            p.y -= (p.speed * 0.3) / height;
            p.x += (Math.sin(t * 1.4 + p.phase) * 0.22) / width;
            if (p.y < -0.05) p.y = 1.05;
            if (p.x < -0.05) p.x = 1.05;
            if (p.x > 1.05) p.x = -0.05;
          }
          const px = p.x * width;
          const py = p.y * height;
          const glowAlpha = reducedMotion ? 0.65 : 0.3 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.4 + p.phase));

          ctx.save();
          ctx.globalAlpha = glowAlpha;
          ctx.fillStyle = strokeTint;
          ctx.shadowBlur = 10;
          ctx.shadowColor = strokeTint;
          ctx.beginPath();
          ctx.arc(px, py, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else {
        ctx.strokeStyle = strokeTint;
        ctx.lineWidth = 1.1;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (!reducedMotion) {
            p.y += p.speed / height;
            p.x -= (p.speed * 0.24) / width;
            if (p.y > 1.08) {
              p.y = -0.08;
              p.x = (p.x + 0.37) % 1;
            }
            if (p.x < -0.08) {
              p.x = 1.05;
            }
          }
          const px = p.x * width;
          const py = p.y * height;
          ctx.moveTo(px, py);
          ctx.lineTo(px - p.len * 0.24, py + p.len);
        }
        ctx.stroke();
      }

      if (!reducedMotion) {
        rafId = requestAnimationFrame(render);
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [density, tint, fireflies, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

export interface HoldToChargeRingProps {
  label: string;
  chargingLabel?: string;
  completeLabel?: string;
  accentColor?: string;
  onComplete: () => void;
  durationMs?: number;
}

function playWarmCompletionChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const start = ctx.currentTime + idx * 0.08;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.08, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  } catch {
    // Silent fallback when Web Audio is restricted
  }
}

/**
 * Tactile press-and-hold radial SVG charge ring with smooth early-release decay,
 * Web Audio completion chime, and keyboard Enter/Space accessibility.
 */
export function HoldToChargeRing({
  label,
  chargingLabel = 'Keep holding...',
  completeLabel = 'Charged!',
  accentColor = '#F472B6',
  onComplete,
  durationMs = 1500,
}: HoldToChargeRingProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [completed, setCompleted] = useState(false);

  const progressRef = useRef(0);
  const holdingRef = useRef(false);
  const completedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const triggerComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    holdingRef.current = false;
    progressRef.current = 1;
    setProgress(1);
    setHolding(false);
    setCompleted(true);
    playWarmCompletionChime();
    onCompleteRef.current();
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const stepAnimation = useCallback(
    (now: number) => {
      if (!lastFrameRef.current) lastFrameRef.current = now;
      const dt = Math.min(80, now - lastFrameRef.current);
      lastFrameRef.current = now;

      if (completedRef.current) return;

      if (holdingRef.current) {
        const rate = 1 / Math.max(250, durationMs);
        progressRef.current = Math.min(1, progressRef.current + dt * rate);
        setProgress(progressRef.current);
        if (progressRef.current >= 1) {
          triggerComplete();
          return;
        }
        rafRef.current = requestAnimationFrame(stepAnimation);
      } else if (progressRef.current > 0) {
        progressRef.current = Math.max(0, progressRef.current - dt / 650);
        setProgress(progressRef.current);
        if (progressRef.current > 0) {
          rafRef.current = requestAnimationFrame(stepAnimation);
        } else {
          rafRef.current = null;
        }
      } else {
        rafRef.current = null;
      }
    },
    [durationMs, triggerComplete],
  );

  const startHold = () => {
    if (completedRef.current) return;
    if (reducedMotion) {
      triggerComplete();
      return;
    }
    holdingRef.current = true;
    setHolding(true);
    lastFrameRef.current = performance.now();
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(stepAnimation);
    }
  };

  const endHold = () => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    lastFrameRef.current = performance.now();
    if (rafRef.current === null && progressRef.current > 0 && !completedRef.current) {
      rafRef.current = requestAnimationFrame(stepAnimation);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!e.repeat) startHold();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      endHold();
    }
  };

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const pct = Math.round(progress * 100);

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <button
        type="button"
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerCancel={endHold}
        onPointerLeave={endHold}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={endHold}
        aria-label={completed ? completeLabel : label}
        className="group relative flex min-h-[76px] min-w-[76px] touch-none select-none items-center justify-center rounded-full bg-white/10 p-1 text-white shadow-lg backdrop-blur-sm transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 active:scale-95"
        style={{
          boxShadow: holding || completed ? `0 0 28px ${accentColor}66` : `0 0 14px ${accentColor}26`,
        }}
      >
        <svg className="h-[78px] w-[78px] -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="5"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
          className="absolute inset-0 flex flex-col items-center justify-center font-mono text-[11px] font-bold tracking-wider"
        >
          {completed ? '100%' : `${pct}%`}
        </span>
      </button>

      <span className="text-xs font-semibold tracking-wide text-white/90">
        {completed ? completeLabel : holding ? chargingLabel : label}
      </span>
      {!completed ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/55">
          Hold button or Space
        </span>
      ) : null}
    </div>
  );
}

export interface HyperspeedWarpFlashProps {
  active: boolean;
  onDone?: () => void;
}

/**
 * Full-viewport radial starburst warp streaks transition (~900ms) into a grand finale.
 */
export function HyperspeedWarpFlash({ active, onDone }: HyperspeedWarpFlashProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!active) return;

    if (reducedMotion) {
      const timer = setTimeout(() => {
        onDoneRef.current?.();
      }, 320);
      return () => clearTimeout(timer);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth || 360;
    const height = window.innerHeight || 640;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const rays = Array.from({ length: 64 }, (_, i) => {
      const angle = (i / 64) * Math.PI * 2 + (i % 3) * 0.04;
      return {
        angle,
        dist: 14 + (i % 7) * 18,
        speed: 14 + (i % 5) * 6,
        hue: i % 3 === 0 ? '#FDE68A' : i % 2 === 0 ? '#93C5FD' : '#F9A8D4',
      };
    });

    const duration = 900;
    const start = performance.now();
    let rafId = 0;

    const render = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = `rgba(6, 9, 24, ${(0.75 * (1 - progress * 0.35)).toFixed(3)})`;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < rays.length; i++) {
        const ray = rays[i];
        const inner = ray.dist + progress * ray.speed * 18;
        const outer = inner + 38 + progress * 160;
        ctx.strokeStyle = ray.hue;
        ctx.globalAlpha = Math.max(0, 1 - progress * 0.45);
        ctx.lineWidth = 1.2 + progress * 1.8;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ray.angle) * inner, cy + Math.sin(ray.angle) * inner);
        ctx.lineTo(cx + Math.cos(ray.angle) * outer, cy + Math.sin(ray.angle) * outer);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (progress > 0.65) {
        const flashAlpha = ((progress - 0.65) / 0.35) * 0.85;
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha.toFixed(3)})`;
        ctx.fillRect(0, 0, width, height);
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(render);
      } else {
        onDoneRef.current?.();
      }
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [active, reducedMotion]);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[110] flex items-center justify-center"
    >
      {reducedMotion ? (
        <div className="h-full w-full bg-white/60 transition-opacity duration-300" />
      ) : (
        <canvas ref={canvasRef} className="h-full w-full" />
      )}
    </div>
  );
}

export interface WordByWordFadeLineProps {
  text: string;
  active?: boolean;
  className?: string;
  delayStepMs?: number;
}

/**
 * Reveals each word sequentially from soft blur & zero opacity to crisp focus.
 */
export function WordByWordFadeLine({
  text,
  active = true,
  className = '',
  delayStepMs = 65,
}: WordByWordFadeLineProps) {
  const reducedMotion = usePrefersReducedMotion();
  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean), [text]);

  return (
    <p className={className}>
      {words.map((word, idx) => (
        <React.Fragment key={`${word}-${idx}`}>
          <span
            className="inline-block transition-all duration-500 ease-out"
            style={
              reducedMotion
                ? { opacity: active ? 1 : 0 }
                : {
                    opacity: active ? 1 : 0,
                    filter: active ? 'blur(0px)' : 'blur(6px)',
                    transform: active ? 'translateY(0px)' : 'translateY(5px)',
                    transitionDelay: active ? `${idx * delayStepMs}ms` : '0ms',
                  }
            }
          >
            {word}
          </span>
          {idx < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </p>
  );
}

export interface CurvedTrackItem {
  id: string;
  title: string;
  moodLabel: string;
  duration: string;
  note: string;
}

export interface CurvedTrackSanctuaryProps {
  tracks: readonly CurvedTrackItem[];
  mood?: 'birthday' | 'romantic' | 'rainy' | 'uplifting' | 'festive';
  accentColor?: string;
  dark?: boolean;
  heading?: string;
}

const SANCTUARY_MELODIES: Record<
  NonNullable<CurvedTrackSanctuaryProps['mood']>,
  readonly number[]
> = {
  birthday: [523.25, 587.33, 659.25, 783.99, 659.25, 880],
  romantic: [392, 493.88, 587.33, 659.25, 587.33, 493.88],
  rainy: [293.66, 349.23, 440, 523.25, 440, 349.23],
  uplifting: [440, 554.37, 659.25, 880, 659.25, 554.37],
  festive: [440, 523.25, 659.25, 783.99, 880, 783.99],
};

/**
 * Curved vinyl track sanctuary with selectable arc track pills, animated waveform bars,
 * Web Audio mood melody synthesizer (with clean unmount teardown), and expandable track note.
 */
export function CurvedTrackSanctuary({
  tracks,
  mood = 'romantic',
  accentColor = '#F472B6',
  dark = true,
  heading = 'Soundtrack Sanctuary',
}: CurvedTrackSanctuaryProps) {
  const reducedMotion = usePrefersReducedMotion();
  const uid = useId().replace(/:/g, '');
  const [activeId, setActiveId] = useState<string>(tracks[0]?.id ?? '');
  const [playing, setPlaying] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const loopTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeOscsRef = useRef<OscillatorNode[]>([]);

  const stopAudio = useCallback(() => {
    if (loopTimerRef.current) {
      clearInterval(loopTimerRef.current);
      loopTimerRef.current = null;
    }
    activeOscsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignore already stopped oscillators
      }
    });
    activeOscsRef.current = [];
    if (audioCtxRef.current) {
      try {
        void audioCtxRef.current.close();
      } catch {
        // Ignore AudioContext close error
      }
      audioCtxRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  useEffect(() => {
    if (!tracks.some((t) => t.id === activeId)) {
      setActiveId(tracks[0]?.id ?? '');
    }
  }, [tracks, activeId]);

  const activeTrack = tracks.find((t) => t.id === activeId) ?? tracks[0];

  const startMelodyLoop = useCallback(
    (trackIndex: number) => {
      stopAudio();
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;
        const baseNotes = SANCTUARY_MELODIES[mood] ?? SANCTUARY_MELODIES.romantic;
        const transpose = 1 + (trackIndex % 3) * 0.06;

        const playPhrase = () => {
          if (!audioCtxRef.current) return;
          const now = ctx.currentTime;
          baseNotes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = mood === 'rainy' ? 'sine' : 'triangle';
            const t0 = now + idx * 0.34;
            osc.frequency.setValueAtTime(freq * transpose, t0);
            gain.gain.setValueAtTime(0.001, t0);
            gain.gain.exponentialRampToValueAtTime(0.055, t0 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.48);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.onended = () => {
              activeOscsRef.current = activeOscsRef.current.filter((item) => item !== osc);
            };
            osc.start(t0);
            osc.stop(t0 + 0.5);
            activeOscsRef.current.push(osc);
          });
        };

        playPhrase();
        loopTimerRef.current = setInterval(playPhrase, baseNotes.length * 340 + 250);
      } catch {
        // Safe visual-only fallback when Web Audio is unavailable
      }
    },
    [mood, stopAudio],
  );

  if (!activeTrack) return null;

  const activeIndex = Math.max(
    0,
    tracks.findIndex((t) => t.id === activeTrack.id),
  );

  const handleTogglePlay = () => {
    if (playing) {
      stopAudio();
      setPlaying(false);
    } else {
      startMelodyLoop(activeIndex);
      setPlaying(true);
    }
  };

  const handleSelectTrack = (id: string, idx: number) => {
    setActiveId(id);
    if (playing) {
      startMelodyLoop(idx);
    }
  };

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border p-4 shadow-xl ${
        dark
          ? 'border-white/15 bg-[#0B0D18]/95 text-white'
          : 'border-black/10 bg-white/90 text-[#231926] backdrop-blur-md'
      }`}
    >
      <style>{`
        @keyframes webzy-wave-${uid} {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
        @keyframes webzy-vinyl-spin-${uid} {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .webzy-wave-${uid}, .webzy-vinyl-${uid} {
            animation: none !important;
          }
        }
      `}</style>

      {/* Decorative curved vinyl arc */}
      <svg
        aria-hidden="true"
        viewBox="0 0 320 44"
        className="pointer-events-none mx-auto mb-1 block w-full max-w-[320px] opacity-45"
      >
        <path
          d="M 12 38 Q 160 -4 308 38"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.4"
          strokeDasharray="3 4"
        />
      </svg>

      <p
        className={`text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${
          dark ? 'text-white/60' : 'text-stone-500'
        }`}
      >
        {heading}
      </p>

      {/* Curved arc track selector pills */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {tracks.map((track, idx) => {
          const isSelected = track.id === activeTrack.id;
          const mid = (tracks.length - 1) / 2;
          const archOffset = Math.round(Math.pow(idx - mid, 2) * 3.5);
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => handleSelectTrack(track.id, idx)}
              aria-pressed={isSelected}
              style={{
                transform: `translateY(${archOffset}px)`,
                backgroundColor: isSelected ? accentColor : undefined,
              }}
              className={`min-h-[44px] rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                isSelected
                  ? 'text-white shadow-md'
                  : dark
                    ? 'border border-white/15 bg-white/10 text-white/80 hover:bg-white/15'
                    : 'border border-black/10 bg-black/5 text-[#231926]/80 hover:bg-black/10'
              }`}
            >
              <span className="mr-1 font-mono text-[10px] opacity-70">0{idx + 1}</span>
              <span>{track.title}</span>
            </button>
          );
        })}
      </div>

      {/* Glowing active track card */}
      <div
        className={`mt-5 rounded-2xl border p-3.5 transition-all ${
          dark
            ? 'border-white/15 bg-white/5'
            : 'border-black/10 bg-stone-50/90'
        }`}
        style={{
          boxShadow: playing ? `0 0 28px -10px ${accentColor}AA` : undefined,
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {/* Vinyl disc badge */}
            <div
              aria-hidden="true"
              className={`webzy-vinyl-${uid} flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/20 bg-[#14141F] shadow-inner`}
              style={
                playing && !reducedMotion
                  ? { animation: `webzy-vinyl-spin-${uid} 3.6s linear infinite` }
                  : undefined
              }
            >
              <span
                className="h-3.5 w-3.5 rounded-full border-2 border-white/80"
                style={{ backgroundColor: accentColor }}
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{activeTrack.title}</p>
              <p
                className={`truncate font-mono text-[10px] uppercase tracking-[0.14em] ${
                  dark ? 'text-white/65' : 'text-stone-500'
                }`}
              >
                {activeTrack.moodLabel} · {activeTrack.duration}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label={playing ? `Pause ${activeTrack.title}` : `Play ${activeTrack.title}`}
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-white shadow-md transition hover:scale-105 active:scale-95"
            style={{ backgroundColor: accentColor }}
          >
            {playing ? (
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <rect x="4" y="3" width="2.5" height="10" rx="1" />
                <rect x="9.5" y="3" width="2.5" height="10" rx="1" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4 translate-x-0.5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M4 3.2v9.6a.6.6 0 0 0 .92.51l7.4-4.8a.6.6 0 0 0 0-1.02l-7.4-4.8A.6.6 0 0 0 4 3.2Z" />
              </svg>
            )}
          </button>
        </div>

        {/* Waveform visualizer + Track Note toggle */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex h-6 items-end gap-1" aria-hidden="true">
            {[0.45, 0.85, 0.6, 1, 0.7, 0.9, 0.5, 0.78].map((heightRatio, barIdx) => (
              <span
                key={barIdx}
                className={`webzy-wave-${uid} w-1 origin-bottom rounded-full transition-opacity`}
                style={{
                  height: `${Math.round(heightRatio * 20)}px`,
                  backgroundColor: accentColor,
                  opacity: playing ? 0.95 : 0.35,
                  animation:
                    playing && !reducedMotion
                      ? `webzy-wave-${uid} ${0.55 + (barIdx % 4) * 0.14}s ease-in-out ${barIdx * 0.08}s infinite`
                      : undefined,
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setNoteOpen((prev) => !prev)}
            aria-expanded={noteOpen}
            className={`min-h-[44px] rounded-xl border px-3 text-xs font-semibold transition ${
              dark
                ? 'border-white/15 bg-white/5 text-white/85 hover:bg-white/10'
                : 'border-black/10 bg-white text-[#231926]/85 hover:bg-stone-100'
            }`}
          >
            {noteOpen ? 'Hide Note' : 'Track Note'}
          </button>
        </div>

        {noteOpen ? (
          <div
            className={`mt-2.5 rounded-xl border px-3 py-2.5 text-xs leading-relaxed ${
              dark
                ? 'border-white/10 bg-black/30 text-white/85'
                : 'border-black/5 bg-white text-stone-700'
            }`}
          >
            {activeTrack.note}
          </div>
        ) : null}
      </div>
    </section>
  );
}
