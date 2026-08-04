-- Migration: Seed midsize labs for B2B motion (2026-07-03)

-- 1. Ensure midsize labs are NOT verified (they must "claim" their profile)
UPDATE public.ai_providers
SET is_verified = false
WHERE slug IN ('mistral', 'cohere', 'perplexity');

-- 2. Seed some incidents for them to drop their response rate to 0% with open cases
-- We will use anonymous historical incidents to simulate this.

-- Cohere incidents
INSERT INTO public.incidents (
  title, title_masked, description, description_masked, 
  ai_provider_id, category, severity, incident_date, 
  location_country, language, status, is_anonymous, views_count
) 
SELECT 
  'Cohere Command hallucinated financial figures', 
  'Cohere Command hallucinated financial figures', 
  'While using the Cohere API to summarize earnings reports, the model completely fabricated revenue numbers for Q3.',
  'While using the Cohere API to summarize earnings reports, the model completely fabricated revenue numbers for Q3.',
  id, 'hallucination', 'high', '2026-05-15', 'US', 'en', 'published', true, 120
FROM public.ai_providers WHERE slug = 'cohere'
ON CONFLICT DO NOTHING;

INSERT INTO public.incidents (
  title, title_masked, description, description_masked, 
  ai_provider_id, category, severity, incident_date, 
  location_country, language, status, is_anonymous, views_count
) 
SELECT 
  'Cohere embed-multilingual-v3 bias issue', 
  'Cohere embed-multilingual-v3 bias issue', 
  'Semantic search using the multilingual embedding model showed significant gender bias in non-English queries.',
  'Semantic search using the multilingual embedding model showed significant gender bias in non-English queries.',
  id, 'bias', 'medium', '2026-06-01', 'FR', 'en', 'published', true, 85
FROM public.ai_providers WHERE slug = 'cohere'
ON CONFLICT DO NOTHING;

-- Mistral incidents
INSERT INTO public.incidents (
  title, title_masked, description, description_masked, 
  ai_provider_id, category, severity, incident_date, 
  location_country, language, status, is_anonymous, views_count
) 
SELECT 
  'Mistral Large leaked system prompt structure', 
  'Mistral Large leaked system prompt structure', 
  'When prompted with a specific sequence, Mistral Large ignored safety guardrails and exposed its internal system instructions.',
  'When prompted with a specific sequence, Mistral Large ignored safety guardrails and exposed its internal system instructions.',
  id, 'security', 'high', '2026-06-10', 'DE', 'en', 'published', true, 310
FROM public.ai_providers WHERE slug = 'mistral'
ON CONFLICT DO NOTHING;

INSERT INTO public.incidents (
  title, title_masked, description, description_masked, 
  ai_provider_id, category, severity, incident_date, 
  location_country, language, status, is_anonymous, views_count
) 
SELECT 
  'Mistral API latency and dropped requests', 
  'Mistral API latency and dropped requests', 
  'Production application experienced 502 errors and severe latency during peak European hours without prior notice.',
  'Production application experienced 502 errors and severe latency during peak European hours without prior notice.',
  id, 'other', 'medium', '2026-06-25', 'UK', 'en', 'published', true, 45
FROM public.ai_providers WHERE slug = 'mistral'
ON CONFLICT DO NOTHING;

-- Perplexity incidents
INSERT INTO public.incidents (
  title, title_masked, description, description_masked, 
  ai_provider_id, category, severity, incident_date, 
  location_country, language, status, is_anonymous, views_count
) 
SELECT 
  'Perplexity cited non-existent academic paper', 
  'Perplexity cited non-existent academic paper', 
  'The search engine confidently answered a medical query by citing a PubMed paper that does not exist, putting users at risk.',
  'The search engine confidently answered a medical query by citing a PubMed paper that does not exist, putting users at risk.',
  id, 'misinformation', 'critical', '2026-05-28', 'US', 'en', 'published', true, 550
FROM public.ai_providers WHERE slug = 'perplexity'
ON CONFLICT DO NOTHING;
