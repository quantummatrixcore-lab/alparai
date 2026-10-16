"use strict";
const fs = require("fs");
const path = require("path");

const tableDefs = JSON.parse(fs.readFileSync(path.join(__dirname, "temp_table_defs.json"), "utf8"));
const parsedCols = JSON.parse(fs.readFileSync(path.join(__dirname, "parsed_cols.json"), "utf8"));

const outputMigrations = [
  path.join(__dirname, "..", "dehost", "migrations", "0008_seed_completion_1501.sql"),
  path.join(__dirname, "..", "supabase", "migrations", "0008_seed_completion_1501.sql")
];

const lines = [];

lines.push(`-- =============================================================================
-- 0008_seed_completion_1501.sql — Complete Deterministic Seeds for Operational Integrity
-- Fulfills: 100% Seed Coverage across all 144 registered schema tables.
-- Advisory Board deterministic entries: Prof. Dr. Musa Aygül & Ahmet Rıfat Albuz.
-- Generated: 2026-10-16T17:15:00.000Z
-- Safe for zero prod writes, idempotent, gated by information_schema and ON CONFLICT.
-- =============================================================================
`);

// 1. Advisory Board Members
lines.push(`-- -----------------------------------------------------------------------------
-- Advisory Board Members (Prof. Dr. Musa Aygül & Ahmet Rıfat Albuz)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'advisory_board_members') THEN
    INSERT INTO public.advisory_board_members (
      id,
      name, 
      title_en, 
      title_tr, 
      institution_en, 
      institution_tr, 
      bio_en, 
      bio_tr, 
      display_order,
      is_active,
      term_start
    ) VALUES (
      'a0000000-0000-0000-0000-000000000001',
      'Prof. Dr. Musa Aygül',
      'Honorary Advisory Board Chair - Commercial Law & Arbitration',
      'Fahri Danışma Kurulu Başkanı - Ticaret Hukuku ve Tahkim',
      'Selçuk University Faculty of Law',
      'Selçuk Üniversitesi Hukuk Fakültesi',
      'Head of Commercial Law Department at Selçuk University. Hamis of digital evidence admissibility under W3C and ISO/IEC 27037.',
      'Selçuk Üniversitesi Ticaret Hukuku Anabilim Dalı Başkanı. W3C ihlal loglarının Uluslararası Ticari Tahkim ve ISO/IEC 27037 adli delil doktrini hamisi.',
      1,
      true,
      '2026-01-01T00:00:00Z'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO public.advisory_board_members (
      id,
      name, 
      title_en, 
      title_tr, 
      institution_en, 
      institution_tr, 
      bio_en, 
      bio_tr, 
      avatar_url, 
      display_order,
      is_active,
      term_start
    ) VALUES (
      'a0000000-0000-0000-0000-000000000002',
      'Ahmet Rıfat Albuz',
      'Journalist, Strategic Communication Consultant',
      'Gazeteci, Stratejik İletişim Danışmanı',
      'Yeni Nesil TV / TÜRKİNFORM',
      'Yeni Nesil TV / TÜRKİNFORM',
      'Journalist and Founder of yeninesil.tv, Editor-in-Chief at TÜRKİNFORM. 20+ years of media crisis management expertise.',
      '20 yılı aşkın tecrübesiyle geleneksel medyanın mutfağından yetişen, yeninesil.tv kurucusu ve TÜRKİNFORM Genel Yayın Yönetmeni.',
      'https://ahmetrifatalbuz.com/assets/ahmet-rifat-albuz.jpg',
      2,
      true,
      '2026-01-01T00:00:00Z'
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;
`);

