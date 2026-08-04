-- Migration: Re-add NVIDIA provider to ai_providers table (N-2)

INSERT INTO public.ai_providers (name, slug, website, logo_url, is_active, trust_score)
VALUES ('NVIDIA', 'nvidia', 'https://build.nvidia.com', '/logos/nvidia.svg', true, 90)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    website = EXCLUDED.website,
    logo_url = EXCLUDED.logo_url,
    is_active = EXCLUDED.is_active;

-- ROLLBACK:
-- UPDATE public.ai_providers SET is_active = false WHERE slug = 'nvidia';
