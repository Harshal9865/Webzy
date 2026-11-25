'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { getWeddingUiCopy } from '../i18n';
import {
  resolveWeddingThemeKey,
  WEDDING_LANGUAGE_OPTIONS,
  type WeddingInvitation,
  type WeddingLanguage,
} from '../schema';
import { getWeddingThemePalette } from '../themePalettes';
import { GateCouture, HeroCouture, isCoutureThemeKey } from '../templates/couture';
import { GateEmerald, HeroEmerald } from '../templates/emerald';
import { GateRoyalRed, HeroRoyalRed } from '../templates/royalRed';
import { CountdownTimer } from './CountdownTimer';
import { CoupleStory } from './CoupleStory';
import { DigitalShagun } from './DigitalShagun';
import { EventTimeline } from './EventTimeline';
import { HospitalityGuide } from './HospitalityGuide';
import { PersonalMessage } from './PersonalMessage';
import { PhotoGallery } from './PhotoGallery';
import { RevealSection } from './RevealSection';
import { RsvpSection } from './RsvpSection';
import { VenueCard } from './VenueCard';
import { VarmalaDiyaDivider } from './WeddingArt';
import { WeddingFooter } from './WeddingFooter';

export interface WeddingScrollProps {
  data: WeddingInvitation;
  guestName?: string | null;
  embedded?: boolean;
  initialOpen?: boolean;
  onOpen?: () => void;
}

type ChapterId = 'cover' | 'blessings' | 'events' | 'venue' | 'story' | 'rsvp';

const DESKTOP_NAV_EXTRA_COPY: Partial<
  Record<
    WeddingLanguage,
    {
      cover: string;
      blessings: string;
      gallery: string;
      replay: string;
      prev: string;
      next: string;
      fullFolio: string;
      deckView: string;
    }
  >
> = {
  en: {
    cover: 'Cover',
    blessings: 'Blessings',
    gallery: 'Memories',
    replay: 'Replay',
    prev: 'Prev',
    next: 'Next',
    fullFolio: 'Full View',
    deckView: 'Click Cards',
  },
  hi: {
    cover: 'मुख्य पृष्ठ',
    blessings: 'आमंत्रण',
    gallery: 'स्मृतियाँ',
    replay: 'पुनः',
    prev: 'पीछे',
    next: 'आगे',
    fullFolio: 'संपूर्ण कार्ड',
    deckView: 'कार्ड मोड',
  },
  gu: {
    cover: 'મુખપૃષ્ઠ',
    blessings: 'આમંત્રણ',
    gallery: 'સ્મૃતિઓ',
    replay: 'ફરી',
    prev: 'પાછળ',
    next: 'આગળ',
    fullFolio: 'સંપૂર્ણ કાર્ડ',
    deckView: 'કાર્ડ મોડ',
  },
  mr: {
    cover: 'मुखपृष्ठ',
    blessings: 'निमंत्रण',
    gallery: 'आठवणी',
    replay: 'पुन्हा',
    prev: 'मागे',
    next: 'पुढे',
    fullFolio: 'संपूर्ण पत्रिका',
    deckView: 'कार्ड मोड',
  },
  pa: {
    cover: 'ਮੁੱਖ ਪੰਨਾ',
    blessings: 'ਸੱਦਾ',
    gallery: 'ਯਾਦਾਂ',
    replay: 'ਮੁੜ',
    prev: 'ਪਿੱਛੇ',
    next: 'ਅੱਗੇ',
    fullFolio: 'ਪੂਰਾ ਕਾਰਡ',
    deckView: 'ਕਾਰਡ ਮੋਡ',
  },
  bn: {
    cover: 'প্রচ্ছদ',
    blessings: 'নিমন্ত্রণ',
    gallery: 'স্মৃতি',
    replay: 'পুনরায়',
    prev: 'পূর্ববর্তী',
    next: 'পরবর্তী',
    fullFolio: 'সম্পূর্ণ কার্ড',
    deckView: 'কার্ড মোড',
  },
  ta: {
    cover: 'முகப்பு',
    blessings: 'அழைப்பு',
    gallery: 'நினைவுகள்',
    replay: 'மீண்டும்',
    prev: 'முன்',
    next: 'அடுத்து',
    fullFolio: 'முழு அட்டை',
    deckView: 'கார்டு முறை',
  },
  te: {
    cover: 'ముఖచిత్రం',
    blessings: 'ఆహ్వానం',
    gallery: 'జ్ఞాపకాలు',
    replay: 'మళ్ళీ',
    prev: 'వెనుక',
    next: 'తదుపరి',
    fullFolio: 'పూర్తి కార్డ్',
    deckView: 'కార్డ్ మోడ్',
  },
  kn: {
    cover: 'ಮುಖಪುಟ',
    blessings: 'ಆಮಂತ್ರಣ',
    gallery: 'ನೆನಪುಗಳು',
    replay: 'ಮತ್ತೆ',
    prev: 'ಹಿಂದೆ',
    next: 'ಮುಂದೆ',
    fullFolio: 'ಪೂರ್ಣ ಪತ್ರಿಕೆ',
    deckView: 'ಕಾರ್ಡ್ ಮೋಡ್',
  },
};

