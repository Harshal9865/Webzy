'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type CoreLanguageCode, pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  type OccasionSiteProps,
  getReplayLabel,
  getWebzyFooterLabel,
} from './shared/OccasionPrimitives';

const DEVANAGARI_RE = /[\u0900-\u097F]/;

function hasDevanagari(text: string): boolean {
  return DEVANAGARI_RE.test(text);
}

interface PolaroidSample {
  src: string;
  caption: Record<CoreLanguageCode, string>;
}

const SAMPLE_POLAROIDS: readonly PolaroidSample[] = [
  {
    src: '/templates/occasions/upgrades/paris-moonlit-balcony.jpg',
    caption: {
      en: 'starlight glow',
      hinglish: 'sitaron ki raat',
      hi: 'सितारों की रात',
    },
  },
  {
    src: '/templates/occasions/upgrades/stained-glass-gate.jpg',
    caption: {
      en: 'secret garden',
      hinglish: 'khwabon ka baag',
      hi: 'ख्वाबों का बाग़',
    },
  },
  {
    src: '/templates/cafe/rose-cottage.jpg',
    caption: {
      en: 'sunset blooms',
      hinglish: 'shaam ke phool',
      hi: 'शाम के फूल',
    },
  },
];

interface LocalizedCopy {
  coverEyebrow: string;
  coverPrompt: string;
  forPrefix: string;
  fromPrefix: string;
  tapSealHint: string;
  openingLabel: string;
  defaultHeadline: string;
  defaultMessage: string;
  polaroidEyebrow: string;
  photoLabel: string;
  questionEyebrow: string;
  questionTitle: string;
  yesLabel: string;
  noLabel: string;
  catIdleCaption: string;
  catCaptions: readonly [string, string, string, string];
  ticketEyebrow: string;
  ticketStamp: string;
  ticketTitle: (receiver: string) => string;
  ticketSubtitle: (sender: string) => string;
  promiseLabel: string;
  promiseValue: string;
  petalShowerCta: string;
  askAgainCta: string;
  closeLabel: string;
}

const COPY_BY_LANG: Record<CoreLanguageCode, LocalizedCopy> = {
  en: {
    coverEyebrow: 'MOONLIT CONSERVATORY',
    coverPrompt: 'A quiet little note for you',
    forPrefix: 'For',
    fromPrefix: 'with love,',
    tapSealHint: 'Tap the wax seal to unfold',
    openingLabel: 'Unfolding under moonlight...',
    defaultHeadline: 'Will you be mine?',
    defaultMessage:
      'Every ordinary evening feels like starlight the moment you are near. Let me steal you away for one unforgettable night.',
    polaroidEyebrow: 'KEEPSAKE POLAROIDS',
    photoLabel: 'Memory',
    questionEyebrow: 'ONE LITTLE QUESTION',
    questionTitle: 'Will you go out with me?',
    yesLabel: 'Yes, always',
    noLabel: 'No',
    catIdleCaption: 'for you',
    catCaptions: ['pretty pls?', 'take rose', 'wait pls?', 'say yes!'],
    ticketEyebrow: 'CONSTELLATION PROMISE',
    ticketStamp: 'WRITTEN IN STARS',
    ticketTitle: (receiver) => `Forever starts tonight, ${receiver}`,
    ticketSubtitle: (sender) => `${sender} is smiling at the moon right now.`,
    promiseLabel: 'PROMISE',
    promiseValue: 'Moonlit walks, warm laughs & endless blooms',
    petalShowerCta: 'Petal Shower',
    askAgainCta: 'Replay',
    closeLabel: 'Close',
  },
  hinglish: {
    coverEyebrow: 'MOONLIT CONSERVATORY',
    coverPrompt: 'Tumhare liye ek pyaara sa khat',
    forPrefix: 'Sirf',
    fromPrefix: 'pyaar se,',
    tapSealHint: 'Kholne ke liye wax seal par tap karo',
    openingLabel: 'Chaandni mein khul raha hai...',
    defaultHeadline: 'Kya tum meri banogi?',
    defaultMessage:
      'Tumhare saath har shaam sitaron si lagti hai. Chalo ek aisi raat banayein jo kabhi khatam na ho.',
    polaroidEyebrow: 'YAADON KE POLAROIDS',
    photoLabel: 'Yaad',
    questionEyebrow: 'EK DIL SE SAWAAL',
    questionTitle: 'Kya tum mere saath chalogi?',
    yesLabel: 'Haan, bilkul',
    noLabel: 'Nahi',
    catIdleCaption: 'tumhare liye',
    catCaptions: ['maan jao?', 'ye lo phool', 'ruko pls?', 'haan bolo!'],
    ticketEyebrow: 'CONSTELLATION PROMISE',
    ticketStamp: 'SITARON MEIN LIKHA',
    ticketTitle: (receiver) => `Ye shaam hamari rahi, ${receiver}`,
    ticketSubtitle: (sender) => `${sender} ke chehre par abhi sabse badi muskaan hai.`,
    promiseLabel: 'WAADA',
    promiseValue: 'Chaandni raatein, hansi aur dher saara pyaar',
    petalShowerCta: 'Phool Barsao',
    askAgainCta: 'Phir Se',
    closeLabel: 'Band Karein',
  },
  hi: {
    coverEyebrow: 'चाँदनी बग़ीचा',
    coverPrompt: 'तुम्हारे लिए एक प्यारा सा पैग़ाम',
    forPrefix: 'प्रिय',
    fromPrefix: 'स्नेह सहित,',
    tapSealHint: 'खोलने के लिए मोहर पर टैप करें',
    openingLabel: 'चाँदनी में खुल रहा है...',
    defaultHeadline: 'क्या तुम मेरी बनोगी?',
    defaultMessage:
      'तुम्हारे पास होने से हर साधारण शाम सितारों सी चमक उठती है। चलो एक यादगार शाम साथ बिताते हैं।',
    polaroidEyebrow: 'सुनहरी यादें',
    photoLabel: 'याद',
    questionEyebrow: 'दिल से एक सवाल',
    questionTitle: 'क्या तुम मेरे साथ चलोगी?',
    yesLabel: 'हाँ, बिल्कुल',
    noLabel: 'नहीं',
    catIdleCaption: 'तुम्हारे लिए',
    catCaptions: ['मान जाओ?', 'ये लो गुलाब', 'रुको ना?', 'हाँ बोलो!'],
    ticketEyebrow: 'सितारों का वादा',
    ticketStamp: 'सितारों में लिखा',
    ticketTitle: (receiver) => `यह शाम हमारी रही, ${receiver}`,
    ticketSubtitle: (sender) => `${sender} के चेहरे पर अभी सबसे प्यारी मुस्कान है।`,
    promiseLabel: 'वादा',
    promiseValue: 'चाँदनी सैर, मीठी हँसी और अनगिनत फूल',
    petalShowerCta: 'फूल बरसाएँ',
    askAgainCta: 'फिर से देखें',
    closeLabel: 'बंद करें',
  },
};

const CONSTELLATION_STARS = [
  { cx: 12, cy: 14, r: 1.5, delay: '0s' },
  { cx: 24, cy: 9, r: 1.1, delay: '0.7s' },
  { cx: 36, cy: 18, r: 1.7, delay: '1.4s' },
  { cx: 49, cy: 11, r: 1.2, delay: '0.4s' },
  { cx: 63, cy: 16, r: 1.6, delay: '1.9s' },
  { cx: 77, cy: 10, r: 1.3, delay: '1.1s' },
  { cx: 88, cy: 20, r: 1.5, delay: '2.3s' },
  { cx: 18, cy: 32, r: 1.0, delay: '1.6s' },
  { cx: 43, cy: 29, r: 1.2, delay: '2.1s' },
  { cx: 71, cy: 31, r: 1.1, delay: '0.9s' },
  { cx: 91, cy: 39, r: 1.4, delay: '1.3s' },
  { cx: 9, cy: 48, r: 1.2, delay: '2.6s' },
  { cx: 29, cy: 56, r: 1.0, delay: '0.5s' },
  { cx: 82, cy: 58, r: 1.3, delay: '1.8s' },
] as const;

