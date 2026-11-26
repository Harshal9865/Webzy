'use client';

import React, { useEffect, useRef, useState } from 'react';
import { type LanguageCode } from '@webzy/core';
import type { ThemeDemoPayload, ThemeManifest } from '../../schema';

export interface OccasionSiteProps {
  manifest: ThemeManifest;
  data: ThemeDemoPayload;
  language: LanguageCode;
  watermarked?: boolean;
  onOpened?: () => void;
}

export function getWebzyFooterLabel(language: LanguageCode): string {
  if (language === 'hi') return 'Webzy से बना · अपना बनाओ';
  if (language === 'hinglish') return 'Made with Webzy · Apna banao';
  return 'Made with Webzy · Create yours';
}

export function getReplayLabel(language: LanguageCode): string {
  if (language === 'hi') return 'फिर से खोलें';
  if (language === 'hinglish') return 'Phir se kholo';
  return 'Replay Cover';
}

interface OccasionArtworkBackdropProps {
  src: string;
  alt?: string;
  className?: string;
  fallbackGradient: string;
}

/** Renders optional generated theme artwork with graceful CSS gradient fallback if offline or missing. */
export function OccasionArtworkBackdrop({
  src,
  alt = '',
  className = 'object-cover object-center',
  fallbackGradient,
}: OccasionArtworkBackdropProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ background: fallbackGradient }}
      aria-hidden="true"
    >
      {!failed ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className={`h-full w-full ${className}`}
        />
      ) : null}
    </div>
  );
}

interface OccasionPhotoGalleryProps {
  photos?: string[];
  accentColor: string;
  surfaceTint?: string;
  captionPrefix?: string;
  variant?: 'polaroid' | 'heirloom';
}

