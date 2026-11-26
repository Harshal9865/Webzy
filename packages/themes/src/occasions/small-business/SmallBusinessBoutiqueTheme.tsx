'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  buildWhatsAppOrderHref,
  deriveHighlights,
  deriveStoreName,
  extractStoreMonogram,
  getValidPhotos,
  hiSafeStyle,
  sanitizeWhatsappPhone,
  SMALL_BUSINESS_THEMES_COPY,
  type SmallBusinessThemeComponentProps,
} from './smallBusinessTypes';

type BoutiqueCategoryKey = 'all' | 'apparel' | 'footwear' | 'accessories';
type SortMode = 'featured' | 'lowHigh' | 'highLow';

interface SwatchTint {
  name: string;
  hex: string;
  accentHex: string;
}

interface BoutiqueProduct {
  id: string;
  category: Exclude<BoutiqueCategoryKey, 'all'>;
  name: string;
  price: number;
  silhouette: 'trench' | 'loafer' | 'tote' | 'shirt' | 'sneaker' | 'scarf';
  swatches: readonly SwatchTint[];
}

const SAMPLE_PHOTOS: readonly string[] = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=900&q=80',
];

const BOUTIQUE_PRODUCTS: readonly BoutiqueProduct[] = [
  {
    id: 'bt-1',
    category: 'apparel',
    name: 'Linen Overshirt',
    price: 2190,
    silhouette: 'shirt',
    swatches: [
      { name: 'Denim Slate', hex: '#34516A', accentHex: '#20364A' },
      { name: 'Oatmeal', hex: '#D8CFC2', accentHex: '#AFA08B' },
      { name: 'Charcoal', hex: '#27272A', accentHex: '#121215' },
    ],
  },
  {
    id: 'bt-2',
    category: 'footwear',
    name: 'Court Low',
    price: 3290,
    silhouette: 'sneaker',
    swatches: [
      { name: 'Chalk White', hex: '#ECEBE6', accentHex: '#BDB8AD' },
      { name: 'Espresso', hex: '#4A372D', accentHex: '#2A1D16' },
      { name: 'Slate', hex: '#475569', accentHex: '#2A3442' },
    ],
  },
  {
    id: 'bt-3',
    category: 'accessories',
    name: 'Canvas Atelier Tote',
    price: 1690,
    silhouette: 'tote',
    swatches: [
      { name: 'Sandstone', hex: '#C7B8A1', accentHex: '#927F64' },
      { name: 'Deep Navy', hex: '#25394D', accentHex: '#152230' },
      { name: 'Ink Black', hex: '#1F1F23', accentHex: '#09090B' },
    ],
  },
  {
    id: 'bt-4',
    category: 'apparel',
    name: 'Wool Storm Trench',
    price: 4490,
    silhouette: 'trench',
    swatches: [
      { name: 'Camel', hex: '#B7936B', accentHex: '#84623F' },
      { name: 'Denim Slate', hex: '#34516A', accentHex: '#1E3346' },
      { name: 'Obsidian', hex: '#18181B', accentHex: '#09090B' },
    ],
  },
  {
    id: 'bt-5',
    category: 'footwear',
    name: 'Suede Penny Loafer',
    price: 3590,
    silhouette: 'loafer',
    swatches: [
      { name: 'Tobacco', hex: '#8A5A3B', accentHex: '#5D3821' },
      { name: 'Ash Grey', hex: '#71717A', accentHex: '#4A4A52' },
      { name: 'Charcoal', hex: '#27272A', accentHex: '#111114' },
    ],
  },
  {
    id: 'bt-6',
    category: 'accessories',
    name: 'Cashmere Rib Scarf',
    price: 1290,
    silhouette: 'scarf',
    swatches: [
      { name: 'Heather Slate', hex: '#4B6378', accentHex: '#304354' },
      { name: 'Ivory', hex: '#E6E1D6', accentHex: '#BEB5A2' },
      { name: 'Bordeaux', hex: '#6D2E3B', accentHex: '#481A24' },
    ],
  },
];

