'use client';

import React, { useState } from 'react';
import type { LanguageCode } from '@webzy/core';
import type { ThemeDemoPayload, ThemeManifest } from '../schema';

export interface ThemeViewProps {
  manifest: ThemeManifest;
  data: ThemeDemoPayload;
  language: LanguageCode;
}

function PhotoStrip({ photos }: { photos?: string[] }) {
  if (!photos || photos.length === 0) return null;
  return (
    <div className="mt-2 grid grid-cols-3 gap-1.5">
      {photos.slice(0, 3).map((src, idx) => (
        <div
          key={`${src.slice(0, 24)}-${idx}`}
          className="aspect-square overflow-hidden rounded-xl border border-black/10 bg-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`Memory ${idx + 1}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export function BirthdayConfettiView({ manifest, data, language }: ThemeViewProps) {
  const highlights = data.highlights ?? [];
  const [popped, setPopped] = useState<number[]>([]);

  function toggleBalloon(idx: number) {
    setPopped((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
  }

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 py-2 text-center">
      <div>
        <span className="inline-block rounded-full bg-[#FFE8EF] px-3 py-1 text-xs font-semibold text-[#E11D63]">
          {manifest.name[language]}
        </span>
        <h3 className="mt-2 break-words font-heading text-xl font-bold text-[#2B1B2E]">
          {data.headline[language]}
        </h3>
        <p className="mt-2 break-words text-sm leading-relaxed text-[#2B1B2E]/85">
          {data.message[language]}
        </p>
        <PhotoStrip photos={data.photos} />
      </div>

      <div className="space-y-2 text-left">
        <p className="text-center text-xs font-semibold text-[#E11D63]">
          {language === 'hi'
            ? 'गुब्बारों पर टैप करें:'
            : language === 'en'
              ? 'Tap balloons to reveal:'
              : 'Balloons tap karke kholo:'}
        </p>
        {highlights.map((item, idx) => {
          const isOpen = popped.includes(idx);
          return (
            <button
              key={item.title.en}
              type="button"
              onClick={() => toggleBalloon(idx)}
              className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-2xl border border-[#FFE8EF] bg-[#FFF5F8] px-3.5 py-2.5 text-left transition hover:border-[#E11D63]/40"
            >
              <div className="min-w-0">
                <p className="break-words text-xs font-bold text-[#E11D63]">
                  {item.title[language]}
                </p>
                <p className="mt-0.5 break-words text-xs text-[#2B1B2E]">
                  {isOpen
                    ? item.detail[language]
                    : language === 'en'
                      ? 'Tap to pop & read...'
                      : 'Tap karke padho...'}
                </p>
              </div>
              <span aria-hidden="true" className="shrink-0 text-base">
                {isOpen ? '✨' : '🎈'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BirthdayAshirwadView({ data, language }: ThemeViewProps) {
  const highlights = data.highlights ?? [];
  const [pageIdx, setPageIdx] = useState(0);
  const current = highlights[pageIdx];

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 rounded-2xl bg-[#FFFBEB] p-4 text-center">
      <div>
        <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          {language === 'hi' ? 'सादर जन्मदिन' : 'With Respect & Gratitude'}
        </span>
        <h3 className="mt-2 break-words font-heading text-xl font-bold text-[#2B1B2E]">
          {data.headline[language]}
        </h3>
        <p className="mt-2 break-words text-sm leading-relaxed text-[#2B1B2E]/90">
          {data.message[language]}
        </p>
        <PhotoStrip photos={data.photos} />
      </div>

      {current ? (
        <div className="rounded-2xl border border-amber-200 bg-white p-4 text-left shadow-sm">
          <p className="text-xs font-bold text-amber-800">{current.title[language]}</p>
          <p className="mt-1 text-sm text-[#2B1B2E]">{current.detail[language]}</p>
        </div>
      ) : null}

      <div className="flex items-center justify-center gap-2">
        {highlights.map((item, idx) => (
          <button
            key={item.title.en}
            type="button"
            onClick={() => setPageIdx(idx)}
            className={`min-h-[44px] rounded-full px-3 text-xs font-semibold transition ${
              idx === pageIdx ? 'bg-amber-700 text-white' : 'bg-white text-amber-900 ring-1 ring-amber-200'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export function OurTimelineView({ data, language }: ThemeViewProps) {
  const highlights = data.highlights ?? [];
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 py-1">
      <div className="text-center">
        <h3 className="break-words font-heading text-xl font-bold text-[#9D174D]">
          {data.headline[language]}
        </h3>
        <p className="mt-1.5 break-words text-sm leading-relaxed text-[#2B1B2E]/85">
          {data.message[language]}
        </p>
        <PhotoStrip photos={data.photos} />
      </div>

      <div className="space-y-2">
        {highlights.map((item, idx) => (
          <button
            key={item.title.en}
            type="button"
            onClick={() => setActiveIdx(idx)}
            className={`min-h-[44px] w-full rounded-2xl border p-3 text-left transition ${
              activeIdx === idx
                ? 'border-[#9D174D] bg-[#FDF2F8] shadow-sm'
                : 'border-black/10 bg-white'
            }`}
          >
            <p className="text-xs font-bold text-[#9D174D]">{item.title[language]}</p>
            <p className="mt-0.5 text-xs text-[#2B1B2E]/80">{item.detail[language]}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MakeThemSmileView({ data, language }: ThemeViewProps) {
  const highlights = data.highlights ?? [];
  const [openedIdx, setOpenedIdx] = useState<number | null>(0);

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 py-1">
      <div className="text-center">
        <h3 className="break-words font-heading text-xl font-bold text-teal-800">
          {data.headline[language]}
        </h3>
        <p className="mt-1.5 break-words text-sm leading-relaxed text-[#2B1B2E]/85">
          {data.message[language]}
        </p>
      </div>

      <div className="space-y-2">
        {highlights.map((card, idx) => {
          const open = openedIdx === idx;
          return (
            <button
              key={card.title.en}
              type="button"
              onClick={() => setOpenedIdx(open ? null : idx)}
              className="min-h-[44px] w-full rounded-2xl border border-teal-200 bg-teal-50/70 px-3.5 py-2.5 text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 break-words text-xs font-bold text-teal-900">
                  {card.title[language]}
                </span>
                <span className="shrink-0 text-xs text-teal-700">{open ? '−' : '+'}</span>
              </div>
              {open ? <p className="mt-1.5 text-xs text-[#2B1B2E]">{card.detail[language]}</p> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
