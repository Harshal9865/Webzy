'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';
import { pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import { AtmosphericGrainOverlay } from '../shared/OccasionCraftPrimitives';
import {
  buildPortfolioWhatsAppUrl,
  EDITORIAL_CAPABILITIES,
  EDITORIAL_PROJECTS,
  EDITORIAL_REVIEWS,
  EDITORIAL_SKILLS,
  getValidPortfolioPhotos,
  hiSafeStyle,
  parsePortfolioIdentity,
  PORTFOLIO_CONTAINER_CSS,
  PORTFOLIO_THEMES_COPY,
  type PortfolioProjectCase,
  type PortfolioThemeComponentProps,
  usePortfolioReducedMotion,
} from './portfolioTypes';

/** Bespoke geometric portrait silhouette used when buyer hasn't uploaded a hero portrait photo. */
function EditorialPortraitVector({ initials }: { initials: string }) {
  const skyId = `ed-sky-${useId().replace(/:/g, '')}`;
  return (
    <svg
      viewBox="0 0 220 220"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F6F2EA" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1A1715" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      <rect width="220" height="220" fill={`url(#${skyId})`} />
      {/* Architectural grid hairlines */}
      <line x1="0" y1="74" x2="220" y2="74" stroke="#F6F2EA" strokeOpacity="0.22" strokeWidth="1" />
      <line x1="0" y1="146" x2="220" y2="146" stroke="#F6F2EA" strokeOpacity="0.22" strokeWidth="1" />
      <line x1="110" y1="0" x2="110" y2="220" stroke="#F6F2EA" strokeOpacity="0.22" strokeWidth="1" />
      {/* Geometric bust silhouette */}
      <circle cx="110" cy="84" r="32" fill="#1A1715" />
      <path d="M46 210 C50 152, 78 130, 110 130 C142 130, 170 152, 174 210 Z" fill="#1A1715" />
      {/* Terracotta collar accent */}
      <path d="M88 134 L110 154 L132 134" fill="none" stroke="#F6F2EA" strokeWidth="2.4" strokeLinecap="round" />
      <text
        x="110"
        y="91"
        textAnchor="middle"
        fill="#F6F2EA"
        fontSize="16"
        fontWeight="700"
        letterSpacing="2"
        fontFamily="serif"
      >
        {initials}
      </text>
    </svg>
  );
}

/** Bespoke architectural SVG artwork for Editorial project cards 01-04 when no photo is provided. */
function EditorialProjectArtwork({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 240 180" className="h-full w-full" aria-hidden="true">
        <rect width="240" height="180" fill="#EAE2D3" />
        <rect x="24" y="24" width="192" height="132" fill="none" stroke="#1A1715" strokeWidth="1.2" />
        <circle cx="94" cy="90" r="44" fill="#C85A3F" />
        <rect x="116" y="46" width="74" height="88" fill="#1A1715" fillOpacity="0.9" />
        <line x1="130" y1="70" x2="176" y2="70" stroke="#F6F2EA" strokeWidth="2" />
        <line x1="130" y1="84" x2="164" y2="84" stroke="#F6F2EA" strokeOpacity="0.65" strokeWidth="1.5" />
        <line x1="130" y1="98" x2="170" y2="98" stroke="#C85A3F" strokeWidth="2" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 240 180" className="h-full w-full" aria-hidden="true">
        <rect width="240" height="180" fill="#E3DAC9" />
        <path d="M40 156 L40 76 A80 80 0 0 1 200 76 L200 156 Z" fill="#1A1715" />
        <path d="M72 156 L72 92 A48 48 0 0 1 168 92 L168 156 Z" fill="#C85A3F" />
        <circle cx="120" cy="96" r="18" fill="#F6F2EA" />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg viewBox="0 0 240 180" className="h-full w-full" aria-hidden="true">
        <rect width="240" height="180" fill="#1A1715" />
        <rect x="28" y="22" width="84" height="136" fill="#F6F2EA" />
        <rect x="128" y="22" width="84" height="136" fill="#2A2522" stroke="#F6F2EA" strokeOpacity="0.25" />
        <line x1="42" y1="46" x2="98" y2="46" stroke="#C85A3F" strokeWidth="4" />
        <line x1="42" y1="62" x2="96" y2="62" stroke="#1A1715" strokeWidth="1.5" />
        <line x1="42" y1="74" x2="88" y2="74" stroke="#1A1715" strokeOpacity="0.6" strokeWidth="1.5" />
        <line x1="42" y1="86" x2="94" y2="86" stroke="#1A1715" strokeOpacity="0.6" strokeWidth="1.5" />
        <circle cx="170" cy="90" r="24" fill="none" stroke="#C85A3F" strokeWidth="2.5" />
        <circle cx="170" cy="90" r="6" fill="#F6F2EA" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 180" className="h-full w-full" aria-hidden="true">
      <rect width="240" height="180" fill="#EFE8DA" />
      {Array.from({ length: 7 }).map((_, i) => (
        <line
          key={i}
          x1="28"
          y1={34 + i * 18}
          x2="212"
          y2={34 + i * 18}
          stroke="#1A1715"
          strokeOpacity="0.16"
          strokeWidth="1"
        />
      ))}
      <path
        d="M28 112 Q 70 46, 114 102 T 212 68"
        fill="none"
        stroke="#C85A3F"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="114" cy="102" r="9" fill="#1A1715" />
      <circle cx="212" cy="68" r="6" fill="#C85A3F" />
    </svg>
  );
}

/** Stylized archival QR badge SVG for the editorial footer. */
function EditorialQrBadgeSvg() {
  const cells = [
    [1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1],
    [0, 1, 0, 1, 0, 1, 0],
    [1, 1, 1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1],
  ];
  return (
    <svg viewBox="0 0 84 84" className="h-16 w-16 shrink-0" aria-hidden="true">
      <rect width="84" height="84" rx="6" fill="#F6F2EA" stroke="#1A1715" strokeWidth="1.5" />
      {cells.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={10 + c * 9.2}
              y={10 + r * 9.2}
              width="7.4"
              height="7.4"
              rx="1"
              fill={r === 3 && c === 3 ? '#C85A3F' : '#1A1715'}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

/**
 * Portfolio Editorial Theme ("Terracotta Print"):
 * Warm cream archival paper (#F6F2EA), ink (#1A1715), burnt terracotta (#C85A3F),
 * condensed fluid masthead, circular rotating stamp, numbered 01-04 case grid with modal,
 * skill progress rails, tactile review slips & QR contact footer.
 */
export function PortfolioEditorialTheme({
  data,
  language,
}: PortfolioThemeComponentProps) {
  const stampPathId = useId().replace(/:/g, '');
  const reducedMotion = usePortfolioReducedMotion();
  const coreLang = toCoreLanguageCode(language);
  const copy = PORTFOLIO_THEMES_COPY[coreLang] ?? PORTFOLIO_THEMES_COPY.en;
  const langSafe = hiSafeStyle(language);

  const identity = useMemo(
    () => parsePortfolioIdentity(data, language, 'WEB DESIGNER & DIGITAL CREATIVE'),
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
    return EDITORIAL_PROJECTS.map((base, idx) => {
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
  const [skillBarReady, setSkillBarReady] = useState(false);
  const [copiedContact, setCopiedContact] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setSkillBarReady(true);
      return;
    }
    const id = window.setTimeout(() => setSkillBarReady(true), 180);
    return () => window.clearTimeout(id);
  }, [reducedMotion]);

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
      `Hi ${identity.displayName}, I reviewed your portfolio and would like to discuss a new project.`,
    [identity.displayName],
  );
  const whatsappHref = useMemo(
    () => buildPortfolioWhatsAppUrl(data.whatsappPhone, directBriefText),
    [data.whatsappPhone, directBriefText],
  );

  function handleCopyBrief() {
    const contactBlob = `${identity.displayName} — ${identity.roleTitle} (${identity.cityTag})\n${directBriefText}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(contactBlob).catch(() => {});
    }
    setCopiedContact(true);
    window.setTimeout(() => setCopiedContact(false), 2200);
  }

  return (
    <div
      className="wz-pf-root relative flex flex-1 flex-col overflow-x-clip bg-[#F6F2EA] text-[#1A1715]"
      style={{ colorScheme: 'light' }}
    >
      <style>{PORTFOLIO_CONTAINER_CSS}</style>
      <AtmosphericGrainOverlay opacity={0.045} />

      <div className="relative z-10 mx-auto w-full max-w-[1060px] px-3.5 pb-10 pt-3 sm:px-6">
        {/* TOP ARCHIVAL FOLIO BAR */}
        <header className="flex items-center justify-between gap-2 border-b border-[#1A1715]/20 pb-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#1A1715]/75">
          <span className="truncate">PORTFOLIO · ED. 2026</span>
          <span className="truncate text-right text-[#C85A3F]">{identity.cityTag}</span>
        </header>

        {/* MASSIVE CONDENSED MASTHEAD */}
        <div className="overflow-hidden border-b border-[#1A1715] py-2 text-center">
          <h1
            className="font-zine w-full select-none font-black uppercase text-[#1A1715]"
            style={{
              fontSize: 'clamp(2.25rem, 17.8cqw, 8.6rem)',
              lineHeight: 0.86,
              letterSpacing: '-0.02em',
            }}
          >
            PORTFOLIO
          </h1>
        </div>

        {/* HERO SPLIT: TERRACOTTA DISC + ROTATING STAMP + SIGNATURE & BIO */}
        <section className="wz-pf-hero-split border-b border-[#1A1715]/20 py-6">
          <div className="relative mx-auto flex w-full max-w-[260px] items-center justify-center py-2">
            {/* Terracotta circular disc */}
            <div className="relative flex h-[200px] w-[200px] items-center justify-center rounded-full bg-[#C85A3F] p-3 shadow-[0_18px_38px_-18px_rgba(200,90,63,0.65)]">
              <div className="h-full w-full overflow-hidden rounded-full border-2 border-[#F6F2EA]/85 bg-[#1A1715]">
                {heroPhoto ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={heroPhoto}
                    alt={identity.displayName}
                    onError={() => setFailedUrls((prev) => ({ ...prev, [heroPhoto]: true }))}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <EditorialPortraitVector initials={identity.initials} />
                )}
              </div>

              {/* Rotating circular SVG stamp */}
              <svg
                aria-hidden="true"
                viewBox="0 0 120 120"
                className={`pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-[#F6F2EA] p-1 shadow-md ring-1 ring-[#1A1715]/15 ${
                  reducedMotion ? '' : 'wz-pf-spin-slow'
                }`}
              >
                <defs>
                  <path
                    id={`stamp-circle-${stampPathId}`}
                    d="M 60, 60 m -42, 0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
                  />
                </defs>
                <circle cx="60" cy="60" r="54" fill="none" stroke="#C85A3F" strokeOpacity="0.3" strokeWidth="1" />
                <text
                  fill="#1A1715"
                  fontSize="8.4"
                  fontWeight="700"
                  letterSpacing="2.1"
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                >
                  <textPath href={`#stamp-circle-${stampPathId}`}>
                    OPEN FOR NEW PROJECTS · WORLDWIDE ·
                  </textPath>
                </text>
                <circle cx="60" cy="60" r="5" fill="#C85A3F" />
              </svg>
            </div>
          </div>

          <div className="min-w-0 text-left">
            <p
              className="font-handwritten text-3xl font-bold italic leading-none text-[#C85A3F]"
              style={langSafe}
            >
              {identity.displayName}
            </p>
            <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#1A1715]/70">
              {identity.roleTitle}
            </p>
            <h2
              className="mt-3 font-editorial text-2xl leading-[1.15] text-[#1A1715]"
              style={langSafe}
            >
              {identity.headline}
            </h2>
            <p className="mt-2.5 font-sans text-xs leading-relaxed text-[#4C453E]">
              {identity.bio}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#1A1715] px-5 text-xs font-semibold text-[#F6F2EA] transition hover:bg-[#C85A3F] active:scale-95 motion-reduce:transition-none"
                >
                  {copy.inquiryCta}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleCopyBrief}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#1A1715] px-5 text-xs font-semibold text-[#F6F2EA] transition hover:bg-[#C85A3F] active:scale-95 motion-reduce:transition-none"
                >
                  {copiedContact ? copy.copiedContact : copy.copyContact}
                </button>
              )}
              <a
                href="#editorial-projects"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#1A1715]/30 px-4 text-xs font-semibold text-[#1A1715] transition hover:border-[#C85A3F] hover:text-[#C85A3F]"
              >
                Index 01–04
              </a>
            </div>
          </div>
        </section>

        {/* SELECTED PROJECTS (2-COL MOBILE / 4-COL WIDE CONTAINER) */}
        <section id="editorial-projects" className="border-b border-[#1A1715]/20 py-6">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <div>
              <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#C85A3F]">
                ARCHIVE INDEX
              </p>
              <h2 className="mt-0.5 font-heading text-lg font-bold tracking-tight text-[#1A1715]">
                SELECTED PROJECTS
              </h2>
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1A1715]/70">
              Tap to inspect
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
                  className="group flex min-h-[44px] flex-col overflow-hidden rounded-xl border border-[#1A1715]/15 bg-[#EFE9DD] p-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C85A3F] hover:shadow-md active:scale-[0.98] motion-reduce:transition-none"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#E4DCCB]">
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
                      <EditorialProjectArtwork index={idx} />
                    )}
                    <span className="absolute left-2 top-2 rounded bg-[#1A1715] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#F6F2EA]">
                      {project.num}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline justify-between gap-1 px-0.5">
                    <h3 className="truncate font-heading text-sm font-bold text-[#1A1715] group-hover:text-[#C85A3F]">
                      {project.title}
                    </h3>
                    <span className="shrink-0 font-mono text-[9px] text-[#1A1715]/70">
                      {project.year}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate px-0.5 font-mono text-[9.5px] uppercase tracking-wider text-[#5C554E]">
                    {project.deliverables[0]}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* SKILLS & EXPERTISE + EDITORIAL QUOTE + CAPABILITIES */}
        <section className="border-b border-[#1A1715]/20 py-6">
          <div className="wz-pf-grid-2">
            <div>
              <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#C85A3F]">
                PRACTICE & CRAFT
              </p>
              <h2 className="mt-0.5 font-heading text-lg font-bold tracking-tight text-[#1A1715]">
                SKILLS & EXPERTISE
              </h2>

              <div className="mt-4 space-y-3">
                {EDITORIAL_SKILLS.map((skill) => (
                  <div key={skill.label}>
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                      <span>{skill.label}</span>
                      <span className="font-mono text-[11px] font-bold text-[#C85A3F]">
                        {skill.percent}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#1A1715]/10">
                      <div
                        className="h-full rounded-full bg-[#C85A3F] transition-[width] duration-700 ease-out motion-reduce:transition-none"
                        style={{ width: skillBarReady ? `${skill.percent}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4">
              <blockquote
                className="rounded-xl border border-[#1A1715]/15 bg-[#EFE9DD] p-4 font-editorial text-xl italic leading-snug text-[#1A1715]"
                style={langSafe}
              >
                &ldquo;Clarity is not the absence of ornament; it is the discipline to keep only what moves the story forward.&rdquo;
              </blockquote>

              <div className="grid grid-cols-2 gap-2.5">
                {EDITORIAL_CAPABILITIES.map((cap) => (
                  <div
                    key={cap.num}
                    className="min-w-0 rounded-xl border border-[#1A1715]/12 bg-white/55 p-3"
                  >
                    <span className="font-mono text-[9.5px] font-bold text-[#C85A3F]">
                      {cap.num}
                    </span>
                    <h3 className="mt-1 break-words font-sans text-xs font-bold text-[#1A1715]">
                      {cap.title}
                    </h3>
                    <p className="mt-1 break-words text-[11px] leading-relaxed text-[#5C554E]">
                      {cap.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WHAT CLIENTS SAY */}
        <section className="border-b border-[#1A1715]/20 py-6">
          <div className="mb-3.5 flex items-baseline justify-between">
            <h2 className="font-heading text-lg font-bold tracking-tight text-[#1A1715]">
              WHAT CLIENTS SAY
            </h2>
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#C85A3F]">
              VERIFIED NOTES
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {EDITORIAL_REVIEWS.map((review, idx) => (
              <article
                key={review.id}
                className="flex flex-col justify-between rounded-xl border border-[#1A1715]/15 bg-[#FCF9F2] p-3.5 shadow-[0_6px_18px_-14px_rgba(26,23,21,0.35)]"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between font-mono text-[9px] font-bold text-[#1A1715]/65">
                    <span>SLIP 0{idx + 1}</span>
                    <span className="text-[#C85A3F]">5.0 / 5.0</span>
                  </div>
                  <p className="font-sans text-xs leading-relaxed text-[#2C2723]">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-3 border-t border-[#1A1715]/10 pt-2">
                  <p className="font-heading text-xs font-bold text-[#1A1715]">{review.author}</p>
                  <p className="font-mono text-[9.5px] text-[#5C554E]">{review.role}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* LET'S CREATE SOMETHING GREAT FOOTER */}
        <section className="pt-6">
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#1A1715] bg-[#1A1715] p-5 text-[#F6F2EA] sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#C85A3F]">
                NEXT COMMISSION
              </p>
              <h2 className="mt-1 font-zine text-3xl uppercase tracking-tight text-[#F6F2EA] sm:text-4xl">
                LET&apos;S CREATE SOMETHING GREAT
              </h2>
              <p className="mt-1.5 text-xs text-[#F6F2EA]/75">
                {identity.displayName} · {identity.cityTag}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#C85A3F] px-5 text-xs font-bold text-[#F6F2EA] transition hover:brightness-110 active:scale-95 motion-reduce:transition-none"
                  >
                    {copy.inquiryCta}
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={handleCopyBrief}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#F6F2EA]/30 bg-white/10 px-4 text-xs font-semibold text-[#F6F2EA] transition hover:bg-white/20 active:scale-95 motion-reduce:transition-none"
                >
                  {copiedContact ? copy.copiedContact : copy.copyContact}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start rounded-xl border border-[#F6F2EA]/15 bg-[#F6F2EA] p-2.5 text-[#1A1715] sm:self-center">
              <EditorialQrBadgeSvg />
              <div className="font-mono text-[9.5px] leading-snug">
                <p className="font-bold uppercase tracking-wider text-[#C85A3F]">DIRECT CARD</p>
                <p className="mt-0.5 font-semibold">{identity.initials} · STUDIO</p>
                <p className="text-[#5C554E]">24H RESPONSE</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* CASE STUDY MODAL */}
      {activeProject ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeProject.title}
          onClick={() => setActiveProject(null)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#1A1715]/20 bg-[#F6F2EA] p-5 text-[#1A1715] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#1A1715]/15 pb-3">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#C85A3F]">
                  CASE {activeProject.num} · {activeProject.year}
                </p>
                <h3 className="mt-1 font-heading text-xl font-bold text-[#1A1715]">
                  {activeProject.title}
                </h3>
                <p className="font-mono text-[10px] text-[#5C554E]">{activeProject.client}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                className="min-h-[44px] min-w-[44px] rounded-full border border-[#1A1715]/20 px-3 text-xs font-bold text-[#1A1715] transition hover:bg-[#1A1715] hover:text-[#F6F2EA]"
              >
                {copy.closeModal}
              </button>
            </div>

            <div className="mt-3.5 aspect-[16/10] w-full overflow-hidden rounded-xl border border-[#1A1715]/15 bg-[#EFE9DD]">
              {validPhotos[EDITORIAL_PROJECTS.findIndex((p) => p.id === activeProject.id) + 1] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={
                    validPhotos[EDITORIAL_PROJECTS.findIndex((p) => p.id === activeProject.id) + 1]
                  }
                  alt={activeProject.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <EditorialProjectArtwork
                  index={Math.max(
                    0,
                    EDITORIAL_PROJECTS.findIndex((p) => p.id === activeProject.id),
                  )}
                />
              )}
            </div>

            <p className="mt-3.5 font-sans text-xs leading-relaxed text-[#38322D]">
              {activeProject.summary}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="min-w-0 rounded-xl border border-[#1A1715]/12 bg-white/70 p-3">
                <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#5C554E]">
                  {copy.deliverablesLabel}
                </p>
                <ul className="mt-1.5 space-y-1 break-words text-[11px] font-semibold text-[#1A1715]">
                  {activeProject.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="flex min-w-0 flex-col justify-center rounded-xl border border-[#C85A3F]/30 bg-[#C85A3F]/10 p-3">
                <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#C85A3F]">
                  {copy.impactLabel}
                </p>
                <p className="mt-1 break-words font-heading text-xl font-bold text-[#1A1715] sm:text-2xl">
                  {activeProject.metricValue}
                </p>
                <p className="break-words font-mono text-[10px] text-[#5C554E]">
                  {activeProject.metricLabel}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {whatsappHref ? (
                <a
                  href={buildPortfolioWhatsAppUrl(
                    data.whatsappPhone,
                    `Hi ${identity.displayName}, I loved the "${activeProject.title}" case study and would like to discuss a similar project.`,
                  ) ?? whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-[#C85A3F] px-4 text-xs font-bold text-[#F6F2EA]"
                >
                  {copy.inquiryCta}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleCopyBrief();
                    setActiveProject(null);
                  }}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-[#1A1715] px-4 text-xs font-bold text-[#F6F2EA]"
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
