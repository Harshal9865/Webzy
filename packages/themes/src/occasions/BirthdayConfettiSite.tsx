'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  type CoreLanguageCode,
  pickLocalizedText,
  toCoreLanguageCode,
} from '@webzy/core';
import {
  AmbientRainCanvas,
  ConstellationNameSky,
  type CurvedTrackItem,
  CurvedTrackSanctuary,
  WordByWordFadeLine,
} from './shared/OccasionCinematicFX';
import {
  OccasionAdaptiveGallery,
  OccasionArtworkBackdrop,
  type OccasionSiteProps,
  getReplayLabel,
  getWebzyFooterLabel,
} from './shared/OccasionPrimitives';

type BirthdayActId = 'sky' | 'walk' | 'cake' | 'sanctuary';

interface WalkStepMeta {
  id: string;
  badge: string;
  title: string;
  caption: string;
}

interface LocalizedBirthdayCopy {
  prologueBadge: string;
  fromLabel: string;
  pullPrompt: string;
  skyPrologueSubtitle: string;
  skyIlluminatedSubtitle: string;
  pullHintText: string;
  scrollCue: string;
  navAriaLabel: string;
  navTabs: Record<BirthdayActId, string>;
  walkActLabel: string;
  walkHeading: string;
  walkSubheading: string;
  walkDiscoveryStatus: (found: number, total: number) => string;
  walkAllDiscovered: string;
  walkTapOrbHint: string;
  walkPrevStep: string;
  walkNextStep: string;
  walkToCake: string;
  walkSteps: readonly [WalkStepMeta, WalkStepMeta, WalkStepMeta];
  fallbackWhispers: readonly { title: string; detail: string }[];
  cakeActLabel: string;
  cakeHeading: string;
  cakePrompt: string;
  candleTapHint: string;
  candlesLitStatus: (out: number, total: number) => string;
  candleButtonLabel: (idx: number, isOut: boolean) => string;
  wishUnlocked: string;
  wishUnlockedMessage: string;
  relightHint: string;
  letterActLabel: string;
  journalTag: string;
  noteLabel: string;
  letterIntro: (name: string) => string;
  signedPrefix: string;
  soundtrackHeading: string;
  tracks: readonly CurvedTrackItem[];
  memoriesLabel: string;
  memoryPrefix: string;
  launchConfetti: string;
  relations: Record<string, string>;
}

