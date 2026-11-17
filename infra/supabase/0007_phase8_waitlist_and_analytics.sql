-- =============================================================================
-- Webzy Migration 0007: Phase 8 Business Waitlist & Admin Funnel Analytics Indexes
-- Additive-only migration (safe for zero-downtime live deployments).
-- =============================================================================

-- 1. Business & Custom Scratch Studio Waitlist (Opening in 15 Days)
CREATE TABLE IF NOT EXISTS public.business_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  category text NOT NULL CHECK (
    category IN ('coaching', 'medical', 'ecommerce', 'custom_business')
  ),
  business_name text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'waitlisted' CHECK (
    status IN ('waitlisted', 'contacted', 'converted')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

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

DROP TRIGGER IF EXISTS trg_business_waitlist_updated_at ON public.business_waitlist;
CREATE TRIGGER trg_business_waitlist_updated_at
  BEFORE UPDATE ON public.business_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.business_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS business_waitlist_admin_all ON public.business_waitlist;
CREATE POLICY business_waitlist_admin_all ON public.business_waitlist
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Prevent duplicate waitlist spam per email+category while keeping lookup fast
CREATE UNIQUE INDEX IF NOT EXISTS uq_business_waitlist_email_cat
  ON public.business_waitlist (lower(email), category);

CREATE INDEX IF NOT EXISTS idx_business_waitlist_status_created
  ON public.business_waitlist (status, created_at DESC);

-- 2. Admin Funnel & Directory Query Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_created_desc ON public.profiles (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_created_desc ON public.drafts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_status ON public.orders (created_at DESC, status);
