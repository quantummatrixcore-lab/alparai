-- Migration: Fix import unique constraint
-- Timestamp: 2026-06-28 00:00:03

DROP INDEX IF EXISTS public.incidents_import_ext_id_source_idx;

-- Add a proper unique constraint for upsert conflict target matching
ALTER TABLE public.incidents 
ADD CONSTRAINT incidents_import_source_external_id_key 
UNIQUE (incident_source, import_external_id);
