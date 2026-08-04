# RLS security audit report — 2026-07-12

=======================================

## 1. Executive Summary

A comprehensive security review of Row Level Security (RLS) configurations was conducted using an anonymous Supabase client to test data exposure limits.
Two critical PII leaks were discovered on the public database endpoint. A hardening migration has been created to resolve these vulnerabilities.

## 2. RLS Audit Run Log (Anonymous Client)

The anonymous client attempted to read 1 record from each sensitive table:

- **Table:** `api_keys`
  - **Status:** SECURE (Returned 0 rows)
- **Table:** `expert_applications`
  - **Status:** SECURE (Returned 0 rows)
- **Table:** `outreach_queue`
  - **Status:** SECURE (Blocked by RLS)
- **Table:** `expert_network`
  - **Status:** SECURE (Blocked by RLS)
- **Table:** `users`
  - **Status:** 🔴 VULNERABLE (RLS Bypass / PII Leak)
  - **Detail:** Allowed public read access to columns `email`, `role`, and other sensitive user profile properties.
- **Table:** `incident_votes`
  - **Status:** 🔴 VULNERABLE (RLS Bypass / Leak)
  - **Detail:** Allowed public read access to `user_id` and `ip_hash` fields of existing votes.

## 3. Remediation Action Taken

We created a new SQL migration: [20260727000002_harden_rls_policies.sql](file:///d:/Alparai/supabase/migrations/20260727000002_harden_rls_policies.sql)

It restricts select permissions on `public.users` and `public.incident_votes` as follows:

- **`public.users`:** Only profile owners (`id = auth.uid()`) or staff (`public.is_admin(auth.uid())`) are permitted to query profile records.
- **`public.incident_votes`:** Only vote owners (`user_id = auth.uid()`) or moderators are permitted to query individual vote details.

The migration contains a fully structured `-- ROLLBACK:` block for deployment safety.
