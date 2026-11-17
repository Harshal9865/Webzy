import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export default function RefundPage() {
  return (
    <LegalDraftShell title="Refund & Cancellation Policy (DRAFT)">
      <p>
        <strong>Before publish:</strong> If payment succeeds and your Webzy page could not be
        published, you qualify for a full refund.
      </p>
      <p>
        <strong>Published within 24 hours:</strong> Free self-service typo edits are available within
        24 hours of publishing. Once a receiver has opened a personalized page, refunds apply only
        in case of a verified technical fault, wrong theme delivery, or missing delivery on our part.
      </p>
      <p>
        <strong>Custom projects:</strong> Approved quotes follow milestone rules (partial refunds
        apply only for work not yet started). Approved bank/UPI refunds take 5 to 7 working days to
        reflect.
      </p>
    </LegalDraftShell>
  );
}
