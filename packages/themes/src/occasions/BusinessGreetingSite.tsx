'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  type CoreLanguageCode,
  pickLocalizedText,
  toCoreLanguageCode,
} from '@webzy/core';
import {
  AmbientRainCanvas,
  CurvedTrackSanctuary,
  type CurvedTrackItem,
  WordByWordFadeLine,
} from './shared/OccasionCinematicFX';
import {
  getReplayLabel,
  getWebzyFooterLabel,
  OccasionAdaptiveGallery,
  OccasionArtworkBackdrop,
  type OccasionSiteProps,
} from './shared/OccasionPrimitives';

type InquiryIntentKey = 'bookVisit' | 'viewCatalogue' | 'claimVipOffer' | 'customOrder';

interface PillarItem {
  key: 'craftsmanship' | 'priorityCare' | 'bespokeFinishing';
  title: string;
  caption: string;
}

interface LocalizedTrackTemplate {
  id: string;
  title: string;
  moodLabel: string;
  duration: string;
  note: string;
}

interface LocalizedBoutiqueCopy {
  previewBanner: string;
  gateEyebrow: string;
  forLabel: string;
  fromLabel: string;
  sealTop: string;
  sealBottom: string;
  openPassCta: string;
  gateHint: string;
  verifiedBadge: string;
  brandNoteEyebrow: string;
  signedByLabel: string;
  ticketEyebrow: string;
  ticketHeader: string;
  ticketSublabel: string;
  ticketCodeLabel: string;
  defaultOfferText: string;
  copyCodeCta: string;
  copiedCodeToast: string;
  pillarsEyebrow: string;
  pillarsHeading: string;
  pillars: readonly PillarItem[];
  showcaseEyebrow: string;
  showcaseHeading: string;
  showcaseSubtitle: string;
  galleryCaption: string;
  emptyVaultTitle: string;
  emptyVaultBody: string;
  ambienceHeading: string;
  ambienceTracks: readonly LocalizedTrackTemplate[];
  conciergeEyebrow: string;
  conciergeHeading: string;
  conciergeSubtitle: string;
  intentHeading: string;
  intents: Record<InquiryIntentKey, string>;
  quickNoteLabel: string;
  quickNotePlaceholder: string;
  includedCodeLabel: string;
  inquirySummaryLabel: string;
  whatsappCta: string;
  copyInquiryCta: string;
  copiedInquiryToast: string;
  noPhoneFallback: string;
}

