'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getSiteCopy, getStorefrontCopy, WebzyPublicConfig } from '@webzy/core';
import { useAuth } from '../auth/AuthProvider';
import { useLanguage } from './LanguageProvider';
import { LanguageSelectorButton } from './LanguageSelectorButton';
import { useOrdersCount } from './OrdersCountProvider';

interface SiteHeaderProps {
  config: WebzyPublicConfig;
}

function getUserInitials(fullName?: string | null, email?: string | null): string {
  const cleanedName = fullName?.trim();
  if (cleanedName) {
    const parts = cleanedName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return cleanedName.slice(0, 2).toUpperCase();
  }
  const cleanedEmail = email?.trim();
  if (cleanedEmail) {
    return cleanedEmail.charAt(0).toUpperCase();
  }
  return 'W';
}

export function SiteHeader({ config: _config }: SiteHeaderProps) {
  void _config;
  const pathname = usePathname();
  const { language } = useLanguage();
  const { ordersCount } = useOrdersCount();
  const { user, profile, isAuthenticated, openAuthModal, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const copy = getStorefrontCopy(language);
  const site = getSiteCopy(language);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const displayName =
    profile?.full_name?.trim() || user?.email?.split('@')[0] || 'Webzy Member';
  const initials = getUserInitials(profile?.full_name, user?.email);

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

  // Lock body scroll when mobile drawer is open and auto-close if viewport widens to desktop
  React.useEffect(() => {
    if (!menuOpen || typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const mq = window.matchMedia('(min-width: 1024px)');
    const handleViewportChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener?.('change', handleViewportChange);

    return () => {
      document.body.style.overflow = prevOverflow;
      mq.removeEventListener?.('change', handleViewportChange);
    };
  }, [menuOpen]);

  // Handle ESC key to close sidebar and profile dropdown
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setProfileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close profile dropdown on click/tap outside
  React.useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClickOutside = (e: PointerEvent) => {
      if (
        profileMenuRef.current &&
        e.target instanceof Node &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [profileMenuOpen]);

  // Close sidebar and profile dropdown on route change
  React.useEffect(() => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setProfileMenuOpen(false);
    setMenuOpen(false);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  const safePathname = pathname || '';
  const isWeddingsActive = safePathname === '/weddings' || safePathname.startsWith('/weddings/');
  const isThemesActive =
    safePathname === '/themes' ||
    safePathname.startsWith('/themes/') ||
    safePathname.startsWith('/create/');
  const isPricingActive = safePathname === '/pricing' || safePathname.startsWith('/pricing/');
  const isStudioActive = safePathname === '/studio' || safePathname.startsWith('/studio/');
  const isOrdersActive = safePathname === '/orders' || safePathname.startsWith('/orders/');
  const isProfileActive =
    safePathname === '/profile' ||
    safePathname.startsWith('/profile/') ||
    safePathname === '/account';
  const isHowItWorksActive =
    (safePathname === '/' && currentHash === '#how-it-works') || safePathname === '/how-it-works';
  const isFaqActive =
    (safePathname === '/' && currentHash === '#faq') || safePathname === '/faq';

  return (
    <>
      <header className="sticky top-0 z-40 glass-nav shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] transition-shadow duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-1.5 px-3 py-1.5 sm:gap-2 sm:px-6 sm:py-2">
          {/* Brand Logo (Left Anchored) */}
          <Link
            href="/"
            className="group inline-flex min-h-[36px] sm:min-h-[40px] items-center gap-1.5 sm:gap-2 font-heading text-lg sm:text-xl font-bold tracking-tight text-webzy-ink transition-transform active:scale-[0.98]"
          >
            <span
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-webzy-primary text-xs sm:text-sm font-bold text-white shadow-btn-primary transition-transform duration-200 group-hover:scale-105"
              aria-hidden="true"
            >
              w
            </span>
            <span className="font-heading tracking-tight">Webzy</span>
          </Link>

          {/* Desktop Primary Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-6 text-sm font-medium lg:flex"
          >
            <Link
              href="/weddings"
              className={`transition-colors py-1 ${isWeddingsActive
                ? 'font-bold text-webzy-primary border-b-2 border-webzy-primary'
                : 'text-webzy-ink/75 hover:text-webzy-ink'
                }`}
            >
              {copy.nav.weddings}
            </Link>
            <Link
              href="/themes"
              className={`transition-colors py-1 ${isThemesActive
                ? 'font-bold text-webzy-primary border-b-2 border-webzy-primary'
                : 'text-webzy-ink/75 hover:text-webzy-ink'
                }`}
            >
              {copy.nav.occasions}
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setCurrentHash('#how-it-works')}
              className={`transition-colors py-1 ${isHowItWorksActive
                ? 'font-bold text-webzy-primary border-b-2 border-webzy-primary'
                : 'text-webzy-ink/75 hover:text-webzy-ink'
                }`}
            >
              {copy.nav.howItWorks}
            </Link>
            <Link
              href="/pricing"
              className={`transition-colors py-1 ${isPricingActive
                ? 'font-bold text-webzy-primary border-b-2 border-webzy-primary'
                : 'text-webzy-ink/75 hover:text-webzy-ink'
                }`}
            >
              {copy.nav.prices}
            </Link>
            <Link
              href="/studio"
              className={`transition-colors py-1 ${isStudioActive
                ? 'font-bold text-webzy-primary border-b-2 border-webzy-primary'
                : 'text-webzy-ink/75 hover:text-webzy-ink'
                }`}
            >
              {copy.nav.studio}
            </Link>
            <Link
              href="/#faq"
              onClick={() => setCurrentHash('#faq')}
              className={`transition-colors py-1 ${isFaqActive
                ? 'font-bold text-webzy-primary border-b-2 border-webzy-primary'
                : 'text-webzy-ink/75 hover:text-webzy-ink'
                }`}
            >
              {copy.nav.faq}
            </Link>
          </nav>

          {/* Right Side Controls & CTA */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Simple Language Selector Button (Mobile + Desktop) */}
            <LanguageSelectorButton variant="header" />

            {/* Shopping Bag / Orders Button (Universal: Mobile + Desktop) */}
            <Link
              href="/orders"
              className={`btn-spring relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border transition ${isOrdersActive
                ? 'border-webzy-primary bg-webzy-tint text-webzy-primary shadow-sm ring-2 ring-webzy-primary/20'
                : 'border-webzy-tint/90 bg-white/95 text-webzy-ink/80 hover:border-webzy-primary hover:text-webzy-ink shadow-2xs'
                }`}
              title="My Orders & Live Celebrations"
              aria-label={`My Orders (${ordersCount} active)`}
            >
              <svg className="h-4 w-4 sm:h-[18px] sm:w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.85}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {ordersCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-webzy-primary px-1 text-[9.5px] font-extrabold text-white shadow-btn-primary animate-scale-in font-tabular">
                  {ordersCount}
                </span>
              ) : null}
            </Link>

            {/* Profile / Auth Control (Universal: Mobile + Desktop) */}
            <div ref={profileMenuRef} className="relative">
              {isAuthenticated && user ? (
                <>
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    aria-expanded={profileMenuOpen}
                    aria-haspopup="menu"
                    aria-label={`Account menu for ${displayName}`}
                    title={`${displayName} (${user.email})`}
                    className={`btn-spring relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center overflow-hidden rounded-full border text-[11px] font-bold tracking-tight transition ${isProfileActive || profileMenuOpen
                      ? 'border-webzy-primary bg-webzy-primary text-white shadow-sm'
                      : 'border-webzy-ink/15 bg-webzy-ink text-white hover:opacity-90'
                      }`}
                  >
                    {user.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={user.avatarUrl}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </button>

                  {profileMenuOpen ? (
                    <div
                      role="menu"
                      aria-label="Account options"
                      className="absolute right-0 mt-2 w-60 origin-top-right overflow-hidden rounded-xl border border-webzy-ink/10 bg-white shadow-lg animate-scale-in z-50"
                    >
                      {/* User Identity Header */}
                      <div className="border-b border-webzy-ink/[0.07] px-4 py-3">
                        <p className="truncate text-sm font-semibold text-webzy-ink">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-webzy-ink/55">{user.email}</p>
                      </div>

                      {/* Quick Links */}
                      <div className="p-1.5">
                        <Link
                          href="/profile"
                          role="menuitem"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium text-webzy-ink/85 transition hover:bg-webzy-ink/[0.04] hover:text-webzy-ink"
                        >
                          <span>{site.common.myProfile}</span>
                        </Link>

                        <Link
                          href="/orders"
                          role="menuitem"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex min-h-[44px] items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-webzy-ink/85 transition hover:bg-webzy-ink/[0.04] hover:text-webzy-ink"
                        >
                          <span>{site.common.myOrders}</span>
                          {ordersCount > 0 ? (
                            <span className="text-xs font-semibold text-webzy-ink/55 font-tabular">
                              {ordersCount}
                            </span>
                          ) : null}
                        </Link>
                      </div>

                      {/* Sign Out Action */}
                      <div className="border-t border-webzy-ink/[0.07] p-1.5">
                        <button
                          type="button"
                          role="menuitem"
                          disabled={signingOut}
                          onClick={() => void handleSignOut()}
                          className="flex min-h-[44px] w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-webzy-ink/60 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                        >
                          <span>{signingOut ? site.common.signingOut : site.common.signOut}</span>
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() =>
                    openAuthModal({
                      reason: 'Sign in to view your orders, saved drafts, and account settings.',
                    })
                  }
                  className={`btn-spring relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border transition ${isProfileActive
                    ? 'border-webzy-primary bg-webzy-primary text-white shadow-sm ring-2 ring-webzy-primary/20'
                    : 'border-webzy-tint/90 bg-white/95 text-webzy-ink/80 hover:border-webzy-primary hover:text-webzy-ink shadow-2xs'
                    }`}
                  title="Sign in to Webzy"
                  aria-label="Sign in to your account"
                >
                  <svg
                    className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.85}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Primary Action Button (Desktop & Tablet only - on mobile, replaced by Profile & Orders icons) */}
            <Link
              href="/themes"
              className="btn-spring hidden sm:inline-flex h-9 items-center justify-center rounded-full bg-webzy-primary px-3.5 text-xs font-bold text-white shadow-btn-primary hover:opacity-95 active:scale-95 transition-all whitespace-nowrap"
            >
              <span>{copy.nav.makeYours}</span>
            </Link>

            {/* Mobile Navigation Trigger */}
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => {
                setProfileMenuOpen(false);
                setMenuOpen((prev) => !prev);
              }}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-webzy-ink/85 transition-colors hover:bg-webzy-ink/[0.05] hover:text-webzy-ink active:bg-webzy-ink/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-webzy-primary/35 lg:hidden"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <>
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </>
                ) : (
                  <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h12" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer (Portaled to document.body so ancestor backdrop-filter/overflow never clips viewport height) */}
      {mounted && typeof document !== 'undefined'
        ? createPortal(
          <div
            id="mobile-nav-drawer"
            className={`fixed inset-0 z-[100] lg:hidden transition-[visibility] duration-300 ${menuOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
              }`}
            aria-hidden={!menuOpen}
          >
            {/* Scrim */}
            <div
              onClick={() => setMenuOpen(false)}
              className={`fixed inset-0 bg-webzy-ink/35 backdrop-blur-[2px] transition-opacity duration-200 ${menuOpen ? 'opacity-100' : 'opacity-0'
                }`}
              aria-hidden="true"
            />

            {/* Right-Anchored Full-Height Sheet */}
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className={`fixed inset-y-0 right-0 flex w-[84vw] max-w-[320px] flex-col border-l border-webzy-ink/[0.06] bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${menuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
              {/* Top Bar */}
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-webzy-ink/[0.07] px-5">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="font-heading text-lg font-bold tracking-tight text-webzy-ink"
                >
                  Webzy
                </Link>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex h-10 w-10 -mr-2 items-center justify-center rounded-lg text-webzy-ink/70 transition-colors hover:bg-webzy-ink/[0.05] hover:text-webzy-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-webzy-primary/35"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {/* Navigation Body */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-none">
                <nav aria-label="Mobile navigation" className="px-3 py-4">
                  <ul className="space-y-0.5">
                    <li>
                      <Link
                        href="/weddings"
                        onClick={() => setMenuOpen(false)}
                        className={`flex min-h-[44px] items-center justify-between rounded-lg px-3 text-[15px] transition-colors ${isWeddingsActive
                          ? 'bg-webzy-primary/[0.07] font-semibold text-webzy-primary'
                          : 'font-medium text-webzy-ink/85 hover:bg-webzy-ink/[0.04] hover:text-webzy-ink'
                          }`}
                      >
                        <span>{copy.nav.weddings}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/themes"
                        onClick={() => setMenuOpen(false)}
                        className={`flex min-h-[44px] items-center justify-between rounded-lg px-3 text-[15px] transition-colors ${isThemesActive
                          ? 'bg-webzy-primary/[0.07] font-semibold text-webzy-primary'
                          : 'font-medium text-webzy-ink/85 hover:bg-webzy-ink/[0.04] hover:text-webzy-ink'
                          }`}
                      >
                        <span>{copy.nav.occasions}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/pricing"
                        onClick={() => {
                          setCurrentHash('');
                          setMenuOpen(false);
                        }}
                        className={`flex min-h-[44px] items-center justify-between rounded-lg px-3 text-[15px] transition-colors ${isPricingActive
                          ? 'bg-webzy-primary/[0.07] font-semibold text-webzy-primary'
                          : 'font-medium text-webzy-ink/85 hover:bg-webzy-ink/[0.04] hover:text-webzy-ink'
                          }`}
                      >
                        <span>{copy.nav.prices}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/studio"
                        onClick={() => setMenuOpen(false)}
                        className={`flex min-h-[44px] items-center justify-between rounded-lg px-3 text-[15px] transition-colors ${isStudioActive
                          ? 'bg-webzy-primary/[0.07] font-semibold text-webzy-primary'
                          : 'font-medium text-webzy-ink/85 hover:bg-webzy-ink/[0.04] hover:text-webzy-ink'
                          }`}
                      >
                        <span>{copy.nav.studio}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/#how-it-works"
                        onClick={() => {
                          setCurrentHash('#how-it-works');
                          setMenuOpen(false);
                        }}
                        className={`flex min-h-[44px] items-center justify-between rounded-lg px-3 text-[15px] transition-colors ${isHowItWorksActive
                          ? 'bg-webzy-primary/[0.07] font-semibold text-webzy-primary'
                          : 'font-medium text-webzy-ink/85 hover:bg-webzy-ink/[0.04] hover:text-webzy-ink'
                          }`}
                      >
                        <span>{copy.nav.howItWorks}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/#faq"
                        onClick={() => {
                          setCurrentHash('#faq');
                          setMenuOpen(false);
                        }}
                        className={`flex min-h-[44px] items-center justify-between rounded-lg px-3 text-[15px] transition-colors ${isFaqActive
                          ? 'bg-webzy-primary/[0.07] font-semibold text-webzy-primary'
                          : 'font-medium text-webzy-ink/85 hover:bg-webzy-ink/[0.04] hover:text-webzy-ink'
                          }`}
                      >
                        <span>{copy.nav.faq}</span>
                      </Link>
                    </li>
                  </ul>
                </nav>

                <div className="mx-5 border-t border-webzy-ink/[0.07]" />

                {/* Account Links */}
                <div className="px-3 py-4">
                  {isAuthenticated && user ? (
                    <div className="mb-2 flex items-center gap-3 px-3 py-1.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-webzy-ink text-xs font-semibold text-white">
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-webzy-ink leading-snug">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-webzy-ink/50">{user.email}</p>
                      </div>
                    </div>
                  ) : null}

                  <ul className="space-y-0.5">
                    <li>
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className={`flex min-h-[44px] items-center justify-between rounded-lg px-3 text-[15px] transition-colors ${isProfileActive
                          ? 'bg-webzy-primary/[0.07] font-semibold text-webzy-primary'
                          : 'font-medium text-webzy-ink/85 hover:bg-webzy-ink/[0.04] hover:text-webzy-ink'
                          }`}
                      >
                        <span>{site.common.myProfile}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/orders"
                        onClick={() => setMenuOpen(false)}
                        className={`flex min-h-[44px] items-center justify-between rounded-lg px-3 text-[15px] transition-colors ${isOrdersActive
                          ? 'bg-webzy-primary/[0.07] font-semibold text-webzy-primary'
                          : 'font-medium text-webzy-ink/85 hover:bg-webzy-ink/[0.04] hover:text-webzy-ink'
                          }`}
                      >
                        <span>{site.common.myOrders}</span>
                        {ordersCount > 0 ? (
                          <span className="text-xs font-semibold text-webzy-ink/55 font-tabular">
                            {ordersCount}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                    <li>
                      {isAuthenticated && user ? (
                        <button
                          type="button"
                          disabled={signingOut}
                          onClick={() => void handleSignOut()}
                          className="flex min-h-[44px] w-full items-center rounded-lg px-3 text-left text-[15px] font-medium text-webzy-ink/55 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                        >
                          {signingOut ? site.common.signingOut : site.common.signOut}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            openAuthModal({
                              reason:
                                'Sign in to view your orders, saved drafts, and privacy settings.',
                            });
                          }}
                          className="flex min-h-[44px] w-full items-center rounded-lg px-3 text-left text-[15px] font-medium text-webzy-primary transition-colors hover:bg-webzy-primary/[0.06]"
                        >
                          {site.common.signIn}
                        </button>
                      )}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Bar: Primary Action */}
              <div className="shrink-0 border-t border-webzy-ink/[0.07] bg-white px-5 py-4">
                <Link
                  href="/themes"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-webzy-primary text-sm font-semibold text-white transition-opacity hover:opacity-95 active:scale-[0.99]"
                >
                  {copy.nav.makeYours}
                </Link>
              </div>
            </aside>
          </div>,
          document.body
        )
        : null}
    </>
  );
}
