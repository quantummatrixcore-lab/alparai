-- =============================================================================
-- Migration: DORA Metrics Collection
-- Table: dora_metrics
-- Features: Unique metric_date, RLS Policies, Rollback Block
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.dora_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE UNIQUE NOT NULL,
    deployment_frequency INT NOT NULL DEFAULT 0,
    lead_time_seconds INT NOT NULL DEFAULT 0,
    change_failure_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    mttr_seconds INT NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dora_metrics_date ON public.dora_metrics(metric_date);

ALTER TABLE public.dora_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read dora_metrics"
    ON public.dora_metrics FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Admin full access dora_metrics"
    ON public.dora_metrics FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- -- ROLLBACK:
-- DROP POLICY IF EXISTS "Admin full access dora_metrics" ON public.dora_metrics;
-- DROP POLICY IF EXISTS "Public read dora_metrics" ON public.dora_metrics;
-- DROP TABLE IF EXISTS public.dora_metrics;
