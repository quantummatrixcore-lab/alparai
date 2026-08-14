-- Enforce RLS on all tables in the public schema to prevent any data leaks.
-- This ensures any forgotten tables are secured.
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP 
        EXECUTE 'ALTER TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;'; 
    END LOOP; 
END $$;

-- ROLLBACK:
-- DO $$ 
-- DECLARE 
--     r RECORD;
-- BEGIN 
--     FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
--     LOOP 
--         EXECUTE 'ALTER TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY;'; 
--     END LOOP; 
-- END $$;
