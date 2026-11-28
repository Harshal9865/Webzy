import type { Metadata } from 'next';
import Link from 'next/link';
import { getWebzyPublicConfig } from '@webzy/core';
import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Terms of Service · Webzy',
  description:
    'Terms governing the purchase, hosting, acceptable use, and intellectual property of Webzy digital greetings, wedding invitations, and custom websites.',
};

export default function TermsPage() {
  const config = getWebzyPublicConfig();

  return (
    <LegalDraftShell title="Terms of Service" badge="User Agreement · Effective 2026">
      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">1. Eligibility &amp; Acceptance</h2>
        <p>
          These Terms of Service govern your use of <strong>{config.business.name}</strong>{' '}
          (&quot;Webzy&quot;). By browsing, creating a draft, or completing a payment, you confirm
          that you are at least 18 years of age (or using the service under the supervision and
          consent of a parent or legal guardian) and legally capable of entering into a binding
          contract under the Indian Contract Act, 1872.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          2. Products, Pricing &amp; Taxes
        </h2>
        <p>
          Webzy sells personalized ready-made digital celebration links (₹29–₹99), ready-made
          wedding invitation suites (₹499), optional add-ons (Secret PIN Lock,
          Validity Extensions, Lifetime Hosting), and bespoke Custom Made studio websites (₹1,499+).
          All displayed INR prices are transparent and GST-inclusive. Payments are processed securely
          via Razorpay (UPI, Indian cards, netbanking, and eligible international cards).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          3. Hosting Validity &amp; Lifetime Hosting Terms
        </h2>
        <p>
          Ready-made celebration and wedding pages remain live for the validity period selected at
          checkout: <strong>7 days</strong> by default, extendable to 14 days (+₹9), 21 days (+₹14),
          or one-time <strong>₹500 Lifetime Hosting</strong>. Lifetime Hosting applies exclusively
          to ready-made themes within standard media limits (up to 6 optimized photos per page) for
          the operational lifetime of the Webzy platform, subject to compliance with our{' '}
          <Link href="/content-policy" className="font-semibold text-webzy-primary underline">
            Content &amp; Safety Policy
          </Link>
          . Custom Made studio websites are governed by separate written project quotes and
          registrar-actual custom domain renewals.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          4. User Content Ownership &amp; Permissions
        </h2>
        <p>
          You retain full ownership of the text and photographs you upload. You grant Webzy a
          limited, revocable license solely to store, optimize, and display your content on your
          private link for the duration of your hosting window. You represent and warrant that you
          hold permission to upload photos of every person depicted and that your content does not
          infringe third-party copyrights, trademarks, or privacy rights.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          5. Prohibited Conduct &amp; Intermediary Safe Harbor (IT Act 2000)
        </h2>
        <p>
          In accordance with Rule 3(1)(b) of the Information Technology (Intermediary Guidelines
          and Digital Media Ethics Code) Rules, 2021, you must not use Webzy to publish harassment,
          impersonation, non-consensual intimate or private images, hate speech, defamation,
          financial/UPI phishing, malware, or unlawful content involving minors. Webzy operates as
          an intermediary under Section 79 of the Information Technology Act, 2000 for
          user-submitted content and reserves the right to immediately suspend or remove violating
          pages without refund.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          6. Webzy Intellectual Property
        </h2>
        <p>
          All Webzy theme code, animations, custom illustrations, layouts, and branding remain the
          exclusive intellectual property of {config.business.name}. Purchasing a link grants you a
          personal or single-event display license and does not authorize reselling, cloning, or
          redistributing our source templates.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          7. Limitation of Liability &amp; Governing Law
        </h2>
        <p>
          To the maximum extent permitted by applicable Indian law, Webzy&apos;s aggregate liability
          for any claim arising out of an order shall not exceed the total INR amount paid by you
          for that specific order. These Terms are governed by the laws of India, and any disputes
          shall be subject to the exclusive jurisdiction of the competent courts in India.
        </p>
      </section>
    </LegalDraftShell>
  );
}
