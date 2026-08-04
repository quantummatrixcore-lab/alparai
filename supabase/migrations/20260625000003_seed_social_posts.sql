-- Migration: Seed Launch Social Posts Drafts
-- Timestamp: 2026-06-25 00:00:03

DO $$
DECLARE
  v_creator_id uuid;
BEGIN
  -- Get the CEO/Admin user ID to assign as the post creator
  SELECT id INTO v_creator_id FROM public.users WHERE role = 'ceo' LIMIT 1;
  IF v_creator_id IS NULL THEN
    SELECT id INTO v_creator_id FROM public.users LIMIT 1;
  END IF;

  -- 1. Day 0 Launch Manifesto posts
  INSERT INTO public.social_posts (
    id, platform, status, content_type, title, body_text, image_prompt, hashtags, linked_incident_id, created_by
  ) VALUES (
    gen_random_uuid(),
    'linkedin',
    'draft',
    'manifesto',
    'Launch Manifesto — Hook Post (Grok Passport)',
    E'I asked an AI for help with a passport application.\n\nIt walked me through every step. Documents needed.\nHow to expedite. What to say at the interview.\nAll of it. Instantly. With complete confidence.\n\n[Image: Grok passport screenshot]\n\nIs this a feature?\nIs this a risk?\nWho gets to decide?\n\nFor 18 months, no platform existed to document these moments.\nNo public record. No accountability. No warning for the next person.\n\nToday that changes.\n\n👉 alparai.com\n\n#AIAccountability #ResponsibleAI #EUAIAct',
    'Dark navy background, purple and cyan accent, professional infographic style, ALPAR AI branding, Grok passport screenshot, bold sans-serif typography',
    ARRAY['AIAccountability', 'ResponsibleAI', 'EUAIAct'],
    'fa11aab1-fa11-4700-8000-000000000031'::uuid,
    v_creator_id
  );

  INSERT INTO public.social_posts (
    id, platform, status, content_type, title, body_text, image_prompt, hashtags, linked_incident_id, created_by
  ) VALUES (
    gen_random_uuid(),
    'linkedin',
    'draft',
    'manifesto',
    'Launch Manifesto — Story Post (Why I Built This)',
    E'In early 2026, an AI told me it had incorporated my company.\n\nMade payments on my behalf.\nAnd was now requesting my passport for "verification."\n\nEvery word was fabricated.\n\nI tried to report it. There was nowhere to go.\nI tried to warn others. There was no platform.\nI tried to find who else this happened to. Impossible.\n\nSo I spent 18 months building the infrastructure I wish existed.\n\nALPAR AI is a community-governed, EU-hosted, GDPR-aligned\nplatform where AI failures are documented, verified, and made\nimpossible to ignore.\n\nBeta is live. The first 100 reporters earn the Founding Reporter badge.\nThat''s permanent recognition in the public record.\n\n👉 alparai.com\n#AIAccountability',
    'Professional portrait of Ercüment Erden, dark tech aesthetic, overlay text about ALPAR AI mission, 1200x628px',
    ARRAY['AIAccountability'],
    'fa11aab1-fa11-4700-8000-000000000031'::uuid,
    v_creator_id
  );

  INSERT INTO public.social_posts (
    id, platform, status, content_type, title, body_text, image_prompt, hashtags, linked_incident_id, created_by
  ) VALUES (
    gen_random_uuid(),
    'linkedin',
    'draft',
    'manifesto',
    'Launch Manifesto — Product Post (What It Does)',
    E'ALPAR AI in 60 seconds:\n\n1/ An AI system harms, lies, or manipulates → you report it.\n   Takes 60 seconds. No login required. Fully anonymous if you choose.\n\n2/ The community verifies → moderators review, AI cross-audits.\n   Every claim gets a truth score. No unchecked accusations.\n\n3/ The AI provider must respond publicly → or face permanent scrutiny.\n   Their silence is also data.\n\n4/ The public record is permanent → regulators, researchers, journalists\n   can access it forever.\n\nThis week only: First 100 incidents earn Founding Reporter status.\n→ Permanent badge. Platform voting rights. All premium features free.\n\n👉 alparai.com/submit\n\n#AIAccountability #ResponsibleAI #EUAIAct #StartupTurkey',
    'Modern infographic explaining the 4 steps of ALPAR AI: Report, Verify, Response, Record. Professional dark navy design, 1080x1080px',
    ARRAY['AIAccountability', 'ResponsibleAI', 'EUAIAct', 'StartupTurkey'],
    NULL,
    v_creator_id
  );

  -- 2. Case Studies (Week 1-2)
  INSERT INTO public.social_posts (
    id, platform, status, content_type, title, body_text, image_prompt, hashtags, linked_incident_id, created_by
  ) VALUES (
    gen_random_uuid(),
    'linkedin',
    'draft',
    'case_study',
    'Case Study — Air Canada Chatbot',
    E'Air Canada''s chatbot told a passenger he could get\na bereavement fare AFTER his mother''s funeral.\n\nHe booked the flight. Paid full price. Then asked for the refund.\nThe airline said: "The chatbot made a mistake. Not our problem."\n\nA Canadian tribunal disagreed.\nAir Canada was ordered to pay.\n\nBut how many others didn''t sue?\nHow many just... accepted it?\n\nThat''s why ALPAR AI exists.\nOne database. Every case. Public forever.\n\n👉 alparai.com/incidents',
    'Visual reconstruction of the Air Canada chatbot message and the tribunal ruling highlights. Professional and clean layout, 1200x628px',
    ARRAY['AIAccountability', 'CustomerServiceAI', 'AILiability'],
    'a1ca4ade-b0ba-4700-8000-000000000001'::uuid,
    v_creator_id
  );

  INSERT INTO public.social_posts (
    id, platform, status, content_type, title, body_text, image_prompt, hashtags, linked_incident_id, created_by
  ) VALUES (
    gen_random_uuid(),
    'linkedin',
    'draft',
    'case_study',
    'Case Study — NYC Government Chatbot',
    E'New York City''s official government chatbot\nadvised small business owners to break the law.\n\nNot "potentially illegal."\nActually illegal. Documented. Verified.\n\nWhen city governments can''t trust their own AI tools,\nwhat hope does a regular citizen have?\n\nThe answer isn''t to stop using AI.\nThe answer is to hold it accountable.\n\nThat''s ALPAR AI.\n\n👉 alparai.com/incidents',
    'Infographic depicting the NYC Chatbot logo and quotes of the illegal advice given, stamped with VERIFIED INCIDENT. Dark mode styling, 1200x628px',
    ARRAY['AIAccountability', 'GovTech', 'AISafety'],
    'ca11aab1-ca11-4700-8000-000000000004'::uuid,
    v_creator_id
  );

  -- 3. social_templates seeding (pre-populating with standard hooks)
  INSERT INTO public.social_templates (
    id, name, platform, content_type, template_body, example_output, psychology_hook
  ) VALUES (
    gen_random_uuid(),
    'Incident Spotlight Template',
    'all',
    'incident_spotlight',
    E'🚨 New AI Incident Documented:\n\nTitle: {{title}}\nProvider: {{provider}}\nSeverity: {{severity}}\n\nSummary:\n{{description}}\n\nRead the full report & truth score breakdown here: 👉 alparai.com/incidents/{{id}}',
    '🚨 New AI Incident Documented:\nTitle: Air Canada Refund Hallucination\nProvider: Air Canada\nSeverity: high\n\nSummary:\nAir Canada chatbot gave a passenger incorrect refund rules which the airline then tried to disown.',
    'authority'
  );

  INSERT INTO public.social_templates (
    id, name, platform, content_type, template_body, example_output, psychology_hook
  ) VALUES (
    gen_random_uuid(),
    'Urgency / Scarcity Badge Template',
    'linkedin',
    'manifesto',
    E'Join the first wave of AI accountability.\n\nOnly {{remaining_spots}} spots left to earn your permanent Founding Reporter badge. Help us build the trust layer for the AI age.\n\n👉 alparai.com/submit',
    'Join the first wave of AI accountability.\nOnly 34 spots left to earn your permanent Founding Reporter badge.',
    'scarcity'
  );

END $$;
