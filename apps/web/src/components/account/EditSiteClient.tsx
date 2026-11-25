'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { detectScamPatterns, type LanguageCode, SUPPORTED_LANGUAGES } from '@webzy/core';
import {
  buildThemePayloadFromDraft,
  getWeddingMockByTemplateId,
  isWeddingTemplateId,
  parseWeddingLanguage,
  type ThemeManifest,
  ThemeRenderer,
  WeddingScroll,
  type WeddingEventItem,
  type WeddingInvitation,
} from '@webzy/themes';
import { AdaptivePreviewStage } from '../shell/AdaptivePreviewStage';

interface EditSiteClientProps {
  siteId: string;
  slug: string;
  theme: ThemeManifest;
  initialContent: {
    receiverName?: string;
    senderName?: string;
    relation?: string;
    message?: string;
    language?: LanguageCode;
    whatsappPhone?: string;
  };
  initialWeddingData?: Record<string, unknown>;
  initialHasPinLock?: boolean;
  signedPhotos: string[];
  freeEditUntilIso: string;
  editCount: number;
}

export function EditSiteClient({
  siteId,
  slug,
  theme,
  initialContent,
  initialWeddingData,
  initialHasPinLock = false,
  signedPhotos,
  freeEditUntilIso,
  editCount,
}: EditSiteClientProps) {
  const router = useRouter();
  const isWedding = theme.occasion === 'wedding';
  const fallbackWedding = useMemo(
    () => (isWedding ? getWeddingMockByTemplateId(theme.id) : null),
    [isWedding, theme.id],
  );
  const savedWedding = useMemo(
    () => ((initialWeddingData as Partial<WeddingInvitation> | undefined) || {}),
    [initialWeddingData],
  );

  const initialCoupleParts = (initialContent.receiverName || '')
    .split(/\s*(?:&|and|\+|संग)\s*/i)
    .filter(Boolean);

  const [receiverName, setReceiverName] = useState(initialContent.receiverName || '');
  const [senderName, setSenderName] = useState(initialContent.senderName || '');
  const [relation, setRelation] = useState(initialContent.relation || '');
  const [message, setMessage] = useState(initialContent.message || '');
  const [language, setLanguage] = useState<LanguageCode>(initialContent.language || 'en');
  const [whatsappPhone, setWhatsappPhone] = useState(initialContent.whatsappPhone || '');

  // Dedicated Wedding Editor Fields
  const [brideName, setBrideName] = useState(
    savedWedding.brideName || initialCoupleParts[0] || fallbackWedding?.brideName || '',
  );
  const [groomName, setGroomName] = useState(
    savedWedding.groomName || initialCoupleParts[1] || fallbackWedding?.groomName || '',
  );
  const [brideParents, setBrideParents] = useState(
    savedWedding.brideParents || initialContent.senderName || fallbackWedding?.brideParents || '',
  );
  const [groomParents, setGroomParents] = useState(
    savedWedding.groomParents || fallbackWedding?.groomParents || '',
  );
  const [venueName, setVenueName] = useState(
    savedWedding.venueHighlight?.name || fallbackWedding?.venueHighlight?.name || '',
  );
  const [venueCity, setVenueCity] = useState(
    savedWedding.venueHighlight?.city || fallbackWedding?.venueHighlight?.city || '',
  );
  const [rsvpWhatsappNumber, setRsvpWhatsappNumber] = useState(
    savedWedding.rsvp?.whatsappNumber || fallbackWedding?.rsvp.whatsappNumber || '',
  );
  const [shagunUpiId, setShagunUpiId] = useState(
    savedWedding.shagun?.upiId || fallbackWedding?.shagun?.upiId || '',
  );
  const [events, setEvents] = useState<WeddingEventItem[]>(() =>
    Array.isArray(savedWedding.events) && savedWedding.events.length > 0
      ? savedWedding.events
      : fallbackWedding?.events || [],
  );

  // Secret PIN Lock Management State
  const [hasPinLock, setHasPinLock] = useState(initialHasPinLock);
  const [pinAction, setPinAction] = useState<'keep' | 'set' | 'remove'>('keep');
  const [newSecretPin, setNewSecretPin] = useState('');

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const effectiveReceiverName = isWedding
    ? `${brideName.trim()} & ${groomName.trim()}`.trim()
    : receiverName;
  const effectiveSenderName = isWedding ? brideParents : senderName;

  const scamCheck = useMemo(
    () =>
      detectScamPatterns(`${effectiveReceiverName} ${effectiveSenderName} ${message}`, {
        allowPhone: isWedding,
      }),
    [effectiveReceiverName, effectiveSenderName, message, isWedding],
  );

  const previewPayload = useMemo(
    () =>
      buildThemePayloadFromDraft(theme, {
        receiverName: effectiveReceiverName || 'Priya',
        senderName: effectiveSenderName || 'You',
        relation,
        message: message || 'Your updated message preview appears here.',
        whatsappPhone,
        photos: signedPhotos,
      }),
    [theme, effectiveReceiverName, effectiveSenderName, relation, message, whatsappPhone, signedPhotos],
  );

  const weddingPreviewData = useMemo<WeddingInvitation | null>(() => {
    if (!isWedding || !fallbackWedding) return null;
    return {
      ...fallbackWedding,
      ...savedWedding,
      slug,
      templateId: isWeddingTemplateId(theme.id) ? theme.id : fallbackWedding.templateId,
      language: parseWeddingLanguage(language) ?? savedWedding.language ?? fallbackWedding.language,
      brideName: brideName.trim() || savedWedding.brideName || fallbackWedding.brideName,
      groomName: groomName.trim() || savedWedding.groomName || fallbackWedding.groomName,
      brideParents: brideParents.trim() || savedWedding.brideParents || fallbackWedding.brideParents,
      groomParents: groomParents.trim() || savedWedding.groomParents || fallbackWedding.groomParents,
      familyBlessingLine: relation.trim() || savedWedding.familyBlessingLine || fallbackWedding.familyBlessingLine,
      personalMessage: message.trim() || savedWedding.personalMessage || fallbackWedding.personalMessage,
      venueHighlight: {
        ...(fallbackWedding.venueHighlight || {
          name: '',
          city: '',
          tagline: '',
          mapUrl: 'https://maps.google.com',
        }),
        ...(savedWedding.venueHighlight || {}),
        name: venueName.trim() || savedWedding.venueHighlight?.name || fallbackWedding.venueHighlight?.name || '',
        city: venueCity.trim() || savedWedding.venueHighlight?.city || fallbackWedding.venueHighlight?.city || '',
      },
      rsvp: {
        ...fallbackWedding.rsvp,
        ...(savedWedding.rsvp || {}),
        whatsappNumber: rsvpWhatsappNumber.trim() || savedWedding.rsvp?.whatsappNumber || fallbackWedding.rsvp.whatsappNumber,
      },
      shagun: shagunUpiId.trim()
        ? {
            enabled: true,
            upiId: shagunUpiId.trim(),
            beneficiaryName:
              savedWedding.shagun?.beneficiaryName ||
              `${brideName.trim() || fallbackWedding.brideName} & ${groomName.trim() || fallbackWedding.groomName}`,
          }
        : savedWedding.shagun ?? fallbackWedding.shagun,
      events,
      gallery:
        signedPhotos.length > 0
          ? signedPhotos
          : savedWedding.gallery && savedWedding.gallery.length > 0
            ? savedWedding.gallery
            : fallbackWedding.gallery,
    };
  }, [
    isWedding,
    fallbackWedding,
    savedWedding,
    slug,
    theme.id,
    language,
    brideName,
    groomName,
    brideParents,
    groomParents,
    relation,
    message,
    venueName,
    venueCity,
    rsvpWhatsappNumber,
    shagunUpiId,
    events,
    signedPhotos,
  ]);

  function updateCeremony(index: number, patch: Partial<WeddingEventItem>) {
    setEvents((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  const freeUntilText = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(freeEditUntilIso));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!scamCheck.allowed) {
      setErrorMsg('Please remove restricted links or phone requests from the message.');
      return;
    }

    const cleanPin = newSecretPin.replace(/\D/g, '').slice(0, 4);
    if (pinAction === 'set' && cleanPin.length !== 4) {
      setErrorMsg('Please enter a 4-digit numeric Secret PIN.');
      return;
    }

    setSaving(true);
    setSavedMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/sites/edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          receiverName: effectiveReceiverName,
          senderName: effectiveSenderName,
          relation,
          message,
          language,
          whatsappPhone,
          pinAction,
          secretPin: pinAction === 'set' ? cleanPin : undefined,
          weddingPatch: isWedding
            ? {
                brideName: brideName.trim(),
                groomName: groomName.trim(),
                brideParents: brideParents.trim(),
                groomParents: groomParents.trim(),
                venueName: venueName.trim(),
                venueCity: venueCity.trim(),
                rsvpWhatsappNumber: rsvpWhatsappNumber.trim(),
                shagunUpiId: shagunUpiId.trim(),
                events,
              }
            : undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        editCount?: number;
        secretPinEnabled?: boolean;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Could not save edits.');
      }
      if (typeof data.secretPinEnabled === 'boolean') {
        setHasPinLock(data.secretPinEnabled);
      }
      setPinAction('keep');
      setNewSecretPin('');
      setSavedMsg('Changes saved directly to your live page!');
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save edits.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/account"
            className="inline-flex min-h-[40px] items-center text-xs font-bold text-webzy-primary hover:underline"
          >
            ← Back to My Webzys
          </Link>
          <h1 className="font-heading text-3xl font-bold text-webzy-ink">
            Free 24-Hour Edit ({theme.name.en})
          </h1>
          <p className="mt-1 text-xs text-webzy-ink/70" suppressHydrationWarning>
            Free edits allowed until <strong>{freeUntilText} IST</strong> · Revisions saved:{' '}
            {editCount}
          </p>
        </div>

        <Link
          href={`/s/${slug}`}
          className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-white px-5 text-xs font-bold text-webzy-primary hover:border-webzy-primary"
        >
          Open Live Page →
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-3xl border border-webzy-tint bg-webzy-surface/60 p-6 lg:col-span-6"
        >
          <div>
            <label htmlFor="edit-lang" className="block text-xs font-bold text-webzy-ink">
              Page language
            </label>
            <select
              id="edit-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3 text-sm text-webzy-ink"
            >
              {SUPPORTED_LANGUAGES.map((langOpt) => (
                <option key={langOpt.code} value={langOpt.code}>
                  {langOpt.nativeLabel} ({langOpt.englishLabel})
                </option>
              ))}
            </select>
          </div>

          {isWedding ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-bride" className="block text-xs font-bold text-webzy-ink">
                    Bride&apos;s Name
                  </label>
                  <input
                    id="edit-bride"
                    type="text"
                    required
                    maxLength={50}
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
                  />
                </div>
                <div>
                  <label htmlFor="edit-groom" className="block text-xs font-bold text-webzy-ink">
                    Groom&apos;s Name
                  </label>
                  <input
                    id="edit-groom"
                    type="text"
                    required
                    maxLength={50}
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-bride-parents" className="block text-xs font-bold text-webzy-ink">
                    Bride&apos;s Parents
                  </label>
                  <input
                    id="edit-bride-parents"
                    type="text"
                    required
                    maxLength={100}
                    value={brideParents}
                    onChange={(e) => setBrideParents(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
                  />
                </div>
                <div>
                  <label htmlFor="edit-groom-parents" className="block text-xs font-bold text-webzy-ink">
                    Groom&apos;s Parents
                  </label>
                  <input
                    id="edit-groom-parents"
                    type="text"
                    maxLength={100}
                    value={groomParents}
                    onChange={(e) => setGroomParents(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-venue-name" className="block text-xs font-bold text-webzy-ink">
                    Primary Venue Name
                  </label>
                  <input
                    id="edit-venue-name"
                    type="text"
                    maxLength={80}
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
                  />
                </div>
                <div>
                  <label htmlFor="edit-venue-city" className="block text-xs font-bold text-webzy-ink">
                    Primary Venue City
                  </label>
                  <input
                    id="edit-venue-city"
                    type="text"
                    maxLength={80}
                    value={venueCity}
                    onChange={(e) => setVenueCity(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-rsvp-wa" className="block text-xs font-bold text-webzy-ink">
                    RSVP WhatsApp Number
                  </label>
                  <input
                    id="edit-rsvp-wa"
                    type="tel"
                    maxLength={20}
                    value={rsvpWhatsappNumber}
                    onChange={(e) => setRsvpWhatsappNumber(e.target.value)}
                    placeholder="919876543210"
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
                  />
                </div>
                <div>
                  <label htmlFor="edit-shagun-upi" className="block text-xs font-bold text-webzy-ink">
                    Digital Shagun UPI ID (optional)
                  </label>
                  <input
                    id="edit-shagun-upi"
                    type="text"
                    maxLength={60}
                    value={shagunUpiId}
                    onChange={(e) => setShagunUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-receiver" className="block text-xs font-bold text-webzy-ink">
                  Recipient name
                </label>
                <input
                  id="edit-receiver"
                  type="text"
                  required
                  maxLength={60}
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
                />
              </div>
              <div>
                <label htmlFor="edit-sender" className="block text-xs font-bold text-webzy-ink">
                  From (your name)
                </label>
                <input
                  id="edit-sender"
                  type="text"
                  required
                  maxLength={60}
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="edit-relation" className="block text-xs font-bold text-webzy-ink">
              {isWedding ? 'Blessing / Scripture header line' : 'Relation / Occasion note'}
            </label>
            <input
              id="edit-relation"
              type="text"
              maxLength={120}
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
            />
          </div>

          {theme.occasion === 'business' ? (
            <div>
              <label htmlFor="edit-wa" className="block text-xs font-bold text-webzy-ink">
                Business WhatsApp number
              </label>
              <input
                id="edit-wa"
                type="tel"
                maxLength={20}
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder="+91 98XXXXXXXX"
                className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink"
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="edit-message" className="block text-xs font-bold text-webzy-ink">
              Personal message
            </label>
            <textarea
              id="edit-message"
              required
              rows={4}
              maxLength={600}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full rounded-xl border border-webzy-tint bg-white p-3.5 text-sm leading-relaxed text-webzy-ink"
            />
            <p className="mt-1 text-[11px] text-webzy-ink/60">{message.length}/600 characters</p>
          </div>

          {/* Wedding Ceremony Schedule Editor */}
          {isWedding && events.length > 0 ? (
            <div className="space-y-3 rounded-2xl border border-webzy-tint bg-white p-4">
              <div>
                <p className="text-xs font-bold text-webzy-ink">
                  Ceremony Cards ({events.length})
                </p>
                <p className="text-[11px] text-webzy-ink/60">
                  Fix any ceremony timing, venue name, address, or dress code.
                </p>
              </div>
              <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                {events.map((ev, idx) => (
                  <div
                    key={ev.id || idx}
                    className="rounded-xl border border-webzy-tint/80 bg-webzy-surface/40 p-3 space-y-2"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wider text-webzy-primary">
                      Ceremony {idx + 1}: {ev.title}
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <input
                        type="text"
                        value={ev.title}
                        onChange={(e) => updateCeremony(idx, { title: e.target.value })}
                        placeholder="Ceremony title"
                        className="min-h-[38px] rounded-lg border border-webzy-tint bg-white px-2.5 text-xs font-semibold text-webzy-ink"
                      />
                      <input
                        type="datetime-local"
                        value={(ev.dateTime || '').slice(0, 16)}
                        onChange={(e) => {
                          if (e.target.value) {
                            updateCeremony(idx, { dateTime: `${e.target.value}:00+05:30` });
                          }
                        }}
                        className="min-h-[38px] rounded-lg border border-webzy-tint bg-white px-2.5 text-xs text-webzy-ink"
                      />
                      <input
                        type="text"
                        value={ev.venueName}
                        onChange={(e) => updateCeremony(idx, { venueName: e.target.value })}
                        placeholder="Venue name"
                        className="min-h-[38px] rounded-lg border border-webzy-tint bg-white px-2.5 text-xs text-webzy-ink"
                      />
                      <input
                        type="text"
                        value={ev.address}
                        onChange={(e) => updateCeremony(idx, { address: e.target.value })}
                        placeholder="Venue address / city"
                        className="min-h-[38px] rounded-lg border border-webzy-tint bg-white px-2.5 text-xs text-webzy-ink"
                      />
                      <input
                        type="text"
                        value={ev.dressCode || ''}
                        onChange={(e) => updateCeremony(idx, { dressCode: e.target.value })}
                        placeholder="Dress code"
                        className="min-h-[38px] sm:col-span-2 rounded-lg border border-webzy-tint bg-white px-2.5 text-xs text-webzy-ink"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* 4-Digit Secret PIN Lock Management */}
          <div className="rounded-2xl border border-webzy-tint bg-white p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-webzy-ink">
                  4-Digit Secret PIN Lock
                </p>
                <p className="text-[11px] text-webzy-ink/60">
                  {hasPinLock
                    ? 'A 4-digit PIN lock is currently active on your live link.'
                    : 'Optional: require a 4-digit PIN before guests can view your live link.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setPinAction(pinAction === 'set' ? 'keep' : 'set')}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                    pinAction === 'set'
                      ? 'bg-webzy-primary text-white'
                      : 'border border-webzy-tint bg-webzy-surface text-webzy-ink'
                  }`}
                >
                  {hasPinLock ? 'Change 4-Digit PIN' : 'Set 4-Digit PIN'}
                </button>
                {hasPinLock ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPinAction(pinAction === 'remove' ? 'keep' : 'remove');
                      setNewSecretPin('');
                    }}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                      pinAction === 'remove'
                        ? 'bg-rose-700 text-white'
                        : 'border border-rose-200 bg-rose-50 text-rose-800'
                    }`}
                  >
                    {pinAction === 'remove' ? 'Will Remove PIN on Save' : 'Remove PIN Lock'}
                  </button>
                ) : null}
              </div>
            </div>

            {pinAction === 'set' ? (
              <div className="pt-1">
                <label htmlFor="edit-secret-pin" className="block text-[11px] font-bold text-webzy-ink">
                  Enter new 4-digit numeric PIN
                </label>
                <input
                  id="edit-secret-pin"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  value={newSecretPin}
                  onChange={(e) => setNewSecretPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="e.g. 2408"
                  className="mt-1 min-h-[42px] w-40 rounded-xl border border-webzy-tint bg-webzy-surface/40 px-3 text-center font-mono text-base font-bold tracking-[0.3em] text-webzy-ink"
                />
              </div>
            ) : null}
          </div>

          {!scamCheck.allowed ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900">
              Restricted content detected ({scamCheck.reason || 'suspicious link/text'}). Please
              edit your note before saving.
            </div>
          ) : null}

          {errorMsg ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900">
              {errorMsg}
            </div>
          ) : null}

          {savedMsg ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-900">
              {savedMsg}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={saving || !scamCheck.allowed}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white shadow-sm disabled:opacity-50"
          >
            {saving ? 'Saving edits...' : 'Save changes to live page'}
          </button>
        </form>

        <div className="lg:col-span-6">
          <AdaptivePreviewStage
            title={theme.name.en}
            caption="Live preview with your edits"
            accentColor={theme.palette.primary}
            fullscreenChildren={
              weddingPreviewData ? (
                <WeddingScroll data={weddingPreviewData} initialOpen />
              ) : (
                <ThemeRenderer manifest={theme} data={previewPayload} language={language} />
              )
            }
          >
            {weddingPreviewData ? (
              <WeddingScroll data={weddingPreviewData} embedded initialOpen />
            ) : (
              <ThemeRenderer manifest={theme} data={previewPayload} language={language} />
            )}
          </AdaptivePreviewStage>
        </div>
      </div>
    </div>
  );
}
