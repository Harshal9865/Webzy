'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { getSiteCopy } from '@webzy/core';
import { useAuth } from '../auth/AuthProvider';
import { useLanguage } from '../shell/LanguageProvider';

interface StudioWaitlistClientProps {
  supportWhatsapp?: string;
  supportEmail?: string;
}

type StudioCategoryId =
  | 'coaching'
  | 'medical'
  | 'ecommerce'
  | 'wedding_bespoke'
  | 'custom_business';

const CATEGORY_META: readonly { id: StudioCategoryId; priceHint: string }[] = [
  { id: 'coaching', priceHint: '₹1,499+' },
  { id: 'medical', priceHint: '₹1,499+' },
  { id: 'ecommerce', priceHint: '₹2,499+' },
  { id: 'wedding_bespoke', priceHint: '₹2,999+' },
  { id: 'custom_business', priceHint: '₹1,499+' },
];

export function StudioWaitlistClient({
  supportWhatsapp = '+919800000000',
  supportEmail = 'support@webzy.in',
}: StudioWaitlistClientProps) {
  const { language } = useLanguage();
  const site = getSiteCopy(language);
  const s = site.studio;
  const { profile, user } = useAuth();
  const formSectionRef = useRef<HTMLDivElement | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<StudioCategoryId>('coaching');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    queuePosition?: number;
    message?: string;
    savedLocally?: boolean;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill signed-in details for effortless UX
  useEffect(() => {
    if (profile?.full_name) {
      setName((prev) => (prev.trim() ? prev : profile.full_name || ''));
    }
    if (user?.email) {
      setEmail((prev) => (prev.trim() ? prev : user.email || ''));
    }
    if (profile?.phone) {
      setPhone((prev) => (prev.trim() ? prev : profile.phone || ''));
    }
  }, [profile, user]);

  const activeCategoryMeta =
    CATEGORY_META.find((c) => c.id === selectedCategory) ?? CATEGORY_META[0];
  const activeCategoryCopy = s.categories[activeCategoryMeta.id];

  const cleanWaDigits = supportWhatsapp.replace(/\D/g, '') || '919800000000';
  const directWhatsappHref = `https://wa.me/${cleanWaDigits}?text=${encodeURIComponent(
    `Namaste Webzy Studio! I want a custom website for: ${activeCategoryCopy.title}.${
      businessName.trim() ? ` Business/Event: ${businessName.trim()}.` : ''
    }${city.trim() ? ` City: ${city.trim()}.` : ''}${name.trim() ? ` Name: ${name.trim()}.` : ''}`,
  )}`;

  function scrollToForm() {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const payload = {
      name: name.trim(),
      businessName: businessName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      category: selectedCategory,
      notes: notes.trim(),
    };

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        queuePosition?: number;
        message?: string;
        error?: string;
      };

      if (res.status === 503) {
        try {
          window.localStorage.setItem(
            'webzy_studio_last_request',
            JSON.stringify({ ...payload, submittedAt: new Date().toISOString() }),
          );
        } catch {
          // Ignore storage errors
        }
        setResult({
          ok: true,
          savedLocally: true,
          message:
            'Your request details are saved! You can also tap the green WhatsApp button below to send your details to our team immediately.',
        });
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Could not submit request. Please check your details and retry.');
      }

      setResult({
        ok: true,
        queuePosition: data.queuePosition,
        message: data.message || 'You are on the Webzy Studio priority list!',
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Hero Pitch */}
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-webzy-primary">
          {s.eyebrow}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-webzy-ink sm:text-4xl lg:text-5xl">
          {s.headline}
        </h1>
        <p className="mx-auto mt-3.5 max-w-2xl text-sm leading-relaxed text-webzy-ink/80 sm:mt-4 sm:text-lg">
          {s.subtitle}
        </p>
      </div>

      {/* 3 Simple Steps — Elderly-Friendly Explanation */}
      <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {s.steps.map((item) => (
          <div
            key={item.num}
            className="rounded-2xl border border-webzy-ink/[0.09] bg-white p-5 shadow-xs"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-webzy-primary text-sm font-bold text-white">
              {item.num}
            </span>
            <h2 className="mt-3 font-heading text-base font-bold text-webzy-ink">{item.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-webzy-ink/75">{item.detail}</p>
          </div>
        ))}
      </div>

      {/* Focus Verticals Grid — Accessible Buttons with Tactile Hover & Selected State */}
      <div className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-heading text-xl font-bold text-webzy-ink sm:text-2xl">
              {s.step1Heading}
            </h2>
            <p className="mt-1 text-sm text-webzy-ink/70">{s.step1Subtitle}</p>
          </div>
          <button
            type="button"
            onClick={scrollToForm}
            className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-primary/35 bg-white px-4 text-xs font-bold text-webzy-primary transition hover:bg-webzy-primary hover:text-white"
          >
            {s.goToForm}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {CATEGORY_META.map((cat, idx) => {
            const catCopy = s.categories[cat.id];
            const isSelected = selectedCategory === cat.id;
            const isOrphanLast =
              idx === CATEGORY_META.length - 1 && CATEGORY_META.length % 2 === 1;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedCategory(cat.id)}
                className={`group flex flex-col justify-between rounded-2xl border-2 p-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-webzy-primary/30 sm:p-6 ${
                  isOrphanLast ? 'sm:col-span-2' : ''
                } ${
                  isSelected
                    ? '-translate-y-0.5 border-webzy-primary bg-gradient-to-b from-webzy-primary/[0.045] to-white shadow-lg ring-4 ring-webzy-primary/15'
                    : 'border-webzy-ink/[0.1] bg-white shadow-xs hover:-translate-y-1 hover:border-webzy-primary/45 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span
                      className={`rounded-full px-2.5 py-1 font-bold ${
                        isSelected
                          ? 'bg-webzy-primary text-white'
                          : 'bg-webzy-surface text-webzy-ink/70'
                      }`}
                    >
                      {catCopy.badge}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        isSelected
                          ? 'text-webzy-primary'
                          : 'text-webzy-ink/50 group-hover:text-webzy-ink/80'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <svg
                            className="h-4 w-4 text-webzy-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{site.common.selected}</span>
                        </>
                      ) : (
                        <span>{cat.priceHint}</span>
                      )}
                    </span>
                  </div>

                  <h3 className="mt-3 font-heading text-xl font-bold text-webzy-ink">
                    {catCopy.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-webzy-ink/75">
                    {catCopy.subtitle}
                  </p>
                </div>

                <ul className="mt-4 space-y-2 border-t border-webzy-tint/60 pt-3.5 text-xs sm:text-sm text-webzy-ink/80">
                  {catCopy.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 shrink-0 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      {/* Request / Priority Waitlist Form Section */}
      <div
        ref={formSectionRef}
        className="mt-12 scroll-mt-24 rounded-3xl border border-webzy-tint bg-white p-6 shadow-md sm:p-10"
      >
        {result?.ok ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold text-webzy-ink">
              {s.successTitlePrefix} {activeCategoryCopy.title}
            </h2>
            {result.queuePosition ? (
              <p className="mt-2 text-sm font-bold text-webzy-primary">
                #{result.queuePosition}
              </p>
            ) : null}
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-webzy-ink/80">
              {result.message}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={directWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-spring inline-flex min-h-[48px] items-center rounded-full bg-[#15803D] px-6 text-sm font-bold text-white shadow-sm hover:bg-[#166534]"
              >
                {s.messageWhatsappNow}
              </a>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="inline-flex min-h-[48px] items-center rounded-full border border-webzy-tint bg-white px-6 text-sm font-bold text-webzy-ink hover:border-webzy-primary"
              >
                {s.submitAnother}
              </button>
              <Link
                href="/weddings"
                className="inline-flex min-h-[48px] items-center rounded-full border border-webzy-tint bg-webzy-surface px-6 text-sm font-bold text-webzy-ink"
              >
                {s.viewWeddings}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-webzy-tint pb-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-webzy-ink">
                  {s.step2Heading}
                </h2>
                <p className="mt-1 text-sm text-webzy-ink/75">
                  {s.selectedPrefix}{' '}
                  <strong className="text-webzy-primary">{activeCategoryCopy.title}</strong> (
                  {activeCategoryMeta.priceHint}). {s.freeCallIncluded}
                </p>
              </div>
              <a
                href={directWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[42px] items-center rounded-full border border-emerald-300 bg-emerald-50 px-4 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100"
              >
                {s.preferWhatsapp}
              </a>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="w-name" className="block text-sm font-bold text-webzy-ink">
                  {s.fields.fullName}
                </label>
                <input
                  suppressHydrationWarning
                  id="w-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sharma / Rohit Kumar"
                  className="mt-1.5 min-h-[50px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm font-medium text-webzy-ink outline-none focus:border-webzy-primary"
                />
              </div>

              <div>
                <label htmlFor="w-bizname" className="block text-sm font-bold text-webzy-ink">
                  {s.fields.businessName}
                </label>
                <input
                  suppressHydrationWarning
                  id="w-bizname"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Academy / Smile Dental / Sharma Wedding"
                  className="mt-1.5 min-h-[50px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm font-medium text-webzy-ink outline-none focus:border-webzy-primary"
                />
              </div>

              <div>
                <label htmlFor="w-email" className="block text-sm font-bold text-webzy-ink">
                  {s.fields.email}
                </label>
                <input
                  suppressHydrationWarning
                  id="w-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="mt-1.5 min-h-[50px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm font-medium text-webzy-ink outline-none focus:border-webzy-primary"
                />
              </div>

              <div>
                <label htmlFor="w-phone" className="block text-sm font-bold text-webzy-ink">
                  {s.fields.phone}
                </label>
                <input
                  suppressHydrationWarning
                  id="w-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXXXXXXX"
                  className="mt-1.5 min-h-[50px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm font-medium text-webzy-ink outline-none focus:border-webzy-primary"
                />
              </div>

              <div>
                <label htmlFor="w-city" className="block text-sm font-bold text-webzy-ink">
                  {s.fields.city}
                </label>
                <input
                  suppressHydrationWarning
                  id="w-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune, Jaipur, Indore, Delhi"
                  className="mt-1.5 min-h-[50px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm font-medium text-webzy-ink outline-none focus:border-webzy-primary"
                />
              </div>

              <div>
                <label htmlFor="w-cat" className="block text-sm font-bold text-webzy-ink">
                  {s.fields.websiteType}
                </label>
                <select
                  suppressHydrationWarning
                  id="w-cat"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as StudioCategoryId)}
                  className="mt-1.5 min-h-[50px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm font-semibold text-webzy-ink outline-none focus:border-webzy-primary"
                >
                  {CATEGORY_META.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {s.categories[cat.id].title} ({cat.priceHint})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="w-notes" className="block text-sm font-bold text-webzy-ink">
                {s.fields.notes}
              </label>
              <textarea
                suppressHydrationWarning
                id="w-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Clinic timings & WhatsApp booking, or custom 3-day wedding website..."
                className="mt-1.5 w-full rounded-xl border border-webzy-tint bg-white p-3.5 text-sm font-medium text-webzy-ink outline-none focus:border-webzy-primary"
              />
            </div>

            {errorMsg ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-900"
              >
                {errorMsg}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                suppressHydrationWarning
                type="submit"
                disabled={submitting}
                className="btn-spring inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full bg-webzy-primary px-8 text-sm font-bold text-white shadow-md transition hover:opacity-95 disabled:opacity-50"
              >
                {submitting ? s.submitBusy : s.submitIdle}
              </button>

              <a
                href={directWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-spring inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#15803D] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#166534]"
              >
                {s.sendWhatsapp}
              </a>
            </div>

            <p className="text-center text-xs text-webzy-ink/60">
              {s.noAdvanceNote}{' '}
              <a href={`mailto:${supportEmail}`} className="font-semibold underline">
                {supportEmail}
              </a>
            </p>
          </form>
        )}
      </div>

      {/* Note about Current Active Ready-Made Offerings */}
      <div className="mt-10 rounded-2xl border border-webzy-tint bg-webzy-surface/60 p-6 text-center">
        <h3 className="font-heading text-lg font-bold text-webzy-ink">{s.readyMadeHeading}</h3>
        <p className="mt-1 text-sm text-webzy-ink/75">{s.readyMadeBody}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <Link
            href="/themes"
            className="inline-flex min-h-[42px] items-center text-sm font-bold text-webzy-primary hover:underline"
          >
            {s.exploreOccasions}
          </Link>
          <Link
            href="/weddings"
            className="inline-flex min-h-[42px] items-center text-sm font-bold text-webzy-primary hover:underline"
          >
            {s.viewWeddings}
          </Link>
        </div>
      </div>
    </div>
  );
}
