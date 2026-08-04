-- Migration: Mark all Batch 2 candidate innovations (I12-I18) as done
-- Timestamp: 20260723000011

UPDATE public.strategy_innovations
SET status = 'done', updated_at = NOW()
WHERE title ~ '^I(12|13|14|15|16|17|18) —';

-- ROLLBACK: UPDATE public.strategy_innovations SET status = 'idea' WHERE title ~ '^I(12|13|14|15|16|17|18) —';
