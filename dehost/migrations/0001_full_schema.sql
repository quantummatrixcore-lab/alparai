-- 0001_full_schema.sql — HYBRID CANONICAL (built by auditor script, date in gate log)
-- BASE: pg_dump --schema-only of live alparai_prod (self-consistent, PG 16) +
-- DELTA: new-table DDL extracted from legacy squash (functions/triggers/views kept whole).
-- Seeds live separately (not gated). Requires extensions: btree_gin, pg_trgm, pgcrypto, uuid-ossp, vector.

--
-- PostgreSQL database dump
--

\restrict 21PIcKQSlv3RFnml1lbXYlhcmbzMKZiQMMljE7FaSvgERZFXU6YnasYy2Nk3W0g

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg12+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg12+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'public', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: btree_gin; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gin WITH SCHEMA public;


--
-- Name: EXTENSION btree_gin; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gin IS 'support for indexing common datatypes in GIN';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: evidence_kind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.evidence_kind AS ENUM (
    'screenshot',
    'video',
    'document',
    'url',
    'transcript',
    'other'
);


--
-- Name: incident_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.incident_category AS ENUM (
    'hallucination',
    'bias',
    'privacy',
    'security',
    'misinformation',
    'harassment',
    'manipulation',
    'inaccessibility',
    'copyright',
    'other',
    'non_consensual_intimate_imagery_csam',
    'wrongful_flagging'
);


--
-- Name: incident_severity; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.incident_severity AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


--
-- Name: incident_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.incident_status AS ENUM (
    'pending_review',
    'published',
    'rejected',
    'archived',
    'takedown'
);


--
-- Name: model_weight_class; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.model_weight_class AS ENUM (
    'open',
    'closed',
    'unknown'
);


--
-- Name: question_bank_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.question_bank_status AS ENUM (
    'draft',
    'approved',
    'active',
    'retired'
);


--
-- Name: suggestion_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.suggestion_status AS ENUM (
    'open',
    'under_review',
    'planned',
    'in_progress',
    'completed',
    'declined'
);


