import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import { getWeddingEdition } from '../../../../components/weddings/weddingCatalog';
import { WeddingCustomizerClient } from '../../../../components/weddings/WeddingCustomizerClient';

interface PageProps {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ draft?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { templateId } = await params;
  const edition = getWeddingEdition(templateId);
  if (!edition) {
    return { title: 'Customize Wedding · Webzy' };
  }
  return {
    title: `Customize ${edition.editorialName} · Webzy Weddings`,
    description: `Personalize couple details, events, story, RSVP, and guest links for ${edition.editorialName} with a live interactive phone preview.`,
  };
}

export default async function WeddingCustomizePage({ params, searchParams }: PageProps) {
  const { templateId } = await params;
  const { draft } = await searchParams;
  const edition = getWeddingEdition(templateId);

  if (!edition) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F7F3EC]">
      <WeddingCustomizerClient edition={edition} initialDraftToken={draft} />
    </main>
  );
}
