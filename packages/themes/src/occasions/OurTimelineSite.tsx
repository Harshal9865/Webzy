'use client';

import React, { useCallback, useId, useMemo, useRef, useState } from 'react';
import { type CoreLanguageCode, pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import { getWebzyFooterLabel, type OccasionSiteProps } from './shared/OccasionPrimitives';

interface ScrapbookCopy {
  previewBanner: string;
  rollTag: string;
  tapToFlip: string;
  tapToPhoto: string;
  ticketHeader: string;
  ticketAdmit: string;
  ticketClass: string;
  filmStripLabel: string;
  prevFrameLabel: string;
  nextFrameLabel: string;
  letterEyebrow: string;
  signedPrefix: string;
  pressFlowerCta: string;
  pressAnotherCta: string;
  pressedBadge: (count: number) => string;
  curatedFrames: ReadonlyArray<{
    dateStamp: string;
    quartzStamp: string;
    title: string;
    note: string;
    ticketStop: string;
  }>;
}

const SCRAPBOOK_COPY: Record<CoreLanguageCode, ScrapbookCopy> = {
  en: {
    previewBanner: 'WEBZY FREE PREVIEW',
    rollTag: '35MM · GOLDEN HOUR ROLL',
    tapToFlip: 'Tap polaroid to read back',
    tapToPhoto: 'Tap to return to photo',
    ticketHeader: 'MEMORY EXPRESS · KEEPSAKE',
    ticketAdmit: 'ADMIT TWO',
    ticketClass: 'WINDOW SEAT',
    filmStripLabel: '35mm memory film strip',
    prevFrameLabel: 'Previous memory frame',
    nextFrameLabel: 'Next memory frame',
    letterEyebrow: 'ARCHIVAL NOTE',
    signedPrefix: 'Always yours,',
    pressFlowerCta: 'Press a Flower',
    pressAnotherCta: 'Press Another Petal',
    pressedBadge: (count) => `${count} Pressed`,
    curatedFrames: [
      {
        dateStamp: 'OCT · GOLDEN HOUR',
        quartzStamp: "'24 10 14",
        title: 'Sunlit Meadow Walk',
        note: 'Warm light through the tall grass and nowhere we needed to hurry.',
        ticketStop: 'MEADOW LANE',
      },
      {
        dateStamp: 'NOV · MORNING CHAI',
        quartzStamp: "'24 11 03",
        title: 'Two Cups by the Window',
        note: 'Quiet conversation while the morning sun warmed the wooden table.',
        ticketStop: 'CORNER CAFE',
      },
      {
        dateStamp: 'DEC · COASTAL DRIFT',
        quartzStamp: "'24 12 21",
        title: 'Salt Air & Amber Sky',
        note: 'Footprints washed away by the tide, laughter kept in film grain.',
        ticketStop: 'SUNSET PIER',
      },
      {
        dateStamp: 'JAN · SCENIC ROUTE',
        quartzStamp: "'25 01 18",
        title: 'The Slow Train Home',
        note: 'Watching misty hills roll past the glass, sharing one pair of earphones.',
        ticketStop: 'HIGHLAND PASS',
      },
      {
        dateStamp: 'FEB · STARLIT NIGHT',
        quartzStamp: "'25 02 12",
        title: 'Under Quiet Skies',
        note: 'Every ordinary evening somehow turned into our favorite place to be.',
        ticketStop: 'MIDNIGHT VIEW',
      },
    ],
  },
  hinglish: {
    previewBanner: 'WEBZY FREE PREVIEW',
    rollTag: '35MM · SUNAHRI YAADEIN',
    tapToFlip: 'Note padhne ke liye tap karein',
    tapToPhoto: 'Photo dekhne ke liye tap karein',
    ticketHeader: 'MEMORY EXPRESS · KEEPSAKE',
    ticketAdmit: 'ADMIT TWO',
    ticketClass: 'WINDOW SEAT',
    filmStripLabel: '35mm yaadon ki film strip',
    prevFrameLabel: 'Pichhli yaad',
    nextFrameLabel: 'Agli yaad',
    letterEyebrow: 'DIL SE NOTE',
    signedPrefix: 'Pyaar ke saath,',
    pressFlowerCta: 'Phool Sajaayein',
    pressAnotherCta: 'Aur Pankhudiyaan',
    pressedBadge: (count) => `${count} Phool`,
    curatedFrames: [
      {
        dateStamp: 'OCT · SHAAM KI DHOOP',
        quartzStamp: "'24 10 14",
        title: 'Dhoop Bhari Shaam',
        note: 'Halki hawa, sunahri roshni aur bina kisi jaldi ke saath chalna.',
        ticketStop: 'MEADOW LANE',
      },
      {
        dateStamp: 'NOV · SUBAH KI CHAI',
        quartzStamp: "'24 11 03",
        title: 'Khidki Ke Paas Do Cup',
        note: 'Meethi baatein aur table par girti subah ki narm dhoop.',
        ticketStop: 'CORNER CAFE',
      },
      {
        dateStamp: 'DEC · SAMANDAR KINARE',
        quartzStamp: "'24 12 21",
        title: 'Lehrein Aur Amber Aasmaan',
        note: 'Ret par kadmon ke nishaan aur film roll mein qaid hamari hansi.',
        ticketStop: 'SUNSET PIER',
      },
      {
        dateStamp: 'JAN · LAMBA SAFAR',
        quartzStamp: "'25 01 18",
        title: 'Khidki Wali Seat',
        note: 'Pahaadon se guzarti train aur ek hi playlist par do muskaan.',
        ticketStop: 'HIGHLAND PASS',
      },
      {
        dateStamp: 'FEB · TAARON BHARAI RAAT',
        quartzStamp: "'25 02 12",
        title: 'Sukoon Bhari Raat',
        note: 'Har mamooli din tumhare saath sabse khaas yaad ban gaya.',
        ticketStop: 'MIDNIGHT VIEW',
      },
    ],
  },
  hi: {
    previewBanner: 'WEBZY FREE PREVIEW',
    rollTag: '35MM · सुनहरी यादें',
    tapToFlip: 'पीछे लिखा नोट पढ़ने के लिए टैप करें',
    tapToPhoto: 'तस्वीर देखने के लिए टैप करें',
    ticketHeader: 'यादों की रेल · स्मृति टिकट',
    ticketAdmit: 'दो यात्री',
    ticketClass: 'खिड़की की सीट',
    filmStripLabel: '35mm यादों की फिल्म पट्टी',
    prevFrameLabel: 'पिछली तस्वीर',
    nextFrameLabel: 'अगली तस्वीर',
    letterEyebrow: 'सहेजा हुआ पत्र',
    signedPrefix: 'स्नेह सहित,',
    pressFlowerCta: 'फूल सहेजें',
    pressAnotherCta: 'एक और फूल सहेजें',
    pressedBadge: (count) => `${count} फूल सहेजे`,
    curatedFrames: [
      {
        dateStamp: 'अक्टूबर · सुनहरी शाम',
        quartzStamp: "'24 10 14",
        title: 'धूप में सजी शाम',
        note: 'नरम रोशनी, मीठी हवा और बिना किसी जल्दी के साथ बिताए पल।',
        ticketStop: 'फूलों की राह',
      },
      {
        dateStamp: 'नवंबर · सुबह की चाय',
        quartzStamp: "'24 11 03",
        title: 'खिड़की के पास दो प्याले',
        note: 'सुबह की गुनगुनी धूप और अनकही मुस्कुराहटों का सुकून।',
        ticketStop: 'कोने का कैफ़े',
      },
      {
        dateStamp: 'दिसंबर · सागर किनारा',
        quartzStamp: "'24 12 21",
        title: 'लहरें और सुनहरा आकाश',
        note: 'रेत पर छूटे निशान और फिल्म के पन्नों में कैद हमारी हँसी।',
        ticketStop: 'सूर्यास्त घाट',
      },
      {
        dateStamp: 'जनवरी · पहाड़ी सफ़र',
        quartzStamp: "'25 01 18",
        title: 'धीमी रेल और वादियों का रास्ता',
        note: 'शीशे के पार गुज़रती धुंधली पहाड़ियाँ और एक ही धुन में खोया मन।',
        ticketStop: 'पहाड़ी पड़ाव',
      },
      {
        dateStamp: 'फ़रवरी · तारों भरी रात',
        quartzStamp: "'25 02 12",
        title: 'शांत आकाश के नीचे',
        note: 'तुम्हारे साथ हर साधारण शाम हमारी सबसे प्यारी जगह बन गई।',
        ticketStop: 'रात्रि पड़ाव',
      },
    ],
  },
};

const CURATED_FALLBACK_PHOTOS: ReadonlyArray<{ src: string; gradient: string }> = [
  {
    src: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=80',
    gradient: 'linear-gradient(135deg, #F3D9B1 0%, #D99B66 52%, #8F5B3C 100%)',
  },
  {
    src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    gradient: 'linear-gradient(135deg, #E8C7A0 0%, #B8845A 55%, #6A4832 100%)',
  },
  {
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    gradient: 'linear-gradient(135deg, #F7D3A2 0%, #DF9A78 50%, #6D7D8C 100%)',
  },
  {
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=80',
    gradient: 'linear-gradient(135deg, #D5DFC8 0%, #8FA382 52%, #475845 100%)',
  },
  {
    src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
    gradient: 'linear-gradient(135deg, #D9B69E 0%, #6D5D7B 54%, #2B2436 100%)',
  },
];

const SUNBEAM_MOTES = [
  { left: '12%', top: '14%', size: 6, delay: '0s', duration: '9s' },
  { left: '28%', top: '34%', size: 4, delay: '1.6s', duration: '11s' },
  { left: '46%', top: '10%', size: 5, delay: '3.1s', duration: '10s' },
  { left: '68%', top: '22%', size: 7, delay: '0.8s', duration: '12s' },
  { left: '84%', top: '42%', size: 5, delay: '2.4s', duration: '9.5s' },
  { left: '20%', top: '66%', size: 4, delay: '4.0s', duration: '11.5s' },
  { left: '74%', top: '74%', size: 6, delay: '1.2s', duration: '10.5s' },
  { left: '52%', top: '54%', size: 4, delay: '3.6s', duration: '12.5s' },
] as const;

const SCATTER_PETALS = [
  { left: '10%', delay: '0ms', duration: '2400ms', size: 15, color: '#D98A82', drift: '-22px', rot: '-35deg' },
  { left: '22%', delay: '140ms', duration: '2700ms', size: 13, color: '#EAB354', drift: '18px', rot: '42deg' },
  { left: '36%', delay: '60ms', duration: '2500ms', size: 16, color: '#A992C2', drift: '-14px', rot: '-24deg' },
  { left: '50%', delay: '210ms', duration: '2800ms', size: 14, color: '#C96F69', drift: '20px', rot: '50deg' },
  { left: '64%', delay: '110ms', duration: '2450ms', size: 15, color: '#8AA07E', drift: '-18px', rot: '-40deg' },
  { left: '78%', delay: '260ms', duration: '2650ms', size: 13, color: '#F2C572', drift: '14px', rot: '30deg' },
  { left: '88%', delay: '80ms', duration: '2550ms', size: 14, color: '#D98A82', drift: '-16px', rot: '-28deg' },
] as const;

const SPROCKET_COUNT = 12;

interface ScrapbookFrame {
  id: string;
  frameCode: string;
  photoSrc: string;
  fallbackGradient: string;
  dateStamp: string;
  quartzStamp: string;
  title: string;
  note: string;
  ticketStop: string;
  tiltDeg: number;
}

function splitMilestoneTitle(
  rawTitle: string,
  fallbackDate: string,
): { dateStamp: string; title: string } {
  const trimmed = rawTitle.trim();
  const separatorMatch = trimmed.match(/^([^·•|]+?)\s*[·•|]\s*(.+)$/);
  if (separatorMatch) {
    return {
      dateStamp: separatorMatch[1].trim(),
      title: separatorMatch[2].trim(),
    };
  }
  return {
    dateStamp: fallbackDate,
    title: trimmed,
  };
}

/** Pressed Lavender Sprig SVG */
function PressedLavenderSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 150" fill="none" aria-hidden="true" className={className}>
      <path d="M32 146C31 112 31 74 33 24" stroke="#6E8568" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M32 114C24 106 18 100 16 92" stroke="#6E8568" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M32 104C40 96 45 90 47 83" stroke="#6E8568" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="33" cy="18" rx="4.5" ry="7.5" fill="#9A85B0" fillOpacity="0.82" />
      <ellipse cx="26" cy="30" rx="4.2" ry="6.5" transform="rotate(-18 26 30)" fill="#B19BC8" fillOpacity="0.85" />
      <ellipse cx="39" cy="31" rx="4.2" ry="6.5" transform="rotate(18 39 31)" fill="#8B75A3" fillOpacity="0.82" />
      <ellipse cx="25" cy="45" rx="4.5" ry="6.8" transform="rotate(-22 25 45)" fill="#9A85B0" fillOpacity="0.82" />
      <ellipse cx="40" cy="46" rx="4.5" ry="6.8" transform="rotate(20 40 46)" fill="#B19BC8" fillOpacity="0.85" />
      <ellipse cx="26" cy="60" rx="4.2" ry="6.2" transform="rotate(-16 26 60)" fill="#8B75A3" fillOpacity="0.78" />
      <ellipse cx="39" cy="61" rx="4.2" ry="6.2" transform="rotate(16 39 61)" fill="#9A85B0" fillOpacity="0.8" />
      <ellipse cx="28" cy="74" rx="3.6" ry="5.4" transform="rotate(-12 28 74)" fill="#B19BC8" fillOpacity="0.72" />
      <ellipse cx="37" cy="75" rx="3.6" ry="5.4" transform="rotate(12 37 75)" fill="#8B75A3" fillOpacity="0.72" />
    </svg>
  );
}

