'use client';

import React, { useState } from 'react';
import {
  type CoreLanguageCode,
  pickLocalizedText,
  toCoreLanguageCode,
} from '@webzy/core';
import {
  OccasionArtworkBackdrop,
  OccasionCassettePlayer,
  OccasionChapterNav,
  OccasionFilmstripGallery,
  OccasionPhotoGallery,
  type OccasionSiteProps,
  getReplayLabel,
  getWebzyFooterLabel,
} from './shared/OccasionPrimitives';

type AshirwadChapterId = 'sacred' | 'letter' | 'album' | 'blessings';

interface AshirwadCopy {
  coverBadge: string;
  fromLabel: string;
  openCta: string;
  tabs: Record<AshirwadChapterId, string>;
  sacredEyebrow: string;
  diyaPrompt: string;
  diyaLitBadge: string;
  diyaRelightHint: string;
  tributeEyebrow: string;
  letterTitle: string;
  signOffPrefix: string;
  albumEyebrow: string;
  photosTitle: string;
  photosHint: string;
  filmstripCaption: string;
  filmstripFrames: string[];
  photoCaptionPrefix: string;
  cassetteEyebrow: string;
  cassetteTapLabel: string;
  cassettePlayingLabel: string;
  bookletTitle: string;
  pageOf: (page: number, total: number) => string;
  prevLabel: string;
  nextLabel: string;
  pranamSectionEyebrow: string;
  pranamIdle: string;
  pranamCounted: (count: number) => string;
  pranamAcknowledged: string;
  emptyBooklet: string;
  nextChapterPrefix: string;
}

