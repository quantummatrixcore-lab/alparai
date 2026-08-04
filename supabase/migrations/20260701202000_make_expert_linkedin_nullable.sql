-- Migration: Make linkedin_url nullable in expert_applications (2026-07-01)
ALTER TABLE public.expert_applications
  ALTER COLUMN linkedin_url DROP NOT NULL;
