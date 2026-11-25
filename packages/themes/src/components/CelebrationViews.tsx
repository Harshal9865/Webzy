'use client';

import React, { useState } from 'react';
import { type LanguageCode, pickLocalizedText } from '@webzy/core';
import type { ThemeDemoPayload, ThemeManifest } from '../schema';

export interface ThemeViewProps {
  manifest: ThemeManifest;
  data: ThemeDemoPayload;
  language: LanguageCode;
}

function PhotoStrip({ photos }: { photos?: string[] }) {
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);
  if (!photos || photos.length === 0) return null;
  const visiblePhotos = photos.slice(0, 3);

  return (
    <>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {visiblePhotos.map((src, idx) => (
          <button
            key={`${src.slice(0, 24)}-${idx}`}
            type="button"
            disabled={Boolean(failed[src])}
            onClick={() => !failed[src] && setZoomIdx(idx)}
            aria-label={`View memory ${idx + 1}`}
            className="group aspect-square overflow-hidden rounded-xl border border-black/10 bg-[#FFF5F8] flex items-center justify-center transition-all duration-300 hover:border-[#E11D63]/45 hover:shadow-sm active:scale-95"
          >
            {failed[src] ? (
              <svg
                className="h-6 w-6 text-[#E11D63]/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.6}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={src}
                alt={`Memory ${idx + 1}`}
                loading="lazy"
                decoding="async"
                onError={() => setFailed((prev) => ({ ...prev, [src]: true }))}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}
          </button>
        ))}
      </div>

      {zoomIdx !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomIdx(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl bg-white p-2 shadow-2xl animate-pop-bounce"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={visiblePhotos[zoomIdx]}
              alt={`Expanded memory ${zoomIdx + 1}`}
              className="max-h-[70vh] w-full rounded-xl object-contain"
            />
            <div className="mt-2 flex items-center justify-between px-2 pb-1 text-xs font-bold text-[#2B1B2E]">
              <span>
                Photo {zoomIdx + 1} / {visiblePhotos.length}
              </span>
              <div className="flex items-center gap-1.5">
                {visiblePhotos.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setZoomIdx((prev) =>
                          prev === null ? 0 : (prev - 1 + visiblePhotos.length) % visiblePhotos.length,
                        )
                      }
                      className="rounded-lg border border-black/10 px-2.5 py-1 hover:bg-[#FFF5F8]"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setZoomIdx((prev) => (prev === null ? 0 : (prev + 1) % visiblePhotos.length))
                      }
                      className="rounded-lg border border-black/10 px-2.5 py-1 hover:bg-[#FFF5F8]"
                    >
                      Next
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => setZoomIdx(null)}
                  className="rounded-lg bg-[#E11D63] px-3 py-1 text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function BirthdayConfettiView({ manifest, data, language }: ThemeViewProps) {
  const highlights = data.highlights ?? [];
  const [popped, setPopped] = useState<number[]>([]);

  function toggleBalloon(idx: number) {
    setPopped((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  }

  const allPopped = highlights.length > 0 && popped.length === highlights.length;

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 py-2 text-center animate-fade-in">
      <div>
        <span className="inline-block rounded-full bg-[#FFE8EF] px-3 py-1 text-xs font-semibold text-[#E11D63]">
          {pickLocalizedText(manifest.name, language)}
        </span>
        <h3 className="mt-2 break-words font-heading text-xl font-bold text-[#2B1B2E]">
          {pickLocalizedText(data.headline, language)}
        </h3>
        <p className="mt-2 break-words text-sm leading-relaxed text-[#2B1B2E]/85">
          {pickLocalizedText(data.message, language)}
        </p>
        <PhotoStrip photos={data.photos} />
      </div>

      <div className="space-y-2 text-left">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold text-[#E11D63]">
            {language === 'hi'
              ? 'गुब्बारों पर टैप करें:'
              : language === 'hinglish'
                ? 'Balloons tap karke kholo:'
                : 'Tap balloons to reveal:'}
          </p>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
              allPopped ? 'bg-emerald-100 text-emerald-800 animate-pop-bounce' : 'bg-[#FFE8EF] text-[#E11D63]'
            }`}
          >
            {allPopped ? 'All Unlocked' : `${popped.length}/${highlights.length}`}
          </span>
        </div>
        {highlights.map((item, idx) => {
          const isOpen = popped.includes(idx);
          return (
            <button
              key={item.title.en}
              type="button"
              onClick={() => toggleBalloon(idx)}
              className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 text-left transition-all duration-300 active:scale-[0.98] ${
                isOpen
                  ? 'border-[#E11D63]/55 bg-white shadow-sm animate-pop-bounce'
                  : 'border-[#FFE8EF] bg-[#FFF5F8] hover:border-[#E11D63]/40'
              }`}
            >
              <div className="min-w-0">
                <p className="break-words text-xs font-bold text-[#E11D63]">
                  {pickLocalizedText(item.title, language)}
                </p>
                <p className="mt-0.5 break-words text-xs text-[#2B1B2E] transition-opacity duration-300">
                  {isOpen
                    ? pickLocalizedText(item.detail, language)
                    : language === 'hinglish'
                      ? 'Tap karke padho...'
                      : 'Tap to pop & read...'}
                </p>
              </div>
              <span
                aria-hidden="true"
                className={`shrink-0 text-[#E11D63] transition-transform duration-300 ${
                  isOpen ? 'scale-110 rotate-12' : 'scale-100'
                }`}
              >
                {isOpen ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.1 6.4L20.5 10l-6.4 2.1L12 18.5l-2.1-6.4L3.5 10l6.4-1.6L12 2z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <ellipse cx="12" cy="9.5" rx="5.5" ry="6.5" />
                    <path strokeLinecap="round" d="M12 16v5m-1.5-5h3" />
                  </svg>
                )}
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
  const [blessCount, setBlessCount] = useState(0);
  const current = highlights[pageIdx];

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 rounded-2xl bg-[#FFFBEB] p-4 text-center animate-fade-in">
      <div>
        <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          {language === 'hi' ? 'सादर जन्मदिन' : 'With Respect & Gratitude'}
        </span>
        <h3 className="mt-2 break-words font-heading text-xl font-bold text-[#2B1B2E]">
          {pickLocalizedText(data.headline, language)}
        </h3>
        <p className="mt-2 break-words text-sm leading-relaxed text-[#2B1B2E]/90">
          {pickLocalizedText(data.message, language)}
        </p>
        <PhotoStrip photos={data.photos} />
      </div>

      {current ? (
        <div
          key={pageIdx}
          className="rounded-2xl border border-amber-200 bg-white p-4 text-left shadow-sm animate-fade-in"
        >
          <p className="text-xs font-bold text-amber-800">{pickLocalizedText(current.title, language)}</p>
          <p className="mt-1 text-sm text-[#2B1B2E]">{pickLocalizedText(current.detail, language)}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {highlights.map((item, idx) => (
            <button
              key={item.title.en}
              type="button"
              onClick={() => setPageIdx(idx)}
              className={`min-h-[38px] min-w-[38px] rounded-full px-3 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                idx === pageIdx
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white text-amber-900 ring-1 ring-amber-200 hover:bg-amber-50'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setBlessCount((c) => c + 1)}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-amber-300 bg-white px-3.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100 active:scale-95"
        >
          <span>{blessCount > 0 ? `Charan Sparsh / Sent (${blessCount})` : 'Send Pranam'}</span>
        </button>
      </div>
    </div>
  );
}

export function OurTimelineView({ data, language }: ThemeViewProps) {
  const highlights = data.highlights ?? [];
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 py-1 animate-fade-in">
      <div className="text-center">
        <h3 className="break-words font-heading text-xl font-bold text-[#9D174D]">
          {pickLocalizedText(data.headline, language)}
        </h3>
        <p className="mt-1.5 break-words text-sm leading-relaxed text-[#2B1B2E]/85">
          {pickLocalizedText(data.message, language)}
        </p>
        <PhotoStrip photos={data.photos} />
      </div>

      <div className="space-y-2">
        {highlights.map((item, idx) => {
          const isOpen = activeIdx === idx;
          return (
            <button
              key={item.title.en}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`min-h-[44px] w-full rounded-2xl border p-3 text-left transition-all duration-300 active:scale-[0.99] ${
                isOpen
                  ? 'border-[#9D174D] bg-[#FDF2F8] shadow-sm animate-pop-bounce'
                  : 'border-black/10 bg-white hover:border-[#9D174D]/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-[#9D174D]">{pickLocalizedText(item.title, language)}</p>
                <span className="text-[10px] font-bold text-[#9D174D]/70">
                  {idx + 1}/{highlights.length}
                </span>
              </div>
              {isOpen ? (
                <p className="mt-1 text-xs text-[#2B1B2E]/85 animate-fade-in">
                  {pickLocalizedText(item.detail, language)}
                </p>
              ) : (
                <p className="mt-0.5 text-[11px] text-[#2B1B2E]/50">Tap to open memory</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MakeThemSmileView({ data, language }: ThemeViewProps) {
  const highlights = data.highlights ?? [];
  const [openedIdx, setOpenedIdx] = useState<number | null>(0);
  const [smileCount, setSmileCount] = useState(0);

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 py-1 animate-fade-in">
      <div className="text-center">
        <h3 className="break-words font-heading text-xl font-bold text-teal-800">
          {pickLocalizedText(data.headline, language)}
        </h3>
        <p className="mt-1.5 break-words text-sm leading-relaxed text-[#2B1B2E]/85">
          {pickLocalizedText(data.message, language)}
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
              className={`min-h-[44px] w-full rounded-2xl border px-3.5 py-2.5 text-left transition-all duration-300 active:scale-[0.99] ${
                open
                  ? 'border-teal-400 bg-white shadow-sm'
                  : 'border-teal-200 bg-teal-50/70 hover:bg-teal-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 break-words text-xs font-bold text-teal-900">
                  {pickLocalizedText(card.title, language)}
                </span>
                <span
                  className={`shrink-0 text-xs font-bold text-teal-700 transition-transform duration-200 ${
                    open ? 'rotate-180' : 'rotate-0'
                  }`}
                >
                  {open ? '−' : '+'}
                </span>
              </div>
              <div
                className={`grid transition-all duration-300 ${
                  open ? 'grid-rows-[1fr] opacity-100 mt-1.5' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-xs text-[#2B1B2E]">{pickLocalizedText(card.detail, language)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setSmileCount((s) => s + 1)}
        className="min-h-[40px] w-full rounded-full bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-teal-800 active:scale-95"
      >
        {smileCount > 0 ? `Smile Sent (${smileCount})` : 'Tap If This Made You Smile'}
      </button>
    </div>
  );
}
