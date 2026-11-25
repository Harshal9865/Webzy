'use client';

import React, { useEffect, useState } from 'react';
import { type CoreLanguageCode, pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  getReplayLabel,
  getWebzyFooterLabel,
  OccasionArtworkBackdrop,
  OccasionCassettePlayer,
  OccasionChapterNav,
  OccasionFilmstripGallery,
  OccasionPhotoGallery,
  type OccasionSiteProps,
} from './shared/OccasionPrimitives';

type TimelineChapterId = 'heart-tree' | 'e-magazine' | 'milestones' | 'keepsake';

const CHAPTER_ORDER: readonly TimelineChapterId[] = [
  'heart-tree',
  'e-magazine',
  'milestones',
  'keepsake',
];

interface TimelineCopy {
  editionPill: string;
  volumeSubtitle: string;
  fromLabel: string;
  openCta: string;
  tapHint: string;
  tabs: Record<TimelineChapterId, string>;
  treeScriptHeader: string;
  treeBotanicalTag: string;
  bloomPetalsCta: string;
  bloomingAgainCta: string;
  petalsCountLabel: (count: number) => string;
  loveLetterBadge: string;
  magazineMasthead: string;
  magazineLeftTitle: string;
  magazineLeftSub: string;
  magazineRightTitle: string;
  magazineRightSub: string;
  magazineIssueNote: string;
  polaroidHeading: string;
  filmstripCaption: string;
  timelineEyebrow: string;
  chaptersCountLabel: (count: number) => string;
  tapToOpenMemory: string;
  cassetteHeading: string;
  cassetteTapLabel: string;
  cassettePlayingLabel: string;
  vowHeading: string;
  vowQuote: string;
  signaturePrefix: string;
  sealKeepsake: string;
  keepsakeSealed: string;
  sealedStampNote: string;
  colophonNote: string;
  nextChapterLabel: string;
}

