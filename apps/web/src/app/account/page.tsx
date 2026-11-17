import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getWebzyPublicConfig } from '@webzy/core';
import { getThemeById } from '@webzy/themes';
import { getAuthSessionState } from '../../../../../infra/supabase/auth';
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from '../../../../../infra/supabase/server';
import { AccountClient, type AccountSiteItem, type AccountOrderItem } from '../../components/auth/AccountClient';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getAuthSessionState();

  if (!session.configured) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-950">
          <h1 className="font-heading text-2xl font-bold">Connect Supabase to unlock Login</h1>
          <p className="mt-2 leading-relaxed">
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>,
            and <code>SUPABASE_SERVICE_ROLE_KEY</code> to <code>.env.local</code>, run{' '}
            <code>0001_initial_schema.sql</code> in Supabase SQL Editor, and restart the dev server.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-5 text-xs font-bold text-white"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (!session.user) {
    redirect('/login?next=/account');
  }

  const fallbackProfile = session.profile ?? {
    id: session.user.id,
    full_name: '',
    email: session.user.email || '',
    phone: '',
    role: 'user' as const,
    is_banned: false,
    created_at: new Date().toISOString(),
  };

  let consentCount = 0;
  const userSites: AccountSiteItem[] = [];
  const cfg = getWebzyPublicConfig();

  try {
    const supabase = await createSupabaseServerClient();
    const { count } = await supabase
      .from('consent_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id);
    consentCount = count ?? 0;

    const admin = createSupabaseAdminClient();
    const { data: rawSites } = await admin
      .from('sites')
      .select(
        'id, slug, status, hidden, reveal_at, expires_at, published_at, free_edit_until, first_opened_at, views_count, reply_text, content_json, theme_versions(theme_id)',
      )
      .eq('user_id', session.user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (rawSites) {
      const nowMs = Date.now();
      for (const row of rawSites) {
        const themeRel = row.theme_versions as
          | { theme_id?: string }
          | Array<{ theme_id?: string }>
          | null;
        const themeId = Array.isArray(themeRel) ? themeRel[0]?.theme_id : themeRel?.theme_id;
        const theme = themeId
          ? getThemeById(themeId, { includeMaanJao: cfg.flags.maanJaoTheme })
          : undefined;
        const content = (row.content_json as Record<string, string>) || {};
        const canFreeEdit =
          Boolean(row.free_edit_until) &&
          Date.parse(row.free_edit_until) > nowMs &&
          row.status !== 'removed' &&
          row.status !== 'expired';

        userSites.push({
          id: row.id,
          slug: row.slug,
          liveUrl: `${cfg.webUrl}/s/${row.slug}`,
          themeName: theme?.name.en || themeId || 'Webzy Greeting',
          receiverName: content.receiverName || 'Recipient',
          status: row.status,
          hidden: Boolean(row.hidden),
          viewsCount: row.views_count ?? 0,
          firstOpenedAt: row.first_opened_at || null,
          replyText: row.reply_text || null,
          canFreeEdit,
          freeEditUntil: row.free_edit_until || null,
          expiresAt: row.expires_at,
        });
      }
    }
    const userOrders: AccountOrderItem[] = [];
    const { data: rawOrders } = await admin
      .from('orders')
      .select('id, amount_paise, status, invoice_no, provider_order_id, created_at, sites(slug)')
      .eq('user_id', session.user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (rawOrders) {
      for (const o of rawOrders) {
        const siteRel = o.sites as { slug?: string } | Array<{ slug?: string }> | null;
        const siteSlug = Array.isArray(siteRel) ? siteRel[0]?.slug : siteRel?.slug;
        userOrders.push({
          id: o.id,
          amountInr: Math.round(o.amount_paise / 100),
          status: o.status,
          invoiceNumber: o.invoice_no || `WBZ-${o.id.slice(0, 8).toUpperCase()}`,
          createdAt: o.created_at,
          paymentId: o.provider_order_id || null,
          siteSlug: siteSlug || null,
        });
      }
    }

    return (
      <AccountClient
        profile={fallbackProfile}
        consentRecordsCount={consentCount}
        sites={userSites}
        orders={userOrders}
      />
    );
  } catch {
    consentCount = 0;
  }

  return (
    <AccountClient
      profile={fallbackProfile}
      consentRecordsCount={consentCount}
      sites={userSites}
      orders={[]}
    />
  );
}
