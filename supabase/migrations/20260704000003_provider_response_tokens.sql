CREATE TABLE IF NOT EXISTS public.provider_response_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid REFERENCES public.incidents(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  email text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.provider_response_tokens ENABLE ROW LEVEL SECURITY;

-- Policy to allow service_role / admin client access
CREATE POLICY "Service role access" ON public.provider_response_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
