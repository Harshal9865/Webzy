import type { SupabaseClient } from '@supabase/supabase-js';
import { logEvent } from '@webzy/core';

export interface LifecycleMaintenanceSummary {
  unlockedScheduledCount: number;
  expiredSitesCount: number;
  cleanedDraftsCount: number;
  purgedAssetsCount: number;
}

export async function runLifecycleMaintenance(
  admin: SupabaseClient,
): Promise<LifecycleMaintenanceSummary> {
  const nowIso = new Date().toISOString();

  // 1. Unlock scheduled sites whose IST reveal time has passed
  const { data: dueScheduled } = await admin
    .from('sites')
    .select('id')
    .eq('status', 'scheduled')
    .eq('hidden', false)
    .is('deleted_at', null)
    .lte('reveal_at', nowIso)
    .limit(100);

  let unlockedScheduledCount = 0;
  if (dueScheduled && dueScheduled.length > 0) {
    const ids = dueScheduled.map((r) => r.id);
    await admin
      .from('sites')
      .update({ status: 'live' })
      .in('id', ids)
      .eq('status', 'scheduled');
    unlockedScheduledCount = ids.length;
  }

  // 2. Mark expired live sites
  const { data: dueExpired } = await admin
    .from('sites')
    .select('id')
    .eq('status', 'live')
    .is('deleted_at', null)
    .lte('expires_at', nowIso)
    .limit(200);

  let expiredSitesCount = 0;
  if (dueExpired && dueExpired.length > 0) {
    const ids = dueExpired.map((r) => r.id);
    await admin
      .from('sites')
      .update({ status: 'expired' })
      .in('id', ids)
      .eq('status', 'live');
    expiredSitesCount = ids.length;
  }

  // 3. Soft-delete expired unpaid drafts + clean orphaned draft assets
  const { data: expiredDrafts } = await admin
    .from('drafts')
    .select('id')
    .is('deleted_at', null)
    .lte('expires_at', nowIso)
    .limit(100);

  let cleanedDraftsCount = 0;
  let purgedAssetsCount = 0;

  if (expiredDrafts && expiredDrafts.length > 0) {
    const draftIds = expiredDrafts.map((d) => d.id);

    const { data: orphanAssets } = await admin
      .from('assets')
      .select('id, storage_key')
      .in('draft_id', draftIds)
      .is('site_id', null)
      .is('deleted_at', null);

    if (orphanAssets && orphanAssets.length > 0) {
      const storageKeys = orphanAssets
        .map((a) => a.storage_key)
        .filter((k): k is string => Boolean(k));

      if (storageKeys.length > 0) {
        await admin.storage.from('webzy-media').remove(storageKeys);
      }

      const assetIds = orphanAssets.map((a) => a.id);
      await admin
        .from('assets')
        .update({ deleted_at: nowIso, status: 'deleted' })
        .in('id', assetIds);
      purgedAssetsCount = assetIds.length;
    }

    await admin
      .from('drafts')
      .update({ deleted_at: nowIso })
      .in('id', draftIds);
    cleanedDraftsCount = draftIds.length;
  }

  const summary: LifecycleMaintenanceSummary = {
    unlockedScheduledCount,
    expiredSitesCount,
    cleanedDraftsCount,
    purgedAssetsCount,
  };

  await admin.from('audit_log').insert({
    action: 'cron_lifecycle_run',
    entity: 'sites',
    meta: summary,
  });

  logEvent('info', 'cron.lifecycle_completed', { ...summary });
  return summary;
}
