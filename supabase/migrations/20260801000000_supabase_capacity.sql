-- Migration: Supabase Capacity Relief
-- Make body column nullable and null it for processed/published/rejected items.
-- Add retention policy trigger.

ALTER TABLE public.external_incidents_queue ALTER COLUMN body DROP NOT NULL;

-- Null existing processed/published/rejected items (also accepted/duplicate)
UPDATE public.external_incidents_queue
SET body = NULL
WHERE status IN ('accepted', 'published', 'rejected', 'processed', 'duplicate');

-- Create trigger function to null body when status is no longer pending
CREATE OR REPLACE FUNCTION public.null_processed_external_queue_body()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('accepted', 'published', 'rejected', 'processed', 'duplicate') THEN
    NEW.body := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_null_processed_external_queue_body ON public.external_incidents_queue;
CREATE TRIGGER trg_null_processed_external_queue_body
BEFORE INSERT OR UPDATE ON public.external_incidents_queue
FOR EACH ROW
EXECUTE FUNCTION public.null_processed_external_queue_body();

-- -- ROLLBACK:
-- UPDATE public.external_incidents_queue SET body = 'Rollback placeholder' WHERE body IS NULL;
-- ALTER TABLE public.external_incidents_queue ALTER COLUMN body SET NOT NULL;
-- DROP TRIGGER IF EXISTS trg_null_processed_external_queue_body ON public.external_incidents_queue;
-- DROP FUNCTION IF EXISTS public.null_processed_external_queue_body();
