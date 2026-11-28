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

type CarePromiseId = 'chai' | 'flowers' | 'listen' | 'sunset';
type CouponId = 'chai-walk' | 'picnic-treat' | 'cozy-evening';

const CARE_ART = {
  warmRainChai: '/templates/occasions/maan-jao/warm-rain-chai-art.jpg',
  meadowPicnic: '/templates/occasions/maan-jao/meadow-picnic-care-art.jpg',
  goldenWalk: '/templates/occasions/maan-jao/golden-walk-art.jpg',
} as const;

interface CareScenePlate {
  id: 'chai' | 'picnic' | 'walk';
  src: string;
  tag: Record<CoreLanguageCode, string>;
  title: Record<CoreLanguageCode, string>;
  whisper: Record<CoreLanguageCode, string>;
}

const CARE_SCENE_PLATES: readonly CareScenePlate[] = [
  {
    id: 'chai',
    src: CARE_ART.warmRainChai,
    tag: { en: 'WARMTH', hinglish: 'SUKOON', hi: 'अपनापन' },
    title: {
      en: 'Two Warm Cups Waiting',
      hinglish: 'Do Garam Cup Intezaar Mein',
      hi: 'दो गरम कप और शांत शाम',
    },
    whisper: {
      en: 'Even when clouds drift in, my favorite seat in the world is still right beside you.',
      hinglish: 'Chahe thodi si narazgi ho, duniya mein meri sabse pyaari jagah aaj bhi tumhare paas hai.',
      hi: 'चाहे हल्की सी नाराज़गी हो, मेरी सबसे प्रिय जगह आज भी तुम्हारे पास ही है।',
    },
  },
  {
    id: 'picnic',
    src: CARE_ART.meadowPicnic,
    tag: { en: 'TENDERNESS', hinglish: 'KHYAAL', hi: 'स्नेह' },
    title: {
      en: 'Everything You Love, Packed',
      hinglish: 'Tumhari Pasand Ka Sab Kuch',
      hi: 'तुम्हारी हर पसंद का ख़याल',
    },
    whisper: {
      en: 'Fresh strawberries, warm pastries, wildflowers, and an unhurried afternoon where it is only us.',
      hinglish: 'Taaze phool, tumhara fav snack aur ek sukoon bhari shaam jahan sirf hum dono hon.',
      hi: 'ताज़े फूल, तुम्हारी पसंदीदा मिठाई और एक सुकून भरी दोपहर जहाँ सिर्फ़ हम दोनों हों।',
    },
  },
  {
    id: 'walk',
    src: CARE_ART.goldenWalk,
    tag: { en: 'DEVOTION', hinglish: 'SAATH', hi: 'समर्पण' },
    title: {
      en: 'An Unhurried Golden Walk',
      hinglish: 'Sunahri Shaam Ki Walk',
      hi: 'सुनहरी शाम की सैर',
    },
    whisper: {
      en: 'No rushing, no ego — just holding your hand while the golden light settles over the trees.',
      hinglish: 'Koi jaldi nahi, koi ego nahi — bas tumhara haath thaam kar saath chalna hai.',
      hi: 'कोई जल्दी नहीं, कोई अहंकार नहीं — बस तुम्हारा हाथ थामकर सुनहरी शाम में साथ चलना है।',
    },
  },
];

interface StickyCareNote {
  id: CarePromiseId;
  num: string;
  bg: string;
  border: string;
  ink: string;
  tilt: string;
  title: Record<CoreLanguageCode, string>;
  note: Record<CoreLanguageCode, string>;
}

