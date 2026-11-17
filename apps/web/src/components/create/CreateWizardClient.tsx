'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type AiDraftTone,
  detectScamPatterns,
  formatInr,
  LanguageCode,
} from '@webzy/core';
import {
  buildThemePayloadFromDraft,
  OCCASION_LABELS,
  ThemeManifest,
  ThemeRenderer,
} from '@webzy/themes';
import { compressImageForMobileUpload } from '../../lib/compressImage';
import { PhoneFrame } from '../shell/PhoneFrame';
import { useLanguage } from '../shell/LanguageProvider';

export interface UploadedPhotoItem {
  assetId: string;
  signedUrl: string;
  localObjectUrl?: string;
}

interface CreateWizardClientProps {
  theme: ThemeManifest;
  supabaseConfigured: boolean;
  initialDraftToken?: string;
  initialLanguage?: LanguageCode;
  initialContent?: {
    receiverName?: string;
    senderName?: string;
    relation?: string;
    message?: string;
    whatsappPhone?: string;
  };
  initialPhotos?: UploadedPhotoItem[];
  initialRevealAt?: string | null;
}

function utcIsoToIstDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return '';
  // Shift UTC ms by +05:30 (Asia/Kolkata fixed offset, zero DST)
  const ist = new Date(ms + 330 * 60 * 1000);
  return ist.toISOString().slice(0, 16);
}

const TONES: Array<{ id: AiDraftTone; label: string }> = [
  { id: 'cute', label: 'Cute' },
  { id: 'emotional', label: 'Emotional' },
  { id: 'funny', label: 'Funny' },
  { id: 'formal', label: 'Respectful / Formal' },
];