/** Reusable tactile photo gallery strip with full-viewport lightbox zoom & 44px+ controls. */
export function OccasionPhotoGallery({
  photos,
  accentColor,
  surfaceTint = '#FFF5F8',
  captionPrefix = 'Memory',
  variant = 'polaroid',
}: OccasionPhotoGalleryProps) {
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);
  if (!photos || photos.length === 0) return null;
  const visiblePhotos = photos.slice(0, 3);
  const tilts = ['-rotate-2', 'rotate-1', '-rotate-1'];

  return (
    <>
      <div
        className={`mt-3 grid gap-2.5 ${
          visiblePhotos.length === 1
            ? 'mx-auto max-w-[210px] grid-cols-1'
            : visiblePhotos.length === 2
              ? 'grid-cols-2'
              : 'grid-cols-3'
        }`}
      >
        {visiblePhotos.map((src, idx) => (
          <button
            key={`${src.slice(0, 24)}-${idx}`}
            type="button"
            disabled={Boolean(failed[src])}
            onClick={() => !failed[src] && setZoomIdx(idx)}
            aria-label={`View photo ${idx + 1}`}
            className={`group relative flex flex-col overflow-hidden bg-white text-left transition-all duration-300 hover:z-10 hover:rotate-0 hover:scale-[1.03] active:scale-95 ${
              variant === 'polaroid'
                ? `rounded-xl border border-black/10 p-1.5 pb-5 shadow-[0_10px_24px_-12px_rgba(28,19,30,0.28)] ${tilts[idx % tilts.length]}`
                : 'rounded-2xl border-2 border-[#D97706]/35 p-1.5 pb-4 shadow-sm'
            }`}
          >
            {/* Translucent masking-tape corner flourish on polaroids */}
            {variant === 'polaroid' ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-1.5 left-1/2 h-3 w-10 -translate-x-1/2 rotate-[-3deg] rounded-[2px] opacity-65 shadow-xs"
                style={{ backgroundColor: `${accentColor}30` }}
              />
            ) : null}

            <div
              className="aspect-square w-full overflow-hidden rounded-lg flex items-center justify-center"
              style={{ backgroundColor: surfaceTint }}
            >
              {failed[src] ? (
                <svg
                  className="h-6 w-6 opacity-40"
                  style={{ color: accentColor }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={src}
                  alt={`${captionPrefix} ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                  onError={() => setFailed((prev) => ({ ...prev, [src]: true }))}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>

            <span className="mt-1.5 block truncate text-center font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-stone-500">
              {captionPrefix} 0{idx + 1}
            </span>
          </button>
        ))}
      </div>

      {zoomIdx !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomIdx(null)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-2.5 shadow-2xl animate-pop-bounce"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={visiblePhotos[zoomIdx]}
              alt={`Expanded ${captionPrefix.toLowerCase()} ${zoomIdx + 1}`}
              className="max-h-[68dvh] w-full rounded-xl object-contain bg-stone-50"
            />
            <div className="mt-2.5 flex items-center justify-between gap-2 px-1.5 pb-1 text-xs font-bold text-[#2B1B2E]">
              <span>
                {captionPrefix} {zoomIdx + 1} / {visiblePhotos.length}
              </span>
              <div className="flex items-center gap-1.5">
                {visiblePhotos.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setZoomIdx((prev) =>
                          prev === null ? 0 : (prev - 1 + visiblePhotos.length) % visiblePhotos.length,
                        )
                      }
                      className="min-h-[44px] rounded-xl border border-black/10 px-3.5 hover:bg-stone-50"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setZoomIdx((prev) => (prev === null ? 0 : (prev + 1) % visiblePhotos.length))
                      }
                      className="min-h-[44px] rounded-xl border border-black/10 px-3.5 hover:bg-stone-50"
                    >
                      Next
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => setZoomIdx(null)}
                  className="min-h-[44px] rounded-xl px-4 text-white shadow-xs"
                  style={{ backgroundColor: accentColor }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export interface OccasionChapterTab {
  id: string;
  label: string;
}

/** Multi-chapter navigation pill bar so every occasion mini-website works like a dedicated multi-page site. */
export function OccasionChapterNav({
  tabs,
  activeId,
  onSelect,
  accentColor,
  dark = false,
}: {
  tabs: readonly OccasionChapterTab[];
  activeId: string;
  onSelect: (id: string) => void;
  accentColor: string;
  dark?: boolean;
}) {
  return (
    <div
      role="tablist"
      aria-label="Website sections"
      className={`flex items-center gap-1.5 overflow-x-auto rounded-2xl p-1 scrollbar-none ${
        dark
          ? 'border border-white/15 bg-white/10 backdrop-blur-xs'
          : 'border border-black/10 bg-white/80 backdrop-blur-xs shadow-2xs'
      }`}
    >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.id)}
            className={`min-h-[38px] shrink-0 flex-1 whitespace-nowrap rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all active:scale-95 ${
              isActive
                ? 'text-white shadow-xs'
                : dark
                  ? 'text-white/75 hover:bg-white/10 hover:text-white'
                  : 'text-[#2B1B2E]/75 hover:bg-black/5 hover:text-[#2B1B2E]'
            }`}
            style={isActive ? { backgroundColor: accentColor } : undefined}
          >
            <span className="mr-1 opacity-65 font-mono text-[10px]">0{idx + 1}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** 35mm perforated dark filmstrip gallery directly inspired by birthday & keepsake reference layouts. */
export function OccasionFilmstripGallery({
  photos,
  fallbackImage,
  accentColor,
  caption = '35MM REEL',
  frameLabels = ['Frame 01', 'Frame 02', 'Frame 03'],
}: {
  photos?: string[];
  fallbackImage: string;
  accentColor: string;
  caption?: string;
  frameLabels?: string[];
}) {
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);
  const sources = photos && photos.length > 0 ? photos.slice(0, 3) : [fallbackImage];

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-[#2B1B2E]/25 bg-[#1B151A] px-2.5 py-2 shadow-[0_12px_28px_-14px_rgba(27,21,26,0.65)]">
        {/* Top sprocket perforations */}
        <div className="mb-1.5 flex items-center justify-between gap-1.5 px-1" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={`top-perf-${i}`} className="h-1.5 w-2.5 rounded-[2px] bg-[#FAF5EC]/80" />
          ))}
        </div>

        <div
          className={`grid gap-2 ${
            sources.length === 1
              ? 'grid-cols-1'
              : sources.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-3'
          }`}
        >
          {sources.map((src, idx) => (
            <button
              key={`film-${idx}`}
              type="button"
              onClick={() => !failed[src] && setZoomIdx(idx)}
              aria-label={`View film frame ${idx + 1}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-white/15 bg-black/50 transition hover:border-white/45 active:scale-95"
            >
              {!failed[src] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={src}
                  alt={frameLabels[idx] || `Frame ${idx + 1}`}
                  loading="lazy"
                  onError={() => setFailed((prev) => ({ ...prev, [src]: true }))}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-[10px] font-mono uppercase tracking-wider text-white/60"
                  style={{ backgroundColor: `${accentColor}30` }}
                >
                  {frameLabels[idx] || `Frame 0${idx + 1}`}
                </div>
              )}
              <span className="absolute bottom-1 left-1.5 rounded bg-black/65 px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-wider text-amber-200">
                0{idx + 1}A
              </span>
            </button>
          ))}
        </div>

        {/* Bottom sprocket perforations + reel code */}
        <div className="mt-1.5 flex items-center justify-between gap-1.5 px-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={`bot-perf-${i}`} className="h-1.5 w-2.5 rounded-[2px] bg-[#FAF5EC]/80" aria-hidden="true" />
          ))}
        </div>
        <p className="mt-1 text-center font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-amber-200/75">
          {caption}
        </p>
      </div>

      {zoomIdx !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomIdx(null)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-2.5 shadow-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sources[zoomIdx]}
              alt={frameLabels[zoomIdx] || `Frame ${zoomIdx + 1}`}
              className="max-h-[68dvh] w-full rounded-xl bg-stone-50 object-contain"
            />
            <div className="mt-2 flex items-center justify-between px-1 text-xs font-bold text-[#2B1B2E]">
              <span>{frameLabels[zoomIdx] || `Frame ${zoomIdx + 1}`}</span>
              <button
                type="button"
                onClick={() => setZoomIdx(null)}
                className="min-h-[40px] rounded-xl px-4 text-white"
                style={{ backgroundColor: accentColor }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

const MELODY_PRESETS: Record<
  'birthday' | 'romantic' | 'warm' | 'festive' | 'uplifting',
  number[]
> = {
  birthday: [523.25, 587.33, 659.25, 783.99, 880, 783.99],
  romantic: [392, 493.88, 587.33, 659.25, 587.33, 493.88],
  warm: [329.63, 392, 440, 523.25, 587.33, 523.25],
  festive: [440, 523.25, 587.33, 659.25, 783.99, 880],
  uplifting: [440, 554.37, 659.25, 880, 659.25, 554.37],
};

/**
 * Tactile clickable retro cassette widget (from birthday/picnic references)
 * generating a soft Web Audio music-box chime with zero external copyrighted audio.
 */
export function OccasionCassettePlayer({
  trackTitle,
  mood = 'birthday',
  tapLabel = 'Click to Play Chime',
  playingLabel = 'Playing Chime...',
  accentColor = '#E11D63',
}: {
  trackTitle: string;
  mood?: 'birthday' | 'romantic' | 'warm' | 'festive' | 'uplifting';
  tapLabel?: string;
  playingLabel?: string;
  accentColor?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handlePlayChime() {
    if (playing) {
      setPlaying(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    setPlaying(true);
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const notes = MELODY_PRESETS[mood] ?? MELODY_PRESETS.birthday;
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.24);
          gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.24);
          gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + idx * 0.24 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.24 + 0.36);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.24);
          osc.stop(ctx.currentTime + idx * 0.24 + 0.38);
        });
      }
    } catch {
      // Safe silent visual fallback when Web Audio is restricted
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPlaying(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handlePlayChime}
      aria-pressed={playing}
      className="group flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border border-[#2B1B2E]/20 bg-[#231C22] px-3.5 py-2.5 text-left text-white shadow-sm transition hover:border-white/30 active:scale-[0.99]"
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* Mini retro cassette spool */}
        <div
          className="flex h-10 w-16 shrink-0 items-center justify-around rounded-lg border border-white/20 px-1.5"
          style={{ backgroundColor: '#161116' }}
          aria-hidden="true"
        >
          <span
            className={`h-4 w-4 rounded-full border-2 border-dashed border-amber-200 ${
              playing ? 'animate-spin' : ''
            }`}
          />
          <span className="h-2.5 w-3 rounded-[2px] bg-white/25" />
          <span
            className={`h-4 w-4 rounded-full border-2 border-dashed border-amber-200 ${
              playing ? 'animate-spin' : ''
            }`}
          />
        </div>

        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200">
            {playing ? playingLabel : tapLabel}
          </p>
          <p className="truncate text-xs font-semibold text-white/95">{trackTitle}</p>
        </div>
      </div>

      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-xs transition group-hover:scale-105"
        style={{ backgroundColor: accentColor }}
        aria-hidden="true"
      >
        {playing ? (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
            <rect x="4" y="3" width="2.5" height="10" rx="1" />
            <rect x="9.5" y="3" width="2.5" height="10" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 translate-x-0.5" fill="currentColor">
            <path d="M4 3.2v9.6a.6.6 0 0 0 .92.51l7.4-4.8a.6.6 0 0 0 0-1.02l-7.4-4.8A.6.6 0 0 0 4 3.2Z" />
          </svg>
        )}
      </span>
    </button>
  );
}

