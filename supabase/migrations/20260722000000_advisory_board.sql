-- Migration: Create advisory_board_members table
-- Timestamp: 20260722000000
-- ROLLBACK: DROP TABLE IF EXISTS public.advisory_board_members;

CREATE TABLE IF NOT EXISTS public.advisory_board_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title_en text NOT NULL,
  title_tr text NOT NULL,
  institution_en text,
  institution_tr text,
  bio_en text,
  bio_tr text,
  avatar_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advisory_board_members ENABLE ROW LEVEL SECURITY;

-- Policies: public read, admin write
CREATE POLICY "Advisory board members read access" ON public.advisory_board_members
  FOR SELECT TO public USING (true);

CREATE POLICY "Advisory board members write access" ON public.advisory_board_members
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
