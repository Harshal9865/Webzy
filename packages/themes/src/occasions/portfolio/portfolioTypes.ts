'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { type CoreLanguageCode, type LanguageCode, pickLocalizedText } from '@webzy/core';
import type { ThemeDemoPayload, ThemeManifest } from '../../schema';

export type PortfolioThemeVariant = 'editorial' | 'luxury' | 'kinetic';

export interface PortfolioThemeComponentProps {
  manifest: ThemeManifest;
  data: ThemeDemoPayload;
  language: LanguageCode;
  watermarked?: boolean;
  onOpened?: () => void;
}

export interface ParsedPortfolioIdentity {
  displayName: string;
  roleTitle: string;
  cityTag: string;
  headline: string;
  bio: string;
  initials: string;
}

export interface PortfolioProjectCase {
  id: string;
  num: string;
  title: string;
  category: 'Web Apps' | 'Brand' | '3D' | 'Editorial' | 'Couture';
  year: string;
  client: string;
  summary: string;
  deliverables: string[];
  metricLabel: string;
  metricValue: string;
  accentHex: string;
}

export interface PortfolioSkillItem {
  label: string;
  percent: number;
}

export interface PortfolioClientNote {
  id: string;
  quote: string;
  author: string;
  role: string;
}

export interface PortfolioProcessStep {
  num: string;
  title: string;
  summary: string;
  deliverables: string[];
}

export const PORTFOLIO_CONTAINER_CSS = `
.wz-pf-root {
  container-type: inline-size;
  container-name: portfolio-shell;
}
.wz-pf-grid-2 {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}
.wz-pf-grid-4 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}
.wz-pf-hero-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
}
.wz-pf-bento {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.875rem;
}
.wz-pf-bento-lead {
  grid-column: span 1 / span 1;
}
@container portfolio-shell (min-width: 560px) {
  .wz-pf-grid-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
  }
  .wz-pf-grid-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
  }
  .wz-pf-hero-split {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 2rem;
    align-items: center;
  }
  .wz-pf-bento {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
  .wz-pf-bento-lead {
    grid-column: span 2 / span 2;
  }
}
@keyframes wzPfSpinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes wzPfMarquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}
.wz-pf-spin-slow {
  animation: wzPfSpinSlow 24s linear infinite;
}
.wz-pf-marquee-track {
  display: flex;
  width: max-content;
  animation: wzPfMarquee 22s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .wz-pf-spin-slow,
  .wz-pf-marquee-track {
    animation: none !important;
  }
}
`;

const LUXURY_KEYWORDS = ['luxury', 'couture', 'atelier', 'ivory', 'editorial-luxury'];
const KINETIC_KEYWORDS = ['kinetic', 'studio', 'dev', 'developer', 'signal', 'zine', 'tech'];

/** Maps buyer relation / style choice deterministically to 1 of 3 Portfolio themes. */
export function resolvePortfolioTheme(relation?: string): PortfolioThemeVariant {
  const normalized = (relation ?? '').trim().toLowerCase();
  if (!normalized) return 'editorial';
  for (const kw of LUXURY_KEYWORDS) {
    if (normalized.includes(kw)) return 'luxury';
  }
  for (const kw of KINETIC_KEYWORDS) {
    if (normalized.includes(kw)) return 'kinetic';
  }
  return 'editorial';
}

export function usePortfolioReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    return undefined;
  }, []);

  return reduced;
}

export function getValidPortfolioPhotos(
  photos?: string[],
  failedUrls?: Record<string, boolean>,
): string[] {
  if (!Array.isArray(photos)) return [];
  return photos
    .map((u) => (typeof u === 'string' ? u.trim() : ''))
    .filter((u) => u.length > 0 && !(failedUrls && failedUrls[u]))
    .slice(0, 6);
}

export function getInitials(name: string): string {
  const tokens = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return 'AM';
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return `${tokens[0][0] ?? ''}${tokens[tokens.length - 1][0] ?? ''}`.toUpperCase();
}

