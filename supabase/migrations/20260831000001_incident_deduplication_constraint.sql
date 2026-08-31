-- PRODUCTION SEED
-- Migration: Add deduplication constraint on incidents table
-- Target: Prevent duplicate incident entries for the same AI provider

ALTER TABLE public.incidents
  DROP CONSTRAINT IF EXISTS unique_incident_title_provider;

ALTER TABLE public.incidents
  ADD CONSTRAINT unique_incident_title_provider UNIQUE (title_en, ai_provider_id);
