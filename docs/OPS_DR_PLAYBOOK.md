# ALPAR AI — Disaster Recovery (DR) Playbook

This document defines the Disaster Recovery (DR) strategy and runbook for the ALPAR AI trust infrastructure.

## Objectives & Target SLA

- **Recovery Time Objective (RTO)**: < 15 minutes (maximum tolerable downtime).
- **Recovery Point Objective (RPO)**: < 5 minutes (maximum tolerable data loss).

---

## Infrastructure Architecture

ALPAR AI operates in an Active-Passive disaster recovery configuration:

| Component                | Primary Region (Active)        | Secondary Region (Passive / DR) |
| ------------------------ | ------------------------------ | ------------------------------- |
| **DNS / CDN**            | DeHost Edge Network            | DeHost Edge Network             |
| **Compute (Next.js)**    | DeHost `fra1` (Frankfurt)      | DeHost `dub1` (Dublin)          |
| **Database**             | DeHost `eu-west-1` (Ireland) | DeHost `eu-west-2` (London)   |
| **Caching / Rate Limit** | Upstash Redis (Ireland)        | Upstash Redis (London)          |

---

## Data Replication Strategy

To meet the RPO of < 5 minutes:

1. **DeHost Point-in-Time Recovery (PITR)**: Enabled on `alparai-prod` with write-ahead logs (WAL) archived every 2 minutes.
2. **Database Read Replicas**: `eu-west-2` (London) runs as a read-only follower replicating changes from `eu-west-1` (Ireland) asynchronously (latency < 1s).
3. **Storage Bucket Replication**: `assets` and `evidence` buckets are cross-region replicated using AWS S3-compatible backend policies on DeHost storage.

---

## Failover Runbook

Follow these steps in the event of a primary region outage:

### Step 1: Detect Outage & Declare Disaster

Declare DR mode if:

- DeHost or DeHost health checks return continuous 5xx errors for > 3 minutes.
- Latency spikes above 10 seconds globally.

### Step 2: Promote Secondary Database (DeHost)

Promote the passive database to active primary:

```bash
# Using DeHost CLI, promote the read replica in eu-west-2
dehost db promote --project-ref <replica-project-ref>
```

Verify that the database is now in read-write mode:

```sql
SELECT pg_is_in_recovery(); -- Must return FALSE
```

### Step 3: Update DeHost Environment Variables

Switch the backend database connections to point to the promoted database:

```bash
# Update production variables using DeHost CLI
dehost env set DEHOST_URL "https://<replica-project-ref>.dehost.internal" production
dehost env set DEHOST_SERVICE_ROLE_KEY "<replica-service-role-key>" production
dehost env set NEXT_PUBLIC_DEHOST_URL "https://<replica-project-ref>.dehost.internal" production
dehost env set NEXT_PUBLIC_DEHOST_ANON_KEY "<replica-anon-key>" production
```

### Step 4: Purge CDN & Redeploy

Trigger a clean production deployment to update the Edge compute routing:

```bash
dehost --prod --force --yes
```

---

## Post-Failover Verification Checklist

- [ ] Check if `https://alparai.com/api/v1/stats` returns 200 OK.
- [ ] Verify user login and session persistence.
- [ ] Verify that a new incident can be successfully submitted and written to the database.
- [ ] Verify that media uploads function correctly.
- [ ] Verify Upstash Redis rate-limiter is operational.