const WEDDING_KEYFRAMES_CSS = `
@keyframes weddingPetalDrift {
  0% {
    transform: translate3d(0, -10px, 0) rotate(0deg);
    opacity: 0;
  }
  12% {
    opacity: 0.78;
  }
  85% {
    opacity: 0.65;
  }
  100% {
    transform: translate3d(28px, 680px, 0) rotate(240deg);
    opacity: 0;
  }
}

@keyframes weddingGoldFloat {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.28;
  }
  50% {
    transform: translate3d(4px, -14px, 0) scale(1.25);
    opacity: 0.9;
  }
}

@keyframes weddingSlowSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes weddingGoldSheen {
  0%, 62% {
    transform: translateX(-160%) rotate(25deg);
    opacity: 0;
  }
  78% {
    opacity: 0.95;
  }
  100% {
    transform: translateX(340%) rotate(25deg);
    opacity: 0;
  }
}

@keyframes weddingSparkleOut {
  0% {
    transform: translate3d(0, 0, 0) scale(0.4);
    opacity: 1;
  }
  65% {
    opacity: 0.92;
  }
  100% {
    transform: translate3d(var(--tx, 0px), var(--ty, 0px), 0) scale(0.1);
    opacity: 0;
  }
}

@keyframes weddingDiyaFlicker {
  0%, 100% {
    transform: scale(1) translateY(0);
    opacity: 0.92;
  }
  35% {
    transform: scale(1.06, 1.09) translateY(-0.5px);
    opacity: 1;
  }
  68% {
    transform: scale(0.96, 1.03) translateY(0.3px);
    opacity: 0.88;
  }
}

@keyframes weddingCardEnter {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.985);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.wedding-card-enter {
  animation: weddingCardEnter 0.36s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.wedding-scroll-root {
  overflow-x: clip;
}

.wedding-scroll-root,
.wedding-scroll-root * {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.wedding-scroll-root::-webkit-scrollbar,
.wedding-scroll-root *::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

@media (prefers-reduced-motion: reduce) {
  .wedding-scroll-root *,
  .wedding-scroll-root *::before,
  .wedding-scroll-root *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
`;

