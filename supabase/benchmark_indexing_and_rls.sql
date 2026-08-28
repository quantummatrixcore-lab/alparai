-- =============================================================================
-- Performance Benchmark & Verification Suite
-- Author: Thomas Edison (TCSFL Tactical Command Engine)
-- Target: Verify all queries on users, telemetry, financials execute under 10ms
-- =============================================================================

BEGIN;

-- 1. Benchmark User Lookups (B-Tree Unique & Covering Index)
EXPLAIN ANALYZE
SELECT id, email, username, full_name, avatar_url, role, is_verified, reputation_score
FROM public.users
WHERE lower(email) = 'ercument@alparai.com';

-- 2. Benchmark User Search via GIN Trigram
EXPLAIN ANALYZE
SELECT id, full_name, email
FROM public.users
WHERE full_name ILIKE '%Ercument%'
LIMIT 20;

-- 3. Benchmark Telemetry Time-Window Aggregations (B-Tree + GIN Path Ops)
EXPLAIN ANALYZE
SELECT 
  event_type, 
  count(*) as total_events, 
  avg(duration_ms) as avg_duration, 
  max(duration_ms) as max_duration
FROM public.telemetry
WHERE created_at >= now() - interval '24 hours'
  AND payload @> '{"environment": "production"}'::jsonb
GROUP BY event_type
ORDER BY total_events DESC;

-- 4. Benchmark Telemetry Error / Slow Query Diagnostics (Partial Index)
EXPLAIN ANALYZE
SELECT id, event_type, duration_ms, status_code, path, created_at
FROM public.telemetry
WHERE duration_ms > 500
ORDER BY duration_ms DESC, created_at DESC
LIMIT 50;

-- 5. Benchmark Financials User Transaction History (B-Tree Compound)
EXPLAIN ANALYZE
SELECT id, transaction_type, category, amount_cents, amount_usd, status, created_at
FROM public.financials
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid
  AND status = 'completed'
ORDER BY created_at DESC
LIMIT 25;

-- 6. Benchmark Financials Breakdown Deep JSONB Filter (GIN jsonb_path_ops)
EXPLAIN ANALYZE
SELECT id, user_id, amount_usd, breakdown, created_at
FROM public.financials
WHERE breakdown @> '{"provider": "gemini-3.1-pro"}'::jsonb
  AND created_at >= date_trunc('month', now());

-- 7. Benchmark RLS Evaluation Simulated with auth.uid() context
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';

EXPLAIN ANALYZE
SELECT * FROM public.financials
WHERE created_at >= now() - interval '30 days'
ORDER BY created_at DESC
LIMIT 20;

ROLLBACK;
