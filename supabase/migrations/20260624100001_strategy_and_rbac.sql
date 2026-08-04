-- Migration: Strategy & RBAC Expansion - Tables & Policies
-- Timestamp: 2026-06-24 10:00:01

-- 1. Add community_role and interests fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS community_role text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT '{}';

-- 2. Helpers to check CEO and Advisor status
CREATE OR REPLACE FUNCTION public.is_ceo(uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = uid and role = 'ceo'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_advisor(uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = uid and role::text = 'advisor'
  );
$$;

-- 3. Create strategy_swot_items table
CREATE TABLE IF NOT EXISTS public.strategy_swot_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category in ('strength', 'weakness', 'opportunity', 'threat')),
  title text NOT NULL,
  description text,
  weight text NOT NULL DEFAULT 'medium' CHECK (weight in ('low', 'medium', 'high')),
  owner_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action_plan text,
  target_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status in ('active', 'done', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Create strategy_risks table
CREATE TABLE IF NOT EXISTS public.strategy_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  probability integer NOT NULL CHECK (probability BETWEEN 1 AND 5),
  impact integer NOT NULL CHECK (impact BETWEEN 1 AND 5),
  owner_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  mitigation_plan text,
  target_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status in ('active', 'mitigated', 'triggered', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Create strategy_valuations table
CREATE TABLE IF NOT EXISTS public.strategy_valuations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method text NOT NULL CHECK (method in ('berkus', 'scorecard', 'vc', 'average')),
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_pre_money numeric(12, 2) NOT NULL,
  notes text,
  snapshot_date date NOT NULL DEFAULT current_date,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Create strategy_milestones table
CREATE TABLE IF NOT EXISTS public.strategy_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quarter text NOT NULL,
  title text NOT NULL,
  okr_text text,
  progress integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status text NOT NULL DEFAULT 'planned' CHECK (status in ('planned', 'in_progress', 'done', 'missed')),
  linked_metric text,
  owner_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Create strategy_metrics_snapshots table
CREATE TABLE IF NOT EXISTS public.strategy_metrics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL DEFAULT current_date,
  total_users integer NOT NULL DEFAULT 0,
  total_incidents integer NOT NULL DEFAULT 0,
  active_providers integer not null default 0,
  media_mentions_count integer NOT NULL DEFAULT 0,
  mrr_cents integer NOT NULL DEFAULT 0,
  runway_months numeric(5, 2),
  health_score integer NOT NULL DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Enable RLS on all strategy tables
ALTER TABLE public.strategy_swot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_metrics_snapshots ENABLE ROW LEVEL SECURITY;

-- 9. Define RLS Policies for SWOT
CREATE POLICY "ceo_admin_advisor_swot_select" ON public.strategy_swot_items
  FOR SELECT TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_advisor(auth.uid()));

CREATE POLICY "ceo_admin_swot_modify" ON public.strategy_swot_items
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));

-- 10. Define RLS Policies for Risks
CREATE POLICY "ceo_admin_advisor_risks_select" ON public.strategy_risks
  FOR SELECT TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_advisor(auth.uid()));

CREATE POLICY "ceo_admin_risks_modify" ON public.strategy_risks
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));

-- 11. Define RLS Policies for Valuations
CREATE POLICY "ceo_admin_advisor_valuations_select" ON public.strategy_valuations
  FOR SELECT TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_advisor(auth.uid()));

CREATE POLICY "ceo_admin_valuations_modify" ON public.strategy_valuations
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));

-- 12. Define RLS Policies for Milestones
CREATE POLICY "ceo_admin_advisor_milestones_select" ON public.strategy_milestones
  FOR SELECT TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_advisor(auth.uid()));

CREATE POLICY "ceo_admin_milestones_modify" ON public.strategy_milestones
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));

-- 13. Define RLS Policies for Metrics Snapshots
CREATE POLICY "ceo_admin_advisor_snapshots_select" ON public.strategy_metrics_snapshots
  FOR SELECT TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_advisor(auth.uid()));

CREATE POLICY "ceo_admin_snapshots_modify" ON public.strategy_metrics_snapshots
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
