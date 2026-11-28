'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { type CoreLanguageCode, pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  type OccasionSiteProps,
  OccasionCassettePlayer,
  getReplayLabel,
  getWebzyFooterLabel,
} from './shared/OccasionPrimitives';
import {
  playLanternPullChime,
  playPaperUnsealSfx,
} from './shared/OccasionCraftPrimitives';

const DEVANAGARI_RE = /[\u0900-\u097F]/;

function hasDevanagari(text: string): boolean {
  return DEVANAGARI_RE.test(text);
}

type StageId = 'cover' | 'keepsakes' | 'proposal' | 'accepted';
type KeepsakeId = 'scrapbook' | 'letter' | 'bouquet' | 'vinyl';
type DreamDateId = 'coffee' | 'gelato' | 'stargaze' | 'bookstore';

interface PolaroidSample {
  src: string;
  caption: Record<CoreLanguageCode, string>;
}

const SAMPLE_POLAROIDS: readonly PolaroidSample[] = [
  {
    src: '/templates/cafe/maison-rouge.jpg',
    caption: {
      en: 'crimson blooms',
      hinglish: 'laal gulaab',
      hi: 'लाल गुलाब',
    },
  },
  {
    src: '/templates/occasions/upgrades/paris-moonlit-balcony.jpg',
    caption: {
      en: 'quiet evening',
      hinglish: 'shaam ka sukoon',
      hi: 'सुकून भरी शाम',
    },
  },
  {
    src: '/templates/cafe/rose-cottage.jpg',
    caption: {
      en: 'our little world',
      hinglish: 'hamari duniya',
      hi: 'हमारी दुनिया',
    },
  },
];

interface ReasonDefault {
  title: Record<CoreLanguageCode, string>;
  detail: Record<CoreLanguageCode, string>;
}

const BOUQUET_REASONS_DEFAULT: readonly ReasonDefault[] = [
  {
    title: {
      en: 'Your Laugh',
      hinglish: 'Tumhari Hansi',
      hi: 'तुम्हारी मुस्कान',
    },
    detail: {
      en: 'Even the busiest day turns calm the second I hear you laugh.',
      hinglish: 'Sabse thake din mein bhi tumhari ek hansi sab shaant kar deti hai.',
      hi: 'सबसे थके हुए दिन में भी तुम्हारी एक मुस्कान सब सुकून से भर देती है।',
    },
  },
  {
    title: {
      en: 'Effortless Peace',
      hinglish: 'Be-Wajah Sukoon',
      hi: 'सुकून भरा साथ',
    },
    detail: {
      en: 'Talking for hours feels easy, and quiet silences feel just as warm.',
      hinglish: 'Ghanton baatein bhi aasaan hain, aur tumhare paas chup rehna bhi pyara lagta hai.',
      hi: 'तुम्हारे साथ घंटों बातें करना भी आसान है और खामोशी भी उतनी ही मीठी।',
    },
  },
  {
    title: {
      en: 'Little Rituals',
      hinglish: 'Chhoti Aadatein',
      hi: 'छोटी-छोटी यादें',
    },
    detail: {
      en: 'Every coffee stop, rain shower, or walk feels like a story worth saving.',
      hinglish: 'Chai ka cup ho ya baarish wali shaam, tumhare saath har pal yaadgaar hai.',
      hi: 'चाय की शाम हो या बारिश की बूँदें, तुम्हारे साथ हर साधारण पल ख़ास बन जाता है।',
    },
  },
  {
    title: {
      en: 'Always You',
      hinglish: 'Hamesha Tum',
      hi: 'सदैव तुम',
    },
    detail: {
      en: 'You feel like home — warm, honest, and my favorite person in every room.',
      hinglish: 'Tumhare saath har jagah ghar jaisa lagta hai — saccha, apna aur sabse khaas.',
      hi: 'तुम्हारे साथ हर जगह घर जैसी लगती है — सच्चा, अपना और सबसे प्रिय।',
    },
  },
];

interface DreamDateOption {
  id: DreamDateId;
  code: string;
  label: Record<CoreLanguageCode, string>;
  vibe: Record<CoreLanguageCode, string>;
}

const DREAM_DATE_OPTIONS: readonly DreamDateOption[] = [
  {
    id: 'coffee',
    code: 'DATE-01',
    label: {
      en: 'Rainy Window Coffee',
      hinglish: 'Baarish Wali Coffee',
      hi: 'बारिश और कॉफ़ी',
    },
    vibe: {
      en: 'Warm mugs & unhurried talks',
      hinglish: 'Garam cup & lambi baatein',
      hi: 'गर्म कॉफ़ी और लंबी बातें',
    },
  },
  {
    id: 'gelato',
    code: 'DATE-02',
    label: {
      en: 'Midnight Dessert Walk',
      hinglish: 'Late Night Ice-Cream Walk',
      hi: 'रात की मीठी सैर',
    },
    vibe: {
      en: 'Quiet streets & sweet stops',
      hinglish: 'Street lights & meethi baatein',
      hi: 'धीमी रोशनी और मीठे पल',
    },
  },
  {
    id: 'stargaze',
    code: 'DATE-03',
    label: {
      en: 'Rooftop Stargazing',
      hinglish: 'Chhat Par Sitare',
      hi: 'छत पर सितारों की शाम',
    },
    vibe: {
      en: 'Cool breeze & our playlist',
      hinglish: 'Thandi hawa & favourite gaane',
      hi: 'ठंडी हवा और पसंदीदा गीत',
    },
  },
  {
    id: 'bookstore',
    code: 'DATE-04',
    label: {
      en: 'Bookstore & Chai',
      hinglish: 'Kitabein & Chai Date',
      hi: 'किताबें और चाय',
    },
    vibe: {
      en: 'Notes tucked inside pages',
      hinglish: 'Pannon mein chhupi yaadein',
      hi: 'पन्नों में छिपे प्यारे नोट्स',
    },
  },
];

interface WillYouCopy {
  coverEyebrow: string;
  coverHeadline: string;
  postcardQuote: string;
  forPrefix: string;
  fromPrefix: string;
  promptQuestion: string;
  promptYes: string;
  promptNo: string;
  promptNoNudges: readonly [string, string, string];
  navKeepsakes: string;
  navAsk: string;
  drawerEyebrow: string;
  drawerTitle: string;
  drawerSub: string;
  openedProgress: (n: number, total: number) => string;
  keepsakeLabels: Record<KeepsakeId, { title: string; tag: string }>;
  scrapbookHeading: string;
  scrapbookHint: string;
  letterHeading: string;
  bouquetHeading: string;
  bouquetHint: string;
  vinylHeading: string;
  vinylSongTitle: string;
  vinylSubtitle: string;
  vinylTap: string;
  vinylPlaying: string;
  proceedToAskCta: string;
  proposalEyebrow: string;
  proposalBanner: string;
  proposalQuestion: string;
  yesLabel: string;
  noLabel: string;
  bearIdleCaption: string;
  bearCaptions: readonly [string, string, string, string];
  acceptedEyebrow: string;
  acceptedStamp: string;
  acceptedTitle: (receiver: string) => string;
  acceptedSub: (sender: string) => string;
  datePickerTitle: string;
  copyYesCta: string;
  copiedYesToast: string;
  petalShowerCta: string;
  revisitKeepsakesCta: string;
  closeLabel: string;
  photoLabel: string;
  defaultHeadline: string;
  defaultMessage: string;
}

