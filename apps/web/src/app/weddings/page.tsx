import type { Metadata } from 'next';
import React from 'react';
import { WeddingsClient } from '../../components/weddings/WeddingsClient';
import { ensureWeddingArtSynced } from '../../lib/syncWeddingArt';

export const metadata: Metadata = {
  title: 'Webzy Weddings — Heirloom Digital Invitations & Interactive Shaadi Websites',
  description:
    'Invite guests with animated palace doors, velvet wax seals, ceremony dress palettes, venue maps, and personalized family WhatsApp links.',
};

export default function WeddingsPage() {
  ensureWeddingArtSynced();
  return (
    <main className="min-h-screen bg-[#F7F3EC]">
      <WeddingsClient />
    </main>
  );
}
