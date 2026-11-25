'use client';

import React, { useEffect, useRef, useState } from 'react';
import { type CoreLanguageCode, pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  getReplayLabel,
  getWebzyFooterLabel,
  OccasionArtworkBackdrop,
  OccasionCassettePlayer,
  OccasionChapterNav,
  OccasionFilmstripGallery,
  type OccasionChapterTab,
  type OccasionSiteProps,
} from './shared/OccasionPrimitives';

type WrappedChapterId = 'overview' | 'highlights' | 'reel' | 'vibe' | 'pass';
type VibeOptionId = 'roadtrips' | 'mornings' | 'wins' | 'chai';

interface VibeDefinition {
  id: VibeOptionId;
  label: string;
  tagline: string;
}

interface WrappedCopy {
  editionPrefix: string;
  editionForLabel: string;
  fromLabel: string;
  unwrapCta: string;
  tapHint: string;
  chapterTabs: Record<WrappedChapterId, string>;
  overviewBadge: string;
  daysLabel: string;
  syncLabel: string;
  metrics: {
    jokes: string;
    talks: string;
    memories: string;
  };
  highlightsTitle: string;
  highlightsEmptyTitle: string;
  highlightsNoteTag: string;
  previousSlide: string;
  nextSlide: string;
  reelBadge: string;
  reelTitle: string;
  reelHint: string;
  vibeTitle: string;
  vibeSubtitle: string;
  vibes: readonly VibeDefinition[];
  cassetteHeader: string;
  cassetteTap: string;
  cassettePlaying: string;
  passBadge: string;
  passTitle: string;
  passVibeLabel: string;
  passRecipientLabel: string;
  passSenderLabel: string;
  passSerialLabel: string;
  copyShareCta: string;
  copyToast: string;
  whatsappCta: string;
  nextChapterCta: string;
  chapterLabel: string;
}

const CHAPTER_ORDER: readonly WrappedChapterId[] = [
  'overview',
  'highlights',
  'reel',
  'vibe',
  'pass',
];