const FIREFLIES = [
  { left: '12%', top: '72%', size: 5, delay: '0s', duration: '7.5s' },
  { left: '26%', top: '46%', size: 4, delay: '1.4s', duration: '8.8s' },
  { left: '41%', top: '80%', size: 6, delay: '2.2s', duration: '9.2s' },
  { left: '58%', top: '34%', size: 4, delay: '0.8s', duration: '7.8s' },
  { left: '74%', top: '66%', size: 5, delay: '3.1s', duration: '8.4s' },
  { left: '86%', top: '42%', size: 5, delay: '1.9s', duration: '9.5s' },
  { left: '19%', top: '24%', size: 4, delay: '2.7s', duration: '8.1s' },
  { left: '66%', top: '84%', size: 5, delay: '0.4s', duration: '7.2s' },
  { left: '90%', top: '76%', size: 4, delay: '3.8s', duration: '8.6s' },
  { left: '48%', top: '20%', size: 3.5, delay: '2.5s', duration: '9.0s' },
] as const;

const FALLING_PETALS = [
  { left: '8%', delay: '0s', duration: '11s', scale: 0.9, shade: '#FDA4AF' },
  { left: '22%', delay: '2.8s', duration: '13s', scale: 0.75, shade: '#FBCFE8' },
  { left: '38%', delay: '5.1s', duration: '12s', scale: 1.0, shade: '#FB7185' },
  { left: '54%', delay: '1.3s', duration: '14s', scale: 0.8, shade: '#FDA4AF' },
  { left: '70%', delay: '4.2s', duration: '11.5s', scale: 0.95, shade: '#FBCFE8' },
  { left: '84%', delay: '6.4s', duration: '12.5s', scale: 0.85, shade: '#FB7185' },
  { left: '93%', delay: '3.4s', duration: '13.5s', scale: 0.7, shade: '#FDA4AF' },
  { left: '30%', delay: '8.0s', duration: '12s', scale: 0.85, shade: '#FBCFE8' },
] as const;

const BURST_PARTICLES = [
  { angle: 0, dist: 125, kind: 'petal', color: '#FDA4AF', delay: '0ms' },
  { angle: 22, dist: 145, kind: 'star', color: '#FDE68A', delay: '30ms' },
  { angle: 45, dist: 132, kind: 'petal', color: '#FB7185', delay: '50ms' },
  { angle: 68, dist: 150, kind: 'star', color: '#FEF08A', delay: '20ms' },
  { angle: 90, dist: 128, kind: 'petal', color: '#FBCFE8', delay: '60ms' },
  { angle: 112, dist: 148, kind: 'star', color: '#FDE68A', delay: '40ms' },
  { angle: 135, dist: 136, kind: 'petal', color: '#F43F5E', delay: '70ms' },
  { angle: 158, dist: 142, kind: 'star', color: '#FEF08A', delay: '25ms' },
  { angle: 180, dist: 126, kind: 'petal', color: '#FDA4AF', delay: '55ms' },
  { angle: 202, dist: 146, kind: 'star', color: '#FDE68A', delay: '35ms' },
  { angle: 225, dist: 134, kind: 'petal', color: '#FB7185', delay: '65ms' },
  { angle: 248, dist: 148, kind: 'star', color: '#FEF08A', delay: '15ms' },
  { angle: 270, dist: 130, kind: 'petal', color: '#FBCFE8', delay: '45ms' },
  { angle: 292, dist: 144, kind: 'star', color: '#FDE68A', delay: '75ms' },
  { angle: 315, dist: 138, kind: 'petal', color: '#F43F5E', delay: '30ms' },
  { angle: 338, dist: 152, kind: 'star', color: '#FEF08A', delay: '60ms' },
] as const;

const RUNAWAY_SPOTS = [
  { x: 0, y: 0 },
  { x: 52, y: -22 },
  { x: -58, y: 18 },
  { x: 46, y: 24 },
  { x: -48, y: -20 },
  { x: 18, y: 28 },
  { x: -34, y: -12 },
] as const;

