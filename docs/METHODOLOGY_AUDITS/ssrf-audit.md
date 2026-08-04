# SSRF security audit report — 2026-07-12

=========================================

## 1. Executive Summary

A secure code review was performed on the network-request layers of key system components:

- `openrouter-gateway`
- `OECD feed`
- `import-incidents` cron
- `fetch-external` cron

The audit verifies that all outward network connections conform to the security constraints outlined in Standing Rules #9 (SSRF protection: host allowlisting, no private-IP redirects, and strict destination control).

---

## 2. Component Audit Details

### A. OpenRouter Gateway (`src/lib/ai/openrouter-gateway.ts`)

- **Request Targets:** Restricts outgoing connections exclusively to hardcoded official AI endpoint URLs for registered adapters (OpenRouter, Cohere, HuggingFace, Google Gemini, Blackbox, NVIDIA NGC on integrate.api.nvidia.com).
- **Vulnerability Assessment:** SECURE. Target URLs are static, preventing malicious host injection.

### B. OECD Feed API (`src/app/api/v1/oecd/feed/route.ts`)

- **Request Targets:** Performs 0 outward network requests. Resolves mapping locally by querying the production database and joins values in memory.
- **Vulnerability Assessment:** SECURE. No remote fetch is executed.

### C. Import Incidents Cron (`src/app/api/cron/import-incidents/route.ts`)

- **Request Targets:** Fetches feeds defined strictly in environment variables (`AIAAIC_FEED_URL` and `AIID_FEED_URL`).
- **Vulnerability Assessment:** SECURE. Feeds are server-configured and cannot be modified by user parameters.

### D. Fetch External Cron (`src/app/api/cron/fetch-external/route.ts`)

- **Request Targets:** Fetches from a hardcoded list of verified RSS feeds (MIT Tech Review, 404 Media, Import AI, The Register), Reddit, and HackerNews API schemas.
- **Vulnerability Assessment:** SECURE. Hosts are hardcoded, preventing user-controlled destination redirection.

---

## 3. Conclusion

All reviewed components comply fully with SSRF prevention guidelines. No remote input parameters are evaluated for DNS resolution, making the backend resilient against intranet probing or external port scanning attacks.
