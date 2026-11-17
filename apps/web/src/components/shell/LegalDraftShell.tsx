import Link from 'next/link';
import React from 'react';
import { getWebzyPublicConfig } from '@webzy/core';

interface LegalDraftShellProps {
  title: string;
  draftVersion?: string;
  children: React.ReactNode;
}

export function LegalDraftShell({
  title,
  draftVersion = 'DRAFT v0.1 (Pending legal review)',
  children,
}: LegalDraftShellProps) {
  const config = getWebzyPublicConfig();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
        {draftVersion}
      </span>
      <h1 className="mt-3 font-heading text-3xl font-bold text-webzy-ink sm:text-4xl">{title}</h1>
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
