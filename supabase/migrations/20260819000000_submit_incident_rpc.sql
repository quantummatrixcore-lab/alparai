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
    INSERT INTO public.incidents (
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
        INSERT INTO public.submission_attempts (ip_hash) VALUES (v_ip_hash);
    END IF;

    -- 3. Insert age declaration
    INSERT INTO public.age_declarations (
        user_id, incident_id, declared_over_18, coppa_thirteen_plus, uk_osa_eighteen_plus, ip_hash
    ) VALUES (
        v_user_id, new_incident_id, v_age_consent, v_coppa_consent, v_uk_osa_consent, v_ip_hash
    );

    -- 4. Insert consent log entries
    v_now := to_char(clock_timestamp(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
    FOREACH v_ctype IN ARRAY v_consent_types LOOP
        INSERT INTO public.consent_log (
            user_id, consent_type, consent_text_snapshot, related_entity_type,
            related_entity_id, granted, ip_hash, user_agent
        ) VALUES (
            v_user_id, v_ctype, 'Accepted on ' || v_now || ' for incident ' || new_incident_id::text,
            'incident', new_incident_id::text, true, v_ip_hash, v_user_agent
        );
    END LOOP;

    RETURN jsonb_build_object('id', new_incident_id);
END;
$$;

-- GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION public.submit_incident_atomic(JSONB) TO authenticated, anon, service_role;

-- ROLLBACK:
-- DROP FUNCTION IF EXISTS public.submit_incident_atomic(JSONB);
