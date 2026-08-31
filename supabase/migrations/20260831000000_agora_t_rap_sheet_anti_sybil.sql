-- alparai_schema.sql
-- Complete Supabase Schema & Functions for Agora-T, AI Rap Sheet, and Anti-Sybil

-- ============================================================================
-- 1. ANTI-SYBIL & REPUTATION ENGINE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_reputation (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  reputation_score INT NOT NULL DEFAULT 50 CHECK (reputation_score >= 0 AND reputation_score <= 100),
  is_sybil_suspect BOOLEAN NOT NULL DEFAULT FALSE,
  sybil_risk_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (sybil_risk_score >= 0 AND sybil_risk_score <= 100),
  trust_level VARCHAR(20) NOT NULL DEFAULT 'neutral' CHECK (trust_level IN ('trusted', 'neutral', 'suspicious', 'banned')),
  voucher_count INT NOT NULL DEFAULT 0,
  is_verified_citizen BOOLEAN NOT NULL DEFAULT FALSE,
  last_fingerprint_hash TEXT,
  last_ip_hash TEXT,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reputation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_reputation(user_id) ON DELETE CASCADE,
  change_amount INT NOT NULL,
  new_score INT NOT NULL,
  reason TEXT NOT NULL,
  action_type VARCHAR(50) NOT NULL DEFAULT 'generic_adjustment',
  triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sybil_detection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  fingerprint TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  risk_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  anomaly_flags JSONB DEFAULT '[]'::jsonb,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_reputation_trust_level ON public.user_reputation(trust_level);
CREATE INDEX IF NOT EXISTS idx_user_reputation_sybil ON public.user_reputation(is_sybil_suspect);
CREATE INDEX IF NOT EXISTS idx_reputation_logs_user_id ON public.reputation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sybil_detection_fingerprint ON public.sybil_detection_logs(fingerprint);
CREATE INDEX IF NOT EXISTS idx_sybil_detection_ip_hash ON public.sybil_detection_logs(ip_hash);

-- Trigger to maintain trust level & sybil suspect flag
CREATE OR REPLACE FUNCTION public.check_sybil_suspect_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reputation_score < 20 OR NEW.sybil_risk_score >= 75.00 THEN
    NEW.is_sybil_suspect := TRUE;
    NEW.trust_level := 'suspicious';
  ELSIF NEW.reputation_score >= 80 AND NEW.sybil_risk_score < 25.00 THEN
    NEW.is_sybil_suspect := FALSE;
    NEW.trust_level := 'trusted';
  ELSIF NEW.reputation_score < 5 THEN
    NEW.is_sybil_suspect := TRUE;
    NEW.trust_level := 'banned';
  ELSE
    NEW.is_sybil_suspect := FALSE;
    NEW.trust_level := 'neutral';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_sybil_suspect ON public.user_reputation;
CREATE TRIGGER trg_check_sybil_suspect
BEFORE INSERT OR UPDATE ON public.user_reputation
FOR EACH ROW EXECUTE FUNCTION public.check_sybil_suspect_fn();

-- Atomic Reputation Adjust RPC
CREATE OR REPLACE FUNCTION public.adjust_user_reputation_rpc(
  p_user_id UUID,
  p_change_amount INT,
  p_reason TEXT,
  p_action_type TEXT DEFAULT 'system_adjustment',
  p_triggered_by UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_current_score INT;
  v_new_score INT;
  v_trust_level TEXT;
BEGIN
  INSERT INTO public.user_reputation (user_id, reputation_score)
  VALUES (p_user_id, 50)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT reputation_score INTO v_current_score
  FROM public.user_reputation
  WHERE user_id = p_user_id;

  v_new_score := GREATEST(0, LEAST(100, v_current_score + p_change_amount));

  UPDATE public.user_reputation
  SET reputation_score = v_new_score,
      last_active_at = now()
  WHERE user_id = p_user_id
  RETURNING trust_level INTO v_trust_level;

  INSERT INTO public.reputation_logs (user_id, change_amount, new_score, reason, action_type, triggered_by)
  VALUES (p_user_id, p_change_amount, v_new_score, p_reason, p_action_type, p_triggered_by);

  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'previous_score', v_current_score,
    'new_score', v_new_score,
    'trust_level', v_trust_level,
    'change', p_change_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Evaluate Sybil Risk RPC
CREATE OR REPLACE FUNCTION public.evaluate_sybil_risk_rpc(
  p_fingerprint TEXT,
  p_ip_hash TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_fingerprint_count INT;
  v_ip_count INT;
  v_risk_score NUMERIC(5, 2) := 0.00;
  v_is_flagged BOOLEAN := FALSE;
  v_flags JSONB := '[]'::jsonb;
BEGIN
  SELECT COUNT(*) INTO v_fingerprint_count
  FROM public.sybil_detection_logs
  WHERE fingerprint = p_fingerprint
    AND detected_at >= now() - INTERVAL '24 hours';

  SELECT COUNT(*) INTO v_ip_count
  FROM public.sybil_detection_logs
  WHERE ip_hash = p_ip_hash
    AND detected_at >= now() - INTERVAL '24 hours';

  IF v_fingerprint_count >= 5 THEN
    v_risk_score := v_risk_score + 45.00;
    v_flags := v_flags || '["excessive_fingerprint_cluster"]'::jsonb;
  ELSIF v_fingerprint_count >= 3 THEN
    v_risk_score := v_risk_score + 25.00;
    v_flags := v_flags || '["moderate_fingerprint_cluster"]'::jsonb;
  END IF;

  IF v_ip_count >= 10 THEN
    v_risk_score := v_risk_score + 40.00;
    v_flags := v_flags || '["high_frequency_ip_burst"]'::jsonb;
  ELSIF v_ip_count >= 5 THEN
    v_risk_score := v_risk_score + 20.00;
    v_flags := v_flags || '["elevated_ip_activity"]'::jsonb;
  END IF;

  v_risk_score := LEAST(100.00, v_risk_score);
  v_is_flagged := v_risk_score >= 50.00;

  INSERT INTO public.sybil_detection_logs (user_id, fingerprint, ip_hash, risk_score, is_flagged, anomaly_flags)
  VALUES (p_user_id, p_fingerprint, p_ip_hash, v_risk_score, v_is_flagged, v_flags);

  IF p_user_id IS NOT NULL THEN
    UPDATE public.user_reputation
    SET sybil_risk_score = v_risk_score,
        last_fingerprint_hash = p_fingerprint,
        last_ip_hash = p_ip_hash,
        last_active_at = now()
    WHERE user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'risk_score', v_risk_score,
    'is_flagged', v_is_flagged,
    'fingerprint_occurrences_24h', v_fingerprint_count,
    'ip_occurrences_24h', v_ip_count,
    'anomaly_flags', v_flags
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. AGORA-T JURY & GOVERNANCE SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.jury_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'model_safety_violation',
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'voting', 'deliberation', 'resolved', 'dismissed')),
  target_provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
  target_model_id UUID REFERENCES public.ai_models(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  quorum_required INT NOT NULL DEFAULT 5,
  guilty_score NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  innocent_score NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  abstain_score NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  resolution_verdict VARCHAR(20) DEFAULT NULL CHECK (resolution_verdict IN ('guilty', 'innocent', 'tie', 'dismissed', NULL)),
  resolution_summary TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.jurors (
  case_id UUID NOT NULL REFERENCES public.jury_cases(id) ON DELETE CASCADE,
  juror_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selection_method VARCHAR(50) NOT NULL DEFAULT 'reputation_weighted',
  has_voted BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (case_id, juror_id)
);

CREATE TABLE IF NOT EXISTS public.jury_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.jury_cases(id) ON DELETE CASCADE,
  juror_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_decision VARCHAR(20) NOT NULL CHECK (vote_decision IN ('guilty', 'innocent', 'abstain')),
  vote_weight NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
  rationale TEXT,
  cryptographic_signature TEXT NOT NULL DEFAULT 'unsigned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (case_id, juror_id)
);

CREATE INDEX IF NOT EXISTS idx_jury_cases_status ON public.jury_cases(status);
CREATE INDEX IF NOT EXISTS idx_jury_cases_created_at ON public.jury_cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jury_votes_case ON public.jury_votes(case_id);

-- Agora-T Case Resolution RPC
CREATE OR REPLACE FUNCTION public.resolve_agora_case_rpc(p_case_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_case RECORD;
  v_guilty_score NUMERIC(8, 2) := 0.00;
  v_innocent_score NUMERIC(8, 2) := 0.00;
  v_abstain_score NUMERIC(8, 2) := 0.00;
  v_verdict VARCHAR(20);
  v_total_votes INT := 0;
BEGIN
  SELECT * INTO v_case FROM public.jury_cases WHERE id = p_case_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Case not found with ID %', p_case_id;
  END IF;

  SELECT 
    COALESCE(SUM(CASE WHEN vote_decision = 'guilty' THEN vote_weight ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN vote_decision = 'innocent' THEN vote_weight ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN vote_decision = 'abstain' THEN vote_weight ELSE 0 END), 0),
    COUNT(*)
  INTO v_guilty_score, v_innocent_score, v_abstain_score, v_total_votes
  FROM public.jury_votes
  WHERE case_id = p_case_id;

  IF v_guilty_score > v_innocent_score THEN
    v_verdict := 'guilty';
  ELSIF v_innocent_score > v_guilty_score THEN
    v_verdict := 'innocent';
  ELSE
    v_verdict := 'tie';
  END IF;

  UPDATE public.jury_cases
  SET status = 'resolved',
      guilty_score = v_guilty_score,
      innocent_score = v_innocent_score,
      abstain_score = v_abstain_score,
      resolution_verdict = v_verdict,
      resolution_summary = 'Resolved by Agora-T Constitutional Consensus. Guilty: ' || v_guilty_score || ', Innocent: ' || v_innocent_score,
      resolved_at = now(),
      updated_at = now()
  WHERE id = p_case_id;

  IF v_verdict = 'guilty' THEN
    INSERT INTO public.ai_rap_sheet_entries (
      case_id,
      incident_id,
      entity_type,
      entity_name,
      provider_id,
      model_id,
      user_id,
      violation_category,
      offense_summary,
      severity,
      penalty_type,
      penalty_details
    ) VALUES (
      p_case_id,
      v_case.incident_id,
      CASE 
        WHEN v_case.target_provider_id IS NOT NULL THEN 'provider'
        WHEN v_case.target_model_id IS NOT NULL THEN 'model'
        WHEN v_case.target_user_id IS NOT NULL THEN 'user'
        ELSE 'system'
      END,
      v_case.title,
      v_case.target_provider_id,
      v_case.target_model_id,
      v_case.target_user_id,
      v_case.category,
      v_case.description,
      'high',
      'public_censure',
      'Guilty verdict rendered in Agora-T Jury Case ID ' || p_case_id
    );

    IF v_case.target_user_id IS NOT NULL THEN
      PERFORM public.adjust_user_reputation_rpc(
        v_case.target_user_id,
        -25,
        'Found guilty by Agora-T Jury in case: ' || v_case.title,
        'agora_t_jury_penalty'
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'case_id', p_case_id,
    'verdict', v_verdict,
    'guilty_score', v_guilty_score,
    'innocent_score', v_innocent_score,
    'abstain_score', v_abstain_score,
    'total_votes', v_total_votes,
    'status', 'resolved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. AI RAP SHEET (WALL OF SHAME)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_rap_sheet_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.jury_cases(id) ON DELETE SET NULL,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
  entity_type VARCHAR(20) NOT NULL DEFAULT 'model' CHECK (entity_type IN ('provider', 'model', 'user', 'system')),
  entity_name VARCHAR(255) NOT NULL,
  provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
  model_id UUID REFERENCES public.ai_models(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  violation_category VARCHAR(100) NOT NULL DEFAULT 'safety_policy_breach',
  offense_summary TEXT NOT NULL,
  evidence_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  penalty_type VARCHAR(50) NOT NULL DEFAULT 'public_censure' CHECK (penalty_type IN ('fine_simulated', 'trust_demoted', 'public_censure', 'banned')),
  penalty_details TEXT,
  listed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  appeal_status VARCHAR(20) NOT NULL DEFAULT 'none' CHECK (appeal_status IN ('none', 'pending', 'rejected', 'accepted')),
  appeal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Backwards compatibility view for wall_of_shame_entries
CREATE OR REPLACE VIEW public.wall_of_shame_entries AS
SELECT 
  id AS entry_id,
  id,
  case_id,
  incident_id,
  user_id,
  offense_summary AS reason,
  penalty_details,
  listed_at,
  is_active,
  severity,
  entity_name,
  violation_category,
  appeal_status
FROM public.ai_rap_sheet_entries;

CREATE INDEX IF NOT EXISTS idx_rap_sheet_active ON public.ai_rap_sheet_entries(is_active);
CREATE INDEX IF NOT EXISTS idx_rap_sheet_severity ON public.ai_rap_sheet_entries(severity);
CREATE INDEX IF NOT EXISTS idx_rap_sheet_provider ON public.ai_rap_sheet_entries(provider_id);
CREATE INDEX IF NOT EXISTS idx_rap_sheet_model ON public.ai_rap_sheet_entries(model_id);
CREATE INDEX IF NOT EXISTS idx_rap_sheet_listed_at ON public.ai_rap_sheet_entries(listed_at DESC);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sybil_detection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jury_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jury_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_rap_sheet_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read user_reputation" ON public.user_reputation;
CREATE POLICY "Public read user_reputation" ON public.user_reputation
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin write user_reputation" ON public.user_reputation;
CREATE POLICY "Admin write user_reputation" ON public.user_reputation
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users read own reputation_logs" ON public.reputation_logs;
CREATE POLICY "Users read own reputation_logs" ON public.reputation_logs
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin write reputation_logs" ON public.reputation_logs;
CREATE POLICY "Admin write reputation_logs" ON public.reputation_logs
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public insert sybil_detection_logs" ON public.sybil_detection_logs;
CREATE POLICY "Public insert sybil_detection_logs" ON public.sybil_detection_logs
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read sybil_detection_logs" ON public.sybil_detection_logs;
CREATE POLICY "Admin read sybil_detection_logs" ON public.sybil_detection_logs
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));

DROP POLICY IF EXISTS "Public read jury_cases" ON public.jury_cases;
CREATE POLICY "Public read jury_cases" ON public.jury_cases
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated create jury_cases" ON public.jury_cases;
CREATE POLICY "Authenticated create jury_cases" ON public.jury_cases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin & Moderator manage jury_cases" ON public.jury_cases;
CREATE POLICY "Admin & Moderator manage jury_cases" ON public.jury_cases
  FOR UPDATE TO authenticated USING (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public read jurors" ON public.jurors;
CREATE POLICY "Public read jurors" ON public.jurors
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Moderators assign jurors" ON public.jurors;
CREATE POLICY "Moderators assign jurors" ON public.jurors
  FOR ALL TO authenticated USING (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public read jury_votes" ON public.jury_votes;
CREATE POLICY "Public read jury_votes" ON public.jury_votes
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Jurors submit own vote" ON public.jury_votes;
CREATE POLICY "Jurors submit own vote" ON public.jury_votes
  FOR INSERT TO authenticated WITH CHECK (juror_id = auth.uid());

DROP POLICY IF EXISTS "Public read ai_rap_sheet" ON public.ai_rap_sheet_entries;
CREATE POLICY "Public read ai_rap_sheet" ON public.ai_rap_sheet_entries
  FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_moderator(auth.uid()));

DROP POLICY IF EXISTS "Moderators manage ai_rap_sheet" ON public.ai_rap_sheet_entries;
CREATE POLICY "Moderators manage ai_rap_sheet" ON public.ai_rap_sheet_entries
  FOR ALL TO authenticated USING (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()));
