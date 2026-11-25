'use client';

import React, { useEffect, useState } from 'react';
import { type CoreLanguageCode, type LanguageCode, toCoreLanguageCode } from '@webzy/core';

interface TapToOpenCoverProps {
  recipientName: string;
  senderName: string;
  accentColor: string;
  primaryColor: string;
  language: LanguageCode;
  watermarked?: boolean;
  onOpened?: () => void;
  children: React.ReactNode;
}

const COVER_COPY: Record<
  CoreLanguageCode,
  { badge: string; fromLabel: string; tapButton: string; replay: string; hintText: string }
> = {
  hinglish: {
    badge: 'Aapke liye ek khaas link',
    fromLabel: 'Bheja hai:',
    tapButton: 'Tap karke kholo',
    replay: 'Dobara dekho',
    hintText: 'Kholne ke liye button ya screen par tap karein',
  },
  hi: {
    badge: 'आपके लिए एक खास तोहफ़ा',
    fromLabel: 'प्रेषक:',
    tapButton: 'टैप करके खोलें',
    replay: 'फिर से देखें',
    hintText: 'तोहफ़ा देखने के लिए स्क्रीन पर टैप करें',
  },
  en: {
    badge: 'A special link for you',
    fromLabel: 'From:',
    tapButton: 'Tap to open',
    replay: 'Replay gift',
    hintText: 'Tap the button or screen to reveal',
  },
};

export function TapToOpenCover({
  recipientName,
  senderName,
  accentColor,
  primaryColor,
  language,
  watermarked = false,
  onOpened,
  children,
}: TapToOpenCoverProps) {
  const [opened, setOpened] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);

  const copy = COVER_COPY[toCoreLanguageCode(language)] ?? COVER_COPY.en;

  function handleOpen() {
    setOpened(true);
    onOpened?.();
  }

  // Accessibility & elder-friendly auto-reveal fallback:
  // If unopened after 7s, show tap hint; if untouched after 15s, auto-reveal surprise.
  useEffect(() => {
    if (opened) return;
    const hintTimer = setTimeout(() => {
      setShowTapHint(true);
    }, 7000);
    const autoOpenTimer = setTimeout(() => {
      handleOpen();
    }, 15000);
    return () => {
      clearTimeout(hintTimer);
      clearTimeout(autoOpenTimer);
    };
  }, [opened]);

  return (
    <div className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden rounded-[28px] bg-white text-[#2B1B2E]">
      {watermarked ? (
        <div
          aria-hidden="true"
          className="pointer-events-none flex justify-center bg-[#FFE8EF]/80 py-1 text-[10px] font-bold tracking-widest text-[#E11D63]"
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      {opened ? (
        <div className="relative z-20 flex items-center justify-end px-4 pt-3.5 sm:pt-5">
          <button
            type="button"
            onClick={() => {
              setShowTapHint(false);
              setOpened(false);
            }}
            className="inline-flex min-h-[44px] items-center rounded-full bg-white/95 px-4 text-xs font-semibold text-[#2B1B2E] shadow-sm ring-1 ring-black/10 transition hover:bg-[#FFF5F8]"
          >
            {copy.replay}
          </button>
        </div>
      ) : null}

      {!opened ? (
        <div
          onClick={handleOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpen();
            }
          }}
          className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 py-6 text-center cursor-pointer transition-all duration-500 motion-reduce:transition-none sm:px-6 sm:py-8"
        >
          <div
            className="relative mb-4 sm:mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl shadow-md transition-transform duration-300 hover:scale-105 active:scale-95 animate-float motion-reduce:animate-none"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
            }}
            aria-hidden="true"
          >
            <span
              className="pointer-events-none absolute -inset-2 rounded-[28px] opacity-30 blur-md animate-pulse"
              style={{ backgroundColor: primaryColor }}
            />
            <svg viewBox="0 0 48 48" className="relative h-8 w-8 sm:h-10 sm:w-10 text-white drop-shadow-sm" fill="none">
              <rect x="8" y="20" width="32" height="20" rx="4" stroke="currentColor" strokeWidth="3" />
              <path d="M6 16h36v6H6z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
              <path d="M24 16v24" stroke="currentColor" strokeWidth="3" />
              <path
                d="M24 16c-3-6-10-6-10-1s7 1 10 1zm0 0c3-6 10-6 10-1s-7 1-10 1z"
                stroke="currentColor"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          <span className="rounded-full bg-[#FFE8EF] px-3 py-1 text-xs font-semibold text-[#E11D63]">
            {copy.badge}
          </span>

          <h2 className="mt-3.5 sm:mt-4 max-w-full break-words font-heading text-2xl font-bold leading-snug text-[#2B1B2E] sm:text-3xl">
            {recipientName}
          </h2>
          <p className="mt-1 max-w-full break-words text-sm text-[#2B1B2E]/70 sm:text-base">
            {copy.fromLabel} <span className="font-semibold text-[#2B1B2E]">{senderName}</span>
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            className="mt-5 sm:mt-7 inline-flex min-h-[48px] items-center justify-center rounded-full px-7 py-3 text-sm font-bold text-white shadow-md transition hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none"
            style={{ backgroundColor: primaryColor }}
          >
            {copy.tapButton}
          </button>

          {showTapHint ? (
            <p className="mt-3 text-xs font-semibold text-[#E11D63] animate-pulse">
              {copy.hintText}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between px-4 pb-4 pt-2 animate-[fadeIn_320ms_ease-out] motion-reduce:animate-none">
          {children}
        </div>
      )}
    </div>
  );
}
