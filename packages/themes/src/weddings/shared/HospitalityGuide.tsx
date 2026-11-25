'use client';

import React, { useState } from 'react';
import { getWeddingUiCopy } from '../i18n';
import type { WeddingHospitalityNote, WeddingLanguage, WeddingThemeKey } from '../schema';
import { getWeddingThemePalette } from '../themePalettes';
import { VarmalaDiyaDivider } from './WeddingArt';

interface HospitalityGuideProps {
  notes?: WeddingHospitalityNote[];
  language?: WeddingLanguage;
  theme?: WeddingThemeKey;
  compact?: boolean;
}

function formatFolioNumber(idx: number): string {
  return String(idx + 1).padStart(2, '0');
}

export function HospitalityGuide({
  notes,
  language = 'en',
  theme = 'emerald',
  compact = false,
}: HospitalityGuideProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!notes || notes.length === 0) return null;

  const safeIdx = selectedIdx < notes.length ? selectedIdx : 0;
  const activeNote = notes[safeIdx];

  const copy = getWeddingUiCopy(language);
  const pal = getWeddingThemePalette(theme);
  const folioBg = pal.paperSurface;
  const folioBorder = pal.outerBorder;
  const innerRuleBorder = pal.innerRuleBorder;
  const headingColor = pal.accentText;
  const cardSurface = pal.tabletCardBg;

  return (
    <section
      className={
        compact
          ? 'w-full py-6 px-4'
          : 'w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8'
      }
    >
      <div
        className={`relative mx-auto border shadow-[0_18px_50px_-28px_rgba(38,26,12,0.22)] ${folioBg} ${folioBorder} ${
          compact
            ? 'max-w-md rounded-[26px] px-5 py-7'
            : 'max-w-4xl rounded-[26px] md:rounded-[30px] px-6 py-8 sm:px-10 sm:py-10'
        }`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-[7px] md:inset-[10px] rounded-[20px] md:rounded-[22px] border ${innerRuleBorder}`}
        />

        <div className="relative z-10">
          <div className={compact ? 'text-center mb-5' : 'text-center mb-7'}>
            <span className="font-royal-serif text-[10.5px] md:text-[11px] font-bold uppercase tracking-[0.3em] text-[#8C6D23] block">
              VII &middot; {copy.hospitality.eyebrow}
            </span>
            <h2
              className={`font-royal-serif mt-1.5 font-normal tracking-wide leading-[1.2] ${headingColor} ${
                compact ? 'text-2xl' : 'text-2xl sm:text-3xl md:text-[36px]'
              }`}
            >
              {copy.hospitality.heading}
            </h2>
            <VarmalaDiyaDivider theme={theme} className="my-3" />
          </div>

          {/* Clickable Guest Concierge Pill Tabs */}
          <div
            role="tablist"
            aria-label={copy.hospitality.heading}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {notes.map((note, idx) => {
              const isSelected = idx === safeIdx;
              return (
                <button
                  key={`${note.title}-${idx}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedIdx(idx)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-royal-serif text-xs font-bold tracking-wide transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
                    isSelected
                      ? 'border-[#C5A059] bg-[#C5A059] text-[#18120B] shadow-sm'
                      : 'border-[#C5A059]/40 bg-white/80 text-[#3B2A2F] hover:border-[#C5A059] hover:bg-white'
                  }`}
                >
                  <span className="text-[10px] opacity-75">{formatFolioNumber(idx)}</span>
                  <span>{note.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Concierge Card */}
          <div
            key={safeIdx}
            className={`animate-fade-in mt-5 rounded-2xl border border-[#C5A059]/40 p-5 sm:p-6 text-center transition-all ${cardSurface}`}
          >
            <div className="flex items-center justify-center gap-2.5">
              <span className="font-royal-serif text-xs font-bold tracking-[0.2em] text-[#8C6D23]">
                {formatFolioNumber(safeIdx)} / {formatFolioNumber(notes.length - 1)}
              </span>
              <span className="h-1 w-1 rotate-45 bg-[#C5A059]" aria-hidden="true" />
              <h3
                className={`font-royal-serif font-semibold ${headingColor} ${
                  compact ? 'text-base' : 'text-lg sm:text-xl'
                }`}
              >
                {activeNote.title}
              </h3>
            </div>
            <p
              className={`mt-2.5 mx-auto max-w-xl font-medium leading-relaxed text-[#2B1B2E]/85 ${
                compact ? 'text-xs' : 'text-sm sm:text-[15px]'
              }`}
            >
              {activeNote.detail}
            </p>
            {notes.length > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIdx((i) => (i - 1 + notes.length) % notes.length)}
                  className="rounded-full border border-[#C5A059]/45 bg-white/90 px-3.5 py-1 font-royal-serif text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#3B2A2F] transition hover:border-[#C5A059] active:scale-95"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIdx((i) => (i + 1) % notes.length)}
                  className="rounded-full border border-[#C5A059] bg-[#C5A059] px-3.5 py-1 font-royal-serif text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#18120B] transition hover:brightness-105 active:scale-95"
                >
                  Next Info
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
