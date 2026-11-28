'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  type CookieConsentState,
  readCookieConsent,
  writeCookieConsent,
} from '../../lib/cookieConsent';

export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferencesOn, setPreferencesOn] = useState(true);
  const [analyticsOn, setAnalyticsOn] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existing = readCookieConsent();
    if (!existing) {
      setShowBanner(true);
    } else {
      setPreferencesOn(existing.preferences);
      setAnalyticsOn(existing.analytics);
    }

    const handleOpenSettings = () => {
      const current = readCookieConsent();
      if (current) {
        setPreferencesOn(current.preferences);
        setAnalyticsOn(current.analytics);
      }
      setShowCustomize(true);
      setShowBanner(false);
    };

    window.addEventListener('webzy_open_cookie_settings', handleOpenSettings);
    return () => {
      window.removeEventListener('webzy_open_cookie_settings', handleOpenSettings);
    };
  }, []);

  useEffect(() => {
    if (!showCustomize) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCustomize(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [showCustomize]);

  function commitConsent(next: { preferences: boolean; analytics: boolean }) {
    const saved: CookieConsentState = writeCookieConsent(next);
    setPreferencesOn(saved.preferences);
    setAnalyticsOn(saved.analytics);
    setShowBanner(false);
    setShowCustomize(false);
  }

  if (!mounted) return null;

  return (
    <>
      {showBanner ? (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed bottom-3 left-3 right-3 z-[90] sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md"
        >
          <div className="rounded-2xl border border-webzy-ink/12 bg-white/95 p-3.5 shadow-[0_18px_40px_-14px_rgba(24,16,28,0.28)] backdrop-blur-md sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-heading text-xs font-bold text-webzy-ink sm:text-sm">
                Cookies &amp; Privacy on Webzy
              </p>
              <Link
                href="/privacy"
                className="shrink-0 text-[11px] font-semibold text-webzy-primary hover:underline"
              >
                Privacy Policy
              </Link>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-webzy-ink/70 sm:text-xs">
              We use strictly necessary cookies to keep you signed in and save your drafts, plus
              optional cookies to remember your language and improve speed.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => commitConsent({ preferences: true, analytics: true })}
                className="btn-spring inline-flex h-8 items-center justify-center rounded-full bg-webzy-primary px-3.5 text-[11px] font-bold text-white shadow-2xs hover:opacity-95"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={() => commitConsent({ preferences: false, analytics: false })}
                className="inline-flex h-8 items-center justify-center rounded-full border border-webzy-tint bg-white px-3 text-[11px] font-bold text-webzy-ink hover:bg-webzy-surface"
              >
                Essential Only
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBanner(false);
                  setShowCustomize(true);
                }}
                className="inline-flex h-8 items-center justify-center rounded-full px-2.5 text-[11px] font-bold text-webzy-ink/70 hover:text-webzy-primary"
              >
                Customize
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showCustomize && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[115] flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowCustomize(false);
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="webzy-cookie-modal-title"
                className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-webzy-tint bg-white p-5 shadow-2xl sm:p-6"
              >
                <div className="flex items-start justify-between gap-2 border-b border-webzy-tint/80 pb-3">
                  <div>
                    <h2
                      id="webzy-cookie-modal-title"
                      className="font-heading text-lg font-bold text-webzy-ink"
                    >
                      Cookie Preferences
                    </h2>
                    <p className="mt-0.5 text-xs text-webzy-ink/65">
                      Control how Webzy stores cookies on your device (DPDP compliant).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomize(false)}
                    aria-label="Close cookie settings"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  {/* Essential */}
                  <div className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-3.5">
                    <div>
                      <p className="font-bold text-webzy-ink">Strictly Necessary Cookies</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-webzy-ink/70">
                        Required for account sign-in sessions, CSRF security, draft linking, and
                        checkout. Cannot be disabled.
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-700 px-2.5 py-0.5 text-[10px] font-bold text-white">
                      Always On
                    </span>
                  </div>

                  {/* Preferences */}
                  <label className="flex cursor-pointer items-start justify-between gap-3 rounded-2xl border border-webzy-tint bg-white p-3.5">
                    <div>
                      <p className="font-bold text-webzy-ink">Preferences &amp; Personalization</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-webzy-ink/70">
                        Remembers your chosen language (English, Hindi, Hinglish, etc.) and
                        selected add-ons across pages.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferencesOn}
                      onChange={(e) => setPreferencesOn(e.target.checked)}
                      className="mt-1 h-4 w-4 shrink-0 accent-webzy-primary"
                    />
                  </label>

                  {/* Analytics */}
                  <label className="flex cursor-pointer items-start justify-between gap-3 rounded-2xl border border-webzy-tint bg-white p-3.5">
                    <div>
                      <p className="font-bold text-webzy-ink">Performance &amp; Quality Metrics</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-webzy-ink/70">
                        Helps us measure page load speed and fix bugs. Never tracks personal gift
                        photos or private links.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={analyticsOn}
                      onChange={(e) => setAnalyticsOn(e.target.checked)}
                      className="mt-1 h-4 w-4 shrink-0 accent-webzy-primary"
                    />
                  </label>
                </div>

                <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-webzy-tint/80 pt-4">
                  <button
                    type="button"
                    onClick={() => commitConsent({ preferences: false, analytics: false })}
                    className="inline-flex h-9 items-center rounded-full border border-webzy-tint bg-white px-4 text-xs font-bold text-webzy-ink hover:bg-webzy-surface"
                  >
                    Essential Only
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      commitConsent({ preferences: preferencesOn, analytics: analyticsOn })
                    }
                    className="btn-spring inline-flex h-9 items-center rounded-full bg-webzy-primary px-5 text-xs font-bold text-white shadow-2xs hover:opacity-95"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
