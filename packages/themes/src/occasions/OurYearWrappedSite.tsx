'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { type CoreLanguageCode, pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  getReplayLabel,
  getWebzyFooterLabel,
  OccasionAdaptiveGallery,
  OccasionArtworkBackdrop,
  type OccasionSiteProps,
} from './shared/OccasionPrimitives';
import {
  AmbientRainCanvas,
  type CurvedTrackItem,
  CurvedTrackSanctuary,
  HoldToChargeRing,
  HyperspeedWarpFlash,
  WordByWordFadeLine,
} from './shared/OccasionCinematicFX';

type WrappedChapterId = 'orbit' | 'highlights' | 'memories' | 'soundtrack' | 'pass';
type IntentionId = 'roadtrips' | 'mornings' | 'wins' | 'chai';

interface IntentionDefinition {
  id: IntentionId;
  label: string;
  tagline: string;
}

interface WrappedCopy {
  editionPrefix: string;
  editionForLabel: string;
  fromLabel: string;
  gateSubtitle: string;
  holdLabel: string;
  holdingLabel: string;
  chargedLabel: string;
  quickUnlockCta: string;
  tapHint: string;
  chapterJumps: Record<WrappedChapterId, string>;
  orbitBadge: string;
  narrativeOpener: (receiver: string, sender: string) => string;
  daysLabel: string;
  syncLabel: string;
  noteEyebrow: string;
  signedByLabel: string;
  metrics: {
    jokes: string;
    talks: string;
    memories: string;
  };
  highlightsBadge: string;
  highlightsTitle: string;
  highlightsEmptyTitle: string;
  highlightsNoteTag: string;
  chapterLabel: string;
  previousSlide: string;
  nextSlide: string;
  memoriesBadge: string;
  memoriesTitle: string;
  memoriesHint: string;
  memoriesPrefix: string;
  memoriesEmptyTitle: string;
  memoriesEmptyBody: string;
  soundtrackBadge: string;
  soundtrackHeading: string;
  tracks: readonly CurvedTrackItem[];
  intentionBadge: string;
  intentionTitle: string;
  intentionSubtitle: string;
  intentions: readonly IntentionDefinition[];
  passBadge: string;
  passTitle: string;
  passIntentionLabel: string;
  passRecipientLabel: string;
  passSenderLabel: string;
  passSerialLabel: string;
  copyShareCta: string;
  copyToast: string;
  whatsappCta: string;
}

const CHAPTER_ORDER: readonly WrappedChapterId[] = [
  'orbit',
  'highlights',
  'memories',
  'soundtrack',
  'pass',
];

