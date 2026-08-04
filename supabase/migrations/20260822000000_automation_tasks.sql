-- Migration: 20260822000000_automation_tasks.sql
-- Description: Autonomous Task Queue Infrastructure for background automation and form submissions

CREATE TABLE IF NOT EXISTS public.automation_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Index for status filtering and queue processing
CREATE INDEX IF NOT EXISTS idx_automation_tasks_status ON public.automation_tasks (status, created_at DESC);

-- Enable RLS
ALTER TABLE public.automation_tasks ENABLE ROW LEVEL SECURITY;

-- Policies: Admin access only
CREATE POLICY "Admins can view all automation tasks"
  ON public.automation_tasks FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert automation tasks"
  ON public.automation_tasks FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update automation tasks"
  ON public.automation_tasks FOR UPDATE
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete automation tasks"
  ON public.automation_tasks FOR DELETE
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.automation_tasks CASCADE;