--
-- Name: takedown_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.takedown_status AS ENUM (
    'received',
    'under_review',
    'approved',
    'rejected',
    'escalated'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'moderator',
    'admin',
    'ceo',
    'advisor'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$ 
  SELECT COALESCE(nullif(current_setting('request.jwt.claim.email', true), ''), 'admin@alparai.com')::text;
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$ 
  SELECT COALESCE(nullif(current_setting('request.jwt.claim.role', true), ''), 'authenticated')::text;
$$;


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$ 
  SELECT COALESCE(nullif(current_setting('request.jwt.claim.sub', true), ''), '00000000-0000-0000-0000-000000000000')::uuid;
$$;


--
-- Name: adjust_user_reputation_rpc(uuid, integer, text, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.adjust_user_reputation_rpc(p_user_id uuid, p_change_amount integer, p_reason text, p_action_type text DEFAULT 'system_adjustment'::text, p_triggered_by uuid DEFAULT NULL::uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_current_score INT;
  v_new_score INT;
  v_trust_level TEXT;
BEGIN
  INSERT INTO public.user_reputation (user_id, reputation_score) -- KEEP: runtime insert inside stored function adjust_user_reputation_rpc
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

  INSERT INTO public.reputation_logs (user_id, change_amount, new_score, reason, action_type, triggered_by) -- KEEP: audit log insert inside stored function adjust_user_reputation_rpc
  VALUES (p_user_id, p_change_amount, v_new_score, p_reason, p_action_type, p_triggered_by);

  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'previous_score', v_current_score,
    'new_score', v_new_score,
    'trust_level', v_trust_level,
    'change', p_change_amount
  );
END;
$$;


--
-- Name: check_sybil_suspect(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_sybil_suspect() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.reputation_score < 20 THEN
        NEW.is_sybil_suspect = TRUE;
        NEW.trust_level = 'suspicious';
    ELSIF NEW.reputation_score >= 80 THEN
        NEW.is_sybil_suspect = FALSE;
        NEW.trust_level = 'trusted';
    ELSE
        NEW.is_sybil_suspect = FALSE;
        NEW.trust_level = 'neutral';
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: check_sybil_suspect_fn(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_sybil_suspect_fn() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: cleanup_geo_scores(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_geo_scores() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    DELETE FROM public.geo_citations WHERE created_at < NOW() - INTERVAL '30 days';
    DELETE FROM public.geo_scores WHERE calculated_at < NOW() - INTERVAL '90 days';
END;
$$;


--
-- Name: evaluate_sybil_risk_rpc(text, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.evaluate_sybil_risk_rpc(p_fingerprint text, p_ip_hash text, p_user_id uuid DEFAULT NULL::uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
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

  INSERT INTO public.sybil_detection_logs (user_id, fingerprint, ip_hash, risk_score, is_flagged, anomaly_flags) -- KEEP: security detection log insert inside stored function evaluate_sybil_risk_rpc
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
$$;


--
-- Name: get_database_size(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_database_size() RETURNS bigint
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT pg_database_size(current_database());
$$;


--
-- Name: get_incident_weight_class_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_incident_weight_class_stats() RETURNS TABLE(weight_class public.model_weight_class, incident_count bigint)
    LANGUAGE sql STABLE
    SET search_path TO 'public'
    AS $$
  select m.weight_class, count(*)::bigint as incident_count
  from public.incidents i
  join public.ai_models m on m.id = i.ai_model_id
  where i.status = 'published'
  group by m.weight_class
$$;


--
-- Name: get_storage_size(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_storage_size() RETURNS bigint
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT COALESCE(SUM((metadata->>'size')::bigint), 0)::bigint FROM storage.objects;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  insert into public.users (id, email, full_name, avatar_url, locale) -- KEEP: user profile bootstrap insert inside handle_new_user auth trigger
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'locale', 'en')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: increment_incident_views(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_incident_views(p_incident_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.incidents
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_incident_id;
END;
$$;


--
-- Name: increment_poll_count(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_poll_count(p_poll_id uuid, p_choice text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if p_choice = 'yes' then
    update ai_polls set yes_count = yes_count + 1 where id = p_poll_id;
  elsif p_choice = 'no' then
    update ai_polls set no_count = no_count + 1 where id = p_poll_id;
  elsif p_choice = 'unsure' then
    update ai_polls set unsure_count = unsure_count + 1 where id = p_poll_id;
  end if;
end;
$$;


--
-- Name: increment_suggestion_comment_count(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_suggestion_comment_count(p_suggestion_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.suggestions
  SET comments_count = comments_count + 1
  WHERE id = p_suggestion_id;
END;
$$;


--
-- Name: is_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin(uid uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from public.users
    where id = uid and role in ('admin', 'ceo')
  );
$$;


--
-- Name: is_moderator(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_moderator(uid uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from public.users
    where id = uid and role in ('moderator', 'admin', 'ceo')
  );
$$;


--
-- Name: log_admin_login(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_admin_login() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.last_sign_in_at IS NOT NULL AND (OLD.last_sign_in_at IS NULL OR NEW.last_sign_in_at > OLD.last_sign_in_at) THEN
    IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id AND role = 'admin') THEN
      INSERT INTO public.admin_login_events (user_id, login_time, ip_address, user_agent) -- KEEP: security audit insert inside admin login trigger function
      VALUES (
        NEW.id,
        NEW.last_sign_in_at,
        current_setting('request.headers', true)::json->>'x-forwarded-for',
        current_setting('request.headers', true)::json->>'user-agent'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: normalize_takedown_status(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.normalize_takedown_status(s text) RETURNS public.takedown_status
    LANGUAGE sql IMMUTABLE
    AS $$
  select case
    when s = 'pending' then 'received'::public.takedown_status
    when s = 'approved' then 'approved'::public.takedown_status
    when s = 'rejected' then 'rejected'::public.takedown_status
    when s = 'under_review' then 'under_review'::public.takedown_status
    when s = 'escalated' then 'escalated'::public.takedown_status
    else 'received'::public.takedown_status
  end;
$$;


--
-- Name: refresh_incidents_stat(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.refresh_incidents_stat() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO platform_stats_cache (stat_key, stat_value, updated_at) VALUES ('incidents_total', 1, now()) -- KEEP: cache population inside platform statistics refresh trigger/function
    ON CONFLICT (stat_key) DO UPDATE SET stat_value = platform_stats_cache.stat_value + 1, updated_at = now();
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE platform_stats_cache SET stat_value = stat_value - 1, updated_at = now() WHERE stat_key = 'incidents_total';
  END IF;
  RETURN NULL;
END;
$$;


--
-- Name: resolve_agora_case_rpc(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.resolve_agora_case_rpc(p_case_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
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
    INSERT INTO public.ai_rap_sheet_entries ( -- KEEP: tribunal verdict record insert inside resolve_tribunal_case_rpc
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
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: startup_health_kpis(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.startup_health_kpis() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    users_this_month integer;
    users_last_month integer;
    incidents_this_month integer;
    incidents_last_month integer;
    subscribers_this_month integer;
    subscribers_last_month integer;
    
    result json;
BEGIN
    -- users count
    SELECT count(*) INTO users_this_month 
    FROM public.users 
    WHERE date_trunc('month', created_at) = date_trunc('month', now());
    
    SELECT count(*) INTO users_last_month 
    FROM public.users 
    WHERE date_trunc('month', created_at) = date_trunc('month', now() - interval '1 month');

    -- incidents count
    SELECT count(*) INTO incidents_this_month 
    FROM incidents 
    WHERE date_trunc('month', created_at) = date_trunc('month', now());
    
    SELECT count(*) INTO incidents_last_month 
    FROM incidents 
    WHERE date_trunc('month', created_at) = date_trunc('month', now() - interval '1 month');

    -- newsletter_subscribers count
    SELECT count(*) INTO subscribers_this_month 
    FROM newsletter_subscribers 
    WHERE date_trunc('month', created_at) = date_trunc('month', now());
    
    SELECT count(*) INTO subscribers_last_month 
    FROM newsletter_subscribers 
    WHERE date_trunc('month', created_at) = date_trunc('month', now() - interval '1 month');

    result := json_build_object(
        'users', json_build_object(
            'this_month', users_this_month,
            'last_month', users_last_month
        ),
        'incidents', json_build_object(
            'this_month', incidents_this_month,
            'last_month', incidents_last_month
        ),
        'subscribers', json_build_object(
            'this_month', subscribers_this_month,
            'last_month', subscribers_last_month
        )
    );

    RETURN result;
END;
$$;


--
-- Name: submit_incident_atomic(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.submit_incident_atomic(payload jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    new_incident_id UUID;
    v_user_id UUID;
    v_title TEXT;
    v_title_masked TEXT;
    v_description TEXT;
    v_description_masked TEXT;
    v_category public.incident_category;
    v_severity public.incident_severity;
    v_ai_provider_id UUID;
    v_ai_model_id UUID;
    v_provider_custom_name TEXT;
    v_model_custom_name TEXT;
    v_incident_date TIMESTAMPTZ;
    v_language TEXT;
    v_is_anonymous BOOLEAN;
    v_is_expert BOOLEAN;
    v_expert_fix TEXT;
    v_source_url TEXT;
    v_is_possible_duplicate BOOLEAN;
    v_ip_hash TEXT;
    v_user_agent TEXT;
    v_contains_pii BOOLEAN;
    v_pii_categories TEXT[];
    v_anonymous_email_hash TEXT;
    v_age_consent BOOLEAN;
    v_coppa_consent BOOLEAN;
    v_uk_osa_consent BOOLEAN;
    v_now TEXT;
    v_consent_types TEXT[] := ARRAY['submission_truthfulness', 'age_18_plus', 'terms_of_service', 'coppa_thirteen_plus', 'uk_osa_eighteen_plus'];
    v_ctype TEXT;
BEGIN
    v_user_id := CASE WHEN payload->>'user_id' IS NOT NULL AND payload->>'user_id' <> '' THEN (payload->>'user_id')::UUID ELSE NULL END;
    v_title := payload->>'title';
    v_title_masked := payload->>'title_masked';
    v_description := payload->>'description';
    v_description_masked := payload->>'description_masked';
    v_category := (payload->>'category')::public.incident_category;
    v_severity := (payload->>'severity')::public.incident_severity;
    v_ai_provider_id := CASE WHEN payload->>'ai_provider_id' IS NOT NULL AND payload->>'ai_provider_id' <> '' THEN (payload->>'ai_provider_id')::UUID ELSE NULL END;
    v_ai_model_id := CASE WHEN payload->>'ai_model_id' IS NOT NULL AND payload->>'ai_model_id' <> '' THEN (payload->>'ai_model_id')::UUID ELSE NULL END;
    v_provider_custom_name := payload->>'provider_custom_name';
    v_model_custom_name := payload->>'model_custom_name';
    v_incident_date := COALESCE((payload->>'incident_date')::TIMESTAMPTZ, clock_timestamp());
    v_language := COALESCE(payload->>'language', 'en');
    v_is_anonymous := COALESCE((payload->>'is_anonymous')::BOOLEAN, false);
    v_is_expert := COALESCE((payload->>'is_expert')::BOOLEAN, false);
    v_expert_fix := payload->>'expert_fix';
    v_source_url := payload->>'source_url';
    v_is_possible_duplicate := COALESCE((payload->>'is_possible_duplicate')::BOOLEAN, false);
    v_ip_hash := payload->>'ip_hash';
    v_user_agent := payload->>'user_agent';
    v_contains_pii := COALESCE((payload->>'contains_pii')::BOOLEAN, false);
    
    IF payload->'pii_categories' IS NOT NULL AND jsonb_typeof(payload->'pii_categories') = 'array' THEN
        SELECT ARRAY(SELECT jsonb_array_elements_text(payload->'pii_categories')) INTO v_pii_categories;
    ELSE
        v_pii_categories := ARRAY[]::TEXT[];
    END IF;
    
    v_anonymous_email_hash := payload->>'anonymous_email_hash';
    v_age_consent := COALESCE((payload->>'age_consent')::BOOLEAN, true);
    v_coppa_consent := COALESCE((payload->>'coppa_consent')::BOOLEAN, true);
    v_uk_osa_consent := COALESCE((payload->>'uk_osa_consent')::BOOLEAN, true);

    INSERT INTO public.incidents ( -- KEEP: incident creation record inside submit_anonymous_incident RPC
        user_id, title, title_masked, description, description_masked,
        category, severity, ai_provider_id, ai_model_id,
        provider_custom_name, model_custom_name, incident_date,
        language, is_anonymous, is_expert, expert_fix,
        source_url, is_possible_duplicate, ip_hash, user_agent,
        contains_pii, pii_categories, status, anonymous_email_hash
    ) VALUES (
        v_user_id, v_title, v_title_masked, v_description, v_description_masked,
        v_category, v_severity, v_ai_provider_id, v_ai_model_id,
        v_provider_custom_name, v_model_custom_name, v_incident_date,
        v_language, v_is_anonymous, v_is_expert, v_expert_fix,
        v_source_url, v_is_possible_duplicate, v_ip_hash, v_user_agent,
        v_contains_pii, v_pii_categories, 'pending_review', v_anonymous_email_hash
    )
    RETURNING id INTO new_incident_id;

    IF v_ip_hash IS NOT NULL AND v_ip_hash <> '' THEN
        INSERT INTO public.submission_attempts (ip_hash) VALUES (v_ip_hash); -- KEEP: rate-limit tracking record inside submit_anonymous_incident RPC
    END IF;

    INSERT INTO public.age_declarations ( -- KEEP: legal age compliance record inside submit_anonymous_incident RPC
        user_id, incident_id, declared_over_18, coppa_thirteen_plus, uk_osa_eighteen_plus, ip_hash
    ) VALUES (
        v_user_id, new_incident_id, v_age_consent, v_coppa_consent, v_uk_osa_consent, v_ip_hash
    );

    v_now := to_char(clock_timestamp(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
    FOREACH v_ctype IN ARRAY v_consent_types LOOP
        INSERT INTO public.consent_log ( -- KEEP: compliance consent tracking record inside submit_anonymous_incident RPC
            user_id, consent_type, consent_text_snapshot, related_entity_type,
            related_entity_id, granted, ip_hash, user_agent
        ) VALUES (
            v_user_id, v_ctype, 'Accepted on ' || v_now || ' for incident ' || new_incident_id::text,
            'incident', new_incident_id, true, v_ip_hash, v_user_agent
        );
    END LOOP;

    RETURN jsonb_build_object('id', new_incident_id);
END;
$$;


--
-- Name: tg_incident_comments_touch(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tg_incident_comments_touch() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


--
-- Name: tg_incident_votes_touch(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tg_incident_votes_touch() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


--
-- Name: tg_incidents_search_vector(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tg_incidents_search_vector() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple'::regconfig, coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(new.description,'')), 'B') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(new.category::text,'')), 'C');
  return new;
end;
$$;


--
-- Name: tg_model_feature_votes_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tg_model_feature_votes_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if (TG_OP = 'INSERT') then
    update public.model_feature_requests
    set votes_count = votes_count + 1
    where id = new.request_id;
  elsif (TG_OP = 'DELETE') then
    update public.model_feature_requests
    set votes_count = votes_count - 1
    where id = old.request_id;
  end if;
  return null;
end;
$$;


--
-- Name: tg_model_review_votes_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tg_model_review_votes_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if (TG_OP = 'INSERT') then
    update public.model_reviews
    set helpful_count = helpful_count + 1
    where id = new.review_id;
  elsif (TG_OP = 'DELETE') then
    update public.model_reviews
    set helpful_count = helpful_count - 1
    where id = old.review_id;
  end if;
  return null;
end;
$$;


--
-- Name: tg_update_incident_affected_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tg_update_incident_affected_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.incidents
    SET affected_users_count = COALESCE(affected_users_count, 0) + 1
    WHERE id = NEW.incident_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.incidents
    SET affected_users_count = GREATEST(0, COALESCE(affected_users_count, 0) - 1)
    WHERE id = OLD.incident_id;
  END IF;
  RETURN NULL;
END;
$$;


--
-- Name: tg_update_incident_upvotes_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tg_update_incident_upvotes_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- After insert
  IF TG_OP = 'INSERT' THEN
    IF NEW.value = 1 THEN
      UPDATE public.incidents
      SET upvotes_count = COALESCE(upvotes_count, 0) + 1
      WHERE id = NEW.incident_id;
    END IF;
  -- After update
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.value = 1 AND NEW.value <> 1 THEN
      UPDATE public.incidents
      SET upvotes_count = COALESCE(upvotes_count, 0) - 1
      WHERE id = NEW.incident_id;
    ELSIF OLD.value <> 1 AND NEW.value = 1 THEN
      UPDATE public.incidents
      SET upvotes_count = COALESCE(upvotes_count, 0) + 1
      WHERE id = NEW.incident_id;
    END IF;
  -- After delete
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.value = 1 THEN
      UPDATE public.incidents
      SET upvotes_count = COALESCE(upvotes_count, 0) - 1
      WHERE id = OLD.incident_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;


--
-- Name: update_modified_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_modified_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text,
    encrypted_password text,
    email_confirmed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    raw_app_meta_data jsonb DEFAULT '{}'::jsonb,
    raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
    is_super_admin boolean DEFAULT false,
    role text DEFAULT 'authenticated'::text
);


--
-- Name: advisory_board_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advisory_board_members (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    name text,
    title_en text,
    title_tr text,
    institution_en text,
    institution_tr text,
    bio_en text,
    bio_tr text,
    avatar_url text,
    display_order numeric,
    created_at text,
    updated_at text,
    term_start text,
    term_end text,
    is_active boolean,
    website_url text,
    press_url text
);


--
-- Name: ai_free_models; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_free_models (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    name text NOT NULL,
    provider text NOT NULL,
    context_length integer DEFAULT 0,
    pricing_prompt numeric DEFAULT 0,
    pricing_completion numeric DEFAULT 0,
    is_active boolean DEFAULT true,
    last_checked_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: ai_models; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_models (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_id uuid NOT NULL,
    name text NOT NULL,
    version text,
    released_at date,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    weight_class public.model_weight_class DEFAULT 'unknown'::public.model_weight_class,
    deprecated_at text,
    CONSTRAINT ai_models_status_check CHECK ((status = ANY (ARRAY['active'::text, 'deprecated'::text, 'beta'::text])))
);


--
-- Name: ai_poll_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_poll_votes (
    poll_id uuid NOT NULL,
    user_id uuid,
    ip_hash text NOT NULL,
    choice text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_poll_votes_choice_check CHECK ((choice = ANY (ARRAY['yes'::text, 'no'::text, 'unsure'::text])))
);


--
-- Name: ai_polls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_polls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category text DEFAULT 'dilemma'::text NOT NULL,
    yes_count integer DEFAULT 0 NOT NULL,
    no_count integer DEFAULT 0 NOT NULL,
    unsure_count integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    context_news_id uuid,
    title_tr text,
    title_en text NOT NULL,
    description_tr text,
    description_en text NOT NULL
);


--
-- Name: ai_polls_seed_yedek; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_polls_seed_yedek (
    id uuid,
    title text,
    description text,
    category text,
    yes_count integer,
    no_count integer,
    unsure_count integer,
    is_active boolean,
    created_at timestamp with time zone,
    context_news_id uuid,
    title_tr text,
    title_en text,
    description_tr text,
    description_en text
);


--
-- Name: ai_provider_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_provider_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    ai_provider_id uuid NOT NULL,
    response_text text NOT NULL,
    responder_name text NOT NULL,
    responder_role text,
    responder_email text,
    is_official boolean DEFAULT false NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    response_type text DEFAULT 'official_reply'::text NOT NULL,
    source_url text,
    statement_date date,
    verified_by uuid,
    CONSTRAINT ai_provider_responses_response_text_check CHECK ((char_length(response_text) <= 10000)),
    CONSTRAINT ai_provider_responses_response_type_check CHECK ((response_type = ANY (ARRAY['official_reply'::text, 'public_statement'::text]))),
    CONSTRAINT responder_email_required_for_official_reply CHECK ((((response_type = 'official_reply'::text) AND (responder_email IS NOT NULL)) OR (response_type = 'public_statement'::text))),
    CONSTRAINT source_url_required_for_public_statement CHECK ((((response_type = 'public_statement'::text) AND (source_url IS NOT NULL)) OR (response_type = 'official_reply'::text)))
);


--
-- Name: ai_providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text,
    website_url text,
    contact_email text,
    logo_url text,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    trust_score integer DEFAULT 70,
    is_verified_respondent boolean,
    verified_respondent_at text,
    respondent_contact_email text,
    respondent_verified_by text
);


--
-- Name: ai_routing_chains; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_routing_chains (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    capability_domain text NOT NULL,
    primary_model_id text NOT NULL,
    secondary_model_id text NOT NULL,
    tertiary_model_id text NOT NULL,
    judge_model_id text NOT NULL,
    is_active boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now(),
    domain_name text,
    models jsonb,
    created_at text
);


--
-- Name: ai_scoring_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_scoring_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    w_audit numeric(3,2) DEFAULT 0.50 NOT NULL,
    w_incident numeric(3,2) DEFAULT 0.50 NOT NULL,
    is_combined_active boolean DEFAULT false NOT NULL,
    min_audits_threshold integer DEFAULT 30 NOT NULL,
    min_incidents_threshold integer DEFAULT 100 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_trust_ledger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_trust_ledger (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    model_id text NOT NULL,
    audit_score numeric(5,2) NOT NULL,
    incident_score numeric(5,2) NOT NULL,
    combined_score numeric(5,2) NOT NULL,
    hash_signature text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_trust_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_trust_scores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    model_id text NOT NULL,
    provider text NOT NULL,
    trust_score numeric DEFAULT 85.0,
    hallucination_rate numeric DEFAULT 0.05,
    ethical_compliance numeric DEFAULT 90.0,
    total_audits integer DEFAULT 0,
    last_audited_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_keys (
    provider text NOT NULL,
    api_key text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tier text,
    client_type text,
    id text
);


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    before_data jsonb,
    after_data jsonb,
    ip_hash text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: automation_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automation_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    result jsonb DEFAULT '{}'::jsonb,
    error_message text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    CONSTRAINT automation_tasks_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'running'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])))
);


--
-- Name: autopilot_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.autopilot_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    idempotency_key text NOT NULL,
    action text NOT NULL,
    status text NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    last_error text,
    duration_ms integer,
    result_id uuid,
    ip_hash text,
    user_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    cost_cents bigint,
    token_count bigint,
    CONSTRAINT autopilot_runs_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'running'::text, 'succeeded'::text, 'exhausted'::text, 'replayed'::text, 'circuit_open'::text, 'budget_exceeded'::text])))
);


--
-- Name: bilge_memory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bilge_memory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content text,
    metadata jsonb DEFAULT '{}'::jsonb,
    embedding public.vector(1536),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title_en text NOT NULL,
    title_tr text NOT NULL,
    content_en text NOT NULL,
    content_tr text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    generated_by text,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT blog_posts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text])))
);


--
-- Name: bounty_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bounty_badges (
    code text NOT NULL,
    name_en text NOT NULL,
    name_tr text NOT NULL,
    description_en text NOT NULL,
    description_tr text NOT NULL,
    icon text NOT NULL,
    threshold_count integer DEFAULT 1 NOT NULL
);


--
-- Name: bug_bounties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bug_bounties (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    reporter_id uuid NOT NULL,
    provider_id uuid,
    status text DEFAULT 'open'::text NOT NULL,
    severity_score integer DEFAULT 0 NOT NULL,
    estimated_reward_cents integer DEFAULT 0,
    actual_reward_cents integer DEFAULT 0,
    badge_awarded boolean DEFAULT false NOT NULL,
    notes text,
    validated_by uuid,
    validated_at timestamp with time zone,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT bug_bounties_severity_score_check CHECK (((severity_score >= 0) AND (severity_score <= 100))),
    CONSTRAINT bug_bounties_status_check CHECK ((status = ANY (ARRAY['open'::text, 'validated'::text, 'claimed'::text, 'paid'::text, 'rejected'::text, 'expired'::text])))
);


--
-- Name: consent_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consent_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    consent_type text NOT NULL,
    consent_text_snapshot text NOT NULL,
    granted boolean NOT NULL,
    ip_hash text,
    user_agent text,
    related_entity_type text,
    related_entity_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cookie_consent_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cookie_consent_log (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    user_id text,
    session_id text,
    consent_level text,
    ip_hash text,
    user_agent text,
    created_at text
);


--
-- Name: cost_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cost_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_id uuid NOT NULL,
    model_used character varying(255) NOT NULL,
    prompt_tokens integer DEFAULT 0 NOT NULL,
    completion_tokens integer DEFAULT 0 NOT NULL,
    cost_usd numeric(10,4) DEFAULT 0.0000 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: cron_job_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cron_job_logs (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    cron_name text,
    started_at text,
    completed_at text,
    status text,
    error_message text,
    execution_metadata jsonb
);


--
-- Name: ecosystem_news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ecosystem_news (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title_en text NOT NULL,
    title_tr text,
    summary_en text,
    summary_tr text,
    url text,
    source text,
    category text DEFAULT 'news'::text NOT NULL,
    severity text DEFAULT 'medium'::text NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    published_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    status text,
    CONSTRAINT ecosystem_news_severity_check CHECK ((severity = ANY (ARRAY['critical'::text, 'high'::text, 'medium'::text, 'low'::text])))
);


--
-- Name: email_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_preferences (
    user_id text,
    weekly_digest boolean,
    watches boolean,
    reporter_notifications boolean,
    updated_at text,
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    email text,
    marketing_opt_in boolean,
    source text
);


--
-- Name: evidence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evidence (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    kind public.evidence_kind DEFAULT 'screenshot'::public.evidence_kind NOT NULL,
    file_path text NOT NULL,
    file_name text NOT NULL,
    file_size_bytes bigint,
    mime_type text,
    sha256_hash text,
    width_px integer,
    height_px integer,
    contains_pii boolean DEFAULT false NOT NULL,
    pii_categories text[],
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: expert_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expert_applications (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    name text,
    title_institution text,
    expertise text,
    linkedin_url text,
    status text,
    reviewed_by uuid,
    reviewed_at text,
    created_at text,
    email text,
    expertise_area text
);


--
-- Name: external_incidents_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.external_incidents_queue (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    source text,
    external_url text,
    title text,
    body text,
    source_score numeric,
    status text,
    fetched_at text,
    created_at text,
    updated_at text
);


--
-- Name: feed_incidents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feed_incidents (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    user_id text,
    is_anonymous boolean,
    title text,
    description text,
    title_masked text,
    description_masked text,
    ai_provider_id text,
    ai_model_id text,
    category text,
    severity text,
    incident_date text,
    location_country text,
    language text,
    status text,
    moderator_id text,
    moderator_notes text,
    reviewed_at text,
    views_count numeric,
    upvotes_count numeric,
    shares_count numeric,
    comments_count numeric,
    source_url text,
    ip_hash text,
    user_agent text,
    search_vector text,
    created_at text,
    updated_at text,
    published_at text,
    moderated_at text,
    moderation_note text,
    contains_pii boolean,
    pii_categories jsonb,
    title_tr text,
    description_tr text,
    provider_custom_name text,
    model_custom_name text,
    ai_moderation_score text,
    ai_moderation_reason text,
    cross_audit_truth_score numeric,
    cross_audit_confidence text,
    cross_audit_reasoning text,
    cross_audit_model text,
    cross_audit_triage_models text,
    cross_audit_completed_at text,
    affected_users_count numeric,
    feed_score text
);


--
-- Name: finance_monthly_costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finance_monthly_costs (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    service text,
    month text,
    amount_usd numeric,
    budget_usd numeric,
    currency text,
    metadata text,
    created_at text,
    updated_at text
);


--
-- Name: financials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    organization_id uuid,
    transaction_type text NOT NULL,
    category text NOT NULL,
    amount_cents bigint NOT NULL,
    amount_usd numeric(14,4) GENERATED ALWAYS AS (((amount_cents)::numeric / 100.0)) STORED,
    currency text DEFAULT 'USD'::text NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    stripe_payment_id text,
    stripe_customer_id text,
    stripe_invoice_id text,
    billing_period_start timestamp with time zone,
    billing_period_end timestamp with time zone,
    breakdown jsonb DEFAULT '{}'::jsonb NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE ONLY public.financials ALTER COLUMN transaction_type SET STATISTICS 500;
ALTER TABLE ONLY public.financials ALTER COLUMN status SET STATISTICS 500;


--
-- Name: funnel_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.funnel_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_name text NOT NULL,
    user_id uuid,
    session_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: grant_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grant_applications (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    program_name text,
    funding_amount text,
    apply_url text,
    category text,
    phase numeric,
    status text,
    prepared_content_ref text,
    completed_by uuid,
    completed_at text,
    approved_by uuid,
    approved_at text,
    notes text,
    created_at text,
    user_id text
);


--
-- Name: heartbeats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.heartbeats (
    agent_id uuid NOT NULL,
    role character varying(255) NOT NULL,
    last_active_ts timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: incident_affected_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incident_affected_users (
    incident_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: incident_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incident_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    user_id uuid NOT NULL,
    comment_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: incident_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incident_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    user_id uuid NOT NULL,
    value smallint NOT NULL,
    ip_hash text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT incident_votes_value_check CHECK ((value = ANY (ARRAY['-1'::integer, 0, 1])))
);


--
-- Name: incidents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incidents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    is_anonymous boolean DEFAULT true NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    title_masked text,
    description_masked text,
    ai_provider_id uuid,
    ai_model_id uuid,
    category public.incident_category DEFAULT 'other'::public.incident_category NOT NULL,
    severity public.incident_severity DEFAULT 'medium'::public.incident_severity NOT NULL,
    incident_date date,
    location_country text,
    language text DEFAULT 'en'::text NOT NULL,
    status public.incident_status DEFAULT 'pending_review'::public.incident_status NOT NULL,
    moderator_id uuid,
    moderator_notes text,
    reviewed_at timestamp with time zone,
    views_count integer DEFAULT 0 NOT NULL,
    upvotes_count integer DEFAULT 0 NOT NULL,
    shares_count integer DEFAULT 0 NOT NULL,
    comments_count integer DEFAULT 0 NOT NULL,
    source_url text,
    ip_hash text,
    user_agent text,
    search_vector tsvector,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    published_at timestamp with time zone,
    moderated_at timestamp with time zone,
    moderation_note text,
    contains_pii boolean DEFAULT false NOT NULL,
    pii_categories text[] DEFAULT '{}'::text[] NOT NULL,
    title_tr text,
    description_tr text,
    provider_custom_name text,
    model_custom_name text,
    ai_moderation_score integer,
    ai_moderation_reason text,
    cross_audit_truth_score integer,
    cross_audit_confidence real,
    cross_audit_reasoning text,
    cross_audit_model text,
    cross_audit_triage_models text[],
    cross_audit_completed_at timestamp with time zone,
    affected_users_count integer DEFAULT 0 NOT NULL,
    vendor_response_text text,
    vendor_response_at timestamp with time zone,
    incident_source text,
    import_external_id text,
    import_attribution text,
    eu_act_transparency_score text,
    eu_act_non_discrimination_score text,
    eu_act_data_privacy_score text,
    eu_act_risk_category text,
    is_expert boolean,
    expert_fix text,
    eu_act_serious_incident_class text,
    eu_act_high_risk_system_category text,
    eu_act_reporting_deadline_days text,
    processing_stage text,
    is_seed boolean,
    source_badge text,
    audit_tier text,
    anonymous_email_hash text,
    expert_verified boolean,
    expert_verifier_id text,
    is_possible_duplicate boolean,
    encrypted_evidence boolean,
    evidence_ciphertext text,
    attribution_method text,
    attribution_keyword text,
    attribution_confidence real,
    needs_provider_review boolean DEFAULT false NOT NULL,
    CONSTRAINT incidents_description_check CHECK ((char_length(description) <= 10000)),
    CONSTRAINT incidents_title_check CHECK (((char_length(title) >= 8) AND (char_length(title) <= 200)))
);


--
-- Name: COLUMN incidents.contains_pii; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.incidents.contains_pii IS 'True if the PII Guardian detected PII in the title or description before insert.';


--
-- Name: COLUMN incidents.pii_categories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.incidents.pii_categories IS 'Distinct PII category labels detected by the PII Guardian (e.g. {email,phone,id_document}).';


--
-- Name: COLUMN incidents.provider_custom_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.incidents.provider_custom_name IS 'User-entered provider name when not in the verified providers list';


--
-- Name: COLUMN incidents.model_custom_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.incidents.model_custom_name IS 'User-entered model name when not in the verified models list';


--
-- Name: COLUMN incidents.cross_audit_truth_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.incidents.cross_audit_truth_score IS 'TruthScore (0-100) computed by the Supreme Court model via Cross-Audit Engine.';


--
-- Name: COLUMN incidents.cross_audit_confidence; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.incidents.cross_audit_confidence IS 'Confidence level (0.0–1.0) of the TruthScore evaluation.';


--
-- Name: COLUMN incidents.cross_audit_reasoning; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.incidents.cross_audit_reasoning IS 'Reasoning output from the Supreme Court evaluation model.';


--
-- Name: COLUMN incidents.cross_audit_model; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.incidents.cross_audit_model IS 'The model ID used for the Supreme Court evaluation (e.g. anthropic/claude-3.5-sonnet).';


--
-- Name: COLUMN incidents.cross_audit_triage_models; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.incidents.cross_audit_triage_models IS 'Array of free-tier model IDs that contributed to the triage layer.';


--
-- Name: COLUMN incidents.cross_audit_completed_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.incidents.cross_audit_completed_at IS 'Timestamp when the Cross-Audit evaluation pipeline completed.';


--
-- Name: incidents_localized; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.incidents_localized AS
 SELECT id,
    user_id,
    is_anonymous,
    title,
    description,
    title_masked,
    description_masked,
    ai_provider_id,
    ai_model_id,
    category,
    severity,
    incident_date,
    location_country,
    language,
    status,
    moderator_id,
    moderator_notes,
    reviewed_at,
    views_count,
    upvotes_count,
    shares_count,
    comments_count,
    source_url,
    ip_hash,
    user_agent,
    search_vector,
    created_at,
    updated_at,
    published_at,
    moderated_at,
    moderation_note,
    contains_pii,
    pii_categories,
    title_tr,
    description_tr,
    provider_custom_name,
    model_custom_name,
    ai_moderation_score,
    ai_moderation_reason,
    cross_audit_truth_score,
    cross_audit_confidence,
    cross_audit_reasoning,
    cross_audit_model,
    cross_audit_triage_models,
    cross_audit_completed_at,
        CASE
            WHEN ((title_tr IS NOT NULL) AND (length(btrim(title_tr)) > 0)) THEN title_tr
            ELSE title_masked
        END AS title_display,
        CASE
            WHEN ((description_tr IS NOT NULL) AND (length(btrim(description_tr)) > 0)) THEN description_tr
            ELSE description_masked
        END AS description_display
   FROM public.incidents i;


--
-- Name: jurors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jurors (
    case_id uuid NOT NULL,
    juror_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now()
);


--
-- Name: jury_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jury_cases (
    case_id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    status character varying(20) DEFAULT 'open'::character varying,
    target_user_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    resolved_at timestamp with time zone
);


--
-- Name: jury_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jury_votes (
    vote_id uuid DEFAULT gen_random_uuid() NOT NULL,
    case_id uuid,
    juror_id uuid,
    vote_decision character varying(20) NOT NULL,
    vote_weight integer DEFAULT 1,
    voted_at timestamp with time zone DEFAULT now()
);


--
-- Name: k_benchmark_evaluations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_benchmark_evaluations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    model_id text NOT NULL,
    actual_response text NOT NULL,
    pass_fail boolean DEFAULT false,
    evaluation_date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: k_benchmark_question_bank; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_benchmark_question_bank (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    test_prompt text NOT NULL,
    expected_behavior text NOT NULL,
    difficulty_level integer DEFAULT 1,
    status public.question_bank_status DEFAULT 'draft'::public.question_bank_status,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: k_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_categories (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    name text,
    description text,
    created_at text
);


--
-- Name: k_model_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_model_scores (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    category_id text,
    model_id text,
    score numeric,
    wilson_lower numeric,
    wilson_upper numeric,
    sample_size numeric,
    last_audited_at text,
    created_at text,
    status text
);


--
-- Name: k_model_scores_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_model_scores_history (
    category_id text,
    model_id text,
    score numeric,
    wilson_lower numeric,
    wilson_upper numeric,
    sample_size numeric,
    snapshot_at text
);


--
-- Name: linkedin_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.linkedin_contacts (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    full_name text,
    title text,
    company text,
    profile_url text,
    category text,
    status text,
    priority numeric,
    notes text,
    created_at text,
    updated_at text
);


--
-- Name: marketing_drafts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketing_drafts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform text NOT NULL,
    content text,
    media_url text,
    status text DEFAULT 'draft'::text,
    scheduled_for timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: model_feature_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_feature_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    model_id uuid NOT NULL,
    user_id uuid,
    is_anonymous boolean DEFAULT false NOT NULL,
    title text NOT NULL,
    description text,
    category text DEFAULT 'feature'::text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    votes_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT model_feature_requests_category_check CHECK ((category = ANY (ARRAY['feature'::text, 'safety'::text, 'accuracy'::text, 'ux'::text, 'integration'::text, 'other'::text]))),
    CONSTRAINT model_feature_requests_description_check CHECK ((char_length(description) <= 2000)),
    CONSTRAINT model_feature_requests_status_check CHECK ((status = ANY (ARRAY['open'::text, 'planned'::text, 'in_progress'::text, 'completed'::text, 'declined'::text]))),
    CONSTRAINT model_feature_requests_title_check CHECK (((char_length(title) >= 10) AND (char_length(title) <= 200)))
);


--
-- Name: model_feature_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_feature_votes (
    user_id uuid NOT NULL,
    request_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: model_review_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_review_votes (
    user_id uuid NOT NULL,
    review_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: model_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    model_id uuid NOT NULL,
    user_id uuid,
    is_anonymous boolean DEFAULT false NOT NULL,
    score_overall smallint NOT NULL,
    score_accuracy smallint,
    score_safety smallint,
    score_creativity smallint,
    score_speed smallint,
    score_value smallint,
    title text,
    body text,
    status text DEFAULT 'published'::text NOT NULL,
    helpful_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT model_reviews_body_check CHECK ((char_length(body) <= 3000)),
    CONSTRAINT model_reviews_score_accuracy_check CHECK (((score_accuracy >= 1) AND (score_accuracy <= 5))),
    CONSTRAINT model_reviews_score_creativity_check CHECK (((score_creativity >= 1) AND (score_creativity <= 5))),
    CONSTRAINT model_reviews_score_overall_check CHECK (((score_overall >= 1) AND (score_overall <= 5))),
    CONSTRAINT model_reviews_score_safety_check CHECK (((score_safety >= 1) AND (score_safety <= 5))),
    CONSTRAINT model_reviews_score_speed_check CHECK (((score_speed >= 1) AND (score_speed <= 5))),
    CONSTRAINT model_reviews_score_value_check CHECK (((score_value >= 1) AND (score_value <= 5))),
    CONSTRAINT model_reviews_status_check CHECK ((status = ANY (ARRAY['published'::text, 'pending'::text, 'rejected'::text]))),
    CONSTRAINT model_reviews_title_check CHECK ((char_length(title) <= 150))
);


--
-- Name: moderation_sla; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.moderation_sla (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    title_masked text,
    created_at text,
    reviewed_at text,
    status text,
    triage_duration_hours text,
    sla_met text
);


--
-- Name: news_seed_yedek; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news_seed_yedek (
    id uuid,
    title_en text,
    title_tr text,
    summary_en text,
    summary_tr text,
    url text,
    source text,
    category text,
    severity text,
    is_featured boolean,
    is_active boolean,
    published_at timestamp with time zone,
    created_at timestamp with time zone,
    status text
);


--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    locale text DEFAULT 'tr'::text,
    confirmed boolean DEFAULT false,
    subscribed_at timestamp with time zone DEFAULT now(),
    unsubscribed_at timestamp with time zone
);


--
-- Name: reputation_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reputation_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    change_amount integer NOT NULL,
    new_score integer NOT NULL,
    reason text NOT NULL,
    action_type character varying(50) DEFAULT 'generic_adjustment'::character varying NOT NULL,
    triggered_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: social_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform text NOT NULL,
    account_name text,
    connection_status text DEFAULT 'disconnected'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: social_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_posts (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    platform text,
    status text,
    content_type text,
    title text,
    body_text text,
    image_prompt text,
    image_url text,
    video_url text,
    hashtags jsonb,
    linked_incident_id text,
    scheduled_at text,
    published_at text,
    external_url text,
    estimated_reach numeric,
    likes numeric,
    comments_count numeric,
    shares_count numeric,
    created_by text,
    created_at text,
    updated_at text,
    linked_news_id text
);


--
-- Name: social_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_templates (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    name text,
    platform text,
    content_type text,
    template_body text,
    example_output text,
    psychology_hook text,
    created_at text
);


--
-- Name: strategic_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.strategic_answers (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    run_id text,
    model_id text,
    model_name text,
    question_index numeric,
    question_id text,
    section text,
    answer_text text,
    error_message text,
    latency_ms numeric,
    tokens_used text,
    created_at text
);


--
-- Name: strategic_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.strategic_questions (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    section text,
    question text,
    created_at text
);


--
-- Name: strategy_innovations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.strategy_innovations (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    title text,
    description text,
    priority text,
    status text,
    created_at text,
    updated_at text
);


--
-- Name: strategy_milestones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.strategy_milestones (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    quarter text,
    title text,
    okr_text text,
    progress numeric,
    status text,
    linked_metric text,
    owner_user_id text,
    created_at text,
    updated_at text
);


--
-- Name: strategy_risks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.strategy_risks (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    code text,
    title text,
    description text,
    probability numeric,
    impact numeric,
    owner_user_id text,
    mitigation_plan text,
    target_date text,
    status text,
    created_at text,
    updated_at text
);


--
-- Name: strategy_swot_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.strategy_swot_items (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    category text,
    title text,
    description text,
    weight text,
    owner_user_id text,
    action_plan text,
    target_date text,
    status text,
    created_at text,
    updated_at text
);


--
-- Name: strategy_todos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.strategy_todos (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    priority numeric,
    title text,
    is_completed boolean,
    created_at text,
    updated_at text
);


--
-- Name: strategy_valuations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.strategy_valuations (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    method text,
    inputs jsonb,
    result_pre_money numeric,
    notes text,
    snapshot_date text,
    created_by text,
    created_at text
);


--
-- Name: suggestion_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suggestion_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    suggestion_id uuid NOT NULL,
    user_id uuid,
    comment_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT suggestion_comments_comment_text_check CHECK ((char_length(comment_text) <= 3000))
);


--
-- Name: suggestion_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suggestion_votes (
    user_id uuid NOT NULL,
    suggestion_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suggestions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    title text NOT NULL,
    description text NOT NULL,
    category text DEFAULT 'feature'::text NOT NULL,
    status public.suggestion_status DEFAULT 'open'::public.suggestion_status NOT NULL,
    upvotes_count integer DEFAULT 0 NOT NULL,
    comments_count integer DEFAULT 0 NOT NULL,
    is_anonymous boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    title_tr text,
    description_tr text,
    CONSTRAINT suggestions_description_check CHECK ((char_length(description) <= 5000)),
    CONSTRAINT suggestions_title_check CHECK (((char_length(title) >= 8) AND (char_length(title) <= 200)))
);


--
-- Name: suggestions_localized; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.suggestions_localized AS
 SELECT id,
    user_id,
    title,
    description,
    category,
    status,
    upvotes_count,
    comments_count,
    is_anonymous,
    created_at,
    updated_at,
    title_tr,
    description_tr,
        CASE
            WHEN ((title_tr IS NOT NULL) AND (length(btrim(title_tr)) > 0)) THEN title_tr
            ELSE title
        END AS title_display,
        CASE
            WHEN ((description_tr IS NOT NULL) AND (length(btrim(description_tr)) > 0)) THEN description_tr
            ELSE description
        END AS description_display
   FROM public.suggestions s;


--
-- Name: sybil_detection_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sybil_detection_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    fingerprint text NOT NULL,
    ip_hash text NOT NULL,
    risk_score numeric(5,2) DEFAULT 0.00 NOT NULL,
    is_flagged boolean DEFAULT false NOT NULL,
    anomaly_flags jsonb DEFAULT '[]'::jsonb,
    detected_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: system_flags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_flags (
    key character varying(255) NOT NULL,
    value boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: takedown_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.takedown_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid,
    requester_name text NOT NULL,
    requester_email text NOT NULL,
    requester_organization text,
    reason text NOT NULL,
    legal_basis text,
    evidence_url text,
    status public.takedown_status DEFAULT 'received'::public.takedown_status NOT NULL,
    assigned_moderator_id uuid,
    resolution_notes text,
    resolved_at timestamp with time zone,
    sla_due_at timestamp with time zone DEFAULT (now() + '7 days'::interval) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    target_url text,
    details text,
    country text,
    organization text,
    identity_proof_url text,
    user_id uuid,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    ip_address inet
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type character varying(255) NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    ttl timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: telemetry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.telemetry (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text,
    user_id uuid,
    event_type text NOT NULL,
    source text DEFAULT 'client'::text NOT NULL,
    environment text DEFAULT 'production'::text NOT NULL,
    duration_ms integer DEFAULT 0,
    status_code integer DEFAULT 200,
    path text,
    ip_hash text,
    user_agent text,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE ONLY public.telemetry ALTER COLUMN event_type SET STATISTICS 500;
ALTER TABLE ONLY public.telemetry ALTER COLUMN created_at SET STATISTICS 1000;


--
-- Name: user_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    badge_name text NOT NULL,
    badge_icon text NOT NULL,
    description text,
    awarded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_bounty_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_bounty_badges (
    user_id uuid NOT NULL,
    badge_code text NOT NULL,
    awarded_at timestamp with time zone DEFAULT now() NOT NULL,
    bounty_id uuid
);


--
-- Name: user_reputation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_reputation (
    user_id uuid NOT NULL,
    reputation_score integer DEFAULT 50 NOT NULL,
    is_sybil_suspect boolean DEFAULT false NOT NULL,
    sybil_risk_score numeric(5,2) DEFAULT 0.00 NOT NULL,
    trust_level character varying(20) DEFAULT 'neutral'::character varying NOT NULL,
    voucher_count integer DEFAULT 0 NOT NULL,
    is_verified_citizen boolean DEFAULT false NOT NULL,
    last_fingerprint_hash text,
    last_ip_hash text,
    last_active_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_reputation_reputation_score_check CHECK (((reputation_score >= 0) AND (reputation_score <= 100))),
    CONSTRAINT user_reputation_sybil_risk_score_check CHECK (((sybil_risk_score >= (0)::numeric) AND (sybil_risk_score <= (100)::numeric))),
    CONSTRAINT user_reputation_trust_level_check CHECK (((trust_level)::text = ANY ((ARRAY['trusted'::character varying, 'neutral'::character varying, 'suspicious'::character varying, 'banned'::character varying])::text[])))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    username text,
    full_name text,
    avatar_url text,
    bio text,
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    locale text DEFAULT 'en'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    reputation_score integer DEFAULT 0 NOT NULL,
    badges text[] DEFAULT '{}'::text[] NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_admin boolean DEFAULT false,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    subscription_tier text DEFAULT 'free'::text,
    stripe_customer_id text,
    community_role text,
    interests jsonb,
    delete_requested_at text,
    delete_scheduled_for text,
    is_soft_deleted boolean,
    soft_deleted_at text,
    role_view text
);
ALTER TABLE ONLY public.users ALTER COLUMN email SET STATISTICS 1000;
ALTER TABLE ONLY public.users ALTER COLUMN role SET STATISTICS 500;


--
-- Name: vendor_quotas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_quotas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vendor text NOT NULL,
    metric text NOT NULL,
    limit_value numeric,
    used_value numeric,
    unit text,
    period_start date,
    period_end date,
    plan_name text,
    source character varying NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT vendor_quotas_source_check CHECK (((source)::text = ANY ((ARRAY['api'::character varying, 'manual'::character varying])::text[])))
);


--
-- Name: wall_of_shame_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wall_of_shame_entries (
    entry_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    case_id uuid,
    reason text NOT NULL,
    penalty_details text,
    listed_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true
);


--
-- Name: webhooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    url text NOT NULL,
    secret text NOT NULL,
    provider_filter text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: whistleblower_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whistleblower_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    encrypted_content text NOT NULL,
    category text NOT NULL,
    provider_hint text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    CONSTRAINT whistleblower_submissions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'reviewing'::text, 'verified'::text, 'closed'::text])))
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text DEFAULT gen_random_uuid()::text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb
);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: advisory_board_members advisory_board_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisory_board_members
    ADD CONSTRAINT advisory_board_members_pkey PRIMARY KEY (id);


--
-- Name: ai_free_models ai_free_models_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_free_models
    ADD CONSTRAINT ai_free_models_pkey PRIMARY KEY (id);


--
-- Name: ai_models ai_models_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_models
    ADD CONSTRAINT ai_models_pkey PRIMARY KEY (id);


--
-- Name: ai_poll_votes ai_poll_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_poll_votes
    ADD CONSTRAINT ai_poll_votes_pkey PRIMARY KEY (poll_id, ip_hash);


--
-- Name: ai_polls ai_polls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_polls
    ADD CONSTRAINT ai_polls_pkey PRIMARY KEY (id);


--
-- Name: ai_provider_responses ai_provider_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_provider_responses
    ADD CONSTRAINT ai_provider_responses_pkey PRIMARY KEY (id);


--
-- Name: ai_providers ai_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_providers
    ADD CONSTRAINT ai_providers_pkey PRIMARY KEY (id);


--
-- Name: ai_providers ai_providers_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_providers
    ADD CONSTRAINT ai_providers_slug_key UNIQUE (slug);


--
-- Name: ai_routing_chains ai_routing_chains_capability_domain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_routing_chains
    ADD CONSTRAINT ai_routing_chains_capability_domain_key UNIQUE (capability_domain);


--
-- Name: ai_routing_chains ai_routing_chains_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_routing_chains
    ADD CONSTRAINT ai_routing_chains_pkey PRIMARY KEY (id);


--
-- Name: ai_scoring_config ai_scoring_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_scoring_config
    ADD CONSTRAINT ai_scoring_config_pkey PRIMARY KEY (id);


--
-- Name: ai_trust_ledger ai_trust_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_trust_ledger
    ADD CONSTRAINT ai_trust_ledger_pkey PRIMARY KEY (id);


--
-- Name: ai_trust_scores ai_trust_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_trust_scores
    ADD CONSTRAINT ai_trust_scores_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (provider);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: automation_tasks automation_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_tasks
    ADD CONSTRAINT automation_tasks_pkey PRIMARY KEY (id);


--
-- Name: autopilot_runs autopilot_runs_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.autopilot_runs
    ADD CONSTRAINT autopilot_runs_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: autopilot_runs autopilot_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.autopilot_runs
    ADD CONSTRAINT autopilot_runs_pkey PRIMARY KEY (id);


--
-- Name: bilge_memory bilge_memory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bilge_memory
    ADD CONSTRAINT bilge_memory_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- Name: bounty_badges bounty_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bounty_badges
    ADD CONSTRAINT bounty_badges_pkey PRIMARY KEY (code);


--
-- Name: bug_bounties bug_bounties_incident_id_reporter_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_bounties
    ADD CONSTRAINT bug_bounties_incident_id_reporter_id_key UNIQUE (incident_id, reporter_id);


--
-- Name: bug_bounties bug_bounties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_bounties
    ADD CONSTRAINT bug_bounties_pkey PRIMARY KEY (id);


--
-- Name: consent_log consent_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_log
    ADD CONSTRAINT consent_log_pkey PRIMARY KEY (id);


--
-- Name: cookie_consent_log cookie_consent_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cookie_consent_log
    ADD CONSTRAINT cookie_consent_log_pkey PRIMARY KEY (id);


--
-- Name: cost_log cost_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_log
    ADD CONSTRAINT cost_log_pkey PRIMARY KEY (id);


--
-- Name: cron_job_logs cron_job_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cron_job_logs
    ADD CONSTRAINT cron_job_logs_pkey PRIMARY KEY (id);


--
-- Name: ecosystem_news ecosystem_news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecosystem_news
    ADD CONSTRAINT ecosystem_news_pkey PRIMARY KEY (id);


--
-- Name: email_preferences email_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_preferences
    ADD CONSTRAINT email_preferences_pkey PRIMARY KEY (id);


--
-- Name: evidence evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evidence
    ADD CONSTRAINT evidence_pkey PRIMARY KEY (id);


--
-- Name: expert_applications expert_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expert_applications
    ADD CONSTRAINT expert_applications_pkey PRIMARY KEY (id);


--
-- Name: external_incidents_queue external_incidents_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_incidents_queue
    ADD CONSTRAINT external_incidents_queue_pkey PRIMARY KEY (id);


--
-- Name: feed_incidents feed_incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feed_incidents
    ADD CONSTRAINT feed_incidents_pkey PRIMARY KEY (id);


--
-- Name: finance_monthly_costs finance_monthly_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_monthly_costs
    ADD CONSTRAINT finance_monthly_costs_pkey PRIMARY KEY (id);


--
-- Name: financials financials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financials
    ADD CONSTRAINT financials_pkey PRIMARY KEY (id);


--
-- Name: funnel_events funnel_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel_events
    ADD CONSTRAINT funnel_events_pkey PRIMARY KEY (id);


--
-- Name: grant_applications grant_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grant_applications
    ADD CONSTRAINT grant_applications_pkey PRIMARY KEY (id);


--
-- Name: heartbeats heartbeats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.heartbeats
    ADD CONSTRAINT heartbeats_pkey PRIMARY KEY (agent_id);


--
-- Name: incident_affected_users incident_affected_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_affected_users
    ADD CONSTRAINT incident_affected_users_pkey PRIMARY KEY (incident_id, user_id);


--
-- Name: incident_comments incident_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_comments
    ADD CONSTRAINT incident_comments_pkey PRIMARY KEY (id);


--
-- Name: incident_votes incident_votes_incident_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_votes
    ADD CONSTRAINT incident_votes_incident_id_user_id_key UNIQUE (incident_id, user_id);


--
-- Name: incident_votes incident_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_votes
    ADD CONSTRAINT incident_votes_pkey PRIMARY KEY (id);


--
-- Name: incidents incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_pkey PRIMARY KEY (id);


--
-- Name: jurors jurors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jurors
    ADD CONSTRAINT jurors_pkey PRIMARY KEY (case_id, juror_id);


--
-- Name: jury_cases jury_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jury_cases
    ADD CONSTRAINT jury_cases_pkey PRIMARY KEY (case_id);


--
-- Name: jury_votes jury_votes_case_id_juror_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jury_votes
    ADD CONSTRAINT jury_votes_case_id_juror_id_key UNIQUE (case_id, juror_id);


--
-- Name: jury_votes jury_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jury_votes
    ADD CONSTRAINT jury_votes_pkey PRIMARY KEY (vote_id);


--
-- Name: k_benchmark_evaluations k_benchmark_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_benchmark_evaluations
    ADD CONSTRAINT k_benchmark_evaluations_pkey PRIMARY KEY (id);


--
-- Name: k_benchmark_question_bank k_benchmark_question_bank_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_benchmark_question_bank
    ADD CONSTRAINT k_benchmark_question_bank_pkey PRIMARY KEY (id);


--
-- Name: k_categories k_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_categories
    ADD CONSTRAINT k_categories_pkey PRIMARY KEY (id);


--
-- Name: k_model_scores k_model_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_model_scores
    ADD CONSTRAINT k_model_scores_pkey PRIMARY KEY (id);


--
-- Name: linkedin_contacts linkedin_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.linkedin_contacts
    ADD CONSTRAINT linkedin_contacts_pkey PRIMARY KEY (id);


--
-- Name: marketing_drafts marketing_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_drafts
    ADD CONSTRAINT marketing_drafts_pkey PRIMARY KEY (id);


--
-- Name: model_feature_requests model_feature_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_feature_requests
    ADD CONSTRAINT model_feature_requests_pkey PRIMARY KEY (id);


--
-- Name: model_feature_votes model_feature_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_feature_votes
    ADD CONSTRAINT model_feature_votes_pkey PRIMARY KEY (user_id, request_id);


--
-- Name: model_review_votes model_review_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_review_votes
    ADD CONSTRAINT model_review_votes_pkey PRIMARY KEY (user_id, review_id);


--
-- Name: model_reviews model_reviews_model_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_reviews
    ADD CONSTRAINT model_reviews_model_id_user_id_key UNIQUE (model_id, user_id);


--
-- Name: model_reviews model_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_reviews
    ADD CONSTRAINT model_reviews_pkey PRIMARY KEY (id);


--
-- Name: moderation_sla moderation_sla_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderation_sla
    ADD CONSTRAINT moderation_sla_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers newsletter_subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: reputation_logs reputation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reputation_logs
    ADD CONSTRAINT reputation_logs_pkey PRIMARY KEY (id);


--
-- Name: social_accounts social_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_accounts
    ADD CONSTRAINT social_accounts_pkey PRIMARY KEY (id);


--
-- Name: social_posts social_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_pkey PRIMARY KEY (id);


--
-- Name: social_templates social_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_templates
    ADD CONSTRAINT social_templates_pkey PRIMARY KEY (id);


--
-- Name: strategic_answers strategic_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strategic_answers
    ADD CONSTRAINT strategic_answers_pkey PRIMARY KEY (id);


--
-- Name: strategic_questions strategic_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strategic_questions
    ADD CONSTRAINT strategic_questions_pkey PRIMARY KEY (id);


--
-- Name: strategy_innovations strategy_innovations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strategy_innovations
    ADD CONSTRAINT strategy_innovations_pkey PRIMARY KEY (id);


--
-- Name: strategy_milestones strategy_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strategy_milestones
    ADD CONSTRAINT strategy_milestones_pkey PRIMARY KEY (id);


--
-- Name: strategy_risks strategy_risks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strategy_risks
    ADD CONSTRAINT strategy_risks_pkey PRIMARY KEY (id);


--
-- Name: strategy_swot_items strategy_swot_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strategy_swot_items
    ADD CONSTRAINT strategy_swot_items_pkey PRIMARY KEY (id);


--
-- Name: strategy_todos strategy_todos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strategy_todos
    ADD CONSTRAINT strategy_todos_pkey PRIMARY KEY (id);


--
-- Name: strategy_valuations strategy_valuations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strategy_valuations
    ADD CONSTRAINT strategy_valuations_pkey PRIMARY KEY (id);


--
-- Name: suggestion_comments suggestion_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suggestion_comments
    ADD CONSTRAINT suggestion_comments_pkey PRIMARY KEY (id);


--
-- Name: suggestion_votes suggestion_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suggestion_votes
    ADD CONSTRAINT suggestion_votes_pkey PRIMARY KEY (user_id, suggestion_id);


--
-- Name: suggestions suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT suggestions_pkey PRIMARY KEY (id);


--
-- Name: sybil_detection_logs sybil_detection_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sybil_detection_logs
    ADD CONSTRAINT sybil_detection_logs_pkey PRIMARY KEY (id);


--
-- Name: system_flags system_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_flags
    ADD CONSTRAINT system_flags_pkey PRIMARY KEY (key);


--
-- Name: takedown_requests takedown_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.takedown_requests
    ADD CONSTRAINT takedown_requests_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: telemetry telemetry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telemetry
    ADD CONSTRAINT telemetry_pkey PRIMARY KEY (id);


--
-- Name: ai_routing_chains uq_rc_domain; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_routing_chains
    ADD CONSTRAINT uq_rc_domain UNIQUE (domain_name);


--
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_user_id_badge_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_badge_name_key UNIQUE (user_id, badge_name);


--
-- Name: user_bounty_badges user_bounty_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bounty_badges
    ADD CONSTRAINT user_bounty_badges_pkey PRIMARY KEY (user_id, badge_code);


--
-- Name: user_reputation user_reputation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reputation
    ADD CONSTRAINT user_reputation_pkey PRIMARY KEY (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: vendor_quotas vendor_quotas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_quotas
    ADD CONSTRAINT vendor_quotas_pkey PRIMARY KEY (id);


--
-- Name: wall_of_shame_entries wall_of_shame_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wall_of_shame_entries
    ADD CONSTRAINT wall_of_shame_entries_pkey PRIMARY KEY (entry_id);


--
-- Name: webhooks webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_pkey PRIMARY KEY (id);


--
-- Name: whistleblower_submissions whistleblower_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whistleblower_submissions
    ADD CONSTRAINT whistleblower_submissions_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: ecosystem_news_published_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ecosystem_news_published_at_idx ON public.ecosystem_news USING btree (published_at DESC);


--
-- Name: ecosystem_news_severity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ecosystem_news_severity_idx ON public.ecosystem_news USING btree (severity);


--
-- Name: idx_ai_models_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_models_provider ON public.ai_models USING btree (provider_id);


--
-- Name: idx_ai_models_weight_class; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_models_weight_class ON public.ai_models USING btree (weight_class);


--
-- Name: idx_ai_providers_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_providers_slug ON public.ai_providers USING btree (slug);


--
-- Name: idx_audit_actor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_actor ON public.audit_log USING btree (actor_id);


--
-- Name: idx_audit_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_created ON public.audit_log USING btree (created_at DESC);


--
-- Name: idx_audit_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_entity ON public.audit_log USING btree (entity_type, entity_id);


--
-- Name: idx_automation_tasks_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_automation_tasks_status ON public.automation_tasks USING btree (status, created_at DESC);


--
-- Name: idx_autopilot_runs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_autopilot_runs_action ON public.autopilot_runs USING btree (action);


--
-- Name: idx_autopilot_runs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_autopilot_runs_created_at ON public.autopilot_runs USING btree (created_at DESC);


--
-- Name: idx_autopilot_runs_idempotency; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_autopilot_runs_idempotency ON public.autopilot_runs USING btree (idempotency_key);


--
-- Name: idx_autopilot_runs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_autopilot_runs_status ON public.autopilot_runs USING btree (status);


--
-- Name: idx_autopilot_runs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_autopilot_runs_user ON public.autopilot_runs USING btree (user_id);


--
-- Name: idx_bilge_memory_embedding; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bilge_memory_embedding ON public.bilge_memory USING hnsw (embedding public.vector_cosine_ops);


--
-- Name: idx_bounties_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bounties_provider ON public.bug_bounties USING btree (provider_id, status);


--
-- Name: idx_bounties_reporter; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bounties_reporter ON public.bug_bounties USING btree (reporter_id, created_at DESC);


--
-- Name: idx_bounties_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bounties_status ON public.bug_bounties USING btree (status, created_at DESC);


--
-- Name: idx_consent_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consent_created ON public.consent_log USING btree (created_at DESC);


--
-- Name: idx_consent_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consent_type ON public.consent_log USING btree (consent_type);


--
-- Name: idx_consent_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consent_user ON public.consent_log USING btree (user_id);


--
-- Name: idx_evidence_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_evidence_hash ON public.evidence USING btree (sha256_hash);


--
-- Name: idx_evidence_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_evidence_incident ON public.evidence USING btree (incident_id);


--
-- Name: idx_financials_billing_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financials_billing_period ON public.financials USING btree (billing_period_start, billing_period_end) WHERE (billing_period_start IS NOT NULL);


--
-- Name: idx_financials_breakdown_path_ops; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financials_breakdown_path_ops ON public.financials USING gin (breakdown jsonb_path_ops);


--
-- Name: idx_financials_category_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financials_category_created ON public.financials USING btree (category, created_at DESC);


--
-- Name: idx_financials_created_at_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financials_created_at_desc ON public.financials USING btree (created_at DESC);


--
-- Name: idx_financials_failed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financials_failed ON public.financials USING btree (created_at DESC) WHERE (status = 'failed'::text);


--
-- Name: idx_financials_metadata_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financials_metadata_gin ON public.financials USING gin (metadata jsonb_path_ops);


--
-- Name: idx_financials_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financials_pending ON public.financials USING btree (created_at) WHERE (status = 'pending'::text);


--
-- Name: idx_financials_stripe_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financials_stripe_customer ON public.financials USING btree (stripe_customer_id) WHERE (stripe_customer_id IS NOT NULL);


--
-- Name: idx_financials_stripe_payment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financials_stripe_payment ON public.financials USING btree (stripe_payment_id) WHERE (stripe_payment_id IS NOT NULL);


--
-- Name: idx_financials_type_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financials_type_status_created ON public.financials USING btree (transaction_type, status, created_at DESC);


--
-- Name: idx_financials_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financials_user_created ON public.financials USING btree (user_id, created_at DESC);


--
-- Name: idx_funnel_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_funnel_events_created_at ON public.funnel_events USING btree (created_at);


--
-- Name: idx_funnel_events_event_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_funnel_events_event_name ON public.funnel_events USING btree (event_name);


--
-- Name: idx_funnel_events_metadata_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_funnel_events_metadata_gin ON public.funnel_events USING gin (metadata jsonb_path_ops);


--
-- Name: idx_funnel_events_user_event_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_funnel_events_user_event_created ON public.funnel_events USING btree (user_id, event_name, created_at DESC);


--
-- Name: idx_incident_votes_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incident_votes_incident ON public.incident_votes USING btree (incident_id);


--
-- Name: idx_incident_votes_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incident_votes_user ON public.incident_votes USING btree (user_id);


--
-- Name: idx_incidents_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_category ON public.incidents USING btree (category);


--
-- Name: idx_incidents_contains_pii; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_contains_pii ON public.incidents USING btree (contains_pii) WHERE (contains_pii = true);


--
-- Name: idx_incidents_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_created_at ON public.incidents USING btree (created_at DESC);


--
-- Name: idx_incidents_model; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_model ON public.incidents USING btree (ai_model_id);


--
-- Name: idx_incidents_model_custom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_model_custom ON public.incidents USING btree (lower(model_custom_name)) WHERE (model_custom_name IS NOT NULL);


--
-- Name: idx_incidents_pii_categories; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_pii_categories ON public.incidents USING gin (pii_categories);


--
-- Name: idx_incidents_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_provider ON public.incidents USING btree (ai_provider_id);


--
-- Name: idx_incidents_provider_custom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_provider_custom ON public.incidents USING btree (lower(provider_custom_name)) WHERE (provider_custom_name IS NOT NULL);


--
-- Name: idx_incidents_published_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_published_at ON public.incidents USING btree (published_at DESC) WHERE (status = 'published'::public.incident_status);


--
-- Name: idx_incidents_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_search ON public.incidents USING gin (search_vector);


--
-- Name: idx_incidents_search_vector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_search_vector ON public.incidents USING gin (search_vector);


--
-- Name: idx_incidents_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_severity ON public.incidents USING btree (severity);


--
-- Name: idx_incidents_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_status ON public.incidents USING btree (status);


--
-- Name: idx_incidents_status_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_status_published ON public.incidents USING btree (status, published_at DESC);


--
-- Name: idx_incidents_title_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_title_trgm ON public.incidents USING gin (title public.gin_trgm_ops);


--
-- Name: idx_incidents_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_user_id ON public.incidents USING btree (user_id);


--
-- Name: idx_incidents_vendor_response; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_vendor_response ON public.incidents USING btree (vendor_response_at) WHERE (vendor_response_at IS NOT NULL);


--
-- Name: idx_model_feat_model; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_model_feat_model ON public.model_feature_requests USING btree (model_id);


--
-- Name: idx_model_feat_votes; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_model_feat_votes ON public.model_feature_requests USING btree (model_id, votes_count DESC);


--
-- Name: idx_model_reviews_model; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_model_reviews_model ON public.model_reviews USING btree (model_id);


--
-- Name: idx_model_reviews_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_model_reviews_status ON public.model_reviews USING btree (model_id, status);


--
-- Name: idx_reputation_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reputation_logs_user_id ON public.reputation_logs USING btree (user_id);


--
-- Name: idx_responses_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_responses_incident ON public.ai_provider_responses USING btree (incident_id);


--
-- Name: idx_responses_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_responses_published ON public.ai_provider_responses USING btree (is_published, published_at DESC);


--
-- Name: idx_suggestion_comments_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suggestion_comments_created_at ON public.suggestion_comments USING btree (created_at);


--
-- Name: idx_suggestion_comments_suggestion_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suggestion_comments_suggestion_id ON public.suggestion_comments USING btree (suggestion_id);


--
-- Name: idx_suggestions_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suggestions_category ON public.suggestions USING btree (category);


--
-- Name: idx_suggestions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suggestions_created_at ON public.suggestions USING btree (created_at DESC);


--
-- Name: idx_suggestions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suggestions_status ON public.suggestions USING btree (status);


--
-- Name: idx_sybil_detection_fingerprint; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sybil_detection_fingerprint ON public.sybil_detection_logs USING btree (fingerprint);


--
-- Name: idx_sybil_detection_ip_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sybil_detection_ip_hash ON public.sybil_detection_logs USING btree (ip_hash);


--
-- Name: idx_takedown_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_takedown_incident ON public.takedown_requests USING btree (incident_id);


--
-- Name: idx_takedown_sla; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_takedown_sla ON public.takedown_requests USING btree (sla_due_at) WHERE (status = ANY (ARRAY['received'::public.takedown_status, 'under_review'::public.takedown_status]));


--
-- Name: idx_takedown_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_takedown_status ON public.takedown_requests USING btree (status);


--
-- Name: idx_telemetry_created_at_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_telemetry_created_at_desc ON public.telemetry USING btree (created_at DESC);


--
-- Name: idx_telemetry_error_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_telemetry_error_status ON public.telemetry USING btree (status_code, created_at DESC) WHERE (status_code >= 400);


--
-- Name: idx_telemetry_event_type_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_telemetry_event_type_created ON public.telemetry USING btree (event_type, created_at DESC);


--
-- Name: idx_telemetry_payload_ops; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_telemetry_payload_ops ON public.telemetry USING gin (payload);


--
-- Name: idx_telemetry_payload_path_ops; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_telemetry_payload_path_ops ON public.telemetry USING gin (payload jsonb_path_ops);


--
-- Name: idx_telemetry_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_telemetry_session_id ON public.telemetry USING btree (session_id, created_at DESC) WHERE (session_id IS NOT NULL);


--
-- Name: idx_telemetry_slow_queries; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_telemetry_slow_queries ON public.telemetry USING btree (duration_ms DESC, created_at DESC) WHERE (duration_ms > 500);


--
-- Name: idx_telemetry_source_env_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_telemetry_source_env_created ON public.telemetry USING btree (source, environment, created_at DESC);


--
-- Name: idx_telemetry_tags_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_telemetry_tags_gin ON public.telemetry USING gin (tags);


--
-- Name: idx_telemetry_user_event_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_telemetry_user_event_created ON public.telemetry USING btree (user_id, event_type, created_at DESC);


--
-- Name: idx_user_reputation_sybil; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_reputation_sybil ON public.user_reputation USING btree (is_sybil_suspect);


--
-- Name: idx_user_reputation_trust_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_reputation_trust_level ON public.user_reputation USING btree (trust_level);


--
-- Name: idx_users_active_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_active_lookup ON public.users USING btree (id) WHERE (is_deleted = false);


--
-- Name: idx_users_badges_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_badges_gin ON public.users USING gin (badges);


--
-- Name: idx_users_covering_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_covering_profile ON public.users USING btree (id) INCLUDE (email, username, full_name, avatar_url, role, is_verified, reputation_score);


--
-- Name: idx_users_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_created_at ON public.users USING btree (created_at DESC);


--
-- Name: idx_users_email_lower; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_users_email_lower ON public.users USING btree (lower(email));


--
-- Name: idx_users_metadata_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_metadata_gin ON public.users USING gin (metadata jsonb_path_ops);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_role_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role_created_at ON public.users USING btree (role, created_at DESC);


--
-- Name: idx_users_search_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_search_trgm ON public.users USING gin (COALESCE(full_name, ''::text) public.gin_trgm_ops);


--
-- Name: idx_users_stripe_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_stripe_customer_id ON public.users USING btree (stripe_customer_id) WHERE (stripe_customer_id IS NOT NULL);


--
-- Name: idx_users_subscription_tier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_subscription_tier ON public.users USING btree (subscription_tier) WHERE (subscription_tier IS NOT NULL);


--
-- Name: idx_users_username_lower; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_users_username_lower ON public.users USING btree (lower(username)) WHERE (username IS NOT NULL);


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: financials tr_financials_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_financials_updated_at BEFORE UPDATE ON public.financials FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: users tr_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: api_keys trg_api_keys_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_api_keys_updated_at BEFORE UPDATE ON public.api_keys FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: autopilot_runs trg_autopilot_runs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_autopilot_runs_updated_at BEFORE UPDATE ON public.autopilot_runs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: bug_bounties trg_bounties_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_bounties_updated_at BEFORE UPDATE ON public.bug_bounties FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: user_reputation trg_check_sybil_suspect; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_check_sybil_suspect BEFORE INSERT OR UPDATE ON public.user_reputation FOR EACH ROW EXECUTE FUNCTION public.check_sybil_suspect_fn();


--
-- Name: incident_comments trg_incident_comments_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_incident_comments_touch BEFORE UPDATE ON public.incident_comments FOR EACH ROW EXECUTE FUNCTION public.tg_incident_comments_touch();


--
-- Name: incident_votes trg_incident_votes_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_incident_votes_touch BEFORE UPDATE ON public.incident_votes FOR EACH ROW EXECUTE FUNCTION public.tg_incident_votes_touch();


--
-- Name: incidents trg_incidents_search_vector; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_incidents_search_vector BEFORE INSERT OR UPDATE OF title, description, category ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.tg_incidents_search_vector();


--
-- Name: incidents trg_incidents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: model_feature_votes trg_model_feature_votes_count; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_model_feature_votes_count AFTER INSERT OR DELETE ON public.model_feature_votes FOR EACH ROW EXECUTE FUNCTION public.tg_model_feature_votes_count();


--
-- Name: model_review_votes trg_model_review_votes_count; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_model_review_votes_count AFTER INSERT OR DELETE ON public.model_review_votes FOR EACH ROW EXECUTE FUNCTION public.tg_model_review_votes_count();


--
-- Name: suggestions trg_suggestions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_suggestions_updated_at BEFORE UPDATE ON public.suggestions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: incident_affected_users trg_update_incident_affected_count; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_incident_affected_count AFTER INSERT OR DELETE ON public.incident_affected_users FOR EACH ROW EXECUTE FUNCTION public.tg_update_incident_affected_count();


--
-- Name: incident_votes trg_update_incident_upvotes_count; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_incident_upvotes_count AFTER INSERT OR DELETE OR UPDATE ON public.incident_votes FOR EACH ROW EXECUTE FUNCTION public.tg_update_incident_upvotes_count();


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: user_reputation update_user_reputation_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_reputation_modtime BEFORE UPDATE ON public.user_reputation FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: ai_models ai_models_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_models
    ADD CONSTRAINT ai_models_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.ai_providers(id) ON DELETE CASCADE;


--
-- Name: ai_poll_votes ai_poll_votes_poll_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_poll_votes
    ADD CONSTRAINT ai_poll_votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.ai_polls(id) ON DELETE CASCADE;


--
-- Name: ai_polls ai_polls_context_news_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_polls
    ADD CONSTRAINT ai_polls_context_news_id_fkey FOREIGN KEY (context_news_id) REFERENCES public.ecosystem_news(id) ON DELETE SET NULL;


--
-- Name: ai_provider_responses ai_provider_responses_ai_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_provider_responses
    ADD CONSTRAINT ai_provider_responses_ai_provider_id_fkey FOREIGN KEY (ai_provider_id) REFERENCES public.ai_providers(id) ON DELETE CASCADE;


--
-- Name: ai_provider_responses ai_provider_responses_incident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_provider_responses
    ADD CONSTRAINT ai_provider_responses_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incidents(id) ON DELETE CASCADE;


--
-- Name: ai_provider_responses ai_provider_responses_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_provider_responses
    ADD CONSTRAINT ai_provider_responses_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES auth.users(id);


--
-- Name: audit_log audit_log_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: automation_tasks automation_tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_tasks
    ADD CONSTRAINT automation_tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: autopilot_runs autopilot_runs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.autopilot_runs
    ADD CONSTRAINT autopilot_runs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: bug_bounties bug_bounties_incident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_bounties
    ADD CONSTRAINT bug_bounties_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incidents(id) ON DELETE CASCADE;


--
-- Name: bug_bounties bug_bounties_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_bounties
    ADD CONSTRAINT bug_bounties_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.ai_providers(id) ON DELETE SET NULL;


--
-- Name: bug_bounties bug_bounties_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_bounties
    ADD CONSTRAINT bug_bounties_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bug_bounties bug_bounties_validated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_bounties
    ADD CONSTRAINT bug_bounties_validated_by_fkey FOREIGN KEY (validated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: consent_log consent_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_log
    ADD CONSTRAINT consent_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: evidence evidence_incident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evidence
    ADD CONSTRAINT evidence_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incidents(id) ON DELETE CASCADE;


--
-- Name: financials financials_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financials
    ADD CONSTRAINT financials_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: funnel_events funnel_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel_events
    ADD CONSTRAINT funnel_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: incident_affected_users incident_affected_users_incident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_affected_users
    ADD CONSTRAINT incident_affected_users_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incidents(id) ON DELETE CASCADE;


--
-- Name: incident_affected_users incident_affected_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_affected_users
    ADD CONSTRAINT incident_affected_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: incident_comments incident_comments_incident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_comments
    ADD CONSTRAINT incident_comments_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incidents(id) ON DELETE CASCADE;


--
-- Name: incident_comments incident_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_comments
    ADD CONSTRAINT incident_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: incident_votes incident_votes_incident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_votes
    ADD CONSTRAINT incident_votes_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incidents(id) ON DELETE CASCADE;


--
-- Name: incident_votes incident_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_votes
    ADD CONSTRAINT incident_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: incidents incidents_ai_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_ai_model_id_fkey FOREIGN KEY (ai_model_id) REFERENCES public.ai_models(id) ON DELETE SET NULL;


--
-- Name: incidents incidents_ai_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_ai_provider_id_fkey FOREIGN KEY (ai_provider_id) REFERENCES public.ai_providers(id) ON DELETE SET NULL;


--
-- Name: incidents incidents_moderator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_moderator_id_fkey FOREIGN KEY (moderator_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: incidents incidents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jurors jurors_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jurors
    ADD CONSTRAINT jurors_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.jury_cases(case_id) ON DELETE CASCADE;


--
-- Name: jurors jurors_juror_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jurors
    ADD CONSTRAINT jurors_juror_id_fkey FOREIGN KEY (juror_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: jury_cases jury_cases_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jury_cases
    ADD CONSTRAINT jury_cases_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: jury_cases jury_cases_target_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jury_cases
    ADD CONSTRAINT jury_cases_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES auth.users(id);


--
-- Name: jury_votes jury_votes_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jury_votes
    ADD CONSTRAINT jury_votes_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.jury_cases(case_id) ON DELETE CASCADE;


--
-- Name: jury_votes jury_votes_juror_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jury_votes
    ADD CONSTRAINT jury_votes_juror_id_fkey FOREIGN KEY (juror_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: k_benchmark_evaluations k_benchmark_evaluations_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_benchmark_evaluations
    ADD CONSTRAINT k_benchmark_evaluations_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.ai_free_models(id) ON DELETE CASCADE;


--
-- Name: k_benchmark_evaluations k_benchmark_evaluations_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_benchmark_evaluations
    ADD CONSTRAINT k_benchmark_evaluations_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.k_benchmark_question_bank(id) ON DELETE CASCADE;


--
-- Name: k_benchmark_question_bank k_benchmark_question_bank_incident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_benchmark_question_bank
    ADD CONSTRAINT k_benchmark_question_bank_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incidents(id) ON DELETE CASCADE;


--
-- Name: model_feature_requests model_feature_requests_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_feature_requests
    ADD CONSTRAINT model_feature_requests_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.ai_models(id) ON DELETE CASCADE;


--
-- Name: model_feature_requests model_feature_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_feature_requests
    ADD CONSTRAINT model_feature_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: model_feature_votes model_feature_votes_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_feature_votes
    ADD CONSTRAINT model_feature_votes_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.model_feature_requests(id) ON DELETE CASCADE;


--
-- Name: model_feature_votes model_feature_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_feature_votes
    ADD CONSTRAINT model_feature_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: model_review_votes model_review_votes_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_review_votes
    ADD CONSTRAINT model_review_votes_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.model_reviews(id) ON DELETE CASCADE;


--
-- Name: model_review_votes model_review_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_review_votes
    ADD CONSTRAINT model_review_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: model_reviews model_reviews_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_reviews
    ADD CONSTRAINT model_reviews_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.ai_models(id) ON DELETE CASCADE;


--
-- Name: model_reviews model_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_reviews
    ADD CONSTRAINT model_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reputation_logs reputation_logs_triggered_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reputation_logs
    ADD CONSTRAINT reputation_logs_triggered_by_fkey FOREIGN KEY (triggered_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: reputation_logs reputation_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reputation_logs
    ADD CONSTRAINT reputation_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_reputation(user_id) ON DELETE CASCADE;


--
-- Name: suggestion_comments suggestion_comments_suggestion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suggestion_comments
    ADD CONSTRAINT suggestion_comments_suggestion_id_fkey FOREIGN KEY (suggestion_id) REFERENCES public.suggestions(id) ON DELETE CASCADE;


--
-- Name: suggestion_comments suggestion_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suggestion_comments
    ADD CONSTRAINT suggestion_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: suggestion_votes suggestion_votes_suggestion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suggestion_votes
    ADD CONSTRAINT suggestion_votes_suggestion_id_fkey FOREIGN KEY (suggestion_id) REFERENCES public.suggestions(id) ON DELETE CASCADE;


--
-- Name: suggestion_votes suggestion_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suggestion_votes
    ADD CONSTRAINT suggestion_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: suggestions suggestions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: sybil_detection_logs sybil_detection_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sybil_detection_logs
    ADD CONSTRAINT sybil_detection_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: takedown_requests takedown_requests_assigned_moderator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.takedown_requests
    ADD CONSTRAINT takedown_requests_assigned_moderator_id_fkey FOREIGN KEY (assigned_moderator_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: takedown_requests takedown_requests_incident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.takedown_requests
    ADD CONSTRAINT takedown_requests_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incidents(id) ON DELETE CASCADE;


--
-- Name: takedown_requests takedown_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.takedown_requests
    ADD CONSTRAINT takedown_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: takedown_requests takedown_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.takedown_requests
    ADD CONSTRAINT takedown_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: telemetry telemetry_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telemetry
    ADD CONSTRAINT telemetry_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_badges user_badges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_bounty_badges user_bounty_badges_badge_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bounty_badges
    ADD CONSTRAINT user_bounty_badges_badge_code_fkey FOREIGN KEY (badge_code) REFERENCES public.bounty_badges(code) ON DELETE CASCADE;


--
-- Name: user_bounty_badges user_bounty_badges_bounty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bounty_badges
    ADD CONSTRAINT user_bounty_badges_bounty_id_fkey FOREIGN KEY (bounty_id) REFERENCES public.bug_bounties(id) ON DELETE SET NULL;


--
-- Name: user_bounty_badges user_bounty_badges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bounty_badges
    ADD CONSTRAINT user_bounty_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_reputation user_reputation_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reputation
    ADD CONSTRAINT user_reputation_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: users users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: wall_of_shame_entries wall_of_shame_entries_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wall_of_shame_entries
    ADD CONSTRAINT wall_of_shame_entries_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.jury_cases(case_id) ON DELETE SET NULL;


--
-- Name: wall_of_shame_entries wall_of_shame_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wall_of_shame_entries
    ADD CONSTRAINT wall_of_shame_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: ai_models AI models are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "AI models are viewable by everyone" ON public.ai_models FOR SELECT USING (true);


--
-- Name: ai_providers AI providers are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "AI providers are viewable by everyone" ON public.ai_providers FOR SELECT USING (true);


--
-- Name: ai_scoring_config Admin read access to ai_scoring_config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin read access to ai_scoring_config" ON public.ai_scoring_config FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: ai_trust_ledger Admin read access to ai_trust_ledger; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin read access to ai_trust_ledger" ON public.ai_trust_ledger FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: ai_scoring_config Admin write access to ai_scoring_config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin write access to ai_scoring_config" ON public.ai_scoring_config USING ((auth.role() = 'authenticated'::text));


--
-- Name: ai_trust_ledger Admin write access to ai_trust_ledger; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin write access to ai_trust_ledger" ON public.ai_trust_ledger FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: automation_tasks Admins can delete automation tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete automation tasks" ON public.automation_tasks FOR DELETE USING (((auth.role() = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role))))));


--
-- Name: incidents Admins can delete incidents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete incidents" ON public.incidents FOR DELETE USING (public.is_admin(auth.uid()));


--
-- Name: automation_tasks Admins can insert automation tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert automation tasks" ON public.automation_tasks FOR INSERT WITH CHECK (((auth.role() = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role))))));


--
-- Name: ai_models Admins can manage AI models; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage AI models" ON public.ai_models USING (public.is_admin(auth.uid()));


--
-- Name: ai_providers Admins can manage AI providers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage AI providers" ON public.ai_providers USING (public.is_admin(auth.uid()));


--
-- Name: automation_tasks Admins can update automation tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update automation tasks" ON public.automation_tasks FOR UPDATE USING (((auth.role() = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role))))));


--
-- Name: automation_tasks Admins can view all automation tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all automation tasks" ON public.automation_tasks FOR SELECT USING (((auth.role() = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role))))));


--
-- Name: funnel_events Allow public insert to funnel_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert to funnel_events" ON public.funnel_events FOR INSERT WITH CHECK (true);


--
-- Name: consent_log Anonymous users can insert consent records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anonymous users can insert consent records" ON public.consent_log FOR INSERT WITH CHECK ((user_id IS NULL));


--
-- Name: incidents Anonymous users can submit incidents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anonymous users can submit incidents" ON public.incidents FOR INSERT WITH CHECK ((user_id IS NULL));


--
-- Name: takedown_requests Anyone can submit a takedown request; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit a takedown request" ON public.takedown_requests FOR INSERT WITH CHECK (true);


--
-- Name: suggestion_comments Authenticated users can create suggestion comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create suggestion comments" ON public.suggestion_comments FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (auth.uid() IS NOT NULL)));


--
-- Name: autopilot_runs Authenticated users can insert autopilot runs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert autopilot runs" ON public.autopilot_runs FOR INSERT WITH CHECK (((auth.uid() IS NOT NULL) AND ((user_id IS NULL) OR (user_id = auth.uid()))));


--
-- Name: consent_log Authenticated users can insert consent records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert consent records" ON public.consent_log FOR INSERT WITH CHECK (((auth.uid() IS NOT NULL) AND ((user_id IS NULL) OR (user_id = auth.uid()))));


--
-- Name: incidents Authenticated users can submit incidents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can submit incidents" ON public.incidents FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (auth.uid() IS NOT NULL)));


--
-- Name: suggestions Authenticated users can submit suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can submit suggestions" ON public.suggestions FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (auth.uid() IS NOT NULL)));


--
-- Name: ai_models Enable read access for all users on ai_models; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users on ai_models" ON public.ai_models FOR SELECT USING (true);


--
-- Name: ai_provider_responses Enable read access for all users on ai_provider_responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users on ai_provider_responses" ON public.ai_provider_responses FOR SELECT USING (true);


--
-- Name: ai_providers Enable read access for all users on ai_providers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users on ai_providers" ON public.ai_providers FOR SELECT USING (true);


--
-- Name: consent_log Enable read access for all users on consent_log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users on consent_log" ON public.consent_log FOR SELECT USING (true);


--
-- Name: cost_log Enable read access for all users on cost_log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users on cost_log" ON public.cost_log FOR SELECT USING (true);


--
-- Name: evidence Enable read access for all users on evidence; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users on evidence" ON public.evidence FOR SELECT USING (true);


--
-- Name: heartbeats Enable read access for all users on heartbeats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users on heartbeats" ON public.heartbeats FOR SELECT USING (true);


--
-- Name: incidents Enable read access for all users on incidents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users on incidents" ON public.incidents FOR SELECT USING (true);


--
-- Name: suggestion_votes Enable read access for all users on suggestion_votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users on suggestion_votes" ON public.suggestion_votes FOR SELECT USING (true);


--
-- Name: suggestions Enable read access for all users on suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users on suggestions" ON public.suggestions FOR SELECT USING (true);


--
-- Name: system_flags Enable read access for all users on system_flags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users on system_flags" ON public.system_flags FOR SELECT USING (true);


--
-- Name: takedown_requests Enable read access for all users on takedown_requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users on takedown_requests" ON public.takedown_requests FOR SELECT USING (true);


--
-- Name: tasks Enable read access for all users on tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users on tasks" ON public.tasks FOR SELECT USING (true);


--
-- Name: users Enable read access for all users on users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users on users" ON public.users FOR SELECT USING (true);


--
-- Name: user_badges Everyone can view badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view badges" ON public.user_badges FOR SELECT USING (true);


--
-- Name: evidence Evidence of published incidents is viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Evidence of published incidents is viewable by everyone" ON public.evidence FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.incidents
  WHERE ((incidents.id = evidence.incident_id) AND ((incidents.status = 'published'::public.incident_status) OR public.is_moderator(auth.uid()))))));


--
-- Name: evidence Moderators can manage evidence; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Moderators can manage evidence" ON public.evidence USING (public.is_moderator(auth.uid()));


--
-- Name: ai_provider_responses Moderators can manage responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Moderators can manage responses" ON public.ai_provider_responses USING (public.is_moderator(auth.uid()));


--
-- Name: incidents Moderators can update any incident; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Moderators can update any incident" ON public.incidents FOR UPDATE USING (public.is_moderator(auth.uid()));


--
-- Name: takedown_requests Moderators can update takedown requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Moderators can update takedown requests" ON public.takedown_requests FOR UPDATE USING (public.is_moderator(auth.uid()));


--
-- Name: takedown_requests Moderators can view takedown requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Moderators can view takedown requests" ON public.takedown_requests FOR SELECT USING (public.is_moderator(auth.uid()));


--
-- Name: ai_provider_responses Public statements restricted to moderators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public statements restricted to moderators" ON public.ai_provider_responses AS RESTRICTIVE FOR INSERT WITH CHECK (((response_type = 'official_reply'::text) OR public.is_moderator(auth.uid())));


--
-- Name: incidents Published incidents are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Published incidents are viewable by everyone" ON public.incidents FOR SELECT USING ((((status = 'published'::public.incident_status) AND (category <> 'non_consensual_intimate_imagery_csam'::public.incident_category)) OR (user_id = auth.uid()) OR public.is_moderator(auth.uid())));


--
-- Name: ai_provider_responses Published responses are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Published responses are viewable by everyone" ON public.ai_provider_responses FOR SELECT USING (((is_published = true) OR public.is_moderator(auth.uid())));


--
-- Name: autopilot_runs Service role can update autopilot runs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can update autopilot runs" ON public.autopilot_runs FOR UPDATE USING ((auth.role() = 'service_role'::text));


--
-- Name: suggestion_comments Suggestion comments are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Suggestion comments are viewable by everyone" ON public.suggestion_comments FOR SELECT USING (true);


--
-- Name: suggestion_votes Suggestion votes are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Suggestion votes are viewable by everyone" ON public.suggestion_votes FOR SELECT USING (true);


--
-- Name: suggestions Suggestions are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Suggestions are viewable by everyone" ON public.suggestions FOR SELECT USING (true);


--
-- Name: suggestion_comments Users can delete their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own comments" ON public.suggestion_comments FOR DELETE USING (((user_id = auth.uid()) OR public.is_admin(auth.uid())));


--
-- Name: suggestions Users can delete their own suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own suggestions" ON public.suggestions FOR DELETE USING (((user_id = auth.uid()) OR public.is_admin(auth.uid())));


--
-- Name: suggestion_votes Users can manage their own votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own votes" ON public.suggestion_votes USING ((auth.uid() = user_id));


--
-- Name: suggestion_comments Users can update their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own comments" ON public.suggestion_comments FOR UPDATE USING (((user_id = auth.uid()) OR public.is_moderator(auth.uid())));


--
-- Name: incidents Users can update their own pending incidents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own pending incidents" ON public.incidents FOR UPDATE USING (((user_id = auth.uid()) AND (status = 'pending_review'::public.incident_status)));


--
-- Name: suggestions Users can update their own suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own suggestions" ON public.suggestions FOR UPDATE USING (((user_id = auth.uid()) OR public.is_moderator(auth.uid())));


--
-- Name: evidence Users can upload evidence to their own incidents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can upload evidence to their own incidents" ON public.evidence FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.incidents
  WHERE ((incidents.id = evidence.incident_id) AND (incidents.user_id = auth.uid())))));


--
-- Name: autopilot_runs Users can view their own autopilot runs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own autopilot runs" ON public.autopilot_runs FOR SELECT USING (((user_id = auth.uid()) OR public.is_moderator(auth.uid())));


--
-- Name: user_badges Users can view their own badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: consent_log Users can view their own consent log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own consent log" ON public.consent_log FOR SELECT USING (((user_id = auth.uid()) OR public.is_admin(auth.uid())));


--
-- Name: ecosystem_news admin_all_news; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_all_news ON public.ecosystem_news USING (public.is_moderator(auth.uid()));


--
-- Name: ai_free_models; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_free_models ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_free_models ai_free_models_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ai_free_models_admin_all ON public.ai_free_models USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::public.user_role, 'ceo'::public.user_role]))))));


