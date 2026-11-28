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
type KeepsakeId = 'bouquet' | 'letter' | 'scrapbook' | 'vinyl';
type DreamDateId = 'coffee' | 'picnic' | 'terrace' | 'walk';

const ART = {
  velvetEnvelope: '/templates/occasions/will-you/velvet-envelope-art.jpg',
  handsBouquet: '/templates/occasions/will-you/hands-bouquet-art.jpg',
  moonlitTerrace: '/templates/occasions/will-you/moonlit-terrace-art.jpg',
  parisBalcony: '/templates/occasions/upgrades/paris-moonlit-balcony.jpg',
  roseCottage: '/templates/cafe/rose-cottage.jpg',
  warmChai: '/templates/occasions/maan-jao/warm-rain-chai-art.jpg',
  goldenWalk: '/templates/occasions/maan-jao/golden-walk-art.jpg',
} as const;

interface PolaroidSample {
  src: string;
  caption: Record<CoreLanguageCode, string>;
  momentTag: Record<CoreLanguageCode, string>;
}

const SAMPLE_POLAROIDS: readonly PolaroidSample[] = [
  {
    src: ART.velvetEnvelope,
    caption: {
      en: 'sealed with roses',
      hinglish: 'gulaab aur khat',
      hi: 'गुलाब और स्नेह पत्र',
    },
    momentTag: {
      en: 'CHAPTER 01',
      hinglish: 'CHAPTER 01',
      hi: 'अध्याय 01',
    },
  },
  {
    src: ART.handsBouquet,
    caption: {
      en: 'sunlit blooms for you',
      hinglish: 'dhoop aur phool',
      hi: 'सुनहरे फूल',
    },
    momentTag: {
      en: 'CHAPTER 02',
      hinglish: 'CHAPTER 02',
      hi: 'अध्याय 02',
    },
  },
  {
    src: ART.moonlitTerrace,
    caption: {
      en: 'candlelit evening',
      hinglish: 'chaandni shaam',
      hi: 'चाँदनी शाम',
    },
    momentTag: {
      en: 'CHAPTER 03',
      hinglish: 'CHAPTER 03',
      hi: 'अध्याय 03',
    },
  },
];

interface BouquetHotspot {
  id: number;
  leftPct: number;
  topPct: number;
  bloomName: Record<CoreLanguageCode, string>;
  title: Record<CoreLanguageCode, string>;
  detail: Record<CoreLanguageCode, string>;
}

const BOUQUET_HOTSPOTS: readonly BouquetHotspot[] = [
  {
    id: 0,
    leftPct: 40,
    topPct: 26,
    bloomName: { en: 'Crimson Peony', hinglish: 'Laal Peony', hi: 'लाल पियोनी' },
    title: { en: 'Your Laugh', hinglish: 'Tumhari Hansi', hi: 'तुम्हारी मुस्कान' },
    detail: {
      en: 'The way even a noisy, exhausting day turns quiet and golden the second you smile.',
      hinglish: 'Sabse thake din mein bhi tumhari ek muskaan sab shaant aur sunahra bana deti hai.',
      hi: 'सबसे थके हुए दिन में भी तुम्हारी एक मुस्कान सब सुकून से भर देती है।',
    },
  },
  {
    id: 1,
    leftPct: 45,
    topPct: 45,
    bloomName: { en: 'Blush Rose', hinglish: 'Gulaabi Phool', hi: 'गुलाबी गुलाब' },
    title: { en: 'Our Easy Peace', hinglish: 'Hamara Sukoon', hi: 'सुकून भरा साथ' },
    detail: {
      en: 'Talking with you for hours feels effortless, and sitting beside you in silence feels like home.',
      hinglish: 'Ghanton baatein karna bhi aasaan hai, aur tumhare saath chup rehna bhi ghar jaisa lagta hai.',
      hi: 'तुम्हारे साथ घंटों बातें करना भी आसान है और खामोशी भी घर जैसी लगती है।',
    },
  },
  {
    id: 2,
    leftPct: 55,
    topPct: 54,
    bloomName: { en: 'White Jasmine', hinglish: 'Mogra & Chameli', hi: 'सफ़ेद चमेली' },
    title: { en: 'Little Rituals', hinglish: 'Chhoti Yaadein', hi: 'छोटी-छोटी आदतें' },
    detail: {
      en: 'Every shared cup of coffee, evening breeze, or random drive becomes my favorite memory.',
      hinglish: 'Har shared coffee, shaam ki hawa aur chhoti si walk meri sabse pyaari yaad ban jaati hai.',
      hi: 'हर चाय की शाम, ठंडी हवा और छोटी सी सैर मेरी सबसे प्रिय याद बन जाती है।',
    },
  },
  {
    id: 3,
    leftPct: 77,
    topPct: 47,
    bloomName: { en: 'Satin Ribbon', hinglish: 'Satin Ribbon', hi: 'रेशमी रिबन' },
    title: { en: 'Always You', hinglish: 'Sirf Tum', hi: 'सदैव तुम' },
    detail: {
      en: 'In every crowded room and every quiet season ahead, my heart keeps choosing you.',
      hinglish: 'Har bheed mein aur aane wale har mausam mein, mera dil baar-baar tumhe hi chunta hai.',
      hi: 'हर भीड़ में और आने वाले हर मौसम में, मेरा हृदय बार-बार तुम्हें ही चुनता है।',
    },
  },
];

interface DreamDateOption {
  id: DreamDateId;
  code: string;
  artSrc: string;
  label: Record<CoreLanguageCode, string>;
  vibe: Record<CoreLanguageCode, string>;
}

const DREAM_DATE_OPTIONS: readonly DreamDateOption[] = [
  {
    id: 'coffee',
    code: 'DATE-01',
    artSrc: ART.warmChai,
    label: {
      en: 'Rainy Window Chai & Coffee',
      hinglish: 'Baarish Wali Chai-Coffee',
      hi: 'बारिश और गरम चाय-कॉफ़ी',
    },
    vibe: {
      en: 'Steaming mugs & slow talks',
      hinglish: 'Garam cup & lambi baatein',
      hi: 'गरम कप और लंबी बातें',
    },
  },
  {
    id: 'picnic',
    code: 'DATE-02',
    artSrc: ART.handsBouquet,
    label: {
      en: 'Garden Flowers & Picnic',
      hinglish: 'Garden Picnic & Phool',
      hi: 'बग़ीचे में फूल और पिकनिक',
    },
    vibe: {
      en: 'Golden sunlight & fresh blooms',
      hinglish: 'Sunahri dhoop & taaze phool',
      hi: 'सुनहरी धूप और ताज़े फूल',
    },
  },
  {
    id: 'terrace',
    code: 'DATE-03',
    artSrc: ART.moonlitTerrace,
    label: {
      en: 'Candlelit Terrace Evening',
      hinglish: 'Candlelight Terrace Shaam',
      hi: 'चाँदनी और दीपों भरी शाम',
    },
    vibe: {
      en: 'Fairy lights & quiet stars',
      hinglish: 'Fairy lights & sitare',
      hi: 'धीमी रोशनी और सितारे',
    },
  },
  {
    id: 'walk',
    code: 'DATE-04',
    artSrc: ART.goldenWalk,
    label: {
      en: 'Golden Hour Park Walk',
      hinglish: 'Sunset Walk Saath Mein',
      hi: 'सुनहरी शाम की सैर',
    },
    vibe: {
      en: 'Warm breeze & unhurried steps',
      hinglish: 'Thandi hawa & saath chalna',
      hi: 'ठंडी हवा और साथ चलना',
    },
  },
];

