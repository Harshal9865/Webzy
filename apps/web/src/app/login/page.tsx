import { redirect } from 'next/navigation';
import { sanitizeRedirectPath } from '@webzy/core';
import { getAuthSessionState } from '../../../../../infra/supabase/auth';
import { LoginClient } from '../../components/auth/LoginClient';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; draftToken?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = sanitizeRedirectPath(params.next, '/account');
  const session = await getAuthSessionState();

  if (session.user) {
    redirect(nextPath);
  }

  return (
    <LoginClient
      supabaseConfigured={session.configured}
      nextPath={nextPath}
      draftToken={params.draftToken}
      initialError={params.error}
    />
  );
}
