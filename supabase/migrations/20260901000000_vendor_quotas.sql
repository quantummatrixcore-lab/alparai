-- 20260901000000_vendor_quotas.sql
-- Create vendor_quotas table for infrastructure limits

DROP TABLE IF EXISTS public.vendor_quotas;

CREATE TABLE public.vendor_quotas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor text NOT NULL,
    metric text NOT NULL,
    limit_value numeric,
    used_value numeric,
    unit text,
    period_start date,
    period_end date,
    plan_name text,
    source varchar NOT NULL CHECK (source IN ('api', 'manual')),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_quotas ENABLE ROW LEVEL SECURITY;

-- Admins and Moderators can manage
CREATE POLICY "Admins and moderators can manage vendor_quotas"
ON public.vendor_quotas
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));

-- Insert Seed Data (source = 'manual' limit_value = NULL)
INSERT INTO public.vendor_quotas 
    (vendor, metric, limit_value, used_value, unit, period_start, period_end, plan_name, source)
VALUES 
    ('github_actions', 'minutes', NULL, 120, 'minutes', '2026-08-01', '2026-08-31', 'Free', 'manual'),
    ('vercel', 'bandwidth_gb', NULL, 15, 'GB', '2026-08-01', '2026-08-31', 'Pro', 'manual'),
    ('supabase', 'db_size_gb', NULL, 1.5, 'GB', '2026-08-01', '2026-08-31', 'Pro', 'manual'),
    ('claude_pro', 'messages', NULL, 450, 'messages', '2026-08-01', '2026-08-31', 'Pro', 'manual'),
    ('resend', 'emails', NULL, 1500, 'emails', '2026-08-01', '2026-08-31', 'Free', 'manual'),
    ('upstash', 'requests', NULL, 50000, 'requests', '2026-08-01', '2026-08-31', 'Pay-as-you-go', 'manual');

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.vendor_quotas;
