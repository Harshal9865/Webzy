import { NextResponse, type NextRequest } from 'next/server';
import {
  assertSafeReadyMadeText,
  getWebzyPublicConfig,
  logEvent,
  parseLanguageCode,
  validateBusinessWhatsappNumber,
} from '@webzy/core';
import { getThemeById } from '@webzy/themes';
import { guardMutationRequest } from '../../../../../../../infra/security/requestGuard';
import { getAuthSessionState } from '../../../../../../../infra/supabase/auth';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

export async function PATCH(request: NextRequest | Request) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'site_edit',
      maxHits: 30,
      windowSeconds: 60,
    });
    if (guard) return guard;

    const session = await getAuthSessionState();
    if (!session.user) {
      return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      siteId?: string;
      receiverName?: string;
      senderName?: string;
      relation?: string;
      message?: string;
      language?: string;
      whatsappPhone?: string;
    };

    const siteId = typeof body.siteId === 'string' ? body.siteId.trim() : '';
    if (!siteId) {
      return NextResponse.json({ error: 'Missing siteId.' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: site } = await admin
      .from('sites')
      .select(
        'id, user_id, slug, content_json, status, free_edit_until, edit_count, deleted_at, theme_versions(theme_id)',
      )
      .eq('id', siteId)
      .eq('user_id', session.user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (!site) {
      return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
    }

    if (site.status === 'removed' || site.status === 'expired') {
      return NextResponse.json({ error: 'Expired or removed pages cannot be edited.' }, { status: 409 });
    }

    if (!site.free_edit_until || Date.parse(site.free_edit_until) <= Date.now()) {
      return NextResponse.json(
        { error: 'Your free 24-hour edit window has ended.' },
        { status: 403 },
      );
    }

    const receiverName = (body.receiverName || '').trim().slice(0, 60);
    const senderName = (body.senderName || '').trim().slice(0, 60);
    const relation = (body.relation || '').trim().slice(0, 60);
    const message = (body.message || '').trim().slice(0, 600);
    const language = parseLanguageCode(body.language);
    const whatsappPhone = (body.whatsappPhone || '').trim().slice(0, 20);

    if (receiverName.length < 1 || senderName.length < 1 || message.length < 5) {
      return NextResponse.json(
        { error: 'Please fill recipient name, your name, and a message (at least 5 characters).' },
        { status: 400 },
      );
    }

    const themeRel = site.theme_versions as
      | { theme_id?: string }
      | Array<{ theme_id?: string }>
      | null;
    const themeId = Array.isArray(themeRel) ? themeRel[0]?.theme_id : themeRel?.theme_id;
    const cfg = getWebzyPublicConfig();
    const theme = themeId
      ? getThemeById(themeId, { includeMaanJao: cfg.flags.maanJaoTheme })
      : undefined;

    assertSafeReadyMadeText('Recipient name', receiverName);
    assertSafeReadyMadeText('Sender name', senderName);
    assertSafeReadyMadeText('Message', message);
    if (theme?.occasion === 'business' && whatsappPhone) {
      validateBusinessWhatsappNumber(whatsappPhone);
    }

    const previousContent = (site.content_json as Record<string, unknown>) || {};
    const nextContent = {
      ...previousContent,
      receiverName,
      senderName,
      relation,
      message,
      language,
      whatsappPhone,
    };

    const nextRevision = (site.edit_count ?? 0) + 1;
    await admin.from('site_revisions').insert({
      site_id: site.id,
      revision_no: nextRevision,
      edited_by: session.user.id,
      previous_content_json: previousContent,
      new_content_json: nextContent,
    });

    await admin
      .from('sites')
      .update({
        content_json: nextContent,
        edit_count: nextRevision,
        last_edited_at: new Date().toISOString(),
      })
      .eq('id', site.id);

    logEvent('info', 'web.site.edited_free_window', {
      siteId: site.id,
      revisionNo: nextRevision,
    });

    return NextResponse.json({
      ok: true,
      slug: site.slug,
      editCount: nextRevision,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to save edits right now.';
    logEvent('warn', 'web.site.edit_error', { message: message.slice(0, 80) });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
