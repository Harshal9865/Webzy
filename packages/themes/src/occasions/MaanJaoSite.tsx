'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { type CoreLanguageCode, pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  AmbientRainCanvas,
  type CurvedTrackItem,
  CurvedTrackSanctuary,
  WordByWordFadeLine,
} from './shared/OccasionCinematicFX';
import {
  getReplayLabel,
  getWebzyFooterLabel,
  OccasionAdaptiveGallery,
  OccasionArtworkBackdrop,
  type OccasionSiteProps,
} from './shared/OccasionPrimitives';

type GestureId = 'kulhad-chai' | 'fav-dessert' | 'just-listen';
type FinaleState = 'open' | 'forgiven' | 'needs-time';

interface CalmGestureSpec {
  id: GestureId;
  label: Record<CoreLanguageCode, string>;
  detail: Record<CoreLanguageCode, string>;
}

const CALM_GESTURES: readonly CalmGestureSpec[] = [
  {
    id: 'kulhad-chai',
    label: {
      en: 'Hot Kulhad Chai',
      hinglish: 'Hot Kulhad Chai',
      hi: 'गरमा-गरम कुल्हड़ चाय',
    },
    detail: {
      en: 'Slow sips together, warm clay cups, zero rush.',
      hinglish: 'Aaram se saath baithkar garam chai, koi jaldi nahi.',
      hi: 'सुकून से साथ बैठकर चाय, बिना किसी जल्दी के।',
    },
  },
  {
    id: 'fav-dessert',
    label: {
      en: 'Favorite Dessert',
      hinglish: 'Favorite Dessert',
      hi: 'आपकी पसंदीदा मिठाई',
    },
    detail: {
      en: 'Whichever sweet thing brings a quiet smile back.',
      hinglish: 'Jo bhi meetha tumhara mood halka kar de, meri taraf se.',
      hi: 'जो भी मीठा आपका मन हल्का कर दे, मेरी तरफ़ से।',
    },
  },
  {
    id: 'just-listen',
    label: {
      en: 'Just Listen Without Interrupting',
      hinglish: 'Just Listen Without Interrupting',
      hi: 'बिना टोके बस ध्यान से सुनना',
    },
    detail: {
      en: 'Phone face down. Full presence. Every word heard.',
      hinglish: 'Phone side par rakh kar sirf tumhari baat poori tarah sunna.',
      hi: 'फ़ोन अलग रखकर बस आपकी हर बात पूरे मन से सुनना।',
    },
  },
];

interface PromiseFallback {
  title: Record<CoreLanguageCode, string>;
  detail: Record<CoreLanguageCode, string>;
}

const PROMISE_FALLBACKS: readonly PromiseFallback[] = [
  {
    title: {
      en: 'Owning it cleanly',
      hinglish: 'Bina bahane ke maafi',
      hi: 'बिना किसी बहाने के',
    },
    detail: {
      en: 'No defending my tone or shifting blame. I was wrong, and I see why it hurt.',
      hinglish: 'Na koi safai, na koi ego. Galti meri thi aur mujhe iska poora ehsaas hai.',
      hi: 'न कोई सफ़ाई, न कोई ज़िद। गलती मेरी थी और मुझे आपकी तकलीफ़ का पूरा एहसास है।',
    },
  },
  {
    title: {
      en: 'Listening before reacting',
      hinglish: 'React karne se pehle sunna',
      hi: 'बोलने से पहले सुनना',
    },
    detail: {
      en: 'Slowing down in tense moments so you always feel heard, never talked over.',
      hinglish: 'Jab baat bhaari ho tab ruk kar pehle tumhe samajhna, bolna baad mein.',
      hi: 'कठिन पलों में पहले ठहरकर आपकी बात समझना, अपनी बात बाद में रखना।',
    },
  },
  {
    title: {
      en: 'Protecting your peace',
      hinglish: 'Tumhara sukoon sabse upar',
      hi: 'आपका सुकून सबसे पहले',
    },
    detail: {
      en: 'Being right never matters more than keeping things gentle between us.',
      hinglish: 'Kisi bhi baat ko jeetne se zyada zaroori hamara sukoon aur bharosa hai.',
      hi: 'किसी भी बात को जीतने से ज़्यादा ज़रूरी हमारा सुकून और भरोसा है।',
    },
  },
];

interface LocalizedMaanJaoCopy {
  ariaLabel: string;
  previewBanner: string;
  coverEyebrow: string;
  coverGreeting: (receiver: string) => string;
  coverSubtitle: string;
  coverFromPrefix: string;
  coverCta: string;
  storyHint: string;
  slideTags: [string, string, string];
  slideOneZeroExcuse: string;
  slideTwoCallBadge: string;
  slideTwoSigned: string;
  slideThreeIntro: string;
  prevSlide: string;
  nextSlide: string;
  scrollSanctuaryHint: string;
  sanctuaryEyebrow: string;
  calmGaugeTitle: string;
  calmGaugeTension: string;
  calmGaugePeace: string;
  calmGaugeSubIdle: string;
  calmGaugeSubWarm: (count: number, total: number) => string;
  calmGaugeSubFull: string;
  gesturesPrompt: string;
  soundtrackHeading: string;
  tracks: readonly CurvedTrackItem[];
  memoriesEyebrow: string;
  photoPrefix: string;
  finaleEyebrow: string;
  finalePromptIdle: string;
  stillUpsetLabel: string;
  stillUpsetNudges: readonly string[];
  stillUpsetReactions: readonly string[];
  forgiveCta: string;
  needTimeCta: string;
  forgivenEyebrow: string;
  forgivenTitle: (receiver: string) => string;
  forgivenBody: (sender: string) => string;
  forgivenGesturesLabel: string;
  forgivenNoGestures: string;
  needsTimeEyebrow: string;
  needsTimeTitle: (receiver: string) => string;
  needsTimeBody: string;
  revisitNoteCta: string;
}

