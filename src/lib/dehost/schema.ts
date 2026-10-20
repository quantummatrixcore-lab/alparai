let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }

/**
 * Sovereign DeHost Database Schema, RLS Policies & Client Abstraction (WO-004 B5 Full Port)
 * Unified schema definition ported from DeHost PostgreSQL migrations.
 * Designed for DeHost dedicated Xeon infrastructure (Zero external coupling).
 * 
 * Rules:
 * - Password MUST be loaded exclusively from environment variables ((vault.read('DATABASE_URL') ?? process.env.DATABASE_URL) or (vault.read('DEHOST_PASSWORD') ?? process.env.DEHOST_PASSWORD)).
 * - Zero hardcoded password fallbacks.
 */

export interface DeHostUser {
  id: string;
  email: string;
  role: 'user' | 'moderator' | 'advisor' | 'admin' | 'ceo';
  created_at: string;
  updated_at: string;
}

export interface DeHostIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'verified' | 'rejected';
  provider_id?: string;
  model_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DeHostAIProvider {
  id: string;
  name: string;
  slug: string;
  trust_score: number;
  created_at: string;
}

export interface DeHostAIModel {
  id: string;
  name: string;
  provider_id: string;
  context_window: number;
  created_at: string;
}

export interface DeHostBlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  published_at: string;
}

export interface DeHostWhistleblowerSubmission {
  id: string;
  encrypted_content: string;
  sha256_proof: string;
  status: 'pending' | 'reviewed' | 'published';
  created_at: string;
}

export interface DeHostAuditLog {
  id: string;
  actor_id: string;
  action: string;
  target_resource: string;
  ip_hash: string;
  created_at: string;
}

export interface DeHostApiKey {
  id: string;
  key_hash: string;
  user_id: string;
  scopes: string[];
  expires_at?: string;
  created_at: string;
}

export interface DeHostBounty {
  id: string;
  title: string;
  reward_amount: number;
  status: 'open' | 'claimed' | 'closed';
  created_at: string;
}

export interface DeHostAIPoll {
  id: string;
  question: string;
  options: Record<string, number>;
  active: boolean;
  created_at: string;
}

export interface DeHostRLSPolicy {
  table_name: string;
  policy_name: string;
  definition: string;
  roles: string[];
}

export interface DeHostSchemaConfig {
  connectionString: string;
  poolSize: number;
  ssl: boolean;
  isolationLevel: 'read_committed' | 'serializable';
}

/**
 * Complete list of all 125+ database tables in DeHost schema
 */
export const DEHOST_TABLE_REGISTRY = [
  'admin_login_events',
  'advisory_board_members',
  'age_declarations',
  'agent_ecosystem_intel',
  'agent_episodic_memory',
  'ai_free_models',
  'ai_models',
  'ai_poll_votes',
  'ai_polls',
  'ai_provider_responses',
  'ai_providers',
  'ai_rap_sheet_entries',
  'ai_routing_chains',
  'ai_scoring_config',
  'ai_trust_ledger',
  'ai_trust_scores',
  'ai_velocity_metrics',
  'api_keys',
  'art50_transparency_status',
  'art73_obligation_status',
  'audit_log',
  'automation_tasks',
  'autopilot_runs',
  'autopilot_worker_config',
  'bench_tr_evaluations',
  'bilge_memory',
  'blog_posts',
  'bounty_badges',
  'bug_bounties',
  'cease_and_desist_logs',
  'challenge_submissions',
  'challenge_votes',
  'challenges',
  'consent_log',
  'cookie_consent_log',
  'cost_log',
  'cron_job_logs',
  'cross_audit_runs',
  'data_retention_policies',
  'dora_metrics',
  'dsar_requests',
  'ecosystem_news',
  'email_preferences',
  'email_sent_logs',
  'evidence',
  'expert_applications',
  'expert_network',
  'external_incidents_queue',
  'feature_flags',
  'fellowship_applications',
  'finance_api_usage',
  'finance_monthly_costs',
  'finance_revenue_metrics',
  'financial_velocity_projections',
  'financials',
  'funnel_events',
  'geo_citations',
  'geo_scores',
  'grant_applications',
  'heartbeats',
  'incident_affected_users',
  'incident_comments',
  'incident_translations',
  'incident_votes',
  'incidents',
  'investor_applications',
  'jailbreak_samples',
  'jurors',
  'jury_cases',
  'jury_votes',
  'k_benchmark_evaluations',
  'k_benchmark_question_bank',
  'k_categories',
  'k_model_scores',
  'k_provider_previews',
  'linkedin_contacts',
  'marketing_drafts',
  'methodology_committee_members',
  'methodology_versions',
  'model_feature_requests',
  'model_feature_votes',
  'model_review_votes',
  'model_reviews',
  'newsletter_subscribers',
  'outreach_queue',
  'persona_usage_stats',
  'platform_signups',
  'platform_statistics',
  'private_benchmarks',
  'provider_response_tokens',
  'rating_alerts',
  'redaction_requests',
  'reputation_logs',
  'sla_alarms',
  'slopsquatting_reports',
  'social_accounts',
  'social_assets',
  'social_posts',
  'social_templates',
  'strategic_answers',
  'strategic_questions',
  'strategic_runs',
  'strategy_innovations',
  'strategy_metrics_snapshots',
  'strategy_milestones',
  'strategy_risks',
  'strategy_state_support',
  'strategy_swot_items',
  'strategy_todos',
  'strategy_valuations',
  'student_ambassadors',
  'submission_attempts',
  'submission_fingerprints',
  'subscriptions',
  'suggestion_comments',
  'suggestion_votes',
  'suggestions',
  'sybil_detection_logs',
  'system_flags',
  'takedown_appeals',
  'takedown_requests',
  'tasks',
  'telemetry',
  'transparency_reports',
  'user_badges',
  'user_bounty_badges',
  'user_provider_watches',
  'user_reputation',
  'users',
  'vendor_quotas',
  'vendor_trust_rankings',
  'vertical_playbooks',
  'wall_of_shame_entries',
  'webhooks',
  'whistleblower_submissions',
] as const;

