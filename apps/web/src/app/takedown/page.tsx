import { getWebzyPublicConfig } from '@webzy/core';
import { LegalDraftShell } from '../../components/shell/LegalDraftShell';
import { TakedownFormClient } from '../../components/storefront/TakedownFormClient';

export const revalidate = 300;

export default function TakedownPage() {
  const config = getWebzyPublicConfig();

  return (
    <LegalDraftShell title="Takedown & Copyright Notice" draftVersion="Safety & Grievance Desk">
      <p>
        Every published Webzy page includes a Report button. Reports immediately hide the page from
        public view pending founder review within 24 hours.
      </p>
      <p>
        For urgent copyright, impersonation, or safety takedowns, submit the notice form below or
        email <strong>{config.business.grievanceEmail}</strong> directly. If there is an immediate
        real-world safety threat, please also contact local authorities.
      </p>

      <TakedownFormClient grievanceEmail={config.business.grievanceEmail} />
    </LegalDraftShell>
  );
}
