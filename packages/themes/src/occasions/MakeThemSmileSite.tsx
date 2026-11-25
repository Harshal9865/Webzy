'use client';

import React, { useId, useState } from 'react';
import {
  type CoreLanguageCode,
  type LanguageCode,
  type LocalizedText,
  pickLocalizedText,
  toCoreLanguageCode,
} from '@webzy/core';
import {
  OccasionArtworkBackdrop,
  OccasionCassettePlayer,
  OccasionChapterNav,
  OccasionFilmstripGallery,
  OccasionPhotoGallery,
  type OccasionSiteProps,
  getReplayLabel,
  getWebzyFooterLabel,
} from './shared/OccasionPrimitives';

type SmileChapterId = 'dossier' | 'open-when' | 'reel' | 'smile-jar';
type StatBadgeId = 'memories' | 'real-one' | 'vibe';

interface StatBadgeConfig {
  id: StatBadgeId;
  value: string;
  isInfinity?: boolean;
  label: string;
  microNote: string;
}

interface EnvelopeItem {
  title: LocalizedText;
  detail: LocalizedText;
}

interface SmileMicrositeCopy {
  previewBanner: string;
  dossierStamp: string;
  forLabel: string;
  fromLabel: string;
  openScrapbook: string;
  coverHint: string;
  marqueeItems: readonly string[];
  tabs: Record<SmileChapterId, string>;
  letterTag: string;
  letterHeading: string;
  signedBy: string;
  statSectionLabel: string;
  statTapHint: string;
  stats: readonly StatBadgeConfig[];
  openWhenHeading: string;
  openWhenSub: string;
  envelopesUnsealed: string;
  allUnsealed: string;
  tapToUnseal: string;
  tapToReseal: string;
  sealedLabel: string;
  unsealedLabel: string;
  reelHeading: string;
  reelCaption: string;
  frameLabels: [string, string, string];
  polaroidHeading: string;
  polaroidPrefix: string;
  jarHeading: string;
  jarSub: string;
  jarJarLabel: string;
  jarTapButton: string;
  jarCounterLabel: (count: number) => string;
  jarInitialTicket: string;
  jarTickets: readonly string[];
  cassetteHeading: string;
  cassetteTrackPrefix: string;
  cassetteTapLabel: string;
  cassettePlayingLabel: string;
  nextChapterLabel: string;
  keptFor: string;
}

const CHAPTER_ORDER: readonly SmileChapterId[] = [
  'dossier',
  'open-when',
  'reel',
  'smile-jar',
];

const DEFAULT_ENVELOPES: readonly EnvelopeItem[] = [
  {
    title: {
      en: 'Open when you need a reminder',
      hinglish: 'Open when khud par doubt aaye',
      hi: 'जब खुद पर भरोसा कम लगे, तब खोलें',
    },
    detail: {
      en: 'You carry more warmth, grit, and quiet magic into a room than you ever give yourself credit for. Do not shrink today.',
      hinglish: 'Tum jitni warmth aur strength har jagah laati ho, uska aadha bhi khud ko credit nahi deti. Aaj apna shine mat chhupana.',
      hi: 'आप जितनी गर्मजोशी और हिम्मत हर जगह लाती हैं, उसका पूरा श्रेय खुद को भी दीजिए। आज खुद पर गर्व कीजिए।',
    },
  },
  {
    title: {
      en: 'Open when a rough Tuesday hits',
      hinglish: 'Open when ek boring ya tough din ho',
      hi: 'जब कोई थकाने वाला दिन आए, तब खोलें',
    },
    detail: {
      en: 'Take one slow breath, put the kettle on, and leave the heavy stuff in our shared pocket for an hour. You never have to handle it alone.',
      hinglish: 'Ek gehri saans lo, garam chai banao, aur thodi der ke liye saari tension side rakh do. Tum kabhi akeli nahi ho.',
      hi: 'एक गहरी सांस लें, चाय का कप उठाएं और थोड़ी देर सारी चिंता भूल जाएं। आप कभी अकेली नहीं हैं।',
    },
  },
  {
    title: {
      en: 'Open when we are laughing at 2 AM',
      hinglish: 'Open when raat ke 2 baje hasi na ruke',
      hi: 'जब रात के 2 बजे बिना बात हँसी आए, तब खोलें',
    },
    detail: {
      en: 'Zero filter, absurd inside jokes, and the best kind of comfort. Saving this ticket for our next unplanned late-night catch-up.',
      hinglish: 'Zero filter, bekaar ke inside jokes, aur sabse sukoon bhari baatein. Agle late-night catch-up ka ticket abhi se pakka.',
      hi: 'बिना किसी दिखावे के बेफिक्र हँसी और सुकून भरी बातें। हमारी अगली देर रात की गपशप के लिए यह याद सहेजी है।',
    },
  },
];

