-- Migration: Enable Row Level Security (RLS) on remaining public tables
-- Fixes Supabase Security Advisor alert (rls_disabled_in_public) for alparai-prod (azszpzyvxjduhemkjsdh)
-- Tables: tasks, heartbeats, cost_log, system_flags, agent_episodic_memory
-- ROLLBACK:
--   ALTER TABLE IF EXISTS public.tasks DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE IF EXISTS public.heartbeats DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE IF EXISTS public.cost_log DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE IF EXISTS public.system_flags DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE IF EXISTS public.agent_episodic_memory DISABLE ROW LEVEL SECURITY;

-- 1. Tasks
ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on tasks" ON public.tasks;
CREATE POLICY "Service role full access on tasks"
  ON public.tasks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view tasks" ON public.tasks;
CREATE POLICY "Admins can view tasks"
  ON public.tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo', 'moderator')
    )
  );

-- 2. Heartbeats
ALTER TABLE IF EXISTS public.heartbeats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on heartbeats" ON public.heartbeats;
CREATE POLICY "Service role full access on heartbeats"
  ON public.heartbeats
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view heartbeats" ON public.heartbeats;
CREATE POLICY "Admins can view heartbeats"
  ON public.heartbeats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );

-- 3. Cost Log
ALTER TABLE IF EXISTS public.cost_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on cost_log" ON public.cost_log;
CREATE POLICY "Service role full access on cost_log"
  ON public.cost_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view cost_log" ON public.cost_log;
CREATE POLICY "Admins can view cost_log"
  ON public.cost_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );

-- 4. System Flags
ALTER TABLE IF EXISTS public.system_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on system_flags" ON public.system_flags;
CREATE POLICY "Service role full access on system_flags"
  ON public.system_flags
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read system_flags" ON public.system_flags;
CREATE POLICY "Public can read system_flags"
  ON public.system_flags
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 5. Agent Episodic Memory
ALTER TABLE IF EXISTS public.agent_episodic_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on agent_episodic_memory" ON public.agent_episodic_memory;
CREATE POLICY "Service role full access on agent_episodic_memory"
  ON public.agent_episodic_memory
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view agent_episodic_memory" ON public.agent_episodic_memory;
CREATE POLICY "Admins can view agent_episodic_memory"
  ON public.agent_episodic_memory
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );
