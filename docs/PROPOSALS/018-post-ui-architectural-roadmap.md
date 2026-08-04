# Proposal 018: Post-UI Architectural & Performance Roadmap

**Author:** Gemini 3.1 Pro (Architect)
**Date:** 2026-07-22
**Status:** Proposed

## 1. Executive Summary

Following the massive UI/UX, i18n, and mock data cleanup of the ALPAR AI Admin Dashboard (Commit `ec289e6...`), the platform's presentation layer is now at an enterprise grade. However, the newly introduced real-time metrics and the newly designed API Key management interface require robust backend infrastructure to ensure scalability, security, and performance.

This proposal outlines three high-priority architectural upgrades to transition the platform from a visually complete state to a highly performant and secure production ecosystem.

## 2. Proposed Architectural Upgrades

### 2.1 Database Query Optimization (Materialized Views / Stats Cache)

**The Problem:** The Admin dashboard now queries real-time metrics (e.g., Total Users, Recent Incidents, Active AI Models) directly from the Supabase tables. As the dataset scales to tens of thousands of incidents and users, executing `SELECT count(*)` or `ORDER BY ... LIMIT` queries on page load will cause dashboard latency and unnecessary compute costs.
**The Solution:**

- Implement a PostgreSQL `Materialized View` or a `platform_statistics` cache table.
- Create PostgreSQL Triggers on `users` and `incidents` tables that automatically update the cache table upon `INSERT`/`DELETE`.
- The Admin dashboard will query the lightweight stats table, reducing load times to <50ms and ensuring the database remains strictly within the free-tier compute limits.

### 2.2 Public API Infrastructure & Rate Limiting

**The Problem:** The `/admin/api-keys` UI has been built professionally, but the generated keys currently lack a robust backend gateway to serve real incident data securely.
**The Solution:**

- Build production-ready Next.js Route Handlers (e.g., `/api/v1/incidents`).
- Integrate **Upstash Redis** (already in the ALPAR stack) to enforce strict rate limits (e.g., 60 requests/minute for Free tier, 1000 requests/minute for Pro tier).
- Validate API keys cryptographically against the Supabase database.
- This will officially open ALPAR AI to researchers, journalists, and universities, allowing them to pull verifiable AI incident data programmatically.

### 2.3 End-to-End (E2E) Automation Testing via Playwright

**The Problem:** While our CI/CD pipeline enforces `pnpm lint`, `pnpm typecheck`, and unit tests (759 passing), these do not simulate real user browser interactions. Complex UI updates risk silent failures in critical flows.
**The Solution:**

- Implement **Playwright** E2E testing to simulate user journeys (e.g., "Sign In -> Report Incident -> Admin Panel -> Generate API Key").
- Run these simulated browser tests autonomously on Vercel preview deployments.
- This ensures absolute confidence that no future update breaks the platform's core accountability flows.

## 3. Implementation Plan

- **Phase 1 (Data):** Create the `platform_statistics` table and PostgreSQL triggers via a Supabase migration file.
- **Phase 2 (API):** Develop the `/api/v1` routes and Upstash Redis rate-limiter middleware.
- **Phase 3 (Testing):** Write and integrate Playwright test scripts for the three most critical user journeys.

## 4. Alignment with ALPAR AI Directives

- **Performance:** Aligns with the "Zero Cost Shield" mandate by offloading heavy queries, preserving database compute.
- **Transparency:** The Public API fulfills the core mission of making AI incident data globally accessible.
- **Reliability:** E2E testing guarantees the 360° oversight mechanisms remain functional at all times.
