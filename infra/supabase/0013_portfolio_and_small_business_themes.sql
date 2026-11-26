-- Migration 0013: Add 'portfolio' occasion support and seed portfolio-01 & small-business-01 themes
-- Idempotent migration for Supabase Postgres.

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.themes'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%occasion%'
  LOOP
    EXECUTE format('ALTER TABLE public.themes DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;

  ALTER TABLE public.themes
    ADD CONSTRAINT themes_occasion_check
    CHECK (occasion IN ('wedding', 'birthday', 'love', 'anniversary', 'family', 'festival', 'portfolio', 'business'));
END $$;

INSERT INTO public.themes (id, mode, occasion, languages, price_inr, status) VALUES
  ('portfolio-01', 'ready-made', 'portfolio', '["hinglish","hi","en"]'::jsonb, 79, 'active'),
  ('small-business-01', 'ready-made', 'business', '["hinglish","hi","en"]'::jsonb, 79, 'active')
ON CONFLICT (id) DO UPDATE SET
  mode = EXCLUDED.mode,
  occasion = EXCLUDED.occasion,
  languages = EXCLUDED.languages,
  price_inr = EXCLUDED.price_inr,
  status = EXCLUDED.status;

INSERT INTO public.theme_versions (theme_id, version, field_schema, addons, status) VALUES
  ('portfolio-01', '1.0.0', '["relation","receiverName","senderName","message","photos","whatsappPhone"]'::jsonb, '["pin","video","extend"]'::jsonb, 'active'),
  ('small-business-01', '1.0.0', '["relation","receiverName","senderName","message","photos","whatsappPhone"]'::jsonb, '["pin","video","extend"]'::jsonb, 'active')
ON CONFLICT (theme_id, version) DO UPDATE SET
  field_schema = EXCLUDED.field_schema,
  addons = EXCLUDED.addons,
  status = EXCLUDED.status;
