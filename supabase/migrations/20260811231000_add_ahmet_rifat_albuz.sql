-- Migration: Add Ahmet Rifat Albuz to advisory board
-- Timestamp: 20260811231000
-- ROLLBACK: DELETE FROM public.advisory_board_members WHERE name = 'Ahmet Rıfat Albuz';

INSERT INTO public.advisory_board_members (
  name, 
  title_en, 
  title_tr, 
  institution_en, 
  institution_tr, 
  bio_en, 
  bio_tr, 
  avatar_url, 
  is_active
) VALUES (
  'Ahmet Rıfat Albuz',
  'Journalist, Communication Consultant',
  'Gazeteci, İletişim Danışmanı',
  'Yeni Nesil TV / TÜRKİNFORM',
  'Yeni Nesil TV / TÜRKİNFORM',
  'Journalist and Founder of yeninesil.tv, Editor-in-Chief at TÜRKİNFORM. With over 20 years of experience in traditional and digital media.',
  '20 yılı aşkın tecrübesiyle geleneksel medyanın mutfağından yetişen, yeninesil.tv kurucusu ve TÜRKİNFORM Genel Yayın Yönetmeni.',
  'https://ahmetrifatalbuz.com/assets/ahmet-rifat-albuz.jpg',
  false
);