const BIRTHDAY_COPY: Record<CoreLanguageCode, LocalizedBirthdayCopy> = {
  hinglish: {
    prologueBadge: 'Aapke liye ek starlit birthday tohfa',
    fromLabel: 'Bheja hai:',
    pullPrompt: 'Roshni kholo aur apna birthday aasman jagao',
    skyPrologueSubtitle: 'Neeche chamakti dori khinch kar ya tap karke apna aasman roshan karein',
    skyIlluminatedSubtitle: 'Aaj raat ke har taare mein sirf aapka naam chamak raha hai',
    pullHintText: 'Shuru karne ke liye sunehri dori par tap karein ya neeche khinchein',
    scrollCue: 'Neeche scroll karein · Sitaaron ki sair shuru hoti hai',
    navAriaLabel: 'Birthday chapters navigation',
    navTabs: {
      sky: 'Aasman',
      walk: 'Night Walk',
      cake: 'Cake',
      sanctuary: 'Khat & Geet',
    },
    walkActLabel: 'Act II · Starry Meadow Trail',
    walkHeading: 'Raat ki Dheemi Sair',
    walkSubheading: 'Har kadam par chamakte dil ke orbs par tap karke chhupi duaein padhein',
    walkDiscoveryStatus: (found, total) => `${found}/${total} Duaein Mili`,
    walkAllDiscovered: 'Sabhi Duaein Roshan',
    walkTapOrbHint: 'Chamakte dil par tap karein',
    walkPrevStep: 'Pichla Kadam',
    walkNextStep: 'Agla Kadam',
    walkToCake: 'Cake Stage Tak Chalein',
    walkSteps: [
      {
        id: 'lantern-gate',
        badge: 'Step 01',
        title: 'Lantern Gate',
        caption: 'Shaam ke sunehre deepakon ke beech pehla kadam aur ek pyaari yaad.',
      },
      {
        id: 'firefly-meadow',
        badge: 'Step 02',
        title: 'Jugnuon ka Maidan',
        caption: 'Hawa mein udte jugnu aur dil se nikli sachchi muskaan.',
      },
      {
        id: 'cake-clearing',
        badge: 'Step 03',
        title: 'Jashn ka Aangan',
        caption: 'Roshniyon se saja aakhiri mod, jahan aapka birthday cake intezaar kar raha hai.',
      },
    ],
    fallbackWhispers: [
      {
        title: 'Hamesha Chamakte Raho',
        detail: 'Aapki hansi har mehfil aur har aam shaam ko khaas bana deti hai.',
      },
      {
        title: 'Sukoon aur Khushiyan',
        detail: 'Aane wala har naya saal aapke liye shanti, himmat aur pyaari yaadein laaye.',
      },
      {
        title: 'Dil se Birthday Wish',
        detail: 'Aaj ki raat sirf aapke naam, aapke sapnon aur aapki muskaan ke naam hai.',
      },
    ],
    cakeActLabel: 'Cake & Wish Stage',
    cakeHeading: 'Teeno Candles Par Tap Karein',
    cakePrompt: 'Teeno candles ek saath bujhaayein',
    candleTapHint: 'Har candle par tap karein aur aasman mein confetti dekhein',
    candlesLitStatus: (out, total) => `${out}/${total} Candles Bujhin`,
    candleButtonLabel: (idx, isOut) => `Candle ${idx + 1} · ${isOut ? 'Bujh gayi' : 'Jal rahi hai'}`,
    wishUnlocked: 'Wish Unlocked!',
    wishUnlockedMessage: 'Dil ki har dua poori ho. Naya saal khushiyon se bhara rahe.',
    relightHint: 'Dobara candles jalaane ke liye tap karein',
    letterActLabel: 'Act III · Birthday Chronicle',
    journalTag: 'KEEPSAKE LETTER',
    noteLabel: 'Dil se Likha Khat',
    letterIntro: (name) => `Aaj ke sitaaron ke neeche, sirf ${name} ke naam ek khat.`,
    signedPrefix: 'Dil ki gehraiyon se,',
    soundtrackHeading: 'Birthday Vinyl Sanctuary',
    tracks: [
      {
        id: 'midnight-lantern',
        title: 'Midnight Lantern Waltz',
        moodLabel: 'Warm Chime',
        duration: '02:48',
        note: 'Raat ke shant aasman aur jhilmilate taaron ke liye ek narm birthday dhun.',
      },
      {
        id: 'confetti-sparkle',
        title: 'Confetti Sparkle Groove',
        moodLabel: 'Golden Celebration',
        duration: '03:12',
        note: 'Candles bujhne aur confetti udne wale khushnuma pal ka soundtrack.',
      },
      {
        id: 'treehouse-echo',
        title: 'Starlit Treehouse Acoustic',
        moodLabel: 'Cozy Acoustic',
        duration: '02:56',
        note: 'Lambe safar, chai aur behtareen yaadon ko mehsoos karne ke liye.',
      },
    ],
    memoriesLabel: 'Khaas Yaadon ki Gallery',
    memoryPrefix: 'Yaad',
    launchConfetti: 'Phir se Confetti Udaao',
    relations: {
      friend: 'Best Friend',
      partner: 'Partner',
      sibling: 'Bhai / Behen',
    },
  },
  hi: {
    prologueBadge: 'आपके लिए एक सितारों भरा जन्मदिन उपहार',
    fromLabel: 'प्रेषक:',
    pullPrompt: 'रोशनी खींचें और अपना बर्थडे आसमान जगाएँ',
    skyPrologueSubtitle: 'नीचे चमकती डोरी को खींचें या टैप करें और रात का आसमान रोशन करें',
    skyIlluminatedSubtitle: 'आज रात हर चमकते तारे में सिर्फ़ आपका नाम सजा है',
    pullHintText: 'शुरू करने के लिए सुनहरी डोरी पर टैप करें या नीचे खींचें',
    scrollCue: 'नीचे स्क्रॉल करें · तारों भरी सैर शुरू होती है',
    navAriaLabel: 'जन्मदिन के अध्याय',
    navTabs: {
      sky: 'आसमान',
      walk: 'नाइट वॉक',
      cake: 'केक',
      sanctuary: 'पत्र व संगीत',
    },
    walkActLabel: 'अध्याय II · तारों भरी पगडंडी',
    walkHeading: 'चाँदनी रात की सैर',
    walkSubheading: 'रास्ते में चमकते दिलों पर टैप कर हर प्यारी दुआ पढ़ें',
    walkDiscoveryStatus: (found, total) => `${found}/${total} दुआएँ मिलीं`,
    walkAllDiscovered: 'सभी दुआएँ खुलीं',
    walkTapOrbHint: 'चमकते दिल पर टैप करें',
    walkPrevStep: 'पिछला कदम',
    walkNextStep: 'अगला कदम',
    walkToCake: 'केक स्टेज तक चलें',
    walkSteps: [
      {
        id: 'lantern-gate',
        badge: 'कदम 01',
        title: 'लालटेन द्वार',
        caption: 'सुनहरी रोशनी के बीच पहला कदम और दिल को छू लेने वाली याद।',
      },
      {
        id: 'firefly-meadow',
        badge: 'कदम 02',
        title: 'जुगनुओं का मैदान',
        caption: 'धीमी हवा में उड़ते जुगनू और आपके लिए सजी सच्ची शुभकामनाएँ।',
      },
      {
        id: 'cake-clearing',
        badge: 'कदम 03',
        title: 'जश्न का आँगन',
        caption: 'रोशनी से सजा अंतिम पड़ाव, जहाँ आपका जन्मदिन केक इंतज़ार कर रहा है।',
      },
    ],
    fallbackWhispers: [
      {
        title: 'सदा मुस्कुराते रहें',
        detail: 'आपकी मुस्कान हर साधारण दिन को भी एक खूबसूरत उत्सव बना देती है।',
      },
      {
        title: 'सुकून और सफलता',
        detail: 'आने वाला वर्ष आपके जीवन में शांति, साहस और ढेरों खुशियाँ लेकर आए।',
      },
      {
        title: 'दिल से शुभकामना',
        detail: 'आज की यह तारों भरी रात सिर्फ़ आपके सपनों और मुस्कान के नाम है।',
      },
    ],
    cakeActLabel: 'केक और विश स्टेज',
    cakeHeading: 'तीनों मोमबत्तियों पर टैप करें',
    cakePrompt: 'तीनों मोमबत्तियाँ एक साथ बुझाएँ',
    candleTapHint: 'हर मोमबत्ती पर टैप करें और कन्फेटी का जश्न देखें',
    candlesLitStatus: (out, total) => `${out}/${total} मोमबत्तियाँ बुझीं`,
    candleButtonLabel: (idx, isOut) => `मोमबत्ती ${idx + 1} · ${isOut ? 'बुझी हुई' : 'जल रही है'}`,
    wishUnlocked: 'विश अनलॉक हुई!',
    wishUnlockedMessage: 'आपकी हर मनचाही मुराद पूरी हो और नया साल खुशियों से महकता रहे।',
    relightHint: 'मोमबत्तियाँ फिर से जलाने के लिए टैप करें',
    letterActLabel: 'अध्याय III · जन्मदिन पत्र',
    journalTag: 'खास यादगार पत्र',
    noteLabel: 'स्नेह भरा संदेश',
    letterIntro: (name) => `आज की चाँदनी के नीचे, सिर्फ़ ${name} के नाम एक पत्र।`,
    signedPrefix: 'स्नेह और शुभकामनाओं सहित,',
    soundtrackHeading: 'बर्थडे विनाइल लाउंज',
    tracks: [
      {
        id: 'midnight-lantern',
        title: 'मिडनाइट लालटेन धुन',
        moodLabel: 'शांत संगीत',
        duration: '02:48',
        note: 'तारों भरे आकाश और सुकून भरी जन्मदिन की शाम के लिए एक कोमल धुन।',
      },
      {
        id: 'confetti-sparkle',
        title: 'कन्फेटी स्पार्कल ताल',
        moodLabel: 'जश्न की धुन',
        duration: '03:12',
        note: 'मोमबत्तियाँ बुझाने और जश्न मनाने के खास पल का संगीत।',
      },
      {
        id: 'treehouse-echo',
        title: 'ट्रीहाउस एकॉस्टिक',
        moodLabel: 'मीठी यादें',
        duration: '02:56',
        note: 'पुरानी बातों, हँसी और प्यारी यादों को फिर से जीने के लिए।',
      },
    ],
    memoriesLabel: 'यादों की एल्बम',
    memoryPrefix: 'याद',
    launchConfetti: 'फिर से कन्फेटी उड़ाएँ',
    relations: {
      friend: 'पक्का दोस्त',
      partner: 'जीवनसाथी',
      sibling: 'भाई / बहन',
    },
  },
  en: {
    prologueBadge: 'A starlit birthday keepsake made for you',
    fromLabel: 'From:',
    pullPrompt: 'Pull the light to awaken your birthday sky',
    skyPrologueSubtitle: 'Pull down or tap the glowing brass cord to illuminate tonight’s sky',
    skyIlluminatedSubtitle: 'Every connected star above is shining in your name tonight',
    pullHintText: 'Tap or gently pull the brass orb to awaken the sky',
    scrollCue: 'Scroll down · Your starlit birthday walk begins',
    navAriaLabel: 'Birthday chapters navigation',
    navTabs: {
      sky: 'Sky',
      walk: 'Night Walk',
      cake: 'Cake',
      sanctuary: 'Letter & Music',
    },
    walkActLabel: 'Act II · Starry Night-Meadow Trail',
    walkHeading: 'Walk Under the Meadow Stars',
    walkSubheading: 'Step along the trail and tap each glowing heart orb to uncover hidden wishes',
    walkDiscoveryStatus: (found, total) => `${found}/${total} Wishes Lit`,
    walkAllDiscovered: 'All Wishes Discovered',
    walkTapOrbHint: 'Tap glowing heart orb',
    walkPrevStep: 'Previous Step',
    walkNextStep: 'Next Step',
    walkToCake: 'Arrive at the Cake',
    walkSteps: [
      {
        id: 'lantern-gate',
        badge: 'Step 01',
        title: 'The Lantern Gate',
        caption: 'Begin beneath warm brass lanterns where the quiet midnight meadow opens.',
      },
      {
        id: 'firefly-meadow',
        badge: 'Step 02',
        title: 'Firefly Clearing',
        caption: 'Drifting fireflies and glowing heart whispers tucked among the wildflowers.',
      },
      {
        id: 'cake-clearing',
        badge: 'Step 03',
        title: 'Celebration Arch',
        caption: 'The final curve of the trail, leading straight to your candlelit birthday cake.',
      },
    ],
    fallbackWhispers: [
      {
        title: 'Keep Shining Bright',
        detail: 'You turn ordinary evenings into the kind of stories everyone remembers.',
      },
      {
        title: 'Calm & Joy Ahead',
        detail: 'May this new chapter bring unhurried mornings, bold wins, and gentle peace.',
      },
      {
        title: 'A Midnight Wish',
        detail: 'Tonight belongs to your laughter, your dreams, and every light you bring.',
      },
    ],
    cakeActLabel: 'Cake & Wish Stage',
    cakeHeading: 'Blow Out All 3 Candles',
    cakePrompt: 'Blow out all 3 candles',
    candleTapHint: 'Tap each candle flame for rising smoke and confetti',
    candlesLitStatus: (out, total) => `${out}/${total} Candles Out`,
    candleButtonLabel: (idx, isOut) => `Candle ${idx + 1} · ${isOut ? 'Out' : 'Lit'}`,
    wishUnlocked: 'Wish Unlocked!',
    wishUnlockedMessage: 'May every wish spoken tonight find its way back to you multiplied.',
    relightHint: 'Tap to relight the candles',
    letterActLabel: 'Act III · Handwritten Chronicle',
    journalTag: 'BIRTHDAY CHRONICLE',
    noteLabel: 'Keepsake Letter',
    letterIntro: (name) => `Written beneath tonight's quiet stars, especially for ${name}.`,
    signedPrefix: 'Always cheering for you,',
    soundtrackHeading: 'Birthday Vinyl Lounge',
    tracks: [
      {
        id: 'midnight-lantern',
        title: 'Midnight Lantern Waltz',
        moodLabel: 'Warm Chime',
        duration: '02:48',
        note: 'A soft midnight melody crafted for watching your constellation come alive.',
      },
      {
        id: 'confetti-sparkle',
        title: 'Confetti Sparkle Groove',
        moodLabel: 'Celebration Glow',
        duration: '03:12',
        note: 'Bright, buoyant chords for blowing out candles and launching confetti.',
      },
      {
        id: 'treehouse-echo',
        title: 'Starlit Treehouse Acoustic',
        moodLabel: 'Cozy Acoustic',
        duration: '02:56',
        note: 'Gentle acoustic warmth for slow walks, late-night talks, and quiet gratitude.',
      },
    ],
    memoriesLabel: 'Captured Memories',
    memoryPrefix: 'Memory',
    launchConfetti: 'Launch Confetti Again',
    relations: {
      friend: 'Best Friend',
      partner: 'Partner',
      sibling: 'Sibling',
    },
  },
};

