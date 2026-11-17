import crypto from 'node:crypto';
import Link from 'next/link';
import { getWebzyPublicConfig, parseLanguageCode } from '@webzy/core';
import { getThemeById } from '@webzy/themes';
import { getAuthSessionState } from '../../../../../infra/supabase/auth';
import { getSupabaseEnv } from '../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../infra/supabase/server';
import { CheckoutClient } from '../../components/checkout/CheckoutClient';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string }>;
}) {
  const { draft: draftToken } = await searchParams;
  const config = getWebzyPublicConfig();

  if (!getSupabaseEnv().adminConfigured) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-950">
          <h1 className="font-heading text-2xl font-bold">Supabase setup required for checkout</h1>
          <p className="mt-2">Add Supabase keys in `.env.local` and run migration `0004`.</p>
          <Link
            href="/themes"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-5 text-xs font-bold text-white"
          >
            Back to themes
          </Link>
        </div>
      </div>
    );
  }

  if (!draftToken || !/^[A-Za-z0-9_-]{24,128}$/.test(draftToken)) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <div className="rounded-3xl border border-webzy-tint bg-webzy-surface p-7">
          <h1 className="font-heading text-2xl font-bold text-webzy-ink">
            Pick a theme first to check out
          </h1>
          <Link
            href="/themes"
            className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white"
          >
            Browse themes
          </Link>
        </div>
      </div>
    );
  }

  const admin = createSupabaseAdminClient();
  const tokenHash = crypto.createHash('sha256').update(draftToken).digest('hex');
  const { data: draft } = await admin
    .from('drafts')
    .select('id, theme_id, language')
    .eq('draft_token_hash', tokenHash)
    .is('deleted_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!draft) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <div className="rounded-3xl border border-webzy-tint bg-webzy-surface p-7">
          <h1 className="font-heading text-2xl font-bold text-webzy-ink">Draft not found</h1>
          <p className="mt-2 text-sm text-webzy-ink/75">
            This draft may have expired. Start a fresh greeting in under 3 minutes!
          </p>
          <Link
            href="/themes"
            className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white"
          >
            Browse themes
          </Link>
        </div>
      </div>
    );
  }

  const theme = getThemeById(draft.theme_id, { includeMaanJao: config.flags.maanJaoTheme });
  if (!theme) {
    return null;
  }

  const [{ count: photoCount }, session] = await Promise.all([
    admin
      .from('assets')
      .select('id', { count: 'exact', head: true })
      .eq('draft_id', draft.id)
      .eq('status', 'ready')
      .is('deleted_at', null),
    getAuthSessionState(),
  ]);

  return (
    <CheckoutClient
      theme={theme}
      draftToken={draftToken}
      language={parseLanguageCode(draft.language)}
      hasPhotos={(photoCount ?? 0) > 0}
      isAuthenticated={Boolean(session.user)}
      initialFullName={session.profile?.full_name || ''}
      initialPhone={session.profile?.phone || ''}
      payButtonDisabled={config.payButtonDisabled}
      defaultValidityDays={config.defaultValidityDays}
    />
  );
}
