import { NextResponse, type NextRequest } from 'next/server';
import { logEvent } from '@webzy/core';
import { writeAuditLog } from '../../../../../../infra/supabase/auth';
import { requireVerifiedAdmin } from '../../../lib/requireAdmin';

export async function GET(request: NextRequest) {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let query = guard.admin
      .from('business_waitlist')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (category) {
      query = query.eq('category', category);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, waitlist: data || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Server error loading waitlist.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      id?: string;
      status?: 'waitlisted' | 'contacted' | 'in_progress' | 'made' | 'converted' | 'archived';
      notes?: string;
      checklist?: Record<string, boolean>;
      preview_url?: string;
      live_url?: string;
      quote_amount_inr?: number | null;
    };

    if (!body.id || !body.status) {
      return NextResponse.json({ error: 'Missing waitlist id or status.' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
      status: body.status,
    };
    if (typeof body.notes === 'string') {
      updatePayload.notes = body.notes;
    }
    if (body.checklist && typeof body.checklist === 'object') {
      updatePayload.checklist = body.checklist;
    }
    if (typeof body.preview_url === 'string') {
      updatePayload.preview_url = body.preview_url.trim();
    }
    if (typeof body.live_url === 'string') {
      updatePayload.live_url = body.live_url.trim();
    }
    if (typeof body.quote_amount_inr === 'number' && Number.isFinite(body.quote_amount_inr)) {
      updatePayload.quote_amount_inr = Math.round(body.quote_amount_inr);
    }

    let { error } = await guard.admin
      .from('business_waitlist')
      .update(updatePayload)
      .eq('id', body.id);

    // Graceful fallback if checklist/preview columns don't exist yet on unmigrated database
    if (error && (error.message.includes('checklist') || error.message.includes('preview_url') || error.message.includes('live_url') || error.message.includes('quote_amount_inr') || error.message.includes('check constraint'))) {
      const fallbackStatus = (body.status === 'made' || body.status === 'in_progress') ? 'contacted' : body.status;
      const fallbackPayload: Record<string, unknown> = {
        status: fallbackStatus,
      };
      if (typeof body.notes === 'string') {
        fallbackPayload.notes = body.notes;
      }
      const fallbackRes = await guard.admin
        .from('business_waitlist')
        .update(fallbackPayload)
        .eq('id', body.id);
      error = fallbackRes.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await writeAuditLog({
      actorId: guard.userId,
      action: 'admin.waitlist_status_updated',
      entity: 'business_waitlist',
      entityId: body.id,
      meta: { status: body.status },
    });

    logEvent('info', 'admin.waitlist.status_updated', { id: body.id, status: body.status });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error updating waitlist entry.' }, { status: 500 });
  }
}
