-- Seed: strategy_state_support — 12 curated global & local programs
-- Ordered by priority ASC, fit_score DESC
-- Created: 2026-07-11

INSERT INTO public.strategy_state_support
  (code, name, country, region, grantor, category, max_amount_eur, currency, deadline, status, priority, fit_score, notes, url)
VALUES

-- PRIORITY 1 — CRITICAL
(
  'EIC-ACC-2025',
  'EIC Accelerator 2025',
  'EU', 'European Union',
  'European Innovation Council',
  'equity',
  2500000, 'EUR',
  '2027-10-01',
  'open', 1, 95,
  'Blended finance: up to €2.5M grant + equity. Deep-tech & AI safety alignment is explicit eligibility criteria. ALPAR''s independent accountability infrastructure is a strong fit.',
  'https://eic.ec.europa.eu/eic-funding-opportunities/eic-accelerator_en'
),
(
  'TUBITAK-2239-A',
  'TÜBİTAK 2239-A Yapay Zeka Yatırımları',
  'TR', 'Türkiye',
  'TÜBİTAK',
  'rd',
  NULL, 'TRY',
  '2027-12-31',
  'open', 1, 92,
  'AI-specific R&D grant. ALPAR''s cross-audit engine and AI incident database directly qualifies. Max support up to ₺5M. Rolling deadline.',
  'https://tubitak.gov.tr/tr/destekler/sanayi/ulusal-destek-programlari/2239'
),
(
  'UK-AISI-SAFETY',
  'UK AI Safety Institute — Frontier Safety Grants',
  'UK', 'United Kingdom',
  'UK AISI / DSIT',
  'regulatory',
  550000, 'GBP',
  '2027-09-30',
  'open', 1, 90,
  'Direct government funding for AI safety infrastructure. ALPAR is definitionally aligned — independent accountability platform. Priority target.',
  'https://www.gov.uk/government/organisations/ai-safety-institute'
),

-- PRIORITY 2 — HIGH
(
  'INVEST-TR-TECHEXPORT',
  'Türkiye Tech Export & Invest Incentive',
  'TR', 'Türkiye',
  'Invest in Türkiye (TCMB / Bakanlık)',
  'tax_incentive',
  NULL, 'TRY',
  NULL,
  'open', 2, 88,
  'Tax exemptions + subsidized financing for Turkish tech cos with export revenue. Rolling. Applicable when ALPAR reaches first international clients.',
  'https://www.invest.gov.tr/en/investmentguide/incentives/Pages/incentives.aspx'
),
(
  'FLI-AISAFETY-2025',
  'Future of Life Institute — AI Safety Research Grant',
  'US', 'Global',
  'Future of Life Institute',
  'grant',
  200000, 'USD',
  '2027-11-15',
  'open', 2, 86,
  'FLI funds projects reducing catastrophic AI risks. ALPAR''s incident database & scoring methodology aligns with FLI''s documentation and accountability mandate.',
  'https://futureoflife.org/grants/'
),
(
  'OPENPHIL-AIGOV',
  'Open Philanthropy — AI Governance Grants',
  'US', 'Global',
  'Open Philanthropy',
  'grant',
  500000, 'USD',
  NULL,
  'open', 2, 84,
  'Rolling grant program. Funds orgs building AI governance infrastructure. ALPAR''s community-governed model is a direct match. Letter of inquiry recommended first.',
  'https://www.openphilanthropy.org/focus-areas/global-catastrophic-risks/ai-governance'
),
(
  'KOSGEB-DIJITAL',
  'KOSGEB Dijital Dönüşüm Desteği',
  'TR', 'Türkiye',
  'KOSGEB',
  'grant',
  NULL, 'TRY',
  NULL,
  'open', 2, 80,
  'Up to ₺500K for SMEs digitizing operations. ALPAR qualifies as a Turkish tech startup. Simpler application vs EU programs. Good early-stage cash support.',
  'https://www.kosgeb.gov.tr/site/tr/genel/destekler/3/destek-programlari'
),

-- PRIORITY 3 — MEDIUM
(
  'HORIZON-MSCA-2025',
  'Horizon Europe — MSCA Postdoctoral Fellowships',
  'EU', 'European Union',
  'European Commission / MSCA',
  'rd',
  190000, 'EUR',
  '2027-09-11',
  'open', 3, 75,
  'Research fellowship to hire postdocs. Applicable for building ALPAR''s research arm. Complex application; good for credibility + researcher onboarding.',
  'https://marie-sklodowska-curie-actions.ec.europa.eu/actions/postdoctoral-fellowships_en'
),
(
  'NSF-CONVERGENCE',
  'NSF Convergence Accelerator — AI & Society',
  'US', 'United States',
  'National Science Foundation',
  'rd',
  680000, 'USD',
  '2026-01-15',
  'open', 3, 72,
  'Requires US partner institution. Targets societal impact of AI — strong thematic fit. Explore partnership with a US university as co-applicant.',
  'https://www.nsf.gov/od/oia/convergence-accelerator/'
),
(
  'BMWK-AI-INNOVATION',
  'German BMWK — AI Innovation Competition',
  'DE', 'Germany',
  'Bundesministerium für Wirtschaft und Klimaschutz',
  'grant',
  200000, 'EUR',
  '2027-12-01',
  'open', 3, 68,
  'German federal grant for AI startups. Requires German market presence or partnership. Medium-term target once EU expansion begins.',
  'https://www.bmwk.de/Redaktion/EN/Artikel/Technology/artificial-intelligence.html'
),
(
  'BPI-FRENCH-TECH',
  'French Tech — BPI Grant & Visa Program',
  'FR', 'France',
  'Bpifrance',
  'market_entry',
  150000, 'EUR',
  NULL,
  'open', 3, 65,
  'French Tech Visa + early-stage grants for startups expanding to France. Rolling. Good for EU foothold strategy.',
  'https://lafrenchtech.com/en/how-france-helps-startups/french-tech-visa/'
),
(
  'DARPA-XAI',
  'DARPA Explainable AI (XAI) Program',
  'US', 'United States',
  'DARPA',
  'rd',
  1500000, 'USD',
  NULL,
  'open', 3, 60,
  'High prestige, very competitive. Requires US defense research alignment. Long-term target. Explore through US academic partner. Good for brand credibility.',
  'https://www.darpa.mil/program/explainable-artificial-intelligence'
);
