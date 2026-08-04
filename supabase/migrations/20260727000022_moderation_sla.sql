-- Migration: Moderation SLA View
-- Timestamp: 20260727000022
-- Rollback: DROP VIEW IF EXISTS public.moderation_sla;

CREATE OR REPLACE VIEW public.moderation_sla AS
SELECT
  id,
  title_masked,
  created_at,
  reviewed_at,
  status,
  EXTRACT(EPOCH FROM (reviewed_at - created_at)) / 3600 AS triage_duration_hours,
  CASE
    WHEN reviewed_at IS NOT NULL AND (reviewed_at - created_at) <= interval '4 hours' THEN true
    WHEN reviewed_at IS NOT NULL THEN false
    ELSE NULL
  END AS sla_met
FROM public.incidents;