const WRAPPED_COPY: Record<CoreLanguageCode, WrappedCopy> = {
  en: {
    editionPrefix: 'EDITION 2026 -> 2027',
    editionForLabel: 'FOR',
    fromLabel: 'Curated by',
    unwrapCta: 'Unlock Year Replay',
    tapHint: 'Tap anywhere on the prism pass to unlock',
    chapterTabs: {
      overview: 'Overview',
      highlights: 'Highlights',
      reel: '35mm Reel',
      vibe: '2027 Vibe',
      pass: 'Sealed Pass',
    },
    overviewBadge: '2026 PRISM SUMMARY',
    daysLabel: 'DAYS IN ORBIT',
    syncLabel: 'MOMENT INDEX',
    metrics: {
      jokes: 'Inside Jokes',
      talks: 'Late Night Talks',
      memories: 'Core Memories',
    },
    highlightsTitle: '2026 Highlight Deck',
    highlightsEmptyTitle: 'Year in Focus',
    highlightsNoteTag: 'YEAR DEDICATION',
    previousSlide: 'Prev',
    nextSlide: 'Next',
    reelBadge: '35MM ARCHIVE',
    reelTitle: 'Contact Sheet · 2026 Frames',
    reelHint: 'Tap any film frame to inspect full-size in the lightbox.',
    vibeTitle: 'Choose Our 2027 Vibe',
    vibeSubtitle: 'Pick one direction to seal onto the collectible 2027 keepsake pass.',
    vibes: [
      { id: 'roadtrips', label: 'More Roadtrips', tagline: 'Open highways & playlists' },
      { id: 'mornings', label: 'Slow Mornings', tagline: 'Unhurried sunlit starts' },
      { id: 'wins', label: 'Bigger Wins', tagline: 'Bold goals & milestones' },
      { id: 'chai', label: 'More Chai Dates', tagline: 'Long talks over warm cups' },
    ],
    cassetteHeader: '2027 LO-FI CHIME MIXTAPE',
    cassetteTap: 'Tap to Play Lo-Fi Chimes',
    cassettePlaying: 'Playing 2027 Lo-Fi Chimes...',
    passBadge: 'COLLECTIBLE KEEPSAKE PASS',
    passTitle: '2026 -> 2027 Prism Pass',
    passVibeLabel: 'SEALED 2027 VIBE',
    passRecipientLabel: 'ISSUED TO',
    passSenderLabel: 'FROM',
    passSerialLabel: 'PASS ID',
    copyShareCta: 'Copy Keepsake Pass',
    copyToast: 'Keepsake pass copied to clipboard.',
    whatsappCta: 'Send Toast on WhatsApp',
    nextChapterCta: 'Next Chapter',
    chapterLabel: 'Slide',
  },
  hinglish: {
    editionPrefix: 'EDITION 2026 -> 2027',
    editionForLabel: 'FOR',
    fromLabel: 'Bheja hai',
    unwrapCta: 'Unlock Year Replay',
    tapHint: 'Replay kholne ke liye pass par tap karein',
    chapterTabs: {
      overview: 'Overview',
      highlights: 'Highlights',
      reel: '35mm Reel',
      vibe: '2027 Vibe',
      pass: 'Sealed Pass',
    },
    overviewBadge: '2026 PRISM RECAP',
    daysLabel: 'DAYS TOGETHER',
    syncLabel: 'VIBE SCORE',
    metrics: {
      jokes: 'Inside Jokes',
      talks: 'Late Night Talks',
      memories: 'Core Memories',
    },
    highlightsTitle: '2026 ke Top Moments',
    highlightsEmptyTitle: 'Saal ki Khaas Baat',
    highlightsNoteTag: 'DIL SE NOTE',
    previousSlide: 'Pichla',
    nextSlide: 'Agla',
    reelBadge: '35MM ARCHIVE',
    reelTitle: '2026 Contact Sheet Reel',
    reelHint: 'Zoom karke dekhne ke liye kisi bhi frame par tap karein.',
    vibeTitle: '2027 ki Vibe Chuno',
    vibeSubtitle: 'Naye saal ke collectible pass par lock karne ke liye ek vibe select karo.',
    vibes: [
      { id: 'roadtrips', label: 'More Roadtrips', tagline: 'Highways aur non-stop music' },
      { id: 'mornings', label: 'Slow Mornings', tagline: 'Sukoon bhari subah' },
      { id: 'wins', label: 'Bigger Wins', tagline: 'Naye goals aur badi jeet' },
      { id: 'chai', label: 'More Chai Dates', tagline: 'Garma-garam chai aur baatein' },
    ],
    cassetteHeader: '2027 LO-FI CHIME MIXTAPE',
    cassetteTap: 'Tap karke Lo-Fi Chime bajao',
    cassettePlaying: '2027 Lo-Fi Chime baj raha hai...',
    passBadge: 'COLLECTIBLE KEEPSAKE PASS',
    passTitle: '2026 -> 2027 Prism Pass',
    passVibeLabel: 'LOCKED 2027 VIBE',
    passRecipientLabel: 'ISSUED TO',
    passSenderLabel: 'FROM',
    passSerialLabel: 'PASS ID',
    copyShareCta: 'Copy / Share Pass',
    copyToast: 'Keepsake pass details copy ho gayi hain.',
    whatsappCta: 'WhatsApp par toast bhejo',
    nextChapterCta: 'Agla Chapter',
    chapterLabel: 'Slide',
  },
  hi: {
    editionPrefix: 'EDITION 2026 -> 2027',
    editionForLabel: 'FOR',
    fromLabel: 'प्रेषक',
    unwrapCta: 'साल का रीप्ले खोलें',
    tapHint: 'रीप्ले खोलने के लिए पास पर टैप करें',
    chapterTabs: {
      overview: 'झलक',
      highlights: 'खास पल',
      reel: '35mm रील',
      vibe: '2027 वाइब',
      pass: 'सील्ड पास',
    },
    overviewBadge: '2026 प्रिज्म सारांश',
    daysLabel: 'यादगार दिन',
    syncLabel: 'मेमोरी स्कोर',
    metrics: {
      jokes: 'इनसाइड जोक्स',
      talks: 'देर रात की बातें',
      memories: 'खास यादें',
    },
    highlightsTitle: '2026 के बेहतरीन पल',
    highlightsEmptyTitle: 'साल का संदेश',
    highlightsNoteTag: 'नए साल का संदेश',
    previousSlide: 'पिछला',
    nextSlide: 'अगला',
    reelBadge: '35MM संग्रह',
    reelTitle: '2026 फ़ोटो रील',
    reelHint: 'फ़ोटो बड़ा देखने के लिए किसी भी फ़्रेम पर टैप करें।',
    vibeTitle: '2027 की वाइब चुनें',
    vibeSubtitle: 'अपने 2027 कीपसेक पास पर सील करने के लिए एक वाइब चुनें।',
    vibes: [
      { id: 'roadtrips', label: 'More Roadtrips', tagline: 'लंबे सफ़र और खुला आसमान' },
      { id: 'mornings', label: 'Slow Mornings', tagline: 'सुकून भरी शांत सुबह' },
      { id: 'wins', label: 'Bigger Wins', tagline: 'बड़े लक्ष्य और नई सफलता' },
      { id: 'chai', label: 'More Chai Dates', tagline: 'चाय की चुस्की और लंबी बातें' },
    ],
    cassetteHeader: '2027 लो-फ़ाई चाइम मिक्सटेप',
    cassetteTap: 'लो-फ़ाई धुन बजाने के लिए टैप करें',
    cassettePlaying: '2027 लो-फ़ाई धुन बज रही है...',
    passBadge: 'कलेक्टिबल कीपसेक पास',
    passTitle: '2026 -> 2027 प्रिज्म पास',
    passVibeLabel: 'चुनी गई 2027 वाइब',
    passRecipientLabel: 'प्राप्तकर्ता',
    passSenderLabel: 'प्रेषक',
    passSerialLabel: 'पास कोड',
    copyShareCta: 'पास कॉपी / शेयर करें',
    copyToast: 'कीपसेक पास क्लिपबोर्ड पर कॉपी हो गया।',
    whatsappCta: 'व्हाट्सऐप पर शुभकामना भेजें',
    nextChapterCta: 'अगला अध्याय',
    chapterLabel: 'स्लाइड',
  },
};

