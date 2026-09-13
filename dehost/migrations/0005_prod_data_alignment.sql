-- 0005_prod_data_alignment.sql — data fixes for populated databases.
-- Idempotent: every statement no-ops on clean data. Fresh staging AND prod-clone proven.
-- Owner rulings: backfill #1 APPROVED, TYPE #2 APPROVED, NO ROW DELETED (unique rules stay
-- in the files for fresh DBs; on current prod data the 2 unique indexes cannot build —
-- documented divergence, see AUDIT verdict).

-- 1. Backfill unattributed incidents (visible as "Unknown", matches API fallback).
UPDATE public.incidents SET provider_custom_name = 'Unknown'
WHERE ai_provider_id IS NULL AND (provider_custom_name IS NULL OR length(btrim(provider_custom_name)) < 2);
UPDATE public.incidents SET model_custom_name = 'Unknown'
WHERE ai_model_id IS NULL AND ai_provider_id IS NOT NULL
  AND (model_custom_name IS NULL OR length(btrim(model_custom_name)) < 1);

-- 2. TYPE alignment (recon-verified: values convert cleanly).
-- Owner-assigned: empty completions go to the founder account (ercuerden).
UPDATE public.grant_applications SET completed_by = '9942eb80-a3e4-482e-9753-3342cba6ab0b'
WHERE completed_by IS NULL
  AND EXISTS (SELECT 1 FROM public.users WHERE id = '9942eb80-a3e4-482e-9753-3342cba6ab0b');
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='expert_applications' AND column_name='reviewed_by' AND data_type='text') THEN
    ALTER TABLE public.expert_applications ALTER COLUMN reviewed_by TYPE uuid USING reviewed_by::uuid;
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='grant_applications' AND column_name='completed_by' AND data_type='text') THEN
    ALTER TABLE public.grant_applications ALTER COLUMN completed_by TYPE uuid USING completed_by::uuid;
  END IF;
END $$;

-- 3. REMOVED per owner ruling ("kalsın", 2026-09-13): no rows are deleted.
-- The two unique indexes (unique_question_model, unique_incident_title_provider)
-- remain in the schema files and enforce on fresh databases; on the current
-- populated prod they cannot build until duplicates are resolved row-by-row
-- by the owner. See docs/PROPOSALS/DEDUPE_REPORT.md for the full list.
