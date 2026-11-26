'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  buildWhatsAppOrderHref,
  deriveHighlights,
  deriveStoreName,
  getValidPhotos,
  hiSafeStyle,
  sanitizeWhatsappPhone,
  SMALL_BUSINESS_THEMES_COPY,
  type SmallBusinessThemeComponentProps,
} from './smallBusinessTypes';

type GarmentAngleIdx = 0 | 1 | 2 | 3;
type SizeOption = 'XS' | 'S' | 'M' | 'L' | 'XL';

interface ColorwayOption {
  id: string;
  label: string;
  hex: string;
  shadeHex: string;
  strokeHex: string;
  detailHex: string;
}

interface StreetwearDrop {
  id: string;
  name: string;
  code: string;
  price: number;
  spec: string;
  kind: 'jacket' | 'cargo' | 'hoodie';
}

const SAMPLE_PHOTOS: readonly string[] = [
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80',
];

const COLORWAYS: readonly ColorwayOption[] = [
  { id: 'obsidian', label: 'Obsidian', hex: '#161618', shadeHex: '#0A0A0C', strokeHex: '#FFFFFF', detailHex: '#52525B' },
  { id: 'chalk', label: 'Chalk', hex: '#EAE8E1', shadeHex: '#D1CEC3', strokeHex: '#111111', detailHex: '#71717A' },
  { id: 'slate', label: 'Graphite', hex: '#343B46', shadeHex: '#202630', strokeHex: '#F4F4F5', detailHex: '#94A3B8' },
];

const SIZES: readonly SizeOption[] = ['XS', 'S', 'M', 'L', 'XL'];

const RELEVANT_DROPS: readonly StreetwearDrop[] = [
  {
    id: 'sw-1',
    name: 'BOX SHELL JACKET 04',
    code: 'ARC-04',
    price: 3499,
    spec: '400 GSM Heavy Cotton',
    kind: 'jacket',
  },
  {
    id: 'sw-2',
    name: 'RAW SEAM CARGO',
    code: 'UTL-09',
    price: 2699,
    spec: 'Ripstop Articulated Twill',
    kind: 'cargo',
  },
  {
    id: 'sw-3',
    name: 'BOXY DROP HOODIE',
    code: 'COR-12',
    price: 2299,
    spec: '440 GSM French Terry',
    kind: 'hoodie',
  },
];

