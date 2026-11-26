import { NextResponse } from 'next/server';
import { getAuthSessionState } from '../../../../../../../infra/supabase/auth';
import { getSupabaseEnv } from '../../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthSessionState();

    if (!session.user) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          profile: null,
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        },
      );
    }

    let avatarUrl: string | null = null;
    const avatarKey =
      typeof session.user.user_metadata?.avatar_storage_key === 'string'
        ? session.user.user_metadata.avatar_storage_key
        : null;
    if (avatarKey && getSupabaseEnv().adminConfigured) {
      try {
        const admin = createSupabaseAdminClient();
        const { data: signed } = await admin.storage
          .from('webzy-media')
          .createSignedUrl(avatarKey, 3600);
        if (signed?.signedUrl) {
          avatarUrl = signed.signedUrl;
        }
      } catch {
        // Non-fatal; fallback to initials
      }
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email || session.profile?.email || '',
          avatarUrl,
        },
        profile: session.profile ?? null,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        profile: null,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    );
  }
}
