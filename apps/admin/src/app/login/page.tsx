import { redirect } from 'next/navigation';
import { evaluateAdminAccess, isAdminMfaRequired } from '@webzy/core';
import { getAuthSessionState } from '../../../../../infra/supabase/auth';
import { AdminLoginClient } from '../../components/AdminLoginClient';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const session = await getAuthSessionState();
  const gate = evaluateAdminAccess({
    isAuthenticated: Boolean(session.user),
    role: session.profile?.role,
    aal: session.aal,
    isBanned: session.profile?.is_banned,
    requireMfa: isAdminMfaRequired(),
  });

  if (gate === 'allowed') {
    redirect('/');
  }
  if (gate === 'mfa_required') {
    redirect('/mfa');
  }

  return <AdminLoginClient supabaseConfigured={session.configured} initialError={params.error} />;
}
