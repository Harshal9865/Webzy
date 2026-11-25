'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { LanguageCode } from '@webzy/core';
import { type ThemeDemoPayload, type ThemeManifest, ThemeRenderer } from '@webzy/themes';

export type ReceiverPageState = 'unavailable' | 'hidden' | 'expired' | 'scheduled' | 'live';

interface ReceiverClientProps {
  slug: string;
  state: ReceiverPageState;
  theme?: ThemeManifest;
  payload?: ThemeDemoPayload;
  language?: LanguageCode;
  revealAtIso?: string | null;
  serverNowMs: number;
  initialReplyText?: string | null;
}

const QUICK_REPLIES = ['Loved this!', 'Made my day!', 'Best surprise ever!'];

const REPORT_REASONS = [
  'Spam or scam content',
  'Harassment or unwanted contact',
  'Privacy concern or unauthorized photo',
  'Inappropriate content',
];

function formatCountdown(remainingMs: number): string {
  const totalSec = Math.max(0, Math.floor(remainingMs / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  parts.push(`${String(hours).padStart(2, '0')}h`);
  parts.push(`${String(mins).padStart(2, '0')}m`);
  parts.push(`${String(secs).padStart(2, '0')}s`);
  return parts.join(' : ');
}

export function ReceiverClient({
  slug,
  state,
  theme,
  payload,
  language = 'en',
  revealAtIso,
  serverNowMs,
  initialReplyText,
}: ReceiverClientProps) {
  const router = useRouter();
  const [viewState, setViewState] = useState<ReceiverPageState>(state);
  const [hasOpenedGift, setHasOpenedGift] = useState(false);
  const [replyText, setReplyText] = useState(initialReplyText || '');
  const [replySaved, setReplySaved] = useState(Boolean(initialReplyText));
  const [replyBusy, setReplyBusy] = useState(false);
  const [replyError, setReplyError] = useState('');

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [reportError, setReportError] = useState('');

  const openedSentRef = useRef(false);
  const clientOffsetMsRef = useRef<number>(Date.now() - serverNowMs);
  const revealMs = useMemo(() => (revealAtIso ? Date.parse(revealAtIso) : 0), [revealAtIso]);
  const [remainingMs, setRemainingMs] = useState<number>(() =>
    revealMs > 0 ? Math.max(0, revealMs - serverNowMs) : 0,
  );

  useEffect(() => {
    setViewState(state);
  }, [state]);

  useEffect(() => {
    if (viewState !== 'scheduled' || !revealMs) return;
    const interval = window.setInterval(() => {
      const approxServerNow = Date.now() - clientOffsetMsRef.current;
      const diff = Math.max(0, revealMs - approxServerNow);
      setRemainingMs(diff);
      if (diff <= 0) {
        window.clearInterval(interval);
        router.refresh();
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [viewState, revealMs, router]);

  function handleOpened() {
    setHasOpenedGift(true);
    if (openedSentRef.current) return;
    openedSentRef.current = true;
    void fetch(`/api/sites/${encodeURIComponent(slug)}/opened`, {
      method: 'POST',
    }).catch(() => {});
  }

  async function submitReply(textToSend: string) {
    const cleaned = textToSend.trim();
    if (!cleaned || replyBusy || replySaved) return;
    setReplyBusy(true);
    setReplyError('');
    try {
      const res = await fetch(`/api/sites/${encodeURIComponent(slug)}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText: cleaned }),
      });
      const data = (await res.json()) as { ok?: boolean; replyText?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Could not send reply.');
      }
      setReplyText(data.replyText || cleaned);
      setReplySaved(true);
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'Unable to send reply.');
    } finally {
      setReplyBusy(false);
    }
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    if (reportBusy) return;
    setReportBusy(true);
    setReportError('');
    try {
      const res = await fetch(`/api/sites/${encodeURIComponent(slug)}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Could not submit report.');
      }
      setReportDone(true);
      setReportOpen(false);
      setViewState('hidden');
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Report failed.');
    } finally {
      setReportBusy(false);
    }
  }

  if (viewState === 'unavailable' || viewState === 'hidden' || viewState === 'expired') {
    const title =
      viewState === 'expired'
        ? 'This surprise link has expired'
        : viewState === 'hidden'
          ? 'This page is temporarily paused'
          : 'This Webzy link is unavailable';

    const subtitle =
      reportDone
        ? 'Thank you for letting us know. This page has been hidden immediately for safety review.'
        : viewState === 'expired'
          ? 'The hosting window for this keepsake has ended. You can create a brand new Webzy in under 2 minutes.'
          : viewState === 'hidden'
            ? 'The sender paused this page or it is currently under safety review.'
            : 'Please double-check the link with the person who sent it to you.';

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-webzy-surface to-white px-4 py-10 text-center">
        <div className="w-full max-w-md rounded-3xl border border-webzy-tint bg-white p-8 shadow-sm">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-webzy-tint font-heading text-xl font-bold text-webzy-primary">
            W
          </span>
          <h1 className="mt-4 font-heading text-2xl font-bold text-webzy-ink">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-webzy-ink/75">{subtitle}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/themes"
              className="inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white"
            >
              Create your own Webzy →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (viewState === 'scheduled') {
    const formattedIst = revealAtIso
      ? new Intl.DateTimeFormat('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Kolkata',
        }).format(new Date(revealAtIso))
      : '';

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-webzy-surface to-white px-4 py-10 text-center">
        <div className="w-full max-w-md rounded-2xl border border-webzy-ink/[0.09] bg-white p-8 shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-webzy-primary">
            Scheduled Surprise
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-webzy-ink">
            Something special is waiting for you
          </h1>
          <p className="mt-2 text-sm text-webzy-ink/75">
            This surprise unlocks automatically on <strong>{formattedIst} IST</strong>.
          </p>

          <div className="mt-6 rounded-2xl bg-webzy-surface px-4 py-5 font-mono text-2xl font-bold tracking-wider text-webzy-primary">
            {formatCountdown(remainingMs)}
          </div>

          <button
            suppressHydrationWarning
            type="button"
            onClick={() => router.refresh()}
            className="mt-5 inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-white px-5 text-xs font-bold text-webzy-ink hover:border-webzy-primary"
          >
            Refresh status
          </button>
        </div>
      </div>
    );
  }

  if (!theme || !payload) {
    return null;
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-between bg-gradient-to-b from-webzy-surface via-white to-webzy-surface/40 px-4 py-6 sm:py-10">
      <div className="w-full max-w-md">
        <ThemeRenderer
          manifest={theme}
          data={payload}
          language={language}
          watermarked={false}
          onOpened={handleOpened}
        />

        {/* One-time optional receiver reply */}
        {hasOpenedGift ? (
          <div className="mt-5 rounded-3xl border border-webzy-tint bg-white p-5 shadow-sm">
            {replySaved ? (
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Reply sent to {payload.senderName}
                </p>
                <p className="mt-1 text-sm font-semibold text-webzy-ink">“{replyText}”</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-webzy-ink">
                  Send a quick thank-you note back to {payload.senderName} (optional)
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {QUICK_REPLIES.map((preset) => (
                    <button
                      suppressHydrationWarning
                      key={preset}
                      type="button"
                      disabled={replyBusy}
                      onClick={() => void submitReply(preset)}
                      className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-webzy-surface px-3.5 py-2 text-xs font-semibold text-webzy-ink hover:border-webzy-primary"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submitReply(replyText);
                  }}
                  className="mt-3 flex gap-2"
                >
                  <input
                    suppressHydrationWarning
                    type="text"
                    maxLength={160}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Or write a short note..."
                    className="min-h-[44px] flex-1 rounded-xl border border-webzy-tint bg-webzy-surface/50 px-3.5 text-base sm:text-xs text-webzy-ink outline-none focus:border-webzy-primary"
                  />
                  <button
                    suppressHydrationWarning
                    type="submit"
                    disabled={replyBusy || !replyText.trim()}
                    className="min-h-[44px] shrink-0 rounded-xl bg-webzy-primary px-5 text-xs font-bold text-white disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
                {replyError ? <p className="mt-2 text-xs text-red-700">{replyError}</p> : null}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Receiver footer: Create yours CTA + Report safety button */}
      <footer className="mt-8 flex w-full max-w-md flex-col items-center gap-3 text-center">
        <Link
          href="/themes"
          className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-white px-5 text-xs font-bold text-webzy-primary shadow-sm hover:border-webzy-primary"
        >
          Make a Webzy like this from ₹29 →
        </Link>

        <button
          suppressHydrationWarning
          type="button"
          onClick={() => setReportOpen((prev) => !prev)}
          className="inline-flex min-h-[44px] items-center px-3 text-xs font-medium text-webzy-ink/55 underline hover:text-webzy-ink/85"
        >
          Report inappropriate or unsafe page
        </button>

        {reportOpen ? (
          <form
            onSubmit={submitReport}
            className="w-full rounded-2xl border border-red-200 bg-white p-4 text-left shadow-sm"
          >
            <p className="text-xs font-bold text-webzy-ink">Report this page</p>
            <p className="mt-1 text-[11px] text-webzy-ink/70">
              Reporting hides this page immediately pending safety review.
            </p>
            <select
              suppressHydrationWarning
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="mt-2.5 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-webzy-surface px-3 text-base sm:text-xs text-webzy-ink"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {reportError ? <p className="mt-2 text-xs text-red-700">{reportError}</p> : null}
            <div className="mt-3 flex justify-end gap-2">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setReportOpen(false)}
                className="min-h-[44px] rounded-lg px-4 text-xs font-semibold text-webzy-ink/70"
              >
                Cancel
              </button>
              <button
                suppressHydrationWarning
                type="submit"
                disabled={reportBusy}
                className="min-h-[44px] rounded-lg bg-red-600 px-4 text-xs font-bold text-white disabled:opacity-50"
              >
                {reportBusy ? 'Hiding...' : 'Submit & Hide Page'}
              </button>
            </div>
          </form>
        ) : null}
      </footer>
    </div>
  );
}
