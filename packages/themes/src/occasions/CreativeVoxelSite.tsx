'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { pickLocalizedText, toCoreLanguageCode, type CoreLanguageCode, type LanguageCode } from '@webzy/core';
import { getWebzyFooterLabel, type OccasionSiteProps } from './shared/OccasionPrimitives';

export type CreativeWorldMode = 'particle3d' | 'voxel' | 'scrapbook';

interface StudioIdentity {
  displayName: string;
  roleTitle: string;
  locationTag: string;
  headline: string;
  bio: string;
  offerTag: string;
  initials: string;
}

interface CaseStudyItem {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  image: string;
  summary: string;
  metricValue: string;
  metricLabel: string;
  deliverables: string[];
  accent: string;
}

interface BiomeProject {
  id: string;
  title: string;
  biome: string;
  seed: string;
  blocks: string;
  xpReward: number;
  accent: string;
  summary: string;
  stack: string[];
}

interface TimelineMilestone {
  year: string;
  title: string;
  badge: string;
  story: string;
  highlight: string;
}

interface RpgArchetype {
  id: string;
  name: string;
  role: string;
  tagline: string;
  accent: string;
  stats: Array<{ label: string; value: number }>;
  tools: string[];
}

interface ReachCardItem {
  id: string;
  stat: string;
  platform: string;
  handle: string;
  bg: string;
  tiltClass: string;
  proof: string;
}

type PromptModeId = 'brief' | 'stack' | 'timeline';

const CREATIVE_VOXEL_CSS = `
@property --wz-prism-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes wzCvPrismSpin {
  0% { --wz-prism-angle: 0deg; }
  100% { --wz-prism-angle: 360deg; }
}

@keyframes wzCvPrismFallback {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes wzCvBobGentle {
  0%, 100% { transform: translateY(0px) rotate(var(--wz-tilt, 0deg)); }
  50% { transform: translateY(-6px) rotate(calc(var(--wz-tilt, 0deg) + 1.5deg)); }
}

@keyframes wzCvXpFloat {
  0% { opacity: 0; transform: translateY(8px) scale(0.85); }
  22% { opacity: 1; transform: translateY(-2px) scale(1.06); }
  80% { opacity: 1; transform: translateY(-14px) scale(1); }
  100% { opacity: 0; transform: translateY(-22px) scale(0.92); }
}

@keyframes wzCvWorldIn {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}

.wz-cv-shell {
  container-type: inline-size;
  container-name: cv-shell;
}

.wz-cv-world-enter {
  animation: wzCvWorldIn 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Chromatic Liquid-Glass rotating conic border ring */
.wz-cv-prism-ring {
  position: relative;
  isolation: isolate;
  background: conic-gradient(
    from var(--wz-prism-angle, 0deg),
    #ff8c24,
    #facc15,
    #38bdf8,
    #6366f1,
    #f472b6,
    #ff8c24
  );
  animation: wzCvPrismSpin 5.5s linear infinite;
}

.wz-cv-prism-ring::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: inherit;
  background: inherit;
  filter: blur(10px);
  opacity: 0.42;
  z-index: -1;
  transition: opacity 0.25s ease, filter 0.25s ease;
}

.wz-cv-prism-ring:hover::before {
  opacity: 0.78;
  filter: blur(13px);
}

.wz-cv-liquid-cta {
  position: relative;
  isolation: isolate;
  background: conic-gradient(
    from var(--wz-prism-angle, 40deg),
    #fbbf24,
    #f97316,
    #38bdf8,
    #818cf8,
    #f472b6,
    #fbbf24
  );
  animation: wzCvPrismSpin 4.2s linear infinite;
}

.wz-cv-liquid-cta::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  background: inherit;
  filter: blur(14px);
  opacity: 0.35;
  z-index: -1;
  transition: opacity 0.25s ease;
}

.wz-cv-liquid-cta:hover::after {
  opacity: 0.75;
}

/* Outlined editorial hero stroke matching 3D particle poster */
.wz-cv-outline-stroke {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.88);
  text-shadow: 0 0 28px rgba(251, 191, 36, 0.14);
}

/* Dual-aura AI Prompt bar glow (warm amber left + electric cobalt right) */
.wz-cv-dual-aura {
  position: relative;
  isolation: isolate;
}

.wz-cv-dual-aura::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 22px;
  background: linear-gradient(
    95deg,
    rgba(255, 146, 43, 0.92) 0%,
    rgba(245, 158, 11, 0.45) 26%,
    rgba(255, 255, 255, 0.16) 50%,
    rgba(56, 189, 248, 0.55) 74%,
    rgba(37, 99, 235, 0.95) 100%
  );
  z-index: -1;
}

.wz-cv-dual-aura::after {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: 28px;
  background:
    radial-gradient(circle at 12% 50%, rgba(255, 140, 36, 0.42), transparent 46%),
    radial-gradient(circle at 88% 50%, rgba(37, 99, 235, 0.48), transparent 46%);
  filter: blur(16px);
  z-index: -2;
  pointer-events: none;
}

/* 8-bit hard pixel offset shadow */
.wz-cv-pixel-box {
  border: 2px solid #2b231e;
  box-shadow: 0 4px 0 #2b231e;
}

.wz-cv-pixel-btn {
  border: 2px solid #2b231e;
  box-shadow: 0 3px 0 #2b231e;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.wz-cv-pixel-btn:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 #2b231e;
}

.wz-cv-xp-pop {
  animation: wzCvXpFloat 1.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Realistic CSS pink-and-white gingham picnic tablecloth */
.wz-cv-gingham {
  background-color: #fff6f8;
  background-image:
    linear-gradient(
      90deg,
      rgba(244, 154, 174, 0.44) 50%,
      transparent 50%
    ),
    linear-gradient(
      rgba(244, 154, 174, 0.44) 50%,
      transparent 50%
    );
  background-size: 36px 36px;
}

.wz-cv-bob {
  animation: wzCvBobGentle 4.2s ease-in-out infinite;
}

/* Container-query responsive grids (390px mobile preview card vs full desktop) */
.wz-cv-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

.wz-cv-cases-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.875rem;
}

.wz-cv-biome-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.wz-cv-roster-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.wz-cv-notebook-spread {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
}

.wz-cv-spiral-vert {
  display: none;
}

.wz-cv-spiral-horiz {
  display: flex;
}

.wz-cv-reach-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.wz-cv-canvas-box {
  height: 214px;
}

@container cv-shell (min-width: 620px) {
  .wz-cv-canvas-box {
    height: 325px;
  }

  .wz-cv-hero-grid {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: 1.5rem;
    align-items: center;
  }

  .wz-cv-cases-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .wz-cv-biome-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.875rem;
  }

  .wz-cv-roster-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.875rem;
  }

  .wz-cv-notebook-spread {
    grid-template-columns: minmax(0, 0.94fr) 26px minmax(0, 1.06fr);
    align-items: stretch;
  }

  .wz-cv-spiral-vert {
    display: flex;
  }

  .wz-cv-spiral-horiz {
    display: none;
  }

  .wz-cv-reach-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wz-cv-prism-ring,
  .wz-cv-liquid-cta,
  .wz-cv-bob,
  .wz-cv-world-enter,
  .wz-cv-xp-pop {
    animation: none !important;
  }
}
`;

const WORLD_COPY: Record<
  CoreLanguageCode,
  {
    artModeLabel: string;
    modes: Record<CreativeWorldMode, string>;
    startProject: string;
    copyBrief: string;
    briefCopied: string;
    close: string;
    exploreWork: string;
    askPlaceholder: string;
    askSend: string;
    availableForWork: string;
  }
> = {
  en: {
    artModeLabel: 'ART MODE',
    modes: {
      particle3d: '3D Particle',
      voxel: 'Voxel Quest',
      scrapbook: 'Sunlit Studio',
    },
    startProject: 'Start a Project on WhatsApp',
    copyBrief: 'Copy Project Brief',
    briefCopied: 'Brief Copied',
    close: 'Close',
    exploreWork: 'Launch Experience',
    askPlaceholder: 'Ask anything about 3D builds, motion, or booking...',
    askSend: 'Ask',
    availableForWork: 'Available for work',
  },
  hinglish: {
    artModeLabel: 'ART MODE',
    modes: {
      particle3d: '3D Particle',
      voxel: 'Voxel Quest',
      scrapbook: 'Sunlit Studio',
    },
    startProject: 'WhatsApp par Project Start Karein',
    copyBrief: 'Brief Copy Karein',
    briefCopied: 'Copy ho gaya',
    close: 'Band karein',
    exploreWork: 'Experience Dekhein',
    askPlaceholder: '3D builds, motion ya booking ke baare mein poochein...',
    askSend: 'Poochein',
    availableForWork: 'Naye projects ke liye open',
  },
  hi: {
    artModeLabel: 'आर्ट मोड',
    modes: {
      particle3d: '3D पार्टिकल',
      voxel: 'वॉक्सेल क्वेस्ट',
      scrapbook: 'सनलिट स्टूडियो',
    },
    startProject: 'WhatsApp पर प्रोजेक्ट शुरू करें',
    copyBrief: 'ब्रीफ़ कॉपी करें',
    briefCopied: 'कॉपी हो गया',
    close: 'बंद करें',
    exploreWork: 'एक्सपीरियंस देखें',
    askPlaceholder: '3D डिज़ाइन, मोशन या बुकिंग के बारे में पूछें...',
    askSend: 'पूछें',
    availableForWork: 'नए प्रोजेक्ट्स के लिए उपलब्ध',
  },
};

const PROMPT_MODES: ReadonlyArray<{
  id: PromptModeId;
  label: string;
  chips: string[];
}> = [
  {
    id: 'brief',
    label: 'Studio Brief',
    chips: [
      'What makes your 3D sites convert?',
      'Can we launch in 2 weeks?',
      'Do you handle copy & motion?',
    ],
  },
  {
    id: 'stack',
    label: '3D Stack',
    chips: [
      'How do you keep 60fps on phones?',
      'Canvas vs WebGL shaders?',
      'Accessible reduced-motion support?',
    ],
  },
  {
    id: 'timeline',
    label: 'Timeline & Rates',
    chips: [
      'Sprint milestones & handoff?',
      'What is the starting scope?',
      'Post-launch care included?',
    ],
  },
];

const DEFAULT_CASE_STUDIES: readonly CaseStudyItem[] = [
  {
    id: 'crimson-monolith',
    index: '01',
    title: 'Crimson Monolith',
    subtitle: 'Sculptural Brand & Interactive Gallery',
    category: '3D Direction',
    year: '2026',
    image: '/templates/creative/crimson-statue.jpg',
    summary:
      'High-contrast obsidian flagship pairing classical sculpture lighting with fluid spatial navigation and precision typography.',
    metricValue: '+148%',
    metricLabel: 'Session Depth',
    deliverables: ['3D Art Direction', 'Custom Shaders', 'Interactive Folio'],
    accent: '#EF4444',
  },
  {
    id: 'twilight-meadow',
    index: '02',
    title: 'Twilight Meadow',
    subtitle: 'Atmospheric Digital Reality Platform',
    category: 'Brand World',
    year: '2026',
    image: '/templates/creative/meadow-twilight.jpg',
    summary:
      'Editorial storytelling environment blending golden-hour horizons, gentle parallax telemetry, and calm conversion choreography.',
    metricValue: '0.8s',
    metricLabel: 'First Paint',
    deliverables: ['Visual Worldbuilding', 'Motion System', 'Next.js Build'],
    accent: '#F59E0B',
  },
  {
    id: 'bridge-valley',
    index: '03',
    title: 'Bridge Valley AI',
    subtitle: 'Spatial Automation & Decision Engine',
    category: 'Product Launch',
    year: '2025',
    image: '/templates/creative/bridge-valley.jpg',
    summary:
      'Sunlit alpine product launch bridging complex AI workflow orchestration with crystal-clear interactive demos.',
    metricValue: '4.6x',
    metricLabel: 'Demo Bookings',
    deliverables: ['Launch Microsite', 'Interactive Demo', 'Design System'],
    accent: '#38BDF8',
  },
];

const BLOCKFOLIO_PALETTE: ReadonlyArray<{ hex: string; name: string }> = [
  { hex: '#6BAF5D', name: 'Meadow Turf' },
  { hex: '#B57A4E', name: 'Oak Timber' },
  { hex: '#F5E6D3', name: 'Craft Sand' },
  { hex: '#A7D8FF', name: 'Voxel Sky' },
  { hex: '#F9FAFB', name: 'Cloud Block' },
];

