import { NextResponse, type NextRequest } from 'next/server';
import { logEvent } from '@webzy/core';
import { writeAuditLog } from '../../../../../../infra/supabase/auth';
import { requireVerifiedAdmin } from '../../../lib/requireAdmin';

function escapeIlikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

function parsePagination(searchParams: URLSearchParams): { limit: number; offset: number } {
  const limitParam = searchParams.get('limit');
  const parsedLimit = limitParam !== null && limitParam.trim() !== '' ? Number(limitParam) : NaN;
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(100, Math.max(1, Math.trunc(parsedLimit)))
    : 50;

  const offsetParam = searchParams.get('offset');
  const parsedOffset = offsetParam !== null && offsetParam.trim() !== '' ? Number(offsetParam) : NaN;
  const offset = Number.isFinite(parsedOffset) ? Math.max(0, Math.trunc(parsedOffset)) : 0;

  return { limit, offset };
}

export async function GET(request: NextRequest) {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const status = searchParams.get('status');
    const { limit, offset } = parsePagination(searchParams);

    let query = guard.admin
      .from('sites')
      .select(
        'id, slug, user_id, status, hidden, views_count, reveal_at, expires_at, created_at, content_json, theme_versions(theme_id)',
        { count: 'exact' },
      )
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (q) {
      query = query.ilike('slug', `%${escapeIlikePattern(q)}%`);
    }

    const { data: sites, count, error } = await query;
    if (error) {
      logEvent('error', 'admin.sites.get_failed', {
        code: error.code || 'db_error',
        message: error.message.slice(0, 120),
      });
      return NextResponse.json({ error: 'Failed to load sites.' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      sites: sites || [],
      pagination: { limit, offset, total: count ?? 0 },
    });
  } catch (err) {
    logEvent('error', 'admin.sites.get_error', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Server error loading sites.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      siteId?: string;
      action?: 'pause' | 'unpause' | 'extend_30d' | 'update_content' | 'purge_photos' | 'clear_pin';
      brideName?: string;
      groomName?: string;
      content?: {
        receiverName?: string;
        senderName?: string;
        message?: string;
        brideName?: string;
        groomName?: string;
      };
    };

    const siteId = typeof body.siteId === 'string' ? body.siteId.trim() : '';
    if (!siteId || !body.action) {
      return NextResponse.json({ error: 'Missing siteId or action.' }, { status: 400 });
    }

    const { data: site, error: fetchErr } = await guard.admin
      .from('sites')
      .select('id, slug, status, hidden, expires_at, reveal_at, content_json, draft_id')
      .eq('id', siteId)
      .maybeSingle();

    if (fetchErr) {
      logEvent('error', 'admin.sites.fetch_failed', {
        siteId,
        code: fetchErr.code || 'db_error',
        message: fetchErr.message.slice(0, 120),
      });
      return NextResponse.json({ error: 'Failed to load site.' }, { status: 500 });
    }
    if (!site) {
      return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
    }

    let mutationError: { message: string; code?: string } | null = null;
    let nextExpiresAt: string | undefined;

    if (body.action === 'pause') {
      const { error } = await guard.admin
        .from('sites')
        .update({ hidden: true, status: 'hidden' })
        .eq('id', site.id);
      mutationError = error;
    } else if (body.action === 'unpause') {
      const isScheduled = Boolean(site.reveal_at && Date.parse(site.reveal_at) > Date.now());
      const { error } = await guard.admin
        .from('sites')
        .update({ hidden: false, status: isScheduled ? 'scheduled' : 'live' })
        .eq('id', site.id);
      mutationError = error;
    } else if (body.action === 'extend_30d') {
      const currentExp = site.expires_at ? Date.parse(site.expires_at) : Date.now();
      const baseMs = Math.max(Date.now(), Number.isNaN(currentExp) ? Date.now() : currentExp);
      nextExpiresAt = new Date(baseMs + 30 * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await guard.admin
        .from('sites')
        .update({ expires_at: nextExpiresAt, status: 'live', hidden: false })
        .eq('id', site.id);
      mutationError = error;
    } else if (body.action === 'update_content' && body.content) {
      const explicitBride =
        typeof body.content.brideName === 'string'
          ? body.content.brideName.trim().slice(0, 50)
          : typeof body.brideName === 'string'
            ? body.brideName.trim().slice(0, 50)
            : undefined;
      const explicitGroom =
        typeof body.content.groomName === 'string'
          ? body.content.groomName.trim().slice(0, 50)
          : typeof body.groomName === 'string'
            ? body.groomName.trim().slice(0, 50)
            : undefined;
      const rawReceiverName =
        typeof body.content.receiverName === 'string'
          ? body.content.receiverName.trim().slice(0, 80)
          : undefined;
      const receiverName =
        rawReceiverName ||
        (explicitBride && explicitGroom ? `${explicitBride} & ${explicitGroom}`.slice(0, 80) : rawReceiverName);
      const senderName =
        typeof body.content.senderName === 'string'
          ? body.content.senderName.trim().slice(0, 80)
          : undefined;
      const message =
        typeof body.content.message === 'string'
          ? body.content.message.trim().slice(0, 800)
          : undefined;

      const currentContent = (site.content_json as Record<string, unknown>) || {};
      let updatedWeddingData = currentContent.weddingData;

      if (currentContent.weddingData && typeof currentContent.weddingData === 'object') {
        const prevWedding = currentContent.weddingData as Record<string, unknown>;
        const coupleParts = (receiverName || '')
          .split(/\s*(?:&|and|\+|weds|संग|-|\/)\s*/i)
          .map((p) => p.trim())
          .filter(Boolean);
        const resolvedBride =
          explicitBride || (coupleParts.length >= 2 ? coupleParts[0].slice(0, 50) : undefined);
        const resolvedGroom =
          explicitGroom || (coupleParts.length >= 2 ? coupleParts[1].slice(0, 50) : undefined);
        const prevCouple =
          prevWedding.couple && typeof prevWedding.couple === 'object'
            ? (prevWedding.couple as Record<string, unknown>)
            : null;
        updatedWeddingData = {
          ...prevWedding,
          ...(resolvedBride ? { brideName: resolvedBride } : {}),
          ...(resolvedGroom ? { groomName: resolvedGroom } : {}),
          ...(prevCouple || resolvedBride || resolvedGroom
            ? {
                couple: {
                  ...(prevCouple || {}),
                  ...(resolvedBride ? { brideName: resolvedBride } : {}),
                  ...(resolvedGroom ? { groomName: resolvedGroom } : {}),
                },
              }
            : {}),
          ...(senderName !== undefined ? { brideParents: senderName } : {}),
          ...(message !== undefined ? { personalMessage: message } : {}),
        };
      }

      const updatedContent: Record<string, unknown> = {
        ...currentContent,
        ...(receiverName !== undefined ? { receiverName } : {}),
        ...(senderName !== undefined ? { senderName } : {}),
        ...(message !== undefined ? { message } : {}),
        ...(updatedWeddingData ? { weddingData: updatedWeddingData } : {}),
      };

      const { error } = await guard.admin
        .from('sites')
        .update({ content_json: updatedContent, updated_at: new Date().toISOString() })
        .eq('id', site.id);
      mutationError = error;
    } else if (body.action === 'clear_pin') {
      const currentContent = { ...((site.content_json as Record<string, unknown>) || {}) };
      delete currentContent.secretPinHash;
      delete currentContent.secretPinEnabled;
      delete currentContent.pinSalt;
      const { error } = await guard.admin
        .from('sites')
        .update({ content_json: currentContent, updated_at: new Date().toISOString() })
        .eq('id', site.id);
      mutationError = error;
    } else if (body.action === 'purge_photos') {
      const { data: assets } = await guard.admin
        .from('assets')
        .select('id, storage_key')
        .eq('site_id', site.id)
        .is('deleted_at', null);

      if (assets && assets.length > 0) {
        const keys = assets.map((a) => a.storage_key).filter(Boolean);
        if (keys.length > 0) {
          await guard.admin.storage.from('webzy-media').remove(keys).catch(() => {});
        }
        const { error: assetErr } = await guard.admin
          .from('assets')
          .update({ status: 'deleted', deleted_at: new Date().toISOString() })
          .eq('site_id', site.id)
          .is('deleted_at', null);
        if (assetErr) {
          logEvent('error', 'admin.sites.purge_assets_failed', {
            siteId: site.id,
            code: assetErr.code || 'db_error',
            message: assetErr.message.slice(0, 120),
          });
          return NextResponse.json({ error: 'Failed to purge site media.' }, { status: 500 });
        }
      }

      const currentContent = (site.content_json as Record<string, unknown>) || {};
      const nextContent: Record<string, unknown> = { ...currentContent, photos: [] };
      if (currentContent.weddingData && typeof currentContent.weddingData === 'object') {
        nextContent.weddingData = {
          ...(currentContent.weddingData as Record<string, unknown>),
          gallery: [],
        };
      }
      const { error } = await guard.admin
        .from('sites')
        .update({ content_json: nextContent, updated_at: new Date().toISOString() })
        .eq('id', site.id);
      mutationError = error;
    } else {
      return NextResponse.json({ error: 'Unsupported site action.' }, { status: 400 });
    }

    if (mutationError) {
      logEvent('error', 'admin.sites.patch_failed', {
        siteId: site.id,
        action: body.action,
        code: mutationError.code || 'db_error',
        message: mutationError.message.slice(0, 120),
      });
      return NextResponse.json({ error: 'Failed to update site.' }, { status: 500 });
    }

    await writeAuditLog({
      actorId: guard.userId,
      action: `admin.site_${body.action}`,
      entity: 'sites',
      entityId: site.id,
      meta: { slug: site.slug, action: body.action, ...(nextExpiresAt ? { nextExpiresAt } : {}) },
    });

    logEvent('info', 'admin.site.action_completed', { siteId: site.id, action: body.action });
    return NextResponse.json({ ok: true, ...(nextExpiresAt ? { expires_at: nextExpiresAt } : {}) });
  } catch (err) {
    logEvent('error', 'admin.sites.patch_error', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Server error updating site.' }, { status: 500 });
  }
}
