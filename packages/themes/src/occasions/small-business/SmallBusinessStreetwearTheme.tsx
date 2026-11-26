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
  strokeHex: string;
  detailHex: string;
}

interface StreetwearDrop {
  id: string;
  name: string;
  code: string;
  price: number;
  spec: string;
}

const COLORWAYS: readonly ColorwayOption[] = [
  { id: 'obsidian', label: 'Obsidian', hex: '#141416', strokeHex: '#FFFFFF', detailHex: '#52525B' },
  { id: 'chalk', label: 'Chalk', hex: '#EBEAE4', strokeHex: '#111111', detailHex: '#A1A1AA' },
  { id: 'slate', label: 'Graphite', hex: '#38404D', strokeHex: '#E4E4E7', detailHex: '#71717A' },
];

const SIZES: readonly SizeOption[] = ['XS', 'S', 'M', 'L', 'XL'];

const RELEVANT_DROPS: readonly StreetwearDrop[] = [
  {
    id: 'sw-1',
    name: 'BOX SHELL JACKET 04',
    code: 'ARCHIVE-04',
    price: 3499,
    spec: '100% Heavyweight Cotton · Tailored Cut · 400 GSM',
  },
  {
    id: 'sw-2',
    name: 'RAW SEAM CARGO PANT',
    code: 'UTILITY-09',
    price: 2699,
    spec: 'Ripstop Twill · Articulated Knee · Matte Hardware',
  },
  {
    id: 'sw-3',
    name: 'BOXY DROP HOODIE',
    code: 'CORE-12',
    price: 2299,
    spec: '440 GSM French Terry · Dropped Shoulder',
  },
];

function TechnicalGarmentSvg({
  angleIdx,
  colorway,
}: {
  angleIdx: GarmentAngleIdx;
  colorway: ColorwayOption;
}) {
  if (angleIdx === 0) {
    // Front technical jacket blueprint
    return (
      <svg viewBox="0 0 220 200" className="h-full w-full" aria-hidden="true">
        <rect x="0" y="0" width="220" height="200" fill="#FAFAFA" />
        <path d="M20 20h180M20 180h180" stroke="#111111" strokeWidth="0.6" strokeOpacity="0.15" />
        {/* Jacket body */}
        <path
          d="M72 34 L94 26 L126 26 L148 34 L182 64 L168 156 L146 156 L154 78 L148 166 L72 166 L66 78 L74 156 L52 156 L38 64 Z"
          fill={colorway.hex}
          stroke="#111111"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Collar & center zip */}
        <path d="M94 26 L110 46 L126 26" fill="none" stroke={colorway.strokeHex} strokeWidth="1.8" />
        <line x1="110" y1="46" x2="110" y2="166" stroke={colorway.strokeHex} strokeWidth="1.6" strokeDasharray="3 2" />
        {/* Chest pocket welt */}
        <rect x="78" y="84" width="24" height="28" fill="none" stroke={colorway.strokeHex} strokeWidth="1.3" />
        <rect x="118" y="84" width="24" height="28" fill="none" stroke={colorway.strokeHex} strokeWidth="1.3" />
        {/* Technical callout */}
        <text x="16" y="18" fontSize="8" fontFamily="monospace" fill="#111111">FIG 01 // FRONT SILHOUETTE</text>
      </svg>
    );
  }
  if (angleIdx === 1) {
    // Drape / side silhouette
    return (
      <svg viewBox="0 0 220 200" className="h-full w-full" aria-hidden="true">
        <rect x="0" y="0" width="220" height="200" fill="#FAFAFA" />
        <path
          d="M84 30 C110 24, 136 38, 142 70 L152 158 L70 164 L78 72 Z"
          fill={colorway.hex}
          stroke="#111111"
          strokeWidth="2"
        />
        <path d="M98 62 C112 96, 118 124, 114 158" fill="none" stroke={colorway.strokeHex} strokeWidth="1.6" strokeOpacity="0.8" />
        <path d="M120 50 C134 86, 138 118, 134 156" fill="none" stroke={colorway.detailHex} strokeWidth="1.4" />
        <text x="16" y="18" fontSize="8" fontFamily="monospace" fill="#111111">FIG 02 // SHOULDER DRAPE</text>
      </svg>
    );
  }
  if (angleIdx === 2) {
    // Stitch close-up macro
    return (
      <svg viewBox="0 0 220 200" className="h-full w-full" aria-hidden="true">
        <rect x="0" y="0" width="220" height="200" fill={colorway.hex} />
        <line x1="0" y1="100" x2="220" y2="100" stroke={colorway.strokeHex} strokeWidth="2" />
        <line x1="0" y1="88" x2="220" y2="88" stroke={colorway.strokeHex} strokeWidth="1.8" strokeDasharray="8 6" />
        <line x1="0" y1="112" x2="220" y2="112" stroke={colorway.strokeHex} strokeWidth="1.8" strokeDasharray="8 6" />
        <rect x="14" y="12" width="136" height="18" fill="#111111" />
        <text x="20" y="24" fontSize="8" fontFamily="monospace" fill="#FFFFFF">FIG 03 // DOUBLE-NEEDLE STITCH</text>
      </svg>
    );
  }
  // Flat-lay dimension diagram
  return (
    <svg viewBox="0 0 220 200" className="h-full w-full" aria-hidden="true">
      <rect x="0" y="0" width="220" height="200" fill="#FAFAFA" />
      <rect x="64" y="42" width="92" height="118" fill={colorway.hex} stroke="#111111" strokeWidth="2" />
      <line x1="48" y1="42" x2="48" y2="160" stroke="#111111" strokeWidth="1" />
      <line x1="44" y1="42" x2="52" y2="42" stroke="#111111" strokeWidth="1" />
      <line x1="44" y1="160" x2="52" y2="160" stroke="#111111" strokeWidth="1" />
      <line x1="64" y1="176" x2="156" y2="176" stroke="#111111" strokeWidth="1" />
      <text x="16" y="18" fontSize="8" fontFamily="monospace" fill="#111111">FIG 04 // FLAT SPEC 68CM</text>
    </svg>
  );
}

