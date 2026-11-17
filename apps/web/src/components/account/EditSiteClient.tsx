'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { detectScamPatterns, type LanguageCode } from '@webzy/core';
import { buildThemePayloadFromDraft, type ThemeManifest, ThemeRenderer } from '@webzy/themes';
import { PhoneFrame } from '../shell/PhoneFrame';

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
  signedPhotos: string[];
  freeEditUntilIso: string;
  editCount: number;
}

export function EditSiteClient({
  siteId,
  slug,
  theme,
  initialContent,
  signedPhotos,
  freeEditUntilIso,
  editCount,
}: EditSiteClientProps) {
  const router = useRouter();
  const [receiverName, setReceiverName] = useState(initialContent.receiverName || '');
  const [senderName, setSenderName] = useState(initialContent.senderName || '');
  const [relation, setRelation] = useState(initialContent.relation || '');
  const [message, setMessage] = useState(initialContent.message || '');
  const [language, setLanguage] = useState<LanguageCode>(initialContent.language || 'en');
  const [whatsappPhone, setWhatsappPhone] = useState(initialContent.whatsappPhone || '');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const scamCheck = useMemo(
    () => detectScamPatterns(`${receiverName} ${senderName} ${message}`),
    [receiverName, senderName, message],
  );

  const previewPayload = useMemo(
    () =>
      buildThemePayloadFromDraft(theme, {
        receiverName: receiverName || 'Priya',
        senderName: senderName || 'You',
        relation,
        message: message || 'Your updated message preview appears here.',
        whatsappPhone,
        photos: signedPhotos,
      }),
    [theme, receiverName, senderName, relation, message, whatsappPhone, signedPhotos],
  );

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

    setSaving(true);
    setSavedMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/sites/edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          receiverName,
          senderName,
          relation,
          message,
          language,
          whatsappPhone,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; editCount?: number };
      if (!res.ok) {
        throw new Error(data.error || 'Could not save edits.');
      }
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
          <p className="mt-1 text-xs text-webzy-ink/70">
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
              {theme.languages.map((code) => (
                <option key={code} value={code}>
                  {code === 'en' ? 'English' : code === 'hi' ? 'हिन्दी (Hindi)' : 'Hinglish'}
                </option>
              ))}
            </select>
          </div>

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

          <div>
            <label htmlFor="edit-relation" className="block text-xs font-bold text-webzy-ink">
              Relation / Occasion note
            </label>
            <input
              id="edit-relation"
              type="text"
              maxLength={60}
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
              rows={5}
              maxLength={600}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full rounded-xl border border-webzy-tint bg-white p-3.5 text-sm leading-relaxed text-webzy-ink"
            />
            <p className="mt-1 text-[11px] text-webzy-ink/60">{message.length}/600 characters</p>
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
          <PhoneFrame caption="Live preview with your edits">
            <ThemeRenderer manifest={theme} data={previewPayload} language={language} />
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}
