'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getSiteCopy } from '@webzy/core';
import { getThemeById, ThemeRenderer } from '@webzy/themes';
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

type DbWaitlistCategoryId =
  | 'coaching'
  | 'medical'
  | 'ecommerce'
  | 'wedding_bespoke'
  | 'custom_business';

type StudioSpecialtyId =
  | 'travel_hospitality'
  | 'cafe_floral'
  | 'creative_3d'
  | 'coaching'
  | 'medical'
  | 'ecommerce'
  | 'wedding_bespoke'
  | 'custom_business';

interface ShowcasePlate {
  id: string;
  plateNumber: string;
  themeId: string;
  specialty: StudioSpecialtyId;
  defaultAesthetic: string;
  discipline: string;
  title: string;
  subtitle: string;
  coverImage: string;
  secondaryImage: string;
  customPrice: string;
  readyPrice: string;
  craftPoints: string[];
  badgeBg: string;
  badgeText: string;
}

const ATELIER_PLATES: readonly ShowcasePlate[] = [
  {
    id: 'plate-travel',
    plateNumber: 'PLATE 01',
    themeId: 'travel-voyage-01',
    specialty: 'travel_hospitality',
    defaultAesthetic: 'ink_reveal',
    discipline: 'Travel · Retreats · Expeditions',
    title: 'Serendipity & World Voyage',
    subtitle:
      'Gallery-white canvas where pointer movement sweeps open a hidden woodblock vista with soaring animated birds, paired with a 6-slice destination accordion, boarding pass capsule, and stamp wall.',
    coverImage: '/templates/travel/serendipity-vista.jpg',
    secondaryImage: '/templates/travel/jaipur-slices.jpg',
    customPrice: '₹2,499+',
    readyPrice: '₹99',
    craftPoints: [
      'Blank-Canvas Ink Reveal + Birds',
      '6-Slice Accordion Hero',
      '3D Flight Boarding Capsule',
      'Postage Stamp Trail',
    ],
    badgeBg: 'bg-[#172844]',
    badgeText: 'text-[#F3D28B]',
  },
  {
    id: 'plate-cafe',
    plateNumber: 'PLATE 02',
    themeId: 'cafe-artisan-01',
    specialty: 'cafe_floral',
    defaultAesthetic: 'fluted_luxury',
    discipline: 'Cafés · Florists · Patisseries',
    title: 'Maison & Roast Atelier',
    subtitle:
      'Two switchable worlds: a color-morphing kinetic coffee carousel with bean parallax, and Maison Rouge vertical fluted-glass optical curtains over crimson florals with a working WhatsApp basket.',
    coverImage: '/templates/cafe/maison-rouge.jpg',
    secondaryImage: '/templates/cafe/rose-cottage.jpg',
    customPrice: '₹2,499+',
    readyPrice: '₹99',
    craftPoints: [
      'Kinetic Pour Carousel',
      'Fluted-Glass Lens Curtain',
      'Working ₹ Cart -> WhatsApp',
      'Scalloped Tasting Menu',
    ],
    badgeBg: 'bg-[#4E0B14]',
    badgeText: 'text-[#FBE6EA]',
  },
  {
    id: 'plate-creative',
    plateNumber: 'PLATE 03',
    themeId: 'creative-voxel-01',
    specialty: 'creative_3d',
    defaultAesthetic: 'particle_3d',
    discipline: '3D Studios · Gaming · Creators',
    title: 'Blockfolio & 3D Kinetic Studio',
    subtitle:
      'Real-time 3D HTML5 Canvas particle rocket responding to touch & cursor, prismatic liquid-glass ART MODE switch, playable 8-bit Voxel XP HUD, and sunlit hills creator scrapbook.',
    coverImage: '/templates/occasions/our-year/cover.jpg',
    secondaryImage: '/templates/creative/creatie-hills.jpg',
    customPrice: '₹2,999+',
    readyPrice: '₹99',
    craftPoints: [
      '360-Particle 3D Rocket Canvas',
      'Prismatic Liquid Art Switch',
      'Playable 8-Bit XP HUD',
      'Glass Dock + Picnic Book',
    ],
    badgeBg: 'bg-[#11162B]',
    badgeText: 'text-[#C7D2FE]',
  },
  {
    id: 'plate-wedding',
    plateNumber: 'PLATE 04',
    themeId: 'wedding-emerald-01',
    specialty: 'wedding_bespoke',
    defaultAesthetic: 'botanical_tuscany',
    discipline: 'Bespoke Destination Weddings',
    title: 'Royal Heritage & Couture Vivah',
    subtitle:
      'Custom illustrated palace or villa gates opening in 3D, multi-day ceremony itinerary, live guest RSVP management, hospitality & travel guide, and 9 Indian language editions.',
    coverImage: '/templates/wedding-emerald-01/art/jharokha-scene-wide.jpg',
    secondaryImage: '/templates/weddings/art/ceremony-rose-wide.jpg',
    customPrice: '₹1,999+',
    readyPrice: '₹499',
    craftPoints: [
      '3D Opening Venue Doors',
      'Multi-Day Ceremony Flow',
      'Live Guest RSVP Ledger',
      'Bespoke Illustrated Art',
    ],
    badgeBg: 'bg-[#213B29]',
    badgeText: 'text-[#F4E3B2]',
  },
];

