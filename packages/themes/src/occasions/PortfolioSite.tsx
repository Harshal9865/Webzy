'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { type CoreLanguageCode, pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import { getWebzyFooterLabel, type OccasionSiteProps } from './shared/OccasionPrimitives';
import { PortfolioDemoSwitcher } from './portfolio/PortfolioDemoSwitcher';
import { PortfolioEditorialTheme } from './portfolio/PortfolioEditorialTheme';
import { PortfolioKineticTheme } from './portfolio/PortfolioKineticTheme';
import { PortfolioLuxuryTheme } from './portfolio/PortfolioLuxuryTheme';
import {
  buildPortfolioWhatsAppUrl,
  getValidPortfolioPhotos,
  hiSafeStyle,
  parsePortfolioIdentity,
  type PortfolioThemeVariant,
  resolvePortfolioTheme,
} from './portfolio/portfolioTypes';

type DisciplineFilter = 'All' | 'Web' | 'Brand' | 'Motion';
type CollaborationTypeId = 'full-time' | 'freelance-sprint' | 'design-audit';
type TimelineBudgetId = 'sprint-2w' | 'standard-1m' | 'flagship-qtr' | 'retainer';

interface DeepDiveCaseStudy {
  id: string;
  num: string;
  title: string;
  discipline: Exclude<DisciplineFilter, 'All'>;
  year: string;
  metric: string;
  challenge: string;
  craft: string;
  outcome: string;
  deliverables: readonly string[];
  photo?: string;
}

const DISCIPLINE_FILTERS: readonly DisciplineFilter[] = ['All', 'Web', 'Brand', 'Motion'];

const DEFAULT_DEEP_DIVE_CASES: readonly DeepDiveCaseStudy[] = [
  {
    id: 'case-atelier-web',
    num: '01',
    title: 'Atelier Veda Flagship',
    discipline: 'Web',
    year: '2026',
    metric: '+64% Direct Inquiries',
    challenge:
      'Legacy storefront buried tactile craft photography inside slow, rigid grids that lost mobile visitors within seconds.',
    craft:
      'Re-architected into a modular Next.js editorial layout with container-responsive galleries, crisp typography, and sub-second first paint.',
    outcome:
      'Average session depth rose to 4m 18s and qualified studio inquiries climbed 64% in the first four weeks post-launch.',
    deliverables: ['Design Architecture', 'Next.js Build', 'Performance Audit'],
  },
  {
    id: 'case-linen-brand',
    num: '02',
    title: 'Linen & Form Identity',
    discipline: 'Brand',
    year: '2025',
    metric: '99/100 Lighthouse',
    challenge:
      'A growing object house lacked visual consistency across digital lookbooks, packaging tags, and wholesale decks.',
    craft:
      'Built a unified typographic hierarchy, warm archival color tokens, and reusable digital specimen templates across web and print.',
    outcome:
      'Cut campaign launch turnaround in half while lifting wholesale catalog completion rates across mobile tablets.',
    deliverables: ['Brand System', 'Typography Tokens', 'Digital Lookbook'],
  },
  {
    id: 'case-kinetic-motion',
    num: '03',
    title: 'Kinetic Audio Showcase',
    discipline: 'Motion',
    year: '2026',
    metric: '0.7s First Paint',
    challenge:
      'Spatial sound releases felt flat in static web embeds, yet heavy WebGL bundles hurt frame rates on mid-tier phones.',
    craft:
      'Engineered lightweight spring transitions, reactive SVG waveform telemetry, and full prefers-reduced-motion accessibility.',
    outcome:
      'Delivered fluid 60fps interaction on phones with 3.1x longer listening previews and zero layout shift.',
    deliverables: ['Motion Choreography', 'Interactive UI', 'Accessible Micro-FX'],
  },
  {
    id: 'case-signal-system',
    num: '04',
    title: 'Signal Workspace Kit',
    discipline: 'Web',
    year: '2026',
    metric: '-34% Flow Drop-Off',
    challenge:
      'Fragmented dashboard components slowed engineering velocity and introduced visual inconsistencies across onboarding.',
    craft:
      'Audited 40+ screens into a strict TypeScript component kit with keyboard-first navigation and clear visual hierarchy.',
    outcome:
      'Reduced onboarding drop-off by 34% and enabled product squads to ship new flows twice as fast.',
    deliverables: ['Design System', 'React Components', 'UX Audit'],
  },
];

const COLLAB_TYPES: ReadonlyArray<{
  id: CollaborationTypeId;
  label: Record<CoreLanguageCode, string>;
  note: Record<CoreLanguageCode, string>;
}> = [
  {
    id: 'full-time',
    label: {
      en: 'Full-Time Role',
      hinglish: 'Full-Time Role',
      hi: 'फुल-टाइम भूमिका',
    },
    note: {
      en: 'Staff / Lead Product Designer or Design Engineer role',
      hinglish: 'Staff / Lead Designer ya Design Engineer role',
      hi: 'लीड प्रोडक्ट डिज़ाइनर या डिज़ाइन इंजीनियर पद',
    },
  },
  {
    id: 'freelance-sprint',
    label: {
      en: 'Freelance Sprint',
      hinglish: 'Freelance Sprint',
      hi: 'फ्रीलांस स्प्रिंट',
    },
    note: {
      en: 'Focused website flagship, launch page, or MVP build',
      hinglish: 'Website flagship, launch page ya MVP build',
      hi: 'वेबसाइट फ्लैगशिप, लॉन्च पेज या MVP निर्माण',
    },
  },
  {
    id: 'design-audit',
    label: {
      en: 'Design System Audit',
      hinglish: 'Design System Audit',
      hi: 'डिज़ाइन सिस्टम ऑडिट',
    },
    note: {
      en: 'Token architecture, UI polish, speed & accessibility review',
      hinglish: 'Tokens, UI polish, speed aur accessibility review',
      hi: 'टोकन सिस्टम, UI पॉलिश और एक्सेसिबिलिटी समीक्षा',
    },
  },
];

const BUDGET_TIMELINE_PILLS: ReadonlyArray<{
  id: TimelineBudgetId;
  label: Record<CoreLanguageCode, string>;
  enSummary: string;
}> = [
  {
    id: 'sprint-2w',
    label: {
      en: '2 Weeks · Focused',
      hinglish: '2 Weeks · Fast Sprint',
      hi: '2 सप्ताह · तेज़ स्प्रिंट',
    },
    enSummary: '2 Weeks (Focused Sprint)',
  },
  {
    id: 'standard-1m',
    label: {
      en: '1 Month · Standard',
      hinglish: '1 Month · Standard',
      hi: '1 माह · मानक प्रोजेक्ट',
    },
    enSummary: '1 Month (Standard Scope)',
  },
  {
    id: 'flagship-qtr',
    label: {
      en: 'Quarter · Flagship',
      hinglish: 'Quarter · Flagship',
      hi: 'तिमाही · फ्लैगशिप',
    },
    enSummary: 'Quarter-Long Flagship Engagement',
  },
  {
    id: 'retainer',
    label: {
      en: 'Flexible / Retainer',
      hinglish: 'Flexible / Retainer',
      hi: 'लचीला / रिटेनर',
    },
    enSummary: 'Flexible / Monthly Retainer',
  },
];

interface PortfolioSuiteCopy {
  caseEyebrow: string;
  caseTitle: string;
  caseHint: string;
  disciplineLabels: Record<DisciplineFilter, string>;
  challengeLabel: string;
  craftLabel: string;
  outcomeLabel: string;
  expandLabel: string;
  collapseLabel: string;
  inquireSimilar: string;
  customWorkBadge: string;
  inquiryEyebrow: string;
  inquiryTitle: string;
  collabPrompt: string;
  timelinePrompt: string;
  whatsappCta: string;
  copyCta: string;
  copiedCta: string;
  briefPreviewLabel: string;
}

