# G2 Privacy Policy & KVKK Audit — 2026-07-12

=============================================

## 1. i18n & Page Audit

- **Target File:** [Privacy Policy Page](file:///d:/Alparai/src/app/[locale]/legal/privacy/page.tsx)
- **Audit Status:** **PASS**
- **Verification:** Dynmic rendering with next-intl namespaces is fully implemented.

---

## 2. Gap Identification & Third-Party Audit

The current terms lack explicit mention of specific subprocessors and precise retention periods. We identified the following gaps:

1. **Third-Party Providers:** The list of subprocessors must explicitly specify:
   - **Supabase** (Database, Auth, and Storage)
   - **Vercel** (Application Hosting)
   - **Resend** (Email delivery)
   - **Sentry** (Error tracking)
   - **Plausible** (Privacy-friendly Analytics)
   - **OpenRouter** (AI Inference Gateway)
   - **Turnstile** (Cloudflare spam protection)
2. **DPO Contact Details:** Explicit routing to `privacy@alparai.com`.
3. **Retention Periods:** Must declare:
   - **Active Accounts:** Until deletion request.
   - **Verified Incidents:** Permanently archived (public interest).
   - **Rejected Submissions:** Deleted after 30 days.
   - **Audit & Security Logs:** Retained for 1 year.
   - **Backups:** Deleted/rotated after 90 days.
4. **KVKK Compliance Alignment:** A separate Turkish language KVKK page is required to comply with Turkish Personal Data Protection Law (6698 Sayılı Kanun).

---

## 3. Mitigation Action Plan

1. **Enrich `messages/en.json` and `messages/tr.json`:** Update the `legal` namespace with explicit subprocessor entries and DPO contacts.
2. **Scaffold `/legal/kvkk` Page:** Implement the dedicated KVKK information text page (`src/app/[locale]/legal/kvkk/page.tsx`) mapping Article 11 rights.