const BUSINESS_COPY: Record<CoreLanguageCode, LocalizedBoutiqueCopy> = {
  en: {
    previewBanner: 'WEBZY FREE PREVIEW',
    gateEyebrow: 'PRIVATE PATRON INVITATION',
    forLabel: 'VIP Pass Prepared For',
    fromLabel: 'Presented by',
    sealTop: 'ATELIER',
    sealBottom: 'VIP SEAL',
    openPassCta: 'Open VIP Pass',
    gateHint: 'Unseal the sapphire brass pass to enter the private atelier',
    verifiedBadge: 'Verified Atelier Boutique',
    brandNoteEyebrow: 'Personal Brand Note',
    signedByLabel: 'With warm regards,',
    ticketEyebrow: 'PRIVATE PATRON VOUCHER',
    ticketHeader: 'THE PRIVILEGE TICKET',
    ticketSublabel: 'VIP PRIVILEGE',
    ticketCodeLabel: 'Privilege Code',
    defaultOfferText: 'Complimentary Priority Hospitality & Festive Edition Privilege',
    copyCodeCta: 'Copy Privilege Code',
    copiedCodeToast: 'Privilege code copied to clipboard',
    pillarsEyebrow: 'HOUSE STANDARDS',
    pillarsHeading: 'Craftsmanship & Brand Pillars',
    pillars: [
      {
        key: 'craftsmanship',
        title: 'Small-Batch Craft',
        caption: 'Curated materials and disciplined finishing in every edition.',
      },
      {
        key: 'priorityCare',
        title: 'Priority Patron Care',
        caption: 'Direct atelier desk access with attentive scheduling.',
      },
      {
        key: 'bespokeFinishing',
        title: 'Bespoke Presentation',
        caption: 'Hand-packed satin ribbon wrapping and custom gifting notes.',
      },
    ],
    showcaseEyebrow: 'CURATED COLLECTION',
    showcaseHeading: 'Atelier Showcase',
    showcaseSubtitle: 'Signature creations and seasonal editions from our boutique floor',
    galleryCaption: 'Atelier',
    emptyVaultTitle: 'Private Atelier Editions',
    emptyVaultBody:
      'Bespoke seasonal pieces and curated gift boxes are available directly through our concierge desk below.',
    ambienceHeading: 'Atelier Ambience',
    ambienceTracks: [
      {
        id: 'atelier-brass',
        title: 'Atelier Brass Chime',
        moodLabel: 'Warm Velvet Lounge',
        duration: '02:40',
        note: 'Soft acoustic bell tones tuned for an unhurried private boutique viewing.',
      },
      {
        id: 'sapphire-salon',
        title: 'Sapphire Salon Evening',
        moodLabel: 'Champagne Acoustic',
        duration: '03:12',
        note: 'Gentle harmonic chords crafted for evening appointments and gift curation.',
      },
      {
        id: 'courtyard-tea',
        title: 'Courtyard Darjeeling Pour',
        moodLabel: 'Calm Hospitality',
        duration: '02:55',
        note: 'Clean melodic warmth inspired by quiet hospitality at the showroom table.',
      },
    ],
    conciergeEyebrow: 'DIRECT DESK',
    conciergeHeading: 'Priority WhatsApp Concierge Desk',
    conciergeSubtitle: 'Choose your request and connect directly with our boutique host',
    intentHeading: 'Select Inquiry Intent',
    intents: {
      bookVisit: 'Book Visit',
      viewCatalogue: 'View Catalogue',
      claimVipOffer: 'Claim VIP Offer',
      customOrder: 'Custom Order',
    },
    quickNoteLabel: 'Quick Optional Message',
    quickNotePlaceholder: 'Preferred date, gift quantity, or custom request...',
    includedCodeLabel: 'Attached Privilege Code',
    inquirySummaryLabel: 'Prepared Concierge Summary',
    whatsappCta: 'Message on WhatsApp',
    copyInquiryCta: 'Copy Inquiry Summary',
    copiedInquiryToast: 'Concierge inquiry summary copied',
    noPhoneFallback:
      'Direct WhatsApp number is not listed. Copy your tailored inquiry summary above to share.',
  },
  hinglish: {
    previewBanner: 'WEBZY FREE PREVIEW',
    gateEyebrow: 'KHAS PATRON AAMANTRAN',
    forLabel: 'VIP Pass Aapke Naam',
    fromLabel: 'Prastutkarta',
    sealTop: 'ATELIER',
    sealBottom: 'VIP SEAL',
    openPassCta: 'VIP Pass Kholein',
    gateHint: 'Private boutique mein pravesh ke liye brass seal ya button tap karein',
    verifiedBadge: 'Verified Atelier Boutique',
    brandNoteEyebrow: 'Personal Brand Note',
    signedByLabel: 'Saadar abhaar ke saath,',
    ticketEyebrow: 'KHAS PATRON VOUCHER',
    ticketHeader: 'THE PRIVILEGE TICKET',
    ticketSublabel: 'VIP PRIVILEGE',
    ticketCodeLabel: 'Privilege Code',
    defaultOfferText: 'Priority Hospitality aur Festive Edition par Khaas Privilege',
    copyCodeCta: 'Privilege Code Copy Karein',
    copiedCodeToast: 'Privilege code copy ho gaya',
    pillarsEyebrow: 'HAMARI PEHCHAAN',
    pillarsHeading: 'Craftsmanship aur Brand Pillars',
    pillars: [
      {
        key: 'craftsmanship',
        title: 'Behtareen Karigari',
        caption: 'Har creation mein chune hue materials aur fine finishing.',
      },
      {
        key: 'priorityCare',
        title: 'Priority Patron Care',
        caption: 'Seedha boutique desk se turant aur samarpit sahayata.',
      },
      {
        key: 'bespokeFinishing',
        title: 'Khaas Presentation',
        caption: 'Satin ribbon packaging aur aapke naam ka bespoke gifting touch.',
      },
    ],
    showcaseEyebrow: 'CHUNINDA SANGRAH',
    showcaseHeading: 'Atelier Showcase',
    showcaseSubtitle: 'Hamare boutique collection ki signature aur seasonal jhalak',
    galleryCaption: 'Atelier',
    emptyVaultTitle: 'Private Atelier Editions',
    emptyVaultBody:
      'Hamare bespoke seasonal editions aur gift hampers ke liye neeche concierge desk se seedha sampark karein.',
    ambienceHeading: 'Atelier Ambience',
    ambienceTracks: [
      {
        id: 'atelier-brass',
        title: 'Atelier Brass Chime',
        moodLabel: 'Warm Velvet Lounge',
        duration: '02:40',
        note: 'Shant aur shahi boutique anubhav ke liye halki acoustic dhun.',
      },
      {
        id: 'sapphire-salon',
        title: 'Sapphire Salon Evening',
        moodLabel: 'Champagne Acoustic',
        duration: '03:12',
        note: 'Shaam ki private appointments aur gifting curation ke liye sukoon bhari dhun.',
      },
      {
        id: 'courtyard-tea',
        title: 'Courtyard Tea Pour',
        moodLabel: 'Calm Hospitality',
        duration: '02:55',
        note: 'Showroom par apnapan aur mehmaan-nawazi ka ehsaas.',
      },
    ],
    conciergeEyebrow: 'SEEDHA SAMPARK',
    conciergeHeading: 'Priority WhatsApp Concierge Desk',
    conciergeSubtitle: 'Apna vishay chunein aur hamare boutique desk se seedhe judein',
    intentHeading: 'Inquiry Intent Chunein',
    intents: {
      bookVisit: 'Book Visit',
      viewCatalogue: 'View Catalogue',
      claimVipOffer: 'Claim VIP Offer',
      customOrder: 'Custom Order',
    },
    quickNoteLabel: 'Chhota Sandesh (Optional)',
    quickNotePlaceholder: 'Date, quantity ya koi khaas request likhein...',
    includedCodeLabel: 'Shamil Privilege Code',
    inquirySummaryLabel: 'Taiyaar Inquiry Summary',
    whatsappCta: 'WhatsApp Par Message Karein',
    copyInquiryCta: 'Inquiry Summary Copy Karein',
    copiedInquiryToast: 'Concierge inquiry summary copy ho gayi',
    noPhoneFallback:
      'Direct WhatsApp number uplabdh nahi hai. Upar se taiyaar inquiry summary copy karke share karein.',
  },
  hi: {
    previewBanner: 'WEBZY निःशुल्क पूर्वावलोकन',
    gateEyebrow: 'विशिष्ट बुटीक आमंत्रण',
    forLabel: 'VIP पास प्राप्तकर्ता',
    fromLabel: 'प्रस्तुतकर्ता',
    sealTop: 'अटेलियर',
    sealBottom: 'VIP मुहर',
    openPassCta: 'VIP पास खोलें',
    gateHint: 'निजी बुटीक में प्रवेश करने के लिए मुहर या बटन पर टैप करें',
    verifiedBadge: 'सत्यापित बुटीक ब्रांड',
    brandNoteEyebrow: 'व्यक्तिगत ब्रांड संदेश',
    signedByLabel: 'सादर आभार सहित,',
    ticketEyebrow: 'विशेष सम्मान वाउचर',
    ticketHeader: 'प्रिविलेज टिकट',
    ticketSublabel: 'VIP सम्मान',
    ticketCodeLabel: 'विशेष कोड',
    defaultOfferText: 'प्राथमिक आतिथ्य एवं विशेष उत्सव संस्करण लाभ',
    copyCodeCta: 'विशेष कोड कॉपी करें',
    copiedCodeToast: 'विशेष कोड कॉपी हो गया',
    pillarsEyebrow: 'हमारे मानक',
    pillarsHeading: 'उत्कृष्ट कारीगरी एवं ब्रांड आधार',
    pillars: [
      {
        key: 'craftsmanship',
        title: 'उत्कृष्ट कारीगरी',
        caption: 'हर रचना में चुनिंदा सामग्री और बारीक सज्जा।',
      },
      {
        key: 'priorityCare',
        title: 'प्राथमिक सेवा',
        caption: 'सीधे बुटीक डेस्क से त्वरित और समर्पित सहायता।',
      },
      {
        key: 'bespokeFinishing',
        title: 'शाही प्रस्तुति',
        caption: 'साटन रिबन पैकेजिंग और सुरुचिपूर्ण उपहार सज्जा।',
      },
    ],
    showcaseEyebrow: 'चुनिंदा संग्रह',
    showcaseHeading: 'अटेलियर झलक',
    showcaseSubtitle: 'हमारे बुटीक की विशिष्ट कृतियाँ और मौसमी संस्करण',
    galleryCaption: 'संग्रह',
    emptyVaultTitle: 'निजी अटेलियर संस्करण',
    emptyVaultBody:
      'विशेष उपहार बॉक्स और कस्टम ऑर्डर के लिए नीचे दिए गए संपर्क डेस्क से सीधे जुड़ें।',
    ambienceHeading: 'बुटीक मधुर परिवेश',
    ambienceTracks: [
      {
        id: 'atelier-brass',
        title: 'अटेलियर ब्रास चाइम',
        moodLabel: 'सुरुचिपूर्ण लाउंज',
        duration: '02:40',
        note: 'सुकून भरे निजी बुटीक अवलोकन के लिए मधुर ध्वनि।',
      },
      {
        id: 'sapphire-salon',
        title: 'सफ़ायर सैलून संध्या',
        moodLabel: 'शैम्पेन एकॉस्टिक',
        duration: '03:12',
        note: 'संध्या अपॉइंटमेंट और विशेष उपहार चयन के लिए सौम्य स्वर।',
      },
      {
        id: 'courtyard-tea',
        title: 'आँगन आतिथ्य धुन',
        moodLabel: 'शांत सत्कार',
        duration: '02:55',
        note: 'शोरूम आतिथ्य की आत्मीय और शांत अनुभूति।',
      },
    ],
    conciergeEyebrow: 'सीधा संपर्क',
    conciergeHeading: 'प्राथमिक WhatsApp संपर्क डेस्क',
    conciergeSubtitle: 'अपना विषय चुनें और सीधे हमारे बुटीक मेज़बान से जुड़ें',
    intentHeading: 'संपर्क का विषय चुनें',
    intents: {
      bookVisit: 'विज़िट बुक करें',
      viewCatalogue: 'कैटलॉग देखें',
      claimVipOffer: 'VIP ऑफ़र प्राप्त करें',
      customOrder: 'कस्टम ऑर्डर',
    },
    quickNoteLabel: 'संक्षिप्त संदेश (वैकल्पिक)',
    quickNotePlaceholder: 'पसंदीदा तिथि, मात्रा या विशेष अनुरोध लिखें...',
    includedCodeLabel: 'संलग्न विशेष कोड',
    inquirySummaryLabel: 'तैयार संपर्क सारांश',
    whatsappCta: 'WhatsApp पर संदेश भेजें',
    copyInquiryCta: 'संदेश सारांश कॉपी करें',
    copiedInquiryToast: 'संपर्क सारांश कॉपी हो गया',
    noPhoneFallback:
      'सीधा WhatsApp नंबर उपलब्ध नहीं है। ऊपर दिया गया संपर्क सारांश कॉपी कर साझा करें।',
  },
};

