'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import type { CoreLanguageCode, LanguageCode } from '@webzy/core';
import type { ThemeDemoPayload, ThemeManifest } from '../../schema';

export type BirthdayThemeVariant = 'normal' | 'couple' | 'family';

export interface BirthdayThemeComponentProps {
  manifest: ThemeManifest;
  data: ThemeDemoPayload;
  language: LanguageCode;
  watermarked?: boolean;
  onOpened?: () => void;
  onOpenPhoto?: (idx: number) => void;
}

const COUPLE_KEYWORDS = new Set([
  'partner',
  'lover',
  'girlfriend',
  'boyfriend',
  'gf',
  'bf',
  'wife',
  'husband',
  'spouse',
  'fiance',
  'crush',
  'soulmate',
  'romantic',
  'couple',
]);

const FAMILY_KEYWORDS = new Set([
  'family',
  'sibling',
  'brother',
  'sister',
  'bhai',
  'didi',
  'bhaiya',
  'mummy',
  'mom',
  'mother',
  'maa',
  'papa',
  'dad',
  'father',
  'parents',
  'grandparent',
  'dadi',
  'dada',
  'nani',
  'nana',
  'elder',
  'uncle',
  'aunt',
]);

/** Maps buyer relation (including legacy 'sibling') deterministically to 1 of 3 Birthday themes. */
export function resolveBirthdayTheme(relation?: string): BirthdayThemeVariant {
  const normalized = (relation ?? '').trim().toLowerCase();
  if (!normalized) return 'normal';
  if (COUPLE_KEYWORDS.has(normalized)) return 'couple';
  if (FAMILY_KEYWORDS.has(normalized)) return 'family';
  for (const kw of COUPLE_KEYWORDS) {
    if (normalized.includes(kw)) return 'couple';
  }
  for (const kw of FAMILY_KEYWORDS) {
    if (normalized.includes(kw)) return 'family';
  }
  return 'normal';
}

export function useBirthdayReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    return undefined;
  }, []);

  return reduced;
}

export function getValidPhotos(
  photos?: string[],
  failedUrls?: Record<string, boolean>,
): string[] {
  if (!Array.isArray(photos)) return [];
  return photos
    .map((u) => (typeof u === 'string' ? u.trim() : ''))
    .filter((u) => u.length > 0 && !(failedUrls && failedUrls[u]))
    .slice(0, 4);
}

/** Keeps Devanagari shirorekha intact by disabling synthetic italic slant and negative tracking. */
export function hiSafeStyle(language: LanguageCode): React.CSSProperties | undefined {
  if (language === 'hi') {
    return {
      fontStyle: 'normal',
      letterSpacing: '0em',
    };
  }
  return undefined;
}

export interface BirthdayCopyPack {
  switcher: Record<BirthdayThemeVariant, string>;
  replay: string;
  normal: {
    happyWord: string;
    birthdayWord: string;
    stickerLabel: string;
    candlesCue: string;
    micIdle: string;
    micListening: string;
    micDenied: string;
    tapCandlesHint: string;
    blowAllBtn: string;
    wishMadeStamp: string;
    relightBtn: string;
    noteLabel: string;
    signedPrefix: string;
    stampSub: string;
    tapPhotoHint: string;
  };
  couple: {
    clickMe: string;
    envelopeScript: string;
    bowCue: string;
    tapBowHint: string;
    makeAWish: string;
    happyBirthday: string;
    openScrapbook: string;
    pages: [string, string, string];
    favoritePerson: string;
    loveLetterHeader: string;
    dearPrefix: string;
    youAndMe: string;
    myFavHuman: string;
    alwaysYours: string;
    signedPrefix: string;
  };
  family: {
    forYouPrefix: string;
    tapToOpen: string;
    foreverAndAlways: string;
    happyBirthday: string;
    dearPrefix: string;
    signedPrefix: string;
    waxInitialLabel: string;
  };
}

