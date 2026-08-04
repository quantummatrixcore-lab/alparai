-- ============================================================================
-- 20260701201000_seed_massive_ai_ecosystem.sql
-- Seeds a massive list of 50+ AI providers and 150+ models including 2025/2026 releases
-- ============================================================================

-- 1. Insert new AI Providers (if they don't exist)
INSERT INTO public.ai_providers (slug, name, description, website_url, is_verified, trust_score) VALUES
  ('apple', 'Apple', 'Apple Intelligence foundation models and client-side agent frameworks.', 'https://apple.com', true, 88),
  ('amazon', 'Amazon', 'Amazon Titan and Bedrock foundation model orchestration services.', 'https://aws.amazon.com', true, 82),
  ('character-ai', 'Character.ai', 'Conversational AI platform for interactive user-defined characters.', 'https://character.ai', false, 74),
  ('reka', 'Reka AI', 'Advanced multimodal assistant models.', 'https://reka.ai', false, 78),
  ('adept', 'Adept AI', 'Action transformer models for browser and system automation.', 'https://adept.ai', false, 72),
  ('cognition', 'Cognition AI', 'Autonomous AI software engineering agents (Devin series).', 'https://cognition.ai', false, 76),
  ('harvey', 'Harvey AI', 'Enterprise generative AI custom-built for professional legal systems.', 'https://harvey.ai', true, 85),
  ('phind', 'Phind', 'Developer-focused search engine and coding language models.', 'https://phind.com', false, 79),
  ('poolside', 'Poolside', 'AI models optimized for code generation and software development.', 'https://poolside.ai', false, 75),
  ('magic', 'Magic AI', 'Long-context models built for software engineering automation.', 'https://magic.dev', false, 77),
  ('writer', 'Writer', 'Enterprise-grade generative AI platform and Palmyra models.', 'https://writer.com', true, 83),
  ('synthesia', 'Synthesia', 'AI video generation platform for enterprise video communication.', 'https://synthesia.io', true, 80),
  ('heygen', 'HeyGen', 'AI avatar and localized video creation platform.', 'https://heygen.com', false, 76),
  ('pika', 'Pika Labs', 'Generative AI video platform for creative video generation.', 'https://pika.art', false, 74),
  ('luma', 'Luma AI', 'Dream Machine video generation and 3D modeling AI.', 'https://lumalabs.ai', false, 76),
  ('suno', 'Suno AI', 'AI music and song generation platform.', 'https://suno.com', false, 72),
  ('udio', 'Udio', 'Advanced music generation and audio synthesis AI.', 'https://udio.com', false, 73),
  ('together', 'Together AI', 'Decentralized cloud platform for open-source AI models.', 'https://together.ai', true, 84),
  ('anyscale', 'Anyscale', 'Ray framework and serverless endpoint provider.', 'https://anyscale.com', true, 81),
  ('fireworks', 'Fireworks AI', 'Lightning-fast inference cloud for generative AI models.', 'https://fireworks.ai', true, 83),
  ('replicate', 'Replicate', 'Serverless hosting and API provider for open-source AI models.', 'https://replicate.com', true, 82),
  ('scale', 'Scale AI', 'Data labeling and AI alignment validation platform.', 'https://scale.com', true, 86),
  ('huggingface', 'Hugging Face', 'The collaborative platform for open-source machine learning and models.', 'https://huggingface.co', true, 89),
  ('sambanova', 'SambaNova Systems', 'High-performance AI hardware and software solutions.', 'https://sambanova.ai', false, 75),
  ('cerebras', 'Cerebras Systems', 'Cerebras AI inference and wafer-scale hardware solutions.', 'https://cerebras.ai', false, 76),
  ('nvidia', 'Nvidia', 'Nvidia NIM endpoints, compute platforms, and Nemotron models.', 'https://nvidia.com', true, 89),
  ('adobe', 'Adobe', 'Firefly creative generative AI models and assets.', 'https://adobe.com', true, 85),
  ('notion', 'Notion', 'Notion AI workspace assistant and document editing.', 'https://notion.so', true, 82),
  ('brave', 'Brave', 'Brave Leo browser AI privacy-focused assistant.', 'https://brave.com', true, 87),
  ('poe', 'Quora (Poe)', 'Multi-model chat aggregator platform.', 'https://poe.com', false, 75),
  ('assemblyai', 'AssemblyAI', 'Speech-to-text and audio intelligence APIs.', 'https://assemblyai.com', true, 81),
  ('lepton', 'Lepton AI', 'Developer-centric serverless AI deployment platform.', 'https://lepton.ai', false, 76),
  ('lightricks', 'Lightricks', 'AI creative studio, photography, and video generation apps.', 'https://lightricks.com', false, 73),
  ('leonardo', 'Leonardo.ai', 'Creative production platform for generative image assets.', 'https://leonardo.ai', false, 74)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  website_url = EXCLUDED.website_url,
  trust_score = EXCLUDED.trust_score;

-- 2. Insert new AI Models for 2025/2026 and existing providers
-- We will fetch provider_ids dynamically

-- OpenAI Models
INSERT INTO public.ai_models (provider_id, name, version, status, released_at)
SELECT p.id, m.name, m.version, m.status, m.released_at::date
FROM public.ai_providers p
CROSS JOIN (VALUES
  ('GPT-5.2', '5.2', 'active', '2025-12-05'),
  ('GPT-5.2 Instant', '5.2-instant', 'active', '2025-12-20'),
  ('GPT-5.1 Codex Max', '5.1-codex-max', 'active', '2025-11-10'),
  ('Sora 2', 'sora-2', 'active', '2025-09-12'),
  ('GPT-4o', '4o', 'active', '2024-05-13'),
  ('GPT-4o mini', '4o-mini', 'active', '2024-07-18'),
  ('o3', 'o3', 'active', '2025-04-16'),
  ('o3-mini', 'o3-mini', 'active', '2025-04-16'),
  ('o4', 'o4', 'active', '2026-01-20'),
  ('o4-mini', 'o4-mini', 'active', '2025-04-16'),
  ('o5', 'o5', 'active', '2026-05-18'),
  ('GPT-5', '5.0', 'active', '2025-11-15'),
  ('GPT-5 mini', '5.0-mini', 'active', '2026-02-12'),
  ('GPT-4.5', '4.5', 'active', '2024-12-15')
) as m(name, version, status, released_at)
WHERE p.slug = 'openai'
AND NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE provider_id = p.id AND name = m.name AND version = m.version
);

