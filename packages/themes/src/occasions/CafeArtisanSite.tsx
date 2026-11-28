'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import { AtmosphericGrainOverlay } from './shared/OccasionCraftPrimitives';
import { getWebzyFooterLabel, type OccasionSiteProps } from './shared/OccasionPrimitives';

export type CafeArtisanMode = 'roast' | 'maison';

type MenuCategoryKey = 'all' | 'iced' | 'milk' | 'specialty' | 'atelier';
type EventPackageKey = 'tasting' | 'wedding' | 'office';
type PairingMoodKey = 'bold' | 'velvet' | 'chilled';
type PickupSlotKey = 'now' | 'evening' | 'weekend';
type ProductArtKey =
  | 'matcha'
  | 'tonic'
  | 'caramel'
  | 'flatwhite'
  | 'pourover'
  | 'cortado'
  | 'pastry'
  | 'bouquet';

interface BaristaPairingPreset {
  key: PairingMoodKey;
  label: Record<'en' | 'hinglish' | 'hi', string>;
  vibeTag: Record<'en' | 'hinglish' | 'hi', string>;
  note: Record<'en' | 'hinglish' | 'hi', string>;
  drinkId: string;
  companionId: string;
  accentHex: string;
}

interface PickupSlotOption {
  key: PickupSlotKey;
  label: Record<'en' | 'hinglish' | 'hi', string>;
  sublabel: Record<'en' | 'hinglish' | 'hi', string>;
  waLabel: string;
}

interface HeroSlide {
  id: string;
  mode: CafeArtisanMode;
  displayWord: string;
  title: string;
  subtitle: string;
  originNote: string;
  bgHex: string;
  bgDeepHex: string;
  accentHex: string;
  pillTextHex: string;
  artType: 'matcha' | 'caramel' | 'espresso' | 'rouge' | 'botanica';
  featuredProductId: string;
}

interface CafeMenuItem {
  id: string;
  category: Exclude<MenuCategoryKey, 'all'>;
  name: string;
  notes: string;
  badge: string;
  price: number;
  compareAt?: number;
  art: ProductArtKey;
}

interface EventPackage {
  key: EventPackageKey;
  label: string;
  subtitle: string;
  guests: string;
  duration: string;
  startingPrice: number;
  inclusions: [string, string, string];
}

interface GlassPlate {
  id: string;
  src: string;
  label: string;
  caption: string;
  cropClass: string;
}

const MAISON_KEYWORDS = new Set([
  'maison',
  'rouge',
  'floral',
  'flower',
  'flowers',
  'atelier',
  'botanical',
  'botanica',
  'rose',
  'roses',
  'patisserie',
  'luxury',
  'bouquet',
]);

export function resolveCafeArtisanMode(relation?: string): CafeArtisanMode {
  const normalized = (relation ?? '').trim().toLowerCase();
  if (!normalized) return 'roast';
  if (MAISON_KEYWORDS.has(normalized)) return 'maison';
  for (const kw of MAISON_KEYWORDS) {
    if (normalized.includes(kw)) return 'maison';
  }
  return 'roast';
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

function extractMonogram(name: string): string {
  const words = name
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return 'RC';
}

function hiSafeStyle(language: string): React.CSSProperties | undefined {
  if (language === 'hi') {
    return { fontStyle: 'normal', letterSpacing: '0em' };
  }
  return undefined;
}

const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: 'matcha',
    mode: 'roast',
    displayWord: 'MATCHA',
    title: 'Ceremonial Uji Matcha Whip',
    subtitle: 'Stone-milled Kyoto first harvest whisked over chilled oat milk & vanilla cream.',
    originNote: 'Uji, Kyoto · Harvest 01',
    bgHex: '#9DB038',
    bgDeepHex: '#6F801F',
    accentHex: '#183A26',
    pillTextHex: '#F7FAF0',
    artType: 'matcha',
    featuredProductId: 'cf-1',
  },
  {
    id: 'caramel',
    mode: 'roast',
    displayWord: 'CARAMEL',
    title: 'Salted Jaggery Caramel Cloud',
    subtitle: 'Double ristretto layered through slow-ambered caramel cream & toasted milk foam.',
    originNote: 'Coorg Estate · Medium Roast',
    bgHex: '#C48347',
    bgDeepHex: '#8E5322',
    accentHex: '#3A1D0E',
    pillTextHex: '#FFF8F0',
    artType: 'caramel',
    featuredProductId: 'cf-3',
  },
  {
    id: 'espresso',
    mode: 'roast',
    displayWord: 'ESPRESSO',
    title: '72-Hour Cold Brew Reserve',
    subtitle: 'Single-estate dark cocoa arabica steeped slowly for velvety body & bright citrus finish.',
    originNote: 'Chikmagalur · High Elevation',
    bgHex: '#5A3422',
    bgDeepHex: '#361C11',
    accentHex: '#E8B87D',
    pillTextHex: '#2A140B',
    artType: 'espresso',
    featuredProductId: 'cf-2',
  },
  {
    id: 'rouge',
    mode: 'maison',
    displayWord: 'ROUGE',
    title: 'Maison Rouge Floral Atelier',
    subtitle: 'Sculptural white ranunculus & velvet garden roses curated beside small-batch pours.',
    originNote: 'Atelier Edit · Cut Daily',
    bgHex: '#590C15',
    bgDeepHex: '#35050B',
    accentHex: '#F5E4D3',
    pillTextHex: '#460810',
    artType: 'rouge',
    featuredProductId: 'cf-8',
  },
  {
    id: 'botanica',
    mode: 'maison',
    displayWord: 'BOTANICA',
    title: 'Rose & Patisserie Conservatory',
    subtitle: 'Damask rose infusions, laminated butter pastries & hand-tied botanical stems.',
    originNote: 'Conservatory · Limited Run',
    bgHex: '#2E4232',
    bgDeepHex: '#1A281D',
    accentHex: '#F2DCC6',
    pillTextHex: '#1F2F22',
    artType: 'botanica',
    featuredProductId: 'cf-7',
  },
];

const MENU_ITEMS: readonly CafeMenuItem[] = [
  {
    id: 'cf-1',
    category: 'specialty',
    name: 'Ceremonial Iced Matcha',
    notes: 'First-harvest Uji matcha, chilled oat milk, whipped vanilla cap',
    badge: 'House Signature',
    price: 340,
    compareAt: 390,
    art: 'matcha',
  },
  {
    id: 'cf-2',
    category: 'iced',
    name: 'Cold Brew Espresso Tonic',
    notes: '72h Chikmagalur single origin, botanical tonic, blood orange zest',
    badge: 'Iced Pour',
    price: 260,
    art: 'tonic',
  },
  {
    id: 'cf-3',
    category: 'milk',
    name: 'Salted Caramel Cloud Latte',
    notes: 'Double espresso, burnt jaggery caramel cream, sea salt finish',
    badge: 'Best Seller',
    price: 290,
    compareAt: 340,
    art: 'caramel',
  },
  {
    id: 'cf-4',
    category: 'milk',
    name: 'Velvet Microfoam Flat White',
    notes: 'Silky steamed milk over dark cocoa & roasted hazelnut espresso',
    badge: 'Classic Bar',
    price: 240,
    art: 'flatwhite',
  },
  {
    id: 'cf-5',
    category: 'iced',
    name: 'Iced Estate Pour-Over',
    notes: 'Washed Malabar arabica brewed over crystal ice, jasmine & peach',
    badge: 'Single Origin',
    price: 220,
    art: 'pourover',
  },
  {
    id: 'cf-6',
    category: 'specialty',
    name: 'Rose Cardamom Cortado',
    notes: 'Damask rose nectar, freshly crushed green cardamom, ristretto',
    badge: 'Atelier Blend',
    price: 280,
    art: 'cortado',
  },
  {
    id: 'cf-7',
    category: 'atelier',
    name: 'Artisan Croissant & Tart Box',
    notes: 'French butter croissants, pistachio cream & dark ganache pair',
    badge: 'Baked Dawn',
    price: 580,
    compareAt: 680,
    art: 'pastry',
  },
  {
    id: 'cf-8',
    category: 'atelier',
    name: 'Maison Rouge Posy Bouquet',
    notes: 'Hand-tied white ranunculus, crimson garden roses, silk ribbon',
    badge: 'Floral Edit',
    price: 1490,
    compareAt: 1790,
    art: 'bouquet',
  },
];

const SEASONAL_DROP_ITEM: CafeMenuItem = {
  id: 'cf-drop-coconut',
  category: 'iced',
  name: 'Coconut Iced Latte (Seasonal Drop)',
  notes: 'Chilled cold brew, tender coconut cream, oat milk & 3 house syrups',
  badge: '20% Launch Offer',
  price: 280,
  compareAt: 350,
  art: 'caramel',
};

const ALL_CATALOG_ITEMS: readonly CafeMenuItem[] = [...MENU_ITEMS, SEASONAL_DROP_ITEM];

const EVENT_PACKAGES: readonly EventPackage[] = [
  {
    key: 'tasting',
    label: 'Private Tasting',
    subtitle: 'Guided 5-pour single-origin flight paired with warm laminated pastries & table florals.',
    guests: '6 to 20 Guests',
    duration: '2.5 Hours · Seated Table',
    startingPrice: 12500,
    inclusions: ['5 Single-Origin Flights', 'Artisanal Pastry Pairing', 'Printed Tasting Menus'],
  },
  {
    key: 'wedding',
    label: 'Wedding Floral Bar',
    subtitle: 'Bespoke bloom-wrapping conservatory station beside a live specialty espresso & matcha cart.',
    guests: '40 to 180 Guests',
    duration: '4 Hours · Full Service',
    startingPrice: 28000,
    inclusions: ['Live Bouquet Wrapping', 'Signature Couple Drink', 'Linen Scalloped Signage'],
  },
  {
    key: 'office',
    label: 'Office Coffee Cart',
    subtitle: 'Mobile marble barista counter serving iced lattes, ceremonial matcha & cold brews on-site.',
    guests: '25 to 120 Guests',
    duration: '3 Hours · Barista Team',
    startingPrice: 16500,
    inclusions: ['2 Dedicated Baristas', 'Custom Branded Cups', 'Oat & Dairy Milk Bar'],
  },
];

const CATEGORY_TABS: ReadonlyArray<{ key: MenuCategoryKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'iced', label: 'Iced Coffee' },
  { key: 'milk', label: 'Milk-Based' },
  { key: 'specialty', label: 'Specialty' },
  { key: 'atelier', label: 'Pastries & Blooms' },
];

const BARISTA_PAIRINGS: readonly BaristaPairingPreset[] = [
  {
    key: 'bold',
    label: {
      en: 'Bold & Spiced',
      hinglish: 'Bold & Spiced',
      hi: 'बोल्ड और मसालेदार',
    },
    vibeTag: {
      en: 'ROAST + WARM BUTTER PASTRY',
      hinglish: 'ROAST + WARM BUTTER PASTRY',
      hi: 'रोस्ट और बटर पेस्ट्री जोड़ी',
    },
    note: {
      en: '72-hour Chikmagalur espresso tonic bright with blood orange zest, balanced beside flaky French butter croissants.',
      hinglish: '72-hour espresso tonic aur blood orange zest ke saath garma-garam French butter croissant box.',
      hi: '72-घंटे के एस्प्रेसो टॉनिक और ब्लड ऑरेंज ज़ेस्ट के साथ ताज़ा फ्रेंच बटर क्रॉइसैन बॉक्स।',
    },
    drinkId: 'cf-2',
    companionId: 'cf-7',
    accentHex: '#5A3422',
  },
  {
    key: 'velvet',
    label: {
      en: 'Velvet & Floral',
      hinglish: 'Velvet & Floral',
      hi: 'मखमली और पुष्प',
    },
    vibeTag: {
      en: 'ROSE CORTADO + ATELIER POSY',
      hinglish: 'ROSE CORTADO + ATELIER POSY',
      hi: 'रोज़ कॉर्टाडो और गुलदस्ता',
    },
    note: {
      en: 'Damask rose and crushed green cardamom ristretto paired with our hand-tied white ranunculus & crimson rose posy.',
      hinglish: 'Damask rose cardamom cortado ke saath hand-tied ranunculus aur crimson rose bouquet.',
      hi: 'दमिश्क गुलाब और इलायची कॉर्टाडो के साथ हस्तनिर्मित गुलदस्ता।',
    },
    drinkId: 'cf-6',
    companionId: 'cf-8',
    accentHex: '#590C15',
  },
  {
    key: 'chilled',
    label: {
      en: 'Chilled Ceremonial',
      hinglish: 'Chilled Ceremonial',
      hi: 'ठंडा सेरेमोनियल माचा',
    },
    vibeTag: {
      en: 'UJI MATCHA + PISTACHIO PASTRY',
      hinglish: 'UJI MATCHA + PISTACHIO PASTRY',
      hi: 'उजी माचा और पिस्ता पेस्ट्री',
    },
    note: {
      en: 'First-harvest Kyoto Uji matcha whisked over chilled oat milk, paired with Dawn-baked pistachio cream pastries.',
      hinglish: 'Kyoto Uji iced matcha aur chilled oat milk ke saath pistachio cream & dark ganache pastry box.',
      hi: 'क्योटो उजी आइस्ड माचा और ओट मिल्क के साथ पिस्ता क्रीम पेस्ट्री बॉक्स।',
    },
    drinkId: 'cf-1',
    companionId: 'cf-7',
    accentHex: '#5D6E22',
  },
];

const PICKUP_SLOTS: readonly PickupSlotOption[] = [
  {
    key: 'now',
    label: {
      en: 'Now / 20 mins',
      hinglish: 'Abhi / 20 mins',
      hi: 'अभी / 20 मिनट',
    },
    sublabel: {
      en: 'Express Bar Pickup',
      hinglish: 'Express Bar Pickup',
      hi: 'तुरंत पिकअप',
    },
    waLabel: 'Now / 20 mins (Express Bar Pickup)',
  },
  {
    key: 'evening',
    label: {
      en: 'Today Evening',
      hinglish: 'Aaj Shaam',
      hi: 'आज शाम',
    },
    sublabel: {
      en: '5:00 PM — 8:30 PM',
      hinglish: '5:00 PM — 8:30 PM',
      hi: 'शाम 5:00 — 8:30',
    },
    waLabel: 'Today Evening (5:00 PM - 8:30 PM)',
  },
  {
    key: 'weekend',
    label: {
      en: 'Weekend Tasting',
      hinglish: 'Weekend Tasting',
      hi: 'वीकेंड टेस्टिंग',
    },
    sublabel: {
      en: 'Sat / Sun Table',
      hinglish: 'Sat / Sun Table',
      hi: 'शनि / रवि टेबल',
    },
    waLabel: 'Weekend Tasting Table (Sat / Sun)',
  },
];

