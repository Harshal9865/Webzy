'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { type CoreLanguageCode, pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import { playLanternPullChime, playPaperUnsealSfx, playRaindropPluck } from './shared/OccasionCraftPrimitives';
import {
  getWebzyFooterLabel,
  OccasionCassettePlayer,
  OccasionPhotoGallery,
  type OccasionSiteProps,
} from './shared/OccasionPrimitives';

const DEVANAGARI_RE = /[\u0900-\u097F]/;

function hasDevanagari(text: string): boolean {
  return DEVANAGARI_RE.test(text);
}

type NoteOfferingId = 'chai' | 'flowers' | 'listen' | 'dessert';
type CouponId = 'chai-walk' | 'food-order' | 'movie-night';
type BearMood = 0 | 1 | 2 | 3;

interface StickyOffering {
  id: NoteOfferingId;
  num: string;
  bg: string;
  border: string;
  ink: string;
  tilt: string;
  title: Record<CoreLanguageCode, string>;
  note: Record<CoreLanguageCode, string>;
}

const STICKY_OFFERINGS: readonly StickyOffering[] = [
  {
    id: 'chai',
    num: '01',
    bg: '#C9E6C9',
    border: '#9AC69C',
    ink: '#1F4624',
    tilt: '-rotate-2',
    title: {
      en: 'Hot Chai & Snacks',
      hinglish: 'Garam Chai & Snacks',
      hi: 'गरम चाय और नाश्ता',
    },
    note: {
      en: 'My treat, zero debate',
      hinglish: 'Meri taraf se, pakka',
      hi: 'मेरी तरफ से, बिना बहस',
    },
  },
  {
    id: 'flowers',
    num: '02',
    bg: '#C3DCF2',
    border: '#93B9DC',
    ink: '#1C3B5A',
    tilt: 'rotate-1',
    title: {
      en: 'Fresh Wildflowers',
      hinglish: 'Taaze Phool',
      hi: 'ताज़े फूलों का गुलदस्ता',
    },
    note: {
      en: 'Handpicked for you',
      hinglish: 'Sirf tumhare liye',
      hi: 'सिर्फ़ तुम्हारे लिए',
    },
  },
  {
    id: 'listen',
    num: '03',
    bg: '#E3CEF0',
    border: '#BC9CD0',
    ink: '#3C224E',
    tilt: '-rotate-1',
    title: {
      en: 'Zero Excuses',
      hinglish: 'Bina Bahane Sununga',
      hi: 'बिना किसी बहाने के',
    },
    note: {
      en: 'Just listening to you',
      hinglish: 'Sirf tumhari baat',
      hi: 'सिर्फ़ तुम्हारी बात सुनना',
    },
  },
  {
    id: 'dessert',
    num: '04',
    bg: '#FBE7B5',
    border: '#DFC178',
    ink: '#5A3D0E',
    tilt: 'rotate-2',
    title: {
      en: 'Favorite Dessert',
      hinglish: 'Tumhari Fav Sweet',
      hi: 'तुम्हारी पसंदीदा मिठाई',
    },
    note: {
      en: 'You pick the spot',
      hinglish: 'Jagah tum chuno',
      hi: 'जगह तुम चुनना',
    },
  },
];

const MAKEUP_COUPONS: ReadonlyArray<{
  id: CouponId;
  code: string;
  label: Record<CoreLanguageCode, string>;
}> = [
  {
    id: 'chai-walk',
    code: 'TRUCE-01',
    label: {
      en: 'Hot Chai & Long Walk',
      hinglish: 'Garam Chai & Long Walk',
      hi: 'गरम चाय और लंबी सैर',
    },
  },
  {
    id: 'food-order',
    code: 'TRUCE-02',
    label: {
      en: 'Your Fav Food Order',
      hinglish: 'Tumhara Fav Food Order',
      hi: 'तुम्हारा पसंदीदा खाना',
    },
  },
  {
    id: 'movie-night',
    code: 'TRUCE-03',
    label: {
      en: 'Zero-Phone Movie Night',
      hinglish: 'No-Phone Movie Night',
      hi: 'बिना फ़ोन मूवी नाइट',
    },
  },
];

interface ScrapbookSorryCopy {
  previewBanner: string;
  skyBadgeStorm: string;
  skyBadgeClear: string;
  forPrefix: string;
  kraftTapeTitle: string;
  meterLabel: string;
  meterHint: (count: number, total: number) => string;
  meterReady: string;
  meterForgiven: string;
  moodCaptions: readonly [string, string, string, string];
  stickyHeading: string;
  stickySub: string;
  acceptedStamp: string;
  photosHeading: string;
  photoPrefix: string;
  forgiveCta: string;
  poutCta: string;
  poutReplies: readonly [string, string, string, string];
  truceBadge: string;
  forgivenTitle: (receiver: string) => string;
  forgivenSub: (sender: string) => string;
  couponHeading: string;
  soundtrackTitle: string;
  soundtrackTap: string;
  soundtrackPlaying: string;
  copyVerdictCta: string;
  copiedVerdictToast: string;
  replayCta: string;
  defaultHeadline: (receiver: string) => string;
  defaultMessage: string;
}

