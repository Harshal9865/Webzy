-- =============================================================================
-- Webzy Migration 0005: Phase 5 Receiver Analytics/Replies + Discounted Launch Prices
-- =============================================================================

-- 1. Lower minimum theme base price constraint to ₹19 for launch discount pricing
ALTER TABLE public.themes DROP CONSTRAINT IF EXISTS themes_price_inr_check;
ALTER TABLE public.themes ADD CONSTRAINT themes_price_inr_check CHECK (price_inr >= 19);

UPDATE public.themes SET price_inr = 49 WHERE id IN ('birthday-confetti-01', 'will-you-01', 'make-them-smile-01');
UPDATE public.themes SET price_inr = 79 WHERE id IN ('birthday-ashirwad-01', 'our-year-01');
UPDATE public.themes SET price_inr = 99 WHERE id IN ('our-timeline-01', 'business-greeting-01');
UPDATE public.themes SET price_inr = 29 WHERE id IN ('maan-jao-01', 'harvest-greeting-01');

-- 2. Add view counter & optional one-time receiver reply on sites
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0 CHECK (views_count >= 0),
  ADD COLUMN IF NOT EXISTS reply_text text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS replied_at timestamptz;
