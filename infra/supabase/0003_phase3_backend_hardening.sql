-- =============================================================================
-- Webzy Migration 0003: Backend Security, Concurrency, High-Load & Phase 3 Prep
-- Applies non-breaking hardening on top of 0001_initial_schema.sql & 0002.
-- =============================================================================

-- 1. HARDEN admin RLS check to require verified 2FA (AAL2) AND not banned
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(auth.jwt()->>'aal', 'aal1') = 'aal2'
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
        AND is_banned = false
    );
$$;

-- Lock profile email & ban flags against non-admin client edits
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text := COALESCE(auth.jwt()->>'role', '');
BEGIN
  IF jwt_role <> 'service_role' AND NOT public.is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.role IS DISTINCT FROM 'user' OR NEW.is_banned IS DISTINCT FROM false THEN
        RAISE EXCEPTION 'Unauthorized profile privilege assignment.';
      END IF;
      RETURN NEW;
    END IF;

    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Only administrators can change profile role.';
    END IF;
    IF NEW.is_banned IS DISTINCT FROM OLD.is_banned THEN
      RAISE EXCEPTION 'Only administrators can change ban status.';
    END IF;
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Email is managed by Supabase Auth.';
    END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- 2. APPEND-ONLY TRIGGERS FOR LEGAL & AUDIT INTEGRITY
CREATE OR REPLACE FUNCTION public.prevent_log_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Audit, consent, and moderation logs are immutable.';
END;
$$;

DROP TRIGGER IF EXISTS trg_consent_log_immutable ON public.consent_log;
CREATE TRIGGER trg_consent_log_immutable
  BEFORE UPDATE OR DELETE ON public.consent_log
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_log_mutation();

DROP TRIGGER IF EXISTS trg_audit_log_immutable ON public.audit_log;
CREATE TRIGGER trg_audit_log_immutable
  BEFORE UPDATE OR DELETE ON public.audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_log_mutation();

DROP TRIGGER IF EXISTS trg_moderation_log_immutable ON public.moderation_log;
CREATE TRIGGER trg_moderation_log_immutable
  BEFORE UPDATE OR DELETE ON public.moderation_log
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_log_mutation();

-- Preserve consent proof if a profile is deleted under DPDP erasure
ALTER TABLE public.consent_log ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.consent_log DROP CONSTRAINT IF EXISTS consent_log_user_id_fkey;
ALTER TABLE public.consent_log
  ADD CONSTRAINT consent_log_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Drop direct client INSERT on consent_log (now written strictly via server API routes)
DROP POLICY IF EXISTS consent_log_insert_own ON public.consent_log;

-- Restrict moderation_log admin policy to SELECT + INSERT (no UPDATE/DELETE)
DROP POLICY IF EXISTS moderation_log_admin_all ON public.moderation_log;
DROP POLICY IF EXISTS moderation_log_admin_select ON public.moderation_log;
CREATE POLICY moderation_log_admin_select ON public.moderation_log
  FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS moderation_log_admin_insert ON public.moderation_log;
CREATE POLICY moderation_log_admin_insert ON public.moderation_log
  FOR INSERT WITH CHECK (public.is_admin());

