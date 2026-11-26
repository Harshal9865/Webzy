'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  AtmosphericGrainOverlay,
  playLanternPullChime,
} from '../shared/OccasionCraftPrimitives';
import {
  BIRTHDAY_THEMES_COPY,
  type BirthdayThemeComponentProps,
  getValidPhotos,
  hiSafeStyle,
  useBirthdayReducedMotion,
} from './birthdayTypes';

type FamilyScene = 'gift' | 'transition' | 'tree';

interface HatchStroke {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  opacity: number;
  width: number;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildHatchStrokes(
  seed: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  count: number,
): HatchStroke[] {
  const rand = mulberry32(seed);
  const colors = ['#C92A47', '#E05A72', '#8A1C32', '#D8435C'];
  const strokes: HatchStroke[] = [];
  for (let i = 0; i < count; i += 1) {
    const progress = i / Math.max(1, count - 1);
    const baseX = xMin + progress * (xMax - xMin) + (rand() - 0.5) * 14;
    const baseY = yMin + rand() * (yMax - yMin);
    const len = 36 + rand() * 58;
    const angle = -0.82 + (rand() - 0.5) * 0.22; // ~ -47 deg diagonal pencil hatch
    const dx = Math.cos(angle) * len;
    const dy = Math.sin(angle) * len;
    strokes.push({
      x1: baseX - dx * 0.5,
      y1: baseY - dy * 0.5,
      x2: baseX + dx * 0.5,
      y2: baseY + dy * 0.5,
      color: colors[Math.floor(rand() * colors.length)] ?? '#C92A47',
      opacity: 0.34 + rand() * 0.44,
      width: 1.15 + rand() * 1.45,
    });
  }
  return strokes;
}

const BODY_HATCH_STROKES = buildHatchStrokes(1903, 44, 176, 86, 182, 42);
const LID_HATCH_STROKES = buildHatchStrokes(2711, 36, 184, 60, 92, 24);

/* -------------------------------------------------------------------------- */
/* Scene 1: Hand-Sketched Colored-Pencil Crimson Ribbon Gift Box SVG          */
/* -------------------------------------------------------------------------- */

function PencilGiftBoxSvg({ isOpening }: { isOpening: boolean }) {
  const uid = useId().replace(/:/g, '');
  const wobbleId = `pencil-wobble-${uid}`;
  const bodyClipId = `box-body-clip-${uid}`;
  const lidClipId = `box-lid-clip-${uid}`;

  return (
    <svg
      viewBox="0 0 220 212"
      className="h-auto w-[158px] overflow-visible sm:w-[184px]"
      aria-hidden="true"
    >
      <defs>
        <filter id={wobbleId} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.036"
            numOctaves="3"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="1.6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <clipPath id={bodyClipId}>
          <path d="M52 88 L168 88 L165 178 L55 178 Z" />
        </clipPath>
        <clipPath id={lidClipId}>
          <path d="M43 65 L177 65 L175 90 L45 90 Z" />
        </clipPath>
      </defs>

      {/* Soft paper contact shadow */}
      <ellipse
        cx="110"
        cy="183"
        rx="64"
        ry="8.5"
        fill="#B9A696"
        opacity="0.28"
      />

      <g filter={`url(#${wobbleId})`}>
        {/* Box body base */}
        <path
          d="M52 88 L168 88 L165 178 L55 178 Z"
          fill="#FDF8F4"
        />

        {/* Clipped diagonal colored-pencil hatch strokes on box body */}
        <g clipPath={`url(#${bodyClipId})`}>
          {BODY_HATCH_STROKES.map((s, idx) => (
            <line
              key={idx}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={s.color}
              strokeOpacity={s.opacity}
              strokeWidth={s.width}
              strokeLinecap="round"
            />
          ))}
          {/* Extra left-edge pencil shadow pass */}
          <path
            d="M52 88 L68 88 L68 178 L54 178 Z"
            fill="#8A1C32"
            opacity="0.16"
          />
          {/* Cast shadow directly underneath overhanging lid */}
          <path
            d="M50 88 L170 88 L169 98 L51 98 Z"
            fill="#4A1C26"
            opacity="0.18"
          />
          {/* Vertical center ribbon band */}
          <path
            d="M99 88 L121 88 L120 178 L100 178 Z"
            fill="#C92A47"
            opacity="0.34"
          />
          <line x1="100" y1="88" x2="100.5" y2="178" stroke="#4A1C26" strokeWidth="1.25" opacity="0.72" />
          <line x1="120" y1="88" x2="119.5" y2="178" stroke="#4A1C26" strokeWidth="1.25" opacity="0.72" />
        </g>

        {/* Multi-pass sketchy dark burgundy/graphite outlines on box body */}
        <path
          d="M52.5 88.5 L167.5 88 L165 177.5 L55 178 Z"
          fill="none"
          stroke="#4A1C26"
          strokeWidth="2.1"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M51.5 89.5 L168.5 89 L164 178.5 L56 177 Z"
          fill="none"
          stroke="#4A1C26"
          strokeWidth="1.05"
          opacity="0.58"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Animated overhanging lid + sketchy bow */}
        <g
          style={{
            transformBox: 'view-box',
            transformOrigin: '45px 86px',
            transform: isOpening
              ? 'translateY(-19px) rotate(-10deg)'
              : 'translateY(0px) rotate(0deg)',
            transition: 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Lid paper base */}
          <path d="M43 65 L177 65 L175 90 L45 90 Z" fill="#FCF6F2" />

          {/* Clipped colored-pencil hatching on overhanging lid */}
          <g clipPath={`url(#${lidClipId})`}>
            {LID_HATCH_STROKES.map((s, idx) => (
              <line
                key={idx}
                x1={s.x1}
                y1={s.y1}
                x2={s.x2}
                y2={s.y2}
                stroke={s.color}
                strokeOpacity={s.opacity}
                strokeWidth={s.width}
                strokeLinecap="round"
              />
            ))}
            <path d="M98 65 L122 65 L121 90 L99 90 Z" fill="#B5223D" opacity="0.32" />
          </g>

          {/* Lid multi-pass outlines */}
          <path
            d="M43 65.5 L177 65 L175 89.5 L45 90 Z"
            fill="none"
            stroke="#4A1C26"
            strokeWidth="2.1"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M42.2 66.4 L177.6 66 L174.4 90.3 L45.6 89.2 Z"
            fill="none"
            stroke="#4A1C26"
            strokeWidth="1"
            opacity="0.55"
            strokeLinejoin="round"
          />

          {/* Ribbon tails draping forward across lid */}
          <path
            d="M104 65 C96 74 88 83 78 96 L87 95 L93 102 C99 90 104 77 108 66 Z"
            fill="#C92A47"
            fillOpacity="0.82"
            stroke="#4A1C26"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M115 65 C124 75 132 85 141 98 L131 96 L125 103 C119 90 115 77 111 66 Z"
            fill="#E05A72"
            fillOpacity="0.82"
            stroke="#4A1C26"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Left bow loop */}
          <path
            d="M106 58 C88 30 56 32 58 55 C59 71 87 69 104 62 Z"
            fill="#E05A72"
            fillOpacity="0.72"
            stroke="#4A1C26"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
          <path
            d="M101 59 C87 40 66 43 67 55 C68 64 87 63 100 60"
            fill="none"
            stroke="#8A1C32"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M72 48 L88 58 M67 54 L84 61"
            stroke="#C92A47"
            strokeWidth="1.3"
            opacity="0.7"
            strokeLinecap="round"
          />

          {/* Right bow loop */}
          <path
            d="M114 58 C132 28 164 31 162 54 C160 71 132 69 116 62 Z"
            fill="#C92A47"
            fillOpacity="0.75"
            stroke="#4A1C26"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
          <path
            d="M119 59 C133 39 154 42 153 54 C152 63 132 63 120 60"
            fill="none"
            stroke="#8A1C32"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M148 47 L131 58 M152 54 L134 61"
            stroke="#8A1C32"
            strokeWidth="1.3"
            opacity="0.7"
            strokeLinecap="round"
          />

          {/* Center bow knot */}
          <path
            d="M103 52 C106 49 114 49 117 52 C119 56 118 64 115 66 C111 67 107 67 104 66 C101 64 101 56 103 52 Z"
            fill="#C92A47"
            stroke="#4A1C26"
            strokeWidth="1.8"
          />
          <path
            d="M107 53 L106 64 M112 52 L113 64"
            stroke="#8A1C32"
            strokeWidth="1.15"
            opacity="0.7"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 2: Pre-rendered 7 Watercolor Botanical Flower Atlas + 2D Transitions */
/* -------------------------------------------------------------------------- */

interface FlowerSpec {
  id: string;
  outerColor: string;
  midColor: string;
  innerColor: string;
  edgeColor: string;
  centerColor: string;
  stamenColor: string;
  petals: number;
  style: 'poppy' | 'rosette' | 'rose' | 'peony' | 'anemone' | 'camellia';
}

const FLOWER_SPECS: readonly FlowerSpec[] = [
  {
    id: 'coral-poppy',
    outerColor: '#E33E2B',
    midColor: '#F1684E',
    innerColor: '#F79A7E',
    edgeColor: '#A92216',
    centerColor: '#3A1E14',
    stamenColor: '#E9B84A',
    petals: 7,
    style: 'poppy',
  },
  {
    id: 'lavender-rosette',
    outerColor: '#8665C5',
    midColor: '#A689DA',
    innerColor: '#C8B5EA',
    edgeColor: '#5B3E94',
    centerColor: '#56398C',
    stamenColor: '#EFE097',
    petals: 9,
    style: 'rosette',
  },
  {
    id: 'buttercup-rose',
    outerColor: '#EFE097',
    midColor: '#F6EBB5',
    innerColor: '#FBF5D6',
    edgeColor: '#CBB25A',
    centerColor: '#CBB25A',
    stamenColor: '#9E822B',
    petals: 10,
    style: 'rose',
  },
  {
    id: 'sage-peony',
    outerColor: '#7B9A6E',
    midColor: '#9AB88D',
    innerColor: '#BDD4B2',
    edgeColor: '#526D47',
    centerColor: '#6E8961',
    stamenColor: '#EBD98C',
    petals: 11,
    style: 'peony',
  },
  {
    id: 'sky-anemone',
    outerColor: '#639CE0',
    midColor: '#88B7EC',
    innerColor: '#B8D7F7',
    edgeColor: '#376CB0',
    centerColor: '#1E4380',
    stamenColor: '#D6E8FC',
    petals: 8,
    style: 'anemone',
  },
  {
    id: 'mint-anemone',
    outerColor: '#B2DFCE',
    midColor: '#CBEBE0',
    innerColor: '#E5F7F0',
    edgeColor: '#6CA591',
    centerColor: '#487A6A',
    stamenColor: '#F7F3DF',
    petals: 8,
    style: 'anemone',
  },
  {
    id: 'ivory-camellia',
    outerColor: '#E5DDD3',
    midColor: '#F4F1EA',
    innerColor: '#FFFFFF',
    edgeColor: '#BFB2A4',
    centerColor: '#DDD2C4',
    stamenColor: '#DFB656',
    petals: 10,
    style: 'camellia',
  },
];

let cachedFlowerAtlas: HTMLCanvasElement[] | null = null;

function paintWatercolorPetal(
  ctx: CanvasRenderingContext2D,
  angle: number,
  length: number,
  width: number,
  outerColor: string,
  innerColor: string,
  edgeColor: string,
  notch: boolean,
  rand: () => number,
) {
  ctx.save();
  ctx.rotate(angle);

  const wobble1 = (rand() - 0.5) * 3.5;
  const wobble2 = (rand() - 0.5) * 3.5;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  if (notch) {
    ctx.bezierCurveTo(
      width * 0.65,
      -length * 0.25 + wobble1,
      width * 0.9,
      -length * 0.85,
      width * 0.22,
      -length * 0.96,
    );
    ctx.quadraticCurveTo(0, -length * 0.84, -width * 0.22, -length * 0.96);
    ctx.bezierCurveTo(
      -width * 0.9,
      -length * 0.85,
      -width * 0.65,
      -length * 0.25 + wobble2,
      0,
      0,
    );
  } else {
    ctx.bezierCurveTo(
      width * 0.72,
      -length * 0.28 + wobble1,
      width * 0.82,
      -length * 0.95,
      0,
      -length,
    );
    ctx.bezierCurveTo(
      -width * 0.82,
      -length * 0.95,
      -width * 0.72,
      -length * 0.28 + wobble2,
      0,
      0,
    );
  }
  ctx.closePath();

  const grad = ctx.createRadialGradient(0, -length * 0.2, 1, 0, -length * 0.55, length * 0.95);
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.68, outerColor);
  grad.addColorStop(1, edgeColor);

  ctx.globalAlpha = 0.68 + rand() * 0.2;
  ctx.fillStyle = grad;
  ctx.fill();

  // Watercolor drying-ring edge stain
  ctx.globalAlpha = 0.24;
  ctx.strokeStyle = edgeColor;
  ctx.lineWidth = 1.1;
  ctx.stroke();

  ctx.restore();
}

function getFlowerAtlas(): HTMLCanvasElement[] {
  if (cachedFlowerAtlas) return cachedFlowerAtlas;
  const sprites: HTMLCanvasElement[] = FLOWER_SPECS.map((spec, specIdx) => {
    const tile = document.createElement('canvas');
    tile.width = 96;
    tile.height = 96;
    const ctx = tile.getContext('2d');
    if (!ctx) return tile;

    const rand = mulberry32(4100 + specIdx * 97);
    const cx = 48;
    const cy = 48;
    ctx.translate(cx, cy);

    // Subtle soft watercolor bleed halo behind flower
    const halo = ctx.createRadialGradient(0, 0, 6, 0, 0, 44);
    halo.addColorStop(0, spec.midColor);
    halo.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, 44, 0, Math.PI * 2);
    ctx.fill();

    // Outer petals
    for (let i = 0; i < spec.petals; i += 1) {
      const a = (i / spec.petals) * Math.PI * 2 + (rand() - 0.5) * 0.14;
      const len = 32 + rand() * 7;
      const wid = spec.style === 'poppy' ? 23 + rand() * 4 : 18 + rand() * 4;
      paintWatercolorPetal(
        ctx,
        a,
        len,
        wid,
        spec.outerColor,
        spec.midColor,
        spec.edgeColor,
        spec.style === 'anemone',
        rand,
      );
    }

    // Mid cupped petals
    const midCount = Math.max(5, spec.petals - 2);
    for (let i = 0; i < midCount; i += 1) {
      const a = ((i + 0.5) / midCount) * Math.PI * 2 + (rand() - 0.5) * 0.18;
      const len = 22 + rand() * 5;
      const wid = 14 + rand() * 4;
      paintWatercolorPetal(
        ctx,
        a,
        len,
        wid,
        spec.midColor,
        spec.innerColor,
        spec.edgeColor,
        false,
        rand,
      );
    }

    // Species-specific center & botanical detailing
    if (spec.style === 'rose') {
      // Spiral inner folds
      ctx.globalAlpha = 0.72;
      ctx.strokeStyle = spec.edgeColor;
      ctx.lineWidth = 1.6;
      for (let s = 0; s < 5; s += 1) {
        const a0 = s * 1.25;
        ctx.beginPath();
        ctx.arc(Math.cos(a0) * 2.5, Math.sin(a0) * 2.5, 4 + s * 2.5, a0, a0 + 2.3);
        ctx.stroke();
      }
    } else {
      ctx.globalAlpha = 0.85;
      const cGrad = ctx.createRadialGradient(-1, -1, 1, 0, 0, 9.5);
      cGrad.addColorStop(0, spec.centerColor);
      cGrad.addColorStop(1, spec.edgeColor);
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(0, 0, spec.style === 'poppy' || spec.style === 'anemone' ? 8.5 : 6, 0, Math.PI * 2);
      ctx.fill();

      // Fuzzy stamen dot ring
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = spec.stamenColor;
      const dotCount = spec.style === 'poppy' || spec.style === 'anemone' ? 14 : 8;
      for (let d = 0; d < dotCount; d += 1) {
        const da = (d / dotCount) * Math.PI * 2 + rand() * 0.2;
        const dr = 5.5 + rand() * 4.5;
        ctx.beginPath();
        ctx.arc(Math.cos(da) * dr, Math.sin(da) * dr, 1.15 + rand() * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return tile;
  });

  cachedFlowerAtlas = sprites;
  return sprites;
}

interface VortexFlower {
  ring: number;
  angle: number;
  spriteIdx: number;
  scaleJitter: number;
  rotJitter: number;
  zOffset: number;
}

interface WaveFlower {
  xOffset: number;
  yRatio: number;
  scale: number;
  rotation: number;
  spin: number;
  spriteIdx: number;
  waveDelay: number;
}

function FlowerTransitionCanvas({
  onRevealTree,
  onComplete,
}: {
  onRevealTree: () => void;
  onComplete: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const revealedRef = useRef(false);
  const completedRef = useRef(false);
  const onRevealRef = useRef(onRevealTree);
  const onCompleteRef = useRef(onComplete);
  onRevealRef.current = onRevealTree;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const atlas = getFlowerAtlas();
    const rand = mulberry32(8821);

    // 7 concentric depth rings for Phase 2A
    const vortexFlowers: VortexFlower[] = [];
    for (let ring = 0; ring < 7; ring += 1) {
      const perRing = 12 + (ring % 3) * 2;
      for (let i = 0; i < perRing; i += 1) {
        vortexFlowers.push({
          ring,
          angle: (i / perRing) * Math.PI * 2 + ring * 0.35 + (rand() - 0.5) * 0.16,
          spriteIdx: Math.floor(rand() * atlas.length),
          scaleJitter: 0.82 + rand() * 0.42,
          rotJitter: rand() * Math.PI * 2,
          zOffset: ring * 0.34,
        });
      }
    }

    // 108 overlapping flower sprites for Phase 2B Left-to-Right Flower Wave
    const waveFlowers: WaveFlower[] = [];
    for (let i = 0; i < 108; i += 1) {
      waveFlowers.push({
        xOffset: (rand() - 0.5) * 0.42,
        yRatio: rand(),
        scale: 0.72 + rand() * 0.85,
        rotation: rand() * Math.PI * 2,
        spin: (rand() - 0.5) * 1.4,
        spriteIdx: Math.floor(rand() * atlas.length),
        waveDelay: (rand() - 0.5) * 0.18,
      });
    }

    let width = 1;
    let height = 1;
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(canvas);

    const TOTAL_MS = 2650;
    const startTime = performance.now();
    let rafId = 0;

    // Hard safety fallback in case tab is backgrounded
    const safetyTimer = window.setTimeout(() => {
      if (!revealedRef.current) {
        revealedRef.current = true;
        onRevealRef.current();
      }
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current();
      }
    }, 3200);

    const drawFrame = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.48;
      const baseRadius = Math.min(width, height) * 0.25;

      // Phase 2A (0 -> 1450ms): 3D Circular Flower Wreath Vortex
      if (elapsed <= 1550) {
        const p2a = Math.min(1, elapsed / 1450);
        const vortexFade = elapsed > 1250 ? Math.max(0, 1 - (elapsed - 1250) / 300) : 1;

        const projected = vortexFlowers
          .map((f) => {
            // Advance depth z toward viewer
            const z = -1.65 + f.zOffset + p2a * 1.95;
            if (z < -2.1 || z > 1.05) return null;
            const persp = 1 / (1.2 - z);
            const spinDir = f.ring % 2 === 0 ? 1 : -1;
            const theta = f.angle + spinDir * p2a * 0.72;
            const r = baseRadius * persp;
            const x = cx + Math.cos(theta) * r;
            const y = cy + Math.sin(theta) * r;
            const size = 58 * persp * f.scaleJitter * (width < 420 ? 0.78 : 1);
            const depthAlpha =
              Math.min(1, (z + 2.0) * 0.85) *
              (z > 0.72 ? Math.max(0, 1 - (z - 0.72) / 0.33) : 1);
            return {
              z,
              x,
              y,
              size,
              rot: f.rotJitter + spinDir * p2a * 0.65,
              sprite: atlas[f.spriteIdx],
              alpha: depthAlpha * vortexFade * Math.min(1, elapsed / 180),
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null)
          .sort((a, b) => a.z - b.z);

        for (const item of projected) {
          if (item.alpha <= 0.01 || !item.sprite) continue;
          ctx.save();
          ctx.globalAlpha = item.alpha;
          ctx.translate(item.x, item.y);
          ctx.rotate(item.rot);
          ctx.drawImage(item.sprite, -item.size * 0.5, -item.size * 0.5, item.size, item.size);
          ctx.restore();
        }
      }

      // Phase 2B (1250ms -> 2600ms): Left-to-Right Cascading Flower Wave
      if (elapsed >= 1250) {
        const p2b = Math.min(1, (elapsed - 1250) / 1350);
        // Smooth easeInOutSine for wave travel from -18% to +122%
        const eased = -(Math.cos(Math.PI * p2b) - 1) / 2;
        const centerWaveRatio = -0.18 + eased * 1.42;

        // Soft blush watercolor wash band moving with the wave
        const washLeft = (centerWaveRatio - 0.38) * width;
        const washRight = (centerWaveRatio + 0.24) * width;
        const washGrad = ctx.createLinearGradient(washLeft, 0, washRight, 0);
        washGrad.addColorStop(0, 'rgba(253, 232, 236, 0)');
        washGrad.addColorStop(0.32, 'rgba(253, 232, 236, 0.88)');
        washGrad.addColorStop(0.65, 'rgba(249, 205, 215, 0.92)');
        washGrad.addColorStop(1, 'rgba(249, 205, 215, 0)');
        ctx.fillStyle = washGrad;
        ctx.fillRect(0, 0, width, height);

        const baseSpritePx = Math.max(76, Math.min(118, width * 0.22));
        const endFade = p2b > 0.85 ? Math.max(0, 1 - (p2b - 0.85) / 0.15) : 1;

        for (const wf of waveFlowers) {
          const y = wf.yRatio * height;
          const organicCurve = Math.sin(wf.yRatio * Math.PI * 2.1 + p2b * 2.5) * 0.085;
          const x = (centerWaveRatio + wf.xOffset + organicCurve + wf.waveDelay) * width;
          if (x < -baseSpritePx || x > width + baseSpritePx) continue;
          const sprite = atlas[wf.spriteIdx];
          if (!sprite) continue;
          const size = baseSpritePx * wf.scale;
          ctx.save();
          ctx.globalAlpha = 0.94 * endFade;
          ctx.translate(x, y);
          ctx.rotate(wf.rotation + wf.spin * p2b);
          ctx.drawImage(sprite, -size * 0.5, -size * 0.5, size, size);
          ctx.restore();
        }
      }

      if (elapsed >= 1580 && !revealedRef.current) {
        revealedRef.current = true;
        onRevealRef.current();
      }

      if (elapsed >= TOTAL_MS) {
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current();
        }
        return;
      }

      rafId = window.requestAnimationFrame(drawFrame);
    };

    rafId = window.requestAnimationFrame(drawFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(safetyTimer);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[560px] overflow-hidden sm:h-[620px]">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="h-full w-full"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 3: Living Blooming Heart-Balloon Tree Stage                          */
/* -------------------------------------------------------------------------- */

interface HeartBalloon {
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  size: number;
  color: string;
  tilt: number;
  bobPhase: number;
  bobSpeed: number;
  depth: number;
  bloomDelay: number;
}

interface FloatingHeartPetal {
  x: number;
  y: number;
  size: number;
  color: string;
  speedY: number;
  driftPhase: number;
  rot: number;
}

const BALLOON_PALETTE = [
  '#D95874', // deep rose
  '#E87662', // coral
  '#F2A2B0', // blush
  '#E9B84A', // honey gold
  '#F6D88C', // pale champagne
];

const BRANCH_TIPS: ReadonlyArray<[number, number]> = [
  [180, 185],
  [156, 152],
  [206, 152],
  [124, 128],
  [164, 114],
  [198, 116],
  [238, 128],
];

function createHeartCanopyData(): {
  balloons: HeartBalloon[];
  petals: FloatingHeartPetal[];
} {
  const rand = mulberry32(9517);
  const balloons: HeartBalloon[] = [];

  for (let i = 0; i < 70; i += 1) {
    // Parametric heart curve sampled strictly inside:
    // hx(t) = 16 sin^3(t), hy(t) = -(13 cos t - 5 cos 2t - 2 cos 3t - cos 4t)
    const t = (i / 70) * Math.PI * 2 + (rand() - 0.5) * 0.14;
    // Bias radial fill slightly outward so the heart contour is sharp & unmistakable
    const radial = 0.22 + 0.78 * Math.pow(rand(), 0.52);
    const hx = 16 * Math.pow(Math.sin(t), 3) * radial;
    const hy =
      -(
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      ) * radial;

    const x = 180 + hx * 7.15 + (rand() - 0.5) * 6;
    const y = 128 + hy * 6.75 + (rand() - 0.5) * 6;

    // Nearest branch fork tip for curved tether string
    let bestAnchor = BRANCH_TIPS[0];
    let bestDist = Infinity;
    for (const tip of BRANCH_TIPS) {
      const dx = x - tip[0];
      const dy = y - tip[1];
      const d = dx * dx + dy * dy;
      if (d < bestDist) {
        bestDist = d;
        bestAnchor = tip;
      }
    }

    const depth = rand();
    balloons.push({
      x,
      y,
      anchorX: bestAnchor[0] + (rand() - 0.5) * 8,
      anchorY: bestAnchor[1] + (rand() - 0.5) * 6,
      size: 11.5 + depth * 7.5,
      color: BALLOON_PALETTE[Math.floor(rand() * BALLOON_PALETTE.length)] ?? '#D95874',
      tilt: (rand() - 0.5) * 0.42,
      bobPhase: rand() * Math.PI * 2,
      bobSpeed: 1.2 + rand() * 0.9,
      depth,
      bloomDelay: Math.max(0, (245 - y) / 210) * 520 + rand() * 180,
    });
  }

  balloons.sort((a, b) => a.depth - b.depth);

  const petals: FloatingHeartPetal[] = [];
  for (let i = 0; i < 10; i += 1) {
    petals.push({
      x: 56 + rand() * 248,
      y: 42 + rand() * 260,
      size: 4.5 + rand() * 3.5,
      color: BALLOON_PALETTE[Math.floor(rand() * BALLOON_PALETTE.length)] ?? '#F2A2B0',
      speedY: 7 + rand() * 6,
      driftPhase: rand() * Math.PI * 2,
      rot: (rand() - 0.5) * 0.7,
    });
  }

  return { balloons, petals };
}

function drawGlossyHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  tilt: number,
  color: string,
  glossy: boolean,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  // Heart silhouette centered visually around (0, 0)
  const s = size;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.28);
  ctx.bezierCurveTo(s * 0.14, -s * 0.8, s * 0.98, -s * 0.8, s * 0.98, -s * 0.26);
  ctx.bezierCurveTo(s * 0.98, s * 0.16, s * 0.42, s * 0.44, 0, s * 0.7);
  ctx.bezierCurveTo(-s * 0.42, s * 0.44, -s * 0.98, s * 0.16, -s * 0.98, -s * 0.26);
  ctx.bezierCurveTo(-s * 0.98, -s * 0.8, -s * 0.14, -s * 0.8, 0, -s * 0.28);
  ctx.closePath();

  if (glossy) {
    const grad = ctx.createRadialGradient(-s * 0.34, -s * 0.36, s * 0.1, 0, 0, s * 1.15);
    grad.addColorStop(0, '#FFF8F4');
    grad.addColorStop(0.22, color);
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.fill();

    // Subtle warm shaded rim
    ctx.strokeStyle = 'rgba(74, 28, 38, 0.16)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Top-left glossy highlight crescent
    ctx.beginPath();
    ctx.ellipse(-s * 0.42, -s * 0.36, s * 0.19, s * 0.1, -0.55, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fill();
  } else {
    ctx.fillStyle = color;
    ctx.fill();
  }

  ctx.restore();
}

function HeartBalloonTreeStage({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canopyData = useMemo(() => createHeartCanopyData(), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 1;
    let height = 1;
    let dpr = 1;

    const syncSize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    syncSize();

    const renderScene = (elapsedMs: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Map 360x360 virtual space identically to SVG preserveAspectRatio="xMidYMax meet"
      const scale = Math.min(width / 360, height / 360);
      const offsetX = (width - 360 * scale) * 0.5;
      const offsetY = height - 360 * scale;
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY);

      const timeSec = reducedMotion ? 0 : elapsedMs / 1000;

      for (const b of canopyData.balloons) {
        const bloom = reducedMotion
          ? 1
          : Math.min(1, Math.max(0, (elapsedMs - b.bloomDelay) / 480));
        if (bloom <= 0.01) continue;
        // Soft spring-out easing
        const easedScale = 1 - Math.pow(1 - bloom, 3);
        const bobY = reducedMotion ? 0 : Math.sin(timeSec * b.bobSpeed + b.bobPhase) * 2;
        const bobX = reducedMotion ? 0 : Math.cos(timeSec * (b.bobSpeed * 0.7) + b.bobPhase) * 1.1;

        const bx = b.x + bobX;
        const by = b.y + bobY;

        // Curved tether string reaching toward walnut branch fork
        ctx.save();
        ctx.globalAlpha = 0.36 * easedScale;
        ctx.strokeStyle = '#6B4232';
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.moveTo(bx, by + b.size * 0.6 * easedScale);
        ctx.quadraticCurveTo(
          (bx + b.anchorX) * 0.5 + 4,
          (by + b.anchorY) * 0.5 + 8,
          b.anchorX,
          b.anchorY,
        );
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.94 * easedScale;
        drawGlossyHeart(
          ctx,
          bx,
          by,
          b.size * easedScale,
          b.tilt + (reducedMotion ? 0 : Math.sin(timeSec + b.bobPhase) * 0.04),
          b.color,
          true,
        );
        ctx.restore();
      }

      // 10 gentle drifting floating heart petals
      for (const p of canopyData.petals) {
        const yCycle = reducedMotion ? p.y : ((p.y + timeSec * p.speedY) % 315) + 18;
        const xDrift = reducedMotion ? p.x : p.x + Math.sin(timeSec * 0.9 + p.driftPhase) * 14;
        const edgeAlpha =
          yCycle < 48 ? (yCycle - 18) / 30 : yCycle > 290 ? Math.max(0, (333 - yCycle) / 43) : 1;

        ctx.save();
        ctx.globalAlpha = 0.58 * Math.max(0, edgeAlpha);
        drawGlossyHeart(
          ctx,
          xDrift,
          yCycle,
          p.size,
          p.rot + (reducedMotion ? 0 : Math.sin(timeSec * 1.1 + p.driftPhase) * 0.25),
          p.color,
          false,
        );
        ctx.restore();
      }
    };

    renderScene(reducedMotion ? 1000 : 0);

    const ro = new ResizeObserver(() => {
      syncSize();
      if (reducedMotion) renderScene(1000);
    });
    ro.observe(canvas);

    if (reducedMotion) {
      return () => {
        ro.disconnect();
      };
    }

    const start = performance.now();
    let rafId = 0;
    const tick = (now: number) => {
      renderScene(now - start);
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [canopyData, reducedMotion]);

  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[420px] sm:h-[360px]">
      {/* Organic dark-walnut trunk & forked branches (Inline SVG) */}
      <svg
        viewBox="0 0 360 360"
        preserveAspectRatio="xMidYMax meet"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {/* Soft earth ground shadow */}
        <ellipse cx="180" cy="352" rx="46" ry="5.5" fill="#C7B6A4" opacity="0.34" />

        {/* Main trunk & primary forks */}
        <path
          d="M174 352 C176 312 177 265 178 224 C178 205 168 182 156 152"
          fill="none"
          stroke="#4A2B20"
          strokeWidth="12"
          strokeLinecap="round"
          className={reducedMotion ? '' : 'webzy-family-trunk-draw'}
        />
        <path
          d="M186 352 C184 312 183 265 182 224 C182 204 192 182 206 152"
          fill="none"
          stroke="#4A2B20"
          strokeWidth="11"
          strokeLinecap="round"
          className={reducedMotion ? '' : 'webzy-family-trunk-draw'}
        />
        {/* Central upper trunk fill */}
        <path
          d="M180 352 L180 185"
          fill="none"
          stroke="#4A2B20"
          strokeWidth="10"
          strokeLinecap="round"
          className={reducedMotion ? '' : 'webzy-family-trunk-draw'}
        />
        {/* Secondary forked branches */}
        <path
          d="M168 184 C150 164 138 148 124 128"
          fill="none"
          stroke="#4A2B20"
          strokeWidth="5.5"
          strokeLinecap="round"
          className={reducedMotion ? '' : 'webzy-family-branch-draw'}
        />
        <path
          d="M174 168 C170 144 167 130 164 114"
          fill="none"
          stroke="#4A2B20"
          strokeWidth="5"
          strokeLinecap="round"
          className={reducedMotion ? '' : 'webzy-family-branch-draw'}
        />
        <path
          d="M187 168 C192 145 195 130 198 116"
          fill="none"
          stroke="#4A2B20"
          strokeWidth="5"
          strokeLinecap="round"
          className={reducedMotion ? '' : 'webzy-family-branch-draw'}
        />
        <path
          d="M192 184 C210 164 224 148 238 128"
          fill="none"
          stroke="#4A2B20"
          strokeWidth="5.5"
          strokeLinecap="round"
          className={reducedMotion ? '' : 'webzy-family-branch-draw'}
        />

        {/* Warm bark highlight pass */}
        <path
          d="M178 346 C179 306 179 258 179 216 C177 195 169 175 159 154"
          fill="none"
          stroke="#6B4232"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.85"
          className={reducedMotion ? '' : 'webzy-family-branch-draw'}
        />
        <path
          d="M183 224 C187 202 195 180 205 156"
          fill="none"
          stroke="#6B4232"
          strokeWidth="2.6"
          strokeLinecap="round"
          opacity="0.8"
          className={reducedMotion ? '' : 'webzy-family-branch-draw'}
        />
      </svg>

      {/* 70 Glossy 3D Heart Balloons & Floating Petals Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Adaptive Heirloom Keepsake Decorations & Photo Layouts                     */
/* -------------------------------------------------------------------------- */

function WaxSealAndOliveSprigSvg({
  initialChar,
  label,
  isHindi = false,
  langSafe,
}: {
  initialChar: string;
  label: string;
  isHindi?: boolean;
  langSafe?: React.CSSProperties;
}) {
  return (
    <div className="mx-auto flex flex-col items-center py-2">
      <svg
        viewBox="0 0 220 96"
        className="h-auto w-[196px]"
        aria-hidden="true"
      >
        {/* Left & right hand-sketched olive sprigs */}
        <path
          d="M84 52 C62 56 42 54 22 46"
          fill="none"
          stroke="#627852"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <ellipse cx="64" cy="46" rx="7" ry="3.2" transform="rotate(-24 64 46)" fill="#7B9A6E" opacity="0.8" />
        <ellipse cx="48" cy="59" rx="7" ry="3.2" transform="rotate(18 48 59)" fill="#7B9A6E" opacity="0.75" />
        <ellipse cx="36" cy="44" rx="6.5" ry="3" transform="rotate(-22 36 44)" fill="#8CA97F" opacity="0.8" />
        <ellipse cx="22" cy="46" rx="5.5" ry="2.6" transform="rotate(-10 22 46)" fill="#7B9A6E" opacity="0.85" />

        <path
          d="M136 52 C158 56 178 54 198 46"
          fill="none"
          stroke="#627852"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <ellipse cx="156" cy="46" rx="7" ry="3.2" transform="rotate(24 156 46)" fill="#7B9A6E" opacity="0.8" />
        <ellipse cx="172" cy="59" rx="7" ry="3.2" transform="rotate(-18 172 59)" fill="#7B9A6E" opacity="0.75" />
        <ellipse cx="184" cy="44" rx="6.5" ry="3" transform="rotate(22 184 44)" fill="#8CA97F" opacity="0.8" />
        <ellipse cx="198" cy="46" rx="5.5" ry="2.6" transform="rotate(10 198 46)" fill="#7B9A6E" opacity="0.85" />

        {/* Organic melted crimson wax seal */}
        <path
          d="M110 20 C123 19 135 28 137 40 C139 53 132 68 119 72 C107 76 92 71 86 60 C80 48 84 31 95 24 C100 21 105 20 110 20 Z"
          fill="#9E1D33"
          stroke="#6E1122"
          strokeWidth="1.6"
        />
        <circle
          cx="110"
          cy="47"
          r="18.5"
          fill="#B0243C"
          stroke="#7A1326"
          strokeWidth="1.3"
        />
        <circle
          cx="110"
          cy="47"
          r="15"
          fill="none"
          stroke="#E5B7B8"
          strokeWidth="0.9"
          strokeDasharray="2 2.5"
          opacity="0.7"
        />
        <text
          x="110"
          y="53"
          textAnchor="middle"
          fill="#FAF4EC"
          fontSize="17"
          fontStyle={isHindi ? 'normal' : 'italic'}
          fontFamily="Georgia, serif"
        >
          {initialChar}
        </text>
      </svg>
      <span
        className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#8C7A72]"
        style={langSafe}
      >
        {label}
      </span>
    </div>
  );
}

function PressedSageLeafCornerSvg() {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-3 -right-3 h-14 w-14 rotate-[8deg] drop-shadow-xs"
    >
      <path d="M12 52 C24 38 38 22 54 10" stroke="#5B724D" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse cx="26" cy="34" rx="9" ry="4" transform="rotate(-55 26 34)" fill="#7B9A6E" opacity="0.88" />
      <ellipse cx="38" cy="40" rx="8.5" ry="3.8" transform="rotate(-12 38 40)" fill="#8CA97F" opacity="0.84" />
      <ellipse cx="42" cy="21" rx="8" ry="3.5" transform="rotate(-62 42 21)" fill="#7B9A6E" opacity="0.88" />
      <ellipse cx="51" cy="24" rx="7" ry="3.2" transform="rotate(-16 51 24)" fill="#9AB88D" opacity="0.82" />
    </svg>
  );
}

function VintagePhotoCorners() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1 top-1 z-10 h-3 w-3 border-l-2 border-t-2 border-[#B89F84]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-1 top-1 z-10 h-3 w-3 border-r-2 border-t-2 border-[#B89F84]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1 left-1 z-10 h-3 w-3 border-b-2 border-l-2 border-[#B89F84]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1 right-1 z-10 h-3 w-3 border-b-2 border-r-2 border-[#B89F84]"
      />
    </>
  );
}

interface PhotoItem {
  url: string;
  originalIdx: number;
}

function HeirloomPhotoKeepsakes({
  photos,
  senderInitial,
  waxLabel,
  isHindi,
  langSafe,
  onPhotoError,
  onOpenPhoto,
}: {
  photos: PhotoItem[];
  senderInitial: string;
  waxLabel: string;
  isHindi: boolean;
  langSafe?: React.CSSProperties;
  onPhotoError: (url: string) => void;
  onOpenPhoto?: (idx: number) => void;
}) {
  if (photos.length === 0) {
    return (
      <WaxSealAndOliveSprigSvg
        initialChar={senderInitial}
        label={waxLabel}
        isHindi={isHindi}
        langSafe={langSafe}
      />
    );
  }

  if (photos.length === 1) {
    const item = photos[0];
    return (
      <div className="mx-auto w-full max-w-[240px]">
        <button
          type="button"
          onClick={() => onOpenPhoto?.(item.originalIdx)}
          aria-label="Open keepsake photo 1"
          className="group relative block min-h-[44px] w-full rounded-t-full border border-[#D4BFA8] bg-[#FCF9F2] p-2.5 shadow-[0_12px_28px_-14px_rgba(74,28,38,0.28)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A1C32]"
        >
          <div className="aspect-[4/5] w-full overflow-hidden rounded-t-full border border-[#E6D9C8] bg-[#EFE8DC]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt="Keepsake memory 1"
              onError={() => onPhotoError(item.url)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <PressedSageLeafCornerSvg />
        </button>
      </div>
    );
  }

  if (photos.length === 2) {
    return (
      <div className="mx-auto grid w-full max-w-[440px] grid-cols-2 gap-3 sm:gap-5">
        {photos.map((item, idx) => (
          <button
            key={`${item.url.slice(0, 24)}-${item.originalIdx}`}
            type="button"
            onClick={() => onOpenPhoto?.(item.originalIdx)}
            aria-label={`Open keepsake photo ${idx + 1}`}
            className={`group relative min-h-[44px] min-w-0 border border-[#DFD2C0] bg-[#FCF9F2] p-2 pb-4 shadow-[0_10px_24px_-14px_rgba(74,28,38,0.24)] transition-transform duration-300 hover:z-10 hover:rotate-0 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A1C32] ${
              idx === 0 ? '-rotate-[1.5deg]' : 'rotate-[1.5deg]'
            }`}
          >
            <div className="aspect-[4/5] w-full overflow-hidden bg-[#EFE8DC]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={`Keepsake memory ${idx + 1}`}
                onError={() => onPhotoError(item.url)}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (photos.length === 3) {
    const [lead, second, third] = photos;
    return (
      <div className="mx-auto flex w-full max-w-[440px] flex-col gap-3">
        <button
          type="button"
          onClick={() => onOpenPhoto?.(lead.originalIdx)}
          aria-label="Open keepsake photo 1"
          className="group relative min-h-[44px] w-full border border-[#DFD2C0] bg-[#FCF9F2] p-2 pb-3 shadow-[0_10px_24px_-14px_rgba(74,28,38,0.24)] transition-transform duration-300 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A1C32]"
        >
          <div className="aspect-[16/10] w-full overflow-hidden bg-[#EFE8DC]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lead.url}
              alt="Keepsake memory 1"
              onError={() => onPhotoError(lead.url)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        </button>

        <div className="grid grid-cols-2 gap-3">
          {[second, third].map((item, idx) => (
            <button
              key={`${item.url.slice(0, 24)}-${item.originalIdx}`}
              type="button"
              onClick={() => onOpenPhoto?.(item.originalIdx)}
              aria-label={`Open keepsake photo ${idx + 2}`}
              className="group relative min-h-[44px] min-w-0 border border-[#DFD2C0] bg-[#FCF9F2] p-2 pb-3 shadow-[0_10px_24px_-14px_rgba(74,28,38,0.22)] transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A1C32]"
            >
              <div className="aspect-square w-full overflow-hidden bg-[#EFE8DC]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={`Keepsake memory ${idx + 2}`}
                  onError={() => onPhotoError(item.url)}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 4+ photos -> 2x2 heirloom grid with subtle vintage triangular photo corners
  return (
    <div className="mx-auto grid w-full max-w-[440px] grid-cols-2 gap-3 sm:gap-4">
      {photos.slice(0, 4).map((item, idx) => (
        <button
          key={`${item.url.slice(0, 24)}-${item.originalIdx}`}
          type="button"
          onClick={() => onOpenPhoto?.(item.originalIdx)}
          aria-label={`Open keepsake photo ${idx + 1}`}
          className="group relative min-h-[44px] min-w-0 border border-[#DFD2C0] bg-[#FCF9F2] p-2 shadow-[0_10px_24px_-14px_rgba(74,28,38,0.22)] transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A1C32]"
        >
          <VintagePhotoCorners />
          <div className="aspect-square w-full overflow-hidden bg-[#EFE8DC]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={`Keepsake memory ${idx + 1}`}
              onError={() => onPhotoError(item.url)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Theme Component: BirthdayFamilyTheme                                  */
/* -------------------------------------------------------------------------- */

export function BirthdayFamilyTheme({
  data,
  language,
  onOpened,
  onOpenPhoto,
}: BirthdayThemeComponentProps) {
  const reducedMotion = useBirthdayReducedMotion();
  const coreLang = toCoreLanguageCode(language);
  const copy = BIRTHDAY_THEMES_COPY[coreLang]?.family ?? BIRTHDAY_THEMES_COPY.en.family;
  const replayLabel = BIRTHDAY_THEMES_COPY[coreLang]?.replay ?? BIRTHDAY_THEMES_COPY.en.replay;

  const [scene, setScene] = useState<FamilyScene>('gift');
  const [isOpeningLid, setIsOpeningLid] = useState(false);
  const [showTree, setShowTree] = useState(false);
  const [failedPhotos, setFailedPhotos] = useState<Record<string, boolean>>({});
  const openTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (openTimerRef.current !== null) {
        window.clearTimeout(openTimerRef.current);
      }
    };
  }, []);

  // Preserve original index against raw valid photo array so BirthdayPhotoLightbox maps cleanly
  const rawValidPhotos = useMemo(() => getValidPhotos(data.photos), [data.photos]);
  const visiblePhotos = useMemo<PhotoItem[]>(
    () =>
      rawValidPhotos
        .map((url, originalIdx) => ({ url, originalIdx }))
        .filter((item) => !failedPhotos[item.url]),
    [rawValidPhotos, failedPhotos],
  );

  const messageText = pickLocalizedText(data.message, language);
  const receiverName = data.receiverName?.trim() || 'You';
  const senderName = data.senderName?.trim() || 'Family';
  const senderInitial = (Array.from(senderName)[0] || 'W').toUpperCase();
  const isHindi = language === 'hi';
  const langSafe = hiSafeStyle(language);

  function handleOpenGift() {
    if (scene !== 'gift' || isOpeningLid) return;
    setIsOpeningLid(true);
    playLanternPullChime();
    onOpened?.();

    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
    }

    openTimerRef.current = window.setTimeout(() => {
      if (reducedMotion) {
        setShowTree(true);
        setScene('tree');
      } else {
        setShowTree(false);
        setScene('transition');
      }
      setIsOpeningLid(false);
      openTimerRef.current = null;
    }, reducedMotion ? 80 : 250);
  }

  function handleReplay() {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    setIsOpeningLid(false);
    setShowTree(false);
    setScene('gift');
  }

  function handlePhotoError(url: string) {
    setFailedPhotos((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
  }

  return (
    <div
      className="relative flex min-h-full w-full flex-col overflow-x-hidden text-[#3D2322]"
      style={{
        background:
          'radial-gradient(circle at 50% 42%, #FAF7F0 0%, #F6F2E9 65%, #EAE3D5 100%)',
      }}
    >
      <style>{`
        @keyframes webzy-family-trunk-draw {
          from { stroke-dasharray: 280; stroke-dashoffset: 280; }
          to { stroke-dasharray: 280; stroke-dashoffset: 0; }
        }
        @keyframes webzy-family-branch-draw {
          from { stroke-dasharray: 180; stroke-dashoffset: 180; }
          to { stroke-dasharray: 180; stroke-dashoffset: 0; }
        }
        @keyframes webzy-family-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .webzy-family-trunk-draw {
          animation: webzy-family-trunk-draw 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .webzy-family-branch-draw {
          animation: webzy-family-branch-draw 0.95s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
        }
        .webzy-family-fade-up {
          animation: webzy-family-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .webzy-family-trunk-draw,
          .webzy-family-branch-draw,
          .webzy-family-fade-up {
            animation: none !important;
          }
        }
      `}</style>

      <AtmosphericGrainOverlay opacity={0.045} />

      {/* Quiet top-right Replay control */}
      {scene === 'tree' ? (
        <div className="relative z-20 flex w-full justify-end px-4 pt-3 sm:px-6">
          <button
            type="button"
            onClick={handleReplay}
            className="inline-flex min-h-[44px] items-center rounded-full px-3 text-xs font-medium tracking-wide text-[#7D6660] transition-colors hover:bg-[#4A1C26]/5 hover:text-[#4A1C26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A1C32]"
            style={langSafe}
          >
            {replayLabel}
          </button>
        </div>
      ) : null}

      {/* Scene 1: Quiet Minimalist Gift Box — ONLY Box + 2 Lines */}
      {scene === 'gift' || (scene === 'transition' && !showTree) ? (
        <div
          className={`relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-12 text-center transition-opacity duration-700 ${
            scene === 'transition' ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <button
            type="button"
            onClick={handleOpenGift}
            aria-label={`${copy.forYouPrefix} ${receiverName}. ${copy.tapToOpen}`}
            className="group flex min-h-[44px] min-w-0 max-w-full cursor-pointer flex-col items-center rounded-2xl p-4 transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A1C32]"
          >
            <PencilGiftBoxSvg isOpening={isOpeningLid} />
            <p
              className="mt-5 max-w-full break-words font-handwritten text-2xl text-[#7E182B] sm:text-3xl"
              style={langSafe}
            >
              {copy.forYouPrefix} {receiverName}.
            </p>
            <p className="mt-1.5 text-xs tracking-wide text-[#8C7A72]" style={langSafe}>
              {copy.tapToOpen}
            </p>
          </button>
        </div>
      ) : null}

      {/* Scene 2: 2D Canvas Flower Atlas — 3D Circular Vortex -> L-to-R Flower Wave */}
      {scene === 'transition' ? (
        <FlowerTransitionCanvas
          onRevealTree={() => setShowTree(true)}
          onComplete={() => {
            setShowTree(true);
            setScene('tree');
          }}
        />
      ) : null}

      {/* Scene 3: Living Blooming Heart-Balloon Tree + Wishes & Heirloom Keepsakes */}
      {showTree || scene === 'tree' ? (
        <main className="relative z-10 mx-auto flex w-full max-w-[600px] flex-1 flex-col items-center px-4 pb-8 pt-1 sm:px-6">
          <HeartBalloonTreeStage reducedMotion={reducedMotion} />

          {/* Editorial Calligraphic Headline */}
          <header className="webzy-family-fade-up mt-3 w-full min-w-0 text-center">
            <p
              className={`${
                isHindi ? 'font-handwritten' : 'font-royal-script'
              } text-2xl text-[#8A1C32] sm:text-3xl`}
              style={langSafe}
            >
              {copy.foreverAndAlways}
            </p>
            <h1
              className="mt-1 break-words font-romance text-3xl font-semibold leading-tight text-[#A81C2E] sm:text-4xl"
              style={langSafe}
            >
              {copy.happyBirthday} {receiverName}
            </h1>
          </header>

          {/* Warm Cotton Stationery Letter */}
          <section
            aria-label="Birthday letter"
            className="webzy-family-fade-up mt-5 w-full min-w-0 max-w-[460px] border-y border-[#DFD2C0]/80 px-2 py-5 sm:px-4"
          >
            <p
              className="break-words font-literary text-[15px] font-medium text-[#5A262B]"
              style={langSafe}
            >
              {copy.dearPrefix} {receiverName},
            </p>
            <p
              className="mt-2.5 whitespace-pre-line break-words font-literary text-[15px] leading-relaxed text-[#3D2322]"
              style={langSafe}
            >
              {messageText}
            </p>
            <p
              className="mt-4 break-words text-right font-handwritten text-xl text-[#7E182B] sm:text-2xl"
              style={langSafe}
            >
              {copy.signedPrefix} {senderName}
            </p>
          </section>

          {/* Adaptive Heirloom Photo Keepsakes (0, 1, 2, 3, 4+) */}
          <section
            aria-label="Keepsake photos"
            className="webzy-family-fade-up mt-6 w-full min-w-0"
          >
            <HeirloomPhotoKeepsakes
              photos={visiblePhotos}
              senderInitial={senderInitial}
              waxLabel={copy.waxInitialLabel}
              isHindi={isHindi}
              langSafe={langSafe}
              onPhotoError={handlePhotoError}
              onOpenPhoto={onOpenPhoto}
            />
          </section>
        </main>
      ) : null}
    </div>
  );
}
