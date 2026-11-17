-- =============================================================================
-- Webzy Migration 0008: Studio and Custom Builds Pipeline & Checklists
-- Idempotent, safe migration for tracking custom website requirements,
-- build checklists, and live delivery links.
-- =============================================================================

-- 1. Ensure business_waitlist exists
CREATE TABLE IF NOT EXISTS public.business_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'custom_business',
  business_name text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'waitlisted',
  checklist jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_url text NOT NULL DEFAULT '',
  live_url text NOT NULL DEFAULT '',
  quote_amount_inr integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure all columns exist on business_waitlist if it was created in migration 0007
ALTER TABLE public.business_waitlist
  ADD COLUMN IF NOT EXISTS checklist jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS preview_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS live_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS quote_amount_inr integer;

-- Update status constraint on business_waitlist safely
ALTER TABLE public.business_waitlist DROP CONSTRAINT IF EXISTS business_waitlist_status_check;
ALTER TABLE public.business_waitlist ADD CONSTRAINT business_waitlist_status_check
  CHECK (status IN ('waitlisted', 'contacted', 'in_progress', 'made', 'converted', 'archived'));

ALTER TABLE public.business_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS business_waitlist_admin_all ON public.business_waitlist;
CREATE POLICY business_waitlist_admin_all ON public.business_waitlist
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. Create custom_requests table (if not exists)
CREATE TABLE IF NOT EXISTS public.custom_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_phone text NOT NULL DEFAULT '',
  occasion text NOT NULL DEFAULT 'other',
  budget_tier text NOT NULL DEFAULT '2999-4999',
  target_date text,
  brief text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  quoted_amount_inr integer,
  admin_notes text NOT NULL DEFAULT '',
  handled_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  checklist jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_url text NOT NULL DEFAULT '',
  live_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure all columns exist if custom_requests existed earlier
ALTER TABLE public.custom_requests
  ADD COLUMN IF NOT EXISTS checklist jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS preview_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS live_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS quoted_amount_inr integer,
  ADD COLUMN IF NOT EXISTS admin_notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS handled_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Update status constraint on custom_requests safely
ALTER TABLE public.custom_requests DROP CONSTRAINT IF EXISTS custom_requests_status_check;
ALTER TABLE public.custom_requests ADD CONSTRAINT custom_requests_status_check
  CHECK (status IN ('new', 'reviewing', 'in_progress', 'quoted', 'accepted', 'made', 'completed', 'declined'));

ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS custom_requests_admin_all ON public.custom_requests;
CREATE POLICY custom_requests_admin_all ON public.custom_requests
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS custom_requests_user_select ON public.custom_requests;
CREATE POLICY custom_requests_user_select ON public.custom_requests
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE INDEX IF NOT EXISTS idx_custom_requests_status_created
  ON public.custom_requests (status, created_at DESC);
