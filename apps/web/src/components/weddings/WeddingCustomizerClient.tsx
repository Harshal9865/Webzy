'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  parseWeddingLanguage,
  WEDDING_LANGUAGE_OPTIONS,
  WeddingScroll,
  type WeddingEventItem,
  type WeddingHospitalityNote,
  type WeddingIconKey,
  type WeddingInvitation,
  type WeddingLanguage,
  type WeddingStoryMilestone,
  type WeddingVenueHighlight,
} from '@webzy/themes';
import { useAuth } from '../auth/AuthProvider';
import { useLanguage } from '../shell/LanguageProvider';
import { compressImageForMobileUpload } from '../../lib/compressImage';
import { AdaptivePreviewStage } from '../shell/AdaptivePreviewStage';
import { formatInrComma, type WeddingEditionMeta } from './weddingCatalog';

interface WeddingCustomizerClientProps {
  edition: WeddingEditionMeta;
  initialDraftToken?: string;
}

const STEPS = [
  { id: 1, label: 'Couple & Blessings' },
  { id: 2, label: 'Ceremonies' },
  { id: 3, label: 'Blessings & Story' },
  { id: 4, label: 'RSVP & Shagun' },
  { id: 5, label: 'Guest Links & Checkout' },
] as const;

const TRADITIONAL_BLESSING_PRESETS = [
  '|| Shri Ganeshay Namah ||',
  'With Family Blessings',
  "Under God's Grace",
  'Shubh Vivah Nimantran',
] as const;

const SHORT_STORY_NOTE_PRESETS = [
  'Two Hearts · One Sacred Journey',
  'With Elder Blessings · Forever Begins',
  'Join Our Sacred Celebration',
  'Love · Laughter · Sacred Vows',
] as const;

const ICON_OPTIONS: Array<{ value: WeddingIconKey; label: string }> = [
  { value: 'haldi', label: 'Haldi' },
  { value: 'mehendi', label: 'Mehendi' },
  { value: 'sangeet', label: 'Sangeet / Music' },
  { value: 'pheras', label: 'Pheras / Vows' },
  { value: 'church', label: 'Church / Holy Matrimony' },
  { value: 'toast', label: 'Toast & Cake Cutting' },
  { value: 'reception', label: 'Reception / Dinner' },
  { value: 'ring_ceremony', label: 'Engagement / Roce' },
  { value: 'cocktail', label: 'Cocktail' },
  { value: 'ganesha', label: 'Ganesha Puja / Blessing' },
];

