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

/**
 * Tracks scroll progress (0 -> 1) inside either PhoneFrame's internal overflow-y-auto container
 * or full-screen window scroll, throttled via requestAnimationFrame.
 */
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
  detail: string;
  price: number;
  accent: string;
}

const DEFAULT_PRISM_ITEMS: readonly PrismCardItem[] = [
  {
    id: 'p3d-1',
    code: 'FACET 01',
    title: 'Prism Chrono Edition',
    detail: 'Anodized titanium chassis with sapphire dome',
    price: 4299,
    accent: '#818CF8',
  },
  {
    id: 'p3d-2',
    code: 'FACET 02',
    title: 'Kinetic Studio Lamp',
    detail: 'Orbital magnetic dimmer in brushed obsidian',
    price: 2899,
    accent: '#22D3EE',
  },
  {
    id: 'p3d-3',
    code: 'FACET 03',
    title: 'Monolith Desk Dock',
    detail: 'CNC billet aluminum dock with gold pins',
    price: 1999,
    accent: '#F59E0B',
  },
  {
    id: 'p3d-4',
    code: 'FACET 04',
    title: 'Aura Carbon Sleeve',
    detail: 'Ultra-slim woven aramid protective folio',
    price: 1499,
    accent: '#A78BFA',
  },
];

function FacetWireframeSvg({ idx, accent }: { idx: number; accent: string }) {
  const gradId = `facet-g-${useId().replace(/:/g, '')}-${idx}`;
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F4F4F5" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {idx === 0 ? (
        <g fill="none" stroke={`url(#${gradId})`} strokeWidth="1.6">
          <polygon points="60,12 96,34 96,68 60,82 24,68 24,34" />
          <line x1="60" y1="12" x2="60" y2="82" />
          <line x1="24" y1="34" x2="96" y2="68" />
          <circle cx="60" cy="48" r="10" stroke={accent} />
        </g>
      ) : idx === 1 ? (
        <g fill="none" stroke={`url(#${gradId})`} strokeWidth="1.6">
          <circle cx="60" cy="45" r="28" />
          <ellipse cx="60" cy="45" rx="28" ry="11" />
          <ellipse cx="60" cy="45" rx="11" ry="28" />
        </g>
      ) : idx === 2 ? (
        <g fill="none" stroke={`url(#${gradId})`} strokeWidth="1.6">
          <rect x="30" y="20" width="60" height="50" rx="6" />
          <rect x="42" y="30" width="36" height="30" rx="3" stroke={accent} />
          <line x1="30" y1="20" x2="42" y2="30" />
          <line x1="90" y1="20" x2="78" y2="30" />
        </g>
      ) : (
        <g fill="none" stroke={`url(#${gradId})`} strokeWidth="1.6">
          <polygon points="60,14 94,70 26,70" />
          <polygon points="60,28 80,62 40,62" stroke={accent} />
        </g>
      )}
    </svg>
  );
}