const COPY: Record<CoreLanguageCode, SmileMicrositeCopy> = {
  en: {
    previewBanner: 'WEBZY FREE PREVIEW',
    dossierStamp: 'PERSONAL DOSSIER',
    forLabel: 'FOR',
    fromLabel: 'Archived by',
    openScrapbook: 'Open Scrapbook',
    coverHint: 'Pressed daisies, open-when letters & a pocket smile jar inside',
    marqueeItems: [
      'SAFE SPACE',
      'CHOSEN FAMILY',
      'SECRET KEEPER',
      'CONSTANT SUPPORT',
      'ZERO JUDGEMENT',
    ],
    tabs: {
      dossier: 'Bestie Files',
      'open-when': 'Open When',
      reel: 'Retro Reel',
      'smile-jar': 'Smile Jar',
    },
    letterTag: 'BESTIE FILES · VOL. 01',
    letterHeading: 'Field Notes For Your Good Days & Quiet Ones',
    signedBy: 'Always in your corner,',
    statSectionLabel: 'Dossier Index',
    statTapHint: 'Tap any stamp to read the note',
    stats: [
      {
        id: 'memories',
        value: 'INF',
        isInfinity: true,
        label: 'Memories',
        microNote: 'From random errands to late-night pep talks, every single minute still makes the highlight reel.',
      },
      {
        id: 'real-one',
        value: '100%',
        label: 'Real One',
        microNote: 'Zero pretending, honest check-ins, and the rare comfort of being completely understood.',
      },
      {
        id: 'vibe',
        value: '10/10',
        label: 'Vibe',
        microNote: 'Instant mood lift just by walking in or sending one unhinged voice note.',
      },
    ],
    openWhenHeading: 'Wax-Sealed Pocket Letters',
    openWhenSub: 'Tap any seal to flip open the parchment card',
    envelopesUnsealed: 'Unsealed',
    allUnsealed: 'All letters unsealed',
    tapToUnseal: 'Tap wax seal to open letter',
    tapToReseal: 'Tap to fold card back',
    sealedLabel: 'Sealed',
    unsealedLabel: 'Opened',
    reelHeading: '35mm Botanical Contact Sheet',
    reelCaption: 'BESTIE FILES · 35MM ARCHIVE',
    frameLabels: ['Frame 01', 'Frame 02', 'Frame 03'],
    polaroidHeading: 'Taped Polaroid Cutouts',
    polaroidPrefix: 'Snapshot',
    jarHeading: 'The Stay Smiling Jar',
    jarSub: 'Tap the jar to pull out a fresh paper ticket whenever you need a lift',
    jarJarLabel: 'STAY SMILING',
    jarTapButton: 'Pull a Smile Ticket',
    jarCounterLabel: (count) => `${count} ${count === 1 ? 'ticket' : 'tickets'} pulled`,
    jarInitialTicket: 'Tap the glass jar above to draw your first folded feel-good note.',
    jarTickets: [
      'You make ordinary Tuesdays feel noticeably softer just by being in them.',
      'Reminder: you have already survived 100% of the days you thought would break you.',
      'Hydrate, drop your shoulders away from your ears, and take credit for how far you have come.',
      'Someone out here is genuinely grateful that you exist exactly as you are.',
      'Good news is quietly queuing up behind the scenes with your name on it.',
      'Save a little energy for joy today — not everything needs to be solved before dinner.',
    ],
    cassetteHeading: 'Lo-Fi Chime Mixtape',
    cassetteTrackPrefix: 'Side A · Morning Daisy',
    cassetteTapLabel: 'Tap to Play Uplifting Chime',
    cassettePlayingLabel: 'Playing Uplifting Chime...',
    nextChapterLabel: 'Next Chapter',
    keptFor: 'Bestie Files Kept',
  },
  hinglish: {
    previewBanner: 'WEBZY FREE PREVIEW',
    dossierStamp: 'PERSONAL DOSSIER',
    forLabel: 'FOR',
    fromLabel: 'Sajaaya hai',
    openScrapbook: 'Scrapbook Kholo',
    coverHint: 'Andar open-when letters, 35mm reel aur ek Smile Jar rakha hai',
    marqueeItems: [
      'SAFE SPACE',
      'CHOSEN FAMILY',
      'SECRET KEEPER',
      'CONSTANT SUPPORT',
      'ZERO JUDGEMENT',
    ],
    tabs: {
      dossier: 'Bestie Files',
      'open-when': 'Open When',
      reel: 'Retro Reel',
      'smile-jar': 'Smile Jar',
    },
    letterTag: 'BESTIE FILES · VOL. 01',
    letterHeading: 'Har Din Ke Liye Ek Chhoti Si Yaad',
    signedBy: 'Hamesha tumhari side,',
    statSectionLabel: 'Dossier Stamps',
    statTapHint: 'Note padhne ke liye kisi bhi stamp par tap karo',
    stats: [
      {
        id: 'memories',
        value: 'INF',
        isInfinity: true,
        label: 'Memories',
        microNote: 'Chai ke breaks se lekar random walks tak, har ek moment abhi bhi top list mein hai.',
      },
      {
        id: 'real-one',
        value: '100%',
        label: 'Real One',
        microNote: 'Na koi dikhawa, na koi filter — bas bina bole samajh jaane wala sukoon.',
      },
      {
        id: 'vibe',
        value: '10/10',
        label: 'Vibe',
        microNote: 'Ek chhota sa voice note ya smile aur poora mood turant set ho jaata hai.',
      },
    ],
    openWhenHeading: 'Wax-Sealed Lifafe',
    openWhenSub: 'Card kholne ke liye seal par tap karein',
    envelopesUnsealed: 'Khule',
    allUnsealed: 'Saare lifafe khul gaye',
    tapToUnseal: 'Kholne ke liye wax seal tap karein',
    tapToReseal: 'Band karne ke liye tap karein',
    sealedLabel: 'Sealed',
    unsealedLabel: 'Open',
    reelHeading: '35mm Scrapbook Reel',
    reelCaption: 'BESTIE FILES · 35MM ARCHIVE',
    frameLabels: ['Frame 01', 'Frame 02', 'Frame 03'],
    polaroidHeading: 'Taped Polaroid Memories',
    polaroidPrefix: 'Yaad',
    jarHeading: 'Stay Smiling Jar',
    jarSub: 'Jab bhi mood light karna ho, jar par tap karke ek parchi nikaalo',
    jarJarLabel: 'STAY SMILING',
    jarTapButton: 'Ek Smile Parchi Nikaalo',
    jarCounterLabel: (count) => `${count} ${count === 1 ? 'parchi' : 'parchiyan'} khuli`,
    jarInitialTicket: 'Upar glass jar par tap karke apni pehli feel-good parchi nikaalo.',
    jarTickets: [
      'Tumhare aate hi sabse boring din bhi thoda zyada bright lagne lagta hai.',
      'Yaad rakhna: jitne mushkil din tumne cross kar liye, unke aage aaj kuch bhi nahi.',
      'Thoda paani piyo, shoulders relax karo, aur khud ko thodi shaabashi do.',
      'Duniya mein koi hai jo tumhare jaise hone ka dil se shukriya karta hai.',
      'Achhi khabar aur sukoon dono line mein hain — bas thoda sabr aur muskaan.',
      'Har cheez aaj hi solve karna zaroori nahi; thodi energy apni khushi ke liye bachaao.',
    ],
    cassetteHeading: 'Lo-Fi Cassette Mixtape',
    cassetteTrackPrefix: 'Side A · Morning Daisy',
    cassetteTapLabel: 'Play Uplifting Chime',
    cassettePlayingLabel: 'Chime Baj Raha Hai...',
    nextChapterLabel: 'Agla Chapter',
    keptFor: 'Bestie Files Surakshit',
  },
  hi: {
    previewBanner: 'WEBZY निःशुल्क पूर्वावलोकन',
    dossierStamp: 'निजी डॉसियर',
    forLabel: 'प्रेषित',
    fromLabel: 'संकलन',
    openScrapbook: 'स्क्रैपबुक खोलें',
    coverHint: 'अंदर खास पत्र, फ़ोटो रील और स्माइल जार सहेजा गया है',
    marqueeItems: [
      'सुकून का ठिकाना',
      'दिल का परिवार',
      'राज़ की साथी',
      'अटूट सहारा',
      'बिना किसी शर्त के',
    ],
    tabs: {
      dossier: 'बेस्टी फ़ाइल्स',
      'open-when': 'ओपन व्हेन',
      reel: 'फ़ोटो रील',
      'smile-jar': 'स्माइल जार',
    },
    letterTag: 'बेस्टी फ़ाइल्स · अंक 01',
    letterHeading: 'आपके अच्छे और शांत दिनों के लिए एक पत्र',
    signedBy: 'हमेशा आपके साथ,',
    statSectionLabel: 'डॉसियर मुहरें',
    statTapHint: 'नोट पढ़ने के लिए किसी भी मुहर पर टैप करें',
    stats: [
      {
        id: 'memories',
        value: 'INF',
        isInfinity: true,
        label: 'यादें',
        microNote: 'छोटी-छोटी चाय की मुलाकातों से लेकर देर रात की बातों तक, हर पल अनमोल है।',
      },
      {
        id: 'real-one',
        value: '100%',
        label: 'सच्चा साथ',
        microNote: 'न कोई दिखावा, न कोई औपचारिकता — बस बिना कहे समझ जाने वाला अपनापन।',
      },
      {
        id: 'vibe',
        value: '10/10',
        label: 'ऊर्जा',
        microNote: 'आपकी एक मुस्कान या छोटा सा संदेश पूरे दिन का मिज़ाज बदल देता है।',
      },
    ],
    openWhenHeading: 'मोहरबंद लिफ़ाफ़े',
    openWhenSub: 'पढ़ने के लिए किसी भी मोहर पर टैप करें',
    envelopesUnsealed: 'खुले',
    allUnsealed: 'सभी पत्र खुल गए',
    tapToUnseal: 'खोलने के लिए मुहर पर टैप करें',
    tapToReseal: 'वापस मोड़ने के लिए टैप करें',
    sealedLabel: 'सीलबंद',
    unsealedLabel: 'खुला हुआ',
    reelHeading: '35mm यादगार फ़ोटो रील',
    reelCaption: 'बेस्टी फ़ाइल्स · 35MM संग्रह',
    frameLabels: ['फ़्रेम 01', 'फ़्रेम 02', 'फ़्रेम 03'],
    polaroidHeading: 'पोलरॉइड झलकियाँ',
    polaroidPrefix: 'याद',
    jarHeading: 'मुस्कान का जार',
    jarSub: 'जब भी मन हल्का करना हो, जार पर टैप कर एक पर्ची निकालें',
    jarJarLabel: 'STAY SMILING',
    jarTapButton: 'मुस्कान की पर्ची निकालें',
    jarCounterLabel: (count) => `${count} पर्ची निकाली गईं`,
    jarInitialTicket: 'अपना पहला सकारात्मक संदेश पढ़ने के लिए ऊपर जार पर टैप करें।',
    jarTickets: [
      'आपकी मौजूदगी एक सामान्य दिन को भी बेहद खास और सहज बना देती है।',
      'याद रखें: आपने अब तक हर कठिन दिन को अपनी हिम्मत से पार किया है।',
      'थोड़ा पानी पिएं, गहरी सांस लें और अब तक के सफर पर खुद को शाबाशी दें।',
      'कोई यहाँ आपके जैसे होने के लिए दिल से आभारी है।',
      'अच्छी खबरें और सुकून धीरे-धीरे आपकी ओर बढ़ रहे हैं।',
      'हर बात आज ही सुलझाना ज़रूरी नहीं; थोड़ी ऊर्जा अपनी मुस्कान के लिए रखें।',
    ],
    cassetteHeading: 'लो-फ़ाई मधुर धुन',
    cassetteTrackPrefix: 'साइड A · सुबह की धुन',
    cassetteTapLabel: 'मधुर धुन सुनने के लिए टैप करें',
    cassettePlayingLabel: 'मधुर धुन बज रही है...',
    nextChapterLabel: 'अगला अध्याय',
    keptFor: 'बेस्टी फ़ाइल्स सुरक्षित',
  },
};

function PressedDaisySvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <g fill="#FBF7EE" stroke="#5B1D36" strokeOpacity="0.22" strokeWidth="1.2">
        <ellipse cx="32" cy="14" rx="5.5" ry="11" />
        <ellipse cx="32" cy="50" rx="5.5" ry="11" />
        <ellipse cx="14" cy="32" rx="11" ry="5.5" />
        <ellipse cx="50" cy="32" rx="11" ry="5.5" />
        <ellipse cx="19.3" cy="19.3" rx="5.2" ry="10.5" transform="rotate(-45 19.3 19.3)" />
        <ellipse cx="44.7" cy="44.7" rx="5.2" ry="10.5" transform="rotate(-45 44.7 44.7)" />
        <ellipse cx="44.7" cy="19.3" rx="5.2" ry="10.5" transform="rotate(45 44.7 19.3)" />
        <ellipse cx="19.3" cy="44.7" rx="5.2" ry="10.5" transform="rotate(45 19.3 44.7)" />
      </g>
      <circle cx="32" cy="32" r="8.5" fill="#F4C95D" stroke="#5B1D36" strokeOpacity="0.3" strokeWidth="1.2" />
      <circle cx="29.5" cy="29.5" r="1.4" fill="#5B1D36" fillOpacity="0.35" />
      <circle cx="34.5" cy="31" r="1.2" fill="#5B1D36" fillOpacity="0.35" />
      <circle cx="31.5" cy="34.5" r="1.2" fill="#5B1D36" fillOpacity="0.35" />
    </svg>
  );
}