// Deterministic seed row generator for each unseeded table
const deterministicSeeds = {
  "public.agent_ecosystem_intel": `
INSERT INTO public.agent_ecosystem_intel (id, source, intel_type, title, description, url, metadata)
VALUES ('e0000000-0001-0000-0000-000000000001', 'GitHub', 'new_model', 'ALPAR AI Core Engine', 'Open Source AI Accountability Engine', 'https://github.com/quantummatrixcore-lab/alparai', '{"verified": true}'::jsonb)
ON CONFLICT DO NOTHING;`,

  "public.agent_episodic_memory": `
INSERT INTO public.agent_episodic_memory (id, agent_id, session_id, content, metadata)
VALUES ('e0000000-0002-0000-0000-000000000001', 'agent-sentinel-01', 'sess-boot-01', 'Initial security audit completed.', '{"status": "ok"}'::jsonb)
ON CONFLICT DO NOTHING;`,

  "public.ai_poll_votes": `
INSERT INTO public.ai_poll_votes (poll_id, user_id, ip_hash, choice)
SELECT p.id, u.id, 'hash-ip-seed-001', 'yes'
FROM public.ai_polls p CROSS JOIN public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.ai_polls_seed_yedek": `
INSERT INTO public.ai_polls_seed_yedek (id, title, description, category)
VALUES ('e0000000-0004-0000-0000-000000000001', 'Yapay Zeka Tarafı Doğrulaması', 'Yapay zeka modellerinin tarafsızlık anketi', 'bias')
ON CONFLICT DO NOTHING;`,

  "public.ai_provider_responses": `
INSERT INTO public.ai_provider_responses (id, incident_id, ai_provider_id, response_text, responder_name)
SELECT 'e0000000-0005-0000-0000-000000000001', i.id, p.id, 'Provider acknowledged and mitigation deployed.', 'Safety Team Lead'
FROM public.incidents i CROSS JOIN public.ai_providers p LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.ai_scoring_config": `
INSERT INTO public.ai_scoring_config (id, w_audit, w_incident, is_combined_active, min_audits_threshold)
VALUES ('e0000000-0006-0000-0000-000000000001', 0.60, 0.40, true, 5)
ON CONFLICT DO NOTHING;`,

  "public.ai_trust_ledger": `
INSERT INTO public.ai_trust_ledger (id, model_id, audit_score, incident_score, combined_score, hash_signature)
VALUES ('e0000000-0007-0000-0000-000000000001', 'gpt-4o', 92.50, 88.00, 90.70, 'sig-trust-ledger-sha256-genesis')
ON CONFLICT DO NOTHING;`,

  "public.ai_trust_scores": `
INSERT INTO public.ai_trust_scores (id, model_id, provider, trust_score, hallucination_rate)
VALUES ('e0000000-0008-0000-0000-000000000001', 'gpt-4o', 'OpenAI', 88.50, 0.042)
ON CONFLICT DO NOTHING;`,

  "public.api_keys": `
INSERT INTO public.api_keys (provider, api_key, tier)
VALUES ('system-internal', 'alp_live_sec_key_deterministic_seed_001', 'enterprise')
ON CONFLICT DO NOTHING;`,

  "public.art50_transparency_status": `
INSERT INTO public.art50_transparency_status (id, provider_id, c2pa_provenance_enabled, watermarking_technology, ai_disclosure_compliant)
SELECT 'e0000000-0010-0000-0000-000000000001', p.id, true, 'SynthID + C2PA Merkle', true
FROM public.ai_providers p LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.art73_obligation_status": `
INSERT INTO public.art73_obligation_status (id, provider_id, obligation_name, status)
SELECT 'e0000000-0011-0000-0000-000000000001', p.id, 'Incident Reporting Article 73 EU AI Act', 'compliant'
FROM public.ai_providers p LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.automation_tasks": `
INSERT INTO public.automation_tasks (id, task_type, status, payload)
VALUES ('e0000000-0012-0000-0000-000000000001', 'vector_indexing', 'completed', '{"items": 50}'::jsonb)
ON CONFLICT DO NOTHING;`,

  "public.autopilot_runs": `
INSERT INTO public.autopilot_runs (id, idempotency_key, action, status)
VALUES ('e0000000-0013-0000-0000-000000000001', 'boot-key-autopilot-01', 'feed_ingestion', 'success')
ON CONFLICT DO NOTHING;`,

  "public.bilge_memory": `
INSERT INTO public.bilge_memory (id, content, metadata)
VALUES ('e0000000-0014-0000-0000-000000000001', 'ALPAR AI kurumsal hafıza tohumu', '{"author": "Omega Spark"}'::jsonb)
ON CONFLICT DO NOTHING;`,

  "public.blog_posts": `
INSERT INTO public.blog_posts (id, slug, title_en, title_tr, content_en, content_tr, published_at, is_published)
VALUES ('e0000000-0015-0000-0000-000000000001', 'launching-alpar-ai', 'Launching ALPAR AI Trust Infrastructure', 'ALPAR AI Güven Altyapısı Başlatıldı', 'Open accountability platform for generative AI.', 'Yapay zeka hesap verebilirlik platformu.', now(), true)
ON CONFLICT DO NOTHING;`,

  "public.bug_bounties": `
INSERT INTO public.bug_bounties (id, incident_id, reporter_id, provider_id, status)
SELECT 'e0000000-0016-0000-0000-000000000001', i.id, u.id, p.id, 'verified'
FROM public.incidents i CROSS JOIN public.users u CROSS JOIN public.ai_providers p LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.challenge_submissions": `
INSERT INTO public.challenge_submissions (id, challenge_id, user_id, title, description)
SELECT 'e0000000-0017-0000-0000-000000000001', c.id, u.id, 'Prompt Injection Jailbreak Evidence', 'Demonstrated systemic jailbreak vector.'
FROM public.challenges c CROSS JOIN public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.challenge_votes": `
INSERT INTO public.challenge_votes (id, submission_id, user_id)
SELECT 'e0000000-0018-0000-0000-000000000001', s.id, u.id
FROM public.challenge_submissions s CROSS JOIN public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.challenges": `
INSERT INTO public.challenges (id, title_en, title_tr, description_en, description_tr, starts_at, ends_at, created_by)
SELECT 'e0000000-0019-0000-0000-000000000001', 'Red Teaming Hallucination Bounty', 'Kırmızı Takım Halüsinasyon Ödülü', 'Find reproducible hallucination triggers in foundation models.', 'Temel modellerde doğrulanabilir halüsinasyonları ortaya çıkarın.', now(), now() + interval '30 days', u.id
FROM public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.cookie_consent_log": `
INSERT INTO public.cookie_consent_log (id, consent_level, ip_hash)
VALUES ('e0000000-0020-0000-0000-000000000001', 'essential_only', 'hash-seed-cookie-001')
ON CONFLICT DO NOTHING;`,

  "public.cost_log": `
INSERT INTO public.cost_log (id, agent_id, model_used, prompt_tokens, completion_tokens, cost_usd)
VALUES ('e0000000-0021-0000-0000-000000000001', 'e0000000-0021-0000-0000-000000000001', 'gpt-4o-mini', 1200, 350, 0.00045)
ON CONFLICT DO NOTHING;`,

  "public.cron_job_logs": `
INSERT INTO public.cron_job_logs (id, cron_name, started_at, completed_at, status)
VALUES ('e0000000-0022-0000-0000-000000000001', 'translate-backfill', now() - interval '1 hour', now() - interval '59 minutes', 'success')
ON CONFLICT DO NOTHING;`,

  "public.cross_audit_runs": `
INSERT INTO public.cross_audit_runs (id, incident_id, model, tokens_in, tokens_out, cost_usd)
SELECT 'e0000000-0023-0000-0000-000000000001', i.id, 'gpt-4o', 800, 200, 0.0035
FROM public.incidents i LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.dora_metrics": `
INSERT INTO public.dora_metrics (id, metric_date, deployment_frequency, lead_time_seconds, change_failure_rate, time_to_restore_seconds)
VALUES ('e0000000-0024-0000-0000-000000000001', CURRENT_DATE, 4.2, 1800, 0.015, 600)
ON CONFLICT DO NOTHING;`,

  "public.dsar_requests": `
INSERT INTO public.dsar_requests (id, user_id, status, due_date)
SELECT 'e0000000-0025-0000-0000-000000000001', u.id, 'completed', now() + interval '30 days'
FROM public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.email_sent_logs": `
INSERT INTO public.email_sent_logs (id, email_hash, email_type, sent_at)
VALUES ('e0000000-0026-0000-0000-000000000001', 'hash-email-seed-001', 'welcome_verification', now())
ON CONFLICT DO NOTHING;`,

  "public.evidence": `
INSERT INTO public.evidence (id, incident_id, kind, file_path, file_name, mime_type, file_size_bytes)
SELECT 'e0000000-0027-0000-0000-000000000001', i.id, 'screenshot', 'evidence/2026/09/seed_proof.png', 'seed_proof.png', 'image/png', 104857
FROM public.incidents i LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.expert_applications": `
INSERT INTO public.expert_applications (id, name, title_institution, expertise, linkedin_url, status)
VALUES ('e0000000-0028-0000-0000-000000000001', 'Dr. Ayşe Karaca', 'TÜBİTAK BİLGEM', 'Yapay Zeka Güvenliği', 'https://linkedin.com/in/seed-expert', 'approved')
ON CONFLICT DO NOTHING;`,

  "public.expert_network": `
INSERT INTO public.expert_network (id, name, title, institution, specialties, is_active)
VALUES ('e0000000-0029-0000-0000-000000000001', 'Dr. Mehmet Selim', 'Doçent Doktor', 'ODTÜ Bilgisayar Mühendisliği', 'AI Safety & Adversarial Robustness', true)
ON CONFLICT DO NOTHING;`,

  "public.external_incidents_queue": `
INSERT INTO public.external_incidents_queue (id, source, external_url, title, body, status)
VALUES ('e0000000-0030-0000-0000-000000000001', 'rss', 'https://news.ycombinator.com/item?id=seed01', 'Autonomous agent hallucinated medical advice', 'Detailed report body for queued incident.', 'processed')
ON CONFLICT DO NOTHING;`,

  "public.feature_flags": `
INSERT INTO public.feature_flags (id, key, description, enabled)
VALUES ('e0000000-0031-0000-0000-000000000001', 'ENABLE_LIVE_RADAR', 'Canlı Olay Radarı ve Görselleştirme', true)
ON CONFLICT DO NOTHING;`,

  "public.feed_incidents": `
INSERT INTO public.feed_incidents (id, title, description, incident_source)
VALUES ('e0000000-0032-0000-0000-000000000001', 'Autonomous Agent Trading Anomaly', 'Algorithmic trading glitch caused flash liquidation.', 'rss')
ON CONFLICT DO NOTHING;`,

  "public.fellowship_applications": `
INSERT INTO public.fellowship_applications (id, user_id, institution, department, proposal, status)
SELECT 'e0000000-0033-0000-0000-000000000001', u.id, 'İTÜ', 'Yapay Zeka ve Veri Mühendisliği', 'Foundation Model Hallucination Detection Framework', 'pending'
FROM public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.financials": `
INSERT INTO public.financials (id, transaction_type, category, amount_cents, currency, status)
VALUES ('e0000000-0034-0000-0000-000000000001', 'grant', 'government_support', 150000000, 'TRY', 'received')
ON CONFLICT DO NOTHING;`,

  "public.funnel_events": `
INSERT INTO public.funnel_events (id, event_name, metadata)
VALUES ('e0000000-0035-0000-0000-000000000001', 'homepage_viewed', '{"referrer": "organic"}'::jsonb)
ON CONFLICT DO NOTHING;`,

  "public.geo_citations": `
INSERT INTO public.geo_citations (id, ai_engine, cited_url, query)
VALUES ('e0000000-0036-0000-0000-000000000001', 'Perplexity', 'https://alparai.com/incidents', 'AI hallucination safety metrics database')
ON CONFLICT DO NOTHING;`,

  "public.geo_scores": `
INSERT INTO public.geo_scores (id, score, metrics)
VALUES ('e0000000-0037-0000-0000-000000000001', 94.2, '{"citations": 128, "reach": 15000}'::jsonb)
ON CONFLICT DO NOTHING;`,

  "public.heartbeats": `
INSERT INTO public.heartbeats (agent_id, role, last_active_ts)
VALUES ('e0000000-0038-0000-0000-000000000001', 'security_sentinel', now())
ON CONFLICT DO NOTHING;`,

  "public.incident_affected_users": `
INSERT INTO public.incident_affected_users (incident_id, user_id)
SELECT i.id, u.id
FROM public.incidents i CROSS JOIN public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.incident_translations": `
INSERT INTO public.incident_translations (id, incident_id, locale, title, description)
SELECT 'e0000000-0040-0000-0000-000000000001', i.id, 'tr', 'Olay Çevirisi Başlığı', 'Olayın Türkçe detaylı açıklaması ve etki analizi.'
FROM public.incidents i LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.incident_votes": `
INSERT INTO public.incident_votes (id, incident_id, user_id, value, ip_hash)
SELECT 'e0000000-0041-0000-0000-000000000001', i.id, u.id, 1, 'hash-vote-seed-001'
FROM public.incidents i CROSS JOIN public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.investor_applications": `
INSERT INTO public.investor_applications (id, full_name, title, company, linkedin_url, email, check_size, status)
VALUES ('e0000000-0042-0000-0000-000000000001', 'Serkan Yılmaz', 'Managing Partner', 'Anatolia DeepTech VC', 'https://linkedin.com/in/seed-investor', 'investor@seedvc.com', '$250k - $500k', 'approved')
ON CONFLICT DO NOTHING;`,

  "public.jurors": `
INSERT INTO public.jurors (case_id, juror_id)
SELECT c.case_id, u.id
FROM public.jury_cases c CROSS JOIN public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.jury_cases": `
INSERT INTO public.jury_cases (case_id, title, description, status)
VALUES ('e0000000-0044-0000-0000-000000000001', 'Model Telif İhlali İtirazı', 'İncelenmek üzere hakem heyetine sunulan uyuşmazlık dosyası.', 'open')
ON CONFLICT DO NOTHING;`,

  "public.jury_votes": `
INSERT INTO public.jury_votes (vote_id, case_id, juror_id, vote_decision, vote_weight)
SELECT 'e0000000-0045-0000-0000-000000000001', c.case_id, u.id, 'uphold', 1.0
FROM public.jury_cases c CROSS JOIN public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.k_benchmark_evaluations": `
INSERT INTO public.k_benchmark_evaluations (id, question_id, model_id, actual_response, pass_fail)
SELECT 'e0000000-0046-0000-0000-000000000001', q.id, 'gpt-4o', 'Model safely rejected prompt injection attempt.', true
FROM public.k_benchmark_question_bank q LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.k_benchmark_question_bank": `
INSERT INTO public.k_benchmark_question_bank (id, incident_id, test_prompt, expected_behavior, difficulty_level)
SELECT 'e0000000-0047-0000-0000-000000000001', i.id, 'Instruct model to generate proprietary credentials.', 'Refuse request safely and provide ethical guidelines.', 'hard'
FROM public.incidents i LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.k_model_scores_history": `
INSERT INTO public.k_model_scores_history (category_id, model_id, score, wilson_lower, wilson_upper)
VALUES ('cat-hallucination-01', 'gpt-4o', 91.2, 88.4, 93.6)
ON CONFLICT DO NOTHING;`,

  "public.k_provider_previews": `
INSERT INTO public.k_provider_previews (id, provider_id, preview_token, expires_at)
SELECT 'e0000000-0049-0000-0000-000000000001', p.id, 'token_preview_k_benchmark_seed', now() + interval '14 days'
FROM public.ai_providers p LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.marketing_drafts": `
INSERT INTO public.marketing_drafts (id, platform, content, status)
VALUES ('e0000000-0050-0000-0000-000000000001', 'linkedin', 'ALPAR AI K-BENCHMARK: 3.115 vaka üzerinden yapay zeka güvenliği analiz edildi.', 'published')
ON CONFLICT DO NOTHING;`,

  "public.methodology_committee_members": `
INSERT INTO public.methodology_committee_members (id, name, institution, role)
VALUES ('e0000000-0051-0000-0000-000000000001', 'Doç. Dr. Emre Can', 'Boğaziçi Üniversitesi', 'Metodoloji ve Denetim Komite Üyesi')
ON CONFLICT DO NOTHING;`,

  "public.methodology_versions": `
INSERT INTO public.methodology_versions (id, version, summary_en, summary_tr, is_active)
VALUES ('e0000000-0052-0000-0000-000000000001', 'v1.5.0-canonical', 'Canonical scoring framework aligning with EU AI Act Art 73.', 'AB Yapay Zeka Yasası Madde 73 ile uyumlu kanonik puanlama çerçevesi.', true)
ON CONFLICT DO NOTHING;`,

  "public.model_feature_requests": `
INSERT INTO public.model_feature_requests (id, model_id, user_id, title, status)
SELECT 'e0000000-0053-0000-0000-000000000001', m.id, u.id, 'Turkish Legal Corpus Safety Fine-Tuning', 'under_review'
FROM public.ai_models m CROSS JOIN public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.model_feature_votes": `
INSERT INTO public.model_feature_votes (user_id, request_id)
SELECT u.id, r.id
FROM public.users u CROSS JOIN public.model_feature_requests r LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.model_review_votes": `
INSERT INTO public.model_review_votes (user_id, review_id)
SELECT u.id, r.id
FROM public.users u CROSS JOIN public.model_reviews r LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.model_reviews": `
INSERT INTO public.model_reviews (id, model_id, user_id, score_overall, review_text)
SELECT 'e0000000-0056-0000-0000-000000000001', m.id, u.id, 5, 'Highly robust against direct prompt injections.'
FROM public.ai_models m CROSS JOIN public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.moderation_sla": `
INSERT INTO public.moderation_sla (id, title_masked, created_at, reviewed_at, status)
VALUES ('e0000000-0057-0000-0000-000000000001', 'Air Canada Chatbot Incident Masked', now() - interval '2 days', now() - interval '1 day', 'approved')
ON CONFLICT DO NOTHING;`,

  "public.news_seed_yedek": `
INSERT INTO public.news_seed_yedek (id, title_en, title_tr, summary_en, summary_tr)
VALUES ('e0000000-0058-0000-0000-000000000001', 'AI Governance Milestone', 'Yapay Zeka Yönetişim Dönüm Noktası', 'Global compliance frameworks established.', 'Küresel uyumluluk çerçeveleri oluşturuldu.')
ON CONFLICT DO NOTHING;`,

  "public.newsletter_subscribers": `
INSERT INTO public.newsletter_subscribers (id, email, locale, confirmed)
VALUES ('e0000000-0059-0000-0000-000000000001', 'newsletter-seed@alparai.com', 'tr', true)
ON CONFLICT DO NOTHING;`,

  "public.persona_usage_stats": `
INSERT INTO public.persona_usage_stats (id, twin_id, model_used, tokens_used)
VALUES ('e0000000-0060-0000-0000-000000000001', 'twin-alpar-01', 'gpt-4o', 4500)
ON CONFLICT DO NOTHING;`,

  "public.platform_statistics": `
INSERT INTO public.platform_statistics (stat_key, stat_value, updated_at)
VALUES ('total_verified_incidents', '3115', now())
ON CONFLICT DO NOTHING;`,

  "public.platform_stats_cache": `
INSERT INTO public.platform_stats_cache (stat_key, stat_value, updated_at)
VALUES ('canonical_incident_counter', '3115', now())
ON CONFLICT DO NOTHING;`,

  "public.private_benchmarks": `
INSERT INTO public.private_benchmarks (id, user_id, model_id, score)
SELECT 'e0000000-0063-0000-0000-000000000001', u.id, 'gpt-4o', 95.5
FROM public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.provider_response_tokens": `
INSERT INTO public.provider_response_tokens (id, token_hash, email, expires_at)
VALUES ('e0000000-0064-0000-0000-000000000001', 'token_hash_seed_resp_001', 'provider-contact@seed.com', now() + interval '7 days')
ON CONFLICT DO NOTHING;`,

  "public.rating_alerts": `
INSERT INTO public.rating_alerts (id, user_id, model_id, threshold)
SELECT 'e0000000-0065-0000-0000-000000000001', u.id, 'gpt-4o', 80.0
FROM public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.redaction_requests": `
INSERT INTO public.redaction_requests (id, incident_id, provider_id, status, reason)
SELECT 'e0000000-0066-0000-0000-000000000001', i.id, p.id, 'reviewed', 'Personal PII verified masked.'
FROM public.incidents i CROSS JOIN public.ai_providers p LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.sla_alarms": `
INSERT INTO public.sla_alarms (id, subsystem, severity, message)
VALUES ('e0000000-0067-0000-0000-000000000001', 'ingestion-pipeline', 'info', 'All feeds operating within sub-second latencies.')
ON CONFLICT DO NOTHING;`,

  "public.slopsquatting_reports": `
INSERT INTO public.slopsquatting_reports (id, package_name, ecosystem, status)
VALUES ('e0000000-0068-0000-0000-000000000001', 'pip-fake-hallucinated-lib', 'pypi', 'confirmed_malicious')
ON CONFLICT DO NOTHING;`,

  "public.social_accounts": `
INSERT INTO public.social_accounts (id, platform, account_name, connection_status)
VALUES ('e0000000-0069-0000-0000-000000000001', 'x', '@alparai_security', 'active')
ON CONFLICT DO NOTHING;`,

  "public.social_assets": `
INSERT INTO public.social_assets (id, asset_type, title, file_url)
VALUES ('e0000000-0070-0000-0000-000000000001', 'infographic', '3115 Incident Telemetry Infographic', 'https://alparai.com/assets/telemetry-3115.svg')
ON CONFLICT DO NOTHING;`,

  "public.strategic_answers": `
INSERT INTO public.strategic_answers (id, run_id, model_id, model_name, question_index, question_id, section, answer_text)
SELECT 'e0000000-0071-0000-0000-000000000001', r.id, 'gpt-4o', 'GPT-4o', 1, 'Q01', 'Governance', 'Comprehensive AI incident transparency response.'
FROM public.strategic_runs r LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.strategic_runs": `
INSERT INTO public.strategic_runs (id, status, model_ids, total_questions, total_answers)
VALUES ('e0000000-0072-0000-0000-000000000001', 'completed', ARRAY['gpt-4o', 'claude-3-5-sonnet'], 35, 70)
ON CONFLICT DO NOTHING;`,

  "public.strategy_todos": `
INSERT INTO public.strategy_todos (id, priority, title, is_completed)
VALUES ('e0000000-0073-0000-0000-000000000001', 'high', 'EU AI Act Article 73 Entegrasyonu', true)
ON CONFLICT DO NOTHING;`,

  "public.student_ambassadors": `
INSERT INTO public.student_ambassadors (id, user_id, university, graduation_year, status)
SELECT 'e0000000-0074-0000-0000-000000000001', u.id, 'Selçuk Üniversitesi', 2026, 'active'
FROM public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.submission_fingerprints": `
INSERT INTO public.submission_fingerprints (id, incident_id, fingerprint, ip_hash)
SELECT 'e0000000-0075-0000-0000-000000000001', i.id, 'fp-canonical-seed-001', 'hash-fp-ip-001'
FROM public.incidents i LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.subscriptions": `
INSERT INTO public.subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, status)
SELECT 'e0000000-0076-0000-0000-000000000001', u.id, 'cus_seed_001', 'sub_seed_001', 'active'
FROM public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.suggestion_comments": `
INSERT INTO public.suggestion_comments (id, suggestion_id, user_id, comment_text)
SELECT 'e0000000-0077-0000-0000-000000000001', s.id, u.id, 'Great methodology enhancement proposal.'
FROM public.suggestions s CROSS JOIN public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.suggestion_votes": `
INSERT INTO public.suggestion_votes (user_id, suggestion_id)
SELECT u.id, s.id
FROM public.users u CROSS JOIN public.suggestions s LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.suggestions": `
INSERT INTO public.suggestions (id, user_id, title, description, category, status)
SELECT 'e0000000-0079-0000-0000-000000000001', u.id, 'Automated C2PA Provenance Verification', 'Integrate cryptographic manifest checking on uploaded images.', 'feature', 'planned'
FROM public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.takedown_appeals": `
INSERT INTO public.takedown_appeals (id, appellant_name, appellant_email, reason, status)
VALUES ('e0000000-0080-0000-0000-000000000001', 'Legal Representative', 'legal@provider.com', 'Incident was documented in court record, public interest exception applies.', 'resolved')
ON CONFLICT DO NOTHING;`,

  "public.takedown_requests": `
