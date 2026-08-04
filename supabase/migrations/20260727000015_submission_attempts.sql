-- Migration: Create submission_attempts table for rate limiting and fraud prevention
-- Description: Tracks submissions per IP hash over a rolling 24-hour window.

CREATE TABLE IF NOT EXISTS public.submission_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.submission_attempts ENABLE ROW LEVEL SECURITY;

-- Read/Write policies
CREATE POLICY "Allow mod all access to submission_attempts" ON public.submission_attempts
    FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));

CREATE POLICY "Allow public insert to submission_attempts" ON public.submission_attempts
    FOR INSERT WITH CHECK (true);

-- Create index on ip_hash and created_at to optimize rolling 24h count queries
CREATE INDEX IF NOT EXISTS idx_submission_attempts_ip_hash_created_at ON public.submission_attempts (ip_hash, created_at DESC);

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.submission_attempts;