function ScallopedPaperEdge({ fill = '#FBF7EE', flip = false }: { fill?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 360 14"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none block h-3 w-full shrink-0 ${flip ? 'rotate-180' : ''}`}
    >
      <path
        d="M0 14 V6 Q9 0 18 6 T36 6 T54 6 T72 6 T90 6 T108 6 T126 6 T144 6 T162 6 T180 6 T198 6 T216 6 T234 6 T252 6 T270 6 T288 6 T306 6 T324 6 T342 6 T360 6 V14 Z"
        fill={fill}
      />
    </svg>
  );
}

function BotanicalSprigSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className={className}>
      <path d="M16 82C32 62 52 38 78 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M32 64C23 58 21 47 26 40C35 43 39 54 32 64Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.2" />
      <path d="M41 56C51 58 61 52 64 42C54 39 44 46 41 56Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.2" />
      <path d="M54 41C46 35 45 25 51 18C59 22 61 32 54 41Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.2" />
      <path d="M64 31C73 31 82 26 85 17C76 15 67 21 64 31Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function BurgundyWaxSeal({
  unsealed = false,
  size = 'md',
}: {
  unsealed?: boolean;
  size?: 'lg' | 'md' | 'sm';
}) {
  const dims = size === 'lg' ? 'h-14 w-14' : size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const innerDims = size === 'lg' ? 'h-10 w-10' : size === 'sm' ? 'h-6 w-6' : 'h-7 w-7';
  const gradient = unsealed
    ? 'linear-gradient(135deg, #F6D365 0%, #D99B26 55%, #B47812 100%)'
    : 'linear-gradient(135deg, #7C284A 0%, #5B1D36 55%, #3F1124 100%)';

  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${dims}`}
      style={{
        background: gradient,
        boxShadow: unsealed
          ? 'inset 0 2px 3px rgba(255,255,255,0.45), inset 0 -2px 4px rgba(120,53,15,0.35), 0 4px 10px rgba(180,120,18,0.28)'
          : 'inset 0 2px 3px rgba(255,255,255,0.25), inset 0 -2px 5px rgba(25,5,14,0.55), 0 5px 12px rgba(91,29,54,0.32)',
      }}
    >
      <span className={`flex items-center justify-center rounded-full border border-white/35 ${innerDims}`}>
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-[#FBF7EE]">
          <path
            d="M10 15.5s-4.8-2.9-4.8-6.4A2.8 2.8 0 0 1 10 7.4a2.8 2.8 0 0 1 4.8 1.7c0 3.5-4.8 6.4-4.8 6.4Z"
            stroke="currentColor"
            strokeWidth="1.5"
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
    <div className="relative mx-auto flex h-44 w-40 items-center justify-center">
      <svg viewBox="0 0 160 176" className="h-full w-full drop-shadow-sm" fill="none" aria-hidden="true">
        {/* Soft aura behind jar */}
        <circle cx="80" cy="96" r="64" fill="#C5CE79" fillOpacity="0.28" />

        {/* Popping folded note flying out on tap */}
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
            fill="#F6D365"
            stroke="#5B1D36"
            strokeWidth="1.4"
          />
          <line x1="70" y1="17" x2="88" y2="14" stroke="#5B1D36" strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />
        </g>

        {/* Cork / Burgundy Jar Lid */}
        <rect x="50" y="28" width="60" height="14" rx="4" fill="#5B1D36" />
        <rect x="44" y="38" width="72" height="9" rx="4.5" fill="#7B2849" stroke="#3F1124" strokeWidth="1.2" />

        {/* Glass Mason Jar Body */}
        <path
          d="M46 47 H114 L122 64 V148 C122 156 116 162 108 162 H52 C44 162 38 156 38 148 V64 Z"
          fill="#FBF7EE"
          fillOpacity="0.88"
          stroke="#5B1D36"
          strokeWidth="2"
        />
        {/* Glass reflection */}
        <path d="M46 68 V142" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.7" />

        {/* Folded color tickets resting inside the jar */}
        <rect x="48" y="128" width="24" height="14" rx="3" transform="rotate(-10 48 128)" fill="#F4B8C4" stroke="#5B1D36" strokeWidth="1.1" />
        <rect x="74" y="132" width="26" height="14" rx="3" transform="rotate(8 74 132)" fill="#C5CE79" stroke="#5B1D36" strokeWidth="1.1" />
        <rect x="92" y="120" width="22" height="14" rx="3" transform="rotate(-16 92 120)" fill="#F6D365" stroke="#5B1D36" strokeWidth="1.1" />
        <rect x="58" y="114" width="25" height="14" rx="3" transform="rotate(14 58 114)" fill="#F6D365" stroke="#5B1D36" strokeWidth="1.1" />
        <rect x="82" y="106" width="24" height="14" rx="3" transform="rotate(-6 82 106)" fill="#F4B8C4" stroke="#5B1D36" strokeWidth="1.1" />

        {/* Kraft-Cream Stamped Center Label */}
        <rect x="45" y="72" width="70" height="36" rx="6" fill="#FBF7EE" stroke="#5B1D36" strokeWidth="1.5" />
        <rect x="49" y="76" width="62" height="28" rx="4" stroke="#5B1D36" strokeOpacity="0.35" strokeDasharray="2 2" strokeWidth="1" />
        <text
          x="80"
          y="90"
          textAnchor="middle"
          fill="#5B1D36"
          fontSize="8.5"
          fontWeight="800"
          letterSpacing="1.2"
        >
          {label}
        </text>
        <text
          x="80"
          y="100"
          textAnchor="middle"
          fill="#4E5A1E"
          fontSize="7"
          fontWeight="700"
        >
          {pullCount > 0 ? `#${String(pullCount).padStart(2, '0')}` : 'OPEN JAR'}
        </text>
      </svg>
    </div>
  );
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

