'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { formatInr, getSiteCopy } from '@webzy/core';
import { useLanguage } from '../shell/LanguageProvider';

export interface OrderItem {
  id: string;
  amountInr: number;
  status: string;
  invoiceNumber: string;
  createdAt: string;
  paymentId: string | null;
  isTest?: boolean;
  siteSlug: string | null;
  siteId?: string | null;
  siteStatus?: string | null;
  themeId?: string | null;
  viewsCount?: number;
  rsvpCount?: number;
  addons?: string[];
  receiverName?: string | null;
  message?: string | null;
  firstOpenedAt?: string | null;
  canFreeEdit?: boolean;
  freeEditUntil?: string | null;
  expiresAt?: string | null;
}

interface OrdersClientProps {
  orders: OrderItem[];
  webUrl: string;
  userEmail: string;
}

type OrderFilter = 'all' | 'live' | 'wedding' | 'other';
type OrderSort = 'newest' | 'views' | 'amount';

interface ThemeVisualMeta {
  title: string;
  category: string;
  imageUrl?: string;
  gradient: string;
  accentHex: string;
}

const THEME_META: Record<string, ThemeVisualMeta> = {
  'wedding-emerald-01': {
    title: 'Emerald Darbar',
    category: 'Royal Wedding Invite',
    imageUrl: '/templates/wedding-emerald-01/art/jharokha-scene.jpg',
    gradient: 'from-[#163120] to-[#264D34]',
    accentHex: '#D4AF37',
  },
  'wedding-royal-red-01': {
    title: 'Royal Red Mahal',
    category: 'Royal Wedding Invite',
    imageUrl: '/templates/wedding-royal-red-01/art/mughal-scene.jpg',
    gradient: 'from-[#4A0614] to-[#7A1025]',
    accentHex: '#E5C158',
  },
  'wedding-temple-gold-01': {
    title: 'Kashi Swarna',
    category: 'South Indian Wedding',
    imageUrl: '/templates/wedding-temple-gold-01/art/temple-gold-scene.jpg',
    gradient: 'from-[#4A1215] to-[#7C2D12]',
    accentHex: '#F3D27A',
  },
  'wedding-rose-ivory-01': {
    title: 'Gulab Bagh',
    category: 'Palace Pastel Wedding',
    imageUrl: '/templates/wedding-rose-ivory-01/art/rose-palace-scene.jpg',
    gradient: 'from-[#7A4457] to-[#B07185]',
    accentHex: '#F7E0B5',
  },
  'wedding-royal-blue-01': {
    title: 'Neela Rajwada',
    category: 'Jodhpur Royal Wedding',
    imageUrl: '/templates/wedding-royal-blue-01/art/jodhpur-scene.jpg',
    gradient: 'from-[#13244C] to-[#243E78]',
    accentHex: '#E9C46A',
  },
  'wedding-christian-ivory-01': {
    title: 'Grace Cathedral',
    category: 'Christian Wedding',
    imageUrl: '/templates/wedding-christian-ivory-01/art/chapel-scene.jpg',
    gradient: 'from-[#364940] to-[#577064]',
    accentHex: '#E5D1A4',
  },
  'birthday-confetti-01': {
    title: 'Birthday Confetti',
    category: 'Birthday Gift Link',
    gradient: 'from-[#E11D63] to-[#F43F5E]',
    accentHex: '#FFE4EC',
  },
  'birthday-ashirwad-01': {
    title: 'Birthday Ashirwad',
    category: 'Family Birthday Tribute',
    gradient: 'from-[#B45309] to-[#D97706]',
    accentHex: '#FEF3C7',
  },
  'will-you-01': {
    title: 'Will You?',
    category: 'Romantic Invite',
    gradient: 'from-[#BE123C] to-[#E11D48]',
    accentHex: '#FFE4E6',
  },
  'our-timeline-01': {
    title: 'Our Timeline',
    category: 'Anniversary Story',
    gradient: 'from-[#9D174D] to-[#DB2777]',
    accentHex: '#FCE7F3',
  },
  'maan-jao-01': {
    title: 'Maan Jao',
    category: 'Sweet Apology Card',
    gradient: 'from-[#DB2777] to-[#EC4899]',
    accentHex: '#FDF2F8',
  },
  'make-them-smile-01': {
    title: 'Make Them Smile',
    category: 'Gratitude & Care',
    gradient: 'from-[#0F766E] to-[#14B8A6]',
    accentHex: '#CCFBF1',
  },
  'our-year-01': {
    title: 'Our Year Recap',
    category: 'Yearbook Link',
    gradient: 'from-[#5B21B6] to-[#7C3AED]',
    accentHex: '#EDE9FE',
  },
  'harvest-greeting-01': {
    title: 'Harvest Greeting',
    category: 'Festival Greeting',
    gradient: 'from-[#C2410C] to-[#EA580C]',
    accentHex: '#FFEDD5',
  },
  'business-greeting-01': {
    title: 'Business Greeting',
    category: 'Festival Business Card',
    gradient: 'from-[#1D4ED8] to-[#2563EB]',
    accentHex: '#DBEAFE',
  },
};

