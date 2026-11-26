import type { SupabaseClient } from '@supabase/supabase-js';
import { evaluateCapacitySlot } from '@webzy/core';

export interface CustomOrderSlotStatus {
  paused: boolean;
  limit: number;
  activeCount: number;
  remainingSlots: number;
  acceptingOrders: boolean;
  capacityMessage: string;
}

export interface PlatformCapacityState {
  wedding: CustomOrderSlotStatus;
  studio: CustomOrderSlotStatus;
  capacityMessage: string;
  updatedAt: string | null;
}

export interface UpdateCapacityPatch {
  customWeddingPaused?: boolean;
  customWeddingLimit?: number;
  customStudioPaused?: boolean;
  customStudioLimit?: number;
  capacityMessage?: string;
}

const DEFAULT_WEDDING_LIMIT = 3;
const DEFAULT_STUDIO_LIMIT = 5;

const ACTIVE_REQUEST_STATUSES = ['new', 'reviewing', 'quoted', 'accepted', 'in_progress'] as const;
const ACTIVE_WAITLIST_STATUSES = ['waitlisted', 'contacted', 'in_progress'] as const;

export function buildDefaultCapacityState(): PlatformCapacityState {
  return {
    wedding: evaluateCapacitySlot({
      paused: false,
      limit: DEFAULT_WEDDING_LIMIT,
      activeCount: 0,
    }),
    studio: evaluateCapacitySlot({
      paused: false,
      limit: DEFAULT_STUDIO_LIMIT,
      activeCount: 0,
    }),
    capacityMessage: '',
    updatedAt: null,
  };
}

function clampLimit(val: unknown, fallback: number): number {
  if (typeof val !== 'number' || !Number.isFinite(val)) return fallback;
  return Math.min(100, Math.max(0, Math.trunc(val)));
}

export async function getCustomOrderCapacity(
  admin: SupabaseClient,
): Promise<PlatformCapacityState> {
  let weddingPaused = false;
  let weddingLimit = DEFAULT_WEDDING_LIMIT;
  let studioPaused = false;
  let studioLimit = DEFAULT_STUDIO_LIMIT;
  let capacityMessage = '';
  let updatedAt: string | null = null;

  try {
    const { data: settings, error } = await admin
      .from('platform_settings')
      .select(
        'custom_wedding_paused, custom_wedding_limit, custom_studio_paused, custom_studio_limit, capacity_message, updated_at',
      )
      .eq('id', 'global')
      .maybeSingle();

    if (!error && settings) {
      weddingPaused = Boolean(settings.custom_wedding_paused);
      weddingLimit = clampLimit(settings.custom_wedding_limit, DEFAULT_WEDDING_LIMIT);
      studioPaused = Boolean(settings.custom_studio_paused);
      studioLimit = clampLimit(settings.custom_studio_limit, DEFAULT_STUDIO_LIMIT);
      capacityMessage =
        typeof settings.capacity_message === 'string' ? settings.capacity_message.trim() : '';
      updatedAt = typeof settings.updated_at === 'string' ? settings.updated_at : null;
    }
  } catch {
    // Graceful fallback for pre-migration environments
  }

  let weddingActiveCount = 0;
  let studioActiveCount = 0;

  try {
    const [reqWeddingRes, reqStudioRes, wlWeddingRes, wlStudioRes] = await Promise.all([
      admin
        .from('custom_requests')
        .select('id', { count: 'exact', head: true })
        .eq('occasion', 'wedding')
        .in('status', [...ACTIVE_REQUEST_STATUSES]),
      admin
        .from('custom_requests')
        .select('id', { count: 'exact', head: true })
        .neq('occasion', 'wedding')
        .in('status', [...ACTIVE_REQUEST_STATUSES]),
      admin
        .from('business_waitlist')
        .select('id', { count: 'exact', head: true })
        .eq('category', 'wedding_bespoke')
        .in('status', [...ACTIVE_WAITLIST_STATUSES]),
      admin
        .from('business_waitlist')
        .select('id', { count: 'exact', head: true })
        .neq('category', 'wedding_bespoke')
        .in('status', [...ACTIVE_WAITLIST_STATUSES]),
    ]);

    weddingActiveCount =
      (reqWeddingRes.count ?? 0) + (wlWeddingRes.count ?? 0);
    studioActiveCount =
      (reqStudioRes.count ?? 0) + (wlStudioRes.count ?? 0);
  } catch {
    // Graceful fallback if counts fail
  }

  return {
    wedding: evaluateCapacitySlot({
      paused: weddingPaused,
      limit: weddingLimit,
      activeCount: weddingActiveCount,
      capacityMessage,
    }),
    studio: evaluateCapacitySlot({
      paused: studioPaused,
      limit: studioLimit,
      activeCount: studioActiveCount,
      capacityMessage,
    }),
    capacityMessage,
    updatedAt,
  };
}

