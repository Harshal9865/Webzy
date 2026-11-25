import { redirect } from 'next/navigation';
import { getWebzyPublicConfig } from '@webzy/core';
import { getAuthSessionState } from '../../../../../infra/supabase/auth';
import { getSupabaseEnv } from '../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../infra/supabase/server';
import { OrdersClient, type OrderItem } from '../../components/orders/OrdersClient';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const session = await getAuthSessionState();

  if (!session.configured) {
    redirect('/login?next=/orders');
  }

  if (!session.user) {
    redirect('/login?next=/orders');
  }

  const cfg = getWebzyPublicConfig();
  const userOrders: OrderItem[] = [];

  if (getSupabaseEnv().adminConfigured) {
    try {
      const admin = createSupabaseAdminClient();
      const { data: rawOrders } = await admin
        .from('orders')
        .select('id, amount_paise, status, invoice_no, provider_order_id, addons_json, is_test, created_at, sites(id, slug, status, hidden, views_count, first_opened_at, free_edit_until, expires_at, content_json, theme_versions(theme_id))')
        .eq('user_id', session.user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (rawOrders) {
        const nowMs = Date.now();
        for (const o of rawOrders) {
          const siteRel = o.sites as {
            id?: string;
            slug?: string;
            status?: string;
            views_count?: number;
            first_opened_at?: string;
            free_edit_until?: string;
            expires_at?: string;
            content_json?: Record<string, unknown>;
            theme_versions?: { theme_id?: string } | Array<{ theme_id?: string }> | null;
          } | Array<{
            id?: string;
            slug?: string;
            status?: string;
            views_count?: number;
            first_opened_at?: string;
            free_edit_until?: string;
            expires_at?: string;
            content_json?: Record<string, unknown>;
            theme_versions?: { theme_id?: string } | Array<{ theme_id?: string }> | null;
          }> | null;

          const site = Array.isArray(siteRel) ? siteRel[0] : siteRel;
          const siteSlug = site?.slug || null;
          const siteId = site?.id || null;
          const content = site?.content_json || {};
          const tvRel = site?.theme_versions;
          const tv = Array.isArray(tvRel) ? tvRel[0] : tvRel;
          const themeId = typeof tv?.theme_id === 'string' ? tv.theme_id : null;
          const brideName = typeof content.brideName === 'string' ? content.brideName : '';
          const groomName = typeof content.groomName === 'string' ? content.groomName : '';
          const receiverName =
            typeof content.receiverName === 'string' && content.receiverName.trim()
              ? content.receiverName
              : brideName && groomName
                ? `${brideName} & ${groomName}`
                : null;
          const message =
            typeof content.message === 'string'
              ? content.message
              : typeof content.personalMessage === 'string'
                ? content.personalMessage
                : null;
          const rsvpCount = Array.isArray(content.rsvpResponses) ? content.rsvpResponses.length : 0;
          const freeEditUntilMs = site?.free_edit_until ? Date.parse(site.free_edit_until) : NaN;
          const canFreeEdit =
            !Number.isNaN(freeEditUntilMs) &&
            freeEditUntilMs > nowMs &&
            site?.status !== 'removed' &&
            site?.status !== 'expired';

          const rawAddons = o.addons_json as unknown;
          const addons: string[] = Array.isArray(rawAddons)
            ? rawAddons.filter((x): x is string => typeof x === 'string')
            : rawAddons && typeof rawAddons === 'object'
              ? Object.entries(rawAddons as Record<string, boolean>)
                  .filter(([, v]) => Boolean(v))
                  .map(([k]) => k)
              : [];

          userOrders.push({
            id: o.id,
            amountInr: Math.round(o.amount_paise / 100),
            status: o.status,
            invoiceNumber: o.invoice_no || `WBZ-${o.id.slice(0, 8).toUpperCase()}`,
            createdAt: o.created_at,
            paymentId: o.provider_order_id || null,
            isTest: Boolean(o.is_test),
            siteSlug,
            siteId,
            siteStatus: site?.status || null,
            themeId,
            viewsCount: site?.views_count ?? 0,
            rsvpCount,
            addons,
            receiverName,
            message,
            firstOpenedAt: site?.first_opened_at || null,
            canFreeEdit,
            freeEditUntil: site?.free_edit_until || null,
            expiresAt: site?.expires_at || null,
          });
        }
      }
    } catch {
      // Return empty orders on query failure
    }
  }

  return (
    <OrdersClient
      orders={userOrders}
      webUrl={cfg.webUrl}
      userEmail={session.user.email || 'Your Account'}
    />
  );
}
