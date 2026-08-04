-- Migration: Create data_retention_policies table and initialize policies
-- Description: Creates the reference table and seeds a retention policy for all public tables.

CREATE TABLE IF NOT EXISTS public.data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL UNIQUE,
    retention_period_months INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;

-- Read policy (everyone)
CREATE POLICY "Allow public read access to data_retention_policies" ON public.data_retention_policies
    FOR SELECT USING (true);

-- Write policies (moderators only)
CREATE POLICY "Allow mod all access to data_retention_policies" ON public.data_retention_policies
    FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));

-- Seed a policy for every table in the public schema dynamically
DO $$
DECLARE
    r RECORD;
    ret_period INTEGER;
BEGIN
    FOR r IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          AND table_name NOT IN ('data_retention_policies')
    LOOP
        -- Determine retention period dynamically based on table characteristics
        IF r.table_name IN ('evidence', 'raw_evidence') THEN
            ret_period := 24; -- raw evidence 24 months
        ELSIF r.table_name IN ('email_logs', 'audit_logs', 'logs') THEN
            ret_period := 60; -- audit_logs 5 years (60 months)
        ELSIF r.table_name IN ('users', 'email_preferences') THEN
            ret_period := 12; -- PII 12 months
        ELSE
            ret_period := 36; -- Default 36 months for other tables
        END IF;

        INSERT INTO public.data_retention_policies (table_name, retention_period_months, description)
        VALUES (
            r.table_name, 
            ret_period, 
            'Automatically initialized retention policy for ' || r.table_name
        )
        ON CONFLICT (table_name) DO NOTHING;
    END LOOP;
END;
$$;

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.data_retention_policies;
