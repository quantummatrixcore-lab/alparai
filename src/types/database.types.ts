export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_login_events: {
        Row: {
          created_at: string
          id: string
          ip_hash: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string
          user_id?: string | null
        }
        Relationships: []
      }
      advisory_board_members: {
        Row: {
          avatar_url: string | null
          bio_en: string | null
          bio_tr: string | null
          created_at: string
          display_order: number
          id: string
          institution_en: string | null
          institution_tr: string | null
          is_active: boolean
          name: string
          press_url: string | null
          term_end: string | null
          term_start: string | null
          title_en: string
          title_tr: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio_en?: string | null
          bio_tr?: string | null
          created_at?: string
          display_order?: number
          id?: string
          institution_en?: string | null
          institution_tr?: string | null
          is_active?: boolean
          name?: string
          press_url?: string | null
          term_end?: string | null
          term_start?: string | null
          title_en?: string
          title_tr?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio_en?: string | null
          bio_tr?: string | null
          created_at?: string
          display_order?: number
          id?: string
          institution_en?: string | null
          institution_tr?: string | null
          is_active?: boolean
          name?: string
          press_url?: string | null
          term_end?: string | null
          term_start?: string | null
          title_en?: string
          title_tr?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      age_declarations: {
        Row: {
          coppa_thirteen_plus: boolean
          created_at: string
          declared_over_18: boolean
          id: string
          incident_id: string | null
          ip_hash: string | null
          uk_osa_eighteen_plus: boolean
          user_id: string | null
        }
        Insert: {
          coppa_thirteen_plus?: boolean
          created_at?: string
          declared_over_18?: boolean
          id?: string
          incident_id?: string | null
          ip_hash?: string | null
          uk_osa_eighteen_plus?: boolean
          user_id?: string | null
        }
        Update: {
          coppa_thirteen_plus?: boolean
          created_at?: string
          declared_over_18?: boolean
          id?: string
          incident_id?: string | null
          ip_hash?: string | null
          uk_osa_eighteen_plus?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      agent_ecosystem_intel: {
        Row: {
          id: string
          source: string
          intel_type: string
          title: string
          description: string | null
          url: string | null
          metadata: Json | null
          is_actioned: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source: string
          intel_type: string
          title: string
          description?: string | null
          url?: string | null
          metadata?: Json | null
          is_actioned?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          source?: string
          intel_type?: string
          title?: string
          description?: string | null
          url?: string | null
          metadata?: Json | null
          is_actioned?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_episodic_memory: {
        Row: {
          id: string
          agent_id: string
          session_id: string
          content: string
          metadata: Json | null
          embedding: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          agent_id: string
          session_id: string
          content: string
          metadata?: Json | null
          embedding?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          agent_id?: string
          session_id?: string
          content?: string
          metadata?: Json | null
          embedding?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      ai_free_models: {
        Row: {
          id: string
          model_name: string
          provider: string
          is_active: boolean
          status: string
          latency_ms: number|null
          last_ping_at: string|null
          created_at: string
          updated_at: string
          name: string
          context_length: number | null
          pricing_prompt: number | null
          pricing_completion: number | null
          last_checked_at: string | null
        }
        Insert: {
          id?: string
          model_name?: string
          provider?: string
          is_active?: boolean
          status?: string
          latency_ms?: number|null
          last_ping_at?: string|null
          created_at?: string
          updated_at?: string
          name: string
          context_length?: number | null
          pricing_prompt?: number | null
          pricing_completion?: number | null
          last_checked_at?: string | null
        }
        Update: {
          id?: string
          model_name?: string
          provider?: string
          is_active?: boolean
          status?: string
          latency_ms?: number|null
          last_ping_at?: string|null
          created_at?: string
          updated_at?: string
          name?: string
          context_length?: number | null
          pricing_prompt?: number | null
          pricing_completion?: number | null
          last_checked_at?: string | null
        }
        Relationships: []
      }
      ai_models: {
        Row: {
          created_at: string
          deprecated_at: string | null
          id: string
          name: string
          provider_id: string
          released_at: string | null
          status: string
          version: string | null
          weight_class: string
        }
        Insert: {
          created_at?: string
          deprecated_at?: string | null
          id?: string
          name?: string
          provider_id?: string
          released_at?: string | null
          status?: string
          version?: string | null
          weight_class?: string
        }
        Update: {
          created_at?: string
          deprecated_at?: string | null
          id?: string
          name?: string
          provider_id?: string
          released_at?: string | null
          status?: string
          version?: string | null
          weight_class?: string
        }
        Relationships: []
      }
      ai_poll_votes: {
        Row: {
          choice: string
          created_at: string
          ip_hash: string
          poll_id: string
          user_id: string | null
          primary: string | null
        }
        Insert: {
          choice?: string
          created_at?: string
          ip_hash?: string
          poll_id?: string
          user_id?: string | null
          primary?: string | null
        }
        Update: {
          choice?: string
          created_at?: string
          ip_hash?: string
          poll_id?: string
          user_id?: string | null
          primary?: string | null
        }
        Relationships: []
      }
      ai_polls: {
        Row: {
          category: string
          context_news_id: string | null
          created_at: string
          description: string
          description_en: string | null
          description_tr: string | null
          id: string
          is_active: boolean
          no_count: number
          title: string
          title_en: string | null
          title_tr: string | null
          unsure_count: number
          yes_count: number
        }
        Insert: {
          category?: string
          context_news_id?: string | null
          created_at?: string
          description?: string
          description_en?: string | null
          description_tr?: string | null
          id?: string
          is_active?: boolean
          no_count?: number
          title?: string
          title_en?: string | null
          title_tr?: string | null
          unsure_count?: number
          yes_count?: number
        }
        Update: {
          category?: string
          context_news_id?: string | null
          created_at?: string
          description?: string
          description_en?: string | null
          description_tr?: string | null
          id?: string
          is_active?: boolean
          no_count?: number
          title?: string
          title_en?: string | null
          title_tr?: string | null
          unsure_count?: number
          yes_count?: number
        }
        Relationships: []
      }
      ai_provider_responses: {
        Row: {
          ai_provider_id: string
          created_at: string
          id: string
          incident_id: string
          is_official: boolean
          is_published: boolean
          published_at: string | null
          responder_email: string
          responder_name: string
          responder_role: string | null
          response_text: string
          response_type: string
        }
        Insert: {
          ai_provider_id?: string
          created_at?: string
          id?: string
          incident_id?: string
          is_official?: boolean
          is_published?: boolean
          published_at?: string | null
          responder_email?: string
          responder_name?: string
          responder_role?: string | null
          response_text?: string
          response_type?: string
        }
        Update: {
          ai_provider_id?: string
          created_at?: string
          id?: string
          incident_id?: string
          is_official?: boolean
          is_published?: boolean
          published_at?: string | null
          responder_email?: string
          responder_name?: string
          responder_role?: string | null
          response_text?: string
          response_type?: string
        }
        Relationships: []
      }
      ai_providers: {
        Row: {
          contact_email: string | null
          created_at: string
          description: string | null
          id: string
          is_verified: boolean
          is_verified_respondent: boolean
          logo_url: string | null
          name: string
          respondent_contact_email: string | null
          respondent_verified_by: string | null
          slug: string
          trust_score: number | null
          verified_respondent_at: string | null
          website_url: string | null
          sla_uptime_pct: number | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean
          is_verified_respondent?: boolean
          logo_url?: string | null
          name?: string
          respondent_contact_email?: string | null
          respondent_verified_by?: string | null
          slug?: string
          trust_score?: number | null
          verified_respondent_at?: string | null
          website_url?: string | null
          sla_uptime_pct?: number | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean
          is_verified_respondent?: boolean
          logo_url?: string | null
          name?: string
          respondent_contact_email?: string | null
          respondent_verified_by?: string | null
          slug?: string
          trust_score?: number | null
          verified_respondent_at?: string | null
          website_url?: string | null
          sla_uptime_pct?: number | null
        }
        Relationships: []
      }
      ai_routing_chains: {
        Row: {
          domain_name: string
          models: unknown[]
          created_at: string
          updated_at: string
          id: string
          capability_domain: string
          primary_model_id: string
          secondary_model_id: string
          tertiary_model_id: string
          judge_model_id: string
          is_active: boolean | null
        }
        Insert: {
          domain_name?: string
          models?: unknown[]
          created_at?: string
          updated_at?: string
          id?: string
          capability_domain: string
          primary_model_id: string
          secondary_model_id: string
          tertiary_model_id: string
          judge_model_id: string
          is_active?: boolean | null
        }
        Update: {
          domain_name?: string
          models?: unknown[]
          created_at?: string
          updated_at?: string
          id?: string
          capability_domain?: string
          primary_model_id?: string
          secondary_model_id?: string
          tertiary_model_id?: string
          judge_model_id?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      ai_scoring_config: {
        Row: {
          id: string
          w_audit: number | null
          w_incident: number | null
          is_combined_active: boolean
          min_audits_threshold: number
          min_incidents_threshold: number
          updated_at: string
        }
        Insert: {
          id?: string
          w_audit?: number | null
          w_incident?: number | null
          is_combined_active?: boolean
          min_audits_threshold?: number
          min_incidents_threshold?: number
          updated_at?: string
        }
        Update: {
          id?: string
          w_audit?: number | null
          w_incident?: number | null
          is_combined_active?: boolean
          min_audits_threshold?: number
          min_incidents_threshold?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_trust_ledger: {
        Row: {
          id: string
          model_id: string
          audit_score: number | null
          incident_score: number | null
          combined_score: number | null
          hash_signature: string
          created_at: string
        }
        Insert: {
          id?: string
          model_id: string
          audit_score?: number | null
          incident_score?: number | null
          combined_score?: number | null
          hash_signature: string
          created_at?: string
        }
        Update: {
          id?: string
          model_id?: string
          audit_score?: number | null
          incident_score?: number | null
          combined_score?: number | null
          hash_signature?: string
          created_at?: string
        }
        Relationships: []
      }
      ai_trust_scores: {
        Row: {
          id: string
          model_id: string
          provider: string
          trust_score: number | null
          hallucination_rate: number | null
          ethical_compliance: number | null
          total_audits: number | null
          last_audited_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          model_id: string
          provider: string
          trust_score?: number | null
          hallucination_rate?: number | null
          ethical_compliance?: number | null
          total_audits?: number | null
          last_audited_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          model_id?: string
          provider?: string
          trust_score?: number | null
          hallucination_rate?: number | null
          ethical_compliance?: number | null
          total_audits?: number | null
          last_audited_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_velocity_metrics: {
        Row: {
          id: string
          provider: string
          model_name: string
          benchmark_elo: number
          release_date: string
          capability_jump_pct: number | null
          created_at: string
        }
        Insert: {
          id?: string
          provider: string
          model_name: string
          benchmark_elo: number
          release_date?: string
          capability_jump_pct?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          provider?: string
          model_name?: string
          benchmark_elo?: number
          release_date?: string
          capability_jump_pct?: number | null
          created_at?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          api_key: string
          client_type: string | null
          created_at: string
          id: string | null
          provider: string
          tier: string | null
          updated_at: string
        }
        Insert: {
          api_key?: string
          client_type?: string | null
          created_at?: string
          id?: string | null
          provider?: string
          tier?: string | null
          updated_at?: string
        }
        Update: {
          api_key?: string
          client_type?: string | null
          created_at?: string
          id?: string | null
          provider?: string
          tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      art50_transparency_status: {
        Row: {
          ai_disclosure_compliant: boolean
          c2pa_provenance_enabled: boolean
          created_at: string
          id: string
          provider_id: string | null
          updated_at: string
          watermarking_technology: string
        }
        Insert: {
          ai_disclosure_compliant?: boolean
          c2pa_provenance_enabled?: boolean
          created_at?: string
          id?: string
          provider_id?: string | null
          updated_at?: string
          watermarking_technology?: string
        }
        Update: {
          ai_disclosure_compliant?: boolean
          c2pa_provenance_enabled?: boolean
          created_at?: string
          id?: string
          provider_id?: string | null
          updated_at?: string
          watermarking_technology?: string
        }
        Relationships: []
      }
      art73_obligation_status: {
        Row: {
          created_at: string
          id: string
          obligation_name: string
          provider_id: string
          status: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          obligation_name?: string
          provider_id?: string
          status?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          obligation_name?: string
          provider_id?: string
          status?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip_hash: string | null
        }
        Insert: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_hash?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_hash?: string | null
        }
        Relationships: []
      }
      automation_tasks: {
        Row: {
          locked_at: string | null
          id: string
          task_type: string
          status: string
          payload: Json
          result: Json | null
          error_message: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          locked_at?: string | null
          id?: string
          task_type: string
          status?: string
          payload?: Json
          result?: Json | null
          error_message?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          locked_at?: string | null
          id?: string
          task_type?: string
          status?: string
          payload?: Json
          result?: Json | null
          error_message?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
      autopilot_runs: {
        Row: {
          action: string
          attempts: number
          cost_cents: number | null
          created_at: string
          duration_ms: number | null
          id: string
          idempotency_key: string
          ip_hash: string | null
          last_error: string | null
          metadata: Json
          result_id: string | null
          status: string
          token_count: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action?: string
          attempts?: number
          cost_cents?: number | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          idempotency_key?: string
          ip_hash?: string | null
          last_error?: string | null
          metadata?: Json
          result_id?: string | null
          status?: string
          token_count?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          attempts?: number
          cost_cents?: number | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          idempotency_key?: string
          ip_hash?: string | null
          last_error?: string | null
          metadata?: Json
          result_id?: string | null
          status?: string
          token_count?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      autopilot_worker_config: {
        Row: {
          enabled: boolean
          updated_at: string | null
          updated_by: string | null
          worker_name: string
        }
        Insert: {
          enabled?: boolean
          updated_at?: string | null
          updated_by?: string | null
          worker_name?: string
        }
        Update: {
          enabled?: boolean
          updated_at?: string | null
          updated_by?: string | null
          worker_name?: string
        }
        Relationships: []
      }
      bench_tr_evaluations: {
        Row: {
          id: string
          model_name: string
          provider_slug: string
          tr_grammar_score: number
          tr_bias_score: number
          tr_factuality_pct: number
          eval_dataset_ver: string
          created_at: string
        }
        Insert: {
          id?: string
          model_name?: string
          provider_slug?: string
          tr_grammar_score?: number
          tr_bias_score?: number
          tr_factuality_pct?: number
          eval_dataset_ver?: string
          created_at?: string
        }
        Update: {
          id?: string
          model_name?: string
          provider_slug?: string
          tr_grammar_score?: number
          tr_bias_score?: number
          tr_factuality_pct?: number
          eval_dataset_ver?: string
          created_at?: string
        }
        Relationships: []
      }
      bilge_memory: {
        Row: {
          id: string
          content: string | null
          metadata: Json | null
          embedding: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          content?: string | null
          metadata?: Json | null
          embedding?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          content?: string | null
          metadata?: Json | null
          embedding?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          content_en: string
          content_tr: string
          created_at: string
          generated_by: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title_en: string
          title_tr: string
          updated_at: string
        }
        Insert: {
          content_en?: string
          content_tr?: string
          created_at?: string
          generated_by?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title_en?: string
          title_tr?: string
          updated_at?: string
        }
        Update: {
          content_en?: string
          content_tr?: string
          created_at?: string
          generated_by?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title_en?: string
          title_tr?: string
          updated_at?: string
        }
        Relationships: []
      }
      bounty_badges: {
        Row: {
          code: string
          description_en: string
          description_tr: string
          icon: string
          name_en: string
          name_tr: string
          threshold_count: number
        }
        Insert: {
          code?: string
          description_en?: string
          description_tr?: string
          icon?: string
          name_en?: string
          name_tr?: string
          threshold_count?: number
        }
        Update: {
          code?: string
          description_en?: string
          description_tr?: string
          icon?: string
          name_en?: string
          name_tr?: string
          threshold_count?: number
        }
        Relationships: []
      }
      bug_bounties: {
        Row: {
          actual_reward_cents: number | null
          badge_awarded: boolean
          created_at: string
          estimated_reward_cents: number | null
          id: string
          incident_id: string
          notes: string | null
          paid_at: string | null
          provider_id: string | null
          reporter_id: string
          severity_score: number
          status: string
          updated_at: string
          validated_at: string | null
          validated_by: string | null
          check: string | null
        }
        Insert: {
          actual_reward_cents?: number | null
          badge_awarded?: boolean
          created_at?: string
          estimated_reward_cents?: number | null
          id?: string
          incident_id?: string
          notes?: string | null
          paid_at?: string | null
          provider_id?: string | null
          reporter_id?: string
          severity_score?: number
          status?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          check?: string | null
        }
        Update: {
          actual_reward_cents?: number | null
          badge_awarded?: boolean
          created_at?: string
          estimated_reward_cents?: number | null
          id?: string
          incident_id?: string
          notes?: string | null
          paid_at?: string | null
          provider_id?: string | null
          reporter_id?: string
          severity_score?: number
          status?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          check?: string | null
        }
        Relationships: []
      }
      cease_and_desist_logs: {
        Row: {
          id: string
          provider_id: string | null
          threat_level: "low" | "medium" | "high" | "critical" | "existential"
          legal_text: string
          our_response: string
          published_at: string
          created_at: string
        }
        Insert: {
          id?: string
          provider_id?: string | null
          threat_level?: "low" | "medium" | "high" | "critical" | "existential"
          legal_text?: string
          our_response?: string
          published_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          provider_id?: string | null
          threat_level?: "low" | "medium" | "high" | "critical" | "existential"
          legal_text?: string
          our_response?: string
          published_at?: string
          created_at?: string
        }
        Relationships: []
      }
      challenge_submissions: {
        Row: {
          challenge_id: string
          created_at: string
          description: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id?: string
          created_at?: string
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_votes: {
        Row: {
          created_at: string
          id: string
          submission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          submission_id?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          submission_id?: string
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          created_at: string
          created_by: string
          description_en: string
          description_tr: string
          ends_at: string
          id: string
          is_published: boolean
          starts_at: string
          title_en: string
          title_tr: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          description_en?: string
          description_tr?: string
          ends_at?: string
          id?: string
          is_published?: boolean
          starts_at?: string
          title_en?: string
          title_tr?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description_en?: string
          description_tr?: string
          ends_at?: string
          id?: string
          is_published?: boolean
          starts_at?: string
          title_en?: string
          title_tr?: string
        }
        Relationships: []
      }
      consent_log: {
        Row: {
          consent_text_snapshot: string
          consent_type: string
          created_at: string
          granted: boolean
          id: string
          ip_hash: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          consent_text_snapshot?: string
          consent_type?: string
          created_at?: string
          granted?: boolean
          id?: string
          ip_hash?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          consent_text_snapshot?: string
          consent_type?: string
          created_at?: string
          granted?: boolean
          id?: string
          ip_hash?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cookie_consent_log: {
        Row: {
          consent_level: string
          created_at: string
          id: string
          ip_hash: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          consent_level?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          consent_level?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cost_log: {
        Row: {
          id: string
          agent_id: string
          model_used: string
          prompt_tokens: number
          completion_tokens: number
          cost_usd: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          agent_id: string
          model_used: string
          prompt_tokens?: number
          completion_tokens?: number
          cost_usd?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          agent_id?: string
          model_used?: string
          prompt_tokens?: number
          completion_tokens?: number
          cost_usd?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      cron_job_logs: {
        Row: {
          id: string
          cron_name: string
          started_at: string | null
          completed_at: string | null
          status: string
          error_message: string | null
          execution_metadata: Json | null
        }
        Insert: {
          id?: string
          cron_name: string
          started_at?: string | null
          completed_at?: string | null
          status: string
          error_message?: string | null
          execution_metadata?: Json | null
        }
        Update: {
          id?: string
          cron_name?: string
          started_at?: string | null
          completed_at?: string | null
          status?: string
          error_message?: string | null
          execution_metadata?: Json | null
        }
        Relationships: []
      }
      cross_audit_runs: {
        Row: {
          cache_hit: boolean
          cost_usd: number
          created_at: string
          id: string
          incident_id: string
          latency_ms: number
          model: string
          tokens_in: number
          tokens_out: number
        }
        Insert: {
          cache_hit?: boolean
          cost_usd?: number
          created_at?: string
          id?: string
          incident_id?: string
          latency_ms?: number
          model?: string
          tokens_in?: number
          tokens_out?: number
        }
        Update: {
          cache_hit?: boolean
          cost_usd?: number
          created_at?: string
          id?: string
          incident_id?: string
          latency_ms?: number
          model?: string
          tokens_in?: number
          tokens_out?: number
        }
        Relationships: []
      }
      data_retention_policies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          retention_period_months: number
          table_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          retention_period_months?: number
          table_name?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          retention_period_months?: number
          table_name?: string
        }
        Relationships: []
      }
      dora_metrics: {
        Row: {
          id: string
          metric_date: string
          deployment_frequency: number
          lead_time_seconds: number
          change_failure_rate: number
          mttr_seconds: number
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          metric_date?: string
          deployment_frequency?: number
          lead_time_seconds?: number
          change_failure_rate?: number
          mttr_seconds?: number
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          metric_date?: string
          deployment_frequency?: number
          lead_time_seconds?: number
          change_failure_rate?: number
          mttr_seconds?: number
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      dsar_requests: {
        Row: {
          created_at: string
          due_date: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string
          id?: string
          status?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      ecosystem_news: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          is_featured: boolean
          published_at: string
          severity: string
          source: string | null
          status: string
          summary_en: string | null
          summary_tr: string | null
          title_en: string
          title_tr: string | null
          url: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          published_at?: string
          severity?: string
          source?: string | null
          status?: string
          summary_en?: string | null
          summary_tr?: string | null
          title_en?: string
          title_tr?: string | null
          url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          published_at?: string
          severity?: string
          source?: string | null
          status?: string
          summary_en?: string | null
          summary_tr?: string | null
          title_en?: string
          title_tr?: string | null
          url?: string | null
        }
        Relationships: []
      }
      email_preferences: {
        Row: {
          email: string | null
          id: string | null
          marketing_opt_in: boolean
          reporter_notifications: boolean
          source: string | null
          updated_at: string
          user_id: string | null
          watches: boolean
          weekly_digest: boolean
        }
        Insert: {
          email?: string | null
          id?: string | null
          marketing_opt_in?: boolean
          reporter_notifications?: boolean
          source?: string | null
          updated_at?: string
          user_id?: string | null
          watches?: boolean
          weekly_digest?: boolean
        }
        Update: {
          email?: string | null
          id?: string | null
          marketing_opt_in?: boolean
          reporter_notifications?: boolean
          source?: string | null
          updated_at?: string
          user_id?: string | null
          watches?: boolean
          weekly_digest?: boolean
        }
        Relationships: []
      }
      email_sent_logs: {
        Row: {
          email_hash: string
          email_type: string
          id: string
          sent_at: string
        }
        Insert: {
          email_hash?: string
          email_type?: string
          id?: string
          sent_at?: string
        }
        Update: {
          email_hash?: string
          email_type?: string
          id?: string
          sent_at?: string
        }
        Relationships: []
      }
      evidence: {
        Row: {
          contains_pii: boolean
          file_name: string
          file_path: string
          file_size_bytes: number | null
          height_px: number | null
          id: string
          incident_id: string
          kind: Database["public"]["Enums"]["evidence_kind"]
          mime_type: string | null
          pii_categories: string[] | null
          sha256_hash: string | null
          uploaded_at: string
          width_px: number | null
        }
        Insert: {
          contains_pii?: boolean
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          height_px?: number | null
          id?: string
          incident_id?: string
          kind?: Database["public"]["Enums"]["evidence_kind"]
          mime_type?: string | null
          pii_categories?: string[] | null
          sha256_hash?: string | null
          uploaded_at?: string
          width_px?: number | null
        }
        Update: {
          contains_pii?: boolean
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          height_px?: number | null
          id?: string
          incident_id?: string
          kind?: Database["public"]["Enums"]["evidence_kind"]
          mime_type?: string | null
          pii_categories?: string[] | null
          sha256_hash?: string | null
          uploaded_at?: string
          width_px?: number | null
        }
        Relationships: []
      }
      expert_applications: {
        Row: {
          created_at: string
          email: string | null
          expertise: string
          expertise_area: string | null
          id: string
          linkedin_url: string | null
          name: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title_institution: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          expertise?: string
          expertise_area?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title_institution?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          expertise?: string
          expertise_area?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title_institution?: string
        }
        Relationships: []
      }
      expert_network: {
        Row: {
          created_at: string
          id: string
          institution: string | null
          is_active: boolean
          name: string
          specialties: string[] | null
          title: string | null
          verified_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution?: string | null
          is_active?: boolean
          name?: string
          specialties?: string[] | null
          title?: string | null
          verified_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          institution?: string | null
          is_active?: boolean
          name?: string
          specialties?: string[] | null
          title?: string | null
          verified_at?: string
        }
        Relationships: []
      }
      external_incidents_queue: {
        Row: {
          body: string | null
          created_at: string
          external_url: string
          fetched_at: string
          id: string
          source: string
          source_score: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          external_url?: string
          fetched_at?: string
          id?: string
          source?: string
          source_score?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          external_url?: string
          fetched_at?: string
          id?: string
          source?: string
          source_score?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          key: string
          enabled: boolean
          updated_at: string
          id: string
          description: string | null
          rules: Json
        }
        Insert: {
          key?: string
          enabled?: boolean
          updated_at?: string
          id?: string
          description?: string | null
          rules?: Json
        }
        Update: {
          key?: string
          enabled?: boolean
          updated_at?: string
          id?: string
          description?: string | null
          rules?: Json
        }
        Relationships: []
      }
      fellowship_applications: {
        Row: {
          created_at: string
          department: string
          id: string
          institution: string
          proposal: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string
          id?: string
          institution?: string
          proposal?: string
          status?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          department?: string
          id?: string
          institution?: string
          proposal?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_api_usage: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          recorded_at: string
          service: string
          unit: string | null
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name?: string
          recorded_at?: string
          service?: string
          unit?: string | null
          value?: number
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          recorded_at?: string
          service?: string
          unit?: string | null
          value?: number
        }
        Relationships: []
      }
      finance_monthly_costs: {
        Row: {
          amount_usd: number
          budget_usd: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          month: string
          service: string
          updated_at: string
        }
        Insert: {
          amount_usd?: number
          budget_usd?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          month?: string
          service?: string
          updated_at?: string
        }
        Update: {
          amount_usd?: number
          budget_usd?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          month?: string
          service?: string
          updated_at?: string
        }
        Relationships: []
      }
      finance_revenue_metrics: {
        Row: {
          active_subs: number
          arr_usd: number
          created_at: string
          id: string
          month: string
          mrr_usd: number
          updated_at: string
        }
        Insert: {
          active_subs?: number
          arr_usd?: number
          created_at?: string
          id?: string
          month?: string
          mrr_usd?: number
          updated_at?: string
        }
        Update: {
          active_subs?: number
          arr_usd?: number
          created_at?: string
          id?: string
          month?: string
          mrr_usd?: number
          updated_at?: string
        }
        Relationships: []
      }
      financial_velocity_projections: {
        Row: {
          id: string
          velocity_factor: number | null
          projected_arr_usd: number | null
          enterprise_b2b_demand_multiplier: number | null
          calculated_at: string
        }
        Insert: {
          id?: string
          velocity_factor?: number | null
          projected_arr_usd?: number | null
          enterprise_b2b_demand_multiplier?: number | null
          calculated_at?: string
        }
        Update: {
          id?: string
          velocity_factor?: number | null
          projected_arr_usd?: number | null
          enterprise_b2b_demand_multiplier?: number | null
          calculated_at?: string
        }
        Relationships: []
      }
      financials: {
        Row: {
          id: string
          user_id: string | null
          organization_id: string | null
          transaction_type: string
          category: string
          amount_cents: number
          amount_usd: number | null
          currency: string
          status: string
          stripe_payment_id: string | null
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          billing_period_start: string | null
          billing_period_end: string | null
          breakdown: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          transaction_type: string
          category: string
          amount_cents: number
          amount_usd?: number | null
          currency?: string
          status?: string
          stripe_payment_id?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          billing_period_start?: string | null
          billing_period_end?: string | null
          breakdown?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          transaction_type?: string
          category?: string
          amount_cents?: number
          amount_usd?: number | null
          currency?: string
          status?: string
          stripe_payment_id?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          billing_period_start?: string | null
          billing_period_end?: string | null
          breakdown?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          id: string
          event_name: string
          user_id: string | null
          session_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          event_name?: string
          user_id?: string | null
          session_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          event_name?: string
          user_id?: string | null
          session_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      geo_citations: {
        Row: {
          id: string
          ai_engine: string
          query: string
          cited_url: string
          passage_snippet: string | null
          bot_hit_count: number
          created_at: string
          incident_id: string | null
        }
        Insert: {
          id?: string
          ai_engine?: string
          query?: string
          cited_url?: string
          passage_snippet?: string | null
          bot_hit_count?: number
          created_at?: string
          incident_id?: string | null
        }
        Update: {
          id?: string
          ai_engine?: string
          query?: string
          cited_url?: string
          passage_snippet?: string | null
          bot_hit_count?: number
          created_at?: string
          incident_id?: string | null
        }
        Relationships: []
      }
      geo_scores: {
        Row: {
          id: string
          score: number | null
          metrics: Json
          calculated_at: string
        }
        Insert: {
          id?: string
          score?: number | null
          metrics?: Json
          calculated_at?: string
        }
        Update: {
          id?: string
          score?: number | null
          metrics?: Json
          calculated_at?: string
        }
        Relationships: []
      }
      grant_applications: {
        Row: {
          id: string
          program_name: string
          funding_amount: string | null
          apply_url: string | null
          category: string | null
          phase: number
          status: string
          prepared_content_ref: string | null
          completed_by: string | null
          completed_at: string | null
          approved_by: string | null
          approved_at: string | null
          notes: string | null
          created_at: string
          amount_granted: number | null
          date_applied: string | null
        }
        Insert: {
          id?: string
          program_name?: string
          funding_amount?: string | null
          apply_url?: string | null
          category?: string | null
          phase?: number
          status?: string
          prepared_content_ref?: string | null
          completed_by?: string | null
          completed_at?: string | null
          approved_by?: string | null
          approved_at?: string | null
          notes?: string | null
          created_at?: string
          amount_granted?: number | null
          date_applied?: string | null
        }
        Update: {
          id?: string
          program_name?: string
          funding_amount?: string | null
          apply_url?: string | null
          category?: string | null
          phase?: number
          status?: string
          prepared_content_ref?: string | null
          completed_by?: string | null
          completed_at?: string | null
          approved_by?: string | null
          approved_at?: string | null
          notes?: string | null
          created_at?: string
          amount_granted?: number | null
          date_applied?: string | null
        }
        Relationships: []
      }
      heartbeats: {
        Row: {
          agent_id: string
          role: string
          last_active_ts: string | null
        }
        Insert: {
          agent_id?: string
          role: string
          last_active_ts?: string | null
        }
        Update: {
          agent_id?: string
          role?: string
          last_active_ts?: string | null
        }
        Relationships: []
      }
      incident_affected_users: {
        Row: {
          created_at: string
          incident_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          incident_id?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          incident_id?: string
          user_id?: string
        }
        Relationships: []
      }
      incident_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          incident_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment_text?: string
          created_at?: string
          id?: string
          incident_id?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          incident_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      incident_translations: {
        Row: {
          id: string
          incident_id: string
          locale: string
          title: string
          description: string
          machine_translated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          incident_id: string
          locale: string
          title: string
          description: string
          machine_translated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          incident_id?: string
          locale?: string
          title?: string
          description?: string
          machine_translated?: boolean
          created_at?: string
        }
        Relationships: []
      }
      incident_votes: {
        Row: {
          created_at: string
          id: string
          incident_id: string
          ip_hash: string | null
          updated_at: string
          user_id: string
          value: number
          unique: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          incident_id?: string
          ip_hash?: string | null
          updated_at?: string
          user_id?: string
          value?: number
          unique?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          incident_id?: string
          ip_hash?: string | null
          updated_at?: string
          user_id?: string
          value?: number
          unique?: string | null
        }
        Relationships: []
      }
      incidents: {
        Row: {
          affected_users_count: number
          ai_model_id: string | null
          ai_moderation_reason: string | null
          ai_moderation_score: number | null
          ai_provider_id: string | null
          anonymous_email_hash: string | null
          audit_tier: string | null
          category: Database["public"]["Enums"]["incident_category"]
          comments_count: number
          contains_pii: boolean
          created_at: string
          cross_audit_completed_at: string | null
          cross_audit_confidence: number | null
          cross_audit_model: string | null
          cross_audit_reasoning: string | null
          cross_audit_triage_models: string[] | null
          cross_audit_truth_score: number | null
          description: string
          description_masked: string | null
          description_tr: string | null
          encrypted_evidence: boolean
          eu_act_data_privacy_score: number | null
          eu_act_high_risk_system_category: string | null
          eu_act_non_discrimination_score: number | null
          eu_act_reporting_deadline_days: number | null
          eu_act_risk_category: string | null
          eu_act_serious_incident_class: string | null
          eu_act_transparency_score: number | null
          evidence_ciphertext: string | null
          expert_fix: string | null
          expert_verified: boolean
          expert_verifier_id: string | null
          id: string
          import_attribution: string | null
          import_external_id: string | null
          incident_date: string | null
          incident_source: string | null
          ip_hash: string | null
          is_anonymous: boolean
          is_expert: boolean
          is_possible_duplicate: boolean
          is_seed: boolean
          language: string
          location_country: string | null
          model_custom_name: string | null
          moderated_at: string | null
          moderation_note: string | null
          moderator_id: string | null
          moderator_notes: string | null
          pii_categories: string[]
          processing_stage: string
          provider_custom_name: string | null
          published_at: string | null
          reviewed_at: string | null
          search_vector: string | null
          severity: Database["public"]["Enums"]["incident_severity"]
          shares_count: number
          source_badge: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["incident_status"]
          title: string
          title_masked: string | null
          title_tr: string | null
          updated_at: string
          upvotes_count: number
          user_agent: string | null
          user_id: string | null
          vendor_response_at: string | null
          vendor_response_text: string | null
          views_count: number
          media_type: string | null
        }
        Insert: {
          affected_users_count?: number
          ai_model_id?: string | null
          ai_moderation_reason?: string | null
          ai_moderation_score?: number | null
          ai_provider_id?: string | null
          anonymous_email_hash?: string | null
          audit_tier?: string | null
          category?: Database["public"]["Enums"]["incident_category"]
          comments_count?: number
          contains_pii?: boolean
          created_at?: string
          cross_audit_completed_at?: string | null
          cross_audit_confidence?: number | null
          cross_audit_model?: string | null
          cross_audit_reasoning?: string | null
          cross_audit_triage_models?: string[] | null
          cross_audit_truth_score?: number | null
          description?: string
          description_masked?: string | null
          description_tr?: string | null
          encrypted_evidence?: boolean
          eu_act_data_privacy_score?: number | null
          eu_act_high_risk_system_category?: string | null
          eu_act_non_discrimination_score?: number | null
          eu_act_reporting_deadline_days?: number | null
          eu_act_risk_category?: string | null
          eu_act_serious_incident_class?: string | null
          eu_act_transparency_score?: number | null
          evidence_ciphertext?: string | null
          expert_fix?: string | null
          expert_verified?: boolean
          expert_verifier_id?: string | null
          id?: string
          import_attribution?: string | null
          import_external_id?: string | null
          incident_date?: string | null
          incident_source?: string | null
          ip_hash?: string | null
          is_anonymous?: boolean
          is_expert?: boolean
          is_possible_duplicate?: boolean
          is_seed?: boolean
          language?: string
          location_country?: string | null
          model_custom_name?: string | null
          moderated_at?: string | null
          moderation_note?: string | null
          moderator_id?: string | null
          moderator_notes?: string | null
          pii_categories?: string[]
          processing_stage?: string
          provider_custom_name?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          search_vector?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          shares_count?: number
          source_badge?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["incident_status"]
          title?: string
          title_masked?: string | null
          title_tr?: string | null
          updated_at?: string
          upvotes_count?: number
          user_agent?: string | null
          user_id?: string | null
          vendor_response_at?: string | null
          vendor_response_text?: string | null
          views_count?: number
          media_type?: string | null
        }
        Update: {
          affected_users_count?: number
          ai_model_id?: string | null
          ai_moderation_reason?: string | null
          ai_moderation_score?: number | null
          ai_provider_id?: string | null
          anonymous_email_hash?: string | null
          audit_tier?: string | null
          category?: Database["public"]["Enums"]["incident_category"]
          comments_count?: number
          contains_pii?: boolean
          created_at?: string
          cross_audit_completed_at?: string | null
          cross_audit_confidence?: number | null
          cross_audit_model?: string | null
          cross_audit_reasoning?: string | null
          cross_audit_triage_models?: string[] | null
          cross_audit_truth_score?: number | null
          description?: string
          description_masked?: string | null
          description_tr?: string | null
          encrypted_evidence?: boolean
          eu_act_data_privacy_score?: number | null
          eu_act_high_risk_system_category?: string | null
          eu_act_non_discrimination_score?: number | null
          eu_act_reporting_deadline_days?: number | null
          eu_act_risk_category?: string | null
          eu_act_serious_incident_class?: string | null
          eu_act_transparency_score?: number | null
          evidence_ciphertext?: string | null
          expert_fix?: string | null
          expert_verified?: boolean
          expert_verifier_id?: string | null
          id?: string
          import_attribution?: string | null
          import_external_id?: string | null
          incident_date?: string | null
          incident_source?: string | null
          ip_hash?: string | null
          is_anonymous?: boolean
          is_expert?: boolean
          is_possible_duplicate?: boolean
          is_seed?: boolean
          language?: string
          location_country?: string | null
          model_custom_name?: string | null
          moderated_at?: string | null
          moderation_note?: string | null
          moderator_id?: string | null
          moderator_notes?: string | null
          pii_categories?: string[]
          processing_stage?: string
          provider_custom_name?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          search_vector?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          shares_count?: number
          source_badge?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["incident_status"]
          title?: string
          title_masked?: string | null
          title_tr?: string | null
          updated_at?: string
          upvotes_count?: number
          user_agent?: string | null
          user_id?: string | null
          vendor_response_at?: string | null
          vendor_response_text?: string | null
          views_count?: number
          media_type?: string | null
        }
        Relationships: []
      }
      investor_applications: {
        Row: {
          access_token_hash: string | null
          approved_at: string | null
          check_size: string
          company: string
          created_at: string
          email: string
          full_name: string
          id: string
          linkedin_url: string
          status: string
          title: string
          why_interested: string | null
          constraint: string | null
        }
        Insert: {
          access_token_hash?: string | null
          approved_at?: string | null
          check_size?: string
          company?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          linkedin_url?: string
          status?: string
          title?: string
          why_interested?: string | null
          constraint?: string | null
        }
        Update: {
          access_token_hash?: string | null
          approved_at?: string | null
          check_size?: string
          company?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          linkedin_url?: string
          status?: string
          title?: string
          why_interested?: string | null
          constraint?: string | null
        }
        Relationships: []
      }
      jailbreak_samples: {
        Row: {
          id: string
          title: string
          technique: string
          severity: string
          prompt_masked: string
          target_model: string
          reproducible: boolean
          mitigation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title?: string
          technique?: string
          severity?: string
          prompt_masked?: string
          target_model?: string
          reproducible?: boolean
          mitigation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          technique?: string
          severity?: string
          prompt_masked?: string
          target_model?: string
          reproducible?: boolean
          mitigation?: string | null
          created_at?: string
        }
        Relationships: []
      }
      k_benchmark_evaluations: {
        Row: {
          id: string
          question_id: string
          model_id: string
          actual_response: string
          pass_fail: boolean | null
          evaluation_date: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          question_id: string
          model_id: string
          actual_response: string
          pass_fail?: boolean | null
          evaluation_date?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          question_id?: string
          model_id?: string
          actual_response?: string
          pass_fail?: boolean | null
          evaluation_date?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      k_benchmark_question_bank: {
        Row: {
          id: string
          incident_id: string
          test_prompt: string
          expected_behavior: string
          difficulty_level: number | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          incident_id: string
          test_prompt: string
          expected_behavior: string
          difficulty_level?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          incident_id?: string
          test_prompt?: string
          expected_behavior?: string
          difficulty_level?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      k_categories: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      k_model_scores: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          last_audited_at: string
          model_id: string
          sample_size: number
          score: number
          status: string
          wilson_lower: number | null
          wilson_upper: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          last_audited_at?: string
          model_id?: string
          sample_size?: number
          score?: number
          status?: string
          wilson_lower?: number | null
          wilson_upper?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          last_audited_at?: string
          model_id?: string
          sample_size?: number
          score?: number
          status?: string
          wilson_lower?: number | null
          wilson_upper?: number | null
        }
        Relationships: []
      }
      k_provider_previews: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          preview_token: string
          provider_id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          preview_token?: string
          provider_id?: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          preview_token?: string
          provider_id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      linkedin_contacts: {
        Row: {
          id: string
          full_name: string
          title: string | null
          company: string | null
          profile_url: string | null
          category: string | null
          status: string
          priority: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          title?: string | null
          company?: string | null
          profile_url?: string | null
          category?: string | null
          status?: string
          priority?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          title?: string | null
          company?: string | null
          profile_url?: string | null
          category?: string | null
          status?: string
          priority?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_drafts: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          media_url: string | null
          platform: string
          scheduled_for: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          media_url?: string | null
          platform?: string
          scheduled_for?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          media_url?: string | null
          platform?: string
          scheduled_for?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      methodology_committee_members: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          institution: string
          joined_at: string
          name: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          institution?: string
          joined_at?: string
          name?: string
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          institution?: string
          joined_at?: string
          name?: string
          role?: string
        }
        Relationships: []
      }
      methodology_versions: {
        Row: {
          changes_en: Json
          changes_tr: Json
          created_at: string
          id: string
          is_retraction: boolean
          published_at: string
          summary_en: string
          summary_tr: string
          version: string
        }
        Insert: {
          changes_en?: Json
          changes_tr?: Json
          created_at?: string
          id?: string
          is_retraction?: boolean
          published_at?: string
          summary_en?: string
          summary_tr?: string
          version?: string
        }
        Update: {
          changes_en?: Json
          changes_tr?: Json
          created_at?: string
          id?: string
          is_retraction?: boolean
          published_at?: string
          summary_en?: string
          summary_tr?: string
          version?: string
        }
        Relationships: []
      }
      model_feature_requests: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_anonymous: boolean
          model_id: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
          votes_count: number
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_anonymous?: boolean
          model_id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          votes_count?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_anonymous?: boolean
          model_id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          votes_count?: number
        }
        Relationships: []
      }
      model_feature_votes: {
        Row: {
          created_at: string
          request_id: string
          user_id: string
          primary: string | null
        }
        Insert: {
          created_at?: string
          request_id?: string
          user_id?: string
          primary?: string | null
        }
        Update: {
          created_at?: string
          request_id?: string
          user_id?: string
          primary?: string | null
        }
        Relationships: []
      }
      model_review_votes: {
        Row: {
          created_at: string
          review_id: string
          user_id: string
          primary: string | null
        }
        Insert: {
          created_at?: string
          review_id?: string
          user_id?: string
          primary?: string | null
        }
        Update: {
          created_at?: string
          review_id?: string
          user_id?: string
          primary?: string | null
        }
        Relationships: []
      }
      model_reviews: {
        Row: {
          body: string | null
          created_at: string
          helpful_count: number
          id: string
          is_anonymous: boolean
          model_id: string
          score_accuracy: number | null
          score_creativity: number | null
          score_overall: number
          score_safety: number | null
          score_speed: number | null
          score_value: number | null
          status: string
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          is_anonymous?: boolean
          model_id?: string
          score_accuracy?: number | null
          score_creativity?: number | null
          score_overall?: number
          score_safety?: number | null
          score_speed?: number | null
          score_value?: number | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          is_anonymous?: boolean
          model_id?: string
          score_accuracy?: number | null
          score_creativity?: number | null
          score_overall?: number
          score_safety?: number | null
          score_speed?: number | null
          score_value?: number | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmed: boolean | null
          email: string
          id: string
          locale: string | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          confirmed?: boolean | null
          email?: string
          id?: string
          locale?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          confirmed?: boolean | null
          email?: string
          id?: string
          locale?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      outreach_queue: {
        Row: {
          body_template: string
          created_at: string
          id: string
          recipient_email: string
          recipient_name: string | null
          sent_at: string | null
          status: string
          subject: string
          template_type: string
          company: string | null
        }
        Insert: {
          body_template?: string
          created_at?: string
          id?: string
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_type?: string
          company?: string | null
        }
        Update: {
          body_template?: string
          created_at?: string
          id?: string
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_type?: string
          company?: string | null
        }
        Relationships: []
      }
      persona_usage_stats: {
        Row: {
          id: string
          twin_id: string
          developer_id: string | null
          consumer_id: string | null
          model_used: string
          prompt_tokens: number | null
          completion_tokens: number | null
          billed_amount_cents: number | null
          cost_amount_cents: number | null
          developer_share_cents: number | null
          created_at: string
        }
        Insert: {
          id?: string
          twin_id: string
          developer_id?: string | null
          consumer_id?: string | null
          model_used: string
          prompt_tokens?: number | null
          completion_tokens?: number | null
          billed_amount_cents?: number | null
          cost_amount_cents?: number | null
          developer_share_cents?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          twin_id?: string
          developer_id?: string | null
          consumer_id?: string | null
          model_used?: string
          prompt_tokens?: number | null
          completion_tokens?: number | null
          billed_amount_cents?: number | null
          cost_amount_cents?: number | null
          developer_share_cents?: number | null
          created_at?: string
        }
        Relationships: []
      }
      platform_signups: {
        Row: {
          id: string
          platform_name: string
          url: string | null
          category: string | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          platform_name: string
          url?: string | null
          category?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          platform_name?: string
          url?: string | null
          category?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_statistics: {
        Row: {
          stat_key: string
          stat_value: number
          updated_at: string
        }
        Insert: {
          stat_key?: string
          stat_value?: number
          updated_at?: string
        }
        Update: {
          stat_key?: string
          stat_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      private_benchmarks: {
        Row: {
          created_at: string
          id: string
          model_id: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          model_id?: string
          score?: number
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          model_id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      provider_response_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          incident_id: string | null
          token_hash: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          incident_id?: string | null
          token_hash?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          incident_id?: string | null
          token_hash?: string
          used_at?: string | null
        }
        Relationships: []
      }
      rating_alerts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          model_id: string
          threshold: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          model_id?: string
          threshold?: number
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          model_id?: string
          threshold?: number
          user_id?: string
        }
        Relationships: []
      }
      redaction_requests: {
        Row: {
          created_at: string
          id: string
          incident_id: string
          processed_at: string | null
          processed_by: string | null
          provider_id: string
          reason: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          incident_id?: string
          processed_at?: string | null
          processed_by?: string | null
          provider_id?: string
          reason?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          incident_id?: string
          processed_at?: string | null
          processed_by?: string | null
          provider_id?: string
          reason?: string | null
          status?: string
        }
        Relationships: []
      }
      sla_alarms: {
        Row: {
          id: string
          resolved: boolean
          resolved_at: string | null
          subsystem: string
          severity: string
          message: string
          metrics: Json
          created_at: string
        }
        Insert: {
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          subsystem: string
          severity: string
          message: string
          metrics?: Json
          created_at?: string
        }
        Update: {
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          subsystem?: string
          severity?: string
          message?: string
          metrics?: Json
          created_at?: string
        }
        Relationships: []
      }
      slopsquatting_reports: {
        Row: {
          id: string
          package_name: string
          ecosystem: string
          hallucinated_by_model_id: string | null
          first_seen_at: string
          confirmed_real: boolean
          source_url: string | null
          reporter_ip_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          package_name?: string
          ecosystem?: string
          hallucinated_by_model_id?: string | null
          first_seen_at?: string
          confirmed_real?: boolean
          source_url?: string | null
          reporter_ip_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          package_name?: string
          ecosystem?: string
          hallucinated_by_model_id?: string | null
          first_seen_at?: string
          confirmed_real?: boolean
          source_url?: string | null
          reporter_ip_hash?: string | null
          created_at?: string
        }
        Relationships: []
      }
      social_accounts: {
        Row: {
          account_name: string | null
          connection_status: string | null
          created_at: string | null
          id: string
          platform: string
          updated_at: string | null
        }
        Insert: {
          account_name?: string | null
          connection_status?: string | null
          created_at?: string | null
          id?: string
          platform?: string
          updated_at?: string | null
        }
        Update: {
          account_name?: string | null
          connection_status?: string | null
          created_at?: string | null
          id?: string
          platform?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      social_assets: {
        Row: {
          asset_type: string
          created_at: string
          file_url: string
          id: string
          linked_post_id: string | null
          tags: string[]
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          asset_type?: string
          created_at?: string
          file_url?: string
          id?: string
          linked_post_id?: string | null
          tags?: string[]
          thumbnail_url?: string | null
          title?: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          file_url?: string
          id?: string
          linked_post_id?: string | null
          tags?: string[]
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          body_text: string
          comments_count: number
          content_type: string
          created_at: string
          created_by: string | null
          estimated_reach: number
          external_url: string | null
          hashtags: string[]
          id: string
          image_prompt: string | null
          image_url: string | null
          likes: number
          linked_incident_id: string | null
          linked_news_id: string | null
          platform: string
          published_at: string | null
          scheduled_at: string | null
          shares_count: number
          status: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          body_text?: string
          comments_count?: number
          content_type?: string
          created_at?: string
          created_by?: string | null
          estimated_reach?: number
          external_url?: string | null
          hashtags?: string[]
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          likes?: number
          linked_incident_id?: string | null
          linked_news_id?: string | null
          platform?: string
          published_at?: string | null
          scheduled_at?: string | null
          shares_count?: number
          status?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          body_text?: string
          comments_count?: number
          content_type?: string
          created_at?: string
          created_by?: string | null
          estimated_reach?: number
          external_url?: string | null
          hashtags?: string[]
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          likes?: number
          linked_incident_id?: string | null
          linked_news_id?: string | null
          platform?: string
          published_at?: string | null
          scheduled_at?: string | null
          shares_count?: number
          status?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      social_templates: {
        Row: {
          content_type: string
          created_at: string
          example_output: string | null
          id: string
          name: string
          platform: string
          psychology_hook: string
          template_body: string
        }
        Insert: {
          content_type?: string
          created_at?: string
          example_output?: string | null
          id?: string
          name?: string
          platform?: string
          psychology_hook?: string
          template_body?: string
        }
        Update: {
          content_type?: string
          created_at?: string
          example_output?: string | null
          id?: string
          name?: string
          platform?: string
          psychology_hook?: string
          template_body?: string
        }
        Relationships: []
      }
      strategic_answers: {
        Row: {
          id: string
          run_id: string
          model_id: string
          model_name: string
          question_index: number
          question_id: string
          section: string
          answer_text: string | null
          error_message: string | null
          latency_ms: number | null
          tokens_used: number | null
          created_at: string
          answer: string
          cost_usd: number | null
        }
        Insert: {
          id?: string
          run_id?: string
          model_id?: string
          model_name?: string
          question_index?: number
          question_id?: string
          section?: string
          answer_text?: string | null
          error_message?: string | null
          latency_ms?: number | null
          tokens_used?: number | null
          created_at?: string
          answer: string
          cost_usd?: number | null
        }
        Update: {
          id?: string
          run_id?: string
          model_id?: string
          model_name?: string
          question_index?: number
          question_id?: string
          section?: string
          answer_text?: string | null
          error_message?: string | null
          latency_ms?: number | null
          tokens_used?: number | null
          created_at?: string
          answer?: string
          cost_usd?: number | null
        }
        Relationships: []
      }
      strategic_questions: {
        Row: {
          created_at: string | null
          id: string
          question: string
          section: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question?: string
          section?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question?: string
          section?: string
        }
        Relationships: []
      }
      strategic_runs: {
        Row: {
          id: string
          status: string
          model_ids: string[]
          total_questions: number
          total_answers: number
          started_at: string
          completed_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          status?: string
          model_ids?: string[]
          total_questions?: number
          total_answers?: number
          started_at?: string
          completed_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          status?: string
          model_ids?: string[]
          total_questions?: number
          total_answers?: number
          started_at?: string
          completed_at?: string | null
          created_by?: string | null
        }
        Relationships: []
      }
      strategy_innovations: {
        Row: {
          created_at: string
          description: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      strategy_metrics_snapshots: {
        Row: {
          active_providers: number
          created_at: string
          health_score: number
          id: string
          media_mentions_count: number
          mrr_cents: number
          runway_months: number | null
          snapshot_date: string
          total_incidents: number
          total_users: number
        }
        Insert: {
          active_providers?: number
          created_at?: string
          health_score?: number
          id?: string
          media_mentions_count?: number
          mrr_cents?: number
          runway_months?: number | null
          snapshot_date?: string
          total_incidents?: number
          total_users?: number
        }
        Update: {
          active_providers?: number
          created_at?: string
          health_score?: number
          id?: string
          media_mentions_count?: number
          mrr_cents?: number
          runway_months?: number | null
          snapshot_date?: string
          total_incidents?: number
          total_users?: number
        }
        Relationships: []
      }
      strategy_milestones: {
        Row: {
          created_at: string
          id: string
          linked_metric: string | null
          okr_text: string | null
          owner_user_id: string | null
          progress: number
          quarter: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          linked_metric?: string | null
          okr_text?: string | null
          owner_user_id?: string | null
          progress?: number
          quarter?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          linked_metric?: string | null
          okr_text?: string | null
          owner_user_id?: string | null
          progress?: number
          quarter?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      strategy_risks: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          impact: number
          mitigation_plan: string | null
          owner_user_id: string | null
          probability: number
          status: string
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          impact?: number
          mitigation_plan?: string | null
          owner_user_id?: string | null
          probability?: number
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          impact?: number
          mitigation_plan?: string | null
          owner_user_id?: string | null
          probability?: number
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      strategy_state_support: {
        Row: {
          applied_at: string | null
          awarded_amount_eur: number | null
          awarded_at: string | null
          category: string
          code: string
          country: string
          created_at: string
          currency: string
          deadline: string | null
          fit_score: number
          grantor: string
          id: string
          max_amount_eur: number | null
          name: string
          notes: string | null
          priority: number
          region: string | null
          status: string
          updated_at: string
          url: string | null
        }
        Insert: {
          applied_at?: string | null
          awarded_amount_eur?: number | null
          awarded_at?: string | null
          category?: string
          code?: string
          country?: string
          created_at?: string
          currency?: string
          deadline?: string | null
          fit_score?: number
          grantor?: string
          id?: string
          max_amount_eur?: number | null
          name?: string
          notes?: string | null
          priority?: number
          region?: string | null
          status?: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          applied_at?: string | null
          awarded_amount_eur?: number | null
          awarded_at?: string | null
          category?: string
          code?: string
          country?: string
          created_at?: string
          currency?: string
          deadline?: string | null
          fit_score?: number
          grantor?: string
          id?: string
          max_amount_eur?: number | null
          name?: string
          notes?: string | null
          priority?: number
          region?: string | null
          status?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      strategy_swot_items: {
        Row: {
          action_plan: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          owner_user_id: string | null
          status: string
          target_date: string | null
          title: string
          updated_at: string
          weight: string
        }
        Insert: {
          action_plan?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          owner_user_id?: string | null
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          weight?: string
        }
        Update: {
          action_plan?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          owner_user_id?: string | null
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          weight?: string
        }
        Relationships: []
      }
      strategy_todos: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean
          priority: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean
          priority?: number
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean
          priority?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      strategy_valuations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          inputs: Json
          method: string
          notes: string | null
          result_pre_money: number
          snapshot_date: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          inputs?: Json
          method?: string
          notes?: string | null
          result_pre_money?: number
          snapshot_date?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          inputs?: Json
          method?: string
          notes?: string | null
          result_pre_money?: number
          snapshot_date?: string
        }
        Relationships: []
      }
      student_ambassadors: {
        Row: {
          created_at: string
          graduation_year: number
          id: string
          status: string
          university: string
          user_id: string
        }
        Insert: {
          created_at?: string
          graduation_year?: number
          id?: string
          status?: string
          university?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          graduation_year?: number
          id?: string
          status?: string
          university?: string
          user_id?: string
        }
        Relationships: []
      }
      submission_attempts: {
        Row: {
          created_at: string
          id: string
          ip_hash: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string
        }
        Relationships: []
      }
      submission_fingerprints: {
        Row: {
          created_at: string
          fingerprint: string
          id: string
          incident_id: string
          ip_hash: string
        }
        Insert: {
          created_at?: string
          fingerprint?: string
          id?: string
          incident_id?: string
          ip_hash?: string
        }
        Update: {
          created_at?: string
          fingerprint?: string
          id?: string
          incident_id?: string
          ip_hash?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
          stripe_price_id: string | null
          current_period_start: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
          stripe_price_id?: string | null
          current_period_start?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
          stripe_price_id?: string | null
          current_period_start?: string | null
        }
        Relationships: []
      }
      suggestion_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          suggestion_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comment_text?: string
          created_at?: string
          id?: string
          suggestion_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          suggestion_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      suggestion_votes: {
        Row: {
          created_at: string
          suggestion_id: string
          user_id: string
          primary: string | null
        }
        Insert: {
          created_at?: string
          suggestion_id?: string
          user_id?: string
          primary?: string | null
        }
        Update: {
          created_at?: string
          suggestion_id?: string
          user_id?: string
          primary?: string | null
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          category: string
          comments_count: number
          created_at: string
          description: string
          description_tr: string | null
          id: string
          is_anonymous: boolean
          status: Database["public"]["Enums"]["suggestion_status"]
          title: string
          title_tr: string | null
          updated_at: string
          upvotes_count: number
          user_id: string | null
        }
        Insert: {
          category?: string
          comments_count?: number
          created_at?: string
          description?: string
          description_tr?: string | null
          id?: string
          is_anonymous?: boolean
          status?: Database["public"]["Enums"]["suggestion_status"]
          title?: string
          title_tr?: string | null
          updated_at?: string
          upvotes_count?: number
          user_id?: string | null
        }
        Update: {
          category?: string
          comments_count?: number
          created_at?: string
          description?: string
          description_tr?: string | null
          id?: string
          is_anonymous?: boolean
          status?: Database["public"]["Enums"]["suggestion_status"]
          title?: string
          title_tr?: string | null
          updated_at?: string
          upvotes_count?: number
          user_id?: string | null
        }
        Relationships: []
      }
      system_flags: {
        Row: {
          key: string
          value: boolean
          updated_at: string | null
        }
        Insert: {
          key?: string
          value?: boolean
          updated_at?: string | null
        }
        Update: {
          key?: string
          value?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      takedown_appeals: {
        Row: {
          id: string
          takedown_id: string | null
          incident_id: string | null
          appellant_name: string
          appellant_email: string
          reason: string
          evidence_url: string | null
          status: string
          assigned_moderator_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          takedown_id?: string | null
          incident_id?: string | null
          appellant_name?: string
          appellant_email?: string
          reason?: string
          evidence_url?: string | null
          status?: string
          assigned_moderator_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          takedown_id?: string | null
          incident_id?: string | null
          appellant_name?: string
          appellant_email?: string
          reason?: string
          evidence_url?: string | null
          status?: string
          assigned_moderator_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      takedown_requests: {
        Row: {
          assigned_moderator_id: string | null
          country: string | null
          created_at: string
          details: string | null
          evidence_url: string | null
          id: string
          identity_proof_url: string | null
          incident_id: string | null
          ip_address: unknown
          legal_basis: string | null
          organization: string | null
          reason: string
          requester_email: string
          requester_name: string
          requester_organization: string | null
          resolution_notes: string | null
          resolved_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sla_due_at: string
          status: Database["public"]["Enums"]["takedown_status"]
          target_url: string | null
          user_id: string | null
        }
        Insert: {
          assigned_moderator_id?: string | null
          country?: string | null
          created_at?: string
          details?: string | null
          evidence_url?: string | null
          id?: string
          identity_proof_url?: string | null
          incident_id?: string | null
          ip_address?: unknown
          legal_basis?: string | null
          organization?: string | null
          reason?: string
          requester_email?: string
          requester_name?: string
          requester_organization?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sla_due_at?: string
          status?: Database["public"]["Enums"]["takedown_status"]
          target_url?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_moderator_id?: string | null
          country?: string | null
          created_at?: string
          details?: string | null
          evidence_url?: string | null
          id?: string
          identity_proof_url?: string | null
          incident_id?: string | null
          ip_address?: unknown
          legal_basis?: string | null
          organization?: string | null
          reason?: string
          requester_email?: string
          requester_name?: string
          requester_organization?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sla_due_at?: string
          status?: Database["public"]["Enums"]["takedown_status"]
          target_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          type: string
          payload: Json
          status: string
          ttl: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          type: string
          payload?: Json
          status?: string
          ttl?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          payload?: Json
          status?: string
          ttl?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      telemetry: {
        Row: {
          id: string
          session_id: string | null
          user_id: string | null
          event_type: string
          source: string
          environment: string
          duration_ms: number | null
          status_code: number | null
          path: string | null
          ip_hash: string | null
          user_agent: string | null
          payload: Json
          tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          user_id?: string | null
          event_type: string
          source?: string
          environment?: string
          duration_ms?: number | null
          status_code?: number | null
          path?: string | null
          ip_hash?: string | null
          user_agent?: string | null
          payload?: Json
          tags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          user_id?: string | null
          event_type?: string
          source?: string
          environment?: string
          duration_ms?: number | null
          status_code?: number | null
          path?: string | null
          ip_hash?: string | null
          user_agent?: string | null
          payload?: Json
          tags?: string[]
          created_at?: string
        }
        Relationships: []
      }
      transparency_reports: {
        Row: {
          action_taken: string
          created_at: string
          id: string
          is_published: boolean
          request_type: string
          requested_at: string
          requested_by_category: string
          summary_en: string
          summary_tr: string
        }
        Insert: {
          action_taken?: string
          created_at?: string
          id?: string
          is_published?: boolean
          request_type?: string
          requested_at?: string
          requested_by_category?: string
          summary_en?: string
          summary_tr?: string
        }
        Update: {
          action_taken?: string
          created_at?: string
          id?: string
          is_published?: boolean
          request_type?: string
          requested_at?: string
          requested_by_category?: string
          summary_en?: string
          summary_tr?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_icon: string
          badge_name: string
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_icon?: string
          badge_name?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Update: {
          awarded_at?: string
          badge_icon?: string
          badge_name?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_bounty_badges: {
        Row: {
          awarded_at: string
          badge_code: string
          bounty_id: string | null
          user_id: string
          primary: string | null
        }
        Insert: {
          awarded_at?: string
          badge_code?: string
          bounty_id?: string | null
          user_id?: string
          primary?: string | null
        }
        Update: {
          awarded_at?: string
          badge_code?: string
          bounty_id?: string | null
          user_id?: string
          primary?: string | null
        }
        Relationships: []
      }
      user_provider_watches: {
        Row: {
          created_at: string
          provider_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          provider_id?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          provider_id?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          badges: string[]
          bio: string | null
          community_role: string | null
          created_at: string
          delete_requested_at: string | null
          delete_scheduled_for: string | null
          email: string
          full_name: string | null
          id: string
          interests: string[]
          is_soft_deleted: boolean
          is_verified: boolean
          locale: string
          reputation_score: number
          role: Database["public"]["Enums"]["user_role"]
          role_view: string | null
          soft_deleted_at: string | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          subscription_tier: string | null
          updated_at: string
          username: string | null
          is_admin: boolean
          metadata: Json
          is_deleted: boolean
          deleted_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          badges?: string[]
          bio?: string | null
          community_role?: string | null
          created_at?: string
          delete_requested_at?: string | null
          delete_scheduled_for?: string | null
          email: string
          full_name?: string | null
          id: string
          interests?: string[]
          is_soft_deleted?: boolean
          is_verified?: boolean
          locale?: string
          reputation_score?: number
          role?: Database["public"]["Enums"]["user_role"]
          role_view?: string | null
          soft_deleted_at?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          subscription_tier?: string | null
          updated_at?: string
          username?: string | null
          is_admin?: boolean
          metadata?: Json
          is_deleted?: boolean
          deleted_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          badges?: string[]
          bio?: string | null
          community_role?: string | null
          created_at?: string
          delete_requested_at?: string | null
          delete_scheduled_for?: string | null
          email?: string
          full_name?: string | null
          id?: string
          interests?: string[]
          is_soft_deleted?: boolean
          is_verified?: boolean
          locale?: string
          reputation_score?: number
          role?: Database["public"]["Enums"]["user_role"]
          role_view?: string | null
          soft_deleted_at?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          subscription_tier?: string | null
          updated_at?: string
          username?: string | null
          is_admin?: boolean
          metadata?: Json
          is_deleted?: boolean
          deleted_at?: string | null
        }
        Relationships: []
      }
      vendor_quotas: {
        Row: {
          limit_value: number | null
          metric: string
          period_end: string
          period_start: string
          plan_name: string | null
          source: string
          unit: string
          updated_at: string
          used_value: number | null
          vendor: string
          check: string | null
          primary: string | null
          constraint: string | null
          id: string
        }
        Insert: {
          limit_value?: number | null
          metric?: string
          period_end?: string
          period_start?: string
          plan_name?: string | null
          source?: string
          unit?: string
          updated_at?: string
          used_value?: number | null
          vendor?: string
          check?: string | null
          primary?: string | null
          constraint?: string | null
          id?: string
        }
        Update: {
          limit_value?: number | null
          metric?: string
          period_end?: string
          period_start?: string
          plan_name?: string | null
          source?: string
          unit?: string
          updated_at?: string
          used_value?: number | null
          vendor?: string
          check?: string | null
          primary?: string | null
          constraint?: string | null
          id?: string
        }
        Relationships: []
      }
      vendor_trust_rankings: {
        Row: {
          id: string
          provider_slug: string
          provider_name: string
          composite_score: number
          incident_penalty: number
          response_rate_bonus: number
          ranking_tier: string
          last_evaluated_at: string
        }
        Insert: {
          id?: string
          provider_slug?: string
          provider_name?: string
          composite_score?: number
          incident_penalty?: number
          response_rate_bonus?: number
          ranking_tier?: string
          last_evaluated_at?: string
        }
        Update: {
          id?: string
          provider_slug?: string
          provider_name?: string
          composite_score?: number
          incident_penalty?: number
          response_rate_bonus?: number
          ranking_tier?: string
          last_evaluated_at?: string
        }
        Relationships: []
      }
      vertical_playbooks: {
        Row: {
          id: string
          sector: string
          title: string
          framework: string
          summary: string
          checklist: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sector?: string
          title?: string
          framework?: string
          summary?: string
          checklist?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sector?: string
          title?: string
          framework?: string
          summary?: string
          checklist?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          id: string
          url: string
          secret: string
          provider_filter: string | null
          created_at: string
        }
        Insert: {
          id?: string
          url?: string
          secret?: string
          provider_filter?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          url?: string
          secret?: string
          provider_filter?: string | null
          created_at?: string
        }
        Relationships: []
      }
      whistleblower_submissions: {
        Row: {
          category: string
          encrypted_content: string
          id: string
          nullifier_hash: string | null
          proof_metadata: Json | null
          provider_hint: string | null
          status: string
          submitted_at: string
          zero_day_risk: string | null
          zkp_commitment: string | null
        }
        Insert: {
          category?: string
          encrypted_content?: string
          id?: string
          nullifier_hash?: string | null
          proof_metadata?: Json | null
          provider_hint?: string | null
          status?: string
          submitted_at?: string
          zero_day_risk?: string | null
          zkp_commitment?: string | null
        }
        Update: {
          category?: string
          encrypted_content?: string
          id?: string
          nullifier_hash?: string | null
          proof_metadata?: Json | null
          provider_hint?: string | null
          status?: string
          submitted_at?: string
          zero_day_risk?: string | null
          zkp_commitment?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      feed_incidents: {
        Row: {
          affected_count: number | null
          author_name: string | null
          category: Database["public"]["Enums"]["incident_category"] | null
          created_at: string | null
          cross_audit_confidence: number | null
          cross_audit_truth_score: number | null
          description_masked: string | null
          description_tr: string | null
          evidence_count: number | null
          expert_fix: string | null
          id: string | null
          import_attribution: string | null
          import_external_id: string | null
          incident_date: string | null
          incident_source: string | null
          is_anonymous: boolean | null
          is_expert: boolean | null
          is_seed: boolean | null
          machine_translated: boolean | null
          processing_stage: string | null
          provider_name: string | null
          provider_slug: string | null
          severity: Database["public"]["Enums"]["incident_severity"] | null
          shares_count: number | null
          source_badge: string | null
          status: Database["public"]["Enums"]["incident_status"] | null
          title_masked: string | null
          title_tr: string | null
          translated_description: string | null
          translated_title: string | null
          view_count: number | null
          vote_count: number | null
        }
        Relationships: []
      }
      incidents_localized: {
        Row: {
          affected_count: number | null
          author_name: string | null
          category: Database["public"]["Enums"]["incident_category"] | null
          created_at: string | null
          cross_audit_confidence: number | null
          cross_audit_model: string | null
          cross_audit_reasoning: string | null
          cross_audit_truth_score: number | null
          description: string | null
          description_masked: string | null
          description_tr: string | null
          evidence_count: number | null
          expert_fix: string | null
          id: string | null
          import_attribution: string | null
          import_external_id: string | null
          incident_date: string | null
          incident_source: string | null
          is_anonymous: boolean | null
          is_expert: boolean | null
          is_seed: boolean | null
          machine_translated: boolean | null
          processing_stage: string | null
          provider_name: string | null
          provider_slug: string | null
          severity: Database["public"]["Enums"]["incident_severity"] | null
          shares_count: number | null
          source_badge: string | null
          status: Database["public"]["Enums"]["incident_status"] | null
          title: string | null
          title_masked: string | null
          title_tr: string | null
          translated_description: string | null
          translated_title: string | null
          view_count: number | null
          vote_count: number | null
        }
        Relationships: []
      }
      moderation_sla: {
        Row: {
          created_at: string | null
          id: string | null
          minutes_waiting: number | null
          severity: Database["public"]["Enums"]["incident_severity"] | null
          sla_target_minutes: number | null
          status: Database["public"]["Enums"]["incident_status"] | null
          title_masked: string | null
        }
        Relationships: []
      }
      provider_leaderboard: {
        Row: {
          avg_resolution_time_days: number | null
          avg_truth_score: number | null
          category_breakdown: Json | null
          critical_incidents: number | null
          high_incidents: number | null
          id: string | null
          logo_url: string | null
          low_incidents: number | null
          medium_incidents: number | null
          name: string | null
          pending_incidents: number | null
          rank: number | null
          resolved_incidents: number | null
          response_rate: number | null
          slug: string | null
          total_incidents: number | null
          total_views: number | null
          total_votes: number | null
          trust_score: number | null
        }
        Relationships: []
      }
      suggestions_localized: {
        Row: {
          author_name: string | null
          category: string | null
          comment_count: number | null
          created_at: string | null
          description: string | null
          description_tr: string | null
          id: string | null
          is_anonymous: boolean | null
          machine_translated: boolean | null
          moderation_reason: string | null
          status: Database["public"]["Enums"]["suggestion_status"] | null
          title: string | null
          title_tr: string | null
          upvotes: number | null
          user_id: string | null
        }
        Relationships: []
      }
      transparency_stats_view: {
        Row: {
          calculated_at: string | null
          metric_name: string | null
          metric_value: number | null
          metadata: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_geo_scores: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_ai_gateway_costs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_database_size: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_incident_weight_class_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_request_ip: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_rls_policy_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_storage_size: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_twins_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      increment_incident_views: {
        Args: { p_incident_id: string }
        Returns: undefined
      }
      increment_poll_count: {
        Args: { p_choice: string; p_poll_id: string }
        Returns: undefined
      }
      increment_suggestion_comment_count: {
        Args: { p_suggestion_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { uid: string }
        Returns: boolean
      }
      is_advisor: {
        Args: { uid: string }
        Returns: boolean
      }
      is_ceo: {
        Args: { uid: string }
        Returns: boolean
      }
      is_moderator: {
        Args: { uid: string }
        Returns: boolean
      }
      match_agent_memory: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
        }
        Returns: Json[]
      }
      normalize_takedown_status: {
        Args: { s: string }
        Returns: Database["public"]["Enums"]["takedown_status"]
      }
      prune_old_telemetry: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      startup_health_kpis: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      submit_incident_atomic: {
        Args: { payload: Json }
        Returns: { id: string }
      }
    }
    Enums: {
      evidence_kind:
        | "screenshot"
        | "video"
        | "document"
        | "url"
        | "transcript"
        | "other"
      incident_category:
        | "hallucination"
        | "bias"
        | "privacy"
        | "security"
        | "misinformation"
        | "harassment"
        | "manipulation"
        | "inaccessibility"
        | "copyright"
        | "non_consensual_intimate_imagery_csam"
        | "wrongful_flagging"
        | "other"
      incident_severity: "low" | "medium" | "high" | "critical"
      incident_status:
        | "pending_review"
        | "published"
        | "rejected"
        | "archived"
        | "takedown"
      model_weight_class: "open" | "closed" | "unknown"
      question_bank_status: "draft" | "approved" | "active" | "retired"
      suggestion_status:
        | "open"
        | "under_review"
        | "planned"
        | "in_progress"
        | "completed"
        | "declined"
      takedown_status:
        | "received"
        | "under_review"
        | "approved"
        | "rejected"
        | "escalated"
      user_role: "user" | "moderator" | "admin" | "ceo" | "instructor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      evidence_kind: [
        "screenshot",
        "video",
        "document",
        "url",
        "transcript",
        "other",
      ],
      incident_category: [
        "hallucination",
        "bias",
        "privacy",
        "security",
        "misinformation",
        "harassment",
        "manipulation",
        "inaccessibility",
        "copyright",
        "non_consensual_intimate_imagery_csam",
        "wrongful_flagging",
        "other",
      ],
      incident_severity: ["low", "medium", "high", "critical"],
      incident_status: [
        "pending_review",
        "published",
        "rejected",
        "archived",
        "takedown",
      ],
      model_weight_class: ["open", "closed", "unknown"],
      question_bank_status: ["draft", "approved", "active", "retired"],
      suggestion_status: [
        "open",
        "under_review",
        "planned",
        "in_progress",
        "completed",
        "declined",
      ],
      takedown_status: [
        "received",
        "under_review",
        "approved",
        "rejected",
        "escalated",
      ],
      user_role: ["user", "moderator", "admin", "ceo", "instructor"],
    },
  },
} as const
