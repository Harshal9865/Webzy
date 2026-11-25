'use client';

import React, { useState } from 'react';
import {
  type CoreLanguageCode,
  pickLocalizedText,
  toCoreLanguageCode,
} from '@webzy/core';
import {
  OccasionAdaptiveGallery,
  OccasionArtworkBackdrop,
  type OccasionSiteProps,
  getReplayLabel,
  getWebzyFooterLabel,
} from './shared/OccasionPrimitives';
import {
  AmbientRainCanvas,
  type CurvedTrackItem,
  CurvedTrackSanctuary,
  HoldToChargeRing,
  WordByWordFadeLine,
} from './shared/OccasionCinematicFX';

interface AshirwadCopy {
  coverBadge: string;
  fromLabel: string;
  openCta: string;
  coverHint: string;
  sacredEyebrow: string;
  diyaPrompt: string;
  diyaLitBadge: string;
  diyaRelightHint: string;
  tributeEyebrow: string;
  letterTitle: string;
  signOffPrefix: string;
  albumEyebrow: string;
  photosTitle: string;
  photosHint: string;
  photoCaptionPrefix: string;
  soundtrackEyebrow: string;
  soundtrackHeading: string;
  tracks: readonly CurvedTrackItem[];
  bookletEyebrow: string;
  bookletTitle: string;
  emptyBooklet: string;
  pranamSectionEyebrow: string;
  pranamInvite: string;
  pranamHoldLabel: string;
  pranamChargingLabel: string;
  pranamCompleteLabel: string;
  pranamAcknowledged: string;
  pranamSendMore: (count: number) => string;
}

