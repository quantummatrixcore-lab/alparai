-- Enforce RLS Globally
-- This migration ensures that EVERY table in the public schema has RLS enabled.
-- It acts as a safety net for any tables created without RLS in the future.

DO $$
DECLARE
    row record;
BEGIN
    FOR row IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', row.tablename);
    END LOOP;
END;
$$;
