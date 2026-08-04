-- =============================================================================
-- Harden Audit Log RLS (v1.0.1)
-- =============================================================================
-- Revokes the public insert policy on public.audit_log.
-- Since the service role bypasses RLS, it does not require a policy to insert.
-- Removing this policy prevents anyone else (anon/authenticated users) from
-- writing directly to the audit log.
-- =============================================================================

DROP POLICY IF EXISTS "Service role can insert audit log" ON public.audit_log;

-- -- ROLLBACK:
-- CREATE POLICY "Service role can insert audit log"
--   ON public.audit_log FOR INSERT WITH CHECK (true);