const ASHIRWAD_COPY: Record<CoreLanguageCode, AshirwadCopy> = {
  en: {
    coverBadge: 'Sadar Janamdin · With Respect',
    fromLabel: 'With reverence, from',
    openCta: 'Open with Respect',
    coverHint: 'An heirloom family blessing crafted in warmth and gratitude',
    sacredEyebrow: 'Ceremonial Invocation',
    diyaPrompt: 'Tap the Hammered Brass Diya to light the sacred flame',
    diyaLitBadge: 'Diya Lit · Family Blessings',
    diyaRelightHint: 'Sacred flame glowing for your health, peace, and longevity.',
    tributeEyebrow: 'A Family Tribute',
    letterTitle: 'Heirloom Family Letter',
    signOffPrefix: 'With eternal gratitude and pranam,',
    albumEyebrow: 'Family Keepsakes',
    photosTitle: 'Heirloom Moments',
    photosHint: 'Tap any portrait to view larger',
    photoCaptionPrefix: 'Family',
    soundtrackEyebrow: 'Serene Evening Ragas',
    soundtrackHeading: 'Classical Soundtrack Sanctuary',
    tracks: [
      {
        id: 'santoor-warmth',
        title: 'Santoor Warmth',
        moodLabel: 'Evening Raga · Serene',
        duration: '03:12',
        note: 'Gentle plucked santoor strings inspired by Raga Yaman at twilight, welcoming calm and auspicious warmth into the home.',
      },
      {
        id: 'sandhya-bansuri',
        title: 'Sandhya Bansuri',
        moodLabel: 'Bamboo Flute · Peaceful',
        duration: '02:48',
        note: 'Soft bamboo flute phrases over a steady tanpura drone, honoring quiet strength, patience, and lifelong grace.',
      },
      {
        id: 'aarti-chime',
        title: 'Aarti Temple Chime',
        moodLabel: 'Brass Bell · Reverent',
        duration: '02:24',
        note: 'Resonant brass bells and gentle harmonic overtones evoking morning prayers, blessings, and family togetherness.',
      },
    ],
    bookletEyebrow: 'Cherished Reflections',
    bookletTitle: 'Memories & Gratitude',
    emptyBooklet: 'Your warmth and wisdom guide every generation of our home.',
    pranamSectionEyebrow: 'Brass Thali Pranam · Return Blessing',
    pranamInvite: 'Press and hold the ceremonial seal to offer pranam and seal this family blessing.',
    pranamHoldLabel: 'Hold for Brass Thali Pranam',
    pranamChargingLabel: 'Offering Pranam...',
    pranamCompleteLabel: 'Pranam Sealed with Gratitude',
    pranamAcknowledged: 'Received with folded hands, warm wishes, and deep family reverence.',
    pranamSendMore: (count) => `Offer Another Pranam (${count})`,
  },
  hinglish: {
    coverBadge: 'Sadar Janamdin · With Respect',
    fromLabel: 'Aadar sahit:',
    openCta: 'Open with Respect',
    coverHint: 'Parivaar ke pyaar aur aadar se saja ek pavitra sandesh',
    sacredEyebrow: 'Shubh Aarti & Diya',
    diyaPrompt: 'Shubh jyot jalaane ke liye Brass Diya par tap karein',
    diyaLitBadge: 'Diya Lit · Family Blessings',
    diyaRelightHint: 'Aapki lambi umar, achhi sehat aur sukoon ke liye pavitra jyot roshan hai.',
    tributeEyebrow: 'Parivaar ka Ashirwad',
    letterTitle: 'Parivaar ka Patra',
    signOffPrefix: 'Dil se aadar aur pranam,',
    albumEyebrow: 'Anmol Yaadein',
    photosTitle: 'Heirloom Moments',
    photosHint: 'Badi photo dekhne ke liye tap karein',
    photoCaptionPrefix: 'Parivaar',
    soundtrackEyebrow: 'Sandhya Raga · Shant Dhun',
    soundtrackHeading: 'Classical Soundtrack Sanctuary',
    tracks: [
      {
        id: 'santoor-warmth',
        title: 'Santoor Warmth',
        moodLabel: 'Raga Yaman · Shanti',
        duration: '03:12',
        note: 'Shaam ke Raga Yaman se prerit santoor ki komal dhun, jo ghar mein sukoon aur mangal bhavna laati hai.',
      },
      {
        id: 'sandhya-bansuri',
        title: 'Sandhya Bansuri',
        moodLabel: 'Bansuri · Sukoon',
        duration: '02:48',
        note: 'Tanpura ke saath bansuri ki meethi taan, aapke dhairya aur sneh ko aadar dene ke liye.',
      },
      {
        id: 'aarti-chime',
        title: 'Aarti Temple Chime',
        moodLabel: 'Peetal Ghanti · Bhakti',
        duration: '02:24',
        note: 'Subah ki prarthana aur aarti ki pavitra goonj, poore parivaar ki mangal kaamna ke saath.',
      },
    ],
    bookletEyebrow: 'Anmol Yaadein',
    bookletTitle: 'Memories & Gratitude',
    emptyBooklet: 'Aapka pyaar aur ashirwad hamare ghar ki sabse badi daulat hai.',
    pranamSectionEyebrow: 'Peetal ki Thali · Sadar Pranam',
    pranamInvite: 'Sadar pranam arpit karne aur ashirwad seal karne ke liye thali seal ko dabakar rakhein.',
    pranamHoldLabel: 'Pranam ke liye dabakar rakhein',
    pranamChargingLabel: 'Pranam arpit ho raha hai...',
    pranamCompleteLabel: 'Sadar Pranam Arpit Hua',
    pranamAcknowledged: 'Hath jodkar parivaar ki taraf se sadar pranam aur dil se shubhkamnayein.',
    pranamSendMore: (count) => `Ek aur Pranam arpit karein (${count})`,
  },
  hi: {
    coverBadge: 'सादर जन्मदिन · ससम्मान',
    fromLabel: 'सादर प्रेषक:',
    openCta: 'ससम्मान खोलें',
    coverHint: 'परिवार के स्नेह, आदर और कृतज्ञता से सजी पावन भेंट',
    sacredEyebrow: 'मंगल दीप प्रज्वलन',
    diyaPrompt: 'मंगल ज्योति प्रज्वलित करने के लिए पीतल के दीये पर टैप करें',
    diyaLitBadge: 'दीया प्रज्वलित · परिवार का आशीर्वाद',
    diyaRelightHint: 'आपके उत्तम स्वास्थ्य, सुख, शांति और दीर्घायु के लिए पावन ज्योति प्रज्वलित है।',
    tributeEyebrow: 'परिवार का आशीर्वाद',
    letterTitle: 'परिवार की ओर से सादर पत्र',
    signOffPrefix: 'सादर चरण स्पर्श एवं आभार,',
    albumEyebrow: 'परिवार की धरोहर',
    photosTitle: 'परिवार की अनमोल यादें',
    photosHint: 'बड़ी फ़ोटो देखने के लिए टैप करें',
    photoCaptionPrefix: 'परिवार',
    soundtrackEyebrow: 'संध्या राग · मधुर संगीत',
    soundtrackHeading: 'शास्त्रीय संगीत कक्ष',
    tracks: [
      {
        id: 'santoor-warmth',
        title: 'Santoor Warmth',
        moodLabel: 'संध्या राग यमन · शांत',
        duration: '03:12',
        note: 'संध्या के राग यमन से प्रेरित संतूर की कोमल झंकार, जो घर में शांति और मांगलिक ऊष्मा भरती है।',
      },
      {
        id: 'sandhya-bansuri',
        title: 'संध्या बाँसुरी',
        moodLabel: 'बाँसुरी एवं तानपूरा · मधुर',
        duration: '02:48',
        note: 'तानपूरे की गूँज के साथ बाँसुरी के शांत स्वर, आपके धैर्य, त्याग और स्नेह को नमन करते हुए।',
      },
      {
        id: 'aarti-chime',
        title: 'मंगल आरती स्वर',
        moodLabel: 'पीतल घंटी · पावन',
        duration: '02:24',
        note: 'प्रातःकालीन प्रार्थना और पीतल की घंटी की पावन ध्वनि, संपूर्ण परिवार के मंगल की कामना सहित।',
      },
    ],
    bookletEyebrow: 'हृदय की स्मृतियाँ',
    bookletTitle: 'यादें और कृतज्ञता',
    emptyBooklet: 'आपका स्नेह और आशीर्वाद हमारे घर की सबसे बड़ी शक्ति है।',
    pranamSectionEyebrow: 'पीतल की थाली · सादर प्रणाम',
    pranamInvite: 'सादर प्रणाम अर्पित करने और आशीर्वाद की मुहर लगाने के लिए नीचे दबाकर रखें।',
    pranamHoldLabel: 'प्रणाम अर्पित करने के लिए दबाकर रखें',
    pranamChargingLabel: 'प्रणाम अर्पित हो रहा है...',
    pranamCompleteLabel: 'सादर प्रणाम समर्पित हुआ',
    pranamAcknowledged: 'हाथ जोड़कर परिवार की ओर से सादर प्रणाम एवं मंगलकामनाएँ।',
    pranamSendMore: (count) => `पुनः प्रणाम अर्पित करें (${count})`,
  },
};

