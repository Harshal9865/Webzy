'use client';

import React, { type JSX, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

export interface PixelNightRideProps {
  receiverName: string;
  senderName: string;
  storyLines?: readonly string[];
  accentColor?: string;
  language?: 'en' | 'hinglish' | 'hi';
  onComplete?: () => void;
}

type RideStage = 'ready' | 'riding' | 'finale';
type SupportedRideLanguage = 'en' | 'hinglish' | 'hi';

interface FloatingStar {
  id: number;
  xPct: number;
  yPct: number;
  burst: boolean;
}

interface LocalizedRideCopy {
  stageBadge: string;
  rideLabel: string;
  starsLabel: string;
  soundOn: string;
  soundOff: string;
  readySub: string;
  startBtn: string;
  holdToRide: string;
  throttleActive: string;
  ridingHint: string;
  tapStarAria: string;
  speakerTag: string;
  checkpoints: readonly [string, string, string, string];
  finaleTag: string;
  signedBy: string;
  finaleNote: string;
  rideAgain: string;
}

const RIDE_COPY: Record<SupportedRideLanguage, LocalizedRideCopy> = {
  en: {
    stageBadge: '8-BIT NIGHT RIDE',
    rideLabel: 'RIDE',
    starsLabel: 'STARS',
    soundOn: 'SFX ON',
    soundOff: 'MUTED',
    readySub: 'Moonlit streets, warm chai stops, and a neon skyline made just for you.',
    startBtn: 'START RIDE',
    holdToRide: 'HOLD OR TAP TO RIDE',
    throttleActive: 'CRUISING...',
    ridingHint: 'Hold the throttle ring or tap twinkling stars in the sky',
    tapStarAria: 'Tap floating star for bonus sparkle',
    speakerTag: 'NIGHT DISPATCH',
    checkpoints: [
      'Headlight on, cool night breeze, and quiet neon streets ahead.',
      'Passing the glowing CHAI stall — saving the warmest cup for you.',
      'Midnight MOMOS and streetlamp glow — every lane feels brighter with you.',
      'Almost at the balcony — look up, the night sky is lighting up.',
    ],
    finaleTag: 'BALCONY FINALE',
    signedBy: 'Signed by',
    finaleNote: 'Under this quiet pixel moon, wishing you endless calm, laughter, and bright nights.',
    rideAgain: 'Ride Again',
  },
  hinglish: {
    stageBadge: '8-BIT NIGHT RIDE',
    rideLabel: 'RIDE',
    starsLabel: 'STARS',
    soundOn: 'SFX ON',
    soundOff: 'MUTED',
    readySub: 'Chaandni sadkein, garam chai ki tapri, aur sirf tumhare liye ek pyaari si ride.',
    startBtn: 'START RIDE',
    holdToRide: 'HOLD YA TAP KARKE CHALAO',
    throttleActive: 'CHAL RAHE HAIN...',
    ridingHint: 'Throttle ring dabaye rakho ya aasmaan ke taare tap karo',
    tapStarAria: 'Bonus sparkle ke liye taara tap karein',
    speakerTag: 'RAAT KA PAIGAAM',
    checkpoints: [
      'Headlight on, thandi hawa, aur aage khuli chaandni sadak.',
      'Garam CHAI ki tapri paas aayi — sabse meetha cup tumhare naam.',
      'Midnight MOMOS aur neon lights — tumhare saath har gali roshan hai.',
      'Bas balcony pahunchne wale hain — upar dekho, aasmaan chamak raha hai.',
    ],
    finaleTag: 'BALCONY FINALE',
    signedBy: 'Bheja hai',
    finaleNote: 'Is chaandni raat mein dua hai ki tumhari har shaam sukoon aur muskaan se bhari rahe.',
    rideAgain: 'Ride Again',
  },
  hi: {
    stageBadge: '8-बिट नाइट राइड',
    rideLabel: 'सफ़र',
    starsLabel: 'तारे',
    soundOn: 'ध्वनि चालू',
    soundOff: 'म्यूट',
    readySub: 'चाँदनी रात, गरम चाय की महक और आपके लिए एक सुकून भरा सफ़र।',
    startBtn: 'START RIDE',
    holdToRide: 'बटन दबाएं या टैप करें',
    throttleActive: 'सफ़र जारी है...',
    ridingHint: 'थ्रॉटल रिंग दबाए रखें या आकाश में चमकते तारे टैप करें',
    tapStarAria: 'बोनस चमक के लिए तारा टैप करें',
    speakerTag: 'रात्रि संदेश',
    checkpoints: [
      'हेडलाइट चालू, ठंडी हवा और आगे शांत चाँदनी सड़क।',
      'चमकती चाय की दुकान के पास — सबसे गरम कप आपके नाम।',
      'रात के मोमोज़ और स्ट्रीटलाइट की चमक — आपके साथ हर गली रोशन है।',
      'बस बालकनी पहुँचने वाले हैं — ऊपर देखें, आकाश जगमगा रहा है।',
    ],
    finaleTag: 'बालकनी उत्सव',
    signedBy: 'प्रेषक',
    finaleNote: 'इस शांत पिक्सेल चाँद के नीचे, आपके लिए अनगिनत खुशियों और सुकून की कामना।',
    rideAgain: 'Ride Again',
  },
};

const CRUISE_NOTES = [261.63, 329.63, 392.0, 493.88, 523.25, 493.88, 392.0, 329.63];
const FINALE_FANFARE = [392.0, 493.88, 587.33, 783.99, 987.77];

const SKY_STAR_COORDS: ReadonlyArray<{ x: number; y: number; size: number; delay: string }> = [
  { x: 7, y: 10, size: 3, delay: '0s' },
  { x: 16, y: 20, size: 2, delay: '0.5s' },
  { x: 25, y: 8, size: 3, delay: '1.1s' },
  { x: 37, y: 16, size: 2, delay: '0.3s' },
  { x: 46, y: 9, size: 4, delay: '0.9s' },
  { x: 58, y: 19, size: 2, delay: '1.4s' },
  { x: 67, y: 11, size: 3, delay: '0.2s' },
  { x: 75, y: 24, size: 2, delay: '0.7s' },
  { x: 89, y: 12, size: 3, delay: '1.2s' },
  { x: 94, y: 27, size: 2, delay: '0.4s' },
];

const INITIAL_BONUS_STARS: ReadonlyArray<FloatingStar> = [
  { id: 1, xPct: 22, yPct: 26, burst: false },
  { id: 2, xPct: 52, yPct: 18, burst: false },
  { id: 3, xPct: 74, yPct: 30, burst: false },
];

const FIREWORK_BURSTS: ReadonlyArray<{
  xPct: number;
  yPct: number;
  color: string;
  secondary: string;
  delay: string;
}> = [
  { xPct: 18, yPct: 24, color: '#FDE047', secondary: '#FB7185', delay: '0s' },
  { xPct: 48, yPct: 16, color: '#38BDF8', secondary: '#F472B6', delay: '0.5s' },
  { xPct: 79, yPct: 22, color: '#A78BFA', secondary: '#FDE047', delay: '0.9s' },
  { xPct: 33, yPct: 34, color: '#34D399', secondary: '#FBBF24', delay: '1.3s' },
  { xPct: 65, yPct: 32, color: '#FB7185', secondary: '#67E8F9', delay: '0.25s' },
];

function PixelHeartIcon({ filled, accentColor }: { filled: boolean; accentColor: string }) {
  return (
    <svg
      viewBox="0 0 11 10"
      className="h-4 w-4 shrink-0"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path
        d="M2 0h2v1h1v1h1V1h1V0h2v1h1v1h1v3h-1v1H9v1H8v1H7v1H6v1H5V9H4V8H3V7H2V6H1V5H0V2h1V1h1V0z"
        fill={filled ? accentColor : '#2B2147'}
      />
      {filled ? (
        <path d="M2 2h1v1H2V2zm1-1h1v1H3V1z" fill="#FFE4EA" />
      ) : (
        <path
          d="M2 1h2v1h1v1h1V2h1V1h2v1h1v3H9v1H8v1H7v1H6v1H5V8H4V7H3V6H2V5H1V2h1V1z"
          fill="#15102C"
        />
      )}
    </svg>
  );
}

function PixelStarSprite({ bright = false }: { bright?: boolean }) {
  return (
    <svg
      viewBox="0 0 9 9"
      className="h-6 w-6"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path
        d="M4 0h1v2h1v1h3v1H7v1H6v1h1v3H5V7H4v2H2V6h1V5H2V4H0V3h3V2h1V0z"
        fill={bright ? '#FEF08A' : '#FACC15'}
      />
      <rect x="4" y="3" width="1" height="2" fill="#FFFFFF" />
    </svg>
  );
}

function PixelSpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      viewBox="0 0 14 14"
      className="h-4 w-4"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d="M2 5h2l3-3v10L4 9H2V5z" fill="currentColor" />
      {muted ? (
        <path d="M9 5h1v1h1V5h1v1h-1v1h1v1h-1V7h-1v1H9V7h1V6H9V5z" fill="#FDA4AF" />
      ) : (
        <>
          <rect x="9" y="5" width="1" height="4" fill="#FDE047" />
          <rect x="11" y="3" width="1" height="8" fill="#FDE047" />
        </>
      )}
    </svg>
  );
}