export function CreateWizardClient({
  theme,
  supabaseConfigured,
  initialDraftToken,
  initialLanguage,
  initialContent,
  initialPhotos = [],
  initialRevealAt,
}: CreateWizardClientProps) {
  const router = useRouter();
  const { language: siteLang } = useLanguage();
  const [step, setStep] = useState(1);
  const [draftLang, setDraftLang] = useState<LanguageCode>(initialLanguage ?? siteLang);
  const [draftToken, setDraftToken] = useState(initialDraftToken || '');

  const [receiverName, setReceiverName] = useState(initialContent?.receiverName || '');
  const [senderName, setSenderName] = useState(initialContent?.senderName || '');
  const [relation, setRelation] = useState(
    initialContent?.relation ||
      theme.fields.find((f) => f.key === 'relation')?.options?.[0]?.value ||
      '',
  );
  const [message, setMessage] = useState(initialContent?.message || '');
  const [whatsappPhone, setWhatsappPhone] = useState(initialContent?.whatsappPhone || '');
  const [revealAt, setRevealAt] = useState(() => utcIsoToIstDatetimeLocal(initialRevealAt));
  const [photos, setPhotos] = useState<UploadedPhotoItem[]>(initialPhotos);

  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiCreditsLeft, setAiCreditsLeft] = useState(5);
  const [uploading, setUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const hasPhotosField = theme.fields.some((f) => f.type === 'images' || f.type === 'image');
  const maxPhotos = theme.fields.find((f) => f.type === 'images')?.max ?? 3;
  const relationField = theme.fields.find((f) => f.key === 'relation');
  const messageField = theme.fields.find((f) => f.key === 'message');
  const maxMessageLen = messageField?.max ?? 300;
  const isBusinessTheme = theme.occasion === 'business';

  // Local backup storage key so Instagram/WhatsApp In-App Browser never loses typed progress
  const localKey = `webzy_draft_${theme.id}`;

  useEffect(() => {
    if (initialDraftToken) return;
    try {
      const cached = window.localStorage.getItem(localKey);
      if (!cached) return;
      const parsed = JSON.parse(cached) as Record<string, string>;
      if (parsed.receiverName) setReceiverName(parsed.receiverName);
      if (parsed.senderName) setSenderName(parsed.senderName);
      if (parsed.message) setMessage(parsed.message);
      if (parsed.relation) setRelation(parsed.relation);
      if (parsed.whatsappPhone) setWhatsappPhone(parsed.whatsappPhone);
      if (parsed.draftToken) setDraftToken(parsed.draftToken);
    } catch {
      // Ignore strict storage errors
    }
  }, [initialDraftToken, localKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        localKey,
        JSON.stringify({
          receiverName,
          senderName,
          relation,
          message,
          whatsappPhone,
          draftToken,
        }),
      );
    } catch {
      // Ignore storage failures
    }
  }, [localKey, receiverName, senderName, relation, message, whatsappPhone, draftToken]);

  const liveScamWarning = useMemo(() => {
    const msgCheck = detectScamPatterns(message);
    if (!msgCheck.allowed) return msgCheck.reason || 'Links, phones & UPI IDs are blocked.';
    const nameCheck = detectScamPatterns(`${receiverName} ${senderName}`);
    if (!nameCheck.allowed) return nameCheck.reason || 'Invalid characters in name.';
    return '';
  }, [message, receiverName, senderName]);

  const previewPayload = useMemo(
    () =>
      buildThemePayloadFromDraft(theme, {
        receiverName,
        senderName,
        relation,
        message,
        whatsappPhone: isBusinessTheme ? whatsappPhone : '',
        photos: photos.map((p) => p.signedUrl || p.localObjectUrl || '').filter(Boolean),
        revealAt: revealAt || undefined,
      }),
    [theme, receiverName, senderName, relation, message, isBusinessTheme, whatsappPhone, photos, revealAt],
  );

  const ensureServerDraft = useCallback(async (): Promise<string | null> => {
    if (!supabaseConfigured) return null;
    if (draftToken) return draftToken;

    const res = await fetch('/api/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        themeId: theme.id,
        language: draftLang,
        content: {
          receiverName,
          senderName,
          relation,
          message,
          whatsappPhone: isBusinessTheme ? whatsappPhone : undefined,
        },
      }),
    });

    const data = (await res.json()) as { draftToken?: string; error?: string };
    if (!res.ok || !data.draftToken) {
      throw new Error(data.error || 'Could not initialize saved draft.');
    }
    setDraftToken(data.draftToken);
    const url = new URL(window.location.href);
    url.searchParams.set('draft', data.draftToken);
    window.history.replaceState({}, '', url.toString());
    return data.draftToken;
  }, [
    supabaseConfigured,
    draftToken,
    theme.id,
    draftLang,
    receiverName,
    senderName,
    relation,
    message,
    isBusinessTheme,
    whatsappPhone,
  ]);

  async function handleSaveDraft(): Promise<string | null> {
    setErrorMsg('');
    setSaveNotice('');
    if (liveScamWarning) {
      setErrorMsg(liveScamWarning);
      return null;
    }

    if (!supabaseConfigured) {
      setSaveNotice('Saved locally in this browser (Supabase keys needed for shareable cloud draft).');
      return null;
    }

    setSaving(true);
    try {
      const token = await ensureServerDraft();
      if (!token) return null;

      const res = await fetch(`/api/drafts/${encodeURIComponent(token)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: draftLang,
          revealAt: revealAt || null,
          content: {
            receiverName,
            senderName,
            relation,
            message,
            whatsappPhone: isBusinessTheme ? whatsappPhone : undefined,
          },
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save draft.');
      }

      setSaveNotice('Draft saved safely! You can resume anytime with this link.');
      return token;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save draft right now. Retry.');
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleUnlockPreview() {
    setErrorMsg('');
    const token = await handleSaveDraft();
    if (token) {
      document.cookie = `webzy_pending_draft=${encodeURIComponent(token)}; path=/; max-age=3600; SameSite=Lax`;
      router.push(`/preview/${encodeURIComponent(token)}`);
    }
  }

  async function handleAiDraft(tone: AiDraftTone) {
    setErrorMsg('');
    setAiBusy(true);
    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: theme.id,
          draftToken: draftToken || undefined,
          tone,
          language: draftLang,
          receiverName: receiverName || 'Dost',
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        remainingCredits?: number;
        error?: string;
      };
      if (!res.ok || !data.message) {
        throw new Error(data.error || 'Unable to generate message right now.');
      }
      setMessage(data.message);
      if (typeof data.remainingCredits === 'number') {
        setAiCreditsLeft(data.remainingCredits);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Draft suggestion unavailable. Type freely below!');
    } finally {
      setAiBusy(false);
    }
  }

  async function handlePhotoFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setErrorMsg('');
    const slotsLeft = maxPhotos - photos.length;
    if (slotsLeft <= 0) {
      setErrorMsg(`Maximum ${maxPhotos} photos allowed.`);
      return;
    }

    const queue = Array.from(files).slice(0, slotsLeft);
    setUploading(true);

    try {
      for (let i = 0; i < queue.length; i++) {
        const rawFile = queue[i];
        setUploadStatusText(`Compressing photo ${i + 1} of ${queue.length}...`);
        const compressed = await compressImageForMobileUpload(rawFile);

        if (!supabaseConfigured) {
          const objectUrl = URL.createObjectURL(compressed);
          setPhotos((prev) => [
            ...prev,
            { assetId: `local-${Date.now()}-${i}`, signedUrl: objectUrl, localObjectUrl: objectUrl },
          ]);
          continue;
        }

        const token = await ensureServerDraft();
        if (!token) throw new Error('Unable to create draft session for upload.');

        setUploadStatusText(`Uploading photo ${i + 1} of ${queue.length}...`);
        const formData = new FormData();
        formData.append('file', compressed);
        formData.append('draftToken', token);

        const res = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        });
        const data = (await res.json()) as {
          assetId?: string;
          signedUrl?: string;
          error?: string;
        };
        if (!res.ok || !data.assetId || !data.signedUrl) {
          throw new Error(data.error || 'Upload failed. Please retry.');
        }

        setPhotos((prev) => [...prev, { assetId: data.assetId!, signedUrl: data.signedUrl! }]);
      }
      setUploadStatusText('All photos added successfully.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Photo upload failed. Retry.');
      setUploadStatusText('');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto(assetId: string) {
    setErrorMsg('');
    if (assetId.startsWith('local-') || !supabaseConfigured || !draftToken) {
      setPhotos((prev) => prev.filter((p) => p.assetId !== assetId));
      return;
    }

    try {
      const res = await fetch(
        `/api/uploads?assetId=${encodeURIComponent(assetId)}&draftToken=${encodeURIComponent(draftToken)}`,
        { method: 'DELETE' },
      );
      if (!res.ok) throw new Error('Could not delete photo.');
      setPhotos((prev) => prev.filter((p) => p.assetId !== assetId));
    } catch {
      setErrorMsg('Failed to remove photo. Retry.');
    }
  }

  async function handleCopyResumeLink() {
    const token = await handleSaveDraft();
    const targetUrl = token
      ? `${window.location.origin}/create/${theme.id}?draft=${encodeURIComponent(token)}`
      : window.location.href;
    await navigator.clipboard.writeText(targetUrl).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  const totalSteps = 4;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/themes/${theme.id}`}
            className="inline-flex min-h-[44px] items-center text-xs font-bold text-webzy-primary hover:underline"
          >
            ← Back to {theme.name[draftLang]} demo
          </Link>
          <h1 className="font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
            Apna {theme.name[draftLang]} banao ({formatInr(theme.price.base)})
          </h1>
        </div>

        <button
          type="button"
          onClick={handleCopyResumeLink}
          className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-webzy-surface px-4 text-xs font-bold text-webzy-ink hover:border-webzy-primary"
        >
          {copiedLink ? '✓ Resume link copied' : 'Save & copy resume link'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6 grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => setStep(num)}
            className={`min-h-[44px] rounded-2xl border px-2 text-xs font-bold transition ${
              step === num
                ? 'border-webzy-primary bg-webzy-primary text-white shadow-sm'
                : num < step
                  ? 'border-webzy-tint bg-webzy-tint text-webzy-primary'
                  : 'border-webzy-tint bg-white text-webzy-ink/60'
            }`}
          >
            Step {num}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left: One-step-at-a-time dynamic form */}
        <section className="rounded-3xl border border-webzy-tint bg-webzy-surface/60 p-5 sm:p-7 lg:col-span-7">
          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-webzy-primary">
                  Step 1 of {totalSteps} · Language & Who it&apos;s for
                </span>
                <h2 className="mt-1 font-heading text-2xl font-bold text-webzy-ink">
                  Kaunsi language aur kiske liye?
                </h2>
              </div>

              <div>
                <p className="text-xs font-bold text-webzy-ink">Greeting language</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      { code: 'hinglish', label: 'Hinglish' },
                      { code: 'hi', label: 'हिन्दी' },
                      { code: 'en', label: 'English' },
                    ] as const
                  ).map((l) => (
                    <button
                      suppressHydrationWarning
                      key={l.code}
                      type="button"
                      onClick={() => setDraftLang(l.code)}
                      className={`min-h-[44px] rounded-full px-5 text-xs font-bold ${
                        draftLang === l.code
                          ? 'bg-webzy-primary text-white'
                          : 'border border-webzy-tint bg-white text-webzy-ink'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="cw-receiver" className="block text-xs font-bold text-webzy-ink">
                  {theme.fields.find((f) => f.key === 'receiverName')?.label[draftLang] ||
                    'Receiver name'}
                </label>
                <input
                  suppressHydrationWarning
                  id="cw-receiver"
                  type="text"
                  maxLength={40}
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="e.g. Priti / Mummy"
                  className="mt-1.5 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink"
                />
              </div>

              <div>
                <label htmlFor="cw-sender" className="block text-xs font-bold text-webzy-ink">
                  Aapka naam (Shown on gift cover)
                </label>
                <input
                  suppressHydrationWarning
                  id="cw-sender"
                  type="text"
                  maxLength={40}
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Honey"
                  className="mt-1.5 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink"
                />
              </div>

              {relationField?.options ? (
                <div>
                  <p className="text-xs font-bold text-webzy-ink">
                    {relationField.label[draftLang]}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {relationField.options.map((opt) => (
                      <button
                        suppressHydrationWarning
                        key={opt.value}
                        type="button"
                        onClick={() => setRelation(opt.value)}
                        className={`min-h-[44px] rounded-full px-4 text-xs font-bold ${
                          relation === opt.value
                            ? 'bg-webzy-ink text-white'
                            : 'border border-webzy-tint bg-white text-webzy-ink'
                        }`}
                      >
                        {opt.label[draftLang]}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-webzy-primary">
                  Step 2 of {totalSteps} · Personal Message &amp; Tone
                </span>
                <h2 className="mt-1 font-heading text-2xl font-bold text-webzy-ink">
                  Dil ki baat likho
                </h2>
              </div>

              <div className="rounded-2xl border border-webzy-tint bg-white p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-webzy-primary">
                    Suggested greeting ideas by tone:
                  </span>
                  <span className="text-[11px] text-webzy-ink/60">
                    {OCCASION_LABELS[theme.occasion][draftLang]}
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <button
                      suppressHydrationWarning
                      key={t.id}
                      type="button"
                      disabled={aiBusy}
                      onClick={() => handleAiDraft(t.id)}
                      className="min-h-[44px] rounded-full border border-webzy-tint bg-webzy-surface px-4 text-xs font-bold text-webzy-ink hover:border-webzy-primary disabled:opacity-50"
                    >
                      {aiBusy ? 'Loading idea...' : t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="cw-msg" className="text-xs font-bold text-webzy-ink">
                    {messageField?.label[draftLang] || 'Message'}
                  </label>
                  <span className="text-xs text-webzy-ink/60">
                    {message.length} / {maxMessageLen}
                  </span>
                </div>
                <textarea
                  id="cw-msg"
                  rows={5}
                  maxLength={maxMessageLen}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write something warm and original..."
                  className="mt-1.5 w-full rounded-2xl border border-webzy-tint bg-white p-4 text-sm leading-relaxed text-webzy-ink"
                />
                <p className="mt-1 text-[11px] text-webzy-ink/60">
                  Safety rule: External links, phone numbers, and UPI IDs are blocked on ready-made
                  greetings.
                </p>
              </div>

              {isBusinessTheme ? (
                <div>
                  <label htmlFor="cw-wa" className="block text-xs font-bold text-webzy-ink">
                    Business WhatsApp number (10 digits, optional)
                  </label>
                  <input
                    id="cw-wa"
                    type="tel"
                    maxLength={15}
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="mt-1.5 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-webzy-primary">
                  Step 3 of {totalSteps} · Photos & Reveal Time
                </span>
                <h2 className="mt-1 font-heading text-2xl font-bold text-webzy-ink">
                  Photos aur timing (Optional)
                </h2>
              </div>

              {hasPhotosField ? (
                <div className="rounded-2xl border border-webzy-tint bg-white p-4">
                  <p className="text-xs font-bold text-webzy-ink">
                    Upload up to {maxPhotos} photos (auto-optimized for fast mobile loading)
                  </p>
                  <label className="mt-3 flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl border border-dashed border-webzy-primary bg-webzy-surface px-4 text-xs font-bold text-webzy-primary">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={uploading || photos.length >= maxPhotos}
                      onChange={(e) => handlePhotoFiles(e.target.files)}
                      className="sr-only"
                    />
                    {uploading
                      ? uploadStatusText
                      : photos.length >= maxPhotos
                        ? `All ${maxPhotos} photos added`
                        : '+ Choose photos'}
                  </label>

                  {uploadStatusText && !uploading ? (
                    <p className="mt-2 text-xs font-semibold text-emerald-800">{uploadStatusText}</p>
                  ) : null}

                  {photos.length > 0 ? (
                    <div className="mt-4 grid grid-cols-3 gap-2.5">
                      {photos.map((p, idx) => (
                        <div key={p.assetId} className="relative overflow-hidden rounded-xl border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.signedUrl || p.localObjectUrl}
                            alt={`Upload ${idx + 1}`}
                            className="aspect-square w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(p.assetId)}
                            className="absolute right-1 top-1 min-h-[32px] min-w-[32px] rounded-full bg-black/75 px-2 text-[11px] font-bold text-white"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-4 text-xs text-webzy-ink/75">
                  This clean text-first theme does not require photos.
                </div>
              )}

              <div>
                <label htmlFor="cw-reveal" className="block text-xs font-bold text-webzy-ink">
                  Schedule reveal time (IST — optional, leave blank to open immediately)
                </label>
                <input
                  id="cw-reveal"
                  type="datetime-local"
                  value={revealAt}
                  onChange={(e) => setRevealAt(e.target.value)}
                  className="mt-1.5 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink"
                />
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-webzy-primary">
                  Step 4 of {totalSteps} · Review & Free Watermarked Preview
                </span>
                <h2 className="mt-1 font-heading text-2xl font-bold text-webzy-ink">
                  Preview check karein aur save karein
                </h2>
              </div>

              <div className="rounded-2xl bg-white p-4 text-sm shadow-sm">
                <p>
                  <strong>Theme:</strong> {theme.name[draftLang]} ({formatInr(theme.price.base)} GST
                  included)
                </p>
                <p className="mt-1">
                  <strong>To / From:</strong> {receiverName || '—'} · From {senderName || '—'}
                </p>
                <p className="mt-1">
                  <strong>Photos:</strong> {photos.length} attached
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  suppressHydrationWarning
                  type="button"
                  disabled={saving}
                  onClick={handleUnlockPreview}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
                >
                  {saving ? 'Preparing preview...' : 'View Free Watermarked Preview →'}
                </button>

                {draftToken ? (
                  <Link
                    href={`/checkout?draft=${encodeURIComponent(draftToken)}`}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Continue to Checkout ({formatInr(theme.price.base)}) →
                  </Link>
                ) : null}
              </div>

              <p className="text-xs text-webzy-ink/70">
                Preview your free watermarked Webzy on your phone, or proceed straight to checkout to remove the watermark and publish.
              </p>
            </div>
          ) : null}

          {liveScamWarning ? (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-950"
            >
              {liveScamWarning}
            </div>
          ) : null}

          {errorMsg ? (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900"
            >
              {errorMsg}
            </div>
          ) : null}

          {saveNotice ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-900">
              {saveNotice}
            </div>
          ) : null}

          {/* Prev / Next navigation */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-webzy-tint pt-4">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-white px-5 text-xs font-bold text-webzy-ink disabled:opacity-40"
            >
              ← Previous
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={async () => {
                  if (supabaseConfigured && (receiverName || message)) {
                    await handleSaveDraft();
                  }
                  setStep((s) => Math.min(totalSteps, s + 1));
                }}
                className="inline-flex min-h-[48px] items-center rounded-full bg-webzy-primary px-6 text-xs font-bold text-white"
              >
                Save & Next →
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveDraft}
                className="inline-flex min-h-[48px] items-center rounded-full bg-webzy-ink px-6 text-xs font-bold text-white"
              >
                {saving ? 'Saving...' : 'Save Final Draft'}
              </button>
            )}
          </div>
        </section>

        {/* Right: Live Phone Frame Preview */}
        <aside className="lg:col-span-5">
          <PhoneFrame caption="Live preview (tap gift cover to test your edits)">
            <ThemeRenderer
              manifest={theme}
              data={previewPayload}
              language={draftLang}
              watermarked
            />
          </PhoneFrame>
        </aside>
      </div>
    </div>
  );
}
