'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  type CoreLanguageCode,
  type LanguageCode,
  type LocalizedText,
  pickLocalizedText,
  toCoreLanguageCode,
} from '@webzy/core';
import {
  OccasionAdaptiveGallery,
  type OccasionSiteProps,
  getReplayLabel,
  getWebzyFooterLabel,
} from './shared/OccasionPrimitives';
import { OccasionPixelNightRide } from './shared/OccasionPixelNightRide';
import {
  CurvedTrackSanctuary,
  type CurvedTrackItem,
  HoldToChargeRing,
  HyperspeedWarpFlash,
  WordByWordFadeLine,
} from './shared/OccasionCinematicFX';

type SmileAct = 'cover' | 'kitty' | 'arcade' | 'clouds' | 'letter';

interface EnvelopeItem {
  title: LocalizedText;
  detail: LocalizedText;
}

interface SparkleBurst {
  id: number;
  xPct: number;
  yPct: number;
  kind: 'star' | 'heart';
}

interface SmileMicrositeCopy {
  previewBanner: string;
  justBecauseBadge: (receiver: string) => string;
  coverSubtitle: (sender: string) => string;
  tapToStart: string;
  coverWhisper: string;
  actLabels: {
    kitty: string;
    arcade: string;
    clouds: string;
    letter: string;
  };
  kittyEyebrow: string;
  kittyTitle: string;
  kittyPrompts: readonly [string, string, string, string, string];
  purrMeterLabel: string;
  kittyTapBtn: string;
  kittyUnlockedBtn: string;
  skipToLetter: string;
  arcadeIntro: string;
  arcadeSkip: string;
  arcadeCompleteCta: string;
  cloudsEyebrow: string;
  cloudsTitle: string;
  cloudsSub: string;
  holdCloudsLabel: string;
  holdChargingLabel: string;
  holdCompleteLabel: string;
  letterTag: string;
  signedWarmth: (sender: string) => string;
  openWhenHeading: string;
  openWhenSub: string;
  envelopesUnsealed: string;
  allUnsealed: string;
  tapToUnseal: string;
  tapToReseal: string;
  sealedLabel: string;
  unsealedLabel: string;
  fromLabel: string;
  jarHeading: string;
  jarSub: string;
  jarJarLabel: string;
  jarTapButton: string;
  jarCounterLabel: (count: number) => string;
  jarInitialTicket: string;
  jarTickets: readonly string[];
  sanctuaryHeading: string;
  sanctuaryTracks: readonly [CurvedTrackItem, CurvedTrackItem, CurvedTrackItem];
  galleryHeading: string;
  photoPrefix: string;
  replayRideBtn: string;
  footerKeep: string;
}

const DEFAULT_ENVELOPES: readonly EnvelopeItem[] = [
  {
    title: {
      en: 'Open when you need a gentle reminder',
      hinglish: 'Open when khud par thoda doubt aaye',
      hi: 'जब खुद पर थोड़ा संदेह हो, तब खोलें',
    },
    detail: {
      en: 'You bring more warmth, quiet kindness, and light into ordinary days than you ever realize.',
      hinglish: 'Tum jitni warmth aur sukoon har aam din mein laati ho, uska aadha bhi khud ko credit nahi deti.',
      hi: 'आप जितने सुकून और गर्मजोशी से हर आम दिन को खास बनाती हैं, उसका पूरा श्रेय खुद को भी दीजिए।',
    },
  },
  {
    title: {
      en: 'Open when a slow afternoon hits',
      hinglish: 'Open when din thoda thakaane wala lage',
      hi: 'जब कोई दोपहर थकाने वाली लगे, तब खोलें',
    },
    detail: {
      en: 'Drop your shoulders, pour something warm, and leave the heavy thoughts on pause for a little while.',
      hinglish: 'Thoda saans lo, ek garam cup banao, aur saari tension ko thodi der ke liye side rakh do.',
      hi: 'थोड़ी देर गहरी सांस लें, एक गरम कप लें और सारी चिंताओं को कुछ पल के लिए विराम दे दें।',
    },
  },
  {
    title: {
      en: 'Open when you want an instant smile',
      hinglish: 'Open when bas bina wajah muskurana ho',
      hi: 'जब बिना वजह मुस्कुराने का मन हो, तब खोलें',
    },
    detail: {
      en: 'Somewhere out here, someone is genuinely glad you exist exactly as you are today.',
      hinglish: 'Kisi ke liye tumhara bas aise hi hona aur hansna bahut bada sukoon hai.',
      hi: 'कहीं न कहीं कोई आपके बिल्कुल ऐसे ही होने और मुस्कुराने के लिए दिल से आभारी है।',
    },
  },
];

