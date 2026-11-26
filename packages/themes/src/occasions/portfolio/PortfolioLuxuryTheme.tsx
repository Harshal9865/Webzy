'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';
import { pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  buildPortfolioWhatsAppUrl,
  getValidPortfolioPhotos,
  hiSafeStyle,
  LUXURY_PROCESS_STEPS,
  LUXURY_PROJECTS,
  LUXURY_SERVICES,
  parsePortfolioIdentity,
  PORTFOLIO_CONTAINER_CSS,
  PORTFOLIO_THEMES_COPY,
  type PortfolioProjectCase,
  type PortfolioThemeComponentProps,
} from './portfolioTypes';

/** Subtle circular monogram seal SVG in warm champagne stone. */
function CoutureMonogramSeal({ initials }: { initials: string }) {
  const pathId = useId().replace(/:/g, '');
  const spaced = initials.split('').join(' · ');
  return (
    <svg viewBox="0 0 112 112" className="h-14 w-14 shrink-0 sm:h-20 sm:w-20" aria-hidden="true">
      <defs>
        <path
          id={`couture-seal-${pathId}`}
          d="M 56, 56 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
        />
      </defs>
      <circle cx="56" cy="56" r="52" fill="none" stroke="#181512" strokeOpacity="0.22" strokeWidth="1" />
      <circle cx="56" cy="56" r="30" fill="none" stroke="#181512" strokeOpacity="0.18" strokeWidth="1" />
      <text
        fill="#181512"
        fillOpacity="0.65"
        fontSize="7.5"
        fontWeight="600"
        letterSpacing="2.4"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
      >
        <textPath href={`#couture-seal-${pathId}`}>
          ATELIER PORTFOLIO · EDITION ·
        </textPath>
      </text>
      <text
        x="56"
        y="61"
        textAnchor="middle"
        fill="#181512"
        fontSize="16"
        fontStyle="italic"
        fontFamily="Georgia, serif"
      >
        {spaced}
      </text>
    </svg>
  );
}

/** Serene warm minimalist editorial silhouette SVG inside an ivory arch. */
function CouturePortraitArchSvg({ initials }: { initials: string }) {
  const sunId = `couture-sun-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 220 280" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={sunId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EFE4D4" />
          <stop offset="55%" stopColor="#DFCEB7" />
          <stop offset="100%" stopColor="#C8B194" />
        </linearGradient>
      </defs>
      <rect width="220" height="280" fill={`url(#${sunId})`} />
      {/* Soft architectural window light bands */}
      <polygon points="0,36 220,0 220,52 0,88" fill="#FFFFFF" fillOpacity="0.26" />
      <polygon points="0,126 220,90 220,130 0,166" fill="#FFFFFF" fillOpacity="0.16" />
      {/* Minimalist sculptural silhouette */}
      <ellipse cx="110" cy="108" rx="30" ry="36" fill="#2A241E" fillOpacity="0.88" />
      <path d="M44 280 C48 202, 74 166, 110 166 C146 166, 172 202, 176 280 Z" fill="#1E1A16" />
      <path d="M90 170 Q 110 192 130 170" fill="none" stroke="#E6D7C3" strokeWidth="1.6" />
      <text
        x="110"
        y="236"
        textAnchor="middle"
        fill="#E6D7C3"
        fontSize="12"
        letterSpacing="4"
        fontFamily="Georgia, serif"
      >
        {initials}
      </text>
    </svg>
  );
}

