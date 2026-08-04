-- Migration: Alter email_preferences table to support waitlist (non-user email subscriptions)
-- Adds email, marketing_opt_in, and source columns, makes user_id nullable, and defines id as the primary key.

ALTER TABLE public.email_preferences DROP CONSTRAINT IF EXISTS email_preferences_pkey;

ALTER TABLE public.email_preferences ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

-- Populate id values for existing rows
UPDATE public.email_preferences SET id = gen_random_uuid() WHERE id IS NULL;

-- Now make id the primary key
ALTER TABLE public.email_preferences ADD CONSTRAINT email_preferences_pkey PRIMARY KEY (id);

-- Make user_id nullable (so anonymous waitlist entries can insert without referencing a registered user)
ALTER TABLE public.email_preferences ALTER COLUMN user_id DROP NOT NULL;

-- Add waitlist fields
ALTER TABLE public.email_preferences ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.email_preferences ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT true;
ALTER TABLE public.email_preferences ADD COLUMN IF NOT EXISTS source text DEFAULT 'waitlist';

-- Ensure emails are unique when provided
ALTER TABLE public.email_preferences ADD CONSTRAINT email_preferences_email_unique UNIQUE (email);

-- Ensure user_id remains unique among registered users
ALTER TABLE public.email_preferences ADD CONSTRAINT email_preferences_user_id_unique UNIQUE (user_id);

-- Allow public inserts for the waitlist form
CREATE POLICY "public_insert_email_preferences"
  ON public.email_preferences
  FOR INSERT
  WITH CHECK (true);