-- Anthropic Models
INSERT INTO public.ai_models (provider_id, name, version, status, released_at)
SELECT p.id, m.name, m.version, m.status, m.released_at::date
FROM public.ai_providers p
CROSS JOIN (VALUES
  ('Claude 3.5 Sonnet', '3.5-sonnet', 'active', '2024-10-22'),
  ('Claude 3.5 Opus', '3.5-opus', 'active', '2024-12-10'),
  ('Claude 3.7 Sonnet', '3.7-sonnet', 'active', '2025-02-19'),
  ('Claude 4 Sonnet', '4.0-sonnet', 'active', '2025-05-22'),
  ('Claude 4.5 Sonnet', '4.5-sonnet', 'active', '2025-12-05'),
  ('Claude 4.5 Opus', '4.5-opus', 'active', '2026-02-14'),
  ('Claude 4.6 Sonnet', '4.6-sonnet', 'active', '2026-04-10'),
  ('Claude 4.7 Opus', '4.7-opus', 'active', '2026-05-15'),
  ('Claude 4.8 Sonnet', '4.8-sonnet', 'active', '2026-06-01'),
  ('Claude 4.8 Opus', '4.8-opus', 'active', '2026-06-18'),
  ('Claude Fable 5', '5.0-fable', 'active', '2026-06-25')
) as m(name, version, status, released_at)
WHERE p.slug = 'anthropic'
AND NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE provider_id = p.id AND name = m.name AND version = m.version
);

-- Google Models
INSERT INTO public.ai_models (provider_id, name, version, status, released_at)
SELECT p.id, m.name, m.version, m.status, m.released_at::date
FROM public.ai_providers p
CROSS JOIN (VALUES
  ('Gemini 1.5 Pro', '1.5-pro', 'active', '2024-05-14'),
  ('Gemini 1.5 Flash', '1.5-flash', 'active', '2024-05-14'),
  ('Gemini 2.0 Flash', '2.0-flash', 'active', '2025-02-05'),
  ('Gemini 2.5 Pro', '2.5-pro', 'active', '2025-05-06'),
  ('Gemini 2.5 Flash', '2.5-flash', 'active', '2025-05-06'),
  ('Gemini 3.0 Pro', '3.0-pro', 'active', '2025-11-20'),
  ('Gemini 3.0 Flash', '3.0-flash', 'active', '2025-11-20'),
  ('Gemini 3.5 Pro', '3.5-pro', 'active', '2026-03-08'),
  ('Gemini 3.5 Flash', '3.5-flash', 'active', '2026-05-22'),
  ('Gemma 2 9B', 'gemma-2-9b', 'active', '2024-06-27'),
  ('Gemma 2 27B', 'gemma-2-27b', 'active', '2024-06-27'),
  ('Gemma 3 8B', 'gemma-3-8b', 'active', '2025-03-12'),
  ('Gemma 4 9B', 'gemma-4-9b', 'active', '2026-04-12'),
  ('Gemma 4 31B', 'gemma-4-31b', 'active', '2026-04-18'),
  ('Veo 3.1', 'veo-3.1', 'active', '2026-01-05')
) as m(name, version, status, released_at)
WHERE p.slug = 'google'
AND NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE provider_id = p.id AND name = m.name AND version = m.version
);

