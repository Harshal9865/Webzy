-- =============================================================================
-- Webzy Migration 0012: Lifetime Hosting (Ready-Made Only), Soft-Delete Grace,
-- Custom Order Capacity Controls & Scalability Partial Indexes
-- Strictly additive migration (safe on live Supabase databases).
-- =============================================================================

-- 1. Add lifetime & soft-delete grace columns to public.sites
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS is_lifetime boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS delete_grace_until timestamptz;

-- 2. Allow NULL expires_at for lifetime ready-made sites
ALTER TABLE public.sites
  ALTER COLUMN expires_at DROP NOT NULL;

-- 3. Update settle_order_payment_tx to accept p_is_lifetime boolean DEFAULT false
DROP FUNCTION IF EXISTS public.settle_order_payment_tx(
  uuid, text, text, integer, jsonb, text, text, integer, boolean
);

CREATE OR REPLACE FUNCTION public.settle_order_payment_tx(
  p_order_id uuid,
  p_provider_payment_id text,
  p_event_id text,
  p_amount_paise integer,
  p_raw_event jsonb,
  p_slug text,
  p_fy text,
  p_validity_days integer DEFAULT 30,
  p_auto_publish boolean DEFAULT true,
  p_is_lifetime boolean DEFAULT false
)
RETURNS TABLE(
  already_settled boolean,
  order_status text,
  site_slug text,
  invoice_no text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_existing_site public.sites%ROWTYPE;
  v_invoice public.invoices%ROWTYPE;
  v_reveal_at timestamptz;
  v_tz text := 'Asia/Kolkata';
  v_site_status text := 'live';
  v_is_lifetime boolean := false;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found.', p_order_id;
  END IF;

  IF p_amount_paise IS NOT NULL AND p_amount_paise <> v_order.amount_paise THEN
    RAISE EXCEPTION 'Amount mismatch: expected %, got %', v_order.amount_paise, p_amount_paise;
  END IF;

  IF p_provider_payment_id IS NOT NULL AND p_provider_payment_id <> '' THEN
    INSERT INTO public.payments (order_id, provider_payment_id, status, amount_paise, raw_event, event_id)
    VALUES (v_order.id, p_provider_payment_id, 'captured', v_order.amount_paise, COALESCE(p_raw_event, '{}'::jsonb), COALESCE(p_event_id, 'direct'))
    ON CONFLICT (provider_payment_id) DO NOTHING;
  END IF;

  -- If already published, return idempotently immediately
  SELECT * INTO v_existing_site FROM public.sites WHERE order_id = v_order.id;
  IF v_order.status = 'published' AND FOUND THEN
    RETURN QUERY SELECT true, v_order.status, v_existing_site.slug, COALESCE(v_order.invoice_no, '');
    RETURN;
  END IF;

  -- Do not resurrect refunded or cancelled orders
  IF v_order.status IN ('refunded', 'cancelled', 'refund_requested', 'partially_refunded') THEN
    RETURN QUERY SELECT true, v_order.status, COALESCE(v_existing_site.slug, ''), COALESCE(v_order.invoice_no, '');
    RETURN;
  END IF;

  -- Transition draft / payment_pending / failed -> paid
  IF v_order.status IN ('draft', 'payment_pending', 'failed') THEN
    UPDATE public.orders
    SET status = 'paid',
        paid_at = COALESCE(paid_at, now())
    WHERE id = v_order.id;
  END IF;

  -- Issue atomic sequential invoice
  SELECT * INTO v_invoice FROM public.issue_invoice_for_order(v_order.id, v_order.is_test, p_fy);

  IF NOT p_auto_publish THEN
    RETURN QUERY SELECT false, 'paid'::text, ''::text, v_invoice.number;
    RETURN;
  END IF;

  -- Inherit scheduled reveal if draft had one
  IF v_order.draft_id IS NOT NULL THEN
    SELECT d.reveal_at, COALESCE(d.timezone, 'Asia/Kolkata')
    INTO v_reveal_at, v_tz
    FROM public.drafts d
    WHERE d.id = v_order.draft_id;
  END IF;

  IF v_reveal_at IS NOT NULL AND v_reveal_at > now() THEN
    v_site_status := 'scheduled';
  END IF;

  v_is_lifetime := COALESCE(p_is_lifetime, false)
    OR COALESCE(v_order.pricing_breakdown->>'isLifetime', 'false') = 'true';

  INSERT INTO public.sites (
    slug,
    order_id,
    user_id,
    theme_version_id,
    content_json,
    status,
    reveal_at,
    timezone,
    expires_at,
    is_lifetime,
    addons_json,
    published_at,
    free_edit_until
  )
  VALUES (
    p_slug,
    v_order.id,
    v_order.user_id,
    v_order.theme_version_id,
    v_order.content_snapshot,
    v_site_status,
    v_reveal_at,
    v_tz,
    CASE
      WHEN v_is_lifetime THEN NULL
      ELSE now() + make_interval(days => GREATEST(1, p_validity_days))
    END,
    v_is_lifetime,
    v_order.addons_json,
    now(),
    now() + interval '48 hours'
  )
  ON CONFLICT (order_id) DO NOTHING;

  SELECT * INTO v_existing_site FROM public.sites WHERE order_id = v_order.id;

  -- Attach draft assets onto the published site cleanly
  IF v_order.draft_id IS NOT NULL AND FOUND THEN
    UPDATE public.assets
    SET site_id = v_existing_site.id,
        user_id = v_order.user_id
    WHERE draft_id = v_order.draft_id
      AND site_id IS NULL
      AND deleted_at IS NULL;
  END IF;

  UPDATE public.orders
  SET status = 'published',
      published_at = COALESCE(published_at, now())
  WHERE id = v_order.id;

  RETURN QUERY SELECT false, 'published'::text, v_existing_site.slug, v_invoice.number;
END;
$$;

REVOKE ALL ON FUNCTION public.settle_order_payment_tx(
  uuid, text, text, integer, jsonb, text, text, integer, boolean, boolean
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.settle_order_payment_tx(
  uuid, text, text, integer, jsonb, text, text, integer, boolean, boolean
) TO service_role;

-- 4. Update public.get_admin_order_metrics() with lifetime add-on tracking
DROP FUNCTION IF EXISTS public.get_admin_order_metrics();

CREATE OR REPLACE FUNCTION public.get_admin_order_metrics()
RETURNS TABLE(
  live_revenue_paise bigint,
  test_revenue_paise bigint,
  live_paid_orders_count bigint,
  test_paid_orders_count bigint,
  refunded_live_paise bigint,
  refunded_live_count bigint,
  live_gateway_fee_paise bigint,
  test_gateway_fee_paise bigint,
  live_pin_count bigint,
  live_video_count bigint,
  live_extend_count bigint,
  live_extend_14d_count bigint,
  live_extend_21d_count bigint,
  live_lifetime_count bigint,
  live_orders_with_addons bigint,
  test_pin_count bigint,
  test_video_count bigint,
  test_extend_count bigint,
  test_extend_14d_count bigint,
  test_extend_21d_count bigint,
  test_lifetime_count bigint,
  test_orders_with_addons bigint,
  live_paying_customers bigint,
  total_paying_customers bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH order_flags AS (
    SELECT
      o.id,
      o.user_id,
      o.status,
      o.amount_paise,
      o.is_test,
      CASE
        WHEN o.fee_estimate_paise > 0 THEN o.fee_estimate_paise::bigint
        ELSE ROUND(o.amount_paise * 0.0236)::bigint
      END AS fee_paise,
      (
        (jsonb_typeof(o.addons_json) = 'array' AND (o.addons_json ? 'pin' OR o.addons_json ? 'secretPin'))
        OR (jsonb_typeof(o.addons_json) = 'object' AND (
          COALESCE((o.addons_json->>'pin')::boolean, false)
          OR COALESCE((o.addons_json->>'secretPin')::boolean, false)
        ))
      ) AS has_pin,
      (
        (jsonb_typeof(o.addons_json) = 'array' AND (o.addons_json ? 'video' OR o.addons_json ? 'videoCard'))
        OR (jsonb_typeof(o.addons_json) = 'object' AND (
          COALESCE((o.addons_json->>'video')::boolean, false)
          OR COALESCE((o.addons_json->>'videoCard')::boolean, false)
        ))
      ) AS has_video,
      (
        (jsonb_typeof(o.addons_json) = 'array' AND o.addons_json ? 'extend_14d')
        OR (jsonb_typeof(o.addons_json) = 'object' AND COALESCE((o.addons_json->>'extend14d')::boolean, false))
      ) AS has_extend_14d,
      (
        (jsonb_typeof(o.addons_json) = 'array' AND o.addons_json ? 'extend_21d')
        OR (jsonb_typeof(o.addons_json) = 'object' AND COALESCE((o.addons_json->>'extend21d')::boolean, false))
      ) AS has_extend_21d,
      (
        (jsonb_typeof(o.addons_json) = 'array' AND o.addons_json ? 'lifetime')
        OR (jsonb_typeof(o.addons_json) = 'object' AND COALESCE((o.addons_json->>'lifetime')::boolean, false))
      ) AS has_lifetime,
      (
        (jsonb_typeof(o.addons_json) = 'array' AND (
          o.addons_json ? 'extend'
          OR o.addons_json ? 'extendValidity90d'
          OR o.addons_json ? 'extend_14d'
          OR o.addons_json ? 'extend_21d'
          OR o.addons_json ? 'lifetime'
        ))
        OR (jsonb_typeof(o.addons_json) = 'object' AND (
          COALESCE((o.addons_json->>'extend')::boolean, false)
          OR COALESCE((o.addons_json->>'extendValidity90d')::boolean, false)
          OR COALESCE((o.addons_json->>'extend14d')::boolean, false)
          OR COALESCE((o.addons_json->>'extend21d')::boolean, false)
          OR COALESCE((o.addons_json->>'lifetime')::boolean, false)
        ))
      ) AS has_extend
    FROM public.orders o
    WHERE o.deleted_at IS NULL
  )
  SELECT
    COALESCE(SUM(amount_paise) FILTER (WHERE status IN ('paid', 'published') AND NOT is_test), 0)::bigint AS live_revenue_paise,
    COALESCE(SUM(amount_paise) FILTER (WHERE status IN ('paid', 'published') AND is_test), 0)::bigint AS test_revenue_paise,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND NOT is_test)::bigint AS live_paid_orders_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND is_test)::bigint AS test_paid_orders_count,
    COALESCE(SUM(amount_paise) FILTER (WHERE status IN ('refunded', 'partially_refunded') AND NOT is_test), 0)::bigint AS refunded_live_paise,
    COUNT(*) FILTER (WHERE status IN ('refunded', 'partially_refunded') AND NOT is_test)::bigint AS refunded_live_count,
    COALESCE(SUM(fee_paise) FILTER (WHERE status IN ('paid', 'published') AND NOT is_test), 0)::bigint AS live_gateway_fee_paise,
    COALESCE(SUM(fee_paise) FILTER (WHERE status IN ('paid', 'published') AND is_test), 0)::bigint AS test_gateway_fee_paise,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND NOT is_test AND has_pin)::bigint AS live_pin_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND NOT is_test AND has_video)::bigint AS live_video_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND NOT is_test AND has_extend)::bigint AS live_extend_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND NOT is_test AND has_extend_14d)::bigint AS live_extend_14d_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND NOT is_test AND has_extend_21d)::bigint AS live_extend_21d_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND NOT is_test AND has_lifetime)::bigint AS live_lifetime_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND NOT is_test AND (has_pin OR has_video OR has_extend))::bigint AS live_orders_with_addons,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND is_test AND has_pin)::bigint AS test_pin_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND is_test AND has_video)::bigint AS test_video_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND is_test AND has_extend)::bigint AS test_extend_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND is_test AND has_extend_14d)::bigint AS test_extend_14d_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND is_test AND has_extend_21d)::bigint AS test_extend_21d_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND is_test AND has_lifetime)::bigint AS test_lifetime_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND is_test AND (has_pin OR has_video OR has_extend))::bigint AS test_orders_with_addons,
    COUNT(DISTINCT user_id) FILTER (WHERE status IN ('paid', 'published') AND NOT is_test)::bigint AS live_paying_customers,
    COUNT(DISTINCT user_id) FILTER (WHERE status IN ('paid', 'published'))::bigint AS total_paying_customers
  FROM order_flags;