/**
 * Small Business Theme 4: "Prism 3D Scroll Universe" (Kinetic 3D Spatial Storefront).
 * Deep obsidian #06070B, scroll-progress + pointer-tilt driven 3D Monolith Hero,
 * pure-CSS 6-face 3D holographic product cube, layered perspective deck, velocity marquee & neon booking bar.
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
  const brandNote = pickLocalizedText(data.message, language).trim() || copy.heroSub;
  const offerTag = data.offerTag ? pickLocalizedText(data.offerTag, language).trim() : '';

  const photos = getValidPhotos(data.photos);
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
        detail: h.detail || item.detail,
      };
    });
  }, [customHighlights]);

  const activeItem = items[activeCardIdx] ?? items[0];
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

  // Computed 3D motion values (collapsed safely to 0 when prefers-reduced-motion is active)
  const heroRotateX = reducedMotion ? 0 : -tilt.y * 9 + scrollProgress * 12;
  const heroRotateY = reducedMotion ? 0 : tilt.x * 11 - scrollProgress * 10;
  const headlineScale = reducedMotion ? 1 : 1 + scrollProgress * 0.08;
  const splitDepthPx = reducedMotion ? 0 : scrollProgress * 22;
  const ringSpinDeg = reducedMotion ? 0 : scrollProgress * 260 + tilt.x * 24;

  const cubeYaw = reducedMotion
    ? -manualFace * 90
    : -manualFace * 90 + scrollProgress * 240 + spinDeg + tilt.x * 16;
  const cubePitch = reducedMotion ? 0 : -12 + Math.sin(scrollProgress * Math.PI) * 10 - tilt.y * 10;

  // Marquee translations
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#818CF8]/20 blur-3xl"
          style={
            reducedMotion
              ? undefined
              : { transform: `translate3d(0, ${scrollProgress * 60}px, 0)` }
          }
        />
        <div
          className="absolute -right-20 top-72 h-64 w-64 rounded-full bg-[#22D3EE]/15 blur-3xl"
          style={
            reducedMotion
              ? undefined
              : { transform: `translate3d(0, ${-scrollProgress * 50}px, 0)` }
          }
        />
      </div>

      {/* Top Depth HUD Telemetry Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-white/10 bg-[#06070B]/85 px-3.5 py-2.5 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#818CF8]/50 bg-[#818CF8]/20 font-mono text-[10px] font-bold text-[#22D3EE]">
            {monogram}
          </span>
          <span className="truncate font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#F4F4F5]">
            {storeName}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2 font-mono text-[9.5px] font-bold">
          <span className="hidden rounded-full border border-[#22D3EE]/30 bg-[#22D3EE]/10 px-2 py-0.5 text-[#22D3EE] sm:inline-block">
            FPS 60 · 3D SPACE
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[#F59E0B]">
            DEPTH {Math.round(scrollProgress * 100)}%
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-3.5 pb-8 pt-5 sm:px-6">
        {/* 1. Interactive 3D Monolith Hero */}
        <section
          aria-labelledby={`prism-hero-${uid}`}
          className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#0E111D] via-[#090B13] to-[#06070B] px-4 py-8 text-center shadow-[0_24px_60px_-20px_rgba(34,211,238,0.22)] sm:py-12"
          style={{ perspective: '1100px' }}
        >
          {/* Rotating 3D Wireframe Orbital Rings */}
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

          {/* 3D Parallax Spatial Monolith Card */}
          <div
            className="relative z-10 flex max-w-lg flex-col items-center transition-transform duration-150 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${heroRotateX}deg) rotateY(${heroRotateY}deg)`,
            }}
          >
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-[#22D3EE]/40 bg-[#22D3EE]/10 px-3 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#22D3EE]"
              style={{ transform: `translateZ(${18 + splitDepthPx * 0.4}px)` }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE]" aria-hidden="true" />
              {offerTag || copy.hudBadge}
            </span>

            <h1
              id={`prism-hero-${uid}`}
              className="mt-4 break-words bg-gradient-to-r from-[#F4F4F5] via-[#818CF8] to-[#22D3EE] bg-clip-text font-zine text-3xl font-black uppercase leading-none tracking-tight text-transparent sm:text-5xl"
              style={{
                ...hiSafeStyle(language),
                transform: `translateZ(${28 + splitDepthPx}px) scale(${headlineScale})`,
              }}
            >
              {headline}
            </h1>

            <p
              className="mt-3 max-w-md break-words text-xs leading-relaxed text-[#F4F4F5]/75 sm:text-sm"
              style={{ transform: `translateZ(${12}px)` }}
            >
              {brandNote}
            </p>
          </div>
        </section>

        {/* 2. Rotating 6-Face 3D Holographic Product Cube */}
        <section
          aria-labelledby={`cube-heading-${uid}`}
          className="rounded-3xl border border-white/10 bg-[#0B0D16]/90 p-4 sm:p-6"
        >
          <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <div>
              <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#818CF8]">
                {copy.cubeEyebrow}
              </p>
              <h2
                id={`cube-heading-${uid}`}
                className="mt-0.5 font-heading text-lg font-bold text-white sm:text-xl"
              >
                {copy.cubeTitle}
              </h2>
            </div>

            {/* Interactive Cube Rotation Controls */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => setManualFace((f) => (f - 1 + 4) % 4)}
                className="min-h-[38px] rounded-full border border-white/20 bg-white/5 px-3 font-mono text-[10.5px] font-bold text-white hover:bg-white/10"
              >
                {copy.prevFace}
              </button>
              <button
                type="button"
                onClick={() => setManualFace((f) => (f + 1) % 4)}
                className="min-h-[38px] rounded-full border border-white/20 bg-white/5 px-3 font-mono text-[10.5px] font-bold text-white hover:bg-white/10"
              >
                {copy.nextFace}
              </button>
              {!reducedMotion ? (
                <button
                  type="button"
                  onClick={() => setAutoSpin((s) => !s)}
                  aria-pressed={autoSpin}
                  className={`min-h-[38px] rounded-full px-3 font-mono text-[10.5px] font-bold transition ${
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

          {/* True Pure-CSS 6-Face 3D Cube Viewport */}
          <div
            className="my-7 flex items-center justify-center py-3"
            style={{ perspective: '900px', perspectiveOrigin: '50% 50%' }}
          >
            <div
              className="relative h-[144px] w-[144px] transition-transform duration-500 ease-out sm:h-[180px] sm:w-[180px]"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${cubePitch}deg) rotateY(${cubeYaw}deg)`,
              }}
            >
              {items.slice(0, 4).map((item, faceIdx) => {
                const faceDeg = faceIdx * 90;
                const photoUrl = photos[faceIdx];
                const showPhoto = Boolean(photoUrl && !failedUrls[photoUrl]);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveCardIdx(faceIdx);
                      if (showPhoto) onOpenPhoto?.(faceIdx);
                    }}
                    aria-label={`Cube face ${faceIdx + 1}: ${item.title}`}
                    className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-xl border border-[#818CF8]/45 bg-[#111526]/95 p-2.5 text-left shadow-[0_0_24px_rgba(129,140,248,0.2)] [--cube-z:72px] sm:[--cube-z:90px]"
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

                    <div className="my-1 flex-1 overflow-hidden rounded-lg bg-black/35">
                      {showPhoto ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={photoUrl}
                          alt={item.title}
                          onError={() =>
                            setFailedUrls((prev) => ({ ...prev, [photoUrl]: true }))
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FacetWireframeSvg idx={faceIdx} accent={item.accent} />
                      )}
                    </div>

                    <p className="truncate text-[10.5px] font-bold text-white">
                      {item.title}
                    </p>
                  </button>
                );
              })}

              {/* Top & Bottom Translucent Cube Caps (completing all 6 faces) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-xl border border-[#22D3EE]/35 bg-[#818CF8]/15 [--cube-z:72px] sm:[--cube-z:90px]"
                style={{
                  transform: 'rotateX(90deg) translateZ(var(--cube-z))',
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-xl border border-[#818CF8]/35 bg-[#22D3EE]/10 [--cube-z:72px] sm:[--cube-z:90px]"
                style={{
                  transform: 'rotateX(-90deg) translateZ(var(--cube-z))',
                }}
              />
            </div>
          </div>

          {/* Cube Face Indicator Pills */}
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
                  className={`min-h-[34px] rounded-full px-3 font-mono text-[10px] font-bold transition ${
                    isFocused
                      ? 'bg-[#818CF8] text-[#06070B]'
                      : 'border border-white/15 bg-white/5 text-white/75 hover:text-white'
                  }`}
                >
                  0{idx + 1} · {item.title}
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Dual Counter-Scrolling Velocity Marquee */}
        <section
          aria-hidden="true"
          className="space-y-1.5 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D16] py-2.5"
        >
          <div
            className="flex whitespace-nowrap font-mono text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#22D3EE]/85 transition-transform duration-100 ease-linear"
            style={{ transform: `translate3d(${marqueeOffsetA}px, 0, 0)` }}
          >
            <span className="pr-6">{copy.marqueeTop}</span>
            <span className="pr-6">{copy.marqueeTop}</span>
            <span className="pr-6">{copy.marqueeTop}</span>
          </div>
          <div
            className="flex whitespace-nowrap font-mono text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#F59E0B]/85 transition-transform duration-100 ease-linear"
            style={{ transform: `translate3d(${marqueeOffsetB}px, 0, 0)` }}
          >
            <span className="pr-6">{copy.marqueeBottom}</span>
            <span className="pr-6">{copy.marqueeBottom}</span>
            <span className="pr-6">{copy.marqueeBottom}</span>
          </div>
        </section>

        {/* 4. 3D Perspective Layered Showcase Deck */}
        <section aria-labelledby={`deck-heading-${uid}`}>
          <div className="mb-3 flex items-end justify-between gap-2">
            <div>
              <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#22D3EE]">
                {copy.deckEyebrow}
              </p>
              <h2
                id={`deck-heading-${uid}`}
                className="mt-0.5 font-heading text-lg font-bold text-white sm:text-xl"
              >
                {copy.deckTitle}
              </h2>
            </div>
            <span className="font-mono text-[9.5px] text-white/60">
              {copy.tapSpotlight}
            </span>
          </div>

          <div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            style={{ perspective: '1000px' }}
          >
            {items.map((item, idx) => {
              const isSelected = activeCardIdx === idx;
              const fanShift = reducedMotion
                ? 0
                : (idx % 2 === 0 ? -1 : 1) * (1 - scrollProgress) * 6;
              const cardTiltX = reducedMotion
                ? 0
                : isSelected
                  ? 0
                  : (scrollProgress - 0.5) * 10 - tilt.y * 5;
              const cardTiltY = reducedMotion
                ? 0
                : isSelected
                  ? 0
                  : (idx % 2 === 0 ? 5 : -5) + tilt.x * 6;
              const photoSrc = photos[idx];
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
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-300 ${
                    isSelected
                      ? 'border-[#22D3EE] bg-[#12172B] shadow-[0_0_28px_-6px_rgba(34,211,238,0.45)]'
                      : 'border-white/15 bg-[#0C0F1C]/90 hover:border-[#818CF8]/60'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `translate3d(${fanShift}px, 0, ${isSelected && !reducedMotion ? 16 : 0}px) rotateX(${cardTiltX}deg) rotateY(${cardTiltY}deg)`,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest"
                      style={{ color: item.accent }}
                    >
                      {item.code}
                    </span>
                    <span className="font-tabular font-mono text-xs font-extrabold text-[#F59E0B]">
                      ₹{item.price}
                    </span>
                  </div>

                  <div className="my-2.5 h-24 w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
                    {showPhoto ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={photoSrc}
                        alt={item.title}
                        onError={() =>
                          setFailedUrls((prev) => ({ ...prev, [photoSrc]: true }))
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FacetWireframeSvg idx={idx} accent={item.accent} />
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="mt-0.5 text-[11px] leading-snug text-white/70">
                      {item.detail}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. Glassmorphic Neon Order Capsule */}
        <div className="sticky bottom-14 z-20 flex items-center justify-between gap-2 rounded-2xl border border-[#818CF8]/40 bg-[#0B0E17]/85 p-3 shadow-[0_14px_34px_-10px_rgba(129,140,248,0.45)] backdrop-blur-xl">
          <div className="min-w-0">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#22D3EE]">
              {copy.selectedFocus}
            </p>
            <p className="truncate text-xs font-bold text-white">
              {activeItem.title} · ₹{activeItem.price}
            </p>
          </div>
          <button
            type="button"
            onClick={handleWhatsAppBooking}
            className="min-h-[42px] shrink-0 rounded-full bg-gradient-to-r from-[#818CF8] to-[#22D3EE] px-4 py-2 text-xs font-extrabold text-[#06070B] shadow-md transition hover:brightness-110 active:scale-95"
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
                className="min-h-[44px] px-2 text-xs font-bold text-white/75 hover:text-white"
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
              className="mt-3 min-h-[44px] w-full rounded-full bg-gradient-to-r from-[#818CF8] to-[#22D3EE] text-xs font-extrabold text-[#06070B]"
            >
              {sharedCopy.copyOrderBtn}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
