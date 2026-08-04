-- Migration: External Auditor Role
-- Timestamp: 20260727000025
-- Rollback: DROP ROLE IF EXISTS auditor_role;

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'auditor_role') THEN
    CREATE ROLE auditor_role;
  END IF;
END
$$;

GRANT SELECT ON public.k_model_scores TO auditor_role;
GRANT SELECT ON public.methodology_versions TO auditor_role;
GRANT SELECT ON public.audit_log TO auditor_role;

-- RLS policies for auditor_role
DROP POLICY IF EXISTS "Allow auditor_role read access to k_model_scores" ON public.k_model_scores;
CREATE POLICY "Allow auditor_role read access to k_model_scores" ON public.k_model_scores
  FOR SELECT TO auditor_role USING (true);

DROP POLICY IF EXISTS "Allow auditor_role read access to methodology_versions" ON public.methodology_versions;
CREATE POLICY "Allow auditor_role read access to methodology_versions" ON public.methodology_versions
  FOR SELECT TO auditor_role USING (true);

DROP POLICY IF EXISTS "Allow auditor_role read access to audit_log" ON public.audit_log;
CREATE POLICY "Allow auditor_role read access to audit_log" ON public.audit_log
  FOR SELECT TO auditor_role USING (true);