const COPY_BY_LANG: Record<CoreLanguageCode, WillYouCopy> = {
  en: {
    coverEyebrow: 'LOVE MAIL · HAND-TIED EDITION',
    coverHeadline: 'I Have a Little Surprise For You',
    postcardQuote: 'You turned ordinary days into my favorite memories.',
    forPrefix: 'Dear',
    fromPrefix: 'With all my heart,',
    promptQuestion: 'Would you like to open it?',
    promptYes: 'Yes, open it',
    promptNo: 'No',
    promptNoNudges: [
      'I tied the ribbon myself — just one peek?',
      'Wait, there are flowers inside!',
      'Okay, tapping Yes is way sweeter.',
    ],
    navKeepsakes: 'Keepsakes',
    navAsk: 'The Ask',
    drawerEyebrow: 'RED GINGHAM KEEPSAKE BOX',
    drawerTitle: 'These Are For You',
    drawerSub: 'Tap each lace doily keepsake to open what I packed inside.',
    openedProgress: (n, total) => `${n} / ${total} opened`,
    keepsakeLabels: {
      scrapbook: { title: 'Photo Roll', tag: 'Our Scrapbook' },
      letter: { title: 'Love Letter', tag: 'Handwritten' },
      bouquet: { title: 'Rose Bouquet', tag: '4 Reasons' },
      vinyl: { title: 'Our Vinyl', tag: 'Side A Song' },
    },
    scrapbookHeading: 'Tucked Inside My Scrapbook',
    scrapbookHint: 'Tap any polaroid to inspect closely',
    letterHeading: 'A Quiet Note For You',
    bouquetHeading: 'Flowers For You, My Sweetheart',
    bouquetHint: 'Tap each ribbon tag around the bouquet',
    vinylHeading: 'Song That Reminds Me Of You',
    vinylSongTitle: 'Crimson Evening · Acoustic Vinyl',
    vinylSubtitle: 'Every time this melody plays, I catch myself smiling at my phone.',
    vinylTap: 'Spin Record & Play Chime',
    vinylPlaying: 'Spinning Side A...',
    proceedToAskCta: 'Open My One Little Question',
    proposalEyebrow: 'ONE FINAL CARD',
    proposalBanner: 'Yay, Finally You Are Here!',
    proposalQuestion: 'Will you go out with me?',
    yesLabel: 'Yes, always',
    noLabel: 'No',
    bearIdleCaption: 'holding this heart for you',
    bearCaptions: ['pretty please?', 'i brought crimson roses!', 'wait don’t run!', 'say yes!'],
    acceptedEyebrow: 'KEEPSAKE DATE TICKET · ADMIT TWO',
    acceptedStamp: 'SEALED WITH LOVE',
    acceptedTitle: (receiver) => `It’s officially a date, ${receiver}`,
    acceptedSub: (sender) => `${sender} is grinning from ear to ear right now.`,
    datePickerTitle: 'Stamp our first celebration onto this ticket',
    copyYesCta: 'Copy My YES Reply for WhatsApp',
    copiedYesToast: 'Copied! Paste it straight back on WhatsApp.',
    petalShowerCta: 'Shower Petals',
    revisitKeepsakesCta: 'Revisit Keepsakes',
    closeLabel: 'Close',
    photoLabel: 'Memory',
    defaultHeadline: 'Will you be mine?',
    defaultMessage:
      'Every ordinary evening turns golden the moment you are around. Let me steal you away for slow coffee, warm laughter, and a night worth keeping forever.',
  },
  hinglish: {
    coverEyebrow: 'LOVE MAIL · HAND-TIED EDITION',
    coverHeadline: 'Tumhare Liye Ek Chhota Sa Surprise Hai',
    postcardQuote: 'Tumne har aam din ko meri sabse pyaari yaad bana diya.',
    forPrefix: 'Pyaare',
    fromPrefix: 'Poore dil se,',
    promptQuestion: 'Kya tum ise khol kar dekhogi?',
    promptYes: 'Haan, kholo',
    promptNo: 'Nahi',
    promptNoNudges: [
      'Ribbon khud baandha hai — bas ek baar dekho?',
      'Ruko, andar tumhare liye phool hain!',
      'Chalo maan jao, Haan par tap karo.',
    ],
    navKeepsakes: 'Keepsakes',
    navAsk: 'Sawaal',
    drawerEyebrow: 'RED GINGHAM KEEPSAKE BOX',
    drawerTitle: 'Ye Sab Tumhare Liye Hain',
    drawerSub: 'Har lace doily gift par tap karo aur andar chhupa pyaar dekho.',
    openedProgress: (n, total) => `${n} / ${total} khole`,
    keepsakeLabels: {
      scrapbook: { title: 'Photo Roll', tag: 'Scrapbook' },
      letter: { title: 'Pyaara Khat', tag: 'Dil Se' },
      bouquet: { title: 'Gulaab Bouquet', tag: '4 Wajah' },
      vinyl: { title: 'Hamara Vinyl', tag: 'Side A Dhun' },
    },
    scrapbookHeading: 'Meri Scrapbook Ki Yaadein',
    scrapbookHint: 'Paas se dekhne ke liye photo par tap karo',
    letterHeading: 'Tumhare Naam Ek Khat',
    bouquetHeading: 'Tumhare Liye Gulaab Ka Guldasta',
    bouquetHint: 'Har ribbon tag par tap karo aur wajah padho',
    vinylHeading: 'Wo Dhun Jo Tumhari Yaad Dilati Hai',
    vinylSongTitle: 'Sunahri Shaam · Acoustic Vinyl',
    vinylSubtitle: 'Jab bhi ye dhun bajti hai, bas tumhara chehra yaad aa jaata hai.',
    vinylTap: 'Vinyl Chalao',
    vinylPlaying: 'Side A Chal Raha Hai...',
    proceedToAskCta: 'Ab Dil Ka Sawaal Kholo',
    proposalEyebrow: 'AAKHIRI CARD',
    proposalBanner: 'Aakhir Tum Yahan Tak Aa Hi Gayi!',
    proposalQuestion: 'Kya tum mere saath date par chalogi?',
    yesLabel: 'Haan, bilkul',
    noLabel: 'Nahi',
    bearIdleCaption: 'ye dil sirf tumhare liye',
    bearCaptions: ['please maan jao?', 'gulaab laya hoon!', 'ruko toh sahi!', 'haan bol do!'],
    acceptedEyebrow: 'KEEPSAKE DATE TICKET · ADMIT TWO',
    acceptedStamp: 'DIL SE LOCKED',
    acceptedTitle: (receiver) => `Ye shaam hamari rahi, ${receiver}`,
    acceptedSub: (sender) => `${sender} ke chehre par abhi sabse badi muskaan hai.`,
    datePickerTitle: 'Hamari pehli date is ticket par stamp karo',
    copyYesCta: 'Mera YES Reply Copy Karo',
    copiedYesToast: 'Copy ho gaya! Seedha WhatsApp par bhej do.',
    petalShowerCta: 'Phool Barsao',
    revisitKeepsakesCta: 'Gifts Phir Dekho',
    closeLabel: 'Band Karein',
    photoLabel: 'Yaad',
    defaultHeadline: 'Kya tum meri banogi?',
    defaultMessage:
      'Tumhare aas-paas hote hi har shaam sunahri lagne lagti hai. Chalo garam coffee, meethi hansi aur ek yaadgaar shaam saath bitate hain.',
  },
  hi: {
    coverEyebrow: 'स्नेह पत्र · हस्तनिर्मित संस्करण',
    coverHeadline: 'तुम्हारे लिए एक प्यारा सा उपहार है',
    postcardQuote: 'तुमने हर साधारण दिन को मेरी सबसे सुंदर याद बना दिया।',
    forPrefix: 'प्रिय',
    fromPrefix: 'हृदय से तुम्हारा,',
    promptQuestion: 'क्या तुम इसे खोलकर देखोगी?',
    promptYes: 'हाँ, खोलें',
    promptNo: 'नहीं',
    promptNoNudges: [
      'इतने प्यार से सजाया है — बस एक झलक देख लो?',
      'रुको, इसके भीतर तुम्हारे लिए फूल रखे हैं!',
      'चलो मान जाओ, हाँ पर टैप करो।',
    ],
    navKeepsakes: 'उपहार',
    navAsk: 'सवाल',
    drawerEyebrow: 'स्मृति उपहार पेटी',
    drawerTitle: 'यह सब तुम्हारे लिए है',
    drawerSub: 'हर लेस कार्ड पर टैप करें और भीतर छिपे उपहार देखें।',
    openedProgress: (n, total) => `${n} / ${total} खोले गए`,
    keepsakeLabels: {
      scrapbook: { title: 'तस्वीरें', tag: 'स्क्रैपबुक' },
      letter: { title: 'प्रेम पत्र', tag: 'हस्तलिखित' },
      bouquet: { title: 'गुलाब गुलदस्ता', tag: '4 कारण' },
      vinyl: { title: 'हमारी धुन', tag: 'विनाइल रिकॉर्ड' },
    },
    scrapbookHeading: 'मेरी स्क्रैपबुक की यादें',
    scrapbookHint: 'विस्तार से देखने के लिए तस्वीर पर टैप करें',
    letterHeading: 'तुम्हारे नाम एक शांत पत्र',
    bouquetHeading: 'तुम्हारे लिए गुलाब का गुलदस्ता',
    bouquetHint: 'हर रिबन टैग पर टैप करें और कारण पढ़ें',
    vinylHeading: 'वह धुन जो तुम्हारी याद दिलाती है',
    vinylSongTitle: 'सुनहरी शाम · विनाइल धुन',
    vinylSubtitle: 'जब भी यह धुन बजती है, तुम्हारी मुस्कान आँखों के सामने आ जाती है।',
    vinylTap: 'धुन चलाएँ',
    vinylPlaying: 'धुन बज रही है...',
    proceedToAskCta: 'अब दिल का सवाल खोलें',
    proposalEyebrow: 'अंतिम पत्र',
    proposalBanner: 'आख़िर तुम यहाँ तक आ ही गईं!',
    proposalQuestion: 'क्या तुम मेरे साथ चलोगी?',
    yesLabel: 'हाँ, बिल्कुल',
    noLabel: 'नहीं',
    bearIdleCaption: 'यह हृदय केवल तुम्हारे लिए',
    bearCaptions: ['कृपया मान जाओ?', 'लाल गुलाब लाया हूँ!', 'रुको ना?', 'हाँ बोल दो!'],
    acceptedEyebrow: 'स्मृति डेट टिकट · केवल हमारे लिए',
    acceptedStamp: 'स्नेह से स्वीकृत',
    acceptedTitle: (receiver) => `यह शाम हमारी रही, ${receiver}`,
    acceptedSub: (sender) => `${sender} के चेहरे पर अभी सबसे प्यारी मुस्कान है।`,
    datePickerTitle: 'हमारी पहली ख़ास मुलाक़ात टिकट पर चुनें',
    copyYesCta: 'मेरा हाँ जवाब कॉपी करें',
    copiedYesToast: 'कॉपी हो गया! सीधे WhatsApp पर भेज दें।',
    petalShowerCta: 'फूल बरसाएँ',
    revisitKeepsakesCta: 'उपहार फिर देखें',
    closeLabel: 'बंद करें',
    photoLabel: 'याद',
    defaultHeadline: 'क्या तुम मेरी बनोगी?',
    defaultMessage:
      'तुम्हारे पास होने से हर साधारण शाम सुनहरी बन जाती है। चलो गर्म कॉफ़ी, मीठी हँसी और एक यादगार शाम साथ बिताते हैं।',
  },
};