$$;

REVOKE ALL ON FUNCTION public.get_admin_order_metrics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_order_metrics() TO service_role;

-- 4b. Allow Wedding custom commission tiers alongside standard Studio budget tiers
ALTER TABLE public.custom_requests DROP CONSTRAINT IF EXISTS custom_requests_budget_tier_check;
ALTER TABLE public.custom_requests ADD CONSTRAINT custom_requests_budget_tier_check
  CHECK (budget_tier IN ('1999', '3499', '5999', '2999-4999', '5000-9999', '10000+'));

-- 5. Platform Capacity & Operational Settings Table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id text PRIMARY KEY DEFAULT 'global' CHECK (id = 'global'),
  custom_wedding_paused boolean NOT NULL DEFAULT false,
  custom_wedding_limit integer NOT NULL DEFAULT 3 CHECK (custom_wedding_limit >= 0 AND custom_wedding_limit <= 100),
  custom_studio_paused boolean NOT NULL DEFAULT false,
  custom_studio_limit integer NOT NULL DEFAULT 5 CHECK (custom_studio_limit >= 0 AND custom_studio_limit <= 100),
  capacity_message text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

INSERT INTO public.platform_settings (id)
VALUES ('global')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS platform_settings_admin_select ON public.platform_settings;
CREATE POLICY platform_settings_admin_select ON public.platform_settings
  FOR SELECT USING (public.is_admin());

-- 6. Scalability Partial Indexes
CREATE INDEX IF NOT EXISTS idx_sites_delete_grace_purge
  ON public.sites (delete_grace_until ASC)
  WHERE deleted_at IS NOT NULL AND status <> 'removed';

CREATE INDEX IF NOT EXISTS idx_sites_live_expiry_sweep
  ON public.sites (expires_at ASC)
  WHERE status = 'live' AND deleted_at IS NULL AND is_lifetime = false AND expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_created_active
  ON public.orders (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_custom_requests_status_occasion
  ON public.custom_requests (status, occasion, created_at DESC);
