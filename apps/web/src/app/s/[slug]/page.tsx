import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getWebzyPublicConfig, parseLanguageCode } from '@webzy/core';
import {
  buildThemePayloadFromDraft,
  getThemeById,
  getWeddingMockByTemplateId,
  isWeddingTemplateId,
  parseWeddingLanguage,
  WeddingScroll,
  type WeddingInvitation,
} from '@webzy/themes';
import { verifyPinUnlockCookie } from '../../../../../../infra/security/requestGuard';
import { getSupabaseEnv } from '../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';
import { PinGateClient } from '../../../components/receiver/PinGateClient';
import { ReceiverClient, type ReceiverPageState } from '../../../components/receiver/ReceiverClient';

export const dynamic = 'force-dynamic';

// Non-spoiler OG metadata (Section 18): never expose recipient name, message, or photos.
export async function generateMetadata(): Promise<Metadata> {
  const cfg = getWebzyPublicConfig();
  const ogImageUrl = `${cfg.webUrl}/opengraph-image`;

  return {
    title: 'A special Webzy is waiting for you',
    description: 'Someone made a personal Webzy link for you. Tap to open.',
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: 'Someone sent you a special Webzy link',
      description: 'Tap to open your personal page.',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'A special Webzy is waiting for you',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Someone sent you a special Webzy link',
      description: 'Tap to open your personal page.',
      images: [ogImageUrl],
    },
  };
}

