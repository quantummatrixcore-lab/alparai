CREATE TABLE IF NOT EXISTS public.strategy_innovations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'idea',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.strategy_innovations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ceo_admin_innovations_select" ON public.strategy_innovations FOR SELECT TO authenticated USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "ceo_admin_innovations_modify" ON public.strategy_innovations FOR ALL TO authenticated USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid())) WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));