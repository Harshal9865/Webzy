'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type CoreLanguageCode,
  pickLocalizedText,
  toCoreLanguageCode,
} from '@webzy/core';
import {
  type OccasionSiteProps,
  getWebzyFooterLabel,
} from './shared/OccasionPrimitives';

type DesktopAppId = 'her' | 'dream' | 'game' | 'love';
type FallingKind = 'heart' | 'boba' | 'sunflower' | 'star';

interface FallingItem {
  id: number;
  kind: FallingKind;
  x: number; // 8..92 (% of stage width)
  y: number; // 0..100 (% of stage height)
  speed: number;
  points: number;
}

interface CatchBurst {
  id: number;
  x: number;
  y: number;
  label: string;
}

interface CatHeartBurst {
  id: number;
  dx: number;
}

interface TravelStop {
  id: string;
  city: string;
  tag: string;
  stampCode: string;
  dateCode: string;
  note: Record<CoreLanguageCode, string>;
  imageUrl: string;
  fallbackGradient: string;
  tiltClass: string;
}

interface OsCopy {
  previewBanner: string;
  osTitle: string;
  moodPill: string;
  forLabel: (name: string) => string;
  desktopHint: string;
  apps: Record<DesktopAppId, { label: string; windowTitle: string }>;
  catBubbles: readonly [string, string, string, string, string];
  catTapHint: string;
  herTitle: string;
  herSubtitle: string;
  stickers: readonly [string, string, string];
  tapToZoom: string;
  closeLabel: string;
  dreamTitle: string;
  boardingFrom: string;
  boardingFromVal: string;
  boardingTo: string;
  boardingToVal: string;
  boardingPassenger: string;
  boardingSeat: string;
  boardingGate: string;
  tapPinHint: string;
  postcardBack: string;
  gameTitle: string;
  gameStart: string;
  gamePlayingHint: string;
  gameScoreLabel: string;
  gameCatchesLabel: string;
  gameGoalLabel: (catches: number) => string;
  gameComboLabel: (combo: number) => string;
  awardBadge: string;
  awardTitle: string;
  awardSubtitle: (name: string) => string;
  awardKeepPlaying: string;
  awardReplay: string;
  loveTitle: string;
  cassetteSide: string;
  cassettePlay: string;
  cassettePause: string;
  dearLabel: (name: string) => string;
  signedLabel: (name: string) => string;
  dockReady: string;
}

const COPY: Record<CoreLanguageCode, OsCopy> = {
  en: {
    previewBanner: 'WEBZY FREE PREVIEW',
    osTitle: 'Her.OS',
    moodPill: '100% loved',
    forLabel: (name) => `for ${name}`,
    desktopHint: 'Tap a folder or pet the kitty',
    apps: {
      her: { label: 'Her', windowTitle: 'Her / Polaroids' },
      dream: { label: 'Dream', windowTitle: 'Dream / Travel Board' },
      game: { label: 'Pixel Game', windowTitle: 'Boba & Heart Catcher' },
      love: { label: 'Love.txt', windowTitle: 'Love.txt — Mixtape' },
    },
    catBubbles: ['10/10 cutie', 'free hugs!', 'my fav human', 'boop!', 'purrfect smile'],
    catTapHint: 'Pet kitty',
    herTitle: 'Little Photobooth',
    herSubtitle: 'Tap any polaroid to zoom, tap the heart to shower love',
    stickers: ['certified cutie', 'stole my heart', 'main character'],
    tapToZoom: 'Tap to zoom',
    closeLabel: 'Close',
    dreamTitle: 'Our Someday Pinboard',
    boardingFrom: 'FROM',
    boardingFromVal: 'RIGHT HERE',
    boardingTo: 'TO',
    boardingToVal: 'EVERYWHERE WITH YOU',
    boardingPassenger: 'PASSENGER',
    boardingSeat: 'SEAT',
    boardingGate: 'GATE',
    tapPinHint: 'Tap any pinned postcard to read',
    postcardBack: 'Back to board',
    gameTitle: 'Catch Hearts & Boba',
    gameStart: 'Play Now',
    gamePlayingHint: 'Move with arrows, buttons, or drag',
    gameScoreLabel: 'PTS',
    gameCatchesLabel: 'CATCHES',
    gameGoalLabel: (catches) => `${Math.min(catches, 8)}/8 for secret award`,
    gameComboLabel: (combo) => `x${combo} COMBO`,
    awardBadge: 'SECRET UNLOCKED',
    awardTitle: 'Sweetest Smile Award',
    awardSubtitle: (name) => `Officially presented to ${name} for lighting up every room.`,
    awardKeepPlaying: 'Keep Playing',
    awardReplay: 'Replay',
    loveTitle: 'A Small Note',
    cassetteSide: 'SIDE A',
    cassettePlay: 'Play Tape',
    cassettePause: 'Pause Tape',
    dearLabel: (name) => `Dear ${name},`,
    signedLabel: (name) => `— Always, ${name}`,
    dockReady: 'Cozy Mode',
  },
  hinglish: {
    previewBanner: 'WEBZY FREE PREVIEW',
    osTitle: 'Her.OS',
    moodPill: '100% loved',
    forLabel: (name) => `${name} ke liye`,
    desktopHint: 'Koi folder kholo ya kitty ko pet karo',
    apps: {
      her: { label: 'Her', windowTitle: 'Her / Polaroids' },
      dream: { label: 'Dream', windowTitle: 'Dream / Travel Board' },
      game: { label: 'Pixel Game', windowTitle: 'Boba & Heart Catcher' },
      love: { label: 'Love.txt', windowTitle: 'Love.txt — Mixtape' },
    },
    catBubbles: ['10/10 cutie', 'free hugs!', 'my fav human', 'boop!', 'sabse pyaari'],
    catTapHint: 'Kitty ko tap karo',
    herTitle: 'Chhota Photobooth',
    herSubtitle: 'Photo zoom karne ya heart dene ke liye tap karo',
    stickers: ['certified cutie', 'stole my heart', 'main character'],
    tapToZoom: 'Zoom karo',
    closeLabel: 'Band karo',
    dreamTitle: 'Humara Dream Pinboard',
    boardingFrom: 'FROM',
    boardingFromVal: 'RIGHT HERE',
    boardingTo: 'TO',
    boardingToVal: 'EVERYWHERE WITH YOU',
    boardingPassenger: 'PASSENGER',
    boardingSeat: 'SEAT',
    boardingGate: 'GATE',
    tapPinHint: 'Postcard padhne ke liye kisi photo par tap karo',
    postcardBack: 'Pinboard par wapas',
    gameTitle: 'Hearts & Boba Catcher',
    gameStart: 'Khelo Abhi',
    gamePlayingHint: 'Arrows, buttons ya drag se kitty chalao',
    gameScoreLabel: 'PTS',
    gameCatchesLabel: 'CATCH',
    gameGoalLabel: (catches) => `Secret award: ${Math.min(catches, 8)}/8`,
    gameComboLabel: (combo) => `x${combo} COMBO`,
    awardBadge: 'SECRET UNLOCKED',
    awardTitle: 'Sweetest Smile Award',
    awardSubtitle: (name) => `${name} ke naam — har din ko thoda aur pyaara banane ke liye.`,
    awardKeepPlaying: 'Khelte Raho',
    awardReplay: 'Phir Khelo',
    loveTitle: 'Chhota Sa Note',
    cassetteSide: 'SIDE A',
    cassettePlay: 'Tape Chalao',
    cassettePause: 'Tape Roko',
    dearLabel: (name) => `Dear ${name},`,
    signedLabel: (name) => `— Hamesha, ${name}`,
    dockReady: 'Cozy Mode',
  },
  hi: {
    previewBanner: 'WEBZY मुफ़्त पूर्वावलोकन',
    osTitle: 'Her.OS',
    moodPill: 'प्यार भरा दिन',
    forLabel: (name) => `${name} के लिए`,
    desktopHint: 'कोई फ़ोल्डर खोलें या बिल्ली पर टैप करें',
    apps: {
      her: { label: 'यादें', windowTitle: 'यादें / पोलरॉइड' },
      dream: { label: 'सपने', windowTitle: 'सपने / ट्रैवल बोर्ड' },
      game: { label: 'पिक्सेल गेम', windowTitle: 'दिल और बोबा गेम' },
      love: { label: 'चिट्ठी.txt', windowTitle: 'चिट्ठी.txt — मिक्सटेप' },
    },
    catBubbles: ['बेहद प्यारी', 'ढेर सारा प्यार', 'सबसे खास', 'बूप!', 'प्यारी मुस्कान'],
    catTapHint: 'बिल्ली को सहलाएं',
    herTitle: 'प्यारा फ़ोटोबूथ',
    herSubtitle: 'तस्वीर बड़ी देखने के लिए टैप करें, दिल दबाकर प्यार भेजें',
    stickers: ['सबसे प्यारी', 'दिल चुरा लिया', 'खास मुस्कान'],
    tapToZoom: 'बड़ा देखें',
    closeLabel: 'बंद करें',
    dreamTitle: 'सपनों का ट्रैवल बोर्ड',
    boardingFrom: 'यहाँ से',
    boardingFromVal: 'यहीं से',
    boardingTo: 'मंज़िल',
    boardingToVal: 'तुम्हारे साथ हर जगह',
    boardingPassenger: 'यात्री',
    boardingSeat: 'सीट',
    boardingGate: 'गेट',
    tapPinHint: 'पोस्टकार्ड पढ़ने के लिए किसी तस्वीर पर टैप करें',
    postcardBack: 'बोर्ड पर लौटें',
    gameTitle: 'दिल और बोबा पकड़ें',
    gameStart: 'खेल शुरू करें',
    gamePlayingHint: 'बटन, कीबोर्ड या ड्रैग से बिल्ली चलाएं',
    gameScoreLabel: 'अंक',
    gameCatchesLabel: 'पकड़े',
    gameGoalLabel: (catches) => `खास इनाम: ${Math.min(catches, 8)}/8`,
    gameComboLabel: (combo) => `x${combo} कॉम्बो`,
    awardBadge: 'खास इनाम खुला',
    awardTitle: 'सबसे प्यारी मुस्कान पुरस्कार',
    awardSubtitle: (name) => `${name} के लिए — हर पल में मिठास और रोशनी भरने के लिए।`,
    awardKeepPlaying: 'खेल जारी रखें',
    awardReplay: 'फिर से खेलें',
    loveTitle: 'एक छोटा सा संदेश',
    cassetteSide: 'साइड A',
    cassettePlay: 'कैसेट चलाएं',
    cassettePause: 'रोकें',
    dearLabel: (name) => `प्रिय ${name},`,
    signedLabel: (name) => `— स्नेह सहित, ${name}`,
    dockReady: 'सुकून मोड',
  },
};

