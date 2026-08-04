-- Update Sean McGregor status in linkedin_contacts table following direct email response
-- ROLLBACK: UPDATE public.linkedin_contacts SET status = 'to_add', notes = 'Direct alignment with our mission', updated_at = NOW() WHERE full_name = 'Sean McGregor';

UPDATE public.linkedin_contacts
SET 
  status = 'responded',
  notes = 'E-posta yanıtı (29 Temmuz 2026): Danışma kuruluna yoğunluğu nedeniyle katılamadı; ALPAR AI misyonunu takdir etti. 2 ay sonra (Eylül 2026) tekrar iletişim istedi.',
  updated_at = NOW()
WHERE full_name = 'Sean McGregor';