const COPY_BY_LANG: Record<CoreLanguageCode, ScrapbookSorryCopy> = {
  en: {
    previewBanner: 'WEBZY FREE PREVIEW',
    skyBadgeStorm: 'CLOUDBREAK WEATHER · SORRY EDITION',
    skyBadgeClear: 'CLEAR BLUE SKY · PEACE RESTORED',
    forPrefix: 'For',
    kraftTapeTitle: 'i messed up!',
    meterLabel: 'SKY CLEARING METER',
    meterHint: (c, t) => `${c} / ${t} peace notes clipped — tap sticky notes below`,
    meterReady: 'All 4 peace notes accepted — clouds are parting!',
    meterForgiven: '100% Clear Meadow Sky — Peace Treaty Signed',
    moodCaptions: [
      'standing in the rain with a daisy...',
      'the clouds are thinning out',
      'almost smiling again?',
      'sunshine is officially back!',
    ],
    stickyHeading: 'Clipped Peace Offerings',
    stickySub: 'Tap each paper-clipped note to accept & clear the sky.',
    acceptedStamp: 'ACCEPTED',
    photosHeading: 'Favorite Us Polaroids',
    photoPrefix: 'Memory',
    forgiveCta: 'Okay, I Forgive You (Clear the Sky)',
    poutCta: 'Still a little mad',
    poutReplies: [
      'Fair enough. I am bringing extra snacks anyway.',
      'Still standing here holding this little daisy for you.',
      'Not leaving until that tiny smile shows up.',
      'Okay fine — double dessert AND my full attention.',
    ],
    truceBadge: 'OFFICIAL PEACE TREATY',
    forgivenTitle: (r) => `Thank you for melting my heart, ${r}`,
    forgivenSub: (s) => `${s} promises to listen better, show up faster, and never let the clouds stay long.`,
    couponHeading: 'Pick Your Make-Up Date Coupon',
    soundtrackTitle: 'Sunlit Picnic Meadow · Side A',
    soundtrackTap: 'Play Sunny Chime',
    soundtrackPlaying: 'Playing Meadow Chime...',
    copyVerdictCta: 'Copy Truce Verdict for WhatsApp',
    copiedVerdictToast: 'Copied! Paste it right back on WhatsApp.',
    replayCta: 'Replay Rain-to-Sunshine',
    defaultHeadline: (r) => `Hey ${r}, I’m truly sorry`,
    defaultMessage:
      'I hate being the reason your day felt heavy. No excuses — you mean way too much to me. Let me make it up to you with warm chai, flowers, and my undivided attention.',
  },
  hinglish: {
    previewBanner: 'WEBZY FREE PREVIEW',
    skyBadgeStorm: 'BAARISH WALA MAUSAM · MAAN JAO',
    skyBadgeClear: 'KHILTI DHOOP · SULAH PAKKI',
    forPrefix: 'Sirf',
    kraftTapeTitle: 'galti ho gayi!',
    meterLabel: 'MAUSAM METER',
    meterHint: (c, t) => `${c} / ${t} peace notes accept hue — neeche tap karo`,
    meterReady: 'Sabhi 4 notes accept! Baadal chhat rahe hain!',
    meterForgiven: '100% Khilti Dhoop — Maan Gayi!',
    moodCaptions: [
      'baarish mein phool lekar khada hoon...',
      'baadal thode kam ho rahe hain',
      'thodi si muskaan aa gayi?',
      'dhoop wapas aa gayi!',
    ],
    stickyHeading: 'Chhote Peace Offerings',
    stickySub: 'Har paper-clipped sticky note par tap karo aur mausam badlo.',
    acceptedStamp: 'DONE',
    photosHeading: 'Hamari Pyaari Yaadein',
    photoPrefix: 'Yaad',
    forgiveCta: 'Theek Hai, Maaf Kiya (Dhoop Lao)',
    poutCta: 'Abhi bhi thoda gussa hoon',
    poutReplies: [
      'Banta hai! Extra snacks bhi le aaunga.',
      'Main yahin phool lekar khada hoon, mana kar hi jaunga.',
      'Chhoti si muskaan aane tak kahin nahi ja raha.',
      'Pakka promise — double dessert aur poora dhyaan sirf tum par.',
    ],
    truceBadge: 'PAKKA SULAH CARD',
    forgivenTitle: (r) => `Shukriya maan jaane ke liye, ${r}`,
    forgivenSub: (s) => `${s} ka waada hai — aage se dhyaan rakhunga aur tumhe hamesha khush dekhna chahta hoon.`,
    couponHeading: 'Apna Make-Up Date Coupon Chuno',
    soundtrackTitle: 'Sunahri Dhoop · Side A',
    soundtrackTap: 'Khushi Ki Dhun Chalao',
    soundtrackPlaying: 'Dhun Chal Rahi Hai...',
    copyVerdictCta: 'Mera Truce Verdict Copy Karo',
    copiedVerdictToast: 'Copy ho gaya! Seedha WhatsApp par bhej do.',
    replayCta: 'Baarish Phir Se Dekho',
    defaultHeadline: (r) => `${r}, dil se sorry bol raha hoon`,
    defaultMessage:
      'Meri wajah se tumhara mood kharab hua, uska sach mein bura lag raha hai. Koi bahana nahi — tum mere liye bahut khaas ho. Chalo garam chai aur phoolon ke saath sulah karte hain.',
  },
  hi: {
    previewBanner: 'WEBZY FREE PREVIEW',
    skyBadgeStorm: 'बादल भरा मौसम · मान जाओ',
    skyBadgeClear: 'खिली धूप · सुलह पक्की',
    forPrefix: 'प्रिय',
    kraftTapeTitle: 'गलती हो गई!',
    meterLabel: 'मौसम और मन का पैमाना',
    meterHint: (c, t) => `${c} / ${t} नोट्स स्वीकार किए — नीचे टैप करें`,
    meterReady: 'सभी 4 भेंट स्वीकार हुईं — बादल छँट रहे हैं!',
    meterForgiven: '100% खिली धूप — सुलह पक्की हो गई',
    moodCaptions: [
      'बारिश में फूल लिए खड़ा हूँ...',
      'बादल धीरे-धीरे छँट रहे हैं',
      'क्या थोड़ी सी मुस्कान आई?',
      'आख़िरकार धूप खिल ही गई!',
    ],
    stickyHeading: 'सुलह की छोटी भेंटें',
    stickySub: 'हर स्टिकी नोट पर टैप करें और आसमान साफ़ करें।',
    acceptedStamp: 'स्वीकृत',
    photosHeading: 'हमारी प्यारी तस्वीरें',
    photoPrefix: 'याद',
    forgiveCta: 'ठीक है, माफ़ किया (धूप खिलाएँ)',
    poutCta: 'अभी भी थोड़ा नाराज़ हूँ',
    poutReplies: [
      'आपकी नाराज़गी जायज़ है, पर मैं मना कर ही रहूँगा।',
      'अभी भी फूल लिए आपकी मुस्कान का इंतज़ार है।',
      'जब तक छोटी सी हँसी न आ जाए, यहीं खड़ा हूँ।',
      'पक्का वादा — आपकी मनपसंद मिठाई और पूरा समय।',
    ],
    truceBadge: 'पक्की सुलह पत्रिका',
    forgivenTitle: (r) => `मान जाने के लिए दिल से धन्यवाद, ${r}`,
    forgivenSub: (s) => `${s} का वादा है कि आगे से हमेशा आपकी बात सुनूँगा और आपको मुस्कुराते देखूँगा।`,
    couponHeading: 'अपना मनपसंद सुलह कूपन चुनें',
    soundtrackTitle: 'सुनहरी धूप · साइड A',
    soundtrackTap: 'मधुर धुन सुनें',
    soundtrackPlaying: 'धुन बज रही है...',
    copyVerdictCta: 'मेरा फ़ैसला कॉपी करें (WhatsApp)',
    copiedVerdictToast: 'कॉपी हो गया! अब WhatsApp पर भेज दें।',
    replayCta: 'फिर से देखें',
    defaultHeadline: (r) => `${r}, दिल से माफ़ी माँगता हूँ`,
    defaultMessage:
      'मेरी वजह से आपका दिन उदास हुआ, इसका सच में दुख है। बिना किसी बहाने के — आप मेरे लिए बेहद ख़ास हैं। आइए गरम चाय और मुस्कान के साथ फिर से सुलह करें।',
  },
};

