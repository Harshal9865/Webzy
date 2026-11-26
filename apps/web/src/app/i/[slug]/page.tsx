import type { Metadata } from 'next';
import React from 'react';
import {
  getWeddingMockByTemplateId,
  isWeddingTemplateId,
  MOCK_CHRISTIAN_IVORY_WEDDING,
  MOCK_EMERALD_WEDDING,
  MOCK_ROSE_IVORY_WEDDING,
  MOCK_ROYAL_BLUE_WEDDING,
  MOCK_ROYAL_RED_WEDDING,
  MOCK_TEMPLE_GOLD_WEDDING,
  parseWeddingLanguage,
  WEDDING_MOCKS_BY_SLUG,
  type WeddingInvitation,
} from '@webzy/themes';
import { PublicWeddingView } from '../../../components/weddings/PublicWeddingView';
import { getSupabaseEnv } from '../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string; lang?: string }>;
}

function decodeGuestName(raw?: string): string | null {
  if (!raw) return null;
  const plusCleaned = raw.trim().replace(/\+/g, ' ');
  try {
    return decodeURIComponent(plusCleaned).trim().slice(0, 60) || null;
  } catch {
    return plusCleaned.slice(0, 60) || null;
  }
}

function resolveWeddingBySlug(slug: string): WeddingInvitation {
  const normalized = slug.toLowerCase();
  if (normalized in WEDDING_MOCKS_BY_SLUG) {
    return { ...WEDDING_MOCKS_BY_SLUG[normalized], slug };
  }
  if (isWeddingTemplateId(normalized)) {
    return { ...getWeddingMockByTemplateId(normalized), slug };
  }
  if (normalized.includes('christian') || normalized.includes('chapel') || normalized.includes('grace')) {
    return { ...MOCK_CHRISTIAN_IVORY_WEDDING, slug };
  }
  if (normalized.includes('blue') || normalized.includes('jodhpur') || normalized.includes('neela')) {
    return { ...MOCK_ROYAL_BLUE_WEDDING, slug };
  }
  if (normalized.includes('temple') || normalized.includes('kashi') || normalized.includes('swarna')) {
    return { ...MOCK_TEMPLE_GOLD_WEDDING, slug };
  }
  if (normalized.includes('rose') || normalized.includes('gulab') || normalized.includes('ivory')) {
    return { ...MOCK_ROSE_IVORY_WEDDING, slug };
  }
  if (normalized.includes('red') || normalized.includes('royal') || normalized.includes('sindoor')) {
    return { ...MOCK_ROYAL_RED_WEDDING, slug };
  }
  return { ...MOCK_EMERALD_WEDDING, slug };
}

async function resolveLiveOrDemoWeddingBySlug(slug: string): Promise<WeddingInvitation> {
  const normalized = slug.toLowerCase();
  if (
    !(normalized in WEDDING_MOCKS_BY_SLUG) &&
    !isWeddingTemplateId(normalized) &&
    /^[A-Za-z0-9_-]{3,64}$/.test(slug) &&
    getSupabaseEnv().adminConfigured
  ) {
    try {
      const admin = createSupabaseAdminClient();
      const { data: site } = await admin
        .from('sites')
        .select('id, slug, content_json, status, hidden, expires_at, is_lifetime, deleted_at, theme_versions(theme_id)')
        .eq('slug', slug)
        .is('deleted_at', null)
        .maybeSingle();

      const isExpired =
        !site?.is_lifetime &&
        (site?.status === 'expired' ||
          (Boolean(site?.expires_at) && Date.parse(String(site?.expires_at)) <= Date.now()));

      if (site && site.status !== 'removed' && !isExpired && !site.hidden) {
        const rawContent = (site.content_json as Record<string, unknown> | null) || {};
        if (rawContent.weddingData && typeof rawContent.weddingData === 'object') {
          const savedWedding = rawContent.weddingData as Partial<WeddingInvitation>;
          const themeRel = site.theme_versions as
            | { theme_id?: string }
            | Array<{ theme_id?: string }>
            | null;
          const themeId = Array.isArray(themeRel) ? themeRel[0]?.theme_id : themeRel?.theme_id;
          const fallback = getWeddingMockByTemplateId(themeId || savedWedding.templateId || '');
          return {
            ...fallback,
            ...savedWedding,
            slug,
          };
        }
      }
    } catch {
      // Fall back to demo resolution below
    }
  }
  return resolveWeddingBySlug(slug);
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { to } = await searchParams;
  const wedding = await resolveLiveOrDemoWeddingBySlug(slug);
  const decodedGuest = decodeGuestName(to);
  const guestLabel = decodedGuest ? `For ${decodedGuest} · ` : '';

  const title = `${guestLabel}${wedding.brideName} & ${wedding.groomName} — Wedding Invitation`;
  const desc = wedding.personalMessage;

  return {
    title,
    description: desc,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description: desc,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
    },
  };
}

export default async function PublicWeddingInvitationPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { to, lang } = await searchParams;

  const guestName = decodeGuestName(to);

  const initialLang = parseWeddingLanguage(lang) ?? undefined;
  const weddingData = await resolveLiveOrDemoWeddingBySlug(slug);

  return (
    <PublicWeddingView
      initialData={weddingData}
      slug={slug}
      guestName={guestName}
      initialLang={initialLang}
    />
  );
}