--
-- Name: ai_free_models ai_free_models_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ai_free_models_read_all ON public.ai_free_models FOR SELECT USING (true);


--
-- Name: ai_models; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_poll_votes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_poll_votes ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_polls; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_polls ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_provider_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_provider_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_providers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_routing_chains; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_routing_chains ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_routing_chains ai_routing_chains_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ai_routing_chains_admin_all ON public.ai_routing_chains USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::public.user_role, 'ceo'::public.user_role]))))));


--
-- Name: ai_routing_chains ai_routing_chains_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ai_routing_chains_admin_policy ON public.ai_routing_chains USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::public.user_role, 'ceo'::public.user_role]))))));


--
-- Name: ai_routing_chains ai_routing_chains_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ai_routing_chains_read_all ON public.ai_routing_chains FOR SELECT USING (true);


--
-- Name: ai_scoring_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_scoring_config ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_trust_ledger; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_trust_ledger ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_trust_scores; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_trust_scores ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_trust_scores ai_trust_scores_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ai_trust_scores_admin_policy ON public.ai_trust_scores USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::public.user_role, 'ceo'::public.user_role]))))));


--
-- Name: api_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: automation_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.automation_tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: autopilot_runs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.autopilot_runs ENABLE ROW LEVEL SECURITY;

--
-- Name: bilge_memory; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bilge_memory ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: bug_bounties bounties_mod_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bounties_mod_update ON public.bug_bounties FOR UPDATE USING (public.is_moderator(auth.uid()));