const RELATION_LABELS: Record<string, Record<CoreLanguageCode, string>> = {
  mummy: { en: 'Beloved Mother', hinglish: 'Mummy / Maa', hi: 'मम्मी / माँ' },
  papa: { en: 'Revered Father', hinglish: 'Papa / Pitaji', hi: 'पापा / पिताजी' },
  grandparent: { en: 'Respected Elder', hinglish: 'Dada-Dadi / Nana-Nani', hi: 'दादा-दादी / नाना-नानी' },
};

function resolveRelationLabel(relation: string | undefined, coreLang: CoreLanguageCode): string | null {
  if (!relation?.trim()) return null;
  const normalized = relation.trim().toLowerCase();
  const mapped = RELATION_LABELS[normalized];
  if (mapped) return mapped[coreLang];
  return relation.trim();
}

function MarigoldToranBorder() {
  return (
    <svg
      viewBox="0 0 360 36"
      className="h-8 w-full shrink-0"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 6 Q60 22 120 8 Q180 24 240 8 Q300 22 352 6"
        stroke="#B45309"
        strokeWidth="1.5"
        strokeOpacity="0.55"
        fill="none"
      />
      {[36, 90, 144, 180, 216, 270, 324].map((cx, index) => (
        <g key={cx}>
          <path
            d={`M${cx - 12} 8 C${cx - 10} 20, ${cx - 4} 24, ${cx - 6} 10 Z`}
            fill="#657A3A"
            fillOpacity="0.68"
          />
          <path
            d={`M${cx + 12} 8 C${cx + 10} 20, ${cx + 4} 24, ${cx + 6} 10 Z`}
            fill="#657A3A"
            fillOpacity="0.68"
          />
          <circle
            cx={cx}
            cy={index === 3 ? 17 : 13}
            r={index === 3 ? 6.5 : 5}
            fill="#D97706"
          />
          <circle
            cx={cx}
            cy={index === 3 ? 17 : 13}
            r={index === 3 ? 3 : 2.2}
            fill="#FEF3C7"
          />
        </g>
      ))}
    </svg>
  );
}

