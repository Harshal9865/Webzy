import { NextResponse, type NextRequest } from 'next/server';
import { logEvent } from '@webzy/core';
import { sendTransactionalEmail } from '../../../../../../infra/email/resend';
import { guardMutationRequest } from '../../../../../../infra/security/requestGuard';
import { writeAuditLog } from '../../../../../../infra/supabase/auth';
import { getSupabaseEnv } from '../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';
import { requireVerifiedAdmin } from '../../../lib/requireAdmin';

const ALLOWED_WAITLIST_STATUSES = new Set([
  'waitlisted',
  'contacted',
  'in_progress',
  'made',
  'converted',
  'archived',
]);

function sanitizeHttpUrl(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.toString().slice(0, 300);
  } catch {
    return '';
  }
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
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const { limit, offset } = parsePagination(searchParams);

    let query = guard.admin
      .from('business_waitlist')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);

    const { data, count, error } = await query;
    if (error) {
      logEvent('error', 'admin.waitlist.get_failed', {
        code: error.code || 'db_error',
        message: error.message.slice(0, 120),
      });
      return NextResponse.json({ error: 'Failed to load waitlist.' }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      waitlist: data || [],
      pagination: { limit, offset, total: count ?? 0 },
    });
  } catch (err) {
    logEvent('error', 'admin.waitlist.get_error', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Server error loading waitlist.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireVerifiedAdmin(request);
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      id?: string;
      status?: string;
      notes?: string;
      checklist?: Record<string, boolean>;
      preview_url?: string;
      live_url?: string;
      quote_amount_inr?: number | null;
    };

    if (!body.id || !body.status) {
      return NextResponse.json({ error: 'Missing waitlist id or status.' }, { status: 400 });
    }

    const mappedStatus =
      body.status === 'completed'
        ? 'made'
        : body.status === 'new' || body.status === 'reviewing'
          ? 'waitlisted'
          : body.status;

    const safeStatus = ALLOWED_WAITLIST_STATUSES.has(mappedStatus) ? mappedStatus : 'contacted';

    const updatePayload: Record<string, unknown> = { status: safeStatus };
    if (typeof body.notes === 'string') {
      updatePayload.notes = body.notes.trim().slice(0, 1200);
    }
    if (body.checklist && typeof body.checklist === 'object') {
      updatePayload.checklist = body.checklist;
    }
    if (typeof body.preview_url === 'string') {
      updatePayload.preview_url = sanitizeHttpUrl(body.preview_url);
    }
    if (typeof body.live_url === 'string') {
      updatePayload.live_url = sanitizeHttpUrl(body.live_url);
    }
    if (body.quote_amount_inr === null) {
      updatePayload.quote_amount_inr = null;
    } else if (
      typeof body.quote_amount_inr === 'number' &&
      Number.isFinite(body.quote_amount_inr) &&
      body.quote_amount_inr >= 0
    ) {
      updatePayload.quote_amount_inr = Math.round(body.quote_amount_inr);
    }

    let { error } = await guard.admin
      .from('business_waitlist')
      .update(updatePayload)
      .eq('id', body.id);

    if (
      error &&
      (error.message.includes('checklist') ||
        error.message.includes('preview_url') ||
        error.message.includes('live_url') ||
        error.message.includes('quote_amount_inr') ||
        error.message.includes('check constraint'))
    ) {
      const fallbackStatus =
        safeStatus === 'made' || safeStatus === 'in_progress' ? 'contacted' : safeStatus;
      const fallbackPayload: Record<string, unknown> = { status: fallbackStatus };
      if (typeof body.notes === 'string') {
        fallbackPayload.notes = body.notes.trim().slice(0, 1200);
      }
      const fallbackRes = await guard.admin
        .from('business_waitlist')
        .update(fallbackPayload)
        .eq('id', body.id);
      error = fallbackRes.error;
    }

    if (error) {
      logEvent('error', 'admin.waitlist.patch_failed', {
        id: body.id,
        code: error.code || 'db_error',
        message: error.message.slice(0, 120),
      });
      return NextResponse.json({ error: 'Failed to update waitlist entry.' }, { status: 500 });
    }

    await writeAuditLog({
      actorId: guard.userId,
      action: 'admin.waitlist_status_updated',
      entity: 'business_waitlist',
      entityId: body.id,
      meta: { status: safeStatus },
    });

    logEvent('info', 'admin.waitlist.status_updated', { id: body.id, status: safeStatus });
    return NextResponse.json({ ok: true, status: safeStatus });
  } catch (err) {
    logEvent('error', 'admin.waitlist.patch_error', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Server error updating waitlist entry.' }, { status: 500 });
  }
}

const VALID_CATEGORIES = new Set([
  'coaching',
  'medical',
  'ecommerce',
  'wedding_bespoke',
  'custom_business',
]);

export async function POST(request: NextRequest) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'business_waitlist',
      maxHits: 6,
      windowSeconds: 3600,
    });
    if (guard) return guard;

    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json({ error: 'Database is not configured yet.' }, { status: 503 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      email?: string;
      phone?: string;
      category?: string;
      businessName?: string;
      city?: string;
      notes?: string;
    };

    const name = (body.name || '').trim().slice(0, 100);
    const email = (body.email || '').trim().toLowerCase().slice(0, 120);
    const phone = (body.phone || '').trim().slice(0, 20);
    const category = typeof body.category === 'string' && VALID_CATEGORIES.has(body.category)
      ? body.category
      : 'custom_business';
    const businessName = (body.businessName || '').trim().slice(0, 120);
    const city = (body.city || '').trim().slice(0, 80);
    const notes = (body.notes || '').trim().slice(0, 1000);

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    // Check for existing signup in same category
    const { data: existing } = await admin
      .from('business_waitlist')
      .select('id, status')
      .eq('email', email)
      .eq('category', category)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        ok: true,
        alreadyWaitlisted: true,
        message: 'You are already on the priority waitlist! We will notify you first upon launch.',
      });
    }

    const { data: inserted, error: insertErr } = await admin
      .from('business_waitlist')
      .insert({
        name,
        email,
        phone,
        category,
        business_name: businessName,
        city,
        notes,
        status: 'waitlisted',
      })
      .select('id')
      .single();

    if (insertErr || !inserted) {
      logEvent('error', 'waitlist.insert_failed', {
        error: insertErr?.message?.slice(0, 120),
      });
      return NextResponse.json(
        { error: 'Could not save waitlist entry. Please retry.' },
        { status: 500 },
      );
    }

    // Get current total waitlist count to return queue position
    const { count: totalWaitlisted } = await admin
      .from('business_waitlist')
      .select('id', { count: 'exact', head: true });

    logEvent('info', 'waitlist.entry_added', {
      id: inserted.id,
      category,
      city,
    });

    // Notify founder if email is configured
    sendTransactionalEmail({
      to: 'harshalkr220@gmail.com',
      subject: `[Webzy Studio Waitlist] New Lead: ${businessName || name} (${category})`,
      text: `New Studio Waitlist Lead:\n\nName: ${name}\nBusiness: ${businessName || 'N/A'}\nCategory: ${category}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nCity: ${city || 'N/A'}\nNotes: ${notes || 'None'}\n\nQueue Position: #${totalWaitlisted ?? 1}`,
      idempotencyKey: `waitlist_${inserted.id}`,
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      queuePosition: totalWaitlisted ?? 1,
      message: 'You have joined the priority waitlist for Webzy Studio!',
    });
  } catch (err) {
    logEvent('error', 'waitlist.post_error', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Server error. Please retry.' }, { status: 500 });
  }
}
