-- 20260827021500_purge_fabricated_models.sql

-- Drop incidents attributed to fabricated models
DELETE FROM public.incidents
WHERE ai_model_id IN (
  SELECT id FROM public.ai_models
  WHERE name IN (
    'Claude 3.5 Opus',
    'Claude 4.5 Sonnet',
    'Claude 4.5 Opus',
    'Claude 4.6 Sonnet',
    'Claude 4.7 Opus',
    'Claude 4.8 Sonnet',
    'Claude 4.8 Opus'
  )
);

-- Delete the models
DELETE FROM public.ai_models
WHERE name IN (
  'Claude 3.5 Opus',
  'Claude 4.5 Sonnet',
  'Claude 4.5 Opus',
  'Claude 4.6 Sonnet',
  'Claude 4.7 Opus',
  'Claude 4.8 Sonnet',
  'Claude 4.8 Opus'
);


-- ROLLBACK:
-- -- Add rollback statements here
