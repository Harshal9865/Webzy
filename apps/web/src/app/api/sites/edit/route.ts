import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import {
  assertSafeReadyMadeText,
  getWebzyPublicConfig,
  logEvent,
  parseLanguageCode,
  validateBusinessWhatsappNumber,
} from '@webzy/core';
import { getThemeById, parseWeddingLanguage, type WeddingEventItem } from '@webzy/themes';
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
      pinAction?: 'keep' | 'set' | 'remove';
      secretPin?: string;
      weddingPatch?: {
        brideName?: string;
        groomName?: string;
        brideParents?: string;
        groomParents?: string;
        venueName?: string;
        venueCity?: string;
        rsvpWhatsappNumber?: string;
        shagunUpiId?: string;
        events?: WeddingEventItem[];
      };
    };

    const siteId = typeof body.siteId === 'string' ? body.siteId.trim() : '';
    if (!siteId) {
      return NextResponse.json({ error: 'Missing siteId.' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: site } = await admin
      .from('sites')
      .select(
        'id, user_id, slug, content_json, status, created_at, free_edit_until, edit_count, deleted_at, theme_versions(theme_id)',
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

    const freeEditUntilMs = site.free_edit_until ? Date.parse(site.free_edit_until) : NaN;
    const createdAtMs = site.created_at ? Date.parse(site.created_at) : NaN;
    const isWithinEditWindow = !Number.isNaN(freeEditUntilMs)
      ? Date.now() <= freeEditUntilMs
      : !Number.isNaN(createdAtMs) && Date.now() - createdAtMs <= 48 * 60 * 60 * 1000;

    if (!isWithinEditWindow) {
      return NextResponse.json(
        { error: 'Your free edit window has ended.' },
        { status: 403 },
      );
    }

    const receiverName = (body.receiverName || '').trim().slice(0, 80);
    const senderName = (body.senderName || '').trim().slice(0, 100);
    const relation = (body.relation || '').trim().slice(0, 120);
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
    const isWedding = theme?.occasion === 'wedding';

    assertSafeReadyMadeText('Recipient name', receiverName, { allowPhone: isWedding });
    assertSafeReadyMadeText('Sender name', senderName, { allowPhone: isWedding });
    assertSafeReadyMadeText('Message', message, { allowPhone: isWedding });
    if (theme?.occasion === 'business' && whatsappPhone) {
      validateBusinessWhatsappNumber(whatsappPhone);
    }

    const previousContent = (site.content_json as Record<string, unknown>) || {};
    let updatedWeddingData = previousContent.weddingData;
    if (
      isWedding &&
      previousContent.weddingData &&
      typeof previousContent.weddingData === 'object'
    ) {
      const prevWedding = previousContent.weddingData as Record<string, unknown>;
      const coupleParts = receiverName.split(/\s*(?:&|and|\+|संग)\s*/i).filter(Boolean);
      const mappedWeddingLang = parseWeddingLanguage(language);
      const wp = body.weddingPatch;
      const nextBride = (wp?.brideName || coupleParts[0] || (prevWedding.brideName as string) || '').slice(0, 50);
      const nextGroom = (wp?.groomName || coupleParts[1] || (prevWedding.groomName as string) || '').slice(0, 50);
      const prevVenue =
        prevWedding.venueHighlight && typeof prevWedding.venueHighlight === 'object'
          ? (prevWedding.venueHighlight as Record<string, unknown>)
          : {};
      const prevRsvp =
        prevWedding.rsvp && typeof prevWedding.rsvp === 'object'
          ? (prevWedding.rsvp as Record<string, unknown>)
          : {};
      const prevShagun =
        prevWedding.shagun && typeof prevWedding.shagun === 'object'
          ? (prevWedding.shagun as Record<string, unknown>)
          : {};

      updatedWeddingData = {
        ...prevWedding,
        ...(mappedWeddingLang ? { language: mappedWeddingLang } : {}),
        ...(nextBride ? { brideName: nextBride } : {}),
        ...(nextGroom ? { groomName: nextGroom } : {}),
        ...(nextBride && nextGroom ? { couple: `${nextBride} & ${nextGroom}` } : {}),
        ...(wp?.brideParents || senderName ? { brideParents: (wp?.brideParents || senderName).slice(0, 100) } : {}),
        ...(typeof wp?.groomParents === 'string' ? { groomParents: wp.groomParents.slice(0, 100) } : {}),
        ...(relation ? { familyBlessingLine: relation } : {}),
        personalMessage: message,
        ...(wp?.venueName || wp?.venueCity
          ? {
              venueHighlight: {
                ...prevVenue,
                ...(wp.venueName ? { name: wp.venueName.slice(0, 80) } : {}),
                ...(wp.venueCity ? { city: wp.venueCity.slice(0, 80) } : {}),
              },
            }
          : {}),
        ...(typeof wp?.rsvpWhatsappNumber === 'string'
          ? {
              rsvp: {
                ...prevRsvp,
                whatsappNumber: wp.rsvpWhatsappNumber.slice(0, 20),
              },
            }
          : {}),
        ...(typeof wp?.shagunUpiId === 'string'
          ? {
              shagun: wp.shagunUpiId.trim()
                ? {
                    ...prevShagun,
                    enabled: true,
                    upiId: wp.shagunUpiId.trim().slice(0, 60),
                  }
                : {
                    ...prevShagun,
                    enabled: false,
                    upiId: '',
                  },
            }
          : {}),
        ...(Array.isArray(wp?.events) && wp.events.length > 0
          ? { events: wp.events.slice(0, 8) }
          : {}),
      };
    }

    const pinPatch: Record<string, unknown> = {};
    if (body.pinAction === 'set') {
      const cleanPin = typeof body.secretPin === 'string' ? body.secretPin.replace(/\D/g, '') : '';
      if (cleanPin.length !== 4) {
        return NextResponse.json(
          { error: 'Please enter a valid 4-digit numeric PIN.' },
          { status: 400 },
        );
      }
      const pinSalt =
        typeof previousContent.pinSalt === 'string' && previousContent.pinSalt
          ? previousContent.pinSalt
          : site.id;
      pinPatch.pinSalt = pinSalt;
      pinPatch.secretPinHash = crypto
        .createHash('sha256')
        .update(`webzy-pin:${pinSalt}:${cleanPin}`)
        .digest('hex');
      pinPatch.secretPinEnabled = true;
    } else if (body.pinAction === 'remove') {
      pinPatch.pinSalt = null;
      pinPatch.secretPinHash = null;
      pinPatch.secretPinEnabled = false;
    }

    const nextContent: Record<string, unknown> = {
      ...previousContent,
      receiverName,
      senderName,
      relation,
      message,
      language,
      whatsappPhone,
      ...(updatedWeddingData ? { weddingData: updatedWeddingData } : {}),
      ...pinPatch,
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
      secretPinEnabled: Boolean(
        typeof nextContent.secretPinHash === 'string' && nextContent.secretPinHash.length >= 32,
      ),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to save edits right now.';
    logEvent('warn', 'web.site.edit_error', { message: message.slice(0, 80) });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
