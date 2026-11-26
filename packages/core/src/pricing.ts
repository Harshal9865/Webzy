import type { LocalizedText } from './types';
import { WebzyError } from './logger';

export type ValidityAddonId = 'extend_14d' | 'extend_21d' | 'lifetime' | 'extend';
export type StorefrontValidityAddonId = 'extend_14d' | 'extend_21d' | 'lifetime';
export type AddonId = 'pin' | 'video' | ValidityAddonId;
export type PricingProductType = 'ready_made' | 'custom_made';

export const STOREFRONT_VALIDITY_ADDON_IDS: readonly StorefrontValidityAddonId[] = [
  'extend_14d',
  'extend_21d',
  'lifetime',
] as const;

export const VALIDITY_EXTENSION_ADDON_IDS: readonly ValidityAddonId[] = [
  'extend_14d',
  'extend_21d',
  'lifetime',
  'extend',
] as const;

export const VALIDITY_TARGET_DAYS: Record<ValidityAddonId, number> = {
  extend_14d: 14,
  extend_21d: 21,
  lifetime: 36500,
  extend: 90,
};

export const SITE_DELETE_GRACE_DAYS = 7;

export function isValidityAddonId(id: string): id is ValidityAddonId {
  return id === 'extend_14d' || id === 'extend_21d' || id === 'lifetime' || id === 'extend';
}

/**
 * Expands the legacy `'extend'` add-on into storefront validity tiers (`extend_14d`, `extend_21d`, `lifetime`),
 * preserving non-validity add-ons first with no duplicates.
 */
export function expandThemeAddons(addons: readonly AddonId[]): AddonId[] {
  const nonValidity: AddonId[] = [];
  const validity: AddonId[] = [];
  for (const id of addons) {
    if (id === 'extend') {
      for (const vId of STOREFRONT_VALIDITY_ADDON_IDS) {
        if (!validity.includes(vId)) validity.push(vId);
      }
    } else if (isValidityAddonId(id)) {
      if (!validity.includes(id)) validity.push(id);
    } else if (!nonValidity.includes(id)) {
      nonValidity.push(id);
    }
  }
  return [...nonValidity, ...validity];
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
  lifetime: {
    id: 'lifetime',
    priceInr: 500,
    compareAtInr: 999,
    targetValidityDays: 36500,
    label: {
      en: 'Lifetime Hosting (Ready-Made Only)',
      hinglish: 'Lifetime Hosting (Ready-Made Only)',
      hi: 'लाइफटाइम होस्टिंग (केवल रेडी-मेड)',
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
      en: '7-day hosting included; extendable to 14d (+₹9), 21d (+₹14), or Lifetime (+₹500).',
      hinglish: '7 din hosting shamil; 14d (+₹9), 21d (+₹14) ya Lifetime (+₹500) chuno.',
      hi: '7 दिन की होस्टिंग शामिल; 14 दिन (+₹9), 21 दिन (+₹14) या लाइफटाइम (+₹500) विकल्प।',
    },
  },
  {
    id: 'semi_custom',
    rangeLabel: '₹499',
    compareRangeLabel: '₹1,499',
    validityDays: 7,
    title: {
      en: 'Ready-made Weddings',
      hinglish: 'Ready-made Weddings',
      hi: 'रेडी-मेड वेडिंग कार्ड',
    },
    summary: {
      en: 'Royal interactive wedding invitations with guest RSVPs; Lifetime Hosting optional (+₹500).',
      hinglish: 'Royal wedding invite + guest RSVP; Lifetime Hosting (+₹500) optional.',
      hi: 'शाही डिजिटल विवाह निमंत्रण व गेस्ट RSVP; लाइफटाइम होस्टिंग (+₹500) वैकल्पिक।',
    },
  },
  {
    id: 'request_only',
    rangeLabel: '₹1,499+',
    compareRangeLabel: '₹2,999+',
    validityDays: 90,
    title: {
      en: 'Custom Made',
      hinglish: 'Custom Made',
      hi: 'कस्टम मेड',
    },
    summary: {
      en: 'Bespoke coaching, clinic, business & wedding websites. Custom domains billed at registrar actuals.',
      hinglish: 'Coaching, clinic, business aur custom wedding sites; domain actuals par.',
      hi: 'कोचिंग, क्लिनिक, बिज़नेस व कस्टम वेडिंग वेबसाइट; डोमेन रजिस्ट्रार दर पर।',
    },
  },
  {
    id: 'business_plan',
    rangeLabel: '₹99',
    compareRangeLabel: '₹249',
    validityDays: 7,
    title: {
      en: 'Small Business Cards',
      hinglish: 'Small Business Cards',
      hi: 'छोटा व्यवसाय कार्ड',
    },
    summary: {
      en: 'Festive greetings, grand openings & one-tap WhatsApp leads with optional Lifetime Hosting.',
      hinglish: 'Festive greetings, grand opening aur WhatsApp lead card; Lifetime optional.',
      hi: 'त्योहार शुभकामना, ओपनिंग व व्हाट्सऐप कार्ड; लाइफटाइम होस्टिंग वैकल्पिक।',
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
  isLifetime: boolean;
  validAddonIds: AddonId[];
}

export type OrderPricingBreakdown = ServerOrderPricingResult;

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
  productType?: PricingProductType;
}): ServerOrderPricingResult {
  if (!Number.isFinite(params.basePriceInr) || params.basePriceInr < 19) {
    throw new WebzyError('Invalid base theme price.', {
      code: 'PRICING_INVALID_BASE',
      statusCode: 400,
    });
  }

  const productType: PricingProductType = params.productType ?? 'ready_made';
  const allowedSet = new Set<AddonId>([
    ...expandThemeAddons(params.allowedAddons),
    ...params.allowedAddons,
  ]);
  if (productType === 'custom_made') {
    allowedSet.delete('lifetime');
  }

  const rawAllowed = Array.from(
    new Set(
      (params.selectedAddons ?? []).filter(
        (id): id is AddonId =>
          (productType !== 'custom_made' || id !== 'lifetime') && allowedSet.has(id as AddonId),
      ),
    ),
  );

  // Enforce mutual exclusivity for validity tiers (highest priority wins: lifetime > extend > extend_21d > extend_14d)
  const chosenValidityAddon: ValidityAddonId | undefined = (
    ['lifetime', 'extend', 'extend_21d', 'extend_14d'] as const
  ).find((vId) => rawAllowed.includes(vId));
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
  const isLifetime = chosenValidityAddon === 'lifetime';
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
    isLifetime,
    validAddonIds,
  };
}