const RAIN_STREAKS = Array.from({ length: 16 }, (_, idx) => ({
  left: `${5 + idx * 6}%`,
  delay: `${(idx % 5) * 0.28}s`,
  dur: `${1.15 + (idx % 4) * 0.22}s`,
  height: `${18 + (idx % 3) * 8}px`,
}));

/** Hand-Drawn Apology Bear Holding a Little Daisy (4 Reactive Moods) */
function ApologyBearSvg({ mood, sunlit }: { mood: BearMood; sunlit: boolean }) {
  return (
    <svg viewBox="0 0 140 116" className="h-24 w-32 drop-shadow-sm" fill="none" aria-hidden="true">
      {/* Tiny raincloud above head when mood === 0 */}
      {mood === 0 ? (
        <g opacity="0.88">
          <path
            d="M48 22 C48 16 54 12 60 14 C64 9 74 9 78 14 C84 13 90 17 89 23 C89 27 85 29 80 29 H55 C50 29 48 26 48 22 Z"
            fill="#CBD5E1"
          />
          <path d="M60 33 L58 38 M70 33 L68 38 M80 33 L78 38" stroke="#93C5FD" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ) : null}

      {/* Sun rays behind head when forgiven */}
      {sunlit ? (
        <g>
          <circle cx="70" cy="64" r="44" fill="#FDE68A" fillOpacity="0.34" />
          <path d="M22 30 L28 36 M118 30 L112 36 M70 8 V16" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      ) : null}

      {/* Bear Ears */}
      <circle cx="48" cy="48" r="10" fill="#E8C3A4" stroke="#4B2E24" strokeWidth="2" />
      <circle cx="92" cy="48" r="10" fill="#E8C3A4" stroke="#4B2E24" strokeWidth="2" />
      <circle cx="48" cy="48" r="5" fill="#F4A8B8" />
      <circle cx="92" cy="48" r="5" fill="#F4A8B8" />

      {/* Bear Body & Head */}
      <ellipse cx="70" cy="76" rx="30" ry="30" fill="#F3D5BA" stroke="#4B2E24" strokeWidth="2" />
      <ellipse cx="70" cy="84" rx="14" ry="11" fill="#FFF8F0" />

      {/* Blush */}
      <ellipse cx="52" cy="74" rx="5" ry="2.8" fill="#FB7185" fillOpacity={sunlit ? '0.65' : '0.45'} />
      <ellipse cx="88" cy="74" rx="5" ry="2.8" fill="#FB7185" fillOpacity={sunlit ? '0.65' : '0.45'} />

      {/* Eyes */}
      {mood === 3 ? (
        <>
          <path d="M55 66 Q60 61 65 66" stroke="#4B2E24" strokeWidth="2.3" strokeLinecap="round" />
          <path d="M75 66 Q80 61 85 66" stroke="#4B2E24" strokeWidth="2.3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="59" cy="66" r={mood === 0 ? 3.5 : 2.8} fill="#3B2219" />
          <circle cx="81" cy="66" r={mood === 0 ? 3.5 : 2.8} fill="#3B2219" />
          <circle cx="57.8" cy="64.8" r="1.2" fill="#FFF" />
          <circle cx="79.8" cy="64.8" r="1.2" fill="#FFF" />
        </>
      )}

      {/* Mouth */}
      {mood === 0 ? (
        <path d="M66 79 Q70 76 74 79" stroke="#4B2E24" strokeWidth="1.9" strokeLinecap="round" />
      ) : (
        <path d="M65 77 Q70 82 75 77" stroke="#4B2E24" strokeWidth="2" strokeLinecap="round" />
      )}

      {/* Little Daisy Held Out in Right Paw */}
      <path d="M104 98 Q106 84 111 72" stroke="#2F855A" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="111" cy="67" r="3.4" fill="#FFFDF9" stroke="#CBD5E1" strokeWidth="0.7" />
      <circle cx="116" cy="71" r="3.4" fill="#FFFDF9" stroke="#CBD5E1" strokeWidth="0.7" />
      <circle cx="106" cy="71" r="3.4" fill="#FFFDF9" stroke="#CBD5E1" strokeWidth="0.7" />
      <circle cx="111" cy="75" r="3.4" fill="#FFFDF9" stroke="#CBD5E1" strokeWidth="0.7" />
      <circle cx="111" cy="71" r="2.8" fill="#F59E0B" />
    </svg>
  );
}