const COPY: Record<CoreLanguageCode, SmileMicrositeCopy> = {
  en: {
    previewBanner: 'WEBZY FREE PREVIEW',
    justBecauseBadge: (receiver) => `Just Because · For ${receiver}`,
    coverSubtitle: (sender) =>
      `No birthday, no occasion — just a small surprise from ${sender} to make you smile`,
    tapToStart: 'Tap to Start',
    coverWhisper: 'A tiny kitty cheer-up, a moonlit pixel ride & a pinned note inside',
    actLabels: {
      kitty: 'Act I · Cheer-Up',
      arcade: 'Act II · Night Ride',
      clouds: 'Act III · Sky Break',
      letter: 'Surprise Letter',
    },
    kittyEyebrow: 'POCKET CHEER-UP',
    kittyTitle: 'Fresh Tulips & Soft Purrs',
    kittyPrompts: [
      'Give the kitty a gentle tap to charge up the smile meter.',
      'Soft purrs warming up — keep tapping for more sparkles!',
      'Halfway there — tulip petals are opening just for you.',
      'Almost full — one more tap to unlock your night ride!',
      '100% Purr Power unlocked! Your pixel adventure is ready.',
    ],
    purrMeterLabel: 'Purr Cheer Meter',
    kittyTapBtn: 'Tap Kitty to Cheer Up',
    kittyUnlockedBtn: 'Launch Pixel Night Ride',
    skipToLetter: 'Skip to Letter',
    arcadeIntro: 'Cruise through the neon skyline to unlock the final surprise',
    arcadeSkip: 'Skip Ride',
    arcadeCompleteCta: 'Continue to Part the Clouds',
    cloudsEyebrow: 'ALMOST THERE',
    cloudsTitle: 'Break Through the Blush Clouds',
    cloudsSub: 'Hold the glowing ring until it reaches 100% to reveal your pinned surprise',
    holdCloudsLabel: 'Hold button to break through the clouds',
    holdChargingLabel: 'Parting the clouds...',
    holdCompleteLabel: 'Breaking through!',
    letterTag: 'NO OCCASION · JUST A SURPRISE',
    signedWarmth: (sender) => `— With warmth, ${sender}`,
    openWhenHeading: 'Open-When Envelopes',
    openWhenSub: 'Tap any seal to unfold a pocket note',
    envelopesUnsealed: 'opened',
    allUnsealed: 'All envelopes opened',
    tapToUnseal: 'Tap wax seal to open',
    tapToReseal: 'Tap to fold back',
    sealedLabel: 'Sealed',
    unsealedLabel: 'Opened',
    fromLabel: 'From',
    jarHeading: 'Jar of Little Wins',
    jarSub: 'Tap the jar whenever you want a fresh feel-good ticket',
    jarJarLabel: 'LITTLE WINS',
    jarTapButton: 'Pull a Little Win',
    jarCounterLabel: (count) => `${count} ${count === 1 ? 'win' : 'wins'} pulled`,
    jarInitialTicket: 'Tap the glass jar above to draw your first folded feel-good ticket.',
    jarTickets: [
      'You make ordinary weekdays feel noticeably softer just by showing up.',
      'Reminder: you have already made it through 100% of the days you worried about.',
      'Take a slow sip of water, drop your shoulders, and give yourself real credit today.',
      'Your laugh is effortlessly contagious — never hold it back.',
      'Good things are quietly lining up behind the scenes with your name on them.',
      'Not everything has to be solved before evening — save some energy for joy.',
    ],
    sanctuaryHeading: 'Uplifting Vinyl Sanctuary',
    sanctuaryTracks: [
      {
        id: 'sunbeam-tea',
        title: 'Sunbeam & Warm Chai',
        moodLabel: 'Uplifting Acoustic',
        duration: '02:14',
        note: 'Light chimes tuned to slow down busy afternoons and bring back an easy smile.',
      },
      {
        id: 'pastel-sky',
        title: 'Pastel Cloud Drift',
        moodLabel: 'Dreamy Chime',
        duration: '01:58',
        note: 'A gentle melody saved for quiet walks, window seats, and unplanned pauses.',
      },
      {
        id: 'little-wins',
        title: 'Pocket Full of Wins',
        moodLabel: 'Bright Lo-Fi',
        duration: '02:30',
        note: 'Warm ascending notes celebrating every small step you took this week.',
      },
    ],
    galleryHeading: 'Pinned Snapshot Keepsakes',
    photoPrefix: 'Snapshot',
    replayRideBtn: 'Replay Night Ride',
    footerKeep: 'Just Because Surprise',
  },
  hinglish: {
    previewBanner: 'WEBZY FREE PREVIEW',
    justBecauseBadge: (receiver) => `Just Because · ${receiver} Ke Liye`,
    coverSubtitle: (sender) =>
      `Na koi birthday, na koi occasion — bas ${sender} ki taraf se ek chhota sa surprise tumhe muskurane ke liye`,
    tapToStart: 'Tap to Start',
    coverWhisper: 'Andar ek cute kitty cheer-up, pixel night ride aur pinned letter hai',
    actLabels: {
      kitty: 'Act I · Cheer-Up',
      arcade: 'Act II · Night Ride',
      clouds: 'Act III · Sky Break',
      letter: 'Surprise Letter',
    },
    kittyEyebrow: 'POCKET CHEER-UP',
    kittyTitle: 'Taaze Tulips & Pyari Purrs',
    kittyPrompts: [
      'Kitty par tap karke smile meter bharna shuru karo.',
      'Pyari purr shuru ho gayi — aur sparkles ke liye tap karte raho!',
      'Aadha safar poora — tulips sirf tumhare liye khil rahe hain.',
      'Bas ek aur tap — pixel night ride unlock hone wali hai!',
      '100% Purr Power unlock! Chalo night ride par chalte hain.',
    ],
    purrMeterLabel: 'Purr Cheer Meter',
    kittyTapBtn: 'Kitty Ko Tap Karein',
    kittyUnlockedBtn: 'Pixel Night Ride Kholo',
    skipToLetter: 'Seedha Letter Padho',
    arcadeIntro: 'Neon skyline se guzarte hue aakhri surprise unlock karo',
    arcadeSkip: 'Ride Skip Karein',
    arcadeCompleteCta: 'Baadal Hatao & Surprise Dekho',
    cloudsEyebrow: 'BAS PAHUNCH GAYE',
    cloudsTitle: 'Gulabi Baadlon Ke Paar',
    cloudsSub: 'Pinned letter kholne ke liye glowing ring ko 100% tak hold karein',
    holdCloudsLabel: 'Baadal hatane ke liye button dabaye rakhein',
    holdChargingLabel: 'Baadal hat rahe hain...',
    holdCompleteLabel: 'Rasta khul gaya!',
    letterTag: 'NO OCCASION · BAS EK SURPRISE',
    signedWarmth: (sender) => `— Pyaar aur warmth ke saath, ${sender}`,
    openWhenHeading: 'Open-When Envelopes',
    openWhenSub: 'Chhota note padhne ke liye kisi bhi seal par tap karo',
    envelopesUnsealed: 'khule',
    allUnsealed: 'Saare envelopes khul gaye',
    tapToUnseal: 'Kholne ke liye seal tap karo',
    tapToReseal: 'Wapas band karne ke liye tap karo',
    sealedLabel: 'Sealed',
    unsealedLabel: 'Khula',
    fromLabel: 'Bheja hai',
    jarHeading: 'Little Wins Ka Jar',
    jarSub: 'Jab bhi mood fresh karna ho, jar par tap karke ek note nikalo',
    jarJarLabel: 'LITTLE WINS',
    jarTapButton: 'Ek Little Win Nikalo',
    jarCounterLabel: (count) => `${count} ${count === 1 ? 'parchi' : 'parchiyan'} nikali`,
    jarInitialTicket: 'Pehli feel-good parchi nikalne ke liye upar glass jar par tap karo.',
    jarTickets: [
      'Tumhari bas maujoodgi hi kisi bhi aam din ko thoda aur pyaara bana deti hai.',
      'Yaad rakhna: jin mushkil dino se darr lagta tha, tum un sab ko paar kar chuki ho.',
      'Thoda paani piyo, gehri saans lo aur apni ab tak ki mehnat par garv karo.',
      'Tumhari hansi aas-paas sabka mood turant halka kar deti hai.',
      'Achhi khabrein aur pyaare pal dheere-dheere tumhari taraf aa rahe hain.',
      'Har baat aaj hi solve karna zaroori nahi — thodi energy apni khushi ke liye bachao.',
    ],
    sanctuaryHeading: 'Uplifting Vinyl Sanctuary',
    sanctuaryTracks: [
      {
        id: 'sunbeam-tea',
        title: 'Dhoop & Garam Chai',
        moodLabel: 'Uplifting Acoustic',
        duration: '02:14',
        note: 'Thaki hui shaam ko halka karne aur pyaari muskaan wapas laane wali dhun.',
      },
      {
        id: 'pastel-sky',
        title: 'Gulabi Baadal Drift',
        moodLabel: 'Dreamy Chime',
        duration: '01:58',
        note: 'Shaant walks, khidki ke paas baithne aur sukoon bhare palon ke liye.',
      },
      {
        id: 'little-wins',
        title: 'Chhoti Jeet Ka Jashn',
        moodLabel: 'Bright Lo-Fi',
        duration: '02:30',
        note: 'Is hafte ke har chhote-bade step ko celebrate karne wali pyari si beat.',
      },
    ],
    galleryHeading: 'Pinned Yaadon Ki Tasveerein',
    photoPrefix: 'Yaad',
    replayRideBtn: 'Night Ride Phir Khelo',
    footerKeep: 'Just Because Surprise',
  },
  hi: {
    previewBanner: 'WEBZY मुफ़्त पूर्वावलोकन',
    justBecauseBadge: (receiver) => `बस यूँ ही · ${receiver} के लिए`,
    coverSubtitle: (sender) =>
      `न कोई जन्मदिन, न कोई ख़ास अवसर — बस ${sender} की ओर से आपके चेहरे पर मुस्कान लाने का एक छोटा सा सरप्राइज़`,
    tapToStart: 'शुरू करने के लिए टैप करें',
    coverWhisper: 'अंदर एक प्यारी बिल्ली का सरप्राइज़, पिक्सेल नाइट राइड और एक सहेजा हुआ पत्र है',
    actLabels: {
      kitty: 'भाग 1 · मुस्कान',
      arcade: 'भाग 2 · नाइट राइड',
      clouds: 'भाग 3 · बादल पार',
      letter: 'खास पत्र',
    },
    kittyEyebrow: 'मुस्कान की झलक',
    kittyTitle: 'ताज़ा ट्यूलिप और प्यारा दुलार',
    kittyPrompts: [
      'मुस्कान मीटर भरने के लिए बिल्ली पर हल्का टैप करें।',
      'प्यारी गुनगुनाहट शुरू हुई — और चमक के लिए टैप करते रहें!',
      'आधा सफ़र पूरा — ट्यूलिप आपके लिए खिल रहे हैं।',
      'बस एक और टैप — आपकी नाइट राइड खुलने वाली है!',
      '100% मुस्कान तैयार! अब पिक्सेल सफ़र शुरू करने के लिए तैयार हैं।',
    ],
    purrMeterLabel: 'मुस्कान मीटर',
    kittyTapBtn: 'बिल्ली पर टैप करें',
    kittyUnlockedBtn: 'पिक्सेल नाइट राइड शुरू करें',
    skipToLetter: 'सीधे पत्र पढ़ें',
    arcadeIntro: 'अंतिम सरप्राइज़ खोलने के लिए चाँदनी सड़क की सवारी पूरी करें',
    arcadeSkip: 'आगे बढ़ें',
    arcadeCompleteCta: 'बादल हटाकर सरप्राइज़ देखें',
    cloudsEyebrow: 'बस एक कदम दूर',
    cloudsTitle: 'गुलाबी बादलों के पार',
    cloudsSub: 'अपना खास पत्र देखने के लिए चमकते रिंग को 100% तक दबाए रखें',
    holdCloudsLabel: 'बादल हटाने के लिए बटन दबाए रखें',
    holdChargingLabel: 'बादल छँट रहे हैं...',
    holdCompleteLabel: 'रास्ता खुल गया!',
    letterTag: 'बिना किसी अवसर · बस एक सरप्राइज़',
    signedWarmth: (sender) => `— स्नेह सहित, ${sender}`,
    openWhenHeading: 'जब मन करे तब खोलें',
    openWhenSub: 'संदेश पढ़ने के लिए किसी भी मोहर पर टैप करें',
    envelopesUnsealed: 'खुले',
    allUnsealed: 'सभी लिफ़ाफ़े खुल गए',
    tapToUnseal: 'खोलने के लिए टैप करें',
    tapToReseal: 'वापस मोड़ने के लिए टैप करें',
    sealedLabel: 'बंद',
    unsealedLabel: 'खुला',
    fromLabel: 'प्रेषक',
    jarHeading: 'छोटी खुशियों का जार',
    jarSub: 'जब भी मन हल्का करना हो, जार से एक नई पर्ची निकालें',
    jarJarLabel: 'LITTLE WINS',
    jarTapButton: 'एक खुशी की पर्ची निकालें',
    jarCounterLabel: (count) => `${count} पर्ची निकाली गईं`,
    jarInitialTicket: 'अपनी पहली सकारात्मक पर्ची पढ़ने के लिए ऊपर जार पर टैप करें।',
    jarTickets: [
      'आपकी मौजूदगी किसी भी साधारण दिन को बेहद कोमल और सहज बना देती है।',
      'याद रखें: आपने अब तक हर उस दिन को हिम्मत से पार किया है जिसकी आपको चिंता थी।',
      'थोड़ा पानी पिएं, गहरी सांस लें और अब तक के सफ़र पर खुद को शाबाशी दें।',
      'आपकी हँसी अपने आप आस-पास सबका मन हल्का कर देती है।',
      'अच्छी खबरें और सुकून भरे पल धीरे-धीरे आपकी ओर बढ़ रहे हैं।',
      'हर उलझन आज ही सुलझाना ज़रूरी नहीं — थोड़ी ऊर्जा अपनी मुस्कान के लिए रखें।',
    ],
    sanctuaryHeading: 'मधुर विनाइल सैंक्चुअरी',
    sanctuaryTracks: [
      {
        id: 'sunbeam-tea',
        title: 'धूप और गरम चाय',
        moodLabel: 'मधुर धुन',
        duration: '02:14',
        note: 'व्यस्त दोपहर को धीमा करने और चेहरे पर सहज मुस्कान लाने वाली धुन।',
      },
      {
        id: 'pastel-sky',
        title: 'गुलाबी बादलों की सैर',
        moodLabel: 'सुकून भरा संगीत',
        duration: '01:58',
        note: 'शांत टहलने, खिड़की के पास बैठने और सुकून भरे पलों के लिए सहेजी धुन।',
      },
      {
        id: 'little-wins',
        title: 'छोटी जीत का जश्न',
        moodLabel: 'उमंग भरी ताल',
        duration: '02:30',
        note: 'इस सप्ताह आपके हर छोटे-बड़े कदम की सराहना करती हुई प्यारी लय।',
      },
    ],
    galleryHeading: 'सहेजी हुई यादें',
    photoPrefix: 'याद',
    replayRideBtn: 'नाइट राइड फिर से खेलें',
    footerKeep: 'बस यूँ ही सरप्राइज़',
  },
};

