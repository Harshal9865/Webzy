'use client';

import React, { useEffect, useRef, useState } from 'react';
import { type CoreLanguageCode, pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  getReplayLabel,
  getWebzyFooterLabel,
  OccasionArtworkBackdrop,
  OccasionCassettePlayer,
  OccasionChapterNav,
  OccasionFilmstripGallery,
  OccasionPhotoGallery,
  type OccasionSiteProps,
} from './shared/OccasionPrimitives';

type BoutiqueChapterId = 'welcome' | 'showcase' | 'concierge';
type InquiryIntentKey = 'appointment' | 'catalogue' | 'vipOffer' | 'customGift';

interface PillarItem {
  key: 'craftsmanship' | 'priorityCare' | 'bespokeFinishing';
  title: string;
  caption: string;
}

interface ArchShowcaseSlot {
  title: string;
  subtitle: string;
}

interface LocalizedBoutiqueCopy {
  gateEyebrow: string;
  fromLabel: string;
  forLabel: string;
  sealTop: string;
  sealBottom: string;
  untieCta: string;
  gateHint: string;
  verifiedBadge: string;
  tabs: Record<BoutiqueChapterId, string>;
  brandNoteEyebrow: string;
  ticketHeader: string;
  ticketSublabel: string;
  ticketCodeLabel: string;
  defaultOfferText: string;
  copyCode: string;
  copiedToast: string;
  promiseHeading: string;
  pillars: readonly PillarItem[];
  nextToShowcase: string;
  showcaseHeading: string;
  showcaseSubtitle: string;
  archSlots: readonly ArchShowcaseSlot[];
  galleryCaption: string;
  filmstripCaption: string;
  filmFrameLabels: string[];
  ambienceHeading: string;
  cassetteTap: string;
  cassettePlaying: string;
  nextToConcierge: string;
  conciergeHeading: string;
  conciergeSubtitle: string;
  intentHeading: string;
  intents: Record<InquiryIntentKey, string>;
  quickNoteLabel: string;
  quickNotePlaceholder: string;
  includedCodeLabel: string;
  whatsappCta: string;
  copyInquiryCta: string;
  copiedInquiryToast: string;
  noPhoneFallback: string;
}