const MAAN_JAO_COPY: Record<CoreLanguageCode, LocalizedMaanJaoCopy> = {
  en: {
    ariaLabel: 'An honest midnight apology note',
    previewBanner: 'WEBZY FREE PREVIEW',
    coverEyebrow: 'MIDNIGHT RAIN · QUIET NOTE',
    coverGreeting: (receiver) => `Something honest for ${receiver}`,
    coverSubtitle: 'Take your time. No pressure.',
    coverFromPrefix: 'Quietly from',
    coverCta: 'Read when ready',
    storyHint: 'Swipe or tap next to read at your own pace',
    slideTags: ['01 · NO EXCUSES', '02 · LATE NIGHT CALL', '03 · WHAT CHANGES'],
    slideOneZeroExcuse:
      'No excuses today. No trying to talk my way out of it. Just wanting to own what happened and soften the silence between us.',
    slideTwoCallBadge: 'ACROSS TOWN · LATE NIGHT',
    slideTwoSigned: 'Always yours,',
    slideThreeIntro: 'Small, concrete things I want to hold myself to:',
    prevSlide: 'Prev',
    nextSlide: 'Next',
    scrollSanctuaryHint: 'Scroll gently below when ready',
    sanctuaryEyebrow: 'LOWER SANCTUARY',
    calmGaugeTitle: 'Clearing the Air',
    calmGaugeTension: 'Tension',
    calmGaugePeace: 'Peace',
    calmGaugeSubIdle: 'Tap any quiet gesture below whenever you feel like softening the night.',
    calmGaugeSubWarm: (count, total) => `${count} of ${total} calm gestures chosen — air feels lighter.`,
    calmGaugeSubFull: 'Peace restored. Warmth waiting on the other side.',
    gesturesPrompt: 'Simple ways I want to make tonight lighter:',
    soundtrackHeading: 'RAIN ACOUSTIC SANCTUARY',
    tracks: [
      {
        id: 'midnight-rain',
        title: 'Midnight Window',
        moodLabel: 'Soft Rain',
        duration: '02:40',
        note: 'For the quiet minutes when words feel heavy and only rain sounds honest.',
      },
      {
        id: 'warm-kulhad',
        title: 'After the Storm',
        moodLabel: 'Gentle Acoustic',
        duration: '03:12',
        note: 'Slow strings and a warm lamp left on across town until we talk again.',
      },
      {
        id: 'dawn-light',
        title: 'Morning Calm',
        moodLabel: 'Warm Chime',
        duration: '02:55',
        note: 'A reminder that tomorrow can feel softer than tonight.',
      },
    ],
    memoriesEyebrow: 'QUIET MOMENTS KEPT',
    photoPrefix: 'Memory',
    finaleEyebrow: 'WHENEVER YOU ARE READY',
    finalePromptIdle: 'There is no rush here. Answer however you truly feel right now.',
    stillUpsetLabel: 'Still upset',
    stillUpsetNudges: ['Still upset', 'Still a little mad', 'Not yet', 'Still cooling down'],
    stillUpsetReactions: [
      'Totally fair. You have every right to feel that way.',
      'No defending from me. Take a slow breath — I am listening.',
      'What if hot kulhad chai and quiet company wait without a single excuse?',
      'Thank you for being honest. No pressure at all.',
    ],
    forgiveCta: "It's okay, I forgive you",
    needTimeCta: 'Give me a little time',
    forgivenEyebrow: 'WARMTH RESTORED',
    forgivenTitle: (receiver) => `Thank you for the grace, ${receiver}.`,
    forgivenBody: (sender) =>
      `${sender} is genuinely grateful. Let the rain pass slowly — I will protect your peace better from here.`,
    forgivenGesturesLabel: 'On me next time we meet',
    forgivenNoGestures: 'Just quiet presence, warm tea, and a gentler tomorrow.',
    needsTimeEyebrow: 'SPACE RESPECTED',
    needsTimeTitle: (receiver) => `Take all the time you need, ${receiver}.`,
    needsTimeBody:
      'No countdown, no guilt, and no pushing. Whenever you feel ready to talk, I will be right here — calm and listening.',
    revisitNoteCta: 'Read the note again',
  },
  hinglish: {
    ariaLabel: 'Ek sachchi maafi ka sandesh',
    previewBanner: 'WEBZY FREE PREVIEW',
    coverEyebrow: 'MIDNIGHT RAIN · SACHCHI BAAT',
    coverGreeting: (receiver) => `Something honest for ${receiver}`,
    coverSubtitle: 'Take your time. No pressure.',
    coverFromPrefix: 'Dil se,',
    coverCta: 'Read when ready',
    storyHint: 'Aaram se padhne ke liye swipe ya next tap karein',
    slideTags: ['01 · KOI BAHANA NAHI', '02 · LATE NIGHT CALL', '03 · SACHCHE VAADE'],
    slideOneZeroExcuse:
      'Aaj koi safai nahi deni hai. Bas apni galti maanni hai aur hamare beech ki khamoshi ko thoda halka karna hai.',
    slideTwoCallBadge: 'DO KHIDKIYAN · EK RAAT',
    slideTwoSigned: 'Sirf tumhara,',
    slideThreeIntro: 'Chhoti par sachchi baatein jo main nibhana chahta hoon:',
    prevSlide: 'Peeche',
    nextSlide: 'Aage',
    scrollSanctuaryHint: 'Jab mann kare, neeche scroll karein',
    sanctuaryEyebrow: 'SUKOON KA KONAA',
    calmGaugeTitle: 'Mann Halka Karna',
    calmGaugeTension: 'Tension',
    calmGaugePeace: 'Peace',
    calmGaugeSubIdle: 'Neeche diye chhote gestures par tap karo jab thoda sukoon chahiye ho.',
    calmGaugeSubWarm: (count, total) => `${count}/${total} gestures chune — hawa thodi narm lag rahi hai.`,
    calmGaugeSubFull: 'Dil thoda shaant hua. Sukoon yahin intezaar kar raha hai.',
    gesturesPrompt: 'Aaj ki shaam halka karne ke chhote tareeke:',
    soundtrackHeading: 'BAARISH KE SAATH DHUN',
    tracks: [
      {
        id: 'midnight-rain',
        title: 'Midnight Window',
        moodLabel: 'Soft Rain',
        duration: '02:40',
        note: 'Un khamosh palon ke liye jab shabd bhaari lagte hain aur sirf baarish sach bolti hai.',
      },
      {
        id: 'warm-kulhad',
        title: 'Kulhad Chai & Rain',
        moodLabel: 'Gentle Acoustic',
        duration: '03:12',
        note: 'Do alag khidkiyon ke beech jalti ek madham roshni aur sukoon ka intezaar.',
      },
      {
        id: 'dawn-light',
        title: 'Subah Ki Narmi',
        moodLabel: 'Warm Chime',
        duration: '02:55',
        note: 'Is ummeed ke saath ki kal ki subah aaj ki raat se zyada haseen hogi.',
      },
    ],
    memoriesEyebrow: 'SANJOI HUI YAADEIN',
    photoPrefix: 'Yaad',
    finaleEyebrow: 'JAB TUM TAYYAR HO',
    finalePromptIdle: 'Koi jaldi nahi hai. Abhi dil jo sach kahe, wahi chunna.',
    stillUpsetLabel: 'Still upset',
    stillUpsetNudges: ['Abhi bhi gussa', 'Thoda aur waqt', 'Abhi nahi', 'Thoda shaant ho rahi'],
    stillUpsetReactions: [
      'Bilkul samajhta hoon. Tumhara gussa hona poori tarah jayaz hai.',
      'Koi bahana nahi. Bas aaram se saans lo — main yahin sun raha hoon.',
      'Kya garma-garam kulhad chai aur bina shart ki khamosh saath chalega?',
      'Sach bolne ke liye shukriya. Bilkul koi pressure nahi hai.',
    ],
    forgiveCta: "It's okay, I forgive you",
    needTimeCta: 'Give me a little time',
    forgivenEyebrow: 'BAARISH KE BAAD ROSHNI',
    forgivenTitle: (receiver) => `Maaf karne ke liye dil se shukriya, ${receiver}.`,
    forgivenBody: (sender) =>
      `${sender} sach mein aabhari hai. Ab se tumhare sukoon aur bharose ka khayal aur behtar rakhunga.`,
    forgivenGesturesLabel: 'Agli mulaqat par pakka',
    forgivenNoGestures: 'Bas poora dhyan, garma-garam chai aur ek narm kal.',
    needsTimeEyebrow: 'WAQT KA SAMMAAN',
    needsTimeTitle: (receiver) => `Jitna waqt chahiye lo, ${receiver}.`,
    needsTimeBody:
      'Koi ginti nahi, koi pressure nahi. Jab bhi baat karne ka mann kare, main yahin shaanti se sunne ke liye hoon.',
    revisitNoteCta: 'Note dobara padho',
  },
  hi: {
    ariaLabel: 'एक सच्चा माफ़ी संदेश',
    previewBanner: 'WEBZY FREE PREVIEW',
    coverEyebrow: 'आधी रात की बारिश · सच्ची बात',
    coverGreeting: (receiver) => `${receiver} के लिए एक सच्ची बात`,
    coverSubtitle: 'अपना पूरा समय लें। कोई दबाव नहीं है।',
    coverFromPrefix: 'दिल से,',
    coverCta: 'तैयार हों तो पढ़ें',
    storyHint: 'आगे पढ़ने के लिए स्वाइप करें या अगला बटन दबाएं',
    slideTags: ['01 · कोई बहाना नहीं', '02 · देर रात की बात', '03 · सच्चे वादे'],
    slideOneZeroExcuse:
      'आज मुझे कोई सफ़ाई नहीं देनी है। बस अपनी गलती माननी है और हमारे बीच की इस खामोशी को थोड़ा हल्का करना है।',
    slideTwoCallBadge: 'दो खिड़कियाँ · एक शांत रात',
    slideTwoSigned: 'सदैव आपका,',
    slideThreeIntro: 'कुछ सच्चे वादे जिन्हें मैं दिल से निभाना चाहता हूँ:',
    prevSlide: 'पिछला',
    nextSlide: 'अगला',
    scrollSanctuaryHint: 'जब मन करे, नीचे स्क्रॉल करें',
    sanctuaryEyebrow: 'सुकून का कोना',
    calmGaugeTitle: 'मन हल्का करें',
    calmGaugeTension: 'तनाव',
    calmGaugePeace: 'शांति',
    calmGaugeSubIdle: 'माहौल थोड़ा हल्का महसूस करने के लिए नीचे किसी भी विकल्प पर टैप करें।',
    calmGaugeSubWarm: (count, total) => `${count}/${total} विकल्प चुने गए — थोड़ा सुकून लौट रहा है।`,
    calmGaugeSubFull: 'मन थोड़ा शांत हुआ। गर्माहट यहीं आपका इंतज़ार कर रही है।',
    gesturesPrompt: 'इस शाम को थोड़ा हल्का बनाने के आसान तरीके:',
    soundtrackHeading: 'बारिश और सुकून की धुन',
    tracks: [
      {
        id: 'midnight-rain',
        title: 'आधी रात की खिड़की',
        moodLabel: 'धीमी बारिश',
        duration: '02:40',
        note: 'उन शांत पलों के लिए जब शब्द भारी लगें और सिर्फ़ बारिश की बूंदें बोलें।',
      },
      {
        id: 'warm-kulhad',
        title: 'तूफ़ान के बाद',
        moodLabel: 'कोमल धुन',
        duration: '03:12',
        note: 'शहर के दो सिरों पर जलती दो रोशनियाँ और बात होने का शांत इंतज़ार।',
      },
      {
        id: 'dawn-light',
        title: 'सुबह की नर्मी',
        moodLabel: 'मधुर झंकार',
        duration: '02:55',
        note: 'एक भरोसा कि आने वाली सुबह आज की रात से कहीं ज़्यादा शांत होगी।',
      },
    ],
    memoriesEyebrow: 'संजोई हुई यादें',
    photoPrefix: 'याद',
    finaleEyebrow: 'जब आप तैयार हों',
    finalePromptIdle: 'कोई जल्दबाज़ी नहीं है। इस समय आपका दिल जो कहे, वही चुनें।',
    stillUpsetLabel: 'अभी भी नाराज़',
    stillUpsetNudges: ['अभी भी नाराज़', 'मन थोड़ा भारी है', 'अभी नहीं', 'थोड़ा समय चाहिए'],
    stillUpsetReactions: [
      'बिल्कुल जायज़ है। आपको नाराज़ होने का पूरा हक़ है।',
      'मेरी तरफ़ से कोई बहस नहीं। बस गहरी सांस लें — मैं सुन रहा हूँ।',
      'अगर बिना किसी बहाने के सिर्फ़ गरम कुल्हड़ चाय और शांत साथ हो तो?',
      'अपनी सच्ची भावना बताने के लिए धन्यवाद। कोई दबाव नहीं है।',
    ],
    forgiveCta: 'ठीक है, मैंने माफ़ किया',
    needTimeCta: 'मुझे थोड़ा समय चाहिए',
    forgivenEyebrow: 'फिर से सुकून',
    forgivenTitle: (receiver) => `माफ़ करने के लिए दिल से शुक्रिया, ${receiver}।`,
    forgivenBody: (sender) =>
      `${sender} सच में आभारी है। अब से आपके सुकून और भरोसे का पहले से कहीं ज़्यादा ध्यान रखूँगा।`,
    forgivenGesturesLabel: 'अगली मुलाक़ात पर वादा',
    forgivenNoGestures: 'बस पूरा ध्यान, गरम चाय और एक शांत कल।',
    needsTimeEyebrow: 'आपके समय का सम्मान',
    needsTimeTitle: (receiver) => `अपना पूरा समय लीजिए, ${receiver}।`,
    needsTimeBody:
      'कोई गिनती नहीं, कोई जल्दबाज़ी नहीं। जब भी आपका मन बात करने का हो, मैं यहीं शांत मन से सुनने के लिए रहूँगा।',
    revisitNoteCta: 'संदेश फिर से पढ़ें',
  },
};

