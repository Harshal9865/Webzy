'use client';

import React, { useEffect, useId, useState } from 'react';
import {
  type CoreLanguageCode,
  pickLocalizedText,
  toCoreLanguageCode,
} from '@webzy/core';
import {
  AmbientRainCanvas,
  type CurvedTrackItem,
  CurvedTrackSanctuary,
  HoldToChargeRing,
  WordByWordFadeLine,
} from './shared/OccasionCinematicFX';
import {
  getReplayLabel,
  getWebzyFooterLabel,
  OccasionAdaptiveGallery,
  OccasionArtworkBackdrop,
  type OccasionSiteProps,
} from './shared/OccasionPrimitives';

type FestivalKey = 'sankranti' | 'lohri' | 'pongal';
type SweetKey = 'tilgul' | 'gajak' | 'pongalSweet';

interface FestivalMeta {
  key: FestivalKey;
  tabLabel: Record<CoreLanguageCode, string>;
  badge: Record<CoreLanguageCode, string>;
  subtitle: Record<CoreLanguageCode, string>;
}

interface SweetKeepsake {
  key: SweetKey;
  name: Record<CoreLanguageCode, string>;
  festivalOrigin: Record<CoreLanguageCode, string>;
  meaning: Record<CoreLanguageCode, string>;
  blessingNote: Record<CoreLanguageCode, string>;
  accent: string;
}

interface ReturnBlessingOption {
  id: string;
  label: Record<CoreLanguageCode, string>;
  note: Record<CoreLanguageCode, string>;
}

interface HarvestCopy {
  previewBanner: string;
  coverEyebrow: string;
  forLabel: string;
  fromLabel: string;
  openCta: string;
  heroSubline: string;
  stageEyebrow: string;
  stageTitle: string;
  festivalSwitcherLabel: string;
  flyKiteCta: (count: number) => string;
  cutDoriCta: string;
  sankrantiPrompt: string;
  sankrantiSoarWish: (count: number) => string;
  sankrantiKaiPoChe: string;
  lohriOfferCta: string;
  lohriPrompt: string;
  lohriWarmthLabel: (warmth: number, offerings: number) => string;
  lohriBlessings: string[];
  pongalBoilCta: string;
  pongalPrompt: string;
  pongalChantBanner: string;
  pongalOverflowCount: (count: number) => string;
  letterEyebrow: string;
  letterTitle: string;
  highlightsHeading: string;
  sweetsEyebrow: string;
  sweetsTitle: string;
  flipToMeaningLabel: string;
  flipToFrontLabel: string;
  culturalMeaningLabel: string;
  albumEyebrow: string;
  albumTitle: string;
  albumHint: string;
  albumEmptyTitle: string;
  albumEmptyBody: string;
  photoCaptionPrefix: string;
  sanctuaryHeading: string;
  returnEyebrow: string;
  returnTitle: string;
  returnPrompt: string;
  returnAddressedTo: (sender: string, receiver: string) => string;
  sealHoldLabel: string;
  sealChargingLabel: string;
  sealCompleteLabel: string;
  returnResealCta: string;
  returnToastTitle: (sender: string) => string;
  returnToastBody: string;
}

const FESTIVAL_META: Record<FestivalKey, FestivalMeta> = {
  sankranti: {
    key: 'sankranti',
    tabLabel: {
      en: 'Makar Sankranti',
      hinglish: 'Makar Sankranti',
      hi: 'मकर संक्रांति',
    },
    badge: {
      en: 'SHUBH MAKAR SANKRANTI',
      hinglish: 'SHUBH MAKAR SANKRANTI',
      hi: 'शुभ मकर संक्रांति',
    },
    subtitle: {
      en: 'Sunlit Uttarayan skies, soaring patangs, and sweet tilgul',
      hinglish: 'Uttarayan ki dhoop, oonchi patang aur meetha tilgul',
      hi: 'उत्तरायण की धूप, ऊँची पतंगें और मीठा तिल-गुड़',
    },
  },
  lohri: {
    key: 'lohri',
    tabLabel: {
      en: 'Lohri Bonfire',
      hinglish: 'Lohri Agni',
      hi: 'लोहड़ी उत्सव',
    },
    badge: {
      en: 'SHUBH LOHRI UTSAV',
      hinglish: 'SHUBH LOHRI UTSAV',
      hi: 'शुभ लोहड़ी उत्सव',
    },
    subtitle: {
      en: 'Warm bonfire embers, til-rewari offerings, and harvest cheer',
      hinglish: 'Pavitra agni, til-rewari aur parivaar ki garmahat',
      hi: 'पावन अग्नि, तिल-रेवड़ी और खुशियों की गर्माहट',
    },
  },
  pongal: {
    key: 'pongal',
    tabLabel: {
      en: 'Pongal Pot',
      hinglish: 'Pongal Paanai',
      hi: 'पोंगल पर्व',
    },
    badge: {
      en: 'SHUBH PONGAL UTSAV',
      hinglish: 'SHUBH PONGAL UTSAV',
      hi: 'शुभ पोंगल उत्सव',
    },
    subtitle: {
      en: 'Brimming brass paanai, sugarcane stalks, and pulli kolam',
      hinglish: 'Chhalakta peetal paanai, ganna aur shubh kolam',
      hi: 'छलकता पीतल पात्र, गन्ना और शुभ कोलम',
    },
  },
};

const FESTIVAL_ORDER: readonly FestivalKey[] = ['sankranti', 'lohri', 'pongal'];
const SWEET_ORDER: readonly SweetKey[] = ['tilgul', 'gajak', 'pongalSweet'];

const SWEET_KEEPSAKES: Record<SweetKey, SweetKeepsake> = {
  tilgul: {
    key: 'tilgul',
    name: {
      en: 'Tilgul Ladoo',
      hinglish: 'Tilgul Ladoo',
      hi: 'तिल-गुड़ लड्डू',
    },
    festivalOrigin: {
      en: 'Makar Sankranti',
      hinglish: 'Makar Sankranti',
      hi: 'मकर संक्रांति',
    },
    meaning: {
      en: 'Sesame seeds and golden jaggery bind winter warmth with gentle speech.',
      hinglish: 'Til aur gud sardiyon mein garmahat aur rishton mein mithaas laate hain.',
      hi: 'तिल और गुड़ शीत ऋतु में गर्माहट और संबंधों में मधुरता का प्रतीक हैं।',
    },
    blessingNote: {
      en: 'Tilgul ghya, god god bola — accept sweetness and always speak with kindness.',
      hinglish: 'Tilgul ghya, god god bola — har baat mein pyaar aur mithaas bani rahe.',
      hi: 'तिल-गुड़ लें और मीठा बोलें — आपके जीवन में सदैव स्नेह और मधुरता बनी रहे।',
    },
    accent: '#E69F00',
  },
  gajak: {
    key: 'gajak',
    name: {
      en: 'Gajak & Rewari',
      hinglish: 'Gajak & Rewari',
      hi: 'गजक व रेवड़ी',
    },
    festivalOrigin: {
      en: 'Lohri Harvest',
      hinglish: 'Lohri Utsav',
      hi: 'लोहड़ी पर्व',
    },
    meaning: {
      en: 'Crisp roasted sesame pressed in jaggery, offered to the sacred Lohri fire.',
      hinglish: 'Pavitra Lohri ki agni mein arpit til, gud aur rewari ka prasad.',
      hi: 'पावन लोहड़ी की अग्नि में अर्पित भुने तिल, गुड़ और रेवड़ी का मंगल प्रसाद।',
    },
    blessingNote: {
      en: 'May every ember carry away sorrow and invite prosperity to your hearth.',
      hinglish: 'Aadar aaye, dilather jaaye — ghar mein sukh, sehat aur raunak aaye.',
      hi: 'अग्नि की पावन ऊष्मा से घर में सुख, समृद्धि और उत्तम स्वास्थ्य का वास हो।',
    },
    accent: '#C83E2B',
  },
  pongalSweet: {
    key: 'pongalSweet',
    name: {
      en: 'Sakkarai Pongal',
      hinglish: 'Sakkarai Pongal',
      hi: 'शक्कर पोंगल',
    },
    festivalOrigin: {
      en: 'Thai Pongal',
      hinglish: 'Thai Pongal',
      hi: 'थाई पोंगल',
    },
    meaning: {
      en: 'Newly harvested rice simmered with moong, jaggery, cardamom, and ghee.',
      hinglish: 'Nayi fasal ke chawal, gud, elaichi aur ghee se bana pavitra bhog.',
      hi: 'नई फसल के चावल, गुड़, इलायची और घी से बना कृतज्ञता का पावन भोग।',
    },
    blessingNote: {
      en: 'As the brass pot brims over, may abundance and gratitude fill your home.',
      hinglish: 'Jaise paanai chhalakta hai, waise hi ghar mein khushiyan chhalkein.',
      hi: 'जैसे पीतल का पात्र छलक उठता है, वैसे ही आपका आँगन खुशियों से भरा रहे।',
    },
    accent: '#1F6E4A',
  },
};