const STICKY_CARE_NOTES: readonly StickyCareNote[] = [
  {
    id: 'chai',
    num: '01',
    bg: '#FDE8D7',
    border: '#E5B996',
    ink: '#5A2E14',
    tilt: '-rotate-2',
    title: {
      en: 'Two Cups of Masala Chai',
      hinglish: 'Garam Masala Chai',
      hi: 'गरम मसाला चाय',
    },
    note: {
      en: 'Poured warm by the window',
      hinglish: 'Khidki ke paas saath mein',
      hi: 'खिड़की के पास साथ में',
    },
  },
  {
    id: 'flowers',
    num: '02',
    bg: '#F8DCE4',
    border: '#DFABB9',
    ink: '#5B1F32',
    tilt: 'rotate-1',
    title: {
      en: 'Daisies & Lavender',
      hinglish: 'Taaze Phoolon Ka Guldasta',
      hi: 'ताज़े फूलों का गुलदस्ता',
    },
    note: {
      en: 'Hand-tied with quiet care',
      hinglish: 'Pyaar aur khyaal se',
      hi: 'स्नेह और ख़याल के साथ',
    },
  },
  {
    id: 'listen',
    num: '03',
    bg: '#DCEBD8',
    border: '#A9CAA2',
    ink: '#224426',
    tilt: '-rotate-1',
    title: {
      en: 'My Undivided Heart',
      hinglish: 'Poora Dhyaan Sirf Tum Par',
      hi: 'संपूर्ण मन से सुनना',
    },
    note: {
      en: 'Listening first, zero ego',
      hinglish: 'Bina kisi bahane ke',
      hi: 'बिना किसी बहाने के',
    },
  },
  {
    id: 'sunset',
    num: '04',
    bg: '#FDF0C4',
    border: '#E2C679',
    ink: '#57400B',
    tilt: 'rotate-2',
    title: {
      en: 'Golden Evening Drive',
      hinglish: 'Sunset Drive & Dessert',
      hi: 'सुनहरी शाम और मिठाई',
    },
    note: {
      en: 'Your playlist, your spot',
      hinglish: 'Tumhare gaane, tumhari jagah',
      hi: 'तुम्हारे गीत, तुम्हारी पसंद',
    },
  },
];

const MAKEUP_COUPONS: ReadonlyArray<{
  id: CouponId;
  code: string;
  artSrc: string;
  label: Record<CoreLanguageCode, string>;
}> = [
  {
    id: 'chai-walk',
    code: 'CARE-01',
    artSrc: CARE_ART.goldenWalk,
    label: {
      en: 'Golden Walk & Warm Chai',
      hinglish: 'Sunset Walk & Garam Chai',
      hi: 'सुनहरी सैर और गरम चाय',
    },
  },
  {
    id: 'picnic-treat',
    code: 'CARE-02',
    artSrc: CARE_ART.meadowPicnic,
    label: {
      en: 'Picnic Basket & Favorite Food',
      hinglish: 'Tumhara Fav Food & Picnic',
      hi: 'तुम्हारा पसंदीदा खाना व पिकनिक',
    },
  },
  {
    id: 'cozy-evening',
    code: 'CARE-03',
    artSrc: CARE_ART.warmRainChai,
    label: {
      en: 'Cozy Zero-Phone Evening',
      hinglish: 'No-Phone Cozy Evening',
      hi: 'बिना फ़ोन सुकून भरी शाम',
    },
  },
];

