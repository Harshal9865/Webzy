'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import {
  type CoreLanguageCode,
  type LanguageCode,
  pickLocalizedText,
} from '@webzy/core';
import type { ThemeDemoPayload, ThemeManifest } from '../../schema';

export type SmallBusinessThemeVariant =
  | 'bakery'
  | 'streetwear'
  | 'boutique'
  | 'kinetic3d';

export interface SmallBusinessThemeComponentProps {
  manifest: ThemeManifest;
  data: ThemeDemoPayload;
  language: LanguageCode;
  watermarked?: boolean;
  onOpened?: () => void;
  onOpenPhoto?: (idx: number) => void;
}

const STREETWEAR_KEYWORDS = new Set([
  'streetwear',
  'apparel',
  'drop',
  'drops',
  'hoodie',
  'jacket',
  'sneaker',
  'urban',
  'atelier',
]);

const BOUTIQUE_KEYWORDS = new Set([
  'boutique',
  'fashion',
  'shop',
  'minimal',
  'minimalist',
  'lifestyle',
  'curated',
  'studio',
  'clothing',
]);

const KINETIC_3D_KEYWORDS = new Set([
  'kinetic3d',
  '3d',
  'crazy',
  'creative',
  'prism',
  'kinetic',
  'spatial',
  'futuristic',
  'tech',
]);

/** Maps buyer relation/style deterministically to 1 of 4 Small Business storefront themes. */
export function resolveSmallBusinessTheme(relation?: string): SmallBusinessThemeVariant {
  const normalized = (relation ?? '').trim().toLowerCase();
  if (!normalized) return 'bakery';
  if (STREETWEAR_KEYWORDS.has(normalized)) return 'streetwear';
  if (BOUTIQUE_KEYWORDS.has(normalized)) return 'boutique';
  if (KINETIC_3D_KEYWORDS.has(normalized)) return 'kinetic3d';

  for (const kw of KINETIC_3D_KEYWORDS) {
    if (normalized.includes(kw)) return 'kinetic3d';
  }
  for (const kw of STREETWEAR_KEYWORDS) {
    if (normalized.includes(kw)) return 'streetwear';
  }
  for (const kw of BOUTIQUE_KEYWORDS) {
    if (normalized.includes(kw)) return 'boutique';
  }
  return 'bakery';
}

export function useSmallBusinessReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    return undefined;
  }, []);

  return reduced;
}

export function getValidPhotos(
  photos?: string[],
  failedUrls?: Record<string, boolean>,
): string[] {
  if (!Array.isArray(photos)) return [];
  return photos
    .map((u) => (typeof u === 'string' ? u.trim() : ''))
    .filter((u) => u.length > 0 && !(failedUrls && failedUrls[u]))
    .slice(0, 6);
}

/** Keeps Devanagari shirorekha intact by disabling synthetic italic slant and negative tracking. */
export function hiSafeStyle(language: LanguageCode): React.CSSProperties | undefined {
  if (language === 'hi') {
    return {
      fontStyle: 'normal',
      letterSpacing: '0em',
    };
  }
  return undefined;
}

