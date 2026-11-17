import { describe, expect, it } from 'vitest';
import {
  filterThemes,
  getActiveThemes,
  getThemeById,
  getThemesRegistrySummary,
  LAUNCH_THEMES,
  validateThemeManifest,
} from '../index';

describe('@webzy/themes Phase 1 Theme Engine', () => {
  it('ships all 9 launch theme manifests conforming to Section 12 schema', () => {
    expect(LAUNCH_THEMES.length).toBe(9);
    for (const theme of LAUNCH_THEMES) {
      expect(validateThemeManifest(theme).id).toBe(theme.id);
      expect(theme.languages).toContain('hinglish');
      expect(theme.languages).toContain('hi');
      expect(theme.languages).toContain('en');
    }
    expect(getThemesRegistrySummary().status).toBe('phase1_themes_ready');
  });

  it('respects FEATURE_MAAN_JAO flag when listing active themes', () => {
    const defaultActive = getActiveThemes({ includeMaanJao: false });
    expect(defaultActive.length).toBe(8);
    expect(defaultActive.some((t) => t.id === 'maan-jao-01')).toBe(false);

    const withMaanJao = getActiveThemes({ includeMaanJao: true });
    expect(withMaanJao.length).toBe(9);
    expect(getThemeById('maan-jao-01', { includeMaanJao: true })?.id).toBe('maan-jao-01');
  });

  it('filters by occasion, language, and maxPrice cleanly', () => {
    const under100 = filterThemes({ maxPrice: 99, includeMaanJao: false });
    expect(under100.every((t) => t.price.base <= 99)).toBe(true);
    expect(filterThemes({ occasion: 'birthday' }).length).toBe(2);
  });

  it('enforces discounted launch pricing (₹29–₹99) with valid compareAt prices', () => {
    for (const theme of LAUNCH_THEMES) {
      expect(theme.price.base).toBeGreaterThanOrEqual(29);
      expect(theme.price.base).toBeLessThanOrEqual(99);
      expect(theme.price.compareAt).toBeDefined();
      expect(theme.price.compareAt!).toBeGreaterThan(theme.price.base);
    }
  });
});
