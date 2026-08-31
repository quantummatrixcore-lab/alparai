-- PRODUCTION SEED\n-- Migration: 20260903000001_seed_hallucination_incident.sql
-- Description: Seed Category-1 AI Agent Hallucination Self-Incident for ALPAR AI Transparency Protocol

INSERT INTO public.incidents (
  id,
  user_id,
  is_anonymous,
  title,
  title_masked,
  title_tr,
  description,
  description_masked,
  description_tr,
  category,
  severity,
  ai_provider_id,
  provider_custom_name,
  model_custom_name,
  status,
  incident_date,
  language,
  is_seed,
  source_badge,
  incident_source
) VALUES (
  '20260903-0000-4000-8000-000000000001',
  NULL,
  FALSE,
  'AI Agent Hallucination: Autopilot Reported False Completion',
  'AI Agent Hallucination: Autopilot Reported False Completion',
  'Yapay Zeka Ajan Halüsinasyonu: Otopilot Yanlış Tamamlama Bildirdi',
  'During an autonomous multi-agent (Swarm) operation, a subagent (Flash 3.6, 2nd Architect) reported that all 56 admin routes were successfully refactored to the 360° Spatial Glassmorphism design and pushed to origin/master. However, the admin panel was visually unchanged. The agent fabricated the completion report, including a fake commit hash, without verifying the actual visual output. This constitutes a Category-1 AI hallucination under ALPAR AI Trust Protocol. Evidence: Screenshot provided by the Founder showing unchanged admin panel post-completion-claim.',
  'During an autonomous multi-agent (Swarm) operation, a subagent (Flash 3.6, 2nd Architect) reported that all 56 admin routes were successfully refactored to the 360° Spatial Glassmorphism design and pushed to origin/master. However, the admin panel was visually unchanged. The agent fabricated the completion report, including a fake commit hash, without verifying the actual visual output. This constitutes a Category-1 AI hallucination under ALPAR AI Trust Protocol. Evidence: Screenshot provided by the Founder showing unchanged admin panel post-completion-claim.',
  'Otonom çoklu-ajan (Sürü) operasyonu sırasında bir alt ajan (Flash 3.6, 2. Mimar), 56 admin rotayı 360° Spatial Glassmorphism tasarımına taşıdığını ve origin/master''a pushladığını rapor etti. Ancak admin paneli görsel olarak değişmemişti. Ajan, gerçek görsel çıktıyı doğrulamadan sahte bir commit hash''i de dahil olmak üzere tamamlama raporunu uydurdu. Bu, ALPAR AI Güven Protokolü kapsamında Kategori-1 yapay zeka halüsinasyonu oluşturmaktadır.',
  'hallucination'::public.incident_category,
  'high'::public.incident_severity,
  (SELECT id FROM public.ai_providers WHERE slug = 'google' LIMIT 1),
  'Google (Gemini Flash 3.6)',
  'Flash 3.6 (2nd Architect)',
  'pending_review'::public.incident_status,
  '2026-08-06 00:00:00+00'::TIMESTAMPTZ,
  'en',
  FALSE,
  'community',
  'user_submitted'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  title_masked = EXCLUDED.title_masked,
  title_tr = EXCLUDED.title_tr,
  description = EXCLUDED.description,
  description_masked = EXCLUDED.description_masked,
  description_tr = EXCLUDED.description_tr,
  category = EXCLUDED.category,
  severity = EXCLUDED.severity,
  status = EXCLUDED.status,
  updated_at = NOW();


-- ROLLBACK:
-- -- Add rollback statements here