export interface OccasionAdaptiveGalleryProps {
  photos?: string[];
  accentColor: string;
  dark?: boolean;
  captionPrefix?: string;
  captionFont?: 'mono' | 'handwritten' | 'editorial';
  emptyFallback?: React.ReactNode;
}

/**
 * Count-aware adaptive photo gallery that tailors its editorial layout to 1, 2, 3, or 4+ valid photos.
 * Tracks individual load errors and omits broken slots cleanly without rendering dashed placeholders.
 */
export function OccasionAdaptiveGallery({
  photos,
  accentColor,
  dark = false,
  captionPrefix = 'Memory',
  captionFont = 'mono',
  emptyFallback,
}: OccasionAdaptiveGalleryProps) {
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);

  const captionClassName =
    captionFont === 'handwritten'
      ? 'font-handwritten text-sm font-semibold tracking-normal'
      : captionFont === 'editorial'
        ? 'font-editorial italic text-xs font-normal tracking-wide'
        : 'font-mono text-[9.5px] font-bold uppercase tracking-[0.14em]';

  const validPhotos = (photos ?? [])
    .map((src) => (typeof src === 'string' ? src.trim() : ''))
    .filter((src) => src.length > 0 && !failedUrls[src]);

  const count = validPhotos.length;

  useEffect(() => {
    if (zoomIdx === null) return;
    if (count === 0) {
      setZoomIdx(null);
      return;
    }
    if (zoomIdx >= count) {
      setZoomIdx(count - 1);
    }
  }, [count, zoomIdx]);

  useEffect(() => {
    if (zoomIdx === null || count === 0) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setZoomIdx(null);
      } else if (event.key === 'ArrowRight' && count > 1) {
        setZoomIdx((prev) => (prev === null ? 0 : (prev + 1) % count));
      } else if (event.key === 'ArrowLeft' && count > 1) {
        setZoomIdx((prev) => (prev === null ? 0 : (prev - 1 + count) % count));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIdx, count]);

  if (count === 0) {
    return <>{emptyFallback ?? null}</>;
  }

  const markFailed = (src: string) => {
    setFailedUrls((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
  };

  const frameChrome = dark
    ? 'border border-white/15 bg-white/10 text-white backdrop-blur-md shadow-[0_14px_32px_-16px_rgba(0,0,0,0.7)]'
    : 'border border-black/10 bg-white text-[#2B1B2E] shadow-[0_12px_28px_-14px_rgba(28,19,30,0.28)]';

  return (
    <>
      {count === 1 ? (
        <div className="relative mx-auto mt-3 max-w-[300px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3 rounded-[28px] opacity-30 blur-xl"
            style={{ backgroundColor: accentColor }}
          />
          <button
            type="button"
            onClick={() => setZoomIdx(0)}
            aria-label={`View ${captionPrefix} 1`}
            className={`group relative flex min-h-[44px] w-full flex-col overflow-hidden rounded-2xl p-2 pb-3 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${frameChrome}`}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={validPhotos[0]}
                alt={`${captionPrefix} 1`}
                loading="lazy"
                decoding="async"
                onError={() => markFailed(validPhotos[0])}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                className="absolute bottom-2.5 left-2.5 inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm backdrop-blur-xs"
                style={{ backgroundColor: `${accentColor}D9` }}
              >
                {captionFont === 'mono' ? `${captionPrefix} 01` : '01'}
              </span>
            </div>
            {captionFont !== 'mono' ? (
              <span
                className={`mt-2 block truncate text-center ${captionClassName} ${
                  dark ? 'text-white/85' : 'text-[#2B1B2E]/80'
                }`}
              >
                {captionPrefix} 01
              </span>
            ) : null}
          </button>
        </div>
      ) : count === 2 ? (
        <div className="mt-3 grid grid-cols-2 gap-3 px-1">
          {validPhotos.map((src, idx) => (
            <button
              key={`${src.slice(0, 24)}-${idx}`}
              type="button"
              onClick={() => setZoomIdx(idx)}
              aria-label={`View ${captionPrefix} ${idx + 1}`}
              className={`group relative flex min-h-[44px] flex-col overflow-hidden rounded-xl p-1.5 pb-3.5 text-left transition-all duration-300 hover:z-10 hover:rotate-0 hover:scale-[1.03] active:scale-95 ${
                idx === 0 ? '-rotate-2' : 'rotate-2'
              } ${frameChrome}`}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-1.5 left-1/2 h-3 w-10 -translate-x-1/2 rotate-[-3deg] rounded-[2px] opacity-70"
                style={{ backgroundColor: `${accentColor}40` }}
              />
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${captionPrefix} ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                  onError={() => markFailed(src)}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <span
                className={`mt-2 block truncate text-center ${captionClassName} ${
                  dark ? 'text-white/80' : 'text-stone-600'
                }`}
              >
                {captionPrefix} 0{idx + 1}
              </span>
            </button>
          ))}
        </div>
      ) : count === 3 ? (
        <div className="mt-3 grid grid-cols-12 items-stretch gap-2.5">
          <button
            type="button"
            onClick={() => setZoomIdx(0)}
            aria-label={`View ${captionPrefix} 1`}
            className={`group relative col-span-7 flex min-h-[44px] flex-col overflow-hidden rounded-2xl p-1.5 text-left transition-all duration-300 hover:scale-[1.015] active:scale-[0.98] ${frameChrome}`}
          >
            <div className="relative h-full min-h-[190px] w-full flex-1 overflow-hidden rounded-xl bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={validPhotos[0]}
                alt={`${captionPrefix} 1`}
                loading="lazy"
                decoding="async"
                onError={() => markFailed(validPhotos[0])}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                className="absolute bottom-2 left-2 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-xs"
                style={{ backgroundColor: `${accentColor}CC` }}
              >
                01
              </span>
            </div>
          </button>

          <div className="col-span-5 flex flex-col gap-2.5">
            {validPhotos.slice(1, 3).map((src, offset) => {
              const idx = offset + 1;
              return (
                <button
                  key={`${src.slice(0, 24)}-${idx}`}
                  type="button"
                  onClick={() => setZoomIdx(idx)}
                  aria-label={`View ${captionPrefix} ${idx + 1}`}
                  className={`group relative flex min-h-[44px] flex-col overflow-hidden rounded-2xl p-1.5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${frameChrome}`}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${captionPrefix} ${idx + 1}`}
                      loading="lazy"
                      decoding="async"
                      onError={() => markFailed(src)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                      className="absolute bottom-1.5 left-1.5 rounded-full px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-xs"
                      style={{ backgroundColor: `${accentColor}CC` }}
                    >
                      0{idx + 1}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {validPhotos.slice(0, 4).map((src, idx) => {
            const extraCount = idx === 3 && count > 4 ? count - 4 : 0;
            return (
              <button
                key={`${src.slice(0, 24)}-${idx}`}
                type="button"
                onClick={() => setZoomIdx(idx)}
                aria-label={`View ${captionPrefix} ${idx + 1}`}
                className={`group relative flex min-h-[44px] flex-col overflow-hidden rounded-2xl p-1.5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${frameChrome}`}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${captionPrefix} ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    onError={() => markFailed(src)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {extraCount > 0 ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 font-mono text-sm font-bold text-white backdrop-blur-[1px]">
                      +{extraCount}
                    </span>
                  ) : (
                    <span
                      className="absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-xs"
                      style={{ backgroundColor: `${accentColor}CC` }}
                    >
                      0{idx + 1}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {zoomIdx !== null && validPhotos[zoomIdx] ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${captionPrefix} lightbox`}
          onClick={() => setZoomIdx(null)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl p-2.5 shadow-2xl animate-pop-bounce ${
              dark
                ? 'border border-white/15 bg-[#12101B] text-white'
                : 'bg-white text-[#2B1B2E]'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={validPhotos[zoomIdx]}
              alt={`Expanded ${captionPrefix.toLowerCase()} ${zoomIdx + 1}`}
              className={`max-h-[68dvh] w-full rounded-xl object-contain ${
                dark ? 'bg-black/40' : 'bg-stone-50'
              }`}
            />
            <div className="mt-2.5 flex items-center justify-between gap-2 px-1.5 pb-1 text-xs font-bold">
              <span>
                {captionPrefix} {zoomIdx + 1} / {count}
              </span>
              <div className="flex items-center gap-1.5">
                {count > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setZoomIdx((prev) => (prev === null ? 0 : (prev - 1 + count) % count))}
                      className={`min-h-[44px] rounded-xl border px-3.5 transition ${
                        dark
                          ? 'border-white/15 hover:bg-white/10'
                          : 'border-black/10 hover:bg-stone-50'
                      }`}
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomIdx((prev) => (prev === null ? 0 : (prev + 1) % count))}
                      className={`min-h-[44px] rounded-xl border px-3.5 transition ${
                        dark
                          ? 'border-white/15 hover:bg-white/10'
                          : 'border-black/10 hover:bg-stone-50'
                      }`}
                    >
                      Next
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => setZoomIdx(null)}
                  className="min-h-[44px] rounded-xl px-4 text-white shadow-xs transition active:scale-95"
                  style={{ backgroundColor: accentColor }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