-- 3. CLOSE DIRECT RLS WRITE BYPASSES ON SITES & DRAFTS
DROP POLICY IF EXISTS sites_owner_update ON public.sites;
DROP POLICY IF EXISTS drafts_owner_all ON public.drafts;
DROP POLICY IF EXISTS drafts_owner_select ON public.drafts;
CREATE POLICY drafts_owner_select ON public.drafts
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Generic updated_at trigger helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- 4. DISTRIBUTED RATE LIMITING (Serverless high-load safe)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  hits integer NOT NULL DEFAULT 1,
  blocked_until timestamptz
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_key text,
  p_max_hits integer,
  p_window_seconds integer,
  p_block_seconds integer DEFAULT 0
)
RETURNS TABLE(allowed boolean, remaining integer, retry_after_seconds integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_row public.rate_limits%ROWTYPE;
BEGIN
  INSERT INTO public.rate_limits (key, window_started_at, hits, blocked_until)
  VALUES (p_key, v_now, 1, NULL)
  ON CONFLICT (key) DO NOTHING;

  SELECT * INTO v_row FROM public.rate_limits WHERE key = p_key FOR UPDATE;

  IF FOUND AND v_row.blocked_until IS NOT NULL AND v_row.blocked_until > v_now THEN
    RETURN QUERY SELECT
      false,
      0,
      GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_row.blocked_until - v_now)))::integer);
    RETURN;
  END IF;

  -- Reset expired window
  IF v_row.window_started_at + make_interval(secs => p_window_seconds) <= v_now THEN
    UPDATE public.rate_limits
    SET window_started_at = v_now, hits = 1, blocked_until = NULL
    WHERE key = p_key;

    RETURN QUERY SELECT true, GREATEST(0, p_max_hits - 1), 0;
    RETURN;
  END IF;

  -- First insert in this transaction returned hits = 1 already; detect fresh row
  IF v_row.hits = 1 AND v_row.window_started_at = v_now THEN
    RETURN QUERY SELECT true, GREATEST(0, p_max_hits - 1), 0;
    RETURN;
  END IF;

  IF v_row.hits >= p_max_hits THEN
    IF p_block_seconds > 0 THEN
      UPDATE public.rate_limits
      SET blocked_until = v_now + make_interval(secs => p_block_seconds)
      WHERE key = p_key;
    END IF;
    RETURN QUERY SELECT
      false,
      0,
      GREATEST(
        1,
        CEIL(
          EXTRACT(
            EPOCH FROM (
              COALESCE(
                CASE WHEN p_block_seconds > 0 THEN v_now + make_interval(secs => p_block_seconds) ELSE NULL END,
                v_row.window_started_at + make_interval(secs => p_window_seconds)
              ) - v_now
            )
          )
        )::integer
      );
    RETURN;
  END IF;

  UPDATE public.rate_limits
  SET hits = hits + 1
  WHERE key = p_key;

  RETURN QUERY SELECT true, GREATEST(0, p_max_hits - (v_row.hits + 1)), 0;
END;
$$;

-- 5. PHASE 3 DRAFTS, ASSETS & STORAGE HARDENING
ALTER TABLE public.drafts
  ADD COLUMN IF NOT EXISTS theme_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS draft_token_hash text UNIQUE,
  ADD COLUMN IF NOT EXISTS addons_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS music_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reveal_at timestamptz,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  ADD COLUMN IF NOT EXISTS ai_generations_used integer NOT NULL DEFAULT 0 CHECK (ai_generations_used >= 0),
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS converted_order_id uuid REFERENCES public.orders(id);

DROP TRIGGER IF EXISTS trg_drafts_updated_at ON public.drafts;
CREATE TRIGGER trg_drafts_updated_at
  BEFORE UPDATE ON public.drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS draft_id uuid REFERENCES public.drafts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ready' CHECK (status IN ('pending', 'ready', 'orphaned', 'deleted')),
  ADD COLUMN IF NOT EXISTS mime_type text NOT NULL DEFAULT 'image/webp',
  ADD COLUMN IF NOT EXISTS width integer,
  ADD COLUMN IF NOT EXISTS height integer,
  ADD COLUMN IF NOT EXISTS exif_stripped boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assets_storage_key_unique'
  ) THEN
    ALTER TABLE public.assets ADD CONSTRAINT assets_storage_key_unique UNIQUE (storage_key);
  END IF;
END $$;

