'use client';

import React, { useEffect, useState } from 'react';
import { toCoreLanguageCode } from '@webzy/core';
import type { OccasionSiteProps } from './shared/OccasionPrimitives';
import { getWebzyFooterLabel } from './shared/OccasionPrimitives';
import { BirthdayCoupleTheme } from './birthday/BirthdayCoupleTheme';
import { BirthdayDemoSwitcher, BirthdayPhotoLightbox } from './birthday/BirthdayDemoSwitcher';
import { BirthdayFamilyTheme } from './birthday/BirthdayFamilyTheme';
import { BirthdayNormalTheme } from './birthday/BirthdayNormalTheme';
import {
  type BirthdayThemeVariant,
  getValidPhotos,
  resolveBirthdayTheme,
} from './birthday/birthdayTypes';

/**
 * Happy Birthday Flagship Multi-Theme Experience Orchestrator:
 * - normal: Powder-Blue Polka-Dot Scrapbook, Ransom Cutouts & Dual Mic/Tap Blow-Out Cake
 * - couple: Deep Velvet Crimson Desk, Interactive Bow & Arrow, 3-Ring Binder & 35mm Filmstrip
 * - family: Warm Cotton Ivory Gift Box, 3D Flower Vortex, Left-to-Right Flower Wave & Heart-Balloon Tree
 */
export function BirthdayConfettiSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const autoVariant = resolveBirthdayTheme(data.relation);
  const [manualVariant, setManualVariant] = useState<BirthdayThemeVariant | null>(null);
  const [sceneKey, setSceneKey] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Sync automatically when buyer switches relation inside CreateWizardClient
  useEffect(() => {
    setManualVariant(null);
    setSceneKey((prev) => prev + 1);
  }, [data.relation]);

  const activeVariant: BirthdayThemeVariant =
    watermarked && manualVariant ? manualVariant : autoVariant;
  const coreLang = toCoreLanguageCode(language);
  const photos = getValidPhotos(data.photos);

  function handleSelectDemoVariant(nextVariant: BirthdayThemeVariant) {
    setManualVariant(nextVariant);
    setLightboxIdx(null);
    setSceneKey((prev) => prev + 1);
  }

  const accentForLightbox =
    activeVariant === 'couple'
      ? '#9E171D'
      : activeVariant === 'family'
        ? '#B82936'
        : '#1557B0';

  const footerTextColor =
    activeVariant === 'couple' ? 'text-[#FAF5EC]/75' : 'text-[#2B1B2E]/60';

  const outerBgColor =
    activeVariant === 'couple'
      ? '#9E171D'
      : activeVariant === 'family'
        ? '#F6F2E9'
        : '#F5F1E6';

  return (
    <div
      className="relative flex min-h-full w-full flex-col justify-between overflow-x-clip rounded-[28px]"
      style={{ backgroundColor: outerBgColor }}
    >
      {watermarked ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none relative z-30 flex justify-center border-b py-1.5 font-mono text-[10px] font-bold tracking-[0.18em] ${
            activeVariant === 'couple'
              ? 'border-white/15 bg-[#6E0D12]/90 text-[#FAF5EC]/90'
              : 'border-black/10 bg-white/75 text-[#2B1B2E]/75'
          }`}
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      <div className="relative flex flex-1 flex-col">
        {activeVariant === 'normal' ? (
          <BirthdayNormalTheme
            key={`normal-${sceneKey}`}
            manifest={manifest}
            data={data}
            language={language}
            watermarked={watermarked}
            onOpened={onOpened}
            onOpenPhoto={setLightboxIdx}
          />
        ) : activeVariant === 'couple' ? (
          <BirthdayCoupleTheme
            key={`couple-${sceneKey}`}
            manifest={manifest}
            data={data}
            language={language}
            watermarked={watermarked}
            onOpened={onOpened}
            onOpenPhoto={setLightboxIdx}
          />
        ) : (
          <BirthdayFamilyTheme
            key={`family-${sceneKey}`}
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
        <BirthdayDemoSwitcher
          activeVariant={activeVariant}
          language={coreLang}
          onSelect={handleSelectDemoVariant}
        />
      ) : null}

      <BirthdayPhotoLightbox
        photos={photos}
        activeIdx={lightboxIdx}
        accentColor={accentForLightbox}
        onChangeIdx={setLightboxIdx}
      />
    </div>
  );
}