/** Editorial Streetwear Lookbook Art Plates with halftone backdrop, registration marks & architectural shading. */
function TechnicalGarmentArtPlate({
  angleIdx,
  colorway,
  uid,
}: {
  angleIdx: GarmentAngleIdx;
  colorway: ColorwayOption;
  uid: string;
}) {
  return (
    <svg viewBox="0 0 280 220" className="h-full w-full" aria-hidden="true">
      <defs>
        <pattern id={`dots-${uid}`} width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.9" fill="#111111" fillOpacity="0.14" />
        </pattern>
        <linearGradient id={`garment-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colorway.hex} />
          <stop offset="100%" stopColor={colorway.shadeHex} />
        </linearGradient>
      </defs>

      {/* Studio backdrop with halftone editorial block */}
      <rect x="0" y="0" width="280" height="220" fill="#F6F5F1" />
      <rect x="148" y="0" width="132" height="220" fill={`url(#dots-${uid})`} />
      {/* Bold geometric accent stripe */}
      <rect x="18" y="18" width="4" height="184" fill="#111111" />
      {/* Registration crosshairs */}
      <g stroke="#111111" strokeWidth="0.9" strokeOpacity="0.45">
        <path d="M254 16v10M249 21h10" />
        <path d="M254 194v10M249 199h10" />
      </g>

      {angleIdx === 0 ? (
        <g>
          {/* Architectural floor shadow */}
          <ellipse cx="144" cy="192" rx="68" ry="9" fill="#111111" fillOpacity="0.16" />
          {/* Boxy technical shell silhouette */}
          <path
            d="M104 34 L126 24 L158 24 L180 34 L218 68 L202 170 L178 170 L186 84 L180 182 L104 182 L98 84 L106 170 L82 170 L66 68 Z"
            fill={`url(#garment-grad-${uid})`}
            stroke="#111111"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Sculpted storm collar & hood fold */}
          <path d="M126 24 L142 46 L158 24" fill="none" stroke={colorway.strokeHex} strokeWidth="1.8" />
          <path d="M116 32 L142 54 L168 32" fill="none" stroke={colorway.detailHex} strokeWidth="1.2" />
          {/* Concealed storm placket */}
          <rect x="139" y="46" width="6" height="136" fill={colorway.shadeHex} stroke={colorway.strokeHex} strokeWidth="0.8" />
          {/* 3D Bellows Utility Pockets */}
          <rect x="110" y="96" width="24" height="32" fill={colorway.shadeHex} stroke={colorway.strokeHex} strokeWidth="1.2" />
          <line x1="110" y1="104" x2="134" y2="104" stroke={colorway.strokeHex} strokeWidth="1.2" />
          <rect x="150" y="96" width="24" height="32" fill={colorway.shadeHex} stroke={colorway.strokeHex} strokeWidth="1.2" />
          <line x1="150" y1="104" x2="174" y2="104" stroke={colorway.strokeHex} strokeWidth="1.2" />
          {/* Articulated sleeve seam */}
          <path d="M84 114 L102 118 M182 118 L200 114" stroke={colorway.strokeHex} strokeWidth="1.2" strokeDasharray="3 2" />
          {/* Woven atelier label */}
          <rect x="154" y="156" width="16" height="9" fill={colorway.strokeHex} />
          <text x="30" y="30" fontSize="8" fontFamily="monospace" fontWeight="700" fill="#111111">PLATE 01 // FRONT</text>
        </g>
      ) : angleIdx === 1 ? (
        <g>
          <ellipse cx="144" cy="192" rx="56" ry="8" fill="#111111" fillOpacity="0.16" />
          {/* Sculptural side-profile shoulder drape */}
          <path
            d="M110 30 C142 22 174 38 182 78 L194 178 L96 184 L104 82 Z"
            fill={`url(#garment-grad-${uid})`}
            stroke="#111111"
            strokeWidth="2"
          />
          {/* Deep architectural fold lines */}
          <path d="M126 66 C140 104 146 138 142 180" fill="none" stroke={colorway.strokeHex} strokeWidth="1.8" strokeOpacity="0.85" />
          <path d="M150 52 C164 94 168 130 164 178" fill="none" stroke={colorway.detailHex} strokeWidth="1.4" />
          {/* Cuff strap hardware */}
          <rect x="114" y="152" width="32" height="8" fill={colorway.shadeHex} stroke={colorway.strokeHex} strokeWidth="1.2" />
          <circle cx="140" cy="156" r="2" fill={colorway.strokeHex} />
          <text x="30" y="30" fontSize="8" fontFamily="monospace" fontWeight="700" fill="#111111">PLATE 02 // DRAPE</text>
        </g>
      ) : angleIdx === 2 ? (
        <g>
          {/* Macro double-needle twill weave & bar-tack seam */}
          <rect x="30" y="22" width="220" height="176" fill={`url(#garment-grad-${uid})`} stroke="#111111" strokeWidth="2" />
          <g stroke={colorway.detailHex} strokeOpacity="0.35" strokeWidth="1">
            {[36, 56, 76, 96, 116, 136, 156, 176, 196, 216, 236].map((x) => (
              <line key={x} x1={x} y1="22" x2={x - 18} y2="198" />
            ))}
          </g>
          <line x1="30" y1="110" x2="250" y2="110" stroke={colorway.strokeHex} strokeWidth="2.4" />
          <line x1="30" y1="96" x2="250" y2="96" stroke={colorway.strokeHex} strokeWidth="1.8" strokeDasharray="10 6" />
          <line x1="30" y1="124" x2="250" y2="124" stroke={colorway.strokeHex} strokeWidth="1.8" strokeDasharray="10 6" />
          {/* Metal rivet detail */}
          <circle cx="140" cy="110" r="9" fill="#111111" stroke={colorway.strokeHex} strokeWidth="1.6" />
          <circle cx="140" cy="110" r="3" fill={colorway.strokeHex} />
          <rect x="38" y="30" width="128" height="18" fill="#111111" />
          <text x="44" y="42" fontSize="8" fontFamily="monospace" fontWeight="700" fill="#FFFFFF">PLATE 03 // 400GSM SEAM</text>
        </g>
      ) : (
        <g>
          {/* Architectural flat-lay proportion blueprint */}
          <rect x="86" y="44" width="112" height="134" fill={`url(#garment-grad-${uid})`} stroke="#111111" strokeWidth="2" />
          <line x1="142" y1="44" x2="142" y2="178" stroke={colorway.strokeHex} strokeWidth="1.2" strokeDasharray="4 3" />
          <line x1="86" y1="110" x2="198" y2="110" stroke={colorway.strokeHex} strokeWidth="1" strokeOpacity="0.6" />
          {/* Dimension caliper lines */}
          <g stroke="#111111" strokeWidth="1.1">
            <line x1="66" y1="44" x2="66" y2="178" />
            <line x1="60" y1="44" x2="72" y2="44" />
            <line x1="60" y1="178" x2="72" y2="178" />
            <line x1="86" y1="194" x2="198" y2="194" />
            <line x1="86" y1="188" x2="86" y2="200" />
            <line x1="198" y1="188" x2="198" y2="200" />
          </g>
          <text x="30" y="30" fontSize="8" fontFamily="monospace" fontWeight="700" fill="#111111">PLATE 04 // 68×64 CM</text>
        </g>
      )}
    </svg>
  );
}

function MiniDropArtSvg({ kind }: { kind: StreetwearDrop['kind'] }) {
  return (
    <svg viewBox="0 0 100 68" className="h-full w-full" aria-hidden="true">
      <rect x="0" y="0" width="100" height="68" fill="#F4F3EF" />
      {kind === 'jacket' ? (
        <path
          d="M32 14 L42 10 H58 L68 14 L80 26 L75 56 H66 L68 32 L66 60 H34 L32 32 L34 56 H25 L20 26 Z"
          fill="#161618"
          stroke="#111111"
          strokeWidth="1.4"
        />
      ) : kind === 'cargo' ? (
        <g fill="#161618" stroke="#111111" strokeWidth="1.4">
          <path d="M32 10 H68 L74 60 H56 L50 30 L44 60 H26 Z" />
          <rect x="27" y="30" width="10" height="12" fill="#27272A" stroke="#FFFFFF" strokeWidth="0.9" />
          <rect x="63" y="30" width="10" height="12" fill="#27272A" stroke="#FFFFFF" strokeWidth="0.9" />
        </g>
      ) : (
        <g fill="#161618" stroke="#111111" strokeWidth="1.4">
          <path d="M34 18 C36 8 64 8 66 18 L80 30 L74 58 H66 L67 34 L65 60 H35 L33 34 L34 58 H26 L20 30 Z" />
          <rect x="40" y="42" width="20" height="10" fill="none" stroke="#FFFFFF" strokeWidth="0.9" />
        </g>
      )}
    </svg>
  );
}

/**
 * Small Business Theme 2: "Monochrome Atelier" (Avant-Garde Lookbook Zine).
 * Optic white, crisp 1px architectural grids, halftone editorial garment plates,
 * 4-angle inspection, colorway/size controls & woven atelier spec stamp.
 */
export function SmallBusinessStreetwearTheme({
  data,
  language,
  onOpened,
  onOpenPhoto,
}: SmallBusinessThemeComponentProps) {
  const uid = useId().replace(/:/g, '');
  const coreLang = toCoreLanguageCode(language);
  const copy =
    SMALL_BUSINESS_THEMES_COPY[coreLang]?.streetwear ??
    SMALL_BUSINESS_THEMES_COPY.en.streetwear;
  const sharedCopy =
    SMALL_BUSINESS_THEMES_COPY[coreLang] ?? SMALL_BUSINESS_THEMES_COPY.en;

  const storeName = deriveStoreName(data, copy.defaultStore);
  const headline = pickLocalizedText(data.headline, language).trim() || RELEVANT_DROPS[0].name;
  const offerTag = data.offerTag ? pickLocalizedText(data.offerTag, language).trim() : '';

  const photos = getValidPhotos(data.photos);
  const hasUserPhotos = photos.length > 0;
  const effectivePhotos = hasUserPhotos ? photos : SAMPLE_PHOTOS;
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const [selectedDropIdx, setSelectedDropIdx] = useState(0);
  const [angleIdx, setAngleIdx] = useState<GarmentAngleIdx>(0);
  const [colorwayIdx, setColorwayIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<SizeOption>('M');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!showSummary) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSummary(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSummary]);

  const customHighlights = deriveHighlights(data, language);

  const drops: readonly StreetwearDrop[] = useMemo(() => {
    if (customHighlights.length === 0) return RELEVANT_DROPS;
    return RELEVANT_DROPS.map((drop, idx) => {
      const h = customHighlights[idx];
      if (!h) return drop;
      return {
        ...drop,
        name: (h.title || drop.name).toUpperCase(),
        spec: h.detail || drop.spec,
      };
    });
  }, [customHighlights]);

  const activeDrop = drops[selectedDropIdx] ?? drops[0];
  const activeColor = COLORWAYS[colorwayIdx] ?? COLORWAYS[0];
  const activePhoto = hasUserPhotos
    ? (photos[angleIdx] ?? photos[selectedDropIdx] ?? photos[0])
    : effectivePhotos[(selectedDropIdx + angleIdx) % effectivePhotos.length];
  const showPhoto = Boolean(activePhoto && !failedUrls[activePhoto]);

  const orderMessage = [
    `ORDER REQUEST // ${storeName}`,
    `Item: ${selectedDropIdx === 0 && headline ? headline : activeDrop.name} (${activeDrop.code})`,
    `Colorway: ${activeColor.label}`,
    `Size: ${selectedSize}`,
    `Price: INR ${activeDrop.price}`,
    offerTag ? `Tag: ${offerTag}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const validWa = sanitizeWhatsappPhone(data.whatsappPhone);
  const waHref = buildWhatsAppOrderHref(validWa, orderMessage);

  function flashToast(msg: string) {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 2600);
  }

  function handleOrderDrop() {
    onOpened?.();
    if (waHref) {
      window.open(waHref, '_blank', 'noopener,noreferrer');
      return;
    }
    setShowSummary(true);
    flashToast(sharedCopy.demoOrderToast);
  }

  async function handleCopyOrder() {
    try {
      await navigator.clipboard?.writeText(orderMessage);
    } catch {
      // Safe fallback
    }
    flashToast(sharedCopy.copiedToast);
  }

  return (
    <div
      className="relative flex min-h-full w-full flex-col overflow-x-clip bg-[#FFFFFF] text-[#111111]"
      style={hiSafeStyle(language)}
    >
      {/* Stark Zine Masthead */}
      <header className="border-b-2 border-[#111111] px-3.5 py-2.5 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#111111]">
            {offerTag || copy.dropTag}
          </span>
          <span className="bg-[#111111] px-2 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-widest text-white">
            24H DISPATCH
          </span>
        </div>
        <h1
          className="mx-auto mt-1.5 max-w-5xl break-words font-zine text-3xl font-black uppercase leading-[0.95] tracking-tight text-[#111111] sm:text-5xl"
          style={hiSafeStyle(language)}
        >
          {storeName}
        </h1>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-3.5 py-4 sm:px-6">
        {/* Flagship Lookbook Plate + Controls */}
        <section
          aria-labelledby={`drop-title-${uid}`}
          className="grid grid-cols-1 border-2 border-[#111111] md:grid-cols-12"
        >
          <div className="flex flex-col border-b-2 border-[#111111] md:col-span-7 md:border-b-0 md:border-r-2">
            <div className="group relative aspect-[5/4] w-full overflow-hidden bg-[#F6F5F1]">
              {showPhoto ? (
                <button
                  type="button"
                  onClick={() => {
                    if (hasUserPhotos) {
                      const idx = photos.indexOf(activePhoto);
                      if (idx >= 0) onOpenPhoto?.(idx);
                    }
                  }}
                  className="relative h-full w-full"
                  aria-label="Zoom garment photo"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activePhoto}
                    alt={activeDrop.name}
                    onError={() =>
                      setFailedUrls((prev) => ({ ...prev, [activePhoto]: true }))
                    }
                    className="h-full w-full object-cover contrast-[1.05] saturate-[0.82] transition duration-700 ease-out group-hover:scale-[1.04] group-hover:saturate-100"
                  />
                  {/* Editorial colorway edge strip + monochrome vignette */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 w-1.5 transition-colors duration-300"
                    style={{ backgroundColor: activeColor.hex }}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/65 via-black/15 to-transparent"
                  />
                  {/* Halftone corner stamp & registration crosshairs */}
                  <svg
                    viewBox="0 0 64 64"
                    aria-hidden="true"
                    className="pointer-events-none absolute left-2.5 top-2.5 h-8 w-8 text-white/85 drop-shadow-xs"
                  >
                    <g fill="currentColor" opacity="0.7">
                      <circle cx="6" cy="6" r="1.4" />
                      <circle cx="14" cy="6" r="1.4" />
                      <circle cx="22" cy="6" r="1.4" />
                      <circle cx="6" cy="14" r="1.4" />
                      <circle cx="14" cy="14" r="1.4" />
                      <circle cx="6" cy="22" r="1.4" />
                    </g>
                    <path d="M44 8v10M39 13h10" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  <span className="pointer-events-none absolute bottom-2.5 left-3.5 border border-white/30 bg-[#111111]/85 px-2 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-xs">
                    PLATE 0{angleIdx + 1} // {activeColor.label}
                  </span>
                </button>
              ) : (
                <TechnicalGarmentArtPlate
                  angleIdx={angleIdx}
                  colorway={activeColor}
                  uid={uid}
                />
              )}

              <span className="pointer-events-none absolute right-2.5 top-2.5 bg-[#111111] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white">
                {activeDrop.code}
              </span>
            </div>

            {/* 4-Angle Inspection Strip */}
            <div className="grid grid-cols-4 border-t border-[#111111]">
              {([0, 1, 2, 3] as const).map((idx) => {
                const isActive = angleIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAngleIdx(idx)}
                    aria-pressed={isActive}
                    className={`min-h-[38px] border-r border-[#111111] px-1 py-1.5 text-center font-mono text-[9.5px] font-bold uppercase tracking-wider transition last:border-r-0 ${
                      isActive
                        ? 'bg-[#111111] text-white'
                        : 'bg-white text-[#111111] hover:bg-[#F4F4F5]'
                    }`}
                  >
                    {copy.angles[idx]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 p-4 md:col-span-5">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h2
                  id={`drop-title-${uid}`}
                  className="break-words font-zine text-xl font-black uppercase leading-tight text-[#111111] sm:text-2xl"
                  style={hiSafeStyle(language)}
                >
                  {selectedDropIdx === 0 ? headline : activeDrop.name}
                </h2>
                <span className="font-tabular shrink-0 bg-[#111111] px-2 py-0.5 font-mono text-xs font-extrabold text-white">
                  ₹{activeDrop.price}
                </span>
              </div>

              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-[#111111]/65">
                {activeDrop.spec}
              </p>

              {/* Colorway Swatches */}
              <div className="mt-4">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#111111]/60">
                  {copy.colorLabel} // <span className="text-[#111111]">{activeColor.label}</span>
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  {COLORWAYS.map((cw, idx) => {
                    const isSelected = colorwayIdx === idx;
                    return (
                      <button
                        key={cw.id}
                        type="button"
                        onClick={() => setColorwayIdx(idx)}
                        aria-label={`Colorway ${cw.label}`}
                        aria-pressed={isSelected}
                        className={`flex h-8 w-8 items-center justify-center border transition ${
                          isSelected ? 'scale-105 border-2 border-[#111111]' : 'border-[#111111]/30'
                        }`}
                        style={{ backgroundColor: cw.hex }}
                      >
                        {isSelected ? (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: cw.strokeHex }}
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Matrix */}
              <div className="mt-4">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#111111]/60">
                  {copy.sizeLabel}
                </p>
                <div className="mt-1.5 grid grid-cols-5 gap-1">
                  {SIZES.map((sz) => {
                    const active = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        aria-pressed={active}
                        className={`min-h-[36px] border border-[#111111] font-mono text-[10.5px] font-bold transition ${
                          active
                            ? 'bg-[#111111] text-white'
                            : 'bg-white text-[#111111] hover:bg-[#F4F4F5]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOrderDrop}
              className="min-h-[46px] w-full bg-[#111111] px-4 py-2.5 font-mono text-[11px] font-extrabold uppercase tracking-[0.16em] text-white transition hover:bg-[#27272A] active:scale-[0.99]"
            >
              {copy.orderDropBtn}
            </button>
          </div>
        </section>

        {/* Visual Drop Strip with Illustrated Silhouettes */}
        <section aria-labelledby={`relevant-drops-${uid}`}>
          <div className="mb-2 flex items-center justify-between border-b border-[#111111] pb-1">
            <h2
              id={`relevant-drops-${uid}`}
              className="font-zine text-base font-black uppercase tracking-wider text-[#111111]"
              style={hiSafeStyle(language)}
            >
              {copy.relevantHeading}
            </h2>
            <span className="font-mono text-[9px] font-bold uppercase text-[#111111]/60">
              01 — 03
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {drops.map((drop, idx) => {
              const isSelected = selectedDropIdx === idx;
              const dropPhoto = effectivePhotos[(idx + 3) % effectivePhotos.length];
              const showDropPhoto = Boolean(dropPhoto && !failedUrls[dropPhoto]);
              return (
                <button
                  key={drop.id}
                  type="button"
                  onClick={() => setSelectedDropIdx(idx)}
                  className={`group flex flex-col justify-between overflow-hidden border text-left transition duration-300 ${
                    isSelected
                      ? 'border-2 border-[#111111] bg-[#F6F5F1] shadow-[3px_3px_0_#111111]'
                      : 'border-[#111111]/40 bg-white hover:-translate-y-0.5 hover:border-[#111111]'
                  }`}
                >
                  <div className="relative aspect-[5/4] w-full overflow-hidden border-b border-[#111111]/20 bg-[#F4F3EF]">
                    {showDropPhoto ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={dropPhoto}
                          alt={drop.name}
                          onError={() =>
                            setFailedUrls((prev) => ({ ...prev, [dropPhoto]: true }))
                          }
                          className="h-full w-full object-cover contrast-[1.06] saturate-[0.75] transition duration-700 ease-out group-hover:scale-[1.06] group-hover:saturate-100"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute right-1.5 top-1.5 bg-[#111111]/85 px-1.5 py-0.5 font-mono text-[7.5px] font-bold text-white"
                        >
                          0{idx + 1}
                        </span>
                      </>
                    ) : (
                      <MiniDropArtSvg kind={drop.kind} />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="truncate font-zine text-xs font-black uppercase text-[#111111] sm:text-sm">
                      {drop.name}
                    </p>
                    <div className="mt-1 flex items-center justify-between font-mono text-[9.5px] font-bold">
                      <span className="text-[#111111]/60">{drop.code}</span>
                      <span className="font-tabular text-[#111111]">₹{drop.price}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Woven Garment Label + Spec Bars (Art-Forward, Minimal Copy) */}
        <section
          aria-labelledby={`quality-meter-${uid}`}
          className="grid grid-cols-1 gap-4 border-2 border-[#111111] bg-[#FAFAFA] p-4 sm:grid-cols-2"
        >
          <div>
            <h2
              id={`quality-meter-${uid}`}
              className="font-zine text-base font-black uppercase tracking-wide"
              style={hiSafeStyle(language)}
            >
              {copy.qualityHeading}
            </h2>
            <div className="mt-2.5 space-y-2">
              {[
                { label: copy.qualityMetrics[0], score: '10/10', pct: '100%' },
                { label: copy.qualityMetrics[1], score: '9.5/10', pct: '95%' },
                { label: copy.qualityMetrics[2], score: '10/10', pct: '100%' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase">
                    <span>{row.label}</span>
                    <span>{row.score}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full border border-[#111111] bg-white">
                    <div className="h-full bg-[#111111]" style={{ width: row.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Woven Atelier Barcode & Care Stamp */}
          <div className="flex flex-col justify-between border-t border-[#111111]/25 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em]">
                ATELIER SPEC // 400GSM
              </span>
              <span className="border border-[#111111] px-1.5 py-0.5 font-mono text-[8.5px] font-bold">
                LIMITED
              </span>
            </div>

            {/* Graphic Barcode SVG */}
            <svg viewBox="0 0 200 36" className="my-2.5 h-9 w-full" aria-hidden="true">
              {[2, 8, 13, 16, 22, 29, 32, 38, 44, 47, 54, 62, 66, 71, 78, 84, 88, 95, 102, 106, 112, 120, 124, 131, 138, 142, 148, 155, 161, 166, 174, 180, 186, 192].map((x, i) => (
                <rect
                  key={x}
                  x={x}
                  y="2"
                  width={i % 3 === 0 ? 3.2 : i % 2 === 0 ? 1.8 : 1.1}
                  height="26"
                  fill="#111111"
                />
              ))}
              <text x="2" y="35" fontSize="6.5" fontFamily="monospace" fill="#111111">
                {activeDrop.code} // {activeColor.label.toUpperCase()} // SZ-{selectedSize}
              </text>
            </svg>

            <p className="font-mono text-[9px] uppercase tracking-wider text-[#111111]/65">
              SMALL-BATCH ARCHIVE · HAND-INSPECTED
            </p>
          </div>
        </section>

        {/* Oversized Wordmark Stamp */}
        <section className="overflow-hidden border-t-2 border-[#111111] pt-3 text-center">
          <p
            className="break-words font-zine text-3xl font-black uppercase leading-none tracking-tighter text-[#111111] sm:text-5xl"
            style={hiSafeStyle(language)}
          >
            {storeName}
          </p>
        </section>
      </main>

      {toastMsg ? (
        <div
          role="status"
          className="fixed left-1/2 top-4 z-[110] -translate-x-1/2 border border-white/20 bg-[#111111] px-4 py-2 font-mono text-[11px] font-bold text-white shadow-xl"
        >
          {toastMsg}
        </div>
      ) : null}

      {showSummary ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowSummary(false)}
          className="fixed inset-0 z-[115] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85dvh] w-full max-w-md overflow-y-auto border-2 border-[#111111] bg-white p-4 text-[#111111] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#111111] pb-2">
              <span className="font-mono text-xs font-extrabold uppercase tracking-wider">
                {storeName} // ORDER SPEC
              </span>
              <button
                type="button"
                onClick={() => setShowSummary(false)}
                className="min-h-[40px] px-2 font-mono text-xs font-bold underline"
              >
                {sharedCopy.closeBtn}
              </button>
            </div>
            <pre className="mt-3 whitespace-pre-wrap border border-[#111111]/20 bg-[#FAFAFA] p-3 font-mono text-[11px] leading-relaxed">
              {orderMessage}
            </pre>
            <button
              type="button"
              onClick={handleCopyOrder}
              className="mt-3 min-h-[42px] w-full bg-[#111111] font-mono text-xs font-bold uppercase tracking-wider text-white"
            >
              {sharedCopy.copyOrderBtn}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