const RUNAWAY_SPOTS = [
  { x: 0, y: 0 },
  { x: 42, y: -18 },
  { x: -46, y: -14 },
  { x: 38, y: 20 },
  { x: -38, y: 18 },
  { x: 26, y: -26 },
] as const;

const BURST_PETALS = Array.from({ length: 24 }, (_, idx) => {
  const angle = (idx / 24) * 360;
  const dist = 74 + (idx % 4) * 34;
  return {
    angle,
    dist,
    delay: `${(idx % 6) * 55}ms`,
    color: idx % 3 === 0 ? '#E11D48' : idx % 3 === 1 ? '#FDE68A' : '#FDA4AF',
  };
});

/** Scalloped Ivory Crochet Lace Border SVG (inspired by vintage gingham love folios) */
function CrochetLaceTrim({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 360 22"
      preserveAspectRatio="none"
      className={`pointer-events-none block h-5 w-full ${flip ? 'rotate-180' : ''}`}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 0 H360 V9 C352 9 349 20 340 20 C331 20 328 9 320 9 C312 9 309 20 300 20 C291 20 288 9 280 9 C272 9 269 20 260 20 C251 20 248 9 240 9 C232 9 229 20 220 20 C211 20 208 9 200 9 C192 9 189 20 180 20 C171 20 168 9 160 9 C152 9 149 20 140 20 C131 20 128 9 120 9 C112 9 109 20 100 20 C91 20 88 9 80 9 C72 9 69 20 60 20 C51 20 48 9 40 9 C32 9 29 20 20 20 C11 20 8 9 0 9 Z"
        fill="#FAF2E4"
        fillOpacity="0.96"
      />
      <path
        d="M0 9 C8 9 11 20 20 20 C29 20 32 9 40 9 C48 9 51 20 60 20 C69 20 72 9 80 9 C88 9 91 20 100 20 C109 20 112 9 120 9 C128 9 131 20 140 20 C149 20 152 9 160 9 C168 9 171 20 180 20 C189 20 192 9 200 9 C208 9 211 20 220 20 C229 20 232 9 240 9 C248 9 251 20 260 20 C269 20 272 9 280 9 C288 9 291 20 300 20 C309 20 312 9 320 9 C328 9 331 20 340 20 C349 20 352 9 360 9"
        stroke="#D8C2A6"
        strokeWidth="1.2"
      />
    </svg>
  );
}

/** Pressed Crimson Velvet Lily SVG Accent */
function CrimsonLilyCorner({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} fill="none" aria-hidden="true">
      <path d="M48 48 C34 26 20 18 14 14 C24 32 30 44 48 48 Z" fill="#881337" />
      <path d="M48 48 C62 24 76 16 84 14 C72 34 64 44 48 48 Z" fill="#9F1239" />
      <path d="M48 48 C70 42 82 52 88 60 C68 62 56 58 48 48 Z" fill="#BE123C" />
      <path d="M48 48 C56 68 48 82 44 88 C38 72 38 58 48 48 Z" fill="#881337" />
      <path d="M48 48 C28 54 14 66 10 74 C28 70 40 62 48 48 Z" fill="#9F1239" />
      <path d="M48 48 C44 26 48 12 52 6 C56 20 56 36 48 48 Z" fill="#E11D48" fillOpacity="0.88" />
      <circle cx="48" cy="48" r="5" fill="#FDE68A" />
      <circle cx="44" cy="44" r="1.4" fill="#4A0912" />
      <circle cx="52" cy="45" r="1.4" fill="#4A0912" />
      <circle cx="48" cy="52" r="1.4" fill="#4A0912" />
    </svg>
  );
}

/** Tactile Illustrated Keepsake Object Icons (Camera, Ribbon Envelope, Rose Bouquet, Gramophone) */
function KeepsakeObjectIcon({ id }: { id: KeepsakeId }) {
  if (id === 'scrapbook') {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12" fill="none" aria-hidden="true">
        <rect x="8" y="18" width="48" height="32" rx="6" fill="#2E2522" stroke="#D6C1A3" strokeWidth="1.8" />
        <rect x="14" y="13" width="14" height="6" rx="2" fill="#B69571" />
        <rect x="42" y="14" width="8" height="4" rx="1.5" fill="#E11D48" />
        <circle cx="33" cy="34" r="11" fill="#473A35" stroke="#EAD9C1" strokeWidth="2" />
        <circle cx="33" cy="34" r="6.5" fill="#1A1412" />
        <circle cx="30.5" cy="31.5" r="2" fill="#FDA4AF" fillOpacity="0.7" />
        <circle cx="17" cy="25" r="2.2" fill="#FDE68A" />
      </svg>
    );
  }
  if (id === 'letter') {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12" fill="none" aria-hidden="true">
        <rect x="8" y="16" width="48" height="34" rx="5" fill="#9F1239" stroke="#F7E7CE" strokeWidth="1.6" />
        <path d="M10 18 L32 35 L54 18" stroke="#F7E7CE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 33 C25 28 32 33 32 33 C32 33 39 28 41 33 C39 38 32 34 32 34 C32 34 25 38 23 33 Z" fill="#FFFDF8" />
        <circle cx="32" cy="33.5" r="3.2" fill="#FDE68A" />
      </svg>
    );
  }
  if (id === 'bouquet') {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12" fill="none" aria-hidden="true">
        <path d="M22 36 L32 56 L42 36 Z" fill="#EBD7BC" stroke="#B69571" strokeWidth="1.4" />
        <circle cx="24" cy="27" r="7" fill="#BE123C" />
        <circle cx="40" cy="27" r="7" fill="#E11D48" />
        <circle cx="32" cy="21" r="8" fill="#9F1239" />
        <circle cx="32" cy="21" r="3.5" fill="#FDA4AF" />
        <circle cx="24" cy="27" r="2.6" fill="#FECDD3" />
        <circle cx="40" cy="27" r="2.6" fill="#FECDD3" />
        <ellipse cx="17" cy="34" rx="5" ry="2.5" transform="rotate(-25 17 34)" fill="#3F6212" />
        <ellipse cx="47" cy="34" rx="5" ry="2.5" transform="rotate(25 47 34)" fill="#3F6212" />
        <path d="M26 44 H38" stroke="#9F1239" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="22" fill="#1F1817" stroke="#D8C2A6" strokeWidth="1.6" />
      <circle cx="32" cy="32" r="16" stroke="#FFFFFF" strokeOpacity="0.14" strokeWidth="1" />
      <circle cx="32" cy="32" r="12" stroke="#FFFFFF" strokeOpacity="0.14" strokeWidth="1" />
      <circle cx="32" cy="32" r="7.5" fill="#BE123C" />
      <circle cx="32" cy="32" r="2.2" fill="#FAF2E4" />
    </svg>
  );
}

