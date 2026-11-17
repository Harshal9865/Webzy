-- Phase 2 Seed Data: 9 Launch Themes + Asset Licence Log

INSERT INTO public.themes (id, mode, occasion, languages, price_inr, status) VALUES
  ('birthday-confetti-01', 'ready-made', 'birthday', '["hinglish","hi","en"]'::jsonb, 99, 'active'),
  ('birthday-ashirwad-01', 'ready-made', 'birthday', '["hinglish","hi","en"]'::jsonb, 149, 'active'),
  ('will-you-01', 'ready-made', 'love', '["hinglish","hi","en"]'::jsonb, 99, 'active'),
  ('our-timeline-01', 'ready-made', 'anniversary', '["hinglish","hi","en"]'::jsonb, 199, 'active'),
  ('maan-jao-01', 'ready-made', 'love', '["hinglish","hi","en"]'::jsonb, 49, 'flagged'),
  ('make-them-smile-01', 'ready-made', 'family', '["hinglish","hi","en"]'::jsonb, 99, 'active'),
  ('our-year-01', 'ready-made', 'festival', '["hinglish","hi","en"]'::jsonb, 149, 'active'),
  ('harvest-greeting-01', 'ready-made', 'festival', '["hinglish","hi","en"]'::jsonb, 49, 'active'),
  ('business-greeting-01', 'ready-made', 'business', '["hinglish","hi","en"]'::jsonb, 199, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.theme_versions (theme_id, version, field_schema, addons, status) VALUES
  ('birthday-confetti-01', '1.0.0', '["receiverName","relation","photos","message"]'::jsonb, '["pin","video","extend"]'::jsonb, 'active'),
  ('birthday-ashirwad-01', '1.0.0', '["receiverName","relation","photos","message"]'::jsonb, '["pin","video","extend"]'::jsonb, 'active'),
  ('will-you-01', '1.0.0', '["receiverName","senderName","message"]'::jsonb, '["pin","video","extend"]'::jsonb, 'active'),
  ('our-timeline-01', '1.0.0', '["receiverName","photos","message"]'::jsonb, '["pin","video","extend"]'::jsonb, 'active'),
  ('maan-jao-01', '1.0.0', '["receiverName","message"]'::jsonb, '["pin","extend"]'::jsonb, 'active'),
  ('make-them-smile-01', '1.0.0', '["receiverName","message"]'::jsonb, '["pin","extend"]'::jsonb, 'active'),
  ('our-year-01', '1.0.0', '["receiverName","message"]'::jsonb, '["pin","video","extend"]'::jsonb, 'active'),
  ('harvest-greeting-01', '1.0.0', '["receiverName","relation","message"]'::jsonb, '["extend"]'::jsonb, 'active'),
  ('business-greeting-01', '1.0.0', '["receiverName","message","whatsappPhone"]'::jsonb, '["extend"]'::jsonb, 'active')
ON CONFLICT (theme_id, version) DO NOTHING;

INSERT INTO public.asset_log (name, source, licence, licence_link) VALUES
  ('Fraunces Font', 'Google Fonts', 'SIL Open Font License 1.1', 'https://scripts.sil.org/OFL'),
  ('Plus Jakarta Sans Font', 'Google Fonts', 'SIL Open Font License 1.1', 'https://scripts.sil.org/OFL'),
  ('Noto Sans Devanagari Font', 'Google Fonts', 'SIL Open Font License 1.1', 'https://scripts.sil.org/OFL'),
  ('Tap-to-Open Gift Vector & Web Audio Chime', 'Original Webzy Code', 'Proprietary Webzy', '')
ON CONFLICT (name) DO NOTHING;
