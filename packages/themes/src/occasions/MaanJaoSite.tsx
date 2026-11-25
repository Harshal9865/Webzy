'use client';

import React, { useEffect, useId, useState } from 'react';
import { type CoreLanguageCode, pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  getReplayLabel,
  getWebzyFooterLabel,
  OccasionArtworkBackdrop,
  OccasionCassettePlayer,
  OccasionChapterNav,
  OccasionPhotoGallery,
  type OccasionSiteProps,
} from './shared/OccasionPrimitives';

const PALETTE = {
  surface: '#FFF8F3',
  card: '#FFFDFB',
  terracotta: '#C95B42',
  crimson: '#A92638',
  espresso: '#2C1914',
  gold: '#C88A2E',
  goldSoft: '#FEF7E6',
  blushBorder: '#EAD7CC',
  blushTint: '#FCEEE7',
} as const;

type ArenaChapterId = 'brief' | 'meter' | 'vouchers';
type TreatId = 'chai-samosa' | 'ice-cream' | 'long-drive';
type PleaId = 'listened-late' | 'coffee-walk' | 'no-excuses' | 'mean-everything';

interface PleaClauseSpec {
  id: PleaId;
  code: string;
  title: Record<CoreLanguageCode, string>;
  detail: Record<CoreLanguageCode, string>;
}

const PLEA_CLAUSES: readonly PleaClauseSpec[] = [
  {
    id: 'listened-late',
    code: 'CLAUSE 01',
    title: {
      en: 'I listened late',
      hinglish: 'Der se suna, galti meri',
      hi: 'बात देर से सुनी, गलती मेरी',
    },
    detail: {
      en: 'You deserved my full attention the very first time.',
      hinglish: 'Pehli hi baar mein poora dhyan dena chahiye tha.',
      hi: 'पहली ही बार में मुझे आपकी बात ध्यान से सुननी चाहिए थी।',
    },
  },
  {
    id: 'coffee-walk',
    code: 'CLAUSE 02',
    title: {
      en: 'Coffee + walk on me',
      hinglish: 'Coffee + walk meri taraf se',
      hi: 'कॉफ़ी और वॉक मेरी तरफ़ से',
    },
    detail: {
      en: 'Phones on silent, unhurried pace, your favorite corner spot.',
      hinglish: 'Phone silent par, aaram se chalenge, tumhari fav jagah.',
      hi: 'फ़ोन साइलेंट पर, सुकून भरी सैर और आपकी पसंदीदा जगह।',
    },
  },
  {
    id: 'no-excuses',
    code: 'CLAUSE 03',
    title: {
      en: 'No excuses, just sorry',
      hinglish: 'Koi bahana nahi, bas sorry',
      hi: 'कोई बहाना नहीं, दिल से सॉरी',
    },
    detail: {
      en: 'Zero defending, zero ego — owning my slip-up cleanly.',
      hinglish: 'Na koi safai, na koi ego — seedha dil se maafi.',
      hi: 'न कोई सफ़ाई, न कोई ज़िद — बस सच्चे दिल से माफ़ी।',
    },
  },
  {
    id: 'mean-everything',
    code: 'CLAUSE 04',
    title: {
      en: 'You mean everything',
      hinglish: 'Tum mere liye sab kuch ho',
      hi: 'तुम मेरे लिए सबसे ख़ास हो',
    },
    detail: {
      en: 'Protecting your smile matters more than winning any point.',
      hinglish: 'Kisi bhi behes se zyada zaroori sirf tumhari smile hai.',
      hi: 'किसी भी बहस से ज़्यादा ज़रूरी सिर्फ़ आपकी मुस्कान है।',
    },
  },
];

interface TreatVoucherSpec {
  id: TreatId;
  serial: string;
  label: Record<CoreLanguageCode, string>;
  detail: Record<CoreLanguageCode, string>;
}

const TREAT_VOUCHERS: readonly TreatVoucherSpec[] = [
  {
    id: 'chai-samosa',
    serial: 'TRUCE-01',
    label: {
      en: 'Kulhad Chai & Samosa',
      hinglish: 'Kulhad Chai & Samosa',
      hi: 'कुल्हड़ चाय और समोसा',
    },
    detail: {
      en: 'Steaming masala kulhad chai and crisp samosas, zero nagging.',
      hinglish: 'Garma-garam kulhad chai aur crispy samose, bina kisi rona-dhona.',
      hi: 'गरमा-गरम कुल्हड़ चाय और कुरकुरे समोसे, बिना किसी बहस के।',
    },
  },
  {
    id: 'ice-cream',
    serial: 'TRUCE-02',
    label: {
      en: 'Double Scoop Ice Cream',
      hinglish: 'Double Scoop Ice Cream',
      hi: 'डबल स्कूप आइसक्रीम',
    },
    detail: {
      en: 'Waffle cone or tub with extra toppings — your flavour rules.',
      hinglish: 'Waffle cone ya tub extra toppings ke saath — flavour bilkul tumhara.',
      hi: 'वॉफ़ल कोन या टब और एक्स्ट्रा टॉपिंग्स — पसंद बिल्कुल आपकी।',
    },
  },
  {
    id: 'long-drive',
    serial: 'TRUCE-03',
    label: {
      en: 'Midnight Long Drive',
      hinglish: 'Midnight Long Drive',
      hi: 'मिडनाइट लॉन्ग ड्राइव',
    },
    detail: {
      en: 'Your playlist on aux, open windows, quiet roads, no rush.',
      hinglish: 'Tumhari playlist, khuli windows, shaant sadkein, zero jaldi.',
      hi: 'आपकी प्लेलिस्ट, खुली हवा, शांत सड़कें और कोई जल्दी नहीं।',
    },
  },
];

interface MaanJaoCopy {
  dispatchClassification: string;
  dispatchHeader: string;
  dispatchSubtitle: string;
  toLabel: string;
  fromLabel: string;
  openBriefCta: string;
  tapHint: string;
  accordBadge: string;
  tabs: Record<ArenaChapterId, string>;
  meterTitle: string;
  meterSubtitle: (sealedCount: number) => string;
  meterReadyTag: string;
  noteHeaderTag: string;
  noteSignedPrefix: string;
  memoriesLabel: string;
  cassetteTapLabel: string;
  cassettePlayingLabel: string;
  pleasHeading: string;
  pleasHelper: string;
  sealedStamp: string;
  tapToSeal: string;
  vouchersHeading: string;
  vouchersHelper: string;
  selectedStamp: string;
  nextToPleas: string;
  nextToVouchers: string;
  grumpyIdleLabel: string;
  grumpyNudges: string[];
  grumpyPromptIdle: string;
  grumpyPromptReactions: string[];
  forgiveSignCta: string;
  certTopTag: string;
  certTitle: string;
  certSubtitle: string;
  certPartyOne: string;
  certPartyTwo: string;
  certTreatLabel: string;
  certSerialLabel: string;
  certTimestampLabel: string;
  certScoreLabel: string;
  certClauseLine: string;
  certSealedBadge: string;
  revisitArenaCta: string;
}

