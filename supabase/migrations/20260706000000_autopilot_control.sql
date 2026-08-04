-- Migration: Add cost tracking columns to autopilot_runs and create autopilot_worker_config table
ALTER TABLE public.autopilot_runs 
  ADD COLUMN cost_cents integer DEFAULT 0,
  ADD COLUMN token_count integer DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.autopilot_worker_config (
  worker_name text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.autopilot_worker_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for autopilot_worker_config
CREATE POLICY "Anyone can view worker configs"
  ON public.autopilot_worker_config FOR SELECT
  USING (true);

CREATE POLICY "Only admins/moderators can modify worker configs"
  ON public.autopilot_worker_config FOR ALL
  USING (public.is_moderator(auth.uid()))
  WITH CHECK (public.is_moderator(auth.uid()));

-- Insert defaults for known workers
INSERT INTO public.autopilot_worker_config (worker_name, enabled)
VALUES 
  ('moderation', true),
  ('news_reply', true),
  ('social_scheduler', true)
ON CONFLICT (worker_name) DO UPDATE SET enabled = EXCLUDED.enabled;

-- ROLLBACK:
-- ALTER TABLE public.autopilot_runs DROP COLUMN IF EXISTS cost_cents;
-- ALTER TABLE public.autopilot_runs DROP COLUMN IF EXISTS token_count;
-- DROP TABLE IF EXISTS public.autopilot_worker_config CASCADE;
