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

const SAMPLE_PHOTOS: readonly string[] = [
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=900&q=80',
];

const DEFAULT_PRODUCTS: readonly BakeryProduct[] = [
  {
    id: 'bk-1',
    category: 'classic',
    name: 'Belgian Dark Truffle',
    flavorTag: '70% Cocoa',
    price: 649,
    compareAt: 799,
    artVariant: 'truffle',
  },
  {
    id: 'bk-2',
    category: 'gourmet',
    name: 'Hazelnut Praline Gateau',
    flavorTag: 'Roasted Nut',
    price: 789,
    compareAt: 949,
    artVariant: 'caramel',
  },
  {
    id: 'bk-3',
    category: 'desserts',
    name: 'Raspberry Velvet Tart',
    flavorTag: 'Berry Glaze',
    price: 399,
    compareAt: 499,
    artVariant: 'berry',
  },
  {
    id: 'bk-4',
    category: 'hampers',
    name: 'Ribbon Pastry Box (6)',
    flavorTag: 'Gift Edition',
    price: 899,
    compareAt: 1099,
    artVariant: 'hamper',
  },
  {
    id: 'bk-5',
    category: 'gourmet',
    name: 'Pistachio Rose Tres Leches',
    flavorTag: 'Saffron Milk',
    price: 549,
    compareAt: 699,
    artVariant: 'pistachio',
  },
  {
    id: 'bk-6',
    category: 'desserts',
    name: 'Salted Espresso Brioche',
    flavorTag: 'Warm Caramel',
    price: 329,
    compareAt: 399,
    artVariant: 'espresso',
  },
];

