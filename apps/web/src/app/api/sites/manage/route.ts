import { NextResponse, type NextRequest } from 'next/server';
import {
  assertSafeReadyMadeText,
  evaluateSiteDeletionAndRestore,
  logEvent,
  SITE_DELETE_GRACE_DAYS,
  WebzyError,
} from '@webzy/core';
import { guardMutationRequest } from '../../../../../../../infra/security/requestGuard';
import { getAuthSessionState, writeAuditLog } from '../../../../../../../infra/supabase/auth';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

type SiteManageAction = 'hide' | 'unhide' | 'update_content' | 'soft_delete' | 'restore';

export async function POST(request: NextRequest | Request) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'site_manage',
      maxHits: 30,
      windowSeconds: 600,
    });
    if (guard) return guard;

    const session = await getAuthSessionState();
    if (!session.user) {
      return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      siteId?: string;
      action?: SiteManageAction;
      receiverName?: string;
      senderName?: string;
      message?: string;
    };
    const siteId = typeof body.siteId === 'string' ? body.siteId.trim() : '';
    const action = body.action;

    if (
      !siteId ||
      (action !== 'hide' &&
        action !== 'unhide' &&
        action !== 'update_content' &&
        action !== 'soft_delete' &&
        action !== 'restore')
    ) {
      return NextResponse.json({ error: 'Invalid site action.' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: site } = await admin
      .from('sites')
      .select(
        'id, slug, user_id, status, hidden, reveal_at, expires_at, deleted_at, delete_grace_until, is_lifetime, created_at, free_edit_until, content_json',
      )
      .eq('id', siteId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!site) {
      return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
    }

    const lifecycleState = evaluateSiteDeletionAndRestore({
      status: site.status,
      deletedAt: site.deleted_at ?? null,
      deleteGraceUntil: site.delete_grace_until ?? null,
      expiresAt: site.expires_at ?? null,
      isLifetime: Boolean(site.is_lifetime),
    });

    if (action === 'soft_delete') {
      if (!lifecycleState.canSoftDelete) {
        return NextResponse.json({ error: lifecycleState.reason }, { status: 409 });
      }
      const nowIso = new Date().toISOString();
      const graceUntilIso = new Date(
        Date.now() + SITE_DELETE_GRACE_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString();

      const { error: deleteErr } = await admin
        .from('sites')
        .update({
          deleted_at: nowIso,
          delete_grace_until: graceUntilIso,
          hidden: true,
        })
        .eq('id', site.id)
        .eq('user_id', session.user.id);

      if (deleteErr) {
        throw new Error(deleteErr.message);
      }

      await writeAuditLog({
        actorId: session.user.id,
        action: 'site_soft_deleted',
        entity: 'sites',
        entityId: site.id,
        meta: { slug: site.slug, deleteGraceUntil: graceUntilIso },
      });

      logEvent('info', 'web.site.sender_soft_deleted', {
        siteId: site.id,
        userId: session.user.id,
      });

      return NextResponse.json({
        ok: true,
        deletedAt: nowIso,
        deleteGraceUntil: graceUntilIso,
        graceDays: SITE_DELETE_GRACE_DAYS,
      });
    }

    if (action === 'restore') {
      if (!lifecycleState.canRestore) {
        return NextResponse.json({ error: lifecycleState.reason }, { status: 409 });
      }

      const isExpired =
        !site.is_lifetime &&
        Boolean(site.expires_at) &&
        Date.parse(String(site.expires_at)) <= Date.now();
      const isScheduled =
        !isExpired && Boolean(site.reveal_at) && Date.parse(String(site.reveal_at)) > Date.now();
      const nextStatus = isExpired ? 'expired' : isScheduled ? 'scheduled' : 'live';

      const { error: restoreErr } = await admin
        .from('sites')
        .update({
          deleted_at: null,
          delete_grace_until: null,
          hidden: false,
          status: nextStatus,
        })
        .eq('id', site.id)
        .eq('user_id', session.user.id);

      if (restoreErr) {
        throw new Error(restoreErr.message);
      }

      await writeAuditLog({
        actorId: session.user.id,
        action: 'site_restored',
        entity: 'sites',
        entityId: site.id,
        meta: { slug: site.slug, restoredStatus: nextStatus },
      });

      logEvent('info', 'web.site.sender_restored', {
        siteId: site.id,
        userId: session.user.id,
        status: nextStatus,
      });

      return NextResponse.json({
        ok: true,
        deletedAt: null,
        hidden: false,
        status: nextStatus,
      });
    }

    if (site.deleted_at || site.status === 'removed' || site.status === 'expired') {
      return NextResponse.json({ error: 'This site cannot be modified.' }, { status: 409 });
    }

    // 1. Creator Typo Hot-Fixer (within free_edit_until window or 48 hours of creation)
    if (action === 'update_content') {
      const freeEditUntilMs = Date.parse(site.free_edit_until || '');
      const createdAtMs = Date.parse(site.created_at || '');
      const isWithinEditWindow = !Number.isNaN(freeEditUntilMs)
        ? Date.now() <= freeEditUntilMs
        : !Number.isNaN(createdAtMs) && Date.now() - createdAtMs <= 48 * 60 * 60 * 1000;

      if (!isWithinEditWindow && process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'The 48-hour free edit window for this Webzy has ended.' },
          { status: 403 },
        );
      }

      const existingContent = (typeof site.content_json === 'object' && site.content_json ? site.content_json : {}) as Record<string, unknown>;
      const nextContent: Record<string, unknown> = {
        ...existingContent,
      };

      const updatedWeddingBase =
        existingContent.weddingData && typeof existingContent.weddingData === 'object'
          ? { ...(existingContent.weddingData as Record<string, unknown>) }
          : null;

      if (typeof body.receiverName === 'string' && body.receiverName.trim()) {
        const safeReceiver = assertSafeReadyMadeText(
          'Receiver name',
          body.receiverName.slice(0, 60),
          { allowPhone: Boolean(updatedWeddingBase) },
        );
        nextContent.receiverName = safeReceiver;
        if (updatedWeddingBase) {
          const parts = safeReceiver.split(/\s*(?:&|and|\+|संग)\s*/i).filter(Boolean);
          if (parts.length >= 2) {
            const nextBride = parts[0].trim().slice(0, 50);
            const nextGroom = parts[1].trim().slice(0, 50);
            updatedWeddingBase.brideName = nextBride;
            updatedWeddingBase.groomName = nextGroom;
            updatedWeddingBase.couple = `${nextBride} & ${nextGroom}`;
          }
        }
      }
      if (typeof body.senderName === 'string' && body.senderName.trim()) {
        nextContent.senderName = assertSafeReadyMadeText(
          'Your name',
          body.senderName.slice(0, 60),
          { allowPhone: Boolean(updatedWeddingBase) },
        );
      }
      if (typeof body.message === 'string' && body.message.trim()) {
        const safeMessage = assertSafeReadyMadeText(
          'Message',
          body.message.slice(0, 2000),
          { allowPhone: Boolean(updatedWeddingBase) },
        );
        nextContent.message = safeMessage;
        if (updatedWeddingBase) {
          updatedWeddingBase.personalMessage = safeMessage;
        }
      }

      if (updatedWeddingBase) {
        nextContent.weddingData = updatedWeddingBase;
      }

      const { error: updateError } = await admin
        .from('sites')
        .update({ content_json: nextContent })
        .eq('id', site.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      logEvent('info', 'web.site.sender_updated_content', {
        siteId: site.id,
        userId: session.user.id,
        receiverName: typeof nextContent.receiverName === 'string' ? nextContent.receiverName : undefined,
      });

      return NextResponse.json({
        ok: true,
        receiverName: nextContent.receiverName,
        senderName: nextContent.senderName,
      });
    }

    if (action === 'unhide') {
      const { data: pendingReport } = await admin
        .from('reports')
        .select('id')
        .eq('site_id', site.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (pendingReport) {
        return NextResponse.json(
          { error: 'This page is paused for a pending safety review and cannot be unhidden yet.' },
          { status: 403 },
        );
      }

      const isScheduled = site.reveal_at && Date.parse(site.reveal_at) > Date.now();
      const nextStatus = isScheduled ? 'scheduled' : 'live';
      await admin
        .from('sites')
        .update({ hidden: false, status: nextStatus })
        .eq('id', site.id);

      logEvent('info', 'web.site.sender_unhidden', { siteId: site.id, userId: session.user.id });
      return NextResponse.json({ ok: true, hidden: false, status: nextStatus });
    }

    await admin
      .from('sites')
      .update({ hidden: true, status: 'hidden' })
      .eq('id', site.id);

    logEvent('info', 'web.site.sender_hidden', { siteId: site.id, userId: session.user.id });
    return NextResponse.json({ ok: true, hidden: true, status: 'hidden' });
  } catch (err) {
    if (err instanceof WebzyError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.statusCode },
      );
    }
    logEvent('warn', 'web.site.manage_error', {
      message: err instanceof Error ? err.message.slice(0, 80) : 'unknown',
    });
    return NextResponse.json({ error: 'Could not update site status.' }, { status: 500 });
  }
}
