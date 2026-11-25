'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  getLanguageMeta,
  getSiteCopy,
  getStorefrontCopy,
  SUPPORTED_LANGUAGES,
  type LanguageCode,
} from '@webzy/core';
import { useLanguage } from './LanguageProvider';

interface LanguageSelectorButtonProps {
  /** Compact variant fits neatly in mobile/desktop header; fullWidth fits inside drawer */
  variant?: 'header' | 'drawer';
  onSelectComplete?: () => void;
}

export function LanguageSelectorButton({
  variant = 'header',
  onSelectComplete,
}: LanguageSelectorButtonProps) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  const activeMeta = getLanguageMeta(language);
  const copy = getStorefrontCopy(language);
  const site = getSiteCopy(language);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function handleSelect(code: LanguageCode) {
    setLanguage(code);
    setOpen(false);
    onSelectComplete?.();
  }

  return (
    <div ref={containerRef} className={`relative ${variant === 'drawer' ? 'w-full' : 'inline-flex'}`}>
      <button
        suppressHydrationWarning
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={menuId}
        aria-label={`${copy.nav.language}: ${activeMeta.nativeLabel}`}
        className={
          variant === 'drawer'
            ? 'flex min-h-[46px] w-full items-center justify-between gap-2 rounded-xl border border-webzy-ink/15 bg-webzy-surface/60 px-3.5 text-sm font-semibold text-webzy-ink transition hover:border-webzy-primary/50 hover:bg-white'
            : 'btn-spring inline-flex h-11 sm:h-10 items-center gap-1.5 rounded-full border border-webzy-ink/15 bg-white px-2.5 sm:px-3.5 text-xs sm:text-[13px] font-semibold text-webzy-ink shadow-xs transition hover:border-webzy-primary/45 hover:bg-webzy-surface/60'
        }
      >
        <span className="inline-flex items-center gap-1.5">
          {/* Clear Globe / Language Icon */}
          <svg
            className="h-4 w-4 shrink-0 text-webzy-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.9}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.2 0 4-4 4-9s-1.8-9-4-9-4 4-4 9 1.8 9 4 9zm-8.5-9h17"
            />
          </svg>
          <span className="max-w-[84px] truncate sm:max-w-none">{activeMeta.nativeLabel}</span>
        </span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-webzy-ink/60 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open ? (
        <div
          id={menuId}
          role="listbox"
          aria-label="Choose language"
          className={`z-50 overflow-hidden rounded-2xl border border-webzy-ink/12 bg-white p-2 shadow-xl ${
            variant === 'drawer'
              ? 'absolute bottom-full left-0 right-0 mb-2 max-h-[60vh] overflow-y-auto'
              : 'fixed inset-x-3 top-[60px] z-50 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[340px]'
          }`}
        >
          <div className="border-b border-webzy-ink/[0.07] px-2.5 pb-2 pt-1">
            <p className="text-xs font-bold text-webzy-ink">{site.common.chooseLanguageTitle}</p>
            <p className="text-[11px] text-webzy-ink/60">
              {site.common.chooseLanguageSubtitle}
            </p>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {SUPPORTED_LANGUAGES.map((opt) => {
              const isSelected = language === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.code)}
                  className={`flex min-h-[50px] items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition ${
                    isSelected
                      ? 'border-webzy-primary bg-webzy-primary/[0.08] text-webzy-ink shadow-xs ring-1 ring-webzy-primary/25'
                      : 'border-transparent bg-webzy-surface/40 text-webzy-ink hover:border-webzy-ink/15 hover:bg-webzy-surface'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-bold leading-snug text-webzy-ink">
                      {opt.nativeLabel}
                    </span>
                    <span className="block truncate text-[11px] font-medium text-webzy-ink/60">
                      {opt.englishLabel}
                    </span>
                  </div>
                  {isSelected ? (
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-webzy-primary text-white"
                      aria-hidden="true"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
