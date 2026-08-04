# PROPOSAL: Wave Triage & Retroactive Code Sanitization

This proposal addresses **Item 91 (Wave Triage)** by defining concrete queue items and acceptance criteria for the features proposed in `docs/PROPOSALS/007-mbs-innovation-audit.md`, as well as rendering a keep/remove triage verdict for the quarantined code shipped under commits `54025a8`, `51bac8f`, and `27efb26`.

---

## 1. Retroactive Code Triage Verdicts

A rigorous review of the quarantined modules has been conducted to align with our security posture, code cleanliness, and resource constraints.

### 1.1 Commit `54025a8` — Cost Router & Engine Registry

- **Verdict**: **KEEP (with modifications)**
- **Rationale**: The tiered cost-routing structure (T0–T4) is necessary for budget enforcement (Rule #20), allowing the application to scale down model selection dynamically based on budget trends. The Engine Registry provides metadata necessary for a live Autopilot Dashboard.
- **Remediation & Acceptance Criteria**:
  1. Remove any hardcoded metrics or static mocks.
  2. Implement unit tests for the Cost Router's budget deduction logic under simulated high-load scenarios.
  3. Ensure the cron-monitor route `/api/admin/cron-monitor` is strictly gated using `requireAdmin` and does not leak system configuration.

### 1.2 Commit `51bac8f` — Sentinel Scanner v1

- **Verdict**: **KEEP (with integration)**
- **Rationale**: An automated secret and injection detection scanner protects public submission routes from database exposure and code injection. It aligns with our security posture.
- **Remediation & Acceptance Criteria**:
  1. Integrate the Sentinel Scanner into the PII Guardian pipeline (`src/lib/pii/guardian.ts`) to intercept raw incident submissions before database writes.
  2. Perform ReDoS (Regular Expression Denial of Service) safety analysis on the 80+ patterns. Add timeout limits to pattern matching.

### 1.3 Commit `27efb26` — Claude-OpenCode Bridge

- **Verdict**: **REMOVE**
- **Rationale**: The bridge introduces local background PowerShell daemons (`watch-bridge.ps1`) and filesystem polling inside `.bridge/`. This increases the attack surface, creates local environment dependencies, and violates sandbox isolation principles. Our MCP-based workspace execution renders this custom polling architecture redundant.
- **Remediation & Acceptance Criteria**:
  1. Completely delete `.bridge/` and `scripts/bridge/`.
  2. Delete `src/lib/bridge/` and associated mock utilities.
  3. Restore `src/agents/marketing/social_publisher.ts` and `vitest.config.ts` to their pre-bridge states.

---

## 2. Proposed Queue Items (Post-Triage)

Based on `007-mbs-innovation-audit.md` and the Safe Automation Doctrine, the following new queue items are proposed:

### Item 117 [Antigravity] — Cost Router Tiering & Dynamic Fallback

- **Description**: Connect the Cost Router's T0–T4 definitions to the LLM Gateway calls in `src/actions/` and `src/agents/`. When a query is initiated, select the model based on budget health:
  - normal: Pro models (T4)
  - daily cost > $30: Flash models (T2/T1)
  - daily cost > $45: Free-tier / local models (T0)
- **Acceptance Criteria**:
  1. Dynamic fallback changes model routing correctly based on daily cost mock values (Vitest).
  2. Zero hardcoded model fallback targets in actions.

### Item 118 [Antigravity] — Cron Monitor Database Audit Trail

- **Description**: Create a Supabase table `cron_job_logs` to log the starting state, duration, success status, and error payload of all Next.js cron endpoints.
- **Migration Schema**:
  ```sql
  CREATE TABLE public.cron_job_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cron_name TEXT NOT NULL,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      completed_at TIMESTAMP WITH TIME ZONE,
      status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
      error_message TEXT,
      execution_metadata JSONB DEFAULT '{}'::jsonb
  );
  ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Admin only read" ON public.cron_job_logs FOR SELECT TO authenticated USING (is_admin());
  ```
- **Acceptance Criteria**:
  1. Schema migration runs cleanly with a valid `-- ROLLBACK:` block.
  2. Logging middleware/decorator intercepts cron handlers and logs entry + exit to `cron_job_logs`.

### Item 119 [OpenCode] — Autopilot Dashboard Live Telemetry

- **Description**: Rebuild `/admin/autopilot` (currently mock/placeholder) to render real metrics:
  - Average execution latency per run.
  - Active engines status (heartbeat from Engine Registry).
  - Cron run logs from `cron_job_logs`.
  - Active daily token counts.
- **Acceptance Criteria**:
  1. Live telemetry queries database fields directly.
  2. No placeholder elements; amber/red thresholds reflect actual SLI alerts.

### Item 120 [Antigravity + OpenCode] — Safe LinkedIn Posting Pipeline

- **Description**: Implement an official LinkedIn-API posting design with a manual Founder approval step.
  - Generates marketing draft cards in the `marketing_drafts` table.
  - Keeps drafts in `pending_approval` state.
  - Gated default-OFF via environment flag `LINKEDIN_PUBLISHING_MODE`.
  - Admin page `/admin/social` has a "Publish to LinkedIn" button for each draft. Clicking it triggers the real API publish.
  - **No automated posting is allowed without a Founder click.**
- **Acceptance Criteria**:
  1. Draft generation sets state to `pending_approval`.
  2. Real API publishing occurs only inside a `requireAdmin`-gated server action triggered by a client-side click event.
  3. Safe Automation Doctrine criteria satisfied: official LinkedIn REST API (no Puppeteer/browser-automation), kill switch env `DISABLE_LINKEDIN_POSTING=true`, DB audit log of all manual publishing actions.
