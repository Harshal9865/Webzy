'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PhoneFrame } from './PhoneFrame';

export interface AdaptivePreviewStageProps {
  children: React.ReactNode;
  fullscreenChildren?: React.ReactNode;
  title?: string;
  caption?: string;
  toolbar?: React.ReactNode;
  onReplay?: () => void;
  externalFullScreenHref?: string;
  accentColor?: string;
  /**
   * 'card' (default): renders a frameless, edge-to-edge interactive showcase card on < 1024px.
   * 'compact': renders an instant preview launcher bar on < 1024px (mounts full card on demand or in Full Screen).
   */
  mobileVariant?: 'card' | 'compact';
  /** Optional mobile inline card height classes (defaults to comfortable 500px/580px mobile viewport). */
  mobileHeightClassName?: string;
}

function ExpandIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </svg>
  );
}

function ReplayIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function ExternalLinkIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

function CloseIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function MobileWidthIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path strokeLinecap="round" d="M11 18.5h2" />
    </svg>
  );
}

function TabletWidthIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <rect x="4.5" y="2.5" width="15" height="19" rx="2" />
      <path strokeLinecap="round" d="M11 18.5h2" />
    </svg>
  );
}

function WideScreenIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <rect x="2.5" y="4" width="19" height="13" rx="2" />
      <path strokeLinecap="round" d="M8 20h8M12 17v3" />
    </svg>
  );
}

type DesktopViewportMode = 'mobile' | 'tablet' | 'desktop';

function PreviewSkeleton({
  accentColor,
  title,
  compact = false,
  heightClassName = 'h-[430px] sm:h-[510px]',
}: {
  accentColor: string;
  title?: string;
  compact?: boolean;
  heightClassName?: string;
}) {
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white/95 p-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="h-9 w-9 shrink-0 animate-pulse rounded-xl"
            style={{ backgroundColor: `${accentColor}1f` }}
            aria-hidden="true"
          />
          <div className="min-w-0 space-y-1.5">
            <div className="h-3.5 w-36 animate-pulse rounded-full bg-stone-200/80" />
            <div className="h-2.5 w-24 animate-pulse rounded-full bg-stone-100" />
          </div>
        </div>
        <div
          className="h-10 w-28 shrink-0 animate-pulse rounded-full"
          style={{ backgroundColor: `${accentColor}26` }}
        />
      </div>
    );
  }

  return (
    <>
      {/* Mobile / Tablet Skeleton (< 1024px) */}
      <div className="w-full md:mx-auto md:max-w-[500px] lg:hidden">
        <div className="w-full overflow-hidden rounded-[26px] border border-stone-200/80 bg-[#FAF8F5] shadow-md">
          <div className="flex items-center justify-between gap-2 border-b border-stone-200/70 bg-white/90 px-4 py-3">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 animate-pulse rounded-full"
                style={{ backgroundColor: accentColor }}
                aria-hidden="true"
              />
              <span className="text-xs font-bold text-stone-700">
                {title || 'Preparing preview...'}
              </span>
            </div>
            <div
              className="h-9 w-28 animate-pulse rounded-full"
              style={{ backgroundColor: `${accentColor}22` }}
            />
          </div>
          <div className={`relative flex w-full flex-col items-center justify-center p-6 ${heightClassName}`}>
            <div
              className="h-14 w-14 animate-pulse rounded-2xl border border-stone-200/70 bg-white shadow-sm"
              style={{ boxShadow: `0 12px 30px -12px ${accentColor}40` }}
            />
            <div className="mt-4 h-3.5 w-44 animate-pulse rounded-full bg-stone-200/80" />
            <div className="mt-2 h-2.5 w-32 animate-pulse rounded-full bg-stone-200/60" />
          </div>
        </div>
      </div>

      {/* Desktop Skeleton (>= 1024px) matching PhoneFrame height cleanly (zero CLS) */}
      <div className="hidden w-full flex-col items-center lg:flex">
        <div className="w-full max-w-[344px] xl:max-w-[366px] rounded-[46px] border-[10px] border-[#1C131E] bg-[#1C131E] p-1 shadow-[0_20px_50px_-12px_rgba(225,29,99,0.18),0_12px_28px_-6px_rgba(43,27,46,0.14)]">
          <div className="flex h-[min(580px,calc(100dvh-250px))] min-h-[470px] w-full flex-col items-center justify-center rounded-[35px] bg-gradient-to-b from-white to-[#FAF8F5] px-6 text-center xl:h-[min(620px,calc(100dvh-240px))]">
            <span
              className="h-12 w-12 animate-pulse rounded-2xl"
              style={{ backgroundColor: `${accentColor}24` }}
              aria-hidden="true"
            />
            <p className="mt-4 text-xs font-bold text-stone-600">
              {title || 'Loading live card...'}
            </p>
            <div className="mt-3 h-2.5 w-36 animate-pulse rounded-full bg-stone-200/80" />
            <div className="mt-2 h-2.5 w-24 animate-pulse rounded-full bg-stone-200/60" />
          </div>
        </div>
      </div>
    </>
  );
}