const SVG_CONFETTI_PIECES = [
  { left: '6%', delay: '0ms', duration: '1650ms', color: '#E11D63', kind: 'ribbon', rot: '-22deg' },
  { left: '13%', delay: '120ms', duration: '1800ms', color: '#F59E0B', kind: 'star', rot: '18deg' },
  { left: '21%', delay: '60ms', duration: '1580ms', color: '#FDE68A', kind: 'diamond', rot: '35deg' },
  { left: '29%', delay: '190ms', duration: '1750ms', color: '#FB7185', kind: 'circle', rot: '0deg' },
  { left: '37%', delay: '40ms', duration: '1680ms', color: '#93C5FD', kind: 'ribbon', rot: '-16deg' },
  { left: '46%', delay: '140ms', duration: '1840ms', color: '#E11D63', kind: 'star', rot: '26deg' },
  { left: '54%', delay: '90ms', duration: '1620ms', color: '#F59E0B', kind: 'diamond', rot: '-30deg' },
  { left: '63%', delay: '210ms', duration: '1760ms', color: '#FFFFFF', kind: 'circle', rot: '0deg' },
  { left: '72%', delay: '75ms', duration: '1590ms', color: '#FB7185', kind: 'ribbon', rot: '20deg' },
  { left: '80%', delay: '160ms', duration: '1820ms', color: '#FDE68A', kind: 'star', rot: '-15deg' },
  { left: '88%', delay: '45ms', duration: '1700ms', color: '#93C5FD', kind: 'diamond', rot: '42deg' },
  { left: '94%', delay: '130ms', duration: '1640ms', color: '#E11D63', kind: 'circle', rot: '0deg' },
] as const;

interface WalkWhisperOrb {
  id: string;
  stepIndex: 0 | 1 | 2;
  leftPct: number;
  topPct: number;
  title: string;
  detail: string;
}

function resolveRelationLabel(relation: string | undefined, copy: LocalizedBirthdayCopy): string | null {
  if (!relation?.trim()) return null;
  const normalized = relation.trim().toLowerCase();
  if (copy.relations[normalized]) return copy.relations[normalized];
  return relation.trim().replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Crisp SVG confetti celebration layer (ribbons, stars, diamonds, circles). */
function SvgConfettiBurstLayer({ burstId }: { burstId: number }) {
  if (burstId === 0) return null;

  return (
    <div
      key={burstId}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] overflow-hidden motion-reduce:hidden"
    >
      {SVG_CONFETTI_PIECES.map((piece, idx) => (
        <svg
          key={`${burstId}-${idx}`}
          viewBox="0 0 18 18"
          className="wb-confetti-piece absolute -top-5 h-4 w-4"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            transform: `rotate(${piece.rot})`,
          }}
        >
          {piece.kind === 'star' ? (
            <path
              d="M9 1.5 L11.1 6.6 L16.5 7.2 L12.3 10.8 L13.6 16.2 L9 13.3 L4.4 16.2 L5.7 10.8 L1.5 7.2 L6.9 6.6 Z"
              fill={piece.color}
            />
          ) : piece.kind === 'ribbon' ? (
            <path
              d="M5 2 C11 5, 6 11, 13 16"
              stroke={piece.color}
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          ) : piece.kind === 'diamond' ? (
            <polygon points="9,2 15,9 9,16 3,9" fill={piece.color} />
          ) : (
            <circle cx="9" cy="9" r="5.5" fill={piece.color} />
          )}
        </svg>
      ))}
    </div>
  );
}

