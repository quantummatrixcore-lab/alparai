-- Migration: Deepfake / Audio-Video schema extension for I10
-- Timestamp: 20260723000005

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('audio', 'video', 'image', 'text', 'multimodal')),
  ADD COLUMN IF NOT EXISTS c2pa_manifest_url TEXT,
  ADD COLUMN IF NOT EXISTS synthid_detected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS voice_clone_detected BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_incidents_media_type ON public.incidents(media_type) WHERE media_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_incidents_synthid ON public.incidents(synthid_detected) WHERE synthid_detected = TRUE;

-- ROLLBACK: ALTER TABLE public.incidents DROP COLUMN IF EXISTS media_type, DROP COLUMN IF EXISTS c2pa_manifest_url, DROP COLUMN IF EXISTS synthid_detected, DROP COLUMN IF EXISTS voice_clone_detected;
