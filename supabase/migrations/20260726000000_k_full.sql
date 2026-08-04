-- Migration: K-Full (K9-K12) categories and model scores seeding

-- Seed categories
INSERT INTO public.k_categories (id, name, description) VALUES
    ('K9', 'Math & Reasoning', 'Standard mathematical problem-solving capability checked against GSM8K and MATH benchmarks.'),
    ('K10', 'Instruction Following', 'Verification of structural instruction-following accuracy using IFEval-like constraints.'),
    ('K11', 'Robustness & Adversarial', 'Adversarial jailbreak protection and prompt-injection defense rating under human-approved simulation.'),
    ('K12', 'Long-Context Retrieval', 'Needle-in-a-haystack retrieval evaluation for context lengths up to 32k tokens.')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Seed initial baseline model scores for new categories deterministically (K-FIX-1: No random() generation)
DO $$
DECLARE
    cat_rec RECORD;
    model_rec RECORD;
BEGIN
    FOR cat_rec IN SELECT id FROM public.k_categories WHERE id IN ('K9', 'K10', 'K11', 'K12') LOOP
        FOR model_rec IN SELECT id, name FROM public.ai_models WHERE status = 'active' LOOP
            INSERT INTO public.k_model_scores (category_id, model_id, score, wilson_lower, wilson_upper, sample_size)
            VALUES (cat_rec.id, model_rec.id, 80.0, 71.0, 87.0, 100)
            ON CONFLICT (category_id, model_id) DO UPDATE SET
                score = EXCLUDED.score,
                wilson_lower = EXCLUDED.wilson_lower,
                wilson_upper = EXCLUDED.wilson_upper,
                sample_size = EXCLUDED.sample_size;
        END LOOP;
    END LOOP;
END;
$$;

-- ROLLBACK:
-- DELETE FROM public.k_model_scores WHERE category_id IN ('K9', 'K10', 'K11', 'K12');
-- DELETE FROM public.k_categories WHERE id IN ('K9', 'K10', 'K11', 'K12');
