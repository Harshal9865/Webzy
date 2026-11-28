import type { Metadata } from 'next';
import Link from 'next/link';
import { getWebzyPublicConfig } from '@webzy/core';
import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Digital Delivery & Fulfillment Policy · Webzy',
  description:
    'Instant digital delivery details for Webzy celebration links, wedding invitations, and custom-made studio websites. Zero physical shipping required.',
};

export default function ShippingDeliveryPage() {
  const config = getWebzyPublicConfig();

  return (
    <LegalDraftShell
      title="Digital Delivery & Fulfillment Policy"
      badge="100% Digital Fulfillment · Effective 2026"
    >
      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          1. No Physical Shipping Required
        </h2>
        <p>
          All products sold on <strong>{config.business.name}</strong> (&quot;Webzy&quot;)—including
          Ready-Made Celebrations, Ready-Made Wedding Invitations, Add-Ons, and Custom Made Studio
          websites—are <strong>100% digital web experiences</strong>. No physical parcels are
          shipped, and there are zero shipping or courier charges anywhere in India or worldwide.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          2. Instant Delivery for Ready-Made Products (Under 60 Seconds)
        </h2>
        <p>
          Immediately after your Razorpay UPI, card, or netbanking payment is verified, your
          personalized shareable link (<code className="rounded bg-white px-1 py-0.5 text-xs">/s/your-link</code>{' '}
          or <code className="rounded bg-white px-1 py-0.5 text-xs">/i/your-invite</code>) is
          generated automatically—typically within <strong>5 to 60 seconds</strong>. Your live link,
          WhatsApp share button, and GST-inclusive order receipt are delivered simultaneously:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Directly on your post-payment confirmation screen</li>
          <li>Inside your <strong>My Orders</strong> dashboard at any time</li>
          <li>To your registered email address via automated transactional confirmation</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          3. Scheduled Surprise Reveals
        </h2>
        <p>
          If you select a future reveal date and time (e.g., midnight IST for a birthday), your link
          is delivered to you immediately so you can share it in advance; guests see an interactive
          countdown screen until the exact scheduled IST unlock time.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          4. Custom Made Studio Delivery Timeline
        </h2>
        <p>
          Bespoke Custom Made websites requested via{' '}
          <Link href="/studio" className="font-semibold text-webzy-primary underline">
            Webzy Studio
          </Link>{' '}
          are delivered digitally via a private staging preview URL followed by live deployment
          within <strong>3 to 7 business days</strong> after brief approval and advance payment
          (exact timelines are confirmed in your written project quote).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-webzy-ink">
          5. Delayed or Missing Delivery Support
        </h2>
        <p>
          If your payment was debited by your bank or UPI app and your live link does not appear in{' '}
          <strong>My Orders</strong> within 5 minutes, our automated Payment Watchdog reconciles
          pending Razorpay settlements automatically. You may also contact{' '}
          <strong>{config.business.supportEmail}</strong> for priority manual publishing or a 100%
          refund under our{' '}
          <Link href="/refund" className="font-semibold text-webzy-primary underline">
            Refund Policy
          </Link>
          .
        </p>
      </section>
    </LegalDraftShell>
  );
}
