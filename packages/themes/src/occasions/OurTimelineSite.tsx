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
  WordByWordFadeLine,
} from './shared/OccasionCinematicFX';

type TimelineSectionId = 'heart-tree' | 'e-magazine' | 'story-rail' | 'soundtrack' | 'keepsake';

const SECTION_ORDER: readonly TimelineSectionId[] = [
  'heart-tree',
  'e-magazine',
  'story-rail',
  'soundtrack',
  'keepsake',
];

interface BranchHotspotSpec {
  id: string;
  top: string;
  left: string;
  tag: Record<CoreLanguageCode, string>;
  thought: Record<CoreLanguageCode, string>;
}

const BRANCH_HOTSPOTS: readonly BranchHotspotSpec[] = [
  {
    id: 'roots',
    top: '26%',
    left: '24%',
    tag: {
      en: 'QUIET ROOTS',
      hinglish: 'PEHLI JADEIN',
      hi: 'पहली जड़ें',
    },
    thought: {
      en: 'Every small ordinary Tuesday became a place I wanted to stay.',
      hinglish: 'Tumhare saath har mamooli din bhi ek sukoon bhari jagah ban gaya.',
      hi: 'तुम्हारे साथ हर साधारण दिन भी ठहर जाने की वजह बन गया।',
    },
  },
  {
    id: 'crown',
    top: '16%',
    left: '50%',
    tag: {
      en: 'BLOOMING CROWN',
      hinglish: 'KHILTA AANGAN',
      hi: 'खिलता शिखर',
    },
    thought: {
      en: 'Different seasons, same steady warmth growing above every storm.',
      hinglish: 'Mausam badalte rahe, par saath ki garmi har saal aur gehri hoti gayi.',
      hi: 'मौसम बदलते रहे, पर साथ की गर्माहट हर साल और गहरी होती गई।',
    },
  },
  {
    id: 'canopy',
    top: '29%',
    left: '75%',
    tag: {
      en: 'GOLDEN LEAVES',
      hinglish: 'SUNAHRI SHAAKHEIN',
      hi: 'सुनहरी शाखाएँ',
    },
    thought: {
      en: 'Still choosing your hand first, in crowded rooms and quiet evenings.',
      hinglish: 'Bheed ho ya shaam ki khamoshi, aaj bhi sabse pehle tumhara haath chunte hain.',
      hi: 'भीड़ हो या शाम की खामोशी, आज भी सबसे पहले तुम्हारा हाथ थामते हैं।',
    },
  },
];

interface TimelineCopy {
  previewBanner: string;
  editionPill: string;
  volumeSubtitle: string;
  fromLabel: string;
  openCta: string;
  tapHint: string;
  navAriaLabel: string;
  sections: Record<TimelineSectionId, string>;
  treeBotanicalTag: string;
  treeScriptHeader: string;
  fullArtLabel: string;
  exitFullArtLabel: string;
  bloomPetalsCta: string;
  bloomingAgainCta: string;
  petalsCountLabel: (count: number) => string;
  hotspotPrompt: string;
  closeWhisperLabel: string;
  loveLetterBadge: string;
  magazineMasthead: string;
  magazineLeftTitle: string;
  magazineLeftSub: string;
  magazineRightTitle: string;
  magazineRightSub: string;
  magazineIssueNote: string;
  galleryHeading: string;
  galleryPrefix: string;
  galleryEmptyQuote: string;
  galleryEmptyCaption: string;
  timelineEyebrow: string;
  railHint: string;
  railPrevLabel: string;
  railNextLabel: string;
  chaptersCountLabel: (count: number) => string;
  railEmptyTitle: string;
  railEmptyDetail: string;
  soundtrackHeading: string;
  tracks: readonly [CurvedTrackItem, CurvedTrackItem, CurvedTrackItem];
  vowHeading: string;
  vowQuote: string;
  signaturePrefix: string;
  holdToSealLabel: string;
  sealingLabel: string;
  sealedCompleteLabel: string;
  sealedStampNote: string;
  colophonNote: string;
}