/** Interactive 3-Candle Polka-Dot Frosted Birthday Cake with soft rising smoke. */
function CelebrationCakeStage({
  blownCandles,
  onToggleSingleCandle,
  primaryColor,
  secondaryColor,
}: {
  blownCandles: boolean[];
  onToggleSingleCandle: (idx: number) => void;
  primaryColor: string;
  secondaryColor: string;
}) {
  const candlePositions = [78, 110, 142];
  const allOut = blownCandles.every(Boolean);

  return (
    <div className="relative mx-auto flex w-full max-w-[270px] flex-col items-center">
      <svg viewBox="0 0 220 165" className="h-44 w-full max-w-[245px] drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)]" fill="none">
        {/* Soft luminous halo behind cake */}
        <circle
          cx="110"
          cy="80"
          r="64"
          fill={allOut ? '#FEF3C7' : '#FFE4EF'}
          fillOpacity={allOut ? 0.24 : 0.16}
          className="transition-all duration-500"
        />

        {/* Sparkles unlocked when all candles are blown out */}
        <g
          className={`transition-all duration-500 ${
            allOut ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{ transformOrigin: '110px 65px' }}
        >
          <path d="M38 36 L41.5 44 L49.5 47.5 L41.5 51 L38 59 L34.5 51 L26.5 47.5 L34.5 44 Z" fill={secondaryColor} />
          <path d="M180 32 L183 39 L190 42 L183 45 L180 52 L177 45 L170 42 L177 39 Z" fill={primaryColor} />
          <circle cx="58" cy="20" r="3" fill="#FDE68A" />
          <circle cx="162" cy="20" r="3" fill={secondaryColor} />
        </g>

        {/* Candles — each independently tappable */}
        {candlePositions.map((x, idx) => {
          const isOut = blownCandles[idx];
          return (
            <g
              key={x}
              onClick={() => onToggleSingleCandle(idx)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-pressed={isOut}
              aria-label={`Candle ${idx + 1} ${isOut ? 'out' : 'lit'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleSingleCandle(idx);
                }
              }}
            >
              {/* Generous invisible hit area for effortless finger taps */}
              <rect x={x - 16} y="4" width="32" height="62" fill="transparent" />
              <rect
                x={x - 4.5}
                y="38"
                width="9"
                height="26"
                rx="3"
                fill={idx === 1 ? primaryColor : secondaryColor}
              />
              <path
                d={`M${x - 4.5} 46 L${x + 4.5} 43 M${x - 4.5} 54 L${x + 4.5} 51`}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeOpacity="0.78"
              />
              <line x1={x} y1="34" x2={x} y2="38" stroke="#E2E8F0" strokeWidth="1.6" strokeLinecap="round" />

              {/* Warm candle flame */}
              <g
                className={`wb-flame transition-all duration-300 ${
                  isOut ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                }`}
                style={{
                  transformOrigin: `${x}px 33px`,
                  animationDelay: `${idx * 140}ms`,
                }}
              >
                <ellipse cx={x} cy="25" rx="8.5" ry="11" fill={secondaryColor} fillOpacity="0.32" />
                <path
                  d={`M${x} 15 C${x + 5.5} 23, ${x + 5.5} 32, ${x} 34 C${x - 5.5} 32, ${x - 5.5} 23, ${x} 15 Z`}
                  fill={secondaryColor}
                />
                <path
                  d={`M${x} 21.5 C${x + 2.8} 26, ${x + 2.8} 31, ${x} 32.5 C${x - 2.8} 31, ${x - 2.8} 26, ${x} 21.5 Z`}
                  fill="#FFFBEB"
                />
              </g>

              {/* Soft rising smoke curls when blown out */}
              {isOut ? (
                <g className="wb-smoke" style={{ animationDelay: `${idx * 110}ms` }}>
                  <path
                    d={`M${x} 33 C${x - 5} 26, ${x + 5} 20, ${x - 1.5} 12`}
                    stroke="#E2E8F0"
                    strokeOpacity="0.65"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d={`M${x + 2} 29 C${x + 6} 23, ${x - 2} 17, ${x + 3} 10`}
                    stroke="#FDE68A"
                    strokeOpacity="0.38"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>
              ) : null}
            </g>
          );
        })}

        {/* Frosted polka-dot 2-tier birthday cake */}
        <rect x="64" y="63" width="92" height="36" rx="10" fill="#FFFDF9" stroke="#FDE68A" strokeOpacity="0.4" strokeWidth="1.4" />
        <path
          d="M64 70 C64 65, 68 63, 74 63 L146 63 C152 63, 156 65, 156 70 L156 76 C151 79, 147 75, 142 78 C137 81, 133 74, 127 77 C121 80, 117 75, 110 79 C103 82, 99 74, 93 77 C87 80, 82 75, 76 78 C71 80, 67 76, 64 75 Z"
          fill={secondaryColor}
        />
        <circle cx="80" cy="87" r="2.3" fill={primaryColor} />
        <circle cx="96" cy="91" r="2.3" fill="#3B82F6" />
        <circle cx="110" cy="87" r="2.3" fill={secondaryColor} />
        <circle cx="126" cy="91" r="2.3" fill={primaryColor} />
        <circle cx="140" cy="87" r="2.3" fill="#3B82F6" />

        <rect x="44" y="96" width="132" height="44" rx="12" fill={primaryColor} />
        <path
          d="M44 103 C44 98, 48 96, 54 96 L166 96 C172 96, 176 98, 176 103 L176 108 C169 112, 163 106, 156 110 C149 114, 143 107, 136 111 C128 115, 121 107, 110 112 C100 116, 92 107, 84 111 C76 115, 69 107, 61 110 C55 113, 49 108, 44 108 Z"
          fill="#FFFDF9"
        />
        <circle cx="64" cy="126" r="3" fill="#FFFBEB" />
        <circle cx="92" cy="128" r="3" fill={secondaryColor} />
        <circle cx="112" cy="124" r="2.6" fill="#93C5FD" />
        <circle cx="132" cy="128" r="3" fill="#FFFBEB" />
        <circle cx="156" cy="126" r="3" fill={secondaryColor} />

        {/* Cake stand */}
        <rect x="30" y="139" width="160" height="8" rx="4" fill="#050816" fillOpacity="0.45" />
        <rect x="34" y="136" width="152" height="7" rx="3.5" fill="#FFFDF9" />
      </svg>
    </div>
  );
}

/**
 * Multi-act cinematic Birthday keepsake microsite:
 * Act 1: Pull the Light -> Starlight Constellation Name Sky
 * Act 2: Horizontal Night-Meadow Story Walk with Heart Whisper Orbs -> 3-Candle Frosted Cake
 * Act 3: Word-by-word Handwritten Chronicle Letter -> Curved Vinyl Sanctuary -> Adaptive Gallery -> Replay
 */
