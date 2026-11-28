'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  type CoreLanguageCode,
  pickLocalizedText,
  toCoreLanguageCode,
} from '@webzy/core';
import type { OccasionSiteProps } from './shared/OccasionPrimitives';
import { getWebzyFooterLabel } from './shared/OccasionPrimitives';
import {
  playCandleBlowSfx,
  playLanternPullChime,
  playPaperUnsealSfx,
} from './shared/OccasionCraftPrimitives';
import { BirthdayCoupleTheme } from './birthday/BirthdayCoupleTheme';
import { BirthdayDemoSwitcher, BirthdayPhotoLightbox } from './birthday/BirthdayDemoSwitcher';
import { BirthdayFamilyTheme } from './birthday/BirthdayFamilyTheme';
import { BirthdayNormalTheme } from './birthday/BirthdayNormalTheme';
import {
  type BirthdayThemeVariant,
  getValidPhotos,
  hiSafeStyle,
  resolveBirthdayTheme,
  useBirthdayReducedMotion,
} from './birthday/birthdayTypes';

const WISH_CANDLE_COUNT = 5;

type TreatPassId = 'coffee-cake' | 'movie-night' | 'birthday-dinner';

interface TreatPassOption {
  id: TreatPassId;
  title: Record<CoreLanguageCode, string>;
  subtitle: Record<CoreLanguageCode, string>;
  stamp: Record<CoreLanguageCode, string>;
}

const TREAT_PASS_OPTIONS: readonly TreatPassOption[] = [
  {
    id: 'coffee-cake',
    title: {
      en: 'Coffee & Cake On Me',
      hinglish: 'Coffee aur Cake Meri Taraf Se',
      hi: 'कॉफ़ी और केक मेरी तरफ़ से',
    },
    subtitle: {
      en: 'Your favorite cafe corner, warm brew & a slice with extra frosting.',
      hinglish: 'Tumhari fav cafe table, garma-garam coffee aur extra cake slice.',
      hi: 'आपकी पसंदीदा कॉफ़ी और मीठे केक की प्यारी दावत।',
    },
    stamp: {
      en: 'CAFE VOUCHER',
      hinglish: 'CAFE PASS',
      hi: 'कैफ़े पास',
    },
  },
  {
    id: 'movie-night',
    title: {
      en: 'Movie Night & Snacks',
      hinglish: 'Movie Night aur Snacks',
      hi: 'मूवी नाइट और स्नैक्स',
    },
    subtitle: {
      en: 'You pick the film, I bring the popcorn, snacks & zero spoilers.',
      hinglish: 'Movie tum choose karo, snacks aur popcorn meri zimmedari.',
      hi: 'फ़िल्म आपकी पसंद की, स्नैक्स और पॉपकॉर्न हमारी तरफ़ से।',
    },
    stamp: {
      en: 'CINEMA TICKET',
      hinglish: 'MOVIE PASS',
      hi: 'मूवी पास',
    },
  },
  {
    id: 'birthday-dinner',
    title: {
      en: 'Full Birthday Dinner',
      hinglish: 'Grand Birthday Dinner',
      hi: 'स्पेशल बर्थडे डिनर',
    },
    subtitle: {
      en: 'Starters, mains, dessert & an unhurried table to celebrate you.',
      hinglish: 'Starters, main course aur dessert — poora celebration treat.',
      hi: 'स्टार्टर्स से डेज़र्ट तक, आपके नाम एक यादगार डिनर।',
    },
    stamp: {
      en: 'FEAST PASS',
      hinglish: 'DINNER PASS',
      hi: 'डिनर पास',
    },
  },
];

const BIRTHDAY_FORTUNES: readonly Record<CoreLanguageCode, string>[] = [
  {
    en: 'A surprise piece of good news is already on its way to make this year unforgettable.',
    hinglish: 'Is saal ek aisi achhi khabar aane wali hai jo tumhare chehre par badi muskaan le aayegi.',
    hi: 'इस वर्ष एक सुंदर शुभ समाचार आपकी प्रतीक्षा कर रहा है जो मन को प्रसन्न कर देगा।',
  },
  {
    en: 'May your calendar fill with unhurried laughs, spontaneous plans & stories worth framing.',
    hinglish: 'Tumhara aane wala saal befikr hansi, mazedaar plans aur yaadgaar lamhon se bhara rahe.',
    hi: 'आने वाला साल बेफिक्र हँसी, खूबसूरत पलों और यादगार मुलाक़ातों से सजा रहे।',
  },
  {
    en: 'One quiet wish you have been holding close is finally ready to click into place.',
    hinglish: 'Jo ek khaas sapna tumne dil mein rakha hai, is saal uske poore hone ka waqt aa gaya hai.',
    hi: 'जो एक ख़ास सपना आपने दिल में संजोया है, इस वर्ष उसके सच होने का समय आ गया है।',
  },
  {
    en: 'Expect golden mornings, calm energy & people who always show up in your corner.',
    hinglish: 'Har subah nayi umeed, sukoon aur aise log milein jo har mod par tumhare saath khade rahein.',
    hi: 'हर सुबह नई ऊर्जा, शांति और अपनों के अटूट साथ से रोशन होती रहे।',
  },
  {
    en: 'This chapter brings extra cake, scenic detours & victories you will smile about for years.',
    hinglish: 'Yeh naya chapter extra cake, suhane safar aur aisi jeet laayega jin par hamesha garv hoga.',
    hi: 'यह नया अध्याय ढेर सारी मिठास, सुंदर यात्राएँ और नई उपलब्धियाँ लेकर आएगा।',
  },
];

interface ConfettiSuiteCopy {
  highlightsEyebrow: string;
  highlightsTitle: string;
  highlightsSaved: string;
  highlightsSaveHint: string;
  cakeEyebrow: string;
  cakeTitle: string;
  cakeSubtitle: string;
  candlesProgress: (blown: number, total: number) => string;
  blowAllBtn: string;
  relightBtn: string;
  candleTapAria: (idx: number, lit: boolean) => string;
  candlePillLabel: (idx: number) => string;
  wishSealedTitle: string;
  wishSealedBody: (receiver: string) => string;
  jarEyebrow: string;
  jarTitle: string;
  jarSubtitle: string;
  drawFortuneBtn: string;
  drawAnotherBtn: string;
  fortuneCountLabel: (drawn: number, total: number) => string;
  fortuneChitHeader: string;
  fortuneIdleHint: string;
  treatEyebrow: string;
  treatTitle: string;
  treatSubtitle: string;
  treatSelectedTag: string;
  treatVoucherMeta: (receiver: string, sender: string) => string;
  copyClaimBtn: string;
  copiedClaimToast: string;
  openWhatsappBtn: string;
  fallbackReceiver: string;
  fallbackSender: string;
}