function ConservatoryBackdrop({ intensified = false }: { intensified?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Deep Midnight-Indigo & Rose-Velvet Gradient Sky */}
      <div
        className="absolute inset-0"
        style={{
          background: intensified
            ? 'radial-gradient(circle at 50% 18%, #521B4D 0%, #24103B 46%, #110922 78%, #070513 100%)'
            : 'radial-gradient(circle at 50% 14%, #3D1746 0%, #1B0E32 48%, #0D081E 82%, #070512 100%)',
        }}
      />

      {/* Soft Rose-Velvet & Moonlight Mist Halos */}
      <div
        className="absolute -top-12 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(253,230,138,0.18) 0%, rgba(244,63,94,0.08) 55%, transparent 75%)' }}
      />
      <div
        className="absolute bottom-0 left-0 h-56 w-56 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(190,24,93,0.22) 0%, transparent 72%)' }}
      />
      <div
        className="absolute bottom-10 right-0 h-56 w-56 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 72%)' }}
      />

      {/* Twinkling Constellation Sky SVG */}
      <svg
        viewBox="0 0 100 70"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 h-[58%] w-full opacity-90"
      >
        <path
          d="M12 14 L24 9 L36 18 L49 11 L63 16 L77 10 L88 20"
          fill="none"
          stroke="#FDE68A"
          strokeOpacity="0.16"
          strokeWidth="0.22"
          strokeDasharray="1.2 1.4"
        />
        {CONSTELLATION_STARS.map((star, idx) => (
          <circle
            key={`star-${idx}`}
            cx={star.cx}
            cy={star.cy}
            r={star.r * 0.45}
            fill={idx % 3 === 0 ? '#FEF08A' : '#FFF1F2'}
            className="wy-twinkle"
            style={{ animationDelay: star.delay }}
          />
        ))}
      </svg>

      {/* Victorian Botanical Glasshouse Arch Silhouette */}
      <svg
        viewBox="0 0 400 620"
        preserveAspectRatio="xMidYMin slice"
        className="absolute inset-0 h-full w-full opacity-45"
      >
        <defs>
          <linearGradient id="wy-arch-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#FDA4AF" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        {/* Outer pointed glasshouse arch */}
        <path
          d="M24 620 V210 C24 88 106 24 200 20 C294 24 376 88 376 210 V620"
          fill="none"
          stroke="url(#wy-arch-stroke)"
          strokeWidth="1.8"
        />
        {/* Inner botanical dome rib */}
        <path
          d="M44 620 V218 C44 108 116 48 200 44 C284 48 356 108 356 218 V620"
          fill="none"
          stroke="url(#wy-arch-stroke)"
          strokeWidth="1"
        />
        {/* Radial glasshouse spokes */}
        <line x1="200" y1="20" x2="200" y2="155" stroke="url(#wy-arch-stroke)" strokeWidth="0.9" />
        <line x1="200" y1="44" x2="88" y2="148" stroke="url(#wy-arch-stroke)" strokeWidth="0.8" />
        <line x1="200" y1="44" x2="312" y2="148" stroke="url(#wy-arch-stroke)" strokeWidth="0.8" />
        <path
          d="M44 195 Q200 135 356 195"
          fill="none"
          stroke="url(#wy-arch-stroke)"
          strokeWidth="0.9"
        />
        {/* Decorative top finial */}
        <circle cx="200" cy="44" r="5" fill="none" stroke="#FDE68A" strokeOpacity="0.45" strokeWidth="1" />
      </svg>

      {/* Luminous Crescent Moon */}
      <div className="wy-moon-glow absolute right-6 top-6 h-14 w-14 sm:right-9 sm:top-8 sm:h-16 sm:w-16">
        <svg viewBox="0 0 64 64" className="h-full w-full drop-shadow-[0_0_18px_rgba(253,230,138,0.65)]">
          <defs>
            <radialGradient id="wy-moon-fill" cx="35%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="65%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
          </defs>
          <path
            d="M39.5 11.5A21 21 0 1 0 53 41.2 17 17 0 1 1 39.5 11.5Z"
            fill="url(#wy-moon-fill)"
          />
          <path
            d="M47 16 L48.4 19.6 L52 21 L48.4 22.4 L47 26 L45.6 22.4 L42 21 L45.6 19.6 Z"
            fill="#FFFBEB"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Layered Botanical Vines & Fern Nature Art (Top-Left) */}
      <svg
        viewBox="0 0 180 220"
        className="wy-vine-sway absolute -left-2 -top-2 h-44 w-36 opacity-80 sm:h-52 sm:w-44"
        fill="none"
      >
        <path
          d="M12 0 C16 48 42 84 36 140 C33 166 20 190 14 214"
          stroke="#4ADE80"
          strokeOpacity="0.42"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M28 0 C50 34 86 44 128 32"
          stroke="#86EFAC"
          strokeOpacity="0.34"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Eucalyptus & fern leaves */}
        <ellipse cx="26" cy="40" rx="11" ry="5.5" transform="rotate(-24 26 40)" fill="#166534" fillOpacity="0.72" />
        <ellipse cx="44" cy="64" rx="12" ry="6" transform="rotate(20 44 64)" fill="#15803D" fillOpacity="0.68" />
        <ellipse cx="24" cy="96" rx="11" ry="5.5" transform="rotate(-32 24 96)" fill="#14532D" fillOpacity="0.78" />
        <ellipse cx="46" cy="122" rx="10" ry="5" transform="rotate(16 46 122)" fill="#166534" fillOpacity="0.66" />
        <ellipse cx="22" cy="158" rx="9" ry="4.5" transform="rotate(-22 22 158)" fill="#15803D" fillOpacity="0.62" />
        <ellipse cx="66" cy="34" rx="11" ry="5" transform="rotate(-14 66 34)" fill="#15803D" fillOpacity="0.65" />
        <ellipse cx="98" cy="36" rx="10" ry="4.8" transform="rotate(14 98 36)" fill="#166534" fillOpacity="0.62" />
        {/* Moonlit rosebuds on vine */}
        <circle cx="52" cy="54" r="5" fill="#FB7185" fillOpacity="0.82" />
        <circle cx="52" cy="54" r="2.2" fill="#FFE4E6" />
        <circle cx="116" cy="30" r="4.2" fill="#FDA4AF" fillOpacity="0.82" />
        <circle cx="30" cy="134" r="4.5" fill="#F43F5E" fillOpacity="0.78" />
      </svg>

      {/* Layered Botanical Fern & Blossom Art (Bottom-Right) */}
      <svg
        viewBox="0 0 190 190"
        className="wy-vine-sway-alt absolute -bottom-3 -right-3 h-40 w-40 opacity-75 sm:h-48 sm:w-48"
        fill="none"
      >
        <path
          d="M182 186 C152 142 130 106 86 78 C64 64 42 56 22 54"
          stroke="#4ADE80"
          strokeOpacity="0.38"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M178 184 C166 130 162 84 172 34"
          stroke="#86EFAC"
          strokeOpacity="0.32"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <ellipse cx="144" cy="138" rx="14" ry="6" transform="rotate(-48 144 138)" fill="#14532D" fillOpacity="0.78" />
        <ellipse cx="122" cy="112" rx="13" ry="5.8" transform="rotate(-38 122 112)" fill="#166534" fillOpacity="0.74" />
        <ellipse cx="94" cy="88" rx="12" ry="5.4" transform="rotate(-26 94 88)" fill="#15803D" fillOpacity="0.68" />
        <ellipse cx="62" cy="70" rx="10" ry="4.8" transform="rotate(-14 62 70)" fill="#166534" fillOpacity="0.62" />
        <ellipse cx="164" cy="108" rx="11" ry="5" transform="rotate(24 164 108)" fill="#15803D" fillOpacity="0.66" />
        <ellipse cx="164" cy="72" rx="10" ry="4.5" transform="rotate(-24 164 72)" fill="#166534" fillOpacity="0.62" />
        <circle cx="106" cy="96" r="5.5" fill="#FB7185" fillOpacity="0.8" />
        <circle cx="106" cy="96" r="2.3" fill="#FFF1F2" />
        <circle cx="158" cy="54" r="4.2" fill="#FDA4AF" fillOpacity="0.8" />
      </svg>

      {/* Drifting Golden Fireflies */}
      {FIREFLIES.map((fly, idx) => (
        <span
          key={`fly-${idx}`}
          className="wy-firefly absolute rounded-full"
          style={{
            left: fly.left,
            top: fly.top,
            width: `${fly.size}px`,
            height: `${fly.size}px`,
            backgroundColor: '#FEF08A',
            boxShadow: '0 0 12px 3px rgba(253, 224, 71, 0.72)',
            animationDelay: fly.delay,
            animationDuration: fly.duration,
          }}
        />
      ))}

      {/* Falling Sakura / Rose Petals */}
      {FALLING_PETALS.map((petal, idx) => (
        <svg
          key={`petal-${idx}`}
          viewBox="0 0 20 20"
          className="wy-petal-fall absolute -top-6 h-4 w-4"
          style={{
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
            transform: `scale(${petal.scale})`,
          }}
        >
          <path
            d="M10 2 C15 4 17 11 10 18 C3 11 5 4 10 2 Z"
            fill={petal.shade}
            fillOpacity="0.72"
          />
        </svg>
      ))}
    </div>
  );
}

