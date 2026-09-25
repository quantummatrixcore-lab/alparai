-- 0006_enforce_rls_all_tables.sql
-- ==============================================================================
-- BAŞKOMUTANLIK ACİL DURUM MÜHRÜ (RED CODE PROTOCOL)
-- 78 tablodaki RLS (Row Level Security) açığını tek seferde kapatan dinamik blok.
-- public şemasındaki tüm tablolarda RLS ve FORCE RLS aktif edilir.
-- ==============================================================================

DO $$ 
DECLARE
    t_name text;
BEGIN
    FOR t_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
    LOOP
        -- Tablo seviyesinde satır güvenliğini aktif et
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t_name);
        
        -- Tablo sahibinin (owner) de politikalara tabi olmasını zorunlu kıl (Admin Bypass engeli)
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', t_name);
    END LOOP;
END $$;

-- ROLLBACK:
-- DO $$ 
-- DECLARE t_name text; 
-- BEGIN 
--     FOR t_name IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
--         EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', t_name);
--     END LOOP;
-- END $$;
