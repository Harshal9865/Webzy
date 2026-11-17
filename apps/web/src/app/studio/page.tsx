import type { Metadata } from 'next';
import React from 'react';
import { StudioWaitlistClient } from '../../components/studio/StudioWaitlistClient';

export const metadata: Metadata = {
  title: 'Webzy Studio — Custom Scratch Builds for Coaching, Clinics & E-Commerce',
  description:
    'Webzy Studio is launching in 15 days for custom scratch-built websites tailored for coaching centers, medical clinics, and e-commerce stores. Join the priority waitlist for early access and founder pricing.',
};

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-webzy-surface/30">
      <StudioWaitlistClient />
    </main>
  );
}