function BrassLotusKalashSeal() {
  return (
    <div
      className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#D97706]/70 bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#D97706]/35 shadow-[0_4px_14px_rgba(180,83,9,0.22),inset_0_1px_2px_rgba(255,255,255,0.9)]"
      aria-hidden="true"
    >
      <div className="flex h-[82px] w-[82px] items-center justify-center rounded-full border border-[#B45309]/45 bg-[#FFFBEB]/85">
        <svg viewBox="0 0 64 64" className="h-12 w-12 text-[#B45309]" fill="none">
          <circle cx="32" cy="32" r="27" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" />
          <path
            d="M32 13 C27 21, 27 28, 32 33 C37 28, 37 21, 32 13 Z"
            fill="#D97706"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M32 33 C23 30, 17 24, 17 18 C23 19, 28 24, 32 33 Z"
            fill="#D97706"
            fillOpacity="0.16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M32 33 C41 30, 47 24, 47 18 C41 19, 36 24, 32 33 Z"
            fill="#D97706"
            fillOpacity="0.16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M23 35 H41 L38 41 C41 44, 39 50, 32 50 C25 50, 23 44, 26 41 Z"
            fill="#B45309"
            fillOpacity="0.14"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M21 35 H43" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M26 52 H38" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function HammeredBrassDiya({ lit }: { lit: boolean }) {
  return (
    <div className="relative mx-auto flex h-32 w-36 items-center justify-center" aria-hidden="true">
      {/* Warm radial bloom */}
      <span
        className={`pointer-events-none absolute rounded-full transition-all duration-700 motion-reduce:transition-none ${
          lit
            ? 'h-32 w-32 bg-amber-400/50 blur-xl animate-pulse motion-reduce:animate-none'
            : 'h-16 w-16 bg-amber-300/20 blur-lg'
        }`}
      />
      <span
        className={`pointer-events-none absolute rounded-full border transition-all duration-700 motion-reduce:transition-none ${
          lit
            ? 'h-24 w-24 scale-105 border-[#F59E0B]/45 bg-[#FEF3C7]/55 opacity-100 blur-xs'
            : 'h-12 w-12 scale-75 border-transparent bg-transparent opacity-0'
        }`}
      />

      <svg viewBox="0 0 112 84" className="relative h-28 w-32" fill="none">
        <defs>
          <radialGradient id="diya-bloom-aura" cx="50%" cy="32%" r="48%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity={lit ? '0.85' : '0.25'} />
            <stop offset="60%" stopColor="#F59E0B" stopOpacity={lit ? '0.28' : '0'} />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="brass-bowl-grad" x1="20" y1="44" x2="92" y2="66" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="45%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
        </defs>

        <circle cx="56" cy="27" r="30" fill="url(#diya-bloom-aura)" />

        {/* Blooming golden rays when lit */}
        <g
          stroke="#D97706"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="transition-all duration-500 motion-reduce:transition-none"
          style={{
            opacity: lit ? 0.88 : 0,
            transform: lit ? 'scale(1)' : 'scale(0.65)',
            transformOrigin: '56px 28px',
          }}
        >
          <line x1="56" y1="2" x2="56" y2="9" />
          <line x1="39" y1="7" x2="43" y2="13" />
          <line x1="73" y1="7" x2="69" y2="13" />
          <line x1="26" y1="16" x2="33" y2="20" />
          <line x1="86" y1="16" x2="79" y2="20" />
          <line x1="21" y1="29" x2="29" y2="29" />
          <line x1="91" y1="29" x2="83" y2="29" />
          <circle cx="33" cy="11" r="1.4" fill="#F59E0B" stroke="none" />
          <circle cx="79" cy="11" r="1.4" fill="#F59E0B" stroke="none" />
        </g>

        {/* Sacred flame */}
        <g
          className="transition-transform duration-500 motion-reduce:transition-none"
          style={{
            transform: lit ? 'scale(1.16) translateY(-2px)' : 'scale(0.92)',
            transformOrigin: '56px 40px',
          }}
        >
          <path
            d="M56 13 C49.5 22.5, 47 30, 50.5 36.5 C52.8 40, 59.2 40, 61.5 36.5 C65 30, 62.5 22.5, 56 13 Z"
            fill={lit ? '#F59E0B' : '#FBBF24'}
            stroke="#B45309"
            strokeWidth="1.4"
          />
          <path
            d="M56 19.5 C53 24.5, 52.5 29.5, 54.6 33 C55.3 34.2, 56.7 34.2, 57.4 33 C59.5 29.5, 59 24.5, 56 19.5 Z"
            fill={lit ? '#FFFBEB' : '#FEF3C7'}
          />
        </g>

        {/* Hammered brass diya bowl + spout */}
        <path
          d="M25 45 C29 58, 41 64, 56 64 C71 64, 83 58, 87 45 C73 48.5, 39 48.5, 25 45 Z"
          fill="url(#brass-bowl-grad)"
          fillOpacity={lit ? '0.44' : '0.3'}
          stroke="#92400E"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <ellipse
          cx="56"
          cy="45"
          rx="31"
          ry="4.8"
          fill="#FEF3C7"
          fillOpacity="0.72"
          stroke="#B45309"
          strokeWidth="1.4"
        />
        {/* Hammered brass dimple accents */}
        <g fill="#92400E" fillOpacity="0.45">
          <circle cx="38" cy="53" r="1.2" />
          <circle cx="46" cy="56" r="1.3" />
          <circle cx="56" cy="57" r="1.3" />
          <circle cx="66" cy="56" r="1.3" />
          <circle cx="74" cy="53" r="1.2" />
          <circle cx="51" cy="51.5" r="1" />
          <circle cx="61" cy="51.5" r="1" />
        </g>
        {/* Pedestal base */}
        <path d="M47 64 L43 70 M65 64 L69 70" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M37 70 H75" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function ToranRosetteDivider() {
  return (
    <div className="my-3 flex items-center justify-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D97706]/45 to-[#B45309]/55" />
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#B45309]" fill="none">
        <path
          d="M12 3 L15 9 L21 12 L15 15 L12 21 L9 15 L3 12 L9 9 Z"
          fill="#D97706"
          fillOpacity="0.25"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#D97706]/45 to-[#B45309]/55" />
    </div>
  );
}

function BrassThaliIcon() {
  return (
    <svg viewBox="0 0 28 28" className="h-6 w-6 shrink-0" fill="none" aria-hidden="true">
      <ellipse cx="14" cy="19" rx="11" ry="4.8" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M14 6.5 C12.5 9.5, 12 11.8, 13.2 13.3 C13.7 14, 14.3 14, 14.8 13.3 C16 11.8, 15.5 9.5, 14 6.5 Z"
        fill="currentColor"
      />
      <path d="M10.5 15.5 H17.5 L16.2 18.2 H11.8 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function KhadiCornerFlourish({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`pointer-events-none absolute h-5 w-5 text-[#B45309]/45 ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M2 16 V4 C2 2.9 2.9 2 4 2 H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="6.5" cy="6.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

/**
 * Continuous-flow Heirloom Family Blessing Website ("Birthday Ashirwad").
 * Designed with ceremonial marigold, brass, and khadi warmth for mothers, fathers, and elders.
 */
export function BirthdayAshirwadSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const [opened, setOpened] = useState(false);
  const [diyaLit, setDiyaLit] = useState(false);
  const [pranamSealed, setPranamSealed] = useState(false);
  const [pranamCount, setPranamCount] = useState(0);

  const coreLang = toCoreLanguageCode(language);
  const copy = ASHIRWAD_COPY[coreLang] ?? ASHIRWAD_COPY.en;
  const primaryColor = manifest.palette.primary || '#B45309';
  const relationLabel = resolveRelationLabel(data.relation, coreLang);
  const themeTitle = pickLocalizedText(manifest.name, language);
  const headlineText = pickLocalizedText(data.headline, language);
  const messageText = pickLocalizedText(data.message, language);
  const canUseBrassDropCap = coreLang !== 'hi' && /^[A-Za-z]/.test(messageText.trim());
  const highlights = data.highlights ?? [];
  const hasPhotos = (data.photos ?? []).some((src) => typeof src === 'string' && src.trim().length > 0);

  function handleOpen() {
    setOpened(true);
    onOpened?.();
  }

  function handleReplay() {
    setOpened(false);
    setDiyaLit(false);
    setPranamSealed(false);
    setPranamCount(0);
  }

  return (
    <div className="relative flex min-h-full w-full max-w-full flex-col justify-between overflow-x-hidden rounded-[28px] bg-[#FFFBEB] text-[#2B1B2E]">
      {watermarked ? (
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-20 flex justify-center border-b border-[#F5E6C8] bg-[#FEF3C7]/90 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#92400E]"
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      {!opened ? (
        /* ACT 1: Marigold Toran & Brass Kalash Cover */
        <div className="relative flex flex-1 flex-col justify-between overflow-hidden">
          <OccasionArtworkBackdrop
            src="/templates/occasions/birthday-ashirwad/cover.jpg"
            fallbackGradient="linear-gradient(155deg, #FFFBEB 0%, #FEF3C7 60%, #FFF7ED 100%)"
            className="object-cover object-center opacity-30"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FFFBEB]/45 via-transparent to-[#FEF3C7]/60"
          />

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-3.5 sm:p-6">
            <div className="w-full max-w-md rounded-2xl border border-[#E7D3AD] bg-[#FFFBEB]/92 p-1.5 shadow-[0_10px_34px_rgba(180,83,9,0.14)] backdrop-blur-[2px]">
              <div className="relative rounded-[12px] border border-[#D97706]/35 bg-[#FFFDF8]/92 px-4 py-6 text-center sm:px-6">
                <KhadiCornerFlourish className="left-2.5 top-2.5" />
                <KhadiCornerFlourish className="right-2.5 top-2.5 rotate-90" />
                <KhadiCornerFlourish className="bottom-2.5 right-2.5 rotate-180" />
                <KhadiCornerFlourish className="bottom-2.5 left-2.5 -rotate-90" />

                <MarigoldToranBorder />

                <div className="mt-4 flex flex-col items-center">
                  <BrassLotusKalashSeal />

                  <span className="mt-5 inline-block max-w-full break-words rounded-full border border-[#F5E6C8] bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B45309] shadow-2xs">
                    {copy.coverBadge}
                  </span>

                  <h2 className="mt-4 max-w-full break-words font-heading text-[26px] font-bold leading-tight text-[#2B1B2E] sm:text-[32px]">
                    {data.receiverName}
                  </h2>

                  {relationLabel ? (
                    <span className="mt-2 inline-flex min-h-[28px] items-center rounded-full border border-[#D97706]/30 bg-[#FEF3C7]/70 px-3.5 py-0.5 font-serif text-xs font-semibold tracking-wide text-[#92400E]">
                      {relationLabel}
                    </span>
                  ) : null}

                  <p className="mt-3 max-w-full break-words font-serif text-base text-[#2B1B2E]/85">
                    {copy.fromLabel}{' '}
                    <span className="font-semibold text-[#2B1B2E]">{data.senderName}</span>
                  </p>

                  <button
                    type="button"
                    onClick={handleOpen}
                    aria-label={`${copy.openCta} — ${themeTitle}`}
                    className="mt-6 inline-flex min-h-[48px] w-full max-w-[260px] items-center justify-center rounded-full border border-[#92400E] bg-gradient-to-b from-[#D97706] to-[#B45309] px-7 py-3 font-serif text-base font-bold tracking-wide text-white shadow-[0_4px_14px_rgba(180,83,9,0.3)] transition duration-200 hover:brightness-105 active:translate-y-[1px] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFBEB] motion-reduce:transition-none"
                  >
                    {copy.openCta}
                  </button>

                  <p className="mt-3 max-w-xs font-serif text-xs leading-relaxed text-[#2B1B2E]/65">
                    {copy.coverHint}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ACT 2: Continuous Flowing Heirloom Sanctuary */
        <div className="relative flex flex-1 flex-col justify-between bg-gradient-to-b from-[#FFFBEB] via-[#FEF9E7] to-[#FFFBEB] animate-fade-in motion-reduce:animate-none">
          {/* Subtle ambient golden shimmer across the sanctuary */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-75" aria-hidden="true">
            <AmbientRainCanvas fireflies tint="#F59E0B" density="light" />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-3.5 pb-6 pt-3.5 sm:px-6 sm:pt-5">
            {/* Top header bar with Heirloom badge & Replay control */}
            <header className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <span className="inline-flex min-h-[34px] items-center rounded-full border border-[#E7D3AD] bg-white/90 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#B45309] shadow-2xs">
                  {themeTitle}
                </span>
                {relationLabel ? (
                  <span className="inline-flex min-h-[34px] items-center rounded-full border border-[#F5E6C8] bg-[#FEF3C7]/80 px-3 py-1 font-serif text-xs font-semibold text-[#92400E]">
                    {relationLabel}
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                onClick={handleReplay}
                className="inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-[#D97706]/45 bg-white/95 px-4 text-xs font-semibold text-[#2B1B2E] shadow-2xs transition hover:bg-[#FEF3C7]/70 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                {getReplayLabel(language)}
              </button>
            </header>

            {/* 1. Sacred Diya Ritual */}
            <section
              aria-label={copy.sacredEyebrow}
              className="rounded-2xl border border-[#E7D3AD] bg-white/95 p-1.5 shadow-[0_6px_22px_rgba(180,83,9,0.08)]"
            >
              <div className="rounded-[12px] border border-[#D97706]/25 bg-[#FFFDF8] px-4 py-5 text-center sm:px-6">
                <MarigoldToranBorder />

                <span className="mt-2 inline-block rounded-full border border-[#F5E6C8] bg-[#FFFBEB] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B45309]">
                  {copy.sacredEyebrow}
                </span>

                <div className="mt-4 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setDiyaLit((lit) => !lit)}
                    aria-pressed={diyaLit}
                    aria-label={diyaLit ? copy.diyaLitBadge : copy.diyaPrompt}
                    className={`group flex min-h-[48px] w-full max-w-sm flex-col items-center justify-center rounded-2xl border px-4 py-4 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] focus-visible:ring-offset-2 motion-reduce:transition-none ${
                      diyaLit
                        ? 'border-[#D97706]/60 bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7]/85 shadow-[0_8px_24px_rgba(217,119,6,0.18)]'
                        : 'border-[#F5E6C8] bg-[#FFFBEB]/70 hover:border-[#D97706]/45 hover:bg-[#FFFBEB]'
                    }`}
                  >
                    <HammeredBrassDiya lit={diyaLit} />

                    {diyaLit ? (
                      <span className="mt-2 inline-flex min-h-[34px] items-center rounded-full border border-[#D97706]/45 bg-white px-4 py-1 text-xs font-bold tracking-wide text-[#B45309] shadow-2xs animate-pop-bounce motion-reduce:animate-none">
                        {copy.diyaLitBadge}
                      </span>
                    ) : (
                      <span className="mt-2 inline-flex min-h-[34px] items-center rounded-full border border-[#F5E6C8] bg-white px-3.5 py-1.5 text-xs font-semibold leading-snug text-[#92400E] transition group-hover:border-[#D97706]/45">
                        {copy.diyaPrompt}
                      </span>
                    )}
                  </button>

                  {diyaLit ? (
                    <p className="mt-3 max-w-sm font-serif text-sm font-medium leading-relaxed text-[#92400E] animate-fade-in motion-reduce:animate-none">
                      {copy.diyaRelightHint}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            {/* 2. Khadi Blessing Letter */}
            <section aria-label={copy.letterTitle}>
              <div className="rounded-2xl border border-[#E7D3AD] bg-[#FDF9EE]/95 p-1.5 shadow-[0_8px_26px_rgba(180,83,9,0.09)]">
                <div className="relative rounded-[12px] border border-[#D97706]/35 bg-[#FFFDF8] px-4 py-6 text-center sm:px-7">
                  <KhadiCornerFlourish className="left-2.5 top-2.5" />
                  <KhadiCornerFlourish className="right-2.5 top-2.5 rotate-90" />
                  <KhadiCornerFlourish className="bottom-2.5 right-2.5 rotate-180" />
                  <KhadiCornerFlourish className="bottom-2.5 left-2.5 -rotate-90" />

                  <span className="inline-block rounded-full border border-[#F5E6C8] bg-[#FFFBEB] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B45309]">
                    {copy.tributeEyebrow}
                  </span>

                  <p className="mt-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#2B1B2E]/60">
                    {copy.letterTitle}
                  </p>

                  <WordByWordFadeLine
                    text={headlineText}
                    active={opened}
                    delayStepMs={65}
                    className="mt-2 break-words font-heading text-[24px] font-bold leading-snug text-[#2B1B2E] sm:text-[28px]"
                  />

                  <ToranRosetteDivider />

                  <p
                    className={`mt-4 break-words text-left font-serif text-[17px] leading-[1.78] text-[#2B1B2E] sm:text-[18px] ${
                      canUseBrassDropCap
                        ? 'first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:font-heading first-letter:text-[42px] first-letter:font-bold first-letter:leading-[0.85] first-letter:text-[#B45309]'
                        : ''
                    }`}
                  >
                    {messageText}
                  </p>

                  <div className="clear-both pt-4">
                    <ToranRosetteDivider />
                  </div>

                  <div className="mt-3 text-center">
                    <p className="font-serif text-sm text-[#2B1B2E]/75">{copy.signOffPrefix}</p>
                    <p className="mt-1 break-words font-heading text-lg font-bold text-[#B45309]">
                      {data.senderName}
                    </p>
                    {relationLabel ? (
                      <p className="mt-0.5 break-words text-xs font-semibold tracking-wide text-[#2B1B2E]/70">
                        {data.receiverName} · {relationLabel}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Adaptive Family Album (only rendered when photos exist; never renders dashed blanks) */}
            {hasPhotos ? (
              <section
                aria-label={copy.photosTitle}
                className="rounded-2xl border border-[#E7D3AD] bg-white/95 p-1.5 shadow-[0_6px_22px_rgba(180,83,9,0.08)]"
              >
                <div className="rounded-[12px] border border-[#D97706]/25 bg-[#FFFDF8] px-4 py-5 sm:px-6">
                  <div className="text-center">
                    <span className="inline-block rounded-full border border-[#F5E6C8] bg-[#FFFBEB] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B45309]">
                      {copy.albumEyebrow}
                    </span>
                    <h3 className="mt-2 font-heading text-xl font-bold text-[#2B1B2E]">
                      {copy.photosTitle}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-[#2B1B2E]/65">
                      {copy.photosHint}
                    </p>
                  </div>

                  <div className="mt-3">
                    <OccasionAdaptiveGallery
                      photos={data.photos}
                      accentColor={primaryColor}
                      captionPrefix={copy.photoCaptionPrefix}
                    />
                  </div>
                </div>
              </section>
            ) : null}

            {/* 4. Classical Soundtrack Sanctuary */}
            <section aria-label={copy.soundtrackHeading} className="space-y-1.5">
              <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#B45309]">
                {copy.soundtrackEyebrow}
              </p>
              <CurvedTrackSanctuary
                tracks={copy.tracks}
                mood="festive"
                accentColor={primaryColor}
                dark={false}
                heading={copy.soundtrackHeading}
              />
            </section>

            {/* 5. Memories & Gratitude Cards */}
            <section
              aria-label={copy.bookletTitle}
              className="rounded-2xl border border-[#E7D3AD] bg-white/95 p-1.5 shadow-[0_6px_22px_rgba(180,83,9,0.08)]"
            >
              <div className="rounded-[12px] border border-[#D97706]/25 bg-[#FFFDF8] px-4 py-5 sm:px-6">
                <div className="text-center">
                  <span className="inline-block rounded-full border border-[#F5E6C8] bg-[#FFFBEB] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B45309]">
                    {copy.bookletEyebrow}
                  </span>
                  <h3 className="mt-2 font-heading text-xl font-bold text-[#2B1B2E]">
                    {copy.bookletTitle}
                  </h3>
                </div>

                {highlights.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {highlights.map((item, idx) => (
                      <article
                        key={`${item.title.en}-${idx}`}
                        className="rounded-xl border border-[#F5E6C8] bg-[#FFFBEB]/80 px-4 py-3.5 text-left shadow-2xs"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D97706]/40 bg-white font-mono text-[11px] font-bold text-[#B45309]"
                          >
                            0{idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className="break-words font-heading text-base font-bold text-[#92400E] sm:text-lg">
                              {pickLocalizedText(item.title, language)}
                            </h4>
                            <p className="mt-1 break-words font-serif text-[15.5px] leading-[1.68] text-[#2B1B2E]/90 sm:text-base">
                              {pickLocalizedText(item.detail, language)}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl border border-[#F5E6C8] bg-[#FFFBEB]/80 px-4 py-4 text-center font-serif text-base leading-[1.7] text-[#2B1B2E]">
                    {copy.emptyBooklet}
                  </p>
                )}
              </div>
            </section>

            {/* 6. Brass Thali Pranam / Return Blessing Seal */}
            <section
              aria-label={copy.pranamSectionEyebrow}
              className="rounded-2xl border border-[#D97706]/50 bg-gradient-to-br from-[#3A1E15] via-[#2B1613] to-[#201013] px-4 py-6 text-center text-white shadow-[0_12px_28px_rgba(43,27,46,0.22)] outline outline-1 -outline-offset-4 outline-[#F59E0B]/30 sm:px-6"
            >
              <div className="flex flex-col items-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#F59E0B]/35 bg-[#F59E0B]/15 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#FDE68A]">
                  <BrassThaliIcon />
                  <span>{copy.pranamSectionEyebrow}</span>
                </span>

                <p className="mt-3 max-w-sm font-serif text-sm leading-relaxed text-[#FEF3C7]/90">
                  {copy.pranamInvite}
                </p>

                <div className="mt-5">
                  <HoldToChargeRing
                    label={copy.pranamHoldLabel}
                    chargingLabel={copy.pranamChargingLabel}
                    completeLabel={copy.pranamCompleteLabel}
                    accentColor="#F59E0B"
                    durationMs={1250}
                    onComplete={() => {
                      setPranamSealed(true);
                      setPranamCount((c) => (c === 0 ? 1 : c));
                    }}
                  />
                </div>

                {pranamSealed ? (
                  <div className="mt-4 flex w-full max-w-sm flex-col items-center gap-2.5 animate-fade-in motion-reduce:animate-none">
                    <p className="rounded-xl border border-[#F59E0B]/35 bg-[#FFFBEB]/10 px-4 py-2.5 font-serif text-xs font-medium leading-relaxed text-[#FEF3C7]">
                      {copy.pranamAcknowledged}
                    </p>
                    <button
                      type="button"
                      onClick={() => setPranamCount((c) => c + 1)}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#F59E0B]/55 bg-[#F59E0B]/20 px-5 py-2 font-serif text-xs font-bold text-[#FEF3C7] transition hover:bg-[#F59E0B]/30 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE68A] motion-reduce:transition-none"
                    >
                      <BrassThaliIcon />
                      <span>{copy.pranamSendMore(pranamCount)}</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </section>

            <footer className="mt-1 w-full border-t border-[#E7D3AD] pt-3.5 text-center text-xs font-medium text-[#2B1B2E]/70">
              {getWebzyFooterLabel(language)}
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
