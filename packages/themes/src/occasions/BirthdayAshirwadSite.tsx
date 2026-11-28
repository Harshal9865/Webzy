'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  type CoreLanguageCode,
  pickLocalizedText,
  toCoreLanguageCode,
} from '@webzy/core';
import {
  type OccasionSiteProps,
  OccasionCassettePlayer,
  getWebzyFooterLabel,
} from './shared/OccasionPrimitives';
import {
  playLanternPullChime,
  playPaperUnsealSfx,
} from './shared/OccasionCraftPrimitives';

interface AshirwadCopy {
  courtyardEyebrow: string;
  recipientPrefix: string;
  diyaSectionLabel: string;
  lightDiyaCta: string;
  diyaLitStatus: string;
  diyaLitWhisper: string;
  diyaUnlitWhisper: string;
  scrollEyebrow: string;
  signOffLabel: string;
  showerBlessingsCta: string;
  blessingsShoweredLabel: (count: number) => string;
  galleryEyebrow: string;
  galleryTitle: string;
  galleryHint: string;
  photoCaptionPrefix: string;
  highlightsEyebrow: string;
  closeModalLabel: string;
  prevPhotoLabel: string;
  nextPhotoLabel: string;
  defaultPhotoCaptions: readonly [string, string];
}

const ASHIRWAD_COPY: Record<CoreLanguageCode, AshirwadCopy> = {
  en: {
    courtyardEyebrow: 'Sunlit Courtyard · Ashirwad',
    recipientPrefix: 'With reverence for',
    diyaSectionLabel: 'Sacred Brass Diya Ritual',
    lightDiyaCta: 'Light the Diya',
    diyaLitStatus: 'Sacred Flame Lit',
    diyaLitWhisper: 'May warm light, serenity, and long life grace every morning.',
    diyaUnlitWhisper: 'Tap to kindle the brass lamp and bathe the courtyard in golden light.',
    scrollEyebrow: 'Silk Blessing Scroll',
    signOffLabel: 'With eternal gratitude & pranam,',
    showerBlessingsCta: 'Shower Blessings',
    blessingsShoweredLabel: (count) =>
      count === 1 ? 'Marigold blessings showered' : `${count} waves of marigold blessings`,
    galleryEyebrow: 'Arched Keepsakes',
    galleryTitle: 'Courtyard Memories',
    galleryHint: 'Tap any arched portrait to inspect closely',
    photoCaptionPrefix: 'Keepsake',
    highlightsEyebrow: 'Cherished Notes',
    closeModalLabel: 'Close photo viewer',
    prevPhotoLabel: 'Previous photo',
    nextPhotoLabel: 'Next photo',
    defaultPhotoCaptions: ['Sunlit Veranda', 'Marigold Morning'],
  },
  hinglish: {
    courtyardEyebrow: 'Sunlit Aangan · Sadar Ashirwad',
    recipientPrefix: 'Aadar aur sneh ke saath',
    diyaSectionLabel: 'Shubh Brass Diya Ritual',
    lightDiyaCta: 'Light the Diya',
    diyaLitStatus: 'Shubh Jyot Roshan Hui',
    diyaLitWhisper: 'Aapki achhi sehat, sukoon aur lambi umar ke liye mangal jyot.',
    diyaUnlitWhisper: 'Aangan ko sunahri roshni se bharne ke liye peetal ka diya jalayein.',
    scrollEyebrow: 'Sneh Bhara Sandesh',
    signOffLabel: 'Dil se aadar aur pranam,',
    showerBlessingsCta: 'Shower Blessings',
    blessingsShoweredLabel: (count) =>
      count === 1 ? 'Genda phoolon ka ashirwad arpit' : `${count} baar mangal ashirwad arpit`,
    galleryEyebrow: 'Anmol Yaadein',
    galleryTitle: 'Aangan ki Tasveerein',
    galleryHint: 'Paas se dekhne ke liye tasveer par tap karein',
    photoCaptionPrefix: 'Yaad',
    highlightsEyebrow: 'Khaas Baatein',
    closeModalLabel: 'Tasveer band karein',
    prevPhotoLabel: 'Pichli tasveer',
    nextPhotoLabel: 'Agli tasveer',
    defaultPhotoCaptions: ['Dhoop Bhara Aangan', 'Genda Phool Subah'],
  },
  hi: {
    courtyardEyebrow: 'स्वर्णिम आँगन · सादर आशीर्वाद',
    recipientPrefix: 'सादर एवं ससम्मान',
    diyaSectionLabel: 'मंगल दीप प्रज्वलन',
    lightDiyaCta: 'दीया प्रज्वलित करें',
    diyaLitStatus: 'मंगल ज्योति प्रज्वलित',
    diyaLitWhisper: 'आपके उत्तम स्वास्थ्य, शांति और दीर्घायु की पावन मंगलकामना।',
    diyaUnlitWhisper: 'आँगन को स्वर्णिम आभा से भरने के लिए पीतल का दीया प्रज्वलित करें।',
    scrollEyebrow: 'रेशमी आशीर्वाद पत्र',
    signOffLabel: 'सादर प्रणाम एवं कृतज्ञता सहित,',
    showerBlessingsCta: 'पुष्प वर्षा करें',
    blessingsShoweredLabel: (count) =>
      count === 1 ? 'गेंदा पुष्प आशीर्वाद समर्पित' : `${count} बार मंगल पुष्प वर्षा`,
    galleryEyebrow: 'परिवार की धरोहर',
    galleryTitle: 'आँगन की मधुर स्मृतियाँ',
    galleryHint: 'विस्तार से देखने के लिए चित्र पर टैप करें',
    photoCaptionPrefix: 'स्मृति',
    highlightsEyebrow: 'हृदय की बातें',
    closeModalLabel: 'चित्र बंद करें',
    prevPhotoLabel: 'पिछला चित्र',
    nextPhotoLabel: 'अगला चित्र',
    defaultPhotoCaptions: ['स्वर्णिम आँगन', 'प्रातःकालीन गेंदा'],
  },
};

const RELATION_LABELS: Record<string, Record<CoreLanguageCode, string>> = {
  mummy: { en: 'Beloved Mother', hinglish: 'Mummy · Maa', hi: 'मम्मी · माँ' },
  papa: { en: 'Revered Father', hinglish: 'Papa · Pitaji', hi: 'पापा · पिताजी' },
  grandparent: {
    en: 'Respected Elder',
    hinglish: 'Dada-Dadi · Nana-Nani',
    hi: 'दादा-दादी · नाना-नानी',
  },
};

interface ThaliOfferingItem {
  id: 'marigold' | 'tilak' | 'mithai' | 'tulsi';
  label: Record<CoreLanguageCode, string>;
  couplet: Record<CoreLanguageCode, string>;
}

const SHUBH_OFFERINGS: readonly ThaliOfferingItem[] = [
  {
    id: 'marigold',
    label: {
      en: 'Marigold Garland',
      hinglish: 'Genda Haar',
      hi: 'गेंदा पुष्पमाला',
    },
    couplet: {
      en: 'May every doorway of your home bloom with morning sunlight and warmth.',
      hinglish: 'Aapke ghar ka har aangan subah ki dhoop aur khushiyon se mehakta rahe.',
      hi: 'आपका हर दिन प्रातःकालीन सूर्य की स्वर्णिम आभा और मंगल से खिलता रहे।',
    },
  },
  {
    id: 'tilak',
    label: {
      en: 'Sandalwood Tilak',
      hinglish: 'Chandan Tilak',
      hi: 'चंदन तिलक',
    },
    couplet: {
      en: 'May quiet serenity, clarity, and grace surround every step you take.',
      hinglish: 'Aapke jeevan mein hamesha shanti, sehat aur sukoon bana rahe.',
      hi: 'आपके जीवन में सदैव शीतल शांति, उत्तम स्वास्थ्य और सद्भाव बना रहे।',
    },
  },
  {
    id: 'mithai',
    label: {
      en: 'Kesar Mithai',
      hinglish: 'Kesar Mithai',
      hi: 'केसर मिठाई',
    },
    couplet: {
      en: 'May the coming year taste as sweet as every meal you have shared with us.',
      hinglish: 'Aane wala saal har us muskaan ki tarah meetha ho jo aapne sabko di hai.',
      hi: 'आने वाला प्रत्येक वर्ष मधुरता, आनंद और परिवार के स्नेह से परिपूर्ण हो।',
    },
  },
  {
    id: 'tulsi',
    label: {
      en: 'Sacred Tulsi Leaf',
      hinglish: 'Pavitra Tulsi',
      hi: 'पावन तुलसी दल',
    },
    couplet: {
      en: 'May long life, vitality, and timeless protection rest upon our family.',
      hinglish: 'Aapki lambi umar aur achhi sehat hamare parivar ki sabse badi daulat hai.',
      hi: 'आपका दीर्घायु और स्वस्थ जीवन हमारे पूरे परिवार की सबसे अनमोल धरोहर है।',
    },
  },
];