/** Editorial Patisserie Still-Life: Arched gilt vignette, marble cake stand, tiered Belgian ganache cake, gold leaf & cocoa botanicals. */
function HeroPatisserieStillLifeSvg({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 260 260" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={`arch-glow-${uid}`} cx="50%" cy="38%" r="58%">
          <stop offset="0%" stopColor="#FFF7E8" stopOpacity="0.95" />
          <stop offset="65%" stopColor="#F4DFC1" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#C99866" stopOpacity="0.45" />
        </radialGradient>
        <linearGradient id={`ganache-hero-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#652E20" />
          <stop offset="45%" stopColor="#3E1810" />
          <stop offset="100%" stopColor="#210B07" />
        </linearGradient>
        <linearGradient id={`drip-hero-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A1D13" />
          <stop offset="100%" stopColor="#1B0805" />
        </linearGradient>
        <linearGradient id={`marble-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EFE5D8" />
          <stop offset="50%" stopColor="#FFFDF9" />
          <stop offset="100%" stopColor="#D9C5AE" />
        </linearGradient>
        <radialGradient id={`berry-hero-${uid}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="58%" stopColor="#BE123C" />
          <stop offset="100%" stopColor="#58091E" />
        </radialGradient>
        <linearGradient id={`gold-foil-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* Arched patisserie window frame */}
      <path
        d="M28 242 V122 C28 58 74 16 130 16 C186 16 232 58 232 122 V242 Z"
        fill={`url(#arch-glow-${uid})`}
        stroke="#FDE6C4"
        strokeWidth="1.8"
      />
      <path
        d="M38 234 V124 C38 66 79 26 130 26 C181 26 222 66 222 124 V234 Z"
        fill="none"
        stroke="#8E2027"
        strokeOpacity="0.22"
        strokeWidth="1"
        strokeDasharray="3 4"
      />

      {/* Botanical cocoa & wheat sprigs flanking arch */}
      <g stroke="#8E2027" strokeOpacity="0.32" fill="none" strokeWidth="1.2" strokeLinecap="round">
        <path d="M52 178 C46 146 52 108 72 78" />
        <path d="M56 144 C44 136 42 126 48 120" />
        <path d="M60 116 C49 108 50 98 56 93" />
        <path d="M208 178 C214 146 208 108 188 78" />
        <path d="M204 144 C216 136 218 126 212 120" />
        <path d="M200 116 C211 108 210 98 204 93" />
      </g>

      {/* Subtle sunburst rays behind cake */}
      <g stroke="#D97706" strokeOpacity="0.22" strokeWidth="1">
        <line x1="130" y1="36" x2="130" y2="56" />
        <line x1="94" y1="48" x2="103" y2="64" />
        <line x1="166" y1="48" x2="157" y2="64" />
        <line x1="68" y1="74" x2="82" y2="85" />
        <line x1="192" y1="74" x2="178" y2="85" />
      </g>

      {/* Pedestal cake stand shadow */}
      <ellipse cx="130" cy="224" rx="64" ry="10" fill="#2C1618" fillOpacity="0.2" />

      {/* Marble pedestal stem & base */}
      <path d="M114 196 H146 L154 220 C142 225 118 225 106 220 Z" fill={`url(#marble-${uid})`} stroke="#B89B7C" strokeWidth="1" />
      <ellipse cx="130" cy="192" rx="74" ry="15" fill={`url(#marble-${uid})`} stroke="#C9A87C" strokeWidth="1.3" />
      <ellipse cx="130" cy="190" rx="66" ry="11" fill="none" stroke="#8E2027" strokeOpacity="0.18" strokeWidth="0.9" />

      {/* Cake contact shadow */}
      <ellipse cx="130" cy="186" rx="56" ry="10" fill="#2C1618" fillOpacity="0.24" />

      {/* Lower sponge tier */}
      <path d="M78 134 V178 C78 188 101 194 130 194 C159 194 182 188 182 178 V134 Z" fill="#4C1F14" />
      {/* Chantilly & berry compote ribbon */}
      <path d="M78 152 C94 159 112 162 130 162 C148 162 166 159 182 152 V159 C166 166 148 169 130 169 C112 169 94 166 78 159 Z" fill="#FDE6C4" />
      <path d="M78 159 C94 166 112 169 130 169 C148 169 166 166 182 159 V162 C166 169 148 172 130 172 C112 172 94 169 78 162 Z" fill="#9F1239" />

      {/* Upper ganache tier */}
      <path d="M84 96 V136 C84 145 104 151 130 151 C156 151 176 145 176 136 V96 Z" fill={`url(#ganache-hero-${uid})`} />

      {/* Glossy artisanal chocolate drips */}
      <path
        d="M84 100 C84 114 90 124 94 124 C98 124 99 112 104 112 C109 112 110 132 115 132 C120 132 121 116 126 116 C131 116 133 130 138 130 C143 130 144 114 149 114 C154 114 156 134 161 134 C166 134 167 118 171 118 C174 118 176 112 176 100 C162 108 145 112 130 112 C113 112 97 108 84 100 Z"
        fill={`url(#drip-hero-${uid})`}
      />

      {/* Top glossy surface */}
      <ellipse cx="130" cy="96" rx="46" ry="16" fill="#36130C" stroke="#78350F" strokeWidth="1.2" />
      <path d="M96 95 C106 87 128 84 148 87" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.28" />

      {/* Piped buttercream rosettes */}
      {[
        { cx: 97, cy: 96 },
        { cx: 112, cy: 86 },
        { cx: 130, cy: 83 },
        { cx: 148, cy: 86 },
        { cx: 163, cy: 96 },
        { cx: 114, cy: 105 },
        { cx: 146, cy: 105 },
      ].map((swirl, i) => (
        <g key={`rosette-${i}`}>
          <circle cx={swirl.cx} cy={swirl.cy} r="6.8" fill="#FAF0E2" />
          <path
            d={`M${swirl.cx - 3.5} ${swirl.cy} c1-2.8 4.6-3.4 6.2-0.8 1 2.4-1.6 4.2-3.4 3.4`}
            fill="none"
            stroke="#C79259"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* Sculptural chocolate shards + edible gold leaf */}
      <polygon points="118,86 124,58 136,84" fill="#2A0F0A" stroke="#78350F" strokeWidth="0.9" />
      <polygon points="132,85 144,62 149,87" fill="#431A12" stroke="#92400E" strokeWidth="0.9" />
      <polygon points="124,72 131,67 134,76 126,79" fill={`url(#gold-foil-${uid})`} />

      {/* Center berries & mint leaves */}
      <circle cx="130" cy="95" r="8.5" fill={`url(#berry-hero-${uid})`} />
      <circle cx="119" cy="97" r="6" fill={`url(#berry-hero-${uid})`} />
      <circle cx="141" cy="97" r="6" fill={`url(#berry-hero-${uid})`} />
      <circle cx="127" cy="91" r="2" fill="#FFFFFF" fillOpacity="0.6" />
      <path d="M134 88 C139 82 146 82 149 86 C145 90 139 91 134 88 Z" fill="#2E7D32" />
      <path d="M126 88 C121 82 114 82 111 86 C115 90 121 91 126 88 Z" fill="#388E3C" />

      {/* Sparkling gold dust */}
      <circle cx="102" cy="70" r="1.5" fill="#F59E0B" />
      <circle cx="160" cy="72" r="1.8" fill="#FBBF24" />
      <circle cx="130" cy="48" r="1.6" fill="#F59E0B" />
      <circle cx="174" cy="112" r="1.3" fill="#FDE68A" />
    </svg>
  );
}

/** Richly shaded Patisserie Art Plates for each catalog item. */
function ProductArtPlateSvg({
  variant,
  uid,
}: {
  variant: BakeryProduct['artVariant'];
  uid: string;
}) {
  return (
    <svg viewBox="0 0 160 128" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={`bg-${variant}-${uid}`} cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#FFFBF4" />
          <stop offset="100%" stopColor="#F3E5D3" />
        </radialGradient>
        <linearGradient id={`gold-${variant}-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Warm art plate backdrop & delicate arched hairline */}
      <rect x="0" y="0" width="160" height="128" fill={`url(#bg-${variant}-${uid})`} />
      <path
        d="M16 118 V56 C16 24 44 10 80 10 C116 10 144 24 144 56 V118"
        fill="none"
        stroke="#8E2027"
        strokeOpacity="0.14"
        strokeWidth="1"
      />

      {/* Ceramic dessert dish */}
      <ellipse cx="80" cy="100" rx="52" ry="12" fill="#E6D2BC" />
      <ellipse cx="80" cy="98" rx="48" ry="10" fill="#FFFDF9" stroke="#D4B896" strokeWidth="1" />
      <ellipse cx="80" cy="97" rx="38" ry="7" fill="#2C1618" fillOpacity="0.12" />

      {variant === 'truffle' ? (
        <g>
          <path d="M44 54 V88 C44 96 60 101 80 101 C100 101 116 96 116 88 V54 Z" fill="#3D170F" />
          <path d="M44 72 C56 77 68 79 80 79 C92 79 104 77 116 72 V76 C104 81 92 83 80 83 C68 83 56 81 44 76 Z" fill="#FDE6C4" />
          <ellipse cx="80" cy="54" rx="36" ry="12" fill="#5C281B" />
          <path d="M54 53 C64 47 82 46 98 49" fill="none" stroke="#FFFFFF" strokeOpacity="0.32" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="72,49 79,30 87,49" fill="#290F09" />
          <polygon points="77,38 82,35 84,42 78,43" fill={`url(#gold-${variant}-${uid})`} />
          <circle cx="80" cy="52" r="6.5" fill="#BE123C" />
          <circle cx="70" cy="54" r="5" fill="#FAF0E2" />
          <circle cx="90" cy="54" r="5" fill="#FAF0E2" />
        </g>
      ) : variant === 'berry' ? (
        <g>
          {/* Scalloped pastry crust */}
          <path d="M42 66 L50 92 C53 98 65 101 80 101 C95 101 107 98 110 92 L118 66 Z" fill="#D4A373" stroke="#B07D4F" strokeWidth="1" />
          <ellipse cx="80" cy="66" rx="38" ry="11" fill="#FDE6C4" />
          <ellipse cx="80" cy="65" rx="33" ry="9" fill="#9F1239" />
          {/* Cluster of glazed berries */}
          <circle cx="67" cy="61" r="6" fill="#E11D48" />
          <circle cx="80" cy="58" r="7" fill="#BE123C" />
          <circle cx="92" cy="62" r="5.5" fill="#F43F5E" />
          <circle cx="75" cy="66" r="5" fill="#9F1239" />
          <circle cx="86" cy="66" r="5" fill="#E11D48" />
          <circle cx="78" cy="55" r="1.8" fill="#FFFFFF" fillOpacity="0.65" />
          <path d="M84 53 C89 47 96 48 98 52 C94 55 89 56 84 53 Z" fill="#2E7D32" />
        </g>
      ) : variant === 'caramel' ? (
        <g>
          {/* Layered praline gateau */}
          <rect x="44" y="48" width="72" height="46" rx="8" fill="#78350F" />
          <rect x="44" y="65" width="72" height="6" fill="#FDE6C4" />
          <rect x="44" y="76" width="72" height="5" fill="#451A03" />
          {/* Caramel drip glaze */}
          <path d="M44 56 C52 65 60 52 68 62 C76 70 84 54 92 63 C100 71 108 55 116 61 V52 C116 48 112 45 108 45 H52 C48 45 44 48 44 52 Z" fill="#D97706" />
          <circle cx="66" cy="43" r="6" fill="#92400E" stroke="#F59E0B" strokeWidth="1" />
          <circle cx="80" cy="40" r="7" fill="#B45309" stroke="#FDE68A" strokeWidth="1" />
          <circle cx="94" cy="43" r="6" fill="#92400E" stroke="#F59E0B" strokeWidth="1" />
          <polygon points="76,34 83,24 88,36" fill={`url(#gold-${variant}-${uid})`} />
        </g>
      ) : variant === 'hamper' ? (
        <g>
          {/* Couture ribbon gift box */}
          <rect x="38" y="46" width="84" height="52" rx="6" fill="#8E2027" />
          <rect x="34" y="38" width="92" height="14" rx="4" fill="#A62B33" stroke="#73181E" strokeWidth="0.9" />
          <rect x="74" y="38" width="12" height="60" fill={`url(#gold-${variant}-${uid})`} />
          <path d="M80 38 C68 24 54 30 61 38 C65 42 80 38 80 38 Z" fill="#FBBF24" />
          <path d="M80 38 C92 24 106 30 99 38 C95 42 80 38 80 38 Z" fill="#F59E0B" />
          <circle cx="80" cy="38" r="4" fill="#FEF08A" />
          <rect x="46" y="64" width="20" height="14" rx="2" fill="#FDF9F3" fillOpacity="0.9" />
          <line x1="50" y1="69" x2="62" y2="69" stroke="#8E2027" strokeWidth="1.2" />
          <line x1="50" y1="73" x2="59" y2="73" stroke="#8E2027" strokeWidth="1" strokeOpacity="0.6" />
        </g>
      ) : variant === 'pistachio' ? (
        <g>
          {/* Tres leches milk pool & rose-pistachio cake */}
          <ellipse cx="80" cy="93" rx="42" ry="8" fill="#FEF3C7" />
          <rect x="46" y="54" width="68" height="38" rx="9" fill="#FFFBEB" stroke="#E5C48B" strokeWidth="1.2" />
          <path d="M46 62 H114 V70 H46 Z" fill="#A7F3D0" />
          <path d="M46 56 C56 50 70 50 80 54 C90 50 104 50 114 56 V62 H46 Z" fill="#FFFDF9" />
          {/* Crushed pistachios & rose petals */}
          <ellipse cx="66" cy="51" rx="5" ry="3" fill="#059669" transform="rotate(-15 66 51)" />
          <ellipse cx="80" cy="49" rx="6" ry="3.5" fill="#F43F5E" />
          <ellipse cx="93" cy="51" rx="5" ry="3" fill="#10B981" transform="rotate(18 93 51)" />
          <circle cx="73" cy="54" r="2" fill="#D97706" />
          <circle cx="87" cy="54" r="2" fill="#D97706" />
        </g>
      ) : (
        <g>
          {/* Glazed Espresso Brioche */}
          <path d="M48 66 C48 46 62 36 80 36 C98 36 112 46 112 66 V86 C112 94 98 98 80 98 C62 98 48 94 48 86 Z" fill="#92400E" />
          <path d="M52 58 C62 66 72 54 80 62 C88 70 98 54 108 60 C105 44 94 36 80 36 C66 36 55 44 52 58 Z" fill="#D97706" />
          <path d="M62 48 C70 43 84 42 94 46" fill="none" stroke="#FEF3C7" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.55" />
          {/* Coffee bean crown */}
          <ellipse cx="80" cy="36" rx="6" ry="4" fill="#3B1811" />
          <path d="M76 36 C79 34 81 38 84 36" stroke="#D97706" strokeWidth="1" fill="none" />
        </g>
      )}
    </svg>
  );
}

function PromiseMedallionIcon({ idx }: { idx: number }) {
  if (idx === 0) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3.5 2" />
      </svg>
    );
  }
  if (idx === 1) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.2 5 5.3.7-3.9 3.8.9 5.3L12 15.3 7.5 17.8l.9-5.3-3.9-3.8 5.3-.7L12 3Z" />
      </svg>
    );
  }
  if (idx === 2) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
        <rect x="4" y="8" width="16" height="12" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v12M4 12h16M12 8c-2 0-3.5-1.2-3.5-2.6 0-1.3 1.4-2 3.5.1 2.1-2.1 3.5-1.4 3.5-.1C15.5 6.8 14 8 12 8Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v10H8l-4 4V6Z" />
    </svg>
  );
}

/**
 * Small Business Theme 1: "Artisan Bakehouse" (Patisserie Art Folio).
 * Warm vanilla cream, arched gilt still-life hero, rich illustrated dessert plates,
 * scalloped pastry privilege ticket & live WhatsApp Order Bag.
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
  const offerText = data.offerTag ? pickLocalizedText(data.offerTag, language).trim() : '';

  const photos = getValidPhotos(data.photos);
  const hasUserPhotos = photos.length > 0;
  const effectivePhotos = hasUserPhotos ? photos : SAMPLE_PHOTOS;
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
      // Safe fallback
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

  const heroPhoto =
    effectivePhotos[0] && !failedUrls[effectivePhotos[0]] ? effectivePhotos[0] : null;

  return (
    <div
      className="relative flex min-h-full w-full flex-col overflow-x-clip bg-[#FDF9F3] text-[#2C1618]"
      style={hiSafeStyle(language)}
    >
      {/* Minimal Patisserie Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-[#8E2027]/12 bg-[#FDF9F3]/95 px-3.5 py-2 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D97706]/40 bg-[#8E2027] font-editorial text-xs font-bold text-[#FDE6C4]">
            {monogram}
          </span>
          <span className="truncate font-editorial text-sm font-semibold tracking-tight text-[#2C1618] sm:text-base">
            {storeName}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowOrderSheet(true)}
          className="inline-flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-full border border-[#8E2027]/20 bg-white px-3 py-1 text-[10.5px] font-bold text-[#8E2027] shadow-2xs transition active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12l-1 13H7L6 7Zm3 0V5a3 3 0 0 1 6 0v2" />
          </svg>
          <span>{totalCount}</span>
        </button>
      </header>

      {/* Art-Forward Patisserie Arch Hero */}
      <section className="relative overflow-hidden rounded-b-[32px] bg-gradient-to-b from-[#7E1B22] via-[#66141A] to-[#4A0D12] px-4 pb-6 pt-5 text-[#FDF9F3] shadow-[0_20px_42px_-18px_rgba(74,13,18,0.6)] sm:px-8 sm:py-7">
        <AtmosphericGrainOverlay opacity={0.08} />
        <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 items-center gap-4 md:grid-cols-12">
          {/* Centerpiece Patisserie Still-Life Art */}
          <div className="order-1 flex justify-center md:order-2 md:col-span-5 md:justify-end">
            {heroPhoto ? (
              <button
                type="button"
                onClick={() => {
                  if (hasUserPhotos) onOpenPhoto?.(0);
                }}
                aria-label="Inspect featured bakery photo"
                className="group relative h-52 w-44 overflow-hidden rounded-t-full rounded-b-2xl border-2 border-[#FDE6C4]/75 bg-[#3D1510] shadow-[0_24px_48px_-16px_rgba(24,6,8,0.72)] transition duration-500 hover:-translate-y-0.5 hover:border-[#FDE68A] sm:h-60 sm:w-48"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroPhoto}
                  alt={storeName}
                  onError={() => setFailedUrls((prev) => ({ ...prev, [heroPhoto]: true }))}
                  className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                />
                {/* Arched gilt double-hairline patisserie frame */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-1.5 rounded-t-full rounded-b-xl border border-[#FDE6C4]/45"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#2C0B0E]/85 via-[#2C0B0E]/25 to-transparent"
                />
                <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#FDE6C4]/35 bg-[#2C0B0E]/70 px-2.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#FDE6C4] backdrop-blur-xs">
                  ATELIER · NO. 01
                </span>
              </button>
            ) : (
              <div className="h-48 w-48 drop-shadow-[0_18px_28px_rgba(0,0,0,0.35)] sm:h-56 sm:w-56">
                <HeroPatisserieStillLifeSvg uid={uid} />
              </div>
            )}
          </div>

          {/* Crisp Editorial Title + Interactive Offer Seal */}
          <div className="order-2 flex flex-col items-center text-center md:order-1 md:col-span-7 md:items-start md:text-left">
            <button
              type="button"
              onClick={() => {
                setOfferApplied(true);
                flashToast(copy.offerApplied);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#FDE68A]/50 bg-[#B45309]/90 px-3 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#FFFDF9] shadow-sm transition hover:scale-105 active:scale-95"
            >
              <span>{offerText || copy.saveBadge}</span>
            </button>

            <h1 className="mt-2.5 break-words font-editorial text-2xl font-normal leading-[1.08] text-[#FFFDF9] sm:text-4xl">
              {headline}
            </h1>

            <div className="mt-3 flex flex-wrap justify-center gap-1.5 md:justify-start">
              {['70% Dark', 'Eggless', 'Small-Batch'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#FDE6C4]/25 bg-white/10 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-[#FDE6C4]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Category Filter Bar */}
      <div className="sticky top-[51px] z-20 border-b border-[#8E2027]/10 bg-[#FDF9F3]/95 px-3.5 py-2 backdrop-blur-md sm:px-6">
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
                className={`min-h-[34px] shrink-0 rounded-full px-3 py-1 text-[10.5px] font-bold transition active:scale-95 ${
                  isSelected
                    ? 'bg-[#8E2027] text-[#FDF9F3]'
                    : 'border border-[#8E2027]/18 bg-white text-[#2C1618]/75 hover:bg-[#8E2027]/5'
                }`}
              >
                {copy.categories[idx]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Art-Led Catalog */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-3.5 pb-8 pt-4 sm:px-6">
        <section aria-labelledby={`bakery-best-${uid}`}>
          <div className="mb-2.5 flex items-center justify-between">
            <h2
              id={`bakery-best-${uid}`}
              className="font-editorial text-lg font-semibold text-[#2C1618] sm:text-xl"
            >
              {copy.bestsellerHeading}
            </h2>
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#8E2027]/70">
              {filteredProducts.length} PLATES
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3">
            {filteredProducts.map((product) => {
              const origIdx = catalog.findIndex((c) => c.id === product.id);
              const photoIdx = origIdx >= 0 ? origIdx : 0;
              const qty = cart[product.id] ?? 0;
              const isFav = Boolean(favorites[product.id]);
              const photoUrl = effectivePhotos[photoIdx % effectivePhotos.length];
              const showPhoto = Boolean(photoUrl && !failedUrls[photoUrl]);

              return (
                <article
                  key={product.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#8E2027]/12 bg-white shadow-2xs transition duration-300 hover:-translate-y-0.5 hover:border-[#8E2027]/28 hover:shadow-[0_14px_28px_-14px_rgba(142,32,39,0.28)]"
                >
                  <div>
                    <div className="relative aspect-[5/4] w-full overflow-hidden bg-[#FDF5EA]">
                      {showPhoto ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (hasUserPhotos && photoIdx < photos.length) {
                              onOpenPhoto?.(photoIdx);
                            }
                          }}
                          className="relative h-full w-full"
                          aria-label={`View ${product.name}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoUrl}
                            alt={product.name}
                            onError={() =>
                              setFailedUrls((prev) => ({ ...prev, [photoUrl]: true }))
                            }
                            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.07]"
                          />
                          {/* Arched patisserie gilt hairline overlay */}
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-1.5 rounded-t-[36px] rounded-b-lg border border-[#FDE6C4]/45 transition-opacity duration-300 group-hover:border-[#FDE68A]/70"
                          />
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#2C1618]/45 to-transparent"
                          />
                        </button>
                      ) : (
                        <ProductArtPlateSvg variant={product.artVariant} uid={uid} />
                      )}

                      <span className="pointer-events-none absolute left-2 top-2 rounded-full border border-[#8E2027]/15 bg-white/92 px-2 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-wider text-[#8E2027] shadow-2xs backdrop-blur-xs">
                        {product.flavorTag}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setFavorites((prev) => ({ ...prev, [product.id]: !isFav }))
                        }
                        aria-label={`Favorite ${product.name}`}
                        aria-pressed={isFav}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#8E2027] shadow-2xs transition active:scale-90"
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

                    <div className="px-2.5 pt-2 sm:px-3">
                      <h3 className="line-clamp-1 font-editorial text-xs font-semibold text-[#2C1618] sm:text-sm">
                        {product.name}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-1 px-2.5 pb-2.5 sm:px-3 sm:pb-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-tabular text-xs font-extrabold text-[#2C1618] sm:text-sm">
                        ₹{product.price}
                      </span>
                      <span className="font-tabular text-[9.5px] text-[#2C1618]/45 line-through">
                        ₹{product.compareAt}
                      </span>
                    </div>

                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => updateQty(product.id, 1)}
                        className="min-h-[30px] rounded-full bg-[#8E2027] px-2.5 text-[10px] font-bold text-[#FDF9F3] transition hover:bg-[#73181E] active:scale-95"
                      >
                        {copy.addBag}
                      </button>
                    ) : (
                      <div className="inline-flex min-h-[30px] items-center rounded-full border border-[#8E2027]/25 bg-[#FDF9F3] px-0.5">
                        <button
                          type="button"
                          onClick={() => updateQty(product.id, -1)}
                          aria-label={`Remove one ${product.name}`}
                          className="flex h-6 w-5 items-center justify-center rounded-full text-xs font-bold text-[#8E2027] hover:bg-white"
                        >
                          -
                        </button>
                        <span className="font-tabular px-1 text-[10.5px] font-extrabold text-[#2C1618]">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(product.id, 1)}
                          aria-label={`Add one ${product.name}`}
                          className="flex h-6 w-5 items-center justify-center rounded-full text-xs font-bold text-[#8E2027] hover:bg-white"
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

        {/* Compact Embossed Medallion Seal Strip */}
        <section
          aria-label={copy.promiseHeading}
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {copy.promises.map((label, idx) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl border border-[#D97706]/25 bg-white px-2.5 py-2"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D97706]/35 bg-[#FDF5EA] text-[#8E2027]">
                <PromiseMedallionIcon idx={idx} />
              </span>
              <span className="text-[10.5px] font-bold leading-tight text-[#2C1618]">
                {label}
              </span>
            </div>
          ))}
        </section>

        {/* Gilt-Foil Scalloped Patisserie Privilege Ticket */}
        <section
          aria-label={copy.ticketTitle}
          className="relative overflow-hidden rounded-2xl border border-[#D97706]/60 bg-gradient-to-r from-[#FFF7DF] via-[#FDE8B0] to-[#F6CF75] p-3.5 text-[#2C1618] shadow-sm sm:p-4"
        >
          {/* Decorative ticket notches */}
          <span aria-hidden="true" className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#FDF9F3]" />
          <span aria-hidden="true" className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#FDF9F3]" />

          <div className="flex flex-col items-start justify-between gap-2.5 px-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#8E2027]/30 bg-[#8E2027] font-editorial text-xs font-bold text-[#FDE68A]">
                20%
              </div>
              <div>
                <h3 className="font-editorial text-base font-semibold leading-tight text-[#2C1618]">
                  {offerText || copy.ticketTitle}
                </h3>
                <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#92400E]">
                  {copy.ticketEyebrow}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setOfferApplied((prev) => !prev);
                flashToast(!offerApplied ? copy.offerApplied : copy.claimOffer);
              }}
              className={`min-h-[38px] shrink-0 rounded-full px-4 text-[11px] font-extrabold transition active:scale-95 ${
                offerApplied
                  ? 'bg-[#2C1618] text-[#FDE68A]'
                  : 'bg-[#8E2027] text-white hover:bg-[#73181E]'
              }`}
            >
              {offerApplied ? copy.offerApplied : copy.claimOffer}
            </button>
          </div>
        </section>

        {/* Sticky Order Bag Capsule */}
        <div className="sticky bottom-14 z-20 rounded-2xl border border-[#D97706]/30 bg-[#2C1618] p-3 text-[#FDF9F3] shadow-[0_14px_32px_-12px_rgba(44,22,24,0.65)]">
          {totalCount > 0 ? (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowOrderSheet(true)}
                className="min-w-0 text-left"
              >
                <p className="font-mono text-[9.5px] font-semibold uppercase tracking-wider text-[#FDE6C4]/80">
                  {totalCount} {totalCount === 1 ? 'PLATE' : 'PLATES'}
                  {offerApplied ? ' · -20%' : ''}
                </p>
                <p className="font-tabular truncate text-sm font-extrabold text-white">
                  ₹{finalTotal}
                </p>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="inline-flex min-h-[40px] shrink-0 items-center rounded-full bg-[#F59E0B] px-4 text-xs font-extrabold text-[#2C1618] shadow-sm transition hover:bg-[#FBBF24] active:scale-95"
              >
                {copy.orderWhatsapp}
              </button>
            </div>
          ) : (
            <p className="text-center text-[11px] font-medium text-[#FDE6C4]/90">
              {copy.emptyBagHint}
            </p>
          )}
        </div>
      </main>

      {toastMsg ? (
        <div
          role="status"
          className="fixed left-1/2 top-4 z-[110] -translate-x-1/2 rounded-full bg-[#2C1618] px-4 py-2 text-xs font-bold text-[#FDE6C4] shadow-xl"
        >
          {toastMsg}
        </div>
      ) : null}

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
              <h3 className="font-editorial text-base font-semibold text-[#8E2027]">
                {storeName} · {copy.bagLabel}
              </h3>
              <button
                type="button"
                onClick={() => setShowOrderSheet(false)}
                className="min-h-[40px] rounded-full px-3 text-xs font-bold text-[#2C1618]/75 hover:bg-black/5"
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
                      className="flex min-h-[42px] flex-1 items-center justify-center rounded-full bg-[#8E2027] px-4 text-xs font-bold text-white"
                    >
                      {copy.orderWhatsapp}
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleCopyOrder}
                    className="flex min-h-[42px] flex-1 items-center justify-center rounded-full border border-[#8E2027]/25 bg-white px-4 text-xs font-bold text-[#8E2027]"
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
