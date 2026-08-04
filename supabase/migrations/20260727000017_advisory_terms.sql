-- Migration: Add term fields to advisory_board_members
-- Timestamp: 20260727000017
-- Rollback: ALTER TABLE public.advisory_board_members DROP COLUMN IF EXISTS term_start, DROP COLUMN IF EXISTS term_end, DROP COLUMN IF EXISTS is_active;

ALTER TABLE public.advisory_board_members
  ADD COLUMN IF NOT EXISTS term_start timestamptz,
  ADD COLUMN IF NOT EXISTS term_end timestamptz,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_advisory_board_active ON public.advisory_board_members (is_active) WHERE is_active = true;
