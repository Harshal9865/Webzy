'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getWeddingUiCopy } from '../i18n';
import type { WeddingLanguage, WeddingThemeKey } from '../schema';
import { getWeddingThemePalette } from '../themePalettes';
import { RoyalFlourishDivider } from './Ornaments';

interface PhotoGalleryProps {
  photos: string[];
  brideName: string;
  groomName: string;
  language?: WeddingLanguage;
  theme?: WeddingThemeKey;
  compact?: boolean;
}

function formatIndex(num: number): string {
  return String(num).padStart(2, '0');
}

export function PhotoGallery({
  photos,
  brideName,
  groomName,
  language = 'en',
  theme = 'emerald',
  compact = false,
}: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [failedPhotos, setFailedPhotos] = useState<Record<number, boolean>>({});
  const touchStartX = useRef<number | null>(null);

  const count = photos?.length ?? 0;

  useEffect(() => {
    setFailedPhotos({});
    setSelectedIndex((prev) => (prev !== null && prev < count ? prev : null));
  }, [photos, count]);

  const goPrev = useCallback(() => {
    if (count === 0) return;
    setSelectedIndex((prev) => (prev === null ? null : (prev - 1 + count) % count));
  }, [count]);

  const goNext = useCallback(() => {
    if (count === 0) return;
    setSelectedIndex((prev) => (prev === null ? null : (prev + 1) % count));
  }, [count]);

  useEffect(() => {
    if (selectedIndex === null) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, goPrev, goNext]);

  if (!photos || photos.length === 0) return null;

  const copy = getWeddingUiCopy(language);
  const pal = getWeddingThemePalette(theme);
  const frameBorder = pal.outerBorder;
  const headingColor = pal.accentText;
  const fallbackBg = pal.fallbackBg;

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (delta > 45) goPrev();
    if (delta < -45) goNext();
  }

  return (
    <section
      className={
        compact
          ? 'w-full py-8 px-4'
          : 'w-full py-10 md:py-16 px-4 sm:px-6 lg:px-8'
      }
    >
      <div className={compact ? 'max-w-md mx-auto' : 'max-w-5xl mx-auto'}>
        <div className={compact ? 'text-center mb-7' : 'text-center mb-9 md:mb-12'}>
          <span className="font-royal-serif text-[10.5px] md:text-[11px] font-bold uppercase tracking-[0.3em] text-[#8C6D23] block">
            VI &middot; {copy.gallery.eyebrow}
          </span>
          <h2
            className={`font-royal-script mt-2 leading-[1.08] ${headingColor} ${compact ? 'text-4xl' : 'text-4xl sm:text-5xl lg:text-[54px]'
              }`}
          >
            {copy.gallery.heading}
          </h2>
          <RoyalFlourishDivider theme={theme} className="mt-3.5" />
        </div>

        {/* Sculpted Palace Jharokha Arch Exhibition Grid */}
        <div
          className={
            compact
              ? 'grid grid-cols-2 gap-3.5'
              : 'grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 lg:pb-8'
          }
        >
          {photos.map((url, idx) => {
            const isMiddleColumn = !compact && idx % 3 === 1;
            const isFailed = Boolean(failedPhotos[idx]);
            const frameIndex = formatIndex(idx + 1);

            return (
              <button
                key={`${url}-${idx}`}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`${copy.gallery.tapToEnlarge} ${frameIndex}`}
                className={`group relative aspect-[3/4.1] w-full cursor-pointer overflow-hidden rounded-t-[999px] rounded-b-xl border shadow-[0_14px_34px_-18px_rgba(32,20,10,0.28)] transition-all duration-500 hover:shadow-[0_22px_46px_-20px_rgba(32,20,10,0.38)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-2 ${frameBorder} ${fallbackBg} ${isMiddleColumn ? 'lg:translate-y-6' : ''
                  }`}
              >
                {isFailed ? (
                  <div className="flex h-full w-full flex-col items-center justify-center p-5 text-center">
                    <svg
                      className={`h-8 w-8 mb-2.5 ${pal.fallbackIconTone}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.3}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className={`font-royal-script text-xl leading-tight ${headingColor}`}>
                      {brideName} &amp; {groomName}
                    </span>
                    <span className="mt-1.5 font-royal-serif text-[9px] font-bold uppercase tracking-[0.24em] text-[#8C6D23]">
                      {copy.gallery.eyebrow}
                    </span>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={url}
                    alt={`Celebration moment ${idx + 1} of ${brideName} and ${groomName}`}
                    onError={() => setFailedPhotos((prev) => ({ ...prev, [idx]: true }))}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    loading="lazy"
                  />
                )}

                {/* Delicate Inner Gold Arch Hairline (Offsets Smoothly on Hover) */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[6px] md:inset-2 rounded-t-[999px] rounded-b-lg border border-[#F5D67B]/45 transition-all duration-500 group-hover:inset-[10px] md:group-hover:inset-3 group-hover:border-[#F5D67B]/85"
                />

                {/* Soft Lower Editorial Vignette */}
                {!isFailed && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#10090B]/65 via-[#10090B]/20 to-transparent transition-opacity duration-300 group-hover:from-[#10090B]/80"
                  />
                )}

                {/* Understated Editorial Frame Index & Quiet Hover Prompt */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-3.5 pb-3 md:px-4 md:pb-3.5">
                  {!isFailed ? (
                    <span className="font-royal-serif text-[9.5px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFF8E7] opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      {copy.gallery.tapToEnlarge}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span
                    className={`font-royal-serif text-[10px] md:text-[11px] font-semibold tracking-[0.22em] ${isFailed ? 'text-[#8C6D23]/80' : 'text-[#FCE4A0]/95'
                      }`}
                  >
                    {frameIndex}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cinema-Grade Obsidian Lightbox Viewer */}
      {selectedIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={copy.gallery.heading}
          onClick={() => setSelectedIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#10090B]/95 p-4 sm:p-6 md:p-8 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full flex flex-col items-center ${compact ? 'max-w-lg' : 'max-w-lg md:max-w-2xl lg:max-w-3xl'
              }`}
          >
            {/* Top Viewer Bar: Serif Counter, Couple Signature & Close */}
            <div className="mb-4 flex w-full items-center justify-between border-b border-[#C5A059]/25 pb-3 px-1 text-[#FFF8E7]">
              <div className="flex items-center gap-3">
                <span className="font-royal-serif text-xs md:text-sm font-semibold tracking-[0.26em] text-[#F5D67B]">
                  {formatIndex(selectedIndex + 1)} / {formatIndex(photos.length)}
                </span>
                <span aria-hidden="true" className="hidden sm:inline-block h-3 w-[1px] bg-[#C5A059]/35" />
                <span className="hidden sm:inline font-royal-serif text-[10.5px] uppercase tracking-[0.24em] text-[#F7EFE0]/70">
                  {brideName} &amp; {groomName}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-[#C5A059]/45 bg-[#1B1114]/90 text-[#F5E3B3] hover:border-[#F5D67B] hover:bg-[#28191D] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5D67B]"
                aria-label={copy.gallery.closePhoto}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sculpted Arch Obsidian Frame */}
            <div className="relative w-full overflow-hidden rounded-t-[130px] md:rounded-t-[180px] rounded-b-2xl border border-[#C5A059]/45 bg-[#160D10] p-2.5 md:p-3.5 shadow-[0_28px_80px_rgba(0,0,0,0.8)]">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-[5px] md:inset-[7px] rounded-t-[124px] md:rounded-t-[174px] rounded-b-xl border border-[#F5D67B]/20"
              />

              {failedPhotos[selectedIndex] ? (
                <div className="flex min-h-[280px] md:min-h-[380px] w-full flex-col items-center justify-center rounded-t-[120px] md:rounded-t-[168px] rounded-b-xl bg-[#1D1216] px-6 py-12 text-center">
                  <svg
                    className="h-10 w-10 mb-3 text-[#F5D67B]/55"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.3}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="font-royal-script text-3xl text-[#FFF5D6]">
                    {brideName} &amp; {groomName}
                  </p>
                  <p className="mt-2 font-royal-serif text-[10.5px] uppercase tracking-[0.26em] text-[#E5C158]">
                    {copy.gallery.eyebrow}
                  </p>
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={photos[selectedIndex]}
                  alt={`Celebration moment ${selectedIndex + 1} of ${brideName} and ${groomName}`}
                  onError={() =>
                    setFailedPhotos((prev) =>
                      selectedIndex !== null ? { ...prev, [selectedIndex]: true } : prev
                    )
                  }
                  className="max-h-[72vh] md:max-h-[76vh] w-full rounded-t-[120px] md:rounded-t-[168px] rounded-b-xl object-contain mx-auto"
                />
              )}

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label={copy.gallery.prevPhoto}
                    className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-[#C5A059]/50 bg-[#10090B]/80 text-[#FCE4A0] hover:border-[#F5D67B] hover:bg-[#221519] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5D67B]"
                  >
                    <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label={copy.gallery.nextPhoto}
                    className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-[#C5A059]/50 bg-[#10090B]/80 text-[#FCE4A0] hover:border-[#F5D67B] hover:bg-[#221519] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5D67B]"
                  >
                    <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