const VINYL_POSTCARDS: ReadonlyArray<{
  src: string;
  title: Record<CoreLanguageCode, string>;
  lyric: Record<CoreLanguageCode, string>;
}> = [
  {
    src: ART.moonlitTerrace,
    title: { en: 'Twilight Terrace', hinglish: 'Chaandni Terrace', hi: 'चाँदनी छत' },
    lyric: {
      en: 'Two warm cups, flickering candlelight, and nowhere else in the world I would rather be.',
      hinglish: 'Do garam cup, dheemi roshni, aur duniya mein kahin aur jaane ki khwahish nahi.',
      hi: 'दो गरम कप, दीपों की रोशनी और दुनिया में कहीं और जाने की इच्छा नहीं।',
    },
  },
  {
    src: ART.parisBalcony,
    title: { en: 'Evening Balcony', hinglish: 'Shaam Ki Balcony', hi: 'शाम का झरोखा' },
    lyric: {
      en: 'Every love song makes a little more sense whenever your hand is in mine.',
      hinglish: 'Har pyaara gaana tab aur khaas lagta hai jab tumhara haath mere haath mein ho.',
      hi: 'हर मधुर गीत तब और सुंदर लगता है जब तुम्हारा हाथ मेरे हाथ में हो।',
    },
  },
  {
    src: ART.roseCottage,
    title: { en: 'Rose Garden', hinglish: 'Gulaab Ka Baag', hi: 'गुलाब का बाग़' },
    lyric: {
      en: 'If I could bottle how calm you make me feel, I would keep it on my shelf forever.',
      hinglish: 'Tumhare saath jo sukoon milta hai, use hamesha apne paas sambhaal kar rakhna chahta hoon.',
      hi: 'तुम्हारे साथ जो शांति मिलती है, उसे सदैव संजोकर रखना चाहता हूँ।',
    },
  },
];