/** Adorable Hand-Drawn Bear & Bunny Couple SVG (inspired by the reference's framed lace card!) */
function CozyCoupleIllustration({
  mood,
  caption,
}: {
  mood: 0 | 1 | 2 | 3 | 4 | 5;
  caption: string;
}) {
  const isHappy = mood === 5;
  const isPleading = mood >= 1 && mood <= 4;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 180 116" className="h-28 w-44" fill="none" aria-hidden="true">
        {/* Soft warm shadow */}
        <ellipse cx="90" cy="106" rx="58" ry="6" fill="#7C2D12" fillOpacity="0.12" />

        {/* Left Ivory Bear */}
        <circle cx="48" cy="32" r="10" fill="#FFFDF9" stroke="#4A2520" strokeWidth="2" />
        <circle cx="78" cy="32" r="10" fill="#FFFDF9" stroke="#4A2520" strokeWidth="2" />
        <ellipse cx="63" cy="64" rx="26" ry="30" fill="#FFFDF9" stroke="#4A2520" strokeWidth="2" />
        {/* Blush */}
        <ellipse cx="50" cy="58" rx="4.5" ry="2.6" fill="#FDA4AF" fillOpacity="0.75" />
        <ellipse cx="76" cy="58" rx="4.5" ry="2.6" fill="#FDA4AF" fillOpacity="0.75" />
        {/* Eyes */}
        {isHappy ? (
          <>
            <path d="M51 50 Q55 46 59 50" stroke="#4A2520" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M67 50 Q71 46 75 50" stroke="#4A2520" strokeWidth="2.2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="55" cy="51" r={isPleading ? 3.2 : 2.6} fill="#3B1D1B" />
            <circle cx="71" cy="51" r={isPleading ? 3.2 : 2.6} fill="#3B1D1B" />
            {isPleading ? (
              <>
                <circle cx="54" cy="49.8" r="1" fill="#FFF" />
                <circle cx="70" cy="49.8" r="1" fill="#FFF" />
              </>
            ) : null}
          </>
        )}
        <path d="M60 56 Q63 59 66 56" stroke="#4A2520" strokeWidth="1.8" strokeLinecap="round" />

        {/* Right Warm Mocha Bear */}
        <circle cx="102" cy="32" r="10" fill="#D5A684" stroke="#4A2520" strokeWidth="2" />
        <circle cx="132" cy="32" r="10" fill="#D5A684" stroke="#4A2520" strokeWidth="2" />
        <ellipse cx="117" cy="64" rx="26" ry="30" fill="#D5A684" stroke="#4A2520" strokeWidth="2" />
        <ellipse cx="104" cy="58" rx="4.5" ry="2.6" fill="#FB7185" fillOpacity="0.55" />
        <ellipse cx="130" cy="58" rx="4.5" ry="2.6" fill="#FB7185" fillOpacity="0.55" />
        {isHappy ? (
          <>
            <path d="M105 50 Q109 46 113 50" stroke="#4A2520" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M121 50 Q125 46 129 50" stroke="#4A2520" strokeWidth="2.2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="109" cy="51" r="2.6" fill="#3B1D1B" />
            <circle cx="125" cy="51" r="2.6" fill="#3B1D1B" />
          </>
        )}
        <path d="M114 56 Q117 59 120 56" stroke="#4A2520" strokeWidth="1.8" strokeLinecap="round" />

        {/* Center Crimson Heart Held Between Them */}
        <path
          d="M90 83 C80 75 76 68 79 62 C82 57 87 58 90 62 C93 58 98 57 101 62 C104 68 100 75 90 83 Z"
          fill="#BE123C"
          stroke="#FFFDF9"
          strokeWidth="1.6"
        />

        {/* Floating little sparkle hearts when accepted */}
        {isHappy ? (
          <>
            <path d="M90 24 C86 20 84 17 86 14 C88 12 90 14 90 15 C90 14 92 12 94 14 C96 17 94 20 90 24 Z" fill="#E11D48" />
            <circle cx="34" cy="20" r="2.5" fill="#F59E0B" />
            <circle cx="146" cy="20" r="2.5" fill="#F59E0B" />
          </>
        ) : null}
      </svg>
      <span className="mt-1 inline-flex rounded-full border border-[#C69C6D]/50 bg-[#FAF2E4] px-3 py-0.5 text-[11px] font-semibold text-[#7A2029]">
        {caption}
      </span>
    </div>
  );
}

/**
 * Editorial Crimson Damask & French Gingham Keepsake Box ("Will You" — `will-you-01`).
 * Inspired by vintage love websites: burgundy damask envelope with twine bow prompt,
 * red-and-cream gingham lace keepsake drawer with 4 interactive heart-doily gifts
 * (Scrapbook Camera, Handwritten Letter, Rose Bouquet Reasons, Spinning Vinyl),
 * scalloped lace proposal table with runaway No, and stamped Dream Date keepsake ticket.
 */
