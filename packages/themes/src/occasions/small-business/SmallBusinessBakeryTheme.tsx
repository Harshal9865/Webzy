'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import { AtmosphericGrainOverlay } from '../shared/OccasionCraftPrimitives';
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

type BakeryCategoryKey = 'all' | 'classic' | 'gourmet' | 'desserts' | 'hampers';

interface BakeryProduct {
  id: string;
  category: Exclude<BakeryCategoryKey, 'all'>;
  name: string;
  flavorTag: string;
  price: number;
  compareAt: number;
  artVariant: 'truffle' | 'berry' | 'caramel' | 'hamper' | 'pistachio' | 'espresso';
}

const DEFAULT_PRODUCTS: readonly BakeryProduct[] = [
  {
    id: 'bk-1',
    category: 'classic',
    name: 'Belgian Dark Truffle',
    flavorTag: '70% Cocoa · Eggless',
    price: 649,
    compareAt: 799,
    artVariant: 'truffle',
  },
  {
    id: 'bk-2',
    category: 'gourmet',
    name: 'Roasted Hazelnut Praline',
    flavorTag: 'Nut Crunch · Layered',
    price: 789,
    compareAt: 949,
    artVariant: 'caramel',
  },
  {
    id: 'bk-3',
    category: 'desserts',
    name: 'Raspberry Velvet Tart',
    flavorTag: 'Berry Compote · Silky',
    price: 399,
    compareAt: 499,
    artVariant: 'berry',
  },
  {
    id: 'bk-4',
    category: 'hampers',
    name: 'Signature Pastry Box (6)',
    flavorTag: 'Ribbon Gift Pack',
    price: 899,
    compareAt: 1099,
    artVariant: 'hamper',
  },
  {
    id: 'bk-5',
    category: 'gourmet',
    name: 'Pistachio Rose Tres Leches',
    flavorTag: 'Saffron Cream · Soft',
    price: 549,
    compareAt: 699,
    artVariant: 'pistachio',
  },
  {
    id: 'bk-6',
    category: 'desserts',
    name: 'Salted Espresso Brioche',
    flavorTag: 'Caramel Glaze · Warm',
    price: 329,
    compareAt: 399,
    artVariant: 'espresso',
  },
];

