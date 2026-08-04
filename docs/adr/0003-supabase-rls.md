# ADR-003: Supabase + Postgres + RLS

- **Status:** Accepted
- **Date:** 2026-06-01

## Decision

Use **Supabase** (managed Postgres + Auth + Storage) as the data tier. Use **Row Level Security** for authorization.

## Rationale

- Postgres is the only DB we trust for this kind of relational, audited, multi-tenant data.
- Supabase gives us Postgres + auth + storage + RLS + edge functions in one package, with EU (Frankfurt) hosting.
- RLS is the cleanest authorization model: policies live with the data, not in application code. This means fewer "I forgot to check the role" bugs.

## Consequences

- Single source of truth for auth, data, and storage.
- RLS makes it impossible to write a query that bypasses authz (even a typo).
- Migrations are plain SQL, version-controlled.

* We're locked to Supabase's pricing & availability. The schema is portable; the auth layer is partially.
* We must learn to write RLS policies (versus app-level checks).

## Patterns

- Server actions use the `server` client (anon + user cookie) for normal reads/writes; `admin` client (service role) for moderator actions, audit log writes, view counts.
- The `admin` client is `server-only` and never exposed to the browser bundle.

## Alternatives

- **Self-hosted Postgres + Lucia Auth + S3:** rejected for v1. Too much ops.
- **PlanetScale / Neon:** rejected. No auth, no storage, no RLS.
- **Firebase / Firestore:** rejected. No relational joins, weak RLS, vendor lock-in.
