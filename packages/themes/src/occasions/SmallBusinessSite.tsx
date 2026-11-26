'use client';

import React, { useEffect, useState } from 'react';
import { toCoreLanguageCode } from '@webzy/core';
import type { OccasionSiteProps } from './shared/OccasionPrimitives';
import { getWebzyFooterLabel } from './shared/OccasionPrimitives';
import { SmallBusiness3DScrollTheme } from './small-business/SmallBusiness3DScrollTheme';
import { SmallBusinessBakeryTheme } from './small-business/SmallBusinessBakeryTheme';
import { SmallBusinessBoutiqueTheme } from './small-business/SmallBusinessBoutiqueTheme';
import {
  SmallBusinessDemoSwitcher,
  SmallBusinessPhotoLightbox,
} from './small-business/SmallBusinessDemoSwitcher';
import { SmallBusinessStreetwearTheme } from './small-business/SmallBusinessStreetwearTheme';
import {
  getValidPhotos,
  resolveSmallBusinessTheme,
  type SmallBusinessThemeVariant,
} from './small-business/smallBusinessTypes';

export { resolveSmallBusinessTheme, type SmallBusinessThemeVariant };

/**
 * Small Business Multi-Theme Storefront Orchestrator:
 * - bakery: Warm vanilla & berry-cocoa Artisan Bakehouse with category filters & WhatsApp Order Bag
 * - streetwear: Monochrome Atelier brutalist lookbook with 4-angle viewer, colorway & size controls
 * - boutique: Alabaster & denim-slate Everyday Minimalist lookbook with live swatch cards & bento grid
 * - kinetic3d: Obsidian space Prism 3D Scroll Universe with 6-face 3D cube, scroll depth & tilt deck
 */
export function SmallBusinessSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const autoVariant = resolveSmallBusinessTheme(data.relation);
  const [manualVariant, setManualVariant] =
    useState<SmallBusinessThemeVariant | null>(null);
  const [sceneKey, setSceneKey] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    setManualVariant(null);
    setSceneKey((prev) => prev + 1);
  }, [data.relation]);

  const activeVariant: SmallBusinessThemeVariant =
    watermarked && manualVariant ? manualVariant : autoVariant;
  const coreLang = toCoreLanguageCode(language);
  const photos = getValidPhotos(data.photos);

  function handleSelectDemoVariant(nextVariant: SmallBusinessThemeVariant) {
    setManualVariant(nextVariant);
    setLightboxIdx(null);
    setSceneKey((prev) => prev + 1);
  }

  const accentForLightbox =
    activeVariant === 'bakery'
      ? '#8E2027'
      : activeVariant === 'streetwear'
        ? '#111111'
        : activeVariant === 'boutique'
          ? '#34516A'
          : '#818CF8';

  const outerBgColor =
    activeVariant === 'bakery'
      ? '#FDF9F3'
      : activeVariant === 'streetwear'
        ? '#FFFFFF'
        : activeVariant === 'boutique'
          ? '#F8F7F4'
          : '#06070B';

  const footerTextColor =
    activeVariant === 'kinetic3d' ? 'text-[#F4F4F5]/65' : 'text-[#18181B]/60';

  const bannerChrome =
    activeVariant === 'kinetic3d'
      ? 'border-white/15 bg-[#0B0E17]/90 text-[#22D3EE]'
      : activeVariant === 'streetwear'
        ? 'border-[#111111] bg-[#111111] text-white'
        : activeVariant === 'bakery'
          ? 'border-[#8E2027]/20 bg-[#8E2027] text-[#FDF9F3]'
          : 'border-[#E6E2DA] bg-[#34516A] text-[#F8F7F4]';

  return (
    <div
      className="relative flex min-h-full w-full flex-col justify-between overflow-x-clip rounded-[28px]"
      style={{ backgroundColor: outerBgColor }}
    >
      {watermarked ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none relative z-30 flex justify-center border-b py-1.5 font-mono text-[10px] font-bold tracking-[0.18em] ${bannerChrome}`}
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      <div className="relative flex flex-1 flex-col">
        {activeVariant === 'bakery' ? (
          <SmallBusinessBakeryTheme
            key={`bakery-${sceneKey}`}
            manifest={manifest}
            data={data}
            language={language}
            watermarked={watermarked}
            onOpened={onOpened}
            onOpenPhoto={setLightboxIdx}
          />
        ) : activeVariant === 'streetwear' ? (
          <SmallBusinessStreetwearTheme
            key={`streetwear-${sceneKey}`}
            manifest={manifest}
            data={data}
            language={language}
            watermarked={watermarked}
            onOpened={onOpened}
            onOpenPhoto={setLightboxIdx}
          />
        ) : activeVariant === 'boutique' ? (
          <SmallBusinessBoutiqueTheme
            key={`boutique-${sceneKey}`}
            manifest={manifest}
            data={data}
            language={language}
            watermarked={watermarked}
            onOpened={onOpened}
            onOpenPhoto={setLightboxIdx}
          />
        ) : (
          <SmallBusiness3DScrollTheme
            key={`kinetic3d-${sceneKey}`}
            manifest={manifest}
            data={data}
            language={language}
            watermarked={watermarked}
            onOpened={onOpened}
            onOpenPhoto={setLightboxIdx}
          />
        )}
      </div>

      <footer
        className={`relative z-20 px-4 pb-4 pt-3 text-center text-[11px] font-medium ${footerTextColor}`}
      >
        {getWebzyFooterLabel(language)}
      </footer>

      {watermarked ? (
        <SmallBusinessDemoSwitcher
          activeVariant={activeVariant}
          language={coreLang}
          onSelect={handleSelectDemoVariant}
        />
      ) : null}

      <SmallBusinessPhotoLightbox
        photos={photos}
        activeIdx={lightboxIdx}
        accentColor={accentForLightbox}
        onChangeIdx={setLightboxIdx}
      />
    </div>
  );
}
