'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { getSiteCopy } from '@webzy/core';
import { useLanguage } from '../shell/LanguageProvider';

interface CustomRequestClientProps {
  defaultName?: string;
  defaultEmail?: string;
  waHref: string;
  supportEmail: string;
}

const VALID_OCCASIONS = new Set(['wedding', 'birthday', 'anniversary', 'family', 'business', 'other']);
const BUDGET_TIERS = [
  { value: '2999-4999', label: '₹2,999 – ₹4,999', sub: 'Single-page custom design' },
  { value: '5000-9999', label: '₹5,000 – ₹9,999', sub: 'Multi-section + custom art' },
  { value: '10000+', label: '₹10,000+', sub: 'Bespoke portal + custom domain' },
] as const;

export function CustomRequestClient({
  defaultName = '',
  defaultEmail = '',
  waHref,
  supportEmail,
}: CustomRequestClientProps) {
  const { language } = useLanguage();
  const site = getSiteCopy(language);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState('');
  const [occasion, setOccasion] = useState('wedding');
  const [budgetTier, setBudgetTier] = useState('2999-4999');
  const [targetDate, setTargetDate] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [brief, setBrief] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qOccasion = params.get('occasion')?.toLowerCase().trim();
      if (qOccasion && VALID_OCCASIONS.has(qOccasion)) {
        setOccasion(qOccasion);
      }
    } catch {
      // Ignore URL parse issues
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          occasion,
          budgetTier,
          targetDate,
          referenceUrl,
          brief,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; requestId?: string; error?: string };
      if (!res.ok || !data.requestId) {
        throw new Error(data.error || 'Could not submit your request.');
      }
      setSubmittedId(data.requestId);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to send brief right now.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-webzy-primary">
          {site.account.customRequestEyebrow}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-webzy-ink sm:text-4xl">
          {site.account.customRequestTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-webzy-ink/80 sm:text-base">
          {site.account.customRequestSubtitle}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="rounded-3xl border border-webzy-tint bg-webzy-surface/60 p-6 lg:col-span-8">
          {submittedId ? (
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 text-center">
              <p className="text-xs font-semibold text-emerald-700">
                Brief received
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold text-webzy-ink">
                Thank you, {name}!
              </h2>
              <p className="mt-2 text-sm text-webzy-ink/75">
                Your custom request (Ref: <code>#{submittedId.slice(0, 8)}</code>) has been saved. We
                will review it and send a quote to <strong>{email}</strong> within 24 hours.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/themes"
                  className="inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-5 text-xs font-bold text-white"
                >
                  Browse ready-made themes (₹29–₹99)
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="req-name" className="block text-xs font-bold text-webzy-ink">
                    Your name *
                  </label>
                  <input
                    suppressHydrationWarning
                    id="req-name"
                    type="text"
                    required
                    maxLength={80}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Mehta"
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
                  />
                </div>
                <div>
                  <label htmlFor="req-email" className="block text-xs font-bold text-webzy-ink">
                    Email address *
                  </label>
                  <input
                    suppressHydrationWarning
                    id="req-email"
                    type="email"
                    required
                    maxLength={120}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="req-phone" className="block text-xs font-bold text-webzy-ink">
                    WhatsApp / Phone
                  </label>
                  <input
                    suppressHydrationWarning
                    id="req-phone"
                    type="tel"
                    maxLength={20}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98XXXXXXXX"
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
                  />
                </div>
                <div>
                  <label htmlFor="req-occasion" className="block text-xs font-bold text-webzy-ink">
                    Occasion
                  </label>
                  <select
                    suppressHydrationWarning
                    id="req-occasion"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3 text-sm text-webzy-ink"
                  >
                    <option value="wedding">Wedding / Engagement</option>
                    <option value="birthday">Milestone Birthday</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="family">Family Keepsake</option>
                    <option value="business">Business Launch / Campaign</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold text-webzy-ink">
                  Select your budget tier
                </span>
                <div className="mt-1.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {BUDGET_TIERS.map((tier) => {
                    const active = budgetTier === tier.value;
                    return (
                      <button
                        key={tier.value}
                        type="button"
                        onClick={() => setBudgetTier(tier.value)}
                        aria-pressed={active}
                        className={`flex min-h-[54px] flex-col items-start justify-center rounded-2xl border px-3.5 py-2 text-left transition ${
                          active
                            ? 'border-webzy-primary bg-webzy-primary/[0.08] text-webzy-ink ring-1 ring-webzy-primary/30'
                            : 'border-webzy-tint bg-white text-webzy-ink hover:border-webzy-primary/40'
                        }`}
                      >
                        <span className="text-xs font-bold text-webzy-ink">{tier.label}</span>
                        <span className="text-[11px] text-webzy-ink/60">{tier.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="req-date" className="block text-xs font-bold text-webzy-ink">
                    Target live date (optional)
                  </label>
                  <input
                    suppressHydrationWarning
                    id="req-date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
                  />
                </div>
                <div>
                  <label htmlFor="req-ref-url" className="block text-xs font-bold text-webzy-ink">
                    Reference / Inspiration Link (optional)
                  </label>
                  <input
                    suppressHydrationWarning
                    id="req-ref-url"
                    type="url"
                    maxLength={300}
                    value={referenceUrl}
                    onChange={(e) => setReferenceUrl(e.target.value)}
                    placeholder="https://pinterest.com/... or Google Drive link"
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="req-brief" className="block text-xs font-bold text-webzy-ink">
                  Describe your vision *
                </label>
                <textarea
                  suppressHydrationWarning
                  id="req-brief"
                  required
                  rows={5}
                  maxLength={1000}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Tell us about the occasion, language preference, photos/sections needed, or any inspiration..."
                  className="mt-1 w-full rounded-xl border border-webzy-tint bg-white p-3.5 text-sm text-webzy-ink"
                />
                <p className="mt-1 text-[11px] text-webzy-ink/60">{brief.length}/1000 characters</p>
              </div>

              {errorMsg ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900"
                >
                  {errorMsg}
                </div>
              ) : null}

              <button
                suppressHydrationWarning
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting brief...' : 'Submit Custom Request →'}
              </button>
            </form>
          )}
        </div>

        <aside className="space-y-4 rounded-3xl border border-webzy-tint bg-white p-6 shadow-sm lg:col-span-4">
          <h2 className="font-heading text-lg font-bold text-webzy-ink">Prefer chatting directly?</h2>
          <p className="text-xs leading-relaxed text-webzy-ink/75">
            Need a quick answer or want to share voice/reference notes? Message us directly or
            pick a ready-made ₹29–₹99 theme if you are in a hurry.
          </p>
          <div className="flex flex-col gap-2.5">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#15803D] px-5 text-xs font-bold text-white"
            >
              WhatsApp custom brief
            </a>
            <a
              href={`mailto:${supportEmail}?subject=${encodeURIComponent('Webzy Custom Request Brief')}`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-webzy-tint bg-webzy-surface px-5 text-xs font-bold text-webzy-ink"
            >
              Email {supportEmail}
            </a>
            <Link
              href="/themes"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-webzy-tint bg-white px-5 text-xs font-bold text-webzy-primary"
            >
              Browse ready-made themes
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
