import type { Metadata } from 'next';
import React from 'react';
import { getWebzyPublicConfig } from '@webzy/core';
import {
  getCustomOrderCapacity,
  type CustomOrderSlotStatus,
} from '../../../../../infra/supabase/capacity';
import { getSupabaseEnv } from '../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../infra/supabase/server';
import { WeddingsClient } from '../../components/weddings/WeddingsClient';
import { ensureWeddingArtSynced } from '../../lib/syncWeddingArt';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Webzy Weddings — Heirloom Digital Invitations & Interactive Shaadi Websites',
  description:
    'Invite guests with animated palace doors, velvet wax seals, ceremony dress palettes, venue maps, and personalized family WhatsApp links.',
};

const DEFAULT_WEDDING_CAPACITY: CustomOrderSlotStatus = {
  paused: false,
  limit: 3,
  activeCount: 0,
  remainingSlots: 3,
  acceptingOrders: true,
  capacityMessage: '',
};

export default async function WeddingsPage() {
  ensureWeddingArtSynced();
  const cfg = getWebzyPublicConfig();
  let weddingCapacity: CustomOrderSlotStatus = DEFAULT_WEDDING_CAPACITY;
  let capacityMessage: string | null = null;

  if (getSupabaseEnv().adminConfigured) {
    try {
      const admin = createSupabaseAdminClient();
      const capacity = await getCustomOrderCapacity(admin);
      weddingCapacity = capacity.wedding;
      capacityMessage =
        (capacity as { capacityMessage?: string | null }).capacityMessage ??
        (capacity.wedding as { capacityMessage?: string | null }).capacityMessage ??
        null;
    } catch {
      // Keep default open batch capacity when database is unavailable
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F3EC]">
      <WeddingsClient
        weddingCapacity={weddingCapacity}
        capacityMessage={capacityMessage}
        supportWhatsapp={cfg.business.supportWhatsapp}
        supportEmail={cfg.business.supportEmail}
      />
    </main>
  );
}
