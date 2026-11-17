import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { logEvent } from '@webzy/core';
import { guardMutationRequest } from '../../../../../../../infra/security/requestGuard';
import { getAuthSessionState } from '../../../../../../../infra/supabase/auth';
import { getSupabaseEnv } from '../../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

export async function POST(request: NextRequest | Request) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'upload_purge',
      maxHits: 20,
      windowSeconds: 60,
    });
    if (guard) return guard;

    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
    }

    const session = await getAuthSessionState();
    const body = (await request.json().catch(() => ({}))) as {
      siteId?: string;
      draftToken?: string;
    };

    const siteId = typeof body.siteId === 'string' ? body.siteId.trim() : '';
    const draftToken = typeof body.draftToken === 'string' ? body.draftToken.trim() : '';

    if (!siteId && !draftToken) {
      return NextResponse.json({ error: 'Provide siteId or draftToken to purge photos.' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const storageKeysToDelete: string[] = [];
    const assetIdsToDelete: string[] = [];

    if (siteId) {
      if (!session.user) {
        return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
      }

      const { data: site } = await admin
        .from('sites')
        .select('id, user_id, draft_id, content_json')
        .eq('id', siteId)
        .eq('user_id', session.user.id)
        .is('deleted_at', null)
        .maybeSingle();

      if (!site) {
        return NextResponse.json({ error: 'Site not found or access denied.' }, { status: 404 });
      }

      // Query assets matching site or draft
      const { data: assets } = await admin
        .from('assets')
        .select('id, storage_key')
        .or(`site_id.eq.${site.id},draft_id.eq.${site.draft_id}`)
        .is('deleted_at', null);

      if (assets && assets.length > 0) {
        for (const a of assets) {
          if (a.storage_key) storageKeysToDelete.push(a.storage_key);
          assetIdsToDelete.push(a.id);
        }
      }

      // Execute storage file deletion
      if (storageKeysToDelete.length > 0) {
        await admin.storage.from('webzy-media').remove(storageKeysToDelete).catch(() => {});
      }

      // Mark assets as purged in DB
      const nowIso = new Date().toISOString();
      if (assetIdsToDelete.length > 0) {
        await admin
          .from('assets')
          .update({ status: 'purged', deleted_at: nowIso })
          .in('id', assetIdsToDelete);
      }

      // Sanitize site content_json so photo URLs are removed
      const currentContent = (site.content_json as Record<string, unknown>) || {};
      const updatedContent = { ...currentContent, photos: [] };
      await admin
        .from('sites')
        .update({ content_json: updatedContent })
        .eq('id', site.id);

      // Log DPDP right to erasure in consent_log
      try {
        await admin.from('consent_log').insert({
          user_id: session.user.id,
          consent_type: 'dpdp_erasure_photos',
          version: '1.0',
          metadata: {
            site_id: site.id,
            purged_assets_count: assetIdsToDelete.length,
            timestamp: nowIso,
          },
        });
      } catch {
        // Non-blocking consent log recording
      }

      logEvent('info', 'web.uploads.purged_by_user', {
        userId: session.user.id,
        siteId: site.id,
        count: assetIdsToDelete.length,
      });

      return NextResponse.json({
        ok: true,
        purgedCount: assetIdsToDelete.length,
        message: 'All photos permanently purged from cloud storage.',
      });
    }

    if (draftToken && /^[A-Za-z0-9_-]{24,128}$/.test(draftToken)) {
      const tokenHash = crypto.createHash('sha256').update(draftToken).digest('hex');
      const { data: draft } = await admin
        .from('drafts')
        .select('id')
        .eq('draft_token_hash', tokenHash)
        .is('deleted_at', null)
        .maybeSingle();

      if (!draft) {
        return NextResponse.json({ error: 'Draft not found.' }, { status: 404 });
      }

      const { data: assets } = await admin
        .from('assets')
        .select('id, storage_key')
        .eq('draft_id', draft.id)
        .is('deleted_at', null);

      if (assets && assets.length > 0) {
        for (const a of assets) {
          if (a.storage_key) storageKeysToDelete.push(a.storage_key);
          assetIdsToDelete.push(a.id);
        }
      }

      if (storageKeysToDelete.length > 0) {
        await admin.storage.from('webzy-media').remove(storageKeysToDelete).catch(() => {});
      }

      const nowIso = new Date().toISOString();
      if (assetIdsToDelete.length > 0) {
        await admin
          .from('assets')
          .update({ status: 'purged', deleted_at: nowIso })
          .in('id', assetIdsToDelete);
      }

      return NextResponse.json({
        ok: true,
        purgedCount: assetIdsToDelete.length,
        message: 'Draft photos purged successfully.',
      });
    }

    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  } catch (err) {
    logEvent('warn', 'web.uploads.purge_error', {
      message: err instanceof Error ? err.message.slice(0, 100) : 'unknown',
    });
    return NextResponse.json({ error: 'Unable to purge photos right now.' }, { status: 500 });
  }
}
