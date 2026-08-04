# ALPAR AI — Launch Day Runbook

_Version 1.1 (Effective July 2026)_

This document serves as the operational guide for the ALPAR AI founder to manage launch day monitoring, alarms, escalations, and emergency procedures.

---

## 🚨 Monitoring & Alarm Thresholds

On launch day, actively monitor Sentry, Supabase, and Vercel dashboards. If any of the following thresholds are breached, execute the corresponding actions:

### 1. Sentry Errors (P0 Alert)

- **Threshold:** `> 5` unresolved errors per hour.
- **Why it matters:** Indicates a widespread application crash, client-side break, or Server Action failure.
- **Action:**
  1. Check Sentry issue list for the stack trace.
  2. Identify if the error is related to Supabase connections or API-key issues.
  3. If unresolved within 15 minutes, prepare for Rollback.

### 2. Submission Funnel Conversion (P1 Alert)

- **Threshold:** `submit_start` to `submit_complete` conversion rate falls below `50%`.
- **Why it matters:** Users are starting to submit reports but are dropping out or facing form errors (validation, Turnstile site-key mismatches).
- **Action:**
  1. Go to the Submit page locally or in browser, submit a test report.
  2. Check browser console for Turnstile or next-intl missing key errors.
  3. Verify if RLS policies are blocking the inserts in the `incidents` table.

### 3. Cross-Audit Autopilot Failures (P0 Kill Switch)

- **Threshold:** Autopilot/moderation failure rate `> 20%` in the last hour.
- **Why it matters:** Indicates LLM api credentials (OpenRouter, Vertex) are exhausted or rate-limited, causing autopilot runs to stall.
- **Action:**
  1. Trigger the Autopilot Kill Switch by setting the Vercel environment variable `AUTOPILOT_KILL_SWITCH=true` to suspend automated AI moderation.
  2. All incoming incidents will revert to the manual moderation queue (`pending_review` status).

### 4. Database Connection Limits (P1 Warning)

- **Threshold:** Database active connections `> 15` (on Supabase Free Plan).
- **Why it matters:** Supabase free plan connection limits can be easily exhausted by high concurrent traffic.
- **Action:**
  1. Check Supabase Dashboard → Database → Roles.
  2. Verify that connection pooling (Port 6543) is used instead of direct connection (Port 5432) in `DATABASE_URL`.
  3. Enable read-only caching globally on Next.js to reduce direct query hits.

### 5. Database Recovery & RTO (Recovery Time Objective)

- **RTO Target:** `< 60` minutes.
- **Measured RTO Benchmark:** `1239 ms` (1.24 seconds) as of July 12, 2026.
- **Drill Verification:** Database connection successfully established, 5 critical tables verified, and migration schema checked.
- **Reference Log:** `docs/METHODOLOGY_AUDITS/S4-restore-drill-2026-07-12.log`

---

## 🛠️ Pre-Populated Environment Kill-Switches

These environment variables are pre-configured in Vercel to allow immediate remediation of launch-day issues without redeploying code:

| Env Variable            | Purpose                   | Expected Value   | Action / Effect                                                                                     |
| :---------------------- | :------------------------ | :--------------- | :-------------------------------------------------------------------------------------------------- |
| `AUTOPILOT_KILL_SWITCH` | Autopilot override        | `true` / `false` | Suspends automated AI review, route all submissions to manual review queue.                         |
| `TURNSTILE_KILL_SWITCH` | Cloudflare captcha bypass | `true` / `false` | Bypasses Turnstile captcha verification. Set to `true` if Turnstile API goes down.                  |
| `SUBMIT_CTA_HIDDEN`     | Disable submit button     | `true` / `false` | Hides the submit CTA on homepage and submit routes to freeze submissions under spam / legal threat. |
| `RESEND_KILL_SWITCH`    | Email service suspend     | `true` / `false` | Suspends sending transactional emails via Resend to prevent bill spikes or domain ban.              |

