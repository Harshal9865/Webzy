'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { getSiteCopy } from '@webzy/core';
import { useAuth } from '../auth/AuthProvider';
import { useLanguage } from '../shell/LanguageProvider';

export interface StudioCapacityStatus {
  acceptingOrders: boolean;
  remainingSlots: number;
  limit: number;
  activeCount: number;
  paused: boolean;
  capacityMessage: string;
}

interface StudioWaitlistClientProps {
  supportWhatsapp?: string;
  supportEmail?: string;
  capacity?: StudioCapacityStatus;
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
  { id: 'wedding_bespoke', priceHint: '₹1,999+' },
  { id: 'custom_business', priceHint: '₹1,499+' },
];

const DEFAULT_STUDIO_CAPACITY: StudioCapacityStatus = {
  acceptingOrders: true,
  remainingSlots: 8,
  limit: 8,
  activeCount: 0,
  paused: false,
  capacityMessage: 'Custom Made build slots are open.',
};

export function StudioWaitlistClient({
  supportWhatsapp = '+919800000000',
  supportEmail = 'support@webzy.in',
  capacity = DEFAULT_STUDIO_CAPACITY,
}: StudioWaitlistClientProps) {
  const { language } = useLanguage();
  const site = getSiteCopy(language);
  const s = site.studio;
  const { profile, user } = useAuth();
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const focusTimerRef = useRef<number | null>(null);
  const highlightTimerRef = useRef<number | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<StudioCategoryId>('coaching');
  const [formHighlighted, setFormHighlighted] = useState(false);
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
    `Namaste Webzy Custom Made! I want a custom website for: ${activeCategoryCopy.title}.${
      businessName.trim() ? ` Business/Event: ${businessName.trim()}.` : ''
    }${city.trim() ? ` City: ${city.trim()}.` : ''}${name.trim() ? ` Name: ${name.trim()}.` : ''}`,
  )}`;

  // Clean up focus/highlight timers on unmount
  useEffect(() => {
    return () => {
      if (focusTimerRef.current !== null) window.clearTimeout(focusTimerRef.current);
      if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current);
    };
  }, []);

  function scrollToForm() {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleSelectCategory(catId: StudioCategoryId) {
    setSelectedCategory(catId);
    setResult(null);
    setErrorMsg('');
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setFormHighlighted(true);
    if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = window.setTimeout(() => {
      setFormHighlighted(false);
    }, 1400);

    if (capacity.acceptingOrders) {
      if (focusTimerRef.current !== null) window.clearTimeout(focusTimerRef.current);
      focusTimerRef.current = window.setTimeout(() => {
        nameInputRef.current?.focus({ preventScroll: true });
      }, 350);
    }
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
        message: data.message || 'You are on the Webzy Custom Made priority list!',
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-3.5 py-6 sm:px-6 sm:py-14">
      {/* Hero Pitch */}
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-webzy-primary">
          {s.eyebrow}
        </p>
        <h1 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-webzy-ink sm:mt-3 sm:text-4xl lg:text-5xl">
          {s.headline}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-webzy-ink/80 sm:mt-4 sm:text-lg">
          {s.subtitle}
        </p>
        <div className="mt-4 flex justify-center sm:mt-5">
          {capacity.acceptingOrders ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-[11px] font-bold text-emerald-900 sm:px-4 sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden="true" />
              Batch Open · {capacity.remainingSlots} of {capacity.limit} Custom Made slots available
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-[11px] font-bold text-amber-950 sm:px-4 sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-amber-600" aria-hidden="true" />
              {capacity.paused ? 'Custom Made Orders Temporarily Paused' : 'Current Custom Made Batch Full'}
            </span>
          )}
        </div>
      </div>

      {/* 3 Simple Steps — Elderly-Friendly Explanation */}
      <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-9 sm:gap-4">
        {s.steps.map((item) => (
          <div
            key={item.num}
            className="rounded-xl border border-webzy-ink/[0.09] bg-white p-2.5 shadow-xs sm:rounded-2xl sm:p-5"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-webzy-primary text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm">
              {item.num}
            </span>
            <h2 className="mt-2 font-heading text-xs font-bold leading-tight text-webzy-ink sm:mt-3 sm:text-base">
              {item.title}
            </h2>
            <p className="mt-1 text-[10.5px] leading-snug text-webzy-ink/75 sm:text-sm sm:leading-relaxed">
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Focus Verticals Grid — Accessible Buttons with Tactile Hover & Selected State */}
      <div className="mt-7 sm:mt-10">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-heading text-lg font-bold text-webzy-ink sm:text-2xl">
              {s.step1Heading}
            </h2>
            <p className="mt-1 text-xs text-webzy-ink/70 sm:text-sm">{s.step1Subtitle}</p>
          </div>
          <button
            type="button"
            onClick={scrollToForm}
            className="inline-flex min-h-[40px] items-center rounded-full border border-webzy-primary/35 bg-white px-3.5 text-xs font-bold text-webzy-primary transition hover:bg-webzy-primary hover:text-white sm:min-h-[44px] sm:px-4"
          >
            {s.goToForm}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-5">
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
                onClick={() => handleSelectCategory(cat.id)}
                className={`group flex flex-col justify-between rounded-2xl border-2 p-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-webzy-primary/30 sm:p-6 ${
                  isOrphanLast ? 'col-span-2' : ''
                } ${
                  isSelected
                    ? '-translate-y-0.5 border-webzy-primary bg-gradient-to-b from-webzy-primary/[0.045] to-white shadow-lg ring-4 ring-webzy-primary/15'
                    : 'border-webzy-ink/[0.1] bg-white shadow-xs hover:-translate-y-1 hover:border-webzy-primary/45 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] sm:gap-2 sm:text-xs">
                    <span
                      className={`rounded-full px-2 py-0.5 font-bold sm:px-2.5 sm:py-1 ${
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
                            className="h-3.5 w-3.5 text-webzy-primary sm:h-4 sm:w-4"
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

                  <h3 className="mt-2 font-heading text-sm font-bold leading-snug text-webzy-ink sm:mt-3 sm:text-xl">
                    {catCopy.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-webzy-ink/75 sm:line-clamp-none sm:text-sm sm:leading-relaxed">
                    {catCopy.subtitle}
                  </p>
                </div>

                <ul className="mt-2.5 space-y-1 border-t border-webzy-tint/60 pt-2.5 text-[11px] text-webzy-ink/80 sm:mt-4 sm:space-y-2 sm:pt-3.5 sm:text-sm">
                  {catCopy.features.map((feat, featIdx) => (
                    <li
                      key={feat}
                      className={`${
                        featIdx >= 2 && !isOrphanLast ? 'hidden sm:flex' : 'flex'
                      } items-center gap-1.5 sm:gap-2`}
                    >
                      <svg
                        className="h-3.5 w-3.5 shrink-0 text-emerald-600 sm:h-4 sm:w-4"
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

                <div
                  className={`mt-2.5 flex items-center justify-between border-t border-webzy-tint/50 pt-2 text-[11px] font-bold sm:mt-4 sm:pt-3 sm:text-xs ${
                    isSelected ? 'text-webzy-primary' : 'text-webzy-ink/60 group-hover:text-webzy-primary'
                  }`}
                >
                  <span className="sm:hidden">
                    {isSelected ? 'Selected ↓' : 'Select →'}
                  </span>
                  <span className="hidden sm:inline">
                    {isSelected
                      ? 'Selected — Complete Request Form Below ↓'
                      : 'Select & Open Form →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Request / Priority Waitlist Form Section */}
      <div
        ref={formSectionRef}
        className={`mt-8 scroll-mt-24 rounded-2xl border bg-white p-4 shadow-md transition-all duration-300 sm:mt-12 sm:rounded-3xl sm:p-10 ${
          formHighlighted
            ? 'border-webzy-primary ring-4 ring-webzy-primary/20'
            : 'border-webzy-tint'
        }`}
      >
        {!capacity.acceptingOrders ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold text-webzy-ink">
              {capacity.paused
                ? 'Custom Made Intake Temporarily Paused'
                : 'This Custom Made Batch Is Currently Full'}
            </h2>
            <p className="mx-auto mt-2.5 max-w-lg text-sm leading-relaxed text-webzy-ink/80">
              {capacity.capacityMessage ||
                'We cap active Custom Made builds per batch so every business and wedding site receives dedicated design care.'}
            </p>
            <p className="mt-2 text-xs font-semibold text-webzy-ink/60 font-tabular">
              Active builds in current batch: {capacity.activeCount} / {capacity.limit}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/themes"
                className="btn-spring inline-flex min-h-[48px] items-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white shadow-sm hover:opacity-95"
              >
                {s.exploreOccasions}
              </Link>
              <Link
                href="/weddings"
                className="inline-flex min-h-[48px] items-center rounded-full border border-webzy-tint bg-webzy-surface px-6 text-sm font-bold text-webzy-ink hover:border-webzy-primary"
              >
                {s.viewWeddings}
              </Link>
            </div>
          </div>
        ) : result?.ok ? (
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
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-webzy-tint pb-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-webzy-ink sm:text-2xl">
                  {s.step2Heading}
                </h2>
                <p className="mt-1 text-xs text-webzy-ink/75 sm:text-sm">
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <label htmlFor="w-name" className="block text-sm font-bold text-webzy-ink">
                  {s.fields.fullName}
                </label>
                <input
                  ref={nameInputRef}
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
