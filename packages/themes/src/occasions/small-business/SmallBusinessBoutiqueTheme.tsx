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
  subtitle: string;
  price: number;
  silhouette: 'trench' | 'loafer' | 'tote' | 'shirt' | 'sneaker' | 'scarf';
  swatches: readonly SwatchTint[];
}

const BOUTIQUE_PRODUCTS: readonly BoutiqueProduct[] = [
  {
    id: 'bt-1',
    category: 'apparel',
    name: 'Relaxed Linen Overshirt',
    subtitle: 'Breathable Belgian weave',
    price: 2190,
    silhouette: 'shirt',
    swatches: [
      { name: 'Denim Slate', hex: '#34516A', accentHex: '#23384B' },
      { name: 'Oatmeal', hex: '#D8CFC2', accentHex: '#B6A996' },
      { name: 'Charcoal', hex: '#27272A', accentHex: '#18181B' },
    ],
  },
  {
    id: 'bt-2',
    category: 'footwear',
    name: 'Minimalist Court Low',
    subtitle: 'Full-grain calfskin upper',
    price: 3290,
    silhouette: 'sneaker',
    swatches: [
      { name: 'Chalk White', hex: '#ECEBE6', accentHex: '#CFCBC2' },
      { name: 'Espresso', hex: '#4A372D', accentHex: '#2E2019' },
      { name: 'Slate', hex: '#475569', accentHex: '#334155' },
    ],
  },
  {
    id: 'bt-3',
    category: 'accessories',
    name: 'Structured Canvas Tote',
    subtitle: 'Waxed cotton & leather trim',
    price: 1690,
    silhouette: 'tote',
    swatches: [
      { name: 'Sandstone', hex: '#C7B8A1', accentHex: '#9C8A70' },
      { name: 'Deep Navy', hex: '#25394D', accentHex: '#172533' },
      { name: 'Ink Black', hex: '#1F1F23', accentHex: '#09090B' },
    ],
  },
  {
    id: 'bt-4',
    category: 'apparel',
    name: 'Tailored Wool Trench',
    subtitle: 'Clean storm-flap drape',
    price: 4490,
    silhouette: 'trench',
    swatches: [
      { name: 'Camel', hex: '#B7936B', accentHex: '#8E6D48' },
      { name: 'Denim Slate', hex: '#34516A', accentHex: '#1F3447' },
      { name: 'Obsidian', hex: '#18181B', accentHex: '#09090B' },
    ],
  },
  {
    id: 'bt-5',
    category: 'footwear',
    name: 'Suede Penny Loafer',
    subtitle: 'Hand-stitched apron toe',
    price: 3590,
    silhouette: 'loafer',
    swatches: [
      { name: 'Tobacco', hex: '#8A5A3B', accentHex: '#643E26' },
      { name: 'Ash Grey', hex: '#71717A', accentHex: '#52525B' },
      { name: 'Charcoal', hex: '#27272A', accentHex: '#18181B' },
    ],
  },
  {
    id: 'bt-6',
    category: 'accessories',
    name: 'Cashmere Rib Scarf',
    subtitle: 'Soft brushed winter weave',
    price: 1290,
    silhouette: 'scarf',
    swatches: [
      { name: 'Heather Slate', hex: '#4B6378', accentHex: '#34495B' },
      { name: 'Ivory', hex: '#E6E1D6', accentHex: '#C6BFAE' },
      { name: 'Bordeaux', hex: '#6D2E3B', accentHex: '#4E1D27' },
    ],
  },
];

