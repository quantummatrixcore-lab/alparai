-- Add new AI providers if they don't exist
INSERT INTO public.ai_providers (slug, name, description, website_url, is_verified)
VALUES
  ('qwen', 'Qwen', 'Alibaba Cloud Qwen Models', 'https://qwenlm.github.io/', true),
  ('deepseek', 'DeepSeek', 'DeepSeek AI Models', 'https://deepseek.com', true)
ON CONFLICT (slug) DO NOTHING;

-- Update display names for clarity
UPDATE public.ai_providers SET name = 'Anthropic (Claude)' WHERE slug = 'anthropic';
UPDATE public.ai_providers SET name = 'Google (Gemini)' WHERE slug = 'google';

-- Update all logo URLs
UPDATE public.ai_providers SET logo_url = '/logos/providers/openai.svg' WHERE slug = 'openai';
UPDATE public.ai_providers SET logo_url = '/logos/providers/anthropic.svg' WHERE slug = 'anthropic';
UPDATE public.ai_providers SET logo_url = '/logos/providers/google.svg' WHERE slug = 'google';
UPDATE public.ai_providers SET logo_url = '/logos/providers/meta.svg' WHERE slug = 'meta';
UPDATE public.ai_providers SET logo_url = '/logos/providers/mistral.svg' WHERE slug = 'mistral';
UPDATE public.ai_providers SET logo_url = '/logos/providers/cohere.svg' WHERE slug = 'cohere';
UPDATE public.ai_providers SET logo_url = '/logos/providers/perplexity.svg' WHERE slug = 'perplexity';
UPDATE public.ai_providers SET logo_url = '/logos/providers/xai.svg' WHERE slug = 'xai';
UPDATE public.ai_providers SET logo_url = '/logos/providers/qwen.svg' WHERE slug = 'qwen';
UPDATE public.ai_providers SET logo_url = '/logos/providers/deepseek.svg' WHERE slug = 'deepseek';

-- Remove dummy/test providers like 'ibm' if they were manually added (but not if incidents exist)
DELETE FROM public.ai_providers WHERE slug = 'ibm' AND NOT EXISTS (SELECT 1 FROM public.incidents WHERE ai_provider_id = public.ai_providers.id);
