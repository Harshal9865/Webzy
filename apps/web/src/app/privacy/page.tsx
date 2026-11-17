import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export default function PrivacyPage() {
  return (
    <LegalDraftShell title="Privacy Notice (DPDP Act 2023)" badge="Data Protection Policy">
      <p>
        In line with India&apos;s Digital Personal Data Protection (DPDP) Act 2023, Webzy collects only the minimum data needed to
        deliver your greeting link: your name, email address, optional contact phone, consent record,
        and the content you place in your greeting.
      </p>
      <p>
        We do not run behavioral analytics or profiling on your personal celebration messages, never sell customer lists to third parties, and
        automatically strip location and EXIF metadata from uploaded photos. Drafts and expired pages are scheduled for
        permanent cleanup 30 days after expiry.
      </p>
      <p>
        You may request access, correction, or complete deletion of your data at any time by emailing our Grievance
        Officer listed on the Contact page.
      </p>
    </LegalDraftShell>
  );
}