-- Atomic non-enumerable anonymous draft claim RPC
CREATE OR REPLACE FUNCTION public.claim_anonymous_draft(
  p_token_hash text,
  p_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_draft_id uuid;
BEGIN
  UPDATE public.drafts
  SET user_id = p_user_id,
      claimed_at = now(),
      updated_at = now()
  WHERE draft_token_hash = p_token_hash
    AND user_id IS NULL
    AND deleted_at IS NULL
    AND expires_at > now()
  RETURNING id INTO v_draft_id;

  IF v_draft_id IS NOT NULL THEN
    UPDATE public.assets
    SET user_id = p_user_id
    WHERE draft_id = v_draft_id
      AND user_id IS NULL
      AND deleted_at IS NULL;
  END IF;

  RETURN v_draft_id;
END;
$$;

-- Create Private Supabase Storage Bucket `webzy-media` (service_role access only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'webzy-media',
  'webzy-media',
  false,
  2097152,
  ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- 6. ORDERS, PAYMENTS, INVOICES & JOBS CONCURRENCY PRIMITIVES (Phase 4 Ready)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_key text UNIQUE,
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS subtotal_paise integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_paise integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS addons_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pricing_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS failed_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS legal_hold boolean NOT NULL DEFAULT false;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.invoice_counters (
  scope text PRIMARY KEY,
  last_seq bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invoice_counters ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.issue_invoice_for_order(
  p_order_id uuid,
  p_is_test boolean,
  p_fy text
)
RETURNS public.invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing public.invoices%ROWTYPE;
  v_scope text;
  v_seq bigint;
  v_number text;
  v_created public.invoices%ROWTYPE;
BEGIN
  SELECT * INTO v_existing FROM public.invoices WHERE order_id = p_order_id;
  IF FOUND THEN
    RETURN v_existing;
  END IF;

  PERFORM id FROM public.orders WHERE id = p_order_id FOR UPDATE;
  v_scope := CASE WHEN p_is_test THEN 'test:' ELSE 'live:' END || p_fy;

  INSERT INTO public.invoice_counters (scope, last_seq)
  VALUES (v_scope, 1)
  ON CONFLICT (scope)
  DO UPDATE SET last_seq = public.invoice_counters.last_seq + 1, updated_at = now()
  RETURNING last_seq INTO v_seq;

  v_number := (CASE WHEN p_is_test THEN 'TEST-' ELSE '' END) || 'WEBZY/' || p_fy || '/' || lpad(v_seq::text, 6, '0');

  INSERT INTO public.invoices (order_id, number, is_test)
  VALUES (p_order_id, v_number, p_is_test)
  RETURNING * INTO v_created;

  UPDATE public.orders SET invoice_no = v_number WHERE id = p_order_id;
  RETURN v_created;
END;
$$;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS max_attempts integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS locked_by text,
  ADD COLUMN IF NOT EXISTS locked_at timestamptz,
  ADD COLUMN IF NOT EXISTS lease_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_idempotency
  ON public.jobs (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE OR REPLACE FUNCTION public.claim_jobs(
  p_worker_id text,
  p_limit integer DEFAULT 10,
  p_lease_seconds integer DEFAULT 60
)
RETURNS SETOF public.jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH candidate AS (
    SELECT id
    FROM public.jobs
    WHERE (status = 'pending' AND run_at <= now())
       OR (status = 'running' AND lease_expires_at < now())
    ORDER BY run_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.jobs j
  SET status = 'running',
      locked_by = p_worker_id,
      locked_at = now(),
      lease_expires_at = now() + make_interval(secs => p_lease_seconds),
      attempts = j.attempts + 1,
      updated_at = now()
  FROM candidate c
  WHERE j.id = c.id
  RETURNING j.*;
END;
$$;

-- 7. SITES EDIT WINDOW, PIN LOCKOUT & REPORT DEDUPE (Phase 5 Ready)
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS free_edit_until timestamptz,
  ADD COLUMN IF NOT EXISTS edit_count integer NOT NULL DEFAULT 0 CHECK (edit_count >= 0),
  ADD COLUMN IF NOT EXISTS last_edited_at timestamptz,
  ADD COLUMN IF NOT EXISTS addons_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS first_opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS opened_alert_sent_at timestamptz;

DROP TRIGGER IF EXISTS trg_sites_updated_at ON public.sites;
CREATE TRIGGER trg_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.site_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  revision_no integer NOT NULL,
  edited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  previous_content_json jsonb NOT NULL,
  new_content_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (site_id, revision_no)
);
ALTER TABLE public.site_revisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS site_revisions_owner_select ON public.site_revisions;
CREATE POLICY site_revisions_owner_select ON public.site_revisions
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.sites s WHERE s.id = site_id AND s.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS public.site_pin_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  limiter_key text NOT NULL,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_attempt_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (site_id, limiter_key)
);
ALTER TABLE public.site_pin_attempts ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS uq_reports_site_device
  ON public.reports (site_id, device_hash)
  WHERE device_hash <> '';

-- 8. ALIGN FEATURE-FLAGGED `maan-jao-01` THEME ROW WITH `feature_flag` COLUMN
ALTER TABLE public.themes ADD COLUMN IF NOT EXISTS feature_flag text;
UPDATE public.themes
SET status = 'active', feature_flag = 'maanJaoTheme'
WHERE id = 'maan-jao-01';

-- 9. PERFORMANCE INDEXES FOR HIGH CUSTOMER LOAD
CREATE INDEX IF NOT EXISTS idx_drafts_user_active ON public.drafts (user_id, updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_drafts_expires_at ON public.drafts (expires_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_assets_draft_ready ON public.assets (draft_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON public.orders (user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_pending_watchdog ON public.orders (created_at ASC) WHERE status = 'payment_pending' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_paid_watchdog ON public.orders (paid_at ASC) WHERE status = 'paid' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sites_scheduled_reveal ON public.sites (reveal_at ASC) WHERE status = 'scheduled' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sites_expires_at ON public.sites (expires_at ASC) WHERE status = 'live' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_claim_pending ON public.jobs (run_at ASC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_jobs_running_lease ON public.jobs (lease_expires_at ASC) WHERE status = 'running';
CREATE INDEX IF NOT EXISTS idx_reports_status_created ON public.reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_at ON public.audit_log (at DESC);