/** Realistic Angled Metallic Paperclip SVG (inspired by Picnic Scrapbook reference!) */
function PaperclipSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 52" className={className} fill="none" aria-hidden="true">
      <path
        d="M10 14 V36 C10 41.5 18 41.5 18 36 V10 C18 3.5 6 3.5 6 10 V38 C6 46 22 46 22 38 V16"
        stroke="#78716C"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M10 14 V36 C10 41.5 18 41.5 18 36 V10 C18 3.5 6 3.5 6 10"
        stroke="#E7E5E4"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Cloudbreak Sky & Pink Gingham Spiral Apology Notebook ("Maan Jao / Pretty Please" — `maan-jao-01`).
 * Inspired by dreamy sky-to-meadow posters + tactile picnic scrapbook notebooks:
 * living weather header that clears from rainclouds to a sunlit rainbow meadow,
 * open Wire-O spiral-bound notebook with torn kraft tape, 4 pastel paper-clipped
 * sticky-note peace offerings, and perforated make-up date coupons with WhatsApp verdict copy.
 */
export function MaanJaoSite({
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const uid = useId().replace(/:/g, '');
  const [acceptedIds, setAcceptedIds] = useState<NoteOfferingId[]>([]);
  const [forgiven, setForgiven] = useState(false);
  const [poutCount, setPoutCount] = useState(0);
  const [pickedCouponId, setPickedCouponId] = useState<CouponId>('chai-walk');
  const [copiedVerdict, setCopiedVerdict] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const coreLang = toCoreLanguageCode(language);
  const copy = COPY_BY_LANG[coreLang] ?? COPY_BY_LANG.en;
  const isHindi = coreLang === 'hi';
  const hindiSafe: React.CSSProperties | undefined = isHindi
    ? { fontStyle: 'normal', letterSpacing: '0em' }
    : undefined;

  const receiver = data.receiverName?.trim() || (isHindi ? 'आप' : 'you');
  const sender = data.senderName?.trim() || (isHindi ? 'मैं' : 'Me');
  const headlineText =
    pickLocalizedText(data.headline, language).trim() || copy.defaultHeadline(receiver);
  const messageText =
    pickLocalizedText(data.message, language).trim() || copy.defaultMessage;

  const acceptedCount = acceptedIds.length;
  const meterPct = forgiven ? 100 : Math.min(100, acceptedCount * 25);
  const bearMood: BearMood = forgiven
    ? 3
    : acceptedCount >= 3
      ? 2
      : acceptedCount >= 1
        ? 1
        : 0;

  const hasPhotos = Boolean(
    data.photos?.some((src) => typeof src === 'string' && src.trim().length > 0),
  );

  function handleToggleNote(id: NoteOfferingId, idx: number) {
    playRaindropPluck(idx);
    setAcceptedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function handleForgive() {
    playLanternPullChime();
    setAcceptedIds(STICKY_OFFERINGS.map((n) => n.id));
    setForgiven(true);
    setPoutCount(0);
    onOpened?.();
  }

  function handleReplay() {
    setForgiven(false);
    setAcceptedIds([]);
    setPoutCount(0);
  }

  async function handleCopyVerdict() {
    const chosen = MAKEUP_COUPONS.find((c) => c.id === pickedCouponId) ?? MAKEUP_COUPONS[0];
    const text =
      coreLang === 'hi'
        ? `माफ़ किया ${sender}! अब "${chosen.label.hi}" (${chosen.code}) पक्का रहा।`
        : coreLang === 'hinglish'
          ? `Theek hai maaf kiya ${sender}! "${chosen.label.hinglish}" (${chosen.code}) redeem kar liya hai.`
          : `Peace treaty signed, ${sender}! Redeeming my "${chosen.label.en}" coupon (${chosen.code}).`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // Safe fallback
    }
    setCopiedVerdict(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedVerdict(false), 3000);
  }

  const skyGradient = forgiven
    ? 'linear-gradient(180deg, #3B82C4 0%, #7BB8EC 55%, #C6E6FB 100%)'
    : acceptedCount >= 2
      ? 'linear-gradient(180deg, #47628A 0%, #869BC0 55%, #E7C8C2 100%)'
      : 'linear-gradient(180deg, #273754 0%, #445B80 58%, #778BA8 100%)';

  const poutReply =
    poutCount > 0 ? copy.poutReplies[(poutCount - 1) % copy.poutReplies.length] : null;

  return (
    <article
      aria-label={copy.skyBadgeStorm}
      className="relative flex min-h-full w-full flex-col overflow-x-clip rounded-[28px] text-[#352329]"
      style={{
        backgroundColor: '#FFF5F7',
        backgroundImage:
          'linear-gradient(90deg, rgba(242, 168, 185, 0.24) 50%, transparent 50%), linear-gradient(rgba(242, 168, 185, 0.24) 50%, transparent 50%)',
        backgroundSize: '34px 34px',
      }}
    >
      <style>{`
        @keyframes mj2-rain-${uid} {
          0% { transform: translate3d(0, -18px, 0) rotate(12deg); opacity: 0; }
          20% { opacity: 0.55; }
          85% { opacity: 0.45; }
          100% { transform: translate3d(-24px, 240px, 0) rotate(12deg); opacity: 0; }
        }
        @keyframes mj2-cloud-${uid} {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(10px); }
        }
        @keyframes mj2-pop-${uid} {
          0% { opacity: 0; transform: translateY(10px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .mj2-rain-${uid} { animation: mj2-rain-${uid} linear infinite; }
        .mj2-cloud-${uid} { animation: mj2-cloud-${uid} 7s ease-in-out infinite; }
        .mj2-pop-${uid} { animation: mj2-pop-${uid} 420ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .mj2-rain-${uid}, .mj2-cloud-${uid}, .mj2-pop-${uid} { animation: none !important; }
        }
      `}</style>

      {watermarked ? (
        <div
          aria-hidden="true"
          className="relative z-30 flex justify-center border-b border-white/20 bg-[#273754]/92 py-1 font-mono text-[10px] font-bold tracking-[0.18em] text-[#FDE68A]"
        >
          {copy.previewBanner}
        </div>
      ) : null}

      {/* =====================================================================
          1. LIVING SKY-TO-MEADOW BANNER (Inspired by Picnic Scrapbook + Dreamy Sky)
         ===================================================================== */}
      <header
        className="relative overflow-hidden px-4 pb-8 pt-5 text-center transition-all duration-1000"
        style={{ background: skyGradient }}
      >
        {/* Soft Rain Streaks (fade away as offerings are accepted / forgiven) */}
        {!forgiven ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700"
            style={{ opacity: Math.max(0.1, 0.85 - acceptedCount * 0.2) }}
          >
            {RAIN_STREAKS.map((drop, i) => (
              <span
                key={`drop-${i}`}
                className={`mj2-rain-${uid} absolute top-0 w-[1.5px] rounded-full bg-white/60`}
                style={{
                  left: drop.left,
                  height: drop.height,
                  animationDelay: drop.delay,
                  animationDuration: drop.dur,
                }}
              />
            ))}
          </div>
        ) : null}

        {/* Pastel Rainbow Arc When Forgiven */}
        {forgiven ? (
          <svg
            viewBox="0 0 360 120"
            className="pointer-events-none absolute inset-x-0 top-2 mx-auto h-32 w-full max-w-md opacity-75"
            fill="none"
            aria-hidden="true"
          >
            <path d="M30 115 A150 105 0 0 1 330 115" stroke="#FDA4AF" strokeWidth="7" strokeLinecap="round" />
            <path d="M40 115 A140 95 0 0 1 320 115" stroke="#FDE68A" strokeWidth="7" strokeLinecap="round" />
            <path d="M50 115 A130 85 0 0 1 310 115" stroke="#A7F3D0" strokeWidth="7" strokeLinecap="round" />
            <path d="M60 115 A120 75 0 0 1 300 115" stroke="#BAE6FD" strokeWidth="7" strokeLinecap="round" />
          </svg>
        ) : null}

        {/* Puffy Floating Clouds */}
        <svg
          viewBox="0 0 120 44"
          className={`mj2-cloud-${uid} pointer-events-none absolute -left-4 top-8 h-11 w-28 opacity-80`}
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M14 36 H102 C110 36 114 28 108 22 C104 18 98 18 94 20 C91 10 78 6 68 12 C62 4 46 4 40 14 C30 11 18 16 16 25 C10 26 8 36 14 36 Z"
            fill={forgiven ? '#FFFFFF' : '#CBD5E1'}
          />
        </svg>
        <svg
          viewBox="0 0 120 44"
          className={`mj2-cloud-${uid} pointer-events-none absolute -right-4 top-12 h-10 w-24 opacity-75`}
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M14 36 H102 C110 36 114 28 108 22 C104 18 98 18 94 20 C91 10 78 6 68 12 C62 4 46 4 40 14 C30 11 18 16 16 25 C10 26 8 36 14 36 Z"
            fill={forgiven ? '#FFFFFF' : '#CBD5E1'}
          />
        </svg>

        {/* Top Pills */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
          <span
            style={hindiSafe}
            className={`inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-sm ${
              isHindi ? '' : 'font-mono uppercase tracking-[0.14em]'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${forgiven ? 'bg-[#FDE68A]' : 'bg-[#93C5FD]'}`}
              aria-hidden="true"
            />
            {forgiven ? copy.skyBadgeClear : copy.skyBadgeStorm}
          </span>

          <span className="rounded-full border border-white/35 bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
            {copy.forPrefix} {receiver}
          </span>
        </div>

        {/* Apology Bear + Mood Pill */}
        <div className="relative z-10 mt-3 flex flex-col items-center">
          <ApologyBearSvg mood={bearMood} sunlit={forgiven} />
          <span
            style={hindiSafe}
            className="mt-1 inline-flex rounded-full bg-white/90 px-3.5 py-1 text-xs font-bold text-[#352329] shadow-xs"
          >
            {copy.moodCaptions[bearMood]}
          </span>
        </div>

        {/* Rolling Green Meadow Hills Along Bottom of Sky Header */}
        <svg
          viewBox="0 0 400 38"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-8 w-full"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0 24 Q100 2 210 20 T400 16 V38 H0 Z"
            fill={forgiven ? '#689F59' : '#4E6B58'}
          />
          <path
            d="M0 30 Q140 12 270 26 T400 22 V38 H0 Z"
            fill={forgiven ? '#84BA6E' : '#5F7D66'}
          />
        </svg>
      </header>

      {/* =====================================================================
          MAIN PINK GINGHAM PICNIC WORKSPACE
         ===================================================================== */}
      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pb-6 pt-5">
        {/* Weather Clearing Progress Card */}
        <section className="rounded-2xl border border-[#EAB6C4] bg-white/90 px-4 py-3 shadow-xs backdrop-blur-xs">
          <div className="flex items-center justify-between gap-2">
            <span
              style={hindiSafe}
              className={`text-[10px] font-bold text-[#8E354A] ${
                isHindi ? '' : 'font-mono uppercase tracking-[0.16em]'
              }`}
            >
              {copy.meterLabel}
            </span>
            <span className="font-mono text-[11px] font-bold text-[#8E354A]">{meterPct}%</span>
          </div>
          <div
            className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#FDE4EA]"
            role="progressbar"
            aria-valuenow={meterPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={copy.meterLabel}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.max(10, meterPct)}%`,
                background: forgiven
                  ? 'linear-gradient(90deg, #FB7185 0%, #FBBF24 50%, #34D399 100%)'
                  : 'linear-gradient(90deg, #60A5FA 0%, #F472B6 100%)',
              }}
            />
          </div>
          <p style={hindiSafe} className="mt-1.5 text-[11.5px] font-medium text-[#6B3F4C]">
            {forgiven
              ? copy.meterForgiven
              : acceptedCount === STICKY_OFFERINGS.length
                ? copy.meterReady
                : copy.meterHint(acceptedCount, STICKY_OFFERINGS.length)}
          </p>
        </section>

        {/* =====================================================================
            2. WIRE-O SPIRAL-BOUND APOLOGY NOTEBOOK (Torn Kraft Tape + Ruled Paper)
           ===================================================================== */}
        <section
          aria-label={copy.kraftTapeTitle}
          className="relative pt-3"
        >
          {/* Metallic Wire-O Spiral Binding Rings Along Top Spine */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 top-0 z-20 flex items-center justify-between"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={`ring-${i}`}
                className="flex h-6 w-2.5 flex-col items-center justify-between rounded-full border-2 border-[#52525B] bg-gradient-to-b from-[#E4E4E7] via-[#A1A1AA] to-[#52525B] shadow-2xs"
              />
            ))}
          </div>

          <div
            className="relative overflow-hidden rounded-[22px] border border-[#E5D4C8] bg-[#FFFDF9] px-5 pb-6 pt-8 shadow-[0_18px_36px_-18px_rgba(92,38,54,0.28)]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(180deg, transparent 0px, transparent 29px, rgba(219, 178, 190, 0.24) 29px, rgba(219, 178, 190, 0.24) 30px)',
            }}
          >
            {/* Torn Kraft-Paper Header Patch (Straight from Picnic Scrapbook Reference!) */}
            <div className="mb-4 flex items-center justify-between gap-2">
              <span
                style={hindiSafe}
                className="inline-block -rotate-1 rounded-[4px] border border-[#A67C52]/40 bg-[#C19A72] px-3.5 py-1.5 font-heading text-xs font-bold tracking-wide text-[#FFFDF9] shadow-xs"
              >
                {copy.kraftTapeTitle}
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#9E6B77]">
                PAGE 01
              </span>
            </div>

            <h1
              style={hindiSafe}
              className={`break-words font-heading text-2xl font-bold leading-snug text-[#352329] sm:text-[26px] ${
                isHindi || hasDevanagari(headlineText) ? 'not-italic' : 'italic'
              }`}
            >
              {headlineText}
            </h1>

            <p
              style={hindiSafe}
              className="mt-3 break-words font-serif text-[15px] leading-[1.95] text-[#4A3239]"
            >
              {messageText}
            </p>

            <p className="mt-4 text-right font-heading text-base font-bold italic text-[#BE185D]">
              — {sender}
            </p>
          </div>
        </section>

        {/* =====================================================================
            3. 4 PASTEL PAPER-CLIPPED STICKY-NOTE PEACE OFFERINGS
           ===================================================================== */}
        <section aria-label={copy.stickyHeading} className="space-y-3">
          <div className="text-center">
            <h2
              style={hindiSafe}
              className="font-heading text-xl font-bold text-[#4A1D2C]"
            >
              {copy.stickyHeading}
            </h2>
            <p style={hindiSafe} className="mt-0.5 text-xs text-[#7A4455]">
              {copy.stickySub}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5 pt-2">
            {STICKY_OFFERINGS.map((item, idx) => {
              const accepted = acceptedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleNote(item.id, idx)}
                  aria-pressed={accepted}
                  style={{
                    backgroundColor: item.bg,
                    borderColor: accepted ? '#BE185D' : item.border,
                    color: item.ink,
                  }}
                  className={`group relative flex min-h-[122px] flex-col justify-between rounded-[6px] border-2 p-3.5 pt-5 text-left shadow-[0_12px_22px_-12px_rgba(74,29,44,0.35)] transition-all duration-200 hover:z-10 hover:rotate-0 hover:scale-[1.02] active:scale-[0.97] ${item.tilt}`}
                >
                  {/* Realistic Metallic Paperclip Pinned at Top Corner */}
                  <PaperclipSvg className="pointer-events-none absolute -top-3.5 left-3 h-9 w-5 rotate-[-8deg]" />

                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] font-bold opacity-70">{item.num}</span>
                    {accepted ? (
                      <span className="-rotate-3 rounded border border-[#BE185D] bg-white/85 px-1.5 py-0.5 font-mono text-[8.5px] font-bold text-[#BE185D]">
                        {copy.acceptedStamp}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2">
                    <p style={hindiSafe} className="font-heading text-sm font-bold leading-snug">
                      {item.title[coreLang]}
                    </p>
                    <p style={hindiSafe} className="mt-1 text-[11px] font-medium opacity-80">
                      {item.note[coreLang]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Optional User Polaroids Tucked on Picnic Cloth */}
        {hasPhotos ? (
          <section aria-label={copy.photosHeading} className="space-y-1.5">
            <p
              style={hindiSafe}
              className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#8E354A]"
            >
              {copy.photosHeading}
            </p>
            <OccasionPhotoGallery
              photos={data.photos}
              accentColor="#BE185D"
              surfaceTint="#FFF5F7"
              captionPrefix={copy.photoPrefix}
              variant="polaroid"
            />
          </section>
        ) : null}

        {/* =====================================================================
            4. FORGIVENESS VERDICT / SUNLIT PEACE TREATY & MAKE-UP COUPONS
           ===================================================================== */}
        <section className="space-y-3 pt-1 text-center">
          {!forgiven ? (
            <>
              <button
                type="button"
                onClick={handleForgive}
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-r from-[#D9467A] via-[#E11D48] to-[#F59E0B] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_-10px_rgba(225,29,72,0.55)] transition hover:brightness-105 active:scale-[0.98]"
              >
                {copy.forgiveCta}
              </button>

              <button
                type="button"
                onClick={() => {
                  playRaindropPluck(poutCount);
                  setPoutCount((c) => c + 1);
                }}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#DFB6C3] bg-white/85 px-5 py-2 text-xs font-semibold text-[#6B3F4C] transition hover:bg-white active:scale-[0.98]"
              >
                {copy.poutCta}
              </button>

              {poutReply ? (
                <p
                  key={`pout-${poutCount}`}
                  role="status"
                  style={hindiSafe}
                  className={`mj2-pop-${uid} mx-auto max-w-xs rounded-2xl border border-[#EAB6C4] bg-white/95 px-4 py-2.5 text-xs font-semibold text-[#5A2939] shadow-xs`}
                >
                  {poutReply}
                </p>
              ) : null}
            </>
          ) : (
            <div
              className={`mj2-pop-${uid} space-y-4 rounded-[26px] border-2 border-[#EAB6C4] bg-[#FFFDF9] p-5 shadow-[0_18px_36px_-16px_rgba(190,24,93,0.3)]`}
            >
              <span
                style={hindiSafe}
                className={`inline-block rounded-full border border-emerald-300 bg-emerald-50 px-3 py-0.5 text-[10px] font-bold text-emerald-800 ${
                  isHindi ? '' : 'font-mono uppercase tracking-[0.16em]'
                }`}
              >
                {copy.truceBadge}
              </span>

              <h2
                style={hindiSafe}
                className="break-words font-heading text-2xl font-bold leading-snug text-[#4A1D2C]"
              >
                {copy.forgivenTitle(receiver)}
              </h2>
              <p style={hindiSafe} className="break-words text-xs leading-relaxed text-[#6B3F4C]">
                {copy.forgivenSub(sender)}
              </p>

              {/* 3 Perforated Make-Up Date Coupons */}
              <div className="space-y-2 rounded-2xl border border-dashed border-[#DFB6C3] bg-[#FFF6F8] p-3 text-left">
                <p
                  style={hindiSafe}
                  className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#8E354A]"
                >
                  {copy.couponHeading}
                </p>
                <div className="space-y-1.5">
                  {MAKEUP_COUPONS.map((coupon, idx) => {
                    const active = pickedCouponId === coupon.id;
                    return (
                      <button
                        key={coupon.id}
                        type="button"
                        onClick={() => {
                          playPaperUnsealSfx(idx);
                          setPickedCouponId(coupon.id);
                        }}
                        aria-pressed={active}
                        className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition active:scale-[0.98] ${
                          active
                            ? 'border-[#BE185D] bg-[#BE185D] text-white shadow-xs'
                            : 'border-[#EAB6C4] bg-white text-[#4A1D2C] hover:border-[#BE185D]/50'
                        }`}
                      >
                        <span style={hindiSafe} className="text-xs font-bold">
                          {coupon.label[coreLang]}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'border border-[#EAB6C4] bg-[#FFF5F7] text-[#8E354A]'
                          }`}
                        >
                          {coupon.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <OccasionCassettePlayer
                trackTitle={copy.soundtrackTitle}
                mood="uplifting"
                tapLabel={copy.soundtrackTap}
                playingLabel={copy.soundtrackPlaying}
                accentColor="#BE185D"
              />

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => void handleCopyVerdict()}
                  className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-gradient-to-r from-[#BE185D] to-[#F59E0B] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-105 active:scale-[0.98]"
                >
                  {copy.copyVerdictCta}
                </button>

                {copiedVerdict ? (
                  <p role="status" className="text-xs font-semibold text-emerald-700">
                    {copy.copiedVerdictToast}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={handleReplay}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#DFB6C3] bg-[#FFF5F7] px-4 py-2 text-xs font-semibold text-[#8E354A] transition hover:bg-[#FDE4EA] active:scale-[0.98]"
                >
                  {copy.replayCta}
                </button>
              </div>
            </div>
          )}
        </section>

        <footer className="mt-auto border-t border-[#EAB6C4]/70 pt-3 text-center text-[11px] font-medium text-[#7A4455]">
          {getWebzyFooterLabel(language)}
        </footer>
      </main>
    </article>
  );
}