const DRESS_PALETTE_PRESETS: Array<{ label: string; colors: string[] }> = [
  { label: 'Sunshine Haldi', colors: ['#F2B705', '#D97706', '#FAF0CA'] },
  { label: 'Emerald & Gold', colors: ['#2D4F35', '#C9A243', '#F4F7F4'] },
  { label: 'Sindoor & Ivory', colors: ['#7A1424', '#D4AF37', '#FDF6F0'] },
  { label: 'Midnight Indigo', colors: ['#132447', '#DFBE6B', '#E5E9F5'] },
  { label: 'Blush & Champagne', colors: ['#C77D8A', '#D6B77C', '#FAF3F0'] },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export function WeddingCustomizerClient({
  edition,
  initialDraftToken,
}: WeddingCustomizerClientProps) {
  const router = useRouter();
  const { language: siteLanguage } = useLanguage();
  const { isAuthenticated, profile, user, openAuthModal } = useAuth();
  const draftStorageKey = `webzy_wedding_draft_${edition.id}`;

  const [step, setStep] = useState<number>(1);
  const [form, setForm] = useState<WeddingInvitation>(() => ({
    ...edition.defaultData,
    language: parseWeddingLanguage(siteLanguage) ?? edition.defaultData.language,
    gallery: edition.defaultData.gallery.slice(0, 3),
    slug: `${slugify(edition.defaultData.brideName)}-${slugify(edition.defaultData.groomName)}`,
  }));
  const [maxGuestsInput, setMaxGuestsInput] = useState<string>(() =>
    String(edition.defaultData.rsvp.maxGuests ?? 4),
  );
  const [previewMode, setPreviewMode] = useState<'gate' | 'inside'>('inside');
  const [previewKey, setPreviewKey] = useState(0);
  const [draftSavedAt, setDraftSavedAt] = useState<string>('');
  const [profileApplied, setProfileApplied] = useState(false);

  // Step 3 helper for adding a photo URL or uploading from device
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [serverDraftToken, setServerDraftToken] = useState(initialDraftToken || '');
  const [openingPreview, setOpeningPreview] = useState(false);
  const uploadedAssetsRef = useRef<Record<string, string>>({});
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // Step 5 Guest List & Checkout state
  const [guestListText, setGuestListText] = useState(
    'Sharma Family\nKapoor Family\nDr. Mehta & Family\nAarav & Sneha',
  );
  const [submittingCheckout, setSubmittingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [localFallbackNotice, setLocalFallbackNotice] = useState('');
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>('https://webzy.in');

  useEffect(() => {
    setOrigin(window.location.origin);
    try {
      const savedGuests = window.localStorage.getItem('webzy_wedding_guest_list');
      if (savedGuests && savedGuests.trim()) {
        setGuestListText(savedGuests);
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('webzy_wedding_guest_list', guestListText);
    } catch {
      // Ignore storage quota errors
    }
  }, [guestListText]);

  // Keep wedding invitation script in sync when the user changes global website language
  useEffect(() => {
    const mapped = parseWeddingLanguage(siteLanguage);
    if (mapped) {
      setForm((prev) => (prev.language === mapped ? prev : { ...prev, language: mapped }));
    }
  }, [siteLanguage]);

  // Cleanup any local blob preview URLs on unmount
  useEffect(() => {
    const blobs = blobUrlsRef.current;
    return () => {
      blobs.forEach((url) => URL.revokeObjectURL(url));
      blobs.clear();
    };
  }, []);

  // Restore saved local draft on mount (zero-friction without forcing login)
  // If returning from /checkout with ?draft=<token>, hydrate from /api/drafts/<token> when available
  useEffect(() => {
    let cancelled = false;
    const defaultGallery = edition.defaultData.gallery.slice(0, 3);

    function mergeWithDefaults(candidate: Partial<WeddingInvitation>, gallery: string[]): WeddingInvitation {
      const mergedRsvp = {
        ...edition.defaultData.rsvp,
        ...(candidate.rsvp && typeof candidate.rsvp === 'object' ? candidate.rsvp : {}),
      };
      const mergedEvents =
        Array.isArray(candidate.events) && candidate.events.length > 0
          ? candidate.events
          : edition.defaultData.events;
      return {
        ...edition.defaultData,
        ...candidate,
        rsvp: mergedRsvp,
        events: mergedEvents,
        gallery,
      };
    }

    function restoreFromLocalStorage() {
      try {
        const raw = window.localStorage.getItem(draftStorageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<WeddingInvitation>;
          if (parsed && parsed.brideName && parsed.groomName) {
            const cleanGallery = Array.isArray(parsed.gallery)
              ? parsed.gallery.filter((u): u is string => typeof u === 'string' && !u.startsWith('blob:'))
              : defaultGallery;
            const merged = mergeWithDefaults(parsed, cleanGallery);
            setForm(merged);
            setMaxGuestsInput(String(merged.rsvp.maxGuests ?? 4));
            setDraftSavedAt('Restored saved draft');
          }
        }
      } catch {
        // Ignore storage errors
      }
    }

    restoreFromLocalStorage();

    if (initialDraftToken && /^[A-Za-z0-9_-]{24,128}$/.test(initialDraftToken)) {
      void (async () => {
        try {
          const res = await fetch(`/api/drafts/${encodeURIComponent(initialDraftToken)}`, {
            method: 'GET',
          });
          if (!res.ok || cancelled) return;
          const data = (await res.json()) as {
            content?: { weddingData?: Partial<WeddingInvitation> };
            photos?: Array<{ id?: string; assetId?: string; signedUrl?: string }>;
          };
          const weddingData = data?.content?.weddingData;
          const uploadedUrls: string[] = [];
          for (const p of data?.photos || []) {
            if (p.signedUrl) {
              uploadedUrls.push(p.signedUrl);
              const aid = p.id || p.assetId;
              if (aid) {
                uploadedAssetsRef.current[p.signedUrl] = aid;
              }
            }
          }
          if (!cancelled && weddingData && weddingData.brideName && weddingData.groomName) {
            const cleanSavedGallery = Array.isArray(weddingData.gallery)
              ? weddingData.gallery.filter((u): u is string => typeof u === 'string' && !u.startsWith('blob:'))
              : [];
            const mergedGallery =
              uploadedUrls.length > 0
                ? uploadedUrls
                : cleanSavedGallery.length > 0
                  ? cleanSavedGallery
                  : defaultGallery;
            const merged = mergeWithDefaults(weddingData, mergedGallery);
            setForm(merged);
            setMaxGuestsInput(String(merged.rsvp.maxGuests ?? 4));
            setDraftSavedAt('Loaded checkout draft');
          }
        } catch {
          // Local storage draft remains active
        }
      })();
    }

    return () => {
      cancelled = true;
    };
  }, [draftStorageKey, initialDraftToken, edition.defaultData]);

  // Purposeful Profile Integration: auto-prefill WhatsApp RSVP number from signed-in Profile
  useEffect(() => {
    if (!profile?.phone || profileApplied) return;
    const cleanPhone = profile.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length >= 10) {
      setForm((prev) => {
        if (
          prev.rsvp.whatsappNumber === edition.defaultData.rsvp.whatsappNumber ||
          !prev.rsvp.whatsappNumber
        ) {
          return {
            ...prev,
            rsvp: {
              ...prev.rsvp,
              whatsappNumber: cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`,
            },
          };
        }
        return prev;
      });
      setProfileApplied(true);
    }
  }, [profile, profileApplied, edition.defaultData.rsvp.whatsappNumber]);

  // Auto-save draft locally on every edit (strip ephemeral blob: preview URLs)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const persistable: WeddingInvitation = {
          ...form,
          gallery: form.gallery.filter((url) => !url.startsWith('blob:')),
        };
        window.localStorage.setItem(draftStorageKey, JSON.stringify(persistable));
        setDraftSavedAt('Saved on device');
      } catch {
        // Ignore quota issues
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [form, draftStorageKey]);

  const parsedGuests = useMemo(() => {
    return guestListText
      .split(/\r?\n|,/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 100);
  }, [guestListText]);

  const activeSlug = useMemo(() => {
    const clean = slugify(form.slug || `${form.brideName}-${form.groomName}`);
    return clean.length >= 3 ? clean : edition.demoSlug;
  }, [form.slug, form.brideName, form.groomName, edition.demoSlug]);

  function updateField<K extends keyof WeddingInvitation>(key: K, value: WeddingInvitation[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateEvent(index: number, patch: Partial<WeddingEventItem>) {
    setForm((prev) => {
      const next = [...prev.events];
      next[index] = { ...next[index], ...patch };
      return { ...prev, events: next };
    });
  }

  function addEvent() {
    if (form.events.length >= 8) return;
    const newItem: WeddingEventItem = {
      id: `event-${Date.now().toString(36)}`,
      title: 'Evening Celebration',
      dateTime: form.weddingDate,
      venueName: form.events[0]?.venueName || 'Grand Banquet Lawn',
      address: form.events[0]?.address || 'City Palace Road, Jaipur',
      mapUrl: form.events[0]?.mapUrl || '',
      dressCode: 'Festive Indian',
      iconKey: 'sangeet',
    };
    setForm((prev) => ({ ...prev, events: [...prev.events, newItem] }));
  }

  function removeEvent(index: number) {
    if (form.events.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index),
    }));
  }

  function updateMilestone(index: number, patch: Partial<WeddingStoryMilestone>) {
    setForm((prev) => {
      const list = [...(prev.storyMilestones ?? edition.defaultData.storyMilestones ?? [])];
      list[index] = { ...list[index], ...patch };
      return { ...prev, storyMilestones: list };
    });
  }

  function addMilestone() {
    setForm((prev) => {
      const list = [...(prev.storyMilestones ?? edition.defaultData.storyMilestones ?? [])];
      if (list.length >= 6) return prev;
      list.push({
        year: '2026',
        title: 'New Chapter',
        caption: 'Sacred Roka & Blessings',
      });
      return { ...prev, storyMilestones: list };
    });
  }

  function removeMilestone(index: number) {
    setForm((prev) => {
      const list = [...(prev.storyMilestones ?? edition.defaultData.storyMilestones ?? [])];
      if (list.length <= 1) return prev;
      return { ...prev, storyMilestones: list.filter((_, i) => i !== index) };
    });
  }

  function updateVenueHighlight(patch: Partial<WeddingVenueHighlight>) {
    setForm((prev) => {
      const current: WeddingVenueHighlight = prev.venueHighlight ??
        edition.defaultData.venueHighlight ?? {
          name: prev.events[0]?.venueName || 'Royal Heritage Palace',
          city: prev.events[0]?.address || 'Udaipur, Rajasthan',
          tagline: 'Main Wedding Venue',
          mapUrl: prev.events[0]?.mapUrl || 'https://maps.google.com',
          distanceNote: '25 mins from Airport · 15 mins from Station',
        };
      return {
        ...prev,
        venueHighlight: { ...current, ...patch },
      };
    });
  }

  function updateHospitalityNote(index: number, patch: Partial<WeddingHospitalityNote>) {
    setForm((prev) => {
      const list = [...(prev.hospitalityNotes ?? edition.defaultData.hospitalityNotes ?? [])];
      list[index] = { ...list[index], ...patch };
      return { ...prev, hospitalityNotes: list };
    });
  }

  function addHospitalityNote() {
    setForm((prev) => {
      const list = [...(prev.hospitalityNotes ?? edition.defaultData.hospitalityNotes ?? [])];
      if (list.length >= 6) return prev;
      list.push({
        title: 'Guest Help Desk',
        detail: 'Check-in & Airport Pickup',
      });
      return { ...prev, hospitalityNotes: list };
    });
  }

  function removeHospitalityNote(index: number) {
    setForm((prev) => {
      const list = [...(prev.hospitalityNotes ?? edition.defaultData.hospitalityNotes ?? [])];
      if (list.length <= 1) return prev;
      return { ...prev, hospitalityNotes: list.filter((_, i) => i !== index) };
    });
  }

  function handleAddPhoto() {
    const url = newPhotoUrl.trim();
    if (!url || !/^https?:\/\//i.test(url) || form.gallery.length >= 6) return;
    updateField('gallery', [...form.gallery, url]);
    setNewPhotoUrl('');
  }

  function buildDraftRequestPayload() {
    const brideLabel = form.brideName.trim() || edition.defaultData.brideName;
    const groomLabel = form.groomName.trim() || edition.defaultData.groomName;
    const persistableGallery = form.gallery.filter((url) => !url.startsWith('blob:'));
    return {
      themeId: edition.id,
      language: form.language,
      content: {
        receiverName: `${brideLabel} & ${groomLabel}`.slice(0, 40),
        senderName: (form.brideParents?.trim() || brideLabel).slice(0, 40),
        message: (form.personalMessage || edition.defaultData.personalMessage).trim().slice(0, 300),
        weddingData: { ...form, gallery: persistableGallery, slug: activeSlug },
      },
    };
  }

  async function ensureServerDraft(): Promise<{
    token?: string;
    supabaseUnconfigured?: boolean;
    error?: string;
  }> {
    const draftPayload = buildDraftRequestPayload();

    if (serverDraftToken && /^[A-Za-z0-9_-]{24,128}$/.test(serverDraftToken)) {
      const patchRes = await fetch(`/api/drafts/${encodeURIComponent(serverDraftToken)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: draftPayload.language,
          content: draftPayload.content,
        }),
      });
      if (patchRes.ok) {
        return { token: serverDraftToken };
      }
      if (patchRes.status !== 404) {
        const patchErr = (await patchRes.json().catch(() => ({}))) as {
          code?: string;
          error?: string;
        };
        if (patchRes.status === 503 || patchErr.code === 'SUPABASE_NOT_CONFIGURED') {
          return { supabaseUnconfigured: true, error: patchErr.error };
        }
        return {
          error: patchErr.error || 'Could not update your draft right now. Please check your details and retry.',
        };
      }
    }

    const res = await fetch('/api/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftPayload),
    });

    const data = (await res.json().catch(() => ({}))) as {
      draftToken?: string;
      code?: string;
      error?: string;
    };

    if (res.status === 201 && data.draftToken) {
      setServerDraftToken(data.draftToken);
      return { token: data.draftToken };
    }

    if (res.status === 503 || data.code === 'SUPABASE_NOT_CONFIGURED') {
      return { supabaseUnconfigured: true, error: data.error };
    }

    return { error: data.error || 'Could not save your draft right now. Please retry.' };
  }

  function handleRemovePhoto(index: number) {
    const targetUrl = form.gallery[index];
    if (!targetUrl) return;

    if (targetUrl.startsWith('blob:')) {
      URL.revokeObjectURL(targetUrl);
      blobUrlsRef.current.delete(targetUrl);
    }

    const assetId = uploadedAssetsRef.current[targetUrl];
    if (assetId) {
      delete uploadedAssetsRef.current[targetUrl];
      if (serverDraftToken) {
        void fetch(
          `/api/uploads?assetId=${encodeURIComponent(assetId)}&draftToken=${encodeURIComponent(serverDraftToken)}`,
          { method: 'DELETE' },
        ).catch(() => {});
      }
    }

    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  }

  function handleClearGallery() {
    for (const url of form.gallery) {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
        blobUrlsRef.current.delete(url);
      }
      const assetId = uploadedAssetsRef.current[url];
      if (assetId) {
        delete uploadedAssetsRef.current[url];
        if (serverDraftToken) {
          void fetch(
            `/api/uploads?assetId=${encodeURIComponent(assetId)}&draftToken=${encodeURIComponent(serverDraftToken)}`,
            { method: 'DELETE' },
          ).catch(() => {});
        }
      }
    }
    setUploadStatusText('');
    setForm((prev) => ({ ...prev, gallery: [] }));
  }

  async function handlePhotoFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const slotsLeft = 6 - form.gallery.length;
    if (slotsLeft <= 0) return;

    const queue = Array.from(files).slice(0, slotsLeft);
    setUploadingPhotos(true);
    setUploadStatusText('');
    setCheckoutError('');

    try {
      const draftRes = await ensureServerDraft();
      const addedUrls: string[] = [];

      for (let i = 0; i < queue.length; i++) {
        setUploadStatusText(`Preparing photo ${i + 1} of ${queue.length}...`);
        const compressed = await compressImageForMobileUpload(queue[i]);

        if (!draftRes.token || draftRes.supabaseUnconfigured) {
          const blobUrl = URL.createObjectURL(compressed);
          blobUrlsRef.current.add(blobUrl);
          addedUrls.push(blobUrl);
          continue;
        }

        setUploadStatusText(`Uploading photo ${i + 1} of ${queue.length}...`);
        const fd = new FormData();
        fd.append('file', compressed);
        fd.append('draftToken', draftRes.token);

        const uploadRes = await fetch('/api/uploads', { method: 'POST', body: fd });
        const uploadData = (await uploadRes.json().catch(() => ({}))) as {
          assetId?: string;
          signedUrl?: string;
          error?: string;
        };

        if (uploadRes.ok && uploadData.signedUrl) {
          if (uploadData.assetId) {
            uploadedAssetsRef.current[uploadData.signedUrl] = uploadData.assetId;
          }
          addedUrls.push(uploadData.signedUrl);
        } else {
          const blobUrl = URL.createObjectURL(compressed);
          blobUrlsRef.current.add(blobUrl);
          addedUrls.push(blobUrl);
        }
      }

      if (addedUrls.length > 0) {
        setForm((prev) => ({
          ...prev,
          gallery: [...prev.gallery, ...addedUrls].slice(0, 6),
        }));
        setUploadStatusText(`Added ${addedUrls.length} photo${addedUrls.length > 1 ? 's' : ''}.`);
      }
    } catch {
      setUploadStatusText('Could not upload photo. Please try a JPG or PNG under 5MB.');
    } finally {
      setUploadingPhotos(false);
    }
  }

  async function handleOpenShareablePreview() {
    setCheckoutError('');
    setLocalFallbackNotice('');
    setOpeningPreview(true);
    saveLocalBackup();

    try {
      const draftRes = await ensureServerDraft();
      if (draftRes.token) {
        router.push(`/preview/${encodeURIComponent(draftRes.token)}`);
        return;
      }
      if (draftRes.supabaseUnconfigured) {
        setPublishedSlug(activeSlug);
        setLocalFallbackNotice(
          'Local preview ready! Open your live invitation below or connect Supabase keys to generate cloud preview links.',
        );
        return;
      }
      setCheckoutError(draftRes.error || 'Could not create preview link. Please retry.');
    } catch {
      setCheckoutError('Network error creating preview link. Your edits are saved on this device.');
    } finally {
      setOpeningPreview(false);
    }
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const names = text
        .split(/\r?\n/)
        .map((row) => row.split(',')[0]?.replace(/^"|"$/g, '').trim() || '')
        .filter((name) => name && name.toLowerCase() !== 'name' && name.toLowerCase() !== 'guest');
      if (names.length > 0) {
        setGuestListText(names.join('\n'));
      }
    };
    reader.readAsText(file);
  }

  function saveLocalBackup(): WeddingInvitation {
    const finalPayload: WeddingInvitation = {
      ...form,
      gallery: form.gallery.filter((url) => !url.startsWith('blob:')),
      slug: activeSlug,
      publishedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(
        `webzy_wedding_published_${activeSlug}`,
        JSON.stringify(finalPayload),
      );
      window.localStorage.setItem(draftStorageKey, JSON.stringify(finalPayload));
      const rawCart = window.localStorage.getItem('webzy_draft_cart');
      const existing = rawCart ? (JSON.parse(rawCart) as Array<{ slug: string }>) : [];
      if (!existing.some((item) => item.slug === activeSlug)) {
        existing.push({ slug: activeSlug });
        window.localStorage.setItem('webzy_draft_cart', JSON.stringify(existing));
      }
      window.dispatchEvent(new Event('webzy_orders_updated'));
    } catch {
      // Graceful fallback
    }
    return finalPayload;
  }

  async function handleContinueToPayment() {
    setCheckoutError('');
    setLocalFallbackNotice('');
    setSubmittingCheckout(true);

    saveLocalBackup();

    try {
      const draftRes = await ensureServerDraft();

      if (draftRes.token) {
        router.push(`/checkout?draft=${encodeURIComponent(draftRes.token)}`);
        return;
      }

      if (draftRes.supabaseUnconfigured) {
        setPublishedSlug(activeSlug);
        setLocalFallbackNotice(
          draftRes.error ||
            'Online checkout activates once Supabase keys are configured in .env.local. Your wedding invitation has been saved locally in preview mode so you can open and test all family links right now.',
        );
        setSubmittingCheckout(false);
        return;
      }

      setCheckoutError(
        draftRes.error || 'Could not save your draft for checkout right now. Please retry.',
      );
      setSubmittingCheckout(false);
    } catch {
      setCheckoutError(
        'Network error while connecting to checkout. Your edits are saved locally — please retry.',
      );
      setSubmittingCheckout(false);
    }
  }

  function copyLink(text: string, key: string) {
    void navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  }

  const savings = edition.compareAtInr - edition.priceInr;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      {/* Top Studio Header Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-5">
        <div>
          <Link
            href={`/weddings/${edition.id}`}
            className="text-xs font-bold text-[#8C6D23] hover:underline"
          >
            ← Back to {edition.editorialName} Preview
          </Link>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-webzy-ink sm:text-3xl">
            Customize {edition.editorialName}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {draftSavedAt ? (
            <span className="font-medium text-stone-500">
              {draftSavedAt}
            </span>
          ) : null}

          {isAuthenticated ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-bold text-emerald-800">
              Signed in as {profile?.full_name || user?.email}
            </span>
          ) : (
            <button
              type="button"
              onClick={() =>
                openAuthModal({
                  reason: 'Sign in to auto-fill your saved phone number and sync drafts to your account.',
                })
              }
              className="rounded-full border border-stone-200 bg-white px-3.5 py-1 font-bold text-stone-700 hover:border-[#C9A243]"
            >
              Sign in (optional while editing)
            </button>
          )}
        </div>
      </div>

      {/* Stepper Navigation */}
      <nav aria-label="Customization steps" className="mb-8 flex flex-wrap gap-2">
        {STEPS.map((s) => {
          const active = step === s.id;
          const completed = step > s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={`min-h-[40px] rounded-full px-4 text-xs font-bold transition ${
                active
                  ? 'text-white shadow-sm'
                  : completed
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border border-stone-200 bg-white text-stone-600 hover:border-[#C9A243]'
              }`}
              style={active ? { backgroundColor: edition.palette.primary } : undefined}
            >
              {s.id}. {s.label}
            </button>
          );
        })}
      </nav>

      {/* Main Split Grid: Stepper Form (Left) + Live Sticky PhoneFrame (Right) */}
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        {/* LEFT: ACTIVE STEP EDITOR */}
        <div className="rounded-[28px] border border-stone-200/90 bg-white p-6 shadow-sm lg:col-span-7 sm:p-8">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-xl font-bold text-webzy-ink">
                  Couple &amp; Family Blessings
                </h2>
                <p className="mt-1 text-xs font-medium text-[#8C6D23]">
                  Short words work best — no long paragraphs needed
                </p>
              </div>

              {/* Language Selector */}
              <div>
                <label htmlFor="wedding-lang-select" className="block text-xs font-bold text-webzy-ink mb-1.5">
                  Invitation Script &amp; Language
                </label>
                <select
                  id="wedding-lang-select"
                  value={form.language}
                  onChange={(e) => updateField('language', e.target.value as WeddingLanguage)}
                  className="min-h-[46px] w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm font-semibold text-webzy-ink outline-none focus:border-[#C9A243]"
                >
                  {WEDDING_LANGUAGE_OPTIONS.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.nativeLabel} ({item.englishLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bride-name" className="block text-xs font-bold text-webzy-ink mb-1">
                    Bride&apos;s Name
                  </label>
                  <input
                    id="bride-name"
                    type="text"
                    maxLength={50}
                    placeholder="Aanya"
                    value={form.brideName}
                    onChange={(e) => updateField('brideName', e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-stone-200 px-3.5 text-sm text-webzy-ink outline-none focus:border-[#C9A243]"
                  />
                </div>
                <div>
                  <label htmlFor="groom-name" className="block text-xs font-bold text-webzy-ink mb-1">
                    Groom&apos;s Name
                  </label>
                  <input
                    id="groom-name"
                    type="text"
                    maxLength={50}
                    placeholder="Kabir"
                    value={form.groomName}
                    onChange={(e) => updateField('groomName', e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-stone-200 px-3.5 text-sm text-webzy-ink outline-none focus:border-[#C9A243]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bride-parents" className="block text-xs font-bold text-webzy-ink mb-1">
                    Bride&apos;s Parents
                  </label>
                  <input
                    id="bride-parents"
                    type="text"
                    maxLength={120}
                    placeholder="Smt. & Shri Verma"
                    value={form.brideParents || ''}
                    onChange={(e) => updateField('brideParents', e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-stone-200 px-3.5 text-sm text-webzy-ink outline-none focus:border-[#C9A243]"
                  />
                </div>
                <div>
                  <label htmlFor="groom-parents" className="block text-xs font-bold text-webzy-ink mb-1">
                    Groom&apos;s Parents
                  </label>
                  <input
                    id="groom-parents"
                    type="text"
                    maxLength={120}
                    placeholder="Smt. & Shri Mehta"
                    value={form.groomParents || ''}
                    onChange={(e) => updateField('groomParents', e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-stone-200 px-3.5 text-sm text-webzy-ink outline-none focus:border-[#C9A243]"
                  />
                </div>
              </div>

              {/* 1-Click Traditional Blessing Presets */}
              <div className="rounded-2xl border border-[#C9A243]/35 bg-[#FAF6EE]/70 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D23]">
                    1-Click Traditional Blessing Preset
                  </span>
                  <span className="text-[11px] font-medium text-stone-500">
                    Short words work best — no long paragraphs needed
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {TRADITIONAL_BLESSING_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateField('familyBlessingLine', preset)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        form.familyBlessingLine === preset
                          ? 'border-[#C9A243] bg-[#1A1317] text-[#F5E0A3]'
                          : 'border-[#C9A243]/40 bg-white text-stone-700 hover:border-[#8C6D23]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="blessing-line" className="block text-xs font-bold text-webzy-ink mb-1">
                    Auspicious Header Line
                  </label>
                  <input
                    id="blessing-line"
                    type="text"
                    maxLength={120}
                    placeholder="|| Shri Ganeshay Namah ||"
                    value={form.familyBlessingLine || ''}
                    onChange={(e) => updateField('familyBlessingLine', e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-stone-200 px-3.5 text-sm text-webzy-ink outline-none focus:border-[#C9A243]"
                  />
                </div>
                <div>
                  <label htmlFor="wedding-date" className="block text-xs font-bold text-webzy-ink mb-1">
                    {edition.tradition === 'christian'
                      ? 'Main Wedding Date & Ceremony Time'
                      : 'Main Wedding Date & Muhurat'}
                  </label>
                  <input
                    id="wedding-date"
                    type="datetime-local"
                    value={form.weddingDate.slice(0, 16)}
                    onChange={(e) => {
                      if (e.target.value) {
                        updateField('weddingDate', `${e.target.value}:00+05:30`);
                      }
                    }}
                    className="min-h-[44px] w-full rounded-xl border border-stone-200 px-3.5 text-sm text-webzy-ink outline-none focus:border-[#C9A243]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="wedding-hashtag" className="block text-xs font-bold text-webzy-ink mb-1">
                    Wedding Hashtag
                  </label>
                  <input
                    id="wedding-hashtag"
                    type="text"
                    maxLength={40}
                    placeholder="#AanyaKiKabir"
                    value={form.hashtag || ''}
                    onChange={(e) => updateField('hashtag', e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-stone-200 px-3.5 text-sm text-webzy-ink outline-none focus:border-[#C9A243]"
                  />
                </div>
                <div>
                  <label htmlFor="wedding-slug" className="block text-xs font-bold text-webzy-ink mb-1">
                    Custom Invitation URL Slug
                  </label>
                  <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 px-3 focus-within:border-[#C9A243] focus-within:bg-white">
                    <span className="text-xs font-mono text-stone-400">/i/</span>
                    <input
                      id="wedding-slug"
                      type="text"
                      maxLength={50}
                      value={form.slug}
                      onChange={(e) => updateField('slug', slugify(e.target.value))}
                      className="min-h-[44px] w-full bg-transparent pl-1 text-sm font-mono text-webzy-ink outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label htmlFor="personal-message" className="block text-xs font-bold text-webzy-ink">
                    Short Invitation Line
                  </label>
                  <span className="text-[11px] font-medium text-stone-500">
                    2–5 words recommended
                  </span>
                </div>
                <input
                  id="personal-message"
                  type="text"
                  maxLength={240}
                  placeholder="With Elder Blessings · Join Us"
                  value={form.personalMessage}
                  onChange={(e) => updateField('personalMessage', e.target.value)}
                  className="min-h-[44px] w-full rounded-xl border border-stone-200 px-3.5 text-sm text-webzy-ink outline-none focus:border-[#C9A243]"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-xl font-bold text-webzy-ink">
                    Ceremonies &amp; Venue Directions
                  </h2>
                  <p className="mt-1 text-xs text-stone-500">
                    Each ceremony becomes a clickable tab card with dress swatches.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addEvent}
                  disabled={form.events.length >= 8}
                  className="btn-spring rounded-full border border-[#C9A243] bg-amber-50/70 px-4 py-2 text-xs font-bold text-[#7A5B14] disabled:opacity-40"
                >
                  + Add Ceremony
                </button>
              </div>

              <div className="space-y-4">
                {form.events.map((ev, idx) => (
                  <div
                    key={ev.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8C6D23]">
                        Ceremony {idx + 1}
                      </span>
                      {form.events.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeEvent(idx)}
                          className="text-xs font-bold text-rose-700 hover:underline"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        value={ev.title}
                        onChange={(e) => updateEvent(idx, { title: e.target.value })}
                        placeholder="Haldi Ceremony"
                        className="min-h-[42px] rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-webzy-ink outline-none focus:border-[#C9A243]"
                      />
                      <select
                        value={ev.iconKey}
                        onChange={(e) =>
                          updateEvent(idx, { iconKey: e.target.value as WeddingIconKey })
                        }
                        className="min-h-[42px] rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-webzy-ink outline-none focus:border-[#C9A243]"
                      >
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            Icon: {opt.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="datetime-local"
                        value={ev.dateTime.slice(0, 16)}
                        onChange={(e) => {
                          if (e.target.value) {
                            updateEvent(idx, { dateTime: `${e.target.value}:00+05:30` });
                          }
                        }}
                        className="min-h-[42px] rounded-xl border border-stone-200 bg-white px-3 text-xs text-webzy-ink outline-none focus:border-[#C9A243]"
                      />
                      <input
                        type="text"
                        value={ev.dressCode || ''}
                        onChange={(e) => updateEvent(idx, { dressCode: e.target.value })}
                        placeholder="Sunshine Yellow"
                        className="min-h-[42px] rounded-xl border border-stone-200 bg-white px-3 text-xs text-webzy-ink outline-none focus:border-[#C9A243]"
                      />
                      <input
                        type="text"
                        value={ev.venueName}
                        onChange={(e) => updateEvent(idx, { venueName: e.target.value })}
                        placeholder="Zanana Mahal Courtyard"
                        className="min-h-[42px] rounded-xl border border-stone-200 bg-white px-3 text-xs text-webzy-ink outline-none focus:border-[#C9A243]"
                      />
                      <input
                        type="text"
                        value={ev.address}
                        onChange={(e) => updateEvent(idx, { address: e.target.value })}
                        placeholder="City Palace, Udaipur"
                        className="min-h-[42px] rounded-xl border border-stone-200 bg-white px-3 text-xs text-webzy-ink outline-none focus:border-[#C9A243]"
                      />
                      <input
                        type="url"
                        value={ev.mapUrl || ''}
                        onChange={(e) => updateEvent(idx, { mapUrl: e.target.value })}
                        placeholder="https://maps.google.com/..."
                        className="min-h-[42px] sm:col-span-2 rounded-xl border border-stone-200 bg-white px-3 text-xs text-webzy-ink outline-none focus:border-[#C9A243]"
                      />
                    </div>

                    {/* Dress Code Swatch Presets & Custom Palette */}
                    <div className="pt-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-stone-600">
                          Dress Code Colour Swatches:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {DRESS_PALETTE_PRESETS.map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => updateEvent(idx, { eventDressPalette: preset.colors })}
                              className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-700 hover:border-[#C9A243]"
                            >
                              <span className="flex items-center -space-x-1">
                                {preset.colors.map((hex) => (
                                  <span
                                    key={hex}
                                    className="inline-block h-2.5 w-2.5 rounded-full border border-white"
                                    style={{ backgroundColor: hex }}
                                  />
                                ))}
                              </span>
                              <span>{preset.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        {(ev.eventDressPalette && ev.eventDressPalette.length > 0
                          ? ev.eventDressPalette
                          : ['#C9A243', '#2D4F35', '#FAF0CA']
                        ).map((hexColor, swatchIdx, arr) => (
                          <label
                            key={swatchIdx}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-mono text-stone-700"
                          >
                            <input
                              type="color"
                              aria-label={`Ceremony ${idx + 1} swatch ${swatchIdx + 1}`}
                              value={/^#[0-9A-Fa-f]{6}$/.test(hexColor) ? hexColor : '#C9A243'}
                              onChange={(e) => {
                                const nextPalette = [...arr];
                                nextPalette[swatchIdx] = e.target.value;
                                updateEvent(idx, { eventDressPalette: nextPalette });
                              }}
                              className="h-4 w-4 cursor-pointer rounded border-0 bg-transparent p-0"
                            />
                            <span>{hexColor}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-xl font-bold text-webzy-ink">
                  Blessings, Story &amp; Gallery
                </h2>
                <p className="mt-1 text-xs font-semibold text-[#8C6D23]">
                  Short words work best — no long paragraphs needed
                </p>
              </div>

              {/* 1-Click Traditional Blessing Preset Selector */}
              <div className="rounded-2xl border border-[#C9A243]/40 bg-[#FAF6EE]/80 p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8C6D23]">
                    1-Click Traditional Blessing Preset
                  </span>
                  <span className="text-[11px] font-medium text-stone-600">
                    Short words work best — no long paragraphs needed
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRADITIONAL_BLESSING_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateField('familyBlessingLine', preset)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                        form.familyBlessingLine === preset
                          ? 'border-[#C9A243] bg-[#1A1317] text-[#F5E0A3] shadow-sm'
                          : 'border-[#C9A243]/40 bg-white text-stone-700 hover:border-[#8C6D23]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  maxLength={120}
                  value={form.familyBlessingLine || ''}
                  onChange={(e) => updateField('familyBlessingLine', e.target.value)}
                  placeholder="|| Shri Ganeshay Namah ||"
                  aria-label="Traditional blessing line"
                  className="min-h-[42px] w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-webzy-ink outline-none focus:border-[#C9A243]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="story-title" className="block text-xs font-bold text-webzy-ink mb-1">
                    Story Heading (2–4 Words)
                  </label>
                  <input
                    id="story-title"
                    type="text"
                    placeholder="Our Sacred Journey"
                    value={form.storyTitle || ''}
                    onChange={(e) => updateField('storyTitle', e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-stone-200 px-3.5 text-sm text-webzy-ink outline-none focus:border-[#C9A243]"
                  />
                </div>

                <div>
                  <label htmlFor="story-text" className="block text-xs font-bold text-webzy-ink mb-1">
                    Short Story Tagline (2–5 Words)
                  </label>
                  <input
                    id="story-text"
                    type="text"
                    placeholder="Two Hearts · One Journey"
                    value={form.storyText || ''}
                    onChange={(e) => updateField('storyText', e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-stone-200 px-3.5 text-sm text-webzy-ink outline-none focus:border-[#C9A243]"
                  />
                </div>
              </div>

              {/* 1-Click Short Story Tagline Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-stone-500">Quick Taglines:</span>
                {SHORT_STORY_NOTE_PRESETS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => updateField('storyText', tag)}
                    className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:border-[#C9A243]"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Editable Journey Milestones */}
              <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C6D23]">
                      Click-Card Journey Milestones
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Short words work best — no long paragraphs needed
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addMilestone}
                    disabled={(form.storyMilestones?.length ?? 0) >= 6}
                    className="rounded-full border border-[#C9A243] bg-white px-3 py-1 text-[11px] font-bold text-[#7A5B14] disabled:opacity-40"
                  >
                    + Add Milestone
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(form.storyMilestones ?? edition.defaultData.storyMilestones ?? []).map(
                    (ms, msIdx) => (
                      <div
                        key={msIdx}
                        className="rounded-xl border border-stone-200 bg-white p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-stone-500">
                            Card {msIdx + 1}
                          </span>
                          {(form.storyMilestones?.length ?? 0) > 1 ? (
                            <button
                              type="button"
                              onClick={() => removeMilestone(msIdx)}
                              className="text-[11px] font-bold text-rose-700 hover:underline"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <input
                            type="text"
                            value={ms.year}
                            onChange={(e) => updateMilestone(msIdx, { year: e.target.value })}
                            placeholder="2024"
                            className="min-h-[38px] rounded-lg border border-stone-200 px-2.5 text-xs font-semibold text-webzy-ink outline-none focus:border-[#C9A243]"
                          />
                          <input
                            type="text"
                            value={ms.title}
                            onChange={(e) => updateMilestone(msIdx, { title: e.target.value })}
                            placeholder="First Coffee"
                            className="min-h-[38px] sm:col-span-2 rounded-lg border border-stone-200 px-2.5 text-xs font-semibold text-webzy-ink outline-none focus:border-[#C9A243]"
                          />
                        </div>
                        <input
                          type="text"
                          value={ms.caption}
                          onChange={(e) => updateMilestone(msIdx, { caption: e.target.value })}
                          placeholder="Short 2–5 word memory tag"
                          className="min-h-[38px] w-full rounded-lg border border-stone-200 px-2.5 text-xs text-webzy-ink outline-none focus:border-[#C9A243]"
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Venue & Travel Highlight + Hospitality Notes */}
              <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C6D23]">
                    Primary Venue &amp; Travel Chips
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Short 2–5 word tags for maps and guest hospitality tabs.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <input
                    type="text"
                    value={form.venueHighlight?.name ?? edition.defaultData.venueHighlight?.name ?? ''}
                    onChange={(e) => updateVenueHighlight({ name: e.target.value })}
                    placeholder="Taj Lake Palace"
                    className="min-h-[40px] rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-webzy-ink outline-none focus:border-[#C9A243]"
                  />
                  <input
                    type="text"
                    value={form.venueHighlight?.city ?? edition.defaultData.venueHighlight?.city ?? ''}
                    onChange={(e) => updateVenueHighlight({ city: e.target.value })}
                    placeholder="Udaipur, Rajasthan"
                    className="min-h-[40px] rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-webzy-ink outline-none focus:border-[#C9A243]"
                  />
                  <input
                    type="text"
                    value={form.venueHighlight?.tagline ?? edition.defaultData.venueHighlight?.tagline ?? ''}
                    onChange={(e) => updateVenueHighlight({ tagline: e.target.value })}
                    placeholder="Heritage Courtyard Venue"
                    className="min-h-[40px] rounded-xl border border-stone-200 bg-white px-3 text-xs text-webzy-ink outline-none focus:border-[#C9A243]"
                  />
                  <input
                    type="text"
                    value={
                      form.venueHighlight?.distanceNote ??
                      edition.defaultData.venueHighlight?.distanceNote ??
                      ''
                    }
                    onChange={(e) => updateVenueHighlight({ distanceNote: e.target.value })}
                    placeholder="30 Mins Airport · 15 Mins Station"
                    className="min-h-[40px] rounded-xl border border-stone-200 bg-white px-3 text-xs text-webzy-ink outline-none focus:border-[#C9A243]"
                  />
                </div>

                <div className="pt-2 border-t border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-stone-700">
                      Click-Tab Hospitality Notes
                    </span>
                    <button
                      type="button"
                      onClick={addHospitalityNote}
                      disabled={(form.hospitalityNotes?.length ?? 0) >= 6}
                      className="rounded-full border border-[#C9A243] bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#7A5B14] disabled:opacity-40"
                    >
                      + Add Note
                    </button>
                  </div>
                  {(form.hospitalityNotes ?? edition.defaultData.hospitalityNotes ?? []).map(
                    (note, nIdx) => (
                      <div
                        key={nIdx}
                        className="rounded-xl border border-stone-200 bg-white p-2.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={note.title}
                            onChange={(e) => updateHospitalityNote(nIdx, { title: e.target.value })}
                            placeholder="Airport Transfers"
                            className="min-h-[34px] flex-1 rounded-lg border border-stone-200 px-2.5 text-xs font-semibold text-webzy-ink outline-none focus:border-[#C9A243]"
                          />
                          {(form.hospitalityNotes?.length ?? 0) > 1 ? (
                            <button
                              type="button"
                              onClick={() => removeHospitalityNote(nIdx)}
                              className="text-[10px] font-bold text-rose-700 hover:underline"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                        <input
                          type="text"
                          value={note.detail}
                          onChange={(e) => updateHospitalityNote(nIdx, { detail: e.target.value })}
                          placeholder="Pickup from Gate 2"
                          className="min-h-[34px] w-full rounded-lg border border-stone-200 px-2.5 text-xs text-webzy-ink outline-none focus:border-[#C9A243]"
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-webzy-ink">
                    Photo Gallery ({form.gallery.length}/6 photos)
                  </label>
                  {form.gallery.length > 0 ? (
                    <button
                      type="button"
                      onClick={handleClearGallery}
                      className="text-[11px] font-semibold text-stone-500 transition hover:text-rose-700"
                    >
                      Clear all
                    </button>
                  ) : null}
                </div>

                <label className="mb-2.5 flex min-h-[46px] cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#C9A243] bg-[#FAF6EE] px-4 text-xs font-bold text-[#6E5114] transition hover:bg-[#F5EEDB]">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={uploadingPhotos || form.gallery.length >= 6}
                    onChange={(e) => {
                      void handlePhotoFiles(e.target.files);
                      e.target.value = '';
                    }}
                    className="sr-only"
                  />
                  <span>
                    {uploadingPhotos
                      ? uploadStatusText || 'Uploading photos...'
                      : form.gallery.length >= 6
                        ? 'All 6 photos added'
                        : '+ Upload Photos from Phone or Laptop'}
                  </span>
                </label>

                {uploadStatusText && !uploadingPhotos ? (
                  <p className="mb-2 text-xs font-medium text-emerald-700">{uploadStatusText}</p>
                ) : null}

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Or paste image link (https://...)"
                    className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-stone-200 px-3.5 text-base sm:text-xs text-webzy-ink outline-none focus:border-[#C9A243]"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    disabled={form.gallery.length >= 6}
                    className="min-h-[44px] shrink-0 rounded-xl bg-stone-900 px-4 text-xs font-bold text-white disabled:opacity-40"
                  >
                    Add Link
                  </button>
                </div>

                {form.gallery.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {form.gallery.map((url, idx) => (
                      <div
                        key={url + idx}
                        className="relative aspect-[4/5] overflow-hidden rounded-xl border border-stone-200 bg-stone-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute right-1.5 top-1.5 inline-flex min-h-[36px] items-center rounded-full bg-black/75 px-3 text-[11px] font-bold text-white"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-xl font-bold text-webzy-ink">
                  RSVP Logistics &amp; Digital Shagun
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  {profile?.phone
                    ? 'Auto-synced with the WhatsApp phone number saved in your Profile.'
                    : '1-Tap WhatsApp RSVP and optional UPI Shagun card.'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="rsvp-phone" className="block text-xs font-bold text-webzy-ink mb-1">
                    Host WhatsApp Number (with 91)
                  </label>
                  <input
                    id="rsvp-phone"
                    type="tel"
                    value={form.rsvp.whatsappNumber || ''}
                    onChange={(e) =>
                      updateField('rsvp', { ...form.rsvp, whatsappNumber: e.target.value })
                    }
                    placeholder="919876543210"
                    className="min-h-[44px] w-full rounded-xl border border-stone-200 px-3.5 text-sm text-webzy-ink outline-none focus:border-[#C9A243]"
                  />
                </div>
                <div>
                  <label htmlFor="max-guests" className="block text-xs font-bold text-webzy-ink mb-1">
                    Max Guests Per Family RSVP
                  </label>
                  <input
                    id="max-guests"
                    type="number"
                    min={1}
                    max={10}
                    value={maxGuestsInput}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setMaxGuestsInput(raw);
                      const parsed = Number(raw);
                      if (raw !== '' && Number.isFinite(parsed)) {
                        updateField('rsvp', {
                          ...form.rsvp,
                          maxGuests: Math.min(10, Math.max(1, Math.round(parsed))),
                        });
                      }
                    }}
                    onBlur={() => {
                      const parsed = Number(maxGuestsInput);
                      const clamped =
                        maxGuestsInput !== '' && Number.isFinite(parsed)
                          ? Math.min(10, Math.max(1, Math.round(parsed)))
                          : 2;
                      setMaxGuestsInput(String(clamped));
                      updateField('rsvp', { ...form.rsvp, maxGuests: clamped });
                    }}
                    className="min-h-[44px] w-full rounded-xl border border-stone-200 px-3.5 text-sm text-webzy-ink outline-none focus:border-[#C9A243]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-xs font-semibold text-webzy-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.rsvp.askMealPreference}
                  onChange={(e) =>
                    updateField('rsvp', { ...form.rsvp, askMealPreference: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#2D4F35]"
                />
                <span>Ask guests for catering meal preference (Pure Veg / Jain / Non-Veg)</span>
              </label>

              {/* Shagun Settings */}
              <div className="rounded-2xl border border-stone-200 p-4 space-y-3">
                <label className="flex items-center gap-2.5 text-xs font-bold text-webzy-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(form.shagun?.enabled)}
                    onChange={(e) =>
                      updateField('shagun', {
                        enabled: e.target.checked,
                        upiId: form.shagun?.upiId || '',
                        beneficiaryName: form.shagun?.beneficiaryName || `${form.brideName} & ${form.groomName}`,
                      })
                    }
                    className="h-4 w-4 accent-[#2D4F35]"
                  />
                  <span>
                    {edition.tradition === 'christian'
                      ? 'Enable Wedding Gift Registry / Blessing Fund (UPI VPA)'
                      : 'Enable Traditional Digital Shagun (UPI VPA)'}
                  </span>
                </label>

                {form.shagun?.enabled && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
                    <input
                      type="text"
                      value={form.shagun.upiId || ''}
                      onChange={(e) =>
                        updateField('shagun', { ...form.shagun!, upiId: e.target.value })
                      }
                      placeholder="yourname@upi"
                      className="min-h-[42px] rounded-xl border border-stone-200 px-3 text-xs text-webzy-ink outline-none focus:border-[#C9A243]"
                    />
                    <input
                      type="text"
                      value={form.shagun.beneficiaryName || ''}
                      onChange={(e) =>
                        updateField('shagun', { ...form.shagun!, beneficiaryName: e.target.value })
                      }
                      placeholder="Aanya & Kabir"
                      className="min-h-[42px] rounded-xl border border-stone-200 px-3 text-xs text-webzy-ink outline-none focus:border-[#C9A243]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-webzy-ink">
                  Guest Links &amp; Checkout
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  Review your ₹499 pass, proceed to Razorpay UPI checkout, and share family links.
                </p>
              </div>

              {/* Unified Webzy Checkout Order Summary Card */}
              <div className="card-physical space-y-4 rounded-3xl p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8C6D23]">
                        Order Summary
                      </span>
                      {savings > 0 ? (
                        <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 text-[10px] font-bold text-white">
                          Save {formatInrComma(savings)}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-1 font-heading text-xl font-bold text-webzy-ink">
                      {edition.editorialName}
                    </h3>
                    <p className="text-xs text-stone-500">{edition.collectionSubtitle}</p>
                    <p className="mt-1 break-all font-mono text-[11px] text-stone-600">
                      {origin}/i/{activeSlug}
                    </p>
                  </div>

                  <div className="shrink-0 text-right font-tabular">
                    <div className="flex items-baseline justify-end gap-1.5">
                      <span className="text-xs font-medium text-stone-400 line-through">
                        {formatInrComma(edition.compareAtInr)}
                      </span>
                      <span className="font-heading text-2xl font-extrabold text-emerald-700">
                        {formatInrComma(edition.priceInr)}
                      </span>
                    </div>
                    <span className="block text-[11px] font-medium text-stone-500">
                      GST inclusive
                    </span>
                  </div>
                </div>

                <dl className="space-y-2 border-y border-stone-100 py-3.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-stone-600">
                      {edition.editorialName} ({edition.validityDays} days live)
                    </dt>
                    <dd className="font-tabular font-bold text-webzy-ink">
                      {formatInrComma(edition.priceInr)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="shrink-0 font-semibold text-emerald-800">Next step</dt>
                    <dd className="text-right text-stone-600">
                      Optional add-ons (PIN · ₹9, Video · ₹19, Extend 14d/21d/3m · ₹9–₹19) &amp; UPI payment
                    </dd>
                  </div>
                </dl>

                {checkoutError ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-900"
                  >
                    {checkoutError}
                  </div>
                ) : null}

                {publishedSlug && localFallbackNotice ? (
                  <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                    <div>
                      <p className="text-xs font-bold text-amber-950">
                        Local Preview Published (Demo Mode)
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-amber-900/85">
                        {localFallbackNotice}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/i/${publishedSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-spring inline-flex min-h-[40px] items-center rounded-full bg-emerald-700 px-5 text-xs font-bold text-white"
                      >
                        Open Live Invitation →
                      </Link>
                      <button
                        type="button"
                        onClick={() => copyLink(`${origin}/i/${publishedSlug}`, 'main')}
                        className="min-h-[40px] rounded-full border border-emerald-300 bg-white px-4 text-xs font-bold text-emerald-900"
                      >
                        {copiedKey === 'main' ? 'Copied' : 'Copy Main Link'}
                      </button>
                      <button
                        type="button"
                        onClick={handleContinueToPayment}
                        disabled={submittingCheckout}
                        className="min-h-[40px] rounded-full border border-stone-300 bg-white px-4 text-xs font-bold text-stone-700 hover:border-stone-400 disabled:opacity-50"
                      >
                        Retry Online Checkout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={handleContinueToPayment}
                      disabled={submittingCheckout || openingPreview}
                      className="btn-spring flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submittingCheckout ? (
                        <>
                          <svg
                            className="h-4 w-4 animate-spin text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Saving draft &amp; opening checkout...</span>
                        </>
                      ) : (
                        <span>Continue to Payment ({formatInrComma(edition.priceInr)}) →</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenShareablePreview}
                      disabled={openingPreview || submittingCheckout}
                      className="btn-spring flex min-h-[44px] w-full items-center justify-center rounded-full border border-stone-300 bg-white px-5 text-xs font-bold text-webzy-ink transition hover:border-[#C9A243] hover:bg-stone-50 disabled:opacity-60"
                    >
                      {openingPreview ? 'Preparing free preview...' : 'Open Free Shareable Preview'}
                    </button>
                  </div>
                )}

                <p className="text-center text-[11px] font-medium text-stone-500">
                  Instant UPI / Razorpay · GST Tax Invoice · 24h Free Typo Edits · 90-Day Active
                  Link
                </p>
              </div>

              {/* Bulk Family Link Generator (Manual or CSV Upload) */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label htmlFor="guest-list-box" className="text-xs font-bold text-webzy-ink">
                      Personalized Guest List ({parsedGuests.length} families)
                    </label>
                    <p className="mt-0.5 text-[11px] text-stone-500">
                      One family name per line · Instant <code>?to=</code> WhatsApp links
                    </p>
                  </div>
                  <label className="cursor-pointer rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-bold text-stone-700 hover:border-[#C9A243]">
                    Upload CSV Guest List
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleCsvUpload}
                      className="sr-only"
                    />
                  </label>
                </div>

                <textarea
                  id="guest-list-box"
                  rows={3}
                  value={guestListText}
                  onChange={(e) => setGuestListText(e.target.value)}
                  placeholder="Sharma Family"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-xs text-webzy-ink outline-none focus:border-[#C9A243]"
                />

                <div className="max-h-56 space-y-2 overflow-y-auto rounded-2xl border border-stone-200 bg-stone-50/60 p-3">
                  {parsedGuests.map((guest, idx) => {
                    const url = `${origin}/i/${activeSlug}?to=${encodeURIComponent(guest)}`;
                    const waText = encodeURIComponent(
                      `Namaste ${guest}! With Family Blessings: ${form.brideName} & ${form.groomName} Wedding Invitation: ${url}`,
                    );
                    return (
                      <div
                        key={guest + idx}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200/80 bg-white px-3 py-2 text-xs"
                      >
                        <span className="font-bold text-webzy-ink">{guest}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => copyLink(url, `g-${idx}`)}
                            className="rounded-lg border border-stone-200 px-2.5 py-1 text-[11px] font-bold text-stone-700 hover:border-[#C9A243]"
                          >
                            {copiedKey === `g-${idx}` ? 'Copied' : 'Copy Link'}
                          </button>
                          <a
                            href={`https://api.whatsapp.com/send?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-[#25D366] px-2.5 py-1 text-[11px] font-bold text-white"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Step Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-stone-100 pt-5">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="min-h-[42px] rounded-full border border-stone-200 px-5 text-xs font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-40"
            >
              ← Previous
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(5, s + 1))}
                className="btn-spring min-h-[42px] rounded-full px-6 text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: edition.palette.primary }}
              >
                Next Step →
              </button>
            ) : null}
          </div>
        </div>

        {/* RIGHT: LIVE ADAPTIVE PREVIEW STAGE (First on mobile/tablet so "Preview Live" is never buried) */}
        <div className="order-first flex w-full flex-col items-center lg:order-last lg:sticky lg:top-24 lg:col-span-5">
          <AdaptivePreviewStage
            title={`${form.brideName || edition.defaultData.brideName} & ${form.groomName || edition.defaultData.groomName}`}
            caption="Click-through card updates live"
            accentColor={edition.palette.primary}
            mobileVariant="compact"
            onReplay={() => {
              setPreviewMode('gate');
              setPreviewKey((k) => k + 1);
            }}
            toolbar={
              <div className="inline-flex rounded-full border border-stone-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewMode('gate');
                    setPreviewKey((k) => k + 1);
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    previewMode === 'gate'
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Opening Cover
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewMode('inside');
                    setPreviewKey((k) => k + 1);
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    previewMode === 'inside'
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Click-Card Deck
                </button>
              </div>
            }
            fullscreenChildren={
              <WeddingScroll
                key={`fs-${previewMode}-${previewKey}`}
                data={form}
                guestName={parsedGuests[0] || edition.sampleGuest}
                initialOpen={previewMode === 'inside'}
              />
            }
          >
            <WeddingScroll
              key={`${previewMode}-${previewKey}`}
              data={form}
              guestName={parsedGuests[0] || edition.sampleGuest}
              embedded
              initialOpen={previewMode === 'inside'}
            />
          </AdaptivePreviewStage>
        </div>
      </div>
    </div>
  );
}
