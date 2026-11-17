-- =============================================================================
-- Webzy Migration 0006: Phase 6 Custom Requests, Takedowns & Moderation Indexes
-- =============================================================================

-- 1. Custom & Semi-Custom Requests (stored briefs & admin quotes)
CREATE TABLE IF NOT EXISTS public.custom_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_phone text NOT NULL DEFAULT '',
  occasion text NOT NULL CHECK (
    occasion IN ('wedding', 'birthday', 'anniversary', 'family', 'business', 'other')
  ),
  budget_tier text NOT NULL CHECK (
    budget_tier IN ('2999-4999', '5000-9999', '10000+')
  ),
  target_date date,
  brief text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (
    status IN ('new', 'reviewing', 'quoted', 'accepted', 'declined', 'completed')
  ),
  quoted_amount_inr integer CHECK (quoted_amount_inr IS NULL OR quoted_amount_inr >= 999),
  admin_notes text NOT NULL DEFAULT '',
  handled_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_custom_requests_updated_at ON public.custom_requests;
CREATE TRIGGER trg_custom_requests_updated_at
  BEFORE UPDATE ON public.custom_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS custom_requests_select_own ON public.custom_requests;
CREATE POLICY custom_requests_select_own ON public.custom_requests
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS custom_requests_admin_update ON public.custom_requests;
CREATE POLICY custom_requests_admin_update ON public.custom_requests
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. Formal Takedown & Copyright Notices (from /takedown form)
CREATE TABLE IF NOT EXISTS public.takedown_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_slug text NOT NULL DEFAULT '',
  site_id uuid REFERENCES public.sites(id) ON DELETE SET NULL,
  reporter_name text NOT NULL,
  reporter_email text NOT NULL,
  category text NOT NULL CHECK (
    category IN ('copyright', 'privacy', 'impersonation', 'harassment', 'scam', 'other')
  ),
  details text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'hidden_site', 'removed_site', 'dismissed')
  ),
  decided_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolution_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_takedown_requests_updated_at ON public.takedown_requests;
CREATE TRIGGER trg_takedown_requests_updated_at
  BEFORE UPDATE ON public.takedown_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.takedown_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS takedown_requests_admin_all ON public.takedown_requests;
CREATE POLICY takedown_requests_admin_all ON public.takedown_requests
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Phase 6 Admin Queue Indexes
CREATE INDEX IF NOT EXISTS idx_reports_status_created ON public.reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_requests_status_created ON public.custom_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_takedown_requests_status_created ON public.takedown_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sites_moderation_status ON public.sites (status, hidden, created_at DESC);