const INTENT_KEYS: readonly InquiryIntentKey[] = [
  'bookVisit',
  'viewCatalogue',
  'claimVipOffer',
  'customOrder',
];

const PILLAR_KEYS: readonly PillarItem['key'][] = [
  'craftsmanship',
  'priorityCare',
  'bespokeFinishing',
];

function extractMonogram(primaryName: string, secondaryName: string): string {
  const source = primaryName.trim() || secondaryName.trim() || 'AT';
  const words = source
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return 'AT';
}

function derivePrivilegeCode(
  offerText: string,
  senderName: string,
  receiverName: string,
): string {
  const explicitMatch = offerText.match(/\b([A-Z]{3,}[A-Z0-9-]{2,})\b/);
  if (explicitMatch?.[1] && !['OFF', 'PRE', 'VIP'].includes(explicitMatch[1])) {
    return explicitMatch[1].slice(0, 14);
  }
  const cleanSender = senderName.trim();
  const seedSource =
    cleanSender && cleanSender.toLowerCase() !== 'owner' ? cleanSender : receiverName;
  const brandSeed = seedSource
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 6);
  const prefix = brandSeed.length >= 3 ? brandSeed : 'ATELIER';
  const pctMatch = offerText.match(/(\d{1,2})%/);
  return pctMatch?.[1] ? `${prefix}-VIP${pctMatch[1]}` : `${prefix}-VIP`;
}

