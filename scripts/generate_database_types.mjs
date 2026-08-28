import fs from 'fs';
import path from 'path';

// Load AST of existing database.ts if available
const existingAst = JSON.parse(fs.readFileSync('D:/01_SaaS_Products/Alparai/scratch/database_ts_ast.json', 'utf8'));

const migrationsDir = 'D:/01_SaaS_Products/Alparai/supabase/migrations';
const sqlFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

// Also check benchmark_indexing_and_rls.sql
const extraSqlPath = 'D:/01_SaaS_Products/Alparai/supabase/benchmark_indexing_and_rls.sql';
if (fs.existsSync(extraSqlPath)) {
  sqlFiles.push('../benchmark_indexing_and_rls.sql');
}

console.log(`Processing ${sqlFiles.length} migration/sql files...`);

// Mapping of SQL types to TypeScript types
function mapSqlType(sqlType, colName) {
  let clean = sqlType.trim().toLowerCase().replace(/;/g, '');
  
  if (clean.includes('references auth.users') || clean.includes('references public.users') || clean.startsWith('uuid')) {
    return 'string';
  }
  if (clean.startsWith('text[]') || clean.startsWith('varchar[]') || clean.startsWith('character varying[]')) {
    return 'string[]';
  }
  if (clean.startsWith('jsonb[]') || clean.startsWith('json[]')) {
    return 'Json[]';
  }
  if (clean.startsWith('text') || clean.startsWith('varchar') || clean.startsWith('character varying') || clean.startsWith('citext') || clean.startsWith('inet') || clean.startsWith('cidr')) {
    return 'string';
  }
  if (clean.startsWith('bool')) {
    return 'boolean';
  }
  if (clean.startsWith('int') || clean.startsWith('bigint') || clean.startsWith('smallint') || clean.startsWith('serial') || clean.startsWith('bigserial') || clean.startsWith('numeric') || clean.startsWith('decimal') || clean.startsWith('real') || clean.startsWith('double') || clean.startsWith('float')) {
    return 'number';
  }
  if (clean.startsWith('timestamptz') || clean.startsWith('timestamp') || clean.startsWith('date') || clean.startsWith('time')) {
    return 'string';
  }
  if (clean.startsWith('json') || clean.startsWith('jsonb')) {
    return 'Json';
  }
  if (clean.startsWith('vector')) {
    return 'string';
  }
  if (clean.startsWith('user_role')) {
    return 'Database["public"]["Enums"]["user_role"]';
  }
  if (clean.startsWith('incident_category')) {
    return 'Database["public"]["Enums"]["incident_category"]';
  }
  if (clean.startsWith('incident_severity')) {
    return 'Database["public"]["Enums"]["incident_severity"]';
  }
  if (clean.startsWith('incident_status')) {
    return 'Database["public"]["Enums"]["incident_status"]';
  }
  if (clean.startsWith('suggestion_status')) {
    return 'Database["public"]["Enums"]["suggestion_status"]';
  }
  if (clean.startsWith('takedown_status')) {
    return 'Database["public"]["Enums"]["takedown_status"]';
  }
  if (clean.startsWith('evidence_kind')) {
    return 'Database["public"]["Enums"]["evidence_kind"]';
  }
  if (clean.startsWith('model_weight_class')) {
    return 'Database["public"]["Enums"]["model_weight_class"]';
  }
  if (clean.startsWith('question_bank_status')) {
    return 'Database["public"]["Enums"]["question_bank_status"]';
  }
  
  return 'string';
}

// Check nullability and optionality
function parseColumnLine(line) {
  line = line.trim();
  if (!line || line.startsWith('--') || line.startsWith('CONSTRAINT') || line.startsWith('PRIMARY KEY') || line.startsWith('FOREIGN KEY') || line.startsWith('CHECK') || line.startsWith('UNIQUE')) {
    return null;
  }
  
  // match column name and definition
  const match = line.match(/^([a-zA-Z0-9_]+)\s+([^,]+)/);
  if (!match) return null;
  
  const colName = match[1];
  let colDef = match[2].trim().replace(/,$/, '');
  
  const isNotNull = /NOT\s+NULL/i.test(colDef);
  const hasDefault = /DEFAULT/i.test(colDef) || /GENERATED/i.test(colDef) || /SERIAL/i.test(colDef);
  const isPrimaryKey = /PRIMARY\s+KEY/i.test(colDef);
  
  const tsType = mapSqlType(colDef, colName);
  
  return {
    name: colName,
    tsType: tsType,
    isNullable: !isNotNull && !isPrimaryKey,
    hasDefault: hasDefault || isPrimaryKey || (!isNotNull && !isPrimaryKey)
  };
}

const allTables = {};