export type DeHostTableName = typeof DEHOST_TABLE_REGISTRY[number];

/**
 * Resolves DeHost connection string strictly from environment variables.
 * Fails closed if no database URL or password is set in environment.
 */
export function getDeHostConnectionString(): string {
  if ((vault.read('DATABASE_URL') ?? process.env.DATABASE_URL)) {
    return (vault.read('DATABASE_URL') ?? process.env.DATABASE_URL) as string;
  }
  if ((vault.read('DEHOST_HOST') ?? process.env.DEHOST_HOST) && (vault.read('DEHOST_PASSWORD') ?? process.env.DEHOST_PASSWORD)) {
    const user = (vault.read('DEHOST_USER') ?? process.env.DEHOST_USER) || 'dehost';
    const host = (vault.read('DEHOST_HOST') ?? process.env.DEHOST_HOST);
    const port = (vault.read('DEHOST_PORT') ?? process.env.DEHOST_PORT) || ((vault.read('NODE_ENV') ?? process.env.NODE_ENV) === 'production' ? '6543' : '5432');
    const db = (vault.read('DEHOST_DB') ?? process.env.DEHOST_DB) || 'alparai';
    return `postgresql://${user}:${(vault.read('DEHOST_PASSWORD') ?? process.env.DEHOST_PASSWORD)}@${host}:${port}/${db}`;
  }
  return '';
}

export const DEHOST_DEFAULT_CONFIG: DeHostSchemaConfig = {
  connectionString: getDeHostConnectionString(),
  poolSize: Number((vault.read('DEHOST_POOL_SIZE') ?? process.env.DEHOST_POOL_SIZE)) || 20,
  ssl: (vault.read('NODE_ENV') ?? process.env.NODE_ENV) === 'production',
  isolationLevel: 'read_committed',
};

export const DEHOST_RLS_POLICIES: DeHostRLSPolicy[] = [
  {
    table_name: 'incidents',
    policy_name: 'public_read_incidents',
    definition: 'FOR SELECT USING (status = \'verified\')',
    roles: ['anon', 'authenticated'],
  },
  {
    table_name: 'incidents',
    policy_name: 'mod_all_incidents',
    definition: 'FOR ALL USING (auth.jwt() ->> \'role\' IN (\'moderator\', \'admin\', \'ceo\'))',
    roles: ['authenticated'],
  },
  {
    table_name: 'whistleblower_submissions',
    policy_name: 'insert_submission',
    definition: 'FOR INSERT WITH CHECK (true)',
    roles: ['anon', 'authenticated'],
  },
  {
    table_name: 'audit_log',
    policy_name: 'admin_audit_read',
    definition: 'FOR SELECT USING (auth.jwt() ->> \'role\' = \'admin\')',
    roles: ['authenticated'],
  },
];

export class DeHostClient {
  private config: DeHostSchemaConfig;

  constructor(config: DeHostSchemaConfig = DEHOST_DEFAULT_CONFIG) {
    this.config = config;
  }

  public isAlive(): boolean {
    return Boolean(this.config.connectionString || (vault.read('ERCUOS_API_URL') ?? process.env.ERCUOS_API_URL));
  }

  public getTables(): readonly string[] {
    return DEHOST_TABLE_REGISTRY;
  }

  public getRLSPolicies(): DeHostRLSPolicy[] {
    return DEHOST_RLS_POLICIES;
  }
}

export const dehostClient = new DeHostClient();
