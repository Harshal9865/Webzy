import type { LocalizedText } from './types';
import { WebzyError } from './logger';

export type ValidityAddonId = 'extend_14d' | 'extend_21d' | 'extend';
export type AddonId = 'pin' | 'video' | ValidityAddonId;

export const VALIDITY_EXTENSION_ADDON_IDS: readonly ValidityAddonId[] = [
  'extend_14d',
  'extend_21d',
  'extend',
] as const;

export const VALIDITY_TARGET_DAYS: Record<ValidityAddonId, number> = {
  extend_14d: 14,
  extend_21d: 21,
  extend: 90,
};

export function isValidityAddonId(id: string): id is ValidityAddonId {
  return id === 'extend_14d' || id === 'extend_21d' || id === 'extend';
}

/**
 * Ensures any theme offering the `'extend'` add-on also exposes the 14-day and 21-day tiers.
 */
export function expandThemeAddons(addons: readonly AddonId[]): AddonId[] {
  const expanded: AddonId[] = [];
  for (const id of addons) {
    if (id === 'extend') {
      for (const vId of VALIDITY_EXTENSION_ADDON_IDS) {
        if (!expanded.includes(vId)) expanded.push(vId);
      }
    } else if (!expanded.includes(id)) {
      expanded.push(id);
    }
  }
  return expanded;
}

export interface PriceTierInfo {
  id: 'ready_made' | 'semi_custom' | 'request_only' | 'business_plan';
  rangeLabel: string;
  compareRangeLabel?: string;
  validityDays: number;
  title: LocalizedText;
  summary: LocalizedText;
}

export interface AddonCatalogItem {
  id: AddonId;
  priceInr: number;
  compareAtInr: number;
  targetValidityDays?: number;
  label: LocalizedText;
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
  extend_14d: {
    id: 'extend_14d',
    priceInr: 9,
    compareAtInr: 19,
    targetValidityDays: 14,
    label: {
      en: '14 days total validity (+₹9)',
      hinglish: '14 din total validity (+₹9)',
      hi: '14 दिन कुल वैधता (+₹9)',
    },
  },
  extend_21d: {
    id: 'extend_21d',
    priceInr: 14,
    compareAtInr: 29,
    targetValidityDays: 21,
    label: {
      en: '21 days total validity (+₹14)',
      hinglish: '21 din total validity (+₹14)',
      hi: '21 दिन कुल वैधता (+₹14)',
    },
  },
  extend: {
    id: 'extend',
    priceInr: 19,
    compareAtInr: 49,
    targetValidityDays: 90,
    label: {
      en: '3 months (90 days) validity (+₹19)',
      hinglish: '3 months (90 din) validity (+₹19)',
      hi: '3 महीने (90 दिन) वैधता (+₹19)',
    },
  },
};

export const BUSINESS_PRICE_TIERS: PriceTierInfo[] = [
  {
    id: 'ready_made',
    rangeLabel: '₹29 – ₹99',
    compareRangeLabel: '₹99 – ₹249',
    validityDays: 7,
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
    validityDays: 7,
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
    validityDays: 90,
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
    validityDays: 7,
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

  const allowedSet = new Set(expandThemeAddons(params.allowedAddons));
  const rawAllowed = Array.from(
    new Set((params.selectedAddons ?? []).filter((id): id is AddonId => allowedSet.has(id as AddonId))),
  );

  // Enforce mutual exclusivity for validity tiers (highest selected tier wins: extend 90d > extend_21d > extend_14d)
  const chosenValidityAddon: ValidityAddonId | undefined = (['extend', 'extend_21d', 'extend_14d'] as const).find(
    (vId) => rawAllowed.includes(vId),
  );
  const validAddonIds: AddonId[] = [
    ...rawAllowed.filter((id) => !isValidityAddonId(id)),
    ...(chosenValidityAddon ? [chosenValidityAddon] : []),
  ];

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
    params.defaultValidityDays && params.defaultValidityDays > 0 ? params.defaultValidityDays : 7;
  const validityDays = chosenValidityAddon
    ? Math.max(baseDays, VALIDITY_TARGET_DAYS[chosenValidityAddon])
    : baseDays;

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
