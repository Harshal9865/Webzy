'use client';

import React from 'react';
import type { LanguageCode } from '@webzy/core';
import type { ThemeDemoPayload, ThemeManifest } from '../schema';
import {
  BirthdayAshirwadView,
  BirthdayConfettiView,
  MakeThemSmileView,
  OurTimelineView,
} from './CelebrationViews';
import {
  BusinessGreetingView,
  HarvestGreetingView,
  MaanJaoView,
  OurYearView,
  WillYouView,
} from './LoveFestivalBusinessViews';
import { TapToOpenCover } from './TapToOpenCover';

interface ThemeRendererProps {
  manifest: ThemeManifest;
  data?: ThemeDemoPayload;
  language?: LanguageCode;
  watermarked?: boolean;
  onOpened?: () => void;
}

function renderInnerView(
  manifest: ThemeManifest,
  data: ThemeDemoPayload,
  language: LanguageCode,
) {
  switch (manifest.id) {
    case 'birthday-confetti-01':
      return <BirthdayConfettiView manifest={manifest} data={data} language={language} />;
    case 'birthday-ashirwad-01':
      return <BirthdayAshirwadView manifest={manifest} data={data} language={language} />;
    case 'will-you-01':
      return <WillYouView manifest={manifest} data={data} language={language} />;
    case 'our-timeline-01':
      return <OurTimelineView manifest={manifest} data={data} language={language} />;
    case 'maan-jao-01':
      return <MaanJaoView manifest={manifest} data={data} language={language} />;
    case 'make-them-smile-01':
      return <MakeThemSmileView manifest={manifest} data={data} language={language} />;
    case 'our-year-01':
      return <OurYearView manifest={manifest} data={data} language={language} />;
    case 'harvest-greeting-01':
      return <HarvestGreetingView manifest={manifest} data={data} language={language} />;
    case 'business-greeting-01':
      return <BusinessGreetingView manifest={manifest} data={data} language={language} />;
    default:
      return <BirthdayConfettiView manifest={manifest} data={data} language={language} />;
  }
}

export function ThemeRenderer({
  manifest,
  data,
  language = 'en',
  watermarked = false,
  onOpened,
}: ThemeRendererProps) {
  const payload = data ?? manifest.demoData;
  const footerText =
    language === 'hi'
      ? 'Webzy से बना · अपना बनाओ'
      : language === 'hinglish'
        ? 'Made with Webzy · Apna banao'
        : 'Made with Webzy · Create yours';

  return (
    <TapToOpenCover
      recipientName={payload.receiverName}
      senderName={payload.senderName}
      primaryColor={manifest.palette.primary}
      accentColor={manifest.palette.secondary}
      language={language}
      watermarked={watermarked}
      onOpened={onOpened}
    >
      {renderInnerView(manifest, payload, language)}

      <footer className="mt-3 border-t border-black/5 pt-2.5 text-center text-[11px] text-[#2B1B2E]/60">
        {footerText}
      </footer>
    </TapToOpenCover>
  );
}