function sanitizeWhatsappPhone(raw?: string): string | null {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return null;
  if (/^(?:91)?[6-9]\d{9}$/.test(digits)) {
    return digits.length === 10 ? `91${digits}` : digits;
  }
  if (/^[1-9]\d{9,14}$/.test(digits)) {
    return digits;
  }
  return null;
}

function CornerFiligree({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none h-7 w-7 text-[#C89D4C]/80 ${className}`}
    >
      <path d="M2 22V4a2 2 0 0 1 2-2h18" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 16V7a1 1 0 0 1 1-1h9" stroke="currentColor" strokeWidth="1" strokeOpacity="0.65" />
      <circle cx="4" cy="4" r="1.6" fill="currentColor" />
    </svg>
  );
}

function PillarVectorIcon({ pillarKey }: { pillarKey: PillarItem['key'] }) {
  if (pillarKey === 'craftsmanship') {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 6-7 12L5 9l7-6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 9h14" />
      </svg>
    );
  }
  if (pillarKey === 'priorityCare') {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12l1.8 1.8 3.5-3.8" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v12M4 12h16M12 8c-1.8 0-3.5-1.2-3.5-2.8C8.5 3.8 10 3 12 5.2 14 3 15.5 3.8 15.5 5.2 15.5 6.8 13.8 8 12 8z"
      />
    </svg>
  );
}

/**
 * Continuous-flow Sapphire Velvet & Brushed Brass Boutique Storefront and VIP Privilege Pass.
 */