interface FamilyBlessingPillar {
  id: 'health' | 'serenity' | 'pillar';
  title: Record<CoreLanguageCode, string>;
  blessing: Record<CoreLanguageCode, string>;
}

const FAMILY_BLESSING_PILLARS: readonly FamilyBlessingPillar[] = [
  {
    id: 'health',
    title: {
      en: 'Ayushman · Long & Healthy Life',
      hinglish: 'Achhi Sehat · Lambi Umar',
      hi: 'आयुष्मान · उत्तम स्वास्थ्य',
    },
    blessing: {
      en: 'May every season bring gentle mornings, strong health, and unhurried days.',
      hinglish: 'Har mausam aapke liye achhi sehat, halka man aur sukhdayi subah laaye.',
      hi: 'हर ऋतु आपके लिए उत्तम स्वास्थ्य, प्रसन्न मन और सुखद प्रभात लेकर आए।',
    },
  },
  {
    id: 'serenity',
    title: {
      en: 'Shanti · Courtyard of Peace',
      hinglish: 'Sukoon · Ghar ki Raunak',
      hi: 'शांति · घर की रौनक',
    },
    blessing: {
      en: 'Your voice turns every room into home — may your heart always stay at ease.',
      hinglish: 'Aapki maujoodgi se hi ghar ghar lagta hai — aap hamesha muskuraate rahein.',
      hi: 'आपकी उपस्थिति से ही घर में रौनक रहती है — आपका हृदय सदैव प्रसन्न रहे।',
    },
  },
  {
    id: 'pillar',
    title: {
      en: 'Samman · Guiding Light',
      hinglish: 'Margdarshak · Hamari Shakti',
      hi: 'सम्मान · मार्गदर्शक ज्योति',
    },
    blessing: {
      en: 'Everything good in us carries the quiet imprint of your patience and values.',
      hinglish: 'Hamari har achhi aadat mein aapke sanskaar aur pyaar ki jhalak hai.',
      hi: 'हमारे हर अच्छे संस्कार में आपके धैर्य, त्याग और आशीर्वाद की पावन छाप है।',
    },
  },
];

const EXTRA_ASHIRWAD_COPY: Record<
  CoreLanguageCode,
  {
    thaliEyebrow: string;
    thaliTitle: string;
    thaliHint: string;
    thaliProgress: (done: number, total: number) => string;
    thaliComplete: string;
    chimeTrackTitle: string;
    chimeTapLabel: string;
    chimePlayingLabel: string;
    pillarsEyebrow: string;
    pillarsTitle: string;
    sealCta: string;
    sealedBadge: string;
    sealedMotto: string;
    copyThanksCta: string;
    copiedThanksToast: string;
  }
> = {
  en: {
    thaliEyebrow: 'Shubh Arpan · Courtyard Thali',
    thaliTitle: 'Tap to Place Sacred Offerings',
    thaliHint: 'Tap each heirloom offering to light its blessing on the thali.',
    thaliProgress: (done, total) => `${done} / ${total} offerings placed`,
    thaliComplete: 'All 4 auspicious offerings placed with reverence.',
    chimeTrackTitle: 'Morning Courtyard Flute & Brass Chime',
    chimeTapLabel: 'Play Courtyard Chime',
    chimePlayingLabel: 'Playing Morning Chime...',
    pillarsEyebrow: 'Parivar ki Duaayein',
    pillarsTitle: 'Three Wishes From Our Home',
    sealCta: 'Accept Blessings & Seal Keepsake',
    sealedBadge: 'ASHIRWAD KEEPSAKE SEALED',
    sealedMotto: 'Sada Sukhi Bhava · Wishing You Health, Grace & Peace',
    copyThanksCta: 'Copy Thank-You Note',
    copiedThanksToast: 'Copied! Ready to paste on WhatsApp.',
  },
  hinglish: {
    thaliEyebrow: 'Shubh Arpan · Aangan ki Thali',
    thaliTitle: 'Shubh Bhent Arpit Karein',
    thaliHint: 'Har pavitra bhent par tap karein aur mangal kamna padhein.',
    thaliProgress: (done, total) => `${done} / ${total} bhent arpit`,
    thaliComplete: 'Sabhi 4 shubh bhent aadar ke saath arpit hui.',
    chimeTrackTitle: 'Subah ki Bansuri aur Mandir Ghanti',
    chimeTapLabel: 'Mangal Dhun Suniye',
    chimePlayingLabel: 'Mangal Dhun Chal Rahi Hai...',
    pillarsEyebrow: 'Parivar ki Duaayein',
    pillarsTitle: 'Ghar Se Teen Khaas Kaamnayein',
    sealCta: 'Ashirwad Sweekar Karein · Seal Lagayein',
    sealedBadge: 'MANGAL KEEPSAKE SEALED',
    sealedMotto: 'Sada Sukhi Bhava · Uttam Sehat, Shanti aur Sneh',
    copyThanksCta: 'Dhanyavaad Sandesh Copy Karein',
    copiedThanksToast: 'Copy ho gaya! WhatsApp par bhej sakte hain.',
  },
  hi: {
    thaliEyebrow: 'शुभ अर्पण · मंगल थाली',
    thaliTitle: 'मंगल भेंट अर्पित करें',
    thaliHint: 'प्रत्येक पावन भेंट पर टैप करें और मंगलकामना पढ़ें।',
    thaliProgress: (done, total) => `${done} / ${total} भेंट अर्पित`,
    thaliComplete: 'सभी 4 पावन भेंट सादर अर्पित हुईं।',
    chimeTrackTitle: 'प्रातःकालीन बाँसुरी एवं मंगल ध्वनि',
    chimeTapLabel: 'मंगल ध्वनि सुनें',
    chimePlayingLabel: 'मंगल ध्वनि बज रही है...',
    pillarsEyebrow: 'परिवार की मंगलकामनाएँ',
    pillarsTitle: 'हृदय से तीन विशेष शुभकामनाएँ',
    sealCta: 'आशीर्वाद स्वीकार करें · स्मृति मुहर लगाएँ',
    sealedBadge: 'मंगल स्मृति पत्र सुरक्षित',
    sealedMotto: 'सदा सुखी भव · उत्तम स्वास्थ्य, शांति एवं दीर्घायु',
    copyThanksCta: 'धन्यवाद संदेश कॉपी करें',
    copiedThanksToast: 'कॉपी हो गया! अब WhatsApp पर साझा करें।',
  },
};