const BIOME_PROJECTS: readonly BiomeProject[] = [
  {
    id: 'meadow-windmill',
    title: 'Meadow Windmill',
    biome: 'Overworld Plains',
    seed: 'SEED-8042-WIND',
    blocks: '48,200 blocks',
    xpReward: 150,
    accent: '#6BAF5D',
    summary:
      'Sunlit golden-wheat biome engineered with kinetic rotating sails, volumetric sky gradients, and interactive waypoint portals.',
    stack: ['Voxel Grid UI', 'Particle Wind', '60fps Canvas'],
  },
  {
    id: 'frost-peak',
    title: 'Frost Peak',
    biome: 'Glacier Summit',
    seed: 'SEED-4410-ICE',
    blocks: '62,900 blocks',
    xpReward: 150,
    accent: '#38BDF8',
    summary:
      'Crisp alpine citadel balancing frosted translucent glass HUD panels against faceted snowdrift terrain and aurora lighting.',
    stack: ['Shader Ice', 'Spatial Audio', 'HUD System'],
  },
  {
    id: 'sakura-lake',
    title: 'Sakura Lake',
    biome: 'Blossom Basin',
    seed: 'SEED-9108-BLOOM',
    blocks: '39,500 blocks',
    xpReward: 150,
    accent: '#F472B6',
    summary:
      'Tranquil reflection pond framed by floating voxel petals, calm ambient palette tokens, and gentle water-ripple physics.',
    stack: ['Petal Physics', 'Color Tokens', 'Interactive Map'],
  },
  {
    id: 'obsidian-core',
    title: 'Obsidian Core',
    biome: 'Deep Foundry',
    seed: 'SEED-2099-CORE',
    blocks: '74,100 blocks',
    xpReward: 150,
    accent: '#F97316',
    summary:
      'Molten-forge showcase chamber combining glowing lava waterfalls, dark basalt geometry, and real-time telemetry gauges.',
    stack: ['Glow Shaders', 'Boss HUD', 'WebGL Forge'],
  },
];

const RETRO_TIMELINE: readonly TimelineMilestone[] = [
  {
    year: '2018',
    title: 'First Pixel Cartridge',
    badge: 'LEVEL 01',
    story:
      'Started crafting crisp 8-bit interfaces and micro-interactions from a single desk setup, obsessively tuning every frame and pixel edge.',
    highlight: 'First 12 indie launches shipped',
  },
  {
    year: '2020',
    title: 'Interactive Canvas Forge',
    badge: 'LEVEL 02',
    story:
      'Built custom real-time particle systems and lightweight browser physics engines that stayed silky smooth on everyday phones.',
    highlight: 'Sub-16ms mobile frame budget',
  },
  {
    year: '2022',
    title: 'Voxel & Brand Worlds',
    badge: 'LEVEL 03',
    story:
      'Merged playful voxel architecture with editorial web typography, turning static product sites into memorable explorable worlds.',
    highlight: 'Featured across design showcases',
  },
  {
    year: '2024',
    title: 'Multi-World Studio System',
    badge: 'LEVEL 04',
    story:
      'Pioneered adaptive visual themes where brands shift effortlessly between dark 3D theater, tactile arcade quests, and sunlit craft.',
    highlight: '90+ global creator launches',
  },
  {
    year: '2026',
    title: 'Next-Gen Spatial Web',
    badge: 'LEVEL 05',
    story:
      'Today we partner with ambitious founders and creators to build signature web flagships that feel alive from the very first tap.',
    highlight: '120+ live interactive builds',
  },
];

const RPG_ARCHETYPES: readonly RpgArchetype[] = [
  {
    id: 'architect',
    name: 'Architect',
    role: 'Systems & Blueprint',
    tagline: 'Shapes modular component grids, crisp typography, and zero-CLS page architecture.',
    accent: '#E53935',
    stats: [
      { label: 'GRID', value: 96 },
      { label: 'SPEED', value: 94 },
      { label: 'CRAFT', value: 92 },
    ],
    tools: ['TypeScript', 'Next.js', 'Design Tokens'],
  },
  {
    id: 'artist3d',
    name: '3D Artist',
    role: 'Voxels & Lighting',
    tagline: 'Sculpts glowing particle silhouettes, diorama scenes, and tactile material palettes.',
    accent: '#F59E0B',
    stats: [
      { label: 'DEPTH', value: 98 },
      { label: 'LIGHT', value: 95 },
      { label: 'STYLE', value: 94 },
    ],
    tools: ['3D Canvas', 'Shaders', 'Voxel Rigging'],
  },
  {
    id: 'motiondev',
    name: 'Motion Dev',
    role: 'Physics & Feel',
    tagline: 'Choreographs elastic spring curves, pointer repulsion ripples, and silky transitions.',
    accent: '#2563EB',
    stats: [
      { label: 'FLUID', value: 97 },
      { label: 'FPS', value: 99 },
      { label: 'JUICE', value: 93 },
    ],
    tools: ['Spring Physics', 'RAF Loops', 'CSS Motion'],
  },
  {
    id: 'soundcraft',
    name: 'Sound Craft',
    role: 'Synth & Micro-FX',
    tagline: 'Designs subtle audio-visual cadence, pacing, and responsive tactile feedback cues.',
    accent: '#10B981',
    stats: [
      { label: 'TONE', value: 91 },
      { label: 'SYNC', value: 95 },
      { label: 'VIBE', value: 96 },
    ],
    tools: ['Web Audio', 'Rhythm UX', 'Interactive UI'],
  },
];

const CREATIE_BADGES: ReadonlyArray<{
  id: string;
  label: string;
  bg: string;
  iconBg: string;
  tilt: string;
  note: string;
}> = [
  {
    id: 'uiux',
    label: 'UI/UX Design',
    bg: '#CBE9FF',
    iconBg: '#0EA5E9',
    tilt: '-5deg',
    note: 'Crisp interaction flows tuned for instant clarity and effortless conversion.',
  },
  {
    id: 'motion3d',
    label: '3D Motion',
    bg: '#DDD6FE',
    iconBg: '#7C3AED',
    tilt: '4deg',
    note: 'Playful spatial depth and tactile hover choreography that stays lightning fast.',
  },
  {
    id: 'brandcraft',
    label: 'Brand Craft',
    bg: '#FBCFE8',
    iconBg: '#EC4899',
    tilt: '-3deg',
    note: 'Distinctive art direction, stickers, and typography people remember on sight.',
  },
];

const SCRAPBOOK_REACH_CARDS: readonly ReachCardItem[] = [
  {
    id: 'yt',
    stat: '70K',
    platform: 'YouTube',
    handle: '@studio.builds',
    bg: '#BBD6A3',
    tiltClass: '-rotate-2',
    proof: 'Weekly 3D breakdowns, interactive builds & creative workflow walkthroughs.',
  },
  {
    id: 'ig',
    stat: '45K',
    platform: 'Instagram',
    handle: '@studio.reels',
    bg: '#8FBBE8',
    tiltClass: 'rotate-2',
    proof: 'Short-form motion reels, UI experiments & behind-the-scenes case studies.',
  },
  {
    id: 'launches',
    stat: '120+',
    platform: 'Launches',
    handle: 'verified ships',
    bg: '#E8CBEB',
    tiltClass: '-rotate-1',
    proof: 'Live creator portfolios, product launch microsites & interactive brand flagships.',
  },
  {
    id: 'rating',
    stat: '4.9',
    platform: 'Rating',
    handle: 'client score',
    bg: '#BDD9F2',
    tiltClass: 'rotate-2',
    proof: 'Rated across founder sprints for speed, craft precision & clear handoffs.',
  },
];

const SCRAPBOOK_TABS: ReadonlyArray<{ id: string; label: string; text: string }> = [
  {
    id: 'story',
    label: 'My Craft',
    text: 'Every project begins with curiosity — pairing honest storytelling, playful textures, and clean frontend engineering so brands feel unmistakably human.',
  },
  {
    id: 'process',
    label: 'Sprint Flow',
    text: 'Concept moodboard on Day 1, interactive prototype by Day 4, and a fully polished responsive website ready to launch in under two weeks.',
  },
  {
    id: 'collab',
    label: 'Collab Note',
    text: 'Open for brand launches, creator studios, interactive portfolios, and bespoke product stories worldwide.',
  },
];

function resolveWorldMode(relation?: string): CreativeWorldMode {
  const normalized = (relation ?? '').trim().toLowerCase();
  if (!normalized) return 'particle3d';
  if (
    normalized.includes('voxel') ||
    normalized.includes('block') ||
    normalized.includes('retro') ||
    normalized.includes('game') ||
    normalized.includes('8bit') ||
    normalized.includes('pixel')
  ) {
    return 'voxel';
  }
  if (
    normalized.includes('scrapbook') ||
    normalized.includes('creatie') ||
    normalized.includes('picnic') ||
    normalized.includes('ugc') ||
    normalized.includes('hills') ||
    normalized.includes('sunlit')
  ) {
    return 'scrapbook';
  }
  return 'particle3d';
}