/** Pressed Fern Frond SVG */
function PressedFernSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 76 160" fill="none" aria-hidden="true" className={className}>
      <path d="M38 156C36 112 38 68 42 12" stroke="#587053" strokeWidth="1.5" strokeLinecap="round" />
      {[
        { y: 126, w: 22 },
        { y: 108, w: 25 },
        { y: 90, w: 24 },
        { y: 72, w: 21 },
        { y: 54, w: 17 },
        { y: 36, w: 13 },
        { y: 22, w: 8 },
      ].map((leaf, idx) => (
        <g key={idx}>
          <path
            d={`M38 ${leaf.y}C${38 - leaf.w * 0.55} ${leaf.y - 6} ${38 - leaf.w} ${leaf.y - 12} ${38 - leaf.w - 3} ${leaf.y - 15}C${38 - leaf.w * 0.65} ${leaf.y - 2} ${38 - leaf.w * 0.25} ${leaf.y + 1} 38 ${leaf.y}Z`}
            fill="#6E8568"
            fillOpacity="0.72"
          />
          <path
            d={`M39 ${leaf.y - 4}C${39 + leaf.w * 0.55} ${leaf.y - 10} ${39 + leaf.w} ${leaf.y - 15} ${39 + leaf.w + 3} ${leaf.y - 18}C${39 + leaf.w * 0.65} ${leaf.y - 5} ${39 + leaf.w * 0.25} ${leaf.y - 2} 39 ${leaf.y - 4}Z`}
            fill="#587053"
            fillOpacity="0.68"
          />
        </g>
      ))}
    </svg>
  );
}

