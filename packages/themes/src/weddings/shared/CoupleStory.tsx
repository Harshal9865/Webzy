'use client';

import React, { useState } from 'react';
import { getWeddingUiCopy } from '../i18n';
import type { WeddingLanguage, WeddingStoryMilestone, WeddingThemeKey } from '../schema';
import { getWeddingThemePalette } from '../themePalettes';
import { VarmalaDiyaDivider } from './WeddingArt';

interface CoupleStoryProps {
  storyTitle?: string;
  storyText?: string;
  storyMilestones?: WeddingStoryMilestone[];
  brideName: string;
  groomName: string;
  language?: WeddingLanguage;
  theme?: WeddingThemeKey;
  compact?: boolean;
}

export function CoupleStory({
  storyTitle,
  storyText,
  storyMilestones,
  brideName,
  groomName,
  language = 'en',
  theme = 'emerald',
  compact = false,
}: CoupleStoryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const hasMilestones = Boolean(storyMilestones && storyMilestones.length > 0);
  if (!storyText && !hasMilestones) return null;

  const copy = getWeddingUiCopy(language);
  const pal = getWeddingThemePalette(theme);
  const folioBg = pal.paperSurface;
  const folioBorder = pal.outerBorder;
  const innerRuleBorder = pal.innerRuleBorder;
  const accentText = pal.accentText;
  const tabletCardBg = pal.tabletCardBg;

  const safeMilestones = storyMilestones ?? [];
  const safeIdx = safeMilestones.length > 0 ? Math.min(selectedIdx, safeMilestones.length - 1) : 0;
  const activeMilestone = safeMilestones[safeIdx];

  return (
    <section
      id="wedding-story"
      className={
        compact
          ? 'w-full py-6 px-4 scroll-mt-16'
          : 'w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8 scroll-mt-16'
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

        <div className="relative z-10 text-center">
          <span className="font-royal-serif text-[10.5px] md:text-[11px] font-bold uppercase tracking-[0.3em] text-[#8C6D23] block">
            V &middot; {copy.story.eyebrow}
          </span>

          <h2
            className={`font-royal-script mt-1.5 leading-[1.08] ${accentText} ${
              compact ? 'text-4xl' : 'text-4xl sm:text-5xl'
            }`}
          >
            {storyTitle || copy.story.defaultTitle}
          </h2>

          <VarmalaDiyaDivider theme={theme} className="my-3.5" />

          {storyText ? (
            <p
              className={`font-royal-serif italic text-[#2B1B2E]/85 mx-auto ${
                compact ? 'text-sm max-w-xs' : 'text-base sm:text-lg max-w-xl'
              }`}
            >
              {storyText}
            </p>
          ) : null}

          <p className="mt-2 font-royal-serif text-[10.5px] font-bold uppercase tracking-[0.24em] text-[#8C6D23]">
            {brideName} &amp; {groomName}
          </p>

          {/* Interactive Year-Tap Milestone Deck */}
          {hasMilestones && activeMilestone ? (
            <div className="mt-6">
              <div
                role="tablist"
                aria-label={copy.story.milestonesHeading}
                className="flex flex-wrap items-center justify-center gap-2"
              >
                {safeMilestones.map((ms, idx) => {
                  const selected = idx === safeIdx;
                  return (
                    <button
                      key={`${ms.year}-${idx}`}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setSelectedIdx(idx)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 font-royal-serif text-xs font-bold tracking-[0.16em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
                        selected
                          ? 'border-[#C5A059] bg-[#C5A059] text-[#18120B] shadow-sm'
                          : 'border-[#C5A059]/40 bg-white/85 text-[#3B2A2F] hover:border-[#C5A059]'
                      }`}
                    >
                      <span>{ms.year}</span>
                      <span className="hidden sm:inline opacity-75">· {ms.title}</span>
                    </button>
                  );
                })}
              </div>

              <div
                key={safeIdx}
                className={`animate-fade-in relative mt-4 overflow-hidden rounded-2xl border border-[#C5A059]/40 p-5 sm:p-7 transition-all duration-300 ${tabletCardBg}`}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none select-none absolute right-4 -top-2 font-royal-serif text-[56px] font-light leading-none text-[#C5A059]/15"
                >
                  {activeMilestone.year}
                </span>

                <div className="relative z-10">
                  <span className="font-royal-serif text-[11px] font-bold uppercase tracking-[0.24em] text-[#8C6D23]">
                    {activeMilestone.year} · Chapter {safeIdx + 1} / {safeMilestones.length}
                  </span>
                  <h3
                    className={`font-royal-serif mt-1.5 font-semibold ${accentText} ${
                      compact ? 'text-lg' : 'text-xl sm:text-2xl'
                    }`}
                  >
                    {activeMilestone.title}
                  </h3>
                  <p
                    className={`mt-2 mx-auto max-w-lg font-medium text-[#2B1B2E]/85 ${
                      compact ? 'text-xs' : 'text-sm sm:text-[15px]'
                    }`}
                  >
                    {activeMilestone.caption}
                  </p>

                  {safeMilestones.length > 1 ? (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedIdx((i) => (i - 1 + safeMilestones.length) % safeMilestones.length)
                        }
                        className="rounded-full border border-[#C5A059]/45 bg-white/90 px-3.5 py-1 font-royal-serif text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#3B2A2F] transition hover:border-[#C5A059] active:scale-95"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedIdx((i) => (i + 1) % safeMilestones.length)}
                        className="rounded-full border border-[#C5A059] bg-[#C5A059] px-3.5 py-1 font-royal-serif text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#18120B] transition hover:brightness-105 active:scale-95"
                      >
                        Next Milestone
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
