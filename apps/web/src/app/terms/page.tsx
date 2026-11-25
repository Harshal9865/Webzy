import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export default function TermsPage() {
  return (
    <LegalDraftShell title="Terms of Service" badge="User Agreement">
      <p>
        Webzy allows individuals and small businesses to create personalized digital greetings and keepsakes for lawful,
        respectful celebrations. Buyers must be 18 years or older, or purchase with the consent of a parent or legal
        guardian.
      </p>
      <p>
        You retain full ownership of the text and photos you upload, and confirm you hold permission to
        use any photos of other people. Ready-made links stay online for the validity period selected
        at checkout (7 days by default, extendable to 14 days, 21 days, or 3 months).
      </p>
      <p>
        Harassment, impersonation, non-consensual private photos, hate speech, financial fraud, and spam links on
        ready-made sites are strictly prohibited and subject to immediate takedown and account restriction.
      </p>
    </LegalDraftShell>
  );
}