const SUITE_COPY: Record<CoreLanguageCode, ConfettiSuiteCopy> = {
  en: {
    highlightsEyebrow: 'Birthday Highlights',
    highlightsTitle: 'Little Notes Worth Keeping',
    highlightsSaved: 'Starred',
    highlightsSaveHint: 'Tap to star',
    cakeEyebrow: 'Candle Wish Ritual',
    cakeTitle: 'Blow Out the 5 Birthday Candles & Make a Wish',
    cakeSubtitle: 'Tap each flickering flame or blow them all out at once to seal your wish.',
    candlesProgress: (blown, total) => `${blown} / ${total} candles blown`,
    blowAllBtn: 'Blow All Candles',
    relightBtn: 'Relight 5 Candles',
    candleTapAria: (idx, lit) =>
      lit ? `Blow out birthday candle ${idx}` : `Candle ${idx} blown out`,
    candlePillLabel: (idx) => `Candle ${idx}`,
    wishSealedTitle: 'Wish Sealed for the Year Ahead!',
    wishSealedBody: (receiver) =>
      `Every flame is out and smoke curls skyward — may this chapter reward ${receiver} beyond measure.`,
    jarEyebrow: 'Birthday Fortune & Treat Jar',
    jarTitle: 'Shake the Wish Jar & Claim Your Treat',
    jarSubtitle: 'Pull a celebratory fortune note from the jar, then pick the birthday treat pass on me.',
    drawFortuneBtn: 'Draw a Birthday Fortune',
    drawAnotherBtn: 'Draw Another Fortune',
    fortuneCountLabel: (drawn, total) => `${drawn} / ${total} fortunes opened`,
    fortuneChitHeader: 'BIRTHDAY FORTUNE',
    fortuneIdleHint: 'Tap the glass jar above to unfold your first birthday fortune.',
    treatEyebrow: 'Claim Your Birthday Treat Pass',
    treatTitle: 'Pick Your Celebration Voucher',
    treatSubtitle: 'Choose 1 treat pass below, then copy your ready-to-send WhatsApp thank-you & claim.',
    treatSelectedTag: 'CLAIMED',
    treatVoucherMeta: (receiver, sender) => `Reserved for ${receiver} · Hosted by ${sender}`,
    copyClaimBtn: 'Copy Thank-You & Claim on WhatsApp',
    copiedClaimToast: 'Copied! Ready to paste on WhatsApp.',
    openWhatsappBtn: 'Send on WhatsApp',
    fallbackReceiver: 'Birthday Star',
    fallbackSender: 'With Love',
  },
  hinglish: {
    highlightsEyebrow: 'Birthday Highlights',
    highlightsTitle: 'Khaas Baatein Jo Yaad Rahengi',
    highlightsSaved: 'Saved',
    highlightsSaveHint: 'Tap karke star karein',
    cakeEyebrow: 'Candle Wish Ritual',
    cakeTitle: '5 Birthday Candles Bujhao aur Ek Dua Maango',
    cakeSubtitle: 'Har flame par alag tap karo ya ek saath sab bujha kar apni wish lock karo.',
    candlesProgress: (blown, total) => `${blown} / ${total} candles bujh gayi`,
    blowAllBtn: 'Sab Candles Bujhao',
    relightBtn: 'Phir Se Jalao',
    candleTapAria: (idx, lit) =>
      lit ? `Candle ${idx} bujhao` : `Candle ${idx} bujh chuki hai`,
    candlePillLabel: (idx) => `Candle ${idx}`,
    wishSealedTitle: 'Wish Sealed for the Year Ahead!',
    wishSealedBody: (receiver) =>
      `Saari candles bujh gayi — dua hai ki aane wala saal ${receiver} ke liye dher saari khushiyan laaye.`,
    jarEyebrow: 'Birthday Fortune & Treat Jar',
    jarTitle: 'Wish Jar Kholo aur Apna Treat Pass Chuno',
    jarSubtitle: 'Jar se ek pyara birthday fortune nikalo, phir neeche apna birthday treat voucher select karo.',
    drawFortuneBtn: 'Birthday Fortune Nikalo',
    drawAnotherBtn: 'Agla Fortune Dekho',
    fortuneCountLabel: (drawn, total) => `${drawn} / ${total} fortunes khul gaye`,
    fortuneChitHeader: 'BIRTHDAY FORTUNE',
    fortuneIdleHint: 'Pehla birthday fortune padhne ke liye upar glass jar par tap karo.',
    treatEyebrow: 'Claim Your Birthday Treat Pass',
    treatTitle: 'Apna Birthday Treat Voucher Chuno',
    treatSubtitle: 'Koi 1 treat pass select karo aur 1-tap mein WhatsApp thank-you & claim copy karo.',
    treatSelectedTag: 'SELECTED',
    treatVoucherMeta: (receiver, sender) => `${receiver} ke liye · ${sender} ki taraf se`,
    copyClaimBtn: 'Thank-You & Treat Claim Copy Karein',
    copiedClaimToast: 'Copy ho gaya! Ab WhatsApp par bhej do.',
    openWhatsappBtn: 'WhatsApp Par Bhejein',
    fallbackReceiver: 'Birthday Star',
    fallbackSender: 'Pyaar Se',
  },
  hi: {
    highlightsEyebrow: 'जन्मदिन की ख़ास बातें',
    highlightsTitle: 'दिल से संजोए प्यारे पल',
    highlightsSaved: 'सहेजा गया',
    highlightsSaveHint: 'स्टार करने के लिए टैप करें',
    cakeEyebrow: 'जन्मदिन कामना रस्म',
    cakeTitle: '5 मोमबत्तियाँ बुझाएँ और मन की मुराद माँगें',
    cakeSubtitle: 'प्रत्येक जलती लौ पर टैप करें या एक साथ सभी मोमबत्तियाँ बुझाकर अपनी कामना सुरक्षित करें।',
    candlesProgress: (blown, total) => `${blown} / ${total} मोमबत्तियाँ बुझीं`,
    blowAllBtn: 'सभी मोमबत्तियाँ बुझाएँ',
    relightBtn: 'फिर से जलाएँ',
    candleTapAria: (idx, lit) =>
      lit ? `मोमबत्ती ${idx} बुझाएँ` : `मोमबत्ती ${idx} बुझ चुकी है`,
    candlePillLabel: (idx) => `लौ ${idx}`,
    wishSealedTitle: 'आने वाले वर्ष के लिए आपकी कामना सुरक्षित!',
    wishSealedBody: (receiver) =>
      `सभी मोमबत्तियाँ बुझ गईं — प्रार्थना है कि यह नया वर्ष ${receiver} के लिए अपार खुशियाँ और सफलता लेकर आए।`,
    jarEyebrow: 'बर्थडे फ़ॉर्च्यून और ट्रीट जार',
    jarTitle: 'कामना जार खोलें और अपना ट्रीट पास चुनें',
    jarSubtitle: 'जार से एक शुभ संदेश निकालें और नीचे अपनी पसंद का जन्मदिन ट्रीट पास चुनें।',
    drawFortuneBtn: 'शुभ संदेश निकालें',
    drawAnotherBtn: 'अगला संदेश देखें',
    fortuneCountLabel: (drawn, total) => `${drawn} / ${total} संदेश देखे गए`,
    fortuneChitHeader: 'जन्मदिन शुभ संदेश',
    fortuneIdleHint: 'अपना पहला जन्मदिन संदेश खोलने के लिए ऊपर जार पर टैप करें।',
    treatEyebrow: 'अपना बर्थडे ट्रीट पास चुनें',
    treatTitle: 'जश्न का वाउचर चुनें',
    treatSubtitle: 'नीचे 1 ट्रीट पास चुनें और एक टैप में WhatsApp के लिए धन्यवाद संदेश कॉपी करें।',
    treatSelectedTag: 'चुना गया',
    treatVoucherMeta: (receiver, sender) => `${receiver} के लिए · ${sender} की ओर से`,
    copyClaimBtn: 'धन्यवाद और ट्रीट क्लेम कॉपी करें',
    copiedClaimToast: 'कॉपी हो गया! अब WhatsApp पर भेज सकते हैं।',
    openWhatsappBtn: 'WhatsApp पर भेजें',
    fallbackReceiver: 'जन्मदिन के सितारे',
    fallbackSender: 'स्नेह सहित',
  },
};

interface VariantPalette {
  isDark: boolean;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  innerBg: string;
  innerBorder: string;
  eyebrowBg: string;
  eyebrowText: string;
  titleColor: string;
  bodyColor: string;
  mutedColor: string;
  accentBg: string;
  accentText: string;
  secondaryBg: string;
  secondaryBorder: string;
  secondaryText: string;
  confettiColors: readonly string[];
  cakeTierTop: string;
  cakeTierBottom: string;
  cakeGlaze: string;
  cakeStroke: string;
  cakePlate: string;
  candleColors: readonly [string, string, string, string, string];
  jarTint: string;
  jarStroke: string;
}