interface StudioSpecialtyCard {
  id: StudioSpecialtyId;
  dbCategory: DbWaitlistCategoryId;
  indexLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  priceHint: string;
  features: string[];
}

const SPECIALTY_CARDS: readonly StudioSpecialtyCard[] = [
  {
    id: 'travel_hospitality',
    dbCategory: 'custom_business',
    indexLabel: '01',
    badge: 'Travel',
    title: 'Travel Agency & Retreats',
    subtitle: 'Ink-reveal vistas, multi-city itineraries & WhatsApp concierge.',
    priceHint: '₹2,499+',
    features: ['Ink-Reveal & Bird Motion', 'Day-by-Day Itinerary', 'WhatsApp Trip Desk'],
  },
  {
    id: 'cafe_floral',
    dbCategory: 'ecommerce',
    indexLabel: '02',
    badge: 'Café & Floral',
    title: 'Cafés, Florists & Patisserie',
    subtitle: 'Kinetic menu carousel, fluted-glass gallery & live order bag.',
    priceHint: '₹2,499+',
    features: ['Live Menu & Basket', 'Fluted-Glass Editorial', 'Event Booking Form'],
  },
  {
    id: 'creative_3d',
    dbCategory: 'custom_business',
    indexLabel: '03',
    badge: '3D & Motion',
    title: '3D Studio & Portfolios',
    subtitle: 'Interactive 3D particle canvas, liquid UI & playable showcases.',
    priceHint: '₹2,999+',
    features: ['Live 3D Canvas Hero', 'Chromatic Liquid UI', 'Project Case Lightbox'],
  },
  {
    id: 'wedding_bespoke',
    dbCategory: 'wedding_bespoke',
    indexLabel: '04',
    badge: 'Weddings',
    title: 'Bespoke Wedding Suite',
    subtitle: '1-of-1 illustrated venue doors, dress boards & private RSVP.',
    priceHint: '₹1,999+',
    features: ['Custom Venue Art', 'Multi-Event RSVP', 'Concierge Edits'],
  },
  {
    id: 'coaching',
    dbCategory: 'coaching',
    indexLabel: '05',
    badge: 'Education',
    title: 'Coaching & Academies',
    subtitle: 'Batch timetables, topper walls & instant admission inquiries.',
    priceHint: '₹1,499+',
    features: ['Course Timetables', 'Results Showcase', 'WhatsApp Admissions'],
  },
  {
    id: 'medical',
    dbCategory: 'medical',
    indexLabel: '06',
    badge: 'Healthcare',
    title: 'Clinics & Doctors',
    subtitle: 'Doctor credentials, clinic timings & 1-tap appointment booking.',
    priceHint: '₹1,499+',
    features: ['Doctor Profile & Map', 'Treatments Catalog', '1-Tap Appointments'],
  },
  {
    id: 'ecommerce',
    dbCategory: 'ecommerce',
    indexLabel: '07',
    badge: 'Retail & D2C',
    title: 'Boutique & Brand Store',
    subtitle: 'Variant catalog, editorial lookbook & Razorpay or WhatsApp cart.',
    priceHint: '₹2,499+',
    features: ['Swatch & Size Picker', 'Direct Cart Checkout', 'Fast Mobile Lookbook'],
  },
  {
    id: 'custom_business',
    dbCategory: 'custom_business',
    indexLabel: '08',
    badge: 'Bespoke',
    title: 'Any Custom Idea',
    subtitle: 'Architects, salons, launches — crafted from your moodboard.',
    priceHint: '₹1,499+',
    features: ['From Your References', 'Bespoke Animations', 'Custom Domain Ready'],
  },
];