function formatIndex(value: number): string {
  return String(value).padStart(2, '0');
}

function computeSeedFromString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 9973;
  }
  return hash;
}

function extractStatPills(title: string, detail: string): string[] {
  const combined = `${title} · ${detail}`;
  const rawSegments = combined
    .split(/\s*(?:·|,|&|\band\b|\baur\b|\bऔर\b|—|-)\s*/i)
    .map((part) => part.trim().replace(/[.!?]+$/, ''))
    .filter((part) => part.length >= 3 && part.length <= 28);

  const unique: string[] = [];
  for (const seg of rawSegments) {
    if (!unique.some((item) => item.toLowerCase() === seg.toLowerCase())) {
      unique.push(seg);
    }
    if (unique.length >= 3) break;
  }
  return unique;
}

function PrismEmblemIcon({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
      <polygon
        points="18,3 31,14 18,33 5,14"
        stroke="#F59E0B"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="rgba(139, 92, 246, 0.22)"
      />
      <path
        d="M5 14h26M18 3l-5 11 5 19 5-19-5-11Z"
        stroke="#DDD6FE"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VibeIcon({ id, active }: { id: VibeOptionId; active: boolean }) {
  const stroke = active ? '#F59E0B' : '#C4B5FD';
  switch (id) {
    case 'roadtrips':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth={1.7} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 20L10 4M18 20L14 4M12 7v2m0 4v2m0 4v1" />
        </svg>
      );
    case 'mornings':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth={1.7} aria-hidden="true">
          <circle cx="12" cy="13" r="4" />
          <path strokeLinecap="round" d="M4 18h16M12 4v2.5M6.3 7.3l1.8 1.8M17.7 7.3l-1.8 1.8" />
        </svg>
      );
    case 'wins':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth={1.7} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.6 5.4 5.9.9-4.2 4.1 1 5.8L12 16.4 6.7 19.2l1-5.8-4.2-4.1 5.9-.9L12 3z" />
        </svg>
      );
    case 'chai':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth={1.7} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10h11v5a5 5 0 01-5 5h-1a5 5 0 01-5-5v-5zm11 1.5h1.8a2.2 2.2 0 010 4.4H16M8.5 5.5c0 1 .9 1.5.9 2.5M12.5 5.5c0 1 .9 1.5.9 2.5" />
        </svg>
      );
  }
}

