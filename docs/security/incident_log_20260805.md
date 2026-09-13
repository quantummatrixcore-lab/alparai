# Security Incident & Infrastructure Log — 2026-08-05

## 1. Executive Summary

Continuous integration and secret scanning audits performed on 2026-08-05 identified secret revocations, GitHub Actions workflow failures, and account quota limits across `quantummatrixcore-lab/alparai`.

## 2. Incident Details

### A. GitHub Actions Quota Exhaustion

- **Account**: `quantummatrixcore-lab`
- **Included Monthly Limit**: 3,000 minutes
- **Status**: 100% used (3,000 / 3,000 minutes consumed as of 2026-08-05 15:01:40 UTC).
- **Reset Date**: September 01, 2026 (in 27 days).
- **Impact**: Automatic CI/CD workflows blocked unless spending limit / billing budget is increased or usage resets.

### B. Resend API Key Revocation

- **Key Name**: `Alpar AI Agent` (`re_azPYeA4u...`)
- **Exposed Location**: `scripts/outreach_auto.js` (Commit `b367d8b85a3b88abd419c8129aa46a7d6b9ad537`)
- **Action Taken**: Automatically detected by GitHub Secret Scanning and permanently revoked by Resend Security on 2026-08-04.
- **Remediation**: Key removed from version control; replacement key managed via `.env` / DeHost environment variables.

### C. DeHost API Key Revocation

- **Project**: `alparai-prod` (`azszpzyvxjduhemkjsdh`)
- **Key Pattern**: `sb_secret_1sBUc...`
- **Action Taken**: Permanently revoked across all infrastructure endpoints by DeHost Security on August 5, 2026 at 10:00 CEST.
- **Remediation**: Rotated to new production service role key and synced to DeHost production environment variables.

### D. GitHub Security Audit Workflow Failure

- **Workflow**: `Security Audit` (`.github/workflows/security-audit.yml`) on commit `4a64d99` (`master`).
- **Failures**:
  - **Secretlint Scan**: Failed (1 annotation - hardcoded credential detection).
  - **Gitleaks Secrets Scan**: Failed (2 annotations - secrets in `scripts/outreach_auto.js` and legacy `.env.local` tracking).

## 3. Advisory Board Outreach Update

- **Sean McGregor (AIID Founder)**: Responded on 2026-07-29 declining immediate Advisory Board invitation due to research bandwidth, but expressed interest in tracking ALPAR AI's progress and requested follow-up in 2 months (late September 2026).
- **Action Item**: Recorded in `docs/OUTREACH/advisory_followups.md`.