function PixelMoon() {
  return (
    <div className="pointer-events-none relative" aria-hidden="true">
      <div
        className="absolute -inset-4 rounded-full opacity-45 blur-md"
        style={{ background: 'radial-gradient(circle, rgba(254,240,138,0.65) 0%, transparent 72%)' }}
      />
      <svg
        viewBox="0 0 16 16"
        className="relative h-12 w-12 sm:h-14 sm:w-14"
        shapeRendering="crispEdges"
      >
        <path
          d="M5 1h6v1h2v1h1v2h1v6h-1v2h-1v1h-2v1H5v-1H3v-1H2v-2H1V5h1V3h1V2h2V1z"
          fill="#FEF08A"
        />
        <rect x="4" y="4" width="2" height="2" fill="#FDE047" />
        <rect x="9" y="5" width="3" height="2" fill="#FACC15" opacity="0.65" />
        <rect x="6" y="10" width="2" height="2" fill="#FACC15" opacity="0.7" />
        <rect x="10" y="10" width="1" height="1" fill="#FDE047" />
        <rect x="5" y="2" width="4" height="1" fill="#FEF9C3" />
      </svg>
    </div>
  );
}

function PixelStreetSegment({
  accentColor,
  reducedMotion,
}: {
  accentColor: string;
  reducedMotion: boolean;
}) {
  return (
    <div className="relative flex h-full w-1/2 shrink-0 items-end justify-between px-2">
      {/* Tall dark apartment block */}
      <div className="relative flex h-24 w-14 flex-col justify-between border-2 border-[#2A1D52] bg-[#161030] p-1.5">
        <div className="grid grid-cols-3 gap-1">
          <span className="h-2 w-2 bg-[#FDE047]" />
          <span className="h-2 w-2 bg-[#231948]" />
          <span className="h-2 w-2 bg-[#38BDF8]/80" />
          <span className="h-2 w-2 bg-[#231948]" />
          <span className="h-2 w-2 bg-[#FDE047]/80" />
          <span className="h-2 w-2 bg-[#231948]" />
          <span className="h-2 w-2 bg-[#FB7185]/70" />
          <span className="h-2 w-2 bg-[#231948]" />
          <span className="h-2 w-2 bg-[#FDE047]" />
        </div>
        <div className="mx-auto h-3 w-4 bg-[#2A1D52]" />
      </div>

      {/* Flickering Pixel Streetlamp */}
      <div className="relative flex flex-col items-center" aria-hidden="true">
        <div
          className={`h-2.5 w-3.5 border border-[#FEF08A] bg-[#FDE047] shadow-[0_0_12px_rgba(253,224,71,0.85)] ${
            reducedMotion ? '' : 'pnr-lamp-flicker'
          }`}
        />
        <div
          className="h-14 w-8 opacity-20"
          style={{
            background: 'linear-gradient(180deg, rgba(253,224,71,0.75) 0%, transparent 100%)',
            clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
          }}
        />
        <div className="absolute bottom-0 h-14 w-1 bg-[#4C3B80]" />
        <div className="absolute bottom-0 h-1.5 w-3 bg-[#362861]" />
      </div>

      {/* Cozy Pixel CHAI Stall */}
      <div className="relative flex h-16 w-[84px] flex-col justify-between border-2 border-[#7C2D12] bg-[#24132C]">
        {/* Glowing CHAI Neon Sign */}
        <div className="mx-auto -mt-4 border-2 border-[#F59E0B] bg-[#1D0F24] px-1.5 py-0.5 shadow-[0_0_10px_rgba(245,158,11,0.65)]">
          <span className="block font-pixel text-[8px] font-bold leading-none tracking-[0.12em] text-[#FDE047]">
            CHAI
          </span>
        </div>
        {/* Pixel striped awning */}
        <div className="flex h-2.5 w-full">
          <span className="flex-1 bg-[#F59E0B]" />
          <span className="flex-1 bg-[#FEF3C7]" />
          <span className="flex-1 bg-[#F59E0B]" />
          <span className="flex-1 bg-[#FEF3C7]" />
          <span className="flex-1 bg-[#F59E0B]" />
        </div>
        {/* Warm serving window with pixel steaming cup */}
        <div className="mx-1.5 mb-1 flex h-8 items-center justify-between bg-[#451A12] px-1.5">
          <svg viewBox="0 0 10 10" className="h-5 w-5" shapeRendering="crispEdges" aria-hidden="true">
            <rect x="3" y="1" width="1" height="2" fill="#FEF3C7" opacity="0.7" />
            <rect x="5" y="0" width="1" height="3" fill="#FEF3C7" opacity="0.7" />
            <rect x="2" y="4" width="5" height="4" fill="#FDE68A" />
            <rect x="7" y="5" width="1" height="2" fill="#FDE68A" />
            <rect x="1" y="8" width="7" height="1" fill="#D97706" />
          </svg>
          <div className="h-5 w-6 bg-[#FBBF24]/25" />
        </div>
      </div>

      {/* Mid-height neon apartment */}
      <div className="hidden h-20 w-12 flex-col justify-between border-2 border-[#2E215B] bg-[#181136] p-1 sm:flex">
        <div className="grid grid-cols-2 gap-1">
          <span className="h-2 w-2 bg-[#38BDF8]" />
          <span className="h-2 w-2 bg-[#251A4D]" />
          <span className="h-2 w-2 bg-[#251A4D]" />
          <span className="h-2 w-2 bg-[#FDE047]" />
        </div>
        <div className="h-2 w-full bg-[#2E215B]" />
      </div>

      {/* Cozy Pixel MOMOS Stall */}
      <div className="relative flex h-16 w-[88px] flex-col justify-between border-2 border-[#831843] bg-[#1F122E]">
        {/* Glowing MOMOS Neon Sign */}
        <div
          className="mx-auto -mt-4 border-2 px-1.5 py-0.5"
          style={{
            borderColor: accentColor,
            backgroundColor: '#160D24',
            boxShadow: `0 0 10px ${accentColor}99`,
          }}
        >
          <span className="block font-pixel text-[8px] font-bold leading-none tracking-[0.1em] text-[#67E8F9]">
            MOMOS
          </span>
        </div>
        {/* Neon pink & cyan awning */}
        <div className="flex h-2.5 w-full">
          <span className="flex-1" style={{ backgroundColor: accentColor }} />
          <span className="flex-1 bg-[#E0F2FE]" />
          <span className="flex-1" style={{ backgroundColor: accentColor }} />
          <span className="flex-1 bg-[#E0F2FE]" />
          <span className="flex-1" style={{ backgroundColor: accentColor }} />
        </div>
        {/* Steamer baskets */}
        <div className="mx-1.5 mb-1 flex h-8 items-end justify-between bg-[#2D173E] px-1.5 pb-1">
          <svg viewBox="0 0 10 9" className="h-5 w-5" shapeRendering="crispEdges" aria-hidden="true">
            <rect x="2" y="1" width="5" height="1" fill="#BAE6FD" />
            <rect x="1" y="3" width="7" height="2" fill="#D97706" />
            <rect x="1" y="6" width="7" height="2" fill="#B45309" />
            <rect x="2" y="5" width="5" height="1" fill="#FDE68A" />
          </svg>
          <span className="h-2 w-2 bg-[#34D399] shadow-[0_0_6px_#34D399]" />
        </div>
      </div>

      {/* Second Flickering Pixel Streetlamp */}
      <div className="relative hidden flex-col items-center sm:flex" aria-hidden="true">
        <div
          className={`h-2.5 w-3.5 border border-[#FEF08A] bg-[#FDE047] shadow-[0_0_12px_rgba(253,224,71,0.85)] ${
            reducedMotion ? '' : 'pnr-lamp-flicker-alt'
          }`}
        />
        <div
          className="h-14 w-8 opacity-20"
          style={{
            background: 'linear-gradient(180deg, rgba(253,224,71,0.75) 0%, transparent 100%)',
            clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
          }}
        />
        <div className="absolute bottom-0 h-14 w-1 bg-[#4C3B80]" />
        <div className="absolute bottom-0 h-1.5 w-3 bg-[#362861]" />
      </div>
    </div>
  );
}

