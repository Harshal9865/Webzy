'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import {
  BUSINESS_PRICE_TIERS,
  getSiteCopy,
  getStorefrontCopy,
  pickLocalizedText,
} from '@webzy/core';
import { ThemeManifest, ThemeRenderer } from '@webzy/themes';
import { useLanguage } from '../shell/LanguageProvider';
import { AdaptivePreviewStage } from '../shell/AdaptivePreviewStage';
import { ThemeCard } from './ThemeCard';

interface HomeClientProps {
  themes: ThemeManifest[];
}

const HERO_DEMO_IDS = [
  { id: 'birthday-confetti-01', shortLabel: 'Birthday' },
  { id: 'travel-voyage-01', shortLabel: 'Travel Ink' },
  { id: 'will-you-01', shortLabel: 'Love Note' },
  { id: 'wedding-emerald-01', shortLabel: 'Royal Vivah' },
] as const;

const FEATURED_HOME_IDS = [
  'travel-voyage-01',
  'cafe-artisan-01',
  'creative-voxel-01',
  'birthday-confetti-01',
  'birthday-ashirwad-01',
  'will-you-01',
  'our-timeline-01',
  'make-them-smile-01',
] as const;

function StepIllustration({ step }: { step: 0 | 1 | 2 }) {
  if (step === 0) {
    return (
      <div className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border border-webzy-ink/[0.08] bg-gradient-to-br from-[#FFF5F8] via-white to-[#FAF3E6] p-3">
        <div className="grid w-full max-w-[230px] grid-cols-3 gap-2">
          <div className="rounded-xl border border-webzy-primary/30 bg-white p-1.5 shadow-sm">
            <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-[#FCE7F3] to-[#FBCFE8]" />
            <div className="mt-1.5 h-1.5 w-8 rounded-full bg-webzy-primary/70" />
          </div>
          <div className="-translate-y-1.5 rounded-xl border border-[#C9A243]/50 bg-white p-1.5 shadow-md ring-2 ring-webzy-primary/15">
            <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-[#1E3454] to-[#D99B38]" />
            <div className="mt-1.5 flex items-center justify-between">
              <span className="h-1.5 w-9 rounded-full bg-webzy-ink/80" />
              <span className="h-1.5 w-3 rounded-full bg-emerald-500" />
            </div>
          </div>
          <div className="rounded-xl border border-webzy-ink/10 bg-white p-1.5 shadow-sm">
            <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-[#2D4F35] to-[#E4C77B]" />
            <div className="mt-1.5 h-1.5 w-7 rounded-full bg-webzy-ink/35" />
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border border-webzy-ink/[0.08] bg-gradient-to-br from-[#FAF6EE] via-white to-[#F4F7FB] p-3">
        <div className="flex w-full max-w-[238px] items-center gap-2.5 rounded-xl border border-webzy-ink/10 bg-white p-2.5 shadow-sm">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-1">
              <span className="rounded bg-webzy-surface px-1.5 py-0.5 font-mono text-[8px] font-bold text-webzy-primary">
                EN · हिं · HN
              </span>
            </div>
            <div className="h-2 w-24 rounded-full bg-webzy-ink/75" />
            <div className="h-1.5 w-20 rounded-full bg-webzy-ink/25" />
            <div className="flex items-center gap-1 pt-0.5">
              <span className="h-4 w-4 rounded-md bg-[#FBCFE8]" />
              <span className="h-4 w-4 rounded-md bg-[#FDE68A]" />
              <span className="h-4 w-4 rounded-md bg-[#BAE6FD]" />
            </div>
          </div>
          <div className="flex h-[72px] w-[50px] shrink-0 flex-col items-center justify-between rounded-xl border-2 border-webzy-ink/80 bg-[#FFF8FA] p-1.5">
            <span className="h-1 w-4 rounded-full bg-webzy-ink/30" />
            <span className="h-6 w-6 rounded-full bg-gradient-to-br from-webzy-primary to-[#F59E0B]" />
            <span className="h-1.5 w-7 rounded-full bg-webzy-primary/60" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border border-webzy-ink/[0.08] bg-gradient-to-br from-[#ECFDF5] via-white to-[#FFF7ED] p-3">
      <div className="flex w-full max-w-[238px] items-center justify-between gap-2.5 rounded-xl border border-emerald-700/15 bg-white p-2.5 shadow-sm">
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[8.5px] font-bold text-emerald-700">
            webzy.in/i/yours
          </span>
          <p className="mt-1.5 truncate text-[10px] font-bold text-webzy-ink">
            Opens in 1 tap · No login
          </p>
          <p className="mt-0.5 text-[9px] text-webzy-ink/55">
            WhatsApp · Instagram · QR Card
          </p>
        </div>
        <div
          aria-hidden="true"
          className="grid h-12 w-12 shrink-0 grid-cols-3 gap-0.5 rounded-lg border border-webzy-ink/15 bg-[#FAF8F5] p-1.5"
        >
          <span className="rounded-[2px] bg-webzy-ink" />
          <span className="rounded-[2px] bg-webzy-ink/20" />
          <span className="rounded-[2px] bg-webzy-ink" />
          <span className="rounded-[2px] bg-webzy-ink/25" />
          <span className="rounded-[2px] bg-webzy-primary" />
          <span className="rounded-[2px] bg-webzy-ink" />
          <span className="rounded-[2px] bg-webzy-ink" />
          <span className="rounded-[2px] bg-webzy-ink" />
          <span className="rounded-[2px] bg-webzy-ink/25" />
        </div>
      </div>
    </div>
  );
}

export function HomeClient({ themes }: HomeClientProps) {
  const { language } = useLanguage();
  const copy = getStorefrontCopy(language);
  const site = getSiteCopy(language);

  const heroCandidates = useMemo(() => {
    const resolved = HERO_DEMO_IDS.map((entry) => {
      const found = themes.find((t) => t.id === entry.id);
      return found ? { theme: found, shortLabel: entry.shortLabel } : null;
    }).filter((x): x is { theme: ThemeManifest; shortLabel: string } => Boolean(x));

    if (resolved.length > 0) return resolved;
    return themes.slice(0, 1).map((theme) => ({ theme, shortLabel: theme.name.en }));
  }, [themes]);

  const [heroThemeId, setHeroThemeId] = useState<string>(
    () => heroCandidates[0]?.theme.id ?? themes[0]?.id ?? '',
  );
  const [activeHowStep, setActiveHowStep] = useState<0 | 1 | 2>(0);

  const sampleTheme = useMemo(
    () =>
      heroCandidates.find((entry) => entry.theme.id === heroThemeId)?.theme ??
      heroCandidates[0]?.theme ??
      themes[0],
    [heroCandidates, heroThemeId, themes],
  );

  const featuredOccasions = useMemo(() => {
    const nonWeddings = themes.filter((t) => t.occasion !== 'wedding');
    const byId = new Map(nonWeddings.map((t) => [t.id, t]));
    const picked: ThemeManifest[] = [];
    for (const id of FEATURED_HOME_IDS) {
      const item = byId.get(id);
      if (item) picked.push(item);
    }
    if (picked.length < 8) {
      for (const item of nonWeddings) {
        if (!picked.some((p) => p.id === item.id)) {
          picked.push(item);
          if (picked.length >= 8) break;
        }
      }
    }
    return picked;
  }, [themes]);

  const celebrationHubs = useMemo(
    () => [
      {
        id: 'weddings',
        href: '/weddings',
        tag: site.home.hubs.weddings.tag,
        title: site.home.hubs.weddings.title,
        subtitle: site.home.hubs.weddings.subtitle,
        price: '₹499',
        compareAt: '₹1,499',
        thumb: '/templates/wedding-emerald-01/art/jharokha-scene-wide.jpg',
      },
      {
        id: 'travel',
        href: '/themes?occasion=travel',
        tag: 'Travel & Retreats',
        title: 'Voyages & Ink-Reveal Guides',
        subtitle: 'Interactive ink-wash horizon canvas, destination atlas & boarding capsule.',
        price: '₹99',
        compareAt: '₹299',
        thumb: '/templates/travel/serendipity-vista.jpg',
      },
      {
        id: 'birthdays',
        href: '/themes?occasion=birthday',
        tag: site.home.hubs.birthdays.tag,
        title: site.home.hubs.birthdays.title,
        subtitle: site.home.hubs.birthdays.subtitle,
        price: '₹49',
        compareAt: '₹149',
        thumb: '/templates/occasions/birthday-confetti/cover.jpg',
      },
      {
        id: 'romance',
        href: '/themes?occasion=love',
        tag: site.home.hubs.romance.tag,
        title: site.home.hubs.romance.title,
        subtitle: site.home.hubs.romance.subtitle,
        price: '₹29',
        compareAt: '₹99',
        thumb: '/templates/occasions/will-you/cover.jpg',
      },
      {
        id: 'business',
        href: '/themes?occasion=business',
        tag: 'Cafés & Shops',
        title: 'Storefronts & Live Menus',
        subtitle: 'Boutique menus, fluted-glass lookbooks & direct WhatsApp order baskets.',
        price: '₹79',
        compareAt: '₹249',
        thumb: '/templates/cafe/maison-rouge.jpg',
      },
      {
        id: 'portfolio',
        href: '/themes?occasion=portfolio',
        tag: 'Portfolios & 3D',
        title: 'Creators, 3D & Resumes',
        subtitle: 'Interactive 3D particle stages, editorial folios & voxel showcases.',
        price: '₹79',
        compareAt: '₹199',
        thumb: '/templates/creative/creatie-hills.jpg',
      },
    ],
    [site.home.hubs],
  );

  const sampleDemoHref = sampleTheme
    ? sampleTheme.occasion === 'wedding'
      ? `/weddings/${sampleTheme.id}`
      : `/themes/${sampleTheme.id}`
    : '/themes';

  const sampleCreateHref = sampleTheme
    ? sampleTheme.occasion === 'wedding'
      ? `/weddings/${sampleTheme.id}/customize`
      : `/create/${sampleTheme.id}`
    : '/themes';

  const howItWorksMeta = [
    {
      index: '01',
      duration: '1 min',
      ctaLabel: 'Browse collection',
      ctaHref: '/themes',
      highlights: ['Test every theme live before buying', '10 Indian languages supported', 'Works on mobile & desktop'],
    },
    {
      index: '02',
      duration: '3 mins',
      ctaLabel: 'Open live editor',
      ctaHref: '/create/birthday-confetti-01',
      highlights: ['Fill 3 to 6 simple fields', 'Upload photos from your phone', 'Optional AI message drafting'],
    },
    {
      index: '03',
      duration: 'Instant',
      ctaLabel: 'View honest pricing',
      ctaHref: '/pricing',
      highlights: ['WhatsApp link & QR code ready immediately', 'Receiver opens with zero login', 'Free edits included for 24 hours'],
    },
  ] as const;

  const activeHowDetail = howItWorksMeta[activeHowStep];

  return (
    <div className="bg-white">
      {/* 1. Hero + Switchable Live Interactive Sample */}
      <section className="relative overflow-hidden border-b border-webzy-ink/[0.08] bg-gradient-to-b from-[#FFF7FA] via-[#FDFBF8] to-white">
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-webzy-primary/20 bg-white px-3.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-webzy-primary shadow-2xs">
              {copy.hero.badge}
            </p>
            <h1 className="mt-4 font-heading text-3xl font-bold leading-[1.1] tracking-tight-display text-webzy-ink sm:text-4xl md:text-5xl lg:text-[54px]">
              {copy.hero.headline}
            </h1>
            <p className="mt-3.5 max-w-2xl text-sm leading-relaxed text-webzy-ink/75 sm:mt-4 sm:text-lg">
              {copy.hero.subheadline}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5">
              <Link
                href="/themes"
                className="btn-spring inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-webzy-primary px-7 py-3 text-sm font-bold text-white shadow-btn-primary hover:opacity-95 sm:w-auto"
              >
                {copy.hero.primaryCta}
              </Link>
              <Link
                href={sampleDemoHref}
                className="btn-spring inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-webzy-ink/15 bg-white px-6 py-3 text-sm font-bold text-webzy-ink shadow-2xs transition hover:border-webzy-primary/40 hover:text-webzy-primary sm:w-auto"
              >
                {copy.hero.secondaryCta}
              </Link>
              <Link
                href="/studio"
                className="inline-flex min-h-[44px] items-center justify-center px-3 text-xs font-bold text-webzy-ink/70 underline-offset-4 transition hover:text-webzy-ink hover:underline sm:justify-start"
              >
                Need a custom website? →
              </Link>
            </div>

            {/* Quiet Trust Markers */}
            <dl className="mt-7 grid max-w-xl grid-cols-3 gap-3 border-t border-webzy-ink/[0.08] pt-5 sm:gap-5">
              <div>
                <dt className="text-[11px] font-medium text-webzy-ink/55">Receiver experience</dt>
                <dd className="mt-0.5 font-heading text-sm font-bold text-webzy-ink sm:text-base">
                  Zero app or login
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-webzy-ink/55">Ready-made pricing</dt>
                <dd className="mt-0.5 font-heading text-sm font-bold text-webzy-ink sm:text-base font-tabular">
                  From ₹29 · GST incl.
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-webzy-ink/55">Languages</dt>
                <dd className="mt-0.5 font-heading text-sm font-bold text-webzy-ink sm:text-base">
                  10 Indian scripts
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative flex flex-col items-center lg:col-span-5">
            {heroCandidates.length > 1 ? (
              <div
                role="tablist"
                aria-label="Switch live sample"
                className="mb-3 flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-full border border-webzy-ink/10 bg-white/90 p-1 shadow-2xs scrollbar-none"
              >
                {heroCandidates.map((entry) => {
                  const active = sampleTheme?.id === entry.theme.id;
                  return (
                    <button
                      key={entry.theme.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setHeroThemeId(entry.theme.id)}
                      className={`min-h-[32px] shrink-0 whitespace-nowrap rounded-full px-3 text-[11px] font-bold transition ${
                        active
                          ? 'bg-webzy-ink text-white shadow-2xs'
                          : 'text-webzy-ink/70 hover:bg-stone-100 hover:text-webzy-ink'
                      }`}
                    >
                      {entry.shortLabel}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {sampleTheme ? (
              <div className="w-full max-w-[460px] lg:max-w-none">
                <AdaptivePreviewStage
                  title={pickLocalizedText(sampleTheme.name, language)}
                  caption={copy.hero.sampleLabel}
                  accentColor={sampleTheme.palette.primary || '#E11D63'}
                  externalFullScreenHref={sampleDemoHref}
                  mobileHeightClassName="h-[410px] sm:h-[470px]"
                  fullscreenChildren={
                    <ThemeRenderer
                      key={`hero-fs-${sampleTheme.id}-${language}`}
                      manifest={sampleTheme}
                      language={language}
                      watermarked
                    />
                  }
                >
                  <ThemeRenderer
                    key={`hero-inline-${sampleTheme.id}-${language}`}
                    manifest={sampleTheme}
                    language={language}
                    watermarked
                  />
                </AdaptivePreviewStage>
                <div className="mt-2.5 flex items-center justify-center gap-4 text-[11.5px] font-semibold">
                  <Link href={sampleDemoHref} className="text-webzy-ink/70 hover:text-webzy-primary">
                    Full preview
                  </Link>
                  <span className="text-webzy-ink/25" aria-hidden="true">·</span>
                  <Link href={sampleCreateHref} className="text-webzy-primary hover:underline">
                    Personalize this theme →
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* 2. Celebration & Storefront Hubs (Connected to Every Category) */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-webzy-primary">
              EXPLORE BY OCCASION
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight-heading text-webzy-ink sm:text-3xl">
              {site.home.chooseCelebrationTitle}
            </h2>
            <p className="mt-1 text-sm text-webzy-ink/70">
              {site.home.chooseCelebrationSubtitle}
            </p>
          </div>
          <Link
            href="/themes"
            className="group inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-webzy-primary hover:underline"
          >
            <span>{site.common.browseAllThemes}</span>
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {celebrationHubs.map((hub) => (
            <Link
              key={hub.id}
              href={hub.href}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-webzy-ink/[0.08] bg-white p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-webzy-primary/35 hover:shadow-md sm:flex-row sm:items-center sm:gap-4 sm:p-3.5"
            >
              <div className="aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:h-24 sm:w-28 sm:aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hub.thumb}
                  alt={hub.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-2.5 flex min-w-0 flex-1 flex-col justify-between sm:mt-0">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-webzy-ink/50">
                    {hub.tag}
                  </p>
                  <h3 className="mt-0.5 line-clamp-1 font-heading text-sm font-bold text-webzy-ink transition-colors group-hover:text-webzy-primary sm:text-base">
                    {hub.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-webzy-ink/65 sm:text-xs">
                    {hub.subtitle}
                  </p>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between gap-2 pt-1.5">
                  <div className="flex items-baseline gap-1.5 font-tabular">
                    <span className="font-heading text-sm font-extrabold text-webzy-ink">
                      {hub.price}
                    </span>
                    <span className="text-[10.5px] text-webzy-ink/40 line-through">
                      {hub.compareAt}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-webzy-primary transition-transform group-hover:translate-x-0.5">
                    {site.common.explore} →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Redesigned "How It Works" — Editorial 3-Step Visual Journey */}
      <section
        id="how-it-works"
        className="scroll-mt-20 border-y border-webzy-ink/[0.08] bg-[#FAF6F0]"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-webzy-primary">
                THREE SIMPLE STEPS
              </p>
              <h2 className="mt-1.5 font-heading text-2xl font-bold tracking-tight text-webzy-ink sm:text-4xl">
                {copy.stepsTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-webzy-ink/70 sm:text-base">
                Pick a design, add your personal story and photos, preview it live on your phone, and share one clean link over WhatsApp or QR.
              </p>
            </div>
            <Link
              href="/themes"
              className="btn-spring inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-webzy-ink px-5 text-xs font-bold text-white shadow-2xs transition hover:bg-webzy-primary sm:text-sm"
            >
              Start creating now →
            </Link>
          </div>

          {/* Connected 3-Step Visual Cards */}
          <div className="relative mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {/* Subtle Connecting Hairline on Desktop */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-[16%] right-[16%] top-[68px] hidden h-px border-t border-dashed border-webzy-ink/20 md:block"
            />

            {copy.steps.slice(0, 3).map((item, idx) => {
              const stepIndex = (idx === 0 || idx === 1 || idx === 2 ? idx : 0) as 0 | 1 | 2;
              const meta = howItWorksMeta[stepIndex];
              const isSelected = activeHowStep === stepIndex;

              return (
                <div
                  key={item.step}
                  onMouseEnter={() => setActiveHowStep(stepIndex)}
                  onClick={() => setActiveHowStep(stepIndex)}
                  className={`relative flex cursor-pointer flex-col justify-between rounded-3xl border bg-white p-5 transition-all duration-300 sm:p-6 ${
                    isSelected
                      ? 'border-webzy-primary/40 shadow-[0_20px_40px_-20px_rgba(225,29,99,0.22)]'
                      : 'border-webzy-ink/[0.08] shadow-2xs hover:border-webzy-ink/20'
                  }`}
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-bold tracking-[0.14em] ${
                          isSelected
                            ? 'bg-webzy-primary text-white'
                            : 'bg-[#FAF6F0] text-webzy-ink'
                        }`}
                      >
                        STEP {meta.index}
                      </span>
                      <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-webzy-ink/50">
                        {meta.duration}
                      </span>
                    </div>

                    <StepIllustration step={stepIndex} />

                    <h3 className="mt-4 font-heading text-lg font-bold tracking-tight text-webzy-ink sm:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-webzy-ink/70">
                      {item.detail}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-webzy-ink/[0.07] pt-3.5">
                    <Link
                      href={meta.ctaHref}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-webzy-primary transition hover:underline"
                    >
                      <span>{meta.ctaLabel}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Step Detail Strip */}
          <div className="mt-5 flex flex-col items-start justify-between gap-3 rounded-2xl border border-webzy-ink/[0.08] bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:px-6">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-webzy-primary">
                Step {activeHowDetail.index} included:
              </span>
              {activeHowDetail.highlights.map((point) => (
                <span
                  key={point}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-webzy-ink/80"
                >
                  <svg
                    className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{point}</span>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 self-end sm:self-auto" role="tablist" aria-label="Highlight step">
              {([0, 1, 2] as const).map((idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={activeHowStep === idx}
                  aria-label={`View step ${idx + 1} details`}
                  onClick={() => setActiveHowStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    activeHowStep === idx ? 'w-6 bg-webzy-primary' : 'w-2 bg-webzy-ink/20 hover:bg-webzy-ink/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Curated Ready-Made Occasions Shelf (Fast Cover-Art Cards) */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-webzy-primary">
              CURATED SHOWCASE
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
              {copy.featuredTitle}
            </h2>
            <p className="mt-1 text-sm text-webzy-ink/70">{copy.featuredSubtitle}</p>
          </div>
          <Link
            href="/themes"
            className="btn-spring inline-flex min-h-[42px] shrink-0 items-center justify-center rounded-full border border-webzy-ink/15 bg-white px-5 text-xs font-bold text-webzy-ink transition hover:border-webzy-primary hover:text-webzy-primary"
          >
            View all occasions →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {featuredOccasions.map((theme, idx) => (
            <ThemeCard key={theme.id} theme={theme} priority={idx < 2} />
          ))}
        </div>
      </section>

      {/* 5. Honest Pricing Strip */}
      <section
        id="pricing"
        className="scroll-mt-20 border-t border-webzy-ink/[0.08] bg-[#FCFAF7]"
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-webzy-primary">
                TRANSPARENT PRICING
              </p>
              <h2 className="mt-1 font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
                {copy.pricingTitle}
              </h2>
              <p className="mt-1 text-sm text-webzy-ink/70">{copy.pricingSubtitle}</p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex min-h-[40px] items-center text-xs font-bold text-webzy-primary hover:underline sm:text-sm"
            >
              Compare plans &amp; add-ons →
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {BUSINESS_PRICE_TIERS.map((tier) => (
              <Link
                key={tier.id}
                href={
                  tier.id === 'ready_made'
                    ? '/themes'
                    : tier.id === 'semi_custom'
                      ? '/weddings'
                      : '/studio'
                }
                className="group flex flex-col justify-between rounded-2xl border border-webzy-ink/[0.08] bg-white p-4 shadow-2xs transition hover:-translate-y-0.5 hover:border-webzy-primary/35 hover:shadow-md sm:rounded-3xl sm:p-5"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-webzy-primary sm:text-xs">
                      {pickLocalizedText(tier.title, language)}
                    </p>
                    <span className="text-[10px] font-medium text-webzy-ink/50">
                      {tier.validityDays} {site.common.daysLink}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-tabular">
                    <p className="font-heading text-xl font-extrabold text-emerald-700 sm:text-2xl">
                      {tier.rangeLabel}
                    </p>
                    {tier.compareRangeLabel ? (
                      <span className="text-xs font-semibold text-webzy-ink/40 line-through">
                        {tier.compareRangeLabel}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-webzy-ink/70 sm:line-clamp-none sm:text-xs">
                    {pickLocalizedText(tier.summary, language)}
                  </p>
                </div>
                <span className="mt-3 inline-flex items-center text-[11px] font-bold text-webzy-ink/70 transition-colors group-hover:text-webzy-primary">
                  Explore tier →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Unified Custom Made Atelier Banner */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#1A1614] p-6 text-white shadow-lg sm:p-9">
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#E4C285]">
                WEBZY CUSTOM DESIGN ATELIER
              </p>
              <h2 className="mt-1.5 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                {site.home.studioStripTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                {site.home.studioStripBody}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href="/studio"
                className="btn-spring inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-[#1A1614] transition hover:bg-[#F5EFE6]"
              >
                {site.home.studioStripCta}
              </Link>
              <Link
                href="/request"
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-xs font-bold text-white/90 transition hover:bg-white/10"
              >
                {copy.customBanner.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Accessible FAQ */}
      <section id="faq" className="scroll-mt-20 mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-webzy-primary">
          COMMON QUESTIONS
        </p>
        <h2 className="mt-1 font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
          {copy.faqTitle}
        </h2>
        <div className="mt-6 space-y-3">
          {copy.faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-webzy-ink/[0.08] bg-[#FCFAF7] px-5 py-3 transition open:bg-white open:shadow-2xs"
            >
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 font-semibold text-webzy-ink">
                <span>{faq.q}</span>
                <span className="inline-block text-webzy-primary transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <p className="pb-2 pt-1 text-sm leading-relaxed text-webzy-ink/75">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
