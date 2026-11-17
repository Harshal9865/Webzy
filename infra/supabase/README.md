# Supabase Infrastructure (Phase 0–4 Ready)

## Setup Order
1. In your Supabase Dashboard -> **SQL Editor**, run these scripts in order:
   - `0001_initial_schema.sql` (23 tables, auto-profile trigger, base RLS)
   - `0002_seed_themes_and_assets.sql` (9 launch themes + asset licence log)
   - `0003_phase3_backend_hardening.sql` (AAL2 admin RLS enforcement, immutable log triggers, rate limiter RPC, private `webzy-media` bucket, anonymous draft claims, high-load indexes)
   - `0004_phase4_payments_and_mock.sql` (`mock_gateway_orders`, monotonic order status guard, over-refund DB guard, and atomic `settle_order_payment_tx` RPC)
2. In **Supabase -> Authentication -> URL Configuration**, add:
   - Site URL: `http://localhost:3000`
   - Additional Redirect URLs: `http://localhost:3000/auth/callback`, `http://localhost:3001/auth/callback`
3. In **Supabase -> Authentication -> Multi-Factor**, make sure **TOTP (App Authenticator)** is enabled so founder admin 2FA works.
4. Fill keys in `.env.local` and run `npm run seed:admin -- your@email.com`.