/**
 * Evaluates whether a published site can be soft-deleted or restored within the 7-day DPDP grace window.
 */
export function evaluateSiteDeletionAndRestore(input: {
  status: string;
  deletedAt: string | null;
  deleteGraceUntil: string | null;
  expiresAt: string | null;
  isLifetime?: boolean;
  nowMs?: number;
}): {
  canSoftDelete: boolean;
  canRestore: boolean;
  reason: string;
  isSoftDeleted: boolean;
  graceRemainingDays: number;
} {
  const nowMs = input.nowMs ?? Date.now();
  const isSoftDeleted = Boolean(input.deletedAt);

  if (isSoftDeleted) {
    if (input.status === 'removed') {
      return {
        canSoftDelete: false,
        canRestore: false,
        reason: 'This site has already been permanently removed.',
        isSoftDeleted: true,
        graceRemainingDays: 0,
      };
    }

    const explicitGraceMs = input.deleteGraceUntil ? Date.parse(input.deleteGraceUntil) : NaN;
    const deletedMs = input.deletedAt ? Date.parse(input.deletedAt) : NaN;
    const graceMs = !Number.isNaN(explicitGraceMs)
      ? explicitGraceMs
      : !Number.isNaN(deletedMs)
        ? deletedMs + SITE_DELETE_GRACE_DAYS * 24 * 60 * 60 * 1000
        : NaN;

    if (!Number.isNaN(graceMs) && graceMs > nowMs) {
      const graceRemainingDays = Math.max(1, Math.ceil((graceMs - nowMs) / (24 * 60 * 60 * 1000)));
      return {
        canSoftDelete: false,
        canRestore: true,
        reason: `Site can be restored (${graceRemainingDays} day${graceRemainingDays === 1 ? '' : 's'} remaining in grace window).`,
        isSoftDeleted: true,
        graceRemainingDays,
      };
    }

    return {
      canSoftDelete: false,
      canRestore: false,
      reason: 'The 7-day restore window for this deleted site has expired.',
      isSoftDeleted: true,
      graceRemainingDays: 0,
    };
  }

  if (input.status === 'removed') {
    return {
      canSoftDelete: false,
      canRestore: false,
      reason: 'This site has already been permanently removed.',
      isSoftDeleted: false,
      graceRemainingDays: 0,
    };
  }

  return {
    canSoftDelete: true,
    canRestore: false,
    reason: 'Eligible for self-service deletion with a 7-day restore window.',
    isSoftDeleted: false,
    graceRemainingDays: 0,
  };
}

/**
 * Computes custom order slot availability from platform settings and active queue count.
 */
export function evaluateCapacitySlot(input: {
  paused: boolean;
  limit: number;
  activeCount: number;
  capacityMessage?: string;
}): {
  paused: boolean;
  limit: number;
  activeCount: number;
  remainingSlots: number;
  acceptingOrders: boolean;
  capacityMessage: string;
} {
  const limit = Math.max(0, Math.floor(Number.isFinite(input.limit) ? input.limit : 0));
  const activeCount = Math.max(
    0,
    Math.floor(Number.isFinite(input.activeCount) ? input.activeCount : 0),
  );
  const remainingSlots = input.paused ? 0 : Math.max(0, limit - activeCount);
  const acceptingOrders = !input.paused && remainingSlots > 0;
  const trimmedMsg = (input.capacityMessage || '').trim();
  const capacityMessage =
    trimmedMsg ||
    (input.paused
      ? 'Custom slots are temporarily paused while we complete active builds.'
      : acceptingOrders
        ? `${remainingSlots} custom build slot${remainingSlots === 1 ? '' : 's'} open right now.`
        : 'All custom build slots are currently full. Please check back shortly or choose a ready-made theme.');

  return {
    paused: Boolean(input.paused),
    limit,
    activeCount,
    remainingSlots,
    acceptingOrders,
    capacityMessage,
  };
}

export function formatInr(amountInr: number): string {
  return `₹${Math.round(amountInr)}`;
}

export function formatPaiseAsInr(paise: number): string {
  const inr = paise / 100;
  return Number.isInteger(inr) ? `₹${inr}` : `₹${inr.toFixed(2)}`;
}
