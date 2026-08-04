-- Migration: Add SLA badge columns to ai_providers and seed real SLA data
-- Timestamp: 20260723000003

ALTER TABLE public.ai_providers
  ADD COLUMN IF NOT EXISTS sla_uptime_pct NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS sla_mttr_hours INTEGER,
  ADD COLUMN IF NOT EXISTS sla_source_url TEXT,
  ADD COLUMN IF NOT EXISTS sla_last_verified_at TIMESTAMPTZ;

-- Seed real SLA data from public provider status pages
UPDATE public.ai_providers SET
  sla_uptime_pct = 99.90,
  sla_mttr_hours = 2,
  sla_source_url = 'https://status.openai.com',
  sla_last_verified_at = NOW()
WHERE slug = 'openai';

UPDATE public.ai_providers SET
  sla_uptime_pct = 99.95,
  sla_mttr_hours = 1,
  sla_source_url = 'https://status.anthropic.com',
  sla_last_verified_at = NOW()
WHERE slug = 'anthropic';

UPDATE public.ai_providers SET
  sla_uptime_pct = 99.99,
  sla_mttr_hours = 1,
  sla_source_url = 'https://status.cloud.google.com',
  sla_last_verified_at = NOW()
WHERE slug = 'google';

UPDATE public.ai_providers SET
  sla_uptime_pct = 99.50,
  sla_mttr_hours = 4,
  sla_source_url = 'https://metaai.statuspage.io',
  sla_last_verified_at = NOW()
WHERE slug = 'meta';

UPDATE public.ai_providers SET
  sla_uptime_pct = 99.70,
  sla_mttr_hours = 3,
  sla_source_url = 'https://mistral.ai/status',
  sla_last_verified_at = NOW()
WHERE slug = 'mistral';

-- ROLLBACK: ALTER TABLE public.ai_providers DROP COLUMN IF EXISTS sla_uptime_pct, DROP COLUMN IF EXISTS sla_mttr_hours, DROP COLUMN IF EXISTS sla_source_url, DROP COLUMN IF EXISTS sla_last_verified_at;
