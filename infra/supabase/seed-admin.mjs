import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function loadEnvLocalIfPresent() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let val = trimmed.slice(eqIndex + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

async function main() {
  loadEnvLocalIfPresent();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || process.argv[2] || '').trim().toLowerCase();
  const adminPassword = (process.env.SEED_ADMIN_PASSWORD || process.argv[3] || '').trim();

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      'ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment / .env.local.',
    );
    process.exit(1);
  }

  if (!adminEmail || !adminEmail.includes('@')) {
    console.error(
      'ERROR: Provide the founder email via SEED_ADMIN_EMAIL in .env.local or run: npm run seed:admin -- your@email.com [password]',
    );
    process.exit(1);
  }

  if (adminPassword && adminPassword.length < 8) {
    console.error('ERROR: Admin password must be at least 8 characters long.');
    process.exit(1);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Check if auth user already exists; otherwise create confirmed user
  const { data: listData, error: listErr } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listErr) {
    console.error('Failed to list Supabase users:', listErr.message);
    process.exit(1);
  }

  let targetUser = listData.users.find((u) => (u.email || '').toLowerCase() === adminEmail);

  if (!targetUser) {
    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email: adminEmail,
      ...(adminPassword ? { password: adminPassword } : {}),
      email_confirm: true,
      user_metadata: { full_name: 'Webzy Founder' },
    });
    if (createErr || !created.user) {
      console.error('Failed to create admin auth user:', createErr?.message || 'Unknown error');
      process.exit(1);
    }
    targetUser = created.user;
    console.info(`Created Supabase Auth user for ${adminEmail}.`);
  } else {
    console.info(`Found existing Supabase Auth user for ${adminEmail}.`);
    if (adminPassword) {
      const { error: pwdErr } = await adminClient.auth.admin.updateUserById(targetUser.id, {
        password: adminPassword,
        email_confirm: true,
      });
      if (pwdErr) {
        console.error('Failed to update admin password:', pwdErr.message);
        process.exit(1);
      }
      console.info(`Updated Admin password for ${adminEmail}.`);
    }
  }

  // 2. Promote profile to admin
  const { error: upsertErr } = await adminClient.from('profiles').upsert(
    {
      id: targetUser.id,
      email: adminEmail,
      full_name: targetUser.user_metadata?.full_name || 'Webzy Founder',
      role: 'admin',
      is_banned: false,
    },
    { onConflict: 'id' },
  );

  if (upsertErr) {
    console.error(
      'Failed to promote profile (did you run 0001_initial_schema.sql first?):',
      upsertErr.message,
    );
    process.exit(1);
  }

  // 3. Record audit log entry (no raw email PII in meta)
  const { error: auditErr } = await adminClient.from('audit_log').insert({
    actor: targetUser.id,
    action: 'seed_admin_promoted',
    entity: 'profiles',
    entity_id: targetUser.id,
    meta: { via: 'seed-admin.mjs' },
  });
  if (auditErr) {
    console.warn('Warning: failed to write audit_log entry:', auditErr.message);
  }

  console.info('SUCCESS: Founder promoted to admin.');
  console.info('Next step: Run `npm run dev:admin`, open http://localhost:3001/login, enter your email, and enroll 2FA.');
}

main().catch((err) => {
  console.error('Unexpected seed error:', err);
  process.exit(1);
});