function PixelScooterRider({
  accentColor,
  isMoving,
  wheelPhase,
  reducedMotion,
}: {
  accentColor: string;
  isMoving: boolean;
  wheelPhase: number;
  reducedMotion: boolean;
}) {
  return (
    <div
      className={`relative flex items-end ${
        isMoving && !reducedMotion ? 'pnr-scooter-bob' : ''
      }`}
      aria-hidden="true"
    >
      {/* Headlight beam cone */}
      <div
        className="pointer-events-none absolute -right-28 bottom-3 h-12 w-32 transition-opacity duration-200"
        style={{
          opacity: isMoving ? 0.85 : 0.48,
          background:
            'linear-gradient(90deg, rgba(254,240,138,0.62) 0%, rgba(254,240,138,0.18) 55%, rgba(254,240,138,0) 100%)',
          clipPath: 'polygon(0% 34%, 100% 0%, 100% 100%, 0% 66%)',
        }}
      />

      {/* Retro 8-bit Pixel Scooter + Rider SVG */}
      <svg
        viewBox="0 0 36 28"
        className="relative z-10 h-16 w-20 sm:h-[72px] sm:w-[92px]"
        shapeRendering="crispEdges"
      >
        {/* Flowing pixel scarf */}
        <rect x={isMoving && !reducedMotion && wheelPhase === 1 ? 5 : 6} y="8" width="5" height="2" fill={accentColor} />
        <rect x={isMoving && !reducedMotion && wheelPhase === 1 ? 2 : 3} y="9" width="4" height="2" fill="#FDA4AF" />

        {/* Rider helmet & head */}
        <rect x="12" y="2" width="6" height="5" fill="#F8FAFC" />
        <rect x="13" y="1" width="4" height="1" fill="#E2E8F0" />
        <rect x="16" y="4" width="2" height="2" fill="#1E1B4B" />
        <rect x="12" y="4" width="2" height="1" fill={accentColor} />

        {/* Rider jacket & arms reaching handlebars */}
        <rect x="11" y="7" width="6" height="7" fill="#312E81" />
        <rect x="17" y="8" width="4" height="2" fill="#4338CA" />
        <rect x="20" y="9" width="2" height="2" fill="#FDE68A" />

        {/* Rider legs */}
        <rect x="13" y="14" width="4" height="4" fill="#1E1B4B" />

        {/* Scooter handlebars & stem */}
        <rect x="21" y="8" width="3" height="2" fill="#CBD5E1" />
        <rect x="22" y="10" width="2" height="7" fill="#94A3B8" />

        {/* Headlight bulb */}
        <rect x="24" y="11" width="3" height="3" fill="#FEF08A" />
        <rect x="26" y="12" width="1" height="1" fill="#FFFFFF" />

        {/* Scooter seat & retro body */}
        <rect x="8" y="13" width="7" height="2" fill="#1E1B4B" />
        <rect x="6" y="15" width="10" height="5" fill={accentColor} />
        <rect x="16" y="17" width="7" height="3" fill="#E2E8F0" />
        <rect x="21" y="14" width="4" height="6" fill={accentColor} />
        <rect x="8" y="16" width="6" height="2" fill="#FDA4AF" />

        {/* Tail light */}
        <rect x="5" y="16" width="1" height="2" fill="#EF4444" />

        {/* Rear & front fenders */}
        <rect x="5" y="20" width="7" height="1" fill="#F8FAFC" />
        <rect x="21" y="20" width="7" height="1" fill="#F8FAFC" />

        {/* Rear pixel wheel */}
        <rect x="6" y="21" width="5" height="5" fill="#0F172A" />
        <rect x="7" y="22" width="3" height="3" fill="#64748B" />
        <rect
          x={wheelPhase === 0 ? 8 : 7}
          y={wheelPhase === 0 ? 22 : 23}
          width="1"
          height="1"
          fill="#F8FAFC"
        />

        {/* Front pixel wheel */}
        <rect x="22" y="21" width="5" height="5" fill="#0F172A" />
        <rect x="23" y="22" width="3" height="3" fill="#64748B" />
        <rect
          x={wheelPhase === 0 ? 24 : 25}
          y={wheelPhase === 0 ? 22 : 23}
          width="1"
          height="1"
          fill="#F8FAFC"
        />
      </svg>
    </div>
  );
}

