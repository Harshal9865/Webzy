'use client';

import React, { useEffect, useState } from 'react';
import type { CoreLanguageCode } from '@webzy/core';
import {
  SMALL_BUSINESS_THEMES_COPY,
  type SmallBusinessThemeVariant,
} from './smallBusinessTypes';

interface SmallBusinessDemoSwitcherProps {
  activeVariant: SmallBusinessThemeVariant;
  language: CoreLanguageCode;
  onSelect: (variant: SmallBusinessThemeVariant) => void;
}

const VARIANTS: readonly SmallBusinessThemeVariant[] = [
  'bakery',
  'streetwear',
  'boutique',
  'kinetic3d',
];

/** Floating 4-pill watermarked-demo switcher comparing Bakery, Streetwear, Boutique, and 3D Kinetic storefronts. */
export function SmallBusinessDemoSwitcher({
  activeVariant,
  language,
  onSelect,
}: SmallBusinessDemoSwitcherProps) {
  const copy =
    SMALL_BUSINESS_THEMES_COPY[language]?.switcher ??
    SMALL_BUSINESS_THEMES_COPY.en.switcher;

  return (
    <div className="pointer-events-none sticky bottom-3 z-40 mt-auto flex w-full justify-center px-2 pb-1">
      <div
        role="tablist"
        aria-label="Small business style preview"
        className="pointer-events-auto inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/20 bg-[#121318]/90 p-1 text-white shadow-[0_12px_30px_-8px_rgba(0,0,0,0.65)] backdrop-blur-md scrollbar-none"
      >
        {VARIANTS.map((variant) => {
          const isActive = activeVariant === variant;
          const activeBg =
            variant === 'bakery'
              ? 'bg-[#8E2027] text-[#FDF9F3]'
              : variant === 'streetwear'
                ? 'bg-[#FFFFFF] text-[#111111]'
                : variant === 'boutique'
                  ? 'bg-[#34516A] text-[#F8F7F4]'
                  : 'bg-gradient-to-r from-[#818CF8] to-[#22D3EE] text-[#06070B]';

          return (
            <button
              key={variant}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(variant)}
              className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-full px-2.5 sm:px-3.5 text-[10.5px] font-semibold transition-all active:scale-95 ${
                isActive
                  ? `${activeBg} shadow-xs`
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {copy[variant]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface SmallBusinessPhotoLightboxProps {
  photos: string[];
  activeIdx: number | null;
  accentColor: string;
  onChangeIdx: (idx: number | null) => void;
}

/** Keyboard-accessible full-viewport product photo viewer shared across all 4 Small Business editions. */
export function SmallBusinessPhotoLightbox({
  photos,
  activeIdx,
  accentColor,
  onChangeIdx,
}: SmallBusinessPhotoLightboxProps) {
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const count = photos.length;

  useEffect(() => {
    if (activeIdx === null || count === 0) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onChangeIdx(null);
      } else if (e.key === 'ArrowRight' && count > 1) {
        onChangeIdx((activeIdx + 1) % count);
      } else if (e.key === 'ArrowLeft' && count > 1) {
        onChangeIdx((activeIdx - 1 + count) % count);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIdx, count, onChangeIdx]);

  if (activeIdx === null || count === 0 || !photos[activeIdx]) return null;

  const activeSrc = photos[activeIdx];
  const isFailed = Boolean(failedUrls[activeSrc]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Product photo viewer"
      onClick={() => onChangeIdx(null)}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-[#FAF8F5] p-2.5 text-[#18181B] shadow-2xl"
      >
        {isFailed ? (
          <div className="flex h-56 w-full flex-col items-center justify-center rounded-xl bg-black/5 text-stone-500">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-8 w-8 opacity-45"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={activeSrc}
            alt={`Catalog item ${activeIdx + 1}`}
            onError={() => setFailedUrls((prev) => ({ ...prev, [activeSrc]: true }))}
            className="max-h-[68dvh] w-full rounded-xl bg-black/5 object-contain"
          />
        )}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1 pb-1 text-xs font-bold">
          <span className="font-mono text-[11px] uppercase tracking-wider text-stone-600">
            0{activeIdx + 1} / 0{count}
          </span>
          <div className="flex items-center gap-1.5">
            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => onChangeIdx((activeIdx - 1 + count) % count)}
                  className="min-h-[44px] rounded-xl border border-stone-300 bg-white px-2.5 text-stone-800 transition hover:bg-stone-100 sm:px-3.5"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => onChangeIdx((activeIdx + 1) % count)}
                  className="min-h-[44px] rounded-xl border border-stone-300 bg-white px-2.5 text-stone-800 transition hover:bg-stone-100 sm:px-3.5"
                >
                  Next
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => onChangeIdx(null)}
              className="min-h-[44px] rounded-xl px-4 text-white shadow-xs transition active:scale-95"
              style={{ backgroundColor: accentColor }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
