import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export default function PrivacyPage() {
  return (
    <LegalDraftShell title="Privacy Notice (DPDP Act 2023)" badge="Data Protection Policy">
      <p>
        In line with India&apos;s Digital Personal Data Protection (DPDP) Act 2023, Webzy collects only the minimum data
        needed to deliver your celebration link: your name, email address, optional contact phone, consent record, and
        the text or photos you place on your page.
      </p>
      <p>
        We do not run behavioral analytics or profiling on your personal messages, never sell customer lists to third
        parties, and automatically strip location and EXIF metadata from uploaded photos.
      </p>
      <p>
        <strong>Self-service deletion &amp; automatic DPDP purge:</strong> You can delete any published site anytime
        from My Orders, which immediately hides it and starts a 7-day restore window. After that 7-day grace window—or
        7 days after a non-lifetime link expires—all uploaded photos and personal content are permanently purged. Active
        Lifetime Hosting ready-made pages remain stored until you choose to delete them.
      </p>
      <p>
        You may request access, correction, or complete erasure of your data at any time by emailing our Grievance
        Officer listed on the Contact page.
      </p>
    </LegalDraftShell>
  );
}
