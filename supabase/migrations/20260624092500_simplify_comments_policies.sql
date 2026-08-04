-- Simplify incident_comments RLS policies
DROP POLICY IF EXISTS "comments_insert_own" ON public.incident_comments;
CREATE POLICY "comments_insert_own"
  ON public.incident_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "comments_delete_own" ON public.incident_comments;
CREATE POLICY "comments_delete_own"
  ON public.incident_comments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR public.is_moderator(auth.uid()));

DROP POLICY IF EXISTS "comments_update_own" ON public.incident_comments;
CREATE POLICY "comments_update_own"
  ON public.incident_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Simplify incident_affected_users RLS policies
DROP POLICY IF EXISTS "affected_insert_own" ON public.incident_affected_users;
CREATE POLICY "affected_insert_own"
  ON public.incident_affected_users
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "affected_delete_own" ON public.incident_affected_users;
CREATE POLICY "affected_delete_own"
  ON public.incident_affected_users
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
