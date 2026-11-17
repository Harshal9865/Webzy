import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export default function TermsPage() {
  return (
    <LegalDraftShell title="Terms of Use (DRAFT)">
      <p>
        Webzy lets individuals and small businesses create personal greeting web pages for lawful,
        respectful occasions. Buyers must be 18 years or older, or purchase with a parent or legal
        guardian.
      </p>
      <p>
        You retain ownership of the text and photos you upload, and confirm you hold permission to
        use any photos of other people. Ready-made links stay online for the validity period listed
        at checkout (30 days by default).
      </p>
      <p>
        Harassment, impersonation, non-consensual photos, hate speech, and commercial spam links on
        ready-made sites are strictly prohibited and subject to immediate takedown.
      </p>
    </LegalDraftShell>
  );
}
