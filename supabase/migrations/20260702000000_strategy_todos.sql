CREATE TABLE IF NOT EXISTS public.strategy_todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  priority integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.strategy_todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ceo_admin_advisor_todos_select" ON public.strategy_todos FOR SELECT TO authenticated USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_advisor(auth.uid()));
CREATE POLICY "ceo_admin_todos_modify" ON public.strategy_todos FOR ALL TO authenticated USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid())) WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));