const RETURN_BLESSINGS: readonly ReturnBlessingOption[] = [
  {
    id: 'sweetness',
    label: {
      en: 'Til-Gul Sweetness & Peace',
      hinglish: 'Til-Gul Mithaas & Sukoon',
      hi: 'तिल-गुड़ की मिठास और शांति',
    },
    note: {
      en: 'Sending golden jaggery warmth and calm mornings back to your home.',
      hinglish: 'Aapke ghar ke liye til-gud jaisi mithaas aur sukoon bhej rahe hain.',
      hi: 'आपके परिवार के लिए तिल-गुड़ जैसी मिठास और सुखद प्रभात भेज रहे हैं।',
    },
  },
  {
    id: 'warmth',
    label: {
      en: 'Sacred Lohri Warmth',
      hinglish: 'Lohri Agni ki Garmahat',
      hi: 'लोहड़ी की पावन गर्माहट',
    },
    note: {
      en: 'May the harvest bonfire light up every gathering with laughter and strength.',
      hinglish: 'Agni ki garmahat aapke parivaar mein hamesha khushi aur taqat rakhe.',
      hi: 'पावन अग्नि की रोशनी आपके हर मिलन को हँसी और ऊर्जा से भर दे।',
    },
  },
  {
    id: 'abundance',
    label: {
      en: 'Overflowing Harvest Joy',
      hinglish: 'Chhalakti Khushiyan & Samriddhi',
      hi: 'छलकता सुख और समृद्धि',
    },
    note: {
      en: 'Wishing bountiful harvests, good health, and joyful togetherness all year.',
      hinglish: 'Poore saal achhi sehat, barkat aur parivaar ke saath ki shubhkamnayein.',
      hi: 'पूरे वर्ष उत्तम स्वास्थ्य, समृद्धि और अपनों के साथ की हार्दिक शुभकामनाएँ।',
    },
  },
];

const FESTIVE_TRACKS: Record<CoreLanguageCode, readonly CurvedTrackItem[]> = {
  en: [
    {
      id: 'dholki-breeze',
      title: 'Dholki & Kite Breeze',
      moodLabel: 'Rooftop Folk',
      duration: '02:18',
      note: 'Sunlit morning chimes inspired by Uttarayan rooftops, wooden firkis, and cheerful dholki rhythms.',
    },
    {
      id: 'lohri-courtyard',
      title: 'Lohri Courtyard Fire',
      moodLabel: 'Bonfire Warmth',
      duration: '02:42',
      note: 'Warm acoustic folk tones echoing courtyard songs around crackling sesame and jaggery embers.',
    },
    {
      id: 'pongal-dawn',
      title: 'Pongal Dawn Bell',
      moodLabel: 'Temple Morning',
      duration: '02:30',
      note: 'Bright festive notes celebrating freshly drawn kolam thresholds and brimming brass harvest pots.',
    },
  ],
  hinglish: [
    {
      id: 'dholki-breeze',
      title: 'Dholki & Patang Dhun',
      moodLabel: 'Chhat Folk',
      duration: '02:18',
      note: 'Uttarayan ki dhoop, wooden firki aur subah ki meethi dholki taalon se bhari dhun.',
    },
    {
      id: 'lohri-courtyard',
      title: 'Lohri Aangan Geet',
      moodLabel: 'Agni Warmth',
      duration: '02:42',
      note: 'Lohri ki pavitra aag aur parivaar ke sang gungunaye jaane wale lok geeton ki garmahat.',
    },
    {
      id: 'pongal-dawn',
      title: 'Pongal Prabhat Dhun',
      moodLabel: 'Mangal Dawn',
      duration: '02:30',
      note: 'Shubh kolam aur chhalakte peetal ke paanai ke saath subah ki mangal dhun.',
    },
  ],
  hi: [
    {
      id: 'dholki-breeze',
      title: 'ढोलकी व पतंग धुन',
      moodLabel: 'लोक संगीत',
      duration: '02:18',
      note: 'उत्तरायण की सुनहरी धूप और छतों पर गूँजती मधुर ढोलकी की मंगल ध्वनि।',
    },
    {
      id: 'lohri-courtyard',
      title: 'लोहड़ी आँगन गीत',
      moodLabel: 'पावन ऊष्मा',
      duration: '02:42',
      note: 'लोहड़ी की पावन अग्नि के चारों ओर गाए जाने वाले पारंपरिक लोक स्वर।',
    },
    {
      id: 'pongal-dawn',
      title: 'पोंगल प्रभात स्वर',
      moodLabel: 'मंगल प्रभात',
      duration: '02:30',
      note: 'शुभ कोलम और छलकता पीतल पात्र मनाने वाली पावन प्रभात धुन।',
    },
  ],
};

const KITE_LAYOUT = [
  { x: 18, y: 30, size: 32, fill: '#C83E2B', trim: '#FFF7E6', rot: -14 },
  { x: 50, y: 20, size: 38, fill: '#E69F00', trim: '#FFF7E6', rot: 10 },
  { x: 78, y: 32, size: 30, fill: '#1F6E4A', trim: '#FFF7E6', rot: -9 },
  { x: 34, y: 48, size: 31, fill: '#9A6B22', trim: '#FFF7E6', rot: 15 },
  { x: 66, y: 50, size: 34, fill: '#C83E2B', trim: '#E69F00', rot: -11 },
  { x: 84, y: 58, size: 28, fill: '#1F6E4A', trim: '#E69F00', rot: 8 },
];