/** Sunlit Architectural Atelier Still-Life Hero SVG: Plaster arch, warm sunbeam, brass garment valet & stoneware botanical vessel. */
function HeroAtelierStillLifeSvg({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 260 210" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`plaster-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8F5EE" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#1E3346" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`sunbeam-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE6C4" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#FDE6C4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`coat-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EFECE6" />
          <stop offset="100%" stopColor="#C9BFA9" />
        </linearGradient>
      </defs>

      {/* Architectural plaster alcove */}
      <path
        d="M34 196 V86 C34 40 72 12 130 12 C188 12 226 40 226 86 V196 Z"
        fill={`url(#plaster-${uid})`}
        stroke="#F8F7F4"
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />

      {/* Diagonal warm atelier sunbeam */}
      <polygon points="34,38 158,12 226,118 118,196 34,196" fill={`url(#sunbeam-${uid})`} />

      {/* Floor plinth horizon */}
      <line x1="18" y1="196" x2="242" y2="196" stroke="#F8F7F4" strokeOpacity="0.35" strokeWidth="1" />

      {/* Sculptural brass valet rail */}
      <path d="M116 32 C116 24 126 24 126 32 C126 36 121 39 116 42" fill="none" stroke="#E5C48B" strokeWidth="2" strokeLinecap="round" />
      <path d="M116 42 L68 64 H164 Z" fill="none" stroke="#E5C48B" strokeWidth="1.8" strokeLinejoin="round" />

      {/* Draped tailored wool coat */}
      <path
        d="M78 64 L116 54 L154 64 L162 174 H70 Z"
        fill={`url(#coat-${uid})`}
        stroke="#8C7B63"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Lapel fold & waist tie */}
      <path d="M98 59 L116 96 L134 59" fill="none" stroke="#6E5D47" strokeWidth="1.3" />
      <line x1="116" y1="96" x2="116" y2="174" stroke="#6E5D47" strokeWidth="1.1" strokeOpacity="0.7" />
      <rect x="74" y="112" width="84" height="6" rx="2" fill="#B7936B" />
      <path d="M118 118 L128 144" stroke="#B7936B" strokeWidth="4" strokeLinecap="round" />

      {/* Stoneware vessel & dried botanical branch */}
      <ellipse cx="192" cy="194" rx="20" ry="4" fill="#0F172A" fillOpacity="0.28" />
      <path d="M178 152 C174 166 175 186 184 194 H200 C209 186 210 166 206 152 L201 140 H183 Z" fill="#D8CFC2" stroke="#8C7B63" strokeWidth="1.1" />
      <g stroke="#F8F7F4" strokeOpacity="0.75" fill="none" strokeWidth="1.2" strokeLinecap="round">
        <path d="M192 140 C192 114 204 86 214 68" />
        <path d="M196 116 C186 108 184 100 189 96" />
        <path d="M202 98 C212 94 218 86 216 80" />
        <path d="M208 82 C199 76 198 68 203 64" />
      </g>
    </svg>
  );
}