function ThaliOfferingSvg({ id, active }: { id: ThaliOfferingItem['id']; active: boolean }) {
  const stroke = active ? '#9A3412' : '#B45309';
  if (id === 'marigold') {
    return (
      <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="14" stroke={stroke} strokeOpacity="0.3" strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx="20" cy="20" r="9.5" fill={active ? '#F59E0B' : '#FDE68A'} />
        <circle cx="20" cy="20" r="5.5" fill={active ? '#EA580C' : '#F59E0B'} />
        <circle cx="20" cy="20" r="2.2" fill="#FEF3C7" />
      </svg>
    );
  }
  if (id === 'tilak') {
    return (
      <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none" aria-hidden="true">
        <path d="M20 6 C25 14 27 22 20 33 C13 22 15 14 20 6 Z" fill={active ? '#DC2626' : '#F87171'} fillOpacity="0.9" />
        <path d="M20 11 C22.8 16.5 23.5 21.5 20 28 C16.5 21.5 17.2 16.5 20 11 Z" fill="#FDE68A" />
        <circle cx="20" cy="20" r="2.3" fill="#B91C1C" />
      </svg>
    );
  }
  if (id === 'mithai') {
    return (
      <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none" aria-hidden="true">
        <path d="M20 7 L33 20 L20 33 L7 20 Z" fill={active ? '#F59E0B' : '#FDE68A'} stroke={stroke} strokeWidth="1.4" />
        <path d="M20 12 L28 20 L20 28 L12 20 Z" fill="#FFFBEB" fillOpacity="0.55" />
        <circle cx="20" cy="20" r="2.4" fill="#DC2626" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none" aria-hidden="true">
      <path d="M20 33 V12" stroke="#15803D" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M20 26 C12 25 9 19 10 13 C16 14 20 18 20 26 Z" fill={active ? '#16A34A' : '#4ADE80'} fillOpacity="0.85" />
      <path d="M20 22 C28 21 31 15 30 9 C24 10 20 14 20 22 Z" fill={active ? '#15803D' : '#22C55E'} fillOpacity="0.85" />
    </svg>
  );
}

const FALLBACK_HERITAGE_PHOTOS: readonly string[] = [
  '/templates/occasions/birthday-ashirwad/cover.jpg',
  '/templates/travel/jaipur-slices.jpg',
];

interface AmbientPetal {
  id: number;
  leftPct: number;
  size: number;
  delaySec: number;
  durationSec: number;
  swayPx: number;
  rotateStart: number;
  tone: string;
}

const AMBIENT_PETALS: readonly AmbientPetal[] = [
  { id: 1, leftPct: 8, size: 14, delaySec: 0, durationSec: 11, swayPx: 18, rotateStart: 12, tone: '#F59E0B' },
  { id: 2, leftPct: 21, size: 11, delaySec: 2.4, durationSec: 13, swayPx: -16, rotateStart: 45, tone: '#EA580C' },
  { id: 3, leftPct: 37, size: 13, delaySec: 5.1, durationSec: 12, swayPx: 22, rotateStart: -20, tone: '#FBBF24' },
  { id: 4, leftPct: 54, size: 10, delaySec: 1.2, durationSec: 14, swayPx: -14, rotateStart: 30, tone: '#D97706' },
  { id: 5, leftPct: 71, size: 14, delaySec: 3.8, durationSec: 11.5, swayPx: 16, rotateStart: -35, tone: '#F59E0B' },
  { id: 6, leftPct: 86, size: 12, delaySec: 6.3, durationSec: 12.8, swayPx: -20, rotateStart: 18, tone: '#EA580C' },
  { id: 7, leftPct: 93, size: 10, delaySec: 4.4, durationSec: 13.5, swayPx: -12, rotateStart: 60, tone: '#FBBF24' },
];

interface BurstParticle {
  id: string;
  leftPct: number;
  delayMs: number;
  durationMs: number;
  size: number;
  kind: 'petal' | 'sparkle';
  tone: string;
  driftX: number;
}

function createBlessingBurst(waveId: number): BurstParticle[] {
  const tones = ['#F59E0B', '#EA580C', '#FBBF24', '#D97706', '#FDE68A'];
  return Array.from({ length: 18 }, (_, index) => {
    const isSparkle = index % 3 === 0;
    const leftPct = 6 + ((index * 17 + waveId * 13) % 88);
    const driftX = (index % 2 === 0 ? 1 : -1) * (14 + ((index * 7) % 24));
    return {
      id: `wave-${waveId}-${index}`,
      leftPct,
      delayMs: (index % 6) * 110,
      durationMs: 2600 + (index % 5) * 340,
      size: isSparkle ? 12 + (index % 3) * 3 : 11 + (index % 4) * 3,
      kind: isSparkle ? 'sparkle' : 'petal',
      tone: tones[(index + waveId) % tones.length],
      driftX,
    };
  });
}

function resolveRelationLabel(
  relation: string | undefined,
  coreLang: CoreLanguageCode,
): string | null {
  if (!relation?.trim()) return null;
  const normalized = relation.trim().toLowerCase();
  const mapped = RELATION_LABELS[normalized];
  if (mapped) return mapped[coreLang];
  return relation.trim();
}

function ScallopedJharokhaArch({ lit }: { lit: boolean }) {
  return (
    <svg
      viewBox="0 0 420 132"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-0 h-[112px] w-full sm:h-[132px]"
      fill="none"
      aria-hidden="true"
    >
      {/* Outer sandstone arch fill framing the upper corners */}
      <path
        d="M0 0 H420 V132
           C406 112 398 92 384 82
           C374 75 362 72 356 62
           C350 52 336 46 322 46
           C312 34 294 28 278 31
           C264 20 242 15 224 22
           C218 14 213 10 210 6
           C207 10 202 14 196 22
           C178 15 156 20 142 31
           C126 28 108 34 98 46
           C84 46 70 52 64 62
           C58 72 46 75 36 82
           C22 92 14 112 0 132 Z"
        fill={lit ? '#F5E3C3' : '#F3E5CC'}
        fillOpacity="0.72"
      />
      {/* Primary sculpted cusped jharokha line */}
      <path
        d="M4 128
           C16 108 24 91 38 82
           C48 75 59 72 65 62
           C71 52 84 46 98 46
           C108 34 126 28 142 31
           C156 20 178 15 196 22
           C202 14 207 10 210 6
           C213 10 218 14 224 22
           C242 15 264 20 278 31
           C294 28 312 34 322 46
           C336 46 349 52 355 62
           C361 72 372 75 382 82
           C396 91 404 108 416 128"
        stroke="#B45309"
        strokeOpacity={lit ? '0.62' : '0.45'}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Delicate inner hairline molding */}
      <path
        d="M14 130
           C25 112 33 96 45 88
           C54 81 65 78 71 69
           C77 59 89 54 102 54
           C112 42 128 37 143 40
           C157 29 178 24 195 31
           C201 23 206 19 210 15
           C214 19 219 23 225 31
           C242 24 263 29 277 40
           C292 37 308 42 318 54
           C331 54 343 59 349 69
           C355 78 366 81 375 88
           C387 96 395 112 406 130"
        stroke="#D97706"
        strokeOpacity="0.34"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      {/* Keystone lotus finial at arch crown */}
      <circle cx="210" cy="6" r="3" fill="#D97706" fillOpacity="0.7" />
      <circle cx="210" cy="15" r="1.8" fill="#B45309" fillOpacity="0.55" />
    </svg>
  );
}

