import Link from 'next/link';
import React from 'react';
import { getWebzyPublicConfig } from '@webzy/core';

interface LegalDraftShellProps {
  title: string;
  badge?: string;
  draftVersion?: string;
  children: React.ReactNode;
}

const LEGAL_NAV_LINKS = [
  { href: '/terms', label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Notice' },
  { href: '/refund', label: 'Refund & Cancellation' },
  { href: '/shipping', label: 'Digital Delivery' },
  { href: '/content-policy', label: 'Content & Safety' },
  { href: '/contact', label: 'Grievance & Contact' },
  { href: '/takedown', label: 'Report / Takedown' },
] as const;

export function LegalDraftShell({
  title,
  badge = 'Effective 2026',
  draftVersion,
  children,
}: LegalDraftShellProps) {
  const config = getWebzyPublicConfig();
  const displayBadge = draftVersion || badge;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {displayBadge ? (
        <span className="inline-flex rounded-full border border-webzy-tint bg-webzy-surface/80 px-3 py-1 text-[11px] font-semibold text-webzy-ink/75">
          {displayBadge}
        </span>
      ) : null}
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-webzy-ink sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-xs leading-relaxed text-webzy-ink/65">
        Legal Operator: <strong className="text-webzy-ink/85">{config.business.name}</strong> (
        {config.business.address}) · Support: {config.business.supportEmail} · Grievance Officer:{' '}
        {config.business.grievanceName} ({config.business.grievanceEmail})
      </p>

      <div className="mt-6 space-y-5 rounded-3xl border border-webzy-tint bg-webzy-surface/40 p-6 text-sm leading-relaxed text-webzy-ink/85 sm:p-8">
        {children}
      </div>

      <nav
        aria-label="Legal policies"
        className="mt-6 flex flex-wrap items-center gap-2 border-t border-webzy-tint/70 pt-5"
      >
        {LEGAL_NAV_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex min-h-[38px] items-center rounded-full border border-webzy-tint bg-white px-3.5 text-xs font-semibold text-webzy-ink/80 transition hover:border-webzy-primary hover:text-webzy-primary"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-4">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center text-sm font-bold text-webzy-primary hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </article>
  );
}
