# ALPAR AI - Data Retention Policy

This document defines the data retention periods for the ALPAR AI platform to comply with KVKK, GDPR, and other regulatory frameworks.

## Retention Periods by Category

| Category / Table Type   | Retention Period | Description                                                                                  |
| ----------------------- | ---------------- | -------------------------------------------------------------------------------------------- |
| **Raw Evidence**        | 24 Months        | Original evidence files, logs, and raw inputs collected during incident reports.             |
| **Audit Logs**          | 5 Years          | Core moderation actions, user audits, and security telemetry logs.                           |
| **PII & User Profiles** | 12 Months        | Personal Identifiable Information for inactive accounts.                                     |
| **Deleted Users**       | 30 Days (Grace)  | Deleted user profiles are retained in a soft-deleted state for 30 days before hard-deletion. |
| **Other Data**          | 36 Months        | Default retention period for other database records.                                         |

## Data Retention Policies Reference Table

All active policies are tracked dynamically inside the `public.data_retention_policies` table:

```sql
SELECT table_name, retention_period_months FROM public.data_retention_policies;
```

## Deletion Enforcement

- Deleted users are soft-deleted first and then processed by the `process-deletions` daily cron job after the 30-day grace period.
- Old records matching the retention policies are periodically archived or deleted according to the policy schedule.
