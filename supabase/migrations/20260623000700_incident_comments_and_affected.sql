-- Add affected_users_count column to public.incidents
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS affected_users_count integer NOT NULL DEFAULT 0;

-- Create incident_comments table
CREATE TABLE IF NOT EXISTS public.incident_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on incident_comments
ALTER TABLE public.incident_comments ENABLE ROW LEVEL SECURITY;

-- Select policy: Anyone can view comments
DROP POLICY IF EXISTS "comments_select_all" ON public.incident_comments;
CREATE POLICY "comments_select_all"
  ON public.incident_comments
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert policy: Only authenticated users can comment under their own ID
DROP POLICY IF EXISTS "comments_insert_own" ON public.incident_comments;
CREATE POLICY "comments_insert_own"
  ON public.incident_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Delete policy: Only the owner or a moderator/admin can delete comments
DROP POLICY IF EXISTS "comments_delete_own" ON public.incident_comments;
CREATE POLICY "comments_delete_own"
  ON public.incident_comments
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_moderator(auth.uid()));

-- Update policy: Only the owner can edit comments
DROP POLICY IF EXISTS "comments_update_own" ON public.incident_comments;
CREATE POLICY "comments_update_own"
  ON public.incident_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Trigger to update updated_at on public.incident_comments
CREATE OR REPLACE FUNCTION public.tg_incident_comments_touch()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_incident_comments_touch ON public.incident_comments;
CREATE TRIGGER trg_incident_comments_touch
  BEFORE UPDATE ON public.incident_comments
  FOR EACH ROW EXECUTE FUNCTION public.tg_incident_comments_touch();


-- Create incident_affected_users table (Me-Too tracking)
CREATE TABLE IF NOT EXISTS public.incident_affected_users (
  incident_id uuid NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (incident_id, user_id)
);

-- Enable RLS on incident_affected_users
ALTER TABLE public.incident_affected_users ENABLE ROW LEVEL SECURITY;

-- Select policy: Anyone can see affected entries
DROP POLICY IF EXISTS "affected_select_all" ON public.incident_affected_users;
CREATE POLICY "affected_select_all"
  ON public.incident_affected_users
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert policy: Only authenticated users can flag themselves as affected
DROP POLICY IF EXISTS "affected_insert_own" ON public.incident_affected_users;
CREATE POLICY "affected_insert_own"
  ON public.incident_affected_users
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Delete policy: Only authenticated users can unflag themselves
DROP POLICY IF EXISTS "affected_delete_own" ON public.incident_affected_users;
CREATE POLICY "affected_delete_own"
  ON public.incident_affected_users
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));


-- Trigger to automatically maintain incidents.affected_users_count
CREATE OR REPLACE FUNCTION public.tg_update_incident_affected_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.incidents
    SET affected_users_count = COALESCE(affected_users_count, 0) + 1
    WHERE id = NEW.incident_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.incidents
    SET affected_users_count = GREATEST(0, COALESCE(affected_users_count, 0) - 1)
    WHERE id = OLD.incident_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_incident_affected_count ON public.incident_affected_users;
CREATE TRIGGER trg_update_incident_affected_count
  AFTER INSERT OR DELETE ON public.incident_affected_users
  FOR EACH ROW EXECUTE FUNCTION public.tg_update_incident_affected_count();
