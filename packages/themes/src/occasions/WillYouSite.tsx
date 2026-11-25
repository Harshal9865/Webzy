'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { type CoreLanguageCode, pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  AmbientRainCanvas,
  type CurvedTrackItem,
  CurvedTrackSanctuary,
  LaserHeartCanvas,
  WordByWordFadeLine,
} from './shared/OccasionCinematicFX';
import {
  OccasionAdaptiveGallery,
  OccasionArtworkBackdrop,
  type OccasionSiteProps,
  getReplayLabel,
  getWebzyFooterLabel,
} from './shared/OccasionPrimitives';

interface DateOption {
  id: 'coffee' | 'chai' | 'rooftop';
  title: Record<CoreLanguageCode, string>;
  subtitle: Record<CoreLanguageCode, string>;
  timeHint: Record<CoreLanguageCode, string>;
}

const DATE_OPTIONS: readonly DateOption[] = [
  {
    id: 'coffee',
    title: {
      en: 'Coffee & Sunset Walk',
      hinglish: 'Coffee & Sunset Walk',
      hi: 'कॉफ़ी और सनसेट वॉक',
    },
    subtitle: {
      en: 'Warm cups and an unhurried golden-hour stroll',
      hinglish: 'Cozy cafe corners aur shaam ki lambi baatein',
      hi: 'गर्म कॉफ़ी के साथ ढलती शाम की सुकून भरी सैर',
    },
    timeHint: {
      en: 'GOLDEN HOUR · 5:30 PM',
      hinglish: 'SHAAM · 5:30 PM',
      hi: 'संध्या · शाम 5:30',
    },
  },
  {
    id: 'chai',
    title: {
      en: 'Adrak Chai & Drive',
      hinglish: 'Adrak Chai & Drive',
      hi: 'अदरक चाय और ड्राइव',
    },
    subtitle: {
      en: 'Your favorite playlist, open windows, and quiet roads',
      hinglish: 'Tumhari playlist, thandi hawa aur lambi sadkein',
      hi: 'आपकी पसंदीदा धुनें, खुली हवा और शांत रास्ते',
    },
    timeHint: {
      en: 'TWILIGHT · 7:00 PM',
      hinglish: 'SHAAM DHALTE · 7:00 PM',
      hi: 'शाम · रात 7:00',
    },
  },
  {
    id: 'rooftop',
    title: {
      en: 'Rooftop Dessert',
      hinglish: 'Rooftop Dessert',
      hi: 'रूफटॉप डेज़र्ट',
    },
    subtitle: {
      en: 'Warm lantern lights, sweet treats, and open night skies',
      hinglish: 'Sitaron ke neeche meetha aur sirf hum dono',
      hi: 'रोशनी से सजी छत, मीठा और तारों भरा आसमान',
    },
    timeHint: {
      en: 'STARLIGHT · 8:30 PM',
      hinglish: 'SITARON KE SAATH · 8:30 PM',
      hi: 'सितारों तले · रात 8:30',
    },
  },
];

interface WhisperItem {
  title: string;
  detail: string;
}

const FALLBACK_WHISPERS: Record<CoreLanguageCode, readonly WhisperItem[]> = {
  en: [
    {
      title: 'The Quiet Spark',
      detail: 'Every ordinary evening turns softer the moment you walk in.',
    },
    {
      title: 'Unfinished Stories',
      detail: 'Still finding excuses to stretch a five-minute talk into hours.',
    },
    {
      title: 'One Honest Hope',
      detail: 'I would love to turn our little moments into a planned evening.',
    },
  ],
  hinglish: [
    {
      title: 'Pehli Muskaan',
      detail: 'Tumhare aane se har shaam apne aap khaas lagne lagti hai.',
    },
    {
      title: 'Lambi Baatein',
      detail: 'Abhi bhi paanch minute ki baat ko ghanton kheenchne ka mann karta hai.',
    },
    {
      title: 'Dil Ki Chahat',
      detail: 'Chalo in chhoti yaadon ko ek pyaari si date mein badalte hain.',
    },
  ],
  hi: [
    {
      title: 'पहली मुस्कान',
      detail: 'तुम्हारे साथ हर साधारण शाम अपने आप ख़ास बन जाती है।',
    },
    {
      title: 'अनकही बातें',
      detail: 'आज भी पांच मिनट की बातचीत को घंटों तक सुनने का मन करता है।',
    },
    {
      title: 'दिल की आरज़ू',
      detail: 'चलो इन प्यारी यादों को एक यादगार शाम में बदल देते हैं।',
    },
  ],
};