const TIMELINE_COPY: Record<CoreLanguageCode, TimelineCopy> = {
  en: {
    editionPill: 'ANNIVERSARY EDITION',
    volumeSubtitle: 'Chapters of Us',
    fromLabel: 'Crafted by',
    openCta: 'Open Our Timeline',
    tapHint: 'Tap the folio cover or button to open',
    tabs: {
      'heart-tree': 'Heart Tree',
      'e-magazine': 'E-Magazine',
      milestones: 'Milestones',
      keepsake: 'Keepsake',
    },
    treeScriptHeader: 'to us and a love that blooms',
    treeBotanicalTag: 'A GIFT OF FLOWERS',
    bloomPetalsCta: 'Bloom Petals',
    bloomingAgainCta: 'Bloom More Petals',
    petalsCountLabel: (count) => `${count} Bloom${count === 1 ? '' : 's'}`,
    loveLetterBadge: 'LOVE LETTER',
    magazineMasthead: 'ANNIVERSARY E-MAGAZINE',
    magazineLeftTitle: 'YOU & ME',
    magazineLeftSub: 'Written in quiet mornings & shared laughter',
    magazineRightTitle: 'FOREVER.',
    magazineRightSub: 'Special Collector Issue',
    magazineIssueNote: 'Curated frames from our favorite chapters together.',
    polaroidHeading: 'Polaroid Prints',
    filmstripCaption: '35MM ANNIVERSARY REEL',
    timelineEyebrow: 'MILESTONE ARCHIVE',
    chaptersCountLabel: (count) => `${String(count).padStart(2, '0')} Chapters`,
    tapToOpenMemory: 'Tap to open memory',
    cassetteHeading: 'OUR SOUNDTRACK',
    cassetteTapLabel: 'Play Warm Chime',
    cassettePlayingLabel: 'Playing Acoustic Chime...',
    vowHeading: 'Chapters Ahead',
    vowQuote: '"Grateful for every chapter yet to come."',
    signaturePrefix: 'With love,',
    sealKeepsake: 'Seal This Keepsake',
    keepsakeSealed: 'Keepsake Sealed',
    sealedStampNote: 'Wax seal pressed · Archive preserved',
    colophonNote: 'Handcrafted anniversary keepsake — preserved in memory.',
    nextChapterLabel: 'Next',
  },
  hinglish: {
    editionPill: 'ANNIVERSARY EDITION',
    volumeSubtitle: 'Chapters of Us · Hamara Safar',
    fromLabel: 'Dil se bheja:',
    openCta: 'Our Timeline Kholo',
    tapHint: 'Kholne ke liye cover ya button par tap karein',
    tabs: {
      'heart-tree': 'Heart Tree',
      'e-magazine': 'E-Magazine',
      milestones: 'Milestones',
      keepsake: 'Keepsake',
    },
    treeScriptHeader: 'to us and a love that blooms',
    treeBotanicalTag: 'A GIFT OF FLOWERS',
    bloomPetalsCta: 'Bloom Petals',
    bloomingAgainCta: 'Aur Petals Khilao',
    petalsCountLabel: (count) => `${count} Bloom${count === 1 ? '' : 's'}`,
    loveLetterBadge: 'LOVE LETTER',
    magazineMasthead: 'ANNIVERSARY E-MAGAZINE',
    magazineLeftTitle: 'YOU & ME',
    magazineLeftSub: 'Har subah ki chai aur pyaari baatein',
    magazineRightTitle: 'FOREVER.',
    magazineRightSub: 'Collector Edition',
    magazineIssueNote: 'Hamare sabse khaas lamhon ki photo diary.',
    polaroidHeading: 'Polaroid Yaadein',
    filmstripCaption: '35MM HAMARI REEL',
    timelineEyebrow: 'YAADON KI TIMELINE',
    chaptersCountLabel: (count) => `${String(count).padStart(2, '0')} Chapters`,
    tapToOpenMemory: 'Tap karke yaad padho',
    cassetteHeading: 'HAMARA SOUNDTRACK',
    cassetteTapLabel: 'Warm Chime Bajao',
    cassettePlayingLabel: 'Acoustic Chime Baj Rahi Hai...',
    vowHeading: 'Chapters Ahead',
    vowQuote: '"Har aane wale chapter ke liye shukriya, humesha saath."',
    signaturePrefix: 'Pyaar ke saath,',
    sealKeepsake: 'Seal This Keepsake',
    keepsakeSealed: 'Keepsake Sealed',
    sealedStampNote: 'Wax seal lag gayi · Yaadein mehfooz',
    colophonNote: 'Khaas anniversary keepsake — yaadon mein hamesha mehfooz.',
    nextChapterLabel: 'Aage',
  },
  hi: {
    editionPill: 'सालगिरह विशेष संस्करण',
    volumeSubtitle: 'हमारी कहानी · Chapters of Us',
    fromLabel: 'प्रेषक:',
    openCta: 'हमारी टाइमलाइन खोलें',
    tapHint: 'खोलने के लिए कवर या बटन पर टैप करें',
    tabs: {
      'heart-tree': 'हार्ट ट्री',
      'e-magazine': 'ई-मैगज़ीन',
      milestones: 'यादें',
      keepsake: 'स्मृति',
    },
    treeScriptHeader: 'हमारे नाम और खिलते हुए प्यार के नाम',
    treeBotanicalTag: 'फूलों का उपहार',
    bloomPetalsCta: 'पंखुड़ियाँ खिलाएं',
    bloomingAgainCta: 'और पंखुड़ियाँ खिलाएं',
    petalsCountLabel: (count) => `${count} बार खिला`,
    loveLetterBadge: 'प्रेम पत्र',
    magazineMasthead: 'सालगिरह ई-मैगज़ीन',
    magazineLeftTitle: 'YOU & ME',
    magazineLeftSub: 'मीठी सुबहों और अनकही मुस्कान की कहानी',
    magazineRightTitle: 'FOREVER.',
    magazineRightSub: 'विशेष संग्राहक अंक',
    magazineIssueNote: 'हमारे सबसे प्यारे पलों की चुनिंदा झलकियाँ।',
    polaroidHeading: 'पोलरॉइड तस्वीरें',
    filmstripCaption: '35MM सालगिरह रील',
    timelineEyebrow: 'यादों की झलक',
    chaptersCountLabel: (count) => `${String(count).padStart(2, '0')} अध्याय`,
    tapToOpenMemory: 'याद पढ़ने के लिए टैप करें',
    cassetteHeading: 'हमारा संगीत',
    cassetteTapLabel: 'मधुर धुन बजाएं',
    cassettePlayingLabel: 'धुन बज रही है...',
    vowHeading: 'आने वाले अध्याय',
    vowQuote: '"आने वाले हर अध्याय के लिए दिल से आभार।"',
    signaturePrefix: 'स्नेह सहित,',
    sealKeepsake: 'स्मृति को सहेजें',
    keepsakeSealed: 'स्मृति सहेजी गई',
    sealedStampNote: 'मोहर लग चुकी है · यादें सदा के लिए',
    colophonNote: 'हाथ से संजोया गया सालगिरह उपहार — यादों में सदा के लिए।',
    nextChapterLabel: 'अगला',
  },
};

