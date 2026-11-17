import crypto from 'node:crypto';
import { notFound } from 'next/navigation';
import { getWebzyPublicConfig, type LanguageCode, parseLanguageCode } from '@webzy/core';
import { getThemeById } from '@webzy/themes';
import { getSupabaseEnv } from '../../../../../../infra/supabase/env';
import { getAuthSessionState } from '../../../../../../infra/supabase/auth';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';
import {
  CreateWizardClient,
  type UploadedPhotoItem,
} from '../../../components/create/CreateWizardClient';

export const dynamic = 'force-dynamic';

export default async function CreateWizardPage({
  params,
  searchParams,
}: {
  params: Promise<{ themeId: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const config = getWebzyPublicConfig();
  const { themeId } = await params;
  const { draft: draftTokenParam } = await searchParams;
  const theme = getThemeById(themeId, { includeMaanJao: config.flags.maanJaoTheme });

  if (!theme) {
    notFound();
  }

  const supabaseConfigured = getSupabaseEnv().adminConfigured;
  const session = await getAuthSessionState();
  const isAuthenticated = Boolean(session.user);
  const userEmail = session.user?.email || '';

  let initialDraftToken = '';
  let initialLanguage: LanguageCode | undefined = undefined;
  let initialContent: Record<string, string> | undefined = undefined;
  let initialRevealAt: string | null = null;
  const initialPhotos: UploadedPhotoItem[] = [];

  if (
    supabaseConfigured &&
    draftTokenParam &&
    /^[A-Za-z0-9_-]{24,128}$/.test(draftTokenParam)
  ) {
    try {
      const admin = createSupabaseAdminClient();
      const tokenHash = crypto.createHash('sha256').update(draftTokenParam).digest('hex');
      const { data: draft } = await admin
        .from('drafts')
        .select('id, theme_id, language, content_json, reveal_at')
        .eq('draft_token_hash', tokenHash)
        .eq('theme_id', theme.id)
        .is('deleted_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (draft) {
        initialDraftToken = draftTokenParam;
        initialLanguage = parseLanguageCode(draft.language);
        initialContent = (draft.content_json as Record<string, string>) || {};
        initialRevealAt = draft.reveal_at;

        const { data: assets } = await admin
          .from('assets')
          .select('id, storage_key')
          .eq('draft_id', draft.id)
          .eq('status', 'ready')
          .is('deleted_at', null)
          .order('created_at', { ascending: true })
          .limit(3);

        for (const a of assets || []) {
          const { data: signed } = await admin.storage
            .from('webzy-media')
            .createSignedUrl(a.storage_key, 900);
          if (signed?.signedUrl) {
            initialPhotos.push({ assetId: a.id, signedUrl: signed.signedUrl });
          }
        }
      }
    } catch {
      // Fall back to fresh builder if draft lookup fails
    }
  }

  return (
    <CreateWizardClient
      theme={theme}
      supabaseConfigured={supabaseConfigured}
      isAuthenticated={isAuthenticated}
      userEmail={userEmail}
      initialDraftToken={initialDraftToken}
      initialLanguage={initialLanguage}
      initialContent={initialContent}
      initialPhotos={initialPhotos}
      initialRevealAt={initialRevealAt}
    />
  );
}
