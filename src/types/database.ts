export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
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
          }
          Insert: {
            id?: string
            program_name: string
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
          }
          Relationships: []
        },
        feature_flags: {
          Row: {
            key: string
            enabled: boolean
            updated_at: string
          }
          Insert: {
            key: string
            enabled?: boolean
            updated_at?: string
          }
          Update: {
            key?: string
            enabled?: boolean
            updated_at?: string
          }
          Relationships: []
        },
        sla_alarms: {
          Row: {
            id: string
            resolved: boolean
            resolved_at: string | null
          }
          Insert: {
            id?: string
            resolved?: boolean
            resolved_at?: string | null
          }
          Update: {
            id?: string
            resolved?: boolean
            resolved_at?: string | null
          }
          Relationships: []
        },
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
          ip_hash: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_login_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_free_models: {Row:{id:string,model_name:string,provider:string,is_active:boolean,status:string,latency_ms:number|null,last_ping_at:string|null,created_at:string,updated_at:string},Insert:{id?:string,model_name:string,provider:string,is_active?:boolean,status?:string,latency_ms?:number|null,last_ping_at?:string|null,created_at?:string,updated_at?:string},Update:{id?:string,model_name?:string,provider?:string,is_active?:boolean,status?:string,latency_ms?:number|null,last_ping_at?:string|null,created_at?:string,updated_at?:string},Relationships:[]},
      ai_routing_chains: {Row:{domain_name:string,models:any[],created_at:string,updated_at:string},Insert:{domain_name:string,models:any[],created_at?:string,updated_at?:string},Update:{domain_name?:string,models?:any[],created_at?:string,updated_at?:string},Relationships:[]},
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
          term_end: string | null
          term_start: string | null
          title_en: string
          title_tr: string
          updated_at: string
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
          name: string
          term_end?: string | null
          term_start?: string | null
          title_en: string
          title_tr: string
          updated_at?: string
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
          term_end?: string | null
          term_start?: string | null
          title_en?: string
          title_tr?: string
          updated_at?: string
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
        Relationships: [
          {
            foreignKeyName: "age_declarations_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "feed_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "age_declarations_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "age_declarations_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents_localized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "age_declarations_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "moderation_sla"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "age_declarations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          weight_class: Database["public"]["Enums"]["model_weight_class"]
        }
        Insert: {
          created_at?: string
          deprecated_at?: string | null
          id?: string
          name: string
          provider_id: string
          released_at?: string | null
          status?: string
          version?: string | null
          weight_class?: Database["public"]["Enums"]["model_weight_class"]
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
          weight_class?: Database["public"]["Enums"]["model_weight_class"]
        }
        Relationships: [
          {
            foreignKeyName: "ai_models_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_models_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_leaderboard"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_poll_votes: {
        Row: {
          choice: string
          created_at: string
          ip_hash: string
          poll_id: string
          user_id: string | null
        }
        Insert: {
          choice: string
          created_at?: string
          ip_hash: string
          poll_id: string
          user_id?: string | null
        }
        Update: {
          choice?: string
          created_at?: string
          ip_hash?: string
          poll_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "ai_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_polls: {
        Row: {
          category: string
          context_news_id: string | null
          created_at: string
          description: string
          description_en: string
          description_tr: string | null
          id: string
          is_active: boolean
          no_count: number
          title: string
          title_en: string
          title_tr: string | null
          unsure_count: number
          yes_count: number
        }
        Insert: {
          category?: string
          context_news_id?: string | null
          created_at?: string
          description: string
          description_en: string
          description_tr?: string | null
          id?: string
          is_active?: boolean
          no_count?: number
          title: string
          title_en: string
          title_tr?: string | null
          unsure_count?: number
          yes_count?: number
        }
        Update: {
          category?: string
          context_news_id?: string | null
          created_at?: string
          description?: string
          description_en?: string
          description_tr?: string | null
          id?: string
          is_active?: boolean
          no_count?: number
          title?: string
          title_en?: string
          title_tr?: string | null
          unsure_count?: number
          yes_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_polls_context_news_id_fkey"
            columns: ["context_news_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_news"
            referencedColumns: ["id"]
          },
        ]
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
        }
        Insert: {
          ai_provider_id: string
          created_at?: string
          id?: string
          incident_id: string
          is_official?: boolean
          is_published?: boolean
          published_at?: string | null
          responder_email: string
          responder_name: string
          responder_role?: string | null
          response_text: string
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
        }
        Relationships: [
          {
            foreignKeyName: "ai_provider_responses_ai_provider_id_fkey"
            columns: ["ai_provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_provider_responses_ai_provider_id_fkey"
            columns: ["ai_provider_id"]
            isOneToOne: false
            referencedRelation: "provider_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_provider_responses_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "feed_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_provider_responses_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_provider_responses_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents_localized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_provider_responses_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "moderation_sla"
            referencedColumns: ["id"]
          },
        ]
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
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean
          is_verified_respondent?: boolean
          logo_url?: string | null
          name: string
          respondent_contact_email?: string | null
          respondent_verified_by?: string | null
          slug: string
          trust_score?: number | null
          verified_respondent_at?: string | null
          website_url?: string | null
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
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          api_key: string
          client_type: string | null
          created_at: string
          id: string
          provider: string
          tier: string | null
          updated_at: string
        }
        Insert: {
          api_key: string
          client_type?: string | null
          created_at?: string
          id?: string
          provider: string
          tier?: string | null
          updated_at?: string
        }
        Update: {
          api_key?: string
          client_type?: string | null
          created_at?: string
          id?: string
          provider?: string
          tier?: string | null
          updated_at?: string
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
          metric_date: string
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
          obligation_name: string
          provider_id: string
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
        Relationships: [
          {
            foreignKeyName: "art73_obligation_status_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "art73_obligation_status_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_leaderboard"
            referencedColumns: ["id"]
          },
        ]
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
          action: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
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
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          action: string
          attempts?: number
          cost_cents?: number | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          idempotency_key: string
          ip_hash?: string | null
          last_error?: string | null
          metadata?: Json
          result_id?: string | null
          status: string
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
        Relationships: [
          {
            foreignKeyName: "autopilot_runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          worker_name: string
        }
        Update: {
          enabled?: boolean
          updated_at?: string | null
          updated_by?: string | null
          worker_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "autopilot_worker_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          content_en: string
          content_tr: string
          created_at?: string
          generated_by?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title_en: string
          title_tr: string
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
          code: string
          description_en: string
          description_tr: string
          icon: string
          name_en: string
          name_tr: string
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
        }
        Insert: {
          actual_reward_cents?: number | null
          badge_awarded?: boolean
          created_at?: string
          estimated_reward_cents?: number | null
          id?: string
          incident_id: string
          notes?: string | null
          paid_at?: string | null
          provider_id?: string | null
          reporter_id: string
          severity_score?: number
          status?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
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
        }
        Relationships: [
          {
            foreignKeyName: "bug_bounties_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "feed_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bug_bounties_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bug_bounties_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents_localized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bug_bounties_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "moderation_sla"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bug_bounties_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bug_bounties_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bug_bounties_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bug_bounties_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          challenge_id: string
          created_at?: string
          description: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
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
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
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
          submission_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "challenge_submissions"
            referencedColumns: ["id"]
          },
        ]
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
          created_by: string
          description_en: string
          description_tr: string
          ends_at: string
          id?: string
          is_published?: boolean
          starts_at: string
          title_en: string
          title_tr: string
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
          consent_text_snapshot: string
          consent_type: string
          created_at?: string
          granted: boolean
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
        Relationships: [
          {
            foreignKeyName: "consent_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          consent_level: string
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
        Relationships: [
          {
            foreignKeyName: "cookie_consent_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          incident_id: string
          latency_ms?: number
          model: string
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
        Relationships: [
          {
            foreignKeyName: "cross_audit_runs_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "feed_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_audit_runs_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_audit_runs_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents_localized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_audit_runs_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "moderation_sla"
            referencedColumns: ["id"]
          },
        ]
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
          retention_period_months: number
          table_name: string
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
          user_id: string
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
          title_en: string
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
          id: string
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
          id?: string
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
          id?: string
          marketing_opt_in?: boolean
          reporter_notifications?: boolean
          source?: string | null
          updated_at?: string
          user_id?: string | null
          watches?: boolean
          weekly_digest?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "email_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sent_logs: {
        Row: {
          email_hash: string
          email_type: string
          id: string
          sent_at: string
        }
        Insert: {
          email_hash: string
          email_type: string
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
          file_name: string
          file_path: string
          file_size_bytes?: number | null
          height_px?: number | null
          id?: string
          incident_id: string
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
        Relationships: [
          {
            foreignKeyName: "evidence_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "feed_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents_localized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "moderation_sla"
            referencedColumns: ["id"]
          },
        ]
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
          expertise: string
          expertise_area?: string | null
          id?: string
          linkedin_url?: string | null
          name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title_institution: string
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
          id: string
          institution?: string | null
          is_active?: boolean
          name: string
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
        Relationships: [
          {
            foreignKeyName: "expert_network_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          external_url: string
          fetched_at?: string
          id?: string
          source: string
          source_score?: number
          status?: string
          title: string
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
          department: string
          id?: string
          institution: string
          proposal: string
          status?: string
          user_id: string
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
          metric_name: string
          recorded_at?: string
          service: string
          unit?: string | null
          value: number
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
          month: string
          service: string
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
          month: string
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
      incident_affected_users: {
        Row: {
          created_at: string
          incident_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          incident_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          incident_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_affected_users_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "feed_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_affected_users_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_affected_users_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents_localized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_affected_users_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "moderation_sla"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_affected_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          comment_text: string
          created_at?: string
          id?: string
          incident_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          incident_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_comments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "feed_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_comments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_comments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents_localized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_comments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "moderation_sla"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        }
        Insert: {
          created_at?: string
          id?: string
          incident_id: string
          ip_hash?: string | null
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          incident_id?: string
          ip_hash?: string | null
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "incident_votes_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "feed_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_votes_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_votes_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents_localized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_votes_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "moderation_sla"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          search_vector: unknown
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
          views_count: number
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
          description: string
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
          search_vector?: unknown
          severity?: Database["public"]["Enums"]["incident_severity"]
          shares_count?: number
          source_badge?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["incident_status"]
          title: string
          title_masked?: string | null
          title_tr?: string | null
          updated_at?: string
          upvotes_count?: number
          user_agent?: string | null
          user_id?: string | null
          views_count?: number
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
          search_vector?: unknown
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
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "incidents_ai_model_id_fkey"
            columns: ["ai_model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_ai_provider_id_fkey"
            columns: ["ai_provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_ai_provider_id_fkey"
            columns: ["ai_provider_id"]
            isOneToOne: false
            referencedRelation: "provider_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_expert_verifier_id_fkey"
            columns: ["expert_verifier_id"]
            isOneToOne: false
            referencedRelation: "expert_network"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        }
        Insert: {
          access_token_hash?: string | null
          approved_at?: string | null
          check_size: string
          company: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          linkedin_url: string
          status?: string
          title: string
          why_interested?: string | null
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
          description: string
          id: string
          name: string
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
          model_id: string
          sample_size?: number
          score: number
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
        Relationships: [
          {
            foreignKeyName: "k_model_scores_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "k_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "k_model_scores_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
        ]
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
          expires_at: string
          id?: string
          preview_token: string
          provider_id: string
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
        Relationships: [
          {
            foreignKeyName: "k_provider_previews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "k_provider_previews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_leaderboard"
            referencedColumns: ["id"]
          },
        ]
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
          platform: string
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
          institution: string
          joined_at?: string
          name: string
          role: string
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
          summary_en: string
          summary_tr: string
          version: string
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
          model_id: string
          status?: string
          title: string
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
        Relationships: [
          {
            foreignKeyName: "model_feature_requests_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_feature_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      model_feature_votes: {
        Row: {
          created_at: string
          request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          request_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_feature_votes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "model_feature_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_feature_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      model_review_votes: {
        Row: {
          created_at: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "model_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_review_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          model_id: string
          score_accuracy?: number | null
          score_creativity?: number | null
          score_overall: number
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
        Relationships: [
          {
            foreignKeyName: "model_reviews_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          email: string
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
        }
        Insert: {
          body_template: string
          created_at?: string
          id?: string
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template_type: string
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
          model_id: string
          score: number
          user_id: string
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
          email: string
          expires_at: string
          id?: string
          incident_id?: string | null
          token_hash: string
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
        Relationships: [
          {
            foreignKeyName: "provider_response_tokens_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "feed_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_response_tokens_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_response_tokens_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents_localized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_response_tokens_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "moderation_sla"
            referencedColumns: ["id"]
          },
        ]
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
          model_id: string
          threshold: number
          user_id: string
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
          incident_id: string
          processed_at?: string | null
          processed_by?: string | null
          provider_id: string
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
        Relationships: [
          {
            foreignKeyName: "redaction_requests_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "feed_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redaction_requests_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redaction_requests_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents_localized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redaction_requests_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "moderation_sla"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redaction_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redaction_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redaction_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_leaderboard"
            referencedColumns: ["id"]
          },
        ]
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
          platform: string
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
          asset_type: string
          created_at?: string
          file_url: string
          id?: string
          linked_post_id?: string | null
          tags?: string[]
          thumbnail_url?: string | null
          title: string
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
        Relationships: [
          {
            foreignKeyName: "social_assets_linked_post_id_fkey"
            columns: ["linked_post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
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
          body_text: string
          comments_count?: number
          content_type: string
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
          platform: string
          published_at?: string | null
          scheduled_at?: string | null
          shares_count?: number
          status?: string
          title: string
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
        Relationships: [
          {
            foreignKeyName: "social_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_linked_incident_id_fkey"
            columns: ["linked_incident_id"]
            isOneToOne: false
            referencedRelation: "feed_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_linked_incident_id_fkey"
            columns: ["linked_incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_linked_incident_id_fkey"
            columns: ["linked_incident_id"]
            isOneToOne: false
            referencedRelation: "incidents_localized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_linked_incident_id_fkey"
            columns: ["linked_incident_id"]
            isOneToOne: false
            referencedRelation: "moderation_sla"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_linked_news_id_fkey"
            columns: ["linked_news_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_news"
            referencedColumns: ["id"]
          },
        ]
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
          content_type: string
          created_at?: string
          example_output?: string | null
          id?: string
          name: string
          platform: string
          psychology_hook: string
          template_body: string
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
          id: string;
          run_id: string;
          model_id: string;
          model_name: string;
          question_index: number;
          question_id: string;
          section: string;
          answer_text: string | null;
          error_message: string | null;
          latency_ms: number | null;
          tokens_used: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          model_id: string;
          model_name: string;
          question_index: number;
          question_id: string;
          section: string;
          answer_text?: string | null;
          error_message?: string | null;
          latency_ms?: number | null;
          tokens_used?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          run_id?: string;
          model_id?: string;
          model_name?: string;
          question_index?: number;
          question_id?: string;
          section?: string;
          answer_text?: string | null;
          error_message?: string | null;
          latency_ms?: number | null;
          tokens_used?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "strategic_answers_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "strategic_runs"
            referencedColumns: ["id"]
          },
        ]
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
          id: string
          question: string
          section: string
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
          id: string;
          status: string;
          model_ids: string[];
          total_questions: number;
          total_answers: number;
          started_at: string;
          completed_at: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          status?: string;
          model_ids: string[];
          total_questions?: number;
          total_answers?: number;
          started_at?: string;
          completed_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          status?: string;
          model_ids?: string[];
          total_questions?: number;
          total_answers?: number;
          started_at?: string;
          completed_at?: string | null;
          created_by?: string | null;
        };
        Relationships: [];
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
          description: string
          id?: string
          priority?: string
          status?: string
          title: string
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
          quarter: string
          status?: string
          title: string
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
        Relationships: [
          {
            foreignKeyName: "strategy_milestones_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          code: string
          created_at?: string
          description?: string | null
          id?: string
          impact: number
          mitigation_plan?: string | null
          owner_user_id?: string | null
          probability: number
          status?: string
          target_date?: string | null
          title: string
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
        Relationships: [
          {
            foreignKeyName: "strategy_risks_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          category: string
          code: string
          country: string
          created_at?: string
          currency?: string
          deadline?: string | null
          fit_score?: number
          grantor: string
          id?: string
          max_amount_eur?: number | null
          name: string
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
          category: string
          created_at?: string
          description?: string | null
          id?: string
          owner_user_id?: string | null
          status?: string
          target_date?: string | null
          title: string
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
        Relationships: [
          {
            foreignKeyName: "strategy_swot_items_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          title: string
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
          method: string
          notes?: string | null
          result_pre_money: number
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
        Relationships: [
          {
            foreignKeyName: "strategy_valuations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          graduation_year: number
          id?: string
          status?: string
          university: string
          user_id: string
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
          ip_hash: string
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
          fingerprint: string
          id?: string
          incident_id: string
          ip_hash: string
        }
        Update: {
          created_at?: string
          fingerprint?: string
          id?: string
          incident_id?: string
          ip_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_fingerprints_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "feed_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_fingerprints_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_fingerprints_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents_localized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_fingerprints_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "moderation_sla"
            referencedColumns: ["id"]
          },
        ]
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
          user_id: string
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
        }
        Relationships: []
      }
      suggestion_votes: {
        Row: {
          created_at: string
          suggestion_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          suggestion_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          suggestion_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_votes_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestion_votes_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions_localized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestion_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          description: string
          description_tr?: string | null
          id?: string
          is_anonymous?: boolean
          status?: Database["public"]["Enums"]["suggestion_status"]
          title: string
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
        Relationships: [
          {
            foreignKeyName: "suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          appellant_name: string
          appellant_email: string
          reason: string
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
        Relationships: [
          {
            foreignKeyName: "takedown_appeals_takedown_id_fkey"
            columns: ["takedown_id"]
            isOneToOne: false
            referencedRelation: "takedown_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "takedown_appeals_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          }
        ]
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
          reason: string
          requester_email: string
          requester_name: string
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
        Relationships: [
          {
            foreignKeyName: "takedown_requests_assigned_moderator_id_fkey"
            columns: ["assigned_moderator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "takedown_requests_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "feed_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "takedown_requests_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "takedown_requests_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents_localized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "takedown_requests_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "moderation_sla"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "takedown_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "takedown_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          action_taken: string
          created_at?: string
          id?: string
          is_published?: boolean
          request_type: string
          requested_at?: string
          requested_by_category: string
          summary_en: string
          summary_tr: string
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
          badge_icon: string
          badge_name: string
          description?: string | null
          id?: string
          user_id: string
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
        }
        Insert: {
          awarded_at?: string
          badge_code: string
          bounty_id?: string | null
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_code?: string
          bounty_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bounty_badges_badge_code_fkey"
            columns: ["badge_code"]
            isOneToOne: false
            referencedRelation: "bounty_badges"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "user_bounty_badges_bounty_id_fkey"
            columns: ["bounty_id"]
            isOneToOne: false
            referencedRelation: "bug_bounties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bounty_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_provider_watches: {
        Row: {
          created_at: string
          provider_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          provider_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          provider_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_provider_watches_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_provider_watches_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_provider_watches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        }
        Relationships: []
      }
      whistleblower_submissions: {
        Row: {
          category: string
          encrypted_content: string
          id: string
          provider_hint: string | null
          status: string
          submitted_at: string
        }
        Insert: {
          category: string
          encrypted_content: string
          id?: string
          provider_hint?: string | null
          status?: string
          submitted_at?: string
        }
        Update: {
          category?: string
          encrypted_content?: string
          id?: string
          provider_hint?: string | null
          status?: string
          submitted_at?: string
        }
        Relationships: []
      }
      vendor_trust_rankings: {
        Row: {
          id: string;
          provider_slug: string;
          provider_name: string;
          composite_score: number;
          incident_penalty: number;
          response_rate_bonus: number;
          ranking_tier: string;
          last_evaluated_at: string;
        };
        Insert: {
          id?: string;
          provider_slug: string;
          provider_name: string;
          composite_score?: number;
          incident_penalty?: number;
          response_rate_bonus?: number;
          ranking_tier: string;
          last_evaluated_at?: string;
        };
        Update: {
          id?: string;
          provider_slug?: string;
          provider_name?: string;
          composite_score?: number;
          incident_penalty?: number;
          response_rate_bonus?: number;
          ranking_tier?: string;
          last_evaluated_at?: string;
        };
        Relationships: [];
      }
      slopsquatting_reports: {
        Row: {
          id: string;
          package_name: string;
          ecosystem: string;
          hallucinated_by_model_id: string | null;
          first_seen_at: string;
          confirmed_real: boolean;
          source_url: string | null;
          reporter_ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          package_name: string;
          ecosystem: string;
          hallucinated_by_model_id?: string | null;
          first_seen_at?: string;
          confirmed_real?: boolean;
          source_url?: string | null;
          reporter_ip_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          package_name?: string;
          ecosystem?: string;
          hallucinated_by_model_id?: string | null;
          first_seen_at?: string;
          confirmed_real?: boolean;
          source_url?: string | null;
          reporter_ip_hash?: string | null;
          created_at?: string;
        };
        Relationships: [];
      }
      vertical_playbooks: {
        Row: {
          id: string;
          sector: string;
          title: string;
          framework: string;
          summary: string;
          checklist: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sector: string;
          title: string;
          framework: string;
          summary: string;
          checklist?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sector?: string;
          title?: string;
          framework?: string;
          summary?: string;
          checklist?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      }
      jailbreak_samples: {
        Row: {
          id: string;
          title: string;
          technique: string;
          severity: string;
          prompt_masked: string;
          target_model: string;
          reproducible: boolean;
          mitigation: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          technique: string;
          severity: string;
          prompt_masked: string;
          target_model: string;
          reproducible?: boolean;
          mitigation?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          technique?: string;
          severity?: string;
          prompt_masked?: string;
          target_model?: string;
          reproducible?: boolean;
          mitigation?: string | null;
          created_at?: string;
        };
        Relationships: [];
      }
      bench_tr_evaluations: {
        Row: {
          id: string;
          model_name: string;
          provider_slug: string;
          tr_grammar_score: number;
          tr_bias_score: number;
          tr_factuality_pct: number;
          eval_dataset_ver: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          model_name: string;
          provider_slug: string;
          tr_grammar_score: number;
          tr_bias_score: number;
          tr_factuality_pct: number;
          eval_dataset_ver?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          model_name?: string;
          provider_slug?: string;
          tr_grammar_score?: number;
          tr_bias_score?: number;
          tr_factuality_pct?: number;
          eval_dataset_ver?: string;
          created_at?: string;
        };
        Relationships: [];
      }
      vendor_quotas: {
        Row: {
          limit_value: number | null;
          metric: string;
          period_end: string;
          period_start: string;
          plan_name: string | null;
          source: string;
          unit: string;
          updated_at: string;
          used_value: number | null;
          vendor: string;
        };
        Insert: {
          limit_value?: number | null;
          metric: string;
          period_end: string;
          period_start: string;
          plan_name?: string | null;
          source?: string;
          unit: string;
          updated_at?: string;
          used_value?: number | null;
          vendor: string;
        };
        Update: {
          limit_value?: number | null;
          metric?: string;
          period_end?: string;
          period_start?: string;
          plan_name?: string | null;
          source?: string;
          unit?: string;
          updated_at?: string;
          used_value?: number | null;
          vendor?: string;
        };
        Relationships: [];
      }
    }
    Views: {
      feed_incidents: {
        Row: {
          affected_users_count: number | null
          ai_model_id: string | null
          ai_moderation_reason: string | null
          ai_moderation_score: number | null
          ai_provider_id: string | null
          category: Database["public"]["Enums"]["incident_category"] | null
          comments_count: number | null
          contains_pii: boolean | null
          created_at: string | null
          cross_audit_completed_at: string | null
          cross_audit_confidence: number | null
          cross_audit_model: string | null
          cross_audit_reasoning: string | null
          cross_audit_triage_models: string[] | null
          cross_audit_truth_score: number | null
          description: string | null
          description_masked: string | null
          description_tr: string | null
          feed_score: number | null
          id: string | null
          incident_date: string | null
          ip_hash: string | null
          is_anonymous: boolean | null
          language: string | null
          location_country: string | null
          model_custom_name: string | null
          moderated_at: string | null
          moderation_note: string | null
          moderator_id: string | null
          moderator_notes: string | null
          pii_categories: string[] | null
          provider_custom_name: string | null
          published_at: string | null
          reviewed_at: string | null
          search_vector: unknown
          severity: Database["public"]["Enums"]["incident_severity"] | null
          shares_count: number | null
          source_url: string | null
          status: Database["public"]["Enums"]["incident_status"] | null
          title: string | null
          title_masked: string | null
          title_tr: string | null
          updated_at: string | null
          upvotes_count: number | null
          user_agent: string | null
          user_id: string | null
          views_count: number | null
        }
        Insert: {
          affected_users_count?: number | null
          ai_model_id?: string | null
          ai_moderation_reason?: string | null
          ai_moderation_score?: number | null
          ai_provider_id?: string | null
          category?: Database["public"]["Enums"]["incident_category"] | null
          comments_count?: number | null
          contains_pii?: boolean | null
          created_at?: string | null
          cross_audit_completed_at?: string | null
          cross_audit_confidence?: number | null
          cross_audit_model?: string | null
          cross_audit_reasoning?: string | null
          cross_audit_triage_models?: string[] | null
          cross_audit_truth_score?: number | null
          description?: string | null
          description_masked?: string | null
          description_tr?: string | null
          feed_score?: never
          id?: string | null
          incident_date?: string | null
          ip_hash?: string | null
          is_anonymous?: boolean | null
          language?: string | null
          location_country?: string | null
          model_custom_name?: string | null
          moderated_at?: string | null
          moderation_note?: string | null
          moderator_id?: string | null
          moderator_notes?: string | null
          pii_categories?: string[] | null
          provider_custom_name?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          search_vector?: unknown
          severity?: Database["public"]["Enums"]["incident_severity"] | null
          shares_count?: number | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          title?: string | null
          title_masked?: string | null
          title_tr?: string | null
          updated_at?: string | null
          upvotes_count?: number | null
          user_agent?: string | null
          user_id?: string | null
          views_count?: number | null
        }
        Update: {
          affected_users_count?: number | null
          ai_model_id?: string | null
          ai_moderation_reason?: string | null
          ai_moderation_score?: number | null
          ai_provider_id?: string | null
          category?: Database["public"]["Enums"]["incident_category"] | null
          comments_count?: number | null
          contains_pii?: boolean | null
          created_at?: string | null
          cross_audit_completed_at?: string | null
          cross_audit_confidence?: number | null
          cross_audit_model?: string | null
          cross_audit_reasoning?: string | null
          cross_audit_triage_models?: string[] | null
          cross_audit_truth_score?: number | null
          description?: string | null
          description_masked?: string | null
          description_tr?: string | null
          feed_score?: never
          id?: string | null
          incident_date?: string | null
          ip_hash?: string | null
          is_anonymous?: boolean | null
          language?: string | null
          location_country?: string | null
          model_custom_name?: string | null
          moderated_at?: string | null
          moderation_note?: string | null
          moderator_id?: string | null
          moderator_notes?: string | null
          pii_categories?: string[] | null
          provider_custom_name?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          search_vector?: unknown
          severity?: Database["public"]["Enums"]["incident_severity"] | null
          shares_count?: number | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          title?: string | null
          title_masked?: string | null
          title_tr?: string | null
          updated_at?: string | null
          upvotes_count?: number | null
          user_agent?: string | null
          user_id?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_ai_model_id_fkey"
            columns: ["ai_model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_ai_provider_id_fkey"
            columns: ["ai_provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_ai_provider_id_fkey"
            columns: ["ai_provider_id"]
            isOneToOne: false
            referencedRelation: "provider_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents_localized: {
        Row: {
          affected_users_count: number | null
          ai_model_id: string | null
          ai_moderation_reason: string | null
          ai_moderation_score: number | null
          ai_provider_id: string | null
          category: Database["public"]["Enums"]["incident_category"] | null
          comments_count: number | null
          contains_pii: boolean | null
          created_at: string | null
          cross_audit_completed_at: string | null
          cross_audit_confidence: number | null
          cross_audit_model: string | null
          cross_audit_reasoning: string | null
          cross_audit_triage_models: string[] | null
          cross_audit_truth_score: number | null
          description: string | null
          description_display: string | null
          description_masked: string | null
          description_tr: string | null
          eu_act_data_privacy_score: number | null
          eu_act_non_discrimination_score: number | null
          eu_act_risk_category: string | null
          eu_act_transparency_score: number | null
          id: string | null
          import_attribution: string | null
          import_external_id: string | null
          incident_date: string | null
          incident_source: string | null
          ip_hash: string | null
          is_anonymous: boolean | null
          language: string | null
          location_country: string | null
          model_custom_name: string | null
          moderated_at: string | null
          moderation_note: string | null
          moderator_id: string | null
          moderator_notes: string | null
          pii_categories: string[] | null
          provider_custom_name: string | null
          published_at: string | null
          reviewed_at: string | null
          search_vector: unknown
          severity: Database["public"]["Enums"]["incident_severity"] | null
          shares_count: number | null
          source_url: string | null
          status: Database["public"]["Enums"]["incident_status"] | null
          title: string | null
          title_display: string | null
          title_masked: string | null
          title_tr: string | null
          updated_at: string | null
          upvotes_count: number | null
          user_agent: string | null
          user_id: string | null
          views_count: number | null
        }
        Insert: {
          affected_users_count?: number | null
          ai_model_id?: string | null
          ai_moderation_reason?: string | null
          ai_moderation_score?: number | null
          ai_provider_id?: string | null
          category?: Database["public"]["Enums"]["incident_category"] | null
          comments_count?: number | null
          contains_pii?: boolean | null
          created_at?: string | null
          cross_audit_completed_at?: string | null
          cross_audit_confidence?: number | null
          cross_audit_model?: string | null
          cross_audit_reasoning?: string | null
          cross_audit_triage_models?: string[] | null
          cross_audit_truth_score?: number | null
          description?: string | null
          description_display?: never
          description_masked?: string | null
          description_tr?: string | null
          eu_act_data_privacy_score?: number | null
          eu_act_non_discrimination_score?: number | null
          eu_act_risk_category?: string | null
          eu_act_transparency_score?: number | null
          id?: string | null
          import_attribution?: string | null
          import_external_id?: string | null
          incident_date?: string | null
          incident_source?: string | null
          ip_hash?: string | null
          is_anonymous?: boolean | null
          language?: string | null
          location_country?: string | null
          model_custom_name?: string | null
          moderated_at?: string | null
          moderation_note?: string | null
          moderator_id?: string | null
          moderator_notes?: string | null
          pii_categories?: string[] | null
          provider_custom_name?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          search_vector?: unknown
          severity?: Database["public"]["Enums"]["incident_severity"] | null
          shares_count?: number | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          title?: string | null
          title_display?: never
          title_masked?: string | null
          title_tr?: string | null
          updated_at?: string | null
          upvotes_count?: number | null
          user_agent?: string | null
          user_id?: string | null
          views_count?: number | null
        }
        Update: {
          affected_users_count?: number | null
          ai_model_id?: string | null
          ai_moderation_reason?: string | null
          ai_moderation_score?: number | null
          ai_provider_id?: string | null
          category?: Database["public"]["Enums"]["incident_category"] | null
          comments_count?: number | null
          contains_pii?: boolean | null
          created_at?: string | null
          cross_audit_completed_at?: string | null
          cross_audit_confidence?: number | null
          cross_audit_model?: string | null
          cross_audit_reasoning?: string | null
          cross_audit_triage_models?: string[] | null
          cross_audit_truth_score?: number | null
          description?: string | null
          description_display?: never
          description_masked?: string | null
          description_tr?: string | null
          eu_act_data_privacy_score?: number | null
          eu_act_non_discrimination_score?: number | null
          eu_act_risk_category?: string | null
          eu_act_transparency_score?: number | null
          id?: string | null
          import_attribution?: string | null
          import_external_id?: string | null
          incident_date?: string | null
          incident_source?: string | null
          ip_hash?: string | null
          is_anonymous?: boolean | null
          language?: string | null
          location_country?: string | null
          model_custom_name?: string | null
          moderated_at?: string | null
          moderation_note?: string | null
          moderator_id?: string | null
          moderator_notes?: string | null
          pii_categories?: string[] | null
          provider_custom_name?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          search_vector?: unknown
          severity?: Database["public"]["Enums"]["incident_severity"] | null
          shares_count?: number | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          title?: string | null
          title_display?: never
          title_masked?: string | null
          title_tr?: string | null
          updated_at?: string | null
          upvotes_count?: number | null
          user_agent?: string | null
          user_id?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_ai_model_id_fkey"
            columns: ["ai_model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_ai_provider_id_fkey"
            columns: ["ai_provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_ai_provider_id_fkey"
            columns: ["ai_provider_id"]
            isOneToOne: false
            referencedRelation: "provider_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      k_model_scores_history: {
        Row: {
          category_id: string | null
          model_id: string | null
          sample_size: number | null
          score: number | null
          snapshot_at: string | null
          wilson_lower: number | null
          wilson_upper: number | null
        }
        Relationships: [
          {
            foreignKeyName: "k_model_scores_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "k_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "k_model_scores_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_sla: {
        Row: {
          created_at: string | null
          id: string | null
          reviewed_at: string | null
          sla_met: boolean | null
          status: Database["public"]["Enums"]["incident_status"] | null
          title_masked: string | null
          triage_duration_hours: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          reviewed_at?: string | null
          sla_met?: never
          status?: Database["public"]["Enums"]["incident_status"] | null
          title_masked?: string | null
          triage_duration_hours?: never
        }
        Update: {
          created_at?: string | null
          id?: string | null
          reviewed_at?: string | null
          sla_met?: never
          status?: Database["public"]["Enums"]["incident_status"] | null
          title_masked?: string | null
          triage_duration_hours?: never
        }
        Relationships: []
      }
      provider_leaderboard: {
        Row: {
          id: string | null
          incident_count: number | null
          is_verified: boolean | null
          is_verified_respondent: boolean | null
          logo_url: string | null
          name: string | null
          response_count: number | null
          slug: string | null
          trust_score: number | null
          website_url: string | null
        }
        Relationships: []
      }
      suggestions_localized: {
        Row: {
          category: string | null
          comments_count: number | null
          created_at: string | null
          description: string | null
          description_display: string | null
          description_tr: string | null
          id: string | null
          is_anonymous: boolean | null
          status: Database["public"]["Enums"]["suggestion_status"] | null
          title: string | null
          title_display: string | null
          title_tr: string | null
          updated_at: string | null
          upvotes_count: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          description_display?: never
          description_tr?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          status?: Database["public"]["Enums"]["suggestion_status"] | null
          title?: string | null
          title_display?: never
          title_tr?: string | null
          updated_at?: string | null
          upvotes_count?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          description_display?: never
          description_tr?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          status?: Database["public"]["Enums"]["suggestion_status"] | null
          title?: string | null
          title_display?: never
          title_tr?: string | null
          updated_at?: string | null
          upvotes_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transparency_stats: {
        Row: {
          provider_response_rate: number | null
          total_incidents: number | null
          verified_this_week: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_incident_duplicate: {
        Args: { title_to_check: string }
        Returns: {
          incident_id: string
          similarity_score: number
        }[]
      }
      get_ai_gateway_costs: { Args: { time_interval: string }; Returns: number }
      get_database_size: { Args: never; Returns: number }
      get_incident_weight_class_stats: {
        Args: never
        Returns: {
          weight_class: Database["public"]["Enums"]["model_weight_class"]
          incident_count: number
        }[]
      }
      get_request_ip: { Args: never; Returns: string }
      get_storage_size: { Args: never; Returns: number }
      increment_incident_views: {
        Args: { p_incident_id: string }
        Returns: undefined
      }
      increment_poll_count: {
        Args: { p_choice: string; p_poll_id: string }
        Returns: undefined
      }
      is_admin: { Args: { uid: string }; Returns: boolean }
      is_advisor: { Args: { uid: string }; Returns: boolean }
      is_ceo: { Args: { uid: string }; Returns: boolean }
      is_moderator: { Args: { uid: string }; Returns: boolean }
      normalize_takedown_status: {
        Args: { s: string }
        Returns: Database["public"]["Enums"]["takedown_status"]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
        | "other"
      incident_severity: "low" | "medium" | "high" | "critical"
      incident_status:
        | "pending_review"
        | "published"
        | "rejected"
        | "archived"
        | "takedown"
      model_weight_class: "open" | "closed" | "unknown"
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