function getVariantPalette(variant: BirthdayThemeVariant): VariantPalette {
  if (variant === 'couple') {
    return {
      isDark: true,
      cardBg: 'linear-gradient(180deg, #7E1117 0%, #650B11 100%)',
      cardBorder: 'rgba(229, 193, 88, 0.36)',
      cardShadow: '0 18px 36px -14px rgba(24, 2, 6, 0.55)',
      innerBg: 'rgba(64, 6, 10, 0.65)',
      innerBorder: 'rgba(229, 193, 88, 0.28)',
      eyebrowBg: 'rgba(229, 193, 88, 0.16)',
      eyebrowText: '#F6DC8C',
      titleColor: '#FAF5EC',
      bodyColor: '#F6E6E8',
      mutedColor: '#E8BCC2',
      accentBg: 'linear-gradient(180deg, #E8C766 0%, #C99E35 100%)',
      accentText: '#2E090D',
      secondaryBg: 'rgba(250, 245, 236, 0.1)',
      secondaryBorder: 'rgba(229, 193, 88, 0.42)',
      secondaryText: '#FAF5EC',
      confettiColors: ['#E5C158', '#FF9EAA', '#FAF5EC', '#FDE68A', '#F43F5E'],
      cakeTierTop: '#FAF5EC',
      cakeTierBottom: '#F5E8DC',
      cakeGlaze: '#C92A47',
      cakeStroke: '#4A090E',
      cakePlate: '#E5C158',
      candleColors: ['#E5C158', '#FF9EAA', '#C92A47', '#FAF5EC', '#F59E0B'],
      jarTint: 'rgba(250, 245, 236, 0.14)',
      jarStroke: '#E5C158',
    };
  }
  if (variant === 'family') {
    return {
      isDark: false,
      cardBg: 'linear-gradient(180deg, #FFFDF9 0%, #FAF3E9 100%)',
      cardBorder: 'rgba(168, 28, 46, 0.22)',
      cardShadow: '0 14px 30px -14px rgba(74, 28, 38, 0.2)',
      innerBg: '#FFFBF5',
      innerBorder: 'rgba(168, 28, 46, 0.18)',
      eyebrowBg: 'rgba(168, 28, 46, 0.09)',
      eyebrowText: '#8A1C32',
      titleColor: '#3D2322',
      bodyColor: '#5A3735',
      mutedColor: '#7D5C57',
      accentBg: 'linear-gradient(180deg, #B82936 0%, #8A1C32 100%)',
      accentText: '#FFFDF9',
      secondaryBg: '#FCEFF1',
      secondaryBorder: 'rgba(168, 28, 46, 0.3)',
      secondaryText: '#8A1C32',
      confettiColors: ['#B82936', '#E05A72', '#D97706', '#658042', '#F59E0B'],
      cakeTierTop: '#FFFDF8',
      cakeTierBottom: '#F8EDE4',
      cakeGlaze: '#E05A72',
      cakeStroke: '#4A1C26',
      cakePlate: '#DFD2C0',
      candleColors: ['#B82936', '#E05A72', '#D97706', '#526B36', '#8A1C32'],
      jarTint: 'rgba(224, 90, 114, 0.08)',
      jarStroke: '#8A1C32',
    };
  }
  return {
    isDark: false,
    cardBg: 'linear-gradient(180deg, #FBF7EE 0%, #F4ECDC 100%)',
    cardBorder: 'rgba(15, 53, 110, 0.2)',
    cardShadow: '0 14px 28px -12px rgba(15, 53, 110, 0.2)',
    innerBg: '#FFFDF8',
    innerBorder: 'rgba(21, 87, 176, 0.2)',
    eyebrowBg: 'rgba(21, 87, 176, 0.1)',
    eyebrowText: '#1557B0',
    titleColor: '#0F356E',
    bodyColor: '#253854',
    mutedColor: '#4E6380',
    accentBg: 'linear-gradient(180deg, #2E8BE0 0%, #1557B0 100%)',
    accentText: '#FFFDF8',
    secondaryBg: '#EAF2FA',
    secondaryBorder: 'rgba(15, 53, 110, 0.25)',
    secondaryText: '#0F356E',
    confettiColors: ['#1557B0', '#F59E2D', '#D94426', '#2E8BE0', '#2E9E6B'],
    cakeTierTop: '#FFFDF7',
    cakeTierBottom: '#FCEFD8',
    cakeGlaze: '#7DAAD3',
    cakeStroke: '#0F356E',
    cakePlate: '#9AC4E8',
    candleColors: ['#1557B0', '#F59E2D', '#D94426', '#2E8BE0', '#2E9E6B'],
    jarTint: 'rgba(125, 170, 211, 0.14)',
    jarStroke: '#0F356E',
  };
}

async function copyTextWithFallback(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to legacy textarea copy
  }
  try {
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    }
  } catch {
    return false;
  }
  return false;
}

