import type { Metadata } from 'next';
import React from 'react';
import { deriveCatalogPricingSummary } from '@webzy/themes';
import { getCustomOrderCapacity } from '../../../../../infra/supabase/capacity';
import { getSupabaseEnv } from '../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../infra/supabase/server';
import {
  type CustomOrderCapacity,
  PricingClient,
} from '../../components/pricing/PricingClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pricing — Simple One-Time Plans | Webzy',
  description:
    'Transparent one-time GST-inclusive pricing for Webzy occasion celebration sites, royal wedding invitations, and Custom Made bespoke websites.',
};

const FALLBACK_CAPACITY: CustomOrderCapacity = {
  wedding: {
    acceptingOrders: true,
    remainingSlots: 5,
    limit: 5,
    activeCount: 0,
    paused: false,
    capacityMessage: 'Bespoke wedding slots are open.',
  },
  studio: {
    acceptingOrders: true,
    remainingSlots: 8,
    limit: 8,
    activeCount: 0,
    paused: false,
    capacityMessage: 'Custom Made build slots are open.',
  },
  capacityMessage: 'Custom Made slots are currently open.',
};

export default async function PricingPage() {
  const catalogPricing = deriveCatalogPricingSummary();

  let capacity: CustomOrderCapacity = FALLBACK_CAPACITY;
  if (getSupabaseEnv().adminConfigured) {
    try {
      const admin = createSupabaseAdminClient();
      capacity = await getCustomOrderCapacity(admin);
    } catch {
      capacity = FALLBACK_CAPACITY;
    }
  }

  return <PricingClient catalogPricing={catalogPricing} capacity={capacity} />;
}
