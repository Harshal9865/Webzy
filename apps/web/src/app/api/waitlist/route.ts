import { NextResponse, type NextRequest } from 'next/server';
import { logEvent } from '@webzy/core';
import { sendTransactionalEmail } from '../../../../../../infra/email/resend';
import { guardMutationRequest } from '../../../../../../infra/security/requestGuard';
import { getSupabaseEnv } from '../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';

const VALID_CATEGORIES = new Set(['coaching', 'medical', 'ecommerce', 'custom_business']);

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
