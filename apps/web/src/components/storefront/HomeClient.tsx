'use client';

import Link from 'next/link';
import React from 'react';
import { BUSINESS_PRICE_TIERS, getStorefrontCopy } from '@webzy/core';
import {
  OCCASION_LABELS,
  ThemeManifest,
  ThemeOccasion,
  ThemeRenderer,
} from '@webzy/themes';
import { useLanguage } from '../shell/LanguageProvider';
import { PhoneFrame } from '../shell/PhoneFrame';
import { ThemeCard } from './ThemeCard';

interface HomeClientProps {
  themes: ThemeManifest[];
}

const OCCASIONS: ThemeOccasion[] = [
  'birthday',
  'love',
  'anniversary',
  'family',
  'festival',
  'business',
];

export function HomeClient({ themes }: HomeClientProps) {
  const { language } = useLanguage();
  const copy = getStorefrontCopy(language);
  const sampleTheme = themes[0];

  return (
    <div className="bg-white">
      {/* 1. Hero + Live Interactive Sample */}
      <section className="border-b border-webzy-tint bg-gradient-to-b from-webzy-surface to-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-7">
            <h1 className="font-heading text-3xl font-bold leading-tight text-webzy-ink sm:text-5xl">
              {copy.hero.headline}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-webzy-ink/80 sm:text-lg">
              {copy.hero.subheadline}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/themes"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-webzy-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
              >
                {copy.hero.primaryCta}
              </Link>
              {sampleTheme ? (
                <Link
                  href={`/themes/${sampleTheme.id}`}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-webzy-primary/30 bg-white px-6 py-3 text-sm font-bold text-webzy-primary transition hover:bg-webzy-surface"
                >
                  {copy.hero.secondaryCta}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-5">
            {sampleTheme ? (
              <PhoneFrame caption={copy.hero.sampleLabel}>
                <ThemeRenderer manifest={sampleTheme} language={language} watermarked />
              </PhoneFrame>
            ) : null}
          </div>
        </div>
      </section>

      {/* 2. Celebration Hubs & Intent Picker */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
              Choose your celebration
            </h2>
            <p className="mt-1 text-sm text-webzy-ink/75">
              Personalized mobile websites ready in under 2 minutes
            </p>
          </div>
          <Link
            href="/themes"
            className="inline-flex min-h-[44px] items-center text-sm font-bold text-webzy-primary hover:underline"
          >
            Browse all themes →
          </Link>
        </div>

        {/* 4 Distinct Hubs - Mobile-First 2x2 Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {/* Card 1: Weddings */}
          <Link
            href="/weddings"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-rose-200/90 bg-gradient-to-b from-rose-50/90 via-rose-50/30 to-white p-3.5 sm:p-5 shadow-xs transition hover:border-rose-300 hover:shadow-md active:scale-[0.98]"
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                  Weddings
                </span>
                <span className="rounded-full bg-rose-100/70 border border-rose-200 px-2 py-0.5 text-[9px] font-bold text-rose-800">
                  Couples
                </span>
              </div>

              {/* Visual Icon Accent */}
              <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v10M8 11l4-4 4 4" />
                </svg>
              </div>

              <h3 className="mt-2.5 font-heading text-sm font-bold text-webzy-ink sm:text-base group-hover:text-rose-700">
                Weddings &amp; Couples
              </h3>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-webzy-ink/70">
                Timelines, muhurat countdowns &amp; guest RSVP links.
              </p>

              {/* Price Lockup (Option A) */}
              <div className="mt-3 flex items-baseline gap-1.5 pt-2 border-t border-rose-100/80">
                <span className="font-heading text-sm font-extrabold text-emerald-700 sm:text-base">
                  ₹99
                </span>
                <span className="text-[10px] font-medium text-webzy-ink/40 line-through">
                  ₹249
                </span>
                <span className="ml-auto rounded-full bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                  Save ₹150
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-rose-100 flex items-center justify-between text-[11px] font-bold text-rose-800">
              <span>Explore Hub</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </Link>

          {/* Card 2: Birthdays */}
          <Link
            href="/themes?occasion=birthday"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-b from-amber-50/90 via-amber-50/30 to-white p-3.5 sm:p-5 shadow-xs transition hover:border-amber-300 hover:shadow-md active:scale-[0.98]"
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Birthday
                </span>
                <span className="rounded-full bg-amber-100/70 border border-amber-200 px-2 py-0.5 text-[9px] font-bold text-amber-800">
                  Top Pick
                </span>
              </div>

              {/* Visual Icon Accent */}
              <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>

              <h3 className="mt-2.5 font-heading text-sm font-bold text-webzy-ink sm:text-base group-hover:text-amber-800">
                Birthdays &amp; Milestones
              </h3>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-webzy-ink/70">
                Interactive balloon taps, confetti bursts &amp; memories.
              </p>

              {/* Price Lockup (Option A) */}
              <div className="mt-3 flex items-baseline gap-1.5 pt-2 border-t border-amber-100/80">
                <span className="font-heading text-sm font-extrabold text-emerald-700 sm:text-base">
                  ₹49
                </span>
                <span className="text-[10px] font-medium text-webzy-ink/40 line-through">
                  ₹149
                </span>
                <span className="ml-auto rounded-full bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                  Save ₹100
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-amber-100 flex items-center justify-between text-[11px] font-bold text-amber-900">
              <span>View Themes</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </Link>

          {/* Card 3: Romance */}
          <Link
            href="/themes?occasion=love"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-pink-200/90 bg-gradient-to-b from-pink-50/90 via-pink-50/30 to-white p-3.5 sm:p-5 shadow-xs transition hover:border-pink-300 hover:shadow-md active:scale-[0.98]"
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-800">
                  Romance
                </span>
                <span className="rounded-full bg-pink-100/70 border border-pink-200 px-2 py-0.5 text-[9px] font-bold text-pink-800">
                  Sweet
                </span>
              </div>

              {/* Visual Icon Accent */}
              <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>

              <h3 className="mt-2.5 font-heading text-sm font-bold text-webzy-ink sm:text-base group-hover:text-pink-700">
                Love &amp; Cheer-Up
              </h3>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-webzy-ink/70">
                Playful proposals, apology cards &amp; sweet notes.
              </p>

              {/* Price Lockup (Option A) */}
              <div className="mt-3 flex items-baseline gap-1.5 pt-2 border-t border-pink-100/80">
                <span className="font-heading text-sm font-extrabold text-emerald-700 sm:text-base">
                  ₹29
                </span>
                <span className="text-[10px] font-medium text-webzy-ink/40 line-through">
                  ₹99
                </span>
                <span className="ml-auto rounded-full bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                  Save ₹70
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-pink-100 flex items-center justify-between text-[11px] font-bold text-pink-800">
              <span>View Cards</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </Link>

          {/* Card 4: Festivals & Family */}
          <Link
            href="/themes?occasion=festival"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-purple-200/90 bg-gradient-to-b from-purple-50/90 via-purple-50/30 to-white p-3.5 sm:p-5 shadow-xs transition hover:border-purple-300 hover:shadow-md active:scale-[0.98]"
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">
                  Festive
                </span>
                <span className="rounded-full bg-purple-100/70 border border-purple-200 px-2 py-0.5 text-[9px] font-bold text-purple-800">
                  Traditions
                </span>
              </div>

              {/* Visual Icon Accent */}
              <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>

              <h3 className="mt-2.5 font-heading text-sm font-bold text-webzy-ink sm:text-base group-hover:text-purple-700">
                Family &amp; Festivals
              </h3>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-webzy-ink/70">
                Diwali, New Year, holiday wraps &amp; family greetings.
              </p>

              {/* Price Lockup (Option A) */}
              <div className="mt-3 flex items-baseline gap-1.5 pt-2 border-t border-purple-100/80">
                <span className="font-heading text-sm font-extrabold text-emerald-700 sm:text-base">
                  ₹49
                </span>
                <span className="text-[10px] font-medium text-webzy-ink/40 line-through">
                  ₹149
                </span>
                <span className="ml-auto rounded-full bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                  Save ₹100
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-purple-100 flex items-center justify-between text-[11px] font-bold text-purple-800">
              <span>View Festive</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </Link>
        </div>

        {/* 15-Day Studio Waitlist Spotlight Strip - Mobile First Redesign */}
        <div className="mt-6 flex flex-col justify-between gap-4 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-5 text-white shadow-md sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-start gap-3.5 sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/15 text-amber-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-heading text-sm font-bold text-white sm:text-base">
                  Webzy Studio for Businesses
                </span>
                <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                  Launching in 15 Days
                </span>
              </div>
              <p className="mt-1 text-xs text-white/70">
                Scratch-built websites for Doctors, Coaching Institutes &amp; Local Businesses.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-white/60">
                <span>Custom .in domain</span>
                <span>·</span>
                <span>Google Maps</span>
                <span>·</span>
                <span>1-on-1 Lead Designer</span>
              </div>
            </div>
          </div>
          <Link
            href="/studio"
            className="inline-flex min-h-[46px] w-full sm:w-auto shrink-0 items-center justify-center rounded-full bg-white px-6 text-xs font-bold text-black transition hover:bg-zinc-100 active:scale-[0.98] shadow-sm"
          >
            Join 15-Day Waitlist →
          </Link>
        </div>
      </section>

      {/* 3. Theme Cards Grid (2 / 3 / 4 responsive columns) */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
          {copy.featuredTitle}
        </h2>
        <p className="mt-1 text-sm text-webzy-ink/75">{copy.featuredSubtitle}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="border-y border-webzy-tint bg-webzy-surface/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
            {copy.stepsTitle}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {copy.steps.map((item) => (
              <div
                key={item.step}
                className="rounded-3xl border border-webzy-tint bg-white p-5 shadow-sm"
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
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
          {copy.pricingTitle}
        </h2>
        <p className="mt-1 text-sm text-webzy-ink/75">{copy.pricingSubtitle}</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BUSINESS_PRICE_TIERS.map((tier) => (
            <div
              key={tier.id}
              className="rounded-3xl border border-webzy-tint bg-webzy-surface/70 p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-webzy-primary">
                  {tier.title[language]}
                </p>
                <span className="text-[10px] font-medium text-webzy-ink/50">
                  {tier.validityDays} days link
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="font-heading text-2xl font-extrabold text-emerald-700">
                  {tier.rangeLabel}
                </p>
                {tier.compareRangeLabel ? (
                  <span className="text-xs font-semibold text-webzy-ink/45 line-through">
                    {tier.compareRangeLabel}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-webzy-ink/75">
                {tier.summary[language]}
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
      <section id="faq" className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
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
                <span className="text-webzy-primary group-open:rotate-45">+</span>
              </summary>
              <p className="pb-2 pt-1 text-sm leading-relaxed text-webzy-ink/80">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