interface CareCopy {
  previewBanner: string;
  heroBadgeDusk: string;
  heroBadgeMeadow: string;
  heroBadgeGolden: string;
  forPrefix: string;
  heroCaptionDusk: string;
  heroCaptionMeadow: string;
  heroCaptionGolden: string;
  warmthMeterLabel: string;
  warmthHint: (c: number, t: number) => string;
  warmthReady: string;
  warmthRestored: string;
  scenesEyebrow: string;
  scenesHeading: string;
  kraftTapeTitle: string;
  stickyHeading: string;
  stickySub: string;
  promisedStamp: string;
  photosHeading: string;
  photoPrefix: string;
  forgiveCta: string;
  spoilMoreCta: string;
  spoilMoreReplies: readonly [string, string, string, string];
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

const COPY_BY_LANG: Record<CoreLanguageCode, CareCopy> = {
  en: {
    previewBanner: 'WEBZY FREE PREVIEW',
    heroBadgeDusk: 'WARM CHAI & QUIET CARE',
    heroBadgeMeadow: 'SUNBEAMS BREAKING THROUGH',
    heroBadgeGolden: 'GOLDEN PEACE RESTORED',
    forPrefix: 'For',
    heroCaptionDusk: 'I already poured two warm cups and saved the quiet window seat for us.',
    heroCaptionMeadow: 'Every promise brings back the afternoon sun and pink-gingham warmth.',
    heroCaptionGolden: 'Thank you for letting love speak louder than a rough moment.',
    warmthMeterLabel: 'WARMTH & CARE METER',
    warmthHint: (c, t) => `${c} / ${t} care promises accepted — tap the clipped notes below`,
    warmthReady: 'All 4 care promises accepted — the golden sky is wide open!',
    warmthRestored: '100% Warmth Restored — Always On Your Team',
    scenesEyebrow: 'THREE MOMENTS I WANT TO SHARE WITH YOU',
    scenesHeading: 'What You Mean To Me',
    kraftTapeTitle: 'always on your side',
    stickyHeading: 'Four Clipped Care Promises',
    stickySub: 'Tap each paper-clipped note to accept it and brighten the painting above.',
    promisedStamp: 'PROMISED',
    photosHeading: 'Favorite Moments Together',
    photoPrefix: 'Memory',
    forgiveCta: 'Come Here, Let’s Make Up',
    spoilMoreCta: 'Spoil me a little more first',
    spoilMoreReplies: [
      'Gladly — bringing fresh daisies, warm chai, and zero excuses.',
      'Take all the time you need. I am right here, completely on your side.',
      'Adding your favorite dessert and a long golden-hour drive to the plan.',
      'Your smile is worth every single effort — always.',
    ],
    truceBadge: 'WRITTEN WITH CARE & DEVOTION',
    forgivenTitle: (r) => `You mean the world to me, ${r}`,
    forgivenSub: (s) => `${s} promises to hold your heart gently, listen deeply, and always choose us.`,
    couponHeading: 'Pick How I Should Spoil You Next',
    soundtrackTitle: 'Golden Hour Meadow · Side A',
    soundtrackTap: 'Play Warm Melody',
    soundtrackPlaying: 'Playing Golden Melody...',
    copyVerdictCta: 'Copy My Sweet Reply for WhatsApp',
    copiedVerdictToast: 'Copied! Ready to paste back on WhatsApp.',
    replayCta: 'Replay From Rainy Dusk',
    defaultHeadline: (r) => `${r}, you mean way too much to me`,
    defaultMessage:
      'I never want to be the reason your heart feels heavy. You deserve patience, warmth, and someone who always shows up gently for you. Let me hold your hand, make you warm chai, and turn this evening golden again.',
  },
  hinglish: {
    previewBanner: 'WEBZY FREE PREVIEW',
    heroBadgeDusk: 'GARAM CHAI & DIL SE KHYAAL',
    heroBadgeMeadow: 'SUNAHRI DHOOP AA RAHI HAI',
    heroBadgeGolden: 'PYAAR AUR SUKOON WAPAS',
    forPrefix: 'Sirf',
    heroCaptionDusk: 'Khidki ke paas do garam cup chai aur taaze phool tumhara intezaar kar rahe hain.',
    heroCaptionMeadow: 'Har chhote waade ke saath phir se khilti dhoop wapas aa rahi hai.',
    heroCaptionGolden: 'Shukriya ki tumne hamesha ki tarah hamare pyaar ko chuna.',
    warmthMeterLabel: 'PYAAR AUR KHYAAL METER',
    warmthHint: (c, t) => `${c} / ${t} waade accept hue — neeche clipped notes par tap karo`,
    warmthReady: 'Sabhi 4 waade accept! Khilti dhoop wapas aa gayi!',
    warmthRestored: '100% Pyaar Aur Sukoon — Hamesha Tumhare Saath',
    scenesEyebrow: 'TEEN PAL JO TUMHARE SAATH JEENA CHAHTA HOON',
    scenesHeading: 'Tum Mere Liye Kitni Khaas Ho',
    kraftTapeTitle: 'hamesha tumhare saath',
    stickyHeading: 'Chaar Pyaar Bhare Waade',
    stickySub: 'Har paper-clipped note par tap karo aur upar ka mausam sunahra banao.',
    promisedStamp: 'PAKKA',
    photosHeading: 'Hamari Pyaari Yaadein',
    photoPrefix: 'Yaad',
    forgiveCta: 'Chalo Maan Jao, Paas Aao',
    spoilMoreCta: 'Thoda aur pyaar se manao',
    spoilMoreReplies: [
      'Bilkul — taaze phool, garam chai aur poora waqt sirf tumhare liye.',
      'Jitna waqt chahiye lo. Main hamesha pyaar se tumhare saath khada hoon.',
      'Tumhari fav sweet aur ek lambi sunset drive bhi pakki kar di hai.',
      'Tumhari ek chhoti si muskaan mere liye sabse badhkar hai.',
    ],
    truceBadge: 'DIL SE SULAH & WAADA',
    forgivenTitle: (r) => `Tum meri poori duniya ho, ${r}`,
    forgivenSub: (s) => `${s} ka waada hai — hamesha tumhara khyaal rakhunga, dhyaan se sununga aur pyaar se manaunga.`,
    couponHeading: 'Chuno Aaj Tumhe Kaise Spoil Karun',
    soundtrackTitle: 'Sunahri Shaam · Side A',
    soundtrackTap: 'Pyaari Dhun Chalao',
    soundtrackPlaying: 'Dhun Chal Rahi Hai...',
    copyVerdictCta: 'Mera Pyaara Reply Copy Karo',
    copiedVerdictToast: 'Copy ho gaya! Seedha WhatsApp par bhej do.',
    replayCta: 'Phir Se Dekho',
    defaultHeadline: (r) => `${r}, tum mere liye sabse khaas ho`,
    defaultMessage:
      'Main kabhi nahi chahta ki meri wajah se tumhara man udaas ho. Tum sirf sukoon, izzat aur dher saare pyaar ki haqdaar ho. Chalo garam chai aur phoolon ke saath is shaam ko phir se sunahra banate hain.',
  },
  hi: {
    previewBanner: 'WEBZY FREE PREVIEW',
    heroBadgeDusk: 'गरम चाय और शांत अपनापन',
    heroBadgeMeadow: 'सुनहरी धूप खिल रही है',
    heroBadgeGolden: 'स्नेह और शांति पुनः लौटी',
    forPrefix: 'प्रिय',
    heroCaptionDusk: 'खिड़की के पास दो गरम चाय के कप और ताज़े फूल तुम्हारी प्रतीक्षा कर रहे हैं।',
    heroCaptionMeadow: 'हर कोमल वादे के साथ सुनहरी धूप फिर से खिलती जा रही है।',
    heroCaptionGolden: 'प्रेम और अपनेपन को चुनने के लिए हृदय से धन्यवाद।',
    warmthMeterLabel: 'स्नेह और ख़याल पैमाना',
    warmthHint: (c, t) => `${c} / ${t} वादे स्वीकार — नीचे लगे नोट्स पर टैप करें`,
    warmthReady: 'सभी 4 वादे स्वीकार हुए — सुनहरी धूप खिल उठी है!',
    warmthRestored: '100% स्नेह और शांति — सदैव तुम्हारे साथ',
    scenesEyebrow: 'तीन पल जो तुम्हारे साथ जीना चाहता हूँ',
    scenesHeading: 'तुम मेरे लिए कितनी विशेष हो',
    kraftTapeTitle: 'सदैव तुम्हारे साथ',
    stickyHeading: 'चार स्नेह भरे वादे',
    stickySub: 'प्रत्येक स्टिकी नोट पर टैप करें और ऊपर का दृश्य सुनहरा बनाएँ।',
    promisedStamp: 'वचनबद्ध',
    photosHeading: 'हमारी मधुर यादें',
    photoPrefix: 'याद',
    forgiveCta: 'आओ, फिर से मुस्कुराते हैं',
    spoilMoreCta: 'थोड़ा और प्यार से मनाओ',
    spoilMoreReplies: [
      'सदैव — ताज़े फूल, गरम चाय और बिना किसी बहाने के पूरा समय तुम्हारा।',
      'जितना समय चाहिए लो, मैं पूरी कोमलता के साथ यहीं तुम्हारे पास हूँ।',
      'तुम्हारी पसंदीदा मिठाई और एक शांत सुनहरी सैर भी तय कर दी है।',
      'तुम्हारी एक सच्ची मुस्कान मेरे लिए सबसे अनमोल है।',
    ],
    truceBadge: 'स्नेह और समर्पण पत्रिका',
    forgivenTitle: (r) => `तुम मेरे लिए बेहद अनमोल हो, ${r}`,
    forgivenSub: (s) => `${s} का वादा है कि सदैव तुम्हारी भावनाओं का सम्मान करूँगा और तुम्हारा ख़याल रखूँगा।`,
    couponHeading: 'चुनो आज तुम्हें कैसे खुश करूँ',
    soundtrackTitle: 'सुनहरी शाम · साइड A',
    soundtrackTap: 'मधुर धुन सुनें',
    soundtrackPlaying: 'धुन बज रही है...',
    copyVerdictCta: 'मेरा प्यारा जवाब कॉपी करें (WhatsApp)',
    copiedVerdictToast: 'कॉपी हो गया! सीधे WhatsApp पर भेज दें।',
    replayCta: 'फिर से देखें',
    defaultHeadline: (r) => `${r}, तुम मेरे लिए बेहद ख़ास हो`,
    defaultMessage:
      'मैं कभी नहीं चाहता कि मेरी वजह से तुम्हारा मन उदास हो। तुम हमेशा स्नेह, धैर्य और सम्मान की अधिकारिणी हो। आइए गरम चाय और शांत शाम के साथ फिर से मुस्कुराते हैं।',
  },
};

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
 * Romantic Warmth, Care & Golden Reconciliation Folio ("Pretty Please / Maan Jao" — `maan-jao-01`).
 * Zero crying or sad faces — anchored by 3 bespoke painterly fine-art illustrations that
 * crossfade smoothly from cozy rainy-dusk masala chai to a sunlit rainbow picnic meadow
 * and a lantern-lit golden-hour garden walk, paired with a 3-scene appreciation gallery,
 * Wire-O spiral care notebook, 4 paper-clipped promises, and visual make-up date coupons.
 */
export function MaanJaoSite({
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const uid = useId().replace(/:/g, '');
  const [acceptedIds, setAcceptedIds] = useState<CarePromiseId[]>([]);
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const [forgiven, setForgiven] = useState(false);
  const [spoilCount, setSpoilCount] = useState(0);
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
  const showMeadowHero = !forgiven && acceptedCount >= 2;

  const activeHeroSrc = forgiven
    ? CARE_ART.goldenWalk
    : showMeadowHero
      ? CARE_ART.meadowPicnic
      : CARE_ART.warmRainChai;

  const activeHeroBadge = forgiven
    ? copy.heroBadgeGolden
    : showMeadowHero
      ? copy.heroBadgeMeadow
      : copy.heroBadgeDusk;

  const activeHeroCaption = forgiven
    ? copy.heroCaptionGolden
    : showMeadowHero
      ? copy.heroCaptionMeadow
      : copy.heroCaptionDusk;

  const hasPhotos = Boolean(
    data.photos?.some((src) => typeof src === 'string' && src.trim().length > 0),
  );

  const activeScene = CARE_SCENE_PLATES[activeSceneIdx] ?? CARE_SCENE_PLATES[0];
  const spoilReply =
    spoilCount > 0 ? copy.spoilMoreReplies[(spoilCount - 1) % copy.spoilMoreReplies.length] : null;

  function handleToggleNote(id: CarePromiseId, idx: number) {
    playRaindropPluck(idx);
    setAcceptedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function handleForgive() {
    playLanternPullChime();
    setAcceptedIds(STICKY_CARE_NOTES.map((n) => n.id));
    setForgiven(true);
    setSpoilCount(0);
    onOpened?.();
  }

  function handleReplay() {
    setForgiven(false);
    setAcceptedIds([]);
    setSpoilCount(0);
  }

  async function handleCopyVerdict() {
    const chosen = MAKEUP_COUPONS.find((c) => c.id === pickedCouponId) ?? MAKEUP_COUPONS[0];
    const text =
      coreLang === 'hi'
        ? `मान गई ${sender}! अब "${chosen.label.hi}" (${chosen.code}) पक्का रहा।`
        : coreLang === 'hinglish'
          ? `Maan gayi ${sender}! "${chosen.label.hinglish}" (${chosen.code}) lock kar diya hai.`
          : `You win my heart, ${sender}! Redeeming "${chosen.label.en}" (${chosen.code}) soon.`;
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

  return (
    <article
      aria-label={copy.heroBadgeDusk}
      className="relative flex min-h-full w-full flex-col overflow-x-clip rounded-[28px] text-[#3B2329]"
      style={{
        backgroundColor: '#FFF6F7',
        backgroundImage:
          'linear-gradient(90deg, rgba(235, 168, 184, 0.2) 50%, transparent 50%), linear-gradient(rgba(235, 168, 184, 0.2) 50%, transparent 50%)',
        backgroundSize: '34px 34px',
      }}
    >
      <style>{`
        @keyframes mj3-pop-${uid} {
          0% { opacity: 0; transform: translateY(10px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .mj3-pop-${uid} { animation: mj3-pop-${uid} 440ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .mj3-pop-${uid} { animation: none !important; }
        }
      `}</style>

      {watermarked ? (
        <div
          aria-hidden="true"
          className="relative z-30 flex justify-center border-b border-white/20 bg-[#3B2329]/92 py-1 font-mono text-[10px] font-bold tracking-[0.18em] text-[#FDE68A]"
        >
          {copy.previewBanner}
        </div>
      ) : null}

      {/* =====================================================================
          1. LIVING ROMANTIC FINE-ART HERO (Crossfades Warm Chai -> Picnic -> Golden Walk)
         ===================================================================== */}
      <header className="relative overflow-hidden bg-[#2A1D1B]">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={activeHeroSrc}
            src={activeHeroSrc}
            alt={activeHeroBadge}
            className="h-full w-full object-cover transition-all duration-700"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#261614]/90 via-[#261614]/15 to-[#261614]/45"
          />

          {/* Top Bar Badges */}
          <div className="absolute inset-x-3.5 top-3.5 flex flex-wrap items-center justify-between gap-2">
            <span
              style={hindiSafe}
              className={`inline-flex items-center gap-1.5 rounded-full border border-[#FDE68A]/40 bg-[#261614]/75 px-3 py-1 text-[10px] font-bold text-[#FFF7E6] backdrop-blur-sm ${
                isHindi ? '' : 'font-mono uppercase tracking-[0.14em]'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  forgiven ? 'bg-[#FBBF24]' : showMeadowHero ? 'bg-[#86EFAC]' : 'bg-[#FDBA74]'
                }`}
                aria-hidden="true"
              />
              {activeHeroBadge}
            </span>

            <span className="rounded-full border border-white/30 bg-[#261614]/70 px-3 py-1 text-xs font-bold text-[#FFF7E6] backdrop-blur-sm">
              {copy.forPrefix} {receiver}
            </span>
          </div>

          {/* Bottom Romantic Caption Overlay */}
          <div className="absolute inset-x-4 bottom-4 text-center text-[#FFF8EF]">
            <p
              style={hindiSafe}
              className={`mx-auto max-w-sm font-serif text-sm font-medium leading-relaxed drop-shadow ${
                isHindi ? 'not-italic' : 'italic'
              }`}
            >
              {activeHeroCaption}
            </p>
          </div>
        </div>
      </header>

      {/* =====================================================================
          MAIN PINK GINGHAM ROMANTIC CARE WORKSPACE
         ===================================================================== */}
      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pb-6 pt-5">
        {/* Warmth & Care Progress Bar */}
        <section className="rounded-2xl border border-[#EAB6C4] bg-white/92 px-4 py-3 shadow-xs backdrop-blur-xs">
          <div className="flex items-center justify-between gap-2">
            <span
              style={hindiSafe}
              className={`text-[10px] font-bold text-[#8E354A] ${
                isHindi ? '' : 'font-mono uppercase tracking-[0.16em]'
              }`}
            >
              {copy.warmthMeterLabel}
            </span>
            <span className="font-mono text-[11px] font-bold text-[#8E354A]">{meterPct}%</span>
          </div>
          <div
            className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#FDE4EA]"
            role="progressbar"
            aria-valuenow={meterPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={copy.warmthMeterLabel}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.max(12, meterPct)}%`,
                background: 'linear-gradient(90deg, #F59E0B 0%, #FB7185 52%, #BE185D 100%)',
              }}
            />
          </div>
          <p style={hindiSafe} className="mt-1.5 text-[11.5px] font-medium text-[#6B3F4C]">
            {forgiven
              ? copy.warmthRestored
              : acceptedCount === STICKY_CARE_NOTES.length
                ? copy.warmthReady
                : copy.warmthHint(acceptedCount, STICKY_CARE_NOTES.length)}
          </p>
        </section>

        {/* =====================================================================
            2. "WHAT YOU MEAN TO ME" — 3 VISUAL ROMANTIC CARE SCENES
           ===================================================================== */}
        <section
          aria-label={copy.scenesHeading}
          className="space-y-3 rounded-[24px] border border-[#EAB6C4] bg-[#FFFDF9]/95 p-4 shadow-sm"
        >
          <div className="text-center">
            <span
              style={hindiSafe}
              className={`text-[9.5px] font-bold text-[#9A3412] ${
                isHindi ? '' : 'font-mono uppercase tracking-[0.18em]'
              }`}
            >
              {copy.scenesEyebrow}
            </span>
            <h2 style={hindiSafe} className="mt-0.5 font-heading text-xl font-bold text-[#4A1D2C]">
              {copy.scenesHeading}
            </h2>
          </div>

          {/* Featured Art Scene Frame */}
          <div className="relative overflow-hidden rounded-2xl border border-[#DFC7A5] bg-[#2A1D1B]">
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeScene.src}
                alt={activeScene.title[coreLang]}
                className="h-full w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#261614]/88 via-[#261614]/20 to-transparent"
              />
              <div className="absolute inset-x-3.5 bottom-3 text-left text-[#FFF8EF]">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#FDE68A]">
                  {activeScene.tag[coreLang]}
                </span>
                <p style={hindiSafe} className="font-heading text-base font-bold leading-snug">
                  {activeScene.title[coreLang]}
                </p>
                <p style={hindiSafe} className="mt-0.5 font-serif text-xs leading-relaxed text-[#FFF8EF]/92">
                  {activeScene.whisper[coreLang]}
                </p>
              </div>
            </div>
          </div>

          {/* 3 Visual Thumbnail Switchers */}
          <div className="grid grid-cols-3 gap-2">
            {CARE_SCENE_PLATES.map((plate, idx) => {
              const active = idx === activeSceneIdx;
              return (
                <button
                  key={plate.id}
                  type="button"
                  onClick={() => {
                    playPaperUnsealSfx(idx);
                    setActiveSceneIdx(idx);
                  }}
                  aria-pressed={active}
                  className={`overflow-hidden rounded-xl border-2 text-left transition active:scale-[0.97] ${
                    active
                      ? 'border-[#BE185D] shadow-xs'
                      : 'border-[#EAB6C4]/70 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-[#2A1D1B]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={plate.src}
                      alt={plate.title[coreLang]}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="block truncate bg-white px-2 py-1 text-center font-mono text-[9px] font-bold uppercase text-[#5A2939]">
                    {plate.tag[coreLang]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            3. WIRE-O SPIRAL-BOUND CARE NOTEBOOK
           ===================================================================== */}
        <section aria-label={copy.kraftTapeTitle} className="relative pt-3">
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
            className="relative overflow-hidden rounded-[22px] border border-[#E5D4C8] bg-[#FFFDF9] px-5 pb-6 pt-8 shadow-[0_18px_36px_-18px_rgba(92,38,54,0.26)]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(180deg, transparent 0px, transparent 29px, rgba(219, 178, 190, 0.22) 29px, rgba(219, 178, 190, 0.22) 30px)',
            }}
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <span
                style={hindiSafe}
                className="inline-block -rotate-1 rounded-[4px] border border-[#A67C52]/40 bg-[#C19A72] px-3.5 py-1.5 font-heading text-xs font-bold tracking-wide text-[#FFFDF9] shadow-xs"
              >
                {copy.kraftTapeTitle}
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#9E6B77]">
                NOTE 01
              </span>
            </div>

            <h1
              style={hindiSafe}
              className={`break-words font-heading text-2xl font-bold leading-snug text-[#3B2329] sm:text-[26px] ${
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
            4. 4 PASTEL PAPER-CLIPPED CARE PROMISES
           ===================================================================== */}
        <section aria-label={copy.stickyHeading} className="space-y-3">
          <div className="text-center">
            <h2 style={hindiSafe} className="font-heading text-xl font-bold text-[#4A1D2C]">
              {copy.stickyHeading}
            </h2>
            <p style={hindiSafe} className="mt-0.5 text-xs text-[#7A4455]">
              {copy.stickySub}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5 pt-2">
            {STICKY_CARE_NOTES.map((item, idx) => {
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
                  className={`group relative flex min-h-[122px] flex-col justify-between rounded-[8px] border-2 p-3.5 pt-5 text-left shadow-[0_12px_22px_-12px_rgba(74,29,44,0.3)] transition-all duration-200 hover:z-10 hover:rotate-0 hover:scale-[1.02] active:scale-[0.97] ${item.tilt}`}
                >
                  <PaperclipSvg className="pointer-events-none absolute -top-3.5 left-3 h-9 w-5 rotate-[-8deg]" />

                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] font-bold opacity-70">{item.num}</span>
                    {accepted ? (
                      <span className="-rotate-3 rounded border border-[#BE185D] bg-white/85 px-1.5 py-0.5 font-mono text-[8.5px] font-bold text-[#BE185D]">
                        {copy.promisedStamp}
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

        {/* Optional User Polaroids */}
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
              surfaceTint="#FFF6F7"
              captionPrefix={copy.photoPrefix}
              variant="polaroid"
            />
          </section>
        ) : null}

        {/* =====================================================================
            5. ROMANTIC RECONCILIATION & VISUAL MAKE-UP DATE COUPONS
           ===================================================================== */}
        <section className="space-y-3 pt-1 text-center">
          {!forgiven ? (
            <>
              <button
                type="button"
                onClick={handleForgive}
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-r from-[#BE185D] via-[#D9467A] to-[#D97706] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_-10px_rgba(190,24,93,0.5)] transition hover:brightness-105 active:scale-[0.98]"
              >
                {copy.forgiveCta}
              </button>

              <button
                type="button"
                onClick={() => {
                  playRaindropPluck(spoilCount);
                  setSpoilCount((c) => c + 1);
                }}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#DFB6C3] bg-white/90 px-5 py-2 text-xs font-semibold text-[#6B3F4C] transition hover:bg-white active:scale-[0.98]"
              >
                {copy.spoilMoreCta}
              </button>

              {spoilReply ? (
                <p
                  key={`spoil-${spoilCount}`}
                  role="status"
                  style={hindiSafe}
                  className={`mj3-pop-${uid} mx-auto max-w-xs rounded-2xl border border-[#EAB6C4] bg-white/95 px-4 py-2.5 text-xs font-semibold text-[#5A2939] shadow-xs`}
                >
                  {spoilReply}
                </p>
              ) : null}
            </>
          ) : (
            <div
              className={`mj3-pop-${uid} overflow-hidden rounded-[26px] border-2 border-[#EAB6C4] bg-[#FFFDF9] shadow-[0_20px_40px_-16px_rgba(190,24,93,0.3)]`}
            >
              {/* Full-Bleed Golden Walk Art Header Inside Peace Card */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#2A1D1B]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    (MAKEUP_COUPONS.find((c) => c.id === pickedCouponId) ?? MAKEUP_COUPONS[0])
                      .artSrc
                  }
                  alt={copy.truceBadge}
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#261614]/80 via-transparent to-transparent"
                />
                <span
                  style={hindiSafe}
                  className="absolute left-3.5 top-3 inline-block rounded-full border border-[#FDE68A]/60 bg-[#261614]/80 px-3 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#FDE68A] backdrop-blur-xs"
                >
                  {copy.truceBadge}
                </span>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <h2
                    style={hindiSafe}
                    className="break-words font-heading text-2xl font-bold leading-snug text-[#4A1D2C]"
                  >
                    {copy.forgivenTitle(receiver)}
                  </h2>
                  <p style={hindiSafe} className="mt-1 break-words text-xs leading-relaxed text-[#6B3F4C]">
                    {copy.forgivenSub(sender)}
                  </p>
                </div>

                {/* 3 Visual Make-Up Date Coupons */}
                <div className="space-y-2 rounded-2xl border border-dashed border-[#DFB6C3] bg-[#FFF6F8] p-3 text-left">
                  <p
                    style={hindiSafe}
                    className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#8E354A]"
                  >
                    {copy.couponHeading}
                  </p>
                  <div className="space-y-2">
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
                          className={`flex min-h-[54px] w-full items-center gap-3 rounded-xl border p-2 text-left transition active:scale-[0.98] ${
                            active
                              ? 'border-[#BE185D] bg-[#BE185D] text-white shadow-xs'
                              : 'border-[#EAB6C4] bg-white text-[#4A1D2C] hover:border-[#BE185D]/50'
                          }`}
                        >
                          <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-[#2A1D1B]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={coupon.artSrc}
                              alt={coupon.label[coreLang]}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span style={hindiSafe} className="flex-1 text-xs font-bold leading-snug">
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
                    className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-gradient-to-r from-[#BE185D] to-[#D97706] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-105 active:scale-[0.98]"
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