const AESTHETIC_MOODBOARD = [
  { id: 'ink_reveal', label: 'Ink-Reveal & Birds', thumb: '/templates/travel/serendipity-vista.jpg' },
  { id: 'editorial_slices', label: '6-Slice Travel Atlas', thumb: '/templates/travel/jaipur-slices.jpg' },
  { id: 'fluted_luxury', label: 'Fluted Glass Luxury', thumb: '/templates/cafe/maison-rouge.jpg' },
  { id: 'kinetic_cafe', label: 'Kinetic Coffee Bar', thumb: '/templates/cafe/rose-cottage.jpg' },
  { id: 'particle_3d', label: '3D Particle Studio', thumb: '/templates/occasions/our-year/cover.jpg' },
  { id: 'voxel_retro', label: 'Voxel & 8-Bit Quest', thumb: '/templates/occasions/make-them-smile/cover.jpg' },
  { id: 'sky_scrapbook', label: 'Sunlit Sky Scrapbook', thumb: '/templates/creative/creatie-hills.jpg' },
  { id: 'botanical_tuscany', label: 'Royal Heritage Vivah', thumb: '/templates/wedding-emerald-01/art/jharokha-scene-wide.jpg' },
] as const;

const ATELIER_CADENCE = [
  {
    num: '01',
    title: 'Share Vision & Moodboard',
    detail: 'Pick reference aesthetics below or drop your brand notes — zero advance payment needed.',
  },
  {
    num: '02',
    title: 'Interactive Prototype in 48h',
    detail: 'Receive a live clickable mobile & desktop preview with custom motion and art direction.',
  },
  {
    num: '03',
    title: 'Refine & Go Live',
    detail: 'Pay only after approving your build. Launch on your custom domain or instant Webzy URL.',
  },
] as const;

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

  const platesSectionRef = useRef<HTMLElement | null>(null);
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const focusTimerRef = useRef<number | null>(null);
  const highlightTimerRef = useRef<number | null>(null);

  const [mounted, setMounted] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] =
    useState<StudioSpecialtyId>('travel_hospitality');
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>(['ink_reveal']);
  const [formHighlighted, setFormHighlighted] = useState(false);

  // Live Interactive Preview Modal
  const [previewPlate, setPreviewPlate] = useState<ShowcasePlate | null>(null);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  // Form fields
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

  useEffect(() => {
    setMounted(true);
    return () => {
      if (focusTimerRef.current !== null) window.clearTimeout(focusTimerRef.current);
      if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!previewPlate) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewPlate(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [previewPlate]);

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

  const activeSpecialty = useMemo(
    () => SPECIALTY_CARDS.find((c) => c.id === selectedSpecialty) ?? SPECIALTY_CARDS[0],
    [selectedSpecialty],
  );

  const previewManifest = useMemo(
    () => (previewPlate ? getThemeById(previewPlate.themeId, { includeMaanJao: true }) : undefined),
    [previewPlate],
  );

  const selectedAestheticLabels = useMemo(
    () =>
      AESTHETIC_MOODBOARD.filter((a) => selectedAesthetics.includes(a.id)).map((a) => a.label),
    [selectedAesthetics],
  );

  const cleanWaDigits = supportWhatsapp.replace(/\D/g, '') || '919800000000';
  const directWhatsappHref = `https://wa.me/${cleanWaDigits}?text=${encodeURIComponent(
    `Namaste Webzy Atelier! I would like to commission a custom website for: ${activeSpecialty.title}.${
      selectedAestheticLabels.length > 0
        ? ` Aesthetic moodboard: ${selectedAestheticLabels.join(', ')}.`
        : ''
    }${businessName.trim() ? ` Brand/Event: ${businessName.trim()}.` : ''}${
      city.trim() ? ` City: ${city.trim()}.` : ''
    }${name.trim() ? ` Name: ${name.trim()}.` : ''}`,
  )}`;

  function toggleAesthetic(id: string) {
    setSelectedAesthetics((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function handleSelectSpecialty(specialtyId: StudioSpecialtyId, defaultAesthetic?: string) {
    setSelectedSpecialty(specialtyId);
    if (defaultAesthetic) {
      setSelectedAesthetics((prev) =>
        prev.includes(defaultAesthetic) ? prev : [defaultAesthetic, ...prev],
      );
    }
    setResult(null);
    setErrorMsg('');
    setPreviewPlate(null);

    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setFormHighlighted(true);
    if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = window.setTimeout(() => setFormHighlighted(false), 1400);

    if (capacity.acceptingOrders) {
      if (focusTimerRef.current !== null) window.clearTimeout(focusTimerRef.current);
      focusTimerRef.current = window.setTimeout(() => {
        nameInputRef.current?.focus({ preventScroll: true });
      }, 360);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const stylePrefix = [
      `[Specialty: ${activeSpecialty.title}]`,
      selectedAestheticLabels.length > 0
        ? `[Moodboard: ${selectedAestheticLabels.join(', ')}]`
        : '',
    ]
      .filter(Boolean)
      .join(' ');

    const combinedNotes = [stylePrefix, notes.trim()].filter(Boolean).join('\n').slice(0, 1000);

    const payload = {
      name: name.trim(),
      businessName: businessName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      category: activeSpecialty.dbCategory,
      notes: combinedNotes,
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
            'Your custom brief is saved! Tap the WhatsApp button below to connect directly with our design desk.',
        });
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Could not submit request. Please check your details and retry.');
      }

      setResult({
        ok: true,
        queuePosition: data.queuePosition,
        message: data.message || 'You are reserved in the Webzy Custom Made atelier queue!',
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-3.5 pb-14 pt-4 sm:px-6 sm:pb-20 sm:pt-8">
      {/* ================================================================= */}
      {/* ARCHITECTURAL EDITORIAL HERO STAGE (SUNLIT TRAVERTINE ATELIER)     */}
      {/* ================================================================= */}
      <section className="relative overflow-hidden rounded-[24px] border border-[#171315]/10 bg-[#EFE9DF] shadow-[0_28px_70px_-34px_rgba(23,19,21,0.28)] sm:rounded-[32px]">
        {/* Full-bleed Gemini Editorial Atelier Photograph */}
        <div className="relative min-h-[370px] sm:min-h-[470px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/templates/studio/atelier-hero.jpg"
            alt="Webzy Custom Made architectural design desk with linen paper, brass compass and fluted glass"
            className="absolute inset-0 h-full w-full object-cover object-right sm:object-center"
          />

          {/* Soft Warm Ivory Gradient Veil for Razor-Sharp Left Typography on Mobile & Desktop */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[#FAF7F1]/92 via-[#FAF7F1]/82 to-[#FAF7F1]/55 sm:bg-gradient-to-r sm:from-[#FAF7F1]/96 sm:via-[#FAF7F1]/78 sm:to-[#FAF7F1]/12"
          />

          {/* Subtle Inner Architectural Frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-2.5 rounded-[18px] border border-[#171315]/10 sm:inset-4 sm:rounded-[24px]"
          />

          <div className="relative z-10 flex min-h-[370px] flex-col justify-between p-5 sm:min-h-[470px] sm:p-10 lg:p-12">
            {/* Top Editorial Masthead Row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#171315]/12 bg-[#FFFEFC]/85 px-3 py-1 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A67C37]" aria-hidden="true" />
                <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#171315]/80 sm:text-[10.5px]">
                  Webzy Custom Made Atelier
                </span>
              </div>

              {!capacity.acceptingOrders ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-800/25 bg-amber-50/95 px-3 py-1 font-mono text-[10px] font-bold text-amber-950 backdrop-blur-sm">
                  {capacity.paused ? 'Commissions Paused' : 'Currently Booked'}
                </span>
              ) : null}
            </div>

            {/* Main Monumental Serif Headline & Actions */}
            <div className="my-6 max-w-xl sm:my-8">
              <h1 className="font-editorial text-[2.1rem] font-normal leading-[1.04] tracking-[-0.015em] text-[#171315] xs:text-[2.45rem] sm:text-[3.5rem] lg:text-[4rem]">
                Websites shaped like{' '}
                <span className="italic text-[#9F184B]">architecture</span>, built to be felt.
              </h1>

              <p className="mt-3 max-w-lg font-sans text-xs leading-relaxed text-[#171315]/78 sm:mt-4 sm:text-[15px]">
                From mouse-hover ink-reveal travel sites with flying birds to fluted-glass café
                flagships and interactive 3D studios — test our live plates below, then commission
                one tailored around your brand.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-7">
                <button
                  type="button"
                  onClick={() =>
                    platesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  className="btn-spring inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#171315] px-5 text-xs font-bold text-[#FAF7F1] shadow-sm transition hover:bg-[#2A2226] sm:px-6 sm:text-sm"
                >
                  Explore Live Plates ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  className="btn-spring inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#171315]/25 bg-[#FFFEFC]/90 px-5 text-xs font-bold text-[#171315] backdrop-blur-sm transition hover:border-[#9F184B] hover:text-[#9F184B] sm:px-6 sm:text-sm"
                >
                  Commission a Build →
                </button>
              </div>
            </div>

            {/* Bottom Micro Index Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#171315]/10 pt-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#171315]/65 sm:text-[10px]">
              <span>Starts at ₹1,499 · Zero Advance Until Preview Approved</span>
              <span className="hidden sm:inline">48-Hour Interactive Prototype · Mobile First</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* CURATED INTERACTIVE ATELIER PLATES (PLAYABLE LIVE SHOWCASE)        */}
      {/* ================================================================= */}
      <section ref={platesSectionRef} className="mt-10 scroll-mt-24 sm:mt-16">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#171315]/10 pb-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#A67C37]">
              Curated Portfolio · Interactive Demos
            </p>
            <h2 className="mt-1 font-editorial text-2xl font-normal tracking-tight text-[#171315] sm:text-4xl">
              Built to be touched, hovered &amp; remembered
            </h2>
          </div>
          <Link
            href="/themes"
            className="inline-flex min-h-[38px] items-center rounded-full border border-[#171315]/15 bg-[#FFFEFC] px-4 text-xs font-bold text-[#171315] transition hover:border-[#9F184B] hover:text-[#9F184B]"
          >
            Browse Ready-Made Themes →
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 sm:mt-7 sm:gap-6">
          {ATELIER_PLATES.map((plate) => (
            <article
              key={plate.id}
              className="group flex flex-col overflow-hidden rounded-[24px] border border-[#171315]/10 bg-[#FFFEFC] shadow-[0_14px_40px_-24px_rgba(23,19,21,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_54px_-24px_rgba(23,19,21,0.26)]"
            >
              {/* Plate Top Index Strip */}
              <div className="flex items-center justify-between border-b border-[#171315]/[0.07] px-4 py-2.5 sm:px-5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#A67C37]">
                    {plate.plateNumber}
                  </span>
                  <span className="text-[#171315]/25">·</span>
                  <span className="truncate text-[11px] font-medium text-[#171315]/70">
                    {plate.discipline}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-[11px] font-bold text-[#171315]">
                  {plate.customPrice}
                </span>
              </div>

              {/* Dual Editorial Art Composition */}
              <div className="relative grid h-48 grid-cols-12 gap-1.5 bg-[#EFEAE1] p-2 sm:h-56 sm:p-2.5">
                <button
                  type="button"
                  onClick={() => setPreviewPlate(plate)}
                  aria-label={`Open live preview of ${plate.title}`}
                  className="relative col-span-8 overflow-hidden rounded-[16px] bg-[#161317] text-left"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={plate.coverImage}
                    alt={plate.title}
                    className="h-full w-full scale-[1.06] object-cover transition duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
                  <span
                    className={`absolute bottom-2.5 left-2.5 rounded-full px-2.5 py-1 font-mono text-[9.5px] font-bold uppercase tracking-wider shadow-xs ${plate.badgeBg} ${plate.badgeText}`}
                  >
                    Interactive Live Demo
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewPlate(plate)}
                  aria-label={`Inspect secondary view of ${plate.title}`}
                  className="relative col-span-4 overflow-hidden rounded-[16px] bg-[#161317]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={plate.secondaryImage}
                    alt={`${plate.title} detail`}
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 right-2 rounded-full bg-[#FFFEFC]/95 py-1 text-center text-[10px] font-extrabold text-[#171315] shadow-xs transition group-hover:bg-[#171315] group-hover:text-white">
                    Play Demo
                  </span>
                </button>
              </div>

              {/* Plate Editorial Copy & Actions */}
              <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                <div>
                  <h3 className="font-editorial text-2xl font-normal leading-tight text-[#171315]">
                    {plate.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#171315]/72 sm:text-[13px]">
                    {plate.subtitle}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {plate.craftPoints.map((point) => (
                      <span
                        key={point}
                        className="rounded-full border border-[#171315]/10 bg-[#F7F3EC] px-2.5 py-0.5 text-[10.5px] font-semibold text-[#171315]/80"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#171315]/[0.08] pt-3.5">
                  <button
                    type="button"
                    onClick={() => setPreviewPlate(plate)}
                    className="btn-spring inline-flex min-h-[40px] flex-1 items-center justify-center rounded-full bg-[#171315] px-4 text-xs font-bold text-[#FAF7F1] transition hover:bg-[#2B2327]"
                  >
                    Open Live Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSpecialty(plate.specialty, plate.defaultAesthetic)}
                    className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[#9F184B]/35 bg-[#FDF4F7] px-4 text-xs font-bold text-[#9F184B] transition hover:bg-[#9F184B] hover:text-white"
                  >
                    Commission →
                  </button>
                  <Link
                    href={`/themes/${plate.themeId}`}
                    className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[#171315]/12 bg-white px-3 text-[11px] font-bold text-[#171315]/75 hover:border-[#171315]/40"
                  >
                    {plate.readyPrice} Ready
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* BESPOKE CRAFTSMANSHIP INTERLUDE (FLUTED GLASS & WAX SEAL BANNER)   */}
      {/* ================================================================= */}
      <section className="relative mt-10 overflow-hidden rounded-[24px] border border-[#171315]/15 bg-[#161113] text-[#FAF7F1] shadow-[0_26px_70px_-34px_rgba(22,17,19,0.55)] sm:mt-16 sm:rounded-[30px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/templates/studio/craft-fluted.jpg"
          alt="Fluted architectural glass casting warm light over archival paper and crimson wax seal"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#161113]/85 via-[#161113]/75 to-[#161113]/92 sm:bg-gradient-to-r sm:from-[#161113]/92 sm:via-[#161113]/75 sm:to-[#161113]/55"
        />

        <div className="relative z-10 p-5 sm:p-9 lg:p-11">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#E6C580]">
              How Our Atelier Works
            </p>
            <h2 className="mt-1.5 font-editorial text-2xl font-normal leading-tight text-[#FAF7F1] sm:text-4xl">
              Personal craft, transparent pricing, zero advance risk.
            </h2>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {ATELIER_CADENCE.map((step) => (
              <div
                key={step.num}
                className="rounded-2xl border border-white/12 bg-black/35 p-4 backdrop-blur-md"
              >
                <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#E6C580]">
                  {step.num}
                </span>
                <h3 className="mt-2 font-editorial text-xl font-normal text-white">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-white/75">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* STEP 1: SPECIALTY SELECTOR (COMPACT MOBILE 2-COL / DESKTOP 4-COL) */}
      {/* ================================================================= */}
      <section className="mt-10 sm:mt-16">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#A67C37]">
              Step 01 · Discipline
            </p>
            <h2 className="mt-1 font-editorial text-2xl font-normal text-[#171315] sm:text-3xl">
              What are we building together?
            </h2>
          </div>
          <button
            type="button"
            onClick={() =>
              formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className="inline-flex min-h-[38px] items-center rounded-full border border-[#171315]/15 bg-[#FFFEFC] px-3.5 text-xs font-bold text-[#171315] hover:border-[#9F184B] hover:text-[#9F184B]"
          >
            Jump to Commission Sheet ↓
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
          {SPECIALTY_CARDS.map((cat) => {
            const isSelected = selectedSpecialty === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleSelectSpecialty(cat.id)}
                className={`group flex flex-col justify-between rounded-2xl border p-3 text-left transition-all duration-200 sm:p-4 ${
                  isSelected
                    ? '-translate-y-0.5 border-[#9F184B] bg-[#FFFEFC] shadow-md ring-2 ring-[#9F184B]/15'
                    : 'border-[#171315]/10 bg-[#FFFEFC]/85 hover:-translate-y-0.5 hover:border-[#171315]/30 hover:bg-[#FFFEFC]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    <span className="font-mono font-bold tracking-wider text-[#A67C37]">
                      {cat.indexLabel} · {cat.badge}
                    </span>
                    <span className="font-mono font-bold text-[#171315]">{cat.priceHint}</span>
                  </div>

                  <h3 className="mt-2 font-heading text-xs font-bold leading-snug text-[#171315] sm:text-sm">
                    {cat.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-[#171315]/68 sm:text-xs">
                    {cat.subtitle}
                  </p>
                </div>

                <ul className="mt-2.5 hidden space-y-1 border-t border-[#171315]/[0.07] pt-2 text-[11px] text-[#171315]/75 sm:block">
                  {cat.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-1.5">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-[#A67C37]" />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </section>

      {/* ================================================================= */}
      {/* STEP 2: COMMISSION BRIEF & VISUAL MOODBOARD SHEET                  */}
      {/* ================================================================= */}
      <div
        ref={formSectionRef}
        className={`mt-8 scroll-mt-24 rounded-[24px] border bg-[#FFFEFC] p-4 shadow-[0_20px_50px_-30px_rgba(23,19,21,0.22)] transition-all duration-300 sm:mt-12 sm:rounded-[30px] sm:p-9 ${
          formHighlighted
            ? 'border-[#9F184B] ring-4 ring-[#9F184B]/15'
            : 'border-[#171315]/12'
        }`}
      >
        {!capacity.acceptingOrders ? (
          <div className="py-6 text-center">
            <h2 className="font-editorial text-2xl text-[#171315] sm:text-3xl">
              {capacity.paused
                ? 'Atelier Intake Temporarily Paused'
                : 'Current Atelier Batch Is Full'}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-[#171315]/75 sm:text-sm">
              {capacity.capacityMessage}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              <Link
                href="/themes"
                className="btn-spring inline-flex min-h-[44px] items-center rounded-full bg-[#171315] px-6 text-xs font-bold text-white"
              >
                Explore Ready-Made Products
              </Link>
              <a
                href={directWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center rounded-full bg-[#15803D] px-6 text-xs font-bold text-white"
              >
                Message on WhatsApp
              </a>
            </div>
          </div>
        ) : result?.ok ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-3 font-editorial text-2xl text-[#171315] sm:text-3xl">
              {s.successTitlePrefix} {activeSpecialty.title}
            </h2>
            <p className="mx-auto mt-2.5 max-w-lg text-xs leading-relaxed text-[#171315]/75 sm:text-sm">
              {result.message}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <a
                href={directWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-spring inline-flex min-h-[46px] items-center rounded-full bg-[#15803D] px-6 text-xs font-bold text-white shadow-sm hover:bg-[#166534] sm:text-sm"
              >
                {s.messageWhatsappNow}
              </a>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="inline-flex min-h-[46px] items-center rounded-full border border-[#171315]/15 bg-white px-6 text-xs font-bold text-[#171315] hover:border-[#171315]/40 sm:text-sm"
              >
                {s.submitAnother}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#171315]/10 pb-4">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#A67C37]">
                  Step 02 · Commission Sheet
                </p>
                <h2 className="mt-1 font-editorial text-2xl font-normal text-[#171315] sm:text-3xl">
                  Request your tailored build
                </h2>
                <p className="mt-1 text-xs text-[#171315]/70 sm:text-sm">
                  Selected: <strong className="text-[#9F184B]">{activeSpecialty.title}</strong> (
                  {activeSpecialty.priceHint}) · Free discovery call included.
                </p>
              </div>
              <a
                href={directWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center rounded-full border border-emerald-700/25 bg-emerald-50 px-4 text-xs font-bold text-emerald-950 transition hover:bg-emerald-100"
              >
                {s.preferWhatsapp}
              </a>
            </div>

            {/* Visual Moodboard Reference Pins */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-[#171315] sm:text-sm">
                  Pin Visual References to Your Brief
                </p>
                <span className="font-mono text-[10px] text-[#171315]/55">
                  {selectedAesthetics.length} pinned
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {AESTHETIC_MOODBOARD.map((dir) => {
                  const active = selectedAesthetics.includes(dir.id);
                  return (
                    <button
                      key={dir.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleAesthetic(dir.id)}
                      className={`group flex items-center gap-2 rounded-xl border p-1.5 text-left transition ${
                        active
                          ? 'border-[#9F184B] bg-[#FDF4F7] ring-2 ring-[#9F184B]/15'
                          : 'border-[#171315]/10 bg-[#FAF8F4] hover:border-[#171315]/30'
                      }`}
                    >
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#EAE4D9]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={dir.thumb}
                          alt={dir.label}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="line-clamp-2 text-[10.5px] font-bold leading-tight text-[#171315]">
                        {dir.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <label htmlFor="w-name" className="block text-xs font-bold text-[#171315]">
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
                  placeholder="e.g. Aarav Mehta / Dr. Neha Sharma"
                  className="mt-1 min-h-[46px] w-full rounded-xl border border-[#171315]/15 bg-[#FAF8F4] px-3.5 text-sm font-medium text-[#171315] outline-none transition focus:border-[#9F184B] focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="w-bizname" className="block text-xs font-bold text-[#171315]">
                  {s.fields.businessName}
                </label>
                <input
                  suppressHydrationWarning
                  id="w-bizname"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Serendipity Travels / Maison Roast"
                  className="mt-1 min-h-[46px] w-full rounded-xl border border-[#171315]/15 bg-[#FAF8F4] px-3.5 text-sm font-medium text-[#171315] outline-none transition focus:border-[#9F184B] focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="w-email" className="block text-xs font-bold text-[#171315]">
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
                  className="mt-1 min-h-[46px] w-full rounded-xl border border-[#171315]/15 bg-[#FAF8F4] px-3.5 text-sm font-medium text-[#171315] outline-none transition focus:border-[#9F184B] focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="w-phone" className="block text-xs font-bold text-[#171315]">
                  {s.fields.phone}
                </label>
                <input
                  suppressHydrationWarning
                  id="w-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXXXXXXX"
                  className="mt-1 min-h-[46px] w-full rounded-xl border border-[#171315]/15 bg-[#FAF8F4] px-3.5 text-sm font-medium text-[#171315] outline-none transition focus:border-[#9F184B] focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="w-city" className="block text-xs font-bold text-[#171315]">
                  {s.fields.city}
                </label>
                <input
                  suppressHydrationWarning
                  id="w-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Jaipur, Mumbai, Bengaluru, Goa"
                  className="mt-1 min-h-[46px] w-full rounded-xl border border-[#171315]/15 bg-[#FAF8F4] px-3.5 text-sm font-medium text-[#171315] outline-none transition focus:border-[#9F184B] focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="w-cat" className="block text-xs font-bold text-[#171315]">
                  {s.fields.websiteType}
                </label>
                <select
                  suppressHydrationWarning
                  id="w-cat"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value as StudioSpecialtyId)}
                  className="mt-1 min-h-[46px] w-full rounded-xl border border-[#171315]/15 bg-[#FAF8F4] px-3.5 text-sm font-semibold text-[#171315] outline-none transition focus:border-[#9F184B] focus:bg-white"
                >
                  {SPECIALTY_CARDS.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title} ({cat.priceHint})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="w-notes" className="block text-xs font-bold text-[#171315]">
                {s.fields.notes}
              </label>
              <textarea
                suppressHydrationWarning
                id="w-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell us the pages, interactive animations, destinations, menu items, or custom domain you envision..."
                className="mt-1 w-full rounded-xl border border-[#171315]/15 bg-[#FAF8F4] p-3.5 text-sm font-medium text-[#171315] outline-none transition focus:border-[#9F184B] focus:bg-white"
              />
            </div>

            {errorMsg ? (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-900 sm:text-sm">
                {errorMsg}
              </div>
            ) : null}

            <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
              <button
                suppressHydrationWarning
                type="submit"
                disabled={submitting}
                className="btn-spring inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-[#171315] px-8 text-xs font-bold text-[#FAF7F1] shadow-sm transition hover:bg-[#2B2327] disabled:opacity-50 sm:text-sm"
              >
                {submitting ? s.submitBusy : s.submitIdle}
              </button>

              <a
                href={directWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-spring inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#15803D] px-6 text-xs font-bold text-white shadow-sm transition hover:bg-[#166534] sm:text-sm"
              >
                {s.sendWhatsapp}
              </a>
            </div>

            <p className="text-center text-[11px] text-[#171315]/60 sm:text-xs">
              {s.noAdvanceNote}{' '}
              <a href={`mailto:${supportEmail}`} className="font-semibold underline">
                {supportEmail}
              </a>
            </p>
          </form>
        )}
      </div>

      {/* ================================================================= */}
      {/* FULLSCREEN LIVE INTERACTIVE PREVIEW PORTAL (MOBILE-OPTIMIZED BAR)  */}
      {/* ================================================================= */}
      {mounted && previewPlate && previewManifest
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] flex flex-col bg-[#0D0B0E]/92 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-label={`Live preview of ${previewPlate.title}`}
            >
              {/* Slim Responsive Toolbar (Single Compact Row on Mobile) */}
              <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#151217] px-3 py-2 text-white sm:px-6 sm:py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-editorial text-base leading-tight text-white sm:text-lg">
                    {previewPlate.title}
                  </p>
                  <p className="hidden text-[11px] text-white/60 sm:block">
                    Interactive live website — hover, tap, switch modes &amp; test animations
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <div className="hidden items-center rounded-full border border-white/15 bg-white/5 p-0.5 md:flex">
                    <button
                      type="button"
                      onClick={() => setPreviewViewport('desktop')}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                        previewViewport === 'desktop'
                          ? 'bg-white text-[#171315]'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewViewport('mobile')}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                        previewViewport === 'mobile'
                          ? 'bg-white text-[#171315]'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Mobile
                    </button>
                  </div>

                  <Link
                    href={`/create/${previewPlate.themeId}`}
                    onClick={() => setPreviewPlate(null)}
                    className="hidden h-8 items-center rounded-full border border-white/20 bg-white/10 px-3 text-[11px] font-bold text-white hover:bg-white/20 sm:inline-flex sm:h-9 sm:px-3.5 sm:text-xs"
                  >
                    Customize ({previewPlate.readyPrice})
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      handleSelectSpecialty(previewPlate.specialty, previewPlate.defaultAesthetic)
                    }
                    className="inline-flex h-8 items-center rounded-full bg-webzy-primary px-3 text-[11px] font-bold text-white hover:opacity-95 sm:h-9 sm:px-4 sm:text-xs"
                  >
                    Commission
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewPlate(null)}
                    aria-label="Close live preview"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base font-bold text-white hover:bg-white/20 sm:h-9 sm:w-9"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Scrollable Interactive Live Stage */}
              <div className="flex-1 overflow-y-auto p-1.5 sm:p-5">
                <div
                  className={`mx-auto transition-all duration-300 ${
                    previewViewport === 'mobile' ? 'max-w-[400px]' : 'max-w-5xl'
                  }`}
                >
                  <ThemeRenderer
                    manifest={previewManifest}
                    data={previewManifest.demoData}
                    language={language}
                    watermarked
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
