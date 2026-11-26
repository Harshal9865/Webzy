import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { logEvent, WebzyError } from '@webzy/core';
import { sanitizeUploadedImage } from '@webzy/core/server';
import { guardMutationRequest } from '../../../../../../infra/security/requestGuard';
import { getAuthSessionState } from '../../../../../../infra/supabase/auth';
import { getSupabaseEnv } from '../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';

const MAX_PHOTOS_PER_DRAFT = 3;

export async function POST(request: NextRequest) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'upload_post',
      maxHits: 40,
      windowSeconds: 3600,
    });
    if (guard) return guard;

    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json(
        { error: 'Supabase storage is not configured yet.', retryable: false },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const draftToken = String(formData.get('draftToken') || '').trim();

    if (!(file instanceof File) || !/^[A-Za-z0-9_-]{24,128}$/.test(draftToken)) {
      throw new WebzyError('Missing photo file or draft session.', {
        code: 'UPLOAD_BAD_REQUEST',
        statusCode: 400,
      });
    }

    const admin = createSupabaseAdminClient();
    const tokenHash = crypto.createHash('sha256').update(draftToken).digest('hex');
    const nowIso = new Date().toISOString();

    const { data: draft } = await admin
      .from('drafts')
      .select('id, user_id, theme_id')
      .eq('draft_token_hash', tokenHash)
      .is('deleted_at', null)
      .gt('expires_at', nowIso)
      .maybeSingle();

    if (!draft) {
      throw new WebzyError('Draft expired or not found. Please reload and retry.', {
        code: 'DRAFT_NOT_FOUND',
        statusCode: 404,
      });
    }

    if (draft.user_id) {
      const session = await getAuthSessionState();
      if (session.user?.id !== draft.user_id) {
        throw new WebzyError('Please sign in with the account that created this draft.', {
          code: 'DRAFT_FORBIDDEN',
          statusCode: 403,
        });
      }
    }

    const maxPhotosForDraft =
      typeof draft.theme_id === 'string' && draft.theme_id.startsWith('wedding-')
        ? 6
        : draft.theme_id === 'small-business-01' || draft.theme_id === 'portfolio-01'
          ? 5
          : MAX_PHOTOS_PER_DRAFT;

    const { count: existingCount } = await admin
      .from('assets')
      .select('id', { count: 'exact', head: true })
      .eq('draft_id', draft.id)
      .eq('status', 'ready')
      .is('deleted_at', null);

    if ((existingCount ?? 0) >= maxPhotosForDraft) {
      throw new WebzyError(`Maximum ${maxPhotosForDraft} photos allowed for this edition.`, {
        code: 'UPLOAD_MAX_EXCEEDED',
        statusCode: 422,
      });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const clean = sanitizeUploadedImage(rawBuffer, { maxBytes: 2 * 1024 * 1024 });

    const assetId = crypto.randomUUID();
    const storageKey = `drafts/${draft.id}/${assetId}.${clean.extension}`;

    let { error: uploadErr } = await admin.storage
      .from('webzy-media')
      .upload(storageKey, clean.buffer, {
        contentType: clean.mimeType,
        upsert: false,
      });

    if (uploadErr && uploadErr.message?.toLowerCase().includes('bucket')) {
      await admin.storage.createBucket('webzy-media', {
        public: false,
        fileSizeLimit: 5 * 1024 * 1024,
      });
      const retry = await admin.storage
        .from('webzy-media')
        .upload(storageKey, clean.buffer, {
          contentType: clean.mimeType,
          upsert: false,
        });
      uploadErr = retry.error;
    }

    if (uploadErr) {
      logEvent('error', 'web.uploads.storage_failed', { reason: uploadErr.message.slice(0, 80) });
      throw new WebzyError('Storage upload failed. Please retry.', {
        code: 'STORAGE_UPLOAD_FAILED',
        statusCode: 500,
        retryable: true,
      });
    }

    const { error: dbErr } = await admin.from('assets').insert({
      id: assetId,
      draft_id: draft.id,
      user_id: draft.user_id,
      type: 'photo',
      status: 'ready',
      mime_type: clean.mimeType,
      width: clean.width,
      height: clean.height,
      exif_stripped: clean.exifStripped,
      storage_key: storageKey,
      size_bytes: clean.sizeBytes,
      checksum: clean.checksumSha256,
    });

    if (dbErr) {
      await admin.storage.from('webzy-media').remove([storageKey]).catch(() => {});
      throw new WebzyError('Failed to save photo record. Please retry.', {
        code: 'ASSET_INSERT_FAILED',
        statusCode: 500,
        retryable: true,
      });
    }

    const { data: signed } = await admin.storage
      .from('webzy-media')
      .createSignedUrl(storageKey, 900);

    logEvent('info', 'web.uploads.photo_saved', {
      draftId: draft.id,
      assetId,
      sizeBytes: clean.sizeBytes,
    });

    return NextResponse.json(
      {
        assetId,
        storageKey,
        signedUrl: signed?.signedUrl || '',
        width: clean.width,
        height: clean.height,
        sizeBytes: clean.sizeBytes,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof WebzyError) {
      return NextResponse.json(
        { error: err.message, code: err.code, retryable: err.retryable },
        { status: err.statusCode },
      );
    }
    logEvent('error', 'web.uploads.exception', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json(
      { error: 'Photo upload failed. Please retry.', retryable: true },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'upload_delete',
      maxHits: 40,
      windowSeconds: 3600,
    });
    if (guard) return guard;

    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId') || '';
    const draftToken = searchParams.get('draftToken') || '';

    if (!assetId || !/^[A-Za-z0-9_-]{24,128}$/.test(draftToken)) {
      return NextResponse.json({ error: 'Missing or invalid draft session.' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const tokenHash = crypto.createHash('sha256').update(draftToken).digest('hex');

    const { data: draft } = await admin
      .from('drafts')
      .select('id, user_id')
      .eq('draft_token_hash', tokenHash)
      .is('deleted_at', null)
      .maybeSingle();

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found.' }, { status: 404 });
    }

    if (draft.user_id) {
      const session = await getAuthSessionState();
      if (session.user?.id !== draft.user_id) {
        return NextResponse.json(
          { error: 'Please sign in with the account that created this draft.' },
          { status: 403 },
        );
      }
    }

    const { data: asset } = await admin
      .from('assets')
      .select('id, storage_key')
      .eq('id', assetId)
      .eq('draft_id', draft.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (!asset) {
      return NextResponse.json({ error: 'Photo not found.' }, { status: 404 });
    }

    try {
      const { error: storageErr } = await admin.storage
        .from('webzy-media')
        .remove([asset.storage_key]);
      if (storageErr) {
        logEvent('warn', 'web.uploads.storage_delete_failed', {
          draftId: draft.id,
          assetId: asset.id,
          reason: storageErr.message.slice(0, 80),
        });
      }
    } catch (storageEx) {
      logEvent('warn', 'web.uploads.storage_delete_exception', {
        draftId: draft.id,
        assetId: asset.id,
        message: storageEx instanceof Error ? storageEx.message.slice(0, 80) : 'unknown',
      });
    }

    const { error: deleteErr } = await admin
      .from('assets')
      .update({ status: 'deleted', deleted_at: new Date().toISOString() })
      .eq('id', asset.id);

    if (deleteErr) {
      logEvent('error', 'web.uploads.delete_db_failed', {
        draftId: draft.id,
        assetId: asset.id,
        dbCode: deleteErr.code || 'unknown',
      });
      return NextResponse.json({ error: 'Unable to delete photo. Retry.' }, { status: 500 });
    }

    logEvent('info', 'web.uploads.photo_deleted', { draftId: draft.id, assetId: asset.id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logEvent('error', 'web.uploads.delete_error', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Unable to delete photo. Retry.' }, { status: 500 });
  }
}
