'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import {
  buildPortfolioWhatsAppUrl,
  getValidPortfolioPhotos,
  hiSafeStyle,
  KINETIC_MARQUEE_TAGS,
  KINETIC_PROJECTS,
  parsePortfolioIdentity,
  PORTFOLIO_CONTAINER_CSS,
  PORTFOLIO_THEMES_COPY,
  type PortfolioProjectCase,
  type PortfolioThemeComponentProps,
  usePortfolioReducedMotion,
} from './portfolioTypes';

type KineticFilter = 'All' | 'Web Apps' | 'Brand' | '3D';
const FILTER_OPTIONS: readonly KineticFilter[] = ['All', 'Web Apps', 'Brand', '3D'];
const SCOPE_OPTIONS = ['Product Site', 'Design System', 'Interactive Launch'] as const;

/** Geometric kinetic signal avatar SVG for the magnetic tilt identity card. */
function KineticSignalAvatarSvg({ initials }: { initials: string }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <rect width="120" height="120" fill="#131620" />
      <circle cx="60" cy="60" r="46" fill="none" stroke="#D9F99D" strokeOpacity="0.28" strokeDasharray="4 4" />
      <polygon points="60,18 98,60 60,102 22,60" fill="#1A1F2E" stroke="#D9F99D" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="19" fill="#D9F99D" />
      <text
        x="60"
        y="65"
        textAnchor="middle"
        fill="#090A0E"
        fontSize="14"
        fontWeight="800"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
      >
        {initials}
      </text>
    </svg>
  );
}

/** Kinetic tech-zine SVG artwork for bento cards when no buyer image is supplied. */
function KineticBentoArtwork({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 320 160" className="h-full w-full" aria-hidden="true">
        <rect width="320" height="160" fill="#10131C" />
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={i}
            x1={40 * i}
            y1="0"
            x2={40 * i}
            y2="160"
            stroke="#F5F5F0"
            strokeOpacity="0.06"
          />
        ))}
        <rect x="26" y="26" width="122" height="108" rx="8" fill="#181C28" stroke="#D9F99D" strokeOpacity="0.45" />
        <path d="M40 98 L68 72 L94 86 L130 48" fill="none" stroke="#D9F99D" strokeWidth="3" strokeLinecap="round" />
        <circle cx="130" cy="48" r="5" fill="#FBBF24" />
        <rect x="168" y="26" width="126" height="48" rx="8" fill="#181C28" stroke="#F5F5F0" strokeOpacity="0.16" />
        <rect x="168" y="86" width="126" height="48" rx="8" fill="#D9F99D" fillOpacity="0.14" stroke="#D9F99D" strokeOpacity="0.35" />
        <line x1="184" y1="50" x2="262" y2="50" stroke="#F5F5F0" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
        <line x1="184" y1="110" x2="246" y2="110" stroke="#D9F99D" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 240 160" className="h-full w-full" aria-hidden="true">
        <rect width="240" height="160" fill="#11131B" />
        <text
          x="22"
          y="78"
          fill="#F5F5F0"
          fontSize="44"
          fontWeight="800"
          fontFamily="sans-serif"
          letterSpacing="-2"
        >
          Aa
        </text>
        <text
          x="104"
          y="78"
          fill="#FBBF24"
          fontSize="44"
          fontStyle="italic"
          fontFamily="serif"
        >
          Zg
        </text>
        <line x1="22" y1="104" x2="218" y2="104" stroke="#F5F5F0" strokeOpacity="0.2" />
        <rect x="22" y="118" width="84" height="14" rx="7" fill="#D9F99D" />
        <rect x="114" y="118" width="52" height="14" rx="7" fill="#FBBF24" fillOpacity="0.35" />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg viewBox="0 0 240 160" className="h-full w-full" aria-hidden="true">
        <rect width="240" height="160" fill="#0F1219" />
        <polygon points="120,24 188,62 120,100 52,62" fill="#D9F99D" fillOpacity="0.16" stroke="#D9F99D" strokeWidth="1.5" />
        <polygon points="52,62 120,100 120,142 52,104" fill="#191E2A" stroke="#F5F5F0" strokeOpacity="0.28" />
        <polygon points="188,62 120,100 120,142 188,104" fill="#131722" stroke="#FBBF24" strokeOpacity="0.55" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 160" className="h-full w-full" aria-hidden="true">
      <rect width="240" height="160" fill="#11131B" />
      <rect x="34" y="30" width="172" height="100" rx="12" fill="#181C26" stroke="#FBBF24" strokeOpacity="0.45" />
      <circle cx="64" cy="58" r="10" fill="#D9F99D" />
      <line x1="84" y1="58" x2="178" y2="58" stroke="#F5F5F0" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />
      <rect x="52" y="84" width="136" height="24" rx="6" fill="#FBBF24" />
    </svg>
  );
}