const MAAN_JAO_COPY: Record<CoreLanguageCode, MaanJaoCopy> = {
  en: {
    dispatchClassification: 'TOP SECRET TRUCE DISPATCH',
    dispatchHeader: 'PEACE ACCORD CASE FILE',
    dispatchSubtitle: 'Warm Apology & Official Ceasefire Request',
    toLabel: 'To',
    fromLabel: 'From',
    openBriefCta: 'Open Peace Brief',
    tapHint: 'Tap the wax seal or button to unseal dispatch',
    accordBadge: 'ACCORD DOSSIER',
    tabs: {
      brief: 'Peace Brief',
      meter: '4 Pleas',
      vouchers: 'Treat Pass',
    },
    meterTitle: 'Forgiveness Meter',
    meterSubtitle: (sealedCount) =>
      sealedCount === 4
        ? 'All 4 peace clauses sealed — 100% truce readiness!'
        : `${sealedCount}/4 plea cards sealed · +20% per stamp`,
    meterReadyTag: 'READY TO RATIFY',
    noteHeaderTag: 'OFFICIAL APOLOGY NOTE',
    noteSignedPrefix: 'Sincerely yours,',
    memoriesLabel: 'Pinned Keepsakes',
    cassetteTapLabel: 'Play Warm Truce Chime',
    cassettePlayingLabel: 'Playing Acoustic Chime...',
    pleasHeading: 'Tap each plea card to stamp (+20%)',
    pleasHelper: 'Seal every honest promise to raise the Forgiveness Meter from 20% to 100%.',
    sealedStamp: 'SEALED +20%',
    tapToSeal: 'TAP TO SEAL',
    vouchersHeading: 'Select your redeemable Peace Treat',
    vouchersHelper: 'Locked directly onto your signed treaty certificate.',
    selectedStamp: 'SELECTED',
    nextToPleas: 'Review 4 Peace Pleas',
    nextToVouchers: 'Pick Peace Treat',
    grumpyIdleLabel: 'Still Grumpy',
    grumpyNudges: [
      'Still Grumpy?',
      'Wait, really?',
      'Even for chai?',
      'Extra samosas?',
      'Okay, truce soon!',
    ],
    grumpyPromptIdle: 'Ready to clear the air and claim your peace treat?',
    grumpyPromptReactions: [
      'Fair enough — let me earn that smile back properly.',
      'Noted! Adding extra warmth and zero excuses.',
      'What if the kulhad chai is piping hot and on me right now?',
      'Okay, doubling down on patience and sweet treats.',
      'This grumpy button is running out of steam — sign the truce!',
    ],
    forgiveSignCta: 'Forgiven — Sign Treaty',
    certTopTag: 'OFFICIAL PEACE ACCORD',
    certTitle: 'Ratified Peace Treaty Certificate',
    certSubtitle: 'All grudges, side-eyes, and silent treatments are hereby dissolved.',
    certPartyOne: 'Forgiving Party',
    certPartyTwo: 'Apologizing Party',
    certTreatLabel: 'Redeemable Treat',
    certSerialLabel: 'Accord Serial',
    certTimestampLabel: 'Ratified On',
    certScoreLabel: 'Forgiveness Index',
    certClauseLine: 'Signed in good faith, warm chai, and mutual smiles.',
    certSealedBadge: 'SEALED & RATIFIED',
    revisitArenaCta: 'Revisit Peace Brief',
  },
  hinglish: {
    dispatchClassification: 'TOP SECRET TRUCE DISPATCH',
    dispatchHeader: 'PEACE ACCORD CASE FILE',
    dispatchSubtitle: 'Dil Se Maafi & Official Sulah Dastawez',
    toLabel: 'Priya',
    fromLabel: 'Taraf se',
    openBriefCta: 'Open Peace Brief',
    tapHint: 'Kholne ke liye wax seal ya button par tap karein',
    accordBadge: 'SULAH FILE',
    tabs: {
      brief: 'Peace Note',
      meter: '4 Vaade',
      vouchers: 'Treat Pass',
    },
    meterTitle: 'Forgiveness Meter',
    meterSubtitle: (sealedCount) =>
      sealedCount === 4
        ? 'Saare 4 vaade seal ho gaye — 100% sulah tayyar!'
        : `${sealedCount}/4 plea cards sealed · har stamp par +20%`,
    meterReadyTag: 'SULAH READY',
    noteHeaderTag: 'SACHCHI MAAFI PATRA',
    noteSignedPrefix: 'Tumhara apna,',
    memoriesLabel: 'Hamari Yaadein',
    cassetteTapLabel: 'Warm Truce Dhun Bajao',
    cassettePlayingLabel: 'Pyari Dhun Baj Rahi Hai...',
    pleasHeading: 'Har plea card tap karke stamp lagao (+20%)',
    pleasHelper: 'Har vaada seal karte hi Forgiveness Meter 20% se 100% tak badhega.',
    sealedStamp: 'SEALED +20%',
    tapToSeal: 'TAP KARO',
    vouchersHeading: 'Apna Peace Treat Voucher chuno',
    vouchersHelper: 'Yeh voucher seedha tumhare signed treaty par lock hoga.',
    selectedStamp: 'CHUNA GAYA',
    nextToPleas: '4 Vaade Dekho',
    nextToVouchers: 'Treat Voucher Chuno',
    grumpyIdleLabel: 'Still Grumpy',
    grumpyNudges: [
      'Abhi bhi gussa?',
      'Sach mein?',
      'Kulhad chai pe bhi?',
      'Double scoop bhi?',
      'Bas maan jao na!',
    ],
    grumpyPromptIdle: 'Ab gussa chhodo aur apna peace treat lock karo?',
    grumpyPromptReactions: [
      'Chalo theek hai, poori koshish se tumhari smile wapas launga.',
      'Bilkul fair — bina kisi bahane ke dil se sorry.',
      'Garma-garam kulhad chai + samosa pe toh maan jao?',
      'Achha baba, extra patience aur double treat pakka!',
      'Bechara grumpy button bhi thak gaya — ab treaty sign kar do!',
    ],
    forgiveSignCta: 'Forgiven — Sign Treaty',
    certTopTag: 'OFFICIAL PEACE ACCORD',
    certTitle: 'Ratified Peace Treaty Certificate',
    certSubtitle: 'Is pal se saari narazgi aur chuppi officially khatam maani jayegi.',
    certPartyOne: 'Maaf Karne Wale',
    certPartyTwo: 'Maafi Mangne Wale',
    certTreatLabel: 'Treat Voucher',
    certSerialLabel: 'Accord Serial',
    certTimestampLabel: 'Sign Samay',
    certScoreLabel: 'Forgiveness Score',
    certClauseLine: 'Sacche dil, garma-garam chai aur pyaari muskaan ke saath pakka.',
    certSealedBadge: 'SEALED & RATIFIED',
    revisitArenaCta: 'Treaty Dobara Dekho',
  },
  hi: {
    dispatchClassification: 'गोपनीय शांति संदेश',
    dispatchHeader: 'PEACE ACCORD CASE FILE',
    dispatchSubtitle: 'सच्चे दिल से माफ़ी और सुलह का आधिकारिक प्रस्ताव',
    toLabel: 'प्रिय',
    fromLabel: 'प्रेषक',
    openBriefCta: 'शांति पत्र खोलें',
    tapHint: 'खोलने के लिए मुहर या बटन पर टैप करें',
    accordBadge: 'शांति फ़ाइल',
    tabs: {
      brief: 'माफ़ी पत्र',
      meter: '4 वादे',
      vouchers: 'ट्रीट पास',
    },
    meterTitle: 'माफ़ी मीटर',
    meterSubtitle: (sealedCount) =>
      sealedCount === 4
        ? 'सभी 4 वादे मुहरबंद — 100% सुलह तैयार!'
        : `${sealedCount}/4 वादे मुहरबंद · हर कार्ड पर +20%`,
    meterReadyTag: 'संधि तैयार',
    noteHeaderTag: 'दिल से माफ़ी संदेश',
    noteSignedPrefix: 'स्नेह सहित,',
    memoriesLabel: 'संजोई यादें',
    cassetteTapLabel: 'मधुर धुन बजाएं',
    cassettePlayingLabel: 'मधुर धुन बज रही है...',
    pleasHeading: 'हर वादे पर टैप कर मुहर लगाएं (+20%)',
    pleasHelper: 'हर कार्ड पर टैप करने से माफ़ी मीटर 20% से 100% तक बढ़ेगा।',
    sealedStamp: 'मुहर +20%',
    tapToSeal: 'टैप करें',
    vouchersHeading: 'अपना शांति ट्रीट वाउचर चुनें',
    vouchersHelper: 'चुना गया वाउचर आपके शांति प्रमाणपत्र पर दर्ज होगा।',
    selectedStamp: 'चयनित',
    nextToPleas: '4 वादे देखें',
    nextToVouchers: 'ट्रीट वाउचर चुनें',
    grumpyIdleLabel: 'अभी भी नाराज़',
    grumpyNudges: [
      'सच में नाराज़?',
      'ज़रा सोचो तो!',
      'कुल्हड़ चाय पर भी?',
      'आइसक्रीम भी?',
      'अब मान भी जाओ!',
    ],
    grumpyPromptIdle: 'क्या अब नाराज़गी छोड़कर ट्रीट वाउचर पक्का करें?',
    grumpyPromptReactions: [
      'सही बात है — आपकी मुस्कान लौटाने की पूरी कोशिश रहेगी।',
      'बिना किसी बहाने के, सच्चे दिल से माफ़ी।',
      'गरमा-गरम कुल्हड़ चाय और समोसे पर तो मान जाइए!',
      'ठीक है, दोगुने प्यार और मीठी ट्रीट का वादा पक्का।',
      'नाराज़गी वाला बटन भी हार मान गया — अब संधि पर मुहर लगा दें!',
    ],
    forgiveSignCta: 'माफ़ किया — संधि पक्की करें',
    certTopTag: 'आधिकारिक शांति संधि',
    certTitle: 'प्रमाणित शांति संधि प्रमाणपत्र',
    certSubtitle: 'इस क्षण से सभी शिकायतें और नाराज़गी आधिकारिक रूप से समाप्त हैं।',
    certPartyOne: 'माफ़ करने वाले',
    certPartyTwo: 'माफ़ी मांगने वाले',
    certTreatLabel: 'चयनित ट्रीट',
    certSerialLabel: 'संधि क्रमांक',
    certTimestampLabel: 'हस्ताक्षर समय',
    certScoreLabel: 'माफ़ी सूचकांक',
    certClauseLine: 'सच्चे मन, गर्मागर्म चाय और मुस्कान के साथ हस्ताक्षरित।',
    certSealedBadge: 'मुहरबंद एवं प्रमाणित',
    revisitArenaCta: 'संधि विवरण देखें',
  },
};

function WatermarkBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative z-30 flex justify-center border-b border-[#A92638]/15 bg-[#FCEEE7]/95 py-1 text-[10px] font-bold tracking-[0.2em] text-[#A92638]"
    >
      WEBZY FREE PREVIEW
    </div>
  );
}

function WaxHeartSealSvg({ initials }: { initials: string }) {
  const gradId = useId();
  return (
    <div className="relative flex h-16 w-16 items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 64 64" className="h-16 w-16 drop-shadow-md">
        <defs>
          <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#D64054" />
            <stop offset="60%" stopColor="#A92638" />
            <stop offset="100%" stopColor="#6E1420" />
          </radialGradient>
        </defs>
        <path
          d="M32 4c3.1 0 5.4 2.1 8.2 1.8 2.9-.3 5.2-2 7.8-.7 2.6 1.3 2.5 4.4 4.5 6.4 2 2 5.1 1.9 6.4 4.5 1.3 2.6-.4 4.9-.7 7.8-.3 2.8 1.8 5.1 1.8 8.2s-2.1 5.4-1.8 8.2c.3 2.9 2 5.2.7 7.8-1.3 2.6-4.4 2.5-6.4 4.5-2 2-1.9 5.1-4.5 6.4-2.6 1.3-4.9-.4-7.8-.7-2.8-.3-5.1 1.8-8.2 1.8s-5.4-2.1-8.2-1.8c-2.9.3-5.2 2-7.8.7-2.6-1.3-2.5-4.4-4.5-6.4-2-2-5.1-1.9-6.4-4.5-1.3-2.6.4-4.9.7-7.8.3-2.8-1.8-5.1-1.8-8.2s2.1-5.4 1.8-8.2c-.3-2.9-2-5.2-.7-7.8 1.3-2.6 4.4-2.5 6.4-4.5 2-2 1.9-5.1 4.5-6.4 2.6-1.3 4.9.4 7.8.7 2.8.3 5.1-1.8 8.2-1.8Z"
          fill={`url(#${gradId})`}
        />
        <circle cx="32" cy="32" r="20" fill="none" stroke="#F8D8C8" strokeOpacity="0.45" strokeWidth="1.2" strokeDasharray="3 2" />
        <path
          d="M32 44.5c-.6 0-1.2-.2-1.6-.6-5.2-4.6-9.4-8.5-9.4-13.2 0-3.3 2.6-5.9 5.9-5.9 2 0 3.9 1 5.1 2.6 1.2-1.6 3.1-2.6 5.1-2.6 3.3 0 5.9 2.6 5.9 5.9 0 4.7-4.2 8.6-9.4 13.2-.4.4-1 .6-1.6.6Z"
          fill="#6E1420"
          fillOpacity="0.45"
        />
      </svg>
      <span className="absolute font-mono text-[11px] font-extrabold tracking-wider text-[#FFF8F3]">
        {initials}
      </span>
    </div>
  );
}

