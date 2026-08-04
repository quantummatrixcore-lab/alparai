-- Migration: Add Design & Human Factors Advisory Board Seat
-- Timestamp: 20260804000001
-- ROLLBACK: DELETE FROM public.advisory_board_members WHERE name = '[Open Position] Design & Human Factors Seat';

INSERT INTO public.advisory_board_members (
  name, 
  title_en, 
  title_tr, 
  institution_en, 
  institution_tr, 
  bio_en, 
  bio_tr, 
  display_order, 
  is_active, 
  term_start
)
VALUES (
  '[Open Position] Design & Human Factors Seat',
  'Design & Human Factors Expert',
  'Tasarım ve İnsan Faktörleri Uzmanı',
  'UX Research, Behavioral Psychology, AI Ethics, Accessibility',
  'UX Araştırması, Davranışsal Psikoloji, YZ Etiği, Erişilebilirlik',
  'This seat is reserved for a Design and Human Factors expert who will evaluate AI accountability from a user experience perspective.',
  'Bu koltuk, YZ hesap verebilirliğini kullanıcı deneyimi perspektifinden değerlendirecek Tasarım ve İnsan Faktörleri uzmanı için ayrılmıştır.',
  5,
  false,
  '2026-08-04T00:00:00Z'
);