const SAMPLE_HER_PHOTOS: readonly {
  url: string;
  caption: string;
  gradient: string;
}[] = [
  {
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    caption: 'golden hour glow',
    gradient: 'linear-gradient(135deg, #FDE2C4 0%, #F9A8D4 100%)',
  },
  {
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    caption: 'favorite smile',
    gradient: 'linear-gradient(135deg, #FCE7F3 0%, #DDD6FE 100%)',
  },
  {
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    caption: 'cozy afternoon',
    gradient: 'linear-gradient(135deg, #FEF3C7 0%, #FBCFE8 100%)',
  },
  {
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    caption: 'softest vibes',
    gradient: 'linear-gradient(135deg, #E0E7FF 0%, #FCE7F3 100%)',
  },
];

const TRAVEL_STOPS: readonly TravelStop[] = [
  {
    id: 'paris',
    city: 'Paris Cafe',
    tag: 'CROISSANTS & RAIN',
    stampCode: 'PAR',
    dateCode: '01 · SPRING',
    note: {
      en: 'Two warm coffees, corner window seats, and zero rush all morning.',
      hinglish: 'Do garam coffee, corner window seat, aur bina kisi jaldi ke sukoon bhari subah.',
      hi: 'दो गरम कॉफ़ी, खिड़की के पास की मेज़ और बिना किसी जल्दी के सुकून भरी सुबह।',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    fallbackGradient: 'linear-gradient(135deg, #FDE2C4 0%, #E899A8 100%)',
    tiltClass: '-rotate-2',
  },
  {
    id: 'alps',
    city: 'Swiss Alps Train',
    tag: 'WINDOW SEAT',
    stampCode: 'ZRH',
    dateCode: '02 · WINTER',
    note: {
      en: 'Snowy pines flying past the glass while we share one pair of headphones.',
      hinglish: 'Khidki ke bahar barf wale pahad aur ek hi headphones mein humare favorite gaane.',
      hi: 'खिड़की के बाहर बर्फीले पहाड़ और एक ही हेडफ़ोन में हमारी पसंदीदा धुनें।',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80',
    fallbackGradient: 'linear-gradient(135deg, #C7D2FE 0%, #FBCFE8 100%)',
    tiltClass: 'rotate-2',
  },
  {
    id: 'kyoto',
    city: 'Kyoto Sakura',
    tag: 'PETAL WALK',
    stampCode: 'KYO',
    dateCode: '03 · BLOOM',
    note: {
      en: 'Slow evening walks under pink lanterns and drifting cherry blossoms.',
      hinglish: 'Gulabi lanterns aur udte sakura petals ke neeche shaant shaam ki walk.',
      hi: 'गुलाबी लालटेन और उड़ती पंखुड़ियों के नीचे सुकून भरी शाम की सैर।',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    fallbackGradient: 'linear-gradient(135deg, #FBCFE8 0%, #FDE68A 100%)',
    tiltClass: '-rotate-1',
  },
  {
    id: 'seaside',
    city: 'Seaside Sunset',
    tag: 'GOLDEN TIDE',
    stampCode: 'SEA',
    dateCode: '04 · SUMMER',
    note: {
      en: 'Barefoot on warm sand watching the sky melt from peach into starlight.',
      hinglish: 'Nange pair garam ret par aur aasmaan ko peach se taaron mein badalte dekhna.',
      hi: 'गर्म रेत पर नंगे पैर चलते हुए आसमान को सुनहरे से तारों में ढलते देखना।',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    fallbackGradient: 'linear-gradient(135deg, #FDBA74 0%, #F472B6 100%)',
    tiltClass: 'rotate-1',
  },
];

function playSoftChime(freq: number, duration = 0.22) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.055, ctx.currentTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.02);
  } catch {
    // Silent fallback when Web Audio is restricted
  }
}

/* ===========================
   CRISP CUSTOM PIXEL & VECTOR SVGS
   =========================== */

function PixelHeartSvg({ className = 'h-4 w-4', fill = '#F472B6' }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 16 14" className={className} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="2" y="1" width="4" height="2" fill={fill} />
      <rect x="10" y="1" width="4" height="2" fill={fill} />
      <rect x="1" y="3" width="6" height="2" fill={fill} />
      <rect x="9" y="3" width="6" height="2" fill={fill} />
      <rect x="1" y="5" width="14" height="2" fill={fill} />
      <rect x="2" y="7" width="12" height="2" fill={fill} />
      <rect x="4" y="9" width="8" height="2" fill={fill} />
      <rect x="6" y="11" width="4" height="2" fill={fill} />
      <rect x="3" y="3" width="2" height="2" fill="#FFF1F5" />
    </svg>
  );
}

function PixelStarSvg({ className = 'h-4 w-4', fill = '#FDE68A' }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 14 14" className={className} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="6" y="1" width="2" height="12" fill={fill} />
      <rect x="1" y="6" width="12" height="2" fill={fill} />
      <rect x="4" y="4" width="6" height="6" fill={fill} />
      <rect x="6" y="6" width="2" height="2" fill="#FFFFFF" />
    </svg>
  );
}

function PixelBobaSvg({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 22" className={className} shapeRendering="crispEdges" aria-hidden="true">
      {/* Straw */}
      <rect x="9" y="1" width="2" height="6" fill="#F472B6" />
      <rect x="10" y="1" width="1" height="5" fill="#FBCFE8" />
      {/* Lid */}
      <rect x="3" y="6" width="12" height="2" fill="#FFF7ED" />
      <rect x="2" y="7" width="14" height="1" fill="#4A2545" />
      {/* Cup body */}
      <rect x="4" y="8" width="10" height="12" fill="#FDE68A" />
      <rect x="5" y="9" width="8" height="10" fill="#FCD5B5" />
      {/* Milk tea highlight */}
      <rect x="5" y="9" width="2" height="8" fill="#FFF7ED" fillOpacity="0.6" />
      {/* Tapioca pearls */}
      <rect x="5" y="16" width="2" height="2" fill="#4A2545" />
      <rect x="8" y="17" width="2" height="2" fill="#4A2545" />
      <rect x="11" y="16" width="2" height="2" fill="#4A2545" />
      <rect x="7" y="14" width="2" height="2" fill="#5C2D54" />
      {/* Cup outline */}
      <rect x="3" y="8" width="1" height="12" fill="#4A2545" />
      <rect x="14" y="8" width="1" height="12" fill="#4A2545" />
      <rect x="4" y="20" width="10" height="1" fill="#4A2545" />
    </svg>
  );
}

function PixelSunflowerSvg({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="7" y="1" width="4" height="3" fill="#FBBF24" />
      <rect x="7" y="14" width="4" height="3" fill="#FBBF24" />
      <rect x="1" y="7" width="3" height="4" fill="#FBBF24" />
      <rect x="14" y="7" width="3" height="4" fill="#FBBF24" />
      <rect x="3" y="3" width="3" height="3" fill="#FDE047" />
      <rect x="12" y="3" width="3" height="3" fill="#FDE047" />
      <rect x="3" y="12" width="3" height="3" fill="#FDE047" />
      <rect x="12" y="12" width="3" height="3" fill="#FDE047" />
      <rect x="5" y="5" width="8" height="8" fill="#78350F" />
      <rect x="6" y="6" width="6" height="6" fill="#92400E" />
      <rect x="7" y="7" width="2" height="2" fill="#FDE68A" />
    </svg>
  );
}

function PixelCloudSvg({ className = '', tint = '#FFF5F7' }: { className?: string; tint?: string }) {
  return (
    <svg viewBox="0 0 64 26" className={className} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="16" y="4" width="16" height="4" fill={tint} />
      <rect x="10" y="8" width="32" height="4" fill={tint} />
      <rect x="4" y="12" width="52" height="6" fill={tint} />
      <rect x="8" y="18" width="46" height="4" fill={tint} fillOpacity="0.82" />
      <rect x="34" y="6" width="14" height="6" fill={tint} />
    </svg>
  );
}

function PixelMoonSvg({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="10" y="2" width="6" height="2" fill="#FEF3C7" />
      <rect x="7" y="4" width="6" height="2" fill="#FDE68A" />
      <rect x="5" y="6" width="5" height="2" fill="#FDE68A" />
      <rect x="4" y="8" width="5" height="8" fill="#FDE68A" />
      <rect x="5" y="16" width="5" height="2" fill="#FDE68A" />
      <rect x="7" y="18" width="6" height="2" fill="#FDE68A" />
      <rect x="10" y="20" width="6" height="2" fill="#FCD34D" />
      <rect x="14" y="18" width="4" height="2" fill="#FCD34D" />
      <rect x="16" y="16" width="2" height="2" fill="#FCD34D" />
      <rect x="6" y="8" width="2" height="4" fill="#FFFBEB" />
    </svg>
  );
}

