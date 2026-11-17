'use client';

import React, { useState } from 'react';

interface TakedownFormClientProps {
  grievanceEmail: string;
}

export function TakedownFormClient({ grievanceEmail }: TakedownFormClientProps) {
  const [siteUrlOrSlug, setSiteUrlOrSlug] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [category, setCategory] = useState('privacy');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ id: string; autoHidden: boolean } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/takedown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrlOrSlug,
          reporterName,
          reporterEmail,
          category,
          details,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        takedownId?: string;
        autoHidden?: boolean;
        error?: string;
      };
      if (!res.ok || !data.takedownId) {
        throw new Error(data.error || 'Could not submit takedown notice.');
      }
      setResult({ id: data.takedownId, autoHidden: Boolean(data.autoHidden) });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to submit takedown notice.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 rounded-3xl border border-webzy-tint bg-white p-6 shadow-sm">
      <h2 className="font-heading text-xl font-bold text-webzy-ink">
        Submit a Takedown or Privacy Removal Notice
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-webzy-ink/70">
        Privacy, impersonation, harassment, and scam notices matching a live <code>/s/slug</code>{' '}
        automatically pause that page pending founder review. You may also email{' '}
        <strong>{grievanceEmail}</strong> directly.
      </p>

      {result ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-950">
          <p className="font-bold">Notice Recorded (Ref: #{result.id.slice(0, 8)})</p>
          <p className="mt-1 text-xs leading-relaxed">
            {result.autoHidden
              ? 'The reported Webzy page has been paused immediately and placed in the urgent moderation queue.'
              : 'Your notice has been queued for our Grievance Officer to review within 24 hours.'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="td-slug" className="block text-xs font-bold text-webzy-ink">
                Webzy link or slug (e.g. /s/abcd1234ef)
              </label>
              <input
                id="td-slug"
                type="text"
                value={siteUrlOrSlug}
                onChange={(e) => setSiteUrlOrSlug(e.target.value)}
                placeholder="https://.../s/xxxxxxxxxxxx"
                className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-webzy-surface/40 px-3.5 text-sm text-webzy-ink"
              />
            </div>
            <div>
              <label htmlFor="td-cat" className="block text-xs font-bold text-webzy-ink">
                Reason category *
              </label>
              <select
                id="td-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-webzy-surface/40 px-3 text-sm text-webzy-ink"
              >
                <option value="privacy">Unauthorized photo / Privacy concern</option>
                <option value="impersonation">Impersonation</option>
                <option value="harassment">Harassment / Unwanted contact</option>
                <option value="scam">Scam / Phishing / Fraud</option>
                <option value="copyright">Copyright / DMCA notice</option>
                <option value="other">Other safety concern</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="td-name" className="block text-xs font-bold text-webzy-ink">
                Your full name *
              </label>
              <input
                id="td-name"
                type="text"
                required
                maxLength={80}
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-webzy-surface/40 px-3.5 text-sm text-webzy-ink"
              />
            </div>
            <div>
              <label htmlFor="td-email" className="block text-xs font-bold text-webzy-ink">
                Contact email *
              </label>
              <input
                id="td-email"
                type="email"
                required
                maxLength={120}
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-webzy-surface/40 px-3.5 text-sm text-webzy-ink"
              />
            </div>
          </div>

          <div>
            <label htmlFor="td-details" className="block text-xs font-bold text-webzy-ink">
              Details / ownership or safety explanation *
            </label>
            <textarea
              id="td-details"
              required
              rows={4}
              maxLength={1200}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Explain why this page should be taken down or removed..."
              className="mt-1 w-full rounded-xl border border-webzy-tint bg-webzy-surface/40 p-3.5 text-sm text-webzy-ink"
            />
          </div>

          {errorMsg ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900"
            >
              {errorMsg}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-red-600 px-6 text-xs font-bold text-white disabled:opacity-50"
          >
            {submitting ? 'Submitting notice...' : 'Submit Takedown Notice'}
          </button>
        </form>
      )}
    </div>
  );
}
