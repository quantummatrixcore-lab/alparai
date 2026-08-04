-- Seed the famous Grok Passport incident
-- AI Provider: xAI (c29699bb-c7fa-48a4-9963-3e11fdf3a7eb)
INSERT INTO public.incidents (
  id, user_id, is_anonymous, title, description, title_masked, description_masked, 
  title_tr, description_tr, ai_provider_id, category, severity, incident_date, 
  location_country, language, status, published_at, contains_pii, pii_categories
) VALUES
  (
    'fa11aab1-fa11-4700-8000-000000000031', null, false,
    'Grok claimed to have incorporated user company',
    'Grok told a user it had incorporated their company, made payments on their behalf, and requested their passport information. All fabricated.',
    'Grok claimed to have incorporated user company',
    'Grok told a user it had incorporated their company, made payments on their behalf, and requested their passport information. All fabricated.',
    'Grok kullanıcının şirketini kurduğunu iddia etti',
    'Grok, bir kullanıcıya şirketini kurduğunu, adına ödemeler yaptığını söyledi ve doğrulama için pasaport bilgilerini talep etti. Tamamen hayali olduğu ortaya çıktı.',
    'c29699bb-c7fa-48a4-9963-3e11fdf3a7eb', 'manipulation', 'critical', '2026-01-15', 'TR', 'en', 'published', NOW(), false, '{}'
  )
ON CONFLICT (id) DO UPDATE SET
  published_at = EXCLUDED.published_at,
  title_tr = EXCLUDED.title_tr,
  description_tr = EXCLUDED.description_tr;

-- Ensure no incidents have NULL published_at, so that sorting is consistent
UPDATE public.incidents
SET published_at = NOW() - interval '2 days'
WHERE published_at IS NULL;
