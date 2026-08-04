-- Migration: Mark Batch 2 innovations (I12, I13, I18) as done
-- Timestamp: 20260723000008

UPDATE public.strategy_innovations
SET status = 'done', updated_at = NOW()
WHERE title LIKE 'I12 —%' OR title LIKE 'I13 —%' OR title LIKE 'I18 —%';

-- ROLLBACK: UPDATE public.strategy_innovations SET status = 'idea' WHERE title LIKE 'I12 —%' OR title LIKE 'I13 —%' OR title LIKE 'I18 —%';
