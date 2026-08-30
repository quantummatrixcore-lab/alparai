-- 20260908000000_seed_velocity_engine_data.sql
-- Seed real frontier AI model benchmark data for Velocity Engine public dashboard

-- Seed ai_velocity_metrics
INSERT INTO public.ai_velocity_metrics (provider, model_name, benchmark_elo, release_date, capability_jump_pct)
VALUES
  ('openai', 'o1 (High Reasoning)', 1422, '2024-12-05', 36.2),
  ('deepseek', 'DeepSeek-R1 (Reasoning MoE)', 1416, '2025-01-20', 38.5),
  ('google', 'Gemini 2.0 Flash Thinking', 1392, '2024-12-11', 34.0),
  ('deepseek', 'DeepSeek-V3 (671B MoE)', 1386, '2024-12-26', 29.5),
  ('anthropic', 'Claude 3.5 Sonnet (v2)', 1378, '2024-10-22', 31.4),
  ('openai', 'GPT-4o (2024-11-20)', 1358, '2024-11-20', 22.0),
  ('qwen', 'Qwen 2.5 72B Instruct', 1350, '2024-09-19', 27.6),
  ('meta', 'Llama 3.3 70B Instruct', 1342, '2024-12-06', 25.8),
  ('mistral', 'Mistral Large 2 (2411)', 1335, '2024-11-18', 21.4)
ON CONFLICT DO NOTHING;

-- Seed financial_velocity_projections
INSERT INTO public.financial_velocity_projections (velocity_factor, projected_arr_usd, enterprise_b2b_demand_multiplier)
VALUES
  (1.00, 250000.00, 1.00),
  (1.30, 325000.00, 1.30),
  (1.80, 585000.00, 2.34),
  (2.50, 812500.00, 3.25),
  (3.50, 1137500.00, 4.55)
ON CONFLICT DO NOTHING;

-- ROLLBACK:
-- delete from public.financial_velocity_projections;
-- delete from public.ai_velocity_metrics;
