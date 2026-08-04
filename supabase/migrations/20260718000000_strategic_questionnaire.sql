-- Strategic Questionnaire Module (Item 113)
-- Tracks questionnaire runs and model answers

DROP TABLE IF EXISTS strategic_answers;

CREATE TABLE IF NOT EXISTS strategic_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  model_ids TEXT[] NOT NULL,
  total_questions INT NOT NULL DEFAULT 35,
  total_answers INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE strategic_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can select strategic_runs"
  ON strategic_runs FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));

CREATE POLICY "Admin can insert strategic_runs"
  ON strategic_runs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));

CREATE POLICY "Admin can update strategic_runs"
  ON strategic_runs FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));

CREATE TABLE IF NOT EXISTS strategic_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES strategic_runs(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  question_index INT NOT NULL,
  question_id TEXT NOT NULL,
  section TEXT NOT NULL,
  answer_text TEXT,
  error_message TEXT,
  latency_ms INT,
  tokens_used INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_strategic_answers_run ON strategic_answers(run_id);
CREATE INDEX idx_strategic_answers_model ON strategic_answers(model_id);
CREATE INDEX idx_strategic_answers_question ON strategic_answers(question_id);

ALTER TABLE strategic_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can select strategic_answers"
  ON strategic_answers FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));

CREATE POLICY "Admin can insert strategic_answers"
  ON strategic_answers FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE strategic_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE strategic_answers;
