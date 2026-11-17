'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { LanguageCode } from '@webzy/core';

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
  LanguageCode,
  { badge: string; fromLabel: string; tapButton: string; replay: string; muteOn: string; muteOff: string }
> = {
  hinglish: {
    badge: 'Aapke liye ek khaas link',
    fromLabel: 'Bheja hai:',
    tapButton: 'Tap karke kholo',
    replay: 'Dobara dekho',
    muteOn: 'Sound off',
    muteOff: 'Sound on',
  },
  hi: {
    badge: 'आपके लिए एक खास तोहफ़ा',
    fromLabel: 'प्रेषक:',
    tapButton: 'टैप करके खोलें',
    replay: 'फिर से देखें',
    muteOn: 'आवाज़ बंद',
    muteOff: 'आवाज़ चालू',
  },
  en: {
    badge: 'A special link for you',
    fromLabel: 'From:',
    tapButton: 'Tap to open',
    replay: 'Replay gift',
    muteOn: 'Sound off',
    muteOff: 'Sound on',
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
  const [muted, setMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const handleHidden = () => {
      if (document.hidden && audioCtxRef.current && audioCtxRef.current.state === 'running') {
        void audioCtxRef.current.suspend().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleHidden);
    return () => {
      document.removeEventListener('visibilitychange', handleHidden);
      if (audioCtxRef.current) {
        void audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  const copy = COVER_COPY[language] ?? COVER_COPY.en;

  function playSoftWelcomeChime(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume().catch(() => {});
      }

      const masterGain = ctx.createGain();
      masterGain.gain.value = muted ? 0 : 1;
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = ctx.currentTime + idx * 0.11;
        noteGain.gain.setValueAtTime(0.001, start);
        noteGain.gain.exponentialRampToValueAtTime(0.06, start + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
        osc.connect(noteGain);
        noteGain.connect(masterGain);
        osc.start(start);
        osc.stop(start + 0.46);
      });
    } catch {
      // Audio playback is optional and fails gracefully in locked-down WebViews.
    }
  }

  function handleToggleMute() {
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(nextMuted ? 0 : 1, audioCtxRef.current.currentTime);
    }
  }

  function handleOpen() {
    setOpened(true);
    if (!muted) {
      playSoftWelcomeChime();
    }
    onOpened?.();
  }

  return (
    <div className="relative flex min-h-[520px] w-full flex-col justify-between overflow-hidden rounded-[28px] bg-white text-[#2B1B2E]">
      {watermarked ? (
        <div
          aria-hidden="true"
          className="pointer-events-none flex justify-center bg-[#FFE8EF]/80 py-1 text-[10px] font-bold tracking-widest text-[#E11D63]"
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      <div className="relative z-20 flex items-center justify-between px-4 pt-3">
        <button
          type="button"
          onClick={handleToggleMute}
          className="inline-flex min-h-[44px] items-center rounded-full bg-white/95 px-3 text-xs font-medium text-[#2B1B2E] shadow-sm ring-1 ring-black/10 transition hover:bg-[#FFF5F8]"
          aria-pressed={muted}
        >
          {muted ? copy.muteOn : copy.muteOff}
        </button>

        {opened ? (
          <button
            type="button"
            onClick={() => setOpened(false)}
            className="inline-flex min-h-[44px] items-center rounded-full bg-white/95 px-3 text-xs font-medium text-[#2B1B2E] shadow-sm ring-1 ring-black/10 transition hover:bg-[#FFF5F8]"
          >
            {copy.replay}
          </button>
        ) : null}
      </div>

      {!opened ? (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-8 text-center transition-all duration-500 motion-reduce:transition-none">
          <div
            className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl shadow-md"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 48 48" className="h-10 w-10 text-white" fill="none">
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

          <h2 className="mt-4 max-w-full break-words font-heading text-2xl font-bold leading-snug text-[#2B1B2E]">
            {recipientName}
          </h2>
          <p className="mt-1 max-w-full break-words text-sm text-[#2B1B2E]/70">
            {copy.fromLabel} <span className="font-semibold text-[#2B1B2E]">{senderName}</span>
          </p>

          <button
            type="button"
            onClick={handleOpen}
            className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-full px-7 py-3 text-sm font-bold text-white shadow-md transition hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none"
            style={{ backgroundColor: primaryColor }}
          >
            {copy.tapButton}
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between px-4 pb-4 pt-2 animate-[fadeIn_320ms_ease-out] motion-reduce:animate-none">
          {children}
        </div>
      )}
    </div>
  );
}
