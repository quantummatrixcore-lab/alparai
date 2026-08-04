-- Migration: Community Challenges (CQ1)
-- Timestamp: 20260727000024
-- ROLLBACK:
--   DROP TRIGGER IF EXISTS trg_challenge_submissions_updated_at ON public.challenge_submissions;
--   DROP FUNCTION IF EXISTS public.update_challenge_submissions_updated_at;
--   DROP TABLE IF EXISTS public.challenge_votes;
--   DROP TABLE IF EXISTS public.challenge_submissions;
--   DROP TABLE IF EXISTS public.challenges;

CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_tr text NOT NULL,
  description_en text NOT NULL,
  description_tr text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_challenge_dates CHECK (ends_at > starts_at)
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges public read" ON public.challenges
  FOR SELECT TO public USING (is_published = true);

CREATE POLICY "Challenges admin all" ON public.challenges
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX idx_challenge_submissions_challenge ON public.challenge_submissions (challenge_id, status);
CREATE INDEX idx_challenge_submissions_user ON public.challenge_submissions (user_id);

ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenge submissions public read approved" ON public.challenge_submissions
  FOR SELECT TO public USING (status = 'approved');

CREATE POLICY "Challenge submissions own all" ON public.challenge_submissions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Challenge submissions admin all" ON public.challenge_submissions
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.challenge_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.challenge_submissions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(submission_id, user_id)
);

CREATE INDEX idx_challenge_votes_submission ON public.challenge_votes (submission_id);

ALTER TABLE public.challenge_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenge votes public read" ON public.challenge_votes
  FOR SELECT TO public USING (true);

CREATE POLICY "Challenge votes own insert" ON public.challenge_votes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Challenge votes own delete" ON public.challenge_votes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_challenge_submissions_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_challenge_submissions_updated_at
  BEFORE UPDATE ON public.challenge_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_challenge_submissions_updated_at();
