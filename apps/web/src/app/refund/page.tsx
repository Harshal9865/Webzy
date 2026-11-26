import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export default function RefundPage() {
  return (
    <LegalDraftShell title="Refund & Cancellation Policy" badge="Consumer Guarantee">
      <p>
        <strong>Before publish:</strong> If payment succeeds and your Webzy celebration page could not be published due
        to a technical fault, you qualify for an immediate, full 100% refund.
      </p>
      <p>
        <strong>After publish &amp; self-service edits:</strong> Free self-service typo and message edits are available
        on My Orders during the edit window after publishing, and you may pause or soft-delete your link anytime (with a
        7-day restore grace period). Once a receiver opens a personalized ready-made page, refunds—including on
        validity extensions or the one-time ₹500 Lifetime Hosting add-on—apply only in cases of a verified platform
        fault, wrong theme delivery, or non-delivery.
      </p>
      <p>
        <strong>Custom Made Studio projects:</strong> Approved quotes follow milestone rules (partial refunds apply only
        for milestones not yet started; third-party custom domain registrar fees are non-refundable once registered).
        Approved UPI or bank refunds take 5 to 7 working days to reflect in your original payment source.
      </p>
    </LegalDraftShell>
  );
}
