'use client';

import Link from 'next/link';
import React, { useState } from 'react';

const CATEGORIES = [
  {
    id: 'coaching',
    badge: 'Education',
    title: 'Coaching & Institutes',
    subtitle: 'Batches, demo lecture booking, faculty bios & fee inquiries',
    features: ['Course curriculum showcase', 'Direct WhatsApp admission button', 'Teacher & faculty credentials', 'Study material downloads'],
  },
  {
    id: 'medical',
    badge: 'Healthcare',
    title: 'Doctors & Clinics',
    subtitle: 'OPD timings, clinic location maps & 1-tap WhatsApp appointments',
    features: ['Doctor profile & specializations', 'Clinic hours & live directions', 'Patient testimonials & FAQs', 'WhatsApp consultation link'],
  },
  {
    id: 'ecommerce',
    badge: 'Retail',
    title: 'E-Commerce & Boutiques',
    subtitle: 'Product catalog, Razorpay/UPI checkout & order notifications',
    features: ['High-speed product catalog', 'Mobile UPI & card checkout', 'Order tracking & WhatsApp ping', 'Zero commission on your sales'],
  },
  {
    id: 'custom_business',
    badge: 'Services',
    title: 'Local Services & Other',
    subtitle: 'Gyms, salons, real estate, consultants & custom brand sites',
    features: ['Custom design tailored to brand', 'High-converting lead generation form', 'Google Maps & reviews integration', 'Blazing fast mobile performance'],
  },
] as const;

