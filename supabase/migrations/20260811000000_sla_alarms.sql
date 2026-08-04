-- =============================================================================
-- Migration: Unified System Health & SLA Alarms
-- Table: sla_alarms
-- Features: RLS Policies, Indexes, Rollback Block
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.sla_alarms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subsystem TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
    message TEXT NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    resolved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sla_alarms_subsystem ON public.sla_alarms(subsystem);
CREATE INDEX IF NOT EXISTS idx_sla_alarms_resolved ON public.sla_alarms(resolved);

ALTER TABLE public.sla_alarms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access sla_alarms"
    ON public.sla_alarms FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- -- ROLLBACK:
-- DROP POLICY IF EXISTS "Admin full access sla_alarms" ON public.sla_alarms;
-- DROP TABLE IF EXISTS public.sla_alarms;
