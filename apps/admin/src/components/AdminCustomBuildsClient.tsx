'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

export interface StudioBuildRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  business_name: string;
  city: string;
  notes: string;
  status: string;
  checklist?: Record<string, boolean> | null;
  preview_url?: string | null;
  live_url?: string | null;
  quote_amount_inr?: number | null;
  created_at: string;
}

export interface CustomRequestRow {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  occasion: string;
  budget_tier: string;
  target_date: string | null;
  brief: string;
  status: string;
  quoted_amount_inr: number | null;
  admin_notes: string;
  checklist?: Record<string, boolean> | null;
  preview_url?: string | null;
  live_url?: string | null;
  created_at: string;
}

interface AdminCustomBuildsClientProps {
  studioLeads: StudioBuildRow[];
  customRequests: CustomRequestRow[];
}

export interface UnifiedProject {
  id: string;
  source: 'studio' | 'request';
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  businessName?: string;
  city?: string;
  categoryLabel: string;
  requirements: string;
  rawClientBrief: string;
  budgetLabel?: string;
  targetDate?: string | null;
  status: string;
  checklist: {
    brief_confirmed: boolean;
    assets_received: boolean;
    draft_designed: boolean;
    preview_shared: boolean;
    client_approved: boolean;
    payment_cleared: boolean;
    launched_live: boolean;
  };
  previewUrl: string;
  liveUrl: string;
  quotedAmountInr: string;
  adminNotes: string;
  createdAt: string;
}

const STUDIO_NOTES_DELIMITER = '\n---STUDIO_INTERNAL_NOTES---\n';

function splitStudioNotes(rawNotes: string | null | undefined): {
  clientBrief: string;
  internalNotes: string;
} {
  if (!rawNotes) return { clientBrief: '', internalNotes: '' };
  if (rawNotes.includes('---STUDIO_INTERNAL_NOTES---')) {
    const parts = rawNotes.split(/\r?\n?---STUDIO_INTERNAL_NOTES---\r?\n?/);
    return {
      clientBrief: (parts[0] || '').trim(),
      internalNotes: parts.slice(1).join('\n').trim(),
    };
  }
  return {
    clientBrief: rawNotes.trim(),
    internalNotes: '',
  };
}

function isSlaOver24hUnquoted(project: UnifiedProject): boolean {
  const isUnquotedNew =
    (project.status === 'new' || project.status === 'waitlisted') &&
    !project.quotedAmountInr.trim();
  if (!isUnquotedNew || !project.createdAt) return false;
  const createdMs = Date.parse(project.createdAt);
  if (Number.isNaN(createdMs)) return false;
  return Date.now() - createdMs > 24 * 60 * 60 * 1000;
}

function getEventCountdownLabel(targetDate?: string | null): { label: string; urgent: boolean } | null {
  if (!targetDate) return null;
  const targetMs = Date.parse(targetDate);
  if (Number.isNaN(targetMs)) return null;
  const diffDays = Math.ceil((targetMs - Date.now()) / (24 * 60 * 60 * 1000));
  if (diffDays < 0) return { label: `Event passed (${Math.abs(diffDays)}d ago)`, urgent: false };
  if (diffDays === 0) return { label: 'Event Today', urgent: true };
  return { label: `Event in ${diffDays}d`, urgent: diffDays <= 14 };
}

const CHECKLIST_STEPS = [
  { key: 'brief_confirmed', label: '1. Requirements & Brief Confirmed', desc: 'Call/WhatsApp done, goals & pages clarified' },
  { key: 'assets_received', label: '2. Assets & Content Collected', desc: 'Logo, clinic/store photos, texts received' },
  { key: 'draft_designed', label: '3. Layout & Website Designed', desc: 'Mobile UI, forms, and pages built' },
  { key: 'preview_shared', label: '4. Preview Link Shared', desc: 'Client sent interactive review link' },
  { key: 'client_approved', label: '5. Client Review & Revisions', desc: 'Feedback applied, client gave green signal' },
  { key: 'payment_cleared', label: '6. Payment / Settlement Cleared', desc: 'Full agreed build fee received' },
  { key: 'launched_live', label: '7. Made Live & Delivered', desc: 'Custom domain connected & handed over' },
] as const;

function sanitizePhoneForWa(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return digits;
  return digits;
}