---

## 🗓️ T-25 to T-0 Launch Timeline Checklist

To be executed by the founder leading up to launch on **August 2, 2026**:

- [ ] **T-25 (July 8, 2026): Launch Content Finalization**
  - Verify all countdown threads (T-25 to T-3) are drafted and ready.
  - Finalize TR media embargo pitches.
- [ ] **T-22h (Aug 1, 10:00): Schema Lock & Backup**
  - Verify database migrations are fully applied on production.
  - Create manual snapshot backup of the Supabase database.
  - Freeze code merges to the `master` branch.
- [ ] **T-12h (Aug 1, 20:00): Environment Audit**
  - Verify Vercel Production contains all required API keys (Gemini, Anthropic, Resend, Turnstile).
  - Verify all 4 pre-populated kill switches are set to `false`.
- [ ] **T-2h (Aug 2, 06:00): Sanity Check**
  - Run health check endpoint to confirm status `200`.
  - Submit 1 test incident to verify Turnstile and PII Guardian masking.
  - Confirm Sentry dashboards are armed and active.
- [ ] **T-0 (Aug 2, 08:00): GO LIVE!**
  - Publish Product Hunt launch page.
  - Post launch threads on Twitter/X and LinkedIn.
  - Submit announcement to r/selfhosted and r/opensource.
- [ ] **T+2h (Aug 2, 10:00): Live Monitoring**
  - Check Resend log for early transactional email send status.
  - Monitor Supabase database connection pool metrics.
  - Review moderation queue for incoming submissions.

---

## 🔄 Emergency Rollback Procedure

If a critical bug is introduced or the server experiences a complete outage due to a bad release:

1. **Revert the last commit locally:**
   ```bash
   git revert HEAD -m "revert: bad deployment"
   ```
2. **Push the revert to origin/master:**
   ```bash
   git push origin master
   ```
3. **Verify Vercel Promotion:**
   Vercel will automatically build the pushed commit and deploy it. Since master is the production target, the reverted build will go live instantly (deploy in ~2 minutes).

---

## 📞 Escalation Contacts & Support

- **Database / Infrastructure (Supabase):**
  - Portal: https://supabase.com/dashboard/project/azszpzyvxjduhemkjsdh
  - Support: support@supabase.io
- **Hosting / Deployments (Vercel):**
  - Portal: https://vercel.com/quantummatrixcore-lab/alparai-com
- **OAuth / Google Cloud API:**
  - Account: `quantum.matrix.core@gmail.com`
  - Portal: https://console.cloud.google.com/apis/credentials
- **Lead Architect / Emergency Escalation:**
  - AI Team: `antigravity@quantummatrixcore-lab.users.noreply.github.com`
- **Legal Counsel (Attorney Contact):**
  - [PLACEHOLDER - INSERT LEGAL CONTACT]
- **Public Relations (PR Contact):**
  - [PLACEHOLDER - INSERT PR CONTACT]

---

## 🔗 Copy-Ready CTA Links

Use these direct links when posting on social channels or community forums:

- **Hacker News (Show HN):** `https://news.ycombinator.com/submitlink?u=https://alparai.com&t=Show%20HN:%20ALPAR%20AI%20-%20Open-Source%20AI%20Incident%20Registry`
- **Product Hunt:** `https://www.producthunt.com/products/alpar-ai`
- **Twitter/X:** `https://twitter.com/intent/tweet?text=ALPAR%20AI%20is%20live!%20The%20world's%20first%20open-source%20AI%20incident%20registry.&url=https://alparai.com`
- **LinkedIn:** `https://www.linkedin.com/sharing/share-offsite/?url=https://alparai.com`
- **Reddit (r/selfhosted):** `https://www.reddit.com/r/selfhosted/submit?url=https://alparai.com&title=ALPAR%20AI%20-%20Open-Source%20AI%20Incident%20Registry`
