-- ============================================================================
-- 20260623000000_rls_and_column_security.sql
--
-- Security audit remediation:
--   1) Restricts SELECT on public.users to hide the 'email' column from public/anon/authenticated roles.
--   2) Removes the insecure 'Service role can insert audit log' policy (WITH CHECK (true)) on public.audit_log.
--   3) Re-creates incident_votes_mod_all with correct parameters to fix function signature mismatches.
-- ============================================================================

-- 1) Restrict select column privileges on public.users
revoke select on public.users from anon, authenticated;

grant select (
  id,
  username,
  full_name,
  avatar_url,
  bio,
  role,
  is_verified,
  locale,
  created_at,
  updated_at
) on public.users to anon, authenticated;

-- 2) Remove the insert policy on audit_log table
drop policy if exists "Service role can insert audit log" on public.audit_log;

-- 3) Fix is_moderator() parameter count bug on incident_votes
drop policy if exists "incident_votes_mod_all" on public.incident_votes;
create policy "incident_votes_mod_all"
  on public.incident_votes
  for all
  to authenticated
  using (public.is_moderator(auth.uid()))
  with check (public.is_moderator(auth.uid()));
