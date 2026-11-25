'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getWeddingUiCopy } from '../i18n';
import type { WeddingInvitation, WeddingLanguage, WeddingThemeKey } from '../schema';
import { getWeddingThemePalette } from '../themePalettes';
import { MangalKalashCrest } from './WeddingArt';

interface DigitalShagunProps {
  shagun?: WeddingInvitation['shagun'];
  language?: WeddingLanguage;
  theme?: WeddingThemeKey;
  compact?: boolean;
}

const SHAGUN_PRESET_AMOUNTS = [501, 1100, 2100, 5100] as const;

export function DigitalShagun({
  shagun,
  language = 'en',
  theme = 'emerald',
  compact = false,
}: DigitalShagunProps) {
  const [copied, setCopied] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [blessingSent, setBlessingSent] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  if (!shagun?.enabled || !shagun.upiId) return null;

  const copy = getWeddingUiCopy(language);
  const pal = getWeddingThemePalette(theme);
  const isChristian = pal.tradition === 'christian';
  const lifafaBgClass = pal.bandBgClass;
  const lifafaRadialStyle = pal.lifafaRadialStyle;
  const outerBorder = pal.outerBorder;
  const flapStroke = pal.goldAccent;

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(shagun.upiId)}&pn=${encodeURIComponent(
    shagun.beneficiaryName || (isChristian ? 'Wedding Gift Blessing' : 'Wedding Shagun')
  )}&cu=INR${selectedAmount ? `&am=${selectedAmount}` : ''}`;

  const CHRISTIAN_GIFT_EYEBROW: Record<WeddingLanguage, string> = {
    en: 'Gift & Blessings',
    hi: 'उपहार एवं आशीर्वाद',
    gu: 'ભેટ અને આશીર્વાદ',
    mr: 'भेट आणि आशीर्वाद',
    pa: 'ਤੋਹਫ਼ੇ ਅਤੇ ਅਸੀਸਾਂ',
    bn: 'উপহার ও আশীর্বাদ',
    ta: 'பரிசு மற்றும் ஆசீர்வாதங்கள்',
    te: 'బహుమతి & ఆశీస్సులు',
    kn: 'ಉಡುಗೊರೆ ಮತ್ತು ಆಶೀರ್ವಾದಗಳು',
  };

  const CHRISTIAN_GIFT_HEADING: Record<WeddingLanguage, string> = {
    en: 'Wedding Gift Registry',
    hi: 'विवाह उपहार निधि',
    gu: 'લગ્ન ભેટ રજિસ્ટ્રી',
    mr: 'विवाह भेट निधी',
    pa: 'ਵਿਆਹ ਤੋਹਫ਼ਾ ਫੰਡ',
    bn: 'বিবাহ উপহার তহবিল',
    ta: 'திருமண பரிசு நிதி',
    te: 'వివాహ బహుమతి నిధి',
    kn: 'ವಿವಾಹ ಉಡುಗೊರೆ ನಿಧಿ',
  };

  async function handleCopy() {
    if (!shagun?.upiId) return;
    let ok = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shagun.upiId);
        ok = true;
      }
    } catch {
      ok = false;
    }

    if (!ok && typeof document !== 'undefined') {
      try {
        const ta = document.createElement('textarea');
        ta.value = shagun.upiId;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }

    if (ok) {
      setCopied(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 2200);
    }
  }

  return (
    <section
      className={
        compact
          ? 'w-full py-8 px-4'
          : 'w-full h-full py-6 md:py-8 lg:py-4 px-4 sm:px-6 lg:px-0'
      }
    >
      {/* Ceremonial Deep Jewel-Tone Shagun Lifafa (Envelope Card) */}
      <div
        className={`relative w-full mx-auto overflow-hidden border text-center text-[#FFF8E7] shadow-[0_24px_56px_-22px_rgba(10,6,8,0.55)] ${lifafaBgClass} ${outerBorder} ${
          compact
            ? 'max-w-md rounded-[22px] px-6 pt-12 pb-8'
            : 'max-w-xl h-full flex flex-col justify-center rounded-[22px] md:rounded-[26px] px-6 pt-14 pb-9 sm:px-9 sm:pt-16 sm:pb-10'
        }`}
        style={{ backgroundImage: lifafaRadialStyle }}
      >
        {/* Ceremonial Envelope Flap V-Crease Accent at Top */}
        <svg
          aria-hidden="true"
          viewBox="0 0 400 76"
          preserveAspectRatio="none"
          fill="none"
          className="pointer-events-none absolute top-0 inset-x-0 h-16 sm:h-[74px] w-full"
        >
          <path
            d="M 0 0 L 200 66 L 400 0 Z"
            fill="#000000"
            fillOpacity="0.18"
          />
          <path
            d="M 8 2 L 200 64 L 392 2"
            stroke={flapStroke}
            strokeOpacity="0.45"
            strokeWidth="1.1"
          />
          <path
            d="M 22 2 L 200 58 L 378 2"
            stroke={flapStroke}
            strokeOpacity="0.2"
            strokeWidth="0.75"
          />
        </svg>

        {/* Fine Antique-Gold Double-Hairline Perimeter Frame */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[6px] rounded-[16px] md:rounded-[20px] border border-[#F5D67B]/30"
        />

        <div className="relative z-10">
          {/* Radiant Mangal Kalash Crown Seated Over Envelope Clasp */}
          <div className="mx-auto mb-3.5 inline-flex h-16 w-16 md:h-[70px] md:w-[70px] items-center justify-center rounded-full border border-[#E5C158]/45 bg-black/20 shadow-inner">
            <MangalKalashCrest
              theme={theme}
              className="h-12 w-12 md:h-14 md:w-14"
            />
          </div>

          <span className="font-royal-serif text-[10.5px] md:text-[11px] font-bold uppercase tracking-[0.28em] text-[#E5C158] block">
            {isChristian
              ? (CHRISTIAN_GIFT_EYEBROW[language] ?? CHRISTIAN_GIFT_EYEBROW.en)
              : copy.shagun.eyebrow}
          </span>
          <h2
            className={`font-royal-script mt-1.5 leading-[1.1] text-[#FFF4D2] ${
              compact ? 'text-4xl' : 'text-4xl sm:text-[42px]'
            }`}
            style={{ textShadow: '0 2px 14px rgba(0, 0, 0, 0.35)' }}
          >
            {isChristian
              ? (CHRISTIAN_GIFT_HEADING[language] ?? CHRISTIAN_GIFT_HEADING.en)
              : copy.shagun.heading}
          </h2>

          <p
            className={`mt-3 font-royal-serif italic text-[#F5EAD4]/80 mx-auto leading-[1.78] ${
              compact ? 'text-xs max-w-xs' : 'text-[13px] sm:text-sm max-w-sm'
            }`}
          >
            {copy.shagun.subhead}
          </p>

          {/* Recessed Antique-Gold Bordered UPI VPA Plaque */}
          <div
            className={`mt-6 rounded-xl border border-[#D4AF37]/40 bg-black/25 text-left shadow-inner ${
              compact ? 'p-4' : 'p-4 sm:p-5'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="font-royal-serif text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#E5C158] block">
                  {copy.shagun.upiVpaLabel}
                </span>
                <span className="mt-0.5 block font-mono text-xs sm:text-sm font-semibold tracking-wide text-[#FCE4A0] break-all">
                  {shagun.upiId}
                </span>
                {shagun.beneficiaryName ? (
                  <p className="font-royal-serif text-[11px] sm:text-xs text-[#F5EAD4]/70 mt-1">
                    {shagun.beneficiaryName}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="btn-spring shrink-0 flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E5C158]/55 bg-[#D4AF37]/15 px-3 font-royal-serif text-[11px] font-bold uppercase tracking-[0.14em] text-[#FCE4A0] hover:bg-[#D4AF37]/25 hover:border-[#FCE4A0] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5D67B]"
              >
                {copied ? (
                  <>
                    <svg className="h-3.5 w-3.5 text-[#FCE4A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{copy.shagun.copied}</span>
                  </>
                ) : (
                  <span>{copy.shagun.copyUpi}</span>
                )}
              </button>
            </div>

            {/* Quick Interactive Shagun Blessing Amount Pills */}
            <div className="mt-4 border-t border-[#D4AF37]/25 pt-3.5">
              <p className="font-royal-serif text-[10px] font-bold uppercase tracking-[0.18em] text-[#E5C158]">
                {selectedAmount ? `Selected Shagun: ₹${selectedAmount.toLocaleString('en-IN')}` : 'Optional Blessing Amount'}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SHAGUN_PRESET_AMOUNTS.map((amt) => {
                  const active = selectedAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(active ? null : amt);
                        setBlessingSent(true);
                      }}
                      className={`rounded-full border px-2.5 py-1 font-royal-serif text-[11px] font-bold transition active:scale-95 ${
                        active
                          ? 'border-[#FCE4A0] bg-[#D4AF37] text-[#18120B] shadow-xs'
                          : 'border-[#E5C158]/40 bg-black/20 text-[#FCE4A0] hover:border-[#FCE4A0]'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shimmering Metallic Antique-Gold Offer Shagun CTA */}
            <a
              href={upiDeepLink}
              onClick={() => setBlessingSent(true)}
              className="btn-spring mt-4 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg font-royal-serif text-xs sm:text-[13px] font-bold uppercase tracking-[0.18em] text-[#1C1306] shadow-[0_10px_24px_-8px_rgba(212,175,55,0.55)] transition hover:brightness-105 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF0B8]"
              style={{
                background: 'linear-gradient(135deg, #CFA33B 0%, #F7DF92 48%, #C4962E 100%)',
              }}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {selectedAmount
                  ? `${copy.shagun.payViaUpi} (₹${selectedAmount.toLocaleString('en-IN')})`
                  : copy.shagun.payViaUpi}
              </span>
            </a>

            {blessingSent ? (
              <p className="mt-2.5 text-center font-royal-serif text-[11px] italic text-[#FCE4A0]/90 animate-fade-in">
                Heartfelt Shagun prepared for {shagun.beneficiaryName || 'the couple'}.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
