'use client';

import React, { useId, useState } from 'react';
import { type CoreLanguageCode, pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import { playRaindropPluck } from './shared/OccasionCraftPrimitives';
import {
  getWebzyFooterLabel,
  OccasionPhotoGallery,
  type OccasionSiteProps,
} from './shared/OccasionPrimitives';

type TreatId = 'chai-boba' | 'wildflowers' | 'hug-coupon' | 'ice-cream';
type CatMood = 0 | 1 | 2 | 3;

interface TreatSpec {
  id: TreatId;
  label: Record<CoreLanguageCode, string>;
  tag: Record<CoreLanguageCode, string>;
}

const PEACE_TREATS: readonly TreatSpec[] = [
  {
    id: 'chai-boba',
    label: {
      en: 'Steaming Chai & Boba',
      hinglish: 'Garam Chai / Boba',
      hi: 'गरमा-गरम चाय / बोबा',
    },
    tag: {
      en: 'extra sweet',
      hinglish: 'bilkul garma-garam',
      hi: 'एकदम मीठी',
    },
  },
  {
    id: 'wildflowers',
    label: {
      en: 'Wildflower Bouquet',
      hinglish: 'Phoolon Ka Bouquet',
      hi: 'जंगली फूलों का गुलदस्ता',
    },
    tag: {
      en: 'fresh daisies',
      hinglish: 'taaze daisies',
      hi: 'ताज़े डेज़ी फूल',
    },
  },
  {
    id: 'hug-coupon',
    label: {
      en: 'Unlimited Hug Coupon',
      hinglish: 'Unlimited Hug Coupon',
      hi: 'अनगिनत झप्पी कूपन',
    },
    tag: {
      en: 'never expires',
      hinglish: 'no expiry',
      hi: 'हमेशा मान्य',
    },
  },
  {
    id: 'ice-cream',
    label: {
      en: 'Late-Night Ice Cream',
      hinglish: 'Late-Night Ice Cream',
      hi: 'देर रात की आइसक्रीम',
    },
    tag: {
      en: 'double scoop',
      hinglish: 'double scoop',
      hi: 'डबल स्कूप',
    },
  },
];

interface LocalizedCafeCopy {
  ariaLabel: string;
  previewBanner: string;
  cafeBadgeRain: string;
  cafeBadgeRainbow: string;
  forPrefix: string;
  defaultHeadline: (receiver: string) => string;
  defaultMessage: string;
  moodCaptions: readonly [string, string, string, string];
  meterLabel: string;
  meterReady: string;
  meterForgiven: string;
  trayHeading: string;
  trayHint: string;
  collectedTag: string;
  noteCoasterTag: string;
  photosTag: string;
  photoPrefix: string;
  forgiveCta: string;
  poutCta: string;
  poutReplies: readonly string[];
  forgivenBannerTitle: (receiver: string) => string;
  forgivenBannerSub: (sender: string) => string;
  replayWeatherCta: string;
}

const CAFE_COPY: Record<CoreLanguageCode, LocalizedCafeCopy> = {
  en: {
    ariaLabel: 'Rainy window cozy cat apology cafe',
    previewBanner: 'WEBZY FREE PREVIEW',
    cafeBadgeRain: 'RAINY WINDOW CAFE',
    cafeBadgeRainbow: 'GOLDEN RAINBOW SKY',
    forPrefix: 'For',
    defaultHeadline: (receiver) => `I am really sorry, ${receiver}`,
    defaultMessage: 'No excuses from me — just a warm apology, full ears, and all your favorite treats waiting.',
    moodCaptions: ['i messed up', 'chai truce?', 'almost forgiven?', 'yay!! besties forever'],
    meterLabel: 'Forgiveness Meter',
    meterReady: 'Hearts full — ready for sunshine?',
    meterForgiven: 'Storm cleared! Pure golden warmth.',
    trayHeading: 'Peace Offering Tray',
    trayHint: 'Tap treats to melt the rain clouds',
    collectedTag: 'Claimed',
    noteCoasterTag: 'APOLOGY COASTER',
    photosTag: 'FAVORITE KEEPSAKES',
    photoPrefix: 'Memory',
    forgiveCta: 'Okay, Forgiven!',
    poutCta: 'Still pouting a tiny bit',
    poutReplies: [
      'Fair! Adding extra whipped cream to the apology.',
      'Noted. Purring louder until the rain stops.',
      'Okay, double ice cream scoop unlocked too.',
    ],
    forgivenBannerTitle: (receiver) => `Sunshine is back, ${receiver}!`,
    forgivenBannerSub: (sender) => `${sender} promises gentler days and all your claimed treats.`,
    replayWeatherCta: 'Watch rain to rainbow again',
  },
  hinglish: {
    ariaLabel: 'Rainy window cozy cat apology cafe',
    previewBanner: 'WEBZY FREE PREVIEW',
    cafeBadgeRain: 'RAINY WINDOW CAFE',
    cafeBadgeRainbow: 'SUNSHINE & RAINBOW',
    forPrefix: 'Sirf',
    defaultHeadline: (receiver) => `Dil se sorry, ${receiver}`,
    defaultMessage: 'Koi bahana nahi — bas sachchi maafi, poora dhyan aur tumhare saare favorite treats ready hain.',
    moodCaptions: ['i messed up', 'chai truce?', 'almost forgiven?', 'yay!! besties forever'],
    meterLabel: 'Forgiveness Meter',
    meterReady: 'Dil pighal gaya — dhoop bulaayein?',
    meterForgiven: 'Baarish gayi! Ab bas golden sukoon.',
    trayHeading: 'Peace Offering Tray',
    trayHint: 'Treats tap karo aur baadal hatao',
    collectedTag: 'Mil gaya',
    noteCoasterTag: 'CHHOTA SA NOTE',
    photosTag: 'PYAARI YAADEIN',
    photoPrefix: 'Yaad',
    forgiveCta: 'Okay, Forgiven!',
    poutCta: 'Thoda sa aur gussa',
    poutReplies: [
      'Bilkul jayaz! Extra meethi chai add kar raha hoon.',
      'Samajh gaya. Billi aur zor se purr kar rahi hai.',
      'Theek hai, double scoop ice cream bhi pakki.',
    ],
    forgivenBannerTitle: (receiver) => `Dhoop wapas aa gayi, ${receiver}!`,
    forgivenBannerSub: (sender) => `${sender} sach mein khush hai — saare treats meri taraf se.`,
    replayWeatherCta: 'Baarish se rainbow phir dekho',
  },
  hi: {
    ariaLabel: 'बारिश की खिड़की और बिल्ली कैफ़े माफ़ी संदेश',
    previewBanner: 'WEBZY FREE PREVIEW',
    cafeBadgeRain: 'बारिश वाली खिड़की कैफ़े',
    cafeBadgeRainbow: 'सुनहरी धूप और इंद्रधनुष',
    forPrefix: 'प्रिय',
    defaultHeadline: (receiver) => `दिल से माफ़ी, ${receiver}`,
    defaultMessage: 'मेरी तरफ़ से कोई बहाना नहीं — बस सच्ची माफ़ी, पूरा ध्यान और आपकी पसंदीदा चीज़ें इंतज़ार कर रही हैं।',
    moodCaptions: ['मुझसे गलती हुई', 'चाय पर सुलह?', 'थोड़ा मान गए?', 'ये!! हमेशा के लिए दोस्त'],
    meterLabel: 'माफ़ी का मीटर',
    meterReady: 'दिल भर गया — अब धूप बुलाएं?',
    meterForgiven: 'बारिश थम गई! अब बस सुनहरी गर्माहट।',
    trayHeading: 'सुलह की ट्रे',
    trayHint: 'बादल हटाने के लिए ट्रीट्स पर टैप करें',
    collectedTag: 'चुन लिया',
    noteCoasterTag: 'दिल की बात',
    photosTag: 'प्यारी यादें',
    photoPrefix: 'याद',
    forgiveCta: 'ठीक है, माफ़ किया!',
    poutCta: 'अभी थोड़ा नाराज़ हूँ',
    poutReplies: [
      'बिल्कुल सही! चाय में थोड़ा और प्यार मिला रहा हूँ।',
      'ठीक है, बिल्ली और प्यारी नज़र से देख रही है।',
      'डबल स्कूप आइसक्रीम भी पक्की!',
    ],
    forgivenBannerTitle: (receiver) => `धूप फिर खिल उठी, ${receiver}!`,
    forgivenBannerSub: (sender) => `${sender} बहुत खुश है — अब हर दिन और ज़्यादा प्यारा होगा।`,
    replayWeatherCta: 'बारिश से इंद्रधनुष फिर देखें',
  },
};

const RAINDROPS = [
  { left: '6%', delay: '0s', duration: '1.15s', height: 26, opacity: 0.45 },
  { left: '14%', delay: '0.45s', duration: '1.35s', height: 34, opacity: 0.35 },
  { left: '22%', delay: '0.2s', duration: '1.05s', height: 22, opacity: 0.5 },
  { left: '31%', delay: '0.8s', duration: '1.4s', height: 30, opacity: 0.32 },
  { left: '40%', delay: '0.1s', duration: '1.2s', height: 28, opacity: 0.42 },
  { left: '49%', delay: '0.65s', duration: '1.1s', height: 24, opacity: 0.38 },
  { left: '58%', delay: '0.3s', duration: '1.3s', height: 32, opacity: 0.48 },
  { left: '67%', delay: '0.9s', duration: '1.18s', height: 26, opacity: 0.36 },
  { left: '76%', delay: '0.15s', duration: '1.28s', height: 30, opacity: 0.44 },
  { left: '85%', delay: '0.55s', duration: '1.08s', height: 24, opacity: 0.4 },
  { left: '93%', delay: '0.38s', duration: '1.32s', height: 28, opacity: 0.34 },
] as const;

const FAIRY_BULBS = [
  { cx: 28, cy: 20, delay: '0s' },
  { cx: 74, cy: 31, delay: '0.6s' },
  { cx: 124, cy: 37, delay: '1.2s' },
  { cx: 180, cy: 39, delay: '0.3s' },
  { cx: 236, cy: 37, delay: '0.9s' },
  { cx: 286, cy: 31, delay: '1.5s' },
  { cx: 332, cy: 20, delay: '0.4s' },
] as const;

const GOLDEN_SPARKLES = [
  { left: '12%', top: '16%', size: 16, delay: '0s' },
  { left: '84%', top: '14%', size: 14, delay: '0.7s' },
  { left: '20%', top: '38%', size: 12, delay: '1.3s' },
  { left: '88%', top: '34%', size: 18, delay: '0.4s' },
  { left: '10%', top: '66%', size: 14, delay: '1.1s' },
  { left: '90%', top: '62%', size: 13, delay: '0.2s' },
  { left: '52%', top: '11%', size: 15, delay: '0.9s' },
] as const;

function WatermarkBanner({ visible, label, sunlit }: { visible: boolean; label: string; sunlit: boolean }) {
  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative z-30 flex justify-center border-b py-1 text-[10px] font-semibold tracking-[0.2em] transition-colors duration-700 ${
        sunlit
          ? 'border-amber-900/10 bg-[#FFF7ED]/85 text-amber-900/75'
          : 'border-white/10 bg-[#141C2B]/85 text-amber-200/80'
      }`}
    >
      {label}
    </div>
  );
}

function SparkleStarSvg({ size = 14, color = '#FBBF24' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5C12.7 7.8 16.2 11.3 21.5 12C16.2 12.7 12.7 16.2 12 21.5C11.3 16.2 7.8 12.7 2.5 12C7.8 11.3 11.3 7.8 12 2.5Z"
        fill={color}
      />
    </svg>
  );
}

function TinyHeartSvg({
  filled,
  size = 16,
  fillColor = '#FB7185',
  strokeColor = '#FDA4AF',
}: {
  filled: boolean;
  size?: number;
  fillColor?: string;
  strokeColor?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20.4C12 20.4 4 15.1 4 9.2C4 6.5 6.1 4.5 8.6 4.5C10.1 4.5 11.4 5.3 12 6.5C12.6 5.3 13.9 4.5 15.4 4.5C17.9 4.5 20 6.5 20 9.2C20 15.1 12 20.4 12 20.4Z"
        fill={filled ? fillColor : 'transparent'}
        stroke={filled ? fillColor : strokeColor}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WeatherBadgeIcon({ sunlit }: { sunlit: boolean }) {
  if (sunlit) {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
        <path d="M3.5 14a6.5 6.5 0 0 1 13 0" stroke="#F472B6" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M5.7 14a4.3 4.3 0 0 1 8.6 0" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7.9 14a2.1 2.1 0 0 1 4.2 0" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
      <path
        d="M5.5 12.2h8.6a2.8 2.8 0 0 0 .4-5.57A4.2 4.2 0 0 0 6.5 5.8a3.2 3.2 0 0 0-1 6.4Z"
        fill="#93C5FD"
        fillOpacity="0.28"
        stroke="#BFDBFE"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M7.5 14.5l-.8 2M10.5 14.5l-.8 2M13.5 14.5l-.8 2" stroke="#93C5FD" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Animated Weather-Shifting Café Window Backdrop:
 * Smoothly transitions from Rainy Café Twilight (#1B2434 -> #2B3548) with falling diagonal rain,
 * glowing amber fairy lights & windowpane condensation into a Golden Sunset & Pastel Rainbow Sky
 * (#FFF1E6 -> #FDE2C8 -> #FBCFE8) with a glowing rainbow arch and drifting warm sparkles.
 */
function WeatherWindowBackdrop({
  warmth,
  sunlit,
}: {
  warmth: number;
  sunlit: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const rainOpacity = sunlit ? 0 : Math.max(0.18, 1 - warmth * 0.72);
  const rainbowOpacity = sunlit ? 1 : Math.max(0, (warmth - 0.35) * 0.75);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Layer 1: Cozy Moody Rainy Café Twilight Base */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(175deg, #1B2434 0%, #232E42 48%, #2B3548 100%)',
        }}
      />

      {/* Layer 2: Progressive Sunset Blush Warmth */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-out motion-reduce:transition-none"
        style={{
          opacity: sunlit ? 1 : warmth * 0.55,
          background: 'linear-gradient(170deg, #FFF1E6 0%, #FDE2C8 52%, #FBCFE8 100%)',
        }}
      />

      {/* Layer 3: Soft Pastel Rainbow Arch & Sunbeam Halo (emerges as storm clears) */}
      <div
        className="absolute inset-x-0 -top-6 transition-opacity duration-1000 ease-out motion-reduce:transition-none"
        style={{ opacity: rainbowOpacity }}
      >
        <svg viewBox="0 0 380 230" className="w-full" fill="none">
          <defs>
            <radialGradient id={`sun-glow-${uid}`} cx="50%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.65" />
              <stop offset="55%" stopColor="#FDBA74" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#FBCFE8" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="190" cy="95" rx="175" ry="95" fill={`url(#sun-glow-${uid})`} />
          <g className="mj-rainbow-glow">
            <path d="M22 205 A168 158 0 0 1 358 205" stroke="#FDA4AF" strokeOpacity="0.52" strokeWidth="14" strokeLinecap="round" />
            <path d="M36 205 A154 144 0 0 1 344 205" stroke="#FDBA74" strokeOpacity="0.52" strokeWidth="14" strokeLinecap="round" />
            <path d="M50 205 A140 130 0 0 1 330 205" stroke="#FDE68A" strokeOpacity="0.58" strokeWidth="14" strokeLinecap="round" />
            <path d="M64 205 A126 116 0 0 1 316 205" stroke="#A7F3D0" strokeOpacity="0.48" strokeWidth="14" strokeLinecap="round" />
            <path d="M78 205 A112 102 0 0 1 302 205" stroke="#BFDBFE" strokeOpacity="0.52" strokeWidth="14" strokeLinecap="round" />
            <path d="M92 205 A98 88 0 0 1 288 205" stroke="#DDD6FE" strokeOpacity="0.5" strokeWidth="13" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* Layer 4: Warm Café Amber Bokeh & Windowpane Condensation */}
      <div
        className="absolute -left-12 top-24 h-48 w-48 rounded-full blur-3xl transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.28) 0%, transparent 70%)',
          opacity: sunlit ? 0.55 : 0.72,
        }}
      />
      <div
        className="absolute -right-10 top-56 h-56 w-56 rounded-full blur-3xl transition-opacity duration-1000"
        style={{
          background: sunlit
            ? 'radial-gradient(circle, rgba(244,114,182,0.28) 0%, transparent 72%)'
            : 'radial-gradient(circle, rgba(253,186,116,0.22) 0%, transparent 72%)',
          opacity: 0.78,
        }}
      />
      {/* Misty windowpane condensation droplets (fade out when sunlit) */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: rainOpacity }}
      >
        <span className="absolute left-[11%] top-[22%] h-3 w-2.5 rounded-full border border-sky-100/25 bg-sky-100/10 blur-[0.5px]" />
        <span className="absolute right-[13%] top-[28%] h-4 w-3 rounded-full border border-amber-100/25 bg-amber-100/10 blur-[0.5px]" />
        <span className="absolute left-[82%] top-[54%] h-2.5 w-2 rounded-full border border-sky-100/25 bg-sky-100/10" />
        <span className="absolute left-[8%] top-[64%] h-3.5 w-2.5 rounded-full border border-amber-100/20 bg-amber-100/10 blur-[0.6px]" />
        <span className="absolute right-[22%] bottom-[16%] h-2.5 w-2 rounded-full border border-sky-100/20 bg-sky-100/10" />
      </div>

      {/* Layer 5: Animated Diagonal Raindrops */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 motion-reduce:hidden"
        style={{ opacity: rainOpacity }}
      >
        {RAINDROPS.map((drop, idx) => (
          <span
            key={`rain-${idx}`}
            className="mj-raindrop absolute -top-12 w-[1.5px] rounded-full bg-gradient-to-b from-transparent via-sky-200/80 to-sky-100"
            style={{
              left: drop.left,
              height: `${drop.height}px`,
              opacity: drop.opacity,
              animationDelay: drop.delay,
              animationDuration: drop.duration,
            }}
          />
        ))}
      </div>

      {/* Layer 6: Cozy Café String Fairy Lights along top window frame */}
      <svg viewBox="0 0 360 56" className="absolute inset-x-0 top-0 w-full opacity-95" fill="none">
        <path
          d="M-4 10 Q180 54 364 10"
          stroke={sunlit ? '#B45309' : '#64748B'}
          strokeOpacity={sunlit ? '0.28' : '0.45'}
          strokeWidth="1.4"
        />
        {FAIRY_BULBS.map((bulb, idx) => (
          <g key={`bulb-${idx}`} className="mj-twinkle" style={{ animationDelay: bulb.delay }}>
            <circle
              cx={bulb.cx}
              cy={bulb.cy}
              r={sunlit ? 9 : 12}
              fill={sunlit ? '#FDE68A' : '#FBBF24'}
              fillOpacity={sunlit ? '0.26' : '0.28'}
            />
            <circle
              cx={bulb.cx}
              cy={bulb.cy}
              r="3.2"
              fill={sunlit ? '#FFFBEB' : '#FEF3C7'}
            />
          </g>
        ))}
      </svg>

      {/* Layer 7: Drifting Warm Sparkles when Golden Rainbow Sky is active */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: sunlit ? 1 : warmth > 0.6 ? 0.4 : 0 }}
      >
        {GOLDEN_SPARKLES.map((sp, idx) => (
          <span
            key={`sp-${idx}`}
            className="mj-sparkle-float absolute"
            style={{ left: sp.left, top: sp.top, animationDelay: sp.delay }}
          >
            <SparkleStarSvg
              size={sp.size}
              color={idx % 2 === 0 ? '#F59E0B' : '#F472B6'}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Custom Illustrated Die-Cut Cat Meme Sticker with 4 Expressive Mood States:
 * Mood 0: Droopy-eared apologetic cat holding a tiny daisy
 * Mood 1: Peeking cat with shiny pleading starry eyes
 * Mood 2: Blushing cat offering a tiny glowing heart
 * Mood 3: Ecstatic purring cat with pastel rainbow halo & floating hearts
 */
function CatMemeSticker({
  mood,
  caption,
  sunlit,
}: {
  mood: CatMood;
  caption: string;
  sunlit: boolean;
}) {
  const uid = useId().replace(/:/g, '');

  return (
    <div className="flex flex-col items-center">
      {/* Die-cut sticker container */}
      <div
        key={`cat-mood-${mood}`}
        className="mj-cat-bob mj-pop-in relative flex h-44 w-44 items-center justify-center sm:h-48 sm:w-48"
      >
        {/* Soft aura behind sticker */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 rounded-full blur-2xl transition-colors duration-700"
          style={{
            background:
              mood === 3
                ? 'radial-gradient(circle, rgba(251,191,36,0.52) 0%, rgba(244,114,182,0.28) 65%, transparent 100%)'
                : mood === 2
                  ? 'radial-gradient(circle, rgba(251,113,133,0.34) 0%, transparent 72%)'
                  : 'radial-gradient(circle, rgba(253,230,138,0.24) 0%, transparent 72%)',
          }}
        />

        <svg
          viewBox="0 0 180 180"
          className="relative h-full w-full drop-shadow-[0_14px_24px_rgba(15,23,42,0.35)]"
          role="img"
          aria-label={caption}
        >
          <defs>
            <linearGradient id={`cat-fur-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFDF9" />
              <stop offset="100%" stopColor="#FDECD6" />
            </linearGradient>
            <linearGradient id={`rainbow-halo-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="33%" stopColor="#FBBF24" />
              <stop offset="66%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
          </defs>

          {/* Die-cut white sticker backing circle */}
          <circle
            cx="90"
            cy="96"
            r="68"
            fill="#FFFDF9"
            stroke={sunlit ? '#FDE68A' : '#FFFFFF'}
            strokeWidth="5"
          />
          <circle
            cx="90"
            cy="96"
            r="62"
            fill={
              mood === 3
                ? '#FFF7ED'
                : mood === 2
                  ? '#FFF1F2'
                  : mood === 1
                    ? '#FEFCE8'
                    : '#EFF6FF'
            }
          />

          {/* Mood 3: Pastel Rainbow Halo & Floating Hearts */}
          {mood === 3 ? (
            <g>
              <path
                d="M52 44 A38 22 0 0 1 128 44"
                fill="none"
                stroke={`url(#rainbow-halo-${uid})`}
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              <path
                d="M34 62 C34 59 38 59 38 62 C38 59 42 59 42 62 C42 66 38 68.5 38 68.5 C38 68.5 34 66 34 62 Z"
                fill="#FB7185"
              />
              <path
                d="M138 58 C138 55 142 55 142 58 C142 55 146 55 146 58 C146 62 142 64.5 142 64.5 C142 64.5 138 62 138 58 Z"
                fill="#F472B6"
              />
              <path
                d="M143 86 C143 84 145.5 84 145.5 86 C145.5 84 148 84 148 86 C148 88.5 145.5 90 145.5 90 C145.5 90 143 88.5 143 86 Z"
                fill="#FBBF24"
              />
            </g>
          ) : null}

          {/* Cat Ears (Droopy in Mood 0, Perked up in Moods 1-3) */}
          {mood === 0 ? (
            <g>
              {/* Left droopy ear */}
              <path
                d="M54 78 C40 74 34 86 42 96 C48 93 54 88 58 84 Z"
                fill="#F6D5B0"
                stroke="#5C4033"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Right droopy ear */}
              <path
                d="M126 78 C140 74 146 86 138 96 C132 93 126 88 122 84 Z"
                fill="#FFFDF9"
                stroke="#5C4033"
                strokeWidth="3"
                strokeLinejoin="round"
              />
            </g>
          ) : (
            <g>
              {/* Left perked ear */}
              <path
                d="M52 78 L46 47 L73 63 Z"
                fill="#F6D5B0"
                stroke="#5C4033"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path d="M54 71 L51 55 L66 64 Z" fill="#FBCFE8" />
              {/* Right perked ear */}
              <path
                d="M128 78 L134 47 L107 63 Z"
                fill="#FFFDF9"
                stroke="#5C4033"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path d="M126 71 L129 55 L114 64 Z" fill="#FBCFE8" />
            </g>
          )}

          {/* Chubby Cat Body */}
          <path
            d="M54 134 C54 114 68 106 90 106 C112 106 126 114 126 134 C126 146 112 152 90 152 C68 152 54 146 54 134 Z"
            fill={`url(#cat-fur-${uid})`}
            stroke="#5C4033"
            strokeWidth="3"
          />

          {/* Round Cat Head */}
          <ellipse
            cx="90"
            cy="92"
            rx="42"
            ry="35"
            fill={`url(#cat-fur-${uid})`}
            stroke="#5C4033"
            strokeWidth="3"
          />

          {/* Cute Calico Caramel Forehead Patch */}
          <path
            d="M55 75 C64 60 80 57 90 61 C83 68 74 74 62 79 Z"
            fill="#F6C28B"
            fillOpacity="0.85"
          />
          <path d="M84 59 L86 67 M91 58 L91 66 M98 59 L96 67" stroke="#C2814C" strokeWidth="2.2" strokeLinecap="round" />

          {/* Whiskers */}
          <g stroke="#5C4033" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.72">
            <line x1="40" y1="92" x2="54" y2="94" />
            <line x1="39" y1="100" x2="54" y2="99" />
            <line x1="140" y1="92" x2="126" y2="94" />
            <line x1="141" y1="100" x2="126" y2="99" />
          </g>

          {/* Rosy Cheeks */}
          <ellipse
            cx="64"
            cy="101"
            rx="7.5"
            ry="4.2"
            fill="#FDA4AF"
            fillOpacity={mood >= 2 ? '0.78' : '0.45'}
          />
          <ellipse
            cx="116"
            cy="101"
            rx="7.5"
            ry="4.2"
            fill="#FDA4AF"
            fillOpacity={mood >= 2 ? '0.78' : '0.45'}
          />

          {/* Eyes per Mood */}
          {mood === 0 ? (
            <g>
              {/* Sad watery puppy eyes */}
              <circle cx="72" cy="91" r="7.5" fill="#3B2720" />
              <circle cx="108" cy="91" r="7.5" fill="#3B2720" />
              <circle cx="70" cy="88.5" r="2.7" fill="#FFFFFF" />
              <circle cx="74.5" cy="93.5" r="1.4" fill="#BAE6FD" />
              <circle cx="106" cy="88.5" r="2.7" fill="#FFFFFF" />
              <circle cx="110.5" cy="93.5" r="1.4" fill="#BAE6FD" />
              {/* Worried slanted brows */}
              <path d="M64 81 L75 78" stroke="#5C4033" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M116 81 L105 78" stroke="#5C4033" strokeWidth="2.2" strokeLinecap="round" />
              {/* Tiny teardrop */}
              <path d="M63 97 C61 100 61 103 63 103 C65 103 65 100 63 97 Z" fill="#93C5FD" />
            </g>
          ) : null}

          {mood === 1 ? (
            <g>
              {/* Extra shiny pleading boba eyes */}
              <circle cx="72" cy="90" r="8.5" fill="#3B2720" />
              <circle cx="108" cy="90" r="8.5" fill="#3B2720" />
              <circle cx="69.5" cy="87" r="3.4" fill="#FFFFFF" />
              <circle cx="75" cy="93" r="1.7" fill="#FFFFFF" />
              <circle cx="105.5" cy="87" r="3.4" fill="#FFFFFF" />
              <circle cx="111" cy="93" r="1.7" fill="#FFFFFF" />
            </g>
          ) : null}

          {mood === 2 ? (
            <g>
              {/* Hopeful warm sparkly eyes */}
              <circle cx="72" cy="90" r="7.2" fill="#3B2720" />
              <circle cx="108" cy="90" r="7.2" fill="#3B2720" />
              <circle cx="70" cy="87.5" r="2.8" fill="#FFFFFF" />
              <circle cx="106" cy="87.5" r="2.8" fill="#FFFFFF" />
              <circle cx="74" cy="92.5" r="1.2" fill="#FDE68A" />
              <circle cx="110" cy="92.5" r="1.2" fill="#FDE68A" />
            </g>
          ) : null}

          {mood === 3 ? (
            <g>
              {/* Ecstatic happy curved eyes */}
              <path
                d="M64 91 Q72 82 80 91"
                fill="none"
                stroke="#5C4033"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M100 91 Q108 82 116 91"
                fill="none"
                stroke="#5C4033"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </g>
          ) : null}

          {/* Tiny Pink Nose & Mouth */}
          <path d="M87 98 L93 98 L90 101.5 Z" fill="#F472B6" />
          {mood === 0 ? (
            <path
              d="M84 106 Q90 102 96 106"
              fill="none"
              stroke="#5C4033"
              strokeWidth="2.3"
              strokeLinecap="round"
            />
          ) : mood === 3 ? (
            <path
              d="M82 103 Q86 109 90 104 Q94 109 98 103"
              fill="none"
              stroke="#5C4033"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M84 104 Q87 107.5 90 104 Q93 107.5 96 104"
              fill="none"
              stroke="#5C4033"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}

          {/* Paws & Held Props per Mood */}
          {mood === 0 ? (
            <g>
              {/* Tiny Daisy held in paws */}
              <path d="M113 136 L122 114" stroke="#4ADE80" strokeWidth="2.6" strokeLinecap="round" />
              <g transform="translate(123 111)">
                <circle cx="0" cy="-6" r="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                <circle cx="6" cy="-1.5" r="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                <circle cx="3.8" cy="5.2" r="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                <circle cx="-3.8" cy="5.2" r="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                <circle cx="-6" cy="-1.5" r="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                <circle cx="0" cy="0" r="3.6" fill="#FBBF24" />
              </g>
              <ellipse cx="75" cy="134" rx="9" ry="7" fill="#FFFDF9" stroke="#5C4033" strokeWidth="2.5" />
              <ellipse cx="107" cy="134" rx="9" ry="7" fill="#FFFDF9" stroke="#5C4033" strokeWidth="2.5" />
            </g>
          ) : null}

          {mood === 1 ? (
            <g>
              {/* Peeking paws resting up near chin */}
              <ellipse cx="72" cy="124" rx="9.5" ry="7.5" fill="#FFFDF9" stroke="#5C4033" strokeWidth="2.6" />
              <ellipse cx="108" cy="124" rx="9.5" ry="7.5" fill="#FFFDF9" stroke="#5C4033" strokeWidth="2.6" />
              <circle cx="72" cy="125" r="2.2" fill="#FBCFE8" />
              <circle cx="108" cy="125" r="2.2" fill="#FBCFE8" />
            </g>
          ) : null}

          {mood === 2 ? (
            <g>
              {/* Offering a glowing coral heart */}
              <path
                d="M90 144 C90 144 76 135 76 126 C76 121.8 79.5 119 83.2 119 C86 119 88.5 120.7 90 123 C91.5 120.7 94 119 96.8 119 C100.5 119 104 121.8 104 126 C104 135 90 144 90 144 Z"
                fill="#FB7185"
                stroke="#BE123C"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <ellipse cx="73" cy="132" rx="8.5" ry="6.5" fill="#FFFDF9" stroke="#5C4033" strokeWidth="2.5" />
              <ellipse cx="107" cy="132" rx="8.5" ry="6.5" fill="#FFFDF9" stroke="#5C4033" strokeWidth="2.5" />
            </g>
          ) : null}

          {mood === 3 ? (
            <g>
              {/* Happy raised paws */}
              <ellipse
                cx="64"
                cy="126"
                rx="9"
                ry="7"
                transform="rotate(-24 64 126)"
                fill="#FFFDF9"
                stroke="#5C4033"
                strokeWidth="2.5"
              />
              <ellipse
                cx="116"
                cy="126"
                rx="9"
                ry="7"
                transform="rotate(24 116 126)"
                fill="#FFFDF9"
                stroke="#5C4033"
                strokeWidth="2.5"
              />
              <circle cx="64" cy="126" r="2.3" fill="#FDA4AF" />
              <circle cx="116" cy="126" r="2.3" fill="#FDA4AF" />
            </g>
          ) : null}
        </svg>
      </div>

      {/* Cute handwritten meme sticker speech pill */}
      <div
        key={`caption-${mood}`}
        className={`mj-pop-in -mt-1 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 shadow-sm transition-colors duration-700 ${
          sunlit
            ? 'border-rose-200 bg-white/95 text-[#7C2D12] shadow-rose-200/40'
            : 'border-amber-200/35 bg-[#FFFDF9]/95 text-[#3B2720] shadow-black/25'
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" aria-hidden="true" />
        <span className="font-handwritten text-lg leading-none tracking-wide sm:text-xl">
          {caption}
        </span>
      </div>
    </div>
  );
}

/** Tactile Illustrated SVG Art for each of the 4 Peace Offering Treats */
function TreatIllustration({ id }: { id: TreatId }) {
  if (id === 'chai-boba') {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12 shrink-0" fill="none" aria-hidden="true">
        {/* Steam curls */}
        <path d="M24 14c0-3 2.5-3.5 2.5-6M32 13c0-3 2.5-3.5 2.5-6M40 15c0-2.5 2-3 2-5" stroke="#FDBA74" strokeWidth="2.2" strokeLinecap="round" />
        {/* Straw */}
        <path d="M38 18 L43 8" stroke="#FB7185" strokeWidth="3.2" strokeLinecap="round" />
        {/* Cup body */}
        <path
          d="M18 22 H46 L42.5 51 A4 4 0 0 1 38.5 54.5 H25.5 A4 4 0 0 1 21.5 51 L18 22 Z"
          fill="#FDE68A"
          stroke="#78350F"
          strokeWidth="2.3"
          strokeLinejoin="round"
        />
        {/* Milky tea fill */}
        <path d="M20.5 31 H43.5 L41.5 50.5 A2.5 2.5 0 0 1 39 52.5 H25 A2.5 2.5 0 0 1 22.5 50.5 L20.5 31 Z" fill="#D97706" fillOpacity="0.45" />
        {/* Lid */}
        <rect x="15" y="18" width="34" height="5" rx="2.5" fill="#FFFBEB" stroke="#78350F" strokeWidth="2.2" />
        {/* Boba pearls */}
        <circle cx="26" cy="48" r="2.4" fill="#5C4033" />
        <circle cx="32.5" cy="49" r="2.4" fill="#5C4033" />
        <circle cx="38" cy="47.5" r="2.4" fill="#5C4033" />
        <circle cx="29.5" cy="43.5" r="2.1" fill="#5C4033" />
      </svg>
    );
  }

  if (id === 'wildflowers') {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12 shrink-0" fill="none" aria-hidden="true">
        {/* Kraft paper wrap */}
        <path d="M20 34 L32 56 L44 34 Z" fill="#FDE68A" stroke="#78350F" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M25 43 Q32 46 39 43" stroke="#FB7185" strokeWidth="2.6" strokeLinecap="round" />
        {/* Stems & leaves */}
        <path d="M32 34 L24 22 M32 34 L32 18 M32 34 L41 23" stroke="#22C55E" strokeWidth="2.4" strokeLinecap="round" />
        <ellipse cx="22" cy="30" rx="4.5" ry="2.4" transform="rotate(-30 22 30)" fill="#4ADE80" />
        <ellipse cx="42" cy="30" rx="4.5" ry="2.4" transform="rotate(30 42 30)" fill="#4ADE80" />
        {/* Left daisy */}
        <circle cx="22" cy="21" r="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
        <circle cx="22" cy="21" r="2.6" fill="#FBBF24" />
        {/* Center pink bloom */}
        <circle cx="32" cy="16" r="7" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1.4" />
        <circle cx="32" cy="16" r="2.8" fill="#FEF08A" />
        {/* Right lavender bloom */}
        <circle cx="42" cy="22" r="5.8" fill="#DDD6FE" stroke="#8B5CF6" strokeWidth="1.3" />
        <circle cx="42" cy="22" r="2.4" fill="#FDE68A" />
      </svg>
    );
  }

  if (id === 'hug-coupon') {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12 shrink-0" fill="none" aria-hidden="true">
        {/* Notched ticket stub */}
        <path
          d="M10 21 A4 4 0 0 1 14 17 H50 A4 4 0 0 1 54 21 V27 A4.5 4.5 0 0 0 54 36 V43 A4 4 0 0 1 50 47 H14 A4 4 0 0 1 10 43 V36 A4.5 4.5 0 0 0 10 27 V21 Z"
          fill="#FFE4E6"
          stroke="#9F1239"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <line x1="22" y1="19" x2="22" y2="45" stroke="#FB7185" strokeWidth="1.6" strokeDasharray="3 3" />
        {/* Heart seal */}
        <path
          d="M38 39 C38 39 30 33.8 30 28.8 C30 26.2 32 24.4 34.4 24.4 C35.9 24.4 37.2 25.3 38 26.6 C38.8 25.3 40.1 24.4 41.6 24.4 C44 24.4 46 26.2 46 28.8 C46 33.8 38 39 38 39 Z"
          fill="#FB7185"
        />
        <circle cx="16" cy="31.5" r="2" fill="#FB7185" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12 shrink-0" fill="none" aria-hidden="true">
      {/* Waffle cone */}
      <path d="M22 35 L32 56 L42 35 Z" fill="#FDBA74" stroke="#78350F" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M26 42 L36 42 M28.5 48 L35.5 48" stroke="#B45309" strokeWidth="1.4" strokeLinecap="round" />
      {/* Bottom scoop (mint/vanilla) */}
      <circle cx="27" cy="31" r="8.5" fill="#FEF3C7" stroke="#78350F" strokeWidth="2" />
      <circle cx="37" cy="31" r="8.5" fill="#A7F3D0" stroke="#78350F" strokeWidth="2" />
      {/* Top scoop (strawberry) */}
      <circle cx="32" cy="22" r="9.2" fill="#FBCFE8" stroke="#78350F" strokeWidth="2" />
      {/* Sprinkles */}
      <line x1="28" y1="20" x2="30" y2="21.5" stroke="#F43F5E" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="35" y1="23" x2="37" y2="21.5" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="31" y1="26" x2="33" y2="26.5" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" />
      {/* Cherry on top */}
      <circle cx="32" cy="11.5" r="3.4" fill="#F43F5E" stroke="#881337" strokeWidth="1.5" />
      <path d="M33 8.5 Q35 5.5 38 6" stroke="#15803D" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Rainy Window Cozy Cat Apology Café ("Maan Jao") microsite:
 * - Animated Rainy Twilight -> Golden Sunset & Pastel Rainbow weather shift
 * - Expressive 4-mood custom SVG Cat Meme Sticker
 * - Interactive 2x2 Peace Offering Tray with Forgiveness Heart Meter
 * - Warm Café Apology Coaster Note + Optional Polaroid Keepsake + "Okay, Forgiven!" Finale
 */
export function MaanJaoSite({
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const [claimedTreats, setClaimedTreats] = useState<TreatId[]>([]);
  const [burstTreat, setBurstTreat] = useState<TreatId | null>(null);
  const [forgiven, setForgiven] = useState(false);
  const [poutCount, setPoutCount] = useState(0);

  const coreLang = toCoreLanguageCode(language);
  const copy = CAFE_COPY[coreLang] ?? CAFE_COPY.en;

  const receiver = data.receiverName?.trim() || (coreLang === 'hi' ? 'आप' : 'you');
  const sender = data.senderName?.trim() || (coreLang === 'hi' ? 'मैं' : 'Me');
  const headlineText =
    pickLocalizedText(data.headline, language).trim() || copy.defaultHeadline(receiver);
  const messageText =
    pickLocalizedText(data.message, language).trim() || copy.defaultMessage;

  const treatCount = claimedTreats.length;
  const warmth = forgiven ? 1 : treatCount / PEACE_TREATS.length;
  const meterPct = forgiven ? 100 : Math.min(100, treatCount * 25);

  const catMood: CatMood = forgiven
    ? 3
    : treatCount >= 3
      ? 2
      : treatCount >= 1
        ? 1
        : 0;

  const hasPhotos = Boolean(
    data.photos?.some((src) => typeof src === 'string' && src.trim().length > 0),
  );

  function handleToggleTreat(id: TreatId) {
    const idx = PEACE_TREATS.findIndex((t) => t.id === id);
    playRaindropPluck(idx >= 0 ? idx : 0);

    setClaimedTreats((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        return prev.filter((item) => item !== id);
      }
      setBurstTreat(id);
      return [...prev, id];
    });
  }

  function handleForgive() {
    playRaindropPluck(3);
    setClaimedTreats(PEACE_TREATS.map((t) => t.id));
    setForgiven(true);
    setPoutCount(0);
    onOpened?.();
  }

  function handleReplayWeather() {
    setForgiven(false);
    setClaimedTreats([]);
    setBurstTreat(null);
    setPoutCount(0);
  }

  const poutReply =
    poutCount > 0 ? copy.poutReplies[(poutCount - 1) % copy.poutReplies.length] : null;

  return (
    <article
      aria-label={copy.ariaLabel}
      className={`relative flex h-full min-h-full w-full flex-col justify-between overflow-x-clip overflow-y-hidden rounded-[28px] transition-colors duration-1000 ${
        forgiven ? 'text-[#431407]' : 'text-[#F8FAFC]'
      }`}
    >
      <style>{`
        @keyframes mj-rain-fall {
          0% { transform: translate3d(0, -10%, 0) rotate(14deg); }
          100% { transform: translate3d(-44px, 115vh, 0) rotate(14deg); }
        }
        @keyframes mj-twinkle {
          0%, 100% { opacity: 0.65; }
          50% { opacity: 1; }
        }
        @keyframes mj-cat-bob {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-5px) rotate(1deg); }
        }
        @keyframes mj-pop-in {
          0% { transform: scale(0.86); opacity: 0.7; }
          65% { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes mj-sparkle-float {
          0%, 100% { transform: translateY(0px) scale(0.9); opacity: 0.55; }
          50% { transform: translateY(-8px) scale(1.15); opacity: 1; }
        }
        @keyframes mj-burst-up {
          0% { transform: translateY(4px) scale(0.6); opacity: 0; }
          35% { transform: translateY(-8px) scale(1.15); opacity: 1; }
          100% { transform: translateY(-20px) scale(0.85); opacity: 0; }
        }
        .mj-raindrop {
          animation: mj-rain-fall linear infinite;
        }
        .mj-twinkle {
          animation: mj-twinkle 3.2s ease-in-out infinite;
        }
        .mj-cat-bob {
          animation: mj-cat-bob 3.6s ease-in-out infinite;
        }
        .mj-pop-in {
          animation: mj-pop-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .mj-sparkle-float {
          animation: mj-sparkle-float 3.4s ease-in-out infinite;
        }
        .mj-burst-up {
          animation: mj-burst-up 750ms ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .mj-raindrop, .mj-twinkle, .mj-cat-bob, .mj-pop-in, .mj-sparkle-float, .mj-burst-up {
            animation: none !important;
          }
        }
      `}</style>

      <WeatherWindowBackdrop warmth={warmth} sunlit={forgiven} />
      <WatermarkBanner visible={watermarked} label={copy.previewBanner} sunlit={forgiven} />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pb-6 pt-8 sm:px-5">
        {/* Top Weather Pill */}
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-md transition-colors duration-700 ${
              forgiven
                ? 'border-amber-900/15 bg-white/75 text-amber-900'
                : 'border-white/15 bg-[#1B2434]/70 text-amber-100'
            }`}
          >
            <WeatherBadgeIcon sunlit={forgiven} />
            <span>{forgiven ? copy.cafeBadgeRainbow : copy.cafeBadgeRain}</span>
          </div>

          <span
            className={`rounded-full border px-3 py-1 font-handwritten text-base leading-none backdrop-blur-md transition-colors duration-700 ${
              forgiven
                ? 'border-rose-300/60 bg-white/70 text-rose-900'
                : 'border-amber-200/20 bg-white/10 text-amber-100'
            }`}
          >
            {copy.forPrefix} {receiver}
          </span>
        </header>

        {/* Hero: Expressive Cat Meme Sticker + Forgiveness Heart Meter */}
        <section className="flex flex-col items-center gap-4 pt-1 text-center">
          <CatMemeSticker
            mood={catMood}
            caption={copy.moodCaptions[catMood]}
            sunlit={forgiven}
          />

          {/* Forgiveness Heart Meter */}
          <div
            className={`w-full rounded-2xl border px-4 py-3 backdrop-blur-md transition-colors duration-700 ${
              forgiven
                ? 'border-amber-900/10 bg-white/75 shadow-[0_10px_28px_-14px_rgba(244,114,182,0.45)]'
                : 'border-white/12 bg-[#161F2E]/65 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.6)]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${
                  forgiven ? 'text-amber-900/80' : 'text-amber-100/85'
                }`}
              >
                {copy.meterLabel}
              </span>
              <div className="flex items-center gap-1" aria-hidden="true">
                {PEACE_TREATS.map((treat, idx) => (
                  <TinyHeartSvg
                    key={treat.id}
                    filled={forgiven || idx < treatCount}
                    size={15}
                    fillColor={forgiven ? '#F43F5E' : '#FB7185'}
                    strokeColor={forgiven ? '#FDA4AF' : '#94A3B8'}
                  />
                ))}
              </div>
            </div>

            <div
              className={`mt-2 h-2.5 w-full overflow-hidden rounded-full ${
                forgiven ? 'bg-rose-100' : 'bg-white/12'
              }`}
              role="progressbar"
              aria-valuenow={meterPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={copy.meterLabel}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.max(8, meterPct)}%`,
                  background: forgiven
                    ? 'linear-gradient(90deg, #FB7185 0%, #FBBF24 52%, #34D399 100%)'
                    : 'linear-gradient(90deg, #FDBA74 0%, #FB7185 100%)',
                }}
              />
            </div>

            <p
              className={`mt-1.5 text-xs font-medium ${
                forgiven
                  ? 'text-rose-800'
                  : treatCount === PEACE_TREATS.length
                    ? 'text-amber-200'
                    : 'text-slate-300'
              }`}
            >
              {forgiven
                ? copy.meterForgiven
                : treatCount === PEACE_TREATS.length
                  ? copy.meterReady
                  : `${treatCount} / ${PEACE_TREATS.length} · ${copy.trayHint}`}
            </p>
          </div>
        </section>

        {/* Interactive 2x2 Peace Offering Tray */}
        <section aria-label={copy.trayHeading} className="space-y-2.5">
          <div className="flex items-baseline justify-between px-1">
            <h2
              className={`font-editorial text-lg font-medium tracking-tight ${
                forgiven ? 'text-[#7C2D12]' : 'text-amber-50'
              }`}
            >
              {copy.trayHeading}
            </h2>
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
                forgiven ? 'text-amber-800/70' : 'text-sky-200/70'
              }`}
            >
              {treatCount}/{PEACE_TREATS.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {PEACE_TREATS.map((treat) => {
              const claimed = claimedTreats.includes(treat.id);
              const showBurst = burstTreat === treat.id && claimed;

              return (
                <button
                  key={treat.id}
                  type="button"
                  aria-pressed={claimed}
                  onClick={() => handleToggleTreat(treat.id)}
                  className={`group relative flex min-h-[126px] flex-col items-center justify-between overflow-hidden rounded-2xl border p-3 text-center transition-all duration-300 active:scale-[0.96] ${
                    claimed
                      ? forgiven
                        ? 'scale-[1.01] border-rose-300 bg-white/90 text-[#431407] shadow-[0_10px_24px_-12px_rgba(244,114,182,0.5)]'
                        : 'scale-[1.01] border-amber-300/65 bg-[#FFF7ED]/95 text-[#3B2720] shadow-[0_12px_28px_-12px_rgba(251,191,36,0.45)]'
                      : forgiven
                        ? 'border-amber-900/12 bg-white/65 text-[#431407] hover:bg-white/85'
                        : 'border-white/14 bg-[#1E293B]/72 text-slate-100 backdrop-blur-md hover:border-amber-200/35 hover:bg-[#243247]/85'
                  }`}
                >
                  {/* Check badge */}
                  <span
                    aria-hidden="true"
                    className={`absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-300 ${
                      claimed
                        ? 'scale-100 border-rose-400 bg-rose-400 text-white'
                        : forgiven
                          ? 'scale-90 border-amber-900/20 bg-transparent'
                          : 'scale-90 border-white/25 bg-transparent'
                    }`}
                  >
                    {claimed ? (
                      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
                        <path
                          d="M3.5 8.2L6.6 11.3L12.5 4.8"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>

                  {/* Floating sparkle burst on claim */}
                  {showBurst ? (
                    <span
                      key={`burst-${treat.id}-${claimedTreats.length}`}
                      aria-hidden="true"
                      className="mj-burst-up pointer-events-none absolute left-3 top-3 flex items-center gap-1"
                    >
                      <SparkleStarSvg size={13} color="#F59E0B" />
                      <SparkleStarSvg size={10} color="#FB7185" />
                    </span>
                  ) : null}

                  <div
                    className={`mt-1 transition-transform duration-300 ${
                      claimed ? 'scale-105' : 'group-hover:scale-105'
                    }`}
                  >
                    <TreatIllustration id={treat.id} />
                  </div>

                  <div className="mt-1.5 space-y-0.5">
                    <span className="block break-words text-xs font-semibold leading-snug">
                      {treat.label[coreLang]}
                    </span>
                    <span
                      className={`block text-[10.5px] font-medium ${
                        claimed
                          ? 'text-rose-600'
                          : forgiven
                            ? 'text-amber-800/70'
                            : 'text-amber-200/75'
                      }`}
                    >
                      {claimed ? copy.collectedTag : treat.tag[coreLang]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Minimal Sincere Apology Café Coaster Note */}
        <section
          aria-label={copy.noteCoasterTag}
          className={`relative rounded-[24px] border p-5 shadow-lg transition-colors duration-700 ${
            forgiven
              ? 'border-amber-200/80 bg-[#FFFDF9]/95 text-[#431407] shadow-rose-200/40'
              : 'border-amber-200/35 bg-[#FFFBF2]/95 text-[#3B2720] shadow-black/30'
          }`}
        >
          {/* Decorative café coaster stitched border */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-2 rounded-[18px] border border-dashed border-amber-900/15"
          />

          <div className="relative space-y-2.5 text-center">
            <span className="inline-block font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-amber-800/65">
              {copy.noteCoasterTag}
            </span>

            <h1 className="break-words font-editorial text-2xl font-medium leading-tight tracking-tight text-[#3B2720] sm:text-[26px]">
              {headlineText}
            </h1>

            <p className="mx-auto max-w-sm break-words font-literary text-[14.5px] leading-relaxed text-[#5C4033]">
              {messageText}
            </p>

            <p className="pt-1 font-handwritten text-xl text-rose-700">
              — {sender}
            </p>
          </div>
        </section>

        {/* Optional Polaroid Photo Keepsake */}
        {hasPhotos ? (
          <section aria-label={copy.photosTag} className="space-y-1.5">
            <p
              className={`text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${
                forgiven ? 'text-amber-900/70' : 'text-amber-100/75'
              }`}
            >
              {copy.photosTag}
            </p>
            <OccasionPhotoGallery
              photos={data.photos}
              accentColor={forgiven ? '#F472B6' : '#FBBF24'}
              surfaceTint="#FFF7ED"
              captionPrefix={copy.photoPrefix}
              variant="polaroid"
            />
          </section>
        ) : null}

        {/* Primary Forgiveness Action / Golden Rainbow Celebration */}
        <section className="space-y-2.5 pt-1 text-center">
          {!forgiven ? (
            <>
              <button
                type="button"
                onClick={handleForgive}
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FDBA74] via-[#FDA4AF] to-[#FDE68A] px-6 py-3.5 text-sm font-bold text-[#3B2720] shadow-[0_12px_32px_-8px_rgba(253,164,175,0.7)] transition-all duration-300 hover:brightness-105 active:scale-[0.97]"
              >
                <SparkleStarSvg size={15} color="#7C2D12" />
                <span>{copy.forgiveCta}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playRaindropPluck(0);
                  setPoutCount((prev) => prev + 1);
                }}
                className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/[0.12] active:scale-[0.98]"
              >
                {copy.poutCta}
              </button>

              {poutReply ? (
                <p
                  key={`pout-${poutCount}`}
                  className="mj-pop-in mx-auto max-w-xs rounded-xl border border-amber-200/20 bg-[#1B2434]/75 px-3 py-2 text-xs text-amber-100"
                >
                  {poutReply}
                </p>
              ) : null}
            </>
          ) : (
            <div className="mj-pop-in space-y-3 rounded-[24px] border border-rose-200/80 bg-white/85 p-5 shadow-[0_14px_34px_-14px_rgba(244,114,182,0.5)] backdrop-blur-md">
              <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
                <SparkleStarSvg size={16} color="#F59E0B" />
                <TinyHeartSvg filled size={18} fillColor="#F43F5E" />
                <SparkleStarSvg size={16} color="#F472B6" />
              </div>

              <h2 className="break-words font-editorial text-2xl font-medium text-[#7C2D12]">
                {copy.forgivenBannerTitle(receiver)}
              </h2>
              <p className="break-words text-sm leading-relaxed text-[#7C2D12]/85">
                {copy.forgivenBannerSub(sender)}
              </p>

              <button
                type="button"
                onClick={handleReplayWeather}
                className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-rose-300/70 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-800 transition hover:bg-rose-100 active:scale-[0.98]"
              >
                {copy.replayWeatherCta}
              </button>
            </div>
          )}
        </section>

        <footer
          className={`border-t pt-3 text-center text-[11px] font-medium transition-colors duration-700 ${
            forgiven
              ? 'border-amber-900/12 text-amber-900/70'
              : 'border-white/12 text-slate-300/80'
          }`}
        >
          {getWebzyFooterLabel(language)}
        </footer>
      </div>
    </article>
  );
}
