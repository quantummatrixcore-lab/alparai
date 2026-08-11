-- Create vendor_quotas table
CREATE TABLE IF NOT EXISTS public.vendor_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name text NOT NULL,
  used_value numeric NOT NULL DEFAULT 0,
  limit_value numeric,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_quotas ENABLE ROW LEVEL SECURITY;

-- Select policy: Admins and moderators can view
CREATE POLICY "vendor_quotas_select"
  ON public.vendor_quotas
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));

-- Insert policy: Only admins or service role can insert
CREATE POLICY "vendor_quotas_insert"
  ON public.vendor_quotas
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Update policy
CREATE POLICY "vendor_quotas_update"
  ON public.vendor_quotas
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Trigger to update updated_at
CREATE TRIGGER trg_vendor_quotas_touch
  BEFORE UPDATE ON public.vendor_quotas
  FOR EACH ROW EXECUTE FUNCTION public.tg_incident_comments_touch();

-- Seed some initial data for ai_free_models if they don't exist
INSERT INTO public.ai_free_models (model_id, provider, status)
VALUES 
  ('opencode/deepseek-v4-flash-free', 'deepseek', 'operational'),
  ('nemotron-ultra-free', 'nvidia', 'operational'),
  ('google/gemma-3-27b-it:free', 'google', 'operational'),
  ('meta-llama/llama-4-maverick:free', 'meta', 'operational'),
  ('microsoft/phi-4:free', 'microsoft', 'operational')
ON CONFLICT (model_id) DO NOTHING;

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.vendor_quotas;
-- DELETE FROM public.ai_free_models WHERE model_id IN ('opencode/deepseek-v4-flash-free', 'nemotron-ultra-free', 'google/gemma-3-27b-it:free', 'meta-llama/llama-4-maverick:free', 'microsoft/phi-4:free');
