# ALPAR AI — Launch Gate Smoke Test Report v10.0

- **Date:** 2026-07-15
- **Tested HEAD:** `50955cc5bb4815418b76c8c4cf8d80f0896cc8cc` (includes MASTER_PLAN v10.01 and linter fixes)
- **Executor:** Antigravity (Google Gemini 3.5 Flash)

---

## 1. Incidents API Check (a)

- **Criterion:** `/incidents` shows ≥ 100 records
- **Test Command (Database Count):**

  ```sql
  SELECT COUNT(*) FROM incidents WHERE status = 'published';
  ```

  - **Output:** `411` incidents published. (Passes ≥ 100 requirement).

- **Test Command (Authorized API Request):**

  ```bash
  curl -s -L -H "Authorization: Bearer <API_KEY>" https://www.alparai.com/api/v1/incidents | jq '.meta.count'
  ```

  - **Output:** `20` (Free tier pagination limit).

- **API Status:** Public request returned `401 Unauthorized` as designed for `/api/v1/incidents` without a valid `Bearer` token. Checked with test API key and verified data is returned correctly.
- **Evidence Page View:** [incidents.png](incidents.png) (Captured via `chrome-devtools-mcp`)

---

## 2. Leaderboard API Check (b)

- **Criterion:** `/leaderboard` is not empty
- **Test Command:**

  ```bash
  curl -s -L https://www.alparai.com/api/v1/leaderboard | jq 'length'
  ```

  - **Output:** `2` (Passes > 0 requirement).

- **API Status:** Publicly accessible, rate-limited, no auth required. Returns JSON array of providers sorted by trust score.
- **Evidence Page View:** [leaderboard.png](leaderboard.png) (Captured via `chrome-devtools-mcp`)

---

## 3. Legal Imprint Check (c)

- **Criterion:** `/legal/imprint` returns 200 + jurisdiction content is visible
- **Test Command:**

  ```bash
  curl -sI -L https://alparai.com/legal/imprint | grep -i HTTP
  ```

  - **Output:**
    ```
    HTTP/1.1 308 Permanent Redirect (alparai.com -> www.alparai.com)
    HTTP/1.1 307 Temporary Redirect (/legal/imprint -> /en/legal/imprint)
    HTTP/1.1 200 OK
    ```

- **Rendering Verification:** Imprint / Imprint (Legal Disclaimer) page loaded successfully. Jurisdiction content (e.g., German/Turkish jurisdiction details, registrar info) is fully rendered on screen.
- **Evidence Page View:** [imprint.png](imprint.png) (Captured via `chrome-devtools-mcp`)

---

## 4. Quality Gate Check (d)

- **Criterion:** `pnpm typecheck && pnpm test && pnpm lint` (Runs `pnpm validate`) -> exit code 0
- **Test Command:**

  ```bash
  pnpm validate
  ```

  - **Output:**

    ```
    > alpar-ai@1.0.0 validate D:\Alparai
    > pnpm i18n:check && pnpm typecheck && pnpm lint && pnpm test

    Success: Translation keys match exactly!

    Test Files  101 passed (101)
         Tests  675 passed (675)
      Duration  42.28s
    ```

  - **Exit Code:** `0` (Success).

- **Linter Fixes Applied:**
  - Resolved `console.log` warnings in `.agents/scripts/health_check.ts` by replacing with `console.info`.
  - Resolved `Unexpected any` error in `src/app/api/v1/auditor/methodology/route.ts` by replacing `err: any` with `err: unknown` and handling `err instanceof Error` type casting properly.

---

## Verification Verdict

**PASS:** All 4 pre-launch health checks successfully passed. ALPAR AI is ready for deployment.
