import { cache } from 'react';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';
import {
  AuthenticatorAssuranceLevel,
  logEvent,
  type UserProfileRecord,
} from '@webzy/core';
import { getSupabaseEnv } from './env';
import { createSupabaseAdminClient, createSupabaseServerClient } from './server';

export type { UserProfileRecord };

export interface AuthSessionState {
  configured: boolean;
  user: User | null;
  profile: UserProfileRecord | null;
  aal: AuthenticatorAssuranceLevel;
}

const EMPTY_AUTH_STATE = (configured: boolean): AuthSessionState => ({
  configured,
  user: null,
  profile: null,
  aal: null,
});

export const getAuthSessionState = cache(async (): Promise<AuthSessionState> => {
  const { configured, adminConfigured } = getSupabaseEnv();
  if (!configured) {
    return EMPTY_AUTH_STATE(false);
  }

  try {
    // Fast-path: anonymous visitors with no Supabase auth cookie skip remote Auth HTTP calls completely
    const cookieStore = await cookies();
    const hasAuthCookie = cookieStore.getAll().some((c) => c.name.startsWith('sb-'));
    if (!hasAuthCookie) {
      return EMPTY_AUTH_STATE(true);
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return EMPTY_AUTH_STATE(true);
    }

    const admin = adminConfigured ? createSupabaseAdminClient() : null;

    // Run MFA level check and profile fetch in parallel to halve backend latency
    const [aalRes, profileRes] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      admin
        ? admin
            .from('profiles')
            .select('id, full_name, email, phone, role, is_banned, created_at')
            .eq('id', user.id)
            .maybeSingle()
        : supabase
            .from('profiles')
            .select('id, full_name, email, phone, role, is_banned, created_at')
            .eq('id', user.id)
            .maybeSingle(),
    ]);

    const aal = (aalRes.data?.currentLevel as AuthenticatorAssuranceLevel) ?? 'aal1';
    let profile: UserProfileRecord | null =
      (profileRes.data as UserProfileRecord | null) ?? null;

    if (!profile && admin) {
      const metaFullName =
        typeof user.user_metadata?.full_name === 'string'
          ? user.user_metadata.full_name.trim()
          : '';
      const { data: insertedProfile } = await admin
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email || '',
            full_name: metaFullName,
            role: 'user',
            is_banned: false,
          },
          { onConflict: 'id' },
        )
        .select('id, full_name, email, phone, role, is_banned, created_at')
        .maybeSingle();
      profile = (insertedProfile as UserProfileRecord | null) ?? null;
    }

    return {
      configured: true,
      user,
      profile,
      aal,
    };
  } catch (err) {
    logEvent('warn', 'infra.auth.session_check_failed', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return EMPTY_AUTH_STATE(true);
  }
});

export async function writeAuditLog(params: {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string;
  meta?: Record<string, string | number | boolean | null>;
}): Promise<void> {
  const { adminConfigured } = getSupabaseEnv();
  if (!adminConfigured) return;

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from('audit_log').insert({
      actor: params.actorId ?? null,
      action: params.action,
      entity: params.entity,
      entity_id: params.entityId ?? '',
      meta: params.meta ?? {},
    });
    if (error) {
      logEvent('error', 'audit.write_failed', {
        action: params.action,
        code: error.code || 'db_error',
      });
      return;
    }
    logEvent('info', 'audit.recorded', {
      action: params.action,
      entity: params.entity,
    });
  } catch (err) {
    logEvent('error', 'audit.write_failed', {
      action: params.action,
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
  }
}