export function WillYouSite({
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const uid = useId().replace(/:/g, '');
  const [stage, setStage] = useState<StageId>('cover');
  const [coverNoCount, setCoverNoCount] = useState(0);
  const [activeKeepsake, setActiveKeepsake] = useState<KeepsakeId>('letter');
  const [openedKeepsakes, setOpenedKeepsakes] = useState<KeepsakeId[]>(['letter']);
  const [activeReasonIdx, setActiveReasonIdx] = useState<number>(0);
  const [nudgeCount, setNudgeCount] = useState(0);
  const [selectedDateId, setSelectedDateId] = useState<DreamDateId>('coffee');
  const [burstKey, setBurstKey] = useState(0);
  const [showBurst, setShowBurst] = useState(false);
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);
  const [failedPhotos, setFailedPhotos] = useState<Record<string, boolean>>({});
  const [copiedYes, setCopiedYes] = useState(false);

  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDodgeRef = useRef<number>(0);
  const openedNotifiedRef = useRef(false);

  const coreLang = toCoreLanguageCode(language);
  const copy = COPY_BY_LANG[coreLang] ?? COPY_BY_LANG.en;
  const isHindi = coreLang === 'hi';
  const hindiSafe: React.CSSProperties | undefined = isHindi
    ? { fontStyle: 'normal', letterSpacing: '0em' }
    : undefined;

  const senderDisplay = (data.senderName || 'A').trim();
  const receiverDisplay = (data.receiverName || 'You').trim();
  const senderInitial = senderDisplay.charAt(0).toUpperCase() || 'A';
  const receiverInitial = receiverDisplay.charAt(0).toUpperCase() || 'Y';

  const headlineText = pickLocalizedText(data.headline, language).trim() || copy.defaultHeadline;
  const messageText = pickLocalizedText(data.message, language).trim() || copy.defaultMessage;

  const polaroids = useMemo(() => {
    const customPhotos = (data.photos ?? [])
      .map((src) => (typeof src === 'string' ? src.trim() : ''))
      .filter((src) => src.length > 0);
    if (customPhotos.length > 0) {
      return [0, 1, 2].map((idx) => {
        const customSrc = customPhotos[idx];
        if (customSrc) {
          return { src: customSrc, caption: `${copy.photoLabel} 0${idx + 1}` };
        }
        const sample = SAMPLE_POLAROIDS[idx];
        return { src: sample.src, caption: sample.caption[coreLang] };
      });
    }
    return SAMPLE_POLAROIDS.map((sample) => ({
      src: sample.src,
      caption: sample.caption[coreLang],
    }));
  }, [copy.photoLabel, coreLang, data.photos]);

  const bouquetReasons = useMemo(() => {
    const customHighlights = data.highlights ?? [];
    return [0, 1, 2, 3].map((idx) => {
      const h = customHighlights[idx];
      const fallback = BOUQUET_REASONS_DEFAULT[idx];
      if (h) {
        const t = pickLocalizedText(h.title, language).trim();
        const d = pickLocalizedText(h.detail, language).trim();
        if (t || d) {
          return { title: t || fallback.title[coreLang], detail: d || fallback.detail[coreLang] };
        }
      }
      return { title: fallback.title[coreLang], detail: fallback.detail[coreLang] };
    });
  }, [coreLang, data.highlights, language]);

  const selectedDateObj =
    DREAM_DATE_OPTIONS.find((d) => d.id === selectedDateId) ?? DREAM_DATE_OPTIONS[0];

  useEffect(() => {
    return () => {
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (zoomIdx === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomIdx(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomIdx]);

  const notifyOpenedOnce = useCallback(() => {
    if (!openedNotifiedRef.current) {
      openedNotifiedRef.current = true;
      onOpened?.();
    }
  }, [onOpened]);

  const triggerPetalBurst = useCallback(() => {
    setBurstKey((k) => k + 1);
    setShowBurst(true);
    if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    burstTimerRef.current = setTimeout(() => setShowBurst(false), 1500);
  }, []);

  const handleOpenBox = useCallback(() => {
    playPaperUnsealSfx(0);
    setStage('keepsakes');
    notifyOpenedOnce();
  }, [notifyOpenedOnce]);

  const handleSelectKeepsake = useCallback((id: KeepsakeId, idx: number) => {
    playPaperUnsealSfx(idx + 1);
    setActiveKeepsake(id);
    setOpenedKeepsakes((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const handleDodgeNo = useCallback(() => {
    const now = Date.now();
    if (now - lastDodgeRef.current < 150) return;
    lastDodgeRef.current = now;
    playPaperUnsealSfx(nudgeCount);
    setNudgeCount((c) => c + 1);
  }, [nudgeCount]);

  const handleSayYes = useCallback(() => {
    playLanternPullChime();
    setStage('accepted');
    triggerPetalBurst();
    notifyOpenedOnce();
  }, [notifyOpenedOnce, triggerPetalBurst]);

  const handleCopyYesReply = useCallback(async () => {
    const chosenDateLabel = selectedDateObj.label[coreLang];
    const reply =
      coreLang === 'hi'
        ? `हाँ, बिल्कुल ${senderDisplay}! मैंने हमारे स्मृति टिकट पर "${chosenDateLabel}" चुन लिया है।`
        : coreLang === 'hinglish'
          ? `Haan bilkul ${senderDisplay}! Keepsake ticket par "${chosenDateLabel}" stamp kar diya hai.`
          : `YES, always ${senderDisplay}! I stamped "${chosenDateLabel}" onto our keepsake date ticket.`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(reply);
      }
    } catch {
      // Safe fallback
    }
    setCopiedYes(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedYes(false), 3200);
  }, [coreLang, selectedDateObj, senderDisplay]);

  const handleReplay = useCallback(() => {
    setZoomIdx(null);
    setNudgeCount(0);
    setCoverNoCount(0);
    setStage('cover');
  }, []);

  const bearMood: 0 | 1 | 2 | 3 | 4 =
    nudgeCount === 0 ? 0 : ((((nudgeCount - 1) % 4) + 1) as 1 | 2 | 3 | 4);
  const bearCaption =
    nudgeCount === 0
      ? copy.bearIdleCaption
      : copy.bearCaptions[(nudgeCount - 1) % copy.bearCaptions.length];
  const dodgeSpot = RUNAWAY_SPOTS[nudgeCount % RUNAWAY_SPOTS.length];
  const yesScale = Math.min(1.14, 1 + nudgeCount * 0.03);

  const isGinghamStage = stage === 'keepsakes' || stage === 'proposal';

  return (
    <div
      className="relative flex min-h-full w-full flex-col overflow-x-clip rounded-[28px] transition-colors duration-500"
      style={
        isGinghamStage
          ? {
              backgroundColor: '#FBF3E8',
              backgroundImage:
                'linear-gradient(90deg, rgba(168, 36, 44, 0.16) 50%, transparent 50%), linear-gradient(rgba(168, 36, 44, 0.16) 50%, transparent 50%)',
              backgroundSize: '36px 36px',
            }
          : {
              background:
                'radial-gradient(ellipse 90% 60% at 50% 18%, #6D1120 0%, #4A0912 52%, #2B050B 100%)',
            }
      }
    >
      <style>{`
        @keyframes wy2-fade-up-${uid} {
          0% { opacity: 0; transform: translateY(12px) scale(0.985); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wy2-float-${uid} {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes wy2-spin-${uid} {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes wy2-burst-${uid} {
          0% { transform: translate(-50%, -50%) translate(0px, 0px) scale(0.35) rotate(0deg); opacity: 1; }
          75% { opacity: 0.92; }
          100% { transform: translate(-50%, -50%) translate(var(--wy2-tx), var(--wy2-ty)) scale(1.1) rotate(180deg); opacity: 0; }
        }
        .wy2-fade-up-${uid} { animation: wy2-fade-up-${uid} 440ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .wy2-float-${uid} { animation: wy2-float-${uid} 4.2s ease-in-out infinite; }
        .wy2-spin-${uid} { animation: wy2-spin-${uid} 9s linear infinite; }
        .wy2-burst-${uid} { animation: wy2-burst-${uid} 1350ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .wy2-fade-up-${uid}, .wy2-float-${uid}, .wy2-spin-${uid}, .wy2-burst-${uid} {
            animation: none !important;
          }
        }
      `}</style>

      {/* Damask Wallpaper Filigree on Velvet Stages */}
      {!isGinghamStage ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12px 12px, #FDE68A 1.1px, transparent 1.1px), radial-gradient(circle at 28px 28px, #FDA4AF 0.9px, transparent 0.9px)',
            backgroundSize: '32px 32px',
          }}
        />
      ) : null}

      {/* Watermark Strip */}
      {watermarked ? (
        <div
          aria-hidden="true"
          className="relative z-30 flex justify-center border-b border-[#D8C2A6]/40 bg-[#3A070F]/92 py-1 font-mono text-[10px] font-bold tracking-[0.18em] text-[#FDE68A]"
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      {/* Scalloped Crochet Lace Top Trim on Gingham Stages */}
      {isGinghamStage ? (
        <div className="relative z-20">
          <div className="flex items-center justify-between gap-2 bg-[#FAF2E4] px-4 py-2 text-[#4A0912]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStage('keepsakes')}
                className={`min-h-[36px] rounded-full px-3 text-xs font-bold transition ${
                  stage === 'keepsakes'
                    ? 'bg-[#8F1522] text-[#FAF2E4]'
                    : 'border border-[#D4BC9E] bg-white text-[#5C1A22] hover:bg-[#F5E9D6]'
                }`}
              >
                {copy.navKeepsakes}
              </button>
              <button
                type="button"
                onClick={() => setStage('proposal')}
                className={`min-h-[36px] rounded-full px-3 text-xs font-bold transition ${
                  stage === 'proposal'
                    ? 'bg-[#8F1522] text-[#FAF2E4]'
                    : 'border border-[#D4BC9E] bg-white text-[#5C1A22] hover:bg-[#F5E9D6]'
                }`}
              >
                {copy.navAsk}
              </button>
            </div>
            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex min-h-[36px] items-center rounded-full border border-[#D4BC9E] bg-white px-3 text-[11px] font-semibold text-[#5C1A22] transition hover:bg-[#F5E9D6]"
            >
              {getReplayLabel(language)}
            </button>
          </div>
          <CrochetLaceTrim />
        </div>
      ) : null}

      {/* Petal Celebration Burst Overlay */}
      {showBurst ? (
        <div
          key={`burst-${burstKey}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-50 overflow-hidden"
        >
          {BURST_PETALS.map((p, idx) => {
            const rad = (p.angle * Math.PI) / 180;
            const tx = `${Math.round(Math.cos(rad) * p.dist)}px`;
            const ty = `${Math.round(Math.sin(rad) * p.dist)}px`;
            return (
              <span
                key={`petal-${idx}`}
                className={`wy2-burst-${uid} absolute left-1/2 top-1/2`}
                style={
                  {
                    '--wy2-tx': tx,
                    '--wy2-ty': ty,
                    animationDelay: p.delay,
                  } as React.CSSProperties
                }
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill={p.color}>
                  <path d="M10 2 C15 4.5 17 11 10 18 C3 11 5 4.5 10 2 Z" />
                </svg>
              </span>
            );
          })}
        </div>
      ) : null}

      {/* =====================================================================
          STAGE 1: CRIMSON DAMASK ENVELOPE & TWINE-TIED PROMPT COVER
         ===================================================================== */}
      {stage === 'cover' ? (
        <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5 px-4 py-8 text-center text-[#FAF2E4]">
          <CrimsonLilyCorner className="pointer-events-none absolute -left-4 top-2 h-24 w-24 opacity-85" />
          <CrimsonLilyCorner className="pointer-events-none absolute -right-4 bottom-8 h-24 w-24 rotate-180 opacity-85" />

          <span
            style={hindiSafe}
            className={`inline-flex items-center gap-2 rounded-full border border-[#FDE68A]/35 bg-[#30060C]/80 px-3.5 py-1 text-[10px] font-bold text-[#FDE68A] ${
              isHindi ? '' : 'font-mono uppercase tracking-[0.2em]'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#FDA4AF]" aria-hidden="true" />
            {copy.coverEyebrow}
          </span>

          <h1
            style={hindiSafe}
            className={`max-w-xs break-words font-heading text-2xl font-bold leading-snug text-[#FFF8EF] sm:text-3xl ${
              isHindi || hasDevanagari(copy.coverHeadline) ? 'not-italic' : 'italic'
            }`}
          >
            {copy.coverHeadline}
          </h1>

          {/* Cream Envelope Peeking Out with Wax Seal & Vintage Postcard */}
          <div className={`wy2-float-${uid} relative w-full max-w-[320px]`}>
            <div className="relative rounded-[20px] border border-[#E7D4B8]/85 bg-gradient-to-b from-[#FCF6EC] to-[#F2E4CE] p-5 text-[#3B181E] shadow-[0_28px_60px_-16px_rgba(0,0,0,0.75)]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-2 rounded-[14px] border border-[#C69C6D]/45"
              />

              {/* Top Postage Stamp + Heart Wax Seal Row */}
              <div className="relative flex items-center justify-between gap-2">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#FDA4AF]/50 bg-gradient-to-br from-[#BE123C] to-[#7A0B24] font-heading text-xs font-bold text-[#FFF8EF] shadow-md">
                  {senderInitial}&amp;{receiverInitial}
                </span>

                <div className="rounded border border-dashed border-[#B69571] bg-[#FFFDF8] px-2.5 py-1 text-right font-mono text-[8.5px] font-bold uppercase tracking-[0.14em] text-[#8F1522]">
                  <div>POSTCARD</div>
                  <div className="text-[#7A5438]">LOVE MAIL</div>
                </div>
              </div>

              <div className="relative mt-4 border-t border-dashed border-[#D3BC9C] pt-4 text-left">
                <p
                  style={hindiSafe}
                  className={`font-heading text-xl font-bold text-[#4A0912] ${
                    isHindi || hasDevanagari(receiverDisplay) ? 'not-italic' : 'italic'
                  }`}
                >
                  {copy.forPrefix} {receiverDisplay},
                </p>
                <p
                  style={hindiSafe}
                  className="mt-1.5 font-serif text-[13.5px] leading-relaxed text-[#5C3136]"
                >
                  {copy.postcardQuote}
                </p>
                <p className="mt-3 text-right text-xs font-semibold text-[#8F1522]">
                  {copy.fromPrefix} {senderDisplay}
                </p>
              </div>
            </div>
          </div>

          {/* Twine-Tied Vintage Prompt Card ("Would you like to open it? Yes / No") */}
          <div className="relative mt-1 w-full max-w-[290px] pt-3">
            {/* Linen Twine Bow SVG */}
            <svg
              viewBox="0 0 80 28"
              className="pointer-events-none mx-auto -mb-2 h-7 w-20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M40 16 C28 4 14 8 22 18 C28 24 37 18 40 16 C43 18 52 24 58 18 C66 8 52 4 40 16 Z"
                stroke="#E5CFAF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M40 16 L32 27 M40 16 L48 27" stroke="#E5CFAF" strokeWidth="1.8" strokeLinecap="round" />
            </svg>

            <div className="rounded-xl border border-[#DFC7A5] bg-[#FAF2E4] px-5 py-4 text-[#3B181E] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.68)]">
              <p
                style={hindiSafe}
                className={`font-heading text-base font-bold text-[#4A0912] ${
                  isHindi ? 'not-italic' : 'italic'
                }`}
              >
                {copy.promptQuestion}
              </p>

              <div className="mt-3.5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleOpenBox}
                  className="inline-flex min-h-[46px] w-full items-center justify-center rounded-lg border-2 border-[#7A0B24] bg-[#8F1522] px-4 py-2 text-xs font-bold tracking-wide text-[#FFF8EF] shadow-sm transition hover:bg-[#74101B] active:scale-[0.98]"
                >
                  {copy.promptYes}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playPaperUnsealSfx(coverNoCount);
                    setCoverNoCount((c) => c + 1);
                  }}
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-[#C6A984] bg-[#FFFDF8] px-4 py-2 text-xs font-semibold text-[#6B3B40] transition hover:bg-[#F5E9D6] active:scale-[0.98]"
                >
                  {copy.promptNo}
                </button>
              </div>

              {coverNoCount > 0 ? (
                <p
                  role="status"
                  style={hindiSafe}
                  className="mt-2.5 text-[11.5px] font-semibold text-[#8F1522]"
                >
                  {copy.promptNoNudges[(coverNoCount - 1) % copy.promptNoNudges.length]}
                </p>
              ) : null}
            </div>
          </div>
        </main>
      ) : null}

      {/* =====================================================================
          STAGE 2: RED GINGHAM LACE KEEPSAKE DRAWER (4 INTERACTIVE GIFTS)
         ===================================================================== */}
      {stage === 'keepsakes' ? (
        <main className={`wy2-fade-up-${uid} relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-5 text-[#3B181E]`}>
          {/* Header Banner */}
          <div className="rounded-2xl border border-[#DFC7A5] bg-[#FAF2E4]/95 px-4 py-4 text-center shadow-sm">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span
                style={hindiSafe}
                className={`text-[10px] font-bold text-[#8F1522] ${
                  isHindi ? '' : 'font-mono uppercase tracking-[0.18em]'
                }`}
              >
                {copy.drawerEyebrow}
              </span>
              <span className="rounded-full bg-[#8F1522] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#FAF2E4]">
                {copy.openedProgress(openedKeepsakes.length, 4)}
              </span>
            </div>
            <h2
              style={hindiSafe}
              className={`mt-1.5 font-heading text-2xl font-bold text-[#4A0912] ${
                isHindi ? 'not-italic' : 'italic'
              }`}
            >
              {copy.drawerTitle}
            </h2>
            <p style={hindiSafe} className="mt-1 text-xs text-[#6B3B40]">
              {copy.drawerSub}
            </p>
          </div>

          {/* 4 Lace-Doily Keepsake Buttons (2x2 Grid) */}
          <section aria-label={copy.drawerTitle} className="grid grid-cols-2 gap-3">
            {(['letter', 'bouquet', 'scrapbook', 'vinyl'] as const).map((id, idx) => {
              const isSelected = activeKeepsake === id;
              const isOpened = openedKeepsakes.includes(id);
              const meta = copy.keepsakeLabels[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectKeepsake(id, idx)}
                  aria-pressed={isSelected}
                  className={`group relative flex min-h-[118px] flex-col items-center justify-center gap-1.5 rounded-[22px] border-2 px-3 py-3.5 text-center transition-all duration-200 active:scale-[0.97] ${
                    isSelected
                      ? 'border-[#8F1522] bg-[#FFFDF9] shadow-[0_14px_28px_-12px_rgba(143,21,34,0.45)]'
                      : 'border-dashed border-[#D2B694] bg-[#FAF2E4]/95 hover:border-[#8F1522]/60 hover:bg-[#FFFDF9]'
                  }`}
                >
                  {isOpened ? (
                    <span
                      aria-hidden="true"
                      className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#8F1522] text-white"
                    >
                      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
                        <path
                          d="M3.5 8.2L6.6 11.3L12.5 4.8"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  ) : null}

                  <div className="transition-transform duration-200 group-hover:scale-105">
                    <KeepsakeObjectIcon id={id} />
                  </div>
                  <span style={hindiSafe} className="font-heading text-sm font-bold text-[#4A0912]">
                    {meta.title}
                  </span>
                  <span className="text-[10.5px] font-semibold text-[#8F1522]/80">{meta.tag}</span>
                </button>
              );
            })}
          </section>

          {/* Active Keepsake Interactive Stage */}
          <section className="relative overflow-hidden rounded-[24px] border-2 border-[#DFC7A5] bg-[#FFFDF8] p-5 shadow-[0_18px_36px_-18px_rgba(74,9,18,0.35)]">
            {activeKeepsake === 'letter' ? (
              <div className="space-y-3 text-center">
                <span
                  style={hindiSafe}
                  className={`inline-block rounded-full border border-[#DFC7A5] bg-[#FAF2E4] px-3 py-0.5 text-[10px] font-bold text-[#8F1522] ${
                    isHindi ? '' : 'font-mono uppercase tracking-[0.16em]'
                  }`}
                >
                  {copy.letterHeading}
                </span>
                <h3
                  style={hindiSafe}
                  className={`break-words font-heading text-2xl font-bold leading-snug text-[#4A0912] ${
                    isHindi || hasDevanagari(headlineText) ? 'not-italic' : 'italic'
                  }`}
                >
                  {headlineText}
                </h3>
                <div className="mx-auto h-px w-16 bg-[#D8C2A6]" aria-hidden="true" />
                <p
                  style={hindiSafe}
                  className="break-words rounded-2xl border border-[#EFE2CE] bg-[#FBF6EC] p-4 font-serif text-[15px] leading-relaxed text-[#4A252B]"
                >
                  {messageText}
                </p>
                <p className="font-heading text-sm font-bold italic text-[#8F1522]">
                  {copy.fromPrefix} {senderDisplay}
                </p>
              </div>
            ) : null}

            {activeKeepsake === 'bouquet' ? (
              <div className="space-y-3.5 text-center">
                <div>
                  <h3
                    style={hindiSafe}
                    className={`font-heading text-xl font-bold text-[#4A0912] ${
                      isHindi ? 'not-italic' : 'italic'
                    }`}
                  >
                    {copy.bouquetHeading}
                  </h3>
                  <p style={hindiSafe} className="mt-0.5 text-xs text-[#6B3B40]">
                    {copy.bouquetHint}
                  </p>
                </div>

                {/* Illustrated Rose Bouquet Centerpiece */}
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#E7D4B8] bg-gradient-to-b from-[#FDF5EB] to-[#F7E6D4]">
                  <KeepsakeObjectIcon id="bouquet" />
                </div>

                {/* 4 Tappable Ribbon Callout Tags */}
                <div className="grid grid-cols-2 gap-2">
                  {bouquetReasons.map((reason, idx) => {
                    const active = activeReasonIdx === idx;
                    return (
                      <button
                        key={`reason-tag-${idx}`}
                        type="button"
                        onClick={() => {
                          playPaperUnsealSfx(idx);
                          setActiveReasonIdx(idx);
                        }}
                        aria-pressed={active}
                        className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-bold transition active:scale-[0.98] ${
                          active
                            ? 'border-[#8F1522] bg-[#8F1522] text-[#FFF8EF]'
                            : 'border-[#DFC7A5] bg-[#FAF2E4] text-[#4A0912] hover:border-[#8F1522]/50'
                        }`}
                      >
                        {reason.title}
                      </button>
                    );
                  })}
                </div>

                <div
                  role="status"
                  className="rounded-2xl border border-[#DFC7A5] bg-[#FBF6EC] px-4 py-3.5"
                >
                  <p style={hindiSafe} className="font-heading text-sm font-bold text-[#8F1522]">
                    {bouquetReasons[activeReasonIdx]?.title}
                  </p>
                  <p
                    style={hindiSafe}
                    className="mt-1 font-serif text-[13.5px] leading-relaxed text-[#4A252B]"
                  >
                    {bouquetReasons[activeReasonIdx]?.detail}
                  </p>
                </div>
              </div>
            ) : null}

            {activeKeepsake === 'scrapbook' ? (
              <div className="space-y-3 text-center">
                <div>
                  <h3
                    style={hindiSafe}
                    className={`font-heading text-xl font-bold text-[#4A0912] ${
                      isHindi ? 'not-italic' : 'italic'
                    }`}
                  >
                    {copy.scrapbookHeading}
                  </h3>
                  <p style={hindiSafe} className="mt-0.5 text-xs text-[#6B3B40]">
                    {copy.scrapbookHint}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  {polaroids.map((item, idx) => {
                    const isFailed = Boolean(failedPhotos[item.src]);
                    const tilts = ['-rotate-2', 'rotate-1', 'rotate-2'] as const;
                    return (
                      <button
                        key={`scrap-photo-${idx}`}
                        type="button"
                        onClick={() => !isFailed && setZoomIdx(idx)}
                        className={`group relative flex flex-col rounded-lg border border-[#D8C2A6] bg-white p-1.5 pb-2.5 shadow-md transition hover:z-10 hover:rotate-0 hover:scale-105 active:scale-95 ${tilts[idx % 3]}`}
                      >
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -top-2 left-1/2 h-3 w-8 -translate-x-1/2 rounded-[2px] bg-[#E11D48]/35"
                        />
                        <div className="aspect-square w-full overflow-hidden rounded bg-[#F5E9D6]">
                          {!isFailed ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={item.src}
                              alt={item.caption}
                              loading="lazy"
                              onError={() =>
                                setFailedPhotos((prev) => ({ ...prev, [item.src]: true }))
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#4A0912] text-xs font-bold text-[#FDE68A]">
                              0{idx + 1}
                            </div>
                          )}
                        </div>
                        <span className="mt-1.5 block truncate text-[10px] font-semibold italic text-[#4A0912]">
                          {item.caption}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {activeKeepsake === 'vinyl' ? (
              <div className="space-y-4 text-center">
                <h3
                  style={hindiSafe}
                  className={`font-heading text-xl font-bold text-[#4A0912] ${
                    isHindi ? 'not-italic' : 'italic'
                  }`}
                >
                  {copy.vinylHeading}
                </h3>

                {/* Spinning 33RPM Crimson Vinyl Disc */}
                <div className="mx-auto flex h-28 w-28 items-center justify-center">
                  <div
                    className={`wy2-spin-${uid} flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#D8C2A6] bg-[#1C1414] shadow-lg`}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#BE123C] text-[9px] font-bold text-[#FAF2E4]">
                        {senderInitial}&amp;{receiverInitial}
                      </div>
                    </div>
                  </div>
                </div>

                <p style={hindiSafe} className="font-serif text-xs leading-relaxed text-[#5C3136]">
                  {copy.vinylSubtitle}
                </p>

                <OccasionCassettePlayer
                  trackTitle={copy.vinylSongTitle}
                  mood="romantic"
                  tapLabel={copy.vinylTap}
                  playingLabel={copy.vinylPlaying}
                  accentColor="#8F1522"
                />
              </div>
            ) : null}
          </section>

          {/* Proceed to Proposal CTA */}
          <button
            type="button"
            onClick={() => {
              playLanternPullChime();
              setStage('proposal');
            }}
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#FAF2E4] bg-[#4A0912] px-6 py-3 text-sm font-bold text-[#FFF8EF] shadow-[0_14px_30px_-10px_rgba(74,9,18,0.65)] transition hover:bg-[#640D19] active:scale-[0.98]"
          >
            <span>{copy.proceedToAskCta}</span>
            <span aria-hidden="true">-&gt;</span>
          </button>
        </main>
      ) : null}

      {/* =====================================================================
          STAGE 3: LACE-FRAMED PROPOSAL TABLE (RUNAWAY NO & YES)
         ===================================================================== */}
      {stage === 'proposal' ? (
        <main className={`wy2-fade-up-${uid} relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5 px-4 py-7 text-center text-[#3B181E]`}>
          <section className="relative w-full rounded-[28px] border-[6px] border-double border-[#E6D0B1] bg-[#FFFDF8] px-5 py-7 shadow-[0_24px_54px_-16px_rgba(74,9,18,0.42)]">
            <span
              style={hindiSafe}
              className={`inline-block rounded-full border border-[#DFC7A5] bg-[#FAF2E4] px-3.5 py-1 text-[10px] font-bold text-[#8F1522] ${
                isHindi ? '' : 'font-mono uppercase tracking-[0.18em]'
              }`}
            >
              {copy.proposalEyebrow}
            </span>

            <p
              style={hindiSafe}
              className="mt-2 font-serif text-xs font-semibold text-[#7A3B42]"
            >
              {copy.proposalBanner}
            </p>

            <div className="my-4">
              <CozyCoupleIllustration mood={bearMood} caption={bearCaption} />
            </div>

            <h2
              style={hindiSafe}
              className={`break-words font-heading text-2xl font-bold text-[#4A0912] sm:text-[28px] ${
                isHindi ? 'not-italic' : 'italic'
              }`}
            >
              {copy.proposalQuestion}
            </h2>

            {/* Interactive Yes / Runaway No Stage */}
            <div className="relative mt-6 flex min-h-[100px] flex-wrap items-center justify-center gap-3.5 px-2 py-2">
              <button
                type="button"
                onClick={handleSayYes}
                style={{ transform: `scale(${yesScale})` }}
                className="relative z-10 inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-[#7A0B24] bg-gradient-to-r from-[#8F1522] via-[#BE123C] to-[#9F1239] px-7 py-2.5 text-sm font-bold text-[#FFF8EF] shadow-[0_12px_28px_-8px_rgba(143,21,34,0.65)] transition-all duration-300 hover:brightness-110 active:scale-95"
              >
                {copy.yesLabel}
              </button>

              <button
                type="button"
                onClick={handleDodgeNo}
                onMouseEnter={handleDodgeNo}
                style={{ transform: `translate(${dodgeSpot.x}px, ${dodgeSpot.y}px)` }}
                className="relative z-10 inline-flex min-h-[44px] min-w-[78px] items-center justify-center rounded-full border border-[#C6A984] bg-[#FAF2E4] px-4 py-2 text-xs font-semibold text-[#5C3136] transition-transform duration-300 ease-out hover:bg-[#F2E4CE]"
              >
                {copy.noLabel}
              </button>
            </div>
          </section>
        </main>
      ) : null}

      {/* =====================================================================
          STAGE 4: ACCEPTED GRAND VELVET BOUQUET & STAMPED DATE TICKET
         ===================================================================== */}
      {stage === 'accepted' ? (
        <main className={`wy2-fade-up-${uid} relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-7 text-[#FAF2E4]`}>
          <div className="rounded-2xl border border-[#DFC7A5]/45 bg-[#FFFDF8] px-5 py-3 shadow-lg">
            <CozyCoupleIllustration mood={5} caption={copy.yesLabel} />
          </div>

          {/* Vintage Velvet & Cream Keepsake Date Ticket */}
          <section className="relative w-full overflow-hidden rounded-[26px] border-2 border-[#E5CFAF]/75 bg-[#FAF2E4] p-5 text-[#3B181E] shadow-[0_28px_60px_-16px_rgba(0,0,0,0.75)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                style={hindiSafe}
                className={`text-[10px] font-bold text-[#8F1522] ${
                  isHindi ? '' : 'font-mono uppercase tracking-[0.16em]'
                }`}
              >
                {copy.acceptedEyebrow}
              </span>
              <span className="-rotate-2 rounded border border-[#8F1522] bg-[#8F1522]/10 px-2 py-0.5 font-mono text-[9px] font-bold text-[#8F1522]">
                {copy.acceptedStamp}
              </span>
            </div>

            <h2
              style={hindiSafe}
              className={`mt-2.5 break-words font-heading text-2xl font-bold leading-snug text-[#4A0912] ${
                isHindi || hasDevanagari(receiverDisplay) ? 'not-italic' : 'italic'
              }`}
            >
              {copy.acceptedTitle(receiverDisplay)}
            </h2>
            <p style={hindiSafe} className="mt-1 text-xs leading-relaxed text-[#6B3B40]">
              {copy.acceptedSub(senderDisplay)}
            </p>

            {/* Dream Date Stamp Picker */}
            <div className="mt-4 space-y-2 rounded-2xl border border-[#DFC7A5] bg-[#FFFDF9] p-3">
              <p style={hindiSafe} className="text-[11px] font-bold text-[#4A0912]">
                {copy.datePickerTitle}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DREAM_DATE_OPTIONS.map((opt, idx) => {
                  const picked = opt.id === selectedDateId;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        playPaperUnsealSfx(idx);
                        setSelectedDateId(opt.id);
                      }}
                      aria-pressed={picked}
                      className={`flex min-h-[56px] flex-col items-start justify-center rounded-xl border px-3 py-2 text-left transition active:scale-[0.98] ${
                        picked
                          ? 'border-[#8F1522] bg-[#8F1522] text-[#FFF8EF]'
                          : 'border-[#DFC7A5] bg-[#FAF2E4]/75 text-[#4A0912] hover:border-[#8F1522]/50'
                      }`}
                    >
                      <span className="text-[11px] font-bold leading-snug">
                        {opt.label[coreLang]}
                      </span>
                      <span
                        className={`mt-0.5 text-[10px] ${
                          picked ? 'text-[#FDE68A]' : 'text-[#7A4B50]'
                        }`}
                      >
                        {opt.vibe[coreLang]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Perforated Tear Line */}
            <div className="relative my-4 flex items-center" aria-hidden="true">
              <span className="-ml-8 h-6 w-6 shrink-0 rounded-full bg-[#3A070F]" />
              <span className="w-full border-t-2 border-dashed border-[#C6A984]" />
              <span className="-mr-8 h-6 w-6 shrink-0 rounded-full bg-[#3A070F]" />
            </div>

            {/* Reserved Stamp Summary & Actions */}
            <div className="space-y-2.5 text-center">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#8F1522]">
                {selectedDateObj.code} · {selectedDateObj.label[coreLang]}
              </p>

              <button
                type="button"
                onClick={() => void handleCopyYesReply()}
                className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-[#8F1522] px-5 py-2.5 text-xs font-bold text-[#FFF8EF] shadow-sm transition hover:bg-[#74101B] active:scale-[0.98]"
              >
                {copy.copyYesCta}
              </button>

              {copiedYes ? (
                <p role="status" className="text-xs font-semibold text-emerald-800">
                  {copy.copiedYesToast}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={triggerPetalBurst}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-[#8F1522]/35 bg-[#FFFDF8] px-4 text-xs font-bold text-[#8F1522] transition hover:bg-[#F5E9D6] active:scale-95"
                >
                  {copy.petalShowerCta}
                </button>
                <button
                  type="button"
                  onClick={() => setStage('keepsakes')}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-[#C6A984] bg-[#FFFDF8] px-4 text-xs font-semibold text-[#5C3136] transition hover:bg-[#F5E9D6] active:scale-95"
                >
                  {copy.revisitKeepsakesCta}
                </button>
              </div>
            </div>
          </section>
        </main>
      ) : null}

      {/* Bottom Scalloped Lace Trim on Gingham Stages */}
      {isGinghamStage ? (
        <div className="relative z-20 mt-auto">
          <CrochetLaceTrim flip />
          <footer className="bg-[#FAF2E4] px-4 py-3 text-center text-[11px] font-medium text-[#6B3B40]">
            {getWebzyFooterLabel(language)}
          </footer>
        </div>
      ) : (
        <footer className="relative z-10 mt-auto border-t border-[#FAF2E4]/15 bg-[#2B050B]/70 px-4 py-3 text-center text-[11px] text-[#FAF2E4]/75">
          {getWebzyFooterLabel(language)}
        </footer>
      )}

      {/* Portaled Scrapbook Lightbox */}
      {zoomIdx !== null && polaroids[zoomIdx] && typeof document !== 'undefined'
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={polaroids[zoomIdx].caption}
              onClick={() => setZoomIdx(null)}
              className="fixed inset-0 z-[120] flex items-center justify-center bg-[#2B050B]/85 p-4 backdrop-blur-xs"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl border border-[#DFC7A5] bg-[#FAF2E4] p-3 text-[#3B181E] shadow-2xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={polaroids[zoomIdx].src}
                  alt={polaroids[zoomIdx].caption}
                  className="max-h-[65dvh] w-full rounded-xl bg-[#4A0912] object-cover"
                />
                <div className="mt-2.5 flex items-center justify-between gap-2 px-1">
                  <span className="truncate font-heading text-xs font-bold italic text-[#4A0912]">
                    {polaroids[zoomIdx].caption}
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomIdx(null)}
                    className="min-h-[44px] rounded-full bg-[#8F1522] px-4 text-xs font-bold text-[#FFF8EF] transition hover:bg-[#74101B]"
                  >
                    {copy.closeLabel}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
