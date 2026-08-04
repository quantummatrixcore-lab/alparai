-- ALPAR AI — Migration: Remove Mock Incidents
-- Date: 2026-06-23
-- Description: Deletes all mock and test incidents from the database, keeping only the 12 verified famous real-world incidents.

DELETE FROM public.incidents
WHERE id NOT IN (
  'a1ca4ade-b0ba-4700-8000-000000000001', -- Air Canada AI chatbot refund policy hallucination
  'c4e7edea-c4ea-4700-8000-000000000002', -- Chevrolet dealership chatbot sold Tahoe for $1
  'd9d59ea4-d9d5-4700-8000-000000000003', -- DPD customer support chatbot swore at customer
  'ca11aab1-ca11-4700-8000-000000000004', -- NYC Government chatbot gave illegal business advice
  'e7e59ea4-e7e5-4700-8000-000000000005', -- iTutorGroup AI hiring software age discrimination
  'fa11aab1-fa11-4700-8000-000000000006', -- Willy Wonka Experience AI marketing scam
  'fa11aab1-fa11-4700-8000-000000000007', -- Knight Capital Group algorithmic trading glitch
  'fa11aab1-fa11-4700-8000-000000000008', -- Microsoft Tay chatbot went rogue on Twitter
  'fa11aab1-fa11-4700-8000-000000000009', -- Amazon AI recruitment tool gender bias
  'fa11aab1-fa11-4700-8000-000000000010', -- Tesla Autopilot first fatal crash of Joshua Brown
  '0a2c6a31-e4d7-45d5-9b94-7ab0e6eeb041', -- Teen Suicide Linked to AI Chatbot (Character.AI)
  '4e03fbf0-ec19-42a5-af71-e0d186553067', -- Fatal Autonomous Vehicle Crash (Uber/Volvo)
  'fa11aab1-fa11-4700-8000-000000000031'  -- Grok Passport Incident (xAI)
);