const HARVEST_COPY: Record<CoreLanguageCode, HarvestCopy> = {
  en: {
    previewBanner: 'WEBZY FREE PREVIEW',
    coverEyebrow: 'Harvest Festive Keepsake',
    forLabel: 'For',
    fromLabel: 'From',
    openCta: 'Step Into Celebration',
    heroSubline: 'Makar Sankranti, Lohri & Pongal Celebration',
    stageEyebrow: 'Interactive Harvest Rituals',
    stageTitle: 'Celebrate Every Harvest Tradition',
    festivalSwitcherLabel: 'Choose harvest tradition',
    flyKiteCta: (count) => `Fly Kite Higher (${count}/6)`,
    cutDoriCta: 'Cut Dori',
    sankrantiPrompt: 'Tap kites or fly higher into the golden Uttarayan sky',
    sankrantiSoarWish: (count) =>
      `${count} kites soaring high — wishing your family bright horizons.`,
    sankrantiKaiPoChe: 'Kai Po Che! Cheerful harvest wishes echo across the rooftops.',
    lohriOfferCta: 'Toss Til, Gud & Rewari',
    lohriPrompt: 'Toss sesame & jaggery embers into the bonfire to raise warmth',
    lohriWarmthLabel: (warmth, offerings) =>
      `Bonfire Warmth ${warmth}% · ${offerings} Offerings`,
    lohriBlessings: [
      'Warm sparks rise with blessings of health and prosperity.',
      'Aadar aaye, dilather jaaye — abundance enters your home.',
      'Shared til and rewari bind every generation in warmth.',
    ],
    pongalBoilCta: 'Boil Over Abundance',
    pongalPrompt: 'Tap below to simmer sweet milk until the brass paanai overflows',
    pongalChantBanner: 'Pongalo Pongal! Abundance overflows across your home.',
    pongalOverflowCount: (count) => `Pongalo Pongal! Celebrated (${count})`,
    letterEyebrow: 'Family Harvest Letter',
    letterTitle: 'Warm Wishes From Home',
    highlightsHeading: 'Festive Blessings',
    sweetsEyebrow: 'Sweet & Tradition Keepsake',
    sweetsTitle: 'Tap & Flip Traditional Treats',
    flipToMeaningLabel: 'Reveal Cultural Meaning',
    flipToFrontLabel: 'Show Sweet Emblem',
    culturalMeaningLabel: 'Cultural Blessing',
    albumEyebrow: 'Harvest Keepsake Reel',
    albumTitle: 'Festive Memories',
    albumHint: 'Tap any portrait to inspect full screen',
    albumEmptyTitle: 'Sunlit Courtyard Keepsake',
    albumEmptyBody:
      'Marigold garlands, sweet tilgul trays, and bright winter sunlight held warmly in memory.',
    photoCaptionPrefix: 'Harvest',
    sanctuaryHeading: 'Folk Acoustic Sanctuary',
    returnEyebrow: 'Send Warmth Back',
    returnTitle: 'Return Harvest Blessing Seal',
    returnPrompt: 'Choose a blessing to press and seal back:',
    returnAddressedTo: (sender, receiver) => `To ${sender} · From ${receiver}`,
    sealHoldLabel: 'Press & Hold to Seal Blessing',
    sealChargingLabel: 'Pressing Marigold Wax Seal...',
    sealCompleteLabel: 'Harvest Blessing Sealed',
    returnResealCta: 'Send Another Blessing',
    returnToastTitle: (sender) => `Blessing Sealed for ${sender}`,
    returnToastBody: 'Pressed with golden marigold and harvest gratitude.',
  },
  hinglish: {
    previewBanner: 'WEBZY FREE PREVIEW',
    coverEyebrow: 'Tyohar Keepsake · Harvest Utsav',
    forLabel: 'Kiske liye',
    fromLabel: 'Bheja hai',
    openCta: 'Step Into Celebration',
    heroSubline: 'Makar Sankranti, Lohri & Pongal Utsav',
    stageEyebrow: 'Interactive Festival Rituals',
    stageTitle: 'Har Parampara Ke Saath Tyohar Manayein',
    festivalSwitcherLabel: 'Festival tradition chuno',
    flyKiteCta: (count) => `Fly Kite Higher (${count}/6)`,
    cutDoriCta: 'Cut Dori',
    sankrantiPrompt: 'Aasman mein patang udao ya dori kaat kar Kai Po Che bolo',
    sankrantiSoarWish: (count) =>
      `${count} patangein oonchi ud rahi hain — khushiyon ki udaan!`,
    sankrantiKaiPoChe: 'Kai Po Che! Chhat se chhat tak tyohar ki khushi goonj uthi.',
    lohriOfferCta: 'Til, Gud & Rewari Arpit Karein',
    lohriPrompt: 'Agni mein til, gud aur rewari daalkar garmahat badhayein',
    lohriWarmthLabel: (warmth, offerings) =>
      `Agni Warmth ${warmth}% · ${offerings} Arpan`,
    lohriBlessings: [
      'Pavitra agni ki garmahat parivaar mein barkat laaye.',
      'Aadar aaye, dilather jaaye — ghar mein sukh-shanti aaye.',
      'Til aur rewari ke saath sabke chehre par muskaan rahe.',
    ],
    pongalBoilCta: 'Boil Over Abundance',
    pongalPrompt: 'Peetal ke paanai mein meetha doodh ubalne ke liye tap karein',
    pongalChantBanner: 'Pongalo Pongal! Ghar mein sukh-samriddhi chhalak uthi.',
    pongalOverflowCount: (count) => `Pongalo Pongal! Celebrated (${count})`,
    letterEyebrow: 'Parivaar ka Sandesh',
    letterTitle: 'Tyohar ki Mithaas',
    highlightsHeading: 'Mangal Aashirwad',
    sweetsEyebrow: 'Mithai & Parampara Flipper',
    sweetsTitle: 'Tap Karke Parampara Dekhein',
    flipToMeaningLabel: 'Arth aur Aashirwad Dekhein',
    flipToFrontLabel: 'Mithai Card Wapas Dekhein',
    culturalMeaningLabel: 'Parampara Sandesh',
    albumEyebrow: 'Utsav Album',
    albumTitle: 'Tyohar ki Yaadein',
    albumHint: 'Badi photo dekhne ke liye tap karein',
    albumEmptyTitle: 'Sunehri Dhoop Aur Tyohar',
    albumEmptyBody:
      'Gende ke phool, meetha tilgul aur parivaar ke saath bitayi dhoop bhari subah ki yaadein.',
    photoCaptionPrefix: 'Utsav',
    sanctuaryHeading: 'Folk Acoustic Sanctuary',
    returnEyebrow: 'Wapas Shubhkamnayein',
    returnTitle: 'Return Harvest Blessing Seal',
    returnPrompt: 'Ek shubhkamna chuno aur hold karke seal karo:',
    returnAddressedTo: (sender, receiver) => `${sender} ke liye · ${receiver} ki taraf se`,
    sealHoldLabel: 'Hold Karke Seal Lagayein',
    sealChargingLabel: 'Marigold Seal Lag Rahi Hai...',
    sealCompleteLabel: 'Blessing Seal Ho Gayi',
    returnResealCta: 'Ek Aur Aashirwad Bhejein',
    returnToastTitle: (sender) => `${sender} ke liye Blessing Seal Hui`,
    returnToastBody: 'Gende ke phool aur til-gud ki mithaas ke saath surakshit.',
  },
  hi: {
    previewBanner: 'WEBZY निःशुल्क पूर्वावलोकन',
    coverEyebrow: 'फसल पर्व · मंगल स्मृति',
    forLabel: 'प्रेषित',
    fromLabel: 'प्रेषक',
    openCta: 'उत्सव में प्रवेश करें',
    heroSubline: 'मकर संक्रांति, लोहड़ी एवं पोंगल उत्सव',
    stageEyebrow: 'पावन उत्सव अनुष्ठान',
    stageTitle: 'हर परंपरा के साथ पर्व मनाएँ',
    festivalSwitcherLabel: 'पर्व परंपरा चुनें',
    flyKiteCta: (count) => `पतंग ऊपर उड़ाएँ (${count}/6)`,
    cutDoriCta: 'डोरी काटें',
    sankrantiPrompt: 'उत्तरायण के आकाश में पतंग उड़ाएँ या काई पो चे मनाएँ',
    sankrantiSoarWish: (count) =>
      `${count} पतंगें आकाश छू रही हैं — घर में सुख और उत्साह बना रहे।`,
    sankrantiKaiPoChe: 'काई पो चे! हर छत पर खुशियों और उमंग की गूँज है।',
    lohriOfferCta: 'तिल, गुड़ व रेवड़ी अर्पित करें',
    lohriPrompt: 'पावन अग्नि में तिल, गुड़ और रेवड़ी अर्पित करने के लिए टैप करें',
    lohriWarmthLabel: (warmth, offerings) =>
      `अग्नि ऊष्मा ${warmth}% · ${offerings} अर्पण`,
    lohriBlessings: [
      'पावन चिंगारियाँ स्वास्थ्य और समृद्धि का आशीर्वाद लेकर उठती हैं।',
      'आदर आए, दरिद्र जाए — घर में सुख और शांति का वास हो।',
      'तिल और रेवड़ी का प्रसाद हर पीढ़ी को स्नेह से जोड़ता है।',
    ],
    pongalBoilCta: 'मंगल उबाल मनाएँ',
    pongalPrompt: 'पीतल के पात्र में मीठा पोंगल छलकने के लिए नीचे टैप करें',
    pongalChantBanner: 'पोंगलो पोंगल! घर-आँगन में सुख और समृद्धि छलक उठी।',
    pongalOverflowCount: (count) => `पोंगलो पोंगल! मनाया गया (${count})`,
    letterEyebrow: 'परिवार की ओर से संदेश',
    letterTitle: 'स्नेह और शुभकामना पत्र',
    highlightsHeading: 'मंगल आशीर्वाद',
    sweetsEyebrow: 'मिठाई व परंपरा पुस्तिका',
    sweetsTitle: 'कार्ड पलटकर परंपरा जानें',
    flipToMeaningLabel: 'सांस्कृतिक अर्थ देखें',
    flipToFrontLabel: 'मिठाई चिह्न देखें',
    culturalMeaningLabel: 'मंगल आशीर्वचन',
    albumEyebrow: 'उत्सव एल्बम',
    albumTitle: 'त्योहार की मधुर यादें',
    albumHint: 'बड़ी फ़ोटो देखने के लिए टैप करें',
    albumEmptyTitle: 'सुनहरी धूप और मंगल आँगन',
    albumEmptyBody:
      'गेंदे के तोरण, मीठे तिल-गुड़ और अपनों के स्नेह से सजी त्योहार की मधुर स्मृति।',
    photoCaptionPrefix: 'उत्सव',
    sanctuaryHeading: 'लोक संगीत प्रांगण',
    returnEyebrow: 'शुभकामना उत्तर',
    returnTitle: 'मंगल आशीर्वाद मुहर',
    returnPrompt: 'अपनों को भेजने के लिए एक शुभकामना चुनें और दबाकर मुहर लगाएँ:',
    returnAddressedTo: (sender, receiver) => `${sender} के लिए · ${receiver} की ओर से`,
    sealHoldLabel: 'मुहर लगाने के लिए दबाए रखें',
    sealChargingLabel: 'गेंदा व स्वर्ण मुहर लग रही है...',
    sealCompleteLabel: 'शुभकामना मुहर सहेजी गई',
    returnResealCta: 'एक और शुभकामना भेजें',
    returnToastTitle: (sender) => `${sender} के लिए शुभकामना सहेजी गई`,
    returnToastBody: 'गेंदे के पुष्प और तिल-गुड़ की मिठास के साथ सुरक्षित।',
  },
};

function normalizeFestival(relation?: string): FestivalKey {
  const value = relation?.trim().toLowerCase();
  if (value === 'lohri') return 'lohri';
  if (value === 'pongal') return 'pongal';
  return 'sankranti';
}

/** Marigold and mango-leaf toran SVG spanning the jharokha arch header. */
function MarigoldToranSvg() {
  const blossoms = [36, 92, 148, 200, 252, 308, 364];
  return (
    <svg
      viewBox="0 0 400 58"
      className="pointer-events-none w-full select-none"
      aria-hidden="true"
    >
      <path
        d="M8 7 Q104 30 200 16 Q296 30 392 7"
        fill="none"
        stroke="#9A6B22"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {blossoms.map((cx, idx) => {
        const cy = idx === 3 ? 20 : idx % 2 === 0 ? 21 : 25;
        const isKumkum = idx === 3;
        return (
          <g key={cx} transform={`translate(${cx}, ${cy})`}>
            <path
              d="M-12 -10 C-14 1 -7 9 0 11 C7 9 14 1 12 -10 Z"
              fill="#1F6E4A"
              opacity="0.9"
            />
            <circle r={isKumkum ? 11 : 9.5} fill={isKumkum ? '#C83E2B' : '#E69F00'} />
            <circle r={isKumkum ? 7 : 6.2} fill={isKumkum ? '#E25B45' : '#F6B83B'} />
            <circle r="3" fill="#FFF7E6" />
          </g>
        );
      })}
    </svg>
  );
}

/** Sunlit brass emblem uniting Uttarayan sun rays, geometric kite, and mango leaves. */
function HarvestCrestSvg({ className = '' }: { className?: string }) {
  const rays = Array.from({ length: 12 }, (_, idx) => idx * 30);
  return (
    <svg
      viewBox="0 0 120 120"
      className={`h-20 w-20 sm:h-24 sm:w-24 ${className}`}
      aria-hidden="true"
    >
      {rays.map((deg) => (
        <g key={deg} transform={`rotate(${deg} 60 60)`}>
          <path d="M60 7 L64.5 23 L55.5 23 Z" fill="#E69F00" opacity="0.88" />
          <circle cx="60" cy="17" r="1.8" fill="#C83E2B" />
        </g>
      ))}
      <circle cx="60" cy="60" r="31" fill="#FFF7E6" stroke="#9A6B22" strokeWidth="2.2" />
      <circle cx="60" cy="60" r="24" fill="#FDE6B1" stroke="#E69F00" strokeWidth="1.4" />
      <polygon points="60,40 76,56 60,72 44,56" fill="#C83E2B" stroke="#9A6B22" strokeWidth="1.4" />
      <polygon points="60,40 76,56 60,56" fill="#E69F00" opacity="0.45" />
      <line x1="60" y1="40" x2="60" y2="72" stroke="#FFF7E6" strokeWidth="1.2" />
      <path d="M46 56 Q60 49 74 56" fill="none" stroke="#FFF7E6" strokeWidth="1.2" />
      <polygon points="60,72 65,80 55,80" fill="#1F6E4A" />
    </svg>
  );
}