/** Minimalist luxury obsidian-and-champagne card artwork for 01-04 showcase slots. */
function LuxuryProjectArtwork({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 260 180" className="h-full w-full" aria-hidden="true">
        <rect width="260" height="180" fill="#181614" />
        <path d="M55 180 L55 74 A75 75 0 0 1 205 74 L205 180 Z" fill="#29241F" stroke="#D8C3A5" strokeOpacity="0.4" />
        <circle cx="130" cy="84" r="28" fill="none" stroke="#E6D7C3" strokeWidth="1.2" />
        <line x1="130" y1="36" x2="130" y2="146" stroke="#D8C3A5" strokeOpacity="0.3" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 260 180" className="h-full w-full" aria-hidden="true">
        <rect width="260" height="180" fill="#161412" />
        <rect x="34" y="28" width="90" height="124" fill="#231F1B" stroke="#C5B097" strokeOpacity="0.35" />
        <rect x="136" y="48" width="90" height="104" fill="#C5B097" fillOpacity="0.22" />
        <line x1="34" y1="90" x2="226" y2="90" stroke="#E6D7C3" strokeOpacity="0.35" />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg viewBox="0 0 260 180" className="h-full w-full" aria-hidden="true">
        <rect width="260" height="180" fill="#171411" />
        <circle cx="130" cy="90" r="54" fill="#241F1A" stroke="#E6D7C3" strokeOpacity="0.45" strokeWidth="1" />
        <circle cx="130" cy="90" r="36" fill="none" stroke="#C5B097" strokeOpacity="0.35" strokeDasharray="3 4" />
        <circle cx="130" cy="90" r="8" fill="#E6D7C3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 260 180" className="h-full w-full" aria-hidden="true">
      <rect width="260" height="180" fill="#151311" />
      <rect x="44" y="26" width="172" height="128" fill="none" stroke="#B8A082" strokeOpacity="0.45" />
      <rect x="64" y="44" width="132" height="92" fill="#26211C" />
      <polygon points="88,120 130,60 172,120" fill="none" stroke="#E6D7C3" strokeWidth="1.2" />
    </svg>
  );
}

/** Warm sunlit architectural detail vignette for the Services & Process section. */
function SunlitAtelierVignetteSvg() {
  const stoneId = `sunlit-stone-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 280 120" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={stoneId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EFE6D7" />
          <stop offset="100%" stopColor="#D6C3A8" />
        </linearGradient>
      </defs>
      <rect width="280" height="120" fill={`url(#${stoneId})`} />
      <polygon points="0,0 130,0 82,120 0,120" fill="#FFFFFF" fillOpacity="0.35" />
      <polygon points="165,0 245,0 198,120 118,120" fill="#FFFFFF" fillOpacity="0.2" />
      <rect x="28" y="76" width="224" height="1" fill="#181512" fillOpacity="0.2" />
      <circle cx="218" cy="54" r="18" fill="none" stroke="#181512" strokeOpacity="0.3" strokeWidth="1" />
    </svg>
  );
}

/**
 * Portfolio Luxury Theme ("Couture Ivory"):
 * Warm champagne ivory hero (#F7F1E8) with sunlit diagonal gradients, serif PORTFOLIO masthead,
 * circular monogram seal, deep obsidian (#0E0D0C) showcase grid with Lightbox Case Study,
 * warm ivory Services & interactive 01->04 Process accordion, and obsidian couture footer.
 */