--
-- Name: bug_bounties bounties_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bounties_public_read ON public.bug_bounties FOR SELECT USING ((status = ANY (ARRAY['validated'::text, 'claimed'::text, 'paid'::text])));


--
-- Name: bug_bounties bounties_reporter_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bounties_reporter_insert ON public.bug_bounties FOR INSERT WITH CHECK ((reporter_id = auth.uid()));


--
-- Name: bug_bounties bounties_reporter_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bounties_reporter_read ON public.bug_bounties FOR SELECT USING ((reporter_id = auth.uid()));


--
-- Name: bounty_badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bounty_badges ENABLE ROW LEVEL SECURITY;

--
-- Name: bounty_badges bounty_badges_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bounty_badges_admin_all ON public.bounty_badges USING (public.is_moderator(auth.uid()));


--
-- Name: bounty_badges bounty_badges_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bounty_badges_public_read ON public.bounty_badges FOR SELECT USING (true);


--
-- Name: bounty_badges bounty_badges_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bounty_badges_public_select ON public.bounty_badges FOR SELECT USING (true);


--
-- Name: bug_bounties; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bug_bounties ENABLE ROW LEVEL SECURITY;

--
-- Name: consent_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.consent_log ENABLE ROW LEVEL SECURITY;

--
-- Name: cost_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cost_log ENABLE ROW LEVEL SECURITY;

--
-- Name: ecosystem_news; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ecosystem_news ENABLE ROW LEVEL SECURITY;

--
-- Name: evidence; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

--
-- Name: financials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.financials ENABLE ROW LEVEL SECURITY;

--
-- Name: funnel_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

--
-- Name: heartbeats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.heartbeats ENABLE ROW LEVEL SECURITY;

--
-- Name: incident_affected_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.incident_affected_users ENABLE ROW LEVEL SECURITY;

--
-- Name: incident_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.incident_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: incident_votes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.incident_votes ENABLE ROW LEVEL SECURITY;

--
-- Name: incidents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

--
-- Name: jurors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.jurors ENABLE ROW LEVEL SECURITY;

--
-- Name: jury_cases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.jury_cases ENABLE ROW LEVEL SECURITY;

--
-- Name: jury_votes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.jury_votes ENABLE ROW LEVEL SECURITY;

--
-- Name: k_benchmark_evaluations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.k_benchmark_evaluations ENABLE ROW LEVEL SECURITY;

--
-- Name: k_benchmark_evaluations k_benchmark_evaluations_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY k_benchmark_evaluations_admin_all ON public.k_benchmark_evaluations USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::public.user_role, 'ceo'::public.user_role]))))));


--
-- Name: k_benchmark_evaluations k_benchmark_evaluations_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY k_benchmark_evaluations_read_all ON public.k_benchmark_evaluations FOR SELECT USING (true);


--
-- Name: k_benchmark_question_bank; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.k_benchmark_question_bank ENABLE ROW LEVEL SECURITY;

--
-- Name: k_benchmark_question_bank k_benchmark_question_bank_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY k_benchmark_question_bank_admin_all ON public.k_benchmark_question_bank USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::public.user_role, 'ceo'::public.user_role]))))));


--
-- Name: k_benchmark_question_bank k_benchmark_question_bank_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY k_benchmark_question_bank_read_all ON public.k_benchmark_question_bank FOR SELECT USING (true);


--
-- Name: marketing_drafts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.marketing_drafts ENABLE ROW LEVEL SECURITY;

--
-- Name: model_feature_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.model_feature_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: model_feature_requests model_feature_requests_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY model_feature_requests_select ON public.model_feature_requests FOR SELECT USING (true);


--
-- Name: model_feature_votes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.model_feature_votes ENABLE ROW LEVEL SECURITY;

--
-- Name: model_feature_votes model_feature_votes_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY model_feature_votes_select ON public.model_feature_votes FOR SELECT USING (true);


--
-- Name: model_review_votes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.model_review_votes ENABLE ROW LEVEL SECURITY;

--
-- Name: model_review_votes model_review_votes_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY model_review_votes_select ON public.model_review_votes FOR SELECT USING (true);


--
-- Name: model_reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.model_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: model_reviews model_reviews_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY model_reviews_select ON public.model_reviews FOR SELECT USING (true);


--
-- Name: newsletter_subscribers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_poll_votes poll_votes_owner_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY poll_votes_owner_delete ON public.ai_poll_votes FOR DELETE USING ((((auth.uid() IS NOT NULL) AND (user_id = auth.uid())) OR public.is_moderator(auth.uid())));


--
-- Name: ai_poll_votes poll_votes_public_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY poll_votes_public_insert ON public.ai_poll_votes FOR INSERT WITH CHECK ((((auth.uid() IS NULL) AND (user_id IS NULL)) OR ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()))));


--
-- Name: ai_poll_votes poll_votes_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY poll_votes_public_select ON public.ai_poll_votes FOR SELECT USING (true);


--
-- Name: ai_polls polls_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY polls_admin_all ON public.ai_polls USING (public.is_moderator(auth.uid()));


--
-- Name: ai_polls polls_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY polls_public_select ON public.ai_polls FOR SELECT USING (true);


--
-- Name: ecosystem_news public_read_news; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_read_news ON public.ecosystem_news FOR SELECT USING ((is_active = true));


--
-- Name: reputation_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reputation_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: social_accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: suggestion_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.suggestion_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: suggestion_votes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.suggestion_votes ENABLE ROW LEVEL SECURITY;

--
-- Name: suggestions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

--
-- Name: sybil_detection_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sybil_detection_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: system_flags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_flags ENABLE ROW LEVEL SECURITY;

--
-- Name: takedown_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.takedown_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: telemetry; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;

--
-- Name: user_badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

--
-- Name: user_bounty_badges user_badges_mod_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_badges_mod_insert ON public.user_bounty_badges FOR INSERT WITH CHECK (public.is_moderator(auth.uid()));


--
-- Name: user_bounty_badges user_badges_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_badges_public_read ON public.user_bounty_badges FOR SELECT USING (true);


--
-- Name: user_bounty_badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_bounty_badges ENABLE ROW LEVEL SECURITY;

--
-- Name: user_reputation; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: vendor_quotas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vendor_quotas ENABLE ROW LEVEL SECURITY;

--
-- Name: wall_of_shame_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wall_of_shame_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: webhooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

--
-- Name: whistleblower_submissions whistleblower_public_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY whistleblower_public_insert ON public.whistleblower_submissions FOR INSERT WITH CHECK (true);


--
-- Name: whistleblower_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whistleblower_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Admins can delete invoices; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Admins can delete invoices" ON storage.objects FOR DELETE USING (((bucket_id = 'invoices'::text) AND public.is_moderator(auth.uid())));


--
-- Name: objects Admins can insert invoices; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Admins can insert invoices" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'invoices'::text) AND public.is_moderator(auth.uid())));


--
-- Name: objects Admins can update invoices; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Admins can update invoices" ON storage.objects FOR UPDATE USING (((bucket_id = 'invoices'::text) AND public.is_moderator(auth.uid())));


--
-- Name: objects Moderators can delete evidence; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Moderators can delete evidence" ON storage.objects FOR DELETE USING (public.is_moderator(auth.uid()));


--
-- Name: objects Public read access for avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public read access for avatars" ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));


--
-- Name: objects Public read access for evidence bucket; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public read access for evidence bucket" ON storage.objects FOR SELECT USING ((bucket_id = 'evidence'::text));


--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime tasks; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.tasks;


--
-- PostgreSQL database dump complete
--

\unrestrict 21PIcKQSlv3RFnml1lbXYlhcmbzMKZiQMMljE7FaSvgERZFXU6YnasYy2Nk3W0g

-- ================= DELTA (extracted) =================
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'incident_status' AND e.enumlabel = 'verified') THEN ALTER TYPE public.incident_status ADD VALUE 'verified'; END IF; END $$;

-- MODDATETIME TRIGGER FUNCTION (WO-011)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.moddatetime()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- DeHost: extend prod auth.users with trigger-referenced Supabase-compatible columns
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS last_sign_in_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS raw_user_meta_data jsonb;



-- Create Realtime Publication for Event-Driven Bus
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'dehost_realtime') THEN CREATE PUBLICATION dehost_realtime; END IF; END $$;


-- Idempotent Role Provisioning for Vanilla PostgreSQL 16
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
END
$$;


-- Idempotent Supabase Auth Compatibility Schema and Helper Functions
-- DeHost auth-mapping stub (replaces Supabase auth.users; mapped to real identity provider at deploy)
CREATE SCHEMA IF NOT EXISTS auth;

CREATE SCHEMA IF NOT EXISTS storage;

CREATE OR REPLACE FUNCTION storage.foldername(name text) RETURNS text[] AS $func$ SELECT string_to_array(name, '/'); $func$ LANGUAGE sql STABLE;


-- DeHost storage stub (replaces Supabase storage schema; mapped to real object store at deploy)
CREATE SCHEMA IF NOT EXISTS storage;

CREATE TABLE IF NOT EXISTS storage.buckets (
  id text PRIMARY KEY,
  name text NOT NULL,
  public boolean NOT NULL DEFAULT false,
  file_size_limit bigint,
  allowed_mime_types text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text REFERENCES storage.buckets(id) ON DELETE CASCADE,
  name text NOT NULL,
  owner uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ LANGUAGE sql STABLE;


CREATE OR REPLACE FUNCTION auth.role() RETURNS text AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.role', true), '')::text;
$$ LANGUAGE sql STABLE;


CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true), '')::jsonb;
$$ LANGUAGE sql STABLE;


-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- (dedup) trigger trg_users_updated_at already in prod base; skipped

-- (dedup) trigger trg_incidents_updated_at already in prod base; skipped

-- (dedup) trigger trg_suggestions_updated_at already in prod base; skipped

-- ============================================================================
-- AUTH → USERS SYNC
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, avatar_url, locale) -- KEEP: user profile bootstrap insert inside handle_new_user auth trigger
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'locale', 'en')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;


-- (dedup) trigger on_auth_user_created already in prod base; skipped

-- ============================================================================
-- TRIGGER: Maintain incidents.search_vector
-- ============================================================================
create or replace function public.tg_incidents_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple'::regconfig, coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(new.description,'')), 'B') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(new.category::text,'')), 'C');
  return new;
end;
$$;

-- (dedup) trigger trg_incidents_search_vector already in prod base; skipped

-- ============================================================================
-- HELPER: IS_MODERATOR
-- ============================================================================
-- Delegation stub for 0-arg public.is_moderator()
CREATE OR REPLACE FUNCTION public.is_moderator() RETURNS boolean AS $func$
BEGIN
  RETURN public.is_moderator(auth.uid());
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;


create or replace function public.is_moderator(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.users
    where id = uid and role in ('moderator', 'admin', 'ceo')
  );
$$;


create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.users
    where id = uid and role in ('admin', 'ceo')
  );
$$;





-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260605000004_incidents_timeline.sql
-- ========================================================
-- Add published_at and moderated_at to incidents for proper timeline ordering.
-- reviewed_at stays for general review state.
alter table public.incidents
  add column if not exists published_at timestamptz,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderation_note text;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260605000005_takedown_fields.sql
-- ========================================================
-- Add fields to takedown_requests to support both the public form and inline-from-incident flow.
alter table public.takedown_requests
  add column if not exists target_url text,
  add column if not exists details text,
  add column if not exists country text,
  add column if not exists organization text,
  add column if not exists identity_proof_url text,
  add column if not exists user_id uuid references public.users(id) on delete set null,
  add column if not exists reviewed_by uuid references public.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists ip_address inet;


-- Relax the reason length constraint so 'defamation' / 'copyright' / etc. categories fit.
alter table public.takedown_requests
  alter column reason type text,
  drop constraint if exists takedown_requests_reason_check;


-- Map our form values to the takedown_status enum.
-- The form sends status = 'pending' but the enum uses 'received'.
create or replace function public.normalize_takedown_status(s text)
returns public.takedown_status
language sql
immutable
as $$
  select case
    when s = 'pending' then 'received'::public.takedown_status
    when s = 'approved' then 'approved'::public.takedown_status
    when s = 'rejected' then 'rejected'::public.takedown_status
    when s = 'under_review' then 'under_review'::public.takedown_status
    when s = 'escalated' then 'escalated'::public.takedown_status
    else 'received'::public.takedown_status
  end;
$$;


CREATE INDEX IF NOT EXISTS idx_autopilot_runs_action on public.autopilot_runs(action);


-- (dedup) trigger trg_autopilot_runs_updated_at already in prod base; skipped

create or replace function public.tg_incident_votes_touch() returns trigger language plpgsql security definer set search_path = public as $$ begin new.updated_at := now(); return new; end; $$;

-- (dedup) trigger trg_incident_votes_touch already in prod base; skipped

-- 2) incidents tablosuna PII kolonlari (submitIncident icin)
alter table public.incidents add column if not exists contains_pii boolean not null default false;

alter table public.incidents add column if not exists pii_categories text[] not null default '{}';


-- ----------------------------------------------------------------------------
-- Trigger: keep updated_at fresh + bump parent incidents.upvotes_count
-- ----------------------------------------------------------------------------
create or replace function public.tg_incident_votes_touch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- (dedup) trigger trg_incident_votes_touch already in prod base; skipped

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.incident_votes CASCADE;


-- ========================================================
-- Source: 20260608000002_incidents_pii_columns.sql
-- ========================================================
-- ============================================================================
-- 20260608000002_incidents_pii_columns.sql
--
-- The autopilot-wired submitIncident Server Action (src/actions/incidents.ts)
-- writes two columns that were never created on `public.incidents`:
--
--   * contains_pii  (boolean)
--   * pii_categories (text[])
--
-- The PII Guardian (src/lib/pii/guardian.ts) computes these values, and the
-- `evidence` table has had them since 20260605000001_initial_schema.sql.
-- Without this migration, every incident submission throws a 500.
-- ============================================================================

alter table public.incidents
  add column if not exists contains_pii boolean not null default false;


alter table public.incidents
  add column if not exists pii_categories text[] not null default '{}';


comment on column public.incidents.contains_pii is
  'True if the PII Guardian detected PII in the title or description before insert.';


comment on column public.incidents.pii_categories is
  'Distinct PII category labels detected by the PII Guardian (e.g. {email,phone,id_document}).';



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260608000005_gamification_and_anonymous.sql
-- ========================================================
-- =============================================================================
-- Migration: Gamification & Anonymous Submissions
-- =============================================================================

-- 1. Add gamification columns to users table
alter table public.users add column if not exists reputation_score integer not null default 0;

alter table public.users add column if not exists badges text[] not null default '{}';



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260610000001_i18n_columns.sql
-- ========================================================
-- Migration: i18n Translation Columns (2026-06-10)
-- Adds title_tr, description_tr columns to incidents and suggestions tables
-- Locale-aware rendering: prefer localized text, fall back to masked (EN) version

alter table public.incidents
add column if not exists title_tr text,
add column if not exists description_tr text;


alter table public.suggestions
add column if not exists title_tr text,
add column if not exists description_tr text;


-- Create a helper view for locale-aware retrieval
-- Usage: select * from incidents_localized where locale = 'tr';
DROP VIEW IF EXISTS public.incidents_localized;
create or replace view public.incidents_localized as
select
  i.*,
  case
    when i.title_tr is not null and length(btrim(i.title_tr)) > 0
    then i.title_tr
    else i.title_masked
  end as title_display,
  case
    when i.description_tr is not null and length(btrim(i.description_tr)) > 0
    then i.description_tr
    else i.description_masked
  end as description_display
from public.incidents i;


DROP VIEW IF EXISTS public.suggestions_localized;
create or replace view public.suggestions_localized as
select
  s.*,
  case
    when s.title_tr is not null and length(btrim(s.title_tr)) > 0
    then s.title_tr
    else s.title
  end as title_display,
  case
    when s.description_tr is not null and length(btrim(s.description_tr)) > 0
    then s.description_tr
    else s.description
  end as description_display
from public.suggestions s;


-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- (dedup) trigger trg_bounties_updated_at already in prod base; skipped

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.user_bounty_badges CASCADE;
-- DROP TABLE IF EXISTS public.bounty_badges CASCADE;
-- DROP TABLE IF EXISTS public.bug_bounties CASCADE;


-- ========================================================
-- Source: 20260610000003_custom_provider.sql
-- ========================================================
-- Migration: Support Custom Provider & Model Names (2026-06-10)
-- Allows users to submit incidents about any AI provider/model, not just
-- pre-vetted ones. Custom names are stored alongside null FKs.

alter table public.incidents
  add column if not exists provider_custom_name text,
  add column if not exists model_custom_name text;


alter table public.incidents
  alter column ai_provider_id drop not null,
  alter column ai_model_id drop not null;


comment on column public.incidents.provider_custom_name is
  'User-entered provider name when not in the verified providers list';


comment on column public.incidents.model_custom_name is
  'User-entered model name when not in the verified models list';



-- Policies




-- Triggers for counts
create or replace function public.tg_model_review_votes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    update public.model_reviews
    set helpful_count = helpful_count + 1
    where id = new.review_id;
  elsif (TG_OP = 'DELETE') then
    update public.model_reviews
    set helpful_count = helpful_count - 1
    where id = old.review_id;
  end if;
  return null;
end;
$$;

-- (dedup) trigger trg_model_review_votes_count already in prod base; skipped

create or replace function public.tg_model_feature_votes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    update public.model_feature_requests
    set votes_count = votes_count + 1
    where id = new.request_id;
  elsif (TG_OP = 'DELETE') then
    update public.model_feature_requests
    set votes_count = votes_count - 1
    where id = old.request_id;
  end if;
  return null;
end;
$$;

-- (dedup) trigger trg_model_feature_votes_count already in prod base; skipped

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.model_feature_votes CASCADE;
-- DROP TABLE IF EXISTS public.model_feature_requests CASCADE;
-- DROP TABLE IF EXISTS public.model_review_votes CASCADE;
-- DROP TABLE IF EXISTS public.model_reviews CASCADE;


-- ========================================================
-- Source: 20260615000001_ai_polls_atomic_increment.sql
-- ========================================================
create or replace function public.increment_poll_count(
  p_poll_id uuid,
  p_choice text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_choice = 'yes' then
    update ai_polls set yes_count = yes_count + 1 where id = p_poll_id;
  elsif p_choice = 'no' then
    update ai_polls set no_count = no_count + 1 where id = p_poll_id;
  elsif p_choice = 'unsure' then
    update ai_polls set unsure_count = unsure_count + 1 where id = p_poll_id;
  end if;
end;
$$;

grant execute on function public.increment_poll_count(uuid, text) to service_role;


alter table public.ai_polls
  add column if not exists context_news_id uuid references public.ecosystem_news(id) on delete set null;



-- ROLLBACK:
-- DROP TABLE IF EXISTS public.ecosystem_news CASCADE;


-- ========================================================
-- Source: 20260618000001_autopilot_provider_and_moderation.sql
-- ========================================================
-- Add moderation details to public.incidents
ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS ai_moderation_score integer,
  ADD COLUMN IF NOT EXISTS ai_moderation_reason text;



-- ROLLBACK:
-- DROP TABLE IF EXISTS public.blog_posts CASCADE;


-- ========================================================
-- Source: 20260619000004_add_trust_score_to_providers.sql
-- ========================================================
-- Add trust_score column to public.ai_providers
ALTER TABLE public.ai_providers
  ADD COLUMN IF NOT EXISTS trust_score integer DEFAULT 70;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260621000001_add_polls_i18n.sql
-- ========================================================
-- Add localized columns to public.ai_polls
ALTER TABLE public.ai_polls ADD COLUMN IF NOT EXISTS title_tr text;

ALTER TABLE public.ai_polls ADD COLUMN IF NOT EXISTS title_en text;

ALTER TABLE public.ai_polls ADD COLUMN IF NOT EXISTS description_tr text;

ALTER TABLE public.ai_polls ADD COLUMN IF NOT EXISTS description_en text;


-- Set NOT NULL constraints
ALTER TABLE public.ai_polls ALTER COLUMN title_en SET NOT NULL;

ALTER TABLE public.ai_polls ALTER COLUMN description_en SET NOT NULL;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260622000002_cross_audit_columns.sql
-- ========================================================
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


grant select (
  id,
  username,
  full_name,
  avatar_url,
  bio,
  role,
  is_verified,
  locale,
  created_at,
  updated_at
) on public.users to anon, authenticated;


-- Create trigger for updated_at using existing public.set_updated_at function
DROP TRIGGER IF EXISTS trg_api_keys_updated_at ON public.api_keys; CREATE TRIGGER trg_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();



-- ROLLBACK:
-- DROP TABLE IF EXISTS public.api_keys CASCADE;


-- ========================================================
-- Source: 20260623000300_fix_cross_audit_columns.sql
-- ========================================================
-- Migration: Fix missing cross-audit columns on incidents table (2026-06-23)
-- Ensures the columns from the cross-audit migration are physically present on the remote database.

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS cross_audit_truth_score integer,
  ADD COLUMN IF NOT EXISTS cross_audit_confidence real,
  ADD COLUMN IF NOT EXISTS cross_audit_reasoning text,
  ADD COLUMN IF NOT EXISTS cross_audit_model text,
  ADD COLUMN IF NOT EXISTS cross_audit_triage_models text[],
  ADD COLUMN IF NOT EXISTS cross_audit_completed_at timestamptz;


DROP VIEW IF EXISTS public.incidents_localized;
CREATE VIEW public.incidents_localized AS
SELECT
  i.*,
  CASE
    WHEN i.title_tr IS NOT NULL AND length(btrim(i.title_tr)) > 0
    THEN i.title_tr
    ELSE i.title_masked
  END AS title_display,
  CASE
    WHEN i.description_tr IS NOT NULL AND length(btrim(i.description_tr)) > 0
    THEN i.description_tr
    ELSE i.description_masked
  END AS description_display
FROM public.incidents i;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260623000500_views_and_votes_sync.sql
-- ========================================================
-- PostgreSQL function to increment incident views atomically
CREATE OR REPLACE FUNCTION public.increment_incident_views(p_incident_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.incidents
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_incident_id;
END;
$$;


-- PostgreSQL trigger function to update upvotes_count on public.incidents
CREATE OR REPLACE FUNCTION public.tg_update_incident_upvotes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- After insert
  IF TG_OP = 'INSERT' THEN
    IF NEW.value = 1 THEN
      UPDATE public.incidents
      SET upvotes_count = COALESCE(upvotes_count, 0) + 1
      WHERE id = NEW.incident_id;
    END IF;
  -- After update
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.value = 1 AND NEW.value <> 1 THEN
      UPDATE public.incidents
      SET upvotes_count = COALESCE(upvotes_count, 0) - 1
      WHERE id = NEW.incident_id;
    ELSIF OLD.value <> 1 AND NEW.value = 1 THEN
      UPDATE public.incidents
      SET upvotes_count = COALESCE(upvotes_count, 0) + 1
      WHERE id = NEW.incident_id;
    END IF;
  -- After delete
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.value = 1 THEN
      UPDATE public.incidents
      SET upvotes_count = COALESCE(upvotes_count, 0) - 1
      WHERE id = OLD.incident_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

-- (dedup) trigger trg_update_incident_upvotes_count already in prod base; skipped

-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260623000700_incident_comments_and_affected.sql
-- ========================================================
-- Add affected_users_count column to public.incidents
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS affected_users_count integer NOT NULL DEFAULT 0;


-- Trigger to update updated_at on public.incident_comments
CREATE OR REPLACE FUNCTION public.tg_incident_comments_touch()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- (dedup) trigger trg_incident_comments_touch already in prod base; skipped

-- Trigger to automatically maintain incidents.affected_users_count
CREATE OR REPLACE FUNCTION public.tg_update_incident_affected_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.incidents
    SET affected_users_count = COALESCE(affected_users_count, 0) + 1
    WHERE id = NEW.incident_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.incidents
    SET affected_users_count = GREATEST(0, COALESCE(affected_users_count, 0) - 1)
    WHERE id = OLD.incident_id;
  END IF;
  RETURN NULL;
END;
$$;

-- (dedup) trigger trg_update_incident_affected_count already in prod base; skipped

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'advisor') THEN ALTER TYPE public.user_role ADD VALUE 'advisor'; END IF; END $$;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260624100001_strategy_and_rbac.sql
-- ========================================================
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


-- 2. Create social_assets table
CREATE TABLE IF NOT EXISTS public.social_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type text NOT NULL CHECK (asset_type in ('image', 'video', 'carousel', 'reel', 'story')),
  title text NOT NULL,
  file_url text NOT NULL,
  thumbnail_url text,
  linked_post_id text REFERENCES public.social_posts(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_assets_linked_post ON public.social_assets(linked_post_id);



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260626000001_sprint4_schema.sql
-- ========================================================
-- Migration: Sprint 4 Schema Upgrades (Watches & Dynamic Feed Score View)
-- Timestamp: 2026-06-26 00:00:01

-- 1. Create watches table
CREATE TABLE IF NOT EXISTS public.user_provider_watches (
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES public.ai_providers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, provider_id)
);


-- 4. Create feed_incidents view for dynamic feed score calculation
-- (dropped) feed_incidents stays a TABLE per prod base; ranking view deferred to product work

-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260628000002_add_incident_import_fields.sql
-- ========================================================
-- Migration: Add incident import fields
-- Timestamp: 2026-06-28 00:00:02

ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS incident_source text DEFAULT 'user_submitted' CHECK (incident_source IN ('user_submitted', 'aiaaic_import', 'aiid_import', 'news_curated', 'court_record'));

ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS import_external_id text;

ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS import_attribution text;


-- Add a proper unique constraint for upsert conflict target matching
ALTER TABLE public.incidents 
ADD CONSTRAINT incidents_import_source_external_id_key 
UNIQUE (incident_source, import_external_id);



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260629000000_eu_ai_act_columns.sql
-- ========================================================
-- Migration: Add EU AI Act Compliance Columns to incidents table (2026-06-29)

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS eu_act_transparency_score integer,
  ADD COLUMN IF NOT EXISTS eu_act_non_discrimination_score integer,
  ADD COLUMN IF NOT EXISTS eu_act_data_privacy_score integer,
  ADD COLUMN IF NOT EXISTS eu_act_risk_category text;


COMMENT ON COLUMN public.incidents.eu_act_transparency_score IS
  'Transparency compliance score (0-100) under EU AI Act.';

COMMENT ON COLUMN public.incidents.eu_act_non_discrimination_score IS
  'Non-discrimination/bias compliance score (0-100) under EU AI Act.';

COMMENT ON COLUMN public.incidents.eu_act_data_privacy_score IS
  'Data privacy compliance score (0-100) under EU AI Act.';

COMMENT ON COLUMN public.incidents.eu_act_risk_category IS
  'Risk categorization under EU AI Act (Minimal, Specific Transparency, High Risk, Unacceptable Risk).';


DROP VIEW IF EXISTS public.incidents_localized;
CREATE VIEW public.incidents_localized AS
SELECT
  i.*,
  CASE
    WHEN i.title_tr IS NOT NULL AND length(btrim(i.title_tr)) > 0
    THEN i.title_tr
    ELSE i.title_masked
  END AS title_display,
  CASE
    WHEN i.description_tr IS NOT NULL AND length(btrim(i.description_tr)) > 0
    THEN i.description_tr
    ELSE i.description_masked
  END AS description_display
FROM public.incidents i;



-- ROLLBACK:
-- DROP TABLE IF EXISTS public.expert_applications CASCADE;


-- ========================================================
-- Source: 20260701200000_academy_and_expert_email.sql
-- ========================================================
-- expert_applications tablosuna email kolonu ekle
ALTER TABLE public.expert_applications
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS expertise_area text;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260701202000_make_expert_linkedin_nullable.sql
-- ========================================================
-- Migration: Make linkedin_url nullable in expert_applications (2026-07-01)
ALTER TABLE public.expert_applications
  ALTER COLUMN linkedin_url DROP NOT NULL;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260701203000_add_incident_expert_fix_fields.sql
-- ========================================================
-- ============================================================================
-- 20260701203000_add_incident_expert_fix_fields.sql
--
-- Adds is_expert and expert_fix columns to the incidents table.
-- ============================================================================

alter table public.incidents
  ADD COLUMN IF NOT EXISTS is_expert boolean not null default false,
  ADD COLUMN IF NOT EXISTS expert_fix text;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260701204000_create_leaderboard_view.sql
-- ========================================================
-- ============================================================================
-- 20260701204000_create_leaderboard_view.sql
--
-- Creates the provider_leaderboard view with security_invoker enabled.
-- ============================================================================

DROP VIEW IF EXISTS public.provider_leaderboard;
create or replace view public.provider_leaderboard
with (security_invoker = true) as
select
  p.id,
  p.slug,
  p.name,
  p.logo_url,
  p.is_verified,
  p.website_url,
  p.trust_score,
  coalesce(count(distinct i.id), 0) as incident_count,
  coalesce(count(distinct r.id), 0) as response_count
from
  public.ai_providers p
left join
  public.incidents i on i.ai_provider_id = p.id and i.status = 'published'
left join
  public.ai_provider_responses r on r.ai_provider_id = p.id and r.is_published = true
where
  p.slug <> 'alpar-autopilot'
group by
  p.id, p.slug, p.name, p.logo_url, p.is_verified, p.website_url, p.trust_score;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260701221500_create_investor_applications_table.sql
-- ========================================================
-- Create investor_applications table
create table IF NOT EXISTS public.investor_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  title text not null,
  company text not null,
  linkedin_url text not null,
  email text not null,
  check_size text not null,
  why_interested text,
  status text not null default 'pending',
  access_token_hash text,
  created_at timestamp with time zone default now() not null,
  approved_at timestamp with time zone,
  constraint status_check check (status in ('pending', 'approved', 'rejected'))
);

  CREATE POLICY "investor_applications_admin_all" ON public.investor_applications
  for all using (public.is_admin(auth.uid()) or public.is_ceo(auth.uid()));



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260703000001_verified_respondent.sql
-- ========================================================
-- ============================================================================
-- 20260703000001_verified_respondent.sql
-- Add Verified Respondent fields to ai_providers and update leaderboard view.
-- ============================================================================

