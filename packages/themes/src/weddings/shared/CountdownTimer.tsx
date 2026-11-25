'use client';

import React, { useEffect, useState } from 'react';
import { getLocaleCode, getWeddingUiCopy } from '../i18n';
import type { WeddingLanguage, WeddingThemeKey } from '../schema';
import { getWeddingThemePalette } from '../themePalettes';

interface CountdownTimerProps {
  targetDate: string;
  accentColor?: string;
  textColor?: string;
  language?: WeddingLanguage;
  theme?: WeddingThemeKey;
  compact?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

const HINDU_CHAPTER_EYEBROW: Record<WeddingLanguage, string> = {
  en: 'II · Shubh Muhurat',
  hi: 'II · शुभ मुहूर्त',
  gu: 'II · શુભ મુહૂર્ત',
  mr: 'II · शुभ मुहूर्त',
  pa: 'II · ਸ਼ੁਭ ਮੁਹੂਰਤ',
  bn: 'II · শুভ মুহূর্ত',
  ta: 'II · சுப முகூர்த்தம்',
  te: 'II · శుభ ముహూర్తం',
  kn: 'II · ಶುಭ ಮುಹೂರ್ತ',
};

const CHRISTIAN_CHAPTER_EYEBROW: Record<WeddingLanguage, string> = {
  en: 'II · The Wedding Day',
  hi: 'II · विवाह का शुभ दिन',
  gu: 'II · લગ્નનો શુભ દિવસ',
  mr: 'II · विवाह दिन',
  pa: 'II · ਵਿਆਹ ਦਾ ਦਿਨ',
  bn: 'II · বিবাহের দিন',
  ta: 'II · திருமண நாள்',
  te: 'II · వివాహ దినం',
  kn: 'II · ವಿವಾಹದ ದಿನ',
};

function calculateTimeRemaining(targetDate: string): TimeRemaining {
  const targetMs = Date.parse(targetDate);
  if (Number.isNaN(targetMs)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false };
  }
  const diff = targetMs - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false,
  };
}

function formatDateLine(iso: string, language: WeddingLanguage): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const locale = getLocaleCode(language);
    const datePart = d.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
    const timePart = d.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
    return `${datePart}  ·  ${timePart} IST`;
  } catch {
    return iso;
  }
}