function HeroChocolateTruffleCakeSvg({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 220 220" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={`plate-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFDF9" />
          <stop offset="78%" stopColor="#F5E6D3" />
          <stop offset="100%" stopColor="#DFC2A2" />
        </radialGradient>
        <linearGradient id={`ganache-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5C2A1E" />
          <stop offset="48%" stopColor="#3B1811" />
          <stop offset="100%" stopColor="#240D08" />
        </linearGradient>
        <linearGradient id={`drip-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A1F15" />
          <stop offset="100%" stopColor="#1E0A06" />
        </linearGradient>
        <radialGradient id={`berry-${uid}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="70%" stopColor="#9F1239" />
          <stop offset="100%" stopColor="#58091E" />
        </radialGradient>
      </defs>

      {/* Ceramic dessert plate */}
      <circle cx="110" cy="112" r="98" fill={`url(#plate-${uid})`} stroke="#D97706" strokeWidth="1.5" strokeOpacity="0.4" />
      <circle cx="110" cy="112" r="84" fill="none" stroke="#8E2027" strokeWidth="1" strokeDasharray="3 5" strokeOpacity="0.25" />

      {/* Cake drop shadow */}
      <ellipse cx="110" cy="166" rx="68" ry="15" fill="#2C1618" fillOpacity="0.22" />

      {/* Lower cake tier */}
      <path d="M48 118v34c0 12 28 21 62 21s62-9 62-21v-34H48Z" fill="#4E2116" />
      {/* Cream filling ribbon */}
      <path d="M48 134c18 8 42 11 62 11s44-3 62-11v6c-18 8-42 11-62 11s-44-3-62-11v-6Z" fill="#FDE6C4" />

      {/* Upper ganache body */}
      <path d="M52 86v34c0 11 26 19 58 19s58-8 58-19V86H52Z" fill={`url(#ganache-${uid})`} />

      {/* Glossy chocolate drips */}
      <path
        d="M52 90c0 14 7 25 11 25s6-12 11-12 7 20 12 20 6-15 11-15 7 14 13 14 6-18 11-18 7 24 12 24 6-14 11-14 6 12 11 12 9-11 9-25c-15 10-37 14-54 14s-41-4-58-15Z"
        fill={`url(#drip-${uid})`}
      />

      {/* Top cake surface */}
      <ellipse cx="110" cy="86" rx="58" ry="20" fill="#3D170F" stroke="#78350F" strokeWidth="1.2" />

      {/* Specular ganache gloss highlight */}
      <path
        d="M66 84c12-10 38-13 62-9"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeOpacity="0.32"
      />

      {/* Piped whipped rosette swirls */}
      {[
        { cx: 74, cy: 84 },
        { cx: 90, cy: 74 },
        { cx: 110, cy: 71 },
        { cx: 130, cy: 74 },
        { cx: 146, cy: 84 },
        { cx: 92, cy: 96 },
        { cx: 128, cy: 96 },
      ].map((swirl, i) => (
        <g key={`swirl-${i}`}>
          <circle cx={swirl.cx} cy={swirl.cy} r="7.5" fill="#F7E4CA" />
          <path
            d={`M${swirl.cx - 4} ${swirl.cy}c1-3 5-4 7-1 1 3-2 5-4 4`}
            fill="none"
            stroke="#C8935A"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* Artisanal berries & gold leaf center */}
      <circle cx="110" cy="85" r="9" fill={`url(#berry-${uid})`} />
      <circle cx="99" cy="88" r="6.5" fill={`url(#berry-${uid})`} />
      <circle cx="121" cy="88" r="6.5" fill={`url(#berry-${uid})`} />
      <circle cx="107" cy="81" r="2" fill="#FFFFFF" fillOpacity="0.55" />
      <path d="M112 76c5-5 12-5 15-1-4 4-10 5-15 1Z" fill="#2E7D32" />
      <path d="M106 77c-5-5-11-4-14 0 4 4 9 4 14 0Z" fill="#388E3C" />
      {/* Gold dust specks */}
      <circle cx="84" cy="88" r="1.4" fill="#F59E0B" />
      <circle cx="137" cy="87" r="1.6" fill="#F59E0B" />
      <circle cx="114" cy="95" r="1.3" fill="#FBBF24" />
    </svg>
  );
}

function ProductArtSvg({ variant }: { variant: BakeryProduct['artVariant'] }) {
  if (variant === 'truffle') {
    return (
      <svg viewBox="0 0 120 96" className="h-full w-full" aria-hidden="true">
        <ellipse cx="60" cy="76" rx="40" ry="8" fill="#E8D8C5" />
        <path d="M28 42v24c0 7 14 12 32 12s32-5 32-12V42H28Z" fill="#3F1A12" />
        <ellipse cx="60" cy="42" rx="32" ry="11" fill="#5B281B" />
        <path d="M36 42c6-5 20-7 34-5" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="60" cy="39" r="6" fill="#9F1239" />
        <circle cx="52" cy="41" r="4.5" fill="#FDE6C4" />
        <circle cx="68" cy="41" r="4.5" fill="#FDE6C4" />
      </svg>
    );
  }
  if (variant === 'berry') {
    return (
      <svg viewBox="0 0 120 96" className="h-full w-full" aria-hidden="true">
        <ellipse cx="60" cy="76" rx="40" ry="8" fill="#E8D8C5" />
        <path d="M30 50l6 20c2 5 12 8 24 8s22-3 24-8l6-20H30Z" fill="#D4A373" />
        <ellipse cx="60" cy="50" rx="30" ry="9" fill="#9F1239" />
        <circle cx="52" cy="47" r="5" fill="#E11D48" />
        <circle cx="62" cy="45" r="5.5" fill="#BE123C" />
        <circle cx="69" cy="49" r="4.5" fill="#F43F5E" />
      </svg>
    );
  }
  if (variant === 'caramel') {
    return (
      <svg viewBox="0 0 120 96" className="h-full w-full" aria-hidden="true">
        <ellipse cx="60" cy="76" rx="40" ry="8" fill="#E8D8C5" />
        <rect x="30" y="38" width="60" height="32" rx="8" fill="#78350F" />
        <path d="M30 46c8 7 14-2 20 5s12-4 18 4 14-5 22 2v-15c0-3-3-6-6-6H36c-3 0-6 3-6 6v4Z" fill="#D97706" />
        <circle cx="48" cy="35" r="5" fill="#B45309" />
        <circle cx="60" cy="33" r="5.5" fill="#F59E0B" />
        <circle cx="72" cy="35" r="5" fill="#B45309" />
      </svg>
    );
  }
  if (variant === 'hamper') {
    return (
      <svg viewBox="0 0 120 96" className="h-full w-full" aria-hidden="true">
        <rect x="26" y="34" width="68" height="44" rx="6" fill="#8E2027" />
        <rect x="22" y="28" width="76" height="12" rx="4" fill="#A62B33" />
        <rect x="55" y="28" width="10" height="50" fill="#F59E0B" />
        <path d="M60 28c-8-10-18-6-14 0 3 4 14 0 14 0Zm0 0c8-10 18-6 14 0-3 4-14 0-14 0Z" fill="#FBBF24" />
      </svg>
    );
  }
  if (variant === 'pistachio') {
    return (
      <svg viewBox="0 0 120 96" className="h-full w-full" aria-hidden="true">
        <ellipse cx="60" cy="76" rx="40" ry="8" fill="#E8D8C5" />
        <rect x="30" y="42" width="60" height="28" rx="8" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.2" />
        <path d="M30 48h60v6H30z" fill="#A7F3D0" />
        <circle cx="52" cy="39" r="4" fill="#059669" />
        <circle cx="62" cy="38" r="4.5" fill="#F43F5E" />
        <circle cx="70" cy="40" r="3.5" fill="#10B981" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 96" className="h-full w-full" aria-hidden="true">
      <ellipse cx="60" cy="76" rx="38" ry="8" fill="#E8D8C5" />
      <path d="M34 52c0-15 12-24 26-24s26 9 26 24v16c0 4-12 7-26 7s-26-3-26-7V52Z" fill="#92400E" />
      <path d="M38 46c8 6 16-2 22 4s14-5 22 1c-2-13-11-21-22-21s-20 7-22 16Z" fill="#F59E0B" fillOpacity="0.8" />
    </svg>
  );
}

function PromiseIcon({ idx }: { idx: number }) {
  if (idx === 0) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.9} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3.5 2" />
      </svg>
    );
  }
  if (idx === 1) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.9} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.4 5.2 5.6.8-4 4 .9 5.6L12 16l-4.9 2.6.9-5.6-4-4 5.6-.8L12 3Z" />
      </svg>
    );
  }
  if (idx === 2) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.9} aria-hidden="true">
        <rect x="4" y="8" width="16" height="12" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v12M4 12h16M12 8c-2 0-3.5-1.2-3.5-2.6 0-1.3 1.4-2 3.5.1 2.1-2.1 3.5-1.4 3.5-.1C15.5 6.8 14 8 12 8Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.9} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v10H8l-4 4V6Z" />
    </svg>
  );
}

