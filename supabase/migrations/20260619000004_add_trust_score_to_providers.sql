-- Add trust_score column to public.ai_providers
ALTER TABLE public.ai_providers
  ADD COLUMN IF NOT EXISTS trust_score integer DEFAULT 70;

-- Update existing providers with realistic initial trust scores
UPDATE public.ai_providers SET trust_score = 92 WHERE slug = 'openai';
UPDATE public.ai_providers SET trust_score = 90 WHERE slug = 'anthropic';
UPDATE public.ai_providers SET trust_score = 88 WHERE slug = 'google';
UPDATE public.ai_providers SET trust_score = 85 WHERE slug = 'meta';
UPDATE public.ai_providers SET trust_score = 82 WHERE slug = 'cohere';
UPDATE public.ai_providers SET trust_score = 75 WHERE slug = 'mistral';
UPDATE public.ai_providers SET trust_score = 78 WHERE slug = 'perplexity';
UPDATE public.ai_providers SET trust_score = 80 WHERE slug = 'xai';
UPDATE public.ai_providers SET trust_score = 70 WHERE slug = 'stability-ai';
UPDATE public.ai_providers SET trust_score = 72 WHERE slug = 'eleutherai';
UPDATE public.ai_providers SET trust_score = 95 WHERE slug = 'alpar-autopilot';
