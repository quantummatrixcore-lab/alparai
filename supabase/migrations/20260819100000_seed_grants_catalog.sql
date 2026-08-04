-- Migration: Seed Startup Ecosystem Grants Catalog
-- Deletes old placeholder grants and inserts the 9 catalog program items

DELETE FROM public.grant_applications;

INSERT INTO public.grant_applications (program_name, funding_amount, apply_url, category, phase, status, prepared_content_ref, notes)
VALUES
  ('Google for Startups Cloud Program (AI-First Stream)', '$2,000 - $350,000', 'https://cloud.google.com/startup', 'Cloud', 1, 'not_started', 'docs/APPLICATIONS/002-big-tech-grants.md', 'Vertex AI / Gemini credits focus'),
  ('Microsoft for Startups Founders Hub', 'Up to $150,000', 'https://startups.microsoft.com', 'Cloud', 1, 'not_started', 'docs/APPLICATIONS/002-big-tech-grants.md', 'Azure OpenAI credits focus'),
  ('AWS Activate', '$1,000 - $200,000', 'https://aws.amazon.com/startups', 'Cloud', 1, 'not_started', 'docs/APPLICATIONS/002-big-tech-grants.md', 'AWS Bedrock / ECS focus'),
  ('Anthropic Startup Program & Research Grants', '$1,000 - $250,000', 'https://www.anthropic.com/startups', 'AI Safety', 1, 'not_started', NULL, 'Evaluating AI harm / safety research focus'),
  ('NVIDIA Inception Program', 'Technical Support & GPU Discounts', 'https://www.nvidia.com/en-us/startups/', 'AI Hardware', 1, 'not_started', NULL, 'Technical support and DLI courses'),
  ('OpenAI Researcher Access Program & Partner Credits', '$1,000 - $2,500', 'https://openai.com/research/overview', 'AI Safety', 1, 'not_started', NULL, 'Toplumsal etki / AI emniyet araştırmaları'),
  ('GitHub for Startups', 'Up to $10,000', 'https://github.com/enterprise/startups', 'Developer Tools', 1, 'not_started', NULL, 'Enterprise platform credentials'),
  ('Vercel for Startups & Open Source Sponsorship', 'OSS Infrastructure Grant', 'https://vercel.com/startups', 'Developer Tools', 1, 'not_started', NULL, 'OSS web application hosting support'),
  ('Supabase for Startups & Open Source Grant', '$3,000', 'https://supabase.com/startups', 'Developer Tools', 1, 'not_started', NULL, 'Relational Database / Backend and Auth hosting')
;

-- ROLLBACK:
-- DELETE FROM public.grant_applications;
-- INSERT INTO public.grant_applications (program_name, funding_amount, category, phase, status, notes)
-- VALUES
--   ('OpenAI Cybersecurity Grant', '$10k-$100k', 'Security', 1, 'not_started', 'Defensive AI focus'),
--   ('Mozilla Technology Fund', '$50k', 'Open Source', 1, 'not_started', 'Auditing AI systems'),
--   ('NSF Secure and Trustworthy Cyberspace', 'Variable', 'Gov', 1, 'not_started', 'SaTC program'),
--   ('Anthropic AI Safety Grant', '$50k', 'AI Safety', 1, 'not_started', 'Evaluating AI harm'),
--   ('Tubitak 1507 SME R&D Grant', '1.2M TRY', 'State Support', 1, 'drafting', 'National R&D focus for Alparai'),
--   ('KOSGEB Advanced Entrepreneurship', '375k TRY', 'State Support', 1, 'not_started', 'Seed funding program');