export function OurYearWrappedSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const [opened, setOpened] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);
  const [activeChapter, setActiveChapter] = useState<WrappedChapterId>('overview');
  const [ringAnimated, setRingAnimated] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [selectedVibe, setSelectedVibe] = useState<VibeOptionId>('roadtrips');
  const [copyToastVisible, setCopyToastVisible] = useState(false);

  const onOpenedRef = useRef(onOpened);
  onOpenedRef.current = onOpened;
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const coreLang = toCoreLanguageCode(language);
  const copy = WRAPPED_COPY[coreLang] ?? WRAPPED_COPY.en;

  const primaryColor = manifest.palette.primary || '#8B5CF6';
  const secondaryColor = manifest.palette.secondary || '#F59E0B';
  const offerTagText = pickLocalizedText(data.offerTag, language).trim();
  const headlineText = pickLocalizedText(data.headline, language).trim();
  const messageText = pickLocalizedText(data.message, language).trim();
  const sanitizedPhone = data.whatsappPhone?.replace(/\D/g, '') ?? '';

  // Deterministic stats derived from payload data
  const highlightsList = data.highlights ?? [];
  const photosCount = data.photos?.length ?? 0;
  const nameSeed = computeSeedFromString(`${data.receiverName}-${data.senderName}`);
  const wordCount = messageText ? messageText.split(/\s+/).filter(Boolean).length : 8;
  const ringPercent = Math.min(
    99,
    86 + highlightsList.length * 3 + photosCount * 2 + (data.offerTag ? 1 : 0),
  );
  const insideJokesCount = 24 + highlightsList.length * 8 + (nameSeed % 17);
  const lateNightTalksCount = 52 + wordCount * 3 + (nameSeed % 23);
  const coreMemoriesCount = Math.max(14, highlightsList.length * 6 + photosCount * 5 + (nameSeed % 9));

  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringTargetOffset = ringCircumference * (1 - ringPercent / 100);

  // Highlights slide deck derived from data.highlights and data.headline / data.message
  const storySlides = [
    ...highlightsList.map((item, idx) => ({
      tag: `${copy.chapterLabel} ${formatIndex(idx + 1)}`,
      title: pickLocalizedText(item.title, language),
      detail: pickLocalizedText(item.detail, language),
    })),
    ...(messageText
      ? [
          {
            tag: copy.highlightsNoteTag,
            title: headlineText || copy.highlightsEmptyTitle,
            detail: messageText,
          },
        ]
      : []),
  ];
  const safeSlides =
    storySlides.length > 0
      ? storySlides
      : [
          {
            tag: copy.highlightsNoteTag,
            title: headlineText || copy.highlightsEmptyTitle,
            detail: `${data.receiverName} & ${data.senderName}`,
          },
        ];
  const boundedSlideIdx = Math.min(slideIdx, safeSlides.length - 1);
  const activeSlide = safeSlides[boundedSlideIdx];

  const chapterTabs: OccasionChapterTab[] = CHAPTER_ORDER.map((id) => ({
    id,
    label: copy.chapterTabs[id],
  }));

  const currentVibeObj = copy.vibes.find((v) => v.id === selectedVibe) ?? copy.vibes[0];
  const mixtapeTrackLabel = manifest.music?.[0]?.label
    ? `${manifest.music[0].label} · 2026 -> 2027`
    : `Sparkle Lo-Fi · ${data.receiverName}`;
  const serialCode = `PRISM-${String(202700 + (nameSeed % 900)).slice(-4)}`;

  function handleOpen() {
    setOpened(true);
    onOpened?.();
  }

  function handleReplay() {
    setOpened(false);
    setShowTapHint(false);
    setActiveChapter('overview');
    setSlideIdx(0);
    setRingAnimated(false);
    setCopyToastVisible(false);
  }

  function goNextChapter() {
    const idx = CHAPTER_ORDER.indexOf(activeChapter);
    if (idx >= 0 && idx < CHAPTER_ORDER.length - 1) {
      setActiveChapter(CHAPTER_ORDER[idx + 1]);
    }
  }

  async function handleCopyKeepsakePass() {
    const shareSummary = [
      `${copy.editionPrefix} // ${data.receiverName}`,
      `${copy.passVibeLabel}: ${currentVibeObj.label}`,
      `${copy.passSenderLabel}: ${data.senderName}`,
      messageText,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareSummary);
      } else if (typeof document !== 'undefined') {
        const helper = document.createElement('textarea');
        helper.value = shareSummary;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        document.body.removeChild(helper);
      }
    } catch {
      // Safe visual confirmation even when clipboard permissions are restricted
    }

    setCopyToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setCopyToastVisible(false), 2600);
  }

  useEffect(() => {
    if (opened) return;
    const hintTimer = setTimeout(() => setShowTapHint(true), 7000);
    const autoOpenTimer = setTimeout(() => {
      setOpened(true);
      onOpenedRef.current?.();
    }, 15000);
    return () => {
      clearTimeout(hintTimer);
      clearTimeout(autoOpenTimer);
    };
  }, [opened]);

  useEffect(() => {
    if (!opened || activeChapter !== 'overview') {
      setRingAnimated(false);
      return;
    }
    const timer = setTimeout(() => setRingAnimated(true), 60);
    return () => clearTimeout(timer);
  }, [opened, activeChapter]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  if (!opened) {
    return (
      <div className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#0B0718] text-[#F8F7FC]">
        <OccasionArtworkBackdrop
          src="/templates/occasions/our-year/cover.jpg"
          fallbackGradient="linear-gradient(155deg, #0B0718 0%, #24104A 52%, #0B0718 100%)"
          className="object-cover object-center opacity-55"
        />

        {/* Midnight crystal prism glow veil */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 20% 16%, rgba(139, 92, 246, 0.36), transparent 52%), radial-gradient(circle at 84% 82%, rgba(245, 158, 11, 0.2), transparent 48%), linear-gradient(180deg, rgba(11, 7, 24, 0.72) 0%, rgba(11, 7, 24, 0.48) 46%, rgba(11, 7, 24, 0.92) 100%)',
          }}
        />

        {watermarked ? (
          <div
            aria-hidden="true"
            className="pointer-events-none relative z-20 flex justify-center border-b border-[#F59E0B]/30 bg-[#0B0718]/85 py-1 text-[10px] font-bold tracking-[0.22em] text-[#F59E0B]"
          >
            WEBZY FREE PREVIEW
          </div>
        ) : null}

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
          className="relative z-10 flex flex-1 cursor-pointer flex-col items-center justify-center p-4 text-center sm:p-6"
        >
          {/* Limited Edition Crystal Prism Pass Gate */}
          <div className="relative w-full max-w-sm overflow-hidden rounded-[24px] border border-[#F59E0B]/55 bg-[#0B0718]/80 px-5 py-6 backdrop-blur-md shadow-[0_24px_64px_-20px_rgba(139,92,246,0.72)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-10 -top-12 h-28 rotate-[-6deg] opacity-35 blur-xl"
              style={{
                background: `linear-gradient(90deg, transparent, #8B5CF6, ${secondaryColor}, transparent)`,
              }}
            />

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F59E0B]/45 bg-gradient-to-br from-[#8B5CF6]/35 via-[#0B0718] to-[#F59E0B]/20 shadow-inner">
              <PrismEmblemIcon className="h-7 w-7" />
            </div>

            <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-full border border-[#F59E0B]/45 bg-[#F59E0B]/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#FCD34D]">
              <span>{copy.editionPrefix}</span>
              <span className="opacity-60">//</span>
              <span className="truncate max-w-[140px]">
                {copy.editionForLabel} {data.receiverName}
              </span>
            </div>

            {data.relation ? (
              <p className="mt-2.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#C4B5FD]">
                {data.relation}
              </p>
            ) : null}

            <h2 className="mt-3 break-words font-heading text-2xl font-extrabold tracking-tight text-[#F8F7FC] sm:text-3xl">
              {data.receiverName}
            </h2>

            <p className="mt-1.5 text-sm text-[#F8F7FC]/75">
              {copy.fromLabel}{' '}
              <span className="font-semibold text-[#F59E0B]">{data.senderName}</span>
            </p>

            {offerTagText ? (
              <p className="mt-2.5 inline-block rounded-full border border-[#8B5CF6]/40 bg-[#8B5CF6]/15 px-3 py-0.5 text-[11px] font-medium text-[#F8F7FC]">
                {offerTagText}
              </p>
            ) : null}

            <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-[#F59E0B]/50 to-transparent" />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpen();
              }}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold tracking-wide text-[#F8F7FC] shadow-[0_12px_30px_-8px_rgba(139,92,246,0.85)] ring-1 ring-white/25 transition duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, #8B5CF6 0%, ${primaryColor} 58%, #6D28D9 100%)`,
              }}
            >
              <span>{copy.unwrapCta}</span>
              <svg className="h-4 w-4 text-[#F59E0B]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showTapHint ? (
              <p className="mt-3 text-xs font-semibold text-[#F59E0B] animate-pulse">
                {copy.tapHint}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#0B0718] text-[#F8F7FC] animate-[fadeIn_320ms_ease-out] motion-reduce:animate-none">
      {/* Midnight crystal prism atmospheric backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 14% 10%, rgba(139, 92, 246, 0.34), transparent 48%), radial-gradient(circle at 86% 80%, rgba(245, 158, 11, 0.16), transparent 46%), linear-gradient(175deg, #0B0718 0%, #170E30 56%, #0B0718 100%)',
        }}
      />

      {watermarked ? (
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-20 flex justify-center border-b border-[#F59E0B]/30 bg-[#0B0718]/90 py-1 text-[10px] font-bold tracking-[0.22em] text-[#F59E0B]"
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      <div className="relative z-10 flex flex-1 flex-col justify-between gap-3 px-3.5 pb-4 pt-3.5 sm:px-5">
        {/* Top Bar + 5-Chapter Navigation */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-[#F59E0B]/40 bg-white/5 px-3 py-1 font-mono text-[10.5px] font-bold tracking-[0.12em] text-[#F59E0B]">
              <span className="shrink-0">2026 -&gt; 2027</span>
              <span className="text-white/35">·</span>
              <span className="truncate text-[#F8F7FC]">{data.receiverName}</span>
            </span>

            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-white/15 bg-white/10 px-4 text-xs font-semibold text-[#F8F7FC] backdrop-blur-xs transition hover:border-[#F59E0B]/50 hover:bg-white/15 active:scale-95"
            >
              {getReplayLabel(language)}
            </button>
          </div>

          <OccasionChapterNav
            tabs={chapterTabs}
            activeId={activeChapter}
            onSelect={(id) => setActiveChapter(id as WrappedChapterId)}
            accentColor="#8B5CF6"
            dark
          />
        </div>

        {/* CHAPTER 1: Overview & Animated Stat Ring */}
        {activeChapter === 'overview' ? (
          <section className="flex flex-1 flex-col justify-between gap-3 rounded-[24px] border border-[#8B5CF6]/35 bg-white/[0.05] p-4 backdrop-blur-md shadow-[0_20px_50px_-24px_rgba(139,92,246,0.65)] animate-fade-in">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#C4B5FD]">
                {copy.overviewBadge}
              </span>
              <span className="rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#F59E0B]">
                {copy.syncLabel} · {ringPercent}%
              </span>
            </div>

            {/* Animated SVG Radial Progress Ring */}
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-32 w-32 items-center justify-center">
                <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden="true">
                  <defs>
                    <linearGradient id="prismRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="55%" stopColor="#C4B5FD" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="64"
                    cy="64"
                    r={ringRadius}
                    fill="none"
                    stroke="rgba(248, 247, 252, 0.12)"
                    strokeWidth="9"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r={ringRadius}
                    fill="none"
                    stroke="url(#prismRingGrad)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringAnimated ? ringTargetOffset : ringCircumference}
                    className="transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading text-3xl font-black tracking-tight text-[#F8F7FC]">
                    365
                  </span>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
                    {copy.daysLabel}
                  </span>
                </div>
              </div>

              <h3 className="mt-2 break-words font-heading text-xl font-extrabold tracking-tight text-[#F8F7FC] sm:text-2xl">
                {headlineText}
              </h3>
              <p className="mt-1 break-words text-xs leading-relaxed text-[#F8F7FC]/80 sm:text-sm">
                {messageText}
              </p>
            </div>

            {/* Bold Editorial Metric Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-[#8B5CF6]/30 bg-[#0B0718]/75 p-2.5 text-center">
                <p className="font-heading text-lg font-black text-[#F59E0B] sm:text-xl">
                  {insideJokesCount}+
                </p>
                <p className="mt-0.5 text-[10.5px] font-semibold leading-tight text-[#F8F7FC]/85">
                  {copy.metrics.jokes}
                </p>
              </div>
              <div className="rounded-2xl border border-[#8B5CF6]/30 bg-[#0B0718]/75 p-2.5 text-center">
                <p className="font-heading text-lg font-black text-[#C4B5FD] sm:text-xl">
                  {lateNightTalksCount}
                </p>
                <p className="mt-0.5 text-[10.5px] font-semibold leading-tight text-[#F8F7FC]/85">
                  {copy.metrics.talks}
                </p>
              </div>
              <div className="rounded-2xl border border-[#F59E0B]/35 bg-[#0B0718]/75 p-2.5 text-center">
                <p className="font-heading text-lg font-black text-[#F8F7FC] sm:text-xl">
                  {coreMemoriesCount}
                </p>
                <p className="mt-0.5 text-[10.5px] font-semibold leading-tight text-[#F8F7FC]/85">
                  {copy.metrics.memories}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={goNextChapter}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#8B5CF6] px-5 text-xs font-bold text-[#F8F7FC] shadow-[0_10px_24px_-8px_rgba(139,92,246,0.85)] transition hover:brightness-110 active:scale-[0.98]"
            >
              <span>
                {copy.nextChapterCta}: {copy.chapterTabs.highlights}
              </span>
              <svg className="h-3.5 w-3.5 text-[#F59E0B]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </section>
        ) : null}

        {/* CHAPTER 2: Highlights Interactive Slide Deck */}
        {activeChapter === 'highlights' ? (
          <section className="flex flex-1 flex-col justify-between gap-3 rounded-[24px] border border-[#8B5CF6]/35 bg-white/[0.05] p-4 backdrop-blur-md shadow-[0_20px_50px_-24px_rgba(139,92,246,0.65)] animate-fade-in">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#C4B5FD]">
                {copy.highlightsTitle}
              </span>
              <span className="rounded-full border border-[#F59E0B]/40 bg-[#0B0718]/75 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#F59E0B]">
                {formatIndex(boundedSlideIdx + 1)} / {formatIndex(safeSlides.length)}
              </span>
            </div>

            <div
              key={`deck-slide-${boundedSlideIdx}`}
              className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#F59E0B]/35 bg-[#0B0718]/75 px-4 py-6 text-center animate-fade-in"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 260 160"
                className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
              >
                <circle cx="130" cy="80" r="64" stroke="#F59E0B" strokeWidth="0.7" strokeDasharray="3 4" />
                <circle cx="130" cy="80" r="42" stroke="#8B5CF6" strokeWidth="0.9" />
                <path
                  d="M130 8v144M16 80h228M48 22l164 116M212 22L48 138"
                  stroke="#C4B5FD"
                  strokeWidth="0.5"
                  strokeOpacity="0.5"
                />
              </svg>

              <div className="relative z-10 w-full">
                <span className="inline-block rounded-full border border-[#8B5CF6]/55 bg-[#8B5CF6]/20 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#DDD6FE]">
                  {activeSlide.tag}
                </span>

                <h4 className="mt-3 break-words font-heading text-2xl font-black tracking-tight text-[#F59E0B] sm:text-3xl">
                  {activeSlide.title}
                </h4>

                <p className="mt-2.5 break-words text-sm font-medium leading-relaxed text-[#F8F7FC]">
                  {activeSlide.detail}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                  {extractStatPills(activeSlide.title, activeSlide.detail).map((pill) => (
                    <span
                      key={pill}
                      className="rounded-full border border-[#F59E0B]/30 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#F8F7FC]/90"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Dot indicators + Prev/Next tap pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-1" role="tablist" aria-label="Highlight slides">
                {safeSlides.map((_, idx) => {
                  const isActive = idx === boundedSlideIdx;
                  return (
                    <button
                      key={`dot-${idx}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Slide ${idx + 1} of ${safeSlides.length}`}
                      onClick={() => setSlideIdx(idx)}
                      className="flex min-h-[44px] min-w-[32px] items-center justify-center px-1"
                    >
                      <span
                        className={`block h-2 rounded-full transition-all duration-300 ${
                          isActive
                            ? 'w-7 bg-gradient-to-r from-[#8B5CF6] to-[#F59E0B]'
                            : 'w-2 bg-white/25 hover:bg-white/45'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
                  disabled={boundedSlideIdx === 0}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 text-xs font-semibold text-[#F8F7FC] transition hover:bg-white/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg className="h-3.5 w-3.5 text-[#F59E0B]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{copy.previousSlide}</span>
                </button>

                {boundedSlideIdx < safeSlides.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setSlideIdx((i) => Math.min(safeSlides.length - 1, i + 1))}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[#8B5CF6] px-4 text-xs font-bold text-[#F8F7FC] shadow-[0_8px_22px_-6px_rgba(139,92,246,0.85)] transition hover:brightness-110 active:scale-95"
                  >
                    <span>{copy.nextSlide}</span>
                    <svg className="h-3.5 w-3.5 text-[#F59E0B]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNextChapter}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[#F59E0B] px-4 text-xs font-bold text-[#0B0718] shadow-[0_8px_22px_-6px_rgba(245,158,11,0.7)] transition hover:brightness-110 active:scale-95"
                  >
                    <span>{copy.chapterTabs.reel}</span>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {/* CHAPTER 3: 35mm Filmstrip Reel */}
        {activeChapter === 'reel' ? (
          <section className="flex flex-1 flex-col justify-between gap-3 rounded-[24px] border border-[#8B5CF6]/35 bg-white/[0.05] p-4 backdrop-blur-md shadow-[0_20px_50px_-24px_rgba(139,92,246,0.65)] animate-fade-in">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#C4B5FD]">
                  {copy.reelBadge}
                </span>
                <span className="rounded-full border border-[#F59E0B]/35 bg-[#F59E0B]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#F59E0B]">
                  2026 REEL
                </span>
              </div>
              <h3 className="mt-1 font-heading text-lg font-extrabold text-[#F8F7FC]">
                {copy.reelTitle}
              </h3>

              <div className="mt-3">
                <OccasionFilmstripGallery
                  photos={data.photos}
                  fallbackImage="/templates/occasions/our-year/cover.jpg"
                  accentColor="#8B5CF6"
                  caption={`${data.receiverName.toUpperCase()} · 2026 PRISM REEL`}
                  frameLabels={['Frame 01', 'Frame 02', 'Frame 03']}
                />
              </div>

              <p className="mt-3 text-center text-xs leading-relaxed text-[#F8F7FC]/75">
                {copy.reelHint}
              </p>
            </div>

            <button
              type="button"
              onClick={goNextChapter}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#8B5CF6] px-5 text-xs font-bold text-[#F8F7FC] shadow-[0_10px_24px_-8px_rgba(139,92,246,0.85)] transition hover:brightness-110 active:scale-[0.98]"
            >
              <span>
                {copy.nextChapterCta}: {copy.chapterTabs.vibe}
              </span>
              <svg className="h-3.5 w-3.5 text-[#F59E0B]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </section>
        ) : null}

        {/* CHAPTER 4: 2027 Vibe Picker & Mixtape */}
        {activeChapter === 'vibe' ? (
          <section className="flex flex-1 flex-col justify-between gap-3 rounded-[24px] border border-[#8B5CF6]/35 bg-white/[0.05] p-4 backdrop-blur-md shadow-[0_20px_50px_-24px_rgba(139,92,246,0.65)] animate-fade-in">
            <div className="space-y-3">
              <div>
                <h3 className="font-heading text-lg font-extrabold text-[#F8F7FC]">
                  {copy.vibeTitle}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-[#F8F7FC]/75">
                  {copy.vibeSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {copy.vibes.map((vibe) => {
                  const isSelected = vibe.id === selectedVibe;
                  return (
                    <button
                      key={vibe.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedVibe(vibe.id)}
                      className={`flex min-h-[82px] flex-col items-start justify-between rounded-2xl border p-3 text-left transition-all duration-200 active:scale-[0.98] ${
                        isSelected
                          ? 'border-[#F59E0B] bg-[#8B5CF6]/25 shadow-[0_10px_24px_-10px_rgba(245,158,11,0.65)]'
                          : 'border-white/15 bg-[#0B0718]/70 hover:border-[#8B5CF6]/55 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <VibeIcon id={vibe.id} active={isSelected} />
                        {isSelected ? (
                          <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" aria-hidden="true" />
                        ) : null}
                      </div>
                      <div className="mt-2 min-w-0 w-full">
                        <p className="break-words text-xs font-bold text-[#F8F7FC]">
                          {vibe.label}
                        </p>
                        <p className="mt-0.5 break-words text-[10.5px] leading-tight text-[#F8F7FC]/70">
                          {vibe.tagline}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-1">
                <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
                  {copy.cassetteHeader}
                </p>
                <OccasionCassettePlayer
                  trackTitle={mixtapeTrackLabel}
                  mood="festive"
                  tapLabel={copy.cassetteTap}
                  playingLabel={copy.cassettePlaying}
                  accentColor="#F59E0B"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={goNextChapter}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#F59E0B] px-5 text-xs font-bold text-[#0B0718] shadow-[0_10px_24px_-8px_rgba(245,158,11,0.75)] transition hover:brightness-110 active:scale-[0.98]"
            >
              <span>
                {copy.nextChapterCta}: {copy.chapterTabs.pass}
              </span>
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </section>
        ) : null}

        {/* CHAPTER 5: Final Metallic Collectible 2027 Keepsake Pass */}
        {activeChapter === 'pass' ? (
          <section className="flex flex-1 flex-col justify-between gap-3 animate-fade-in">
            <div
              className="relative overflow-hidden rounded-[24px] border border-[#F59E0B]/65 p-5 shadow-[0_24px_54px_-18px_rgba(139,92,246,0.78)]"
              style={{
                background:
                  'linear-gradient(145deg, #171030 0%, #0B0718 48%, #221445 100%)',
              }}
            >
              {/* Metallic holographic foil sheen */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#F59E0B]/15 blur-2xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-14 -left-14 h-40 w-40 rounded-full bg-[#8B5CF6]/25 blur-2xl"
              />

              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block rounded-full border border-[#F59E0B]/45 bg-[#F59E0B]/15 px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#F59E0B]">
                      {copy.passBadge}
                    </span>
                    <h3 className="mt-2 font-heading text-xl font-black tracking-tight text-[#F8F7FC]">
                      {copy.passTitle}
                    </h3>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#F59E0B]/45 bg-[#0B0718]/75">
                    <PrismEmblemIcon className="h-6 w-6" />
                  </div>
                </div>

                {/* Chosen 2027 Vibe Foil Highlight */}
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#8B5CF6]/45 bg-white/[0.06] px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#C4B5FD]">
                      {copy.passVibeLabel}
                    </p>
                    <p className="mt-0.5 break-words font-heading text-base font-extrabold text-[#F59E0B]">
                      {currentVibeObj.label}
                    </p>
                    <p className="text-[11px] text-[#F8F7FC]/75">{currentVibeObj.tagline}</p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F59E0B]/40 bg-[#0B0718]/80">
                    <VibeIcon id={currentVibeObj.id} active />
                  </div>
                </div>

                {/* Recipient & Sender Metadata Grid */}
                <div className="grid grid-cols-2 gap-2.5 border-t border-white/10 pt-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#F8F7FC]/55">
                      {copy.passRecipientLabel}
                    </p>
                    <p className="mt-0.5 break-words text-sm font-bold text-[#F8F7FC]">
                      {data.receiverName}
                    </p>
                  </div>
                  <div className="min-w-0 text-right">
                    <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#F8F7FC]/55">
                      {copy.passSenderLabel}
                    </p>
                    <p className="mt-0.5 break-words text-sm font-bold text-[#F59E0B]">
                      {data.senderName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-dashed border-white/15 pt-2.5 font-mono text-[10px] tracking-[0.16em] text-[#F8F7FC]/65">
                  <span>{copy.passSerialLabel}: {serialCode}</span>
                  <span>{data.relation ? data.relation.toUpperCase() : '2026 -> 2027'}</span>
                </div>
              </div>
            </div>

            {/* Pass Actions: Copy/Share Toast, Optional WhatsApp, Replay */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCopyKeepsakePass}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#F59E0B] px-5 text-xs font-bold text-[#0B0718] shadow-[0_10px_28px_-8px_rgba(245,158,11,0.6)] transition hover:brightness-110 active:scale-[0.98]"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M7 3.5A1.5 1.5 0 018.5 2h6A1.5 1.5 0 0116 3.5v9a1.5 1.5 0 01-1.5 1.5h-6A1.5 1.5 0 017 12.5v-9z" />
                  <path d="M4 6.5A1.5 1.5 0 015.5 5H6v7.5A2.5 2.5 0 008.5 15H13v.5a1.5 1.5 0 01-1.5 1.5h-6A1.5 1.5 0 014 15.5v-9z" />
                </svg>
                <span>{copy.copyShareCta}</span>
              </button>

              {copyToastVisible ? (
                <p
                  role="status"
                  aria-live="polite"
                  className="rounded-xl border border-[#F59E0B]/45 bg-[#F59E0B]/15 px-3 py-2 text-center text-xs font-semibold text-[#F8F7FC] animate-fade-in"
                >
                  {copy.copyToast}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-2">
                {sanitizedPhone ? (
                  <a
                    href={`https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(
                      `Cheers to 2027 (${currentVibeObj.label}), ${data.senderName}!`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-[#8B5CF6]/45 bg-[#8B5CF6]/20 px-4 text-xs font-bold text-[#F8F7FC] transition hover:bg-[#8B5CF6]/30"
                  >
                    {copy.whatsappCta}
                  </a>
                ) : null}

                <button
                  type="button"
                  onClick={handleReplay}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 text-xs font-semibold text-[#F8F7FC] transition hover:border-[#F59E0B]/45 hover:bg-white/15 active:scale-95"
                >
                  {getReplayLabel(language)}
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <footer className="border-t border-white/10 pt-2.5 text-center text-[11px] text-[#F8F7FC]/60">
          {getWebzyFooterLabel(language)}
        </footer>
      </div>
    </div>
  );
}
