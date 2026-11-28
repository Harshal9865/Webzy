'use client';

import React, { useId } from 'react';

/** Lightweight inline SVG film/paper grain texture to add tactile depth without external assets. */
export function AtmosphericGrainOverlay({
  opacity = 0.06,
  className = '',
}: {
  opacity?: number;
  className?: string;
}) {
  const filterId = `grain-${useId().replace(/:/g, '')}`;
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
    >
      <filter id={filterId}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.78"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} />
    </svg>
  );
}

let sharedCraftAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (sharedCraftAudioCtx && sharedCraftAudioCtx.state !== 'closed') {
    if (sharedCraftAudioCtx.state === 'suspended') {
      void sharedCraftAudioCtx.resume().catch(() => {});
    }
    return sharedCraftAudioCtx;
  }
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  try {
    sharedCraftAudioCtx = new AudioCtx();
    return sharedCraftAudioCtx;
  } catch {
    return null;
  }
}

function scheduleTone(
  ctx: AudioContext,
  freq: number,
  startOffsetSec: number,
  durationSec: number,
  peakGain: number,
  type: OscillatorType = 'sine',
) {
  const now = ctx.currentTime + startOffsetSec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + durationSec + 0.03);
}

/** Warm brass bell + celesta triad when pulling the Birthday sky lantern cord. */
export function playLanternPullChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      scheduleTone(ctx, freq, idx * 0.075, 0.55, 0.045, idx % 2 === 0 ? 'triangle' : 'sine');
    });
  } catch {
    // Silent fallback when Web Audio is restricted
  }
}

/** Soft candle puff + optional sparkling major-9th birthday chime when all candles are blown out. */
export function playCandleBlowSfx(allOut: boolean) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    // Soft breathy puff using filtered short white noise
    const bufferSize = Math.floor(ctx.sampleRate * 0.18);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, ctx.currentTime);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.06, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.17);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();

    if (allOut) {
      [523.25, 659.25, 783.99, 987.77, 1174.66].forEach((freq, idx) => {
        scheduleTone(ctx, freq, 0.09 + idx * 0.08, 0.72, 0.048, 'sine');
      });
    } else {
      scheduleTone(ctx, 587.33, 0.05, 0.25, 0.032, 'sine');
    }
  } catch {
    // Silent fallback
  }
}

/** Gentle raindrop kalimba pluck for midnight apology slide transitions & calm gestures. */
export function playRaindropPluck(step = 0) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const scale = [392.0, 440.0, 493.88, 587.33, 659.25];
    const primary = scale[Math.abs(step) % scale.length];
    scheduleTone(ctx, primary, 0, 0.42, 0.038, 'sine');
    scheduleTone(ctx, primary * 1.5, 0.07, 0.36, 0.022, 'triangle');
  } catch {
    // Silent fallback
  }
}

/** Crisp stationery unseal tap + uplifting chime for envelopes & jar tickets. */
export function playPaperUnsealSfx(step = 0) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0];
    const base = scale[Math.abs(step) % scale.length];
    scheduleTone(ctx, base, 0, 0.18, 0.038, 'triangle');
    scheduleTone(ctx, base * 1.25, 0.055, 0.32, 0.035, 'sine');
  } catch {
    // Silent fallback
  }
}

/** Crisp 2px reading/story progress hairline pinned inside active story stages. */
export function ReadingProgressHairline({
  progressPct,
  color,
  trackClassName = 'bg-white/10',
}: {
  progressPct: number;
  color: string;
  trackClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(progressPct)));
  return (
    <div
      aria-hidden="true"
      className={`h-[2px] w-full overflow-hidden rounded-full ${trackClassName}`}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}

/** Perforated illustrated SVG airmail stamp for keepsake letters & cover postcards. */
export function AirmailPostageStamp({
  label,
  code,
  initials,
  accentColor,
}: {
  label: string;
  code: string;
  initials: string;
  accentColor: string;
}) {
  const safeInitials = initials.trim().slice(0, 2).toUpperCase() || 'W';
  return (
    <div
      aria-hidden="true"
      className="relative inline-flex select-none flex-col items-center justify-between rounded-[6px] border border-dashed px-2.5 py-2 text-center shadow-xs"
      style={{
        borderColor: `${accentColor}66`,
        backgroundColor: '#FFFDF7',
        minWidth: '64px',
      }}
    >
      <span
        className="font-mono text-[7.5px] font-bold uppercase tracking-[0.16em]"
        style={{ color: accentColor }}
      >
        {label.slice(0, 14)}
      </span>
      <span
        className="my-0.5 flex h-7 w-7 items-center justify-center rounded-full font-editorial text-base font-bold italic"
        style={{
          backgroundColor: `${accentColor}16`,
          color: accentColor,
        }}
      >
        {safeInitials}
      </span>
      <span className="font-mono text-[8px] font-bold tracking-[0.12em] text-stone-500">
        {code}
      </span>
    </div>
  );
}
