import type { LanguageCode } from './types';
import { WebzyError } from './logger';

export type AddonId = 'pin' | 'video' | 'extend';

export interface PriceTierInfo {
  id: 'ready_made' | 'semi_custom' | 'request_only' | 'business_plan';
  rangeLabel: string;
  compareRangeLabel?: string;
  validityDays: number;
  title: Record<LanguageCode, string>;
  summary: Record<LanguageCode, string>;
}

export interface AddonCatalogItem {
  id: AddonId;
  priceInr: number;
  compareAtInr: number;
  label: Record<LanguageCode, string>;
}

export const ADDON_CATALOG: Record<AddonId, AddonCatalogItem> = {
  pin: {
    id: 'pin',
    priceInr: 9,
    compareAtInr: 19,
    label: {
      en: 'Secret PIN lock (+₹9)',
      hinglish: 'Secret PIN lock (+₹9)',
      hi: 'सीक्रेट पिन लॉक (+₹9)',
    },
  },
  video: {
    id: 'video',
    priceInr: 19,
    compareAtInr: 49,
    label: {
      en: 'Status video export (+₹19)',
      hinglish: 'Status video export (+₹19)',
      hi: 'स्टेटस वीडियो (+₹19)',
    },
  },
  extend: {
    id: 'extend',
    priceInr: 19,
    compareAtInr: 49,
    label: {
      en: 'Extra 90 days validity (+₹19)',
      hinglish: 'Extra 90 days validity (+₹19)',
      hi: '90 दिन अतिरिक्त वैधता (+₹19)',
    },
  },
};

export const BUSINESS_PRICE_TIERS: PriceTierInfo[] = [
  {
    id: 'ready_made',
    rangeLabel: '₹29 – ₹99',
    compareRangeLabel: '₹99 – ₹249',
    validityDays: 30,
    title: {
      en: 'Ready-made Celebrations',
      hinglish: 'Ready-made Celebrations',
      hi: 'रेडी-मेड सेलिब्रेशन',
    },
    summary: {
      en: 'Pick a theme, fill 3–6 quick fields, and get an instant WhatsApp link.',
      hinglish: 'Theme chuno, 3–6 details bharo, 5 min mein WhatsApp link ready.',
      hi: 'थीम चुनें, 3–6 जानकारी भरें, 5 मिनट में लिंक तैयार।',
    },
  },
  {
    id: 'semi_custom',
    rangeLabel: '₹299 – ₹999',
    compareRangeLabel: '₹599 – ₹2,499',
    validityDays: 90,
    title: {
      en: 'Semi-custom Keepsakes',
      hinglish: 'Semi-custom Keepsakes',
      hi: 'सेमी-कस्टम कीपसेक',
    },
    summary: {
      en: 'Wedding invites & family layouts tailored personally by our team.',
      hinglish: 'Wedding cards aur khaas family tweaks hamare haath se.',
      hi: 'शादी कार्ड और परिवार के खास बदलाव हमारे द्वारा।',
    },
  },
  {
    id: 'request_only',
    rangeLabel: '₹1,499+',
    compareRangeLabel: '₹2,999+',
    validityDays: 180,
    title: {
      en: 'Custom request',
      hinglish: 'Custom request',
      hi: 'कस्टम रिक्वेस्ट',
    },
    summary: {
      en: 'Share your brief, pick email or a 15-min call, and get a custom build.',
      hinglish: '15-minute call par plan, quote aur dedicated build.',
      hi: '15 मिनट कॉल पर प्लान, कोटेशन और खास डिज़ाइन।',
    },
  },
  {
    id: 'business_plan',
    rangeLabel: '₹99 – ₹199 / mo',
    compareRangeLabel: '₹299 – ₹499 / mo',
    validityDays: 30,
    title: {
      en: 'Small business',
      hinglish: 'Small business',
      hi: 'छोटा व्यवसाय',
    },
    summary: {
      en: 'Festive greetings, grand openings, and one-tap WhatsApp leads.',
      hinglish: 'Festive greetings, grand opening aur WhatsApp inquiry card.',
      hi: 'त्योहार शुभकामना, ओपनिंग और व्हाट्सऐप कार्ड।',
    },
  },
];

export interface ServerOrderPricingResult {
  basePaise: number;
  addonsPaise: number;
  subtotalPaise: number;
  discountPaise: number;
  totalPaise: number;
  feeEstimatePaise: number;
  validityDays: number;
  validAddonIds: AddonId[];
}

/**
 * Server-only pricing calculator (Section 3 & Section 10).
 * Never trusts amounts from the browser; computes gateway fee estimate (~2% + 18% GST).
 */
export function computeOrderPricingPaise(params: {
  basePriceInr: number;
  allowedAddons: AddonId[];
  selectedAddons?: string[];
  couponDiscountPaise?: number;
  defaultValidityDays?: number;
}): ServerOrderPricingResult {
  if (!Number.isFinite(params.basePriceInr) || params.basePriceInr < 19) {
    throw new WebzyError('Invalid base theme price.', {
      code: 'PRICING_INVALID_BASE',
      statusCode: 400,
    });
  }

  const allowedSet = new Set(params.allowedAddons);
  const validAddonIds = Array.from(
    new Set((params.selectedAddons ?? []).filter((id): id is AddonId => allowedSet.has(id as AddonId))),
  );

  const basePaise = Math.round(params.basePriceInr * 100);
  const addonsPaise = validAddonIds.reduce(
    (sum, id) => sum + Math.round((ADDON_CATALOG[id]?.priceInr ?? 0) * 100),
    0,
  );
  const subtotalPaise = basePaise + addonsPaise;

  const requestedDiscount = Math.max(0, Math.round(params.couponDiscountPaise ?? 0));
  const discountPaise = Math.min(requestedDiscount, Math.max(0, subtotalPaise - 100));
  const totalPaise = subtotalPaise - discountPaise;

  const feeEstimatePaise = Math.round(totalPaise * 0.0236);
  const baseDays =
    params.defaultValidityDays && params.defaultValidityDays > 0 ? params.defaultValidityDays : 30;
  const validityDays = validAddonIds.includes('extend') ? baseDays + 90 : baseDays;

  return {
    basePaise,
    addonsPaise,
    subtotalPaise,
    discountPaise,
    totalPaise,
    feeEstimatePaise,
    validityDays,
    validAddonIds,
  };
}

export function formatInr(amountInr: number): string {
  return `₹${Math.round(amountInr)}`;
}

export function formatPaiseAsInr(paise: number): string {
  const inr = paise / 100;
  return Number.isInteger(inr) ? `₹${inr}` : `₹${inr.toFixed(2)}`;
}