export function BirthdayConfettiSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const uid = useId().replace(/:/g, '');
  const [skyLit, setSkyLit] = useState(false);
  const [showPullHint, setShowPullHint] = useState(false);
  const [activeAct, setActiveAct] = useState<BirthdayActId>('sky');
  const [walkStep, setWalkStep] = useState<0 | 1 | 2>(0);
  const [activeOrbId, setActiveOrbId] = useState<string | null>(null);
  const [discoveredOrbIds, setDiscoveredOrbIds] = useState<string[]>([]);
  const [blownCandles, setBlownCandles] = useState<boolean[]>([false, false, false]);
  const [confettiBurstKey, setConfettiBurstKey] = useState(0);

  const skyRef = useRef<HTMLDivElement | null>(null);
  const walkRef = useRef<HTMLElement | null>(null);
  const cakeRef = useRef<HTMLElement | null>(null);
  const sanctuaryRef = useRef<HTMLElement | null>(null);
  const swipeStartXRef = useRef<number | null>(null);

  const coreLang = toCoreLanguageCode(language);
  const copy = BIRTHDAY_COPY[coreLang] ?? BIRTHDAY_COPY.en;

  const primaryColor = manifest.palette.primary || '#E11D63';
  const secondaryColor = manifest.palette.secondary || '#F59E0B';
  const relationLabel = resolveRelationLabel(data.relation, copy);
  const candlesOutCount = blownCandles.filter(Boolean).length;
  const allCandlesOut = candlesOutCount === 3;
  const musicLabel = manifest.music[0]?.label?.trim();

  // Build 3 mood tracks for CurvedTrackSanctuary, weaving in manifest track 1 label if available
  const birthdayTracks = useMemo<CurvedTrackItem[]>(() => {
    return copy.tracks.map((track, idx) =>
      idx === 0 && musicLabel ? { ...track, title: musicLabel } : track,
    );
  }, [copy.tracks, musicLabel]);

  // Distribute data.highlights and fallback birthday wishes across Steps 1, 2, 3
  const walkWhispers = useMemo<WalkWhisperOrb[]>(() => {
    const rawHighlights = data.highlights ?? [];
    const stepCoords: readonly { leftPct: number; topPct: number }[] = [
      { leftPct: 30, topPct: 48 },
      { leftPct: 68, topPct: 38 },
      { leftPct: 48, topPct: 54 },
    ];

    const grouped: [WalkWhisperOrb[], WalkWhisperOrb[], WalkWhisperOrb[]] = [[], [], []];

    rawHighlights.forEach((item, idx) => {
      const stepIdx = (idx % 3) as 0 | 1 | 2;
      const slot = grouped[stepIdx].length;
      grouped[stepIdx].push({
        id: `highlight-${idx}`,
        stepIndex: stepIdx,
        leftPct: Math.min(82, Math.max(18, stepCoords[stepIdx].leftPct + (slot % 2 === 0 ? 0 : 22))),
        topPct: Math.min(68, Math.max(24, stepCoords[stepIdx].topPct + (slot % 2 === 0 ? 0 : -12))),
        title: pickLocalizedText(item.title, language),
        detail: pickLocalizedText(item.detail, language),
      });
    });

    ([0, 1, 2] as const).forEach((stepIdx) => {
      if (grouped[stepIdx].length === 0) {
        const fallback = copy.fallbackWhispers[stepIdx];
        grouped[stepIdx].push({
          id: `wish-fallback-${stepIdx}`,
          stepIndex: stepIdx,
          leftPct: stepCoords[stepIdx].leftPct,
          topPct: stepCoords[stepIdx].topPct,
          title: fallback.title,
          detail: fallback.detail,
        });
      }
    });

    return [...grouped[0], ...grouped[1], ...grouped[2]];
  }, [copy.fallbackWhispers, data.highlights, language]);

  const currentStepOrbs = useMemo(
    () => walkWhispers.filter((orb) => orb.stepIndex === walkStep),
    [walkWhispers, walkStep],
  );

  // Select first orb on step change if none active in this step
  useEffect(() => {
    if (!skyLit) return;
    if (currentStepOrbs.length > 0 && !currentStepOrbs.some((o) => o.id === activeOrbId)) {
      const firstOrb = currentStepOrbs[0];
      setActiveOrbId(firstOrb.id);
      setDiscoveredOrbIds((prev) => (prev.includes(firstOrb.id) ? prev : [...prev, firstOrb.id]));
    }
  }, [skyLit, walkStep, currentStepOrbs, activeOrbId]);

  useEffect(() => {
    if (skyLit) return;
    const timer = setTimeout(() => setShowPullHint(true), 7000);
    return () => clearTimeout(timer);
  }, [skyLit]);

  // Keep sticky quick-jump pill highlight synced while scrolling
  useEffect(() => {
    if (!skyLit || typeof IntersectionObserver === 'undefined') return;
    const targets: Array<{ id: BirthdayActId; el: HTMLElement | null }> = [
      { id: 'sky', el: skyRef.current },
      { id: 'walk', el: walkRef.current },
      { id: 'cake', el: cakeRef.current },
      { id: 'sanctuary', el: sanctuaryRef.current },
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length === 0) return;
        const matched = targets.find((t) => t.el === visible[0].target);
        if (matched) setActiveAct(matched.id);
      },
      { threshold: [0.25, 0.55] },
    );

    targets.forEach((t) => {
      if (t.el) observer.observe(t.el);
    });

    return () => observer.disconnect();
  }, [skyLit]);

  function triggerConfetti() {
    setConfettiBurstKey((prev) => prev + 1);
  }

  function handleAwakenSky() {
    if (skyLit) return;
    setSkyLit(true);
    setActiveAct('sky');
    triggerConfetti();
    onOpened?.();
  }

  function handleReplay() {
    setSkyLit(false);
    setShowPullHint(false);
    setActiveAct('sky');
    setWalkStep(0);
    setActiveOrbId(null);
    setDiscoveredOrbIds([]);
    setBlownCandles([false, false, false]);
    setConfettiBurstKey(0);
    skyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleJumpToAct(act: BirthdayActId) {
    setActiveAct(act);
    const map: Record<BirthdayActId, HTMLElement | null> = {
      sky: skyRef.current,
      walk: walkRef.current,
      cake: cakeRef.current,
      sanctuary: sanctuaryRef.current,
    };
    map[act]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleSelectOrb(orb: WalkWhisperOrb) {
    setActiveOrbId(orb.id);
    setDiscoveredOrbIds((prev) => (prev.includes(orb.id) ? prev : [...prev, orb.id]));
  }

  function handleToggleSingleCandle(idx: number) {
    setBlownCandles((prev) => {
      const next = [...prev];
      const becomingOut = !prev[idx];
      next[idx] = becomingOut;
      if (becomingOut) {
        triggerConfetti();
      }
      return next;
    });
  }

  function handleBlowAllCandles() {
    setBlownCandles((prev) => {
      const shouldBlow = !prev.every(Boolean);
      if (shouldBlow) triggerConfetti();
      return [shouldBlow, shouldBlow, shouldBlow];
    });
  }

  function handleTrailPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    swipeStartXRef.current = e.clientX;
  }

  function handleTrailPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (swipeStartXRef.current === null) return;
    const dx = e.clientX - swipeStartXRef.current;
    swipeStartXRef.current = null;
    if (dx <= -38 && walkStep < 2) {
      setWalkStep((prev) => (prev < 2 ? ((prev + 1) as 0 | 1 | 2) : prev));
    } else if (dx >= 38 && walkStep > 0) {
      setWalkStep((prev) => (prev > 0 ? ((prev - 1) as 0 | 1 | 2) : prev));
    }
  }

  const activeOrb = walkWhispers.find((orb) => orb.id === activeOrbId) ?? currentStepOrbs[0] ?? null;
  const allOrbsDiscovered =
    walkWhispers.length > 0 && discoveredOrbIds.length >= walkWhispers.length;
  const hasPhotos = Boolean(data.photos && data.photos.some((p) => typeof p === 'string' && p.trim().length > 0));
  const actOrder: readonly BirthdayActId[] = ['sky', 'walk', 'cake', 'sanctuary'];

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-x-hidden rounded-[28px] bg-[#070A16] text-white">
      <style>{`
        @keyframes wbConfettiFall-${uid} {
          0% { opacity: 0; transform: translate3d(0, -16px, 0) scale(0.85) rotate(0deg); }
          12% { opacity: 1; }
          85% { opacity: 1; }
          100% { opacity: 0; transform: translate3d(14px, 540px, 0) scale(1) rotate(260deg); }
        }
        @keyframes wbFlameFlicker-${uid} {
          0%, 100% { transform: scaleY(1) scaleX(1) rotate(-1.5deg); }
          50% { transform: scaleY(1.09) scaleX(0.93) rotate(2deg); }
        }
        @keyframes wbSmokeRise-${uid} {
          0% { opacity: 0; transform: translateY(4px) scale(0.85); }
          35% { opacity: 0.7; }
          100% { opacity: 0; transform: translateY(-14px) scale(1.18); }
        }
        @keyframes wbOrbHalo-${uid} {
          0%, 100% { box-shadow: 0 0 0 0 rgba(225, 29, 99, 0.55), 0 0 18px rgba(245, 158, 11, 0.45); }
          50% { box-shadow: 0 0 0 8px rgba(225, 29, 99, 0), 0 0 26px rgba(245, 158, 11, 0.78); }
        }
        .wb-confetti-piece {
          animation-name: wbConfettiFall-${uid};
          animation-timing-function: cubic-bezier(0.22, 0.7, 0.35, 1);
          animation-fill-mode: forwards;
        }
        .wb-flame {
          animation: wbFlameFlicker-${uid} 1.1s ease-in-out infinite;
        }
        .wb-smoke {
          animation: wbSmokeRise-${uid} 1.7s ease-out infinite;
        }
        .wb-orb-pulse {
          animation: wbOrbHalo-${uid} 2.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .wb-confetti-piece, .wb-flame, .wb-smoke, .wb-orb-pulse {
            animation: none !important;
          }
        }
      `}</style>

      <SvgConfettiBurstLayer burstId={confettiBurstKey} />

      {/* Subtle night fireflies once the sky is awakened */}
      {skyLit ? (
        <div className="pointer-events-none fixed inset-0 z-0 opacity-60">
          <AmbientRainCanvas fireflies density="light" tint="rgba(253, 224, 71, 0.78)" />
        </div>
      ) : null}

      {watermarked ? (
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-20 flex justify-center border-b border-white/10 bg-[#050814]/95 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#FEF3C7]"
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      {!skyLit ? (
        /* ACT 1 PROLOGUE: Velvet midnight screen with swaying brass lantern & pull cord */
        <div
          ref={skyRef}
          className="relative flex flex-1 flex-col justify-between px-4 pb-6 pt-4 sm:px-6"
        >
          <OccasionArtworkBackdrop
            src="/templates/occasions/birthday-confetti/cover.jpg"
            fallbackGradient="radial-gradient(circle at 50% 35%, #171E4A 0%, #0B1230 58%, #070A16 100%)"
            className="object-cover object-center opacity-20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#070A16]/90 via-[#070A16]/80 to-[#050814]/95"
          />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-3">
            <span className="inline-flex min-h-[32px] items-center gap-2 rounded-full border border-amber-200/25 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold text-amber-100">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" aria-hidden="true" />
              <span>{copy.prologueBadge}</span>
            </span>
            {relationLabel ? (
              <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-100">
                {relationLabel}
              </span>
            ) : null}
          </div>

          <div className="relative z-10 my-auto w-full">
            <div className="mb-3 text-center">
              <h1 className="break-words font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {data.receiverName}
              </h1>
              <p className="mt-1 text-xs text-indigo-100/75">
                {copy.fromLabel} <strong className="text-amber-200">{data.senderName}</strong>
              </p>
            </div>

            <ConstellationNameSky
              recipientName={data.receiverName}
              subtitle={copy.skyPrologueSubtitle}
              pullPrompt={copy.pullPrompt}
              unlocked={false}
              onUnlock={handleAwakenSky}
            />

            {showPullHint ? (
              <p className="mt-3 text-center text-xs font-medium text-amber-200/90 animate-pulse motion-reduce:animate-none">
                {copy.pullHintText}
              </p>
            ) : null}
          </div>

          <div className="relative z-10 pt-4 text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200/60">
            {pickLocalizedText(manifest.name, language)}
          </div>
        </div>
      ) : (
        /* ILLUMINATED MULTI-ACT SCROLLABLE BIRTHDAY KEEPSAKE */
        <div className="relative z-10 flex flex-1 flex-col gap-5 px-3.5 pb-6 pt-3 sm:px-5">
          {/* ACT 1 ILLUMINATED: Constellation Name Sky */}
          <div ref={skyRef} id="act-sky" className="scroll-mt-16">
            <ConstellationNameSky
              recipientName={data.receiverName}
              subtitle={copy.skyIlluminatedSubtitle}
              pullPrompt={copy.pullPrompt}
              unlocked
              onUnlock={handleAwakenSky}
            >
              <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-4 text-center backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
                    style={{ backgroundColor: `${primaryColor}D9` }}
                  >
                    {pickLocalizedText(manifest.name, language)}
                  </span>
                  {relationLabel ? (
                    <span className="rounded-full border border-amber-300/35 bg-amber-300/15 px-2.5 py-1 text-[10px] font-bold text-amber-200">
                      {relationLabel}
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-2.5 break-words font-heading text-2xl font-bold leading-snug text-white sm:text-3xl">
                  {pickLocalizedText(data.headline, language)}
                </h1>

                <p className="mt-1.5 text-xs text-indigo-100/80">
                  {copy.fromLabel} <strong className="text-amber-200">{data.senderName}</strong>
                </p>

                <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-200/85">
                  {copy.scrollCue}
                </p>
              </div>
            </ConstellationNameSky>
          </div>

          {/* STICKY QUICK-JUMP PILL NAV */}
          <nav
            aria-label={copy.navAriaLabel}
            className="sticky top-2 z-30 flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-white/15 bg-[#0B112B]/90 p-1.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.85)] backdrop-blur-md scrollbar-none"
          >
            {actOrder.map((actId, idx) => {
              const isActive = activeAct === actId;
              return (
                <button
                  key={actId}
                  type="button"
                  onClick={() => handleJumpToAct(actId)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`min-h-[44px] shrink-0 flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-[11px] font-bold transition-all active:scale-95 ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'text-indigo-100/75 hover:bg-white/10 hover:text-white'
                  }`}
                  style={isActive ? { backgroundColor: primaryColor } : undefined}
                >
                  <span className="mr-1 font-mono text-[10px] opacity-70">0{idx + 1}</span>
                  <span>{copy.navTabs[actId]}</span>
                </button>
              );
            })}
          </nav>

          {/* ACT 2A: Horizontal Story Walk + Glowing Heart Whisper Orbs */}
          <section
            ref={walkRef}
            id="act-walk"
            className="scroll-mt-20 rounded-[26px] border border-white/15 bg-[#0C1333]/90 p-4 shadow-2xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">
                {copy.walkActLabel}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  allOrbsDiscovered
                    ? 'border border-amber-300/45 bg-amber-300/20 text-amber-200'
                    : 'border border-rose-400/35 bg-rose-500/15 text-rose-200'
                }`}
              >
                {allOrbsDiscovered
                  ? copy.walkAllDiscovered
                  : copy.walkDiscoveryStatus(discoveredOrbIds.length, walkWhispers.length)}
              </span>
            </div>

            <h2 className="mt-2 font-heading text-xl font-bold text-white sm:text-2xl">
              {copy.walkHeading}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-indigo-100/75">{copy.walkSubheading}</p>

            {/* Step Selector Pills */}
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {copy.walkSteps.map((step, idx) => {
                const isCurrent = walkStep === idx;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setWalkStep(idx as 0 | 1 | 2)}
                    aria-pressed={isCurrent}
                    className={`min-h-[44px] rounded-xl border px-2 py-1.5 text-left transition-all active:scale-[0.98] ${
                      isCurrent
                        ? 'border-amber-300/60 bg-white/12 text-white shadow-sm'
                        : 'border-white/10 bg-white/5 text-indigo-100/70 hover:bg-white/10'
                    }`}
                  >
                    <span className="block font-mono text-[9px] font-bold uppercase tracking-wider text-amber-300">
                      {step.badge}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] font-bold">{step.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Panoramic Horizontal Meadow Trail Viewport */}
            <div
              onPointerDown={handleTrailPointerDown}
              onPointerUp={handleTrailPointerUp}
              className="relative mt-3 h-52 w-full touch-pan-y overflow-hidden rounded-2xl border border-white/15 bg-[#070B1E] select-none sm:h-56"
            >
              {/* 3-Stop Panoramic Starry Meadow SVG */}
              <div
                className="relative flex h-full w-[300%] transition-transform duration-700 ease-out motion-reduce:transition-none"
                style={{ transform: `translateX(-${walkStep * (100 / 3)}%)` }}
              >
                <svg
                  viewBox="0 0 900 210"
                  preserveAspectRatio="none"
                  className="h-full w-full shrink-0"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id={`meadow-sky-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#080D24" />
                      <stop offset="65%" stopColor="#121B42" />
                      <stop offset="100%" stopColor="#1B193B" />
                    </linearGradient>
                    <radialGradient id={`trail-glow-${uid}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  <rect width="900" height="210" fill={`url(#meadow-sky-${uid})`} />

                  {/* Star canopy across all 3 steps */}
                  {[
                    [42, 24], [95, 42], [148, 18], [218, 36], [274, 22],
                    [340, 32], [398, 18], [462, 44], [528, 22], [584, 38],
                    [640, 20], [710, 42], [776, 18], [842, 34], [875, 56],
                  ].map(([sx, sy], i) => (
                    <circle
                      key={`trail-star-${i}`}
                      cx={sx}
                      cy={sy}
                      r={i % 3 === 0 ? 1.5 : 1}
                      fill="#FEF9C3"
                      opacity={0.75}
                    />
                  ))}

                  {/* Distant midnight hills */}
                  <path
                    d="M0 156 Q110 120 230 148 T460 138 T700 148 T900 134 L900 210 L0 210 Z"
                    fill="#0D1433"
                  />
                  {/* Foreground meadow & curving night path */}
                  <path
                    d="M0 172 Q150 154 300 170 T600 166 T900 172 L900 210 L0 210 Z"
                    fill="#090D22"
                  />
                  <path
                    d="M28 190 Q160 164 300 182 T600 176 T870 186"
                    fill="none"
                    stroke="#FDE68A"
                    strokeOpacity="0.32"
                    strokeWidth="4"
                    strokeDasharray="8 9"
                    strokeLinecap="round"
                  />

                  {/* Step 1 landmark: Brass Lantern Gate */}
                  <g transform="translate(56, 118)">
                    <line x1="16" y1="0" x2="16" y2="54" stroke="#92400E" strokeWidth="3" />
                    <line x1="16" y1="6" x2="34" y2="6" stroke="#B45309" strokeWidth="2.5" />
                    <circle cx="34" cy="18" r="18" fill={`url(#trail-glow-${uid})`} />
                    <rect x="29" y="10" width="10" height="14" rx="2" fill="#FDE047" />
                  </g>

                  {/* Step 2 landmark: Wishing Tree & Fairy Lights */}
                  <g transform="translate(415, 92)">
                    <path d="M36 86 L42 42 L50 42 L56 86 Z" fill="#131B3E" />
                    <circle cx="34" cy="36" r="22" fill="#16214D" />
                    <circle cx="56" cy="34" r="20" fill="#16214D" />
                    <circle cx="45" cy="20" r="21" fill="#1B285C" />
                    <circle cx="24" cy="34" r="2.2" fill="#FDE047" />
                    <circle cx="46" cy="18" r="2.2" fill="#FB7185" />
                    <circle cx="62" cy="36" r="2.2" fill="#FDE047" />
                  </g>

                  {/* Step 3 landmark: Celebration Archway */}
                  <g transform="translate(744, 102)">
                    <path
                      d="M12 72 L12 30 A34 30 0 0 1 80 30 L80 72"
                      fill="none"
                      stroke="#F59E0B"
                      strokeOpacity="0.7"
                      strokeWidth="3"
                    />
                    <circle cx="20" cy="20" r="2.6" fill="#FDE047" />
                    <circle cx="46" cy="6" r="3" fill="#E11D63" />
                    <circle cx="72" cy="20" r="2.6" fill="#FDE047" />
                  </g>

                  {/* Soft lantern traveler beacon positioned per step */}
                  <g
                    transform={`translate(${walkStep === 0 ? 132 : walkStep === 1 ? 452 : 762}, 162)`}
                  >
                    <circle cx="0" cy="0" r="18" fill={`url(#trail-glow-${uid})`} />
                    <circle cx="0" cy="0" r="4.5" fill="#FEF08A" />
                  </g>
                </svg>
              </div>

              {/* Tappable Glowing Heart Hotspot Whisper Orbs for the current step */}
              {currentStepOrbs.map((orb) => {
                const isSelected = activeOrb?.id === orb.id;
                const isDiscovered = discoveredOrbIds.includes(orb.id);
                return (
                  <button
                    key={orb.id}
                    type="button"
                    onClick={() => handleSelectOrb(orb)}
                    aria-pressed={isSelected}
                    aria-label={`${orb.title} - ${copy.walkTapOrbHint}`}
                    style={{ left: `${orb.leftPct}%`, top: `${orb.topPct}%` }}
                    className={`wb-orb-pulse absolute z-20 flex min-h-[44px] min-w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-base font-bold transition-transform duration-300 hover:scale-110 active:scale-95 ${
                      isSelected
                        ? 'scale-110 border-amber-200 bg-[#E11D63] text-white'
                        : isDiscovered
                          ? 'border-amber-200/70 bg-amber-400/30 text-amber-100 backdrop-blur-xs'
                          : 'border-rose-200/80 bg-[#E11D63]/75 text-white backdrop-blur-xs'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.9]" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                  </button>
                );
              })}

              {/* Step caption overlay at top-left */}
              <div className="pointer-events-none absolute inset-x-3 top-2.5 flex items-center justify-between gap-2">
                <span className="rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-amber-100 backdrop-blur-xs">
                  {copy.walkSteps[walkStep].badge} · {copy.walkSteps[walkStep].title}
                </span>
                <span className="rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-medium text-indigo-100/85 backdrop-blur-xs">
                  {copy.walkTapOrbHint}
                </span>
              </div>
            </div>

            {/* Revealed Whisper Card */}
            {activeOrb ? (
              <div className="mt-3 rounded-2xl border border-rose-300/25 bg-white/8 p-3.5 text-left backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#E11D63]/25 text-xs font-bold text-rose-200"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                      </svg>
                    </span>
                    <h3 className="break-words text-sm font-bold text-white">{activeOrb.title}</h3>
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-200/80">
                    {copy.walkSteps[walkStep].badge}
                  </span>
                </div>
                <p className="mt-1.5 break-words text-xs leading-relaxed text-indigo-100/90">
                  {activeOrb.detail}
                </p>
                <p className="mt-2 text-[11px] text-indigo-200/65">
                  {copy.walkSteps[walkStep].caption}
                </p>
              </div>
            ) : null}

            {/* Horizontal Walk Navigation Controls */}
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={walkStep === 0}
                onClick={() => setWalkStep((prev) => (prev > 0 ? ((prev - 1) as 0 | 1 | 2) : prev))}
                className="min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-3.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copy.walkPrevStep}
              </button>

              {walkStep < 2 ? (
                <button
                  type="button"
                  onClick={() => setWalkStep((prev) => (prev < 2 ? ((prev + 1) as 0 | 1 | 2) : prev))}
                  className="min-h-[44px] rounded-xl px-4 text-xs font-bold text-white shadow-md transition hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  {copy.walkNextStep}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleJumpToAct('cake')}
                  className="min-h-[44px] rounded-xl border border-amber-300/45 bg-amber-400/20 px-4 text-xs font-bold text-amber-100 transition hover:bg-amber-400/30 active:scale-95"
                >
                  {copy.walkToCake}
                </button>
              )}
            </div>
          </section>

          {/* ACT 2B: Interactive 3-Candle Polka-Dot Frosted Birthday Cake Stage */}
          <section
            ref={cakeRef}
            id="act-cake"
            className="scroll-mt-20 rounded-[26px] border border-white/15 bg-gradient-to-b from-[#141A3F] via-[#1B1638] to-[#23102A] p-4 text-center shadow-2xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">
                {copy.cakeActLabel}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold ${
                  allCandlesOut
                    ? 'border border-amber-300/50 bg-amber-300/20 text-amber-100'
                    : 'border border-white/15 bg-white/10 text-rose-100'
                }`}
              >
                {copy.candlesLitStatus(candlesOutCount, 3)}
              </span>
            </div>

            <h2 className="mt-2 font-heading text-xl font-bold text-white sm:text-2xl">
              {copy.cakeHeading}
            </h2>
            <p className="mt-1 text-xs text-indigo-100/75">{copy.candleTapHint}</p>

            <div className="mt-3 rounded-2xl border border-white/10 bg-[#0A0E24]/75 px-3 py-4">
              <CelebrationCakeStage
                blownCandles={blownCandles}
                onToggleSingleCandle={handleToggleSingleCandle}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />

              {/* Dedicated 44px+ accessible candle toggles */}
              <div className="mt-2 grid grid-cols-3 gap-2">
                {blownCandles.map((isOut, idx) => (
                  <button
                    key={`candle-btn-${idx}`}
                    type="button"
                    onClick={() => handleToggleSingleCandle(idx)}
                    aria-pressed={isOut}
                    className={`min-h-[44px] rounded-xl border px-2 py-1.5 text-[11px] font-bold transition active:scale-95 ${
                      isOut
                        ? 'border-white/15 bg-white/8 text-indigo-200/80'
                        : 'border-amber-300/45 bg-amber-400/15 text-amber-100 hover:bg-amber-400/25'
                    }`}
                  >
                    {copy.candleButtonLabel(idx, isOut)}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleBlowAllCandles}
                className={`mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition active:scale-[0.98] ${
                  allCandlesOut
                    ? 'border border-amber-300/60 bg-amber-300/20 text-amber-100'
                    : 'text-white shadow-lg hover:brightness-110'
                }`}
                style={!allCandlesOut ? { backgroundColor: primaryColor } : undefined}
              >
                <span>{allCandlesOut ? copy.wishUnlocked : copy.cakePrompt}</span>
              </button>

              {allCandlesOut ? (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold text-amber-200">{copy.wishUnlockedMessage}</p>
                  <p className="text-[11px] text-indigo-200/70">{copy.relightHint}</p>
                </div>
              ) : null}
            </div>
          </section>

          {/* ACT 3: Chronicle Letter + Curved Vinyl Lounge + Adaptive Photo Gallery + Finale */}
          <section ref={sanctuaryRef} id="act-sanctuary" className="scroll-mt-20 space-y-4">
            {/* Handwritten Chronicle Letter */}
            <article className="relative rounded-[24px] border-2 border-[#FEF3C7]/65 bg-[#FFFDF9] p-5 text-left text-[#2B1B2E] shadow-2xl">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-2.5 right-6 h-5 w-16 rotate-2 rounded-xs bg-[#F59E0B]/65 shadow-xs"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded bg-[#9B1C2E] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
                  {copy.journalTag}
                </span>
                <span className="text-[11px] font-bold text-[#9B1C2E]">{copy.noteLabel}</span>
              </div>

              <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#2B1B2E]/55">
                {copy.letterActLabel}
              </p>

              <WordByWordFadeLine
                text={copy.letterIntro(data.receiverName)}
                active={skyLit}
                delayStepMs={70}
                className="mt-2 font-heading text-xl font-bold leading-snug text-[#2B1B2E]"
              />

              <p className="mt-3 break-words border-l-2 border-[#E11D63]/50 pl-3.5 text-sm leading-relaxed text-[#2B1B2E]/90">
                {pickLocalizedText(data.message, language)}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#2B1B2E]/10 pt-3">
                <p className="text-xs font-semibold text-[#2B1B2E]/75">
                  {copy.signedPrefix} <strong className="text-[#9B1C2E]">{data.senderName}</strong>
                </p>
                {relationLabel ? (
                  <span className="rounded-full border border-[#F59E0B]/40 bg-[#FEF3C7] px-2.5 py-0.5 text-[10px] font-bold text-[#92400E]">
                    {relationLabel}
                  </span>
                ) : null}
              </div>
            </article>

            {/* Vinyl Soundtrack Lounge */}
            <CurvedTrackSanctuary
              tracks={birthdayTracks}
              mood="birthday"
              accentColor="#E11D63"
              dark
              heading={copy.soundtrackHeading}
            />

            {/* Adaptive Keepsake Gallery — zero empty boxes when 0 photos */}
            {hasPhotos ? (
              <div>
                <p className="px-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/85">
                  {copy.memoriesLabel}
                </p>
                <OccasionAdaptiveGallery
                  photos={data.photos}
                  accentColor="#E11D63"
                  dark
                  captionPrefix={copy.memoryPrefix}
                />
              </div>
            ) : null}

            {/* Finale Action Controls */}
            <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
              <button
                type="button"
                onClick={triggerConfetti}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
                style={{ backgroundColor: primaryColor }}
              >
                {copy.launchConfetti}
              </button>

              <button
                type="button"
                onClick={handleReplay}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-[0.98]"
              >
                {getReplayLabel(language)}
              </button>
            </div>
          </section>

          <footer className="border-t border-white/10 pt-3 text-center text-[11px] font-medium text-indigo-200/75">
            {getWebzyFooterLabel(language)}
          </footer>
        </div>
      )}
    </div>
  );
}
