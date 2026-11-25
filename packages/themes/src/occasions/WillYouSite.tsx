'use client';

import React, { useEffect, useId, useState } from 'react';
import { type CoreLanguageCode, pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  OccasionArtworkBackdrop,
  OccasionCassettePlayer,
  OccasionChapterNav,
  OccasionPhotoGallery,
  type OccasionSiteProps,
  getReplayLabel,
  getWebzyFooterLabel,
} from './shared/OccasionPrimitives';

type WillYouChapterId = 'note' | 'dateplan' | 'question';

interface DateOption {
  id: string;
  title: Record<CoreLanguageCode, string>;
  subtitle: Record<CoreLanguageCode, string>;
}

const DATE_OPTIONS: readonly DateOption[] = [
  {
    id: 'coffee',
    title: {
      hinglish: 'Coffee & Croissant',
      hi: 'कॉफ़ी और पेस्ट्री',
      en: 'Coffee & Sunset Walk',
    },
    subtitle: {
      hinglish: 'Cozy cafe corners aur lambi baatein',
      hi: 'शाम की कॉफ़ी और सुकून भरी बातें',
      en: 'Warm cups and unhurried evening talks',
    },
  },
  {
    id: 'chai',
    title: {
      hinglish: 'Adrak Chai & Long Drive',
      hi: 'अदरक चाय और लॉन्ग ड्राइव',
      en: 'Chai & Evening Drive',
    },
    subtitle: {
      hinglish: 'Tumhari playlist aur sunset skies',
      hi: 'तुम्हारी पसंदीदा प्लेलिस्ट और खुला आसमान',
      en: 'Favorite playlist and golden skies',
    },
  },
  {
    id: 'stargaze',
    title: {
      hinglish: 'Rooftop Dinner Under Stars',
      hi: 'सितारों के नीचे डिनर',
      en: 'Stargazing & Dessert',
    },
    subtitle: {
      hinglish: 'Warm lights, sweet treats aur sirf hum',
      hi: 'रोशनी, मीठा और बस हम दोनों',
      en: 'Lantern lights and late-night dessert',
    },
  },
];

interface LocalizedCopy {
  coverHeader: string;
  toPrefix: string;
  fromLabel: string;
  slideRosePrompt: string;
  tapOpenFallback: string;
  tabs: Record<WillYouChapterId, string>;
  cupidEyebrow: string;
  cupidAimBtn: string;
  cupidUnlocked: string;
  momentEyebrow: string;
  datePickerHeading: string;
  askTitle: string;
  askIdlePrompt: string;
  yesCta: string;
  noCta: string;
  nudges: string[];
  stampText: string;
  acceptedHeading: (receiver: string) => string;
  acceptedSubtext: (sender: string) => string;
  guestLabel: string;
  hostLabel: string;
  planLabel: string;
  passLabel: string;
  replayQuestionCta: string;
  photoCaption: string;
}

