import type { Metadata } from 'next';
import React from 'react';
import { WeddingsClient } from '../../components/weddings/WeddingsClient';

export const metadata: Metadata = {
  title: 'Webzy Weddings — Romantic Couple Timelines, Invites & Shaadi Websites',
  description:
    'Celebrate your wedding with an interactive website link. Share your journey, save-the-date countdown, and ceremony schedules over WhatsApp. Instant setup from ₹99.',
};

export default function WeddingsPage() {
  return (
    <main className="min-h-screen bg-rose-50/20">
      <WeddingsClient />
    </main>
  );
}