const ASHIRWAD_COPY: Record<CoreLanguageCode, AshirwadCopy> = {
  en: {
    coverBadge: 'Sadar Janamdin · With Respect',
    fromLabel: 'With reverence, from',
    openCta: 'Open with Respect',
    tabs: {
      sacred: 'Sacred Light',
      letter: 'Family Letter',
      album: 'Heirloom Album',
      blessings: 'Memories & Pranam',
    },
    sacredEyebrow: 'Ceremonial Invocation',
    diyaPrompt: 'Tap the Brass Diya to light the sacred flame',
    diyaLitBadge: 'Diya Lit · Family Blessings',
    diyaRelightHint: 'Sacred flame glowing for your health, peace, and longevity.',
    tributeEyebrow: 'A Family Tribute',
    letterTitle: 'Heirloom Family Letter',
    signOffPrefix: 'With eternal gratitude and pranam,',
    albumEyebrow: 'Family Keepsakes',
    photosTitle: 'Heirloom Moments',
    photosHint: 'Tap any portrait to view larger',
    filmstripCaption: 'HEIRLOOM FAMILY REEL · ARCHIVE',
    filmstripFrames: ['Family Blessing', 'Warm Gatherings', 'Timeless Grace'],
    photoCaptionPrefix: 'Family',
    cassetteEyebrow: 'Ceremonial Melody',
    cassetteTapLabel: 'Tap to Play · Santoor Chime',
    cassettePlayingLabel: 'Playing · Santoor Warmth',
    bookletTitle: 'Memories & Gratitude',
    pageOf: (page, total) => `Page ${page} of ${total}`,
    prevLabel: 'Previous',
    nextLabel: 'Next',
    pranamSectionEyebrow: 'Brass Thali Offering',
    pranamIdle: 'Offer Pranam / Send Blessings',
    pranamCounted: (count) => `Offer Pranam / Send Blessings (${count})`,
    pranamAcknowledged: 'Received with folded hands and deep family gratitude.',
    emptyBooklet: 'Your warmth and wisdom guide every generation of our home.',
    nextChapterPrefix: 'Next Chapter',
  },
  hinglish: {
    coverBadge: 'Sadar Janamdin · With Respect',
    fromLabel: 'Aadar sahit:',
    openCta: 'Open with Respect',
    tabs: {
      sacred: 'Sacred Light',
      letter: 'Family Letter',
      album: 'Heirloom Album',
      blessings: 'Memories & Pranam',
    },
    sacredEyebrow: 'Shubh Aarti & Diya',
    diyaPrompt: 'Shubh jyot jalaane ke liye Brass Diya par tap karein',
    diyaLitBadge: 'Diya Lit · Family Blessings',
    diyaRelightHint: 'Aapki lambi umar aur sukoon ke liye pavitra jyot roshan hai.',
    tributeEyebrow: 'Parivaar ka Ashirwad',
    letterTitle: 'Parivaar ka Patra',
    signOffPrefix: 'Dil se aadar aur pranam,',
    albumEyebrow: 'Anmol Yaadein',
    photosTitle: 'Heirloom Moments',
    photosHint: 'Badi photo dekhne ke liye tap karein',
    filmstripCaption: 'PARIVAAR REEL · HEIRLOOM ARCHIVE',
    filmstripFrames: ['Parivaar Ashirwad', 'Ghar ki Raunak', 'Anmol Pal'],
    photoCaptionPrefix: 'Parivaar',
    cassetteEyebrow: 'Santoor Dhun',
    cassetteTapLabel: 'Tap Karein · Santoor Chime',
    cassettePlayingLabel: 'Baj Raha Hai · Santoor Warmth',
    bookletTitle: 'Memories & Gratitude',
    pageOf: (page, total) => `Page ${page} of ${total}`,
    prevLabel: 'Previous',
    nextLabel: 'Next',
    pranamSectionEyebrow: 'Peetal ki Thali · Sadar Pranam',
    pranamIdle: 'Offer Pranam / Send Blessings',
    pranamCounted: (count) => `Offer Pranam / Send Blessings (${count})`,
    pranamAcknowledged: 'Hath jodkar parivaar ki taraf se sadar pranam.',
    emptyBooklet: 'Aapka pyaar aur ashirwad hamare ghar ki sabse badi daulat hai.',
    nextChapterPrefix: 'Agla Adhyay',
  },
  hi: {
    coverBadge: 'सादर जन्मदिन · ससम्मान',
    fromLabel: 'सादर प्रेषक:',
    openCta: 'ससम्मान खोलें',
    tabs: {
      sacred: 'पावन दीप',
      letter: 'परिवार पत्र',
      album: 'अनमोल एल्बम',
      blessings: 'यादें व प्रणाम',
    },
    sacredEyebrow: 'मंगल दीप प्रज्वलन',
    diyaPrompt: 'मंगल ज्योति प्रज्वलित करने के लिए पीतल के दीये पर टैप करें',
    diyaLitBadge: 'दीया प्रज्वलित · परिवार का आशीर्वाद',
    diyaRelightHint: 'आपके उत्तम स्वास्थ्य, सुख और दीर्घायु के लिए पावन ज्योति प्रज्वलित है।',
    tributeEyebrow: 'परिवार का आशीर्वाद',
    letterTitle: 'परिवार की ओर से सादर पत्र',
    signOffPrefix: 'सादर चरण स्पर्श एवं आभार,',
    albumEyebrow: 'परिवार की धरोहर',
    photosTitle: 'परिवार की अनमोल यादें',
    photosHint: 'बड़ी फ़ोटो देखने के लिए टैप करें',
    filmstripCaption: 'परिवार स्मृति रील · धरोहर',
    filmstripFrames: ['परिवार आशीर्वाद', 'स्नेह के पल', 'अनमोल स्मृति'],
    photoCaptionPrefix: 'परिवार',
    cassetteEyebrow: 'मंगल संतूर धुन',
    cassetteTapLabel: 'सुनने के लिए टैप करें · संतूर धुन',
    cassettePlayingLabel: 'बज रही है · संतूर की मधुर धुन',
    bookletTitle: 'यादें और कृतज्ञता',
    pageOf: (page, total) => `पृष्ठ ${page} / ${total}`,
    prevLabel: 'पिछला',
    nextLabel: 'अगला',
    pranamSectionEyebrow: 'पीतल की थाली · सादर प्रणाम',
    pranamIdle: 'प्रणाम अर्पित करें / आशीर्वाद',
    pranamCounted: (count) => `प्रणाम अर्पित करें / आशीर्वाद (${count})`,
    pranamAcknowledged: 'हाथ जोड़कर परिवार की ओर से सादर प्रणाम एवं शुभकामनाएँ।',
    emptyBooklet: 'आपका स्नेह और आशीर्वाद हमारे घर की सबसे बड़ी शक्ति है।',
    nextChapterPrefix: 'अगला अध्याय',
  },
};

const CHAPTER_ORDER: readonly AshirwadChapterId[] = ['sacred', 'letter', 'album', 'blessings'];

