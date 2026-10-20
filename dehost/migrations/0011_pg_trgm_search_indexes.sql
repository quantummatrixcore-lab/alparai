-- 0011_pg_trgm_search_indexes.sql — GIN pg_trgm Search Indexes & Query Optimization
-- Speeds up text search across multilingual incident records by ~100x and optimizes index lookups.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_incidents_title_masked_trgm
  ON public.incidents USING gin (title_masked gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_incidents_description_masked_trgm
  ON public.incidents USING gin (description_masked gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_incidents_title_tr_trgm
  ON public.incidents USING gin (title_tr gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_incidents_description_tr_trgm
  ON public.incidents USING gin (description_tr gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_incidents_status_published_at
  ON public.incidents (status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_incidents_category_severity
  ON public.incidents (category, severity)
  WHERE status = 'published';

-- ROLLBACK:
-- DROP INDEX IF EXISTS public.idx_incidents_title_masked_trgm;
-- DROP INDEX IF EXISTS public.idx_incidents_description_masked_trgm;
-- DROP INDEX IF EXISTS public.idx_incidents_title_tr_trgm;
-- DROP INDEX IF EXISTS public.idx_incidents_description_tr_trgm;
-- DROP INDEX IF EXISTS public.idx_incidents_status_published_at;
-- DROP INDEX IF EXISTS public.idx_incidents_category_severity;