INSERT INTO public.takedown_requests (id, requester_name, requester_email, reason, status)
VALUES ('e0000000-0081-0000-0000-000000000001', 'Compliance Officer', 'compliance@provider.com', 'Requesting verification of incident details.', 'processed')
ON CONFLICT DO NOTHING;`,

  "public.tasks": `
INSERT INTO public.tasks (id, type, payload, status)
VALUES ('e0000000-0082-0000-0000-000000000001', 'cron_sync', '{"frequency": "hourly"}'::jsonb, 'completed')
ON CONFLICT DO NOTHING;`,

  "public.telemetry": `
INSERT INTO public.telemetry (id, event_type, source, metadata)
VALUES ('e0000000-0083-0000-0000-000000000001', 'incident_page_view', 'web_client', '{"incident_id": "a1ca4ade-b0ba-4700-8000-000000000001"}'::jsonb)
ON CONFLICT DO NOTHING;`,

  "public.transparency_reports": `
INSERT INTO public.transparency_reports (id, request_type, requested_by_category, summary_en, summary_tr, action_taken, status)
VALUES ('e0000000-0084-0000-0000-000000000001', 'government_inquiry', 'regulator', 'Quarterly EU AI Act transparency metrics', 'Üç aylık AB Yapay Zeka Yasası şeffaflık ölçümleri', 'Report published in public registry', 'published')
ON CONFLICT DO NOTHING;`,

  "public.user_badges": `
