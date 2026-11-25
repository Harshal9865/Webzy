-- Webzy Phase 2 Initial Postgres Schema + Strict RLS (Section 15)
-- Run in Supabase SQL Editor or via `supabase db push`.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper: returns true only when the authenticated user has role = 'admin'
-- Defined cleanly after profiles table exists (see below).

-- 1. PROFILES (extends Supabase auth.users; zero card/UPI details ever stored)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_banned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND is_banned = false
  );
$$;

-- Prevent regular users from escalating their own role via REST insert/update
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.role IS DISTINCT FROM 'user' AND auth.role() = 'authenticated' AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Only administrators can assign admin role.';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role AND auth.role() = 'authenticated' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can change profile role.';
  END IF;
  IF NEW.is_banned IS DISTINCT FROM OLD.is_banned AND auth.role() = 'authenticated' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can change ban status.';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_role_guard ON public.profiles;
CREATE TRIGGER trg_profiles_role_guard
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_escalation();

-- Backfill any pre-existing auth.users rows safely
INSERT INTO public.profiles (id, email)
SELECT id, COALESCE(email, '')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Automatically create a profile row when a new user signs up via Magic Link
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. THEMES & THEME_VERSIONS
CREATE TABLE IF NOT EXISTS public.themes (
  id text PRIMARY KEY,
  mode text NOT NULL CHECK (mode IN ('ready-made', 'semi-custom')),
  occasion text NOT NULL,
  languages jsonb NOT NULL DEFAULT '["hinglish","hi","en"]'::jsonb,
  price_inr integer NOT NULL CHECK (price_inr >= 49),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'retired', 'seasonal_archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.theme_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id text NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  version text NOT NULL,
  field_schema jsonb NOT NULL,
  addons jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (theme_id, version)
);

-- 3. DRAFTS
CREATE TABLE IF NOT EXISTS public.drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_version_id uuid NOT NULL REFERENCES public.theme_versions(id),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  draft_token text NOT NULL UNIQUE,
  content_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  language text NOT NULL DEFAULT 'hinglish',
  contact text NOT NULL DEFAULT '',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. COUPONS & REFERRALS
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  rules_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  credit_paise integer NOT NULL DEFAULT 2000,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. ORDERS, PAYMENTS, PAYMENT_EVENTS, REFUNDS, INVOICES
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  draft_id uuid REFERENCES public.drafts(id),
  amount_paise integer NOT NULL CHECK (amount_paise >= 0),
  currency text NOT NULL DEFAULT 'INR',
  coupon_id uuid REFERENCES public.coupons(id),
  status text NOT NULL DEFAULT 'payment_pending' CHECK (
    status IN (
      'draft',
      'payment_pending',
      'paid',
      'published',
      'failed',
      'refund_requested',
      'refunded',
      'partially_refunded',
      'cancelled'
    )
  ),
  provider text NOT NULL CHECK (provider IN ('mock', 'razorpay')),
  provider_order_id text UNIQUE,
  content_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  theme_version_id uuid REFERENCES public.theme_versions(id),
  fee_estimate_paise integer NOT NULL DEFAULT 0,
  invoice_no text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consent_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  policy text NOT NULL,
  version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider_payment_id text NOT NULL UNIQUE,
  status text NOT NULL,
  raw_event jsonb NOT NULL DEFAULT '{}'::jsonb,
  event_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider IN ('mock', 'razorpay')),
  event_id text NOT NULL UNIQUE,
  type text NOT NULL,
  raw_body text NOT NULL,
  signature_ok boolean NOT NULL DEFAULT false,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount_paise integer NOT NULL CHECK (amount_paise > 0),
  reason text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  provider_refund_id text,
  status text NOT NULL DEFAULT 'pending',
  decided_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  number text NOT NULL UNIQUE,
  pdf_key text NOT NULL DEFAULT '',
  is_test boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. SITES, ASSETS, SITE_EVENTS
CREATE TABLE IF NOT EXISTS public.sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (char_length(slug) >= 10),
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  theme_version_id uuid NOT NULL REFERENCES public.theme_versions(id),
  content_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'live' CHECK (status IN ('scheduled', 'live', 'hidden', 'expired', 'removed')),
  reveal_at timestamptz,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  pin_hash text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  hidden boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type text NOT NULL,
  storage_key text NOT NULL,
  size_bytes integer NOT NULL DEFAULT 0,
  checksum text NOT NULL DEFAULT '',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('open', 'reply', 'report')),
  at timestamptz NOT NULL DEFAULT now(),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. REQUEST-ONLY CUSTOM WORKFLOW (requests, quotes, meetings)
