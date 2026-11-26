'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import {
  ADDON_CATALOG,
  formatInr,
  getLanguageMeta,
  getSiteCopy,
  LanguageCode,
  pickLocalizedText,
  toCoreLanguageCode,
} from '@webzy/core';
import { OCCASION_LABELS, ThemeManifest, ThemeRenderer } from '@webzy/themes';
import { useLanguage } from '../shell/LanguageProvider';
import { AdaptivePreviewStage } from '../shell/AdaptivePreviewStage';

interface ThemeDemoClientProps {
  theme: ThemeManifest;
  defaultValidityDays: number;
}

export function ThemeDemoClient({ theme, defaultValidityDays }: ThemeDemoClientProps) {
  const { language: siteLanguage } = useLanguage();
  const site = getSiteCopy(siteLanguage);
  const [demoLanguage, setDemoLanguage] = useState<LanguageCode>(() =>
    theme.languages.includes(siteLanguage) ? siteLanguage : toCoreLanguageCode(siteLanguage),
  );
  const [replayKey, setReplayKey] = useState(0);

  // Reflect global language selector changes immediately inside the demo preview too
  useEffect(() => {
    setDemoLanguage(
      theme.languages.includes(siteLanguage) ? siteLanguage : toCoreLanguageCode(siteLanguage),
    );
  }, [siteLanguage, theme.languages]);

  return (
    <div className="mx-auto max-w-6xl px-3.5 py-5 sm:px-6 lg:py-12">
      <div className="mb-4 sm:mb-6">
        <Link
          href="/themes"
          className="inline-flex min-h-[44px] items-center text-sm font-bold text-webzy-primary hover:underline"
        >
          ← {site.common.browseAllThemes}
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-10">
        {/* Left: Adaptive Interactive Preview Stage */}
        <div className="lg:col-span-6">
          <AdaptivePreviewStage
            title={pickLocalizedText(theme.name, siteLanguage)}
            caption={pickLocalizedText(theme.signatureMoment, demoLanguage)}
            accentColor={theme.palette.primary || '#E11D63'}
            onReplay={() => setReplayKey((k) => k + 1)}
            toolbar={
              <div className="inline-flex items-center gap-2">
                <label htmlFor="theme-demo-lang" className="text-xs font-semibold text-webzy-ink/70">
                  Preview language:
                </label>
                <select
                  id="theme-demo-lang"
                  value={demoLanguage}
                  onChange={(e) => setDemoLanguage(e.target.value as LanguageCode)}
                  className="min-h-[40px] rounded-full border border-webzy-tint bg-white px-4 text-xs font-bold text-webzy-ink outline-none focus:border-webzy-primary"
                >
                  {theme.languages.map((langCode) => {
                    const meta = getLanguageMeta(langCode);
                    return (
                      <option key={langCode} value={langCode}>
                        {meta.nativeLabel} ({meta.englishLabel})
                      </option>
                    );
                  })}
                </select>
              </div>
            }
            fullscreenChildren={
              <ThemeRenderer
                key={`fs-${theme.id}-${demoLanguage}-${replayKey}`}
                manifest={theme}
                language={demoLanguage}
                watermarked
              />
            }
          >
            <ThemeRenderer
              key={`${theme.id}-${demoLanguage}-${replayKey}`}
              manifest={theme}
              language={demoLanguage}
              watermarked
            />
          </AdaptivePreviewStage>
        </div>

        {/* Right: Side Panel with Price, Inputs Needed & Languages (Section 5) */}
        <aside className="rounded-2xl border border-webzy-ink/[0.09] bg-white p-4 sm:p-6 lg:col-span-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-webzy-primary">
              {pickLocalizedText(OCCASION_LABELS[theme.occasion], siteLanguage)}
            </span>
            <span className="text-webzy-ink/60">
              {defaultValidityDays}-day active link
            </span>
          </div>

          <h1 className="mt-3 font-heading text-2xl font-bold text-webzy-ink sm:mt-4 sm:text-3xl">
            {pickLocalizedText(theme.name, siteLanguage)}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-webzy-ink/80">
            {pickLocalizedText(theme.audience, siteLanguage)}
          </p>

          <div className="mt-4 sm:mt-5 rounded-2xl bg-white p-3.5 sm:p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-webzy-ink/60">Final GST-inclusive price</p>
              {theme.price.compareAt && theme.price.compareAt > theme.price.base ? (
                <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  Save {formatInr(theme.price.compareAt - theme.price.base)} ({Math.round(((theme.price.compareAt - theme.price.base) / theme.price.compareAt) * 100)}% off)
                </span>
              ) : null}
            </div>
            <div className="mt-1.5 flex items-baseline gap-2.5">
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-emerald-700">
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
                {theme.price.addons.map((a) => pickLocalizedText(ADDON_CATALOG[a].label, siteLanguage)).join(' · ')}
              </p>
            ) : null}
          </div>

          <div className="mt-5 sm:mt-6">
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
                    {pickLocalizedText(field.label, siteLanguage)}
                  </span>
                  <span className="text-xs text-webzy-ink/60">
                    {field.required ? 'Required' : 'Optional'}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 sm:mt-6">
            <h2 className="text-sm font-bold text-webzy-ink">Languages included</h2>
            <p className="mt-1 text-sm text-webzy-ink/75">
              {theme.languages.map((l) => getLanguageMeta(l).nativeLabel).join(' · ')}
            </p>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={
                theme.occasion === 'wedding'
                  ? `/weddings/${theme.id}/customize`
                  : `/create/${theme.id}`
              }
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
