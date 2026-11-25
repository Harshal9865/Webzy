import { NextResponse, type NextRequest } from 'next/server';
import { getWebzyPublicConfig, logEvent } from '@webzy/core';
import { requireVerifiedAdmin } from '../../../../lib/requireAdmin';

export const dynamic = 'force-dynamic';

function escapeCsvCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function formatIstDate(isoStr: string | null | undefined): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return isoStr;
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

export async function GET(request: NextRequest) {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const liveOnly = searchParams.get('liveOnly') === 'true';
    const paidOnly = searchParams.get('paidOnly') === 'true';
    const cfg = getWebzyPublicConfig();
    const gstRegistered = Boolean(cfg.gstRegistered);

    const admin = guard.admin;

    let query = admin
      .from('orders')
      .select(
        'id, invoice_no, status, amount_paise, fee_estimate_paise, currency, provider, provider_order_id, buyer_name, buyer_email, buyer_phone, addons_json, is_test, created_at, sites(slug)',
      )
      .order('created_at', { ascending: false })
      .limit(5000);

    if (liveOnly) {
      query = query.eq('is_test', false);
    }
    if (paidOnly) {
      query = query.in('status', ['paid', 'published']);
    }

    const { data: orders, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    const headers = [
      'Invoice No',
      'Date (IST)',
      'Order ID',
      'Order Mode',
      'Status',
      'Buyer Name',
      'Buyer Email',
      'Buyer Phone',
      'Add-ons',
      'Currency',
      'Base Amount (INR)',
      gstRegistered ? 'GST 18% (INR)' : 'GST (Not Registered)',
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

      const rawAddons = o.addons_json;
      const addonsList = Array.isArray(rawAddons)
        ? rawAddons
            .filter((x): x is string => typeof x === 'string')
            .map((id) =>
              id === 'pin'
                ? 'Secret PIN'
                : id === 'video'
                  ? 'Video Export'
                  : id === 'extend_14d'
                    ? '14d Validity'
                    : id === 'extend_21d'
                      ? '21d Validity'
                      : id === 'extend' || id === 'extend_90d'
                        ? '3m (90d) Validity'
                        : id,
            )
            .join('; ')
        : (() => {
            const addonsObj = (
              rawAddons && typeof rawAddons === 'object' ? rawAddons : {}
            ) as Record<string, boolean>;
            return [
              addonsObj.secretPin ? 'Secret PIN' : null,
              addonsObj.videoCard ? 'Video Export' : null,
              addonsObj.extend14d ? '14d Validity' : null,
              addonsObj.extend21d ? '21d Validity' : null,
              addonsObj.extendValidity90d ? '3m (90d) Validity' : null,
            ]
              .filter(Boolean)
              .join('; ');
          })();

      const totalInr = (o.amount_paise || 0) / 100;
      const baseInr = gstRegistered ? totalInr / 1.18 : totalInr;
      const gstInr = gstRegistered ? totalInr - baseInr : 0;

      const row = [
        o.invoice_no || 'UNINVOICED',
        formatIstDate(o.created_at),
        o.id,
        o.is_test ? 'TEST' : 'LIVE',
        o.status,
        o.buyer_name || 'Guest',
        o.buyer_email || '',
        o.buyer_phone || '',
        addonsList || 'None',
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

    const csvContent = '\uFEFF' + rows.join('\r\n');
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    const suffix = liveOnly ? 'live-only' : 'all';
    const filename = `webzy-orders-${suffix}-${today}.csv`;

    logEvent('info', 'admin.orders.csv_exported', {
      exportedBy: guard.email,
      count: (orders || []).length,
      liveOnly,
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