const BUSINESS_COPY: Record<CoreLanguageCode, LocalizedBoutiqueCopy> = {
  en: {
    gateEyebrow: 'ATELIER PRIVILEGE INVITATION',
    fromLabel: 'Hosted by',
    forLabel: 'VIP Guest & Patron',
    sealTop: 'ATELIER',
    sealBottom: 'VIP SEAL',
    untieCta: 'Untie Ribbon & Enter',
    gateHint: 'Tap the ribbon or button to enter the private boutique',
    verifiedBadge: 'Verified Atelier Boutique',
    tabs: {
      welcome: 'Welcome & Ticket',
      showcase: 'Showcase',
      concierge: 'Concierge Desk',
    },
    brandNoteEyebrow: 'Executive Brand Note',
    ticketHeader: 'THE MAGICAL PRIVILEGE TICKET',
    ticketSublabel: 'PRIVATE PATRON VOUCHER',
    ticketCodeLabel: 'Privilege Code',
    defaultOfferText: 'Complimentary Priority Hospitality & Festive Edition Privilege',
    copyCode: 'Copy Code',
    copiedToast: 'Privilege code copied to clipboard',
    promiseHeading: 'Our Promise',
    pillars: [
      {
        key: 'craftsmanship',
        title: 'Craftsmanship',
        caption: 'Curated small-batch quality in every piece',
      },
      {
        key: 'priorityCare',
        title: 'Priority Care',
        caption: 'Direct owner desk and swift assistance',
      },
      {
        key: 'bespokeFinishing',
        title: 'Bespoke Finishing',
        caption: 'Hand-packed ribbons and signature presentation',
      },
    ],
    nextToShowcase: 'Explore Showcase',
    showcaseHeading: 'Curated Boutique Showcase',
    showcaseSubtitle: 'Signature selections presented in our seasonal gallery',
    archSlots: [
      { title: 'Signature Vault', subtitle: 'Handpicked house classics' },
      { title: 'Festive Editions', subtitle: 'Limited seasonal releases' },
      { title: 'Bespoke Hampers', subtitle: 'Ribbon-tied luxury gifting' },
    ],
    galleryCaption: 'Atelier',
    filmstripCaption: 'BOUTIQUE ARCHIVE REEL',
    filmFrameLabels: ['Edition 01', 'Edition 02', 'Edition 03'],
    ambienceHeading: 'Atelier Ambience Chime',
    cassetteTap: 'Play Atelier Chime',
    cassettePlaying: 'Playing Atelier Chime...',
    nextToConcierge: 'Visit Concierge Desk',
    conciergeHeading: 'Priority Concierge Desk',
    conciergeSubtitle: 'Select your request and connect directly with our desk',
    intentHeading: 'Select Inquiry Intent',
    intents: {
      appointment: 'Book Appointment',
      catalogue: 'Request Catalogue',
      vipOffer: 'Claim VIP Offer',
      customGift: 'Custom Gift Order',
    },
    quickNoteLabel: 'Optional Quick Note',
    quickNotePlaceholder: 'Preferred date, quantity, or bespoke request...',
    includedCodeLabel: 'Attached Privilege Code',
    whatsappCta: 'Message on WhatsApp',
    copyInquiryCta: 'Copy Concierge Message',
    copiedInquiryToast: 'Concierge inquiry message copied',
    noPhoneFallback: 'Direct WhatsApp desk is not listed; copy your tailored inquiry above to share.',
  },
  hinglish: {
    gateEyebrow: 'ATELIER PRIVILEGE AAMANTRAN',
    fromLabel: 'Prastutkarta',
    forLabel: 'VIP Aamantrit',
    sealTop: 'ATELIER',
    sealBottom: 'VIP SEAL',
    untieCta: 'Ribbon Kholkar Pravesh Karein',
    gateHint: 'Boutique kholne ke liye ribbon ya button par tap karein',
    verifiedBadge: 'Verified Atelier Boutique',
    tabs: {
      welcome: 'Welcome & Ticket',
      showcase: 'Showcase',
      concierge: 'Concierge Desk',
    },
    brandNoteEyebrow: 'Brand Sandesh',
    ticketHeader: 'THE MAGICAL PRIVILEGE TICKET',
    ticketSublabel: 'KHAS PATRON VOUCHER',
    ticketCodeLabel: 'Privilege Code',
    defaultOfferText: 'Priority Service aur Khaas Festive Privilege',
    copyCode: 'Copy Code',
    copiedToast: 'Privilege code copy ho gaya',
    promiseHeading: 'Our Promise',
    pillars: [
      {
        key: 'craftsmanship',
        title: 'Craftsmanship',
        caption: 'Har creation mein behtareen karigari',
      },
      {
        key: 'priorityCare',
        title: 'Priority Care',
        caption: 'Seedha owner desk se turant sahayata',
      },
      {
        key: 'bespokeFinishing',
        title: 'Bespoke Finishing',
        caption: 'Satin ribbon aur khaas gift presentation',
      },
    ],
    nextToShowcase: 'Showcase Dekhein',
    showcaseHeading: 'Boutique Showcase',
    showcaseSubtitle: 'Hamare khaas collection ki ek jhalak',
    archSlots: [
      { title: 'Signature Vault', subtitle: 'Sabse pasandeeda editions' },
      { title: 'Festive Editions', subtitle: 'Tyohar special collection' },
      { title: 'Bespoke Hampers', subtitle: 'Shahi gift boxes' },
    ],
    galleryCaption: 'Showcase',
    filmstripCaption: 'BOUTIQUE ARCHIVE REEL',
    filmFrameLabels: ['Edition 01', 'Edition 02', 'Edition 03'],
    ambienceHeading: 'Atelier Ambience Chime',
    cassetteTap: 'Boutique Chime Bajayein',
    cassettePlaying: 'Boutique Chime Chal Raha Hai...',
    nextToConcierge: 'Concierge Desk Par Jaayein',
    conciergeHeading: 'Priority Concierge Desk',
    conciergeSubtitle: 'Apna vishay chunein aur seedhe baat karein',
    intentHeading: 'Inquiry Intent Chunein',
    intents: {
      appointment: 'Book Appointment',
      catalogue: 'Request Catalogue',
      vipOffer: 'Claim VIP Offer',
      customGift: 'Custom Gift Order',
    },
    quickNoteLabel: 'Chhota Sandesh (Optional)',
    quickNotePlaceholder: 'Date, quantity ya koi khaas request likhein...',
    includedCodeLabel: 'Shamil Privilege Code',
    whatsappCta: 'WhatsApp Par Message Karein',
    copyInquiryCta: 'Concierge Message Copy Karein',
    copiedInquiryToast: 'Inquiry message copy ho gaya',
    noPhoneFallback: 'WhatsApp number uplabdh nahi hai; upar se inquiry message copy karke share karein.',
  },
  hi: {
    gateEyebrow: 'विशिष्ट बुटीक आमंत्रण',
    fromLabel: 'प्रस्तुतकर्ता',
    forLabel: 'विशेष अतिथि',
    sealTop: 'अटेलियर',
    sealBottom: 'VIP मुहर',
    untieCta: 'रिबन खोलकर प्रवेश करें',
    gateHint: 'प्रवेश करने के लिए रिबन या बटन पर टैप करें',
    verifiedBadge: 'सत्यापित बुटीक ब्रांड',
    tabs: {
      welcome: 'स्वागत और टिकट',
      showcase: 'झलक',
      concierge: 'संपर्क डेस्क',
    },
    brandNoteEyebrow: 'ब्रांड संदेश',
    ticketHeader: 'THE MAGICAL PRIVILEGE TICKET',
    ticketSublabel: 'विशेष सम्मान वाउचर',
    ticketCodeLabel: 'विशेष कोड',
    defaultOfferText: 'प्राथमिक सेवा एवं विशेष उत्सव सम्मान लाभ',
    copyCode: 'कोड कॉपी करें',
    copiedToast: 'विशेष कोड कॉपी हो गया',
    promiseHeading: 'हमारा वादा',
    pillars: [
      {
        key: 'craftsmanship',
        title: 'उत्कृष्ट कारीगरी',
        caption: 'हर उत्पाद में बारीक और शुद्ध गुणवत्ता',
      },
      {
        key: 'priorityCare',
        title: 'प्राथमिक सेवा',
        caption: 'सीधे स्टोर डेस्क से त्वरित सहायता',
      },
      {
        key: 'bespokeFinishing',
        title: 'शाही पैकेजिंग',
        caption: 'रिबन और सुरुचिपूर्ण उपहार प्रस्तुति',
      },
    ],
    nextToShowcase: 'झलक देखें',
    showcaseHeading: 'विशेष बुटीक संग्रह',
    showcaseSubtitle: 'हमारे चुनिंदा उत्पादों की एक सुरुचिपूर्ण झलक',
    archSlots: [
      { title: 'सिग्नेचर संग्रह', subtitle: 'सर्वश्रेष्ठ और लोकप्रिय विकल्प' },
      { title: 'उत्सव संस्करण', subtitle: 'सीमित विशेष उपहार' },
      { title: 'कस्टम हैंपर्स', subtitle: 'शाही रिबन बॉक्स' },
    ],
    galleryCaption: 'संग्रह',
    filmstripCaption: 'बुटीक संग्रह रील',
    filmFrameLabels: ['संस्करण 01', 'संस्करण 02', 'संस्करण 03'],
    ambienceHeading: 'बुटीक मधुर धुन',
    cassetteTap: 'मधुर धुन चलाएँ',
    cassettePlaying: 'मधुर धुन बज रही है...',
    nextToConcierge: 'संपर्क डेस्क पर जाएँ',
    conciergeHeading: 'प्राथमिक संपर्क डेस्क',
    conciergeSubtitle: 'अपना विषय चुनें और सीधे हमारे डेस्क से जुड़ें',
    intentHeading: 'संपर्क का विषय चुनें',
    intents: {
      appointment: 'अपॉइंटमेंट बुक करें',
      catalogue: 'कैटलॉग मँगवाएँ',
      vipOffer: 'VIP ऑफ़र प्राप्त करें',
      customGift: 'कस्टम गिफ्ट ऑर्डर',
    },
    quickNoteLabel: 'अतिरिक्त संदेश (वैकल्पिक)',
    quickNotePlaceholder: 'तिथि, मात्रा या विशेष अनुरोध लिखें...',
    includedCodeLabel: 'संलग्न विशेष कोड',
    whatsappCta: 'WhatsApp पर संदेश भेजें',
    copyInquiryCta: 'संदेश कॉपी करें',
    copiedInquiryToast: 'संपर्क संदेश कॉपी हो गया',
    noPhoneFallback: 'WhatsApp नंबर उपलब्ध नहीं है; ऊपर से संदेश कॉपी कर साझा करें।',
  },
};

