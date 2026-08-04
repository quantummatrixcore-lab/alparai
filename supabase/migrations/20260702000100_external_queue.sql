CREATE TABLE IF NOT EXISTS public.external_incidents_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  external_url text NOT NULL UNIQUE,
  title text NOT NULL,
  body text NOT NULL,
  source_score integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  fetched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.external_incidents_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ceo_admin_external_queue_select" ON public.external_incidents_queue FOR SELECT TO authenticated USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "ceo_admin_external_queue_modify" ON public.external_incidents_queue FOR ALL TO authenticated USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid())) WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));