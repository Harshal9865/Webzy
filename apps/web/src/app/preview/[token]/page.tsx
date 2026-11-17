import crypto from 'node:crypto';
import { notFound } from 'next/navigation';
import { getWebzyPublicConfig, parseLanguageCode } from '@webzy/core';
import { getThemeById } from '@webzy/themes';
import { getSupabaseEnv } from '../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';
import { PreviewClient } from '../../../components/create/PreviewClient';

export const dynamic = 'force-dynamic';

export default async function WatermarkedPreviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!getSupabaseEnv().adminConfigured || !/^[A-Za-z0-9_-]{24,128}$/.test(token)) {
    notFound();
  }

  const admin = createSupabaseAdminClient();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const { data: draft } = await admin
    .from('drafts')
    .select('id, theme_id, language, content_json, reveal_at')
    .eq('draft_token_hash', tokenHash)
    .is('deleted_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!draft) {
    notFound();
  }

  const config = getWebzyPublicConfig();
  const theme = getThemeById(draft.theme_id, {
    includeMaanJao: config.flags.maanJaoTheme,
  });
  if (!theme) {
    notFound();
  }

  const { data: assets } = await admin
    .from('assets')
    .select('storage_key')
    .eq('draft_id', draft.id)
    .eq('status', 'ready')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(3);

  const photoUrls: string[] = [];
  for (const row of assets || []) {
    const { data: signed } = await admin.storage
      .from('webzy-media')
      .createSignedUrl(row.storage_key, 900);
    if (signed?.signedUrl) {
      photoUrls.push(signed.signedUrl);
    }
  }

  return (
    <PreviewClient
      theme={theme}
      draftToken={token}
      language={parseLanguageCode(draft.language)}
      content={(draft.content_json as Record<string, string>) || {}}
      photoUrls={photoUrls}
      revealAt={draft.reveal_at}
    />
  );
}
