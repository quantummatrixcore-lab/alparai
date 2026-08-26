import fs from 'fs';
import path from 'path';

const replacements = [
  { from: 'Velocity Engine\u00e2\u201e\u00a2', to: 'Velocity Engine\u2122' },
  { from: '\u00e2\u201e\u00a2', to: '\u2122' }, // ™
  { from: '\u00ce\u201d', to: '\u0394' }, // Δ
  { from: '\u00e2\u20ac\u201d', to: '\u2014' }, // —
  { from: '\u00e2\u20ac\u2013', to: '\u2013' }, // –
  { from: '\u00e2\u20ac\u2122', to: '\u2019' }, // ’
  { from: '\u00e2\u20ac\u0153', to: '\u201c' }, // “
  { from: '\u00e2\u20ac\u009d', to: '\u201d' }, // ”
  { from: '\u00e2\u20ac\u00a2', to: '\u2022' }, // •
  { from: '\u00c3\u00a2', to: '\u00e2' },
  { from: '\u00c3\u00a7', to: '\u00e7' }, // ç
  { from: '\u00c3\u00b6', to: '\u00f6' }, // ö
  { from: '\u00c3\u00bc', to: '\u00fc' }, // ü
  { from: '\u00c4\u00b1', to: '\u0131' }, // ı
  { from: '\u00c4\u0178', to: '\u011f' }, // ğ
  { from: '\u00c5\u0178', to: '\u015f' }, // ş
  { from: '\u00c3\u2021', to: '\u00c7' }, // Ç
  { from: '\u00c3\u2013', to: '\u00d6' }, // Ö
  { from: '\u00c3\u0153', to: '\u00dc' }, // Ü
  { from: '\u00c4\u00b0', to: '\u0130' }, // İ
  { from: '\u00c4\u017e', to: '\u011e' }, // Ğ
  { from: '\u00c5\u017e', to: '\u015e' }, // Ş
];

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        processDir(fullPath);
      }
    } else if (entry.name.endsWith('.json') || entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.md')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { from, to } of replacements) {
        if (content.includes(from)) {
          content = content.replaceAll(from, to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed mojibake in:', fullPath);
      }
    }
  }
}

processDir('messages');
processDir('src');
processDir('docs');

// Translation quality scan for tr.json
const tr = JSON.parse(fs.readFileSync('messages/tr.json', 'utf8'));
const englishPatterns = [
  /\bUnder revision\b/i,
  /\bExplore Scenarios\b/i,
  /\bRequest Dataset Access\b/i,
  /\bStructured Exports\b/i,
  /\bAcademic License\b/i,
  /\bTaxonomy Aligned\b/i,
  /\bComing soon\b/i,
  /\bContact Sales\b/i,
  /\bGet in touch\b/i,
];

const migrationSql = `-- Migration: Enable Row Level Security (RLS) on remaining public tables
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
`;

fs.writeFileSync('supabase/migrations/20260927000000_enable_rls_all_remaining_tables.sql', migrationSql, 'utf8');
console.log('Created RLS migration: supabase/migrations/20260927000000_enable_rls_all_remaining_tables.sql');


