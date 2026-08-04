-- ============================================================================
-- 20260701203000_add_incident_expert_fix_fields.sql
--
-- Adds is_expert and expert_fix columns to the incidents table.
-- ============================================================================

alter table public.incidents
  add column is_expert boolean not null default false,
  add column expert_fix text;