function PixelWallLantern({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="relative flex flex-col items-center" aria-hidden="true">
      <div
        className={`absolute -inset-2 rounded-full opacity-55 blur-sm ${
          reducedMotion ? '' : 'pnr-lamp-flicker'
        }`}
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.75) 0%, transparent 70%)' }}
      />
      <svg viewBox="0 0 12 16" className="relative h-10 w-8" shapeRendering="crispEdges">
        <rect x="4" y="0" width="4" height="2" fill="#334155" />
        <rect x="2" y="2" width="8" height="2" fill="#475569" />
        <rect x="3" y="4" width="6" height="8" fill="#FEF08A" />
        <rect x="5" y="6" width="2" height="4" fill="#FFFFFF" />
        <rect x="2" y="12" width="8" height="2" fill="#475569" />
        <rect x="5" y="14" width="2" height="2" fill="#334155" />
      </svg>
    </div>
  );
}

function PixelFlowerPot({ accentColor }: { accentColor: string }) {
  return (
    <svg viewBox="0 0 12 12" className="h-9 w-9 shrink-0" shapeRendering="crispEdges" aria-hidden="true">
      {/* Blossoms */}
      <rect x="2" y="1" width="2" height="2" fill={accentColor} />
      <rect x="7" y="0" width="2" height="2" fill="#FDE047" />
      <rect x="5" y="2" width="2" height="2" fill="#F472B6" />
      {/* Stems & leaves */}
      <rect x="3" y="3" width="6" height="3" fill="#22C55E" />
      <rect x="2" y="4" width="2" height="2" fill="#16A34A" />
      <rect x="8" y="4" width="2" height="2" fill="#16A34A" />
      {/* Terracotta pot */}
      <rect x="2" y="6" width="8" height="2" fill="#EA580C" />
      <rect x="3" y="8" width="6" height="4" fill="#C2410C" />
    </svg>
  );
}

function PixelFireworkCluster({
  color,
  secondary,
  delay,
  reducedMotion,
}: {
  color: string;
  secondary: string;
  delay: string;
  reducedMotion: boolean;
}) {
  return (
    <svg
      viewBox="0 0 15 15"
      className={`h-11 w-11 ${reducedMotion ? 'opacity-90' : 'pnr-firework-pop'}`}
      style={reducedMotion ? undefined : { animationDelay: delay }}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="7" y="7" width="1" height="1" fill="#FFFFFF" />
      <rect x="7" y="1" width="1" height="2" fill={color} />
      <rect x="7" y="12" width="1" height="2" fill={color} />
      <rect x="1" y="7" width="2" height="1" fill={color} />
      <rect x="12" y="7" width="2" height="1" fill={color} />
      <rect x="3" y="3" width="2" height="2" fill={secondary} />
      <rect x="10" y="3" width="2" height="2" fill={secondary} />
      <rect x="3" y="10" width="2" height="2" fill={secondary} />
      <rect x="10" y="10" width="2" height="2" fill={secondary} />
      <rect x="7" y="4" width="1" height="1" fill="#FEF08A" />
      <rect x="7" y="10" width="1" height="1" fill="#FEF08A" />
      <rect x="4" y="7" width="1" height="1" fill="#FEF08A" />
      <rect x="10" y="7" width="1" height="1" fill="#FEF08A" />
    </svg>
  );
}

