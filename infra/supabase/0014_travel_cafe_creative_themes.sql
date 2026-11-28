-- Migration 0014: Add 'travel' occasion support and seed travel-voyage-01, cafe-artisan-01, creative-voxel-01
-- Additive-only idempotent migration for Supabase Postgres.

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
    CHECK (occasion IN ('wedding', 'travel', 'birthday', 'love', 'anniversary', 'family', 'festival', 'portfolio', 'business'));
END $$;

INSERT INTO public.themes (id, mode, occasion, languages, price_inr, status) VALUES
  ('travel-voyage-01', 'ready-made', 'travel', '["hinglish","hi","en"]'::jsonb, 99, 'active'),
  ('cafe-artisan-01', 'ready-made', 'business', '["hinglish","hi","en"]'::jsonb, 99, 'active'),
  ('creative-voxel-01', 'ready-made', 'portfolio', '["hinglish","hi","en"]'::jsonb, 99, 'active')
ON CONFLICT (id) DO UPDATE SET
  mode = EXCLUDED.mode,
  occasion = EXCLUDED.occasion,
  languages = EXCLUDED.languages,
  price_inr = EXCLUDED.price_inr,
  status = EXCLUDED.status;

INSERT INTO public.theme_versions (theme_id, version, field_schema, addons, status) VALUES
  ('travel-voyage-01', '1.0.0', '["relation","receiverName","senderName","message","photos","whatsappPhone"]'::jsonb, '["pin","video","extend"]'::jsonb, 'active'),
  ('cafe-artisan-01', '1.0.0', '["relation","receiverName","senderName","message","photos","whatsappPhone"]'::jsonb, '["pin","video","extend"]'::jsonb, 'active'),
  ('creative-voxel-01', '1.0.0', '["relation","receiverName","senderName","message","photos","whatsappPhone"]'::jsonb, '["pin","video","extend"]'::jsonb, 'active')
ON CONFLICT (theme_id, version) DO UPDATE SET
  field_schema = EXCLUDED.field_schema,
  addons = EXCLUDED.addons,
  status = EXCLUDED.status;
