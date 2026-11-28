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
import { useAuth } from '../auth/AuthProvider';
import { AdaptivePreviewStage } from '../shell/AdaptivePreviewStage';
import { useLanguage } from '../shell/LanguageProvider';

export interface UploadedPhotoItem {
  assetId: string;
  signedUrl: string;
  localObjectUrl?: string;
}

export interface CustomCardItem {
  title: string;
  detail: string;
}

interface CreateWizardClientProps {
  theme: ThemeManifest;
  supabaseConfigured: boolean;
  isAuthenticated?: boolean;
  userEmail?: string;
  initialDraftToken?: string;
  initialLanguage?: LanguageCode;
  initialContent?: Record<string, unknown>;
  initialPhotos?: UploadedPhotoItem[];
  initialRevealAt?: string | null;
}

function readStringField(obj: Record<string, unknown> | undefined, key: string): string {
  const val = obj?.[key];
  return typeof val === 'string' ? val : '';
}

function readHighlightsField(obj: Record<string, unknown> | undefined): CustomCardItem[] {
  const raw = obj?.highlights;
  const slots: CustomCardItem[] = Array.from({ length: 4 }, () => ({ title: '', detail: '' }));
  if (Array.isArray(raw)) {
    raw.slice(0, 4).forEach((item, idx) => {
      if (item && typeof item === 'object') {
        const rec = item as Record<string, unknown>;
        slots[idx] = {
          title: typeof rec.title === 'string' ? rec.title : '',
          detail: typeof rec.detail === 'string' ? rec.detail : '',
        };
      }
    });
  }
  return slots;
}

