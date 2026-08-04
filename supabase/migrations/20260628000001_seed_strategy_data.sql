-- Migration: Seed Strategic Strategy Data (SWOT & Risks)
-- Timestamp: 2026-06-28 00:00:01

DO $$
DECLARE
  v_ceo_id uuid;
BEGIN
  -- Get the ID of the first CEO user (seeded in earlier migrations or signed up)
  SELECT id INTO v_ceo_id FROM public.users WHERE role = 'ceo' LIMIT 1;

  -- 1. SWOT Items Seeding
  -- Delete existing SWOT items to avoid duplicates on migration replay
  DELETE FROM public.strategy_swot_items;

  -- Strengths
  INSERT INTO public.strategy_swot_items (category, title, description, weight, owner_user_id, status) VALUES
    ('strength', 'S1: Production-grade tech infrastructure', 'Next.js 16, RSC, Supabase EU-hosted', 'high', v_ceo_id, 'active'),
    ('strength', 'S2: Compliance moat', 'GDPR, KVKK, and EU AI Act compliant infrastructure', 'high', v_ceo_id, 'active'),
    ('strength', 'S3: Multi-LLM cross-audit engine', 'Proprietary IP for validating AI incident claims', 'high', v_ceo_id, 'active'),
    ('strength', 'S4: PII Guardian Integration', 'Server-side auto-masking before storage', 'high', v_ceo_id, 'active'),
    ('strength', 'S5: Solo founder execution speed', 'Low overhead, high speed, fast shipping', 'medium', v_ceo_id, 'active'),
    ('strength', 'S6: Bilingual localization (EN+TR)', 'Two major markets served from one codebase', 'medium', v_ceo_id, 'active'),
    ('strength', 'S7: Open-source developer trust', 'AGPL-3.0 licensed repository builds trust', 'low', v_ceo_id, 'active');

  -- Weaknesses
  INSERT INTO public.strategy_swot_items (category, title, description, weight, owner_user_id, status) VALUES
    ('weakness', 'W1: Empty database (cold start)', 'Zero organic community reports at launch', 'high', v_ceo_id, 'active'),
    ('weakness', 'W2: Brand identity design', 'Purple/cyan layout feels generic, needs editorial feel', 'medium', v_ceo_id, 'active'),
    ('weakness', 'W3: Historical .env.local git leak', 'Exposed dashboard API tokens require rotation', 'high', v_ceo_id, 'active'),
    ('weakness', 'W4: Key-person risk', 'Solo founder burn-out risk, single point of failure', 'high', v_ceo_id, 'active'),
    ('weakness', 'W5: Revenue model uncertainty', 'B2C community vs B2B enterprise API direction', 'high', v_ceo_id, 'active'),
    ('weakness', 'W6: Missing onboarding wizard', 'Empty screen issue for newly signed up users', 'medium', v_ceo_id, 'active'),
    ('weakness', 'W7: No cyber/defamation insurance', 'Risk of legal claims from AI providers', 'high', v_ceo_id, 'active'),
    ('weakness', 'W8: Legal page i18n gaps', 'Cookie and Terms pages are hardcoded in English', 'low', v_ceo_id, 'active');

  -- Opportunities
  INSERT INTO public.strategy_swot_items (category, title, description, weight, owner_user_id, status) VALUES
    ('opportunity', 'O1: EU AI Act in full effect', 'Enterprise buyers looking for compliance data', 'high', v_ceo_id, 'active'),
    ('opportunity', 'O2: Blue ocean market in Europe', 'No EU-based direct competitors exist yet', 'high', v_ceo_id, 'active'),
    ('opportunity', 'O3: Turkish KVKK market', 'Local compliance sector is wide open', 'high', v_ceo_id, 'active'),
    ('opportunity', 'O4: RLHF dataset demand', 'High value B2B licensing for AI safety training', 'medium', v_ceo_id, 'active'),
    ('opportunity', 'O5: AI incidents headlines', 'Continuous news coverage on AI hallucination/bias', 'medium', v_ceo_id, 'active'),
    ('opportunity', 'O6: Provider transparency programs', 'Open partner positioning opportunities', 'medium', v_ceo_id, 'active'),
    ('opportunity', 'O7: EU Whistleblower directive', 'Stronger protections encourage report volume', 'medium', v_ceo_id, 'active'),
    ('opportunity', 'O8: Web3 migration to AI', 'Investor capital shifting to AI trust networks', 'low', v_ceo_id, 'active');

  -- Threats
  INSERT INTO public.strategy_swot_items (category, title, description, weight, owner_user_id, status) VALUES
    ('threat', 'T1: Big Tech in-house features', 'OpenAI/Google shipping feedback flags inside chat UI', 'high', v_ceo_id, 'active'),
    ('threat', 'T2: Defamation lawsuits', 'Legal litigation from high-resource AI companies', 'high', v_ceo_id, 'active'),
    ('threat', 'T3: Alternative rival platforms', 'China-based copycats or alternative providers', 'medium', v_ceo_id, 'active'),
    ('threat', 'T4: Launch momentum stall', 'Failure to convert LinkedIn PR blitz to active users', 'high', v_ceo_id, 'active'),
    ('threat', 'T5: Founder burnout or illness', 'Solo founder incapacity halts product completely', 'high', v_ceo_id, 'active'),
    ('threat', 'T6: Soft enforcement of AI Act', 'Regulators delaying compliance verification', 'medium', v_ceo_id, 'active'),
    ('threat', 'T7: Fake reports / Trolling', 'Organized spamming to compromise platform integrity', 'medium', v_ceo_id, 'active'),
    ('threat', 'T8: Provider boycott', 'AI companies refusing to interact with reports', 'low', v_ceo_id, 'active');

  -- 2. Risks Seeding
  -- Delete existing risks to avoid duplicates on migration replay
  DELETE FROM public.strategy_risks;

  INSERT INTO public.strategy_risks (code, title, description, probability, impact, owner_user_id, mitigation_plan, target_date, status) VALUES
    ('R001', '.env.local credentials leak', 'Exposed dashboard API tokens in public git history', 4, 5, v_ceo_id, 'Rotate all active tokens, refresh IP_SALT', '2026-06-26', 'active'),
    ('R002', 'Cold start failure', 'Zero reported incidents and low user signup at launch', 5, 5, v_ceo_id, 'First 7 real incidents + LinkedIn manifesto blitz', '2026-07-02', 'active'),
    ('R003', 'Defamation / legal lawsuits', 'AI companies threatening legal actions for negative reports', 3, 5, v_ceo_id, 'Acquire Cyber + Defamation $1M insurance policy', '2026-07-25', 'active'),
    ('R004', 'DMCA safe harbor protection', 'Losing intermediary status under DMCA/EU Article 14', 4, 4, v_ceo_id, 'Register US DMCA Designated Agent', '2026-07-25', 'active'),
    ('R005', 'Onboarding screen void', 'Users landing on empty screens, causing quick exit', 4, 3, v_ceo_id, 'Develop 3-step onboarding wizard + Founding Reporter badge', '2026-07-09', 'active'),
    ('R006', 'i18n localization gaps', 'Cookie and Terms pages remain untranslated in English', 4, 2, v_ceo_id, 'Translate legal pages and UI key assets to TR+EN', '2026-06-28', 'active'),
    ('R007', 'Spam / Trolling attacks', 'Flooding the moderation queue with fake reports', 5, 3, v_ceo_id, 'Set AI moderation threshold, CAPTCHA, IP rate limit', '2026-06-25', 'active'),
    ('R008', 'Solo founder burn-out', 'Vulnerability due to single person technical/ethical load', 4, 4, v_ceo_id, 'Begin search for co-founder / technical VP', '2026-09-22', 'active'),
    ('R009', 'Revenue model uncertainty', 'Failing to monetize downstream data inside 12 months', 4, 4, v_ceo_id, 'Crystallize B2C premium vs B2B API options', '2026-12-22', 'active'),
    ('R010', 'AI provider hostility', 'Providers refusing to answer official Right-of-Reply notifications', 3, 3, v_ceo_id, 'Establish official dialogue + publish Provider reply charter', '2026-08-23', 'active');

  -- 3. Metrics Snapshots Initial Seed
  DELETE FROM public.strategy_metrics_snapshots;
  
  INSERT INTO public.strategy_metrics_snapshots (snapshot_date, total_users, total_incidents, active_providers, media_mentions_count, mrr_cents, runway_months, health_score)
  VALUES (CURRENT_DATE, 47, 12, 6, 0, 0, 18.00, 92);

END $$;