/** Delicate kolam corner flourish rendered inside parchment cards. */
function KolamCornerSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`h-8 w-8 ${className}`} aria-hidden="true">
      <path
        d="M6 6 Q24 6 24 24 Q24 42 42 42"
        fill="none"
        stroke="#9A6B22"
        strokeWidth="1.5"
        opacity="0.48"
      />
      <path
        d="M6 18 Q18 18 18 6"
        fill="none"
        stroke="#C83E2B"
        strokeWidth="1.3"
        opacity="0.42"
      />
      <circle cx="10" cy="10" r="2.2" fill="#E69F00" opacity="0.65" />
      <circle cx="20" cy="10" r="1.5" fill="#C83E2B" opacity="0.55" />
      <circle cx="10" cy="20" r="1.5" fill="#1F6E4A" opacity="0.55" />
    </svg>
  );
}

function BrassDivider() {
  return (
    <div className="my-2.5 flex items-center justify-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#E69F00]/45 to-[#9A6B22]/60" />
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#9A6B22]" fill="none">
        <path
          d="M12 3 L15 9 L21 12 L15 15 L12 21 L9 15 L3 12 L9 9 Z"
          fill="#E69F00"
          fillOpacity="0.28"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle cx="12" cy="12" r="2" fill="#C83E2B" />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#E69F00]/45 to-[#9A6B22]/60" />
    </div>
  );
}

function NextArrowIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10h10m-4-4l4 4-4 4" />
    </svg>
  );
}

