-- =============================================================================
-- Migration: Feature Flags Backend
-- Table: feature_flags
-- Features: Unique key constraint, RLS Policies, Rollback Block
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT false,
    rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(key);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read feature_flags"
    ON public.feature_flags FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Admin full access feature_flags"
    ON public.feature_flags FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- -- ROLLBACK:
-- DROP POLICY IF EXISTS "Admin full access feature_flags" ON public.feature_flags;
-- DROP POLICY IF EXISTS "Public read feature_flags" ON public.feature_flags;
-- DROP TABLE IF EXISTS public.feature_flags;
