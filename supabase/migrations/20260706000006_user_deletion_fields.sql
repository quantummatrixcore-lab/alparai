-- ============================================================================
-- 20260706000006_user_deletion_fields.sql
--
-- Adds fields to support GDPR/KVKK delete flows (72h wait, soft-delete, 30d hard-delete).
-- ============================================================================

ALTER TABLE public.users
  ADD COLUMN delete_requested_at timestamptz,
  ADD COLUMN delete_scheduled_for timestamptz,
  ADD COLUMN is_soft_deleted boolean NOT NULL DEFAULT false,
  ADD COLUMN soft_deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_users_delete_scheduled ON public.users(delete_scheduled_for) WHERE delete_scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_soft_deleted_at ON public.users(soft_deleted_at) WHERE is_soft_deleted = true;
