import type { Metadata } from 'next';
import Link from 'next/link';
import { getWebzyPublicConfig } from '@webzy/core';
import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy · Webzy',
  description:
    'Transparent refund, cancellation, and post-publish edit rules for Webzy digital celebration pages, wedding invitations, and custom websites.',
};

export default function RefundPage() {
  const config = getWebzyPublicConfig();

  return (
    <LegalDraftShell title="Refund & Cancellation Policy" badge="Consumer Guarantee · Effective 2026">
      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          1. 100% Guarantee Before Publish / Non-Delivery
        </h2>
        <p>
          If your UPI, card, or netbanking payment succeeds and your Webzy page fails to generate or
          publish due to a technical fault—or if you were accidentally double-charged for the same
          draft—you qualify for an immediate, <strong>100% full refund</strong> with zero
          deductions.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          2. Personalized Digital Goods &amp; Free Edit Window
        </h2>
        <p>
          Because ready-made celebration pages, wedding invitations, and validity extensions are
          custom-personalized digital products delivered immediately upon payment, cancellations are
          not available once the personalized link has been generated and opened by a recipient.
        </p>
        <p>
          Spotted a spelling typo or date error after paying? Free self-service message and detail
          edits are included inside <strong>My Orders</strong> during the post-publish edit window,
          and you may pause or soft-delete your link anytime (with a 7-day restore grace period).
          Refunds after publish—including on validity extensions or the one-time ₹500 Lifetime
          Hosting add-on—apply only for a verified platform defect, wrong theme delivery, or
          non-delivery.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          3. Custom Made Studio Projects (₹1,499+)
        </h2>
        <p>
          Bespoke Custom Made websites follow milestone billing agreed in writing before work
          begins. If you cancel before design work starts, 100% of the advance is refunded. Once
          design or engineering begins, partial refunds apply only to milestones not yet started.
          Third-party custom domain registrar fees (e.g., <code className="rounded bg-white px-1 py-0.5 text-xs">.in</code> /{' '}
          <code className="rounded bg-white px-1 py-0.5 text-xs">.com</code>) are non-refundable once
          registered in your name.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          4. How to Request a Refund &amp; Settlement Timeline
        </h2>
        <p>
          To request a refund, email <strong>{config.business.supportEmail}</strong> (or message our
          support WhatsApp listed on the{' '}
          <Link href="/contact" className="font-semibold text-webzy-primary underline">
            Contact page
          </Link>
          ) with your Order ID or invoice number within 7 days of purchase. We review requests
          within 24 hours. Approved refunds are initiated immediately via Razorpay and typically
          reflect in your original UPI handle, card, or bank account within{' '}
          <strong>5 to 7 working days</strong> (depending on your bank&apos;s settlement cycle).
        </p>
      </section>
    </LegalDraftShell>
  );
}
