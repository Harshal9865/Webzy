-- =============================================================================
-- Webzy Migration 0011: Security, Scalability Indexes, Atomic Wedding RSVP
-- Append RPC & Server-Side Admin Order Metrics Aggregation RPC
-- Strictly additive: zero destructive statements.
-- =============================================================================

-- 1. HOT-PATH PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_assets_site_active
  ON public.assets (site_id, created_at ASC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sites_user_created_active
  ON public.sites (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_site_events_site_created
  ON public.site_events (site_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_draft_id
  ON public.orders (draft_id);

-- 2. ATOMIC WEDDING RSVP APPEND RPC (prevents concurrent lost updates on content_json)
CREATE OR REPLACE FUNCTION public.append_wedding_rsvp(
  p_site_id uuid,
  p_entry jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_content jsonb;
  v_prev jsonb;
  v_combined jsonb;
  v_next jsonb;
  v_len integer;
BEGIN
  IF p_site_id IS NULL OR p_entry IS NULL THEN
    RETURN false;
  END IF;

  SELECT content_json
  INTO v_content
  FROM public.sites
  WHERE id = p_site_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  v_content := COALESCE(v_content, '{}'::jsonb);
  v_prev := CASE
    WHEN jsonb_typeof(v_content -> 'rsvpResponses') = 'array'
      THEN v_content -> 'rsvpResponses'
    ELSE '[]'::jsonb
  END;

  v_combined := v_prev || jsonb_build_array(p_entry);
  v_len := jsonb_array_length(v_combined);

  IF v_len > 500 THEN
    SELECT COALESCE(jsonb_agg(elem ORDER BY ord), '[]'::jsonb)
    INTO v_next
    FROM jsonb_array_elements(v_combined) WITH ORDINALITY AS t(elem, ord)
    WHERE ord > v_len - 500;
  ELSE
    v_next := v_combined;
  END IF;

  UPDATE public.sites
  SET content_json = jsonb_set(v_content, '{rsvpResponses}', v_next, true),
      updated_at = now()
  WHERE id = p_site_id
    AND deleted_at IS NULL;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.append_wedding_rsvp(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.append_wedding_rsvp(uuid, jsonb) TO service_role;

-- 3. ADMIN ORDER METRICS AGGREGATION RPC (avoids scanning thousands of rows in JS)
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
  live_orders_with_addons bigint,
  test_pin_count bigint,
  test_video_count bigint,
  test_extend_count bigint,
  test_extend_14d_count bigint,
  test_extend_21d_count bigint,
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
      o.amount_paise,
      o.user_id,
      COALESCE(o.is_test, false) AS is_test,
      o.status,
      CASE
        WHEN o.fee_estimate_paise IS NOT NULL AND o.fee_estimate_paise > 0
          THEN o.fee_estimate_paise::bigint
        ELSE ROUND(o.amount_paise * 0.0236)::bigint
      END AS fee_paise,
      (
        (jsonb_typeof(o.addons_json) = 'array' AND (o.addons_json ? 'pin' OR o.addons_json ? 'secretPin'))
        OR (jsonb_typeof(o.addons_json) = 'object' AND (o.addons_json -> 'pin' = 'true'::jsonb OR o.addons_json -> 'secretPin' = 'true'::jsonb))
      ) AS has_pin,
      (
        (jsonb_typeof(o.addons_json) = 'array' AND (o.addons_json ? 'video' OR o.addons_json ? 'videoCard'))
        OR (jsonb_typeof(o.addons_json) = 'object' AND (o.addons_json -> 'video' = 'true'::jsonb OR o.addons_json -> 'videoCard' = 'true'::jsonb))
      ) AS has_video,
      (
        (jsonb_typeof(o.addons_json) = 'array' AND (o.addons_json ? 'extend_14d'))
        OR (jsonb_typeof(o.addons_json) = 'object' AND (o.addons_json -> 'extend_14d' = 'true'::jsonb OR o.addons_json -> 'extend14d' = 'true'::jsonb))
      ) AS has_extend_14d,
      (
        (jsonb_typeof(o.addons_json) = 'array' AND (o.addons_json ? 'extend_21d'))
        OR (jsonb_typeof(o.addons_json) = 'object' AND (o.addons_json -> 'extend_21d' = 'true'::jsonb OR o.addons_json -> 'extend21d' = 'true'::jsonb))
      ) AS has_extend_21d,
      (
        (jsonb_typeof(o.addons_json) = 'array' AND (
          o.addons_json ? 'extend'
          OR o.addons_json ? 'extend_14d'
          OR o.addons_json ? 'extend_21d'
          OR o.addons_json ? 'extendValidity90d'
        ))
        OR (jsonb_typeof(o.addons_json) = 'object' AND (
          o.addons_json -> 'extend' = 'true'::jsonb
          OR o.addons_json -> 'extend_14d' = 'true'::jsonb
          OR o.addons_json -> 'extend_21d' = 'true'::jsonb
          OR o.addons_json -> 'extend14d' = 'true'::jsonb
          OR o.addons_json -> 'extend21d' = 'true'::jsonb
          OR o.addons_json -> 'extendValidity90d' = 'true'::jsonb
        ))
      ) AS has_extend
    FROM public.orders o
    WHERE o.status IN ('paid', 'published', 'refunded', 'partially_refunded')
      AND o.deleted_at IS NULL
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
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND NOT is_test AND (has_pin OR has_video OR has_extend))::bigint AS live_orders_with_addons,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND is_test AND has_pin)::bigint AS test_pin_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND is_test AND has_video)::bigint AS test_video_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND is_test AND has_extend)::bigint AS test_extend_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND is_test AND has_extend_14d)::bigint AS test_extend_14d_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND is_test AND has_extend_21d)::bigint AS test_extend_21d_count,
    COUNT(*) FILTER (WHERE status IN ('paid', 'published') AND is_test AND (has_pin OR has_video OR has_extend))::bigint AS test_orders_with_addons,
    COUNT(DISTINCT user_id) FILTER (WHERE status IN ('paid', 'published') AND NOT is_test AND user_id IS NOT NULL)::bigint AS live_paying_customers,
    COUNT(DISTINCT user_id) FILTER (WHERE status IN ('paid', 'published') AND user_id IS NOT NULL)::bigint AS total_paying_customers
  FROM order_flags;
$$;

REVOKE ALL ON FUNCTION public.get_admin_order_metrics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_order_metrics() TO service_role;
