-- Create api_keys table to store LLM provider API keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  provider text PRIMARY KEY, -- e.g. 'openrouter', 'cohere', 'huggingface', 'google', 'blackbox'
  api_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies (only admins/ceos can access)
CREATE POLICY "Admins/CEOs can do all on api_keys" ON public.api_keys
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND (users.role = 'admin' OR users.role = 'ceo')
    )
  );

-- Create trigger for updated_at using existing public.set_updated_at function
CREATE TRIGGER trg_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
