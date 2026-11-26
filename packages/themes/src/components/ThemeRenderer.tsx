'use client';

import React, { lazy, Suspense } from 'react';
import { type LanguageCode, pickLocalizedText } from '@webzy/core';
import type { ThemeDemoPayload, ThemeManifest } from '../schema';
import { getWeddingMockByTemplateId } from '../weddings/mockData';
import { isWeddingTemplateId } from '../weddings/schema';

// Code-split every theme renderer into its own on-demand chunk so pages never download all 14 themes at once.
const BirthdayAshirwadSite = lazy(() =>
  import('../occasions/BirthdayAshirwadSite').then((m) => ({ default: m.BirthdayAshirwadSite })),
);
const BirthdayConfettiSite = lazy(() =>
  import('../occasions/BirthdayConfettiSite').then((m) => ({ default: m.BirthdayConfettiSite })),
);
const BusinessGreetingSite = lazy(() =>
  import('../occasions/BusinessGreetingSite').then((m) => ({ default: m.BusinessGreetingSite })),
);
const HarvestGreetingSite = lazy(() =>
  import('../occasions/HarvestGreetingSite').then((m) => ({ default: m.HarvestGreetingSite })),
);
const MaanJaoSite = lazy(() =>
  import('../occasions/MaanJaoSite').then((m) => ({ default: m.MaanJaoSite })),
);
const MakeThemSmileSite = lazy(() =>
  import('../occasions/MakeThemSmileSite').then((m) => ({ default: m.MakeThemSmileSite })),
);
const OurTimelineSite = lazy(() =>
  import('../occasions/OurTimelineSite').then((m) => ({ default: m.OurTimelineSite })),
);
const OurYearWrappedSite = lazy(() =>
  import('../occasions/OurYearWrappedSite').then((m) => ({ default: m.OurYearWrappedSite })),
);
const PortfolioSite = lazy(() =>
  import('../occasions/PortfolioSite').then((m) => ({ default: m.PortfolioSite })),
);
const SmallBusinessSite = lazy(() =>
  import('../occasions/SmallBusinessSite').then((m) => ({ default: m.SmallBusinessSite })),
);
const WillYouSite = lazy(() =>
  import('../occasions/WillYouSite').then((m) => ({ default: m.WillYouSite })),
);
const WeddingScroll = lazy(() =>
  import('../weddings/shared/WeddingScroll').then((m) => ({ default: m.WeddingScroll })),
);

interface ThemeRendererProps {
  manifest: ThemeManifest;
  data?: ThemeDemoPayload;
  language?: LanguageCode;
  watermarked?: boolean;
  onOpened?: () => void;
}

function ThemeLoadingSkeleton({ surface, primary }: { surface: string; primary: string }) {
  return (
    <div
      className="flex min-h-[360px] w-full flex-col items-center justify-center gap-3 rounded-[28px] p-6"
      style={{ backgroundColor: surface }}
      aria-busy="true"
    >
      <span
        className="h-7 w-7 animate-spin rounded-full border-2 border-t-transparent"
        style={{ borderColor: `${primary}40`, borderTopColor: primary }}
      />
    </div>
  );
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
    case 'portfolio-01':
      return <PortfolioSite {...sharedProps} />;
    case 'small-business-01':
      return <SmallBusinessSite {...sharedProps} />;
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
      <Suspense
        fallback={
          <ThemeLoadingSkeleton
            surface={manifest.palette.surface}
            primary={manifest.palette.primary}
          />
        }
      >
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
      </Suspense>
    );
  }

  const payload = data ?? manifest.demoData;
  return (
    <Suspense
      fallback={
        <ThemeLoadingSkeleton
          surface={manifest.palette.surface}
          primary={manifest.palette.primary}
        />
      }
    >
      {renderOccasionMiniSite({
        manifest,
        data: payload,
        language,
        watermarked,
        onOpened,
      })}
    </Suspense>
  );
}
