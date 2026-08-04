# OPS Rollback Runbook

This document describes the automated rollback procedure for the ALPAR AI platform on Vercel.

## 1. Automated Webhook Rollback Wire

We have implemented an automated rollback mechanism that triggers when Sentry detects a 5xx error rate spike (> 2% over 5 minutes) in production.

- **Webhook Endpoint:** `/api/webhooks/sentry-alert?secret=${SENTRY_WEBHOOK_SECRET}`
- **Route Implementation:** `src/app/api/webhooks/sentry-alert/route.ts`

### Webhook Flow

1. Sentry triggers an alert rule and sends a `POST` webhook with details.
2. Webhook checks if the alert is a `5xx` spike or contains `rollback` in the rule name.
3. Webhook calls Vercel's `GET /v6/deployments` API to retrieve recent deployments.
4. It filters for deployments with state `READY` and selects the _second_ oldest (the previous stable deployment).
5. It calls Vercel's `POST /v1/projects/{projectId}/rollback/{deploymentId}` API to route 100% of production traffic back to the stable build.

## 2. Manual Rollback CLI Procedure

If the automated rollback fails or manual intervention is required:

### Option A: Vercel CLI

Run the following commands using the pre-authenticated Vercel CLI:

```bash
# 1. Rollback to the previous stable deployment ID or URL
vercel rollback <stable-deployment-id-or-url>

# 2. Monitor the status
vercel rollback status
```

### Option B: Vercel Dashboard

1. Go to the [Vercel Dashboard](https://vercel.com/quantummatrixcore-lab/alparai-com).
2. Under the **Production Deployment** section, click **Instant Rollback**.
3. Select the previous stable deployment and confirm.