const WRAPPED_COPY: Record<CoreLanguageCode, WrappedCopy> = {
  en: {
    editionPrefix: 'EDITION 2026 -> 2027',
    editionForLabel: 'FOR',
    fromLabel: 'Curated by',
    gateSubtitle: 'Every orbit, laugh, and midnight milestone refracted into one crystal capsule.',
    holdLabel: 'Hold to Charge 2027 Prism',
    holdingLabel: 'Charging Prism...',
    chargedLabel: 'Prism Ignited',
    quickUnlockCta: 'Or Tap Once to Unlock',
    tapHint: 'Hold the prism ring above or tap once to enter',
    chapterJumps: {
      orbit: 'Orbit',
      highlights: 'Highlights',
      memories: 'Memories',
      soundtrack: 'Soundtrack',
      pass: '2027 Pass',
    },
    orbitBadge: '2026 ORBIT SUMMARY',
    narrativeOpener: (receiver, sender) =>
      `Three hundred and sixty-five rotations later, ${receiver}, here is the light ${sender} kept for you.`,
    daysLabel: 'DAYS IN ORBIT',
    syncLabel: 'MOMENT INDEX',
    noteEyebrow: 'PERSONAL DEDICATION',
    signedByLabel: 'With warmth,',
    metrics: {
      jokes: 'Inside Jokes',
      talks: 'Late Night Talks',
      memories: 'Core Memories',
    },
    highlightsBadge: 'CHAPTER REEL',
    highlightsTitle: '2026 Highlight Deck',
    highlightsEmptyTitle: 'Year in Focus',
    highlightsNoteTag: 'YEAR DEDICATION',
    chapterLabel: 'Slide',
    previousSlide: 'Prev',
    nextSlide: 'Next',
    memoriesBadge: 'CRYSTAL ARCHIVE',
    memoriesTitle: 'Captured Frames · 2026',
    memoriesHint: 'Tap any memory frame to open it full-screen.',
    memoriesPrefix: 'Memory',
    memoriesEmptyTitle: 'Space for Unwritten Frames',
    memoriesEmptyBody: 'No photos attached yet, yet every shared moment from 2026 remains in focus.',
    soundtrackBadge: 'MIDNIGHT MIXTAPE',
    soundtrackHeading: '2026 -> 2027 Soundtrack Sanctuary',
    tracks: [
      {
        id: 'prism-lofi',
        title: 'Sparkle Lo-Fi',
        moodLabel: 'Midnight Crystal',
        duration: '02:48',
        note: 'Warm synth chimes tuned for quiet reflections as the clock turns toward 2027.',
      },
      {
        id: 'violet-drive',
        title: 'Violet Highway',
        moodLabel: 'Night Drive',
        duration: '03:14',
        note: 'Made for open windows, familiar playlists, and unhurried conversations after midnight.',
      },
      {
        id: 'amber-dawn',
        title: 'First Light 2027',
        moodLabel: 'Fresh Horizon',
        duration: '02:56',
        note: 'Soft morning chords for new goals, calm starts, and brighter days ahead.',
      },
    ],
    intentionBadge: '2027 INTENTION',
    intentionTitle: 'Lock Our 2027 Intention',
    intentionSubtitle: 'Pick one guiding focus to seal onto your collectible metallic pass.',
    intentions: [
      { id: 'roadtrips', label: 'More Roadtrips', tagline: 'Open highways & playlists' },
      { id: 'mornings', label: 'Slow Mornings', tagline: 'Unhurried sunlit starts' },
      { id: 'wins', label: 'Bigger Wins', tagline: 'Bold goals & milestones' },
      { id: 'chai', label: 'More Chai Dates', tagline: 'Long talks over warm cups' },
    ],
    passBadge: 'COLLECTIBLE KEEPSAKE PASS',
    passTitle: '2026 -> 2027 Prism Pass',
    passIntentionLabel: 'SEALED 2027 INTENTION',
    passRecipientLabel: 'ISSUED TO',
    passSenderLabel: 'FROM',
    passSerialLabel: 'PASS ID',
    copyShareCta: 'Copy Keepsake Pass',
    copyToast: 'Keepsake pass copied to clipboard.',
    whatsappCta: 'Send Reply on WhatsApp',
  },
  hinglish: {
    editionPrefix: 'EDITION 2026 -> 2027',
    editionForLabel: 'FOR',
    fromLabel: 'Bheja hai',
    gateSubtitle: '2026 ke sabse khaas pal aur 2027 ki umeedein ek crystal capsule mein.',
    holdLabel: '2027 Prism Charge Karein',
    holdingLabel: 'Charge ho raha hai...',
    chargedLabel: 'Prism Ready',
    quickUnlockCta: 'Ya Ek Tap Mein Kholo',
    tapHint: 'Kholne ke liye ring hold karein ya niche tap karein',
    chapterJumps: {
      orbit: 'Orbit',
      highlights: 'Highlights',
      memories: 'Memories',
      soundtrack: 'Soundtrack',
      pass: '2027 Pass',
    },
    orbitBadge: '2026 PRISM RECAP',
    narrativeOpener: (receiver, sender) =>
      `Poore 365 dinon ki yaadein samet kar, ${receiver}, ye khaas roshni ${sender} ne aapke liye rakhi hai.`,
    daysLabel: 'DAYS IN ORBIT',
    syncLabel: 'VIBE SCORE',
    noteEyebrow: 'DIL SE NOTE',
    signedByLabel: 'Pyaar aur duaon ke saath,',
    metrics: {
      jokes: 'Inside Jokes',
      talks: 'Late Night Talks',
      memories: 'Core Memories',
    },
    highlightsBadge: 'CHAPTER DECK',
    highlightsTitle: '2026 ke Top Moments',
    highlightsEmptyTitle: 'Saal ki Khaas Baat',
    highlightsNoteTag: 'DIL SE NOTE',
    chapterLabel: 'Slide',
    previousSlide: 'Pichla',
    nextSlide: 'Agla',
    memoriesBadge: 'CRYSTAL ARCHIVE',
    memoriesTitle: '2026 Ki Yaadgaar Tasveerein',
    memoriesHint: 'Bada dekhne ke liye kisi bhi photo par tap karein.',
    memoriesPrefix: 'Yaad',
    memoriesEmptyTitle: 'Yaadon Ka Khula Canvas',
    memoriesEmptyBody: 'Abhi koi photo upload nahi hui, par 2026 ka har lamha dil mein mehfooz hai.',
    soundtrackBadge: 'MIDNIGHT MIXTAPE',
    soundtrackHeading: '2026 -> 2027 Soundtrack Sanctuary',
    tracks: [
      {
        id: 'prism-lofi',
        title: 'Sparkle Lo-Fi',
        moodLabel: 'Midnight Crystal',
        duration: '02:48',
        note: 'Naye saal ki raat aur sukoon bhari baaton ke liye ek soft lo-fi dhun.',
      },
      {
        id: 'violet-drive',
        title: 'Violet Highway',
        moodLabel: 'Night Drive',
        duration: '03:14',
        note: 'Khuli sadkein, favorite playlist aur raat ke 12 baje wali lambi baatein.',
      },
      {
        id: 'amber-dawn',
        title: 'First Light 2027',
        moodLabel: 'Fresh Horizon',
        duration: '02:56',
        note: '2027 ki nayi subah, naye sapne aur aur bhi behtar dinon ka aaghaz.',
      },
    ],
    intentionBadge: '2027 INTENTION',
    intentionTitle: '2027 Ka Intention Lock Karo',
    intentionSubtitle: 'Apne collectible metallic pass par seal karne ke liye ek focus chuno.',
    intentions: [
      { id: 'roadtrips', label: 'More Roadtrips', tagline: 'Highways aur non-stop music' },
      { id: 'mornings', label: 'Slow Mornings', tagline: 'Sukoon bhari subah' },
      { id: 'wins', label: 'Bigger Wins', tagline: 'Naye goals aur badi jeet' },
      { id: 'chai', label: 'More Chai Dates', tagline: 'Garma-garam chai aur baatein' },
    ],
    passBadge: 'COLLECTIBLE KEEPSAKE PASS',
    passTitle: '2026 -> 2027 Prism Pass',
    passIntentionLabel: 'LOCKED 2027 INTENTION',
    passRecipientLabel: 'ISSUED TO',
    passSenderLabel: 'FROM',
    passSerialLabel: 'PASS ID',
    copyShareCta: 'Copy / Share Pass',
    copyToast: 'Keepsake pass details copy ho gayi hain.',
    whatsappCta: 'WhatsApp par reply bhejo',
  },
  hi: {
    editionPrefix: 'EDITION 2026 -> 2027',
    editionForLabel: 'FOR',
    fromLabel: 'प्रेषक',
    gateSubtitle: '2026 के सबसे प्यारे पल और 2027 की नई उम्मीदें एक सुनहरे कैप्सूल में।',
    holdLabel: '2027 प्रिज्म चार्ज करें',
    holdingLabel: 'चार्ज हो रहा है...',
    chargedLabel: 'प्रिज्म तैयार है',
    quickUnlockCta: 'या एक टैप से खोलें',
    tapHint: 'खोलने के लिए रिंग दबाए रखें या नीचे टैप करें',
    chapterJumps: {
      orbit: 'सारांश',
      highlights: 'खास पल',
      memories: 'यादें',
      soundtrack: 'संगीत',
      pass: '2027 पास',
    },
    orbitBadge: '2026 प्रिज्म सारांश',
    narrativeOpener: (receiver, sender) =>
      `पूरे 365 दिनों की यादों को समेटकर, ${receiver}, यह उजाला ${sender} ने आपके लिए सहेजा है।`,
    daysLabel: 'यादगार दिन',
    syncLabel: 'मेमोरी स्कोर',
    noteEyebrow: 'दिल से संदेश',
    signedByLabel: 'स्नेह सहित,',
    metrics: {
      jokes: 'इनसाइड जोक्स',
      talks: 'देर रात की बातें',
      memories: 'खास यादें',
    },
    highlightsBadge: 'मुख्य अध्याय',
    highlightsTitle: '2026 के बेहतरीन पल',
    highlightsEmptyTitle: 'साल का संदेश',
    highlightsNoteTag: 'नए साल का संदेश',
    chapterLabel: 'स्लाइड',
    previousSlide: 'पिछला',
    nextSlide: 'अगला',
    memoriesBadge: 'क्रिस्टल संग्रह',
    memoriesTitle: '2026 की संजोई यादें',
    memoriesHint: 'फ़ोटो बड़ा देखने के लिए किसी भी फ्रेम पर टैप करें।',
    memoriesPrefix: 'याद',
    memoriesEmptyTitle: 'यादों का शांत कैनवास',
    memoriesEmptyBody: 'अभी कोई फ़ोटो नहीं जोड़ी गई है, पर 2026 का हर सुंदर पल मन में जीवित है।',
    soundtrackBadge: 'मिडनाइट मिक्सटेप',
    soundtrackHeading: '2026 -> 2027 संगीत कोना',
    tracks: [
      {
        id: 'prism-lofi',
        title: 'स्पार्कल लो-फ़ाई',
        moodLabel: 'मिडनाइट क्रिस्टल',
        duration: '02:48',
        note: 'नए साल की दहलीज़ पर शांत और सुकून भरे पलों के लिए मधुर सिंथ धुन।',
      },
      {
        id: 'violet-drive',
        title: 'वायलेट हाईवे',
        moodLabel: 'नाइट ड्राइव',
        duration: '03:14',
        note: 'खुलते आसमान, पसंदीदा गीतों और देर रात की गहरी बातचीत के लिए।',
      },
      {
        id: 'amber-dawn',
        title: 'पहली किरण 2027',
        moodLabel: 'नया सवेरा',
        duration: '02:56',
        note: '2027 की नई सुबह, नए सपनों और शांत मुस्कुराहटों के नाम।',
      },
    ],
    intentionBadge: '2027 संकल्प',
    intentionTitle: '2027 का संकल्प चुनें',
    intentionSubtitle: 'अपने कलेक्टिबल मेटैलिक पास पर सील करने के लिए एक संकल्प चुनें।',
    intentions: [
      { id: 'roadtrips', label: 'More Roadtrips', tagline: 'लंबे सफ़र और खुला आसमान' },
      { id: 'mornings', label: 'Slow Mornings', tagline: 'सुकून भरी शांत सुबह' },
      { id: 'wins', label: 'Bigger Wins', tagline: 'बड़े लक्ष्य और नई सफलता' },
      { id: 'chai', label: 'More Chai Dates', tagline: 'चाय की चुस्की और लंबी बातें' },
    ],
    passBadge: 'कलेक्टिबल कीपसेक पास',
    passTitle: '2026 -> 2027 प्रिज्म पास',
    passIntentionLabel: 'चुना गया 2027 संकल्प',
    passRecipientLabel: 'प्राप्तकर्ता',
    passSenderLabel: 'प्रेषक',
    passSerialLabel: 'पास कोड',
    copyShareCta: 'पास कॉपी / शेयर करें',
    copyToast: 'कीपसेक पास क्लिपबोर्ड पर कॉपी हो गया।',
    whatsappCta: 'व्हाट्सऐप पर जवाब भेजें',
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
        fill="rgba(167, 139, 250, 0.22)"
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

function IntentionIcon({ id, active }: { id: IntentionId; active: boolean }) {
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3l2.6 5.4 5.9.9-4.2 4.1 1 5.8L12 16.4 6.7 19.2l1-5.8-4.2-4.1 5.9-.9L12 3z"
          />
        </svg>
      );
    case 'chai':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth={1.7} aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 10h11v5a5 5 0 01-5 5h-1a5 5 0 01-5-5v-5zm11 1.5h1.8a2.2 2.2 0 010 4.4H16M8.5 5.5c0 1 .9 1.5.9 2.5M12.5 5.5c0 1 .9 1.5.9 2.5"
          />
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
  const uid = useId().replace(/:/g, '');
  const [opened, setOpened] = useState(false);
  const [warping, setWarping] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);
  const [activeChapter, setActiveChapter] = useState<WrappedChapterId>('orbit');
  const [ringAnimated, setRingAnimated] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [selectedIntention, setSelectedIntention] = useState<IntentionId>('roadtrips');
  const [copyToastVisible, setCopyToastVisible] = useState(false);

  const onOpenedRef = useRef(onOpened);
  onOpenedRef.current = onOpened;
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRefs = useRef<Record<WrappedChapterId, HTMLElement | null>>({
    orbit: null,
    highlights: null,
    memories: null,
    soundtrack: null,
    pass: null,
  });

  const coreLang = toCoreLanguageCode(language);
  const copy = WRAPPED_COPY[coreLang] ?? WRAPPED_COPY.en;

  const primaryColor = manifest.palette.primary || '#8B5CF6';
  const secondaryColor = manifest.palette.secondary || '#F59E0B';
  const offerTagText = pickLocalizedText(data.offerTag, language).trim();
  const headlineText = pickLocalizedText(data.headline, language).trim();
  const messageText = pickLocalizedText(data.message, language).trim();
  const sanitizedPhone = data.whatsappPhone?.replace(/\D/g, '') ?? '';
  const hasValidWhatsapp = sanitizedPhone.length >= 7;

  // Deterministic orbit stats derived from payload data
  const highlightsList = useMemo(() => data.highlights ?? [], [data.highlights]);
  const photosCount = useMemo(
    () => (data.photos ?? []).filter((src) => typeof src === 'string' && src.trim().length > 0).length,
    [data.photos],
  );
  const nameSeed = computeSeedFromString(`${data.receiverName}-${data.senderName}`);
  const wordCount = messageText ? messageText.split(/\s+/).filter(Boolean).length : 8;
  const ringPercent = Math.min(
    99,
    86 + highlightsList.length * 3 + photosCount * 2 + (data.offerTag ? 1 : 0),
  );
  const insideJokesCount = 24 + highlightsList.length * 8 + (nameSeed % 17);
  const lateNightTalksCount = 52 + wordCount * 3 + (nameSeed % 23);
  const coreMemoriesCount = Math.max(14, highlightsList.length * 6 + photosCount * 5 + (nameSeed % 9));

  const ringRadius = 56;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringTargetOffset = ringCircumference * (1 - ringPercent / 100);

  const storySlides = useMemo(() => {
    const mapped = highlightsList.map((item, idx) => ({
      tag: `${copy.chapterLabel} ${formatIndex(idx + 1)}`,
      title: pickLocalizedText(item.title, language),
      detail: pickLocalizedText(item.detail, language),
    }));

    if (mapped.length > 0) {
      return mapped;
    }

    return [
      {
        tag: copy.highlightsNoteTag,
        title: headlineText || copy.highlightsEmptyTitle,
        detail: messageText || `${data.receiverName} & ${data.senderName}`,
      },
    ];
  }, [
    highlightsList,
    copy.chapterLabel,
    copy.highlightsNoteTag,
    copy.highlightsEmptyTitle,
    language,
    headlineText,
    messageText,
    data.receiverName,
    data.senderName,
  ]);

  const boundedSlideIdx = Math.min(slideIdx, storySlides.length - 1);
  const activeSlide = storySlides[boundedSlideIdx];

  const currentIntentionObj =
    copy.intentions.find((item) => item.id === selectedIntention) ?? copy.intentions[0];

  const soundtrackTracks = useMemo<readonly CurvedTrackItem[]>(() => {
    const manifestTrackLabel = manifest.music?.[0]?.label?.trim();
    if (!manifestTrackLabel) return copy.tracks;
    return copy.tracks.map((track, idx) =>
      idx === 0 ? { ...track, title: manifestTrackLabel } : track,
    );
  }, [copy.tracks, manifest.music]);

  const serialCode = `PRISM-${String(202700 + (nameSeed % 900)).slice(-4)}`;

  const startWarp = useCallback(() => {
    if (opened || warping) return;
    setWarping(true);
  }, [opened, warping]);

  const finishOpening = useCallback(() => {
    setWarping(false);
    setOpened(true);
    onOpenedRef.current?.();
  }, []);

  const handleReplay = useCallback(() => {
    setWarping(false);
    setOpened(false);
    setShowTapHint(false);
    setActiveChapter('orbit');
    setSlideIdx(0);
    setRingAnimated(false);
    setCopyToastVisible(false);
  }, []);

  const jumpToChapter = useCallback((id: WrappedChapterId) => {
    setActiveChapter(id);
    const target = sectionRefs.current[id];
    if (!target) return;
    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    });
  }, []);

  async function handleCopyKeepsakePass() {
    const shareSummary = [
      `${copy.editionPrefix} // ${data.receiverName}`,
      `${copy.passIntentionLabel}: ${currentIntentionObj.label}`,
      `${copy.passSenderLabel}: ${data.senderName}`,
      `${copy.passSerialLabel}: ${serialCode}`,
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
    if (opened || warping) return;
    const hintTimer = setTimeout(() => setShowTapHint(true), 5500);
    return () => clearTimeout(hintTimer);
  }, [opened, warping]);

  useEffect(() => {
    if (!opened) {
      setRingAnimated(false);
      return;
    }
    const timer = setTimeout(() => setRingAnimated(true), 90);
    return () => clearTimeout(timer);
  }, [opened]);

  useEffect(() => {
    if (!opened || typeof IntersectionObserver === 'undefined') return;
    const elements = CHAPTER_ORDER.map((id) => sectionRefs.current[id]).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestId: WrappedChapterId | null = null;
        let bestRatio = 0;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= bestRatio) {
            const chapter = entry.target.getAttribute('data-chapter') as WrappedChapterId | null;
            if (chapter) {
              bestId = chapter;
              bestRatio = entry.intersectionRatio;
            }
          }
        }
        if (bestId) {
          setActiveChapter(bestId);
        }
      },
      { threshold: [0.2, 0.45, 0.7], rootMargin: '-18% 0px -45% 0px' },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [opened]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  if (!opened) {
    return (
      <div className="relative flex min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#070512] text-[#F8F7FC]">
        <OccasionArtworkBackdrop
          src="/templates/occasions/our-year/cover.jpg"
          fallbackGradient="linear-gradient(155deg, #070512 0%, #1F1042 52%, #070512 100%)"
          className="object-cover object-center opacity-50"
        />

        <AmbientRainCanvas density="light" fireflies tint="rgba(167, 139, 250, 0.72)" />

        {/* Iridescent crystal prism veil */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 22% 16%, rgba(167, 139, 250, 0.34), transparent 52%), radial-gradient(circle at 84% 82%, rgba(245, 158, 11, 0.22), transparent 48%), linear-gradient(180deg, rgba(7, 5, 18, 0.72) 0%, rgba(7, 5, 18, 0.45) 46%, rgba(7, 5, 18, 0.94) 100%)',
          }}
        />

        {watermarked ? (
          <div
            aria-hidden="true"
            className="pointer-events-none relative z-20 flex justify-center border-b border-[#F59E0B]/30 bg-[#070512]/85 py-1 text-[10px] font-bold tracking-[0.22em] text-[#F59E0B]"
          >
            WEBZY FREE PREVIEW
          </div>
        ) : null}

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-3.5 text-center sm:p-6">
          {/* Act 1: Crisp dark iridescent Prism Gate card */}
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-[24px] border border-white/20 bg-[#0B0718]/80 px-5 py-6 backdrop-blur-xl shadow-[0_24px_64px_-20px_rgba(139,92,246,0.78)]"
            style={{
              backgroundImage:
                'linear-gradient(140deg, rgba(167, 139, 250, 0.14) 0%, rgba(11, 7, 24, 0.92) 45%, rgba(245, 158, 11, 0.12) 100%)',
            }}
          >
            {/* Top prism refraction shimmer */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-10 -top-12 h-28 rotate-[-6deg] opacity-40 blur-xl"
              style={{
                background: `linear-gradient(90deg, transparent, #A78BFA, ${secondaryColor}, transparent)`,
              }}
            />

            <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F59E0B]/45 bg-gradient-to-br from-[#8B5CF6]/35 via-[#0B0718] to-[#F59E0B]/20 shadow-inner">
              <PrismEmblemIcon className="h-6 w-6" />
            </div>

            <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-full border border-[#F59E0B]/45 bg-[#F59E0B]/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#FCD34D]">
              <span>{copy.editionPrefix}</span>
              <span className="opacity-60">//</span>
              <span className="max-w-[140px] truncate">
                {copy.editionForLabel} {data.receiverName}
              </span>
            </div>

            {data.relation ? (
              <p className="mt-2.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#C4B5FD]">
                {data.relation}
              </p>
            ) : null}

            <h1 className="mt-2.5 break-words font-heading text-2xl font-extrabold tracking-tight text-[#F8F7FC] sm:text-3xl">
              {copy.editionForLabel} {data.receiverName}
            </h1>

            <p className="mt-1.5 text-xs font-medium text-[#F8F7FC]/75">
              {copy.fromLabel}{' '}
              <span className="font-semibold text-[#F59E0B]">{data.senderName}</span>
            </p>

            <p className="mx-auto mt-2.5 max-w-[270px] text-xs leading-relaxed text-[#DDD6FE]/80">
              {copy.gateSubtitle}
            </p>

            {offerTagText ? (
              <p className="mt-2.5 inline-block rounded-full border border-[#A78BFA]/40 bg-[#A78BFA]/15 px-3 py-0.5 text-[11px] font-medium text-[#F8F7FC]">
                {offerTagText}
              </p>
            ) : null}

            <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-[#A78BFA]/55 to-transparent" />

            <div className="flex flex-col items-center gap-3">
              <HoldToChargeRing
                label={copy.holdLabel}
                chargingLabel={copy.holdingLabel}
                completeLabel={copy.chargedLabel}
                accentColor="#A78BFA"
                onComplete={startWarp}
                durationMs={1250}
              />

              <button
                type="button"
                onClick={startWarp}
                disabled={warping}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-5 text-xs font-bold tracking-wide text-[#F8F7FC] backdrop-blur-sm transition hover:border-[#F59E0B]/55 hover:bg-white/[0.14] active:scale-[0.98] disabled:opacity-60"
              >
                <span>{copy.quickUnlockCta}</span>
                <svg className="h-3.5 w-3.5 text-[#F59E0B]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {showTapHint ? (
              <p className="mt-3 text-[11px] font-semibold text-[#F59E0B] animate-pulse">
                {copy.tapHint}
              </p>
            ) : null}
          </div>
        </div>

        <HyperspeedWarpFlash active={warping} onDone={finishOpening} />
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-full w-full flex-col overflow-x-clip rounded-[28px] bg-[#070512] text-[#F8F7FC] animate-[fadeIn_360ms_ease-out] motion-reduce:animate-none"
    >
      {/* Midnight crystal prism backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 12% 8%, rgba(167, 139, 250, 0.28), transparent 44%), radial-gradient(circle at 88% 36%, rgba(245, 158, 11, 0.14), transparent 40%), radial-gradient(circle at 20% 72%, rgba(124, 58, 237, 0.22), transparent 46%), linear-gradient(180deg, #070512 0%, #120B26 52%, #070512 100%)',
        }}
      />

      <AmbientRainCanvas density="light" fireflies tint="rgba(196, 181, 253, 0.5)" />

      {watermarked ? (
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-30 flex justify-center border-b border-[#F59E0B]/30 bg-[#070512]/90 py-1 text-[10px] font-bold tracking-[0.22em] text-[#F59E0B]"
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      {/* Top Sticky Subtle Chapter Jump Bar + Replay Button */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070512]/85 px-3 py-2.5 backdrop-blur-md sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex min-w-0 flex-1 items-center gap-1.5 rounded-full border border-[#F59E0B]/35 bg-white/[0.06] px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.1em] text-[#F59E0B]">
            <span className="shrink-0">2026 -&gt; 2027</span>
            <span className="text-white/35">·</span>
            <span className="truncate text-[#F8F7FC]">{data.receiverName}</span>
          </span>

          <button
            type="button"
            onClick={handleReplay}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 px-3.5 text-xs font-semibold text-[#F8F7FC] transition hover:border-[#F59E0B]/50 hover:bg-white/15 active:scale-95"
          >
            {getReplayLabel(language)}
          </button>
        </div>

        <nav
          aria-label="Wrapped chapters"
          className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none"
        >
          {CHAPTER_ORDER.map((chapterId, idx) => {
            const isActive = activeChapter === chapterId;
            return (
              <button
                key={chapterId}
                type="button"
                onClick={() => jumpToChapter(chapterId)}
                aria-current={isActive ? 'true' : undefined}
                className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[11px] font-bold transition-all active:scale-95 ${
                  isActive
                    ? 'border-[#A78BFA]/70 bg-[#A78BFA]/20 text-[#F8F7FC] shadow-[0_0_16px_-4px_rgba(167,139,250,0.65)]'
                    : 'border-white/10 bg-white/[0.04] text-[#F8F7FC]/65 hover:border-white/25 hover:text-[#F8F7FC]'
                }`}
              >
                <span className="font-mono text-[9.5px] text-[#F59E0B]">{formatIndex(idx + 1)}</span>
                <span>{copy.chapterJumps[chapterId]}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Continuous Scrollable Midnight Crystal Journey */}
      <main className="relative z-10 flex flex-1 flex-col gap-5 px-3 pb-6 pt-4 sm:px-5">
        {/* SECTION 1: Year Ring, Narrative Opener & Editorial Note */}
        <section
          ref={(el) => {
            sectionRefs.current.orbit = el;
          }}
          data-chapter="orbit"
          className="scroll-mt-32 space-y-4 rounded-[24px] border border-[#A78BFA]/30 bg-white/[0.04] p-4 backdrop-blur-md shadow-[0_20px_50px_-24px_rgba(139,92,246,0.55)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#C4B5FD]">
              {copy.orbitBadge}
            </span>
            <span className="rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#F59E0B]">
              {copy.syncLabel} · {ringPercent}%
            </span>
          </div>

          {/* Word-by-word narrative opener */}
          <WordByWordFadeLine
            active={opened}
            text={copy.narrativeOpener(data.receiverName, data.senderName)}
            className="text-center font-heading text-base font-bold leading-snug tracking-tight text-[#EDE9FE] sm:text-lg"
            delayStepMs={55}
          />

          {/* Animated SVG Radial Orbital Progress Ring */}
          <div className="flex flex-col items-center py-1 text-center">
            <div className="relative flex h-40 w-40 items-center justify-center">
              <svg viewBox="0 0 144 144" className="h-full w-full -rotate-90" aria-hidden="true">
                <defs>
                  <linearGradient id={`prism-orbit-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A78BFA" />
                    <stop offset="55%" stopColor="#DDD6FE" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
                {/* Outer faint orbital track */}
                <circle
                  cx="72"
                  cy="72"
                  r="66"
                  fill="none"
                  stroke="rgba(167, 139, 250, 0.18)"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                />
                {/* Inner track */}
                <circle
                  cx="72"
                  cy="72"
                  r={ringRadius}
                  fill="none"
                  stroke="rgba(248, 247, 252, 0.12)"
                  strokeWidth="9"
                />
                {/* Animated orbital progress arc */}
                <circle
                  cx="72"
                  cy="72"
                  r={ringRadius}
                  fill="none"
                  stroke={`url(#prism-orbit-grad-${uid})`}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringAnimated ? ringTargetOffset : ringCircumference}
                  className="transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none"
                />
                {/* Orbital node */}
                <circle cx="138" cy="72" r="3" fill="#F59E0B" />
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
          </div>

          {/* Compact Metric Trio */}
          <div className="grid grid-cols-3 gap-2">
            <div className="min-w-0 rounded-2xl border border-[#A78BFA]/25 bg-[#0B0718]/75 p-2.5 text-center">
              <p className="font-heading text-lg font-black text-[#F59E0B] sm:text-xl">
                {insideJokesCount}+
              </p>
              <p className="mt-0.5 break-words text-[10.5px] font-semibold leading-tight text-[#F8F7FC]/85">
                {copy.metrics.jokes}
              </p>
            </div>
            <div className="min-w-0 rounded-2xl border border-[#A78BFA]/25 bg-[#0B0718]/75 p-2.5 text-center">
              <p className="font-heading text-lg font-black text-[#C4B5FD] sm:text-xl">
                {lateNightTalksCount}
              </p>
              <p className="mt-0.5 break-words text-[10.5px] font-semibold leading-tight text-[#F8F7FC]/85">
                {copy.metrics.talks}
              </p>
            </div>
            <div className="min-w-0 rounded-2xl border border-[#F59E0B]/30 bg-[#0B0718]/75 p-2.5 text-center">
              <p className="font-heading text-lg font-black text-[#F8F7FC] sm:text-xl">
                {coreMemoriesCount}
              </p>
              <p className="mt-0.5 break-words text-[10.5px] font-semibold leading-tight text-[#F8F7FC]/85">
                {copy.metrics.memories}
              </p>
            </div>
          </div>

          {/* Heartfelt Editorial Note */}
          <article className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#0B0718]/80 p-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-25 blur-2xl"
              style={{ backgroundColor: primaryColor }}
            />
            <div className="relative z-10 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#F59E0B]">
                  {copy.noteEyebrow}
                </span>
                {data.relation ? (
                  <span className="rounded-full border border-[#A78BFA]/35 bg-[#A78BFA]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#DDD6FE]">
                    {data.relation}
                  </span>
                ) : null}
              </div>

              {headlineText ? (
                <h2 className="break-words font-heading text-xl font-extrabold tracking-tight text-[#F8F7FC]">
                  {headlineText}
                </h2>
              ) : null}

              {messageText ? (
                <p className="break-words text-sm leading-relaxed text-[#F8F7FC]/90">
                  {messageText}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5 text-xs">
                <span className="text-[#F8F7FC]/65">{copy.signedByLabel}</span>
                <span className="font-bold text-[#F59E0B]">{data.senderName}</span>
              </div>
            </div>
          </article>
        </section>

        {/* SECTION 2: Interactive Highlight Deck */}
        <section
          ref={(el) => {
            sectionRefs.current.highlights = el;
          }}
          data-chapter="highlights"
          className="scroll-mt-32 space-y-3 rounded-[24px] border border-[#A78BFA]/30 bg-white/[0.04] p-4 backdrop-blur-md shadow-[0_20px_50px_-24px_rgba(139,92,246,0.55)]"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#C4B5FD]">
                {copy.highlightsBadge}
              </span>
              <h2 className="mt-0.5 font-heading text-lg font-extrabold text-[#F8F7FC]">
                {copy.highlightsTitle}
              </h2>
            </div>
            <span className="shrink-0 rounded-full border border-[#F59E0B]/40 bg-[#0B0718]/75 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#F59E0B]">
              {formatIndex(boundedSlideIdx + 1)} / {formatIndex(storySlides.length)}
            </span>
          </div>

          <div
            key={`deck-slide-${boundedSlideIdx}`}
            className="relative flex min-h-[210px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#F59E0B]/35 bg-[#0B0718]/80 px-4 py-6 text-center animate-fade-in"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 260 160"
              className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
            >
              <circle cx="130" cy="80" r="64" stroke="#F59E0B" strokeWidth="0.7" strokeDasharray="3 4" />
              <circle cx="130" cy="80" r="42" stroke="#A78BFA" strokeWidth="0.9" />
              <path
                d="M130 8v144M16 80h228M48 22l164 116M212 22L48 138"
                stroke="#C4B5FD"
                strokeWidth="0.5"
                strokeOpacity="0.5"
              />
            </svg>

            <div className="relative z-10 w-full">
              <span className="inline-block rounded-full border border-[#A78BFA]/50 bg-[#A78BFA]/20 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#DDD6FE]">
                {activeSlide.tag}
              </span>

              <h3 className="mt-3 break-words font-heading text-2xl font-black tracking-tight text-[#F59E0B]">
                {activeSlide.title}
              </h3>

              <p className="mt-2 break-words text-sm font-medium leading-relaxed text-[#F8F7FC]/95">
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

          {storySlides.length > 1 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-1" role="tablist" aria-label="Highlight slides">
                {storySlides.map((_, idx) => {
                  const isActive = idx === boundedSlideIdx;
                  return (
                    <button
                      key={`dot-${idx}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`${copy.chapterLabel} ${idx + 1} / ${storySlides.length}`}
                      onClick={() => setSlideIdx(idx)}
                      className="flex min-h-[44px] min-w-[36px] items-center justify-center px-1"
                    >
                      <span
                        className={`block h-2 rounded-full transition-all duration-300 ${
                          isActive
                            ? 'w-7 bg-gradient-to-r from-[#A78BFA] to-[#F59E0B]'
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

                <button
                  type="button"
                  onClick={() => setSlideIdx((i) => (i + 1) % storySlides.length)}
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
              </div>
            </div>
          ) : null}
        </section>

        {/* SECTION 3: Adaptive Memories */}
        <section
          ref={(el) => {
            sectionRefs.current.memories = el;
          }}
          data-chapter="memories"
          className="scroll-mt-32 space-y-2.5 rounded-[24px] border border-[#A78BFA]/30 bg-white/[0.04] p-4 backdrop-blur-md shadow-[0_20px_50px_-24px_rgba(139,92,246,0.55)]"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#C4B5FD]">
                {copy.memoriesBadge}
              </span>
              <h2 className="mt-0.5 font-heading text-lg font-extrabold text-[#F8F7FC]">
                {copy.memoriesTitle}
              </h2>
            </div>
            <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#DDD6FE]">
              2026
            </span>
          </div>

          <OccasionAdaptiveGallery
            photos={data.photos}
            accentColor="#A78BFA"
            dark
            captionPrefix={copy.memoriesPrefix}
            emptyFallback={
              <div className="relative mt-2 overflow-hidden rounded-2xl border border-white/15 bg-[#0B0718]/75 p-5 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[#A78BFA]/35 bg-[#A78BFA]/15">
                  <PrismEmblemIcon className="h-5 w-5" />
                </div>
                <p className="font-heading text-sm font-bold text-[#F8F7FC]">
                  {copy.memoriesEmptyTitle}
                </p>
                <p className="mx-auto mt-1 max-w-[260px] text-xs leading-relaxed text-[#F8F7FC]/70">
                  {copy.memoriesEmptyBody}
                </p>
              </div>
            }
          />

          {photosCount > 0 ? (
            <p className="pt-1 text-center text-xs leading-relaxed text-[#F8F7FC]/70">
              {copy.memoriesHint}
            </p>
          ) : null}
        </section>

        {/* SECTION 4: Year Soundtrack Sanctuary */}
        <section
          ref={(el) => {
            sectionRefs.current.soundtrack = el;
          }}
          data-chapter="soundtrack"
          className="scroll-mt-32 space-y-2.5"
        >
          <div className="px-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#C4B5FD]">
              {copy.soundtrackBadge}
            </span>
          </div>
          <CurvedTrackSanctuary
            tracks={soundtrackTracks}
            mood="festive"
            accentColor="#A78BFA"
            dark
            heading={copy.soundtrackHeading}
          />
        </section>

        {/* SECTION 5: 2027 Intention Picker & Collectible Metallic Pass */}
        <section
          ref={(el) => {
            sectionRefs.current.pass = el;
          }}
          data-chapter="pass"
          className="scroll-mt-32 space-y-4 rounded-[24px] border border-[#A78BFA]/30 bg-white/[0.04] p-4 backdrop-blur-md shadow-[0_20px_50px_-24px_rgba(139,92,246,0.55)]"
        >
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#F59E0B]">
              {copy.intentionBadge}
            </span>
            <h2 className="mt-0.5 font-heading text-lg font-extrabold text-[#F8F7FC]">
              {copy.intentionTitle}
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-[#F8F7FC]/75">
              {copy.intentionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {copy.intentions.map((intention) => {
              const isSelected = intention.id === selectedIntention;
              return (
                <button
                  key={intention.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedIntention(intention.id)}
                  className={`flex min-h-[84px] min-w-0 flex-col items-start justify-between rounded-2xl border p-3 text-left transition-all duration-200 active:scale-[0.98] ${
                    isSelected
                      ? 'border-[#F59E0B] bg-[#A78BFA]/20 shadow-[0_10px_24px_-10px_rgba(245,158,11,0.6)]'
                      : 'border-white/15 bg-[#0B0718]/75 hover:border-[#A78BFA]/55 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <IntentionIcon id={intention.id} active={isSelected} />
                    {isSelected ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" aria-hidden="true" />
                    ) : null}
                  </div>
                  <div className="mt-2 w-full min-w-0">
                    <p className="break-words text-xs font-bold text-[#F8F7FC]">
                      {intention.label}
                    </p>
                    <p className="mt-0.5 break-words text-[10.5px] leading-tight text-[#F8F7FC]/70">
                      {intention.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Collectible Metallic Keepsake Pass */}
          <div
            className="relative overflow-hidden rounded-[22px] border border-[#F59E0B]/60 p-4 shadow-[0_24px_54px_-18px_rgba(139,92,246,0.75)] sm:p-5"
            style={{
              background:
                'linear-gradient(145deg, #1A1236 0%, #090616 48%, #25154B 100%)',
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#F59E0B]/15 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-14 -left-14 h-40 w-40 rounded-full bg-[#A78BFA]/25 blur-2xl"
            />

            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="inline-block rounded-full border border-[#F59E0B]/45 bg-[#F59E0B]/15 px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
                    {copy.passBadge}
                  </span>
                  <h3 className="mt-2 break-words font-heading text-xl font-black tracking-tight text-[#F8F7FC]">
                    {copy.passTitle}
                  </h3>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#F59E0B]/45 bg-[#0B0718]/75">
                  <PrismEmblemIcon className="h-6 w-6" />
                </div>
              </div>

              {/* Sealed 2027 Intention Highlight */}
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#A78BFA]/45 bg-white/[0.06] px-3.5 py-3">
                <div className="min-w-0">
                  <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#C4B5FD]">
                    {copy.passIntentionLabel}
                  </p>
                  <p className="mt-0.5 break-words font-heading text-base font-extrabold text-[#F59E0B]">
                    {currentIntentionObj.label}
                  </p>
                  <p className="break-words text-[11px] text-[#F8F7FC]/75">
                    {currentIntentionObj.tagline}
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F59E0B]/40 bg-[#0B0718]/80">
                  <IntentionIcon id={currentIntentionObj.id} active />
                </div>
              </div>

              {/* Issued To & From Grid */}
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

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-white/15 pt-2.5 font-mono text-[10px] tracking-[0.14em] text-[#F8F7FC]/65">
                <span>
                  {copy.passSerialLabel}: {serialCode}
                </span>
                <span>{data.relation ? data.relation.toUpperCase() : '2026 -> 2027'}</span>
              </div>
            </div>
          </div>

          {/* Share / Copy Toast + Optional WhatsApp Reply + Replay */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleCopyKeepsakePass}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#A78BFA] to-[#F59E0B] px-5 text-xs font-bold text-[#070512] shadow-[0_10px_28px_-8px_rgba(245,158,11,0.55)] transition hover:brightness-110 active:scale-[0.98]"
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
              {hasValidWhatsapp ? (
                <a
                  href={`https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(
                    `2026 -> 2027 Prism Pass (${currentIntentionObj.label}) — thank you, ${data.senderName}!`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-[#A78BFA]/45 bg-[#A78BFA]/20 px-4 text-xs font-bold text-[#F8F7FC] transition hover:bg-[#A78BFA]/30"
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

        <footer className="border-t border-white/10 pt-3 text-center text-[11px] text-[#F8F7FC]/60">
          {getWebzyFooterLabel(language)}
        </footer>
      </main>
    </div>
  );
}
