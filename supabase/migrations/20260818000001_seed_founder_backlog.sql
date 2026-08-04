-- Seed 50 LinkedIn Contacts
INSERT INTO public.linkedin_contacts (full_name, title, category, status, priority, notes)
VALUES 
  ('Rumman Chowdhury', 'AI Ethicist & Data Scientist', 'AI Ethics Leader', 'to_add', 1, 'Key figure in AI accountability'),
  ('Sven Cattell', 'Founder', 'DEF CON AI Village', 'to_add', 1, 'Security and AI research'),
  ('Irene Solaiman', 'Head of Global Policy', 'Hugging Face', 'to_add', 1, 'AI policy and open source'),
  ('Aviv Ovadya', 'Researcher', 'Platform Democracy', 'to_add', 1, 'Tech governance'),
  ('Daniel Miessler', 'Information Security Professional', 'Cybersecurity', 'to_add', 2, 'Unsupervised Learning newsletter'),
  ('Yacine Jernite', 'ML & Society Lead', 'Hugging Face', 'to_add', 2, 'AI evaluation'),
  ('Sean McGregor', 'Founder', 'AI Incident Database', 'to_add', 1, 'Direct alignment with our mission'),
  ('AI Safety Researcher - TBD 1', 'Researcher', 'Academia', 'to_add', 3, 'Find researcher focused on LLM hallucinations'),
  ('AI Safety Researcher - TBD 2', 'Researcher', 'Academia', 'to_add', 3, 'Find researcher focused on RLHF vulnerabilities'),
  ('Tech Journalist covering AI incidents - TBD 1', 'Journalist', 'Media', 'to_add', 2, 'Writes for major tech publication (Wired/Ars)'),
  ('Tech Journalist covering AI incidents - TBD 2', 'Journalist', 'Media', 'to_add', 2, 'Focuses on AI policy and regulation'),
  ('YC/Techstars Partner - TBD 1', 'Partner', 'VC', 'to_add', 3, 'Partner focusing on AI/trust startups'),
  ('YC/Techstars Partner - TBD 2', 'Partner', 'VC', 'to_add', 3, 'Partner focusing on devtools/infrastructure')
  -- Additional rows can be added by admin later via DB or UI if needed, for now we seed the requested ones
;

-- We can generate the remaining 37 placeholders using a DO block
DO $$
DECLARE
    i INT;
BEGIN
    FOR i IN 1..37 LOOP
        INSERT INTO public.linkedin_contacts (full_name, title, category, status, priority, notes)
        VALUES ('Placeholder Contact ' || i, 'TBD', 'TBD', 'to_add', 3, 'To be filled during research sprint');
    END LOOP;
END $$;

-- Seed Grant Applications
INSERT INTO public.grant_applications (program_name, funding_amount, category, phase, status, notes)
VALUES 
  ('OpenAI Cybersecurity Grant', '$10k-$100k', 'Security', 1, 'not_started', 'Defensive AI focus'),
  ('Mozilla Technology Fund', '$50k', 'Open Source', 1, 'not_started', 'Auditing AI systems'),
  ('NSF Secure and Trustworthy Cyberspace', 'Variable', 'Gov', 1, 'not_started', 'SaTC program'),
  ('Anthropic AI Safety Grant', '$50k', 'AI Safety', 1, 'not_started', 'Evaluating AI harm'),
  ('Tubitak 1507 SME R&D Grant', '1.2M TRY', 'State Support', 1, 'drafting', 'National R&D focus for Alparai'),
  ('KOSGEB Advanced Entrepreneurship', '375k TRY', 'State Support', 1, 'not_started', 'Seed funding program')
;

-- Seed Platform Signups
INSERT INTO public.platform_signups (platform_name, url, category, status, notes)
VALUES
  ('HackerNews', 'https://news.ycombinator.com', 'Community', 'account_created', 'Need to build karma before Show HN'),
  ('ProductHunt', 'https://producthunt.com', 'Launch', 'not_started', 'Prepare maker profile and assets'),
  ('GitHub Sponsors', 'https://github.com/sponsors', 'Funding', 'not_started', 'Register quantummatrixcore-lab'),
  ('Discord Server', 'https://discord.com', 'Community', 'profile_complete', 'Set up basic channels and roles'),
  ('X (Twitter)', 'https://x.com/alparai', 'Social', 'account_created', 'Verify account and set up bio'),
  ('OpenCollective', 'https://opencollective.com', 'Funding', 'not_started', 'Open source funding reception')
;