/** Detailed expressive pixel cat companion (whiskers, blush cheeks, happy eyes, wagging tail). */
function PixelCatCompanionSvg({ happy, className = 'h-20 w-20' }: { happy: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 36 34" className={className} shapeRendering="crispEdges" aria-hidden="true">
      {/* Animated wagging tail */}
      <g className="mts-tail-wag" style={{ transformOrigin: '27px 26px' }}>
        <rect x="27" y="24" width="4" height="2" fill="#4A2545" />
        <rect x="30" y="20" width="3" height="5" fill="#FFF8F0" />
        <rect x="30" y="19" width="3" height="1" fill="#4A2545" />
        <rect x="33" y="20" width="1" height="5" fill="#4A2545" />
        <rect x="29" y="20" width="1" height="4" fill="#4A2545" />
        <rect x="31" y="20" width="2" height="2" fill="#F9A8D4" />
      </g>

      {/* Left & right pointy ears */}
      <rect x="8" y="4" width="2" height="2" fill="#4A2545" />
      <rect x="7" y="6" width="2" height="4" fill="#4A2545" />
      <rect x="10" y="6" width="2" height="2" fill="#4A2545" />
      <rect x="9" y="6" width="2" height="4" fill="#FFF8F0" />
      <rect x="9" y="7" width="1" height="2" fill="#F9A8D4" />

      <rect x="22" y="4" width="2" height="2" fill="#4A2545" />
      <rect x="23" y="6" width="2" height="4" fill="#4A2545" />
      <rect x="20" y="6" width="2" height="2" fill="#4A2545" />
      <rect x="21" y="6" width="2" height="4" fill="#FFF8F0" />
      <rect x="22" y="7" width="1" height="2" fill="#F9A8D4" />

      {/* Head outline & cream fill */}
      <rect x="10" y="8" width="12" height="2" fill="#4A2545" />
      <rect x="6" y="10" width="20" height="10" fill="#FFF8F0" />
      <rect x="5" y="10" width="1" height="10" fill="#4A2545" />
      <rect x="26" y="10" width="1" height="10" fill="#4A2545" />
      <rect x="6" y="20" width="20" height="1" fill="#4A2545" />

      {/* Cute peach forehead tabby stripes */}
      <rect x="14" y="10" width="1" height="3" fill="#FDBA74" />
      <rect x="16" y="10" width="1" height="2" fill="#FDBA74" />
      <rect x="18" y="10" width="1" height="3" fill="#FDBA74" />

      {/* Eyes */}
      {happy ? (
        <>
          <rect x="9" y="14" width="1" height="1" fill="#4A2545" />
          <rect x="10" y="13" width="2" height="1" fill="#4A2545" />
          <rect x="12" y="14" width="1" height="1" fill="#4A2545" />

          <rect x="19" y="14" width="1" height="1" fill="#4A2545" />
          <rect x="20" y="13" width="2" height="1" fill="#4A2545" />
          <rect x="22" y="14" width="1" height="1" fill="#4A2545" />
        </>
      ) : (
        <>
          <rect x="10" y="13" width="2" height="3" fill="#4A2545" />
          <rect x="10" y="13" width="1" height="1" fill="#FFFFFF" />
          <rect x="20" y="13" width="2" height="3" fill="#4A2545" />
          <rect x="20" y="13" width="1" height="1" fill="#FFFFFF" />
        </>
      )}

      {/* Blush cheeks */}
      <rect x="7" y="16" width="3" height="2" fill="#FDA4AF" />
      <rect x="22" y="16" width="3" height="2" fill="#FDA4AF" />

      {/* Nose & tiny 'w' mouth */}
      <rect x="15" y="16" width="2" height="1" fill="#F472B6" />
      <rect x="14" y="17" width="1" height="1" fill="#4A2545" />
      <rect x="17" y="17" width="1" height="1" fill="#4A2545" />
      <rect x="15" y="18" width="2" height="1" fill="#4A2545" />

      {/* Whiskers */}
      <rect x="2" y="14" width="3" height="1" fill="#4A2545" />
      <rect x="2" y="17" width="3" height="1" fill="#4A2545" />
      <rect x="27" y="14" width="3" height="1" fill="#4A2545" />
      <rect x="27" y="17" width="3" height="1" fill="#4A2545" />

      {/* Cozy sitting body + collar */}
      <rect x="9" y="21" width="14" height="2" fill="#FB7185" />
      <rect x="15" y="21" width="2" height="2" fill="#FDE047" />
      <rect x="8" y="23" width="16" height="7" fill="#FFF8F0" />
      <rect x="7" y="23" width="1" height="7" fill="#4A2545" />
      <rect x="24" y="23" width="1" height="7" fill="#4A2545" />
      <rect x="8" y="30" width="16" height="1" fill="#4A2545" />
      {/* Little paws */}
      <rect x="11" y="28" width="3" height="2" fill="#FBCFE8" />
      <rect x="18" y="28" width="3" height="2" fill="#FBCFE8" />
    </svg>
  );
}