/** Expressive Die-Cut Cat Meme Companion Sticker (5 reactive moods: 0 idle, 1..4 runaway reactions, 5 purring celebration) */
function CatMemeSticker({ mood, caption }: { mood: 0 | 1 | 2 | 3 | 4 | 5; caption: string }) {
  const isHindi = hasDevanagari(caption);

  return (
    <div
      key={`cat-mood-${mood}`}
      className="wy-sticker-pop relative mx-auto inline-flex flex-col items-center"
    >
      {/* Die-cut white vinyl sticker container */}
      <div className="relative flex h-28 w-28 items-center justify-center rounded-[28px] border-[3px] border-[#FFFDF9] bg-gradient-to-b from-[#FFF9F4] via-[#FFF1F5] to-[#FDE8EF] shadow-[0_14px_30px_-10px_rgba(0,0,0,0.65),0_0_24px_-6px_rgba(253,164,175,0.45)]">
        <svg viewBox="0 0 120 120" className="h-24 w-24" aria-hidden="true">
          {/* Soft floor shadow */}
          <ellipse cx="60" cy="106" rx="34" ry="6" fill="#F43F5E" fillOpacity="0.14" />

          {/* Cat ears */}
          <path d="M29 52 L24 22 L50 38 Z" fill="#FFFDF9" stroke="#3B1D2E" strokeWidth="3" strokeLinejoin="round" />
          <path d="M32 45 L29 29 L44 39 Z" fill="#FDA4AF" />
          <path d="M91 52 L96 22 L70 38 Z" fill="#FFFDF9" stroke="#3B1D2E" strokeWidth="3" strokeLinejoin="round" />
          <path d="M88 45 L91 29 L76 39 Z" fill="#FDA4AF" />

          {/* Round chubby cat head & body */}
          <ellipse cx="60" cy="68" rx="36" ry="32" fill="#FFFDF9" stroke="#3B1D2E" strokeWidth="3" />

          {/* Subtle forehead tabby stripes */}
          <path d="M55 38 L55 44 M60 36 L60 44 M65 38 L65 44" stroke="#E5C8B8" strokeWidth="2.4" strokeLinecap="round" />

          {/* Rosy blush cheeks */}
          <ellipse cx="36" cy="74" rx="7" ry="4.2" fill="#FB7185" fillOpacity="0.45" />
          <ellipse cx="84" cy="74" rx="7" ry="4.2" fill="#FB7185" fillOpacity="0.45" />

          {/* Whiskers */}
          <path
            d="M19 67 L30 69 M18 74 L30 74 M101 67 L90 69 M102 74 L90 74"
            stroke="#3B1D2E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />

          {/* Tiny nose & mouth */}
          <path d="M57 69 L63 69 L60 72 Z" fill="#F43F5E" />
          {mood === 1 || mood === 3 ? (
            /* Pleading wobbly 'w' mouth */
            <path
              d="M53 77 Q56.5 73 60 76 Q63.5 73 67 77"
              fill="none"
              stroke="#3B1D2E"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          ) : (
            /* Sweet happy ':3' cat smile */
            <path
              d="M52 74 Q56 79 60 74 Q64 79 68 74"
              fill="none"
              stroke="#3B1D2E"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          )}

          {/* Mood-specific Eyes & Accessories */}
          {mood === 0 ? (
            /* Mood 0: Sweet hopeful cat with floating little heart */
            <>
              <circle cx="45" cy="61" r="5.2" fill="#2A1422" />
              <circle cx="43.5" cy="59.2" r="2" fill="#FFFFFF" />
              <circle cx="75" cy="61" r="5.2" fill="#2A1422" />
              <circle cx="73.5" cy="59.2" r="2" fill="#FFFFFF" />
              <path
                d="M95 30 C95 26 101 26 101 30 C101 34 95 38 95 38 C95 38 89 34 89 30 C89 26 95 26 95 30 Z"
                fill="#F43F5E"
              />
            </>
          ) : null}

          {mood === 1 ? (
            /* Mood 1: Giant starry pleading galaxy eyes */
            <>
              <circle cx="44" cy="60" r="9.5" fill="#1F1029" />
              <circle cx="41" cy="56.5" r="3.6" fill="#FFFFFF" />
              <circle cx="47.5" cy="63.5" r="1.8" fill="#FEF08A" />
              <path d="M44 59 L45 61 L47 62 L45 63 L44 65 L43 63 L41 62 L43 61 Z" fill="#FBCFE8" />

              <circle cx="76" cy="60" r="9.5" fill="#1F1029" />
              <circle cx="73" cy="56.5" r="3.6" fill="#FFFFFF" />
              <circle cx="79.5" cy="63.5" r="1.8" fill="#FEF08A" />
              <path d="M76 59 L77 61 L79 62 L77 63 L76 65 L75 63 L73 62 L75 61 Z" fill="#FBCFE8" />

              {/* Tiny tear shimmer */}
              <circle cx="35.5" cy="68.5" r="2.2" fill="#93C5FD" />
              <circle cx="84.5" cy="68.5" r="2.2" fill="#93C5FD" />
            </>
          ) : null}

          {mood === 2 ? (
            /* Mood 2: Holding a tiny glowing rose */
            <>
              <circle cx="45" cy="60" r="6" fill="#2A1422" />
              <circle cx="43.5" cy="58" r="2.3" fill="#FFFFFF" />
              <circle cx="75" cy="60" r="6" fill="#2A1422" />
              <circle cx="73.5" cy="58" r="2.3" fill="#FFFFFF" />
              {/* Tiny paws holding rose */}
              <ellipse cx="47" cy="91" rx="8" ry="6" fill="#FFFDF9" stroke="#3B1D2E" strokeWidth="2.5" />
              <ellipse cx="73" cy="91" rx="8" ry="6" fill="#FFFDF9" stroke="#3B1D2E" strokeWidth="2.5" />
              {/* Rose stem & bloom */}
              <path d="M60 98 L64 78" stroke="#16A34A" strokeWidth="2.8" strokeLinecap="round" />
              <ellipse cx="58" cy="88" rx="5" ry="2.6" transform="rotate(-25 58 88)" fill="#22C55E" />
              <circle cx="65" cy="75" r="7.5" fill="#E11D48" stroke="#881337" strokeWidth="1.5" />
              <path d="M62 74 Q65 71 68 74 Q65 78 62 74 Z" fill="#FDA4AF" />
            </>
          ) : null}

          {mood === 3 ? (
            /* Mood 3: Dramatic tiny paw reaching out + "pls?" speech tag */
            <>
              <circle cx="44" cy="60" r="7.5" fill="#1F1029" />
              <circle cx="42" cy="57.5" r="2.8" fill="#FFFFFF" />
              <circle cx="46.5" cy="62.5" r="1.4" fill="#FFFFFF" />
              <circle cx="76" cy="60" r="7.5" fill="#1F1029" />
              <circle cx="74" cy="57.5" r="2.8" fill="#FFFFFF" />
              <circle cx="78.5" cy="62.5" r="1.4" fill="#FFFFFF" />

              {/* Dramatic tiny outstretched paw with pink toe beans */}
              <circle cx="88" cy="88" r="13" fill="#FFFDF9" stroke="#3B1D2E" strokeWidth="2.6" />
              <ellipse cx="88" cy="91" rx="5" ry="3.8" fill="#FDA4AF" />
              <circle cx="82.5" cy="84" r="2.2" fill="#FDA4AF" />
              <circle cx="88" cy="82" r="2.2" fill="#FDA4AF" />
              <circle cx="93.5" cy="84" r="2.2" fill="#FDA4AF" />

              {/* Mini comic speech badge "pls?" */}
              <rect x="6" y="10" width="38" height="20" rx="10" fill="#FFF1F2" stroke="#F43F5E" strokeWidth="2" />
              <text
                x="25"
                y="23.5"
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="800"
                fill="#BE123C"
                fontFamily="monospace"
              >
                pls?
              </text>
            </>
          ) : null}

          {mood === 4 ? (
            /* Mood 4: Heart-shaped glossy pink sunglasses */
            <>
              {/* Glasses bridge */}
              <line x1="54" y1="60" x2="66" y2="60" stroke="#9F1239" strokeWidth="2.8" />
              {/* Left heart lens */}
              <path
                d="M44 55 C44 51 35 51 35 57 C35 64 44 70 44 70 C44 70 53 64 53 57 C53 51 44 51 44 55 Z"
                fill="#F43F5E"
                stroke="#881337"
                strokeWidth="2.2"
              />
              <path d="M38.5 57 L41.5 54.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              {/* Right heart lens */}
              <path
                d="M76 55 C76 51 67 51 67 57 C67 64 76 70 76 70 C76 70 85 64 85 57 C85 51 76 51 76 55 Z"
                fill="#F43F5E"
                stroke="#881337"
                strokeWidth="2.2"
              />
              <path d="M70.5 57 L73.5 54.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              {/* Star sparkle near glasses */}
              <path d="M98 22 L100 27 L105 29 L100 31 L98 36 L96 31 L91 29 L96 27 Z" fill="#F59E0B" />
            </>
          ) : null}

          {mood === 5 ? (
            /* Mood 5: Celebratory purring cat with flower crown */
            <>
              {/* Happy closed purring eyes */}
              <path d="M37 62 Q44 54 51 62" fill="none" stroke="#3B1D2E" strokeWidth="3" strokeLinecap="round" />
              <path d="M69 62 Q76 54 83 62" fill="none" stroke="#3B1D2E" strokeWidth="3" strokeLinecap="round" />
              {/* Botanical flower crown */}
              <ellipse cx="42" cy="34" rx="7" ry="3.5" transform="rotate(-18 42 34)" fill="#22C55E" />
              <ellipse cx="78" cy="34" rx="7" ry="3.5" transform="rotate(18 78 34)" fill="#22C55E" />
              <circle cx="48" cy="34" r="6" fill="#FDA4AF" stroke="#BE123C" strokeWidth="1.4" />
              <circle cx="48" cy="34" r="2.2" fill="#FEF08A" />
              <circle cx="60" cy="30" r="7" fill="#F43F5E" stroke="#881337" strokeWidth="1.5" />
              <circle cx="60" cy="30" r="2.5" fill="#FEF08A" />
              <circle cx="72" cy="34" r="6" fill="#FBCFE8" stroke="#BE123C" strokeWidth="1.4" />
              <circle cx="72" cy="34" r="2.2" fill="#F59E0B" />
              {/* Floating twin hearts */}
              <path
                d="M18 34 C18 31 23 31 23 34 C23 37.5 18 40.5 18 40.5 C18 40.5 13 37.5 13 34 C13 31 18 31 18 34 Z"
                fill="#F43F5E"
              />
              <path
                d="M102 32 C102 29 107 29 107 32 C107 35.5 102 38.5 102 38.5 C102 38.5 97 35.5 97 32 C97 29 102 29 102 32 Z"
                fill="#FDE68A"
              />
            </>
          ) : null}
        </svg>
      </div>

      {/* Tiny 2-word sticker caption pill */}
      <span
        className={`-mt-2.5 inline-flex items-center rounded-full border border-[#FDE68A]/55 bg-[#1B0C2E]/95 px-3 py-0.5 text-[11px] font-bold text-[#FDE68A] shadow-md ${
          isHindi ? 'tracking-normal' : 'tracking-wider'
        }`}
      >
        {caption}
      </span>
    </div>
  );
}

