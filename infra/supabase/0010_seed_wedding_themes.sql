-- Additive Migration: Seed Hindu Wedding Themes (Swarna Vatika & Sindoora Mahal)

INSERT INTO public.themes (id, mode, occasion, languages, price_inr, status) VALUES
  ('wedding-emerald-01', 'ready-made', 'wedding', '["hinglish","hi","en"]'::jsonb, 499, 'active'),
  ('wedding-royal-red-01', 'ready-made', 'wedding', '["hinglish","hi","en"]'::jsonb, 499, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.theme_versions (theme_id, version, field_schema, addons, status) VALUES
  ('wedding-emerald-01', '1.0.0', '["receiverName","senderName","message"]'::jsonb, '["pin","video","extend"]'::jsonb, 'active'),
  ('wedding-royal-red-01', '1.0.0', '["receiverName","senderName","message"]'::jsonb, '["pin","video","extend"]'::jsonb, 'active')
ON CONFLICT (theme_id, version) DO NOTHING;
