'use client';

import Link from 'next/link';
import React from 'react';
import { getSiteCopy, getStorefrontCopy, WebzyPublicConfig } from '@webzy/core';
import { openCookieSettingsModal } from '../../lib/cookieConsent';
import { useLanguage } from './LanguageProvider';

interface SiteFooterProps {
  config: WebzyPublicConfig;
}

export function SiteFooter({ config }: SiteFooterProps) {
  const { language } = useLanguage();
  const copy = getStorefrontCopy(language);
  const site = getSiteCopy(language);

  return (
    <footer className="border-t border-webzy-tint bg-webzy-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-start">
          <div className="md:col-span-5">
            <p className="font-heading text-xl font-bold text-webzy-ink">
              {config.business.name} · <span className="text-webzy-primary">{copy.brandTagline}</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-webzy-ink/70">
              {config.business.address} · Support hours: {config.business.supportHours}
            </p>
            <p className="mt-2 text-[11px] font-medium text-webzy-ink/60">
              {site.home.instantDeliveryNote}
            </p>
          </div>

          <nav
            aria-label="Footer legal navigation"
            className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-medium text-webzy-ink/80 sm:grid-cols-3 md:col-span-7 md:flex md:flex-wrap md:justify-end md:gap-x-6 md:gap-y-2"
          >
            <Link href="/terms" className="inline-flex min-h-[44px] items-center hover:text-webzy-primary">
              {copy.footer.terms}
            </Link>
            <Link href="/privacy" className="inline-flex min-h-[44px] items-center hover:text-webzy-primary">
              {copy.footer.privacy}
            </Link>
            <Link href="/refund" className="inline-flex min-h-[44px] items-center hover:text-webzy-primary">
              {copy.footer.refund}
            </Link>
            <Link href="/shipping" className="inline-flex min-h-[44px] items-center hover:text-webzy-primary">
              Delivery Policy
            </Link>
            <Link
              href="/content-policy"
              className="inline-flex min-h-[44px] items-center hover:text-webzy-primary"
            >
              {copy.footer.contentPolicy}
            </Link>
            <Link
              href="/takedown"
              className="inline-flex min-h-[44px] items-center hover:text-webzy-primary"
            >
              {copy.footer.takedown}
            </Link>
            <Link href="/contact" className="inline-flex min-h-[44px] items-center hover:text-webzy-primary">
              {copy.footer.contact}
            </Link>
          </nav>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-webzy-tint pt-4 text-xs text-webzy-ink/60">
          <span>
            Grievance contact: {config.business.grievanceName} ({config.business.grievanceEmail}) · All
            prices shown are GST-inclusive.
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/pricing" className="inline-flex min-h-[44px] items-center text-[11px] font-semibold text-webzy-ink/65 hover:text-webzy-primary">
              {copy.nav.prices}
            </Link>
            <Link href="/studio" className="inline-flex min-h-[44px] items-center text-[11px] font-semibold text-webzy-ink/65 hover:text-webzy-primary">
              {copy.nav.studio}
            </Link>
            <button
              type="button"
              onClick={openCookieSettingsModal}
              className="inline-flex min-h-[44px] items-center text-[11px] font-semibold text-webzy-ink/65 hover:text-webzy-primary"
            >
              Cookie Preferences
            </button>
            {config.appEnv !== 'production' ? (
              <Link href="/admin" className="inline-flex min-h-[44px] items-center text-[11px] font-semibold text-webzy-ink/60 hover:text-webzy-primary">
                Admin Console
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
