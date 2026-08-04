-- Migration: K-BENCHMARK (K5-K8) tables
-- Create k_categories and k_model_scores

CREATE TABLE IF NOT EXISTS public.k_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.k_model_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id TEXT REFERENCES public.k_categories(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES public.ai_models(id) ON DELETE CASCADE,
    score NUMERIC NOT NULL,
    wilson_lower NUMERIC,
    wilson_upper NUMERIC,
    sample_size INTEGER NOT NULL DEFAULT 100,
    last_audited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT k_model_scores_category_model_key UNIQUE (category_id, model_id)
);

-- Enable RLS
ALTER TABLE public.k_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.k_model_scores ENABLE ROW LEVEL SECURITY;

-- Read policies (everyone)
CREATE POLICY "Allow public read access to k_categories" ON public.k_categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to k_model_scores" ON public.k_model_scores
    FOR SELECT USING (true);

-- Write policies (moderators only)
CREATE POLICY "Allow mod all access to k_categories" ON public.k_categories
    FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));

CREATE POLICY "Allow mod all access to k_model_scores" ON public.k_model_scores
    FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));

-- Seed the initial 4 categories (K5, K6, K7, K8)
INSERT INTO public.k_categories (id, name, description) VALUES
    ('K5', 'Ethics & Safety', 'Real-world AI incident evaluation grounded in the ALPAR incident registry, combined with adversarial jailbreaks.'),
    ('K6', 'Hallucination & Factuality', 'TruthfulQA-based factuality analysis paired with curated Turkish-context factual claims.'),
    ('K7', 'Turkish Competence', 'Evaluation of Turkish language proficiency using translated MMLU-TR and bespoke local regulatory test sets.'),
    ('K8', 'EU AI Act Reasoning', 'Assessment of model decision-making logic against Art. 73 regulatory scenarios based on EU AI Act taxonomy.')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Seeding initial baseline model scores deterministically (K-FIX-1: No random() generation)
DO $$
DECLARE
    cat_rec RECORD;
    model_rec RECORD;
BEGIN
    FOR cat_rec IN SELECT id FROM public.k_categories LOOP
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
-- DROP TABLE IF EXISTS public.k_model_scores;
-- DROP TABLE IF EXISTS public.k_categories;
