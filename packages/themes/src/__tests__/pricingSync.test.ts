import { describe, expect, it } from 'vitest';
import {
  deriveCatalogPricingSummary,
  filterThemes,
  getActiveThemes,
  LAUNCH_THEMES,
  type ThemeManifest,
} from '../index';

function extractNumericValues(node: unknown): number[] {
  if (typeof node === 'number' && Number.isFinite(node)) {
    return [node];
  }
  if (Array.isArray(node)) {
    return node.flatMap(extractNumericValues);
  }
  if (node && typeof node === 'object') {
    return Object.values(node).flatMap(extractNumericValues);
  }
  return [];
}

describe('@webzy/themes dynamic catalog pricing sync', () => {
  it('maintains expected launch catalog counts and strict occasion separation', () => {
    expect(LAUNCH_THEMES).toHaveLength(14);

    const birthdayThemes = LAUNCH_THEMES.filter((t) => t.occasion === 'birthday');
    expect(birthdayThemes).toHaveLength(2);

    const weddingThemes = LAUNCH_THEMES.filter((t) => t.occasion === 'wedding');
    expect(weddingThemes).toHaveLength(6);
    expect(weddingThemes.every((t) => t.occasion === 'wedding')).toBe(true);

    const nonWeddingThemes = LAUNCH_THEMES.filter((t) => t.occasion !== 'wedding');
    expect(nonWeddingThemes).toHaveLength(8);
    expect(nonWeddingThemes.filter((t) => t.occasion === 'wedding')).toHaveLength(0);
    expect(nonWeddingThemes.some((t) => t.id.startsWith('wedding-'))).toBe(false);
    expect(nonWeddingThemes.every((t) => t.price.base <= 99)).toBe(true);

    const launchIds = LAUNCH_THEMES.map((t) => t.id);
    expect(launchIds).toContain('portfolio-01');
    expect(launchIds).toContain('small-business-01');
    expect(launchIds).not.toContain('our-year-01');
    expect(launchIds).not.toContain('harvest-greeting-01');
    expect(launchIds).not.toContain('business-greeting-01');

    const portfolioThemes = filterThemes({ occasion: 'portfolio', includeMaanJao: true });
    expect(portfolioThemes).toHaveLength(1);
    expect(portfolioThemes[0]?.id).toBe('portfolio-01');

    const filteredBirthdays = filterThemes({ occasion: 'birthday', includeMaanJao: true });
    expect(filteredBirthdays).toHaveLength(2);
    expect(filteredBirthdays.some((t) => t.occasion === 'wedding')).toBe(false);

    const activeAll = getActiveThemes({ includeMaanJao: true });
    expect(activeAll).toHaveLength(14);
  });

  it('derives live min/max pricing for occasions vs weddings without hardcoded constants', () => {
    const summary = deriveCatalogPricingSummary();

    expect(summary).toHaveProperty('occasions');
    expect(summary).toHaveProperty('weddings');
    expect(summary).toHaveProperty('customMade');
    expect(summary).toHaveProperty('validity');

    const nonWeddingPrices = LAUNCH_THEMES.filter((t) => t.occasion !== 'wedding').map(
      (t) => t.price.base,
    );
    const weddingPrices = LAUNCH_THEMES.filter((t) => t.occasion === 'wedding').map(
      (t) => t.price.base,
    );

    const expectedOccasionMin = Math.min(...nonWeddingPrices);
    const expectedOccasionMax = Math.max(...nonWeddingPrices);
    const expectedWeddingMin = Math.min(...weddingPrices);
    const expectedWeddingMax = Math.max(...weddingPrices);

    const occasionNums = extractNumericValues(summary.occasions);
    const weddingNums = extractNumericValues(summary.weddings);

    expect(occasionNums).toContain(expectedOccasionMin);
    expect(occasionNums).toContain(expectedOccasionMax);
    expect(weddingNums).toContain(expectedWeddingMin);
    expect(weddingNums).toContain(expectedWeddingMax);

    // Mutate a cloned copy to prove summary recomputes dynamically from theme manifests
    const clonedThemes: ThemeManifest[] = LAUNCH_THEMES.map((theme) => ({
      ...theme,
      price: { ...theme.price, addons: [...theme.price.addons] },
    }));

    for (const theme of clonedThemes) {
      if (theme.occasion !== 'wedding') {
        if (theme.price.base === expectedOccasionMin) {
          theme.price.base = 35;
        }
        if (theme.price.base === expectedOccasionMax) {
          theme.price.base = 179;
        }
      }
    }

    const firstWedding = clonedThemes.find((t) => t.occasion === 'wedding');
    const lastWedding = [...clonedThemes].reverse().find((t) => t.occasion === 'wedding');
    if (firstWedding) firstWedding.price.base = 399;
    if (lastWedding && lastWedding !== firstWedding) lastWedding.price.base = 699;

    const recomputed = deriveCatalogPricingSummary(clonedThemes);
    const recomputedOccasionNums = extractNumericValues(recomputed.occasions);
    const recomputedWeddingNums = extractNumericValues(recomputed.weddings);

    expect(recomputedOccasionNums).toContain(35);
    expect(recomputedOccasionNums).toContain(179);
    expect(recomputedOccasionNums).not.toContain(expectedOccasionMin);
    expect(recomputedOccasionNums).not.toContain(expectedOccasionMax);

    expect(recomputedWeddingNums).toContain(399);
    expect(recomputedWeddingNums).toContain(699);
    expect(recomputed).not.toEqual(summary);
  });
});