export default async function ReceiverSitePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string; lang?: string }>;
}) {
  const { slug } = await params;
  const { to, lang } = await searchParams;
  const serverNowMs = Date.now();

  if (!slug || !/^[A-Za-z0-9_-]{6,64}$/.test(slug) || !getSupabaseEnv().adminConfigured) {
    return <ReceiverClient slug={slug || 'invalid'} state="unavailable" serverNowMs={serverNowMs} />;
  }

  const admin = createSupabaseAdminClient();
  const { data: site } = await admin
    .from('sites')
    .select(
      'id, slug, content_json, status, hidden, reveal_at, expires_at, is_lifetime, deleted_at, reply_text, theme_versions(theme_id)',
    )
    .eq('slug', slug)
    .maybeSingle();

  if (!site || site.deleted_at || site.status === 'removed') {
    return <ReceiverClient slug={slug} state="unavailable" serverNowMs={serverNowMs} />;
  }

  if (site.hidden || site.status === 'hidden') {
    return <ReceiverClient slug={slug} state="hidden" serverNowMs={serverNowMs} />;
  }

  if (
    !site.is_lifetime &&
    (site.status === 'expired' || (site.expires_at && Date.parse(site.expires_at) <= serverNowMs))
  ) {
    return <ReceiverClient slug={slug} state="expired" serverNowMs={serverNowMs} />;
  }

  if (site.status === 'scheduled' && site.reveal_at && Date.parse(site.reveal_at) > serverNowMs) {
    return (
      <ReceiverClient
        slug={slug}
        state="scheduled"
        revealAtIso={site.reveal_at}
        serverNowMs={serverNowMs}
      />
    );
  }

  const themeRel = site.theme_versions as
    | { theme_id?: string }
    | Array<{ theme_id?: string }>
    | null;
  const themeId = Array.isArray(themeRel) ? themeRel[0]?.theme_id : themeRel?.theme_id;
  const cfg = getWebzyPublicConfig();
  const theme = themeId
    ? getThemeById(themeId, { includeMaanJao: cfg.flags.maanJaoTheme })
    : undefined;

  if (!theme) {
    return <ReceiverClient slug={slug} state="unavailable" serverNowMs={serverNowMs} />;
  }

  // Generate fresh 15-minute signed URLs for uploaded photos from private storage
  const { data: assets } = await admin
    .from('assets')
    .select('id, storage_key')
    .eq('site_id', site.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(6);

  const signedPhotos: string[] = [];
  const storageKeys = (assets || [])
    .map((asset) => asset.storage_key)
    .filter((key): key is string => Boolean(key));

  if (storageKeys.length > 0) {
    const { data: signedList } = await admin.storage
      .from('webzy-media')
      .createSignedUrls(storageKeys, 900);

    const urlByKey = new Map<string, string>();
    for (const item of signedList || []) {
      if (item.path && item.signedUrl) {
        urlByKey.set(item.path, item.signedUrl);
      }
    }

    for (const key of storageKeys) {
      const signedUrl = urlByKey.get(key);
      if (signedUrl) {
        signedPhotos.push(signedUrl);
      }
    }
  }

  const rawContent = (site.content_json as Record<string, unknown>) || {};

  // Enforce Secret PIN Lock add-on if configured on this published site
  if (typeof rawContent.secretPinHash === 'string' && rawContent.secretPinHash.length >= 32) {
    const cookieStore = await cookies();
    const unlockCookie = cookieStore.get(`webzy_unlock_${slug}`)?.value;
    if (
      !verifyPinUnlockCookie({
        token: unlockCookie,
        slug,
        expectedHash: rawContent.secretPinHash,
        nowMs: serverNowMs,
      })
    ) {
      return <PinGateClient slug={slug} />;
    }
  }

  // Render full royal WeddingScroll natively when a paid wedding invitation is opened at /s/[slug]
  if (theme.occasion === 'wedding') {
    const fallbackWedding = getWeddingMockByTemplateId(theme.id);
    const savedWedding =
      rawContent.weddingData && typeof rawContent.weddingData === 'object'
        ? (rawContent.weddingData as Partial<WeddingInvitation>)
        : {};
    const mergedWedding: WeddingInvitation = {
      ...fallbackWedding,
      ...savedWedding,
      slug,
      templateId: isWeddingTemplateId(theme.id) ? theme.id : fallbackWedding.templateId,
      language:
        parseWeddingLanguage(lang) ?? savedWedding.language ?? fallbackWedding.language,
      gallery:
        signedPhotos.length > 0
          ? signedPhotos
          : savedWedding.gallery && savedWedding.gallery.length > 0
            ? savedWedding.gallery
            : fallbackWedding.gallery,
    };

    let guestName: string | null = null;
    if (to) {
      const plusCleaned = to.trim().replace(/\+/g, ' ');
      try {
        guestName = decodeURIComponent(plusCleaned).trim().slice(0, 60) || null;
      } catch {
        guestName = plusCleaned.slice(0, 60) || null;
      }
    }

    return <WeddingScroll data={mergedWedding} guestName={guestName} />;
  }

  const language = parseLanguageCode(typeof rawContent.language === 'string' ? rawContent.language : undefined);
  const rawHighlights = Array.isArray(rawContent.highlights)
    ? rawContent.highlights
        .filter((h): h is { title?: string; detail?: string } => Boolean(h && typeof h === 'object'))
        .slice(0, 4)
    : undefined;
  const payload = buildThemePayloadFromDraft(theme, {
    receiverName: typeof rawContent.receiverName === 'string' ? rawContent.receiverName : undefined,
    senderName: typeof rawContent.senderName === 'string' ? rawContent.senderName : undefined,
    relation: typeof rawContent.relation === 'string' ? rawContent.relation : undefined,
    headline: typeof rawContent.headline === 'string' ? rawContent.headline : undefined,
    message: typeof rawContent.message === 'string' ? rawContent.message : undefined,
    offerTag: typeof rawContent.offerTag === 'string' ? rawContent.offerTag : undefined,
    highlights: rawHighlights,
    whatsappPhone: typeof rawContent.whatsappPhone === 'string' ? rawContent.whatsappPhone : undefined,
    photos: signedPhotos,
  });
  const state: ReceiverPageState = 'live';

  return (
    <ReceiverClient
      slug={slug}
      state={state}
      theme={theme}
      payload={payload}
      language={language}
      serverNowMs={serverNowMs}
      initialReplyText={site.reply_text}
    />
  );
}
