-- Strategic Roadmap 2026-2028 seed milestones
-- Migration: 20260716000000_strategic_roadmap_2026_2028.sql

-- Foundation 2026-Q3
INSERT INTO public.strategy_milestones (quarter, title, okr_text, progress, status, linked_metric)
SELECT '2026-Q3', 'Launch Gate — Go Live Aug 2', 'Pass final smoke test (Item 88); zero P0 defects; freeze Aug 1-9', 95, 'in_progress', 'launch_gate'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_milestones WHERE title = 'Launch Gate — Go Live Aug 2');

INSERT INTO public.strategy_milestones (quarter, title, okr_text, progress, status, linked_metric)
SELECT '2026-Q3', 'First-Story Offensive', 'Publish 3 flagship incident stories from the 400+ registry; ≥5 media pickups', 10, 'planned', 'media_mentions_count'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_milestones WHERE title = 'First-Story Offensive');

INSERT INTO public.strategy_milestones (quarter, title, okr_text, progress, status, linked_metric)
SELECT '2026-Q3', 'İş Bank AI Factory Application', 'Submit application (docs/APPLICATIONS/001); reach interview shortlist', 60, 'in_progress', 'funding_pipeline'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_milestones WHERE title = 'İş Bank AI Factory Application');

INSERT INTO public.strategy_milestones (quarter, title, okr_text, progress, status, linked_metric)
SELECT '2026-Q3', '1,000 Registered Users', 'Convert launch traffic; activate Founding Reporter badge loop', 5, 'planned', 'total_users'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_milestones WHERE title = '1,000 Registered Users');

-- Institutions 2026-Q4
INSERT INTO public.strategy_milestones (quarter, title, okr_text, progress, status, linked_metric)
SELECT '2026-Q4', 'K-BENCHMARK Public Credibility', 'Methodology Committee ≥3 named members; FAccT paper submitted', 25, 'planned', 'expert_count'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_milestones WHERE title = 'K-BENCHMARK Public Credibility');

INSERT INTO public.strategy_milestones (quarter, title, okr_text, progress, status, linked_metric)
SELECT '2026-Q4', 'Enterprise Pilot ×3', '3 corporate pilots (bank/telecom/insurer) on B2B risk-score API', 0, 'planned', 'enterprise_pilots'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_milestones WHERE title = 'Enterprise Pilot ×3');

INSERT INTO public.strategy_milestones (quarter, title, okr_text, progress, status, linked_metric)
SELECT '2026-Q4', 'Revenue Ignition', 'Stripe live; first paying Pro subscribers; MRR > 0', 0, 'planned', 'mrr_cents'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_milestones WHERE title = 'Revenue Ignition');

INSERT INTO public.strategy_milestones (quarter, title, okr_text, progress, status, linked_metric)
SELECT '2026-Q4', 'Regulator Bridge', 'KVKK + TR AISI working contact; OECD AIM feed cited', 30, 'planned', 'regulator_contacts'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_milestones WHERE title = 'Regulator Bridge');

-- Expansion 2027
INSERT INTO public.strategy_milestones (quarter, title, okr_text, progress, status, linked_metric)
SELECT '2027-Q1', 'EU Art. 73 Readiness Product', 'Compliance-report generator for Dec 2, 2027 deadline; 10 beta customers', 0, 'planned', 'art73_beta'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_milestones WHERE title = 'EU Art. 73 Readiness Product');

INSERT INTO public.strategy_milestones (quarter, title, okr_text, progress, status, linked_metric)
SELECT '2027-Q2', 'Certified AI Auditor Program', 'Academy certification cohort #1 (≥25 auditors)', 0, 'planned', 'certification'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_milestones WHERE title = 'Certified AI Auditor Program');

INSERT INTO public.strategy_milestones (quarter, title, okr_text, progress, status, linked_metric)
SELECT '2027-Q3', 'EU Market Entry', 'EN/DE landing; 2 EU enterprise customers; EU entity decision', 0, 'planned', 'eu_customers'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_milestones WHERE title = 'EU Market Entry');

INSERT INTO public.strategy_milestones (quarter, title, okr_text, progress, status, linked_metric)
SELECT '2027-Q4', 'Series-A Readiness', '≥$20K MRR, ≥5K incidents, ≥2 regulator citations → raise', 0, 'planned', 'series_a_gate'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_milestones WHERE title = 'Series-A Readiness');

-- ROLLBACK:
-- DELETE FROM public.strategy_milestones WHERE title IN (
--   'Launch Gate — Go Live Aug 2',
--   'First-Story Offensive',
--   'İş Bank AI Factory Application',
--   '1,000 Registered Users',
--   'K-BENCHMARK Public Credibility',
--   'Enterprise Pilot ×3',
--   'Revenue Ignition',
--   'Regulator Bridge',
--   'EU Art. 73 Readiness Product',
--   'Certified AI Auditor Program',
--   'EU Market Entry',
--   'Series-A Readiness'
-- );