const CHAPTER_ORDER: readonly BoutiqueChapterId[] = ['welcome', 'showcase', 'concierge'];
const INTENT_KEYS: readonly InquiryIntentKey[] = [
  'appointment',
  'catalogue',
  'vipOffer',
  'customGift',
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
  return 'VIP';
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
  const brandSeed = (senderName && senderName.toLowerCase() !== 'owner' ? senderName : receiverName)
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v12M4 12h16M12 8c-1.8 0-3.5-1.2-3.5-2.8C8.5 3.8 10 3 12 5.2 14 3 15.5 3.8 15.5 5.2 15.5 6.8 13.8 8 12 8z" />
    </svg>
  );
}

/**
 * 3-Chapter Atelier Sapphire & Brushed Brass Boutique Storefront and VIP Privilege Microsite.
 */
export function BusinessGreetingSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const [opened, setOpened] = useState(false);
  const [activeChapter, setActiveChapter] = useState<BoutiqueChapterId>('welcome');
  const [selectedIntent, setSelectedIntent] = useState<InquiryIntentKey>('appointment');
  const [customNote, setCustomNote] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInquiry, setCopiedInquiry] = useState(false);
  const [failedArchPhotos, setFailedArchPhotos] = useState<Record<number, boolean>>({});

  const codeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inquiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const coreLang = toCoreLanguageCode(language);
  const copy = BUSINESS_COPY[coreLang] ?? BUSINESS_COPY.en;

  const offerText = data.offerTag ? pickLocalizedText(data.offerTag, language).trim() : '';
  const displayOfferText = offerText || copy.defaultOfferText;
  const privilegeCode = derivePrivilegeCode(offerText, data.senderName, data.receiverName);
  const monogram = extractMonogram(data.receiverName, data.senderName);
  const photos = data.photos ?? [];
  const highlights = data.highlights ?? [];
  const musicLabel = manifest.music[0]?.label || 'Atelier Brass Chime';

  const selectedIntentLabel = copy.intents[selectedIntent];
  const validWa = sanitizeWhatsappPhone(data.whatsappPhone);
  const composedInquiry = [
    `Hello ${data.receiverName},`,
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
    setActiveChapter('welcome');
    onOpened?.();
  }

  function handleReplay() {
    setOpened(false);
    setActiveChapter('welcome');
  }

  async function handleCopyPrivilegeCode() {
    try {
      await navigator.clipboard?.writeText(privilegeCode);
    } catch {
      // Clipboard may be blocked in restricted iframes; confirmation state still updates.
    }
    setCopiedCode(true);
    if (codeTimerRef.current) clearTimeout(codeTimerRef.current);
    codeTimerRef.current = setTimeout(() => setCopiedCode(false), 2000);
  }

  async function handleCopyConciergeMessage() {
    try {
      await navigator.clipboard?.writeText(composedInquiry);
    } catch {
      // Clipboard may be blocked in restricted iframes; confirmation state still updates.
    }
    setCopiedInquiry(true);
    if (inquiryTimerRef.current) clearTimeout(inquiryTimerRef.current);
    inquiryTimerRef.current = setTimeout(() => setCopiedInquiry(false), 2200);
  }

  const chapterTabs = CHAPTER_ORDER.map((id) => ({ id, label: copy.tabs[id] }));

  if (!opened) {
    return (
      <div className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#0C1B33] text-[#FAF6EE]">
        <OccasionArtworkBackdrop
          src="/templates/occasions/business-greeting/cover.jpg"
          fallbackGradient="linear-gradient(155deg, #0C1B33 0%, #142B4F 58%, #071122 100%)"
          className="object-cover object-center opacity-45"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0C1B33]/85 via-[#0C1B33]/55 to-[#0C1B33]/92"
        />

        {/* Double brushed champagne gold hairline frame */}
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
            WEBZY FREE PREVIEW
          </div>
        ) : null}

        <div
          onClick={handleReveal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleReveal();
            }
          }}
          className="relative z-10 flex flex-1 cursor-pointer flex-col items-center justify-center px-6 py-8 text-center"
        >
          {/* Crisp Monogram Crest */}
          <div
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-full border border-[#C89D4C]/80 bg-[#0C1B33]/90 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C89D4C]/45 bg-gradient-to-br from-[#C89D4C]/25 to-transparent">
              <span className="font-heading text-sm font-bold tracking-[0.16em] text-[#FAF6EE]">
                {monogram}
              </span>
            </div>
          </div>

          <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#C89D4C]">
            {copy.gateEyebrow}
          </p>

          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#FAF6EE]/70">
            {copy.forLabel}
          </p>
          <h2 className="mt-1 max-w-full break-words font-heading text-2xl font-bold leading-snug text-[#FAF6EE] sm:text-3xl">
            {data.receiverName}
          </h2>

          {data.senderName ? (
            <p className="mt-1.5 max-w-full break-words text-xs font-medium text-[#FAF6EE]/80">
              {copy.fromLabel}{' '}
              <span className="font-semibold text-[#C89D4C]">{data.senderName}</span>
            </p>
          ) : null}

          {/* Royal Midnight Sapphire Satin Ribbon Band + Brushed Brass Seal */}
          <div className="relative my-6 flex w-full items-center justify-center" aria-hidden="true">
            <div
              className="h-9 w-full border-y border-[#C89D4C]/70 shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
              style={{
                background:
                  'linear-gradient(90deg, rgba(12,27,51,0.95) 0%, rgba(25,52,94,0.98) 50%, rgba(12,27,51,0.95) 100%)',
              }}
            >
              <div className="h-full w-full border-y border-[#FAF6EE]/15" />
            </div>

            <div
              className="absolute flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-[#FAF6EE]/80 p-1.5 text-center shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
              style={{
                background:
                  'linear-gradient(135deg, #E2C07D 0%, #C89D4C 52%, #9A7228 100%)',
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
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReveal();
            }}
            className="mt-3 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#FAF6EE]/40 bg-gradient-to-r from-[#C89D4C] via-[#D8B165] to-[#B68936] px-7 py-3 text-sm font-bold text-[#0C1B33] shadow-[0_10px_28px_rgba(0,0,0,0.45)] transition hover:brightness-105 active:scale-[0.98] motion-reduce:transition-none"
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.1}
              aria-hidden="true"
            >
              <circle cx="6" cy="6" r="2.5" />
              <circle cx="6" cy="18" r="2.5" />
              <path strokeLinecap="round" d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
            </svg>
            <span>{copy.untieCta}</span>
          </button>

          <p className="mt-3 text-[11px] font-medium text-[#FAF6EE]/65">{copy.gateHint}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#FAF6EE] text-[#1F2937] animate-fade-in motion-reduce:animate-none">
      {watermarked ? (
        <div
          aria-hidden="true"
          className="pointer-events-none flex justify-center border-b border-[#C89D4C]/30 bg-[#0C1B33] py-1 text-[10px] font-bold tracking-[0.2em] text-[#C89D4C]"
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      {/* Top Atelier Header & 3-Chapter Navigation */}
      <div className="border-b border-[#C89D4C]/35 bg-[#0C1B33] px-4 py-3 text-[#FAF6EE]">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-[#C89D4C]/45 bg-[#FAF6EE]/10 px-3 py-1.5">
            <span
              aria-hidden="true"
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C89D4C] text-[9px] font-extrabold text-[#0C1B33]"
            >
              {monogram}
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
      </div>

      <div className="border-b border-[#C89D4C]/25 bg-[#FAF6EE] px-4 pt-3 pb-2">
        <OccasionChapterNav
          tabs={chapterTabs}
          activeId={activeChapter}
          onSelect={(id) => setActiveChapter(id as BoutiqueChapterId)}
          accentColor="#0C1B33"
        />
      </div>

      {/* Main 3-Chapter Body */}
      <div className="flex flex-1 flex-col justify-between gap-4 px-4 pb-4 pt-3.5">
        {activeChapter === 'welcome' ? (
          <div className="space-y-3.5 animate-fade-in motion-reduce:animate-none">
            {/* Executive Brand Note */}
            <section className="relative overflow-hidden rounded-2xl border border-[#C89D4C]/45 bg-white p-4 text-center shadow-[0_12px_30px_-16px_rgba(12,27,51,0.22)]">
              <span
                aria-hidden="true"
                className="pointer-events-none mx-auto mb-2.5 block h-0.5 w-14 rounded-full bg-[#C89D4C]"
              />
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89D4C]">
                {copy.brandNoteEyebrow}
              </p>
              <div className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#0C1B33]/12 bg-[#FAF6EE] px-3 py-1 text-[11px] font-bold text-[#0C1B33]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C89D4C]" aria-hidden="true" />
                <span className="truncate">{data.receiverName}</span>
                {data.senderName ? (
                  <span className="shrink-0 font-medium text-[#1F2937]/65">
                    · {data.senderName}
                  </span>
                ) : null}
              </div>

              <h3 className="mt-3 break-words font-heading text-xl font-bold leading-snug text-[#0C1B33]">
                {pickLocalizedText(data.headline, language)}
              </h3>
              <p className="mt-2 break-words text-sm leading-relaxed text-[#1F2937]/85">
                {pickLocalizedText(data.message, language)}
              </p>

              {highlights.length > 0 ? (
                <div className="mt-3 grid gap-2 text-left">
                  {highlights.map((item, idx) => (
                    <div
                      key={`${pickLocalizedText(item.title, 'en', 'note')}-${idx}`}
                      className="rounded-xl border border-[#C89D4C]/30 bg-[#FAF6EE] px-3 py-2"
                    >
                      <p className="text-xs font-bold text-[#0C1B33]">
                        {pickLocalizedText(item.title, language)}
                      </p>
                      <p className="mt-0.5 text-xs text-[#1F2937]/80">
                        {pickLocalizedText(item.detail, language)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            {/* THE MAGICAL PRIVILEGE TICKET */}
            <section
              aria-label={copy.ticketHeader}
              className="relative flex items-stretch overflow-hidden rounded-2xl border border-[#C89D4C] shadow-[0_14px_32px_-16px_rgba(12,27,51,0.4)]"
              style={{
                background:
                  'linear-gradient(135deg, #FFFDF8 0%, #FAF6EE 55%, #F2E5C7 100%)',
              }}
            >
              {/* Royal Midnight Navy Left Stub */}
              <div className="relative flex w-14 shrink-0 flex-col items-center justify-center bg-[#0C1B33] px-1.5 py-3 text-center text-[#C89D4C]">
                <span className="font-mono text-[9.5px] font-extrabold uppercase tracking-[0.18em] [writing-mode:vertical-rl] rotate-180">
                  {copy.ticketSublabel}
                </span>
              </div>

              {/* Notched Perforation Cutouts along the stub seam */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-2.5 left-[46px] z-10 h-5 w-5 rounded-full border border-[#C89D4C] bg-[#FAF6EE]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-2.5 left-[46px] z-10 h-5 w-5 rounded-full border border-[#C89D4C] bg-[#FAF6EE]"
              />

              {/* Outer ticket right-edge notch */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-2.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 rounded-full border border-[#C89D4C] bg-[#FAF6EE]"
              />

              {/* Perforated Metallic Voucher Body */}
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-2.5 border-l-2 border-dashed border-[#C89D4C]/75 p-3.5 pr-4">
                <div>
                  <p className="font-mono text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-[#9A7228]">
                    {copy.ticketHeader}
                  </p>
                  <p className="mt-1 break-words text-xs font-semibold leading-snug text-[#0C1B33] sm:text-sm">
                    {displayOfferText}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-[#C89D4C] bg-[#0C1B33] px-3 py-2 text-[#FAF6EE]">
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
                    className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#C89D4C] px-3.5 text-xs font-bold text-[#0C1B33] shadow-xs transition hover:brightness-105 active:scale-95 motion-reduce:transition-none"
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
                    <span>{copy.copyCode}</span>
                  </button>
                </div>

                {copiedCode ? (
                  <p
                    role="status"
                    aria-live="polite"
                    className="rounded-lg border border-[#0C1B33]/15 bg-[#0C1B33] px-3 py-1.5 text-center text-[11px] font-semibold text-[#FAF6EE]"
                  >
                    {copy.copiedToast}
                  </p>
                ) : null}
              </div>
            </section>

            {/* Our Promise 3-Pillar Trust Grid */}
            <section className="rounded-2xl border border-[#C89D4C]/40 bg-white p-3.5 shadow-xs">
              <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#0C1B33]">
                {copy.promiseHeading}
              </p>

              <div className="mt-2.5 grid grid-cols-3 gap-1.5 sm:gap-2.5">
                {copy.pillars.map((pillar) => (
                  <div
                    key={pillar.key}
                    className="flex min-w-0 flex-col items-center rounded-xl border border-[#C89D4C]/25 bg-[#FAF6EE] px-2 py-2.5 text-center"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C89D4C]/55 bg-[#0C1B33] text-[#C89D4C]">
                      <PillarVectorIcon pillarKey={pillar.key} />
                    </span>
                    <h4 className="mt-2 break-words text-[10.5px] font-bold leading-tight text-[#0C1B33] sm:text-xs">
                      {pillar.title}
                    </h4>
                    <p className="mt-1 break-words text-[9.5px] leading-snug text-[#1F2937]/75 sm:text-[10.5px]">
                      {pillar.caption}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <button
              type="button"
              onClick={() => setActiveChapter('showcase')}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#0C1B33] bg-[#0C1B33] px-4 py-2.5 text-xs font-bold text-[#FAF6EE] shadow-xs transition hover:brightness-110 active:scale-[0.98] motion-reduce:transition-none"
            >
              <span>{copy.nextToShowcase}</span>
              <svg className="h-4 w-4 text-[#C89D4C]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ) : null}

        {activeChapter === 'showcase' ? (
          <div className="space-y-3.5 animate-fade-in motion-reduce:animate-none">
            {/* Arched Boutique Product/Portfolio Showcase */}
            <section className="rounded-2xl border border-[#C89D4C]/45 bg-white p-4 shadow-[0_12px_30px_-16px_rgba(12,27,51,0.2)]">
              <div className="text-center">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89D4C]">
                  {copy.showcaseHeading}
                </p>
                <p className="mt-1 text-xs text-[#1F2937]/75">{copy.showcaseSubtitle}</p>
              </div>

              {/* Editorial Arch Grid */}
              <div className="mt-3.5 grid grid-cols-3 gap-2">
                {copy.archSlots.map((slot, idx) => {
                  const photoSrc = photos[idx] || '/templates/occasions/business-greeting/cover.jpg';
                  return (
                    <div
                      key={slot.title}
                      className="flex min-w-0 flex-col items-center text-center"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-full rounded-b-xl border-2 border-[#C89D4C]/70 bg-[#0C1B33] p-1 shadow-xs">
                        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-t-full rounded-b-lg bg-gradient-to-b from-[#162C50] to-[#0C1B33]">
                          {!failedArchPhotos[idx] ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={photoSrc}
                              alt={`${slot.title} — ${data.receiverName}`}
                              loading="lazy"
                              onError={() =>
                                setFailedArchPhotos((prev) => ({ ...prev, [idx]: true }))
                              }
                              className="h-full w-full object-cover object-center"
                            />
                          ) : (
                            <span className="font-heading text-xs font-bold tracking-[0.16em] text-[#C89D4C]">
                              {monogram}
                            </span>
                          )}
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0C1B33]/75 via-transparent to-transparent"
                          />
                          <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full border border-[#C89D4C]/60 bg-[#0C1B33]/85 px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-[#FAF6EE]">
                            0{idx + 1}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1.5 w-full truncate text-[10.5px] font-bold text-[#0C1B33]">
                        {slot.title}
                      </p>
                      <p className="w-full truncate text-[9.5px] text-[#1F2937]/70">
                        {slot.subtitle}
                      </p>
                    </div>
                  );
                })}
              </div>

              {photos.length > 0 ? (
                <div className="mt-2">
                  <OccasionPhotoGallery
                    photos={photos}
                    accentColor="#0C1B33"
                    surfaceTint="#FAF6EE"
                    captionPrefix={copy.galleryCaption}
                    variant="heirloom"
                  />
                </div>
              ) : null}
            </section>

            <OccasionFilmstripGallery
              photos={photos}
              fallbackImage="/templates/occasions/business-greeting/cover.jpg"
              accentColor="#C89D4C"
              caption={`${data.receiverName.toUpperCase()} · ${copy.filmstripCaption}`}
              frameLabels={copy.filmFrameLabels}
            />

            <div className="space-y-1.5">
              <p className="px-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#0C1B33]/75">
                {copy.ambienceHeading}
              </p>
              <OccasionCassettePlayer
                trackTitle={`${musicLabel} · ${data.receiverName}`}
                mood="warm"
                tapLabel={copy.cassetteTap}
                playingLabel={copy.cassettePlaying}
                accentColor="#C89D4C"
              />
            </div>

            <button
              type="button"
              onClick={() => setActiveChapter('concierge')}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#0C1B33] bg-[#0C1B33] px-4 py-2.5 text-xs font-bold text-[#FAF6EE] shadow-xs transition hover:brightness-110 active:scale-[0.98] motion-reduce:transition-none"
            >
              <span>{copy.nextToConcierge}</span>
              <svg className="h-4 w-4 text-[#C89D4C]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ) : null}

        {activeChapter === 'concierge' ? (
          <div className="space-y-3.5 animate-fade-in motion-reduce:animate-none">
            <section className="space-y-3 rounded-2xl border border-[#C89D4C]/45 bg-white p-4 shadow-[0_12px_30px_-16px_rgba(12,27,51,0.22)]">
              <div className="text-center">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89D4C]">
                  {copy.conciergeHeading}
                </p>
                <p className="mt-1 text-xs text-[#1F2937]/75">{copy.conciergeSubtitle}</p>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-xl border border-[#C89D4C]/40 bg-[#FAF6EE] px-3 py-2">
                <span className="text-[11px] font-semibold text-[#1F2937]/80">
                  {copy.includedCodeLabel}
                </span>
                <span className="rounded-md bg-[#0C1B33] px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider text-[#C89D4C]">
                  {privilegeCode}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#0C1B33]/80">
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
                  htmlFor="boutique-concierge-note"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[#0C1B33]/80"
                >
                  {copy.quickNoteLabel}
                </label>
                <input
                  id="boutique-concierge-note"
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
                <div className="space-y-2">
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

                  {copiedInquiry ? (
                    <p
                      role="status"
                      aria-live="polite"
                      className="rounded-lg bg-[#0C1B33] px-3 py-1.5 text-center text-[11px] font-semibold text-[#C89D4C]"
                    >
                      {copy.copiedInquiryToast}
                    </p>
                  ) : null}

                  <p className="text-center text-[11px] text-[#1F2937]/70">
                    {copy.noPhoneFallback}
                  </p>
                </div>
              )}
            </section>
          </div>
        ) : null}

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
      </div>
    </div>
  );
}
