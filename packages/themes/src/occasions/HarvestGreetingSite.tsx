'use client';

import React, { useEffect, useState } from 'react';
import {
  type CoreLanguageCode,
  pickLocalizedText,
  toCoreLanguageCode,
} from '@webzy/core';
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

type FestivalKey = 'sankranti' | 'lohri' | 'pongal';
type HarvestChapterId = 'stage' | 'blessings' | 'album' | 'return';
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
  tabs: Record<HarvestChapterId, string>;
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
  filmstripCaption: string;
  filmstripFrames: string[];
  photoCaptionPrefix: string;
  cassetteEyebrow: string;
  cassetteTrackTitle: string;
  cassetteTapLabel: string;
  cassettePlayingLabel: string;
  returnEyebrow: string;
  returnTitle: string;
  returnPrompt: string;
  returnAddressedTo: (sender: string, receiver: string) => string;
  returnSealCta: string;
  returnResealCta: string;
  returnToastTitle: (sender: string) => string;
  returnToastBody: string;
  nextChapterPrefix: string;
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
const CHAPTER_ORDER: readonly HarvestChapterId[] = ['stage', 'blessings', 'album', 'return'];
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
    tabs: {
      stage: 'Festival Stage',
      blessings: 'Blessing & Sweets',
      album: 'Album & Chimes',
      return: 'Return Blessing',
    },
    festivalSwitcherLabel: 'Choose harvest tradition',
    flyKiteCta: (count) => `Fly Kite (${count}/6)`,
    cutDoriCta: 'Cut Dori',
    sankrantiPrompt: 'Tap kites or launch higher into the golden Uttarayan sky',
    sankrantiSoarWish: (count) =>
      `${count} kites soaring high — wishing your family bright horizons.`,
    sankrantiKaiPoChe: 'Kai Po Che! Cheerful harvest wishes echo across the rooftops.',
    lohriOfferCta: 'Offer Til, Gud & Rewari',
    lohriPrompt: 'Toss sesame & jaggery into the bonfire to raise harvest warmth',
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
    pongalOverflowCount: (count) => `Sacred Overflow Celebrated (${count})`,
    letterEyebrow: 'Family Harvest Letter',
    letterTitle: 'Warm Wishes From Home',
    highlightsHeading: 'Festive Moments',
    sweetsEyebrow: 'Sweet & Tradition Keepsake',
    sweetsTitle: 'Tap & Flip Traditional Treats',
    flipToMeaningLabel: 'Reveal Cultural Meaning',
    flipToFrontLabel: 'Show Sweet Emblem',
    culturalMeaningLabel: 'Cultural Blessing',
    albumEyebrow: 'Harvest Keepsake Reel',
    albumTitle: 'Festive Memories',
    albumHint: 'Tap any portrait to inspect full screen',
    filmstripCaption: 'HARVEST HEIRLOOM REEL · ARCHIVE',
    filmstripFrames: ['Sunlit Kite Sky', 'Lohri Courtyard', 'Pongal Abundance'],
    photoCaptionPrefix: 'Harvest',
    cassetteEyebrow: 'Festive Folk Chimes',
    cassetteTrackTitle: 'Dholki & Harvest Chime',
    cassetteTapLabel: 'Tap to Play · Festive Chime',
    cassettePlayingLabel: 'Playing · Harvest Melody',
    returnEyebrow: 'Send Warmth Back',
    returnTitle: 'Return Harvest Blessing',
    returnPrompt: 'Choose a blessing to seal and send back:',
    returnAddressedTo: (sender, receiver) => `To ${sender} · From ${receiver}`,
    returnSealCta: 'Seal & Send Return Blessing',
    returnResealCta: 'Send Another Blessing',
    returnToastTitle: (sender) => `Blessing Sealed for ${sender}`,
    returnToastBody: 'Pressed with golden marigold and harvest gratitude.',
    nextChapterPrefix: 'Next Chapter',
  },
  hinglish: {
    previewBanner: 'WEBZY FREE PREVIEW',
    coverEyebrow: 'Tyohar Keepsake · Harvest Utsav',
    forLabel: 'Kiske liye',
    fromLabel: 'Bheja hai',
    openCta: 'Step Into Celebration',
    tabs: {
      stage: 'Festival Stage',
      blessings: 'Blessing & Sweets',
      album: 'Album & Chimes',
      return: 'Return Blessing',
    },
    festivalSwitcherLabel: 'Festival tradition chuno',
    flyKiteCta: (count) => `Fly Kite (${count}/6)`,
    cutDoriCta: 'Cut Dori',
    sankrantiPrompt: 'Aasman mein patang udao ya dori kaat kar Kai Po Che bolo',
    sankrantiSoarWish: (count) =>
      `${count} patangein oonchi ud rahi hain — khushiyon ki udaan!`,
    sankrantiKaiPoChe: 'Kai Po Che! Chhat se chhat tak tyohar ki khushi goonj uthi.',
    lohriOfferCta: 'Offer Til, Gud & Rewari',
    lohriPrompt: 'Agni mein til, gud aur rewari arpit karne ke liye tap karein',
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
    pongalOverflowCount: (count) => `Shubh Utsav Celebrated (${count})`,
    letterEyebrow: 'Parivaar ka Sandesh',
    letterTitle: 'Tyohar ki Mithaas',
    highlightsHeading: 'Khaas Baatein',
    sweetsEyebrow: 'Mithai & Parampara Flipper',
    sweetsTitle: 'Tap Karke Parampara Dekhein',
    flipToMeaningLabel: 'Arth aur Aashirwad Dekhein',
    flipToFrontLabel: 'Mithai Card Wapas Dekhein',
    culturalMeaningLabel: 'Parampara Sandesh',
    albumEyebrow: 'Utsav Album',
    albumTitle: 'Tyohar ki Yaadein',
    albumHint: 'Badi photo dekhne ke liye tap karein',
    filmstripCaption: 'HARVEST UTSAV REEL · ARCHIVE',
    filmstripFrames: ['Patang Aasman', 'Lohri Agni', 'Pongal Paanai'],
    photoCaptionPrefix: 'Utsav',
    cassetteEyebrow: 'Mangal Folk Dhun',
    cassetteTrackTitle: 'Dholki & Harvest Chime',
    cassetteTapLabel: 'Tap Karein · Festive Chime',
    cassettePlayingLabel: 'Baj Rahi Hai · Harvest Dhun',
    returnEyebrow: 'Wapas Shubhkamnayein',
    returnTitle: 'Return Harvest Blessing',
    returnPrompt: 'Ek shubhkamna chuno aur seal karke wapas bhejo:',
    returnAddressedTo: (sender, receiver) => `${sender} ke liye · ${receiver} ki taraf se`,
    returnSealCta: 'Seal & Send Return Blessing',
    returnResealCta: 'Ek Aur Aashirwad Bhejein',
    returnToastTitle: (sender) => `${sender} ke liye Blessing Seal Hui`,
    returnToastBody: 'Gende ke phool aur til-gud ki mithaas ke saath surakshit.',
    nextChapterPrefix: 'Agla Adhyay',
  },
  hi: {
    previewBanner: 'WEBZY निःशुल्क पूर्वावलोकन',
    coverEyebrow: 'फसल पर्व · मंगल स्मृति',
    forLabel: 'प्रेषित',
    fromLabel: 'प्रेषक',
    openCta: 'उत्सव में प्रवेश करें',
    tabs: {
      stage: 'उत्सव मंच',
      blessings: 'संदेश व मिठाई',
      album: 'यादें व धुन',
      return: 'शुभकामना भेजें',
    },
    festivalSwitcherLabel: 'पर्व परंपरा चुनें',
    flyKiteCta: (count) => `पतंग उड़ाएँ (${count}/6)`,
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
    pongalOverflowCount: (count) => `मंगल उत्सव मनाया गया (${count})`,
    letterEyebrow: 'परिवार की ओर से संदेश',
    letterTitle: 'स्नेह और शुभकामना पत्र',
    highlightsHeading: 'पर्व की विशेष झलकियाँ',
    sweetsEyebrow: 'मिठाई व परंपरा पुस्तिका',
    sweetsTitle: 'कार्ड पलटकर परंपरा जानें',
    flipToMeaningLabel: 'सांस्कृतिक अर्थ देखें',
    flipToFrontLabel: 'मिठाई चिह्न देखें',
    culturalMeaningLabel: 'मंगल आशीर्वचन',
    albumEyebrow: 'उत्सव एल्बम',
    albumTitle: 'त्योहार की मधुर यादें',
    albumHint: 'बड़ी फ़ोटो देखने के लिए टैप करें',
    filmstripCaption: 'फसल उत्सव स्मृति रील · धरोहर',
    filmstripFrames: ['पतंग आकाश', 'लोहड़ी अग्नि', 'पोंगल पात्र'],
    photoCaptionPrefix: 'उत्सव',
    cassetteEyebrow: 'मंगल लोक धुन',
    cassetteTrackTitle: 'ढोलकी व उत्सव धुन',
    cassetteTapLabel: 'सुनने के लिए टैप करें · उत्सव धुन',
    cassettePlayingLabel: 'बज रही है · मंगल धुन',
    returnEyebrow: 'शुभकामना उत्तर',
    returnTitle: 'आशीर्वाद व शुभकामना भेजें',
    returnPrompt: 'अपनों को भेजने के लिए एक शुभकामना चुनें:',
    returnAddressedTo: (sender, receiver) => `${sender} के लिए · ${receiver} की ओर से`,
    returnSealCta: 'मुहर लगाकर शुभकामना भेजें',
    returnResealCta: 'एक और शुभकामना भेजें',
    returnToastTitle: (sender) => `${sender} के लिए शुभकामना सहेजी गई`,
    returnToastBody: 'गेंदे के पुष्प और तिल-गुड़ की मिठास के साथ सुरक्षित।',
    nextChapterPrefix: 'अगला अध्याय',
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
function HarvestCrestSvg() {
  const rays = Array.from({ length: 12 }, (_, idx) => idx * 30);
  return (
    <svg
      viewBox="0 0 120 120"
      className="h-20 w-20 sm:h-24 sm:w-24 animate-float motion-reduce:animate-none"
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
      {/* Geometric center diamond kite */}
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
        {/* Pyramid of 3 golden tilgul ladoos */}
        <circle cx="33" cy="46" r="10.5" fill="#E69F00" stroke="#9A6B22" strokeWidth="1.4" />
        <circle cx="55" cy="46" r="10.5" fill="#D48C00" stroke="#9A6B22" strokeWidth="1.4" />
        <circle cx="44" cy="30" r="11" fill="#F2B129" stroke="#9A6B22" strokeWidth="1.5" />
        {/* Sesame speckles */}
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
        {/* Crisp gajak bars */}
        <rect x="20" y="34" width="28" height="16" rx="3" transform="rotate(-8 34 42)" fill="#E69F00" stroke="#9A6B22" strokeWidth="1.4" />
        <rect x="34" y="28" width="28" height="16" rx="3" transform="rotate(6 48 36)" fill="#F3B83E" stroke="#9A6B22" strokeWidth="1.4" />
        {/* Rewari medallions */}
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
      {/* Brass bowl of sakkarai pongal */}
      <path d="M22 36 C24 51, 33 56, 44 56 C55 56, 64 51, 66 36 Z" fill="#E69F00" stroke="#9A6B22" strokeWidth="1.5" />
      <ellipse cx="44" cy="36" rx="22" ry="6.5" fill="#B86B11" stroke="#9A6B22" strokeWidth="1.4" />
      {/* Cashew & cardamom accents */}
      <path d="M36 35 Q40 31 43 35" fill="none" stroke="#FFF7E6" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="50" cy="36" rx="3" ry="1.8" fill="#1F6E4A" />
      <circle cx="44" cy="24" r="1.4" fill="#9A6B22" opacity="0.5" />
      <path d="M40 26 Q37 20 41 15" fill="none" stroke="#9A6B22" strokeWidth="1.3" strokeOpacity="0.55" strokeLinecap="round" />
      <path d="M48 26 Q51 20 47 15" fill="none" stroke="#9A6B22" strokeWidth="1.3" strokeOpacity="0.55" strokeLinecap="round" />
    </svg>
  );
}

function SankrantiStage({
  kiteCount,
  altitudeBoost,
  cutBannerActive,
  onFlyKite,
  onCutDori,
  copy,
}: {
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
        className="relative h-56 w-full overflow-hidden rounded-2xl border border-[#9A6B22]/35 shadow-inner"
        style={{
          background:
            'linear-gradient(180deg, #FDE8B8 0%, #FFEFC8 54%, #FFF7E6 100%)',
        }}
      >
        <svg viewBox="0 0 360 210" className="h-full w-full" aria-hidden="true">
          {/* Rising Uttarayan sun */}
          <circle cx="298" cy="48" r="34" fill="#E69F00" opacity="0.25" />
          <circle cx="298" cy="48" r="21" fill="#E69F00" opacity="0.88" />
          {/* Soft paper-cut clouds */}
          <path
            d="M24 54 Q38 40 54 48 Q68 36 84 48 Q96 48 96 58 L24 58 Z"
            fill="#FFFDF8"
            opacity="0.8"
          />
          <path
            d="M188 38 Q202 26 216 34 Q228 24 242 36 L188 38 Z"
            fill="#FFFDF8"
            opacity="0.72"
          />
          {/* Dotted manjha string trails converging to Bareilly firki */}
          {visibleKites.map((kite, idx) => {
            const liftedY = Math.max(10, kite.y - (altitudeBoost % 3) * 4);
            const kx = (kite.x / 100) * 340 + 10;
            const ky = (liftedY / 100) * 165 + 10;
            const isCut = cutBannerActive && idx === visibleKites.length - 1;
            return (
              <path
                key={`trail-${idx}`}
                d={`M ${kx} ${ky + 12} Q ${(kx + 56) / 2} ${ky + 62} ${isCut ? kx - 18 : 58} ${isCut ? ky + 48 : 178}`}
                fill="none"
                stroke="#9A6B22"
                strokeWidth="1.1"
                strokeOpacity={isCut ? '0.65' : '0.4'}
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

        {/* Interactive diamond patangs */}
        {visibleKites.map((kite, idx) => {
          const liftedY = Math.max(12, kite.y - (altitudeBoost % 3) * 4);
          const isCutKite = cutBannerActive && idx === visibleKites.length - 1;
          return (
            <button
              key={idx}
              type="button"
              onClick={onFlyKite}
              aria-label={`Festival patang ${idx + 1}`}
              style={{
                left: `${kite.x}%`,
                top: `${isCutKite ? Math.max(10, liftedY - 8) : liftedY}%`,
                animationDelay: `${idx * 170}ms`,
              }}
              className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full animate-kite-sway transition-all duration-300 hover:scale-110 active:scale-95 motion-reduce:animate-none"
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
            </button>
          );
        })}

        <div className="pointer-events-none absolute inset-x-3 bottom-2.5 flex justify-center">
          <span
            className={`rounded-full px-3 py-1 text-center text-[11px] font-bold shadow-xs ring-1 transition ${
              cutBannerActive
                ? 'bg-[#C83E2B] text-[#FFF7E6] ring-[#FFF7E6]/40 animate-pop-bounce'
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
  offerCount,
  onTossOffering,
  copy,
}: {
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
        className="relative flex h-56 w-full flex-col items-center justify-end overflow-hidden rounded-2xl border border-[#9A6B22]/45 p-3"
        style={{
          background:
            'linear-gradient(180deg, #2D1810 0%, #5B2416 54%, #91381B 100%)',
        }}
      >
        <svg viewBox="0 0 360 190" className="h-full w-full" aria-hidden="true">
          {/* Rising golden sparks */}
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

          {/* Harvested golden wheat stalks framing left & right */}
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

          {/* Layered bonfire flames */}
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

          {/* Crossed logs */}
          <rect x="132" y="138" width="96" height="12" rx="6" transform="rotate(-9 180 144)" fill="#5A3317" />
          <rect x="132" y="140" width="96" height="12" rx="6" transform="rotate(10 180 146)" fill="#7A451E" />

          {/* Brass thali of til, rewari & gajak */}
          <g transform="translate(262, 148)">
            <ellipse cx="28" cy="18" rx="30" ry="9" fill="#E69F00" stroke="#9A6B22" strokeWidth="1.5" />
            <circle cx="16" cy="14" r="4.5" fill="#FFF7E6" />
            <circle cx="25" cy="12" r="4.5" fill="#FDE6B1" />
            <circle cx="34" cy="14" r="4.5" fill="#E69F00" />
            <rect x="19" y="15" width="12" height="5" rx="1.5" fill="#9A6B22" />
          </g>
        </svg>

        <div className="relative z-10 flex w-full flex-col items-center gap-1.5">
          <div className="flex w-full max-w-[230px] items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-[#FFF7E6]">
            <span>{copy.lohriWarmthLabel(warmth, offerCount)}</span>
          </div>
          <div className="h-1.5 w-full max-w-[230px] overflow-hidden rounded-full bg-black/40">
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
  boilCount,
  onCelebratePongal,
  copy,
}: {
  boilCount: number;
  onCelebratePongal: () => void;
  copy: HarvestCopy;
}) {
  const frothLift = boilCount > 0 ? 4 + (boilCount % 3) * 3 : 0;

  return (
    <div className="space-y-3">
      <div
        className="relative flex h-56 w-full flex-col items-center justify-end overflow-hidden rounded-2xl border border-[#9A6B22]/35 p-3"
        style={{
          background:
            'linear-gradient(180deg, #FFFDF8 0%, #FFF7E6 62%, #FDE8B8 100%)',
        }}
      >
        <svg viewBox="0 0 360 190" className="h-full w-full" aria-hidden="true">
          {/* Symmetrical pulli kolam mandala beneath the pot */}
          <g transform="translate(180, 162)" opacity="0.92">
            <ellipse cx="0" cy="0" rx="112" ry="20" fill="none" stroke="#FFFFFF" strokeWidth="2.4" />
            <ellipse cx="0" cy="0" rx="88" ry="14" fill="none" stroke="#C83E2B" strokeWidth="1.6" strokeDasharray="5 4" />
            {[-76, -38, 0, 38, 76].map((dx) => (
              <circle key={dx} cx={dx} cy={0} r="3" fill={dx === 0 ? '#C83E2B' : '#9A6B22'} />
            ))}
          </g>

          {/* Crossed segmented emerald sugarcane stalks */}
          <g>
            <line x1="94" y1="162" x2="246" y2="26" stroke="#1F6E4A" strokeWidth="8" strokeLinecap="round" />
            <line x1="266" y1="162" x2="114" y2="26" stroke="#28845A" strokeWidth="8" strokeLinecap="round" />
            <path d="M242 28 Q272 16 286 32" fill="none" stroke="#1F6E4A" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M118 28 Q88 16 74 32" fill="none" stroke="#28845A" strokeWidth="3.5" strokeLinecap="round" />
          </g>

          {/* Steam curls rising above the brass pot */}
          <path
            d={`M164 ${66 - frothLift} Q156 46 168 30`}
            fill="none"
            stroke="#9A6B22"
            strokeWidth="2"
            strokeOpacity="0.5"
            strokeLinecap="round"
          />
          <path
            d={`M196 ${64 - frothLift} Q206 44 192 28`}
            fill="none"
            stroke="#9A6B22"
            strokeWidth="2"
            strokeOpacity="0.5"
            strokeLinecap="round"
          />

          {/* Embossed brass Pongal pot (paanai) */}
          <ellipse cx="180" cy="118" rx="44" ry="38" fill="#E69F00" stroke="#9A6B22" strokeWidth="2" />
          <ellipse cx="166" cy="112" rx="14" ry="22" fill="#FFF7E6" opacity="0.38" />
          <rect x="148" y="72" width="64" height="14" rx="7" fill="#9A6B22" stroke="#6E4A13" strokeWidth="1.6" />

          {/* Mango leaves & kumkum collar tied around neck */}
          <path d="M152 86 L142 104 L160 98 Z" fill="#1F6E4A" />
          <path d="M180 86 L173 106 L187 106 Z" fill="#28845A" />
          <path d="M208 86 L218 104 L200 98 Z" fill="#1F6E4A" />
          <line x1="147" y1="86" x2="213" y2="86" stroke="#C83E2B" strokeWidth="3" />

          {/* Frothy milk overflowing the rim */}
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
              ? 'bg-[#1F6E4A] text-[#FFF7E6] ring-[#FFF7E6]/40 animate-pop-bounce'
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
 * 4-Chapter Indian Harvest Microsite ("Makar Sankranti, Lohri & Pongal Festive Keepsake")
 * crafted in Golden Harvest Parchment & Festive Craft aesthetic.
 */
export function HarvestGreetingSite({
  manifest: _manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const initialFestival = normalizeFestival(data.relation);
  const [opened, setOpened] = useState(false);
  const [activeChapter, setActiveChapter] = useState<HarvestChapterId>('stage');
  const [activeFestival, setActiveFestival] = useState<FestivalKey>(initialFestival);

  // Chapter 1 ritual states
  const [kiteCount, setKiteCount] = useState(3);
  const [kiteBoost, setKiteBoost] = useState(0);
  const [cutDoriActive, setCutDoriActive] = useState(false);
  const [lohriOfferings, setLohriOfferings] = useState(1);
  const [pongalBoils, setPongalBoils] = useState(0);

  // Chapter 2 Sweet & Tradition Keepsake Flipper states
  const [activeSweet, setActiveSweet] = useState<SweetKey>('tilgul');
  const [sweetFlipped, setSweetFlipped] = useState(false);

  // Chapter 4 Return Blessing states
  const [selectedBlessingId, setSelectedBlessingId] = useState<string>(RETURN_BLESSINGS[0].id);
  const [blessingSealed, setBlessingSealed] = useState(false);
  const [sealCount, setSealCount] = useState(0);

  useEffect(() => {
    setActiveFestival(normalizeFestival(data.relation));
  }, [data.relation]);

  const coreLang = toCoreLanguageCode(language);
  const copy = HARVEST_COPY[coreLang] ?? HARVEST_COPY.en;
  const activeMeta = FESTIVAL_META[activeFestival];
  const coverMeta = FESTIVAL_META[initialFestival];
  const messageText = pickLocalizedText(data.message, language);
  const canUseDropCap = coreLang !== 'hi' && /^[A-Za-z]/.test(messageText.trim());
  const chapterTabs = CHAPTER_ORDER.map((id) => ({ id, label: copy.tabs[id] }));
  const nextChapterId =
    CHAPTER_ORDER[(CHAPTER_ORDER.indexOf(activeChapter) + 1) % CHAPTER_ORDER.length];
  const currentSweet = SWEET_KEEPSAKES[activeSweet];

  function handleOpen() {
    setOpened(true);
    setActiveChapter('stage');
    onOpened?.();
  }

  function handleReplay() {
    setOpened(false);
    setActiveChapter('stage');
  }

  function goNextChapter() {
    setActiveChapter(nextChapterId);
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
    setSweetFlipped(false);
  }

  function handleSealReturnBlessing() {
    setBlessingSealed(true);
    setSealCount((c) => c + 1);
  }

  if (!opened) {
    return (
      <div className="relative flex min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#FFF7E6] text-[#2D1B10]">
        <OccasionArtworkBackdrop
          src="/templates/occasions/harvest-greeting/cover.jpg"
          fallbackGradient="linear-gradient(155deg, #FFF7E6 0%, #FDE8BC 58%, #F8D38A 100%)"
          className="object-cover object-center opacity-40"
        />

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
          <div className="relative flex w-full max-w-md flex-col items-center overflow-hidden rounded-t-[160px] rounded-b-[28px] border-2 border-[#9A6B22]/70 bg-[#FFF7E6]/92 px-5 pt-3 pb-6 text-center shadow-[0_18px_42px_-16px_rgba(154,107,34,0.32)] backdrop-blur-xs">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-2 rounded-t-[150px] rounded-b-[22px] border border-[#C83E2B]/35"
            />

            <MarigoldToranSvg />

            <div className="relative mt-1 flex w-full flex-col items-center">
              <HarvestCrestSvg />

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

              {/* Sender & Recipient Ribbon */}
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
    <div className="relative flex min-h-full w-full flex-col justify-between gap-3.5 overflow-hidden rounded-[28px] bg-[#FFF7E6] text-[#2D1B10] animate-fade-in motion-reduce:animate-none">
      {watermarked ? (
        <div
          aria-hidden="true"
          className="flex justify-center border-b border-[#9A6B22]/25 bg-[#FFFDF8]/90 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#C83E2B]"
        >
          {copy.previewBanner}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col justify-between gap-3.5 p-4 pt-3 sm:px-5">
        {/* Top bar + 4-Chapter Navigation */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex min-h-[32px] items-center rounded-full border border-[#9A6B22]/35 bg-[#FFFDF8] px-3 py-1 text-[10.5px] font-bold tracking-wider text-[#7A5114]">
              {activeMeta.badge[coreLang]}
            </span>
            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex min-h-[44px] items-center rounded-full border border-[#9A6B22]/40 bg-[#FFFDF8] px-4 text-xs font-semibold text-[#2D1B10] shadow-2xs transition hover:bg-[#FDE8B8]/55 active:scale-95"
            >
              {getReplayLabel(language)}
            </button>
          </div>

          <OccasionChapterNav
            tabs={chapterTabs}
            activeId={activeChapter}
            onSelect={(id) => setActiveChapter(id as HarvestChapterId)}
            accentColor="#C83E2B"
          />
        </div>

        {/* CHAPTER 01: Festival Stage */}
        {activeChapter === 'stage' ? (
          <section
            role="tabpanel"
            aria-label={copy.tabs.stage}
            className="flex flex-1 flex-col justify-between gap-3.5 rounded-2xl border border-[#9A6B22]/35 bg-[#FFFDF8] p-4 shadow-[0_8px_24px_-12px_rgba(154,107,34,0.2)] animate-fade-in motion-reduce:animate-none"
          >
            <div className="space-y-3">
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

              {activeFestival === 'sankranti' ? (
                <SankrantiStage
                  kiteCount={kiteCount}
                  altitudeBoost={kiteBoost}
                  cutBannerActive={cutDoriActive}
                  onFlyKite={handleFlyKite}
                  onCutDori={handleCutDori}
                  copy={copy}
                />
              ) : activeFestival === 'lohri' ? (
                <LohriStage
                  offerCount={lohriOfferings}
                  onTossOffering={() => setLohriOfferings((c) => c + 1)}
                  copy={copy}
                />
              ) : (
                <PongalStage
                  boilCount={pongalBoils}
                  onCelebratePongal={() => setPongalBoils((c) => c + 1)}
                  copy={copy}
                />
              )}
            </div>

            <button
              type="button"
              onClick={goNextChapter}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 self-center rounded-full border border-[#9A6B22]/45 bg-[#FFF7E6] px-6 py-2 text-xs font-bold text-[#7A5114] transition hover:bg-[#FDE8B8]/70 active:scale-[0.98]"
            >
              <span>
                {copy.nextChapterPrefix}: {copy.tabs[nextChapterId]}
              </span>
              <NextArrowIcon />
            </button>
          </section>
        ) : null}

        {/* CHAPTER 02: Blessing & Sweets */}
        {activeChapter === 'blessings' ? (
          <section
            role="tabpanel"
            aria-label={copy.tabs.blessings}
            className="flex flex-1 flex-col justify-between gap-4 animate-fade-in motion-reduce:animate-none"
          >
            {/* Warm bordered family letter card */}
            <div className="rounded-2xl border border-[#9A6B22]/45 bg-[#FDE8B8]/40 p-1.5 shadow-[0_6px_22px_-10px_rgba(154,107,34,0.22)]">
              <div className="relative overflow-hidden rounded-[12px] border border-[#9A6B22]/35 bg-[#FFFDF8] px-4 py-5 text-center sm:px-5">
                <KolamCornerSvg className="pointer-events-none absolute top-1 left-1" />
                <KolamCornerSvg className="pointer-events-none absolute top-1 right-1 -scale-x-100" />

                <span className="relative z-10 inline-block rounded-full border border-[#9A6B22]/30 bg-[#FFF7E6] px-3.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#7A5114]">
                  {copy.letterEyebrow}
                </span>

                <h3 className="relative z-10 mt-2.5 break-words font-heading text-xl font-bold leading-snug text-[#2D1B10]">
                  {pickLocalizedText(data.headline, language) || copy.letterTitle}
                </h3>

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
                        className="rounded-xl border border-[#9A6B22]/25 bg-[#FFF7E6] px-3 py-2"
                      >
                        <p className="text-xs font-bold text-[#C83E2B]">
                          {pickLocalizedText(item.title, language)}
                        </p>
                        <p className="mt-0.5 text-xs text-[#2D1B10]/85">
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
            </div>

            {/* Interactive Sweet & Tradition Keepsake Flipper */}
            <div className="rounded-2xl border border-[#9A6B22]/35 bg-[#FFFDF8] p-4 shadow-2xs">
              <div className="text-center">
                <span className="inline-block rounded-full border border-[#1F6E4A]/30 bg-[#FFF7E6] px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1F6E4A]">
                  {copy.sweetsEyebrow}
                </span>
                <h4 className="mt-1.5 font-heading text-base font-bold text-[#2D1B10]">
                  {copy.sweetsTitle}
                </h4>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {SWEET_ORDER.map((key) => {
                  const isActive = activeSweet === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectSweet(key)}
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
                onClick={() => setSweetFlipped((f) => !f)}
                aria-pressed={sweetFlipped}
                className="mt-3 flex min-h-[144px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#9A6B22]/45 bg-[#FFF7E6] p-4 text-center transition hover:border-[#C83E2B]/55 active:scale-[0.99]"
              >
                {!sweetFlipped ? (
                  <div className="flex flex-col items-center gap-1.5 animate-fade-in motion-reduce:animate-none">
                    <SweetEmblemSvg sweetKey={activeSweet} />
                    <p className="font-heading text-base font-bold text-[#2D1B10]">
                      {currentSweet.name[coreLang]}
                    </p>
                    <p className="text-xs font-semibold text-[#7A5114]">
                      {currentSweet.festivalOrigin[coreLang]}
                    </p>
                    <span className="mt-1 inline-flex min-h-[30px] items-center rounded-full bg-[#FFFDF8] px-3 py-0.5 text-[11px] font-bold text-[#C83E2B] ring-1 ring-[#C83E2B]/25">
                      {copy.flipToMeaningLabel}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 animate-fade-in motion-reduce:animate-none">
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
            </div>

            <button
              type="button"
              onClick={goNextChapter}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 self-center rounded-full border border-[#9A6B22]/45 bg-[#FFFDF8] px-6 py-2 text-xs font-bold text-[#7A5114] transition hover:bg-[#FDE8B8]/70 active:scale-[0.98]"
            >
              <span>
                {copy.nextChapterPrefix}: {copy.tabs[nextChapterId]}
              </span>
              <NextArrowIcon />
            </button>
          </section>
        ) : null}

        {/* CHAPTER 03: Album & Chimes */}
        {activeChapter === 'album' ? (
          <section
            role="tabpanel"
            aria-label={copy.tabs.album}
            className="flex flex-1 flex-col justify-between gap-4 rounded-2xl border border-[#9A6B22]/35 bg-[#FFFDF8] p-4 shadow-[0_8px_24px_-12px_rgba(154,107,34,0.18)] animate-fade-in motion-reduce:animate-none"
          >
            <div className="space-y-4">
              <div className="text-center">
                <span className="inline-block rounded-full border border-[#9A6B22]/30 bg-[#FFF7E6] px-3.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#7A5114]">
                  {copy.albumEyebrow}
                </span>
                <h3 className="mt-2 font-heading text-xl font-bold text-[#2D1B10]">
                  {copy.albumTitle}
                </h3>
              </div>

              {data.photos && data.photos.length > 0 ? (
                <div>
                  <OccasionPhotoGallery
                    photos={data.photos}
                    accentColor="#C83E2B"
                    surfaceTint="#FFF7E6"
                    captionPrefix={copy.photoCaptionPrefix}
                    variant="heirloom"
                  />
                  <p className="mt-2 text-center text-xs font-medium text-[#5A3D28]">
                    {copy.albumHint}
                  </p>
                </div>
              ) : null}

              <OccasionFilmstripGallery
                photos={data.photos}
                fallbackImage="/templates/occasions/harvest-greeting/cover.jpg"
                accentColor="#9A6B22"
                caption={copy.filmstripCaption}
                frameLabels={copy.filmstripFrames}
              />

              <div className="space-y-1.5 pt-1">
                <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#7A5114]">
                  {copy.cassetteEyebrow}
                </p>
                <OccasionCassettePlayer
                  mood="festive"
                  trackTitle={copy.cassetteTrackTitle}
                  tapLabel={copy.cassetteTapLabel}
                  playingLabel={copy.cassettePlayingLabel}
                  accentColor="#C83E2B"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={goNextChapter}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 self-center rounded-full border border-[#9A6B22]/45 bg-[#FFF7E6] px-6 py-2 text-xs font-bold text-[#7A5114] transition hover:bg-[#FDE8B8]/70 active:scale-[0.98]"
            >
              <span>
                {copy.nextChapterPrefix}: {copy.tabs[nextChapterId]}
              </span>
              <NextArrowIcon />
            </button>
          </section>
        ) : null}

        {/* CHAPTER 04: Return Blessing */}
        {activeChapter === 'return' ? (
          <section
            role="tabpanel"
            aria-label={copy.tabs.return}
            className="flex flex-1 flex-col justify-between gap-4 rounded-2xl border border-[#9A6B22]/35 bg-[#FFFDF8] p-4 shadow-[0_8px_24px_-12px_rgba(154,107,34,0.18)] animate-fade-in motion-reduce:animate-none"
          >
            <div className="space-y-3.5 text-center">
              <MarigoldToranSvg />

              <div>
                <span className="inline-block rounded-full border border-[#C83E2B]/30 bg-[#FFF7E6] px-3.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#C83E2B]">
                  {copy.returnEyebrow}
                </span>
                <h3 className="mt-2 font-heading text-xl font-bold text-[#2D1B10]">
                  {copy.returnTitle}
                </h3>
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
                        setBlessingSealed(false);
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

              <div className="rounded-xl border border-[#9A6B22]/30 bg-[#FFF7E6] px-3 py-2 text-xs font-semibold text-[#7A5114]">
                {copy.returnAddressedTo(data.senderName, data.receiverName)}
              </div>
            </div>

            <div className="space-y-2.5">
              {blessingSealed ? (
                <div
                  role="status"
                  className="flex items-center gap-2.5 rounded-2xl border border-[#1F6E4A]/35 bg-[#1F6E4A] px-4 py-3 text-left text-[#FFF7E6] shadow-sm animate-pop-bounce motion-reduce:animate-none"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 shrink-0"
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
                    <p className="text-[11px] text-[#FFF7E6]/90">{copy.returnToastBody}</p>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSealReturnBlessing}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#C83E2B] to-[#A62E1E] px-5 py-3 text-sm font-bold text-[#FFF7E6] shadow-[0_10px_24px_-8px_rgba(200,62,43,0.45)] transition hover:brightness-105 active:scale-[0.98]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
                <span>{blessingSealed ? copy.returnResealCta : copy.returnSealCta}</span>
              </button>
            </div>
          </section>
        ) : null}

        <footer className="border-t border-[#9A6B22]/25 pt-2.5 text-center text-[11px] font-medium text-[#5A3D28]">
          {getWebzyFooterLabel(language)}
        </footer>
      </div>
    </div>
  );
}