interface LocalizedCopy {
  coverEyebrow: string;
  coverHeader: string;
  toPrefix: string;
  fromLabel: string;
  slideRosePrompt: string;
  tapOpenFallback: string;
  sanctuaryEyebrow: string;
  sanctuaryHint: string;
  fullArtShow: string;
  fullArtHide: string;
  whisperCounter: (index: number, total: number) => string;
  laserEyebrow: string;
  laserTapPrompt: string;
  laserSubtitle: string;
  letterEyebrow: string;
  signedPrefix: string;
  soundtrackHeading: string;
  tracks: (primaryTitle: string) => readonly CurvedTrackItem[];
  galleryEyebrow: string;
  photoCaption: string;
  datePickerEyebrow: string;
  datePickerHeading: string;
  askEyebrow: string;
  askTitle: string;
  askIdlePrompt: string;
  yesCta: string;
  noCta: string;
  nudges: readonly string[];
  passEyebrow: string;
  stampText: string;
  acceptedHeading: (receiver: string) => string;
  acceptedSubtext: (sender: string) => string;
  guestLabel: string;
  hostLabel: string;
  planLabel: string;
  timeLabel: string;
  passLabel: string;
  replayQuestionCta: string;
}

const COPY_BY_LANG: Record<CoreLanguageCode, LocalizedCopy> = {
  en: {
    coverEyebrow: 'MIDNIGHT PLUM SEAL',
    coverHeader: 'Something I needed to say',
    toPrefix: 'To:',
    fromLabel: 'From:',
    slideRosePrompt: 'Slide the rose to open →',
    tapOpenFallback: 'Or tap the seal to open',
    sanctuaryEyebrow: 'STORY SANCTUARY',
    sanctuaryHint: 'Tap each glowing heart orb to read a hidden whisper',
    fullArtShow: 'Full Art',
    fullArtHide: 'Show Whispers',
    whisperCounter: (idx, total) => `WHISPER 0${idx + 1} / 0${total}`,
    laserEyebrow: 'HEARTBEAT HOLOGRAM',
    laserTapPrompt: 'Tap sky to pulse heart',
    laserSubtitle: '3D Particle Heart',
    letterEyebrow: 'THE HEARTFELT LETTER',
    signedPrefix: 'Always yours,',
    soundtrackHeading: 'ROMANTIC SOUNDTRACK',
    tracks: (primaryTitle) => [
      {
        id: 'track-1',
        title: primaryTitle,
        moodLabel: 'Soft Piano',
        duration: '02:48',
        note: 'Gentle keys for quiet corners, warm lights, and unhurried smiles.',
      },
      {
        id: 'track-2',
        title: 'Starlight Reverie',
        moodLabel: 'Velvet Strings',
        duration: '03:12',
        note: 'Saved for late-evening walks when the sky turns deep indigo.',
      },
      {
        id: 'track-3',
        title: 'After the Rain',
        moodLabel: 'Warm Chime',
        duration: '02:34',
        note: 'Like steam rising off two cups while the whole city slows down.',
      },
    ],
    galleryEyebrow: 'SHARED MOMENTS',
    photoCaption: 'Memory',
    datePickerEyebrow: 'CHOOSE OUR EVENING',
    datePickerHeading: 'Pick our date plan:',
    askEyebrow: 'THE QUESTION',
    askTitle: 'Will you go out with me?',
    askIdlePrompt: 'Pick a plan above and tell me what your heart says.',
    yesCta: 'Yes, let us go',
    noCta: 'Let me think',
    nudges: [
      'Take a second — coffee and sunset views are already waiting.',
      'Even adrak chai and your favorite playlist on the drive?',
      'Notice how that Yes button keeps glowing brighter for you.',
      'One tap turns tonight into our favorite memory.',
    ],
    passEyebrow: 'STARGAZING DATE PASS',
    stampText: 'CONFIRMED · DATE LOCKED',
    acceptedHeading: (receiver) => `It is a date, ${receiver}`,
    acceptedSubtext: (sender) => `${sender} is already counting down the hours.`,
    guestLabel: 'Guest of Honor',
    hostLabel: 'Invited By',
    planLabel: 'Chosen Itinerary',
    timeLabel: 'Window',
    passLabel: 'Pass Serial',
    replayQuestionCta: 'Change Date / Replay',
  },
  hinglish: {
    coverEyebrow: 'MIDNIGHT PLUM SEAL',
    coverHeader: 'Kuch dil se kehna tha',
    toPrefix: 'To:',
    fromLabel: 'From:',
    slideRosePrompt: 'Slide the rose to open →',
    tapOpenFallback: 'Ya seal par tap karke kholo',
    sanctuaryEyebrow: 'YAADON KA SAFAR',
    sanctuaryHint: 'Har chamakte heart orb par tap karke raaz padho',
    fullArtShow: 'Full Art',
    fullArtHide: 'Whispers Dikhao',
    whisperCounter: (idx, total) => `WHISPER 0${idx + 1} / 0${total}`,
    laserEyebrow: 'HEARTBEAT HOLOGRAM',
    laserTapPrompt: 'Aasmaan tap karke dil roshan karo',
    laserSubtitle: '3D Particle Heart',
    letterEyebrow: 'DIL KA KHAT',
    signedPrefix: 'Sirf tumhara,',
    soundtrackHeading: 'SHAAM KI DHUNEIN',
    tracks: (primaryTitle) => [
      {
        id: 'track-1',
        title: primaryTitle,
        moodLabel: 'Soft Piano',
        duration: '02:48',
        note: 'Halki si dhun, shaam ki chai aur lambi baaton ke liye.',
      },
      {
        id: 'track-2',
        title: 'Sitaron Ki Shaam',
        moodLabel: 'Velvet Strings',
        duration: '03:12',
        note: 'Jab aasmaan gehra neela ho aur hawa thandi chal rahi ho.',
      },
      {
        id: 'track-3',
        title: 'Baarish Ke Baad',
        moodLabel: 'Warm Chime',
        duration: '02:34',
        note: 'Do garam cup aur ek aisi shaam jo khatam na ho.',
      },
    ],
    galleryEyebrow: 'HAMARI TASVEEREIN',
    photoCaption: 'Yaad',
    datePickerEyebrow: 'SHAAM KA PLAN',
    datePickerHeading: 'Chuno hum kahan chalein:',
    askEyebrow: 'EK DIL SE SAWAAL',
    askTitle: 'Kya tum mere saath chalogi?',
    askIdlePrompt: 'Apna pasandida plan chuno aur dil ki baat batao.',
    yesCta: 'Haan, bilkul',
    noCta: 'Let me think',
    nudges: [
      'Soch lo! Coffee aur sunset walk meri taraf se pakki.',
      'Adrak chai aur tumhari playlist wali drive bhi toh hai!',
      'Dekho Haan wala button kitna glow kar raha hai tumhare liye.',
      'Itna mat socho, ek pyaari si Haan bol do.',
    ],
    passEyebrow: 'STARGAZING DATE PASS',
    stampText: 'CONFIRMED · DATE LOCKED',
    acceptedHeading: (receiver) => `Chalo done raha, ${receiver}`,
    acceptedSubtext: (sender) => `${sender} ke chehre par abhi sabse badi smile hai.`,
    guestLabel: 'Guest',
    hostLabel: 'Host',
    planLabel: 'Chosen Plan',
    timeLabel: 'Waqt',
    passLabel: 'Pass Serial',
    replayQuestionCta: 'Change Date / Replay',
  },
  hi: {
    coverEyebrow: 'गहरी शाम की मोहर',
    coverHeader: 'दिल से एक बात कहनी थी',
    toPrefix: 'प्रिय:',
    fromLabel: 'प्रेषक:',
    slideRosePrompt: 'खोलने के लिए गुलाब स्लाइड करें →',
    tapOpenFallback: 'या मोहर पर टैप करके खोलें',
    sanctuaryEyebrow: 'यादों का झरोखा',
    sanctuaryHint: 'हर चमकते दिल पर टैप करके अनकही बात पढ़ें',
    fullArtShow: 'पूरी कला',
    fullArtHide: 'संदेश दिखाएं',
    whisperCounter: (idx, total) => `संदेश 0${idx + 1} / 0${total}`,
    laserEyebrow: 'रोशनी का हृदय',
    laserTapPrompt: 'चमक बढ़ाने के लिए टैप करें',
    laserSubtitle: '3D कण हृदय',
    letterEyebrow: 'दिल का पैग़ाम',
    signedPrefix: 'सिर्फ़ तुम्हारा,',
    soundtrackHeading: 'हमारी शाम की धुनें',
    tracks: (primaryTitle) => [
      {
        id: 'track-1',
        title: primaryTitle,
        moodLabel: 'कोमल पियानो',
        duration: '02:48',
        note: 'सुकून भरी शाम, हल्की रोशनी और दिल की अनकही बातों के लिए।',
      },
      {
        id: 'track-2',
        title: 'सितारों की सरगम',
        moodLabel: 'मखमली धुन',
        duration: '03:12',
        note: 'नीले आसमान और शांत रास्तों की एक मीठी याद।',
      },
      {
        id: 'track-3',
        title: 'बारिश के बाद',
        moodLabel: 'गुनगुनी धुन',
        duration: '02:34',
        note: 'दो कप गर्म चाय और कभी न ख़त्म होने वाली बातचीत।',
      },
    ],
    galleryEyebrow: 'सुनहरी यादें',
    photoCaption: 'याद',
    datePickerEyebrow: 'शाम की योजना',
    datePickerHeading: 'अपना पसंदीदा डेट प्लान चुनें:',
    askEyebrow: 'दिल से सवाल',
    askTitle: 'क्या तुम मेरे साथ एक शाम बिताओगी?',
    askIdlePrompt: 'ऊपर अपना प्लान चुनें और दिल से जवाब दें।',
    yesCta: 'हाँ, बिल्कुल',
    noCta: 'सोचने दो',
    nudges: [
      'ज़रा सोचो — कॉफ़ी और सुनहरा सूर्यास्त इंतज़ार कर रहा है।',
      'अदरक वाली चाय और तुम्हारी पसंदीदा प्लेलिस्ट भी पक्की!',
      'देखो हाँ वाला बटन तुम्हारे लिए कितना चमक रहा है।',
      'अब इतना मत सोचो, मुस्कुराकर हाँ कह दो।',
    ],
    passEyebrow: 'स्टारगेज़िंग डेट पास',
    stampText: 'CONFIRMED · DATE LOCKED',
    acceptedHeading: (receiver) => `यह शाम पक्की रही, ${receiver}`,
    acceptedSubtext: (sender) => `${sender} के चेहरे पर अभी सबसे प्यारी मुस्कान है।`,
    guestLabel: 'मेहमान',
    hostLabel: 'मेज़बान',
    planLabel: 'चुना हुआ प्लान',
    timeLabel: 'समय',
    passLabel: 'पास क्रमांक',
    replayQuestionCta: 'प्लान बदलें / फिर से देखें',
  },
};

