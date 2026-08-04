-- Create newsletter subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  locale text DEFAULT 'tr',
  confirmed boolean DEFAULT false,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Select policy: Only moderators/admin can read subscribers list
CREATE POLICY "admin_select_subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated
  USING (public.is_moderator(auth.uid()));

-- Insert policy: Anyone can subscribe (public insert)
CREATE POLICY "public_insert_subscribers" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Update policy: Anyone can update their subscription status (unsubscribing)
CREATE POLICY "public_update_subscribers" ON public.newsletter_subscribers
  FOR UPDATE USING (true) WITH CHECK (true);