function getCardsSectionCopy(theme: ThemeManifest): { heading: string; helper: string; slotNoun: string } {
  switch (theme.id) {
    case 'will-you-01':
      return {
        heading: 'Personalize 4 Rose Bouquet Notes',
        helper: 'Tap pins on the rose bouquet in the preview to see your custom reasons update live.',
        slotNoun: 'Bloom Note',
      };
    case 'maan-jao-01':
      return {
        heading: 'Personalize 4 Clipped Care Promises',
        helper: 'Each pastel paper-clipped sticky note on the page updates live with your own promises.',
        slotNoun: 'Care Promise',
      };
    case 'our-timeline-01':
      return {
        heading: 'Personalize Timeline Chapters',
        helper: 'Customize up to 4 milestone chapters (e.g. First Meet, First Trip, Favorite Memory, Today).',
        slotNoun: 'Chapter',
      };
    case 'birthday-ashirwad-01':
      return {
        heading: 'Personalize Family Blessing Cards',
        helper: 'Add personal wishes, memories, or prayers from family members (up to 4 cards).',
        slotNoun: 'Blessing',
      };
    case 'make-them-smile-01':
      return {
        heading: 'Personalize "Open When" Notes',
        helper: 'Write up to 4 thoughtful envelopes or gratitude notes they can tap to open.',
        slotNoun: 'Note',
      };
    default:
      return {
        heading: 'Personalize Highlight Cards (Up to 4)',
        helper: 'Leave blank to keep the curated editorial cards, or type your own to override them live.',
        slotNoun: 'Card',
      };
  }
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
  initialDraftToken,
  initialLanguage,
  initialContent,
  initialPhotos = [],
  initialRevealAt,
}: CreateWizardClientProps) {
  const router = useRouter();
  const { language: siteLang } = useLanguage();
  const {
    isAuthenticated: clientAuthenticated,
    loading: authLoading,
    openAuthModal,
  } = useAuth();
  const effectiveAuthenticated = authLoading ? isAuthenticated : clientAuthenticated;
  const [step, setStep] = useState(1);
  const [draftLang, setDraftLang] = useState<LanguageCode>(initialLanguage ?? siteLang);
  const [draftToken, setDraftToken] = useState(initialDraftToken || '');

  // Keep draft language synced when user changes the global header language
  useEffect(() => {
    setDraftLang(siteLang);
  }, [siteLang]);

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

  const [receiverName, setReceiverName] = useState(() => readStringField(initialContent, 'receiverName'));
  const [senderName, setSenderName] = useState(() => readStringField(initialContent, 'senderName'));
  const [relation, setRelation] = useState(
    () =>
      readStringField(initialContent, 'relation') ||
      theme.fields.find((f) => f.key === 'relation')?.options?.[0]?.value ||
      '',
  );
  const [headline, setHeadline] = useState(() => readStringField(initialContent, 'headline'));
  const [message, setMessage] = useState(() => readStringField(initialContent, 'message'));
  const [offerTag, setOfferTag] = useState(() => readStringField(initialContent, 'offerTag'));
  const [highlights, setHighlights] = useState<CustomCardItem[]>(() => readHighlightsField(initialContent));
  const [showAdvancedCards, setShowAdvancedCards] = useState<boolean>(() => {
    const hasHeadline = Boolean(readStringField(initialContent, 'headline'));
    const hasOffer = Boolean(readStringField(initialContent, 'offerTag'));
    const hasCards = readHighlightsField(initialContent).some((c) => c.title || c.detail);
    return hasHeadline || hasOffer || hasCards;
  });
  const [whatsappPhone, setWhatsappPhone] = useState(() => readStringField(initialContent, 'whatsappPhone'));
  const [revealAt, setRevealAt] = useState(() => utcIsoToIstDatetimeLocal(initialRevealAt));
  const [photos, setPhotos] = useState<UploadedPhotoItem[]>(initialPhotos);

  const cardsCopy = useMemo(() => getCardsSectionCopy(theme), [theme]);
  const customizedCardCount = useMemo(
    () => highlights.filter((item) => item.title.trim() || item.detail.trim()).length,
    [highlights],
  );

  function handleHighlightChange(idx: number, field: 'title' | 'detail', value: string) {
    setHighlights((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  }

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
  const whatsappField = theme.fields.find((f) => f.key === 'whatsappPhone');
  const isBusinessTheme = theme.occasion === 'business' || Boolean(whatsappField);

  // Local backup storage key so Instagram/WhatsApp In-App Browser never loses typed progress
  const localKey = `webzy_draft_${theme.id}`;

  useEffect(() => {
    if (initialDraftToken) return;
    try {
      const cached = window.localStorage.getItem(localKey);
      if (!cached) return;
      const parsed = JSON.parse(cached) as Record<string, unknown>;
      if (typeof parsed.receiverName === 'string' && parsed.receiverName) setReceiverName(parsed.receiverName);
      if (typeof parsed.senderName === 'string' && parsed.senderName) setSenderName(parsed.senderName);
      if (typeof parsed.headline === 'string' && parsed.headline) setHeadline(parsed.headline);
      if (typeof parsed.message === 'string' && parsed.message) setMessage(parsed.message);
      if (typeof parsed.offerTag === 'string' && parsed.offerTag) setOfferTag(parsed.offerTag);
      if (typeof parsed.relation === 'string' && parsed.relation) setRelation(parsed.relation);
      if (typeof parsed.whatsappPhone === 'string' && parsed.whatsappPhone) setWhatsappPhone(parsed.whatsappPhone);
      if (Array.isArray(parsed.highlights)) {
        const restored = readHighlightsField({ highlights: parsed.highlights });
        if (restored.some((c) => c.title || c.detail)) {
          setHighlights(restored);
        }
      }
      if (typeof parsed.draftToken === 'string' && parsed.draftToken) setDraftToken(parsed.draftToken);
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
          headline,
          message,
          offerTag,
          highlights,
          whatsappPhone,
          draftToken,
        }),
      );
    } catch {
      // Ignore storage failures
    }
  }, [localKey, receiverName, senderName, relation, headline, message, offerTag, highlights, whatsappPhone, draftToken]);

  const liveScamWarning = useMemo(() => {
    const msgCheck = detectScamPatterns(message);
    if (!msgCheck.allowed) return msgCheck.reason || 'Links, phones & UPI IDs are blocked.';
    const nameCheck = detectScamPatterns(`${receiverName} ${senderName} ${headline} ${offerTag}`);
    if (!nameCheck.allowed) return nameCheck.reason || 'Invalid characters in name or headline.';
    for (let i = 0; i < highlights.length; i += 1) {
      const cardText = `${highlights[i]?.title || ''} ${highlights[i]?.detail || ''}`.trim();
      if (cardText) {
        const cardCheck = detectScamPatterns(cardText);
        if (!cardCheck.allowed) return cardCheck.reason || `Card ${i + 1} contains blocked links or numbers.`;
      }
    }
    return '';
  }, [message, receiverName, senderName, headline, offerTag, highlights]);

  const previewPayload = useMemo(
    () =>
      buildThemePayloadFromDraft(theme, {
        receiverName,
        senderName,
        relation,
        headline,
        message,
        offerTag: theme.occasion === 'business' ? offerTag : undefined,
        highlights,
        whatsappPhone: isBusinessTheme ? whatsappPhone : '',
        photos: photos.map((p) => p.signedUrl || p.localObjectUrl || '').filter(Boolean),
        revealAt: revealAt || undefined,
      }),
    [
      theme,
      receiverName,
      senderName,
      relation,
      headline,
      message,
      offerTag,
      highlights,
      isBusinessTheme,
      whatsappPhone,
      photos,
      revealAt,
    ],
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
          headline,
          message,
          offerTag: theme.occasion === 'business' ? offerTag : undefined,
          highlights,
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
    theme.occasion,
    draftLang,
    receiverName,
    senderName,
    relation,
    headline,
    message,
    offerTag,
    highlights,
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
            headline,
            message,
            offerTag: theme.occasion === 'business' ? offerTag : undefined,
            highlights,
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

    if (!effectiveAuthenticated && supabaseConfigured) {
      openAuthModal({
        reason: 'Sign in or create a free account to preview and save your customized Webzy.',
        draftToken: token,
        onSuccess: () => {
          router.push(`/preview/${encodeURIComponent(token)}`);
        },
      });
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

    if (!effectiveAuthenticated && supabaseConfigured) {
      openAuthModal({
        reason: 'Sign in or create a free account to publish your customized Webzy and receive your live link.',
        draftToken: token,
        onSuccess: () => {
          router.push(`/checkout?draft=${encodeURIComponent(token)}`);
        },
      });
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
                    {pickLocalizedText(
                      whatsappField?.label,
                      draftLang,
                      'WhatsApp contact / booking number (10 digits, optional)',
                    )}
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

              {/* Optional Deep Customization Accordion: Custom Headline, Offer Badge & Up to 4 Cards */}
              <div className="rounded-2xl border border-webzy-tint bg-white p-4">
                <button
                  type="button"
                  onClick={() => setShowAdvancedCards((open) => !open)}
                  aria-expanded={showAdvancedCards}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div>
                    <span className="block text-xs font-bold text-webzy-ink">
                      {cardsCopy.heading} &amp; Cover Headline
                    </span>
                    <span className="mt-0.5 block text-[11px] text-webzy-ink/65">
                      Optional — leave blank to keep curated defaults, or customize every card live
                      {customizedCardCount > 0 || headline.trim()
                        ? ` (${customizedCardCount} card${customizedCardCount === 1 ? '' : 's'} customized)`
                        : ''}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full border border-webzy-tint bg-webzy-surface px-3 py-1 text-[11px] font-bold text-webzy-primary">
                    {showAdvancedCards ? 'Hide' : 'Customize'}
                  </span>
                </button>

                {showAdvancedCards ? (
                  <div className="mt-4 space-y-4 border-t border-webzy-tint/70 pt-4">
                    <div>
                      <label htmlFor="cw-headline" className="block text-xs font-bold text-webzy-ink">
                        Custom Cover Headline (optional)
                      </label>
                      <input
                        id="cw-headline"
                        type="text"
                        maxLength={90}
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder={pickLocalizedText(theme.demoData.headline, draftLang)}
                        className="mt-1.5 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-webzy-surface/35 px-3.5 text-sm text-webzy-ink outline-none focus:border-webzy-primary focus:bg-white"
                      />
                    </div>

                    {theme.occasion === 'business' ? (
                      <div>
                        <label htmlFor="cw-offer" className="block text-xs font-bold text-webzy-ink">
                          Special Offer / Privilege Badge (optional)
                        </label>
                        <input
                          id="cw-offer"
                          type="text"
                          maxLength={120}
                          value={offerTag}
                          onChange={(e) => setOfferTag(e.target.value)}
                          placeholder={
                            pickLocalizedText(theme.demoData.offerTag, draftLang) ||
                            'e.g. SAVE 20% · FIRST ORDER'
                          }
                          className="mt-1.5 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-webzy-surface/35 px-3.5 text-sm text-webzy-ink outline-none focus:border-webzy-primary focus:bg-white"
                        />
                      </div>
                    ) : null}

                    <div>
                      <p className="text-xs font-bold text-webzy-ink">{cardsCopy.heading}</p>
                      <p className="mt-0.5 text-[11px] text-webzy-ink/65">{cardsCopy.helper}</p>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {highlights.map((card, idx) => {
                          const defaultCard = theme.demoData.highlights?.[idx];
                          const titlePh =
                            pickLocalizedText(defaultCard?.title, draftLang) ||
                            `${cardsCopy.slotNoun} ${idx + 1} title`;
                          const detailPh =
                            pickLocalizedText(defaultCard?.detail, draftLang) ||
                            'Short personal note (optional)';
                          return (
                            <div
                              key={`card-slot-${idx}`}
                              className="rounded-xl border border-webzy-tint/80 bg-webzy-surface/30 p-3"
                            >
                              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-webzy-primary">
                                {cardsCopy.slotNoun} 0{idx + 1}
                              </span>
                              <input
                                type="text"
                                maxLength={60}
                                value={card.title}
                                onChange={(e) => handleHighlightChange(idx, 'title', e.target.value)}
                                placeholder={titlePh}
                                aria-label={`${cardsCopy.slotNoun} ${idx + 1} title`}
                                className="mt-1.5 min-h-[40px] w-full rounded-lg border border-webzy-tint bg-white px-3 text-xs font-semibold text-webzy-ink outline-none focus:border-webzy-primary"
                              />
                              <textarea
                                rows={2}
                                maxLength={180}
                                value={card.detail}
                                onChange={(e) => handleHighlightChange(idx, 'detail', e.target.value)}
                                placeholder={detailPh}
                                aria-label={`${cardsCopy.slotNoun} ${idx + 1} note`}
                                className="mt-1.5 w-full rounded-lg border border-webzy-tint bg-white px-3 py-2 text-xs text-webzy-ink outline-none focus:border-webzy-primary"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
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
                  {customizedCardCount > 0 ? ` · ${customizedCardCount} custom cards` : ''}
                  {headline.trim() ? ' · Custom headline' : ''}
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
    </div>
  );
}
