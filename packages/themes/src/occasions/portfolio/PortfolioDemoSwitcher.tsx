'use client';

import React from 'react';
import type { CoreLanguageCode } from '@webzy/core';
import { PORTFOLIO_THEMES_COPY, type PortfolioThemeVariant } from './portfolioTypes';

interface PortfolioDemoSwitcherProps {
  activeVariant: PortfolioThemeVariant;
  language: CoreLanguageCode;
  onSelect: (variant: PortfolioThemeVariant) => void;
}

const VARIANTS: readonly PortfolioThemeVariant[] = ['editorial', 'luxury', 'kinetic'];

/** Floating watermarked-demo pill allowing shoppers to switch live across Editorial, Couture, and Kinetic themes. */
export function PortfolioDemoSwitcher({
  activeVariant,
  language,
  onSelect,
}: PortfolioDemoSwitcherProps) {
  const copy = PORTFOLIO_THEMES_COPY[language]?.switcher ?? PORTFOLIO_THEMES_COPY.en.switcher;

  return (
    <div className="pointer-events-none sticky bottom-3 z-40 mt-auto flex w-full justify-center px-3 pb-1">
      <div
        role="tablist"
        aria-label="Portfolio theme switcher"
        className="pointer-events-auto inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/20 bg-[#141312]/90 p-1 text-white shadow-[0_10px_28px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md scrollbar-none"
      >
        {VARIANTS.map((variant) => {
          const isActive = activeVariant === variant;
          const activeClass =
            variant === 'editorial'
              ? 'bg-[#C85A3F] text-[#F6F2EA]'
              : variant === 'luxury'
                ? 'bg-[#F7F1E8] text-[#0E0D0C]'
                : 'bg-[#D9F99D] text-[#090A0E]';

          return (
            <button
              key={variant}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(variant)}
              className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-full px-3 sm:px-3.5 text-[11px] font-semibold tracking-wide transition-all active:scale-95 motion-reduce:transition-none ${
                isActive ? `${activeClass} shadow-xs` : 'text-white/80 hover:bg-white/10 hover:text-white'
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