export function AdaptivePreviewStage({
  children,
  fullscreenChildren,
  title,
  caption,
  toolbar,
  onReplay,
  externalFullScreenHref,
  accentColor,
  mobileVariant = 'card',
  mobileHeightClassName = 'h-[430px] sm:h-[510px]',
}: AdaptivePreviewStageProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [mobileInlineExpanded, setMobileInlineExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [desktopViewport, setDesktopViewport] = useState<DesktopViewportMode>('desktop');

  const primaryAccent = accentColor || '#2B1B2E';

  useEffect(() => {
    setMounted(true);

    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const syncBreakpoint = () => setIsDesktop(mediaQuery.matches);
    syncBreakpoint();

    let rafId: number | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const revealAfterFirstPaint = () => {
      rafId = window.requestAnimationFrame(() => {
        setPreviewReady(true);
      });
    };

    // Defer heavy interactive preview mount until near viewport (when IntersectionObserver exists)
    // and after initial frame paint so above-the-fold page UI renders instantaneously.
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && stageRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            revealAfterFirstPaint();
            observer?.disconnect();
          }
        },
        { rootMargin: '240px 0px' },
      );
      observer.observe(stageRef.current);
      // Guarantee readiness even if an external tab/layout hides intersection briefly.
      fallbackTimer = setTimeout(revealAfterFirstPaint, 350);
    } else {
      revealAfterFirstPaint();
    }

    const cleanupListeners = () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (fallbackTimer !== null) clearTimeout(fallbackTimer);
      observer?.disconnect();
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncBreakpoint);
      return () => {
        mediaQuery.removeEventListener('change', syncBreakpoint);
        cleanupListeners();
      };
    }

    mediaQuery.addListener(syncBreakpoint);
    return () => {
      mediaQuery.removeListener(syncBreakpoint);
      cleanupListeners();
    };
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [isFullscreen]);

  // Strict single-tree mount: NEVER render children until client breakpoint + first paint complete.
  // Eliminates duplicate DOM trees, duplicate SVG paper filters, timers, and SSR hydration overhead.
  const canRenderStage = mounted && previewReady && isDesktop !== null && !isFullscreen;
  const renderMobileStage = canRenderStage && isDesktop === false;
  const renderDesktopPhone = canRenderStage && isDesktop === true;
  const effectiveViewport: DesktopViewportMode = isDesktop ? desktopViewport : 'desktop';
  const isFramedViewport = effectiveViewport === 'mobile' || effectiveViewport === 'tablet';
  const modalContent =
    effectiveViewport === 'mobile' ? children : (fullscreenChildren ?? children);

  const fullscreenOverlay =
    mounted && isFullscreen && typeof document !== 'undefined'
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title ? `${title} full-screen preview` : 'Full-screen live preview'}
            className={`fixed inset-0 z-[100] flex flex-col overflow-hidden ${
              isFramedViewport
                ? 'bg-[#FAF8F5] lg:bg-[#161118]/95 lg:backdrop-blur-md'
                : 'bg-[#FAF8F5]'
            }`}
          >
            {/* Floating Full-Screen Top Bar */}
            <header className="z-[110] flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#1C131E]/95 px-3 py-2.5 text-white shadow-md backdrop-blur-md sm:px-5">
              {/* Left: Title */}
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/25"
                  style={{ backgroundColor: primaryAccent }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold tracking-tight text-white sm:text-sm">
                    {title || 'Live Interactive Preview'}
                  </p>
                  <p className="hidden text-[10px] font-medium text-white/60 sm:block">
                    Full-Screen Guest Experience
                  </p>
                </div>
              </div>

              {/* Center (Laptop / Desktop only): 3-Mode Responsive Viewport Switcher */}
              <div
                role="group"
                aria-label="Preview viewport width"
                className="hidden items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 lg:inline-flex"
              >
                <button
                  type="button"
                  onClick={() => setDesktopViewport('mobile')}
                  aria-pressed={desktopViewport === 'mobile'}
                  className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-full px-3 text-xs font-bold transition ${
                    desktopViewport === 'mobile'
                      ? 'bg-white text-[#1C131E] shadow-sm'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  <MobileWidthIcon className="h-3.5 w-3.5" />
                  <span>Mobile (390px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDesktopViewport('tablet')}
                  aria-pressed={desktopViewport === 'tablet'}
                  className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-full px-3 text-xs font-bold transition ${
                    desktopViewport === 'tablet'
                      ? 'bg-white text-[#1C131E] shadow-sm'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  <TabletWidthIcon className="h-3.5 w-3.5" />
                  <span>Tablet (768px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDesktopViewport('desktop')}
                  aria-pressed={desktopViewport === 'desktop'}
                  className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-full px-3 text-xs font-bold transition ${
                    desktopViewport === 'desktop'
                      ? 'bg-white text-[#1C131E] shadow-sm'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  <WideScreenIcon className="h-3.5 w-3.5" />
                  <span>Desktop (Full)</span>
                </button>
              </div>

              {/* Right: Replay, Open in New Tab & Close */}
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                {onReplay ? (
                  <button
                    type="button"
                    onClick={onReplay}
                    className="inline-flex min-h-[44px] lg:min-h-[38px] items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/20"
                  >
                    <ReplayIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Replay</span>
                  </button>
                ) : null}

                {externalFullScreenHref ? (
                  <Link
                    href={externalFullScreenHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden min-h-[44px] lg:min-h-[38px] items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/20 sm:inline-flex"
                  >
                    <span>New Tab</span>
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  aria-label="Close full-screen preview"
                  className="inline-flex min-h-[44px] lg:min-h-[38px] items-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-bold text-[#1C131E] shadow-sm transition hover:bg-stone-100"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                  <span>Close</span>
                  <span className="hidden rounded border border-stone-300 bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600 lg:inline">
                    Esc
                  </span>
                </button>
              </div>
            </header>

            {/* Full-Screen Live Viewport */}
            <div
              className={`flex min-h-0 flex-1 items-stretch justify-center overflow-hidden ${
                isFramedViewport ? 'lg:items-center lg:p-5' : ''
              }`}
            >
              {/* transform-gpu establishes a containing block so fixed invitation bars pin cleanly inside the preview viewport */}
              <div
                className={`relative h-full w-full overflow-hidden bg-[#FAF8F5] transform-gpu transition-[max-width,border-radius] duration-300 ${
                  effectiveViewport === 'mobile'
                    ? 'lg:max-w-[390px] lg:rounded-[28px] lg:border lg:border-white/15 lg:shadow-2xl'
                    : effectiveViewport === 'tablet'
                      ? 'lg:max-w-[768px] lg:rounded-[28px] lg:border lg:border-white/15 lg:shadow-2xl'
                      : 'max-w-none'
                }`}
              >
                <div className="h-full w-full overflow-y-auto overflow-x-clip overscroll-contain scrollbar-none">
                  {modalContent}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={stageRef} className="flex w-full flex-col items-center">
      {/* Optional Toolbar Above Stage (Edition tabs, language pills, gate/inside toggles) */}
      {toolbar ? (
        <div className="mb-4 flex w-full flex-wrap items-center justify-center gap-2">
          {toolbar}
        </div>
      ) : null}

      {/* Initial Critical-Paint Skeleton (prevents SSR/hydration lag and avoids double-mounting children) */}
      {!canRenderStage && !isFullscreen ? (
        <PreviewSkeleton
          accentColor={primaryAccent}
          title={title}
          compact={mobileVariant === 'compact'}
          heightClassName={mobileHeightClassName}
        />
      ) : null}

      {/* Placeholder While Full-Screen Overlay Is Active */}
      {isFullscreen ? (
        <div className="flex min-h-[280px] w-full max-w-[360px] flex-col items-center justify-center rounded-2xl border border-stone-200/90 bg-white/90 p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-webzy-ink">
            {title || 'Live Preview'} is open in Full Screen
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Press Esc or close the overlay to return here.
          </p>
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="btn-spring mt-4 inline-flex min-h-[44px] items-center rounded-full px-5 text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: primaryAccent }}
          >
            Return to Preview
          </button>
        </div>
      ) : null}

      {/* MOBILE & TABLET (< 1024px): Native Zero-Bezel Experience */}
      {renderMobileStage && mobileVariant === 'compact' ? (
        <div className="w-full space-y-3 md:mx-auto md:max-w-[540px] lg:hidden animate-fade-in">
          {/* Lightweight Preview Launcher Bar (Zero heavy card DOM until user opens or expands) */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                  style={{ backgroundColor: primaryAccent }}
                  aria-hidden="true"
                >
                  <ExpandIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-webzy-ink sm:text-sm">
                    {title || 'Live Card Preview'}
                  </p>
                  <p className="truncate text-[11px] font-medium text-stone-500">
                    {caption || 'Opens edge-to-edge on your screen'}
                  </p>
                </div>
              </div>

              <div className="flex w-full items-center gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  className="btn-spring inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-bold text-white shadow-sm transition hover:opacity-95 sm:flex-initial"
                  style={{ backgroundColor: primaryAccent }}
                >
                  <ExpandIcon className="h-3.5 w-3.5" />
                  <span>Preview Live</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMobileInlineExpanded((prev) => !prev)}
                  aria-expanded={mobileInlineExpanded}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-stone-200 bg-stone-50 px-3.5 text-xs font-bold text-stone-700 transition hover:bg-stone-100"
                >
                  {mobileInlineExpanded ? 'Hide Inline' : 'Show Inline'}
                </button>
              </div>
            </div>
          </div>

          {/* Optional Lazy-Mounted Inline Borderless Card */}
          {mobileInlineExpanded ? (
            <div className="w-full overflow-hidden rounded-[26px] border border-stone-200/90 bg-[#FAF8F5] shadow-[0_18px_42px_-16px_rgba(28,19,30,0.16)] animate-fade-in">
              <div className="flex items-center justify-between gap-2 border-b border-stone-200/70 bg-white/95 px-4 py-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-stone-500">
                  Direct Interactive View
                </span>
                <div className="flex items-center gap-1.5">
                  {onReplay ? (
                    <button
                      type="button"
                      onClick={onReplay}
                      className="inline-flex min-h-[44px] items-center gap-1 rounded-full border border-stone-200 bg-white px-3 text-[11px] font-bold text-stone-700"
                    >
                      <ReplayIcon className="h-3 w-3" />
                      <span>Replay</span>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(true)}
                    className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-3.5 text-[11px] font-bold text-white"
                    style={{ backgroundColor: primaryAccent }}
                  >
                    <ExpandIcon className="h-3 w-3" />
                    <span>Full Screen</span>
                  </button>
                </div>
              </div>
              <div className={`relative w-full overflow-hidden bg-[#FAF8F5] transform-gpu ${mobileHeightClassName}`}>
                <div className="h-full w-full overflow-y-auto overflow-x-clip overscroll-contain scrollbar-none">
                  {children}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {renderMobileStage && mobileVariant === 'card' ? (
        <div className="w-full md:mx-auto md:max-w-[500px] lg:hidden animate-fade-in">
          <div className="w-full overflow-hidden rounded-[28px] border border-stone-200/85 bg-white shadow-[0_20px_50px_-18px_rgba(28,19,30,0.18)]">
            {/* Native Mobile Header Strip (Zero fake phone notch/bezel) */}
            <div className="flex items-center justify-between gap-2 border-b border-stone-200/75 bg-[#FAF8F5] px-4 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: primaryAccent }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <span className="block truncate text-xs font-bold tracking-tight text-webzy-ink">
                    {title || 'Live Interactive Preview'}
                  </span>
                  <span className="block truncate text-[10px] font-medium text-stone-500">
                    Tap directly on card to interact
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {onReplay ? (
                  <button
                    type="button"
                    onClick={onReplay}
                    aria-label="Replay preview animation"
                    className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-full border border-stone-200 bg-white px-3 text-[11px] font-bold text-stone-700 transition hover:border-stone-300"
                  >
                    <ReplayIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Replay</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  className="btn-spring inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 text-xs font-bold text-white shadow-sm transition hover:opacity-95"
                  style={{ backgroundColor: primaryAccent }}
                >
                  <ExpandIcon className="h-3.5 w-3.5" />
                  <span>Full Screen</span>
                </button>
              </div>
            </div>

            {/* Edge-to-Edge Frameless Mobile Interactive Canvas */}
            <div className={`relative w-full overflow-hidden bg-[#FAF8F5] transform-gpu ${mobileHeightClassName}`}>
              <div className="h-full w-full overflow-y-auto overflow-x-clip overscroll-contain scrollbar-none">
                {children}
              </div>
            </div>

            {/* Native Bottom Action Strip */}
            {caption || externalFullScreenHref ? (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/75 bg-white px-4 py-1.5">
                {caption ? (
                  <p className="text-[11px] font-semibold text-webzy-ink/70">{caption}</p>
                ) : (
                  <span />
                )}
                {externalFullScreenHref ? (
                  <Link
                    href={externalFullScreenHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[40px] items-center gap-1 px-1 text-[11px] font-bold text-[#8C6D23] hover:underline"
                  >
                    <span>Open in new tab</span>
                    <ExternalLinkIcon className="h-3 w-3" />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* LAPTOP & DESKTOP (>= 1024px): Sleek Scrollbar-Free PhoneFrame + 1-Click Full-Screen Bar */}
      {renderDesktopPhone ? (
        <div className="hidden w-full flex-col items-center lg:flex animate-fade-in">
          <PhoneFrame caption={caption}>{children}</PhoneFrame>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="btn-spring inline-flex min-h-[40px] items-center gap-2 rounded-full px-5 text-xs font-bold text-white shadow-sm transition hover:opacity-95"
              style={{ backgroundColor: primaryAccent }}
            >
              <ExpandIcon className="h-3.5 w-3.5" />
              <span>Full Screen Preview</span>
            </button>

            {onReplay ? (
              <button
                type="button"
                onClick={onReplay}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 text-xs font-bold text-stone-700 shadow-sm transition hover:border-[#C9A243] hover:text-stone-950"
              >
                <ReplayIcon className="h-3.5 w-3.5" />
                <span>Replay</span>
              </button>
            ) : null}

            {externalFullScreenHref ? (
              <Link
                href={externalFullScreenHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 text-xs font-bold text-[#8C6D23] shadow-sm transition hover:border-[#C9A243]"
              >
                <span>Open in New Tab</span>
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {fullscreenOverlay}
    </div>
  );
}
