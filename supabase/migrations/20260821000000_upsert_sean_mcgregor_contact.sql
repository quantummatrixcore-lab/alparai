-- Upsert Sean McGregor contact record into linkedin_contacts table with responded status
-- ROLLBACK: DELETE FROM public.linkedin_contacts WHERE full_name = 'Sean McGregor';

INSERT INTO public.linkedin_contacts (full_name, title, company, profile_url, category, status, priority, notes)
VALUES (
  'Sean McGregor',
  'Founder',
  'AI Incident Database',
  'https://www.linkedin.com/in/seanbmcgregor/',
  'AI Incident Tracking',
  'responded',
  1,
  'E-posta yanıtı (29 Temmuz 2026): Danışma kuruluna katılamadı; ALPAR AI misyonunu takdir etti. 2 ay sonra (Eylül 2026) tekrar iletişim istedi.'
)
ON CONFLICT (full_name) DO UPDATE 
SET 
  status = 'responded',
  notes = EXCLUDED.notes,
  profile_url = EXCLUDED.profile_url,
  company = EXCLUDED.company,
  updated_at = NOW();