/** Pressed Chamomile Sprig SVG */
function PressedChamomileSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 130" fill="none" aria-hidden="true" className={className}>
      <path d="M40 126C38 96 42 74 36 42" stroke="#6E8568" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M39 94C49 85 56 76 60 66" stroke="#6E8568" strokeWidth="1.2" strokeLinecap="round" />
      {/* Main chamomile bloom */}
      <g transform="translate(36 38)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-12"
            rx="3.8"
            ry="8.5"
            transform={`rotate(${deg})`}
            fill="#FFFDF8"
            stroke="#D6C7B2"
            strokeWidth="0.7"
          />
        ))}
        <circle cx="0" cy="0" r="6" fill="#EAB354" />
        <circle cx="-1.5" cy="-1.5" r="2" fill="#F8D88A" />
      </g>
      {/* Secondary bud */}
      <g transform="translate(60 64) scale(0.65)">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-10"
            rx="3.6"
            ry="7.5"
            transform={`rotate(${deg})`}
            fill="#FFFDF8"
            stroke="#D6C7B2"
            strokeWidth="0.8"
          />
        ))}
        <circle cx="0" cy="0" r="5" fill="#EAB354" />
      </g>
    </svg>
  );
}

/** Pressed Rose Sprig SVG */
function PressedRoseSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 74 132" fill="none" aria-hidden="true" className={className}>
      <path d="M38 128C39 98 35 70 37 36" stroke="#5E7358" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M37 86C26 82 19 75 16 68C25 69 32 74 37 86Z" fill="#6E8568" fillOpacity="0.75" />
      <path d="M37 74C48 70 55 63 58 56C49 57 42 62 37 74Z" fill="#587053" fillOpacity="0.7" />
      <g transform="translate(37 32)">
        <circle cx="-7" cy="2" r="10" fill="#D5837D" fillOpacity="0.78" />
        <circle cx="7" cy="2" r="10" fill="#C76D67" fillOpacity="0.82" />
        <circle cx="0" cy="-6" r="10.5" fill="#DF958E" fillOpacity="0.88" />
        <circle cx="0" cy="1" r="7.5" fill="#B85A56" fillOpacity="0.88" />
        <path
          d="M-3 1C-3 -2 2 -3 3 0C4 3 -2 5 -4 2"
          stroke="#FBEAE7"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/** Cute Minimalist Peeking Cat Doodle Sticker SVG */
function PeekingCatStickerSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 84 62" fill="none" aria-hidden="true" className={className}>
      {/* White die-cut sticker halo */}
      <path
        d="M14 54C13 38 16 26 20 12L31 21C38 19 46 19 53 21L64 12C68 26 71 38 70 54H14Z"
        fill="#FFFDF9"
        stroke="#FFFDF9"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* Cat head */}
      <path
        d="M17 53C17 38 19 27 22 15L32 23C38 21 46 21 52 23L62 15C65 27 67 38 67 53H17Z"
        fill="#FAF2E4"
        stroke="#3A2D25"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      {/* Inner pink ears */}
      <path d="M24 23L25 19L29 22.5Z" fill="#E3A19C" />
      <path d="M60 23L59 19L55 22.5Z" fill="#E3A19C" />
      {/* Forehead tabby stripes */}
      <path d="M39 22V27M42 21.5V28M45 22V27" stroke="#A68B78" strokeWidth="1.5" strokeLinecap="round" />
      {/* Eyes */}
      <circle cx="33" cy="36" r="2.5" fill="#2E241E" />
      <circle cx="51" cy="36" r="2.5" fill="#2E241E" />
      <circle cx="33.8" cy="35.1" r="0.8" fill="#FFFDF9" />
      <circle cx="51.8" cy="35.1" r="0.8" fill="#FFFDF9" />
      {/* Blush */}
      <ellipse cx="26.5" cy="40.5" rx="3.4" ry="1.8" fill="#E6A49C" fillOpacity="0.65" />
      <ellipse cx="57.5" cy="40.5" rx="3.4" ry="1.8" fill="#E6A49C" fillOpacity="0.65" />
      {/* Nose & smile */}
      <path d="M40.5 39.5L42 41L43.5 39.5Z" fill="#D5837D" />
      <path d="M38.5 42.5C39.8 44 41.3 43.5 42 42C42.7 43.5 44.2 44 45.5 42.5" stroke="#3A2D25" strokeWidth="1.5" strokeLinecap="round" />
      {/* Whiskers */}
      <path d="M12 36L21 37.5M12 41L21 40.5M63 37.5L72 36M63 40.5L72 41" stroke="#3A2D25" strokeWidth="1.3" strokeLinecap="round" />
      {/* Tiny paws resting on Polaroid edge */}
      <ellipse cx="26" cy="53" rx="6.5" ry="4.2" fill="#FFFDF9" stroke="#3A2D25" strokeWidth="1.9" />
      <ellipse cx="58" cy="53" rx="6.5" ry="4.2" fill="#FFFDF9" stroke="#3A2D25" strokeWidth="1.9" />
    </svg>
  );
}