export const BIRTHDAY_THEMES_COPY: Record<CoreLanguageCode, BirthdayCopyPack> = {
  en: {
    switcher: {
      normal: 'Normal',
      couple: 'Couple',
      family: 'Family',
    },
    replay: 'Replay',
    normal: {
      happyWord: 'HAPPY',
      birthdayWord: 'BIRTHDAY',
      stickerLabel: 'THE STAR',
      candlesCue: 'Blow out the Candles !!!',
      micIdle: 'Use mic to blow',
      micListening: 'Blow softly now!',
      micDenied: 'Tap candles to blow',
      tapCandlesHint: 'or tap the flames',
      blowAllBtn: 'Blow all candles',
      wishMadeStamp: 'Wish made!',
      relightBtn: 'Relight',
      noteLabel: 'A little note',
      signedPrefix: 'with love,',
      stampSub: 'SPECIAL DELIVERY',
      tapPhotoHint: 'Tap photo',
    },
    couple: {
      clickMe: 'click me!',
      envelopeScript: 'Happy Birthday',
      bowCue: 'Pull & release',
      tapBowHint: 'or tap the bow',
      makeAWish: 'make a wish...',
      happyBirthday: 'Happy Birthday,',
      openScrapbook: 'Open scrapbook',
      pages: ['Cover', 'Letter', 'Memories'],
      favoritePerson: 'Favorite person',
      loveLetterHeader: 'LOVE LETTER',
      dearPrefix: 'Dear',
      youAndMe: 'YOU & ME',
      myFavHuman: 'MY FAV HUMAN.',
      alwaysYours: 'Always yours',
      signedPrefix: 'with love,',
    },
    family: {
      forYouPrefix: 'For you,',
      tapToOpen: '(tap to open)',
      foreverAndAlways: 'forever & always',
      happyBirthday: 'Happy Birthday,',
      dearPrefix: 'Dear',
      signedPrefix: 'with love,',
      waxInitialLabel: 'BLESSED DAY',
    },
  },
  hinglish: {
    switcher: {
      normal: 'Normal',
      couple: 'Couple',
      family: 'Family',
    },
    replay: 'Phir dekho',
    normal: {
      happyWord: 'HAPPY',
      birthdayWord: 'BIRTHDAY',
      stickerLabel: 'THE STAR',
      candlesCue: 'Candles bujhao !!!',
      micIdle: 'Mic se phoonko',
      micListening: 'Ab phoonk maaro!',
      micDenied: 'Candles par tap karo',
      tapCandlesHint: 'ya flames par tap karo',
      blowAllBtn: 'Sab candles bujhao',
      wishMadeStamp: 'Dua qubool ho!',
      relightBtn: 'Phir jalao',
      noteLabel: 'Dil se note',
      signedPrefix: 'pyaar se,',
      stampSub: 'KHAAS TOHFA',
      tapPhotoHint: 'Photo dekho',
    },
    couple: {
      clickMe: 'click me!',
      envelopeScript: 'Happy Birthday',
      bowCue: 'Khincho aur chhodo',
      tapBowHint: 'ya bow par tap karo',
      makeAWish: 'ek dua maango...',
      happyBirthday: 'Happy Birthday,',
      openScrapbook: 'Scrapbook kholo',
      pages: ['Cover', 'Khat', 'Yaadein'],
      favoritePerson: 'Sabse khaas',
      loveLetterHeader: 'LOVE LETTER',
      dearPrefix: 'Dear',
      youAndMe: 'TUM AUR MAIN',
      myFavHuman: 'MERI FAV JAAN.',
      alwaysYours: 'Hamesha tumhara',
      signedPrefix: 'pyaar se,',
    },
    family: {
      forYouPrefix: 'Tumhare liye,',
      tapToOpen: '(kholne ke liye tap)',
      foreverAndAlways: 'hamesha ke liye',
      happyBirthday: 'Janamdin Mubarak,',
      dearPrefix: 'Pyaare',
      signedPrefix: 'pyaar se,',
      waxInitialLabel: 'SHUBH DIN',
    },
  },
  hi: {
    switcher: {
      normal: 'नॉर्मल',
      couple: 'कपल',
      family: 'परिवार',
    },
    replay: 'फिर देखें',
    normal: {
      happyWord: 'HAPPY',
      birthdayWord: 'BIRTHDAY',
      stickerLabel: 'खास दिन',
      candlesCue: 'मोमबत्ती बुझाओ !!!',
      micIdle: 'माइक से फूँकें',
      micListening: 'अब धीरे से फूँकें!',
      micDenied: 'मोमबत्ती पर टैप करें',
      tapCandlesHint: 'या लौ पर टैप करें',
      blowAllBtn: 'सभी मोमबत्ती बुझाएँ',
      wishMadeStamp: 'हर दुआ पूरी हो!',
      relightBtn: 'फिर जलाएँ',
      noteLabel: 'दिल की बात',
      signedPrefix: 'स्नेह सहित,',
      stampSub: 'विशेष उपहार',
      tapPhotoHint: 'फ़ोटो देखें',
    },
    couple: {
      clickMe: 'खोलें!',
      envelopeScript: 'जन्मदिन मुबारक',
      bowCue: 'खींचें और छोड़ें',
      tapBowHint: 'या धनुष पर टैप करें',
      makeAWish: 'एक दुआ माँगें...',
      happyBirthday: 'जन्मदिन मुबारक,',
      openScrapbook: 'स्क्रैपबुक खोलें',
      pages: ['कवर', 'ख़त', 'यादें'],
      favoritePerson: 'सबसे ख़ास',
      loveLetterHeader: 'प्रेम पत्र',
      dearPrefix: 'प्रिय',
      youAndMe: 'तुम और मैं',
      myFavHuman: 'मेरे सबसे प्यारे।',
      alwaysYours: 'सदैव आपका',
      signedPrefix: 'स्नेह सहित,',
    },
    family: {
      forYouPrefix: 'आपके लिए,',
      tapToOpen: '(खोलने के लिए टैप करें)',
      foreverAndAlways: 'हमेशा के लिए',
      happyBirthday: 'जन्मदिन मुबारक,',
      dearPrefix: 'प्रिय',
      signedPrefix: 'स्नेह सहित,',
      waxInitialLabel: 'शुभ दिवस',
    },
  },
};
