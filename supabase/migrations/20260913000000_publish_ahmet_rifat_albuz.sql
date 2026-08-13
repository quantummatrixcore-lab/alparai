-- Migration: Publish Ahmet Rifat Albuz on the public Advisory Board page
-- Timestamp: 20260913000000
-- Context: the record was inserted by 20260811231000_add_ahmet_rifat_albuz.sql with
-- is_active = false, so it exists in the admin panel but was never shown on
-- /about/advisory-board. This migration adds link columns for a member's
-- personal site and affiliated press outlet, then activates this record.
-- ROLLBACK:
--   UPDATE public.advisory_board_members
--   SET is_active = false, display_order = 0, website_url = NULL, press_url = NULL
--   WHERE name = 'Ahmet Rıfat Albuz';
--   ALTER TABLE public.advisory_board_members DROP COLUMN IF EXISTS website_url, DROP COLUMN IF EXISTS press_url;

ALTER TABLE public.advisory_board_members
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS press_url text;

UPDATE public.advisory_board_members
SET
  is_active = true,
  display_order = 6,
  website_url = 'https://ahmetrifatalbuz.com/',
  press_url = 'https://yeninesil.tv/'
WHERE name = 'Ahmet Rıfat Albuz';