interface WillYouCopy {
  coverEyebrow: string;
  coverHeadline: string;
  tapSealPill: string;
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
  bouquetHeading: string;
  bouquetHint: string;
  bouquetCount: (n: number, total: number) => string;
  letterHeading: string;
  candleToggleOn: string;
  candleToggleOff: string;
  scrapbookHeading: string;
  scrapbookHint: string;
  vinylHeading: string;
  vinylSongTitle: string;
  vinylTap: string;
  vinylPlaying: string;
  proceedToAskCta: string;
  proposalEyebrow: string;
  proposalBanner: string;
  proposalQuestion: string;
  yesLabel: string;
  noLabel: string;
  nudgeIdle: string;
  nudgeCaptions: readonly [string, string, string, string];
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
    coverEyebrow: 'HAND-SEALED LOVE FOLIO',
    coverHeadline: 'I Made Something Quiet & Special For You',
    tapSealPill: 'Tap the rose wax seal',
    forPrefix: 'For',
    fromPrefix: 'With all my heart,',
    promptQuestion: 'Would you like to open what is inside?',
    promptYes: 'Yes, unseal the letter',
    promptNo: 'Maybe later',
    promptNoNudges: [
      'I picked fresh crimson roses and tied the ribbon just for you...',
      'Just one peek — the candles are already lit inside.',
      'Your table for two is waiting. Tap Yes to step in.',
    ],
    navKeepsakes: 'Keepsakes',
    navAsk: 'The Question',
    drawerEyebrow: 'CRIMSON VELVET & GINGHAM COLLECTION',
    drawerTitle: 'Four Keepsakes Prepared For You',
    drawerSub: 'Explore each piece below — tap the bouquet blooms, candles, photos, and evening vinyl.',
    openedProgress: (n, total) => `${n} / ${total} explored`,
    keepsakeLabels: {
      bouquet: { title: 'Rose Bouquet', tag: '4 Hidden Notes' },
      letter: { title: 'Candlelit Letter', tag: 'Handwritten' },
      scrapbook: { title: 'Memory Gallery', tag: 'Polaroid Roll' },
      vinyl: { title: 'Evening Vinyl', tag: 'Song & Postcards' },
    },
    bouquetHeading: 'Flowers For You — Tap Each Bloom',
    bouquetHint: 'Touch the glowing pins on the bouquet to read why my heart chose you.',
    bouquetCount: (n, total) => `${n} / ${total} blooms opened`,
    letterHeading: 'Written By Candlelight',
    candleToggleOn: 'Candlelight Glow: Lit',
    candleToggleOff: 'Light the Table Candles',
    scrapbookHeading: 'Frames I Want To Keep Forever',
    scrapbookHint: 'Tap any polaroid to view full-screen',
    vinylHeading: 'Our Evening Soundtrack & Postcards',
    vinylSongTitle: 'Twilight Rose Terrace · Side A',
    vinylTap: 'Spin Record & Play Melody',
    vinylPlaying: 'Spinning Side A...',
    proceedToAskCta: 'Step Onto The Candlelit Terrace',
    proposalEyebrow: 'A TABLE FOR TWO UNDER THE MOON',
    proposalBanner: 'Everything tonight was arranged with you in mind',
    proposalQuestion: 'Will you go out with me?',
    yesLabel: 'Yes, always',
    noLabel: 'No',
    nudgeIdle: 'Two warm cups and a quiet rose garden are waiting for us.',
    nudgeCaptions: [
      'Even the candles are hoping you say yes...',
      'I already brought crimson peonies for you.',
      'Wait — don’t walk away from our table for two!',
      'One tap on Yes makes this evening unforgettable.',
    ],
    acceptedEyebrow: 'EVENING KEEPSAKE · ADMIT TWO',
    acceptedStamp: 'SEALED WITH LOVE',
    acceptedTitle: (r) => `Our evening is officially set, ${r}`,
    acceptedSub: (s) => `${s} cannot stop smiling right now.`,
    datePickerTitle: 'Choose the scene for our first celebration',
    copyYesCta: 'Copy My YES Reply for WhatsApp',
    copiedYesToast: 'Copied! Ready to send straight back on WhatsApp.',
    petalShowerCta: 'Shower Rose Petals',
    revisitKeepsakesCta: 'Revisit Keepsakes',
    closeLabel: 'Close',
    photoLabel: 'Memory',
    defaultHeadline: 'Will you be mine?',
    defaultMessage:
      'Every ordinary evening turns warm and unforgettable the moment you are near. Let me steal you away for unhurried conversation, candlelight, and a memory we will keep forever.',
  },
  hinglish: {
    coverEyebrow: 'HAND-SEALED LOVE FOLIO',
    coverHeadline: 'Tumhare Liye Dil Se Kuch Khaas Banaya Hai',
    tapSealPill: 'Rose wax seal par tap karo',
    forPrefix: 'Sirf',
    fromPrefix: 'Poore dil se,',
    promptQuestion: 'Kya tum ise khol kar dekhogi?',
    promptYes: 'Haan, khat kholo',
    promptNo: 'Baad mein',
    promptNoNudges: [
      'Tumhare liye taaze gulaab aur ribbon khud sajaya hai...',
      'Bas ek jhalak dekho — andar candles jal rahi hain.',
      'Hamari shaam tumhara intezaar kar rahi hai. Haan par tap karo.',
    ],
    navKeepsakes: 'Keepsakes',
    navAsk: 'Dil Ka Sawaal',
    drawerEyebrow: 'CRIMSON VELVET & GINGHAM COLLECTION',
    drawerTitle: 'Tumhare Liye Chaar Khaas Tohfe',
    drawerSub: 'Har keepsake kholo — bouquet ke phool, candlelight khat, polaroids aur shaam ka vinyl.',
    openedProgress: (n, total) => `${n} / ${total} dekhe`,
    keepsakeLabels: {
      bouquet: { title: 'Gulaab Bouquet', tag: '4 Chhupe Notes' },
      letter: { title: 'Candlelight Khat', tag: 'Dil Se Likha' },
      scrapbook: { title: 'Yaadon Ki Gallery', tag: 'Polaroids' },
      vinyl: { title: 'Shaam Ka Vinyl', tag: 'Dhun & Postcards' },
    },
    bouquetHeading: 'Tumhare Liye Phool — Har Phool Par Tap Karo',
    bouquetHint: 'Bouquet par chamakte pins par tap karo aur dil ki baatein padho.',
    bouquetCount: (n, total) => `${n} / ${total} phool khole`,
    letterHeading: 'Candlelight Mein Likha Khat',
    candleToggleOn: 'Candlelight: Roshan',
    candleToggleOff: 'Table Candles Jalao',
    scrapbookHeading: 'Wo Pal Jo Hamesha Paas Rakhna Chahta Hoon',
    scrapbookHint: 'Full screen dekhne ke liye photo par tap karo',
    vinylHeading: 'Hamari Shaam Ki Dhun Aur Postcards',
    vinylSongTitle: 'Chaandni Gulaab Terrace · Side A',
    vinylTap: 'Vinyl Chalao',
    vinylPlaying: 'Side A Chal Raha Hai...',
    proceedToAskCta: 'Ab Chaandni Terrace Par Chalo',
    proposalEyebrow: 'CHAANDNI MEIN SIRF HUM DO',
    proposalBanner: 'Aaj ki poori shaam sirf tumhare liye sajayi hai',
    proposalQuestion: 'Kya tum mere saath date par chalogi?',
    yesLabel: 'Haan, bilkul',
    noLabel: 'Nahi',
    nudgeIdle: 'Do garam cup aur gulaabon se saja terrace hamara intezaar kar raha hai.',
    nudgeCaptions: [
      'Ye jalti hui candles bhi tumhari Haan ka intezaar kar rahi hain...',
      'Tumhare liye laal gulaab bhi laaya hoon.',
      'Ruko — hamari shaam se yu bhaag kar mat jao!',
      'Haan par ek tap aur ye raat yaadgaar ban jayegi.',
    ],
    acceptedEyebrow: 'EVENING KEEPSAKE · ADMIT TWO',
    acceptedStamp: 'PYAAR SE LOCKED',
    acceptedTitle: (r) => `Ye shaam hamari rahi, ${r}`,
    acceptedSub: (s) => `${s} ke chehre par abhi sabse pyaari muskaan hai.`,
    datePickerTitle: 'Hamari pehli date ka scene chuno',
    copyYesCta: 'Mera YES Reply Copy Karo (WhatsApp)',
    copiedYesToast: 'Copy ho gaya! Seedha WhatsApp par bhej do.',
    petalShowerCta: 'Gulaab Ki Pankhudiyan Barsao',
    revisitKeepsakesCta: 'Tohfe Phir Dekho',
    closeLabel: 'Band Karein',
    photoLabel: 'Yaad',
    defaultHeadline: 'Kya tum meri banogi?',
    defaultMessage:
      'Tumhare paas hote hi har aam shaam sunahri aur yaadgaar ban jaati hai. Chalo dheemi baatein, candlelight aur ek aisi shaam saath bitate hain jo hamesha yaad rahe.',
  },
  hi: {
    coverEyebrow: 'हस्तनिर्मित स्नेह पत्रिका',
    coverHeadline: 'तुम्हारे लिए हृदय से कुछ विशेष सजाया है',
    tapSealPill: 'गुलाब की मोहर पर टैप करें',
    forPrefix: 'प्रिय',
    fromPrefix: 'संपूर्ण हृदय से,',
    promptQuestion: 'क्या तुम भीतर छिपा उपहार खोलोगी?',
    promptYes: 'हाँ, पत्र खोलें',
    promptNo: 'अभी नहीं',
    promptNoNudges: [
      'ताज़े गुलाब और रेशमी रिबन सिर्फ़ तुम्हारे लिए सजाया है...',
      'बस एक झलक देखो — भीतर दीप प्रज्वलित हैं।',
      'हमारी शांत शाम तुम्हारी प्रतीक्षा कर रही है। हाँ पर टैप करें।',
    ],
    navKeepsakes: 'उपहार',
    navAsk: 'हृदय का प्रश्न',
    drawerEyebrow: 'मखमली एवं पुष्प स्मृति संग्रह',
    drawerTitle: 'तुम्हारे लिए चार विशेष उपहार',
    drawerSub: 'प्रत्येक स्मृति खोलें — गुलाब गुलदस्ते के संदेश, दीपों का पत्र, तस्वीरें और संध्या की धुन।',
    openedProgress: (n, total) => `${n} / ${total} देखे गए`,
    keepsakeLabels: {
      bouquet: { title: 'गुलाब गुलदस्ता', tag: '4 छिपे संदेश' },
      letter: { title: 'संध्या पत्र', tag: 'हस्तलिखित' },
      scrapbook: { title: 'स्मृति गैलरी', tag: 'तस्वीरें' },
      vinyl: { title: 'संध्या विनाइल', tag: 'धुन व पोस्टकार्ड' },
    },
    bouquetHeading: 'तुम्हारे लिए फूल — प्रत्येक फूल पर टैप करें',
    bouquetHint: 'गुलदस्ते पर चमकते बिंदुओं को स्पर्श करें और हृदय की बातें पढ़ें।',
    bouquetCount: (n, total) => `${n} / ${total} फूल खोले गए`,
    letterHeading: 'दीपों की रोशनी में लिखा पत्र',
    candleToggleOn: 'दीप ज्योति: प्रज्वलित',
    candleToggleOff: 'मेज़ के दीप जलाएँ',
    scrapbookHeading: 'वे पल जिन्हें सदैव संजोना चाहता हूँ',
    scrapbookHint: 'बड़ा देखने के लिए तस्वीर पर टैप करें',
    vinylHeading: 'हमारी संध्या की धुन और दृश्य',
    vinylSongTitle: 'चाँदनी गुलाब छत · साइड A',
    vinylTap: 'मधुर धुन चलाएँ',
    vinylPlaying: 'धुन बज रही है...',
    proceedToAskCta: 'चाँदनी छत पर चलिए',
    proposalEyebrow: 'चाँदनी में हमारे लिए सजी मेज़',
    proposalBanner: 'आज की यह संपूर्ण संध्या केवल तुम्हारे लिए सजाई है',
    proposalQuestion: 'क्या तुम मेरे साथ चलोगी?',
    yesLabel: 'हाँ, सदैव',
    noLabel: 'नहीं',
    nudgeIdle: 'दो गरम कप और गुलाबों से सजा झरोखा हमारी प्रतीक्षा कर रहा है।',
    nudgeCaptions: [
      'ये जलते हुए दीप भी तुम्हारी हाँ की प्रतीक्षा कर रहे हैं...',
      'तुम्हारे लिए ताज़े गुलाब भी सजाकर लाया हूँ।',
      'रुको — इस प्यारी शाम से यूँ दूर मत जाओ!',
      'हाँ पर एक स्पर्श इस संध्या को अविस्मरणीय बना देगा।',
    ],
    acceptedEyebrow: 'संध्या स्मृति टिकट · केवल हमारे लिए',
    acceptedStamp: 'स्नेह से स्वीकृत',
    acceptedTitle: (r) => `यह शाम हमारी रही, ${r}`,
    acceptedSub: (s) => `${s} के चेहरे पर अभी सबसे प्यारी मुस्कान है।`,
    datePickerTitle: 'हमारी पहली ख़ास मुलाक़ात का दृश्य चुनें',
    copyYesCta: 'मेरा हाँ जवाब कॉपी करें (WhatsApp)',
    copiedYesToast: 'कॉपी हो गया! सीधे WhatsApp पर भेज दें।',
    petalShowerCta: 'गुलाब की पंखुड़ियाँ बरसाएँ',
    revisitKeepsakesCta: 'उपहार फिर देखें',
    closeLabel: 'बंद करें',
    photoLabel: 'याद',
    defaultHeadline: 'क्या तुम मेरी बनोगी?',
    defaultMessage:
      'तुम्हारे पास होने से हर साधारण शाम सुनहरी और अविस्मरणीय बन जाती है। आइए धीमी बातें, दीपों की रोशनी और एक प्यारी शाम साथ बिताते हैं।',
  },
};

