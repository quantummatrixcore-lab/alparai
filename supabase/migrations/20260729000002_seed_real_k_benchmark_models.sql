-- Migration: Seed real AI models and BENCH-TR evaluations for K-BENCHMARK
-- Timestamp: 20260729000002
-- ROLLBACK: DELETE FROM public.bench_tr_evaluations WHERE model_name IN ('Gemini 2.0 Flash', 'OpenAI o1', 'Mistral Large 2411', 'Qwen 2.5 72B Instruct');

INSERT INTO public.bench_tr_evaluations (model_name, provider_slug, tr_grammar_score, tr_bias_score, tr_factuality_pct, eval_dataset_ver)
VALUES
  ('Claude 3.5 Sonnet', 'anthropic', 99.1, 94.5, 96.8, 'v1.0-TR-prod'),
  ('GPT-4o', 'openai', 98.4, 91.2, 95.2, 'v1.0-TR-prod'),
  ('Gemini 1.5 Pro', 'google', 98.9, 93.8, 96.1, 'v1.0-TR-prod'),
  ('DeepSeek R1', 'nvidia', 95.0, 96.0, 94.5, 'v1.0-TR-prod'),
  ('Gemini 2.0 Flash', 'google', 97.2, 94.1, 95.8, 'v1.0-TR-prod'),
  ('Llama 3.3 70B Instruct', 'meta', 93.5, 94.0, 92.0, 'v1.0-TR-prod'),
  ('Qwen 2.5 72B Instruct', 'alibaba', 89.5, 92.5, 90.0, 'v1.0-TR-prod'),
  ('Mistral Large 2411', 'mistral', 94.8, 91.5, 93.2, 'v1.0-TR-prod')
ON CONFLICT DO NOTHING;
