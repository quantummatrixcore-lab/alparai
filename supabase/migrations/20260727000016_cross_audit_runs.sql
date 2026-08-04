-- Migration: Create cross_audit_runs table for cost telemetry and monitoring.
-- Description: Tracks LLM usage stats per cross-audit debate execution.

CREATE TABLE IF NOT EXISTS public.cross_audit_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    tokens_in INTEGER NOT NULL DEFAULT 0,
    tokens_out INTEGER NOT NULL DEFAULT 0,
    cost_usd NUMERIC(10,5) NOT NULL DEFAULT 0.0,
    latency_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.cross_audit_runs ENABLE ROW LEVEL SECURITY;

-- Read/Write policies
CREATE POLICY "Allow public read access to cross_audit_runs" ON public.cross_audit_runs
    FOR SELECT USING (true);

CREATE POLICY "Allow mod all access to cross_audit_runs" ON public.cross_audit_runs
    FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));

-- Create indexes on created_at and incident_id for performance
CREATE INDEX IF NOT EXISTS idx_cross_audit_runs_created_at ON public.cross_audit_runs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cross_audit_runs_incident_id ON public.cross_audit_runs (incident_id);

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.cross_audit_runs;
