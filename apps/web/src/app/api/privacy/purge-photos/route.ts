import { NextResponse, type NextRequest } from 'next/server';
import { logEvent } from '@webzy/core';
import { guardMutationRequest } from '../../../../../../../infra/security/requestGuard';
import { getAuthSessionState } from '../../../../../../../infra/supabase/auth';
import { getSupabaseEnv } from '../../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'privacy_purge_photos',
      maxHits: 5,
      windowSeconds: 3600,
    });
    if (guard) return guard;

    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json(
        { error: 'Storage service is not configured yet.' },
        { status: 503 },
      );
    }

    const session = await getAuthSessionState();
    if (!session.user) {
      return NextResponse.json(
        { error: 'Please sign in before purging uploaded photos.' },
        { status: 401 },
      );
    }

    const admin = createSupabaseAdminClient();
    const userId = session.user.id;

    // Collect assets owned directly by user_id as well as assets attached to the user's drafts or sites
    const [{ data: userDrafts }, { data: userSites }] = await Promise.all([
      admin.from('drafts').select('id').eq('user_id', userId),
      admin.from('sites').select('id').eq('user_id', userId),
    ]);

    const draftIds = (userDrafts || []).map((d) => d.id).filter(Boolean);
    const siteIds = (userSites || []).map((s) => s.id).filter(Boolean);

    const assetMap = new Map<string, { id: string; storage_key: string | null }>();

    const { data: directAssets } = await admin
      .from('assets')
      .select('id, storage_key')
      .eq('user_id', userId)
      .is('deleted_at', null);

    for (const row of directAssets || []) {
      assetMap.set(row.id, row);
    }

    if (draftIds.length > 0) {
      const { data: draftAssets } = await admin
        .from('assets')
        .select('id, storage_key')
        .in('draft_id', draftIds)
        .is('deleted_at', null);

      for (const row of draftAssets || []) {
        assetMap.set(row.id, row);
      }
    }

    if (siteIds.length > 0) {
      const { data: siteAssets } = await admin
        .from('assets')
        .select('id, storage_key')
        .in('site_id', siteIds)
        .is('deleted_at', null);

      for (const row of siteAssets || []) {
        assetMap.set(row.id, row);
      }
    }

    const assetsToPurge = Array.from(assetMap.values());
    if (assetsToPurge.length === 0) {
      return NextResponse.json({ ok: true, purgedCount: 0 });
    }

    const storageKeys = assetsToPurge
      .map((a) => a.storage_key)
      .filter((key): key is string => Boolean(key));

    if (storageKeys.length > 0) {
      // Supabase Storage remove supports batches cleanly
      for (let i = 0; i < storageKeys.length; i += 50) {
        const batch = storageKeys.slice(i, i + 50);
        await admin.storage.from('webzy-media').remove(batch).catch(() => {});
      }
    }

    const assetIds = assetsToPurge.map((a) => a.id);
    const nowIso = new Date().toISOString();
    const { error: updErr } = await admin
      .from('assets')
      .update({ status: 'deleted', deleted_at: nowIso })
      .in('id', assetIds);

    if (updErr) {
      logEvent('error', 'web.privacy.purge_photos_db_failed', {
        userId,
        dbCode: updErr.code || 'unknown',
      });
      return NextResponse.json(
        { error: 'Unable to complete photo purge right now. Please retry.' },
        { status: 500 },
      );
    }

    logEvent('info', 'web.privacy.photos_purged', {
      userId,
      purgedCount: assetIds.length,
    });

    return NextResponse.json({
      ok: true,
      purgedCount: assetIds.length,
    });
  } catch (err) {
    logEvent('error', 'web.privacy.purge_photos_exception', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json(
      { error: 'Could not complete vault purge right now. Please retry.' },
      { status: 500 },
    );
  }
}
