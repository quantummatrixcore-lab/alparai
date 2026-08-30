-- ============================================================================
-- MIGRATION: 20260930200000_fix_fk_indexes_and_cascades.sql
-- AUTHOR: İbn-i Sina (TARTARUS) Autonomous Diagnostic & Healing Engine
-- PURPOSE: Fix missing FK indexes, adjust NO ACTION constraints, prevent orphans
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. NO ACTION / RESTRICT DÜZELTMELERİ (CASCADE & SET NULL ONARIMI)
-- ----------------------------------------------------------------------------

-- expert_applications.reviewed_by
ALTER TABLE public.expert_applications
  DROP CONSTRAINT IF EXISTS expert_applications_reviewed_by_fkey,
  ADD CONSTRAINT expert_applications_reviewed_by_fkey
    FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- persona_usage_stats
ALTER TABLE public.persona_usage_stats
  DROP CONSTRAINT IF EXISTS persona_usage_stats_developer_id_fkey,
  DROP CONSTRAINT IF EXISTS persona_usage_stats_consumer_id_fkey,
  ADD CONSTRAINT persona_usage_stats_developer_id_fkey
    FOREIGN KEY (developer_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT persona_usage_stats_consumer_id_fkey
    FOREIGN KEY (consumer_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- grant_applications
ALTER TABLE public.grant_applications
  DROP CONSTRAINT IF EXISTS grant_applications_completed_by_fkey,
  DROP CONSTRAINT IF EXISTS grant_applications_approved_by_fkey,
  ADD CONSTRAINT grant_applications_completed_by_fkey
    FOREIGN KEY (completed_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT grant_applications_approved_by_fkey
    FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ai_poll_votes (Yetim kayıt önleme)
ALTER TABLE public.ai_poll_votes
  DROP CONSTRAINT IF EXISTS ai_poll_votes_user_id_fkey,
  ADD CONSTRAINT ai_poll_votes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 2. EKSİK FOREIGN KEY İNDEKSLERİNİN OLUŞTURULMASI (61 ADET)
-- ----------------------------------------------------------------------------

-- Incidents & Providers
CREATE INDEX IF NOT EXISTS idx_incidents_moderator_id ON public.incidents (moderator_id);
CREATE INDEX IF NOT EXISTS idx_ai_provider_responses_ai_provider_id ON public.ai_provider_responses (ai_provider_id);
CREATE INDEX IF NOT EXISTS idx_user_provider_watches_user_id ON public.user_provider_watches (user_id);
CREATE INDEX IF NOT EXISTS idx_user_provider_watches_provider_id ON public.user_provider_watches (provider_id);
CREATE INDEX IF NOT EXISTS idx_art73_obligation_status_provider_id ON public.art73_obligation_status (provider_id);
CREATE INDEX IF NOT EXISTS idx_k_provider_previews_provider_id ON public.k_provider_previews (provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_response_tokens_incident_id ON public.provider_response_tokens (incident_id);
CREATE INDEX IF NOT EXISTS idx_submission_fingerprints_incident_id ON public.submission_fingerprints (incident_id);

-- Suggestions & Votes
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON public.suggestions (user_id);
CREATE INDEX IF NOT EXISTS idx_suggestion_votes_user_id ON public.suggestion_votes (user_id);
CREATE INDEX IF NOT EXISTS idx_suggestion_votes_suggestion_id ON public.suggestion_votes (suggestion_id);
CREATE INDEX IF NOT EXISTS idx_suggestion_comments_user_id ON public.suggestion_comments (user_id);

-- Incident Comments & Affected Users
CREATE INDEX IF NOT EXISTS idx_incident_comments_incident_id ON public.incident_comments (incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_comments_user_id ON public.incident_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_incident_affected_users_incident_id ON public.incident_affected_users (incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_affected_users_user_id ON public.incident_affected_users (user_id);

-- AI Polls & Bounties
CREATE INDEX IF NOT EXISTS idx_ai_poll_votes_poll_id ON public.ai_poll_votes (poll_id);
CREATE INDEX IF NOT EXISTS idx_ai_poll_votes_user_id ON public.ai_poll_votes (user_id);
CREATE INDEX IF NOT EXISTS idx_bug_bounties_incident_id ON public.bug_bounties (incident_id);
CREATE INDEX IF NOT EXISTS idx_bug_bounties_validated_by ON public.bug_bounties (validated_by);
CREATE INDEX IF NOT EXISTS idx_user_bounty_badges_user_id ON public.user_bounty_badges (user_id);
CREATE INDEX IF NOT EXISTS idx_user_bounty_badges_badge_code ON public.user_bounty_badges (badge_code);
CREATE INDEX IF NOT EXISTS idx_user_bounty_badges_bounty_id ON public.user_bounty_badges (bounty_id);

-- Model Reviews & Feature Requests
CREATE INDEX IF NOT EXISTS idx_model_reviews_user_id ON public.model_reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_model_review_votes_user_id ON public.model_review_votes (user_id);
CREATE INDEX IF NOT EXISTS idx_model_review_votes_review_id ON public.model_review_votes (review_id);
CREATE INDEX IF NOT EXISTS idx_model_feature_requests_user_id ON public.model_feature_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_model_feature_votes_user_id ON public.model_feature_votes (user_id);
CREATE INDEX IF NOT EXISTS idx_model_feature_votes_request_id ON public.model_feature_votes (request_id);

-- Strategy & Governance
CREATE INDEX IF NOT EXISTS idx_strategy_swot_items_owner_user_id ON public.strategy_swot_items (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_strategy_risks_owner_user_id ON public.strategy_risks (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_strategy_valuations_created_by ON public.strategy_valuations (created_by);
CREATE INDEX IF NOT EXISTS idx_strategy_milestones_owner_user_id ON public.strategy_milestones (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_by ON public.social_posts (created_by);
CREATE INDEX IF NOT EXISTS idx_strategic_runs_created_by ON public.strategic_runs (created_by);

-- K-Benchmark & Evaluations
CREATE INDEX IF NOT EXISTS idx_k_model_scores_category_id ON public.k_model_scores (category_id);
CREATE INDEX IF NOT EXISTS idx_k_model_scores_model_id ON public.k_model_scores (model_id);
CREATE INDEX IF NOT EXISTS idx_slopsquatting_reports_hallucinated_by ON public.slopsquatting_reports (hallucinated_by_model_id);
CREATE INDEX IF NOT EXISTS idx_k_benchmark_qb_incident_id ON public.k_benchmark_question_bank (incident_id);
CREATE INDEX IF NOT EXISTS idx_k_benchmark_evals_question_id ON public.k_benchmark_evaluations (question_id);
CREATE INDEX IF NOT EXISTS idx_k_benchmark_evals_model_id ON public.k_benchmark_evaluations (model_id);

-- Users, Roles, Network & Security
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges (user_id);
CREATE INDEX IF NOT EXISTS idx_expert_applications_reviewed_by ON public.expert_applications (reviewed_by);
CREATE INDEX IF NOT EXISTS idx_autopilot_worker_config_updated_by ON public.autopilot_worker_config (updated_by);
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON public.email_preferences (user_id);
CREATE INDEX IF NOT EXISTS idx_expert_network_id ON public.expert_network (id);
CREATE INDEX IF NOT EXISTS idx_private_benchmarks_user_id ON public.private_benchmarks (user_id);
CREATE INDEX IF NOT EXISTS idx_rating_alerts_user_id ON public.rating_alerts (user_id);
CREATE INDEX IF NOT EXISTS idx_fellowship_applications_user_id ON public.fellowship_applications (user_id);
CREATE INDEX IF NOT EXISTS idx_student_ambassadors_user_id ON public.student_ambassadors (user_id);
CREATE INDEX IF NOT EXISTS idx_redaction_requests_incident_id ON public.redaction_requests (incident_id);
CREATE INDEX IF NOT EXISTS idx_redaction_requests_provider_id ON public.redaction_requests (provider_id);
CREATE INDEX IF NOT EXISTS idx_redaction_requests_processed_by ON public.redaction_requests (processed_by);
CREATE INDEX IF NOT EXISTS idx_dsar_requests_user_id ON public.dsar_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_created_by ON public.challenges (created_by);
CREATE INDEX IF NOT EXISTS idx_challenge_votes_user_id ON public.challenge_votes (user_id);
CREATE INDEX IF NOT EXISTS idx_admin_login_events_user_id ON public.admin_login_events (user_id);
CREATE INDEX IF NOT EXISTS idx_takedown_appeals_assigned_mod ON public.takedown_appeals (assigned_moderator_id);
CREATE INDEX IF NOT EXISTS idx_takedown_requests_assigned_mod ON public.takedown_requests (assigned_moderator_id);
CREATE INDEX IF NOT EXISTS idx_grant_applications_completed_by ON public.grant_applications (completed_by);
CREATE INDEX IF NOT EXISTS idx_grant_applications_approved_by ON public.grant_applications (approved_by);
CREATE INDEX IF NOT EXISTS idx_automation_tasks_created_by ON public.automation_tasks (created_by);
CREATE INDEX IF NOT EXISTS idx_persona_usage_stats_developer_id ON public.persona_usage_stats (developer_id);
CREATE INDEX IF NOT EXISTS idx_persona_usage_stats_consumer_id ON public.persona_usage_stats (consumer_id);

COMMIT;
