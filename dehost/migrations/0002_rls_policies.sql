-- 0002_rls_policies.sql — DELTA-ONLY (policies absent from prod dump). DROP-first, idempotent.

DROP POLICY IF EXISTS "Admins can manage social accounts" ON public.social_accounts;
CREATE POLICY "Admins can manage social accounts" 
    ON public.social_accounts 
    FOR ALL 
    USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'ceo')));
DROP POLICY IF EXISTS "Admins can manage marketing drafts" ON public.marketing_drafts;
CREATE POLICY "Admins can manage marketing drafts" 
    ON public.marketing_drafts 
    FOR ALL 
    USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'ceo')));
DROP POLICY IF EXISTS "Service role full access social accounts" ON public.social_accounts;
CREATE POLICY "Service role full access social accounts"
    ON public.social_accounts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
DROP POLICY IF EXISTS "Service role full access marketing drafts" ON public.marketing_drafts;
CREATE POLICY "Service role full access marketing drafts"
    ON public.marketing_drafts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
DROP POLICY IF EXISTS "Enable read access for all users on audit_log" ON public.audit_log;
CREATE POLICY "Enable read access for all users on audit_log" ON public.audit_log FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
CREATE POLICY "Public profiles are viewable by everyone"
  on public.users for select using (true);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  on public.users for update using (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users"
  on public.users for all using (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins can view audit log" ON public.audit_log;
CREATE POLICY "Admins can view audit log"
  on public.audit_log for select using (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Service role can insert audit log" ON public.audit_log;
CREATE POLICY "Service role can insert audit log"
  on public.audit_log for insert with check (true);
DROP POLICY IF EXISTS "Authenticated users can upload evidence" ON storage.objects;
CREATE POLICY "Authenticated users can upload evidence"
  on storage.objects for insert
  with check (
    bucket_id = 'evidence'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );
DROP POLICY IF EXISTS "Users can update their own evidence files" ON storage.objects;
CREATE POLICY "Users can update their own evidence files"
  on storage.objects for update
  using (
    bucket_id = 'evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
DROP POLICY IF EXISTS "incident_votes_select_all" ON public.incident_votes;
CREATE POLICY "incident_votes_select_all" on public.incident_votes for select to anon, authenticated using (true);
DROP POLICY IF EXISTS "incident_votes_insert_own" ON public.incident_votes;
CREATE POLICY "incident_votes_insert_own" on public.incident_votes for insert to authenticated with check (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "incident_votes_update_own" ON public.incident_votes;
CREATE POLICY "incident_votes_update_own" on public.incident_votes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "incident_votes_delete_own" ON public.incident_votes;
CREATE POLICY "incident_votes_delete_own" on public.incident_votes for delete to authenticated using (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "incident_votes_mod_all" ON public.incident_votes;
CREATE POLICY "incident_votes_mod_all" on public.incident_votes for all to authenticated using (public.is_moderator()) with check (public.is_moderator());
DROP POLICY IF EXISTS "incident_votes_mod_all" ON public.incident_votes;
CREATE POLICY "incident_votes_mod_all"
  on public.incident_votes
  for all
  to authenticated
  using (public.is_moderator(auth.uid()))
  with check (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "bounties_public_read" ON public.bug_bounties;
CREATE POLICY "bounties_public_read" on public.bug_bounties
  for select using (status in ('validated', 'claimed', 'paid'));
DROP POLICY IF EXISTS "bounties_reporter_read" ON public.bug_bounties;
CREATE POLICY "bounties_reporter_read" on public.bug_bounties
  for select using (reporter_id = auth.uid());
DROP POLICY IF EXISTS "bounties_reporter_insert" ON public.bug_bounties;
CREATE POLICY "bounties_reporter_insert" on public.bug_bounties
  for insert with check (reporter_id = auth.uid());
DROP POLICY IF EXISTS "bounties_mod_update" ON public.bug_bounties;
CREATE POLICY "bounties_mod_update" on public.bug_bounties
  for update using (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "bounty_badges_public_read" ON public.bounty_badges;
CREATE POLICY "bounty_badges_public_read" on public.bounty_badges
  for select using (true);
DROP POLICY IF EXISTS "user_badges_public_read" ON public.user_bounty_badges;
CREATE POLICY "user_badges_public_read" on public.user_bounty_badges
  for select using (true);
DROP POLICY IF EXISTS "user_badges_mod_insert" ON public.user_bounty_badges;
CREATE POLICY "user_badges_mod_insert" on public.user_bounty_badges
  for insert with check (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "model_reviews_select" ON public.model_reviews;
CREATE POLICY "model_reviews_select" on public.model_reviews for select using (true);
DROP POLICY IF EXISTS "model_reviews_insert" ON public.model_reviews;
CREATE POLICY "model_reviews_insert" on public.model_reviews for insert to authenticated with check (user_id = auth.uid());
DROP POLICY IF EXISTS "model_reviews_update" ON public.model_reviews;
CREATE POLICY "model_reviews_update" on public.model_reviews for update to authenticated using (user_id = auth.uid() or public.is_moderator(auth.uid())) with check (user_id = auth.uid() or public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "model_reviews_delete" ON public.model_reviews;
CREATE POLICY "model_reviews_delete" on public.model_reviews for delete to authenticated using (user_id = auth.uid() or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "model_review_votes_select" ON public.model_review_votes;
CREATE POLICY "model_review_votes_select" on public.model_review_votes for select using (true);
DROP POLICY IF EXISTS "model_review_votes_manage" ON public.model_review_votes;
CREATE POLICY "model_review_votes_manage" on public.model_review_votes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
DROP POLICY IF EXISTS "model_feature_requests_select" ON public.model_feature_requests;
CREATE POLICY "model_feature_requests_select" on public.model_feature_requests for select using (true);
DROP POLICY IF EXISTS "model_feature_requests_insert" ON public.model_feature_requests;
CREATE POLICY "model_feature_requests_insert" on public.model_feature_requests for insert to authenticated with check (user_id = auth.uid());
DROP POLICY IF EXISTS "model_feature_requests_update" ON public.model_feature_requests;
CREATE POLICY "model_feature_requests_update" on public.model_feature_requests for update to authenticated using (user_id = auth.uid() or public.is_moderator(auth.uid())) with check (user_id = auth.uid() or public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "model_feature_requests_delete" ON public.model_feature_requests;
CREATE POLICY "model_feature_requests_delete" on public.model_feature_requests for delete to authenticated using (user_id = auth.uid() or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "model_feature_votes_select" ON public.model_feature_votes;
CREATE POLICY "model_feature_votes_select" on public.model_feature_votes for select using (true);
DROP POLICY IF EXISTS "model_feature_votes_manage" ON public.model_feature_votes;
CREATE POLICY "model_feature_votes_manage" on public.model_feature_votes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
DROP POLICY IF EXISTS "public_read_news" ON public.ecosystem_news;
CREATE POLICY "public_read_news"
  on public.ecosystem_news
  for select
  using (is_active = true);
DROP POLICY IF EXISTS "admin_all_news" ON public.ecosystem_news;
CREATE POLICY "admin_all_news"
  on public.ecosystem_news
  for all
  using (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "admin_select_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "admin_select_subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated
  USING (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "public_insert_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "public_insert_subscribers" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "public_update_subscribers" ON public.newsletter_subscribers
  FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "whistleblower_admin_all" ON public.whistleblower_submissions;
CREATE POLICY "whistleblower_admin_all"
  on public.whistleblower_submissions
  for all
  to authenticated
  using (public.is_moderator(auth.uid()))
  with check (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "whistleblower_public_insert" ON public.whistleblower_submissions;
CREATE POLICY "whistleblower_public_insert"
  on public.whistleblower_submissions
  for insert
  with check (true);
DROP POLICY IF EXISTS "blog_posts_select_published" ON public.blog_posts;
CREATE POLICY "blog_posts_select_published"
  on public.blog_posts
  for select
  to anon, authenticated
  using (status = 'published');
DROP POLICY IF EXISTS "blog_posts_admin_all" ON public.blog_posts;
CREATE POLICY "blog_posts_admin_all"
  on public.blog_posts
  for all
  to authenticated
  using (public.is_moderator(auth.uid()))
  with check (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "self_update_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "self_update_subscribers" ON public.newsletter_subscribers
  FOR UPDATE
  USING (
    -- Authenticated kullanıcılar kendi email'lerini güncelleyebilir
    (auth.uid() IS NOT NULL)
    OR
    -- Anonim unsubscribe: sadece unsubscribed_at ve subscribed alanları
    -- (Uygulama katmanında token doğrulaması yapılmalı)
    -- Şimdilik anonim update'i tamamen kapat, sadece server action üzerinden yönet
    false
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
  );
DROP POLICY IF EXISTS "Admins/CEOs can do all on api_keys" ON public.api_keys;
CREATE POLICY "Admins/CEOs can do all on api_keys" ON public.api_keys
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND (users.role = 'admin' OR users.role = 'ceo')
    )
  );
DROP POLICY IF EXISTS "polls_public_select" ON public.ai_polls;
CREATE POLICY "polls_public_select" on public.ai_polls
  for select using (true);
DROP POLICY IF EXISTS "polls_admin_all" ON public.ai_polls;
CREATE POLICY "polls_admin_all" on public.ai_polls
  for all using (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "poll_votes_public_select" ON public.ai_poll_votes;
CREATE POLICY "poll_votes_public_select" on public.ai_poll_votes
  for select using (true);
DROP POLICY IF EXISTS "poll_votes_public_insert" ON public.ai_poll_votes;
CREATE POLICY "poll_votes_public_insert" on public.ai_poll_votes
  for insert with check (
    -- Authenticated user can vote as themselves, or any user can vote anonymously (user_id is null)
    (auth.uid() is null and user_id is null)
    or (auth.uid() is not null and user_id = auth.uid())
  );
DROP POLICY IF EXISTS "poll_votes_owner_delete" ON public.ai_poll_votes;
CREATE POLICY "poll_votes_owner_delete" on public.ai_poll_votes
  for delete using (
    (auth.uid() is not null and user_id = auth.uid())
    or public.is_moderator(auth.uid())
  );
DROP POLICY IF EXISTS "bounty_badges_public_select" ON public.bounty_badges;
CREATE POLICY "bounty_badges_public_select" on public.bounty_badges
  for select using (true);
DROP POLICY IF EXISTS "bounty_badges_admin_all" ON public.bounty_badges;
CREATE POLICY "bounty_badges_admin_all" on public.bounty_badges
  for all using (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "comments_select_all" ON public.incident_comments;
CREATE POLICY "comments_select_all"
  ON public.incident_comments
  FOR SELECT
  TO anon, authenticated
  USING (true);
DROP POLICY IF EXISTS "comments_insert_own" ON public.incident_comments;
CREATE POLICY "comments_insert_own"
  ON public.incident_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "comments_delete_own" ON public.incident_comments;
CREATE POLICY "comments_delete_own"
  ON public.incident_comments
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "comments_update_own" ON public.incident_comments;
CREATE POLICY "comments_update_own"
  ON public.incident_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "affected_select_all" ON public.incident_affected_users;
CREATE POLICY "affected_select_all"
  ON public.incident_affected_users
  FOR SELECT
  TO anon, authenticated
  USING (true);
DROP POLICY IF EXISTS "affected_insert_own" ON public.incident_affected_users;
CREATE POLICY "affected_insert_own"
  ON public.incident_affected_users
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "affected_delete_own" ON public.incident_affected_users;
CREATE POLICY "affected_delete_own"
  ON public.incident_affected_users
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));
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
DROP POLICY IF EXISTS "ceo_admin_advisor_swot_select" ON public.strategy_swot_items;
CREATE POLICY "ceo_admin_advisor_swot_select" ON public.strategy_swot_items
  FOR SELECT TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_advisor(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_swot_modify" ON public.strategy_swot_items;
CREATE POLICY "ceo_admin_swot_modify" ON public.strategy_swot_items
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_advisor_risks_select" ON public.strategy_risks;
CREATE POLICY "ceo_admin_advisor_risks_select" ON public.strategy_risks
  FOR SELECT TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_advisor(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_risks_modify" ON public.strategy_risks;
CREATE POLICY "ceo_admin_risks_modify" ON public.strategy_risks
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_advisor_valuations_select" ON public.strategy_valuations;
CREATE POLICY "ceo_admin_advisor_valuations_select" ON public.strategy_valuations
  FOR SELECT TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_advisor(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_valuations_modify" ON public.strategy_valuations;
CREATE POLICY "ceo_admin_valuations_modify" ON public.strategy_valuations
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_advisor_milestones_select" ON public.strategy_milestones;
CREATE POLICY "ceo_admin_advisor_milestones_select" ON public.strategy_milestones
  FOR SELECT TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_advisor(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_milestones_modify" ON public.strategy_milestones;
CREATE POLICY "ceo_admin_milestones_modify" ON public.strategy_milestones
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_advisor_snapshots_select" ON public.strategy_metrics_snapshots;
CREATE POLICY "ceo_admin_advisor_snapshots_select" ON public.strategy_metrics_snapshots
  FOR SELECT TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_advisor(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_snapshots_modify" ON public.strategy_metrics_snapshots;
CREATE POLICY "ceo_admin_snapshots_modify" ON public.strategy_metrics_snapshots
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_posts_all" ON public.social_posts;
CREATE POLICY "ceo_admin_posts_all" ON public.social_posts
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_assets_all" ON public.social_assets;
CREATE POLICY "ceo_admin_assets_all" ON public.social_assets
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_templates_all" ON public.social_templates;
CREATE POLICY "ceo_admin_templates_all" ON public.social_templates
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can manage their own watches" ON public.user_provider_watches;
CREATE POLICY "Users can manage their own watches" ON public.user_provider_watches
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public read access for social-assets" ON storage.objects;
CREATE POLICY "Public read access for social-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'social-assets');
DROP POLICY IF EXISTS "Authenticated users can upload social-assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload social-assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'social-assets'
    AND auth.uid() IS NOT NULL
  );
DROP POLICY IF EXISTS "Users can update their own social-assets" ON storage.objects;
CREATE POLICY "Users can update their own social-assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'social-assets'
  );
DROP POLICY IF EXISTS "Moderators/Admins can delete social-assets" ON storage.objects;
CREATE POLICY "Moderators/Admins can delete social-assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'social-assets'
    AND (
      public.is_moderator(auth.uid()) 
      OR EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
          AND (users.role = 'admin' OR users.role = 'ceo')
      )
    )
  );
DROP POLICY IF EXISTS "expert_apps_insert_anon" ON public.expert_applications;
CREATE POLICY "expert_apps_insert_anon" ON public.expert_applications
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "expert_apps_mod_select" ON public.expert_applications;
CREATE POLICY "expert_apps_mod_select" ON public.expert_applications
  FOR SELECT USING (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "expert_apps_mod_update" ON public.expert_applications;
CREATE POLICY "expert_apps_mod_update" ON public.expert_applications
  FOR UPDATE USING (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "investor_applications_anon_insert" ON public.investor_applications;
CREATE POLICY "investor_applications_anon_insert" on public.investor_applications
  for insert with check (true);
DROP POLICY IF EXISTS "investor_applications_admin_all" ON public.investor_applications;
CREATE POLICY "investor_applications_admin_all" on public.investor_applications
  for all using (public.is_admin(auth.uid()) or public.is_ceo(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_advisor_todos_select" ON public.strategy_todos;
CREATE POLICY "ceo_admin_advisor_todos_select" ON public.strategy_todos FOR SELECT TO authenticated USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_advisor(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_todos_modify" ON public.strategy_todos;
CREATE POLICY "ceo_admin_todos_modify" ON public.strategy_todos FOR ALL TO authenticated USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid())) WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_external_queue_select" ON public.external_incidents_queue;
CREATE POLICY "ceo_admin_external_queue_select" ON public.external_incidents_queue FOR SELECT TO authenticated USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_external_queue_modify" ON public.external_incidents_queue;
CREATE POLICY "ceo_admin_external_queue_modify" ON public.external_incidents_queue FOR ALL TO authenticated USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid())) WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_innovations_select" ON public.strategy_innovations;
CREATE POLICY "ceo_admin_innovations_select" ON public.strategy_innovations FOR SELECT TO authenticated USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "ceo_admin_innovations_modify" ON public.strategy_innovations;
CREATE POLICY "ceo_admin_innovations_modify" ON public.strategy_innovations FOR ALL TO authenticated USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid())) WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Service role access" ON public.provider_response_tokens;
CREATE POLICY "Service role access" ON public.provider_response_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can view worker configs" ON public.autopilot_worker_config;
CREATE POLICY "Anyone can view worker configs"
  ON public.autopilot_worker_config FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Only admins/moderators can modify worker configs" ON public.autopilot_worker_config;
CREATE POLICY "Only admins/moderators can modify worker configs"
  ON public.autopilot_worker_config FOR ALL
  USING (public.is_moderator(auth.uid()))
  WITH CHECK (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "users_own_email_preferences" ON public.email_preferences;
CREATE POLICY "users_own_email_preferences"
  ON public.email_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "admins_manage_email_sent_logs" ON public.email_sent_logs;
CREATE POLICY "admins_manage_email_sent_logs"
  ON public.email_sent_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'ceo')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'ceo')
    )
  );
DROP POLICY IF EXISTS "strategy_state_support_select" ON public.strategy_state_support;
CREATE POLICY "strategy_state_support_select" ON public.strategy_state_support
  FOR SELECT TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_advisor(auth.uid()));
DROP POLICY IF EXISTS "strategy_state_support_modify" ON public.strategy_state_support;
CREATE POLICY "strategy_state_support_modify" ON public.strategy_state_support
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "finance_monthly_costs_access" ON public.finance_monthly_costs;
CREATE POLICY "finance_monthly_costs_access" ON public.finance_monthly_costs
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "finance_api_usage_access" ON public.finance_api_usage;
CREATE POLICY "finance_api_usage_access" ON public.finance_api_usage
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can view their own cookie consents" ON public.cookie_consent_log;
CREATE POLICY "Users can view their own cookie consents"
  on public.cookie_consent_log for select
  using (auth.uid()::text = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Anyone can insert cookie consent" ON public.cookie_consent_log;
CREATE POLICY "Anyone can insert cookie consent"
  on public.cookie_consent_log for insert
  with check (true);
DROP POLICY IF EXISTS "Users can view their own age declarations" ON public.age_declarations;
CREATE POLICY "Users can view their own age declarations"
  on public.age_declarations for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Anyone can insert age declaration" ON public.age_declarations;
CREATE POLICY "Anyone can insert age declaration"
  on public.age_declarations for insert
  with check (true);
DROP POLICY IF EXISTS "public_insert_email_preferences" ON public.email_preferences;
CREATE POLICY "public_insert_email_preferences"
  ON public.email_preferences
  FOR INSERT
  WITH CHECK (true);
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
    FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin can select strategic_runs" ON strategic_runs;
CREATE POLICY "Admin can select strategic_runs"
  ON strategic_runs FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Admin can insert strategic_runs" ON strategic_runs;
CREATE POLICY "Admin can insert strategic_runs"
  ON strategic_runs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Admin can update strategic_runs" ON strategic_runs;
CREATE POLICY "Admin can update strategic_runs"
  ON strategic_runs FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Admin can select strategic_answers" ON strategic_answers;
CREATE POLICY "Admin can select strategic_answers"
  ON strategic_answers FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Admin can insert strategic_answers" ON strategic_answers;
CREATE POLICY "Admin can insert strategic_answers"
  ON strategic_answers FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "moderators_update_source_badge" ON public.incidents;
CREATE POLICY "moderators_update_source_badge"
  ON public.incidents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role IN ('moderator', 'admin')
    )
  )
  WITH CHECK (true);
DROP POLICY IF EXISTS "Advisory board members read access" ON public.advisory_board_members;
CREATE POLICY "Advisory board members read access" ON public.advisory_board_members
  FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Advisory board members write access" ON public.advisory_board_members;
CREATE POLICY "Advisory board members write access" ON public.advisory_board_members
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Allow public read access to k_categories" ON public.k_categories;
CREATE POLICY "Allow public read access to k_categories" ON public.k_categories
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read access to k_model_scores" ON public.k_model_scores;
CREATE POLICY "Allow public read access to k_model_scores" ON public.k_model_scores
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow mod all access to k_categories" ON public.k_categories;
CREATE POLICY "Allow mod all access to k_categories" ON public.k_categories
    FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Allow mod all access to k_model_scores" ON public.k_model_scores;
CREATE POLICY "Allow mod all access to k_model_scores" ON public.k_model_scores
    FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Admins can update newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can update newsletter subscribers"
  ON public.newsletter_subscribers FOR UPDATE
  USING (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Service role can modify subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can modify subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() IS NULL);
DROP POLICY IF EXISTS "Service role full access social accounts" ON public.social_accounts;
CREATE POLICY "Service role full access social accounts" ON public.social_accounts FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role full access marketing drafts" ON public.marketing_drafts;
CREATE POLICY "Service role full access marketing drafts" ON public.marketing_drafts FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "self_update_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "self_update_subscribers" ON public.newsletter_subscribers FOR UPDATE USING ((auth.uid() IS NOT NULL) OR false) WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Public read slopsquatting_reports" ON public.slopsquatting_reports;
CREATE POLICY "Public read slopsquatting_reports"
  ON public.slopsquatting_reports FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Service role insert slopsquatting_reports" ON public.slopsquatting_reports;
CREATE POLICY "Service role insert slopsquatting_reports"
  ON public.slopsquatting_reports FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admin full access slopsquatting_reports" ON public.slopsquatting_reports;
CREATE POLICY "Admin full access slopsquatting_reports"
  ON public.slopsquatting_reports FOR ALL
  USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Public read vertical_playbooks" ON public.vertical_playbooks;
CREATE POLICY "Public read vertical_playbooks"
  ON public.vertical_playbooks FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Admin full access vertical_playbooks" ON public.vertical_playbooks;
CREATE POLICY "Admin full access vertical_playbooks"
  ON public.vertical_playbooks FOR ALL
  USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Public read jailbreak_samples" ON public.jailbreak_samples;
CREATE POLICY "Public read jailbreak_samples"
  ON public.jailbreak_samples FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Admin full access jailbreak_samples" ON public.jailbreak_samples;
CREATE POLICY "Admin full access jailbreak_samples"
  ON public.jailbreak_samples FOR ALL
  USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Public read vendor_trust_rankings" ON public.vendor_trust_rankings;
CREATE POLICY "Public read vendor_trust_rankings"
  ON public.vendor_trust_rankings FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Admin full access vendor_trust_rankings" ON public.vendor_trust_rankings;
CREATE POLICY "Admin full access vendor_trust_rankings"
  ON public.vendor_trust_rankings FOR ALL
  USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Public read bench_tr_evaluations" ON public.bench_tr_evaluations;
CREATE POLICY "Public read bench_tr_evaluations"
  ON public.bench_tr_evaluations FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Admin full access bench_tr_evaluations" ON public.bench_tr_evaluations;
CREATE POLICY "Admin full access bench_tr_evaluations"
  ON public.bench_tr_evaluations FOR ALL
  USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Allow mod all access to outreach_queue" ON public.outreach_queue;
CREATE POLICY "Allow mod all access to outreach_queue" ON public.outreach_queue
    FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Allow public read access to expert_network" ON public.expert_network;
CREATE POLICY "Allow public read access to expert_network" ON public.expert_network
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow mod all access to expert_network" ON public.expert_network;
CREATE POLICY "Allow mod all access to expert_network" ON public.expert_network
    FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Profiles are viewable by owner or staff" ON public.users;
CREATE POLICY "Profiles are viewable by owner or staff"
  on public.users
  for select
  using (id = auth.uid() or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "incident_votes_select_own_or_mod" ON public.incident_votes;
CREATE POLICY "incident_votes_select_own_or_mod"
  on public.incident_votes
  for select
  to anon, authenticated
  using (user_id = auth.uid() or public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Public committee members are viewable by everyone" ON public.methodology_committee_members;
CREATE POLICY "Public committee members are viewable by everyone"
on public.methodology_committee_members
for select
using (true);
DROP POLICY IF EXISTS "Only admins can modify committee members" ON public.methodology_committee_members;
CREATE POLICY "Only admins can modify committee members"
on public.methodology_committee_members
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can view their own private benchmarks" ON public.private_benchmarks;
CREATE POLICY "Users can view their own private benchmarks"
on public.private_benchmarks
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can insert their own private benchmarks" ON public.private_benchmarks;
CREATE POLICY "Users can insert their own private benchmarks"
on public.private_benchmarks
for insert
with check (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can update their own private benchmarks" ON public.private_benchmarks;
CREATE POLICY "Users can update their own private benchmarks"
on public.private_benchmarks
for update
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can delete their own private benchmarks" ON public.private_benchmarks;
CREATE POLICY "Users can delete their own private benchmarks"
on public.private_benchmarks
for delete
using (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can view their own rating alerts" ON public.rating_alerts;
CREATE POLICY "Users can view their own rating alerts"
on public.rating_alerts
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can insert their own rating alerts" ON public.rating_alerts;
CREATE POLICY "Users can insert their own rating alerts"
on public.rating_alerts
for insert
with check (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can update their own rating alerts" ON public.rating_alerts;
CREATE POLICY "Users can update their own rating alerts"
on public.rating_alerts
for update
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can delete their own rating alerts" ON public.rating_alerts;
CREATE POLICY "Users can delete their own rating alerts"
on public.rating_alerts
for delete
using (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can view their own fellowship applications" ON public.fellowship_applications;
CREATE POLICY "Users can view their own fellowship applications"
on public.fellowship_applications
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can insert their own fellowship applications" ON public.fellowship_applications;
CREATE POLICY "Users can insert their own fellowship applications"
on public.fellowship_applications
for insert
with check (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can update their own fellowship applications" ON public.fellowship_applications;
CREATE POLICY "Users can update their own fellowship applications"
on public.fellowship_applications
for update
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can delete their own fellowship applications" ON public.fellowship_applications;
CREATE POLICY "Users can delete their own fellowship applications"
on public.fellowship_applications
for delete
using (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can view their own ambassador applications" ON public.student_ambassadors;
CREATE POLICY "Users can view their own ambassador applications"
on public.student_ambassadors
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can insert their own ambassador applications" ON public.student_ambassadors;
CREATE POLICY "Users can insert their own ambassador applications"
on public.student_ambassadors
for insert
with check (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can update their own ambassador applications" ON public.student_ambassadors;
CREATE POLICY "Users can update their own ambassador applications"
on public.student_ambassadors
for update
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can delete their own ambassador applications" ON public.student_ambassadors;
CREATE POLICY "Users can delete their own ambassador applications"
on public.student_ambassadors
for delete
using (auth.uid() = user_id or public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Anyone can read Art 73 compliance status" ON public.art73_obligation_status;
CREATE POLICY "Anyone can read Art 73 compliance status"
on public.art73_obligation_status
for select
using (true);
DROP POLICY IF EXISTS "Only admins can insert Art 73 status" ON public.art73_obligation_status;
CREATE POLICY "Only admins can insert Art 73 status"
on public.art73_obligation_status
for insert
with check (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Only admins can update Art 73 status" ON public.art73_obligation_status;
CREATE POLICY "Only admins can update Art 73 status"
on public.art73_obligation_status
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Only admins can delete Art 73 status" ON public.art73_obligation_status;
CREATE POLICY "Only admins can delete Art 73 status"
on public.art73_obligation_status
for delete
using (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Only admins can select provider previews" ON public.k_provider_previews;
CREATE POLICY "Only admins can select provider previews"
on public.k_provider_previews
for select
using (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Only admins can insert provider previews" ON public.k_provider_previews;
CREATE POLICY "Only admins can insert provider previews"
on public.k_provider_previews
for insert
with check (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Only admins can update provider previews" ON public.k_provider_previews;
CREATE POLICY "Only admins can update provider previews"
on public.k_provider_previews
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Only admins can delete provider previews" ON public.k_provider_previews;
CREATE POLICY "Only admins can delete provider previews"
on public.k_provider_previews
for delete
using (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Allow public read access to data_retention_policies" ON public.data_retention_policies;
CREATE POLICY "Allow public read access to data_retention_policies" ON public.data_retention_policies
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow mod all access to data_retention_policies" ON public.data_retention_policies;
CREATE POLICY "Allow mod all access to data_retention_policies" ON public.data_retention_policies
    FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Allow public read access to redaction_requests" ON public.redaction_requests;
CREATE POLICY "Allow public read access to redaction_requests" ON public.redaction_requests
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow mod all access to redaction_requests" ON public.redaction_requests;
CREATE POLICY "Allow mod all access to redaction_requests" ON public.redaction_requests
    FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Allow mod all access to submission_attempts" ON public.submission_attempts;
CREATE POLICY "Allow mod all access to submission_attempts" ON public.submission_attempts
    FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Allow public insert to submission_attempts" ON public.submission_attempts;
CREATE POLICY "Allow public insert to submission_attempts" ON public.submission_attempts
    FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public read access to cross_audit_runs" ON public.cross_audit_runs;
CREATE POLICY "Allow public read access to cross_audit_runs" ON public.cross_audit_runs
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow mod all access to cross_audit_runs" ON public.cross_audit_runs;
CREATE POLICY "Allow mod all access to cross_audit_runs" ON public.cross_audit_runs
    FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Methodology versions public read" ON public.methodology_versions;
CREATE POLICY "Methodology versions public read" ON public.methodology_versions
  FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Methodology versions admin write" ON public.methodology_versions;
CREATE POLICY "Methodology versions admin write" ON public.methodology_versions
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can view their own DSAR requests" ON public.dsar_requests;
CREATE POLICY "Users can view their own DSAR requests" ON public.dsar_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own DSAR requests" ON public.dsar_requests;
CREATE POLICY "Users can insert their own DSAR requests" ON public.dsar_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view and update all DSAR requests" ON public.dsar_requests;
CREATE POLICY "Admins can view and update all DSAR requests" ON public.dsar_requests
  FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Allow public inserts on submission_fingerprints" ON public.submission_fingerprints;
CREATE POLICY "Allow public inserts on submission_fingerprints" ON public.submission_fingerprints
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow moderators full access on submission_fingerprints" ON public.submission_fingerprints;
CREATE POLICY "Allow moderators full access on submission_fingerprints" ON public.submission_fingerprints
  FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Transparency reports public read" ON public.transparency_reports;
CREATE POLICY "Transparency reports public read" ON public.transparency_reports
  FOR SELECT TO public USING (is_published = true);
DROP POLICY IF EXISTS "Transparency reports admin all" ON public.transparency_reports;
CREATE POLICY "Transparency reports admin all" ON public.transparency_reports
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Challenges public read" ON public.challenges;
CREATE POLICY "Challenges public read" ON public.challenges
  FOR SELECT TO public USING (is_published = true);
DROP POLICY IF EXISTS "Challenges admin all" ON public.challenges;
CREATE POLICY "Challenges admin all" ON public.challenges
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Challenge submissions public read approved" ON public.challenge_submissions;
CREATE POLICY "Challenge submissions public read approved" ON public.challenge_submissions
  FOR SELECT TO public USING (status = 'approved');
DROP POLICY IF EXISTS "Challenge submissions own all" ON public.challenge_submissions;
CREATE POLICY "Challenge submissions own all" ON public.challenge_submissions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Challenge submissions admin all" ON public.challenge_submissions;
CREATE POLICY "Challenge submissions admin all" ON public.challenge_submissions
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Challenge votes public read" ON public.challenge_votes;
CREATE POLICY "Challenge votes public read" ON public.challenge_votes
  FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Challenge votes own insert" ON public.challenge_votes;
CREATE POLICY "Challenge votes own insert" ON public.challenge_votes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Challenge votes own delete" ON public.challenge_votes;
CREATE POLICY "Challenge votes own delete" ON public.challenge_votes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow auditor_role read access to k_model_scores" ON public.k_model_scores;
CREATE POLICY "Allow auditor_role read access to k_model_scores" ON public.k_model_scores
  FOR SELECT TO auditor_role USING (true);
DROP POLICY IF EXISTS "Allow auditor_role read access to methodology_versions" ON public.methodology_versions;
CREATE POLICY "Allow auditor_role read access to methodology_versions" ON public.methodology_versions
  FOR SELECT TO auditor_role USING (true);
DROP POLICY IF EXISTS "Allow auditor_role read access to audit_log" ON public.audit_log;
CREATE POLICY "Allow auditor_role read access to audit_log" ON public.audit_log
  FOR SELECT TO auditor_role USING (true);
DROP POLICY IF EXISTS "Allow read for admins/ceo" ON public.finance_revenue_metrics;
CREATE POLICY "Allow read for admins/ceo" on public.finance_revenue_metrics
  for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('admin', 'ceo')
    )
  );
DROP POLICY IF EXISTS "Allow write for admins/ceo" ON public.finance_revenue_metrics;
CREATE POLICY "Allow write for admins/ceo" on public.finance_revenue_metrics
  for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('admin', 'ceo')
    )
  );
DROP POLICY IF EXISTS "ceo_admin_advisor_login_events_select" ON public.admin_login_events;
CREATE POLICY "ceo_admin_advisor_login_events_select" ON public.admin_login_events
  FOR SELECT TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_advisor(auth.uid()));
DROP POLICY IF EXISTS "Enable read access for all users on admin_login_events" ON public.admin_login_events;
CREATE POLICY "Enable read access for all users on admin_login_events" ON public.admin_login_events FOR SELECT USING (true);
DROP POLICY IF EXISTS "strategic_questions_mod_all" ON public.strategic_questions;
CREATE POLICY "strategic_questions_mod_all" ON public.strategic_questions
    FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "strategic_answers_mod_all" ON public.strategic_answers;
CREATE POLICY "strategic_answers_mod_all" ON public.strategic_answers
    FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Moderators can view appeals" ON public.takedown_appeals;
CREATE POLICY "Moderators can view appeals"
  on public.takedown_appeals for select using (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Anyone can submit an appeal" ON public.takedown_appeals;
CREATE POLICY "Anyone can submit an appeal"
  on public.takedown_appeals for insert with check (true);
DROP POLICY IF EXISTS "Moderators can update appeals" ON public.takedown_appeals;
CREATE POLICY "Moderators can update appeals"
  on public.takedown_appeals for update using (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Admin only read" ON public.cron_job_logs;
CREATE POLICY "Admin only read" ON public.cron_job_logs 
    FOR SELECT 
    TO authenticated 
    USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Allow read access to ai_velocity_metrics for authenticated admins" ON public.ai_velocity_metrics;
CREATE POLICY "Allow read access to ai_velocity_metrics for authenticated admins"
  on public.ai_velocity_metrics
  for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('admin', 'ceo', 'moderator')
    )
  );
DROP POLICY IF EXISTS "Allow write access to ai_velocity_metrics for authenticated admins" ON public.ai_velocity_metrics;
CREATE POLICY "Allow write access to ai_velocity_metrics for authenticated admins"
  on public.ai_velocity_metrics
  for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('admin', 'ceo', 'moderator')
    )
  );
DROP POLICY IF EXISTS "Allow read access to financial_velocity_projections for authenticated admins" ON public.financial_velocity_projections;
CREATE POLICY "Allow read access to financial_velocity_projections for authenticated admins"
  on public.financial_velocity_projections
  for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('admin', 'ceo', 'moderator')
    )
  );
DROP POLICY IF EXISTS "Allow write access to financial_velocity_projections for authenticated admins" ON public.financial_velocity_projections;
CREATE POLICY "Allow write access to financial_velocity_projections for authenticated admins"
  on public.financial_velocity_projections
  for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('admin', 'ceo', 'moderator')
    )
  );
DROP POLICY IF EXISTS "Public read cease_and_desist_logs" ON public.cease_and_desist_logs;
CREATE POLICY "Public read cease_and_desist_logs"
  ON public.cease_and_desist_logs
  FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Admin write cease_and_desist_logs" ON public.cease_and_desist_logs;
CREATE POLICY "Admin write cease_and_desist_logs"
  ON public.cease_and_desist_logs
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Anyone can read Art 50 transparency status" ON public.art50_transparency_status;
CREATE POLICY "Anyone can read Art 50 transparency status"
on public.art50_transparency_status
for select
using (true);
DROP POLICY IF EXISTS "Only admins can insert Art 50 transparency status" ON public.art50_transparency_status;
CREATE POLICY "Only admins can insert Art 50 transparency status"
on public.art50_transparency_status
for insert
with check (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Only admins can update Art 50 transparency status" ON public.art50_transparency_status;
CREATE POLICY "Only admins can update Art 50 transparency status"
on public.art50_transparency_status
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Only admins can delete Art 50 transparency status" ON public.art50_transparency_status;
CREATE POLICY "Only admins can delete Art 50 transparency status"
on public.art50_transparency_status
for delete
using (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Public read geo_scores" ON public.geo_scores;
CREATE POLICY "Public read geo_scores"
    ON public.geo_scores FOR SELECT
    TO public
    USING (true);
DROP POLICY IF EXISTS "Public read geo_citations" ON public.geo_citations;
CREATE POLICY "Public read geo_citations"
    ON public.geo_citations FOR SELECT
    TO public
    USING (true);
DROP POLICY IF EXISTS "Admin full access geo_citations" ON public.geo_citations;
CREATE POLICY "Admin full access geo_citations"
    ON public.geo_citations FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin full access geo_scores" ON public.geo_scores;
CREATE POLICY "Admin full access geo_scores"
    ON public.geo_scores FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin full access sla_alarms" ON public.sla_alarms;
CREATE POLICY "Admin full access sla_alarms"
    ON public.sla_alarms FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "ai_routing_chains_read_all" ON public.ai_routing_chains;
CREATE POLICY "ai_routing_chains_read_all"
          ON public.ai_routing_chains FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read incident_translations" ON public.incident_translations;
CREATE POLICY "Public read incident_translations"
    ON public.incident_translations FOR SELECT
    TO public
    USING (true);
DROP POLICY IF EXISTS "Admin full access incident_translations" ON public.incident_translations;
CREATE POLICY "Admin full access incident_translations"
    ON public.incident_translations FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Public read feature_flags" ON public.feature_flags;
CREATE POLICY "Public read feature_flags"
    ON public.feature_flags FOR SELECT
    TO public
    USING (true);
DROP POLICY IF EXISTS "Admin full access feature_flags" ON public.feature_flags;
CREATE POLICY "Admin full access feature_flags"
    ON public.feature_flags FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Public read dora_metrics" ON public.dora_metrics;
CREATE POLICY "Public read dora_metrics"
    ON public.dora_metrics FOR SELECT
    TO public
    USING (true);
DROP POLICY IF EXISTS "Admin full access dora_metrics" ON public.dora_metrics;
CREATE POLICY "Admin full access dora_metrics"
    ON public.dora_metrics FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Allow public read of platform_statistics" ON platform_statistics;
CREATE POLICY "Allow public read of platform_statistics"
  ON platform_statistics FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Admins have full access to ecosystem intel" ON agent_ecosystem_intel;
CREATE POLICY "Admins have full access to ecosystem intel"
    ON agent_ecosystem_intel
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin' OR (SELECT is_admin FROM users WHERE id = auth.uid()) = true);
DROP POLICY IF EXISTS "Deny read to public/users" ON agent_ecosystem_intel;
CREATE POLICY "Deny read to public/users"
    ON agent_ecosystem_intel
    FOR SELECT
    TO public
    USING (false);
DROP POLICY IF EXISTS "Developers can view their persona stats" ON persona_usage_stats;
CREATE POLICY "Developers can view their persona stats"
    ON persona_usage_stats
    FOR SELECT
    TO authenticated
    USING (developer_id = auth.uid());
DROP POLICY IF EXISTS "Consumers can view their usage" ON persona_usage_stats;
CREATE POLICY "Consumers can view their usage"
    ON persona_usage_stats
    FOR SELECT
    TO authenticated
    USING (consumer_id = auth.uid());
DROP POLICY IF EXISTS "Admins full access to persona stats" ON persona_usage_stats;
CREATE POLICY "Admins full access to persona stats"
    ON persona_usage_stats
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin' OR (SELECT is_admin FROM users WHERE id = auth.uid()) = true);
DROP POLICY IF EXISTS "Enable read access for all users on agent_episodic_memory" ON public.agent_episodic_memory;
CREATE POLICY "Enable read access for all users on agent_episodic_memory" ON public.agent_episodic_memory FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin full access geo_citations" ON public.geo_citations;
CREATE POLICY "Admin full access geo_citations"
    ON public.geo_citations FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin full access geo_scores" ON public.geo_scores;
CREATE POLICY "Admin full access geo_scores"
    ON public.geo_scores FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin full access sla_alarms" ON public.sla_alarms;
CREATE POLICY "Admin full access sla_alarms"
    ON public.sla_alarms FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin full access incident_translations" ON public.incident_translations;
CREATE POLICY "Admin full access incident_translations"
    ON public.incident_translations FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin full access feature_flags" ON public.feature_flags;
CREATE POLICY "Admin full access feature_flags"
    ON public.feature_flags FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin full access dora_metrics" ON public.dora_metrics;
CREATE POLICY "Admin full access dora_metrics"
    ON public.dora_metrics FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Moderators can manage linkedin_contacts" ON public.linkedin_contacts;
CREATE POLICY "Moderators can manage linkedin_contacts" ON public.linkedin_contacts
  FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Moderators can manage grant_applications" ON public.grant_applications;
CREATE POLICY "Moderators can manage grant_applications" ON public.grant_applications
  FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Moderators can manage platform_signups" ON public.platform_signups;
CREATE POLICY "Moderators can manage platform_signups" ON public.platform_signups
  FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Moderators can insert public statements" ON ai_provider_responses;
CREATE POLICY "Moderators can insert public statements"
  ON ai_provider_responses
  FOR INSERT
  WITH CHECK (
    response_type = 'public_statement' AND
    auth.jwt() ->> 'role' = 'moderator'
  );
DROP POLICY IF EXISTS "ai_free_models_read_all" ON public.ai_free_models;
CREATE POLICY "ai_free_models_read_all"
  ON public.ai_free_models
  FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "ai_free_models_admin_all" ON public.ai_free_models;
CREATE POLICY "ai_free_models_admin_all"
  ON public.ai_free_models
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );
DROP POLICY IF EXISTS "ai_trust_scores_admin_policy" ON public.ai_trust_scores;
CREATE POLICY "ai_trust_scores_admin_policy"
  ON public.ai_trust_scores
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );
DROP POLICY IF EXISTS "ai_routing_chains_admin_policy" ON public.ai_routing_chains;
CREATE POLICY "ai_routing_chains_admin_policy"
  ON public.ai_routing_chains
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );
DROP POLICY IF EXISTS "ai_routing_chains_admin_all" ON public.ai_routing_chains;
CREATE POLICY "ai_routing_chains_admin_all"
  ON public.ai_routing_chains
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );
DROP POLICY IF EXISTS "Moderators can manage vendor_quotas" ON public.vendor_quotas;
CREATE POLICY "Moderators can manage vendor_quotas"
  on public.vendor_quotas for all to authenticated
  using (public.is_moderator(auth.uid()))
  with check (public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Admin can manage vendor_quotas" ON public.vendor_quotas;
CREATE POLICY "Admin can manage vendor_quotas"
  on public.vendor_quotas for all to authenticated
  using (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  )
  with check (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );
DROP POLICY IF EXISTS "Public read user_reputation" ON public.user_reputation;
CREATE POLICY "Public read user_reputation" ON public.user_reputation
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin write user_reputation" ON public.user_reputation;
CREATE POLICY "Admin write user_reputation" ON public.user_reputation
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users read own reputation_logs" ON public.reputation_logs;
CREATE POLICY "Users read own reputation_logs" ON public.reputation_logs
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin write reputation_logs" ON public.reputation_logs;
CREATE POLICY "Admin write reputation_logs" ON public.reputation_logs
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Public insert sybil_detection_logs" ON public.sybil_detection_logs;
CREATE POLICY "Public insert sybil_detection_logs" ON public.sybil_detection_logs
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Admin read sybil_detection_logs" ON public.sybil_detection_logs;
CREATE POLICY "Admin read sybil_detection_logs" ON public.sybil_detection_logs
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Public read jury_cases" ON public.jury_cases;
CREATE POLICY "Public read jury_cases" ON public.jury_cases
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated create jury_cases" ON public.jury_cases;
CREATE POLICY "Authenticated create jury_cases" ON public.jury_cases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admin & Moderator manage jury_cases" ON public.jury_cases;
CREATE POLICY "Admin & Moderator manage jury_cases" ON public.jury_cases
  FOR UPDATE TO authenticated USING (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Public read jurors" ON public.jurors;
CREATE POLICY "Public read jurors" ON public.jurors
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Moderators assign jurors" ON public.jurors;
CREATE POLICY "Moderators assign jurors" ON public.jurors
  FOR ALL TO authenticated USING (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Public read jury_votes" ON public.jury_votes;
CREATE POLICY "Public read jury_votes" ON public.jury_votes
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Jurors submit own vote" ON public.jury_votes;
CREATE POLICY "Jurors submit own vote" ON public.jury_votes
  FOR INSERT TO authenticated WITH CHECK (juror_id = auth.uid());
DROP POLICY IF EXISTS "Public read ai_rap_sheet" ON public.ai_rap_sheet_entries;
CREATE POLICY "Public read ai_rap_sheet" ON public.ai_rap_sheet_entries
  FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Moderators manage ai_rap_sheet" ON public.ai_rap_sheet_entries;
CREATE POLICY "Moderators manage ai_rap_sheet" ON public.ai_rap_sheet_entries
  FOR ALL TO authenticated USING (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin and service role full access on social_accounts" ON public.social_accounts;
CREATE POLICY "Admin and service role full access on social_accounts"
  ON public.social_accounts
  FOR ALL
  TO authenticated, service_role
  USING (auth.role() = 'service_role' OR public.is_admin(auth.uid()))
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin and service role full access on marketing_drafts" ON public.marketing_drafts;
CREATE POLICY "Admin and service role full access on marketing_drafts"
  ON public.marketing_drafts
  FOR ALL
  TO authenticated, service_role
  USING (auth.role() = 'service_role' OR public.is_admin(auth.uid()))
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin and service role full access on newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admin and service role full access on newsletter_subscribers"
  ON public.newsletter_subscribers
  FOR ALL
  TO authenticated, service_role
  USING (auth.role() = 'service_role' OR public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()))
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Admin and service role full access on cross_audit_runs" ON public.cross_audit_runs;
CREATE POLICY "Admin and service role full access on cross_audit_runs"
  ON public.cross_audit_runs
  FOR ALL
  TO authenticated, service_role
  USING (auth.role() = 'service_role' OR public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()))
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Admin and service role can select audit_log" ON public.audit_log;
CREATE POLICY "Admin and service role can select audit_log"
  ON public.audit_log
  FOR SELECT
  TO authenticated, service_role
  USING (auth.role() = 'service_role' OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin and service role full access on cease_and_desist_logs" ON public.cease_and_desist_logs;
CREATE POLICY "Admin and service role full access on cease_and_desist_logs"
  ON public.cease_and_desist_logs
  FOR ALL
  TO authenticated, service_role
  USING (auth.role() = 'service_role' OR public.is_admin(auth.uid()))
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin(auth.uid()));
-- (removed) orphaned embeddings policy: table public.embeddings exists nowhere
-- (dump, delta, app code) — Supabase-convention leftover. Re-add with the table if ever created.
-- (removed) orphaned profiles/documents policies: neither table exists in dump,
-- delta, or app code — Supabase-convention leftovers. Re-add with the tables if ever created.
DROP POLICY IF EXISTS "Allow public read" ON public.wall_of_shame_entries;
CREATE POLICY "Allow public read"
  ON public.wall_of_shame_entries
  FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Allow auth insert" ON public.wall_of_shame_entries;
CREATE POLICY "Allow auth insert"
  ON public.wall_of_shame_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
DROP POLICY IF EXISTS "Admins and service role manage ai_scoring_config" ON public.ai_scoring_config;
CREATE POLICY "Admins and service role manage ai_scoring_config" ON public.ai_scoring_config
            FOR ALL TO authenticated, service_role
            USING (
                auth.role() = 'service_role' 
                OR public.is_admin(auth.uid()) 
                OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'ceo'))
            )
            WITH CHECK (
                auth.role() = 'service_role' 
                OR public.is_admin(auth.uid()) 
                OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'ceo'))
            );
DROP POLICY IF EXISTS "Admins and service role insert ai_trust_ledger" ON public.ai_trust_ledger;
CREATE POLICY "Admins and service role insert ai_trust_ledger" ON public.ai_trust_ledger
            FOR INSERT TO authenticated, service_role
            WITH CHECK (
                auth.role() = 'service_role' 
                OR public.is_admin(auth.uid()) 
                OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'ceo'))
            );
DROP POLICY IF EXISTS "Public read wall_of_shame_entries" ON public.wall_of_shame_entries;
CREATE POLICY "Public read wall_of_shame_entries" ON public.wall_of_shame_entries
            FOR SELECT TO anon, authenticated
            USING (is_active = true OR public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Moderator write wall_of_shame_entries" ON public.wall_of_shame_entries;
CREATE POLICY "Moderator write wall_of_shame_entries" ON public.wall_of_shame_entries
            FOR ALL TO authenticated, service_role
            USING (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Public read ai_rap_sheet" ON public.ai_rap_sheet_entries;
CREATE POLICY "Public read ai_rap_sheet" ON public.ai_rap_sheet_entries
            FOR SELECT TO anon, authenticated
            USING (is_active = true OR public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Moderators manage ai_rap_sheet" ON public.ai_rap_sheet_entries;
CREATE POLICY "Moderators manage ai_rap_sheet" ON public.ai_rap_sheet_entries
            FOR ALL TO authenticated, service_role
            USING (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Verified jurors submit own vote" ON public.jury_votes;
CREATE POLICY "Verified jurors submit own vote" ON public.jury_votes
            FOR INSERT TO authenticated
            WITH CHECK (
                juror_id = auth.uid()
                AND (
                    EXISTS (
                        SELECT 1 FROM public.jurors j 
                        WHERE j.case_id = jury_votes.case_id 
                          AND j.juror_id = auth.uid()
                    )
                    OR public.is_admin(auth.uid())
                    OR auth.role() = 'service_role'
                )
            );
DROP POLICY IF EXISTS "Admin and service role manage jury_votes" ON public.jury_votes;
CREATE POLICY "Admin and service role manage jury_votes" ON public.jury_votes
            FOR ALL TO authenticated, service_role
            USING (public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_admin(auth.uid()) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin & Moderator update jury_cases" ON public.jury_cases;
CREATE POLICY "Admin & Moderator update jury_cases" ON public.jury_cases
            FOR UPDATE TO authenticated, service_role
            USING (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin delete jury_cases" ON public.jury_cases;
CREATE POLICY "Admin delete jury_cases" ON public.jury_cases
            FOR DELETE TO authenticated, service_role
            USING (public.is_admin(auth.uid()) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin write user_reputation" ON public.user_reputation;
CREATE POLICY "Admin write user_reputation" ON public.user_reputation
            FOR ALL TO authenticated, service_role
            USING (public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_admin(auth.uid()) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin write reputation_logs" ON public.reputation_logs;
CREATE POLICY "Admin write reputation_logs" ON public.reputation_logs
            FOR ALL TO authenticated, service_role
            USING (public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_admin(auth.uid()) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin manage sybil_detection_logs" ON public.sybil_detection_logs;
CREATE POLICY "Admin manage sybil_detection_logs" ON public.sybil_detection_logs
            FOR ALL TO authenticated, service_role
            USING (public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_admin(auth.uid()) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admins and moderators can manage vendor_quotas" ON public.vendor_quotas;
CREATE POLICY "Admins and moderators can manage vendor_quotas"
ON public.vendor_quotas
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
DROP POLICY IF EXISTS "Allow admin read funnel_events" ON public.funnel_events;
CREATE POLICY "Allow admin read funnel_events" ON public.funnel_events FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);
DROP POLICY IF EXISTS "Admin full access bilge_memory" ON public.bilge_memory;
CREATE POLICY "Admin full access bilge_memory"
    ON public.bilge_memory FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Service role full access" ON webhooks;
CREATE POLICY "Service role full access" ON webhooks
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
DROP POLICY IF EXISTS "Vendor defense response update policy" ON public.incidents;
CREATE POLICY "Vendor defense response update policy"
    ON public.incidents FOR UPDATE
    TO authenticated
    USING (
        public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR (auth.jwt() ->> 'role' = 'vendor')
    )
    WITH CHECK (
        public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR (auth.jwt() ->> 'role' = 'vendor')
    );
DROP POLICY IF EXISTS "k_benchmark_question_bank_read_all" ON public.k_benchmark_question_bank;
CREATE POLICY "k_benchmark_question_bank_read_all"
  ON public.k_benchmark_question_bank
  FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "k_benchmark_question_bank_admin_all" ON public.k_benchmark_question_bank;
CREATE POLICY "k_benchmark_question_bank_admin_all"
  ON public.k_benchmark_question_bank
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );
DROP POLICY IF EXISTS "k_benchmark_evaluations_read_all" ON public.k_benchmark_evaluations;
CREATE POLICY "k_benchmark_evaluations_read_all"
  ON public.k_benchmark_evaluations
  FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "k_benchmark_evaluations_admin_all" ON public.k_benchmark_evaluations;
CREATE POLICY "k_benchmark_evaluations_admin_all"
  ON public.k_benchmark_evaluations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );
DROP POLICY IF EXISTS "Users can read own invoices or admins all" ON storage.objects;
CREATE POLICY "Users can read own invoices or admins all"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'invoices' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_moderator(auth.uid())
    )
  );
DROP POLICY IF EXISTS "Service role full access on tasks" ON public.tasks;
CREATE POLICY "Service role full access on tasks"
  ON public.tasks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view tasks" ON public.tasks;
CREATE POLICY "Admins can view tasks"
  ON public.tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo', 'moderator')
    )
  );
DROP POLICY IF EXISTS "Service role full access on heartbeats" ON public.heartbeats;
CREATE POLICY "Service role full access on heartbeats"
  ON public.heartbeats
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view heartbeats" ON public.heartbeats;
CREATE POLICY "Admins can view heartbeats"
  ON public.heartbeats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );
DROP POLICY IF EXISTS "Service role full access on cost_log" ON public.cost_log;
CREATE POLICY "Service role full access on cost_log"
  ON public.cost_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view cost_log" ON public.cost_log;
CREATE POLICY "Admins can view cost_log"
  ON public.cost_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );
DROP POLICY IF EXISTS "Service role full access on system_flags" ON public.system_flags;
CREATE POLICY "Service role full access on system_flags"
  ON public.system_flags
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
DROP POLICY IF EXISTS "Public can read system_flags" ON public.system_flags;
CREATE POLICY "Public can read system_flags"
  ON public.system_flags
  FOR SELECT
  TO anon, authenticated
  USING (true);
DROP POLICY IF EXISTS "Service role full access on agent_episodic_memory" ON public.agent_episodic_memory;
CREATE POLICY "Service role full access on agent_episodic_memory"
  ON public.agent_episodic_memory
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view agent_episodic_memory" ON public.agent_episodic_memory;
CREATE POLICY "Admins can view agent_episodic_memory"
  ON public.agent_episodic_memory
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    -- 🔴 CRITICAL FIX: Users cannot change their own 'role' or 'is_verified' status.
    AND role = (SELECT role FROM public.users WHERE id = auth.uid())
    AND is_verified = (SELECT is_verified FROM public.users WHERE id = auth.uid())
    AND email = (SELECT email FROM public.users WHERE id = auth.uid())
  );
DROP POLICY IF EXISTS "users_read_policy" ON public.users;
CREATE POLICY "users_read_policy" ON public.users
  FOR SELECT
  TO public
  USING (
    is_deleted = false 
    OR id = (SELECT auth.uid())
    OR (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  );
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (
    id = (SELECT auth.uid())
    OR (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
  );
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
CREATE POLICY "users_update_policy" ON public.users
  FOR UPDATE
  TO authenticated, service_role
  USING (
    id = (SELECT auth.uid())
    OR (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  )
  WITH CHECK (
    id = (SELECT auth.uid())
    OR (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  );
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;
CREATE POLICY "users_delete_policy" ON public.users
  FOR DELETE
  TO authenticated, service_role
  USING (
    (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  );
DROP POLICY IF EXISTS "telemetry_insert_policy" ON public.telemetry;
CREATE POLICY "telemetry_insert_policy" ON public.telemetry
  FOR INSERT
  TO public, authenticated, service_role
  WITH CHECK (
    user_id IS NULL 
    OR user_id = (SELECT auth.uid())
    OR (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
  );
DROP POLICY IF EXISTS "telemetry_select_policy" ON public.telemetry;
CREATE POLICY "telemetry_select_policy" ON public.telemetry
  FOR SELECT
  TO authenticated, service_role
  USING (
    (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  );
DROP POLICY IF EXISTS "telemetry_delete_policy" ON public.telemetry;
CREATE POLICY "telemetry_delete_policy" ON public.telemetry
  FOR DELETE
  TO authenticated, service_role
  USING (
    (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  );
DROP POLICY IF EXISTS "financials_select_policy" ON public.financials;
CREATE POLICY "financials_select_policy" ON public.financials
  FOR SELECT
  TO authenticated, service_role
  USING (
    (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR (
      user_id = (SELECT auth.uid()) 
      AND status != 'disputed'
    )
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  );
DROP POLICY IF EXISTS "financials_insert_policy" ON public.financials;
CREATE POLICY "financials_insert_policy" ON public.financials
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (
    (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  );
DROP POLICY IF EXISTS "financials_update_policy" ON public.financials;
CREATE POLICY "financials_update_policy" ON public.financials
  FOR UPDATE
  TO authenticated, service_role
  USING (
    (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  )
  WITH CHECK (
    (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  );
DROP POLICY IF EXISTS "financials_delete_policy" ON public.financials;
CREATE POLICY "financials_delete_policy" ON public.financials
  FOR DELETE
  TO service_role
  USING (
    (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
  );
DROP POLICY IF EXISTS "AI polls are viewable by everyone" ON public.ai_polls;
CREATE POLICY "AI polls are viewable by everyone"
  ON public.ai_polls
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true 
    OR public.is_admin(auth.uid())
  );
DROP POLICY IF EXISTS "Admins can manage ai_polls" ON public.ai_polls;
CREATE POLICY "Admins can manage ai_polls"
  ON public.ai_polls
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Poll votes are viewable by everyone" ON public.ai_poll_votes;
CREATE POLICY "Poll votes are viewable by everyone"
  ON public.ai_poll_votes
  FOR SELECT
  TO anon, authenticated
  USING (true);
DROP POLICY IF EXISTS "Anyone can cast a poll vote" ON public.ai_poll_votes;
CREATE POLICY "Anyone can cast a poll vote"
  ON public.ai_poll_votes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    choice IN ('yes', 'no', 'unsure')
    AND ip_hash IS NOT NULL
    AND length(trim(ip_hash)) > 0
    AND (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Admins can manage poll votes" ON public.ai_poll_votes;
CREATE POLICY "Admins can manage poll votes"
  ON public.ai_poll_votes
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));