/**
 * Small Business Theme 1: "Artisan Bakehouse" (Dakingo-inspired).
 * Warm vanilla cream, berry-cocoa rounded hero, wavy discount pill, filtering categories & live WhatsApp Order Bag.
 */
export function SmallBusinessBakeryTheme({
  data,
  language,
  onOpened,
  onOpenPhoto,
}: SmallBusinessThemeComponentProps) {
  const uid = useId().replace(/:/g, '');
  const coreLang = toCoreLanguageCode(language);
  const copy = SMALL_BUSINESS_THEMES_COPY[coreLang]?.bakery ?? SMALL_BUSINESS_THEMES_COPY.en.bakery;
  const sharedCopy = SMALL_BUSINESS_THEMES_COPY[coreLang] ?? SMALL_BUSINESS_THEMES_COPY.en;

  const storeName = deriveStoreName(data, copy.defaultStore);
  const monogram = extractStoreMonogram(storeName);
  const headline = pickLocalizedText(data.headline, language).trim() || storeName;
  const message = pickLocalizedText(data.message, language).trim() || copy.heroTag;
  const offerText = data.offerTag ? pickLocalizedText(data.offerTag, language).trim() : '';

  const photos = getValidPhotos(data.photos);
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<BakeryCategoryKey>('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({ 'bk-1': true });
  const [cart, setCart] = useState<Record<string, number>>({ 'bk-1': 1 });
  const [offerApplied, setOfferApplied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showOrderSheet, setShowOrderSheet] = useState(false);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!showOrderSheet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowOrderSheet(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showOrderSheet]);

  const customHighlights = deriveHighlights(data, language);
  const catalog: BakeryProduct[] = useMemo(() => {
    if (customHighlights.length === 0) return [...DEFAULT_PRODUCTS];
    return DEFAULT_PRODUCTS.map((item, idx) => {
      const h = customHighlights[idx];
      if (!h) return item;
      return {
        ...item,
        name: h.title || item.name,
        flavorTag: h.detail || item.flavorTag,
      };
    });
  }, [customHighlights]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return catalog;
    return catalog.filter((item) => item.category === activeCategory);
  }, [activeCategory, catalog]);

  const bagItems = useMemo(() => {
    return catalog
      .filter((item) => (cart[item.id] ?? 0) > 0)
      .map((item) => ({ ...item, qty: cart[item.id] ?? 0 }));
  }, [cart, catalog]);

  const totalCount = bagItems.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = bagItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const finalTotal = offerApplied ? Math.round(subtotal * 0.8) : subtotal;

  const validWa = sanitizeWhatsappPhone(data.whatsappPhone);
  const itemizedOrderText = useMemo(() => {
    const lines = [
      `Hello ${storeName}, I would like to place an order:`,
      ...bagItems.map((item) => `- ${item.name} x${item.qty} (INR ${item.price * item.qty})`),
      offerApplied ? `Applied Offer: ${offerText || '20% Bakehouse Celebration Privilege'}` : '',
      `Estimated Total: INR ${finalTotal}`,
    ].filter(Boolean);
    return lines.join('\n');
  }, [bagItems, finalTotal, offerApplied, offerText, storeName]);

  const waHref = buildWhatsAppOrderHref(validWa, itemizedOrderText);

  function flashToast(msg: string) {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 2600);
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      return { ...prev, [id]: next };
    });
  }

  function handleWhatsAppCheckout() {
    onOpened?.();
    if (waHref) {
      window.open(waHref, '_blank', 'noopener,noreferrer');
      return;
    }
    setShowOrderSheet(true);
    flashToast(sharedCopy.demoOrderToast);
  }

  async function handleCopyOrder() {
    try {
      await navigator.clipboard?.writeText(itemizedOrderText);
    } catch {
      // Clipboard restricted in embedded contexts; feedback still renders.
    }
    flashToast(sharedCopy.copiedToast);
  }

  const categoryKeys: readonly BakeryCategoryKey[] = [
    'all',
    'classic',
    'gourmet',
    'desserts',
    'hampers',
  ];

  const heroPhoto = photos[0] && !failedUrls[photos[0]] ? photos[0] : null;

  return (
    <div
      className="relative flex min-h-full w-full flex-col overflow-x-clip bg-[#FDF9F3] text-[#2C1618]"
      style={hiSafeStyle(language)}
    >
      {/* Top Sticky Brand Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-[#8E2027]/10 bg-[#FDF9F3]/95 px-3.5 py-2 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8E2027] font-heading text-xs font-bold text-[#FDF9F3] shadow-xs">
            {monogram}
          </span>
          <span className="truncate font-heading text-sm font-bold tracking-tight text-[#2C1618] sm:text-base">
            {storeName}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowOrderSheet(true)}
          className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full border border-[#8E2027]/20 bg-white px-3 py-1 text-[11px] font-bold text-[#8E2027] shadow-2xs transition active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12l-1 13H7L6 7Zm3 0V5a3 3 0 0 1 6 0v2" />
          </svg>
          <span>
            {copy.bagLabel} ({totalCount})
          </span>
        </button>
      </header>

      {/* Festive Berry-Cocoa Rounded Promo Hero */}
      <section className="relative overflow-hidden rounded-b-[32px] bg-[#8E2027] px-4 pb-7 pt-5 text-[#FDF9F3] shadow-[0_18px_36px_-18px_rgba(142,32,39,0.55)] sm:px-8 sm:py-8">
        <AtmosphericGrainOverlay opacity={0.07} />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-5 md:flex-row md:justify-between">
          <div className="flex max-w-md flex-col items-center text-center md:items-start md:text-left">
            {/* Wavy Save 20% Badge */}
            <button
              type="button"
              onClick={() => {
                setOfferApplied(true);
                flashToast(copy.offerApplied);
              }}
              className="group relative inline-flex items-center gap-1.5 rounded-full border border-[#FBBF24]/60 bg-[#B45309] px-3.5 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-white shadow-sm transition hover:scale-105 active:scale-95"
            >
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                <path d="M8 1l1.9 3.6L14 5.3l-2.9 2.9.6 4.1L8 10.4l-3.7 1.9.6-4.1L2 5.3l4.1-.7L8 1Z" />
              </svg>
              <span>{offerText || copy.saveBadge}</span>
            </button>

            <p className="mt-2.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#FDE6C4]/80">
              {copy.eyebrow}
            </p>
            <h1 className="mt-1 break-words font-heading text-2xl font-bold leading-tight text-[#FFFDF9] sm:text-3xl md:text-4xl">
              {headline}
            </h1>
            <p className="mt-2 break-words text-xs leading-relaxed text-[#FDF9F3]/85 sm:text-sm">
              {message}
            </p>

            {/* Floating mini flavor medallions */}
            <div className="mt-3.5 flex flex-wrap justify-center gap-1.5 md:justify-start">
              {['70% Dark', 'Fresh Cream', 'Eggless'].map((medallion) => (
                <span
                  key={medallion}
                  className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#FDE6C4]"
                >
                  {medallion}
                </span>
              ))}
            </div>
          </div>

          {/* Centerpiece Artisanal Truffle Cake Medallion or Buyer Photo */}
          <div className="relative flex h-44 w-44 shrink-0 items-center justify-center sm:h-52 sm:w-52">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-[#D97706]/25 blur-xl"
            />
            {heroPhoto ? (
              <button
                type="button"
                onClick={() => onOpenPhoto?.(0)}
                aria-label="Inspect featured bakery photo"
                className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-[#FDE6C4] bg-[#FDF9F3] shadow-xl transition hover:scale-[1.03] sm:h-48 sm:w-48"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroPhoto}
                  alt={storeName}
                  onError={() => setFailedUrls((prev) => ({ ...prev, [heroPhoto]: true }))}
                  className="h-full w-full object-cover"
                />
              </button>
            ) : (
              <div className="relative h-44 w-44 sm:h-52 sm:w-52">
                <HeroChocolateTruffleCakeSvg uid={uid} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sticky Category Filter Pills */}
      <div className="sticky top-[53px] z-20 border-b border-[#8E2027]/10 bg-[#FDF9F3]/95 px-3.5 py-2.5 backdrop-blur-md sm:px-6">
        <div
          role="tablist"
          aria-label="Bakery categories"
          className="mx-auto flex max-w-5xl items-center gap-1.5 overflow-x-auto scrollbar-none"
        >
          {categoryKeys.map((catKey, idx) => {
            const isSelected = activeCategory === catKey;
            return (
              <button
                key={catKey}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveCategory(catKey)}
                className={`min-h-[36px] shrink-0 rounded-full px-3.5 py-1 text-[11px] font-bold transition active:scale-95 ${
                  isSelected
                    ? 'bg-[#8E2027] text-[#FDF9F3] shadow-xs'
                    : 'border border-[#8E2027]/20 bg-white text-[#2C1618]/80 hover:bg-[#8E2027]/5'
                }`}
              >
                {copy.categories[idx]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-3.5 pb-8 pt-5 sm:px-6">
        {/* Bestsellers Grid (2-up mobile, 4-up desktop) */}
        <section aria-labelledby={`bakery-best-${uid}`}>
          <div className="mb-3 flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id={`bakery-best-${uid}`}
                className="font-heading text-lg font-bold text-[#2C1618] sm:text-xl"
              >
                {copy.bestsellerHeading}
              </h2>
              <p className="text-[11px] text-[#2C1618]/70 sm:text-xs">{copy.bestsellerSub}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const origIdx = catalog.findIndex((c) => c.id === product.id);
              const photoIdx = origIdx >= 0 ? origIdx : 0;
              const qty = cart[product.id] ?? 0;
              const isFav = Boolean(favorites[product.id]);
              const photoUrl = photos[photoIdx];
              const showPhoto = Boolean(photoUrl && !failedUrls[photoUrl]);

              return (
                <article
                  key={product.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#8E2027]/12 bg-white p-2 shadow-2xs transition hover:shadow-md sm:p-3"
                >
                  <div>
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#FDF5EA]">
                      {showPhoto ? (
                        <button
                          type="button"
                          onClick={() => onOpenPhoto?.(photoIdx)}
                          className="h-full w-full"
                          aria-label={`View ${product.name}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoUrl}
                            alt={product.name}
                            onError={() =>
                              setFailedUrls((prev) => ({ ...prev, [photoUrl]: true }))
                            }
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center p-2">
                          <ProductArtSvg variant={product.artVariant} />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setFavorites((prev) => ({ ...prev, [product.id]: !isFav }))
                        }
                        aria-label={`Favorite ${product.name}`}
                        aria-pressed={isFav}
                        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#8E2027] shadow-xs transition active:scale-90"
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

                    <p className="mt-2 truncate text-[9.5px] font-bold uppercase tracking-wider text-[#B45309]">
                      {product.flavorTag}
                    </p>
                    <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-snug text-[#2C1618] sm:text-sm">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5 border-t border-[#8E2027]/10 pt-2">
                    <div className="flex flex-col leading-tight">
                      <span className="font-tabular text-xs font-extrabold text-[#2C1618] sm:text-sm">
                        ₹{product.price}
                      </span>
                      <span className="font-tabular text-[10px] text-[#2C1618]/60 line-through">
                        ₹{product.compareAt}
                      </span>
                    </div>

                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => updateQty(product.id, 1)}
                        className="min-h-[34px] rounded-full bg-[#8E2027] px-2.5 py-1 text-[10.5px] font-bold text-[#FDF9F3] transition hover:bg-[#73181E] active:scale-95"
                      >
                        {copy.addBag}
                      </button>
                    ) : (
                      <div className="inline-flex min-h-[34px] items-center rounded-full border border-[#8E2027]/25 bg-[#FDF9F3] px-0.5">
                        <button
                          type="button"
                          onClick={() => updateQty(product.id, -1)}
                          aria-label={`Remove one ${product.name}`}
                          className="flex h-6 w-5 items-center justify-center rounded-full text-xs font-bold text-[#8E2027] hover:bg-white sm:w-6"
                        >
                          -
                        </button>
                        <span className="font-tabular px-1 text-[11px] font-extrabold text-[#2C1618] sm:px-1.5">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(product.id, 1)}
                          aria-label={`Add one ${product.name}`}
                          className="flex h-6 w-5 items-center justify-center rounded-full text-xs font-bold text-[#8E2027] hover:bg-white sm:w-6"
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
        </section>

        {/* Our Promise 4-Icon Strip */}
        <section
          aria-labelledby={`bakery-promise-${uid}`}
          className="rounded-2xl border border-[#D97706]/25 bg-white p-3.5 shadow-2xs sm:p-5"
        >
          <h2
            id={`bakery-promise-${uid}`}
            className="text-center font-heading text-sm font-bold text-[#2C1618] sm:text-base"
          >
            {copy.promiseHeading}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {copy.promises.map((label, idx) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl bg-[#FDF9F3] p-2.5 text-[#8E2027]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8E2027]/10 text-[#8E2027]">
                  <PromiseIcon idx={idx} />
                </span>
                <span className="text-[11px] font-bold leading-tight text-[#2C1618]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Golden Celebration Ticket Promo Card */}
        <section
          aria-label={copy.ticketTitle}
          className="relative overflow-hidden rounded-2xl border border-[#D97706]/50 bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#F59E0B]/55 p-4 text-[#2C1618] shadow-sm sm:p-5"
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#92400E]">
                {copy.ticketEyebrow}
              </p>
              <h3 className="mt-0.5 font-heading text-base font-bold text-[#2C1618] sm:text-lg">
                {copy.ticketTitle}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#2C1618]/85">
                {offerText || copy.ticketDefaultOffer}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setOfferApplied((prev) => !prev);
                flashToast(!offerApplied ? copy.offerApplied : copy.claimOffer);
              }}
              className={`min-h-[42px] shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition active:scale-95 ${
                offerApplied
                  ? 'bg-[#2C1618] text-[#FDE68A]'
                  : 'bg-[#8E2027] text-white shadow-sm hover:bg-[#73181E]'
              }`}
            >
              {offerApplied ? copy.offerApplied : copy.claimOffer}
            </button>
          </div>
        </section>

        {/* Sticky Order Bag Bar */}
        <div className="sticky bottom-14 z-20 rounded-2xl border border-[#8E2027]/20 bg-[#2C1618] p-3 text-[#FDF9F3] shadow-[0_14px_32px_-12px_rgba(44,22,24,0.65)] sm:p-3.5">
          {totalCount > 0 ? (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowOrderSheet(true)}
                className="min-w-0 text-left"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#FDE6C4]/80">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'}
                  {offerApplied ? ' · 20% OFF' : ''}
                </p>
                <p className="font-tabular truncate text-sm font-extrabold text-white">
                  ₹{finalTotal}
                </p>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="inline-flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-full bg-[#F59E0B] px-4 py-2 text-xs font-extrabold text-[#2C1618] shadow-sm transition hover:bg-[#FBBF24] active:scale-95"
              >
                <span>{copy.orderWhatsapp}</span>
              </button>
            </div>
          ) : (
            <p className="text-center text-[11px] font-medium text-[#FDE6C4]/90">
              {copy.emptyBagHint}
            </p>
          )}
        </div>
      </main>

      {/* Toast Feedback */}
      {toastMsg ? (
        <div
          role="status"
          className="fixed left-1/2 top-4 z-[110] -translate-x-1/2 rounded-full bg-[#2C1618] px-4 py-2 text-xs font-bold text-[#FDE6C4] shadow-xl"
        >
          {toastMsg}
        </div>
      ) : null}

      {/* Itemized Order Preview Sheet (for demo fallback or bag review) */}
      {showOrderSheet ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={copy.bagLabel}
          onClick={() => setShowOrderSheet(false)}
          className="fixed inset-0 z-[115] flex items-end justify-center bg-black/60 p-3 backdrop-blur-xs sm:items-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-[#FDF9F3] p-4 text-[#2C1618] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#8E2027]/15 pb-2.5">
              <h3 className="font-heading text-base font-bold text-[#8E2027]">
                {storeName} · {copy.bagLabel}
              </h3>
              <button
                type="button"
                onClick={() => setShowOrderSheet(false)}
                className="min-h-[44px] rounded-full px-3 text-xs font-bold text-[#2C1618]/75 hover:bg-black/5"
              >
                {sharedCopy.closeBtn}
              </button>
            </div>

            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
              {bagItems.length === 0 ? (
                <p className="py-4 text-center text-xs text-[#2C1618]/70">{copy.emptyBagHint}</p>
              ) : (
                bagItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-white p-2.5 text-xs shadow-2xs"
                  >
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-[11px] text-[#2C1618]/65">
                        ₹{item.price} × {item.qty}
                      </p>
                    </div>
                    <span className="font-tabular font-extrabold text-[#8E2027]">
                      ₹{item.price * item.qty}
                    </span>
                  </div>
                ))
              )}
            </div>

            {bagItems.length > 0 ? (
              <div className="mt-3 space-y-2 border-t border-[#8E2027]/15 pt-3">
                <div className="flex items-center justify-between text-sm font-extrabold">
                  <span>Total</span>
                  <span className="font-tabular text-[#8E2027]">₹{finalTotal}</span>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {waHref ? (
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onOpened?.()}
                      className="flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-[#8E2027] px-4 text-xs font-bold text-white"
                    >
                      {copy.orderWhatsapp}
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleCopyOrder}
                    className="flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-[#8E2027]/25 bg-white px-4 text-xs font-bold text-[#8E2027]"
                  >
                    {sharedCopy.copyOrderBtn}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
