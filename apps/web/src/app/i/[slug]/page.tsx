import type { Metadata } from 'next';
import Link from 'next/link';
import React, { cache } from 'react';
import { getWebzyPublicConfig } from '@webzy/core';
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

type ResolvedWeddingResult =
  | { status: 'ok'; wedding: WeddingInvitation }
  | { status: 'unavailable' | 'hidden' | 'expired' };

const resolveLiveOrDemoWeddingBySlug = cache(async function resolveLiveOrDemoWeddingBySlugImpl(
  slug: string,
): Promise<ResolvedWeddingResult> {
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
        .maybeSingle();

      if (site) {
        if (site.deleted_at || site.status === 'removed') {
          return { status: 'unavailable' };
        }
        if (site.hidden || site.status === 'hidden') {
          return { status: 'hidden' };
        }
        const isExpired =
          !site.is_lifetime &&
          (site.status === 'expired' ||
            (Boolean(site.expires_at) && Date.parse(String(site.expires_at)) <= Date.now()));
        if (isExpired) {
          return { status: 'expired' };
        }

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
            status: 'ok',
            wedding: {
              ...fallback,
              ...savedWedding,
              slug,
            },
          };
        }
      }
    } catch {
      // Fall back to demo resolution below when DB is unreachable
    }
  }
  return { status: 'ok', wedding: resolveWeddingBySlug(slug) };
});

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { to } = await searchParams;
  const resolved = await resolveLiveOrDemoWeddingBySlug(slug);
  const cfg = getWebzyPublicConfig();
  const ogImageUrl = `${cfg.webUrl.replace(/\/+$/, '')}/opengraph-image`;

  if (resolved.status !== 'ok') {
    return {
      title: 'Invitation Unavailable · Webzy',
      description: 'This invitation link is currently unavailable or has completed its hosting period.',
      robots: { index: false, follow: false },
    };
  }

  const wedding = resolved.wedding;
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
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [ogImageUrl],
    },
  };
}

export default async function PublicWeddingInvitationPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { to, lang } = await searchParams;

  const guestName = decodeGuestName(to);

  const initialLang = parseWeddingLanguage(lang) ?? undefined;
  const resolved = await resolveLiveOrDemoWeddingBySlug(slug);

  if (resolved.status !== 'ok') {
    const headline =
      resolved.status === 'expired'
        ? 'This Wedding Invitation Has Completed Its Hosting Period'
        : resolved.status === 'hidden'
          ? 'This Invitation Is Currently Paused'
          : 'This Invitation Link Is Unavailable';
    const subtext =
      resolved.status === 'expired'
        ? 'The hosting window for this celebration link has ended. If you are the host, sign in to My Orders to renew or upgrade to Lifetime Hosting.'
        : 'The host has paused or removed this invitation link. Please contact the host family if you believe this is a mistake.';

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAF6F0] px-4 py-16 text-center text-[#1A1614]">
        <div className="w-full max-w-md rounded-3xl border border-[#E7DDD0] bg-white p-8 shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A3412]">
            Webzy Digital Invitations
          </p>
          <h1 className="mt-3 font-heading text-2xl font-bold leading-snug text-[#1A1614]">
            {headline}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#57493E]">{subtext}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/weddings"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#1A1614] px-5 text-xs font-bold text-white transition hover:opacity-90"
            >
              Explore Wedding Suites
            </Link>
            <Link
              href="/orders"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#D8CBB8] bg-white px-5 text-xs font-bold text-[#1A1614] transition hover:bg-[#FAF6F0]"
            >
              Host Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <PublicWeddingView
      initialData={resolved.wedding}
      slug={slug}
      guestName={guestName}
      initialLang={initialLang}
    />
  );
}
