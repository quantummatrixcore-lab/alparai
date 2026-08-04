-- Add moderation details to public.incidents
ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS ai_moderation_score integer,
  ADD COLUMN IF NOT EXISTS ai_moderation_reason text;

-- Register ALPAR Autopilot as a verified provider
INSERT INTO public.ai_providers (name, slug, description, is_verified, website_url)
VALUES ('ALPAR Autopilot', 'alpar-autopilot', 'Internal AI moderation and automation system', true, 'https://alparai.com')
ON CONFLICT (slug) DO NOTHING;