export function StudioWaitlistClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('coaching');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; queuePosition?: number; message?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          businessName,
          email,
          phone,
          city,
          category: selectedCategory,
          notes,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        queuePosition?: number;
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || 'Could not join waitlist. Please retry.');
      }

      setResult({
        ok: true,
        queuePosition: data.queuePosition,
        message: data.message || 'You are on the priority waitlist!',
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Hero Badge & Pitch */}
      <div className="text-center">
        <span className="inline-flex items-center rounded-full border border-webzy-tint bg-webzy-surface px-4 py-1 text-xs font-bold text-webzy-primary">
          Opening in 15 Days · Early Founder Waitlist
        </span>
        <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-webzy-ink sm:text-5xl">
          Webzy Studio for Businesses
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-webzy-ink/80 sm:text-lg">
          We are engineering scratch-built, high-speed custom websites specifically tailored for coaching centers,
          doctors, e-commerce stores, and local businesses in India.
        </p>
      </div>

      {/* Focus Verticals Grid */}
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`cursor-pointer rounded-3xl border p-6 transition-all ${
                isSelected
                  ? 'border-webzy-primary bg-white shadow-lg ring-2 ring-webzy-primary/30'
                  : 'border-webzy-tint bg-white/70 hover:border-webzy-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-webzy-surface px-2.5 py-0.5 text-xs font-bold text-webzy-ink/80 border border-webzy-tint">
                  {cat.badge}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isSelected ? 'bg-webzy-primary text-white' : 'bg-webzy-surface text-webzy-ink/60'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </span>
              </div>
              <h2 className="mt-3 font-heading text-xl font-bold text-webzy-ink">{cat.title}</h2>
              <p className="mt-1 text-xs text-webzy-ink/70">{cat.subtitle}</p>
              <ul className="mt-4 space-y-1.5 border-t border-webzy-tint/60 pt-3 text-xs text-webzy-ink/80">
                {cat.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <svg className="h-3.5 w-3.5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Waitlist Form Section */}
      <div className="mt-12 rounded-3xl border border-webzy-tint bg-white p-6 shadow-md sm:p-10">
        {result?.ok ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold text-webzy-ink">
              Welcome to the Webzy Studio Priority Queue!
            </h2>
            {result.queuePosition ? (
              <p className="mt-2 text-sm font-semibold text-webzy-primary">
                Your Priority Queue Number: #{result.queuePosition}
              </p>
            ) : null}
            <p className="mx-auto mt-3 max-w-lg text-sm text-webzy-ink/75">
              {result.message} When Webzy Studio opens in 15 days, waitlist members receive guaranteed priority delivery and early founder pricing.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/themes"
                className="inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-6 text-xs font-bold text-white shadow-sm"
              >
                Browse ready-made celebration links →
              </Link>
              <Link
                href="/weddings"
                className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-webzy-surface px-6 text-xs font-bold text-webzy-ink"
              >
                View Wedding Showcase →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-webzy-tint pb-4">
              <h2 className="font-heading text-2xl font-bold text-webzy-ink">
                Join the 15-Day Priority Waitlist
              </h2>
              <p className="mt-1 text-xs text-webzy-ink/70">
                Lock in early-access onboarding and special founder rates when custom scratch builds launch.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="w-name" className="block text-xs font-bold text-webzy-ink">
                  Your name *
                </label>
                <input
                  suppressHydrationWarning
                  id="w-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sharma / Rohit Kumar"
                  className="mt-1 min-h-[46px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-xs font-medium text-webzy-ink outline-none focus:border-webzy-primary"
                />
              </div>

              <div>
                <label htmlFor="w-bizname" className="block text-xs font-bold text-webzy-ink">
                  Business / Institute Name
                </label>
                <input
                  suppressHydrationWarning
                  id="w-bizname"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex IIT Academy / Smile Dental Care"
                  className="mt-1 min-h-[46px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-xs font-medium text-webzy-ink outline-none focus:border-webzy-primary"
                />
              </div>

              <div>
                <label htmlFor="w-email" className="block text-xs font-bold text-webzy-ink">
                  Email address *
                </label>
                <input
                  suppressHydrationWarning
                  id="w-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="mt-1 min-h-[46px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-xs font-medium text-webzy-ink outline-none focus:border-webzy-primary"
                />
              </div>

              <div>
                <label htmlFor="w-phone" className="block text-xs font-bold text-webzy-ink">
                  WhatsApp / Phone (optional)
                </label>
                <input
                  suppressHydrationWarning
                  id="w-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXXXXXXX"
                  className="mt-1 min-h-[46px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-xs font-medium text-webzy-ink outline-none focus:border-webzy-primary"
                />
              </div>

              <div>
                <label htmlFor="w-city" className="block text-xs font-bold text-webzy-ink">
                  City
                </label>
                <input
                  suppressHydrationWarning
                  id="w-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune, Indore, Delhi, Patna"
                  className="mt-1 min-h-[46px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-xs font-medium text-webzy-ink outline-none focus:border-webzy-primary"
                />
              </div>

              <div>
                <label htmlFor="w-cat" className="block text-xs font-bold text-webzy-ink">
                  Category
                </label>
                <select
                  suppressHydrationWarning
                  id="w-cat"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 min-h-[46px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-xs font-medium text-webzy-ink outline-none focus:border-webzy-primary"
                >
                  <option value="coaching">Coaching & Education</option>
                  <option value="medical">Medical & Clinics</option>
                  <option value="ecommerce">E-Commerce & Retail</option>
                  <option value="custom_business">Local Services & Brand</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="w-notes" className="block text-xs font-bold text-webzy-ink">
                What key features do you need? (Optional)
              </label>
              <textarea
                suppressHydrationWarning
                id="w-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Need student login portal and online fee payment, or WhatsApp booking for patients..."
                className="mt-1 w-full rounded-xl border border-webzy-tint bg-white p-3 text-xs font-medium text-webzy-ink outline-none focus:border-webzy-primary"
              />
            </div>

            {errorMsg ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900"
              >
                {errorMsg}
              </div>
            ) : null}

            <button
              suppressHydrationWarning
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-webzy-primary px-8 text-sm font-bold text-white shadow-md transition hover:opacity-95 disabled:opacity-50"
            >
              {submitting ? 'Reserving your priority position...' : 'Join 15-Day Priority Waitlist →'}
            </button>
          </form>
        )}
      </div>

      {/* Note about Current Active Ready-Made Offerings */}
      <div className="mt-10 rounded-2xl border border-webzy-tint bg-webzy-surface/60 p-6 text-center">
        <h3 className="font-heading text-base font-bold text-webzy-ink">
          Looking for instant celebration websites right now?
        </h3>
        <p className="mt-1 text-xs text-webzy-ink/75">
          Our ready-made themes for Weddings, Birthdays, Anniversaries, and Festivals are live right now starting at ₹29.
        </p>
        <div className="mt-3 flex justify-center gap-3">
          <Link href="/themes" className="text-xs font-bold text-webzy-primary hover:underline">
            Explore ready-made themes →
          </Link>
          <span className="text-webzy-tint">•</span>
          <Link href="/weddings" className="text-xs font-bold text-webzy-primary hover:underline">
            View Wedding Invites →
          </Link>
        </div>
      </div>
    </div>
  );
}