const RELATION_LABELS: Record<string, Record<CoreLanguageCode, string>> = {
  mummy: { en: 'Beloved Mother', hinglish: 'Mummy / Maa', hi: 'मम्मी / माँ' },
  papa: { en: 'Revered Father', hinglish: 'Papa / Pitaji', hi: 'पापा / पिताजी' },
  grandparent: { en: 'Respected Elder', hinglish: 'Dada-Dadi / Nana-Nani', hi: 'दादा-दादी / नाना-नानी' },
};

function resolveRelationLabel(relation: string | undefined, coreLang: CoreLanguageCode): string | null {
  if (!relation?.trim()) return null;
  const normalized = relation.trim().toLowerCase();
  const mapped = RELATION_LABELS[normalized];
  if (mapped) return mapped[coreLang];
  return relation.trim();
}

function MarigoldToranBorder() {
  return (
    <svg
      viewBox="0 0 360 34"
      className="h-7 w-full shrink-0"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 6 Q60 22 120 8 Q180 24 240 8 Q300 22 352 6"
        stroke="#B45309"
        strokeWidth="1.5"
        strokeOpacity="0.55"
        fill="none"
      />
      {[36, 90, 144, 180, 216, 270, 324].map((cx, index) => (
        <g key={cx}>
          <path
            d={`M${cx - 12} 8 C${cx - 10} 20, ${cx - 4} 24, ${cx - 6} 10 Z`}
            fill="#657A3A"
            fillOpacity="0.65"
          />
          <path
            d={`M${cx + 12} 8 C${cx + 10} 20, ${cx + 4} 24, ${cx + 6} 10 Z`}
            fill="#657A3A"
            fillOpacity="0.65"
          />
          <circle
            cx={cx}
            cy={index === 3 ? 17 : 13}
            r={index === 3 ? 6.5 : 5}
            fill="#D97706"
          />
          <circle
            cx={cx}
            cy={index === 3 ? 17 : 13}
            r={index === 3 ? 3 : 2.2}
            fill="#FEF3C7"
          />
        </g>
      ))}
    </svg>
  );
}