/**
 * Multi-chapter botanical "Bestie Files / Feel-Good Scrapbook" keepsake microsite
 * for Webzy's `make-them-smile-01` theme.
 */
export function MakeThemSmileSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const [opened, setOpened] = useState(false);
  const [activeChapter, setActiveChapter] = useState<SmileChapterId>('dossier');
  const [activeStat, setActiveStat] = useState<StatBadgeId>('memories');
  const [unsealed, setUnsealed] = useState<number[]>([0]);
  const [jarCount, setJarCount] = useState(0);
  const [jarPopping, setJarPopping] = useState(false);
  const baseId = useId();

  const coreLang = toCoreLanguageCode(language);
  const copy = COPY[coreLang] ?? COPY.en;
  const themeName = pickLocalizedText(manifest.name, language);
  const signatureNote = pickLocalizedText(manifest.signatureMoment, language);
  const formattedDate = formatOptionalDate(data.revealAt, language);
  const musicLabel = manifest.music[0]?.label || 'Morning Guitar';

  const envelopes: EnvelopeItem[] = (() => {
    const custom = data.highlights ?? [];
    if (custom.length >= 3) return custom;
    const needed = 3 - custom.length;
    return [...custom, ...DEFAULT_ENVELOPES.slice(0, needed)];
  })();

  const unsealedCount = unsealed.filter((idx) => idx >= 0 && idx < envelopes.length).length;
  const allUnsealed = envelopes.length > 0 && unsealedCount === envelopes.length;
  const progressPercent = envelopes.length > 0 ? Math.round((unsealedCount / envelopes.length) * 100) : 0;

  const galleryPhotos =
    data.photos && data.photos.length > 0
      ? data.photos
      : ['/templates/occasions/make-them-smile/cover.jpg'];

  const chapterTabs = CHAPTER_ORDER.map((id) => ({
    id,
    label: copy.tabs[id],
  }));

  const activeStatConfig =
    copy.stats.find((item) => item.id === activeStat) ?? copy.stats[0];

  const activeJarTicket =
    jarCount === 0
      ? copy.jarInitialTicket
      : copy.jarTickets[(jarCount - 1) % copy.jarTickets.length];

  function handleOpenScrapbook() {
    setOpened(true);
    setActiveChapter('dossier');
    onOpened?.();
  }

  function handleReplay() {
    setOpened(false);
    setActiveChapter('dossier');
  }

  function toggleEnvelope(idx: number) {
    setUnsealed((prev) =>
      prev.includes(idx) ? prev.filter((item) => item !== idx) : [...prev, idx],
    );
  }

  function handlePullJarTicket() {
    setJarCount((prev) => prev + 1);
    setJarPopping(true);
    setTimeout(() => setJarPopping(false), 320);
  }

  function goNextChapter() {
    const idx = CHAPTER_ORDER.indexOf(activeChapter);
    const next = CHAPTER_ORDER[(idx + 1) % CHAPTER_ORDER.length];
    setActiveChapter(next);
  }

  const marqueeStrip = copy.marqueeItems.join(' · ');

  return (
    <div className="relative flex h-full min-h-full w-full flex-col justify-between overflow-x-hidden overflow-y-hidden rounded-[28px] bg-[#C5CE79] text-[#5B1D36]">
      <style>{`
        @keyframes mtsMarqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .mts-marquee-track {
          display: flex;
          width: max-content;
          animation: mtsMarqueeScroll 24s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .mts-marquee-track {
            animation: none;
          }
        }
      `}</style>

      {/* Full-bleed botanical scrapbook artwork backdrop + olive-cream glaze */}
      <OccasionArtworkBackdrop
        src="/templates/occasions/make-them-smile/cover.jpg"
        fallbackGradient="linear-gradient(155deg, #C5CE79 0%, #AEB95D 48%, #5B1D36 100%)"
        className="object-cover object-center opacity-45"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#C5CE79]/70 via-[#C5CE79]/60 to-[#5B1D36]/55"
      />

      {watermarked ? (
        <div
          aria-hidden="true"
          className="relative z-20 flex justify-center border-b border-[#FBF7EE]/20 bg-[#5B1D36] py-1.5 font-mono text-[10px] font-bold tracking-[0.16em] text-[#FBF7EE]"
        >
          {copy.previewBanner}
        </div>
      ) : null}

      {!opened ? (
        /* STAGE 1: SCRAPBOOK COVER GATE */
        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-8 animate-fade-in motion-reduce:animate-none">
          <div className="relative w-full overflow-hidden rounded-[26px] border-2 border-[#5B1D36]/20 bg-[#FBF7EE] shadow-[0_22px_48px_-16px_rgba(48,12,26,0.45)]">
            {/* Washi tape top accent */}
            <div
              aria-hidden="true"
              className="mx-auto mt-3 h-4 w-24 -rotate-1 rounded-xs bg-[#F4B8C4]/80 shadow-2xs"
            />

            <BotanicalSprigSvg className="pointer-events-none absolute -bottom-3 -left-3 h-24 w-24 text-[#4E5A1E]/25" />
            <PressedDaisySvg className="pointer-events-none absolute -right-2 top-5 h-16 w-16 rotate-12 opacity-90" />

            <div className="relative px-5 pb-6 pt-3 text-center sm:px-7">
              {/* Stamped Personal Dossier Header */}
              <div className="mx-auto inline-flex flex-col items-center rounded-xl border border-dashed border-[#5B1D36]/35 bg-[#FBF7EE] px-4 py-2 shadow-2xs">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#5B1D36]">
                  {copy.dossierStamp}
                </span>
                <span className="mt-1 rounded-full bg-[#C5CE79]/55 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#4E5A1E]">
                  {copy.forLabel} {data.receiverName}
                </span>
              </div>

              <div className="mt-4 flex justify-center">
                <BurgundyWaxSeal size="lg" />
              </div>

              <h2 className="mt-3.5 break-words font-heading text-3xl font-bold leading-tight text-[#5B1D36] sm:text-4xl">
                {data.receiverName}
              </h2>

              <p className="mt-1.5 text-xs font-semibold text-[#5B1D36]/80">
                {copy.fromLabel} <span className="font-bold text-[#5B1D36]">{data.senderName}</span>
                {data.relation ? ` · ${data.relation}` : ''}
              </p>

              <p className="mx-auto mt-2.5 max-w-xs break-words text-sm leading-relaxed text-[#5B1D36]/80">
                {signatureNote}
              </p>

              {formattedDate ? (
                <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#4E5A1E]">
                  {formattedDate}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleOpenScrapbook}
                className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#5B1D36] px-6 py-3 text-sm font-bold text-[#FBF7EE] shadow-[0_10px_22px_-8px_rgba(91,29,54,0.6)] ring-2 ring-[#F6D365]/60 transition hover:brightness-110 active:scale-[0.98] motion-reduce:transition-none"
              >
                <span>{copy.openScrapbook}</span>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 text-[#F6D365]">
                  <path
                    d="M4 10h12m-4.5-4.5L16 10l-4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <p className="mt-3 text-[11px] font-medium text-[#5B1D36]/65">
                {copy.coverHint}
              </p>
            </div>

            <ScallopedPaperEdge fill="#C5CE79" />
          </div>

          <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#FBF7EE]/90">
            {themeName}
          </p>
        </div>
      ) : (
        /* STAGE 2: 4-CHAPTER BESTIE FILES KEEPSAKE MICROSITE */
        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-between gap-3 px-3.5 pb-4 pt-3 sm:px-5 animate-fade-in motion-reduce:animate-none">
          <div className="space-y-2.5">
            {/* Top Bar: Dossier Pill + 44px+ Replay Trigger */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex min-h-[36px] min-w-0 items-center gap-1.5 rounded-full border border-[#5B1D36]/20 bg-[#FBF7EE]/95 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#5B1D36] shadow-2xs">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#C5CE79]" aria-hidden="true" />
                <span className="truncate">{copy.forLabel} {data.receiverName}</span>
              </span>

              <button
                type="button"
                onClick={handleReplay}
                className="inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-[#5B1D36]/25 bg-[#FBF7EE] px-4 text-xs font-bold text-[#5B1D36] shadow-2xs transition hover:bg-white active:scale-95 motion-reduce:transition-none"
              >
                {getReplayLabel(language)}
              </button>
            </div>

            {/* Always-Visible Horizontal Keyword Marquee Ticker (Pure CSS, No marquee tag) */}
            <div
              aria-label={marqueeStrip}
              className="overflow-hidden rounded-full border border-[#FBF7EE]/25 bg-[#5B1D36] py-1.5 text-[#FBF7EE] shadow-xs"
            >
              <div className="mts-marquee-track font-mono text-[10px] font-bold uppercase tracking-[0.18em]">
                <span className="shrink-0 pr-6">{marqueeStrip} ·</span>
                <span className="shrink-0 pr-6" aria-hidden="true">{marqueeStrip} ·</span>
              </div>
            </div>

            {/* 4-Chapter Navigation with guaranteed 44px+ touch targets */}
            <div className="[&_button]:min-h-[44px]">
              <OccasionChapterNav
                tabs={chapterTabs}
                activeId={activeChapter}
                onSelect={(id) => setActiveChapter(id as SmileChapterId)}
                accentColor="#5B1D36"
              />
            </div>
          </div>

          {/* CHAPTER 1: DOSSIER / BESTIE FILES */}
          {activeChapter === 'dossier' ? (
            <section
              aria-label={copy.tabs.dossier}
              className="flex flex-1 flex-col justify-between gap-3 animate-fade-in motion-reduce:animate-none"
            >
              {/* Scalloped Cream Letter Card */}
              <div className="relative overflow-hidden rounded-[22px] border border-[#5B1D36]/18 bg-[#FBF7EE] shadow-[0_14px_30px_-14px_rgba(48,12,26,0.35)]">
                <ScallopedPaperEdge fill="#C5CE79" flip />

                <PressedDaisySvg className="pointer-events-none absolute -right-2 top-3 h-14 w-14 opacity-80" />
                <BotanicalSprigSvg className="pointer-events-none absolute -bottom-2 -left-2 h-20 w-20 text-[#4E5A1E]/20" />

                <div className="relative px-4 pb-4 pt-2 sm:px-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-md bg-[#5B1D36] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#FBF7EE]">
                      {copy.letterTag}
                    </span>
                    {data.relation ? (
                      <span className="rounded-full border border-[#5B1D36]/20 bg-[#F4B8C4]/45 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#5B1D36]">
                        {data.relation}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#4E5A1E]">
                    {copy.letterHeading}
                  </p>

                  {/* Personal Greeting (data.headline) & Story (data.message) */}
                  <h1 className="mt-1 break-words font-heading text-xl font-bold leading-snug text-[#5B1D36] sm:text-2xl">
                    {pickLocalizedText(data.headline, language)}
                  </h1>

                  <p className="mt-2.5 break-words rounded-xl border-l-4 border-[#C5CE79] bg-[#F5EFE0]/70 px-3.5 py-3 text-sm leading-relaxed text-[#5B1D36]/95">
                    {pickLocalizedText(data.message, language)}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-[#5B1D36]/20 pt-2.5 text-xs">
                    <span className="text-[#5B1D36]/75">
                      {copy.signedBy}{' '}
                      <strong className="font-bold text-[#5B1D36]">{data.senderName}</strong>
                    </span>
                    {formattedDate ? (
                      <span className="font-mono text-[10px] font-bold text-[#4E5A1E]">
                        {formattedDate}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Interactive 3 Stat Badges */}
              <div className="rounded-[22px] border border-[#5B1D36]/18 bg-[#FBF7EE]/95 p-3.5 shadow-sm">
                <div className="flex items-center justify-between gap-2 px-0.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#5B1D36]">
                    {copy.statSectionLabel}
                  </span>
                  <span className="text-[11px] font-medium text-[#5B1D36]/70">
                    {copy.statTapHint}
                  </span>
                </div>

                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  {copy.stats.map((stat) => {
                    const isSelected = activeStat === stat.id;
                    return (
                      <button
                        key={stat.id}
                        type="button"
                        onClick={() => setActiveStat(stat.id)}
                        aria-pressed={isSelected}
                        className={`flex min-h-[60px] flex-col items-center justify-center rounded-2xl border px-2 py-2 text-center transition active:scale-95 motion-reduce:transition-none ${
                          isSelected
                            ? 'border-[#5B1D36] bg-[#5B1D36] text-[#FBF7EE] shadow-sm'
                            : 'border-[#5B1D36]/20 bg-[#FBF7EE] text-[#5B1D36] hover:bg-[#C5CE79]/25'
                        }`}
                      >
                        <span className="flex items-center justify-center font-heading text-lg font-extrabold leading-none">
                          {stat.isInfinity ? (
                            <svg
                              viewBox="0 0 28 16"
                              fill="none"
                              aria-label="Infinity"
                              className="h-5 w-7"
                            >
                              <path
                                d="M8.5 12.5c-2.6 0-4.5-1.9-4.5-4.5s1.9-4.5 4.5-4.5c2.9 0 4.8 3.2 5.5 4.5.7 1.3 2.6 4.5 5.5 4.5 2.6 0 4.5-1.9 4.5-4.5s-1.9-4.5-4.5-4.5c-2.9 0-4.8 3.2-5.5 4.5-.7 1.3-2.6 4.5-5.5 4.5Z"
                                stroke="currentColor"
                                strokeWidth="2.1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            stat.value
                          )}
                        </span>
                        <span
                          className={`mt-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] ${
                            isSelected ? 'text-[#F6D365]' : 'text-[#4E5A1E]'
                          }`}
                        >
                          {stat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div
                  role="status"
                  aria-live="polite"
                  className="mt-2.5 rounded-xl border border-dashed border-[#5B1D36]/25 bg-[#F4B8C4]/25 px-3 py-2.5 text-xs leading-relaxed text-[#5B1D36]"
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#5B1D36]">
                    {activeStatConfig.label}:{' '}
                  </span>
                  {activeStatConfig.microNote}
                </div>
              </div>

              <button
                type="button"
                onClick={goNextChapter}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#5B1D36] px-5 text-xs font-bold text-[#FBF7EE] shadow-sm transition hover:brightness-110 active:scale-[0.98]"
              >
                <span>
                  {copy.nextChapterLabel}: {copy.tabs['open-when']}
                </span>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 text-[#F6D365]">
                  <path d="M5 10h10m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </section>
          ) : null}

          {/* CHAPTER 2: OPEN WHEN ENVELOPES */}
          {activeChapter === 'open-when' ? (
            <section
              aria-label={copy.tabs['open-when']}
              className="flex flex-1 flex-col justify-between gap-3 animate-fade-in motion-reduce:animate-none"
            >
              <div className="space-y-2.5">
                <div className="rounded-2xl border border-[#5B1D36]/18 bg-[#FBF7EE] px-4 py-3 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="font-heading text-base font-bold text-[#5B1D36]">
                        {copy.openWhenHeading}
                      </h2>
                      <p className="text-[11px] text-[#5B1D36]/75">{copy.openWhenSub}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] ${
                        allUnsealed
                          ? 'bg-[#F6D365]/45 text-[#5B1D36] ring-1 ring-[#5B1D36]/25'
                          : 'bg-[#C5CE79]/50 text-[#4E5A1E]'
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
                    className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#C5CE79]/35"
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300 motion-reduce:transition-none"
                      style={{
                        width: `${progressPercent}%`,
                        background: 'linear-gradient(90deg, #5B1D36 0%, #B47812 100%)',
                      }}
                    />
                  </div>
                </div>

                {envelopes.map((card, idx) => {
                  const isOpen = unsealed.includes(idx);
                  const panelId = `${baseId}-open-when-${idx}`;
                  const indexTag = String(idx + 1).padStart(2, '0');

                  return (
                    <div
                      key={`${pickLocalizedText(card.title, 'en', 'env')}-${idx}`}
                      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 motion-reduce:transition-none ${
                        isOpen
                          ? 'border-[#5B1D36]/40 bg-[#FBF7EE] shadow-[0_12px_24px_-12px_rgba(91,29,54,0.35)]'
                          : 'border-[#5B1D36]/20 bg-[#F5EFE0] shadow-xs hover:border-[#5B1D36]/45'
                      }`}
                    >
                      {/* Envelope scored flap strip */}
                      <span
                        aria-hidden="true"
                        className={`block h-1.5 w-full transition-colors duration-300 ${
                          isOpen ? 'bg-[#F6D365]' : 'bg-[#5B1D36]'
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => toggleEnvelope(idx)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="flex min-h-[56px] w-full items-center justify-between gap-3 px-4 py-3 text-left transition active:scale-[0.99] motion-reduce:transition-none"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-[#4E5A1E]">
                              #{indexTag}
                            </span>
                            <span className="break-words font-heading text-sm font-bold text-[#5B1D36]">
                              {pickLocalizedText(card.title, language)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-[#5B1D36]/65">
                            {isOpen ? copy.tapToReseal : copy.tapToUnseal}
                          </p>
                        </div>

                        <span
                          className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-bold transition-colors ${
                            isOpen
                              ? 'border-[#B47812]/40 bg-[#F6D365]/25 text-[#5B1D36]'
                              : 'border-[#5B1D36]/20 bg-[#FBF7EE] text-[#5B1D36]'
                          }`}
                        >
                          <BurgundyWaxSeal unsealed={isOpen} size="sm" />
                          <span>{isOpen ? copy.unsealedLabel : copy.sealedLabel}</span>
                        </span>
                      </button>

                      {/* Smooth card reveal / flip-out parchment panel */}
                      <div
                        id={panelId}
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="relative border-t border-dashed border-[#5B1D36]/20 bg-[#FBF7EE] px-4 pb-4 pt-3">
                            <BotanicalSprigSvg className="pointer-events-none absolute -bottom-2 -right-2 h-14 w-14 text-[#4E5A1E]/20" />
                            <p className="relative break-words text-sm leading-relaxed text-[#5B1D36]/95">
                              {pickLocalizedText(card.detail, language)}
                            </p>
                            <p className="relative mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#4E5A1E]">
                              {copy.fromLabel}: {data.senderName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={goNextChapter}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#5B1D36] px-5 text-xs font-bold text-[#FBF7EE] shadow-sm transition hover:brightness-110 active:scale-[0.98]"
              >
                <span>
                  {copy.nextChapterLabel}: {copy.tabs.reel}
                </span>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 text-[#F6D365]">
                  <path d="M5 10h10m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </section>
          ) : null}

          {/* CHAPTER 3: RETRO REEL (35mm Filmstrip + Polaroid Gallery) */}
          {activeChapter === 'reel' ? (
            <section
              aria-label={copy.tabs.reel}
              className="flex flex-1 flex-col justify-between gap-3 rounded-[22px] border border-[#5B1D36]/18 bg-[#FBF7EE] p-4 shadow-lg animate-fade-in motion-reduce:animate-none"
            >
              <div className="space-y-4">
                <div>
                  <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#5B1D36]">
                    {copy.reelHeading}
                  </p>
                  <OccasionFilmstripGallery
                    photos={data.photos}
                    fallbackImage="/templates/occasions/make-them-smile/cover.jpg"
                    accentColor="#5B1D36"
                    caption={copy.reelCaption}
                    frameLabels={copy.frameLabels}
                  />
                </div>

                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#4E5A1E]">
                    {copy.polaroidHeading}
                  </p>
                  <OccasionPhotoGallery
                    photos={galleryPhotos}
                    accentColor="#5B1D36"
                    surfaceTint="#F5EFE0"
                    captionPrefix={copy.polaroidPrefix}
                    variant="polaroid"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={goNextChapter}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#5B1D36] px-5 text-xs font-bold text-[#FBF7EE] shadow-sm transition hover:brightness-110 active:scale-[0.98]"
              >
                <span>
                  {copy.nextChapterLabel}: {copy.tabs['smile-jar']}
                </span>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 text-[#F6D365]">
                  <path d="M5 10h10m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </section>
          ) : null}

          {/* CHAPTER 4: SMILE JAR & LO-FI */}
          {activeChapter === 'smile-jar' ? (
            <section
              aria-label={copy.tabs['smile-jar']}
              className="flex flex-1 flex-col justify-between gap-3 animate-fade-in motion-reduce:animate-none"
            >
              <div className="rounded-[22px] border border-[#5B1D36]/18 bg-[#FBF7EE] p-4 text-center shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#5B1D36]">
                    {copy.jarHeading}
                  </span>
                  <span className="rounded-full bg-[#C5CE79]/55 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#4E5A1E]">
                    {copy.jarCounterLabel(jarCount)}
                  </span>
                </div>

                <p className="mt-1 text-left text-xs text-[#5B1D36]/75">
                  {copy.jarSub}
                </p>

                <button
                  type="button"
                  onClick={handlePullJarTicket}
                  aria-label={copy.jarTapButton}
                  className="mt-2 inline-flex min-h-[44px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#5B1D36]/20 bg-[#F5EFE0]/60 py-2 transition hover:bg-[#C5CE79]/20 active:scale-[0.99]"
                >
                  <SmileJarIllustration
                    label={copy.jarJarLabel}
                    pullCount={jarCount}
                    isPopping={jarPopping}
                  />
                </button>

                {/* Popped Uplifting Affirmation Ticket */}
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-3 rounded-xl border-2 border-dashed border-[#5B1D36]/30 bg-[#F6D365]/30 px-3.5 py-3 text-sm font-medium leading-relaxed text-[#5B1D36]"
                >
                  {activeJarTicket}
                </div>

                <button
                  type="button"
                  onClick={handlePullJarTicket}
                  className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#5B1D36] px-5 py-2.5 text-xs font-bold text-[#FBF7EE] shadow-sm transition hover:brightness-110 active:scale-[0.98]"
                >
                  <span>{copy.jarTapButton}</span>
                </button>
              </div>

              <div className="rounded-[22px] border border-[#5B1D36]/18 bg-[#FBF7EE] p-3.5 shadow-sm">
                <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#5B1D36]">
                  {copy.cassetteHeading}
                </p>
                <OccasionCassettePlayer
                  trackTitle={`${copy.cassetteTrackPrefix} · ${musicLabel}`}
                  mood="uplifting"
                  tapLabel={copy.cassetteTapLabel}
                  playingLabel={copy.cassettePlayingLabel}
                  accentColor="#5B1D36"
                />
              </div>
            </section>
          ) : null}

          <footer className="border-t border-[#FBF7EE]/30 pt-2.5 text-center text-[11px] text-[#FBF7EE]">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#FBF7EE]/90">
              {copy.keptFor} · {data.senderName} · {data.receiverName}
            </p>
            <p className="mt-0.5 font-medium text-[#FBF7EE]/85">
              {getWebzyFooterLabel(language)}
            </p>
          </footer>
        </div>
      )}
    </div>
  );
}
