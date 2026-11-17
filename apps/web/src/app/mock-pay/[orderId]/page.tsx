import { notFound, redirect } from 'next/navigation';
import { getWebzyPublicConfig } from '@webzy/core';
import { getAuthSessionState } from '../../../../../../infra/supabase/auth';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';
import { MockPayClient } from '../../../components/checkout/MockPayClient';

export const dynamic = 'force-dynamic';

export default async function MockPayPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const cfg = getWebzyPublicConfig();
  if (!cfg.isMockPaymentMode || cfg.payButtonDisabled) {
    notFound();
  }

  const session = await getAuthSessionState();
  const { orderId } = await params;

  if (!session.user) {
    redirect(`/login?next=${encodeURIComponent(`/mock-pay/${orderId}`)}`);
  }

  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('id, user_id, provider_order_id, amount_paise, status')
    .eq('id', orderId)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!order || !order.provider_order_id) {
    notFound();
  }

  if (order.status === 'published') {
    redirect(`/success/${order.id}`);
  }

  return (
    <MockPayClient
      orderId={order.id}
      providerOrderId={order.provider_order_id}
      amountPaise={order.amount_paise}
      status={order.status}
    />
  );
}