const FLOATING_PETALS = [
  { left: '12%', delay: '0ms', duration: '2400ms', size: 12, color: '#E11D63', drift: '-14px' },
  { left: '24%', delay: '180ms', duration: '2700ms', size: 10, color: '#FB7185', drift: '16px' },
  { left: '38%', delay: '90ms', duration: '2500ms', size: 13, color: '#9D174D', drift: '-10px' },
  { left: '52%', delay: '260ms', duration: '2800ms', size: 11, color: '#F43F5E', drift: '18px' },
  { left: '66%', delay: '140ms', duration: '2450ms', size: 12, color: '#F59E0B', drift: '-16px' },
  { left: '78%', delay: '320ms', duration: '2650ms', size: 10, color: '#FB7185', drift: '12px' },
  { left: '88%', delay: '60ms', duration: '2550ms', size: 12, color: '#9D174D', drift: '-12px' },
] as const;

const TREE_BLOSSOM_NODES = [
  { top: '16%', left: '46%', size: 14, color: '#E11D63' },
  { top: '24%', left: '31%', size: 12, color: '#FB7185' },
  { top: '22%', left: '64%', size: 13, color: '#9D174D' },
  { top: '36%', left: '24%', size: 11, color: '#F43F5E' },
  { top: '35%', left: '72%', size: 12, color: '#E11D63' },
  { top: '44%', left: '49%', size: 11, color: '#F59E0B' },
] as const;