/** Editorial Fashion-Plate Garment SVGs with arched studio backdrop, dynamic swatch shading & floor shadows. */
function BoutiqueGarmentPlateSvg({
  silhouette,
  tint,
  uid,
}: {
  silhouette: BoutiqueProduct['silhouette'];
  tint: SwatchTint;
  uid: string;
}) {
  return (
    <svg viewBox="0 0 160 132" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`gar-${silhouette}-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={tint.hex} />
          <stop offset="100%" stopColor={tint.accentHex} />
        </linearGradient>
      </defs>

      {/* Warm alabaster studio backdrop with subtle plaster arch */}
      <rect x="0" y="0" width="160" height="132" fill="#F4F1EB" />
      <path d="M26 126 V56 C26 24 50 10 80 10 C110 10 134 24 134 56 V126 Z" fill="#ECE8DF" />
      <ellipse cx="80" cy="112" rx="40" ry="6" fill="#18181B" fillOpacity="0.1" />

      {silhouette === 'shirt' ? (
        <g>
          <path
            d="M52 28 L66 20 H94 L108 28 L130 48 L120 104 H104 L106 54 L104 112 H56 L54 54 L56 104 H40 L30 48 Z"
            fill={`url(#gar-${silhouette}-${uid})`}
            stroke={tint.accentHex}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M66 20 L80 34 L94 20" fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1.2" />
          <line x1="80" y1="34" x2="80" y2="112" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="1.1" />
          <rect x="61" y="54" width="13" height="15" rx="1.5" fill="none" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1" />
          <circle cx="80" cy="48" r="1.4" fill="#FFFFFF" fillOpacity="0.7" />
          <circle cx="80" cy="64" r="1.4" fill="#FFFFFF" fillOpacity="0.7" />
          <circle cx="80" cy="80" r="1.4" fill="#FFFFFF" fillOpacity="0.7" />
        </g>
      ) : silhouette === 'trench' ? (
        <g>
          <path
            d="M54 22 L66 16 H94 L106 22 L126 48 L116 108 H102 L102 54 L106 114 H54 L58 54 L58 108 H44 L34 48 Z"
            fill={`url(#gar-${silhouette}-${uid})`}
            stroke={tint.accentHex}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M66 16 L80 42 L94 16" fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1.3" />
          <rect x="56" y="64" width="48" height="6" rx="1.5" fill={tint.accentHex} />
          <rect x="76" y="63" width="8" height="8" rx="1" fill="none" stroke="#E5C48B" strokeWidth="1.2" />
        </g>
      ) : silhouette === 'tote' ? (
        <g>
          <path d="M60 48 V30 C60 18 100 18 100 30 V48" fill="none" stroke={tint.accentHex} strokeWidth="3.2" strokeLinecap="round" />
          <rect x="44" y="48" width="72" height="64" rx="5" fill={`url(#gar-${silhouette}-${uid})`} stroke={tint.accentHex} strokeWidth="1.4" />
          <line x1="44" y1="64" x2="116" y2="64" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1.2" />
          <rect x="72" y="58" width="16" height="12" rx="1.5" fill={tint.accentHex} stroke="#E5C48B" strokeWidth="1" />
        </g>
      ) : silhouette === 'sneaker' ? (
        <g>
          <path
            d="M32 82 L50 52 L68 62 L92 58 L126 78 C131 81 130 90 122 92 H34 C29 92 29 86 32 82 Z"
            fill={`url(#gar-${silhouette}-${uid})`}
            stroke={tint.accentHex}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M62 62 L76 74 M72 60 L86 72" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />
          <rect x="31" y="91" width="96" height="10" rx="4" fill="#FFFFFF" stroke={tint.accentHex} strokeWidth="1.3" />
        </g>
      ) : silhouette === 'loafer' ? (
        <g>
          <path
            d="M32 88 L42 58 C52 68 72 68 84 60 L124 80 C130 84 128 92 120 94 H34 Z"
            fill={`url(#gar-${silhouette}-${uid})`}
            stroke={tint.accentHex}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <rect x="66" y="64" width="22" height="7" rx="3" fill={tint.accentHex} stroke="#E5C48B" strokeWidth="0.9" />
          <rect x="32" y="93" width="94" height="7" rx="2.5" fill={tint.accentHex} />
        </g>
      ) : (
        <g>
          <rect x="52" y="24" width="28" height="82" rx="5" fill={`url(#gar-${silhouette}-${uid})`} stroke={tint.accentHex} strokeWidth="1.3" />
          <rect x="70" y="30" width="34" height="72" rx="5" fill={`url(#gar-${silhouette}-${uid})`} stroke={tint.accentHex} strokeWidth="1.3" />
          <g stroke={tint.accentHex} strokeWidth="1.4" strokeLinecap="round">
            <line x1="57" y1="106" x2="57" y2="115" />
            <line x1="64" y1="106" x2="64" y2="115" />
            <line x1="71" y1="106" x2="71" y2="115" />
            <line x1="80" y1="102" x2="80" y2="111" />
            <line x1="88" y1="102" x2="88" y2="111" />
            <line x1="96" y1="102" x2="96" y2="111" />
          </g>
        </g>
      )}
    </svg>
  );
}