export function WeddingScroll({
  data,
  guestName,
  embedded = false,
  initialOpen = false,
  onOpen,
}: WeddingScrollProps) {
  const rawUid = useId();
  const paperFilterId = `wedding-cotton-grain-${rawUid.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const paperWeaveId = `wedding-cotton-weave-${rawUid.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);
  const [gateMounted, setGateMounted] = useState<boolean>(!initialOpen);
  const [language, setLanguage] = useState<WeddingLanguage>(data.language ?? 'en');
  const [activeChapter, setActiveChapter] = useState<ChapterId>('cover');
  const [viewMode, setViewMode] = useState<'deck' | 'folio'>('deck');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const unmountTimerRef = useRef<number | null>(null);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  const handleRootNode = useCallback((node: HTMLDivElement | null) => {
    if (!node || typeof window === 'undefined') {
      scrollContainerRef.current = null;
      return;
    }
    let parent = node.parentElement;
    while (parent && parent !== document.body && parent !== document.documentElement) {
      const overflowY = window.getComputedStyle(parent).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        scrollContainerRef.current = parent;
        return;
      }
      parent = parent.parentElement;
    }
    scrollContainerRef.current = null;
  }, []);

  useEffect(() => {
    setLanguage(data.language ?? 'en');
  }, [data.language]);

  useEffect(() => {
    if (unmountTimerRef.current !== null) {
      window.clearTimeout(unmountTimerRef.current);
      unmountTimerRef.current = null;
    }
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setIsOpen(initialOpen);
    setGateMounted(!initialOpen);
    setActiveChapter(initialOpen ? 'blessings' : 'cover');
  }, [initialOpen]);

  useEffect(() => {
    return () => {
      if (unmountTimerRef.current !== null) {
        window.clearTimeout(unmountTimerRef.current);
      }
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  const theme = resolveWeddingThemeKey(data.templateId);
  const pal = getWeddingThemePalette(theme);
  const copy = getWeddingUiCopy(language);
  const extraNavCopy = DESKTOP_NAV_EXTRA_COPY[language] ?? DESKTOP_NAV_EXTRA_COPY.en!;

  const hasEvents = Boolean(data.events && data.events.length > 0);
  const hasVenue = Boolean(data.venueHighlight);
  const hasStory = Boolean(data.storyText || (data.storyMilestones && data.storyMilestones.length > 0));
  const hasGallery = Boolean(data.gallery && data.gallery.length > 0);
  const hasHospitality = Boolean(data.hospitalityNotes && data.hospitalityNotes.length > 0);
  const hasRsvp = Boolean(data.rsvp?.enabled);
  const hasShagun = Boolean(data.shagun?.enabled && data.shagun.upiId);

  const chapters = useMemo(
    () =>
      [
        { id: 'cover' as ChapterId, label: extraNavCopy.cover, show: true },
        { id: 'blessings' as ChapterId, label: extraNavCopy.blessings, show: true },
        { id: 'events' as ChapterId, label: copy.nav.events, show: hasEvents },
        { id: 'venue' as ChapterId, label: copy.nav.venue, show: hasVenue || hasHospitality },
        { id: 'story' as ChapterId, label: extraNavCopy.gallery, show: hasStory || hasGallery },
        { id: 'rsvp' as ChapterId, label: copy.nav.rsvp, show: hasRsvp || hasShagun || true },
      ].filter((c) => c.show),
    [
      extraNavCopy.cover,
      extraNavCopy.blessings,
      extraNavCopy.gallery,
      copy.nav.events,
      copy.nav.venue,
      copy.nav.rsvp,
      hasEvents,
      hasVenue,
      hasHospitality,
      hasStory,
      hasGallery,
      hasRsvp,
      hasShagun,
    ],
  );

  const activeChapterIdx = Math.max(
    0,
    chapters.findIndex((c) => c.id === activeChapter),
  );
  const prevChapter = activeChapterIdx > 0 ? chapters[activeChapterIdx - 1] : null;
  const nextChapter = activeChapterIdx < chapters.length - 1 ? chapters[activeChapterIdx + 1] : null;

  const scrollToTop = useCallback(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    }
  }, []);

  const goToChapter = useCallback(
    (id: ChapterId) => {
      setViewMode('deck');
      setActiveChapter(id);
      scrollToTop();
    },
    [scrollToTop],
  );

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      setScrollProgress(0);
      return;
    }

    if (viewMode === 'deck') {
      const ratio = chapters.length > 1 ? (activeChapterIdx + 1) / chapters.length : 1;
      setScrollProgress(ratio);
      return;
    }

    const scrollEl = scrollContainerRef.current;
    let frameId: number | null = null;

    const computeProgress = () => {
      frameId = null;
      if (scrollEl) {
        const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
        const next = maxScroll > 0 ? Math.min(1, Math.max(0, scrollEl.scrollTop / maxScroll)) : 0;
        setScrollProgress(next);
        return;
      }
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      const next = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      setScrollProgress(next);
    };

    const scheduleUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(computeProgress);
    };

    computeProgress();
    const target: EventTarget = scrollEl ?? window;
    target.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      target.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [isOpen, viewMode, activeChapterIdx, chapters.length]);

  // Left / Right keyboard navigation inside Interactive Click-Card Deck
  useEffect(() => {
    if (!isOpen || viewMode !== 'deck' || embedded || typeof window === 'undefined') return;
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight' && nextChapter) {
        e.preventDefault();
        goToChapter(nextChapter.id);
      } else if (e.key === 'ArrowLeft' && prevChapter) {
        e.preventDefault();
        goToChapter(prevChapter.id);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, viewMode, embedded, nextChapter, prevChapter, goToChapter]);

  function handleOpenGate() {
    setIsOpen(true);
    setActiveChapter('cover');
    onOpen?.();
    if (unmountTimerRef.current !== null) {
      window.clearTimeout(unmountTimerRef.current);
    }
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    unmountTimerRef.current = window.setTimeout(
      () => {
        setGateMounted(false);
        unmountTimerRef.current = null;
      },
      reduced ? 420 : 2400,
    );
  }

  function handleReplayGate() {
    if (unmountTimerRef.current !== null) {
      window.clearTimeout(unmountTimerRef.current);
      unmountTimerRef.current = null;
    }
    setGateMounted(true);
    setIsOpen(false);
    setActiveChapter('cover');
    scrollToTop();
  }

  function handleSectionJump(event: React.MouseEvent<HTMLAnchorElement>, chapterId: ChapterId, sectionId: string) {
    event.preventDefault();
    if (viewMode === 'deck') {
      goToChapter(chapterId);
      return;
    }
    if (typeof window === 'undefined') return;
    const target = document.getElementById(sectionId);
    if (!target) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  const coupleMonogram = `${
    data.brideName ? data.brideName.trim().charAt(0).toUpperCase() : pal.defaultInitials[0]
  } & ${data.groomName ? data.groomName.trim().charAt(0).toUpperCase() : pal.defaultInitials[1]}`;

  const pageBg = pal.pageBg;
  const galleryBandStyle = pal.galleryBandStyle;
  const closingColophonBandStyle = pal.closingColophonBandStyle;
  const pillAccent = pal.pillAccent;
  const topBarStyle = pal.topBarStyle;
  const topBarMonogramStyle = pal.topBarMonogramStyle;
  const topBarActionBtn = pal.topBarActionBtn;
  const embeddedToolbarStyle = pal.embeddedToolbarStyle;
  const progressBarGradient = pal.progressBarGradient;
  const revealRootRef = embedded ? scrollContainerRef : undefined;
  const showDesktopRsvpShagunSpread = !embedded && hasRsvp && hasShagun;

  const navSectionMap: Record<ChapterId, string> = {
    cover: 'wedding-hero',
    blessings: 'wedding-blessings',
    events: 'wedding-events',
    venue: 'wedding-venue',
    story: 'wedding-story',
    rsvp: 'wedding-rsvp',
  };

  return (
    <div
      ref={handleRootNode}
      className={`wedding-scroll-root relative w-full overflow-x-clip selection:bg-[#D4AF37]/30 ${pageBg} ${
        embedded ? 'min-h-full' : 'min-h-screen'
      }`}
    >
      <style dangerouslySetInnerHTML={{ __html: WEDDING_KEYFRAMES_CSS }} />

      {/* 2px Antique Gold Chapter / Progress Hairline */}
      {!embedded && isOpen && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 inset-x-0 z-50 h-[2px] bg-[#C5A059]/15"
        >
          <div
            className="h-full w-full origin-left transition-transform duration-300 ease-out"
            style={{
              transform: `scaleX(${scrollProgress})`,
              background: progressBarGradient,
              boxShadow: '0 0 8px rgba(212, 175, 55, 0.55)',
            }}
          />
        </div>
      )}

      {/* Cotton-Rag Parchment Backdrop */}
      <div
        aria-hidden="true"
        className={`${embedded ? 'absolute' : 'fixed'} inset-0 pointer-events-none`}
        style={{ background: pal.parchmentGradient }}
      />

      {/* Woven Cotton-Rag Grain Overlay */}
      <svg
        aria-hidden="true"
        className={`${embedded ? 'absolute' : 'fixed'} inset-0 h-full w-full pointer-events-none z-[1] opacity-[0.045] mix-blend-multiply`}
      >
        <defs>
          <filter id={paperFilterId} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.82"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <pattern id={paperWeaveId} width="12" height="12" patternUnits="userSpaceOnUse">
            <path
              d="M 12 0 L 0 0 0 12"
              fill="none"
              stroke={pal.weaveStroke}
              strokeWidth="0.45"
              strokeOpacity="0.28"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" filter={`url(#${paperFilterId})`} />
        <rect width="100%" height="100%" fill={`url(#${paperWeaveId})`} />
      </svg>

      {/* Main Responsive Container */}
      <div className={`relative z-10 w-full ${embedded ? 'max-w-full' : 'min-h-screen'}`}>
        {/* Sticky Top Interactive Chapter Bar (Shown once gate is opened) */}
        {isOpen && (
          <header
            className={`sticky top-0 z-40 w-full border-b backdrop-blur-md shadow-[0_6px_24px_-16px_rgba(24,20,14,0.28)] ${
              embedded ? embeddedToolbarStyle : topBarStyle
            }`}
          >
            <div
              className={`mx-auto flex items-center justify-between gap-2 ${
                embedded ? 'px-2.5 py-2' : 'h-[62px] max-w-6xl px-4 sm:px-6 lg:px-8'
              }`}
            >
              {/* Couple Monogram Seal */}
              <button
                type="button"
                onClick={() => goToChapter('cover')}
                className="flex items-center gap-2 text-left shrink-0 group focus:outline-none rounded-full"
              >
                <span
                  className={`flex items-center justify-center rounded-full border font-royal-script font-bold tracking-tight transition group-hover:scale-105 ${
                    embedded ? 'h-7 w-7 text-[11px]' : 'h-8 w-8 sm:h-9 sm:w-9 text-[12px]'
                  } ${topBarMonogramStyle}`}
                >
                  {coupleMonogram}
                </span>
                {!embedded && (
                  <span className="hidden xl:inline font-royal-serif text-sm font-semibold tracking-[0.04em] whitespace-nowrap">
                    {data.brideName} &amp; {data.groomName}
                  </span>
                )}
              </button>

              {/* Click-Card Chapter Stepper Pills */}
              <nav
                aria-label="Invitation cards"
                className="flex items-center gap-1 overflow-x-auto scrollbar-none px-1"
              >
                {chapters.map((ch, idx) => {
                  const isActive = viewMode === 'deck' && activeChapter === ch.id;
                  return (
                    <a
                      key={ch.id}
                      href={`#${navSectionMap[ch.id]}`}
                      onClick={(e) => handleSectionJump(e, ch.id, navSectionMap[ch.id])}
                      className={`shrink-0 rounded-full border transition whitespace-nowrap font-royal-serif font-bold uppercase tracking-[0.12em] ${
                        embedded ? 'px-2 py-1 text-[9px]' : 'px-3 py-1.5 text-[10px]'
                      } ${
                        isActive
                          ? 'border-[#C5A059] bg-[#C5A059] text-[#18120B] shadow-xs'
                          : 'border-transparent opacity-75 hover:opacity-100 hover:border-[#C5A059]/35'
                      }`}
                    >
                      {embedded ? `${idx + 1}. ${ch.label}` : `${idx + 1} · ${ch.label}`}
                    </a>
                  );
                })}
              </nav>

              {/* Language, Layout Toggle & Replay */}
              <div className="flex items-center gap-1.5 shrink-0">
                {!embedded && (
                  <div className="relative hidden sm:inline-flex items-center">
                    <select
                      aria-label={copy.footer.languageLabel}
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as WeddingLanguage)}
                      className={`min-h-[32px] appearance-none rounded-full border pl-3 pr-7 text-[10.5px] font-bold outline-none transition ${topBarActionBtn}`}
                    >
                      {WEDDING_LANGUAGE_OPTIONS.map((opt) => (
                        <option
                          key={opt.code}
                          value={opt.code}
                          className="bg-[#FAF7F0] text-[#1C2F21]"
                        >
                          {opt.nativeLabel}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-2 h-3 w-3 opacity-75"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setViewMode((m) => (m === 'deck' ? 'folio' : 'deck'))}
                  title={viewMode === 'deck' ? extraNavCopy.fullFolio : extraNavCopy.deckView}
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 font-royal-serif text-[9.5px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.12em] transition active:scale-95 ${topBarActionBtn}`}
                >
                  {viewMode === 'deck' ? extraNavCopy.fullFolio : extraNavCopy.deckView}
                </button>

                <button
                  type="button"
                  onClick={handleReplayGate}
                  aria-label={copy.nav.replayGate}
                  title={copy.nav.replayGate}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-royal-serif text-[10px] font-bold uppercase tracking-[0.12em] transition ${topBarActionBtn}`}
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {!embedded && <span className="hidden lg:inline">{extraNavCopy.replay}</span>}
                </button>
              </div>
            </div>
          </header>
        )}

        {/* HERO COVER + INTERACTIVE GATE (Rendered when not yet opened, OR when on 'cover' card, OR in 'folio' mode) */}
        {(!isOpen || viewMode === 'folio' || activeChapter === 'cover') && (
          <div
            id="wedding-hero"
            className={`relative w-full overflow-hidden ${
              embedded
                ? 'min-h-[540px] sm:min-h-[580px]'
                : isOpen
                  ? 'min-h-[calc(100dvh-64px)]'
                  : 'min-h-[640px] md:min-h-[88dvh] lg:min-h-[100dvh]'
            }`}
          >
            <div
              className="relative z-10 h-full w-full transition-all duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: isOpen ? 'scale(1)' : 'scale(1.07)',
                filter: isOpen ? 'brightness(1) blur(0px)' : 'brightness(0.86) blur(1.5px)',
                willChange: 'transform, filter',
              }}
            >
              {theme === 'emerald' ? (
                <HeroEmerald
                  data={data}
                  guestName={guestName}
                  language={language}
                  compact={embedded}
                  onNextCard={() => goToChapter('blessings')}
                  nextCardLabel={`${extraNavCopy.blessings} & ${copy.countdown.saveTheDate}`}
                />
              ) : theme === 'royal-red' ? (
                <HeroRoyalRed
                  data={data}
                  guestName={guestName}
                  language={language}
                  compact={embedded}
                  onNextCard={() => goToChapter('blessings')}
                  nextCardLabel={`${extraNavCopy.blessings} & ${copy.countdown.saveTheDate}`}
                />
              ) : isCoutureThemeKey(theme) ? (
                <HeroCouture
                  theme={theme}
                  data={data}
                  guestName={guestName}
                  language={language}
                  compact={embedded}
                  onNextCard={() => goToChapter('blessings')}
                  nextCardLabel={`${extraNavCopy.blessings} & ${copy.countdown.saveTheDate}`}
                />
              ) : null}
            </div>

            {gateMounted && (
              <div
                className={`absolute inset-0 z-30 ${
                  isOpen ? 'pointer-events-none' : 'pointer-events-auto'
                }`}
              >
                {theme === 'emerald' ? (
                  <GateEmerald
                    isOpen={isOpen}
                    onOpen={handleOpenGate}
                    brideName={data.brideName}
                    groomName={data.groomName}
                    guestName={guestName}
                    familyBlessingLine={data.familyBlessingLine}
                    language={language}
                    compact={embedded}
                  />
                ) : theme === 'royal-red' ? (
                  <GateRoyalRed
                    isOpen={isOpen}
                    onOpen={handleOpenGate}
                    brideName={data.brideName}
                    groomName={data.groomName}
                    guestName={guestName}
                    familyBlessingLine={data.familyBlessingLine}
                    language={language}
                    compact={embedded}
                  />
                ) : isCoutureThemeKey(theme) ? (
                  <GateCouture
                    theme={theme}
                    isOpen={isOpen}
                    onOpen={handleOpenGate}
                    brideName={data.brideName}
                    groomName={data.groomName}
                    guestName={guestName}
                    familyBlessingLine={data.familyBlessingLine}
                    language={language}
                    compact={embedded}
                  />
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* CLICK-THROUGH CHAPTER DECK OR FULL FOLIO (After Gate Is Opened) */}
        {isOpen && (
          <div className={`w-full ${embedded ? 'pb-16' : 'pb-24'}`}>
            {/* CHAPTER 2: Aamantran + Muhurat Countdown */}
            {(viewMode === 'folio' || activeChapter === 'blessings') && (
              <div key="chapter-blessings" className="wedding-card-enter w-full">
                <div id="wedding-blessings" className="w-full scroll-mt-20">
                  <RevealSection rootRef={revealRootRef}>
                    <PersonalMessage
                      message={data.personalMessage}
                      brideName={data.brideName}
                      groomName={data.groomName}
                      brideParents={data.brideParents}
                      groomParents={data.groomParents}
                      hashtag={data.hashtag}
                      guestName={guestName}
                      language={language}
                      theme={theme}
                      compact={embedded}
                    />
                  </RevealSection>
                </div>

                <div className="w-full">
                  <RevealSection rootRef={revealRootRef}>
                    <CountdownTimer
                      targetDate={data.weddingDate}
                      language={language}
                      theme={theme}
                      compact={embedded}
                    />
                  </RevealSection>
                </div>
              </div>
            )}

            {/* CHAPTER 3: Ceremonies & Dress Swatches */}
            {(viewMode === 'folio' || activeChapter === 'events') && hasEvents && (
              <div key="chapter-events" className="wedding-card-enter w-full">
                <RevealSection rootRef={revealRootRef}>
                  <EventTimeline
                    events={data.events}
                    language={language}
                    theme={theme}
                    compact={embedded}
                  />
                </RevealSection>
              </div>
            )}

            {/* CHAPTER 4: Venue & Click-Tab Hospitality Concierge */}
            {(viewMode === 'folio' || activeChapter === 'venue') && (hasVenue || hasHospitality) && (
              <div key="chapter-venue" className="wedding-card-enter w-full">
                {hasVenue && (
                  <RevealSection rootRef={revealRootRef}>
                    <VenueCard
                      venue={data.venueHighlight}
                      language={language}
                      theme={theme}
                      compact={embedded}
                    />
                  </RevealSection>
                )}

                {hasHospitality && (
                  <RevealSection rootRef={revealRootRef}>
                    <HospitalityGuide
                      notes={data.hospitalityNotes}
                      language={language}
                      theme={theme}
                      compact={embedded}
                    />
                  </RevealSection>
                )}
              </div>
            )}

            {/* CHAPTER 5: Interactive Milestone Story + Portrait Gallery */}
            {(viewMode === 'folio' || activeChapter === 'story') && (hasStory || hasGallery) && (
              <div key="chapter-story" className="wedding-card-enter w-full">
                {hasStory && (
                  <RevealSection rootRef={revealRootRef}>
                    <CoupleStory
                      storyTitle={data.storyTitle}
                      storyText={data.storyText}
                      storyMilestones={data.storyMilestones}
                      brideName={data.brideName}
                      groomName={data.groomName}
                      language={language}
                      theme={theme}
                      compact={embedded}
                    />
                  </RevealSection>
                )}

                {!embedded && hasStory && hasGallery && (
                  <div className="py-1 opacity-80" aria-hidden="true">
                    <VarmalaDiyaDivider theme={theme} />
                  </div>
                )}

                {hasGallery && (
                  <div id="wedding-gallery" className={`w-full scroll-mt-20 ${galleryBandStyle}`}>
                    <RevealSection rootRef={revealRootRef}>
                      <PhotoGallery
                        photos={data.gallery}
                        brideName={data.brideName}
                        groomName={data.groomName}
                        language={language}
                        theme={theme}
                        compact={embedded}
                      />
                    </RevealSection>
                  </div>
                )}
              </div>
            )}

            {/* CHAPTER 6: RSVP, Digital Shagun & Footer */}
            {(viewMode === 'folio' || activeChapter === 'rsvp') && (
              <div key="chapter-rsvp" className="wedding-card-enter w-full">
                {(hasRsvp || hasShagun) && (
                  <div className={embedded ? 'w-full pb-4' : 'w-full py-4 md:py-8 lg:py-10'}>
                    {showDesktopRsvpShagunSpread ? (
                      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
                        <div className="lg:col-span-7">
                          <RevealSection rootRef={revealRootRef}>
                            <RsvpSection
                              rsvpConfig={data.rsvp}
                              slug={data.slug}
                              brideName={data.brideName}
                              groomName={data.groomName}
                              language={language}
                              theme={theme}
                              guestName={guestName}
                              compact={embedded}
                            />
                          </RevealSection>
                        </div>
                        <div className="lg:col-span-5">
                          <RevealSection rootRef={revealRootRef} delayMs={100}>
                            <DigitalShagun
                              shagun={data.shagun}
                              language={language}
                              theme={theme}
                              compact={embedded}
                            />
                          </RevealSection>
                        </div>
                      </div>
                    ) : (
                      <>
                        {hasRsvp && (
                          <RevealSection rootRef={revealRootRef}>
                            <RsvpSection
                              rsvpConfig={data.rsvp}
                              slug={data.slug}
                              brideName={data.brideName}
                              groomName={data.groomName}
                              language={language}
                              theme={theme}
                              guestName={guestName}
                              compact={embedded}
                            />
                          </RevealSection>
                        )}
                        {hasShagun && (
                          <RevealSection rootRef={revealRootRef}>
                            <DigitalShagun
                              shagun={data.shagun}
                              language={language}
                              theme={theme}
                              compact={embedded}
                            />
                          </RevealSection>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div className={`w-full ${closingColophonBandStyle}`}>
                  <RevealSection rootRef={revealRootRef}>
                    <WeddingFooter
                      data={data}
                      language={language}
                      onLanguageChange={setLanguage}
                      theme={theme}
                      guestName={guestName}
                      compact={embedded}
                    />
                  </RevealSection>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Interactive Deck Prev / Dots / Next Control Pill (Active after gate opens) */}
      {isOpen && viewMode === 'deck' && (
        <div
          className={`${
            embedded ? 'sticky bottom-3 mx-auto w-fit' : 'fixed bottom-4 left-1/2 -translate-x-1/2'
          } z-40 max-w-[calc(100vw-20px)]`}
        >
          <div
            className={`flex items-center gap-2 rounded-full border px-2.5 py-1.5 shadow-xl backdrop-blur-md ${pillAccent}`}
          >
            <button
              type="button"
              disabled={!prevChapter}
              onClick={() => prevChapter && goToChapter(prevChapter.id)}
              className="inline-flex min-h-[40px] sm:min-h-[36px] items-center gap-1 rounded-full px-3 font-royal-serif text-[10.5px] font-bold uppercase tracking-[0.14em] transition hover:bg-black/5 disabled:opacity-30"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>{extraNavCopy.prev}</span>
            </button>

            <div className="flex items-center gap-0.5 px-0.5">
              {chapters.map((ch) => {
                const active = ch.id === activeChapter;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    aria-label={ch.label}
                    onClick={() => goToChapter(ch.id)}
                    className="flex min-h-[36px] min-w-[20px] items-center justify-center px-0.5"
                  >
                    <span
                      className={`block h-2 rounded-full transition-all ${
                        active ? 'w-5 bg-[#C5A059]' : 'w-2 bg-current opacity-30 hover:opacity-70'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={!nextChapter}
              onClick={() => nextChapter && goToChapter(nextChapter.id)}
              className="inline-flex min-h-[40px] sm:min-h-[36px] items-center gap-1 rounded-full bg-[#C5A059] px-3.5 font-royal-serif text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#18120B] shadow-xs transition hover:brightness-105 disabled:opacity-30"
            >
              <span>{nextChapter ? nextChapter.label : extraNavCopy.next}</span>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
