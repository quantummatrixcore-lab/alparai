-- 20260908000000_seed_velocity_engine_data.sql
-- Seed dummy data for Velocity Engine public dashboard

-- Seed ai_velocity_metrics
INSERT INTO public.ai_velocity_metrics (provider, model_name, benchmark_elo, release_date, capability_jump_pct)
VALUES
  ('openai', 'gpt-4o-2024-05-13', 1287, '2024-05-13', 12.5),
  ('anthropic', 'claude-3-5-sonnet-20240620', 1279, '2024-06-20', 18.2),
  ('qwen', 'qwen2-72b-instruct', 1243, '2024-06-07', 24.1),
  ('google', 'gemini-1.5-pro-001', 1261, '2024-05-23', 9.4),
  ('meta', 'llama-3-70b-instruct', 1210, '2024-04-18', 15.0),
  ('mistral', 'mistral-large-2407', 1255, '2024-07-24', 11.8)
ON CONFLICT DO NOTHING;

-- Seed financial_velocity_projections
INSERT INTO public.financial_velocity_projections (velocity_factor, projected_arr_usd, enterprise_b2b_demand_multiplier)
VALUES
  (1.25, 45000.00, 1.10),
  (1.50, 85000.00, 1.35),
  (1.85, 120000.00, 1.70),
  (2.10, 250000.00, 2.20),
  (3.00, 750000.00, 3.50)
ON CONFLICT DO NOTHING;

-- ROLLBACK:
-- delete from public.financial_velocity_projections;
-- delete from public.ai_velocity_metrics;