function buildWhatsAppUrl(phone?: string, text?: string): string | null {
  const digits = (phone ?? '').replace(/[^\d]/g, '');
  if (digits.length < 7) return null;
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${normalized}${query}`;
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'NC';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

function parseStudioIdentity(
  data: OccasionSiteProps['data'],
  language: LanguageCode,
): StudioIdentity {
  const rawReceiver = (data.receiverName ?? '').trim();
  const segments = rawReceiver
    ? rawReceiver
        .split(/\s*(?:\||—|–|\s-\s)\s*/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const displayName = segments[0] || 'Nova Craft Studio';
  const roleTitle = segments[1] || '3D & Interactive Creator Studio';
  const locationTag = (data.senderName ?? '').trim() || 'Interactive Lab · Worldwide';
  const headline =
    pickLocalizedText(data.headline, language).trim() ||
    'BOOST YOUR BRAND';
  const bio =
    pickLocalizedText(data.message, language).trim() ||
    'We craft interactive 3D web experiences, playful voxel worlds, and sunlit digital stories that turn visitors into lifelong fans.';
  const offerTag =
    pickLocalizedText(data.offerTag, language).trim() ||
    'Booking Q2 Interactive Sprints';

  return {
    displayName,
    roleTitle,
    locationTag,
    headline,
    bio,
    offerTag,
    initials: getInitials(displayName),
  };
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', sync);
      return () => mq.removeEventListener('change', sync);
    }
    return undefined;
  }, []);

  return reduced;
}

/* ---------- Crisp Inline SVG Icons (Zero Unicode Emojis) ---------- */

function OrbitSvg({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="3" fill="currentColor" />
      <ellipse
        cx="10"
        cy="10"
        rx="8"
        ry="3.6"
        transform="rotate(-28 10 10)"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="15.8" cy="6.8" r="1.4" fill="currentColor" />
    </svg>
  );
}

function VoxelCubeSvg({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <polygon points="10,2.5 17,6.2 10,9.9 3,6.2" fill="currentColor" fillOpacity="0.9" />
      <polygon points="3,6.2 10,9.9 10,17.5 3,13.8" fill="currentColor" fillOpacity="0.55" />
      <polygon points="17,6.2 10,9.9 10,17.5 17,13.8" fill="currentColor" fillOpacity="0.32" />
    </svg>
  );
}

function SunlitSparkSvg({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 2.2 L12.1 7.9 L17.8 10 L12.1 12.1 L10 17.8 L7.9 12.1 L2.2 10 L7.9 7.9 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowUpRightSvg({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 11.5 L11.5 4.5 M6 4.5 H11.5 V10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PixelHeartSvg({ filled, className = 'h-4 w-4' }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 14 12" className={className} shapeRendering="crispEdges" aria-hidden="true">
      <path
        d="M2 0h3v1h1v1h2V1h1V0h3v1h1v1h1v4h-1v1h-1v1h-1v1h-1v1H9v1H8v1H6v-1H5v-1H4V9H3V8H2V7H1V6H0V2h1V1h1V0z"
        fill="#2B231E"
      />
      <path
        d="M2 1h3v1h1v1h2V2h1V1h3v1h1v4h-1v1h-1v1h-1v1H9v1H8v1H6v-1H5V9H4V8H3V7H2V6H1V2h1V1z"
        fill={filled ? '#EF4444' : '#6B625B'}
      />
      {filled ? <rect x="2" y="2" width="2" height="1" fill="#FCA5A5" /> : null}
    </svg>
  );
}

function PaperclipSvg({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 36" fill="none" className={className} aria-hidden="true">
      <path
        d="M9 12V24C9 27.3 11.7 30 15 30C18.3 30 21 27.3 21 24V9C21 6.2 18.8 4 16 4C13.2 4 11 6.2 11 9V22.5C11 24.4 12.6 26 14.5 26C16.4 26 18 24.4 18 22.5V11"
        stroke="#78716C"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M9 12V24C9 27.3 11.7 30 15 30C18.3 30 21 27.3 21 24V9C21 6.2 18.8 4 16 4C13.2 4 11 6.2 11 9V22.5"
        stroke="#E7E5E4"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BiomeVoxelArtSvg({ id }: { id: string }) {
  if (id === 'meadow-windmill') {
    return (
      <svg viewBox="0 0 240 150" className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true">
        <rect width="240" height="150" fill="#A7D8FF" />
        <rect x="20" y="18" width="42" height="12" fill="#FFFFFF" fillOpacity="0.9" />
        <rect x="30" y="12" width="22" height="8" fill="#FFFFFF" fillOpacity="0.9" />
        <rect x="166" y="24" width="48" height="10" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="0" y="96" width="240" height="24" fill="#89C967" />
        <rect x="0" y="114" width="240" height="36" fill="#6BAF5D" />
        <rect x="18" y="106" width="38" height="18" fill="#FBBF24" />
        <rect x="164" y="104" width="54" height="20" fill="#F59E0B" />
        <rect x="102" y="52" width="36" height="58" fill="#D6C4AA" />
        <rect x="106" y="42" width="28" height="12" fill="#925D3B" />
        <rect x="114" y="88" width="12" height="22" fill="#6B4226" />
        <rect x="116" y="62" width="8" height="10" fill="#FEF08A" />
        <polygon points="120,62 84,32 92,26 120,54" fill="#78350F" />
        <polygon points="120,62 156,32 148,26 120,54" fill="#92400E" />
        <polygon points="120,62 88,92 82,84 114,58" fill="#92400E" />
        <polygon points="120,62 152,92 158,84 126,58" fill="#78350F" />
        <rect x="116" y="56" width="8" height="8" fill="#F59E0B" />
      </svg>
    );
  }
  if (id === 'frost-peak') {
    return (
      <svg viewBox="0 0 240 150" className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true">
        <rect width="240" height="150" fill="#BAE6FD" />
        <rect x="0" y="108" width="240" height="42" fill="#E0F2FE" />
        <polygon points="120,20 184,114 56,114" fill="#64748B" />
        <polygon points="120,20 148,62 132,68 120,54 106,66 92,60" fill="#FFFFFF" />
        <polygon points="62,54 104,114 20,114" fill="#475569" />
        <polygon points="62,54 78,78 62,74 46,78" fill="#F8FAFC" />
        <rect x="34" y="88" width="16" height="24" fill="#0F766E" />
        <rect x="38" y="76" width="8" height="12" fill="#14B8A6" />
        <rect x="184" y="84" width="18" height="28" fill="#0F766E" />
        <rect x="188" y="72" width="10" height="12" fill="#2DD4BF" />
        <rect x="148" y="96" width="24" height="18" fill="#7C4A2D" />
        <rect x="156" y="102" width="8" height="8" fill="#FDE047" />
      </svg>
    );
  }
  if (id === 'sakura-lake') {
    return (
      <svg viewBox="0 0 240 150" className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true">
        <rect width="240" height="150" fill="#E0F2FE" />
        <rect x="0" y="96" width="240" height="14" fill="#86EFAC" />
        <rect x="0" y="110" width="240" height="40" fill="#60A5FA" />
        <rect x="44" y="122" width="76" height="6" fill="#93C5FD" />
        <rect x="136" y="132" width="60" height="5" fill="#FBCFE8" />
        <rect x="110" y="66" width="16" height="40" fill="#6B4226" />
        <rect x="74" y="34" width="90" height="36" fill="#F472B6" />
        <rect x="86" y="22" width="66" height="24" fill="#F9A8D4" />
        <rect x="64" y="46" width="26" height="20" fill="#FBCFE8" />
        <rect x="150" y="44" width="28" height="22" fill="#F9A8D4" />
        <rect x="44" y="68" width="6" height="6" fill="#FBCFE8" />
        <rect x="186" y="76" width="6" height="6" fill="#F9A8D4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 150" className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true">
      <rect width="240" height="150" fill="#1C1014" />
      <rect x="0" y="0" width="46" height="150" fill="#2D161A" />
      <rect x="194" y="0" width="46" height="150" fill="#2D161A" />
      <rect x="72" y="16" width="96" height="96" fill="#451A1A" />
      <rect x="92" y="16" width="14" height="106" fill="#F97316" />
      <rect x="96" y="16" width="6" height="106" fill="#FDE047" />
      <rect x="138" y="30" width="12" height="92" fill="#EA580C" />
      <rect x="142" y="30" width="4" height="92" fill="#FEF08A" />
      <rect x="0" y="114" width="240" height="36" fill="#C2410C" />
      <rect x="28" y="120" width="184" height="12" fill="#FB923C" />
      <rect x="74" y="124" width="90" height="6" fill="#FDE047" />
    </svg>
  );
}

function RpgArchetypeAvatarSvg({ id, active }: { id: string; active: boolean }) {
  const bg = active ? '#FDE047' : '#F6B24A';
  if (id === 'architect') {
    return (
      <svg viewBox="0 0 84 84" className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true">
        <rect width="84" height="84" fill={bg} />
        <rect x="18" y="56" width="48" height="28" fill="#1E293B" />
        <rect x="34" y="56" width="16" height="14" fill="#F8FAFC" />
        <rect x="26" y="22" width="32" height="32" fill="#F1C27D" />
        <rect x="24" y="14" width="36" height="14" fill="#2B231E" />
        <rect x="30" y="32" width="8" height="6" fill="#1E293B" />
        <rect x="46" y="32" width="8" height="6" fill="#1E293B" />
        <rect x="38" y="34" width="8" height="2" fill="#1E293B" />
        <rect x="36" y="45" width="12" height="3" fill="#7C2D12" />
      </svg>
    );
  }
  if (id === 'artist3d') {
    return (
      <svg viewBox="0 0 84 84" className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true">
        <rect width="84" height="84" fill={bg} />
        <rect x="16" y="56" width="52" height="28" fill="#7C3AED" />
        <rect x="20" y="20" width="44" height="42" fill="#C2410C" />
        <rect x="28" y="24" width="28" height="30" fill="#FAD7B0" />
        <rect x="32" y="34" width="5" height="5" fill="#2B231E" />
        <rect x="47" y="34" width="5" height="5" fill="#2B231E" />
        <rect x="36" y="44" width="12" height="4" fill="#DC2626" />
        <rect x="28" y="14" width="28" height="8" fill="#E11D48" />
      </svg>
    );
  }
  if (id === 'motiondev') {
    return (
      <svg viewBox="0 0 84 84" className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true">
        <rect width="84" height="84" fill={bg} />
        <rect x="18" y="56" width="48" height="28" fill="#0F766E" />
        <rect x="26" y="22" width="32" height="32" fill="#E6B88A" />
        <rect x="24" y="16" width="36" height="10" fill="#1D4ED8" />
        <rect x="24" y="24" width="42" height="4" fill="#3B82F6" />
        <rect x="32" y="34" width="5" height="5" fill="#1E293B" />
        <rect x="47" y="34" width="5" height="5" fill="#1E293B" />
        <rect x="35" y="45" width="14" height="3" fill="#2B231E" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 84 84" className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true">
      <rect width="84" height="84" fill={bg} />
      <rect x="18" y="56" width="48" height="28" fill="#334155" />
      <rect x="20" y="28" width="8" height="18" fill="#EF4444" />
      <rect x="56" y="28" width="8" height="18" fill="#EF4444" />
      <rect x="24" y="14" width="36" height="6" fill="#2B231E" />
      <rect x="26" y="22" width="32" height="32" fill="#F3C9A2" />
      <rect x="32" y="34" width="5" height="5" fill="#2B231E" />
      <rect x="47" y="34" width="5" height="5" fill="#2B231E" />
      <rect x="36" y="44" width="12" height="3" fill="#2B231E" />
    </svg>
  );
}

function DockIconSvg({ kind }: { kind: 'hills' | 'notebook' | 'reach' | 'contact' }) {
  if (kind === 'hills') {
    return (
      <svg viewBox="0 0 28 28" className="h-6 w-6" fill="none" aria-hidden="true">
        <rect width="28" height="28" rx="7" fill="#FEF9C3" />
        <path d="M4 20 L11 11 L17 17 L21 13 L25 20 Z" fill="#65A30D" />
        <circle cx="20" cy="8" r="2.6" fill="#F59E0B" />
      </svg>
    );
  }
  if (kind === 'notebook') {
    return (
      <svg viewBox="0 0 28 28" className="h-6 w-6" fill="none" aria-hidden="true">
        <rect width="28" height="28" rx="7" fill="#FCE7F3" />
        <rect x="7" y="5" width="14" height="18" rx="2.5" fill="#FFFFFF" stroke="#EC4899" strokeWidth="1.5" />
        <line x1="10" y1="10" x2="18" y2="10" stroke="#F472B6" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="10" y1="14" x2="18" y2="14" stroke="#F472B6" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="10" y1="18" x2="15" y2="18" stroke="#F472B6" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'reach') {
    return (
      <svg viewBox="0 0 28 28" className="h-6 w-6" fill="none" aria-hidden="true">
        <rect width="28" height="28" rx="7" fill="#DBEAFE" />
        <rect x="6" y="15" width="4" height="7" rx="1" fill="#3B82F6" />
        <rect x="12" y="10" width="4" height="12" rx="1" fill="#2563EB" />
        <rect x="18" y="6" width="4" height="16" rx="1" fill="#1D4ED8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 28 28" className="h-6 w-6" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="#DCFCE7" />
      <rect x="5" y="7" width="18" height="14" rx="2.5" fill="#16A34A" />
      <path d="M6.5 9 L14 15 L21.5 9" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Live Interactive HTML5 <canvas> 3D Particle Rocket Engine ---------- */

interface Particle3D {
  bx: number;
  by: number;
  bz: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  size: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
  phase: number;
  kind: 'hull' | 'window' | 'fin' | 'plume' | 'star';
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function generateRocketParticles(): Particle3D[] {
  const rand = createSeededRandom(202607);
  const particles: Particle3D[] = [];

  // 1. Sculpted 3D Rocket Fuselage (~180 golden-amber & luminous white-gold particles)
  for (let i = 0; i < 180; i++) {
    const t = rand(); // 0 = nose tip (+X), 1 = engine tail (-X)
    const x = 1.24 - t * 2.38;
    // Smooth aerodynamic ogive curve peaking around mid-body and tapering at tail
    const profile =
      t < 0.72
        ? Math.sin((t / 0.72) * (Math.PI * 0.56)) * 0.62
        : 0.62 * (1 - (t - 0.72) * 1.18);
    const radius = Math.max(0.05, profile) * (0.9 + rand() * 0.14);
    const theta = rand() * Math.PI * 2;
    const y = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;

    const isNoseGlow = t < 0.28;
    const isStripe = Math.abs(theta - 0.15) < 0.25 && t > 0.45 && t < 0.88;
    const warmPick = rand();

    let r = 251;
    let g = 186;
    let b = 64;
    if (isStripe || isNoseGlow) {
      r = 255;
      g = 214;
      b = 115;
    } else if (warmPick > 0.72) {
      r = 245;
      g = 150;
      b = 28;
    } else if (warmPick < 0.14) {
      r = 255;
      g = 244;
      b = 214;
    }

    particles.push({
      bx: x,
      by: y,
      bz: z,
      ox: 0,
      oy: 0,
      vx: 0,
      vy: 0,
      size: 1.35 + rand() * 1.45,
      r,
      g,
      b,
      alpha: 0.65 + rand() * 0.35,
      phase: rand() * Math.PI * 2,
      kind: 'hull',
    });
  }

  // 2. Glowing Circular Spacecraft Porthole Window (~48 ice-white & sky-cobalt particles)
  for (let i = 0; i < 48; i++) {
    const rad = Math.sqrt(rand()) * 0.33;
    const ang = rand() * Math.PI * 2;
    const x = 0.26 + Math.cos(ang) * rad;
    const y = 0.08 + Math.sin(ang) * rad;
    const z = 0.52 + Math.cos(rad * 2.2) * 0.12;
    const isRim = rad > 0.24;

    particles.push({
      bx: x,
      by: y,
      bz: z,
      ox: 0,
      oy: 0,
      vx: 0,
      vy: 0,
      size: isRim ? 1.85 : 1.4 + rand() * 1.1,
      r: isRim ? 236 : 147,
      g: isRim ? 248 : 206,
      b: 255,
      alpha: 0.78 + rand() * 0.22,
      phase: rand() * Math.PI * 2,
      kind: 'window',
    });
  }

  // 3. Swept Electric-Cobalt Side & Dorsal Fins (~62 cobalt & cyan-blue particles)
  for (let i = 0; i < 62; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const u = rand(); // span outward
    const v = rand(); // chord along rear body
    const x = -0.22 - v * 0.88 - u * 0.32;
    const y = side * (0.48 + u * 0.58 * (0.35 + v * 0.65));
    const z = (rand() - 0.5) * 0.22;
    const brightBlue = rand() > 0.45;

    particles.push({
      bx: x,
      by: y,
      bz: z,
      ox: 0,
      oy: 0,
      vx: 0,
      vy: 0,
      size: 1.45 + rand() * 1.35,
      r: brightBlue ? 96 : 59,
      g: brightBlue ? 175 : 130,
      b: 255,
      alpha: 0.72 + rand() * 0.28,
      phase: rand() * Math.PI * 2,
      kind: 'fin',
    });
  }

  // 4. Molten Thruster Plume (~24 warm amber-gold flare particles)
  for (let i = 0; i < 24; i++) {
    const spread = rand();
    const ang = rand() * Math.PI * 2;
    const x = -1.16 - spread * 0.52;
    const rad = (0.1 + spread * 0.24) * rand();
    const y = Math.cos(ang) * rad;
    const z = Math.sin(ang) * rad;

    particles.push({
      bx: x,
      by: y,
      bz: z,
      ox: 0,
      oy: 0,
      vx: 0,
      vy: 0,
      size: 1.4 + (1 - spread) * 1.5,
      r: 255,
      g: Math.round(165 + (1 - spread) * 75),
      b: Math.round(65 + (1 - spread) * 115),
      alpha: 0.5 + (1 - spread) * 0.5,
      phase: rand() * Math.PI * 2,
      kind: 'plume',
    });
  }

  // 5. Deep Space Starfield Dust (~50 particles)
  for (let i = 0; i < 50; i++) {
    const isBlueStar = rand() > 0.52;
    particles.push({
      bx: (rand() - 0.5) * 4.8,
      by: (rand() - 0.5) * 3.4,
      bz: (rand() - 0.5) * 2.8,
      ox: 0,
      oy: 0,
      vx: 0,
      vy: 0,
      size: 0.8 + rand() * 1.15,
      r: isBlueStar ? 147 : 253,
      g: isBlueStar ? 197 : 224,
      b: isBlueStar ? 253 : 145,
      alpha: 0.25 + rand() * 0.55,
      phase: rand() * Math.PI * 2,
      kind: 'star',
    });
  }

  return particles;
}

function ParticleRocketCanvas({
  reducedMotion,
  pulseNonce,
}: {
  reducedMotion: boolean;
  pulseNonce: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle3D[] | null>(null);
  const pointerRef = useRef<{ x: number; y: number; nx: number; ny: number; active: boolean }>({
    x: 0,
    y: 0,
    nx: 0,
    ny: 0,
    active: false,
  });
  const lastPulseRef = useRef<number>(pulseNonce);

  // Radial ripple burst when user triggers the Liquid-Glass Action Pill
  useEffect(() => {
    if (pulseNonce === lastPulseRef.current) return;
    lastPulseRef.current = pulseNonce;
    const pts = particlesRef.current;
    if (!pts || reducedMotion) return;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (p.kind === 'star') continue;
      const angle = p.phase + i * 0.37;
      const burst = 5.5 + (i % 5) * 1.4;
      p.vx += Math.cos(angle) * burst;
      p.vy += Math.sin(angle) * burst;
    }
  }, [pulseNonce, reducedMotion]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    if (!particlesRef.current) {
      particlesRef.current = generateRocketParticles();
    }
    const pts = particlesRef.current;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = Math.max(240, container.clientWidth);
    let height = Math.max(220, container.clientHeight);
    let rafId: number | null = null;
    let time = 0;
    let tiltX = 0;
    let tiltY = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(240, Math.round(rect.width));
      height = Math.max(220, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const drawFrame = (dt: number) => {
      time += dt;
      ctx.clearRect(0, 0, width, height);

      // Soft ambient golden-amber & cobalt volumetric nebula wash behind rocket
      const cx = width * 0.53;
      const cy = height * 0.5;
      const scale = Math.min(width, height) * 0.36;

      const warmGlow = ctx.createRadialGradient(
        cx - scale * 0.25,
        cy - scale * 0.18,
        4,
        cx,
        cy,
        scale * 1.55,
      );
      warmGlow.addColorStop(0, 'rgba(245, 158, 11, 0.16)');
      warmGlow.addColorStop(0.55, 'rgba(59, 130, 246, 0.08)');
      warmGlow.addColorStop(1, 'rgba(6, 7, 11, 0)');
      ctx.fillStyle = warmGlow;
      ctx.fillRect(0, 0, width, height);

      // Smooth pointer-driven 3D orbital tilt
      const pointer = pointerRef.current;
      const targetTiltY = pointer.active ? pointer.nx * 0.45 : 0;
      const targetTiltX = pointer.active ? -pointer.ny * 0.34 : 0;
      tiltY += (targetTiltY - tiltY) * 0.07;
      tiltX += (targetTiltX - tiltX) * 0.07;

      const rotY = Math.sin(time * 0.52) * 0.44 + tiltY;
      const rotX = 0.24 + Math.cos(time * 0.44) * 0.26 + tiltX;
      // Diagonal launch pitch (-36 deg) mirroring reference particle rocket
      const rollZ = -0.62;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosZ = Math.cos(rollZ);
      const sinZ = Math.sin(rollZ);

      const fov = 3.6;
      const repelRadius = Math.max(62, Math.min(width, height) * 0.24);
      const repelSq = repelRadius * repelRadius;

      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        let x0 = p.bx;
        let y0 = p.by;
        let z0 = p.bz;

        if (p.kind === 'plume') {
          const pulse = Math.sin(time * 5.2 + p.phase) * 0.14;
          x0 -= pulse;
        } else if (p.kind === 'star') {
          // Gentle slow drift for background starfield
          const sx = cx + x0 * scale * 0.82;
          const sy = cy + y0 * scale * 0.82 + Math.sin(time * 0.6 + p.phase) * 4;
          const twinkle = p.alpha * (0.65 + 0.35 * Math.sin(time * 2.1 + p.phase));
          ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${twinkle.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        // Rotate around local Y (spinning rocket slightly around vertical axis)
        const x1 = x0 * cosY - z0 * sinY;
        const z1 = x0 * sinY + z0 * cosY;
        // Rotate around local X
        const y2 = y0 * cosX - z1 * sinX;
        const z2 = y0 * sinX + z1 * cosX;
        // Diagonal launch roll in screen plane
        const rx = x1 * cosZ - y2 * sinZ;
        const ry = x1 * sinZ + y2 * cosZ;

        const depth = fov / (fov + z2 + 1.5);
        const baseScreenX = cx + rx * scale * depth;
        const baseScreenY = cy + ry * scale * depth;

        // Interactive mouse/touch repulsion + elastic spring recovery
        if (!reducedMotion) {
          if (pointer.active) {
            const dx = baseScreenX + p.ox - pointer.x;
            const dy = baseScreenY + p.oy - pointer.y;
            const distSq = dx * dx + dy * dy;
            if (distSq > 0.5 && distSq < repelSq) {
              const dist = Math.sqrt(distSq);
              const force = (1 - dist / repelRadius) * 4.4;
              p.vx += (dx / dist) * force;
              p.vy += (dy / dist) * force;
            }
          }
          // Hookean spring back into formation
          p.vx += -p.ox * 0.085;
          p.vy += -p.oy * 0.085;
          p.vx *= 0.84;
          p.vy *= 0.84;
          p.ox += p.vx;
          p.oy += p.vy;
        }

        const px = baseScreenX + p.ox;
        const py = baseScreenY + p.oy;
        const shimmer = 0.78 + 0.22 * Math.sin(time * 2.8 + p.phase);
        const finalAlpha = Math.min(1, p.alpha * depth * shimmer);
        const radius = Math.max(0.85, p.size * depth * 1.15);

        // Soft outer luminous halo
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${(finalAlpha * 0.24).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, radius * 2.35, 0, Math.PI * 2);
        ctx.fill();

        // Crisp bright core particle
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${finalAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    if (reducedMotion) {
      drawFrame(0);
    } else {
      let lastTs = performance.now();
      const loop = (now: number) => {
        const dt = Math.min(0.05, Math.max(0.008, (now - lastTs) / 1000));
        lastTs = now;
        drawFrame(dt);
        rafId = window.requestAnimationFrame(loop);
      };
      rafId = window.requestAnimationFrame(loop);
    }

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(() => {
        resize();
        if (reducedMotion) drawFrame(0);
      });
      ro.observe(container);
    } else {
      window.addEventListener('resize', resize);
    }

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pointerRef.current = {
      x,
      y,
      nx: (x / Math.max(1, rect.width) - 0.5) * 2,
      ny: (y / Math.max(1, rect.height) - 0.5) * 2,
      active: true,
    };
  }, []);

  const handlePointerLeave = useCallback(() => {
    pointerRef.current.active = false;
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      className="wz-cv-canvas-box relative w-full cursor-crosshair touch-pan-y overflow-hidden rounded-2xl border border-white/10 bg-[#05060A]"
    >
      <canvas
        ref={canvasRef}
        aria-label="Interactive 3D particle spacecraft canvas"
        className="block h-full w-full"
      />
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 backdrop-blur-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FBBF24]" />
        <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-white/80">
          360 PARTICLES · {reducedMotion ? 'STATIC 3D' : 'MOVE TO RIPPLE'}
        </span>
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-[#60A5FA]/30 bg-[#0F172A]/75 px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#93C5FD]">
        REALTIME PERSPECTIVE
      </div>
    </div>
  );
}

/* ---------- World 1: 3D Particle Rocket & Liquid UI Studio ---------- */

function Particle3DWorld({
  identity,
  data,
  language,
  coreLang,
  reducedMotion,
  whatsappHref,
  onCopyBrief,
  copiedBrief,
}: {
  identity: StudioIdentity;
  data: OccasionSiteProps['data'];
  language: LanguageCode;
  coreLang: CoreLanguageCode;
  reducedMotion: boolean;
  whatsappHref: string | null;
  onCopyBrief: () => void;
  copiedBrief: boolean;
}) {
  const copy = WORLD_COPY[coreLang];
  const promptInputId = useId();
  const [pulseNonce, setPulseNonce] = useState(0);
  const [promptMode, setPromptMode] = useState<PromptModeId>('brief');
  const [promptInput, setPromptInput] = useState('');
  const [activeAnswer, setActiveAnswer] = useState<{ q: string; a: string }>({
    q: 'What makes your 3D sites convert?',
    a: `${identity.displayName} blends interactive 3D canvas storytelling with sub-second mobile load times and clear conversion paths — crafted to make visitors stay and reach out.`,
  });
  const [selectedCase, setSelectedCase] = useState<CaseStudyItem | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const casesSectionRef = useRef<HTMLElement | null>(null);

  const userPhotos = useMemo(
    () =>
      (data.photos ?? [])
        .map((src) => (typeof src === 'string' ? src.trim() : ''))
        .filter((src) => src.length > 0 && !failedImages[src]),
    [data.photos, failedImages],
  );

  const caseStudies = useMemo<CaseStudyItem[]>(() => {
    const highlights = data.highlights ?? [];
    return DEFAULT_CASE_STUDIES.map((item, idx) => {
      const override = highlights[idx];
      const customTitle = override ? pickLocalizedText(override.title, language).trim() : '';
      const customDetail = override ? pickLocalizedText(override.detail, language).trim() : '';
      const photo = userPhotos[idx] || item.image;
      return {
        ...item,
        title: customTitle || item.title,
        summary: customDetail || item.summary,
        image: photo,
      };
    });
  }, [data.highlights, language, userPhotos]);

  useEffect(() => {
    if (!selectedCase) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCase(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedCase]);

  const resolvePromptAnswer = useCallback(
    (question: string, mode: PromptModeId): string => {
      const lower = question.toLowerCase();
      if (mode === 'stack' || lower.includes('fps') || lower.includes('webgl') || lower.includes('canvas')) {
        return 'We render DPR-scaled HTML5 Canvas & GPU-composited transforms with zero heavy bundle bloat, maintaining crisp 60fps on phones and pausing smoothly under prefers-reduced-motion.';
      }
      if (mode === 'timeline' || lower.includes('week') || lower.includes('rate') || lower.includes('scope')) {
        return `Typical flagship sprints run 10 to 14 days from art direction to live deployment. Current slot: ${identity.offerTag}. Tap Start a Project below for a tailored scope.`;
      }
      if (lower.includes('copy') || lower.includes('motion')) {
        return `${identity.displayName} handles creative direction, micro-copy, bespoke interaction choreography, and clean production code in one unified sprint.`;
      }
      return `${identity.displayName} pairs tactile 3D particles, editorial dark-mode hierarchy, and fast mobile engineering so your brand feels iconic on every screen.`;
    },
    [identity.displayName, identity.offerTag],
  );

  function handleAskSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = promptInput.trim();
    if (!trimmed) return;
    setActiveAnswer({
      q: trimmed,
      a: resolvePromptAnswer(trimmed, promptMode),
    });
    setPromptInput('');
  }

  function handleChipAsk(chip: string) {
    setActiveAnswer({
      q: chip,
      a: resolvePromptAnswer(chip, promptMode),
    });
  }

  const currentModeConfig =
    PROMPT_MODES.find((m) => m.id === promptMode) ?? PROMPT_MODES[0];

  const headlineWords = identity.headline.trim().split(/\s+/);
  const topHeadlineLine = headlineWords.length >= 2 ? headlineWords[0] : 'BOOST';
  const bottomHeadlineLine =
    headlineWords.length >= 2 ? headlineWords.slice(1).join(' ') : identity.headline;

  return (
    <div className="wz-cv-world-enter flex flex-1 flex-col bg-[#06070B] text-white">
      <div className="mx-auto w-full max-w-[1080px] px-3.5 pb-10 pt-3.5 sm:px-6">
        {/* HERO: 3D PARTICLE ROCKET + EDITORIAL TYPOGRAPHY + LIQUID GLASS CTA */}
        <section className="wz-cv-hero-grid">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 backdrop-blur-xs">
              <span className="h-2 w-2 rounded-full bg-[#FBBF24] shadow-[0_0_10px_#FBBF24]" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/85">
                {identity.displayName}
              </span>
              <span className="text-white/30">·</span>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#93C5FD]">
                {identity.offerTag}
              </span>
            </div>

            <h1
              className="mt-2.5 font-zine text-[40px] font-normal uppercase leading-[0.9] tracking-[0.03em] sm:text-[60px]"
              style={language === 'hi' ? { letterSpacing: 0 } : undefined}
            >
              <span className="wz-cv-outline-stroke block">{topHeadlineLine}</span>
              <span className="block bg-gradient-to-r from-white via-[#FEF3C7] to-[#93C5FD] bg-clip-text text-transparent">
                {bottomHeadlineLine}
              </span>
            </h1>

            <p className="mt-2 max-w-md line-clamp-3 font-sans text-xs leading-relaxed text-white/75 sm:line-clamp-none sm:text-sm">
              {identity.bio}
            </p>

            {/* IRIDESCENT LIQUID-GLASS ACTION PILL */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setPulseNonce((n) => n + 1);
                  casesSectionRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
                }}
                className="wz-cv-liquid-cta group inline-flex min-h-[44px] items-center rounded-full p-[2px] transition-transform duration-200 hover:scale-[1.03] active:scale-95"
              >
                <span className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-[#0B0E17]/90 px-4 py-2 text-xs font-bold tracking-wide text-white backdrop-blur-md transition group-hover:bg-[#101524]/80">
                  <OrbitSvg className="h-4 w-4 text-[#FBBF24]" />
                  <span>{copy.exploreWork}</span>
                  <ArrowUpRightSvg className="h-3.5 w-3.5 text-[#93C5FD] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPulseNonce((n) => n + 1)}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/80 transition hover:border-[#FBBF24]/50 hover:text-[#FEF08A] active:scale-95"
              >
                <span>Ripple 3D</span>
              </button>
            </div>
          </div>

          <ParticleRocketCanvas reducedMotion={reducedMotion} pulseNonce={pulseNonce} />
        </section>

        {/* GLOWING DUAL-AURA AI PROMPT BAR (WARM AMBER LEFT + COOL COBALT RIGHT) */}
        <section className="mt-6" aria-label="Interactive studio concierge">
          <div className="wz-cv-dual-aura rounded-[20px]">
            <div className="rounded-[20px] bg-[#0B0D14]/95 p-3.5 backdrop-blur-xl sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#2563EB] text-white">
                    <SunlitSparkSvg className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
                    STUDIO AI CONCIERGE
                  </span>
                </div>

                {/* Selectable Mode Pills */}
                <div role="tablist" aria-label="Prompt topics" className="flex flex-wrap items-center gap-1">
                  {PROMPT_MODES.map((m) => {
                    const isActive = m.id === promptMode;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => {
                          setPromptMode(m.id);
                          const firstChip = m.chips[0];
                          if (firstChip) {
                            setActiveAnswer({
                              q: firstChip,
                              a: resolvePromptAnswer(firstChip, m.id),
                            });
                          }
                        }}
                        className={`min-h-[32px] rounded-full px-2.5 font-mono text-[10px] font-bold transition ${
                          isActive
                            ? 'bg-white text-[#06070B] shadow-xs'
                            : 'border border-white/15 bg-white/[0.04] text-white/70 hover:border-white/35 hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleAskSubmit} className="mt-3 flex items-center gap-2">
                <label htmlFor={promptInputId} className="sr-only">
                  Ask the studio
                </label>
                <input
                  id={promptInputId}
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder={copy.askPlaceholder}
                  className="min-h-[44px] w-full rounded-xl border border-white/15 bg-black/50 px-3.5 text-xs text-white placeholder:text-white/40 focus:border-[#60A5FA]/70 focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#F59E0B] via-[#FB923C] to-[#3B82F6] px-4 text-xs font-extrabold text-[#06070B] transition hover:brightness-110 active:scale-95"
                >
                  <span>{copy.askSend}</span>
                  <ArrowUpRightSvg className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Clickable Quick-Ask Chips */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {currentModeConfig.chips.map((chip) => {
                  const selected = activeAnswer.q === chip;
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleChipAsk(chip)}
                      className={`min-h-[34px] rounded-full border px-3 text-[11px] font-medium transition active:scale-95 ${
                        selected
                          ? 'border-[#FBBF24]/70 bg-[#FBBF24]/15 text-[#FEF08A]'
                          : 'border-white/15 bg-white/[0.03] text-white/70 hover:border-[#60A5FA]/50 hover:text-white'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>

              {/* Live Concierge Answer Strip */}
              <div
                aria-live="polite"
                className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-3"
              >
                <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#93C5FD]">
                  Q: {activeAnswer.q}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-white/85">{activeAnswer.a}</p>
              </div>
            </div>
          </div>
        </section>

        {/* EDITORIAL DARK SCULPTURE & VALLEY CASE STUDIES */}
        <section ref={casesSectionRef} className="mt-7">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FBBF24]">
                SELECTED ARCHIVE
              </p>
              <h2 className="mt-0.5 font-editorial text-2xl tracking-tight text-white sm:text-3xl">
                Sculptural &amp; Spatial Case Studies
              </h2>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
              01 — 03 · TAP TO INSPECT
            </span>
          </div>

          <div className="wz-cv-cases-grid mt-4">
            {caseStudies.map((study) => (
              <button
                key={study.id}
                type="button"
                onClick={() => setSelectedCase(study)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0D1018] text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/30 active:scale-[0.98]"
              >
                <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#141824]">
                  {!failedImages[study.image] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={study.image}
                      alt={study.title}
                      loading="lazy"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [study.image]: true }))
                      }
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center font-mono text-xs font-bold uppercase tracking-widest text-white/60"
                      style={{
                        background: `linear-gradient(135deg, ${study.accent}45, #0B0D14)`,
                      }}
                    >
                      {study.index} // {study.category}
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D1018] via-transparent to-black/25" />
                  <span className="absolute left-2.5 top-2.5 rounded-full border border-white/20 bg-black/60 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-xs">
                    {study.index} · {study.category}
                  </span>
                  <span
                    className="absolute bottom-2.5 right-2.5 rounded-full px-2.5 py-0.5 font-mono text-[9.5px] font-extrabold text-[#06070B]"
                    style={{ backgroundColor: study.accent }}
                  >
                    {study.metricValue}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate font-sans text-sm font-bold text-white group-hover:text-[#FDE68A]">
                      {study.title}
                    </h3>
                    <span className="shrink-0 font-mono text-[10px] text-white/45">
                      {study.year}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] text-[#93C5FD]/85">{study.subtitle}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/65">
                    {study.summary}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* DIRECT PROJECT / WHATSAPP INQUIRY CARD */}
        <section className="mt-7 rounded-2xl border border-white/15 bg-gradient-to-r from-[#13111C] via-[#0E1320] to-[#0D1526] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#FBBF24]">
                DIRECT LAUNCH UPLINK
              </p>
              <h2 className="mt-0.5 font-editorial text-xl text-white sm:text-2xl">
                Ready to build your interactive flagship?
              </h2>
              <p className="mt-1 text-xs text-white/65">
                {identity.displayName} · {identity.locationTag}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] px-5 text-xs font-extrabold text-[#06070B] shadow-sm transition hover:brightness-110 active:scale-95"
                >
                  <span>{copy.startProject}</span>
                  <ArrowUpRightSvg className="h-3.5 w-3.5" />
                </a>
              ) : null}
              <button
                type="button"
                onClick={onCopyBrief}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/20 bg-white/[0.06] px-4 font-mono text-[11px] font-bold text-white transition hover:border-[#60A5FA] hover:text-[#93C5FD] active:scale-95"
              >
                {copiedBrief ? copy.briefCopied : copy.copyBrief}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* CASE STUDY MODAL (PORTALED OUT OF @CONTAINER BLOCK) */}
      {selectedCase && typeof document !== 'undefined'
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={selectedCase.title}
              onClick={() => setSelectedCase(null)}
              className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 p-3 backdrop-blur-xs sm:p-4"
            >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/15 bg-[#0D1018] p-4 text-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#FBBF24]">
                  CASE {selectedCase.index} · {selectedCase.category}
                </p>
                <h3 className="mt-1 font-editorial text-2xl text-white">{selectedCase.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="min-h-[40px] rounded-xl border border-white/15 px-3 font-mono text-[11px] font-bold text-white/85 hover:bg-white hover:text-[#06070B]"
              >
                {copy.close}
              </button>
            </div>

            <div className="mt-3 aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10 bg-black">
              {!failedImages[selectedCase.image] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={selectedCase.image}
                  alt={selectedCase.title}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            <p className="mt-3 text-xs leading-relaxed text-white/80">{selectedCase.summary}</p>

            <div className="mt-3.5 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <p className="font-mono text-[9.5px] uppercase tracking-wider text-white/50">
                  DELIVERABLES
                </p>
                <ul className="mt-1.5 space-y-1 text-[11px] font-semibold text-white">
                  {selectedCase.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-center rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <p className="font-mono text-[9.5px] uppercase tracking-wider text-white/50">
                  {selectedCase.metricLabel}
                </p>
                <p
                  className="mt-1 font-zine text-3xl tracking-wide"
                  style={{ color: selectedCase.accent }}
                >
                  {selectedCase.metricValue}
                </p>
              </div>
            </div>

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] px-4 text-xs font-extrabold text-[#06070B]"
              >
                {copy.startProject}
              </a>
            ) : null}
          </div>
        </div>,
            document.body,
          )
        : null}
    </div>
  );
}

