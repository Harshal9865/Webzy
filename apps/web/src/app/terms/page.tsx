import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export default function TermsPage() {
  return (
    <LegalDraftShell title="Terms of Service" badge="User Agreement">
      <p>
        Webzy allows individuals and small businesses to create personalized digital greetings, wedding invitations, and
        keepsakes for lawful, respectful celebrations. Buyers must be 18 years or older, or purchase with the consent
        of a parent or legal guardian.
      </p>
      <p>
        <strong>Hosting validity &amp; Lifetime option:</strong> You retain full ownership of the text and photos you
        upload and confirm you hold permission to use any photos of other people. Ready-made links stay online for the
        validity period selected at checkout: 7 days by default, extendable to 14 days, 21 days, or one-time ₹500
        Lifetime Hosting (available exclusively for ready-made occasion and ready-made wedding themes; custom-made builds
        follow separate project agreements).
      </p>
      <p>
        <strong>Self-service control &amp; safety:</strong> You can pause or soft-delete your page from My Orders at any
        time (with a 7-day restore window before permanent media and PII removal). Harassment, impersonation,
        non-consensual private photos, hate speech, financial fraud, and spam links are strictly prohibited and subject
        to immediate takedown.
      </p>
    </LegalDraftShell>
  );
}
