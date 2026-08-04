-- Migration: Replace LinkedIn placeholder contacts with real AI Safety & Governance leaders
-- Timestamp: 20260729000001
-- ROLLBACK: DELETE FROM public.linkedin_contacts WHERE full_name IN ('Dario Amodei', 'Daniela Amodei', 'Stuart Russell', 'Yann LeCun', 'Yoshua Bengio', 'Demis Hassabis', 'Pushmeet Kohli', 'Dan Hendrycks', 'Paul Christiano', 'Jan Leike', 'Collin Burns', 'Helen Toner', 'Jack Clark', 'Jared Kaplan', 'Max Tegmark', 'Nick Bostrom', 'Tristan Harris', 'Joy Buolamwini', 'Timnit Gebru', 'Arvind Narayanan', 'Sayash Kapoor', 'Margaret Mitchell', 'Percy Liang', 'Danqi Chen', 'Christopher Manning', 'Ellie Pavlick', 'Dawn Song', 'Dan Boneh', 'Anca Dragan', 'Chelsea Finn', 'Pieter Abbeel', 'Sergey Levine', 'Alexander Rush', 'Yejin Choi', 'Ilya Sutskever', 'Andrej Karpathy', 'Samy Bengio');

DELETE FROM public.linkedin_contacts WHERE full_name LIKE 'Placeholder Contact%';