/** Cute Minimalist Sleeping Curled Cat Doodle Sticker SVG */
function SleepingCatStickerSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 64" fill="none" aria-hidden="true" className={className}>
      {/* Sticker backing */}
      <path
        d="M15 48C13 33 24 22 44 22C64 22 77 31 79 44C80 51 72 56 58 56H28C19 56 15.8 52.5 15 48Z"
        fill="#FFFDF9"
        stroke="#FFFDF9"
        strokeWidth="6"
      />
      {/* Curled body */}
      <path
        d="M18 47C17 34 27 25 45 25C62 25 75 33 76 44C77 50 70 54 57 54H30C22 54 18.5 51 18 47Z"
        fill="#F4E7D3"
        stroke="#3A2D25"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Ears on left side */}
      <path d="M24 31L22 22L31 27" fill="#F4E7D3" stroke="#3A2D25" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M35 26L41 19L44 26" fill="#F4E7D3" stroke="#3A2D25" strokeWidth="1.9" strokeLinejoin="round" />
      {/* Closed sleepy eyes */}
      <path d="M26 39C28 41 31 41 33 39" stroke="#3A2D25" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M38 38C40 40 43 40 45 38" stroke="#3A2D25" strokeWidth="1.7" strokeLinecap="round" />
      {/* Blush */}
      <ellipse cx="24.5" cy="42.5" rx="2.8" ry="1.5" fill="#E3A19C" fillOpacity="0.65" />
      <ellipse cx="46.5" cy="41.5" rx="2.8" ry="1.5" fill="#E3A19C" fillOpacity="0.65" />
      {/* Wrapped tail */}
      <path
        d="M68 48C74 49 79 45 81 39C82.5 34.5 79.5 31 76 32"
        stroke="#3A2D25"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      {/* Gentle ink zzz marks */}
      <path d="M55 15H61L55 21H61" stroke="#8F6E58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M66 9H71L66 14H71" stroke="#8F6E58" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
    </svg>
  );
}

