'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getLocaleCode, getWeddingUiCopy } from '../i18n';
import type { WeddingEventItem, WeddingLanguage, WeddingThemeKey } from '../schema';
import { getWeddingThemePalette } from '../themePalettes';
import { CeremonyIcon } from './Ornaments';
import { VarmalaDiyaDivider } from './WeddingArt';

interface EventTimelineProps {
  events: WeddingEventItem[];
  language?: WeddingLanguage;
  theme?: WeddingThemeKey;
  compact?: boolean;
}

function getDayKey(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return iso;
  }
}

function formatDayTabLabel(iso: string, language: WeddingLanguage): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(getLocaleCode(language), {
      day: 'numeric',
      month: 'short',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return iso;
  }
}

function formatEventDateTime(iso: string, language: WeddingLanguage): { dateStr: string; timeStr: string } {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { dateStr: iso, timeStr: '' };
    const locale = getLocaleCode(language);
    const dateStr = d.toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'Asia/Kolkata',
    });
    const timeStr = d.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
    return { dateStr, timeStr };
  } catch {
    return { dateStr: iso, timeStr: '' };
  }
}

function downloadEventIcs(ev: WeddingEventItem) {
  try {
    const start = new Date(ev.dateTime);
    if (Number.isNaN(start.getTime())) return;
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Webzy Weddings//Event//EN',
      'BEGIN:VEVENT',
      `UID:webzy-ev-${ev.id || start.getTime()}@webzy.in`,
      `DTSTAMP:${fmt(new Date())}`,
      `SUMMARY:${ev.title} (${ev.venueName})`,
      `LOCATION:${ev.venueName}${ev.address ? `, ${ev.address}` : ''}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(ev.title || 'ceremony').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch {
    // Graceful fallback
  }
}

export function EventTimeline({
  events,
  language = 'en',
  theme = 'emerald',
  compact = false,
}: EventTimelineProps) {
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [bannerError, setBannerError] = useState(false);
  const [activeSwatchKey, setActiveSwatchKey] = useState<string | null>(null);
  const copy = getWeddingUiCopy(language);
  const pal = getWeddingThemePalette(theme);
  const ceremonyArtUrl = pal.ceremonyArtUrl;

  useEffect(() => {
    setBannerError(false);
  }, [ceremonyArtUrl]);

  const dayGroups = useMemo(() => {
    const seen = new Map<string, { key: string; label: string }>();
    events.forEach((ev) => {
      const key = getDayKey(ev.dateTime);
      if (!seen.has(key)) {
        seen.set(key, { key, label: formatDayTabLabel(ev.dateTime, language) });
      }
    });
    return Array.from(seen.values());
  }, [events, language]);

  if (!events || events.length === 0) return null;

  const activeDay =
    selectedDay === 'all' || dayGroups.some((day) => day.key === selectedDay)
      ? selectedDay
      : 'all';

  const filteredEvents =
    activeDay === 'all' ? events : events.filter((ev) => getDayKey(ev.dateTime) === activeDay);

  const goldStroke = pal.goldStroke;
  const goldInk = pal.goldInk;
  const cardBg = pal.paperSurface;
  const cardBorder = `${pal.outerBorder} hover:border-[#C5A059]/85`;
  const innerHairline = pal.innerRuleBorder;
  const medallionBg = pal.medallionBg;
  const titleAccent = pal.accentText;
  const bodyInk = pal.bodyInk;
  const bodyInkSoft = pal.bodyInkSoft;
  const bodyInkSubtle = pal.bodyInkSubtle;
  const bodyInkMuted = pal.bodyInkMuted;
  const activeTabText = pal.accentText;
  const mapBtnStyle = pal.mapBtnStyle;
  const swatchRingOffset = 'ring-offset-[#FFFDF9]';

  const eventGridClass = compact
    ? 'grid grid-cols-1 gap-4'
    : filteredEvents.length === 1
      ? 'grid grid-cols-1 max-w-xl mx-auto gap-6'
      : filteredEvents.length === 2
        ? 'grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6 lg:gap-7'
        : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-7';

  return (
    <section
      id="wedding-events"
      className={
        compact
          ? 'w-full py-8 px-3.5 scroll-mt-16'
          : 'w-full py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20'
      }
    >
      <div className={compact ? 'max-w-md mx-auto' : 'max-w-6xl mx-auto'}>
        {/* Roman Chapter Header */}
        <div className={compact ? 'text-center mb-7' : 'text-center mb-9 md:mb-12'}>
          <div className="flex items-center justify-center gap-3">
            <span
              className="h-[1px] w-7 sm:w-12"
              style={{ background: `linear-gradient(90deg, transparent, ${goldStroke})` }}
              aria-hidden="true"
            />
            <span
              className={`font-royal-serif font-bold uppercase tracking-[0.28em] ${goldInk} ${
                compact ? 'text-[9.5px]' : 'text-[10.5px] sm:text-[11px]'
              }`}
            >
              III · {copy.events.eyebrow}
            </span>
            <span
              className="h-[1px] w-7 sm:w-12"
              style={{ background: `linear-gradient(270deg, transparent, ${goldStroke})` }}
              aria-hidden="true"
            />
          </div>

          <h2
            className={`font-royal-script mt-1.5 ${titleAccent} ${
              compact ? 'text-3xl' : 'text-3xl sm:text-4xl md:text-5xl lg:text-[54px]'
            }`}
          >
            {copy.events.heading}
          </h2>
          <VarmalaDiyaDivider theme={theme} className="mt-3" />
        </div>

        {/* Framed Ceremonial Architecture Panorama */}
        {!bannerError && (
          <div
            className={`mx-auto overflow-hidden rounded-2xl border p-1.5 shadow-sm ${
              pal.ceremonyBannerDark
                ? 'border-[#D4AF37]/45 bg-[#1B1218]'
                : 'border-[#C5A059]/45 bg-[#FFFDF9]'
            } ${compact ? 'mb-6 max-w-md' : 'mb-9 md:mb-11 max-w-3xl'}`}
          >
            <div
              className={`relative aspect-[16/9] w-full overflow-hidden rounded-xl border ${innerHairline}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={ceremonyArtUrl}
                src={ceremonyArtUrl}
                alt=""
                aria-hidden="true"
                onError={() => setBannerError(true)}
                className={`h-full w-full object-cover ${
                  theme === 'temple-gold' || theme === 'rose-ivory'
                    ? 'object-bottom scale-[1.04]'
                    : 'object-center'
                } ${
                  theme === 'royal-red' ? 'scale-[1.06]' : ''
                }`}
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: pal.ceremonyBannerDark
                    ? 'linear-gradient(180deg, rgba(20,10,14,0.08) 0%, rgba(20,10,14,0.2) 100%)'
                    : 'linear-gradient(180deg, rgba(255,253,249,0.06) 0%, rgba(27,49,33,0.1) 100%)',
                }}
              />
            </div>
          </div>
        )}

        {/* Printed-Program Day Filter Tabs with Classic Antique-Gold Underline Indicator */}
        {dayGroups.length > 1 && (
          <div
            className={
              compact
                ? 'mb-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-b border-[#C5A059]/25'
                : 'mb-9 md:mb-11 flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-2 border-b border-[#C5A059]/25'
            }
            role="tablist"
            aria-label={copy.events.eyebrow}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeDay === 'all'}
              onClick={() => setSelectedDay('all')}
              className={`relative pb-3 px-1 font-royal-serif uppercase tracking-[0.18em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded-sm ${
                compact ? 'text-[10.5px]' : 'text-[11px] sm:text-xs'
              } ${
                activeDay === 'all'
                  ? `font-bold ${activeTabText}`
                  : 'font-semibold text-[#2B1B2E]/55 hover:text-[#2B1B2E]/90'
              }`}
            >
              {copy.events.allDays}
              {activeDay === 'all' && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 -bottom-[1px] flex flex-col items-center"
                >
                  <span className="h-[2px] w-full" style={{ backgroundColor: goldStroke }} />
                  <span
                    className="-mt-[4px] h-1.5 w-1.5 rotate-45"
                    style={{ backgroundColor: goldStroke }}
                  />
                </span>
              )}
            </button>

            {dayGroups.map((day, index) => {
              const isSelected = activeDay === day.key;
              return (
                <button
                  key={day.key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedDay(day.key)}
                  className={`relative pb-3 px-1 font-royal-serif uppercase tracking-[0.16em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded-sm ${
                    compact ? 'text-[10.5px]' : 'text-[11px] sm:text-xs'
                  } ${
                    isSelected
                      ? `font-bold ${activeTabText}`
                      : 'font-semibold text-[#2B1B2E]/55 hover:text-[#2B1B2E]/90'
                  }`}
                >
                  {copy.events.dayPrefix} {index + 1} · {day.label}
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 -bottom-[1px] flex flex-col items-center"
                    >
                      <span className="h-[2px] w-full" style={{ backgroundColor: goldStroke }} />
                      <span
                        className="-mt-[4px] h-1.5 w-1.5 rotate-45"
                        style={{ backgroundColor: goldStroke }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Royal Letterpress Invitation Insert Grid */}
        <div className={eventGridClass}>
          {filteredEvents.map((event, idx) => {
            const fullIndex = events.indexOf(event);
            const displayIndex = String((fullIndex >= 0 ? fullIndex : idx) + 1).padStart(2, '0');
            const { dateStr, timeStr } = formatEventDateTime(event.dateTime, language);
            const hasAttire = Boolean(
              event.dressCode || (event.eventDressPalette && event.eventDressPalette.length > 0)
            );

            return (
              <article
                key={event.id || idx}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-[18px] border transition-all duration-300 ${cardBg} ${cardBorder} shadow-[0_12px_32px_-22px_rgba(32,26,18,0.22)] hover:shadow-[0_18px_40px_-22px_rgba(32,26,18,0.28)] ${
                  compact ? 'p-5' : 'p-6 sm:p-7'
                }`}
              >
                {/* Faint Inset Inner Hairline Border (Letterpress Plate Impression) */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-[7px] rounded-[12px] border ${innerHairline}`}
                />

                {/* Top Content Block */}
                <div className="relative z-10">
                  {/* Top Editorial Row: Index Numeral + Gilded Crest Medallion + IST Date/Time */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-royal-serif text-xs font-bold tracking-[0.22em] ${goldInk}`}
                      >
                        {displayIndex}
                      </span>
                      <span
                        className="h-5 w-[1px] opacity-35"
                        style={{ backgroundColor: goldStroke }}
                        aria-hidden="true"
                      />
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ring-2 ring-[#C5A059]/20 ${medallionBg}`}
                      >
                        <CeremonyIcon iconKey={event.iconKey} className="h-[18px] w-[18px]" color="#F6DD8C" />
                      </div>
                    </div>

                    <div className="text-right pt-0.5">
                      <p className={`font-royal-serif text-[11px] font-bold uppercase tracking-[0.12em] ${goldInk}`}>
                        {dateStr}
                      </p>
                      {timeStr ? (
                        <p className={`font-royal-serif text-[11px] font-semibold mt-0.5 ${bodyInkSubtle}`}>
                          {timeStr} IST
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Crisp Serif Ceremony Title */}
                  <h3
                    className={`font-royal-serif font-bold leading-snug mt-5 ${titleAccent} ${
                      compact ? 'text-lg' : 'text-xl'
                    }`}
                  >
                    {event.title}
                  </h3>

                  {/* Fine Tapered Gold Rule */}
                  <div
                    aria-hidden="true"
                    className="mt-3.5 h-[1px] w-14"
                    style={{ background: `linear-gradient(90deg, ${goldStroke}, transparent)` }}
                  />

                  {/* Venue Name & Address */}
                  <div className="mt-3.5">
                    <p className={`font-royal-serif text-[13.5px] font-semibold leading-snug ${bodyInk}`}>
                      {event.venueName}
                    </p>
                    {event.address ? (
                      <p className={`text-[12px] mt-1 leading-relaxed ${bodyInkMuted}`}>
                        {event.address}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Bottom Attire Silk Swatches & Dignified Maps CTA Pinned Cleanly */}
                {(hasAttire || event.mapUrl) && (
                  <div className="relative z-10 mt-5 pt-4 border-t border-[#C5A059]/25 flex flex-col gap-3.5">
                    {hasAttire && (
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        {event.dressCode ? (
                          <p className={`text-[11.5px] leading-snug ${bodyInkSoft}`}>
                            <span
                              className={`font-royal-serif font-bold uppercase tracking-[0.16em] mr-1.5 text-[9.5px] ${goldInk}`}
                            >
                              {copy.events.dressCodeLabel}:
                            </span>
                            <span className="font-medium">{event.dressCode}</span>
                          </p>
                        ) : null}

                        {/* Tactile Woven-Silk Dress Code Palette Swatches */}
                        {event.eventDressPalette && event.eventDressPalette.length > 0 && (
                          <span
                            className="inline-flex flex-wrap items-center gap-0.5 py-0.5"
                            aria-label={copy.events.paletteLabel}
                          >
                            {event.eventDressPalette.map((hex, swatchIdx) => {
                              const sKey = `${event.id || idx}-${swatchIdx}`;
                              const picked = activeSwatchKey === sKey;
                              return (
                                <button
                                  key={`${hex}-${swatchIdx}`}
                                  type="button"
                                  title={`Tap to inspect swatch ${hex}`}
                                  aria-label={`Inspect dress code color ${hex}`}
                                  onClick={() => setActiveSwatchKey(picked ? null : sKey)}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5 active:scale-95"
                                >
                                  <span
                                    className={`block h-4 w-4 rounded-full ring-1 ring-[#C5A059]/75 ring-offset-2 shadow-sm transition-transform ${
                                      picked ? 'scale-125 ring-[#C5A059] ring-2' : ''
                                    } ${swatchRingOffset}`}
                                    style={{
                                      backgroundColor: hex,
                                      backgroundImage:
                                        'radial-gradient(circle at 30% 26%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.08) 46%, rgba(0, 0, 0, 0.12) 100%)',
                                    }}
                                  />
                                </button>
                              );
                            })}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      {event.mapUrl ? (
                        <a
                          href={event.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`btn-spring inline-flex flex-1 min-h-[44px] items-center justify-center gap-2 rounded-xl border px-3.5 py-2 font-royal-serif text-[11px] font-bold uppercase tracking-[0.16em] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${mapBtnStyle}`}
                        >
                          <span>{copy.events.openInMaps}</span>
                          <svg
                            className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.9}
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
                          </svg>
                        </a>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => downloadEventIcs(event)}
                        title="Save ceremony to calendar"
                        className="btn-spring inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#C5A059]/45 bg-white/80 px-3 py-2 font-royal-serif text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#7A5E20] hover:border-[#C5A059] hover:bg-white transition active:scale-95"
                      >
                        <span>+ Cal</span>
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
