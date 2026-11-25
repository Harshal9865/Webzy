import { NextResponse } from 'next/server';
import { detectScamPatterns, logEvent } from '@webzy/core';
import { guardMutationRequest } from '../../../../../../../infra/security/requestGuard';
import { getSupabaseEnv } from '../../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

export const dynamic = 'force-dynamic';

const INDIAN_MOBILE_RE = /^(?:\+?91[\s-]?)?[6-9]\d{9}$/;

interface RsvpPayload {
  slug?: unknown;
  siteId?: unknown;
  guestName?: unknown;
  phone?: unknown;
  attending?: unknown;
  guestCount?: unknown;
  guestsCount?: unknown;
  mealPreference?: unknown;
  wishes?: unknown;
  message?: unknown;
}

export async function POST(request: Request) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'wedding_rsvp',
      maxHits: 10,
      windowSeconds: 300,
    });
    if (guard) return guard;

    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid RSVP payload.' },
        { status: 400 },
      );
    }

    const body = rawBody as RsvpPayload;

    if (typeof body.guestName !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Please enter your name or family name.' },
        { status: 400 },
      );
    }
    if (
      (body.slug !== undefined && typeof body.slug !== 'string') ||
      (body.siteId !== undefined && typeof body.siteId !== 'string') ||
      (body.phone !== undefined && body.phone !== null && typeof body.phone !== 'string') ||
      (body.wishes !== undefined && body.wishes !== null && typeof body.wishes !== 'string') ||
      (body.message !== undefined && body.message !== null && typeof body.message !== 'string')
    ) {
      return NextResponse.json(
        { ok: false, error: 'Invalid RSVP field format.' },
        { status: 400 },
      );
    }

    const guestName = body.guestName.trim().slice(0, 80);
    const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase().slice(0, 64) : '';
    const siteId = typeof body.siteId === 'string' ? body.siteId.trim().slice(0, 64) : '';
    const rawPhone = typeof body.phone === 'string' ? body.phone.trim() : '';

    if (!guestName || guestName.length < 2) {
      return NextResponse.json(
        { ok: false, error: 'Please enter your name or family name.' },
        { status: 400 },
      );
    }

    const nameCheck = detectScamPatterns(guestName);
    if (!nameCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Guest name contains restricted links or characters.' },
        { status: 400 },
      );
    }

    if (rawPhone && !INDIAN_MOBILE_RE.test(rawPhone)) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 },
      );
    }

    if (
      body.attending !== undefined &&
      typeof body.attending !== 'boolean' &&
      body.attending !== 'yes' &&
      body.attending !== 'no'
    ) {
      return NextResponse.json(
        { ok: false, error: 'Invalid attendance selection.' },
        { status: 400 },
      );
    }

    const rawCountVal = body.guestsCount ?? body.guestCount;
    if (
      rawCountVal !== undefined &&
      rawCountVal !== null &&
      (typeof rawCountVal !== 'number' || !Number.isFinite(rawCountVal))
    ) {
      return NextResponse.json(
        { ok: false, error: 'Invalid guest count.' },
        { status: 400 },
      );
    }

    if (
      body.mealPreference !== undefined &&
      body.mealPreference !== null &&
      body.mealPreference !== 'veg' &&
      body.mealPreference !== 'jain' &&
      body.mealPreference !== 'nonveg'
    ) {
      return NextResponse.json(
        { ok: false, error: 'Invalid meal preference.' },
        { status: 400 },
      );
    }

    const cleanPhone = rawPhone ? rawPhone.replace(/\D/g, '').slice(-10) : undefined;
    const isDeclining = body.attending === 'no' || body.attending === false;
    const attending: 'yes' | 'no' = isDeclining ? 'no' : 'yes';
    const guestCount =
      attending === 'yes'
        ? Math.min(10, Math.max(1, Math.floor(typeof rawCountVal === 'number' ? rawCountVal : 1)))
        : 0;
    const mealPreference =
      attending === 'no' || body.mealPreference === null
        ? null
        : body.mealPreference === 'jain' || body.mealPreference === 'nonveg'
          ? body.mealPreference
          : 'veg';

    const rawNote =
      typeof body.wishes === 'string'
        ? body.wishes
        : typeof body.message === 'string'
          ? body.message
          : '';
    const noteText = rawNote.trim().slice(0, 400);

    if (noteText) {
      const noteCheck = detectScamPatterns(noteText, { allowPhone: true });
      if (!noteCheck.allowed) {
        return NextResponse.json(
          { ok: false, error: 'Your note contains restricted links or payment details.' },
          { status: 400 },
        );
      }
    }

    const nowIso = new Date().toISOString();

    const rsvpEntry = {
      id: `rsvp_${Date.now().toString(36)}`,
      slug: slug || 'demo',
      guestName,
      ...(cleanPhone ? { phone: cleanPhone } : {}),
      attending,
      guestCount,
      guestsCount: guestCount,
      mealPreference,
      wishes: noteText,
      message: noteText,
      recordedAt: nowIso,
      submittedAt: nowIso,
    };

    if ((slug || siteId) && getSupabaseEnv().adminConfigured) {
      try {
        const admin = createSupabaseAdminClient();
        const query = admin
          .from('sites')
          .select('id, content_json')
          .is('deleted_at', null);
        const { data: site } = siteId
          ? await query.eq('id', siteId).maybeSingle()
          : await query.eq('slug', slug).maybeSingle();

        if (site) {
          const { error: rpcErr } = await admin.rpc('append_wedding_rsvp', {
            p_site_id: site.id,
            p_entry: rsvpEntry,
          });

          if (rpcErr) {
            const existingContent =
              site.content_json && typeof site.content_json === 'object'
                ? (site.content_json as Record<string, unknown>)
                : {};
            const prevList = Array.isArray(existingContent.rsvpResponses)
              ? existingContent.rsvpResponses
              : [];
            const nextList = [...prevList, rsvpEntry].slice(-500);
            const { error: updErr } = await admin
              .from('sites')
              .update({
                content_json: {
                  ...existingContent,
                  rsvpResponses: nextList,
                },
              })
              .eq('id', site.id);

            if (updErr) {
              logEvent('warn', 'web.weddings.rsvp_persist_failed', {
                siteId: site.id,
                rpcCode: rpcErr.code || 'unknown',
                dbCode: updErr.code || 'unknown',
              });
            }
          }
        }
      } catch (dbErr) {
        logEvent('warn', 'web.weddings.rsvp_persist_failed', {
          message: dbErr instanceof Error ? dbErr.message.slice(0, 120) : 'unknown',
        });
      }
    }

    return NextResponse.json({
      ok: true,
      rsvp: rsvpEntry,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Could not process RSVP right now.' },
      { status: 400 },
    );
  }
}
