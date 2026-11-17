import { getWebzyPublicConfig } from '@webzy/core';
import { LegalDraftShell } from '../../components/shell/LegalDraftShell';

export const revalidate = 300;

export default function ContactPage() {
  const config = getWebzyPublicConfig();

  return (
    <LegalDraftShell title="Contact & Grievance Officer" draftVersion="Support Directory">
      <p>
        <strong>Business name:</strong> {config.business.name}
      </p>
      <p>
        <strong>Address:</strong> {config.business.address}
      </p>
      <p>
        <strong>Support Email:</strong> {config.business.supportEmail}
      </p>
      <p>
        <strong>Support WhatsApp:</strong> {config.business.supportWhatsapp}
      </p>
      <p>
        <strong>Support Hours:</strong> {config.business.supportHours}
      </p>
      <p>
        <strong>Named Grievance Contact:</strong> {config.business.grievanceName} (
        {config.business.grievanceEmail})
      </p>
    </LegalDraftShell>
  );
}
