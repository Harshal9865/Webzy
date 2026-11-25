'use client';

import React from 'react';
import { type LanguageCode, pickLocalizedText } from '@webzy/core';
import type { ThemeDemoPayload, ThemeManifest } from '../schema';
import { BirthdayAshirwadSite } from '../occasions/BirthdayAshirwadSite';
import { BirthdayConfettiSite } from '../occasions/BirthdayConfettiSite';
import { BusinessGreetingSite } from '../occasions/BusinessGreetingSite';
import { HarvestGreetingSite } from '../occasions/HarvestGreetingSite';
import { MaanJaoSite } from '../occasions/MaanJaoSite';
import { MakeThemSmileSite } from '../occasions/MakeThemSmileSite';
import { OurTimelineSite } from '../occasions/OurTimelineSite';
import { OurYearWrappedSite } from '../occasions/OurYearWrappedSite';
import { WillYouSite } from '../occasions/WillYouSite';
import { getWeddingMockByTemplateId } from '../weddings/mockData';
import { isWeddingTemplateId } from '../weddings/schema';
import { WeddingScroll } from '../weddings/shared/WeddingScroll';

interface ThemeRendererProps {
  manifest: ThemeManifest;
  data?: ThemeDemoPayload;
  language?: LanguageCode;
  watermarked?: boolean;
  onOpened?: () => void;
}

function renderOccasionMiniSite({
  manifest,
  data,
  language,
  watermarked,
  onOpened,
}: {
  manifest: ThemeManifest;
  data: ThemeDemoPayload;
  language: LanguageCode;
  watermarked: boolean;
  onOpened?: () => void;
}) {
  const sharedProps = { manifest, data, language, watermarked, onOpened };
  switch (manifest.id) {
    case 'birthday-confetti-01':
      return <BirthdayConfettiSite {...sharedProps} />;
    case 'birthday-ashirwad-01':
      return <BirthdayAshirwadSite {...sharedProps} />;
    case 'will-you-01':
      return <WillYouSite {...sharedProps} />;
    case 'our-timeline-01':
      return <OurTimelineSite {...sharedProps} />;
    case 'maan-jao-01':
      return <MaanJaoSite {...sharedProps} />;
    case 'make-them-smile-01':
      return <MakeThemSmileSite {...sharedProps} />;
    case 'our-year-01':
      return <OurYearWrappedSite {...sharedProps} />;
    case 'harvest-greeting-01':
      return <HarvestGreetingSite {...sharedProps} />;
    case 'business-greeting-01':
      return <BusinessGreetingSite {...sharedProps} />;
    default:
      return <BirthdayConfettiSite {...sharedProps} />;
  }
}

export function ThemeRenderer({
  manifest,
  data,
  language = 'en',
  watermarked = false,
  onOpened,
}: ThemeRendererProps) {
  if (isWeddingTemplateId(manifest.id)) {
    const baseWedding = getWeddingMockByTemplateId(manifest.id);
    const weddingLang =
      language === 'hi' ||
        language === 'gu' ||
        language === 'mr' ||
        language === 'pa' ||
        language === 'bn' ||
        language === 'ta' ||
        language === 'te' ||
        language === 'kn'
        ? language
        : 'en';

    let brideName = baseWedding.brideName;
    let groomName = baseWedding.groomName;
    if (data?.receiverName?.trim()) {
      const parts = data.receiverName
        .split(/\s*(?:&|and|weds|संग)\s*/i)
        .map((part) => part.trim())
        .filter(Boolean);
      if (parts.length >= 2) {
        brideName = parts[0];
        groomName = parts[1];
      } else if (parts.length === 1) {
        brideName = parts[0];
      }
    }

    const customMessage = pickLocalizedText(data?.message, language).trim();
    const customGallery =
      data?.photos && data.photos.length > 0
        ? [...data.photos, ...baseWedding.gallery]
        : baseWedding.gallery;

    return (
      <WeddingScroll
        data={{
          ...baseWedding,
          language: weddingLang,
          brideName,
          groomName,
          personalMessage: customMessage || baseWedding.personalMessage,
          gallery: customGallery,
        }}
        embedded
        onOpen={onOpened}
      />
    );
  }

  const payload = data ?? manifest.demoData;
  return renderOccasionMiniSite({
    manifest,
    data: payload,
    language,
    watermarked,
    onOpened,
  });
}
