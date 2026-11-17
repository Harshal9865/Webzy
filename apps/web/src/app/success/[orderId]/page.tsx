import { notFound, redirect } from 'next/navigation';
import { getWebzyPublicConfig } from '@webzy/core';
import { getAuthSessionState } from '../../../../../../infra/supabase/auth';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';
import { SuccessClient } from '../../../components/checkout/SuccessClient';

export const dynamic = 'force-dynamic';

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await getAuthSessionState();
  const { orderId } = await params;

  if (!session.user) {
    redirect(`/login?next=${encodeURIComponent(`/success/${orderId}`)}`);
  }

  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('id, user_id, draft_id, amount_paise, status, invoice_no, is_test')
    .eq('id', orderId)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!order) {
    notFound();
  }

  if (order.status !== 'published' && order.status !== 'paid') {
    redirect(`/mock-pay/${order.id}`);
  }

  const { data: site } = await admin
    .from('sites')
    .select('id, slug, free_edit_until')
    .eq('order_id', order.id)
    .maybeSingle();

  const cfg = getWebzyPublicConfig();
  const slug = site?.slug || order.id.slice(0, 12);
  const liveUrl = `${cfg.webUrl}/s/${slug}`;

  return (
    <SuccessClient
      orderId={order.id}
      siteId={site?.id}
      siteSlug={slug}
      liveUrl={liveUrl}
      invoiceNo={order.invoice_no || ''}
      amountPaise={order.amount_paise}
      isTest={Boolean(order.is_test)}
      businessName={cfg.business.name}
      businessAddress={cfg.business.address}
      freeEditUntil={site?.free_edit_until || undefined}
    />
  );
}