/** Tiny SVG Heart Pin for Polaroid corners */
function HeartPinSvg({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true">
      <path d="M10 17.2 8.7 16C4.2 12 1.5 9.5 1.5 6.4 1.5 3.9 3.4 2 5.9 2c1.4 0 2.8.7 3.6 1.8h1c.8-1.1 2.2-1.8 3.6-1.8 2.5 0 4.4 1.9 4.4 4.4 0 3.1-2.7 5.6-7.2 9.6L10 17.2Z" />
    </svg>
  );
}

/** Offline-safe botanical vignette fallback if a polaroid photo fails to load */
function PolaroidBotanicalFallback({ index }: { index: number }) {
  const palettes = [
    ['#2A113B', '#581C4B', '#FDE68A'],
    ['#1F1035', '#4C1D57', '#FDA4AF'],
    ['#2B1232', '#6B1D45', '#FBCFE8'],
  ] as const;
  const [bg1, bg2, accent] = palettes[index % palettes.length];
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: `linear-gradient(145deg, ${bg1}, ${bg2})` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="h-10 w-10">
        <path
          d="M32 50 C20 40 14 33 14 25 C14 18 19.5 14 25 14 C28.5 14 30.8 16 32 18.2 C33.2 16 35.5 14 39 14 C44.5 14 50 18 50 25 C50 33 44 40 32 50 Z"
          fill={accent}
          fillOpacity="0.85"
        />
      </svg>
    </div>
  );
}

/**
 * Moonlit Botanical Conservatory & Cat-Meme Proposal Experience (`will-you-01`)
 * Stage 1: Wax-Sealed Botanical Envelope Cover with smooth unfold transition
 * Stage 2: Minimal Poetic Note, 3-Polaroid Keepsake Strip & Interactive Cat-Meme Runaway "No" Ask
 * Stage 3: Luminous Golden-Petal & Starlight Burst + Constellation Promise Keepsake Ticket
 */