const TIMELINE_COPY: Record<CoreLanguageCode, TimelineCopy> = {
  en: {
    previewBanner: 'WEBZY FREE PREVIEW',
    editionPill: 'ANNIVERSARY EDITION',
    volumeSubtitle: 'Chapters of Us',
    fromLabel: 'Crafted by',
    openCta: 'Open Our Story',
    tapHint: 'Tap the rose-linen cover or button to unseal',
    navAriaLabel: 'Magazine chapters',
    sections: {
      'heart-tree': 'Heart Tree',
      'e-magazine': 'E-Magazine',
      'story-rail': 'Story Rail',
      soundtrack: 'Soundtrack',
      keepsake: 'Keepsake',
    },
    treeBotanicalTag: 'BOTANICAL EDITION · HEART TREE',
    treeScriptHeader: 'to us and a love that blooms',
    fullArtLabel: 'Full Art',
    exitFullArtLabel: 'Show Story',
    bloomPetalsCta: 'Bloom Petals',
    bloomingAgainCta: 'Bloom More',
    petalsCountLabel: (count) => `${count} Bloom${count === 1 ? '' : 's'}`,
    hotspotPrompt: 'Tap a glowing heart on the canopy to read a branch whisper',
    closeWhisperLabel: 'Close whisper',
    loveLetterBadge: 'LOVE LETTER',
    magazineMasthead: 'ANNIVERSARY E-MAGAZINE',
    magazineLeftTitle: 'YOU & ME',
    magazineLeftSub: 'Written in quiet mornings & shared laughter',
    magazineRightTitle: 'FOREVER.',
    magazineRightSub: 'COLLECTOR ISSUE',
    magazineIssueNote: 'Curated frames and notes from our favorite chapters together.',
    galleryHeading: 'CURATED FRAMES',
    galleryPrefix: 'Memory',
    galleryEmptyQuote: 'Some seasons live in photographs; others stay warm in memory.',
    galleryEmptyCaption: 'ARCHIVED IN PRINT · ISSUE 01',
    timelineEyebrow: 'STORY RAIL · TIMELINE',
    railHint: 'Scroll or glide across chapters',
    railPrevLabel: 'Previous chapter',
    railNextLabel: 'Next chapter',
    chaptersCountLabel: (count) => `${String(count).padStart(2, '0')} Chapters`,
    railEmptyTitle: 'Every day adds a quiet line',
    railEmptyDetail: 'Our story continues to unfold across shared mornings and unhurried evenings.',
    soundtrackHeading: 'LATE-NIGHT SANCTUARY',
    tracks: [
      {
        id: 'track-1',
        title: 'Acoustic Sunset',
        moodLabel: 'Warm Strings',
        duration: '03:18',
        note: 'Golden-hour chords for long walks and quiet balcony talks.',
      },
      {
        id: 'track-2',
        title: 'Midnight Chai',
        moodLabel: 'Velvet Lo-Fi',
        duration: '02:54',
        note: 'Soft vinyl crackle for late conversations after the city sleeps.',
      },
      {
        id: 'track-3',
        title: 'Petals in Amber',
        moodLabel: 'Soft Waltz',
        duration: '03:42',
        note: 'Gentle slow-dance notes for celebrating another year together.',
      },
    ],
    vowHeading: 'Chapters Ahead',
    vowQuote: '"Grateful for every quiet mile behind us, and every chapter yet to bloom."',
    signaturePrefix: 'With love,',
    holdToSealLabel: 'Hold to Seal Next-Chapter Vow',
    sealingLabel: 'Pressing wax seal...',
    sealedCompleteLabel: 'Anniversary Vow Sealed',
    sealedStampNote: 'Wax seal pressed · Keepsake archived forever',
    colophonNote: 'Handcrafted anniversary e-magazine — preserved in memory.',
  },
  hinglish: {
    previewBanner: 'WEBZY FREE PREVIEW',
    editionPill: 'ANNIVERSARY EDITION',
    volumeSubtitle: 'Chapters of Us · Hamara Safar',
    fromLabel: 'Dil se bheja:',
    openCta: 'Hamari Kahani Kholo',
    tapHint: 'Kholne ke liye rose-linen cover ya button par tap karein',
    navAriaLabel: 'Magazine ke hisse',
    sections: {
      'heart-tree': 'Heart Tree',
      'e-magazine': 'E-Magazine',
      'story-rail': 'Story Rail',
      soundtrack: 'Soundtrack',
      keepsake: 'Keepsake',
    },
    treeBotanicalTag: 'BOTANICAL EDITION · HEART TREE',
    treeScriptHeader: 'to us and a love that blooms',
    fullArtLabel: 'Full Art',
    exitFullArtLabel: 'Story Dikhao',
    bloomPetalsCta: 'Bloom Petals',
    bloomingAgainCta: 'Aur Khilao',
    petalsCountLabel: (count) => `${count} Bloom${count === 1 ? '' : 's'}`,
    hotspotPrompt: 'Ped ki shaakhon par chamakte dil par tap karke chhoti yaad padho',
    closeWhisperLabel: 'Band karein',
    loveLetterBadge: 'LOVE LETTER',
    magazineMasthead: 'ANNIVERSARY E-MAGAZINE',
    magazineLeftTitle: 'YOU & ME',
    magazineLeftSub: 'Har subah ki chai aur pyaari baatein',
    magazineRightTitle: 'FOREVER.',
    magazineRightSub: 'COLLECTOR EDITION',
    magazineIssueNote: 'Hamare sabse khaas lamhon ki photo diary aur kisse.',
    galleryHeading: 'YAADGAAR FRAMES',
    galleryPrefix: 'Yaad',
    galleryEmptyQuote: 'Kuch pal tasveeron mein qaid hote hain, aur kuch seedha dil mein.',
    galleryEmptyCaption: 'COLLECTOR PRINT · ISSUE 01',
    timelineEyebrow: 'STORY RAIL · TIMELINE',
    railHint: 'Chapters aage-peeche slide karein',
    railPrevLabel: 'Pichhla chapter',
    railNextLabel: 'Agla chapter',
    chaptersCountLabel: (count) => `${String(count).padStart(2, '0')} Chapters`,
    railEmptyTitle: 'Har din ek nayi line judti hai',
    railEmptyDetail: 'Chhoti-chhoti khushiyon aur saath bitaayi shaamon se banta hamara safar.',
    soundtrackHeading: 'HAMARA SOUNDTRACK',
    tracks: [
      {
        id: 'track-1',
        title: 'Acoustic Sunset',
        moodLabel: 'Warm Strings',
        duration: '03:18',
        note: 'Shaam ki dhoop aur lambi walks ke liye ek meethi dhun.',
      },
      {
        id: 'track-2',
        title: 'Midnight Chai',
        moodLabel: 'Velvet Lo-Fi',
        duration: '02:54',
        note: 'Raat ki khamoshi mein sukoon bhari baaton ka soundtrack.',
      },
      {
        id: 'track-3',
        title: 'Petals in Amber',
        moodLabel: 'Soft Waltz',
        duration: '03:42',
        note: 'Ek aur khoobsurat saal saath manane ke liye halka sa waltz.',
      },
    ],
    vowHeading: 'Chapters Ahead',
    vowQuote: '"Beete har pal ka shukriya, aur aane wale har khilte chapter ke naam."',
    signaturePrefix: 'Pyaar ke saath,',
    holdToSealLabel: 'Hold karke Vow Seal Karein',
    sealingLabel: 'Wax seal lag rahi hai...',
    sealedCompleteLabel: 'Anniversary Vow Sealed',
    sealedStampNote: 'Wax seal lag gayi · Yaadein hamesha mehfooz',
    colophonNote: 'Khaas anniversary e-magazine — yaadon mein hamesha mehfooz.',
  },
  hi: {
    previewBanner: 'WEBZY FREE PREVIEW',
    editionPill: 'सालगिरह विशेष संस्करण',
    volumeSubtitle: 'हमारी कहानी · Chapters of Us',
    fromLabel: 'प्रेषक:',
    openCta: 'हमारी कहानी खोलें',
    tapHint: 'खोलने के लिए कवर या बटन पर टैप करें',
    navAriaLabel: 'पत्रिका के अध्याय',
    sections: {
      'heart-tree': 'हार्ट ट्री',
      'e-magazine': 'ई-मैगज़ीन',
      'story-rail': 'सफ़र',
      soundtrack: 'संगीत',
      keepsake: 'संकल्प',
    },
    treeBotanicalTag: 'फूलों का विशेष संस्करण',
    treeScriptHeader: 'हमारे नाम और खिलते हुए प्यार के नाम',
    fullArtLabel: 'पूर्ण चित्र',
    exitFullArtLabel: 'कहानी देखें',
    bloomPetalsCta: 'पंखुड़ियाँ खिलाएं',
    bloomingAgainCta: 'और खिलाएं',
    petalsCountLabel: (count) => `${count} बार खिला`,
    hotspotPrompt: 'टहनियों पर चमकते दिल पर टैप करके अनकही बात पढ़ें',
    closeWhisperLabel: 'बंद करें',
    loveLetterBadge: 'प्रेम पत्र',
    magazineMasthead: 'सालगिरह ई-मैगज़ीन',
    magazineLeftTitle: 'YOU & ME',
    magazineLeftSub: 'मीठी सुबहों और अनकही मुस्कान की कहानी',
    magazineRightTitle: 'FOREVER.',
    magazineRightSub: 'विशेष संग्राहक अंक',
    magazineIssueNote: 'हमारे सबसे प्यारे पलों की चुनिंदा झलकियाँ और यादें।',
    galleryHeading: 'सजी हुई यादें',
    galleryPrefix: 'स्मृति',
    galleryEmptyQuote: 'कुछ पल तस्वीरों में बसते हैं, और कुछ सीधे दिल की किताब में।',
    galleryEmptyCaption: 'संग्राहक संस्करण · अंक 01',
    timelineEyebrow: 'सफ़र की रेल · यादें',
    railHint: 'अध्यायों को आगे-पीछे स्लाइड करें',
    railPrevLabel: 'पिछला अध्याय',
    railNextLabel: 'अगला अध्याय',
    chaptersCountLabel: (count) => `${String(count).padStart(2, '0')} अध्याय`,
    railEmptyTitle: 'हर दिन जुड़ता एक नया पन्ना',
    railEmptyDetail: 'मुस्कुराती सुबहों और सुकून भरी शामों से बुनी हमारी कहानी।',
    soundtrackHeading: 'हमारा संगीत संसार',
    tracks: [
      {
        id: 'track-1',
        title: 'संध्या के स्वर',
        moodLabel: 'मधुर तार',
        duration: '03:18',
        note: 'सुनहरी शाम की सैर और शांत बातों के लिए एक कोमल धुन।',
      },
      {
        id: 'track-2',
        title: 'रात की चाय',
        moodLabel: 'धीमी लो-फ़ाई',
        duration: '02:54',
        note: 'सन्नाटे में गूंजती हँसी और मीठी यादों का साथी।',
      },
      {
        id: 'track-3',
        title: 'अंबर की पंखुड़ियाँ',
        moodLabel: 'सॉफ्ट वाल्ट्ज़',
        duration: '03:42',
        note: 'साथ बिताए एक और सुंदर वर्ष के जश्न की धुन।',
      },
    ],
    vowHeading: 'आने वाले अध्याय',
    vowQuote: '"बीते हर खूबसूरत मोड़ का आभार, और आने वाले हर खिलते कल के नाम।"',
    signaturePrefix: 'स्नेह सहित,',
    holdToSealLabel: 'दबाकर अगला वादा सहेजें',
    sealingLabel: 'मोहर लग रही है...',
    sealedCompleteLabel: 'सालगिरह वादा सहेजा गया',
    sealedStampNote: 'मोहर लग चुकी है · यादें सदा के लिए सुरक्षित',
    colophonNote: 'हाथ से संजोया गया सालगिरह उपहार — यादों में सदा के लिए।',
  },
};

