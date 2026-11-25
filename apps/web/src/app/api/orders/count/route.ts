import { NextResponse } from 'next/server';
import { getAuthSessionState } from '../../../../../../../infra/supabase/auth';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthSessionState();
    if (!session.user) {
      return NextResponse.json({ count: 0 });
    }

    const admin = createSupabaseAdminClient();
    const { count, error } = await admin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .in('status', ['paid', 'published'])
      .is('deleted_at', null);

    if (error) {
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
