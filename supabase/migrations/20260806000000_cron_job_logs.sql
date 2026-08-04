-- Migration: Create cron_job_logs table for cron monitor database audit trail
-- Description: Tracks execution status, errors, and durations of Next.js cron endpoints.

CREATE TABLE IF NOT EXISTS public.cron_job_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cron_name TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
    error_message TEXT,
    execution_metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;

-- Read policy for Admin
CREATE POLICY "Admin only read" ON public.cron_job_logs 
    FOR SELECT 
    TO authenticated 
    USING (public.is_admin(auth.uid()));

-- Create index on started_at and cron_name for monitoring performance
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_started_at ON public.cron_job_logs (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_cron_name ON public.cron_job_logs (cron_name);

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.cron_job_logs;
