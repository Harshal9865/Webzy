import { NextResponse } from 'next/server';
import { logEvent } from '@webzy/core';
import { requireVerifiedAdmin } from '../../../../lib/requireAdmin';

export const dynamic = 'force-dynamic';

function escapeCsvCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function formatIstDate(isoStr: string | null | undefined): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    // Format in Asia/Kolkata
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return isoStr;
  }
}

export async function GET() {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const admin = guard.admin;

    const { data: orders, error } = await admin
      .from('orders')
      .select('id, invoice_no, status, amount_paise, currency, provider, provider_order_id, buyer_name, buyer_email, created_at, sites(slug)')
      .order('created_at', { ascending: false })
      .limit(5000);

    if (error) {
      throw new Error(error.message);
    }

    const headers = [
      'Invoice No',
      'Date (IST)',
      'Order ID',
      'Status',
      'Buyer Name',
      'Buyer Email',
      'Currency',
      'Base Amount (INR)',
      'GST 18% (INR)',
      'Total Paid (INR)',
      'Payment Provider',
      'Gateway Order ID',
      'Live Site Slug',
    ];

    const rows: string[] = [headers.map(escapeCsvCell).join(',')];

    for (const o of orders || []) {
      const siteRel = o.sites as { slug?: string } | Array<{ slug?: string }> | null;
      const s = Array.isArray(siteRel) ? siteRel[0] : siteRel;
      const slug = s?.slug || '';

      const totalInr = (o.amount_paise / 100);
      // In India, 18% GST inclusive calculation: Base = Total / 1.18, GST = Total - Base
      const baseInr = (totalInr / 1.18);
      const gstInr = (totalInr - baseInr);

      const row = [
        o.invoice_no || 'UNINVOICED',
        formatIstDate(o.created_at),
        o.id,
        o.status,
        o.buyer_name || 'Guest',
        o.buyer_email || '',
        o.currency || 'INR',
        baseInr.toFixed(2),
        gstInr.toFixed(2),
        totalInr.toFixed(2),
        o.provider,
        o.provider_order_id || '',
        slug,
      ];

      rows.push(row.map(escapeCsvCell).join(','));
    }

    // UTF-8 BOM (\uFEFF) ensures Microsoft Excel in Windows opens Indian names and rupee numbers cleanly
    const csvContent = '\uFEFF' + rows.join('\r\n');
    const today = new Date().toISOString().slice(0, 10);
    const filename = `webzy-orders-gst-reconciliation-${today}.csv`;

    logEvent('info', 'admin.orders.csv_exported', {
      exportedBy: guard.email,
      count: (orders || []).length,
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    logEvent('error', 'admin.orders.csv_export_error', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Failed to generate orders CSV.' }, { status: 500 });
  }
}