const ADDON_READABLE: Record<string, string> = {
  pin: 'PIN Lock',
  secretPin: 'PIN Lock',
  video: 'Status Video',
  videoCard: 'Status Video',
  extend_14d: '14d Validity',
  extend_21d: '21d Validity',
  extend: '3m (90d) Validity',
  extendValidity90d: '3m (90d) Validity',
};

function formatDateShort(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

function formatDateTimeIst(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

function getDaysRemaining(expiresAt?: string | null): number | null {
  if (!expiresAt) return null;
  const ms = Date.parse(expiresAt);
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.ceil((ms - Date.now()) / (1000 * 60 * 60 * 24)));
}

function getThemeMeta(themeId?: string | null): ThemeVisualMeta {
  if (themeId && THEME_META[themeId]) return THEME_META[themeId];
  return {
    title: themeId ? themeId.replace(/-\d+$/, '').replace(/-/g, ' ') : 'Digital Celebration',
    category: 'Celebration Link',
    gradient: 'from-[#E11D63] to-[#BE185D]',
    accentHex: '#FFE4EF',
  };
}

function isOrderLive(ord: OrderItem): boolean {
  const isSettled = ord.status === 'paid' || ord.status === 'published';
  const isSiteActive =
    ord.siteStatus !== 'removed' &&
    ord.siteStatus !== 'expired' &&
    ord.siteStatus !== 'hidden';
  return Boolean(ord.siteSlug && isSettled && isSiteActive);
}

export function OrdersClient({ orders, webUrl, userEmail }: OrdersClientProps) {
  const { language } = useLanguage();
  const site = getSiteCopy(language);
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [sortBy, setSortBy] = useState<OrderSort>('newest');
  const [search, setSearch] = useState('');
  const [orderList, setOrderList] = useState<OrderItem[]>(orders);
  const [failedThumbs, setFailedThumbs] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const closeEditTimerRef = useRef<number | null>(null);

  // Modals
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<OrderItem | null>(null);
  const [shareOrder, setShareOrder] = useState<OrderItem | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);
  const [editReceiverName, setEditReceiverName] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editNotice, setEditNotice] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    setOrderList(orders);
  }, [orders]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      if (closeEditTimerRef.current) window.clearTimeout(closeEditTimerRef.current);
    };
  }, []);

  const hasModalOpen = Boolean(selectedReceiptOrder || editingOrder || shareOrder);
  useEffect(() => {
    if (!hasModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedReceiptOrder(null);
        setShareOrder(null);
        setEditingOrder(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [hasModalOpen]);

  const cleanBase = webUrl.replace(/\/+$/, '');

  const counts = useMemo(() => {
    const live = orderList.filter((o) => isOrderLive(o)).length;
    const wedding = orderList.filter((o) => o.themeId?.startsWith('wedding-')).length;
    const other = orderList.filter(
      (o) => !isOrderLive(o) && o.status !== 'paid' && o.status !== 'published',
    ).length;
    const totalViews = orderList.reduce((sum, o) => sum + (o.viewsCount || 0), 0);
    return { total: orderList.length, live, wedding, other, totalViews };
  }, [orderList]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = orderList.filter((ord) => {
      if (filter === 'live' && !isOrderLive(ord)) return false;
      if (filter === 'wedding' && !ord.themeId?.startsWith('wedding-')) return false;
      if (
        filter === 'other' &&
        (isOrderLive(ord) || ord.status === 'paid' || ord.status === 'published')
      ) {
        return false;
      }

      if (!q) return true;
      const meta = getThemeMeta(ord.themeId);
      const hay = [
        ord.invoiceNumber,
        ord.siteSlug || '',
        ord.receiverName || '',
        meta.title,
        meta.category,
        ord.message || '',
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'views') return (b.viewsCount || 0) - (a.viewsCount || 0);
      if (sortBy === 'amount') return (b.amountInr || 0) - (a.amountInr || 0);
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
  }, [orderList, filter, search, sortBy]);

  async function copyWithFeedback(key: string, text: string) {
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        copied = document.execCommand('copy');
        textarea.remove();
      } catch {
        copied = false;
      }
    }
    if (copied) {
      setCopiedKey(key);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopiedKey(null), 2200);
    }
  }

  function openTypoModal(order: OrderItem) {
    if (closeEditTimerRef.current) {
      window.clearTimeout(closeEditTimerRef.current);
      closeEditTimerRef.current = null;
    }
    setEditingOrder(order);
    setEditReceiverName(order.receiverName || '');
    setEditMessage(order.message || '');
    setEditNotice(null);
    setEditError(null);
  }

  async function handleSaveTypo(e: React.FormEvent) {
    e.preventDefault();
    if (!editingOrder || !editingOrder.siteId) return;
    setSavingEdit(true);
    setEditNotice(null);
    setEditError(null);

    try {
      const res = await fetch('/api/sites/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: editingOrder.siteId,
          action: 'update_content',
          receiverName: editReceiverName.trim(),
          message: editMessage.trim() || undefined,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update content.');
      }

      setOrderList((prev) =>
        prev.map((o) =>
          o.id === editingOrder.id
            ? {
                ...o,
                receiverName: editReceiverName.trim(),
                message: editMessage.trim() || o.message,
              }
            : o,
        ),
      );
      setEditNotice('Saved. Your live link updated immediately.');
      if (closeEditTimerRef.current) window.clearTimeout(closeEditTimerRef.current);
      closeEditTimerRef.current = window.setTimeout(() => {
        setEditingOrder(null);
        setEditNotice(null);
      }, 1400);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Could not update order.');
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="min-h-[84vh] bg-[#F4F5F7] font-sans text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-9 animate-fade-in">
        {/* Clean Amazon / Flipkart Breadcrumb + Page Title + Prominent Order Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <nav aria-label="Breadcrumb" className="mb-1 text-xs font-medium text-slate-500">
              <Link href="/" className="hover:text-webzy-primary hover:underline">
                Home
              </Link>
              <span className="mx-1.5">/</span>
              <span className="font-semibold text-slate-800">{site.account.ordersTitle}</span>
            </nav>
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h1 className="font-sans text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {site.account.ordersTitle}
              </h1>
              <span className="text-sm font-medium text-slate-500 font-tabular">
                ({counts.total} {counts.total === 1 ? 'order' : 'orders'} · {counts.live} live ·{' '}
                {counts.totalViews} guest views)
              </span>
            </div>
          </div>

          <Link
            href="/themes"
            className="btn-spring inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-xl bg-webzy-primary px-5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Link</span>
          </Link>
        </div>

        {/* Sticky Amazon/Flipkart-Style Search & Filter Bar */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search Input (Amazon style prominent search) */}
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by recipient name, theme, invoice number or /s/link..."
                className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-webzy-primary focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                aria-label="Sort orders"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as OrderSort)}
                className="min-h-[42px] rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none focus:border-webzy-primary"
              >
                <option value="newest">Recent First</option>
                <option value="views">Most Viewed</option>
                <option value="amount">Highest Price</option>
              </select>
            </div>
          </div>

          {/* Meesho / Flipkart Clean Filter Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            {(
              [
                { id: 'all', label: `All Orders (${counts.total})` },
                { id: 'live', label: `Active & Live (${counts.live})` },
                ...(counts.wedding > 0
                  ? [{ id: 'wedding' as const, label: `Weddings (${counts.wedding})` }]
                  : []),
                ...(counts.other > 0
                  ? [{ id: 'other' as const, label: `Refunded / Pending (${counts.other})` }]
                  : []),
              ] as const
            ).map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`min-h-[34px] rounded-full px-3.5 text-xs font-semibold transition active:scale-95 ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders List (Amazon Top Metadata Strip + Meesho Visual Card + Flipkart Tracker) */}
        <div className="mt-5 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-2xs animate-fade-in">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                {search || filter !== 'all' ? 'No matching orders found' : 'You have no orders yet'}
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">
                {search || filter !== 'all'
                  ? 'Try clearing your search or switching order filters above.'
                  : 'Create an interactive birthday, anniversary, or wedding website in under 2 minutes.'}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                {search || filter !== 'all' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFilter('all');
                      setSearch('');
                    }}
                    className="btn-spring inline-flex min-h-[42px] items-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Show All Orders
                  </button>
                ) : null}
                <Link
                  href="/themes"
                  className="btn-spring inline-flex min-h-[42px] items-center rounded-xl bg-webzy-primary px-6 text-sm font-semibold text-white shadow-sm hover:opacity-95"
                >
                  Explore Themes (From ₹29)
                </Link>
              </div>
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isLive = isOrderLive(ord);
              const isPaid = ord.status === 'paid' || ord.status === 'published';
              const isRefunded =
                ord.status === 'refunded' || ord.status === 'partially_refunded';
              const isFailed = ord.status === 'failed';
              const isPending = ord.status === 'payment_pending' || ord.status === 'draft';
              const meta = getThemeMeta(ord.themeId);
              const liveHref = ord.siteSlug ? `/s/${ord.siteSlug}` : null;
              const fullLiveUrl = ord.siteSlug ? `${cleanBase}/s/${ord.siteSlug}` : null;
              const daysLeft = getDaysRemaining(ord.expiresAt);
              const isWedding = Boolean(ord.themeId?.startsWith('wedding-'));
              const addonsText = (ord.addons || [])
                .map((k) => ADDON_READABLE[k])
                .filter(Boolean)
                .join(' · ');

              const waShareUrl = fullLiveUrl
                ? `https://wa.me/?text=${encodeURIComponent(
                    ord.receiverName
                      ? `Made a special celebration card for ${ord.receiverName}: ${fullLiveUrl}`
                      : `Open this special celebration card: ${fullLiveUrl}`,
                  )}`
                : null;

              const statusHeadline = isLive
                ? ord.firstOpenedAt
                  ? `Opened by recipient on ${formatDateTimeIst(ord.firstOpenedAt)}`
                  : 'Live & ready to share on WhatsApp'
                : isRefunded
                  ? 'Order refunded · Link deactivated'
                  : isFailed
                    ? 'Payment failed · No amount charged'
                    : isPending
                      ? 'Payment pending completion'
                      : ord.siteStatus === 'expired'
                        ? 'Validity period completed'
                        : 'Order settled';

              const statusToneClass = isLive
                ? 'text-emerald-700'
                : isRefunded || isFailed
                  ? 'text-red-700'
                  : 'text-amber-700';

              const showArtThumb = Boolean(meta.imageUrl && !failedThumbs[ord.id]);

              return (
                <article
                  key={ord.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                >
                  {/* ZONE 1: Amazon-Style Structured Order Metadata Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-[#F8F9FB] px-4 py-3 text-xs sm:px-6">
                    <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Order Placed
                        </p>
                        <p suppressHydrationWarning className="mt-0.5 font-semibold text-slate-800 font-tabular">
                          {formatDateShort(ord.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Total Paid
                        </p>
                        <p className="mt-0.5 font-bold text-slate-900 font-tabular">
                          {formatInr(ord.amountInr)}
                          {ord.isTest ? (
                            <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                              TEST
                            </span>
                          ) : null}
                        </p>
                      </div>

                      {ord.receiverName ? (
                        <div className="hidden sm:block">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                            Made For
                          </p>
                          <p className="mt-0.5 max-w-[180px] truncate font-semibold text-slate-800">
                            {ord.receiverName}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-right">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Order #
                        </p>
                        <button
                          type="button"
                          onClick={() => void copyWithFeedback(`inv:${ord.id}`, ord.invoiceNumber)}
                          title="Copy order invoice number"
                          className="mt-0.5 font-mono text-xs font-semibold text-slate-700 hover:text-webzy-primary"
                        >
                          {copiedKey === `inv:${ord.id}` ? 'Copied!' : ord.invoiceNumber}
                        </button>
                      </div>
                      <span className="hidden sm:inline text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptOrder(ord)}
                        className="text-xs font-semibold text-[#007185] hover:text-webzy-primary hover:underline"
                      >
                        GST Invoice
                      </button>
                    </div>
                  </div>

                  {/* ZONE 2: Meesho Thumbnail + Readable Content + Amazon Right Action Stack */}
                  <div className="p-4 sm:p-6">
                    {/* Clear Level-1 Status Anchor */}
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${
                            isLive
                              ? 'bg-emerald-600'
                              : isRefunded || isFailed
                                ? 'bg-red-600'
                                : 'bg-amber-500'
                          }`}
                          aria-hidden="true"
                        />
                        <h2 className={`text-sm sm:text-base font-bold ${statusToneClass}`}>
                          {statusHeadline}
                        </h2>
                      </div>

                      {daysLeft !== null && isLive ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 font-tabular">
                          Valid for {daysLeft} more day{daysLeft === 1 ? '' : 's'}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      {/* Left: Visual Product Thumbnail + Product Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3.5 sm:gap-4">
                          {/* Visual Thumbnail Anchor */}
                          <Link
                            href={liveHref || '/themes'}
                            target={liveHref ? '_blank' : undefined}
                            className={`relative h-24 w-20 sm:h-28 sm:w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br ${meta.gradient} shadow-xs transition-transform duration-200 hover:scale-[1.03]`}
                          >
                            {showArtThumb ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={meta.imageUrl}
                                alt={meta.title}
                                onError={() =>
                                  setFailedThumbs((prev) => ({ ...prev, [ord.id]: true }))
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center text-white">
                                <span
                                  className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold"
                                  style={{ color: meta.accentHex }}
                                >
                                  w
                                </span>
                                <span className="line-clamp-2 text-[10px] font-bold leading-tight text-white/95">
                                  {meta.title}
                                </span>
                              </div>
                            )}
                          </Link>

                          {/* Readable Plain-English Order Info */}
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="text-base font-bold text-slate-900">
                                {meta.title}
                              </span>
                              <span className="text-xs font-medium text-slate-500">
                                · {meta.category}
                              </span>
                            </div>

                            {ord.receiverName ? (
                              <p className="text-sm font-medium text-slate-800">
                                Recipient: <span className="font-semibold">{ord.receiverName}</span>
                              </p>
                            ) : null}

                            {ord.message ? (
                              <p className="line-clamp-1 max-w-xl text-xs text-slate-500">
                                &ldquo;{ord.message}&rdquo;
                              </p>
                            ) : null}

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs text-slate-600 font-tabular">
                              <span>
                                <strong className="text-slate-900">{ord.viewsCount ?? 0}</strong> guest
                                views
                              </span>
                              {isWedding || (ord.rsvpCount ?? 0) > 0 ? (
                                <span>
                                  · <strong className="text-slate-900">{ord.rsvpCount ?? 0}</strong>{' '}
                                  RSVP{(ord.rsvpCount ?? 0) === 1 ? '' : 's'}
                                </span>
                              ) : null}
                              {addonsText ? <span>· Add-ons: {addonsText}</span> : null}
                            </div>
                          </div>
                        </div>

                        {/* Flipkart-style 3-Step Visual Progress Tracker (Full width on mobile so 3 steps never squeeze beside thumbnail) */}
                        {!isRefunded && !isFailed ? (
                          <div className="pt-3 sm:pl-28">
                            <div className="flex max-w-md items-center text-[11px] font-semibold">
                              <div className="flex shrink-0 items-center gap-1.5 text-emerald-700">
                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">
                                  ✓
                                </span>
                                <span>Paid</span>
                              </div>
                              <div
                                className={`mx-2 h-0.5 flex-1 rounded-full ${
                                  isLive || isPaid ? 'bg-emerald-500' : 'bg-slate-200'
                                }`}
                              />
                              <div
                                className={`flex shrink-0 items-center gap-1.5 ${
                                  isLive ? 'text-emerald-700' : 'text-slate-400'
                                }`}
                              >
                                <span
                                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                                    isLive
                                      ? 'bg-emerald-600 text-white'
                                      : 'border-2 border-slate-300 bg-white'
                                  }`}
                                >
                                  {isLive ? '✓' : ''}
                                </span>
                                <span>Link Live</span>
                              </div>
                              <div
                                className={`mx-2 h-0.5 flex-1 rounded-full ${
                                  ord.firstOpenedAt ? 'bg-emerald-500' : 'bg-slate-200'
                                }`}
                              />
                              <div
                                className={`flex shrink-0 items-center gap-1.5 ${
                                  ord.firstOpenedAt ? 'text-emerald-700' : 'text-slate-500'
                                }`}
                              >
                                <span
                                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                                    ord.firstOpenedAt
                                      ? 'bg-emerald-600 text-white'
                                      : isLive
                                        ? 'border-2 border-amber-500 bg-amber-50'
                                        : 'border-2 border-slate-300 bg-white'
                                  }`}
                                >
                                  {ord.firstOpenedAt ? '✓' : ''}
                                </span>
                                <span>Opened</span>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Right: Amazon / Flipkart Clean Action Stack */}
                      <div className="flex w-full shrink-0 flex-col gap-2 md:w-56">
                        {isPending && ord.isTest ? (
                          <Link
                            href={`/mock-pay/${ord.id}`}
                            className="btn-spring inline-flex min-h-[40px] w-full items-center justify-center rounded-xl bg-amber-500 px-4 text-sm font-semibold text-slate-950 shadow-2xs hover:bg-amber-400"
                          >
                            Finish Payment →
                          </Link>
                        ) : null}

                        {waShareUrl && isLive ? (
                          <a
                            href={waShareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-spring inline-flex min-h-[40px] w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-2xs hover:bg-emerald-700"
                          >
                            Share on WhatsApp
                          </a>
                        ) : null}

                        {liveHref ? (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                fullLiveUrl && void copyWithFeedback(`url:${ord.id}`, fullLiveUrl)
                              }
                              className="btn-spring inline-flex min-h-[38px] items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                            >
                              {copiedKey === `url:${ord.id}` ? 'Copied!' : 'Copy Link'}
                            </button>
                            <a
                              href={liveHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-spring inline-flex min-h-[38px] items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                            >
                              View Live ↗
                            </a>
                          </div>
                        ) : null}

                        {ord.siteId && ord.canFreeEdit !== false ? (
                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              href={`/edit/${ord.siteId}`}
                              className="btn-spring inline-flex min-h-[36px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 hover:border-webzy-primary hover:text-webzy-primary"
                            >
                              Edit Card
                            </Link>
                            <button
                              type="button"
                              onClick={() => openTypoModal(ord)}
                              className="btn-spring inline-flex min-h-[36px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 hover:border-webzy-primary hover:text-webzy-primary"
                            >
                              Quick Fix
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Clean Order Footer Utility Links */}
                    {ord.siteSlug ? (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                        <span className="font-mono text-xs text-slate-600">
                          Link: <strong className="text-slate-800">/s/{ord.siteSlug}</strong>
                        </span>
                        <div className="flex flex-wrap items-center gap-4 font-semibold text-[#007185]">
                          <button
                            type="button"
                            onClick={() => setShareOrder(ord)}
                            className="hover:text-webzy-primary hover:underline"
                          >
                            Share Kit &amp; QR
                          </button>
                          <Link
                            href={`/success/${ord.id}`}
                            className="hover:text-webzy-primary hover:underline"
                          >
                            Printable QR Page
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* 1. GST Tax Invoice Modal */}
        {selectedReceiptOrder ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedReceiptOrder(null);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="orders-receipt-title"
              className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 shadow-2xl animate-scale-in"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-slate-500">Tax Invoice</p>
                    {selectedReceiptOrder.isTest ||
                    selectedReceiptOrder.paymentId?.startsWith('mock_') ||
                    selectedReceiptOrder.invoiceNumber.toUpperCase().includes('TEST') ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                        TEST ORDER · Not a Tax Invoice
                      </span>
                    ) : null}
                  </div>
                  <h3 id="orders-receipt-title" className="mt-0.5 text-lg font-bold text-slate-900">
                    {selectedReceiptOrder.invoiceNumber}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReceiptOrder(null)}
                  aria-label="Close invoice"
                  className="flex h-11 w-11 -mr-1.5 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  ×
                </button>
              </div>

              {(() => {
                const amountInr = selectedReceiptOrder.amountInr;
                const halfGst = Number(((amountInr - amountInr / 1.18) / 2).toFixed(2));
                const taxable = Number((amountInr - halfGst * 2).toFixed(2));
                return (
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-1.5">
                      <div className="flex justify-between gap-3 font-semibold text-slate-900">
                        <span className="shrink-0">Billed To:</span>
                        <span className="break-all text-right">{userEmail}</span>
                      </div>
                      <div className="flex justify-between gap-3 text-slate-600">
                        <span className="shrink-0">Order Date:</span>
                        <span suppressHydrationWarning className="text-right">{formatDateTimeIst(selectedReceiptOrder.createdAt)}</span>
                      </div>
                      <div className="flex justify-between gap-3 text-slate-600">
                        <span className="shrink-0">SAC Code:</span>
                        <span className="font-mono text-right">998314 (Digital Portal Services)</span>
                      </div>
                      {selectedReceiptOrder.paymentId ? (
                        <div className="flex justify-between gap-3 text-slate-600 font-mono text-[11px]">
                          <span className="shrink-0">Payment ID:</span>
                          <span className="break-all text-right">{selectedReceiptOrder.paymentId}</span>
                        </div>
                      ) : null}

                      <div className="mt-2 space-y-1 border-t border-slate-200 pt-2 text-slate-600">
                        <div className="flex justify-between">
                          <span>Taxable Value</span>
                          <span className="font-tabular">₹{taxable.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CGST (9%)</span>
                          <span className="font-tabular">₹{halfGst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SGST (9%)</span>
                          <span className="font-tabular">₹{halfGst.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="mt-2 flex justify-between border-t border-slate-300 pt-2 text-sm font-bold text-slate-900">
                        <span>Grand Total</span>
                        <span className="text-emerald-700 font-tabular">₹{amountInr.toFixed(2)}</span>
                      </div>
                    </div>

                    <p className="text-center text-[11px] text-slate-500">
                      SAC 998314 · 18% GST inclusive · Computer-generated receipt by Webzy.
                    </p>
                  </div>
                );
              })()}

              <div className="mt-5 flex justify-end gap-2.5 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-spring rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceiptOrder(null)}
                  className="btn-spring rounded-xl bg-webzy-primary px-5 py-2 text-xs font-semibold text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* 2. Quick Share & Celebration Kit Modal */}
        {shareOrder && shareOrder.siteSlug ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShareOrder(null);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="orders-share-title"
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-in"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-webzy-primary">
                    Instant Share Kit
                  </span>
                  <h3 id="orders-share-title" className="text-lg font-bold text-slate-900">
                    {shareOrder.receiverName || shareOrder.invoiceNumber}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShareOrder(null)}
                  aria-label="Close share dialog"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-bold text-slate-800">Shareable Live Link</p>
                  <p className="mt-1 break-all font-mono text-xs font-semibold text-webzy-primary">
                    {cleanBase}/s/{shareOrder.siteSlug}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void copyWithFeedback(
                          `modal-link:${shareOrder.id}`,
                          `${cleanBase}/s/${shareOrder.siteSlug}`,
                        )
                      }
                      className="btn-spring rounded-xl bg-webzy-primary px-4 py-2 text-xs font-semibold text-white"
                    >
                      {copiedKey === `modal-link:${shareOrder.id}` ? 'Copied Link!' : 'Copy Live URL'}
                    </button>
                    <Link
                      href={`/success/${shareOrder.id}`}
                      className="btn-spring rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Open Printable QR Page →
                    </Link>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <p className="font-bold text-emerald-950">Ready WhatsApp Message</p>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-900">
                    {shareOrder.receiverName
                      ? `Made a special celebration card for ${shareOrder.receiverName}: ${cleanBase}/s/${shareOrder.siteSlug}`
                      : `Open this special celebration card: ${cleanBase}/s/${shareOrder.siteSlug}`}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void copyWithFeedback(
                          `modal-wa:${shareOrder.id}`,
                          shareOrder.receiverName
                            ? `Made a special celebration card for ${shareOrder.receiverName}: ${cleanBase}/s/${shareOrder.siteSlug}`
                            : `Open this special celebration card: ${cleanBase}/s/${shareOrder.siteSlug}`,
                        )
                      }
                      className="btn-spring rounded-xl border border-emerald-300 bg-white px-4 py-1.5 text-xs font-semibold text-emerald-900"
                    >
                      {copiedKey === `modal-wa:${shareOrder.id}` ? 'Message Copied!' : 'Copy Invite Text'}
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        shareOrder.receiverName
                          ? `Made a special celebration card for ${shareOrder.receiverName}: ${cleanBase}/s/${shareOrder.siteSlug}`
                          : `Open this special celebration card: ${cleanBase}/s/${shareOrder.siteSlug}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-spring rounded-xl bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                    >
                      Forward via WhatsApp →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* 3. Quick Typo Fixer Modal */}
        {editingOrder ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingOrder(null);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="orders-typo-title"
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-scale-in"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 id="orders-typo-title" className="text-lg font-bold text-slate-900">
                    Quick Fix Name or Message
                  </h3>
                  <p className="text-xs text-slate-500">
                    Updates your live website immediately without changing the share link.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  aria-label="Close modal"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                >
                  ×
                </button>
              </div>

              {editNotice ? (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900">
                  {editNotice}
                </div>
              ) : null}

              {editError ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-900">
                  {editError}
                </div>
              ) : null}

              <form onSubmit={handleSaveTypo} className="mt-4 space-y-4 text-sm">
                <div>
                  <label htmlFor="orders-edit-receiver" className="block text-xs font-bold text-slate-800">
                    Recipient / Couple Name
                  </label>
                  <input
                    id="orders-edit-receiver"
                    type="text"
                    required
                    value={editReceiverName}
                    onChange={(e) => setEditReceiverName(e.target.value)}
                    className="mt-1 min-h-[42px] w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-webzy-primary"
                  />
                </div>

                <div>
                  <label htmlFor="orders-edit-message" className="block text-xs font-bold text-slate-800">
                    Greeting Message (Optional update)
                  </label>
                  <textarea
                    id="orders-edit-message"
                    rows={4}
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    placeholder="Leave blank to keep existing message unchanged..."
                    className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 outline-none focus:border-webzy-primary"
                  />
                </div>

                <div className="flex justify-end gap-2.5 border-t border-slate-200 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="btn-spring rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="btn-spring rounded-xl bg-webzy-primary px-5 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50"
                  >
                    {savingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
