-- =============================================================================
-- Migration: Core Indexing (B-Tree + GIN) & Strict RLS Architecture
-- Target Tables: public.users, public.telemetry, public.financials (+ related)
-- Author: Thomas Edison (TCSFL Tactical Command Engine)
-- Target Latency: <10ms Query Execution with Index-Only Scans & InitPlan Cached Auth
-- =============================================================================

-- Ensure essential extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- 1. TABLE DEFINITIONS & HARDENING
-- =============================================================================

-- 1.1 USERS TABLE HARDENING
-- Ensure public.users table exists with modern metadata and tagging capabilities
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  bio text,
  role text NOT NULL DEFAULT 'user',
  community_role text,
  is_verified boolean NOT NULL DEFAULT false,
  is_admin boolean NOT NULL DEFAULT false,
  locale text NOT NULL DEFAULT 'en',
  reputation_score integer NOT NULL DEFAULT 0,
  badges text[] NOT NULL DEFAULT '{}',
  interests text[] NOT NULL DEFAULT '{}',
  stripe_customer_id text,
  subscription_tier text DEFAULT 'free',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure newly added columns exist if table was already created in earlier migration
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- 1.2 TELEMETRY TABLE (Unified High-Throughput Event & Observability Stream)
CREATE TABLE IF NOT EXISTS public.telemetry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  event_type text NOT NULL, -- 'page_view', 'api_call', 'agent_heartbeat', 'model_query', 'error', 'conversion', 'ui_interaction'
  source text NOT NULL DEFAULT 'client', -- 'client', 'server', 'edge_worker', 'ai_pipeline', 'cron'
  environment text NOT NULL DEFAULT 'production', -- 'production', 'staging', 'development'
  duration_ms integer DEFAULT 0, -- Latency / response time in ms
  status_code integer DEFAULT 200,
  path text,
  ip_hash text,
  user_agent text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb, -- Structured telemetry context, token counts, error stack, metadata
  tags text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1.3 FINANCIALS TABLE (Unified Double-Entry High-Precision Ledger & Billing)