export function OccasionPixelNightRide(props: PixelNightRideProps): JSX.Element {
  const {
    receiverName,
    senderName,
    storyLines,
    accentColor = '#FB7185',
    language = 'en',
    onComplete,
  } = props;

  const cleanReceiver = receiverName.trim() || 'Friend';
  const cleanSender = senderName.trim() || 'Sender';
  const cleanAccent = accentColor.trim() || '#FB7185';
  const copy = RIDE_COPY[language] ?? RIDE_COPY.en;

  const ringGradientId = useId();

  const [stage, setStage] = useState<RideStage>('ready');
  const [progress, setProgress] = useState<number>(0);
  const [roadOffset, setRoadOffset] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [isCoasting, setIsCoasting] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [starsCollected, setStarsCollected] = useState<number>(0);
  const [floatingStars, setFloatingStars] = useState<readonly FloatingStar[]>(INITIAL_BONUS_STARS);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const stageRef = useRef<RideStage>(stage);
  const holdingRef = useRef<boolean>(false);
  const coastingRef = useRef<boolean>(false);
  const progressRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const completedRef = useRef<boolean>(false);
  const onCompleteRef = useRef(onComplete);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noteIdxRef = useRef<number>(0);
  const nextNoteAtRef = useRef<number>(0);
  const nextStarIdRef = useRef<number>(10);
  const starTimersRef = useRef<number[]>([]);

  stageRef.current = stage;
  holdingRef.current = isHolding;
  onCompleteRef.current = onComplete;

  const checkpoints = useMemo<readonly [string, string, string, string]>(() => {
    const custom = (storyLines ?? []).map((line) => line.trim()).filter(Boolean);
    if (custom.length === 0) return copy.checkpoints;
    if (custom.length === 1) {
      return [
        copy.checkpoints[0],
        custom[0],
        copy.checkpoints[2],
        copy.checkpoints[3],
      ];
    }
    if (custom.length === 2) {
      return [
        copy.checkpoints[0],
        custom[0],
        custom[1],
        copy.checkpoints[3],
      ];
    }
    if (custom.length === 3) {
      return [
        copy.checkpoints[0],
        custom[0],
        custom[1],
        custom[2],
      ];
    }
    return [custom[0], custom[1], custom[2], custom[3]];
  }, [storyLines, copy.checkpoints]);

  const activeCheckpointIdx =
    progress >= 80 ? 3 : progress >= 50 ? 2 : progress >= 20 ? 1 : 0;
  const activeDialogue = checkpoints[activeCheckpointIdx];
  const heartsLit = progress >= 80 ? 3 : progress >= 50 ? 2 : progress >= 20 ? 1 : 0;

  // Track prefers-reduced-motion dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const ensureAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new Ctx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        void audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  const playChiptuneTone = useCallback(
    (freq: number, durationSec: number, wave: OscillatorType = 'square', volume = 0.035) => {
      if (!soundEnabled) return;
      const ctx = ensureAudioContext();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + durationSec);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + durationSec + 0.02);
      } catch {
        // Silent fallback if Web Audio is blocked
      }
    },
    [soundEnabled, ensureAudioContext],
  );

  const playFinaleArpeggio = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = ensureAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      FINALE_FANFARE.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.11;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.055, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.34);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.36);
      });
    } catch {
      // Silent fallback
    }
  }, [soundEnabled, ensureAudioContext]);

  // Trigger checkpoint chime when crossing 20%, 50%, 80%
  const prevCheckpointRef = useRef<number>(0);
  useEffect(() => {
    if (stage !== 'riding') {
      prevCheckpointRef.current = 0;
      return;
    }
    if (activeCheckpointIdx > prevCheckpointRef.current) {
      prevCheckpointRef.current = activeCheckpointIdx;
      playChiptuneTone(587.33 + activeCheckpointIdx * 65, 0.16, 'triangle', 0.045);
    }
  }, [activeCheckpointIdx, stage, playChiptuneTone]);

  const clearStarTimers = useCallback(() => {
    if (typeof window === 'undefined') return;
    starTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    starTimersRef.current = [];
  }, []);

  // Clean up audio context, timers & rAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      clearStarTimers();
      if (audioCtxRef.current) {
        void audioCtxRef.current.close().catch(() => undefined);
      }
    };
  }, [clearStarTimers]);

  const enterFinale = useCallback(() => {
    holdingRef.current = false;
    coastingRef.current = false;
    setIsHolding(false);
    setIsCoasting(false);
    setStage('finale');
    if (!completedRef.current) {
      completedRef.current = true;
      playFinaleArpeggio();
      onCompleteRef.current?.();
    }
  }, [playFinaleArpeggio]);

  // Main 60fps ride animation loop while in Stage 1 ('riding')
  useEffect(() => {
    if (stage !== 'riding') {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastFrameRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (stageRef.current !== 'riding') return;
      const last = lastFrameRef.current ?? now;
      const dt = Math.min((now - last) / 1000, 0.08);
      lastFrameRef.current = now;

      if (holdingRef.current) {
        velocityRef.current = Math.min(1, velocityRef.current + dt * 4.5);
      } else {
        velocityRef.current = Math.max(0, velocityRef.current - dt * 2.4);
      }

      const speed = velocityRef.current;
      const nextCoasting = speed > 0.04;
      if (nextCoasting !== coastingRef.current) {
        coastingRef.current = nextCoasting;
        setIsCoasting(nextCoasting);
      }

      if (speed > 0.005) {
        const nextProgress = Math.min(100, progressRef.current + speed * 21 * dt);
        progressRef.current = nextProgress;
        setProgress(nextProgress);

        if (!reducedMotion) {
          setRoadOffset((prev) => (prev + speed * 190 * dt) % 10000);
        }

        if (now >= nextNoteAtRef.current) {
          nextNoteAtRef.current = now + 220;
          const note = CRUISE_NOTES[noteIdxRef.current % CRUISE_NOTES.length];
          noteIdxRef.current += 1;
          playChiptuneTone(note, 0.14, 'square', 0.025);
        }

        if (nextProgress >= 100) {
          enterFinale();
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastFrameRef.current = null;
    };
  }, [stage, reducedMotion, playChiptuneTone, enterFinale]);

  function handleStartRide() {
    ensureAudioContext();
    playChiptuneTone(523.25, 0.14, 'triangle', 0.05);
    clearStarTimers();
    completedRef.current = false;
    coastingRef.current = false;
    prevCheckpointRef.current = 0;
    progressRef.current = 0;
    velocityRef.current = 0;
    setProgress(0);
    setRoadOffset(0);
    setIsCoasting(false);
    setStarsCollected(0);
    setFloatingStars(INITIAL_BONUS_STARS);
    setStage('riding');
  }

  function handleRideAgain() {
    handleStartRide();
  }

  function handleThrottleDown() {
    if (stageRef.current !== 'riding') return;
    ensureAudioContext();
    holdingRef.current = true;
    setIsHolding(true);

    // Immediate tap-to-boost pulse so quick taps feel snappy & never leave users stuck
    velocityRef.current = Math.max(velocityRef.current, 0.72);
    const boosted = Math.min(100, progressRef.current + 5.5);
    progressRef.current = boosted;
    setProgress(boosted);
    if (!reducedMotion) {
      setRoadOffset((prev) => (prev + 14) % 10000);
    }
    if (boosted >= 100) {
      enterFinale();
    }
  }

  function handleThrottleUp() {
    holdingRef.current = false;
    setIsHolding(false);
  }

  function handleTapBonusStar(starId: number) {
    if (stageRef.current !== 'riding') return;
    ensureAudioContext();
    playChiptuneTone(880, 0.14, 'triangle', 0.05);
    setStarsCollected((prev) => prev + 1);

    const boosted = Math.min(100, progressRef.current + 4);
    progressRef.current = boosted;
    setProgress(boosted);

    setFloatingStars((prev) =>
      prev.map((star) => (star.id === starId ? { ...star, burst: true } : star)),
    );

    const timerId = window.setTimeout(() => {
      nextStarIdRef.current += 1;
      const newId = nextStarIdRef.current;
      const lanePositions = [18, 34, 48, 62, 76];
      const nextX = lanePositions[newId % lanePositions.length];
      const nextY = 16 + ((newId * 7) % 18);
      setFloatingStars((prev) =>
        prev.map((star) =>
          star.id === starId ? { id: newId, xPct: nextX, yPct: nextY, burst: false } : star,
        ),
      );
    }, 280);
    starTimersRef.current.push(timerId);

    if (boosted >= 100) {
      enterFinale();
    }
  }

  const parallaxNearShiftPct = reducedMotion ? 0 : (roadOffset * 0.16) % 50;
  const parallaxFarShiftPct = reducedMotion ? 0 : (roadOffset * 0.06) % 50;
  const roadDashShiftPx = reducedMotion ? 0 : (roadOffset * 1.4) % 48;
  const wheelPhase = Math.floor(roadOffset / 10) % 2;

  // Radial throttle ring geometry (r = 34, circumference = 2 * pi * 34 = 213.63)
  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashOffset = ringCircumference * (1 - progress / 100);

  return (
    <section
      aria-label={`${copy.stageBadge} ${cleanReceiver}`}
      className="relative w-full max-w-full overflow-x-hidden rounded-2xl border-2 border-[#3C2B73] bg-[#0B081C] text-white shadow-[0_18px_40px_-14px_rgba(9,6,24,0.85)] select-none"
    >
      <style>{`
        @keyframes pnrTwinkle {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes pnrLampFlicker {
          0%, 92%, 100% { opacity: 1; }
          94% { opacity: 0.65; }
          96% { opacity: 0.95; }
        }
        @keyframes pnrScooterBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        @keyframes pnrFireworkPop {
          0% { opacity: 0.2; transform: scale(0.45); }
          35% { opacity: 1; transform: scale(1.1); }
          75% { opacity: 0.9; transform: scale(1); }
          100% { opacity: 0.2; transform: scale(0.45); }
        }
        .pnr-twinkle { animation: pnrTwinkle 2.4s steps(2, end) infinite; }
        .pnr-lamp-flicker { animation: pnrLampFlicker 3.6s steps(2, end) infinite; }
        .pnr-lamp-flicker-alt { animation: pnrLampFlicker 4.3s steps(2, end) infinite 0.8s; }
        .pnr-scooter-bob { animation: pnrScooterBob 0.32s steps(2, end) infinite; }
        .pnr-firework-pop { animation: pnrFireworkPop 2.2s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .pnr-twinkle,
          .pnr-lamp-flicker,
          .pnr-lamp-flicker-alt,
          .pnr-scooter-bob,
          .pnr-firework-pop {
            animation: none !important;
          }
        }
      `}</style>

      {/* Top Retro 8-Bit HUD */}
      <header className="relative z-20 border-b-2 border-[#312261] bg-[#120D2B] px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0"
              style={{ backgroundColor: cleanAccent }}
              aria-hidden="true"
            />
            <span className="truncate font-pixel text-[10px] font-bold tracking-[0.06em] text-[#FDE047]">
              PLAYER 01: {cleanReceiver.toUpperCase().slice(0, 14)}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="flex items-center gap-1" aria-label={`Hearts ${heartsLit} of 3`}>
              {[0, 1, 2].map((idx) => (
                <PixelHeartIcon
                  key={idx}
                  filled={stage === 'finale' ? true : idx < heartsLit}
                  accentColor={cleanAccent}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              aria-pressed={soundEnabled}
              aria-label={soundEnabled ? copy.soundOn : copy.soundOff}
              className="ml-1 inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 border border-[#453380] bg-[#1B143D] px-2 font-pixel text-[9px] font-bold text-[#E2E8F0] transition hover:border-[#FDE047] active:translate-y-0.5"
            >
              <PixelSpeakerIcon muted={!soundEnabled} />
              <span className="hidden sm:inline">
                {soundEnabled ? copy.soundOn : copy.soundOff}
              </span>
            </button>
          </div>
        </div>

        {/* Live RIDE Meter Bar */}
        <div className="mt-1.5 flex items-center gap-2">
          <span className="shrink-0 font-pixel text-[9px] font-bold tracking-[0.08em] text-[#67E8F9]">
            {copy.rideLabel}
          </span>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label={copy.rideLabel}
            className="relative h-3.5 flex-1 overflow-hidden border border-[#453380] bg-[#090617] p-0.5"
          >
            <div
              className="h-full transition-[width] duration-75"
              style={{
                width: `${stage === 'finale' ? 100 : Math.max(0, Math.min(100, progress))}%`,
                background: `linear-gradient(90deg, ${cleanAccent} 0%, #FDE047 100%)`,
              }}
            />
            {/* Checkpoint pips at 20%, 50%, 80% */}
            {[20, 50, 80].map((pip) => (
              <span
                key={pip}
                aria-hidden="true"
                className="absolute top-0 bottom-0 w-0.5 bg-[#120D2B]/80"
                style={{ left: `${pip}%` }}
              />
            ))}
          </div>
          <span className="w-10 shrink-0 text-right font-pixel text-[9px] font-bold tabular-nums text-[#FEF08A]">
            {stage === 'finale' ? '100%' : `${Math.round(progress)}%`}
          </span>
          {starsCollected > 0 ? (
            <span className="inline-flex shrink-0 items-center gap-1 border border-[#FACC15]/50 bg-[#271C4D] px-1.5 py-0.5 font-pixel text-[8px] font-bold text-[#FEF08A]">
              {copy.starsLabel}: {starsCollected}
            </span>
          ) : null}
        </div>
      </header>

      {/* Main Pixel Viewport */}
      <div
        className="relative flex min-h-[340px] w-full flex-col justify-between overflow-hidden sm:min-h-[370px]"
        style={{
          background:
            'linear-gradient(180deg, #09071A 0%, #161036 48%, #28194E 80%, #37205E 100%)',
        }}
      >
        {/* Starfield & Pixel Moon */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {SKY_STAR_COORDS.map((star, idx) => (
            <span
              key={idx}
              className={`absolute bg-[#FEF9C3] ${reducedMotion ? '' : 'pnr-twinkle'}`}
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: star.delay,
              }}
            />
          ))}

          <div className="absolute top-4 right-5 sm:right-8">
            <PixelMoon />
          </div>
        </div>

        {/* Stage 1 & Stage 0 Skyline + Road */}
        {stage !== 'finale' ? (
          <>
            {/* Top Dialogue / Stage Prompt Area */}
            <div className="relative z-20 px-3 pt-3">
              {stage === 'riding' ? (
                <div className="mx-auto max-w-md border-2 border-[#67E8F9]/75 bg-[#120C2B]/95 px-3 py-2 shadow-[0_4px_0_#070414]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-pixel text-[8px] font-bold uppercase tracking-[0.1em] text-[#67E8F9]">
                      {copy.speakerTag} · 0{activeCheckpointIdx + 1}/04
                    </span>
                    <span
                      className="font-pixel text-[8px] font-bold uppercase tracking-wider"
                      style={{ color: cleanAccent }}
                    >
                      {cleanSender.slice(0, 14)}
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-xs font-semibold leading-snug text-[#F8FAFC] sm:text-[13px]">
                    {activeDialogue}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Interactive Floating Bonus Stars during Stage 1 ('riding') */}
            {stage === 'riding' ? (
              <div className="relative z-20 h-16 w-full">
                {floatingStars.map((star) => (
                  <button
                    key={star.id}
                    type="button"
                    onClick={() => handleTapBonusStar(star.id)}
                    aria-label={copy.tapStarAria}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-transform active:scale-125 ${
                      star.burst ? 'scale-125 opacity-0' : 'hover:scale-110'
                    }`}
                    style={{ left: `${star.xPct}%`, top: `${star.yPct + 35}%` }}
                  >
                    <PixelStarSprite bright={star.burst} />
                  </button>
                ))}
              </div>
            ) : null}

            {/* Stage 0 Ready Card */}
            {stage === 'ready' ? (
              <div className="relative z-20 mx-auto my-auto w-[calc(100%-24px)] max-w-sm border-2 border-[#FDE047] bg-[#130E2E]/95 p-4 text-center shadow-[0_6px_0_#060412]">
                <p className="font-pixel text-[9px] font-bold uppercase tracking-[0.14em] text-[#67E8F9]">
                  {copy.stageBadge}
                </p>
                <h2 className="mt-2 break-words font-pixel text-sm font-bold leading-snug tracking-wide text-[#FEF08A] sm:text-base">
                  NIGHT RIDE // FOR {cleanReceiver.toUpperCase()}
                </h2>
                <p className="mt-2 font-sans text-xs leading-relaxed text-[#E2E8F0]/90">
                  {copy.readySub}
                </p>
                <button
                  type="button"
                  onClick={handleStartRide}
                  className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center border-2 border-[#FEF9C3] px-5 font-pixel text-xs font-bold uppercase tracking-[0.14em] text-[#0B081C] shadow-[0_4px_0_#7F1D1D] transition active:translate-y-0.5 active:shadow-[0_2px_0_#7F1D1D]"
                  style={{ backgroundColor: cleanAccent }}
                >
                  {copy.startBtn}
                </button>
              </div>
            ) : null}

            {/* Parallax Skyline & Purple Brick Road */}
            <div className="relative mt-auto w-full">
              {/* Far Skyline Silhouette Layer */}
              <div
                aria-hidden="true"
                className="pointer-events-none relative h-20 w-[200%] overflow-hidden opacity-60"
                style={{
                  transform: `translate3d(-${parallaxFarShiftPct}%, 0, 0)`,
                }}
              >
                <div className="flex h-full w-full items-end">
                  {[0, 1].map((dup) => (
                    <div key={dup} className="flex h-full w-1/2 items-end justify-around px-1">
                      <div className="h-14 w-9 bg-[#1A133B]" />
                      <div className="h-20 w-12 bg-[#21184A]" />
                      <div className="h-12 w-10 bg-[#181137]" />
                      <div className="h-16 w-14 bg-[#22194D]" />
                      <div className="h-11 w-8 bg-[#191238]" />
                      <div className="h-18 w-11 bg-[#201748]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Near Street Layer: CHAI & MOMOS stalls + Flickering Streetlamps */}
              <div
                aria-hidden="true"
                className="pointer-events-none relative z-10 -mt-10 h-28 w-[200%]"
                style={{
                  transform: `translate3d(-${parallaxNearShiftPct}%, 0, 0)`,
                }}
              >
                <div className="flex h-full w-full items-end">
                  <PixelStreetSegment accentColor={cleanAccent} reducedMotion={reducedMotion} />
                  <PixelStreetSegment accentColor={cleanAccent} reducedMotion={reducedMotion} />
                </div>
              </div>

              {/* Sidewalk Curb */}
              <div
                aria-hidden="true"
                className="relative z-10 h-2.5 w-full border-y border-[#6B4CA8] bg-[#432B73]"
              />

              {/* Purple Brick Road + Scooter */}
              <div className="relative z-10 h-20 w-full overflow-hidden bg-[#2C1A4D]">
                {/* Staggered purple brick texture */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-45"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, rgba(167,139,250,0.22) 2px, transparent 2px), linear-gradient(0deg, rgba(167,139,250,0.2) 2px, transparent 2px)',
                    backgroundSize: '24px 12px',
                    backgroundPosition: `-${roadDashShiftPx}px 0px`,
                  }}
                />

                {/* Scrolling dashed center lane */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-0 left-0 h-1.5 -translate-y-1/2"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, #FDE047 0px, #FDE047 22px, transparent 22px, transparent 48px)',
                    backgroundPosition: `-${roadDashShiftPx}px 0px`,
                  }}
                />

                {/* Pixel Scooter & Rider positioned cleanly on left-center */}
                <div className="absolute bottom-3 left-6 sm:left-12">
                  <PixelScooterRider
                    accentColor={cleanAccent}
                    isMoving={stage === 'riding' && (isHolding || isCoasting)}
                    wheelPhase={wheelPhase}
                    reducedMotion={reducedMotion}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Stage 2: Balcony Fireworks Finale */
          <div className="relative flex flex-1 flex-col justify-between">
            {/* Softly bursting pixel fireworks over moonlit skyline */}
            <div className="pointer-events-none relative h-28 w-full" aria-hidden="true">
              {FIREWORK_BURSTS.map((fw, idx) => (
                <div
                  key={idx}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${fw.xPct}%`, top: `${fw.yPct + 35}%` }}
                >
                  <PixelFireworkCluster
                    color={fw.color}
                    secondary={fw.secondary}
                    delay={fw.delay}
                    reducedMotion={reducedMotion}
                  />
                </div>
              ))}
            </div>

            {/* Celebratory Banner Card */}
            <div className="relative z-20 mx-auto my-2 w-[calc(100%-24px)] max-w-sm border-2 border-[#FDE047] bg-[#140E30]/95 px-4 py-3.5 text-center shadow-[0_6px_0_#070414]">
              <p className="font-pixel text-[9px] font-bold uppercase tracking-[0.14em] text-[#67E8F9]">
                {copy.finaleTag}
              </p>
              <h2 className="mt-1.5 break-words font-pixel text-sm font-bold tracking-wide text-[#FEF08A] sm:text-base">
                {cleanReceiver} · Always
              </h2>
              <p className="mt-1.5 font-sans text-xs leading-relaxed text-[#E2E8F0]">{copy.finaleNote}</p>
              <p
                className="mt-2 font-pixel text-[10px] font-bold tracking-wider"
                style={{ color: cleanAccent }}
              >
                {copy.signedBy} {cleanSender}
              </p>

              <button
                type="button"
                onClick={handleRideAgain}
                className="mt-3 inline-flex min-h-[48px] min-w-[44px] items-center justify-center border-2 border-[#FEF9C3] px-5 font-pixel text-[11px] font-bold uppercase tracking-[0.12em] text-[#0B081C] shadow-[0_4px_0_#7F1D1D] transition active:translate-y-0.5 active:shadow-[0_2px_0_#7F1D1D]"
                style={{ backgroundColor: cleanAccent }}
              >
                {copy.rideAgain}
              </button>
            </div>

            {/* Balcony Railing, Wall Lanterns & Flower Pots Foreground */}
            <div className="relative mt-auto w-full pt-2">
              <div className="flex items-end justify-between px-3 pb-0.5">
                <div className="flex items-end gap-2">
                  <PixelWallLantern reducedMotion={reducedMotion} />
                  <PixelFlowerPot accentColor={cleanAccent} />
                </div>
                <div className="flex items-end gap-2">
                  <PixelFlowerPot accentColor={cleanAccent} />
                  <PixelWallLantern reducedMotion={reducedMotion} />
                </div>
              </div>

              {/* Pixel balcony wrought-iron balustrade */}
              <div
                aria-hidden="true"
                className="h-3 w-full border-y-2 border-[#6D55B8] bg-[#36246B]"
              />
              <div
                aria-hidden="true"
                className="h-9 w-full bg-[#1C123B]"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(90deg, #4B368F 0px, #4B368F 6px, transparent 6px, transparent 22px)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stage 1 Bottom Tactile Throttle Control Deck */}
      {stage === 'riding' ? (
        <div className="relative z-20 flex flex-col items-center justify-center gap-2 border-t-2 border-[#312261] bg-[#120D2B] px-3 py-3">
          <div className="relative flex items-center justify-center">
            {/* Glowing SVG Radial Throttle Ring */}
            <svg
              viewBox="0 0 80 80"
              className="pointer-events-none h-20 w-20 -rotate-90"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={ringGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={cleanAccent} />
                  <stop offset="100%" stopColor="#FDE047" />
                </linearGradient>
              </defs>
              <circle
                cx="40"
                cy="40"
                r={ringRadius}
                fill="none"
                stroke="#2A1E52"
                strokeWidth="6"
              />
              <circle
                cx="40"
                cy="40"
                r={ringRadius}
                fill="none"
                stroke={`url(#${ringGradientId})`}
                strokeWidth="6"
                strokeLinecap="square"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringDashOffset}
              />
            </svg>

            <button
              type="button"
              onPointerDown={handleThrottleDown}
              onPointerUp={handleThrottleUp}
              onPointerLeave={handleThrottleUp}
              onPointerCancel={handleThrottleUp}
              onKeyDown={(e) => {
                if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                  e.preventDefault();
                  handleThrottleDown();
                }
              }}
              onKeyUp={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleThrottleUp();
                }
              }}
              onContextMenu={(e) => e.preventDefault()}
              aria-pressed={isHolding}
              aria-label={copy.holdToRide}
              style={{
                touchAction: 'none',
                backgroundColor: isHolding ? '#FDE047' : cleanAccent,
                boxShadow: isHolding
                  ? `0 0 22px ${cleanAccent}`
                  : `0 0 12px ${cleanAccent}80`,
              }}
              className="absolute inline-flex min-h-[64px] min-w-[64px] items-center justify-center rounded-full border-2 border-[#FEF9C3] font-pixel text-[9px] font-bold uppercase tracking-wider text-[#0B081C] transition-transform active:scale-95"
            >
              {isHolding ? 'GO!' : 'RIDE'}
            </button>
          </div>

          <div className="text-center">
            <p className="font-pixel text-[10px] font-bold uppercase tracking-[0.1em] text-[#FEF08A]">
              {isHolding ? copy.throttleActive : copy.holdToRide}
            </p>
            <p className="mt-0.5 font-sans text-[11px] text-[#CBD5E1]/85">{copy.ridingHint}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