/**
 * Small Business Theme 2: "Monochrome Atelier" (Viral Jacket brutalist lookbook style).
 * Optic white, 1px #111111 grid borders, 4-angle switcher, size/colorway controls & quality bars.
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
  const brandNote = pickLocalizedText(data.message, language).trim();
  const offerTag = data.offerTag ? pickLocalizedText(data.offerTag, language).trim() : '';

  const photos = getValidPhotos(data.photos);
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
  const activePhoto = photos[angleIdx] ?? photos[selectedDropIdx];
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
      {/* Top Brutalist Lookbook Masthead */}
      <header className="border-b border-[#111111] px-3.5 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-1.5">
          <span className="min-w-0 font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#111111]">
            {offerTag || copy.dropTag}
          </span>
          <span className="shrink-0 border border-[#111111] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest">
            {copy.stockLine}
          </span>
        </div>
        <h1
          className="mx-auto mt-2 max-w-5xl break-words font-zine text-3xl font-black uppercase leading-none tracking-tight text-[#111111] sm:text-5xl"
          style={hiSafeStyle(language)}
        >
          {storeName}
        </h1>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-3.5 py-5 sm:px-6">
        {/* Featured Flagship Drop Hero */}
        <section
          aria-labelledby={`drop-title-${uid}`}
          className="grid grid-cols-1 border border-[#111111] md:grid-cols-12"
        >
          {/* Left: Garment Viewport + 4-Angle Thumbnail Switcher */}
          <div className="flex flex-col border-b border-[#111111] md:col-span-7 md:border-b-0 md:border-r">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAFAFA]">
              {showPhoto ? (
                <button
                  type="button"
                  onClick={() => onOpenPhoto?.(photos.indexOf(activePhoto))}
                  className="h-full w-full"
                  aria-label="Zoom garment photo"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activePhoto}
                    alt={activeDrop.name}
                    onError={() =>
                      setFailedUrls((prev) => ({ ...prev, [activePhoto]: true }))
                    }
                    className="h-full w-full object-cover"
                  />
                </button>
              ) : (
                <TechnicalGarmentSvg angleIdx={angleIdx} colorway={activeColor} />
              )}

              <span className="absolute left-2.5 top-2.5 bg-[#111111] px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-widest text-white">
                {activeDrop.code}
              </span>
            </div>

            {/* 4-Angle Switcher Strip */}
            <div className="grid grid-cols-4 border-t border-[#111111]">
              {([0, 1, 2, 3] as const).map((idx) => {
                const isActive = angleIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAngleIdx(idx)}
                    aria-pressed={isActive}
                    className={`min-h-[42px] border-r border-[#111111] px-1 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-wider transition last:border-r-0 ${
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

          {/* Right: Specs, Colorway, Size Selector & Inverted CTA */}
          <div className="flex flex-col justify-between gap-4 p-4 sm:p-5 md:col-span-5">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h2
                  id={`drop-title-${uid}`}
                  className="break-words font-zine text-xl font-black uppercase leading-tight tracking-wide text-[#111111] sm:text-2xl"
                  style={hiSafeStyle(language)}
                >
                  {selectedDropIdx === 0 ? headline : activeDrop.name}
                </h2>
                <span className="font-tabular shrink-0 border border-[#111111] px-2 py-0.5 font-mono text-xs font-extrabold">
                  ₹{activeDrop.price}
                </span>
              </div>

              <p className="mt-2 font-mono text-[10.5px] leading-relaxed text-[#111111]/75">
                {activeDrop.spec || copy.specLine}
              </p>

              {brandNote ? (
                <p className="mt-2 border-l-2 border-[#111111] pl-2.5 text-xs leading-relaxed text-[#111111]/85">
                  {brandNote}
                </p>
              ) : null}

              {/* Colorway Swatches */}
              <div className="mt-4">
                <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#111111]/65">
                  {copy.colorLabel}: <span className="text-[#111111]">{activeColor.label}</span>
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
                        className={`flex h-9 w-9 items-center justify-center border transition ${
                          isSelected ? 'border-2 border-[#111111] scale-105' : 'border-[#111111]/30'
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

              {/* Size Selector Pills */}
              <div className="mt-4">
                <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#111111]/65">
                  {copy.sizeLabel}
                </p>
                <div className="mt-1.5 grid grid-cols-5 gap-1.5">
                  {SIZES.map((sz) => {
                    const active = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        aria-pressed={active}
                        className={`min-h-[38px] border border-[#111111] font-mono text-[11px] font-bold transition ${
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
              className="min-h-[48px] w-full bg-[#111111] px-4 py-3 font-mono text-[11px] font-extrabold uppercase tracking-[0.16em] text-white transition hover:bg-[#27272A] active:scale-[0.99]"
            >
              {copy.orderDropBtn}
            </button>
          </div>
        </section>

        {/* RELEVANT DROPS 3-Card Product Strip */}
        <section aria-labelledby={`relevant-drops-${uid}`}>
          <div className="mb-2.5 flex items-center justify-between border-b border-[#111111] pb-1.5">
            <h2
              id={`relevant-drops-${uid}`}
              className="font-zine text-lg font-black uppercase tracking-wider text-[#111111]"
              style={hiSafeStyle(language)}
            >
              {copy.relevantHeading}
            </h2>
            <span className="font-mono text-[9.5px] font-bold uppercase text-[#111111]/65">
              {copy.inspectHint}
            </span>
          </div>

          <div className="flex snap-x gap-2.5 overflow-x-auto pb-1 scrollbar-none md:grid md:grid-cols-3 md:overflow-visible">
            {drops.map((drop, idx) => {
              const isSelected = selectedDropIdx === idx;
              return (
                <button
                  key={drop.id}
                  type="button"
                  onClick={() => setSelectedDropIdx(idx)}
                  className={`flex w-[210px] shrink-0 snap-start flex-col justify-between border text-left transition md:w-auto ${
                    isSelected
                      ? 'border-2 border-[#111111] bg-[#FAFAFA]'
                      : 'border-[#111111] bg-white hover:bg-[#F4F4F5]'
                  }`}
                >
                  <div className="p-3">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#111111]/60">
                      {drop.code}
                    </span>
                    <p className="mt-1 font-zine text-base font-black uppercase leading-tight text-[#111111]">
                      {drop.name}
                    </p>
                    <p className="mt-1 line-clamp-2 font-mono text-[10px] text-[#111111]/70">
                      {drop.spec}
                    </p>
                  </div>
                  <div className="flex w-full items-center justify-between bg-[#111111] px-3 py-2 font-mono text-[10.5px] font-bold text-white">
                    <span>{copy.inspectHint}</span>
                    <span className="font-tabular">₹{drop.price}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* VERIFIED BUYER QUALITY Meter + Patron Reviews */}
        <section
          aria-labelledby={`quality-meter-${uid}`}
          className="grid grid-cols-1 gap-4 border border-[#111111] p-4 sm:grid-cols-2 sm:p-5"
        >
          <div>
            <h2
              id={`quality-meter-${uid}`}
              className="font-zine text-lg font-black uppercase tracking-wide"
              style={hiSafeStyle(language)}
            >
              {copy.qualityHeading}
            </h2>
            <div className="mt-3 space-y-2.5">
              {[
                { label: copy.qualityMetrics[0], score: '10/10', pct: '100%' },
                { label: copy.qualityMetrics[1], score: '9.5/10', pct: '95%' },
                { label: copy.qualityMetrics[2], score: '10/10', pct: '100%' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between font-mono text-[10.5px] font-bold uppercase">
                    <span>{row.label}</span>
                    <span>{row.score}</span>
                  </div>
                  <div className="mt-1 h-2 w-full border border-[#111111] bg-white">
                    <div className="h-full bg-[#111111]" style={{ width: row.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-2.5 border-t border-[#111111]/20 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#111111]/70">
              {copy.reviewsHeading}
            </h3>
            <div className="space-y-2">
              <div className="border border-[#111111] bg-[#FAFAFA] p-2.5">
                <p className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-[#111111]/65">
                  PATRON #418 · VERIFIED DROP
                </p>
                <p className="mt-1 text-xs font-medium leading-snug">
                  Heavyweight fabric holds its boxy drape after washes. Stitching is dead straight.
                </p>
              </div>
              <div className="border border-[#111111] bg-[#FAFAFA] p-2.5">
                <p className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-[#111111]/65">
                  PATRON #209 · VERIFIED DROP
                </p>
                <p className="mt-1 text-xs font-medium leading-snug">
                  WhatsApp dispatch confirmation arrived within minutes. Clean monochrome finish.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Oversized Brutalist Monochrome Footer Wordmark */}
        <section className="overflow-hidden border-t-2 border-[#111111] pt-4 text-center">
          <p
            className="break-words font-zine text-3xl font-black uppercase leading-none tracking-tighter text-[#111111] sm:text-6xl"
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
                className="min-h-[44px] px-2 font-mono text-xs font-bold underline"
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
              className="mt-3 min-h-[44px] w-full bg-[#111111] font-mono text-xs font-bold uppercase tracking-wider text-white"
            >
              {sharedCopy.copyOrderBtn}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
