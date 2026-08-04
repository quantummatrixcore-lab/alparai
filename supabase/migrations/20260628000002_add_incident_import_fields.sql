-- Migration: Add incident import fields
-- Timestamp: 2026-06-28 00:00:02

ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS incident_source text DEFAULT 'user_submitted' CHECK (incident_source IN ('user_submitted', 'aiaaic_import', 'aiid_import', 'news_curated', 'court_record'));
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS import_external_id text;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS import_attribution text;

CREATE UNIQUE INDEX IF NOT EXISTS incidents_import_ext_id_source_idx 
ON public.incidents (incident_source, import_external_id) 
WHERE import_external_id IS NOT NULL;