/* ---------- World 2: Blockfolio & 8-Bit Retro Quest ---------- */

function VoxelQuestWorld({
  identity,
  data,
  coreLang,
  whatsappHref,
  onCopyBrief,
  copiedBrief,
}: {
  identity: StudioIdentity;
  data: OccasionSiteProps['data'];
  coreLang: CoreLanguageCode;
  whatsappHref: string | null;
  onCopyBrief: () => void;
  copiedBrief: boolean;
}) {
  const copy = WORLD_COPY[coreLang];
  const [score, setScore] = useState(6350);
  const [pulseHeartIdx, setPulseHeartIdx] = useState<number | null>(null);
  const [xpPop, setXpPop] = useState<{ id: number; amount: number } | null>(null);
  const [activeBiome, setActiveBiome] = useState<BiomeProject | null>(null);
  const [selectedSwatch, setSelectedSwatch] = useState(BLOCKFOLIO_PALETTE[0]);
  const [timelineIdx, setTimelineIdx] = useState(4);
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>(RPG_ARCHETYPES[1].id);
  const [voxelHeroFailed, setVoxelHeroFailed] = useState(false);
  const [biomePhotoFailed, setBiomePhotoFailed] = useState(false);
  const xpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
      if (heartTimerRef.current) clearTimeout(heartTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!activeBiome) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveBiome(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeBiome]);

  const awardXp = useCallback((amount: number) => {
    setScore((prev) => prev + amount);
    setXpPop({ id: Date.now(), amount });
    if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
    xpTimerRef.current = setTimeout(() => setXpPop(null), 1150);
  }, []);

  const level = 5 + Math.floor((score - 6350) / 600);
  const currentMilestone = RETRO_TIMELINE[timelineIdx] ?? RETRO_TIMELINE[0];
  const activeArchetype =
    RPG_ARCHETYPES.find((role) => role.id === selectedArchetypeId) ?? RPG_ARCHETYPES[0];

  const userPhoto =
    data.photos && data.photos.length > 0 && typeof data.photos[0] === 'string'
      ? data.photos[0].trim()
      : '';

  return (
    <div
      className="wz-cv-world-enter flex flex-1 flex-col bg-[#F7F2E3] text-[#2B231E]"
      style={{
        backgroundImage: 'radial-gradient(rgba(107, 175, 93, 0.14) 1px, transparent 1px)',
        backgroundSize: '18px 18px',
      }}
    >
      <div className="mx-auto w-full max-w-[1080px] px-3.5 pb-10 pt-3.5 sm:px-6">
        {/* LIVE TOP ARCADE HUD: 3 PIXEL HEARTS + LEVEL + INTERACTIVE SCORE + FLOATING +XP POP */}
        <header className="wz-cv-pixel-box sticky top-2 z-20 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#FAF4DC]/95 px-3 py-2 backdrop-blur-xs">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((idx) => (
              <button
                key={`heart-${idx}`}
                type="button"
                aria-label={`Pixel heart ${idx + 1}`}
                onClick={() => {
                  setPulseHeartIdx(idx);
                  if (heartTimerRef.current) clearTimeout(heartTimerRef.current);
                  heartTimerRef.current = setTimeout(() => setPulseHeartIdx(null), 320);
                  awardXp(50);
                }}
                className={`flex h-7 w-7 items-center justify-center rounded-md border border-[#2B231E]/20 bg-white/70 transition hover:scale-110 active:scale-95 ${
                  pulseHeartIdx === idx ? 'scale-125 bg-[#FEF08A]' : ''
                }`}
              >
                <PixelHeartSvg filled />
              </button>
            ))}
            <span className="ml-1 hidden font-pixel text-[10px] uppercase tracking-wider text-[#2B231E]/80 xs:inline">
              {identity.displayName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-md border border-[#2B231E]/30 bg-[#FDE047] px-2 py-0.5 font-pixel text-[10px] font-bold uppercase tracking-wider text-[#2B231E]">
              LEVEL {level}
            </span>

            <div className="relative flex items-center gap-1.5 font-pixel text-[11px] font-bold tracking-wider text-[#2B231E]">
              <span className="text-[#2B231E]/65">SCORE:</span>
              <span className="font-tabular text-[#15803D]">{score}</span>
              {xpPop ? (
                <span
                  key={xpPop.id}
                  aria-live="polite"
                  className="wz-cv-xp-pop pointer-events-none absolute -top-5 right-0 whitespace-nowrap rounded-md border border-[#2B231E] bg-[#6BAF5D] px-1.5 py-0.5 font-pixel text-[9px] font-bold text-white"
                >
                  +{xpPop.amount} XP
                </span>
              ) : null}
            </div>
          </div>
        </header>

        {/* VOXEL HERO (BLOCKFOLIO INSPIRED) */}
        <section className="wz-cv-pixel-box mt-4 overflow-hidden rounded-2xl bg-[#FAF8F2]">
          <div className="wz-cv-hero-grid p-4 sm:p-6">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#6BAF5D]/40 bg-[#6BAF5D]/15 px-2.5 py-1">
                <VoxelCubeSvg className="h-3.5 w-3.5 text-[#3F7A34]" />
                <span className="font-pixel text-[9.5px] uppercase tracking-[0.14em] text-[#2F5E26]">
                  BLOCKFOLIO · {identity.displayName}
                </span>
              </div>

              <h1 className="mt-3 font-pixel text-[26px] font-bold leading-[1.12] tracking-tight text-[#2B231E] sm:text-[36px]">
                Build · Create{' '}
                <span className="text-[#569848]">Explore</span>
              </h1>

              <p className="mt-2.5 font-sans text-xs leading-relaxed text-[#2B231E]/75 sm:text-sm">
                {identity.bio}
              </p>

              {/* Interactive Blockfolio Palette Strip */}
              <div className="mt-4 rounded-xl border border-[#2B231E]/15 bg-white p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-pixel text-[9px] uppercase tracking-wider text-[#2B231E]/60">
                    WORLD PALETTE
                  </span>
                  <span className="font-mono text-[10px] font-bold text-[#2B231E]">
                    {selectedSwatch.name} · {selectedSwatch.hex}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-5 gap-1.5">
                  {BLOCKFOLIO_PALETTE.map((swatch) => {
                    const active = swatch.hex === selectedSwatch.hex;
                    return (
                      <button
                        key={swatch.hex}
                        type="button"
                        aria-label={`Select color ${swatch.name}`}
                        aria-pressed={active}
                        onClick={() => {
                          setSelectedSwatch(swatch);
                          awardXp(50);
                        }}
                        className={`h-8 rounded-lg border-2 transition hover:-translate-y-0.5 ${
                          active ? 'border-[#2B231E] scale-105' : 'border-black/10'
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border-2 border-[#2B231E] bg-[#A7D8FF]">
              <div className="aspect-[16/11] w-full overflow-hidden">
                {!voxelHeroFailed ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src="/templates/creative/blockfolio.jpg"
                    alt="Sunlit voxel world showcase"
                    onError={() => setVoxelHeroFailed(true)}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <BiomeVoxelArtSvg id="meadow-windmill" />
                )}
              </div>
              <div className="flex items-center justify-between border-t-2 border-[#2B231E] bg-[#6BAF5D] px-3 py-1.5 text-white">
                <span className="font-pixel text-[9.5px] uppercase tracking-wider">
                  BIOME BUILDER · V2.6
                </span>
                <span className="font-mono text-[10px] font-bold">
                  +150 XP / QUEST
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE BIOME PROJECT CARDS */}
        <section className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="font-pixel text-[9.5px] uppercase tracking-wider text-[#569848]">
                FEATURED BIOMES
              </p>
              <h2 className="mt-0.5 font-pixel text-lg font-bold text-[#2B231E]">
                Explore Worlds (+150 XP)
              </h2>
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#2B231E]/60">
              CLICK CARD FOR SPECS
            </span>
          </div>

          <div className="wz-cv-biome-grid mt-3.5">
            {BIOME_PROJECTS.map((project, idx) => (
              <button
                key={project.id}
                type="button"
                onClick={() => {
                  setActiveBiome(project);
                  awardXp(project.xpReward);
                }}
                className="wz-cv-pixel-btn group flex flex-col overflow-hidden rounded-xl bg-white text-left hover:-translate-y-0.5"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden border-b-2 border-[#2B231E] bg-[#E0F2FE]">
                  {idx === 0 && userPhoto && !biomePhotoFailed ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={userPhoto}
                      alt={project.title}
                      onError={() => setBiomePhotoFailed(true)}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <BiomeVoxelArtSvg id={project.id} />
                  )}
                  <span
                    className="absolute right-1.5 top-1.5 rounded border border-[#2B231E] px-1.5 py-0.5 font-pixel text-[8px] font-bold text-white"
                    style={{ backgroundColor: project.accent }}
                  >
                    +150 XP
                  </span>
                </div>
                <div className="p-2.5">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#2B231E]/55">
                    {project.biome}
                  </p>
                  <h3 className="mt-0.5 truncate font-pixel text-xs font-bold text-[#2B231E]">
                    {project.title}
                  </h3>
                  <p className="mt-1 font-mono text-[9.5px] text-[#569848]">{project.blocks}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* INTERACTIVE 8-BIT TIMELINE SCRUBBER (2018 - 2026) — RETRO FOREVER INSPIRED */}
        <section className="wz-cv-pixel-box mt-6 overflow-hidden rounded-2xl bg-[#FBD45A] p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-md border-2 border-[#2B231E] bg-[#FAF4DC] px-2.5 py-0.5 font-pixel text-[9.5px] font-bold uppercase text-[#2B231E]">
              RETRO TIMELINE · {currentMilestone.badge}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous year"
                onClick={() => {
                  setTimelineIdx((prev) => (prev - 1 + RETRO_TIMELINE.length) % RETRO_TIMELINE.length);
                  awardXp(150);
                }}
                className="wz-cv-pixel-btn flex h-9 w-9 items-center justify-center rounded-lg bg-[#FAF4DC] font-pixel text-xs font-bold text-[#2B231E]"
              >
                &lt;
              </button>
              <button
                type="button"
                aria-label="Next year"
                onClick={() => {
                  setTimelineIdx((prev) => (prev + 1) % RETRO_TIMELINE.length);
                  awardXp(150);
                }}
                className="wz-cv-pixel-btn flex h-9 w-9 items-center justify-center rounded-lg bg-[#FAF4DC] font-pixel text-xs font-bold text-[#2B231E]"
              >
                &gt;
              </button>
            </div>
          </div>

          {/* Embossed huge pixel year + cream story card */}
          <div className="relative mt-3 flex flex-col items-center py-2 text-center">
            <span
              aria-hidden="true"
              className="select-none font-pixel text-[36px] font-bold leading-none tracking-[0.08em] text-[#E6B83C] xs:text-[46px] sm:text-[78px] sm:tracking-[0.12em]"
            >
              {currentMilestone.year}
            </span>

            <div className="-mt-4 w-full max-w-lg rounded-xl border-2 border-[#2B231E] bg-[#FAF4DC] p-3.5 text-left shadow-[0_3px_0_#2B231E]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-pixel text-sm font-bold text-[#2B231E]">
                  {currentMilestone.title}
                </h3>
                <span className="rounded bg-[#6BAF5D]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#2F5E26]">
                  {currentMilestone.highlight}
                </span>
              </div>
              <p className="mt-1.5 font-sans text-xs leading-relaxed text-[#2B231E]/80">
                {currentMilestone.story}
              </p>
            </div>
          </div>

          {/* Segmented Amber / Cobalt Pixel Progress Bar */}
          <div className="mt-4">
            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1 rounded-md border-2 border-[#2B231E] bg-[#FCE89C] p-1">
              {Array.from({ length: 20 }).map((_, segIdx) => {
                const filledCount = Math.round(((timelineIdx + 1) / RETRO_TIMELINE.length) * 20);
                const filled = segIdx < filledCount;
                return (
                  <span
                    key={`seg-${segIdx}`}
                    className={`h-2.5 rounded-[1px] transition-colors ${
                      filled ? 'bg-[#0284C7]' : 'bg-[#E5C86B]/50'
                    }`}
                  />
                );
              })}
            </div>

            {/* Clickable Year Nodes */}
            <div className="mt-2.5 grid grid-cols-5 gap-1.5">
              {RETRO_TIMELINE.map((node, idx) => {
                const isSelected = idx === timelineIdx;
                return (
                  <button
                    key={node.year}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setTimelineIdx(idx);
                      awardXp(150);
                    }}
                    className={`min-h-[36px] rounded-lg border-2 px-1 font-pixel text-[8.5px] font-bold transition sm:text-[10px] ${
                      isSelected
                        ? 'border-[#2B231E] bg-[#2B231E] text-[#FBD45A]'
                        : 'border-[#2B231E]/35 bg-[#FAF4DC]/75 text-[#2B231E] hover:border-[#2B231E]'
                    }`}
                  >
                    {node.year}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* RPG CHARACTER / SKILL SELECTOR ROSTER */}
        <section className="wz-cv-pixel-box mt-6 rounded-2xl bg-[#FAF4DC] p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#2B231E]/60">
                BEHIND EVERY BUILD, THERE IS CRAFT
              </p>
              <h2 className="mt-0.5 font-pixel text-xl font-bold uppercase text-[#2B231E]">
                {activeArchetype.name}
              </h2>
            </div>
            <span className="font-pixel text-[9.5px] uppercase text-[#E53935]">
              SELECT CLASS (+150 XP)
            </span>
          </div>

          <div className="wz-cv-roster-grid mt-4">
            {RPG_ARCHETYPES.map((member) => {
              const isSelected = member.id === activeArchetype.id;
              return (
                <button
                  key={member.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedArchetypeId(member.id);
                    awardXp(150);
                  }}
                  className={`group relative flex flex-col overflow-hidden rounded-xl border-[3px] text-left transition-all ${
                    isSelected
                      ? 'border-[#E53935] bg-[#E53935] shadow-[0_4px_0_#991B1B] -translate-y-0.5'
                      : 'border-[#2B231E]/30 bg-white hover:border-[#2B231E]'
                  }`}
                >
                  <div className="aspect-square w-full overflow-hidden">
                    <RpgArchetypeAvatarSvg id={member.id} active={isSelected} />
                  </div>
                  <div
                    className={`px-2 py-1.5 text-center font-pixel text-[10px] font-bold uppercase tracking-wider ${
                      isSelected ? 'text-white' : 'text-[#2B231E]'
                    }`}
                  >
                    {member.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Archetype Stats & Equipped Tools */}
          <div className="mt-4 rounded-xl border-2 border-[#2B231E] bg-white p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-pixel text-xs font-bold uppercase text-[#E53935]">
                  {activeArchetype.name} // {activeArchetype.role}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#2B231E]/80">
                  {activeArchetype.tagline}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeArchetype.tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-md border border-[#2B231E]/25 bg-[#FAF4DC] px-2 py-1 font-mono text-[10px] font-bold text-[#2B231E]"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {activeArchetype.stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-[#2B231E]/15 bg-[#FAF8F2] p-2">
                  <div className="flex items-center justify-between font-pixel text-[9px] font-bold text-[#2B231E]">
                    <span>{stat.label}</span>
                    <span>{stat.value}</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-xs border border-[#2B231E]/30 bg-white">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${stat.value}%`,
                        backgroundColor: activeArchetype.accent,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VOXEL QUEST START PROJECT CTA */}
        <section className="wz-cv-pixel-box mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#6BAF5D] p-4 text-white sm:p-5">
          <div>
            <p className="font-pixel text-[10px] uppercase tracking-wider text-[#FEF08A]">
              NEW QUEST UNLOCKED
            </p>
            <h2 className="mt-0.5 font-pixel text-base font-bold sm:text-lg">
              Build small ideas into big worlds.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="wz-cv-pixel-btn inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#FDE047] px-4 font-pixel text-[11px] font-bold uppercase text-[#2B231E]"
              >
                {copy.startProject}
              </a>
            ) : null}
            <button
              type="button"
              onClick={onCopyBrief}
              className="wz-cv-pixel-btn inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#FAF4DC] px-4 font-pixel text-[10.5px] font-bold uppercase text-[#2B231E]"
            >
              {copiedBrief ? copy.briefCopied : copy.copyBrief}
            </button>
          </div>
        </section>
      </div>

      {/* EXPANDED BIOME SPEC MODAL (PORTALED OUT OF @CONTAINER BLOCK) */}
      {activeBiome && typeof document !== 'undefined'
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={activeBiome.title}
              onClick={() => setActiveBiome(null)}
              className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-4"
            >
          <div
            onClick={(e) => e.stopPropagation()}
            className="wz-cv-pixel-box max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-[#FAF4DC] p-4 text-[#2B231E]"
          >
            <div className="flex items-start justify-between gap-3 border-b-2 border-[#2B231E]/15 pb-3">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#569848]">
                  {activeBiome.biome} · {activeBiome.seed}
                </p>
                <h3 className="mt-0.5 font-pixel text-lg font-bold text-[#2B231E]">
                  {activeBiome.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveBiome(null)}
                className="wz-cv-pixel-btn min-h-[38px] rounded-lg bg-white px-3 font-pixel text-[10px] font-bold text-[#2B231E]"
              >
                {copy.close}
              </button>
            </div>

            <div className="mt-3 aspect-[16/10] w-full overflow-hidden rounded-xl border-2 border-[#2B231E]">
              <BiomeVoxelArtSvg id={activeBiome.id} />
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[#2B231E]/85">
              {activeBiome.summary}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {activeBiome.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-[#2B231E]/30 bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-[#2B231E]"
                >
                  {tech}
                </span>
              ))}
            </div>

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="wz-cv-pixel-btn mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#6BAF5D] px-4 font-pixel text-[11px] font-bold uppercase text-white"
              >
                {copy.startProject}
              </a>
            ) : null}
          </div>
        </div>,
            document.body,
          )
        : null}
    </div>
  );
}