/** Retro desktop icons for the 4 apps. */
function DesktopAppIconSvg({ id, className = 'h-12 w-12' }: { id: DesktopAppId; className?: string }) {
  if (id === 'her') {
    return (
      <svg viewBox="0 0 32 28" className={className} shapeRendering="crispEdges" aria-hidden="true">
        {/* Pastel pink folder */}
        <rect x="2" y="4" width="11" height="3" fill="#F9A8D4" />
        <rect x="2" y="3" width="11" height="1" fill="#4A2545" />
        <rect x="1" y="4" width="1" height="21" fill="#4A2545" />
        <rect x="13" y="4" width="1" height="3" fill="#4A2545" />
        <rect x="14" y="6" width="16" height="1" fill="#4A2545" />
        <rect x="2" y="7" width="28" height="18" fill="#FBCFE8" />
        <rect x="2" y="9" width="28" height="16" fill="#FCE7F3" />
        <rect x="30" y="7" width="1" height="18" fill="#4A2545" />
        <rect x="2" y="25" width="28" height="1" fill="#4A2545" />
        {/* Tiny pixel heart on folder */}
        <rect x="12" y="13" width="3" height="2" fill="#EC4899" />
        <rect x="17" y="13" width="3" height="2" fill="#EC4899" />
        <rect x="11" y="15" width="10" height="2" fill="#EC4899" />
        <rect x="13" y="17" width="6" height="2" fill="#EC4899" />
        <rect x="15" y="19" width="2" height="2" fill="#EC4899" />
      </svg>
    );
  }
  if (id === 'dream') {
    return (
      <svg viewBox="0 0 32 28" className={className} shapeRendering="crispEdges" aria-hidden="true">
        {/* Warm butterscotch travel folder */}
        <rect x="2" y="4" width="11" height="3" fill="#FCD34D" />
        <rect x="2" y="3" width="11" height="1" fill="#4A2545" />
        <rect x="1" y="4" width="1" height="21" fill="#4A2545" />
        <rect x="13" y="4" width="1" height="3" fill="#4A2545" />
        <rect x="14" y="6" width="16" height="1" fill="#4A2545" />
        <rect x="2" y="7" width="28" height="18" fill="#FDE68A" />
        <rect x="2" y="9" width="28" height="16" fill="#FEF3C7" />
        <rect x="30" y="7" width="1" height="18" fill="#4A2545" />
        <rect x="2" y="25" width="28" height="1" fill="#4A2545" />
        {/* Tiny paper plane / star stamp */}
        <rect x="11" y="15" width="10" height="2" fill="#E11D63" />
        <rect x="15" y="11" width="2" height="10" fill="#E11D63" />
        <rect x="13" y="13" width="6" height="6" fill="#FB7185" />
        <rect x="15" y="15" width="2" height="2" fill="#FFFBEB" />
      </svg>
    );
  }
  if (id === 'game') {
    return (
      <svg viewBox="0 0 32 28" className={className} shapeRendering="crispEdges" aria-hidden="true">
        {/* Retro handheld pixel console */}
        <rect x="6" y="2" width="20" height="24" fill="#DDD6FE" />
        <rect x="6" y="1" width="20" height="1" fill="#4A2545" />
        <rect x="6" y="26" width="20" height="1" fill="#4A2545" />
        <rect x="5" y="2" width="1" height="24" fill="#4A2545" />
        <rect x="26" y="2" width="1" height="24" fill="#4A2545" />
        {/* Screen */}
        <rect x="9" y="5" width="14" height="9" fill="#312E81" />
        <rect x="14" y="8" width="4" height="3" fill="#F472B6" />
        <rect x="11" y="7" width="1" height="1" fill="#FDE68A" />
        <rect x="20" y="10" width="1" height="1" fill="#FDE68A" />
        {/* D-pad + buttons */}
        <rect x="10" y="17" width="2" height="6" fill="#4A2545" />
        <rect x="8" y="19" width="6" height="2" fill="#4A2545" />
        <rect x="19" y="18" width="2" height="2" fill="#EC4899" />
        <rect x="22" y="20" width="2" height="2" fill="#F59E0B" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 28" className={className} shapeRendering="crispEdges" aria-hidden="true">
      {/* Love.txt paper note + heart seal */}
      <rect x="6" y="2" width="17" height="24" fill="#FFFBF5" />
      <rect x="23" y="6" width="3" height="20" fill="#FFFBF5" />
      <rect x="23" y="2" width="3" height="4" fill="#FBCFE8" />
      <rect x="6" y="1" width="17" height="1" fill="#4A2545" />
      <rect x="5" y="2" width="1" height="24" fill="#4A2545" />
      <rect x="6" y="26" width="20" height="1" fill="#4A2545" />
      <rect x="26" y="6" width="1" height="20" fill="#4A2545" />
      <rect x="22" y="2" width="1" height="4" fill="#4A2545" />
      <rect x="23" y="5" width="3" height="1" fill="#4A2545" />
      {/* Text lines */}
      <rect x="9" y="7" width="10" height="2" fill="#C084FC" />
      <rect x="9" y="11" width="13" height="1" fill="#D8B4FE" />
      <rect x="9" y="14" width="11" height="1" fill="#D8B4FE" />
      {/* Wax heart */}
      <rect x="15" y="18" width="2" height="2" fill="#E11D63" />
      <rect x="19" y="18" width="2" height="2" fill="#E11D63" />
      <rect x="15" y="20" width="6" height="2" fill="#E11D63" />
      <rect x="17" y="22" width="2" height="2" fill="#E11D63" />
    </svg>
  );
}

/** Die-cut Cat Meme Sticker SVG with thick white sticker border + sweet caption pill. */
function CatMemeSticker({
  variant,
  label,
  onTap,
  bouncing,
}: {
  variant: 0 | 1 | 2;
  label: string;
  onTap: () => void;
  bouncing: boolean;
}) {
  const bg = variant === 0 ? '#FFE4EC' : variant === 1 ? '#FEF3C7' : '#EDE9FE';
  const tilt = variant === 0 ? '-rotate-2' : variant === 1 ? 'rotate-2' : '-rotate-1';

  return (
    <button
      type="button"
      onClick={onTap}
      className={`group relative flex min-h-[44px] flex-col items-center gap-1 rounded-2xl border-[3px] border-white px-2.5 py-2 shadow-[0_6px_14px_-6px_rgba(74,37,69,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95 ${tilt} ${
        bouncing ? 'scale-110 -translate-y-1' : ''
      }`}
      style={{ backgroundColor: bg }}
    >
      <svg viewBox="0 0 36 28" className="h-9 w-11" shapeRendering="crispEdges" aria-hidden="true">
        {/* Cute meme cat face */}
        <rect x="8" y="3" width="3" height="4" fill="#FFFDF9" />
        <rect x="25" y="3" width="3" height="4" fill="#FFFDF9" />
        <rect x="7" y="2" width="4" height="1" fill="#4A2545" />
        <rect x="25" y="2" width="4" height="1" fill="#4A2545" />
        <rect x="6" y="7" width="24" height="16" fill="#FFFDF9" />
        <rect x="5" y="7" width="1" height="16" fill="#4A2545" />
        <rect x="30" y="7" width="1" height="16" fill="#4A2545" />
        <rect x="6" y="23" width="24" height="1" fill="#4A2545" />
        {variant === 0 ? (
          <>
            {/* Heart eyes */}
            <rect x="10" y="11" width="4" height="3" fill="#EC4899" />
            <rect x="11" y="14" width="2" height="1" fill="#EC4899" />
            <rect x="22" y="11" width="4" height="3" fill="#EC4899" />
            <rect x="23" y="14" width="2" height="1" fill="#EC4899" />
          </>
        ) : variant === 1 ? (
          <>
            {/* Cool pixel sunglasses */}
            <rect x="8" y="11" width="9" height="4" fill="#4A2545" />
            <rect x="19" y="11" width="9" height="4" fill="#4A2545" />
            <rect x="17" y="12" width="2" height="1" fill="#4A2545" />
            <rect x="10" y="12" width="2" height="1" fill="#FFFFFF" />
            <rect x="21" y="12" width="2" height="1" fill="#FFFFFF" />
          </>
        ) : (
          <>
            {/* Sparkle star eyes */}
            <rect x="11" y="11" width="2" height="4" fill="#7C3AED" />
            <rect x="10" y="12" width="4" height="2" fill="#7C3AED" />
            <rect x="23" y="11" width="2" height="4" fill="#7C3AED" />
            <rect x="22" y="12" width="4" height="2" fill="#7C3AED" />
          </>
        )}
        <rect x="7" y="16" width="3" height="2" fill="#FDA4AF" />
        <rect x="26" y="16" width="3" height="2" fill="#FDA4AF" />
        <rect x="17" y="16" width="2" height="1" fill="#F472B6" />
        <rect x="16" y="18" width="4" height="1" fill="#4A2545" />
      </svg>
      <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#4A2545] shadow-2xs">
        {label}
      </span>
    </button>
  );
}

/** Pressed-flower nature sprig SVG for the Travel Pinboard. */
function PressedFlowerSprigSvg({ className = 'h-16 w-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 76" className={className} fill="none" aria-hidden="true">
      {/* Translucent washi tape */}
      <rect
        x="16"
        y="32"
        width="32"
        height="11"
        rx="2"
        transform="rotate(-16 16 32)"
        fill="#FCE7F3"
        fillOpacity="0.85"
        stroke="#F9A8D4"
        strokeWidth="1"
      />
      {/* Stem & leaves */}
      <path d="M32 68C32 52 30 38 34 18" stroke="#4D7C5D" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M31 52C22 48 18 43 17 38C23 39 28 44 31 52Z" fill="#6B9E78" />
      <path d="M32 45C41 42 46 37 48 31C42 33 36 38 32 45Z" fill="#84B590" />
      {/* Tiny daisy petals */}
      <circle cx="34" cy="12" r="4" fill="#FFFDF9" />
      <circle cx="40" cy="17" r="4" fill="#FFFDF9" />
      <circle cx="37" cy="23" r="4" fill="#FFFDF9" />
      <circle cx="30" cy="22" r="4" fill="#FFFDF9" />
      <circle cx="28" cy="16" r="4" fill="#FFFDF9" />
      <circle cx="34" cy="17.5" r="3.6" fill="#FBBF24" />
    </svg>
  );
}

/** Animated spinning pixel cassette tape for Love.txt. */
function PixelCassetteSvg({ spinning, sideLabel, tapeTitle }: { spinning: boolean; sideLabel: string; tapeTitle: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[270px] rounded-xl border-2 border-[#4A2545] bg-[#FCE7F3] p-2.5 shadow-[0_4px_0_#4A2545]">
      <div className="rounded-lg border-2 border-[#4A2545] bg-[#FFFBF5] px-3 py-2">
        <div className="flex items-center justify-between gap-2 text-[10px] font-extrabold tracking-wider text-[#9D174D]">
          <span>{sideLabel}</span>
          <span className="truncate font-mono text-[#4A2545]">{tapeTitle}</span>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-md border-2 border-[#4A2545] bg-[#3B285A] px-4 py-2">
          {/* Left spinning reel */}
          <svg
            viewBox="0 0 24 24"
            className={`h-7 w-7 ${spinning ? 'mts-spin-slow' : ''}`}
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" fill="#FFFBF5" stroke="#4A2545" strokeWidth="2" />
            <circle cx="12" cy="12" r="3.5" fill="#3B285A" />
            <rect x="11" y="4" width="2" height="4" fill="#EC4899" />
            <rect x="11" y="16" width="2" height="4" fill="#EC4899" />
            <rect x="4" y="11" width="4" height="2" fill="#EC4899" />
            <rect x="16" y="11" width="4" height="2" fill="#EC4899" />
          </svg>
          {/* Tape window */}
          <div className="h-3.5 flex-1 mx-2.5 rounded-xs border border-[#F9A8D4]/50 bg-[#1E1B3A] flex items-center justify-center">
            <div className="h-1 w-3/4 rounded-full bg-[#F472B6]/80" />
          </div>
          {/* Right spinning reel */}
          <svg
            viewBox="0 0 24 24"
            className={`h-7 w-7 ${spinning ? 'mts-spin-slow' : ''}`}
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" fill="#FFFBF5" stroke="#4A2545" strokeWidth="2" />
            <circle cx="12" cy="12" r="3.5" fill="#3B285A" />
            <rect x="11" y="4" width="2" height="4" fill="#FBBF24" />
            <rect x="11" y="16" width="2" height="4" fill="#FBBF24" />
            <rect x="4" y="11" width="4" height="2" fill="#FBBF24" />
            <rect x="16" y="11" width="4" height="2" fill="#FBBF24" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/** Layered animated pixel sky wallpaper (stars, crescent moon, drifting clouds, pixel pine hills, floating hearts). */
function PixelDesktopWallpaper() {
  const stars = [
    { left: '8%', top: '12%', delay: '0s', size: 'h-1.5 w-1.5' },
    { left: '19%', top: '22%', delay: '0.7s', size: 'h-1 w-1' },
    { left: '34%', top: '10%', delay: '1.3s', size: 'h-1.5 w-1.5' },
    { left: '49%', top: '18%', delay: '0.4s', size: 'h-1 w-1' },
    { left: '63%', top: '9%', delay: '1.6s', size: 'h-1.5 w-1.5' },
    { left: '76%', top: '24%', delay: '0.9s', size: 'h-1 w-1' },
    { left: '90%', top: '15%', delay: '1.1s', size: 'h-1.5 w-1.5' },
    { left: '27%', top: '32%', delay: '1.8s', size: 'h-1 w-1' },
    { left: '70%', top: '34%', delay: '0.2s', size: 'h-1 w-1' },
  ];

  const floatingHearts = [
    { left: '14%', delay: '0s', duration: '9s' },
    { left: '44%', delay: '3.2s', duration: '11s' },
    { left: '78%', delay: '1.6s', duration: '10s' },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #1E1B3A 0%, #3B285A 34%, #D9778A 72%, #FDE2C4 100%)',
      }}
    >
      {/* Twinkling pixel starfield */}
      {stars.map((star, idx) => (
        <span
          key={idx}
          className={`mts-twinkle absolute rounded-[1px] bg-[#FEF3C7] ${star.size}`}
          style={{ left: star.left, top: star.top, animationDelay: star.delay }}
        />
      ))}

      {/* Glowing pixel crescent moon */}
      <div className="mts-moon-bob absolute right-6 top-14 sm:right-12 sm:top-16">
        <div className="absolute -inset-3 rounded-full bg-[#FDE68A]/20 blur-md" />
        <PixelMoonSvg className="relative h-11 w-11 sm:h-14 sm:w-14" />
      </div>

      {/* Drifting pixel clouds */}
      <div className="mts-cloud-slow absolute top-[18%] -left-24 opacity-85">
        <PixelCloudSvg className="h-9 w-24 sm:h-11 sm:w-32" tint="#FFF1F5" />
      </div>
      <div className="mts-cloud-med absolute top-[34%] -left-32 opacity-75">
        <PixelCloudSvg className="h-8 w-20 sm:h-10 sm:w-28" tint="#FDE2C4" />
      </div>
      <div className="mts-cloud-fast absolute top-[50%] -left-28 opacity-65">
        <PixelCloudSvg className="h-7 w-20 sm:h-9 sm:w-24" tint="#FCE7F3" />
      </div>

      {/* Gentle rising pixel hearts */}
      {floatingHearts.map((heart, idx) => (
        <div
          key={idx}
          className="mts-heart-rise absolute bottom-16 opacity-60"
          style={{
            left: heart.left,
            animationDelay: heart.delay,
            animationDuration: heart.duration,
          }}
        >
          <PixelHeartSvg className="h-3.5 w-3.5" fill="#FBCFE8" />
        </div>
      ))}

      {/* Distant layered pixel pine hills along the bottom horizon */}
      <svg
        viewBox="0 0 360 110"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-32 w-full sm:h-40"
        shapeRendering="crispEdges"
      >
        {/* Back lavender-plum ridge */}
        <path
          d="M0 110V62H24V54H54V48H86V56H120V64H158V52H196V44H232V52H268V60H306V50H338V58H360V110Z"
          fill="#4A2E5E"
          fillOpacity="0.65"
        />
        {/* Mid twilight pine ridge */}
        <path
          d="M0 110V74H32V68H68V76H108V70H150V78H198V68H244V74H292V66H332V74H360V110Z"
          fill="#2D1D45"
          fillOpacity="0.88"
        />
        {/* Stepped pixel pine trees */}
        <g fill="#1E1436">
          <rect x="26" y="54" width="4" height="20" />
          <rect x="22" y="58" width="12" height="5" />
          <rect x="20" y="64" width="16" height="6" />

          <rect x="52" y="60" width="4" height="16" />
          <rect x="48" y="64" width="12" height="5" />

          <rect x="286" y="50" width="4" height="22" />
          <rect x="282" y="54" width="12" height="6" />
          <rect x="279" y="61" width="18" height="6" />

          <rect x="316" y="58" width="4" height="16" />
          <rect x="312" y="62" width="12" height="5" />
        </g>
        {/* Tiny cozy lit cottage window in the valley */}
        <rect x="168" y="68" width="16" height="10" fill="#23163B" />
        <rect x="171" y="71" width="4" height="4" fill="#FDE68A" />
        <rect x="178" y="71" width="3" height="4" fill="#FDBA74" />
        {/* Foreground ground */}
        <rect x="0" y="84" width="360" height="26" fill="#1C1433" />
      </svg>
    </div>
  );
}

/* ===========================
   APP 1: HER FOLDER (POLAROID & CAT STICKERS)
   =========================== */

function HerFolderApp({
  photos,
  copy,
  isHindi,
}: {
  photos?: string[];
  copy: OsCopy;
  isHindi: boolean;
}) {
  const galleryItems = useMemo(() => {
    const validBuyerPhotos = (photos ?? []).filter((src) => typeof src === 'string' && src.trim().length > 0);
    if (validBuyerPhotos.length > 0) {
      return validBuyerPhotos.slice(0, 6).map((url, idx) => ({
        url,
        caption: SAMPLE_HER_PHOTOS[idx % SAMPLE_HER_PHOTOS.length].caption,
        gradient: SAMPLE_HER_PHOTOS[idx % SAMPLE_HER_PHOTOS.length].gradient,
      }));
    }
    return SAMPLE_HER_PHOTOS;
  }, [photos]);

  const [likes, setLikes] = useState<Record<number, number>>({ 0: 12, 1: 9, 2: 15, 3: 11 });
  const [failedIdx, setFailedIdx] = useState<Record<number, boolean>>({});
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);
  const [bouncingSticker, setBouncingSticker] = useState<number | null>(null);

  const handleHeart = (idx: number) => {
    playSoftChime(659.25, 0.16);
    setLikes((prev) => ({ ...prev, [idx]: (prev[idx] ?? 1) + 1 }));
  };

  const handleStickerTap = (idx: number) => {
    playSoftChime(523.25 + idx * 80, 0.16);
    setBouncingSticker(idx);
    window.setTimeout(() => setBouncingSticker((cur) => (cur === idx ? null : cur)), 260);
  };

  const tilts = ['-rotate-1', 'rotate-1', 'rotate-1', '-rotate-1'];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className={`text-base font-extrabold text-[#4A2545] ${isHindi ? 'leading-relaxed' : ''}`}>
          {copy.herTitle}
        </h3>
        <p className="mt-0.5 text-xs text-[#7B4B6A]">{copy.herSubtitle}</p>
      </div>

      {/* Polaroid Photobooth Grid */}
      <div className="grid grid-cols-2 gap-3">
        {galleryItems.map((item, idx) => (
          <div
            key={`${item.url.slice(0, 28)}-${idx}`}
            className={`relative rounded-xl border-2 border-[#4A2545] bg-white p-1.5 pb-2 shadow-[0_4px_0_rgba(74,37,69,0.2)] transition-transform duration-200 hover:rotate-0 ${
              tilts[idx % tilts.length]
            }`}
          >
            {/* Masking tape strip */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-2 left-1/2 h-3.5 w-10 -translate-x-1/2 -rotate-2 rounded-[2px] bg-[#FBCFE8]/85 shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setZoomIdx(idx)}
              aria-label={`${copy.tapToZoom} ${idx + 1}`}
              className="block aspect-square w-full overflow-hidden rounded-lg border border-[#4A2545]/15 focus-visible:outline-2 focus-visible:outline-[#EC4899]"
              style={{ background: item.gradient }}
            >
              {!failedIdx[idx] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.url}
                  alt={item.caption}
                  loading="lazy"
                  onError={() => setFailedIdx((prev) => ({ ...prev, [idx]: true }))}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <PixelHeartSvg className="h-8 w-8" fill="#EC4899" />
                </div>
              )}
            </button>

            <div className="mt-1.5 flex items-center justify-between gap-1 px-0.5">
              <span className="truncate text-[11px] font-bold text-[#5C2D54]">{item.caption}</span>
              <button
                type="button"
                onClick={() => handleHeart(idx)}
                className="inline-flex min-h-[30px] items-center gap-1 rounded-full bg-[#FFF1F5] px-2 py-0.5 text-[11px] font-extrabold text-[#DB2777] transition-transform active:scale-90"
              >
                <PixelHeartSvg className="h-3 w-3" fill="#EC4899" />
                <span>{likes[idx] ?? 1}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Die-cut Cat Meme Stickers Row */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {([0, 1, 2] as const).map((idx) => (
          <CatMemeSticker
            key={idx}
            variant={idx}
            label={copy.stickers[idx]}
            bouncing={bouncingSticker === idx}
            onTap={() => handleStickerTap(idx)}
          />
        ))}
      </div>

      {/* Fullscreen Lightbox Zoom */}
      {zoomIdx !== null && galleryItems[zoomIdx] ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1B3A]/80 p-4 backdrop-blur-xs"
          onClick={() => setZoomIdx(null)}
        >
          <div
            className="mts-window-pop relative w-full max-w-sm rounded-2xl border-2 border-[#4A2545] bg-[#FFFBF5] p-3 shadow-[0_8px_0_#4A2545]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="aspect-square w-full overflow-hidden rounded-xl border border-[#4A2545]/15"
              style={{ background: galleryItems[zoomIdx].gradient }}
            >
              {!failedIdx[zoomIdx] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={galleryItems[zoomIdx].url}
                  alt={galleryItems[zoomIdx].caption}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <PixelHeartSvg className="h-14 w-14" fill="#EC4899" />
                </div>
              )}
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <span className="text-sm font-extrabold text-[#4A2545]">
                {galleryItems[zoomIdx].caption}
              </span>
              <button
                type="button"
                onClick={() => setZoomIdx(null)}
                className="min-h-[40px] rounded-lg border-2 border-[#4A2545] bg-[#FCE7F3] px-3.5 text-xs font-extrabold text-[#4A2545] shadow-[0_2px_0_#4A2545] active:translate-y-0.5"
              >
                {copy.closeLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ===========================
   APP 2: DREAM FOLDER (TRAVEL PINBOARD & BOARDING PASS)
   =========================== */

function DreamBoardApp({
  receiverName,
  coreLang,
  copy,
  isHindi,
}: {
  receiverName: string;
  coreLang: CoreLanguageCode;
  copy: OsCopy;
  isHindi: boolean;
}) {
  const [selectedStop, setSelectedStop] = useState<TravelStop | null>(null);
  const [failedStops, setFailedStops] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-3.5">
      {/* Warm Corkboard Container */}
      <div
        className="relative overflow-hidden rounded-xl border-2 border-[#6B4423] p-3 shadow-inner"
        style={{
          backgroundColor: '#D6A472',
          backgroundImage:
            'radial-gradient(rgba(92,51,23,0.16) 1px, transparent 1px), radial-gradient(rgba(255,245,230,0.18) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
          backgroundPosition: '0 0, 7px 7px',
        }}
      >
        {/* Pressed flower taped to top-right corner */}
        <div className="pointer-events-none absolute -right-1 -top-1 opacity-95">
          <PressedFlowerSprigSvg className="h-14 w-12" />
        </div>

        <div className="mb-2.5 flex items-center justify-between pr-8">
          <span className="rounded-md border border-[#6B4423]/40 bg-[#FFFBF5]/90 px-2 py-0.5 text-[11px] font-extrabold text-[#4A2545] shadow-2xs">
            {copy.dreamTitle}
          </span>
        </div>

        {selectedStop ? (
          /* Postcard Detail Flip View */
          <div className="mts-window-pop relative rounded-xl border-2 border-[#4A2545] bg-[#FFFBF5] p-3 shadow-[0_4px_0_rgba(74,37,69,0.28)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-block rounded-full bg-[#FCE7F3] px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-[#9D174D]">
                    {selectedStop.dateCode}
                  </span>
                  <span className="inline-block rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-[#92400E]">
                    {selectedStop.tag}
                  </span>
                </div>
                <h4 className="mt-1 text-base font-extrabold text-[#4A2545]">
                  {selectedStop.city}
                </h4>
              </div>
              {/* Passport Stamp */}
              <div className="flex h-11 w-11 shrink-0 -rotate-12 flex-col items-center justify-center rounded-full border-2 border-dashed border-[#E11D63] text-[9px] font-black text-[#E11D63]">
                <span>{selectedStop.stampCode}</span>
                <span className="text-[7px]">OK</span>
              </div>
            </div>

            <p
              className={`mt-2.5 rounded-lg border border-[#FBCFE8] bg-[#FFF5F8] p-2.5 text-xs font-semibold text-[#5C2D54] ${
                isHindi ? 'leading-relaxed' : 'leading-snug'
              }`}
            >
              {selectedStop.note[coreLang]}
            </p>

            <button
              type="button"
              onClick={() => setSelectedStop(null)}
              className="mt-3 min-h-[40px] w-full rounded-lg border-2 border-[#4A2545] bg-[#FDE68A] text-xs font-extrabold text-[#4A2545] shadow-[0_2px_0_#4A2545] active:translate-y-0.5"
            >
              {copy.postcardBack}
            </button>
          </div>
        ) : (
          /* Pinned Polaroids + Red String */
          <div className="relative">
            {/* Red string connecting pinned destinations */}
            <svg
              viewBox="0 0 280 200"
              className="pointer-events-none absolute inset-0 h-full w-full"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M70 14 L210 18 L72 114 L208 118"
                stroke="#DC2626"
                strokeWidth="2"
                strokeDasharray="4 3"
                strokeOpacity="0.82"
              />
            </svg>

            <div className="relative grid grid-cols-2 gap-3">
              {TRAVEL_STOPS.map((stop) => (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => {
                    playSoftChime(587.33, 0.16);
                    setSelectedStop(stop);
                  }}
                  className={`group relative rounded-lg border-2 border-[#4A2545] bg-[#FFFDF9] p-1.5 pb-2 text-left shadow-[0_4px_0_rgba(74,37,69,0.22)] transition-transform duration-200 hover:z-10 hover:rotate-0 hover:scale-[1.03] active:scale-95 ${stop.tiltClass}`}
                >
                  {/* Red pushpin */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-[#4A2545] bg-[#EF4444] shadow-xs"
                  />
                  <div
                    className="aspect-[4/3] w-full overflow-hidden rounded-sm border border-[#4A2545]/15"
                    style={{ background: stop.fallbackGradient }}
                  >
                    {!failedStops[stop.id] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={stop.imageUrl}
                        alt={stop.city}
                        loading="lazy"
                        onError={() =>
                          setFailedStops((prev) => ({ ...prev, [stop.id]: true }))
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <PixelStarSvg className="h-6 w-6" fill="#FFFBEB" />
                      </div>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-1">
                    <span className="truncate text-[11px] font-extrabold text-[#4A2545]">
                      {stop.city}
                    </span>
                    <span className="rounded bg-[#FCE7F3] px-1 py-0.5 text-[8px] font-black text-[#9D174D]">
                      {stop.stampCode}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-center text-[11px] font-bold text-[#4A2545] bg-[#FFFBF5]/80 rounded-full py-0.5 px-2.5 mx-auto w-fit">
              {copy.tapPinHint}
            </p>
          </div>
        )}
      </div>

      {/* Vintage Boarding Pass */}
      <div className="relative overflow-hidden rounded-xl border-2 border-[#4A2545] bg-[#FFFBF5] p-3 shadow-[0_4px_0_#4A2545]">
        <div className="flex items-center justify-between border-b-2 border-dashed border-[#F9A8D4] pb-2">
          <div className="min-w-0">
            <div className="text-[9px] font-extrabold tracking-widest text-[#9D174D]">
              {copy.boardingFrom}
            </div>
            <div className="truncate text-xs font-black text-[#4A2545]">
              {copy.boardingFromVal}
            </div>
          </div>
          <svg viewBox="0 0 28 16" className="mx-1 h-4 w-7 shrink-0 text-[#EC4899]" fill="currentColor" aria-hidden="true">
            <path d="M2 7H19L15 2H18L26 8L18 14H15L19 9H2V7Z" />
          </svg>
          <div className="min-w-0 text-right">
            <div className="text-[9px] font-extrabold tracking-widest text-[#9D174D]">
              {copy.boardingTo}
            </div>
            <div className="truncate text-xs font-black text-[#4A2545]">
              {copy.boardingToVal}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 text-[10px]">
          <div className="min-w-0">
            <div className="font-bold text-[#7B4B6A]">{copy.boardingPassenger}</div>
            <div className="truncate font-extrabold text-[#4A2545]">{receiverName}</div>
          </div>
          <div>
            <div className="font-bold text-[#7B4B6A]">{copy.boardingSeat}</div>
            <div className="font-extrabold text-[#4A2545]">01A</div>
          </div>
          <div>
            <div className="font-bold text-[#7B4B6A]">{copy.boardingGate}</div>
            <div className="font-extrabold text-[#EC4899]">LUV</div>
          </div>
          {/* Crisp SVG barcode */}
          <svg viewBox="0 0 36 22" className="h-6 w-10 shrink-0" shapeRendering="crispEdges" aria-hidden="true">
            <rect x="0" y="2" width="2" height="18" fill="#4A2545" />
            <rect x="4" y="2" width="1" height="18" fill="#4A2545" />
            <rect x="7" y="2" width="3" height="18" fill="#4A2545" />
            <rect x="12" y="2" width="1" height="18" fill="#4A2545" />
            <rect x="15" y="2" width="2" height="18" fill="#4A2545" />
            <rect x="19" y="2" width="3" height="18" fill="#4A2545" />
            <rect x="24" y="2" width="1" height="18" fill="#4A2545" />
            <rect x="27" y="2" width="2" height="18" fill="#4A2545" />
            <rect x="31" y="2" width="3" height="18" fill="#4A2545" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ===========================
   APP 3: PIXEL HEART & BOBA CATCHER GAME
   =========================== */

function PixelCatcherGameApp({
  receiverName,
  copy,
  isHindi,
}: {
  receiverName: string;
  copy: OsCopy;
  isHindi: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [catX, setCatX] = useState(50);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [bursts, setBursts] = useState<CatchBurst[]>([]);
  const [score, setScore] = useState(0);
  const [catches, setCatches] = useState(0);
  const [combo, setCombo] = useState(0);
  const [awardShown, setAwardShown] = useState(false);
  const [awardDismissed, setAwardDismissed] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const catXRef = useRef(50);
  const nextIdRef = useRef(1);
  const spawnCounterRef = useRef(0);

  const updateCatX = useCallback((next: number) => {
    const clamped = Math.max(10, Math.min(90, next));
    catXRef.current = clamped;
    setCatX(clamped);
  }, []);

  const resetGame = useCallback(() => {
    setScore(0);
    setCatches(0);
    setCombo(0);
    setItems([]);
    setBursts([]);
    setAwardShown(false);
    setAwardDismissed(false);
    updateCatX(50);
    setPlaying(true);
  }, [updateCatX]);

  // Keyboard controls (ArrowLeft / ArrowRight / A / D)
  useEffect(() => {
    if (!playing) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        updateCatX(catXRef.current - 9);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        updateCatX(catXRef.current + 9);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [playing, updateCatX]);

  // Core game tick (50ms interval, lightweight & smooth)
  useEffect(() => {
    if (!playing) return;
    const kinds: ReadonlyArray<{ kind: FallingKind; points: number; speed: number }> = [
      { kind: 'heart', points: 1, speed: 2.6 },
      { kind: 'boba', points: 2, speed: 2.9 },
      { kind: 'sunflower', points: 2, speed: 2.7 },
      { kind: 'star', points: 3, speed: 3.3 },
    ];

    const interval = window.setInterval(() => {
      spawnCounterRef.current += 1;
      let spawned: FallingItem | null = null;
      if (spawnCounterRef.current >= 14) {
        spawnCounterRef.current = 0;
        const pick = kinds[Math.floor(Math.random() * kinds.length)];
        spawned = {
          id: nextIdRef.current++,
          kind: pick.kind,
          x: 12 + Math.random() * 76,
          y: 0,
          speed: pick.speed + Math.random() * 0.7,
          points: pick.points,
        };
      }

      setItems((prev) => {
        const nextList: FallingItem[] = [];
        let caughtCount = 0;
        let caughtPoints = 0;
        let missedAny = false;
        const newBursts: CatchBurst[] = [];

        const working = spawned ? [...prev, spawned] : prev;
        for (const item of working) {
          const nextY = item.y + item.speed;
          const inCatchZone = nextY >= 74 && nextY <= 92 && Math.abs(item.x - catXRef.current) <= 14;
          if (inCatchZone) {
            caughtCount += 1;
            caughtPoints += item.points;
            newBursts.push({
              id: nextIdRef.current++,
              x: item.x,
              y: 74,
              label: `+${item.points}`,
            });
          } else if (nextY > 98) {
            missedAny = true;
          } else {
            nextList.push({ ...item, y: nextY });
          }
        }

        if (caughtCount > 0) {
          playSoftChime(660 + caughtPoints * 35, 0.14);
          setScore((s) => s + caughtPoints);
          setCombo((c) => c + caughtCount);
          setCatches((total) => {
            const updated = total + caughtCount;
            if (updated >= 8) {
              setAwardShown(true);
            }
            return updated;
          });
          setBursts((b) => [...b.slice(-5), ...newBursts]);
        } else if (missedAny) {
          setCombo(0);
        }

        return nextList;
      });
    }, 55);

    return () => window.clearInterval(interval);
  }, [playing]);

  // Clear old catch bursts
  useEffect(() => {
    if (bursts.length === 0) return;
    const t = window.setTimeout(() => {
      setBursts((prev) => prev.slice(1));
    }, 550);
    return () => window.clearTimeout(t);
  }, [bursts]);

  const handleStagePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!playing || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    updateCatX(pct);
  };

  return (
    <div className="space-y-3">
      {/* HUD bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#4A2545] bg-[#FFFBF5] px-3 py-2 text-xs font-extrabold text-[#4A2545]">
        <div className="flex items-center gap-3">
          <span>
            {copy.gameScoreLabel}: <span className="text-[#DB2777]">{score}</span>
          </span>
          <span>
            {copy.gameCatchesLabel}: <span className="text-[#7C3AED]">{catches}</span>
          </span>
        </div>
        {combo >= 2 ? (
          <span className="rounded-full bg-[#FDE68A] px-2 py-0.5 text-[10px] font-black text-[#4A2545]">
            {copy.gameComboLabel(combo)}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-[#7B4B6A]">
            {copy.gameGoalLabel(catches)}
          </span>
        )}
      </div>

      {/* Layered Pixel Meadow + Starry Sky Game Stage */}
      <div
        ref={stageRef}
        onPointerDown={handleStagePointer}
        onPointerMove={(e) => {
          if (e.buttons > 0 || e.pointerType === 'touch') {
            handleStagePointer(e);
          }
        }}
        className="relative h-64 w-full touch-none select-none overflow-hidden rounded-xl border-2 border-[#4A2545] shadow-inner"
        style={{
          background:
            'linear-gradient(180deg, #1E1B3A 0%, #3B285A 48%, #B4698D 82%, #FDE2C4 100%)',
        }}
      >
        {/* Starry sky + moon + meadow backdrop */}
        <span className="mts-twinkle absolute left-[14%] top-[12%] h-1 w-1 bg-[#FEF3C7]" />
        <span className="mts-twinkle absolute left-[46%] top-[9%] h-1.5 w-1.5 bg-[#FEF3C7]" />
        <span className="mts-twinkle absolute left-[76%] top-[16%] h-1 w-1 bg-[#FEF3C7]" />
        <div className="mts-moon-bob absolute right-4 top-3 opacity-90">
          <PixelMoonSvg className="h-9 w-9" />
        </div>
        <div className="mts-cloud-slow absolute top-[22%] -left-16 opacity-60">
          <PixelCloudSvg className="h-6 w-16" tint="#FFF1F5" />
        </div>

        {/* Pixel meadow ground */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-11 bg-[#2F5D4E] border-t-4 border-[#4E8B6E]">
          <span className="absolute left-[14%] top-2 h-1.5 w-1.5 bg-[#FDE047]" />
          <span className="absolute left-[38%] top-4 h-1.5 w-1.5 bg-[#F9A8D4]" />
          <span className="absolute left-[72%] top-2.5 h-1.5 w-1.5 bg-[#FFFBEB]" />
          <span className="absolute left-[88%] top-4 h-1.5 w-1.5 bg-[#FDE047]" />
        </div>

        {/* Falling collectibles */}
        {items.map((item) => (
          <div
            key={item.id}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            {item.kind === 'heart' ? (
              <PixelHeartSvg className="h-5 w-5 drop-shadow-xs" fill="#F472B6" />
            ) : item.kind === 'boba' ? (
              <PixelBobaSvg className="h-6 w-5 drop-shadow-xs" />
            ) : item.kind === 'sunflower' ? (
              <PixelSunflowerSvg className="h-6 w-6 drop-shadow-xs" />
            ) : (
              <PixelStarSvg className="h-5 w-5 drop-shadow-xs" fill="#FDE047" />
            )}
          </div>
        ))}

        {/* Floating +1/+2/+3 sparkle bursts */}
        {bursts.map((b) => (
          <div
            key={b.id}
            className="mts-burst-up pointer-events-none absolute -translate-x-1/2 text-xs font-black text-[#FEF08A] drop-shadow-[0_1px_0_#4A2545]"
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
          >
            {b.label}
          </div>
        ))}

        {/* Controllable Pixel Cat Catcher */}
        <div
          className="pointer-events-none absolute bottom-2 -translate-x-1/2 transition-[left] duration-75"
          style={{ left: `${catX}%` }}
        >
          <PixelCatCompanionSvg happy={combo >= 2} className="h-14 w-14" />
        </div>

        {/* Start Overlay */}
        {!playing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1E1B3A]/60 p-4 text-center backdrop-blur-[1px]">
            <div className="flex items-center gap-2">
              <PixelHeartSvg className="h-5 w-5" fill="#F472B6" />
              <PixelBobaSvg className="h-6 w-5" />
              <PixelSunflowerSvg className="h-6 w-6" />
            </div>
            <h4 className="mt-2 text-base font-extrabold text-[#FFFBF5]">{copy.gameTitle}</h4>
            <p className="mt-0.5 text-[11px] text-[#FDE2C4]">{copy.gamePlayingHint}</p>
            <button
              type="button"
              onClick={resetGame}
              className="mt-3 min-h-[42px] rounded-xl border-2 border-[#4A2545] bg-[#FDE68A] px-5 text-xs font-black text-[#4A2545] shadow-[0_3px_0_#4A2545] active:translate-y-0.5"
            >
              {copy.gameStart}
            </button>
          </div>
        ) : null}

        {/* Secret Award Overlay unlocked at 8+ catches */}
        {awardShown && !awardDismissed ? (
          <div className="mts-window-pop absolute inset-0 flex items-center justify-center bg-[#1E1B3A]/75 p-3 backdrop-blur-xs">
            <div className="w-full max-w-[260px] rounded-2xl border-2 border-[#4A2545] bg-[#FFFBF5] p-3.5 text-center shadow-[0_6px_0_#4A2545]">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#4A2545] bg-[#FDE68A]">
                <PixelStarSvg className="h-5 w-5" fill="#E11D63" />
              </div>
              <div className="mt-1.5 text-[10px] font-black tracking-widest text-[#DB2777]">
                {copy.awardBadge}
              </div>
              <h4 className={`mt-0.5 text-sm font-extrabold text-[#4A2545] ${isHindi ? 'leading-relaxed' : ''}`}>
                {copy.awardTitle}
              </h4>
              <p className={`mt-1 text-[11px] text-[#6B4263] ${isHindi ? 'leading-relaxed' : ''}`}>
                {copy.awardSubtitle(receiverName)}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAwardDismissed(true)}
                  className="min-h-[40px] flex-1 rounded-lg border-2 border-[#4A2545] bg-[#FCE7F3] text-xs font-extrabold text-[#4A2545] shadow-[0_2px_0_#4A2545]"
                >
                  {copy.awardKeepPlaying}
                </button>
                <button
                  type="button"
                  onClick={resetGame}
                  className="min-h-[40px] flex-1 rounded-lg border-2 border-[#4A2545] bg-[#FDE68A] text-xs font-extrabold text-[#4A2545] shadow-[0_2px_0_#4A2545]"
                >
                  {copy.awardReplay}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Touch-friendly Left / Right buttons for PhoneFrame */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            if (!playing) setPlaying(true);
            updateCatX(catXRef.current - 12);
          }}
          className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border-2 border-[#4A2545] bg-[#FFFBF5] text-xs font-black text-[#4A2545] shadow-[0_3px_0_#4A2545] active:translate-y-0.5"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M10 3L4 8L10 13V3Z" />
          </svg>
          <span>LEFT</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (!playing) setPlaying(true);
            updateCatX(catXRef.current + 12);
          }}
          className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border-2 border-[#4A2545] bg-[#FFFBF5] text-xs font-black text-[#4A2545] shadow-[0_3px_0_#4A2545] active:translate-y-0.5"
        >
          <span>RIGHT</span>
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M6 3L12 8L6 13V3Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ===========================
   APP 4: LOVE.TXT / MIXTAPE APP
   =========================== */

function LoveTxtApp({
  receiverName,
  senderName,
  headline,
  message,
  tapeTitle,
  copy,
  isHindi,
}: {
  receiverName: string;
  senderName: string;
  headline: string;
  message: string;
  tapeTitle: string;
  copy: OsCopy;
  isHindi: boolean;
}) {
  const [spinning, setSpinning] = useState(true);

  const toggleTape = () => {
    setSpinning((prev) => {
      const next = !prev;
      if (next) {
        playSoftChime(523.25, 0.25);
      }
      return next;
    });
  };

  return (
    <div className="relative space-y-4 overflow-hidden">
      {/* Gentle floating pixel petals */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="mts-petal-fall absolute left-[12%] -top-2 h-2 w-2 rounded-xs bg-[#F9A8D4]/70" />
        <span
          className="mts-petal-fall absolute left-[58%] -top-2 h-2 w-2 rounded-xs bg-[#FDE68A]/80"
          style={{ animationDelay: '2.2s' }}
        />
        <span
          className="mts-petal-fall absolute left-[84%] -top-2 h-2 w-2 rounded-xs bg-[#FBCFE8]/80"
          style={{ animationDelay: '4s' }}
        />
      </div>

      {/* Animated Spinning Pixel Cassette */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <PixelCassetteSvg spinning={spinning} sideLabel={copy.cassetteSide} tapeTitle={tapeTitle} />
        <button
          type="button"
          onClick={toggleTape}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border-2 border-[#4A2545] bg-[#FFFBF5] px-3.5 text-[11px] font-extrabold text-[#4A2545] shadow-[0_2px_0_#4A2545] active:translate-y-0.5"
        >
          <PixelHeartSvg className="h-3 w-3" fill={spinning ? '#EC4899' : '#A78BFA'} />
          <span>{spinning ? copy.cassettePause : copy.cassettePlay}</span>
        </button>
      </div>

      {/* Warm Minimal Love Letter Paper */}
      <article className="relative z-10 rounded-xl border-2 border-[#4A2545] bg-[#FFFDF9] p-4 shadow-[0_4px_0_rgba(74,37,69,0.2)]">
        <div className="flex items-center justify-between border-b border-[#FCE7F3] pb-2">
          <span className="text-[11px] font-extrabold text-[#DB2777]">{copy.loveTitle}</span>
          <PixelHeartSvg className="h-3.5 w-3.5" fill="#F472B6" />
        </div>

        <p className={`mt-3 text-xs font-extrabold text-[#7B4B6A] ${isHindi ? 'leading-relaxed' : ''}`}>
          {copy.dearLabel(receiverName)}
        </p>

        <h3
          className={`mt-1 text-base font-extrabold text-[#4A2545] ${
            isHindi ? 'leading-relaxed tracking-normal' : 'leading-snug'
          }`}
        >
          {headline}
        </h3>

        <p
          className={`mt-2.5 whitespace-pre-line text-sm text-[#5C2D54] ${
            isHindi ? 'leading-relaxed tracking-normal' : 'leading-relaxed'
          }`}
        >
          {message}
        </p>

        <p className="mt-4 text-right text-xs font-extrabold text-[#9D174D]">
          {copy.signedLabel(senderName)}
        </p>
      </article>
    </div>
  );
}

/* ===========================
   MAIN EXPORT: MakeThemSmileSite
   =========================== */

export function MakeThemSmileSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const [activeApp, setActiveApp] = useState<DesktopAppId | null>(null);
  const [catBubbleIdx, setCatBubbleIdx] = useState(0);
  const [catBouncing, setCatBouncing] = useState(false);
  const [catHearts, setCatHearts] = useState<CatHeartBurst[]>([]);
  const [clockText, setClockText] = useState('08:24');

  const openedFiredRef = useRef(false);
  const catHeartIdRef = useRef(1);

  const coreLang = toCoreLanguageCode(language);
  const copy = COPY[coreLang] ?? COPY.en;
  const isHindi = coreLang === 'hi';

  const headline = pickLocalizedText(data.headline, language);
  const message = pickLocalizedText(data.message, language);
  const tapeTitle = manifest.music[0]?.label ?? 'Sweetest Mix';

  // Live retro clock in top OS bar
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setClockText(`${hh}:${mm}`);
    };
    updateClock();
    const id = window.setInterval(updateClock, 30000);
    return () => window.clearInterval(id);
  }, []);

  const openApp = useCallback(
    (appId: DesktopAppId) => {
      playSoftChime(appId === 'love' ? 587.33 : 523.25, 0.16);
      setActiveApp(appId);
      if (appId === 'love' && !openedFiredRef.current) {
        openedFiredRef.current = true;
        onOpened?.();
      }
    },
    [onOpened]
  );

  const handlePetCat = () => {
    playSoftChime(659.25 + (catBubbleIdx % 3) * 65, 0.18);
    setCatBouncing(true);
    setCatBubbleIdx((idx) => (idx + 1) % copy.catBubbles.length);
    const id = catHeartIdRef.current++;
    setCatHearts((prev) => [...prev.slice(-4), { id, dx: (id % 3 - 1) * 14 }]);
    window.setTimeout(() => setCatBouncing(false), 260);
    window.setTimeout(() => {
      setCatHearts((prev) => prev.filter((h) => h.id !== id));
    }, 850);
  };

  const desktopApps: readonly DesktopAppId[] = ['her', 'dream', 'game', 'love'];

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-x-clip bg-[#1E1B3A] font-sans text-[#4A2545] selection:bg-[#FBCFE8] selection:text-[#4A2545]">
      <style>{`
        @keyframes mtsTwinkle {
          0%, 100% { opacity: 0.35; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes mtsMoonBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes mtsCloudDrift {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100vw + 220px)); }
        }
        @keyframes mtsHeartRise {
          0% { transform: translateY(0) scale(0.85); opacity: 0; }
          20% { opacity: 0.7; }
          85% { opacity: 0.5; }
          100% { transform: translateY(-220px) scale(1.1); opacity: 0; }
        }
        @keyframes mtsTailWag {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes mtsWindowPop {
          0% { opacity: 0; transform: translateY(14px) scale(0.94); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mtsSpinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes mtsPetalFall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          15% { opacity: 0.85; }
          100% { transform: translateY(260px) translateX(24px) rotate(160deg); opacity: 0; }
        }
        @keyframes mtsBurstUp {
          0% { opacity: 1; transform: translate(-50%, 0) scale(0.9); }
          100% { opacity: 0; transform: translate(-50%, -26px) scale(1.2); }
        }
        .mts-twinkle { animation: mtsTwinkle 2.8s ease-in-out infinite; }
        .mts-moon-bob { animation: mtsMoonBob 5s ease-in-out infinite; }
        .mts-cloud-slow { animation: mtsCloudDrift 46s linear infinite; }
        .mts-cloud-med { animation: mtsCloudDrift 34s linear infinite; animation-delay: -12s; }
        .mts-cloud-fast { animation: mtsCloudDrift 26s linear infinite; animation-delay: -6s; }
        .mts-heart-rise { animation: mtsHeartRise 10s ease-in infinite; }
        .mts-tail-wag { animation: mtsTailWag 1.8s ease-in-out infinite; }
        .mts-window-pop { animation: mtsWindowPop 240ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .mts-spin-slow { animation: mtsSpinSlow 4.5s linear infinite; }
        .mts-petal-fall { animation: mtsPetalFall 7s linear infinite; }
        .mts-burst-up { animation: mtsBurstUp 520ms ease-out forwards; }
        @media (prefers-reduced-motion: reduce) {
          .mts-twinkle, .mts-moon-bob, .mts-cloud-slow, .mts-cloud-med, .mts-cloud-fast,
          .mts-heart-rise, .mts-tail-wag, .mts-window-pop, .mts-spin-slow, .mts-petal-fall,
          .mts-burst-up {
            animation: none !important;
          }
        }
      `}</style>

      {/* Animated Pixel Sky & Horizon Wallpaper */}
      <PixelDesktopWallpaper />

      {/* Optional Preview Watermark */}
      {watermarked ? (
        <div className="relative z-30 bg-[#4A2545] py-1 text-center text-[10px] font-black tracking-[0.2em] text-[#FDE68A]">
          {copy.previewBanner}
        </div>
      ) : null}

      {/* Retro Pastel-Cream OS Top Menu Bar */}
      <header className="relative z-20 flex h-10 shrink-0 items-center justify-between border-b-2 border-[#4A2545] bg-[#FFF7F0]/95 px-3 backdrop-blur-xs">
        <div className="flex items-center gap-2 min-w-0">
          <PixelHeartSvg className="h-3.5 w-3.5 shrink-0" fill="#EC4899" />
          <span className="text-xs font-black tracking-tight text-[#4A2545]">{copy.osTitle}</span>
          {activeApp ? (
            <span className="hidden truncate rounded-full bg-[#FCE7F3] px-2 py-0.5 text-[10px] font-bold text-[#9D174D] sm:inline-block">
              {copy.apps[activeApp].label}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#F9A8D4] bg-[#FFF1F5] px-2 py-0.5 text-[10px] font-extrabold text-[#BE185D]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#EC4899]" />
            <span>{copy.moodPill}</span>
          </span>
          <span className="font-mono text-[11px] font-extrabold text-[#4A2545]">{clockText}</span>
        </div>
      </header>

      {/* Main Cozy Desktop Workspace */}
      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-between px-3.5 pb-4 pt-4 sm:px-6 sm:pt-6">
        {/* Minimal Warm Header Pill */}
        <div className="flex flex-col items-start gap-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#4A2545] bg-[#FFFBF5]/95 px-3 py-1 shadow-[0_3px_0_#4A2545]">
            <PixelStarSvg className="h-3.5 w-3.5" fill="#F59E0B" />
            <span className="text-xs font-black text-[#4A2545]">
              {copy.forLabel(data.receiverName)}
            </span>
          </div>
          <p className="pl-1 text-[11px] font-bold text-[#FFFBF5] drop-shadow-[0_1px_2px_rgba(30,27,58,0.85)]">
            {copy.desktopHint}
          </p>
        </div>

        {/* Desktop Area: Either 4 Retro App Icons OR Active Retro Window */}
        <div className="my-auto py-4">
          {activeApp ? (
            <section
              aria-label={copy.apps[activeApp].windowTitle}
              className="mts-window-pop mx-auto w-full max-w-lg overflow-hidden rounded-2xl border-2 border-[#4A2545] bg-[#FFF4EE] shadow-[0_8px_0_rgba(30,27,58,0.55)]"
            >
              {/* Retro Window Titlebar */}
              <div className="flex items-center justify-between gap-2 border-b-2 border-[#4A2545] bg-gradient-to-r from-[#FBCFE8] via-[#FCE7F3] to-[#FDE68A] px-3 py-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-full border border-[#4A2545] bg-[#FB7185]" />
                  <span className="h-2.5 w-2.5 rounded-full border border-[#4A2545] bg-[#FDE047]" />
                  <span className="h-2.5 w-2.5 rounded-full border border-[#4A2545] bg-[#86EFAC]" />
                  <h2 className="ml-1.5 truncate text-xs font-black text-[#4A2545]">
                    {copy.apps[activeApp].windowTitle}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveApp(null)}
                  aria-label={copy.closeLabel}
                  className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border-2 border-[#4A2545] bg-[#FFFBF5] text-[#4A2545] shadow-[0_2px_0_#4A2545] transition-transform active:translate-y-0.5"
                >
                  <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                    <path d="M3 3L11 11M11 3L3 11" />
                  </svg>
                </button>
              </div>

              {/* Window Content */}
              <div className="max-h-[62dvh] overflow-y-auto p-3.5 sm:p-4">
                {activeApp === 'her' ? (
                  <HerFolderApp photos={data.photos} copy={copy} isHindi={isHindi} />
                ) : activeApp === 'dream' ? (
                  <DreamBoardApp
                    receiverName={data.receiverName}
                    coreLang={coreLang}
                    copy={copy}
                    isHindi={isHindi}
                  />
                ) : activeApp === 'game' ? (
                  <PixelCatcherGameApp
                    receiverName={data.receiverName}
                    copy={copy}
                    isHindi={isHindi}
                  />
                ) : (
                  <LoveTxtApp
                    receiverName={data.receiverName}
                    senderName={data.senderName}
                    headline={headline}
                    message={message}
                    tapeTitle={tapeTitle}
                    copy={copy}
                    isHindi={isHindi}
                  />
                )}
              </div>
            </section>
          ) : (
            /* 4 Clickable Retro Desktop Folder/App Icons */
            <div className="mx-auto grid max-w-xs grid-cols-2 gap-4 sm:max-w-md sm:grid-cols-4 sm:gap-5">
              {desktopApps.map((appId) => (
                <button
                  key={appId}
                  type="button"
                  onClick={() => openApp(appId)}
                  className="group flex min-h-[96px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-transparent bg-white/10 p-2.5 backdrop-blur-[2px] transition-all duration-200 hover:-translate-y-1 hover:border-[#FFFBF5]/70 hover:bg-white/20 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#FDE68A]"
                >
                  <div className="drop-shadow-[0_4px_0_rgba(30,27,58,0.45)] transition-transform duration-200 group-hover:scale-105">
                    <DesktopAppIconSvg id={appId} className="h-12 w-12 sm:h-14 sm:w-14" />
                  </div>
                  <span className="rounded-md bg-[#1E1B3A]/75 px-2 py-0.5 text-[11px] font-extrabold text-[#FFFBF5] shadow-xs">
                    {copy.apps[appId].label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Pixel Cat Companion (bottom-right of desktop) */}
        <div className="relative flex items-end justify-end pt-1">
          <div className="relative flex flex-col items-end">
            {/* Floating pixel hearts on pet */}
            {catHearts.map((h) => (
              <div
                key={h.id}
                className="mts-burst-up pointer-events-none absolute -top-4 right-7"
                style={{ marginRight: `${h.dx}px` }}
              >
                <PixelHeartSvg className="h-4 w-4" fill="#F472B6" />
              </div>
            ))}

            {/* Cute 2-3 word cat meme speech bubble */}
            <div className="mb-1 rounded-xl rounded-br-xs border-2 border-[#4A2545] bg-[#FFFBF5] px-2.5 py-1 text-[11px] font-black text-[#4A2545] shadow-[0_3px_0_#4A2545]">
              {copy.catBubbles[catBubbleIdx]}
            </div>

            <button
              type="button"
              onClick={handlePetCat}
              aria-label={copy.catTapHint}
              className={`group relative flex min-h-[44px] min-w-[44px] items-center justify-center transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-[#FDE68A] ${
                catBouncing ? '-translate-y-2 scale-110' : 'hover:-translate-y-0.5'
              }`}
            >
              <PixelCatCompanionSvg happy={catBouncing} className="h-16 w-16 sm:h-20 sm:w-20" />
            </button>
          </div>
        </div>
      </main>

      {/* Retro Bottom Dock / Taskbar */}
      <footer className="relative z-20 shrink-0 border-t-2 border-[#4A2545] bg-[#FFF7F0]/95 px-2.5 pb-2 pt-2 backdrop-blur-xs">
        <div className="mx-auto flex max-w-md items-center justify-between gap-1.5">
          <div className="flex flex-1 items-center justify-around gap-1">
            {desktopApps.map((appId) => {
              const isOpen = activeApp === appId;
              return (
                <button
                  key={appId}
                  type="button"
                  onClick={() => openApp(appId)}
                  aria-pressed={isOpen}
                  className={`relative flex min-h-[42px] flex-1 flex-col items-center justify-center rounded-xl border-2 px-1.5 py-1 transition-all active:scale-95 ${
                    isOpen
                      ? 'border-[#4A2545] bg-[#FCE7F3] shadow-[0_2px_0_#4A2545]'
                      : 'border-transparent bg-transparent hover:bg-[#FFF1F5]'
                  }`}
                >
                  <DesktopAppIconSvg id={appId} className="h-6 w-6" />
                  <span className="mt-0.5 truncate text-[10px] font-extrabold text-[#4A2545]">
                    {copy.apps[appId].label}
                  </span>
                  {isOpen ? (
                    <span className="absolute -bottom-0.5 h-1 w-4 rounded-full bg-[#EC4899]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Webzy Footer Label */}
        <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#7B4B6A]">
          <PixelHeartSvg className="h-2.5 w-2.5" fill="#EC4899" />
          <span>{copy.dockReady}</span>
          <span aria-hidden="true">·</span>
          <span>{getWebzyFooterLabel(language)}</span>
        </div>
      </footer>
    </div>
  );
}
