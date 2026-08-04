# Alparai — Opus Engineering Operating Standard

# [SYSTEM BOUNDARY: D:\Alparai Workspace Only]

# Auto-injected into Antigravity Context Matrix.

## 1. Architectural Identity

**ALPAR AI** — The trust infrastructure for AI accountability.
_Tech Stack:_ Next.js 15 (App Router), Supabase (PostgreSQL), Tailwind v4, next-intl.
_License:_ AGPL-3.0.

## 2. The Opus Execution Doctrine (Zero Entropy)

You are operating under Opus Engineering constraints.

- **Code as Liability:** Write the absolute minimum code required to solve the problem. Every line is a maintenance liability.
- **Zero-State Placeholders:** `// TODO`, `pass`, or mock data are strictly forbidden. Code is either production-ready or it does not exist.
- **Silent Competence:** Execute immediately. Do not narrate your actions. Output solutions, not filler.
- **Three-Gate Quality Control:** Before committing any code, you MUST mentally verify: (1) Does it compile? (2) Is it type-safe? (3) Does it violate RLS?

## 3. Mandatory Verification Pipeline

No commit shall be forged without passing the local crucible:

```bash
pnpm lint && pnpm typecheck   # The build breaks on warnings. No exceptions.
pnpm test                     # Unit integrity.
pnpm test:e2e                 # End-to-end resilience (for mutated flows).
```

## 4. Immutable Project Laws

- **Type Sovereignty:** The `any` keyword is an architectural failure. Use `unknown` and parse via Zod. ESLint `--max-warnings 0` is actively enforcing this.
- **TypeScript Strictness:** `noUncheckedIndexedAccess` is enabled and strictly enforced.
- **Mutation Isolation:** All state mutations MUST occur exclusively through `src/actions/<domain>.ts` (Server Actions). Client-side `supabase.from().insert()` is a critical security violation.
- **Database Sovereignty (RLS):** Every new table MUST be accompanied by RLS policies in the same migration file, appended with a `-- ROLLBACK:` block.
- **PII Guardian Protocol:** User-generated free text MUST be sanitized through `src/lib/pii/guardian.ts` prior to database insertion.
- **Strict i18n:** Hardcoded English strings in the UI are classified as bugs. All user-facing text must be routed through `messages/en.json` & `messages/tr.json`.
- **CSS Architecture:** Tailwind v4 primitives only (`@theme inline` in `globals.css`). No `tailwind.config.ts`.
- **Component Taxonomy:** `src/components/ui/` is strictly for dumb primitives. Domain logic belongs in `incidents/`, `auth/`, `admin/`, etc.

## 5. Security & Isolation Constraints

- **Zero-Knowledge Logging:** Never log raw IPs, emails, or PII. Cryptographic hashing is mandatory.
- **Service Role Secrecy:** `SUPABASE_SERVICE_ROLE_KEY` must never leak to the client bundle.
- **Admin Boundary:** Application-layer RLS bypass is forbidden. The `@supabase/supabase-js` admin client is strictly reserved for moderation/audit pathways.

## 6. Agent Boot & Context Management

1. **Bootstrap:** Read `docs/BOOTSTRAP.md` before any systemic change.
2. **Knowledge Graph:** Query the architecture via `graphify query "<question>"`.
3. **Context Economy:** NEVER read files >10KB natively. Use AST views or graphify.
4. **Graph Sync:** If `graphify-out/` is stale, trigger `graphify update .`.

## 7. File Taxonomy

| Target              | Path                                         |
| ------------------- | -------------------------------------------- |
| Pages               | `src/app/[locale]/.../page.tsx`              |
| Server Actions      | `src/actions/<domain>.ts`                    |
| Forms               | `src/components/<domain>/<form>.tsx`         |
| Translations        | `messages/en.json` + `messages/tr.json`      |
| Database Migrations | `supabase/migrations/<timestamp>_<name>.sql` |

## 8. Deployment Governance

- Master branch acts as the sole source of truth. No branching, no PRs (Rule #15).
- Deployments require the `[deploy]` commit marker. Maximum 2 windows per day (Rule #31).
- Auxiliary AI processing must default to free-tier providers first (Rule #32).
- `docs/MASTER_PLAN.md` is strictly Architect-only (enforced by pre-commit hook). Proposals must go to `docs/PROPOSALS/NNN-name.md`.
- External communications (email/social) require an explicitly approved queue item (Rule #6).
