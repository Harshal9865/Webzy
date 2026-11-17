-- =============================================================================
-- Webzy Migration 0004: Phase 4 Payments, Mock Gateway, Monotonic Transitions,
-- Atomic Order Settlement RPC, Invoices, Email Deduplication & Refunds
-- =============================================================================

-- 1. PERSISTENT MOCK GATEWAY STATE (so closed tabs + Watchdog work across serverless calls)
CREATE TABLE IF NOT EXISTS public.mock_gateway_orders (
  provider_order_id text PRIMARY KEY,
  internal_order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount_paise integer NOT NULL CHECK (amount_paise > 0),
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
  provider_payment_id text,
  provider_refund_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mock_gateway_orders ENABLE ROW LEVEL SECURITY;

-- 2. EXTEND ORDERS WITH BUYER SNAPSHOT & RECEIPT EMAIL DEDUP TIMESTAMP
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS buyer_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS buyer_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS buyer_phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS unpublished_alert_sent_at timestamptz;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS amount_paise integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.payment_events
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'failed', 'ignored'));

ALTER TABLE public.refunds
  ADD COLUMN IF NOT EXISTS provider_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS processed_at timestamptz;

-- 3. MONOTONIC ORDER STATUS GUARD (never move captured/published orders backwards)
CREATE OR REPLACE FUNCTION public.guard_order_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  -- Terminal states cannot move backwards
  IF OLD.status IN ('refunded', 'cancelled') THEN
    RAISE EXCEPTION 'Cannot transition terminal order status from % to %', OLD.status, NEW.status;
  END IF;

  -- Settled / live orders can never revert to pre-settlement states
  IF OLD.status IN ('paid', 'published', 'refund_requested', 'partially_refunded')
     AND NEW.status IN ('draft', 'payment_pending', 'failed') THEN
    RAISE EXCEPTION 'Cannot downgrade settled order from % to %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_status_guard ON public.orders;
CREATE TRIGGER trg_orders_status_guard
  BEFORE UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_order_status_transition();

-- 4. SINGLE-REFUND OVER-REFUND DB GUARD
CREATE OR REPLACE FUNCTION public.guard_refund_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_existing_total integer;
  v_has_pending boolean;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = NEW.order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found for refund.', NEW.order_id;
  END IF;

  SELECT
    COALESCE(SUM(amount_paise) FILTER (WHERE status IN ('pending', 'processed')), 0),
    COALESCE(BOOL_OR(status = 'pending'), false)
  INTO v_existing_total, v_has_pending
  FROM public.refunds
  WHERE order_id = NEW.order_id;

  IF v_has_pending THEN
    RAISE EXCEPTION 'A refund is already pending for order %.', NEW.order_id;
  END IF;

  IF v_existing_total + NEW.amount_paise > v_order.amount_paise THEN
    RAISE EXCEPTION 'Refund total exceeds original order amount.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_refunds_guard_insert ON public.refunds;
CREATE TRIGGER trg_refunds_guard_insert
  BEFORE INSERT ON public.refunds
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_refund_insert();

-- 5. ATOMIC ORDER SETTLEMENT + PUBLISH + INVOICE RPC (shared by verify, webhook & watchdog)
CREATE OR REPLACE FUNCTION public.settle_order_payment_tx(
  p_order_id uuid,
  p_provider_payment_id text,
  p_event_id text,
  p_amount_paise integer,
  p_raw_event jsonb,
  p_slug text,
  p_fy text,
  p_validity_days integer DEFAULT 30,
  p_auto_publish boolean DEFAULT true
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
    now() + make_interval(days => GREATEST(1, p_validity_days)),
    v_order.addons_json,
    now(),
    now() + interval '24 hours'
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
