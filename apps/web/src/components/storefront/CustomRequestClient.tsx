'use client';

import Link from 'next/link';
import React, { useState } from 'react';

interface CustomRequestClientProps {
  defaultName?: string;
  defaultEmail?: string;
  waHref: string;
  supportEmail: string;
}

export function CustomRequestClient({
  defaultName = '',
  defaultEmail = '',
  waHref,
  supportEmail,
}: CustomRequestClientProps) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState('');
  const [occasion, setOccasion] = useState('wedding');
  const [budgetTier, setBudgetTier] = useState('2999-4999');
  const [targetDate, setTargetDate] = useState('');
  const [brief, setBrief] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
          Custom & Semi-Custom Studio Requests
        </span>
        <h1 className="mt-3 font-heading text-3xl font-bold text-webzy-ink sm:text-4xl">
          Need something built specially for you?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-webzy-ink/80 sm:text-base">
          Share your brief for wedding invites, milestone timelines, or brand launches. Our founder
          replies within 24 hours by email or a quick 15-minute call (custom builds start at ₹2,999+
          with 50% advance after quote approval).
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="rounded-3xl border border-webzy-tint bg-webzy-surface/60 p-6 lg:col-span-8">
          {submittedId ? (
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 text-center">
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
                Brief Received
              </span>
              <h2 className="mt-3 font-heading text-2xl font-bold text-webzy-ink">
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
                <div>
                  <label htmlFor="req-budget" className="block text-xs font-bold text-webzy-ink">
                    Budget range
                  </label>
                  <select
                    suppressHydrationWarning
                    id="req-budget"
                    value={budgetTier}
                    onChange={(e) => setBudgetTier(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3 text-sm text-webzy-ink"
                  >
                    <option value="2999-4999">₹2,999 – ₹4,999</option>
                    <option value="5000-9999">₹5,000 – ₹9,999</option>
                    <option value="10000+">₹10,000+</option>
                  </select>
                </div>
              </div>

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
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink sm:max-w-xs"
                />
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
