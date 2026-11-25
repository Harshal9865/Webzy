'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { getLocaleCode, getWeddingUiCopy } from '../i18n';
import type { WeddingInvitation, WeddingLanguage, WeddingThemeKey } from '../schema';
import { getWeddingThemePalette } from '../themePalettes';
import { VarmalaDiyaDivider } from './WeddingArt';

interface RsvpSectionProps {
  rsvpConfig: WeddingInvitation['rsvp'];
  slug?: string;
  brideName: string;
  groomName: string;
  language?: WeddingLanguage;
  theme?: WeddingThemeKey;
  guestName?: string | null;
  compact?: boolean;
}

function formatDeadline(iso: string, language: WeddingLanguage): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(getLocaleCode(language), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return iso;
  }
}

export function RsvpSection({
  rsvpConfig,
  slug,
  brideName,
  groomName,
  language = 'en',
  theme = 'emerald',
  guestName = '',
  compact = false,
}: RsvpSectionProps) {
  const uid = useId();
  const nameInputId = `${uid}-rsvp-name`;
  const phoneInputId = `${uid}-rsvp-phone`;
  const guestCountId = `${uid}-rsvp-guest-count`;
  const wishesInputId = `${uid}-rsvp-wishes`;

  const [name, setName] = useState(guestName || '');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [attending, setAttending] = useState<'yes' | 'no'>('yes');
  const [guestCount, setGuestCount] = useState(1);
  const [mealPreference, setMealPreference] = useState<'veg' | 'jain' | 'nonveg'>('veg');
  const [wishes, setWishes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const prevGuestNameRef = useRef(guestName);
  const safeMaxGuests = Math.max(1, rsvpConfig.maxGuests || 1);

  useEffect(() => {
    if (guestName !== prevGuestNameRef.current) {
      prevGuestNameRef.current = guestName;
      if (guestName) {
        setName(guestName);
      }
    }
  }, [guestName]);

  useEffect(() => {
    setGuestCount((prev) => Math.min(Math.max(1, prev), safeMaxGuests));
  }, [safeMaxGuests]);

  if (!rsvpConfig.enabled) return null;

  const copy = getWeddingUiCopy(language);
  const pal = getWeddingThemePalette(theme);
  const isChristian = pal.tradition === 'christian';
  const headingColor = pal.accentText;
  const focusUnderline = pal.focusUnderline;
  const primaryBtn = pal.primaryBtn;
  const activeAcceptStyle = pal.activeAcceptStyle;
  const activeMealStyle = pal.activeMealStyle;
  const confirmSealBg = pal.confirmSealBg;

  const CHRISTIAN_VEG_LABEL: Record<WeddingLanguage, string> = {
    en: 'Vegetarian',
    hi: 'शाकाहारी',
    gu: 'શાકાહારી',
    mr: 'शाकाहारी',
    pa: 'ਸ਼ਾਕਾਹਾਰੀ',
    bn: 'নিরামিষ',
    ta: 'சைவம்',
    te: 'శాకాహారం',
    kn: 'ಸಸ್ಯಹಾರಿ',
  };

  const CHRISTIAN_SPECIAL_LABEL: Record<WeddingLanguage, string> = {
    en: 'Special / Vegan',
    hi: 'विशेष / वीगन',
    gu: 'સ્પેશિયલ / વીગન',
    mr: 'विशेष / व्हीगन',
    pa: 'ਵਿਸ਼ੇਸ਼ / ਵੀਗਨ',
    bn: 'বিশেষ / ভেগান',
    ta: 'சிறப்பு / வீகன்',
    te: 'ప్రత్యేక / వీగన్',
    kn: 'ವಿಶೇಷ / ವೀಗನ್',
  };

  const PHONE_LABEL_BY_LANG: Record<WeddingLanguage, string> = {
    en: 'Mobile Number (10 digits, optional)',
    hi: 'मोबाइल नंबर (10 अंक, वैकल्पिक)',
    gu: 'મોબાઇલ નંબર (10 અંક, વૈકલ્પિક)',
    mr: 'मोबाईल नंबर (10 अंक, ऐच्छिक)',
    pa: 'ਮੋਬਾਈਲ ਨੰਬਰ (10 ਅੰਕ, ਵਿਕਲਪਿਕ)',
    bn: 'মোবাইল নম্বর (১০ সংখ্যা, ঐচ্ছিক)',
    ta: 'மொபைல் எண் (10 இலக்கம், விருப்பத்தேர்வு)',
    te: 'మొబైల్ నంబర్ (10 అంకెలు, ఐచ్ఛికం)',
    kn: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (10 ಅಂಕಿ, ಐಚ್ಛಿಕ)',
  };

  function validateOptionalIndianPhone(raw: string): { valid: boolean; normalized: string } {
    const trimmed = raw.trim();
    if (!trimmed) return { valid: true, normalized: '' };
    const digits = trimmed.replace(/\D/g, '');
    const tenDigit = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
    if (/^[6-9]\d{9}$/.test(tenDigit)) {
      return { valid: true, normalized: tenDigit };
    }
    return { valid: false, normalized: trimmed };
  }

  function buildWhatsAppUrl(): string {
    const hostPhone = rsvpConfig.whatsappNumber || '';
    const cleanPhone = hostPhone.replace(/[^0-9]/g, '');

    const mealLabel =
      mealPreference === 'jain'
        ? isChristian
          ? 'Special Dietary'
          : 'Jain'
        : mealPreference === 'nonveg'
          ? 'Non-Veg'
          : isChristian
            ? 'Vegetarian'
            : 'Pure Veg';

    const greeting = isChristian ? 'Warm greetings!' : 'Namaste!';
    const phoneCheck = validateOptionalIndianPhone(phone);
    const phoneSuffix = phoneCheck.normalized ? `\nMobile: +91 ${phoneCheck.normalized}` : '';

    const text =
      attending === 'yes'
        ? `${greeting} This is ${name.trim()}. We are joyfully confirming our attendance for ${brideName} & ${groomName}'s wedding celebrations.\nGuests: ${guestCount}\nMeal: ${mealLabel}${phoneSuffix}${
            wishes.trim() ? `\nNote: ${wishes.trim()}` : ''
          }`
        : `${greeting} ${brideName} & ${groomName}. This is ${name.trim()}. We regretfully will not be able to attend in person, and send our heartfelt blessings and warm wishes.${phoneSuffix}${
            wishes.trim() ? `\nNote: ${wishes.trim()}` : ''
          }`;

    const encoded = encodeURIComponent(text);
    return cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
  }

  async function handleConfirmSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    const phoneCheck = validateOptionalIndianPhone(phone);
    if (!phoneCheck.valid) {
      setPhoneError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }
    setPhoneError('');

    setSubmitting(true);
    try {
      await fetch('/api/weddings/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug || 'wedding-demo',
          guestName: name.trim(),
          phone: phoneCheck.normalized || undefined,
          attending: attending === 'yes',
          guestCount: attending === 'yes' ? guestCount : 0,
          mealPreference: attending === 'yes' && rsvpConfig.askMealPreference ? mealPreference : null,
          wishes: wishes.trim() || undefined,
        }),
      });
    } catch {
      // Graceful demo/offline fallback: confirmation still proceeds cleanly
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  }

  function handleOpenWhatsApp() {
    if (!name.trim()) return;
    window.open(buildWhatsAppUrl(), '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  }

  const labelClass =
    'block font-royal-serif text-[10px] sm:text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#7A5E20] mb-1.5';
  const underlineInputClass = `w-full rounded-none border-0 border-b border-[#C5A059]/60 bg-transparent px-0.5 py-2.5 font-royal-serif text-base sm:text-sm text-[#2B1B2E] placeholder:italic placeholder:text-[#2B1B2E]/40 focus:outline-none transition-colors ${focusUnderline}`;

  return (
    <section
      id="wedding-rsvp"
      className={
        compact
          ? 'w-full py-8 px-4 scroll-mt-16'
          : 'w-full h-full py-6 md:py-8 lg:py-4 px-4 sm:px-6 lg:px-0 scroll-mt-16'
      }
    >
      {/* Tactile Engraved Letterpress Ivory Stationery Reply Card */}
      <div
        className={`relative w-full mx-auto border border-[#C5A059]/55 bg-[#FFFDF9] shadow-[0_18px_48px_-24px_rgba(38,26,12,0.24)] ${
          compact
            ? 'max-w-md rounded-[22px] px-6 py-9'
            : 'max-w-xl lg:max-w-2xl h-full rounded-[22px] md:rounded-[26px] px-6 py-9 sm:p-10 md:p-11'
        }`}
      >
        {/* 6px Inset Fine Antique-Gold Double-Frame Hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[6px] rounded-[16px] md:rounded-[20px] border border-[#C5A059]/35"
        />

        <div className="relative z-10">
          <div className="text-center mb-7">
            <span className="font-royal-serif text-[10.5px] md:text-[11px] font-bold uppercase tracking-[0.3em] text-[#8C6D23] block">
              VIII &middot; {copy.rsvp.eyebrow}
            </span>
            <h2
              className={`font-royal-script mt-1.5 leading-[1.1] ${headingColor} ${
                compact ? 'text-4xl' : 'text-4xl sm:text-[42px]'
              }`}
            >
              {copy.rsvp.heading}
            </h2>
            <VarmalaDiyaDivider theme={theme} className="my-3.5" />
            <p
              className={`font-royal-serif italic text-[#2B1B2E]/80 leading-relaxed mx-auto ${
                compact ? 'text-xs max-w-xs' : 'text-[13px] sm:text-sm max-w-md'
              }`}
            >
              {copy.rsvp.subhead}
            </p>
            {rsvpConfig.deadlineDate ? (
              <p className="mt-2.5 inline-flex items-center gap-2 font-royal-serif text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[#8C6D23]">
                <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-[#C5A059]" />
                <span>
                  {copy.rsvp.deadlinePrefix} {formatDeadline(rsvpConfig.deadlineDate, language)}
                </span>
                <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-[#C5A059]" />
              </p>
            ) : null}
          </div>

          {submitted ? (
            <div className="relative rounded-xl border border-[#C5A059]/40 bg-[#FAF6EE]/80 p-6 sm:p-7 text-center space-y-3.5">
              <div
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#E5C158]/60 text-[#FCE4A0] shadow-sm ${confirmSealBg}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className={`font-royal-serif text-xl font-semibold tracking-wide ${headingColor}`}>
                {copy.rsvp.thankYouPrefix} {name}
              </p>
              <p className="font-royal-serif italic text-xs sm:text-sm text-[#2B1B2E]/80 leading-relaxed max-w-sm mx-auto">
                {attending === 'yes' ? copy.rsvp.confirmedNote : copy.rsvp.declinedNote}
              </p>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="btn-spring flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#235C3B]/45 bg-[#1F6B45] px-4 text-xs font-bold uppercase tracking-[0.14em] text-[#FFFDF8] shadow-sm hover:bg-[#195939] transition"
                >
                  <span>{copy.rsvp.sendWhatsAppFollowup}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="font-royal-serif text-xs font-semibold tracking-[0.14em] uppercase text-[#8C6D23] underline underline-offset-4 decoration-[#C5A059]/60 hover:text-[#5E4713] py-1"
                >
                  {copy.rsvp.editResponse}
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleConfirmSubmit}
              className={compact ? 'space-y-5 text-xs' : 'space-y-6 text-xs sm:text-[13px]'}
            >
              {/* Guest Name & Party Count: Engraved Stationery Underline Row */}
              <div
                className={
                  !compact && attending === 'yes'
                    ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
                    : 'space-y-5'
                }
              >
                <div>
                  <label htmlFor={nameInputId} className={labelClass}>
                    {copy.rsvp.yourNameLabel}
                  </label>
                  <input
                    id={nameInputId}
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={copy.rsvp.yourNamePlaceholder}
                    className={underlineInputClass}
                  />
                </div>

                <div>
                  <label htmlFor={phoneInputId} className={labelClass}>
                    {PHONE_LABEL_BY_LANG[language] ?? PHONE_LABEL_BY_LANG.en}
                  </label>
                  <input
                    id={phoneInputId}
                    type="tel"
                    inputMode="numeric"
                    maxLength={14}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError('');
                    }}
                    placeholder="98XXXXXXXX"
                    className={underlineInputClass}
                  />
                  {phoneError ? (
                    <p className="mt-1 text-[11px] font-semibold text-red-700">{phoneError}</p>
                  ) : null}
                </div>

                {!compact && attending === 'yes' && (
                  <div>
                    <label htmlFor={guestCountId} className={labelClass}>
                      {copy.rsvp.guestCountLabel} ({copy.rsvp.maxPrefix} {safeMaxGuests})
                    </label>
                    <select
                      id={guestCountId}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className={`${underlineInputClass} cursor-pointer`}
                    >
                      {Array.from({ length: safeMaxGuests }).map((_, i) => (
                        <option key={i + 1} value={i + 1} className="bg-[#FFFDF9] text-[#2B1B2E]">
                          {i + 1} {i === 0 ? copy.rsvp.guestSingular : copy.rsvp.guestPlural}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Dignified Attendance Reply Toggle */}
              <div>
                <span className={labelClass}>{copy.rsvp.attendingQuestion}</span>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setAttending('yes')}
                    aria-pressed={attending === 'yes'}
                    className={`btn-spring flex items-center justify-center gap-2 rounded-lg border py-3 px-3 font-royal-serif text-xs sm:text-[13px] font-semibold tracking-wide transition ${
                      attending === 'yes'
                        ? activeAcceptStyle
                        : 'border-[#C5A059]/45 bg-transparent text-[#2B1B2E]/75 hover:border-[#C5A059] hover:bg-[#FAF6EE]/60'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 rotate-45 border ${
                        attending === 'yes'
                          ? 'border-[#F5D67B] bg-[#F5D67B]'
                          : 'border-[#C5A059]/70 bg-transparent'
                      }`}
                    />
                    <span>{copy.rsvp.joyfullyAttend}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttending('no')}
                    aria-pressed={attending === 'no'}
                    className={`btn-spring flex items-center justify-center gap-2 rounded-lg border py-3 px-3 font-royal-serif text-xs sm:text-[13px] font-semibold tracking-wide transition ${
                      attending === 'no'
                        ? 'border-[#5C4E43] bg-[#F3EFE8] text-[#2B1B2E] shadow-sm'
                        : 'border-[#C5A059]/45 bg-transparent text-[#2B1B2E]/70 hover:border-[#C5A059] hover:bg-[#FAF6EE]/60'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 rotate-45 border ${
                        attending === 'no'
                          ? 'border-[#5C4E43] bg-[#5C4E43]'
                          : 'border-[#C5A059]/70 bg-transparent'
                      }`}
                    />
                    <span>{copy.rsvp.regretfullyDecline}</span>
                  </button>
                </div>
              </div>

              {attending === 'yes' && (
                <>
                  {/* Guest Count (Compact Mode) */}
                  {compact && (
                    <div>
                      <label htmlFor={guestCountId} className={labelClass}>
                        {copy.rsvp.guestCountLabel} ({copy.rsvp.maxPrefix} {safeMaxGuests})
                      </label>
                      <select
                        id={guestCountId}
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className={`${underlineInputClass} cursor-pointer`}
                      >
                        {Array.from({ length: safeMaxGuests }).map((_, i) => (
                          <option key={i + 1} value={i + 1} className="bg-[#FFFDF9] text-[#2B1B2E]">
                            {i + 1} {i === 0 ? copy.rsvp.guestSingular : copy.rsvp.guestPlural}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Refined Dietary / Meal Preference Cards */}
                  {rsvpConfig.askMealPreference && (
                    <div>
                      <span className={labelClass}>{copy.rsvp.mealPrefLabel}</span>
                      <div className="mt-2 grid grid-cols-1 gap-2 min-[360px]:grid-cols-3 sm:gap-2.5 text-center">
                        {(
                          [
                            {
                              key: 'veg',
                              label: isChristian
                                ? (CHRISTIAN_VEG_LABEL[language] ?? CHRISTIAN_VEG_LABEL.en)
                                : copy.rsvp.pureVeg,
                            },
                            { key: 'nonveg', label: copy.rsvp.nonVeg },
                            {
                              key: 'jain',
                              label: isChristian
                                ? (CHRISTIAN_SPECIAL_LABEL[language] ?? CHRISTIAN_SPECIAL_LABEL.en)
                                : copy.rsvp.jain,
                            },
                          ] as const
                        ).map((item) => {
                          const isSelected = mealPreference === item.key;
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setMealPreference(item.key)}
                              aria-pressed={isSelected}
                              className={`btn-spring min-h-[44px] rounded-lg border px-2 py-2.5 font-royal-serif text-[11.5px] sm:text-xs font-semibold tracking-wide transition ${
                                isSelected
                                  ? activeMealStyle
                                  : 'border-[#C5A059]/40 bg-transparent text-[#2B1B2E]/70 hover:border-[#C5A059]/80 hover:bg-[#FAF6EE]/50'
                              }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Warm Wishes / Arrival Note (Parchment Correspondence Box) */}
              <div>
                <label htmlFor={wishesInputId} className={labelClass}>
                  {copy.rsvp.wishesLabel}
                </label>
                <textarea
                  id={wishesInputId}
                  rows={compact ? 2 : 3}
                  value={wishes}
                  onChange={(e) => setWishes(e.target.value)}
                  placeholder={copy.rsvp.wishesPlaceholder}
                  className={`w-full rounded-lg border border-[#C5A059]/45 bg-[#FAF7F0]/55 font-royal-serif text-base sm:text-sm text-[#2B1B2E] placeholder:italic placeholder:text-[#2B1B2E]/40 focus:bg-[#FFFDF9] focus:outline-none transition-colors ${focusUnderline} ${
                    compact ? 'px-3.5 py-2.5' : 'px-4 py-3'
                  }`}
                />
              </div>

              {/* Sculptural Jewel-Tone Submit CTA & Secondary WhatsApp Forward */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`btn-spring flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-lg font-royal-serif text-xs sm:text-[13px] font-bold uppercase tracking-[0.2em] shadow-md transition active:scale-[0.98] disabled:opacity-60 ${primaryBtn}`}
                >
                  <span>{submitting ? copy.rsvp.submittingBtn : copy.rsvp.confirmBtn}</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  disabled={!name.trim()}
                  className="btn-spring flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#235C3B]/45 bg-[#F3F8F4] font-royal-serif text-[11.5px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#1A4D2E] hover:bg-[#1F6B45] hover:text-[#FFFDF8] transition disabled:opacity-45"
                >
                  <span>{copy.rsvp.whatsappBtn}</span>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
