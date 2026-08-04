-- Migration: DSAR Automation Table
-- Timestamp: 20260727000020
-- Rollback: DROP TABLE IF EXISTS public.dsar_requests;

CREATE TABLE IF NOT EXISTS public.dsar_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  due_date timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

ALTER TABLE public.dsar_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own DSAR requests" ON public.dsar_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own DSAR requests" ON public.dsar_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view and update all DSAR requests" ON public.dsar_requests
  FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