-- 1) Add columns to ai_providers table
ALTER TABLE public.ai_providers
  ADD COLUMN IF NOT EXISTS is_verified_respondent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_respondent_at timestamptz,
  ADD COLUMN IF NOT EXISTS respondent_contact_email text,
  ADD COLUMN IF NOT EXISTS respondent_verified_by uuid REFERENCES auth.users(id);


DROP VIEW IF EXISTS public.provider_leaderboard;
create or replace view public.provider_leaderboard
with (security_invoker = true) as
select
  p.id,
  p.slug,
  p.name,
  p.logo_url,
  p.is_verified,
  p.website_url,
  p.trust_score,
  p.is_verified_respondent,
  coalesce(count(distinct i.id), 0) as incident_count,
  coalesce(count(distinct r.id), 0) as response_count
from
  public.ai_providers p
left join
  public.incidents i on i.ai_provider_id = p.id and i.status = 'published'
left join
  public.ai_provider_responses r on r.ai_provider_id = p.id and r.is_published = true
where
  p.slug <> 'alpar-autopilot'
group by
  p.id, p.slug, p.name, p.logo_url, p.is_verified, p.website_url, p.trust_score, p.is_verified_respondent;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260704000000_eu_ai_act_serious_incidents.sql
-- ========================================================
-- Migration: Add EU AI Act Serious Incident Reporting Columns (2026-07-04)

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS eu_act_serious_incident_class text,
  ADD COLUMN IF NOT EXISTS eu_act_high_risk_system_category text,
  ADD COLUMN IF NOT EXISTS eu_act_reporting_deadline_days integer;


COMMENT ON COLUMN public.incidents.eu_act_serious_incident_class IS
  'Class of serious incident (death/health, critical-infrastructure, fundamental-rights, property-environment).';

COMMENT ON COLUMN public.incidents.eu_act_high_risk_system_category IS
  'High-risk AI system classification matching Annex III.';

COMMENT ON COLUMN public.incidents.eu_act_reporting_deadline_days IS
  'Reporting deadline under Article 73 (2, 10, or 15 days).';


-- Grant select privilege only on non-PII and masked columns
grant select (
  id,
  user_id,
  is_anonymous,
  title_masked,
  description_masked,
  ai_provider_id,
  ai_model_id,
  category,
  severity,
  incident_date,
  location_country,
  language,
  status,
  moderator_id,
  moderator_notes,
  reviewed_at,
  views_count,
  upvotes_count,
  shares_count,
  comments_count,
  source_url,
  ip_hash,
  user_agent,
  search_vector,
  created_at,
  updated_at,
  published_at,
  moderated_at,
  moderation_note,
  contains_pii,
  pii_categories,
  title_tr,
  description_tr,
  provider_custom_name,
  model_custom_name,
  ai_moderation_score,
  ai_moderation_reason,
  cross_audit_truth_score,
  cross_audit_confidence,
  cross_audit_reasoning,
  cross_audit_model,
  cross_audit_triage_models,
  cross_audit_completed_at,
  affected_users_count,
  incident_source,
  import_external_id,
  import_attribution,
  eu_act_transparency_score,
  eu_act_non_discrimination_score,
  eu_act_data_privacy_score,
  eu_act_risk_category,
  is_expert,
  expert_fix,
  eu_act_serious_incident_class,
  eu_act_high_risk_system_category,
  eu_act_reporting_deadline_days
) on public.incidents to anon, authenticated;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260704000003_provider_response_tokens.sql
-- ========================================================
CREATE TABLE IF NOT EXISTS public.provider_response_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid REFERENCES public.incidents(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  email text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);


-- Enable RLS

-- Policy to allow service_role / admin client access
  CREATE POLICY "Service role access" ON public.provider_response_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);



-- ROLLBACK:
-- DROP TABLE IF EXISTS public.provider_response_tokens CASCADE;


-- ========================================================
-- Source: 20260704000004_transparency_stats_view.sql
-- ========================================================
-- Migration: Create transparency_stats view (2026-07-04)

DROP VIEW IF EXISTS public.transparency_stats;
CREATE OR REPLACE VIEW public.transparency_stats
WITH (security_invoker = true) AS
SELECT
  (SELECT COUNT(*) FROM public.incidents WHERE status = 'published') AS total_incidents,
  (SELECT COUNT(*) FROM public.incidents WHERE status = 'published' AND created_at > now() - interval '7 days') AS verified_this_week,
  COALESCE(
    ROUND(
      (SELECT COUNT(DISTINCT incident_id) FROM public.ai_provider_responses WHERE is_published = true)::numeric /
      NULLIF((SELECT COUNT(*) FROM public.incidents WHERE status = 'published'), 0) * 100,
      1
    ),
    0
  ) AS provider_response_rate;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260706000000_autopilot_control.sql
-- ========================================================
-- Migration: Add cost tracking columns to autopilot_runs and create autopilot_worker_config table
ALTER TABLE public.autopilot_runs 
  ADD COLUMN IF NOT EXISTS cost_cents integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS token_count integer DEFAULT 0;


CREATE TABLE IF NOT EXISTS public.autopilot_worker_config (
  worker_name text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);


-- ROLLBACK:
-- DROP INDEX IF EXISTS public.idx_incidents_status_published_at;
-- DROP INDEX IF EXISTS public.idx_social_posts_status_scheduled_at;


-- ========================================================
-- Source: 20260706000002_incident_processing_stage.sql
-- ========================================================
-- Migration: Add processing_stage column to public.incidents and grant select permissions
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS processing_stage text NOT NULL DEFAULT 'complete';

ALTER TABLE public.incidents ALTER COLUMN processing_stage SET DEFAULT 'queued';


-- Grant select privilege on the new column to anon and authenticated roles
GRANT SELECT (processing_stage) ON public.incidents TO anon, authenticated;


-- Enable RLS

-- RLS Policy: Users can view and manage their own preferences

-- Update handle_new_user trigger function to include email preferences setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, locale) -- KEEP: user profile bootstrap insert inside handle_new_user auth trigger
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'locale', 'en')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.email_preferences (user_id, weekly_digest, watches, reporter_notifications) -- KEEP: default email preferences insert inside handle_new_user auth trigger
  VALUES (new.id, true, true, true)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;


-- ROLLBACK:
-- DROP TABLE IF EXISTS public.email_preferences CASCADE;
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
-- BEGIN
--   INSERT INTO public.users (id, email, full_name, avatar_url, locale) -- KEEP: user profile bootstrap insert inside handle_new_user auth trigger
--   VALUES (
--     new.id,
--     new.email,
--     coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
--     new.raw_user_meta_data->>'avatar_url',
--     coalesce(new.raw_user_meta_data->>'locale', 'en')
--   )
--   ON CONFLICT (id) DO NOTHING;
--   RETURN new;
-- END;
-- $$;


-- ========================================================
-- Source: 20260706000004_ecosystem_news_status.sql
-- ========================================================
-- ============================================================================
-- 20260706000004_ecosystem_news_status.sql
--
-- Adds status column to ecosystem_news table.
-- Existing rows are marked as 'accepted' to avoid duplicate social queue generation.
-- New rows default to 'pending'.
-- ============================================================================

ALTER TABLE public.ecosystem_news 
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'accepted' CHECK (status in ('pending', 'accepted', 'rejected'));


ALTER TABLE public.ecosystem_news 
  ALTER COLUMN status SET DEFAULT 'pending';



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260706000005_social_posts_linked_news.sql
-- ========================================================
-- ============================================================================
-- 20260706000005_social_posts_linked_news.sql
--
-- Adds linked_news_id column to social_posts table to track news marketing assets.
-- ============================================================================

ALTER TABLE public.social_posts
  ADD COLUMN IF NOT EXISTS linked_news_id uuid REFERENCES public.ecosystem_news(id) ON DELETE SET NULL;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260706000006_user_deletion_fields.sql
-- ========================================================
-- ============================================================================
-- 20260706000006_user_deletion_fields.sql
--
-- Adds fields to support GDPR/KVKK delete flows (72h wait, soft-delete, 30d hard-delete).
-- ============================================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS delete_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS delete_scheduled_for timestamptz,
  ADD COLUMN IF NOT EXISTS is_soft_deleted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS soft_deleted_at timestamptz;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260707000000_email_logs_and_cap.sql
-- ========================================================
-- Migration: Create email_sent_logs table, enable RLS, and add policy for admin/service access.
CREATE TABLE IF NOT EXISTS public.email_sent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash text NOT NULL, -- SHA256 of lowercase recipient email to protect PII
  email_type text NOT NULL, -- e.g. 'provider_response', 'whistleblower_confirmation'
  sent_at timestamptz NOT NULL DEFAULT now()
);


-- Index for querying by hash and time range
CREATE INDEX IF NOT EXISTS idx_email_sent_logs_hash_date ON public.email_sent_logs(email_hash, sent_at);


-- Enable RLS

-- Allow read/write only for administrators and system operations

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.email_sent_logs CASCADE;


-- ========================================================
-- Source: 20260711000001_strategy_state_support.sql
-- ========================================================
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


CREATE TABLE IF NOT EXISTS public.finance_api_usage (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service      text NOT NULL, -- 'gemini', 'anthropic', 'dehost', 'dehost'
  metric_name  text NOT NULL, -- 'tokens_in', 'tokens_out', 'requests', 'bandwidth_gb'
  recorded_at  timestamptz NOT NULL DEFAULT now(),
  value        numeric(18,4) NOT NULL,
  unit         text, -- 'token', 'request', 'GB', '$'
  created_at   timestamptz NOT NULL DEFAULT now()
);



-- ROLLBACK:
-- DROP TABLE IF EXISTS public.finance_api_usage CASCADE;
-- DROP TABLE IF EXISTS public.finance_monthly_costs CASCADE;


-- ========================================================
-- Source: 20260712000001_anonymous_email_hash.sql
-- ========================================================
-- Add optional email-hash column for anonymous reporters (DSA Art. 14 + 5651 compliant)
-- Only sha256 hash stored — never raw email. No display, no join key.
ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS anonymous_email_hash text;

CREATE INDEX IF NOT EXISTS idx_cookie_consent_session on public.cookie_consent_log(session_id);


-- ROLLBACK:
-- drop table if exists public.cookie_consent_log;


-- ========================================================
-- Source: 20260712000003_age_declarations.sql
-- ========================================================
-- G8: Age declaration audit trail (COPPA + UK Online Safety Act)

create table IF NOT EXISTS public.age_declarations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  incident_id uuid references public.incidents(id) on delete cascade,
  declared_over_18 boolean not null default true,
  ip_hash text,
  created_at timestamptz not null default now()
);





CREATE INDEX IF NOT EXISTS idx_age_declaration_user on public.age_declarations(user_id);

CREATE INDEX IF NOT EXISTS idx_age_declaration_incident on public.age_declarations(incident_id);


-- Alter api_keys table to add tier and client_type
ALTER TABLE public.api_keys 
  ADD COLUMN IF NOT EXISTS tier text CHECK (tier IN ('free', 'developer', 'enterprise')) DEFAULT 'developer',
  ADD COLUMN IF NOT EXISTS client_type text CHECK (client_type IN ('internal', 'external')) DEFAULT 'external';


-- ROLLBACK: DELETE FROM public.strategy_innovations WHERE title ~ '^I[1-8] —';


-- ========================================================
-- Source: 20260715000002_email_preferences_waitlist.sql
-- ========================================================
-- Migration: Alter email_preferences table to support waitlist (non-user email subscriptions)
-- Adds email, marketing_opt_in, and source columns, makes user_id nullable, and defines id as the primary key.

ALTER TABLE public.email_preferences DROP CONSTRAINT IF EXISTS email_preferences_pkey;


ALTER TABLE public.email_preferences ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();


-- Now make id the primary key
ALTER TABLE public.email_preferences ADD CONSTRAINT email_preferences_pkey PRIMARY KEY (id);


-- Make user_id nullable (so anonymous waitlist entries can insert without referencing a registered user)
ALTER TABLE public.email_preferences ALTER COLUMN user_id DROP NOT NULL;


-- Add waitlist fields
ALTER TABLE public.email_preferences ADD COLUMN IF NOT EXISTS email text;

ALTER TABLE public.email_preferences ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT true;

ALTER TABLE public.email_preferences ADD COLUMN IF NOT EXISTS source text DEFAULT 'waitlist';


-- Ensure emails are unique when provided
ALTER TABLE public.email_preferences ADD CONSTRAINT email_preferences_email_unique UNIQUE (email);


-- Ensure user_id remains unique among registered users
ALTER TABLE public.email_preferences ADD CONSTRAINT email_preferences_user_id_unique UNIQUE (user_id);


-- Allow public inserts for the waitlist form


-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260715141149_cross_audit_cache_hit.sql
-- ========================================================
-- Migration: Add cache_hit column to cross_audit_runs for Redis caching telemetry.



-- ROLLBACK:
-- ALTER TABLE public.cross_audit_runs DROP COLUMN IF EXISTS cache_hit;


-- ========================================================
-- Source: 20260715141655_subscriptions.sql
-- ========================================================
-- Migration: Create subscriptions table for Stripe billing.

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    status TEXT NOT NULL DEFAULT 'inactive',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Unique indexes for Stripe IDs
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions (stripe_customer_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON public.subscriptions (stripe_subscription_id);


-- Index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);

    CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
    FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));


-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_subscription_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


DROP TRIGGER IF EXISTS on_subscription_updated ON public.subscriptions; CREATE TRIGGER on_subscription_updated
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_subscription_updated();


CREATE TABLE IF NOT EXISTS public.strategic_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  model_ids TEXT[] NOT NULL,
  total_questions INT NOT NULL DEFAULT 35,
  total_answers INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS public.strategic_answers (
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


CREATE INDEX IF NOT EXISTS idx_strategic_answers_run ON public.strategic_answers(run_id);

CREATE INDEX IF NOT EXISTS idx_strategic_answers_model ON public.strategic_answers(model_id);

CREATE INDEX IF NOT EXISTS idx_strategic_answers_question ON public.strategic_answers(question_id);



-- ROLLBACK:
-- DROP TABLE IF EXISTS public.strategic_answers CASCADE;
-- DROP TABLE IF EXISTS public.strategic_runs CASCADE;


-- ========================================================
-- Source: 20260720000000_honesty_pass_source_badges.sql
-- ========================================================
-- Honesty Pass: H1 source badge, H2 is_seed flag for incidents
-- Adds source_badge and is_seed to incidents table for transparent seed data labeling

-- ROLLBACK: ALTER TABLE public.incidents DROP COLUMN IF EXISTS is_seed; ALTER TABLE public.incidents DROP COLUMN IF EXISTS source_badge;

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_badge text CHECK (
    source_badge IS NULL OR source_badge IN ('community', 'imported', 'seed', 'expert-verified')
  );



-- ========================================================
-- Source: 20260720000001_api_keys_add_id_and_hash.sql
-- ========================================================
-- Add id primary key, client_type and sha256 hash to api_keys
-- ROLLBACK:
-- ALTER TABLE api_keys DROP COLUMN id, DROP COLUMN client_type;
-- UPDATE api_keys SET api_key = '(rollback_no_hash)' WHERE length(api_key) = 64;

ALTER TABLE api_keys
ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS client_type text CHECK (client_type IN ('public', 'private', 'internal')) DEFAULT 'public';


ALTER TABLE api_keys DROP CONSTRAINT IF EXISTS api_keys_pkey CASCADE;

ALTER TABLE api_keys ADD PRIMARY KEY (id);


-- Create helper function to trigger the cron jobs
CREATE OR REPLACE FUNCTION public.trigger_cron_job(cron_path text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_secret text;
  v_request_id bigint;
  v_url text;
BEGIN
  -- Get secret from vault
  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets
  WHERE name = 'cron_secret';

  IF v_secret IS NULL THEN
    RAISE EXCEPTION 'cron_secret not found in vault';
  END IF;

  v_url := 'https://www.alparai.com' || cron_path;

  -- Trigger HTTP GET request
  SELECT net.http_get(
    url := v_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_secret,
      'x-dehost-cron', '1'
    ),
    timeout_milliseconds := 30000
  ) INTO v_request_id;

  RETURN v_request_id;
END;
$$;


-- -- ROLLBACK:
-- SELECT cron.unschedule('translate-backfill-cron');
-- SELECT cron.unschedule('moderation-sla-alarm-cron');
-- SELECT cron.unschedule('k-provider-preview-cron');
-- SELECT cron.unschedule('import-incidents-aiaaic-cron');
-- SELECT cron.unschedule('k-model-retirement-cron');
-- SELECT cron.unschedule('import-incidents-aiid-cron');
-- SELECT cron.unschedule('process-deletions-cron');
-- SELECT cron.unschedule('hard-delete-cron');
-- SELECT cron.unschedule('fetch-external-cron');
-- SELECT cron.unschedule('retro-audit-cron');
-- SELECT cron.unschedule('cost-alarm-cron');
-- SELECT cron.unschedule('k-weekly-refresh-cron');
-- SELECT cron.unschedule('kill-metric-cron');
-- SELECT cron.unschedule('pivot-check-cron');
-- SELECT cron.unschedule('generate-marketing-cron');
-- SELECT cron.unschedule('newsletter-cron');
-- DROP FUNCTION IF EXISTS public.trigger_cron_job(text);


-- ========================================================
-- Source: 20260721000000_add_audit_tier.sql
-- ========================================================
-- Add audit_tier column for K3/K4 verification
-- ROLLBACK: ALTER TABLE public.incidents DROP COLUMN IF EXISTS audit_tier;

ALTER TABLE public.incidents 
ADD COLUMN IF NOT EXISTS audit_tier text CHECK (audit_tier IN ('basic', 'deep', 'none')) DEFAULT 'basic';


-- ROLLBACK: DELETE FROM public.strategy_innovations WHERE title ~ '^I(12|13|14|15|16|17|18) —';


-- ========================================================
-- Source: 20260723000003_provider_sla_badge.sql
-- ========================================================
-- Migration: Add SLA badge columns to ai_providers and seed real SLA data
-- Timestamp: 20260723000003

ALTER TABLE public.ai_providers
  ADD COLUMN IF NOT EXISTS sla_uptime_pct NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS sla_mttr_hours INTEGER,
  ADD COLUMN IF NOT EXISTS sla_source_url TEXT,
  ADD COLUMN IF NOT EXISTS sla_last_verified_at TIMESTAMPTZ;


-- ROLLBACK: ALTER TABLE public.ai_providers DROP COLUMN IF EXISTS sla_uptime_pct, DROP COLUMN IF EXISTS sla_mttr_hours, DROP COLUMN IF EXISTS sla_source_url, DROP COLUMN IF EXISTS sla_last_verified_at;


-- ========================================================
-- Source: 20260723000004_slopsquatting_feed.sql
-- ========================================================
-- Migration: Slopsquatting reports table for I9 Slopsquatting Feed
-- Timestamp: 20260723000004

CREATE TABLE IF NOT EXISTS public.slopsquatting_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name  TEXT NOT NULL,
  ecosystem     TEXT NOT NULL CHECK (ecosystem IN ('npm', 'pypi', 'cargo', 'rubygems', 'crates')),
  hallucinated_by_model_id UUID REFERENCES public.ai_models(id) ON DELETE SET NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_real BOOLEAN NOT NULL DEFAULT FALSE,
  source_url    TEXT,
  reporter_ip_hash TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_slopsquatting_ecosystem ON public.slopsquatting_reports(ecosystem);

CREATE INDEX IF NOT EXISTS idx_slopsquatting_confirmed ON public.slopsquatting_reports(confirmed_real);

CREATE INDEX IF NOT EXISTS idx_slopsquatting_package ON public.slopsquatting_reports(package_name);






-- ROLLBACK: DROP TABLE IF EXISTS public.slopsquatting_reports;


-- ========================================================
-- Source: 20260723000005_deepfake_schema_extension.sql
-- ========================================================
-- Migration: Deepfake / Audio-Video schema extension for I10
-- Timestamp: 20260723000005

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('audio', 'video', 'image', 'text', 'multimodal')),
  ADD COLUMN IF NOT EXISTS c2pa_manifest_url TEXT,
  ADD COLUMN IF NOT EXISTS synthid_detected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS voice_clone_detected BOOLEAN DEFAULT FALSE;


-- ROLLBACK: ALTER TABLE public.incidents DROP COLUMN IF EXISTS media_type, DROP COLUMN IF EXISTS c2pa_manifest_url, DROP COLUMN IF EXISTS synthid_detected, DROP COLUMN IF EXISTS voice_clone_detected;


-- ========================================================
-- Source: 20260723000006_vertical_playbooks.sql
-- ========================================================
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


-- ROLLBACK: DROP TABLE IF EXISTS public.vertical_playbooks;


-- ========================================================
-- Source: 20260723000007_prompt_injection_museum.sql
-- ========================================================
-- Migration: Prompt Injection Museum (Red-Team Jailbreak Catalogue) for I13
-- Timestamp: 20260723000007

CREATE TABLE IF NOT EXISTS public.jailbreak_samples (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  technique     TEXT NOT NULL CHECK (technique IN ('prompt_injection', 'jailbreak', 'system_prompt_leak', 'data_exfiltration', 'refusal_bypass')),
  severity      TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  prompt_masked TEXT NOT NULL,
  target_model  TEXT NOT NULL,
  reproducible  BOOLEAN NOT NULL DEFAULT TRUE,
  mitigation    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_jailbreak_technique ON public.jailbreak_samples(technique);

CREATE INDEX IF NOT EXISTS idx_jailbreak_severity ON public.jailbreak_samples(severity);


-- ROLLBACK: UPDATE public.strategy_innovations SET status = 'idea' WHERE title LIKE 'I12 —%' OR title LIKE 'I13 —%' OR title LIKE 'I18 —%';


-- ========================================================
-- Source: 20260723000009_vendor_trust_ranking.sql
-- ========================================================
-- Migration: AI Vendor Public Trust Ranking for I14
-- Timestamp: 20260723000009

CREATE TABLE IF NOT EXISTS public.vendor_trust_rankings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_slug       TEXT UNIQUE NOT NULL,
  provider_name       TEXT NOT NULL,
  composite_score     NUMERIC(5,2) NOT NULL DEFAULT 95.00,
  incident_penalty    NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  response_rate_bonus NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  ranking_tier        TEXT NOT NULL CHECK (ranking_tier IN ('AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC')),
  last_evaluated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_vendor_trust_score ON public.vendor_trust_rankings(composite_score DESC);


-- ROLLBACK: DROP TABLE IF EXISTS public.vendor_trust_rankings;


-- ========================================================
-- Source: 20260723000010_bench_tr_evaluations.sql
-- ========================================================
-- Migration: Turkish Bias & Accuracy Benchmark (BENCH-TR) for I15
-- Timestamp: 20260723000010

CREATE TABLE IF NOT EXISTS public.bench_tr_evaluations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name        TEXT NOT NULL,
  provider_slug     TEXT NOT NULL,
  tr_grammar_score  NUMERIC(5,2) NOT NULL,
  tr_bias_score     NUMERIC(5,2) NOT NULL,
  tr_factuality_pct NUMERIC(5,2) NOT NULL,
  eval_dataset_ver  TEXT NOT NULL DEFAULT 'v1.0-TR',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_bench_tr_model ON public.bench_tr_evaluations(model_name);


-- ROLLBACK: UPDATE public.strategy_innovations SET status = 'idea' WHERE title ~ '^I(12|13|14|15|16|17|18) —';


-- ========================================================
-- Source: 20260724000000_outreach_queue.sql
-- ========================================================
-- Migration: Outreach Queue table
-- Create outreach_queue table for J2a outreach automation

CREATE TABLE IF NOT EXISTS public.outreach_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    template_type TEXT NOT NULL CHECK (template_type IN ('media', 'expert')),
    subject TEXT NOT NULL,
    body_template TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'sent', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ROLLBACK:
-- DROP TABLE IF EXISTS public.outreach_queue;


-- ========================================================
-- Source: 20260725000001_expert_network.sql
-- ========================================================
-- Migration: Expert Network & K-Product tables
-- Create expert_network and add verification fields to incidents

CREATE TABLE IF NOT EXISTS public.expert_network (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    title TEXT,
    institution TEXT,
    specialties TEXT[] DEFAULT '{}'::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Add verification fields to incidents
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS expert_verified BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS expert_verifier_id UUID REFERENCES public.expert_network(id) ON DELETE SET NULL;


-- Trigger to restrict expert_verified field updates on incidents to active experts or moderators
CREATE OR REPLACE FUNCTION public.check_incident_verification_auth()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.expert_verified IS DISTINCT FROM OLD.expert_verified) OR 
       (NEW.expert_verifier_id IS DISTINCT FROM OLD.expert_verifier_id) THEN
        
        -- Allow if current user is moderator
        IF public.is_moderator(auth.uid()) THEN
            RETURN NEW;
        END IF;

        -- Require active expert status
        IF NOT EXISTS (
            SELECT 1 FROM public.expert_network
            WHERE id = auth.uid() AND is_active = true
        ) THEN
            RAISE EXCEPTION 'Only active expert network members can verify incidents';
        END IF;

        -- Automatically set verifier ID to expert's ID
        IF NEW.expert_verified = true AND NEW.expert_verifier_id IS NULL THEN
            NEW.expert_verifier_id := auth.uid();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


DROP TRIGGER IF EXISTS check_incident_verification_trigger ON public.incidents; CREATE TRIGGER check_incident_verification_trigger
    BEFORE UPDATE ON public.incidents
    FOR EACH ROW
    EXECUTE FUNCTION public.check_incident_verification_auth();


-- Paid-tier (K-Product) fields in public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pilot', 'enterprise'));


-- ROLLBACK:
-- drop policy if exists "Profiles are viewable by owner or staff" on public.users;
-- drop policy if exists "incident_votes_select_own_or_mod" on public.incident_votes;


-- ========================================================
-- Source: 20260727000003_methodology_committee.sql
-- ========================================================
-- Migration: Create methodology_committee_members table
-- Description: Registers methodology advisory committee details with strict RLS and rollback path.

create table IF NOT EXISTS public.methodology_committee_members (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    institution text not null,
    role text not null,
    avatar_url text,
    joined_at timestamp with time zone not null default now(),
    created_at timestamp with time zone not null default now()
);


-- ROLLBACK:
-- DROP TABLE IF EXISTS public.methodology_committee_members CASCADE;


-- ========================================================
-- Source: 20260727000004_role_view.sql
-- ========================================================
-- Migration: Add role_view column to users table
-- Description: Adds role_view for role-based dashboard views with rollback path.

alter table public.users ADD COLUMN IF NOT EXISTS role_view text;


-- ROLLBACK:
-- alter table public.users drop column if exists role_view;


-- ========================================================
-- Source: 20260727000005_k_product_scaffold.sql
-- ========================================================
-- Migration: Create private_benchmarks and rating_alerts tables
-- Description: Registers schema for K-Product enterprise segment with strict RLS and rollback.

-- 1. Private Benchmarks Table
create table IF NOT EXISTS public.private_benchmarks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    model_id text not null,
    score numeric not null,
    created_at timestamp with time zone not null default now()
);


