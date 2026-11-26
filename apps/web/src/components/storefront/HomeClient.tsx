'use client';

import Link from 'next/link';
import React from 'react';
import { BUSINESS_PRICE_TIERS, getSiteCopy, getStorefrontCopy, pickLocalizedText } from '@webzy/core';
import { ThemeManifest, ThemeRenderer } from '@webzy/themes';
import { useLanguage } from '../shell/LanguageProvider';
import { AdaptivePreviewStage } from '../shell/AdaptivePreviewStage';
import { ThemeCard } from './ThemeCard';

interface HomeClientProps {
  themes: ThemeManifest[];
}

export function HomeClient({ themes }: HomeClientProps) {
  const { language } = useLanguage();
  const copy = getStorefrontCopy(language);
  const site = getSiteCopy(language);
  const sampleTheme = themes[0];

  return (
    <div className="bg-white">
      {/* 1. Hero + Live Interactive Sample */}
      <section className="relative overflow-hidden border-b border-webzy-tint/80 bg-webzy-surface/40">
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-7">
            <h1 className="font-heading text-3xl font-bold leading-[1.12] tracking-tight-display text-webzy-ink sm:text-4xl md:text-5xl lg:text-6xl">
              {copy.hero.headline}
            </h1>
            <p className="mt-3.5 max-w-2xl text-sm leading-relaxed text-webzy-ink/80 sm:mt-4 sm:text-lg">
              {copy.hero.subheadline}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5">
              <Link
                href="/themes"
                className="btn-spring inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-webzy-primary px-7 py-3 text-sm font-bold text-white shadow-btn-primary hover:opacity-95 sm:w-auto"
              >
                {copy.hero.primaryCta}
              </Link>
              {sampleTheme ? (
                <Link
                  href={`/themes/${sampleTheme.id}`}
                  className="btn-spring inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-webzy-tint bg-white px-6 py-3 text-sm font-bold text-webzy-ink shadow-btn-secondary transition hover:border-webzy-primary/40 hover:text-webzy-primary sm:w-auto"
                >
                  {copy.hero.secondaryCta}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="relative flex justify-center lg:col-span-5">
            {sampleTheme ? (
              <div className="w-full max-w-[460px] lg:max-w-none">
                <AdaptivePreviewStage
                  title={pickLocalizedText(sampleTheme.name, language)}
                  caption={copy.hero.sampleLabel}
                  accentColor={sampleTheme.palette.primary || '#E11D63'}
                  externalFullScreenHref={`/themes/${sampleTheme.id}`}
                  mobileHeightClassName="h-[410px] sm:h-[480px]"
                  fullscreenChildren={
                    <ThemeRenderer manifest={sampleTheme} language={language} watermarked />
                  }
                >
                  <ThemeRenderer manifest={sampleTheme} language={language} watermarked />
                </AdaptivePreviewStage>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* 2. Celebration Hubs & Intent Picker */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight-heading text-webzy-ink sm:text-3xl">
              {site.home.chooseCelebrationTitle}
            </h2>
            <p className="mt-1 text-sm text-webzy-ink/75">
              {site.home.chooseCelebrationSubtitle}
            </p>
          </div>
          <Link
            href="/themes"
            className="group inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-webzy-primary hover:underline"
          >
            <span>{site.common.browseAllThemes}</span>
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* 4 Distinct Hubs - Clean Editorial Cards */}
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {/* Card 1: Weddings */}
          <Link
            href="/weddings"
            className="group relative flex flex-col justify-between rounded-2xl border border-webzy-ink/[0.08] bg-white p-3 sm:p-5 transition hover:border-webzy-primary/40 hover:shadow-md active:scale-[0.99]"
          >
            <div>
              <p className="text-[11px] font-semibold text-webzy-ink/50">{site.home.hubs.weddings.tag}</p>
              <h3 className="mt-1.5 sm:mt-2 font-heading text-sm leading-snug font-bold text-webzy-ink sm:text-lg group-hover:text-webzy-primary transition-colors">
                {site.home.hubs.weddings.title}
              </h3>
              <p className="mt-1 sm:mt-1.5 line-clamp-2 text-[11px] sm:text-xs leading-relaxed text-webzy-ink/70">
                {site.home.hubs.weddings.subtitle}
              </p>
            </div>

            <div className="mt-3 sm:mt-4 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 border-t border-webzy-ink/[0.07] pt-2.5 sm:pt-3">
              <div className="flex items-baseline gap-1.5 font-tabular">
                <span className="font-heading text-sm font-bold text-webzy-ink sm:text-base">
                  ₹499
                </span>
                <span className="text-[11px] text-webzy-ink/40 line-through">₹1,499</span>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-webzy-primary group-hover:translate-x-0.5 transition-transform">
                {site.common.explore} →
              </span>
            </div>
          </Link>

          {/* Card 2: Birthdays */}
          <Link
            href="/themes?occasion=birthday"
            className="group relative flex flex-col justify-between rounded-2xl border border-webzy-ink/[0.08] bg-white p-3 sm:p-5 transition hover:border-webzy-primary/40 hover:shadow-md active:scale-[0.99]"
          >
            <div>
              <p className="text-[11px] font-semibold text-webzy-ink/50">{site.home.hubs.birthdays.tag}</p>
              <h3 className="mt-1.5 sm:mt-2 font-heading text-sm leading-snug font-bold text-webzy-ink sm:text-lg group-hover:text-webzy-primary transition-colors">
                {site.home.hubs.birthdays.title}
              </h3>
              <p className="mt-1 sm:mt-1.5 line-clamp-2 text-[11px] sm:text-xs leading-relaxed text-webzy-ink/70">
                {site.home.hubs.birthdays.subtitle}
              </p>
            </div>

            <div className="mt-3 sm:mt-4 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 border-t border-webzy-ink/[0.07] pt-2.5 sm:pt-3">
              <div className="flex items-baseline gap-1.5 font-tabular">
                <span className="font-heading text-sm font-bold text-webzy-ink sm:text-base">
                  ₹49
                </span>
                <span className="text-[11px] text-webzy-ink/40 line-through">₹149</span>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-webzy-primary group-hover:translate-x-0.5 transition-transform">
                {site.common.explore} →
              </span>
            </div>
          </Link>

          {/* Card 3: Romance */}
          <Link
            href="/themes?occasion=love"
            className="group relative flex flex-col justify-between rounded-2xl border border-webzy-ink/[0.08] bg-white p-3 sm:p-5 transition hover:border-webzy-primary/40 hover:shadow-md active:scale-[0.99]"
          >
            <div>
              <p className="text-[11px] font-semibold text-webzy-ink/50">{site.home.hubs.romance.tag}</p>
              <h3 className="mt-1.5 sm:mt-2 font-heading text-sm leading-snug font-bold text-webzy-ink sm:text-lg group-hover:text-webzy-primary transition-colors">
                {site.home.hubs.romance.title}
              </h3>
              <p className="mt-1 sm:mt-1.5 line-clamp-2 text-[11px] sm:text-xs leading-relaxed text-webzy-ink/70">
                {site.home.hubs.romance.subtitle}
              </p>
            </div>

            <div className="mt-3 sm:mt-4 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 border-t border-webzy-ink/[0.07] pt-2.5 sm:pt-3">
              <div className="flex items-baseline gap-1.5 font-tabular">
                <span className="font-heading text-sm font-bold text-webzy-ink sm:text-base">
                  ₹29
                </span>
                <span className="text-[11px] text-webzy-ink/40 line-through">₹99</span>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-webzy-primary group-hover:translate-x-0.5 transition-transform">
                {site.common.explore} →
              </span>
            </div>
          </Link>

          {/* Card 4: Portfolio & Creative Showcase */}
          <Link
            href="/themes?occasion=portfolio"
            className="group relative flex flex-col justify-between rounded-2xl border border-webzy-ink/[0.08] bg-white p-3 sm:p-5 transition hover:border-webzy-primary/40 hover:shadow-md active:scale-[0.99]"
          >
            <div>
              <p className="text-[11px] font-semibold text-webzy-ink/50">
                {pickLocalizedText(
                  { hinglish: 'Portfolio', hi: 'पोर्टफोलियो', en: 'Portfolio' },
                  language,
                )}
              </p>
              <h3 className="mt-1.5 sm:mt-2 font-heading text-sm leading-snug font-bold text-webzy-ink sm:text-lg group-hover:text-webzy-primary transition-colors">
                {pickLocalizedText(
                  {
                    hinglish: 'Portfolio & Resume',
                    hi: 'पोर्टफोलियो और रेज़्यूमे',
                    en: 'Portfolio & Creative Showcase',
                  },
                  language,
                )}
              </h3>
              <p className="mt-1 sm:mt-1.5 line-clamp-2 text-[11px] sm:text-xs leading-relaxed text-webzy-ink/70">
                {pickLocalizedText(
                  {
                    hinglish: 'Designers, developers aur creators ke liye 3 showcase styles.',
                    hi: 'डिज़ाइनर्स, डेवलपर्स और क्रिएटर्स के लिए 3 ख़ास पोर्टफोलियो स्टाइल।',
                    en: 'Three bespoke portfolio styles for designers, developers & creators.',
                  },
                  language,
                )}
              </p>
            </div>

            <div className="mt-3 sm:mt-4 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 border-t border-webzy-ink/[0.07] pt-2.5 sm:pt-3">
              <div className="flex items-baseline gap-1.5 font-tabular">
                <span className="font-heading text-sm font-bold text-webzy-ink sm:text-base">
                  ₹79
                </span>
                <span className="text-[11px] text-webzy-ink/40 line-through">₹199</span>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-webzy-primary group-hover:translate-x-0.5 transition-transform">
                {site.common.explore} →
              </span>
            </div>
          </Link>
        </div>

        {/* Custom Made Waitlist Strip */}
        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl bg-webzy-ink p-5 text-white sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="font-heading text-base font-bold text-white sm:text-lg">
              {site.home.studioStripTitle}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-white/75 sm:text-sm">
              {site.home.studioStripBody}
            </p>
          </div>
          <Link
            href="/studio"
            className="inline-flex min-h-[44px] w-full sm:w-auto shrink-0 items-center justify-center rounded-full bg-white px-6 text-xs font-bold text-webzy-ink transition hover:bg-zinc-100 active:scale-[0.98]"
          >
            {site.home.studioStripCta}
          </Link>
        </div>
      </section>

      {/* 3. Theme Cards Grid (1 / 2 / 3 / 4 responsive columns) */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
          {copy.featuredTitle}
        </h2>
        <p className="mt-1 text-sm text-webzy-ink/75">{copy.featuredSubtitle}</p>

        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="border-y border-webzy-tint bg-webzy-surface/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
            {copy.stepsTitle}
          </h2>
          <div className="mt-5 sm:mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {copy.steps.map((item) => (
              <div
                key={item.step}
                className="interactive-card rounded-2xl sm:rounded-3xl border border-webzy-tint bg-white p-4 sm:p-5 shadow-sm"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-webzy-primary text-sm font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mt-3 font-heading text-lg font-bold text-webzy-ink">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-webzy-ink/75">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Honest Pricing Strip */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6">
        <h2 className="font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
          {copy.pricingTitle}
        </h2>
        <p className="mt-1 text-sm text-webzy-ink/75">{copy.pricingSubtitle}</p>

        <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {BUSINESS_PRICE_TIERS.map((tier) => (
            <div
              key={tier.id}
              className="interactive-card rounded-2xl sm:rounded-3xl border border-webzy-tint bg-webzy-surface/70 p-3 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2">
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wide text-webzy-primary">
                  {pickLocalizedText(tier.title, language)}
                </p>
                <span className="text-[10px] font-medium text-webzy-ink/50">
                  {tier.validityDays} {site.common.daysLink}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <p className="font-heading text-xl sm:text-2xl font-extrabold text-emerald-700">
                  {tier.rangeLabel}
                </p>
                {tier.compareRangeLabel ? (
                  <span className="text-xs font-semibold text-webzy-ink/45 line-through">
                    {tier.compareRangeLabel}
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs leading-relaxed text-webzy-ink/75 line-clamp-3 sm:line-clamp-none">
                {pickLocalizedText(tier.summary, language)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Custom Request Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-webzy-ink p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div className="max-w-2xl">
            <h2 className="font-heading text-2xl font-bold">{copy.customBanner.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{copy.customBanner.body}</p>
          </div>
          <Link
            href="/request"
            className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-full bg-webzy-accent px-6 py-3 text-sm font-bold text-webzy-ink transition hover:opacity-95"
          >
            {copy.customBanner.cta}
          </Link>
        </div>
      </section>

      {/* 7. Accessible FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-4 py-8 sm:py-12 sm:px-6">
        <h2 className="font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
          {copy.faqTitle}
        </h2>
        <div className="mt-6 space-y-3">
          {copy.faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-webzy-tint bg-webzy-surface/40 px-5 py-3"
            >
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 font-semibold text-webzy-ink">
                <span>{faq.q}</span>
                <span className="inline-block text-webzy-primary transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <p className="pb-2 pt-1 text-sm leading-relaxed text-webzy-ink/80">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