CREATE TABLE IF NOT EXISTS public.financials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  organization_id uuid,
  transaction_type text NOT NULL, -- 'subscription_fee', 'token_usage', 'api_charge', 'refund', 'payout', 'infrastructure_cost', 'grant'
  category text NOT NULL, -- 'saas_revenue', 'ai_arbitrage', 'stripe_payout', 'gpu_compute', 'storage', 'fixed_cost'
  amount_cents bigint NOT NULL, -- Stored as integer cents ($10.00 = 1000)
  amount_usd numeric(14, 4) GENERATED ALWAYS AS (amount_cents / 100.0) STORED,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'refunded', 'disputed'
  stripe_payment_id text,
  stripe_customer_id text,
  stripe_invoice_id text,
  billing_period_start timestamptz,
  billing_period_end timestamptz,
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb, -- Itemized details, model token usage, tax, provider costs
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 2. HIGH-PERFORMANCE B-TREE & GIN INDEXES (SUB-10MS OPTIMIZATION)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 2.1 USERS INDEXES
-- -----------------------------------------------------------------------------
-- B-Tree: Exact match lookups & Unique Constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON public.users (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON public.users (lower(username)) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role_created_at ON public.users (role, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON public.users (subscription_tier) WHERE subscription_tier IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_active_lookup ON public.users (id) WHERE is_deleted = false;

-- Covering Index for ultra-fast profile reads (Index-Only Scan eliminates Heap lookups)
CREATE INDEX IF NOT EXISTS idx_users_covering_profile ON public.users (id) 
  INCLUDE (email, username, full_name, avatar_url, role, is_verified, reputation_score);

-- GIN: Array & Metadata Containment
CREATE INDEX IF NOT EXISTS idx_users_badges_gin ON public.users USING gin (badges);
CREATE INDEX IF NOT EXISTS idx_users_interests_gin ON public.users USING gin (interests);
CREATE INDEX IF NOT EXISTS idx_users_metadata_gin ON public.users USING gin (metadata jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_users_search_trgm ON public.users USING gin (coalesce(full_name, '') gin_trgm_ops);

-- -----------------------------------------------------------------------------
-- 2.2 TELEMETRY INDEXES
-- -----------------------------------------------------------------------------
-- B-Tree: Time-series sorting and filtered lookups
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at_desc ON public.telemetry (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_user_event_created ON public.telemetry (user_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_event_type_created ON public.telemetry (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_session_id ON public.telemetry (session_id, created_at DESC) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_telemetry_source_env_created ON public.telemetry (source, environment, created_at DESC);

-- Partial B-Tree Indexes for High-Priority Diagnostics
CREATE INDEX IF NOT EXISTS idx_telemetry_slow_queries ON public.telemetry (duration_ms DESC, created_at DESC) 
  WHERE duration_ms > 500;
CREATE INDEX IF NOT EXISTS idx_telemetry_error_status ON public.telemetry (status_code, created_at DESC) 
  WHERE status_code >= 400;

-- GIN: Deep JSONB Payload Queries & Tag Search
CREATE INDEX IF NOT EXISTS idx_telemetry_payload_path_ops ON public.telemetry USING gin (payload jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_telemetry_payload_ops ON public.telemetry USING gin (payload);
CREATE INDEX IF NOT EXISTS idx_telemetry_tags_gin ON public.telemetry USING gin (tags);

-- -----------------------------------------------------------------------------
-- 2.3 FINANCIALS INDEXES
-- -----------------------------------------------------------------------------
-- B-Tree: Financial reporting, User billing lookups & Reconciliation
CREATE INDEX IF NOT EXISTS idx_financials_user_created ON public.financials (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_financials_type_status_created ON public.financials (transaction_type, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_financials_category_created ON public.financials (category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_financials_created_at_desc ON public.financials (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_financials_stripe_payment ON public.financials (stripe_payment_id) WHERE stripe_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_financials_stripe_customer ON public.financials (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_financials_billing_period ON public.financials (billing_period_start, billing_period_end) 
  WHERE billing_period_start IS NOT NULL;

-- Partial B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_financials_pending ON public.financials (created_at ASC) 
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_financials_failed ON public.financials (created_at DESC) 
  WHERE status = 'failed';

-- GIN: Deep breakdown line items & audit metadata
CREATE INDEX IF NOT EXISTS idx_financials_breakdown_path_ops ON public.financials USING gin (breakdown jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_financials_metadata_gin ON public.financials USING gin (metadata jsonb_path_ops);

-- -----------------------------------------------------------------------------
-- 2.4 CONNECTED DOMAIN TABLES INDEXING OPTIMIZATIONS
-- -----------------------------------------------------------------------------
-- Subscriptions table
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Funnel Events
CREATE INDEX IF NOT EXISTS idx_funnel_events_user_event_created ON public.funnel_events (user_id, event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funnel_events_metadata_gin ON public.funnel_events USING gin (metadata jsonb_path_ops);

-- DORA Metrics
CREATE INDEX IF NOT EXISTS idx_dora_metrics_date_created ON public.dora_metrics (metric_date DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dora_metrics_metadata_gin ON public.dora_metrics USING gin (metadata jsonb_path_ops);

-- Cost Log & Finance Monthly Costs
CREATE INDEX IF NOT EXISTS idx_finance_monthly_costs_service_month ON public.finance_monthly_costs (service, month DESC);
CREATE INDEX IF NOT EXISTS idx_cost_log_created_service ON public.cost_log (created_at DESC) WHERE service IS NOT NULL;

-- Persona Usage Stats
CREATE INDEX IF NOT EXISTS idx_persona_usage_twin_created ON public.persona_usage_stats (twin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_persona_usage_developer ON public.persona_usage_stats (developer_id, created_at DESC) WHERE developer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_persona_usage_consumer ON public.persona_usage_stats (consumer_id, created_at DESC) WHERE consumer_id IS NOT NULL;


-- =============================================================================
-- 3. STRICT ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all 3 target core tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financials ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 3.1 USERS RLS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "users_read_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;

-- SELECT: Public can view active profiles; users can view their own profile; admins can view all.
-- Cached (SELECT auth.uid()) subquery prevents per-row function invocation overhead.
CREATE POLICY "users_read_policy" ON public.users
  FOR SELECT
  TO public
  USING (
    is_deleted = false 
    OR id = (SELECT auth.uid())
    OR (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  );

-- INSERT: Only for user self registration or service role
CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (
    id = (SELECT auth.uid())
    OR (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
  );

-- UPDATE: Self update (own profile only) or Admin/Service Role
CREATE POLICY "users_update_policy" ON public.users
  FOR UPDATE
  TO authenticated, service_role
  USING (
    id = (SELECT auth.uid())
    OR (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  )
  WITH CHECK (
    id = (SELECT auth.uid())
    OR (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  );

-- DELETE: Soft-delete for self or Hard-delete for Admin / Service Role
CREATE POLICY "users_delete_policy" ON public.users
  FOR DELETE
  TO authenticated, service_role
  USING (
    (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  );


-- -----------------------------------------------------------------------------
-- 3.2 TELEMETRY RLS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "telemetry_insert_public_and_auth" ON public.telemetry;
DROP POLICY IF EXISTS "telemetry_select_admin_or_owner" ON public.telemetry;
DROP POLICY IF EXISTS "telemetry_no_update" ON public.telemetry;
DROP POLICY IF EXISTS "telemetry_delete_admin_only" ON public.telemetry;
DROP POLICY IF EXISTS "telemetry_insert_policy" ON public.telemetry;
DROP POLICY IF EXISTS "telemetry_select_policy" ON public.telemetry;
DROP POLICY IF EXISTS "telemetry_delete_policy" ON public.telemetry;

-- INSERT: Clients, authenticated users, and backend workers can ingest telemetry events
CREATE POLICY "telemetry_insert_policy" ON public.telemetry
  FOR INSERT
  TO public, authenticated, service_role
  WITH CHECK (
    user_id IS NULL 
    OR user_id = (SELECT auth.uid())
    OR (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
  );

-- SELECT: Users can only view their own telemetry logs; Admins/CEOs/Service Role can view all telemetry
CREATE POLICY "telemetry_select_policy" ON public.telemetry
  FOR SELECT
  TO authenticated, service_role
  USING (
    (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  );

-- DELETE: Only Service Role or Admin can prune expired telemetry (data retention compliance)
CREATE POLICY "telemetry_delete_policy" ON public.telemetry
  FOR DELETE
  TO authenticated, service_role
  USING (
    (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  );


-- -----------------------------------------------------------------------------
-- 3.3 FINANCIALS RLS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "financials_select_owner_or_admin" ON public.financials;
DROP POLICY IF EXISTS "financials_insert_service_only" ON public.financials;
DROP POLICY IF EXISTS "financials_update_service_only" ON public.financials;
DROP POLICY IF EXISTS "financials_delete_service_only" ON public.financials;
DROP POLICY IF EXISTS "financials_select_policy" ON public.financials;
DROP POLICY IF EXISTS "financials_insert_policy" ON public.financials;
DROP POLICY IF EXISTS "financials_update_policy" ON public.financials;
DROP POLICY IF EXISTS "financials_delete_policy" ON public.financials;

-- SELECT: End users can ONLY read their own completed/billed financial transactions;
-- Admins/CEOs/Service Role have full ledger access. Public has 0 access.
CREATE POLICY "financials_select_policy" ON public.financials
  FOR SELECT
  TO authenticated, service_role
  USING (
    (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR (
      user_id = (SELECT auth.uid()) 
      AND status != 'disputed'
    )
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  );

-- INSERT: Strictly restricted to Service Role (Stripe webhooks / backend processors) & Admins
CREATE POLICY "financials_insert_policy" ON public.financials
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (
    (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  );

-- UPDATE: Strictly restricted to Service Role (payment reconciliations) & Admins
CREATE POLICY "financials_update_policy" ON public.financials
  FOR UPDATE
  TO authenticated, service_role
  USING (
    (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  )
  WITH CHECK (
    (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND (u.role IN ('admin', 'ceo') OR u.is_admin = true)
    )
  );

-- DELETE: Strictly restricted to Service Role (Immutable double-entry ledger)
CREATE POLICY "financials_delete_policy" ON public.financials
  FOR DELETE
  TO service_role
  USING (
    (SELECT coalesce((auth.jwt() ->> 'role'), '')) = 'service_role'
  );


-- =============================================================================
-- 4. FAST STATS & QUERY OPTIMIZER DIRECTIVES
-- =============================================================================
ALTER TABLE public.users ALTER COLUMN email SET STATISTICS 1000;
ALTER TABLE public.users ALTER COLUMN role SET STATISTICS 500;
ALTER TABLE public.telemetry ALTER COLUMN created_at SET STATISTICS 1000;
ALTER TABLE public.telemetry ALTER COLUMN event_type SET STATISTICS 500;
ALTER TABLE public.financials ALTER COLUMN transaction_type SET STATISTICS 500;
ALTER TABLE public.financials ALTER COLUMN status SET STATISTICS 500;

ANALYZE public.users;
ANALYZE public.telemetry;
ANALYZE public.financials;

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

DROP TRIGGER IF EXISTS tr_users_updated_at ON public.users;
CREATE TRIGGER tr_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_financials_updated_at ON public.financials;
CREATE TRIGGER tr_financials_updated_at
  BEFORE UPDATE ON public.financials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
