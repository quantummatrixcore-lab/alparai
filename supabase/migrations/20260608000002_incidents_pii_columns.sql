-- ============================================================================
-- 20260608000002_incidents_pii_columns.sql
--
-- The autopilot-wired submitIncident Server Action (src/actions/incidents.ts)
-- writes two columns that were never created on `public.incidents`:
--
--   * contains_pii  (boolean)
--   * pii_categories (text[])
--
-- The PII Guardian (src/lib/pii/guardian.ts) computes these values, and the
-- `evidence` table has had them since 20260605000001_initial_schema.sql.
-- Without this migration, every incident submission throws a 500.
-- ============================================================================

alter table public.incidents
  add column if not exists contains_pii boolean not null default false;

alter table public.incidents
  add column if not exists pii_categories text[] not null default '{}';

create index if not exists idx_incidents_contains_pii
  on public.incidents(contains_pii)
  where contains_pii = true;

create index if not exists idx_incidents_pii_categories
  on public.incidents using gin(pii_categories);

comment on column public.incidents.contains_pii is
  'True if the PII Guardian detected PII in the title or description before insert.';

comment on column public.incidents.pii_categories is
  'Distinct PII category labels detected by the PII Guardian (e.g. {email,phone,id_document}).';