function TreatPassIcon({ id, color }: { id: TreatPassId; color: string }) {
  if (id === 'coffee-cake') {
    return (
      <svg viewBox="0 0 36 36" className="h-8 w-8 shrink-0" fill="none" aria-hidden="true">
        <path
          d="M7 16 H22 V23 C22 26.8 18.8 29.5 14.5 29.5 C10.2 29.5 7 26.8 7 23 V16 Z"
          stroke={color}
          strokeWidth="1.8"
          fill={color}
          fillOpacity="0.12"
        />
        <path d="M22 18 H25.2 C27 18 28 19.2 28 21 C28 22.8 27 24 25.2 24 H22" stroke={color} strokeWidth="1.7" />
        <path d="M11 12.5 C11 10.5 12.4 10 12 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16.5 12.5 C16.5 10.5 17.9 10 17.5 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 31.5 H26" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === 'movie-night') {
    return (
      <svg viewBox="0 0 36 36" className="h-8 w-8 shrink-0" fill="none" aria-hidden="true">
        <rect
          x="6"
          y="13"
          width="24"
          height="16"
          rx="2.5"
          stroke={color}
          strokeWidth="1.8"
          fill={color}
          fillOpacity="0.12"
        />
        <path d="M6 13 L29 8 L30 12.5 L6 17" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 11.7 L14.5 15.2 M19 10.2 L21.5 13.7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="16,19.5 22,22.5 16,25.5" fill={color} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 36 36" className="h-8 w-8 shrink-0" fill="none" aria-hidden="true">
      <path
        d="M7 24 C7 16.8 11.8 12 18 12 C24.2 12 29 16.8 29 24 H7 Z"
        stroke={color}
        strokeWidth="1.8"
        fill={color}
        fillOpacity="0.12"
      />
      <circle cx="18" cy="9.5" r="2.2" stroke={color} strokeWidth="1.6" />
      <path d="M4.5 27 H31.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 18.5 C13.5 16.5 15.6 15.5 18 15.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

interface ConfettiPiece {
  id: number;
  leftPct: number;
  delayMs: number;
  durationMs: number;
  driftX: number;
  rotate: number;
  color: string;
  shape: 'rect' | 'dot' | 'star';
}

function createCakeConfetti(wave: number, colors: readonly string[]): ConfettiPiece[] {
  return Array.from({ length: 24 }, (_, idx) => ({
    id: wave * 100 + idx,
    leftPct: 6 + ((idx * 17 + wave * 11) % 88),
    delayMs: (idx % 6) * 75,
    durationMs: 1700 + (idx % 5) * 260,
    driftX: (idx % 2 === 0 ? 1 : -1) * (16 + ((idx * 9) % 34)),
    rotate: (idx % 2 === 0 ? 1 : -1) * (140 + (idx % 4) * 55),
    color: colors[(idx + wave) % colors.length] ?? '#F59E2D',
    shape: idx % 3 === 0 ? 'star' : idx % 3 === 1 ? 'rect' : 'dot',
  }));
}

interface FiveCandleWishRitualCardProps {
  palette: VariantPalette;
  copy: ConfettiSuiteCopy;
  receiverName: string;
  isHindi: boolean;
  langSafe?: React.CSSProperties;
  reducedMotion: boolean;
  onInteract: () => void;
}

function FiveCandleWishRitualCard({
  palette,
  copy,
  receiverName,
  isHindi,
  langSafe,
  reducedMotion,
  onInteract,
}: FiveCandleWishRitualCardProps) {
  const uid = useId().replace(/:/g, '');
  const [litCandles, setLitCandles] = useState<boolean[]>(() =>
    Array.from({ length: WISH_CANDLE_COUNT }, () => true),
  );
  const [smokeKeys, setSmokeKeys] = useState<number[]>(() =>
    Array.from({ length: WISH_CANDLE_COUNT }, () => 0),
  );
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const waveRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      for (const id of timersRef.current) {
        window.clearTimeout(id);
      }
      timersRef.current = [];
    };
  }, []);

  const blownCount = litCandles.filter((lit) => !lit).length;
  const allOut = blownCount === WISH_CANDLE_COUNT;

  const fireConfettiBurst = useCallback(() => {
    waveRef.current += 1;
    const pieces = createCakeConfetti(waveRef.current, palette.confettiColors);
    setConfetti(pieces);
    const id = window.setTimeout(() => setConfetti([]), 3200);
    timersRef.current.push(id);
  }, [palette.confettiColors]);

  const extinguishCandle = useCallback(
    (index: number) => {
      if (!litCandles[index]) return;
      const next = [...litCandles];
      next[index] = false;
      const nowAllOut = next.every((lit) => !lit);
      setLitCandles(next);
      setSmokeKeys((prev) => {
        const nextSmoke = [...prev];
        nextSmoke[index] = (nextSmoke[index] ?? 0) + 1;
        return nextSmoke;
      });
      playCandleBlowSfx(nowAllOut);
      if (nowAllOut) {
        playLanternPullChime();
        fireConfettiBurst();
      }
      onInteract();
    },
    [fireConfettiBurst, litCandles, onInteract],
  );

  const handleBlowAll = useCallback(() => {
    const remainingIndices = litCandles
      .map((lit, idx) => (lit ? idx : -1))
      .filter((idx) => idx >= 0);
    if (remainingIndices.length === 0) return;

    onInteract();

    if (reducedMotion) {
      setLitCandles(Array.from({ length: WISH_CANDLE_COUNT }, () => false));
      setSmokeKeys((prev) => prev.map((k) => k + 1));
      playCandleBlowSfx(true);
      playLanternPullChime();
      fireConfettiBurst();
      return;
    }

    remainingIndices.forEach((candleIdx, step) => {
      const id = window.setTimeout(() => {
        const isLast = step === remainingIndices.length - 1;
        setLitCandles((prev) => {
          if (!prev[candleIdx]) return prev;
          const next = [...prev];
          next[candleIdx] = false;
          return next;
        });
        setSmokeKeys((prev) => {
          const next = [...prev];
          next[candleIdx] = (next[candleIdx] ?? 0) + 1;
          return next;
        });
        if (isLast) {
          playCandleBlowSfx(true);
          playLanternPullChime();
          fireConfettiBurst();
        } else if (step === 0) {
          playCandleBlowSfx(false);
        }
      }, step * 85);
      timersRef.current.push(id);
    });
  }, [fireConfettiBurst, litCandles, onInteract, reducedMotion]);

  const handleRelight = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
    setLitCandles(Array.from({ length: WISH_CANDLE_COUNT }, () => true));
    setConfetti([]);
    playPaperUnsealSfx(2);
  }, []);

  const candlePositions = [88, 124, 160, 196, 232];

  return (
    <section
      aria-label={copy.cakeTitle}
      className="relative overflow-hidden rounded-[26px] border p-5 sm:p-6"
      style={{
        background: palette.cardBg,
        borderColor: palette.cardBorder,
        boxShadow: palette.cardShadow,
      }}
    >
      {/* Celebratory SVG/CSS Confetti Burst Overlay */}
      {confetti.length > 0 ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
        >
          {confetti.map((piece) => (
            <span
              key={piece.id}
              className="birthday-suite-confetti absolute top-2 block"
              style={
                {
                  left: `${piece.leftPct}%`,
                  '--c-dur': `${piece.durationMs}ms`,
                  '--c-delay': `${piece.delayMs}ms`,
                  '--c-x': `${piece.driftX}px`,
                  '--c-rot': `${piece.rotate}deg`,
                } as React.CSSProperties
              }
            >
              {piece.shape === 'star' ? (
                <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none">
                  <path
                    d="M7 1 L8.6 5.2 L13 6.8 L8.6 8.4 L7 13 L5.4 8.4 L1 6.8 L5.4 5.2 Z"
                    fill={piece.color}
                  />
                </svg>
              ) : piece.shape === 'rect' ? (
                <span
                  className="block h-2.5 w-1.5 rounded-[1px]"
                  style={{ backgroundColor: piece.color }}
                />
              ) : (
                <span
                  className="block h-2 w-2 rounded-full"
                  style={{ backgroundColor: piece.color }}
                />
              )}
            </span>
          ))}
        </div>
      ) : null}

      <div className="relative z-10 text-center">
        <span
          style={{
            ...(langSafe ?? {}),
            backgroundColor: palette.eyebrowBg,
            color: palette.eyebrowText,
          }}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[10.5px] font-bold ${
            isHindi ? 'not-italic' : 'uppercase tracking-[0.14em]'
          }`}
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: palette.eyebrowText }}
          />
          {copy.cakeEyebrow}
        </span>

        <h2
          style={{ ...(langSafe ?? {}), color: palette.titleColor }}
          className="mt-2.5 break-words font-heading text-xl font-bold leading-snug sm:text-2xl"
        >
          {copy.cakeTitle}
        </h2>

        <p
          style={{ ...(langSafe ?? {}), color: palette.mutedColor }}
          className="mx-auto mt-1.5 max-w-md font-serif text-xs leading-relaxed sm:text-[13px]"
        >
          {copy.cakeSubtitle}
        </p>
      </div>

      {/* Pure SVG/CSS Artisan 5-Candle Celebration Cake */}
      <div
        className="relative z-10 mx-auto mt-4 flex flex-col items-center rounded-2xl border px-3 py-4"
        style={{
          backgroundColor: palette.innerBg,
          borderColor: palette.innerBorder,
        }}
      >
        <svg
          viewBox="0 0 320 226"
          className="h-auto w-full max-w-[300px] overflow-visible select-none"
          role="img"
          aria-label={copy.candlesProgress(blownCount, WISH_CANDLE_COUNT)}
        >
          <defs>
            <linearGradient id={`flame-outer-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <radialGradient id={`flame-glow-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE047" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Soft ambient halo behind lit flames */}
          {!allOut ? (
            <ellipse
              cx="160"
              cy="46"
              rx="105"
              ry="34"
              fill={`url(#flame-glow-${uid})`}
              opacity={0.45 + (1 - blownCount / WISH_CANDLE_COUNT) * 0.45}
            />
          ) : null}

          {/* 5 Individually Tappable Birthday Candles */}
          {candlePositions.map((cx, idx) => {
            const isLit = litCandles[idx];
            const candleFill = palette.candleColors[idx] ?? '#1557B0';
            const smokeKey = smokeKeys[idx] ?? 0;
            const topY = idx === 2 ? 54 : idx === 1 || idx === 3 ? 60 : 65;
            const candleHeight = 104 - topY;

            return (
              <g key={`wish-candle-${idx}`}>
                {/* Soft rising smoke curls when extinguished */}
                {!isLit && smokeKey > 0 ? (
                  <g key={`smoke-${idx}-${smokeKey}`} className="birthday-smoke-curl">
                    <path
                      d={`M${cx} ${topY - 6} C${cx - 6} ${topY - 17}, ${cx + 7} ${topY - 27}, ${cx - 2} ${topY - 40}`}
                      stroke={palette.isDark ? '#F6E6E8' : '#78716C'}
                      strokeOpacity="0.62"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle
                      cx={cx + 2}
                      cy={topY - 32}
                      r="2.4"
                      fill={palette.isDark ? '#FAF5EC' : '#A8A29E'}
                      fillOpacity="0.38"
                    />
                  </g>
                ) : null}

                {/* Wick */}
                <line
                  x1={cx}
                  y1={topY}
                  x2={cx}
                  y2={topY - 6}
                  stroke={palette.isDark ? '#FAF5EC' : '#292524'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                {/* Flickering Flame (Tappable) */}
                {isLit ? (
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={copy.candleTapAria(idx + 1, true)}
                    onClick={() => extinguishCandle(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        extinguishCandle(idx);
                      }
                    }}
                    className="cursor-pointer focus:outline-none"
                  >
                    {/* Generous transparent tap hitbox */}
                    <circle cx={cx} cy={topY - 14} r="18" fill="transparent" />
                    <circle cx={cx} cy={topY - 16} r="14" fill={`url(#flame-glow-${uid})`} />
                    <g
                      className={reducedMotion ? '' : 'birthday-wish-flame-flicker'}
                      style={{
                        transformOrigin: `${cx}px ${topY - 6}px`,
                        animationDelay: `${idx * 140}ms`,
                      }}
                    >
                      <path
                        d={`M${cx} ${topY - 30} C${cx + 7.5} ${topY - 21}, ${cx + 8} ${topY - 10}, ${cx} ${topY - 6} C${cx - 8} ${topY - 10}, ${cx - 7.5} ${topY - 21}, ${cx} ${topY - 30} Z`}
                        fill={`url(#flame-outer-${uid})`}
                      />
                      <path
                        d={`M${cx} ${topY - 22} C${cx + 3.4} ${topY - 16}, ${cx + 3.2} ${topY - 10}, ${cx} ${topY - 8} C${cx - 3.2} ${topY - 10}, ${cx - 3.4} ${topY - 16}, ${cx} ${topY - 22} Z`}
                        fill="#FFFBEB"
                      />
                    </g>
                  </g>
                ) : null}

                {/* Striped Artisan Candle Wax Body */}
                <g
                  onClick={() => {
                    if (isLit) extinguishCandle(idx);
                  }}
                  className={isLit ? 'cursor-pointer' : undefined}
                >
                  <rect
                    x={cx - 6.5}
                    y={topY}
                    width="13"
                    height={candleHeight}
                    rx="3.2"
                    fill={candleFill}
                    stroke={palette.cakeStroke}
                    strokeWidth="1.5"
                  />
                  <path
                    d={`M${cx - 6} ${topY + 11} L${cx + 6} ${topY + 6} M${cx - 6} ${topY + 23} L${cx + 6} ${topY + 18}`}
                    stroke="#FFFDF8"
                    strokeOpacity="0.65"
                    strokeWidth="2.1"
                  />
                </g>
              </g>
            );
          })}

          {/* Upper Cake Tier */}
          <rect
            x="68"
            y="102"
            width="184"
            height="48"
            rx="11"
            fill={palette.cakeTierTop}
            stroke={palette.cakeStroke}
            strokeWidth="1.8"
          />
          {/* Scalloped Glaze Drips on Upper Tier */}
          <path
            d="M68 112 C68 105 74 102 82 102 H238 C246 102 252 105 252 112 V120 C244 127 235 127 229 119 C222 128 210 128 203 118 C195 129 182 129 175 119 C167 130 153 130 145 119 C137 128 124 128 117 118 C109 127 97 127 91 119 C84 126 74 126 68 120 Z"
            fill={palette.cakeGlaze}
            stroke={palette.cakeStroke}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />

          {/* Lower Cake Tier */}
          <rect
            x="46"
            y="148"
            width="228"
            height="54"
            rx="12"
            fill={palette.cakeTierBottom}
            stroke={palette.cakeStroke}
            strokeWidth="1.8"
          />
          {/* Decorative Ribbon & Pearl Trim across Lower Tier */}
          <path
            d="M47 172 Q76 184 104 172 T160 172 T216 172 T273 172"
            stroke={palette.cakeGlaze}
            strokeWidth="2.4"
            fill="none"
          />
          {[66, 94, 122, 160, 198, 226, 254].map((dotX, idx) => (
            <circle
              key={`pearl-${dotX}`}
              cx={dotX}
              cy={idx % 2 === 0 ? 159 : 187}
              r="3"
              fill={palette.candleColors[idx % palette.candleColors.length]}
            />
          ))}

          {/* Pedestal Cake Stand Plate */}
          <ellipse
            cx="160"
            cy="205"
            rx="132"
            ry="11"
            fill={palette.cakePlate}
            stroke={palette.cakeStroke}
            strokeWidth="1.6"
          />
          <path
            d="M138 214 H182 L188 222 H132 Z"
            fill={palette.cakePlate}
            stroke={palette.cakeStroke}
            strokeWidth="1.4"
          />
        </svg>

        {/* Individual Tactile Candle Pills (44px+ Mobile Targets) */}
        <div className="mt-2 grid w-full grid-cols-5 gap-1.5">
          {litCandles.map((isLit, idx) => (
            <button
              key={`candle-pill-${idx}`}
              type="button"
              onClick={() => extinguishCandle(idx)}
              disabled={!isLit}
              title={copy.candlePillLabel(idx + 1)}
              aria-label={copy.candleTapAria(idx + 1, isLit)}
              style={{
                ...(langSafe ?? {}),
                backgroundColor: isLit ? palette.secondaryBg : 'transparent',
                borderColor: isLit ? palette.secondaryBorder : palette.innerBorder,
                color: isLit ? palette.secondaryText : palette.mutedColor,
              }}
              className={`flex min-h-[44px] flex-col items-center justify-center rounded-xl border px-1 py-1.5 text-[10.5px] font-bold transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 ${
                isLit ? 'opacity-100' : 'opacity-55 line-through'
              }`}
            >
              <span
                aria-hidden="true"
                className="mb-0.5 h-2 w-2 rounded-full"
                style={{
                  backgroundColor: isLit ? '#F59E0B' : palette.mutedColor,
                  boxShadow: isLit ? '0 0 8px rgba(245, 158, 11, 0.75)' : 'none',
                }}
              />
              <span className="truncate">{idx + 1}</span>
            </button>
          ))}
        </div>

        {/* Progress + Blow All / Wish Sealed State */}
        <div className="mt-3.5 w-full">
          {!allOut ? (
            <div className="flex flex-col items-center gap-2.5 sm:flex-row sm:justify-between">
              <span
                style={{ ...(langSafe ?? {}), color: palette.mutedColor }}
                className="font-mono text-xs font-semibold"
              >
                {copy.candlesProgress(blownCount, WISH_CANDLE_COUNT)}
              </span>

              <button
                type="button"
                onClick={handleBlowAll}
                style={{
                  ...(langSafe ?? {}),
                  background: palette.accentBg,
                  color: palette.accentText,
                }}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 font-serif text-xs font-bold shadow-md transition hover:brightness-105 active:scale-[0.98] sm:w-auto"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
                  <path
                    d="M3 8.5 H12.5 C14.4 8.5 15.5 7.4 15.5 6 C15.5 4.6 14.4 3.5 13 3.5 C11.8 3.5 11 4.2 10.8 5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                  <path
                    d="M3 12.5 H15 C16.6 12.5 17.5 13.5 17.5 14.8 C17.5 16 16.5 17 15.2 17 C14.1 17 13.4 16.3 13.2 15.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
                <span>{copy.blowAllBtn}</span>
              </button>
            </div>
          ) : (
            <div
              role="status"
              className="rounded-2xl border px-4 py-3.5 text-center"
              style={{
                backgroundColor: palette.eyebrowBg,
                borderColor: palette.cardBorder,
              }}
            >
              <div className="inline-flex items-center justify-center gap-1.5">
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  aria-hidden="true"
                  style={{ color: palette.eyebrowText }}
                >
                  <path
                    d="M10 2 L12.2 7.4 L18 8 L13.6 11.8 L14.9 17.5 L10 14.5 L5.1 17.5 L6.4 11.8 L2 8 L7.8 7.4 Z"
                    fill="currentColor"
                  />
                </svg>
                <p
                  style={{ ...(langSafe ?? {}), color: palette.titleColor }}
                  className="font-heading text-base font-bold sm:text-lg"
                >
                  {copy.wishSealedTitle}
                </p>
              </div>
              <p
                style={{ ...(langSafe ?? {}), color: palette.bodyColor }}
                className="mt-1 font-serif text-xs leading-relaxed sm:text-[13px]"
              >
                {copy.wishSealedBody(receiverName)}
              </p>
              <button
                type="button"
                onClick={handleRelight}
                style={{
                  ...(langSafe ?? {}),
                  backgroundColor: palette.secondaryBg,
                  borderColor: palette.secondaryBorder,
                  color: palette.secondaryText,
                }}
                className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 py-2 font-serif text-xs font-bold transition hover:brightness-105 active:scale-95"
              >
                {copy.relightBtn}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface BirthdayFortuneAndTreatJarCardProps {
  palette: VariantPalette;
  copy: ConfettiSuiteCopy;
  coreLang: CoreLanguageCode;
  receiverName: string;
  senderName: string;
  whatsappPhone?: string;
  isHindi: boolean;
  langSafe?: React.CSSProperties;
  reducedMotion: boolean;
  onInteract: () => void;
}

function BirthdayFortuneAndTreatJarCard({
  palette,
  copy,
  coreLang,
  receiverName,
  senderName,
  whatsappPhone,
  isHindi,
  langSafe,
  reducedMotion,
  onInteract,
}: BirthdayFortuneAndTreatJarCardProps) {
  const [drawnIndices, setDrawnIndices] = useState<number[]>([]);
  const [activeFortuneIdx, setActiveFortuneIdx] = useState<number | null>(null);
  const [jarPulseKey, setJarPulseKey] = useState(0);
  const [selectedTreatId, setSelectedTreatId] = useState<TreatPassId>('coffee-cake');
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const selectedTreat =
    TREAT_PASS_OPTIONS.find((item) => item.id === selectedTreatId) ?? TREAT_PASS_OPTIONS[0];

  const handleDrawFortune = useCallback(() => {
    onInteract();
    setJarPulseKey((prev) => prev + 1);
    const nextIdx =
      activeFortuneIdx === null ? 0 : (activeFortuneIdx + 1) % BIRTHDAY_FORTUNES.length;
    setActiveFortuneIdx(nextIdx);
    setDrawnIndices((prev) => (prev.includes(nextIdx) ? prev : [...prev, nextIdx]));
    playPaperUnsealSfx(nextIdx);
  }, [activeFortuneIdx, onInteract]);

  const handleSelectTreat = useCallback(
    (id: TreatPassId, idx: number) => {
      setSelectedTreatId(id);
      playPaperUnsealSfx(idx + 1);
      onInteract();
    },
    [onInteract],
  );

  const claimMessage = useMemo(() => {
    const treatLabel = selectedTreat.title[coreLang];
    const fortuneLine =
      activeFortuneIdx !== null ? BIRTHDAY_FORTUNES[activeFortuneIdx]?.[coreLang] : null;

    if (coreLang === 'hi') {
      return fortuneLine
        ? `धन्यवाद ${senderName}! आपका जन्मदिन सरप्राइज़ बेहद प्यारा लगा। मैंने सभी मोमबत्तियाँ बुझाईं और अपना ट्रीट पास चुना है: "${treatLabel}"! जार का संदेश: "${fortuneLine}"`
        : `धन्यवाद ${senderName}! आपका जन्मदिन सरप्राइज़ बेहद प्यारा लगा। मैं अपना जन्मदिन ट्रीट पास क्लेम कर रहा/रही हूँ: "${treatLabel}"!`;
    }
    if (coreLang === 'hinglish') {
      return fortuneLine
        ? `Thank you so much ${senderName}! Tumhara birthday surprise dil ko chhoo gaya. Main apna Birthday Treat Pass claim kar raha/rahi hoon: "${treatLabel}"! Wish Jar fortune: "${fortuneLine}"`
        : `Thank you so much ${senderName}! Tumhara birthday surprise bahut pyaara laga. Main apna Birthday Treat Pass claim kar raha/rahi hoon: "${treatLabel}"!`;
    }
    return fortuneLine
      ? `Thank you so much, ${senderName}! Loved this birthday surprise. I am officially claiming my Birthday Treat Pass: "${treatLabel}"! My Wish Jar fortune: "${fortuneLine}"`
      : `Thank you so much, ${senderName}! Loved this birthday surprise. I am officially claiming my Birthday Treat Pass: "${treatLabel}"!`;
  }, [activeFortuneIdx, coreLang, selectedTreat.title, senderName]);

  const handleCopyClaim = useCallback(async () => {
    onInteract();
    playLanternPullChime();
    await copyTextWithFallback(claimMessage);
    setCopied(true);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 3400);
  }, [claimMessage, onInteract]);

  const cleanWhatsappDigits = useMemo(() => {
    if (!whatsappPhone) return '';
    return whatsappPhone.replace(/[^\d]/g, '');
  }, [whatsappPhone]);

  const activeFortuneText =
    activeFortuneIdx !== null ? BIRTHDAY_FORTUNES[activeFortuneIdx]?.[coreLang] ?? null : null;

  return (
    <section
      aria-label={copy.jarTitle}
      className="relative overflow-hidden rounded-[26px] border p-5 sm:p-6"
      style={{
        background: palette.cardBg,
        borderColor: palette.cardBorder,
        boxShadow: palette.cardShadow,
      }}
    >
      {/* Part A: Interactive Birthday Fortune Jar */}
      <div className="text-center">
        <span
          style={{
            ...(langSafe ?? {}),
            backgroundColor: palette.eyebrowBg,
            color: palette.eyebrowText,
          }}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[10.5px] font-bold ${
            isHindi ? 'not-italic' : 'uppercase tracking-[0.14em]'
          }`}
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: palette.eyebrowText }}
          />
          {copy.jarEyebrow}
        </span>

        <h2
          style={{ ...(langSafe ?? {}), color: palette.titleColor }}
          className="mt-2.5 break-words font-heading text-xl font-bold leading-snug sm:text-2xl"
        >
          {copy.jarTitle}
        </h2>

        <p
          style={{ ...(langSafe ?? {}), color: palette.mutedColor }}
          className="mx-auto mt-1.5 max-w-md font-serif text-xs leading-relaxed sm:text-[13px]"
        >
          {copy.jarSubtitle}
        </p>
      </div>

      <div
        className="mt-4 rounded-2xl border p-4 text-center"
        style={{
          backgroundColor: palette.innerBg,
          borderColor: palette.innerBorder,
        }}
      >
        <button
          type="button"
          onClick={handleDrawFortune}
          aria-label={activeFortuneText ? copy.drawAnotherBtn : copy.drawFortuneBtn}
          className="group mx-auto flex min-h-[44px] flex-col items-center justify-center rounded-2xl px-4 py-2 focus-visible:outline-none focus-visible:ring-2"
        >
          <div
            key={`jar-shake-${jarPulseKey}`}
            className={jarPulseKey > 0 && !reducedMotion ? 'birthday-jar-shake' : ''}
          >
            <svg viewBox="0 0 140 132" className="h-28 w-28" fill="none" aria-hidden="true">
              {/* Cork Lid */}
              <rect
                x="46"
                y="12"
                width="48"
                height="16"
                rx="4"
                fill="#C8935B"
                stroke={palette.jarStroke}
                strokeWidth="1.7"
              />
              {/* Jar Neck & Ribbon */}
              <rect
                x="42"
                y="26"
                width="56"
                height="11"
                rx="3"
                fill={palette.jarTint}
                stroke={palette.jarStroke}
                strokeWidth="1.7"
              />
              <path
                d="M42 32 H98"
                stroke={palette.cakeGlaze}
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              {/* Glass Body */}
              <path
                d="M44 37 C30 43 24 55 24 72 V104 C24 115 32 122 43 122 H97 C108 122 116 115 116 104 V72 C116 55 110 43 96 37 Z"
                fill={palette.jarTint}
                stroke={palette.jarStroke}
                strokeWidth="2"
              />
              {/* Folded Paper Fortune Chits Inside */}
              <rect
                x="38"
                y="84"
                width="28"
                height="13"
                rx="2.5"
                transform="rotate(-14 52 90)"
                fill={palette.candleColors[1]}
                fillOpacity="0.88"
                stroke={palette.jarStroke}
                strokeWidth="1.1"
              />
              <rect
                x="66"
                y="86"
                width="30"
                height="13"
                rx="2.5"
                transform="rotate(11 81 92)"
                fill={palette.candleColors[0]}
                fillOpacity="0.85"
                stroke={palette.jarStroke}
                strokeWidth="1.1"
              />
              <rect
                x="50"
                y="98"
                width="32"
                height="13"
                rx="2.5"
                transform="rotate(-4 66 104)"
                fill={palette.candleColors[3]}
                fillOpacity="0.88"
                stroke={palette.jarStroke}
                strokeWidth="1.1"
              />
              <rect
                x="44"
                y="67"
                width="26"
                height="12"
                rx="2.5"
                transform="rotate(9 57 73)"
                fill={palette.candleColors[2]}
                fillOpacity="0.82"
                stroke={palette.jarStroke}
                strokeWidth="1.1"
              />
              {/* Floating Sparkle Stars */}
              <path
                d="M84 56 L86 60 L90 62 L86 64 L84 68 L82 64 L78 62 L82 60 Z"
                fill="#F59E0B"
              />
              <circle cx="52" cy="54" r="2.2" fill={palette.jarStroke} fillOpacity="0.55" />
              {/* Glass Specular Highlight */}
              <path
                d="M35 58 C33 69 33 88 35 104"
                stroke="#FFFFFF"
                strokeOpacity="0.55"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </button>

        <div className="mt-1 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={handleDrawFortune}
            style={{
              ...(langSafe ?? {}),
              background: palette.accentBg,
              color: palette.accentText,
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2.5 font-serif text-xs font-bold shadow-sm transition hover:brightness-105 active:scale-[0.98]"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
              <path
                d="M10 2.5 L11.8 7.6 L17 9.4 L11.8 11.2 L10 16.5 L8.2 11.2 L3 9.4 L8.2 7.6 Z"
                fill="currentColor"
              />
            </svg>
            <span>{activeFortuneText ? copy.drawAnotherBtn : copy.drawFortuneBtn}</span>
          </button>

          {drawnIndices.length > 0 ? (
            <span
              style={{ ...(langSafe ?? {}), color: palette.mutedColor }}
              className="font-mono text-[11px] font-semibold"
            >
              {copy.fortuneCountLabel(drawnIndices.length, BIRTHDAY_FORTUNES.length)}
            </span>
          ) : null}
        </div>

        {activeFortuneText ? (
          <div
            role="status"
            key={`fortune-chit-${activeFortuneIdx}`}
            className="mt-3.5 rounded-xl border border-dashed px-4 py-3.5 text-center"
            style={{
              backgroundColor: palette.eyebrowBg,
              borderColor: palette.cardBorder,
            }}
          >
            <p
              style={{ ...(langSafe ?? {}), color: palette.eyebrowText }}
              className={`text-[10px] font-bold ${
                isHindi ? 'not-italic' : 'uppercase tracking-[0.16em]'
              }`}
            >
              {copy.fortuneChitHeader} · 0{(activeFortuneIdx ?? 0) + 1}
            </p>
            <p
              style={{ ...(langSafe ?? {}), color: palette.titleColor }}
              className="mt-1.5 font-serif text-sm font-medium leading-relaxed sm:text-[15px]"
            >
              {activeFortuneText}
            </p>
          </div>
        ) : (
          <p
            style={{ ...(langSafe ?? {}), color: palette.mutedColor }}
            className="mt-2.5 font-serif text-xs"
          >
            {copy.fortuneIdleHint}
          </p>
        )}
      </div>

      {/* Divider */}
      <div
        aria-hidden="true"
        className="my-5 flex items-center gap-3"
      >
        <span className="h-px flex-1" style={{ backgroundColor: palette.cardBorder }} />
        <span
          className="h-2 w-2 rotate-45 rounded-[1px]"
          style={{ backgroundColor: palette.eyebrowText }}
        />
        <span className="h-px flex-1" style={{ backgroundColor: palette.cardBorder }} />
      </div>

      {/* Part B: Claim Your Birthday Treat Pass */}
      <div className="text-center">
        <span
          style={{
            ...(langSafe ?? {}),
            backgroundColor: palette.eyebrowBg,
            color: palette.eyebrowText,
          }}
          className={`inline-block rounded-full px-3.5 py-1 text-[10.5px] font-bold ${
            isHindi ? 'not-italic' : 'uppercase tracking-[0.14em]'
          }`}
        >
          {copy.treatEyebrow}
        </span>
        <h3
          style={{ ...(langSafe ?? {}), color: palette.titleColor }}
          className="mt-2 font-heading text-lg font-bold sm:text-xl"
        >
          {copy.treatTitle}
        </h3>
        <p
          style={{ ...(langSafe ?? {}), color: palette.mutedColor }}
          className="mx-auto mt-1 max-w-md font-serif text-xs leading-relaxed"
        >
          {copy.treatSubtitle}
        </p>
      </div>

      <div className="mt-4 grid gap-2.5">
        {TREAT_PASS_OPTIONS.map((option, idx) => {
          const isSelected = option.id === selectedTreatId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelectTreat(option.id, idx)}
              aria-pressed={isSelected}
              style={{
                backgroundColor: isSelected ? palette.eyebrowBg : palette.innerBg,
                borderColor: isSelected ? palette.eyebrowText : palette.innerBorder,
              }}
              className="group relative flex min-h-[68px] w-full items-center gap-3 rounded-2xl border-2 border-dashed px-3.5 py-3 text-left transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2"
            >
              <TreatPassIcon
                id={option.id}
                color={isSelected ? palette.eyebrowText : palette.mutedColor}
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span
                    style={{ ...(langSafe ?? {}), color: palette.titleColor }}
                    className="font-heading text-sm font-bold leading-snug"
                  >
                    {option.title[coreLang]}
                  </span>
                  <span
                    style={{
                      ...(langSafe ?? {}),
                      backgroundColor: isSelected ? palette.eyebrowText : palette.secondaryBg,
                      color: isSelected
                        ? palette.isDark
                          ? '#2E090D'
                          : '#FFFDF8'
                        : palette.mutedColor,
                    }}
                    className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-bold ${
                      isHindi ? 'not-italic' : 'uppercase tracking-[0.12em]'
                    }`}
                  >
                    {isSelected ? copy.treatSelectedTag : option.stamp[coreLang]}
                  </span>
                </div>
                <p
                  style={{ ...(langSafe ?? {}), color: palette.mutedColor }}
                  className="mt-0.5 font-serif text-xs leading-relaxed"
                >
                  {option.subtitle[coreLang]}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Claim Ticket Summary & 1-Tap Copy for WhatsApp */}
      <div
        className="mt-4 rounded-2xl border p-4 text-center"
        style={{
          backgroundColor: palette.innerBg,
          borderColor: palette.innerBorder,
        }}
      >
        <p
          style={{ ...(langSafe ?? {}), color: palette.mutedColor }}
          className="font-serif text-[11.5px] font-semibold"
        >
          {copy.treatVoucherMeta(receiverName, senderName)}
        </p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => void handleCopyClaim()}
            style={{
              ...(langSafe ?? {}),
              background: palette.accentBg,
              color: palette.accentText,
            }}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 font-serif text-xs font-bold shadow-md transition hover:brightness-105 active:scale-[0.98] sm:w-auto"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
              <rect x="6.5" y="6.5" width="9.5" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.7" />
              <path
                d="M4 13 V5 C4 3.9 4.9 3 6 3 H12.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            <span>{copy.copyClaimBtn}</span>
          </button>

          {cleanWhatsappDigits.length >= 10 ? (
            <a
              href={`https://wa.me/${cleanWhatsappDigits}?text=${encodeURIComponent(claimMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...(langSafe ?? {}),
                backgroundColor: palette.secondaryBg,
                borderColor: palette.secondaryBorder,
                color: palette.secondaryText,
              }}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border px-4 py-2.5 font-serif text-xs font-bold transition hover:brightness-105 active:scale-[0.98] sm:w-auto"
            >
              {copy.openWhatsappBtn}
            </a>
          ) : null}
        </div>

        {copied ? (
          <p
            role="status"
            style={{ ...(langSafe ?? {}), color: palette.eyebrowText }}
            className="mt-2.5 font-serif text-xs font-bold"
          >
            {copy.copiedClaimToast}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Happy Birthday Flagship Multi-Theme Experience Orchestrator:
 * - normal: Powder-Blue Polka-Dot Scrapbook, Ransom Cutouts & Dual Mic/Tap Blow-Out Cake
 * - couple: Deep Velvet Crimson Desk, Interactive Bow & Arrow, 3-Ring Binder & 35mm Filmstrip
 * - family: Warm Cotton Ivory Gift Box, 3D Flower Vortex, Left-to-Right Flower Wave & Heart-Balloon Tree
 * Extended with the interactive Celebration Suite: Buyer Highlights, 5-Candle Wish Cake Ritual,
 * and Birthday Fortune & Treat Jar with 1-Tap WhatsApp Treat Claim.
 */
export function BirthdayConfettiSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const autoVariant = resolveBirthdayTheme(data.relation);
  const [manualVariant, setManualVariant] = useState<BirthdayThemeVariant | null>(null);
  const [sceneKey, setSceneKey] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [starredHighlights, setStarredHighlights] = useState<Record<number, boolean>>({});
  const openedNotifiedRef = useRef(false);

  const reducedMotion = useBirthdayReducedMotion();

  // Sync automatically when buyer switches relation inside CreateWizardClient
  useEffect(() => {
    setManualVariant(null);
    setSceneKey((prev) => prev + 1);
  }, [data.relation]);

  const handleOpenedOnce = useCallback(() => {
    if (!openedNotifiedRef.current) {
      openedNotifiedRef.current = true;
      onOpened?.();
    }
  }, [onOpened]);

  const activeVariant: BirthdayThemeVariant =
    watermarked && manualVariant ? manualVariant : autoVariant;
  const coreLang = toCoreLanguageCode(language);
  const isHindi = coreLang === 'hi';
  const langSafe = hiSafeStyle(coreLang);
  const copy = SUITE_COPY[coreLang] ?? SUITE_COPY.en;
  const palette = useMemo(() => getVariantPalette(activeVariant), [activeVariant]);
  const photos = getValidPhotos(data.photos);
  const highlights = useMemo(
    () => (Array.isArray(data.highlights) ? data.highlights.slice(0, 4) : []),
    [data.highlights],
  );

  const receiverName = data.receiverName?.trim() || copy.fallbackReceiver;
  const senderName = data.senderName?.trim() || copy.fallbackSender;

  function handleSelectDemoVariant(nextVariant: BirthdayThemeVariant) {
    setManualVariant(nextVariant);
    setLightboxIdx(null);
    setSceneKey((prev) => prev + 1);
  }

  const accentForLightbox =
    activeVariant === 'couple'
      ? '#9E171D'
      : activeVariant === 'family'
        ? '#B82936'
        : '#1557B0';

  const footerTextColor =
    activeVariant === 'couple' ? 'text-[#FAF5EC]/75' : 'text-[#2B1B2E]/65';

  const outerBgColor =
    activeVariant === 'couple'
      ? '#9E171D'
      : activeVariant === 'family'
        ? '#F6F2E9'
        : '#F5F1E6';

  return (
    <div
      className="relative flex min-h-full w-full max-w-full flex-col justify-between overflow-x-clip rounded-[28px]"
      style={{ backgroundColor: outerBgColor }}
    >
      <style>{`
        @keyframes birthday-wish-flame-flicker {
          0%, 100% { transform: scaleY(1) scaleX(1) skewX(0deg); }
          30% { transform: scaleY(1.08) scaleX(0.94) skewX(-2.2deg); }
          60% { transform: scaleY(0.95) scaleX(1.04) skewX(1.8deg); }
        }
        @keyframes birthday-smoke-curl {
          0% { opacity: 0; transform: translateY(4px) scale(0.82); }
          25% { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(-20px) scale(1.18); }
        }
        @keyframes birthday-suite-confetti-fall {
          0% { opacity: 0; transform: translate3d(0, -10px, 0) rotate(0deg) scale(0.7); }
          15% { opacity: 1; }
          85% { opacity: 0.9; }
          100% { opacity: 0; transform: translate3d(var(--c-x, 18px), 280px, 0) rotate(var(--c-rot, 180deg)) scale(1); }
        }
        @keyframes birthday-jar-shake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-7deg) scale(1.04); }
          45% { transform: rotate(7deg) scale(1.05); }
          70% { transform: rotate(-4deg) scale(1.02); }
        }
        .birthday-wish-flame-flicker {
          animation: birthday-wish-flame-flicker 1.7s ease-in-out infinite;
        }
        .birthday-smoke-curl {
          animation: birthday-smoke-curl 1.5s ease-out forwards;
        }
        .birthday-suite-confetti {
          animation: birthday-suite-confetti-fall var(--c-dur, 2s) cubic-bezier(0.22, 0.61, 0.36, 1) var(--c-delay, 0ms) forwards;
        }
        .birthday-jar-shake {
          animation: birthday-jar-shake 0.48s ease-in-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .birthday-wish-flame-flicker,
          .birthday-smoke-curl,
          .birthday-suite-confetti,
          .birthday-jar-shake {
            animation: none !important;
          }
        }
      `}</style>

      {watermarked ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none relative z-30 flex justify-center border-b py-1.5 font-mono text-[10px] font-bold tracking-[0.18em] ${
            activeVariant === 'couple'
              ? 'border-white/15 bg-[#6E0D12]/90 text-[#FAF5EC]/90'
              : 'border-black/10 bg-white/75 text-[#2B1B2E]/75'
          }`}
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      <div className="relative flex flex-1 flex-col">
        {activeVariant === 'normal' ? (
          <BirthdayNormalTheme
            key={`normal-${sceneKey}`}
            manifest={manifest}
            data={data}
            language={language}
            watermarked={watermarked}
            onOpened={handleOpenedOnce}
            onOpenPhoto={setLightboxIdx}
          />
        ) : activeVariant === 'couple' ? (
          <BirthdayCoupleTheme
            key={`couple-${sceneKey}`}
            manifest={manifest}
            data={data}
            language={language}
            watermarked={watermarked}
            onOpened={handleOpenedOnce}
            onOpenPhoto={setLightboxIdx}
          />
        ) : (
          <BirthdayFamilyTheme
            key={`family-${sceneKey}`}
            manifest={manifest}
            data={data}
            language={language}
            watermarked={watermarked}
            onOpened={handleOpenedOnce}
            onOpenPhoto={setLightboxIdx}
          />
        )}

        {/* Cohesive Interactive Birthday Celebration Suite (Theme-Adapted across all 3 variants) */}
        <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-5 px-4 pb-6 pt-3 sm:px-6">
          {/* Buyer Custom Highlights Showcase (when present) */}
          {highlights.length > 0 ? (
            <section
              aria-label={copy.highlightsTitle}
              className="rounded-[26px] border p-5 sm:p-6"
              style={{
                background: palette.cardBg,
                borderColor: palette.cardBorder,
                boxShadow: palette.cardShadow,
              }}
            >
              <div className="text-center">
                <span
                  style={{
                    ...(langSafe ?? {}),
                    backgroundColor: palette.eyebrowBg,
                    color: palette.eyebrowText,
                  }}
                  className={`inline-block rounded-full px-3.5 py-1 text-[10.5px] font-bold ${
                    isHindi ? 'not-italic' : 'uppercase tracking-[0.14em]'
                  }`}
                >
                  {copy.highlightsEyebrow}
                </span>
                <h2
                  style={{ ...(langSafe ?? {}), color: palette.titleColor }}
                  className="mt-2 font-heading text-lg font-bold sm:text-xl"
                >
                  {copy.highlightsTitle}
                </h2>
              </div>

              <div className="mt-4 grid gap-2.5">
                {highlights.map((item, idx) => {
                  const isStarred = Boolean(starredHighlights[idx]);
                  return (
                    <button
                      key={`birthday-highlight-${idx}`}
                      type="button"
                      onClick={() => {
                        playPaperUnsealSfx(idx);
                        handleOpenedOnce();
                        setStarredHighlights((prev) => ({
                          ...prev,
                          [idx]: !prev[idx],
                        }));
                      }}
                      aria-pressed={isStarred}
                      style={{
                        backgroundColor: isStarred ? palette.eyebrowBg : palette.innerBg,
                        borderColor: isStarred ? palette.eyebrowText : palette.innerBorder,
                      }}
                      className="flex min-h-[56px] w-full items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2"
                    >
                      <div className="min-w-0 flex-1">
                        <h3
                          style={{ ...(langSafe ?? {}), color: palette.titleColor }}
                          className="break-words font-heading text-sm font-bold"
                        >
                          {pickLocalizedText(item.title, language)}
                        </h3>
                        <p
                          style={{ ...(langSafe ?? {}), color: palette.bodyColor }}
                          className="mt-0.5 break-words font-serif text-xs leading-relaxed sm:text-[13px]"
                        >
                          {pickLocalizedText(item.detail, language)}
                        </p>
                      </div>
                      <span
                        style={{
                          ...(langSafe ?? {}),
                          color: isStarred ? palette.eyebrowText : palette.mutedColor,
                        }}
                        className="mt-0.5 inline-flex shrink-0 items-center gap-1 font-mono text-[10px] font-bold"
                      >
                        <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none" aria-hidden="true">
                          <path
                            d="M9 1.8 L11.1 6.4 L16 7 L12.3 10.4 L13.4 15.3 L9 12.7 L4.6 15.3 L5.7 10.4 L2 7 L6.9 6.4 Z"
                            fill={isStarred ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="1.4"
                          />
                        </svg>
                        <span>{isStarred ? copy.highlightsSaved : copy.highlightsSaveHint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* 1. Interactive 5-Candle Birthday Cake Wish Ritual */}
          <FiveCandleWishRitualCard
            palette={palette}
            copy={copy}
            receiverName={receiverName}
            isHindi={isHindi}
            langSafe={langSafe}
            reducedMotion={reducedMotion}
            onInteract={handleOpenedOnce}
          />

          {/* 2. Interactive Birthday Fortune Jar & Claimable Treat Passes */}
          <BirthdayFortuneAndTreatJarCard
            palette={palette}
            copy={copy}
            coreLang={coreLang}
            receiverName={receiverName}
            senderName={senderName}
            whatsappPhone={data.whatsappPhone}
            isHindi={isHindi}
            langSafe={langSafe}
            reducedMotion={reducedMotion}
            onInteract={handleOpenedOnce}
          />
        </div>
      </div>

      <footer
        style={langSafe}
        className={`relative z-20 px-4 pb-4 pt-2 text-center text-[11px] font-medium ${footerTextColor}`}
      >
        {getWebzyFooterLabel(language)}
      </footer>

      {watermarked ? (
        <BirthdayDemoSwitcher
          activeVariant={activeVariant}
          language={coreLang}
          onSelect={handleSelectDemoVariant}
        />
      ) : null}

      <BirthdayPhotoLightbox
        photos={photos}
        activeIdx={lightboxIdx}
        accentColor={accentForLightbox}
        onChangeIdx={setLightboxIdx}
      />
    </div>
  );
}