export function sanitizeWhatsappPhone(raw?: string): string | null {
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

export function buildWhatsAppOrderHref(phone: string | null, message: string): string | null {
  if (!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function extractStoreMonogram(name: string): string {
  const words = name
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return 'SB';
}

export function deriveStoreName(
  data: ThemeDemoPayload,
  fallback: string,
): string {
  const r = data.receiverName?.trim();
  if (r && r.toLowerCase() !== 'patron' && r.toLowerCase() !== 'customer') return r;
  const s = data.senderName?.trim();
  if (s && s.toLowerCase() !== 'owner') return s;
  return fallback;
}

export interface ResolvedHighlight {
  title: string;
  detail: string;
}

export function deriveHighlights(
  data: ThemeDemoPayload,
  language: LanguageCode,
): ResolvedHighlight[] {
  if (!Array.isArray(data.highlights)) return [];
  return data.highlights
    .map((h) => ({
      title: pickLocalizedText(h.title, language).trim(),
      detail: pickLocalizedText(h.detail, language).trim(),
    }))
    .filter((h) => h.title.length > 0 || h.detail.length > 0);
}

export interface SmallBusinessCopyPack {
  switcher: Record<SmallBusinessThemeVariant, string>;
  demoOrderToast: string;
  copiedToast: string;
  copyOrderBtn: string;
  closeBtn: string;
  bakery: {
    defaultStore: string;
    eyebrow: string;
    saveBadge: string;
    heroTag: string;
    categories: [string, string, string, string, string];
    bestsellerHeading: string;
    bestsellerSub: string;
    addBag: string;
    addedLabel: string;
    promiseHeading: string;
    promises: [string, string, string, string];
    ticketEyebrow: string;
    ticketTitle: string;
    ticketDefaultOffer: string;
    claimOffer: string;
    offerApplied: string;
    bagLabel: string;
    emptyBagHint: string;
    orderWhatsapp: string;
  };
  streetwear: {
    defaultStore: string;
    dropTag: string;
    angles: [string, string, string, string];
    colorLabel: string;
    sizeLabel: string;
    specLine: string;
    stockLine: string;
    orderDropBtn: string;
    relevantHeading: string;
    inspectHint: string;
    qualityHeading: string;
    qualityMetrics: [string, string, string];
    reviewsHeading: string;
  };
  boutique: {
    defaultStore: string;
    seasonBadge: string;
    heroHeadline: string;
    exploreCta: string;
    categories: [string, string, string, string];
    sortFeatured: string;
    sortLowHigh: string;
    sortHighLow: string;
    inquireBtn: string;
    addBagBtn: string;
    bentoLeftTitle: string;
    bentoLeftSub: string;
    bentoRightTitle: string;
    bentoRightSub: string;
    bentoWideTitle: string;
    bentoWideCta: string;
    trustPillars: [string, string, string, string];
    orderWhatsapp: string;
  };
  kinetic3d: {
    defaultStore: string;
    hudBadge: string;
    heroSub: string;
    cubeEyebrow: string;
    cubeTitle: string;
    prevFace: string;
    nextFace: string;
    autoSpinOn: string;
    autoSpinOff: string;
    deckEyebrow: string;
    deckTitle: string;
    tapSpotlight: string;
    marqueeTop: string;
    marqueeBottom: string;
    selectedFocus: string;
    sendInquiryBtn: string;
  };
}

export const SMALL_BUSINESS_THEMES_COPY: Record<CoreLanguageCode, SmallBusinessCopyPack> = {
  en: {
    switcher: {
      bakery: 'Bakery',
      streetwear: 'Streetwear',
      boutique: 'Boutique',
      kinetic3d: '3D Kinetic',
    },
    demoOrderToast: 'Demo mode: Order summary prepared below for preview.',
    copiedToast: 'Order message copied to clipboard.',
    copyOrderBtn: 'Copy Order Text',
    closeBtn: 'Close',
    bakery: {
      defaultStore: 'Velvet Crumb Bakehouse',
      eyebrow: 'FRESH FROM THE OVEN',
      saveBadge: 'SAVE 20%',
      heroTag: 'Small-Batch Artisan Cakes',
      categories: ['All', 'Classic', 'Gourmet', 'Desserts', 'Hampers'],
      bestsellerHeading: 'Bakehouse Bestsellers',
      bestsellerSub: 'Hand-piped daily with Belgian couverture & seasonal fruit',
      addBag: '+ Bag',
      addedLabel: 'In Bag',
      promiseHeading: 'Our Promise',
      promises: ['Same-Day Fresh', 'Artisan Recipes', 'Gift Packaging', 'Custom Messages'],
      ticketEyebrow: 'CELEBRATION TICKET',
      ticketTitle: 'Sweet Celebration Privilege',
      ticketDefaultOffer: 'Complimentary ribbon gift box & 20% off first custom cake',
      claimOffer: 'Claim Offer',
      offerApplied: 'Applied to Bag',
      bagLabel: 'Order Bag',
      emptyBagHint: 'Tap + Bag on any treat to build a WhatsApp order',
      orderWhatsapp: 'Order on WhatsApp',
    },
    streetwear: {
      defaultStore: 'MONOCHROME ATELIER',
      dropTag: 'ARCHIVE DROP 04 // LIMITED',
      angles: ['Front', 'Drape', 'Stitch', 'Flat'],
      colorLabel: 'COLORWAY',
      sizeLabel: 'SELECT SIZE',
      specLine: '100% Heavyweight Cotton · Tailored Cut · 400 GSM',
      stockLine: 'SMALL-BATCH DISPATCH IN 24H',
      orderDropBtn: 'ORDER DROP VIA WHATSAPP',
      relevantHeading: 'RELEVANT DROPS',
      inspectHint: 'Tap to inspect',
      qualityHeading: 'VERIFIED BUYER QUALITY',
      qualityMetrics: ['Material', 'Fit', 'Craft'],
      reviewsHeading: 'VERIFIED PATRON NOTES',
    },
    boutique: {
      defaultStore: 'FORMA STUDIO',
      seasonBadge: 'NEW COLLECTION',
      heroHeadline: 'Refined Everyday Silhouettes',
      exploreCta: 'Shop the Edit',
      categories: ['All', 'Apparel', 'Footwear', 'Accessories'],
      sortFeatured: 'Sort: Featured',
      sortLowHigh: 'Price: Low-High',
      sortHighLow: 'Price: High-Low',
      inquireBtn: 'Inquire',
      addBagBtn: '+ Bag',
      bentoLeftTitle: 'Urban Tailoring',
      bentoLeftSub: 'Relaxed wool-blend & crisp poplin',
      bentoRightTitle: 'Crafted Basics',
      bentoRightSub: 'Combed organic cotton essentials',
      bentoWideTitle: 'Up to 50% Seasonal Edit',
      bentoWideCta: 'Request Lookbook',
      trustPillars: ['Direct Support', 'Fast Dispatch', 'Quality Checked', 'Easy WhatsApp Order'],
      orderWhatsapp: 'Order on WhatsApp',
    },
    kinetic3d: {
      defaultStore: 'PRISM STUDIO 3D',
      hudBadge: 'SPATIAL STOREFRONT',
      heroSub: 'Scroll or tilt to inspect every facet in real-time 3D depth',
      cubeEyebrow: 'INTERACTIVE 6-FACE CUBE',
      cubeTitle: 'Signature Showcase Cube',
      prevFace: 'Prev',
      nextFace: 'Next',
      autoSpinOn: 'Spin: On',
      autoSpinOff: 'Spin: Off',
      deckEyebrow: 'DEPTH LAYER DECK',
      deckTitle: 'Curated Highlights in Space',
      tapSpotlight: 'Tap card to focus',
      marqueeTop: 'LIMITED EDITION DROP · SPATIAL CRAFT · DIRECT WHATSAPP BOOKING ·',
      marqueeBottom: 'BESPOKE QUALITY · PRECISION DESIGN · INSTANT INQUIRY ·',
      selectedFocus: 'Active Selection',
      sendInquiryBtn: 'Book via WhatsApp',
    },
  },
  hinglish: {
    switcher: {
      bakery: 'Bakery',
      streetwear: 'Streetwear',
      boutique: 'Boutique',
      kinetic3d: '3D Kinetic',
    },
    demoOrderToast: 'Demo preview: Aapka WhatsApp order summary neeche taiyaar hai.',
    copiedToast: 'Order message copy ho gaya.',
    copyOrderBtn: 'Order Text Copy Karein',
    closeBtn: 'Band Karein',
    bakery: {
      defaultStore: 'Velvet Crumb Bakehouse',
      eyebrow: 'AAJ KA FRESH BATCH',
      saveBadge: 'SAVE 20%',
      heroTag: 'Handcrafted Artisan Cakes',
      categories: ['All', 'Classic', 'Gourmet', 'Desserts', 'Hampers'],
      bestsellerHeading: 'Bakehouse Bestsellers',
      bestsellerSub: 'Pure chocolate aur fresh cream ke saath rozana baked',
      addBag: '+ Bag',
      addedLabel: 'Bag Mein',
      promiseHeading: 'Hamara Vaada',
      promises: ['Same-Day Fresh', 'Artisan Recipes', 'Gift Packaging', 'Custom Messages'],
      ticketEyebrow: 'CELEBRATION TICKET',
      ticketTitle: 'Khaas Celebration Offer',
      ticketDefaultOffer: 'Free gift box ribbon aur pehle custom cake par 20% off',
      claimOffer: 'Offer Apply Karein',
      offerApplied: 'Bag Mein Applied',
      bagLabel: 'Order Bag',
      emptyBagHint: 'WhatsApp order banane ke liye kisi bhi item par + Bag dabayein',
      orderWhatsapp: 'WhatsApp Par Order Karein',
    },
    streetwear: {
      defaultStore: 'MONOCHROME ATELIER',
      dropTag: 'ARCHIVE DROP 04 // LIMITED',
      angles: ['Front', 'Drape', 'Stitch', 'Flat'],
      colorLabel: 'COLORWAY',
      sizeLabel: 'SIZE CHUNEIN',
      specLine: '100% Heavyweight Cotton · Tailored Cut · 400 GSM',
      stockLine: '24 GHANTE MEIN DISPATCH',
      orderDropBtn: 'WHATSAPP SE ORDER KAREIN',
      relevantHeading: 'RELEVANT DROPS',
      inspectHint: 'Dekhne ke liye tap karein',
      qualityHeading: 'VERIFIED BUYER QUALITY',
      qualityMetrics: ['Material', 'Fit', 'Craft'],
      reviewsHeading: 'BUYER REVIEWS',
    },
    boutique: {
      defaultStore: 'FORMA STUDIO',
      seasonBadge: 'NEW COLLECTION',
      heroHeadline: 'Minimal Everyday Collection',
      exploreCta: 'Collection Dekhein',
      categories: ['All', 'Apparel', 'Footwear', 'Accessories'],
      sortFeatured: 'Sort: Featured',
      sortLowHigh: 'Price: Kam-Zyada',
      sortHighLow: 'Price: Zyada-Kam',
      inquireBtn: 'Puchhein',
      addBagBtn: '+ Bag',
      bentoLeftTitle: 'Urban Tailoring',
      bentoLeftSub: 'Sharp silhouettes aur breathable fabrics',
      bentoRightTitle: 'Crafted Basics',
      bentoRightSub: 'Rozana ke liye organic cotton essentials',
      bentoWideTitle: 'Up to 50% Seasonal Edit',
      bentoWideCta: 'Lookbook Mangwayein',
      trustPillars: ['Direct Support', 'Fast Dispatch', 'Quality Checked', 'Easy WhatsApp Order'],
      orderWhatsapp: 'WhatsApp Par Order Karein',
    },
    kinetic3d: {
      defaultStore: 'PRISM STUDIO 3D',
      hudBadge: '3D SPATIAL STORE',
      heroSub: 'Scroll ya tilt karke har product ko 3D depth mein dekhein',
      cubeEyebrow: '6-FACE 3D CUBE',
      cubeTitle: 'Signature Showcase Cube',
      prevFace: 'Prev',
      nextFace: 'Next',
      autoSpinOn: 'Spin: On',
      autoSpinOff: 'Spin: Off',
      deckEyebrow: '3D LAYER DECK',
      deckTitle: 'Curated Highlights',
      tapSpotlight: 'Focus karne ke liye tap karein',
      marqueeTop: 'LIMITED EDITION DROP · SPATIAL CRAFT · DIRECT WHATSAPP BOOKING ·',
      marqueeBottom: 'BESPOKE QUALITY · PRECISION DESIGN · INSTANT INQUIRY ·',
      selectedFocus: 'Chuna Hua Item',
      sendInquiryBtn: 'WhatsApp Par Book Karein',
    },
  },
  hi: {
    switcher: {
      bakery: 'बेकरी',
      streetwear: 'स्ट्रीटवेयर',
      boutique: 'बुटीक',
      kinetic3d: '3D काइनेटिक',
    },
    demoOrderToast: 'डेमो प्रीव्यू: आपका ऑर्डर सारांश नीचे तैयार है।',
    copiedToast: 'ऑर्डर संदेश कॉपी हो गया।',
    copyOrderBtn: 'ऑर्डर कॉपी करें',
    closeBtn: 'बंद करें',
    bakery: {
      defaultStore: 'वेलवेट क्रम बेकहाउस',
      eyebrow: 'ताज़ा बेक किया गया',
      saveBadge: '20% बचत',
      heroTag: 'हैंडक्राफ्टेड आर्टिज़न केक',
      categories: ['सभी', 'क्लासिक', 'गॉरमेट', 'डेज़र्ट', 'हैम्पर्स'],
      bestsellerHeading: 'बेस्टसेलर कलेक्शन',
      bestsellerSub: 'शुद्ध चॉकलेट और ताज़ी क्रीम के साथ प्रतिदिन तैयार',
      addBag: '+ बैग',
      addedLabel: 'बैग में',
      promiseHeading: 'हमारा वादा',
      promises: ['उसी दिन ताज़ा', 'असली रेसिपी', 'गिफ्ट पैकेजिंग', 'कस्टम संदेश'],
      ticketEyebrow: 'उत्सव टिकट',
      ticketTitle: 'विशेष सेलिब्रेशन ऑफ़र',
      ticketDefaultOffer: 'मुफ़्त गिफ्ट बॉक्स और पहले कस्टम केक पर 20% की छूट',
      claimOffer: 'ऑफ़र लागू करें',
      offerApplied: 'ऑफ़र लागू',
      bagLabel: 'ऑर्डर बैग',
      emptyBagHint: 'WhatsApp ऑर्डर बनाने के लिए किसी भी आइटम पर + बैग दबाएँ',
      orderWhatsapp: 'WhatsApp पर ऑर्डर करें',
    },
    streetwear: {
      defaultStore: 'मोनोक्रोम अटेलियर',
      dropTag: 'सीमित संस्करण 04',
      angles: ['फ्रंट', 'ड्रेप', 'स्टिच', 'फ्लैट'],
      colorLabel: 'रंग चुनें',
      sizeLabel: 'साइज़ चुनें',
      specLine: '100% हेवीवेट कॉटन · टेलर्ड कट · 400 GSM',
      stockLine: '24 घंटे में डिस्पैच के लिए तैयार',
      orderDropBtn: 'WHATSAPP पर ऑर्डर करें',
      relevantHeading: 'अन्य विशेष ड्रॉप्स',
      inspectHint: 'देखने के लिए टैप करें',
      qualityHeading: 'सत्यापित गुणवत्ता मानक',
      qualityMetrics: ['कपड़ा', 'फिटिंग', 'कारीगरी'],
      reviewsHeading: 'ग्राहक अनुभव',
    },
    boutique: {
      defaultStore: 'फ़ॉर्मा स्टूडियो',
      seasonBadge: 'नया कलेक्शन',
      heroHeadline: 'सुरुचिपूर्ण एवरीडे कलेक्शन',
      exploreCta: 'कलेक्शन देखें',
      categories: ['सभी', 'परिधान', 'फुटवियर', 'एक्सेसरीज़'],
      sortFeatured: 'क्रम: विशेष',
      sortLowHigh: 'कीमत: कम से अधिक',
      sortHighLow: 'कीमत: अधिक से कम',
      inquireBtn: 'पूछताछ',
      addBagBtn: '+ बैग',
      bentoLeftTitle: 'अर्बन टेलरिंग',
      bentoLeftSub: 'आधुनिक कट और आरामदायक फ़ैब्रिक',
      bentoRightTitle: 'क्राफ्टेड बेसिक्स',
      bentoRightSub: 'दैनिक उपयोग के लिए शुद्ध कॉटन',
      bentoWideTitle: 'सीज़नल एडिट पर 50% तक छूट',
      bentoWideCta: 'लुकबुक मँगवाएँ',
      trustPillars: ['सीधी सहायता', 'त्वरित डिस्पैच', 'गुणवत्ता जाँच', 'आसान WhatsApp ऑर्डर'],
      orderWhatsapp: 'WhatsApp पर ऑर्डर करें',
    },
    kinetic3d: {
      defaultStore: 'प्रिज़्म स्टूडियो 3D',
      hudBadge: '3D स्पेशल स्टोर',
      heroSub: 'रीयल-टाइम 3D गहराई में हर उत्पाद देखने के लिए स्क्रॉल या टिल्ट करें',
      cubeEyebrow: 'इंटरैक्टिव 3D क्यूब',
      cubeTitle: 'सिग्नेचर शोकेस क्यूब',
      prevFace: 'पिछला',
      nextFace: 'अगला',
      autoSpinOn: 'स्पिन: चालू',
      autoSpinOff: 'स्पिन: बंद',
      deckEyebrow: '3D लेयर डेक',
      deckTitle: 'प्रमुख उत्पाद झलक',
      tapSpotlight: 'फ़ोकस करने के लिए कार्ड टैप करें',
      marqueeTop: 'सीमित संस्करण · सटीक डिज़ाइन · सीधा WHATSAPP ऑर्डर ·',
      marqueeBottom: 'उत्कृष्ट कारीगरी · आधुनिक शैली · त्वरित बुकिंग ·',
      selectedFocus: 'चयनित उत्पाद',
      sendInquiryBtn: 'WhatsApp पर बुक करें',
    },
  },
};
