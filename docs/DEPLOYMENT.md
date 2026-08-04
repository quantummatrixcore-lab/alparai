# ALPAR AI — Deployment Runbook

## Prerequisites

- Node.js 20+
- pnpm 9.12+
- Supabase project (production)
- Vercel account (or equivalent hosting)
- Upstash Redis instance
- Resend API key
- Domain: alparai.online

## Environment Variables

### Required (build & runtime)

| Variable                        | Description                             | Where               |
| ------------------------------- | --------------------------------------- | ------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                    | Vercel env          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key                | Vercel env          |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key (server-only) | Vercel env (secret) |
| `UPSTASH_REDIS_REST_URL`        | Upstash Redis REST URL                  | Vercel env          |
| `UPSTASH_REDIS_REST_TOKEN`      | Upstash Redis REST token                | Vercel env (secret) |
| `NEXT_PUBLIC_APP_URL`           | Production URL (https://alparai.online) | Vercel env          |

### Optional

| Variable                       | Description                       | Default         |
| ------------------------------ | --------------------------------- | --------------- |
| `RESEND_API_KEY`               | Resend email API key              | Console logging |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics domain        | Disabled        |
| `SENTRY_DSN`                   | Sentry error tracking DSN         | Disabled        |
| `SENTRY_AUTH_TOKEN`            | Sentry auth token for source maps | Disabled        |

## Deployment Checklist

### Pre-deployment

- [ ] All CI checks pass (lint, typecheck, tests)
- [ ] E2E tests pass locally
- [ ] Database migrations reviewed and tested
- [ ] Environment variables configured in Vercel
- [ ] No `console.log` in production code (only `console.warn`/`error`/`info`)

### Database Migration

```bash
# Apply new migrations to production
supabase db push --linked

# Or via migration file
supabase migration up --linked
```

### Deploy

```bash
# Automatic via Git push to main
git push origin main

# Manual deploy
vercel --prod
```

### Post-deployment

- [ ] Verify health endpoint: `curl https://alparai.online/api/health`
- [ ] Check Sentry for new errors
- [ ] Verify Plausible analytics tracking
- [ ] Test critical flows:
  - Home page loads
  - Incident list renders
  - Sign in works
  - Incident submission works (staging)
  - Admin dashboard accessible

## Rollback Procedure

1. **Vercel rollback:**

   ```bash
   vercel rollback
   ```

2. **Database rollback:**

   ```bash
   # Revert last migration
   supabase migration repair --status reverted <migration_id>
   # Then manually apply down migration SQL
   ```

3. **Verify:**
   - Check health endpoint
   - Run smoke tests
   - Monitor Sentry for 15 minutes

## Monitoring

| System             | URL                 | Purpose                      |
| ------------------ | ------------------- | ---------------------------- |
| Vercel Dashboard   | vercel.com          | Deployment status, logs      |
| Supabase Dashboard | supabase.com        | Database, auth, storage      |
| Upstash Console    | console.upstash.com | Redis metrics, rate limiting |
| Sentry             | sentry.io           | Error tracking               |
| Plausible          | plausible.io        | Privacy-friendly analytics   |

## Incident Response

1. **Identify:** Check Sentry alerts, Vercel logs, health endpoint
2. **Assess:** Determine severity (P0 = site down, P1 = feature broken, P2 = degraded)
3. **Respond:**
   - P0: Immediate rollback, notify team
   - P1: Fix forward or rollback within 1 hour
   - P2: Fix in next deployment
4. **Review:** Post-incident review within 24 hours

## Secret Rotation

Rotate all secrets every 90 days:

| Secret                      | Rotation Method                          |
| --------------------------- | ---------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API      |
| `UPSTASH_REDIS_REST_TOKEN`  | Upstash Console → Database → Reset Token |
| `RESEND_API_KEY`            | Resend Dashboard → API Keys → Regenerate |
| `SENTRY_AUTH_TOKEN`         | Sentry → Settings → Auth Tokens          |

After rotation:

1. Update Vercel environment variables
2. Trigger redeployment
3. Verify health endpoint
4. Update password manager