// Start with all tables from existing AST to keep exact fidelity
for (const [tName, cols] of Object.entries(existingAst.tables)) {
  allTables[tName] = {};
  for (const [cName, cInfo] of Object.entries(cols)) {
    allTables[tName][cName] = {
      name: cName,
      type: cInfo.type,
      isNullable: cInfo.type.includes('null'),
      hasDefault: true
    };
  }
}

// Now parse all migrations and update/add tables
for (const file of sqlFiles) {
  const filePath = file.startsWith('../') ? path.join(migrationsDir, file) : path.join(migrationsDir, file);
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find CREATE TABLE statements
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;
  let match;
  while ((match = createTableRegex.exec(content)) !== null) {
    const tableName = match[1];
    const body = match[2];
    
    if (!allTables[tableName]) {
      allTables[tableName] = {};
    }
    
    const lines = body.split('\n');
    for (const line of lines) {
      const colInfo = parseColumnLine(line);
      if (colInfo) {
        if (!allTables[tableName][colInfo.name]) {
          const rowType = colInfo.isNullable ? `${colInfo.tsType} | null` : colInfo.tsType;
          allTables[tableName][colInfo.name] = {
            name: colInfo.name,
            type: rowType,
            isNullable: colInfo.isNullable,
            hasDefault: colInfo.hasDefault
          };
        }
      }
    }
  }
  
  // Find ALTER TABLE ADD COLUMN statements
  const alterRegex = /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s+([^,;]+)/gi;
  while ((match = alterRegex.exec(content)) !== null) {
    const tableName = match[1];
    const colName = match[2];
    const colDef = match[3].trim();
    
    if (!allTables[tableName]) {
      allTables[tableName] = {};
    }
    
    const isNotNull = /NOT\s+NULL/i.test(colDef);
    const hasDefault = /DEFAULT/i.test(colDef) || /GENERATED/i.test(colDef);
    const isNullable = !isNotNull;
    const tsBaseType = mapSqlType(colDef, colName);
    const rowType = isNullable ? `${tsBaseType} | null` : tsBaseType;
    
    allTables[tableName][colName] = {
      name: colName,
      type: rowType,
      isNullable: isNullable,
      hasDefault: hasDefault || isNullable
    };
  }
}

// Add specific types for latest tables:
// 1. users table latest updates
if (allTables.users) {
  allTables.users.id = { name: 'id', type: 'string', isNullable: false, hasDefault: false };
  allTables.users.email = { name: 'email', type: 'string', isNullable: false, hasDefault: false };
  allTables.users.username = { name: 'username', type: 'string | null', isNullable: true, hasDefault: true };
  allTables.users.full_name = { name: 'full_name', type: 'string | null', isNullable: true, hasDefault: true };
  allTables.users.avatar_url = { name: 'avatar_url', type: 'string | null', isNullable: true, hasDefault: true };
  allTables.users.bio = { name: 'bio', type: 'string | null', isNullable: true, hasDefault: true };
  allTables.users.role = { name: 'role', type: 'Database["public"]["Enums"]["user_role"]', isNullable: false, hasDefault: true };
  allTables.users.community_role = { name: 'community_role', type: 'string | null', isNullable: true, hasDefault: true };
  allTables.users.is_verified = { name: 'is_verified', type: 'boolean', isNullable: false, hasDefault: true };
  allTables.users.is_admin = { name: 'is_admin', type: 'boolean', isNullable: false, hasDefault: true };
  allTables.users.locale = { name: 'locale', type: 'string', isNullable: false, hasDefault: true };
  allTables.users.reputation_score = { name: 'reputation_score', type: 'number', isNullable: false, hasDefault: true };
  allTables.users.badges = { name: 'badges', type: 'string[]', isNullable: false, hasDefault: true };
  allTables.users.interests = { name: 'interests', type: 'string[]', isNullable: false, hasDefault: true };
  allTables.users.stripe_customer_id = { name: 'stripe_customer_id', type: 'string | null', isNullable: true, hasDefault: true };
  allTables.users.subscription_tier = { name: 'subscription_tier', type: 'string | null', isNullable: true, hasDefault: true };
  allTables.users.metadata = { name: 'metadata', type: 'Json', isNullable: false, hasDefault: true };
  allTables.users.is_deleted = { name: 'is_deleted', type: 'boolean', isNullable: false, hasDefault: true };
  allTables.users.deleted_at = { name: 'deleted_at', type: 'string | null', isNullable: true, hasDefault: true };
  allTables.users.created_at = { name: 'created_at', type: 'string', isNullable: false, hasDefault: true };
  allTables.users.updated_at = { name: 'updated_at', type: 'string', isNullable: false, hasDefault: true };
}

