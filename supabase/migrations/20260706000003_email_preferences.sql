-- Migration: Create email_preferences table, enable RLS, update handle_new_user trigger, and backfill existing users.
CREATE TABLE IF NOT EXISTS public.email_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  weekly_digest boolean NOT NULL DEFAULT true,
  watches boolean NOT NULL DEFAULT true,
  reporter_notifications boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view and manage their own preferences
CREATE POLICY "users_own_email_preferences"
  ON public.email_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update handle_new_user trigger function to include email preferences setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, locale)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'locale', 'en')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.email_preferences (user_id, weekly_digest, watches, reporter_notifications)
  VALUES (new.id, true, true, true)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;

-- Backfill existing users
INSERT INTO public.email_preferences (user_id, weekly_digest, watches, reporter_notifications)
SELECT id, true, true, true FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.email_preferences CASCADE;
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
-- BEGIN
--   INSERT INTO public.users (id, email, full_name, avatar_url, locale)
--   VALUES (
--     new.id,
--     new.email,
--     coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
--     new.raw_user_meta_data->>'avatar_url',
--     coalesce(new.raw_user_meta_data->>'locale', 'en')
--   )
--   ON CONFLICT (id) DO NOTHING;
--   RETURN new;
-- END;
-- $$;
