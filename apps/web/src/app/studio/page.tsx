import type { Metadata } from 'next';
import React from 'react';
import { getWebzyPublicConfig } from '@webzy/core';
import { getCustomOrderCapacity } from '../../../../../infra/supabase/capacity';
import { getSupabaseEnv } from '../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../infra/supabase/server';
import {
  type StudioCapacityStatus,
  StudioWaitlistClient,
} from '../../components/studio/StudioWaitlistClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Webzy Custom Made — Custom Websites for Coaching, Clinics, Shops & Weddings',
  description:
    'Request a custom website built personally by Webzy Custom Made for coaching institutes, medical clinics, retail shops, local businesses, and destination weddings.',
};

const FALLBACK_STUDIO_CAPACITY: StudioCapacityStatus = {
  acceptingOrders: true,
  remainingSlots: 8,
  limit: 8,
  activeCount: 0,
  paused: false,
  capacityMessage: 'Custom Made build slots are open.',
};

export default async function StudioPage() {
  const cfg = getWebzyPublicConfig();
  let studioCapacity: StudioCapacityStatus = FALLBACK_STUDIO_CAPACITY;

  if (getSupabaseEnv().adminConfigured) {
    try {
      const admin = createSupabaseAdminClient();
      const capacity = await getCustomOrderCapacity(admin);
      studioCapacity = capacity.studio;
    } catch {
      studioCapacity = FALLBACK_STUDIO_CAPACITY;
    }
  }

  return (
    <div className="min-h-screen bg-webzy-surface/30">
      <StudioWaitlistClient
        supportWhatsapp={cfg.business.supportWhatsapp}
        supportEmail={cfg.business.supportEmail}
        capacity={studioCapacity}
      />
    </div>
  );
}