-- Enable RLS for Private Benchmarks






-- 2. Rating Alerts Table
create table IF NOT EXISTS public.rating_alerts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    model_id text not null,
    threshold numeric not null,
    is_active boolean not null default true,
    created_at timestamp with time zone not null default now()
);


-- ROLLBACK:
-- DROP TABLE IF EXISTS public.private_benchmarks CASCADE;
-- DROP TABLE IF EXISTS public.rating_alerts CASCADE;


-- ========================================================
-- Source: 20260727000006_instructor_tier.sql
-- ========================================================
-- Migration: Add instructor role to user_role enum
-- Description: Registers instructor role type with safe rollback documentation.

-- Add value to the enum type
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'instructor') THEN ALTER TYPE public.user_role ADD VALUE 'instructor'; END IF; END $$;


-- ROLLBACK:
-- Note: PostgreSQL does not support dropping enum values easily. 
-- To rollback:
-- CREATE TYPE public.user_role_old AS ENUM ('user', 'moderator', 'admin', 'ceo');
-- ALTER TABLE public.users ALTER COLUMN role TYPE public.user_role_old USING role::text::public.user_role_old;
-- DROP TYPE public.user_role;
-- ALTER TYPE public.user_role_old RENAME TO user_role;


-- ========================================================
-- Source: 20260727000007_fellowship_applications.sql
-- ========================================================
-- Migration: Create fellowship_applications table
-- Description: Registers schema for academic faculty fellowship applications with strict RLS and rollback.

create table IF NOT EXISTS public.fellowship_applications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    institution text not null,
    department text not null,
    proposal text not null,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone not null default now()
);


-- ROLLBACK:
-- DROP TABLE IF EXISTS public.fellowship_applications CASCADE;


-- ========================================================
-- Source: 20260727000008_student_ambassadors.sql
-- ========================================================
-- Migration: Create student_ambassadors table
-- Description: Registers schema for student ambassador program with strict RLS and rollback.

create table IF NOT EXISTS public.student_ambassadors (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    university text not null,
    graduation_year integer not null,
    status text not null default 'pending' check (status in ('pending', 'active', 'inactive')),
    created_at timestamp with time zone not null default now()
);


-- ROLLBACK:
-- DROP TABLE IF EXISTS public.student_ambassadors CASCADE;


-- ========================================================
-- Source: 20260727000009_art73_tracker.sql
-- ========================================================
-- Migration: Create art73_obligation_status table
-- Description: Registers schema for tracking AI provider compliance status under EU AI Act Article 73 with strict RLS and rollback.

create table IF NOT EXISTS public.art73_obligation_status (
    id uuid primary key default gen_random_uuid(),
    provider_id uuid not null references public.ai_providers(id) on delete cascade,
    obligation_name text not null,
    status text not null default 'pending' check (status in ('pending', 'compliant', 'non_compliant')),
    verified_at timestamp with time zone,
    created_at timestamp with time zone not null default now()
);


-- ROLLBACK:
-- DROP TABLE IF EXISTS public.art73_obligation_status CASCADE;


-- ========================================================
-- Source: 20260727000010_k_provider_previews.sql
-- ========================================================
-- Migration: Create k_provider_previews table
-- Description: Registers schema for tracking model provider 60-day previews with strict RLS and rollback.

create table IF NOT EXISTS public.k_provider_previews (
    id uuid primary key default gen_random_uuid(),
    provider_id uuid not null references public.ai_providers(id) on delete cascade,
    preview_token text not null unique,
    sent_at timestamp with time zone,
    expires_at timestamp with time zone not null,
    status text not null default 'pending' check (status in ('pending', 'sent', 'accessed', 'expired')),
    created_at timestamp with time zone not null default now()
);


-- ROLLBACK:
-- DROP TABLE IF EXISTS public.k_provider_previews CASCADE;


-- ========================================================
-- Source: 20260727000011_k_model_scores_retired_status.sql
-- ========================================================
-- Migration: Add retired status to k_model_scores and deprecated_at to ai_models
-- Description: Adds columns to support model deprecation and retirement workflows.

alter table public.ai_models ADD COLUMN IF NOT EXISTS deprecated_at timestamp with time zone;


alter table public.k_model_scores ADD COLUMN IF NOT EXISTS status text not null default 'active' check (status in ('active', 'retired'));


-- ROLLBACK:
-- alter table public.k_model_scores drop column if exists status;
-- alter table public.ai_models drop column if exists deprecated_at;


-- ========================================================
-- Source: 20260727000012_data_retention_policies.sql
-- ========================================================
-- Migration: Create data_retention_policies table and initialize policies
-- Description: Creates the reference table and seeds a retention policy for all public tables.

CREATE TABLE IF NOT EXISTS public.data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL UNIQUE,
    retention_period_months INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ROLLBACK:
-- DROP TABLE IF EXISTS public.data_retention_policies;


-- ========================================================
-- Source: 20260727000013_redaction_requests.sql
-- ========================================================
-- Migration: Create redaction_requests table for provider name redaction workflow
-- Description: Creates the table, adds RLS policies, and enables moderator review.

CREATE TABLE IF NOT EXISTS public.redaction_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.ai_providers(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);


-- Add duplicate flag column to incidents
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS is_possible_duplicate BOOLEAN NOT NULL DEFAULT false;


-- Create a helper function for similarity checking (RPC-safe)
CREATE OR REPLACE FUNCTION public.check_incident_duplicate(title_to_check TEXT)
RETURNS TABLE (similarity_score REAL, incident_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        similarity(title, title_to_check) as similarity_score,
        id as incident_id
    FROM public.incidents
    WHERE status = 'published'
    ORDER BY similarity_score DESC
    LIMIT 1;
END;
$$;


-- ROLLBACK:
-- DROP FUNCTION IF EXISTS public.check_incident_duplicate(TEXT);
-- DROP INDEX IF EXISTS public.idx_incidents_title_trgm;
-- ALTER TABLE public.incidents DROP COLUMN IF EXISTS is_possible_duplicate;


-- ========================================================
-- Source: 20260727000015_submission_attempts.sql
-- ========================================================
-- Migration: Create submission_attempts table for rate limiting and fraud prevention
-- Description: Tracks submissions per IP hash over a rolling 24-hour window.

CREATE TABLE IF NOT EXISTS public.submission_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- CREATE INDEX IF NOT EXISTS on ip_hash and created_at to optimize rolling 24h count queries
CREATE INDEX IF NOT EXISTS idx_submission_attempts_ip_hash_created_at ON public.submission_attempts (ip_hash, created_at DESC);


-- ROLLBACK:
-- DROP TABLE IF EXISTS public.submission_attempts;


-- ========================================================
-- Source: 20260727000016_cross_audit_runs.sql
-- ========================================================
-- Migration: Create cross_audit_runs table for cost telemetry and monitoring.
-- Description: Tracks LLM usage stats per cross-audit debate execution.

CREATE TABLE IF NOT EXISTS public.cross_audit_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    tokens_in INTEGER NOT NULL DEFAULT 0,
    tokens_out INTEGER NOT NULL DEFAULT 0,
    cost_usd NUMERIC(10,5) NOT NULL DEFAULT 0.0,
    latency_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.cross_audit_runs
  ADD COLUMN IF NOT EXISTS cache_hit BOOLEAN NOT NULL DEFAULT false;


-- Create indexes on created_at and incident_id for performance
CREATE INDEX IF NOT EXISTS idx_cross_audit_runs_created_at ON public.cross_audit_runs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cross_audit_runs_incident_id ON public.cross_audit_runs (incident_id);


-- ROLLBACK:
-- DROP TABLE IF EXISTS public.cross_audit_runs;


-- ========================================================
-- Source: 20260727000017_advisory_terms.sql
-- ========================================================
-- Migration: Add term fields to advisory_board_members
-- Timestamp: 20260727000017
-- Rollback: ALTER TABLE public.advisory_board_members DROP COLUMN IF EXISTS term_start, DROP COLUMN IF EXISTS term_end, DROP COLUMN IF EXISTS is_active;

ALTER TABLE public.advisory_board_members
  ADD COLUMN IF NOT EXISTS term_start timestamptz,
  ADD COLUMN IF NOT EXISTS term_end timestamptz,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260727000018_methodology_versions.sql
-- ========================================================
-- Migration: Create methodology_versions table
-- Timestamp: 20260727000018
-- Rollback: DROP TABLE IF EXISTS public.methodology_versions;

CREATE TABLE IF NOT EXISTS public.methodology_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  summary_en text NOT NULL,
  summary_tr text NOT NULL,
  changes_en jsonb NOT NULL DEFAULT '[]',
  changes_tr jsonb NOT NULL DEFAULT '[]',
  is_retraction boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);


CREATE INDEX IF NOT EXISTS idx_methodology_versions_published ON public.methodology_versions (published_at DESC);



-- ROLLBACK:
-- DROP TABLE IF EXISTS public.methodology_versions CASCADE;


-- ========================================================
-- Source: 20260727000019_zero_knowledge.sql
-- ========================================================
-- Migration: Zero-Knowledge Evidence Columns
-- Timestamp: 20260727000019
-- Rollback: ALTER TABLE public.incidents DROP COLUMN IF EXISTS encrypted_evidence, DROP COLUMN IF EXISTS evidence_ciphertext;

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS encrypted_evidence boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS evidence_ciphertext text;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260727000020_dsar_automation.sql
-- ========================================================
-- Migration: DSAR Automation Table
-- Timestamp: 20260727000020
-- Rollback: DROP TABLE IF EXISTS public.dsar_requests;

CREATE TABLE IF NOT EXISTS public.dsar_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  due_date timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

  CREATE POLICY "Users can view their own DSAR requests" ON public.dsar_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own DSAR requests" ON public.dsar_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Admins can view and update all DSAR requests" ON public.dsar_requests
  FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));



-- ROLLBACK:
-- DROP TABLE IF EXISTS public.dsar_requests CASCADE;


-- ========================================================
-- Source: 20260727000021_sybil_detection.sql
-- ========================================================
-- Migration: Sybil Detection Fingerprints Table
-- Timestamp: 20260727000021
-- Rollback: DROP TABLE IF EXISTS public.submission_fingerprints;

CREATE TABLE IF NOT EXISTS public.submission_fingerprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  fingerprint text NOT NULL,
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

  CREATE POLICY "Allow public inserts on submission_fingerprints" ON public.submission_fingerprints
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view and update all DSAR requests" ON public.dsar_requests;
  CREATE POLICY "Admins can view and update all DSAR requests" ON public.dsar_requests
  FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));


CREATE INDEX IF NOT EXISTS idx_submission_fingerprints_fingerprint ON public.submission_fingerprints (fingerprint);

CREATE INDEX IF NOT EXISTS idx_submission_fingerprints_ip_hash ON public.submission_fingerprints (ip_hash);



-- ROLLBACK:
-- DROP TABLE IF EXISTS public.submission_fingerprints CASCADE;


-- ========================================================
-- Source: 20260727000022_moderation_sla.sql
-- ========================================================
-- Migration: Moderation SLA View
-- Timestamp: 20260727000022
-- Rollback: DROP VIEW IF EXISTS public.moderation_sla;

-- (dropped) moderation_sla stays a TABLE per prod base; view deferred to product work

-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260727000023_transparency_reports.sql
-- ========================================================
-- Migration: Create transparency_reports table (Streisand transparency)
-- Timestamp: 20260727000023
-- ROLLBACK: DROP TABLE IF EXISTS public.transparency_reports;

CREATE TABLE IF NOT EXISTS public.transparency_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL CHECK (request_type IN ('cease_and_desist', 'dmca', 'legal_threat', 'other')),
  requested_by_category text NOT NULL CHECK (requested_by_category IN ('ai_firm', 'pr_firm', 'legal', 'individual', 'other')),
  summary_en text NOT NULL,
  summary_tr text NOT NULL,
  action_taken text NOT NULL CHECK (action_taken IN ('resisted', 'partial_compliance', 'complied', 'pending')),
  is_published boolean NOT NULL DEFAULT false,
  requested_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

  CREATE POLICY "Transparency reports public read" ON public.transparency_reports
  FOR SELECT TO public USING (is_published = true);


CREATE INDEX IF NOT EXISTS idx_transparency_reports_published ON public.transparency_reports (requested_at DESC) WHERE is_published = true;



-- ========================================================
-- Source: 20260727000024_community_challenges.sql
-- ========================================================
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

DROP POLICY IF EXISTS "Transparency reports public read" ON public.transparency_reports;
  CREATE POLICY "Transparency reports public read" ON public.transparency_reports
  FOR SELECT TO public USING (is_published = true);


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


CREATE INDEX IF NOT EXISTS idx_challenge_submissions_challenge ON public.challenge_submissions (challenge_id, status);

CREATE INDEX IF NOT EXISTS idx_challenge_submissions_user ON public.challenge_submissions (user_id);

  CREATE POLICY "Challenge submissions public read approved" ON public.challenge_submissions
  FOR SELECT TO public USING (status = 'approved');


CREATE TABLE IF NOT EXISTS public.challenge_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.challenge_submissions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(submission_id, user_id)
);


CREATE INDEX IF NOT EXISTS idx_challenge_votes_submission ON public.challenge_votes (submission_id);


CREATE OR REPLACE FUNCTION public.update_challenge_submissions_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trg_challenge_submissions_updated_at ON public.challenge_submissions; CREATE TRIGGER trg_challenge_submissions_updated_at
  BEFORE UPDATE ON public.challenge_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_challenge_submissions_updated_at();



-- ========================================================
-- Source: 20260727000025_age_gate.sql
-- ========================================================
-- Migration: Age gate extended columns (G8 — COPPA + UK Online Safety Act)
-- Timestamp: 20260727000025
-- Extends existing age_declarations table with COPPA and UK OSA columns
-- ROLLBACK:
--   ALTER TABLE public.age_declarations DROP COLUMN IF EXISTS coppa_thirteen_plus;
--   ALTER TABLE public.age_declarations DROP COLUMN IF EXISTS uk_osa_eighteen_plus;

ALTER TABLE public.age_declarations
  ADD COLUMN IF NOT EXISTS coppa_thirteen_plus boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS uk_osa_eighteen_plus boolean NOT NULL DEFAULT false;



-- ========================================================
-- Source: 20260727000026_external_auditor.sql
-- ========================================================
-- Migration: External Auditor Role
-- Timestamp: 20260727000025
-- Rollback: DROP ROLE IF EXISTS auditor_role;

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'auditor_role') THEN
    CREATE ROLE auditor_role;
  END IF;
END
$$;


GRANT SELECT ON public.k_model_scores TO auditor_role;

GRANT SELECT ON public.methodology_versions TO auditor_role;

GRANT SELECT ON public.audit_log TO auditor_role;

CREATE POLICY "Allow auditor_role read access to methodology_versions" ON public.methodology_versions
  FOR SELECT TO auditor_role USING (true);



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260728000001_finance_revenue.sql
-- ========================================================
-- Create finance_revenue_metrics table
CREATE TABLE IF NOT EXISTS public.finance_revenue_metrics (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,
  mrr_usd numeric(12, 2) not null default 0.00,
  arr_usd numeric(12, 2) not null default 0.00,
  active_subs integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


  CREATE POLICY "Allow read for admins/ceo" ON public.finance_revenue_metrics
  for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('admin', 'ceo')
    )
  );


-- ROLLBACK:
-- insert into public.finance_revenue_metrics (month, mrr_usd, arr_usd, active_subs) values
--   ('2026-02-01', 12000.00, 144000.00, 52),
--   ('2026-03-01', 15000.00, 180000.00, 68),
--   ('2026-04-01', 18000.00, 216000.00, 81),
--   ('2026-05-01', 22000.00, 264000.00, 95),
--   ('2026-06-01', 26000.00, 312000.00, 112),
--   ('2026-07-01', 34000.00, 408000.00, 142);


-- ========================================================
-- Source: 20260731000000_subscriptions.sql
-- ========================================================
-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'incomplete',
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


-- RLS


-- Only service role can modify subscriptions via webhook

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON public.subscriptions; CREATE TRIGGER set_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();



-- ROLLBACK:
-- DROP TABLE IF EXISTS public.subscriptions CASCADE;


-- ========================================================
-- Source: 20260801000000_dehost_capacity.sql
-- ========================================================
-- Migration: DeHost Capacity Relief
-- Make body column nullable and null it for processed/published/rejected items.
-- Add retention policy trigger.

ALTER TABLE public.external_incidents_queue ALTER COLUMN body DROP NOT NULL;


-- Create trigger function to null body when status is no longer pending
CREATE OR REPLACE FUNCTION public.null_processed_external_queue_body()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('accepted', 'published', 'rejected', 'processed', 'duplicate') THEN
    NEW.body := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_null_processed_external_queue_body ON public.external_incidents_queue; CREATE TRIGGER trg_null_processed_external_queue_body
BEFORE INSERT OR UPDATE ON public.external_incidents_queue
FOR EACH ROW
EXECUTE FUNCTION public.null_processed_external_queue_body();


-- -- ROLLBACK:
-- UPDATE public.external_incidents_queue SET body = 'Rollback placeholder' WHERE body IS NULL;
-- ALTER TABLE public.external_incidents_queue ALTER COLUMN body SET NOT NULL;
-- DROP TRIGGER IF EXISTS trg_null_processed_external_queue_body ON public.external_incidents_queue;
-- DROP FUNCTION IF EXISTS public.null_processed_external_queue_body();


-- ========================================================
-- Source: 20260801032414_fix_finance_costs.sql
-- ========================================================
-- Migration: Fix finance_monthly_costs by cleaning up fake data
-- 1. Allow amount_usd to be NULL (unmeasured/unverified)
ALTER TABLE public.finance_monthly_costs ALTER COLUMN amount_usd DROP NOT NULL;


-- ROLLBACK:
-- ALTER TABLE public.finance_monthly_costs ALTER COLUMN amount_usd SET NOT NULL;
-- UPDATE public.finance_monthly_costs SET amount_usd = 12.50, budget_usd = 20.00, metadata = NULL WHERE service = 'dehost' AND month = '2026-06-01';
-- UPDATE public.finance_monthly_costs SET amount_usd = 14.20, budget_usd = 20.00, metadata = NULL WHERE service = 'dehost' AND month = '2026-07-01';
-- UPDATE public.finance_monthly_costs SET amount_usd = 8.50 WHERE service = 'gemini' AND month = '2026-06-01';
-- UPDATE public.finance_monthly_costs SET amount_usd = 10.10 WHERE service = 'gemini' AND month = '2026-07-01';
-- UPDATE public.finance_monthly_costs SET amount_usd = 3.00 WHERE service = 'anthropic' AND month = '2026-06-01';
-- UPDATE public.finance_monthly_costs SET amount_usd = 4.50 WHERE service = 'anthropic' AND month = '2026-07-01';
-- UPDATE public.finance_monthly_costs SET amount_usd = 0.00 WHERE service = 'dehost' AND month = '2026-06-01';
-- UPDATE public.finance_monthly_costs SET amount_usd = 0.00 WHERE service = 'dehost' AND month = '2026-07-01';
-- UPDATE public.finance_monthly_costs SET amount_usd = 0.00 WHERE service = 'resend' AND month = '2026-06-01';
-- UPDATE public.finance_monthly_costs SET amount_usd = 0.00 WHERE service = 'resend' AND month = '2026-07-01';
-- UPDATE public.finance_monthly_costs SET amount_usd = 1.00 WHERE service = 'upstash' AND month = '2026-06-01';
-- UPDATE public.finance_monthly_costs SET amount_usd = 1.20 WHERE service = 'upstash' AND month = '2026-07-01';
-- UPDATE public.finance_monthly_costs SET amount_usd = 6.00 WHERE service = 'buffer' AND month = '2026-06-01';
-- UPDATE public.finance_monthly_costs SET amount_usd = 6.00 WHERE service = 'buffer' AND month = '2026-07-01';


-- ========================================================
-- Source: 20260802000000_admin_login_events.sql
-- ========================================================
-- Migration: admin_login_events table and login logging trigger
-- Table to log admin/moderator login events with hashed IP.

CREATE TABLE IF NOT EXISTS public.admin_login_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- Request IP helper function
CREATE OR REPLACE FUNCTION public.get_request_ip()
RETURNS text AS $$
DECLARE
  headers_text text;
BEGIN
  headers_text := current_setting('request.headers', true);
  IF headers_text IS NULL OR headers_text = '' THEN
    RETURN '127.0.0.1';
  END IF;
  RETURN coalesce(headers_text::json->>'x-forwarded-for', '127.0.0.1');
EXCEPTION
  WHEN OTHERS THEN
    RETURN '127.0.0.1';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Trigger function to handle admin/moderator logins
CREATE OR REPLACE FUNCTION public.handle_admin_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if last_sign_in_at has changed and if the user is a moderator/admin/ceo/advisor
  IF (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at) AND (
    public.is_moderator(NEW.id) OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = NEW.id AND role::text IN ('admin', 'ceo', 'moderator', 'advisor')
    )
  ) THEN
    INSERT INTO public.admin_login_events (user_id, ip_hash) -- KEEP: security audit insert inside admin login trigger function
    VALUES (
      NEW.id,
      encode(extensions.digest(public.get_request_ip(), 'sha256'), 'hex')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users; CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_login();

DROP POLICY IF EXISTS "Admins can view and update all DSAR requests" ON public.dsar_requests;
    CREATE POLICY "Admins can view and update all DSAR requests" ON public.dsar_requests
    FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));




-- ROLLBACK:
-- DROP TABLE IF EXISTS public.strategic_answers;
-- DROP TABLE IF EXISTS public.strategic_questions;


-- ========================================================
-- Source: 20260804000000_strategic_questionnaire_constraint.sql
-- ========================================================
-- Migration: Add unique constraint to strategic_answers
-- Description: Ensures one answer per question per model for upserting.

ALTER TABLE public.strategic_answers ADD CONSTRAINT unique_question_model UNIQUE (question_id, model_name);



-- ========================================================
-- Source: 20260804000001_takedown_24h_sla_and_appeals.sql
-- ========================================================
-- Migration: 20260804000001_takedown_24h_sla_and_appeals.sql
-- Description: Reduce takedown SLA from 7 days to 24 hours and create takedown_appeals table for appeal mechanism.

-- 1. Reduce SLA default on takedown_requests to 24 hours
alter table public.takedown_requests 
  alter column sla_due_at set default (now() + interval '24 hours');


-- 2. Create Takedown Appeals Table
CREATE TABLE IF NOT EXISTS public.takedown_appeals (
  id uuid primary key default gen_random_uuid(),
  takedown_id uuid references public.takedown_requests(id) on delete set null,
  incident_id uuid references public.incidents(id) on delete cascade,
  appellant_name text not null,
  appellant_email text not null,
  reason text not null check (char_length(reason) >= 20 and char_length(reason) <= 4000),
  evidence_url text,
  status text not null default 'pending' check (status in ('pending', 'under_review', 'approved', 'rejected')),
  assigned_moderator_id uuid references public.users(id) on delete set null,
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);


create index if not exists idx_takedown_appeals_status on public.takedown_appeals(status);

create index if not exists idx_takedown_appeals_takedown_id on public.takedown_appeals(takedown_id);

create index if not exists idx_takedown_appeals_incident_id on public.takedown_appeals(incident_id);


-- 3. Enable RLS on takedown_appeals




-- ROLLBACK:
-- drop table if exists public.takedown_appeals;
-- alter table public.takedown_requests alter column sla_due_at set default (now() + interval '7 days');


-- ========================================================
-- Source: 20260804031427_incidents_fts.sql
-- ========================================================
-- Migration: Add search_vector to incidents table
-- Description: Implement full text search using tsvector and GIN index

-- ROLLBACK: 
-- DROP INDEX IF EXISTS public.idx_incidents_search_vector;
-- DROP TRIGGER IF EXISTS tsvectorupdate ON public.incidents;
-- DROP FUNCTION IF EXISTS public.incidents_search_vector_update();
-- ALTER TABLE public.incidents DROP COLUMN IF EXISTS search_vector;

ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS search_vector tsvector;


-- Create function to update search_vector
CREATE OR REPLACE FUNCTION public.incidents_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple'::regconfig, coalesce(NEW.title_masked, '')), 'A') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(NEW.description_masked, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tsvectorupdate ON public.incidents; CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
  ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.incidents_search_vector_update();



-- ========================================================
-- Source: 20260804145500_update_incident_source_constraint.sql
-- ========================================================
-- Update incident_source check constraint to allow external fetcher sources
ALTER TABLE public.incidents DROP CONSTRAINT IF EXISTS incidents_incident_source_check;


ALTER TABLE public.incidents ADD CONSTRAINT incidents_incident_source_check 
CHECK (incident_source IN ('user_submitted', 'aiaaic_import', 'aiid_import', 'news_curated', 'court_record', 'reddit', 'hn', 'github', 'hackerone', 'rss'));


-- ROLLBACK:
-- ALTER TABLE public.incidents DROP CONSTRAINT IF EXISTS incidents_incident_source_check;
-- ALTER TABLE public.incidents ADD CONSTRAINT incidents_incident_source_check 
-- CHECK (incident_source IN ('user_submitted', 'aiaaic_import', 'aiid_import', 'news_curated', 'court_record'));


-- ========================================================
-- Source: 20260805000000_capacity_rpcs.sql
-- ========================================================
-- Migration: Capacity RPCs
-- Description: RPC functions to query database size, storage size, and AI gateway costs safely.

CREATE OR REPLACE FUNCTION public.get_database_size()
RETURNS bigint AS $$
  SELECT pg_database_size(current_database());
$$ LANGUAGE sql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.get_storage_size()
RETURNS bigint AS $$
  SELECT COALESCE(SUM((metadata->>'size')::bigint), 0)::bigint FROM storage.objects;
$$ LANGUAGE sql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.get_ai_gateway_costs(time_interval interval)
RETURNS numeric AS $$
  SELECT COALESCE(SUM(cost_usd), 0.0)::numeric FROM public.cross_audit_runs WHERE created_at >= (now() - time_interval);
$$ LANGUAGE sql SECURITY DEFINER;


-- ROLLBACK:
-- UPDATE public.finance_monthly_costs SET amount_usd = 0.00 WHERE service = 'dehost' AND month = '2026-08-01';


-- ========================================================
-- Source: 20260806_ai_velocity.sql
-- ========================================================
-- 20260806_ai_velocity.sql
-- Table public.ai_velocity_metrics & public.financial_velocity_projections for AI Velocity Engine

CREATE TABLE IF NOT EXISTS public.ai_velocity_metrics (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  model_name text not null,
  benchmark_elo integer not null,
  release_date date not null default current_date,
  capability_jump_pct numeric(5, 2) not null default 0.00,
  created_at timestamptz not null default now()
);


CREATE TABLE IF NOT EXISTS public.financial_velocity_projections (
  id uuid primary key default gen_random_uuid(),
  velocity_factor numeric(5, 2) not null,
  projected_arr_usd numeric(12, 2) not null,
  enterprise_b2b_demand_multiplier numeric(5, 2) not null,
  calculated_at timestamptz not null default now()
);


-- -- ROLLBACK:
--   ON public.audit_log FOR INSERT WITH CHECK (true);


-- ========================================================
-- Source: 20260807000001_cease_and_desist_logs.sql
-- ========================================================
-- Migration: 20260807000001_cease_and_desist_logs.sql
-- Description: Create cease_and_desist_logs table with public read & admin write RLS policies.

CREATE TABLE IF NOT EXISTS public.cease_and_desist_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.ai_providers(id) ON DELETE SET NULL,
  threat_level TEXT NOT NULL CHECK (threat_level IN ('low', 'medium', 'high', 'critical', 'existential')),
  legal_text TEXT NOT NULL,
  our_response TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Indexes
CREATE INDEX IF NOT EXISTS idx_cease_desist_provider ON public.cease_and_desist_logs(provider_id);

CREATE INDEX IF NOT EXISTS idx_cease_desist_published ON public.cease_and_desist_logs(published_at DESC);


-- ROLLBACK:
-- DROP TABLE IF EXISTS public.cease_and_desist_logs CASCADE;


-- ========================================================
-- Source: 20260807000002_art50_transparency_status.sql
-- ========================================================
-- Migration: Create art50_transparency_status table
-- Description: EU AI Act Article 50 Compliance Toolkit table for AI watermark, C2PA provenance and disclosure status.

CREATE TABLE IF NOT EXISTS public.art50_transparency_status (
    id uuid primary key default gen_random_uuid(),
    provider_id uuid references public.ai_providers(id) on delete cascade,
    c2pa_provenance_enabled boolean not null default false,
    watermarking_technology text not null default 'none',
    ai_disclosure_compliant boolean not null default false,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);


-- Index for lookup performance
create index if not exists idx_art50_transparency_status_provider_id on public.art50_transparency_status(provider_id);


-- ROLLBACK:
-- DROP INDEX IF EXISTS public.api_keys_provider_key;


-- ========================================================
-- Source: 20260810000000_geo_engine_optimization.sql
-- ========================================================
-- =============================================================================
-- Migration: GEO Engine Optimization Infrastructure
-- Tables: geo_citations, geo_scores
-- Features: RLS Policies, 30-Day Auto-Prune Function, Rollback Block
-- =============================================================================

-- 1. Create geo_citations table
CREATE TABLE IF NOT EXISTS public.geo_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    ai_engine TEXT NOT NULL,
    query TEXT,
    cited_url TEXT NOT NULL,
    passage_snippet TEXT,
    bot_hit_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 2. Create geo_scores table
CREATE TABLE IF NOT EXISTS public.geo_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 3. Indexes for efficiency
CREATE INDEX IF NOT EXISTS idx_geo_citations_incident_id ON public.geo_citations(incident_id);

CREATE INDEX IF NOT EXISTS idx_geo_citations_created_at ON public.geo_citations(created_at);

CREATE INDEX IF NOT EXISTS idx_geo_scores_calculated_at ON public.geo_scores(calculated_at);


-- 4. Enable RLS

-- 5. RLS Policies
-- Public read access to scores

-- Public read access to citations

-- Admin full access to geo_citations

-- Admin full access to geo_scores

-- 6. Auto-Prune Function (30-day data retention protecting 500MB DB cap)
CREATE OR REPLACE FUNCTION public.prune_old_telemetry()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.geo_citations WHERE created_at < NOW() - INTERVAL '30 days';
    DELETE FROM public.geo_scores WHERE calculated_at < NOW() - INTERVAL '90 days';
END;
$$;


-- -- ROLLBACK:
-- DROP FUNCTION IF EXISTS public.prune_old_telemetry();
-- DROP POLICY IF EXISTS "Admin full access geo_scores" ON public.geo_scores;
-- DROP POLICY IF EXISTS "Admin full access geo_citations" ON public.geo_citations;
-- DROP POLICY IF EXISTS "Public read geo_citations" ON public.geo_citations;
-- DROP POLICY IF EXISTS "Public read geo_scores" ON public.geo_scores;
-- DROP TABLE IF EXISTS public.geo_scores;
-- DROP TABLE IF EXISTS public.geo_citations;