const AMBIENT_PETALS = [
  { left: '14%', delay: '0s', duration: '7.5s', size: 11, color: '#FB7185', drift: '-18px' },
  { left: '34%', delay: '1.8s', duration: '8.4s', size: 10, color: '#F43F5E', drift: '16px' },
  { left: '56%', delay: '0.9s', duration: '7.9s', size: 12, color: '#FDE68A', drift: '-14px' },
  { left: '78%', delay: '2.7s', duration: '8.8s', size: 10, color: '#E11D63', drift: '14px' },
] as const;

const BURST_PETALS = [
  { left: '12%', delay: '0ms', duration: '2400ms', size: 12, color: '#E11D63', drift: '-14px' },
  { left: '24%', delay: '180ms', duration: '2700ms', size: 10, color: '#FB7185', drift: '16px' },
  { left: '38%', delay: '90ms', duration: '2500ms', size: 13, color: '#9D174D', drift: '-10px' },
  { left: '52%', delay: '260ms', duration: '2800ms', size: 11, color: '#F43F5E', drift: '18px' },
  { left: '66%', delay: '140ms', duration: '2450ms', size: 12, color: '#F59E0B', drift: '-16px' },
  { left: '78%', delay: '320ms', duration: '2650ms', size: 10, color: '#FB7185', drift: '12px' },
  { left: '88%', delay: '60ms', duration: '2550ms', size: 12, color: '#9D174D', drift: '-12px' },
] as const;