/**
 * Portfolio Kinetic Theme ("Obsidian Signal"):
 * Deep slate-black (#090A0E), chalk white (#F5F5F0), chartreuse-lime (#D9F99D) & amber (#FBBF24),
 * live IST clock tick, magnetic pointer-tilt identity card, craft marquee,
 * interactive category filter, staggered bento showcase + 1-tap Copy & WhatsApp drawer.
 */
export function PortfolioKineticTheme({
  data,
  language,
}: PortfolioThemeComponentProps) {
  const reducedMotion = usePortfolioReducedMotion();
  const coreLang = toCoreLanguageCode(language);
  const copy = PORTFOLIO_THEMES_COPY[coreLang] ?? PORTFOLIO_THEMES_COPY.en;
  const langSafe = hiSafeStyle(language);

  const identity = useMemo(
    () => parsePortfolioIdentity(data, language, 'DESIGN ENGINEER & CREATIVE STUDIO'),
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
    return KINETIC_PROJECTS.map((base, idx) => {
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

  // Live IST clock tick
  const [istTime, setIstTime] = useState<string>('09:30:00 IST');
  useEffect(() => {
    const formatIst = () => {
      try {
        return `${new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date())} IST`;
      } catch {
        return 'IST LIVE';
      }
    };
    setIstTime(formatIst());
    const id = window.setInterval(() => setIstTime(formatIst()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Magnetic pointer tilt state
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  function handleCardPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion || e.pointerType === 'touch') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    const py = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
    setTilt({ rx: Number((-py * 8).toFixed(2)), ry: Number((px * 9).toFixed(2)) });
  }
  function handleCardPointerLeave() {
    setTilt({ rx: 0, ry: 0 });
  }

  const [activeFilter, setActiveFilter] = useState<KineticFilter>('All');
  const filteredProjects = useMemo(
    () =>
      activeFilter === 'All'
        ? projects
        : projects.filter((project) => project.category === activeFilter),
    [projects, activeFilter],
  );

  const [activeProject, setActiveProject] = useState<PortfolioProjectCase | null>(null);
  const [selectedScope, setSelectedScope] = useState<(typeof SCOPE_OPTIONS)[number]>('Product Site');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedContact, setCopiedContact] = useState(false);

  useEffect(() => {
    if (!activeProject) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveProject(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeProject]);

  const scopeBriefText = useMemo(
    () =>
      `Hey ${identity.displayName}, looking to build a ${selectedScope} with you. (${identity.cityTag})`,
    [identity.displayName, identity.cityTag, selectedScope],
  );
  const whatsappHref = useMemo(
    () => buildPortfolioWhatsAppUrl(data.whatsappPhone, scopeBriefText),
    [data.whatsappPhone, scopeBriefText],
  );

  function handleCopyContact() {
    const contactPayload = `${identity.displayName} | ${identity.roleTitle} | ${identity.cityTag}\nBrief: ${scopeBriefText}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(contactPayload).catch(() => {});
    }
    setCopiedContact(true);
    window.setTimeout(() => setCopiedContact(false), 2200);
  }

  return (
    <div
      className="wz-pf-root relative flex flex-1 flex-col overflow-x-clip bg-[#090A0E] text-[#F5F5F0]"
      style={{
        colorScheme: 'dark',
        backgroundImage:
          'radial-gradient(rgba(217,249,157,0.09) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <style>{PORTFOLIO_CONTAINER_CSS}</style>

      <div className="relative z-10 mx-auto w-full max-w-[1060px] px-3.5 pb-10 pt-3.5 sm:px-6">
        {/* LIVE PULSING AVAILABILITY + IST CLOCK BAR */}
        <header className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#11131A]/90 px-3 py-2 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {!reducedMotion ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D9F99D] opacity-75" />
              ) : null}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#D9F99D]" />
            </span>
            <span className="font-pixel text-[10px] uppercase tracking-wider text-[#D9F99D]">
              AVAILABLE
            </span>
            <span className="hidden font-mono text-[10px] text-white/55 xs:inline">
              · {identity.cityTag}
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold tracking-wider text-[#FBBF24]">
            {istTime}
          </span>
        </header>

        {/* MAGNETIC POINTER-TILT IDENTITY CARD */}
        <section className="mt-4" style={{ perspective: '900px' }}>
          <div
            onPointerMove={handleCardPointerMove}
            onPointerLeave={handleCardPointerLeave}
            className="rounded-2xl border border-white/15 bg-[#11131A] p-4 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.85)] transition-transform duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none sm:p-6"
            style={
              reducedMotion
                ? undefined
                : {
                    transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                  }
            }
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#D9F99D]/40 bg-[#171B26]">
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
                    <KineticSignalAvatarSvg initials={identity.initials} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#D9F99D]">
                    {identity.roleTitle}
                  </p>
                  <h1 className="mt-0.5 truncate font-heading text-2xl font-bold tracking-tight text-[#F5F5F0]">
                    {identity.displayName}
                  </h1>
                </div>
              </div>
              <span className="rounded-full border border-[#FBBF24]/35 bg-[#FBBF24]/10 px-2.5 py-1 font-pixel text-[9px] uppercase tracking-wider text-[#FBBF24]">
                SIGNAL // 26
              </span>
            </div>

            <h2
              className="mt-4 font-sans text-lg font-bold leading-snug tracking-tight text-white sm:text-2xl"
              style={langSafe}
            >
              {identity.headline}
            </h2>
            <p className="mt-2 font-sans text-xs leading-relaxed text-white/70">
              {identity.bio}
            </p>
          </div>
        </section>

        {/* HORIZONTAL VELOCITY MARQUEE */}
        <div
          aria-hidden="true"
          className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#D9F99D] py-2 text-[#090A0E]"
        >
          <div className="wz-pf-marquee-track font-mono text-[10.5px] font-extrabold uppercase tracking-[0.18em]">
            {[...KINETIC_MARQUEE_TAGS, ...KINETIC_MARQUEE_TAGS].map((tag, idx) => (
              <span key={`${tag}-${idx}`} className="mx-3 whitespace-nowrap">
                {tag} ·
              </span>
            ))}
          </div>
        </div>

        {/* INTERACTIVE CATEGORY FILTER + STAGGERED BENTO SHOWCASE */}
        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div>
              <p className="font-pixel text-[9.5px] uppercase tracking-wider text-[#FBBF24]">
                SELECTED BUILDS
              </p>
              <h2 className="mt-0.5 font-heading text-lg font-bold text-[#F5F5F0]">
                Studio Index
              </h2>
            </div>

            <div
              role="group"
              aria-label="Filter projects by category"
              className="flex flex-wrap items-center gap-1.5"
            >
              {FILTER_OPTIONS.map((filter) => {
                const isSelected = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setActiveFilter(filter)}
                    className={`min-h-[44px] rounded-full px-3.5 font-mono text-[10.5px] font-bold transition active:scale-95 motion-reduce:transition-none ${
                      isSelected
                        ? 'bg-[#D9F99D] text-[#090A0E]'
                        : 'border border-white/15 bg-[#11131A] text-white/75 hover:border-white/35 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="wz-pf-bento mt-4">
            {filteredProjects.map((project, idx) => {
              const origIdx = Math.max(
                0,
                projects.findIndex((p) => p.id === project.id),
              );
              const cardPhoto = validPhotos[origIdx + 1];
              const isLead = activeFilter === 'All' && idx === 0;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setActiveProject(project)}
                  className={`group flex min-h-[44px] flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#11131A] p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D9F99D]/65 active:scale-[0.98] motion-reduce:transition-none ${
                    isLead ? 'wz-pf-bento-lead' : ''
                  }`}
                >
                  <div
                    className={`relative w-full overflow-hidden rounded-xl bg-[#0C0E14] ${
                      isLead ? 'aspect-[16/9]' : 'aspect-[4/3]'
                    }`}
                  >
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
                      <KineticBentoArtwork index={origIdx} />
                    )}
                    <span className="absolute left-2.5 top-2.5 rounded-md bg-[#090A0E]/85 px-2 py-0.5 font-pixel text-[9px] text-[#D9F99D]">
                      {project.num} // {project.category}
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 rounded-full bg-[#FBBF24] px-2 py-0.5 font-mono text-[9.5px] font-extrabold text-[#090A0E]">
                      {project.metricValue}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between gap-2">
                    <h3 className="truncate font-sans text-sm font-bold text-[#F5F5F0] group-hover:text-[#D9F99D]">
                      {project.title}
                    </h3>
                    <span className="shrink-0 font-mono text-[10px] text-white/50">
                      {project.year}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/65">
                    {project.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 1-TAP COPY CONTACT + START PROJECT ON WHATSAPP DRAWER */}
        <section className="mt-6 rounded-2xl border border-[#D9F99D]/25 bg-[#11131A] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-pixel text-[9.5px] uppercase tracking-wider text-[#D9F99D]">
                DIRECT UPLINK
              </p>
              <h2 className="mt-0.5 font-heading text-lg font-bold text-[#F5F5F0]">
                Start a Build Together
              </h2>
            </div>

            <button
              type="button"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((prev) => !prev)}
              className="min-h-[44px] rounded-full border border-white/20 bg-white/5 px-4 font-mono text-[10.5px] font-bold text-white transition hover:border-[#D9F99D] hover:text-[#D9F99D]"
            >
              {drawerOpen ? 'Hide Scope' : 'Pick Scope'}
            </button>
          </div>

          {drawerOpen ? (
            <div className="mt-3.5 rounded-xl border border-white/10 bg-[#090A0E] p-3">
              <p className="font-mono text-[9.5px] uppercase tracking-wider text-white/55">
                PROJECT TRACK
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SCOPE_OPTIONS.map((scope) => {
                  const active = selectedScope === scope;
                  return (
                    <button
                      key={scope}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedScope(scope)}
                      className={`min-h-[40px] rounded-lg px-3 font-mono text-[10.5px] font-bold transition ${
                        active
                          ? 'bg-[#FBBF24] text-[#090A0E]'
                          : 'border border-white/15 text-white/75 hover:border-white/35'
                      }`}
                    >
                      {scope}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2.5 font-mono text-[11px] text-white/75">
                &gt; {scopeBriefText}
              </p>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyContact}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 text-center font-mono text-xs font-bold text-[#F5F5F0] transition hover:border-[#FBBF24] hover:text-[#FBBF24] active:scale-95 motion-reduce:transition-none"
            >
              {copiedContact ? copy.copiedContact : copy.copyContact}
            </button>

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[#D9F99D] px-4 text-center font-sans text-xs font-extrabold text-[#090A0E] transition hover:brightness-105 active:scale-95 motion-reduce:transition-none"
              >
                {copy.inquiryCta}
              </a>
            ) : (
              <button
                type="button"
                onClick={handleCopyContact}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[#D9F99D] px-4 text-center font-sans text-xs font-extrabold text-[#090A0E] transition hover:brightness-105 active:scale-95 motion-reduce:transition-none"
              >
                {copiedContact ? copy.copiedContact : 'Copy Project Brief'}
              </button>
            )}
          </div>
        </section>
      </div>

      {/* KINETIC CASE STUDY MODAL */}
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
            className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#D9F99D]/35 bg-[#11131A] p-5 text-[#F5F5F0] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <p className="font-pixel text-[9.5px] uppercase tracking-wider text-[#D9F99D]">
                  BUILD {activeProject.num} // {activeProject.category}
                </p>
                <h3 className="mt-1 font-heading text-xl font-bold text-white">
                  {activeProject.title}
                </h3>
                <p className="font-mono text-[10px] text-white/55">{activeProject.client}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                className="min-h-[44px] min-w-[44px] rounded-xl border border-white/20 px-3 font-mono text-xs font-bold text-white transition hover:bg-[#D9F99D] hover:text-[#090A0E]"
              >
                {copy.closeModal}
              </button>
            </div>

            <div className="mt-3.5 aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10 bg-[#090A0E]">
              {validPhotos[KINETIC_PROJECTS.findIndex((p) => p.id === activeProject.id) + 1] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={
                    validPhotos[KINETIC_PROJECTS.findIndex((p) => p.id === activeProject.id) + 1]
                  }
                  alt={activeProject.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <KineticBentoArtwork
                  index={Math.max(
                    0,
                    KINETIC_PROJECTS.findIndex((p) => p.id === activeProject.id),
                  )}
                />
              )}
            </div>

            <p className="mt-3.5 font-sans text-xs leading-relaxed text-white/75">
              {activeProject.summary}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-white/10 bg-[#090A0E] p-3">
                <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-white/50">
                  {copy.deliverablesLabel}
                </p>
                <ul className="mt-1.5 space-y-1 text-[11px] font-semibold text-white">
                  {activeProject.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-center rounded-xl border border-[#D9F99D]/30 bg-[#D9F99D]/10 p-3">
                <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#D9F99D]">
                  {copy.impactLabel}
                </p>
                <p className="mt-1 font-heading text-2xl font-bold text-[#FBBF24]">
                  {activeProject.metricValue}
                </p>
                <p className="font-mono text-[10px] text-white/65">
                  {activeProject.metricLabel}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {whatsappHref ? (
                <a
                  href={buildPortfolioWhatsAppUrl(
                    data.whatsappPhone,
                    `Hey ${identity.displayName}, saw "${activeProject.title}" on your Kinetic folio and want to chat about a build.`,
                  ) ?? whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[#D9F99D] px-4 text-xs font-extrabold text-[#090A0E]"
                >
                  {copy.inquiryCta}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleCopyContact();
                    setActiveProject(null);
                  }}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[#D9F99D] px-4 text-xs font-extrabold text-[#090A0E]"
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
