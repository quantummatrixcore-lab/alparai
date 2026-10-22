-- Lemon Squeezy webhook destegi: provider-notr kolonlar (nullable, geriye uyumlu).
-- Uygulama: psql -U postgres -d alparai_prod -f 20261022_add_lemon_columns.sql
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS lemon_customer_id text,
  ADD COLUMN IF NOT EXISTS lemon_order_id text,
  ADD COLUMN IF NOT EXISTS lemon_subscription_id text;
CREATE INDEX IF NOT EXISTS idx_subscriptions_lemon_customer ON public.subscriptions (lemon_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_lemon_order ON public.subscriptions (lemon_order_id);
