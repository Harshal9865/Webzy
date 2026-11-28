import type { Metadata } from 'next';
import Link from 'next/link';
import { getWebzyPublicConfig } from '@webzy/core';
import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Privacy Notice (DPDP Act 2023) · Webzy',
  description:
    'How Webzy collects, protects, and purges your celebration data and uploaded photos in compliance with India’s Digital Personal Data Protection Act, 2023.',
};

export default function PrivacyPage() {
  const config = getWebzyPublicConfig();

  return (
    <LegalDraftShell title="Privacy Notice (DPDP Act 2023)" badge="Data Protection Policy · Effective 2026">
      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">1. Data Fiduciary &amp; Scope</h2>
        <p>
          In accordance with India&apos;s Digital Personal Data Protection (DPDP) Act, 2023 and the
          Information Technology (Reasonable Security Practices and Procedures) Rules,{' '}
          <strong>{config.business.name}</strong> (&quot;Webzy&quot;) acts as the Data Fiduciary for
          personal data collected when you create, purchase, or view personalized digital
          celebrations, wedding invitations, and micro-websites on our platform.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">2. Minimum Data Collected</h2>
        <p>
          We collect only the information strictly necessary to generate and host your link: your
          account email address, buyer name, optional mobile number, legal consent timestamps,
          payment reference metadata (we never store full card numbers or UPI PINs), and the text,
          event details, or photos you voluntarily upload for your page.
        </p>
        <p>
          For wedding invitations with Guest RSVP enabled, guest names, attendance counts, meal
          preferences, and optional phone numbers are visible only to the host account and
          automatically purged when the invitation is deleted or expires.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          3. Photo Privacy, EXIF Stripping &amp; Search Indexing
        </h2>
        <p>
          Every photo uploaded to Webzy is automatically re-encoded to strip GPS location and camera
          EXIF metadata, stored in private object storage, and served via short-lived signed URLs.
          Published celebration and wedding links (<code className="rounded bg-white px-1 py-0.5 text-xs">/s/</code>{' '}
          and <code className="rounded bg-white px-1 py-0.5 text-xs">/i/</code>) include{' '}
          <code className="rounded bg-white px-1 py-0.5 text-xs">noindex, nofollow</code> headers so
          they are not indexed by public search engines. Optional 4-digit Secret PIN protection is
          available at checkout.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          4. Zero Ad Profiling &amp; Trusted Sub-Processors
        </h2>
        <p>
          We do not run behavioral ad tracking, never profile your personal messages, and never sell
          or rent customer lists. We rely strictly on vetted infrastructure sub-processors to
          deliver the service: <strong>Razorpay</strong> (PCI-DSS compliant payment processing),{' '}
          <strong>Supabase</strong> (encrypted database and private media storage),{' '}
          <strong>Vercel</strong> (edge web hosting), and <strong>Resend</strong> (transactional
          order receipts and safety alerts).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          5. Retention, Self-Service Deletion &amp; Automatic Purge
        </h2>
        <p>
          You may pause or soft-delete any published site anytime from <strong>My Orders</strong>.
          Soft-deletion immediately hides the link and starts a 7-day restore grace window. After
          that 7-day grace period—or 7 days after a non-lifetime link expires—all uploaded photos
          and personal message content are permanently purged. Active Lifetime Hosting ready-made
          pages remain stored until you delete them. Invoice and GST accounting records are retained
          as required under Indian tax law.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          6. Children&apos;s Data Safeguards (DPDP Section 9)
        </h2>
        <p>
          Webzy is intended for users aged 18 and above, or minors acting with verifiable parental
          or guardian consent. We do not knowingly track, profile, or target advertising toward
          children. Parents or guardians may request immediate removal of any minor&apos;s photo or
          details via our{' '}
          <Link href="/takedown" className="font-semibold text-webzy-primary underline">
            Priority Takedown Form
          </Link>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          7. Your Rights &amp; Grievance Redressal
        </h2>
        <p>
          Under the DPDP Act 2023, you have the right to access a summary of your personal data,
          request correction or complete erasure, withdraw consent, and nominate a representative.
          To exercise any right, email our Grievance Officer{' '}
          <strong>{config.business.grievanceName}</strong> at{' '}
          <strong>{config.business.grievanceEmail}</strong>. We acknowledge requests within 24
          hours and resolve them within 15 days.
        </p>
      </section>
    </LegalDraftShell>
  );
}