function WatermarkBanner({ visible, label }: { visible: boolean; label: string }) {
  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative z-30 flex justify-center border-b border-white/10 bg-[#050814]/90 py-1 text-[10px] font-semibold tracking-[0.2em] text-blue-200/75"
    >
      {label}
    </div>
  );
}

function RaindropMoonEmblem() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-14 w-14 drop-shadow-[0_0_20px_rgba(147,197,253,0.28)]"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="28" stroke="#93C5FD" strokeOpacity="0.22" strokeWidth="1" />
      <path
        d="M35.5 17.5a13.5 13.5 0 1 0 11 21.2A11 11 0 1 1 35.5 17.5Z"
        fill="#FDE68A"
        fillOpacity="0.9"
      />
      <path
        d="M21 43c0-2.4 2.2-5 2.2-5s2.2 2.6 2.2 5a2.2 2.2 0 1 1-4.4 0Z"
        fill="#93C5FD"
        fillOpacity="0.75"
      />
      <path
        d="M39 46c0-1.9 1.7-4 1.7-4s1.7 2.1 1.7 4a1.7 1.7 0 1 1-3.4 0Z"
        fill="#93C5FD"
        fillOpacity="0.55"
      />
    </svg>
  );
}

function GestureLineIcon({ id, active }: { id: GestureId; active: boolean }) {
  const stroke = active ? '#FDE68A' : '#93C5FD';
  if (id === 'kulhad-chai') {
    return (
      <svg viewBox="0 0 28 28" className="h-6 w-6 shrink-0" fill="none" aria-hidden="true">
        <path
          d="M9.5 5c0 1.4 1.3 1.8 1.3 3.2M14.5 4.2c0 1.4 1.3 1.8 1.3 3.2"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M7 10.5h12l-1.5 10.5a2 2 0 0 1-2 1.7h-5a2 2 0 0 1-2-1.7L7 10.5Z"
          fill={active ? 'rgba(251, 191, 36, 0.16)' : 'rgba(147, 197, 253, 0.08)'}
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M8.5 14.5h9" stroke={stroke} strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === 'fav-dessert') {
    return (
      <svg viewBox="0 0 28 28" className="h-6 w-6 shrink-0" fill="none" aria-hidden="true">
        <path
          d="M8.5 14a5.5 5.5 0 0 1 11 0"
          fill={active ? 'rgba(251, 191, 36, 0.16)' : 'rgba(147, 197, 253, 0.08)'}
          stroke={stroke}
          strokeWidth="1.6"
        />
        <circle cx="14" cy="7.5" r="1.5" fill={stroke} />
        <path
          d="M6.5 14.5h15l-1.8 5.2a2.2 2.2 0 0 1-2.1 1.5h-7.2a2.2 2.2 0 0 1-2.1-1.5l-1.8-5.2Z"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M11 23.5h6" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 28 28" className="h-6 w-6 shrink-0" fill="none" aria-hidden="true">
      <circle
        cx="14"
        cy="14"
        r="8.5"
        fill={active ? 'rgba(251, 191, 36, 0.14)' : 'rgba(147, 197, 253, 0.08)'}
        stroke={stroke}
        strokeWidth="1.5"
      />
      <path d="M10.5 14v.01M14 11.5v5M17.5 13v2" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Split-Screen Late Night Call / Two Windows Scene:
 * Custom diagonal neon-amber divider separating two warm lit bedroom windows
 * under a crescent moon on opposite sides of town.
 */
function TwoWindowsCallScene({
  senderName,
  receiverName,
  badgeLabel,
}: {
  senderName: string;
  receiverName: string;
  badgeLabel: string;
}) {
  const uid = useId().replace(/:/g, '');
  const leftName = senderName.trim() || 'Me';
  const rightName = receiverName.trim() || 'You';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#050814]">
      <svg
        viewBox="0 0 360 176"
        className="block w-full"
        role="img"
        aria-label={`Two lit windows across town between ${leftName} and ${rightName}`}
      >
        <defs>
          <linearGradient id={`sky-left-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#070D1F" />
            <stop offset="100%" stopColor="#0D1833" />
          </linearGradient>
          <linearGradient id={`sky-right-${uid}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#090F22" />
            <stop offset="100%" stopColor="#131B38" />
          </linearGradient>
          <radialGradient id={`win-glow-left-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.48" />
            <stop offset="65%" stopColor="#F59E0B" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#0D1833" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`win-glow-right-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.44" />
            <stop offset="65%" stopColor="#93C5FD" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#131B38" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`diag-beam-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.15" />
            <stop offset="48%" stopColor="#93C5FD" stopOpacity="0.95" />
            <stop offset="62%" stopColor="#FDE68A" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.2" />
          </linearGradient>
          <clipPath id={`clip-left-${uid}`}>
            <polygon points="0,0 202,0 158,176 0,176" />
          </clipPath>
          <clipPath id={`clip-right-${uid}`}>
            <polygon points="202,0 360,0 360,176 158,176" />
          </clipPath>
        </defs>

        {/* Left side of town */}
        <g clipPath={`url(#clip-left-${uid})`}>
          <rect x="0" y="0" width="360" height="176" fill={`url(#sky-left-${uid})`} />
          {/* Rain streaks left */}
          {[
            [24, 18, 34],
            [62, 12, 28],
            [114, 24, 38],
            [148, 10, 26],
            [40, 122, 140],
          ].map(([x, y1, y2], idx) => (
            <line
              key={`rl-${idx}`}
              x1={x}
              y1={y1}
              x2={x - 5}
              y2={y2}
              stroke="#93C5FD"
              strokeOpacity="0.28"
              strokeWidth="1"
              strokeLinecap="round"
            />
          ))}
          {/* Distant skyline left */}
          <path
            d="M0 176 L0 128 L22 128 L22 104 L52 104 L52 120 L74 120 L74 72 L134 72 L134 114 L166 114 L166 176 Z"
            fill="#060A17"
          />
          {/* Left apartment window aura */}
          <circle cx="104" cy="112" r="46" fill={`url(#win-glow-left-${uid})`} />
          {/* Lit bedroom window (Left) */}
          <rect
            x="84"
            y="88"
            width="40"
            height="48"
            rx="3"
            fill="#FEF3C7"
            fillOpacity="0.92"
            stroke="#F59E0B"
            strokeWidth="1.6"
          />
          {/* Window sill & crossbars */}
          <line x1="104" y1="88" x2="104" y2="136" stroke="#78350F" strokeOpacity="0.55" strokeWidth="1.4" />
          <line x1="84" y1="112" x2="124" y2="112" stroke="#78350F" strokeOpacity="0.55" strokeWidth="1.4" />
          <rect x="81" y="136" width="46" height="3.5" rx="1.5" fill="#1E293B" />
          {/* Subtle silhouette looking out / holding phone */}
          <circle cx="96" cy="118" r="3.6" fill="#78350F" fillOpacity="0.7" />
          <path d="M90 135c0-6 3-10 6-10s6 4 6 10" fill="#78350F" fillOpacity="0.7" />
        </g>

        {/* Right side of town */}
        <g clipPath={`url(#clip-right-${uid})`}>
          <rect x="0" y="0" width="360" height="176" fill={`url(#sky-right-${uid})`} />
          {/* Rain streaks right */}
          {[
            [224, 16, 32],
            [274, 22, 40],
            [328, 14, 30],
            [302, 128, 146],
          ].map(([x, y1, y2], idx) => (
            <line
              key={`rr-${idx}`}
              x1={x}
              y1={y1}
              x2={x - 5}
              y2={y2}
              stroke="#93C5FD"
              strokeOpacity="0.28"
              strokeWidth="1"
              strokeLinecap="round"
            />
          ))}
          {/* Distant skyline right */}
          <path
            d="M168 176 L168 118 L216 118 L216 74 L284 74 L284 108 L314 108 L314 96 L360 96 L360 176 Z"
            fill="#070B1A"
          />
          {/* Right apartment window aura */}
          <circle cx="250" cy="112" r="46" fill={`url(#win-glow-right-${uid})`} />
          {/* Lit bedroom window (Right) */}
          <rect
            x="230"
            y="88"
            width="40"
            height="48"
            rx="3"
            fill="#FFFBEB"
            fillOpacity="0.92"
            stroke="#FDE68A"
            strokeWidth="1.6"
          />
          <line x1="250" y1="88" x2="250" y2="136" stroke="#92400E" strokeOpacity="0.45" strokeWidth="1.4" />
          <line x1="230" y1="112" x2="270" y2="112" stroke="#92400E" strokeOpacity="0.45" strokeWidth="1.4" />
          <rect x="227" y="136" width="46" height="3.5" rx="1.5" fill="#1E293B" />
          {/* Warm bedside lamp glow inside right window */}
          <path d="M256 122l4 8h-8l4-8Z" fill="#D97706" fillOpacity="0.65" />
          <line x1="256" y1="130" x2="256" y2="135" stroke="#92400E" strokeOpacity="0.65" strokeWidth="1.3" />
        </g>

        {/* Shared Crescent Moon centered over the divide */}
        <circle cx="184" cy="30" r="24" fill="#FDE68A" fillOpacity="0.12" />
        <path d="M187 18a11.5 11.5 0 1 0 9.5 18 9.2 9.2 0 1 1-9.5-18Z" fill="#FEF3C7" />

        {/* Quiet call signal arc connecting the two windows */}
        <path
          d="M128 106 Q178 78 226 106"
          fill="none"
          stroke="#93C5FD"
          strokeOpacity="0.4"
          strokeWidth="1.1"
          strokeDasharray="3 4"
        />

        {/* Diagonal Luminous Neon Divider */}
        <line
          x1="202"
          y1="0"
          x2="158"
          y2="176"
          stroke={`url(#diag-beam-${uid})`}
          strokeWidth="6"
          strokeOpacity="0.22"
        />
        <line
          x1="202"
          y1="0"
          x2="158"
          y2="176"
          stroke={`url(#diag-beam-${uid})`}
          strokeWidth="1.6"
        />
      </svg>

      {/* Window owner captions */}
      <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-black/35 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.14em]">
        <span className="min-w-0 truncate text-amber-200/85">{leftName}</span>
        <span className="shrink-0 text-blue-200/60">{badgeLabel}</span>
        <span className="min-w-0 truncate text-right text-amber-100/90">{rightName}</span>
      </div>
    </div>
  );
}

function CircularCalmGauge({
  score,
  tensionLabel,
  peaceLabel,
}: {
  score: number;
  tensionLabel: string;
  peaceLabel: string;
}) {
  const gradId = useId().replace(/:/g, '');
  const clamped = Math.max(10, Math.min(100, score));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped / 100);
  const ratio = (clamped - 10) / 90;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex h-28 w-28 items-center justify-center"
        role="img"
        aria-label={`${tensionLabel} to ${peaceLabel}: ${clamped}%`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2 rounded-full transition-opacity duration-500 blur-md"
          style={{
            background:
              clamped >= 70
                ? 'radial-gradient(circle, rgba(251,191,36,0.34), transparent 70%)'
                : 'radial-gradient(circle, rgba(96,165,250,0.24), transparent 70%)',
          }}
        />
        <svg viewBox="0 0 108 108" className="relative h-full w-full overflow-visible">
          <defs>
            <linearGradient id={`calm-grad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor={clamped >= 70 ? '#FBBF24' : '#93C5FD'} />
            </linearGradient>
          </defs>
          <circle
            cx="54"
            cy="54"
            r={radius}
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(148,163,184,0.18)"
            strokeWidth="6.5"
          />
          <circle
            cx="54"
            cy="54"
            r={radius}
            fill="none"
            stroke={`url(#calm-grad-${gradId})`}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 54 54)"
            style={{ transition: 'stroke-dashoffset 550ms cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
          {/* Subtle inner horizon curve easing from wavy tension to flat calm smile */}
          <path
            d={`M35 55 Q44.5 ${55 - (1 - ratio) * 4} 54 55 Q63.5 ${55 + (1 - ratio) * 4} 73 55`}
            fill="none"
            stroke={clamped >= 70 ? '#FDE68A' : '#93C5FD'}
            strokeOpacity="0.65"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-5 text-center">
          <span className="font-mono text-sm font-bold tracking-wider text-slate-100">
            {clamped}%
          </span>
        </div>
      </div>

      <div className="mt-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
        <span className={clamped < 50 ? 'text-blue-200/90' : 'text-slate-400'}>{tensionLabel}</span>
        <span className="text-slate-500" aria-hidden="true">→</span>
        <span className={clamped >= 70 ? 'text-amber-200' : 'text-slate-400'}>{peaceLabel}</span>
      </div>
    </div>
  );
}

function DawnHorizonIllustration() {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 220 72" className="mx-auto h-16 w-48" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`dawn-glow-${uid}`} cx="50%" cy="75%" r="55%">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="110" cy="54" r="46" fill={`url(#dawn-glow-${uid})`} />
      <path d="M84 54a26 26 0 0 1 52 0" fill="#FDE68A" fillOpacity="0.22" stroke="#FBBF24" strokeWidth="1.4" />
      <line x1="20" y1="54" x2="200" y2="54" stroke="#93C5FD" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="52" y="42" width="12" height="12" rx="1.5" fill="#FDE68A" fillOpacity="0.8" />
      <rect x="156" y="42" width="12" height="12" rx="1.5" fill="#FDE68A" fillOpacity="0.8" />
    </svg>
  );
}

/**
 * Minimalist, emotionally honest Midnight Rain Apology ("Sorry") microsite:
 * Act 1: Quiet Midnight Rain Cover
 * Act 2: Swipeable Editorial Rain Story Slides (Zero Excuses, Two Windows Late Night Call, Concrete Accountability)
 * Act 3: Continuous Lower Sanctuary (Calm Un-Tension Gauge + Rain Acoustic Sanctuary + Adaptive Photos + Respectful Closure)
 */
export function MaanJaoSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const [opened, setOpened] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideRevealed, setSlideRevealed] = useState(false);
  const [selectedGestures, setSelectedGestures] = useState<GestureId[]>([]);
  const [nudgeCount, setNudgeCount] = useState(0);
  const [finaleState, setFinaleState] = useState<FinaleState>('open');

  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const coreLang = toCoreLanguageCode(language);
  const copy = MAAN_JAO_COPY[coreLang] ?? MAAN_JAO_COPY.en;

  const receiver = data.receiverName?.trim() || 'you';
  const sender = data.senderName?.trim() || 'Me';
  const headlineText = pickLocalizedText(data.headline, language).trim() || copy.coverGreeting(receiver);
  const messageText = pickLocalizedText(data.message, language).trim() || copy.slideOneZeroExcuse;

  const promiseNotes = Array.from({ length: 3 }, (_, idx) => {
    const item = data.highlights?.[idx];
    const fallback = PROMISE_FALLBACKS[idx];
    const title = item ? pickLocalizedText(item.title, language).trim() : '';
    const detail = item ? pickLocalizedText(item.detail, language).trim() : '';
    return {
      title: title || fallback.title[coreLang],
      detail: detail || fallback.detail[coreLang],
    };
  });

  const sanctuaryTracks: CurvedTrackItem[] = copy.tracks.map((track, idx) =>
    idx === 0 && manifest.music?.[0]?.label
      ? { ...track, title: manifest.music[0].label }
      : track,
  );

  // Starts gently at 10%, each simple gesture adds +30% up to 100%
  const calmScore = Math.min(100, 10 + selectedGestures.length * 30);

  useEffect(() => {
    if (!opened) {
      setSlideRevealed(false);
      return;
    }
    setSlideRevealed(false);
    const frameId = requestAnimationFrame(() => {
      setSlideRevealed(true);
    });
    const fallbackTimer = setTimeout(() => setSlideRevealed(true), 50);
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(fallbackTimer);
    };
  }, [opened, activeSlide]);

  function handleOpen() {
    setOpened(true);
    onOpened?.();
  }

  function handleReplayCover() {
    setFinaleState('open');
    setActiveSlide(0);
    setNudgeCount(0);
    setOpened(false);
  }

  function toggleGesture(id: GestureId) {
    setSelectedGestures((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function goToSlide(index: number) {
    setActiveSlide(Math.max(0, Math.min(2, index)));
  }

  function handleSwipeStart(e: React.PointerEvent<HTMLDivElement>) {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  }

  function handleSwipeEnd(e: React.PointerEvent<HTMLDivElement>) {
    if (!pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    pointerStartRef.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0 && activeSlide < 2) {
        goToSlide(activeSlide + 1);
      } else if (dx > 0 && activeSlide > 0) {
        goToSlide(activeSlide - 1);
      }
    }
  }

  function handleStillUpset() {
    setNudgeCount((prev) => prev + 1);
  }

  const boundedNudgeOffsets = [
    { x: 0, y: 0 },
    { x: 7, y: -2 },
    { x: -7, y: 2 },
    { x: 5, y: 2 },
    { x: -5, y: -2 },
  ];
  const currentNudge = boundedNudgeOffsets[nudgeCount % boundedNudgeOffsets.length];
  const upsetLabel =
    nudgeCount > 0
      ? copy.stillUpsetNudges[(nudgeCount - 1) % copy.stillUpsetNudges.length]
      : copy.stillUpsetLabel;
  const upsetReaction =
    nudgeCount > 0
      ? copy.stillUpsetReactions[(nudgeCount - 1) % copy.stillUpsetReactions.length]
      : copy.finalePromptIdle;

  const hasPhotos = Boolean(data.photos?.some((src) => typeof src === 'string' && src.trim().length > 0));

  return (
    <article
      aria-label={copy.ariaLabel}
      className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#060913] text-slate-100"
    >
      <WatermarkBanner visible={watermarked} label={copy.previewBanner} />

      {!opened ? (
        /* ACT 1 — Quiet Midnight Rain Cover */
        <section
          aria-label={copy.coverEyebrow}
          className="relative flex flex-1 flex-col items-center justify-between px-5 py-8 text-center sm:px-8"
        >
          <OccasionArtworkBackdrop
            src="/templates/occasions/maan-jao/cover.jpg"
            fallbackGradient="radial-gradient(circle at 50% 28%, rgba(30, 58, 138, 0.36) 0%, #070B16 62%, #04060D 100%)"
            className="object-cover object-center opacity-25"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050814]/80 via-[#070B18]/65 to-[#050814]/95"
          />
          <AmbientRainCanvas density="medium" tint="#93C5FD" />

          <div className="relative z-10 mt-2">
            <span className="inline-block font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-200/65">
              {copy.coverEyebrow}
            </span>
          </div>

          <div className="relative z-10 my-auto flex max-w-sm flex-col items-center py-6">
            <RaindropMoonEmblem />

            <h1 className="mt-5 break-words font-heading text-2xl font-semibold leading-snug tracking-tight text-slate-50 sm:text-3xl">
              {copy.coverGreeting(receiver)}
            </h1>

            <p className="mt-2.5 max-w-xs break-words text-sm leading-relaxed text-slate-300/85">
              {copy.coverSubtitle}
            </p>

            <button
              type="button"
              onClick={handleOpen}
              className="mt-8 inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full border border-blue-200/25 bg-white/[0.08] px-7 py-3 text-sm font-semibold text-slate-50 shadow-[0_0_28px_-8px_rgba(147,197,253,0.45)] backdrop-blur-md transition-all duration-300 hover:border-blue-200/45 hover:bg-white/[0.14] active:scale-[0.98] motion-reduce:transition-none"
            >
              <span>{copy.coverCta}</span>
              <span aria-hidden="true" className="text-blue-200">→</span>
            </button>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-1">
            <p className="text-xs text-slate-400/85">
              {copy.coverFromPrefix} <span className="font-medium text-amber-100/90">{sender}</span>
            </p>
          </div>
        </section>
      ) : (
        /* ACT 2 & ACT 3 — Continuous Midnight Rain Story + Lower Sanctuary */
        <div className="relative flex flex-1 flex-col">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#060913] via-[#091022] to-[#060913]"
          />
          <AmbientRainCanvas density="light" tint="#93C5FD" />

          <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col gap-7 px-4 pb-6 pt-4 sm:px-5">
            {/* Minimalist Top Bar */}
            <header className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200/70">
                0{activeSlide + 1} / 03
              </span>
              <button
                type="button"
                onClick={handleReplayCover}
                className="inline-flex min-h-[44px] items-center rounded-full border border-white/10 bg-white/[0.04] px-3.5 text-xs font-medium text-slate-200 transition hover:border-white/25 hover:bg-white/[0.08] active:scale-95"
              >
                {getReplayLabel(language)}
              </button>
            </header>

            {/* ACT 2 — Swipeable Editorial Rain Story Slides */}
            <section aria-label={copy.storyHint} className="space-y-3.5">
              <div
                onPointerDown={handleSwipeStart}
                onPointerUp={handleSwipeEnd}
                className="relative min-h-[310px] touch-pan-y rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm sm:p-6"
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">
                  {copy.slideTags[activeSlide]}
                </p>

                {activeSlide === 0 ? (
                  <div className="mt-5 flex min-h-[220px] flex-col justify-between gap-5">
                    <div className="space-y-4">
                      <WordByWordFadeLine
                        key={`headline-${coreLang}`}
                        text={headlineText}
                        active={slideRevealed && activeSlide === 0}
                        delayStepMs={65}
                        className="break-words font-heading text-2xl font-semibold leading-snug tracking-tight text-slate-50 sm:text-[26px]"
                      />
                      <WordByWordFadeLine
                        key={`zero-${coreLang}`}
                        text={copy.slideOneZeroExcuse}
                        active={slideRevealed && activeSlide === 0}
                        delayStepMs={35}
                        className="break-words text-sm leading-relaxed text-slate-300/85"
                      />
                    </div>
                    <p className="text-xs italic text-amber-200/75">
                      — {sender}
                    </p>
                  </div>
                ) : null}

                {activeSlide === 1 ? (
                  <div className="mt-4 flex flex-col gap-4">
                    <TwoWindowsCallScene
                      senderName={sender}
                      receiverName={receiver}
                      badgeLabel={copy.slideTwoCallBadge}
                    />
                    <div className="space-y-2.5 pt-1">
                      <WordByWordFadeLine
                        key={`msg-${coreLang}`}
                        text={messageText}
                        active={slideRevealed && activeSlide === 1}
                        delayStepMs={45}
                        className="break-words text-sm leading-relaxed text-slate-100/95 sm:text-[15px]"
                      />
                      <p className="text-right text-xs font-medium text-amber-200/80">
                        {copy.slideTwoSigned} {sender}
                      </p>
                    </div>
                  </div>
                ) : null}

                {activeSlide === 2 ? (
                  <div className="mt-4 space-y-3">
                    <WordByWordFadeLine
                      key={`intro3-${coreLang}`}
                      text={copy.slideThreeIntro}
                      active={slideRevealed && activeSlide === 2}
                      delayStepMs={45}
                      className="break-words text-xs leading-relaxed text-slate-300/80"
                    />
                    <div className="space-y-2.5 pt-1">
                      {promiseNotes.map((note, idx) => (
                        <div
                          key={`promise-${idx}`}
                          className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3"
                        >
                          <div className="flex items-baseline gap-2.5">
                            <span className="font-mono text-[10px] font-semibold text-blue-300/75">
                              0{idx + 1}
                            </span>
                            <h2 className="min-w-0 break-words font-heading text-sm font-semibold text-slate-100">
                              {note.title}
                            </h2>
                          </div>
                          <p className="mt-1 pl-6 break-words text-xs leading-relaxed text-slate-300/80">
                            {note.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Story Pager Controls (Prev / Dots / Next) */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={activeSlide === 0}
                  onClick={() => goToSlide(activeSlide - 1)}
                  className="inline-flex min-h-[44px] min-w-[72px] items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-3.5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-30 active:scale-95"
                >
                  ← {copy.prevSlide}
                </button>

                <div className="flex items-center justify-center" role="tablist" aria-label="Story slides">
                  {[0, 1, 2].map((idx) => {
                    const isCurrent = activeSlide === idx;
                    return (
                      <button
                        key={`dot-${idx}`}
                        type="button"
                        role="tab"
                        aria-selected={isCurrent}
                        aria-label={`Slide ${idx + 1} of 3`}
                        onClick={() => goToSlide(idx)}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center"
                      >
                        <span
                          className={`block h-1.5 rounded-full transition-all duration-300 ${
                            isCurrent ? 'w-6 bg-blue-300' : 'w-1.5 bg-white/25 hover:bg-white/45'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={activeSlide === 2}
                  onClick={() => goToSlide(activeSlide + 1)}
                  className="inline-flex min-h-[44px] min-w-[72px] items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-3.5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-30 active:scale-95"
                >
                  {copy.nextSlide} →
                </button>
              </div>

              <p className="text-center text-[11px] text-slate-400/75">
                {activeSlide === 2 ? copy.scrollSanctuaryHint : copy.storyHint}
              </p>
            </section>

            {/* Hairline Sanctuary Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden="true" />

            {/* ACT 3 — Continuous Lower Sanctuary */}
            <div className="space-y-7">
              {/* 1. Calm Un-Tension Stage (Tension -> Peace) */}
              <section
                aria-label={copy.calmGaugeTitle}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
              >
                <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200/70">
                  {copy.sanctuaryEyebrow}
                </p>
                <h2 className="mt-1.5 text-center font-heading text-lg font-semibold text-slate-50">
                  {copy.calmGaugeTitle}
                </h2>

                <div className="mt-4 flex flex-col items-center">
                  <CircularCalmGauge
                    score={calmScore}
                    tensionLabel={copy.calmGaugeTension}
                    peaceLabel={copy.calmGaugePeace}
                  />
                  <p className="mt-2.5 max-w-xs text-center text-xs leading-relaxed text-slate-300/80">
                    {selectedGestures.length === 0
                      ? copy.calmGaugeSubIdle
                      : selectedGestures.length === CALM_GESTURES.length
                        ? copy.calmGaugeSubFull
                        : copy.calmGaugeSubWarm(selectedGestures.length, CALM_GESTURES.length)}
                  </p>
                </div>

                <div className="mt-5 space-y-2">
                  <p className="text-xs font-medium text-slate-300/85">
                    {copy.gesturesPrompt}
                  </p>
                  <div className="flex flex-col gap-2">
                    {CALM_GESTURES.map((gesture) => {
                      const active = selectedGestures.includes(gesture.id);
                      return (
                        <button
                          key={gesture.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleGesture(gesture.id)}
                          className={`flex min-h-[52px] w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition-all duration-200 active:scale-[0.985] ${
                            active
                              ? 'border-amber-200/40 bg-amber-300/[0.08] shadow-[0_0_24px_-12px_rgba(251,191,36,0.5)]'
                              : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                          }`}
                        >
                          <GestureLineIcon id={gesture.id} active={active} />
                          <div className="min-w-0 flex-1">
                            <span
                              className={`block break-words text-xs font-semibold sm:text-[13px] ${
                                active ? 'text-amber-100' : 'text-slate-100'
                              }`}
                            >
                              {gesture.label[coreLang]}
                            </span>
                            <span className="mt-0.5 block break-words text-[11px] leading-snug text-slate-400">
                              {gesture.detail[coreLang]}
                            </span>
                          </div>
                          <span
                            aria-hidden="true"
                            className={`h-4 w-4 shrink-0 rounded-full border transition-all ${
                              active
                                ? 'border-amber-200 bg-amber-300/85 shadow-[0_0_10px_rgba(253,230,138,0.7)]'
                                : 'border-white/25 bg-transparent'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* 2. Cozy Rain Acoustic Sanctuary */}
              <CurvedTrackSanctuary
                tracks={sanctuaryTracks}
                mood="rainy"
                accentColor="#60A5FA"
                dark
                heading={copy.soundtrackHeading}
              />

              {/* 3. Adaptive Photos (omitted automatically when 0 photos) */}
              {hasPhotos ? (
                <section aria-label={copy.memoriesEyebrow} className="space-y-2">
                  <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200/70">
                    {copy.memoriesEyebrow}
                  </p>
                  <OccasionAdaptiveGallery
                    photos={data.photos}
                    accentColor="#60A5FA"
                    dark
                    captionPrefix={copy.photoPrefix}
                  />
                </section>
              ) : null}

              {/* 4. Respectful Human Finale */}
              <section
                aria-label={copy.finaleEyebrow}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
              >
                {finaleState === 'open' ? (
                  <div className="space-y-4 text-center">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200/70">
                      {copy.finaleEyebrow}
                    </p>

                    <p
                      key={`reaction-${nudgeCount}`}
                      className="min-h-[36px] break-words text-xs leading-relaxed text-slate-200/90 animate-fade-in motion-reduce:animate-none sm:text-[13px]"
                    >
                      {upsetReaction}
                    </p>

                    <div className="flex flex-col gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setFinaleState('forgiven')}
                        className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-200 px-5 py-3 text-sm font-semibold text-[#0B1120] shadow-[0_0_30px_-6px_rgba(251,191,36,0.65)] transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
                      >
                        {copy.forgiveCta}
                      </button>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setFinaleState('needs-time')}
                          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-blue-200/25 bg-blue-300/[0.06] px-4 py-2 text-xs font-medium text-blue-100 transition hover:border-blue-200/45 hover:bg-blue-300/[0.12] active:scale-[0.98]"
                        >
                          {copy.needTimeCta}
                        </button>

                        <button
                          type="button"
                          onClick={handleStillUpset}
                          style={{
                            transform: `translate(${currentNudge.x}px, ${currentNudge.y}px)`,
                          }}
                          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-xs font-medium text-slate-300 transition-transform duration-200 hover:bg-white/[0.07]"
                        >
                          {upsetLabel}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {finaleState === 'forgiven' ? (
                  <div className="space-y-4 text-center animate-fade-in motion-reduce:animate-none">
                    <DawnHorizonIllustration />
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/85">
                      {copy.forgivenEyebrow}
                    </p>
                    <h2 className="break-words font-heading text-xl font-semibold leading-snug text-amber-50">
                      {copy.forgivenTitle(receiver)}
                    </h2>
                    <p className="break-words text-xs leading-relaxed text-slate-300/90 sm:text-[13px]">
                      {copy.forgivenBody(sender)}
                    </p>

                    <div className="rounded-2xl border border-amber-200/20 bg-amber-200/[0.05] px-4 py-3 text-left">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200/80">
                        {copy.forgivenGesturesLabel}
                      </p>
                      {selectedGestures.length > 0 ? (
                        <ul className="mt-1.5 space-y-1 text-xs text-slate-200">
                          {CALM_GESTURES.filter((g) => selectedGestures.includes(g.id)).map((g) => (
                            <li key={g.id} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" aria-hidden="true" />
                              <span>{g.label[coreLang]}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-xs text-slate-300/85">{copy.forgivenNoGestures}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setFinaleState('open')}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.09] active:scale-95"
                    >
                      {copy.revisitNoteCta}
                    </button>
                  </div>
                ) : null}

                {finaleState === 'needs-time' ? (
                  <div className="space-y-4 text-center animate-fade-in motion-reduce:animate-none">
                    <div className="mx-auto flex justify-center">
                      <RaindropMoonEmblem />
                    </div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200/80">
                      {copy.needsTimeEyebrow}
                    </p>
                    <h2 className="break-words font-heading text-xl font-semibold leading-snug text-slate-50">
                      {copy.needsTimeTitle(receiver)}
                    </h2>
                    <p className="break-words text-xs leading-relaxed text-slate-300/85 sm:text-[13px]">
                      {copy.needsTimeBody}
                    </p>
                    <button
                      type="button"
                      onClick={() => setFinaleState('open')}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.09] active:scale-95"
                    >
                      {copy.revisitNoteCta}
                    </button>
                  </div>
                ) : null}
              </section>
            </div>

            <footer className="border-t border-white/10 pt-3 text-center text-[11px] font-medium text-slate-400/85">
              {getWebzyFooterLabel(language)}
            </footer>
          </div>
        </div>
      )}
    </article>
  );
}