const RUNAWAY_SPOTS = [
  { x: 0, y: 0 },
  { x: 42, y: -16 },
  { x: -46, y: -14 },
  { x: 38, y: 18 },
  { x: -38, y: 16 },
  { x: 24, y: -22 },
] as const;

const BURST_PETALS = Array.from({ length: 24 }, (_, idx) => {
  const angle = (idx / 24) * 360;
  const dist = 76 + (idx % 4) * 34;
  return {
    angle,
    dist,
    delay: `${(idx % 6) * 55}ms`,
    color: idx % 3 === 0 ? '#E11D48' : idx % 3 === 1 ? '#FDE68A' : '#FDA4AF',
  };
});

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

/**
 * Art-Driven Luxury Romance Folio ("Will You" — `will-you-01`).
 * Anchored by 3 bespoke fine-art illustrations (burgundy velvet wax-sealed envelope,
 * golden-hour peony & rose bouquet on red gingham, candlelit twilight garden terrace):
 * interactive wax-seal cover, 4 rich visual keepsakes (hotspot-pinned bouquet, candlelit
 * letter with ambient light toggle, polaroid gallery + lightbox, spinning vinyl & scene
 * postcards), twilight terrace proposal with runaway No, and photo-backed Dream Date ticket.
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
  const [activeKeepsake, setActiveKeepsake] = useState<KeepsakeId>('bouquet');
  const [openedKeepsakes, setOpenedKeepsakes] = useState<KeepsakeId[]>(['bouquet']);
  const [activeBloomIdx, setActiveBloomIdx] = useState<number>(0);
  const [discoveredBlooms, setDiscoveredBlooms] = useState<number[]>([0]);
  const [candlesLit, setCandlesLit] = useState(true);
  const [activePostcardIdx, setActivePostcardIdx] = useState(0);
  const [nudgeCount, setNudgeCount] = useState(0);
  const [selectedDateId, setSelectedDateId] = useState<DreamDateId>('terrace');
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
        const sample = SAMPLE_POLAROIDS[idx];
        if (customSrc) {
          return {
            src: customSrc,
            caption: `${copy.photoLabel} 0${idx + 1}`,
            momentTag: sample.momentTag[coreLang],
          };
        }
        return {
          src: sample.src,
          caption: sample.caption[coreLang],
          momentTag: sample.momentTag[coreLang],
        };
      });
    }
    return SAMPLE_POLAROIDS.map((sample) => ({
      src: sample.src,
      caption: sample.caption[coreLang],
      momentTag: sample.momentTag[coreLang],
    }));
  }, [copy.photoLabel, coreLang, data.photos]);

  const bloomNotes = useMemo(() => {
    const customHighlights = data.highlights ?? [];
    return BOUQUET_HOTSPOTS.map((spot, idx) => {
      const h = customHighlights[idx];
      if (h) {
        const t = pickLocalizedText(h.title, language).trim();
        const d = pickLocalizedText(h.detail, language).trim();
        if (t || d) {
          return {
            ...spot,
            titleText: t || spot.title[coreLang],
            detailText: d || spot.detail[coreLang],
          };
        }
      }
      return {
        ...spot,
        titleText: spot.title[coreLang],
        detailText: spot.detail[coreLang],
      };
    });
  }, [coreLang, data.highlights, language]);

  const selectedDateObj =
    DREAM_DATE_OPTIONS.find((d) => d.id === selectedDateId) ?? DREAM_DATE_OPTIONS[2];
  const activeBloom = bloomNotes[activeBloomIdx] ?? bloomNotes[0];
  const activePostcard = VINYL_POSTCARDS[activePostcardIdx] ?? VINYL_POSTCARDS[0];

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
    playLanternPullChime();
    setStage('keepsakes');
    notifyOpenedOnce();
  }, [notifyOpenedOnce]);

  const handleSelectKeepsake = useCallback((id: KeepsakeId, idx: number) => {
    playPaperUnsealSfx(idx + 1);
    setActiveKeepsake(id);
    setOpenedKeepsakes((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const handleTapBloom = useCallback((idx: number) => {
    playPaperUnsealSfx(idx);
    setActiveBloomIdx(idx);
    setDiscoveredBlooms((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
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
          : `YES, always ${senderDisplay}! I chose "${chosenDateLabel}" on our keepsake date ticket.`;
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

  const nudgeLine =
    nudgeCount === 0
      ? copy.nudgeIdle
      : copy.nudgeCaptions[(nudgeCount - 1) % copy.nudgeCaptions.length];
  const dodgeSpot = RUNAWAY_SPOTS[nudgeCount % RUNAWAY_SPOTS.length];
  const yesScale = Math.min(1.14, 1 + nudgeCount * 0.03);
  const isGinghamStage = stage === 'keepsakes';

  const keepsakeThumbs: Record<KeepsakeId, string> = {
    bouquet: ART.handsBouquet,
    letter: ART.velvetEnvelope,
    scrapbook: polaroids[0]?.src || ART.parisBalcony,
    vinyl: ART.moonlitTerrace,
  };

  return (
    <div
      className="relative flex min-h-full w-full flex-col overflow-x-clip rounded-[28px] transition-colors duration-500"
      style={
        isGinghamStage
          ? {
              backgroundColor: '#FBF3E8',
              backgroundImage:
                'linear-gradient(90deg, rgba(160, 32, 42, 0.14) 50%, transparent 50%), linear-gradient(rgba(160, 32, 42, 0.14) 50%, transparent 50%)',
              backgroundSize: '34px 34px',
            }
          : {
              background:
                'radial-gradient(ellipse 90% 60% at 50% 15%, #5C0D1B 0%, #3A0710 55%, #1E0409 100%)',
            }
      }
    >
      <style>{`
        @keyframes wy3-fade-${uid} {
          0% { opacity: 0; transform: translateY(10px) scale(0.985); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wy3-pulse-ring-${uid} {
          0% { transform: scale(0.92); opacity: 0.9; }
          70% { transform: scale(1.45); opacity: 0; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes wy3-spin-${uid} {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes wy3-burst-${uid} {
          0% { transform: translate(-50%, -50%) translate(0px, 0px) scale(0.35) rotate(0deg); opacity: 1; }
          75% { opacity: 0.92; }
          100% { transform: translate(-50%, -50%) translate(var(--wy3-tx), var(--wy3-ty)) scale(1.1) rotate(180deg); opacity: 0; }
        }
        .wy3-fade-${uid} { animation: wy3-fade-${uid} 440ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .wy3-pulse-${uid} { animation: wy3-pulse-ring-${uid} 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        .wy3-spin-${uid} { animation: wy3-spin-${uid} 10s linear infinite; }
        .wy3-burst-${uid} { animation: wy3-burst-${uid} 1350ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .wy3-fade-${uid}, .wy3-pulse-${uid}, .wy3-spin-${uid}, .wy3-burst-${uid} {
            animation: none !important;
          }
        }
      `}</style>

      {watermarked ? (
        <div
          aria-hidden="true"
          className="relative z-30 flex justify-center border-b border-[#E5CFAF]/30 bg-[#2B050B]/95 py-1 font-mono text-[10px] font-bold tracking-[0.18em] text-[#FDE68A]"
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      {/* Top Navigation Bar on Unlocked Stages */}
      {stage !== 'cover' ? (
        <div className="relative z-20">
          <div
            className={`flex items-center justify-between gap-2 px-4 py-2.5 ${
              isGinghamStage
                ? 'bg-[#FAF2E4] text-[#4A0912]'
                : 'border-b border-[#FAF2E4]/15 bg-[#2B050B]/80 text-[#FAF2E4] backdrop-blur-md'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStage('keepsakes')}
                className={`min-h-[36px] rounded-full px-3 text-xs font-bold transition ${
                  stage === 'keepsakes'
                    ? 'bg-[#8F1522] text-[#FAF2E4]'
                    : isGinghamStage
                      ? 'border border-[#D4BC9E] bg-white text-[#5C1A22]'
                      : 'border border-white/20 bg-white/10 text-[#FAF2E4]'
                }`}
              >
                {copy.navKeepsakes}
              </button>
              <button
                type="button"
                onClick={() => setStage('proposal')}
                className={`min-h-[36px] rounded-full px-3 text-xs font-bold transition ${
                  stage === 'proposal' || stage === 'accepted'
                    ? 'bg-[#8F1522] text-[#FAF2E4]'
                    : isGinghamStage
                      ? 'border border-[#D4BC9E] bg-white text-[#5C1A22]'
                      : 'border border-white/20 bg-white/10 text-[#FAF2E4]'
                }`}
              >
                {copy.navAsk}
              </button>
            </div>
            <button
              type="button"
              onClick={handleReplay}
              className={`inline-flex min-h-[36px] items-center rounded-full border px-3 text-[11px] font-semibold transition ${
                isGinghamStage
                  ? 'border-[#D4BC9E] bg-white text-[#5C1A22] hover:bg-[#F5E9D6]'
                  : 'border-white/20 bg-white/10 text-[#FAF2E4] hover:bg-white/15'
              }`}
            >
              {getReplayLabel(language)}
            </button>
          </div>
          {isGinghamStage ? <CrochetLaceTrim /> : null}
        </div>
      ) : null}

      {/* Petal Celebration Burst */}
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
                className={`wy3-burst-${uid} absolute left-1/2 top-1/2`}
                style={
                  {
                    '--wy3-tx': tx,
                    '--wy3-ty': ty,
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
          STAGE 1: FULL-BLEED BURGUNDY VELVET & WAX-SEALED ENVELOPE COVER
         ===================================================================== */}
      {stage === 'cover' ? (
        <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-6 text-center text-[#FAF2E4]">
          <span
            style={hindiSafe}
            className={`inline-flex items-center gap-2 rounded-full border border-[#FDE68A]/35 bg-[#26040A]/80 px-3.5 py-1 text-[10px] font-bold text-[#FDE68A] ${
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

          {/* Full-Bleed Fine-Art Velvet Envelope Plate with Interactive Wax Seal Hotspot */}
          <button
            type="button"
            onClick={handleOpenBox}
            className="group relative w-full overflow-hidden rounded-[24px] border-2 border-[#E5CFAF]/55 bg-[#2B050B] shadow-[0_28px_60px_-14px_rgba(0,0,0,0.82)] transition duration-300 hover:border-[#FDE68A]/80 active:scale-[0.99]"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ART.velvetEnvelope}
                alt="Hand-sealed cream cotton envelope with crimson rose wax seal on burgundy damask velvet"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#24040A]/90 via-transparent to-[#24040A]/25"
              />

              {/* Pulsing Wax Seal Touch Ring centered over the sculpted crimson wax seal */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <span className={`wy3-pulse-${uid} block h-14 w-14 rounded-full border-2 border-[#FDE68A]`} />
              </span>

              {/* Bottom Recipient Nameplate Ribbon */}
              <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-left">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#FDE68A]/90">
                    {copy.forPrefix}
                  </p>
                  <p
                    style={hindiSafe}
                    className={`truncate font-heading text-xl font-bold text-[#FFF8EF] ${
                      isHindi || hasDevanagari(receiverDisplay) ? 'not-italic' : 'italic'
                    }`}
                  >
                    {receiverDisplay}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-[#FDE68A]/55 bg-[#4A0912]/90 px-3 py-1 text-[10.5px] font-bold text-[#FDE68A] backdrop-blur-xs">
                  {copy.tapSealPill}
                </span>
              </div>
            </div>
          </button>

          {/* Twine-Tied Cream Stationery Prompt */}
          <div className="w-full rounded-[20px] border border-[#E5CFAF]/75 bg-[#FAF2E4] px-5 py-4 text-[#3B181E] shadow-xl">
            <p className="text-[11px] font-semibold text-[#8F1522]">
              {copy.fromPrefix} {senderDisplay}
            </p>
            <p
              style={hindiSafe}
              className={`mt-1 font-heading text-base font-bold text-[#4A0912] ${
                isHindi ? 'not-italic' : 'italic'
              }`}
            >
              {copy.promptQuestion}
            </p>

            <div className="mt-3.5 flex gap-2">
              <button
                type="button"
                onClick={handleOpenBox}
                className="inline-flex min-h-[46px] flex-1 items-center justify-center rounded-full bg-[#8F1522] px-4 py-2 text-xs font-bold text-[#FFF8EF] shadow-sm transition hover:bg-[#74101B] active:scale-[0.98]"
              >
                {copy.promptYes}
              </button>
              <button
                type="button"
                onClick={() => {
                  playPaperUnsealSfx(coverNoCount);
                  setCoverNoCount((c) => c + 1);
                }}
                className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[#C6A984] bg-white px-4 py-2 text-xs font-semibold text-[#6B3B40] transition hover:bg-[#F5E9D6]"
              >
                {copy.promptNo}
              </button>
            </div>

            {coverNoCount > 0 ? (
              <p role="status" style={hindiSafe} className="mt-2.5 text-xs font-semibold text-[#8F1522]">
                {copy.promptNoNudges[(coverNoCount - 1) % copy.promptNoNudges.length]}
              </p>
            ) : null}
          </div>
        </main>
      ) : null}

      {/* =====================================================================
          STAGE 2: VISUAL KEEPSAKE TABLE ON FRENCH RED GINGHAM & LACE
         ===================================================================== */}
      {stage === 'keepsakes' ? (
        <main className={`wy3-fade-${uid} relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-5 text-[#3B181E]`}>
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

          {/* 4 Visual Art-Plate Keepsake Selector Cards (2x2) */}
          <section aria-label={copy.drawerTitle} className="grid grid-cols-2 gap-2.5">
            {(['bouquet', 'letter', 'scrapbook', 'vinyl'] as const).map((id, idx) => {
              const selected = activeKeepsake === id;
              const opened = openedKeepsakes.includes(id);
              const meta = copy.keepsakeLabels[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectKeepsake(id, idx)}
                  aria-pressed={selected}
                  className={`group relative overflow-hidden rounded-[18px] border-2 bg-[#FFFDF9] p-1.5 text-left transition-all duration-200 active:scale-[0.98] ${
                    selected
                      ? 'border-[#8F1522] shadow-[0_14px_26px_-12px_rgba(143,21,34,0.45)]'
                      : 'border-[#DFC7A5] hover:border-[#8F1522]/60'
                  }`}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#4A0912]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={keepsakeThumbs[id]}
                      alt={meta.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {opened ? (
                      <span
                        aria-hidden="true"
                        className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#8F1522] text-white shadow-xs"
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
                  </div>
                  <div className="px-1.5 pb-1 pt-2">
                    <p style={hindiSafe} className="font-heading text-xs font-bold text-[#4A0912]">
                      {meta.title}
                    </p>
                    <p className="text-[10px] font-semibold text-[#8F1522]/80">{meta.tag}</p>
                  </div>
                </button>
              );
            })}
          </section>

          {/* ACTIVE KEEPSAKE EXPERIENCE STAGE */}
          <section className="relative overflow-hidden rounded-[24px] border-2 border-[#DFC7A5] bg-[#FFFDF8] p-4 shadow-[0_20px_40px_-18px_rgba(74,9,18,0.35)] sm:p-5">
            {/* 1. INTERACTIVE BOUQUET WITH FLOATING HOTSPOT PINS */}
            {activeKeepsake === 'bouquet' ? (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3
                      style={hindiSafe}
                      className={`font-heading text-lg font-bold text-[#4A0912] ${
                        isHindi ? 'not-italic' : 'italic'
                      }`}
                    >
                      {copy.bouquetHeading}
                    </h3>
                    <p style={hindiSafe} className="text-[11.5px] text-[#6B3B40]">
                      {copy.bouquetHint}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#DFC7A5] bg-[#FAF2E4] px-2.5 py-1 font-mono text-[10px] font-bold text-[#8F1522]">
                    {copy.bouquetCount(discoveredBlooms.length, 4)}
                  </span>
                </div>

                {/* Full-Bleed Bouquet Painting with 4 Interactive Glowing Botanical Pins */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#DFC7A5] bg-[#4A0912]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ART.handsBouquet}
                    alt="Hand-tied crimson peony and blush rose bouquet on red gingham"
                    className="h-full w-full object-cover"
                  />
                  {bloomNotes.map((spot, idx) => {
                    const isCurrent = activeBloomIdx === idx;
                    const isSeen = discoveredBlooms.includes(idx);
                    return (
                      <button
                        key={spot.id}
                        type="button"
                        onClick={() => handleTapBloom(idx)}
                        aria-label={`${spot.bloomName[coreLang]} — ${spot.titleText}`}
                        style={{ left: `${spot.leftPct}%`, top: `${spot.topPct}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none"
                      >
                        {!isSeen ? (
                          <span
                            aria-hidden="true"
                            className={`wy3-pulse-${uid} absolute inset-0 rounded-full bg-[#FDE68A]`}
                          />
                        ) : null}
                        <span
                          className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 font-mono text-xs font-extrabold shadow-lg transition-transform ${
                            isCurrent
                              ? 'scale-110 border-[#FFFDF8] bg-[#8F1522] text-[#FDE68A]'
                              : 'border-[#FFFDF8] bg-[#FAF2E4]/95 text-[#8F1522] hover:scale-105'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Bloom Revealed Secret Card */}
                <div
                  role="status"
                  className="rounded-2xl border border-[#DFC7A5] bg-[#FBF6EC] px-4 py-3.5 text-center"
                >
                  <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#8F1522]/80">
                    0{activeBloomIdx + 1} · {activeBloom.bloomName[coreLang]}
                  </span>
                  <h4 style={hindiSafe} className="mt-1 font-heading text-base font-bold text-[#4A0912]">
                    {activeBloom.titleText}
                  </h4>
                  <p
                    style={hindiSafe}
                    className="mt-1 font-serif text-[13.5px] leading-relaxed text-[#4A252B]"
                  >
                    {activeBloom.detailText}
                  </p>
                </div>
              </div>
            ) : null}

            {/* 2. CANDLELIT LETTER WITH INTERACTIVE AMBIENT GLOW */}
            {activeKeepsake === 'letter' ? (
              <div className="space-y-3.5 text-center">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#DFC7A5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ART.velvetEnvelope}
                    alt="Candlelit velvet desk with sealed love letter"
                    className={`h-full w-full object-cover transition duration-700 ${
                      candlesLit ? 'brightness-105 saturate-110' : 'brightness-75 saturate-75'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      playPaperUnsealSfx(candlesLit ? 0 : 2);
                      setCandlesLit((v) => !v);
                    }}
                    className="absolute bottom-2.5 right-2.5 inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-[#FDE68A]/60 bg-[#2B050B]/85 px-3.5 py-1 text-[11px] font-bold text-[#FDE68A] backdrop-blur-xs transition hover:bg-[#4A0912]"
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        candlesLit ? 'bg-[#FDE68A] shadow-[0_0_8px_#FDE68A]' : 'bg-white/30'
                      }`}
                    />
                    <span>{candlesLit ? copy.candleToggleOn : copy.candleToggleOff}</span>
                  </button>
                </div>

                <div
                  className="rounded-2xl border border-[#EFE2CE] p-4 transition-all duration-700"
                  style={{
                    background: candlesLit
                      ? 'radial-gradient(circle at 50% 0%, #FFF7E0 0%, #FBF5E8 65%, #F6ECDA 100%)'
                      : '#FAF6F0',
                  }}
                >
                  <span
                    style={hindiSafe}
                    className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#8F1522]"
                  >
                    {copy.letterHeading}
                  </span>
                  <h3
                    style={hindiSafe}
                    className={`mt-1.5 break-words font-heading text-2xl font-bold leading-snug text-[#4A0912] ${
                      isHindi || hasDevanagari(headlineText) ? 'not-italic' : 'italic'
                    }`}
                  >
                    {headlineText}
                  </h3>
                  <div className="mx-auto my-3 h-px w-16 bg-[#D8C2A6]" aria-hidden="true" />
                  <p
                    style={hindiSafe}
                    className="break-words font-serif text-[15px] leading-relaxed text-[#4A252B]"
                  >
                    {messageText}
                  </p>
                  <p className="mt-4 font-heading text-sm font-bold italic text-[#8F1522]">
                    {copy.fromPrefix} {senderDisplay}
                  </p>
                </div>
              </div>
            ) : null}

            {/* 3. VISUAL MEMORY GALLERY & POLAROID TABLE */}
            {activeKeepsake === 'scrapbook' ? (
              <div className="space-y-3.5 text-center">
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

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {polaroids.map((item, idx) => {
                    const isFailed = Boolean(failedPhotos[item.src]);
                    const tilts = ['sm:-rotate-2', 'sm:rotate-1', 'sm:rotate-2'] as const;
                    return (
                      <button
                        key={`scrap-photo-${idx}`}
                        type="button"
                        onClick={() => !isFailed && setZoomIdx(idx)}
                        className={`group relative flex flex-col rounded-xl border border-[#D8C2A6] bg-white p-2 pb-3 text-left shadow-md transition hover:z-10 hover:rotate-0 hover:scale-[1.03] active:scale-95 ${tilts[idx % 3]}`}
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#4A0912] sm:aspect-square">
                          {!isFailed ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={item.src}
                              alt={item.caption}
                              loading="lazy"
                              onError={() =>
                                setFailedPhotos((prev) => ({ ...prev, [item.src]: true }))
                              }
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#FDE68A]">
                              0{idx + 1}
                            </div>
                          )}
                        </div>
                        <span className="mt-2 font-mono text-[8.5px] font-bold tracking-[0.14em] text-[#8F1522]/75">
                          {item.momentTag}
                        </span>
                        <span className="truncate font-heading text-xs font-bold italic text-[#4A0912]">
                          {item.caption}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* 4. SPINNING VINYL & VISUAL SCENE POSTCARDS */}
            {activeKeepsake === 'vinyl' ? (
              <div className="space-y-4">
                <h3
                  style={hindiSafe}
                  className={`text-center font-heading text-xl font-bold text-[#4A0912] ${
                    isHindi ? 'not-italic' : 'italic'
                  }`}
                >
                  {copy.vinylHeading}
                </h3>

                {/* Visual Postcard Viewer with Spinning Vinyl Badge */}
                <div className="relative overflow-hidden rounded-2xl border border-[#DFC7A5] bg-[#2B050B]">
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activePostcard.src}
                      alt={activePostcard.title[coreLang]}
                      className="h-full w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#24040A]/90 via-[#24040A]/25 to-transparent"
                    />
                    {/* Spinning Mini Vinyl Record Overlay */}
                    <div
                      aria-hidden="true"
                      className={`wy3-spin-${uid} absolute right-3 top-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#E5CFAF]/75 bg-[#1C1414] shadow-lg`}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#BE123C] text-[8px] font-bold text-[#FAF2E4]">
                        {senderInitial}&amp;{receiverInitial}
                      </div>
                    </div>
                    <div className="absolute inset-x-3.5 bottom-3 text-left text-[#FFF8EF]">
                      <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#FDE68A]">
                        {activePostcard.title[coreLang]}
                      </p>
                      <p
                        style={hindiSafe}
                        className="mt-0.5 font-serif text-xs leading-relaxed text-[#FFF8EF]/95"
                      >
                        {activePostcard.lyric[coreLang]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3 Postcard Scene Switcher Pills */}
                <div className="grid grid-cols-3 gap-1.5">
                  {VINYL_POSTCARDS.map((card, idx) => (
                    <button
                      key={`pc-${idx}`}
                      type="button"
                      onClick={() => {
                        playPaperUnsealSfx(idx);
                        setActivePostcardIdx(idx);
                      }}
                      className={`min-h-[38px] rounded-full border px-2 text-[11px] font-bold transition ${
                        activePostcardIdx === idx
                          ? 'border-[#8F1522] bg-[#8F1522] text-[#FFF8EF]'
                          : 'border-[#DFC7A5] bg-[#FAF2E4] text-[#5C1A22]'
                      }`}
                    >
                      {card.title[coreLang]}
                    </button>
                  ))}
                </div>

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

          <button
            type="button"
            onClick={() => {
              playLanternPullChime();
              setStage('proposal');
            }}
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#FAF2E4] bg-[#4A0912] px-6 py-3 text-sm font-bold text-[#FFF8EF] shadow-[0_14px_30px_-10px_rgba(74,9,18,0.65)] transition hover:bg-[#640D19] active:scale-[0.98]"
          >
            <span>{copy.proceedToAskCta}</span>
          </button>
        </main>
      ) : null}

      {/* =====================================================================
          STAGE 3: CANDLELIT TWILIGHT TERRACE PROPOSAL (CINEMATIC FINE ART)
         ===================================================================== */}
      {stage === 'proposal' ? (
        <main className={`wy3-fade-${uid} relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-6 text-center text-[#FAF2E4]`}>
          <section className="w-full overflow-hidden rounded-[26px] border-2 border-[#E5CFAF]/65 bg-[#FAF2E4] text-[#3B181E] shadow-[0_28px_60px_-14px_rgba(0,0,0,0.82)]">
            {/* Full-Bleed Moonlit Candlelit Terrace Painting */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1E0409]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ART.moonlitTerrace}
                alt="Candlelit twilight balcony terrace table for two surrounded by blooming roses and fairy lights"
                className="h-full w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#24040A]/85 via-transparent to-transparent"
              />
              <div className="absolute inset-x-4 bottom-3 text-center">
                <span
                  style={hindiSafe}
                  className={`inline-block rounded-full border border-[#FDE68A]/50 bg-[#2B050B]/80 px-3 py-0.5 text-[9.5px] font-bold text-[#FDE68A] backdrop-blur-xs ${
                    isHindi ? '' : 'font-mono uppercase tracking-[0.18em]'
                  }`}
                >
                  {copy.proposalEyebrow}
                </span>
              </div>
            </div>

            <div className="px-5 py-6">
              <p style={hindiSafe} className="font-serif text-xs font-semibold text-[#8F1522]">
                {copy.proposalBanner}
              </p>
              <h2
                style={hindiSafe}
                className={`mt-1.5 break-words font-heading text-2xl font-bold text-[#4A0912] sm:text-[28px] ${
                  isHindi ? 'not-italic' : 'italic'
                }`}
              >
                {copy.proposalQuestion}
              </h2>
              <p style={hindiSafe} className="mt-2 font-serif text-xs leading-relaxed text-[#6B3B40]">
                {nudgeLine}
              </p>

              <div className="relative mt-5 flex min-h-[96px] flex-wrap items-center justify-center gap-3.5 px-2 py-2">
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
                  className="relative z-10 inline-flex min-h-[44px] min-w-[78px] items-center justify-center rounded-full border border-[#C6A984] bg-white px-4 py-2 text-xs font-semibold text-[#5C3136] transition-transform duration-300 ease-out hover:bg-[#F5E9D6]"
                >
                  {copy.noLabel}
                </button>
              </div>
            </div>
          </section>
        </main>
      ) : null}

      {/* =====================================================================
          STAGE 4: ACCEPTED GRAND KEEPSAKE TICKET & PHOTO-BACKED DREAM DATES
         ===================================================================== */}
      {stage === 'accepted' ? (
        <main className={`wy3-fade-${uid} relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-6 text-[#FAF2E4]`}>
          <section className="w-full overflow-hidden rounded-[26px] border-2 border-[#E5CFAF]/75 bg-[#FAF2E4] text-[#3B181E] shadow-[0_28px_60px_-14px_rgba(0,0,0,0.82)]">
            {/* Chosen Dream Date Live Art Banner */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#2B050B]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedDateObj.artSrc}
                alt={selectedDateObj.label[coreLang]}
                className="h-full w-full object-cover transition duration-500"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#24040A]/85 via-transparent to-[#24040A]/30"
              />
              <div className="absolute inset-x-4 top-3 flex items-center justify-between gap-2">
                <span className="rounded-full border border-[#FDE68A]/50 bg-[#2B050B]/80 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#FDE68A]">
                  {copy.acceptedEyebrow}
                </span>
                <span className="-rotate-2 rounded border border-[#FDE68A] bg-[#8F1522]/90 px-2 py-0.5 font-mono text-[9px] font-bold text-[#FFF8EF]">
                  {copy.acceptedStamp}
                </span>
              </div>
              <div className="absolute inset-x-4 bottom-3 text-left text-[#FFF8EF]">
                <p className="font-mono text-[9.5px] font-bold text-[#FDE68A]">
                  {selectedDateObj.code} · {selectedDateObj.label[coreLang]}
                </p>
              </div>
            </div>

            <div className="p-5">
              <h2
                style={hindiSafe}
                className={`break-words font-heading text-2xl font-bold leading-snug text-[#4A0912] ${
                  isHindi || hasDevanagari(receiverDisplay) ? 'not-italic' : 'italic'
                }`}
              >
                {copy.acceptedTitle(receiverDisplay)}
              </h2>
              <p style={hindiSafe} className="mt-1 text-xs leading-relaxed text-[#6B3B40]">
                {copy.acceptedSub(senderDisplay)}
              </p>

              {/* 4 Visual Photo-Thumbnailed Dream Date Picker Cards */}
              <div className="mt-4 space-y-2">
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
                        className={`overflow-hidden rounded-xl border-2 text-left transition active:scale-[0.98] ${
                          picked
                            ? 'border-[#8F1522] bg-[#8F1522] text-[#FFF8EF]'
                            : 'border-[#DFC7A5] bg-white text-[#4A0912] hover:border-[#8F1522]/50'
                        }`}
                      >
                        <div className="aspect-[16/9] w-full overflow-hidden bg-[#2B050B]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={opt.artSrc}
                            alt={opt.label[coreLang]}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <span className="block text-[11px] font-bold leading-snug">
                            {opt.label[coreLang]}
                          </span>
                          <span
                            className={`mt-0.5 block text-[9.5px] ${
                              picked ? 'text-[#FDE68A]' : 'text-[#7A4B50]'
                            }`}
                          >
                            {opt.vibe[coreLang]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Perforated Tear Line */}
              <div className="relative my-4 flex items-center" aria-hidden="true">
                <span className="-ml-8 h-6 w-6 shrink-0 rounded-full bg-[#3A0710]" />
                <span className="w-full border-t-2 border-dashed border-[#C6A984]" />
                <span className="-mr-8 h-6 w-6 shrink-0 rounded-full bg-[#3A0710]" />
              </div>

              <div className="space-y-2.5 text-center">
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
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-[#8F1522]/35 bg-white px-4 text-xs font-bold text-[#8F1522] transition hover:bg-[#F5E9D6]"
                  >
                    {copy.petalShowerCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage('keepsakes')}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-[#C6A984] bg-white px-4 text-xs font-semibold text-[#5C3136] transition hover:bg-[#F5E9D6]"
                  >
                    {copy.revisitKeepsakesCta}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : null}

      {isGinghamStage ? (
        <div className="relative z-20 mt-auto">
          <CrochetLaceTrim flip />
          <footer className="bg-[#FAF2E4] px-4 py-3 text-center text-[11px] font-medium text-[#6B3B40]">
            {getWebzyFooterLabel(language)}
          </footer>
        </div>
      ) : (
        <footer className="relative z-10 mt-auto border-t border-[#FAF2E4]/15 bg-[#1E0409]/80 px-4 py-3 text-center text-[11px] text-[#FAF2E4]/75">
          {getWebzyFooterLabel(language)}
        </footer>
      )}

      {/* Portaled Full-Screen Photo Lightbox */}
      {zoomIdx !== null && polaroids[zoomIdx] && typeof document !== 'undefined'
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={polaroids[zoomIdx].caption}
              onClick={() => setZoomIdx(null)}
              className="fixed inset-0 z-[120] flex items-center justify-center bg-[#1E0409]/88 p-4 backdrop-blur-xs"
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