/** Pressed Petal SVG for Scatter Animation & Button */
function PressedPetalSvg({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2C16.5 5.4 19 10 17.5 15.2C16.4 19 14.2 21 12 22C9.8 21 7.6 19 6.5 15.2C5 10 7.5 5.4 12 2Z"
        fill={color}
        fillOpacity="0.88"
      />
      <path d="M12 4.5V19.5" stroke="#FFFDF9" strokeOpacity="0.45" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Analog 35mm Film-Strip & Pressed-Flower Travel/Memory Scrapbook ("Our Timeline").
 * Features animated sunlit meadow & pressed-flower paper texture, an interactive 35mm
 * celluloid film-strip scrubber, a 3D flippable polaroid memory card with washi tape,
 * peeking/sleeping cat doodle stickers, a vintage keepsake ticket stub, and a minimal
 * love-letter footer with an interactive "Press a Flower" petal scatter.
 */
export function OurTimelineSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const uid = useId().replace(/:/g, '');
  const [activeIdx, setActiveIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [failedPhotos, setFailedPhotos] = useState<Record<string, boolean>>({});
  const [pressedCount, setPressedCount] = useState(0);
  const openedNotifiedRef = useRef(false);

  const coreLang = toCoreLanguageCode(language);
  const isDevanagari = coreLang === 'hi';
  const copy = SCRAPBOOK_COPY[coreLang] ?? SCRAPBOOK_COPY.en;

  const themeLabel = pickLocalizedText(manifest.name, language);
  const headlineText = pickLocalizedText(data.headline, language);
  const messageText = pickLocalizedText(data.message, language);

  const notifyOpenedOnce = useCallback(() => {
    if (!openedNotifiedRef.current) {
      openedNotifiedRef.current = true;
      onOpened?.();
    }
  }, [onOpened]);

  const frames = useMemo<ScrapbookFrame[]>(() => {
    const userPhotos = (data.photos ?? []).filter((src) => Boolean(src && src.trim()));
    const userHighlights = data.highlights ?? [];
    const totalCount = Math.max(5, Math.min(6, Math.max(userPhotos.length, userHighlights.length)));
    const tilts = [-1.4, 1.1, -0.9, 1.3, -1.1, 0.8];

    return Array.from({ length: totalCount }, (_, idx) => {
      const curated = copy.curatedFrames[idx % copy.curatedFrames.length];
      const fallbackPhoto = CURATED_FALLBACK_PHOTOS[idx % CURATED_FALLBACK_PHOTOS.length];
      const highlight = userHighlights[idx];

      let dateStamp = curated.dateStamp;
      let title = curated.title;
      let note = curated.note;

      if (highlight) {
        const parsed = splitMilestoneTitle(
          pickLocalizedText(highlight.title, language),
          curated.dateStamp,
        );
        dateStamp = parsed.dateStamp;
        title = parsed.title || curated.title;
        const localizedDetail = pickLocalizedText(highlight.detail, language);
        if (localizedDetail.trim()) {
          note = localizedDetail;
        }
      }

      return {
        id: `frame-${idx}`,
        frameCode: `${String(idx + 1).padStart(2, '0')}A`,
        photoSrc: userPhotos[idx] || fallbackPhoto.src,
        fallbackGradient: fallbackPhoto.gradient,
        dateStamp,
        quartzStamp: curated.quartzStamp,
        title,
        note,
        ticketStop: curated.ticketStop,
        tiltDeg: tilts[idx % tilts.length],
      };
    });
  }, [copy.curatedFrames, data.highlights, data.photos, language]);

  const safeIdx = Math.min(activeIdx, Math.max(0, frames.length - 1));
  const activeFrame = frames[safeIdx] ?? frames[0];

  const selectFrame = useCallback(
    (nextIdx: number) => {
      const bounded = ((nextIdx % frames.length) + frames.length) % frames.length;
      setActiveIdx(bounded);
      setFlipped(false);
      notifyOpenedOnce();
    },
    [frames.length, notifyOpenedOnce],
  );

  const handleToggleFlip = useCallback(() => {
    setFlipped((prev) => !prev);
    notifyOpenedOnce();
  }, [notifyOpenedOnce]);

  const handlePressFlower = useCallback(() => {
    setPressedCount((prev) => prev + 1);
    notifyOpenedOnce();
  }, [notifyOpenedOnce]);

  const markPhotoFailed = useCallback((src: string) => {
    setFailedPhotos((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
  }, []);

  return (
    <article
      aria-label={themeLabel || 'Our Timeline'}
      className="relative flex min-h-full w-full flex-col justify-between overflow-x-clip rounded-[28px] bg-[#FAF4E8] text-[#2E241E]"
    >
      <style>{`
        @keyframes sbSwayLeft-${uid} {
          0%, 100% { transform: rotate(-3deg) translate3d(0, 0, 0); }
          50% { transform: rotate(2.5deg) translate3d(2px, -3px, 0); }
        }
        @keyframes sbSwayRight-${uid} {
          0%, 100% { transform: rotate(3deg) translate3d(0, 0, 0); }
          50% { transform: rotate(-2.5deg) translate3d(-2px, -3px, 0); }
        }
        @keyframes sbSunMote-${uid} {
          0%, 100% {
            opacity: 0.22;
            transform: translate3d(0, 0, 0) scale(0.85);
          }
          50% {
            opacity: 0.72;
            transform: translate3d(8px, -16px, 0) scale(1.18);
          }
        }
        @keyframes sbSunBeam-${uid} {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.62; }
        }
        @keyframes sbPetalScatter-${uid} {
          0% {
            opacity: 0;
            transform: translate3d(0, -14px, 0) scale(0.7) rotate(0deg);
          }
          16% {
            opacity: 0.95;
          }
          80% {
            opacity: 0.85;
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--sb-drift, 14px), 260px, 0) scale(1.06) rotate(var(--sb-rot, 36deg));
          }
        }
        @keyframes sbFrameEnter-${uid} {
          0% { opacity: 0.55; transform: scale(0.985); }
          100% { opacity: 1; transform: scale(1); }
        }
        .sb-sway-left-${uid} {
          transform-origin: bottom center;
          animation: sbSwayLeft-${uid} 7.5s ease-in-out infinite;
        }
        .sb-sway-right-${uid} {
          transform-origin: bottom center;
          animation: sbSwayRight-${uid} 8.4s ease-in-out infinite;
        }
        .sb-sun-mote-${uid} {
          animation: sbSunMote-${uid} ease-in-out infinite;
        }
        .sb-sun-beam-${uid} {
          animation: sbSunBeam-${uid} 9s ease-in-out infinite;
        }
        .sb-petal-scatter-${uid} {
          animation-name: sbPetalScatter-${uid};
          animation-timing-function: cubic-bezier(0.22, 0.65, 0.35, 1);
          animation-fill-mode: forwards;
        }
        .sb-frame-enter-${uid} {
          animation: sbFrameEnter-${uid} 0.34s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .sb-polaroid-scene-${uid} {
          perspective: 1200px;
        }
        .sb-polaroid-card-${uid} {
          transform-style: preserve-3d;
          transition: transform 0.68s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .sb-polaroid-face-${uid} {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .sb-polaroid-back-${uid} {
          transform: rotateY(180deg);
        }
        @media (prefers-reduced-motion: reduce) {
          .sb-sway-left-${uid},
          .sb-sway-right-${uid},
          .sb-sun-mote-${uid},
          .sb-sun-beam-${uid},
          .sb-petal-scatter-${uid},
          .sb-frame-enter-${uid} {
            animation: none !important;
          }
          .sb-polaroid-card-${uid} {
            transition: none !important;
          }
        }
      `}</style>

      {/* LAYER 1: Archival Cream-Linen Paper Texture + Golden-Hour Sunbeams + Film Grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at 86% 8%, rgba(246, 200, 110, 0.34) 0%, rgba(250, 244, 232, 0) 52%), radial-gradient(circle at 12% 86%, rgba(196, 174, 146, 0.22) 0%, rgba(250, 244, 232, 0) 50%), repeating-linear-gradient(0deg, rgba(94, 73, 56, 0.025) 0px, rgba(94, 73, 56, 0.025) 1px, transparent 1px, transparent 5px), repeating-linear-gradient(90deg, rgba(94, 73, 56, 0.018) 0px, rgba(94, 73, 56, 0.018) 1px, transparent 1px, transparent 6px)',
        }}
      />

      {/* Diagonal Golden-Hour Sunbeams */}
      <div
        aria-hidden="true"
        className={`sb-sun-beam-${uid} pointer-events-none absolute -right-12 -top-12 h-72 w-72 rounded-full blur-3xl`}
        style={{
          background:
            'radial-gradient(circle, rgba(246, 200, 110, 0.42) 0%, rgba(234, 179, 84, 0.14) 55%, transparent 78%)',
        }}
      />

      {/* Subtle Analog Film-Grain Overlay */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] mix-blend-multiply"
      >
        <filter id={`grain-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${uid})`} />
      </svg>

      {/* Floating Golden-Hour Dust Motes */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
        {SUNBEAM_MOTES.map((mote, idx) => (
          <span
            key={idx}
            className={`sb-sun-mote-${uid} absolute rounded-full`}
            style={{
              left: mote.left,
              top: mote.top,
              width: mote.size,
              height: mote.size,
              animationDelay: mote.delay,
              animationDuration: mote.duration,
              background: 'radial-gradient(circle, #FFF7DF 0%, #EAB354 75%, transparent 100%)',
              boxShadow: '0 0 8px rgba(234, 179, 84, 0.55)',
            }}
          />
        ))}
      </div>

      {/* Swaying Pressed-Flower Botanical Sprigs Along Margins */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <PressedLavenderSvg
          className={`sb-sway-left-${uid} absolute -left-3 top-14 h-36 w-16 opacity-65 sm:left-0 sm:h-44 sm:w-20`}
        />
        <PressedRoseSvg
          className={`sb-sway-right-${uid} absolute -right-3 top-24 h-32 w-16 opacity-60 sm:right-0 sm:h-40 sm:w-20`}
        />
        <PressedFernSvg
          className={`sb-sway-right-${uid} absolute -right-3 bottom-48 h-40 w-20 opacity-55 sm:right-0 sm:h-48 sm:w-24`}
        />
        <PressedChamomileSvg
          className={`sb-sway-left-${uid} absolute -left-3 bottom-24 h-32 w-20 opacity-65 sm:left-1 sm:h-40 sm:w-24`}
        />
      </div>

      {/* Interactive Pressed-Flower Petal Scatter Burst */}
      {pressedCount > 0 ? (
        <div
          key={`petal-burst-${pressedCount}`}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40 overflow-hidden motion-reduce:hidden sm:absolute"
        >
          {SCATTER_PETALS.map((petal, idx) => (
            <span
              key={`scatter-${pressedCount}-${idx}`}
              className={`sb-petal-scatter-${uid} absolute -top-4 block`}
              style={
                {
                  left: petal.left,
                  animationDelay: petal.delay,
                  animationDuration: petal.duration,
                  '--sb-drift': petal.drift,
                  '--sb-rot': petal.rot,
                } as React.CSSProperties
              }
            >
              <PressedPetalSvg size={petal.size} color={petal.color} />
            </span>
          ))}
        </div>
      ) : null}

      {watermarked ? (
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-30 flex justify-center border-b border-[#8F5B3C]/15 bg-[#F4E6CE]/92 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C4B2F]"
        >
          {copy.previewBanner}
        </div>
      ) : null}

      {/* MAIN SCRAPBOOK CONTENT */}
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pb-6 pt-5 sm:px-7 sm:pt-7">
        {/* Compact Archival Header */}
        <header className="flex flex-col items-center text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border border-[#C7A97E]/50 bg-[#FFFDF8]/88 px-3 py-1 font-mono text-[10px] font-semibold text-[#7A5438] shadow-2xs ${
                isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.16em]'
              }`}
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.7]" aria-hidden="true">
                <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
                <circle cx="10" cy="10" r="2.8" />
                <path d="M6.5 4.5L7.6 2.8H12.4L13.5 4.5" />
              </svg>
              <span>{copy.rollTag}</span>
            </span>

            <span className="inline-flex items-center rounded-full border border-[#2E241E]/15 bg-[#231D19] px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.14em] text-[#F1BE6B]">
              {activeFrame.frameCode} / {String(frames.length).padStart(2, '0')}A
            </span>
          </div>

          <h1 className="mt-3 max-w-full break-words font-royal-serif text-3xl font-semibold leading-tight text-[#2E241E] sm:text-4xl">
            {data.receiverName}
          </h1>

          {headlineText ? (
            <p
              className={`mt-1 max-w-md break-words text-sm text-[#6B5647] ${
                isDevanagari ? 'leading-relaxed' : 'font-royal-serif italic'
              }`}
            >
              {headlineText}
            </p>
          ) : null}
        </header>

        {/* CENTERPIECE: 3D Flippable Polaroid + Washi Tape + Cat Stickers + Vintage Ticket Stub */}
        <section aria-label={activeFrame.title} className="relative flex flex-col items-center">
          <div className="relative w-full max-w-[330px] pt-5 sm:max-w-[360px]">
            {/* Translucent Washi Tape Strips Pinning the Polaroid */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-7 top-1.5 z-20 h-6 w-20 -rotate-[11deg] rounded-[2px] border border-[#6E8568]/25 shadow-2xs"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(138, 160, 126, 0.36) 0px, rgba(138, 160, 126, 0.36) 5px, rgba(250, 244, 232, 0.55) 5px, rgba(250, 244, 232, 0.55) 10px)',
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-14 top-2 z-20 h-5 w-16 rotate-[9deg] rounded-[2px] border border-[#D5837D]/25 shadow-2xs"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(213, 131, 125, 0.42) 1.2px, rgba(251, 235, 229, 0.65) 1.2px)',
                backgroundSize: '7px 7px',
              }}
            />

            {/* Peeking Cat Doodle Sticker perched on top-right of Polaroid */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-2 -top-3 z-20 w-[72px] rotate-[6deg] drop-shadow-xs sm:-right-4 sm:w-[82px]"
            >
              <PeekingCatStickerSvg className="h-auto w-full" />
            </div>

            {/* 3D Flip Scene */}
            <div
              key={activeFrame.id}
              className={`sb-polaroid-scene-${uid} sb-frame-enter-${uid} w-full`}
              style={{ transform: `rotate(${activeFrame.tiltDeg}deg)` }}
            >
              <button
                type="button"
                onClick={handleToggleFlip}
                aria-pressed={flipped}
                aria-label={`${activeFrame.title} — ${flipped ? copy.tapToPhoto : copy.tapToFlip}`}
                className="group block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B85A56]"
              >
                <div
                  className={`sb-polaroid-card-${uid} relative w-full`}
                  style={{
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* POLAROID FRONT FACE */}
                  <div
                    className={`sb-polaroid-face-${uid} relative rounded-[6px] border border-[#D9CBB7] bg-[#FFFDF9] p-3 pb-4 shadow-[0_22px_38px_-18px_rgba(46,36,30,0.34),0_2px_6px_rgba(46,36,30,0.08)] sm:p-3.5 sm:pb-5`}
                  >
                    <div
                      className="relative aspect-[4/3.85] w-full overflow-hidden rounded-[3px] bg-[#EAE0D0]"
                      style={{ backgroundImage: activeFrame.fallbackGradient }}
                    >
                      {!failedPhotos[activeFrame.photoSrc] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={activeFrame.photoSrc}
                          alt={activeFrame.title}
                          onError={() => markPhotoFailed(activeFrame.photoSrc)}
                          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-[#FFFDF9]/90">
                          <svg
                            viewBox="0 0 32 32"
                            className="h-9 w-9 fill-none stroke-current stroke-[1.5]"
                            aria-hidden="true"
                          >
                            <rect x="4" y="8" width="24" height="17" rx="3" />
                            <circle cx="16" cy="16.5" r="4.5" />
                            <path d="M11 8L12.5 5.5H19.5L21 8" />
                          </svg>
                          <span className="mt-2 font-mono text-[10px] tracking-[0.18em]">
                            FRAME {activeFrame.frameCode}
                          </span>
                        </div>
                      )}

                      {/* Subtle Warm Analog Vignette */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            'radial-gradient(circle at 50% 45%, transparent 56%, rgba(46, 32, 22, 0.24) 100%)',
                        }}
                      />

                      {/* Vintage 35mm Orange Quartz Date Imprint */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-2 right-2.5 font-mono text-[11px] font-bold tracking-[0.14em] text-[#FF9B42] drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]"
                      >
                        {activeFrame.quartzStamp}
                      </span>
                    </div>

                    {/* Polaroid Chin Caption */}
                    <div className="mt-3.5 flex items-end justify-between gap-2 px-1">
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-[#2E241E] ${
                            isDevanagari
                              ? 'font-heading text-base font-bold leading-snug'
                              : 'font-royal-script text-[25px] leading-tight'
                          }`}
                        >
                          {activeFrame.title}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#C7A97E]/45 bg-[#FAF4E8] px-2.5 py-1 text-[10px] font-medium text-[#7A5438] transition group-hover:border-[#B85A56]/45 group-hover:text-[#B85A56]">
                        <svg
                          viewBox="0 0 20 20"
                          className="h-3 w-3 fill-none stroke-current stroke-[1.8]"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 10a6 6 0 0 1 10.3-4.2L16 7.5M16 4v3.5h-3.5M16 10a6 6 0 0 1-10.3 4.2L4 12.5M4 16v-3.5h3.5" />
                        </svg>
                        <span>{activeFrame.frameCode}</span>
                      </span>
                    </div>
                  </div>

                  {/* POLAROID BACK FACE (Handwritten Date Stamp + Milestone Note) */}
                  <div
                    className={`sb-polaroid-face-${uid} sb-polaroid-back-${uid} absolute inset-0 flex flex-col justify-between rounded-[6px] border border-[#D4C4AE] bg-[#FBF6EC] p-5 shadow-[0_22px_38px_-18px_rgba(46,36,30,0.34)]`}
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(180deg, transparent 0px, transparent 27px, rgba(164, 141, 114, 0.16) 27px, rgba(164, 141, 114, 0.16) 28px)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {/* Ink Date Stamp */}
                      <span
                        className={`inline-flex -rotate-2 items-center rounded border border-[#B85A56]/55 bg-[#B85A56]/8 px-2.5 py-1 font-mono text-[10px] font-bold text-[#9A3F3B] ${
                          isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.14em]'
                        }`}
                      >
                        {activeFrame.dateStamp}
                      </span>

                      {/* Circular Vintage Postmark Stamp */}
                      <div
                        aria-hidden="true"
                        className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-full border border-dashed border-[#8F7660]/55 text-center font-mono text-[7.5px] font-bold leading-tight text-[#7D6551]"
                      >
                        <span>35MM</span>
                        <span>{activeFrame.frameCode}</span>
                      </div>
                    </div>

                    <div className="my-auto py-3">
                      <h2
                        className={`break-words text-[#2E241E] ${
                          isDevanagari
                            ? 'font-heading text-lg font-bold leading-snug'
                            : 'font-royal-serif text-xl font-semibold leading-snug'
                        }`}
                      >
                        {activeFrame.title}
                      </h2>
                      <p
                        className={`mt-2.5 break-words text-[#4B3B31] ${
                          isDevanagari
                            ? 'text-sm leading-relaxed'
                            : 'font-royal-serif text-[15px] italic leading-relaxed'
                        }`}
                      >
                        {activeFrame.note}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#C7A97E]/35 pt-2.5 text-[10.5px] font-medium text-[#7A5438]">
                      <span>{copy.tapToPhoto}</span>
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 fill-[#B85A56]/75"
                        aria-hidden="true"
                      >
                        <path d="M12 20.2s-6.8-4.3-8.5-8.2C2.2 9 4.1 6 7.2 5.7c1.8-.2 3.5.8 4.8 2.2 1.3-1.4 3-2.4 4.8-2.2 3.1.3 5 3.3 3.7 6.3-1.7 3.9-8.5 8.2-8.5 8.2Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Subtle Flip Hint Below Polaroid */}
            <p className="mt-2.5 text-center text-[11px] font-medium text-[#7A6352]">
              {flipped ? copy.tapToPhoto : copy.tapToFlip}
            </p>
          </div>

          {/* Vintage Train / Cinema Keepsake Ticket Stub + Sleeping Cat Sticker */}
          <div className="relative mt-4 flex w-full max-w-[350px] items-end justify-center sm:max-w-[385px]">
            {/* Sleeping Curled Cat Sticker Tucked Bottom-Left */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-2.5 -left-2 z-20 w-[78px] -rotate-[5deg] drop-shadow-xs sm:-left-6 sm:w-[88px]"
            >
              <SleepingCatStickerSvg className="h-auto w-full" />
            </div>

            {/* Vintage Ticket Stub */}
            <div className="relative ml-10 flex w-full overflow-hidden rounded-[10px] border border-[#B89B72]/60 bg-[#F3E6CC] text-[#3B2B20] shadow-[0_10px_22px_-14px_rgba(46,36,30,0.35)] sm:ml-12">
              {/* Left & Right Semicircular Ticket Perforation Notches */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-[#B89B72]/50 bg-[#FAF4E8]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-[#B89B72]/50 bg-[#FAF4E8]"
              />

              {/* Main Stub Body */}
              <div className="flex flex-1 flex-col justify-between px-4 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-mono text-[8.5px] font-bold text-[#8F4D3E] ${
                      isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.16em]'
                    }`}
                  >
                    {copy.ticketHeader}
                  </span>
                  <span className="font-mono text-[8.5px] font-bold text-[#7A5D44]">
                    NO. 0{safeIdx + 1}4
                  </span>
                </div>
                <p className="mt-1 truncate font-royal-serif text-sm font-semibold text-[#2E241E]">
                  {activeFrame.ticketStop}
                </p>
                <p
                  className={`mt-0.5 font-mono text-[9px] text-[#6E543E] ${
                    isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.12em]'
                  }`}
                >
                  {copy.ticketAdmit} · {copy.ticketClass}
                </p>
              </div>

              {/* Dashed Tear Line & Seat Stub */}
              <div className="flex flex-col items-center justify-center border-l border-dashed border-[#A6875D]/70 bg-[#EAD9B7]/70 px-3 py-2 text-center">
                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-[#7A5D44]">
                  FRAME
                </span>
                <span className="mt-0.5 font-mono text-xs font-extrabold tracking-[0.1em] text-[#8F3D3A]">
                  {activeFrame.frameCode}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE 35MM ANALOG FILM-STRIP SCRUBBER */}
        <section
          aria-label={copy.filmStripLabel}
          className="relative overflow-hidden rounded-[18px] border border-[#3B312B] bg-[#191614] py-2.5 shadow-[0_18px_34px_-16px_rgba(25,22,20,0.72)]"
        >
          {/* Top Film Edge Markings + Sprocket Holes */}
          <div className="flex items-center justify-between px-3 pb-1.5 font-mono text-[8.5px] font-bold tracking-[0.18em] text-[#E5A952]/80">
            <span>PORTRA 400</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => selectFrame(safeIdx - 1)}
                aria-label={copy.prevFrameLabel}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#E5A952]/30 bg-[#26211E] text-[#F1BE6B] transition hover:border-[#F1BE6B] hover:bg-[#322A25] active:scale-95"
              >
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 5.5L8 10l4.5 4.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => selectFrame(safeIdx + 1)}
                aria-label={copy.nextFrameLabel}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#E5A952]/30 bg-[#26211E] text-[#F1BE6B] transition hover:border-[#F1BE6B] hover:bg-[#322A25] active:scale-95"
              >
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 5.5L12 10l-4.5 4.5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Top Sprocket Perforations */}
          <div aria-hidden="true" className="flex items-center justify-between gap-2 px-3 pb-2">
            {Array.from({ length: SPROCKET_COUNT }).map((_, i) => (
              <span
                key={`top-sprocket-${i}`}
                className="h-2 w-3.5 rounded-[2px] bg-[#FAF4E8]/85 shadow-inner"
              />
            ))}
          </div>

          {/* Film Frame Thumbnails */}
          <div className="flex snap-x snap-mandatory items-center gap-2.5 overflow-x-auto px-3 py-1 scrollbar-none">
            {frames.map((frame, idx) => {
              const isSelected = idx === safeIdx;
              const thumbFailed = Boolean(failedPhotos[frame.photoSrc]);
              return (
                <button
                  key={frame.id}
                  type="button"
                  onClick={() => selectFrame(idx)}
                  aria-pressed={isSelected}
                  aria-label={`${frame.frameCode} — ${frame.title}`}
                  className={`group relative flex w-[92px] shrink-0 snap-center flex-col overflow-hidden rounded-[5px] border-2 bg-[#26211E] p-1 text-left transition-all duration-300 active:scale-95 sm:w-[104px] ${
                    isSelected
                      ? 'border-[#F1BE6B] shadow-[0_0_0_2px_rgba(241,190,107,0.28)]'
                      : 'border-[#3A322C] opacity-75 hover:border-[#C79348] hover:opacity-100'
                  }`}
                >
                  <div
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-[3px]"
                    style={{ backgroundImage: frame.fallbackGradient }}
                  >
                    {!thumbFailed ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={frame.photoSrc}
                        alt=""
                        onError={() => markPhotoFailed(frame.photoSrc)}
                        className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                      />
                    ) : null}
                  </div>
                  <div className="mt-1 flex items-center justify-between px-0.5 font-mono text-[9px] font-bold tracking-[0.12em]">
                    <span className={isSelected ? 'text-[#F6C86E]' : 'text-[#C8B8A6]/75'}>
                      {frame.frameCode}
                    </span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isSelected ? 'bg-[#F6C86E]' : 'bg-[#6F6258]'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Sprocket Perforations */}
          <div aria-hidden="true" className="flex items-center justify-between gap-2 px-3 pt-2">
            {Array.from({ length: SPROCKET_COUNT }).map((_, i) => (
              <span
                key={`bottom-sprocket-${i}`}
                className="h-2 w-3.5 rounded-[2px] bg-[#FAF4E8]/85 shadow-inner"
              />
            ))}
          </div>
        </section>

        {/* MINIMAL ARCHIVAL LOVE LETTER FOOTER CARD */}
        <section
          aria-label={copy.letterEyebrow}
          className="relative rounded-[20px] border border-[#D4C2A8]/80 bg-[#FFFDF8]/92 px-5 py-6 text-center shadow-[0_14px_30px_-18px_rgba(46,36,30,0.22)] backdrop-blur-xs sm:px-7 sm:py-7"
        >
          {/* Decorative Corner Tape */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rotate-[-1.5deg] rounded-[2px] border border-[#C7A97E]/30 bg-[#E9D7B9]/70"
          />

          <span
            className={`inline-flex items-center gap-1.5 font-mono text-[9.5px] font-bold text-[#8F5B3C] ${
              isDevanagari ? 'tracking-normal' : 'uppercase tracking-[0.2em]'
            }`}
          >
            {copy.letterEyebrow}
          </span>

          <p
            className={`mx-auto mt-3 max-w-md break-words text-[#362A23] ${
              isDevanagari
                ? 'text-[15px] leading-relaxed'
                : 'font-royal-serif text-[16px] leading-relaxed'
            }`}
          >
            {messageText}
          </p>

          {data.senderName ? (
            <p className="mt-4 text-sm text-[#6E5646]">
              <span className={isDevanagari ? '' : 'font-royal-serif italic'}>
                {copy.signedPrefix}
              </span>{' '}
              <span
                className={`font-semibold text-[#2E241E] ${
                  isDevanagari ? 'font-heading' : 'font-royal-serif'
                }`}
              >
                {data.senderName}
              </span>
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={handlePressFlower}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#B85A56]/30 bg-[#B85A56] px-5 py-2.5 text-xs font-semibold tracking-[0.06em] text-[#FFFDF9] shadow-[0_10px_22px_-10px_rgba(184,90,86,0.65)] transition hover:bg-[#9E4945] active:scale-95 motion-reduce:transition-none"
            >
              <PressedPetalSvg size={14} color="#FFFDF9" />
              <span>{pressedCount > 0 ? copy.pressAnotherCta : copy.pressFlowerCta}</span>
            </button>

            {pressedCount > 0 ? (
              <span
                role="status"
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[#6E8568]/35 bg-[#F2F6EE] px-3 py-1 font-mono text-[10px] font-bold text-[#4A6147]"
              >
                <PressedPetalSvg size={11} color="#6E8568" />
                <span>{copy.pressedBadge(pressedCount)}</span>
              </span>
            ) : null}
          </div>
        </section>

        {/* Minimal Webzy Footer */}
        <footer className="flex items-center justify-center border-t border-[#C7A97E]/30 pt-3 text-center">
          <p className="text-[11px] font-medium text-[#6B5647]/80">
            {getWebzyFooterLabel(language)}
          </p>
        </footer>
      </div>
    </article>
  );
}