CREATE TABLE IF NOT EXISTS public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  contact text NOT NULL,
  brief text NOT NULL,
  budget_range text NOT NULL,
  deadline text NOT NULL DEFAULT '',
  channel text NOT NULL CHECK (channel IN ('email', 'call')),
  status text NOT NULL DEFAULT 'received',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  amount_paise integer NOT NULL CHECK (amount_paise > 0),
  scope text NOT NULL,
  advance_status text NOT NULL DEFAULT 'pending',
  revisions_used integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  start_at timestamptz NOT NULL,
  link text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. MODERATION, JOBS, AUDIT, ASSET LOGS
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'removed', 'restored')),
  decided_by uuid REFERENCES public.profiles(id),
  device_hash text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.moderation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  who uuid REFERENCES public.profiles(id),
  what text NOT NULL,
  why text NOT NULL,
  when_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  attempts integer NOT NULL DEFAULT 0,
  run_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text NOT NULL DEFAULT '',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.asset_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  source text NOT NULL,
  licence text NOT NULL,
  logged_date date NOT NULL DEFAULT CURRENT_DATE,
  licence_link text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- ENABLE ROW LEVEL SECURITY ON EVERY TABLE
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_log ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- RLS POLICIES (Least privilege: own rows or verified admin)
-- =========================================================

-- Profiles: users read & update ONLY their own row; admins read all
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- Consent log: immutable append for authenticated user on their own user_id; admin read all
DROP POLICY IF EXISTS consent_log_select_own ON public.consent_log;
CREATE POLICY consent_log_select_own ON public.consent_log
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS consent_log_insert_own ON public.consent_log;
CREATE POLICY consent_log_insert_own ON public.consent_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Themes & theme_versions: public read active themes; admin full manage
DROP POLICY IF EXISTS themes_public_read ON public.themes;
CREATE POLICY themes_public_read ON public.themes
  FOR SELECT USING (status = 'active' OR public.is_admin());

DROP POLICY IF EXISTS themes_admin_all ON public.themes;
CREATE POLICY themes_admin_all ON public.themes
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS theme_versions_public_read ON public.theme_versions;
CREATE POLICY theme_versions_public_read ON public.theme_versions
  FOR SELECT USING (status = 'active' OR public.is_admin());

DROP POLICY IF EXISTS theme_versions_admin_all ON public.theme_versions;
CREATE POLICY theme_versions_admin_all ON public.theme_versions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Drafts: owner or admin read/write (anonymous draftToken flows go through server service_role routes)
DROP POLICY IF EXISTS drafts_owner_all ON public.drafts;
CREATE POLICY drafts_owner_all ON public.drafts
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Orders, Payments, Refunds, Invoices: owner read; server/admin manage
DROP POLICY IF EXISTS orders_select_own ON public.orders;
CREATE POLICY orders_select_own ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS payments_select_own ON public.payments;
CREATE POLICY payments_select_own ON public.payments
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS refunds_select_own ON public.refunds;
CREATE POLICY refunds_select_own ON public.refunds
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS invoices_select_own ON public.invoices;
CREATE POLICY invoices_select_own ON public.invoices
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- Sites & Assets: owner read/edit; public /s/[slug] reads via scoped server route using service_role
DROP POLICY IF EXISTS sites_owner_select ON public.sites;
CREATE POLICY sites_owner_select ON public.sites
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS sites_owner_update ON public.sites;
CREATE POLICY sites_owner_update ON public.sites
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS assets_owner_select ON public.assets;
CREATE POLICY assets_owner_select ON public.assets
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS site_events_owner_select ON public.site_events;
CREATE POLICY site_events_owner_select ON public.site_events
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.sites s WHERE s.id = site_id AND s.user_id = auth.uid()
    )
  );

-- Referrals & Requests: owner read; admin manage
DROP POLICY IF EXISTS referrals_owner_select ON public.referrals;
CREATE POLICY referrals_owner_select ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_user_id OR public.is_admin());

DROP POLICY IF EXISTS requests_owner_select ON public.requests;
CREATE POLICY requests_owner_select ON public.requests
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS quotes_owner_select ON public.quotes;
CREATE POLICY quotes_owner_select ON public.quotes
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.requests r WHERE r.id = request_id AND r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS meetings_owner_select ON public.meetings;
CREATE POLICY meetings_owner_select ON public.meetings
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.requests r WHERE r.id = request_id AND r.user_id = auth.uid()
    )
  );

-- Internal/admin-only tables (service_role bypasses RLS; authenticated users blocked unless is_admin)
DROP POLICY IF EXISTS coupons_admin_all ON public.coupons;
CREATE POLICY coupons_admin_all ON public.coupons
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS payment_events_admin_select ON public.payment_events;
CREATE POLICY payment_events_admin_select ON public.payment_events
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS reports_admin_all ON public.reports;
CREATE POLICY reports_admin_all ON public.reports
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS moderation_log_admin_all ON public.moderation_log;
CREATE POLICY moderation_log_admin_all ON public.moderation_log
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS jobs_admin_select ON public.jobs;
CREATE POLICY jobs_admin_select ON public.jobs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS audit_log_admin_select ON public.audit_log;
CREATE POLICY audit_log_admin_select ON public.audit_log
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS asset_log_admin_all ON public.asset_log;
CREATE POLICY asset_log_admin_all ON public.asset_log
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
