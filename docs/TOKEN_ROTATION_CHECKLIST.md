# ALPAR AI — Token Rotation Checklist & Smoke Test Runbook

This document details the step-by-step procedure for rotating all critical API keys and secrets used by ALPAR AI.

---

## 🔑 Rotation Checklist

### 1. Supabase Service Role Key & DB Password

- **Where to Rotate:** Supabase Dashboard → Project Settings → API
- **Steps:**
  1. Click **"Roll Key"** on the `service_role` key. Set the grace period to **24 hours** (if available) to prevent immediate downtime.
  2. Copy the new key.
  3. Go to **Vercel Project Settings** → **Environment Variables**.
  4. Update `SUPABASE_SERVICE_ROLE_KEY` with the new value.
  5. Go to Project Settings → Database. Click **"Reset database password"** if rotating the DB password.
  6. Update Vercel environment variable `DATABASE_URL` (if configured/needed).
  7. Redeploy the application on Vercel to pick up the new variables.

### 2. Vercel Personal/Team Access Token

- **Where to Rotate:** Vercel Account Settings → Tokens
- **Steps:**
  1. Generate a new Vercel token with the correct scope (e.g. read/write for the project/team).
  2. Update any local or GitHub Actions secrets referring to `VERCEL_TOKEN`.
  3. Revoke the old token.

### 3. Resend API Key

- **Where to Rotate:** Resend Dashboard → API Keys
- **Steps:**
  1. Click **"Create API Key"**. Give it sending permissions for `alparai.com`.
  2. Copy the key.
  3. Update `RESEND_API_KEY` in **Vercel Environment Variables** and `.env.local`.
  4. Revoke the old API key on Resend.

### 4. OpenRouter API Key

- **Where to Rotate:** OpenRouter Key Settings
- **Steps:**
  1. Create a new API key.
  2. Update `OPENROUTER_API_KEY` (or the equivalent variable for LLM providers) in Vercel and `.env.local`.
  3. Delete the old key.

### 5. Google Vertex AI / GCP Service Account Key

- **Where to Rotate:** Google Cloud Console → IAM & Admin → Service Accounts
- **Steps:**
  1. Select the service account used by ALPAR AI.
  2. Go to the **Keys** tab, click **"Add Key"** → **"Create new key"** (JSON).
  3. Update the credential payload variable (e.g., base64 encoded service account key or env path) in Vercel settings.
  4. Delete the old key only after verifying the new key works.

### 6. Upstash Redis Rest URL & Token

- **Where to Rotate:** Upstash Console → Redis Database → Details
- **Steps:**
  1. Under the **"REST API"** section, click the rotation/regenerate button next to the Token.
  2. Update `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel Environment Variables and `.env.local`.

---

## 🧪 Production Smoke Test Runbook

After any key rotation, run the following verification checks:

1. **Database Access & RLS Check:**
   Verify that public pages can fetch data (uses `anon` key) and server actions can execute mutations (uses `service_role` key):
   - Access the homepage `/en` and verify the incident list/leaderboard loads.
   - Go to `/en/transparency` and verify counters show correctly.

2. **Email Delivery Smoke Test:**
   - Go to `/en/contact` and submit a test query, verify that a structured log or transactional email is sent successfully.

3. **E2E/Local Suite Verification:**
   Run the Playwright E2E suite to verify that the app handles auth redirecting, form submissions, and token validations:

   ```bash
   npx playwright test --project="chromium"
   ```

4. **Health Check Endpoint:**
   - Query the `/api/health` endpoint (if E6 is completed) to ensure all services are reporting `healthy`.