/* ---------- World 3: Creatie Sunlit Sky & Picnic Notebook ---------- */

function ScrapbookCreatieWorld({
  identity,
  data,
  coreLang,
  reducedMotion,
  whatsappHref,
  onCopyBrief,
  copiedBrief,
}: {
  identity: StudioIdentity;
  data: OccasionSiteProps['data'];
  coreLang: CoreLanguageCode;
  reducedMotion: boolean;
  whatsappHref: string | null;
  onCopyBrief: () => void;
  copiedBrief: boolean;
}) {
  const copy = WORLD_COPY[coreLang];
  const [activeBadgeId, setActiveBadgeId] = useState<string>(CREATIE_BADGES[0].id);
  const [activeDock, setActiveDock] = useState<'hills' | 'notebook' | 'reach' | 'contact'>('hills');
  const [activeTabId, setActiveTabId] = useState<string>(SCRAPBOOK_TABS[0].id);
  const [activeReachId, setActiveReachId] = useState<string>(SCRAPBOOK_REACH_CARDS[0].id);
  const [hillsImgFailed, setHillsImgFailed] = useState(false);
  const [polaroidFailed, setPolaroidFailed] = useState(false);
  const [fallbackScrapbookFailed, setFallbackScrapbookFailed] = useState(false);
  const [polaroidZoomed, setPolaroidZoomed] = useState(false);
  const [caseStackIdx, setCaseStackIdx] = useState(0);

  const hillsCases = useMemo(
    () => [
      { tag: '2026 · MOTION', title: 'SUNLIT LAUNCH PAGE', detail: 'View Notebook' },
      { tag: '2026 · BRAND', title: 'PASTEL CREATOR KIT', detail: 'View Social Reach' },
      { tag: '2025 · 3D WEB', title: 'INTERACTIVE FOLIO', detail: 'Start a Sprint' },
    ],
    [],
  );
  const activeStackCase = hillsCases[caseStackIdx] ?? hillsCases[0];

  const hillsRef = useRef<HTMLElement | null>(null);
  const notebookRef = useRef<HTMLElement | null>(null);
  const reachRef = useRef<HTMLElement | null>(null);
  const contactRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!polaroidZoomed) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPolaroidZoomed(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [polaroidZoomed]);

  const userPhoto =
    data.photos && data.photos.length > 0 && typeof data.photos[0] === 'string'
      ? data.photos[0].trim()
      : '';
  const polaroidSrc = !polaroidFailed && userPhoto ? userPhoto : '/templates/creative/scrapbook-ugc.jpg';

  const activeBadge =
    CREATIE_BADGES.find((b) => b.id === activeBadgeId) ?? CREATIE_BADGES[0];
  const activeTab =
    SCRAPBOOK_TABS.find((t) => t.id === activeTabId) ?? SCRAPBOOK_TABS[0];
  const activeReach =
    SCRAPBOOK_REACH_CARDS.find((c) => c.id === activeReachId) ?? SCRAPBOOK_REACH_CARDS[0];

  function jumpToDockSection(target: 'hills' | 'notebook' | 'reach' | 'contact') {
    setActiveDock(target);
    const map = {
      hills: hillsRef.current,
      notebook: notebookRef.current,
      reach: reachRef.current,
      contact: contactRef.current,
    };
    map[target]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  return (
    <div className="wz-cv-world-enter flex flex-1 flex-col bg-[#FFF6F8] text-[#2B1B2E]">
      {/* SUNLIT ROLLING HILLS HERO (CREATIE INSPIRED) */}
      <section
        ref={hillsRef}
        className="relative flex min-h-[460px] w-full flex-col justify-between overflow-hidden px-4 pb-5 pt-4 sm:min-h-[540px] sm:px-7"
        style={{
          background: 'linear-gradient(180deg, #4B7BA3 0%, #6D9BBD 42%, #7D9634 75%, #4A6627 100%)',
        }}
      >
        {!hillsImgFailed ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src="/templates/creative/creatie-hills.jpg"
            alt="Sunlit rolling green hills sky"
            onError={() => setHillsImgFailed(true)}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : null}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#2A4C6B]/45 via-black/10 to-[#293B14]/65"
        />

        {/* Top Row: Brand Wordmark + Glass Availability Card */}
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-[235px] rounded-2xl border border-white/35 bg-white/20 p-3 text-white shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/30 font-mono text-[10px] font-extrabold text-white">
                {identity.initials}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#4ADE80] shadow-[0_0_8px_#4ADE80]" />
                  <span className="text-[10px] font-semibold text-white/90">
                    {copy.availableForWork}
                  </span>
                </div>
                <p className="truncate font-sans text-[11px] font-extrabold uppercase tracking-wide text-white">
                  {identity.displayName}
                </p>
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-[10.5px] leading-snug text-white/90">
              {identity.roleTitle} · {identity.locationTag}
            </p>
          </div>

          <span className="rounded-full border border-white/30 bg-black/20 px-3 py-1 font-sans text-[10px] font-extrabold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
            CREATIE LAB
          </span>
        </div>

        {/* Centerpiece Kinetic White Headline + Floating Tilted Pastel Skill Badges */}
        <div className="relative z-10 mx-auto my-5 max-w-xl text-center sm:my-6">
          <h1 className="font-festive text-[26px] font-extrabold uppercase leading-[0.98] tracking-[-0.03em] text-white drop-shadow-[0_6px_22px_rgba(0,0,0,0.28)] xs:text-[32px] sm:text-[52px]">
            DESIGN THAT MAKES PEOPLE LOOK TWICE
          </h1>

          {/* Floating Tilted Pastel Skill Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            {CREATIE_BADGES.map((badge, idx) => {
              const selected = badge.id === activeBadge.id;
              return (
                <button
                  key={badge.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveBadgeId(badge.id)}
                  style={
                    {
                      backgroundColor: badge.bg,
                      '--wz-tilt': badge.tilt,
                      animationDelay: `${idx * 0.45}s`,
                    } as React.CSSProperties
                  }
                  className={`wz-cv-bob inline-flex min-h-[38px] items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold text-[#1E1B2E] shadow-[0_10px_20px_-8px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 ${
                    selected ? 'border-white ring-2 ring-white/70' : 'border-white/70'
                  }`}
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: badge.iconBg }}
                  >
                    <SunlitSparkSvg className="h-2.5 w-2.5" />
                  </span>
                  <span>{badge.label}</span>
                </button>
              );
            })}
          </div>

          <p className="mx-auto mt-3 max-w-sm rounded-full border border-white/25 bg-black/30 px-3.5 py-1.5 text-[11px] font-medium text-white/95 backdrop-blur-md">
            {activeBadge.note}
          </p>
        </div>

        {/* Bottom Row: Editorial Tagline + Working Glass macOS Dock + Stacked Case Study Card */}
        <div className="relative z-10 flex flex-col items-center justify-between gap-3 sm:flex-row sm:items-end">
          <p className="text-center font-sans text-xs font-medium text-white/90 drop-shadow-sm sm:text-left">
            — Not just visuals. We make digital things look alive.
          </p>

          {/* Working Glass macOS Dock */}
          <nav
            aria-label="Sunlit studio dock"
            className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/25 px-2.5 py-2 shadow-[0_14px_30px_-8px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            {(
              [
                { id: 'hills', label: 'Hero Hills' },
                { id: 'notebook', label: 'About Notebook' },
                { id: 'reach', label: 'Social Reach' },
                { id: 'contact', label: 'Start Project' },
              ] as const
            ).map((item) => {
              const isCurrent = activeDock === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  title={item.label}
                  onClick={() => jumpToDockSection(item.id)}
                  className="group relative flex h-11 w-11 flex-col items-center justify-center rounded-xl transition-transform duration-200 hover:-translate-y-1.5 hover:scale-110 active:scale-95"
                >
                  <DockIconSvg kind={item.id} />
                  <span
                    className={`mt-0.5 h-1 w-1 rounded-full transition-opacity ${
                      isCurrent ? 'bg-white opacity-100' : 'opacity-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Stacked Glass Case Study Mini-Card */}
          <button
            type="button"
            onClick={() => setCaseStackIdx((prev) => (prev + 1) % hillsCases.length)}
            className="relative hidden w-[210px] rounded-2xl border border-white/40 bg-white/20 p-2.5 text-left text-white shadow-lg backdrop-blur-md transition hover:bg-white/30 active:scale-95 sm:block"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-1.5 left-3 right-3 h-2 rounded-t-xl border-x border-t border-white/30 bg-white/15"
            />
            <p className="font-mono text-[8.5px] font-bold uppercase tracking-[0.16em] text-white/80">
              {activeStackCase.tag}
            </p>
            <p className="mt-0.5 truncate font-sans text-[11px] font-extrabold text-white">
              {activeStackCase.title}
            </p>
            <p className="mt-1 font-mono text-[9.5px] font-semibold text-white/85">
              {activeStackCase.detail} · Next &gt;
            </p>
          </button>
        </div>
      </section>

      {/* SPIRAL-BOUND PICNIC GINGHAM NOTEBOOK (UGC SCRAPBOOK INSPIRED) */}
      <section ref={notebookRef} className="wz-cv-gingham px-3.5 py-7 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-[960px]">
          <div className="wz-cv-notebook-spread relative overflow-hidden rounded-2xl border border-[#D6B8BE] bg-[#FFFDFA] shadow-[0_24px_48px_-20px_rgba(92,38,54,0.34)]">
            {/* LEFT NOTEBOOK PAGE: KRAFT "ABOUT ME!" + TAPED POLAROID PHOTO */}
            <div className="relative flex flex-col justify-between bg-[#FFFDFA] p-5 sm:p-6">
              {/* Torn Kraft Paper Corner Sticker */}
              <div className="relative -ml-2 -mt-2 inline-block w-fit -rotate-2 rounded-br-2xl rounded-tl-xl bg-[#B38862] px-5 py-3 text-white shadow-sm">
                <p className="font-playful text-2xl font-bold leading-none tracking-tight sm:text-3xl">
                  about
                </p>
                <p className="font-playful text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
                  me!
                </p>
              </div>

              {/* Taped Polaroid Frame */}
              <div className="relative mx-auto mt-5 w-full max-w-[260px]">
                {/* Translucent masking tape */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-2.5 left-1/2 z-10 h-5 w-16 -translate-x-1/2 -rotate-3 rounded-[2px] bg-[#FDE68A]/75 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setPolaroidZoomed(true)}
                  aria-label="Inspect creator polaroid photo"
                  className="group block w-full -rotate-1 rounded-lg border border-stone-200 bg-white p-2 pb-7 text-left shadow-[0_14px_26px_-14px_rgba(43,27,46,0.35)] transition-transform duration-300 hover:rotate-0 hover:scale-[1.02]"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-sm bg-rose-50">
                    {!(polaroidFailed && fallbackScrapbookFailed) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={polaroidSrc}
                        alt={identity.displayName}
                        onError={() => {
                          if (!polaroidFailed && userPhoto) {
                            setPolaroidFailed(true);
                          } else {
                            setPolaroidFailed(true);
                            setFallbackScrapbookFailed(true);
                          }
                        }}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FBCFE8] to-[#BAE6FD] font-playful text-2xl font-extrabold text-white">
                        {identity.initials}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-center font-handwritten text-lg font-bold text-[#5C444D]">
                    {identity.displayName} · studio reel
                  </p>
                </button>
              </div>
            </div>

            {/* METALLIC SPIRAL BINDING RINGS (VERTICAL ON DESKTOP / HORIZONTAL ON 390px) */}
            <div
              aria-hidden="true"
              className="wz-cv-spiral-vert flex-col items-center justify-around border-x border-stone-200/80 bg-gradient-to-r from-stone-200/60 via-stone-100 to-stone-200/60 py-3"
            >
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={`ring-v-${idx}`} className="flex w-full items-center justify-between px-0.5">
                  <span className="h-2 w-2 rounded-full bg-stone-500/80" />
                  <span className="h-1.5 flex-1 -mx-0.5 rounded-full bg-gradient-to-b from-stone-300 via-stone-600 to-stone-900 shadow-xs" />
                  <span className="h-2 w-2 rounded-full bg-stone-500/80" />
                </div>
              ))}
            </div>

            <div
              aria-hidden="true"
              className="wz-cv-spiral-horiz items-center justify-around border-y border-stone-200 bg-stone-100/90 px-3 py-2"
            >
              {Array.from({ length: 10 }).map((_, idx) => (
                <span
                  key={`ring-h-${idx}`}
                  className="h-4 w-1.5 rounded-full bg-gradient-to-r from-stone-400 via-stone-700 to-stone-400"
                />
              ))}
            </div>

            {/* RIGHT NOTEBOOK PAGE: HANDWRITTEN BIO & INTERACTIVE NOTES */}
            <div className="occasion-stationery-lined flex flex-col justify-between p-5 sm:p-7">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#B85D78]">
                  CREATOR NOTEBOOK
                </p>
                <h2 className="mt-1 font-playful text-2xl font-extrabold tracking-tight text-[#2B1B2E] sm:text-3xl">
                  hi, i&apos;m {identity.displayName}
                </h2>
                <p className="mt-3 font-handwritten text-[21px] font-semibold leading-snug text-[#3D2A36]">
                  {identity.bio}
                </p>

                {/* Interactive Sticker Note Tabs */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {SCRAPBOOK_TABS.map((tab) => {
                    const isActive = tab.id === activeTab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`min-h-[36px] rounded-full border px-3 text-xs font-bold transition ${
                          isActive
                            ? 'border-[#D95D82] bg-[#FCE7F3] text-[#831843]'
                            : 'border-stone-300 bg-white/85 text-stone-600 hover:border-[#D95D82]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 rounded-xl border border-[#EBC6D2] bg-white/90 p-3 text-xs leading-relaxed text-[#4A3542] shadow-2xs">
                  {activeTab.text}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#D6B8BE] pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#9A5B6E]">
                <span>{identity.locationTag}</span>
                <span>{identity.offerTag}</span>
              </div>
            </div>
          </div>

          {/* 4 TILTED PAPERCLIPPED PASTEL REACH CARDS */}
          <section ref={reachRef} className="mt-6" aria-label="Creator reach highlights">
            <div className="wz-cv-reach-grid">
              {SCRAPBOOK_REACH_CARDS.map((card) => {
                const selected = card.id === activeReach.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setActiveReachId(card.id)}
                    style={{ backgroundColor: card.bg }}
                    className={`group relative flex min-h-[124px] flex-col items-center justify-center rounded-sm p-4 pt-6 text-center text-white shadow-[0_14px_24px_-12px_rgba(43,27,46,0.32)] transition-all duration-300 hover:z-10 hover:rotate-0 hover:scale-[1.03] ${card.tiltClass} ${
                      selected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#FFF6F8]' : ''
                    }`}
                  >
                    <span className="pointer-events-none absolute -top-3 left-3">
                      <PaperclipSvg className="h-8 w-7" />
                    </span>
                    <span className="font-playful text-3xl font-extrabold leading-none drop-shadow-sm">
                      {card.stat}
                    </span>
                    <span className="mt-1 font-playful text-sm font-bold tracking-wide text-white/95">
                      {card.platform}
                    </span>
                    <span className="mt-2 font-mono text-[9.5px] font-semibold text-white/80">
                      {card.handle}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-[#E7BDC8] bg-white/95 px-4 py-2.5 text-center text-xs font-medium text-[#4A3542] shadow-xs backdrop-blur-xs">
              <strong className="font-bold text-[#9D174D]">
                {activeReach.stat} {activeReach.platform}:
              </strong>{' '}
              {activeReach.proof}
            </div>
          </section>

          {/* PICNIC POSTCARD WHATSAPP / START PROJECT CTA */}
          <section
            ref={contactRef}
            className="mt-6 rounded-2xl border-2 border-dashed border-[#D98EA2] bg-[#FFFDFA] p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#BE185D]">
                  SEND A STUDIO POSTCARD
                </p>
                <h2 className="mt-0.5 font-playful text-xl font-bold text-[#2B1B2E]">
                  Let&apos;s make something people look twice at.
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-[#E11D63] px-5 text-xs font-extrabold text-white shadow-sm transition hover:brightness-110 active:scale-95"
                  >
                    <span>{copy.startProject}</span>
                    <ArrowUpRightSvg className="h-3.5 w-3.5" />
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={onCopyBrief}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#D98EA2] bg-rose-50 px-4 text-xs font-bold text-[#831843] transition hover:bg-rose-100 active:scale-95"
                >
                  {copiedBrief ? copy.briefCopied : copy.copyBrief}
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* POLAROID ZOOM LIGHTBOX (PORTALED OUT OF @CONTAINER BLOCK) */}
      {polaroidZoomed && typeof document !== 'undefined'
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Expanded creator polaroid"
              onClick={() => setPolaroidZoomed(false)}
              className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-3 backdrop-blur-xs sm:p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl bg-white p-3 shadow-2xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={polaroidSrc}
                  alt={identity.displayName}
                  className="max-h-[68dvh] w-full rounded-xl bg-rose-50 object-contain"
                />
                <div className="mt-2.5 flex items-center justify-between px-1">
                  <span className="font-handwritten text-xl font-bold text-[#2B1B2E]">
                    {identity.displayName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPolaroidZoomed(false)}
                    className="min-h-[40px] rounded-xl bg-[#E11D63] px-4 text-xs font-bold text-white"
                  >
                    {copy.close}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

/* ---------- Main Exported Component: CreativeVoxelSite ---------- */

export function CreativeVoxelSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const reducedMotion = usePrefersReducedMotion();
  const coreLang = toCoreLanguageCode(language);
  const copy = WORLD_COPY[coreLang];

  const [activeWorld, setActiveWorld] = useState<CreativeWorldMode>(() =>
    resolveWorldMode(data.relation),
  );
  const [copiedBrief, setCopiedBrief] = useState(false);
  const openedOnceRef = useRef(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync automatically whenever data.relation updates in preview/editor
  useEffect(() => {
    setActiveWorld(resolveWorldMode(data.relation));
  }, [data.relation]);

  useEffect(() => {
    if (openedOnceRef.current) return;
    openedOnceRef.current = true;
    onOpened?.();
  }, [onOpened]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const identity = useMemo(
    () => parseStudioIdentity(data, language),
    [data, language],
  );

  const inquiryBrief = useMemo(
    () =>
      `Hi ${identity.displayName}, loved your ${copy.modes[activeWorld]} experience and want to start a project together.`,
    [identity.displayName, copy.modes, activeWorld],
  );

  const whatsappHref = useMemo(
    () => buildWhatsAppUrl(data.whatsappPhone, inquiryBrief),
    [data.whatsappPhone, inquiryBrief],
  );

  const handleCopyBrief = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(inquiryBrief).catch(() => {});
    }
    setCopiedBrief(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedBrief(false), 2200);
  }, [inquiryBrief]);

  const isDarkWorld = activeWorld === 'particle3d';
  const outerBg =
    activeWorld === 'particle3d'
      ? '#06070B'
      : activeWorld === 'voxel'
        ? '#F7F2E3'
        : '#FFF6F8';

  const footerClass =
    activeWorld === 'particle3d'
      ? 'border-t border-white/10 bg-[#05060A] text-white/55'
      : activeWorld === 'voxel'
        ? 'border-t-2 border-[#2B231E]/20 bg-[#EFE8D2] text-[#2B231E]/75'
        : 'border-t border-[#EBC6D2] bg-[#FFF0F4] text-[#6B4354]';

  const worldModes: ReadonlyArray<{
    id: CreativeWorldMode;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'particle3d', label: copy.modes.particle3d, icon: <OrbitSvg className="h-3.5 w-3.5" /> },
    { id: 'voxel', label: copy.modes.voxel, icon: <VoxelCubeSvg className="h-3.5 w-3.5" /> },
    { id: 'scrapbook', label: copy.modes.scrapbook, icon: <SunlitSparkSvg className="h-3.5 w-3.5" /> },
  ];

  return (
    <div
      data-theme-id={manifest.id}
      className="wz-cv-shell relative flex min-h-full w-full flex-col justify-between overflow-x-clip rounded-[28px]"
      style={{ backgroundColor: outerBg }}
    >
      <style>{CREATIVE_VOXEL_CSS}</style>

      {watermarked ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none relative z-30 flex justify-center border-b py-1.5 font-mono text-[10px] font-bold tracking-[0.18em] ${
            isDarkWorld
              ? 'border-white/15 bg-[#0D1018]/90 text-[#FBBF24]'
              : 'border-black/10 bg-white/85 text-[#2B1B2E]/75'
          }`}
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      {/* TOP STUDIO BAR WITH INTERACTIVE CHROMATIC LIQUID-GLASS "ART MODE" SWITCHER */}
      <div
        className={`relative z-30 border-b px-3 py-2 sm:px-5 sm:py-2.5 ${
          isDarkWorld
            ? 'border-white/10 bg-[#080A11]/90 text-white backdrop-blur-md'
            : activeWorld === 'voxel'
              ? 'border-[#2B231E]/15 bg-[#FAF4DC]/95 text-[#2B231E] backdrop-blur-md'
              : 'border-[#EBC6D2]/80 bg-white/85 text-[#2B1B2E] backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1080px] flex-wrap items-center justify-between gap-2">
          {/* Studio Emblem */}
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-xs"
              style={{
                background:
                  activeWorld === 'particle3d'
                    ? 'linear-gradient(135deg, #F59E0B, #2563EB)'
                    : activeWorld === 'voxel'
                      ? '#6BAF5D'
                      : manifest.palette.primary || '#E11D63',
              }}
            >
              {activeWorld === 'particle3d' ? (
                <OrbitSvg className="h-4 w-4" />
              ) : activeWorld === 'voxel' ? (
                <VoxelCubeSvg className="h-4 w-4" />
              ) : (
                <SunlitSparkSvg className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-sans text-xs font-extrabold tracking-tight">
                {identity.displayName}
              </p>
              <p
                className={`truncate font-mono text-[9px] font-bold uppercase tracking-[0.14em] ${
                  isDarkWorld ? 'text-[#93C5FD]' : 'opacity-60'
                }`}
              >
                {copy.artModeLabel}
              </p>
            </div>
          </div>

          {/* CHROMATIC LIQUID-GLASS ART MODE PILL SWITCHER */}
          <div className="wz-cv-prism-ring rounded-full p-[1.5px]">
            <div
              role="tablist"
              aria-label="Art mode world switcher"
              className={`flex items-center gap-0.5 rounded-full p-0.5 backdrop-blur-xl ${
                isDarkWorld ? 'bg-[#090C14]/95' : 'bg-[#12131C]/95'
              }`}
            >
              {worldModes.map((mode) => {
                const isSelected = activeWorld === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveWorld(mode.id)}
                    className={`inline-flex min-h-[34px] items-center gap-1 rounded-full px-2.5 text-[10.5px] font-bold whitespace-nowrap transition-all duration-200 active:scale-95 sm:px-3 sm:text-[11px] ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#FEF3C7] via-white to-[#DBEAFE] text-[#090B12] shadow-[0_0_16px_rgba(251,191,36,0.45)]'
                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {mode.icon}
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE INTERACTIVE WORLD */}
      <main className="relative flex flex-1 flex-col">
        {activeWorld === 'particle3d' ? (
          <Particle3DWorld
            identity={identity}
            data={data}
            language={language}
            coreLang={coreLang}
            reducedMotion={reducedMotion}
            whatsappHref={whatsappHref}
            onCopyBrief={handleCopyBrief}
            copiedBrief={copiedBrief}
          />
        ) : activeWorld === 'voxel' ? (
          <VoxelQuestWorld
            identity={identity}
            data={data}
            coreLang={coreLang}
            whatsappHref={whatsappHref}
            onCopyBrief={handleCopyBrief}
            copiedBrief={copiedBrief}
          />
        ) : (
          <ScrapbookCreatieWorld
            identity={identity}
            data={data}
            coreLang={coreLang}
            reducedMotion={reducedMotion}
            whatsappHref={whatsappHref}
            onCopyBrief={handleCopyBrief}
            copiedBrief={copiedBrief}
          />
        )}
      </main>

      {/* WEBZY FOOTER */}
      <footer className={`relative z-20 px-4 py-3.5 text-center text-[11px] font-medium ${footerClass}`}>
        {getWebzyFooterLabel(language)}
      </footer>
    </div>
  );
}
