'use client';

import type React from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
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
  useSmallBusinessReducedMotion,
} from './smallBusinessTypes';

interface ScrollMetrics {
  progress: number;
  scrollTop: number;
  velocity: number;
}

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let curr = el?.parentElement ?? null;
  while (curr) {
    const style = window.getComputedStyle(curr);
    const overflowY = style.overflowY;
    if (
      overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflowY === 'overlay'
    ) {
      return curr;
    }
    curr = curr.parentElement;
  }
  return null;
}

function useContainerScrollProgress(
  rootRef: React.RefObject<HTMLDivElement | null>,
  disabled: boolean,
): ScrollMetrics {
  const [metrics, setMetrics] = useState<ScrollMetrics>({
    progress: 0,
    scrollTop: 0,
    velocity: 0,
  });
  const lastTopRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (disabled || typeof window === 'undefined') {
      setMetrics({ progress: 0, scrollTop: 0, velocity: 0 });
      return;
    }

    const scrollParent = findScrollParent(rootRef.current);

    const measure = () => {
      rafRef.current = null;
      let top = 0;
      let maxScroll = 1;

      if (scrollParent && scrollParent.scrollHeight > scrollParent.clientHeight + 4) {
        top = scrollParent.scrollTop;
        maxScroll = Math.max(1, scrollParent.scrollHeight - scrollParent.clientHeight);
      } else {
        top = window.scrollY || document.documentElement.scrollTop || 0;
        maxScroll = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight,
        );
      }

      const progress = Math.max(0, Math.min(1, top / maxScroll));
      const delta = Math.abs(top - lastTopRef.current);
      lastTopRef.current = top;
      const velocity = Math.max(0, Math.min(1, delta / 45));

      setMetrics({ progress, scrollTop: top, velocity });
    };

    const scheduleMeasure = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(measure);
    };

    measure();
    if (scrollParent) {
      scrollParent.addEventListener('scroll', scheduleMeasure, { passive: true });
    }
    window.addEventListener('scroll', scheduleMeasure, { passive: true });
    window.addEventListener('resize', scheduleMeasure, { passive: true });

    return () => {
      if (scrollParent) {
        scrollParent.removeEventListener('scroll', scheduleMeasure);
      }
      window.removeEventListener('scroll', scheduleMeasure);
      window.removeEventListener('resize', scheduleMeasure);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [rootRef, disabled]);

  return metrics;
}

interface PrismCardItem {
  id: string;
  code: string;
  title: string;
  price: number;
  accent: string;
}

const SAMPLE_PHOTOS: readonly string[] = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80',
];

const DEFAULT_PRISM_ITEMS: readonly PrismCardItem[] = [
  {
    id: 'p3d-1',
    code: 'F-01',
    title: 'Prism Chrono',
    price: 4299,
    accent: '#818CF8',
  },
  {
    id: 'p3d-2',
    code: 'F-02',
    title: 'Orbital Halo Lamp',
    price: 2899,
    accent: '#22D3EE',
  },
  {
    id: 'p3d-3',
    code: 'F-03',
    title: 'Monolith Dock',
    price: 1999,
    accent: '#F59E0B',
  },
  {
    id: 'p3d-4',
    code: 'F-04',
    title: 'Aramid Folio',
    price: 1499,
    accent: '#C084FC',
  },
];

