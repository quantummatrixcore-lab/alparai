-- Migration: strategy_state_support table
-- Created: 2026-07-11

CREATE TABLE IF NOT EXISTS public.strategy_state_support (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code                text UNIQUE NOT NULL,
  name                text NOT NULL,
  country             text NOT NULL,
  region              text,
  grantor             text NOT NULL,
  category            text NOT NULL
                      CHECK (category IN ('rd','market_entry','regulatory','grant','tax_incentive','equity','loan')),
  max_amount_eur      integer,
  currency            text NOT NULL DEFAULT 'EUR',
  deadline            date,
  status              text NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open','applied','awarded','closed','rejected')),
  priority            integer NOT NULL DEFAULT 2
                      CHECK (priority BETWEEN 1 AND 4),
  fit_score           integer NOT NULL DEFAULT 70
                      CHECK (fit_score BETWEEN 0 AND 100),
  notes               text,
  url                 text,
  applied_at          date,
  awarded_at          date,
  awarded_amount_eur  integer,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.strategy_state_support ENABLE ROW LEVEL SECURITY;

CREATE POLICY "strategy_state_support_select" ON public.strategy_state_support
  FOR SELECT TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_advisor(auth.uid()));

CREATE POLICY "strategy_state_support_modify" ON public.strategy_state_support
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));
