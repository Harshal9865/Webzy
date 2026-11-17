'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { getStorefrontCopy, LanguageCode, WebzyPublicConfig } from '@webzy/core';
import { useLanguage } from './LanguageProvider';

interface SiteHeaderProps {
  config: WebzyPublicConfig;
}

const LANG_OPTIONS: Array<{ code: LanguageCode; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'hinglish', label: 'Hinglish' },
  { code: 'hi', label: 'हिन्दी' },
];

export function SiteHeader({ config }: SiteHeaderProps) {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  const copy = getStorefrontCopy(language);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    setCurrentHash(window.location.hash);

    const onHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', onHashChange);

    if (pathname === '/') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
              setCurrentHash(`#${entry.target.id}`);
            }
          });
        },
        { rootMargin: '-70px 0px -40% 0px', threshold: [0.25, 0.5] }
      );

      const howItWorksEl = document.getElementById('how-it-works');
      const faqEl = document.getElementById('faq');

      if (howItWorksEl) observer.observe(howItWorksEl);
      if (faqEl) observer.observe(faqEl);

      const onScroll = () => {
        if (window.scrollY < 200) {
          setCurrentHash('');
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });

      return () => {
        window.removeEventListener('hashchange', onHashChange);
        window.removeEventListener('scroll', onScroll);
        observer.disconnect();
      };
    } else {
      setCurrentHash('');
    }

    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [pathname]);

  const isWeddingsActive = pathname === '/weddings' || pathname.startsWith('/weddings/');
  const isThemesActive = pathname === '/themes' || pathname.startsWith('/themes/') || pathname.startsWith('/create/');
  const isPricingActive = pathname === '/pricing' || pathname.startsWith('/pricing/');
  const isStudioActive = pathname === '/studio' || pathname.startsWith('/studio/');
  const isAccountActive = pathname === '/account' || pathname.startsWith('/account/');
  const isHowItWorksActive =
    (pathname === '/' && currentHash === '#how-it-works') || pathname === '/how-it-works';
  const isFaqActive =
    (pathname === '/' && currentHash === '#faq') || pathname === '/faq';

  return (
    <header className="sticky top-0 z-40 border-b border-webzy-tint bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-2 font-heading text-2xl font-bold tracking-tight text-webzy-ink"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-webzy-primary text-base font-bold text-white shadow-sm"
              aria-hidden="true"
            >
              W
            </span>
            <span>Webzy</span>
          </Link>
        </div>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-6 text-sm font-medium lg:flex"
        >
          <Link
            href="/weddings"
            className={`transition-colors py-1 ${
              isWeddingsActive
                ? 'font-bold text-webzy-primary border-b-2 border-webzy-primary'
                : 'text-webzy-ink/75 hover:text-webzy-ink'
            }`}
          >
            Weddings
          </Link>
          <Link
            href="/themes"
            className={`transition-colors py-1 ${
              isThemesActive
                ? 'font-bold text-webzy-primary border-b-2 border-webzy-primary'
                : 'text-webzy-ink/75 hover:text-webzy-ink'
            }`}
          >
            Occasions
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setCurrentHash('#how-it-works')}
            className={`transition-colors py-1 ${
              isHowItWorksActive
                ? 'font-bold text-webzy-primary border-b-2 border-webzy-primary'
                : 'text-webzy-ink/75 hover:text-webzy-ink'
            }`}
          >
            {copy.nav.howItWorks}
          </Link>
          <Link
            href="/pricing"
            className={`transition-colors py-1 ${
              isPricingActive
                ? 'font-bold text-webzy-primary border-b-2 border-webzy-primary'
                : 'text-webzy-ink/75 hover:text-webzy-ink'
            }`}
          >
            {copy.nav.prices}
          </Link>
          <Link
            href="/studio"
            className={`flex items-center gap-1.5 transition-colors py-1 ${
              isStudioActive
                ? 'font-bold text-webzy-primary border-b-2 border-webzy-primary'
                : 'text-webzy-ink/75 hover:text-webzy-ink'
            }`}
          >
            <span>Studio</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold border transition-colors ${
                isStudioActive
                  ? 'bg-webzy-primary text-white border-webzy-primary'
                  : 'bg-webzy-surface text-webzy-primary border-webzy-tint'
              }`}
            >
              15 Days
            </span>
          </Link>
          <Link
            href="/#faq"
            onClick={() => setCurrentHash('#faq')}
            className={`transition-colors py-1 ${
              isFaqActive
                ? 'font-bold text-webzy-primary border-b-2 border-webzy-primary'
                : 'text-webzy-ink/75 hover:text-webzy-ink'
            }`}
          >
            {copy.nav.faq}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Language selector"
            className="hidden items-center rounded-full border border-webzy-tint bg-webzy-surface p-0.5 sm:inline-flex"
          >
            {LANG_OPTIONS.map((opt) => (
              <button
                suppressHydrationWarning
                key={opt.code}
                type="button"
                onClick={() => setLanguage(opt.code)}
                aria-pressed={language === opt.code}
                className={`min-h-[36px] rounded-full px-3 text-xs font-semibold transition ${
                  language === opt.code
                    ? 'bg-webzy-primary text-white shadow-sm'
                    : 'text-webzy-ink/75 hover:text-webzy-ink'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Link
            href="/account"
            className={`hidden min-h-[44px] items-center rounded-full border px-4 text-xs font-bold transition sm:inline-flex ${
              isAccountActive
                ? 'border-webzy-primary bg-webzy-tint text-webzy-primary'
                : 'border-webzy-tint bg-white text-webzy-ink hover:border-webzy-primary'
            }`}
          >
            Login / Account
          </Link>

          <Link
            href="/themes"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-webzy-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-95 sm:px-5 sm:text-sm"
          >
            {copy.nav.makeYours}
          </Link>

          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-webzy-tint text-webzy-ink lg:hidden"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-webzy-tint bg-white px-4 py-4 lg:hidden">
          <div className="mb-3 flex flex-wrap gap-2 sm:hidden">
            {LANG_OPTIONS.map((opt) => (
              <button
                suppressHydrationWarning
                key={opt.code}
                type="button"
                onClick={() => setLanguage(opt.code)}
                className={`min-h-[44px] rounded-full px-4 text-xs font-semibold ${
                  language === opt.code
                    ? 'bg-webzy-primary text-white'
                    : 'border border-webzy-tint bg-webzy-surface text-webzy-ink'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1 text-sm font-semibold text-webzy-ink">
            <Link
              href="/weddings"
              onClick={() => setMenuOpen(false)}
              className={`flex min-h-[44px] items-center rounded-xl px-3 transition ${
                isWeddingsActive
                  ? 'bg-webzy-tint text-webzy-primary font-bold'
                  : 'hover:bg-webzy-surface text-webzy-ink'
              }`}
            >
              Weddings &amp; Couple Invites
            </Link>
            <Link
              href="/themes"
              onClick={() => setMenuOpen(false)}
              className={`flex min-h-[44px] items-center rounded-xl px-3 transition ${
                isThemesActive
                  ? 'bg-webzy-tint text-webzy-primary font-bold'
                  : 'hover:bg-webzy-surface text-webzy-ink'
              }`}
            >
              All Occasions
            </Link>
            <Link
              href="/studio"
              onClick={() => setMenuOpen(false)}
              className={`flex min-h-[44px] items-center justify-between rounded-xl px-3 transition ${
                isStudioActive
                  ? 'bg-webzy-tint text-webzy-primary font-bold'
                  : 'hover:bg-webzy-surface text-webzy-ink'
              }`}
            >
              <span>Custom Studio</span>
              <span className="rounded-full bg-webzy-tint/60 px-2 py-0.5 text-[10px] font-bold text-webzy-primary">
                Opening in 15 Days
              </span>
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => {
                setCurrentHash('#how-it-works');
                setMenuOpen(false);
              }}
              className={`flex min-h-[44px] items-center rounded-xl px-3 transition ${
                isHowItWorksActive
                  ? 'bg-webzy-tint text-webzy-primary font-bold'
                  : 'hover:bg-webzy-surface text-webzy-ink'
              }`}
            >
              {copy.nav.howItWorks}
            </Link>
            <Link
              href="/pricing"
              onClick={() => {
                setCurrentHash('');
                setMenuOpen(false);
              }}
              className={`flex min-h-[44px] items-center rounded-xl px-3 transition ${
                isPricingActive
                  ? 'bg-webzy-tint text-webzy-primary font-bold'
                  : 'hover:bg-webzy-surface text-webzy-ink'
              }`}
            >
              {copy.nav.prices}
            </Link>
            <Link
              href="/#faq"
              onClick={() => {
                setCurrentHash('#faq');
                setMenuOpen(false);
              }}
              className={`flex min-h-[44px] items-center rounded-xl px-3 transition ${
                isFaqActive
                  ? 'bg-webzy-tint text-webzy-primary font-bold'
                  : 'hover:bg-webzy-surface text-webzy-ink'
              }`}
            >
              {copy.nav.faq}
            </Link>
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className={`flex min-h-[44px] items-center rounded-xl px-3 transition ${
                isAccountActive
                  ? 'bg-webzy-tint text-webzy-primary font-bold'
                  : 'hover:bg-webzy-surface text-webzy-ink'
              }`}
            >
              Login / Account
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
