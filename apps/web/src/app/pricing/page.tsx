import Link from 'next/link';
import { ADDON_CATALOG, formatInr, getWebzyPublicConfig } from '@webzy/core';

export const revalidate = 300;

const PRICING_TIERS = [
  {
    id: 'ready_made',
    badge: 'Instant Delivery',
    badgeStyle: 'bg-webzy-tint text-webzy-primary',
    isPopular: false,
    title: 'Ready-Made Celebrations',
    subtitle: 'Self-serve interactive cards for birthdays, love notes, apologies, and festivals.',
    priceLabel: '₹29 – ₹99',
    compareLabel: '₹99 – ₹249',
    savingsLabel: 'Save up to ₹150',
    validity: '30 days hosting included',
    features: [
      'Ready in under 3 minutes',
      '1-tap WhatsApp link & QR code',
      'Interactive animations, music & photos',
      'Receiver opens with zero app or login',
      'Free 24-hour edit window after purchase',
    ],
    ctaLabel: 'Browse All Themes →',
    ctaHref: '/themes',
    ctaStyle: 'bg-webzy-primary text-white hover:opacity-95',
  },
  {
    id: 'semi_custom',
    badge: 'Most Popular for Couples',
    badgeStyle: 'bg-rose-100 text-rose-800',
    isPopular: true,
    title: 'Semi-Custom Keepsakes',
    subtitle: 'Couple journeys, wedding timelines, and milestone stories tailored personally by our team.',
    priceLabel: '₹299 – ₹999',
    compareLabel: '₹599 – ₹2,499',
    savingsLabel: 'Save up to ₹1,500',
    validity: '90 days hosting included',
    features: [
      'Everything in Ready-Made',
      'Dedicated layout styling by designer',
      'Couple milestone cards with dates & vows',
      'Up to 6 high-resolution curated photos',
      'Priority WhatsApp concierge support',
    ],
    ctaLabel: 'Explore Wedding & Couple Hub →',
    ctaHref: '/weddings',
    ctaStyle: 'bg-rose-700 text-white hover:bg-rose-800 shadow-md',
  },
  {
    id: 'studio_bespoke',
    badge: 'Opening in 15 Days',
    badgeStyle: 'bg-webzy-surface text-webzy-ink border border-webzy-tint',
    isPopular: false,
    title: 'Webzy Studio (Bespoke)',
    subtitle: 'Scratch-built websites for coaching institutes, clinics, retail stores, and multi-day shaadis.',
    priceLabel: 'From ₹1,499',
    compareLabel: '₹2,999+',
    savingsLabel: 'Early Founder Pricing',
    validity: '180 days hosting & domain support',
    features: [
      'Multi-event wedding or business portal',
      'Venue Google Maps & guest RSVP tracking',
      'Custom domain connection (.com / .in)',
      '15-minute planning call with lead designer',
      'Visitor engagement analytics dashboard',
    ],
    ctaLabel: 'Join 15-Day Priority Waitlist →',
    ctaHref: '/studio',
    ctaStyle: 'bg-webzy-ink text-white hover:bg-black',
  },
] as const;

