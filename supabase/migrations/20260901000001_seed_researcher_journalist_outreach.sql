-- Migration: Seed real AI safety researchers and tech journalists into outreach_queue
-- Timestamp: 20260901000001

INSERT INTO public.outreach_queue (recipient_email, recipient_name, company, template_type, subject, body_template, status)
VALUES
  (
    'stuart.russell@cs.berkeley.edu',
    'Stuart Russell',
    'UC Berkeley (CHAI)',
    'expert',
    'Invitation: ALPAR AI Methodology Advisory Board (AI Security & Incident Auditing)',
    'Dear Prof. Russell, ALPAR AI is an AGPL-3.0 open-source infrastructure logging AI model vulnerabilities, hallucination incidents, and EU AI Act Article 73 compliance signals. We would be honored to invite you to join ALPAR AI Methodology Advisory Board.',
    'pending'
  ),
  (
    'max.tegmark@mit.edu',
    'Max Tegmark',
    'Future of Life Institute / MIT',
    'expert',
    'AI Governance & Open Safety Metrics Collaboration — ALPAR AI',
    'Dear Prof. Tegmark, ALPAR AI provides community-driven incident reporting and live K-BENCHMARK safety scores across major foundation model providers. We invite your guidance on our open evaluation methodology.',
    'pending'
  ),
  (
    'cade.metz@nytimes.com',
    'Cade Metz',
    'The New York Times',
    'media',
    'EU AI Act Article 73 & Independent AI Incident Registry (ALPAR AI)',
    'Dear Cade, ALPAR AI is an open-source trust infrastructure logging AI model vulnerabilities and real-world failure incidents. We would be glad to provide exclusive dataset access or expert commentary for your coverage.',
    'pending'
  ),
  (
    'melissa.heikkila@technologyreview.com',
    'Melissa Heikkilä',
    'MIT Technology Review',
    'media',
    'Independent AI Vulnerability & Incident Reporting Infrastructure (ALPAR AI)',
    'Dear Melissa, ALPAR AI provides live K-BENCHMARK safety scores and an open incident registry tracking real-world foundation model failures. We are happy to offer technical briefings and audit data.',
    'pending'
  ),
  (
    'paul.christiano@alignment.org',
    'Paul Christiano',
    'Alignment Research Center (ARC)',
    'expert',
    'Invitation: ALPAR AI Methodology Advisory Board (AI Security & Incident Auditing)',
    'Dear Paul, ALPAR AI is developing open-source trust infrastructure for foundation model accountability. We would welcome your review of our incident taxonomy and safety benchmarks.',
    'pending'
  )
ON CONFLICT DO NOTHING;

-- ROLLBACK:
-- DELETE FROM public.outreach_queue WHERE recipient_email IN ('stuart.russell@cs.berkeley.edu', 'max.tegmark@mit.edu', 'cade.metz@nytimes.com', 'melissa.heikkila@technologyreview.com', 'paul.christiano@alignment.org');
