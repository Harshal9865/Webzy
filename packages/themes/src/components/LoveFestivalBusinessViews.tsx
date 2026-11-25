'use client';

import React, { useId, useState } from 'react';
import { pickLocalizedText } from '@webzy/core';
import type { ThemeViewProps } from './CelebrationViews';

export function WillYouView({ data, language }: ThemeViewProps) {
  const [accepted, setAccepted] = useState(false);
  const [nudgeCount, setNudgeCount] = useState(0);

  const nudges = [
    language === 'en' ? 'Are you sure? Chai is on me!' : 'Soch lo! Coffee meri taraf se hogi!',
    language === 'en' ? 'Plus favorite pastry & sunset walk!' : 'Samosa + adrak wali chai bhi pakki!',
    language === 'en' ? 'Button is shrinking... just tap Yes!' : 'Ab toh haan bol do please!',
  ];

  if (accepted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-[#FFF1F2] p-5 text-center animate-fade-in">
        <span
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE4E8] text-[#E11D63] shadow-sm animate-pop-bounce"
          aria-hidden="true"
        >
          <svg className="h-7 w-7 animate-float" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </span>
        <h3 className="mt-3 font-heading text-xl font-bold text-[#E11D63]">
          {language === 'hi'
            ? `धन्यवाद, ${data.receiverName}!`
            : language === 'en'
              ? `Yay, ${data.receiverName}!`
              : `Yay! Thank you, ${data.receiverName}!`}
        </h3>
        <p className="mt-2 text-sm text-[#2B1B2E]/85">
          {language === 'hi'
            ? `${data.senderName} का दिन आज बन गया।`
            : `${data.senderName} just smiled from ear to ear.`}
        </p>
        <button
          type="button"
          onClick={() => {
            setAccepted(false);
            setNudgeCount(0);
          }}
          className="mt-5 rounded-full border border-[#E11D63]/30 bg-white px-4 py-1.5 text-xs font-bold text-[#E11D63] transition hover:bg-[#FFF5F8]"
        >
          {language === 'en' ? 'Replay Question' : 'Dobara Puchho'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col justify-between gap-4 py-2 text-center animate-fade-in">
      <div>
        <h3 className="font-heading text-xl font-bold text-[#E11D63]">{pickLocalizedText(data.headline, language)}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#2B1B2E]/85">{pickLocalizedText(data.message, language)}</p>
      </div>

      <div className="rounded-2xl bg-[#FFF5F8] p-4 border border-[#FFE8EF]">
        <p key={nudgeCount} className="text-xs font-semibold text-[#E11D63] animate-fade-in">
          {nudgeCount > 0
            ? nudges[(nudgeCount - 1) % nudges.length]
            : language === 'hi'
              ? 'आपका जवाब?'
              : 'Chalein saath?'}
        </p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setAccepted(true)}
            style={{ transform: `scale(${Math.min(1.18, 1 + nudgeCount * 0.05)})` }}
            className="min-h-[44px] rounded-full bg-[#E11D63] px-5 py-2 text-sm font-bold text-white shadow-md transition-all duration-300 hover:brightness-105 active:scale-95"
          >
            {language === 'hi' ? 'हाँ बिल्कुल!' : 'Yes!'}
          </button>
          <button
            type="button"
            onClick={() => setNudgeCount((c) => c + 1)}
            style={{ transform: `scale(${Math.max(0.84, 1 - nudgeCount * 0.04)})` }}
            className="min-h-[44px] rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-semibold text-[#2B1B2E] transition-all duration-300 hover:bg-zinc-50 active:scale-90"
          >
            {language === 'en' ? 'Maybe later' : 'Sochna padega'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MaanJaoView({ data, language }: ThemeViewProps) {
  const [moodScore, setMoodScore] = useState(50);
  const [selectedTreat, setSelectedTreat] = useState<string>('Chai + Samosa');
  const [forgiven, setForgiven] = useState(false);
  const meterId = useId();
  const treats = ['Chai + Samosa', 'Ice Cream', 'Long Drive'];

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 rounded-2xl bg-[#FFF5F8] p-4 text-center animate-fade-in">
      <div>
        <h3 className="font-heading text-xl font-bold text-[#E11D63]">{pickLocalizedText(data.headline, language)}</h3>
        <p className="mt-2 text-sm text-[#2B1B2E]/85">{pickLocalizedText(data.message, language)}</p>
      </div>

      <div className="rounded-2xl bg-white p-3.5 shadow-sm border border-[#FFE8EF]">
        <div className="mb-2.5 flex flex-wrap justify-center gap-1.5">
          {treats.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setSelectedTreat(t);
                setMoodScore((prev) => Math.min(100, Math.max(prev, 75)));
              }}
              className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold transition ${
                selectedTreat === t
                  ? 'bg-[#E11D63] text-white shadow-xs'
                  : 'border border-[#FFE8EF] bg-[#FFF5F8] text-[#2B1B2E]/75 hover:border-[#E11D63]/40'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <label htmlFor={meterId} className="block text-xs font-bold text-[#E11D63]">
          {language === 'en' ? `Forgiveness meter: ${moodScore}%` : `Smile meter: ${moodScore}%`}
        </label>
        <input
          id={meterId}
          type="range"
          min={0}
          max={100}
          value={moodScore}
          onChange={(e) => setMoodScore(Number(e.target.value))}
          className="mt-2 w-full accent-[#E11D63]"
        />
        <p className="mt-2 text-xs font-semibold text-[#2B1B2E]">
          {forgiven
            ? `Forgiven! (${selectedTreat} locked in!)`
            : moodScore >= 80
              ? `Deal done! ${selectedTreat} pakki.`
              : moodScore >= 40
                ? `Pick a treat & slide to 100%!`
                : 'Thoda aur right slide karo...'}
        </p>

        {moodScore >= 80 ? (
          <button
            type="button"
            onClick={() => setForgiven((f) => !f)}
            className="mt-2.5 min-h-[38px] rounded-full bg-[#E11D63] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95 animate-pop-bounce"
          >
            {forgiven ? 'Reset Smile' : `Accept ${selectedTreat} & Forgive`}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function OurYearView({ data, language }: ThemeViewProps) {
  const highlights = data.highlights ?? [];
  const [slideIdx, setSlideIdx] = useState(0);
  const current = highlights[slideIdx];

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 rounded-2xl bg-[#F5F3FF] p-4 animate-fade-in">
      <div className="flex gap-1.5">
        {highlights.map((item, idx) => (
          <button
            key={item.title.en}
            type="button"
            aria-label={`Jump to chapter ${idx + 1}`}
            onClick={() => setSlideIdx(idx)}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              idx <= slideIdx ? 'bg-violet-600' : 'bg-violet-200 hover:bg-violet-300'
            }`}
          />
        ))}
      </div>

      <div className="text-center">
        <h3 className="font-heading text-xl font-bold text-violet-900">{pickLocalizedText(data.headline, language)}</h3>
        <p className="mt-1.5 text-xs text-[#2B1B2E]/80">{pickLocalizedText(data.message, language)}</p>
      </div>

      {current ? (
        <div key={slideIdx} className="rounded-2xl bg-white p-4 text-center shadow-sm animate-fade-in">
          <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
            {pickLocalizedText(current.title, language)}
          </p>
          <p className="mt-1.5 text-sm font-medium text-[#2B1B2E]">{pickLocalizedText(current.detail, language)}</p>
        </div>
      ) : null}

      <div className="flex justify-between gap-2">
        <button
          type="button"
          onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
          disabled={slideIdx === 0}
          className="min-h-[44px] flex-1 rounded-xl bg-white text-xs font-semibold text-violet-900 transition hover:bg-violet-50 disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setSlideIdx((i) => Math.min(Math.max(0, highlights.length - 1), i + 1))}
          disabled={slideIdx >= highlights.length - 1}
          className="min-h-[44px] flex-1 rounded-xl bg-violet-700 text-xs font-semibold text-white transition hover:bg-violet-800 disabled:opacity-40"
        >
          Next ({slideIdx + 1}/{highlights.length || 1})
        </button>
      </div>
    </div>
  );
}

export function HarvestGreetingView({ data, language }: ThemeViewProps) {
  const [kiteCount, setKiteCount] = useState(1);

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 rounded-2xl bg-[#FFFBEB] p-4 text-center animate-fade-in">
      <div>
        <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          {data.relation?.toUpperCase() || 'FESTIVAL'}
        </span>
        <h3 className="mt-2 font-heading text-xl font-bold text-amber-900">
          {pickLocalizedText(data.headline, language)}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#2B1B2E]/85">{pickLocalizedText(data.message, language)}</p>
      </div>

      <div className="rounded-2xl bg-white p-3.5 shadow-sm border border-amber-100">
        <div className="flex min-h-[48px] flex-wrap items-center justify-center gap-2">
          {Array.from({ length: Math.min(kiteCount, 6) }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setKiteCount((k) => (k >= 6 ? 1 : k + 1))}
              aria-label={`Festival kite ${idx + 1}`}
              style={{ animationDelay: `${idx * 160}ms` }}
              className="inline-flex text-amber-600 animate-kite-sway transition-transform hover:scale-125"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M12 2L20 10L12 18L4 10L12 2Z" fill="#F59E0B" fillOpacity="0.28" strokeLinejoin="round" />
                <path strokeLinecap="round" d="M12 2v16M4 10h16M12 18c0 2 1.5 3 3 4" />
              </svg>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setKiteCount((k) => (k >= 6 ? 1 : k + 1))}
          className="mt-2 min-h-[44px] rounded-full bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-amber-700 active:scale-95"
        >
          {language === 'hinglish'
            ? `Aur patang udao! (${kiteCount}/6)`
            : `Send another kite! (${kiteCount}/6)`}
        </button>
      </div>
    </div>
  );
}

export function BusinessGreetingView({ data, language }: ThemeViewProps) {
  const [selectedIntent, setSelectedIntent] = useState<'Visit / Order' | 'Callback' | 'Pricing'>('Visit / Order');
  const [copiedOffer, setCopiedOffer] = useState(false);

  const cleanDigits = (data.whatsappPhone || '').replace(/\D/g, '');
  const validWa =
    /^(?:91)?[6-9]\d{9}$/.test(cleanDigits)
      ? cleanDigits.length === 10
        ? `91${cleanDigits}`
        : cleanDigits
      : null;
  const offerText = data.offerTag ? pickLocalizedText(data.offerTag, language) : '';
  const waHref = validWa
    ? `https://wa.me/${validWa}?text=${encodeURIComponent(
        `Hi ${data.receiverName}, I saw your offer (${offerText || 'Festival Greeting'}). Topic: ${selectedIntent}.`,
      )}`
    : null;

  async function handleCopyOffer() {
    if (!offerText) return;
    await navigator.clipboard?.writeText(offerText).catch(() => {});
    setCopiedOffer(true);
    setTimeout(() => setCopiedOffer(false), 1800);
  }

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 rounded-2xl bg-[#EFF6FF] p-4 text-center animate-fade-in">
      <div>
        {data.offerTag ? (
          <button
            type="button"
            onClick={handleCopyOffer}
            title="Click to copy offer text"
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 transition hover:bg-blue-200 active:scale-95"
          >
            <span>{copiedOffer ? 'Offer Copied' : offerText}</span>
          </button>
        ) : null}
        <h3 className="mt-2 break-words font-heading text-xl font-bold text-slate-900">
          {pickLocalizedText(data.headline, language)}
        </h3>
        <p className="mt-2 break-words text-sm leading-relaxed text-slate-700">
          {pickLocalizedText(data.message, language)}
        </p>
      </div>

      {waHref ? (
        <div className="space-y-2.5">
          <div className="flex flex-wrap justify-center gap-1.5">
            {(['Visit / Order', 'Callback', 'Pricing'] as const).map((intent) => (
              <button
                key={intent}
                type="button"
                onClick={() => setSelectedIntent(intent)}
                className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold transition ${
                  selectedIntent === intent
                    ? 'bg-blue-700 text-white'
                    : 'bg-white text-blue-900 border border-blue-200 hover:border-blue-400'
                }`}
              >
                {intent}
              </button>
            ))}
          </div>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98]"
          >
            {language === 'hi'
              ? `WhatsApp पर संपर्क करें (${selectedIntent})`
              : language === 'en'
                ? `Chat on WhatsApp · ${selectedIntent}`
                : `WhatsApp par message (${selectedIntent})`}
          </a>
        </div>
      ) : (
        <span className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-blue-100 px-4 text-xs font-semibold text-blue-900">
          {language === 'en' ? 'Thank you for visiting!' : 'Aapka dhanyavaad!'}
        </span>
      )}
    </div>
  );
}
