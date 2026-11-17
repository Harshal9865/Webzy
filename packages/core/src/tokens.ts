/**
 * Webzy Design Tokens (Section 5 of Master Build Prompt)
 * Always light; no dark mode. Mobile-first with >= 44px touch targets.
 */

export const WEBZY_COLORS = {
  backgroundWhite: '#FFFFFF',
  primary: '#E11D63',
  accent: '#F59E0B',
  ink: '#2B1B2E',
  softSurface: '#FFF5F8',
  tint: '#FFE8EF',
} as const;

export const WEBZY_FONTS = {
  heading: 'var(--font-fraunces), Georgia, serif',
  body: 'var(--font-jakarta), system-ui, -apple-system, sans-serif',
  devanagari: 'var(--font-devanagari), "Noto Sans Devanagari", system-ui, sans-serif',
} as const;

export const WEBZY_UI_CONSTANTS = {
  minTouchTargetPx: 44,
  themeCardAspectRatio: '5 / 4',
  maxReceiverPageWeightKb: 1536,
} as const;
