-- Migration: Add processing_stage column to public.incidents and grant select permissions
ALTER TABLE public.incidents ADD COLUMN processing_stage text NOT NULL DEFAULT 'complete';
ALTER TABLE public.incidents ALTER COLUMN processing_stage SET DEFAULT 'queued';

-- Grant select privilege on the new column to anon and authenticated roles
GRANT SELECT (processing_stage) ON public.incidents TO anon, authenticated;

-- ROLLBACK:
-- ALTER TABLE public.incidents DROP COLUMN IF EXISTS processing_stage;