function SwayingMarigoldToran() {
  const garlandNodes = [34, 82, 130, 178, 210, 242, 290, 338, 386];
  return (
    <div className="pointer-events-none relative z-20 -mx-1 overflow-hidden pt-0.5" aria-hidden="true">
      <svg
        viewBox="0 0 420 64"
        className="ashirwad-toran-sway h-14 w-full origin-top sm:h-16"
        fill="none"
      >
        {/* Braided silk festoon cords */}
        <path
          d="M4 8 Q72 30 140 12 Q210 34 280 12 Q348 30 416 8"
          stroke="#92400E"
          strokeOpacity="0.55"
          strokeWidth="1.6"
        />
        <path
          d="M4 11 Q72 33 140 15 Q210 37 280 15 Q348 33 416 11"
          stroke="#D97706"
          strokeOpacity="0.45"
          strokeWidth="1"
        />

        {/* Hanging mango leaves (aam patta) & ruffled marigold blossoms */}
        {garlandNodes.map((cx, idx) => {
          const isCenter = cx === 210;
          const isValley = idx === 1 || idx === 4 || idx === 7;
          const cy = isCenter ? 25 : isValley ? 22 : 16;
          const r = isCenter ? 8.5 : isValley ? 6.8 : 5.8;

          return (
            <g key={cx}>
              {/* Left & right mango leaves */}
              <path
                d={`M${cx - 5} ${cy + 1} C${cx - 14} ${cy + 10}, ${cx - 12} ${cy + 23}, ${cx - 6} ${cy + 27} C${cx - 2} ${cy + 20}, ${cx - 2} ${cy + 10}, ${cx - 5} ${cy + 1} Z`}
                fill="#526B36"
                fillOpacity="0.82"
              />
              <path
                d={`M${cx - 6} ${cy + 5} L${cx - 8} ${cy + 22}`}
                stroke="#A3B87A"
                strokeWidth="0.7"
                strokeOpacity="0.75"
              />
              <path
                d={`M${cx + 5} ${cy + 1} C${cx + 14} ${cy + 10}, ${cx + 12} ${cy + 23}, ${cx + 6} ${cy + 27} C${cx + 2} ${cy + 20}, ${cx + 2} ${cy + 10}, ${cx + 5} ${cy + 1} Z`}
                fill="#658042"
                fillOpacity="0.82"
              />
              <path
                d={`M${cx + 6} ${cy + 5} L${cx + 8} ${cy + 22}`}
                stroke="#A3B87A"
                strokeWidth="0.7"
                strokeOpacity="0.75"
              />

              {/* Center hanging jasmine & marigold drop */}
              {isCenter || isValley ? (
                <g>
                  <line
                    x1={cx}
                    y1={cy + r}
                    x2={cx}
                    y2={cy + r + (isCenter ? 19 : 13)}
                    stroke="#B45309"
                    strokeOpacity="0.55"
                    strokeWidth="1.1"
                  />
                  <circle cx={cx} cy={cy + r + 5} r="2.2" fill="#FFFBEB" stroke="#D97706" strokeWidth="0.7" />
                  <circle
                    cx={cx}
                    cy={cy + r + (isCenter ? 15 : 11)}
                    r={isCenter ? 4.8 : 3.4}
                    fill={isCenter ? '#EA580C' : '#F59E0B'}
                  />
                  <circle
                    cx={cx}
                    cy={cy + r + (isCenter ? 15 : 11)}
                    r={isCenter ? 2.1 : 1.5}
                    fill="#FEF3C7"
                  />
                </g>
              ) : null}

              {/* Layered marigold blossom */}
              <circle cx={cx} cy={cy} r={r + 1.1} fill="#C2410C" fillOpacity="0.32" />
              <circle cx={cx} cy={cy} r={r} fill={idx % 2 === 0 ? '#EA580C' : '#F59E0B'} />
              <circle
                cx={cx}
                cy={cy}
                r={r * 0.72}
                fill={idx % 2 === 0 ? '#F59E0B' : '#FBBF24'}
                stroke="#FFFBEB"
                strokeOpacity="0.45"
                strokeWidth="0.7"
                strokeDasharray="1.6 1.4"
              />
              <circle cx={cx} cy={cy} r={r * 0.34} fill="#FEF3C7" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function BotanicalCornerFiligree({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`pointer-events-none absolute h-10 w-10 text-[#B45309]/45 ${className}`}
      fill="none"
      aria-hidden="true"
    >
      {/* Curved botanical corner stem */}
      <path
        d="M4 38 V12 C4 7.5 7.5 4 12 4 H38"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Lotus bud at corner */}
      <path
        d="M11 11 C15 9 19 10 21 14 C17 16 13 15 11 11 Z"
        fill="#D97706"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M11 11 C9 15 10 19 14 21 C16 17 15 13 11 11 Z"
        fill="#D97706"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1"
      />
      {/* Jasmine blossom accent */}
      <circle cx="24" cy="8.5" r="1.8" fill="#FFFBEB" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="8.5" cy="24" r="1.8" fill="#FFFBEB" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="15" cy="15" r="1.5" fill="currentColor" />
    </svg>
  );
}

function LotusDivider() {
  return (
    <div className="my-4 flex items-center justify-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D97706]/35 to-[#B45309]/45" />
      <svg viewBox="0 0 36 20" className="h-4 w-8 shrink-0 text-[#B45309]" fill="none">
        <path
          d="M18 3 C15.2 7.5, 15.2 12, 18 15.5 C20.8 12, 20.8 7.5, 18 3 Z"
          fill="#D97706"
          fillOpacity="0.26"
          stroke="currentColor"
          strokeWidth="1.15"
        />
        <path
          d="M18 15.5 C12.5 14, 9 10.5, 8 7 C12.2 7.8, 15.5 10.8, 18 15.5 Z"
          fill="#F59E0B"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.05"
        />
        <path
          d="M18 15.5 C23.5 14, 27 10.5, 28 7 C23.8 7.8, 20.5 10.8, 18 15.5 Z"
          fill="#F59E0B"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.05"
        />
        <circle cx="4" cy="11.5" r="1.2" fill="currentColor" fillOpacity="0.55" />
        <circle cx="32" cy="11.5" r="1.2" fill="currentColor" fillOpacity="0.55" />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#D97706]/35 to-[#B45309]/45" />
    </div>
  );
}

function BrassDiyaMedallion({ lit }: { lit: boolean }) {
  const uid = useId();
  const bowlGradId = `${uid}-brass-bowl`;
  const rimGradId = `${uid}-brass-rim`;
  const auraGradId = `${uid}-flame-aura`;
  const flameOuterId = `${uid}-flame-outer`;
  const flameInnerId = `${uid}-flame-inner`;

  const rangoliAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  return (
    <div className="relative mx-auto flex h-48 w-56 items-center justify-center sm:h-52 sm:w-64" aria-hidden="true">
      {/* Radiant amber halo when lit */}
      <div
        className={`pointer-events-none absolute rounded-full transition-all duration-700 motion-reduce:transition-none ${
          lit
            ? 'ashirwad-halo-breathe h-52 w-52 bg-[radial-gradient(circle,rgba(251,191,36,0.52)_0%,rgba(245,158,11,0.22)_46%,rgba(245,158,11,0)_74%)] opacity-100'
            : 'h-28 w-28 bg-[radial-gradient(circle,rgba(217,119,6,0.14)_0%,rgba(217,119,6,0)_70%)] opacity-60'
        }`}
      />

      <svg viewBox="0 0 220 185" className="relative z-10 h-full w-full" fill="none">
        <defs>
          <radialGradient id={auraGradId} cx="50%" cy="32%" r="45%">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity={lit ? '0.95' : '0.1'} />
            <stop offset="48%" stopColor="#F59E0B" stopOpacity={lit ? '0.4' : '0'} />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={bowlGradId} x1="56" y1="108" x2="164" y2="146" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="38%" stopColor="#D97706" />
            <stop offset="76%" stopColor="#9A3412" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id={rimGradId} x1="60" y1="104" x2="160" y2="116" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id={flameOuterId} x1="110" y1="30" x2="110" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id={flameInnerId} x1="110" y1="52" x2="110" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#FDE047" />
          </linearGradient>
        </defs>

        {/* Rangoli lotus medallion base (perspective ellipse) */}
        <g transform="translate(110 144)">
          <ellipse
            cx="0"
            cy="0"
            rx="86"
            ry="27"
            fill={lit ? '#FEF3C7' : '#F8EFE0'}
            fillOpacity={lit ? '0.82' : '0.72'}
            stroke="#D97706"
            strokeOpacity={lit ? '0.58' : '0.35'}
            strokeWidth="1.3"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="75"
            ry="22.5"
            stroke="#B45309"
            strokeOpacity="0.34"
            strokeWidth="1"
            strokeDasharray="2.5 3.5"
          />
          {/* 12 lotus rangoli petals around the platter */}
          <g transform="scale(1, 0.31)">
            {rangoliAngles.map((deg, idx) => (
              <g key={deg} transform={`rotate(${deg})`}>
                <path
                  d="M0 -42 C8 -56, 8 -70, 0 -78 C-8 -70, -8 -56, 0 -42 Z"
                  fill={idx % 2 === 0 ? '#EA580C' : '#F59E0B'}
                  fillOpacity={lit ? '0.26' : '0.16'}
                  stroke="#B45309"
                  strokeOpacity="0.4"
                  strokeWidth="1.4"
                />
                <circle
                  cx="0"
                  cy="-84"
                  r="2.8"
                  fill={idx % 2 === 0 ? '#D97706' : '#658042'}
                  fillOpacity="0.58"
                />
              </g>
            ))}
          </g>
          {/* Soft shadow under diya pedestal */}
          <ellipse cx="0" cy="-2" rx="34" ry="8" fill="#78350F" fillOpacity="0.2" />
        </g>

        {/* Warm aura around flame */}
        <circle cx="110" cy="64" r="56" fill={`url(#${auraGradId})`} />

        {/* Radiant golden sun-rays when lit */}
        <g
          stroke="#D97706"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="transition-all duration-700 motion-reduce:transition-none"
          style={{
            opacity: lit ? 0.85 : 0,
            transform: lit ? 'scale(1)' : 'scale(0.65)',
            transformOrigin: '110px 66px',
          }}
        >
          <line x1="110" y1="12" x2="110" y2="23" />
          <line x1="82" y1="20" x2="88" y2="30" />
          <line x1="138" y1="20" x2="132" y2="30" />
          <line x1="60" y1="40" x2="70" y2="46" />
          <line x1="160" y1="40" x2="150" y2="46" />
          <line x1="52" y1="66" x2="64" y2="66" />
          <line x1="168" y1="66" x2="156" y2="66" />
          <circle cx="71" cy="29" r="1.8" fill="#F59E0B" stroke="none" />
          <circle cx="149" cy="29" r="1.8" fill="#F59E0B" stroke="none" />
        </g>

        {/* Cotton wick resting in ghee */}
        <path
          d="M110 96 C109 91, 110 86, 110 82"
          stroke="#78350F"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Animated flickering flame when lit */}
        {lit ? (
          <g className="ashirwad-flame-flicker" style={{ transformOrigin: '110px 92px' }}>
            <path
              d="M110 31 C96 51, 91 68, 98 83 C102.5 91.5, 117.5 91.5, 122 83 C129 68, 124 51, 110 31 Z"
              fill={`url(#${flameOuterId})`}
              stroke="#B45309"
              strokeOpacity="0.45"
              strokeWidth="1.1"
            />
            <path
              d="M110 51 C102.5 63, 101 74, 105.2 82.5 C107.2 86.2, 112.8 86.2, 114.8 82.5 C119 74, 117.5 63, 110 51 Z"
              fill={`url(#${flameInnerId})`}
            />
          </g>
        ) : (
          /* Subtle unlit wick tip highlight */
          <circle cx="110" cy="82" r="2.2" fill="#92400E" fillOpacity="0.6" />
        )}

        {/* Hammered brass diya body */}
        <path
          d="M58 108 C65 130, 84 140, 110 140 C136 140, 155 130, 162 108 C140 114, 80 114, 58 108 Z"
          fill={`url(#${bowlGradId})`}
          stroke="#78350F"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        {/* Decorative lotus engraving band on brass bowl */}
        <path
          d="M72 121 Q82 127 91 122 Q100 129 110 123 Q120 129 129 122 Q138 127 148 121"
          stroke="#FDE68A"
          strokeOpacity="0.55"
          strokeWidth="1.1"
          fill="none"
        />
        {/* Hammered dimples */}
        <g fill="#FEF3C7" fillOpacity="0.45">
          <circle cx="81" cy="117" r="1.3" />
          <circle cx="95" cy="119" r="1.4" />
          <circle cx="110" cy="120" r="1.5" />
          <circle cx="125" cy="119" r="1.4" />
          <circle cx="139" cy="117" r="1.3" />
        </g>

        {/* Brass diya rim & glowing ghee pool */}
        <ellipse
          cx="110"
          cy="108"
          rx="52"
          ry="8.5"
          fill={`url(#${rimGradId})`}
          stroke="#78350F"
          strokeWidth="1.5"
        />
        <ellipse
          cx="110"
          cy="108"
          rx="42"
          ry="5.2"
          fill={lit ? '#FEF3C7' : '#FDE68A'}
          fillOpacity={lit ? '0.85' : '0.52'}
        />

        {/* Carved pedestal stem & foot */}
        <path
          d="M97 139 L91 147 H129 L123 139 Z"
          fill="#B45309"
          stroke="#78350F"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <ellipse
          cx="110"
          cy="148"
          rx="23"
          ry="4"
          fill="#D97706"
          stroke="#78350F"
          strokeWidth="1.4"
        />
      </svg>
    </div>
  );
}

function FlameButtonIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
      <path
        d="M10 2.5 C7.2 6.5, 6 9.8, 7.5 13 C8.4 15, 11.6 15, 12.5 13 C14 9.8, 12.8 6.5, 10 2.5 Z"
        fill="currentColor"
      />
      <path d="M5.5 16.5 H14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MarigoldPetalIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
      <path
        d="M10 2.5 C12.5 5.5, 12.5 9.5, 10 12.5 C7.5 9.5, 7.5 5.5, 10 2.5 Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <path
        d="M10 12.5 C6 11.5, 3.5 9, 3 6.2 C6.2 6.8, 8.6 9.2, 10 12.5 Z"
        fill="currentColor"
        fillOpacity="0.65"
      />
      <path
        d="M10 12.5 C14 11.5, 16.5 9, 17 6.2 C13.8 6.8, 11.4 9.2, 10 12.5 Z"
        fill="currentColor"
        fillOpacity="0.65"
      />
      <circle cx="10" cy="15.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M5 5 L15 15 M15 5 L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M12.5 4.5 L7 10 L12.5 15.5' : 'M7.5 4.5 L13 10 L7.5 15.5'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FallbackCourtyardArt({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 180 220" className="h-full w-full" fill="none" aria-hidden="true">
      <rect width="180" height="220" fill={index % 2 === 0 ? '#F9EFE0' : '#FBF3E4'} />
      <circle cx="90" cy="76" r="38" fill="#FDE68A" fillOpacity="0.55" />
      <path
        d="M28 220 V96 C28 56 56 34 90 22 C124 34 152 56 152 96 V220"
        stroke="#B45309"
        strokeOpacity="0.45"
        strokeWidth="1.6"
      />
      <path
        d="M90 108 C80 124 80 142 90 156 C100 142 100 124 90 108 Z"
        fill="#EA580C"
        fillOpacity="0.28"
        stroke="#B45309"
        strokeWidth="1.3"
      />
      <path
        d="M90 156 C72 150 60 138 56 124 C70 126 82 138 90 156 Z"
        fill="#F59E0B"
        fillOpacity="0.26"
        stroke="#B45309"
        strokeWidth="1.2"
      />
      <path
        d="M90 156 C108 150 120 138 124 124 C110 126 98 138 90 156 Z"
        fill="#F59E0B"
        fillOpacity="0.26"
        stroke="#B45309"
        strokeWidth="1.2"
      />
      <path d="M52 174 H128" stroke="#B45309" strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Sunlit Courtyard & Marigold Botanical Heirloom Experience ("Birthday Ashirwad").
 * Features a scalloped jharokha arch, swaying marigold-and-mango-leaf toran,
 * interactive brass diya lighting ritual, arched family keepsake gallery,
 * and a serene silk blessing scroll with floating marigold petals.
 */
export function BirthdayAshirwadSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const [diyaLit, setDiyaLit] = useState(false);
  const [blessingWaves, setBlessingWaves] = useState(0);
  const [burstParticles, setBurstParticles] = useState<BurstParticle[]>([]);
  const [failedPhotos, setFailedPhotos] = useState<Record<string, boolean>>({});
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [placedOfferings, setPlacedOfferings] = useState<string[]>([]);
  const [activeOfferingId, setActiveOfferingId] = useState<ThaliOfferingItem['id'] | null>(null);
  const [openPillarId, setOpenPillarId] = useState<FamilyBlessingPillar['id']>('health');
  const [keepsakeSealed, setKeepsakeSealed] = useState(false);
  const [copiedReply, setCopiedReply] = useState(false);

  const openedNotifiedRef = useRef(false);
  const waveCounterRef = useRef(0);
  const burstTimeoutRef = useRef<number | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  const coreLang = toCoreLanguageCode(language);
  const copy = ASHIRWAD_COPY[coreLang] ?? ASHIRWAD_COPY.en;
  const extraCopy = EXTRA_ASHIRWAD_COPY[coreLang] ?? EXTRA_ASHIRWAD_COPY.en;
  const isHindi = coreLang === 'hi';
  const hindiSafeStyle: React.CSSProperties | undefined = isHindi
    ? { fontStyle: 'normal', letterSpacing: '0em' }
    : undefined;

  const accentColor = manifest.palette.primary || '#B45309';
  const themeTitle = pickLocalizedText(manifest.name, language);
  const relationLabel = resolveRelationLabel(data.relation, coreLang);
  const headlineText = pickLocalizedText(data.headline, language);
  const messageText = pickLocalizedText(data.message, language);
  const highlights = data.highlights ?? [];

  const galleryItems = useMemo(() => {
    const userPhotos = (data.photos ?? []).filter(
      (src): src is string => typeof src === 'string' && src.trim().length > 0,
    );
    if (userPhotos.length > 0) {
      return userPhotos.map((src, index) => ({
        src,
        caption: `${copy.photoCaptionPrefix} 0${index + 1}`,
      }));
    }
    return FALLBACK_HERITAGE_PHOTOS.map((src, index) => ({
      src,
      caption: copy.defaultPhotoCaptions[index] ?? `${copy.photoCaptionPrefix} 0${index + 1}`,
    }));
  }, [copy.defaultPhotoCaptions, copy.photoCaptionPrefix, data.photos]);

  const triggerPetalShower = useCallback(() => {
    waveCounterRef.current += 1;
    const nextWave = createBlessingBurst(waveCounterRef.current);
    setBurstParticles(nextWave);

    if (burstTimeoutRef.current !== null) {
      window.clearTimeout(burstTimeoutRef.current);
    }
    burstTimeoutRef.current = window.setTimeout(() => {
      setBurstParticles([]);
    }, 4600);
  }, []);

  useEffect(() => {
    return () => {
      if (burstTimeoutRef.current !== null) {
        window.clearTimeout(burstTimeoutRef.current);
      }
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (activePhotoIndex === null) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActivePhotoIndex(null);
      } else if (event.key === 'ArrowRight') {
        setActivePhotoIndex((prev) =>
          prev === null ? null : (prev + 1) % galleryItems.length,
        );
      } else if (event.key === 'ArrowLeft') {
        setActivePhotoIndex((prev) =>
          prev === null ? null : (prev - 1 + galleryItems.length) % galleryItems.length,
        );
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, galleryItems.length]);

  function handleLightDiya() {
    setDiyaLit(true);
    playLanternPullChime();
    triggerPetalShower();
    if (!openedNotifiedRef.current) {
      openedNotifiedRef.current = true;
      onOpened?.();
    }
  }

  function handleShowerBlessings() {
    setBlessingWaves((prev) => prev + 1);
    playPaperUnsealSfx(blessingWaves);
    triggerPetalShower();
    if (!openedNotifiedRef.current) {
      openedNotifiedRef.current = true;
      onOpened?.();
    }
  }

  function handlePlaceOffering(id: ThaliOfferingItem['id'], idx: number) {
    playPaperUnsealSfx(idx);
    setActiveOfferingId(id);
    setPlacedOfferings((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      if (next.length === SHUBH_OFFERINGS.length && !prev.includes(id)) {
        playLanternPullChime();
        triggerPetalShower();
      }
      return next;
    });
    if (!openedNotifiedRef.current) {
      openedNotifiedRef.current = true;
      onOpened?.();
    }
  }

  function handleSealKeepsake() {
    setKeepsakeSealed(true);
    playLanternPullChime();
    triggerPetalShower();
    if (!openedNotifiedRef.current) {
      openedNotifiedRef.current = true;
      onOpened?.();
    }
  }

  async function handleCopyThankYou() {
    const replyText =
      coreLang === 'hi'
        ? `बहुत-बहुत धन्यवाद ${data.senderName}! आपका स्नेह भरा जन्मदिन आशीर्वाद पत्र हृदय को छू गया। सदा खुश रहें।`
        : coreLang === 'hinglish'
          ? `Dil se shukriya ${data.senderName}! Aapka pyaara birthday ashirwad card dekh kar bahut khushi hui. Hamesha khush raho!`
          : `Thank you so much, ${data.senderName}! Reading your warm birthday blessing card truly made my day. Wishing you joy always.`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(replyText);
      }
    } catch {
      // Safe fallback
    }
    setCopiedReply(true);
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = window.setTimeout(() => setCopiedReply(false), 3200);
  }

  const activeOfferingObj =
    SHUBH_OFFERINGS.find((o) => o.id === activeOfferingId) ??
    (placedOfferings.length > 0
      ? SHUBH_OFFERINGS.find((o) => o.id === placedOfferings[placedOfferings.length - 1]) ?? null
      : null);

  const activePhoto = activePhotoIndex !== null ? galleryItems[activePhotoIndex] ?? null : null;

  return (
    <div
      className="relative flex min-h-full w-full max-w-full flex-col justify-between overflow-x-clip rounded-[28px] text-[#3B1F16] transition-colors duration-700 motion-reduce:transition-none"
      style={{
        background: diyaLit
          ? 'linear-gradient(180deg, #FDF6E5 0%, #FBF0D9 42%, #FAF1E2 100%)'
          : 'linear-gradient(180deg, #FBF6EC 0%, #F8EFE0 48%, #FBF5EA 100%)',
      }}
    >
      <style>{`
        @keyframes ashirwad-toran-sway {
          0%, 100% { transform: rotate(-0.85deg); }
          50% { transform: rotate(0.85deg); }
        }
        @keyframes ashirwad-petal-drift {
          0% {
            transform: translate3d(0, -24px, 0) rotate(0deg);
            opacity: 0;
          }
          12% { opacity: 0.72; }
          85% { opacity: 0.62; }
          100% {
            transform: translate3d(var(--sway-x, 18px), 520px, 0) rotate(220deg);
            opacity: 0;
          }
        }
        @keyframes ashirwad-petal-burst {
          0% {
            transform: translate3d(0, -16px, 0) scale(0.75) rotate(0deg);
            opacity: 0;
          }
          14% { opacity: 0.95; }
          82% { opacity: 0.85; }
          100% {
            transform: translate3d(var(--burst-x, 20px), 460px, 0) scale(1.05) rotate(260deg);
            opacity: 0;
          }
        }
        @keyframes ashirwad-flame-flicker {
          0%, 100% { transform: scaleY(1) scaleX(1) skewX(0deg); }
          25% { transform: scaleY(1.06) scaleX(0.96) skewX(-1.4deg); }
          55% { transform: scaleY(0.96) scaleX(1.03) skewX(1.2deg); }
          80% { transform: scaleY(1.04) scaleX(0.98) skewX(-0.8deg); }
        }
        @keyframes ashirwad-halo-breathe {
          0%, 100% { transform: scale(1); opacity: 0.92; }
          50% { transform: scale(1.07); opacity: 1; }
        }
        .ashirwad-toran-sway {
          animation: ashirwad-toran-sway 6.2s ease-in-out infinite;
        }
        .ashirwad-petal-drift {
          animation: ashirwad-petal-drift var(--dur, 12s) linear var(--delay, 0s) infinite;
        }
        .ashirwad-petal-burst {
          animation: ashirwad-petal-burst var(--burst-dur, 3s) cubic-bezier(0.22, 0.61, 0.36, 1) var(--burst-delay, 0ms) forwards;
        }
        .ashirwad-flame-flicker {
          animation: ashirwad-flame-flicker 2.1s ease-in-out infinite;
        }
        .ashirwad-halo-breathe {
          animation: ashirwad-halo-breathe 3.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ashirwad-toran-sway,
          .ashirwad-petal-drift,
          .ashirwad-petal-burst,
          .ashirwad-flame-flicker,
          .ashirwad-halo-breathe {
            animation: none !important;
          }
        }
      `}</style>

      {/* Sunlit courtyard diagonal rays & warm ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background: diyaLit
            ? 'radial-gradient(ellipse 85% 48% at 50% 24%, rgba(251, 191, 36, 0.28) 0%, rgba(245, 158, 11, 0.08) 54%, transparent 78%), linear-gradient(125deg, rgba(255,251,235,0.55) 0%, transparent 45%, rgba(217,119,6,0.06) 100%)'
            : 'radial-gradient(ellipse 80% 42% at 50% 18%, rgba(253, 230, 138, 0.28) 0%, transparent 72%), linear-gradient(125deg, rgba(255,251,235,0.5) 0%, transparent 48%, rgba(180,83,9,0.04) 100%)',
        }}
      />

      {/* Scalloped Jharokha Arch framing the sunlit courtyard */}
      <ScallopedJharokhaArch lit={diyaLit} />

      {/* Gently drifting ambient golden marigold petals */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      >
        {AMBIENT_PETALS.map((petal) => (
          <svg
            key={petal.id}
            viewBox="0 0 18 14"
            className="ashirwad-petal-drift absolute top-0"
            style={
              {
                left: `${petal.leftPct}%`,
                width: `${petal.size}px`,
                height: `${Math.round(petal.size * 0.78)}px`,
                '--dur': `${petal.durationSec}s`,
                '--delay': `${petal.delaySec}s`,
                '--sway-x': `${petal.swayPx}px`,
              } as React.CSSProperties
            }
            fill="none"
          >
            <path
              d="M2 7 C4 2, 12 1, 16 6 C14 11, 6 13, 2 7 Z"
              fill={petal.tone}
              fillOpacity="0.62"
              transform={`rotate(${petal.rotateStart} 9 7)`}
            />
          </svg>
        ))}

        {/* Interactive petal & lotus-sparkle shower wave */}
        {burstParticles.map((particle) => (
          <svg
            key={particle.id}
            viewBox="0 0 20 20"
            className="ashirwad-petal-burst absolute top-2"
            style={
              {
                left: `${particle.leftPct}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                '--burst-dur': `${particle.durationMs}ms`,
                '--burst-delay': `${particle.delayMs}ms`,
                '--burst-x': `${particle.driftX}px`,
              } as React.CSSProperties
            }
            fill="none"
          >
            {particle.kind === 'sparkle' ? (
              <path
                d="M10 1 L12 8 L19 10 L12 12 L10 19 L8 12 L1 10 L8 8 Z"
                fill={particle.tone}
                fillOpacity="0.92"
              />
            ) : (
              <path
                d="M3 10 C5 4, 13 3, 17 9 C15 15, 7 17, 3 10 Z"
                fill={particle.tone}
                fillOpacity="0.88"
              />
            )}
          </svg>
        ))}
      </div>

      {watermarked ? (
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-30 flex justify-center border-b border-[#E7D3AD] bg-[#FEF3C7]/90 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#92400E]"
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      {/* Swaying Marigold & Mango-Leaf Toran Garland */}
      <SwayingMarigoldToran />

      {/* Main Courtyard Sanctuary Content */}
      <main className="relative z-20 mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 pb-7 pt-2 sm:px-6 sm:pt-3">
        {/* 1. Sunlit Courtyard Header */}
        <header className="text-center">
          <span
            style={hindiSafeStyle}
            className={`inline-flex items-center gap-1.5 rounded-full border border-[#D97706]/30 bg-[#FFFDF8]/85 px-3.5 py-1 text-[11px] font-semibold text-[#9A3412] shadow-2xs backdrop-blur-xs ${
              isHindi ? '' : 'uppercase tracking-[0.14em]'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" aria-hidden="true" />
            <span>{copy.courtyardEyebrow}</span>
          </span>

          <p
            style={hindiSafeStyle}
            className="mt-3 font-serif text-xs font-medium text-[#7C4A2D]"
          >
            {copy.recipientPrefix}
          </p>

          <h1
            style={hindiSafeStyle}
            className="mt-1 break-words font-heading text-[28px] font-bold leading-tight text-[#3B1F16] sm:text-[34px]"
          >
            {data.receiverName}
          </h1>

          {relationLabel ? (
            <span
              style={hindiSafeStyle}
              className="mt-2 inline-flex min-h-[26px] items-center rounded-full border border-[#D97706]/25 bg-[#FEF3C7]/75 px-3.5 py-0.5 font-serif text-xs font-semibold text-[#92400E]"
            >
              {relationLabel}
            </span>
          ) : null}
        </header>

        {/* 2. Interactive Brass Diya Lighting Ritual */}
        <section
          aria-label={copy.diyaSectionLabel}
          className={`relative overflow-hidden rounded-[24px] border p-5 text-center transition-all duration-700 motion-reduce:transition-none sm:p-6 ${
            diyaLit
              ? 'border-[#D97706]/45 bg-[#FFFDF7]/92 shadow-[0_14px_38px_-12px_rgba(217,119,6,0.28)]'
              : 'border-[#E6D3B3] bg-[#FFFDF8]/85 shadow-[0_10px_28px_-14px_rgba(120,53,15,0.16)]'
          }`}
        >
          <BotanicalCornerFiligree className="left-2 top-2" />
          <BotanicalCornerFiligree className="right-2 top-2 -scale-x-100" />
          <BotanicalCornerFiligree className="bottom-2 right-2 -scale-x-100 -scale-y-100" />
          <BotanicalCornerFiligree className="bottom-2 left-2 -scale-y-100" />

          <button
            type="button"
            onClick={handleLightDiya}
            aria-pressed={diyaLit}
            aria-label={diyaLit ? `${copy.diyaLitStatus} — ${themeTitle}` : copy.lightDiyaCta}
            className="group relative mx-auto flex w-full flex-col items-center rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFDF8]"
          >
            <BrassDiyaMedallion lit={diyaLit} />

            <span
              style={{
                ...(hindiSafeStyle ?? {}),
                background: diyaLit
                  ? 'linear-gradient(180deg, #FEF3C7 0%, #FDE68A 100%)'
                  : `linear-gradient(180deg, #D97706 0%, ${accentColor} 100%)`,
              }}
              className={`mt-2 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 py-2.5 font-serif text-sm font-bold shadow-sm transition duration-200 group-hover:brightness-105 group-active:scale-[0.98] motion-reduce:transition-none ${
                diyaLit
                  ? 'border border-[#D97706]/45 text-[#92400E]'
                  : 'border border-[#92400E]/80 text-[#FFFDF8] shadow-[0_6px_18px_-4px_rgba(180,83,9,0.42)]'
              }`}
            >
              <FlameButtonIcon />
              <span>{diyaLit ? copy.diyaLitStatus : copy.lightDiyaCta}</span>
            </span>
          </button>

          <p
            style={hindiSafeStyle}
            className="mx-auto mt-3 max-w-xs font-serif text-[13px] leading-relaxed text-[#6E442C]"
          >
            {diyaLit ? copy.diyaLitWhisper : copy.diyaUnlitWhisper}
          </p>
        </section>

        {/* 2.5. Sacred Courtyard Thali Offerings ("Shubh Arpan") */}
        <section
          aria-label={extraCopy.thaliEyebrow}
          className="relative overflow-hidden rounded-[24px] border border-[#E6D3B3] bg-[#FFFDF8]/90 p-5 shadow-[0_10px_28px_-14px_rgba(120,53,15,0.16)] sm:p-6"
        >
          <div className="text-center">
            <span
              style={hindiSafeStyle}
              className={`inline-block rounded-full border border-[#D97706]/30 bg-[#FEF3C7]/70 px-3.5 py-1 text-[10.5px] font-semibold text-[#9A3412] ${
                isHindi ? '' : 'uppercase tracking-[0.14em]'
              }`}
            >
              {extraCopy.thaliEyebrow}
            </span>
            <h2
              style={hindiSafeStyle}
              className="mt-2 font-heading text-lg font-bold text-[#3B1F16] sm:text-xl"
            >
              {extraCopy.thaliTitle}
            </h2>
            <p
              style={hindiSafeStyle}
              className="mt-1 font-serif text-xs text-[#7C4A2D]"
            >
              {placedOfferings.length === SHUBH_OFFERINGS.length
                ? extraCopy.thaliComplete
                : extraCopy.thaliHint}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {SHUBH_OFFERINGS.map((item, idx) => {
              const isPlaced = placedOfferings.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePlaceOffering(item.id, idx)}
                  aria-pressed={isPlaced}
                  className={`group relative flex min-h-[98px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-3 text-center transition duration-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] motion-reduce:transition-none ${
                    isPlaced
                      ? 'border-[#D97706]/65 bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7]/85 shadow-[0_10px_24px_-12px_rgba(217,119,6,0.4)]'
                      : 'border-[#E7D3AD] bg-[#FFFDF9] hover:border-[#D97706]/45 hover:bg-[#FFFBEB]/60'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold transition ${
                      isPlaced
                        ? 'border-[#B45309] bg-[#B45309] text-white'
                        : 'border-[#D97706]/30 bg-white/80 text-transparent'
                    }`}
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
                  <ThaliOfferingSvg id={item.id} active={isPlaced} />
                  <span
                    style={hindiSafeStyle}
                    className="font-serif text-xs font-bold text-[#3B1F16]"
                  >
                    {item.label[coreLang]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3.5 flex items-center justify-between gap-2 rounded-xl border border-[#EBD8B7] bg-[#FAF2E2]/80 px-3.5 py-2">
            <span
              style={hindiSafeStyle}
              className="font-serif text-xs font-semibold text-[#78350F]"
            >
              {extraCopy.thaliProgress(placedOfferings.length, SHUBH_OFFERINGS.length)}
            </span>
            <div className="flex items-center gap-1" aria-hidden="true">
              {SHUBH_OFFERINGS.map((item) => (
                <span
                  key={`dot-${item.id}`}
                  className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                    placedOfferings.includes(item.id) ? 'bg-[#D97706]' : 'bg-[#D97706]/25'
                  }`}
                />
              ))}
            </div>
          </div>

          {activeOfferingObj ? (
            <div
              role="status"
              className="mt-3 rounded-xl border border-[#D97706]/30 bg-[#FFFBEB] px-4 py-3 text-center"
            >
              <p
                style={hindiSafeStyle}
                className="font-serif text-[13.5px] leading-relaxed text-[#4A2B1D]"
              >
                {activeOfferingObj.couplet[coreLang]}
              </p>
            </div>
          ) : null}
        </section>

        {/* Morning Courtyard Chime Cassette */}
        <OccasionCassettePlayer
          trackTitle={extraCopy.chimeTrackTitle}
          mood="warm"
          tapLabel={extraCopy.chimeTapLabel}
          playingLabel={extraCopy.chimePlayingLabel}
          accentColor="#B45309"
        />

        {/* 3. Serene Silk Blessing Scroll */}
        <section aria-label={copy.scrollEyebrow}>
          <div className="rounded-[24px] border border-[#E2CCA6] bg-[#FBF3E4]/85 p-1.5 shadow-[0_12px_30px_-14px_rgba(120,53,15,0.16)]">
            <div className="relative overflow-hidden rounded-[19px] border border-[#D97706]/28 bg-gradient-to-b from-[#FFFDF9] via-[#FFFBF2] to-[#FDF6E7] px-5 py-7 text-center sm:px-8 sm:py-8">
              <BotanicalCornerFiligree className="left-2 top-2" />
              <BotanicalCornerFiligree className="right-2 top-2 -scale-x-100" />
              <BotanicalCornerFiligree className="bottom-2 right-2 -scale-x-100 -scale-y-100" />
              <BotanicalCornerFiligree className="bottom-2 left-2 -scale-y-100" />

              <span
                style={hindiSafeStyle}
                className={`inline-block rounded-full border border-[#E7D3AD] bg-[#FFFBEB] px-3.5 py-1 text-[10.5px] font-semibold text-[#9A3412] ${
                  isHindi ? '' : 'uppercase tracking-[0.15em]'
                }`}
              >
                {copy.scrollEyebrow}
              </span>

              <h2
                style={hindiSafeStyle}
                className="mt-3.5 break-words font-heading text-[22px] font-bold leading-snug text-[#3B1F16] sm:text-[26px]"
              >
                {headlineText}
              </h2>

              <LotusDivider />

              <p
                style={hindiSafeStyle}
                className="mx-auto max-w-md break-words font-serif text-[16px] leading-[1.82] text-[#4A2B1D] sm:text-[17px]"
              >
                {messageText}
              </p>

              {highlights.length > 0 ? (
                <div className="mt-5 space-y-2 border-t border-[#EBD8B7] pt-4 text-left">
                  <p
                    style={hindiSafeStyle}
                    className={`text-center text-[10px] font-semibold text-[#9A3412]/80 ${
                      isHindi ? '' : 'uppercase tracking-[0.14em]'
                    }`}
                  >
                    {copy.highlightsEyebrow}
                  </p>
                  <div className="grid gap-2">
                    {highlights.slice(0, 3).map((item, idx) => (
                      <div
                        key={`${item.title.en}-${idx}`}
                        className="rounded-xl border border-[#EFE0C4] bg-[#FFFDF8]/90 px-3.5 py-2.5"
                      >
                        <h3
                          style={hindiSafeStyle}
                          className="break-words font-heading text-sm font-bold text-[#92400E]"
                        >
                          {pickLocalizedText(item.title, language)}
                        </h3>
                        <p
                          style={hindiSafeStyle}
                          className="mt-0.5 break-words font-serif text-[13.5px] leading-relaxed text-[#573524]"
                        >
                          {pickLocalizedText(item.detail, language)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <LotusDivider />

              <div className="mt-2">
                <p
                  style={hindiSafeStyle}
                  className="font-serif text-xs text-[#7C4A2D]"
                >
                  {copy.signOffLabel}
                </p>
                <p
                  style={hindiSafeStyle}
                  className="mt-1 break-words font-heading text-lg font-bold text-[#B45309]"
                >
                  {data.senderName}
                </p>
              </div>

              {/* Interactive Shower Blessings trigger */}
              <div className="mt-5 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleShowerBlessings}
                  style={hindiSafeStyle}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#D97706]/50 bg-[#FEF3C7]/85 px-5 py-2 font-serif text-xs font-bold text-[#92400E] shadow-2xs transition duration-200 hover:bg-[#FDE68A]/85 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  <MarigoldPetalIcon />
                  <span>{copy.showerBlessingsCta}</span>
                </button>

                {blessingWaves > 0 ? (
                  <p
                    role="status"
                    style={hindiSafeStyle}
                    className="font-serif text-[11.5px] font-medium text-[#9A3412]"
                  >
                    {copy.blessingsShoweredLabel(blessingWaves)}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Arched Family Keepsake Gallery (2-up arched polaroid cards) */}
        <section aria-label={copy.galleryTitle} className="space-y-3">
          <div className="text-center">
            <span
              style={hindiSafeStyle}
              className={`inline-block rounded-full border border-[#E7D3AD] bg-[#FFFDF8]/90 px-3.5 py-1 text-[10.5px] font-semibold text-[#9A3412] ${
                isHindi ? '' : 'uppercase tracking-[0.14em]'
              }`}
            >
              {copy.galleryEyebrow}
            </span>
            <h2
              style={hindiSafeStyle}
              className="mt-2 font-heading text-xl font-bold text-[#3B1F16]"
            >
              {copy.galleryTitle}
            </h2>
            <p
              style={hindiSafeStyle}
              className="mt-0.5 font-serif text-xs text-[#7C4A2D]"
            >
              {copy.galleryHint}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {galleryItems.map((item, idx) => {
              const isFailed = Boolean(failedPhotos[item.src]);
              return (
                <button
                  key={`${item.src.slice(0, 32)}-${idx}`}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  aria-label={`${item.caption} — ${copy.galleryHint}`}
                  className="group flex flex-col rounded-t-[999px] rounded-b-[18px] border border-[#D97706]/35 bg-[#FFFDF9] p-2 pb-3 text-center shadow-[0_10px_24px_-14px_rgba(120,53,15,0.24)] transition duration-300 hover:-translate-y-0.5 hover:border-[#D97706]/65 hover:shadow-[0_14px_28px_-12px_rgba(180,83,9,0.28)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[999px] rounded-b-[10px] border border-[#D97706]/25 bg-[#F8EFE0]">
                    {!isFailed ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.src}
                        alt={item.caption}
                        loading="lazy"
                        onError={() =>
                          setFailedPhotos((prev) => ({ ...prev, [item.src]: true }))
                        }
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none"
                      />
                    ) : (
                      <FallbackCourtyardArt index={idx} />
                    )}
                    {/* Subtle warm sunlit vignette */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-t-[999px] rounded-b-[10px] ring-1 ring-inset ring-[#FDE68A]/45"
                    />
                  </div>

                  <span
                    style={hindiSafeStyle}
                    className="mt-2.5 block truncate px-1 font-serif text-xs font-semibold text-[#6E442C]"
                  >
                    {item.caption}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. Family Blessing Pillars & Golden Ashirwad Keepsake Seal */}
        <section
          aria-label={extraCopy.pillarsEyebrow}
          className="space-y-4 rounded-[24px] border border-[#E2CCA6] bg-[#FFFDF8]/92 p-5 shadow-[0_12px_30px_-14px_rgba(120,53,15,0.16)] sm:p-6"
        >
          <div className="text-center">
            <span
              style={hindiSafeStyle}
              className={`inline-block rounded-full border border-[#D97706]/30 bg-[#FEF3C7]/70 px-3.5 py-1 text-[10.5px] font-semibold text-[#9A3412] ${
                isHindi ? '' : 'uppercase tracking-[0.14em]'
              }`}
            >
              {extraCopy.pillarsEyebrow}
            </span>
            <h2
              style={hindiSafeStyle}
              className="mt-2 font-heading text-lg font-bold text-[#3B1F16] sm:text-xl"
            >
              {extraCopy.pillarsTitle}
            </h2>
          </div>

          <div className="space-y-2">
            {FAMILY_BLESSING_PILLARS.map((pillar, idx) => {
              const isOpen = openPillarId === pillar.id;
              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => {
                    playPaperUnsealSfx(idx);
                    setOpenPillarId(pillar.id);
                  }}
                  aria-expanded={isOpen}
                  className={`flex min-h-[48px] w-full flex-col rounded-2xl border px-4 py-3 text-left transition duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] ${
                    isOpen
                      ? 'border-[#D97706]/55 bg-[#FFFBEB]'
                      : 'border-[#EBD8B7] bg-[#FFFDF9] hover:border-[#D97706]/35'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span
                      style={hindiSafeStyle}
                      className="font-heading text-sm font-bold text-[#92400E]"
                    >
                      {pillar.title[coreLang]}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${
                        isOpen
                          ? 'border-[#D97706]/50 bg-[#D97706] text-white'
                          : 'border-[#D97706]/25 bg-[#FEF3C7]/60 text-[#92400E]'
                      }`}
                    >
                      {isOpen ? '-' : '+'}
                    </span>
                  </div>
                  {isOpen ? (
                    <p
                      style={hindiSafeStyle}
                      className="mt-2 font-serif text-[13.5px] leading-relaxed text-[#573524]"
                    >
                      {pillar.blessing[coreLang]}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Brass Ashirwad Keepsake Seal & WhatsApp Thank-You Copy */}
          <div className="rounded-2xl border border-[#D97706]/35 bg-gradient-to-b from-[#FFFBEB] to-[#FBF0D9] p-4 text-center">
            {!keepsakeSealed ? (
              <button
                type="button"
                onClick={handleSealKeepsake}
                style={hindiSafeStyle}
                className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#B45309] via-[#D97706] to-[#B45309] px-5 py-2.5 font-serif text-xs font-bold text-[#FFFDF8] shadow-[0_10px_22px_-8px_rgba(180,83,9,0.55)] transition hover:brightness-105 active:scale-[0.98]"
              >
                <MarigoldPetalIcon />
                <span>{extraCopy.sealCta}</span>
              </button>
            ) : (
              <div role="status" className="space-y-3">
                <span
                  style={hindiSafeStyle}
                  className={`inline-flex items-center gap-1.5 rounded-full border border-[#B45309]/40 bg-[#FFFDF8] px-3.5 py-1 text-[10px] font-bold text-[#9A3412] ${
                    isHindi ? '' : 'uppercase tracking-[0.16em]'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#15803D]" aria-hidden="true" />
                  {extraCopy.sealedBadge}
                </span>
                <p
                  style={hindiSafeStyle}
                  className="font-heading text-base font-bold text-[#3B1F16]"
                >
                  {extraCopy.sealedMotto}
                </p>
                <button
                  type="button"
                  onClick={() => void handleCopyThankYou()}
                  style={hindiSafeStyle}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[#B45309]/45 bg-[#FFFDF8] px-4 py-2 font-serif text-xs font-bold text-[#92400E] shadow-2xs transition hover:bg-[#FEF3C7] active:scale-[0.98]"
                >
                  <span>{extraCopy.copyThanksCta}</span>
                </button>
                {copiedReply ? (
                  <p
                    role="status"
                    style={hindiSafeStyle}
                    className="font-serif text-xs font-semibold text-[#15803D]"
                  >
                    {extraCopy.copiedThanksToast}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer
          style={hindiSafeStyle}
          className="mt-1 border-t border-[#E6D3B3] pt-4 text-center text-xs font-medium text-[#7C4A2D]"
        >
          {getWebzyFooterLabel(language)}
        </footer>
      </main>

      {/* Tap-to-inspect Arched Keepsake Modal (Portaled for PhoneFrame / @container safety) */}
      {activePhoto && activePhotoIndex !== null && typeof document !== 'undefined'
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={activePhoto.caption}
              onClick={() => setActivePhotoIndex(null)}
              className="fixed inset-0 z-[120] flex items-center justify-center bg-[#2A160E]/75 p-4 backdrop-blur-xs"
            >
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-sm rounded-[26px] border border-[#D97706]/45 bg-[#FFFDF8] p-3.5 shadow-[0_24px_60px_rgba(24,10,5,0.45)]"
          >
            <button
              type="button"
              onClick={() => setActivePhotoIndex(null)}
              aria-label={copy.closeModalLabel}
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D97706]/35 bg-[#FFFDF8]/95 text-[#78350F] shadow-xs transition hover:bg-[#FEF3C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309]"
            >
              <CloseIcon />
            </button>

            <div className="overflow-hidden rounded-t-[180px] rounded-b-[14px] border border-[#D97706]/30 bg-[#F8EFE0]">
              <div className="aspect-[4/5] w-full">
                {!failedPhotos[activePhoto.src] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={activePhoto.src}
                    alt={activePhoto.caption}
                    onError={() =>
                      setFailedPhotos((prev) => ({ ...prev, [activePhoto.src]: true }))
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FallbackCourtyardArt index={activePhotoIndex} />
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 px-1">
              {galleryItems.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIndex(
                      (activePhotoIndex - 1 + galleryItems.length) % galleryItems.length,
                    )
                  }
                  aria-label={copy.prevPhotoLabel}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E6D3B3] bg-[#FFFBEB] text-[#78350F] transition hover:bg-[#FEF3C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309]"
                >
                  <ChevronIcon direction="left" />
                </button>
              ) : (
                <span className="w-9" />
              )}

              <p
                style={hindiSafeStyle}
                className="truncate font-serif text-sm font-semibold text-[#4A2B1D]"
              >
                {activePhoto.caption}
              </p>

              {galleryItems.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIndex((activePhotoIndex + 1) % galleryItems.length)
                  }
                  aria-label={copy.nextPhotoLabel}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E6D3B3] bg-[#FFFBEB] text-[#78350F] transition hover:bg-[#FEF3C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309]"
                >
                  <ChevronIcon direction="right" />
                </button>
              ) : (
                <span className="w-9" />
              )}
            </div>
          </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