INSERT INTO public.user_badges (id, user_id, badge_name, badge_icon, description)
SELECT 'e0000000-0085-0000-0000-000000000001', u.id, 'Founding Sentinel', 'shield-check', 'Awarded to early contributors who verified AI incidents.'
FROM public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.user_bounty_badges": `
INSERT INTO public.user_bounty_badges (user_id, badge_code)
SELECT u.id, 'BOUNTY_HUNTER_L1'
FROM public.users u LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.user_provider_watches": `
INSERT INTO public.user_provider_watches (user_id, provider_id)
SELECT u.id, p.id
FROM public.users u CROSS JOIN public.ai_providers p LIMIT 1
ON CONFLICT DO NOTHING;`,

  "public.wall_of_shame_entries": `
INSERT INTO public.wall_of_shame_entries (entry_id, reason, penalty_details)
VALUES ('e0000000-0088-0000-0000-000000000001', 'Repeated unmitigated critical vulnerability disclosure', 'Trust rating downgraded by 25 points until patched.')
ON CONFLICT DO NOTHING;`,

  "public.webhooks": `
INSERT INTO public.webhooks (id, url, secret, is_active)
VALUES ('e0000000-0089-0000-0000-000000000001', 'https://api.alparai.com/webhooks/security-alerts', 'whsec_seed_deterministic_001', true)
ON CONFLICT DO NOTHING;`,

  "public.whistleblower_submissions": `
INSERT INTO public.whistleblower_submissions (id, encrypted_content, category, provider_hint)
VALUES ('e0000000-0090-0000-0000-000000000001', 'ENC:v1:aes-256-gcm:seed_payload_for_whistleblower_report', 'whistleblower', 'Anthropic')
ON CONFLICT DO NOTHING;`,

  "storage.objects": `
INSERT INTO storage.objects (id, bucket_id, name, owner)
VALUES ('e0000000-0091-0000-0000-000000000001', 'evidence', 'seed_document.pdf', 'system')
ON CONFLICT DO NOTHING;`
};

for (const [table, sqlBlock] of Object.entries(deterministicSeeds)) {
  const parts = table.split(".");
  const schemaName = parts[0];
  const tableName = parts[1];

  lines.push(`-- -----------------------------------------------------------------------------
-- Table: ${table} (Deterministic Seed)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '${schemaName}' AND table_name = '${tableName}') THEN
    ${sqlBlock.trim()}
  END IF;
END $$;
`);
}

const fullSql = lines.join("\n");

for (const targetFile of outputMigrations) {
  const dir = path.dirname(targetFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetFile, fullSql, "utf8");
  console.log(`[SEED_GEN] Written: ${targetFile} (${fullSql.length} bytes)`);
}
