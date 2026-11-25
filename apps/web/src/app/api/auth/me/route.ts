import { NextResponse } from 'next/server';
import { getAuthSessionState } from '../../../../../../../infra/supabase/auth';

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

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email || session.profile?.email || '',
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
