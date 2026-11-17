import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export default function RefundPage() {
  return (
    <LegalDraftShell title="Refund & Cancellation Policy" badge="Consumer Guarantee">
      <p>
        <strong>Before publish:</strong> If payment succeeds and your Webzy celebration page could not be
        published due to a technical error, you qualify for an immediate, full 100% refund.
      </p>
      <p>
        <strong>Published within 24 hours:</strong> Free self-service typo edits and photo corrections are available within
        24 hours of publishing on your account page. Once a receiver has opened a personalized keepsake page, refunds apply only
        in case of a verified platform fault, wrong theme delivery, or missing delivery on our part.
      </p>
      <p>
        <strong>Custom Studio projects:</strong> Approved quotes follow milestone rules (partial refunds
        apply only for milestones not yet started). Approved bank or UPI refunds take 5 to 7 working days to
        reflect in your original payment source.
      </p>
    </LegalDraftShell>
  );
}
