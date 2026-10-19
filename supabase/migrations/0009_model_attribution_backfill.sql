-- =============================================================================
-- 0009_model_attribution_backfill.sql — Model Attribution Index & Audit Trail
-- Purpose: Enable the "Data Moat" backfill engine (scripts/model-attribution-backfill.ts)
--          and make every attribution decision auditable and reversible.
-- Generated: 2026-10-19T00:00:00.000Z
-- Safe for zero prod writes, idempotent, gated by information_schema.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Attribution audit columns (idempotent, only if missing)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'attribution_method'
    ) THEN
      ALTER TABLE public.incidents ADD COLUMN attribution_method text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'attribution_keyword'
    ) THEN
      ALTER TABLE public.incidents ADD COLUMN attribution_keyword text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'attribution_confidence'
    ) THEN
      ALTER TABLE public.incidents ADD COLUMN attribution_confidence numeric(4,3);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'needs_provider_review'
    ) THEN
      ALTER TABLE public.incidents ADD COLUMN needs_provider_review boolean NOT NULL DEFAULT false;
    END IF;

  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. Partial index: the backfill engine's hot path.
--    "incidents that still have no provider" is the exact query the
--    backfill scans; without this index it is a sequential scan over 3k+ rows.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_incidents_unattributed') THEN
      CREATE INDEX IF NOT EXISTS idx_incidents_unattributed
        ON public.incidents (created_at ASC)
        WHERE ai_provider_id IS NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_incidents_needs_provider_review') THEN
      CREATE INDEX IF NOT EXISTS idx_incidents_needs_provider_review
        ON public.incidents (created_at DESC)
        WHERE needs_provider_review = true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_incidents_provider_attribution') THEN
      CREATE INDEX IF NOT EXISTS idx_incidents_provider_attribution
        ON public.incidents (ai_provider_id, created_at DESC)
        WHERE ai_provider_id IS NOT NULL;
    END IF;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. TrustScore coverage view.
--    Exposes the actual actuarial coverage of the registry so the "Data Moat"
--    claim is measured, never asserted.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.incident_attribution_coverage AS
SELECT
  COUNT(*)::int                                                   AS total_incidents,
  COUNT(*) FILTER (WHERE ai_provider_id IS NOT NULL)::int        AS attributed_incidents,
  COUNT(*) FILTER (WHERE ai_provider_id IS NULL)::int            AS unattributed_incidents,
  COUNT(*) FILTER (WHERE attribution_method = 'alias')::int      AS alias_resolved,
  COUNT(*) FILTER (WHERE attribution_method = 'model')::int      AS model_resolved,
  COUNT(*) FILTER (WHERE attribution_method = 'human')::int       AS human_resolved,
  COUNT(*) FILTER (WHERE needs_provider_review = true)::int       AS pending_review,
  ROUND(
    (
      COUNT(*) FILTER (WHERE ai_provider_id IS NOT NULL)::numeric
      / NULLIF(COUNT(*), 0)
    ) * 100,
    2
  )                                                               AS attribution_coverage_pct
FROM public.incidents;

COMMENT ON VIEW public.incident_attribution_coverage IS
  'Registry attribution coverage. Feeds the actuarial TrustScore engine input set. '
  'An unattributed incident contributes zero penalty to any provider TrustScore.';