const COPY_BY_LANG: Record<CoreLanguageCode, LocalizedCopy> = {
  hinglish: {
    coverHeader: 'Kuch Dil Se Kehna Tha',
    toPrefix: 'To:',
    fromLabel: 'From:',
    slideRosePrompt: 'Slide the rose to open →',
    tapOpenFallback: 'Tap to Unseal',
    tabs: {
      note: 'Love Note',
      dateplan: 'Date Plan',
      question: 'The Question',
    },
    cupidEyebrow: 'CUPID INTERACTIVE',
    cupidAimBtn: 'Tap Bow to Aim & Light Heart',
    cupidUnlocked: 'Heart Unlocked · Read Note',
    momentEyebrow: 'Hamara Lamha',
    datePickerHeading: 'Chuno hum kahan chalein:',
    askTitle: 'Ek dil se sawaal...',
    askIdlePrompt: 'Kya tum mere saath ek khaas shaam bitaoge?',
    yesCta: 'Haan, bilkul!',
    noCta: 'Sochna padega',
    nudges: [
      'Soch lo! Coffee aur croissant meri taraf se!',
      'Adrak wali chai + sunset walk bhi pakki!',
      'Dekho Haan wala button kitna glow kar raha hai...',
      'Itna mat socho, ek pyaari si Haan bol do!',
    ],
    stampText: "CONFIRMED · IT'S A DATE",
    acceptedHeading: (receiver) => `Yay! It is a date, ${receiver}!`,
    acceptedSubtext: (sender) => `${sender} ke chehre par abhi sabse badi smile aa gayi hai.`,
    guestLabel: 'Guest',
    hostLabel: 'Host',
    planLabel: 'Chosen Plan',
    passLabel: 'Pass Serial',
    replayQuestionCta: 'Change Date / Replay',
    photoCaption: 'Yaad',
  },
  hi: {
    coverHeader: 'दिल से एक बात कहनी थी',
    toPrefix: 'प्रिय:',
    fromLabel: 'प्रेषक:',
    slideRosePrompt: 'खोलने के लिए गुलाब स्लाइड करें →',
    tapOpenFallback: 'टैप करके खोलें',
    tabs: {
      note: 'दिल का पैगाम',
      dateplan: 'डेट प्लान',
      question: 'खास सवाल',
    },
    cupidEyebrow: 'कपिल देव का तीर',
    cupidAimBtn: 'दिल रोशन करने के लिए टैप करें',
    cupidUnlocked: 'दिल अनलॉक हुआ',
    momentEyebrow: 'हमारा लम्हा',
    datePickerHeading: 'अपना पसंदीदा प्लान चुनें:',
    askTitle: 'दिल से एक छोटा सा सवाल...',
    askIdlePrompt: 'क्या तुम मेरे साथ एक प्यारी शाम बिताओगे?',
    yesCta: 'हाँ बिल्कुल!',
    noCta: 'सोचना पड़ेगा',
    nudges: [
      'सोच लो! कॉफ़ी और पेस्ट्री मेरी तरफ़ से!',
      'अदरक वाली चाय और शाम की सैर भी पक्की!',
      'देखो हाँ वाला बटन कितना चमक रहा है...',
      'अब तो मुस्कुराकर हाँ कह ही दो!',
    ],
    stampText: "CONFIRMED · IT'S A DATE",
    acceptedHeading: (receiver) => `शुक्रिया, ${receiver}!`,
    acceptedSubtext: (sender) => `${sender} का दिन आज सच में बन गया है।`,
    guestLabel: 'मेहमान',
    hostLabel: 'मेज़बान',
    planLabel: 'डेट प्लान',
    passLabel: 'पास क्रमांक',
    replayQuestionCta: 'फिर से देखें',
    photoCaption: 'याद',
  },
  en: {
    coverHeader: 'Something I needed to say',
    toPrefix: 'To:',
    fromLabel: 'From:',
    slideRosePrompt: 'Slide the rose to open →',
    tapOpenFallback: 'Or tap envelope to open',
    tabs: {
      note: 'Love Note',
      dateplan: 'Date Plan',
      question: 'The Ask',
    },
    cupidEyebrow: 'SWEET MOMENT',
    cupidAimBtn: 'Tap Bow to Light the Heart',
    cupidUnlocked: 'Heart Lit · Made For You',
    momentEyebrow: 'Our Moment',
    datePickerHeading: 'Pick our evening vibe:',
    askTitle: 'Will you go out with me?',
    askIdlePrompt: 'Say yes to an unhurried evening together.',
    yesCta: "Yes, let's go!",
    noCta: 'Maybe later',
    nudges: [
      'Are you sure? Coffee and pastry are on me!',
      'Plus a sunset walk and your favorite dessert!',
      'Notice how that Yes button is glowing for you...',
      'One tap makes this whole evening unforgettable!',
    ],
    stampText: "CONFIRMED · IT'S A DATE",
    acceptedHeading: (receiver) => `It is a date, ${receiver}!`,
    acceptedSubtext: (sender) => `${sender} just smiled from ear to ear.`,
    guestLabel: 'Guest',
    hostLabel: 'Host',
    planLabel: 'Chosen Plan',
    passLabel: 'Pass Serial',
    replayQuestionCta: 'Replay Question',
    photoCaption: 'Memory',
  },
};

