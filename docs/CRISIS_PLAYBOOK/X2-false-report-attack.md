# X2: Coordinated False Report Attack

## Trigger

Sudden spike in incidents (e.g., 50+ in an hour) targeting a specific provider, often with similar wording, low-quality evidence, or from newly created accounts.

## Immediate Actions (T+0 to T+2 hours)

1. **Engage Kill-Switch:** Toggle AUTOPILOT_KILL_SWITCH=true to pause automatic verifications.
2. **Rate Limiting:** Ensure the Cloudflare/Vercel rate limiters are blocking the IP ranges.
3. **Mass Status Update:** Move suspicious incidents from published to pending_review.

## Communication Templates

### Public Statement

> We are currently investigating anomalous incident reporting activity targeting a specific AI provider. To maintain the integrity of the ALPAR AI ledger, we have temporarily paused auto-publishing and are manually reviewing recent submissions.
