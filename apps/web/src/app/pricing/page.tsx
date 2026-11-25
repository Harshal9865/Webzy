import type { Metadata } from 'next';
import React from 'react';
import { PricingClient } from '../../components/pricing/PricingClient';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Pricing — Simple One-Time Plans | Webzy',
  description:
    'Transparent one-time GST-inclusive pricing for Webzy celebration links, Hindu wedding invitations, and bespoke studio websites.',
};

export default function PricingPage() {
  return <PricingClient />;
}
