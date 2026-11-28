import { redirect } from 'next/navigation';
import { getAuthSessionState } from '../../../../../infra/supabase/auth';
import { getSupabaseEnv } from '../../../../../infra/supabase/env';
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from '../../../../../infra/supabase/server';
import {
  ProfileClient,
  type ProfileCustomRequestItem,
  type ProfileSavedDraftItem,
} from '../../components/profile/ProfileClient';

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
  let paidOrdersCount = 0;
  let liveSitesCount = 0;
  let savedDrafts: ProfileSavedDraftItem[] = [];
  let customRequests: ProfileCustomRequestItem[] = [];
  let initialAvatarUrl: string | null = null;

  try {
    const { adminConfigured } = getSupabaseEnv();
    const db = adminConfigured
      ? createSupabaseAdminClient()
      : await createSupabaseServerClient();
    const nowIso = new Date().toISOString();
    const avatarKey =
      typeof session.user.user_metadata?.avatar_storage_key === 'string'
        ? session.user.user_metadata.avatar_storage_key
        : null;

    const [consentRes, ordersRes, draftsRes, requestsRes, avatarRes] = await Promise.all([
      db
        .from('consent_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id),
      db
        .from('orders')
        .select('id, status, sites(id, status, deleted_at, expires_at, is_lifetime)')
        .eq('user_id', session.user.id)
        .in('status', ['paid', 'published'])
        .is('deleted_at', null)
        .limit(100),
      db
        .from('drafts')
        .select('id, draft_token, theme_id, content_json, updated_at, expires_at')
        .eq('user_id', session.user.id)
        .is('deleted_at', null)
        .gt('expires_at', nowIso)
        .order('updated_at', { ascending: false })
        .limit(6),
      db
        .from('custom_requests')
        .select('id, occasion, budget_tier, status, target_date, quoted_amount_inr, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(6),
      avatarKey && adminConfigured
        ? createSupabaseAdminClient()
            .storage.from('webzy-media')
            .createSignedUrl(avatarKey, 3600)
        : Promise.resolve({ data: null }),
    ]);

    consentCount = consentRes.count ?? 0;

    if (Array.isArray(ordersRes.data)) {
      paidOrdersCount = ordersRes.data.length;
      const nowMs = Date.now();
      for (const ord of ordersRes.data) {
        const rel = ord.sites as
          | {
              status?: string;
              deleted_at?: string | null;
              expires_at?: string | null;
              is_lifetime?: boolean | null;
            }
          | Array<{
              status?: string;
              deleted_at?: string | null;
              expires_at?: string | null;
              is_lifetime?: boolean | null;
            }>
          | null;
        const site = Array.isArray(rel) ? rel[0] : rel;
        if (!site || site.deleted_at) continue;
        const notExpired =
          Boolean(site.is_lifetime) ||
          !site.expires_at ||
          new Date(site.expires_at).getTime() > nowMs;
        if (site.status === 'live' && notExpired) {
          liveSitesCount += 1;
        }
      }
    }

    if (Array.isArray(draftsRes.data)) {
      savedDrafts = draftsRes.data
        .filter((d) => typeof d.draft_token === 'string' && d.draft_token.length > 0)
        .map((d) => {
          const content =
            d.content_json && typeof d.content_json === 'object'
              ? (d.content_json as Record<string, unknown>)
              : {};
          const receiver =
            typeof content.receiverName === 'string' && content.receiverName.trim()
              ? content.receiverName.trim()
              : typeof content.brideName === 'string' && typeof content.groomName === 'string'
                ? `${content.brideName} & ${content.groomName}`.trim()
                : '';
          return {
            id: String(d.id),
            draftToken: String(d.draft_token),
            themeId: typeof d.theme_id === 'string' ? d.theme_id : 'birthday-confetti-01',
            receiverName: receiver || null,
            updatedAt: String(d.updated_at || ''),
            expiresAt: String(d.expires_at || ''),
          };
        });
    }

    if (Array.isArray(requestsRes.data)) {
      customRequests = requestsRes.data.map((r) => ({
        id: String(r.id),
        occasion: String(r.occasion || 'other'),
        budgetTier: String(r.budget_tier || ''),
        status: String(r.status || 'new'),
        targetDate: r.target_date ? String(r.target_date) : null,
        quotedAmountInr: typeof r.quoted_amount_inr === 'number' ? r.quoted_amount_inr : null,
        createdAt: String(r.created_at || ''),
      }));
    }

    if (avatarRes?.data?.signedUrl) {
      initialAvatarUrl = avatarRes.data.signedUrl;
    }
  } catch {
    // Non-fatal fallback to minimal profile view
  }

  return (
    <ProfileClient
      profile={fallbackProfile}
      consentRecordsCount={consentCount}
      paidOrdersCount={paidOrdersCount}
      liveSitesCount={liveSitesCount}
      savedDrafts={savedDrafts}
      customRequests={customRequests}
      initialAvatarUrl={initialAvatarUrl}
    />
  );
}
