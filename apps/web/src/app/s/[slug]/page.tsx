import type { Metadata } from 'next';
import { getWebzyPublicConfig, parseLanguageCode } from '@webzy/core';
import { buildThemePayloadFromDraft, getThemeById } from '@webzy/themes';
import { getSupabaseEnv } from '../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';
import { ReceiverClient, type ReceiverPageState } from '../../../components/receiver/ReceiverClient';

export const dynamic = 'force-dynamic';

// Non-spoiler OG metadata (Section 18): never expose recipient name, message, or photos.
export const metadata: Metadata = {
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
        url: '/opengraph-image',
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
    images: ['/opengraph-image'],
  },
};

export default async function ReceiverSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const serverNowMs = Date.now();

  if (!slug || !/^[A-Za-z0-9_-]{6,64}$/.test(slug) || !getSupabaseEnv().adminConfigured) {
    return <ReceiverClient slug={slug || 'invalid'} state="unavailable" serverNowMs={serverNowMs} />;
  }

  const admin = createSupabaseAdminClient();
  const { data: site } = await admin
    .from('sites')
    .select(
      'id, slug, content_json, status, hidden, reveal_at, expires_at, deleted_at, reply_text, theme_versions(theme_id)',
    )
    .eq('slug', slug)
    .maybeSingle();

  if (!site || site.deleted_at || site.status === 'removed') {
    return <ReceiverClient slug={slug} state="unavailable" serverNowMs={serverNowMs} />;
  }

  if (site.hidden || site.status === 'hidden') {
    return <ReceiverClient slug={slug} state="hidden" serverNowMs={serverNowMs} />;
  }

  if (site.status === 'expired' || (site.expires_at && Date.parse(site.expires_at) <= serverNowMs)) {
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
  if (assets && assets.length > 0) {
    for (const asset of assets) {
      if (!asset.storage_key) continue;
      const { data: signed } = await admin.storage
        .from('webzy-media')
        .createSignedUrl(asset.storage_key, 900);
      if (signed?.signedUrl) {
        signedPhotos.push(signed.signedUrl);
      }
    }
  }

  const content = (site.content_json as Record<string, string>) || {};
  const language = parseLanguageCode(content.language);
  const payload = buildThemePayloadFromDraft(theme, {
    receiverName: content.receiverName,
    senderName: content.senderName,
    relation: content.relation,
    message: content.message,
    whatsappPhone: content.whatsappPhone,
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