export function validateCapacityPatchPayload(
  raw: unknown,
): { ok: true; patch: UpdateCapacityPatch } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'Invalid request body.' };
  }
  const body = raw as Record<string, unknown>;
  const patch: UpdateCapacityPatch = {};

  if (body.customWeddingPaused !== undefined) {
    if (typeof body.customWeddingPaused !== 'boolean') {
      return { ok: false, error: 'customWeddingPaused must be a boolean.' };
    }
    patch.customWeddingPaused = body.customWeddingPaused;
  }

  if (body.customStudioPaused !== undefined) {
    if (typeof body.customStudioPaused !== 'boolean') {
      return { ok: false, error: 'customStudioPaused must be a boolean.' };
    }
    patch.customStudioPaused = body.customStudioPaused;
  }

  if (body.customWeddingLimit !== undefined) {
    if (
      typeof body.customWeddingLimit !== 'number' ||
      !Number.isFinite(body.customWeddingLimit) ||
      !Number.isInteger(body.customWeddingLimit) ||
      body.customWeddingLimit < 0 ||
      body.customWeddingLimit > 100
    ) {
      return { ok: false, error: 'customWeddingLimit must be an integer between 0 and 100.' };
    }
    patch.customWeddingLimit = body.customWeddingLimit;
  }

  if (body.customStudioLimit !== undefined) {
    if (
      typeof body.customStudioLimit !== 'number' ||
      !Number.isFinite(body.customStudioLimit) ||
      !Number.isInteger(body.customStudioLimit) ||
      body.customStudioLimit < 0 ||
      body.customStudioLimit > 100
    ) {
      return { ok: false, error: 'customStudioLimit must be an integer between 0 and 100.' };
    }
    patch.customStudioLimit = body.customStudioLimit;
  }

  if (body.capacityMessage !== undefined) {
    if (typeof body.capacityMessage !== 'string') {
      return { ok: false, error: 'capacityMessage must be a string.' };
    }
    const trimmed = body.capacityMessage.trim();
    if (trimmed.length > 240) {
      return { ok: false, error: 'capacityMessage must be 240 characters or fewer.' };
    }
    patch.capacityMessage = trimmed;
  }

  return { ok: true, patch };
}

export async function updateCustomOrderCapacity(
  admin: SupabaseClient,
  patch: UpdateCapacityPatch,
  actorId?: string | null,
): Promise<PlatformCapacityState> {
  const row: Record<string, unknown> = {
    id: 'global',
    updated_at: new Date().toISOString(),
    updated_by: actorId ?? null,
  };

  if (typeof patch.customWeddingPaused === 'boolean') {
    row.custom_wedding_paused = patch.customWeddingPaused;
  }
  if (typeof patch.customWeddingLimit === 'number') {
    row.custom_wedding_limit = clampLimit(patch.customWeddingLimit, DEFAULT_WEDDING_LIMIT);
  }
  if (typeof patch.customStudioPaused === 'boolean') {
    row.custom_studio_paused = patch.customStudioPaused;
  }
  if (typeof patch.customStudioLimit === 'number') {
    row.custom_studio_limit = clampLimit(patch.customStudioLimit, DEFAULT_STUDIO_LIMIT);
  }
  if (typeof patch.capacityMessage === 'string') {
    row.capacity_message = patch.capacityMessage.trim().slice(0, 240);
  }

  const { error } = await admin
    .from('platform_settings')
    .upsert(row, { onConflict: 'id' });

  if (error) {
    throw new Error(error.message);
  }

  return getCustomOrderCapacity(admin);
}
