import Link from 'next/link';
import React from 'react';
import { getWebzyPublicConfig } from '@webzy/core';

interface LegalDraftShellProps {
  title: string;
  badge?: string;
  draftVersion?: string; // backwards compatibility
  children: React.ReactNode;
}

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
        <p className="text-xs font-medium text-webzy-ink/55">
          {displayBadge}
        </p>
      ) : null}
      <h1 className="mt-2 font-heading text-3xl font-bold text-webzy-ink sm:text-4xl">{title}</h1>
      <p className="mt-2 text-xs text-webzy-ink/60">
        Operator: {config.business.name} ({config.business.address}) · Support:{' '}
        {config.business.supportEmail}
      </p>

      <div className="mt-6 space-y-4 rounded-3xl border border-webzy-tint bg-webzy-surface/40 p-6 text-sm leading-relaxed text-webzy-ink/85">
        {children}
      </div>

      <div className="mt-6">
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