function BoutiqueGarmentSvg({
  silhouette,
  tint,
}: {
  silhouette: BoutiqueProduct['silhouette'];
  tint: SwatchTint;
}) {
  if (silhouette === 'shirt') {
    return (
      <svg viewBox="0 0 120 110" className="h-full w-full" aria-hidden="true">
        <path
          d="M36 22 L48 16 L72 16 L84 22 L102 38 L94 86 L80 86 L82 44 L80 94 L40 94 L38 44 L40 86 L26 86 L18 38 Z"
          fill={tint.hex}
          stroke={tint.accentHex}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <line x1="60" y1="22" x2="60" y2="94" stroke={tint.accentHex} strokeWidth="1.2" />
        <rect x="44" y="46" width="11" height="13" rx="1.5" fill="none" stroke={tint.accentHex} strokeWidth="1" />
      </svg>
    );
  }
  if (silhouette === 'trench') {
    return (
      <svg viewBox="0 0 120 110" className="h-full w-full" aria-hidden="true">
        <path
          d="M38 18 L48 14 L72 14 L82 18 L98 40 L90 92 L78 92 L78 44 L82 96 L38 96 L42 44 L42 92 L30 92 L22 40 Z"
          fill={tint.hex}
          stroke={tint.accentHex}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <rect x="40" y="54" width="40" height="5" fill={tint.accentHex} />
        <path d="M48 14 L60 36 L72 14" fill="none" stroke={tint.accentHex} strokeWidth="1.4" />
      </svg>
    );
  }
  if (silhouette === 'tote') {
    return (
      <svg viewBox="0 0 120 110" className="h-full w-full" aria-hidden="true">
        <path d="M44 40 V26 C44 17 76 17 76 26 V40" fill="none" stroke={tint.accentHex} strokeWidth="3.2" strokeLinecap="round" />
        <rect x="30" y="40" width="60" height="54" rx="4" fill={tint.hex} stroke={tint.accentHex} strokeWidth="1.6" />
        <line x1="30" y1="54" x2="90" y2="54" stroke={tint.accentHex} strokeWidth="1.2" />
      </svg>
    );
  }
  if (silhouette === 'sneaker') {
    return (
      <svg viewBox="0 0 120 110" className="h-full w-full" aria-hidden="true">
        <path
          d="M22 68 L36 44 L50 52 L68 48 L96 64 C100 66 100 74 94 76 H24 C20 76 20 71 22 68Z"
          fill={tint.hex}
          stroke={tint.accentHex}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <rect x="22" y="75" width="76" height="8" rx="3" fill="#FFFFFF" stroke={tint.accentHex} strokeWidth="1.3" />
      </svg>
    );
  }
  if (silhouette === 'loafer') {
    return (
      <svg viewBox="0 0 120 110" className="h-full w-full" aria-hidden="true">
        <path
          d="M22 72 L30 48 C38 56 54 56 64 50 L96 66 C100 69 98 76 92 78 H24 Z"
          fill={tint.hex}
          stroke={tint.accentHex}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M52 54 H66" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="22" y="77" width="74" height="6" rx="2" fill={tint.accentHex} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 110" className="h-full w-full" aria-hidden="true">
      <rect x="38" y="22" width="22" height="66" rx="4" fill={tint.hex} stroke={tint.accentHex} strokeWidth="1.4" />
      <rect x="52" y="26" width="28" height="58" rx="4" fill={tint.hex} stroke={tint.accentHex} strokeWidth="1.4" />
      <line x1="42" y1="88" x2="42" y2="95" stroke={tint.accentHex} strokeWidth="1.5" />
      <line x1="48" y1="88" x2="48" y2="95" stroke={tint.accentHex} strokeWidth="1.5" />
      <line x1="54" y1="88" x2="54" y2="95" stroke={tint.accentHex} strokeWidth="1.5" />
    </svg>
  );
}

function HeroHangerArtSvg() {
  return (
    <svg viewBox="0 0 180 150" className="h-full w-full" aria-hidden="true">
      <path d="M90 22 C90 14 100 14 100 22 C100 26 95 29 90 32" fill="none" stroke="#F8F7F4" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M90 32 L38 56 H142 L90 32Z" fill="none" stroke="#F8F7F4" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M54 56 L46 126 H134 L126 56" fill="#F8F7F4" fillOpacity="0.14" stroke="#F8F7F4" strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="90" y1="56" x2="90" y2="126" stroke="#F8F7F4" strokeWidth="1.2" strokeOpacity="0.6" />
    </svg>
  );
}

/**
 * Small Business Theme 3: "Everyday Minimalist" (Forma / Mixtas Style).
 * Alabaster canvas, editorial denim-slate hero, live color-swatch cards, category/sort controls & bento grid.
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
  const message = pickLocalizedText(data.message, language).trim();
  const offerTag = data.offerTag ? pickLocalizedText(data.offerTag, language).trim() : '';

  const photos = getValidPhotos(data.photos);
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
        subtitle: h.detail || item.subtitle,
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

  const heroPhoto = photos[0] && !failedUrls[photos[0]] ? photos[0] : null;
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
      {/* Minimalist Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-[#E6E2DA] bg-[#F8F7F4]/95 px-3.5 py-3 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#18181B] font-mono text-[10px] font-bold tracking-wider text-[#F8F7F4]">
            {monogram}
          </span>
          <span className="truncate font-editorial text-base font-semibold tracking-tight text-[#18181B] sm:text-lg">
            {storeName}
          </span>
        </div>

        <button
          type="button"
          onClick={handleBagCheckout}
          className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full border border-[#18181B]/15 bg-white px-3 py-1 text-[11px] font-semibold text-[#18181B] transition hover:border-[#34516A]"
        >
          <span>{bagCount > 0 ? `Bag (${bagCount})` : copy.inquireBtn}</span>
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-3.5 py-4 sm:px-6 sm:py-6">
        {/* Editorial Denim-Slate Seasonal Lookbook Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-[#34516A] p-4 text-[#F8F7F4] shadow-[0_16px_34px_-18px_rgba(24,24,27,0.45)] sm:p-7">
          <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
            <div className="md:col-span-7">
              <span className="inline-block rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#F8F7F4]">
                {offerTag || copy.seasonBadge}
              </span>
              <h1 className="mt-2.5 break-words font-editorial text-2xl font-normal leading-tight text-white sm:text-4xl">
                {headline}
              </h1>
              {message ? (
                <p className="mt-2 max-w-md break-words text-xs leading-relaxed text-[#F8F7F4]/85 sm:text-sm">
                  {message}
                </p>
              ) : null}

              <button
                type="button"
                onClick={() =>
                  catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="mt-4 inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#F8F7F4] px-5 py-2 text-xs font-bold text-[#18181B] transition hover:bg-white active:scale-95"
              >
                <span>{copy.exploreCta}</span>
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10m-4-4 4 4-4 4" />
                </svg>
              </button>
            </div>

            <div className="flex justify-center md:col-span-5 md:justify-end">
              {heroPhoto ? (
                <button
                  type="button"
                  onClick={() => onOpenPhoto?.(0)}
                  className="aspect-[4/3] w-full max-w-[230px] overflow-hidden rounded-xl border border-white/25 bg-black/15"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroPhoto}
                    alt={storeName}
                    onError={() =>
                      setFailedUrls((prev) => ({ ...prev, [heroPhoto]: true }))
                    }
                    className="h-full w-full object-cover"
                  />
                </button>
              ) : (
                <div className="h-36 w-44 sm:h-44 sm:w-52">
                  <HeroHangerArtSvg />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Category Tabs + Quick Price Sort Pill */}
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
                    className={`min-h-[36px] shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition ${
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
              className="min-h-[34px] shrink-0 rounded-full border border-[#E6E2DA] bg-white px-3 text-[10.5px] font-semibold text-[#18181B] hover:border-[#34516A]"
            >
              {sortLabel}
            </button>
          </div>

          {/* 2-up Mobile / 3-4-up Desktop Lookbook Product Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const origIdx = BOUTIQUE_PRODUCTS.findIndex((b) => b.id === product.id);
              const photoIdx = origIdx >= 0 ? origIdx : 0;
              const swIdx = selectedSwatches[product.id] ?? 0;
              const activeSwatch = product.swatches[swIdx] ?? product.swatches[0];
              const isFav = Boolean(wishlist[product.id]);
              const qtyInBag = bag[product.id] ?? 0;
              const photoSrc = photos[photoIdx];
              const showPhoto = Boolean(photoSrc && !failedUrls[photoSrc]);

              return (
                <article
                  key={product.id}
                  className="flex flex-col justify-between overflow-hidden rounded-xl border border-[#E6E2DA] bg-white p-2.5 transition hover:border-[#34516A]/45 sm:p-3"
                >
                  <div>
                    <div
                      className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#F3F1EC]"
                      style={
                        showPhoto
                          ? { boxShadow: `inset 0 0 0 2px ${activeSwatch.hex}` }
                          : undefined
                      }
                    >
                      {showPhoto ? (
                        <button
                          type="button"
                          onClick={() => onOpenPhoto?.(photoIdx)}
                          className="h-full w-full"
                          aria-label={`Inspect ${product.name}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoSrc}
                            alt={product.name}
                            onError={() =>
                              setFailedUrls((prev) => ({ ...prev, [photoSrc]: true }))
                            }
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center p-2">
                          <BoutiqueGarmentSvg
                            silhouette={product.silhouette}
                            tint={activeSwatch}
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setWishlist((prev) => ({ ...prev, [product.id]: !isFav }))
                        }
                        aria-label={`Wishlist ${product.name}`}
                        aria-pressed={isFav}
                        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#18181B] shadow-2xs"
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

                    {/* Interactive Swatch Dots */}
                    <div className="mt-2 flex items-center gap-1.5">
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
                            className={`h-4 w-4 rounded-full border transition ${
                              selected
                                ? 'scale-110 border-[#18181B] ring-1 ring-[#18181B] ring-offset-1'
                                : 'border-black/20'
                            }`}
                            style={{ backgroundColor: sw.hex }}
                          />
                        );
                      })}
                      <span className="ml-1 truncate text-[9.5px] text-[#18181B]/60">
                        {activeSwatch.name}
                      </span>
                    </div>

                    <h2 className="mt-1.5 line-clamp-1 text-xs font-semibold text-[#18181B] sm:text-sm">
                      {product.name}
                    </h2>
                    <p className="line-clamp-1 text-[10px] text-[#18181B]/65">
                      {product.subtitle}
                    </p>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5 border-t border-[#E6E2DA] pt-2">
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
                        className="min-h-[30px] rounded-full border border-[#18181B]/20 px-2 text-[10px] font-semibold text-[#18181B] hover:bg-[#F3F1EC]"
                      >
                        {qtyInBag > 0 ? `+ (${qtyInBag})` : copy.addBagBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickInquire(product)}
                        className="min-h-[30px] rounded-full bg-[#34516A] px-2.5 text-[10px] font-semibold text-white hover:bg-[#273E52]"
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

        {/* 2-Column Bento Editorial Story Grid */}
        <section aria-label="Editorial stories" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col justify-between rounded-2xl border border-[#E6E2DA] bg-white p-4">
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#34516A]">
              01 // EDIT
            </span>
            <div className="mt-3">
              <h3 className="font-editorial text-xl font-normal text-[#18181B]">
                {copy.bentoLeftTitle}
              </h3>
              <p className="mt-1 text-xs text-[#18181B]/70">{copy.bentoLeftSub}</p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-[#E6E2DA] bg-[#EFECE6] p-4">
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#18181B]/65">
              02 // ESSENTIALS
            </span>
            <div className="mt-3">
              <h3 className="font-editorial text-xl font-normal text-[#18181B]">
                {copy.bentoRightTitle}
              </h3>
              <p className="mt-1 text-xs text-[#18181B]/70">{copy.bentoRightSub}</p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 rounded-2xl bg-[#18181B] p-5 text-[#F8F7F4] sm:col-span-2 sm:flex-row sm:items-center">
            <div>
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                SEASONAL ARCHIVE
              </span>
              <h3 className="mt-1 font-editorial text-xl font-normal text-white sm:text-2xl">
                {offerTag || copy.bentoWideTitle}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleBagCheckout}
              className="min-h-[42px] shrink-0 rounded-full bg-[#F8F7F4] px-5 py-2 text-xs font-bold text-[#18181B] transition hover:bg-white active:scale-95"
            >
              {copy.bentoWideCta}
            </button>
          </div>
        </section>

        {/* 4-Pillar Trust Bar */}
        <section
          aria-label="Boutique promises"
          className="grid grid-cols-2 gap-2 rounded-2xl border border-[#E6E2DA] bg-white p-3 sm:grid-cols-4 sm:p-4"
        >
          {copy.trustPillars.map((pillar, idx) => (
            <div key={pillar} className="flex items-center gap-2 p-1.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#34516A]/10 font-mono text-[10px] font-bold text-[#34516A]">
                0{idx + 1}
              </span>
              <span className="text-[11px] font-semibold leading-tight text-[#18181B]">
                {pillar}
              </span>
            </div>
          ))}
        </section>

        {/* Direct WhatsApp Bag / Concierge Bar */}
        <div className="sticky bottom-14 z-20 flex items-center justify-between gap-2 rounded-2xl border border-[#18181B]/15 bg-[#18181B] p-3 text-[#F8F7F4] shadow-lg">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-white/70">
              {bagCount > 0 ? `${bagCount} item(s) selected` : storeName}
            </p>
            <p className="font-tabular truncate text-xs font-bold text-white">
              {bagCount > 0 ? `₹${bagTotal}` : copy.heroHeadline}
            </p>
          </div>
          <button
            type="button"
            onClick={handleBagCheckout}
            className="min-h-[40px] shrink-0 rounded-full bg-[#34516A] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#436583] active:scale-95"
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
                className="min-h-[44px] px-2 text-xs font-bold text-[#34516A]"
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
              className="mt-3 min-h-[44px] w-full rounded-full bg-[#18181B] text-xs font-bold text-white"
            >
              {sharedCopy.copyOrderBtn}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
