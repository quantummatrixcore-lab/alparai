-- ============================================================================
-- 20260620000001_seed_ai_models.sql
-- Seeds 14 major AI models across providers
-- ============================================================================

-- Insert models for each provider
-- First, let's get provider IDs via subqueries and insert models

-- OpenAI Models
insert into public.ai_models (id, provider_id, name, version, status, released_at)
select
  gen_random_uuid(),
  p.id,
  m.name,
  m.version,
  m.status,
  m.released_at::date
from public.ai_providers p
cross join (values
  ('GPT-4o', '2024-05', 'active', '2024-05-13'),
  ('GPT-4o mini', '2024-07', 'active', '2024-07-18'),
  ('o3', '2025-04', 'active', '2025-04-16'),
  ('o4-mini', '2025-04', 'active', '2025-04-16')
) as m(name, version, status, released_at)
where p.slug = 'openai'
on conflict do nothing;

-- Anthropic Models
insert into public.ai_models (id, provider_id, name, version, status, released_at)
select
  gen_random_uuid(),
  p.id,
  m.name,
  m.version,
  m.status,
  m.released_at::date
from public.ai_providers p
cross join (values
  ('Claude 3.5 Sonnet', '20241022', 'active', '2024-10-22'),
  ('Claude 3.7 Sonnet', '20250219', 'active', '2025-02-19'),
  ('Claude 4 Sonnet', '20250522', 'active', '2025-05-22')
) as m(name, version, status, released_at)
where p.slug = 'anthropic'
on conflict do nothing;

-- Google Models
insert into public.ai_models (id, provider_id, name, version, status, released_at)
select
  gen_random_uuid(),
  p.id,
  m.name,
  m.version,
  m.status,
  m.released_at::date
from public.ai_providers p
cross join (values
  ('Gemini 2.0 Flash', '002', 'active', '2025-02-05'),
  ('Gemini 2.5 Pro', 'preview-05-06', 'active', '2025-05-06'),
  ('Gemini 2.5 Flash', 'preview-05-20', 'active', '2025-05-20')
) as m(name, version, status, released_at)
where p.slug = 'google'
on conflict do nothing;

-- Meta Models
insert into public.ai_models (id, provider_id, name, version, status, released_at)
select
  gen_random_uuid(),
  p.id,
  m.name,
  m.version,
  m.status,
  m.released_at::date
from public.ai_providers p
cross join (values
  ('Llama 3.3 70B', '70B-Instruct', 'active', '2024-12-06'),
  ('Llama 4 Scout', '17B-16E', 'active', '2025-04-05'),
  ('Llama 4 Maverick', '17B-128E', 'active', '2025-04-05')
) as m(name, version, status, released_at)
where p.slug = 'meta'
on conflict do nothing;

-- xAI Models (Grok)
insert into public.ai_models (id, provider_id, name, version, status, released_at)
select
  gen_random_uuid(),
  p.id,
  m.name,
  m.version,
  m.status,
  m.released_at::date
from public.ai_providers p
cross join (values
  ('Grok 3', 'grok-3', 'active', '2025-02-17'),
  ('Grok 3 mini', 'grok-3-mini', 'active', '2025-04-09')
) as m(name, version, status, released_at)
where p.slug = 'xai'
on conflict do nothing;

-- Mistral Models
insert into public.ai_models (id, provider_id, name, version, status, released_at)
select
  gen_random_uuid(),
  p.id,
  m.name,
  m.version,
  m.status,
  m.released_at::date
from public.ai_providers p
cross join (values
  ('Mistral Large 2', '2407', 'active', '2024-07-24'),
  ('Mistral Small 3.2', '2503', 'active', '2025-03-18')
) as m(name, version, status, released_at)
where p.slug = 'mistral'
on conflict do nothing;
