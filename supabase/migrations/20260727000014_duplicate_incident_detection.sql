-- Migration: Enable pg_trgm, add is_possible_duplicate column, and create similarity function
-- Description: Enables fuzzy string matching for checking duplicate incident submissions.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add duplicate flag column to incidents
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS is_possible_duplicate BOOLEAN NOT NULL DEFAULT false;

-- Create trgm GIN index on title to support fast similarity queries
CREATE INDEX IF NOT EXISTS idx_incidents_title_trgm ON public.incidents USING gin (title gin_trgm_ops);

-- Create a helper function for similarity checking (RPC-safe)
CREATE OR REPLACE FUNCTION public.check_incident_duplicate(title_to_check TEXT)
RETURNS TABLE (similarity_score REAL, incident_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        similarity(title, title_to_check) as similarity_score,
        id as incident_id
    FROM public.incidents
    WHERE status = 'published'
    ORDER BY similarity_score DESC
    LIMIT 1;
END;
$$;

-- ROLLBACK:
-- DROP FUNCTION IF EXISTS public.check_incident_duplicate(TEXT);
-- DROP INDEX IF EXISTS public.idx_incidents_title_trgm;
-- ALTER TABLE public.incidents DROP COLUMN IF EXISTS is_possible_duplicate;
