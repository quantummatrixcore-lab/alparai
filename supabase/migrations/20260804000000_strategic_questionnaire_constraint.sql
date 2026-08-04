-- Migration: Add unique constraint to strategic_answers
-- Description: Ensures one answer per question per model for upserting.

ALTER TABLE public.strategic_answers ADD CONSTRAINT unique_question_model UNIQUE (question_id, model_name);

-- ROLLBACK:
-- ALTER TABLE public.strategic_answers DROP CONSTRAINT IF EXISTS unique_question_model;
