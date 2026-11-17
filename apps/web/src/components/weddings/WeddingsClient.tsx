'use client';

import Link from 'next/link';
import React from 'react';

const WEDDING_OPTIONS = [
  {
    id: 'our-timeline-01',
    badge: 'Couples Favorite · ₹99',
    title: 'Our Timeline & Wedding Journey',
    desc: 'Take your guests through your story — from the first hello and coffee dates to the engagement ring and shaadi date countdown.',
    features: ['Milestone cards with dates', 'Couple photo gallery (up to 3 photos)', 'Romantic background music', 'Personal message & vows'],
    cta: 'Customize Our Timeline (₹99) →',
    demoUrl: '/themes/our-timeline-01',
    createUrl: '/create/our-timeline-01',
  },
  {
    id: 'will-you-01',
    badge: 'Proposal & Invite · ₹49',
    title: 'Will You Be Mine / Proposal Invite',
    desc: 'The playful, romantic way to ask someone special or invite your close circle to a pre-wedding celebration or intimate dinner.',
    features: ['Interactive "Yes / Of Course" buttons', 'Emotional celebration reveal', 'Ambient piano track', 'Custom note and love letter'],
    cta: 'Customize Proposal Invite (₹49) →',
    demoUrl: '/themes/will-you-01',
    createUrl: '/create/will-you-01',
  },
  {
    id: 'custom-wedding',
    badge: 'Full Shaadi Experience · ₹2,999+',
    title: 'Custom Multi-Day Wedding Website',
    desc: 'Complete bespoke wedding portal built by our designers with multi-event RSVP (Haldi, Mehendi, Sangeet, Shaadi), venue maps, and hotel details.',
    features: ['Haldi, Mehendi, Sangeet & Reception itinerary', 'Guest RSVP & food preference tracking', 'Venue Google Maps & hotel links', 'Custom couple domain (.com / .in)'],
    cta: 'Request Custom Wedding Brief →',
    demoUrl: '/request?occasion=wedding',
    createUrl: '/request?occasion=wedding',
  },
] as const;

export function WeddingsClient() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-200/80 bg-gradient-to-b from-rose-50/80 via-white to-amber-50/40 p-8 text-center shadow-sm sm:p-14">
        <span className="inline-flex items-center rounded-full border border-rose-200 bg-white px-4 py-1.5 text-xs font-bold text-rose-800 shadow-xs">
          Webzy Weddings &amp; Couple Celebrations
        </span>
        <h1 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-webzy-ink sm:text-5xl">
          Beautiful Wedding Links &amp; Invites for Modern Indian Couples
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-webzy-ink/75 sm:text-lg">
          Ditch boring PDF cards. Send a living, interactive celebration website that tells your story, shares venue directions, and collects warm blessings over WhatsApp.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/create/our-timeline-01"
            className="inline-flex min-h-[50px] items-center rounded-full bg-rose-700 px-8 text-sm font-bold text-white shadow-md transition hover:bg-rose-800"
          >
            Create Couple Timeline (₹99) →
          </Link>
          <Link
            href="/request?occasion=wedding"
            className="inline-flex min-h-[50px] items-center rounded-full border border-rose-300 bg-white px-7 text-sm font-bold text-rose-900 shadow-xs transition hover:bg-rose-50"
          >
            Request Custom Shaadi Site →
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mt-3 font-heading text-base font-bold text-webzy-ink">1-Tap WhatsApp Sharing</h3>
          <p className="mt-1 text-xs text-webzy-ink/70">
            Open directly in any mobile browser without needing app downloads. Beautiful OpenGraph cards show bride &amp; groom photo.
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="mt-3 font-heading text-base font-bold text-webzy-ink">Venue Maps &amp; Countdown</h3>
          <p className="mt-1 text-xs text-webzy-ink/70">
            Guests tap once to open Google Maps navigation to your banquet or resort, with a live countdown to the muhurat.
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mt-3 font-heading text-base font-bold text-webzy-ink">Guest RSVPs &amp; Blessings</h3>
          <p className="mt-1 text-xs text-webzy-ink/70">
            Collect personalized wishes and responses from guests directly into your private dashboard in real-time.
          </p>
        </div>
      </div>

      {/* Wedding Packages & Themes */}
      <div className="mt-14">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Choose Your Wedding Format</span>
          <h2 className="mt-1 font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
            From ₹99 Instant Links to Full Multi-Day Portals
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {WEDDING_OPTIONS.map((opt) => (
            <div
              key={opt.id}
              className="flex flex-col justify-between rounded-3xl border border-rose-200/90 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div>
                <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold text-rose-800">
                  {opt.badge}
                </span>
                <h3 className="mt-3 font-heading text-xl font-bold text-webzy-ink">{opt.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-webzy-ink/75">{opt.desc}</p>
                <ul className="mt-5 space-y-2 border-t border-rose-100 pt-4 text-xs text-webzy-ink/80">
                  {opt.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <svg className="h-3.5 w-3.5 shrink-0 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-col gap-2 pt-4">
                <Link
                  href={opt.createUrl}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-rose-700 px-4 text-xs font-bold text-white shadow-xs transition hover:bg-rose-800"
                >
                  {opt.cta}
                </Link>
                {opt.demoUrl.startsWith('/themes/') ? (
                  <Link
                    href={opt.demoUrl}
                    className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-rose-200 bg-rose-50/50 text-xs font-semibold text-rose-900 transition hover:bg-rose-100"
                  >
                    View Interactive Demo →
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ or Cross Link to other occasions */}
      <div className="mt-14 rounded-3xl border border-webzy-tint bg-webzy-surface/50 p-8 text-center">
        <h3 className="font-heading text-lg font-bold text-webzy-ink">
          Also planning for Birthdays, Milestones, or Festivals?
        </h3>
        <p className="mt-1 text-xs text-webzy-ink/75">
          Explore our complete collection of ready-made occasion themes starting at ₹29.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/themes"
            className="inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-6 text-xs font-bold text-white shadow-sm"
          >
            All Themes & Occasions →
          </Link>
          <Link
            href="/studio"
            className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-white px-6 text-xs font-bold text-webzy-ink"
          >
            Business &amp; Custom Studio (15 Days) →
          </Link>
        </div>
      </div>
    </div>
  );
}
