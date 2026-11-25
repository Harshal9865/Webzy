import { redirect } from 'next/navigation';
import { getAuthSessionState } from '../../../../../infra/supabase/auth';
import { createSupabaseServerClient } from '../../../../../infra/supabase/server';
import { ProfileClient } from '../../components/profile/ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getAuthSessionState();

  if (!session.configured) {
    redirect('/login?next=/profile');
  }

  if (!session.user) {
    redirect('/login?next=/profile');
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
  try {
    const supabase = await createSupabaseServerClient();
    const { count } = await supabase
      .from('consent_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id);
    consentCount = count ?? 0;
  } catch {
    consentCount = 0;
  }

  return (
    <ProfileClient
      profile={fallbackProfile}
      consentRecordsCount={consentCount}
    />
  );
}
