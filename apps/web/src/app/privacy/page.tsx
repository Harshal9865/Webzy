import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export default function PrivacyPage() {
  return (
    <LegalDraftShell title="Privacy Notice (DRAFT)">
      <p>
        In line with India&apos;s DPDP Act principles, Webzy collects only the minimum data needed to
        deliver your greeting link: your name, email address, optional contact phone, consent record,
        and the content you place in your greeting.
      </p>
      <p>
        We do not run behavioral analytics on your personal messages, never sell customer lists, and
        strip location/EXIF metadata from uploaded photos. Drafts and expired pages are scheduled for
        cleanup 30 days after expiry.
      </p>
      <p>
        You may request access, correction, or deletion of your data by emailing our grievance
        contact listed on the Contact page.
      </p>
    </LegalDraftShell>
  );
}
