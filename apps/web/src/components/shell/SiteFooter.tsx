'use client';

import Link from 'next/link';
import React from 'react';
import { getStorefrontCopy, WebzyPublicConfig } from '@webzy/core';
import { useLanguage } from './LanguageProvider';

interface SiteFooterProps {
  config: WebzyPublicConfig;
}

export function SiteFooter({ config }: SiteFooterProps) {
  const { language } = useLanguage();
  const copy = getStorefrontCopy(language);

  return (
    <footer className="border-t border-webzy-tint bg-webzy-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="max-w-sm">
            <p className="font-heading text-xl font-bold text-webzy-ink">
              {config.business.name} · <span className="text-webzy-primary">{copy.brandTagline}</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-webzy-ink/70">
              {config.business.address} · Support hours: {config.business.supportHours}
            </p>
            <p className="mt-2 text-[11px] font-medium text-webzy-ink/60">
              Instant delivery over WhatsApp · Transparent one-time pricing
            </p>
          </div>

          <nav
            aria-label="Footer legal navigation"
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-webzy-ink/80"
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

        <div className="mt-6 border-t border-webzy-tint pt-4 text-xs text-webzy-ink/60">
          Grievance contact: {config.business.grievanceName} ({config.business.grievanceEmail}) · All
          prices shown are GST-inclusive.
        </div>
      </div>
    </footer>
  );
}