const TREE_BLOSSOM_NODES = [
  { top: '18%', left: '43%', size: 14, color: '#E11D63' },
  { top: '24%', left: '32%', size: 12, color: '#FB7185' },
  { top: '22%', left: '62%', size: 13, color: '#9D174D' },
  { top: '36%', left: '28%', size: 11, color: '#F43F5E' },
  { top: '35%', left: '68%', size: 12, color: '#E11D63' },
  { top: '42%', left: '49%', size: 11, color: '#F59E0B' },
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

/** Botanical gold filigree corner flourish for the rose-linen cover. */
function BotanicalFiligreeCorner({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4 44V16C4 9.373 9.373 4 16 4H44"
        stroke="#D97706"
        strokeOpacity="0.65"
        strokeWidth="1.2"
      />
      <path
        d="M10 34C10 20 20 10 34 10"
        stroke="#F59E0B"
        strokeOpacity="0.55"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      <path
        d="M13 18C16 13 21 12 23 15C20 18 16 19 13 18Z"
        fill="#F59E0B"
        fillOpacity="0.35"
        stroke="#D97706"
        strokeOpacity="0.6"
        strokeWidth="0.9"
      />
      <circle cx="9" cy="9" r="2" fill="#F59E0B" fillOpacity="0.7" />
    </svg>
  );
}

/**
 * Atmospheric Anniversary E-Magazine & Blooming Story Website ("Our Timeline").
 * Features a rose-linen foil seal cover, sticky continuous editorial jump nav,
 * watercolor blooming heart tree with Full Art toggle & 3 glowing canopy hotspots,
 * YOU & ME / FOREVER editorial spread, adaptive photo gallery, y -> x story rail,
 * dark glass CurvedTrackSanctuary player, and Hold-to-Seal Keepsake Vow.
 */
export function OurTimelineSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const uid = useId().replace(/:/g, '');
  const [opened, setOpened] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);
  const [activeSection, setActiveSection] = useState<TimelineSectionId>('heart-tree');
  const [fullArt, setFullArt] = useState(false);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [bloomBurstCount, setBloomBurstCount] = useState(0);
  const [activeHighlightIdx, setActiveHighlightIdx] = useState(0);
  const [sealed, setSealed] = useState(false);

  const sectionRefs = useRef<Record<TimelineSectionId, HTMLElement | null>>({
    'heart-tree': null,
    'e-magazine': null,
    'story-rail': null,
    soundtrack: null,
    keepsake: null,
  });
  const railRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const coreLang = toCoreLanguageCode(language);
  const copy = TIMELINE_COPY[coreLang] ?? TIMELINE_COPY.en;
  const highlights = data.highlights ?? [];
  const monogram = extractCoupleMonogram(data.receiverName);
  const themeLabel = pickLocalizedText(manifest.name, language);
  const headlineText = pickLocalizedText(data.headline, language);
  const messageText = pickLocalizedText(data.message, language);

  const soundtrackTracks = useMemo<readonly CurvedTrackItem[]>(() => {
    const primaryLabel = manifest.music?.[0]?.label?.trim();
    const [first, second, third] = copy.tracks;
    return [
      {
        ...first,
        title: primaryLabel || first.title,
      },
      second,
      third,
    ];
  }, [copy.tracks, manifest.music]);

  useEffect(() => {
    if (opened) return;
    const hintTimer = setTimeout(() => {
      setShowTapHint(true);
    }, 7000);
    return () => clearTimeout(hintTimer);
  }, [opened]);

  useEffect(() => {
    if (!opened || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        let bestId: TimelineSectionId | null = null;
        let bestRatio = 0;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            const id = entry.target.getAttribute('data-section-id') as TimelineSectionId | null;
            if (id && SECTION_ORDER.includes(id)) {
              bestRatio = entry.intersectionRatio;
              bestId = id;
            }
          }
        }
        if (bestId) {
          setActiveSection(bestId);
        }
      },
      { threshold: [0.25, 0.55], rootMargin: '-72px 0px -30% 0px' },
    );

    SECTION_ORDER.forEach((id) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [opened]);

  useEffect(() => {
    if (!opened) return;
    const el = railRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth + 2) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      const atLeft = el.scrollLeft <= 1 && e.deltaY < 0;
      const atRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 && e.deltaY > 0;
      if (atLeft || atRight) return;

      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [opened, highlights.length]);

  useEffect(() => {
    if (highlights.length === 0) {
      setActiveHighlightIdx(0);
    } else if (activeHighlightIdx >= highlights.length) {
      setActiveHighlightIdx(highlights.length - 1);
    }
  }, [highlights.length, activeHighlightIdx]);

  const handleOpen = useCallback(() => {
    setOpened(true);
    onOpened?.();
  }, [onOpened]);

  const handleReplay = useCallback(() => {
    setShowTapHint(false);
    setOpened(false);
    setFullArt(false);
    setActiveHotspotId(null);
    setSealed(false);
    setActiveSection('heart-tree');
  }, []);

  const jumpToSection = useCallback((id: TimelineSectionId) => {
    setActiveSection(id);
    const target = sectionRefs.current[id];
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const focusMilestone = useCallback(
    (idx: number) => {
      if (highlights.length === 0) return;
      const bounded = Math.max(0, Math.min(highlights.length - 1, idx));
      setActiveHighlightIdx(bounded);
      const card = cardRefs.current[bounded];
      if (card && typeof card.scrollIntoView === 'function') {
        card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    },
    [highlights.length],
  );

  const activeHotspot = useMemo(
    () => BRANCH_HOTSPOTS.find((spot) => spot.id === activeHotspotId) ?? null,
    [activeHotspotId],
  );

  return (
    <article
      aria-label={themeLabel || 'Our Timeline'}
      className="relative flex min-h-full w-full flex-col justify-between overflow-x-clip rounded-[28px] bg-[#FDF2F8] text-[#2B1B2E]"
    >
      <style>{`
        @keyframes otPetalBurst-${uid} {
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
            transform: translate3d(var(--ot-drift, 12px), 210px, 0) scale(1.05) rotate(28deg);
          }
        }
        @keyframes otAmbientDrift-${uid} {
          0% {
            opacity: 0;
            transform: translate3d(0, -12px, 0) rotate(0deg);
          }
          20% {
            opacity: 0.7;
          }
          80% {
            opacity: 0.6;
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--ot-drift, 14px), 240px, 0) rotate(36deg);
          }
        }
        @keyframes otBlossomPop-${uid} {
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
        @keyframes otHotspotPulse-${uid} {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(253, 230, 138, 0.55), 0 0 18px rgba(225, 29, 99, 0.45);
          }
          50% {
            transform: scale(1.08);
            box-shadow: 0 0 0 9px rgba(253, 230, 138, 0), 0 0 26px rgba(251, 113, 133, 0.7);
          }
        }
        .ot-petal-burst-${uid} {
          animation-name: otPetalBurst-${uid};
          animation-timing-function: cubic-bezier(0.22, 0.65, 0.35, 1);
          animation-fill-mode: forwards;
        }
        .ot-petal-ambient-${uid} {
          animation-name: otAmbientDrift-${uid};
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .ot-blossom-node-${uid} {
          animation: otBlossomPop-${uid} 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .ot-hotspot-ring-${uid} {
          animation: otHotspotPulse-${uid} 2.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ot-petal-burst-${uid},
          .ot-petal-ambient-${uid},
          .ot-blossom-node-${uid},
          .ot-hotspot-ring-${uid} {
            animation: none !important;
          }
        }
      `}</style>

      {watermarked ? (
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-40 flex justify-center border-b border-[#9D174D]/15 bg-[#FFE8EF]/95 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9D174D]"
        >
          {copy.previewBanner}
        </div>
      ) : null}

      {!opened ? (
        /* ACT 1 — Rose-Linen Foil Cover Seal */
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
          className="relative flex flex-1 cursor-pointer flex-col items-center justify-center p-4 text-center sm:p-7"
        >
          <OccasionArtworkBackdrop
            src="/templates/occasions/our-timeline/cover.jpg"
            fallbackGradient="linear-gradient(155deg, #FDF2F8 0%, #FCE7F3 56%, #FFFBEB 100%)"
            className="object-cover object-center opacity-45"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 34%, rgba(255,253,249,0.72), rgba(253,242,248,0.92)), repeating-linear-gradient(0deg, rgba(157,23,77,0.03) 0px, rgba(157,23,77,0.03) 1px, transparent 1px, transparent 4px)',
            }}
          />

          <div className="relative z-10 flex w-full max-w-md flex-col items-center rounded-[24px] border border-[#F59E0B]/65 bg-[#FDF2F8]/92 p-2 shadow-[0_18px_42px_-12px_rgba(43,27,46,0.18)] backdrop-blur-xs">
            <div className="relative flex w-full flex-col items-center rounded-[18px] border border-[#D97706]/40 bg-[#FFFDF9]/88 px-5 py-8 sm:px-7 sm:py-10">
              <BotanicalFiligreeCorner className="pointer-events-none absolute left-2 top-2 h-9 w-9" />
              <BotanicalFiligreeCorner className="pointer-events-none absolute right-2 top-2 h-9 w-9 rotate-90" />
              <BotanicalFiligreeCorner className="pointer-events-none absolute bottom-2 left-2 h-9 w-9 -rotate-90" />
              <BotanicalFiligreeCorner className="pointer-events-none absolute bottom-2 right-2 h-9 w-9 rotate-180" />

              {/* Wax-gold monogram medallion */}
              <div
                aria-hidden="true"
                className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#F59E0B]/80 bg-[#9D174D] shadow-[0_12px_26px_-6px_rgba(157,23,77,0.5)] ring-4 ring-[#FDF2F8] transition-transform duration-300 hover:scale-105 motion-reduce:transition-none"
              >
                <span className="pointer-events-none absolute inset-1.5 rounded-full border border-[#FDE68A]/60" />
                <span className="font-royal-serif text-lg font-semibold tracking-[0.08em] text-[#FFFDF9]">
                  {monogram}
                </span>
              </div>

              <span className="inline-flex items-center rounded-full border border-[#F59E0B]/55 bg-[#FFFBEB]/95 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#92400E]">
                {copy.editionPill}
              </span>

              <h1 className="mt-4 max-w-full break-words font-heading text-3xl font-bold leading-tight tracking-tight text-[#2B1B2E] sm:text-[34px]">
                {data.receiverName}
              </h1>

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
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#F59E0B]/55 bg-[#9D174D] px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#FFFDF9] shadow-[0_10px_24px_-6px_rgba(157,23,77,0.48)] transition duration-200 hover:bg-[#831340] active:scale-[0.98] motion-reduce:transition-none"
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
        /* CONTINUOUS SCROLLABLE EDITORIAL MAGAZINE */
        <div className="relative flex flex-1 flex-col gap-5 px-3.5 pb-5 pt-3.5 animate-fade-in motion-reduce:animate-none sm:px-6 sm:pt-4">
          {/* Top Issue Header */}
          <header className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex min-h-[36px] items-center rounded-full border border-[#D97706]/35 bg-[#FFFDF9] px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#92400E] shadow-2xs">
              {monogram} · {copy.editionPill}
            </span>
            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex min-h-[44px] items-center rounded-full border border-[#2B1B2E]/15 bg-[#FFFDF9] px-4 text-xs font-semibold text-[#2B1B2E] shadow-xs transition hover:border-[#9D174D]/40 hover:bg-white active:scale-95 motion-reduce:transition-none"
            >
              {getReplayLabel(language)}
            </button>
          </header>

          {/* Sticky Section Jump Navigation */}
          <nav
            aria-label={copy.navAriaLabel}
            className="sticky top-2 z-30 -mx-0.5 rounded-2xl border border-[#D97706]/25 bg-[#FFFDF9]/90 p-1.5 shadow-[0_10px_28px_-14px_rgba(43,27,46,0.28)] backdrop-blur-md"
          >
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {SECTION_ORDER.map((id, idx) => {
                const isActive = activeSection === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-current={isActive ? 'location' : undefined}
                    onClick={() => jumpToSection(id)}
                    className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 text-[11px] font-bold transition-all active:scale-95 ${
                      isActive
                        ? 'bg-[#9D174D] text-[#FFFDF9] shadow-xs'
                        : 'text-[#2B1B2E]/75 hover:bg-[#FDF2F8] hover:text-[#9D174D]'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-70">0{idx + 1}</span>
                    <span>{copy.sections[id]}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* ACT 2 — Blooming Heart Tree Canvas + Glowing Branch Hotspots + Love Letter */}
          <section
            ref={(el) => {
              sectionRefs.current['heart-tree'] = el;
            }}
            data-section-id="heart-tree"
            aria-label={copy.sections['heart-tree']}
            className="scroll-mt-20 space-y-4 rounded-[26px] border border-[#D97706]/30 bg-[#FFFDF9]/95 p-3.5 shadow-[0_14px_34px_-14px_rgba(43,27,46,0.16)] sm:p-5"
          >
            <div className="text-center">
              <span className="inline-flex items-center rounded-full border border-[#9D174D]/20 bg-[#FDF2F8] px-3 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#9D174D]">
                {copy.treeBotanicalTag}
              </span>
              <p className="mt-1.5 font-royal-script text-[26px] leading-snug text-[#9D174D] sm:text-[31px]">
                {copy.treeScriptHeader}
              </p>
            </div>

            {/* Blooming Watercolor Heart Tree Interactive Stage */}
            <div className="relative overflow-hidden rounded-[22px] border border-[#F59E0B]/45 bg-[#1B1218] shadow-inner">
              <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/11]">
                <OccasionArtworkBackdrop
                  src="/templates/occasions/our-timeline/cover.jpg"
                  fallbackGradient="linear-gradient(155deg, #2D1220 0%, #581C38 52%, #1C131E 100%)"
                  className="object-cover object-center opacity-30"
                />
                <OccasionArtworkBackdrop
                  src="/templates/occasions/our-timeline/scene.jpg"
                  fallbackGradient="transparent"
                  className={`object-cover object-center transition-transform duration-700 ${
                    fullArt ? 'scale-[1.02]' : 'scale-100'
                  }`}
                />

                {/* Soft atmospheric twilight scrims hidden in Full Art mode */}
                {!fullArt ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#160D14]/65 via-transparent to-[#160D14]/25"
                  />
                ) : null}

                {/* Golden Firefly Particles */}
                <AmbientRainCanvas fireflies density="light" tint="#FDE68A" />

                {/* Gentle continuous drifting petals */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
                >
                  {AMBIENT_PETALS.map((petal, idx) => (
                    <span
                      key={`ambient-petal-${idx}`}
                      className={`ot-petal-ambient-${uid} absolute -top-4 block`}
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

                {/* Extra canopy heart blossoms when Bloom Petals is tapped */}
                {bloomBurstCount > 0 ? (
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    {TREE_BLOSSOM_NODES.slice(
                      0,
                      Math.min(TREE_BLOSSOM_NODES.length, bloomBurstCount + 2),
                    ).map((node, idx) => (
                      <span
                        key={`blossom-${idx}`}
                        className={`ot-blossom-node-${uid} absolute drop-shadow-xs`}
                        style={{ top: node.top, left: node.left }}
                      >
                        <HeartBlossomSvg size={node.size} color={node.color} />
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* Interactive falling petal burst */}
                {bloomBurstCount > 0 ? (
                  <div
                    key={`burst-${bloomBurstCount}`}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
                  >
                    {BURST_PETALS.map((petal, idx) => (
                      <span
                        key={`burst-petal-${bloomBurstCount}-${idx}`}
                        className={`ot-petal-burst-${uid} absolute -top-3 block`}
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

                {/* 3 Glowing Branch Hotspots (hidden in Full Art mode) */}
                {!fullArt ? (
                  <>
                    {BRANCH_HOTSPOTS.map((spot) => {
                      const isSelected = activeHotspotId === spot.id;
                      const tagLabel = spot.tag[coreLang];
                      return (
                        <button
                          key={spot.id}
                          type="button"
                          aria-expanded={isSelected}
                          aria-label={`${tagLabel} — ${spot.thought[coreLang]}`}
                          onClick={() =>
                            setActiveHotspotId((prev) => (prev === spot.id ? null : spot.id))
                          }
                          style={{ top: spot.top, left: spot.left }}
                          className={`ot-hotspot-ring-${uid} absolute z-10 flex min-h-[44px] min-w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-300 active:scale-95 ${
                            isSelected
                              ? 'border-[#FDE68A] bg-[#9D174D] text-[#FFFDF9] ring-4 ring-[#FDE68A]/35'
                              : 'border-[#FDE68A]/75 bg-[#1B1218]/65 text-[#FDE68A] backdrop-blur-sm hover:bg-[#9D174D]/85 hover:text-white'
                          }`}
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.9]" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                          </svg>
                        </button>
                      );
                    })}

                    {/* Anchored Whisper Micro-Thought Card or Gentle Prompt */}
                    {activeHotspot ? (
                      <div
                        role="status"
                        className="absolute inset-x-3 bottom-3 z-20 rounded-2xl border border-[#FDE68A]/35 bg-[#170F16]/88 p-3 text-left text-[#FFFDF9] shadow-xl backdrop-blur-md animate-fade-in motion-reduce:animate-none"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#FDE68A]">
                              <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current stroke-2" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                              </svg>
                              {activeHotspot.tag[coreLang]}
                            </span>
                            <p className="mt-1 break-words font-royal-serif text-[13.5px] italic leading-relaxed text-[#FFFDF9]/95">
                              {activeHotspot.thought[coreLang]}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveHotspotId(null)}
                            aria-label={copy.closeWhisperLabel}
                            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-xs font-bold text-white/90 transition hover:bg-white/20"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex justify-center">
                        <span className="rounded-full border border-white/15 bg-[#170F16]/72 px-3 py-1 text-center text-[10.5px] font-medium tracking-wide text-[#FDE68A]/95 backdrop-blur-sm">
                          {copy.hotspotPrompt}
                        </span>
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              {/* Canvas Controls: Bloom Petals + Bloom Counter + Full Art Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F59E0B]/20 bg-[#FFFDF9]/96 px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-2">
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

                  {bloomBurstCount > 0 ? (
                    <span className="inline-flex min-h-[36px] items-center rounded-full border border-[#F59E0B]/40 bg-[#FFFBEB] px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-[#92400E]">
                      {copy.petalsCountLabel(bloomBurstCount)}
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  aria-pressed={fullArt}
                  onClick={() => setFullArt((prev) => !prev)}
                  className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition active:scale-95 ${
                    fullArt
                      ? 'border-[#9D174D] bg-[#2B1B2E] text-[#FFFDF9]'
                      : 'border-[#2B1B2E]/20 bg-white text-[#2B1B2E] hover:border-[#9D174D]/50 hover:bg-[#FDF2F8]'
                  }`}
                >
                  <span>{fullArt ? copy.exitFullArtLabel : copy.fullArtLabel}</span>
                </button>
              </div>
            </div>

            {/* Candy-Stripe Framed Love Letter */}
            <div
              className="rounded-[20px] p-2 shadow-sm"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(-45deg, #9D174D 0px, #9D174D 10px, #FFFDF9 10px, #FFFDF9 20px, #F43F5E 20px, #F43F5E 30px, #FFFDF9 30px, #FFFDF9 40px)',
              }}
            >
              <div className="rounded-[14px] border border-[#9D174D]/15 bg-[#FFFDF9] px-4 py-5 text-center sm:px-6">
                <span className="inline-flex items-center rounded-full border border-[#9D174D]/30 bg-[#FDF2F8] px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#9D174D]">
                  {copy.loveLetterBadge}
                </span>
                <WordByWordFadeLine
                  text={headlineText}
                  active={opened}
                  delayStepMs={60}
                  className="mt-3 break-words font-heading text-xl font-bold leading-snug text-[#2B1B2E] sm:text-2xl"
                />
                <p className="mx-auto mt-2.5 max-w-md break-words font-royal-serif text-[15px] leading-relaxed text-[#2B1B2E]/90">
                  {messageText}
                </p>
              </div>
            </div>
          </section>

          {/* ACT 3A — YOU & ME / FOREVER. Magazine Spread + Adaptive Photo Gallery */}
          <section
            ref={(el) => {
              sectionRefs.current['e-magazine'] = el;
            }}
            data-section-id="e-magazine"
            aria-label={copy.sections['e-magazine']}
            className="scroll-mt-20 space-y-4 rounded-[26px] border border-[#2B1B2E]/15 bg-[#FFFDF9] p-4 shadow-[0_14px_34px_-14px_rgba(43,27,46,0.16)] sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2B1B2E]/12 pb-2.5">
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#9D174D]">
                {copy.magazineMasthead}
              </span>
              <span className="truncate font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#2B1B2E]/65">
                {data.receiverName}
              </span>
            </div>

            {/* High-Contrast 2-Column Editorial Spread */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col justify-between rounded-[20px] bg-[#9D174D] p-5 text-[#FFFDF9] shadow-sm">
                <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#FDE68A]">
                  VOL. 01 · {monogram}
                </span>
                <div className="my-4">
                  <h2 className="font-heading text-3xl font-extrabold leading-none tracking-tight text-white">
                    {copy.magazineLeftTitle}
                  </h2>
                  <p className="mt-2 font-royal-serif text-xs italic leading-relaxed text-white/85">
                    {copy.magazineLeftSub}
                  </p>
                </div>
                <span className="h-px w-12 bg-[#F59E0B]/75" aria-hidden="true" />
              </div>

              <div className="flex flex-col justify-between rounded-[20px] bg-[#1B151A] p-5 text-[#FAF5EC] shadow-sm">
                <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#F59E0B]">
                  {copy.magazineRightSub}
                </span>
                <div className="my-4">
                  <h2 className="font-royal-serif text-3xl font-bold tracking-[0.06em] text-[#FAF5EC]">
                    {copy.magazineRightTitle}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-[#FAF5EC]/75">
                    {copy.magazineIssueNote}
                  </p>
                </div>
                <span className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-[#FAF5EC]/55">
                  {data.senderName ? `${copy.fromLabel} ${data.senderName}` : copy.volumeSubtitle}
                </span>
              </div>
            </div>

            {/* Count-Aware Adaptive Photo Gallery (0, 1, 2, 3, 4+ photos) */}
            <div className="pt-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#9D174D]">
                {copy.galleryHeading}
              </p>
              <OccasionAdaptiveGallery
                photos={data.photos}
                accentColor="#9D174D"
                captionPrefix={copy.galleryPrefix}
                emptyFallback={
                  <div className="mt-3 rounded-2xl border border-[#D97706]/30 bg-gradient-to-br from-[#FDF2F8] via-[#FFFDF9] to-[#FFFBEB] px-4 py-5 text-center">
                    <p className="font-royal-serif text-sm italic leading-relaxed text-[#2B1B2E]/85">
                      {copy.galleryEmptyQuote}
                    </p>
                    <p className="mt-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#92400E]">
                      {copy.galleryEmptyCaption}
                    </p>
                  </div>
                }
              />
            </div>
          </section>

          {/* ACT 3B — Interactive Horizontal Timeline (y -> x Story Rail) */}
          <section
            ref={(el) => {
              sectionRefs.current['story-rail'] = el;
            }}
            data-section-id="story-rail"
            aria-label={copy.sections['story-rail']}
            className="scroll-mt-20 space-y-3.5 rounded-[26px] border border-[#D97706]/30 bg-[#FFFDF9] p-4 shadow-[0_14px_34px_-14px_rgba(43,27,46,0.16)] sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#9D174D]">
                  {copy.timelineEyebrow}
                </span>
                <p className="mt-0.5 text-[11px] font-medium text-[#2B1B2E]/65">
                  {copy.railHint}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="mr-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#92400E]">
                  {copy.chaptersCountLabel(highlights.length)}
                </span>
                {highlights.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => focusMilestone(activeHighlightIdx - 1)}
                      disabled={activeHighlightIdx === 0}
                      aria-label={copy.railPrevLabel}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#2B1B2E]/15 bg-white text-sm font-bold text-[#2B1B2E] transition hover:border-[#9D174D] hover:text-[#9D174D] disabled:opacity-35"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => focusMilestone(activeHighlightIdx + 1)}
                      disabled={activeHighlightIdx >= highlights.length - 1}
                      aria-label={copy.railNextLabel}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#2B1B2E]/15 bg-white text-sm font-bold text-[#2B1B2E] transition hover:border-[#9D174D] hover:text-[#9D174D] disabled:opacity-35"
                    >
                      →
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {highlights.length > 0 ? (
              <>
                <div
                  ref={railRef}
                  className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none"
                >
                  {highlights.map((item, idx) => {
                    const isFocused = activeHighlightIdx === idx;
                    const { dateBadge, title } = splitMilestoneTitle(
                      pickLocalizedText(item.title, language),
                      idx,
                    );
                    const detailText = pickLocalizedText(item.detail, language);

                    return (
                      <button
                        key={`${pickLocalizedText(item.title, 'en', 'milestone')}-${idx}`}
                        ref={(el) => {
                          cardRefs.current[idx] = el;
                        }}
                        type="button"
                        aria-pressed={isFocused}
                        onClick={() => focusMilestone(idx)}
                        className={`relative flex min-h-[168px] w-[82%] max-w-[288px] shrink-0 snap-center flex-col justify-between rounded-[22px] border p-4 text-left transition-all duration-300 active:scale-[0.99] ${
                          isFocused
                            ? 'border-[#9D174D] bg-gradient-to-b from-[#FFFDF9] to-[#FDF2F8] shadow-[0_14px_28px_-12px_rgba(157,23,77,0.3)] ring-1 ring-[#9D174D]/20'
                            : 'border-[#D97706]/25 bg-[#FFFDF9] opacity-90 hover:border-[#9D174D]/45 hover:opacity-100'
                        }`}
                      >
                        {/* Gold thread progress rule */}
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center rounded-full border border-[#F59E0B]/45 bg-[#FFFBEB] px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#92400E]">
                              {dateBadge}
                            </span>
                            <span
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                                isFocused
                                  ? 'bg-[#9D174D] text-[#FFFDF9]'
                                  : 'bg-[#FDF2F8] text-[#9D174D]'
                              }`}
                            >
                              0{idx + 1}
                            </span>
                          </div>

                          <h3
                            className={`mt-2.5 break-words font-heading text-base font-bold leading-snug ${
                              isFocused ? 'text-[#9D174D]' : 'text-[#2B1B2E]'
                            }`}
                          >
                            {title}
                          </h3>
                        </div>

                        <p className="mt-2.5 break-words border-t border-[#D97706]/20 pt-2.5 text-xs leading-relaxed text-[#2B1B2E]/85">
                          {detailText}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {highlights.length > 1 ? (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                    {highlights.map((item, idx) => {
                      const isFocused = activeHighlightIdx === idx;
                      return (
                        <button
                          key={`dot-${idx}`}
                          type="button"
                          aria-label={pickLocalizedText(item.title, language)}
                          aria-pressed={isFocused}
                          onClick={() => focusMilestone(idx)}
                          className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border font-mono text-[10.5px] font-bold transition ${
                            isFocused
                              ? 'border-[#9D174D] bg-[#9D174D] text-[#FFFDF9] shadow-xs'
                              : 'border-[#D97706]/30 bg-[#FFFBEB]/60 text-[#92400E] hover:border-[#9D174D]/50'
                          }`}
                        >
                          0{idx + 1}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-2xl border border-[#D97706]/25 bg-[#FDF2F8]/60 p-4 text-center">
                <h3 className="font-heading text-base font-bold text-[#9D174D]">
                  {copy.railEmptyTitle}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#2B1B2E]/80">
                  {copy.railEmptyDetail}
                </p>
              </div>
            )}
          </section>

          {/* ACT 3C — Dark Glass Soundtrack Sanctuary */}
          <section
            ref={(el) => {
              sectionRefs.current.soundtrack = el;
            }}
            data-section-id="soundtrack"
            aria-label={copy.sections.soundtrack}
            className="scroll-mt-20 rounded-[28px] border border-[#9D174D]/25 bg-gradient-to-br from-[#19111B] via-[#261221] to-[#110C14] p-1.5 shadow-[0_18px_40px_-16px_rgba(27,21,26,0.65)]"
          >
            <CurvedTrackSanctuary
              tracks={soundtrackTracks}
              mood="romantic"
              accentColor="#F43F5E"
              dark
              heading={copy.soundtrackHeading}
            />
          </section>

          {/* ACT 3D — Hold-to-Seal Keepsake Vow Altar */}
          <section
            ref={(el) => {
              sectionRefs.current.keepsake = el;
            }}
            data-section-id="keepsake"
            aria-label={copy.sections.keepsake}
            className="scroll-mt-20"
          >
            <div className="rounded-[26px] border border-[#F59E0B]/45 bg-gradient-to-b from-[#2A1120] via-[#1C1019] to-[#130C12] p-1.5 text-[#FFFDF9] shadow-[0_18px_40px_-14px_rgba(27,16,25,0.75)]">
              <div className="relative flex flex-col items-center rounded-[20px] border border-[#FDE68A]/25 px-4 py-7 text-center sm:px-6">
                <span
                  aria-hidden="true"
                  className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#F59E0B]/70 bg-[#9D174D]/80 font-royal-serif text-xs font-bold tracking-wider text-[#FDE68A] shadow-xs"
                >
                  {monogram}
                </span>

                <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#FDE68A]/85">
                  {copy.editionPill}
                </span>

                <h2 className="mt-2 font-heading text-2xl font-bold text-white">
                  {copy.vowHeading}
                </h2>

                <p className="mt-2 max-w-xs font-royal-serif text-base italic leading-relaxed text-[#FDF2F8]/90">
                  {copy.vowQuote}
                </p>

                {data.senderName ? (
                  <p className="mt-3 font-royal-serif text-sm font-semibold text-white/90">
                    {copy.signaturePrefix}{' '}
                    <span className="text-[#FDE68A]">{data.senderName}</span>
                  </p>
                ) : null}

                <div className="my-5 flex w-24 items-center gap-2" aria-hidden="true">
                  <span className="h-px flex-1 bg-[#F59E0B]/45" />
                  <span className="h-1.5 w-1.5 rotate-45 bg-[#FDE68A]" />
                  <span className="h-px flex-1 bg-[#F59E0B]/45" />
                </div>

                <HoldToChargeRing
                  label={copy.holdToSealLabel}
                  chargingLabel={copy.sealingLabel}
                  completeLabel={copy.sealedCompleteLabel}
                  accentColor="#F59E0B"
                  durationMs={1400}
                  onComplete={() => setSealed(true)}
                />

                {sealed ? (
                  <div
                    role="status"
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#FDE68A]/55 bg-[#9D174D]/75 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#FDE68A] shadow-sm animate-pop-bounce"
                  >
                    <span>{copy.sealedStampNote}</span>
                  </div>
                ) : null}

                <p className="mt-5 text-[10.5px] tracking-wide text-white/60">
                  {copy.colophonNote}
                </p>
              </div>
            </div>
          </section>

          {/* Footer with Replay + Webzy Label */}
          <footer className="flex flex-col items-center justify-between gap-2.5 border-t border-[#D97706]/20 pt-3 text-center sm:flex-row">
            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#9D174D]/25 bg-[#FFFDF9] px-5 text-xs font-semibold text-[#9D174D] shadow-2xs transition hover:bg-white active:scale-95"
            >
              {getReplayLabel(language)}
            </button>
            <p className="text-[11px] font-medium text-[#2B1B2E]/65">
              {getWebzyFooterLabel(language)}
            </p>
          </footer>
        </div>
      )}
    </article>
  );
}
