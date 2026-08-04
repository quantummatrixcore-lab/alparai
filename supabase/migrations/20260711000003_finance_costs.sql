-- Migration: finance_costs schema
-- Created: 2026-07-11

CREATE TABLE IF NOT EXISTS public.finance_monthly_costs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service     text NOT NULL, -- 'vercel', 'supabase', 'gemini', 'anthropic', 'resend', 'upstash', 'buffer'
  month       date NOT NULL, -- first day of the month
  amount_usd  numeric(10,4) NOT NULL DEFAULT 0,
  budget_usd  numeric(10,4) NOT NULL DEFAULT 0,
  currency    text NOT NULL DEFAULT 'USD',
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT  unique_service_month UNIQUE (service, month)
);

CREATE TABLE IF NOT EXISTS public.finance_api_usage (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service      text NOT NULL, -- 'gemini', 'anthropic', 'supabase', 'vercel'
  metric_name  text NOT NULL, -- 'tokens_in', 'tokens_out', 'requests', 'bandwidth_gb'
  recorded_at  timestamptz NOT NULL DEFAULT now(),
  value        numeric(18,4) NOT NULL,
  unit         text, -- 'token', 'request', 'GB', '$'
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.finance_monthly_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_api_usage ENABLE ROW LEVEL SECURITY;

-- CEO and Admin Access Policies
CREATE POLICY "finance_monthly_costs_access" ON public.finance_monthly_costs
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "finance_api_usage_access" ON public.finance_api_usage
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));

-- Seed finance data for June and July 2026
INSERT INTO public.finance_monthly_costs (service, month, amount_usd, budget_usd, currency)
VALUES
  ('vercel', '2026-06-01', 12.50, 20.00, 'USD'),
  ('vercel', '2026-07-01', 14.20, 20.00, 'USD'),
  ('supabase', '2026-06-01', 0.00, 0.00, 'USD'),
  ('supabase', '2026-07-01', 0.00, 0.00, 'USD'),
  ('gemini', '2026-06-01', 8.50, 20.00, 'USD'),
  ('gemini', '2026-07-01', 10.10, 20.00, 'USD'),
  ('anthropic', '2026-06-01', 3.00, 20.00, 'USD'),
  ('anthropic', '2026-07-01', 4.50, 20.00, 'USD'),
  ('resend', '2026-06-01', 0.00, 0.00, 'USD'),
  ('resend', '2026-07-01', 0.00, 0.00, 'USD'),
  ('upstash', '2026-06-01', 1.00, 5.00, 'USD'),
  ('upstash', '2026-07-01', 1.20, 5.00, 'USD'),
  ('buffer', '2026-06-01', 6.00, 6.00, 'USD'),
  ('buffer', '2026-07-01', 6.00, 6.00, 'USD')
ON CONFLICT (service, month) DO UPDATE
SET amount_usd = EXCLUDED.amount_usd, budget_usd = EXCLUDED.budget_usd;

-- Seed API usage metrics
INSERT INTO public.finance_api_usage (service, metric_name, value, unit, recorded_at)
VALUES
  ('gemini', 'tokens_in', 1250000, 'token', '2026-06-15 12:00:00+00'),
  ('gemini', 'tokens_out', 350000, 'token', '2026-06-15 12:00:00+00'),
  ('gemini', 'tokens_in', 1850000, 'token', '2026-07-05 15:00:00+00'),
  ('gemini', 'tokens_out', 550000, 'token', '2026-07-05 15:00:00+00'),
  ('anthropic', 'tokens_in', 450000, 'token', '2026-06-20 10:00:00+00'),
  ('anthropic', 'tokens_out', 120000, 'token', '2026-06-20 10:00:00+00'),
  ('anthropic', 'tokens_in', 650000, 'token', '2026-07-08 14:00:00+00'),
  ('anthropic', 'tokens_out', 210000, 'token', '2026-07-08 14:00:00+00'),
  ('supabase', 'requests', 45200, 'request', '2026-06-30 23:59:59+00'),
  ('supabase', 'requests', 58700, 'request', '2026-07-10 23:59:59+00');