INSERT INTO public.linkedin_contacts (full_name, title, category, status, priority, notes)
VALUES
  ('Dario Amodei', 'CEO & Co-Founder, Anthropic', 'AI Safety & Frontier Models', 'to_add', 1, 'Key contact for frontier safety alignment'),
  ('Daniela Amodei', 'President & Co-Founder, Anthropic', 'AI Safety & Policy', 'to_add', 1, 'Frontier AI governance research'),
  ('Stuart Russell', 'Professor of CS, UC Berkeley & Author of Human Compatible', 'AI Safety Research', 'to_add', 1, 'Provably beneficial AI alignment pioneer'),
  ('Yann LeCun', 'VP & Chief AI Scientist, Meta', 'AI Architecture & Open Science', 'to_add', 2, 'Open source AI models and objective-driven AI'),
  ('Yoshua Bengio', 'Founder & Scientific Director, Mila', 'AI Safety & International Governance', 'to_add', 1, 'Turing Award laureate & international AI safety summit chair'),
  ('Demis Hassabis', 'CEO & Co-Founder, Google DeepMind', 'Frontier AI & Science', 'to_add', 1, 'Nobel laureate & AGI safety researcher'),
  ('Pushmeet Kohli', 'VP of Research, Google DeepMind', 'AI Safety & Reliability', 'to_add', 1, 'Robustness, evaluation, and AI verification'),
  ('Dan Hendrycks', 'Director, Center for AI Safety (CAIS)', 'AI Benchmarks & Risk Evaluation', 'to_add', 1, 'MMLU author & CAIS AI safety evaluation'),
  ('Paul Christiano', 'Founder, Alignment Research Center (ARC)', 'AI Alignment & Red-Teaming', 'to_add', 1, 'RLHF pioneer & ARC evaluations'),
  ('Jan Leike', 'AI Safety Researcher, Anthropic', 'Alignment & Superalignment', 'to_add', 1, 'Scalable oversight and red-teaming'),
  ('Collin Burns', 'Researcher, OpenAI / ARC', 'Eliciting Latent Knowledge', 'to_add', 2, 'Unsupervised deception detection research'),
  ('Helen Toner', 'Director of Strategy, CSET Georgetown', 'AI Policy & Security', 'to_add', 2, 'U.S. AI national security policy'),
  ('Jack Clark', 'Co-Founder, Anthropic & Co-Chair, AI Index', 'AI Index & Public Policy', 'to_add', 2, 'Stanford HAI AI Index lead author'),
  ('Jared Kaplan', 'Co-Founder & Chief Scientist, Anthropic', 'Scaling Laws & Alignment', 'to_add', 2, 'LLM scaling law pioneer'),
  ('Max Tegmark', 'President, Future of Life Institute (FLI)', 'Existential Risk & Policy', 'to_add', 1, 'FLI open letter & AI governance policy'),
  ('Nick Bostrom', 'Professor & Author of Superintelligence', 'Philosophy & AI Risk', 'to_add', 2, 'Longtermism & AI existential risk'),
  ('Tristan Harris', 'Executive Director, Center for Humane Technology', 'Humane Tech & AI Ethics', 'to_add', 2, 'Social harm & AI attention economy'),
  ('Joy Buolamwini', 'Founder, Algorithmic Justice League', 'AI Bias & Fairness', 'to_add', 1, 'Gender Shades & algorithmic justice pioneer'),
  ('Timnit Gebru', 'Founder, DAIR Institute', 'Distributed AI Research', 'to_add', 1, 'Stochastic Parrots co-author & AI ethics advocate'),
  ('Arvind Narayanan', 'Professor of CS, Princeton University', 'AI Snake Oil & Privacy', 'to_add', 2, 'AI auditing & deceptive AI claims'),
  ('Sayash Kapoor', 'PhD Researcher, Princeton University', 'AI Accountability & Benchmarks', 'to_add', 2, 'AI snake oil & model evaluation methodology'),
  ('Margaret Mitchell', 'Chief Ethics Scientist, Hugging Face', 'AI Ethics & Open Models', 'to_add', 1, 'Model Cards co-author & open source AI ethics'),
  ('Percy Liang', 'Director, Center for Research on Foundation Models (CRFM)', 'HELM Benchmark & Foundation Models', 'to_add', 1, 'Stanford HELM benchmark lead'),
  ('Danqi Chen', 'Assistant Professor, Princeton NLP', 'NLP & Dense Retrieval', 'to_add', 2, 'Open-domain QA and RAG architectures'),
  ('Christopher Manning', 'Director, Stanford AI Lab (SAIL)', 'NLP & Foundation Models', 'to_add', 2, 'Deep learning for natural language processing'),
  ('Ellie Pavlick', 'Associate Professor, Brown University & OpenAI', 'Representation & Interpretability', 'to_add', 2, 'Mechanistic interpretability and world models'),
  ('Dawn Song', 'Professor of CS, UC Berkeley', 'AI Security & Privacy', 'to_add', 1, 'Adversarial machine learning & zero-knowledge proofs'),
  ('Dan Boneh', 'Professor of CS & Electrical Engineering, Stanford', 'Applied Cryptography & AI Privacy', 'to_add', 2, 'Cryptographic proof of model weights & privacy'),
  ('Anca Dragan', 'Professor of CS, UC Berkeley & DeepMind', 'Human-Robot Interaction & Alignment', 'to_add', 2, 'Assistance games and intent alignment'),
  ('Chelsea Finn', 'Assistant Professor, Stanford University', 'Meta-Learning & Robotics', 'to_add', 2, 'Model-agnostic meta-learning (MAML)'),
  ('Pieter Abbeel', 'Professor of CS, UC Berkeley & Covariant', 'Robotics & Reinforcement Learning', 'to_add', 2, 'Deep reinforcement learning for control'),
  ('Sergey Levine', 'Associate Professor, UC Berkeley', 'Offline RL & Decision Models', 'to_add', 2, 'Decision transformers and offline RL'),
  ('Alexander Rush', 'Associate Professor, Cornell Tech & Hugging Face', 'Open NLP & Infrastructure', 'to_add', 2, 'Transformer architectures and open source tooling'),
  ('Yejin Choi', 'Professor, University of Washington & Allen AI', 'Commonsense Reasoning & AI Ethics', 'to_add', 1, 'Delphi AI ethics & commonsense benchmark'),
  ('Ilya Sutskever', 'Co-Founder, Safe Superintelligence Inc. (SSI)', 'Safe Superintelligence', 'to_add', 1, 'SSI founder & deep learning pioneer'),
  ('Andrej Karpathy', 'Founder, Eureka Labs & Ex-Tesla AI Director', 'AI Education & Neural Networks', 'to_add', 1, 'nanoGPT & accessible AI education'),
  ('Samy Bengio', 'Senior Director of AI Research, Apple', 'Machine Learning Infrastructure', 'to_add', 2, 'Large scale ML systems and vision-language models')
ON CONFLICT DO NOTHING;