export function parsePortfolioIdentity(
  data: ThemeDemoPayload,
  language: LanguageCode,
  defaultRole = 'WEB DESIGNER & DIGITAL CREATIVE',
): ParsedPortfolioIdentity {
  const rawReceiver = (data.receiverName ?? '').trim();
  const segments = rawReceiver
    ? rawReceiver
        .split(/\s*(?:\||—|–|\s-\s)\s*/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const displayName = segments[0] || 'Aarav Mehta';
  const roleTitle = segments[1] || defaultRole;
  const cityTag = (data.senderName ?? '').trim() || 'Bengaluru · Remote Worldwide';
  const headline =
    pickLocalizedText(data.headline, language).trim() ||
    'Digital products shaped with archival clarity and tactile precision.';
  const bio =
    pickLocalizedText(data.message, language).trim() ||
    'Independent designer and frontend engineer crafting editorial websites, brand systems, and expressive interfaces for thoughtful studios.';

  return {
    displayName,
    roleTitle,
    cityTag,
    headline,
    bio,
    initials: getInitials(displayName),
  };
}

export function buildPortfolioWhatsAppUrl(phone?: string, message?: string): string | null {
  const digits = (phone ?? '').replace(/[^\d]/g, '');
  if (digits.length < 7) return null;
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${normalized}${text}`;
}

export function hiSafeStyle(language: LanguageCode): React.CSSProperties | undefined {
  if (language === 'hi') {
    return {
      fontStyle: 'normal',
      letterSpacing: '0em',
    };
  }
  return undefined;
}

export const EDITORIAL_PROJECTS: readonly PortfolioProjectCase[] = [
  {
    id: 'studio-atelier',
    num: '01',
    title: 'Studio Atelier',
    category: 'Editorial',
    year: '2026',
    client: 'Atelier Veda, Mumbai',
    summary:
      'Bespoke digital flagship for a textile and object studio, pairing linen-textured grids with tactile lookbook navigation.',
    deliverables: ['Art Direction', 'Design System', 'Next.js Storefront'],
    metricLabel: 'Avg. Session',
    metricValue: '4m 18s',
    accentHex: '#C85A3F',
  },
  {
    id: 'linen-form',
    num: '02',
    title: 'Linen & Form',
    category: 'Brand',
    year: '2025',
    client: 'Linen & Form Objects',
    summary:
      'Minimal product monograph and wholesale catalog engineered for rapid visual browsing across mobile and desktop.',
    deliverables: ['Visual Identity', 'Typography System', 'Interactive Index'],
    metricLabel: 'Inquiry Lift',
    metricValue: '+64%',
    accentHex: '#9C422B',
  },
  {
    id: 'the-journal',
    num: '03',
    title: 'The Journal',
    category: 'Editorial',
    year: '2025',
    client: 'Monograph Quarterly',
    summary:
      'Long-form architectural reading room featuring footnoted essays, responsive print columns, and archival photography plates.',
    deliverables: ['Editorial Layout', 'Reading Mode', 'Performance Tuning'],
    metricLabel: 'Lighthouse',
    metricValue: '99 / 100',
    accentHex: '#2B2521',
  },
  {
    id: 'kinetic-lab',
    num: '04',
    title: 'Kinetic Lab',
    category: 'Web Apps',
    year: '2026',
    client: 'Kinetic Sound Collective',
    summary:
      'Interactive showcase for spatial audio releases with custom SVG wave scopes and instant track previews.',
    deliverables: ['Motion Choreography', 'Web Audio UI', 'Frontend Build'],
    metricLabel: 'First Paint',
    metricValue: '0.7s',
    accentHex: '#C85A3F',
  },
];

export const EDITORIAL_SKILLS: readonly PortfolioSkillItem[] = [
  { label: 'UI / UX Design', percent: 95 },
  { label: 'Frontend Engineering', percent: 92 },
  { label: 'Brand Systems', percent: 88 },
  { label: 'Motion & Perf', percent: 90 },
];

export const EDITORIAL_CAPABILITIES: readonly { num: string; title: string; detail: string }[] = [
  {
    num: '01',
    title: 'Interface Architecture',
    detail: 'Structured component libraries and responsive layouts tuned for every viewport.',
  },
  {
    num: '02',
    title: 'Editorial Web',
    detail: 'Print-inspired typography, crisp pacing, and purposeful visual storytelling.',
  },
  {
    num: '03',
    title: 'Design Engineering',
    detail: 'Production TypeScript and React builds shipped with zero layout shift.',
  },
  {
    num: '04',
    title: 'Motion & Craft',
    detail: 'Hardware-friendly micro-interactions with reduced-motion respect.',
  },
];

export const EDITORIAL_REVIEWS: readonly PortfolioClientNote[] = [
  {
    id: 'rev-1',
    quote:
      'Every typographic detail and interaction felt intentional. Our new site doubled direct studio inquiries in three weeks.',
    author: 'Meera Nair',
    role: 'Founder, Atelier Veda',
  },
  {
    id: 'rev-2',
    quote:
      'Rare combination of editorial restraint and clean frontend engineering. Zero bloat, effortlessly fast on mobile.',
    author: 'Rohan Kulkarni',
    role: 'Creative Director, Monograph',
  },
  {
    id: 'rev-3',
    quote:
      'Turned an abstract brand vision into a cohesive system our product team could ship from on day one.',
    author: 'Nisha Kapoor',
    role: 'Head of Product, Kora Labs',
  },
];

export const LUXURY_PROJECTS: readonly PortfolioProjectCase[] = [
  {
    id: 'velure-couture',
    num: '01',
    title: 'Velure Couture',
    category: 'Couture',
    year: '2026',
    client: 'Maison Velure',
    summary:
      'Private digital salon and seasonal lookbook draped in warm ivory typography, deep obsidian contrast, and appointment booking.',
    deliverables: ['Couture Direction', 'Private Lookbook', 'Concierge Flow'],
    metricLabel: 'Private Bookings',
    metricValue: '3.2x',
    accentHex: '#D8C3A5',
  },
  {
    id: 'calm-architecture',
    num: '02',
    title: 'Calm Architecture',
    category: 'Editorial',
    year: '2025',
    client: 'Sora Spatial Practice',
    summary:
      'Monolithic residential portfolio highlighting travertine textures, daylight studies, and curated spatial narratives.',
    deliverables: ['Spatial Monograph', 'Image Curation', 'Responsive Grid'],
    metricLabel: 'Dwell Time',
    metricValue: '5m 04s',
    accentHex: '#C5B097',
  },
  {
    id: 'savor-fine-dining',
    num: '03',
    title: 'Savor Fine Dining',
    category: 'Brand',
    year: '2025',
    client: 'Savor Tasting Room',
    summary:
      'Intimate twelve-seat tasting menu experience online with seasonal provenance notes and discreet table reservation.',
    deliverables: ['Brand Experience', 'Menu Typography', 'Booking UX'],
    metricLabel: 'Seat Fill Rate',
    metricValue: '98%',
    accentHex: '#E6D7C3',
  },
  {
    id: 'forma-gallery',
    num: '04',
    title: 'Forma Gallery',
    category: 'Couture',
    year: '2026',
    client: 'Forma Contemporary',
    summary:
      'Collector archive and exhibition catalogue designed with generous negative space and whisper-quiet lightbox transitions.',
    deliverables: ['Exhibition Archive', 'Collector Portal', 'Design Strategy'],
    metricLabel: 'Collector Leads',
    metricValue: '+78%',
    accentHex: '#B8A082',
  },
];

export const LUXURY_SERVICES: readonly { num: string; title: string; tag: string }[] = [
  { num: '01', title: 'Web Design', tag: 'Editorial Flagships' },
  { num: '02', title: 'UI / UX Architecture', tag: 'Bespoke Flows' },
  { num: '03', title: 'Brand Experience', tag: 'Visual Worlds' },
  { num: '04', title: 'Design Strategy', tag: 'Positioning & Craft' },
];

export const LUXURY_PROCESS_STEPS: readonly PortfolioProcessStep[] = [
  {
    num: '01',
    title: 'Discover',
    summary:
      'Immersion into your brand heritage, audience expectations, and commercial priorities before a single frame is drawn.',
    deliverables: ['Brand Audit', 'Audience Mapping', 'Creative Brief'],
  },
  {
    num: '02',
    title: 'Design',
    summary:
      'Editorial art direction, refined typographic hierarchy, and tactile interactive prototypes tailored to your story.',
    deliverables: ['Art Direction', 'Design System', 'Interactive Prototype'],
  },
  {
    num: '03',
    title: 'Develop',
    summary:
      'Disciplined frontend craft with fluid responsiveness, crisp motion choreography, and accessible semantics.',
    deliverables: ['Production Code', 'Motion Polish', 'Device QA'],
  },
  {
    num: '04',
    title: 'Deliver',
    summary:
      'Seamless launch handoff, performance verification, and tailored guidance so your team operates with confidence.',
    deliverables: ['Launch Audit', 'Asset Handoff', 'Post-Launch Care'],
  },
];

export const KINETIC_PROJECTS: readonly PortfolioProjectCase[] = [
  {
    id: 'signal-os',
    num: '01',
    title: 'Signal OS Workspace',
    category: 'Web Apps',
    year: '2026',
    client: 'Signal Compute',
    summary:
      'Real-time telemetry canvas and command palette interface engineered for sub-16ms frame budgets at scale.',
    deliverables: ['Design System', 'React Canvas', 'Keyboard UX'],
    metricLabel: 'Frame Time',
    metricValue: '6.4ms',
    accentHex: '#D9F99D',
  },
  {
    id: 'monolith-type',
    num: '02',
    title: 'Monolith Foundry',
    category: 'Brand',
    year: '2025',
    client: 'Monolith Type Lab',
    summary:
      'Interactive variable-font specimen deck and licensing store built with brutalist zine typography and instant previews.',
    deliverables: ['Brand Identity', 'Variable Tester', 'Storefront'],
    metricLabel: 'Conversion',
    metricValue: '4.8%',
    accentHex: '#FBBF24',
  },
  {
    id: 'forma-mesh',
    num: '03',
    title: 'Forma Spatial Rig',
    category: '3D',
    year: '2026',
    client: 'Forma Hardware',
    summary:
      'Hardware launch microsite featuring interactive isometric wireframe inspection and crisp technical specifications.',
    deliverables: ['3D Art Direction', 'Interactive Specs', 'Launch Microsite'],
    metricLabel: 'Launch Views',
    metricValue: '140k',
    accentHex: '#D9F99D',
  },
  {
    id: 'pulse-checkout',
    num: '04',
    title: 'Pulse Commerce Kit',
    category: 'Web Apps',
    year: '2025',
    client: 'Pulse Pay',
    summary:
      'Zero-friction mobile checkout flow and merchant developer docs designed for instant clarity under pressure.',
    deliverables: ['Checkout UX', 'Interactive Docs', 'Accessibility'],
    metricLabel: 'Drop-off Cut',
    metricValue: '-34%',
    accentHex: '#FBBF24',
  },
];

export const KINETIC_MARQUEE_TAGS: readonly string[] = [
  'DESIGN SYSTEMS',
  'FRONTEND ENGINEERING',
  'BRAND ARCHITECTURE',
  'INTERACTIVE MOTION',
  'PRODUCT DIRECTION',
  'WEB PERFORMANCE',
];

export interface PortfolioCopyPack {
  switcher: Record<PortfolioThemeVariant, string>;
  inquiryCta: string;
  copyContact: string;
  copiedContact: string;
  closeModal: string;
  deliverablesLabel: string;
  impactLabel: string;
}

export const PORTFOLIO_THEMES_COPY: Record<CoreLanguageCode, PortfolioCopyPack> = {
  en: {
    switcher: {
      editorial: 'Editorial',
      luxury: 'Couture',
      kinetic: 'Kinetic',
    },
    inquiryCta: 'Start Project on WhatsApp',
    copyContact: 'Copy Brief',
    copiedContact: 'Brief copied',
    closeModal: 'Close',
    deliverablesLabel: 'Deliverables',
    impactLabel: 'Outcome',
  },
  hinglish: {
    switcher: {
      editorial: 'Editorial',
      luxury: 'Couture',
      kinetic: 'Kinetic',
    },
    inquiryCta: 'WhatsApp par Start Karein',
    copyContact: 'Brief Copy Karein',
    copiedContact: 'Copy ho gaya',
    closeModal: 'Band karein',
    deliverablesLabel: 'Kaam / Deliverables',
    impactLabel: 'Result',
  },
  hi: {
    switcher: {
      editorial: 'एडिटोरियल',
      luxury: 'कूट्योर',
      kinetic: 'काइनेटिक',
    },
    inquiryCta: 'WhatsApp पर प्रोजेक्ट शुरू करें',
    copyContact: 'ब्रीफ़ कॉपी करें',
    copiedContact: 'कॉपी हो गया',
    closeModal: 'बंद करें',
    deliverablesLabel: 'मुख्य कार्य',
    impactLabel: 'परिणाम',
  },
};
