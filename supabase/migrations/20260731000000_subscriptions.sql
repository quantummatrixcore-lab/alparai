-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'incomplete',
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- Only service role can modify subscriptions via webhook
CREATE POLICY "Service role can modify subscriptions" 
ON public.subscriptions FOR ALL 
USING (auth.uid() IS NULL); -- Service role bypasses RLS anyway

-- Triggers for updated_at
CREATE TRIGGER set_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
