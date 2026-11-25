import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import { getWeddingEdition } from '../../../components/weddings/weddingCatalog';
import { WeddingDemoClient } from '../../../components/weddings/WeddingDemoClient';
import { ensureWeddingArtSynced } from '../../../lib/syncWeddingArt';

interface PageProps {
  params: Promise<{ templateId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { templateId } = await params;
  const edition = getWeddingEdition(templateId);
  if (!edition) {
    return { title: 'Wedding Edition Not Found · Webzy' };
  }
  return {
    title: `${edition.editorialName} (${edition.collectionSubtitle}) · Webzy Weddings`,
    description: edition.storyLead,
  };
}

export default async function WeddingTemplateDemoPage({ params }: PageProps) {
  ensureWeddingArtSynced();
  const { templateId } = await params;
  const edition = getWeddingEdition(templateId);

  if (!edition) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F7F3EC]">
      <WeddingDemoClient edition={edition} />
    </main>
  );
}
