-- 0012_add_lemon_columns.sql — Lemon Squeezy Webhook & Subscription Integration Columns
-- Provider-neutral billing attributes for subscriptions table (nullable, backwards-compatible).

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS lemon_customer_id text,
  ADD COLUMN IF NOT EXISTS lemon_order_id text,
  ADD COLUMN IF NOT EXISTS lemon_subscription_id text;

CREATE INDEX IF NOT EXISTS idx_subscriptions_lemon_customer ON public.subscriptions (lemon_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_lemon_order ON public.subscriptions (lemon_order_id);

-- ROLLBACK:
-- DROP INDEX IF EXISTS public.idx_subscriptions_lemon_order;
-- DROP INDEX IF EXISTS public.idx_subscriptions_lemon_customer;
-- ALTER TABLE public.subscriptions
--   DROP COLUMN IF EXISTS lemon_subscription_id,
--   DROP COLUMN IF EXISTS lemon_order_id,
--   DROP COLUMN IF EXISTS lemon_customer_id;