const SUITE_COPY: Record<CoreLanguageCode, PortfolioSuiteCopy> = {
  en: {
    caseEyebrow: 'INTERACTIVE ARCHIVE · FILTER & DEEP-DIVE',
    caseTitle: 'Case Study Deep-Dive',
    caseHint: 'Filter by discipline and tap any project to inspect Challenge -> Craft -> Outcome.',
    disciplineLabels: { All: 'All', Web: 'Web', Brand: 'Brand', Motion: 'Motion' },
    challengeLabel: '01 · Challenge',
    craftLabel: '02 · Craft',
    outcomeLabel: '03 · Outcome',
    expandLabel: 'Read Deep-Dive',
    collapseLabel: 'Close Brief',
    inquireSimilar: 'Inquire About Similar Build',
    customWorkBadge: 'Featured Project',
    inquiryEyebrow: 'QUICK PROJECT INQUIRY BUILDER',
    inquiryTitle: 'Configure Your Collaboration Brief',
    collabPrompt: 'Collaboration Type',
    timelinePrompt: 'Timeline / Scope Cadence',
    whatsappCta: 'Send Brief on WhatsApp',
    copyCta: 'Copy Inquiry Brief',
    copiedCta: 'Inquiry Brief Copied',
    briefPreviewLabel: 'LIVE BRIEF PREVIEW',
  },
  hinglish: {
    caseEyebrow: 'INTERACTIVE ARCHIVE · FILTER & DEEP-DIVE',
    caseTitle: 'Case Study Deep-Dive',
    caseHint: 'Discipline filter chunein aur kisi bhi project par tap karke Challenge -> Craft -> Outcome dekhein.',
    disciplineLabels: { All: 'All', Web: 'Web', Brand: 'Brand', Motion: 'Motion' },
    challengeLabel: '01 · Challenge',
    craftLabel: '02 · Craft',
    outcomeLabel: '03 · Outcome',
    expandLabel: 'Deep-Dive Kholein',
    collapseLabel: 'Band Karein',
    inquireSimilar: 'Aisa Project Banwayein',
    customWorkBadge: 'Featured Work',
    inquiryEyebrow: 'QUICK PROJECT INQUIRY BUILDER',
    inquiryTitle: 'Apna Collaboration Brief Tayyar Karein',
    collabPrompt: 'Collaboration Type',
    timelinePrompt: 'Timeline / Scope',
    whatsappCta: 'WhatsApp Par Bhejein',
    copyCta: 'Brief Copy Karein',
    copiedCta: 'Brief Copy Ho Gaya',
    briefPreviewLabel: 'LIVE BRIEF PREVIEW',
  },
  hi: {
    caseEyebrow: 'इंटरैक्टिव आर्काइव · फ़िल्टर और विवरण',
    caseTitle: 'केस स्टडी गहराई से देखें',
    caseHint: 'श्रेणी चुनें और किसी भी प्रोजेक्ट पर टैप कर चुनौती, शिल्प और परिणाम पढ़ें।',
    disciplineLabels: { All: 'सभी', Web: 'वेब', Brand: 'ब्रांड', Motion: 'मोशन' },
    challengeLabel: '01 · चुनौती',
    craftLabel: '02 · शिल्प व निर्माण',
    outcomeLabel: '03 · परिणाम',
    expandLabel: 'विवरण खोलें',
    collapseLabel: 'बंद करें',
    inquireSimilar: 'इसी तरह का प्रोजेक्ट पूछें',
    customWorkBadge: 'विशेष प्रोजेक्ट',
    inquiryEyebrow: 'त्वरित प्रोजेक्ट पूछताछ बिल्डर',
    inquiryTitle: 'अपना सहयोग विवरण तैयार करें',
    collabPrompt: 'सहयोग का प्रकार',
    timelinePrompt: 'समयसीमा और दायरा',
    whatsappCta: 'WhatsApp पर भेजें',
    copyCta: 'विवरण कॉपी करें',
    copiedCta: 'विवरण कॉपी हो गया',
    briefPreviewLabel: 'लाइव ब्रीफ़ पूर्वावलोकन',
  },
};

/**
 * Portfolio Flagship 3-Theme Experience Orchestrator:
 * - editorial: Terracotta Print archival paper (#F6F2EA), condensed masthead & numbered 01-04 case grid
 * - luxury: Couture Ivory (#F7F1E8) sunlit hero + Obsidian (#0E0D0C) works & process accordion
 * - kinetic: Obsidian Signal (#090A0E) live IST clock, magnetic tilt card, marquee & bento filter
 * - Enhanced across all 3 themes with Interactive Case Study Deep-Dive Drawer & Filterable Discipline Bar
 *   plus Quick Project Inquiry Builder wired directly to WhatsApp or 1-tap clipboard copy.
 */
