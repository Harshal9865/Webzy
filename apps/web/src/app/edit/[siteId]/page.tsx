import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getWebzyPublicConfig, parseLanguageCode } from '@webzy/core';
import { getThemeById } from '@webzy/themes';
import { getAuthSessionState } from '../../../../../../infra/supabase/auth';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';
import { EditSiteClient } from '../../../components/account/EditSiteClient';

export const dynamic = 'force-dynamic';

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const session = await getAuthSessionState();

  if (!session.user) {
    redirect(`/login?next=${encodeURIComponent(`/edit/${siteId}`)}`);
  }

  const admin = createSupabaseAdminClient();
  const { data: site } = await admin
    .from('sites')
    .select(
      'id, slug, user_id, content_json, status, created_at, free_edit_until, edit_count, deleted_at, theme_versions(theme_id)',
    )
    .eq('id', siteId)
    .eq('user_id', session.user.id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!site) {
    notFound();
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
    notFound();
  }

  const freeEditUntilMs = site.free_edit_until ? Date.parse(site.free_edit_until) : NaN;
  const createdAtMs = site.created_at ? Date.parse(site.created_at) : NaN;
  const editWindowOpen = !Number.isNaN(freeEditUntilMs)
    ? freeEditUntilMs > Date.now()
    : !Number.isNaN(createdAtMs) && Date.now() - createdAtMs <= 48 * 60 * 60 * 1000;

  if (!editWindowOpen || site.status === 'removed' || site.status === 'expired') {
    return (
      <div className="mx-auto max-w-lg px-4 py-14 text-center">
        <div className="rounded-3xl border border-webzy-tint bg-webzy-surface p-8">
          <h1 className="font-heading text-2xl font-bold text-webzy-ink">
            Free 24-hour edit window closed
          </h1>
          <p className="mt-2 text-sm text-webzy-ink/75">
            Edits are complimentary within 24 hours of publishing. You can still view or share
            your existing link from My Webzys.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href={`/s/${site.slug}`}
              className="inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-5 text-xs font-bold text-white"
            >
              Open Live Page
            </Link>
            <Link
              href="/account"
              className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-white px-5 text-xs font-bold text-webzy-ink"
            >
              My Webzys
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: assets } = await admin
    .from('assets')
    .select('storage_key')
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
    for (const item of signedList || []) {
      if (item?.signedUrl) {
        signedPhotos.push(item.signedUrl);
      }
    }
  }

  const rawContent = (site.content_json as Record<string, unknown>) || {};
  const hasPinLock =
    typeof rawContent.secretPinHash === 'string' && rawContent.secretPinHash.length >= 32;
  const effectiveFreeEditUntil =
    site.free_edit_until ||
    new Date((!Number.isNaN(createdAtMs) ? createdAtMs : Date.now()) + 48 * 60 * 60 * 1000).toISOString();

  return (
    <EditSiteClient
      siteId={site.id}
      slug={site.slug}
      theme={theme}
      initialContent={{
        receiverName: typeof rawContent.receiverName === 'string' ? rawContent.receiverName : '',
        senderName: typeof rawContent.senderName === 'string' ? rawContent.senderName : '',
        relation: typeof rawContent.relation === 'string' ? rawContent.relation : '',
        message: typeof rawContent.message === 'string' ? rawContent.message : '',
        language: parseLanguageCode(
          typeof rawContent.language === 'string' ? rawContent.language : undefined,
        ),
        whatsappPhone: typeof rawContent.whatsappPhone === 'string' ? rawContent.whatsappPhone : '',
      }}
      initialWeddingData={
        rawContent.weddingData && typeof rawContent.weddingData === 'object'
          ? (rawContent.weddingData as Record<string, unknown>)
          : undefined
      }
      initialHasPinLock={hasPinLock}
      signedPhotos={signedPhotos}
      freeEditUntilIso={effectiveFreeEditUntil}
      editCount={site.edit_count ?? 0}
    />
  );
}
