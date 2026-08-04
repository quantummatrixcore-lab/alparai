-- PostgreSQL function to increment incident views atomically
CREATE OR REPLACE FUNCTION public.increment_incident_views(p_incident_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.incidents
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_incident_id;
END;
$$;

-- PostgreSQL trigger function to update upvotes_count on public.incidents
CREATE OR REPLACE FUNCTION public.tg_update_incident_upvotes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- After insert
  IF TG_OP = 'INSERT' THEN
    IF NEW.value = 1 THEN
      UPDATE public.incidents
      SET upvotes_count = COALESCE(upvotes_count, 0) + 1
      WHERE id = NEW.incident_id;
    END IF;
  -- After update
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.value = 1 AND NEW.value <> 1 THEN
      UPDATE public.incidents
      SET upvotes_count = COALESCE(upvotes_count, 0) - 1
      WHERE id = NEW.incident_id;
    ELSIF OLD.value <> 1 AND NEW.value = 1 THEN
      UPDATE public.incidents
      SET upvotes_count = COALESCE(upvotes_count, 0) + 1
      WHERE id = NEW.incident_id;
    END IF;
  -- After delete
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.value = 1 THEN
      UPDATE public.incidents
      SET upvotes_count = COALESCE(upvotes_count, 0) - 1
      WHERE id = OLD.incident_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

-- Drop trigger if exists and create it
DROP TRIGGER IF EXISTS trg_update_incident_upvotes_count ON public.incident_votes;
CREATE TRIGGER trg_update_incident_upvotes_count
  AFTER INSERT OR UPDATE OR DELETE ON public.incident_votes
  FOR EACH ROW EXECUTE FUNCTION public.tg_update_incident_upvotes_count();

-- One-time sync of upvotes_count based on existing votes
UPDATE public.incidents i
SET upvotes_count = (
  SELECT COUNT(*)::integer
  FROM public.incident_votes v
  WHERE v.incident_id = i.id AND v.value = 1
);