export function AdminCustomBuildsClient({
  studioLeads,
  customRequests,
}: AdminCustomBuildsClientProps) {
  const router = useRouter();

  // Combine both sources into unified list
  const initialProjects = useMemo<UnifiedProject[]>(() => {
    const list: UnifiedProject[] = [];

    // 1. Studio Leads (/studio waitlist)
    studioLeads.forEach((lead) => {
      const rawChecklist = lead.checklist || {};
      const { clientBrief, internalNotes } = splitStudioNotes(lead.notes);
      list.push({
        id: lead.id,
        source: 'studio',
        clientName: lead.name,
        clientEmail: lead.email,
        clientPhone: lead.phone,
        businessName: lead.business_name || 'Studio Custom Build',
        city: lead.city,
        categoryLabel:
          lead.category === 'coaching'
            ? 'Coaching & Institutes'
            : lead.category === 'medical'
              ? 'Doctors & Clinics'
              : lead.category === 'ecommerce'
                ? 'E-Commerce & Retail'
                : lead.category === 'wedding_bespoke'
                  ? 'Destination Wedding Portal'
                  : 'Local Services & Brand',
        requirements: clientBrief || 'No specific notes given during waitlist submission.',
        rawClientBrief: clientBrief,
        budgetLabel: lead.quote_amount_inr ? `Quote: ₹${lead.quote_amount_inr}` : 'Early Founder Rate',
        status: lead.status || 'waitlisted',
        checklist: {
          brief_confirmed: Boolean(rawChecklist.brief_confirmed),
          assets_received: Boolean(rawChecklist.assets_received),
          draft_designed: Boolean(rawChecklist.draft_designed),
          preview_shared: Boolean(rawChecklist.preview_shared),
          client_approved: Boolean(rawChecklist.client_approved),
          payment_cleared: Boolean(rawChecklist.payment_cleared),
          launched_live: Boolean(rawChecklist.launched_live || lead.status === 'made'),
        },
        previewUrl: lead.preview_url || '',
        liveUrl: lead.live_url || '',
        quotedAmountInr: lead.quote_amount_inr ? String(lead.quote_amount_inr) : '',
        adminNotes: internalNotes,
        createdAt: lead.created_at,
      });
    });

    // 2. Custom Requests (/request celebration & wedding briefs)
    customRequests.forEach((req) => {
      const rawChecklist = req.checklist || {};
      list.push({
        id: req.id,
        source: 'request',
        clientName: req.requester_name,
        clientEmail: req.requester_email,
        clientPhone: req.requester_phone,
        businessName: `${req.occasion.toUpperCase()} Celebration Website`,
        categoryLabel: `Custom ${req.occasion}`,
        requirements: req.brief || 'No detailed brief submitted.',
        rawClientBrief: req.brief || '',
        budgetLabel: req.quoted_amount_inr ? `Quoted: ₹${req.quoted_amount_inr}` : `Budget: ₹${req.budget_tier}`,
        targetDate: req.target_date,
        status: req.status || 'new',
        checklist: {
          brief_confirmed: Boolean(rawChecklist.brief_confirmed),
          assets_received: Boolean(rawChecklist.assets_received),
          draft_designed: Boolean(rawChecklist.draft_designed),
          preview_shared: Boolean(rawChecklist.preview_shared),
          client_approved: Boolean(rawChecklist.client_approved),
          payment_cleared: Boolean(rawChecklist.payment_cleared),
          launched_live: Boolean(rawChecklist.launched_live || req.status === 'made' || req.status === 'completed'),
        },
        previewUrl: req.preview_url || '',
        liveUrl: req.live_url || '',
        quotedAmountInr: req.quoted_amount_inr ? String(req.quoted_amount_inr) : '',
        adminNotes: req.admin_notes || '',
        createdAt: req.created_at,
      });
    });

    // Sort newest first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [studioLeads, customRequests]);

  // State management for in-memory edits (synced when server refreshes)
  const [projects, setProjects] = useState<UnifiedProject[]>(initialProjects);
  const [dirtyIds, setDirtyIds] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setProjects((prev) => {
      const dirtyMap = new Map(prev.filter((p) => dirtyIds[p.id]).map((p) => [p.id, p]));
      return initialProjects.map((fresh) => dirtyMap.get(fresh.id) ?? fresh);
    });
  }, [initialProjects, dirtyIds]);
  const [filterSource, setFilterSource] = useState<'all' | 'studio' | 'request'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filtered list
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (filterSource !== 'all' && p.source !== filterSource) return false;
      if (filterStatus === 'made' && !p.checklist.launched_live && p.status !== 'made' && p.status !== 'completed') return false;
      if (filterStatus === 'pending' && (p.checklist.launched_live || p.status === 'made' || p.status === 'completed')) return false;
      if (filterStatus !== 'all' && filterStatus !== 'made' && filterStatus !== 'pending' && p.status !== filterStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.clientName.toLowerCase().includes(q) ||
          p.clientEmail.toLowerCase().includes(q) ||
          (p.businessName && p.businessName.toLowerCase().includes(q)) ||
          p.requirements.toLowerCase().includes(q) ||
          (p.city && p.city.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [projects, filterSource, filterStatus, searchQuery]);

  // Checklist toggle helper
  function toggleChecklistStep(projectId: string, stepKey: keyof UnifiedProject['checklist']) {
    setDirtyIds((prev) => ({ ...prev, [projectId]: true }));
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newChecklist = { ...p.checklist, [stepKey]: !p.checklist[stepKey] };
        // If final step launched_live is checked, auto-suggest 'made' status
        let newStatus = p.status;
        if (stepKey === 'launched_live') {
          newStatus = newChecklist.launched_live ? 'made' : 'in_progress';
        }
        return {
          ...p,
          checklist: newChecklist,
          status: newStatus,
        };
      }),
    );
  }

  // Field change helper
  function updateProjectField(
    projectId: string,
    field: 'status' | 'previewUrl' | 'liveUrl' | 'adminNotes' | 'quotedAmountInr',
    val: string,
  ) {
    setDirtyIds((prev) => ({ ...prev, [projectId]: true }));
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, [field]: val } : p)),
    );
  }

  // Save changes to API
  async function handleSaveProject(project: UnifiedProject, sendQuoteEmail = false) {
    setBusyId(project.id);
    setNotice('');
    setErrorMsg('');

    const parsedQuote = project.quotedAmountInr.trim() ? Number(project.quotedAmountInr.trim()) : null;

    try {
      if (project.source === 'studio') {
        const combinedNotes = project.adminNotes.trim()
          ? `${project.rawClientBrief}${STUDIO_NOTES_DELIMITER}${project.adminNotes.trim()}`
          : project.rawClientBrief;
        const res = await fetch('/api/waitlist', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: project.id,
            status: project.status,
            notes: combinedNotes,
            checklist: project.checklist,
            preview_url: project.previewUrl,
            live_url: project.liveUrl,
            quote_amount_inr: parsedQuote,
          }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok) throw new Error(data.error || 'Failed to update studio build.');
      } else {
        const res = await fetch('/api/custom-requests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: project.id,
            status: project.status,
            quotedAmountInr: parsedQuote,
            adminNotes: project.adminNotes,
            sendQuoteEmail,
            checklist: project.checklist,
            previewUrl: project.previewUrl,
            liveUrl: project.liveUrl,
          }),
        });
        const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
        if (!res.ok) throw new Error(data.error || 'Failed to update custom request.');
        if (data.message) {
          setDirtyIds((prev) => ({ ...prev, [project.id]: false }));
          setNotice(data.message);
          window.dispatchEvent(new Event('webzy_admin_mutated'));
          router.refresh();
          return;
        }
      }

      setDirtyIds((prev) => ({ ...prev, [project.id]: false }));
      setNotice(`Saved updates & checklist for ${project.clientName}.`);
      window.dispatchEvent(new Event('webzy_admin_mutated'));
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setBusyId(null);
    }
  }

  // Summary counts
  const totalCount = projects.length;
  const madeCount = projects.filter((p) => p.checklist.launched_live || p.status === 'made' || p.status === 'completed').length;
  const inProgressCount = totalCount - madeCount;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-8">
      {/* Header and Live Overview */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-webzy-primary text-xs font-bold text-white">
              CB
            </span>
            <h2 className="font-heading text-2xl font-bold text-webzy-ink">
              Custom Builds &amp; Studio Projects Pipeline
            </h2>
            <span className="rounded-full bg-webzy-tint px-3 py-0.5 text-xs font-bold text-webzy-primary font-tabular">
              {totalCount} Total
            </span>
          </div>
          <p className="mt-1 text-xs text-webzy-ink/75">
            Manage incoming briefs from <strong>/studio</strong> and <strong>/request</strong>. Review what website features the client wants and check off build milestones as they are made.
          </p>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex flex-wrap items-center gap-2 font-tabular">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-3.5 py-1.5 text-xs font-semibold text-amber-900">
            <span className="font-bold">{inProgressCount}</span> Pending / In Build
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-1.5 text-xs font-semibold text-emerald-900">
            <span className="font-bold">{madeCount}</span> Made &amp; Live
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notice ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900">
          {notice}
        </div>
      ) : null}
      {errorMsg ? (
        <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900">
          {errorMsg}
        </div>
      ) : null}

      {/* Filters and Search Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-webzy-ink/70">Source:</span>
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setFilterSource('all')}
            className={`inline-flex min-h-[44px] items-center rounded-full px-4 text-xs font-bold transition ${
              filterSource === 'all'
                ? 'bg-webzy-primary text-white shadow-btn-primary'
                : 'border border-slate-200 bg-slate-50/70 text-webzy-ink hover:border-webzy-primary/40 hover:bg-slate-100'
            }`}
          >
            All Sources ({totalCount})
          </button>
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setFilterSource('studio')}
            className={`inline-flex min-h-[44px] items-center rounded-full px-4 text-xs font-bold transition ${
              filterSource === 'studio'
                ? 'bg-webzy-primary text-white shadow-btn-primary'
                : 'border border-slate-200 bg-slate-50/70 text-webzy-ink hover:border-webzy-primary/40 hover:bg-slate-100'
            }`}
          >
            Studio Builds ({studioLeads.length})
          </button>
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setFilterSource('request')}
            className={`inline-flex min-h-[44px] items-center rounded-full px-4 text-xs font-bold transition ${
              filterSource === 'request'
                ? 'bg-webzy-primary text-white shadow-btn-primary'
                : 'border border-slate-200 bg-slate-50/70 text-webzy-ink hover:border-webzy-primary/40 hover:bg-slate-100'
            }`}
          >
            Custom Celebration Briefs ({customRequests.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            suppressHydrationWarning
            aria-label="Filter build status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="min-h-[44px] flex-1 sm:flex-none rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-semibold text-webzy-ink outline-none focus:border-webzy-primary focus:bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending / In Build</option>
            <option value="made">Made / Completed Live</option>
            <option value="waitlisted">Waitlisted / New</option>
            <option value="contacted">Contacted</option>
          </select>

          <input
            suppressHydrationWarning
            type="search"
            placeholder="Search client, business, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs text-webzy-ink outline-none focus:border-webzy-primary focus:bg-white sm:w-60"
          />
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <p className="text-sm font-semibold text-webzy-ink/70">No custom build projects match your filters.</p>
          <p className="mt-1 text-xs text-webzy-ink/50">New requests submitted from /studio or /request will automatically appear here.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {filteredProjects.map((p) => {
            const waNumber = sanitizePhoneForWa(p.clientPhone);
            const waGreeting = encodeURIComponent(
              `Hi ${p.clientName}, this is Webzy Studio regarding your website request for "${p.businessName || 'your custom project'}". We are preparing your build details!`,
            );

            // Compute checklist completion percentage
            const completedCount = Object.values(p.checklist).filter(Boolean).length;
            const completionPercent = Math.round((completedCount / CHECKLIST_STEPS.length) * 100);
            const isFullyMade = p.checklist.launched_live || p.status === 'made';
            const isDirty = Boolean(dirtyIds[p.id]);
            const slaOver24h = isSlaOver24hUnquoted(p);
            const eventCountdown = getEventCountdownLabel(p.targetDate);

            return (
              <div
                key={p.id}
                className={`overflow-hidden rounded-3xl border transition-all ${
                  isDirty
                    ? 'border-amber-400 bg-white shadow-sm'
                    : isFullyMade
                      ? 'border-emerald-200 bg-gradient-to-b from-emerald-50/20 via-white to-white shadow-xs'
                      : 'border-slate-200 bg-white shadow-xs hover:border-webzy-primary/40 hover:shadow-sm'
                }`}
              >
                {/* Project Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 p-4 sm:px-6">
                  <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        p.source === 'studio'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : 'bg-rose-100 text-rose-900 border border-rose-200'
                      }`}
                    >
                      {p.source === 'studio' ? 'Studio Build' : 'Custom Request'}
                    </span>
                    <h3 className="font-heading text-base font-bold text-webzy-ink">
                      {p.businessName || p.clientName}
                    </h3>
                    <span className="text-xs text-webzy-ink/60">· {p.categoryLabel}</span>
                    {slaOver24h ? (
                      <span
                        suppressHydrationWarning
                        className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-red-900 border border-red-200"
                      >
                        SLA &gt; 24h Unquoted
                      </span>
                    ) : null}
                    {eventCountdown ? (
                      <span
                        suppressHydrationWarning
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold font-tabular ${
                          eventCountdown.urgent
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-sky-100 text-sky-900'
                        }`}
                      >
                        {eventCountdown.label}
                      </span>
                    ) : null}
                    {isDirty ? (
                      <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                        Unsaved Changes
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${
                        isFullyMade
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : p.status === 'in_progress'
                            ? 'bg-indigo-100 text-indigo-800'
                            : p.status === 'contacted'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-white text-webzy-ink/75 border border-slate-200'
                      }`}
                    >
                      {isFullyMade ? 'Website Made & Live' : p.status.toUpperCase()}
                    </span>
                    <span suppressHydrationWarning className="text-[11px] text-webzy-ink/50 font-tabular">
                      {p.createdAt ? p.createdAt.slice(0, 10) : '—'}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {/* Client Info and Contact Bar */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-center">
                    <div className="min-w-0 sm:col-span-7">
                      <p className="text-sm font-bold text-webzy-ink">{p.clientName}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-webzy-ink/75">
                        <span className="break-all">{p.clientEmail}</span>
                        {p.clientPhone ? (
                          <>
                            <span>·</span>
                            <span className="font-tabular">{p.clientPhone}</span>
                          </>
                        ) : null}
                        {p.city ? (
                          <>
                            <span>·</span>
                            <span>City: <strong>{p.city}</strong></span>
                          </>
                        ) : null}
                        {p.budgetLabel ? (
                          <>
                            <span>·</span>
                            <span className="font-bold text-emerald-700 font-tabular">{p.budgetLabel}</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {/* Instant Contact CTAs */}
                    <div className="flex flex-wrap items-center gap-2 sm:col-span-5 sm:justify-end">
                      {waNumber ? (
                        <a
                          href={`https://wa.me/${waNumber}?text=${waGreeting}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                        >
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.355.101.173.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
                          </svg>
                          <span>WhatsApp</span>
                        </a>
                      ) : null}

                      {p.clientPhone ? (
                        <a
                          href={`tel:${p.clientPhone}`}
                          className="inline-flex min-h-[44px] items-center rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-webzy-ink hover:bg-slate-50"
                        >
                          Call
                        </a>
                      ) : null}

                      <a
                        href={`mailto:${p.clientEmail}`}
                        className="inline-flex min-h-[44px] items-center rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-webzy-ink hover:bg-slate-50"
                      >
                        Email
                      </a>
                    </div>
                  </div>

                  {/* "How They Want The Website" Requirements Box */}
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-webzy-primary">
                        Website Requirements &amp; Brief (How They Want It)
                      </span>
                      {p.targetDate ? (
                        <span className="text-[11px] text-webzy-ink/60 font-tabular">
                          Target Date: <strong>{p.targetDate}</strong>
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-webzy-ink font-medium">
                      {p.requirements}
                    </p>
                  </div>

                  {/* Build Checklist Section */}
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-webzy-ink">
                          Website Build Checklist &amp; Milestones
                        </h4>
                        <p className="text-[11px] text-webzy-ink/65">
                          Tick each milestone as you build and deliver the website to the client.
                        </p>
                      </div>

                      {/* Progress Bar & Meter */}
                      <div className="flex items-center gap-3">
                        <div className="w-28 rounded-full bg-slate-100 h-2 overflow-hidden border border-slate-200">
                          <div
                            className={`animate-shimmer h-full transition-all duration-300 ${
                              isFullyMade ? 'bg-emerald-600' : 'bg-webzy-primary'
                            }`}
                            style={{ width: `${completionPercent}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-bold font-tabular ${
                            isFullyMade ? 'text-emerald-700' : 'text-webzy-ink'
                          }`}
                        >
                          {completedCount} / {CHECKLIST_STEPS.length} ({completionPercent}%)
                        </span>
                      </div>
                    </div>

                    {/* Checkbox Grid */}
                    <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {CHECKLIST_STEPS.map((step) => {
                        const isChecked = Boolean(p.checklist[step.key as keyof typeof p.checklist]);
                        return (
                          <label
                            key={step.key}
                            className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs transition ${
                              isChecked
                                ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950 font-medium'
                                : 'border-slate-200 bg-slate-50/70 text-webzy-ink/80 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              suppressHydrationWarning
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleChecklistStep(p.id, step.key as keyof typeof p.checklist)}
                              className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600 cursor-pointer"
                            />
                            <div>
                              <p className={isChecked ? 'font-bold text-emerald-900' : 'font-semibold text-webzy-ink'}>
                                {step.label}
                              </p>
                              <p className="text-[10px] text-webzy-ink/60">{step.desc}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery Links, Quote, Status & Admin Notes */}
                  <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-12 sm:items-end">
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-webzy-ink">
                        Project Status
                      </label>
                      <select
                        suppressHydrationWarning
                        value={p.status}
                        onChange={(e) => updateProjectField(p.id, 'status', e.target.value)}
                        className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-webzy-ink outline-none focus:border-webzy-primary"
                      >
                        {p.source === 'studio' ? (
                          <>
                            <option value="waitlisted">Waitlisted / New</option>
                            <option value="contacted">Contacted</option>
                            <option value="in_progress">In Progress (Building)</option>
                            <option value="made">Made &amp; Live</option>
                            <option value="converted">Converted / Completed</option>
                            <option value="archived">Archived</option>
                          </>
                        ) : (
                          <>
                            <option value="new">New Brief</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="quoted">Quoted</option>
                            <option value="accepted">Accepted</option>
                            <option value="in_progress">In Progress (Building)</option>
                            <option value="made">Made (Preview Ready)</option>
                            <option value="completed">Completed &amp; Live</option>
                            <option value="declined">Declined</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-webzy-ink">
                        Quote (₹ INR)
                      </label>
                      <input
                        suppressHydrationWarning
                        type="number"
                        min={499}
                        step={50}
                        placeholder="e.g. 4999"
                        value={p.quotedAmountInr}
                        onChange={(e) => updateProjectField(p.id, 'quotedAmountInr', e.target.value)}
                        className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-tabular text-webzy-ink outline-none focus:border-webzy-primary"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-webzy-ink">
                        Preview URL (Staging)
                      </label>
                      <input
                        suppressHydrationWarning
                        type="url"
                        placeholder="https://webzy.in/s/sample"
                        value={p.previewUrl}
                        onChange={(e) => updateProjectField(p.id, 'previewUrl', e.target.value)}
                        className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-webzy-ink outline-none focus:border-webzy-primary"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-webzy-ink">
                        Live Site URL (Custom Domain)
                      </label>
                      <input
                        suppressHydrationWarning
                        type="url"
                        placeholder="https://drrajeshclinic.in"
                        value={p.liveUrl}
                        onChange={(e) => updateProjectField(p.id, 'liveUrl', e.target.value)}
                        className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-webzy-ink outline-none focus:border-webzy-primary"
                      />
                    </div>

                    <div className="sm:col-span-7">
                      <label className="block text-[11px] font-bold text-webzy-ink">
                        Internal / Studio Notes
                      </label>
                      <input
                        suppressHydrationWarning
                        type="text"
                        maxLength={800}
                        placeholder="Add build notes, revision feedback, or payment schedule..."
                        value={p.adminNotes}
                        onChange={(e) => updateProjectField(p.id, 'adminNotes', e.target.value)}
                        className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-webzy-ink outline-none focus:border-webzy-primary"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:col-span-5 sm:justify-end">
                      {p.liveUrl && /^https?:\/\//i.test(p.liveUrl) ? (
                        <a
                          href={p.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-[44px] items-center rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                        >
                          Live ↗
                        </a>
                      ) : p.previewUrl && /^https?:\/\//i.test(p.previewUrl) ? (
                        <a
                          href={p.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs font-bold text-webzy-primary hover:bg-slate-100"
                        >
                          Preview ↗
                        </a>
                      ) : null}

                      {p.source === 'request' && p.quotedAmountInr.trim() ? (
                        <button
                          suppressHydrationWarning
                          type="button"
                          disabled={busyId === p.id}
                          onClick={() => void handleSaveProject(p, true)}
                          className="inline-flex min-h-[44px] items-center rounded-full border border-emerald-300 bg-emerald-50 px-4 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-50"
                        >
                          Save &amp; Email Quote
                        </button>
                      ) : null}

                      <button
                        suppressHydrationWarning
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => void handleSaveProject(p, false)}
                        className={`inline-flex min-h-[44px] items-center rounded-full px-5 text-xs font-bold text-white shadow-xs transition hover:opacity-95 disabled:opacity-50 ${
                          isDirty
                            ? 'bg-amber-600 ring-2 ring-amber-300'
                            : 'bg-webzy-primary'
                        }`}
                      >
                        {busyId === p.id
                          ? 'Saving...'
                          : isDirty
                            ? 'Save Unsaved Changes'
                            : 'Save Updates'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