function RoseBloomSvg() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="#FFF1F2" stroke="#F43F5E" strokeWidth="1.4" />
      <path
        d="M16 7.5c3.8 0 6.5 2.7 6.5 6.1 0 4-3.4 7.4-6.5 7.4s-6.5-3.4-6.5-7.4c0-3.4 2.7-6.1 6.5-6.1Z"
        fill="#FB7185"
      />
      <path
        d="M16 10c2 0 3.4 1.4 3.4 3.2 0 2-1.6 3.7-3.4 3.7s-3.4-1.7-3.4-3.7c0-1.8 1.4-3.2 3.4-3.2Z"
        fill="#E11D48"
      />
      <path
        d="M16 21v4.2M12.2 22c1.4.5 2.4 1.4 3.8 1.9M19.8 22c-1.4.5-2.4 1.4-3.8 1.9"
        stroke="#15803D"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DateOptionIcon({ id }: { id: DateOption['id'] }) {
  if (id === 'coffee') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16" />
        <path strokeLinecap="round" d="M8 6.5c0-1 .8-1.5.8-2.5M12 6.5c0-1 .8-1.5.8-2.5" />
      </svg>
    );
  }
  if (id === 'chai') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="2.2" />
        <path strokeLinecap="round" d="M4 11.5h5.8M14.2 11.5H20M12 14.2V20" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10Z"
      />
      <path strokeLinecap="round" d="M16 5v3M14.5 6.5h3" />
    </svg>
  );
}