-- Meta Models
INSERT INTO public.ai_models (provider_id, name, version, status, released_at)
SELECT p.id, m.name, m.version, m.status, m.released_at::date
FROM public.ai_providers p
CROSS JOIN (VALUES
  ('Llama 3 8B', '3-8b', 'active', '2024-04-18'),
  ('Llama 3 70B', '3-70b', 'active', '2024-04-18'),
  ('Llama 3.1 8B', '3.1-8b', 'active', '2024-07-23'),
  ('Llama 3.1 70B', '3.1-70b', 'active', '2024-07-23'),
  ('Llama 3.1 405B', '3.1-405b', 'active', '2024-07-23'),
  ('Llama 3.2 3B', '3.2-3b', 'active', '2024-09-25'),
  ('Llama 3.3 70B', '3.3-70b', 'active', '2024-12-06'),
  ('Llama 4 Maverick', '4.0-maverick', 'active', '2025-11-20'),
  ('Llama 4 Scout', '4.0-scout', 'active', '2026-04-20'),
  ('Llama 4.5 70B', '4.5-70b', 'active', '2025-11-05'),
  ('Llama 4.5 405B', '4.5-405b', 'active', '2025-10-18'),
  ('Llama 5 Scout', '5.0-scout', 'active', '2026-04-20')
) as m(name, version, status, released_at)
WHERE p.slug = 'meta'
AND NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE provider_id = p.id AND name = m.name AND version = m.version
);

-- xAI Models
INSERT INTO public.ai_models (provider_id, name, version, status, released_at)
SELECT p.id, m.name, m.version, m.status, m.released_at::date
FROM public.ai_providers p
CROSS JOIN (VALUES
  ('Grok 2', '2.0', 'active', '2024-08-13'),
  ('Grok 3', '3.0', 'active', '2024-12-01'),
  ('Grok 3 mini', '3.0-mini', 'active', '2025-02-18'),
  ('Grok 4', '4.0', 'active', '2025-12-15'),
  ('Grok 4.5', '4.5', 'active', '2026-05-10')
) as m(name, version, status, released_at)
WHERE p.slug = 'xai'
AND NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE provider_id = p.id AND name = m.name AND version = m.version
);

-- DeepSeek Models
INSERT INTO public.ai_models (provider_id, name, version, status, released_at)
SELECT p.id, m.name, m.version, m.status, m.released_at::date
FROM public.ai_providers p
CROSS JOIN (VALUES
  ('DeepSeek-V2.5', 'v2.5', 'active', '2024-09-05'),
  ('DeepSeek-V3', 'v3', 'active', '2024-12-26'),
  ('DeepSeek-Coder-V2', 'coder-v2', 'active', '2024-06-17'),
  ('DeepSeek-R1', 'r1', 'active', '2025-01-20'),
  ('DeepSeek-V3.2', 'v3.2', 'active', '2026-01-10'),
  ('DeepSeek-V4 Flash', 'v4-flash', 'active', '2026-04-15')
) as m(name, version, status, released_at)
WHERE p.slug = 'deepseek'
AND NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE provider_id = p.id AND name = m.name AND version = m.version
);

-- Alibaba Models
INSERT INTO public.ai_models (provider_id, name, version, status, released_at)
SELECT p.id, m.name, m.version, m.status, m.released_at::date
FROM public.ai_providers p
CROSS JOIN (VALUES
  ('Qwen 2 7B', '2-7b', 'active', '2024-06-07'),
  ('Qwen 2 72B', '2-72b', 'active', '2024-06-07'),
  ('Qwen 2.5 72B', '2.5-72b', 'active', '2024-09-19'),
  ('Qwen 2.5 Coder 32B', '2.5-coder-32b', 'active', '2024-11-12'),
  ('Qwen 3.0', '3.0', 'active', '2025-10-25')
) as m(name, version, status, released_at)
WHERE p.slug = 'alibaba'
AND NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE provider_id = p.id AND name = m.name AND version = m.version
);

