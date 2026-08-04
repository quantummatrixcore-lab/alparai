-- Migration: Zero-Knowledge Evidence Columns
-- Timestamp: 20260727000019
-- Rollback: ALTER TABLE public.incidents DROP COLUMN IF EXISTS encrypted_evidence, DROP COLUMN IF EXISTS evidence_ciphertext;

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS encrypted_evidence boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS evidence_ciphertext text;
