-- Migration: Add Advisor Enum Value
-- Timestamp: 2026-06-24 10:00:00

COMMIT;
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'advisor';
BEGIN;