function BrassLotusKalashSeal() {
  return (
    <div
      className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#D97706]/70 bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#D97706]/35 shadow-[0_4px_14px_rgba(180,83,9,0.22),inset_0_1px_2px_rgba(255,255,255,0.9)]"
      aria-hidden="true"
    >
      <div className="flex h-[82px] w-[82px] items-center justify-center rounded-full border border-[#B45309]/45 bg-[#FFFBEB]/85">
        <svg viewBox="0 0 64 64" className="h-12 w-12 text-[#B45309]" fill="none">
          <circle cx="32" cy="32" r="27" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" />
          {/* Lotus petals */}
          <path
            d="M32 13 C27 21, 27 28, 32 33 C37 28, 37 21, 32 13 Z"
            fill="#D97706"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M32 33 C23 30, 17 24, 17 18 C23 19, 28 24, 32 33 Z"
            fill="#D97706"
            fillOpacity="0.16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M32 33 C41 30, 47 24, 47 18 C41 19, 36 24, 32 33 Z"
            fill="#D97706"
            fillOpacity="0.16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Ceremonial kalash vessel */}
          <path
            d="M23 35 H41 L38 41 C41 44, 39 50, 32 50 C25 50, 23 44, 26 41 Z"
            fill="#B45309"
            fillOpacity="0.14"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M21 35 H43" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M26 52 H38" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function GlowingBrassDiya({ lit }: { lit: boolean }) {
  return (
    <div className="relative mx-auto flex h-28 w-32 items-center justify-center" aria-hidden="true">
      {/* Ambient / boosted golden flame halo */}
      <span
        className={`pointer-events-none absolute rounded-full transition-all duration-500 motion-reduce:transition-none ${
          lit
            ? 'h-28 w-28 bg-amber-400/50 blur-xl animate-pulse motion-reduce:animate-none'
            : 'h-16 w-16 bg-amber-300/25 blur-lg'
        }`}
      />
      {lit ? (
        <span className="pointer-events-none absolute h-20 w-20 rounded-full border border-[#F59E0B]/40 bg-[#FEF3C7]/45 blur-sm" />
      ) : null}

      <svg viewBox="0 0 96 76" className="relative h-24 w-28" fill="none">
        {/* Sacred light rays revealed when diya is lit */}
        {lit ? (
          <g stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7">
            <line x1="48" y1="3" x2="48" y2="8" />
            <line x1="27" y1="11" x2="31" y2="15" />
            <line x1="69" y1="11" x2="65" y2="15" />
            <line x1="19" y1="24" x2="25" y2="25" />
            <line x1="77" y1="24" x2="71" y2="25" />
          </g>
        ) : null}

        {/* Flame */}
        <g
          className="transition-transform duration-500 motion-reduce:transition-none"
          style={{
            transform: lit ? 'scale(1.14) translateY(-2px)' : 'scale(0.95)',
            transformOrigin: '48px 36px',
          }}
        >
          <path
            d="M48 11 C42 20, 39.5 27, 43 33 C45 36, 51 36, 53 33 C56.5 27, 54 20, 48 11 Z"
            fill={lit ? '#F59E0B' : '#FBBF24'}
            stroke="#B45309"
            strokeWidth="1.4"
          />
          <path
            d="M48 17 C45.5 22, 45 27, 46.8 30 C47.5 31.2, 48.5 31.2, 49.2 30 C51 27, 50.5 22, 48 17 Z"
            fill={lit ? '#FFFBEB' : '#FEF3C7'}
          />
        </g>

        {/* Brass diya bowl */}
        <path
          d="M22 40 C26 52, 36 57, 48 57 C60 57, 70 52, 74 40 C62 43, 34 43, 22 40 Z"
          fill="#D97706"
          fillOpacity={lit ? '0.3' : '0.2'}
          stroke="#B45309"
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        <ellipse
          cx="48"
          cy="40"
          rx="26"
          ry="4.2"
          fill="#FEF3C7"
          fillOpacity="0.6"
          stroke="#B45309"
          strokeWidth="1.4"
        />
        <path d="M33 62 H63" stroke="#B45309" strokeWidth="2.1" strokeLinecap="round" />
        <path d="M40 57 L37 62 M56 57 L59 62" stroke="#B45309" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function ToranRosetteDivider() {
  return (
    <div className="my-2.5 flex items-center justify-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D97706]/45 to-[#B45309]/55" />
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#B45309]" fill="none">
        <path
          d="M12 3 L15 9 L21 12 L15 15 L12 21 L9 15 L3 12 L9 9 Z"
          fill="#D97706"
          fillOpacity="0.25"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#D97706]/45 to-[#B45309]/55" />
    </div>
  );
}

function BrassThaliIcon() {
  return (
    <svg viewBox="0 0 28 28" className="h-5 w-5 shrink-0" fill="none" aria-hidden="true">
      <ellipse cx="14" cy="18" rx="11" ry="5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M14 7 C12.5 10, 12 12, 13.2 13.5 C13.7 14.2, 14.3 14.2, 14.8 13.5 C16 12, 15.5 10, 14 7 Z" fill="currentColor" />
      <path d="M10.5 15.5 H17.5 L16.2 18 H11.8 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function NextArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10h10m-4-4l4 4-4 4" />
    </svg>
  );
}

/**
 * Dedicated 4-Chapter Heirloom Family Website ("Birthday Ashirwad").
 * Preserves ceremonial marigold-and-brass dignity across Sacred Light, Family Letter,
 * Heirloom Album, and Memories & Pranam chapters.
 */
export function BirthdayAshirwadSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const [opened, setOpened] = useState(false);
  const [activeChapter, setActiveChapter] = useState<AshirwadChapterId>('sacred');
  const [diyaLit, setDiyaLit] = useState(false);
  const [pageIdx, setPageIdx] = useState(0);
  const [blessCount, setBlessCount] = useState(0);

  const coreLang = toCoreLanguageCode(language);
  const copy = ASHIRWAD_COPY[coreLang] ?? ASHIRWAD_COPY.en;
  const primaryColor = manifest.palette.primary || '#B45309';
  const highlights = data.highlights ?? [];
  const safePageIdx = highlights.length > 0 ? Math.min(pageIdx, highlights.length - 1) : 0;
  const currentHighlight = highlights[safePageIdx];
  const relationLabel = resolveRelationLabel(data.relation, coreLang);
  const themeTitle = pickLocalizedText(manifest.name, language);
  const messageText = pickLocalizedText(data.message, language);
  const canUseBrassDropCap = coreLang !== 'hi' && /^[A-Za-z]/.test(messageText.trim());

  const chapterTabs = CHAPTER_ORDER.map((id) => ({ id, label: copy.tabs[id] }));

  function handleOpen() {
    setOpened(true);
    setActiveChapter('sacred');
    onOpened?.();
  }

  function handleReplay() {
    setOpened(false);
    setActiveChapter('sacred');
    setDiyaLit(false);
  }

  function goNextChapter() {
    const idx = CHAPTER_ORDER.indexOf(activeChapter);
    const next = CHAPTER_ORDER[(idx + 1) % CHAPTER_ORDER.length];
    setActiveChapter(next);
  }

  const nextChapterId = CHAPTER_ORDER[(CHAPTER_ORDER.indexOf(activeChapter) + 1) % CHAPTER_ORDER.length];

  return (
    <div className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#FFFBEB] text-[#2B1B2E]">
      {watermarked ? (
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-20 flex justify-center border-b border-[#F5E6C8] bg-[#FEF3C7]/90 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#92400E]"
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      {!opened ? (
        <div className="relative flex flex-1 flex-col justify-between overflow-hidden">
          <OccasionArtworkBackdrop
            src="/templates/occasions/birthday-ashirwad/cover.jpg"
            fallbackGradient="linear-gradient(155deg, #FFFBEB 0%, #FEF3C7 60%, #FFF7ED 100%)"
            className="object-cover object-center opacity-30"
          />

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
            <div className="relative w-full max-w-md rounded-2xl border border-[#F5E6C8] bg-[#FFFBEB]/92 px-5 py-6 text-center shadow-[0_8px_30px_rgba(180,83,9,0.12)] outline outline-1 -outline-offset-4 outline-[#D97706]/30 backdrop-blur-[2px]">
              <MarigoldToranBorder />

              <div className="mt-4 flex flex-col items-center">
                <BrassLotusKalashSeal />

                <span className="mt-5 inline-block rounded-full border border-[#F5E6C8] bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B45309] shadow-2xs">
                  {copy.coverBadge}
                </span>

                <h2 className="mt-4 max-w-full break-words font-heading text-[28px] font-bold leading-tight text-[#2B1B2E] sm:text-[32px]">
                  {data.receiverName}
                </h2>

                {relationLabel ? (
                  <p className="mt-1.5 font-serif text-sm font-semibold tracking-wide text-[#B45309]">
                    {relationLabel}
                  </p>
                ) : null}

                <p className="mt-2 max-w-full break-words font-serif text-base text-[#2B1B2E]/85">
                  {copy.fromLabel}{' '}
                  <span className="font-semibold text-[#2B1B2E]">{data.senderName}</span>
                </p>

                <button
                  type="button"
                  onClick={handleOpen}
                  aria-label={`${copy.openCta} — ${themeTitle}`}
                  className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#92400E] bg-gradient-to-b from-[#D97706] to-[#B45309] px-8 py-3 font-serif text-base font-bold tracking-wide text-white shadow-[0_4px_14px_rgba(180,83,9,0.3)] transition duration-200 hover:brightness-105 active:translate-y-[1px] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFBEB] motion-reduce:transition-none"
                >
                  {copy.openCta}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col justify-between gap-3.5 px-4 pb-5 pt-3 animate-fade-in motion-reduce:animate-none sm:px-6">
          {/* Top bar with theme title, Replay pill, and 4-Chapter Navigation */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex min-h-[32px] items-center rounded-full border border-[#F5E6C8] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#B45309] shadow-2xs">
                {themeTitle}
              </span>
              <button
                type="button"
                onClick={handleReplay}
                className="inline-flex min-h-[44px] items-center rounded-full border border-[#D97706]/45 bg-white px-4 text-xs font-semibold text-[#2B1B2E] shadow-2xs transition hover:bg-[#FEF3C7]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                {getReplayLabel(language)}
              </button>
            </div>

            <OccasionChapterNav
              tabs={chapterTabs}
              activeId={activeChapter}
              onSelect={(id) => setActiveChapter(id as AshirwadChapterId)}
              accentColor={primaryColor}
            />
          </div>

          {/* CHAPTER 01: Sacred Light */}
          {activeChapter === 'sacred' ? (
            <section
              role="tabpanel"
              aria-label={copy.tabs.sacred}
              className="flex flex-1 flex-col justify-between rounded-2xl border border-[#F5E6C8] bg-white px-5 py-5 text-center shadow-[0_2px_10px_rgba(43,27,46,0.04),0_12px_24px_rgba(180,83,9,0.07)] outline outline-1 -outline-offset-4 outline-[#D97706]/25 animate-fade-in motion-reduce:animate-none"
            >
              <div>
                <MarigoldToranBorder />
                <span className="mt-2 inline-block rounded-full border border-[#F5E6C8] bg-[#FFFBEB] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B45309]">
                  {copy.sacredEyebrow}
                </span>
              </div>

              <div className="my-4 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setDiyaLit((lit) => !lit)}
                  aria-pressed={diyaLit}
                  aria-label={diyaLit ? copy.diyaLitBadge : copy.diyaPrompt}
                  className={`group flex min-h-[44px] flex-col items-center justify-center rounded-2xl border px-6 py-4 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] focus-visible:ring-offset-2 motion-reduce:transition-none ${
                    diyaLit
                      ? 'border-[#D97706]/55 bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7]/75 shadow-[0_8px_24px_rgba(217,119,6,0.18)]'
                      : 'border-[#F5E6C8] bg-[#FFFBEB]/65 hover:border-[#D97706]/45 hover:bg-[#FFFBEB]'
                  }`}
                >
                  <GlowingBrassDiya lit={diyaLit} />

                  {diyaLit ? (
                    <span className="mt-2 inline-flex min-h-[32px] items-center rounded-full border border-[#D97706]/45 bg-white px-4 py-1 text-xs font-bold tracking-wide text-[#B45309] shadow-2xs animate-pop-bounce motion-reduce:animate-none">
                      {copy.diyaLitBadge}
                    </span>
                  ) : (
                    <span className="mt-2 inline-flex min-h-[32px] items-center rounded-full border border-[#F5E6C8] bg-white px-3.5 py-1 text-xs font-semibold text-[#92400E] transition group-hover:border-[#D97706]/45">
                      {copy.diyaPrompt}
                    </span>
                  )}
                </button>

                {diyaLit ? (
                  <p className="mt-2.5 max-w-xs font-serif text-xs font-medium text-[#92400E] animate-fade-in motion-reduce:animate-none">
                    {copy.diyaRelightHint}
                  </p>
                ) : null}
              </div>

              <div className="space-y-3">
                <ToranRosetteDivider />
                <h3 className="break-words font-heading text-[26px] font-bold leading-snug text-[#2B1B2E] sm:text-[30px]">
                  {pickLocalizedText(data.headline, language)}
                </h3>
                {relationLabel ? (
                  <p className="font-serif text-xs font-semibold tracking-wide text-[#B45309]">
                    {data.receiverName} · {relationLabel}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={goNextChapter}
                  className="mt-2 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#D97706]/45 bg-[#FFFBEB] px-6 py-2.5 font-serif text-xs font-bold text-[#92400E] transition hover:bg-[#FEF3C7] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] motion-reduce:transition-none"
                >
                  <span>
                    {copy.nextChapterPrefix}: {copy.tabs[nextChapterId]}
                  </span>
                  <NextArrowIcon />
                </button>
              </div>
            </section>
          ) : null}

          {/* CHAPTER 02: Family Letter */}
          {activeChapter === 'letter' ? (
            <section
              role="tabpanel"
              aria-label={copy.tabs.letter}
              className="flex flex-1 flex-col justify-center animate-fade-in motion-reduce:animate-none"
            >
              {/* Khadi parchment double-bordered tribute letter */}
              <div className="rounded-2xl border border-[#E7D3AD] bg-[#FDF9EE] p-1.5 shadow-[0_4px_18px_rgba(180,83,9,0.08)]">
                <div className="rounded-[12px] border border-[#D97706]/35 bg-[#FFFDF8] px-5 py-6 text-center">
                  <span className="inline-block rounded-full border border-[#F5E6C8] bg-[#FFFBEB] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B45309]">
                    {copy.tributeEyebrow}
                  </span>

                  <h3 className="mt-3 font-heading text-xl font-bold text-[#2B1B2E] sm:text-2xl">
                    {copy.letterTitle}
                  </h3>

                  <ToranRosetteDivider />

                  <p
                    className={`mt-4 break-words text-left font-serif text-[17px] leading-[1.72] text-[#2B1B2E] sm:text-[18px] ${
                      canUseBrassDropCap
                        ? 'first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:font-heading first-letter:text-[42px] first-letter:font-bold first-letter:leading-[0.85] first-letter:text-[#B45309]'
                        : ''
                    }`}
                  >
                    {messageText}
                  </p>

                  <div className="clear-both mt-5">
                    <ToranRosetteDivider />
                  </div>

                  <div className="mt-4 pt-1 text-center">
                    <p className="font-serif text-sm text-[#2B1B2E]/75">{copy.signOffPrefix}</p>
                    <p className="mt-1 font-heading text-lg font-bold text-[#B45309]">
                      {data.senderName}
                    </p>
                    {relationLabel ? (
                      <p className="mt-0.5 text-xs font-semibold tracking-wide text-[#2B1B2E]/70">
                        {data.receiverName} · {relationLabel}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={goNextChapter}
                    className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#D97706]/45 bg-[#FFFBEB] px-6 py-2.5 font-serif text-xs font-bold text-[#92400E] transition hover:bg-[#FEF3C7] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] motion-reduce:transition-none"
                  >
                    <span>
                      {copy.nextChapterPrefix}: {copy.tabs[nextChapterId]}
                    </span>
                    <NextArrowIcon />
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {/* CHAPTER 03: Heirloom Album */}
          {activeChapter === 'album' ? (
            <section
              role="tabpanel"
              aria-label={copy.tabs.album}
              className="flex flex-1 flex-col justify-between gap-4 rounded-2xl border border-[#F5E6C8] bg-white p-5 shadow-[0_2px_10px_rgba(43,27,46,0.04),0_12px_24px_rgba(180,83,9,0.07)] outline outline-1 -outline-offset-4 outline-[#D97706]/20 animate-fade-in motion-reduce:animate-none"
            >
              <div className="space-y-4">
                <div className="text-center">
                  <span className="inline-block rounded-full border border-[#F5E6C8] bg-[#FFFBEB] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B45309]">
                    {copy.albumEyebrow}
                  </span>
                  <h3 className="mt-2 font-heading text-xl font-bold text-[#2B1B2E]">
                    {copy.photosTitle}
                  </h3>
                </div>

                {data.photos && data.photos.length > 0 ? (
                  <div>
                    <OccasionPhotoGallery
                      photos={data.photos}
                      accentColor={primaryColor}
                      surfaceTint="#FFFBEB"
                      variant="heirloom"
                      captionPrefix={copy.photoCaptionPrefix}
                    />
                    <p className="mt-2 text-center text-xs font-medium text-[#2B1B2E]/70">
                      {copy.photosHint}
                    </p>
                  </div>
                ) : null}

                <OccasionFilmstripGallery
                  photos={data.photos}
                  fallbackImage="/templates/occasions/birthday-ashirwad/cover.jpg"
                  accentColor={primaryColor}
                  caption={copy.filmstripCaption}
                  frameLabels={copy.filmstripFrames}
                />

                <div className="space-y-1.5 pt-1">
                  <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#B45309]">
                    {copy.cassetteEyebrow}
                  </p>
                  <OccasionCassettePlayer
                    mood="warm"
                    trackTitle="Santoor Warmth"
                    tapLabel={copy.cassetteTapLabel}
                    playingLabel={copy.cassettePlayingLabel}
                    accentColor={primaryColor}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={goNextChapter}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 self-center rounded-full border border-[#D97706]/45 bg-[#FFFBEB] px-6 py-2.5 font-serif text-xs font-bold text-[#92400E] transition hover:bg-[#FEF3C7] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] motion-reduce:transition-none"
              >
                <span>
                  {copy.nextChapterPrefix}: {copy.tabs[nextChapterId]}
                </span>
                <NextArrowIcon />
              </button>
            </section>
          ) : null}

          {/* CHAPTER 04: Memories & Pranam */}
          {activeChapter === 'blessings' ? (
            <section
              role="tabpanel"
              aria-label={copy.tabs.blessings}
              className="flex flex-1 flex-col justify-between gap-4 animate-fade-in motion-reduce:animate-none"
            >
              {/* Paginated "Memories & Gratitude" Keepsake Booklet */}
              <div className="rounded-2xl border border-[#F5E6C8] bg-white p-5 shadow-[0_2px_10px_rgba(43,27,46,0.04),0_10px_22px_rgba(180,83,9,0.06)] outline outline-1 -outline-offset-4 outline-[#D97706]/20">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F5E6C8] pb-3">
                  <h3 className="font-heading text-lg font-bold text-[#2B1B2E]">
                    {copy.bookletTitle}
                  </h3>
                  {highlights.length > 0 ? (
                    <span className="rounded-full border border-[#F5E6C8] bg-[#FFFBEB] px-3 py-1 text-xs font-semibold text-[#B45309]">
                      {copy.pageOf(safePageIdx + 1, highlights.length)}
                    </span>
                  ) : null}
                </div>

                {currentHighlight ? (
                  <div key={safePageIdx} className="mt-4 text-left animate-fade-in motion-reduce:animate-none">
                    <p className="font-heading text-lg font-bold text-[#B45309]">
                      {pickLocalizedText(currentHighlight.title, language)}
                    </p>
                    <p className="mt-2 font-serif text-[17px] leading-[1.65] text-[#2B1B2E]">
                      {pickLocalizedText(currentHighlight.detail, language)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 font-serif text-[17px] leading-[1.65] text-[#2B1B2E]">
                    {copy.emptyBooklet}
                  </p>
                )}

                {highlights.length > 1 ? (
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#F5E6C8] pt-4">
                    <button
                      type="button"
                      disabled={safePageIdx === 0}
                      onClick={() => setPageIdx((prev) => Math.max(0, prev - 1))}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#D97706]/45 bg-[#FFFBEB] px-4 text-sm font-semibold text-[#2B1B2E] transition hover:bg-[#FEF3C7] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] motion-reduce:transition-none"
                    >
                      {copy.prevLabel}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {highlights.map((item, idx) => {
                        const isActive = idx === safePageIdx;
                        return (
                          <button
                            key={`${item.title.en}-${idx}`}
                            type="button"
                            onClick={() => setPageIdx(idx)}
                            aria-label={copy.pageOf(idx + 1, highlights.length)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full px-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] motion-reduce:transition-none ${
                              isActive
                                ? 'bg-[#B45309] text-white shadow-xs'
                                : 'border border-[#F5E6C8] bg-[#FFFBEB] text-[#2B1B2E] hover:bg-[#FEF3C7]'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={safePageIdx >= highlights.length - 1}
                      onClick={() => setPageIdx((prev) => Math.min(highlights.length - 1, prev + 1))}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#D97706]/45 bg-[#FFFBEB] px-4 text-sm font-semibold text-[#2B1B2E] transition hover:bg-[#FEF3C7] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] motion-reduce:transition-none"
                    >
                      {copy.nextLabel}
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Interactive Brass Thali Pranam Counter Stamp */}
              <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-[#F5E6C8] bg-white/90 px-4 py-4 text-center shadow-2xs">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B45309]">
                  {copy.pranamSectionEyebrow}
                </span>

                <button
                  type="button"
                  onClick={() => setBlessCount((c) => c + 1)}
                  className="inline-flex min-h-[48px] w-full max-w-sm items-center justify-center gap-2.5 rounded-full border border-[#92400E] bg-gradient-to-b from-[#D97706] to-[#B45309] px-6 py-3 font-serif text-base font-bold text-white shadow-[0_4px_14px_rgba(180,83,9,0.28)] transition hover:brightness-105 active:translate-y-[1px] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFBEB] motion-reduce:transition-none"
                >
                  <BrassThaliIcon />
                  <span>{blessCount > 0 ? copy.pranamCounted(blessCount) : copy.pranamIdle}</span>
                </button>

                {blessCount > 0 ? (
                  <p className="rounded-full border border-[#F5E6C8] bg-[#FFFBEB] px-4 py-1.5 font-serif text-xs font-medium text-[#92400E] animate-fade-in motion-reduce:animate-none">
                    {copy.pranamAcknowledged}
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}

          <footer className="mt-1 w-full border-t border-[#F5E6C8] pt-3 text-center text-xs font-medium text-[#2B1B2E]/70">
            {getWebzyFooterLabel(language)}
          </footer>
        </div>
      )}
    </div>
  );
}
