-- ============================================================================
-- 20260704000002_incidents_column_security.sql
--
-- Security remediation:
--   Revoke SELECT privilege on raw PII columns (title, description) of public.incidents 
--   from anon and authenticated roles to ensure raw personal data cannot be accessed 
--   directly via the public REST API, while keeping masked and audited fields available.
-- ============================================================================

-- Revoke default broad select privileges
revoke select on public.incidents from anon, authenticated;

-- Grant select privilege only on non-PII and masked columns
grant select (
  id,
  user_id,
  is_anonymous,
  title_masked,
  description_masked,
  ai_provider_id,
  ai_model_id,
  category,
  severity,
  incident_date,
  location_country,
  language,
  status,
  moderator_id,
  moderator_notes,
  reviewed_at,
  views_count,
  upvotes_count,
  shares_count,
  comments_count,
  source_url,
  ip_hash,
  user_agent,
  search_vector,
  created_at,
  updated_at,
  published_at,
  moderated_at,
  moderation_note,
  contains_pii,
  pii_categories,
  title_tr,
  description_tr,
  provider_custom_name,
  model_custom_name,
  ai_moderation_score,
  ai_moderation_reason,
  cross_audit_truth_score,
  cross_audit_confidence,
  cross_audit_reasoning,
  cross_audit_model,
  cross_audit_triage_models,
  cross_audit_completed_at,
  affected_users_count,
  incident_source,
  import_external_id,
  import_attribution,
  eu_act_transparency_score,
  eu_act_non_discrimination_score,
  eu_act_data_privacy_score,
  eu_act_risk_category,
  is_expert,
  expert_fix,
  eu_act_serious_incident_class,
  eu_act_high_risk_system_category,
  eu_act_reporting_deadline_days
) on public.incidents to anon, authenticated;
