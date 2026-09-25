-- 0004_provider_attribution.sql — Provider Attribution Engine Schema
-- Adds confidence-gated attribution metadata and review queue flagging to incidents table.

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS attribution_method text,
  ADD COLUMN IF NOT EXISTS attribution_keyword text,
  ADD COLUMN IF NOT EXISTS attribution_confidence real,
  ADD COLUMN IF NOT EXISTS needs_provider_review boolean DEFAULT false NOT NULL;

CREATE INDEX IF NOT EXISTS idx_incidents_needs_provider_review
  ON public.incidents (needs_provider_review)
  WHERE needs_provider_review = true;

CREATE INDEX IF NOT EXISTS idx_incidents_attribution_method
  ON public.incidents (attribution_method);

-- ROLLBACK:
-- ALTER TABLE public.incidents
--   DROP COLUMN IF EXISTS attribution_method,
--   DROP COLUMN IF EXISTS attribution_keyword,
--   DROP COLUMN IF EXISTS attribution_confidence,
--   DROP COLUMN IF EXISTS needs_provider_review;
-- DROP INDEX IF EXISTS idx_incidents_needs_provider_review;
-- DROP INDEX IF EXISTS idx_incidents_attribution_method;