-- Mistral Models
INSERT INTO public.ai_models (provider_id, name, version, status, released_at)
SELECT p.id, m.name, m.version, m.status, m.released_at::date
FROM public.ai_providers p
CROSS JOIN (VALUES
  ('Mistral Large 2', 'large-2', 'active', '2024-07-24'),
  ('Mistral Large 3', 'large-3', 'active', '2025-07-22'),
  ('Codestral', 'codestral', 'active', '2024-05-29'),
  ('Codestral 2.0', 'codestral-2.0', 'active', '2026-01-15'),
  ('Pixtral 12B', 'pixtral-12b', 'active', '2024-09-17'),
  ('Mistral NeMo', 'nemo', 'active', '2024-07-18')
) as m(name, version, status, released_at)
WHERE p.slug = 'mistral'
AND NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE provider_id = p.id AND name = m.name AND version = m.version
);

-- Apple Models
INSERT INTO public.ai_models (provider_id, name, version, status, released_at)
SELECT p.id, m.name, m.version, m.status, m.released_at::date
FROM public.ai_providers p
CROSS JOIN (VALUES
  ('Apple Foundation Model', 'afm', 'active', '2024-10-28'),
  ('Apple Foundation Model 2', 'afm-2', 'active', '2025-10-12'),
  ('AFM-3 Agentic', 'afm-3-agentic', 'active', '2026-05-08')
) as m(name, version, status, released_at)
WHERE p.slug = 'apple'
AND NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE provider_id = p.id AND name = m.name AND version = m.version
);

-- Microsoft Models
INSERT INTO public.ai_models (provider_id, name, version, status, released_at)
SELECT p.id, m.name, m.version, m.status, m.released_at::date
FROM public.ai_providers p
CROSS JOIN (VALUES
  ('Phi-3 Mini', 'phi-3-mini', 'active', '2024-04-23'),
  ('Phi-3.5 MoE', 'phi-3.5-moe', 'active', '2024-08-20'),
  ('Phi-4', 'phi-4', 'active', '2025-01-15'),
  ('Phi-4.5 Mini', 'phi-4.5-mini', 'active', '2026-03-10')
) as m(name, version, status, released_at)
WHERE p.slug = 'microsoft'
AND NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE provider_id = p.id AND name = m.name AND version = m.version
);

-- Cognition Models
INSERT INTO public.ai_models (provider_id, name, version, status, released_at)
SELECT p.id, m.name, m.version, m.status, m.released_at::date
FROM public.ai_providers p
CROSS JOIN (VALUES
  ('Devin 1.0', 'devin-1', 'active', '2024-03-12'),
  ('Devin 2.0', 'devin-2', 'active', '2025-04-10'),
  ('Devin 3.0', 'devin-3', 'active', '2026-02-15')
) as m(name, version, status, released_at)
WHERE p.slug = 'cognition'
AND NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE provider_id = p.id AND name = m.name AND version = m.version
);

-- Suno Models
INSERT INTO public.ai_models (provider_id, name, version, status, released_at)
SELECT p.id, m.name, m.version, m.status, m.released_at::date
FROM public.ai_providers p
CROSS JOIN (VALUES
  ('Suno v3.5', 'v3.5', 'active', '2024-07-02'),
  ('Suno v4', 'v4', 'active', '2024-12-18'),
  ('Suno v5', 'v5', 'active', '2025-11-15')
) as m(name, version, status, released_at)
WHERE p.slug = 'suno'
AND NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE provider_id = p.id AND name = m.name AND version = m.version
);

-- Midjourney Models
INSERT INTO public.ai_models (provider_id, name, version, status, released_at)
SELECT p.id, m.name, m.version, m.status, m.released_at::date
FROM public.ai_providers p
CROSS JOIN (VALUES
  ('Midjourney v6', 'v6', 'active', '2023-12-21'),
  ('Midjourney v7', 'v7', 'active', '2025-06-15'),
  ('Midjourney v8', 'v8', 'active', '2026-03-20')
) as m(name, version, status, released_at)
WHERE p.slug = 'midjourney'
AND NOT EXISTS (
  SELECT 1 FROM public.ai_models WHERE provider_id = p.id AND name = m.name AND version = m.version
);