function BarcodeStub() {
  const widths = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 2, 1, 2, 1, 3, 1, 2];
  return (
    <div className="flex h-7 items-stretch justify-center gap-[2px] opacity-75" aria-hidden="true">
      {widths.map((w, idx) => (
        <span key={idx} className="rounded-[0.5px] bg-[#FDA4AF]" style={{ width: `${w}px` }} />
      ))}
    </div>
  );
}

const HOTSPOT_COORDS = [
  { top: '16%', left: '14%' },
  { top: '26%', left: '68%' },
  { top: '54%', left: '38%' },
] as const;

const DODGE_OFFSETS = [
  { x: 0, y: 0 },
  { x: 12, y: -4 },
  { x: -12, y: 3 },
  { x: 10, y: 4 },
] as const;

/**
 * Three-act romantic proposal experience:
 * Act 1: Midnight Plum wax-sealed rose slider gate
 * Act 2: Illustrated Story Sanctuary with glowing heart hotspots, fireflies, Full Art toggle & LaserHeartCanvas
 * Act 3: WordByWordFadeLine letter, CurvedTrackSanctuary, AdaptiveGallery, Date Plan, Yes/Think-Again Ask & Stargazing Date Pass
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
  const [activeWhisperIdx, setActiveWhisperIdx] = useState<number>(0);
  const [visitedWhispers, setVisitedWhispers] = useState<Record<number, boolean>>({ 0: true });
  const [fullArt, setFullArt] = useState(false);
  const [selectedDateId, setSelectedDateId] = useState<DateOption['id']>('coffee');
  const [accepted, setAccepted] = useState(false);
  const [nudgeCount, setNudgeCount] = useState(0);

  const sliderId = useId();
  const passRef = useRef<HTMLElement | null>(null);

  const coreLang = toCoreLanguageCode(language);
  const copy = COPY_BY_LANG[coreLang] ?? COPY_BY_LANG.en;
  const senderDisplay = (data.senderName || 'A').trim();
  const receiverDisplay = (data.receiverName || 'You').trim();
  const senderInitial = senderDisplay.charAt(0).toUpperCase() || 'A';
  const receiverInitial = receiverDisplay.charAt(0).toUpperCase() || 'B';
  const passSerial = `WY-2026-${senderInitial}${receiverInitial}`;
  const primaryTrackTitle = manifest.music[0]?.label || 'Soft Piano Blush';
  const chosenDateObj = DATE_OPTIONS.find((d) => d.id === selectedDateId) ?? DATE_OPTIONS[0];
  const headlineText = pickLocalizedText(data.headline, language);
  const messageText = pickLocalizedText(data.message, language);

  const whispers = useMemo<WhisperItem[]>(() => {
    const fallbacks = FALLBACK_WHISPERS[coreLang] ?? FALLBACK_WHISPERS.en;
    return [0, 1, 2].map((idx) => {
      const custom = data.highlights?.[idx];
      if (custom) {
        const title = pickLocalizedText(custom.title, language).trim();
        const detail = pickLocalizedText(custom.detail, language).trim();
        if (title || detail) {
          return {
            title: title || fallbacks[idx].title,
            detail: detail || fallbacks[idx].detail,
          };
        }
      }
      return fallbacks[idx];
    });
  }, [coreLang, data.highlights, language]);

  const tracks = useMemo(() => copy.tracks(primaryTrackTitle), [copy, primaryTrackTitle]);

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
    setFullArt(false);
    setActiveWhisperIdx(0);
    setVisitedWhispers({ 0: true });
    setOpened(false);
  }

  function handleSelectWhisper(idx: number) {
    setActiveWhisperIdx(idx);
    setVisitedWhispers((prev) => (prev[idx] ? prev : { ...prev, [idx]: true }));
    if (fullArt) {
      setFullArt(false);
    }
  }

  function handleAccept() {
    setAccepted(true);
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([25, 40, 35]);
    }
    setTimeout(() => {
      passRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  }

  const currentDodge = DODGE_OFFSETS[nudgeCount % DODGE_OFFSETS.length];
  const yesScale = Math.min(1.14, 1 + nudgeCount * 0.035);
  const glowSpread = Math.min(34, 14 + nudgeCount * 5);

  if (!opened) {
    return (
      <div className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#16081F] text-[#FFF1F2]">
        <OccasionArtworkBackdrop
          src="/templates/occasions/will-you/cover.jpg"
          fallbackGradient="radial-gradient(circle at 50% 24%, #421249 0%, #1C0A28 65%, #0D0414 100%)"
          className="object-cover object-center opacity-50"
        />
        <AmbientRainCanvas fireflies density="light" tint="rgba(253, 230, 138, 0.72)" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#16081F]/70 via-[#16081F]/45 to-[#0D0414]/95"
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
          <span className="inline-flex items-center rounded-full border border-[#FDE68A]/30 bg-[#261036]/75 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FDE68A]">
            {copy.coverEyebrow}
          </span>

          <p className="mt-3 font-heading text-lg italic tracking-wide text-[#FFF1F2] sm:text-xl">
            {copy.coverHeader}
          </p>

          {/* Textured Rose-Linen Envelope with Crimson Wax Seal */}
          <div
            onClick={handleQuickOpen}
            role="button"
            tabIndex={0}
            aria-label={copy.tapOpenFallback}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleQuickOpen();
              }
            }}
            className="relative my-6 w-full max-w-[304px] cursor-pointer overflow-hidden rounded-2xl border border-[#F5E6D3]/60 bg-gradient-to-br from-[#F7E7DA] via-[#EFE0D2] to-[#E6D0BF] px-5 pb-6 pt-12 text-center text-[#3A1E28] shadow-[0_26px_52px_-12px_rgba(0,0,0,0.72)] transition hover:scale-[1.015] active:scale-[0.99]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-16 border-b border-[#D6BA9E]/60 bg-gradient-to-b from-[#FAF0E6]/90 to-[#EED9C7]/60"
              style={{ clipPath: 'polygon(0 0, 100% 0, 50% 95%)' }}
            />

            <div
              aria-hidden="true"
              className="relative z-10 mx-auto -mt-4 mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#FCA5A5]/45 bg-gradient-to-br from-[#E11D48] via-[#BE123C] to-[#881337] font-heading text-xs font-bold text-white shadow-md"
            >
              {senderInitial}&amp;{receiverInitial}
            </div>

            <p className="break-words font-heading text-xl font-bold italic text-[#2B1B2E]">
              {copy.toPrefix} {receiverDisplay}
            </p>
            <p className="mt-1 break-words text-xs font-semibold text-[#5E3A47]">
              {copy.fromLabel} {senderDisplay}
            </p>
          </div>

          {/* Signature "Slide the rose to open ->" Draggable Pill */}
          <div className="w-full max-w-[304px] space-y-2.5">
            <div className="relative flex h-14 items-center overflow-hidden rounded-full border border-[#FDE68A]/35 bg-[#241032]/90 px-2 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
              <label htmlFor={sliderId} className="sr-only">
                {copy.slideRosePrompt}
              </label>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#F43F5E]/35 to-[#FB7185]/15 transition-all duration-75"
                style={{ width: `${Math.max(16, slideProgress)}%` }}
              />

              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition-all duration-75"
                style={{
                  left: `clamp(6px, calc(${slideProgress}% - 22px), calc(100% - 50px))`,
                }}
              >
                <RoseBloomSvg />
              </span>

              <span className="pointer-events-none relative z-0 w-full pl-9 pr-3 text-center font-heading text-xs italic tracking-wide text-[#FDE68A]/95">
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
              className="inline-flex min-h-[44px] items-center justify-center rounded-full px-4 text-xs font-medium text-[#E8B4B8]/85 underline underline-offset-4 transition hover:text-[#FFF1F2]"
            >
              {copy.tapOpenFallback}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeWhisper = whispers[activeWhisperIdx] ?? whispers[0];
  const activeOptionLabel = chosenDateObj.title[coreLang];

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden rounded-[28px] bg-[#0B0614] text-[#FFF1F2] animate-fade-in">
      {watermarked ? (
        <div
          aria-hidden="true"
          className="relative z-20 flex justify-center bg-[#23122C] py-1 text-[10px] font-bold tracking-widest text-[#E8B4B8]"
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      {/* Top Bar */}
      <header className="relative z-20 flex items-center justify-between gap-2 border-b border-white/10 bg-[#12081D]/85 px-4 py-3 backdrop-blur-md">
        <span className="inline-flex min-h-[36px] max-w-[60%] items-center truncate rounded-full border border-[#F43F5E]/35 bg-[#241032]/90 px-3 py-1 text-xs font-medium text-[#FBCFE8]">
          <span className="truncate">
            {senderDisplay} → {receiverDisplay}
          </span>
        </span>

        <button
          type="button"
          onClick={handleReplayCover}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 text-xs font-semibold text-[#FFF1F2] transition hover:bg-white/15 active:scale-95"
        >
          {getReplayLabel(language)}
        </button>
      </header>

      {/* Main Continuous Flow */}
      <main className="relative z-10 flex flex-1 flex-col gap-5 px-3.5 pb-6 pt-4 sm:px-5">
        {/* ACT 2A: Illustrated Story Sanctuary with Glowing Heart Hotspots + Firefly Sky */}
        <section
          aria-label={copy.sanctuaryEyebrow}
          className="relative overflow-hidden rounded-3xl border border-[#F43F5E]/25 bg-[#150821] shadow-[0_24px_60px_-20px_rgba(244,63,94,0.35)]"
        >
          <OccasionArtworkBackdrop
            src="/templates/occasions/will-you/cover.jpg"
            fallbackGradient="radial-gradient(circle at 50% 22%, #47144D 0%, #1C0A29 58%, #090512 100%)"
            className={`object-cover object-center transition-opacity duration-500 ${
              fullArt ? 'opacity-95' : 'opacity-50'
            }`}
          />

          <AmbientRainCanvas
            fireflies
            density="medium"
            tint={fullArt ? 'rgba(253, 224, 71, 0.95)' : 'rgba(253, 224, 71, 0.8)'}
          />

          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
              fullArt
                ? 'bg-gradient-to-b from-[#0B0614]/35 via-transparent to-[#0B0614]/55'
                : 'bg-gradient-to-b from-[#12071D]/70 via-[#12071D]/30 to-[#0B0614]/92'
            }`}
          />

          {/* Top Bar inside Sanctuary: Eyebrow + Full Art Toggle */}
          <div className="relative z-10 flex items-center justify-between gap-2 px-4 pt-3.5">
            <span className="rounded-full border border-[#FDE68A]/30 bg-black/45 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#FDE68A] backdrop-blur-xs">
              {copy.sanctuaryEyebrow}
            </span>

            <button
              type="button"
              onClick={() => setFullArt((prev) => !prev)}
              aria-pressed={fullArt}
              className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold backdrop-blur-sm transition active:scale-95 ${
                fullArt
                  ? 'border-[#F43F5E]/70 bg-[#F43F5E]/85 text-white shadow-[0_0_18px_rgba(244,63,94,0.5)]'
                  : 'border-white/20 bg-black/50 text-white/90 hover:bg-black/70'
              }`}
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.5 10s3-5.5 7.5-5.5S17.5 10 17.5 10s-3 5.5-7.5 5.5S2.5 10 2.5 10Z"
                />
                <circle cx="10" cy="10" r="2.2" />
              </svg>
              <span>{fullArt ? copy.fullArtHide : copy.fullArtShow}</span>
            </button>
          </div>

          {/* Interactive Sky Canvas with 3 Glowing Heart Orbs */}
          <div className="relative z-10 h-[210px] w-full sm:h-[235px]">
            {whispers.map((item, idx) => {
              const coord = HOTSPOT_COORDS[idx] ?? HOTSPOT_COORDS[0];
              const isSelected = activeWhisperIdx === idx && !fullArt;
              const isVisited = Boolean(visitedWhispers[idx]);
              return (
                <button
                  key={`whisper-orb-${idx}`}
                  type="button"
                  onClick={() => handleSelectWhisper(idx)}
                  aria-pressed={isSelected}
                  aria-label={`${copy.whisperCounter(idx, whispers.length)}: ${item.title}`}
                  style={{ top: coord.top, left: coord.left }}
                  className={`group absolute flex min-h-[44px] min-w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-300 active:scale-90 ${
                    fullArt ? 'opacity-45 hover:opacity-100' : 'opacity-100'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 rounded-full blur-md transition-all duration-500 ${
                      isSelected
                        ? 'scale-125 bg-[#F43F5E]/80'
                        : isVisited
                          ? 'bg-[#FB7185]/45'
                          : 'animate-pulse bg-[#FDE68A]/55'
                    }`}
                  />
                  <span
                    className={`relative flex h-11 w-11 items-center justify-center rounded-full border text-base font-bold transition-transform duration-300 group-hover:scale-110 ${
                      isSelected
                        ? 'scale-110 border-[#FFF1F2] bg-[#F43F5E] text-white shadow-[0_0_24px_rgba(244,63,94,0.85)]'
                        : 'border-[#FDE68A]/60 bg-[#1B0B2B]/80 text-[#FDA4AF] backdrop-blur-xs'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.9]" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Whisper Reveal Card (fades cleanly out in Full Art mode) */}
          <div
            className={`relative z-10 px-3.5 pb-4 transition-all duration-300 ${
              fullArt ? 'pointer-events-none translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
            }`}
          >
            <div className="rounded-2xl border border-white/15 bg-[#0E0718]/82 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#FDA4AF]">
                  {copy.whisperCounter(activeWhisperIdx, whispers.length)}
                </span>
                <div className="flex items-center">
                  {whispers.map((_, idx) => (
                    <button
                      key={`dot-${idx}`}
                      type="button"
                      onClick={() => handleSelectWhisper(idx)}
                      aria-label={copy.whisperCounter(idx, whispers.length)}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center"
                    >
                      <span
                        className={`block h-2 rounded-full transition-all ${
                          activeWhisperIdx === idx
                            ? 'w-5 bg-[#F43F5E]'
                            : visitedWhispers[idx]
                              ? 'w-2 bg-[#FDA4AF]/70'
                              : 'w-2 bg-white/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <h2 className="mt-1 break-words font-heading text-lg font-bold text-[#FFF1F2]">
                {activeWhisper.title}
              </h2>
              <p className="mt-1 break-words text-xs leading-relaxed text-[#FBCFE8]/90 sm:text-sm">
                {activeWhisper.detail}
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-wide text-white/55">
                {copy.sanctuaryHint}
              </p>
            </div>
          </div>
        </section>

        {/* ACT 2B: Interactive 3D Particle Laser Heart Centerpiece */}
        <section aria-label={copy.laserEyebrow} className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#22D3EE]/85">
              {copy.laserEyebrow}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#F472B6]/85">
              {copy.laserSubtitle}
            </span>
          </div>
          <LaserHeartCanvas
            accentHue="cyan-pink"
            heightClass="h-64 sm:h-72"
            interactiveLabel={copy.laserTapPrompt}
            subtitle={`${senderDisplay} · ${receiverDisplay}`}
          />
        </section>

        {/* ACT 3A: The Heartfelt Letter (Word-by-Word Fade Reveal) */}
        <section className="relative overflow-hidden rounded-3xl border border-[#F43F5E]/25 bg-gradient-to-b from-[#1A0C28] via-[#13081E] to-[#0D0616] p-5 shadow-xl sm:p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#F43F5E]/15 blur-3xl"
          />

          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FDA4AF]">
            {copy.letterEyebrow}
          </p>
          <h2 className="mt-2 break-words font-heading text-2xl font-bold leading-snug text-[#FFF1F2]">
            {headlineText}
          </h2>

          <div className="my-3.5 h-px w-16 bg-gradient-to-r from-[#F43F5E] to-transparent" aria-hidden="true" />

          <WordByWordFadeLine
            text={messageText}
            active={opened}
            delayStepMs={55}
            className="break-words text-sm leading-relaxed text-[#FFE4E8]/90 sm:text-base"
          />

          <p className="mt-4 break-words font-heading text-sm italic text-[#FDE68A]/90">
            {copy.signedPrefix} {senderDisplay}
          </p>
        </section>

        {/* ACT 3B: Curved Vinyl Soundtrack Sanctuary */}
        <CurvedTrackSanctuary
          tracks={tracks}
          mood="romantic"
          accentColor="#F43F5E"
          dark
          heading={copy.soundtrackHeading}
        />

        {/* ACT 3C: Adaptive Photo Memory Gallery */}
        {data.photos && data.photos.length > 0 ? (
          <section className="rounded-3xl border border-white/10 bg-[#12091D]/90 p-4 shadow-lg">
            <p className="px-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FDA4AF]">
              {copy.galleryEyebrow}
            </p>
            <OccasionAdaptiveGallery
              photos={data.photos}
              accentColor="#F43F5E"
              dark
              captionPrefix={copy.photoCaption}
            />
          </section>
        ) : null}

        {/* ACT 3D: Date Plan Chooser */}
        <section className="rounded-3xl border border-[#F43F5E]/25 bg-[#160A24]/95 p-4 shadow-xl sm:p-5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FDE68A]">
            {copy.datePickerEyebrow}
          </p>
          <h3 className="mt-1 font-heading text-lg font-bold text-[#FFF1F2]">
            {copy.datePickerHeading}
          </h3>

          <div className="mt-3.5 space-y-2.5">
            {DATE_OPTIONS.map((opt) => {
              const isSelected = selectedDateId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedDateId(opt.id)}
                  className={`flex min-h-[56px] w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all active:scale-[0.99] ${
                    isSelected
                      ? 'border-[#F43F5E] bg-[#F43F5E]/18 text-white shadow-[0_0_24px_-10px_rgba(244,63,94,0.75)]'
                      : 'border-white/12 bg-white/5 text-[#FFF1F2]/85 hover:border-white/25 hover:bg-white/10'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                      isSelected
                        ? 'border-[#FDA4AF]/50 bg-[#F43F5E] text-white'
                        : 'border-white/15 bg-black/30 text-[#FDA4AF]'
                    }`}
                  >
                    <DateOptionIcon id={opt.id} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="break-words text-sm font-bold">{opt.title[coreLang]}</span>
                      <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#FDE68A]/85">
                        {opt.timeHint[coreLang]}
                      </span>
                    </div>
                    <p className="mt-0.5 break-words text-xs leading-relaxed text-[#E8B4B8]/85">
                      {opt.subtitle[coreLang]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ACT 3E: The Glowing "Yes" / Dodging "Think Again" Ask OR Unlocked Stargazing Date Pass */}
        {!accepted ? (
          <section className="relative overflow-hidden rounded-3xl border border-[#F43F5E]/40 bg-gradient-to-b from-[#230E32] to-[#12071C] p-5 text-center shadow-2xl sm:p-6">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FDA4AF]">
              {copy.askEyebrow}
            </p>

            <span className="mt-2.5 inline-flex items-center rounded-full border border-[#FDE68A]/35 bg-white/5 px-3 py-1 text-[11px] font-semibold text-[#FDE68A]">
              {activeOptionLabel}
            </span>

            <h3 className="mt-3 break-words font-heading text-2xl font-bold text-[#FFF1F2]">
              {copy.askTitle}
            </h3>

            <p
              key={nudgeCount}
              className="mt-2 min-h-[36px] break-words text-xs leading-relaxed text-[#FDA4AF] animate-fade-in"
            >
              {nudgeCount > 0 ? copy.nudges[(nudgeCount - 1) % copy.nudges.length] : copy.askIdlePrompt}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleAccept}
                style={{
                  transform: `scale(${yesScale})`,
                  boxShadow: `0 0 ${glowSpread}px rgba(244, 63, 94, 0.78)`,
                }}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#F43F5E] px-7 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:brightness-110 active:scale-95"
              >
                {copy.yesCta}
              </button>

              <button
                type="button"
                onClick={() => setNudgeCount((prev) => prev + 1)}
                style={{
                  transform: `translate(${currentDodge.x}px, ${currentDodge.y}px)`,
                }}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#E8B4B8]/35 bg-white/5 px-4 py-2 text-xs font-semibold text-[#FFF1F2]/85 transition-all duration-300 hover:bg-white/10"
              >
                {copy.noCta}
              </button>
            </div>
          </section>
        ) : (
          <section
            ref={passRef}
            aria-label={copy.passEyebrow}
            className="relative overflow-hidden rounded-3xl border border-[#FDE68A]/45 bg-gradient-to-br from-[#230E35] via-[#150822] to-[#0C0514] p-5 text-[#FFF1F2] shadow-[0_24px_60px_-14px_rgba(244,63,94,0.5)] animate-pop-bounce"
          >
            <AmbientRainCanvas fireflies density="light" tint="rgba(253, 224, 71, 0.78)" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FDE68A]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#F43F5E]" aria-hidden="true" />
                  {copy.passEyebrow}
                </span>

                <span className="inline-block -rotate-3 rounded-md border border-[#F43F5E]/75 bg-[#F43F5E]/15 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.14em] text-[#FDA4AF]">
                  {copy.stampText}
                </span>
              </div>

              <h3 className="mt-3 break-words font-heading text-2xl font-bold leading-snug text-[#FFF1F2]">
                {copy.acceptedHeading(receiverDisplay)}
              </h3>
              <p className="mt-1 break-words text-xs leading-relaxed text-[#FBCFE8]/90 sm:text-sm">
                {copy.acceptedSubtext(senderDisplay)}
              </p>

              {/* Embossed Itinerary Details */}
              <div className="mt-4 space-y-2.5 rounded-2xl border border-white/15 bg-black/35 p-3.5 text-xs backdrop-blur-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/60">
                    {copy.guestLabel}
                  </span>
                  <span className="break-words text-right font-bold text-[#FFF1F2]">{receiverDisplay}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/60">
                    {copy.hostLabel}
                  </span>
                  <span className="break-words text-right font-bold text-[#FFF1F2]">{senderDisplay}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/60">
                    {copy.planLabel}
                  </span>
                  <span className="text-right font-bold text-[#FDA4AF]">{activeOptionLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/60">
                    {copy.timeLabel}
                  </span>
                  <span className="font-mono text-right font-bold text-[#FDE68A]">
                    {chosenDateObj.timeHint[coreLang]}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/60">
                    {copy.passLabel}
                  </span>
                  <span className="font-mono font-bold tracking-wider text-white">{passSerial}</span>
                </div>
              </div>

              {/* Ticket Tear Line */}
              <div className="relative my-4 flex items-center" aria-hidden="true">
                <span className="-ml-8 h-6 w-6 shrink-0 rounded-full bg-[#0B0614]" />
                <span className="w-full border-t-2 border-dashed border-[#FDE68A]/35" />
                <span className="-mr-8 h-6 w-6 shrink-0 rounded-full bg-[#0B0614]" />
              </div>

              <div className="flex flex-col items-center gap-3 pt-1">
                <BarcodeStub />
                <button
                  type="button"
                  onClick={() => {
                    setAccepted(false);
                    setNudgeCount(0);
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#F43F5E]/45 bg-white/10 px-5 py-2 text-xs font-bold text-[#FFF1F2] transition hover:bg-white/15 active:scale-95"
                >
                  {copy.replayQuestionCta}
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="relative z-10 border-t border-white/10 px-4 py-3 text-center text-[11px] text-[#E8B4B8]/75">
        {getWebzyFooterLabel(language)}
      </footer>
    </div>
  );
}
