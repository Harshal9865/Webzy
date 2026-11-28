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
import {
  playLanternPullChime,
  playPaperUnsealSfx,
} from './shared/OccasionCraftPrimitives';

type WrappedChapterId = 'orbit' | 'highlights' | 'trophies' | 'memories' | 'soundtrack' | 'pass';
type WishId = 'travel' | 'mornings' | 'creative' | 'health' | 'roadtrips' | 'family';
type TrophyId = 'core-memory' | 'unplanned-adventure' | 'strongest-moment';

interface WishDefinition {
  id: WishId;
  label: string;
  tagline: string;
}

interface TrophyDefinition {
  id: TrophyId;
  code: string;
  awardTitle: string;
  sealedHint: string;
  defaultCitation: (receiver: string, sender: string) => string;
  highlightCitation: (title: string) => string;
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
  daysShortBadge: string;
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
  trophyBadge: string;
  trophyTitle: string;
  trophySubtitle: string;
  trophyProgress: (revealed: number, total: number) => string;
  trophyTapUnveil: string;
  trophyUnveiledTag: string;
  trophyCompleteNote: string;
  trophies: readonly TrophyDefinition[];
  memoriesBadge: string;
  memoriesTitle: string;
  memoriesHint: string;
  memoriesPrefix: string;
  memoriesEmptyTitle: string;
  memoriesEmptyBody: string;
  soundtrackBadge: string;
  soundtrackHeading: string;
  tracks: readonly CurvedTrackItem[];
  wishBadge: string;
  wishTitle: string;
  wishSubtitle: string;
  wishCounter: (selected: number, target: number) => string;
  wishSelectHint: string;
  sealPassCta: string;
  sealedPassCta: string;
  sealedStampLabel: string;
  wishes: readonly WishDefinition[];
  passBadge: string;
  passTitle: string;
  passRouteLabel: string;
  passWishesLabel: string;
  passRecipientLabel: string;
  passSenderLabel: string;
  passSerialLabel: string;
  passGateLabel: string;
  copyShareCta: string;
  copyToast: string;
  whatsappCta: string;
  whatsappMessage: (receiver: string, sender: string, wishesText: string) => string;
}

