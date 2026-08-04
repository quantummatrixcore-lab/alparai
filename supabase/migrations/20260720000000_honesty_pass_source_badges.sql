-- Honesty Pass: H1 source badge, H2 is_seed flag for incidents
-- Adds source_badge and is_seed to incidents table for transparent seed data labeling

-- ROLLBACK: ALTER TABLE public.incidents DROP COLUMN IF EXISTS is_seed; ALTER TABLE public.incidents DROP COLUMN IF EXISTS source_badge;

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_badge text CHECK (
    source_badge IS NULL OR source_badge IN ('community', 'imported', 'seed', 'expert-verified')
  );

-- Back-fill: mark existing seed incidents based on migration history
-- The bulk seed migrations inserted 400+ incidents programmatically
-- We'll mark those inserted before first organic report (2026-06-24 Grok passport case) as seed
UPDATE public.incidents
  SET is_seed = true,
      source_badge = 'seed'
  WHERE created_at < '2026-06-24 00:00:00+00'
    AND user_id IS NULL;

-- Mark the Grok passport case and post-June incidents as community
UPDATE public.incidents
  SET is_seed = false,
      source_badge = 'community'
  WHERE is_seed = false AND source_badge IS NULL;

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_incidents_is_seed ON public.incidents (is_seed);
CREATE INDEX IF NOT EXISTS idx_incidents_source_badge ON public.incidents (source_badge);

-- RLS: source_badge and is_seed are writable only by moderators/admin
DROP POLICY IF EXISTS "moderators_update_source_badge" ON public.incidents;
CREATE POLICY "moderators_update_source_badge"
  ON public.incidents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role IN ('moderator', 'admin')
    )
  )
  WITH CHECK (true);