/** Fine-line architectural vignette for Bento editorial tiles. */
function BentoVignetteSvg({ variant }: { variant: 'arch' | 'weave' }) {
  if (variant === 'arch') {
    return (
      <svg viewBox="0 0 80 64" className="h-14 w-16 shrink-0" aria-hidden="true">
        <path d="M12 58 V28 C12 12 24 6 40 6 C56 6 68 12 68 28 V58 Z" fill="#34516A" fillOpacity="0.12" stroke="#34516A" strokeWidth="1.2" />
        <path d="M26 58 V32 C26 22 32 18 40 18 C48 18 54 22 54 32 V58" fill="none" stroke="#34516A" strokeWidth="1" />
        <circle cx="40" cy="30" r="4" fill="#34516A" fillOpacity="0.4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 64" className="h-14 w-16 shrink-0" aria-hidden="true">
      <rect x="10" y="10" width="60" height="44" rx="4" fill="#18181B" fillOpacity="0.06" stroke="#18181B" strokeOpacity="0.35" strokeWidth="1.1" />
      <path d="M10 24 H70 M10 38 H70 M28 10 V54 M52 10 V54" stroke="#18181B" strokeOpacity="0.25" strokeWidth="1" />
      <circle cx="40" cy="31" r="8" fill="none" stroke="#34516A" strokeWidth="1.3" />
    </svg>
  );
}

/**
 * Small Business Theme 3: "Everyday Minimalist" (Kinfolk / Totême Editorial Atelier).
 * Warm alabaster canvas, sunlit architectural hero, editorial studio-plate swatch cards & visual bento spreads.
 */
export function SmallBusinessBoutiqueTheme({
  data,
  language,
  onOpened,
  onOpenPhoto,
}: SmallBusinessThemeComponentProps) {
  const uid = useId().replace(/:/g, '');
  const coreLang = toCoreLanguageCode(language);
  const copy =
    SMALL_BUSINESS_THEMES_COPY[coreLang]?.boutique ??
    SMALL_BUSINESS_THEMES_COPY.en.boutique;
  const sharedCopy =
    SMALL_BUSINESS_THEMES_COPY[coreLang] ?? SMALL_BUSINESS_THEMES_COPY.en;

  const storeName = deriveStoreName(data, copy.defaultStore);
  const monogram = extractStoreMonogram(storeName);
  const headline = pickLocalizedText(data.headline, language).trim() || copy.heroHeadline;
  const offerTag = data.offerTag ? pickLocalizedText(data.offerTag, language).trim() : '';

  const photos = getValidPhotos(data.photos);
  const hasUserPhotos = photos.length > 0;
  const effectivePhotos = hasUserPhotos ? photos : SAMPLE_PHOTOS;
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const [category, setCategory] = useState<BoutiqueCategoryKey>('all');
  const [sortMode, setSortMode] = useState<SortMode>('featured');
  const [selectedSwatches, setSelectedSwatches] = useState<Record<string, number>>({});
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({ 'bt-1': true });
  const [bag, setBag] = useState<Record<string, number>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [inquiryPreview, setInquiryPreview] = useState<string | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const catalogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!inquiryPreview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInquiryPreview(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inquiryPreview]);

  const customHighlights = deriveHighlights(data, language);
  const products = useMemo(() => {
    const base = BOUTIQUE_PRODUCTS.map((item, idx) => {
      const h = customHighlights[idx];
      if (!h) return item;
      return {
        ...item,
        name: h.title || item.name,
      };
    });
    const filtered =
      category === 'all' ? base : base.filter((p) => p.category === category);
    if (sortMode === 'lowHigh') return [...filtered].sort((a, b) => a.price - b.price);
    if (sortMode === 'highLow') return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [category, customHighlights, sortMode]);

  const bagCount = Object.values(bag).reduce((sum, n) => sum + n, 0);
  const bagTotal = BOUTIQUE_PRODUCTS.reduce(
    (sum, item) => sum + item.price * (bag[item.id] ?? 0),
    0,
  );
  const validWa = sanitizeWhatsappPhone(data.whatsappPhone);

  function flashToast(msg: string) {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 2600);
  }

  function cycleSort() {
    setSortMode((prev) =>
      prev === 'featured' ? 'lowHigh' : prev === 'lowHigh' ? 'highLow' : 'featured',
    );
  }

  function triggerWhatsAppMessage(msg: string) {
    onOpened?.();
    const href = buildWhatsAppOrderHref(validWa, msg);
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    setInquiryPreview(msg);
    flashToast(sharedCopy.demoOrderToast);
  }

  function handleQuickInquire(product: BoutiqueProduct) {
    const swIdx = selectedSwatches[product.id] ?? 0;
    const sw = product.swatches[swIdx] ?? product.swatches[0];
    triggerWhatsAppMessage(
      `Hello ${storeName}, I would like to inquire about "${product.name}" in ${sw.name} (INR ${product.price}).`,
    );
  }

  function handleBagCheckout() {
    const items = BOUTIQUE_PRODUCTS.filter((p) => (bag[p.id] ?? 0) > 0).map((p) => {
      const swIdx = selectedSwatches[p.id] ?? 0;
      const sw = p.swatches[swIdx] ?? p.swatches[0];
      return `- ${p.name} (${sw.name}) x${bag[p.id]} (INR ${p.price * (bag[p.id] ?? 0)})`;
    });
    const text =
      items.length > 0
        ? `Hello ${storeName}, here is my Boutique Bag:\n${items.join('\n')}\nEstimated Total: INR ${bagTotal}`
        : `Hello ${storeName}, I would like to request your latest lookbook & sizing guide.`;
    triggerWhatsAppMessage(text);
  }

  async function handleCopyInquiry() {
    if (!inquiryPreview) return;
    try {
      await navigator.clipboard?.writeText(inquiryPreview);
    } catch {
      // Safe fallback
    }
    flashToast(sharedCopy.copiedToast);
  }

  const heroPhoto =
    effectivePhotos[0] && !failedUrls[effectivePhotos[0]] ? effectivePhotos[0] : null;
  const sortLabel =
    sortMode === 'lowHigh'
      ? copy.sortLowHigh
      : sortMode === 'highLow'
        ? copy.sortHighLow
        : copy.sortFeatured;
  const categoryKeys: readonly BoutiqueCategoryKey[] = [
    'all',
    'apparel',
    'footwear',
    'accessories',
  ];

  return (
    <div
      className="relative flex min-h-full w-full flex-col overflow-x-clip bg-[#F8F7F4] text-[#18181B]"
      style={hiSafeStyle(language)}
    >
      {/* Editorial Atelier Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-[#E6E2DA] bg-[#F8F7F4]/95 px-3.5 py-2.5 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#18181B] font-mono text-[10px] font-bold tracking-wider text-[#F8F7F4]">
            {monogram}
          </span>
          <span className="truncate font-editorial text-base font-semibold tracking-tight text-[#18181B]">
            {storeName}
          </span>
        </div>

        <button
          type="button"
          onClick={handleBagCheckout}
          className="inline-flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-full border border-[#18181B]/15 bg-white px-3 py-1 text-[10.5px] font-semibold text-[#18181B] transition hover:border-[#34516A]"
        >
          <span>{bagCount > 0 ? `Bag (${bagCount})` : copy.inquireBtn}</span>
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-3.5 py-4 sm:px-6 sm:py-5">
        {/* Sunlit Architectural Atelier Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2C475E] via-[#34516A] to-[#1F3447] p-4 text-[#F8F7F4] shadow-[0_18px_38px_-18px_rgba(24,24,27,0.48)] sm:p-6">
          <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
            <div className="order-1 flex justify-center md:order-2 md:col-span-5 md:justify-end">
              {heroPhoto ? (
                <button
                  type="button"
                  onClick={() => {
                    if (hasUserPhotos) onOpenPhoto?.(0);
                  }}
                  aria-label="Inspect featured atelier photo"
                  className="group relative aspect-[4/5] w-full max-w-[210px] overflow-hidden rounded-t-full rounded-b-xl border border-[#F8F7F4]/40 bg-black/20 shadow-[0_24px_44px_-18px_rgba(15,23,42,0.65)] transition duration-500 hover:-translate-y-0.5 hover:border-[#F8F7F4]/70"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroPhoto}
                    alt={storeName}
                    onError={() =>
                      setFailedUrls((prev) => ({ ...prev, [heroPhoto]: true }))
                    }
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  {/* Sunlit alabaster inner arch mat + subtle sheen */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-1.5 rounded-t-full rounded-b-lg border border-white/35"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#182838]/80 via-[#182838]/20 to-transparent"
                  />
                  <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/30 bg-[#182838]/65 px-2.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#F8F7F4] backdrop-blur-xs">
                    ATELIER · EDIT 01
                  </span>
                </button>
              ) : (
                <div className="h-44 w-56 sm:h-48 sm:w-60">
                  <HeroAtelierStillLifeSvg uid={uid} />
                </div>
              )}
            </div>

            <div className="order-2 md:order-1 md:col-span-7">
              <span className="inline-block rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#F8F7F4]">
                {offerTag || copy.seasonBadge}
              </span>
              <h1 className="mt-2.5 break-words font-editorial text-2xl font-normal leading-[1.08] text-white sm:text-4xl">
                {headline}
              </h1>

              <button
                type="button"
                onClick={() =>
                  catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-full bg-[#F8F7F4] px-5 py-2 text-xs font-bold text-[#18181B] transition hover:bg-white active:scale-95"
              >
                <span>{copy.exploreCta}</span>
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10m-4-4 4 4-4 4" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Category Filter + Sort */}
        <section ref={catalogRef} aria-label="Lookbook catalog">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
            <div
              role="tablist"
              aria-label="Boutique categories"
              className="flex items-center gap-1.5 overflow-x-auto scrollbar-none"
            >
              {categoryKeys.map((catKey, idx) => {
                const active = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(catKey)}
                    className={`min-h-[34px] shrink-0 rounded-full px-3 py-1 text-[10.5px] font-semibold transition ${
                      active
                        ? 'bg-[#18181B] text-[#F8F7F4]'
                        : 'border border-[#E6E2DA] bg-white text-[#18181B]/75 hover:border-[#18181B]/40'
                    }`}
                  >
                    {copy.categories[idx]}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={cycleSort}
              className="min-h-[32px] shrink-0 rounded-full border border-[#E6E2DA] bg-white px-3 text-[10px] font-semibold text-[#18181B] hover:border-[#34516A]"
            >
              {sortLabel}
            </button>
          </div>

          {/* 2-up Mobile / 3-up Desktop Studio-Plate Lookbook Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3">
            {products.map((product) => {
              const origIdx = BOUTIQUE_PRODUCTS.findIndex((b) => b.id === product.id);
              const photoIdx = origIdx >= 0 ? origIdx : 0;
              const swIdx = selectedSwatches[product.id] ?? 0;
              const activeSwatch = product.swatches[swIdx] ?? product.swatches[0];
              const isFav = Boolean(wishlist[product.id]);
              const qtyInBag = bag[product.id] ?? 0;
              const photoSrc = effectivePhotos[photoIdx % effectivePhotos.length];
              const showPhoto = Boolean(photoSrc && !failedUrls[photoSrc]);

              return (
                <article
                  key={product.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#E6E2DA] bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[#34516A]/50 hover:shadow-[0_14px_30px_-16px_rgba(24,24,27,0.22)]"
                >
                  <div>
                    <div
                      className="relative aspect-[5/4] w-full overflow-hidden bg-[#F4F1EB] transition-shadow duration-300"
                      style={
                        showPhoto
                          ? { boxShadow: `inset 0 0 0 2px ${activeSwatch.hex}` }
                          : undefined
                      }
                    >
                      {showPhoto ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (hasUserPhotos && photoIdx < photos.length) {
                              onOpenPhoto?.(photoIdx);
                            }
                          }}
                          className="relative h-full w-full"
                          aria-label={`Inspect ${product.name}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoSrc}
                            alt={product.name}
                            onError={() =>
                              setFailedUrls((prev) => ({ ...prev, [photoSrc]: true }))
                            }
                            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                          />
                          {/* Sunlit alabaster inner frame + swatch color ring badge */}
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-1.5 rounded-lg border border-white/40"
                          />
                          <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-[#18181B] shadow-2xs backdrop-blur-xs">
                            <span
                              className="h-2 w-2 rounded-full border border-black/15 transition-colors duration-300"
                              style={{ backgroundColor: activeSwatch.hex }}
                            />
                            <span>{activeSwatch.name}</span>
                          </span>
                        </button>
                      ) : (
                        <BoutiqueGarmentPlateSvg
                          silhouette={product.silhouette}
                          tint={activeSwatch}
                          uid={`${uid}-${product.id}`}
                        />
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setWishlist((prev) => ({ ...prev, [product.id]: !isFav }))
                        }
                        aria-label={`Wishlist ${product.name}`}
                        aria-pressed={isFav}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#18181B] shadow-2xs"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5"
                          fill={isFav ? '#34516A' : 'none'}
                          stroke={isFav ? '#34516A' : 'currentColor'}
                          strokeWidth={1.8}
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

                    <div className="px-2.5 pt-2 sm:px-3">
                      <div className="flex items-center gap-1.5">
                        {product.swatches.map((sw, sIdx) => {
                          const selected = swIdx === sIdx;
                          return (
                            <button
                              key={sw.name}
                              type="button"
                              onClick={() =>
                                setSelectedSwatches((prev) => ({
                                  ...prev,
                                  [product.id]: sIdx,
                                }))
                              }
                              aria-label={`${product.name} ${sw.name}`}
                              aria-pressed={selected}
                              className={`h-3.5 w-3.5 rounded-full border transition ${
                                selected
                                  ? 'scale-110 border-[#18181B] ring-1 ring-[#18181B] ring-offset-1'
                                  : 'border-black/20'
                              }`}
                              style={{ backgroundColor: sw.hex }}
                            />
                          );
                        })}
                        <span className="ml-0.5 truncate text-[9px] text-[#18181B]/55">
                          {activeSwatch.name}
                        </span>
                      </div>

                      <h2 className="mt-1.5 line-clamp-1 font-editorial text-xs font-semibold text-[#18181B] sm:text-sm">
                        {product.name}
                      </h2>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-1 px-2.5 pb-2.5 sm:px-3 sm:pb-3">
                    <span className="font-tabular shrink-0 text-xs font-bold text-[#18181B]">
                      ₹{product.price}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setBag((prev) => ({
                            ...prev,
                            [product.id]: (prev[product.id] ?? 0) + 1,
                          }))
                        }
                        className="min-h-[28px] rounded-full border border-[#18181B]/20 px-2 text-[9.5px] font-semibold text-[#18181B] hover:bg-[#F3F1EC]"
                      >
                        {qtyInBag > 0 ? `+${qtyInBag}` : copy.addBagBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickInquire(product)}
                        className="min-h-[28px] rounded-full bg-[#34516A] px-2.5 text-[9.5px] font-semibold text-white hover:bg-[#273E52]"
                      >
                        {copy.inquireBtn}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Art-Led Visual Bento Lookbook Tiles (2-up even on phones) */}
        <section aria-label="Editorial stories" className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-[#E6E2DA] bg-white p-3 sm:p-4">
            <div className="min-w-0">
              <span className="font-mono text-[8.5px] font-bold uppercase tracking-[0.18em] text-[#34516A]">
                01 // EDIT
              </span>
              <h3 className="mt-1 font-editorial text-base font-normal leading-tight text-[#18181B] sm:text-xl">
                {copy.bentoLeftTitle}
              </h3>
            </div>
            <BentoVignetteSvg variant="arch" />
          </div>

          <div className="flex items-center justify-between gap-2 rounded-2xl border border-[#E6E2DA] bg-[#EFECE6] p-3 sm:p-4">
            <div className="min-w-0">
              <span className="font-mono text-[8.5px] font-bold uppercase tracking-[0.18em] text-[#18181B]/60">
                02 // CRAFT
              </span>
              <h3 className="mt-1 font-editorial text-base font-normal leading-tight text-[#18181B] sm:text-xl">
                {copy.bentoRightTitle}
              </h3>
            </div>
            <BentoVignetteSvg variant="weave" />
          </div>

          <div className="col-span-2 flex flex-col justify-between gap-3 rounded-2xl bg-[#18181B] p-4 text-[#F8F7F4] sm:flex-row sm:items-center sm:p-5">
            <div>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                SEASONAL ARCHIVE
              </span>
              <h3 className="mt-0.5 font-editorial text-lg font-normal text-white sm:text-2xl">
                {offerTag || copy.bentoWideTitle}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleBagCheckout}
              className="min-h-[40px] shrink-0 rounded-full bg-[#F8F7F4] px-5 text-xs font-bold text-[#18181B] transition hover:bg-white active:scale-95"
            >
              {copy.bentoWideCta}
            </button>
          </div>
        </section>

        {/* Sticky Concierge Bag Bar */}
        <div className="sticky bottom-14 z-20 flex items-center justify-between gap-2 rounded-2xl border border-[#18181B]/15 bg-[#18181B] p-3 text-[#F8F7F4] shadow-lg">
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-wider text-white/65">
              {bagCount > 0 ? `${bagCount} SELECTED` : storeName}
            </p>
            <p className="font-tabular truncate text-xs font-bold text-white">
              {bagCount > 0 ? `₹${bagTotal}` : copy.heroHeadline}
            </p>
          </div>
          <button
            type="button"
            onClick={handleBagCheckout}
            className="min-h-[38px] shrink-0 rounded-full bg-[#34516A] px-4 text-xs font-bold text-white transition hover:bg-[#436583] active:scale-95"
          >
            {copy.orderWhatsapp}
          </button>
        </div>
      </main>

      {toastMsg ? (
        <div
          role="status"
          className="fixed left-1/2 top-4 z-[110] -translate-x-1/2 rounded-full bg-[#18181B] px-4 py-2 text-xs font-semibold text-white shadow-xl"
        >
          {toastMsg}
        </div>
      ) : null}

      {inquiryPreview ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setInquiryPreview(null)}
          className="fixed inset-0 z-[115] flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-[#F8F7F4] p-4 text-[#18181B] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#E6E2DA] pb-2">
              <h3 className="font-editorial text-base font-semibold">{storeName}</h3>
              <button
                type="button"
                onClick={() => setInquiryPreview(null)}
                className="min-h-[40px] px-2 text-xs font-bold text-[#34516A]"
              >
                {sharedCopy.closeBtn}
              </button>
            </div>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-[#E6E2DA] bg-white p-3 font-mono text-[11px] leading-relaxed">
              {inquiryPreview}
            </pre>
            <button
              type="button"
              onClick={handleCopyInquiry}
              className="mt-3 min-h-[42px] w-full rounded-full bg-[#18181B] text-xs font-bold text-white"
            >
              {sharedCopy.copyOrderBtn}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