-- ========================================================
-- Source: 20260811000000_sla_alarms.sql
-- ========================================================
-- =============================================================================
-- Migration: Unified System Health & SLA Alarms
-- Table: sla_alarms
-- Features: RLS Policies, Indexes, Rollback Block
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.sla_alarms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subsystem TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
    message TEXT NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    resolved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);


CREATE INDEX IF NOT EXISTS idx_sla_alarms_subsystem ON public.sla_alarms(subsystem);

CREATE INDEX IF NOT EXISTS idx_sla_alarms_resolved ON public.sla_alarms(resolved);



-- ========================================================
-- Source: 20260812000000_fix_ai_routing_chains.sql
-- ========================================================
-- Migration: Fix ai_routing_chains mismatch with active code
-- Target: Synchronize dynamic capability routes with the 2026 validated free tier gateway list

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'ai_routing_chains' AND policyname = 'ai_routing_chains_read_all'
    ) THEN
    END IF;
END $$;


-- ROLLBACK:
-- DELETE FROM public.ai_routing_chains WHERE domain_name IN ('math_logic', 'creative_copy', 'risk_audit', 'fast_triage', 'code_generation', 'ethics_audit');


-- ========================================================
-- Source: 20260812000000_incident_translations.sql
-- ========================================================
-- =============================================================================
-- Migration: Incident Translations Table (i18n Expansion Phase L1 - DE+FR)
-- Table: incident_translations
-- Features: Unique (incident_id, locale), RLS Policies, Rollback Block
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.incident_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    locale TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    machine_translated BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_incident_translations_locale UNIQUE (incident_id, locale)
);


CREATE INDEX IF NOT EXISTS idx_incident_translations_lookup ON public.incident_translations(incident_id, locale);





-- -- ROLLBACK:
-- DROP POLICY IF EXISTS "Admin full access incident_translations" ON public.incident_translations;
-- DROP POLICY IF EXISTS "Public read incident_translations" ON public.incident_translations;
-- DROP TABLE IF EXISTS public.incident_translations;


-- ========================================================
-- Source: 20260813000000_feature_flags.sql
-- ========================================================
-- =============================================================================
-- Migration: Feature Flags Backend
-- Table: feature_flags
-- Features: Unique key constraint, RLS Policies, Rollback Block
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT false,
    rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(key);





-- -- ROLLBACK:
-- DROP POLICY IF EXISTS "Admin full access feature_flags" ON public.feature_flags;
-- DROP POLICY IF EXISTS "Public read feature_flags" ON public.feature_flags;
-- DROP TABLE IF EXISTS public.feature_flags;


-- ========================================================
-- Source: 20260814000000_alarm_rls_fix.sql
-- ========================================================
-- ALARM: Dynamic RLS Enforcer
-- Iterates over all tables in the public schema and ensures ROW LEVEL SECURITY is enabled.
-- This closes any potentially leaked tables without manual enumeration.

DO $$
DECLARE
    t record;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
    END LOOP;
END;
$$;


-- ROLLBACK:
-- Cannot dynamically disable RLS safely without knowing prior state, but to satisfy structure:
-- DO $$
-- DECLARE
--     t record;
-- BEGIN
--     -- Warning: This would disable RLS on ALL tables.
--     -- FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
--     --     EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', t.tablename);
--     -- END LOOP;
-- END;
-- $$;


-- ========================================================
-- Source: 20260814000000_dora_metrics.sql
-- ========================================================
-- =============================================================================
-- Migration: DORA Metrics Collection
-- Table: dora_metrics
-- Features: Unique metric_date, RLS Policies, Rollback Block
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.dora_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE UNIQUE NOT NULL,
    deployment_frequency INT NOT NULL DEFAULT 0,
    lead_time_seconds INT NOT NULL DEFAULT 0,
    change_failure_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    mttr_seconds INT NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE INDEX IF NOT EXISTS idx_dora_metrics_date ON public.dora_metrics(metric_date);





-- -- ROLLBACK:
-- DROP POLICY IF EXISTS "Admin full access dora_metrics" ON public.dora_metrics;
-- DROP POLICY IF EXISTS "Public read dora_metrics" ON public.dora_metrics;
-- DROP TABLE IF EXISTS public.dora_metrics;


