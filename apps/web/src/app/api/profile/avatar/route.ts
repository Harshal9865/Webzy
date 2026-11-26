import { NextResponse, type NextRequest } from 'next/server';
import { logEvent, WebzyError } from '@webzy/core';
import { sanitizeUploadedImage } from '@webzy/core/server';
import { guardMutationRequest } from '../../../../../../../infra/security/requestGuard';
import { getAuthSessionState } from '../../../../../../../infra/supabase/auth';
import { getSupabaseEnv } from '../../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

const AVATAR_BUCKET = 'webzy-media';

async function ensurePrivateBucket(admin: ReturnType<typeof createSupabaseAdminClient>) {
  const { error } = await admin.storage.createBucket(AVATAR_BUCKET, {
    public: false,
    fileSizeLimit: 5 * 1024 * 1024,
  });
  if (error && !error.message?.toLowerCase().includes('already exists')) {
    logEvent('warn', 'web.profile.avatar_bucket_check', { reason: error.message.slice(0, 80) });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'profile_avatar_post',
      maxHits: 20,
      windowSeconds: 3600,
    });
    if (guard) return guard;

    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json(
        { error: 'Storage is not configured in this environment.' },
        { status: 503 },
      );
    }

    const session = await getAuthSessionState();
    if (!session.user) {
      return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
    }
    if (session.profile?.is_banned) {
      return NextResponse.json({ error: 'Account access restricted.' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      throw new WebzyError('Please choose a valid photo (JPG, PNG, or WebP).', {
        code: 'AVATAR_MISSING_FILE',
        statusCode: 400,
      });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const clean = sanitizeUploadedImage(rawBuffer, { maxBytes: 2 * 1024 * 1024 });

    const admin = createSupabaseAdminClient();
    const storageKey = `avatars/${session.user.id}/avatar-${Date.now()}.${clean.extension}`;
    const prevKey =
      typeof session.user.user_metadata?.avatar_storage_key === 'string'
        ? session.user.user_metadata.avatar_storage_key
        : null;

    let uploadRes = await admin.storage.from(AVATAR_BUCKET).upload(storageKey, clean.buffer, {
      contentType: clean.mimeType,
      upsert: true,
    });

    if (uploadRes.error && uploadRes.error.message?.toLowerCase().includes('bucket')) {
      await ensurePrivateBucket(admin);
      uploadRes = await admin.storage.from(AVATAR_BUCKET).upload(storageKey, clean.buffer, {
        contentType: clean.mimeType,
        upsert: true,
      });
    }

    if (uploadRes.error) {
      logEvent('error', 'web.profile.avatar_upload_failed', {
        userId: session.user.id,
        reason: uploadRes.error.message.slice(0, 80),
      });
      throw new WebzyError('Could not upload profile photo. Please retry.', {
        code: 'AVATAR_STORAGE_FAILED',
        statusCode: 500,
        retryable: true,
      });
    }

    const existingMeta =
      session.user.user_metadata && typeof session.user.user_metadata === 'object'
        ? session.user.user_metadata
        : {};

    const { error: metaErr } = await admin.auth.admin.updateUserById(session.user.id, {
      user_metadata: {
        ...existingMeta,
        avatar_storage_key: storageKey,
      },
    });

    if (metaErr) {
      await admin.storage.from(AVATAR_BUCKET).remove([storageKey]).catch(() => {});
      throw new WebzyError('Could not link profile photo to your account.', {
        code: 'AVATAR_META_FAILED',
        statusCode: 500,
        retryable: true,
      });
    }

    if (prevKey && prevKey !== storageKey) {
      await admin.storage.from(AVATAR_BUCKET).remove([prevKey]).catch(() => {});
    }

    const { data: signed } = await admin.storage
      .from(AVATAR_BUCKET)
      .createSignedUrl(storageKey, 3600);

    return NextResponse.json({
      ok: true,
      avatarUrl: signed?.signedUrl || '',
    });
  } catch (err) {
    if (err instanceof WebzyError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    logEvent('error', 'web.profile.avatar_exception', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json(
      { error: 'Unable to upload profile photo right now. Please retry.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'profile_avatar_delete',
      maxHits: 20,
      windowSeconds: 3600,
    });
    if (guard) return guard;

    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json({ error: 'Storage not configured.' }, { status: 503 });
    }

    const session = await getAuthSessionState();
    if (!session.user) {
      return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();
    const prevKey =
      typeof session.user.user_metadata?.avatar_storage_key === 'string'
        ? session.user.user_metadata.avatar_storage_key
        : null;

    if (prevKey) {
      await admin.storage.from(AVATAR_BUCKET).remove([prevKey]).catch(() => {});
    }

    const existingMeta =
      session.user.user_metadata && typeof session.user.user_metadata === 'object'
        ? session.user.user_metadata
        : {};

    await admin.auth.admin.updateUserById(session.user.id, {
      user_metadata: {
        ...existingMeta,
        avatar_storage_key: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to remove profile photo.' }, { status: 500 });
  }
}