export function BusinessGreetingSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const [opened, setOpened] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<InquiryIntentKey>('bookVisit');
  const [customNote, setCustomNote] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInquiry, setCopiedInquiry] = useState(false);

  const conciergeNoteId = useId();
  const codeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inquiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const coreLang = toCoreLanguageCode(language);
  const copy = BUSINESS_COPY[coreLang] ?? BUSINESS_COPY.en;

  const senderDisplay = data.senderName.trim();
  const receiverDisplay = data.receiverName.trim() || 'VIP Patron';
  const senderMonogram = extractMonogram(senderDisplay, receiverDisplay);

  const offerText = data.offerTag ? pickLocalizedText(data.offerTag, language).trim() : '';
  const displayOfferText = offerText || copy.defaultOfferText;
  const privilegeCode = derivePrivilegeCode(offerText, senderDisplay, receiverDisplay);

  const openingHeadline = pickLocalizedText(data.headline, language).trim() || receiverDisplay;
  const brandMessage = pickLocalizedText(data.message, language).trim();
  const signatureName = senderDisplay || receiverDisplay;

  const pillarCards = useMemo(() => {
    const customHighlights = (data.highlights ?? [])
      .map((item, idx) => ({
        key: PILLAR_KEYS[idx % PILLAR_KEYS.length],
        title: pickLocalizedText(item.title, language).trim(),
        caption: pickLocalizedText(item.detail, language).trim(),
      }))
      .filter((item) => item.title.length > 0 || item.caption.length > 0);

    return customHighlights.length > 0 ? customHighlights.slice(0, 3) : copy.pillars;
  }, [data.highlights, language, copy.pillars]);

  const atelierTracks: readonly CurvedTrackItem[] = useMemo(() => {
    const primaryLabel = manifest.music[0]?.label?.trim();
    return copy.ambienceTracks.map((track, idx) => ({
      id: track.id,
      title: idx === 0 && primaryLabel ? primaryLabel : track.title,
      moodLabel: track.moodLabel,
      duration: track.duration,
      note: track.note,
    }));
  }, [copy.ambienceTracks, manifest.music]);

  const selectedIntentLabel = copy.intents[selectedIntent];
  const validWa = sanitizeWhatsappPhone(data.whatsappPhone);
  const composedInquiry = [
    `Hello ${receiverDisplay},`,
    `Inquiry: ${selectedIntentLabel}.`,
    `Privilege Code: ${privilegeCode}.`,
    customNote.trim() ? `Note: ${customNote.trim()}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const waHref = validWa
    ? `https://wa.me/${validWa}?text=${encodeURIComponent(composedInquiry)}`
    : null;

  useEffect(() => {
    return () => {
      if (codeTimerRef.current) clearTimeout(codeTimerRef.current);
      if (inquiryTimerRef.current) clearTimeout(inquiryTimerRef.current);
    };
  }, []);

  function handleReveal() {
    setOpened(true);
    onOpened?.();
  }

  function handleReplay() {
    setOpened(false);
  }

  async function handleCopyPrivilegeCode() {
    try {
      await navigator.clipboard?.writeText(privilegeCode);
    } catch {
      // Clipboard may be restricted in embedded preview contexts; status feedback still renders.
    }
    setCopiedCode(true);
    if (codeTimerRef.current) clearTimeout(codeTimerRef.current);
    codeTimerRef.current = setTimeout(() => setCopiedCode(false), 2200);
  }

  async function handleCopyConciergeMessage() {
    try {
      await navigator.clipboard?.writeText(composedInquiry);
    } catch {
      // Clipboard may be restricted in embedded preview contexts; status feedback still renders.
    }
    setCopiedInquiry(true);
    if (inquiryTimerRef.current) clearTimeout(inquiryTimerRef.current);
    inquiryTimerRef.current = setTimeout(() => setCopiedInquiry(false), 2200);
  }

  if (!opened) {
    return (
      <div className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#0C1B33] text-[#FAF6EE]">
        <OccasionArtworkBackdrop
          src="/templates/occasions/business-greeting/cover.jpg"
          fallbackGradient="linear-gradient(155deg, #071226 0%, #0C1B33 54%, #142B4F 100%)"
          className="object-cover object-center opacity-40"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#071226]/90 via-[#0C1B33]/55 to-[#071226]/95"
        />

        <AmbientRainCanvas
          density="light"
          fireflies
          tint="rgba(212, 175, 55, 0.52)"
        />

        {/* Double brushed brass hairline frame */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 rounded-[20px] border border-[#C89D4C]/55"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-4 rounded-[16px] border border-[#C89D4C]/30"
        />
        <CornerFiligree className="absolute left-5 top-5" />
        <CornerFiligree className="absolute right-5 top-5 rotate-90" />
        <CornerFiligree className="absolute bottom-5 left-5 -rotate-90" />
        <CornerFiligree className="absolute bottom-5 right-5 rotate-180" />

        {watermarked ? (
          <div
            aria-hidden="true"
            className="pointer-events-none relative z-20 flex justify-center border-b border-[#C89D4C]/25 bg-[#0C1B33]/90 py-1 text-[10px] font-bold tracking-[0.22em] text-[#C89D4C]"
          >
            {copy.previewBanner}
          </div>
        ) : null}

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
          {/* Crisp Monogram Crest from senderName */}
          <div
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-full border border-[#C89D4C]/85 bg-[#0C1B33]/95 shadow-[0_10px_28px_rgba(0,0,0,0.5)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C89D4C]/45 bg-gradient-to-br from-[#C89D4C]/25 to-transparent">
              <span className="font-heading text-sm font-bold tracking-[0.16em] text-[#FAF6EE]">
                {senderMonogram}
              </span>
            </div>
          </div>

          <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#C89D4C]">
            {copy.gateEyebrow}
          </p>

          <p className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#FAF6EE]/70">
            {copy.forLabel}
          </p>
          <h2 className="mt-1 max-w-full break-words font-heading text-2xl font-bold leading-snug text-[#FAF6EE] sm:text-3xl">
            {receiverDisplay}
          </h2>

          {senderDisplay ? (
            <p className="mt-1.5 max-w-full break-words text-xs font-medium text-[#FAF6EE]/80">
              {copy.fromLabel}{' '}
              <span className="font-semibold text-[#C89D4C]">{senderDisplay}</span>
            </p>
          ) : null}

          {/* Sapphire Satin Ribbon Band + Interactive Brushed Brass Seal */}
          <div className="relative my-6 flex w-full items-center justify-center">
            <div
              aria-hidden="true"
              className="h-9 w-full border-y border-[#C89D4C]/70 shadow-[0_10px_26px_rgba(0,0,0,0.6)]"
              style={{
                background:
                  'linear-gradient(90deg, rgba(12,27,51,0.96) 0%, rgba(28,58,104,0.98) 50%, rgba(12,27,51,0.96) 100%)',
              }}
            >
              <div className="h-full w-full border-y border-[#FAF6EE]/15" />
            </div>

            <button
              type="button"
              onClick={handleReveal}
              aria-label={copy.openPassCta}
              className="absolute flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-[#FAF6EE]/85 p-1.5 text-center shadow-[0_14px_34px_rgba(0,0,0,0.65)] transition hover:scale-105 active:scale-95 motion-reduce:transition-none"
              style={{
                background:
                  'linear-gradient(135deg, #E5C583 0%, #C89D4C 52%, #9A7228 100%)',
              }}
            >
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-[#0C1B33]/35 px-1">
                <span className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-[#0C1B33]">
                  {copy.sealTop}
                </span>
                <span className="my-1 h-px w-8 bg-[#0C1B33]/35" />
                <span className="text-[7.5px] font-bold uppercase tracking-[0.14em] text-[#0C1B33]/90">
                  {copy.sealBottom}
                </span>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={handleReveal}
            className="mt-3 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#FAF6EE]/45 bg-gradient-to-r from-[#C89D4C] via-[#DBB66D] to-[#B68936] px-7 py-3 text-sm font-bold text-[#0C1B33] shadow-[0_10px_28px_rgba(0,0,0,0.45)] transition hover:brightness-105 active:scale-[0.98] motion-reduce:transition-none"
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.1}
              aria-hidden="true"
            >
              <rect x="3" y="6" width="18" height="12" rx="2.5" />
              <path strokeLinecap="round" d="M3 10h18M8 14h4" />
            </svg>
            <span>{copy.openPassCta}</span>
          </button>

          <p className="mt-3 max-w-xs text-[11px] font-medium leading-relaxed text-[#FAF6EE]/70">
            {copy.gateHint}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-full w-full flex-col justify-between overflow-x-hidden rounded-[28px] bg-[#FAF6EE] text-[#1F2937] animate-fade-in motion-reduce:animate-none">
      {watermarked ? (
        <div
          aria-hidden="true"
          className="pointer-events-none flex justify-center border-b border-[#C89D4C]/30 bg-[#0C1B33] py-1 text-[10px] font-bold tracking-[0.2em] text-[#C89D4C]"
        >
          {copy.previewBanner}
        </div>
      ) : null}

      {/* Top Atelier Header */}
      <header className="border-b border-[#C89D4C]/35 bg-[#0C1B33] px-4 py-3 text-[#FAF6EE]">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-[#C89D4C]/45 bg-[#FAF6EE]/10 px-3 py-1.5">
            <span
              aria-hidden="true"
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C89D4C] text-[9px] font-extrabold text-[#0C1B33]"
            >
              {senderMonogram}
            </span>
            <span className="truncate text-[11px] font-bold tracking-wide text-[#FAF6EE]">
              {copy.verifiedBadge}
            </span>
          </div>

          <button
            type="button"
            onClick={handleReplay}
            className="inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-[#C89D4C]/45 bg-[#FAF6EE]/10 px-4 text-xs font-semibold text-[#FAF6EE] transition hover:bg-[#FAF6EE]/20 active:scale-95 motion-reduce:transition-none"
          >
            {getReplayLabel(language)}
          </button>
        </div>
      </header>

      {/* Act 2 — Continuous Atelier Editorial */}
      <main className="flex flex-1 flex-col gap-5 px-4 pb-6 pt-4">
        {/* 1. Personal Brand Note */}
        <section
          aria-labelledby="atelier-brand-note-heading"
          className="relative overflow-hidden rounded-2xl border border-[#C89D4C]/45 bg-white p-5 text-center shadow-[0_14px_34px_-18px_rgba(12,27,51,0.22)]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none mx-auto mb-3 block h-0.5 w-14 rounded-full bg-[#C89D4C]"
          />
          <p
            id="atelier-brand-note-heading"
            className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A7228]"
          >
            {copy.brandNoteEyebrow}
          </p>

          <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#0C1B33]/12 bg-[#FAF6EE] px-3 py-1 text-[11px] font-bold text-[#0C1B33]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C89D4C]" aria-hidden="true" />
            <span className="truncate">{receiverDisplay}</span>
          </div>

          <WordByWordFadeLine
            text={openingHeadline}
            active={opened}
            delayStepMs={55}
            className="mt-3.5 break-words font-heading text-xl font-bold leading-snug text-[#0C1B33]"
          />

          {brandMessage ? (
            <p className="mt-2.5 break-words text-sm leading-relaxed text-[#1F2937]/85">
              {brandMessage}
            </p>
          ) : null}

          <div className="mt-4 border-t border-[#C89D4C]/25 pt-3">
            <p className="text-[11px] font-medium text-[#1F2937]/65">{copy.signedByLabel}</p>
            <p className="mt-0.5 break-words font-heading text-sm font-bold tracking-wide text-[#0C1B33]">
              {signatureName}
            </p>
          </div>
        </section>

        {/* 2. The Privilege Ticket (Notched Metallic Sapphire-Gold Voucher) */}
        <section
          aria-label={copy.ticketHeader}
          className="relative flex items-stretch overflow-hidden rounded-2xl border border-[#C89D4C] text-[#FAF6EE] shadow-[0_18px_38px_-16px_rgba(12,27,51,0.55)]"
          style={{
            background:
              'linear-gradient(135deg, #0A162B 0%, #102443 58%, #1C3559 100%)',
          }}
        >
          {/* Brushed Gold Left Stub */}
          <div
            className="relative flex w-12 shrink-0 flex-col items-center justify-center px-1 py-3 text-center text-[#0C1B33]"
            style={{
              background:
                'linear-gradient(180deg, #E5C583 0%, #C89D4C 55%, #A67B2E 100%)',
            }}
          >
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.18em] [writing-mode:vertical-rl] rotate-180">
              {copy.ticketSublabel}
            </span>
          </div>

          {/* Notched Perforation Cutouts along the stub seam */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-2.5 left-[38px] z-10 h-5 w-5 rounded-full border border-[#C89D4C] bg-[#FAF6EE]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-2.5 left-[38px] z-10 h-5 w-5 rounded-full border border-[#C89D4C] bg-[#FAF6EE]"
          />
          {/* Right-edge ticket notch */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-2.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 rounded-full border border-[#C89D4C] bg-[#FAF6EE]"
          />

          {/* Metallic Sapphire-Gold Voucher Body */}
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 border-l-2 border-dashed border-[#C89D4C]/65 p-4 pr-5">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#C89D4C]">
                {copy.ticketEyebrow}
              </p>
              <p className="mt-0.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#FAF6EE]/80">
                {copy.ticketHeader}
              </p>
              <p className="mt-2 break-words text-sm font-semibold leading-snug text-[#FAF6EE]">
                {displayOfferText}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#C89D4C]/55 bg-[#071122]/85 px-3 py-2.5">
              <div className="min-w-0">
                <span className="block font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#C89D4C]">
                  {copy.ticketCodeLabel}
                </span>
                <span className="block truncate font-mono text-sm font-extrabold tracking-[0.14em] text-[#FAF6EE]">
                  {privilegeCode}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyPrivilegeCode}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#C89D4C] to-[#DBB66D] px-3.5 text-xs font-bold text-[#0C1B33] shadow-xs transition hover:brightness-105 active:scale-95 motion-reduce:transition-none"
              >
                {copiedCode ? (
                  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 111.414-1.42l2.543 2.543 6.543-6.543a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-3.5 w-3.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    aria-hidden="true"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                )}
                <span>{copy.copyCodeCta}</span>
              </button>
            </div>

            <div aria-live="polite" className="min-h-[1px]">
              {copiedCode ? (
                <p
                  role="status"
                  className="rounded-lg border border-[#C89D4C]/45 bg-[#C89D4C]/15 px-3 py-1.5 text-center text-[11px] font-semibold text-[#F6DFB0]"
                >
                  {copy.copiedCodeToast}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {/* 3. Craftsmanship & Brand Pillars */}
        <section
          aria-labelledby="atelier-pillars-heading"
          className="rounded-2xl border border-[#C89D4C]/40 bg-white p-4 shadow-[0_12px_28px_-16px_rgba(12,27,51,0.16)]"
        >
          <div className="text-center">
            <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#9A7228]">
              {copy.pillarsEyebrow}
            </p>
            <h3
              id="atelier-pillars-heading"
              className="mt-1 font-heading text-base font-bold text-[#0C1B33]"
            >
              {copy.pillarsHeading}
            </h3>
          </div>

          <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {pillarCards.map((pillar, idx) => (
              <div
                key={`${pillar.key}-${idx}`}
                className="flex min-w-0 flex-col items-start rounded-xl border border-[#C89D4C]/30 bg-[#FAF6EE] p-3 text-left sm:items-center sm:text-center"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C89D4C]/60 bg-[#0C1B33] text-[#C89D4C]">
                  <PillarVectorIcon pillarKey={pillar.key} />
                </span>
                <h4 className="mt-2.5 w-full break-words text-xs font-bold leading-snug text-[#0C1B33]">
                  {pillar.title}
                </h4>
                <p className="mt-1 w-full break-words text-[11px] leading-relaxed text-[#1F2937]/80">
                  {pillar.caption}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Atelier Showcase */}
        <section
          aria-labelledby="atelier-showcase-heading"
          className="rounded-2xl border border-[#C89D4C]/45 bg-white p-4 shadow-[0_12px_30px_-16px_rgba(12,27,51,0.18)]"
        >
          <div className="text-center">
            <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#9A7228]">
              {copy.showcaseEyebrow}
            </p>
            <h3
              id="atelier-showcase-heading"
              className="mt-1 font-heading text-base font-bold text-[#0C1B33]"
            >
              {copy.showcaseHeading}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#1F2937]/75">
              {copy.showcaseSubtitle}
            </p>
          </div>

          <div className="mt-2">
            <OccasionAdaptiveGallery
              photos={data.photos}
              accentColor="#C89D4C"
              captionPrefix={copy.galleryCaption}
              emptyFallback={
                <div className="mt-3 rounded-xl border border-[#C89D4C]/35 bg-[#0C1B33] px-4 py-4 text-center text-[#FAF6EE]">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#C89D4C]">
                    {copy.emptyVaultTitle}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#FAF6EE]/80">
                    {copy.emptyVaultBody}
                  </p>
                </div>
              }
            />
          </div>
        </section>

        {/* 5. Atelier Ambience */}
        <CurvedTrackSanctuary
          tracks={atelierTracks}
          mood="uplifting"
          accentColor="#C89D4C"
          dark
          heading={copy.ambienceHeading}
        />

        {/* 6. Priority WhatsApp Concierge Desk */}
        <section
          aria-labelledby="atelier-concierge-heading"
          className="space-y-3.5 rounded-2xl border border-[#C89D4C]/50 bg-white p-4 shadow-[0_14px_32px_-16px_rgba(12,27,51,0.22)]"
        >
          <div className="text-center">
            <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#9A7228]">
              {copy.conciergeEyebrow}
            </p>
            <h3
              id="atelier-concierge-heading"
              className="mt-1 font-heading text-base font-bold text-[#0C1B33]"
            >
              {copy.conciergeHeading}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#1F2937]/75">
              {copy.conciergeSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#C89D4C]/40 bg-[#FAF6EE] px-3 py-2">
            <span className="text-[11px] font-semibold text-[#1F2937]/80">
              {copy.includedCodeLabel}
            </span>
            <span className="rounded-md bg-[#0C1B33] px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider text-[#C89D4C]">
              {privilegeCode}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#0C1B33]/85">
              {copy.intentHeading}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {INTENT_KEYS.map((intentKey) => {
                const isActive = selectedIntent === intentKey;
                return (
                  <button
                    key={intentKey}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setSelectedIntent(intentKey)}
                    className={`min-h-[44px] rounded-xl px-2.5 py-2 text-xs font-bold leading-tight transition active:scale-95 motion-reduce:transition-none ${
                      isActive
                        ? 'border border-[#0C1B33] bg-[#0C1B33] text-[#FAF6EE] shadow-xs'
                        : 'border border-[#C89D4C]/40 bg-[#FAF6EE] text-[#1F2937] hover:border-[#0C1B33]/40'
                    }`}
                  >
                    {copy.intents[intentKey]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={conciergeNoteId}
              className="block text-[11px] font-bold uppercase tracking-wider text-[#0C1B33]/85"
            >
              {copy.quickNoteLabel}
            </label>
            <input
              id={conciergeNoteId}
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              maxLength={140}
              placeholder={copy.quickNotePlaceholder}
              className="min-h-[44px] w-full rounded-xl border border-[#C89D4C]/45 bg-[#FAF6EE] px-3 py-2 text-xs text-[#1F2937] placeholder:text-[#1F2937]/45 focus:border-[#0C1B33] focus:outline-none"
            />
          </div>

          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#0C1B33] px-4 py-3 text-sm font-bold text-[#FAF6EE] shadow-md transition hover:brightness-110 active:scale-[0.98] motion-reduce:transition-none"
            >
              <svg className="h-4 w-4 shrink-0 text-[#C89D4C]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.79 14.07c-.24.68-1.41 1.3-1.95 1.38-.5.07-1.13.1-1.82-.12-.42-.13-.96-.31-1.65-.61-2.91-1.26-4.81-4.19-4.96-4.38-.14-.19-1.18-1.57-1.18-2.99 0-1.42.74-2.12 1.01-2.41.26-.29.58-.36.77-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.3-.12.59.17.29.75 1.24 1.61 2 1.11.99 2.04 1.29 2.33 1.44.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.65-.14.26.1 1.68.79 1.97.94.29.14.48.22.55.34.07.12.07.7-.17 1.38z" />
              </svg>
              <span className="break-words text-center">
                {copy.whatsappCta} · {selectedIntentLabel}
              </span>
            </a>
          ) : (
            <div className="space-y-2.5">
              <div className="rounded-xl border border-[#C89D4C]/40 bg-[#FAF6EE] p-3">
                <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#9A7228]">
                  {copy.inquirySummaryLabel}
                </p>
                <p className="mt-1 break-words text-xs leading-relaxed text-[#0C1B33]">
                  {composedInquiry}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyConciergeMessage}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#0C1B33] px-4 py-3 text-sm font-bold text-[#FAF6EE] shadow-md transition hover:brightness-110 active:scale-[0.98] motion-reduce:transition-none"
              >
                <svg
                  className="h-4 w-4 shrink-0 text-[#C89D4C]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                <span>{copy.copyInquiryCta}</span>
              </button>

              <div aria-live="polite" className="min-h-[1px]">
                {copiedInquiry ? (
                  <p
                    role="status"
                    className="rounded-lg bg-[#0C1B33] px-3 py-1.5 text-center text-[11px] font-semibold text-[#C89D4C]"
                  >
                    {copy.copiedInquiryToast}
                  </p>
                ) : null}
              </div>

              <p className="text-center text-[11px] leading-relaxed text-[#1F2937]/70">
                {copy.noPhoneFallback}
              </p>
            </div>
          )}
        </section>

        {/* Footer with Replay & Webzy Attribution */}
        <footer className="flex flex-col items-center gap-2 border-t border-[#C89D4C]/30 pt-3 text-center">
          <button
            type="button"
            onClick={handleReplay}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#0C1B33]/20 bg-white px-5 text-xs font-semibold text-[#0C1B33] shadow-2xs transition hover:bg-[#FAF6EE] active:scale-95 motion-reduce:transition-none"
          >
            {getReplayLabel(language)}
          </button>
          <p className="text-[11px] font-medium text-[#1F2937]/65">
            {getWebzyFooterLabel(language)}
          </p>
        </footer>
      </main>
    </div>
  );
}