/** Crisp geometric SVG illustrations for the Sweet & Tradition Keepsake Flipper. */
function SweetEmblemSvg({ sweetKey }: { sweetKey: SweetKey }) {
  if (sweetKey === 'tilgul') {
    return (
      <svg viewBox="0 0 88 72" className="h-16 w-20" aria-hidden="true">
        <ellipse cx="44" cy="56" rx="34" ry="8" fill="#E69F00" fillOpacity="0.24" stroke="#9A6B22" strokeWidth="1.5" />
        <circle cx="33" cy="46" r="10.5" fill="#E69F00" stroke="#9A6B22" strokeWidth="1.4" />
        <circle cx="55" cy="46" r="10.5" fill="#D48C00" stroke="#9A6B22" strokeWidth="1.4" />
        <circle cx="44" cy="30" r="11" fill="#F2B129" stroke="#9A6B22" strokeWidth="1.5" />
        {[
          [31, 44], [36, 48], [53, 44], [58, 47], [41, 27], [47, 31], [43, 34],
        ].map(([cx, cy], idx) => (
          <circle key={idx} cx={cx} cy={cy} r="1.2" fill="#FFF7E6" />
        ))}
      </svg>
    );
  }
  if (sweetKey === 'gajak') {
    return (
      <svg viewBox="0 0 88 72" className="h-16 w-20" aria-hidden="true">
        <ellipse cx="44" cy="56" rx="34" ry="8" fill="#C83E2B" fillOpacity="0.16" stroke="#9A6B22" strokeWidth="1.5" />
        <rect x="20" y="34" width="28" height="16" rx="3" transform="rotate(-8 34 42)" fill="#E69F00" stroke="#9A6B22" strokeWidth="1.4" />
        <rect x="34" y="28" width="28" height="16" rx="3" transform="rotate(6 48 36)" fill="#F3B83E" stroke="#9A6B22" strokeWidth="1.4" />
        <circle cx="62" cy="46" r="6" fill="#FFF7E6" stroke="#9A6B22" strokeWidth="1.3" />
        <circle cx="54" cy="50" r="5" fill="#FDE6B1" stroke="#9A6B22" strokeWidth="1.2" />
        <circle cx="44" cy="34" r="1.1" fill="#FFF7E6" />
        <circle cx="50" cy="37" r="1.1" fill="#FFF7E6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 88 72" className="h-16 w-20" aria-hidden="true">
      <ellipse cx="44" cy="57" rx="32" ry="7.5" fill="#1F6E4A" fillOpacity="0.18" stroke="#9A6B22" strokeWidth="1.4" />
      <path d="M22 36 C24 51, 33 56, 44 56 C55 56, 64 51, 66 36 Z" fill="#E69F00" stroke="#9A6B22" strokeWidth="1.5" />
      <ellipse cx="44" cy="36" rx="22" ry="6.5" fill="#B86B11" stroke="#9A6B22" strokeWidth="1.4" />
      <path d="M36 35 Q40 31 43 35" fill="none" stroke="#FFF7E6" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="50" cy="36" rx="3" ry="1.8" fill="#1F6E4A" />
      <circle cx="44" cy="24" r="1.4" fill="#9A6B22" opacity="0.5" />
      <path d="M40 26 Q37 20 41 15" fill="none" stroke="#9A6B22" strokeWidth="1.3" strokeOpacity="0.55" strokeLinecap="round" />
      <path d="M48 26 Q51 20 47 15" fill="none" stroke="#9A6B22" strokeWidth="1.3" strokeOpacity="0.55" strokeLinecap="round" />
    </svg>
  );
}

function SankrantiStage({
  uid,
  kiteCount,
  altitudeBoost,
  cutBannerActive,
  onFlyKite,
  onCutDori,
  copy,
}: {
  uid: string;
  kiteCount: number;
  altitudeBoost: number;
  cutBannerActive: boolean;
  onFlyKite: () => void;
  onCutDori: () => void;
  copy: HarvestCopy;
}) {
  const visibleKites = KITE_LAYOUT.slice(0, Math.max(1, Math.min(kiteCount, 6)));

  return (
    <div className="space-y-3">
      <div
        className="relative h-60 w-full overflow-hidden rounded-2xl border border-[#9A6B22]/35 shadow-inner"
        style={{
          background:
            'linear-gradient(180deg, #FCD98C 0%, #FFEFC8 54%, #FFF7E6 100%)',
        }}
      >
        <svg viewBox="0 0 360 210" className="h-full w-full" aria-hidden="true">
          <circle cx="298" cy="48" r="38" fill="#E69F00" opacity="0.22" />
          <circle cx="298" cy="48" r="22" fill="#E69F00" opacity="0.9" />
          <path
            d="M24 54 Q38 40 54 48 Q68 36 84 48 Q96 48 96 58 L24 58 Z"
            fill="#FFFDF8"
            opacity="0.82"
          />
          <path
            d="M188 38 Q202 26 216 34 Q228 24 242 36 L188 38 Z"
            fill="#FFFDF8"
            opacity="0.74"
          />
          {visibleKites.map((kite, idx) => {
            const liftStep = (altitudeBoost % 4) * 3.5;
            const liftedY = Math.max(9, kite.y - liftStep);
            const kx = (kite.x / 100) * 340 + 10;
            const ky = (liftedY / 100) * 165 + 10;
            const isCut = cutBannerActive && idx === visibleKites.length - 1;
            return (
              <path
                key={`trail-${idx}`}
                d={`M ${kx} ${ky + 12} Q ${(kx + 56) / 2} ${ky + 62} ${isCut ? kx - 20 : 58} ${isCut ? ky + 48 : 178}`}
                fill="none"
                stroke="#9A6B22"
                strokeWidth="1.15"
                strokeOpacity={isCut ? '0.68' : '0.42'}
                strokeDasharray="3 3"
              />
            );
          })}
          {/* Wooden Bareilly firki spool */}
          <g transform="translate(36, 158)">
            <rect x="0" y="16" width="44" height="6" rx="3" fill="#7A5114" />
            <rect x="8" y="4" width="28" height="30" rx="4" fill="#C83E2B" />
            <line x1="10" y1="11" x2="34" y2="11" stroke="#FFF7E6" strokeWidth="1.8" />
            <line x1="10" y1="18" x2="34" y2="18" stroke="#E69F00" strokeWidth="1.8" />
            <line x1="10" y1="25" x2="34" y2="25" stroke="#FFF7E6" strokeWidth="1.8" />
            <rect x="4" y="2" width="4" height="34" rx="2" fill="#9A6B22" />
            <rect x="36" y="2" width="4" height="34" rx="2" fill="#9A6B22" />
          </g>
        </svg>

        {visibleKites.map((kite, idx) => {
          const liftStep = (altitudeBoost % 4) * 3.5;
          const liftedY = Math.max(10, kite.y - liftStep);
          const isCutKite = cutBannerActive && idx === visibleKites.length - 1;
          return (
            <button
              key={idx}
              type="button"
              onClick={onFlyKite}
              aria-label={`Festival patang ${idx + 1}`}
              style={{
                left: `${kite.x}%`,
                top: `${isCutKite ? Math.max(9, liftedY - 8) : liftedY}%`,
              }}
              className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <span
                className={`harvest-kite-${uid} inline-flex items-center justify-center`}
                style={{ animationDelay: `${idx * 170}ms` }}
              >
                <svg
                  viewBox="0 0 40 48"
                  style={{
                    width: kite.size,
                    height: kite.size * 1.15,
                    transform: `rotate(${isCutKite ? kite.rot + 24 : kite.rot}deg)`,
                  }}
                  aria-hidden="true"
                >
                  <polygon
                    points="20,2 37,19 20,36 3,19"
                    fill={kite.fill}
                    stroke="#2D1B10"
                    strokeWidth="1.2"
                  />
                  <polygon points="20,2 37,19 20,19" fill={kite.trim} opacity="0.34" />
                  <line x1="20" y1="2" x2="20" y2="36" stroke="#FFF7E6" strokeWidth="1.2" />
                  <path d="M5 19 Q20 11 35 19" fill="none" stroke="#FFF7E6" strokeWidth="1.2" />
                  <polygon points="20,36 25,44 15,44" fill={kite.fill} />
                </svg>
              </span>
            </button>
          );
        })}

        <div className="pointer-events-none absolute inset-x-3 bottom-2.5 flex justify-center">
          <span
            className={`rounded-full px-3.5 py-1 text-center text-[11px] font-bold shadow-xs ring-1 transition ${
              cutBannerActive
                ? `harvest-pop-${uid} bg-[#C83E2B] text-[#FFF7E6] ring-[#FFF7E6]/45`
                : 'bg-[#FFF7E6]/92 text-[#2D1B10] ring-[#9A6B22]/30'
            }`}
          >
            {cutBannerActive
              ? copy.sankrantiKaiPoChe
              : altitudeBoost > 0
                ? copy.sankrantiSoarWish(kiteCount)
                : copy.sankrantiPrompt}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onFlyKite}
          className="min-h-[44px] rounded-full bg-[#E69F00] px-3 py-2 text-xs font-bold text-[#2D1B10] shadow-xs transition hover:bg-[#D48C00] active:scale-[0.98]"
        >
          {copy.flyKiteCta(kiteCount)}
        </button>
        <button
          type="button"
          onClick={onCutDori}
          className="min-h-[44px] rounded-full bg-[#C83E2B] px-3 py-2 text-xs font-bold text-[#FFF7E6] shadow-xs transition hover:bg-[#AE3221] active:scale-[0.98]"
        >
          {copy.cutDoriCta}
        </button>
      </div>
    </div>
  );
}

function LohriStage({
  uid,
  offerCount,
  onTossOffering,
  copy,
}: {
  uid: string;
  offerCount: number;
  onTossOffering: () => void;
  copy: HarvestCopy;
}) {
  const warmth = Math.min(100, 35 + offerCount * 15);
  const sparkScale = 1 + (offerCount % 4) * 0.08;
  const blessingText =
    offerCount > 0
      ? copy.lohriBlessings[(offerCount - 1) % copy.lohriBlessings.length]
      : copy.lohriPrompt;

  return (
    <div className="space-y-3">
      <div
        className="relative flex h-60 w-full flex-col items-center justify-end overflow-hidden rounded-2xl border border-[#9A6B22]/45 p-3"
        style={{
          background:
            'linear-gradient(180deg, #2D1810 0%, #5B2416 54%, #91381B 100%)',
        }}
      >
        <svg viewBox="0 0 360 190" className="h-full w-full" aria-hidden="true">
          {[
            { cx: 145, cy: 46, r: 2.5 },
            { cx: 182, cy: 24, r: 3.1 },
            { cx: 214, cy: 42, r: 2.4 },
            { cx: 164, cy: 34, r: 2.1 },
            { cx: 198, cy: 56, r: 2.6 },
            { cx: 128, cy: 64, r: 1.9 },
            { cx: 232, cy: 62, r: 2.2 },
          ].map((spark, idx) => (
            <circle
              key={idx}
              cx={spark.cx}
              cy={spark.cy - (offerCount % 3) * 5}
              r={spark.r * sparkScale}
              fill={idx % 2 === 0 ? '#E69F00' : '#FFF7E6'}
              opacity="0.92"
            />
          ))}

          {[
            { x: 42, flip: 1 },
            { x: 318, flip: -1 },
          ].map(({ x, flip }) => (
            <g key={x} transform={`translate(${x}, 172) scale(${flip}, 1)`}>
              <path d="M0 0 Q10 -52 24 -92" stroke="#E69F00" strokeWidth="2.2" fill="none" />
              <ellipse cx="14" cy="-56" rx="5" ry="2.6" transform="rotate(-35 14 -56)" fill="#E69F00" />
              <ellipse cx="18" cy="-68" rx="5" ry="2.6" transform="rotate(-35 18 -68)" fill="#FFF7E6" />
              <ellipse cx="22" cy="-80" rx="4.5" ry="2.4" transform="rotate(-35 22 -80)" fill="#E69F00" />
              <ellipse cx="9" cy="-64" rx="5" ry="2.6" transform="rotate(25 9 -64)" fill="#FFF7E6" />
              <ellipse cx="13" cy="-76" rx="5" ry="2.6" transform="rotate(25 13 -76)" fill="#E69F00" />
            </g>
          ))}

          <ellipse cx="180" cy="144" rx="78" ry="24" fill="#E69F00" opacity="0.28" />

          <g
            className={`harvest-flame-${uid}`}
            style={{ transformOrigin: '180px 142px' }}
          >
            <g transform={`translate(180, 142) scale(${sparkScale}) translate(-180, -142)`}>
              <path
                d="M180 42 C205 74 222 104 210 138 C200 148 160 148 150 138 C138 104 155 74 180 42 Z"
                fill="#C83E2B"
              />
              <path
                d="M180 58 C198 85 208 110 198 138 C190 145 170 145 162 138 C152 110 162 85 180 58 Z"
                fill="#E69F00"
              />
              <path
                d="M180 84 C190 102 195 118 189 138 C185 142 175 142 171 138 C165 118 170 102 180 84 Z"
                fill="#FFF7E6"
              />
            </g>
          </g>

          <rect x="132" y="138" width="96" height="12" rx="6" transform="rotate(-9 180 144)" fill="#5A3317" />
          <rect x="132" y="140" width="96" height="12" rx="6" transform="rotate(10 180 146)" fill="#7A451E" />

          <g transform="translate(262, 148)">
            <ellipse cx="28" cy="18" rx="30" ry="9" fill="#E69F00" stroke="#9A6B22" strokeWidth="1.5" />
            <circle cx="16" cy="14" r="4.5" fill="#FFF7E6" />
            <circle cx="25" cy="12" r="4.5" fill="#FDE6B1" />
            <circle cx="34" cy="14" r="4.5" fill="#E69F00" />
            <rect x="19" y="15" width="12" height="5" rx="1.5" fill="#9A6B22" />
          </g>
        </svg>

        <div className="relative z-10 flex w-full flex-col items-center gap-1.5">
          <div className="flex w-full max-w-[240px] items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#FFF7E6]">
            <span>{copy.lohriWarmthLabel(warmth, offerCount)}</span>
          </div>
          <div className="h-1.5 w-full max-w-[240px] overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#E69F00] to-[#FFF7E6] transition-all duration-300"
              style={{ width: `${warmth}%` }}
            />
          </div>
          <p className="rounded-full bg-[#2D1810]/85 px-3 py-1 text-center text-[11px] font-semibold text-[#FFF7E6] ring-1 ring-[#E69F00]/40">
            {blessingText}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onTossOffering}
        className="min-h-[44px] w-full rounded-full bg-[#C83E2B] px-5 py-2.5 text-sm font-bold text-[#FFF7E6] shadow-xs transition hover:bg-[#AE3221] active:scale-[0.98]"
      >
        {copy.lohriOfferCta}
      </button>
    </div>
  );
}

function PongalStage({
  uid,
  boilCount,
  onCelebratePongal,
  copy,
}: {
  uid: string;
  boilCount: number;
  onCelebratePongal: () => void;
  copy: HarvestCopy;
}) {
  const frothLift = boilCount > 0 ? 4 + (boilCount % 3) * 3 : 0;

  return (
    <div className="space-y-3">
      <div
        className="relative flex h-60 w-full flex-col items-center justify-end overflow-hidden rounded-2xl border border-[#9A6B22]/35 p-3"
        style={{
          background:
            'linear-gradient(180deg, #FFFDF8 0%, #FFF7E6 62%, #FDE8B8 100%)',
        }}
      >
        <svg viewBox="0 0 360 190" className="h-full w-full" aria-hidden="true">
          <g transform="translate(180, 162)" opacity="0.92">
            <ellipse cx="0" cy="0" rx="112" ry="20" fill="none" stroke="#FFFFFF" strokeWidth="2.4" />
            <ellipse cx="0" cy="0" rx="88" ry="14" fill="none" stroke="#C83E2B" strokeWidth="1.6" strokeDasharray="5 4" />
            {[-76, -38, 0, 38, 76].map((dx) => (
              <circle key={dx} cx={dx} cy={0} r="3" fill={dx === 0 ? '#C83E2B' : '#9A6B22'} />
            ))}
          </g>

          <g>
            <line x1="94" y1="162" x2="246" y2="26" stroke="#1F6E4A" strokeWidth="8" strokeLinecap="round" />
            <line x1="266" y1="162" x2="114" y2="26" stroke="#28845A" strokeWidth="8" strokeLinecap="round" />
            <path d="M242 28 Q272 16 286 32" fill="none" stroke="#1F6E4A" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M118 28 Q88 16 74 32" fill="none" stroke="#28845A" strokeWidth="3.5" strokeLinecap="round" />
          </g>

          <g className={`harvest-steam-${uid}`}>
            <path
              d={`M164 ${66 - frothLift} Q156 46 168 30`}
              fill="none"
              stroke="#9A6B22"
              strokeWidth="2"
              strokeOpacity="0.55"
              strokeLinecap="round"
            />
            <path
              d={`M196 ${64 - frothLift} Q206 44 192 28`}
              fill="none"
              stroke="#9A6B22"
              strokeWidth="2"
              strokeOpacity="0.55"
              strokeLinecap="round"
            />
          </g>

          <ellipse cx="180" cy="118" rx="44" ry="38" fill="#E69F00" stroke="#9A6B22" strokeWidth="2" />
          <ellipse cx="166" cy="112" rx="14" ry="22" fill="#FFF7E6" opacity="0.38" />
          <rect x="148" y="72" width="64" height="14" rx="7" fill="#9A6B22" stroke="#6E4A13" strokeWidth="1.6" />

          <path d="M152 86 L142 104 L160 98 Z" fill="#1F6E4A" />
          <path d="M180 86 L173 106 L187 106 Z" fill="#28845A" />
          <path d="M208 86 L218 104 L200 98 Z" fill="#1F6E4A" />
          <line x1="147" y1="86" x2="213" y2="86" stroke="#C83E2B" strokeWidth="3" />

          <path
            d={`M146 ${76 - frothLift} Q160 ${56 - frothLift} 180 ${60 - frothLift} Q200 ${56 - frothLift} 214 ${76 - frothLift} Q202 88 192 80 Q180 98 168 80 Q158 88 146 ${76 - frothLift} Z`}
            fill="#FFFFFF"
            stroke="#E69F00"
            strokeWidth="1.2"
          />
          {boilCount > 0 ? (
            <>
              <circle cx="150" cy={88 + frothLift} r="3.6" fill="#FFFFFF" />
              <circle cx="208" cy={91 + frothLift} r="3.2" fill="#FFFFFF" />
              <circle cx="179" cy={99 + frothLift * 0.6} r="2.8" fill="#FFFFFF" />
            </>
          ) : null}
        </svg>

        <span
          className={`relative z-10 rounded-full px-3.5 py-1 text-center text-[11px] font-bold shadow-xs ring-1 ${
            boilCount > 0
              ? `harvest-pop-${uid} bg-[#1F6E4A] text-[#FFF7E6] ring-[#FFF7E6]/40`
              : 'bg-[#FFFDF8]/95 text-[#7A5114] ring-[#9A6B22]/30'
          }`}
        >
          {boilCount > 0 ? copy.pongalChantBanner : copy.pongalPrompt}
        </span>
      </div>

      <button
        type="button"
        onClick={onCelebratePongal}
        className="min-h-[44px] w-full rounded-full bg-[#1F6E4A] px-5 py-2.5 text-sm font-bold text-[#FFF7E6] shadow-xs transition hover:bg-[#175539] active:scale-[0.98]"
      >
        {boilCount > 0 ? copy.pongalOverflowCount(boilCount) : copy.pongalBoilCta}
      </button>
    </div>
  );
}

/**
 * Continuous-flow Indian Harvest Celebration microsite
 * (Makar Sankranti, Lohri & Pongal) crafted in Golden Harvest Parchment & Marigold Craft aesthetic.
 */
export function HarvestGreetingSite({
  manifest: _manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const uid = useId().replace(/:/g, '');
  const initialFestival = normalizeFestival(data.relation);

  const [opened, setOpened] = useState(false);
  const [activeFestival, setActiveFestival] = useState<FestivalKey>(initialFestival);

  // Interactive Festival Ritual states
  const [kiteCount, setKiteCount] = useState(3);
  const [kiteBoost, setKiteBoost] = useState(0);
  const [cutDoriActive, setCutDoriActive] = useState(false);
  const [lohriOfferings, setLohriOfferings] = useState(1);
  const [pongalBoils, setPongalBoils] = useState(0);

  // Sweet & Tradition Keepsake Flipper states
  const [activeSweet, setActiveSweet] = useState<SweetKey>('tilgul');
  const [flippedSweets, setFlippedSweets] = useState<Record<SweetKey, boolean>>({
    tilgul: false,
    gajak: false,
    pongalSweet: false,
  });

  // Return Harvest Blessing Seal states
  const [selectedBlessingId, setSelectedBlessingId] = useState<string>(RETURN_BLESSINGS[0].id);
  const [blessingSealed, setBlessingSealed] = useState(false);
  const [sealCount, setSealCount] = useState(0);
  const [sealCycle, setSealCycle] = useState(0);

  useEffect(() => {
    setActiveFestival(normalizeFestival(data.relation));
  }, [data.relation]);

  const coreLang = toCoreLanguageCode(language);
  const copy = HARVEST_COPY[coreLang] ?? HARVEST_COPY.en;
  const activeMeta = FESTIVAL_META[activeFestival];
  const coverMeta = FESTIVAL_META[initialFestival];
  const headlineText = pickLocalizedText(data.headline, language) || copy.letterTitle;
  const messageText = pickLocalizedText(data.message, language);
  const canUseDropCap = coreLang !== 'hi' && /^[A-Za-z]/.test(messageText.trim());
  const currentSweet = SWEET_KEEPSAKES[activeSweet];
  const isCurrentSweetFlipped = flippedSweets[activeSweet];
  const sanctuaryTracks = FESTIVE_TRACKS[coreLang] ?? FESTIVE_TRACKS.en;
  const chosenBlessing =
    RETURN_BLESSINGS.find((item) => item.id === selectedBlessingId) ?? RETURN_BLESSINGS[0];

  function handleOpen() {
    setOpened(true);
    onOpened?.();
  }

  function handleReplay() {
    setOpened(false);
  }

  function handleFlyKite() {
    setCutDoriActive(false);
    setKiteCount((k) => (k >= 6 ? 2 : k + 1));
    setKiteBoost((b) => b + 1);
  }

  function handleCutDori() {
    setCutDoriActive(true);
    setKiteBoost((b) => b + 1);
  }

  function handleSelectSweet(key: SweetKey) {
    setActiveSweet(key);
  }

  function handleToggleSweetFlip() {
    setFlippedSweets((prev) => ({
      ...prev,
      [activeSweet]: !prev[activeSweet],
    }));
  }

  function handleSealComplete() {
    setBlessingSealed(true);
    setSealCount((c) => c + 1);
  }

  function handleResealReset() {
    setBlessingSealed(false);
    setSealCycle((c) => c + 1);
  }

  const scopedKeyframes = `
    @keyframes harvest-float-${uid} {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
    }
    @keyframes harvest-kite-${uid} {
      0%, 100% { transform: rotate(-3deg) translateY(0px); }
      50% { transform: rotate(3deg) translateY(-5px); }
    }
    @keyframes harvest-flame-${uid} {
      0%, 100% { transform: scaleY(0.96) scaleX(1.02); }
      50% { transform: scaleY(1.05) scaleX(0.97); }
    }
    @keyframes harvest-steam-${uid} {
      0%, 100% { opacity: 0.45; transform: translateY(0px); }
      50% { opacity: 0.9; transform: translateY(-4px); }
    }
    @keyframes harvest-pop-${uid} {
      0% { transform: scale(0.92); opacity: 0.5; }
      70% { transform: scale(1.04); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes harvest-fade-${uid} {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .harvest-float-${uid} { animation: harvest-float-${uid} 3.6s ease-in-out infinite; }
    .harvest-kite-${uid} { animation: harvest-kite-${uid} 3.2s ease-in-out infinite; }
    .harvest-flame-${uid} { animation: harvest-flame-${uid} 1.4s ease-in-out infinite; }
    .harvest-steam-${uid} { animation: harvest-steam-${uid} 2.4s ease-in-out infinite; }
    .harvest-pop-${uid} { animation: harvest-pop-${uid} 0.35s ease-out both; }
    .harvest-fade-${uid} { animation: harvest-fade-${uid} 0.45s ease-out both; }
    @media (prefers-reduced-motion: reduce) {
      .harvest-float-${uid},
      .harvest-kite-${uid},
      .harvest-flame-${uid},
      .harvest-steam-${uid},
      .harvest-pop-${uid},
      .harvest-fade-${uid} {
        animation: none !important;
      }
    }
  `;

  if (!opened) {
    return (
      <div className="relative flex min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#FFF7E6] text-[#2D1B10]">
        <style>{scopedKeyframes}</style>

        <OccasionArtworkBackdrop
          src="/templates/occasions/harvest-greeting/cover.jpg"
          fallbackGradient="linear-gradient(155deg, #FFF7E6 0%, #FDE8BC 58%, #F8D38A 100%)"
          className="object-cover object-center opacity-40"
        />

        <AmbientRainCanvas density="light" fireflies tint="#E69F00" />

        {watermarked ? (
          <div
            aria-hidden="true"
            className="relative z-20 flex justify-center border-b border-[#9A6B22]/25 bg-[#FFF7E6]/90 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#C83E2B]"
          >
            {copy.previewBanner}
          </div>
        ) : null}

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
          {/* Traditional Jharokha Arch Card with Marigold Toran */}
          <div className="relative flex w-full max-w-md flex-col items-center overflow-hidden rounded-t-[160px] rounded-b-[28px] border-2 border-[#9A6B22]/70 bg-[#FFF7E6]/92 px-5 pt-3 pb-6 text-center shadow-[0_18px_42px_-16px_rgba(154,107,34,0.34)] backdrop-blur-xs">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-2 rounded-t-[150px] rounded-b-[22px] border border-[#C83E2B]/35"
            />

            <MarigoldToranSvg />

            <div className="relative mt-1 flex w-full flex-col items-center">
              <HarvestCrestSvg className={`harvest-float-${uid}`} />

              <span className="mt-2.5 inline-flex items-center rounded-full border border-[#9A6B22]/35 bg-[#FFFDF8] px-3.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#7A5114]">
                {coverMeta.badge[coreLang]}
              </span>

              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1F6E4A]">
                {copy.coverEyebrow}
              </p>

              <h2 className="mt-2 max-w-full break-words font-heading text-2xl font-bold tracking-tight text-[#2D1B10] sm:text-3xl">
                {data.receiverName}
              </h2>

              <p className="mt-1.5 max-w-xs text-xs font-medium leading-relaxed text-[#5A3D28]">
                {coverMeta.subtitle[coreLang]}
              </p>

              <div className="mt-3.5 inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-[#C83E2B]/25 bg-[#FFFDF8] px-4 py-1.5 text-xs font-semibold text-[#2D1B10] shadow-2xs">
                <span className="text-[#5A3D28]">
                  {copy.forLabel} {data.receiverName}
                </span>
                <span aria-hidden="true" className="text-[#9A6B22]">
                  ·
                </span>
                <span className="text-[#C83E2B]">
                  {copy.fromLabel} {data.senderName}
                </span>
              </div>

              <button
                type="button"
                onClick={handleOpen}
                className="mt-5 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#E69F00] to-[#C87B00] px-7 py-3 text-sm font-bold text-[#FFFDF8] shadow-[0_10px_24px_-6px_rgba(154,107,34,0.5)] transition hover:brightness-105 active:scale-95"
              >
                <span>{copy.openCta}</span>
                <NextArrowIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`harvest-fade-${uid} relative flex min-h-full w-full flex-col overflow-hidden rounded-[28px] bg-[#FFF7E6] text-[#2D1B10]`}
    >
      <style>{scopedKeyframes}</style>

      {/* Subtle golden harvest firefly sparks drifting behind the continuous experience */}
      <AmbientRainCanvas density="light" fireflies tint="#E69F00" />

      {watermarked ? (
        <div
          aria-hidden="true"
          className="relative z-20 flex justify-center border-b border-[#9A6B22]/25 bg-[#FFFDF8]/92 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#C83E2B]"
        >
          {copy.previewBanner}
        </div>
      ) : null}

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 p-4 pt-3.5 sm:px-5">
        {/* Top Utility Bar */}
        <header className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex min-h-[34px] items-center rounded-full border border-[#9A6B22]/35 bg-[#FFFDF8]/95 px-3 py-1 text-[10.5px] font-bold tracking-wider text-[#7A5114] shadow-2xs">
            {activeMeta.badge[coreLang]}
          </span>
          <button
            type="button"
            onClick={handleReplay}
            className="inline-flex min-h-[44px] items-center rounded-full border border-[#9A6B22]/40 bg-[#FFFDF8]/95 px-4 text-xs font-semibold text-[#2D1B10] shadow-2xs transition hover:bg-[#FDE8B8]/55 active:scale-95"
          >
            {getReplayLabel(language)}
          </button>
        </header>

        {/* Sunlit Festive Greeting Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[#9A6B22]/40 bg-gradient-to-br from-[#FFFDF8] via-[#FFF7E6] to-[#FDE8B8]/70 px-4 py-4 text-center shadow-[0_10px_28px_-14px_rgba(154,107,34,0.28)]">
          <MarigoldToranSvg />
          <p className="mt-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#1F6E4A]">
            {copy.heroSubline}
          </p>
          <h1 className="mt-1 break-words font-heading text-2xl font-bold tracking-tight text-[#2D1B10]">
            {data.receiverName}
          </h1>
          <p className="mt-1 text-xs font-medium text-[#5A3D28]">
            {activeMeta.subtitle[coreLang]}
          </p>
        </div>

        {/* SECTION 1: Interactive Festival Ritual Stage */}
        <section
          aria-labelledby={`stage-heading-${uid}`}
          className="space-y-3.5 rounded-3xl border border-[#9A6B22]/35 bg-[#FFFDF8]/95 p-4 shadow-[0_8px_24px_-12px_rgba(154,107,34,0.2)]"
        >
          <div className="text-center">
            <span className="inline-block rounded-full border border-[#9A6B22]/30 bg-[#FFF7E6] px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7A5114]">
              {copy.stageEyebrow}
            </span>
            <h2
              id={`stage-heading-${uid}`}
              className="mt-1.5 font-heading text-lg font-bold text-[#2D1B10]"
            >
              {copy.stageTitle}
            </h2>
          </div>

          <div
            role="tablist"
            aria-label={copy.festivalSwitcherLabel}
            className="grid grid-cols-3 gap-1.5 rounded-2xl border border-[#9A6B22]/30 bg-[#FFF7E6] p-1"
          >
            {FESTIVAL_ORDER.map((key) => {
              const isSelected = activeFestival === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveFestival(key)}
                  className={`min-h-[44px] rounded-xl px-1.5 text-[11px] font-bold leading-tight transition active:scale-95 ${
                    isSelected
                      ? 'bg-[#C83E2B] text-[#FFF7E6] shadow-xs'
                      : 'bg-transparent text-[#2D1B10] hover:bg-[#FDE8B8]/60'
                  }`}
                >
                  {FESTIVAL_META[key].tabLabel[coreLang]}
                </button>
              );
            })}
          </div>

          {(() => {
            const festivalArtMap: Record<
              FestivalKey,
              { src: string; caption: Record<CoreLanguageCode, string> }
            > = {
              sankranti: {
                src: '/templates/occasions/harvest-greeting/sankranti-kites-art.jpg',
                caption: {
                  en: 'Golden-hour rooftops, soaring kites & brass platters of sesame til-gud.',
                  hinglish: 'Dhoop bhari chhat, udate patang aur peetal ki thali mein til-gud.',
                  hi: 'स्वर्णिम छत पर उड़ती पतंगें और पीतल की थाली में तिल-गुड़।',
                },
              },
              lohri: {
                src: '/templates/occasions/harvest-greeting/lohri-bonfire-art.jpg',
                caption: {
                  en: 'Warm golden Lohri bonfire, phulkari courtyard & bowls of rewri, peanuts & popcorn.',
                  hinglish: 'Lohri ki garm aag, phulkari aangan aur moongfali-rewri ki khushboo.',
                  hi: 'लोहड़ी की पावन अग्नि, फुलकारी आँगन और मूँगफली-रेवड़ी का उत्सव।',
                },
              },
              pongal: {
                src: '/templates/occasions/harvest-greeting/cover.jpg',
                caption: {
                  en: 'Sunlit courtyard harvest morning, overflowing sweet Pongal & auspicious kolam.',
                  hinglish: 'Subah ka surya, meetha Pongal aur mangal rangoli.',
                  hi: 'प्रातःकालीन सूर्य, पावन पोंगल और शुभ कोलम।',
                },
              },
            };
            const currentArt = festivalArtMap[activeFestival];
            return (
              <div className="overflow-hidden rounded-2xl border border-[#9A6B22]/35 bg-[#2D1B10]">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={currentArt.src}
                    src={currentArt.src}
                    alt={FESTIVAL_META[activeFestival].tabLabel[coreLang]}
                    className="h-full w-full object-cover transition duration-500"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#26140B]/85 via-transparent to-transparent"
                  />
                  <div className="absolute inset-x-3 bottom-2.5 text-left text-[#FFF7E6]">
                    <p className="font-heading text-sm font-bold leading-snug">
                      {FESTIVAL_META[activeFestival].tabLabel[coreLang]}
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-[#FDE8B8]/95">
                      {currentArt.caption[coreLang]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeFestival === 'sankranti' ? (
            <SankrantiStage
              uid={uid}
              kiteCount={kiteCount}
              altitudeBoost={kiteBoost}
              cutBannerActive={cutDoriActive}
              onFlyKite={handleFlyKite}
              onCutDori={handleCutDori}
              copy={copy}
            />
          ) : activeFestival === 'lohri' ? (
            <LohriStage
              uid={uid}
              offerCount={lohriOfferings}
              onTossOffering={() => setLohriOfferings((c) => c + 1)}
              copy={copy}
            />
          ) : (
            <PongalStage
              uid={uid}
              boilCount={pongalBoils}
              onCelebratePongal={() => setPongalBoils((c) => c + 1)}
              copy={copy}
            />
          )}
        </section>

        {/* SECTION 2: Warm Family Harvest Letter & Highlights */}
        <section
          aria-label={copy.letterEyebrow}
          className="rounded-3xl border border-[#9A6B22]/45 bg-[#FDE8B8]/45 p-1.5 shadow-[0_6px_22px_-10px_rgba(154,107,34,0.22)]"
        >
          <div className="relative overflow-hidden rounded-[20px] border border-[#9A6B22]/35 bg-[#FFFDF8] px-4 py-5 text-center sm:px-5">
            <KolamCornerSvg className="pointer-events-none absolute top-1 left-1" />
            <KolamCornerSvg className="pointer-events-none absolute top-1 right-1 -scale-x-100" />

            <span className="relative z-10 inline-block rounded-full border border-[#9A6B22]/30 bg-[#FFF7E6] px-3.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#7A5114]">
              {copy.letterEyebrow}
            </span>

            <WordByWordFadeLine
              text={headlineText}
              active={opened}
              delayStepMs={55}
              className="relative z-10 mt-2.5 break-words font-heading text-xl font-bold leading-snug text-[#2D1B10]"
            />

            <BrassDivider />

            <p
              className={`relative z-10 mt-3 break-words text-left font-serif text-[16px] leading-[1.7] text-[#2D1B10] ${
                canUseDropCap
                  ? 'first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:font-heading first-letter:text-[38px] first-letter:font-bold first-letter:leading-[0.85] first-letter:text-[#C83E2B]'
                  : ''
              }`}
            >
              {messageText}
            </p>

            {data.highlights && data.highlights.length > 0 ? (
              <div className="clear-both mt-4 space-y-2 text-left">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#7A5114]">
                  {copy.highlightsHeading}
                </p>
                {data.highlights.map((item, idx) => (
                  <div
                    key={`${item.title.en}-${idx}`}
                    className="rounded-xl border border-[#9A6B22]/25 bg-[#FFF7E6] px-3.5 py-2.5"
                  >
                    <p className="text-xs font-bold text-[#C83E2B]">
                      {pickLocalizedText(item.title, language)}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#2D1B10]/85">
                      {pickLocalizedText(item.detail, language)}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="clear-both mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-[#9A6B22]/25 pt-3 text-xs font-semibold text-[#5A3D28]">
              <span>
                {copy.forLabel} {data.receiverName}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-[#C83E2B]">
                {copy.fromLabel} {data.senderName}
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 3: Interactive 3-Sweet Cultural Flipper */}
        <section
          aria-labelledby={`sweets-heading-${uid}`}
          className="rounded-3xl border border-[#9A6B22]/35 bg-[#FFFDF8]/95 p-4 shadow-[0_8px_24px_-12px_rgba(154,107,34,0.18)]"
        >
          <div className="text-center">
            <span className="inline-block rounded-full border border-[#1F6E4A]/30 bg-[#FFF7E6] px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1F6E4A]">
              {copy.sweetsEyebrow}
            </span>
            <h2
              id={`sweets-heading-${uid}`}
              className="mt-1.5 font-heading text-lg font-bold text-[#2D1B10]"
            >
              {copy.sweetsTitle}
            </h2>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {SWEET_ORDER.map((key) => {
              const isActive = activeSweet === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectSweet(key)}
                  aria-pressed={isActive}
                  className={`min-h-[44px] rounded-xl border px-1.5 py-1.5 text-[11px] font-bold leading-tight transition active:scale-95 ${
                    isActive
                      ? 'border-[#9A6B22] bg-[#FFF7E6] text-[#C83E2B] shadow-2xs'
                      : 'border-[#9A6B22]/25 bg-white text-[#5A3D28] hover:bg-[#FFF7E6]/60'
                  }`}
                >
                  {SWEET_KEEPSAKES[key].name[coreLang]}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleToggleSweetFlip}
            aria-pressed={isCurrentSweetFlipped}
            className="mt-3 flex min-h-[164px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#9A6B22]/45 bg-[#FFF7E6] p-4 text-center transition hover:border-[#C83E2B]/55 active:scale-[0.99]"
          >
            {!isCurrentSweetFlipped ? (
              <div
                key={`front-${activeSweet}`}
                className={`harvest-fade-${uid} flex flex-col items-center gap-1.5`}
              >
                <SweetEmblemSvg sweetKey={activeSweet} />
                <p className="font-heading text-base font-bold text-[#2D1B10]">
                  {currentSweet.name[coreLang]}
                </p>
                <p className="text-xs font-semibold text-[#7A5114]">
                  {currentSweet.festivalOrigin[coreLang]}
                </p>
                <span className="mt-1 inline-flex min-h-[32px] items-center rounded-full bg-[#FFFDF8] px-3.5 py-1 text-[11px] font-bold text-[#C83E2B] ring-1 ring-[#C83E2B]/25">
                  {copy.flipToMeaningLabel}
                </span>
              </div>
            ) : (
              <div
                key={`back-${activeSweet}`}
                className={`harvest-fade-${uid} flex flex-col items-center gap-2`}
              >
                <span className="rounded-full bg-[#1F6E4A] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FFF7E6]">
                  {copy.culturalMeaningLabel}
                </span>
                <p className="text-xs font-medium leading-relaxed text-[#2D1B10]">
                  {currentSweet.meaning[coreLang]}
                </p>
                <p className="rounded-xl border border-[#9A6B22]/25 bg-[#FFFDF8] px-3 py-2 font-serif text-xs font-semibold text-[#C83E2B]">
                  {currentSweet.blessingNote[coreLang]}
                </p>
                <span className="text-[11px] font-bold text-[#7A5114]">
                  {copy.flipToFrontLabel}
                </span>
              </div>
            )}
          </button>
        </section>

        {/* SECTION 4: Adaptive Memories */}
        <section
          aria-labelledby={`album-heading-${uid}`}
          className="rounded-3xl border border-[#9A6B22]/35 bg-[#FFFDF8]/95 p-4 shadow-[0_8px_24px_-12px_rgba(154,107,34,0.18)]"
        >
          <div className="text-center">
            <span className="inline-block rounded-full border border-[#9A6B22]/30 bg-[#FFF7E6] px-3.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#7A5114]">
              {copy.albumEyebrow}
            </span>
            <h2
              id={`album-heading-${uid}`}
              className="mt-2 font-heading text-lg font-bold text-[#2D1B10]"
            >
              {copy.albumTitle}
            </h2>
          </div>

          <OccasionAdaptiveGallery
            photos={data.photos}
            accentColor="#C83E2B"
            captionPrefix={copy.photoCaptionPrefix}
            emptyFallback={
              <div className="mt-3 flex flex-col items-center rounded-2xl border border-[#9A6B22]/30 bg-[#FFF7E6] px-4 py-5 text-center">
                <HarvestCrestSvg className="h-16 w-16" />
                <p className="mt-2 font-heading text-sm font-bold text-[#2D1B10]">
                  {copy.albumEmptyTitle}
                </p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-[#5A3D28]">
                  {copy.albumEmptyBody}
                </p>
              </div>
            }
          />

          {data.photos && data.photos.length > 0 ? (
            <p className="mt-2.5 text-center text-xs font-medium text-[#5A3D28]">
              {copy.albumHint}
            </p>
          ) : null}
        </section>

        {/* SECTION 5: Folk Acoustic Sanctuary */}
        <CurvedTrackSanctuary
          tracks={sanctuaryTracks}
          mood="festive"
          accentColor="#C83E2B"
          dark={false}
          heading={copy.sanctuaryHeading}
        />

        {/* SECTION 6: Return Harvest Blessing Seal */}
        <section
          aria-labelledby={`return-heading-${uid}`}
          className="space-y-3.5 rounded-3xl border border-[#9A6B22]/35 bg-[#FFFDF8]/95 p-4 shadow-[0_8px_24px_-12px_rgba(154,107,34,0.18)]"
        >
          <div className="text-center">
            <MarigoldToranSvg />
            <span className="mt-1 inline-block rounded-full border border-[#C83E2B]/30 bg-[#FFF7E6] px-3.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#C83E2B]">
              {copy.returnEyebrow}
            </span>
            <h2
              id={`return-heading-${uid}`}
              className="mt-2 font-heading text-lg font-bold text-[#2D1B10]"
            >
              {copy.returnTitle}
            </h2>
            <p className="mt-1 text-xs font-medium text-[#5A3D28]">{copy.returnPrompt}</p>
          </div>

          <div className="space-y-2 text-left">
            {RETURN_BLESSINGS.map((option) => {
              const isPicked = selectedBlessingId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setSelectedBlessingId(option.id);
                    if (blessingSealed) {
                      handleResealReset();
                    }
                  }}
                  aria-pressed={isPicked}
                  className={`flex min-h-[44px] w-full flex-col rounded-xl border px-3.5 py-2.5 text-left transition active:scale-[0.99] ${
                    isPicked
                      ? 'border-[#C83E2B] bg-[#FFF7E6] shadow-2xs'
                      : 'border-[#9A6B22]/25 bg-white hover:bg-[#FFF7E6]/60'
                  }`}
                >
                  <span className="text-xs font-bold text-[#2D1B10]">
                    {option.label[coreLang]}
                  </span>
                  <span className="mt-0.5 text-[11px] leading-relaxed text-[#5A3D28]">
                    {option.note[coreLang]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-[#9A6B22]/30 bg-[#FFF7E6] px-3 py-2 text-center text-xs font-semibold text-[#7A5114]">
            {copy.returnAddressedTo(data.senderName, data.receiverName)}
          </div>

          {/* Warm dark terracotta wax-seal sanctuary so HoldToChargeRing contrast stays crisp */}
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E69F00]/45 bg-gradient-to-br from-[#3A1710] via-[#512015] to-[#2B120C] px-4 py-5 text-center text-[#FFF7E6] shadow-md">
            <HoldToChargeRing
              key={sealCycle}
              label={copy.sealHoldLabel}
              chargingLabel={copy.sealChargingLabel}
              completeLabel={copy.sealCompleteLabel}
              accentColor="#E69F00"
              durationMs={1100}
              onComplete={handleSealComplete}
            />

            {blessingSealed ? (
              <div
                role="status"
                className={`harvest-pop-${uid} w-full space-y-2 rounded-2xl border border-[#E69F00]/40 bg-[#1F6E4A] px-4 py-3 text-left text-[#FFF7E6] shadow-sm`}
              >
                <div className="flex items-start gap-2.5">
                  <svg
                    viewBox="0 0 24 24"
                    className="mt-0.5 h-5 w-5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-xs font-bold">
                      {copy.returnToastTitle(data.senderName)} ({sealCount})
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-[#FFF7E6]/90">
                      {chosenBlessing.label[coreLang]} — {copy.returnToastBody}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResealReset}
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[#FFF7E6]/35 bg-[#FFF7E6]/15 px-3 py-2 text-xs font-bold text-[#FFF7E6] transition hover:bg-[#FFF7E6]/25 active:scale-[0.98]"
                >
                  {copy.returnResealCta}
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <footer className="border-t border-[#9A6B22]/25 pt-3 pb-1 text-center text-[11px] font-medium text-[#5A3D28]">
          {getWebzyFooterLabel(language)}
        </footer>
      </div>
    </div>
  );
}
