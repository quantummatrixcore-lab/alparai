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

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all subscriptions
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

CREATE TRIGGER on_subscription_updated
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_subscription_updated();

-- ROLLBACK:
-- DROP TRIGGER IF EXISTS on_subscription_updated ON public.subscriptions;
-- DROP FUNCTION IF EXISTS public.handle_subscription_updated();
-- DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
-- DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;
-- ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
-- DROP TABLE IF EXISTS public.subscriptions;
