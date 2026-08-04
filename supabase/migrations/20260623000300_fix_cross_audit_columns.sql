-- Migration: Fix missing cross-audit columns on incidents table (2026-06-23)
-- Ensures the columns from the cross-audit migration are physically present on the remote database.

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS cross_audit_truth_score integer,
  ADD COLUMN IF NOT EXISTS cross_audit_confidence real,
  ADD COLUMN IF NOT EXISTS cross_audit_reasoning text,
  ADD COLUMN IF NOT EXISTS cross_audit_model text,
  ADD COLUMN IF NOT EXISTS cross_audit_triage_models text[],
  ADD COLUMN IF NOT EXISTS cross_audit_completed_at timestamptz;

-- Also update public.incidents_localized view to include the truth score if needed, 
-- or recreate it since the base table schema changed. We must DROP first because columns changed.
DROP VIEW IF EXISTS public.incidents_localized;

CREATE VIEW public.incidents_localized AS
SELECT
  i.*,
  CASE
    WHEN i.title_tr IS NOT NULL AND length(btrim(i.title_tr)) > 0
    THEN i.title_tr
    ELSE i.title_masked
  END AS title_display,
  CASE
    WHEN i.description_tr IS NOT NULL AND length(btrim(i.description_tr)) > 0
    THEN i.description_tr
    ELSE i.description_masked
  END AS description_display
FROM public.incidents i;
