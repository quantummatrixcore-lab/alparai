-- ============================================================================
-- ALPAR AI — Cross-Audit Engine columns on incidents table
-- Stores TruthScore evaluation results from the autonomous Cross-Audit pipeline.
-- ============================================================================

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS cross_audit_truth_score integer,
  ADD COLUMN IF NOT EXISTS cross_audit_confidence real,
  ADD COLUMN IF NOT EXISTS cross_audit_reasoning text,
  ADD COLUMN IF NOT EXISTS cross_audit_model text,
  ADD COLUMN IF NOT EXISTS cross_audit_triage_models text[],
  ADD COLUMN IF NOT EXISTS cross_audit_completed_at timestamptz;

COMMENT ON COLUMN public.incidents.cross_audit_truth_score IS
  'TruthScore (0-100) computed by the Supreme Court model via Cross-Audit Engine.';
COMMENT ON COLUMN public.incidents.cross_audit_confidence IS
  'Confidence level (0.0–1.0) of the TruthScore evaluation.';
COMMENT ON COLUMN public.incidents.cross_audit_reasoning IS
  'Reasoning output from the Supreme Court evaluation model.';
COMMENT ON COLUMN public.incidents.cross_audit_model IS
  'The model ID used for the Supreme Court evaluation (e.g. anthropic/claude-3.5-sonnet).';
COMMENT ON COLUMN public.incidents.cross_audit_triage_models IS
  'Array of free-tier model IDs that contributed to the triage layer.';
COMMENT ON COLUMN public.incidents.cross_audit_completed_at IS
  'Timestamp when the Cross-Audit evaluation pipeline completed.';
