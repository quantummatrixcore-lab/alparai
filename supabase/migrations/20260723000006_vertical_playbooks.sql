-- Migration: Vertical Sector Playbooks (Health, Legal, Finance) for I12
-- Timestamp: 20260723000006

CREATE TABLE IF NOT EXISTS public.vertical_playbooks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector       TEXT NOT NULL CHECK (sector IN ('health', 'legal', 'finance', 'cybersecurity')),
  title        TEXT NOT NULL,
  framework    TEXT NOT NULL, -- e.g. 'HIPAA / FDA Guidance', 'EU AI Act High-Risk', 'BaFin / MiCA'
  summary      TEXT NOT NULL,
  checklist    JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vertical_playbooks_sector ON public.vertical_playbooks(sector);

ALTER TABLE public.vertical_playbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read vertical_playbooks"
  ON public.vertical_playbooks FOR SELECT
  USING (true);

CREATE POLICY "Admin full access vertical_playbooks"
  ON public.vertical_playbooks FOR ALL
  USING (public.is_admin(auth.uid()));

-- Seed initial playbooks for Health, Legal, Finance
INSERT INTO public.vertical_playbooks (sector, title, framework, summary, checklist)
VALUES
(
  'health',
  'Healthcare AI Diagnostic Risk Playbook',
  'FDA Software as a Medical Device (SaMD) & HIPAA',
  'Compliance checklist and incident intake protocol for clinical diagnostic AI models.',
  '[{"id": "h1", "item": "Verify patient PII masking before model inference"}, {"id": "h2", "item": "Log false-negative rates for diagnostic suggestions"}, {"id": "h3", "item": "Ensure human-in-the-loop review for high-severity alerts"}]'::jsonb
),
(
  'finance',
  'Financial Services & Automated Trading Risk Playbook',
  'BaFin / SEC / MiCA AI Governance',
  'Incident response protocols for automated credit scoring, algorithmic trading, and fraud detection models.',
  '[{"id": "f1", "item": "Audit algorithmic bias in credit decisions"}, {"id": "f2", "item": "Maintain 7-year audit trail of model inference outputs"}, {"id": "f3", "item": "Circuit-breaker trigger on anomalous market orders"}]'::jsonb
),
(
  'legal',
  'Legal Tech & Legal LLM Accountability Playbook',
  'EU AI Act High-Risk Annex III & ABA Ethics',
  'Protocols for hallucinated legal precedents, case brief generation, and confidentiality compliance.',
  '[{"id": "l1", "item": "Cross-verify citation validity against official court reporters"}, {"id": "l2", "item": "Check client confidentiality guarantees in LLM provider TOS"}, {"id": "l3", "item": "Label machine-generated legal drafts per local bar rules"}]'::jsonb
);

-- ROLLBACK: DROP TABLE IF EXISTS public.vertical_playbooks;
