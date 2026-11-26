'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type AiDraftTone,
  detectScamPatterns,
  formatInr,
  LanguageCode,
  pickLocalizedText,
  SUPPORTED_LANGUAGES,
} from '@webzy/core';
import {
  buildThemePayloadFromDraft,
  OCCASION_LABELS,
  ThemeManifest,
  ThemeRenderer,
} from '@webzy/themes';
import { compressImageForMobileUpload } from '../../lib/compressImage';
import { AdaptivePreviewStage } from '../shell/AdaptivePreviewStage';
import { useLanguage } from '../shell/LanguageProvider';
import { getSupabaseBrowserClient } from '../../../../../infra/supabase/browser';

export interface UploadedPhotoItem {
  assetId: string;
  signedUrl: string;
  localObjectUrl?: string;
}

interface CreateWizardClientProps {
  theme: ThemeManifest;
  supabaseConfigured: boolean;
  isAuthenticated?: boolean;
  userEmail?: string;
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
  isAuthenticated = false,
  userEmail = '',
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

  // Keep draft language synced when user changes the global header language
  useEffect(() => {
    setDraftLang(siteLang);
  }, [siteLang]);

  // Authentication gating state
  const [isClientAuthed, setIsClientAuthed] = useState(Boolean(isAuthenticated));
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTargetAction, setAuthTargetAction] = useState<'preview' | 'checkout' | null>(null);
  const [authEmail, setAuthEmail] = useState(userEmail || '');
  const [authOtpCode, setAuthOtpCode] = useState('');
  const [authStatus, setAuthStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'error'>('idle');
  const [authErrorMessage, setAuthErrorMessage] = useState('');

  // Birthday & Event reveal helper
  const [revealMode, setRevealMode] = useState<'instant' | 'midnight' | 'morning' | 'custom'>(() => {
    if (!initialRevealAt) return 'instant';
    if (initialRevealAt.includes('T00:00') || initialRevealAt.includes('18:30:00')) return 'midnight';
    if (initialRevealAt.includes('T08:00') || initialRevealAt.includes('02:30:00')) return 'morning';
    return 'custom';
  });

  const [revealDate, setRevealDate] = useState<string>(() => {
    if (!initialRevealAt) {
      const tomorrow = new Date(Date.now() + 86400000 + 330 * 60 * 1000);
      return tomorrow.toISOString().slice(0, 10);
    }
    const ms = Date.parse(initialRevealAt);
    if (Number.isNaN(ms)) return '';
    const ist = new Date(ms + 330 * 60 * 1000);
    return ist.toISOString().slice(0, 10);
  });

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

  function handleRevealModeChange(mode: 'instant' | 'midnight' | 'morning' | 'custom', dateStr = revealDate) {
    setRevealMode(mode);
    if (mode === 'instant') {
      setRevealAt('');
    } else if (mode === 'midnight') {
      const d = dateStr || new Date(Date.now() + 86400000 + 330 * 60 * 1000).toISOString().slice(0, 10);
      setRevealAt(`${d}T00:00`);
    } else if (mode === 'morning') {
      const d = dateStr || new Date(Date.now() + 86400000 + 330 * 60 * 1000).toISOString().slice(0, 10);
      setRevealAt(`${d}T08:00`);
    }
  }

  function handleRevealDateChange(dateStr: string) {
    setRevealDate(dateStr);
    if (revealMode === 'midnight') {
      setRevealAt(`${dateStr}T00:00`);
    } else if (revealMode === 'morning') {
      setRevealAt(`${dateStr}T08:00`);
    }
  }

  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiCreditsLeft, setAiCreditsLeft] = useState(5);
  const [uploading, setUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [removingAssetId, setRemovingAssetId] = useState<string | null>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const draftTokenRef = useRef<string | null>(initialDraftToken ?? null);

  useEffect(() => {
    if (draftToken) {
      draftTokenRef.current = draftToken;
    }
  }, [draftToken]);
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
    if (!receiverName.trim()) {
      setStep(1);
      setErrorMsg('Please enter the recipient name in Step 1 first.');
      return;
    }
    if (!message.trim()) {
      setStep(2);
      setErrorMsg('Please write or generate a personal message in Step 2 first.');
      return;
    }
    const token = await handleSaveDraft();
    if (!token) return;

    document.cookie = `webzy_pending_draft=${encodeURIComponent(token)}; path=/; max-age=3600; SameSite=Lax`;

    if (!isClientAuthed && supabaseConfigured) {
      setAuthTargetAction('preview');
      setAuthModalOpen(true);
      return;
    }

    router.push(`/preview/${encodeURIComponent(token)}`);
  }

  async function handleProceedCheckout(e?: React.MouseEvent) {
    if (e) e.preventDefault();
    setErrorMsg('');
    if (!receiverName.trim()) {
      setStep(1);
      setErrorMsg('Please enter the recipient name in Step 1 before checkout.');
      return;
    }
    if (!message.trim()) {
      setStep(2);
      setErrorMsg('Please write or generate a personal message in Step 2 before checkout.');
      return;
    }
    const token = await handleSaveDraft();
    if (!token) return;

    document.cookie = `webzy_pending_draft=${encodeURIComponent(token)}; path=/; max-age=3600; SameSite=Lax`;

    if (!isClientAuthed && supabaseConfigured) {
      setAuthTargetAction('checkout');
      setAuthModalOpen(true);
      return;
    }

    router.push(`/checkout?draft=${encodeURIComponent(token)}`);
  }

  async function handleStepSelect(targetStep: number) {
    setErrorMsg('');
    if (targetStep >= 2 && !receiverName.trim()) {
      setStep(1);
      setErrorMsg('Please enter the recipient name in Step 1 before continuing.');
      return;
    }
    if (targetStep >= 3 && !message.trim()) {
      setStep(2);
      setErrorMsg('Please write or choose a greeting message in Step 2 before continuing.');
      return;
    }
    setStep(targetStep);
    if (targetStep === 4 && supabaseConfigured && !draftToken && receiverName.trim() && message.trim()) {
      await handleSaveDraft();
    }
  }

  async function handleSendInlineOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) return;
    const cleanEmail = authEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthStatus('error');
      setAuthErrorMessage('Please enter a valid email address.');
      return;
    }

    setAuthStatus('sending');
    setAuthErrorMessage('');

    try {
      if (draftToken) {
        document.cookie = `webzy_pending_draft=${encodeURIComponent(draftToken)}; path=/; max-age=3600; SameSite=Lax`;
      }
      const supabase = getSupabaseBrowserClient();
      const targetNext =
        authTargetAction === 'checkout'
          ? `/checkout?draft=${encodeURIComponent(draftToken)}`
          : `/preview/${encodeURIComponent(draftToken)}`;
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetNext)}`;

      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        const lower = (error.message || '').toLowerCase();
        setAuthStatus('error');
        setAuthErrorMessage(
          lower.includes('rate limit') || lower.includes('too many')
            ? 'Hourly email limit reached on Supabase default mailer. If you already received a code, tap "Already have a code?" below (or connect Custom SMTP in Supabase to lift the 2-email/hr limit).'
            : error.message || 'Failed to send OTP code.',
        );
        return;
      }

      setAuthStatus('sent');
    } catch (err) {
      setAuthStatus('error');
      setAuthErrorMessage(err instanceof Error ? err.message : 'Failed to send OTP code.');
    }
  }

  async function handleVerifyInlineOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = authEmail.trim().toLowerCase();
    const cleanCode = authOtpCode.replace(/\D/g, '');
    if (cleanCode.length < 6) {
      setAuthErrorMessage('Please enter the 6 to 8 digit code from your email.');
      return;
    }

    setAuthStatus('verifying');
    setAuthErrorMessage('');

    try {
      const supabase = getSupabaseBrowserClient();
      const attemptTypes = ['email', 'magiclink', 'signup'] as const;
      let verified = false;
      let lastErrMsg = '';
      for (const otpType of attemptTypes) {
        const { data: verifyData, error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanCode,
          type: otpType,
        });
        if (!error && verifyData.session) {
          verified = true;
          break;
        }
        lastErrMsg = error?.message || lastErrMsg;
      }

      if (!verified) {
        setAuthStatus('sent');
        setAuthErrorMessage(lastErrMsg || 'Invalid or expired code. Please check or resend.');
        return;
      }

      setIsClientAuthed(true);
      const activeToken = draftTokenRef.current || draftToken;
      if (activeToken) {
        await fetch('/api/auth/attach-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ draftToken: activeToken }),
        }).catch(() => {});
      }

      window.dispatchEvent(new Event('webzy_auth_updated'));
      window.dispatchEvent(new Event('webzy_orders_updated'));
      setAuthModalOpen(false);
      if (authTargetAction === 'checkout') {
        router.push(`/checkout?draft=${encodeURIComponent(activeToken)}`);
      } else {
        router.push(`/preview/${encodeURIComponent(activeToken)}`);
      }
    } catch (err) {
      setAuthStatus('sent');
      setAuthErrorMessage(err instanceof Error ? err.message : 'Could not verify code.');
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

  function handleCancelUpload() {
    uploadAbortRef.current?.abort();
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
    const controller = new AbortController();
    uploadAbortRef.current = controller;
    setUploading(true);

    let addedCount = 0;
    try {
      for (let i = 0; i < queue.length; i++) {
        if (controller.signal.aborted) break;
        const rawFile = queue[i];
        setUploadStatusText(`Compressing photo ${i + 1} of ${queue.length}...`);
        const compressed = await compressImageForMobileUpload(rawFile);
        if (controller.signal.aborted) break;

        if (!supabaseConfigured) {
          const objectUrl = URL.createObjectURL(compressed);
          setPhotos((prev) => [
            ...prev,
            { assetId: `local-${Date.now()}-${i}`, signedUrl: objectUrl, localObjectUrl: objectUrl },
          ]);
          addedCount += 1;
          continue;
        }

        const token = draftTokenRef.current || (await ensureServerDraft());
        if (controller.signal.aborted) break;
        if (!token) throw new Error('Unable to create draft session for upload.');
        draftTokenRef.current = token;

        setUploadStatusText(`Uploading photo ${i + 1} of ${queue.length}...`);
        const formData = new FormData();
        formData.append('file', compressed);
        formData.append('draftToken', token);

        const res = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
        const data = (await res.json().catch(() => ({}))) as {
          assetId?: string;
          signedUrl?: string;
          error?: string;
        };
        if (!res.ok || !data.assetId || !data.signedUrl) {
          throw new Error(data.error || 'Upload failed. Please retry.');
        }

        setPhotos((prev) => [...prev, { assetId: data.assetId!, signedUrl: data.signedUrl! }]);
        addedCount += 1;
      }

      if (controller.signal.aborted) {
        setUploadStatusText(
          addedCount > 0 ? `Upload cancelled (${addedCount} photo kept).` : 'Upload cancelled.',
        );
      } else {
        setUploadStatusText('All photos added successfully.');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setUploadStatusText(
          addedCount > 0 ? `Upload cancelled (${addedCount} photo kept).` : 'Upload cancelled.',
        );
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Photo upload failed. Retry.');
        setUploadStatusText('');
      }
    } finally {
      uploadAbortRef.current = null;
      setUploading(false);
    }
  }

  async function handleRemovePhoto(assetId: string) {
    setErrorMsg('');
    const target = photos.find((p) => p.assetId === assetId);
    const activeToken = draftTokenRef.current || draftToken;

    if (assetId.startsWith('local-') || !supabaseConfigured || !activeToken) {
      if (target?.localObjectUrl) {
        URL.revokeObjectURL(target.localObjectUrl);
      }
      setPhotos((prev) => prev.filter((p) => p.assetId !== assetId));
      setUploadStatusText('');
      return;
    }

    setRemovingAssetId(assetId);
    try {
      const res = await fetch(
        `/api/uploads?assetId=${encodeURIComponent(assetId)}&draftToken=${encodeURIComponent(activeToken)}`,
        { method: 'DELETE' },
      );
      if (!res.ok && res.status !== 404) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || 'Could not delete photo.');
      }
      setPhotos((prev) => prev.filter((p) => p.assetId !== assetId));
      setUploadStatusText('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to remove photo. Retry.');
    } finally {
      setRemovingAssetId(null);
    }
  }

  async function handleCopyResumeLink() {
    const token = await handleSaveDraft();
    const targetUrl = token
      ? `${window.location.origin}/create/${theme.id}?draft=${encodeURIComponent(token)}`
      : window.location.href;
    await navigator.clipboard.writeText(targetUrl).catch(() => { });
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  const totalSteps = 4;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:pb-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/themes/${theme.id}`}
            className="inline-flex min-h-[44px] items-center text-xs font-bold text-webzy-primary hover:underline"
          >
            ← Back to {pickLocalizedText(theme.name, draftLang)} demo
          </Link>
          <h1 className="font-heading text-2xl font-bold text-webzy-ink sm:text-3xl">
            Create your {pickLocalizedText(theme.name, draftLang)} ({formatInr(theme.price.base)})
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
            onClick={() => void handleStepSelect(num)}
            className={`min-h-[44px] rounded-2xl border px-2 text-xs font-bold transition ${step === num
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
                <label htmlFor="cw-lang-select" className="block text-xs font-bold text-webzy-ink">
                  Greeting language
                </label>
                <select
                  suppressHydrationWarning
                  id="cw-lang-select"
                  value={draftLang}
                  onChange={(e) => setDraftLang(e.target.value as LanguageCode)}
                  className="mt-1.5 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm font-semibold text-webzy-ink outline-none focus:border-webzy-primary"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.nativeLabel} ({l.englishLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cw-receiver" className="block text-xs font-bold text-webzy-ink">
                  {pickLocalizedText(
                    theme.fields.find((f) => f.key === 'receiverName')?.label,
                    draftLang,
                    'Receiver name',
                  )}
                </label>
                <input
                  suppressHydrationWarning
                  id="cw-receiver"
                  type="text"
                  maxLength={40}
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="e.g. Priya / Mummy"
                  className="mt-1.5 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink"
                />
              </div>

              <div>
                <label htmlFor="cw-sender" className="block text-xs font-bold text-webzy-ink">
                  Your name (shown on gift cover)
                </label>
                <input
                  suppressHydrationWarning
                  id="cw-sender"
                  type="text"
                  maxLength={40}
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Aarav"
                  className="mt-1.5 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink"
                />
              </div>

              {relationField?.options ? (
                <div>
                  <p className="text-xs font-bold text-webzy-ink">
                    {pickLocalizedText(relationField.label, draftLang)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {relationField.options.map((opt) => (
                      <button
                        suppressHydrationWarning
                        key={opt.value}
                        type="button"
                        onClick={() => setRelation(opt.value)}
                        className={`min-h-[44px] rounded-full px-4 text-xs font-bold ${relation === opt.value
                            ? 'bg-webzy-ink text-white'
                            : 'border border-webzy-tint bg-white text-webzy-ink'
                          }`}
                      >
                        {pickLocalizedText(opt.label, draftLang)}
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
                  Write your message
                </h2>
              </div>

              <div className="rounded-2xl border border-webzy-tint bg-white p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-webzy-primary">
                    Suggested greeting ideas by tone:
                  </span>
                  <span className="text-[11px] text-webzy-ink/60">
                    {pickLocalizedText(OCCASION_LABELS[theme.occasion], draftLang)}
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
                    {pickLocalizedText(messageField?.label, draftLang, 'Message')}
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
                  <div className="mt-3 flex items-center gap-2">
                    <label className="flex min-h-[48px] flex-1 cursor-pointer items-center justify-center rounded-xl border border-dashed border-webzy-primary bg-webzy-surface px-4 text-xs font-bold text-webzy-primary">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={uploading || photos.length >= maxPhotos}
                        onChange={(e) => {
                          const selected = e.target.files;
                          e.target.value = '';
                          void handlePhotoFiles(selected);
                        }}
                        className="sr-only"
                      />
                      {uploading
                        ? uploadStatusText
                        : photos.length >= maxPhotos
                          ? `All ${maxPhotos} photos added`
                          : '+ Choose photos'}
                    </label>
                    {uploading ? (
                      <button
                        type="button"
                        onClick={handleCancelUpload}
                        className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3.5 text-xs font-bold text-red-700 hover:bg-red-100"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>

                  {uploadStatusText && !uploading ? (
                    <p className="mt-2 text-xs font-semibold text-emerald-800">{uploadStatusText}</p>
                  ) : null}

                  {photos.length > 0 ? (
                    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
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
                            disabled={removingAssetId === p.assetId}
                            onClick={() => void handleRemovePhoto(p.assetId)}
                            aria-label={`Remove upload ${idx + 1}`}
                            className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/75 text-xs font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
                          >
                            {removingAssetId === p.assetId ? '...' : '✕'}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <p className="mt-3 text-xs leading-relaxed text-webzy-ink/65">
                    Photos are kept private, blocked from search engines, stripped of GPS location data, and automatically deleted after 30 days.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-4 text-xs text-webzy-ink/75">
                  This clean text-first theme does not require photos.
                </div>
              )}

              <div className="rounded-2xl border border-webzy-tint bg-white p-4">
                <label className="block text-xs font-bold text-webzy-ink">
                  {theme.occasion === 'birthday' ? 'Birthday Surprise Reveal' : 'Schedule Reveal Timing (IST)'}
                </label>
                <p className="mt-0.5 text-[11px] text-webzy-ink/70">
                  Choose when the greeting unlocks. Leave as instant to view immediately upon sending.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => handleRevealModeChange('instant')}
                    className={`min-h-[44px] rounded-xl border px-3 text-xs font-bold transition ${revealMode === 'instant'
                        ? 'border-webzy-primary bg-webzy-surface text-webzy-primary shadow-xs'
                        : 'border-webzy-tint bg-white text-webzy-ink hover:bg-webzy-surface/50'
                      }`}
                  >
                    Open Immediately
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRevealModeChange('midnight')}
                    className={`min-h-[44px] rounded-xl border px-3 text-xs font-bold transition ${revealMode === 'midnight'
                        ? 'border-webzy-primary bg-webzy-surface text-webzy-primary shadow-xs'
                        : 'border-webzy-tint bg-white text-webzy-ink hover:bg-webzy-surface/50'
                      }`}
                  >
                    12:00 AM Midnight
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRevealModeChange('morning')}
                    className={`min-h-[44px] rounded-xl border px-3 text-xs font-bold transition ${revealMode === 'morning'
                        ? 'border-webzy-primary bg-webzy-surface text-webzy-primary shadow-xs'
                        : 'border-webzy-tint bg-white text-webzy-ink hover:bg-webzy-surface/50'
                      }`}
                  >
                    8:00 AM Morning
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRevealModeChange('custom')}
                    className={`min-h-[44px] rounded-xl border px-3 text-xs font-bold transition ${revealMode === 'custom'
                        ? 'border-webzy-primary bg-webzy-surface text-webzy-primary shadow-xs'
                        : 'border-webzy-tint bg-white text-webzy-ink hover:bg-webzy-surface/50'
                      }`}
                  >
                    Custom Time
                  </button>
                </div>

                {revealMode === 'midnight' || revealMode === 'morning' ? (
                  <div className="mt-4 rounded-xl border border-webzy-tint bg-webzy-surface/40 p-3">
                    <label htmlFor="cw-date" className="block text-xs font-bold text-webzy-ink">
                      {theme.occasion === 'birthday' ? 'Birthday Date' : 'Event Date'}
                    </label>
                    <input
                      id="cw-date"
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      value={revealDate}
                      onChange={(e) => handleRevealDateChange(e.target.value)}
                      className="mt-1.5 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3 text-sm font-semibold text-webzy-ink"
                    />
                    <p className="mt-1.5 text-[11px] text-webzy-ink/70">
                      Unlocks at {revealMode === 'midnight' ? '12:00 AM midnight sharp' : '8:00 AM'} on {revealDate || 'chosen date'} with a live celebration countdown before then.
                    </p>
                  </div>
                ) : null}

                {revealMode === 'custom' ? (
                  <div className="mt-4 rounded-xl border border-webzy-tint bg-webzy-surface/40 p-3">
                    <label htmlFor="cw-reveal" className="block text-xs font-bold text-webzy-ink">
                      Exact Date & Time (IST)
                    </label>
                    <input
                      id="cw-reveal"
                      type="datetime-local"
                      value={revealAt}
                      onChange={(e) => setRevealAt(e.target.value)}
                      className="mt-1.5 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3 text-sm text-webzy-ink"
                    />
                  </div>
                ) : null}
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
                  <strong>Theme:</strong> {pickLocalizedText(theme.name, draftLang)} ({formatInr(theme.price.base)} GST
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

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleProceedCheckout}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : `Continue to Checkout (${formatInr(theme.price.base)}) →`}
                </button>
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
                  await handleStepSelect(Math.min(totalSteps, step + 1));
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

        {/* Right: Adaptive Live Preview (First on mobile/tablet so builders never hunt at bottom) */}
        <aside className="order-first lg:order-last lg:sticky lg:top-24 lg:col-span-5">
          <AdaptivePreviewStage
            title={pickLocalizedText(theme.name, draftLang)}
            caption="Tap gift cover to test your edits"
            accentColor={theme.palette.primary || '#E11D63'}
            mobileVariant="compact"
            fullscreenChildren={
              <ThemeRenderer
                manifest={theme}
                data={previewPayload}
                language={draftLang}
                watermarked
              />
            }
          >
            <ThemeRenderer
              manifest={theme}
              data={previewPayload}
              language={draftLang}
              watermarked
            />
          </AdaptivePreviewStage>
        </aside>
      </div>

      {/* Auth Gate Inline Modal */}
      {authModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-8 animate-scale-in">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-heading text-xl font-bold text-webzy-ink sm:text-2xl">
                {authTargetAction === 'checkout' ? 'Sign in to finish & publish' : 'Sign in to preview & save'}
              </h3>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                aria-label="Close"
                className="flex h-11 w-11 -mr-2 shrink-0 items-center justify-center rounded-xl text-webzy-ink/60 hover:bg-webzy-surface hover:text-webzy-ink"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-webzy-ink/75">
              Enter your email to receive a 6-digit verification code. Your customized Webzy will be safely saved to your account.
            </p>

            {authStatus === 'sent' || authStatus === 'verifying' ? (
              <form onSubmit={handleVerifyInlineOtp} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="auth-otp-code" className="block text-xs font-bold text-webzy-ink">
                    6-digit code sent to {authEmail}
                  </label>
                  <input
                    id="auth-otp-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                    value={authOtpCode}
                    onChange={(e) => setAuthOtpCode(e.target.value.replace(/[^\d]/g, '').slice(0, 8))}
                    placeholder="123456"
                    className="mt-1.5 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-center font-mono text-xl tracking-widest text-webzy-ink focus:border-webzy-primary"
                    autoFocus
                  />
                </div>

                {authErrorMessage ? (
                  <p className="text-xs text-red-600">{authErrorMessage}</p>
                ) : null}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={authStatus === 'verifying' || authOtpCode.trim().length < 6}
                    className="flex-1 min-h-[44px] rounded-full bg-webzy-primary px-4 text-xs font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
                  >
                    {authStatus === 'verifying' ? 'Verifying...' : 'Verify & Continue →'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthStatus('idle')}
                    className="min-h-[44px] rounded-full border border-webzy-tint px-4 text-xs font-bold text-webzy-ink hover:bg-webzy-surface"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSendInlineOtp} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="auth-email-input" className="block text-xs font-bold text-webzy-ink">
                    Email address
                  </label>
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="mt-1.5 min-h-[48px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink focus:border-webzy-primary"
                    autoFocus
                  />
                </div>

                {authErrorMessage ? (
                  <p className="text-xs text-red-600">{authErrorMessage}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={authStatus === 'sending'}
                  className="min-h-[44px] w-full rounded-full bg-webzy-primary px-4 text-xs font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
                >
                  {authStatus === 'sending' ? 'Sending code...' : 'Send 6-digit code →'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const clean = authEmail.trim().toLowerCase();
                    if (!clean || !clean.includes('@')) {
                      setAuthErrorMessage('Enter your email address first.');
                      return;
                    }
                    setAuthErrorMessage('');
                    setAuthStatus('sent');
                  }}
                  className="min-h-[38px] w-full rounded-full border border-webzy-tint bg-webzy-surface/60 px-4 text-xs font-bold text-webzy-ink/80 hover:border-webzy-primary/40 hover:text-webzy-primary"
                >
                  Already have a code? Enter it here
                </button>

                <p className="text-center text-[11px] text-webzy-ink/60">
                  Or{' '}
                  <Link
                    href={`/login?next=${encodeURIComponent(
                      authTargetAction === 'checkout'
                        ? `/checkout?draft=${encodeURIComponent(draftToken)}`
                        : `/preview/${encodeURIComponent(draftToken)}`,
                    )}&draftToken=${encodeURIComponent(draftToken)}`}
                    className="font-bold text-webzy-primary underline"
                  >
                    open full login page
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
