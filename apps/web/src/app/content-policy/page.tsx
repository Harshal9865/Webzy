import type { Metadata } from 'next';
import Link from 'next/link';
import { getWebzyPublicConfig } from '@webzy/core';
import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Content & Safety Policy · Webzy',
  description:
    'Acceptable use, automated anti-scam screening, and priority takedown policy under India’s IT (Intermediary Guidelines) Rules, 2021.',
};

export default function ContentPolicyPage() {
  const config = getWebzyPublicConfig();

  return (
    <LegalDraftShell
      title="Content & Safety Policy"
      badge="Acceptable Use & IT Rules 2021 · Effective 2026"
    >
      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          1. Respectful Celebrations &amp; Anti-Scam Screening
        </h2>
        <p>
          Webzy is built for families, friends, couples, and honest small businesses. To protect
          Indian recipients from WhatsApp link fraud, we automatically screen and block unverified
          external phishing URLs, bank IFSC/OTP harvesting phrases, unauthorized UPI payment
          requests, and malicious QR images inside ready-made greeting pages.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          2. Strictly Prohibited Content (IT Rules 2021, Rule 3(1)(b))
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Non-consensual private, intimate, or morphed photographs of any individual</li>
          <li>Harassment, stalking, blackmail, defamation, or threats</li>
          <li>Impersonation of another person, brand, bank, or government authority</li>
          <li>Communal hate speech, incitement to violence, or illegal content</li>
          <li>Any exploitative or unsafe content involving minors</li>
          <li>Infringement of third-party copyrights, trademarks, or licensed media</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          3. Immediate Auto-Hide &amp; 24-Hour Priority Takedown
        </h2>
        <p>
          Anyone—whether a recipient, featured individual, or copyright holder—can report a live{' '}
          <code className="rounded bg-white px-1 py-0.5 text-xs">/s/</code> or{' '}
          <code className="rounded bg-white px-1 py-0.5 text-xs">/i/</code> page via our{' '}
          <Link href="/takedown" className="font-semibold text-webzy-primary underline">
            Takedown &amp; Report Form
          </Link>
          . Reports involving privacy violations, impersonation, harassment, or scams trigger{' '}
          <strong>immediate automatic hiding</strong> of the page pending human review. In
          compliance with IT Rules 2021, emergency takedowns involving non-consensual imagery or
          impersonation are permanently actioned within <strong>24 hours</strong>, and all other
          grievances are reviewed by Grievance Officer <strong>{config.business.grievanceName}</strong>{' '}
          ({config.business.grievanceEmail}).
        </p>
      </section>
    </LegalDraftShell>
  );
}
