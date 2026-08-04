-- Migration: Add EU AI Act Compliance Columns to incidents table (2026-06-29)

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS eu_act_transparency_score integer,
  ADD COLUMN IF NOT EXISTS eu_act_non_discrimination_score integer,
  ADD COLUMN IF NOT EXISTS eu_act_data_privacy_score integer,
  ADD COLUMN IF NOT EXISTS eu_act_risk_category text;

COMMENT ON COLUMN public.incidents.eu_act_transparency_score IS
  'Transparency compliance score (0-100) under EU AI Act.';
COMMENT ON COLUMN public.incidents.eu_act_non_discrimination_score IS
  'Non-discrimination/bias compliance score (0-100) under EU AI Act.';
COMMENT ON COLUMN public.incidents.eu_act_data_privacy_score IS
  'Data privacy compliance score (0-100) under EU AI Act.';
COMMENT ON COLUMN public.incidents.eu_act_risk_category IS
  'Risk categorization under EU AI Act (Minimal, Specific Transparency, High Risk, Unacceptable Risk).';

-- Recreate incidents_localized view to include new columns
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
