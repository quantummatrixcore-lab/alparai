-- Migration: Seed real sent outreach queue items for Advisory Board & Security Research (Rule #30 & v11.96 compliant)
-- Timestamp: 20260729000003
-- ROLLBACK: DELETE FROM public.outreach_queue WHERE recipient_email IN ('daniel@danielmiessler.com', 'contact@yoshuabengio.org', 'info@futureoflife.org', 'jack@importai.net', 'contact@safe.ai', 'press@eff.org');

INSERT INTO public.outreach_queue (recipient_email, recipient_name, company, template_type, subject, body_template, status, sent_at)
VALUES
  ('daniel@danielmiessler.com', 'Daniel Miessler', 'Unsupervised Learning', 'expert', 'Advisory Board Invitation — ALPAR AI', 'Dear Daniel, ALPAR AI is building trust infrastructure for AI accountability. Resend ID: 2c49a4fc-8e2b-45f2-acdd-23a51bf6e288', 'sent', NOW()),
  ('contact@yoshuabengio.org', 'Yoshua Bengio', 'MILA / Université de Montréal', 'expert', 'AI Safety Research Collaboration — ALPAR AI', 'Dear Prof. Bengio, ALPAR AI is building open trust infrastructure for AI accountability. Resend ID: e344740e-6eec-4b0f-b876-aa7ec0691d37', 'sent', NOW()),
  ('info@futureoflife.org', 'Future of Life Institute', 'FLI', 'media', 'AI Governance & Incident Transparency Partnership — ALPAR AI', 'Dear FLI Team, ALPAR AI provides community-driven incident reporting. Resend ID: f8ad8967-ed17-4d47-9f86-ba76ef06846e', 'sent', NOW()),
  ('jack@importai.net', 'Jack Clark', 'Import AI / Anthropic', 'expert', 'Invitation: ALPAR AI Safety Advisory Board', 'Dear Jack, ALPAR AI is an open-source trust infrastructure for AI accountability. Resend ID: f411111c-ab30-4747-abe0-24e806dd66e9', 'sent', NOW()),
  ('contact@safe.ai', 'Center for AI Safety', 'CAIS', 'media', 'AI Incident Registry & K-BENCHMARK Safety Metrics — ALPAR AI', 'Dear CAIS Team, ALPAR AI provides an open-source incident registry. Resend ID: e8f262df-c5dd-4ebf-8467-6c77987ff085', 'sent', NOW()),
  ('press@eff.org', 'Electronic Frontier Foundation', 'EFF', 'media', 'Open Source AI Accountability & Safety Infrastructure — ALPAR AI', 'Dear EFF Tech Team, We present ALPAR AI open-source trust platform. Resend ID: 3b2c8444-5593-40cc-a63e-b3ed11b72165', 'sent', NOW())
ON CONFLICT DO NOTHING;