export function WillYouSite({
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const [stage, setStage] = useState<'cover' | 'opening' | 'question' | 'accepted'>('cover');
  const [nudgeCount, setNudgeCount] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const [showBurst, setShowBurst] = useState(false);
  const [failedPhotos, setFailedPhotos] = useState<Record<string, boolean>>({});
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);

  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDodgeRef = useRef<number>(0);

  const coreLang = toCoreLanguageCode(language);
  const copy = COPY_BY_LANG[coreLang] ?? COPY_BY_LANG.en;
  const isHindi = coreLang === 'hi';

  const senderDisplay = (data.senderName || 'A').trim();
  const receiverDisplay = (data.receiverName || 'You').trim();
  const senderInitial = senderDisplay.charAt(0).toUpperCase() || 'A';
  const receiverInitial = receiverDisplay.charAt(0).toUpperCase() || 'Y';

  const rawHeadline = pickLocalizedText(data.headline, language).trim();
  const rawMessage = pickLocalizedText(data.message, language).trim();
  const headlineText = rawHeadline || copy.defaultHeadline;
  const messageText = rawMessage || copy.defaultMessage;

  const polaroids = useMemo(() => {
    const customPhotos = (data.photos ?? [])
      .map((src) => (typeof src === 'string' ? src.trim() : ''))
      .filter((src) => src.length > 0);

    if (customPhotos.length > 0) {
      return [0, 1, 2].map((idx) => {
        const customSrc = customPhotos[idx];
        if (customSrc) {
          return {
            src: customSrc,
            caption: `${copy.photoLabel} 0${idx + 1}`,
          };
        }
        const sample = SAMPLE_POLAROIDS[idx];
        return {
          src: sample.src,
          caption: sample.caption[coreLang],
        };
      });
    }

    return SAMPLE_POLAROIDS.map((sample) => ({
      src: sample.src,
      caption: sample.caption[coreLang],
    }));
  }, [copy.photoLabel, coreLang, data.photos]);

  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (zoomIdx === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setZoomIdx(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomIdx]);

  const triggerPetalBurst = useCallback(() => {
    setBurstKey((prev) => prev + 1);
    setShowBurst(true);
    if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    burstTimerRef.current = setTimeout(() => {
      setShowBurst(false);
    }, 1500);
  }, []);

  const handleUnfoldEnvelope = useCallback(() => {
    if (stage !== 'cover') return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(25);
    }
    setStage('opening');
    openTimerRef.current = setTimeout(() => {
      setStage('question');
      onOpened?.();
    }, 540);
  }, [onOpened, stage]);

  const handleDodgeNo = useCallback(() => {
    const now = Date.now();
    if (now - lastDodgeRef.current < 160) return;
    lastDodgeRef.current = now;
    setNudgeCount((prev) => prev + 1);
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(14);
    }
  }, []);

  const handleSayYes = useCallback(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([25, 40, 35]);
    }
    setStage('accepted');
    triggerPetalBurst();
  }, [triggerPetalBurst]);

  const handleReplayCover = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    setZoomIdx(null);
    setNudgeCount(0);
    setShowBurst(false);
    setStage('cover');
  }, []);

  const catMood: 0 | 1 | 2 | 3 | 4 =
    nudgeCount === 0 ? 0 : (((nudgeCount - 1) % 4) + 1) as 1 | 2 | 3 | 4;
  const catCaption =
    nudgeCount === 0
      ? copy.catIdleCaption
      : copy.catCaptions[(nudgeCount - 1) % copy.catCaptions.length];

  const dodgeSpot = RUNAWAY_SPOTS[nudgeCount % RUNAWAY_SPOTS.length];
  const yesScale = Math.min(1.16, 1 + nudgeCount * 0.032);
  const yesGlow = Math.min(38, 16 + nudgeCount * 5);

  const eyebrowClass = isHindi
    ? 'font-semibold tracking-normal text-[11px]'
    : 'font-mono text-[10px] font-bold uppercase tracking-[0.22em]';

  const polaroidTilts = ['-rotate-3', 'rotate-1', 'rotate-3'] as const;
  const washiTints = [
    'bg-[#FDA4AF]/70 -rotate-6',
    'bg-[#FDE68A]/70 rotate-3',
    'bg-[#C4B5FD]/70 -rotate-3',
  ] as const;

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-x-clip overflow-y-hidden rounded-[28px] bg-[#080514] text-[#FFF7F5]">
      {/* Scoped Keyframes with prefers-reduced-motion support */}
      <style>{`
        @keyframes wy-twinkle {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.25); }
        }
        @keyframes wy-firefly {
          0%, 100% { transform: translate(0px, 0px) scale(0.85); opacity: 0.28; }
          35% { transform: translate(12px, -22px) scale(1.15); opacity: 0.95; }
          70% { transform: translate(-10px, -40px) scale(0.95); opacity: 0.65; }
        }
        @keyframes wy-petal-fall {
          0% { transform: translate3d(0, -10%, 0) rotate(0deg); opacity: 0; }
          12% { opacity: 0.8; }
          85% { opacity: 0.7; }
          100% { transform: translate3d(-44px, 560px, 0) rotate(240deg); opacity: 0; }
        }
        @keyframes wy-vine-sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2.4deg); }
        }
        @keyframes wy-moon-glow {
          0%, 100% { transform: scale(1); opacity: 0.92; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        @keyframes wy-float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes wy-sticker-pop {
          0% { transform: scale(0.82) rotate(-4deg); opacity: 0.4; }
          65% { transform: scale(1.06) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes wy-fade-up {
          0% { opacity: 0; transform: translateY(14px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wy-burst-out {
          0% { transform: translate(-50%, -50%) translate(0px, 0px) scale(0.3) rotate(0deg); opacity: 1; }
          75% { opacity: 0.95; }
          100% { transform: translate(-50%, -50%) translate(var(--wy-tx), var(--wy-ty)) scale(1.15) rotate(180deg); opacity: 0; }
        }
        .wy-twinkle { animation: wy-twinkle 3.2s ease-in-out infinite; transform-origin: center; }
        .wy-firefly { animation: wy-firefly 8s ease-in-out infinite; }
        .wy-petal-fall { animation: wy-petal-fall 12s linear infinite; }
        .wy-vine-sway { animation: wy-vine-sway 7.5s ease-in-out infinite; transform-origin: top left; }
        .wy-vine-sway-alt { animation: wy-vine-sway 8.5s ease-in-out infinite reverse; transform-origin: bottom right; }
        .wy-moon-glow { animation: wy-moon-glow 5.5s ease-in-out infinite; }
        .wy-float-slow { animation: wy-float-slow 4.6s ease-in-out infinite; }
        .wy-sticker-pop { animation: wy-sticker-pop 380ms cubic-bezier(0.22, 1.25, 0.36, 1) both; }
        .wy-fade-up { animation: wy-fade-up 520ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .wy-burst-particle { animation: wy-burst-out 1350ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .wy-twinkle,
          .wy-firefly,
          .wy-petal-fall,
          .wy-vine-sway,
          .wy-vine-sway-alt,
          .wy-moon-glow,
          .wy-float-slow,
          .wy-sticker-pop,
          .wy-fade-up,
          .wy-burst-particle {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Detailed Animated Moonlit Conservatory Background */}
      <ConservatoryBackdrop intensified={stage === 'accepted'} />

      {/* Watermark Strip (when in free preview mode) */}
      {watermarked ? (
        <div
          aria-hidden="true"
          className="relative z-30 flex justify-center bg-[#1E0D2E]/90 py-1 font-mono text-[10px] font-bold tracking-widest text-[#FBCFE8]"
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      {/* Luminous Golden-Petal & Starlight Burst Overlay */}
      {showBurst ? (
        <div
          key={`burst-${burstKey}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-50 overflow-hidden"
        >
          {BURST_PARTICLES.map((p, idx) => {
            const rad = (p.angle * Math.PI) / 180;
            const tx = `${Math.round(Math.cos(rad) * p.dist)}px`;
            const ty = `${Math.round(Math.sin(rad) * p.dist)}px`;
            return (
              <span
                key={`bp-${idx}`}
                className="wy-burst-particle absolute left-1/2 top-1/2"
                style={
                  {
                    '--wy-tx': tx,
                    '--wy-ty': ty,
                    animationDelay: p.delay,
                  } as React.CSSProperties
                }
              >
                {p.kind === 'star' ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill={p.color}>
                    <path d="M12 2 L14.4 9.2 L22 12 L14.4 14.8 L12 22 L9.6 14.8 L2 12 L9.6 9.2 Z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" className="h-5 w-5" fill={p.color}>
                    <path d="M10 2 C15 4.5 17 11 10 18 C3 11 5 4.5 10 2 Z" />
                  </svg>
                )}
              </span>
            );
          })}
        </div>
      ) : null}

      {/* =====================================================================
          STAGE 1: WAX-SEALED BOTANICAL ENVELOPE COVER
         ===================================================================== */}
      {stage === 'cover' || stage === 'opening' ? (
        <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-10 text-center">
          <span
            className={`inline-flex items-center gap-2 rounded-full border border-[#FDE68A]/35 bg-[#1B0D30]/75 px-3.5 py-1 text-[#FDE68A] backdrop-blur-xs ${eyebrowClass}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#FDA4AF]" aria-hidden="true" />
            {copy.coverEyebrow}
          </span>

          <p
            className={`mt-3 font-heading text-lg text-[#FFF1F2]/95 sm:text-xl ${
              isHindi ? 'not-italic tracking-normal' : 'italic tracking-wide'
            }`}
          >
            {copy.coverPrompt}
          </p>

          {/* Tactile Cream-Parchment Envelope with Pressed Flower Sprig & Crimson Wax Seal */}
          <div className="wy-float-slow relative my-7 w-full max-w-[308px]" style={{ perspective: '900px' }}>
            <button
              type="button"
              onClick={handleUnfoldEnvelope}
              disabled={stage === 'opening'}
              aria-label={copy.tapSealHint}
              className={`group relative block w-full cursor-pointer overflow-visible rounded-[22px] border border-[#F5E6D3]/75 bg-gradient-to-br from-[#FAF3E8] via-[#F2E5D3] to-[#E7D4BC] px-6 pb-7 pt-16 text-center text-[#3B1D2B] shadow-[0_30px_60px_-14px_rgba(0,0,0,0.82),0_0_32px_-8px_rgba(253,230,138,0.28)] transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] ${
                stage === 'opening' ? 'scale-105 opacity-0' : 'opacity-100'
              }`}
            >
              {/* Delicate gold-foil inner border */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-2.5 rounded-[16px] border border-[#C69C6D]/45"
              />

              {/* Top Triangular Envelope Flap (flips open on unfold) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-20 origin-top rounded-t-[22px] border-b border-[#D6BA9E]/70 bg-gradient-to-b from-[#FFFBF4] to-[#EBD8C2] transition-transform duration-500"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 50% 96%)',
                  transform: stage === 'opening' ? 'rotateX(165deg)' : 'rotateX(0deg)',
                }}
              />

              {/* Pressed Botanical Flower Sprig tucked under the wax seal */}
              <svg
                viewBox="0 0 110 64"
                className="pointer-events-none absolute left-1/2 top-7 h-16 w-28 -translate-x-1/2 -rotate-6"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M18 46 C38 36 62 28 92 16"
                  stroke="#3F6212"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <ellipse cx="36" cy="36" rx="7" ry="3.2" transform="rotate(-32 36 36)" fill="#4D7C0F" fillOpacity="0.82" />
                <ellipse cx="74" cy="24" rx="7.5" ry="3.4" transform="rotate(12 74 24)" fill="#4D7C0F" fillOpacity="0.82" />
                <ellipse cx="86" cy="14" rx="5.5" ry="2.6" transform="rotate(-24 86 14)" fill="#65A30D" fillOpacity="0.85" />
                {/* Tiny dried lavender & rosebud dots */}
                <circle cx="94" cy="15" r="3.4" fill="#FB7185" />
                <circle cx="88" cy="22" r="2.6" fill="#FDA4AF" />
                <circle cx="23" cy="43" r="2.5" fill="#FDE68A" />
              </svg>

              {/* Scalloped Crimson Botanical Wax Seal */}
              <div
                aria-hidden="true"
                className={`relative z-10 mx-auto -mt-5 mb-3.5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#FDA4AF]/55 bg-gradient-to-br from-[#E11D48] via-[#BE123C] to-[#881337] text-[#FFF1F2] shadow-[0_8px_20px_rgba(136,19,55,0.55),inset_0_2px_4px_rgba(255,255,255,0.28)] transition-transform duration-300 group-hover:scale-110 ${
                  stage === 'opening' ? 'scale-125 opacity-0' : ''
                }`}
              >
                <span className="font-heading text-xs font-bold tracking-wider">
                  {senderInitial}&amp;{receiverInitial}
                </span>
              </div>

              <p
                className={`break-words font-heading text-2xl font-bold text-[#2B1424] ${
                  hasDevanagari(receiverDisplay) || isHindi ? 'not-italic tracking-normal' : 'italic'
                }`}
              >
                {copy.forPrefix} {receiverDisplay}
              </p>
              <p className="mt-1.5 break-words text-xs font-medium text-[#6B4253]">
                {copy.fromPrefix} <span className="font-bold text-[#4A2033]">{senderDisplay}</span>
              </p>
            </button>
          </div>

          <button
            type="button"
            onClick={handleUnfoldEnvelope}
            disabled={stage === 'opening'}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#FDE68A]/35 bg-[#1C0D30]/80 px-5 py-2 text-xs font-semibold text-[#FDE68A] backdrop-blur-sm transition hover:bg-[#2A1447] active:scale-95"
          >
            <HeartPinSvg className="h-3.5 w-3.5 text-[#FDA4AF]" />
            <span>{stage === 'opening' ? copy.openingLabel : copy.tapSealHint}</span>
          </button>
        </main>
      ) : null}

      {/* =====================================================================
          STAGE 2 & STAGE 3 HEADER BAR
         ===================================================================== */}
      {stage === 'question' || stage === 'accepted' ? (
        <header className="relative z-20 flex items-center justify-between gap-2 border-b border-white/10 bg-[#120822]/75 px-4 py-2.5 backdrop-blur-md">
          <span className="inline-flex min-h-[34px] max-w-[62%] items-center gap-1.5 truncate rounded-full border border-[#FDA4AF]/30 bg-[#24103A]/85 px-3 py-1 text-xs font-medium text-[#FBCFE8]">
            <HeartPinSvg className="h-3 w-3 shrink-0 text-[#FB7185]" />
            <span className="truncate">
              {senderDisplay} &amp; {receiverDisplay}
            </span>
          </span>

          <button
            type="button"
            onClick={handleReplayCover}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 px-3.5 text-xs font-semibold text-[#FFF7F5] transition hover:bg-white/15 active:scale-95"
          >
            {getReplayLabel(language)}
          </button>
        </header>
      ) : null}

      {/* =====================================================================
          STAGE 2: MOONLIT GARDEN — POETIC NOTE, POLAROIDS & CAT MEME ASK
         ===================================================================== */}
      {stage === 'question' ? (
        <main className="wy-fade-up relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pb-6 pt-5">
          {/* Minimal Poetic Headline & Heartfelt Note */}
          <section className="relative overflow-hidden rounded-[26px] border border-[#FDE68A]/25 bg-[#160B2A]/75 px-5 py-5 text-center shadow-[0_20px_50px_-18px_rgba(0,0,0,0.75)] backdrop-blur-md">
            <h1
              className={`break-words font-heading text-2xl font-bold leading-snug text-[#FFF7ED] sm:text-[26px] ${
                hasDevanagari(headlineText) || isHindi ? 'not-italic tracking-normal' : 'italic'
              }`}
            >
              {headlineText}
            </h1>
            <div
              className="mx-auto my-3 h-px w-16 bg-gradient-to-r from-transparent via-[#FDA4AF]/75 to-transparent"
              aria-hidden="true"
            />
            <p className="break-words text-sm leading-relaxed text-[#FDE8EF]/90">
              {messageText}
            </p>
          </section>

          {/* Interactive Proposal Card with Expressive Cat Meme Companion */}
          <section className="relative overflow-hidden rounded-[28px] border border-[#FDA4AF]/35 bg-gradient-to-b from-[#230F3A]/88 via-[#180B2C]/90 to-[#110722]/92 px-4 py-6 text-center shadow-[0_24px_56px_-16px_rgba(244,63,94,0.35)] backdrop-blur-md">
            <p className={`text-[#FDE68A]/90 ${eyebrowClass}`}>{copy.questionEyebrow}</p>

            {/* Expressive Illustrated Cat Meme Companion */}
            <div className="my-4">
              <CatMemeSticker mood={catMood} caption={catCaption} />
            </div>

            <h2
              className={`break-words font-heading text-xl font-bold text-[#FFF7ED] sm:text-2xl ${
                isHindi ? 'not-italic tracking-normal' : ''
              }`}
            >
              {copy.questionTitle}
            </h2>

            {/* Interactive Yes / Runaway No Stage */}
            <div className="relative mt-5 flex min-h-[104px] flex-wrap items-center justify-center gap-3.5 px-2 py-3">
              <button
                type="button"
                onClick={handleSayYes}
                style={{
                  transform: `scale(${yesScale})`,
                  boxShadow: `0 0 ${yesGlow}px rgba(244, 63, 94, 0.72)`,
                }}
                className="relative z-10 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F43F5E] via-[#E11D48] to-[#FB7185] px-7 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:brightness-110 active:scale-95"
              >
                <HeartPinSvg className="h-4 w-4 text-[#FFF1F2]" />
                <span>{copy.yesLabel}</span>
              </button>

              <button
                type="button"
                onClick={handleDodgeNo}
                onMouseEnter={handleDodgeNo}
                style={{
                  transform: `translate(${dodgeSpot.x}px, ${dodgeSpot.y}px)`,
                }}
                className="relative z-10 inline-flex min-h-[44px] min-w-[78px] items-center justify-center rounded-full border border-[#FBCFE8]/35 bg-white/10 px-4 py-2 text-xs font-semibold text-[#FDE8EF]/90 backdrop-blur-xs transition-transform duration-300 ease-out hover:bg-white/15"
              >
                {copy.noLabel}
              </button>
            </div>
          </section>

          {/* 3-Polaroid Keepsake Strip with Washi Tape & Tiny Heart Pins */}
          <section aria-label={copy.polaroidEyebrow} className="space-y-2.5 pt-1">
            <p className={`text-center text-[#FDA4AF]/85 ${eyebrowClass}`}>
              {copy.polaroidEyebrow}
            </p>

            <div className="grid grid-cols-3 gap-2.5 px-0.5">
              {polaroids.map((item, idx) => {
                const isFailed = Boolean(failedPhotos[item.src]);
                return (
                  <button
                    key={`polaroid-${idx}`}
                    type="button"
                    onClick={() => !isFailed && setZoomIdx(idx)}
                    aria-label={`${item.caption}`}
                    className={`group relative flex flex-col rounded-xl bg-[#FFFDF8] p-1.5 pb-3 text-left shadow-[0_14px_28px_-10px_rgba(0,0,0,0.72)] transition-all duration-300 hover:z-10 hover:rotate-0 hover:scale-105 active:scale-95 ${polaroidTilts[idx % polaroidTilts.length]}`}
                  >
                    {/* Translucent Pastel Washi Tape Strip */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute -top-2 left-1/2 h-3.5 w-10 -translate-x-1/2 rounded-[2px] backdrop-blur-[1px] ${washiTints[idx % washiTints.length]}`}
                    />
                    {/* Tiny Heart Pin */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFF1F2] text-[#E11D48] shadow-xs"
                    >
                      <HeartPinSvg className="h-3 w-3" />
                    </span>

                    <div className="aspect-square w-full overflow-hidden rounded-lg bg-[#241036]">
                      {isFailed ? (
                        <PolaroidBotanicalFallback index={idx} />
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.src}
                          alt={item.caption}
                          loading="lazy"
                          decoding="async"
                          onError={() =>
                            setFailedPhotos((prev) => ({ ...prev, [item.src]: true }))
                          }
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      )}
                    </div>

                    <span
                      className={`mt-1.5 block truncate text-center text-[10px] font-semibold text-[#4A2535] ${
                        hasDevanagari(item.caption) ? 'tracking-normal' : 'italic'
                      }`}
                    >
                      {item.caption}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      ) : null}

      {/* =====================================================================
          STAGE 3: "YES!" GRAND STARLIGHT BLOOM & CONSTELLATION KEEPSAKE TICKET
         ===================================================================== */}
      {stage === 'accepted' ? (
        <main className="wy-fade-up relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5 px-4 pb-6 pt-5">
          {/* Celebratory Purring Cat with Flower Crown */}
          <div className="wy-float-slow">
            <CatMemeSticker mood={5} caption={copy.yesLabel} />
          </div>

          {/* Constellation Promise Keepsake Ticket */}
          <section
            aria-label={copy.ticketEyebrow}
            className="relative w-full overflow-hidden rounded-[28px] border border-[#FDE68A]/50 bg-gradient-to-br from-[#261142]/92 via-[#180B2D]/94 to-[#0E071D]/96 p-5 text-[#FFF7ED] shadow-[0_28px_64px_-14px_rgba(244,63,94,0.48),0_0_32px_-10px_rgba(253,230,138,0.3)] backdrop-blur-md"
          >
            {/* Header row with stamp */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1.5 text-[#FDE68A] ${eyebrowClass}`}>
                <span className="h-2 w-2 rounded-full bg-[#FB7185]" aria-hidden="true" />
                {copy.ticketEyebrow}
              </span>

              <span
                className={`inline-block -rotate-2 rounded-md border border-[#FDA4AF]/65 bg-[#F43F5E]/20 px-2.5 py-0.5 text-[#FBCFE8] ${
                  isHindi ? 'text-[10px] font-bold tracking-normal' : 'font-mono text-[9.5px] font-bold tracking-[0.14em]'
                }`}
              >
                {copy.ticketStamp}
              </span>
            </div>

            <h2
              className={`mt-3 break-words font-heading text-2xl font-bold leading-snug text-[#FFF7ED] ${
                hasDevanagari(receiverDisplay) || isHindi ? 'not-italic tracking-normal' : 'italic'
              }`}
            >
              {copy.ticketTitle(receiverDisplay)}
            </h2>
            <p className="mt-1 break-words text-xs leading-relaxed text-[#FBCFE8]/90 sm:text-sm">
              {copy.ticketSubtitle(senderDisplay)}
            </p>

            {/* Constellation Connection Art with Both Names */}
            <div className="mt-4 rounded-2xl border border-[#FDE68A]/25 bg-black/30 px-4 py-4">
              <svg viewBox="0 0 260 66" className="mx-auto h-14 w-full" aria-hidden="true">
                <path
                  d="M42 42 Q130 6 218 42"
                  fill="none"
                  stroke="#FDE68A"
                  strokeOpacity="0.45"
                  strokeWidth="1.2"
                  strokeDasharray="3 4"
                />
                <circle cx="90" cy="24" r="2" fill="#FDE68A" fillOpacity="0.7" />
                <circle cx="130" cy="18" r="3" fill="#FDA4AF" />
                <circle cx="170" cy="24" r="2" fill="#FDE68A" fillOpacity="0.7" />
                {/* Star nodes for sender & receiver */}
                <circle cx="42" cy="42" r="14" fill="#2A1245" stroke="#FDE68A" strokeWidth="1.4" />
                <text
                  x="42"
                  y="46"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill="#FFF7ED"
                >
                  {senderInitial}
                </text>
                <circle cx="218" cy="42" r="14" fill="#2A1245" stroke="#FDA4AF" strokeWidth="1.4" />
                <text
                  x="218"
                  y="46"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill="#FFF7ED"
                >
                  {receiverInitial}
                </text>
              </svg>

              <div className="mt-1 flex items-center justify-between gap-2 text-xs font-bold">
                <span className="max-w-[44%] truncate text-[#FDE68A]">{senderDisplay}</span>
                <HeartPinSvg className="h-3.5 w-3.5 shrink-0 text-[#FB7185]" />
                <span className="max-w-[44%] truncate text-right text-[#FDA4AF]">
                  {receiverDisplay}
                </span>
              </div>
            </div>

            {/* Perforated Ticket Tear Line */}
            <div className="relative my-4 flex items-center" aria-hidden="true">
              <span className="-ml-8 h-6 w-6 shrink-0 rounded-full bg-[#0D071D]" />
              <span className="w-full border-t-2 border-dashed border-[#FDE68A]/35" />
              <span className="-mr-8 h-6 w-6 shrink-0 rounded-full bg-[#0D071D]" />
            </div>

            {/* Promise Footer & Actions */}
            <div className="text-center">
              <p className={`text-[#FDE68A]/80 ${eyebrowClass}`}>{copy.promiseLabel}</p>
              <p className="mt-1 break-words text-xs font-medium text-[#FFF1F2]/90">
                {copy.promiseValue}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={triggerPetalBurst}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F43F5E] to-[#FB7185] px-5 py-2 text-xs font-bold text-white shadow-[0_0_22px_rgba(244,63,94,0.5)] transition hover:brightness-110 active:scale-95"
                >
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                    <path d="M10 2 C15 4.5 17 11 10 18 C3 11 5 4.5 10 2 Z" />
                  </svg>
                  <span>{copy.petalShowerCta}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNudgeCount(0);
                    setStage('question');
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-[#FFF7ED] transition hover:bg-white/15 active:scale-95"
                >
                  {copy.askAgainCta}
                </button>
              </div>
            </div>
          </section>
        </main>
      ) : null}

      {/* Polaroid Lightbox Modal */}
      {zoomIdx !== null && polaroids[zoomIdx] ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={polaroids[zoomIdx].caption}
          onClick={() => setZoomIdx(null)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="wy-fade-up w-full max-w-sm rounded-2xl bg-[#FFFDF8] p-3 text-[#2B1424] shadow-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={polaroids[zoomIdx].src}
              alt={polaroids[zoomIdx].caption}
              className="max-h-[65dvh] w-full rounded-xl bg-[#1A0D2E] object-cover"
            />
            <div className="mt-2.5 flex items-center justify-between gap-2 px-1">
              <span
                className={`truncate text-xs font-bold text-[#4A2535] ${
                  hasDevanagari(polaroids[zoomIdx].caption) ? 'tracking-normal' : 'italic'
                }`}
              >
                {polaroids[zoomIdx].caption}
              </span>
              <button
                type="button"
                onClick={() => setZoomIdx(null)}
                className="min-h-[44px] rounded-full bg-[#E11D48] px-4 text-xs font-bold text-white transition hover:brightness-110 active:scale-95"
              >
                {copy.closeLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#0B0617]/60 px-4 py-3 text-center text-[11px] text-[#FBCFE8]/75 backdrop-blur-xs">
        {getWebzyFooterLabel(language)}
      </footer>
    </div>
  );
}
