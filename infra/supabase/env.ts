export interface SupabaseEnvConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  configured: boolean;
  adminConfigured: boolean;
}

export function getSupabaseEnv(env: NodeJS.ProcessEnv = process.env): SupabaseEnvConfig {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';

  return {
    url,
    anonKey,
    serviceRoleKey,
    configured: Boolean(url && anonKey),
    adminConfigured: Boolean(url && anonKey && serviceRoleKey),
  };
}
