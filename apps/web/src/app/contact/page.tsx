import type { Metadata } from 'next';
import Link from 'next/link';
import { getWebzyPublicConfig } from '@webzy/core';
import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Contact & Grievance Officer · Webzy',
  description:
    'Official customer support directory and statutory Grievance Officer contact for Webzy under Indian IT Rules 2021 and Consumer Protection (E-Commerce) Rules 2020.',
};

export default function ContactPage() {
  const config = getWebzyPublicConfig();

  return (
    <LegalDraftShell
      title="Contact & Grievance Officer"
      badge="Statutory Support Directory · India"
    >
      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          Customer Support &amp; Order Help
        </h2>
        <div className="grid gap-2 rounded-2xl border border-webzy-tint bg-white/80 p-4 text-sm">
          <p>
            <strong>Legal Business Name:</strong> {config.business.name}
          </p>
          <p>
            <strong>Registered Address:</strong> {config.business.address}
          </p>
          <p>
            <strong>Country of Origin:</strong> India
          </p>
          <p>
            <strong>Support Email:</strong>{' '}
            <a
              href={`mailto:${config.business.supportEmail}`}
              className="font-semibold text-webzy-primary underline"
            >
              {config.business.supportEmail}
            </a>
          </p>
          <p>
            <strong>Support WhatsApp:</strong> {config.business.supportWhatsapp}
          </p>
          <p>
            <strong>Support Hours:</strong> {config.business.supportHours}
          </p>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          Statutory Grievance Officer (IT Rules 2021 &amp; DPDP Act 2023)
        </h2>
        <p>
          In accordance with the Information Technology (Intermediary Guidelines and Digital Media
          Ethics Code) Rules, 2021, the Consumer Protection (E-Commerce) Rules, 2020, and the
          Digital Personal Data Protection Act, 2023, our designated Grievance Officer is:
        </p>
        <div className="grid gap-2 rounded-2xl border border-webzy-tint bg-white/80 p-4 text-sm">
          <p>
            <strong>Grievance Officer:</strong> {config.business.grievanceName}
          </p>
          <p>
            <strong>Grievance Email:</strong>{' '}
            <a
              href={`mailto:${config.business.grievanceEmail}`}
              className="font-semibold text-webzy-primary underline"
            >
              {config.business.grievanceEmail}
            </a>
          </p>
          <p>
            <strong>Acknowledgement SLA:</strong> Within 24 hours of receipt (with ticket reference)
          </p>
          <p>
            <strong>Resolution SLA:</strong> Within 15 days (within 24 hours for emergency privacy,
            impersonation, or non-consensual content takedowns)
          </p>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          Urgent Content Removal
        </h2>
        <p>
          To report a live celebration or wedding link for immediate privacy or safety review,
          please submit the link directly through our{' '}
          <Link href="/takedown" className="font-semibold text-webzy-primary underline">
            Priority Takedown Form
          </Link>
          .
        </p>
      </section>
    </LegalDraftShell>
  );
}
