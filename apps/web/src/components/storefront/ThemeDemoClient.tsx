'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { ADDON_CATALOG, formatInr, LanguageCode } from '@webzy/core';
import { OCCASION_LABELS, ThemeManifest, ThemeRenderer } from '@webzy/themes';
import { useLanguage } from '../shell/LanguageProvider';
import { PhoneFrame } from '../shell/PhoneFrame';

interface ThemeDemoClientProps {
  theme: ThemeManifest;
  defaultValidityDays: number;
}

const LANG_NAME: Record<LanguageCode, string> = {
  hinglish: 'Hinglish',
  hi: 'हिन्दी',
  en: 'English',
};

export function ThemeDemoClient({ theme, defaultValidityDays }: ThemeDemoClientProps) {
  const { language: siteLanguage } = useLanguage();
  const [demoLanguage, setDemoLanguage] = useState<LanguageCode>(siteLanguage);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-6">
        <Link
          href="/themes"
          className="inline-flex min-h-[44px] items-center text-sm font-bold text-webzy-primary hover:underline"
        >
          ← Back to all themes
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        {/* Left: Interactive Phone Frame Demo */}
        <div className="lg:col-span-6">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            {theme.languages.map((langCode) => (
              <button
                key={langCode}
                type="button"
                onClick={() => setDemoLanguage(langCode)}
                aria-pressed={demoLanguage === langCode}
                className={`min-h-[44px] rounded-full px-4 text-xs font-bold transition ${
                  demoLanguage === langCode
                    ? 'bg-webzy-primary text-white shadow-sm'
                    : 'border border-webzy-tint bg-webzy-surface text-webzy-ink'
                }`}
              >
                Preview in {LANG_NAME[langCode]}
              </button>
            ))}
          </div>

          <PhoneFrame caption={theme.signatureMoment[demoLanguage]}>
            <ThemeRenderer manifest={theme} language={demoLanguage} watermarked />
          </PhoneFrame>
        </div>

        {/* Right: Side Panel with Price, Inputs Needed & Languages (Section 5) */}
        <aside className="rounded-3xl border border-webzy-tint bg-webzy-surface/60 p-6 lg:col-span-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-webzy-tint px-3 py-1 text-xs font-bold text-webzy-primary">
              {OCCASION_LABELS[theme.occasion][siteLanguage]}
            </span>
            <span className="text-xs font-semibold text-webzy-ink/70">
              Instant WhatsApp Delivery · {defaultValidityDays}-day link
            </span>
          </div>

          <h1 className="mt-4 font-heading text-3xl font-bold text-webzy-ink">
            {theme.name[siteLanguage]}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-webzy-ink/80">
            {theme.audience[siteLanguage]}
          </p>

          <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-webzy-ink/60">Final GST-inclusive price</p>
              {theme.price.compareAt && theme.price.compareAt > theme.price.base ? (
                <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  Save {formatInr(theme.price.compareAt - theme.price.base)} ({Math.round(((theme.price.compareAt - theme.price.base) / theme.price.compareAt) * 100)}% off)
                </span>
              ) : null}
            </div>
            <div className="mt-1.5 flex items-baseline gap-2.5">
              <p className="font-heading text-3xl font-extrabold text-emerald-700">
                {formatInr(theme.price.base)}
              </p>
              {theme.price.compareAt && theme.price.compareAt > theme.price.base ? (
                <span className="text-base font-medium text-webzy-ink/40 line-through">
                  {formatInr(theme.price.compareAt)}
                </span>
              ) : null}
            </div>
            {theme.price.addons.length > 0 ? (
              <p className="mt-2 text-xs text-webzy-ink/75">
                Optional add-ons:{' '}
                {theme.price.addons.map((a) => ADDON_CATALOG[a].label[siteLanguage]).join(' · ')}
              </p>
            ) : null}
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-bold text-webzy-ink">
              Inputs needed ({theme.fields.length} quick steps)
            </h2>
            <ul className="mt-2.5 space-y-2">
              {theme.fields.map((field, idx) => (
                <li
                  key={field.key}
                  className="flex items-center justify-between rounded-xl border border-webzy-tint bg-white px-3.5 py-2.5 text-sm"
                >
                  <span>
                    <span className="mr-2 font-bold text-webzy-primary">{idx + 1}.</span>
                    {field.label[siteLanguage]}
                  </span>
                  <span className="text-xs text-webzy-ink/60">
                    {field.required ? 'Required' : 'Optional'}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-bold text-webzy-ink">Languages included</h2>
            <p className="mt-1 text-sm text-webzy-ink/75">
              {theme.languages.map((l) => LANG_NAME[l]).join(' · ')}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/create/${theme.id}`}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-webzy-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
            >
              Use this theme ({formatInr(theme.price.base)})
            </Link>
            <Link
              href="/request"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-webzy-tint bg-white px-5 py-3 text-sm font-bold text-webzy-ink hover:bg-webzy-surface"
            >
              Need custom tweaks?
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
