-- Migration: Add EU AI Act Serious Incident Reporting Columns (2026-07-04)

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS eu_act_serious_incident_class text,
  ADD COLUMN IF NOT EXISTS eu_act_high_risk_system_category text,
  ADD COLUMN IF NOT EXISTS eu_act_reporting_deadline_days integer;

COMMENT ON COLUMN public.incidents.eu_act_serious_incident_class IS
  'Class of serious incident (death/health, critical-infrastructure, fundamental-rights, property-environment).';
COMMENT ON COLUMN public.incidents.eu_act_high_risk_system_category IS
  'High-risk AI system classification matching Annex III.';
COMMENT ON COLUMN public.incidents.eu_act_reporting_deadline_days IS
  'Reporting deadline under Article 73 (2, 10, or 15 days).';