const CHAPTER_ORDER: readonly WrappedChapterId[] = [
  'orbit',
  'highlights',
  'trophies',
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
      trophies: 'Trophies',
      memories: 'Memories',
      soundtrack: 'Soundtrack',
      pass: '2027 Pass',
    },
    orbitBadge: '2026 ORBIT SUMMARY',
    narrativeOpener: (receiver, sender) =>
      `Three hundred and sixty-five rotations later, ${receiver}, here is the light ${sender} kept for you.`,
    daysLabel: 'DAYS IN ORBIT',
    daysShortBadge: '365 DAYS',
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
    trophyBadge: 'YEAR-IN-REVIEW TROPHY SHELF',
    trophyTitle: 'Tap to Unveil 3 Superlatives',
    trophySubtitle: 'Tap each golden foil plaque to reveal our bespoke 2026 keepsake awards.',
    trophyProgress: (revealed, total) => `${revealed}/${total} unveiled`,
    trophyTapUnveil: 'Tap Golden Foil',
    trophyUnveiledTag: 'AWARDED',
    trophyCompleteNote: 'All 3 golden superlatives unveiled — a year worth framing forever.',
    trophies: [
      {
        id: 'core-memory',
        code: 'AWARD 01',
        awardTitle: 'Core Memory of the Year',
        sealedHint: 'Tap to reveal top memory award',
        defaultCitation: (receiver, sender) =>
          `Presented to ${receiver} & ${sender} for the single golden moment that defined all 12 months.`,
        highlightCitation: (title) => `Honoring "${title}" — the standout memory we still replay in full color.`,
      },
      {
        id: 'unplanned-adventure',
        code: 'AWARD 02',
        awardTitle: 'Best Unplanned Adventure',
        sealedHint: 'Tap to reveal spontaneous detour award',
        defaultCitation: (receiver, sender) =>
          `For turning spontaneous detours, late plans, and open roads into ${receiver} & ${sender}'s best stories.`,
        highlightCitation: (title) => `Spotlight on "${title}" — proof that the finest plans are never scripted.`,
      },
      {
        id: 'strongest-moment',
        code: 'AWARD 03',
        awardTitle: 'Strongest Moment Together',
        sealedHint: 'Tap to reveal resilience award',
        defaultCitation: (receiver, sender) =>
          `For showing up with steady warmth, patience, and quiet strength through every curve of the year.`,
        highlightCitation: (title) => `Celebrating "${title}" — where showing up for each other mattered most.`,
      },
    ],
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
    wishBadge: 'MANIFEST NEXT YEAR · SEAL 3 WISHES',
    wishTitle: 'Choose 3 Wishes for 2027',
    wishSubtitle: 'Pick 3 curated goals below to stamp onto your Next-Year Golden Boarding Pass.',
    wishCounter: (selected, target) => `${selected}/${target} wishes`,
    wishSelectHint: 'Select 3 wishes to seal your Golden Boarding Pass.',
    sealPassCta: 'Stamp & Seal 3 Wishes on Pass',
    sealedPassCta: '3 Wishes Sealed · Re-Stamp Pass',
    sealedStampLabel: 'SEALED · 2027',
    wishes: [
      { id: 'travel', label: 'More Travel', tagline: 'New stamps & window seats' },
      { id: 'mornings', label: 'Calm Mornings', tagline: 'Unhurried sunlit starts' },
      { id: 'creative', label: 'Big Creative Wins', tagline: 'Bold ideas brought to life' },
      { id: 'health', label: 'Health & Peace', tagline: 'Steady energy & calm minds' },
      { id: 'roadtrips', label: 'Unplanned Road Trips', tagline: 'Spontaneous highways & music' },
      { id: 'family', label: 'More Family Dinners', tagline: 'Long tables & warm laughter' },
    ],
    passBadge: 'NEXT-YEAR GOLDEN BOARDING PASS',
    passTitle: '2026 -> 2027 Keepsake Pass',
    passRouteLabel: 'DEPART 2026 -> ARRIVE 2027',
    passWishesLabel: 'SEALED 2027 WISHES',
    passRecipientLabel: 'PASSENGER',
    passSenderLabel: 'FROM',
    passSerialLabel: 'BOARDING ID',
    passGateLabel: 'GATE 27A',
    copyShareCta: 'Copy Wrapped & Next-Year Wishes for WhatsApp',
    copyToast: 'Wrapped recap & 3 Next-Year wishes copied for WhatsApp.',
    whatsappCta: 'Send Reply on WhatsApp',
    whatsappMessage: (receiver, sender, wishesText) =>
      `Loved our 2026 -> 2027 Year Wrapped, ${sender}! Sealed my 3 wishes for next year: ${wishesText}. Here is to an even brighter year ahead! — ${receiver}`,
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
      trophies: 'Trophies',
      memories: 'Memories',
      soundtrack: 'Soundtrack',
      pass: '2027 Pass',
    },
    orbitBadge: '2026 PRISM RECAP',
    narrativeOpener: (receiver, sender) =>
      `Poore 365 dinon ki yaadein samet kar, ${receiver}, ye khaas roshni ${sender} ne aapke liye rakhi hai.`,
    daysLabel: 'DAYS IN ORBIT',
    daysShortBadge: '365 DIN',
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
    trophyBadge: 'YEAR-IN-REVIEW TROPHY SHELF',
    trophyTitle: '3 Golden Superlatives Unveil Karo',
    trophySubtitle: 'Har golden foil card par tap karo aur 2026 ke special awards dekho.',
    trophyProgress: (revealed, total) => `${revealed}/${total} khule`,
    trophyTapUnveil: 'Tap Karke Unveil Karo',
    trophyUnveiledTag: 'AWARDED',
    trophyCompleteNote: 'Teeno golden awards khul gaye — 2026 sach mein yaadgaar raha.',
    trophies: [
      {
        id: 'core-memory',
        code: 'AWARD 01',
        awardTitle: 'Core Memory of the Year',
        sealedHint: 'Saal ki sabse pyari yaad dekhne ke liye tap karo',
        defaultCitation: (receiver, sender) =>
          `${receiver} aur ${sender} ke naam — us ek sunahre pal ke liye jisne poora saal bana diya.`,
        highlightCitation: (title) => `"${title}" ke naam — woh pal jo aaj bhi dil mein taaza hai.`,
      },
      {
        id: 'unplanned-adventure',
        code: 'AWARD 02',
        awardTitle: 'Best Unplanned Adventure',
        sealedHint: 'Sabse mast unplanned plan dekhne ke liye tap karo',
        defaultCitation: (receiver, sender) =>
          `Achanak bane plans, lambe raaste aur ${receiver} & ${sender} ki behtareen kahaniyon ke naam.`,
        highlightCitation: (title) => `"${title}" ke naam — sabse best yaadein bina planning ke hi banti hain.`,
      },
      {
        id: 'strongest-moment',
        code: 'AWARD 03',
        awardTitle: 'Strongest Moment Together',
        sealedHint: 'Saath nibhaane ka sabse khaas award kholo',
        defaultCitation: () =>
          `Har mushkil aur khushi mein bina kahe ek-doosre ka saath dene ki himmat ke naam.`,
        highlightCitation: (title) => `"${title}" ke naam — jab saath khade rehna sabse zyada maayne rakhta tha.`,
      },
    ],
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
    wishBadge: 'MANIFEST NEXT YEAR · 3 WISHES SEAL KARO',
    wishTitle: '2027 Ke Liye 3 Wishes Chuno',
    wishSubtitle: 'Apne Golden Boarding Pass par stamp karne ke liye 3 goals select karo.',
    wishCounter: (selected, target) => `${selected}/${target} wishes`,
    wishSelectHint: 'Golden Boarding Pass stamp karne ke liye 3 wishes chuno.',
    sealPassCta: '3 Wishes Boarding Pass Par Seal Karo',
    sealedPassCta: '3 Wishes Sealed · Phir Se Stamp Karo',
    sealedStampLabel: 'SEALED · 2027',
    wishes: [
      { id: 'travel', label: 'More Travel', tagline: 'Naye shehar aur window seats' },
      { id: 'mornings', label: 'Calm Mornings', tagline: 'Sukoon bhari dhoop aur chai' },
      { id: 'creative', label: 'Big Creative Wins', tagline: 'Naye ideas aur badi jeet' },
      { id: 'health', label: 'Health & Peace', tagline: 'Achhi sehat aur shaant mann' },
      { id: 'roadtrips', label: 'Unplanned Road Trips', tagline: 'Bina plan ke highways aur music' },
      { id: 'family', label: 'More Family Dinners', tagline: 'Apno ke saath garma-garam dinner' },
    ],
    passBadge: 'NEXT-YEAR GOLDEN BOARDING PASS',
    passTitle: '2026 -> 2027 Keepsake Pass',
    passRouteLabel: 'DEPART 2026 -> ARRIVE 2027',
    passWishesLabel: 'SEALED 2027 WISHES',
    passRecipientLabel: 'PASSENGER',
    passSenderLabel: 'FROM',
    passSerialLabel: 'BOARDING ID',
    passGateLabel: 'GATE 27A',
    copyShareCta: 'WhatsApp Ke Liye Wrapped & Wishes Copy Karo',
    copyToast: 'Wrapped recap aur 3 Next-Year wishes WhatsApp ke liye copy ho gayi.',
    whatsappCta: 'WhatsApp par reply bhejo',
    whatsappMessage: (receiver, sender, wishesText) =>
      `2026 -> 2027 Year Wrapped bahut pasand aaya ${sender}! Maine agle saal ke liye apni 3 wishes seal kar di hain: ${wishesText}. Naya saal aur bhi kamaal hoga! — ${receiver}`,
  },
  hi: {
    editionPrefix: 'संस्करण 2026 -> 2027',
    editionForLabel: 'प्रिय',
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
      trophies: 'सम्मान',
      memories: 'यादें',
      soundtrack: 'संगीत',
      pass: '2027 पास',
    },
    orbitBadge: '2026 प्रिज्म सारांश',
    narrativeOpener: (receiver, sender) =>
      `पूरे 365 दिनों की यादों को समेटकर, ${receiver}, यह उजाला ${sender} ने आपके लिए सहेजा है।`,
    daysLabel: 'यादगार दिन',
    daysShortBadge: '365 दिन',
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
    trophyBadge: 'वर्ष-समीक्षा सम्मान पट्टिका',
    trophyTitle: '3 सुनहरे सम्मान अनावरित करें',
    trophySubtitle: 'हर सुनहरे फ़ॉइल कार्ड पर टैप करें और 2026 के ख़ास सम्मान देखें।',
    trophyProgress: (revealed, total) => `${revealed}/${total} अनावरित`,
    trophyTapUnveil: 'खोलने के लिए टैप करें',
    trophyUnveiledTag: 'सम्मानित',
    trophyCompleteNote: 'तीनों सुनहरे सम्मान खुल गए — यह वर्ष सचमुच अविस्मरणीय रहा।',
    trophies: [
      {
        id: 'core-memory',
        code: 'सम्मान 01',
        awardTitle: 'वर्ष की सबसे अनमोल याद',
        sealedHint: 'साल की सबसे प्यारी याद देखने के लिए टैप करें',
        defaultCitation: (receiver, sender) =>
          `${receiver} और ${sender} के नाम — उस एक सुनहरे पल के लिए जिसने पूरे वर्ष को रोशन किया।`,
        highlightCitation: (title) => `"${title}" को समर्पित — वह अनमोल स्मृति जो आज भी मन को मुस्कुराती है।`,
      },
      {
        id: 'unplanned-adventure',
        code: 'सम्मान 02',
        awardTitle: 'सर्वश्रेष्ठ अनियोजित सफ़र',
        sealedHint: 'सबसे यादगार अचानक सफ़र देखने के लिए टैप करें',
        defaultCitation: (receiver, sender) =>
          `अचानक बने सफ़र और ${receiver} व ${sender} की सबसे खूबसूरत कहानियों के नाम।`,
        highlightCitation: (title) => `"${title}" के नाम — क्योंकि सबसे सुंदर यादें बिना योजना के बनती हैं।`,
      },
      {
        id: 'strongest-moment',
        code: 'सम्मान 03',
        awardTitle: 'साथ निभाने का सबसे मज़बूत पल',
        sealedHint: 'धैर्य और साथ का ख़ास सम्मान खोलें',
        defaultCitation: () =>
          `हर मोड़ पर स्नेह, धैर्य और अटूट विश्वास के साथ खड़े रहने के लिए।`,
        highlightCitation: (title) => `"${title}" के नाम — जहाँ एक-दूसरे का साथ सबसे बड़ा संबल बना।`,
      },
    ],
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
    wishBadge: 'आने वाले वर्ष के 3 संकल्प सील करें',
    wishTitle: '2027 के लिए 3 शुभकामनाएँ चुनें',
    wishSubtitle: 'अपने सुनहरे बोर्डिंग पास पर अंकित करने के लिए नीचे से 3 लक्ष्य चुनें।',
    wishCounter: (selected, target) => `${selected}/${target} चयनित`,
    wishSelectHint: 'सुनहरे बोर्डिंग पास पर मुहर लगाने के लिए 3 संकल्प चुनें।',
    sealPassCta: '3 संकल्प बोर्डिंग पास पर सील करें',
    sealedPassCta: '3 संकल्प सील हुए · फिर से मुहर लगाएँ',
    sealedStampLabel: 'सील · 2027',
    wishes: [
      { id: 'travel', label: 'अधिक यात्राएँ', tagline: 'नए शहर और खिड़की वाली सीट' },
      { id: 'mornings', label: 'शांत सुबहें', tagline: 'सुकून भरी गुनगुनी सुबह' },
      { id: 'creative', label: 'बड़ी रचनात्मक जीत', tagline: 'नए सपने और बड़ी सफलता' },
      { id: 'health', label: 'स्वास्थ्य और शांति', tagline: 'अच्छी सेहत और शांत मन' },
      { id: 'roadtrips', label: 'अनियोजित रोड ट्रिप', tagline: 'खुली सड़कें और पसंदीदा गीत' },
      { id: 'family', label: 'परिवार संग रात्रिभोज', tagline: 'अपनों के साथ स्नेह भरी शामें' },
    ],
    passBadge: 'अगले वर्ष का सुनहरा बोर्डिंग पास',
    passTitle: '2026 -> 2027 स्मृति पास',
    passRouteLabel: 'प्रस्थान 2026 -> आगमन 2027',
    passWishesLabel: 'सील किए गए 2027 संकल्प',
    passRecipientLabel: 'यात्री',
    passSenderLabel: 'प्रेषक',
    passSerialLabel: 'पास कोड',
    passGateLabel: 'गेट 27A',
    copyShareCta: 'व्हाट्सऐप के लिए रैप्ड और 3 संकल्प कॉपी करें',
    copyToast: 'रैप्ड सारांश और 3 संकल्प व्हाट्सऐप के लिए कॉपी हो गए।',
    whatsappCta: 'व्हाट्सऐप पर जवाब भेजें',
    whatsappMessage: (receiver, sender, wishesText) =>
      `${sender}, हमारा 2026 -> 2027 ईयर रैप्ड बेहद सुंदर लगा! मैंने अगले वर्ष के लिए 3 संकल्प सील किए हैं: ${wishesText}। आने वाला वर्ष और भी उजला हो! — ${receiver}`,
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