function RoseBloomSvg() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="13" fill="#FFF1F2" stroke="#E11D63" strokeWidth="1.3" />
      <path d="M16 7c3.8 0 6.5 2.8 6.5 6.3 0 4.2-3.4 7.7-6.5 7.7s-6.5-3.5-6.5-7.7C9.5 9.8 12.2 7 16 7Z" fill="#FB7185" />
      <path d="M16 9.5c2 0 3.5 1.5 3.5 3.4 0 2.1-1.7 3.8-3.5 3.8s-3.5-1.7-3.5-3.8c0-1.9 1.5-3.4 3.5-3.4Z" fill="#E11D63" />
      <path d="M16 21v4.5M12 22c1.5.5 2.5 1.5 4 2M20 22c-1.5.5-2.5 1.5-4 2" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CupidBowHeartStage({
  hit,
  onShoot,
  label,
}: {
  hit: boolean;
  onShoot: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onShoot}
      aria-pressed={hit}
      className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-[#E8B4B8]/40 bg-[#1B0E24] px-4 py-3 text-left transition hover:border-[#FB7185]"
    >
      {/* Bow SVG left */}
      <svg viewBox="0 0 48 48" className="h-11 w-11 shrink-0 text-[#E8B4B8] transition group-hover:scale-105" fill="none" aria-hidden="true">
        <path d="M16 8 C30 14, 30 34, 16 40" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="16" y1="8" x2="16" y2="40" stroke="#FDE68A" strokeWidth="1.2" />
        <path
          d={hit ? 'M22 24 L42 24' : 'M12 24 L30 24'}
          stroke="#FB7185"
          strokeWidth="2"
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>

      <div className="min-w-0 flex-1 px-3 text-center">
        <span className="block font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#E8B4B8]">
          {label}
        </span>
      </div>

      {/* Pierced Heart right */}
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center" aria-hidden="true">
        {hit ? <span className="absolute inset-0 rounded-full bg-[#E11D63]/45 blur-md animate-pulse" /> : null}
        <svg viewBox="0 0 28 28" className={`relative h-8 w-8 transition-transform duration-300 ${hit ? 'scale-115 text-[#FB7185]' : 'text-[#E8B4B8]/65'}`} fill="currentColor">
          <path d="M14 24.35l-1.45-1.32C6.4 17.36 3 14.28 3 10.5 3 7.42 5.42 5 8.5 5c1.74 0 3.41.81 4.5 2.09C14.09 5.81 15.76 5 17.5 5 20.58 5 23 7.42 23 10.5c0 3.78-3.4 6.86-8.55 11.54L14 24.35z" />
        </svg>
      </div>
    </button>
  );
}

function BarcodeStub() {
  const widths = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 2, 1, 2, 1, 3, 1, 2];
  return (
    <div className="flex h-7 items-stretch justify-center gap-[2px] opacity-65" aria-hidden="true">
      {widths.map((w, idx) => (
        <span key={idx} className="rounded-[0.5px] bg-[#2B1B2E]" style={{ width: `${w}px` }} />
      ))}
    </div>
  );
}

/**
 * Multi-stage Romantic Proposal microsite featuring the textured rose-wax envelope
 * with interactive "Slide the rose to open ->" slider, Cupid bow stage, date picker, and Date Pass ticket.
 */
