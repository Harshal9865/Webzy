import { redirect } from 'next/navigation';
import { evaluateAdminAccess, isAdminMfaRequired } from '@webzy/core';
import { getAuthSessionState } from '../../../../../infra/supabase/auth';
import { MfaClient } from '../../components/MfaClient';

export const dynamic = 'force-dynamic';

export default async function AdminMfaPage() {
  const session = await getAuthSessionState();
  const gate = evaluateAdminAccess({
    isAuthenticated: Boolean(session.user),
    role: session.profile?.role,
    aal: session.aal,
    isBanned: session.profile?.is_banned,
    requireMfa: isAdminMfaRequired(),
  });

  if (gate === 'unauthenticated' || gate === 'forbidden') {
    redirect('/login');
  }
  if (gate === 'allowed') {
    redirect('/');
  }

  return <MfaClient adminEmail={session.profile?.email || session.user?.email || 'Admin'} />;
}