function TrophyIconSvg({ id, revealed }: { id: TrophyId; revealed: boolean }) {
  const stroke = revealed ? '#FCD34D' : '#F59E0B';
  if (id === 'core-memory') {
    return (
      <svg viewBox="0 0 28 28" className="h-7 w-7" fill="none" stroke={stroke} strokeWidth={1.7} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5h12v6a6 6 0 01-12 0V5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2.5 2.5 0 002.5 5H8M20 7h3a2.5 2.5 0 01-2.5 5H20" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 17v4M10 22h8" />
      </svg>
    );
  }
  if (id === 'unplanned-adventure') {
    return (
      <svg viewBox="0 0 28 28" className="h-7 w-7" fill="none" stroke={stroke} strokeWidth={1.7} aria-hidden="true">
        <circle cx="14" cy="14" r="9.5" />
        <polygon points="14,7.5 16.5,14 14,20.5 11.5,14" fill={revealed ? 'rgba(245, 158, 11, 0.35)' : 'none'} />
        <circle cx="14" cy="14" r="1.4" fill={stroke} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 28 28" className="h-7 w-7" fill="none" stroke={stroke} strokeWidth={1.7} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 4l7.5 3.2v5.8c0 5-3.2 8.7-7.5 10.5C9.7 21.7 6.5 18 6.5 13V7.2L14 4z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.8 14.2l2.1 2.1 4.4-4.6" />
    </svg>
  );
}

function WishIconSvg({ id, active }: { id: WishId; active: boolean }) {
  const stroke = active ? '#F59E0B' : '#C4B5FD';
  switch (id) {
    case 'travel':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth={1.7} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l18-7-4 15-4.5-4.5L9 18v-4.5L17 7" />
        </svg>
      );
    case 'mornings':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth={1.7} aria-hidden="true">
          <circle cx="12" cy="13" r="4" />
          <path strokeLinecap="round" d="M4 18h16M12 4v2.5M6.3 7.3l1.8 1.8M17.7 7.3l-1.8 1.8" />
        </svg>
      );
    case 'creative':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth={1.7} aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3l2.6 5.4 5.9.9-4.2 4.1 1 5.8L12 16.4 6.7 19.2l1-5.8-4.2-4.1 5.9-.9L12 3z"
          />
        </svg>
      );
    case 'health':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth={1.7} aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 20s-7-4.5-8.5-8.5C2.3 8.2 4.7 5 8 5c1.9 0 3.3 1.1 4 2.4C12.7 6.1 14.1 5 16 5c3.3 0 5.7 3.2 4.5 6.5C19 15.5 12 20 12 20z"
          />
        </svg>
      );
    case 'roadtrips':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth={1.7} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 20L10 4M18 20L14 4M12 7v2m0 4v2m0 4v1" />
        </svg>
      );
    case 'family':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth={1.7} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 11l8-6 8 6v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 20v-6h5v6" />
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
  const [horizonFailed, setHorizonFailed] = useState(false);
  const [revealedTrophies, setRevealedTrophies] = useState<TrophyId[]>([]);
  const [selectedWishes, setSelectedWishes] = useState<WishId[]>([
    'travel',
    'mornings',
    'creative',
  ]);
  const [passStamped, setPassStamped] = useState(false);
  const [copyToastVisible, setCopyToastVisible] = useState(false);

  const onOpenedRef = useRef(onOpened);
  onOpenedRef.current = onOpened;
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRefs = useRef<Record<WrappedChapterId, HTMLElement | null>>({
    orbit: null,
    highlights: null,
    trophies: null,
    memories: null,
    soundtrack: null,
    pass: null,
  });

  const coreLang = toCoreLanguageCode(language);
  const isDevanagari = coreLang === 'hi';
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

  const selectedWishObjects = useMemo(
    () =>
      selectedWishes
        .map((id) => copy.wishes.find((item) => item.id === id))
        .filter((item): item is WishDefinition => Boolean(item)),
    [copy.wishes, selectedWishes],
  );

  const soundtrackTracks = useMemo<readonly CurvedTrackItem[]>(() => {
    const manifestTrackLabel = manifest.music?.[0]?.label?.trim();
    if (!manifestTrackLabel) return copy.tracks;
    return copy.tracks.map((track, idx) =>
      idx === 0 ? { ...track, title: manifestTrackLabel } : track,
    );
  }, [copy.tracks, manifest.music]);

  const serialCode = `PRISM-${String(202700 + (nameSeed % 900)).slice(-4)}`;

  const handleToggleTrophy = useCallback(
    (trophyId: TrophyId, idx: number) => {
      const alreadyRevealed = revealedTrophies.includes(trophyId);
      if (alreadyRevealed) {
        playPaperUnsealSfx(idx);
        setRevealedTrophies((prev) => prev.filter((item) => item !== trophyId));
      } else {
        const nextLength = revealedTrophies.length + 1;
        if (nextLength === copy.trophies.length) {
          playLanternPullChime();
        } else {
          playPaperUnsealSfx(idx + 1);
        }
        setRevealedTrophies((prev) => (prev.includes(trophyId) ? prev : [...prev, trophyId]));
      }
    },
    [copy.trophies.length, revealedTrophies],
  );

  const handleToggleWish = useCallback((wishId: WishId, idx: number) => {
    playPaperUnsealSfx(idx);
    setSelectedWishes((prev) => {
      if (prev.includes(wishId)) {
        return prev.filter((item) => item !== wishId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), wishId];
      }
      return [...prev, wishId];
    });
    setPassStamped(false);
  }, []);

  const handleStampPass = useCallback(() => {
    if (selectedWishes.length < 3) return;
    playLanternPullChime();
    setPassStamped(true);
  }, [selectedWishes.length]);

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

  const formattedWishesSummary = useMemo(
    () => selectedWishObjects.map((wish) => wish.label).join(' / '),
    [selectedWishObjects],
  );

  async function handleCopyKeepsakePass() {
    const trophyLine =
      revealedTrophies.length > 0
        ? `${copy.trophyTitle}: ${copy.trophies
            .filter((t) => revealedTrophies.includes(t.id))
            .map((t) => t.awardTitle)
            .join(' · ')}`
        : '';

    const shareSummary = [
      `${copy.editionPrefix} // ${data.receiverName}`,
      `${copy.passWishesLabel}: ${formattedWishesSummary || copy.wishes[0].label}`,
      trophyLine,
      `${copy.passSenderLabel}: ${data.senderName}`,
      `${copy.passSerialLabel}: ${serialCode}`,
      copy.whatsappMessage(
        data.receiverName,
        data.senderName,
        formattedWishesSummary || copy.wishes[0].label,
      ),
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

    playPaperUnsealSfx(2);
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

            <div
              className={`inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-full border border-[#F59E0B]/45 bg-[#F59E0B]/10 px-3 py-1 font-mono text-[10px] font-bold text-[#FCD34D] ${
                isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.14em]'
              }`}
            >
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
            <span
              className={`font-mono text-[10px] font-bold text-[#C4B5FD] ${
                isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.18em]'
              }`}
            >
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
                <span
                  className={`font-mono text-[9px] font-bold text-[#F59E0B] ${
                    isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.16em]'
                  }`}
                >
                  {copy.daysLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Full-Bleed Twilight Observatory & Sky Lanterns Art Plate */}
          <div className="overflow-hidden rounded-2xl border border-[#F59E0B]/40 bg-[#0B0718]">
            <div
              className="relative aspect-[16/10] w-full overflow-hidden"
              style={{
                background:
                  'linear-gradient(145deg, #1E1042 0%, #3B1E6D 48%, #92400E 100%)',
              }}
            >
              {!horizonFailed ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src="/templates/occasions/our-year/luminous-horizon-art.jpg"
                  alt="Twilight observatory terrace with floating golden sky lanterns under violet and gold clouds"
                  onError={() => setHorizonFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : null}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0718]/90 via-[#0B0718]/15 to-transparent"
              />
              <div className="absolute inset-x-3.5 bottom-3 flex items-end justify-between gap-2 text-left">
                <div className="min-w-0">
                  <p
                    className={`font-mono text-[9px] font-bold text-[#F59E0B] ${
                      isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.18em]'
                    }`}
                  >
                    {copy.editionPrefix}
                  </p>
                  <p className="truncate font-heading text-sm font-bold text-[#F8F7FC]">
                    {data.receiverName} &amp; {data.senderName}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-[#F59E0B]/50 bg-[#0B0718]/80 px-2.5 py-0.5 font-mono text-[9.5px] font-bold text-[#F59E0B]">
                  {copy.daysShortBadge}
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
                <span
                  className={`font-mono text-[9.5px] font-bold text-[#F59E0B] ${
                    isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.18em]'
                  }`}
                >
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
              <span
                className={`font-mono text-[10px] font-bold text-[#C4B5FD] ${
                  isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.18em]'
                }`}
              >
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

        {/* SECTION 3: Year-in-Review Trophy Shelf (3 Tap-to-Reveal Superlatives) */}
        <section
          ref={(el) => {
            sectionRefs.current.trophies = el;
          }}
          data-chapter="trophies"
          className="scroll-mt-32 space-y-3.5 rounded-[24px] border border-[#F59E0B]/35 bg-white/[0.04] p-4 backdrop-blur-md shadow-[0_20px_50px_-24px_rgba(245,158,11,0.35)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span
                className={`font-mono text-[10px] font-bold text-[#F59E0B] ${
                  isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.18em]'
                }`}
              >
                {copy.trophyBadge}
              </span>
              <h2 className="mt-0.5 font-heading text-lg font-extrabold text-[#F8F7FC]">
                {copy.trophyTitle}
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-[#F8F7FC]/75">
                {copy.trophySubtitle}
              </p>
            </div>
            <span
              role="status"
              className="shrink-0 rounded-full border border-[#F59E0B]/50 bg-[#F59E0B]/15 px-2.5 py-1 font-mono text-[10px] font-bold text-[#FCD34D]"
            >
              {copy.trophyProgress(revealedTrophies.length, copy.trophies.length)}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {copy.trophies.map((trophy, idx) => {
              const isRevealed = revealedTrophies.includes(trophy.id);
              const customHighlight = highlightsList[idx];
              const customTitle = customHighlight
                ? pickLocalizedText(customHighlight.title, language).trim()
                : '';
              const citationText = customTitle
                ? trophy.highlightCitation(customTitle)
                : trophy.defaultCitation(data.receiverName, data.senderName);

              return (
                <button
                  key={trophy.id}
                  type="button"
                  onClick={() => handleToggleTrophy(trophy.id, idx)}
                  aria-pressed={isRevealed}
                  className={`group relative flex min-h-[168px] flex-col justify-between overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-300 active:scale-[0.98] ${
                    isRevealed
                      ? 'border-[#F59E0B] bg-gradient-to-b from-[#2A1B47] via-[#120B26] to-[#1E1338] shadow-[0_14px_30px_-14px_rgba(245,158,11,0.65)]'
                      : 'border-[#F59E0B]/45 bg-gradient-to-br from-[#2B1F0A] via-[#140D26] to-[#261742] hover:border-[#FCD34D]'
                  }`}
                >
                  {/* Subtle golden foil diagonal sheen */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-x-6 -top-8 h-16 rotate-[-10deg] opacity-30 blur-lg"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, #FCD34D, #A78BFA, transparent)',
                    }}
                  />

                  <div className="relative z-10 flex w-full items-center justify-between gap-2">
                    <span
                      className={`font-mono text-[9px] font-bold text-[#FCD34D] ${
                        isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.16em]'
                      }`}
                    >
                      {trophy.code}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[8.5px] font-bold ${
                        isRevealed
                          ? 'border border-[#F59E0B]/55 bg-[#F59E0B]/20 text-[#FCD34D]'
                          : 'border border-white/15 bg-white/10 text-[#DDD6FE]'
                      }`}
                    >
                      {isRevealed ? copy.trophyUnveiledTag : copy.trophyTapUnveil}
                    </span>
                  </div>

                  {isRevealed ? (
                    <div className="relative z-10 my-auto space-y-1.5 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#F59E0B]/45 bg-[#F59E0B]/15">
                          <TrophyIconSvg id={trophy.id} revealed />
                        </div>
                        <h3
                          className={`font-heading text-sm font-extrabold text-[#FCD34D] ${
                            isDevanagari ? 'leading-snug' : 'leading-tight'
                          }`}
                        >
                          {trophy.awardTitle}
                        </h3>
                      </div>
                      <p className="text-xs leading-relaxed text-[#F8F7FC]/90">
                        {citationText}
                      </p>
                    </div>
                  ) : (
                    <div className="relative z-10 my-auto flex flex-col items-center py-3 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F59E0B]/55 bg-[#0B0718]/75 shadow-inner transition-transform duration-300 group-hover:scale-105">
                        <TrophyIconSvg id={trophy.id} revealed={false} />
                      </div>
                      <p className="mt-2.5 text-xs font-bold text-[#F8F7FC]">
                        {trophy.awardTitle}
                      </p>
                      <p className="mt-0.5 text-[10.5px] leading-snug text-[#DDD6FE]/75">
                        {trophy.sealedHint}
                      </p>
                    </div>
                  )}

                  {/* Shelf accent bar */}
                  <div
                    aria-hidden="true"
                    className={`relative z-10 h-1 w-full rounded-full ${
                      isRevealed
                        ? 'bg-gradient-to-r from-[#A78BFA] via-[#F59E0B] to-[#FCD34D]'
                        : 'bg-white/15'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {revealedTrophies.length === copy.trophies.length ? (
            <p
              role="status"
              className="rounded-xl border border-[#F59E0B]/45 bg-[#F59E0B]/15 px-3 py-2 text-center text-xs font-semibold text-[#FCD34D]"
            >
              {copy.trophyCompleteNote}
            </p>
          ) : null}
        </section>

        {/* SECTION 4: Adaptive Memories */}
        <section
          ref={(el) => {
            sectionRefs.current.memories = el;
          }}
          data-chapter="memories"
          className="scroll-mt-32 space-y-2.5 rounded-[24px] border border-[#A78BFA]/30 bg-white/[0.04] p-4 backdrop-blur-md shadow-[0_20px_50px_-24px_rgba(139,92,246,0.55)]"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <span
                className={`font-mono text-[10px] font-bold text-[#C4B5FD] ${
                  isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.18em]'
                }`}
              >
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

        {/* SECTION 5: Year Soundtrack Sanctuary */}
        <section
          ref={(el) => {
            sectionRefs.current.soundtrack = el;
          }}
          data-chapter="soundtrack"
          className="scroll-mt-32 space-y-2.5"
        >
          <div className="px-1">
            <span
              className={`font-mono text-[10px] font-bold text-[#C4B5FD] ${
                isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.18em]'
              }`}
            >
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

        {/* SECTION 6: Manifest Next Year (Seal 3 Wishes) & Next-Year Golden Boarding Pass */}
        <section
          ref={(el) => {
            sectionRefs.current.pass = el;
          }}
          data-chapter="pass"
          className="scroll-mt-32 space-y-4 rounded-[24px] border border-[#A78BFA]/30 bg-white/[0.04] p-4 backdrop-blur-md shadow-[0_20px_50px_-24px_rgba(139,92,246,0.55)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span
                className={`font-mono text-[10px] font-bold text-[#F59E0B] ${
                  isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.18em]'
                }`}
              >
                {copy.wishBadge}
              </span>
              <h2 className="mt-0.5 font-heading text-lg font-extrabold text-[#F8F7FC]">
                {copy.wishTitle}
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-[#F8F7FC]/75">
                {copy.wishSubtitle}
              </p>
            </div>
            <span
              role="status"
              className="shrink-0 rounded-full border border-[#F59E0B]/45 bg-[#F59E0B]/15 px-2.5 py-1 font-mono text-[10px] font-bold text-[#FCD34D]"
            >
              {copy.wishCounter(selectedWishes.length, 3)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {copy.wishes.map((wish, idx) => {
              const pickOrder = selectedWishes.indexOf(wish.id);
              const isSelected = pickOrder !== -1;
              return (
                <button
                  key={wish.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleToggleWish(wish.id, idx)}
                  className={`flex min-h-[88px] min-w-0 flex-col items-start justify-between rounded-2xl border p-3 text-left transition-all duration-200 active:scale-[0.98] ${
                    isSelected
                      ? 'border-[#F59E0B] bg-[#A78BFA]/20 shadow-[0_10px_24px_-10px_rgba(245,158,11,0.6)]'
                      : 'border-white/15 bg-[#0B0718]/75 hover:border-[#A78BFA]/55 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <WishIconSvg id={wish.id} active={isSelected} />
                    {isSelected ? (
                      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#F59E0B] px-1.5 font-mono text-[9.5px] font-black text-[#070512]">
                        0{pickOrder + 1}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 w-full min-w-0">
                    <p className="break-words text-xs font-bold text-[#F8F7FC]">
                      {wish.label}
                    </p>
                    <p className="mt-0.5 break-words text-[10.5px] leading-tight text-[#F8F7FC]/70">
                      {wish.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleStampPass}
            disabled={selectedWishes.length < 3}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[#F59E0B]/65 bg-[#F59E0B]/20 px-4 text-xs font-bold text-[#FCD34D] transition hover:bg-[#F59E0B]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" aria-hidden="true" />
            <span>
              {selectedWishes.length < 3
                ? copy.wishSelectHint
                : passStamped
                  ? copy.sealedPassCta
                  : copy.sealPassCta}
            </span>
          </button>

          {/* Collectible Next-Year Golden Boarding Pass / Keepsake */}
          <div
            className="relative overflow-hidden rounded-[22px] border border-[#F59E0B]/70 p-4 shadow-[0_24px_54px_-18px_rgba(245,158,11,0.45)] sm:p-5"
            style={{
              background:
                'linear-gradient(145deg, #241840 0%, #0A0718 46%, #2C1B12 100%)',
            }}
          >
            {/* Boarding Pass Side Perforation Notches */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-[#F59E0B]/45 bg-[#070512]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-[#F59E0B]/45 bg-[#070512]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#F59E0B]/20 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-14 -left-14 h-40 w-40 rounded-full bg-[#A78BFA]/25 blur-2xl"
            />

            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span
                    className={`inline-block rounded-full border border-[#F59E0B]/55 bg-[#F59E0B]/15 px-2.5 py-0.5 font-mono text-[9.5px] font-bold text-[#FCD34D] ${
                      isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.16em]'
                    }`}
                  >
                    {copy.passBadge}
                  </span>
                  <h3 className="mt-2 break-words font-heading text-xl font-black tracking-tight text-[#F8F7FC]">
                    {copy.passTitle}
                  </h3>
                  <p
                    className={`mt-0.5 font-mono text-[9.5px] font-bold text-[#C4B5FD] ${
                      isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.14em]'
                    }`}
                  >
                    {copy.passRouteLabel}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#F59E0B]/50 bg-[#0B0718]/80">
                    <PrismEmblemIcon className="h-6 w-6" />
                  </div>
                  {passStamped ? (
                    <span className="-rotate-6 rounded border border-[#FCD34D] bg-[#F59E0B]/25 px-2 py-0.5 font-mono text-[8.5px] font-black text-[#FCD34D] shadow-xs">
                      {copy.sealedStampLabel}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Sealed 2027 Wishes List */}
              <div className="rounded-2xl border border-[#F59E0B]/35 bg-white/[0.06] p-3.5">
                <p
                  className={`font-mono text-[9.5px] font-bold text-[#FCD34D] ${
                    isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.15em]'
                  }`}
                >
                  {copy.passWishesLabel}
                </p>

                {selectedWishObjects.length > 0 ? (
                  <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                    {selectedWishObjects.map((wish, idx) => (
                      <div
                        key={wish.id}
                        className="flex items-center gap-2 rounded-xl border border-[#F59E0B]/35 bg-[#0B0718]/75 px-2.5 py-2"
                      >
                        <span className="font-mono text-[9.5px] font-black text-[#F59E0B]">
                          0{idx + 1}
                        </span>
                        <span className="min-w-0 truncate text-xs font-bold text-[#F8F7FC]">
                          {wish.label}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-[#F8F7FC]/70">{copy.wishSelectHint}</p>
                )}
              </div>

              {/* Passenger & From Grid */}
              <div className="grid grid-cols-2 gap-2.5 border-t border-white/10 pt-3">
                <div className="min-w-0">
                  <p
                    className={`font-mono text-[9.5px] font-bold text-[#F8F7FC]/55 ${
                      isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.14em]'
                    }`}
                  >
                    {copy.passRecipientLabel}
                  </p>
                  <p className="mt-0.5 break-words text-sm font-bold text-[#F8F7FC]">
                    {data.receiverName}
                  </p>
                </div>
                <div className="min-w-0 text-right">
                  <p
                    className={`font-mono text-[9.5px] font-bold text-[#F8F7FC]/55 ${
                      isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.14em]'
                    }`}
                  >
                    {copy.passSenderLabel}
                  </p>
                  <p className="mt-0.5 break-words text-sm font-bold text-[#F59E0B]">
                    {data.senderName}
                  </p>
                </div>
              </div>

              {/* Perforated Tear Line + Serial + Barcode */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-[#F59E0B]/35 pt-3 font-mono text-[10px] tracking-[0.12em] text-[#F8F7FC]/75">
                <div className="flex flex-wrap items-center gap-2">
                  <span>
                    {copy.passSerialLabel}: {serialCode}
                  </span>
                  <span className="text-[#F59E0B]">·</span>
                  <span>{copy.passGateLabel}</span>
                </div>
                {/* Crisp metallic gold barcode SVG */}
                <svg viewBox="0 0 48 18" className="h-4 w-12 shrink-0" shapeRendering="crispEdges" aria-hidden="true">
                  <rect x="0" y="1" width="2" height="16" fill="#FCD34D" />
                  <rect x="4" y="1" width="1" height="16" fill="#FCD34D" />
                  <rect x="7" y="1" width="3" height="16" fill="#F59E0B" />
                  <rect x="12" y="1" width="1" height="16" fill="#FCD34D" />
                  <rect x="15" y="1" width="2" height="16" fill="#F59E0B" />
                  <rect x="19" y="1" width="3" height="16" fill="#FCD34D" />
                  <rect x="24" y="1" width="1" height="16" fill="#F59E0B" />
                  <rect x="27" y="1" width="2" height="16" fill="#FCD34D" />
                  <rect x="31" y="1" width="3" height="16" fill="#F59E0B" />
                  <rect x="36" y="1" width="1" height="16" fill="#FCD34D" />
                  <rect x="39" y="1" width="2" height="16" fill="#F59E0B" />
                  <rect x="44" y="1" width="3" height="16" fill="#FCD34D" />
                </svg>
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
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M7 3.5A1.5 1.5 0 018.5 2h6A1.5 1.5 0 0116 3.5v9a1.5 1.5 0 01-1.5 1.5h-6A1.5 1.5 0 017 12.5v-9z" />
                <path d="M4 6.5A1.5 1.5 0 015.5 5H6v7.5A2.5 2.5 0 008.5 15H13v.5a1.5 1.5 0 01-1.5 1.5h-6A1.5 1.5 0 014 15.5v-9z" />
              </svg>
              <span className="truncate">{copy.copyShareCta}</span>
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
                    copy.whatsappMessage(
                      data.receiverName,
                      data.senderName,
                      formattedWishesSummary || copy.wishes[0].label,
                    ),
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
