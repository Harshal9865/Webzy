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

export async function getAuthSessionState(): Promise<AuthSessionState> {
  const { configured } = getSupabaseEnv();
  if (!configured) {
    return {
      configured: false,
      user: null,
      profile: null,
      aal: null,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { configured: true, user: null, profile: null, aal: null };
    }

    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const aal = (aalData?.currentLevel as AuthenticatorAssuranceLevel) ?? 'aal1';

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role, is_banned, created_at')
      .eq('id', user.id)
      .maybeSingle();

    return {
      configured: true,
      user,
      profile: (profile as UserProfileRecord | null) ?? null,
      aal,
    };
  } catch (err) {
    logEvent('warn', 'infra.auth.session_check_failed', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return {
      configured: true,
      user: null,
      profile: null,
      aal: null,
    };
  }
}

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