function playSoftPurrChime(step: number) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freqs = [440, 523.25, 659.25, 783.99];
    const freq = freqs[Math.min(freqs.length - 1, Math.max(0, step))];
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Silent fallback when Web Audio is restricted
  }
}

function formatOptionalDate(revealAt: string | undefined, language: LanguageCode): string | null {
  if (!revealAt) return null;
  const parsed = new Date(revealAt);
  if (Number.isNaN(parsed.getTime())) return null;
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

/** Gently drifting vector hearts & crescent moons across the blush/plum sky. */
function BlushUniverseBackdrop({ darkMode }: { darkMode: boolean }) {
  const items: ReadonlyArray<{
    kind: 'heart' | 'moon' | 'star';
    left: string;
    top: string;
    size: string;
    delay: string;
    opacity: string;
  }> = [
    { kind: 'moon', left: '8%', top: '10%', size: 'h-6 w-6', delay: '0s', opacity: 'opacity-65' },
    { kind: 'heart', left: '84%', top: '12%', size: 'h-5 w-5', delay: '0.8s', opacity: 'opacity-60' },
    { kind: 'star', left: '22%', top: '26%', size: 'h-3.5 w-3.5', delay: '1.2s', opacity: 'opacity-50' },
    { kind: 'heart', left: '12%', top: '68%', size: 'h-4 w-4', delay: '0.4s', opacity: 'opacity-50' },
    { kind: 'moon', left: '86%', top: '72%', size: 'h-5 w-5', delay: '1.5s', opacity: 'opacity-55' },
    { kind: 'star', left: '72%', top: '28%', size: 'h-3 w-3', delay: '0.6s', opacity: 'opacity-55' },
    { kind: 'heart', left: '48%', top: '8%', size: 'h-3.5 w-3.5', delay: '1.1s', opacity: 'opacity-45' },
    { kind: 'star', left: '34%', top: '84%', size: 'h-3.5 w-3.5', delay: '0.9s', opacity: 'opacity-45' },
  ];

  const heartColor = darkMode ? '#FDA4AF' : '#E11D63';
  const moonColor = darkMode ? '#FDE68A' : '#F59E0B';

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`mts-float-drift absolute ${item.size} ${item.opacity}`}
          style={{ left: item.left, top: item.top, animationDelay: item.delay }}
        >
          {item.kind === 'heart' ? (
            <svg viewBox="0 0 24 24" fill={heartColor} className="h-full w-full">
              <path d="M12 20.4C12 20.4 4 15.1 4 9.5C4 6.8 6.1 4.8 8.6 4.8C10.2 4.8 11.4 5.7 12 6.8C12.6 5.7 13.8 4.8 15.4 4.8C17.9 4.8 20 6.8 20 9.5C20 15.1 12 20.4 12 20.4Z" />
            </svg>
          ) : item.kind === 'moon' ? (
            <svg viewBox="0 0 24 24" fill={moonColor} className="h-full w-full">
              <path d="M15.2 3.8A8.5 8.5 0 1 0 20.5 16.4A6.8 6.8 0 1 1 15.2 3.8Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill={moonColor} className="h-full w-full">
              <path d="M10 1L12.1 7.9L19 10L12.1 12.1L10 19L7.9 12.1L1 10L7.9 7.9L10 1Z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

/** Cute custom SVG kitty holding a fresh tulip bouquet with a blush ear bow. */
function KittyBouquetSvg({ purrPct, bouncing }: { purrPct: number; bouncing: boolean }) {
  const happyEyes = purrPct >= 75;
  return (
    <svg
      viewBox="0 0 220 210"
      className={`mx-auto h-44 w-48 transition-transform duration-300 motion-reduce:transition-none ${
        bouncing ? 'scale-105 -translate-y-1' : 'scale-100'
      }`}
      fill="none"
      aria-hidden="true"
    >
      {/* Soft pastel halo */}
      <circle cx="110" cy="108" r="84" fill="#FCE7F1" />
      <circle cx="110" cy="108" r="68" fill="#FFF7FA" />

      {/* Kitty ears */}
      <path d="M68 78L60 40L94 58Z" fill="#FFFFFF" stroke="#4A153B" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M71 71L66 49L86 59Z" fill="#FBCFE8" />
      <path d="M152 78L160 40L126 58Z" fill="#FFFFFF" stroke="#4A153B" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M149 71L154 49L134 59Z" fill="#FBCFE8" />

      {/* Blush ribbon bow on right ear */}
      <g transform="translate(132 42) rotate(16)">
        <path d="M12 10L2 3V17L12 10Z" fill="#FB7185" stroke="#4A153B" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 10L22 3V17L12 10Z" fill="#FB7185" stroke="#4A153B" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="3.6" fill="#FDE68A" stroke="#4A153B" strokeWidth="1.6" />
      </g>

      {/* Round kitty head */}
      <ellipse cx="110" cy="92" rx="48" ry="39" fill="#FFFFFF" stroke="#4A153B" strokeWidth="2.6" />

      {/* Rosy cheeks */}
      <ellipse cx="77" cy="99" rx="7.5" ry="4.5" fill="#FDA4AF" fillOpacity="0.65" />
      <ellipse cx="143" cy="99" rx="7.5" ry="4.5" fill="#FDA4AF" fillOpacity="0.65" />

      {/* Kitty eyes */}
      {happyEyes ? (
        <>
          <path d="M84 90C86 85 92 85 94 90" stroke="#4A153B" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M126 90C128 85 134 85 136 90" stroke="#4A153B" strokeWidth="2.8" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="89" cy="89" r="4.3" fill="#4A153B" />
          <circle cx="87.5" cy="87.5" r="1.4" fill="#FFFFFF" />
          <circle cx="131" cy="89" r="4.3" fill="#4A153B" />
          <circle cx="129.5" cy="87.5" r="1.4" fill="#FFFFFF" />
        </>
      )}

      {/* Tiny nose + smile */}
      <ellipse cx="110" cy="95" rx="3.2" ry="2.2" fill="#FB7185" />
      <path d="M104 99C106 102 109 102 110 99C111 102 114 102 116 99" stroke="#4A153B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Whiskers */}
      <path d="M55 88L70 91M54 97L69 97" stroke="#4A153B" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M165 88L150 91M166 97L151 97" stroke="#4A153B" strokeWidth="1.8" strokeLinecap="round" />

      {/* Kitty body */}
      <path
        d="M76 127C74 152 84 176 110 176C136 176 146 152 144 127C134 132 86 132 76 127Z"
        fill="#FFFFFF"
        stroke="#4A153B"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      {/* Tulip bouquet stems */}
      <path d="M110 162L96 124M110 162L110 118M110 162L125 125" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />

      {/* Bouquet wrap paper */}
      <path d="M90 144L130 144L118 176H102L90 144Z" fill="#FBCFE8" stroke="#4A153B" strokeWidth="2" strokeLinejoin="round" />
      <path d="M102 152H118" stroke="#E11D63" strokeWidth="2.4" strokeLinecap="round" />

      {/* 3 colorful tulips */}
      <g>
        <path d="M88 122C88 112 96 107 96 107C96 107 104 112 104 122C104 127 100 130 96 130C92 130 88 127 88 122Z" fill="#FB7185" stroke="#4A153B" strokeWidth="1.8" />
        <path d="M102 115C102 104 110 99 110 99C110 99 118 104 118 115C118 120 114 123 110 123C106 123 102 120 102 115Z" fill="#E11D63" stroke="#4A153B" strokeWidth="1.8" />
        <path d="M117 123C117 113 125 108 125 108C125 108 133 113 133 123C133 128 129 131 125 131C121 131 117 128 117 123Z" fill="#FBBF24" stroke="#4A153B" strokeWidth="1.8" />
      </g>

      {/* Kitty paws holding bouquet */}
      <ellipse cx="88" cy="144" rx="10" ry="7.5" fill="#FFFFFF" stroke="#4A153B" strokeWidth="2.2" />
      <ellipse cx="132" cy="144" rx="10" ry="7.5" fill="#FFFFFF" stroke="#4A153B" strokeWidth="2.2" />
    </svg>
  );
}

function PinnedEnvelopePinSvg() {
  return (
    <svg viewBox="0 0 64 42" className="mx-auto -mb-3 h-10 w-16 drop-shadow-sm" fill="none" aria-hidden="true">
      {/* Subtle pin shadow */}
      <ellipse cx="32" cy="36" rx="10" ry="3" fill="#4A153B" fillOpacity="0.16" />
      {/* Pin needle */}
      <path d="M32 22V35" stroke="#9D174D" strokeWidth="2.4" strokeLinecap="round" />
      {/* Pin base & shiny blush/gold head */}
      <ellipse cx="32" cy="21" rx="11" ry="4.5" fill="#FB7185" stroke="#4A153B" strokeWidth="1.6" />
      <circle cx="32" cy="12" r="9.5" fill="#E11D63" stroke="#4A153B" strokeWidth="1.8" />
      <circle cx="29" cy="9" r="3" fill="#FFE4EA" fillOpacity="0.85" />
    </svg>
  );
}

function RoseWaxSeal({ unsealed = false }: { unsealed?: boolean }) {
  const gradient = unsealed
    ? 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 60%, #D97706 100%)'
    : 'linear-gradient(135deg, #FB7185 0%, #E11D63 58%, #9D174D 100%)';

  return (
    <span
      aria-hidden="true"
      className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-xs transition-transform duration-300"
      style={{ background: gradient }}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/45">
        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 text-white">
          <path
            d="M10 15.5s-4.8-2.9-4.8-6.4A2.8 2.8 0 0 1 10 7.4a2.8 2.8 0 0 1 4.8 1.7c0 3.5-4.8 6.4-4.8 6.4Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill={unsealed ? 'currentColor' : 'none'}
            fillOpacity={unsealed ? 0.25 : 0}
          />
        </svg>
      </span>
    </span>
  );
}

function SmileJarIllustration({
  label,
  pullCount,
  isPopping,
}: {
  label: string;
  pullCount: number;
  isPopping: boolean;
}) {
  return (
    <div className="relative mx-auto flex h-40 w-36 items-center justify-center">
      <svg viewBox="0 0 160 176" className="h-full w-full drop-shadow-xs" fill="none" aria-hidden="true">
        <circle cx="80" cy="96" r="62" fill="#FBCFE8" fillOpacity="0.35" />

        <g
          className={`transition-all duration-300 ${isPopping ? '-translate-y-4 scale-105 opacity-100' : 'translate-y-0 opacity-95'}`}
          style={{ transformOrigin: '80px 30px' }}
        >
          <rect
            x="64"
            y="10"
            width="32"
            height="18"
            rx="3"
            transform="rotate(-8 64 10)"
            fill="#FDE68A"
            stroke="#4A153B"
            strokeWidth="1.4"
          />
          <line x1="70" y1="17" x2="88" y2="14" stroke="#4A153B" strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />
        </g>

        <rect x="50" y="28" width="60" height="14" rx="4" fill="#4A153B" />
        <rect x="44" y="38" width="72" height="9" rx="4.5" fill="#831843" stroke="#3E1330" strokeWidth="1.2" />

        <path
          d="M46 47 H114 L122 64 V148 C122 156 116 162 108 162 H52 C44 162 38 156 38 148 V64 Z"
          fill="#FFFBF5"
          fillOpacity="0.92"
          stroke="#4A153B"
          strokeWidth="2"
        />
        <path d="M46 68 V142" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.8" />

        <rect x="48" y="128" width="24" height="14" rx="3" transform="rotate(-10 48 128)" fill="#FDA4AF" stroke="#4A153B" strokeWidth="1.1" />
        <rect x="74" y="132" width="26" height="14" rx="3" transform="rotate(8 74 132)" fill="#FDE68A" stroke="#4A153B" strokeWidth="1.1" />
        <rect x="92" y="120" width="22" height="14" rx="3" transform="rotate(-16 92 120)" fill="#FBCFE8" stroke="#4A153B" strokeWidth="1.1" />
        <rect x="58" y="114" width="25" height="14" rx="3" transform="rotate(14 58 114)" fill="#FDE68A" stroke="#4A153B" strokeWidth="1.1" />
        <rect x="82" y="106" width="24" height="14" rx="3" transform="rotate(-6 82 106)" fill="#FDA4AF" stroke="#4A153B" strokeWidth="1.1" />

        <rect x="45" y="72" width="70" height="36" rx="6" fill="#FFFBF5" stroke="#4A153B" strokeWidth="1.5" />
        <rect x="49" y="76" width="62" height="28" rx="4" stroke="#E11D63" strokeOpacity="0.35" strokeDasharray="2 2" strokeWidth="1" />
        <text x="80" y="90" textAnchor="middle" fill="#4A153B" fontSize="8.5" fontWeight="800" letterSpacing="1.2">
          {label}
        </text>
        <text x="80" y="100" textAnchor="middle" fill="#E11D63" fontSize="7" fontWeight="700">
          {pullCount > 0 ? `#${String(pullCount).padStart(2, '0')}` : 'TAP JAR'}
        </text>
      </svg>
    </div>
  );
}

function CloudBankSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 90" fill="none" className={className} aria-hidden="true">
      <path
        d="M28 74H192C204 74 212 65 212 54C212 44 205 36 195 35C192 20 179 10 163 10C153 10 144 14 138 22C132 13 121 7 108 7C88 7 72 22 71 41C68 39 63 38 58 38C42 38 30 49 29 64C22 65 18 69 18 72C18 73 22 74 28 74Z"
        fill="#FFF5F8"
        fillOpacity="0.88"
      />
    </svg>
  );
}

/**
 * Interactive "No Occasion. Just a Random Surprise" feel-good microsite
 * combining Blush Universe Gate, Kitty Bouquet Cheer-Up, 8-Bit Pixel Night Ride,
 * Hold-to-Part-Clouds + Hyperspeed Warp, Pinned Warm Letter, Little Wins Jar,
 * Open-When Envelopes, CurvedTrackSanctuary, and OccasionAdaptiveGallery.
 */
export function MakeThemSmileSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const [act, setAct] = useState<SmileAct>('cover');
  const [purrPct, setPurrPct] = useState(0);
  const [kittyBouncing, setKittyBouncing] = useState(false);
  const [sparkles, setSparkles] = useState<SparkleBurst[]>([]);
  const [rideFinished, setRideFinished] = useState(false);
  const [warpActive, setWarpActive] = useState(false);
  const [cloudsParted, setCloudsParted] = useState(false);
  const [unsealed, setUnsealed] = useState<number[]>([0]);
  const [jarCount, setJarCount] = useState(0);
  const [jarPopping, setJarPopping] = useState(false);

  const baseId = useId();
  const nextSparkleIdRef = useRef(1);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const coreLang = toCoreLanguageCode(language);
  const copy = COPY[coreLang] ?? COPY.en;
  const formattedDate = formatOptionalDate(data.revealAt, language);
  const musicLabel = manifest.music[0]?.label;

  const envelopes: EnvelopeItem[] = useMemo(() => {
    const custom = data.highlights ?? [];
    if (custom.length >= 3) return custom;
    const needed = 3 - custom.length;
    return [...custom, ...DEFAULT_ENVELOPES.slice(0, needed)];
  }, [data.highlights]);

  const highlightsAsStrings = useMemo(() => {
    return (data.highlights ?? [])
      .map((item) => {
        const detail = pickLocalizedText(item.detail, language).trim();
        const title = pickLocalizedText(item.title, language).trim();
        return detail || title;
      })
      .filter(Boolean);
  }, [data.highlights, language]);

  const sanctuaryTracks = useMemo<CurvedTrackItem[]>(() => {
    const [first, second, third] = copy.sanctuaryTracks;
    return [
      musicLabel ? { ...first, title: musicLabel } : first,
      second,
      third,
    ];
  }, [copy.sanctuaryTracks, musicLabel]);

  const unsealedCount = unsealed.filter((idx) => idx >= 0 && idx < envelopes.length).length;
  const allUnsealed = envelopes.length > 0 && unsealedCount === envelopes.length;
  const envelopePct = envelopes.length > 0 ? Math.round((unsealedCount / envelopes.length) * 100) : 0;

  const activeJarTicket =
    jarCount === 0
      ? copy.jarInitialTicket
      : copy.jarTickets[(jarCount - 1) % copy.jarTickets.length];

  const handleStartGate = () => {
    setAct('kitty');
    onOpened?.();
  };

  const handleReplayAll = () => {
    setAct('cover');
    setPurrPct(0);
    setSparkles([]);
    setRideFinished(false);
    setWarpActive(false);
    setCloudsParted(false);
    setUnsealed([0]);
    setJarCount(0);
  };

  const handleSkipToLetter = () => {
    setWarpActive(false);
    setCloudsParted(true);
    setAct('letter');
  };

  const handleTapKitty = () => {
    const nextPct = Math.min(100, purrPct + 25);
    const stepIndex = Math.min(3, Math.floor(purrPct / 25));
    playSoftPurrChime(stepIndex);
    setPurrPct(nextPct);
    setKittyBouncing(true);

    const burstIdBase = nextSparkleIdRef.current;
    nextSparkleIdRef.current += 3;
    const newSparkles: SparkleBurst[] = [
      { id: burstIdBase, xPct: 18 + ((burstIdBase * 17) % 24), yPct: 24 + ((burstIdBase * 13) % 24), kind: 'heart' },
      { id: burstIdBase + 1, xPct: 58 + ((burstIdBase * 11) % 24), yPct: 18 + ((burstIdBase * 19) % 26), kind: 'star' },
      { id: burstIdBase + 2, xPct: 38 + ((burstIdBase * 23) % 26), yPct: 12 + ((burstIdBase * 7) % 20), kind: 'star' },
    ];
    setSparkles((prev) => [...prev.slice(-6), ...newSparkles]);

    const tBounce = window.setTimeout(() => setKittyBouncing(false), 260);
    const tSparkle = window.setTimeout(() => {
      setSparkles((prev) => prev.filter((item) => item.id >= burstIdBase + 3));
    }, 750);
    timersRef.current.push(tBounce, tSparkle);
  };

  const handleWarpDone = useCallback(() => {
    setWarpActive(false);
    setCloudsParted(true);
    setAct('letter');
  }, []);

  const toggleEnvelope = (idx: number) => {
    setUnsealed((prev) =>
      prev.includes(idx) ? prev.filter((item) => item !== idx) : [...prev, idx],
    );
  };

  const handlePullJarTicket = () => {
    setJarCount((prev) => prev + 1);
    setJarPopping(true);
    const timer = window.setTimeout(() => setJarPopping(false), 320);
    timersRef.current.push(timer);
  };

  const purrStepIdx = Math.min(4, Math.floor(purrPct / 25));
  const isDarkStage = act === 'arcade' || act === 'clouds';

  const containerGradient =
    act === 'arcade'
      ? 'linear-gradient(170deg, #160D2B 0%, #241342 55%, #3B123C 100%)'
      : act === 'clouds'
        ? 'linear-gradient(165deg, #2B0F2E 0%, #5B1A47 48%, #F9B8CE 100%)'
        : 'linear-gradient(160deg, #FFF5F8 0%, #FCE4EE 45%, #5B1945 100%)';

  return (
    <div
      className="relative flex h-full min-h-full w-full flex-col justify-between overflow-x-hidden overflow-y-hidden rounded-[28px] text-[#3E1330]"
      style={{ background: containerGradient }}
    >
      <style>{`
        @keyframes mtsFloatDrift {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-9px) rotate(6deg); }
        }
        @keyframes mtsSparklePop {
          0% { transform: translateY(4px) scale(0.5); opacity: 0; }
          35% { transform: translateY(-6px) scale(1.1); opacity: 1; }
          100% { transform: translateY(-22px) scale(0.8); opacity: 0; }
        }
        .mts-float-drift {
          animation: mtsFloatDrift 5.5s ease-in-out infinite;
        }
        .mts-sparkle-pop {
          animation: mtsSparklePop 0.72s ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .mts-float-drift, .mts-sparkle-pop {
            animation: none !important;
          }
        }
      `}</style>

      <BlushUniverseBackdrop darkMode={isDarkStage} />
      <HyperspeedWarpFlash active={warpActive} onDone={handleWarpDone} />

      {watermarked ? (
        <div
          aria-hidden="true"
          className="relative z-20 flex justify-center border-b border-white/20 bg-[#4A153B] py-1.5 font-mono text-[10px] font-bold tracking-[0.16em] text-[#FFF5F8]"
        >
          {copy.previewBanner}
        </div>
      ) : null}

      {/* ACT 1A: BLUSH UNIVERSE COVER GATE */}
      {act === 'cover' ? (
        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6 animate-fade-in motion-reduce:animate-none">
          <div className="relative w-full overflow-hidden rounded-[28px] border border-white/75 bg-white/80 p-6 text-center shadow-[0_24px_52px_-18px_rgba(74,21,59,0.42)] backdrop-blur-md sm:p-7">
            {/* Crescent moon & heart crest */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FB7185]/35 bg-gradient-to-br from-[#FFF1F5] to-[#FCE4EE] shadow-xs">
              <svg viewBox="0 0 36 36" className="h-8 w-8" fill="none" aria-hidden="true">
                <path d="M21 6.5A10.5 10.5 0 1 0 28.5 23.2A8.2 8.2 0 1 1 21 6.5Z" fill="#F59E0B" />
                <path
                  d="M23.5 17.5C23.5 17.5 19.5 14.9 19.5 12.1C19.5 10.7 20.6 9.6 21.9 9.6C22.7 9.6 23.2 10.1 23.5 10.7C23.8 10.1 24.3 9.6 25.1 9.6C26.4 9.6 27.5 10.7 27.5 12.1C27.5 14.9 23.5 17.5 23.5 17.5Z"
                  fill="#E11D63"
                />
              </svg>
            </div>

            <div className="mt-4 inline-flex max-w-full items-center justify-center rounded-full border border-[#E11D63]/25 bg-[#FFF1F5] px-3.5 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#9D174D]">
              <span className="truncate">{copy.justBecauseBadge(data.receiverName)}</span>
            </div>

            <h1 className="mt-4 break-words font-heading text-3xl font-extrabold leading-tight text-[#3E1330] sm:text-4xl">
              {data.receiverName}
            </h1>

            <p className="mx-auto mt-3 max-w-sm break-words text-sm leading-relaxed text-[#5B2148]/90">
              {copy.coverSubtitle(data.senderName)}
            </p>

            {data.relation || formattedDate ? (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {data.relation ? (
                  <span className="rounded-full bg-[#FCE7F1] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#831843]">
                    {data.relation}
                  </span>
                ) : null}
                {formattedDate ? (
                  <span className="rounded-full bg-[#FEF3C7] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#92400E]">
                    {formattedDate}
                  </span>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleStartGate}
              className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E11D63] via-[#EC4899] to-[#FB7185] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_-8px_rgba(225,29,99,0.62)] ring-2 ring-white/70 transition hover:brightness-105 active:scale-[0.98] motion-reduce:transition-none"
            >
              <span>{copy.tapToStart}</span>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                <path
                  d="M4 10h12m-4.5-4.5L16 10l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <p className="mt-3 text-[11px] font-medium text-[#6B2D55]/75">
              {copy.coverWhisper}
            </p>
          </div>
        </div>
      ) : null}

      {/* ACT 1B: KITTY BOUQUET CHEER-UP INTERACTIVE CARD */}
      {act === 'kitty' ? (
        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-between gap-3 px-3.5 pb-4 pt-3 sm:px-5 animate-fade-in motion-reduce:animate-none">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex min-h-[36px] min-w-0 items-center gap-1.5 rounded-full border border-[#E11D63]/20 bg-white/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#4A153B] shadow-2xs">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#FB7185]" aria-hidden="true" />
              <span className="truncate">{copy.actLabels.kitty}</span>
            </span>

            <button
              type="button"
              onClick={handleReplayAll}
              className="inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-[#4A153B]/20 bg-white/90 px-4 text-xs font-bold text-[#4A153B] shadow-2xs transition hover:bg-white active:scale-95 motion-reduce:transition-none"
            >
              {getReplayLabel(language)}
            </button>
          </div>

          <section
            aria-label={copy.kittyTitle}
            className="relative my-auto overflow-hidden rounded-[26px] border border-white/80 bg-white/90 p-5 text-center shadow-[0_22px_44px_-18px_rgba(74,21,59,0.38)] backdrop-blur-md"
          >
            <span className="inline-block rounded-full bg-[#FCE7F1] px-3 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#9D174D]">
              {copy.kittyEyebrow}
            </span>

            <h2 className="mt-2 font-heading text-xl font-bold text-[#3E1330] sm:text-2xl">
              {copy.kittyTitle}
            </h2>

            {/* Interactive Kitty Tap Canvas */}
            <div className="relative mt-2">
              <button
                type="button"
                onClick={handleTapKitty}
                aria-label={copy.kittyTapBtn}
                className="relative mx-auto block min-h-[48px] w-full rounded-2xl p-1 transition focus-visible:outline-2 focus-visible:outline-[#E11D63] active:scale-[0.98]"
              >
                <KittyBouquetSvg purrPct={purrPct} bouncing={kittyBouncing} />
              </button>

              {sparkles.map((sp) => (
                <span
                  key={sp.id}
                  aria-hidden="true"
                  className="mts-sparkle-pop pointer-events-none absolute"
                  style={{ left: `${sp.xPct}%`, top: `${sp.yPct}%` }}
                >
                  {sp.kind === 'heart' ? (
                    <svg viewBox="0 0 20 20" fill="#E11D63" className="h-5 w-5">
                      <path d="M10 17s-6-4-6-8.4A3.6 3.6 0 0 1 10 6a3.6 3.6 0 0 1 6 2.6C16 13 10 17 10 17Z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="#F59E0B" className="h-5 w-5">
                      <path d="M10 1l2.2 6.8L19 10l-6.8 2.2L10 19l-2.2-6.8L1 10l6.8-2.2L10 1z" />
                    </svg>
                  )}
                </span>
              ))}
            </div>

            <p className="mt-1 min-h-[2.5rem] text-xs font-medium leading-relaxed text-[#5B2148]/90">
              {copy.kittyPrompts[purrStepIdx]}
            </p>

            {/* Cheerful Purr Progress Bar 0% -> 100% */}
            <div className="mt-3 rounded-2xl border border-[#FB7185]/25 bg-[#FFF5F8] p-3">
              <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#831843]">
                <span>{copy.purrMeterLabel}</span>
                <span>{purrPct}%</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={purrPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={copy.purrMeterLabel}
                className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[#FCE7F1]"
              >
                <div
                  className="h-full rounded-full transition-all duration-300 motion-reduce:transition-none"
                  style={{
                    width: `${purrPct}%`,
                    background: 'linear-gradient(90deg, #FB7185 0%, #E11D63 60%, #F59E0B 100%)',
                  }}
                />
              </div>
            </div>

            {purrPct < 100 ? (
              <button
                type="button"
                onClick={handleTapKitty}
                className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#4A153B] px-5 text-sm font-bold text-white shadow-md transition hover:brightness-110 active:scale-[0.98]"
              >
                <span>{copy.kittyTapBtn}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAct('arcade')}
                className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E11D63] to-[#FB7185] px-5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(225,29,99,0.65)] transition hover:brightness-105 active:scale-[0.98]"
              >
                <span>{copy.kittyUnlockedBtn}</span>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                  <path d="M4 10h12m-4.5-4.5L16 10l-4.5 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={handleSkipToLetter}
              className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center rounded-full px-4 text-xs font-semibold text-[#831843]/80 underline decoration-[#831843]/35 underline-offset-4 transition hover:text-[#4A153B]"
            >
              {copy.skipToLetter}
            </button>
          </section>

          <footer className="pt-1 text-center text-[11px] font-medium text-white/85">
            {getWebzyFooterLabel(language)}
          </footer>
        </div>
      ) : null}

      {/* ACT 2: INTERACTIVE 8-BIT PIXEL NIGHT RIDE */}
      {act === 'arcade' ? (
        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-between gap-3 px-3.5 pb-4 pt-3 sm:px-5 animate-fade-in motion-reduce:animate-none">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex min-h-[36px] min-w-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#FCE7F1] backdrop-blur-xs">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#FB7185]" aria-hidden="true" />
              <span className="truncate">{copy.actLabels.arcade}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAct('clouds')}
                className="inline-flex min-h-[44px] items-center rounded-full border border-white/20 bg-white/10 px-3.5 text-xs font-semibold text-white/90 transition hover:bg-white/20 active:scale-95"
              >
                {copy.arcadeSkip}
              </button>
              <button
                type="button"
                onClick={handleReplayAll}
                className="inline-flex min-h-[44px] items-center rounded-full border border-white/25 bg-white/15 px-3.5 text-xs font-bold text-white transition hover:bg-white/25 active:scale-95"
              >
                {getReplayLabel(language)}
              </button>
            </div>
          </div>

          <p className="text-center text-xs font-medium text-[#FBCFE8]">
            {copy.arcadeIntro}
          </p>

          <OccasionPixelNightRide
            receiverName={data.receiverName}
            senderName={data.senderName}
            storyLines={highlightsAsStrings}
            language={coreLang}
            accentColor="#FB7185"
            onComplete={() => setRideFinished(true)}
          />

          {rideFinished ? (
            <button
              type="button"
              onClick={() => setAct('clouds')}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FB7185] via-[#E11D63] to-[#F59E0B] px-6 text-sm font-bold text-white shadow-[0_12px_28px_-8px_rgba(251,113,133,0.65)] ring-2 ring-white/40 transition hover:brightness-105 active:scale-[0.98]"
            >
              <span>{copy.arcadeCompleteCta}</span>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                <path d="M4 10h12m-4.5-4.5L16 10l-4.5 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : null}

          <footer className="pt-1 text-center text-[11px] font-medium text-white/75">
            {getWebzyFooterLabel(language)}
          </footer>
        </div>
      ) : null}

      {/* ACT 3A: HOLD-TO-PART-CLOUDS + HYPERSPEED BURST */}
      {act === 'clouds' ? (
        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-between gap-4 px-3.5 pb-4 pt-3 sm:px-5 animate-fade-in motion-reduce:animate-none">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex min-h-[36px] min-w-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-xs">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#FDE68A]" aria-hidden="true" />
              <span className="truncate">{copy.actLabels.clouds}</span>
            </span>

            <button
              type="button"
              onClick={handleReplayAll}
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/25 bg-white/15 px-4 text-xs font-bold text-white transition hover:bg-white/25 active:scale-95"
            >
              {getReplayLabel(language)}
            </button>
          </div>

          <div className="relative my-auto overflow-hidden rounded-[28px] border border-white/25 bg-[#331033]/75 px-5 py-8 text-center text-white shadow-2xl backdrop-blur-md">
            <CloudBankSvg className="mts-float-drift pointer-events-none absolute -top-4 -left-10 w-44 opacity-35" />
            <CloudBankSvg className="mts-float-drift pointer-events-none absolute -right-10 -bottom-4 w-48 opacity-30" />

            <span className="relative inline-block rounded-full border border-[#FB7185]/40 bg-[#FB7185]/20 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#FFE4EA]">
              {copy.cloudsEyebrow}
            </span>

            <h2 className="relative mt-3 font-heading text-2xl font-bold text-white">
              {copy.cloudsTitle}
            </h2>

            <p className="relative mx-auto mt-2 max-w-xs text-xs leading-relaxed text-[#FCE7F1]/85">
              {copy.cloudsSub}
            </p>

            <div className="relative mt-6 flex justify-center">
              <HoldToChargeRing
                label={copy.holdCloudsLabel}
                chargingLabel={copy.holdChargingLabel}
                completeLabel={copy.holdCompleteLabel}
                accentColor="#FB7185"
                durationMs={1400}
                onComplete={() => setWarpActive(true)}
              />
            </div>
          </div>

          <footer className="pt-1 text-center text-[11px] font-medium text-white/80">
            {getWebzyFooterLabel(language)}
          </footer>
        </div>
      ) : null}

      {/* ACT 3B: GRAND FINALE — PINNED LETTER + ENVELOPES + SMILE JAR + SANCTUARY + GALLERY */}
      {act === 'letter' ? (
        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-3.5 pb-5 pt-3 sm:px-5 animate-fade-in motion-reduce:animate-none">
          {/* Top Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex min-h-[36px] min-w-0 items-center gap-1.5 rounded-full border border-[#E11D63]/20 bg-white/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#4A153B] shadow-2xs">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#E11D63]" aria-hidden="true" />
              <span className="truncate">{copy.justBecauseBadge(data.receiverName)}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setRideFinished(false);
                  setAct('arcade');
                }}
                className="inline-flex min-h-[44px] items-center rounded-full border border-[#4A153B]/20 bg-white/90 px-3.5 text-xs font-semibold text-[#4A153B] shadow-2xs transition hover:bg-white active:scale-95"
              >
                {copy.replayRideBtn}
              </button>
              <button
                type="button"
                onClick={handleReplayAll}
                className="inline-flex min-h-[44px] items-center rounded-full border border-[#4A153B]/20 bg-white/90 px-3.5 text-xs font-bold text-[#4A153B] shadow-2xs transition hover:bg-white active:scale-95"
              >
                {getReplayLabel(language)}
              </button>
            </div>
          </div>

          {/* 1. Pinned Warm Surprise Letter Card */}
          <section aria-label={copy.actLabels.letter} className="relative pt-3">
            <div className="relative z-10">
              <PinnedEnvelopePinSvg />
            </div>

            <div className="relative overflow-hidden rounded-[26px] border border-[#E11D63]/20 bg-[#FFFBF5] px-5 pb-6 pt-7 shadow-[0_20px_44px_-18px_rgba(74,21,59,0.34)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-[#FCE7F1] px-3 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#9D174D]">
                  {copy.letterTag}
                </span>
                {data.relation ? (
                  <span className="rounded-full border border-[#FB7185]/35 bg-[#FFF1F5] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#831843]">
                    {data.relation}
                  </span>
                ) : null}
              </div>

              <WordByWordFadeLine
                text={pickLocalizedText(data.headline, language)}
                active={cloudsParted}
                className="mt-4 break-words font-heading text-xl font-extrabold leading-snug text-[#3E1330] sm:text-2xl"
                delayStepMs={70}
              />

              <p className="mt-3.5 break-words rounded-2xl border-l-4 border-[#FB7185] bg-[#FFF2F6] px-4 py-3.5 text-sm leading-relaxed text-[#3E1330]/95">
                {pickLocalizedText(data.message, language)}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-[#4A153B]/15 pt-3 text-xs">
                <span className="font-semibold text-[#831843]">
                  {copy.signedWarmth(data.senderName)}
                </span>
                {formattedDate ? (
                  <span className="font-mono text-[10px] font-bold text-[#9D174D]/80">
                    {formattedDate}
                  </span>
                ) : null}
              </div>
            </div>
          </section>

          {/* 2. Interactive Open-When Envelopes (data.highlights) */}
          <section
            aria-label={copy.openWhenHeading}
            className="rounded-[24px] border border-white/75 bg-white/85 p-4 shadow-md backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-heading text-base font-bold text-[#3E1330]">
                  {copy.openWhenHeading}
                </h2>
                <p className="text-[11px] text-[#6B2D55]/80">{copy.openWhenSub}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] ${
                  allUnsealed
                    ? 'bg-[#FEF3C7] text-[#92400E] ring-1 ring-[#F59E0B]/40'
                    : 'bg-[#FCE7F1] text-[#9D174D]'
                }`}
              >
                {allUnsealed ? copy.allUnsealed : `${unsealedCount}/${envelopes.length} ${copy.envelopesUnsealed}`}
              </span>
            </div>

            <div
              role="progressbar"
              aria-valuenow={unsealedCount}
              aria-valuemin={0}
              aria-valuemax={envelopes.length}
              aria-label={copy.openWhenHeading}
              className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#FCE7F1]"
            >
              <div
                className="h-full rounded-full transition-all duration-300 motion-reduce:transition-none"
                style={{
                  width: `${envelopePct}%`,
                  background: 'linear-gradient(90deg, #E11D63 0%, #F59E0B 100%)',
                }}
              />
            </div>

            <div className="mt-3 space-y-2.5">
              {envelopes.map((card, idx) => {
                const isOpen = unsealed.includes(idx);
                const panelId = `${baseId}-env-${idx}`;
                const indexTag = String(idx + 1).padStart(2, '0');

                return (
                  <div
                    key={`${pickLocalizedText(card.title, 'en', 'env')}-${idx}`}
                    className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                      isOpen
                        ? 'border-[#E11D63]/35 bg-[#FFFBF5] shadow-sm'
                        : 'border-[#4A153B]/12 bg-[#FFF5F8] hover:border-[#E11D63]/35'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleEnvelope(idx)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex min-h-[56px] w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition active:scale-[0.99]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold tracking-[0.12em] text-[#E11D63]">
                            #{indexTag}
                          </span>
                          <span className="break-words font-heading text-sm font-bold text-[#3E1330]">
                            {pickLocalizedText(card.title, language)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-[#6B2D55]/70">
                          {isOpen ? copy.tapToReseal : copy.tapToUnseal}
                        </p>
                      </div>

                      <span
                        className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-bold ${
                          isOpen
                            ? 'border-[#F59E0B]/40 bg-[#FEF3C7]/70 text-[#92400E]'
                            : 'border-[#E11D63]/20 bg-white text-[#9D174D]'
                        }`}
                      >
                        <RoseWaxSeal unsealed={isOpen} />
                        <span>{isOpen ? copy.unsealedLabel : copy.sealedLabel}</span>
                      </span>
                    </button>

                    <div
                      id={panelId}
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="border-t border-dashed border-[#4A153B]/15 bg-[#FFFBF5] px-3.5 pb-3.5 pt-2.5">
                          <p className="break-words text-sm leading-relaxed text-[#3E1330]/95">
                            {pickLocalizedText(card.detail, language)}
                          </p>
                          <p className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#9D174D]">
                            {copy.fromLabel}: {data.senderName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Jar of Little Wins */}
          <section
            aria-label={copy.jarHeading}
            className="rounded-[24px] border border-white/75 bg-white/90 p-4 text-center shadow-md backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#3E1330]">
                {copy.jarHeading}
              </span>
              <span className="rounded-full bg-[#FCE7F1] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#9D174D]">
                {copy.jarCounterLabel(jarCount)}
              </span>
            </div>

            <p className="mt-1 text-left text-xs text-[#6B2D55]/85">{copy.jarSub}</p>

            <button
              type="button"
              onClick={handlePullJarTicket}
              aria-label={copy.jarTapButton}
              className="mt-2.5 inline-flex min-h-[48px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#E11D63]/25 bg-[#FFF5F8] py-2 transition hover:bg-[#FCE7F1]/55 active:scale-[0.99]"
            >
              <SmileJarIllustration
                label={copy.jarJarLabel}
                pullCount={jarCount}
                isPopping={jarPopping}
              />
            </button>

            <div
              role="status"
              aria-live="polite"
              className="mt-3 rounded-xl border border-[#F59E0B]/35 bg-[#FFFBEB] px-3.5 py-3 text-sm font-medium leading-relaxed text-[#3E1330]"
            >
              {activeJarTicket}
            </div>

            <button
              type="button"
              onClick={handlePullJarTicket}
              className="mt-3 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#4A153B] px-5 text-xs font-bold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98]"
            >
              {copy.jarTapButton}
            </button>
          </section>

          {/* 4. Uplifting Vinyl Track Sanctuary */}
          <CurvedTrackSanctuary
            tracks={sanctuaryTracks}
            mood="uplifting"
            accentColor="#E11D63"
            dark={false}
            heading={copy.sanctuaryHeading}
          />

          {/* 5. Adaptive Photo Gallery */}
          {data.photos && data.photos.length > 0 ? (
            <section
              aria-label={copy.galleryHeading}
              className="rounded-[24px] border border-white/75 bg-white/85 p-4 shadow-md backdrop-blur-md"
            >
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#9D174D]">
                {copy.galleryHeading}
              </p>
              <OccasionAdaptiveGallery
                photos={data.photos}
                accentColor="#E11D63"
                captionPrefix={copy.photoPrefix}
              />
            </section>
          ) : null}

          <footer className="border-t border-white/30 pt-3 text-center text-[11px] text-white">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/95">
              {copy.footerKeep} · {data.senderName} · {data.receiverName}
            </p>
            <p className="mt-0.5 font-medium text-white/85">
              {getWebzyFooterLabel(language)}
            </p>
          </footer>
        </div>
      ) : null}
    </div>
  );
}