export function PortfolioLuxuryTheme({
  data,
  language,
}: PortfolioThemeComponentProps) {
  const coreLang = toCoreLanguageCode(language);
  const copy = PORTFOLIO_THEMES_COPY[coreLang] ?? PORTFOLIO_THEMES_COPY.en;
  const langSafe = hiSafeStyle(language);

  const identity = useMemo(
    () => parsePortfolioIdentity(data, language, 'CREATIVE DIRECTOR & UI ARCHITECT'),
    [data, language],
  );

  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const validPhotos = useMemo(
    () => getValidPortfolioPhotos(data.photos, failedUrls),
    [data.photos, failedUrls],
  );
  const heroPhoto = validPhotos[0];

  const projects = useMemo<PortfolioProjectCase[]>(() => {
    const customHighlights = data.highlights ?? [];
    return LUXURY_PROJECTS.map((base, idx) => {
      const override = customHighlights[idx];
      if (!override) return base;
      const customTitle = pickLocalizedText(override.title, language).trim();
      const customDetail = pickLocalizedText(override.detail, language).trim();
      return {
        ...base,
        title: customTitle || base.title,
        summary: customDetail || base.summary,
      };
    });
  }, [data.highlights, language]);

  const [activeProject, setActiveProject] = useState<PortfolioProjectCase | null>(null);
  const [openStepNum, setOpenStepNum] = useState<string>('01');
  const [copiedContact, setCopiedContact] = useState(false);

  useEffect(() => {
    if (!activeProject) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveProject(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeProject]);

  const directBriefText = useMemo(
    () =>
      `Hello ${identity.displayName}, I would like to inquire about commissioning a bespoke digital project.`,
    [identity.displayName],
  );
  const whatsappHref = useMemo(
    () => buildPortfolioWhatsAppUrl(data.whatsappPhone, directBriefText),
    [data.whatsappPhone, directBriefText],
  );

  function handleCopyInquiry() {
    const text = `${identity.displayName} · ${identity.roleTitle}\n${directBriefText}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedContact(true);
    window.setTimeout(() => setCopiedContact(false), 2200);
  }

  return (
    <div
      className="wz-pf-root relative flex flex-1 flex-col overflow-x-clip bg-[#F7F1E8] text-[#181512]"
      style={{ colorScheme: 'light' }}
    >
      <style>{PORTFOLIO_CONTAINER_CSS}</style>

      {/* UPPER CHAMPAGNE IVORY HERO WITH SUNLIT DIAGONAL GRADIENT */}
      <section
        className="relative overflow-hidden px-4 pb-8 pt-4 sm:px-8"
        style={{
          background:
            'linear-gradient(125deg, #FAF5ED 0%, #F7F1E8 42%, #EDE1D0 76%, #E4D4BE 100%)',
        }}
      >
        {/* Subtle sunlit diagonal blind shadow overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'repeating-linear-gradient(118deg, rgba(255,255,255,0.55) 0px, rgba(255,255,255,0.55) 38px, rgba(164,137,104,0.12) 38px, rgba(164,137,104,0.12) 72px)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1040px]">
          <div className="flex items-center justify-between gap-3 border-b border-[#181512]/15 pb-3">
            <span className="shrink-0 font-mono text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[#5F5549]">
              ATELIER DOSSIER
            </span>
            <span className="min-w-0 truncate text-right font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#5F5549]">
              {identity.cityTag}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 sm:gap-3">
            <h1
              className="min-w-0 font-editorial font-normal uppercase tracking-[0.04em] text-[#181512]"
              style={{
                fontSize: 'clamp(1.65rem, 10.2cqw, 6.4rem)',
                lineHeight: 0.92,
              }}
            >
              PORTFOLIO
            </h1>
            <CoutureMonogramSeal initials={identity.initials} />
          </div>

          <div className="wz-pf-hero-split mt-6">
            {/* Left: Crisp Role Block & Editorial Bio */}
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6E6050]">
                {identity.roleTitle}
              </p>
              <h2
                className="mt-2 font-editorial text-2xl leading-[1.12] text-[#181512]"
                style={langSafe}
              >
                {identity.displayName}
              </h2>
              <p
                className="mt-2.5 font-editorial text-lg italic leading-snug text-[#3D352C]"
                style={langSafe}
              >
                {identity.headline}
              </p>
              <p className="mt-2.5 font-sans text-xs leading-relaxed text-[#5F5549]">
                {identity.bio}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#0E0D0C] px-5 text-xs font-semibold tracking-wide text-[#F7F1E8] transition hover:bg-[#3A3128] active:scale-95 motion-reduce:transition-none"
                  >
                    {copy.inquiryCta}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleCopyInquiry}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#0E0D0C] px-5 text-xs font-semibold tracking-wide text-[#F7F1E8] transition hover:bg-[#3A3128] active:scale-95 motion-reduce:transition-none"
                  >
                    {copiedContact ? copy.copiedContact : copy.copyContact}
                  </button>
                )}
                <a
                  href="#luxury-works"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#181512]/25 px-4 text-xs font-medium text-[#181512] transition hover:border-[#181512]"
                >
                  Selected Works
                </a>
              </div>
            </div>

            {/* Right: Arch Portrait Vignette */}
            <div className="mx-auto w-full max-w-[230px]">
              <div className="overflow-hidden rounded-t-[999px] rounded-b-2xl border border-[#181512]/15 bg-[#EADCC9] p-2 shadow-[0_22px_45px_-22px_rgba(24,21,18,0.4)]">
                <div className="aspect-[4/5] w-full overflow-hidden rounded-t-[999px] rounded-b-xl bg-[#DFCEB7]">
                  {heroPhoto ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={heroPhoto}
                      alt={identity.displayName}
                      onError={() =>
                        setFailedUrls((prev) => ({ ...prev, [heroPhoto]: true }))
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <CouturePortraitArchSvg initials={identity.initials} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEEP OBSIDIAN SHOWCASE SECTION: SELECTED WORKS */}
      <section
        id="luxury-works"
        className="bg-[#0E0D0C] px-4 py-8 text-[#F7F1E8] sm:px-8"
      >
        <div className="mx-auto max-w-[1040px]">
          <div className="mb-5 flex items-baseline justify-between gap-3 border-b border-[#F7F1E8]/15 pb-3">
            <div>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#C5B097]">
                CURATED ARCHIVE
              </p>
              <h2 className="mt-1 font-editorial text-2xl tracking-wide text-[#F7F1E8]">
                SELECTED WORKS
              </h2>
            </div>
            <span className="font-mono text-[10px] tracking-widest text-[#C5B097]/80">
              01 — 04
            </span>
          </div>

          <div className="wz-pf-grid-4">
            {projects.map((project, idx) => {
              const cardPhoto = validPhotos[idx + 1];
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setActiveProject(project)}
                  className="group flex min-h-[44px] flex-col overflow-hidden rounded-xl border border-[#F7F1E8]/12 bg-[#161412] p-2.5 text-left transition-all duration-300 hover:border-[#C5B097]/60 active:scale-[0.98] motion-reduce:transition-none"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#1F1B17]">
                    {cardPhoto ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={cardPhoto}
                        alt={project.title}
                        loading="lazy"
                        onError={() =>
                          setFailedUrls((prev) => ({ ...prev, [cardPhoto]: true }))
                        }
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                      />
                    ) : (
                      <LuxuryProjectArtwork index={idx} />
                    )}
                    <span className="absolute left-2 top-2 rounded-full border border-[#F7F1E8]/20 bg-[#0E0D0C]/80 px-2 py-0.5 font-mono text-[9px] text-[#E6D7C3]">
                      {project.num}
                    </span>
                  </div>
                  <h3 className="mt-2.5 truncate font-editorial text-base tracking-wide text-[#F7F1E8] group-hover:text-[#E6D7C3]">
                    {project.title}
                  </h3>
                  <p className="mt-0.5 truncate font-mono text-[9.5px] uppercase tracking-wider text-[#A99B89]">
                    {project.deliverables[0]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* WARM IVORY SERVICES & PROCESS TWO-COLUMN BLOCK */}
      <section className="bg-[#F7F1E8] px-4 py-8 text-[#181512] sm:px-8">
        <div className="mx-auto max-w-[1040px]">
          <div className="mb-5 border-b border-[#181512]/15 pb-3">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#7A6B58]">
              ATELIER PRACTICE
            </p>
            <h2 className="mt-1 font-editorial text-2xl text-[#181512]">
              SERVICES &amp; PROCESS
            </h2>
          </div>

          <div className="wz-pf-grid-2">
            {/* Left: Services List */}
            <div className="flex flex-col justify-between gap-4">
              <div className="divide-y divide-[#181512]/15 border-y border-[#181512]/15">
                {LUXURY_SERVICES.map((service) => (
                  <div
                    key={service.num}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3.5"
                  >
                    <div className="flex min-w-0 items-baseline gap-3">
                      <span className="font-mono text-[10px] font-semibold text-[#6E5E4B]">
                        {service.num}
                      </span>
                      <span className="font-editorial text-lg text-[#181512]">
                        {service.title}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-wider text-[#5F5549]">
                      {service.tag}
                    </span>
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-xl border border-[#181512]/12 bg-[#EADCC9]">
                <div className="h-24 w-full">
                  <SunlitAtelierVignetteSvg />
                </div>
                <div className="flex items-center justify-between px-3.5 py-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#5F5549]">
                  <span>BESPOKE COMMISSIONS</span>
                  <span>2026 SLOTS OPEN</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive 01 Discover -> 04 Deliver Accordion */}
            <div className="space-y-2.5">
              {LUXURY_PROCESS_STEPS.map((step) => {
                const isOpen = openStepNum === step.num;
                return (
                  <div
                    key={step.num}
                    className={`rounded-xl border transition-colors ${
                      isOpen
                        ? 'border-[#181512] bg-white/75'
                        : 'border-[#181512]/15 bg-[#EFE7DA]/70'
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenStepNum(isOpen ? '' : step.num)}
                      className="flex min-h-[48px] w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-[10px] font-bold text-[#6E5E4B]">
                          {step.num}
                        </span>
                        <span className="font-editorial text-lg text-[#181512]">
                          {step.title}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#181512]/60">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>

                    {isOpen ? (
                      <div className="border-t border-[#181512]/10 px-4 pb-3.5 pt-2.5">
                        <p className="font-sans text-xs leading-relaxed text-[#4C4339]">
                          {step.summary}
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {step.deliverables.map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-[#181512]/15 bg-[#F7F1E8] px-2.5 py-0.5 font-mono text-[9.5px] text-[#3D352C]"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* OBSIDIAN COUTURE FOOTER */}
      <section className="bg-[#0E0D0C] px-4 py-8 text-[#F7F1E8] sm:px-8">
        <div className="mx-auto flex max-w-[1040px] flex-col items-center text-center">
          <span
            className="font-editorial text-5xl italic text-[#C5B097]/90 sm:text-6xl"
            aria-hidden="true"
          >
            {identity.initials}
          </span>
          <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.24em] text-[#A99B89]">
            PRIVATE INQUIRIES
          </p>
          <h2 className="mt-1.5 max-w-md font-editorial text-2xl leading-tight text-[#F7F1E8] sm:text-3xl">
            LET&apos;S CREATE SOMETHING BEAUTIFUL
          </h2>
          <p className="mt-2 text-xs text-[#A99B89]">
            {identity.displayName} · {identity.cityTag}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#F7F1E8] px-5 text-xs font-semibold text-[#0E0D0C] transition hover:bg-[#E6D7C3] active:scale-95 motion-reduce:transition-none"
              >
                {copy.inquiryCta}
              </a>
            ) : null}
            <button
              type="button"
              onClick={handleCopyInquiry}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#F7F1E8]/25 px-5 text-xs font-medium text-[#F7F1E8] transition hover:border-[#C5B097] hover:text-[#E6D7C3] active:scale-95 motion-reduce:transition-none"
            >
              {copiedContact ? copy.copiedContact : copy.copyContact}
            </button>
          </div>
        </div>
      </section>

      {/* EDITORIAL LIGHTBOX CASE STUDY MODAL */}
      {activeProject ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeProject.title}
          onClick={() => setActiveProject(null)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#C5B097]/35 bg-[#12100E] p-5 text-[#F7F1E8] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#F7F1E8]/15 pb-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C5B097]">
                  WORK {activeProject.num} · {activeProject.year}
                </p>
                <h3 className="mt-1 font-editorial text-2xl text-[#F7F1E8]">
                  {activeProject.title}
                </h3>
                <p className="font-mono text-[10px] text-[#A99B89]">{activeProject.client}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                className="min-h-[44px] min-w-[44px] rounded-full border border-[#F7F1E8]/25 px-3 text-xs font-medium text-[#F7F1E8] transition hover:bg-[#F7F1E8] hover:text-[#0E0D0C]"
              >
                {copy.closeModal}
              </button>
            </div>

            <div className="mt-4 aspect-[16/10] w-full overflow-hidden rounded-xl border border-[#F7F1E8]/15 bg-[#1B1815]">
              {validPhotos[LUXURY_PROJECTS.findIndex((p) => p.id === activeProject.id) + 1] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={
                    validPhotos[LUXURY_PROJECTS.findIndex((p) => p.id === activeProject.id) + 1]
                  }
                  alt={activeProject.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <LuxuryProjectArtwork
                  index={Math.max(
                    0,
                    LUXURY_PROJECTS.findIndex((p) => p.id === activeProject.id),
                  )}
                />
              )}
            </div>

            <p className="mt-4 font-sans text-xs leading-relaxed text-[#DFD5C7]">
              {activeProject.summary}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-[#F7F1E8]/12 bg-white/5 p-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-[#A99B89]">
                  {copy.deliverablesLabel}
                </p>
                <ul className="mt-1.5 space-y-1 text-[11px] text-[#F7F1E8]">
                  {activeProject.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-center rounded-xl border border-[#C5B097]/30 bg-[#C5B097]/10 p-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-[#C5B097]">
                  {copy.impactLabel}
                </p>
                <p className="mt-1 font-editorial text-2xl text-[#F7F1E8]">
                  {activeProject.metricValue}
                </p>
                <p className="font-mono text-[10px] text-[#A99B89]">
                  {activeProject.metricLabel}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {whatsappHref ? (
                <a
                  href={buildPortfolioWhatsAppUrl(
                    data.whatsappPhone,
                    `Hello ${identity.displayName}, I admired "${activeProject.title}" and would like to discuss a project.`,
                  ) ?? whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-[#F7F1E8] px-4 text-xs font-semibold text-[#0E0D0C]"
                >
                  {copy.inquiryCta}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleCopyInquiry();
                    setActiveProject(null);
                  }}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-[#F7F1E8] px-4 text-xs font-semibold text-[#0E0D0C]"
                >
                  {copy.copyContact}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
