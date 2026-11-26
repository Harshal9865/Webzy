import { ADDON_CATALOG } from '@webzy/core';
import { LAUNCH_THEMES } from './data/launchThemes';
import type { ThemeManifest } from './schema';

export interface CatalogCategoryRange {
  minInr: number;
  maxInr: number;
  compareAtMaxInr: number;
  count: number;
}

export interface CatalogPricingSummary {
  occasions: CatalogCategoryRange;
  weddings: CatalogCategoryRange;
  customMade: {
    startingInr: number;
    customWeddingStartingInr: number;
    domainPassThroughNote: string;
  };
  validity: {
    baseDays: number;
    extend14Inr: number;
    extend21Inr: number;
    lifetimeReadyMadeInr: number;
  };
}

function summarizeCategory(items: readonly ThemeManifest[]): CatalogCategoryRange {
  if (items.length === 0) {
    return { minInr: 0, maxInr: 0, compareAtMaxInr: 0, count: 0 };
  }
  let minInr = Number.POSITIVE_INFINITY;
  let maxInr = 0;
  let compareAtMaxInr = 0;

  for (const theme of items) {
    if (theme.price.base < minInr) minInr = theme.price.base;
    if (theme.price.base > maxInr) maxInr = theme.price.base;
    const compareAt = theme.price.compareAt ?? theme.price.base;
    if (compareAt > compareAtMaxInr) compareAtMaxInr = compareAt;
  }

  return {
    minInr: Number.isFinite(minInr) ? minInr : 0,
    maxInr,
    compareAtMaxInr,
    count: items.length,
  };
}

/**
 * Derives transparent storefront pricing bounds directly from active catalog theme manifests
 * and `@webzy/core` add-on rates so UI copy and server pricing stay aligned.
 */
export function deriveCatalogPricingSummary(
  themes: readonly ThemeManifest[] = LAUNCH_THEMES,
): CatalogPricingSummary {
  const occasionThemes = themes.filter((t) => t.occasion !== 'wedding');
  const weddingThemes = themes.filter((t) => t.occasion === 'wedding');

  return {
    occasions: summarizeCategory(occasionThemes),
    weddings: summarizeCategory(weddingThemes),
    customMade: {
      startingInr: 1499,
      customWeddingStartingInr: 1999,
      domainPassThroughNote: 'Optional custom domain billed at registrar actuals (~INR 699-999/yr)',
    },
    validity: {
      baseDays: 7,
      extend14Inr: ADDON_CATALOG.extend_14d.priceInr,
      extend21Inr: ADDON_CATALOG.extend_21d.priceInr,
      lifetimeReadyMadeInr: ADDON_CATALOG.lifetime.priceInr,
    },
  };
}

export function getWeddingThemePrice(themeId: string): {
  baseInr: number;
  compareAtInr: number;
} {
  const weddingThemes = LAUNCH_THEMES.filter((t) => t.occasion === 'wedding');
  const match = weddingThemes.find((t) => t.id === themeId) ?? weddingThemes[0];
  if (!match) {
    return { baseInr: 499, compareAtInr: 1499 };
  }
  return {
    baseInr: match.price.base,
    compareAtInr: match.price.compareAt ?? match.price.base,
  };
}
