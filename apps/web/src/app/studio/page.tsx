import type { Metadata } from 'next';
import React from 'react';
import { getWebzyPublicConfig } from '@webzy/core';
import { StudioWaitlistClient } from '../../components/studio/StudioWaitlistClient';

export const metadata: Metadata = {
  title: 'Webzy Studio — Custom Websites for Coaching, Clinics, Shops & Weddings',
  description:
    'Request a custom website built personally by Webzy Studio for coaching institutes, medical clinics, retail shops, local businesses, and destination weddings.',
};

export default function StudioPage() {
  const cfg = getWebzyPublicConfig();
  return (
    <div className="min-h-screen bg-webzy-surface/30">
      <StudioWaitlistClient
        supportWhatsapp={cfg.business.supportWhatsapp}
        supportEmail={cfg.business.supportEmail}
      />
    </div>
  );
}
