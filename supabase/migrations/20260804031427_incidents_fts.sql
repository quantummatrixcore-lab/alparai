-- Migration: Add search_vector to incidents table
-- Description: Implement full text search using tsvector and GIN index

-- ROLLBACK: 
-- DROP INDEX IF EXISTS public.idx_incidents_search_vector;
-- DROP TRIGGER IF EXISTS tsvectorupdate ON public.incidents;
-- DROP FUNCTION IF EXISTS public.incidents_search_vector_update();
-- ALTER TABLE public.incidents DROP COLUMN IF EXISTS search_vector;

ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search_vector
CREATE OR REPLACE FUNCTION public.incidents_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple'::regconfig, coalesce(NEW.title_masked, '')), 'A') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(NEW.description_masked, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS tsvectorupdate ON public.incidents;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
  ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.incidents_search_vector_update();

-- Update existing rows
UPDATE public.incidents SET id = id;

-- Create GIN index
CREATE INDEX IF NOT EXISTS idx_incidents_search_vector ON public.incidents USING gin(search_vector);