export function PortfolioSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const autoVariant = resolvePortfolioTheme(data.relation);
  const [manualVariant, setManualVariant] = useState<PortfolioThemeVariant | null>(null);
  const [sceneKey, setSceneKey] = useState(0);
  const openedOnceRef = useRef(false);
  const inquiryRef = useRef<HTMLElement | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionId = useId().replace(/:/g, '');

  const [activeDiscipline, setActiveDiscipline] = useState<DisciplineFilter>('All');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(DEFAULT_DEEP_DIVE_CASES[0].id);
  const [collabType, setCollabType] = useState<CollaborationTypeId>('freelance-sprint');
  const [timelineBudget, setTimelineBudget] = useState<TimelineBudgetId>('sprint-2w');
  const [referencedProject, setReferencedProject] = useState<string | null>(null);
  const [copiedInquiry, setCopiedInquiry] = useState(false);
  const [failedThumbUrls, setFailedThumbUrls] = useState<Record<string, boolean>>({});

  // Sync automatically when buyer switches theme style inside CreateWizardClient
  useEffect(() => {
    setManualVariant(null);
    setSceneKey((prev) => prev + 1);
  }, [data.relation]);

  useEffect(() => {
    if (openedOnceRef.current) return;
    openedOnceRef.current = true;
    onOpened?.();
  }, [onOpened]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
        copyTimerRef.current = null;
      }
    };
  }, []);

  const activeVariant: PortfolioThemeVariant =
    watermarked && manualVariant ? manualVariant : autoVariant;
  const coreLang = toCoreLanguageCode(language);
  const suiteCopy = SUITE_COPY[coreLang] ?? SUITE_COPY.en;
  const langSafe = hiSafeStyle(language);

  const identity = useMemo(
    () => parsePortfolioIdentity(data, language),
    [data, language],
  );
  const offerTagText = useMemo(
    () => (data.offerTag ? pickLocalizedText(data.offerTag, language).trim() : ''),
    [data.offerTag, language],
  );
  const validPhotos = useMemo(
    () => getValidPortfolioPhotos(data.photos, failedThumbUrls),
    [data.photos, failedThumbUrls],
  );

  // Cleanly populate featured projects from data.highlights when buyer customizes them
  const deepDiveCases = useMemo<DeepDiveCaseStudy[]>(() => {
    const rawHighlights = Array.isArray(data.highlights) ? data.highlights : [];
    const customHighlights = rawHighlights
      .map((item) => ({
        title: item?.title ? pickLocalizedText(item.title, language).trim() : '',
        detail: item?.detail ? pickLocalizedText(item.detail, language).trim() : '',
      }))
      .filter((item) => item.title.length > 0 || item.detail.length > 0);

    const disciplinesCycle: ReadonlyArray<Exclude<DisciplineFilter, 'All'>> = [
      'Web',
      'Brand',
      'Motion',
      'Web',
    ];

    if (customHighlights.length === 0) {
      return DEFAULT_DEEP_DIVE_CASES.map((item, idx) => ({
        ...item,
        photo: validPhotos[idx + 1] ?? validPhotos[idx],
      }));
    }

    const totalSlots = Math.max(DEFAULT_DEEP_DIVE_CASES.length, customHighlights.length);
    return Array.from({ length: totalSlots }, (_, idx) => {
      const base = DEFAULT_DEEP_DIVE_CASES[idx % DEFAULT_DEEP_DIVE_CASES.length];
      const custom = customHighlights[idx];
      const num = String(idx + 1).padStart(2, '0');
      const photo = validPhotos[idx + 1] ?? validPhotos[idx];
      if (!custom) {
        return { ...base, num, photo };
      }
      return {
        ...base,
        id: idx < DEFAULT_DEEP_DIVE_CASES.length ? base.id : `custom-case-${idx}`,
        num,
        title: custom.title || base.title,
        discipline: disciplinesCycle[idx % disciplinesCycle.length],
        craft: custom.detail || base.craft,
        photo,
      };
    });
  }, [data.highlights, language, validPhotos]);

  const filteredCases = useMemo(() => {
    if (activeDiscipline === 'All') return deepDiveCases;
    return deepDiveCases.filter((item) => item.discipline === activeDiscipline);
  }, [deepDiveCases, activeDiscipline]);

  const activeCollab =
    COLLAB_TYPES.find((c) => c.id === collabType) ?? COLLAB_TYPES[0];
  const activeTimeline =
    BUDGET_TIMELINE_PILLS.find((t) => t.id === timelineBudget) ?? BUDGET_TIMELINE_PILLS[0];

  const inquiryBriefText = useMemo(() => {
    const parts = [
      `Hi ${identity.displayName}, I reviewed your portfolio and would like to explore a ${activeCollab.label.en}.`,
      `Target Cadence: ${activeTimeline.enSummary}.`,
      referencedProject ? `Reference Case Study: ${referencedProject}.` : '',
      offerTagText ? `Noted Availability: ${offerTagText}.` : '',
    ].filter(Boolean);
    return parts.join(' ');
  }, [
    identity.displayName,
    activeCollab.label.en,
    activeTimeline.enSummary,
    referencedProject,
    offerTagText,
  ]);

  const inquiryWhatsappHref = useMemo(
    () => buildPortfolioWhatsAppUrl(data.whatsappPhone, inquiryBriefText),
    [data.whatsappPhone, inquiryBriefText],
  );

  const handleCopyInquiry = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(inquiryBriefText).catch(() => {});
    }
    setCopiedInquiry(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedInquiry(false), 2400);
  }, [inquiryBriefText]);

  function handleSelectDemoVariant(nextVariant: PortfolioThemeVariant) {
    setManualVariant(nextVariant);
    setSceneKey((prev) => prev + 1);
  }

  function handleInquireSimilar(projectTitle: string) {
    setReferencedProject(projectTitle);
    setCollabType('freelance-sprint');
    inquiryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const outerBgColor =
    activeVariant === 'kinetic'
      ? '#090A0E'
      : activeVariant === 'luxury'
        ? '#0E0D0C'
        : '#F6F2EA';

  const footerTextColor =
    activeVariant === 'editorial' ? 'text-[#1A1715]/60' : 'text-[#F7F1E8]/65';

  const isDarkBanner = activeVariant === 'kinetic';

  const suitePalette = useMemo(() => {
    if (activeVariant === 'kinetic') {
      return {
        isDark: true,
        sectionBg: '#090A0E',
        cardBg: '#11131A',
        subCardBg: '#161923',
        ink: '#F5F5F0',
        mutedInk: '#A1A6B4',
        border: 'rgba(255,255,255,0.14)',
        accent: '#D9F99D',
        accentInk: '#090A0E',
        secondaryAccent: '#FBBF24',
      };
    }
    if (activeVariant === 'luxury') {
      return {
        isDark: true,
        sectionBg: '#0E0D0C',
        cardBg: '#171513',
        subCardBg: '#201C18',
        ink: '#F7F1E8',
        mutedInk: '#C2B4A2',
        border: 'rgba(247,241,232,0.16)',
        accent: '#D8C3A5',
        accentInk: '#14110E',
        secondaryAccent: '#E6D7C3',
      };
    }
    return {
      isDark: false,
      sectionBg: '#F6F2EA',
      cardBg: '#FFFFFF',
      subCardBg: '#FAF6EE',
      ink: '#1A1715',
      mutedInk: '#5A524C',
      border: 'rgba(26,23,21,0.16)',
      accent: '#C85A3F',
      accentInk: '#FAF6F0',
      secondaryAccent: '#1A1715',
    };
  }, [activeVariant]);

  return (
    <div
      className="relative flex min-h-full w-full flex-col justify-between overflow-x-clip rounded-[28px]"
      style={{ backgroundColor: outerBgColor }}
    >
      {watermarked ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none relative z-30 flex justify-center border-b py-1.5 font-mono text-[10px] font-bold tracking-[0.18em] ${
            isDarkBanner
              ? 'border-white/15 bg-[#11131A]/90 text-[#D9F99D]'
              : activeVariant === 'luxury'
                ? 'border-[#181512]/15 bg-[#EFE7DA]/90 text-[#181512]/75'
                : 'border-[#1A1715]/15 bg-white/80 text-[#1A1715]/75'
          }`}
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      {/* Customized Offer / Availability Tag Ribbon (renders cleanly across all 3 portfolio themes) */}
      {offerTagText ? (
        <div
          className="relative z-20 flex items-center justify-center gap-2 border-b px-4 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{
            backgroundColor: suitePalette.cardBg,
            borderColor: suitePalette.border,
            color: suitePalette.accent,
            ...langSafe,
          }}
        >
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: suitePalette.accent }}
            aria-hidden="true"
          />
          <span className="truncate">{offerTagText}</span>
        </div>
      ) : null}

      <div className="relative flex flex-1 flex-col">
        {activeVariant === 'editorial' ? (
          <PortfolioEditorialTheme
            key={`editorial-${sceneKey}`}
            manifest={manifest}
            data={data}
            language={language}
            watermarked={watermarked}
            onOpened={onOpened}
          />
        ) : activeVariant === 'luxury' ? (
          <PortfolioLuxuryTheme
            key={`luxury-${sceneKey}`}
            manifest={manifest}
            data={data}
            language={language}
            watermarked={watermarked}
            onOpened={onOpened}
          />
        ) : (
          <PortfolioKineticTheme
            key={`kinetic-${sceneKey}`}
            manifest={manifest}
            data={data}
            language={language}
            watermarked={watermarked}
            onOpened={onOpened}
          />
        )}

        {/* =================================================================== */}
        {/* INTERACTIVE CASE STUDY DEEP-DIVE DRAWER + FILTERABLE DISCIPLINE BAR */}
        {/* =================================================================== */}
        <section
          aria-labelledby={`pf-cases-heading-${sectionId}`}
          className="relative z-10 border-t px-3.5 py-8 sm:px-6 sm:py-10"
          style={{
            backgroundColor: suitePalette.sectionBg,
            borderColor: suitePalette.border,
            color: suitePalette.ink,
          }}
        >
          <div className="mx-auto max-w-[1040px]">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="max-w-xl">
                <p
                  className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: suitePalette.accent }}
                >
                  {suiteCopy.caseEyebrow}
                </p>
                <h2
                  id={`pf-cases-heading-${sectionId}`}
                  className="mt-1 font-editorial text-2xl leading-tight sm:text-3xl"
                  style={langSafe}
                >
                  {suiteCopy.caseTitle}
                </h2>
                <p
                  className="mt-1 text-xs leading-relaxed sm:text-sm"
                  style={{ color: suitePalette.mutedInk, ...langSafe }}
                >
                  {suiteCopy.caseHint}
                </p>
              </div>

              {/* Filterable Discipline Bar: All / Web / Brand / Motion */}
              <div
                role="tablist"
                aria-label="Filter projects by discipline"
                className="flex flex-wrap items-center gap-1.5"
              >
                {DISCIPLINE_FILTERS.map((discipline) => {
                  const isActive = activeDiscipline === discipline;
                  return (
                    <button
                      key={discipline}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setActiveDiscipline(discipline);
                        const nextList =
                          discipline === 'All'
                            ? deepDiveCases
                            : deepDiveCases.filter((item) => item.discipline === discipline);
                        if (nextList.length > 0 && !nextList.some((c) => c.id === expandedCaseId)) {
                          setExpandedCaseId(nextList[0].id);
                        }
                      }}
                      className="min-h-[44px] rounded-full border px-4 py-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] transition-all active:scale-95"
                      style={
                        isActive
                          ? {
                              backgroundColor: suitePalette.accent,
                              borderColor: suitePalette.accent,
                              color: suitePalette.accentInk,
                            }
                          : {
                              backgroundColor: suitePalette.cardBg,
                              borderColor: suitePalette.border,
                              color: suitePalette.ink,
                            }
                      }
                    >
                      {suiteCopy.disciplineLabels[discipline]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expandable Case Study Cards with Inline Deep-Dive Drawer */}
            <div className="mt-5 space-y-3">
              {filteredCases.map((project) => {
                const isOpen = expandedCaseId === project.id;
                return (
                  <article
                    key={project.id}
                    className="overflow-hidden rounded-2xl border transition-colors"
                    style={{
                      backgroundColor: suitePalette.cardBg,
                      borderColor: isOpen ? suitePalette.accent : suitePalette.border,
                    }}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setExpandedCaseId(isOpen ? null : project.id)}
                      className="flex min-h-[68px] w-full flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:opacity-95 sm:px-5"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-mono text-xs font-bold"
                          style={{
                            borderColor: isOpen ? suitePalette.accent : suitePalette.border,
                            backgroundColor: isOpen ? suitePalette.accent : suitePalette.subCardBg,
                            color: isOpen ? suitePalette.accentInk : suitePalette.ink,
                          }}
                        >
                          {project.num}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="rounded-full border px-2 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.14em]"
                              style={{
                                borderColor: suitePalette.border,
                                color: suitePalette.accent,
                              }}
                            >
                              {suiteCopy.disciplineLabels[project.discipline]}
                            </span>
                            <span
                              className="font-mono text-[9.5px] uppercase tracking-[0.14em]"
                              style={{ color: suitePalette.mutedInk }}
                            >
                              {project.year}
                            </span>
                          </div>
                          <h3
                            className="mt-0.5 truncate font-editorial text-lg leading-snug sm:text-xl"
                            style={langSafe}
                          >
                            {project.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span
                          className="hidden rounded-full px-3 py-1 font-mono text-[10px] font-bold sm:inline-block"
                          style={{
                            backgroundColor: suitePalette.subCardBg,
                            color: suitePalette.secondaryAccent,
                          }}
                        >
                          {project.metric}
                        </span>
                        <span
                          className="inline-flex min-h-[36px] items-center rounded-full border px-3 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em]"
                          style={{
                            borderColor: suitePalette.border,
                            color: suitePalette.ink,
                          }}
                        >
                          {isOpen ? suiteCopy.collapseLabel : suiteCopy.expandLabel}
                        </span>
                      </div>
                    </button>

                    {/* Expanded Challenge -> Craft -> Outcome Deep-Dive Drawer */}
                    {isOpen ? (
                      <div
                        className="border-t px-4 pb-5 pt-4 sm:px-5"
                        style={{
                          borderColor: suitePalette.border,
                          backgroundColor: suitePalette.subCardBg,
                        }}
                      >
                        {project.photo && !failedThumbUrls[project.photo] ? (
                          <div
                            className="mb-4 aspect-[21/8] w-full overflow-hidden rounded-xl border"
                            style={{ borderColor: suitePalette.border }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={project.photo}
                              alt={project.title}
                              loading="lazy"
                              onError={() =>
                                setFailedThumbUrls((prev) => ({
                                  ...prev,
                                  [project.photo as string]: true,
                                }))
                              }
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : null}

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div
                            className="rounded-xl border p-3.5"
                            style={{
                              borderColor: suitePalette.border,
                              backgroundColor: suitePalette.cardBg,
                            }}
                          >
                            <p
                              className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em]"
                              style={{ color: suitePalette.accent }}
                            >
                              {suiteCopy.challengeLabel}
                            </p>
                            <p
                              className="mt-1.5 text-xs leading-relaxed"
                              style={{ color: suitePalette.mutedInk, ...langSafe }}
                            >
                              {project.challenge}
                            </p>
                          </div>

                          <div
                            className="rounded-xl border p-3.5"
                            style={{
                              borderColor: suitePalette.border,
                              backgroundColor: suitePalette.cardBg,
                            }}
                          >
                            <p
                              className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em]"
                              style={{ color: suitePalette.accent }}
                            >
                              {suiteCopy.craftLabel}
                            </p>
                            <p
                              className="mt-1.5 text-xs leading-relaxed"
                              style={{ color: suitePalette.mutedInk, ...langSafe }}
                            >
                              {project.craft}
                            </p>
                          </div>

                          <div
                            className="rounded-xl border p-3.5"
                            style={{
                              borderColor: suitePalette.accent,
                              backgroundColor: suitePalette.cardBg,
                            }}
                          >
                            <p
                              className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em]"
                              style={{ color: suitePalette.accent }}
                            >
                              {suiteCopy.outcomeLabel}
                            </p>
                            <p
                              className="mt-1 font-editorial text-lg font-semibold"
                              style={{ color: suitePalette.ink }}
                            >
                              {project.metric}
                            </p>
                            <p
                              className="mt-1 text-xs leading-relaxed"
                              style={{ color: suitePalette.mutedInk, ...langSafe }}
                            >
                              {project.outcome}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap gap-1.5">
                            {project.deliverables.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border px-2.5 py-1 font-mono text-[9.5px] font-semibold"
                                style={{
                                  borderColor: suitePalette.border,
                                  color: suitePalette.mutedInk,
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleInquireSimilar(project.title)}
                            className="inline-flex min-h-[44px] items-center rounded-full px-4 text-xs font-bold transition hover:opacity-90 active:scale-95"
                            style={{
                              backgroundColor: suitePalette.accent,
                              color: suitePalette.accentInk,
                            }}
                          >
                            {suiteCopy.inquireSimilar}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* QUICK PROJECT INQUIRY BUILDER (WHATSAPP + 1-TAP COPY)               */}
        {/* =================================================================== */}
        <section
          ref={inquiryRef}
          aria-labelledby={`pf-inquiry-heading-${sectionId}`}
          className="relative z-10 border-t px-3.5 py-8 sm:px-6 sm:py-10"
          style={{
            backgroundColor: suitePalette.sectionBg,
            borderColor: suitePalette.border,
            color: suitePalette.ink,
          }}
        >
          <div className="mx-auto max-w-[1040px]">
            <div
              className="rounded-[24px] border p-4 shadow-sm sm:p-6"
              style={{
                backgroundColor: suitePalette.cardBg,
                borderColor: suitePalette.border,
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4" style={{ borderColor: suitePalette.border }}>
                <div>
                  <p
                    className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: suitePalette.accent }}
                  >
                    {suiteCopy.inquiryEyebrow}
                  </p>
                  <h2
                    id={`pf-inquiry-heading-${sectionId}`}
                    className="mt-1 font-editorial text-2xl leading-tight sm:text-3xl"
                    style={langSafe}
                  >
                    {suiteCopy.inquiryTitle}
                  </h2>
                </div>
                {offerTagText ? (
                  <span
                    className="rounded-full border px-3 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.14em]"
                    style={{
                      borderColor: suitePalette.accent,
                      color: suitePalette.accent,
                    }}
                  >
                    {offerTagText}
                  </span>
                ) : null}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-4">
                  {/* Step 1: Collaboration Type */}
                  <div>
                    <p
                      className="mb-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.16em]"
                      style={{ color: suitePalette.mutedInk }}
                    >
                      {suiteCopy.collabPrompt}
                    </p>
                    <div
                      role="radiogroup"
                      aria-label={suiteCopy.collabPrompt}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                    >
                      {COLLAB_TYPES.map((option) => {
                        const isSelected = option.id === collabType;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => setCollabType(option.id)}
                            className="flex min-h-[58px] flex-col justify-center rounded-2xl border px-3.5 py-2.5 text-left transition active:scale-[0.98]"
                            style={
                              isSelected
                                ? {
                                    backgroundColor: suitePalette.accent,
                                    borderColor: suitePalette.accent,
                                    color: suitePalette.accentInk,
                                  }
                                : {
                                    backgroundColor: suitePalette.subCardBg,
                                    borderColor: suitePalette.border,
                                    color: suitePalette.ink,
                                  }
                            }
                          >
                            <span className="text-xs font-extrabold leading-snug" style={langSafe}>
                              {option.label[coreLang]}
                            </span>
                            <span className="mt-0.5 line-clamp-2 text-[10px] leading-tight opacity-80">
                              {option.note[coreLang]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Budget / Timeline Pills */}
                  <div>
                    <p
                      className="mb-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.16em]"
                      style={{ color: suitePalette.mutedInk }}
                    >
                      {suiteCopy.timelinePrompt}
                    </p>
                    <div
                      role="radiogroup"
                      aria-label={suiteCopy.timelinePrompt}
                      className="flex flex-wrap gap-2"
                    >
                      {BUDGET_TIMELINE_PILLS.map((pill) => {
                        const isSelected = pill.id === timelineBudget;
                        return (
                          <button
                            key={pill.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => setTimelineBudget(pill.id)}
                            className="min-h-[44px] rounded-full border px-3.5 py-2 text-xs font-bold transition active:scale-95"
                            style={
                              isSelected
                                ? {
                                    backgroundColor: suitePalette.secondaryAccent,
                                    borderColor: suitePalette.secondaryAccent,
                                    color: suitePalette.isDark ? '#090A0E' : '#FAF6F0',
                                  }
                                : {
                                    backgroundColor: suitePalette.subCardBg,
                                    borderColor: suitePalette.border,
                                    color: suitePalette.ink,
                                  }
                            }
                          >
                            {pill.label[coreLang]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Live Brief Preview & Dispatch CTAs */}
                <div
                  className="flex flex-col justify-between rounded-2xl border p-4"
                  style={{
                    backgroundColor: suitePalette.subCardBg,
                    borderColor: suitePalette.border,
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-mono text-[9px] font-bold uppercase tracking-[0.18em]"
                        style={{ color: suitePalette.accent }}
                      >
                        {suiteCopy.briefPreviewLabel}
                      </span>
                      {referencedProject ? (
                        <button
                          type="button"
                          onClick={() => setReferencedProject(null)}
                          className="font-mono text-[9px] uppercase underline underline-offset-2 opacity-75 hover:opacity-100"
                        >
                          Clear ref
                        </button>
                      ) : null}
                    </div>
                    <p
                      className="mt-2.5 text-xs leading-relaxed"
                      style={{ color: suitePalette.ink }}
                    >
                      &ldquo;{inquiryBriefText}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {inquiryWhatsappHref ? (
                      <a
                        href={inquiryWhatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full bg-[#16A34A] px-4 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#15803D] active:scale-[0.98]"
                      >
                        <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
                          <path d="M10 2a8 8 0 0 0-6.86 12.1L2 18l4.02-1.08A8 8 0 1 0 10 2Zm3.95 11.15c-.17.47-.98.9-1.36.96-.35.05-.79.08-1.27-.08-.3-.1-.68-.22-1.17-.43-2.06-.89-3.4-2.98-3.5-3.12-.1-.14-.84-1.11-.84-2.12 0-1.01.53-1.51.72-1.71.19-.21.41-.26.55-.26h.4c.13 0 .3-.05.47.36.17.42.59 1.44.64 1.54.05.11.09.23.02.37-.07.14-.11.23-.22.36-.11.12-.23.28-.33.37-.11.11-.22.23-.1.45.12.22.55.9 1.18 1.46.81.72 1.49.95 1.71 1.06.22.11.35.09.48-.05.13-.14.55-.64.7-.86.15-.22.3-.18.5-.11.2.07 1.29.61 1.51.72.22.11.37.16.42.26.06.09.06.55-.11 1.02Z" />
                        </svg>
                        <span>{suiteCopy.whatsappCta}</span>
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleCopyInquiry}
                      className="inline-flex min-h-[46px] flex-1 items-center justify-center rounded-full border px-4 text-xs font-bold transition active:scale-[0.98]"
                      style={
                        inquiryWhatsappHref
                          ? {
                              borderColor: suitePalette.border,
                              backgroundColor: suitePalette.cardBg,
                              color: suitePalette.ink,
                            }
                          : {
                              borderColor: suitePalette.accent,
                              backgroundColor: suitePalette.accent,
                              color: suitePalette.accentInk,
                            }
                      }
                    >
                      {copiedInquiry ? suiteCopy.copiedCta : suiteCopy.copyCta}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer
        className={`relative z-20 px-4 pb-4 pt-3 text-center text-[11px] font-medium ${footerTextColor}`}
      >
        {getWebzyFooterLabel(language)}
      </footer>

      {watermarked ? (
        <PortfolioDemoSwitcher
          activeVariant={activeVariant}
          language={coreLang}
          onSelect={handleSelectDemoVariant}
        />
      ) : null}
    </div>
  );
}