// 2. telemetry table
allTables.telemetry = {
  id: { name: 'id', type: 'string', isNullable: false, hasDefault: true },
  session_id: { name: 'session_id', type: 'string | null', isNullable: true, hasDefault: true },
  user_id: { name: 'user_id', type: 'string | null', isNullable: true, hasDefault: true },
  event_type: { name: 'event_type', type: 'string', isNullable: false, hasDefault: false },
  source: { name: 'source', type: 'string', isNullable: false, hasDefault: true },
  environment: { name: 'environment', type: 'string', isNullable: false, hasDefault: true },
  duration_ms: { name: 'duration_ms', type: 'number | null', isNullable: true, hasDefault: true },
  status_code: { name: 'status_code', type: 'number | null', isNullable: true, hasDefault: true },
  path: { name: 'path', type: 'string | null', isNullable: true, hasDefault: true },
  ip_hash: { name: 'ip_hash', type: 'string | null', isNullable: true, hasDefault: true },
  user_agent: { name: 'user_agent', type: 'string | null', isNullable: true, hasDefault: true },
  payload: { name: 'payload', type: 'Json', isNullable: false, hasDefault: true },
  tags: { name: 'tags', type: 'string[]', isNullable: false, hasDefault: true },
  created_at: { name: 'created_at', type: 'string', isNullable: false, hasDefault: true }
};

// 3. financials table
allTables.financials = {
  id: { name: 'id', type: 'string', isNullable: false, hasDefault: true },
  user_id: { name: 'user_id', type: 'string | null', isNullable: true, hasDefault: true },
  organization_id: { name: 'organization_id', type: 'string | null', isNullable: true, hasDefault: true },
  transaction_type: { name: 'transaction_type', type: 'string', isNullable: false, hasDefault: false },
  category: { name: 'category', type: 'string', isNullable: false, hasDefault: false },
  amount_cents: { name: 'amount_cents', type: 'number', isNullable: false, hasDefault: false },
  amount_usd: { name: 'amount_usd', type: 'number | null', isNullable: true, hasDefault: true },
  currency: { name: 'currency', type: 'string', isNullable: false, hasDefault: true },
  status: { name: 'status', type: 'string', isNullable: false, hasDefault: true },
  stripe_payment_id: { name: 'stripe_payment_id', type: 'string | null', isNullable: true, hasDefault: true },
  stripe_customer_id: { name: 'stripe_customer_id', type: 'string | null', isNullable: true, hasDefault: true },
  stripe_invoice_id: { name: 'stripe_invoice_id', type: 'string | null', isNullable: true, hasDefault: true },
  billing_period_start: { name: 'billing_period_start', type: 'string | null', isNullable: true, hasDefault: true },
  billing_period_end: { name: 'billing_period_end', type: 'string | null', isNullable: true, hasDefault: true },
  breakdown: { name: 'breakdown', type: 'Json', isNullable: false, hasDefault: true },
  metadata: { name: 'metadata', type: 'Json', isNullable: false, hasDefault: true },
  created_at: { name: 'created_at', type: 'string', isNullable: false, hasDefault: true },
  updated_at: { name: 'updated_at', type: 'string', isNullable: false, hasDefault: true }
};

console.log(`Total Tables ready for compilation: ${Object.keys(allTables).length}`);

// Generate TypeScript Output
let out = `export type Json =
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
`;

const sortedTableNames = Object.keys(allTables).sort();

for (const tName of sortedTableNames) {
  const cols = allTables[tName];
  out += `      ${tName}: {\n`;
  
  // Row
  out += `        Row: {\n`;
  for (const [cName, cInfo] of Object.entries(cols)) {
    out += `          ${cName}: ${cInfo.type}\n`;
  }
  out += `        }\n`;
  
  // Insert
  out += `        Insert: {\n`;
  for (const [cName, cInfo] of Object.entries(cols)) {
    const isOptional = cInfo.hasDefault || cInfo.isNullable;
    const insertType = cInfo.type;
    out += `          ${cName}${isOptional ? '?' : ''}: ${insertType}\n`;
  }
  out += `        }\n`;
  
  // Update
  out += `        Update: {\n`;
  for (const [cName, cInfo] of Object.entries(cols)) {
    out += `          ${cName}?: ${cInfo.type}\n`;
  }
  out += `        }\n`;
  
  // Relationships
  out += `        Relationships: []\n`;
  out += `      }\n`;
}

out += `    }\n`;

// Views
out += `    Views: {
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
`;

// Functions
out += `    Functions: {
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
`;

// Enums
out += `    Enums: {
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
`;

fs.writeFileSync('D:/01_SaaS_Products/Alparai/src/types/database.types.ts', out);
console.log('Successfully written D:/01_SaaS_Products/Alparai/src/types/database.types.ts');

// Also update src/types/database.ts to re-export or contain the same
const databaseTsContent = `export * from "./database.types";
export { Database as default } from "./database.types";
`;
fs.writeFileSync('D:/01_SaaS_Products/Alparai/src/types/database.ts', out);
console.log('Successfully updated D:/01_SaaS_Products/Alparai/src/types/database.ts');
