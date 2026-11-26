import type { SupabaseClient } from '@supabase/supabase-js';
import { logEvent, SITE_DELETE_GRACE_DAYS } from '@webzy/core';

export interface LifecycleMaintenanceSummary {
  unlockedScheduledCount: number;
  expiredSitesCount: number;
  cleanedDraftsCount: number;
  purgedAssetsCount: number;
  purgedDeletedSitesCount: number;
  purgedExpiredSitesCount: number;
}

async function purgeSiteMediaAndScrubPii(
  admin: SupabaseClient,
  siteIds: string[],
  nowIso: string,
  markDeletedAt: boolean,
): Promise<{ purgedAssets: number; purgedSites: number }> {
  if (siteIds.length === 0) {
    return { purgedAssets: 0, purgedSites: 0 };
  }

  let purgedAssets = 0;

  const { data: siteAssets } = await admin
    .from('assets')
    .select('id, storage_key')
    .in('site_id', siteIds)
    .is('deleted_at', null);

  if (siteAssets && siteAssets.length > 0) {
    const storageKeys = siteAssets
      .map((a) => a.storage_key)
      .filter((k): k is string => Boolean(k));

    if (storageKeys.length > 0) {
      await admin.storage.from('webzy-media').remove(storageKeys);
    }

    const assetIds = siteAssets.map((a) => a.id);
    await admin
      .from('assets')
      .update({ deleted_at: nowIso, status: 'deleted' })
      .in('id', assetIds);
    purgedAssets = assetIds.length;
  }

  const sitePatch: Record<string, unknown> = {
    status: 'removed',
    hidden: true,
    content_json: { purged: true, purgedAt: nowIso },
  };
  if (markDeletedAt) {
    sitePatch.deleted_at = nowIso;
  }

  await admin
    .from('sites')
    .update(sitePatch)
    .in('id', siteIds)
    .neq('status', 'removed');

  return { purgedAssets, purgedSites: siteIds.length };
}

export async function runLifecycleMaintenance(
  admin: SupabaseClient,
): Promise<LifecycleMaintenanceSummary> {
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

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

  // 2. Mark expired non-lifetime live sites (exclude is_lifetime = true and expires_at IS NULL)
  let { data: dueExpired, error: dueExpiredErr } = await admin
    .from('sites')
    .select('id')
    .eq('status', 'live')
    .eq('is_lifetime', false)
    .not('expires_at', 'is', null)
    .is('deleted_at', null)
    .lte('expires_at', nowIso)
    .limit(200);

  if (dueExpiredErr && dueExpiredErr.message?.includes('is_lifetime')) {
    const fallback = await admin
      .from('sites')
      .select('id')
      .eq('status', 'live')
      .not('expires_at', 'is', null)
      .is('deleted_at', null)
      .lte('expires_at', nowIso)
      .limit(200);
    dueExpired = fallback.data;
    dueExpiredErr = fallback.error;
  }

  let expiredSitesCount = 0;
  if (!dueExpiredErr && dueExpired && dueExpired.length > 0) {
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
      purgedAssetsCount += assetIds.length;
    }

    await admin
      .from('drafts')
      .update({ deleted_at: nowIso })
      .in('id', draftIds);
    cleanedDraftsCount = draftIds.length;
  }

  // 4. Purge soft-deleted sites whose 7-day restore grace period has ended
  let purgedDeletedSitesCount = 0;
  try {
    const { data: pastGraceSites, error: graceErr } = await admin
      .from('sites')
      .select('id')
      .not('deleted_at', 'is', null)
      .lte('delete_grace_until', nowIso)
      .neq('status', 'removed')
      .limit(100);

    if (!graceErr && pastGraceSites && pastGraceSites.length > 0) {
      const siteIds = pastGraceSites.map((s) => s.id);
      const purged = await purgeSiteMediaAndScrubPii(admin, siteIds, nowIso, false);
      purgedAssetsCount += purged.purgedAssets;
      purgedDeletedSitesCount = purged.purgedSites;
    }
  } catch {
    // Graceful skip if pre-0012 schema
  }

  // 5. DPDP compliance: auto-purge expired non-lifetime sites 7 days after expires_at
  let purgedExpiredSitesCount = 0;
  try {
    const dpdpCutoffIso = new Date(
      nowMs - SITE_DELETE_GRACE_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: dpdpExpiredSites, error: dpdpErr } = await admin
      .from('sites')
      .select('id')
      .eq('status', 'expired')
      .eq('is_lifetime', false)
      .is('deleted_at', null)
      .not('expires_at', 'is', null)
      .lte('expires_at', dpdpCutoffIso)
      .limit(100);

    if (!dpdpErr && dpdpExpiredSites && dpdpExpiredSites.length > 0) {
      const siteIds = dpdpExpiredSites.map((s) => s.id);
      const purged = await purgeSiteMediaAndScrubPii(admin, siteIds, nowIso, true);
      purgedAssetsCount += purged.purgedAssets;
      purgedExpiredSitesCount = purged.purgedSites;
    }
  } catch {
    // Graceful skip if pre-0012 schema
  }

  const summary: LifecycleMaintenanceSummary = {
    unlockedScheduledCount,
    expiredSitesCount,
    cleanedDraftsCount,
    purgedAssetsCount,
    purgedDeletedSitesCount,
    purgedExpiredSitesCount,
  };

  await admin.from('audit_log').insert({
    action: 'cron_lifecycle_run',
    entity: 'sites',
    meta: summary,
  });

  logEvent('info', 'cron.lifecycle_completed', { ...summary });
  return summary;
}