const OPTIONAL_ADDONS = [
  {
    id: 'pin',
    title: 'Secret PIN Lock',
    badge: 'Privacy & Security',
    price: '+₹9',
    compareAt: '₹19',
    savings: 'Save ₹10',
    description: 'Set a 4-digit secret PIN code so only your recipient can unlock and read the message.',
    highlight: '4-digit passcode lock',
    iconBg: 'bg-indigo-50 border-indigo-200/80 text-indigo-700',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    id: 'video',
    title: 'Status Video Export',
    badge: 'WhatsApp & Instagram',
    price: '+₹19',
    compareAt: '₹49',
    savings: 'Save ₹30',
    description: 'Download an animated HD video keepsake formatted for WhatsApp Status & Instagram Stories.',
    highlight: '1080p 9:16 vertical MP4',
    iconBg: 'bg-rose-50 border-rose-200/80 text-rose-700',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'extend',
    title: 'Extra 90 Days Validity',
    badge: 'Extended Hosting',
    price: '+₹19',
    compareAt: '₹49',
    savings: 'Save ₹30',
    description: 'Extend your link hosting for 3 additional months (giving total 120 days of active online access).',
    highlight: '120 days active link',
    iconBg: 'bg-emerald-50 border-emerald-200/80 text-emerald-700',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
] as const;

export default function PricingPage() {
  const config = getWebzyPublicConfig();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex rounded-full bg-webzy-tint px-3.5 py-1 text-xs font-bold text-webzy-primary">
          Transparent Pricing · GST-Inclusive
        </span>
        <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-webzy-ink sm:text-5xl">
          Simple Plans for Every Indian Celebration
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-webzy-ink/75 sm:text-lg">
          No hidden charges, zero surprise subscription rebills. Every link includes high-speed mobile hosting, 
          instant WhatsApp delivery, and a free 24-hour edit window.
        </p>
      </div>

      {/* 3 Core Pricing Cards */}
      <div className="mt-12 grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
        {PRICING_TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`flex flex-col justify-between rounded-3xl border p-6 transition-all sm:p-8 ${
              tier.isPopular
                ? 'relative border-rose-300 bg-white shadow-xl ring-2 ring-rose-500/20'
                : 'border-webzy-tint bg-white shadow-sm hover:shadow-md'
            }`}
          >
            <div>
              {/* Top Badge & Tier Title */}
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tier.badgeStyle}`}>
                  {tier.badge}
                </span>
                <span className="text-[11px] font-medium text-webzy-ink/50">One-time fee</span>
              </div>

              <h2 className="mt-4 font-heading text-2xl font-bold text-webzy-ink">
                {tier.title}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-webzy-ink/70">
                {tier.subtitle}
              </p>

              {/* Price Stack: Green Active Rate + Muted Strikethrough + Value Saved */}
              <div className="mt-6 border-y border-webzy-tint/60 py-5">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-3xl font-extrabold text-emerald-700">
                    {tier.priceLabel}
                  </span>
                  <span className="text-sm font-medium text-webzy-ink/40 line-through">
                    {tier.compareLabel}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                    {tier.savingsLabel}
                  </span>
                  <span className="text-[11px] text-webzy-ink/60">· {tier.validity}</span>
                </div>
              </div>

              {/* Feature Checklist with Clean SVGs */}
              <ul className="mt-6 space-y-3 text-xs text-webzy-ink/85">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <svg
                      className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom CTA Button */}
            <div className="mt-8 pt-4 border-t border-webzy-tint/60">
              <Link
                href={tier.ctaHref}
                className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-full px-5 text-xs font-bold transition ${tier.ctaStyle}`}
              >
                {tier.ctaLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Optional Add-ons Section */}
      <div className="mt-16 rounded-3xl border border-webzy-tint bg-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-webzy-primary">Customize Your Experience</span>
            <h2 className="mt-1 font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
              Optional Add-Ons
            </h2>
            <p className="mt-1 text-xs text-webzy-ink/70">
              Personalize your celebration link further with these optional extras during checkout.
            </p>
          </div>
          <Link
            href="/themes"
            className="inline-flex min-h-[42px] items-center text-xs font-bold text-webzy-primary hover:underline"
          >
            Browse themes to see add-ons in action →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {OPTIONAL_ADDONS.map((addon) => (
            <div
              key={addon.id}
              className="flex flex-col justify-between rounded-2xl border border-webzy-tint bg-gradient-to-b from-white to-webzy-surface/50 p-5 shadow-xs transition hover:border-webzy-primary/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${addon.iconBg}`}>
                    {addon.icon}
                  </div>
                  <span className="rounded-full bg-webzy-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-webzy-ink/70">
                    {addon.badge}
                  </span>
                </div>

                <h3 className="mt-3.5 font-heading text-base font-bold text-webzy-ink">
                  {addon.title}
                </h3>

                <p className="mt-1.5 text-xs leading-relaxed text-webzy-ink/75">
                  {addon.description}
                </p>

                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-webzy-surface/90 px-2.5 py-1 text-[11px] font-medium text-webzy-ink/80">
                  <svg className="h-3.5 w-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{addon.highlight}</span>
                </div>
              </div>

              <div className="mt-5 border-t border-webzy-tint/70 pt-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading text-lg font-extrabold text-emerald-700">
                      {addon.price}
                    </span>
                    <span className="text-xs font-medium text-webzy-ink/40 line-through">
                      {addon.compareAt}
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {addon.savings}
                  </span>
                </div>
                <p className="mt-1.5 text-[10px] text-webzy-ink/50">
                  Selectable with 1 tap during checkout
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Transparency Guarantee Bar */}
      <div className="mt-12 grid grid-cols-2 gap-4 rounded-3xl border border-webzy-tint bg-webzy-surface/60 p-6 sm:grid-cols-4">
        <div>
          <p className="text-xs font-bold text-webzy-ink">100% Mobile Ready</p>
          <p className="mt-1 text-[11px] text-webzy-ink/70">Loads smoothly on all smartphone browsers and 4G/5G networks.</p>
        </div>
        <div>
          <p className="text-xs font-bold text-webzy-ink">Zero App Download</p>
          <p className="mt-1 text-[11px] text-webzy-ink/70">Opens directly in WhatsApp or browser with no login needed.</p>
        </div>
        <div>
          <p className="text-xs font-bold text-webzy-ink">Free 24h Edit Window</p>
          <p className="mt-1 text-[11px] text-webzy-ink/70">Fix any typo or update photos at no extra charge after publishing.</p>
        </div>
        <div>
          <p className="text-xs font-bold text-webzy-ink">Instant GST Invoice</p>
          <p className="mt-1 text-[11px] text-webzy-ink/70">Clear payment receipt emailed immediately with zero surprise fees.</p>
        </div>
      </div>
    </div>
  );
}
