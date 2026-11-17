import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export default function ContentPolicyPage() {
  return (
    <LegalDraftShell title="Content & Safety Policy (DRAFT)">
      <p>
        Webzy celebrates families, friends, and respectful moments. We automatically hold or block
        unverified URLs, phone numbers, UPI IDs, and QR images inside ready-made greeting pages to
        prevent scams.
      </p>
      <p>
        Explicit content, threats, communal hate, impersonation, copyrighted film audio/logos, and
        risky uploads involving minors are removed on priority upon detection or user report.
      </p>
    </LegalDraftShell>
  );
}
