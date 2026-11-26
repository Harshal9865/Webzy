'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toCoreLanguageCode } from '@webzy/core';
import { getWebzyFooterLabel, type OccasionSiteProps } from './shared/OccasionPrimitives';
import { PortfolioDemoSwitcher } from './portfolio/PortfolioDemoSwitcher';
import { PortfolioEditorialTheme } from './portfolio/PortfolioEditorialTheme';
import { PortfolioKineticTheme } from './portfolio/PortfolioKineticTheme';
import { PortfolioLuxuryTheme } from './portfolio/PortfolioLuxuryTheme';
import {
  type PortfolioThemeVariant,
  resolvePortfolioTheme,
} from './portfolio/portfolioTypes';

/**
 * Portfolio Flagship 3-Theme Experience Orchestrator:
 * - editorial: Terracotta Print archival paper (#F6F2EA), condensed masthead & numbered 01-04 case grid
 * - luxury: Couture Ivory (#F7F1E8) sunlit hero + Obsidian (#0E0D0C) works & process accordion
 * - kinetic: Obsidian Signal (#090A0E) live IST clock, magnetic tilt card, marquee & bento filter
 */
export function PortfolioSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const autoVariant = resolvePortfolioTheme(data.relation);
  const [manualVariant, setManualVariant] = useState<PortfolioThemeVariant | null>(null);
  const [sceneKey, setSceneKey] = useState(0);
  const openedOnceRef = useRef(false);

  // Sync automatically when buyer switches theme style inside CreateWizardClient
  useEffect(() => {
    setManualVariant(null);
    setSceneKey((prev) => prev + 1);
  }, [data.relation]);

  useEffect(() => {
    if (openedOnceRef.current) return;
    openedOnceRef.current = true;
    onOpened?.();
  }, [onOpened]);

  const activeVariant: PortfolioThemeVariant =
    watermarked && manualVariant ? manualVariant : autoVariant;
  const coreLang = toCoreLanguageCode(language);

  function handleSelectDemoVariant(nextVariant: PortfolioThemeVariant) {
    setManualVariant(nextVariant);
    setSceneKey((prev) => prev + 1);
  }

  const outerBgColor =
    activeVariant === 'kinetic'
      ? '#090A0E'
      : activeVariant === 'luxury'
        ? '#0E0D0C'
        : '#F6F2EA';

  const footerTextColor =
    activeVariant === 'editorial' ? 'text-[#1A1715]/60' : 'text-[#F7F1E8]/65';

  const isDarkBanner = activeVariant === 'kinetic';

  return (
    <div
      className="relative flex min-h-full w-full flex-col justify-between overflow-x-clip rounded-[28px]"
      style={{ backgroundColor: outerBgColor }}
    >
      {watermarked ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none relative z-30 flex justify-center border-b py-1.5 font-mono text-[10px] font-bold tracking-[0.18em] ${
            isDarkBanner
              ? 'border-white/15 bg-[#11131A]/90 text-[#D9F99D]'
              : activeVariant === 'luxury'
                ? 'border-[#181512]/15 bg-[#EFE7DA]/90 text-[#181512]/75'
                : 'border-[#1A1715]/15 bg-white/80 text-[#1A1715]/75'
          }`}
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      <div className="relative flex flex-1 flex-col">
        {activeVariant === 'editorial' ? (
          <PortfolioEditorialTheme
            key={`editorial-${sceneKey}`}
            manifest={manifest}
            data={data}
            language={language}
            watermarked={watermarked}
            onOpened={onOpened}
          />
        ) : activeVariant === 'luxury' ? (
          <PortfolioLuxuryTheme
            key={`luxury-${sceneKey}`}
            manifest={manifest}
            data={data}
            language={language}
            watermarked={watermarked}
            onOpened={onOpened}
          />
        ) : (
          <PortfolioKineticTheme
            key={`kinetic-${sceneKey}`}
            manifest={manifest}
            data={data}
            language={language}
            watermarked={watermarked}
            onOpened={onOpened}
          />
        )}
      </div>

      <footer
        className={`relative z-20 px-4 pb-4 pt-3 text-center text-[11px] font-medium ${footerTextColor}`}
      >
        {getWebzyFooterLabel(language)}
      </footer>

      {watermarked ? (
        <PortfolioDemoSwitcher
          activeVariant={activeVariant}
          language={coreLang}
          onSelect={handleSelectDemoVariant}
        />
      ) : null}
    </div>
  );
}