const CAFE_SITE_CSS = `
.wz-cafe-root {
  container-type: inline-size;
  container-name: cafe-shell;
}
.wz-cafe-hero-word {
  font-size: clamp(4.75rem, 25cqi, 13.5rem);
  line-height: 0.82;
  letter-spacing: 0.015em;
}
.wz-cafe-stage {
  min-height: 320px;
  padding-top: 1.5rem;
}
.wz-cafe-centerpiece {
  height: 242px;
  width: 202px;
  margin-bottom: -1.5rem;
}
.wz-cafe-hero-copy {
  text-align: center;
}
.wz-cafe-hero-bottom {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  align-items: center;
}
.wz-cafe-flute-box {
  aspect-ratio: 16 / 11;
}
.wz-cafe-editorial-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
  align-items: center;
}
.wz-cafe-story-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.625rem;
}
.wz-cafe-triptych {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.625rem;
}
.wz-cafe-menu-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}
.wz-cafe-drop-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
  align-items: center;
}
.wz-cafe-events-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
  align-items: center;
}
.wz-cafe-pairing-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  align-items: center;
}
.wz-cafe-section-px {
  padding-left: 1rem;
  padding-right: 1rem;
}
.wz-cafe-nav-links {
  display: none;
}
.wz-cafe-side-cup {
  display: none;
}
@container cafe-shell (min-width: 560px) {
  .wz-cafe-hero-word {
    font-size: clamp(6.5rem, 23cqi, 14rem);
  }
  .wz-cafe-stage {
    min-height: 410px;
    padding-top: 2rem;
  }
  .wz-cafe-centerpiece {
    height: 306px;
    width: 256px;
    margin-bottom: -2rem;
  }
  .wz-cafe-flute-box {
    aspect-ratio: 16 / 9;
  }
  .wz-cafe-story-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .wz-cafe-menu-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }
  .wz-cafe-drop-grid {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    gap: 2rem;
  }
  .wz-cafe-pairing-grid {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    gap: 1.5rem;
  }
  .wz-cafe-section-px {
    padding-left: 1.75rem;
    padding-right: 1.75rem;
  }
  .wz-cafe-side-cup {
    display: block;
  }
}
@container cafe-shell (min-width: 780px) {
  .wz-cafe-nav-links {
    display: flex;
  }
  .wz-cafe-hero-copy {
    text-align: left;
  }
  .wz-cafe-hero-bottom {
    grid-template-columns: minmax(0, 1.15fr) auto minmax(0, 1fr);
    gap: 1.5rem;
  }
  .wz-cafe-editorial-split {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    gap: 2.5rem;
  }
  .wz-cafe-triptych {
    gap: 1rem;
  }
  .wz-cafe-menu-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1.125rem;
  }
  .wz-cafe-events-grid {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    gap: 2rem;
  }
}
@keyframes wzCafeSpringEnter {
  0% {
    opacity: 0;
    transform: translate3d(0, 26px, 0) scale(0.92);
  }
  60% {
    opacity: 1;
    transform: translate3d(0, -5px, 0) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}
@keyframes wzCafeWordReveal {
  0% {
    opacity: 0;
    transform: translate3d(0, 18px, 0) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}
@keyframes wzCafeOrbitFloatA {
  0%, 100% {
    transform: translate3d(0, 0, 0) rotate(-6deg);
  }
  50% {
    transform: translate3d(0, -10px, 0) rotate(5deg);
  }
}
@keyframes wzCafeOrbitFloatB {
  0%, 100% {
    transform: translate3d(0, 0, 0) rotate(8deg);
  }
  50% {
    transform: translate3d(0, 9px, 0) rotate(-7deg);
  }
}
@keyframes wzCafeMarquee {
  0% {
    transform: translate3d(0%, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}
.wz-cafe-spring-in {
  animation: wzCafeSpringEnter 0.62s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.wz-cafe-word-in {
  animation: wzCafeWordReveal 0.52s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.wz-cafe-float-a {
  animation: wzCafeOrbitFloatA 4.6s ease-in-out infinite;
}
.wz-cafe-float-b {
  animation: wzCafeOrbitFloatB 5.4s ease-in-out infinite;
}
.wz-cafe-marquee-track {
  display: flex;
  width: max-content;
  animation: wzCafeMarquee 26s linear infinite;
}
.wz-cafe-marquee-wrap:hover .wz-cafe-marquee-track {
  animation-play-state: paused;
}
.wz-cafe-fluted-curtain {
  backdrop-filter: blur(6px) saturate(118%);
  -webkit-backdrop-filter: blur(6px) saturate(118%);
  background-image:
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.32) 0px,
      rgba(255, 255, 255, 0.08) 3px,
      rgba(255, 248, 242, 0.02) 8px,
      rgba(44, 5, 10, 0.16) 13px,
      rgba(255, 255, 255, 0.24) 16px,
      rgba(26, 2, 6, 0.36) 17px,
      rgba(255, 255, 255, 0.32) 18px
    ),
    repeating-linear-gradient(
      180deg,
      transparent 0px,
      transparent 98px,
      rgba(255, 245, 238, 0.16) 98px,
      rgba(255, 245, 238, 0.16) 100px
    );
}
.wz-cafe-linen-texture {
  background-color: #F4EDE2;
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(138, 104, 78, 0.04) 0px,
      rgba(138, 104, 78, 0.04) 1px,
      transparent 1px,
      transparent 5px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(138, 104, 78, 0.04) 0px,
      rgba(138, 104, 78, 0.04) 1px,
      transparent 1px,
      transparent 5px
    );
}
@media (prefers-reduced-motion: reduce) {
  .wz-cafe-spring-in,
  .wz-cafe-word-in,
  .wz-cafe-float-a,
  .wz-cafe-float-b,
  .wz-cafe-marquee-track {
    animation: none !important;
  }
}
`;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', sync);
      return () => mq.removeEventListener('change', sync);
    }
    return undefined;
  }, []);

  return reduced;
}