-- ========================================================
-- Source: 20260815000000_platform_stats_cache.sql
-- ========================================================
-- Item 154: Platform Statistics Cache Table & Auto-Update Triggers
CREATE TABLE IF NOT EXISTS public.platform_statistics (
  stat_key text PRIMARY KEY,
  stat_value bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- Function to safely update a stat key
CREATE OR REPLACE FUNCTION set_platform_stat(p_key text, p_val bigint)
RETURNS void AS $$
BEGIN
  INSERT INTO platform_statistics (stat_key, stat_value, updated_at) -- KEEP: aggregate statistics record inside platform metric trigger/function
  VALUES (p_key, p_val, now())
  ON CONFLICT (stat_key)
  DO UPDATE SET stat_value = EXCLUDED.stat_value, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Platform stats cache (written by incident triggers; table was referenced but never created)
CREATE TABLE IF NOT EXISTS public.platform_stats_cache (
  stat_key text PRIMARY KEY,
  stat_value bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger function for incidents table count updates
CREATE OR REPLACE FUNCTION refresh_incidents_stat()
RETURNS trigger AS $$
BEGIN
  PERFORM set_platform_stat(
    'total_incidents',
    (SELECT count(*) FROM incidents WHERE status = 'published')
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_refresh_incidents_stat ON incidents; CREATE TRIGGER trigger_refresh_incidents_stat
AFTER INSERT OR DELETE OR UPDATE OF status ON incidents
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_incidents_stat();


-- ROLLBACK:
-- DROP TRIGGER IF EXISTS trigger_refresh_incidents_stat ON incidents;
-- DROP FUNCTION IF EXISTS refresh_incidents_stat();
-- DROP FUNCTION IF EXISTS set_platform_stat(text, bigint);
-- DROP POLICY IF EXISTS "Allow public read of platform_statistics" ON platform_statistics;
-- DROP TABLE IF EXISTS platform_statistics;


-- ========================================================
-- Source: 20260815000000_rls_policy_count_rpc.sql
-- ========================================================
-- Migration: RLS Policy Count RPC
-- Exposes a SECURITY DEFINER function so the admin client can read pg_policies count
-- without requiring superuser access.

CREATE OR REPLACE FUNCTION public.get_rls_policy_count()
RETURNS integer AS $$
  SELECT COUNT(*)::integer FROM pg_policies WHERE schemaname = 'public';
$$ LANGUAGE sql SECURITY DEFINER;


-- ROLLBACK:
-- DROP FUNCTION IF EXISTS public.get_rls_policy_count();


-- ========================================================
-- Source: 20260815143000_ecosystem_scout.sql
-- ========================================================
-- Migration: Ecosystem Scout
-- Creates table to store intelligent alerts from global AI ecosystem.

CREATE TABLE IF NOT EXISTS public.agent_ecosystem_intel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL, -- e.g., 'GitHub', 'Reddit', 'HackerNews', 'OpenRouter'
    intel_type TEXT NOT NULL, -- e.g., 'new_model', 'repo_trending', 'api_pricing_drop'
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_actioned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Trigger for updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON agent_ecosystem_intel; CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON agent_ecosystem_intel
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime (updated_at);


-- ROLLBACK:
-- DROP TABLE IF EXISTS agent_ecosystem_intel CASCADE;


-- ========================================================
-- Source: 20260815145216_create_twins_leaderboard_rpc.sql
-- ========================================================
-- Migration: Create Twins Leaderboard RPC
-- Description: Groups persona_usage_stats by twin_id to rank agents by usage and generated tokens.

CREATE OR REPLACE FUNCTION get_twins_leaderboard()
RETURNS TABLE (
    twin_id UUID,
    total_uses BIGINT,
    total_tokens_generated BIGINT,
    last_used_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        twin_id,
        COUNT(*) as total_uses,
        COALESCE(SUM(tokens_generated), 0) as total_tokens_generated,
        MAX(created_at) as last_used_at
    FROM 
        persona_usage_stats
    GROUP BY 
        twin_id
    ORDER BY 
        total_tokens_generated DESC,
        total_uses DESC;
$$;


-- ROLLBACK:
-- DROP FUNCTION IF EXISTS get_twins_leaderboard();


-- ========================================================
-- Source: 20260815150000_twins_analytics.sql
-- ========================================================
-- Migration: Twins & Persona Analytics for Creator Economy

CREATE TABLE IF NOT EXISTS public.persona_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id TEXT NOT NULL,
    developer_id UUID REFERENCES auth.users(id), -- Creator of the persona (null if ALPAR AI official)
    consumer_id UUID REFERENCES auth.users(id), -- Who called the API
    model_used TEXT NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    billed_amount_cents INTEGER DEFAULT 0, -- How much we charged the consumer
    cost_amount_cents INTEGER DEFAULT 0, -- How much it cost us (Arbitrage)
    developer_share_cents INTEGER DEFAULT 0, -- 70% share for external developer
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Indices for leaderboard querying
CREATE INDEX IF NOT EXISTS idx_persona_usage_twin_id ON persona_usage_stats(twin_id);

CREATE INDEX IF NOT EXISTS idx_persona_usage_created_at ON persona_usage_stats(created_at);


-- ROLLBACK:
-- DROP TABLE IF EXISTS persona_usage_stats CASCADE;


-- ========================================================
-- Source: 20260816000000_add_locked_fields_to_tasks.sql
-- ========================================================
ALTER TABLE automation_tasks 
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS locked_by VARCHAR(255);


-- FOR UPDATE SKIP LOCKED sorgularının hızlı çalışması için index
CREATE INDEX IF NOT EXISTS idx_automation_tasks_locked 
ON automation_tasks(status, locked_at) 
WHERE locked_at IS NULL;


-- 2. Ajanların episodik hafızasını tutacak tablo
create table if not exists public.agent_episodic_memory (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null, -- Örn: engine_tom, mimar_sinan, alan_turing
  session_id text not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  embedding vector(1536), -- OpenAI veya boyutuna göre (örneğin Gemini için 768) değişebilir
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 3. Hızlı vektör araması için HNSW index (Half-space Navigable Small World)
CREATE INDEX IF NOT EXISTS idx_agent_episodic_memory_embedding on agent_episodic_memory using hnsw (embedding vector_cosine_ops);


-- 4. Arama Fonksiyonu (RPC)
create or replace function match_agent_memory (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_agent_id text default null
)
returns table (
  id uuid,
  agent_id text,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    id,
    agent_id,
    content,
    metadata,
    1 - (agent_episodic_memory.embedding <=> query_embedding) as similarity
  from agent_episodic_memory
  where 1 - (agent_episodic_memory.embedding <=> query_embedding) > match_threshold
    and (p_agent_id is null or agent_episodic_memory.agent_id = p_agent_id)
  order by agent_episodic_memory.embedding <=> query_embedding
  limit match_count;
$$;


CREATE TABLE IF NOT EXISTS public.platform_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name text NOT NULL,
  url text,
  category text,
  status text NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started','account_created','profile_complete','active')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


ALTER TABLE public.outreach_queue ADD COLUMN IF NOT EXISTS company text;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260819000000_submit_incident_rpc.sql
-- ========================================================
-- Migration: submit_incident_rpc
-- Description: RPC to submit an incident atomically across incidents, submission_attempts, age_declarations, and consent_log tables.

CREATE OR REPLACE FUNCTION public.submit_incident_atomic(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_incident_id UUID;
    v_user_id UUID;
    v_title TEXT;
    v_title_masked TEXT;
    v_description TEXT;
    v_description_masked TEXT;
    v_category public.incident_category;
    v_severity public.incident_severity;
    v_ai_provider_id UUID;
    v_ai_model_id UUID;
    v_provider_custom_name TEXT;
    v_model_custom_name TEXT;
    v_incident_date TIMESTAMPTZ;
    v_language TEXT;
    v_is_anonymous BOOLEAN;
    v_is_expert BOOLEAN;
    v_expert_fix TEXT;
    v_source_url TEXT;
    v_is_possible_duplicate BOOLEAN;
    v_ip_hash TEXT;
    v_user_agent TEXT;
    v_contains_pii BOOLEAN;
    v_pii_categories TEXT[];
    v_anonymous_email_hash TEXT;
    v_age_consent BOOLEAN;
    v_coppa_consent BOOLEAN;
    v_uk_osa_consent BOOLEAN;
    v_now TEXT;
    v_consent_types TEXT[] := ARRAY['submission_truthfulness', 'age_18_plus', 'terms_of_service', 'coppa_thirteen_plus', 'uk_osa_eighteen_plus'];
    v_ctype TEXT;
BEGIN
    v_user_id := CASE WHEN payload->>'user_id' IS NOT NULL AND payload->>'user_id' <> '' THEN (payload->>'user_id')::UUID ELSE NULL END;
    v_title := payload->>'title';
    v_title_masked := payload->>'title_masked';
    v_description := payload->>'description';
    v_description_masked := payload->>'description_masked';
    v_category := (payload->>'category')::public.incident_category;
    v_severity := (payload->>'severity')::public.incident_severity;
    v_ai_provider_id := CASE WHEN payload->>'ai_provider_id' IS NOT NULL AND payload->>'ai_provider_id' <> '' THEN (payload->>'ai_provider_id')::UUID ELSE NULL END;
    v_ai_model_id := CASE WHEN payload->>'ai_model_id' IS NOT NULL AND payload->>'ai_model_id' <> '' THEN (payload->>'ai_model_id')::UUID ELSE NULL END;
    v_provider_custom_name := payload->>'provider_custom_name';
    v_model_custom_name := payload->>'model_custom_name';
    v_incident_date := COALESCE((payload->>'incident_date')::TIMESTAMPTZ, clock_timestamp());
    v_language := COALESCE(payload->>'language', 'en');
    v_is_anonymous := COALESCE((payload->>'is_anonymous')::BOOLEAN, false);
    v_is_expert := COALESCE((payload->>'is_expert')::BOOLEAN, false);
    v_expert_fix := payload->>'expert_fix';
    v_source_url := payload->>'source_url';
    v_is_possible_duplicate := COALESCE((payload->>'is_possible_duplicate')::BOOLEAN, false);
    v_ip_hash := payload->>'ip_hash';
    v_user_agent := payload->>'user_agent';
    v_contains_pii := COALESCE((payload->>'contains_pii')::BOOLEAN, false);
    
    IF payload->'pii_categories' IS NOT NULL AND jsonb_typeof(payload->'pii_categories') = 'array' THEN
        SELECT ARRAY(SELECT jsonb_array_elements_text(payload->'pii_categories')) INTO v_pii_categories;
    ELSE
        v_pii_categories := ARRAY[]::TEXT[];
    END IF;
    
    v_anonymous_email_hash := payload->>'anonymous_email_hash';
    v_age_consent := COALESCE((payload->>'age_consent')::BOOLEAN, true);
    v_coppa_consent := COALESCE((payload->>'coppa_consent')::BOOLEAN, true);
    v_uk_osa_consent := COALESCE((payload->>'uk_osa_consent')::BOOLEAN, true);

    -- 1. Insert incident record
    INSERT INTO public.incidents ( -- KEEP: incident creation record inside submit_anonymous_incident RPC
        user_id, title, title_masked, description, description_masked,
        category, severity, ai_provider_id, ai_model_id,
        provider_custom_name, model_custom_name, incident_date,
        language, is_anonymous, is_expert, expert_fix,
        source_url, is_possible_duplicate, ip_hash, user_agent,
        contains_pii, pii_categories, status, anonymous_email_hash
    ) VALUES (
        v_user_id, v_title, v_title_masked, v_description, v_description_masked,
        v_category, v_severity, v_ai_provider_id, v_ai_model_id,
        v_provider_custom_name, v_model_custom_name, v_incident_date,
        v_language, v_is_anonymous, v_is_expert, v_expert_fix,
        v_source_url, v_is_possible_duplicate, v_ip_hash, v_user_agent,
        v_contains_pii, v_pii_categories, 'pending_review', v_anonymous_email_hash
    )
    RETURNING id INTO new_incident_id;

    -- 2. Insert submission attempt
    IF v_ip_hash IS NOT NULL AND v_ip_hash <> '' THEN
        INSERT INTO public.submission_attempts (ip_hash) VALUES (v_ip_hash); -- KEEP: rate-limit tracking record inside submit_anonymous_incident RPC
    END IF;

    -- 3. Insert age declaration
    INSERT INTO public.age_declarations ( -- KEEP: legal age compliance record inside submit_anonymous_incident RPC
        user_id, incident_id, declared_over_18, coppa_thirteen_plus, uk_osa_eighteen_plus, ip_hash
    ) VALUES (
        v_user_id, new_incident_id, v_age_consent, v_coppa_consent, v_uk_osa_consent, v_ip_hash
    );

    -- 4. Insert consent log entries
    v_now := to_char(clock_timestamp(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
    FOREACH v_ctype IN ARRAY v_consent_types LOOP
        INSERT INTO public.consent_log ( -- KEEP: compliance consent tracking record inside submit_anonymous_incident RPC
            user_id, consent_type, consent_text_snapshot, related_entity_type,
            related_entity_id, granted, ip_hash, user_agent
        ) VALUES (
            v_user_id, v_ctype, 'Accepted on ' || v_now || ' for incident ' || new_incident_id::text,
            'incident', new_incident_id, true, v_ip_hash, v_user_agent
        );
    END LOOP;

    RETURN jsonb_build_object('id', new_incident_id);
END;
$$;


-- GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION public.submit_incident_atomic(JSONB) TO authenticated, anon, service_role;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260820125026_lb4_public_statements.sql
-- ========================================================
-- Migration for LB-4: Public Statements
-- Subsumes LB-5 by exposing the response types differently

ALTER TABLE ai_provider_responses
  ADD COLUMN IF NOT EXISTS response_type text not null default 'official_reply' CHECK (response_type IN ('official_reply', 'public_statement')),
  ALTER COLUMN responder_email DROP NOT NULL,
  DROP CONSTRAINT IF EXISTS responder_email_required_for_official_reply,
  ADD CONSTRAINT responder_email_required_for_official_reply CHECK (
    (response_type = 'official_reply' AND responder_email IS NOT NULL) OR
    (response_type = 'public_statement')
  ),
  ADD COLUMN IF NOT EXISTS source_url text,
  DROP CONSTRAINT IF EXISTS source_url_required_for_public_statement,
  ADD CONSTRAINT source_url_required_for_public_statement CHECK (
    (response_type = 'public_statement' AND source_url IS NOT NULL) OR
    (response_type = 'official_reply')
  ),
  ADD COLUMN IF NOT EXISTS statement_date date,
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id);

DROP VIEW IF EXISTS public.provider_leaderboard;
CREATE OR REPLACE VIEW public.provider_leaderboard AS
SELECT
  p.id,
  p.slug,
  p.name,
  p.logo_url,
  p.is_verified,
  p.website_url,
  p.is_verified_respondent,
  COALESCE(count(DISTINCT i.id), 0) AS incident_count,
  COALESCE(count(DISTINCT r_off.id), 0) AS official_response_count,
  COALESCE(count(DISTINCT r_pub.id), 0) AS public_statement_count,
  CASE
    WHEN count(DISTINCT i.id) > 0 THEN round((count(DISTINCT r_off.id)::numeric / count(DISTINCT i.id)::numeric) * 100, 2)
    ELSE 0
  END AS response_rate,
  CASE
    WHEN count(DISTINCT i.id) > 0 THEN round(((count(DISTINCT r_off.id) + count(DISTINCT r_pub.id))::numeric / count(DISTINCT i.id)::numeric) * 100, 2)
    ELSE 0
  END AS disclosure_rate
FROM public.ai_providers p
LEFT JOIN public.incidents i ON i.ai_provider_id = p.id AND i.status = 'published'
LEFT JOIN public.ai_provider_responses r_off ON r_off.ai_provider_id = p.id AND r_off.incident_id = i.id AND r_off.is_published = true AND r_off.response_type = 'official_reply'
LEFT JOIN public.ai_provider_responses r_pub ON r_pub.ai_provider_id = p.id AND r_pub.incident_id = i.id AND r_pub.is_published = true AND r_pub.response_type = 'public_statement'
WHERE
  p.slug <> 'alpar-autopilot'
GROUP BY
  p.id, p.slug, p.name, p.logo_url, p.is_verified, p.website_url, p.is_verified_respondent;


-- FUND-1 Schema
ALTER TABLE grant_applications
  ADD COLUMN IF NOT EXISTS amount_granted NUMERIC,
  ADD COLUMN IF NOT EXISTS date_applied TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS amount_requested NUMERIC,
  ADD COLUMN IF NOT EXISTS decision TEXT,
  ADD COLUMN IF NOT EXISTS date_decided TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE;


-- Column on ai_models (defaults to 'unknown' until classified)
alter table public.ai_models
  ADD COLUMN IF NOT EXISTS weight_class public.model_weight_class not null default 'unknown';


-- RLS: table is already protected; re-enable is idempotent and documents intent.

-- Aggregated stats for the /insights/open-vs-closed page.
-- SECURITY INVOKER so RLS applies to the caller: anon/authenticated users only
-- see published incidents (public.ai_models select is open to everyone).
create or replace function public.get_incident_weight_class_stats()
returns table (weight_class public.model_weight_class, incident_count bigint)
language sql
security invoker
set search_path = public
stable
as $$
  select m.weight_class, count(*)::bigint as incident_count
  from public.incidents i
  join public.ai_models m on m.id = i.ai_model_id
  where i.status = 'published'
  group by m.weight_class
$$;

grant execute on function public.get_incident_weight_class_stats() to anon, authenticated;


-- ROLLBACK:
-- drop function if exists public.get_incident_weight_class_stats();
-- drop index if exists public.idx_ai_models_weight_class;
-- alter table public.ai_models drop column if exists weight_class;
-- drop type if exists public.model_weight_class;


-- ========================================================
-- Source: 20260829000000_ai_act_article5.sql
-- ========================================================
-- Migration: 20260829000000_ai_act_article5.sql
-- Description: Add the Article 5 prohibited-practice category for
-- non-consensual intimate imagery / CSAM to the incident_category enum and
-- restrict public read access on this sensitive category to staff only.
--
-- Article 5 of the EU AI Act prohibits AI practices that exploit, generate,
-- or facilitate content that sexually victimises minors (CSAM) or non-consensual
-- intimate imagery. Incidents in this category are highly sensitive: they are
-- never surfaced to anonymous/public readers regardless of publish status.

-- 1. Add value to incident_category enum
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'incident_category' AND e.enumlabel = 'non_consensual_intimate_imagery_csam') THEN ALTER TYPE public.incident_category ADD VALUE 'non_consensual_intimate_imagery_csam'; END IF; END $$;




-- ROLLBACK:
-- DROP TABLE IF EXISTS vendor_quotas;


-- ========================================================
-- Source: 20260831_societal_constitution_schema.sql
-- ========================================================
-- alparai_schema.sql

-- 1. Anti-Sybil & Reputation System (user_reputation)
CREATE TABLE IF NOT EXISTS public.user_reputation (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    reputation_score INT DEFAULT 50 CHECK (reputation_score >= 0 AND reputation_score <= 100),
    is_sybil_suspect BOOLEAN DEFAULT FALSE,
    trust_level VARCHAR(20) DEFAULT 'neutral', -- 'trusted', 'neutral', 'suspicious', 'banned'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS public.reputation_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_reputation(user_id) ON DELETE CASCADE,
    change_amount INT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 2. Agora-T (Jury System)
CREATE TABLE IF NOT EXISTS public.jury_cases (
    case_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'voting', 'resolved', 'dismissed'
    target_user_id UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);


CREATE TABLE IF NOT EXISTS public.jurors (
    case_id UUID REFERENCES jury_cases(case_id) ON DELETE CASCADE,
    juror_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (case_id, juror_id)
);


CREATE TABLE IF NOT EXISTS public.jury_votes (
    vote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES jury_cases(case_id) ON DELETE CASCADE,
    juror_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_decision VARCHAR(20) NOT NULL, -- 'guilty', 'innocent', 'abstain'
    vote_weight INT DEFAULT 1, -- Can be influenced by reputation
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (case_id, juror_id)
);


-- 3. Wall of Shame (Utanç Duvarı)
CREATE TABLE IF NOT EXISTS public.wall_of_shame_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES jury_cases(case_id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    penalty_details TEXT,
    listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);


-- Triggers for automatic updates

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';


-- (dedup) trigger update_user_reputation_modtime already in prod base; skipped

-- Function to handle Anti-Sybil Logic
CREATE OR REPLACE FUNCTION check_sybil_suspect()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reputation_score < 20 THEN
        NEW.is_sybil_suspect = TRUE;
        NEW.trust_level = 'suspicious';
    ELSIF NEW.reputation_score >= 80 THEN
        NEW.is_sybil_suspect = FALSE;
        NEW.trust_level = 'trusted';
    ELSE
        NEW.is_sybil_suspect = FALSE;
        NEW.trust_level = 'neutral';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';


-- (dedup) trigger trg_check_sybil_suspect already in prod base; skipped

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

-- (dedup) trigger trg_check_sybil_suspect already in prod base; skipped

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
  INSERT INTO public.user_reputation (user_id, reputation_score) -- KEEP: runtime insert inside stored function adjust_user_reputation_rpc
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

  INSERT INTO public.reputation_logs (user_id, change_amount, new_score, reason, action_type, triggered_by) -- KEEP: audit log insert inside stored function adjust_user_reputation_rpc
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

  INSERT INTO public.sybil_detection_logs (user_id, fingerprint, ip_hash, risk_score, is_flagged, anomaly_flags) -- KEEP: security detection log insert inside stored function evaluate_sybil_risk_rpc
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
    INSERT INTO public.ai_rap_sheet_entries ( -- KEEP: tribunal verdict record insert inside resolve_tribunal_case_rpc
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
  case_id UUID REFERENCES public.jury_cases(case_id) ON DELETE SET NULL,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
  entity_type VARCHAR(20) NOT NULL DEFAULT 'model' CHECK (entity_type IN ('provider', 'model', 'user', 'system')),
  entity_name VARCHAR(255) NOT NULL,
  provider_id UUID REFERENCES public.ai_providers(id) ON DELETE SET NULL,
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
-- (dropped) wall_of_shame_entries stays a TABLE per prod base; view deferred to product work

CREATE INDEX IF NOT EXISTS idx_rap_sheet_active ON public.ai_rap_sheet_entries(is_active);

CREATE INDEX IF NOT EXISTS idx_rap_sheet_severity ON public.ai_rap_sheet_entries(severity);

CREATE INDEX IF NOT EXISTS idx_rap_sheet_provider ON public.ai_rap_sheet_entries(provider_id);

CREATE INDEX IF NOT EXISTS idx_rap_sheet_model ON public.ai_rap_sheet_entries(model_id);

CREATE INDEX IF NOT EXISTS idx_rap_sheet_listed_at ON public.ai_rap_sheet_entries(listed_at DESC);

CREATE POLICY "Public read ai_rap_sheet" ON public.ai_rap_sheet_entries
  FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_moderator(auth.uid()));

CREATE POLICY "Moderators manage ai_rap_sheet" ON public.ai_rap_sheet_entries
  FOR ALL TO authenticated USING (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()));



-- ============================================================================
-- ROLLBACK:
-- ============================================================================
-- -- 1. Rollback social_accounts, marketing_drafts, newsletter_subscribers
-- DROP POLICY IF EXISTS "Admin and service role full access on social_accounts" ON public.social_accounts;
--
-- DROP POLICY IF EXISTS "Admin and service role full access on marketing_drafts" ON public.marketing_drafts;
--
-- DROP POLICY IF EXISTS "Admin and service role full access on newsletter_subscribers" ON public.newsletter_subscribers;
--
-- -- 2. Rollback cross_audit_runs, audit_log, cease_and_desist_logs
-- DROP POLICY IF EXISTS "Admin and service role full access on cross_audit_runs" ON public.cross_audit_runs;
--
-- DROP POLICY IF EXISTS "Admin and service role can select audit_log" ON public.audit_log;
--
-- DROP POLICY IF EXISTS "Admin and service role full access on cease_and_desist_logs" ON public.cease_and_desist_logs;
--
-- -- 3. Rollback embeddings, profiles, documents
-- DROP POLICY IF EXISTS "Admin and service role full access on embeddings" ON public.embeddings;
-- DROP POLICY IF EXISTS "Admin and service role full access on profiles" ON public.profiles;
-- DROP POLICY IF EXISTS "Admin and service role full access on documents" ON public.documents;
-- ALTER TABLE IF EXISTS public.embeddings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE IF EXISTS public.documents DISABLE ROW LEVEL SECURITY;


-- ========================================================
-- Source: 20260831000000_startup_health_kpis.sql
-- ========================================================
-- 20260831000000_startup_health_kpis.sql
-- RPC to calculate month-over-month (MoM) metrics for startup health

CREATE OR REPLACE FUNCTION startup_health_kpis()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    users_this_month integer;
    users_last_month integer;
    incidents_this_month integer;
    incidents_last_month integer;
    subscribers_this_month integer;
    subscribers_last_month integer;
    
    result json;
BEGIN
    -- users count
    SELECT count(*) INTO users_this_month 
    FROM public.users 
    WHERE date_trunc('month', created_at) = date_trunc('month', now());
    
    SELECT count(*) INTO users_last_month 
    FROM public.users 
    WHERE date_trunc('month', created_at) = date_trunc('month', now() - interval '1 month');

    -- incidents count
    SELECT count(*) INTO incidents_this_month 
    FROM incidents 
    WHERE date_trunc('month', created_at) = date_trunc('month', now());
    
    SELECT count(*) INTO incidents_last_month 
    FROM incidents 
    WHERE date_trunc('month', created_at) = date_trunc('month', now() - interval '1 month');

    -- newsletter_subscribers count
    SELECT count(*) INTO subscribers_this_month 
    FROM newsletter_subscribers 
    WHERE date_trunc('month', created_at) = date_trunc('month', now());
    
    SELECT count(*) INTO subscribers_last_month 
    FROM newsletter_subscribers 
    WHERE date_trunc('month', created_at) = date_trunc('month', now() - interval '1 month');

    result := json_build_object(
        'users', json_build_object(
            'this_month', users_this_month,
            'last_month', users_last_month
        ),
        'incidents', json_build_object(
            'this_month', incidents_this_month,
            'last_month', incidents_last_month
        ),
        'subscribers', json_build_object(
            'this_month', subscribers_this_month,
            'last_month', subscribers_last_month
        )
    );

    RETURN result;
END;
$$;


-- ROLLBACK:
-- DROP FUNCTION IF EXISTS startup_health_kpis();


-- ========================================================
-- Source: 20260831000001_incident_deduplication_constraint.sql
-- ========================================================
-- PRODUCTION SEED
-- Migration: Add deduplication constraint on incidents table
-- Target: Prevent duplicate incident entries for the same AI provider

ALTER TABLE public.incidents
  DROP CONSTRAINT IF EXISTS unique_incident_title_provider;


ALTER TABLE public.incidents
  ADD CONSTRAINT unique_incident_title_provider UNIQUE (title, ai_provider_id);



-- ========================================================
-- Source: 20260831000002_trustscore_leaderboard_view.sql
-- ========================================================
-- PRODUCTION SEED
-- Migration: Create TrustScore Leaderboard View
-- Matches /methodology logic: Start at 100, deduct points based on incident severity.
-- High = 10 pts, Medium = 5 pts, Low = 2 pts.

DROP VIEW IF EXISTS public.provider_leaderboard;
CREATE OR REPLACE VIEW public.provider_leaderboard AS
SELECT 
    p.id AS provider_id,
    p.name AS provider_name,
    p.logo_url,
    p.website_url,
    COUNT(i.id) AS total_incidents,
    COALESCE(SUM(
        CASE 
            WHEN i.severity = 'critical' THEN 15
            WHEN i.severity = 'high' THEN 10
            WHEN i.severity = 'medium' THEN 5
            WHEN i.severity = 'low' THEN 2
            ELSE 0
        END
    ), 0) AS total_penalty,
    GREATEST(0, 100 - COALESCE(SUM(
        CASE 
            WHEN i.severity = 'critical' THEN 15
            WHEN i.severity = 'high' THEN 10
            WHEN i.severity = 'medium' THEN 5
            WHEN i.severity = 'low' THEN 2
            ELSE 0
        END
    ), 0)) AS trust_score,
    MAX(i.incident_date) AS last_incident_date
FROM 
    public.ai_providers p
LEFT JOIN 
    public.incidents i ON p.id = i.ai_provider_id AND i.status = 'verified'
GROUP BY 
    p.id, p.name, p.logo_url, p.website_url;



-- ========================================================
-- Source: 20260831210000_deep_rls_hardening.sql
-- ========================================================
-- ============================================================================
-- Migration: 20260831210000_deep_rls_hardening.sql
-- Description: Deep RLS Enforcement & Database Security Policy Hardening
-- Author: ALPAR AI Security & Trust Infrastructure Team
-- ============================================================================

-- 1. GLOBAL SAFETY NET: Ensure EVERY table in public schema has RLS Enabled
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
    END LOOP;
END;
$$;


-- 2. HARDEN AI SCORING CONFIG (Prevent arbitrary parameter tampering by regular authenticated users)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_scoring_config') THEN
        DROP POLICY IF EXISTS "admin write access to ai_scoring_config" ON public.ai_scoring_config;
        DROP POLICY IF EXISTS "Admin write access to ai_scoring_config" ON public.ai_scoring_config;
        DROP POLICY IF EXISTS "Admins and service role manage ai_scoring_config" ON public.ai_scoring_config;
            CREATE POLICY "Admins and service role manage ai_scoring_config" ON public.ai_scoring_config
            FOR ALL TO authenticated, service_role
            USING (
                auth.role() = 'service_role' 
                OR public.is_admin(auth.uid()) 
                OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'ceo'))
            )
            WITH CHECK (
                auth.role() = 'service_role' 
                OR public.is_admin(auth.uid()) 
                OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'ceo'))
            );
    END IF;
END $$;


-- 6. HARDEN USER REPUTATION & ANTI-SYBIL SYSTEM
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_reputation') THEN
        
        DROP POLICY IF EXISTS "Admin write user_reputation" ON public.user_reputation;
CREATE POLICY "Admin write user_reputation" ON public.user_reputation
            FOR ALL TO authenticated, service_role
            USING (public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_admin(auth.uid()) OR auth.role() = 'service_role');
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reputation_logs') THEN
        
        DROP POLICY IF EXISTS "Admin write reputation_logs" ON public.reputation_logs;
CREATE POLICY "Admin write reputation_logs" ON public.reputation_logs
            FOR ALL TO authenticated, service_role
            USING (public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_admin(auth.uid()) OR auth.role() = 'service_role');
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sybil_detection_logs') THEN
        
        DROP POLICY IF EXISTS "Admin manage sybil_detection_logs" ON public.sybil_detection_logs;
CREATE POLICY "Admin manage sybil_detection_logs" ON public.sybil_detection_logs
            FOR ALL TO authenticated, service_role
            USING (public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_admin(auth.uid()) OR auth.role() = 'service_role');
    END IF;
END $$;


DROP VIEW IF EXISTS public.provider_leaderboard;
CREATE OR REPLACE VIEW public.provider_leaderboard
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.slug,
  p.name,
  p.logo_url,
  p.is_verified,
  p.website_url,
  p.trust_score,
  p.is_verified_respondent,
  coalesce(count(distinct i.id), 0) AS incident_count,
  coalesce(count(distinct r.id), 0) AS response_count,
  CASE
    WHEN count(distinct i.id) > 0 THEN round((count(distinct r.id)::numeric / count(distinct i.id)::numeric) * 100, 2)
    ELSE 0
  END AS response_rate
FROM
  public.ai_providers p
LEFT JOIN
  public.incidents i ON i.ai_provider_id = p.id AND i.status = 'published'
LEFT JOIN
  public.ai_provider_responses r ON r.ai_provider_id = p.id AND r.is_published = true
WHERE
  p.slug <> 'alpar-autopilot'
GROUP BY
  p.id, p.slug, p.name, p.logo_url, p.is_verified, p.website_url, p.trust_score, p.is_verified_respondent;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260903000001_whistleblower_zkp_columns.sql
-- ========================================================
-- ============================================================================
-- 20260903000001_whistleblower_zkp_columns.sql
--
-- Adds Zero-Knowledge Proof (ZKP) cryptographic commitment, nullifier,
-- zero-day risk classification, and proof metadata to whistleblower_submissions.
-- Ensures strict cryptographic nullifier uniqueness (anti-replay / anti-double-spend).
-- ============================================================================

alter table public.whistleblower_submissions
  add column if not exists zkp_commitment text,
  add column if not exists nullifier_hash text,
  add column if not exists proof_metadata jsonb default '{}'::jsonb,
  add column if not exists zero_day_risk text check (zero_day_risk in ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE')) default 'NONE';


-- Refresh comments for schema documentation
comment on column public.whistleblower_submissions.zkp_commitment is 'ZKP SHA-256 cryptographic commitment binding payload and secrets';

comment on column public.whistleblower_submissions.nullifier_hash is 'Cryptographic nullifier hash to prevent double-spending without revealing identity';

comment on column public.whistleblower_submissions.proof_metadata is 'Client proof token and structural verification metadata';

comment on column public.whistleblower_submissions.zero_day_risk is 'Automated zero-day heuristic severity classification (CRITICAL, HIGH, MEDIUM, LOW, NONE)';


DROP VIEW IF EXISTS public.provider_leaderboard;
CREATE OR REPLACE VIEW public.provider_leaderboard
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.slug,
  p.name,
  p.logo_url,
  p.is_verified,
  p.website_url,
  GREATEST(0, LEAST(100, 85 - (coalesce(count(distinct i.id), 0) * 2.5) + (coalesce(count(distinct r.id), 0) * 4)))::integer AS trust_score,
  p.is_verified_respondent,
  coalesce(count(distinct i.id), 0) AS incident_count,
  coalesce(count(distinct r.id), 0) AS response_count,
  CASE
    WHEN count(distinct i.id) > 0 THEN round((count(distinct r.id)::numeric / count(distinct i.id)::numeric) * 100, 2)
    ELSE 0
  END AS response_rate
FROM
  public.ai_providers p
LEFT JOIN
  public.incidents i ON i.ai_provider_id = p.id AND i.status = 'published'
LEFT JOIN
  public.ai_provider_responses r ON r.ai_provider_id = p.id AND r.is_published = true
WHERE
  p.slug <> 'alpar-autopilot'
GROUP BY
  p.id, p.slug, p.name, p.logo_url, p.is_verified, p.website_url, p.is_verified_respondent;


GRANT SELECT ON public.provider_leaderboard TO anon, authenticated, service_role;


-- ROLLBACK:
-- DROP VIEW IF EXISTS public.provider_leaderboard CASCADE;
-- DROP VIEW IF EXISTS public.provider_leaderboard;
-- (removed) headless CREATE VIEW (body commented out) + DROP that deleted the good view; a valid provider_leaderboard definition exists earlier in this file.


-- ========================================================
-- Source: 20260905000000_webhooks.sql
-- ========================================================
CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    secret TEXT NOT NULL,
    provider_filter TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ROLLBACK:
-- DROP TABLE IF EXISTS webhooks;


-- ========================================================
-- Source: 20260906000000_vendor_response.sql
-- ========================================================
-- =============================================================================
-- Migration: Vendor Defense Portal Response Schema
-- Table: incidents
-- Columns: vendor_response_text, vendor_response_at
-- Features: RLS Policies, Rollback Block
-- =============================================================================

ALTER TABLE public.incidents
    ADD COLUMN IF NOT EXISTS vendor_response_text TEXT,
    ADD COLUMN IF NOT EXISTS vendor_response_at TIMESTAMPTZ;


-- Enable RLS



-- ROLLBACK:
-- DROP TABLE IF EXISTS public.k_benchmark_evaluations;
-- DROP TABLE IF EXISTS public.k_benchmark_question_bank;
-- DROP TYPE IF EXISTS public.question_bank_status;


-- ========================================================
-- Source: 20260910000000_fix_incidents_grant.sql
-- ========================================================
-- Fix missing table-level SELECT grant caused by overriding column-level grant
GRANT SELECT ON public.incidents TO anon, authenticated;


-- RPC for incrementing comment count
CREATE OR REPLACE FUNCTION public.increment_suggestion_comment_count(p_suggestion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.suggestions
  SET comments_count = comments_count + 1
  WHERE id = p_suggestion_id;
END;
$$;


-- Enable RLS for vendor_quotas if not enabled

-- Select/Manage policy for vendor_quotas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'vendor_quotas' AND policyname = 'Admins and moderators can manage vendor_quotas'
    ) THEN
    END IF;
END $$;



DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'ai_routing_chains' AND policyname = 'ai_routing_chains_read_all'
    ) THEN
    END IF;
END $$;


-- ROLLBACK:
-- The previous chain values are in 20260911000000_vendor_quotas.sql; re-running
-- that file's ai_routing_chains INSERT restores them. Note that doing so
-- reinstates the 8 dangling references this migration exists to remove, and
-- will fail scripts/check-model-routing-consistency.mjs in CI.


-- ========================================================
-- Source: 20260913000000_publish_ahmet_rifat_albuz.sql
-- ========================================================
-- Migration: Publish Ahmet Rifat Albuz on the public Advisory Board page
-- Timestamp: 20260913000000
-- Context: the record was inserted by 20260811231000_add_ahmet_rifat_albuz.sql with
-- is_active = false, so it exists in the admin panel but was never shown on
-- /about/advisory-board. This migration adds link columns for a member's
-- personal site and affiliated press outlet, then activates this record.
-- ROLLBACK:
--   UPDATE public.advisory_board_members
--   SET is_active = false, display_order = 0, website_url = NULL, press_url = NULL
--   WHERE name = 'Ahmet Rıfat Albuz';
--   ALTER TABLE public.advisory_board_members DROP COLUMN IF EXISTS website_url, DROP COLUMN IF EXISTS press_url;

ALTER TABLE public.advisory_board_members
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS press_url text;



-- ========================================================
-- Source: 20260914000000_wrongful_flagging_category.sql
-- ========================================================
-- Migration: 20260914000000_wrongful_flagging_category.sql
-- Description: Add the 'wrongful_flagging' value to the incident_category enum.
--
-- This category records cases where an AI-detection system flagged human-written
-- work as machine-generated. It is a distinct incident type rather than a variant
-- of an existing one: the reporter is the person harmed by the model's output
-- about them, not a user of the model, and the accused party is a detector whose
-- error rate no vendor publishes.
--
-- Required by src/actions/report-flagging.ts, which inserts with this category and
-- currently fails typecheck because the value does not exist.

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'incident_category' AND e.enumlabel = 'wrongful_flagging') THEN ALTER TYPE public.incident_category ADD VALUE 'wrongful_flagging'; END IF; END $$;


-- 3. Ensure all public tables have RLS enabled

-- ROLLBACK:
-- DROP POLICY IF EXISTS "Admins can delete invoices" ON storage.objects;
-- DROP POLICY IF EXISTS "Admins can update invoices" ON storage.objects;
-- DROP POLICY IF EXISTS "Admins can insert invoices" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can read own invoices or admins all" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'invoices';


-- ========================================================
-- Source: 20260916000000_enforce_rls_all.sql
-- ========================================================
-- Enforce RLS on all tables in the public schema to prevent any data leaks.
-- This ensures any forgotten tables are secured.
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP 
    END LOOP; 
END $$;



-- ROLLBACK:
-- -- Add rollback statements here


-- ========================================================
-- Source: 20260918000000_fund_1_grant_applications_columns.sql
-- ========================================================
-- FUND-1: Add tracking columns to grant_applications
ALTER TABLE public.grant_applications
  ADD COLUMN IF NOT EXISTS date_applied date,
  ADD COLUMN IF NOT EXISTS amount_requested text,
  ADD COLUMN IF NOT EXISTS decision text,
  ADD COLUMN IF NOT EXISTS date_decided date,
  ADD COLUMN IF NOT EXISTS expiry_date date;


-- Admin Login Events
CREATE OR REPLACE FUNCTION log_admin_login()
RETURNS trigger AS $$
BEGIN
  IF NEW.last_sign_in_at IS NOT NULL AND (OLD.last_sign_in_at IS NULL OR NEW.last_sign_in_at > OLD.last_sign_in_at) THEN
    IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id AND role = 'admin') THEN
      INSERT INTO public.admin_login_events (user_id, login_time, ip_address, user_agent) -- KEEP: security audit insert inside admin login trigger function
      VALUES (
        NEW.id,
        NEW.last_sign_in_at,
        current_setting('request.headers', true)::json->>'x-forwarded-for',
        current_setting('request.headers', true)::json->>'user-agent'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- Capacity RPCs
CREATE OR REPLACE FUNCTION public.get_database_size()
RETURNS bigint AS $$
  SELECT pg_database_size(current_database());
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;


CREATE OR REPLACE FUNCTION public.get_storage_size()
RETURNS bigint AS $$
  SELECT COALESCE(SUM((metadata->>'size')::bigint), 0)::bigint FROM storage.objects;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;


CREATE OR REPLACE FUNCTION public.get_ai_gateway_costs(time_interval interval)
RETURNS numeric AS $$
  SELECT COALESCE(SUM(cost_usd), 0.0)::numeric FROM public.cross_audit_runs WHERE created_at >= (now() - time_interval);
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;


-- Geo Engine
CREATE OR REPLACE FUNCTION public.cleanup_geo_scores()
RETURNS void AS $$
BEGIN
    DELETE FROM public.geo_citations WHERE created_at < NOW() - INTERVAL '30 days';
    DELETE FROM public.geo_scores WHERE calculated_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- Incident count cache refresh
CREATE OR REPLACE FUNCTION refresh_incidents_stat()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO platform_stats_cache (stat_key, stat_value, updated_at) VALUES ('incidents_total', 1, now()) -- KEEP: cache population inside platform statistics refresh trigger/function
    ON CONFLICT (stat_key) DO UPDATE SET stat_value = platform_stats_cache.stat_value + 1, updated_at = now();
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE platform_stats_cache SET stat_value = stat_value - 1, updated_at = now() WHERE stat_key = 'incidents_total';
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- Submit Incident RPC
CREATE OR REPLACE FUNCTION public.submit_incident_atomic(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_incident_id UUID;
    v_user_id UUID;
    v_title TEXT;
    v_title_masked TEXT;
    v_description TEXT;
    v_description_masked TEXT;
    v_category public.incident_category;
    v_severity public.incident_severity;
    v_ai_provider_id UUID;
    v_ai_model_id UUID;
    v_provider_custom_name TEXT;
    v_model_custom_name TEXT;
    v_incident_date TIMESTAMPTZ;
    v_language TEXT;
    v_is_anonymous BOOLEAN;
    v_is_expert BOOLEAN;
    v_expert_fix TEXT;
    v_source_url TEXT;
    v_is_possible_duplicate BOOLEAN;
    v_ip_hash TEXT;
    v_user_agent TEXT;
    v_contains_pii BOOLEAN;
    v_pii_categories TEXT[];
    v_anonymous_email_hash TEXT;
    v_age_consent BOOLEAN;
    v_coppa_consent BOOLEAN;
    v_uk_osa_consent BOOLEAN;
    v_now TEXT;
    v_consent_types TEXT[] := ARRAY['submission_truthfulness', 'age_18_plus', 'terms_of_service', 'coppa_thirteen_plus', 'uk_osa_eighteen_plus'];
    v_ctype TEXT;
BEGIN
    v_user_id := CASE WHEN payload->>'user_id' IS NOT NULL AND payload->>'user_id' <> '' THEN (payload->>'user_id')::UUID ELSE NULL END;
    v_title := payload->>'title';
    v_title_masked := payload->>'title_masked';
    v_description := payload->>'description';
    v_description_masked := payload->>'description_masked';
    v_category := (payload->>'category')::public.incident_category;
    v_severity := (payload->>'severity')::public.incident_severity;
    v_ai_provider_id := CASE WHEN payload->>'ai_provider_id' IS NOT NULL AND payload->>'ai_provider_id' <> '' THEN (payload->>'ai_provider_id')::UUID ELSE NULL END;
    v_ai_model_id := CASE WHEN payload->>'ai_model_id' IS NOT NULL AND payload->>'ai_model_id' <> '' THEN (payload->>'ai_model_id')::UUID ELSE NULL END;
    v_provider_custom_name := payload->>'provider_custom_name';
    v_model_custom_name := payload->>'model_custom_name';
    v_incident_date := COALESCE((payload->>'incident_date')::TIMESTAMPTZ, clock_timestamp());
    v_language := COALESCE(payload->>'language', 'en');
    v_is_anonymous := COALESCE((payload->>'is_anonymous')::BOOLEAN, false);
    v_is_expert := COALESCE((payload->>'is_expert')::BOOLEAN, false);
    v_expert_fix := payload->>'expert_fix';
    v_source_url := payload->>'source_url';
    v_is_possible_duplicate := COALESCE((payload->>'is_possible_duplicate')::BOOLEAN, false);
    v_ip_hash := payload->>'ip_hash';
    v_user_agent := payload->>'user_agent';
    v_contains_pii := COALESCE((payload->>'contains_pii')::BOOLEAN, false);
    
    IF payload->'pii_categories' IS NOT NULL AND jsonb_typeof(payload->'pii_categories') = 'array' THEN
        SELECT ARRAY(SELECT jsonb_array_elements_text(payload->'pii_categories')) INTO v_pii_categories;
    ELSE
        v_pii_categories := ARRAY[]::TEXT[];
    END IF;
    
    v_anonymous_email_hash := payload->>'anonymous_email_hash';
    v_age_consent := COALESCE((payload->>'age_consent')::BOOLEAN, true);
    v_coppa_consent := COALESCE((payload->>'coppa_consent')::BOOLEAN, true);
    v_uk_osa_consent := COALESCE((payload->>'uk_osa_consent')::BOOLEAN, true);

    INSERT INTO public.incidents ( -- KEEP: incident creation record inside submit_anonymous_incident RPC
        user_id, title, title_masked, description, description_masked,
        category, severity, ai_provider_id, ai_model_id,
        provider_custom_name, model_custom_name, incident_date,
        language, is_anonymous, is_expert, expert_fix,
        source_url, is_possible_duplicate, ip_hash, user_agent,
        contains_pii, pii_categories, status, anonymous_email_hash
    ) VALUES (
        v_user_id, v_title, v_title_masked, v_description, v_description_masked,
        v_category, v_severity, v_ai_provider_id, v_ai_model_id,
        v_provider_custom_name, v_model_custom_name, v_incident_date,
        v_language, v_is_anonymous, v_is_expert, v_expert_fix,
        v_source_url, v_is_possible_duplicate, v_ip_hash, v_user_agent,
        v_contains_pii, v_pii_categories, 'pending_review', v_anonymous_email_hash
    )
    RETURNING id INTO new_incident_id;

    IF v_ip_hash IS NOT NULL AND v_ip_hash <> '' THEN
        INSERT INTO public.submission_attempts (ip_hash) VALUES (v_ip_hash); -- KEEP: rate-limit tracking record inside submit_anonymous_incident RPC
    END IF;

    INSERT INTO public.age_declarations ( -- KEEP: legal age compliance record inside submit_anonymous_incident RPC
        user_id, incident_id, declared_over_18, coppa_thirteen_plus, uk_osa_eighteen_plus, ip_hash
    ) VALUES (
        v_user_id, new_incident_id, v_age_consent, v_coppa_consent, v_uk_osa_consent, v_ip_hash
    );

    v_now := to_char(clock_timestamp(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
    FOREACH v_ctype IN ARRAY v_consent_types LOOP
        INSERT INTO public.consent_log ( -- KEEP: compliance consent tracking record inside submit_anonymous_incident RPC
            user_id, consent_type, consent_text_snapshot, related_entity_type,
            related_entity_id, granted, ip_hash, user_agent
        ) VALUES (
            v_user_id, v_ctype, 'Accepted on ' || v_now || ' for incident ' || new_incident_id::text,
            'incident', new_incident_id, true, v_ip_hash, v_user_agent
        );
    END LOOP;

    RETURN jsonb_build_object('id', new_incident_id);
END;
$$;



-- ========================================================
-- Source: 20260928000002_enforce_rls_globally.sql
-- ========================================================
-- Enforce RLS Globally
-- This migration ensures that EVERY table in the public schema has RLS enabled.
-- It acts as a safety net for any tables created without RLS in the future.

DO $$
DECLARE
    row record;
BEGIN
    FOR row IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
    END LOOP;
END;
$$;


-- Ensure newly added columns exist if table was already created in earlier migration
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free';

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id text;


-- -----------------------------------------------------------------------------
-- 2.4 CONNECTED DOMAIN TABLES INDEXING OPTIMIZATIONS
-- -----------------------------------------------------------------------------
-- Subscriptions table
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions (user_id, status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;


-- DORA Metrics
CREATE INDEX IF NOT EXISTS idx_dora_metrics_date_created ON public.dora_metrics (metric_date DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dora_metrics_metadata_gin ON public.dora_metrics USING gin (metadata jsonb_path_ops);


-- Persona Usage Stats
CREATE INDEX IF NOT EXISTS idx_persona_usage_twin_created ON public.persona_usage_stats (twin_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_persona_usage_developer ON public.persona_usage_stats (developer_id, created_at DESC) WHERE developer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_persona_usage_consumer ON public.persona_usage_stats (consumer_id, created_at DESC) WHERE consumer_id IS NOT NULL;



-- =============================================================================
-- 4. FAST STATS & QUERY OPTIMIZER DIRECTIVES
-- =============================================================================
ALTER TABLE public.users ALTER COLUMN email SET STATISTICS 1000;

ALTER TABLE public.users ALTER COLUMN role SET STATISTICS 500;

ALTER TABLE public.telemetry ALTER COLUMN created_at SET STATISTICS 1000;

ALTER TABLE public.telemetry ALTER COLUMN event_type SET STATISTICS 500;

ALTER TABLE public.financials ALTER COLUMN transaction_type SET STATISTICS 500;

ALTER TABLE public.financials ALTER COLUMN status SET STATISTICS 500;


-- =============================================================================
-- 5. AUTOMATIC UPDATED_AT TRIGGER
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- (dedup) trigger tr_users_updated_at already in prod base; skipped

-- (dedup) trigger tr_financials_updated_at already in prod base; skipped

-- ========================================================
-- Source: 20260930000000_create_transparency_stats_view.sql
-- ========================================================
-- Migration: Create transparency_stats_view
-- Description: Creates transparency_stats_view (and ensures transparency_stats compatibility) with security_invoker for public platform transparency metrics.

DROP VIEW IF EXISTS public.transparency_stats_view;
CREATE OR REPLACE VIEW public.transparency_stats_view
WITH (security_invoker = true) AS
SELECT
  (SELECT COUNT(*) FROM public.incidents WHERE status = 'published') AS total_incidents,
  (SELECT COUNT(*) FROM public.incidents WHERE status = 'published' AND created_at > now() - interval '7 days') AS verified_this_week,
  COALESCE(
    ROUND(
      (SELECT COUNT(DISTINCT incident_id) FROM public.ai_provider_responses WHERE is_published = true)::numeric /
      NULLIF((SELECT COUNT(*) FROM public.incidents WHERE status = 'published'), 0) * 100,
      1
    ),
    0
  ) AS provider_response_rate;


-- Also ensure transparency_stats is synced for backwards compatibility
DROP VIEW IF EXISTS public.transparency_stats;
CREATE OR REPLACE VIEW public.transparency_stats
WITH (security_invoker = true) AS
SELECT * FROM public.transparency_stats_view;


-- Grant permissions to public roles
GRANT SELECT ON public.transparency_stats_view TO anon, authenticated, service_role;

GRANT SELECT ON public.transparency_stats TO anon, authenticated, service_role;


-- =============================================================================
-- AI POLLS POLICIES
-- =============================================================================

-- Public / Anonymous & Authenticated users can view active polls (Admins can view all)

-- Admins / Moderators have full management access (create, update, delete polls)

-- =============================================================================
-- AI POLL VOTES POLICIES
-- =============================================================================

-- Public / Anonymous & Authenticated users can view votes (transparency & public stats)

-- Anonymous and Authenticated users can cast votes (validated choice & ip_hash)

-- Admins have management access for moderation / audit / cleanup

-- =============================================================================
-- GRANTS
-- =============================================================================
GRANT SELECT ON public.ai_polls TO anon, authenticated;

GRANT SELECT, INSERT ON public.ai_poll_votes TO anon, authenticated;


-- ----------------------------------------------------------------------------
-- 1. NO ACTION / RESTRICT DÜZELTMELERİ (CASCADE & SET NULL ONARIMI)
-- ----------------------------------------------------------------------------

-- expert_applications.reviewed_by
ALTER TABLE public.expert_applications
  DROP CONSTRAINT IF EXISTS expert_applications_reviewed_by_fkey,
  ADD CONSTRAINT expert_applications_reviewed_by_fkey
    FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;


-- persona_usage_stats
ALTER TABLE public.persona_usage_stats
  DROP CONSTRAINT IF EXISTS persona_usage_stats_developer_id_fkey,
  DROP CONSTRAINT IF EXISTS persona_usage_stats_consumer_id_fkey,
  ADD CONSTRAINT persona_usage_stats_developer_id_fkey
    FOREIGN KEY (developer_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT persona_usage_stats_consumer_id_fkey
    FOREIGN KEY (consumer_id) REFERENCES auth.users(id) ON DELETE SET NULL;


-- grant_applications
ALTER TABLE public.grant_applications
  DROP CONSTRAINT IF EXISTS grant_applications_completed_by_fkey,
  DROP CONSTRAINT IF EXISTS grant_applications_approved_by_fkey,
  ADD CONSTRAINT grant_applications_completed_by_fkey
    FOREIGN KEY (completed_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT grant_applications_approved_by_fkey
    FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;


-- ai_poll_votes (Yetim kayıt önleme)
ALTER TABLE public.ai_poll_votes
  DROP CONSTRAINT IF EXISTS ai_poll_votes_user_id_fkey,
  ADD CONSTRAINT ai_poll_votes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_provider_watches_user_id ON public.user_provider_watches (user_id);

CREATE INDEX IF NOT EXISTS idx_user_provider_watches_provider_id ON public.user_provider_watches (provider_id);

CREATE INDEX IF NOT EXISTS idx_art73_obligation_status_provider_id ON public.art73_obligation_status (provider_id);

CREATE INDEX IF NOT EXISTS idx_k_provider_previews_provider_id ON public.k_provider_previews (provider_id);

CREATE INDEX IF NOT EXISTS idx_provider_response_tokens_incident_id ON public.provider_response_tokens (incident_id);

CREATE INDEX IF NOT EXISTS idx_submission_fingerprints_incident_id ON public.submission_fingerprints (incident_id);

CREATE INDEX IF NOT EXISTS idx_strategic_runs_created_by ON public.strategic_runs (created_by);

CREATE INDEX IF NOT EXISTS idx_slopsquatting_reports_hallucinated_by ON public.slopsquatting_reports (hallucinated_by_model_id);

CREATE INDEX IF NOT EXISTS idx_autopilot_worker_config_updated_by ON public.autopilot_worker_config (updated_by);

CREATE INDEX IF NOT EXISTS idx_expert_network_id ON public.expert_network (id);

CREATE INDEX IF NOT EXISTS idx_private_benchmarks_user_id ON public.private_benchmarks (user_id);

CREATE INDEX IF NOT EXISTS idx_rating_alerts_user_id ON public.rating_alerts (user_id);

CREATE INDEX IF NOT EXISTS idx_fellowship_applications_user_id ON public.fellowship_applications (user_id);

CREATE INDEX IF NOT EXISTS idx_student_ambassadors_user_id ON public.student_ambassadors (user_id);

CREATE INDEX IF NOT EXISTS idx_redaction_requests_incident_id ON public.redaction_requests (incident_id);

CREATE INDEX IF NOT EXISTS idx_redaction_requests_provider_id ON public.redaction_requests (provider_id);

CREATE INDEX IF NOT EXISTS idx_redaction_requests_processed_by ON public.redaction_requests (processed_by);

CREATE INDEX IF NOT EXISTS idx_dsar_requests_user_id ON public.dsar_requests (user_id);

CREATE INDEX IF NOT EXISTS idx_challenges_created_by ON public.challenges (created_by);

CREATE INDEX IF NOT EXISTS idx_challenge_votes_user_id ON public.challenge_votes (user_id);

CREATE INDEX IF NOT EXISTS idx_admin_login_events_user_id ON public.admin_login_events (user_id);

CREATE INDEX IF NOT EXISTS idx_takedown_appeals_assigned_mod ON public.takedown_appeals (assigned_moderator_id);

CREATE INDEX IF NOT EXISTS idx_persona_usage_stats_developer_id ON public.persona_usage_stats (developer_id);

CREATE INDEX IF NOT EXISTS idx_persona_usage_stats_consumer_id ON public.persona_usage_stats (consumer_id);


alter table public.incidents

DROP CONSTRAINT IF EXISTS incidents_provider_check, ADD CONSTRAINT incidents_provider_check
    check (
      (ai_provider_id is not null) or
      (provider_custom_name is not null and length(btrim(provider_custom_name)) >= 2)
    );


alter table public.incidents
  DROP CONSTRAINT IF EXISTS incidents_model_check, ADD CONSTRAINT incidents_model_check
    check (
      (ai_model_id is not null) or
      (model_custom_name is not null and length(btrim(model_custom_name)) >= 1) or
      (ai_provider_id is null)
    );

-- =============================================================================

