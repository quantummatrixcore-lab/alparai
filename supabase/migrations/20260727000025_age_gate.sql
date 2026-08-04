-- Migration: Age gate extended columns (G8 — COPPA + UK Online Safety Act)
-- Timestamp: 20260727000025
-- Extends existing age_declarations table with COPPA and UK OSA columns
-- ROLLBACK:
--   ALTER TABLE public.age_declarations DROP COLUMN IF EXISTS coppa_thirteen_plus;
--   ALTER TABLE public.age_declarations DROP COLUMN IF EXISTS uk_osa_eighteen_plus;

ALTER TABLE public.age_declarations
  ADD COLUMN IF NOT EXISTS coppa_thirteen_plus boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS uk_osa_eighteen_plus boolean NOT NULL DEFAULT false;
