-- ============================================================================
-- 20260620000003_seed_2026_modern_models.sql
-- Seeds the newest AI models as of mid-2026
-- ============================================================================

-- OpenAI
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
  ('GPT-5', '5.0', 'active', '2025-11-15'),
  ('GPT-5 mini', '5.0-mini', 'active', '2026-02-12'),
  ('o4', 'o4', 'active', '2026-01-20'),
  ('o5', 'o5', 'active', '2026-05-18')
) as m(name, version, status, released_at)
where p.slug = 'openai'
on conflict do nothing;

-- Anthropic
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
  ('Claude 4.5 Sonnet', '4.5', 'active', '2025-12-05'),
  ('Claude 4.5 Opus', '4.5-opus', 'active', '2026-02-14'),
  ('Claude 4.6 Sonnet', '4.6', 'active', '2026-04-10'),
  ('Claude 4.7 Opus', '4.7-opus', 'active', '2026-05-15'),
  ('Claude 4.8 Sonnet', '4.8', 'active', '2026-06-01'),
  ('Claude 4.8 Opus', '4.8-opus', 'active', '2026-06-18')
) as m(name, version, status, released_at)
where p.slug = 'anthropic'
on conflict do nothing;


-- Google
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
  ('Gemini 3.0 Flash', '3.0', 'active', '2025-11-20'),
  ('Gemini 3.5 Pro', '3.5-pro', 'active', '2026-03-08'),
  ('Gemini 3.5 Flash', '3.5-flash', 'active', '2026-05-22')
) as m(name, version, status, released_at)
where p.slug = 'google'
on conflict do nothing;

-- Meta
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
  ('Llama 4.5 405B', '4.5-405B', 'active', '2025-10-18'),
  ('Llama 4.5 70B', '4.5-70B', 'active', '2025-11-05'),
  ('Llama 5 Scout', '5.0-scout', 'active', '2026-04-20')
) as m(name, version, status, released_at)
where p.slug = 'meta'
on conflict do nothing;

-- xAI
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
  ('Grok 4', 'grok-4', 'active', '2025-12-15'),
  ('Grok 4.5', 'grok-4.5', 'active', '2026-05-10')
) as m(name, version, status, released_at)
where p.slug = 'xai'
on conflict do nothing;

-- DeepSeek
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
  ('DeepSeek-V3', 'v3', 'active', '2024-12-26'),
  ('DeepSeek-V4', 'v4', 'active', '2025-11-30')
) as m(name, version, status, released_at)
where p.slug = 'deepseek'
on conflict do nothing;

-- Qwen
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
  ('Qwen 2.5', '2.5', 'active', '2024-09-19'),
  ('Qwen 3.0', '3.0', 'active', '2025-10-25')
) as m(name, version, status, released_at)
where p.slug = 'qwen'
on conflict do nothing;