/** Extracts clean 1-to-2-initial monogram text (e.g. "N & D") from couple or recipient name. */
function extractCoupleMonogram(receiverName: string): string {
  const cleaned = receiverName.trim();
  if (!cleaned) return 'U & M';

  const coupleParts = cleaned
    .split(/\s*(?:&|\+|and|weds|aur|संग)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (coupleParts.length >= 2) {
    const first = coupleParts[0].charAt(0).toUpperCase();
    const second = coupleParts[1].charAt(0).toUpperCase();
    if (first && second) return `${first} & ${second}`;
  }

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0].charAt(0).toUpperCase()} & ${words[1].charAt(0).toUpperCase()}`;
  }

  return cleaned.slice(0, 2).toUpperCase();
}

/** Splits milestone titles formatted like "Oct 2023 · First hello" into date badge + title. */
function splitMilestoneTitle(
  rawTitle: string,
  index: number,
): { dateBadge: string; title: string } {
  const trimmed = rawTitle.trim();
  const separatorMatch = trimmed.match(/^([^·•|]+?)\s*[·•|]\s*(.+)$/);
  if (separatorMatch) {
    return {
      dateBadge: separatorMatch[1].trim().toUpperCase(),
      title: separatorMatch[2].trim(),
    };
  }

  return {
    dateBadge: `CHAPTER ${String(index + 1).padStart(2, '0')}`,
    title: trimmed,
  };
}

function HeartBlossomSvg({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
    >
      <path d="M12 20.4s-7.4-4.7-9.3-8.9C1.2 8.2 3.3 4.8 6.8 4.5c2-.2 3.8.8 5.2 2.4 1.4-1.6 3.2-2.6 5.2-2.4 3.5.3 5.6 3.7 4.1 7-1.9 4.2-9.3 8.9-9.3 8.9Z" />
    </svg>
  );
}

/**
 * 4-Chapter Anniversary E-Magazine & Blooming Heart-Tree Website ("Our Timeline — Chapters of Us").
 * Preserves full OccasionSiteProps compatibility, trilingual support (en, hinglish, hi),
 * rose-linen foil cover, and 44px+ tactile controls.
 */
export function OurTimelineSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const [opened, setOpened] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);
  const [activeChapter, setActiveChapter] = useState<TimelineChapterId>('heart-tree');
  const [bloomBurstCount, setBloomBurstCount] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(0);
  const [sealed, setSealed] = useState(false);

  const coreLang = toCoreLanguageCode(language);
  const copy = TIMELINE_COPY[coreLang] ?? TIMELINE_COPY.en;
  const highlights = data.highlights ?? [];
  const monogram = extractCoupleMonogram(data.receiverName);
  const themeLabel = pickLocalizedText(manifest.name, language);
  const trackTitle = manifest.music?.[0]?.label || 'Acoustic Sunset';

  useEffect(() => {
    if (opened) return;
    const hintTimer = setTimeout(() => {
      setShowTapHint(true);
    }, 7000);
    return () => clearTimeout(hintTimer);
  }, [opened]);

  function handleOpen() {
    setOpened(true);
    onOpened?.();
  }

  function handleReplay() {
    setShowTapHint(false);
    setOpened(false);
    setActiveChapter('heart-tree');
  }

  function goNextChapter() {
    const idx = CHAPTER_ORDER.indexOf(activeChapter);
    const next = CHAPTER_ORDER[(idx + 1) % CHAPTER_ORDER.length];
    setActiveChapter(next);
  }

  const chapterTabs = CHAPTER_ORDER.map((id) => ({
    id,
    label: copy.tabs[id],
  }));

  return (
    <article
      aria-label={themeLabel || 'Our Timeline'}
      className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#FDF2F8] text-[#2B1B2E]"
    >
      <style>{`
        @keyframes otPetalDrift {
          0% {
            opacity: 0;
            transform: translate3d(0, -10px, 0) scale(0.75) rotate(0deg);
          }
          18% {
            opacity: 0.92;
          }
          82% {
            opacity: 0.85;
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--ot-drift, 12px), 170px, 0) scale(1.05) rotate(28deg);
          }
        }
        @keyframes otBlossomPop {
          0% {
            opacity: 0;
            transform: scale(0.4);
          }
          65% {
            opacity: 1;
            transform: scale(1.16);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .ot-petal-fall {
          animation-name: otPetalDrift;
          animation-timing-function: cubic-bezier(0.22, 0.65, 0.35, 1);
          animation-fill-mode: forwards;
        }
        .ot-blossom-node {
          animation: otBlossomPop 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .ot-petal-fall,
          .ot-blossom-node {
            animation: none !important;
          }
        }
      `}</style>

      {watermarked ? (
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-30 flex justify-center border-b border-[#9D174D]/15 bg-[#FFE8EF]/90 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9D174D]"
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      {!opened ? (
        <div
          role="button"
          tabIndex={0}
          onClick={handleOpen}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpen();
            }
          }}
          className="relative flex flex-1 cursor-pointer flex-col items-center justify-center p-4 text-center sm:p-6"
        >
          <OccasionArtworkBackdrop
            src="/templates/occasions/our-timeline/cover.jpg"
            fallbackGradient="linear-gradient(155deg, #FDF2F8 0%, #FCE7F3 60%, #FFFBEB 100%)"
            className="object-cover object-center opacity-40"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,253,249,0.72),rgba(253,242,248,0.88))]"
          />

          <div className="relative z-10 flex w-full max-w-md flex-col items-center rounded-[22px] border border-[#F59E0B]/60 bg-[#FDF2F8]/88 p-2 shadow-[0_14px_36px_-10px_rgba(43,27,46,0.14)] backdrop-blur-xs">
            <div className="relative flex w-full flex-col items-center rounded-[16px] border border-[#D97706]/35 bg-[#FFFDF9]/80 px-5 py-8 sm:px-7 sm:py-10">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-2.5 top-2.5 h-3 w-3 border-l border-t border-[#D97706]/60"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-2.5 top-2.5 h-3 w-3 border-r border-t border-[#D97706]/60"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2.5 left-2.5 h-3 w-3 border-b border-l border-[#D97706]/60"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2.5 right-2.5 h-3 w-3 border-b border-r border-[#D97706]/60"
              />

              <div
                aria-hidden="true"
                className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#F59E0B]/70 bg-[#9D174D] shadow-[0_10px_24px_-6px_rgba(157,23,77,0.45)] ring-4 ring-[#FDF2F8] transition-transform duration-300 hover:scale-105 motion-reduce:transition-none"
              >
                <span className="pointer-events-none absolute inset-1.5 rounded-full border border-[#F59E0B]/55" />
                <span className="font-royal-serif text-lg font-semibold tracking-[0.08em] text-[#FFFDF9]">
                  {monogram}
                </span>
              </div>

              <span className="inline-flex items-center rounded-full border border-[#F59E0B]/50 bg-[#FFFBEB]/90 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#92400E]">
                {copy.editionPill}
              </span>

              <h2 className="mt-4 max-w-full break-words font-heading text-3xl font-bold leading-tight tracking-tight text-[#2B1B2E] sm:text-[34px]">
                {data.receiverName}
              </h2>

              <p className="mt-1.5 font-royal-serif text-base italic text-[#9D174D] sm:text-lg">
                {copy.volumeSubtitle}
              </p>

              {data.senderName ? (
                <p className="mt-2 text-xs tracking-wide text-[#2B1B2E]/70">
                  {copy.fromLabel}{' '}
                  <span className="font-semibold text-[#2B1B2E]">{data.senderName}</span>
                </p>
              ) : null}

              <div className="my-5 flex w-28 items-center gap-2" aria-hidden="true">
                <span className="h-px flex-1 bg-[#D97706]/45" />
                <span className="h-1.5 w-1.5 rotate-45 bg-[#F59E0B]" />
                <span className="h-px flex-1 bg-[#D97706]/45" />
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpen();
                }}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#F59E0B]/50 bg-[#9D174D] px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#FFFDF9] shadow-[0_10px_22px_-6px_rgba(157,23,77,0.45)] transition duration-200 hover:bg-[#831340] active:scale-[0.98] motion-reduce:transition-none"
              >
                {copy.openCta}
              </button>

              {showTapHint ? (
                <p className="mt-3 text-[11px] font-semibold text-[#9D174D] animate-pulse motion-reduce:animate-none">
                  {copy.tapHint}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col justify-between gap-3 px-4 pb-4 pt-3.5 animate-fade-in motion-reduce:animate-none sm:px-5 sm:pt-4">
          {/* Top Bar + 4-Chapter Navigation */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex min-h-[32px] items-center rounded-full border border-[#D97706]/35 bg-[#FFFDF9] px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#92400E]">
                {monogram} · {copy.editionPill}
              </span>
              <button
                type="button"
                onClick={handleReplay}
                className="inline-flex min-h-[44px] items-center rounded-full border border-[#2B1B2E]/15 bg-[#FFFDF9] px-4 text-xs font-semibold text-[#2B1B2E] shadow-xs transition hover:border-[#9D174D]/40 hover:bg-white active:scale-95 motion-reduce:transition-none"
              >
                {getReplayLabel(language)}
              </button>
            </div>

            <OccasionChapterNav
              tabs={chapterTabs}
              activeId={activeChapter}
              onSelect={(id) => setActiveChapter(id as TimelineChapterId)}
              accentColor="#9D174D"
            />
          </div>

          {/* CHAPTER 01: Heart Tree & Candy-Stripe Love Letter */}
          {activeChapter === 'heart-tree' ? (
            <section
              aria-label={copy.tabs['heart-tree']}
              className="flex flex-1 flex-col justify-between gap-3.5 rounded-[24px] border border-[#D97706]/25 bg-[#FFFDF9]/95 p-4 shadow-[0_14px_34px_-14px_rgba(43,27,46,0.16)] animate-fade-in motion-reduce:animate-none"
            >
              <div className="space-y-3">
                {/* Script Header + Botanical Tag */}
                <header className="text-center">
                  <span className="inline-flex items-center rounded-full border border-[#9D174D]/20 bg-[#FDF2F8] px-3 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#9D174D]">
                    {copy.treeBotanicalTag}
                  </span>
                  <p className="mt-1.5 font-royal-script text-[26px] leading-snug text-[#9D174D] sm:text-[30px]">
                    {copy.treeScriptHeader}
                  </p>
                </header>

                {/* Blooming Watercolor Heart Tree Centerpiece */}
                <div className="relative overflow-hidden rounded-[20px] border border-[#F59E0B]/40 bg-[#FFF5F8] shadow-inner">
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <OccasionArtworkBackdrop
                      src="/templates/occasions/our-timeline/cover.jpg"
                      fallbackGradient="linear-gradient(155deg, #FFF5F8 0%, #FCE7F3 58%, #FFFBEB 100%)"
                      className="object-cover object-center opacity-35"
                    />
                    <OccasionArtworkBackdrop
                      src="/templates/occasions/our-timeline/scene.jpg"
                      fallbackGradient="transparent"
                      className="object-cover object-center"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FFFDF9]/75 via-transparent to-[#FFFDF9]/25"
                    />

                    {/* Extra bloomed heart blossoms revealed when "Bloom Petals" is tapped */}
                    {bloomBurstCount > 0 ? (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                      >
                        {TREE_BLOSSOM_NODES.slice(
                          0,
                          Math.min(TREE_BLOSSOM_NODES.length, bloomBurstCount + 2),
                        ).map((node, idx) => (
                          <span
                            key={`blossom-${idx}`}
                            className="ot-blossom-node absolute drop-shadow-xs"
                            style={{ top: node.top, left: node.left }}
                          >
                            <HeartBlossomSvg size={node.size} color={node.color} />
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {/* Falling petal burst overlay */}
                    {bloomBurstCount > 0 ? (
                      <div
                        key={`burst-${bloomBurstCount}`}
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
                      >
                        {FLOATING_PETALS.map((petal, idx) => (
                          <span
                            key={`petal-${bloomBurstCount}-${idx}`}
                            className="ot-petal-fall absolute -top-3 block"
                            style={
                              {
                                left: petal.left,
                                animationDelay: petal.delay,
                                animationDuration: petal.duration,
                                '--ot-drift': petal.drift,
                              } as React.CSSProperties
                            }
                          >
                            <HeartBlossomSvg size={petal.size} color={petal.color} />
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-[#9D174D]/10 bg-[#FFFDF9]/92 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setBloomBurstCount((prev) => prev + 1)}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#9D174D] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#FFFDF9] shadow-xs transition hover:bg-[#831340] active:scale-95 motion-reduce:transition-none"
                    >
                      <HeartBlossomSvg size={13} color="#FFFDF9" />
                      <span>
                        {bloomBurstCount > 0 ? copy.bloomingAgainCta : copy.bloomPetalsCta}
                      </span>
                    </button>
                    <span className="rounded-full border border-[#F59E0B]/40 bg-[#FFFBEB] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#92400E]">
                      {bloomBurstCount > 0
                        ? copy.petalsCountLabel(bloomBurstCount)
                        : monogram}
                    </span>
                  </div>
                </div>

                {/* Candy-Stripe Framed LOVE LETTER Card */}
                <div
                  className="rounded-[20px] p-2 shadow-sm"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(-45deg, #9D174D 0px, #9D174D 10px, #FFFDF9 10px, #FFFDF9 20px, #F43F5E 20px, #F43F5E 30px, #FFFDF9 30px, #FFFDF9 40px)',
                  }}
                >
                  <div className="rounded-[14px] border border-[#9D174D]/15 bg-[#FFFDF9] px-4 py-4 text-center">
                    <span className="inline-flex items-center rounded-full border border-[#9D174D]/30 bg-[#FDF2F8] px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#9D174D]">
                      {copy.loveLetterBadge}
                    </span>
                    <h2 className="mt-2.5 break-words font-heading text-xl font-bold leading-snug text-[#2B1B2E] sm:text-2xl">
                      {pickLocalizedText(data.headline, language)}
                    </h2>
                    <p className="mx-auto mt-2 max-w-md break-words font-royal-serif text-[15px] leading-relaxed text-[#2B1B2E]/90">
                      {pickLocalizedText(data.message, language)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={goNextChapter}
                className="inline-flex min-h-[44px] items-center justify-center self-center rounded-full border border-[#9D174D]/25 bg-[#FDF2F8] px-5 text-xs font-bold text-[#9D174D] transition hover:bg-[#FCE7F3] active:scale-95 motion-reduce:transition-none"
              >
                {copy.nextChapterLabel}: {copy.tabs['e-magazine']} →
              </button>
            </section>
          ) : null}

          {/* CHAPTER 02: High-Contrast Editorial E-Magazine Spread */}
          {activeChapter === 'e-magazine' ? (
            <section
              aria-label={copy.tabs['e-magazine']}
              className="flex flex-1 flex-col justify-between gap-3.5 rounded-[24px] border border-[#2B1B2E]/15 bg-[#FFFDF9] p-4 shadow-[0_14px_34px_-14px_rgba(43,27,46,0.16)] animate-fade-in motion-reduce:animate-none"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#2B1B2E]/12 pb-2">
                  <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#9D174D]">
                    {copy.magazineMasthead}
                  </span>
                  <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#2B1B2E]/60">
                    {data.receiverName}
                  </span>
                </div>

                {/* High-Contrast 2-Column Spread: YOU & ME (Garnet) + FOREVER. (Charcoal) */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="flex flex-col justify-between rounded-[18px] bg-[#9D174D] p-4 text-[#FFFDF9] shadow-sm">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#FDE68A]">
                      VOL. 01 · {monogram}
                    </span>
                    <div className="my-3">
                      <h3 className="font-heading text-3xl font-extrabold leading-none tracking-tight text-white">
                        {copy.magazineLeftTitle}
                      </h3>
                      <p className="mt-2 font-royal-serif text-xs italic leading-relaxed text-white/85">
                        {copy.magazineLeftSub}
                      </p>
                    </div>
                    <span className="h-px w-12 bg-[#F59E0B]/70" aria-hidden="true" />
                  </div>

                  <div className="flex flex-col justify-between rounded-[18px] bg-[#1B151A] p-4 text-[#FAF5EC] shadow-sm">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#F59E0B]">
                      {copy.magazineRightSub}
                    </span>
                    <div className="my-3">
                      <h3 className="font-royal-serif text-3xl font-bold tracking-[0.06em] text-[#FAF5EC]">
                        {copy.magazineRightTitle}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-[#FAF5EC]/75">
                        {copy.magazineIssueNote}
                      </p>
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#FAF5EC]/50">
                      {data.senderName ? `${copy.fromLabel} ${data.senderName}` : copy.volumeSubtitle}
                    </span>
                  </div>
                </div>

                {/* 35mm Filmstrip Reel */}
                <OccasionFilmstripGallery
                  photos={data.photos}
                  fallbackImage="/templates/occasions/our-timeline/cover.jpg"
                  accentColor="#9D174D"
                  caption={copy.filmstripCaption}
                />

                {/* Taped Polaroid Gallery when user photos are present */}
                {data.photos && data.photos.length > 0 ? (
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#9D174D]">
                      {copy.polaroidHeading}
                    </p>
                    <OccasionPhotoGallery
                      photos={data.photos}
                      accentColor="#9D174D"
                      surfaceTint="#FDF2F8"
                      variant="polaroid"
                      captionPrefix="Frame"
                    />
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={goNextChapter}
                className="inline-flex min-h-[44px] items-center justify-center self-center rounded-full border border-[#9D174D]/25 bg-[#FDF2F8] px-5 text-xs font-bold text-[#9D174D] transition hover:bg-[#FCE7F3] active:scale-95 motion-reduce:transition-none"
              >
                {copy.nextChapterLabel}: {copy.tabs.milestones} →
              </button>
            </section>
          ) : null}

          {/* CHAPTER 03: Interactive Gold-Thread Milestones + Warm Cassette Player */}
          {activeChapter === 'milestones' ? (
            <section
              aria-label={copy.timelineEyebrow}
              className="flex flex-1 flex-col justify-between gap-4 rounded-[24px] border border-[#D97706]/30 bg-[#FFFDF9] p-4 shadow-[0_14px_34px_-14px_rgba(43,27,46,0.16)] animate-fade-in motion-reduce:animate-none"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9D174D]">
                    {copy.timelineEyebrow}
                  </span>
                  <span className="text-[11px] font-semibold text-[#92400E]">
                    {copy.chaptersCountLabel(highlights.length)}
                  </span>
                </div>

                {highlights.length > 0 ? (
                  <div className="relative pl-6">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-4 left-[9px] top-4 w-[1.5px] bg-gradient-to-b from-[#F59E0B]/80 via-[#D97706]/55 to-[#F59E0B]/20"
                    />

                    <div className="space-y-3">
                      {highlights.map((item, idx) => {
                        const isOpen = activeIdx === idx;
                        const { dateBadge, title } = splitMilestoneTitle(
                          pickLocalizedText(item.title, language),
                          idx,
                        );

                        return (
                          <div
                            key={`${pickLocalizedText(item.title, 'en', 'milestone')}-${idx}`}
                            className="relative"
                          >
                            <span
                              aria-hidden="true"
                              className={`absolute -left-6 top-5 flex h-[18px] w-[18px] items-center justify-center rounded-full border transition-all duration-300 motion-reduce:transition-none ${
                                isOpen
                                  ? 'border-[#F59E0B] bg-[#FFFDF9] shadow-xs ring-2 ring-[#F59E0B]/25'
                                  : 'border-[#D97706]/70 bg-[#FFFDF9]'
                              }`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                                  isOpen ? 'bg-[#9D174D]' : 'bg-transparent'
                                }`}
                              />
                            </span>

                            <button
                              type="button"
                              aria-expanded={isOpen}
                              onClick={() => setActiveIdx(isOpen ? null : idx)}
                              className={`min-h-[44px] w-full rounded-2xl border p-3.5 text-left transition-all duration-300 active:scale-[0.99] motion-reduce:transition-none ${
                                isOpen
                                  ? 'border-[#9D174D] bg-[#FFFDF9] shadow-[0_12px_26px_-8px_rgba(43,27,46,0.14)] ring-1 ring-[#9D174D]/15'
                                  : 'border-[#D97706]/25 bg-[#FDF2F8]/45 hover:border-[#9D174D]/45 hover:bg-[#FFFDF9]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <span className="inline-flex items-center rounded-full border border-[#F59E0B]/45 bg-[#FFFBEB] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#92400E]">
                                    {dateBadge}
                                  </span>
                                  <h3
                                    className={`mt-1.5 break-words font-heading text-base font-bold leading-snug transition-colors ${
                                      isOpen ? 'text-[#9D174D]' : 'text-[#2B1B2E]'
                                    }`}
                                  >
                                    {title}
                                  </h3>
                                </div>

                                <span
                                  aria-hidden="true"
                                  className={`mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 motion-reduce:transition-none ${
                                    isOpen
                                      ? 'rotate-180 border-[#9D174D]/30 bg-[#FDF2F8] text-[#9D174D]'
                                      : 'border-[#2B1B2E]/10 bg-white text-[#2B1B2E]/60'
                                  }`}
                                >
                                  <svg
                                    className="h-3.5 w-3.5"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M6 8l4 4 4-4"
                                    />
                                  </svg>
                                </span>
                              </div>

                              {isOpen ? (
                                <div className="mt-2.5 border-t border-[#D97706]/20 pt-2.5 animate-fade-in motion-reduce:animate-none">
                                  <p className="break-words text-xs leading-relaxed text-[#2B1B2E]/85 sm:text-[13px]">
                                    {pickLocalizedText(item.detail, language)}
                                  </p>
                                </div>
                              ) : (
                                <p className="mt-1 text-[11px] font-medium text-[#2B1B2E]/55">
                                  {copy.tapToOpenMemory}
                                </p>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Warm Cassette Soundtrack Widget */}
                <div className="space-y-1.5 pt-1">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#9D174D]">
                    {copy.cassetteHeading}
                  </p>
                  <OccasionCassettePlayer
                    mood="warm"
                    trackTitle={trackTitle}
                    tapLabel={copy.cassetteTapLabel}
                    playingLabel={copy.cassettePlayingLabel}
                    accentColor="#9D174D"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={goNextChapter}
                className="inline-flex min-h-[44px] items-center justify-center self-center rounded-full border border-[#9D174D]/25 bg-[#FDF2F8] px-5 text-xs font-bold text-[#9D174D] transition hover:bg-[#FCE7F3] active:scale-95 motion-reduce:transition-none"
              >
                {copy.nextChapterLabel}: {copy.tabs.keepsake} →
              </button>
            </section>
          ) : null}

          {/* CHAPTER 04: Double-Bordered "Chapters Ahead" Colophon Vow Card + Wax Stamp Seal */}
          {activeChapter === 'keepsake' ? (
            <section
              aria-label={copy.vowHeading}
              className="flex flex-1 flex-col justify-center animate-fade-in motion-reduce:animate-none"
            >
              <div className="rounded-[22px] border border-[#D97706]/50 bg-[#FFFDF9] p-1.5 shadow-[0_14px_34px_-12px_rgba(43,27,46,0.14)]">
                <div className="relative flex flex-col items-center rounded-[16px] border border-[#F59E0B]/35 bg-[#FDF2F8]/55 px-5 py-7 text-center">
                  <span
                    aria-hidden="true"
                    className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#F59E0B]/60 bg-[#FFFDF9] font-royal-serif text-xs font-bold tracking-wider text-[#9D174D] shadow-xs"
                  >
                    {monogram}
                  </span>

                  <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#92400E]">
                    {copy.editionPill}
                  </span>

                  <h3 className="mt-2 font-heading text-2xl font-bold text-[#9D174D]">
                    {copy.vowHeading}
                  </h3>

                  <p className="mt-2 max-w-xs font-royal-serif text-base italic leading-relaxed text-[#2B1B2E]/90">
                    {copy.vowQuote}
                  </p>

                  {data.senderName ? (
                    <p className="mt-3 font-royal-serif text-sm font-semibold text-[#2B1B2E]">
                      {copy.signaturePrefix}{' '}
                      <span className="text-[#9D174D]">{data.senderName}</span>
                    </p>
                  ) : null}

                  <div className="my-5 flex w-24 items-center gap-2" aria-hidden="true">
                    <span className="h-px flex-1 bg-[#D97706]/45" />
                    <span className="h-1.5 w-1.5 rotate-45 bg-[#F59E0B]" />
                    <span className="h-px flex-1 bg-[#D97706]/45" />
                  </div>

                  {/* Interactive Wax Stamp Seal Button */}
                  <button
                    type="button"
                    aria-pressed={sealed}
                    onClick={() => setSealed((prev) => !prev)}
                    className={`inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full border px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-200 active:scale-[0.97] motion-reduce:transition-none ${
                      sealed
                        ? 'border-[#F59E0B] bg-[#9D174D] text-[#FFFDF9] shadow-[0_10px_22px_-8px_rgba(157,23,77,0.55)] ring-4 ring-[#F59E0B]/20 animate-pop-bounce'
                        : 'border-[#9D174D]/45 bg-[#FFFDF9] text-[#9D174D] hover:border-[#9D174D] hover:bg-[#FDF2F8]'
                    }`}
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill={sealed ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <circle cx="12" cy="12" r="8.5" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 7.5l1.35 2.75 3.05.45-2.2 2.15.52 3.05L12 14.45 9.28 15.9l.52-3.05-2.2-2.15 3.05-.45L12 7.5z"
                      />
                    </svg>
                    <span>{sealed ? copy.keepsakeSealed : copy.sealKeepsake}</span>
                  </button>

                  {sealed ? (
                    <p className="mt-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#9D174D]">
                      {copy.sealedStampNote}
                    </p>
                  ) : null}

                  <p className="mt-4 text-[10.5px] tracking-wide text-[#2B1B2E]/60">
                    {copy.colophonNote}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {/* Webzy Colophon Footer */}
          <footer className="border-t border-[#D97706]/20 pt-2.5 text-center text-[11px] font-medium text-[#2B1B2E]/60">
            {getWebzyFooterLabel(language)}
          </footer>
        </div>
      )}
    </article>
  );
}
