-- =============================================================================
-- Migration: GEO Engine Optimization Infrastructure
-- Tables: geo_citations, geo_scores
-- Features: RLS Policies, 30-Day Auto-Prune Function, Rollback Block
-- =============================================================================

-- 1. Create geo_citations table
CREATE TABLE IF NOT EXISTS public.geo_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    ai_engine TEXT NOT NULL,
    query TEXT,
    cited_url TEXT NOT NULL,
    passage_snippet TEXT,
    bot_hit_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create geo_scores table
CREATE TABLE IF NOT EXISTS public.geo_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes for efficiency
CREATE INDEX IF NOT EXISTS idx_geo_citations_incident_id ON public.geo_citations(incident_id);
CREATE INDEX IF NOT EXISTS idx_geo_citations_created_at ON public.geo_citations(created_at);
CREATE INDEX IF NOT EXISTS idx_geo_scores_calculated_at ON public.geo_scores(calculated_at);

-- 4. Enable RLS
ALTER TABLE public.geo_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_scores ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Public read access to scores
CREATE POLICY "Public read geo_scores"
    ON public.geo_scores FOR SELECT
    TO public
    USING (true);

-- Public read access to citations
CREATE POLICY "Public read geo_citations"
    ON public.geo_citations FOR SELECT
    TO public
    USING (true);

-- Admin full access to geo_citations
CREATE POLICY "Admin full access geo_citations"
    ON public.geo_citations FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Admin full access to geo_scores
CREATE POLICY "Admin full access geo_scores"
    ON public.geo_scores FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- 6. Auto-Prune Function (30-day data retention protecting 500MB DB cap)
CREATE OR REPLACE FUNCTION public.prune_old_telemetry()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.geo_citations WHERE created_at < NOW() - INTERVAL '30 days';
    DELETE FROM public.geo_scores WHERE calculated_at < NOW() - INTERVAL '90 days';
END;
$$;

-- -- ROLLBACK:
-- DROP FUNCTION IF EXISTS public.prune_old_telemetry();
-- DROP POLICY IF EXISTS "Admin full access geo_scores" ON public.geo_scores;
-- DROP POLICY IF EXISTS "Admin full access geo_citations" ON public.geo_citations;
-- DROP POLICY IF EXISTS "Public read geo_citations" ON public.geo_citations;
-- DROP POLICY IF EXISTS "Public read geo_scores" ON public.geo_scores;
-- DROP TABLE IF EXISTS public.geo_scores;
-- DROP TABLE IF EXISTS public.geo_citations;