function downloadMuhuratIcs(targetDate: string, title: string) {
  try {
    const startDate = new Date(targetDate);
    if (Number.isNaN(startDate.getTime())) return;
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const nowStamp = fmt(new Date());
    const uid = `webzy-wedding-${startDate.getTime()}@webzy.in`;
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Webzy Weddings//Wedding Invitation//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowStamp}`,
      `SUMMARY:${title}`,
      `DTSTART:${fmt(startDate)}`,
      `DTEND:${fmt(endDate)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'wedding-save-the-date.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch {
    // Graceful fallback
  }
}

export function CountdownTimer({
  targetDate,
  language = 'en',
  theme = 'emerald',
  compact = false,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    setTimeLeft(calculateTimeRemaining(targetDate));
    const timer = window.setInterval(() => {
      setTimeLeft(calculateTimeRemaining(targetDate));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [targetDate]);

  const copy = getWeddingUiCopy(language);
  const pal = getWeddingThemePalette(theme);
  const isChristian = pal.tradition === 'christian';
  const chapterEyebrow = isChristian
    ? (CHRISTIAN_CHAPTER_EYEBROW[language] ?? CHRISTIAN_CHAPTER_EYEBROW.en)
    : (HINDU_CHAPTER_EYEBROW[language] ?? HINDU_CHAPTER_EYEBROW.en);

  const bandBgClass = pal.bandBgClass;
  const bandStyle: React.CSSProperties = {
    backgroundImage: pal.countdownBandGradient,
  };

  const goldAccent = pal.goldAccent;
  const numeralColor = 'text-[#FCE5A2]';
  const unitLabelColor = 'text-[#EBD085]/80';
  const ribbonTextColor = 'text-[#FFF4DE]/90';

  const dateLine = formatDateLine(targetDate, language);
  const isPast = timeLeft?.isPast ?? false;
  const formatUnitValue = (val: number | undefined): string =>
    typeof val === 'number' ? String(val).padStart(2, '0') : '--';

  const units = [
    { label: copy.countdown.days, value: formatUnitValue(timeLeft?.days) },
    { label: copy.countdown.hours, value: formatUnitValue(timeLeft?.hours) },
    { label: copy.countdown.mins, value: formatUnitValue(timeLeft?.minutes) },
    { label: copy.countdown.secs, value: formatUnitValue(timeLeft?.seconds) },
  ];

  return (
    <section
      className={`relative w-full overflow-hidden border-y border-[#D4AF37]/45 ${bandBgClass} ${compact
          ? 'py-9 px-4'
          : 'py-14 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8'
        }`}
      style={bandStyle}
    >
      {/* Top & Bottom Inner Antique-Gold Double Hairlines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[6px] h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent 4%, ${goldAccent}66 50%, transparent 96%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[6px] h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent 4%, ${goldAccent}66 50%, transparent 96%)`,
        }}
      />

      {/* Quiet Central Architectural Diamond Filigree Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(${goldAccent} 0.75px, transparent 0.75px)`,
          backgroundSize: '26px 26px',
        }}
      />

      <div className={`relative z-10 mx-auto text-center ${compact ? 'max-w-md' : 'max-w-4xl'}`}>
        {/* Quiet Uppercase Gold Roman Chapter Eyebrow */}
        <div className="flex items-center justify-center gap-3">
          <span
            className="h-[1px] w-8 sm:w-14"
            style={{ background: `linear-gradient(90deg, transparent, ${goldAccent})` }}
            aria-hidden="true"
          />
          <span
            className={`font-royal-serif font-bold uppercase tracking-[0.3em] text-[#E9CA76] ${compact ? 'text-[9.5px]' : 'text-[10px] sm:text-[11px]'
              }`}
          >
            {chapterEyebrow}
          </span>
          <span
            className="h-[1px] w-8 sm:w-14"
            style={{ background: `linear-gradient(270deg, transparent, ${goldAccent})` }}
            aria-hidden="true"
          />
        </div>

        <p
          className={`font-royal-serif italic tracking-wide text-[#F6ECD5]/80 ${compact ? 'mt-2 text-xs mb-6' : 'mt-2.5 text-sm sm:text-base md:text-lg mb-8 md:mb-10'
            }`}
        >
          {isPast
            ? copy.countdown.celebrationBegun
            : isChristian && language === 'en'
              ? 'Counting Down To Our Vows'
              : copy.countdown.countingDown}
        </p>

        {/* Monumental Watchmaker 4-Column Serif Numerals Separated by Antique-Gold Hairlines */}
        <div className="mx-auto grid max-w-3xl grid-cols-4 items-stretch">
          {units.map((unit, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col items-center justify-center ${compact ? 'py-2 px-1' : 'py-2 sm:py-3 md:py-4 px-1.5 sm:px-4'
                }`}
            >
              {/* Hairline Antique-Gold Vertical Divider Between Columns */}
              {idx > 0 && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-[72%]"
                  style={{
                    background: `linear-gradient(180deg, transparent 0%, ${goldAccent}88 50%, transparent 100%)`,
                  }}
                />
              )}

              <span
                className={`font-royal-serif font-semibold tracking-tight tabular-nums leading-none ${numeralColor} ${compact
                    ? 'text-[28px]'
                    : 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'
                  }`}
                style={{ textShadow: '0 2px 22px rgba(212, 175, 55, 0.28)' }}
              >
                {unit.value}
              </span>

              <span
                className={`font-royal-serif font-semibold uppercase tracking-[0.22em] ${unitLabelColor} ${compact
                    ? 'text-[8.5px] mt-2.5'
                    : 'text-[9px] sm:text-[10px] md:text-[11px] mt-2.5 md:mt-3.5'
                  }`}
              >
                {unit.label}
              </span>
            </div>
          ))}
        </div>

        {/* Engraved Single-Line IST Muhurat Date & Time Ribbon + Save to Calendar (.ics) */}
        <div className={`flex flex-col items-center gap-3.5 ${compact ? 'mt-7' : 'mt-9 md:mt-11'}`}>
          <div className="inline-flex items-center justify-center gap-2.5 sm:gap-3.5 border-y border-[#D4AF37]/30 px-4 sm:px-7 py-2 sm:py-2.5">
            <span
              className="h-1.5 w-1.5 rotate-45 shrink-0"
              style={{ backgroundColor: goldAccent }}
              aria-hidden="true"
            />
            <p
              className={`font-royal-serif font-medium tracking-[0.08em] ${ribbonTextColor} ${compact ? 'text-[11px]' : 'text-xs sm:text-sm md:text-[15px]'
                }`}
            >
              {dateLine}
            </p>
            <span
              className="h-1.5 w-1.5 rotate-45 shrink-0"
              style={{ backgroundColor: goldAccent }}
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            onClick={() => downloadMuhuratIcs(targetDate, copy.countdown.saveTheDate)}
            className="btn-spring inline-flex min-h-[36px] items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-white/[0.06] px-4 py-1.5 font-royal-serif text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[#FCE5A2] hover:bg-[#D4AF37] hover:text-[#1A1206] transition"
          >
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{copy.countdown.saveTheDate} · {copy.footer.addToCalendar}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
