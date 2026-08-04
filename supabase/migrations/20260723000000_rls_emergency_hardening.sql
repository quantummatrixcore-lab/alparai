-- Migration: 20260723000000_rls_emergency_hardening.sql
-- Item 160 (P0) — RLS Emergency Hardening Pass

-- (a) Incidents moderation bypass fix
DROP POLICY IF EXISTS "Authenticated users can submit incidents" ON public.incidents;
CREATE POLICY "Authenticated users can submit incidents"
  ON public.incidents FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL AND status = 'pending_review');

-- (b) Subscriptions anon full-access fix
DROP POLICY IF EXISTS "Service role can modify subscriptions" ON public.subscriptions;

-- (c) Social accounts / marketing drafts public full-access fix
DROP POLICY IF EXISTS "Service role full access social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Service role full access marketing drafts" ON public.marketing_drafts;

-- (d) Newsletter subscribers IDOR fix
DROP POLICY IF EXISTS "self_update_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can update newsletter subscribers"
  ON public.newsletter_subscribers FOR UPDATE
  USING (public.is_moderator(auth.uid()));

-- ROLLBACK:
-- DROP POLICY IF EXISTS "Authenticated users can submit incidents" ON public.incidents;
-- CREATE POLICY "Authenticated users can submit incidents" ON public.incidents FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);
-- CREATE POLICY "Service role can modify subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() IS NULL);
-- CREATE POLICY "Service role full access social accounts" ON public.social_accounts FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Service role full access marketing drafts" ON public.marketing_drafts FOR ALL USING (true) WITH CHECK (true);
-- DROP POLICY IF EXISTS "Admins can update newsletter subscribers" ON public.newsletter_subscribers;
-- CREATE POLICY "self_update_subscribers" ON public.newsletter_subscribers FOR UPDATE USING ((auth.uid() IS NOT NULL) OR false) WITH CHECK (auth.uid() IS NOT NULL);
