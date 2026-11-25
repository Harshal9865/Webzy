'use client';

import React from 'react';
import { getWeddingUiCopy } from '../i18n';
import {
  WEDDING_LANGUAGE_OPTIONS,
  type WeddingInvitation,
  type WeddingLanguage,
  type WeddingThemeKey,
} from '../schema';
import { getWeddingThemePalette } from '../themePalettes';
import { RoyalFlourishDivider } from './Ornaments';

interface WeddingFooterProps {
  data: WeddingInvitation;
  language?: WeddingLanguage;
  onLanguageChange?: (lang: WeddingLanguage) => void;
  theme?: WeddingThemeKey;
  guestName?: string | null;
  compact?: boolean;
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function generateIcsCalendar(data: WeddingInvitation) {
  try {
    const startDate = new Date(data.weddingDate);
    if (Number.isNaN(startDate.getTime())) return;
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);

    const formatIcsTime = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const nowStamp = formatIcsTime(new Date());
    const uid = `${data.slug || 'wedding'}-${startDate.getTime()}@webzy.in`;

    const location = data.venueHighlight
      ? `${data.venueHighlight.name}, ${data.venueHighlight.city}`
      : `${data.events?.[0]?.venueName || 'Wedding Venue'}${data.events?.[0]?.address ? `, ${data.events[0].address}` : ''
      }`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Webzy Weddings//Wedding Invitation//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowStamp}`,
      `SUMMARY:${escapeIcsText(`Wedding: ${data.brideName} & ${data.groomName}`)}`,
      `DESCRIPTION:${escapeIcsText(data.personalMessage || 'Wedding Celebration')}`,
      `LOCATION:${escapeIcsText(location)}`,
      `DTSTART:${formatIcsTime(startDate)}`,
      `DTEND:${formatIcsTime(endDate)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${data.slug || 'wedding'}-invitation.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch {
    // Graceful fallback
  }
}

export function WeddingFooter({
  data,
  language,
  onLanguageChange,
  theme = 'emerald',
  compact = false,
}: WeddingFooterProps) {
  const activeLang = language ?? data.language ?? 'en';
  const copy = getWeddingUiCopy(activeLang);
  const pal = getWeddingThemePalette(theme);

  const footerBgClass = pal.footerBgClass;
  const footerRadialStyle = pal.footerRadialStyle;

  const brideInitial = data.brideName
    ? data.brideName.trim().charAt(0).toUpperCase()
    : pal.defaultInitials[0];
  const groomInitial = data.groomName
    ? data.groomName.trim().charAt(0).toUpperCase()
    : pal.defaultInitials[1];

  function handleShareWhatsApp() {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Join us in celebrating the wedding of ${data.brideName} & ${data.groomName}.\nView our interactive wedding invitation: ${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  const monogramSeal = (
    <div
      aria-hidden="true"
      className="relative flex h-16 w-16 md:h-[72px] md:w-[72px] shrink-0 items-center justify-center rounded-full border border-[#E5C158]/65 bg-black/25 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
    >
      <span className="pointer-events-none absolute inset-[5px] rounded-full border border-[#F5D67B]/35" />
      <span className="font-royal-serif text-base md:text-lg font-semibold tracking-[0.12em] text-[#FCE4A0]">
        {brideInitial}
        <span className="mx-0.5 font-royal-script text-sm md:text-base text-[#D4AF37]">&amp;</span>
        {groomInitial}
      </span>
    </div>
  );

  return (
    <footer
      className={`relative w-full text-center text-[#F7EFE0] border-t border-[#D4AF37]/45 ${footerBgClass} ${compact ? 'py-11 px-5' : 'py-14 md:py-16 px-5 sm:px-6 lg:px-8'
        }`}
      style={{ backgroundImage: footerRadialStyle }}
    >
      {/* Top Gilded Shimmer Hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-[1px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 5%, rgba(245, 214, 123, 0.75) 50%, transparent 95%)',
        }}
      />

      <div className={compact ? 'max-w-md mx-auto space-y-6' : 'max-w-5xl mx-auto'}>
        {compact ? (
          <>
            {/* Engraved Circular Monogram Seal & Couple Names */}
            <div className="flex flex-col items-center gap-3">
              {monogramSeal}
              <div>
                <p className="font-royal-script text-3xl leading-tight text-[#FFF4D2]">
                  {data.brideName} &amp; {data.groomName}
                </p>
                {data.hashtag ? (
                  <p className="font-royal-serif text-[11px] font-bold tracking-[0.22em] text-[#E5C158] mt-1">
                    {data.hashtag}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Action Buttons: Gold-Bordered Calendar & Emerald WhatsApp Share */}
            <div className="flex flex-col items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => generateIcsCalendar(data)}
                className="btn-spring flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[#E5C158]/60 bg-white/[0.04] px-5 py-2 font-royal-serif text-xs font-bold tracking-[0.14em] uppercase text-[#FFF4D6] hover:bg-[#E5C158] hover:text-[#1A1206] transition"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{copy.footer.addToCalendar}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="btn-spring flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[#4EA876]/45 bg-[#1F6B45] px-5 py-2 font-royal-serif text-xs font-bold tracking-[0.14em] uppercase text-[#FFFDF8] shadow-sm hover:bg-[#257E51] transition"
              >
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                </svg>
                <span>{copy.footer.shareWhatsApp}</span>
              </button>
            </div>

            {/* Clean Language Selector Button (Supports all 9 Indian Languages) */}
            {onLanguageChange && (
              <div className="pt-1 flex flex-col items-center gap-2">
                <label
                  htmlFor="wedding-footer-lang-compact"
                  className="font-royal-serif text-[10px] font-bold uppercase tracking-[0.24em] text-[#E5C158]/90"
                >
                  {copy.footer.languageLabel}
                </label>
                <div className="relative inline-flex items-center">
                  <select
                    id="wedding-footer-lang-compact"
                    value={activeLang}
                    onChange={(e) => onLanguageChange(e.target.value as WeddingLanguage)}
                    aria-label={copy.footer.languageLabel}
                    className="min-h-[44px] appearance-none rounded-full border border-[#E5C158]/55 bg-black/35 pl-4 pr-9 text-base font-bold text-[#FFF4D6] outline-none transition hover:border-[#E5C158] focus:border-[#E5C158] sm:text-xs"
                  >
                    {WEDDING_LANGUAGE_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code} className="bg-[#1A1317] text-[#FFF4D6]">
                        {opt.nativeLabel} ({opt.englishLabel})
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-[#E5C158]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}

            <RoyalFlourishDivider theme={theme} className="opacity-80" />

            {/* Atelier Colophon */}
            <div className="pt-1 text-[10.5px] text-[#F5EAD4]/55 space-y-1.5">
              <p className="font-royal-serif font-semibold uppercase tracking-[0.22em] text-[#E5C158]/85">
                {copy.footer.madeWithWebzy}
              </p>
              <p>
                {copy.footer.privacyNote} &middot;{' '}
                <a
                  href="/takedown"
                  className="underline decoration-[#E5C158]/40 underline-offset-2 hover:text-[#FFF4D2]"
                >
                  Report / Takedown
                </a>
              </p>
            </div>
          </>
        ) : (
          <>
            {/* 3-Zone Grand Colophon Bar on Desktop, Centered Stack on Mobile & Tablet */}
            <div className="flex flex-col items-center gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:text-left">
              {/* Zone 1: Engraved Circular Monogram Seal & Luminous Script Names */}
              <div className="flex flex-col items-center gap-3.5 lg:flex-row lg:items-center lg:gap-4">
                {monogramSeal}
                <div>
                  <p className="font-royal-script text-3xl md:text-4xl leading-tight text-[#FFF4D2]">
                    {data.brideName} &amp; {data.groomName}
                  </p>
                  {data.hashtag ? (
                    <p className="font-royal-serif text-xs font-bold tracking-[0.22em] text-[#E5C158] mt-1">
                      {data.hashtag}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Zone 2: Calendar (.ics) & Emerald WhatsApp Share */}
              <div className="flex w-full max-w-sm flex-col sm:w-auto sm:max-w-none sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => generateIcsCalendar(data)}
                  className="btn-spring flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[#E5C158]/60 bg-white/[0.04] px-5 py-2 font-royal-serif text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#FFF4D6] hover:bg-[#E5C158] hover:text-[#1A1206] transition"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="whitespace-nowrap">{copy.footer.addToCalendar}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="btn-spring flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[#4EA876]/45 bg-[#1F6B45] px-5 py-2 font-royal-serif text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#FFFDF8] shadow-sm hover:bg-[#257E51] transition"
                >
                  <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                  </svg>
                  <span className="whitespace-nowrap">{copy.footer.shareWhatsApp}</span>
                </button>
              </div>

              {/* Zone 3: Clean Language Selector Button (Supports all 9 Indian Languages) */}
              {onLanguageChange && (
                <div className="flex flex-col items-center lg:items-end gap-2">
                  <label
                    htmlFor="wedding-footer-lang-full"
                    className="font-royal-serif text-[10px] font-bold uppercase tracking-[0.24em] text-[#E5C158]/90"
                  >
                    {copy.footer.languageLabel}
                  </label>
                  <div className="relative inline-flex items-center">
                    <select
                      id="wedding-footer-lang-full"
                      value={activeLang}
                      onChange={(e) => onLanguageChange(e.target.value as WeddingLanguage)}
                      aria-label={copy.footer.languageLabel}
                      className="min-h-[44px] appearance-none rounded-full border border-[#E5C158]/55 bg-black/35 pl-4 pr-9 text-base font-bold text-[#FFF4D6] outline-none transition hover:border-[#E5C158] focus:border-[#E5C158] sm:text-xs"
                    >
                      {WEDDING_LANGUAGE_OPTIONS.map((opt) => (
                        <option key={opt.code} value={opt.code} className="bg-[#1A1317] text-[#FFF4D6]">
                          {opt.nativeLabel} ({opt.englishLabel})
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-[#E5C158]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Understated Atelier Colophon Hairline */}
            <div className="mt-10 pt-6 border-t border-[#D4AF37]/20 flex flex-col items-center gap-2.5 lg:flex-row lg:items-center lg:justify-between text-[11px] text-[#F5EAD4]/55">
              <div className="lg:hidden mb-1 opacity-80">
                <RoyalFlourishDivider theme={theme} />
              </div>
              <p className="font-royal-serif font-semibold uppercase tracking-[0.22em] text-[#E5C158]/85">
                {copy.footer.madeWithWebzy}
              </p>
              <p>
                {copy.footer.privacyNote} &middot;{' '}
                <a
                  href="/takedown"
                  className="underline decoration-[#E5C158]/40 underline-offset-2 hover:text-[#FFF4D2]"
                >
                  Report / Takedown
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </footer>
  );
}
