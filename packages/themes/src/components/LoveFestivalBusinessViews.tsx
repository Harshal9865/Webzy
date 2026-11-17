'use client';

import React, { useState } from 'react';
import type { ThemeViewProps } from './CelebrationViews';

export function WillYouView({ data, language }: ThemeViewProps) {
  const [accepted, setAccepted] = useState(false);
  const [nudgeCount, setNudgeCount] = useState(0);

  if (accepted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-[#FFF1F2] p-5 text-center">
        <span className="text-3xl" aria-hidden="true">
          💖
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
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col justify-between gap-4 py-2 text-center">
      <div>
        <h3 className="font-heading text-xl font-bold text-[#E11D63]">{data.headline[language]}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#2B1B2E]/85">{data.message[language]}</p>
      </div>

      <div className="rounded-2xl bg-[#FFF5F8] p-4">
        <p className="text-xs font-semibold text-[#E11D63]">
          {nudgeCount > 0
            ? language === 'en'
              ? 'Are you sure? Chai is on me!'
              : 'Soch lo! Coffee meri taraf se hogi!'
            : language === 'hi'
              ? 'आपका जवाब?'
              : 'Chalein saath?'}
        </p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setAccepted(true)}
            className="min-h-[44px] rounded-full bg-[#E11D63] px-5 py-2 text-sm font-bold text-white shadow-sm"
          >
            {language === 'hi' ? 'हाँ बिल्कुल!' : 'Yes!'}
          </button>
          <button
            type="button"
            onClick={() => setNudgeCount((c) => c + 1)}
            className="min-h-[44px] rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-semibold text-[#2B1B2E]"
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

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 rounded-2xl bg-[#FFF5F8] p-4 text-center">
      <div>
        <h3 className="font-heading text-xl font-bold text-[#E11D63]">{data.headline[language]}</h3>
        <p className="mt-2 text-sm text-[#2B1B2E]/85">{data.message[language]}</p>
      </div>

      <div className="rounded-2xl bg-white p-3.5 shadow-sm">
        <label htmlFor="maan-jao-meter" className="block text-xs font-bold text-[#E11D63]">
          {language === 'en' ? `Forgiveness meter: ${moodScore}%` : `Smile meter: ${moodScore}%`}
        </label>
        <input
          id="maan-jao-meter"
          type="range"
          min={0}
          max={100}
          value={moodScore}
          onChange={(e) => setMoodScore(Number(e.target.value))}
          className="mt-2 w-full accent-[#E11D63]"
        />
        <p className="mt-2 text-xs font-semibold text-[#2B1B2E]">
          {moodScore >= 80
            ? '🍫 Deal done! Treat pakki.'
            : moodScore >= 40
              ? '☕ Slide to 100% for extra coffee!'
              : '🥺 Thoda aur right slide karo...'}
        </p>
      </div>
    </div>
  );
}

export function OurYearView({ data, language }: ThemeViewProps) {
  const highlights = data.highlights ?? [];
  const [slideIdx, setSlideIdx] = useState(0);
  const current = highlights[slideIdx];

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 rounded-2xl bg-[#F5F3FF] p-4">
      <div className="flex gap-1.5">
        {highlights.map((item, idx) => (
          <div
            key={item.title.en}
            className={`h-1.5 flex-1 rounded-full ${idx <= slideIdx ? 'bg-violet-600' : 'bg-violet-200'}`}
          />
        ))}
      </div>

      <div className="text-center">
        <h3 className="font-heading text-xl font-bold text-violet-900">{data.headline[language]}</h3>
        <p className="mt-1.5 text-xs text-[#2B1B2E]/80">{data.message[language]}</p>
      </div>

      {current ? (
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
            {current.title[language]}
          </p>
          <p className="mt-1.5 text-sm font-medium text-[#2B1B2E]">{current.detail[language]}</p>
        </div>
      ) : null}

      <div className="flex justify-between gap-2">
        <button
          type="button"
          onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
          disabled={slideIdx === 0}
          className="min-h-[44px] flex-1 rounded-xl bg-white text-xs font-semibold text-violet-900 disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setSlideIdx((i) => Math.min(Math.max(0, highlights.length - 1), i + 1))}
          disabled={slideIdx >= highlights.length - 1}
          className="min-h-[44px] flex-1 rounded-xl bg-violet-700 text-xs font-semibold text-white disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function HarvestGreetingView({ data, language }: ThemeViewProps) {
  const [kiteCount, setKiteCount] = useState(1);

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 rounded-2xl bg-[#FFFBEB] p-4 text-center">
      <div>
        <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          {data.relation?.toUpperCase() || 'FESTIVAL'}
        </span>
        <h3 className="mt-2 font-heading text-xl font-bold text-amber-900">
          {data.headline[language]}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#2B1B2E]/85">{data.message[language]}</p>
      </div>

      <div className="rounded-2xl bg-white p-3.5 shadow-sm">
        <div className="flex min-h-[44px] flex-wrap items-center justify-center gap-2 text-2xl">
          {Array.from({ length: Math.min(kiteCount, 6) }).map((_, idx) => (
            <span key={idx} aria-hidden="true">
              🪁
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setKiteCount((k) => (k >= 6 ? 1 : k + 1))}
          className="mt-2 min-h-[44px] rounded-full bg-amber-600 px-5 py-2 text-xs font-bold text-white"
        >
          {language === 'en' ? 'Send another kite!' : 'Aur patang udao!'}
        </button>
      </div>
    </div>
  );
}

export function BusinessGreetingView({ data, language }: ThemeViewProps) {
  const cleanDigits = (data.whatsappPhone || '').replace(/\D/g, '');
  const validWa =
    /^(?:91)?[6-9]\d{9}$/.test(cleanDigits)
      ? cleanDigits.length === 10
        ? `91${cleanDigits}`
        : cleanDigits
      : null;
  const waHref = validWa
    ? `https://wa.me/${validWa}?text=${encodeURIComponent(`Hi ${data.receiverName}`)}`
    : null;

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 rounded-2xl bg-[#EFF6FF] p-4 text-center">
      <div>
        {data.offerTag ? (
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            {data.offerTag[language]}
          </span>
        ) : null}
        <h3 className="mt-2 break-words font-heading text-xl font-bold text-slate-900">
          {data.headline[language]}
        </h3>
        <p className="mt-2 break-words text-sm leading-relaxed text-slate-700">
          {data.message[language]}
        </p>
      </div>

      {waHref ? (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
        >
          {language === 'hi'
            ? 'WhatsApp पर संपर्क करें'
            : language === 'en'
              ? 'Chat on WhatsApp'
              : 'WhatsApp par message karo'}
        </a>
      ) : (
        <span className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-blue-100 px-4 text-xs font-semibold text-blue-900">
          {language === 'en' ? 'Thank you for visiting!' : 'Aapka dhanyavaad!'}
        </span>
      )}
    </div>
  );
}
