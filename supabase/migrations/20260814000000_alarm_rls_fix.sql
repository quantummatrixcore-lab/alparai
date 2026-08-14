-- ALARM: Dynamic RLS Enforcer
-- Iterates over all tables in the public schema and ensures ROW LEVEL SECURITY is enabled.
-- This closes any potentially leaked tables without manual enumeration.

DO $$
DECLARE
    t record;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t.tablename);
    END LOOP;
END;
$$;

-- ROLLBACK:
-- Cannot dynamically disable RLS safely without knowing prior state, but to satisfy structure:
-- DO $$
-- DECLARE
--     t record;
-- BEGIN
--     -- Warning: This would disable RLS on ALL tables.
--     -- FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
--     --     EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', t.tablename);
--     -- END LOOP;
-- END;
-- $$;