/** Centerpiece floating Holographic Prism Sculpture for the 3D Hero stage. */
function HeroPrismSculptureSvg({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 240 160" className="h-32 w-48 sm:h-40 sm:w-60" aria-hidden="true">
      <defs>
        <linearGradient id={`prism-a-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#818CF8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0E111D" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`prism-b-${uid}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#818CF8" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id={`prism-core-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#22D3EE" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Volumetric light beam */}
      <circle cx="120" cy="80" r="64" fill={`url(#prism-core-${uid})`} />

      {/* Faceted floating crystal octahedron */}
      <polygon points="120,14 176,78 120,104 64,78" fill={`url(#prism-a-${uid})`} stroke="#E0E7FF" strokeOpacity="0.7" strokeWidth="1.1" />
      <polygon points="120,14 176,78 120,66" fill="#22D3EE" fillOpacity="0.28" />
      <polygon points="120,14 64,78 120,66" fill="#818CF8" fillOpacity="0.32" />
      <polygon points="64,78 120,104 120,146" fill={`url(#prism-b-${uid})`} stroke="#818CF8" strokeOpacity="0.6" strokeWidth="1" />
      <polygon points="176,78 120,104 120,146" fill="#0F172A" fillOpacity="0.75" stroke="#22D3EE" strokeOpacity="0.5" strokeWidth="1" />
      {/* Refractive inner highlight */}
      <line x1="120" y1="14" x2="120" y2="146" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="1" />
      <ellipse cx="120" cy="78" rx="88" ry="18" fill="none" stroke="#22D3EE" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 4" />
      {/* Starlight glints */}
      <circle cx="52" cy="44" r="1.6" fill="#22D3EE" />
      <circle cx="192" cy="52" r="1.8" fill="#F59E0B" />
      <circle cx="182" cy="118" r="1.4" fill="#818CF8" />
    </svg>
  );
}

/** Detailed Iridescent Sculpture Art Plates for each 3D facet & deck card. */
function FacetSculpturePlateSvg({
  idx,
  accent,
  uid,
}: {
  idx: number;
  accent: string;
  uid: string;
}) {
  return (
    <svg viewBox="0 0 160 112" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={`glow-${uid}-${idx}`} cx="50%" cy="46%" r="58%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.38" />
          <stop offset="100%" stopColor="#06070B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`metal-${uid}-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F4F4F5" stopOpacity="0.9" />
          <stop offset="45%" stopColor={accent} stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0B0E17" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Perspective grid floor + atmospheric radial glow */}
      <rect x="0" y="0" width="160" height="112" fill="#080A14" />
      <circle cx="80" cy="52" r="54" fill={`url(#glow-${uid}-${idx})`} />
      <g stroke={accent} strokeOpacity="0.16" strokeWidth="0.7">
        <line x1="0" y1="88" x2="160" y2="88" />
        <line x1="0" y1="98" x2="160" y2="98" />
        <line x1="40" y1="88" x2="18" y2="112" />
        <line x1="80" y1="88" x2="80" y2="112" />
        <line x1="120" y1="88" x2="142" y2="112" />
      </g>

      {idx === 0 ? (
        <g>
          {/* Faceted Sapphire Chronometer Monolith */}
          <polygon points="80,14 116,36 116,74 80,94 44,74 44,36" fill={`url(#metal-${uid}-${idx})`} fillOpacity="0.35" stroke={accent} strokeWidth="1.4" />
          <polygon points="80,24 106,40 106,70 80,84 54,70 54,40" fill="#0B0E17" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1" />
          <circle cx="80" cy="54" r="18" fill="none" stroke={accent} strokeWidth="1.6" />
          <circle cx="80" cy="54" r="12" fill="none" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="0.9" strokeDasharray="2 3" />
          <line x1="80" y1="54" x2="80" y2="41" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="80" y1="54" x2="90" y2="58" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="80" cy="54" r="2.2" fill="#FFFFFF" />
        </g>
      ) : idx === 1 ? (
        <g>
          {/* Orbital Levitation Halo Lamp */}
          <ellipse cx="80" cy="92" rx="28" ry="6" fill="#1E293B" stroke={accent} strokeOpacity="0.5" strokeWidth="1" />
          <circle cx="80" cy="50" r="30" fill="none" stroke={`url(#metal-${uid}-${idx})`} strokeWidth="4.5" />
          <ellipse cx="80" cy="50" rx="36" ry="12" fill="none" stroke={accent} strokeWidth="1.3" strokeOpacity="0.8" />
          <circle cx="80" cy="50" r="9" fill={accent} fillOpacity="0.85" />
          <circle cx="77" cy="47" r="3" fill="#FFFFFF" fillOpacity="0.75" />
        </g>
      ) : idx === 2 ? (
        <g>
          {/* CNC Billet Monolith Dock with Gold Pins */}
          <polygon points="38,76 58,34 122,34 102,76" fill={`url(#metal-${uid}-${idx})`} fillOpacity="0.4" stroke={accent} strokeWidth="1.3" />
          <polygon points="38,76 102,76 102,88 38,88" fill="#111827" stroke={accent} strokeWidth="1.2" />
          <polygon points="102,76 122,34 122,46 102,88" fill="#1F2937" stroke={accent} strokeOpacity="0.6" strokeWidth="1" />
          {/* Precision gold contact pins */}
          {[56, 66, 76, 86].map((x) => (
            <circle key={x} cx={x} cy="62" r="2.2" fill="#F59E0B" />
          ))}
        </g>
      ) : (
        <g>
          {/* Woven Carbon-Aramid Prism Folio */}
          <polygon points="80,16 124,84 36,84" fill={`url(#metal-${uid}-${idx})`} fillOpacity="0.32" stroke={accent} strokeWidth="1.4" />
          <polygon points="80,32 108,76 52,76" fill="#0F172A" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="1" />
          <line x1="80" y1="16" x2="80" y2="84" stroke={accent} strokeWidth="1.2" />
          <circle cx="80" cy="58" r="7" fill={accent} fillOpacity="0.7" />
        </g>
      )}
    </svg>
  );
}

/**
 * Small Business Theme 4: "Prism 3D Scroll Universe" (Kinetic Obsidian Gallery).
 * Deep obsidian #06070B, sculptural 3D Monolith Hero, 6-face holographic sculpture cube,
 * velocity marquee & 2-up perspective gallery deck.
 */
export function SmallBusiness3DScrollTheme({
  data,
  language,
  onOpened,
  onOpenPhoto,
}: SmallBusinessThemeComponentProps) {
  const uid = useId().replace(/:/g, '');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useSmallBusinessReducedMotion();
  const coreLang = toCoreLanguageCode(language);
  const copy =
    SMALL_BUSINESS_THEMES_COPY[coreLang]?.kinetic3d ??
    SMALL_BUSINESS_THEMES_COPY.en.kinetic3d;
  const sharedCopy =
    SMALL_BUSINESS_THEMES_COPY[coreLang] ?? SMALL_BUSINESS_THEMES_COPY.en;

  const { progress: scrollProgress, velocity } = useContainerScrollProgress(
    rootRef,
    reducedMotion,
  );

  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [manualFace, setManualFace] = useState(0);
  const [autoSpin, setAutoSpin] = useState(!reducedMotion);
  const [spinDeg, setSpinDeg] = useState(0);
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [inquiryPreview, setInquiryPreview] = useState<string | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (reducedMotion || !autoSpin) return;
    const id = window.setInterval(() => {
      setSpinDeg((prev) => prev + 18);
    }, 850);
    return () => window.clearInterval(id);
  }, [autoSpin, reducedMotion]);

  const storeName = deriveStoreName(data, copy.defaultStore);
  const monogram = extractStoreMonogram(storeName);
  const headline = pickLocalizedText(data.headline, language).trim() || storeName;
  const offerTag = data.offerTag ? pickLocalizedText(data.offerTag, language).trim() : '';

  const photos = getValidPhotos(data.photos);
  const hasUserPhotos = photos.length > 0;
  const effectivePhotos = hasUserPhotos ? photos : SAMPLE_PHOTOS;
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const customHighlights = deriveHighlights(data, language);

  const items: readonly PrismCardItem[] = useMemo(() => {
    if (customHighlights.length === 0) return DEFAULT_PRISM_ITEMS;
    return DEFAULT_PRISM_ITEMS.map((item, idx) => {
      const h = customHighlights[idx];
      if (!h) return item;
      return {
        ...item,
        title: h.title || item.title,
      };
    });
  }, [customHighlights]);

  const activeItem = items[activeCardIdx] ?? items[0];
  const heroPhoto =
    effectivePhotos[0] && !failedUrls[effectivePhotos[0]] ? effectivePhotos[0] : null;
  const validWa = sanitizeWhatsappPhone(data.whatsappPhone);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({
      x: Math.max(-1, Math.min(1, nx)),
      y: Math.max(-1, Math.min(1, ny)),
    });
  }

  function flashToast(msg: string) {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 2600);
  }

  function handleWhatsAppBooking() {
    onOpened?.();
    const inquiry = [
      `3D STOREFRONT BOOKING // ${storeName}`,
      `Selected Facet: ${activeItem.title} (${activeItem.code})`,
      `Estimate: INR ${activeItem.price}`,
      offerTag ? `Offer: ${offerTag}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const href = buildWhatsAppOrderHref(validWa, inquiry);
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    setInquiryPreview(inquiry);
    flashToast(sharedCopy.demoOrderToast);
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

  const heroRotateX = reducedMotion ? 0 : -tilt.y * 9 + scrollProgress * 12;
  const heroRotateY = reducedMotion ? 0 : tilt.x * 11 - scrollProgress * 10;
  const headlineScale = reducedMotion ? 1 : 1 + scrollProgress * 0.08;
  const splitDepthPx = reducedMotion ? 0 : scrollProgress * 22;
  const ringSpinDeg = reducedMotion ? 0 : scrollProgress * 260 + tilt.x * 24;

  const cubeYaw = reducedMotion
    ? -manualFace * 90
    : -manualFace * 90 + scrollProgress * 240 + spinDeg + tilt.x * 16;
  const cubePitch = reducedMotion ? 0 : -12 + Math.sin(scrollProgress * Math.PI) * 10 - tilt.y * 10;

  const marqueeOffsetA = reducedMotion
    ? 0
    : -((scrollProgress * 180 + velocity * 30) % 120);
  const marqueeOffsetB = reducedMotion
    ? 0
    : ((scrollProgress * 160 + velocity * 26) % 120) - 60;

  return (
    <div
      ref={rootRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative flex min-h-full w-full flex-col overflow-x-clip bg-[#06070B] text-[#F4F4F5]"
      style={hiSafeStyle(language)}
    >
      {/* Ambient Radial Space Glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#818CF8]/22 blur-3xl"
          style={
            reducedMotion
              ? undefined
              : { transform: `translate3d(0, ${scrollProgress * 60}px, 0)` }
          }
        />
        <div
          className="absolute -right-20 top-72 h-64 w-64 rounded-full bg-[#22D3EE]/18 blur-3xl"
          style={
            reducedMotion
              ? undefined
              : { transform: `translate3d(0, ${-scrollProgress * 50}px, 0)` }
          }
        />
      </div>

      {/* Minimal Depth HUD Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-white/10 bg-[#06070B]/85 px-3.5 py-2 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#818CF8]/50 bg-[#818CF8]/20 font-mono text-[10px] font-bold text-[#22D3EE]">
            {monogram}
          </span>
          <span className="truncate font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#F4F4F5]">
            {storeName}
          </span>
        </div>

        <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 font-mono text-[9.5px] font-bold text-[#F59E0B]">
          Z · {Math.round(scrollProgress * 100)}%
        </span>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-3.5 pb-8 pt-4 sm:px-6">
        {/* 1. Sculptural 3D Monolith Hero */}
        <section
          aria-labelledby={`prism-hero-${uid}`}
          className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#0E1222] via-[#090B14] to-[#06070B] px-4 py-6 text-center shadow-[0_24px_60px_-20px_rgba(34,211,238,0.28)] sm:py-9"
          style={{ perspective: '1100px' }}
        >
          {/* Depth-layered Glassmorphic Editorial Backdrop */}
          {heroPhoto ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 overflow-hidden rounded-2xl border border-white/10 opacity-30"
              style={{
                transform: `translateZ(-24px) scale(${reducedMotion ? 1 : 1.04 - scrollProgress * 0.04})`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroPhoto}
                alt=""
                onError={() =>
                  setFailedUrls((prev) => ({ ...prev, [heroPhoto]: true }))
                }
                className="h-full w-full object-cover mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#090B14]/70 via-[#090B14]/55 to-[#06070B]" />
            </div>
          ) : null}

          {/* Rotating Orbital Rings */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div
              className="h-52 w-52 rounded-full border border-dashed border-[#818CF8]/35 transition-transform duration-150 ease-out sm:h-72 sm:w-72"
              style={{
                transform: `rotateX(68deg) rotateZ(${ringSpinDeg}deg)`,
              }}
            />
            <div
              className="absolute h-40 w-40 rounded-full border border-[#22D3EE]/30 transition-transform duration-150 ease-out sm:h-56 sm:w-56"
              style={{
                transform: `rotateX(72deg) rotateY(22deg) rotateZ(${-ringSpinDeg * 0.8}deg)`,
              }}
            />
          </div>

          <div
            className="relative z-10 flex max-w-lg flex-col items-center transition-transform duration-150 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${heroRotateX}deg) rotateY(${heroRotateY}deg)`,
            }}
          >
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-[#22D3EE]/40 bg-[#22D3EE]/10 px-3 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#22D3EE]"
              style={{ transform: `translateZ(${18 + splitDepthPx * 0.4}px)` }}
            >
              {offerTag || copy.hudBadge}
            </span>

            <div
              className="my-1 drop-shadow-[0_0_24px_rgba(34,211,238,0.3)]"
              style={{ transform: `translateZ(${24 + splitDepthPx * 0.5}px)` }}
            >
              <HeroPrismSculptureSvg uid={uid} />
            </div>

            <h1
              id={`prism-hero-${uid}`}
              className="break-words bg-gradient-to-r from-[#F4F4F5] via-[#818CF8] to-[#22D3EE] bg-clip-text font-zine text-3xl font-black uppercase leading-none tracking-tight text-transparent sm:text-5xl"
              style={{
                ...hiSafeStyle(language),
                transform: `translateZ(${28 + splitDepthPx}px) scale(${headlineScale})`,
              }}
            >
              {headline}
            </h1>
          </div>
        </section>

        {/* 2. 6-Face Holographic Sculpture Cube */}
        <section
          aria-labelledby={`cube-heading-${uid}`}
          className="rounded-3xl border border-white/10 bg-[#0B0D16]/90 p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id={`cube-heading-${uid}`}
              className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#818CF8]"
            >
              {copy.cubeTitle}
            </h2>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setManualFace((f) => (f - 1 + 4) % 4)}
                className="min-h-[34px] rounded-full border border-white/20 bg-white/5 px-3 font-mono text-[10px] font-bold text-white hover:bg-white/10"
              >
                {copy.prevFace}
              </button>
              <button
                type="button"
                onClick={() => setManualFace((f) => (f + 1) % 4)}
                className="min-h-[34px] rounded-full border border-white/20 bg-white/5 px-3 font-mono text-[10px] font-bold text-white hover:bg-white/10"
              >
                {copy.nextFace}
              </button>
              {!reducedMotion ? (
                <button
                  type="button"
                  onClick={() => setAutoSpin((s) => !s)}
                  aria-pressed={autoSpin}
                  className={`min-h-[34px] rounded-full px-3 font-mono text-[10px] font-bold transition ${
                    autoSpin
                      ? 'bg-[#22D3EE] text-[#06070B]'
                      : 'border border-white/20 bg-white/5 text-white'
                  }`}
                >
                  {autoSpin ? copy.autoSpinOn : copy.autoSpinOff}
                </button>
              ) : null}
            </div>
          </div>

          <div
            className="my-6 flex items-center justify-center py-2"
            style={{ perspective: '900px', perspectiveOrigin: '50% 50%' }}
          >
            <div
              className="relative h-[148px] w-[148px] transition-transform duration-500 ease-out sm:h-[184px] sm:w-[184px]"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${cubePitch}deg) rotateY(${cubeYaw}deg)`,
              }}
            >
              {items.slice(0, 4).map((item, faceIdx) => {
                const faceDeg = faceIdx * 90;
                const photoUrl = effectivePhotos[faceIdx % effectivePhotos.length];
                const showPhoto = Boolean(photoUrl && !failedUrls[photoUrl]);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveCardIdx(faceIdx);
                      if (hasUserPhotos && showPhoto && faceIdx < photos.length) {
                        onOpenPhoto?.(faceIdx);
                      }
                    }}
                    aria-label={`Cube face ${faceIdx + 1}: ${item.title}`}
                    className="group absolute inset-0 flex flex-col justify-between overflow-hidden rounded-xl border border-[#818CF8]/45 bg-[#0C1020]/95 p-2 text-left shadow-[0_0_24px_rgba(129,140,248,0.22)] [--cube-z:74px] sm:[--cube-z:92px]"
                    style={{
                      transform: `rotateY(${faceDeg}deg) translateZ(var(--cube-z))`,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="font-mono text-[8.5px] font-bold uppercase tracking-widest"
                        style={{ color: item.accent }}
                      >
                        {item.code}
                      </span>
                      <span className="font-tabular font-mono text-[9px] font-bold text-[#F59E0B]">
                        ₹{item.price}
                      </span>
                    </div>

                    <div className="relative my-1 flex-1 overflow-hidden rounded-lg ring-1 ring-inset ring-white/15">
                      {showPhoto ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoUrl}
                            alt={item.title}
                            onError={() =>
                              setFailedUrls((prev) => ({ ...prev, [photoUrl]: true }))
                            }
                            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                          />
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06070B]/65 via-transparent to-white/10"
                          />
                        </>
                      ) : (
                        <FacetSculpturePlateSvg idx={faceIdx} accent={item.accent} uid={`cube-${uid}`} />
                      )}
                    </div>

                    <p className="truncate text-[10px] font-bold text-white">
                      {item.title}
                    </p>
                  </button>
                );
              })}

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-xl border border-[#22D3EE]/35 bg-[#818CF8]/15 [--cube-z:74px] sm:[--cube-z:92px]"
                style={{ transform: 'rotateX(90deg) translateZ(var(--cube-z))' }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-xl border border-[#818CF8]/35 bg-[#22D3EE]/10 [--cube-z:74px] sm:[--cube-z:92px]"
                style={{ transform: 'rotateX(-90deg) translateZ(var(--cube-z))' }}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5">
            {items.map((item, idx) => {
              const isFocused = activeCardIdx === idx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setManualFace(idx);
                    setActiveCardIdx(idx);
                  }}
                  className={`min-h-[32px] rounded-full px-2.5 font-mono text-[9.5px] font-bold transition ${
                    isFocused
                      ? 'bg-[#818CF8] text-[#06070B]'
                      : 'border border-white/15 bg-white/5 text-white/75 hover:text-white'
                  }`}
                >
                  {item.code} · {item.title}
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Dual Counter-Scrolling Velocity Marquee */}
        <section
          aria-hidden="true"
          className="space-y-1 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D16] py-2"
        >
          <div
            className="flex whitespace-nowrap font-mono text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-[#22D3EE]/85 transition-transform duration-100 ease-linear"
            style={{ transform: `translate3d(${marqueeOffsetA}px, 0, 0)` }}
          >
            <span className="pr-6">{copy.marqueeTop}</span>
            <span className="pr-6">{copy.marqueeTop}</span>
            <span className="pr-6">{copy.marqueeTop}</span>
          </div>
          <div
            className="flex whitespace-nowrap font-mono text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-[#F59E0B]/85 transition-transform duration-100 ease-linear"
            style={{ transform: `translate3d(${marqueeOffsetB}px, 0, 0)` }}
          >
            <span className="pr-6">{copy.marqueeBottom}</span>
            <span className="pr-6">{copy.marqueeBottom}</span>
            <span className="pr-6">{copy.marqueeBottom}</span>
          </div>
        </section>

        {/* 4. 2-up Perspective Sculpture Gallery Deck */}
        <section aria-labelledby={`deck-heading-${uid}`}>
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <h2
              id={`deck-heading-${uid}`}
              className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#22D3EE]"
            >
              {copy.deckTitle}
            </h2>
            <span className="font-mono text-[9px] text-white/55">
              {copy.tapSpotlight}
            </span>
          </div>

          <div
            className="grid grid-cols-2 gap-2.5 sm:gap-3.5"
            style={{ perspective: '1000px' }}
          >
            {items.map((item, idx) => {
              const isSelected = activeCardIdx === idx;
              const fanShift = reducedMotion
                ? 0
                : (idx % 2 === 0 ? -1 : 1) * (1 - scrollProgress) * 5;
              const cardTiltX = reducedMotion
                ? 0
                : isSelected
                  ? 0
                  : (scrollProgress - 0.5) * 9 - tilt.y * 5;
              const cardTiltY = reducedMotion
                ? 0
                : isSelected
                  ? 0
                  : (idx % 2 === 0 ? 4 : -4) + tilt.x * 5;
              const photoSrc = effectivePhotos[idx % effectivePhotos.length];
              const showPhoto = Boolean(photoSrc && !failedUrls[photoSrc]);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveCardIdx(idx);
                    setManualFace(idx);
                  }}
                  aria-pressed={isSelected}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
                    isSelected
                      ? 'border-[#22D3EE] bg-[#12172B] shadow-[0_0_26px_-6px_rgba(34,211,238,0.45)]'
                      : 'border-white/15 bg-[#0C0F1C]/90 hover:border-[#818CF8]/60'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `translate3d(${fanShift}px, 0, ${isSelected && !reducedMotion ? 14 : 0}px) rotateX(${cardTiltX}deg) rotateY(${cardTiltY}deg)`,
                  }}
                >
                  <div className="relative h-28 w-full overflow-hidden border-b border-white/10 sm:h-32">
                    {showPhoto ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoSrc}
                          alt={item.title}
                          onError={() =>
                            setFailedUrls((prev) => ({ ...prev, [photoSrc]: true }))
                          }
                          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.07]"
                        />
                        {/* Glassmorphic 3D depth frame & iridescent rim */}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-1.5 rounded-xl border border-white/20 ring-1 ring-inset ring-[#22D3EE]/20"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06070B]/70 via-transparent to-white/10"
                        />
                      </>
                    ) : (
                      <FacetSculpturePlateSvg idx={idx} accent={item.accent} uid={`deck-${uid}`} />
                    )}
                    <span
                      className="pointer-events-none absolute left-2 top-2 rounded-full border border-white/15 bg-black/65 px-2 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-widest backdrop-blur-xs"
                      style={{ color: item.accent }}
                    >
                      {item.code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 p-2.5 sm:p-3">
                    <h3 className="truncate text-xs font-bold text-white sm:text-sm">
                      {item.title}
                    </h3>
                    <span className="font-tabular shrink-0 font-mono text-[11px] font-extrabold text-[#F59E0B]">
                      ₹{item.price}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. Glassmorphic Neon Order Capsule */}
        <div className="sticky bottom-14 z-20 flex items-center justify-between gap-2 rounded-2xl border border-[#818CF8]/40 bg-[#0B0E17]/85 p-3 shadow-[0_14px_34px_-10px_rgba(129,140,248,0.45)] backdrop-blur-xl">
          <div className="min-w-0">
            <p className="font-mono text-[8.5px] font-bold uppercase tracking-widest text-[#22D3EE]">
              {activeItem.code}
            </p>
            <p className="truncate text-xs font-bold text-white">
              {activeItem.title} · ₹{activeItem.price}
            </p>
          </div>
          <button
            type="button"
            onClick={handleWhatsAppBooking}
            className="min-h-[40px] shrink-0 rounded-full bg-gradient-to-r from-[#818CF8] to-[#22D3EE] px-4 text-xs font-extrabold text-[#06070B] shadow-md transition hover:brightness-110 active:scale-95"
          >
            {copy.sendInquiryBtn}
          </button>
        </div>
      </main>

      {toastMsg ? (
        <div
          role="status"
          className="fixed left-1/2 top-4 z-[110] -translate-x-1/2 rounded-full border border-[#22D3EE]/40 bg-[#0B0E17] px-4 py-2 font-mono text-[11px] font-bold text-[#22D3EE] shadow-xl"
        >
          {toastMsg}
        </div>
      ) : null}

      {inquiryPreview ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setInquiryPreview(null)}
          className="fixed inset-0 z-[115] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#818CF8]/40 bg-[#0B0E17] p-4 text-[#F4F4F5] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#22D3EE]">
                {storeName}
              </span>
              <button
                type="button"
                onClick={() => setInquiryPreview(null)}
                className="min-h-[40px] px-2 text-xs font-bold text-white/75 hover:text-white"
              >
                {sharedCopy.closeBtn}
              </button>
            </div>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-[#F4F4F5]">
              {inquiryPreview}
            </pre>
            <button
              type="button"
              onClick={handleCopyInquiry}
              className="mt-3 min-h-[42px] w-full rounded-full bg-gradient-to-r from-[#818CF8] to-[#22D3EE] text-xs font-extrabold text-[#06070B]"
            >
              {sharedCopy.copyOrderBtn}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