function TreatVectorIcon({ treatId, active }: { treatId: TreatId; active: boolean }) {
  const strokeColor = active ? PALETTE.crimson : PALETTE.espresso;
  if (treatId === 'chai-samosa') {
    return (
      <svg className="h-6 w-6 shrink-0" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M9 4.5c0 1.3 1.2 1.7 1.2 2.9M13.5 4c0 1.3 1.2 1.7 1.2 2.9" stroke={PALETTE.terracotta} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M5.5 10.5h11l-1.3 9.2a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8l-1.3-9.2Z" fill={PALETTE.terracotta} fillOpacity="0.16" stroke={strokeColor} strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M18.2 21.5l3.8-6.6 3.4 6.6h-7.2Z" fill={PALETTE.gold} fillOpacity="0.28" stroke={PALETTE.gold} strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }
  if (treatId === 'ice-cream') {
    return (
      <svg className="h-6 w-6 shrink-0" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M9 12a4.5 4.5 0 0 1 8.8-1.4A3.8 3.8 0 0 1 19 14H9a3.5 3.5 0 0 1 0-2Z" fill={PALETTE.crimson} fillOpacity="0.18" stroke={strokeColor} strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M11 8.5a3.5 3.5 0 0 1 6 0" stroke={PALETTE.terracotta} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9.2 14h9.6L14 24.5 9.2 14Z" fill={PALETTE.gold} fillOpacity="0.24" stroke={PALETTE.gold} strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className="h-6 w-6 shrink-0" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="9" stroke={strokeColor} strokeWidth="1.7" />
      <circle cx="14" cy="14" r="2.2" fill={PALETTE.terracotta} stroke={strokeColor} strokeWidth="1.4" />
      <path d="M5.5 12.5h6.2M16.3 12.5h6.2M14 16.3V23" stroke={strokeColor} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M19.5 5.5l1.2-1.8M22 8l1.8-1" stroke={PALETTE.gold} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CircularForgivenessGauge({
  score,
  label,
  compact = false,
}: {
  score: number;
  label: string;
  compact?: boolean;
}) {
  const gaugeGradId = useId();
  const clamped = Math.max(20, Math.min(100, score));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped / 100);

  // Smoothly interpolate mouth curve from hesitant flat-frown (20%) to beaming smile (100%)
  const ratio = (clamped - 20) / 80;
  const mouthControlY = 63 - ratio * 18;
  const mouthCornerY = 56 - ratio * 3;
  const browTilt = clamped <= 40 ? 2.8 : clamped < 80 ? 0.5 : -2;
  const blushOpacity = clamped >= 60 ? Math.min(0.55, (clamped - 50) / 80) : 0;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative flex items-center justify-center ${compact ? 'h-24 w-24' : 'h-28 w-28'}`}
        role="img"
        aria-label={`${label}: ${clamped}%`}
      >
        <svg viewBox="0 0 104 104" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id={gaugeGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={PALETTE.terracotta} />
              <stop offset="100%" stopColor={PALETTE.crimson} />
            </linearGradient>
          </defs>
          <circle
            cx="52"
            cy="52"
            r={radius}
            fill={PALETTE.surface}
            stroke={PALETTE.blushBorder}
            strokeWidth="8"
          />
          <circle
            cx="52"
            cy="52"
            r={radius}
            fill="none"
            stroke={`url(#${gaugeGradId})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 52 52)"
            style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(0.22, 1, 0.36, 1)' }}
          />

          {/* Soft blush cheeks */}
          <circle cx="36" cy="56" r="4.5" fill={PALETTE.terracotta} fillOpacity={blushOpacity} />
          <circle cx="68" cy="56" r="4.5" fill={PALETTE.terracotta} fillOpacity={blushOpacity} />

          {/* Expressive brows */}
          <path
            d={`M35 ${40 - browTilt * 0.4} L44 ${40 + browTilt}`}
            stroke={PALETTE.espresso}
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <path
            d={`M60 ${40 + browTilt} L69 ${40 - browTilt * 0.4}`}
            stroke={PALETTE.espresso}
            strokeWidth="2.3"
            strokeLinecap="round"
          />

          {/* Eyes */}
          {clamped >= 90 ? (
            <>
              <path d="M37 48.5 Q40 44.5 43 48.5" stroke={PALETTE.espresso} strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M61 48.5 Q64 44.5 67 48.5" stroke={PALETTE.espresso} strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="40" cy="48" r="2.5" fill={PALETTE.espresso} />
              <circle cx="64" cy="48" r="2.5" fill={PALETTE.espresso} />
            </>
          )}

          {/* Mouth */}
          <path
            d={`M41 ${mouthCornerY} Q52 ${mouthControlY} 63 ${mouthCornerY}`}
            stroke={clamped >= 80 ? PALETTE.crimson : PALETTE.espresso}
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        <span
          className="absolute -bottom-1.5 rounded-full border bg-white px-2.5 py-0.5 font-mono text-[11px] font-extrabold shadow-xs"
          style={{
            borderColor: clamped >= 80 ? PALETTE.crimson : PALETTE.blushBorder,
            color: clamped >= 80 ? PALETTE.crimson : PALETTE.espresso,
          }}
        >
          {clamped}%
        </span>
      </div>
    </div>
  );
}

function GoldenCheckStamp({ sealed, label }: { sealed: boolean; label: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[9.5px] font-extrabold tracking-wider transition-all duration-300 ${
        sealed ? 'scale-100 shadow-xs' : 'opacity-70'
      }`}
      style={{
        borderColor: sealed ? PALETTE.gold : PALETTE.blushBorder,
        backgroundColor: sealed ? PALETTE.goldSoft : PALETTE.surface,
        color: sealed ? '#92400E' : `${PALETTE.espresso}8C`,
      }}
    >
      {sealed ? (
        <svg className="h-3.5 w-3.5 text-[#C88A2E]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a.75.75 0 0 0-1.1-1.06l-3.4 3.5-1.5-1.48a.75.75 0 0 0-1.06 1.06l2.04 2.02a.75.75 0 0 0 1.07-.01l3.95-4.03Z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <span className="h-2 w-2 rounded-full border border-current" aria-hidden="true" />
      )}
      <span>{label}</span>
    </span>
  );
}

function DiplomaticCoverStage({
  data,
  copy,
  initials,
  showTapHint,
  onOpen,
}: {
  data: OccasionSiteProps['data'];
  copy: MaanJaoCopy;
  initials: string;
  showTapHint: boolean;
  onOpen: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="relative flex flex-1 cursor-pointer flex-col items-center justify-center px-4 py-6 text-center sm:px-6"
    >
      <OccasionArtworkBackdrop
        src="/templates/occasions/maan-jao/cover.jpg"
        fallbackGradient="linear-gradient(155deg, #FFF8F3 0%, #FDE8E2 55%, #F7DCD4 100%)"
        className="object-cover object-center opacity-50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#2C1914]/25 via-[#FFF8F3]/45 to-[#2C1914]/35"
      />

      {/* Diplomatic Dispatch Case File Card */}
      <div
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-[26px] border-2 bg-[#FFF8F3]/95 shadow-[0_24px_48px_-16px_rgba(44,25,20,0.45)] backdrop-blur-xs transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.99]"
        style={{ borderColor: PALETTE.terracotta }}
      >
        {/* Burgundy & Terracotta Diplomatic Dispatch Banner */}
        <div
          className="border-b px-4 py-3 text-center"
          style={{
            background: `linear-gradient(135deg, ${PALETTE.crimson} 0%, ${PALETTE.terracotta} 100%)`,
            borderColor: '#7F1D1D',
          }}
        >
          <p className="font-mono text-[9.5px] font-extrabold tracking-[0.22em] text-[#FEF7E6]/90">
            {copy.dispatchClassification}
          </p>
          <h1 className="mt-0.5 font-heading text-sm font-extrabold tracking-[0.14em] text-[#FFF8F3]">
            {copy.dispatchHeader}
          </h1>
        </div>

        {/* Inner Folio Body */}
        <div className="relative px-5 pb-6 pt-5">
          {/* Corner editorial brackets */}
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l-2 border-t-2 border-[#C88A2E]/60" />
          <span aria-hidden="true" className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r-2 border-t-2 border-[#C88A2E]/60" />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b-2 border-l-2 border-[#C88A2E]/60" />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2 border-[#C88A2E]/60" />

          <div className="mx-auto mb-3 flex justify-center">
            <WaxHeartSealSvg initials={initials} />
          </div>

          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: PALETTE.terracotta }}>
            {copy.dispatchSubtitle}
          </p>

          {/* From / To Diplomatic Badge */}
          <div
            className="mt-3.5 rounded-2xl border px-3.5 py-3 text-left"
            style={{ borderColor: PALETTE.blushBorder, backgroundColor: PALETTE.card }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-dashed border-[#EAD7CC] pb-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: `${PALETTE.espresso}8C` }}>
                {copy.toLabel}
              </span>
              <span className="min-w-0 break-words text-right font-heading text-base font-bold" style={{ color: PALETTE.espresso }}>
                {data.receiverName}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: `${PALETTE.espresso}8C` }}>
                {copy.fromLabel}
              </span>
              <span className="min-w-0 break-words text-right text-sm font-bold" style={{ color: PALETTE.crimson }}>
                {data.senderName}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-[#FFF8F3] shadow-md transition hover:brightness-105 active:scale-[0.98] motion-reduce:transition-none"
            style={{ backgroundColor: PALETTE.crimson }}
          >
            <span>{copy.openBriefCta}</span>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12m0 0l-4-4m4 4l-4 4" />
            </svg>
          </button>

          {showTapHint ? (
            <p className="mt-3 text-[11px] font-semibold animate-pulse motion-reduce:animate-none" style={{ color: PALETTE.crimson }}>
              {copy.tapHint}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TreatVoucherCard({
  voucher,
  label,
  detail,
  selectedStamp,
  selected,
  onSelect,
}: {
  voucher: TreatVoucherSpec;
  label: string;
  detail: string;
  selectedStamp: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="group relative flex min-h-[64px] w-full items-center gap-3 overflow-hidden rounded-2xl border px-4 py-2.5 text-left transition-all duration-200 active:scale-[0.98]"
      style={{
        borderColor: selected ? PALETTE.crimson : PALETTE.blushBorder,
        backgroundColor: selected ? PALETTE.card : `${PALETTE.card}CC`,
        boxShadow: selected ? `0 0 0 1px ${PALETTE.crimson}33, 0 10px 22px -12px ${PALETTE.crimson}55` : undefined,
      }}
    >
      {/* Ticket perforation notches */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border"
        style={{
          backgroundColor: PALETTE.surface,
          borderColor: selected ? PALETTE.crimson : PALETTE.blushBorder,
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border"
        style={{
          backgroundColor: PALETTE.surface,
          borderColor: selected ? PALETTE.crimson : PALETTE.blushBorder,
        }}
      />

      <div
        className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors"
        style={{ backgroundColor: selected ? PALETTE.blushTint : PALETTE.surface }}
      >
        <TreatVectorIcon treatId={voucher.id} active={selected} />
      </div>

      <div className="min-w-0 flex-1 border-r border-dashed border-[#EAD7CC] pr-2.5">
        <span
          className="block break-words font-heading text-sm font-bold"
          style={{ color: selected ? PALETTE.crimson : PALETTE.espresso }}
        >
          {label}
        </span>
        <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug" style={{ color: `${PALETTE.espresso}A6` }}>
          {detail}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-center gap-1 pr-1">
        <span className="font-mono text-[9.5px] font-bold tracking-wider" style={{ color: `${PALETTE.espresso}80` }}>
          {voucher.serial}
        </span>
        {selected ? (
          <span
            className="-rotate-3 rounded border px-1.5 py-0.5 font-mono text-[9px] font-extrabold tracking-widest"
            style={{
              borderColor: PALETTE.crimson,
              color: PALETTE.crimson,
              backgroundColor: PALETTE.blushTint,
            }}
          >
            {selectedStamp}
          </span>
        ) : (
          <span className="h-4 w-4 rounded-full border border-[#EAD7CC]" aria-hidden="true" />
        )}
      </div>
    </button>
  );
}

function RatifiedCertificateStage({
  copy,
  data,
  treatLabel,
  treatSerial,
  accordSerial,
  ratifiedAtLabel,
  forgivenessScore,
  language,
  onRevisitArena,
  onReplayCover,
}: {
  copy: MaanJaoCopy;
  data: OccasionSiteProps['data'];
  treatLabel: string;
  treatSerial: string;
  accordSerial: string;
  ratifiedAtLabel: string;
  forgivenessScore: number;
  language: OccasionSiteProps['language'];
  onRevisitArena: () => void;
  onReplayCover: () => void;
}) {
  const senderInitial = (data.senderName || 'S').trim().charAt(0).toUpperCase() || 'S';
  const receiverInitial = (data.receiverName || 'R').trim().charAt(0).toUpperCase() || 'R';

  return (
    <div className="relative z-10 flex flex-1 flex-col justify-between gap-3 px-4 pb-4 pt-3.5 animate-fade-in motion-reduce:animate-none sm:px-5">
      <div className="flex items-center justify-between gap-2">
        <span
          className="rounded-full border px-3 py-1 font-mono text-[10px] font-bold tracking-[0.16em]"
          style={{
            borderColor: `${PALETTE.gold}66`,
            backgroundColor: PALETTE.goldSoft,
            color: '#92400E',
          }}
        >
          {accordSerial}
        </span>
        <button
          type="button"
          onClick={onReplayCover}
          className="inline-flex min-h-[44px] items-center rounded-full border bg-white px-4 text-xs font-semibold shadow-2xs transition hover:bg-[#FFFDFB] active:scale-95"
          style={{ borderColor: PALETTE.blushBorder, color: PALETTE.espresso }}
        >
          {getReplayLabel(language)}
        </button>
      </div>

      {/* Formal Embossed Peace Treaty Certificate */}
      <div
        className="relative my-auto rounded-[26px] border-2 p-1.5 shadow-[0_20px_42px_-16px_rgba(44,25,20,0.28)] animate-pop-bounce motion-reduce:animate-none"
        style={{
          borderColor: PALETTE.gold,
          backgroundColor: PALETTE.card,
        }}
      >
        <div
          className="relative overflow-hidden rounded-[20px] border px-4 py-5 text-center sm:px-5"
          style={{
            borderColor: `${PALETTE.terracotta}55`,
            backgroundColor: PALETTE.surface,
          }}
        >
          {/* Decorative embossed corner rules */}
          <span aria-hidden="true" className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 border-l-2 border-t-2 border-[#C88A2E]/70" />
          <span aria-hidden="true" className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 border-r-2 border-t-2 border-[#C88A2E]/70" />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-2.5 left-2.5 h-3.5 w-3.5 border-b-2 border-l-2 border-[#C88A2E]/70" />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-2.5 right-2.5 h-3.5 w-3.5 border-b-2 border-r-2 border-[#C88A2E]/70" />

          {/* Header Banner & Angled Ratified Stamp */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[9.5px] font-extrabold uppercase tracking-[0.22em]" style={{ color: PALETTE.terracotta }}>
              {copy.certTopTag}
            </span>

            <div className="my-2.5 flex items-center justify-center gap-3">
              <WaxHeartSealSvg initials={`${senderInitial}&${receiverInitial}`} />
              <div
                className="-rotate-3 rounded-xl border-2 border-dashed px-3 py-1.5"
                style={{ borderColor: PALETTE.crimson, backgroundColor: PALETTE.card }}
              >
                <span className="block font-mono text-[10px] font-extrabold tracking-[0.16em]" style={{ color: PALETTE.crimson }}>
                  {copy.certSealedBadge}
                </span>
              </div>
            </div>

            <h2 className="break-words font-heading text-xl font-bold leading-snug sm:text-2xl" style={{ color: PALETTE.espresso }}>
              {copy.certTitle}
            </h2>
            <p className="mt-1 max-w-xs break-words text-xs leading-relaxed" style={{ color: `${PALETTE.espresso}B3` }}>
              {copy.certSubtitle}
            </p>
          </div>

          {/* Official Treaty Ledger */}
          <div
            className="mt-4 space-y-2 rounded-2xl border p-3.5 text-left text-xs"
            style={{ borderColor: PALETTE.blushBorder, backgroundColor: PALETTE.card }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-dashed border-[#EAD7CC] pb-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: `${PALETTE.espresso}80` }}>
                {copy.certPartyOne}
              </span>
              <span className="min-w-0 break-words text-right font-bold" style={{ color: PALETTE.espresso }}>
                {data.receiverName}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 border-b border-dashed border-[#EAD7CC] pb-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: `${PALETTE.espresso}80` }}>
                {copy.certPartyTwo}
              </span>
              <span className="min-w-0 break-words text-right font-bold" style={{ color: PALETTE.terracotta }}>
                {data.senderName}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 border-b border-dashed border-[#EAD7CC] pb-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: `${PALETTE.espresso}80` }}>
                {copy.certTreatLabel}
              </span>
              <span className="min-w-0 break-words text-right font-bold" style={{ color: PALETTE.crimson }}>
                {treatLabel} ({treatSerial})
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 border-b border-dashed border-[#EAD7CC] pb-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: `${PALETTE.espresso}80` }}>
                {copy.certScoreLabel}
              </span>
              <span className="font-mono font-extrabold" style={{ color: '#92400E' }}>
                {forgivenessScore}%
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 border-b border-dashed border-[#EAD7CC] pb-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: `${PALETTE.espresso}80` }}>
                {copy.certSerialLabel}
              </span>
              <span className="font-mono font-bold tracking-wider" style={{ color: PALETTE.espresso }}>
                {accordSerial}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: `${PALETTE.espresso}80` }}>
                {copy.certTimestampLabel}
              </span>
              <span className="min-w-0 break-words text-right font-mono text-[11px] font-semibold" style={{ color: `${PALETTE.espresso}CC` }}>
                {ratifiedAtLabel}
              </span>
            </div>
          </div>

          <p className="mt-3 font-royal-serif text-xs italic" style={{ color: `${PALETTE.espresso}B3` }}>
            {copy.certClauseLine}
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onRevisitArena}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border bg-white px-5 py-2 text-xs font-bold transition hover:bg-[#FFFDFB] active:scale-95"
              style={{ borderColor: PALETTE.terracotta, color: PALETTE.terracotta }}
            >
              {copy.revisitArenaCta}
            </button>
          </div>
        </div>
      </div>

      <footer className="border-t border-[#EAD7CC] pt-2.5 text-center text-[11px] font-medium" style={{ color: `${PALETTE.espresso}99` }}>
        {getWebzyFooterLabel(language)}
      </footer>
    </div>
  );
}

/**
 * 3-Stage "Official Peace Accord" Maan Jao keepsake microsite:
 * Stage 1: Top Secret Truce Dispatch Cover Gate
 * Stage 2: Interactive Forgiveness Arena (Note + Cassette + Gallery, Circular Gauge + 4 Plea Cards, Treat Vouchers, Decision Bar)
 * Stage 3: Official Ratified Peace Treaty Certificate
 */
export function MaanJaoSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const [opened, setOpened] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);
  const [activeChapter, setActiveChapter] = useState<ArenaChapterId>('brief');
  const [sealedPleas, setSealedPleas] = useState<PleaId[]>([]);
  const [selectedTreat, setSelectedTreat] = useState<TreatId>('chai-samosa');
  const [nudgeCount, setNudgeCount] = useState(0);
  const [ratifiedAtLabel, setRatifiedAtLabel] = useState<string | null>(null);

  const coreLang = toCoreLanguageCode(language);
  const copy = MAAN_JAO_COPY[coreLang] ?? MAAN_JAO_COPY.en;

  const senderInitial = (data.senderName || 'S').trim().charAt(0).toUpperCase() || 'S';
  const receiverInitial = (data.receiverName || 'R').trim().charAt(0).toUpperCase() || 'R';
  const activeVoucher = TREAT_VOUCHERS.find((v) => v.id === selectedTreat) ?? TREAT_VOUCHERS[0];
  const activeTreatLabel = activeVoucher.label[coreLang] ?? activeVoucher.label.en;
  const accordSerial = `PA-2026-${senderInitial}${receiverInitial}-${activeVoucher.serial.slice(-2)}`;
  const trackTitle = manifest.music?.[0]?.label || 'Warm Truce Chime';

  // Starts at 20%, each sealed plea card adds +20% up to 100%
  const forgivenessScore = Math.min(100, 20 + sealedPleas.length * 20);

  useEffect(() => {
    if (opened) return;
    const hintTimer = setTimeout(() => setShowTapHint(true), 7000);
    return () => clearTimeout(hintTimer);
  }, [opened]);

  function handleOpen() {
    setOpened(true);
    onOpened?.();
  }

  function handleReplayCover() {
    setShowTapHint(false);
    setRatifiedAtLabel(null);
    setNudgeCount(0);
    setActiveChapter('brief');
    setOpened(false);
  }

  function togglePleaCard(id: PleaId) {
    setSealedPleas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function handleDodgingGrumpy() {
    setNudgeCount((prev) => prev + 1);
  }

  function handleRatifyTreaty() {
    const locale = coreLang === 'hi' ? 'hi-IN' : 'en-IN';
    const stamp = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
    setRatifiedAtLabel(stamp);
  }

  const dodgeOffsets = [
    { x: 0, y: 0 },
    { x: 10, y: -3 },
    { x: -10, y: 3 },
    { x: 8, y: 3 },
    { x: -8, y: -2 },
  ];
  const currentDodge = dodgeOffsets[nudgeCount % dodgeOffsets.length];
  const grumpyLabel =
    nudgeCount > 0
      ? copy.grumpyNudges[(nudgeCount - 1) % copy.grumpyNudges.length]
      : copy.grumpyIdleLabel;
  const grumpyReaction =
    nudgeCount > 0
      ? copy.grumpyPromptReactions[(nudgeCount - 1) % copy.grumpyPromptReactions.length]
      : copy.grumpyPromptIdle;
  const ratifyScale = Math.min(1.06, 1 + nudgeCount * 0.015);

  const chapterTabs = [
    { id: 'brief', label: copy.tabs.brief },
    { id: 'meter', label: copy.tabs.meter },
    { id: 'vouchers', label: copy.tabs.vouchers },
  ];

  return (
    <article
      aria-label={copy.dispatchHeader}
      className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px]"
      style={{ backgroundColor: PALETTE.surface, color: PALETTE.espresso }}
    >
      <WatermarkBanner visible={watermarked} />

      {!opened ? (
        <DiplomaticCoverStage
          data={data}
          copy={copy}
          initials={`${senderInitial}&${receiverInitial}`}
          showTapHint={showTapHint}
          onOpen={handleOpen}
        />
      ) : ratifiedAtLabel ? (
        <RatifiedCertificateStage
          copy={copy}
          data={data}
          treatLabel={activeTreatLabel}
          treatSerial={activeVoucher.serial}
          accordSerial={accordSerial}
          ratifiedAtLabel={ratifiedAtLabel}
          forgivenessScore={forgivenessScore}
          language={language}
          onRevisitArena={() => setRatifiedAtLabel(null)}
          onReplayCover={handleReplayCover}
        />
      ) : (
        <div className="relative z-10 flex flex-1 flex-col justify-between gap-3 px-3.5 pb-4 pt-3 animate-fade-in motion-reduce:animate-none sm:px-5">
          {/* Top Diplomatic Bar + Chapter Tabs + Compact Live Meter Pill */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span
                className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] font-bold tracking-[0.14em]"
                style={{
                  borderColor: `${PALETTE.terracotta}44`,
                  backgroundColor: PALETTE.card,
                  color: PALETTE.crimson,
                }}
              >
                <span>{copy.accordBadge}</span>
                <span aria-hidden="true">·</span>
                <span>{forgivenessScore}%</span>
              </span>

              <button
                type="button"
                onClick={handleReplayCover}
                className="inline-flex min-h-[44px] items-center rounded-full border bg-white px-3.5 text-xs font-semibold shadow-2xs transition hover:bg-[#FFFDFB] active:scale-95"
                style={{ borderColor: PALETTE.blushBorder, color: PALETTE.espresso }}
              >
                {getReplayLabel(language)}
              </button>
            </div>

            <OccasionChapterNav
              tabs={chapterTabs}
              activeId={activeChapter}
              onSelect={(id) => setActiveChapter(id as ArenaChapterId)}
              accentColor={PALETTE.crimson}
            />
          </div>

          {/* CHAPTER 01: Stitched Apology Note, Warm Cassette & Optional Photo Gallery */}
          {activeChapter === 'brief' ? (
            <section
              aria-label={copy.tabs.brief}
              className="flex flex-1 flex-col justify-between gap-3 animate-fade-in motion-reduce:animate-none"
            >
              <div className="space-y-3">
                {/* Stitched Apology Note Card */}
                <div
                  className="relative rounded-[22px] border p-1.5 shadow-[0_12px_28px_-14px_rgba(44,25,20,0.2)]"
                  style={{ borderColor: PALETTE.terracotta, backgroundColor: PALETTE.card }}
                >
                  <div
                    className="relative rounded-[16px] border-2 border-dashed px-4 py-4 text-center"
                    style={{ borderColor: `${PALETTE.terracotta}66`, backgroundColor: PALETTE.surface }}
                  >
                    <span
                      className="inline-flex items-center rounded-full border px-3 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.16em]"
                      style={{
                        borderColor: `${PALETTE.crimson}33`,
                        backgroundColor: PALETTE.card,
                        color: PALETTE.crimson,
                      }}
                    >
                      {copy.noteHeaderTag}
                    </span>

                    <h2
                      className="mt-2.5 break-words font-heading text-xl font-bold leading-snug sm:text-2xl"
                      style={{ color: PALETTE.crimson }}
                    >
                      {pickLocalizedText(data.headline, language)}
                    </h2>

                    <p
                      className="mt-2 break-words text-sm leading-relaxed"
                      style={{ color: `${PALETTE.espresso}E0` }}
                    >
                      {pickLocalizedText(data.message, language)}
                    </p>

                    <p className="mt-3 font-royal-serif text-xs italic font-semibold" style={{ color: PALETTE.terracotta }}>
                      {copy.noteSignedPrefix} {data.senderName}
                    </p>

                    {data.photos && data.photos.length > 0 ? (
                      <div className="mt-3 border-t border-dashed border-[#EAD7CC] pt-2.5">
                        <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em]" style={{ color: `${PALETTE.espresso}8C` }}>
                          {copy.memoriesLabel}
                        </p>
                        <OccasionPhotoGallery
                          photos={data.photos}
                          accentColor={PALETTE.crimson}
                          surfaceTint={PALETTE.surface}
                          captionPrefix="Memory"
                          variant="polaroid"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Warm Cassette Soundtrack */}
                <OccasionCassettePlayer
                  trackTitle={trackTitle}
                  mood="warm"
                  tapLabel={copy.cassetteTapLabel}
                  playingLabel={copy.cassettePlayingLabel}
                  accentColor={PALETTE.terracotta}
                />
              </div>

              <button
                type="button"
                onClick={() => setActiveChapter('meter')}
                className="inline-flex min-h-[44px] items-center justify-center self-center rounded-full border px-5 text-xs font-bold transition hover:bg-white active:scale-95"
                style={{
                  borderColor: `${PALETTE.terracotta}55`,
                  backgroundColor: PALETTE.card,
                  color: PALETTE.terracotta,
                }}
              >
                {copy.nextToPleas} →
              </button>
            </section>
          ) : null}

          {/* CHAPTER 02: Circular Forgiveness Meter Gauge SVG + 4 Interactive Reason Plea Cards */}
          {activeChapter === 'meter' ? (
            <section
              aria-label={copy.tabs.meter}
              className="flex flex-1 flex-col justify-between gap-3 animate-fade-in motion-reduce:animate-none"
            >
              <div className="space-y-3">
                {/* Circular Forgiveness Gauge Card */}
                <div
                  className="flex items-center gap-3.5 rounded-2xl border p-3.5 shadow-2xs"
                  style={{ borderColor: PALETTE.blushBorder, backgroundColor: PALETTE.card }}
                >
                  <CircularForgivenessGauge
                    score={forgivenessScore}
                    label={copy.meterTitle}
                    compact
                  />
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h2 className="font-heading text-base font-bold" style={{ color: PALETTE.espresso }}>
                        {copy.meterTitle}
                      </h2>
                      {forgivenessScore === 100 ? (
                        <span
                          className="rounded-full px-2 py-0.5 font-mono text-[9px] font-extrabold tracking-wider"
                          style={{ backgroundColor: PALETTE.goldSoft, color: '#92400E' }}
                        >
                          {copy.meterReadyTag}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs leading-snug" style={{ color: `${PALETTE.espresso}B3` }}>
                      {copy.meterSubtitle(sealedPleas.length)}
                    </p>
                  </div>
                </div>

                {/* 4 Interactive Reason Plea Cards */}
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: PALETTE.terracotta }}>
                    {copy.pleasHeading}
                  </p>
                  <p className="mt-0.5 text-[11px]" style={{ color: `${PALETTE.espresso}99` }}>
                    {copy.pleasHelper}
                  </p>

                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {PLEA_CLAUSES.map((plea) => {
                      const isSealed = sealedPleas.includes(plea.id);
                      return (
                        <button
                          key={plea.id}
                          type="button"
                          aria-pressed={isSealed}
                          onClick={() => togglePleaCard(plea.id)}
                          className="flex min-h-[56px] w-full items-center justify-between gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left transition-all duration-200 active:scale-[0.98]"
                          style={{
                            borderColor: isSealed ? PALETTE.gold : PALETTE.blushBorder,
                            backgroundColor: isSealed ? '#FFFDF7' : PALETTE.card,
                            boxShadow: isSealed ? `0 8px 18px -12px ${PALETTE.gold}` : undefined,
                          }}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="block font-mono text-[9px] font-bold tracking-[0.16em]" style={{ color: PALETTE.terracotta }}>
                              {plea.code}
                            </span>
                            <span className="block break-words font-heading text-sm font-bold" style={{ color: PALETTE.espresso }}>
                              {plea.title[coreLang]}
                            </span>
                            <span className="mt-0.5 block break-words text-[11px] leading-snug" style={{ color: `${PALETTE.espresso}A6` }}>
                              {plea.detail[coreLang]}
                            </span>
                          </div>
                          <GoldenCheckStamp
                            sealed={isSealed}
                            label={isSealed ? copy.sealedStamp : copy.tapToSeal}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveChapter('vouchers')}
                className="inline-flex min-h-[44px] items-center justify-center self-center rounded-full border px-5 text-xs font-bold transition hover:bg-white active:scale-95"
                style={{
                  borderColor: `${PALETTE.terracotta}55`,
                  backgroundColor: PALETTE.card,
                  color: PALETTE.terracotta,
                }}
              >
                {copy.nextToVouchers} →
              </button>
            </section>
          ) : null}

          {/* CHAPTER 03: Redeemable Peace Treat Vouchers */}
          {activeChapter === 'vouchers' ? (
            <section
              aria-label={copy.tabs.vouchers}
              className="flex flex-1 flex-col justify-between gap-3 animate-fade-in motion-reduce:animate-none"
            >
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: PALETTE.terracotta }}>
                  {copy.vouchersHeading}
                </p>
                <p className="mt-0.5 text-[11px]" style={{ color: `${PALETTE.espresso}99` }}>
                  {copy.vouchersHelper}
                </p>

                <div className="mt-2.5 flex flex-col gap-2.5">
                  {TREAT_VOUCHERS.map((voucher) => (
                    <TreatVoucherCard
                      key={voucher.id}
                      voucher={voucher}
                      label={voucher.label[coreLang] ?? voucher.label.en}
                      detail={voucher.detail[coreLang] ?? voucher.detail.en}
                      selectedStamp={copy.selectedStamp}
                      selected={selectedTreat === voucher.id}
                      onSelect={() => setSelectedTreat(voucher.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Gauge Summary Banner */}
              <div
                className="flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5"
                style={{ borderColor: PALETTE.blushBorder, backgroundColor: PALETTE.card }}
              >
                <div className="min-w-0">
                  <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ color: PALETTE.terracotta }}>
                    {copy.meterTitle}
                  </p>
                  <p className="truncate text-xs font-semibold" style={{ color: PALETTE.espresso }}>
                    {activeTreatLabel} · {forgivenessScore}%
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveChapter('meter')}
                  className="inline-flex min-h-[44px] shrink-0 items-center rounded-full border px-3.5 text-[11px] font-bold transition hover:bg-[#FFF8F3]"
                  style={{ borderColor: PALETTE.blushBorder, color: PALETTE.crimson }}
                >
                  {copy.tabs.meter}
                </button>
              </div>
            </section>
          ) : null}

          {/* Persistent Interactive Decision Bar */}
          <div
            className="overflow-hidden rounded-2xl border p-3 shadow-xs"
            style={{ borderColor: PALETTE.blushBorder, backgroundColor: PALETTE.card }}
          >
            <p
              key={nudgeCount}
              className="mb-2.5 text-center text-[11.5px] font-semibold leading-snug animate-fade-in motion-reduce:animate-none"
              style={{ color: nudgeCount > 0 ? PALETTE.crimson : `${PALETTE.espresso}BF` }}
            >
              {grumpyReaction}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleDodgingGrumpy}
                onMouseEnter={() => {
                  if (nudgeCount < 4) handleDodgingGrumpy();
                }}
                style={{
                  transform: `translate(${currentDodge.x}px, ${currentDodge.y}px)`,
                  borderColor: PALETTE.blushBorder,
                  color: `${PALETTE.espresso}CC`,
                  backgroundColor: PALETTE.surface,
                }}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold transition-transform duration-200 hover:bg-[#FCEEE7]"
              >
                {grumpyLabel}
              </button>

              <button
                type="button"
                onClick={handleRatifyTreaty}
                style={{
                  backgroundColor: PALETTE.crimson,
                  transform: `scale(${ratifyScale})`,
                }}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-[#FFF8F3] shadow-md transition-all duration-200 hover:brightness-105 active:scale-[0.98] sm:text-sm"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 17.5c-.4 0-.8-.15-1.1-.43C4.8 13.3 2.5 11.1 2.5 7.9 2.5 5.4 4.4 3.5 6.9 3.5c1.3 0 2.5.6 3.1 1.6.6-1 1.8-1.6 3.1-1.6 2.5 0 4.4 1.9 4.4 4.4 0 3.2-2.3 5.4-6.4 9.17-.3.28-.7.43-1.1.43Z" />
                </svg>
                <span>{copy.forgiveSignCta}</span>
              </button>
            </div>
          </div>

          <footer className="border-t border-[#EAD7CC] pt-2 text-center text-[11px] font-medium" style={{ color: `${PALETTE.espresso}99` }}>
            {getWebzyFooterLabel(language)}
          </footer>
        </div>
      )}
    </article>
  );
}
