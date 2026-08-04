-- Migration: admin_login_events table and login logging trigger
-- Create table to log admin/moderator login events with hashed IP.

CREATE TABLE IF NOT EXISTS public.admin_login_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE public.admin_login_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ceo_admin_advisor_login_events_select" ON public.admin_login_events
  FOR SELECT TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_advisor(auth.uid()));

-- Request IP helper function
CREATE OR REPLACE FUNCTION public.get_request_ip()
RETURNS text AS $$
DECLARE
  headers_text text;
BEGIN
  headers_text := current_setting('request.headers', true);
  IF headers_text IS NULL OR headers_text = '' THEN
    RETURN '127.0.0.1';
  END IF;
  RETURN coalesce(headers_text::json->>'x-forwarded-for', '127.0.0.1');
EXCEPTION
  WHEN OTHERS THEN
    RETURN '127.0.0.1';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to handle admin/moderator logins
CREATE OR REPLACE FUNCTION public.handle_admin_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if last_sign_in_at has changed and if the user is a moderator/admin/ceo/advisor
  IF (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at) AND (
    public.is_moderator(NEW.id) OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = NEW.id AND role::text IN ('admin', 'ceo', 'moderator', 'advisor')
    )
  ) THEN
    INSERT INTO public.admin_login_events (user_id, ip_hash)
    VALUES (
      NEW.id,
      encode(extensions.digest(public.get_request_ip(), 'sha256'), 'hex')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_login();

-- ROLLBACK:
-- DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_admin_login();
-- DROP FUNCTION IF EXISTS public.get_request_ip();
-- DROP TABLE IF EXISTS public.admin_login_events CASCADE;