export function WillYouSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const [opened, setOpened] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState<WillYouChapterId>('note');
  const [cupidHit, setCupidHit] = useState(true);
  const [selectedDateId, setSelectedDateId] = useState<string>('coffee');
  const [accepted, setAccepted] = useState(false);
  const [nudgeCount, setNudgeCount] = useState(0);
  const sliderId = useId();

  const coreLang = toCoreLanguageCode(language);
  const copy = COPY_BY_LANG[coreLang] ?? COPY_BY_LANG.en;
  const senderInitial = (data.senderName || 'A').trim().charAt(0).toUpperCase() || 'A';
  const receiverInitial = (data.receiverName || 'B').trim().charAt(0).toUpperCase() || 'B';
  const passSerial = `WY-2026-${senderInitial}${receiverInitial}`;
  const musicLabel = manifest.music[0]?.label || 'Soft Piano Blush';
  const chosenDateObj = DATE_OPTIONS.find((d) => d.id === selectedDateId) ?? DATE_OPTIONS[0];

  useEffect(() => {
    if (slideProgress >= 88 && !opened) {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(30);
      }
      setOpened(true);
      onOpened?.();
    }
  }, [slideProgress, opened, onOpened]);

  function handleQuickOpen() {
    setSlideProgress(100);
    setOpened(true);
    onOpened?.();
  }

  function handleReplayCover() {
    setAccepted(false);
    setNudgeCount(0);
    setSlideProgress(0);
    setActiveChapter('note');
    setOpened(false);
  }

  const dodgeOffsets = [
    { x: 0, y: 0 },
    { x: 10, y: -3 },
    { x: -10, y: 2 },
    { x: 8, y: 3 },
  ];
  const currentDodge = dodgeOffsets[nudgeCount % dodgeOffsets.length];
  const yesScale = Math.min(1.12, 1 + nudgeCount * 0.03);
  const glowSpread = Math.min(28, 12 + nudgeCount * 4);

  if (!opened) {
    return (
      <div className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#1A0B24] text-[#FFF1F2]">
        <OccasionArtworkBackdrop
          src="/templates/occasions/will-you/cover.jpg"
          fallbackGradient="radial-gradient(circle at 50% 25%, #3B123F 0%, #1A0B24 72%, #110617 100%)"
          className="object-cover object-center opacity-45"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1A0B24]/70 via-[#1A0B24]/55 to-[#1A0B24]/92"
        />

        {watermarked ? (
          <div
            aria-hidden="true"
            className="relative z-20 flex justify-center bg-[#2B1B2E]/90 py-1 text-[10px] font-bold tracking-widest text-[#E8B4B8]"
          >
            WEBZY FREE PREVIEW
          </div>
        ) : null}

        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-7 text-center">
          <p className="font-heading text-lg italic tracking-wide text-[#FDE68A] sm:text-xl">
            {copy.coverHeader}
          </p>

          {/* Linen Textured Envelope with Crimson Wax Seal & Rose Blossom */}
          <div
            onClick={handleQuickOpen}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleQuickOpen();
              }
            }}
            className="relative my-6 w-full max-w-[300px] cursor-pointer overflow-hidden rounded-2xl border border-[#F5E6D3]/60 bg-gradient-to-br from-[#F7E7DA] via-[#EFE0D2] to-[#E6D0BF] px-5 pb-6 pt-12 text-center text-[#3A1E28] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.65)] transition hover:scale-[1.015]"
          >
            {/* V-shaped Envelope Flap */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-16 border-b border-[#D6BA9E]/60 bg-gradient-to-b from-[#FAF0E6]/90 to-[#EED9C7]/60"
              style={{ clipPath: 'polygon(0 0, 100% 0, 50% 95%)' }}
            />

            {/* Crimson Wax Seal Center */}
            <div
              aria-hidden="true"
              className="relative z-10 mx-auto -mt-4 mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#FCA5A5]/45 bg-gradient-to-br from-[#DC2626] via-[#B91C1C] to-[#7F1D1D] font-heading text-xs font-bold text-white shadow-md"
            >
              {senderInitial}&amp;{receiverInitial}
            </div>

            <p className="font-heading text-xl font-bold italic text-[#2B1B2E]">
              {copy.toPrefix} {data.receiverName}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#5E3A47]">
              {copy.fromLabel} {data.senderName}
            </p>
          </div>

          {/* Signature "Slide the rose to open ->" Draggable Pill */}
          <div className="w-full max-w-[300px] space-y-2">
            <div className="relative flex h-14 items-center rounded-full border border-[#FDE68A]/35 bg-[#261233]/90 px-2 shadow-[inset_0_2px_8px_rgba(0,0,0,0.45)]">
              <label htmlFor={sliderId} className="sr-only">
                {copy.slideRosePrompt}
              </label>

              <span
                className="pointer-events-none flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-md transition-transform duration-75"
                style={{
                  transform: `translateX(${(slideProgress / 100) * 212}px)`,
                }}
              >
                <RoseBloomSvg />
              </span>

              <span className="pointer-events-none absolute inset-x-0 text-center font-heading text-xs italic tracking-wide text-[#FDE68A]/90">
                {copy.slideRosePrompt}
              </span>

              <input
                id={sliderId}
                type="range"
                min={0}
                max={100}
                value={slideProgress}
                onChange={(e) => setSlideProgress(Number(e.target.value))}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
            </div>

            <button
              type="button"
              onClick={handleQuickOpen}
              className="text-[11px] font-medium text-[#E8B4B8]/80 underline underline-offset-4 hover:text-[#FFF1F2]"
            >
              {copy.tapOpenFallback}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#1A0B24] text-[#2B1B2E] animate-fade-in">
        {watermarked ? (
          <div
            aria-hidden="true"
            className="relative z-10 flex justify-center bg-[#2B1B2E] py-1 text-[10px] font-bold tracking-widest text-[#E8B4B8]"
          >
            WEBZY FREE PREVIEW
          </div>
        ) : null}

        <div className="relative z-10 flex items-center justify-end px-4 pt-3.5">
          <button
            type="button"
            onClick={handleReplayCover}
            className="inline-flex min-h-[40px] items-center rounded-full border border-[#E8B4B8]/40 bg-[#2B1B2E]/90 px-4 text-xs font-semibold text-[#FFF1F2]"
          >
            {getReplayLabel(language)}
          </button>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-4 py-3">
          <div className="relative overflow-hidden rounded-3xl border border-[#E8B4B8]/70 bg-[#FFF1F2] p-5 shadow-2xl animate-pop-bounce">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFE4E8] text-[#E11D63]" aria-hidden="true">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </span>
              <span className="inline-block -rotate-6 rounded-md border-2 border-double border-[#E11D63] bg-[#FFF1F2] px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.14em] text-[#E11D63]">
                {copy.stampText}
              </span>
            </div>

            <h3 className="break-words font-heading text-2xl font-bold leading-snug text-[#E11D63]">
              {copy.acceptedHeading(data.receiverName)}
            </h3>
            <p className="mt-1 break-words text-sm text-[#2B1B2E]/80">
              {copy.acceptedSubtext(data.senderName)}
            </p>

            <div className="mt-4 space-y-2 rounded-2xl border border-[#E8B4B8]/55 bg-white/85 p-3.5 text-left text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold uppercase tracking-wider text-[#2B1B2E]/55">{copy.guestLabel}</span>
                <span className="break-words text-right font-bold text-[#2B1B2E]">{data.receiverName}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold uppercase tracking-wider text-[#2B1B2E]/55">{copy.hostLabel}</span>
                <span className="break-words text-right font-bold text-[#2B1B2E]">{data.senderName}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold uppercase tracking-wider text-[#2B1B2E]/55">{copy.planLabel}</span>
                <span className="text-right font-bold text-[#E11D63]">{chosenDateObj.title[coreLang]}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold uppercase tracking-wider text-[#2B1B2E]/55">{copy.passLabel}</span>
                <span className="font-mono font-bold tracking-wider text-[#2B1B2E]">{passSerial}</span>
              </div>
            </div>

            <div className="relative my-4 flex items-center" aria-hidden="true">
              <span className="-ml-8 h-6 w-6 shrink-0 rounded-full bg-[#1A0B24]" />
              <span className="w-full border-t-2 border-dashed border-[#E8B4B8]" />
              <span className="-mr-8 h-6 w-6 shrink-0 rounded-full bg-[#1A0B24]" />
            </div>

            <div className="flex flex-col items-center gap-3 pt-1">
              <BarcodeStub />
              <button
                type="button"
                onClick={() => {
                  setAccepted(false);
                  setNudgeCount(0);
                }}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#E11D63]/35 bg-white px-5 py-2 text-xs font-bold text-[#E11D63] transition hover:bg-[#FFF5F8]"
              >
                {copy.replayQuestionCta}
              </button>
            </div>
          </div>
        </div>

        <footer className="relative z-10 border-t border-[#E8B4B8]/20 px-4 py-2.5 text-center text-[11px] text-[#E8B4B8]/80">
          {getWebzyFooterLabel(language)}
        </footer>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#1A0B24] text-[#FFF1F2] animate-fade-in">
      {watermarked ? (
        <div
          aria-hidden="true"
          className="relative z-10 flex justify-center bg-[#2B1B2E] py-1 text-[10px] font-bold tracking-widest text-[#E8B4B8]"
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      <div className="relative z-10 space-y-2.5 px-4 pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-[#E8B4B8]/35 bg-[#2B1B2E]/90 px-3 py-1 text-[11px] font-medium text-[#E8B4B8]">
            <span>{data.senderName} → {data.receiverName}</span>
          </span>

          <button
            type="button"
            onClick={handleReplayCover}
            className="inline-flex min-h-[40px] items-center rounded-full border border-[#E8B4B8]/35 bg-[#2B1B2E]/90 px-3.5 text-xs font-semibold text-[#FFF1F2]"
          >
            {getReplayLabel(language)}
          </button>
        </div>

        <OccasionChapterNav
          tabs={[
            { id: 'note', label: copy.tabs.note },
            { id: 'dateplan', label: copy.tabs.dateplan },
            { id: 'question', label: copy.tabs.question },
          ]}
          activeId={activeChapter}
          onSelect={(id) => setActiveChapter(id as WillYouChapterId)}
          accentColor="#E11D63"
          dark
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center gap-3 px-4 py-3">
        {activeChapter === 'note' ? (
          <div className="space-y-3 animate-fade-in">
            <CupidBowHeartStage
              hit={cupidHit}
              onShoot={() => setCupidHit((v) => !v)}
              label={cupidHit ? copy.cupidUnlocked : copy.cupidAimBtn}
            />

            <section className="rounded-2xl border border-[#E8B4B8]/70 bg-[#FFF1F2] p-4 text-center text-[#2B1B2E] shadow-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E11D63]">
                {copy.momentEyebrow}
              </p>
              <h2 className="mt-1.5 break-words font-heading text-xl font-bold text-[#2B1B2E]">
                {pickLocalizedText(data.headline, language)}
              </h2>
              <p className="mt-2 break-words text-sm leading-relaxed text-[#2B1B2E]/85">
                {pickLocalizedText(data.message, language)}
              </p>

              {data.photos && data.photos.length > 0 ? (
                <OccasionPhotoGallery
                  photos={data.photos}
                  accentColor="#E11D63"
                  surfaceTint="#FFF1F2"
                  captionPrefix={copy.photoCaption}
                  variant="polaroid"
                />
              ) : null}
            </section>

            <OccasionCassettePlayer
              trackTitle={musicLabel}
              mood="romantic"
              tapLabel="Tap for Romantic Melody"
              playingLabel="Playing Soft Piano..."
              accentColor="#E11D63"
            />
          </div>
        ) : null}

        {activeChapter === 'dateplan' ? (
          <div className="space-y-2.5 rounded-2xl border border-[#E8B4B8]/35 bg-[#2B1B2E]/95 p-4 animate-fade-in">
            <p className="text-xs font-bold text-[#FDE68A]">{copy.datePickerHeading}</p>
            <div className="space-y-2">
              {DATE_OPTIONS.map((opt) => {
                const isSelected = selectedDateId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedDateId(opt.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-[#FB7185] bg-[#E11D63]/20 text-white shadow-sm'
                        : 'border-white/15 bg-white/5 text-[#FFF1F2]/85 hover:border-white/30'
                    }`}
                  >
                    <p className="text-sm font-bold">{opt.title[coreLang]}</p>
                    <p className="mt-0.5 text-xs text-[#E8B4B8]/90">{opt.subtitle[coreLang]}</p>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setActiveChapter('question')}
              className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#E11D63] text-xs font-bold text-white"
            >
              {copy.tabs.question} →
            </button>
          </div>
        ) : null}

        {activeChapter === 'question' ? (
          <section className="rounded-3xl border border-[#FB7185]/45 bg-[#2B1B2E] p-5 text-center shadow-xl animate-fade-in">
            <span className="inline-block rounded-full border border-[#FDE68A]/35 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FDE68A]">
              {chosenDateObj.title[coreLang]}
            </span>

            <p className="mt-3 font-heading text-2xl font-bold text-[#FFF1F2]">{copy.askTitle}</p>

            <p
              key={nudgeCount}
              className="mt-2 min-h-[20px] text-xs font-semibold text-[#FB7185] animate-fade-in"
            >
              {nudgeCount > 0 ? copy.nudges[(nudgeCount - 1) % copy.nudges.length] : copy.askIdlePrompt}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setAccepted(true)}
                style={{
                  transform: `scale(${yesScale})`,
                  boxShadow: `0 0 ${glowSpread}px rgba(225, 29, 99, 0.72)`,
                }}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#E11D63] px-7 py-2.5 text-sm font-bold text-[#FFF1F2] transition-all duration-300 hover:brightness-110 active:scale-95"
              >
                {copy.yesCta}
              </button>

              <button
                type="button"
                onClick={() => setNudgeCount((prev) => prev + 1)}
                style={{
                  transform: `translate(${currentDodge.x}px, ${currentDodge.y}px)`,
                }}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#E8B4B8]/40 bg-white/5 px-4 py-2 text-xs font-semibold text-[#FFF1F2]/85 transition-all duration-300 hover:bg-white/10"
              >
                {copy.noCta}
              </button>
            </div>
          </section>
        ) : null}
      </div>

      <footer className="relative z-10 border-t border-[#E8B4B8]/20 px-4 py-2.5 text-center text-[11px] text-[#E8B4B8]/80">
        {getWebzyFooterLabel(language)}
      </footer>
    </div>
  );
}