/** Sculptural 3D-shaded Arabica roasted coffee bean SVG for kinetic hero parallax. */
function RoastedBeanSvg({ uid, variant = 0 }: { uid: string; variant?: number }) {
  const gradId = `bean-grad-${uid}-${variant}`;
  return (
    <svg viewBox="0 0 64 46" className="h-full w-full drop-shadow-[0_14px_18px_rgba(24,11,5,0.42)]" aria-hidden="true">
      <defs>
        <radialGradient id={gradId} cx="36%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#8A5133" />
          <stop offset="48%" stopColor="#532B19" />
          <stop offset="100%" stopColor="#261108" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="23" rx="28" ry="19" fill={`url(#${gradId})`} />
      <ellipse cx="24" cy="14" rx="12" ry="5" fill="#C9946C" fillOpacity="0.24" transform="rotate(-12 24 14)" />
      <path
        d="M8 24 C19 18, 28 29, 36 22 C44 16, 51 24, 56 22"
        fill="none"
        stroke="#1C0B05"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M10 25 C20 20, 28 30, 36 23 C44 18, 50 25, 55 23"
        fill="none"
        stroke="#A56A43"
        strokeOpacity="0.45"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Velvety curved silk rose petal SVG for Maison Rouge kinetic hero parallax. */
function SilkPetalSvg({ uid, variant = 0 }: { uid: string; variant?: number }) {
  const gradId = `petal-grad-${uid}-${variant}`;
  const isIvory = variant % 2 === 1;
  return (
    <svg viewBox="0 0 64 56" className="h-full w-full drop-shadow-[0_14px_20px_rgba(32,4,8,0.42)]" aria-hidden="true">
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="72%">
          <stop offset="0%" stopColor={isIvory ? '#FFFDF9' : '#D94359'} />
          <stop offset="55%" stopColor={isIvory ? '#F1DFD1' : '#8C1527'} />
          <stop offset="100%" stopColor={isIvory ? '#C9A89B' : '#430610'} />
        </radialGradient>
      </defs>
      <path
        d="M32 50 C14 44, 6 27, 13 13 C18 4, 29 8, 33 15 C38 6, 50 5, 54 15 C59 29, 49 45, 32 50 Z"
        fill={`url(#${gradId})`}
      />
      <path
        d="M32 45 C27 34, 25 25, 29 17"
        fill="none"
        stroke={isIvory ? '#FFFFFF' : '#F8A4B3'}
        strokeOpacity="0.35"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Hero flagship centerpiece: studio-lit iced beverage cup or Maison Rouge sculptural bloom vessel. */
function HeroCenterpieceArtwork({
  slide,
  brandTitle,
  monogram,
  uid,
}: {
  slide: HeroSlide;
  brandTitle: string;
  monogram: string;
  uid: string;
}) {
  const shortBadge = brandTitle.slice(0, 12).toUpperCase();

  if (slide.artType === 'rouge' || slide.artType === 'botanica') {
    const isRouge = slide.artType === 'rouge';
    return (
      <svg
        viewBox="0 0 280 330"
        className="h-full w-full drop-shadow-[0_28px_36px_rgba(18,3,6,0.48)]"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`hero-arch-${uid}-${slide.id}`} cx="50%" cy="36%" r="65%">
            <stop offset="0%" stopColor={isRouge ? '#7A1622' : '#44634A'} />
            <stop offset="70%" stopColor={isRouge ? '#490911' : '#233627'} />
            <stop offset="100%" stopColor={isRouge ? '#290308' : '#142017'} />
          </radialGradient>
          <radialGradient id={`hero-bloom-white-${uid}-${slide.id}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#F4E9DF" />
            <stop offset="100%" stopColor="#CBB6A7" />
          </radialGradient>
          <radialGradient id={`hero-bloom-rose-${uid}-${slide.id}`} cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#E1495E" />
            <stop offset="60%" stopColor="#8E1224" />
            <stop offset="100%" stopColor="#44050E" />
          </radialGradient>
          <linearGradient id={`hero-vase-${uid}-${slide.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EADBD0" />
            <stop offset="48%" stopColor="#FFFDFB" />
            <stop offset="100%" stopColor="#C8B1A0" />
          </linearGradient>
        </defs>

        {/* Sculptural arched glass sanctuary frame */}
        <path
          d="M36 308 V126 C36 60 82 18 140 18 C198 18 244 60 244 126 V308 Z"
          fill={`url(#hero-arch-${uid}-${slide.id})`}
          stroke="#F7E7DA"
          strokeOpacity="0.65"
          strokeWidth="2"
        />
        <path
          d="M46 298 V128 C46 68 88 28 140 28 C192 28 234 68 234 128 V298 Z"
          fill="none"
          stroke="#F7E7DA"
          strokeOpacity="0.22"
          strokeWidth="1"
        />

        {/* Delicate eucalyptus & stem sprays */}
        <g stroke={isRouge ? '#89A67E' : '#B7D3A8'} strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M140 225 C128 182, 108 148, 86 112" />
          <path d="M140 225 C140 172, 144 128, 152 78" />
          <path d="M140 225 C156 184, 180 156, 200 124" />
          <path d="M140 225 C124 196, 114 176, 98 158" />
        </g>

        {/* Botanical leaves */}
        <g fill={isRouge ? '#5E7C56' : '#7CA372'}>
          <ellipse cx="98" cy="144" rx="14" ry="7" transform="rotate(-34 98 144)" />
          <ellipse cx="188" cy="150" rx="14" ry="7" transform="rotate(30 188 150)" />
          <ellipse cx="118" cy="176" rx="12" ry="6" transform="rotate(-20 118 176)" />
          <ellipse cx="168" cy="178" rx="12" ry="6" transform="rotate(24 168 178)" />
        </g>

        {/* Layered sculptural ranunculus & velvet garden blooms */}
        {[
          { cx: 146, cy: 96, r: 36, rose: false },
          { cx: 96, cy: 136, r: 30, rose: !isRouge },
          { cx: 186, cy: 138, r: 31, rose: isRouge },
          { cx: 136, cy: 156, r: 34, rose: false },
          { cx: 170, cy: 184, r: 24, rose: true },
        ].map((bloom, idx) => (
          <g key={`hero-bloom-${idx}`}>
            <circle
              cx={bloom.cx}
              cy={bloom.cy}
              r={bloom.r}
              fill={`url(#${bloom.rose ? `hero-bloom-rose-${uid}-${slide.id}` : `hero-bloom-white-${uid}-${slide.id}`})`}
            />
            <circle
              cx={bloom.cx}
              cy={bloom.cy}
              r={bloom.r * 0.72}
              fill="none"
              stroke={bloom.rose ? '#F7A8B6' : '#CBB3A2'}
              strokeOpacity="0.55"
              strokeWidth="1.5"
              strokeDasharray="16 6"
            />
            <circle
              cx={bloom.cx}
              cy={bloom.cy}
              r={bloom.r * 0.44}
              fill="none"
              stroke={bloom.rose ? '#FFD5DC' : '#B59886'}
              strokeOpacity="0.65"
              strokeWidth="1.5"
              strokeDasharray="10 4"
            />
            <circle
              cx={bloom.cx}
              cy={bloom.cy}
              r={bloom.r * 0.19}
              fill={bloom.rose ? '#5A0815' : '#DFC7B5'}
            />
          </g>
        ))}

        {/* Ceramic fluted porcelain vase */}
        <path
          d="M96 208 H184 L174 288 C172 296 158 302 140 302 C122 302 108 296 106 288 Z"
          fill={`url(#hero-vase-${uid}-${slide.id})`}
        />
        {[110, 122, 134, 146, 158, 170].map((x) => (
          <line key={x} x1={x} y1="212" x2={x - (x - 140) * 0.12} y2="294" stroke="#B79E8D" strokeOpacity="0.38" strokeWidth="1.4" />
        ))}
        {/* Satin ribbon & crest seal around vase */}
        <rect x="98" y="238" width="84" height="14" rx="2" fill={isRouge ? '#6E101D' : '#2C4430'} />
        <circle cx="140" cy="245" r="19" fill={isRouge ? '#590C15' : '#1E3022'} stroke="#F4DEC8" strokeWidth="1.8" />
        <text
          x="140"
          y="249"
          textAnchor="middle"
          fill="#FAF3EC"
          fontSize="11"
          fontWeight="700"
          letterSpacing="1.4"
          fontFamily="Georgia, serif"
        >
          {monogram}
        </text>
      </svg>
    );
  }

  const drinkColors =
    slide.artType === 'matcha'
      ? {
          top: '#E5EBC1',
          mid: '#9FB63D',
          bot: '#586D18',
          straw: '#14532D',
          dust: '#65801E',
          badgeBg: '#193C25',
          badgeRing: '#E9F5D0',
        }
      : slide.artType === 'caramel'
        ? {
            top: '#F7E7D4',
            mid: '#C98344',
            bot: '#6E3814',
            straw: '#7C2D12',
            dust: '#B45309',
            badgeBg: '#3D1E10',
            badgeRing: '#FDE6C4',
          }
        : {
            top: '#C79B74',
            mid: '#6B3B24',
            bot: '#2B140A',
            straw: '#1C1412',
            dust: '#451A03',
            badgeBg: '#23120B',
            badgeRing: '#E8C59E',
          };

  return (
    <svg
      viewBox="0 0 280 340"
      className="h-full w-full drop-shadow-[0_28px_36px_rgba(24,14,6,0.36)]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`drink-fill-${uid}-${slide.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={drinkColors.top} />
          <stop offset="46%" stopColor={drinkColors.mid} />
          <stop offset="100%" stopColor={drinkColors.bot} />
        </linearGradient>
        <linearGradient id={`cup-gloss-${uid}-${slide.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.42" />
          <stop offset="18%" stopColor="#FFFFFF" stopOpacity="0.06" />
          <stop offset="82%" stopColor="#FFFFFF" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.34" />
        </linearGradient>
        <linearGradient id={`cream-dome-${uid}-${slide.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF8" />
          <stop offset="65%" stopColor="#F5ECD8" />
          <stop offset="100%" stopColor="#E4D4BA" />
        </linearGradient>
      </defs>

      {/* Angled specialty straw */}
      <g transform="rotate(8 144 82)">
        <rect x="137" y="14" width="14" height="104" rx="4" fill={drinkColors.straw} />
        <rect x="140" y="16" width="3.5" height="92" rx="2" fill="#FFFFFF" fillOpacity="0.28" />
      </g>

      {/* Sculpted whipped cream crown */}
      <path
        d="M78 126 C78 102, 95 92, 108 92 C111 76, 126 66, 140 66 C154 66, 169 76, 172 92 C185 92, 202 102, 202 126 Z"
        fill={`url(#cream-dome-${uid}-${slide.id})`}
      />
      {/* Whipped cream swirl ridges */}
      <path
        d="M90 118 C112 104, 166 104, 190 118"
        fill="none"
        stroke="#D8C5A7"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M104 100 C124 88, 156 88, 176 100"
        fill="none"
        stroke="#DFCEB3"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M120 84 C132 76, 148 76, 160 84"
        fill="none"
        stroke="#E6D8C0"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Matcha powder / caramel / cacao garnish specks */}
      {[
        [114, 98],
        [128, 86],
        [144, 80],
        [158, 92],
        [136, 104],
        [168, 108],
        [102, 112],
        [150, 112],
      ].map(([cx, cy], idx) => (
        <circle key={`dust-${idx}`} cx={cx} cy={cy} r={idx % 2 === 0 ? 2.4 : 1.7} fill={drinkColors.dust} fillOpacity="0.78" />
      ))}

      {/* Tapered crystal cup body */}
      <path
        d="M74 128 H206 L186 304 C184 316 164 322 140 322 C116 322 96 316 94 304 Z"
        fill={`url(#drink-fill-${uid}-${slide.id})`}
      />

      {/* Organic milk-espresso marbled ribbons inside glass */}
      <path
        d="M80 172 C104 188, 130 156, 158 176 C176 188, 190 174, 199 164 L196 196 C176 208, 150 186, 128 202 C104 218, 90 198, 83 192 Z"
        fill="#FFFBF2"
        fillOpacity="0.32"
      />
      <path
        d="M88 228 C116 244, 144 212, 172 232 C182 239, 189 234, 193 229 L190 254 C168 264, 142 244, 118 258 C104 266, 95 258, 91 254 Z"
        fill={drinkColors.bot}
        fillOpacity="0.28"
      />

      {/* Translucent floating ice cubes */}
      <rect x="96" y="142" width="24" height="22" rx="5" fill="#FFFFFF" fillOpacity="0.24" stroke="#FFFFFF" strokeOpacity="0.35" transform="rotate(-11 108 153)" />
      <rect x="158" y="140" width="22" height="20" rx="5" fill="#FFFFFF" fillOpacity="0.22" stroke="#FFFFFF" strokeOpacity="0.32" transform="rotate(14 169 150)" />
      <rect x="128" y="150" width="22" height="20" rx="5" fill="#FFFFFF" fillOpacity="0.18" transform="rotate(4 139 160)" />

      {/* Cup crystal lip & specular glass overlay */}
      <path
        d="M74 128 H206 L186 304 C184 316 164 322 140 322 C116 322 96 316 94 304 Z"
        fill={`url(#cup-gloss-${uid}-${slide.id})`}
        stroke="#FFFFFF"
        strokeOpacity="0.45"
        strokeWidth="1.5"
      />
      <rect x="68" y="122" width="144" height="10" rx="5" fill="#FFFFFF" fillOpacity="0.82" />
      <path d="M90 144 L102 296" stroke="#FFFFFF" strokeOpacity="0.38" strokeWidth="4" strokeLinecap="round" />

      {/* Embossed circular café medallion */}
      <circle cx="140" cy="224" r="37" fill={drinkColors.badgeBg} stroke={drinkColors.badgeRing} strokeWidth="2.4" />
      <circle cx="140" cy="224" r="31" fill="none" stroke={drinkColors.badgeRing} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 3" />
      <ellipse cx="140" cy="206" rx="5.5" ry="7.5" fill={drinkColors.badgeRing} />
      <path d="M140 199 C139 204, 141 208, 140 213" stroke={drinkColors.badgeBg} strokeWidth="1.3" fill="none" />
      <text
        x="140"
        y="229"
        textAnchor="middle"
        fill={drinkColors.badgeRing}
        fontSize="9.5"
        fontWeight="800"
        letterSpacing="1.2"
        fontFamily="system-ui, sans-serif"
      >
        {shortBadge}
      </text>
      <text
        x="140"
        y="242"
        textAnchor="middle"
        fill={drinkColors.badgeRing}
        fillOpacity="0.72"
        fontSize="7"
        fontWeight="700"
        letterSpacing="1.6"
        fontFamily="ui-monospace, monospace"
      >
        {monogram} · EST.
      </text>
    </svg>
  );
}

/** Subtle depth-flanking companion cups peeking up along the curved bottom wave (Coffee & Co. signature). */
function FlankingMiniCupSvg({ tone, strawColor }: { tone: string; strawColor: string }) {
  return (
    <svg viewBox="0 0 110 120" className="h-full w-full" aria-hidden="true">
      <rect x="52" y="10" width="7" height="36" rx="3" fill={strawColor} transform="rotate(6 55 28)" />
      <path d="M24 58 C24 42, 37 33, 55 33 C73 33, 86 42, 86 58 Z" fill="#FAF2E4" />
      <path d="M34 50 C44 43, 66 43, 76 50" stroke="#DFCBB0" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="20" y="55" width="70" height="7" rx="3.5" fill="#FFFFFF" fillOpacity="0.88" />
      <path d="M24 62 H86 L80 116 H30 Z" fill={tone} />
      <path d="M24 62 H86 L80 116 H30 Z" fill="#FFFFFF" fillOpacity="0.16" />
    </svg>
  );
}

/** Crisp Drinko-inspired studio product illustration for each of the 8 menu items. */
function MenuItemArtSvg({ art, uid }: { art: ProductArtKey; uid: string }) {
  return (
    <svg viewBox="0 0 180 164" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={`plate-glow-${art}-${uid}`} cx="50%" cy="46%" r="58%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F5EFE7" />
        </radialGradient>
      </defs>
      <rect width="180" height="164" fill={`url(#plate-glow-${art}-${uid})`} />
      {/* Soft contact shadow */}
      <ellipse cx="90" cy="144" rx="44" ry="8" fill="#2A170D" fillOpacity="0.13" />

      {art === 'matcha' ? (
        <g>
          <rect x="94" y="16" width="7" height="44" rx="3" fill="#166534" transform="rotate(9 97 38)" />
          <path d="M58 50 H122 L112 138 C111 143 102 146 90 146 C78 146 69 143 68 138 Z" fill="#9BB338" />
          <path d="M58 50 H122 L118 86 C106 94 74 94 62 86 Z" fill="#F2F0E4" />
          <path d="M62 82 C78 96, 102 74, 118 88 L116 104 C100 94, 78 112, 64 100 Z" fill="#C4D66B" fillOpacity="0.65" />
          <rect x="70" y="60" width="14" height="12" rx="3" fill="#FFFFFF" fillOpacity="0.45" transform="rotate(-8 77 66)" />
          <rect x="96" y="64" width="13" height="11" rx="3" fill="#FFFFFF" fillOpacity="0.4" transform="rotate(12 102 69)" />
          <rect x="54" y="45" width="72" height="7" rx="3.5" fill="#FFFFFF" stroke="#E4DDD2" strokeWidth="1" />
          <path d="M66 58 L72 132" stroke="#FFFFFF" strokeOpacity="0.48" strokeWidth="3" strokeLinecap="round" />
        </g>
      ) : art === 'tonic' ? (
        <g>
          <path d="M58 46 H122 L114 138 C113 143 103 146 90 146 C77 146 67 143 66 138 Z" fill="#3B1D12" />
          <path d="M62 88 H118 L114 138 C113 143 103 146 90 146 C77 146 67 143 66 138 Z" fill="#D89A56" fillOpacity="0.82" />
          <circle cx="78" cy="116" r="2.2" fill="#FFFDF7" fillOpacity="0.65" />
          <circle cx="98" cy="124" r="1.8" fill="#FFFDF7" fillOpacity="0.6" />
          <circle cx="104" cy="104" r="2.4" fill="#FFFDF7" fillOpacity="0.55" />
          <rect x="68" y="56" width="18" height="16" rx="4" fill="#FFF8EC" fillOpacity="0.26" transform="rotate(-10 77 64)" />
          <rect x="94" y="60" width="18" height="16" rx="4" fill="#FFF8EC" fillOpacity="0.22" transform="rotate(12 103 68)" />
          {/* Blood orange twist garnish */}
          <path d="M98 44 C106 32, 122 36, 120 48 C118 54, 108 54, 104 49" fill="#EA580C" stroke="#FDBA74" strokeWidth="2" />
          <rect x="54" y="42" width="72" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.85" stroke="#E2D9CE" strokeWidth="1" />
        </g>
      ) : art === 'caramel' ? (
        <g>
          <path d="M64 56 C64 40, 76 32, 90 32 C104 32, 116 40, 116 56 Z" fill="#FFFBF3" />
          <path d="M70 46 C82 38, 98 38, 110 46" fill="none" stroke="#C47934" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M58 56 H122 L113 138 C112 143 102 146 90 146 C78 146 68 143 67 138 Z" fill="#C67E3F" />
          <path d="M60 72 C76 86, 102 68, 120 82 L116 112 C98 102, 78 118, 63 104 Z" fill="#FAF0E2" fillOpacity="0.65" />
          <path d="M68 58 C74 78, 86 64, 92 84 C98 66, 108 76, 114 58" fill="none" stroke="#9A4E16" strokeWidth="3.2" strokeLinecap="round" />
          <rect x="54" y="52" width="72" height="7" rx="3.5" fill="#FFFFFF" stroke="#E4DDD2" strokeWidth="1" />
        </g>
      ) : art === 'flatwhite' ? (
        <g>
          {/* Ceramic saucer */}
          <ellipse cx="90" cy="134" rx="54" ry="12" fill="#E8DDD0" stroke="#D1C0AD" strokeWidth="1.2" />
          <ellipse cx="90" cy="132" rx="44" ry="8" fill="#FAF6F0" />
          {/* Ceramic tulip cup & handle */}
          <path d="M126 78 C144 78, 144 108, 122 108" fill="none" stroke="#EFE6DA" strokeWidth="7" strokeLinecap="round" />
          <path d="M52 68 H128 L122 114 C120 126 106 132 90 132 C74 132 60 126 58 114 Z" fill="#F8F3EC" stroke="#D8C7B4" strokeWidth="1.4" />
          {/* Espresso top & rosetta foam art */}
          <ellipse cx="90" cy="68" rx="38" ry="11" fill="#8C5835" />
          <path d="M90 61 C82 65, 82 71, 90 74 C98 71, 98 65, 90 61 Z" fill="#FFFDF9" />
          <path d="M78 67 C84 64, 96 64, 102 67" fill="none" stroke="#FFFDF9" strokeWidth="2" strokeLinecap="round" />
        </g>
      ) : art === 'pourover' ? (
        <g>
          {/* Ribbed glass server carafe */}
          <path d="M68 48 H112 L126 126 C127 136 112 144 90 144 C68 144 53 136 54 126 Z" fill="#F4EDE4" fillOpacity="0.65" stroke="#CBBBAE" strokeWidth="1.6" />
          <path d="M62 88 H118 L124 126 C125 135 111 142 90 142 C69 142 55 135 56 126 Z" fill="#6F3618" fillOpacity="0.9" />
          {/* Amber pour stream */}
          <line x1="90" y1="22" x2="90" y2="94" stroke="#8C4820" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="90" cy="88" rx="28" ry="5" fill="#9A5328" />
          {/* Glass vertical ribs */}
          {[74, 84, 96, 106].map((x) => (
            <line key={x} x1={x} y1="54" x2={x + (x - 90) * 0.45} y2="136" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="1.5" />
          ))}
          {/* Minimal glass handle */}
          <path d="M114 60 C134 62, 136 104, 122 114" fill="none" stroke="#CBBBAE" strokeWidth="4" strokeLinecap="round" />
        </g>
      ) : art === 'cortado' ? (
        <g>
          {/* Fluted Gibraltar glass */}
          <path d="M60 56 H120 L114 134 C113 140 103 144 90 144 C77 144 67 140 66 134 Z" fill="#7D4424" />
          <path d="M60 56 H120 L118 86 H62 Z" fill="#F7EAE1" />
          {/* Vertical glass flutes */}
          {[72, 84, 96, 108].map((x) => (
            <line key={x} x1={x} y1="60" x2={x - (x - 90) * 0.14} y2="138" stroke="#FFFFFF" strokeOpacity="0.34" strokeWidth="2.2" />
          ))}
          {/* Damask rose petal & cardamom top garnish */}
          <ellipse cx="83" cy="54" rx="7" ry="4" fill="#BE185D" transform="rotate(-14 83 54)" />
          <ellipse cx="96" cy="53" rx="6" ry="3.5" fill="#E11D48" transform="rotate(16 96 53)" />
          <ellipse cx="90" cy="57" rx="4" ry="2.2" fill="#4D7C0F" />
          <rect x="57" y="52" width="66" height="5" rx="2.5" fill="#FFFFFF" fillOpacity="0.85" />
        </g>
      ) : art === 'pastry' ? (
        <g>
          {/* Handmade stoneware plate */}
          <ellipse cx="90" cy="126" rx="58" ry="15" fill="#EAE0D2" stroke="#CBB8A0" strokeWidth="1.2" />
          <ellipse cx="90" cy="124" rx="48" ry="11" fill="#FAF6F0" />
          {/* Golden laminated croissant */}
          <path
            d="M46 112 C48 84, 72 68, 94 70 C116 72, 134 88, 134 114 C122 120, 108 118, 90 116 C72 114, 58 118, 46 112 Z"
            fill="#C98038"
            stroke="#9A5316"
            strokeWidth="1.3"
          />
          <path d="M68 78 C64 92, 65 104, 70 115" fill="none" stroke="#9A5316" strokeWidth="1.6" />
          <path d="M90 71 C88 88, 88 102, 90 116" fill="none" stroke="#9A5316" strokeWidth="1.6" />
          <path d="M112 78 C116 92, 115 104, 110 115" fill="none" stroke="#9A5316" strokeWidth="1.6" />
          <path d="M74 84 C84 78, 98 78, 108 84" fill="none" stroke="#FDE6C4" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.55" />
          {/* Pistachio & berry dust */}
          <circle cx="86" cy="92" r="2.2" fill="#15803D" />
          <circle cx="96" cy="90" r="2" fill="#16A34A" />
          <circle cx="91" cy="97" r="2.2" fill="#BE123C" />
        </g>
      ) : (
        <g>
          {/* Hand-tied Maison Rouge bouquet cone */}
          <polygon points="56,74 124,74 96,144 84,144" fill="#EFE4D6" stroke="#CBB8A2" strokeWidth="1.3" />
          <polygon points="62,74 118,74 93,144 87,144" fill="#FAF4EC" />
          {/* Satin oxblood ribbon bow */}
          <rect x="78" y="108" width="24" height="7" rx="2" fill="#731120" />
          <path d="M90 111 C78 104, 72 114, 80 118" fill="#8E1728" />
          <path d="M90 111 C102 104, 108 114, 100 118" fill="#8E1728" />
          {/* Eucalyptus foliage */}
          <ellipse cx="64" cy="68" rx="11" ry="5" fill="#4D6E48" transform="rotate(-35 64 68)" />
          <ellipse cx="116" cy="68" rx="11" ry="5" fill="#4D6E48" transform="rotate(35 116 68)" />
          {/* Layered ranunculus & crimson roses */}
          <circle cx="76" cy="60" r="16" fill="#FAF2EA" stroke="#D4C2B2" strokeWidth="1.2" />
          <circle cx="76" cy="60" r="9" fill="none" stroke="#C6AE9B" strokeWidth="1.2" strokeDasharray="7 3" />
          <circle cx="104" cy="60" r="15" fill="#8C1324" />
          <circle cx="104" cy="60" r="8" fill="none" stroke="#F49CAE" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="6 3" />
          <circle cx="90" cy="48" r="17" fill="#FFFFFF" stroke="#D8C8B9" strokeWidth="1.2" />
          <circle cx="90" cy="48" r="10" fill="none" stroke="#C8B2A1" strokeWidth="1.2" strokeDasharray="8 3" />
          <circle cx="90" cy="68" r="12" fill="#A6192E" />
        </g>
      )}
    </svg>
  );
}

/** Drinko-inspired blush-pink seasonal spotlight artwork: Coconut Iced Latte + split fresh coconut. */
function SeasonalCoconutLatteSvg({ uid }: { uid: string }) {
  return (
    <svg
      viewBox="0 0 260 250"
      className="h-full w-full drop-shadow-[0_20px_28px_rgba(92,35,28,0.22)]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`coco-drink-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6B3718" />
          <stop offset="48%" stopColor="#B8763C" />
          <stop offset="100%" stopColor="#EAD7BE" />
        </linearGradient>
        <radialGradient id={`coco-shell-${uid}`} cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#855132" />
          <stop offset="100%" stopColor="#452311" />
        </radialGradient>
      </defs>

      {/* Timber coaster */}
      <ellipse cx="146" cy="218" rx="68" ry="14" fill="#7D4F31" />
      <ellipse cx="146" cy="214" rx="64" ry="11" fill="#A06B46" />

      {/* Tall crystal iced latte cup */}
      <path d="M94 34 H198 L184 206 C182 214 166 218 146 218 C126 218 110 214 108 206 Z" fill={`url(#coco-drink-${uid})`} />
      {/* Swirling oat-coconut marbling */}
      <path
        d="M100 96 C122 114, 148 80, 174 102 C184 110, 190 100, 193 94 L189 148 C166 164, 142 134, 118 152 C109 158, 105 152, 103 148 Z"
        fill="#FFF9F0"
        fillOpacity="0.58"
      />
      {/* Faceted crystal ice cubes along top */}
      {[
        { x: 106, y: 40, r: -10 },
        { x: 132, y: 36, r: 8 },
        { x: 158, y: 41, r: -6 },
        { x: 120, y: 64, r: 12 },
        { x: 150, y: 66, r: -11 },
      ].map((cube, idx) => (
        <rect
          key={`ice-${idx}`}
          x={cube.x}
          y={cube.y}
          width="24"
          height="22"
          rx="5"
          fill="#FFFFFF"
          fillOpacity="0.34"
          stroke="#FFFFFF"
          strokeOpacity="0.55"
          strokeWidth="1.2"
          transform={`rotate(${cube.r} ${cube.x + 12} ${cube.y + 11})`}
        />
      ))}
      <rect x="89" y="28" width="114" height="9" rx="4.5" fill="#FFFFFF" fillOpacity="0.88" />
      <path d="M108 46 L118 196" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="4" strokeLinecap="round" />

      {/* Whole coconut & fresh split coconut half in foreground */}
      <circle cx="136" cy="204" r="34" fill={`url(#coco-shell-${uid})`} />
      <path d="M114 190 C124 182, 140 180, 152 186" fill="none" stroke="#A66D48" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />

      <g transform="rotate(-14 82 206)">
        <ellipse cx="82" cy="206" rx="34" ry="27" fill="#4D2915" />
        <ellipse cx="82" cy="206" rx="28" ry="21" fill="#FFFDF9" />
        <ellipse cx="82" cy="206" rx="20" ry="14" fill="#EFE6DA" />
      </g>
    </svg>
  );
}

/** Delicate hand-drawn botanical trailing vine corner accent for scalloped linen card. */
function BotanicalVineCornerSvg() {
  return (
    <svg viewBox="0 0 120 120" className="pointer-events-none h-24 w-24 sm:h-28 sm:w-28" aria-hidden="true">
      <g fill="none" stroke="#4D6B42" strokeWidth="1.6" strokeLinecap="round">
        <path d="M6 10 C32 14, 54 18, 96 12" />
        <path d="M12 10 C18 38, 16 68, 22 108" />
        <path d="M24 16 C38 30, 50 38, 66 44" />
      </g>
      {[
        { cx: 34, cy: 18, rot: -20, fill: '#4E7342' },
        { cx: 60, cy: 14, rot: 12, fill: '#648C54' },
        { cx: 84, cy: 16, rot: -15, fill: '#436438' },
        { cx: 18, cy: 38, rot: 35, fill: '#577E4A' },
        { cx: 28, cy: 56, rot: -25, fill: '#71985E' },
        { cx: 16, cy: 76, rot: 20, fill: '#4A6E3E' },
        { cx: 24, cy: 96, rot: -18, fill: '#628B51' },
        { cx: 48, cy: 34, rot: 22, fill: '#5A814C' },
      ].map((leaf, idx) => (
        <ellipse
          key={`vine-leaf-${idx}`}
          cx={leaf.cx}
          cy={leaf.cy}
          rx="11"
          ry="5.8"
          fill={leaf.fill}
          fillOpacity="0.9"
          transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`}
        />
      ))}
    </svg>
  );
}

/** Minimal hand-drawn line art icon set echoing Kauai Cut Catering illustrated stationery. */
function LinenSketchIcon({ kind }: { kind: 'carafe' | 'vase' | 'menu' }) {
  if (kind === 'carafe') {
    return (
      <svg viewBox="0 0 40 40" className="h-8 w-8 text-[#7E5A44]" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 10h14l-2 7 4 12a3 3 0 0 1-2.8 4H13.8A3 3 0 0 1 11 29l4-12-2-7Z" />
        <path d="M14 23h12" />
        <path d="M17 6c0-1.5 1.5-2 1.5-3M22 6c0-1.5 1.5-2 1.5-3" />
      </svg>
    );
  }
  if (kind === 'vase') {
    return (
      <svg viewBox="0 0 40 40" className="h-8 w-8 text-[#7E5A44]" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 21h10l2 10a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3l2-10Z" />
        <path d="M20 21V11M20 17l-5-5M20 15l5-4" />
        <circle cx="20" cy="8.5" r="2.6" />
        <circle cx="13.5" cy="11" r="2" />
        <circle cx="26.5" cy="10" r="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 text-[#7E5A44]" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="7" width="22" height="27" rx="2.5" />
      <path d="M14 13h12M14 18h12M14 23h8M14 28h10" />
    </svg>
  );
}

/**
 * CafeArtisanSite (`cafe-artisan-01`)
 * Dual-mode Awwwards Artisanal Café, Specialty Beverage & Luxury Floral Atelier Website:
 * - Flagship Roast Bar (`roast`) + Maison Rouge Luxury Floral Atelier (`maison`)
 * - Kinetic Sliding Hero Carousel with Dynamic Color Morph & Pointer 3D Parallax
 * - Maison Rouge Vertical Fluted-Glass Optical Editorial Showcase & Infinite Marquee
 * - Interactive Drinko-Inspired Menu with Live Shopping Basket Drawer & WhatsApp Checkout
 * - Scalloped Linen Private Events & Tasting Table Card
 */
export function CafeArtisanSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const uid = useId().replace(/:/g, '');
  const coreLang = toCoreLanguageCode(language);
  const reducedMotion = usePrefersReducedMotion();
  const openedOnceRef = useRef(false);

  const autoMode = resolveCafeArtisanMode(data.relation);
  const [manualMode, setManualMode] = useState<CafeArtisanMode | null>(null);
  const mode: CafeArtisanMode = manualMode ?? autoMode;

  const [slideIdx, setSlideIdx] = useState<number>(() => (autoMode === 'maison' ? 3 : 0));
  const [pointerOffset, setPointerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [fluteSplit, setFluteSplit] = useState<number>(52);
  const [isDraggingFlute, setIsDraggingFlute] = useState<boolean>(false);
  const [activePlateIdx, setActivePlateIdx] = useState<number>(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [storyExpanded, setStoryExpanded] = useState<boolean>(false);

  const [activeCategory, setActiveCategory] = useState<MenuCategoryKey>('all');
  const [activePairingMood, setActivePairingMood] = useState<PairingMoodKey>('bold');
  const [selectedSlot, setSelectedSlot] = useState<PickupSlotKey>('now');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({ 'cf-1': true, 'cf-8': true });
  const [basket, setBasket] = useState<Record<string, number>>({ 'cf-1': 1 });
  const [seasonalDiscountApplied, setSeasonalDiscountApplied] = useState<boolean>(false);
  const [basketOpen, setBasketOpen] = useState<boolean>(false);
  const [orderNote, setOrderNote] = useState<string>('');

  const [selectedEvent, setSelectedEvent] = useState<EventPackageKey>('tasting');
  const [guestTier, setGuestTier] = useState<string>('20 Guests');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fluteStageRef = useRef<HTMLDivElement | null>(null);
  const menuSectionRef = useRef<HTMLElement | null>(null);
  const atelierSectionRef = useRef<HTMLElement | null>(null);
  const eventsSectionRef = useRef<HTMLElement | null>(null);

  // Sync mode when builder changes data.relation
  useEffect(() => {
    setManualMode(null);
    setSlideIdx(autoMode === 'maison' ? 3 : 0);
  }, [autoMode]);

  // Register opened callback cleanly once
  useEffect(() => {
    if (openedOnceRef.current) return;
    openedOnceRef.current = true;
    onOpened?.();
  }, [onOpened]);

  // Clean up toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Escape key dismissal for Basket Drawer
  useEffect(() => {
    if (!basketOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setBasketOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [basketOpen]);

  function showToast(msg: string) {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 2600);
  }

  function handleSwitchMode(nextMode: CafeArtisanMode) {
    setManualMode(nextMode);
    setSlideIdx(nextMode === 'maison' ? 3 : 0);
    setActivePlateIdx(0);
    showToast(
      nextMode === 'maison'
        ? 'Maison Rouge Luxury Floral & Patisserie Mode'
        : 'Roast & Co. Kinetic Coffee & Matcha Mode',
    );
  }

  const activeSlide = HERO_SLIDES[slideIdx] ?? HERO_SLIDES[0];
  const isMaisonVisual = mode === 'maison' || activeSlide.mode === 'maison';

  const isDemoModeOverride = watermarked && manualMode !== null && manualMode !== autoMode;
  const brandTitle = isDemoModeOverride
    ? mode === 'maison'
      ? 'MAISON ROUGE'
      : 'ROAST & CO.'
    : data.receiverName?.trim() || (mode === 'maison' ? 'MAISON ROUGE' : 'ROAST & CO.');
  const brandTagline = isDemoModeOverride
    ? mode === 'maison'
      ? 'Luxury Floral & Patisserie Atelier'
      : 'Small-Batch Roastery & Atelier'
    : data.senderName?.trim() ||
      (mode === 'maison' ? 'Luxury Floral & Patisserie Atelier' : 'Small-Batch Roastery & Atelier');
  const monogram = extractMonogram(brandTitle);

  const localizedHeadline = data.headline ? pickLocalizedText(data.headline, language).trim() : '';
  const localizedMessage =
    (data.message ? pickLocalizedText(data.message, language).trim() : '') ||
    (mode === 'maison'
      ? 'Each pour and floral arrangement is shaped like quiet architecture — crafted by hand to linger long after the last sip.'
      : 'Single-origin harvests roasted in micro-batches, stone-milled Uji matcha, and hand-tied seasonal stems under one sunlit roof.');
  const localizedOffer = data.offerTag ? pickLocalizedText(data.offerTag, language).trim() : '';

  const customHighlights = useMemo(() => {
    if (!Array.isArray(data.highlights)) return [];
    return data.highlights
      .map((item) => ({
        title: item?.title ? pickLocalizedText(item.title, language).trim() : '',
        detail: item?.detail ? pickLocalizedText(item.detail, language).trim() : '',
      }))
      .filter((item) => item.title.length > 0 || item.detail.length > 0);
  }, [data.highlights, language]);

  // Optical fluted-glass plates: prioritize user uploaded photos when provided, paired with curated local photography
  const glassPlates: GlassPlate[] = useMemo(() => {
    const userUrls = Array.isArray(data.photos)
      ? data.photos
          .map((u) => (typeof u === 'string' ? u.trim() : ''))
          .filter((u) => u.length > 0)
          .slice(0, 3)
      : [];

    const userPlates: GlassPlate[] = userUrls.map((src, idx) => ({
      id: `user-${idx}`,
      src,
      label: `Atelier Frame 0${idx + 1}`,
      caption: `${brandTitle} · Signature Look`,
      cropClass: 'object-cover object-center',
    }));

    const curatedPlates: GlassPlate[] = [
      {
        id: 'rose-cottage',
        src: '/templates/cafe/rose-cottage.jpg',
        label: 'Conservatory Terrace',
        caption: 'Sunlit Rose Courtyard · Morning Harvest',
        cropClass: 'object-cover object-center',
      },
      {
        id: 'maison-ranunculus',
        src: '/templates/cafe/maison-rouge.jpg',
        label: 'Blanc Ranunculus',
        caption: 'Maison Rouge · Sculptural Floral Study',
        cropClass: 'object-cover object-center',
      },
    ];

    return userPlates.length > 0 ? [...userPlates, ...curatedPlates] : curatedPlates;
  }, [brandTitle, data.photos]);

  const activePlate = glassPlates[activePlateIdx % glassPlates.length] ?? glassPlates[0];

  const filteredMenu = useMemo(() => {
    if (activeCategory === 'all') return MENU_ITEMS;
    return MENU_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const basketLineItems = useMemo(() => {
    return ALL_CATALOG_ITEMS.filter((item) => (basket[item.id] ?? 0) > 0).map((item) => ({
      ...item,
      qty: basket[item.id] ?? 0,
    }));
  }, [basket]);

  const totalItemsCount = basketLineItems.reduce((sum, item) => sum + item.qty, 0);
  const rawSubtotal = basketLineItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = seasonalDiscountApplied ? Math.round(rawSubtotal * 0.2) : 0;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const activePairing =
    BARISTA_PAIRINGS.find((p) => p.key === activePairingMood) ?? BARISTA_PAIRINGS[0];
  const pairingDrink =
    MENU_ITEMS.find((item) => item.id === activePairing.drinkId) ?? MENU_ITEMS[0];
  const pairingCompanion =
    MENU_ITEMS.find((item) => item.id === activePairing.companionId) ?? MENU_ITEMS[6];
  const pairingCombinedPrice = pairingDrink.price + pairingCompanion.price;

  const activeSlotObj =
    PICKUP_SLOTS.find((slot) => slot.key === selectedSlot) ?? PICKUP_SLOTS[0];

  const validWaPhone = sanitizeWhatsappPhone(data.whatsappPhone);

  const whatsappOrderText = useMemo(() => {
    const lines = [
      `Hello ${brandTitle}, I would like to place an order:`,
      ...basketLineItems.map(
        (item) => `- ${item.name} x${item.qty} (₹${(item.price * item.qty).toLocaleString('en-IN')})`,
      ),
      `Pickup / Table Slot: ${activeSlotObj.waLabel}`,
      seasonalDiscountApplied
        ? `Seasonal Launch Privilege (20% Off): -₹${discountAmount.toLocaleString('en-IN')}`
        : '',
      localizedOffer ? `Offer Tag: ${localizedOffer}` : '',
      orderNote.trim() ? `Barista / Floral Note: ${orderNote.trim()}` : '',
      `Total Payable: ₹${finalTotal.toLocaleString('en-IN')}`,
    ].filter(Boolean);
    return lines.join('\n');
  }, [
    basketLineItems,
    brandTitle,
    activeSlotObj.waLabel,
    discountAmount,
    finalTotal,
    localizedOffer,
    orderNote,
    seasonalDiscountApplied,
  ]);

  const activeEventPkg =
    EVENT_PACKAGES.find((pkg) => pkg.key === selectedEvent) ?? EVENT_PACKAGES[0];

  function updateQty(id: string, delta: number) {
    setBasket((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      return { ...prev, [id]: next };
    });
  }

  function handleCycleSlide(dir: -1 | 1) {
    setSlideIdx((prev) => (prev + dir + HERO_SLIDES.length) % HERO_SLIDES.length);
  }

  function handleHeroPointerMove(e: React.PointerEvent<HTMLElement>) {
    if (reducedMotion || e.pointerType === 'touch') return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setPointerOffset({
      x: Math.max(-1, Math.min(1, nx)),
      y: Math.max(-1, Math.min(1, ny)),
    });
  }

  function updateFluteFromClientX(clientX: number) {
    const stage = fluteStageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setFluteSplit(Math.max(4, Math.min(96, pct)));
  }

  function handlePlaceWhatsAppOrder() {
    onOpened?.();
    if (basketLineItems.length === 0) {
      showToast('Add a beverage or bouquet to your basket first.');
      return;
    }
    if (validWaPhone) {
      const href = `https://wa.me/${validWaPhone}?text=${encodeURIComponent(whatsappOrderText)}`;
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    setBasketOpen(true);
    showToast('Preview mode: Order summary ready to copy below.');
  }

  function handleReserveEventOnWhatsApp() {
    onOpened?.();
    const inquiry = [
      `Hello ${brandTitle}, I would like to reserve a ${activeEventPkg.label}.`,
      `Estimated Guests: ${guestTier}`,
      `Package Reference: ${activeEventPkg.duration} (Starting ₹${activeEventPkg.startingPrice.toLocaleString('en-IN')})`,
      `Please share date availability & bespoke menu options.`,
    ].join('\n');

    if (validWaPhone) {
      const href = `https://wa.me/${validWaPhone}?text=${encodeURIComponent(inquiry)}`;
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    try {
      void navigator.clipboard?.writeText(inquiry);
    } catch {
      // Safe fallback
    }
    showToast(`${activeEventPkg.label} inquiry copied (${guestTier}).`);
  }

  async function handleCopyOrderSummary() {
    try {
      await navigator.clipboard?.writeText(whatsappOrderText);
      showToast('WhatsApp order message copied.');
    } catch {
      showToast('Order summary ready in drawer.');
    }
  }

  function handleAddSeasonalDrop() {
    updateQty(SEASONAL_DROP_ITEM.id, 1);
    setSeasonalDiscountApplied(true);
    showToast('Coconut Iced Latte added · 20% Launch Offer active.');
  }

  function handleAddPairingToBasket() {
    setBasket((prev) => ({
      ...prev,
      [pairingDrink.id]: (prev[pairingDrink.id] ?? 0) + 1,
      [pairingCompanion.id]: (prev[pairingCompanion.id] ?? 0) + 1,
    }));
    showToast(`${pairingDrink.name} + ${pairingCompanion.name} added to basket.`);
  }

  function scrollToRef(ref: React.RefObject<HTMLElement | null>) {
    ref.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  const uiCopy = useMemo(() => {
    if (coreLang === 'hi') {
      return {
        roastPill: 'रोस्ट बार',
        maisonPill: 'मैसन अटेलियर',
        orderNow: 'ऑर्डर करें',
        basketLabel: 'मेरा बास्केट',
        placeWa: 'WhatsApp पर ऑर्डर भेजें',
        addBtn: '+ बास्केट',
        slideGlass: 'फ्लूटेड ग्लास स्लाइड करें',
        reserveEvent: 'WhatsApp पर बुक करें',
        pairingEyebrow: 'बेरिस्ता और फ़्लोरल पेयरिंग',
        pairingTitle: 'आज के मूड के अनुसार जोड़ी चुनें',
        addPairingCta: 'दोनों बास्केट में जोड़ें',
        slotLabel: 'पिकअप / टेबल समय स्लॉट',
        slotActivePrefix: 'स्लॉट',
      };
    }
    if (coreLang === 'hinglish') {
      return {
        roastPill: 'Roast Bar',
        maisonPill: 'Maison Atelier',
        orderNow: 'Order Now',
        basketLabel: 'My Basket',
        placeWa: 'Place Order on WhatsApp',
        addBtn: '+ Add',
        slideGlass: 'Slide Fluted Glass',
        reserveEvent: 'Reserve on WhatsApp',
        pairingEyebrow: 'BARISTA & FLORAL PAIRING',
        pairingTitle: 'Apne Mood Ki Signature Pairing Chunein',
        addPairingCta: 'Add Pairing to Basket',
        slotLabel: 'Pickup / Table Reservation Slot',
        slotActivePrefix: 'Slot',
      };
    }
    return {
      roastPill: 'Roast Bar',
      maisonPill: 'Maison Atelier',
      orderNow: 'Order Now',
      basketLabel: 'My Basket',
      placeWa: 'Place Order on WhatsApp',
      addBtn: '+ Add to Basket',
      slideGlass: 'Slide Fluted Glass',
      reserveEvent: 'Reserve on WhatsApp',
      pairingEyebrow: 'BARISTA & FLORAL PAIRING RECOMMENDER',
      pairingTitle: 'Find Your Mood-Matched Pour & Atelier Pairing',
      addPairingCta: 'Add Pairing to Basket',
      slotLabel: 'Pickup / Table Reservation Time Slot',
      slotActivePrefix: 'Slot',
    };
  }, [coreLang]);

  const orbitConfigs = [
    { top: '16%', left: '10%', size: 'h-11 w-14', depth: 1.5, cls: 'wz-cafe-float-a', blur: '' },
    { top: '44%', left: '16%', size: 'h-12 w-16', depth: 2.1, cls: 'wz-cafe-float-b', blur: '' },
    { top: '68%', left: '11%', size: 'h-8 w-10', depth: 0.9, cls: 'wz-cafe-float-a', blur: 'blur-[0.6px] opacity-85' },
    { top: '15%', right: '13%', size: 'h-10 w-12', depth: 1.7, cls: 'wz-cafe-float-b', blur: '' },
    { top: '46%', right: '11%', size: 'h-12 w-16', depth: 2.2, cls: 'wz-cafe-float-a', blur: '' },
    { top: '70%', right: '18%', size: 'h-8 w-11', depth: 1.1, cls: 'wz-cafe-float-b', blur: 'blur-[0.6px] opacity-85' },
  ] as const;

  const marqueePhrase = `${brandTitle} · Maison Rouge · Small-Batch Craft · Floral Atelier · Single Origin · `;

  return (
    <div
      className="wz-cafe-root relative flex min-h-full w-full flex-col justify-between overflow-x-clip rounded-[28px] bg-[#FAF6F1] text-[#2B1810]"
      style={hiSafeStyle(language)}
    >
      <style>{CAFE_SITE_CSS}</style>

      {/* Watermark bar in free preview mode */}
      {watermarked ? (
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-30 flex items-center justify-center border-b border-white/15 py-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-white/90 transition-colors duration-500"
          style={{ backgroundColor: activeSlide.bgDeepHex }}
        >
          WEBZY FREE PREVIEW · {manifest.id.toUpperCase()}
        </div>
      ) : null}

      {/* ===================================================================== */}
      {/* SECTION 1: KINETIC SLIDING HERO CAROUSEL + DYNAMIC COLOR MORPH        */}
      {/* ===================================================================== */}
      <section
        aria-label="Featured artisanal showcase"
        onPointerMove={handleHeroPointerMove}
        onPointerLeave={() => setPointerOffset({ x: 0, y: 0 })}
        className="relative overflow-hidden text-white transition-[background-color] duration-700 ease-out"
        style={{
          backgroundColor: activeSlide.bgHex,
          backgroundImage: `radial-gradient(circle at 50% 34%, rgba(255,255,255,0.16) 0%, transparent 58%), linear-gradient(180deg, ${activeSlide.bgHex} 0%, ${activeSlide.bgDeepHex} 100%)`,
        }}
      >
        <AtmosphericGrainOverlay opacity={0.07} />

        {/* Editorial Top Masthead + Flagship Mode Switcher */}
        <header className="wz-cafe-section-px relative z-30 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 pt-3.5 sm:pt-5">
          {/* Brand Crest */}
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/35 bg-black/20 font-editorial text-sm font-bold tracking-wider text-white backdrop-blur-xs"
              aria-hidden="true"
            >
              {monogram}
            </span>
            <div className="min-w-0">
              <p className="truncate font-festive text-xs font-extrabold uppercase tracking-[0.14em] text-white sm:text-sm">
                {brandTitle}
              </p>
              <p className="truncate text-[10px] font-medium text-white/75">{brandTagline}</p>
            </div>
          </div>

          {/* Desktop anchor links */}
          <nav
            aria-label="Primary site navigation"
            className="wz-cafe-nav-links items-center gap-5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/85"
          >
            <button
              type="button"
              onClick={() => scrollToRef(atelierSectionRef)}
              className="transition hover:text-white"
            >
              Atelier
            </button>
            <button
              type="button"
              onClick={() => scrollToRef(menuSectionRef)}
              className="transition hover:text-white"
            >
              Menu
            </button>
            <button
              type="button"
              onClick={() => scrollToRef(eventsSectionRef)}
              className="transition hover:text-white"
            >
              Private Events
            </button>
          </nav>

          {/* Right Controls: Dual Mode Pill Switcher + Live Basket */}
          <div className="flex items-center gap-2">
            <div
              role="tablist"
              aria-label="Switch flagship edition"
              className="inline-flex items-center rounded-full border border-white/25 bg-black/25 p-0.5 backdrop-blur-md"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'roast'}
                onClick={() => handleSwitchMode('roast')}
                className={`min-h-[32px] rounded-full px-2.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-all active:scale-95 ${
                  mode === 'roast'
                    ? 'bg-white text-[#1E2E14] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {uiCopy.roastPill}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'maison'}
                onClick={() => handleSwitchMode('maison')}
                className={`min-h-[32px] rounded-full px-2.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-all active:scale-95 ${
                  mode === 'maison'
                    ? 'bg-[#FAF3EC] text-[#590C15] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {uiCopy.maisonPill}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setBasketOpen(true)}
              aria-label={`Open basket with ${totalItemsCount} items`}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-[#2B1810] shadow-sm transition hover:scale-[1.03] active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 7h12l-1 13H7L6 7Zm3 0V5a3 3 0 0 1 6 0v2"
                />
              </svg>
              <span className="font-tabular">{totalItemsCount}</span>
            </button>
          </div>
        </header>

        {/* Kinetic Stage: Giant Display Word + Orbiting 3D Elements + Featured Cup/Bouquet */}
        <div className="wz-cafe-stage wz-cafe-section-px relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-end">
          {/* Origin micro-pill + Optional Customized Offer Tag */}
          <div className="relative z-20 mb-2 flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/15 px-3 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/95 backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
              <span>{activeSlide.originNote}</span>
            </div>
            {localizedOffer ? (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#FDE6C4]/60 bg-[#2B1209]/70 px-3 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#FDE6C4] shadow-xs backdrop-blur-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FDE6C4]" aria-hidden="true" />
                <span>{localizedOffer}</span>
              </div>
            ) : null}
          </div>

          {/* Giant ultra-bold uppercase background display word (outer parallax + inner spring reveal) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[44%] z-0 flex select-none justify-center overflow-hidden"
            style={{
              transform: reducedMotion
                ? 'translate3d(0, -50%, 0)'
                : `translate3d(${pointerOffset.x * -14}px, calc(-50% + ${pointerOffset.y * -8}px), 0)`,
              transition: 'transform 220ms ease-out',
            }}
          >
            <span
              key={`word-${activeSlide.id}`}
              className="wz-cafe-word-in wz-cafe-hero-word whitespace-nowrap font-zine font-normal uppercase text-white/90 drop-shadow-[0_14px_30px_rgba(0,0,0,0.12)]"
            >
              {activeSlide.displayWord}
            </span>
          </div>

          {/* Orbiting Floating Coffee Beans (roast) or Silk Rose Petals (maison) */}
          <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
            {orbitConfigs.map((cfg, idx) => {
              const px = reducedMotion ? 0 : pointerOffset.x * cfg.depth * 14;
              const py = reducedMotion ? 0 : pointerOffset.y * cfg.depth * 10;
              return (
                <div
                  key={`orbit-${activeSlide.id}-${idx}`}
                  className={`absolute ${cfg.size} ${cfg.blur}`}
                  style={{
                    top: cfg.top,
                    left: 'left' in cfg ? cfg.left : undefined,
                    right: 'right' in cfg ? cfg.right : undefined,
                    transform: `translate3d(${px}px, ${py}px, 0)`,
                    transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  <div className={`h-full w-full ${cfg.cls}`}>
                    {isMaisonVisual ? (
                      <SilkPetalSvg uid={uid} variant={idx} />
                    ) : (
                      <RoastedBeanSvg uid={uid} variant={idx} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flanking side mini-cups on wider containers (exact Coffee & Co. rhythm) */}
          {!isMaisonVisual ? (
            <>
              <div
                aria-hidden="true"
                className="wz-cafe-side-cup pointer-events-none absolute bottom-1 left-[11%] z-10 h-28 w-24 opacity-90 transition-transform duration-500"
                style={{
                  transform: reducedMotion
                    ? undefined
                    : `translate3d(${pointerOffset.x * 8}px, ${pointerOffset.y * 5}px, 0) rotate(-4deg)`,
                }}
              >
                <FlankingMiniCupSvg tone="#7D4930" strawColor="#3E2115" />
              </div>
              <div
                aria-hidden="true"
                className="wz-cafe-side-cup pointer-events-none absolute bottom-1 right-[11%] z-10 h-28 w-24 opacity-90 transition-transform duration-500"
                style={{
                  transform: reducedMotion
                    ? undefined
                    : `translate3d(${pointerOffset.x * 8}px, ${pointerOffset.y * 5}px, 0) rotate(4deg)`,
                }}
              >
                <FlankingMiniCupSvg tone="#D99B4E" strawColor="#B45309" />
              </div>
            </>
          ) : null}

          {/* Main Featured Centerpiece Visual (outer 3D tilt + inner spring entrance) */}
          <div
            className="wz-cafe-centerpiece relative z-20"
            style={{
              transform: reducedMotion
                ? undefined
                : `perspective(900px) translate3d(${pointerOffset.x * 12}px, ${pointerOffset.y * 8}px, 0) rotateY(${pointerOffset.x * 7}deg) rotateX(${pointerOffset.y * -5}deg)`,
              transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div key={`center-${activeSlide.id}`} className="wz-cafe-spring-in h-full w-full">
              <HeroCenterpieceArtwork
                slide={activeSlide}
                brandTitle={brandTitle}
                monogram={monogram}
                uid={uid}
              />
            </div>
          </div>
        </div>

        {/* Organic Curved Cream Horizon Wave + Kinetic Controls + Stat Strip */}
        <div className="relative z-30 mt-2">
          <svg
            viewBox="0 0 1440 72"
            preserveAspectRatio="none"
            className="block h-8 w-full sm:h-12"
            aria-hidden="true"
          >
            <path
              d="M0,52 C360,-10 1080,-10 1440,52 L1440,72 L0,72 Z"
              fill="#FAF6F1"
            />
          </svg>

          <div className="wz-cafe-section-px bg-[#FAF6F1] pb-6 pt-1 text-[#2B1810] sm:pb-8">
            <div className="wz-cafe-hero-bottom mx-auto max-w-6xl">
              {/* Left Narrative Copy */}
              <div className="wz-cafe-hero-copy">
                <p className="font-editorial text-lg font-semibold leading-tight text-[#2B1810] sm:text-xl">
                  {localizedHeadline || activeSlide.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#5C4438]">
                  {activeSlide.subtitle}
                </p>
              </div>

              {/* Center Kinetic Prev / Primary CTA / Next Controls */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCycleSlide(-1)}
                    aria-label="Previous signature edition"
                    className="min-h-[40px] rounded-full px-4 text-xs font-extrabold uppercase tracking-[0.1em] shadow-xs transition hover:scale-[1.03] active:scale-95"
                    style={{
                      backgroundColor: activeSlide.accentHex,
                      color: activeSlide.pillTextHex,
                    }}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateQty(activeSlide.featuredProductId, 1);
                      scrollToRef(menuSectionRef);
                      showToast(`Added ${activeSlide.title} to your basket.`);
                    }}
                    className="min-h-[40px] rounded-full border border-[#2B1810]/20 bg-white px-5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2B1810] shadow-2xs transition hover:border-[#2B1810]/40 hover:bg-[#F5EFE6] active:scale-95"
                  >
                    {uiCopy.orderNow}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCycleSlide(1)}
                    aria-label="Next signature edition"
                    className="min-h-[40px] rounded-full px-4 text-xs font-extrabold uppercase tracking-[0.1em] shadow-xs transition hover:scale-[1.03] active:scale-95"
                    style={{
                      backgroundColor: activeSlide.accentHex,
                      color: activeSlide.pillTextHex,
                    }}
                  >
                    Next
                  </button>
                </div>

                {/* Slide selector dots */}
                <div className="flex items-center gap-1.5" role="tablist" aria-label="Featured hero flavors">
                  {HERO_SLIDES.map((s, idx) => {
                    const selected = idx === slideIdx;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-label={`Select ${s.displayWord}`}
                        onClick={() => setSlideIdx(idx)}
                        className={`h-2 rounded-full transition-all ${
                          selected ? 'w-6' : 'w-2 opacity-40 hover:opacity-75'
                        }`}
                        style={{ backgroundColor: s.bgHex }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Right Stat Strip */}
              <div className="grid grid-cols-3 divide-x divide-[#2B1810]/10 rounded-2xl border border-[#2B1810]/10 bg-white/85 px-2 py-2.5 text-center shadow-2xs">
                <div className="px-1.5">
                  <p className="font-tabular font-festive text-base font-extrabold text-[#2B1810] sm:text-lg">
                    10+
                  </p>
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#6B5041]">
                    Single Origins
                  </p>
                </div>
                <div className="px-1.5">
                  <p className="font-tabular font-festive text-base font-extrabold text-[#2B1810] sm:text-lg">
                    20K+
                  </p>
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#6B5041]">
                    Cups Poured
                  </p>
                </div>
                <div className="px-1.5">
                  <p className="font-tabular font-festive text-base font-extrabold text-[#2B1810] sm:text-lg">
                    100%
                  </p>
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#6B5041]">
                    Handcrafted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 2: MAISON ROUGE FLUTED-GLASS OPTICAL EDITORIAL SHOWCASE       */}
      {/* ===================================================================== */}
      <section
        ref={atelierSectionRef}
        aria-labelledby={`maison-heading-${uid}`}
        className="relative overflow-hidden bg-[#4E0B13] text-[#FAF3EC]"
        style={{
          backgroundImage: 'linear-gradient(180deg, #590C15 0%, #44080F 58%, #34050B 100%)',
        }}
      >
        <AtmosphericGrainOverlay opacity={0.07} />

        {/* Interactive Optical Fluted-Glass Photograph Stage */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-7 sm:pt-11">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#E6C9B8]">
                {brandTitle} · FLORAL &amp; ROASTERY ATELIER
              </p>
              <h2
                id={`maison-heading-${uid}`}
                className="mt-1 font-editorial text-3xl font-normal tracking-tight text-[#FAF3EC] sm:text-5xl"
              >
                {mode === 'maison' ? 'Maison Rouge' : 'Glasshouse Reserve'}
              </h2>
            </div>

            {/* Plate Switcher & Quick Frost/Reveal Control */}
            <div className="flex flex-wrap items-center gap-1.5">
              {glassPlates.map((plate, idx) => (
                <button
                  key={plate.id}
                  type="button"
                  onClick={() => setActivePlateIdx(idx)}
                  className={`min-h-[34px] rounded-full border px-3 text-[10px] font-bold uppercase tracking-[0.12em] transition active:scale-95 ${
                    activePlateIdx % glassPlates.length === idx
                      ? 'border-[#FAF3EC] bg-[#FAF3EC] text-[#4E0B13]'
                      : 'border-[#FAF3EC]/25 bg-white/5 text-[#FAF3EC]/80 hover:bg-white/10'
                  }`}
                >
                  {plate.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFluteSplit((prev) => (prev > 30 ? 12 : 62))}
                className="min-h-[34px] rounded-full border border-[#E6C9B8]/35 bg-black/25 px-3 font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#F5DFD1] transition hover:bg-black/40 active:scale-95"
              >
                {fluteSplit > 30 ? 'Part Glass' : 'Draw Glass'}
              </button>
            </div>
          </div>

          {/* Fluted Glass Interactive Optical Frame */}
          <div
            ref={fluteStageRef}
            role="slider"
            tabIndex={0}
            aria-label="Slide vertical fluted glass over editorial artwork"
            aria-valuemin={4}
            aria-valuemax={96}
            aria-valuenow={Math.round(fluteSplit)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') setFluteSplit((p) => Math.max(4, p - 8));
              if (e.key === 'ArrowRight') setFluteSplit((p) => Math.min(96, p + 8));
            }}
            onPointerDown={(e) => {
              setIsDraggingFlute(true);
              updateFluteFromClientX(e.clientX);
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                // Pointer capture optional fallback
              }
            }}
            onPointerMove={(e) => {
              if (e.pointerType === 'mouse' || isDraggingFlute) {
                updateFluteFromClientX(e.clientX);
              }
            }}
            onPointerUp={() => setIsDraggingFlute(false)}
            onPointerCancel={() => setIsDraggingFlute(false)}
            className="wz-cafe-flute-box group relative w-full cursor-ew-resize select-none overflow-hidden rounded-[24px] border border-[#FAF3EC]/20 bg-[#2C050A] shadow-[0_28px_60px_-20px_rgba(12,1,3,0.85)] touch-pan-y"
          >
            {/* Base Crisp Photograph Beneath */}
            {!failedImages[activePlate.src] ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={activePlate.src}
                alt={activePlate.caption}
                onError={() =>
                  setFailedImages((prev) => ({ ...prev, [activePlate.src]: true }))
                }
                draggable={false}
                className={`h-full w-full transition-transform duration-700 ${activePlate.cropClass}`}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D131F] via-[#4A0A12] to-[#260308] p-8">
                <p className="font-editorial text-2xl italic text-[#FAF3EC]/85">
                  {activePlate.caption}
                </p>
              </div>
            )}

            {/* Subtle editorial vignette for legibility */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2A0409]/70 via-transparent to-[#2A0409]/25"
            />

            {/* REAL CSS Vertical Fluted / Reeded Architectural Glass Curtain */}
            <div
              aria-hidden="true"
              className="wz-cafe-fluted-curtain pointer-events-none absolute inset-y-0 left-0 z-10 border-r border-white/45 shadow-[10px_0_32px_rgba(16,2,4,0.48)]"
              style={{
                width: `${fluteSplit}%`,
                transition: isDraggingFlute ? 'none' : 'width 180ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {/* Soft warm architectural glass tint */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#590C15]/30 via-transparent to-[#2A0408]/35" />
            </div>

            {/* Interactive Seam Handle */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 z-20 flex -translate-x-1/2 items-center"
              style={{
                left: `${fluteSplit}%`,
                transition: isDraggingFlute ? 'none' : 'left 180ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-[#3B060D]/85 text-[#FAF3EC] shadow-[0_8px_24px_rgba(0,0,0,0.55)] backdrop-blur-md">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l-4 5 4 5M16 7l4 5-4 5" />
                </svg>
              </span>
            </div>

            {/* Editorial Overlay Caption inside the glass stage */}
            <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-end justify-between gap-2 sm:bottom-5 sm:left-5 sm:right-5">
              <div className="max-w-xs rounded-2xl border border-white/20 bg-[#2C050A]/65 px-3.5 py-2.5 backdrop-blur-md">
                <p className="font-mono text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#E6C9B8]">
                  OPTICAL REEDED GLASS · {Math.round(fluteSplit)}%
                </p>
                <p className="mt-0.5 font-editorial text-base text-white sm:text-lg">
                  {activePlate.caption}
                </p>
              </div>
              <span className="rounded-full border border-white/25 bg-black/35 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#FAF3EC] backdrop-blur-sm">
                {uiCopy.slideGlass}
              </span>
            </div>
          </div>

          {/* Philosophy — Craft as Architecture 2-Column Editorial Block */}
          <div className="wz-cafe-editorial-split mt-9 border-t border-[#FAF3EC]/15 pt-8">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="h-px w-7 bg-[#E6C9B8]/70" aria-hidden="true" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#E6C9B8]">
                  PHILOSOPHY
                </span>
              </div>
              <h3 className="mt-2.5 font-editorial text-3xl font-normal leading-[1.06] text-[#FAF3EC] sm:text-4xl">
                Craft as
                <br />
                Architecture
              </h3>
              <button
                type="button"
                onClick={() => setStoryExpanded((prev) => !prev)}
                className="mt-5 inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#FAF3EC]/35 px-5 py-2 text-xs font-semibold tracking-wide text-[#FAF3EC] transition hover:bg-[#FAF3EC] hover:text-[#4E0B13] active:scale-95"
              >
                <span>{storyExpanded ? 'Hide atelier notes' : 'Discover our story'}</span>
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <blockquote className="font-romance text-lg italic leading-relaxed text-[#FAF3EC] sm:text-xl">
                &ldquo;{localizedMessage}&rdquo;
              </blockquote>
              <p className="text-xs leading-relaxed text-[#E9D5CA]/80 sm:text-sm">
                Inspired by timeless floristry and precision small-batch roasting, {brandTitle}{' '}
                treats every chilled pour and sculptural stem as an heirloom sensory composition.
              </p>

              {storyExpanded || customHighlights.length > 0 ? (
                <div className="wz-cafe-story-grid border-t border-[#FAF3EC]/15 pt-4">
                  {(customHighlights.length > 0
                    ? customHighlights.slice(0, 2)
                    : [
                        {
                          title: 'Micro-Lot Roasting',
                          detail: 'Weekly small-drum profiles sourced directly from shade-grown Indian estates.',
                        },
                        {
                          title: 'Architectural Stems',
                          detail: 'Morning-cut ranunculus, garden roses & olive branches wrapped in archival cotton paper.',
                        },
                      ]
                  ).map((note, idx) => (
                    <div
                      key={`story-note-${idx}`}
                      className="rounded-2xl border border-[#FAF3EC]/15 bg-white/[0.04] p-3"
                    >
                      <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#E6C9B8]">
                        0{idx + 1} · {note.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#FAF3EC]/80">{note.detail}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Maison Signature Triptych Strip */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#E6C9B8]">
                CURATED EDITIONS
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('atelier');
                  scrollToRef(menuSectionRef);
                }}
                className="text-[11px] font-semibold text-[#FAF3EC]/80 underline-offset-4 hover:text-white hover:underline"
              >
                Explore Atelier Menu
              </button>
            </div>
            <div className="wz-cafe-triptych">
              {[
                {
                  tag: 'SINGLE VARIETY',
                  title: 'The Rose Edit',
                  sub: 'Crimson romance',
                  bg: 'from-[#7A1021] to-[#36050D]',
                  itemId: 'cf-8',
                },
                {
                  tag: 'FIRST HARVEST',
                  title: 'Blanc Matcha',
                  sub: 'Kyoto velvet pour',
                  bg: 'from-[#5D6E22] to-[#27320E]',
                  itemId: 'cf-1',
                },
                {
                  tag: 'GIFT EDITION',
                  title: 'Pastry & Bloom',
                  sub: 'Dawn atelier box',
                  bg: 'from-[#6B3720] to-[#2D140A]',
                  itemId: 'cf-7',
                },
              ].map((card) => (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => {
                    updateQty(card.itemId, 1);
                    showToast(`${card.title} added to basket.`);
                  }}
                  className={`group relative flex min-h-[126px] flex-col justify-between overflow-hidden rounded-2xl border border-[#FAF3EC]/15 bg-gradient-to-b ${card.bg} p-3 text-left transition duration-300 hover:-translate-y-0.5 hover:border-[#FAF3EC]/40 active:scale-[0.98] sm:min-h-[154px] sm:p-4`}
                >
                  <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[#E6C9B8]/90">
                    {card.tag}
                  </span>
                  <div>
                    <p className="font-editorial text-sm font-normal text-[#FAF3EC] sm:text-lg">
                      {card.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#FAF3EC]/70">{card.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Infinite Smooth Horizontal Brand Marquee Strip */}
        <div
          aria-hidden="true"
          className="wz-cafe-marquee-wrap relative z-10 overflow-hidden border-y border-[#FAF3EC]/15 bg-[#3B060D]/90 py-3"
        >
          <div className="wz-cafe-marquee-track font-editorial text-base italic tracking-wide text-[#FAF3EC]/90 sm:text-lg">
            <span>{marqueePhrase.repeat(4)}</span>
            <span>{marqueePhrase.repeat(4)}</span>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 3: INTERACTIVE DRINK & ATELIER MENU + LIVE SHOPPING BASKET    */}
      {/* ===================================================================== */}
      <section
        ref={menuSectionRef}
        aria-labelledby={`menu-heading-${uid}`}
        className="relative bg-[#FAF6F1] px-4 py-9 text-[#2B1810] sm:px-7 sm:py-12"
      >
        <div className="mx-auto max-w-6xl">
          {/* Drinko-inspired Menu Header + My Basket Button */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="relative">
              <h2
                id={`menu-heading-${uid}`}
                className="font-festive text-3xl font-black tracking-tight text-[#3E1F14] sm:text-5xl"
              >
                Menu
              </h2>
              <p className="-mt-2 pl-6 font-handwritten text-xl font-semibold text-[#B47D59] sm:-mt-3 sm:pl-9 sm:text-2xl">
                drinks &amp; atelier
              </p>
            </div>

            <button
              type="button"
              onClick={() => setBasketOpen(true)}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#B47D59] px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#9E6A48] active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 7h12l-1 13H7L6 7Zm3 0V5a3 3 0 0 1 6 0v2"
                />
              </svg>
              <span>{uiCopy.basketLabel}</span>
              <span className="font-tabular rounded-full bg-white/20 px-2 py-0.5 text-[10.5px]">
                {totalItemsCount} · ₹{finalTotal.toLocaleString('en-IN')}
              </span>
            </button>
          </div>

          {/* INTERACTIVE BARISTA & FLORAL PAIRING RECOMMENDER */}
          <div className="mt-6 overflow-hidden rounded-[24px] border border-[#DFD2C2] bg-white p-4 shadow-[0_14px_32px_-20px_rgba(62,31,20,0.28)] sm:p-5">
            <div className="wz-cafe-pairing-grid">
              <div>
                <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#9E6A48]">
                  {uiCopy.pairingEyebrow}
                </p>
                <h3 className="mt-1 font-editorial text-xl font-normal leading-snug text-[#2B1810] sm:text-2xl">
                  {uiCopy.pairingTitle}
                </h3>

                {/* 3 Quick Mood Toggles */}
                <div
                  role="tablist"
                  aria-label={uiCopy.pairingEyebrow}
                  className="mt-3 flex flex-wrap gap-2"
                >
                  {BARISTA_PAIRINGS.map((preset) => {
                    const isSelected = preset.key === activePairing.key;
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setActivePairingMood(preset.key)}
                        className={`min-h-[44px] rounded-full border px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
                          isSelected
                            ? 'text-white shadow-xs'
                            : 'border-[#DFD2C2] bg-[#FAF6F1] text-[#4A2E20] hover:border-[#B47D59]'
                        }`}
                        style={
                          isSelected
                            ? { backgroundColor: preset.accentHex, borderColor: preset.accentHex }
                            : undefined
                        }
                      >
                        {preset.label[coreLang]}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-3 text-xs leading-relaxed text-[#6A5042]">
                  {activePairing.note[coreLang]}
                </p>
              </div>

              {/* Recommended Pairing Card + 1-Tap Add Pairing Action */}
              <div className="rounded-2xl border border-[#E6DACB] bg-[#FAF6F1] p-3.5 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#8C6149]">
                    {activePairing.vibeTag[coreLang]}
                  </span>
                  <span className="font-tabular rounded-full bg-white px-2.5 py-0.5 text-[11px] font-black text-[#2B1810]">
                    ₹{pairingCombinedPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  {[pairingDrink, pairingCompanion].map((pairedItem) => (
                    <div
                      key={pairedItem.id}
                      className="rounded-xl border border-[#DFD2C2]/80 bg-white p-2.5"
                    >
                      <p className="font-mono text-[8.5px] font-bold uppercase tracking-[0.14em] text-[#9E6A48]">
                        {pairedItem.badge}
                      </p>
                      <p className="mt-0.5 line-clamp-1 font-festive text-xs font-extrabold text-[#2B1810]">
                        {pairedItem.name}
                      </p>
                      <p className="font-tabular mt-0.5 text-[10.5px] font-bold text-[#6A5042]">
                        ₹{pairedItem.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddPairingToBasket}
                  className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-4 text-xs font-extrabold uppercase tracking-[0.1em] text-white shadow-xs transition hover:brightness-110 active:scale-[0.98]"
                  style={{ backgroundColor: activePairing.accentHex }}
                >
                  <span>+ {uiCopy.addPairingCta}</span>
                </button>
              </div>
            </div>
          </div>

          {/* PICKUP / TABLE RESERVATION TIME SLOT SELECTOR (WIRED TO WHATSAPP) */}
          <div className="mt-4 rounded-2xl border border-[#DFD2C2] bg-[#F5EFE6]/85 p-3.5 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#7A5B49]">
                {uiCopy.slotLabel}
              </span>
              <span className="font-mono text-[9.5px] font-semibold text-[#590C15]">
                {uiCopy.slotActivePrefix}: {activeSlotObj.label[coreLang]}
              </span>
            </div>
            <div
              role="radiogroup"
              aria-label={uiCopy.slotLabel}
              className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3"
            >
              {PICKUP_SLOTS.map((slot) => {
                const isSelected = slot.key === selectedSlot;
                return (
                  <button
                    key={slot.key}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedSlot(slot.key)}
                    className={`flex min-h-[44px] items-center justify-between gap-2 rounded-xl border px-3.5 py-2 text-left transition active:scale-[0.99] ${
                      isSelected
                        ? mode === 'maison'
                          ? 'border-[#590C15] bg-[#590C15] text-[#FAF3EC] shadow-xs'
                          : 'border-[#3E1F14] bg-[#3E1F14] text-[#FAF6F1] shadow-xs'
                        : 'border-[#DFD2C2] bg-white text-[#3E1F14] hover:border-[#B47D59]'
                    }`}
                  >
                    <span className="text-xs font-extrabold">{slot.label[coreLang]}</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] opacity-80">
                      {slot.sublabel[coreLang]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Smooth Category Filter Pill Tabs */}
          <div
            role="tablist"
            aria-label="Menu categories"
            className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
          >
            {CATEGORY_TABS.map((tab) => {
              const selected = activeCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveCategory(tab.key)}
                  className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                    selected
                      ? mode === 'maison'
                        ? 'bg-[#590C15] text-[#FAF3EC] shadow-xs'
                        : 'bg-[#B47D59] text-white shadow-xs'
                      : 'border border-[#B47D59]/30 bg-white text-[#5A3E30] hover:border-[#B47D59] hover:bg-[#F5ECE3]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 8 Curated Drink & Atelier Product Cards */}
          <div className="wz-cafe-menu-grid mt-6">
            {filteredMenu.map((item) => {
              const qty = basket[item.id] ?? 0;
              const isFav = Boolean(favorites[item.id]);
              return (
                <article
                  key={item.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-[20px] border border-[#DFD2C2] bg-[#EFE8DF] p-2 shadow-2xs transition duration-300 hover:-translate-y-0.5 hover:border-[#B47D59]/70 hover:shadow-[0_14px_28px_-14px_rgba(62,31,20,0.22)]"
                >
                  <div>
                    {/* Inner framed white studio plate */}
                    <div className="relative aspect-[10/9] w-full overflow-hidden rounded-[14px] bg-white">
                      <MenuItemArtSvg art={item.art} uid={uid} />
                      <span className="pointer-events-none absolute left-2 top-2 rounded-full border border-[#B47D59]/25 bg-white/90 px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-[#5C3A28] backdrop-blur-xs">
                        {item.badge}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFavorites((prev) => ({ ...prev, [item.id]: !isFav }))
                        }
                        aria-label={`Favorite ${item.name}`}
                        aria-pressed={isFav}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#8F2433] shadow-2xs transition hover:scale-105 active:scale-90"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5"
                          fill={isFav ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 20.5s-7-4.4-9.2-8.4C1 8.8 3.2 5 6.8 5c2 0 3.6 1 5.2 2.9C13.6 6 15.2 5 17.2 5 20.8 5 23 8.8 21.2 12.1 19 16.1 12 20.5 12 20.5Z"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Product Name & Tasting Notes */}
                    <div className="px-1.5 pt-2.5">
                      <h3 className="line-clamp-1 font-festive text-xs font-extrabold text-[#2B1810] sm:text-sm">
                        {item.name}
                      </h3>
                      <p className="mt-0.5 line-clamp-2 min-h-[28px] text-[10.5px] leading-snug text-[#6A5042]">
                        {item.notes}
                      </p>
                    </div>
                  </div>

                  {/* Price & Interactive Stepper / Add to Basket */}
                  <div className="mt-2.5 flex items-center justify-between gap-1.5 px-1.5 pb-1">
                    <div className="flex items-baseline gap-1">
                      <span className="font-tabular text-xs font-black text-[#2B1810] sm:text-sm">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                      {item.compareAt ? (
                        <span className="font-tabular text-[9.5px] text-[#7A5E4E]/60 line-through">
                          ₹{item.compareAt.toLocaleString('en-IN')}
                        </span>
                      ) : null}
                    </div>

                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, 1)}
                        className="min-h-[32px] rounded-full border border-[#B47D59]/45 bg-white px-2.5 text-[10px] font-extrabold text-[#3E1F14] transition hover:border-[#B47D59] hover:bg-[#B47D59] hover:text-white active:scale-95"
                      >
                        {uiCopy.addBtn}
                      </button>
                    ) : (
                      <div className="inline-flex min-h-[32px] items-center rounded-full border border-[#3E1F14]/20 bg-white px-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, -1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold text-[#590C15] transition hover:bg-[#F5ECE3]"
                        >
                          -
                        </button>
                        <span className="font-tabular px-1.5 text-[11px] font-black text-[#2B1810]">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold text-[#590C15] transition hover:bg-[#F5ECE3]"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* ================================================================= */}
          {/* SPECIAL "NEW SEASONAL DROP — 20% OFF" BLUSH-PINK SPOTLIGHT BANNER */}
          {/* ================================================================= */}
          <div className="relative mt-9 overflow-hidden rounded-[26px] border border-[#EABAC2] bg-[#FAD5DA] px-5 py-6 text-[#461E11] shadow-[0_18px_38px_-18px_rgba(142,46,62,0.28)] sm:px-8 sm:py-8">
            <div className="wz-cafe-drop-grid relative z-10">
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-festive text-4xl font-black leading-none tracking-tight text-white drop-shadow-[0_2px_10px_rgba(124,45,56,0.18)] sm:text-5xl">
                    New
                  </span>
                  <span className="font-handwritten text-2xl font-semibold text-[#7A3528] sm:text-3xl">
                    seasonal drop
                  </span>
                </div>
                <h3 className="-mt-1 font-festive text-3xl font-black leading-none tracking-tight text-[#4A1F12] sm:text-5xl">
                  Coconut Iced Latte
                </h3>
                {localizedOffer ? (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#8F1627]/30 bg-white/80 px-3 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8F1627]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8F1627]" aria-hidden="true" />
                    <span>{localizedOffer}</span>
                  </div>
                ) : null}
                <p className="mt-2.5 max-w-md text-xs leading-relaxed text-[#5E3224] sm:text-sm">
                  Chilled single-origin cold brew poured over velvety coconut cream, crisp ice, and toasted oat milk. Bright, cooling, and crafted for sunlit afternoons.
                </p>

                {/* Tasting Badge Breakdown */}
                <div className="mt-5 grid grid-cols-3 gap-2.5 border-y border-[#4A1F12]/15 py-3.5">
                  <div>
                    <p className="font-festive text-sm font-black text-[#4A1F12] sm:text-base">
                      3 Syrups
                    </p>
                    <p className="text-[10px] leading-tight text-[#6D3B2B]">
                      Vanilla, caramel, hazelnut
                    </p>
                  </div>
                  <div>
                    <p className="font-festive text-sm font-black text-[#4A1F12] sm:text-base">
                      Cold Brew + Oat
                    </p>
                    <p className="text-[10px] leading-tight text-[#6D3B2B]">
                      Espresso + chilled milk
                    </p>
                  </div>
                  <div>
                    <p className="font-festive text-sm font-black text-[#8F1627] sm:text-base">
                      20% Launch Offer
                    </p>
                    <p className="text-[10px] leading-tight text-[#6D3B2B]">
                      Limited seasonal drop
                    </p>
                  </div>
                </div>

                {/* Price + Direct Add CTA */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-tabular font-festive text-2xl font-black text-[#4A1F12] sm:text-3xl">
                      ₹280
                    </span>
                    <span className="font-tabular text-sm font-bold text-[#7A4A3A]/65 line-through">
                      ₹350
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSeasonalDrop}
                    className="min-h-[42px] rounded-full bg-[#4A1F12] px-5 py-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[#FFF9F4] shadow-sm transition hover:bg-[#35140A] active:scale-95"
                  >
                    + Add Drop &amp; Apply 20% Off
                  </button>
                </div>
              </div>

              {/* Right Coconut Iced Latte Studio Visual */}
              <div className="mx-auto h-52 w-56 sm:h-60 sm:w-64">
                <SeasonalCoconutLatteSvg uid={uid} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 4: SCALLOPED LINEN PRIVATE EVENTS & TASTING TABLE CARD        */}
      {/* ===================================================================== */}
      <section
        ref={eventsSectionRef}
        aria-labelledby={`events-heading-${uid}`}
        className="wz-cafe-linen-texture relative overflow-hidden border-t border-[#D8C7B4]/60 px-4 py-10 text-[#3B261B] sm:px-7 sm:py-14"
      >
        <div className="relative mx-auto max-w-5xl">
          {/* Outer Scalloped Lace Embroidered Frame */}
          <div className="relative rounded-[34px] border-2 border-[#B8947A]/55 bg-[#FBF6EE] p-3 shadow-[0_22px_50px_-24px_rgba(74,44,24,0.3)] sm:p-5">
            {/* Scalloped decorative SVG top & bottom lace edges */}
            <svg
              aria-hidden="true"
              viewBox="0 0 600 22"
              preserveAspectRatio="none"
              className="pointer-events-none absolute -top-[14px] left-6 right-6 h-4 w-[calc(100%-3rem)] text-[#B8947A]"
            >
              {Array.from({ length: 15 }).map((_, i) => {
                const x = i * 40;
                return (
                  <g key={`sc-top-${i}`}>
                    <path
                      d={`M${x} 20 Q${x + 20} -4 ${x + 40} 20`}
                      fill="#FBF6EE"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    />
                    <circle cx={x + 20} cy="13" r="2.2" fill="currentColor" fillOpacity="0.65" />
                  </g>
                );
              })}
            </svg>
            <svg
              aria-hidden="true"
              viewBox="0 0 600 22"
              preserveAspectRatio="none"
              className="pointer-events-none absolute -bottom-[14px] left-6 right-6 h-4 w-[calc(100%-3rem)] text-[#B8947A]"
            >
              {Array.from({ length: 15 }).map((_, i) => {
                const x = i * 40;
                return (
                  <g key={`sc-bot-${i}`}>
                    <path
                      d={`M${x} 2 Q${x + 20} 26 ${x + 40} 2`}
                      fill="#FBF6EE"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    />
                    <circle cx={x + 20} cy="9" r="2.2" fill="currentColor" fillOpacity="0.65" />
                  </g>
                );
              })}
            </svg>

            {/* Draping green botanical vine accent on top-left corner */}
            <div className="pointer-events-none absolute -left-3 -top-3 z-20">
              <BotanicalVineCornerSvg />
            </div>

            {/* Inner double-hairline stationery sheet */}
            <div className="relative rounded-[24px] border border-[#B8947A]/45 bg-[#F7F0E4] px-4 py-6 sm:px-8 sm:py-8">
              {/* Top linen stationery header with hand-drawn line icons */}
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-4">
                  <LinenSketchIcon kind="carafe" />
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#A68067]/50 bg-[#FBF6EE] font-editorial text-sm font-bold text-[#5E3A28]">
                    {monogram}
                  </span>
                  <LinenSketchIcon kind="vase" />
                </div>

                <p className="mt-3 font-handwritten text-xl font-semibold text-[#8C6149] sm:text-2xl">
                  fall in love with craft through every pour
                </p>
                <h2
                  id={`events-heading-${uid}`}
                  className="mt-1 font-editorial text-2xl font-normal text-[#322017] sm:text-4xl"
                >
                  Private Events &amp; Tasting Table
                </h2>
              </div>

              {/* Quick Booking Toggle: 3 Signature Experiences */}
              <div
                role="tablist"
                aria-label="Private event packages"
                className="mt-5 flex flex-wrap items-center justify-center gap-2"
              >
                {EVENT_PACKAGES.map((pkg) => {
                  const selected = pkg.key === selectedEvent;
                  return (
                    <button
                      key={pkg.key}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setSelectedEvent(pkg.key)}
                      className={`min-h-[40px] rounded-full border px-4 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                        selected
                          ? 'border-[#5E3A28] bg-[#5E3A28] text-[#FBF6EE] shadow-xs'
                          : 'border-[#B8947A]/55 bg-[#FBF6EE] text-[#5E3A28] hover:border-[#5E3A28]'
                      }`}
                    >
                      {pkg.label}
                    </button>
                  );
                })}
              </div>

              {/* Selected Event Card Details + Visual Vignette */}
              <div className="wz-cafe-events-grid mt-6 rounded-2xl border border-[#B8947A]/35 bg-[#FBF6EE]/90 p-4 sm:p-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#8C6149]">
                      {activeEventPkg.duration}
                    </span>
                    <span className="font-tabular rounded-full border border-[#B8947A]/40 bg-[#F4EAD9] px-2.5 py-0.5 text-[10.5px] font-extrabold text-[#4E2F20]">
                      From ₹{activeEventPkg.startingPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <h3 className="mt-2 font-editorial text-2xl font-normal text-[#2D1B12]">
                    {activeEventPkg.label}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#644B3C] sm:text-sm">
                    {activeEventPkg.subtitle}
                  </p>

                  {/* Inclusions */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {activeEventPkg.inclusions.map((inc) => (
                      <span
                        key={inc}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#B8947A]/35 bg-[#F7F0E4] px-2.5 py-1 text-[10.5px] font-semibold text-[#4B3123]"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8C6149]" aria-hidden="true" />
                        <span>{inc}</span>
                      </span>
                    ))}
                  </div>

                  {/* Guest Size Selector */}
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#8C6149]">
                      Guests:
                    </span>
                    {['20 Guests', '45 Guests', '90+ Guests'].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setGuestTier(tier)}
                        className={`min-h-[32px] rounded-full border px-2.5 text-[10.5px] font-bold transition ${
                          guestTier === tier
                            ? 'border-[#5E3A28] bg-[#EFE3D2] text-[#322017]'
                            : 'border-[#B8947A]/35 bg-white text-[#7A5B49] hover:border-[#8C6149]'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleReserveEventOnWhatsApp}
                      className="inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#3E2418] px-5 py-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[#FBF6EE] shadow-xs transition hover:bg-[#2A160D] active:scale-95"
                    >
                      <span>{uiCopy.reserveEvent}</span>
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
                      </svg>
                    </button>
                    <span className="font-handwritten text-base font-semibold text-[#8C6149]">
                      join us at the table
                    </span>
                  </div>
                </div>

                {/* Tactile taped linen Polaroid + sketched menu card vignette */}
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="relative w-full max-w-[240px] rotate-1 rounded-xl border border-[#B8947A]/40 bg-white p-2 pb-4 shadow-[0_14px_26px_-14px_rgba(62,36,24,0.35)]">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 -rotate-2 rounded-[2px] bg-[#E8DAC5]/85"
                    />
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#EFE4D6]">
                      {!failedImages['/templates/cafe/rose-cottage.jpg'] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src="/templates/cafe/rose-cottage.jpg"
                          alt={`${brandTitle} courtyard table`}
                          loading="lazy"
                          onError={() =>
                            setFailedImages((prev) => ({
                              ...prev,
                              '/templates/cafe/rose-cottage.jpg': true,
                            }))
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <LinenSketchIcon kind="menu" />
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between px-1">
                      <span className="font-handwritten text-sm font-semibold text-[#5E3A28]">
                        {activeEventPkg.guests}
                      </span>
                      <LinenSketchIcon kind="menu" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* STICKY LIVE BASKET SUMMARY BAR                                        */}
      {/* ===================================================================== */}
      {totalItemsCount > 0 ? (
        <div className="pointer-events-none sticky bottom-3 z-40 mt-2 flex w-full justify-center px-3">
          <div className="pointer-events-auto flex w-full max-w-xl items-center justify-between gap-2 rounded-full border border-white/15 bg-[#24130D]/95 p-1.5 pl-4 text-[#FAF6F1] shadow-[0_18px_36px_-10px_rgba(24,10,5,0.65)] backdrop-blur-md">
            <button
              type="button"
              onClick={() => setBasketOpen(true)}
              className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#B47D59] font-tabular text-xs font-black text-white">
                {totalItemsCount}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-white">
                  {uiCopy.basketLabel} ·{' '}
                  <span className="font-tabular">₹{finalTotal.toLocaleString('en-IN')}</span>
                </p>
                <p className="truncate text-[9.5px] text-white/65">
                  {activeSlotObj.label[coreLang]}
                  {seasonalDiscountApplied
                    ? ` · 20% Off (-₹${discountAmount.toLocaleString('en-IN')})`
                    : ' · Tap to review items'}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={handlePlaceWhatsAppOrder}
              className="min-h-[38px] shrink-0 rounded-full bg-[#16A34A] px-3.5 text-[11px] font-extrabold text-white shadow-xs transition hover:bg-[#15803D] active:scale-95"
            >
              WhatsApp Order
            </button>
          </div>
        </div>
      ) : null}

      {/* ===================================================================== */}
      {/* WEBZY FOOTER                                                          */}
      {/* ===================================================================== */}
      <footer className="relative z-20 bg-[#FAF6F1] px-4 pb-5 pt-4 text-center text-[11px] font-medium text-[#5A4034]/75">
        {getWebzyFooterLabel(language)}
      </footer>

      {/* ===================================================================== */}
      {/* INTERACTIVE MY BASKET DRAWER (PORTALED OUT OF @CONTAINER BLOCK)       */}
      {/* ===================================================================== */}
      {basketOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Shopping basket"
              onClick={() => setBasketOpen(false)}
              className="fixed inset-0 z-[130] flex items-end justify-center bg-black/65 p-2 backdrop-blur-xs sm:items-center sm:p-4"
            >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-[26px] border border-[#DFD2C2] bg-[#FAF6F1] text-[#2B1810] shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#DFD2C2] bg-white px-5 py-3.5">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#9E6A48]">
                  {brandTitle}
                </p>
                <h3 className="font-editorial text-xl font-semibold text-[#2B1810]">
                  {uiCopy.basketLabel} ({totalItemsCount})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBasketOpen(false)}
                aria-label="Close basket"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DFD2C2] bg-[#FAF6F1] text-[#2B1810] transition hover:bg-[#EFE6DA]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Line Items */}
            <div className="flex-1 space-y-2.5 overflow-y-auto px-5 py-4">
              {basketLineItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#CBB8A2] bg-white/70 p-6 text-center">
                  <p className="font-editorial text-lg text-[#3E1F14]">Your basket is empty</p>
                  <p className="mt-1 text-xs text-[#6A5042]">
                    Tap + Add to Basket on any iced pour, matcha, pastry box, or bouquet.
                  </p>
                </div>
              ) : (
                basketLineItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#E6DACB] bg-white p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-extrabold text-[#2B1810]">{item.name}</p>
                      <p className="font-tabular mt-0.5 text-[11px] font-semibold text-[#8C6149]">
                        ₹{item.price.toLocaleString('en-IN')} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center rounded-full border border-[#DFD2C2] bg-[#FAF6F1] px-0.5">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, -1)}
                          aria-label={`Remove one ${item.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-[#590C15] hover:bg-white"
                        >
                          -
                        </button>
                        <span className="font-tabular px-1.5 text-xs font-extrabold">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, 1)}
                          aria-label={`Add one ${item.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-[#590C15] hover:bg-white"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-tabular w-16 text-right text-xs font-black text-[#2B1810]">
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))
              )}

              {/* Toggle 20% Seasonal Offer */}
              {basketLineItems.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setSeasonalDiscountApplied((prev) => !prev)}
                    aria-pressed={seasonalDiscountApplied}
                    className={`flex min-h-[42px] w-full items-center justify-between rounded-2xl border px-3.5 py-2 text-left text-xs font-bold transition ${
                      seasonalDiscountApplied
                        ? 'border-[#8F1627]/40 bg-[#FAD5DA]/60 text-[#590C15]'
                        : 'border-[#DFD2C2] bg-white text-[#5A3E30] hover:border-[#B47D59]'
                    }`}
                  >
                    <span>Apply Seasonal Drop Privilege (20% Off)</span>
                    <span className="font-mono text-[10px] uppercase">
                      {seasonalDiscountApplied ? 'Applied' : 'Tap to Apply'}
                    </span>
                  </button>

                  {/* Pickup / Table Time Slot inside Drawer */}
                  <div>
                    <p className="mb-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#7A5B49]">
                      {uiCopy.slotLabel}
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {PICKUP_SLOTS.map((slot) => {
                        const isSelected = slot.key === selectedSlot;
                        return (
                          <button
                            key={`drawer-slot-${slot.key}`}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setSelectedSlot(slot.key)}
                            className={`min-h-[44px] rounded-xl border px-2 py-1.5 text-center text-[10.5px] font-bold leading-tight transition ${
                              isSelected
                                ? 'border-[#3E1F14] bg-[#3E1F14] text-white'
                                : 'border-[#DFD2C2] bg-white text-[#4A2E20] hover:border-[#B47D59]'
                            }`}
                          >
                            {slot.label[coreLang]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional Barista / Bouquet Note */}
                  <div>
                    <label
                      htmlFor={`cafe-note-${uid}`}
                      className="mb-1 block font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#7A5B49]"
                    >
                      Barista or Ribbon Card Note (Optional)
                    </label>
                    <input
                      id={`cafe-note-${uid}`}
                      type="text"
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="Oat milk, less ice, gift card message..."
                      className="min-h-[40px] w-full rounded-xl border border-[#DFD2C2] bg-white px-3 text-xs text-[#2B1810] placeholder:text-[#9A7E6E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B47D59]"
                    />
                  </div>
                </>
              ) : null}
            </div>

            {/* Totals & WhatsApp Checkout Footer */}
            <div className="border-t border-[#DFD2C2] bg-white px-5 py-4">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[#6A5042]">
                  <span>Subtotal</span>
                  <span className="font-tabular font-semibold">
                    ₹{rawSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                {seasonalDiscountApplied && discountAmount > 0 ? (
                  <div className="flex justify-between text-[#8F1627]">
                    <span>20% Seasonal Launch Offer</span>
                    <span className="font-tabular font-bold">
                      -₹{discountAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-[#EFE6DA] pt-2 text-sm font-black text-[#2B1810]">
                  <span>Total</span>
                  <span className="font-tabular">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mt-3.5 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={basketLineItems.length === 0}
                  onClick={handlePlaceWhatsAppOrder}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#16A34A] px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#15803D] active:scale-[0.99] disabled:opacity-45"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.6 14.1c-.2.6-1.3 1.2-1.8 1.3-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3 0-1.4.7-2.1 1-2.4.3-.3.6-.4.8-.4h.6c.2 0 .5 0 .7.6.2.6.9 2.1.9 2.2.1.2.1.3 0 .5-.1.2-.1.3-.3.5-.1.2-.3.4-.4.5-.1.1-.3.3-.1.6.2.3.8 1.4 1.8 2.2 1.2 1.1 2.2 1.4 2.6 1.6.3.1.5.1.7-.1.2-.2.8-.9 1-1.3.2-.3.4-.3.7-.2.3.1 1.8.8 2.1 1 .3.2.5.2.6.4.1.2.1.9-.1 1.5Z" />
                  </svg>
                  <span>{uiCopy.placeWa}</span>
                </button>

                {!validWaPhone && basketLineItems.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleCopyOrderSummary}
                    className="min-h-[38px] w-full rounded-full border border-[#DFD2C2] bg-[#FAF6F1] px-4 text-[11px] font-bold text-[#4A2E20] transition hover:bg-[#EFE6DA]"
                  >
                    Copy Pre-Filled WhatsApp Message
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>,
            document.body,
          )
        : null}

      {/* Floating Feedback Toast (portaled out of @container block) */}
      {toastMsg && typeof document !== 'undefined'
        ? createPortal(
            <div
              role="status"
              aria-live="polite"
              className="toast-enter pointer-events-none fixed bottom-6 left-1/2 z-[140] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-[#1F120D]/95 px-4 py-2 text-[11px] font-bold text-[#FAF6F1] shadow-xl backdrop-blur-md"
            >
              {toastMsg}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
