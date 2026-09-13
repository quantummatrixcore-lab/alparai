# SECURITY EXCEPTION SEC-001 — semver ReDoS chain (documented, 2026-09-12 night)

## Gate split (binding from this date)

- HARD GATE: `pnpm audit --prod --audit-level high` must be 0 high / 0 critical. Current: 1 low. GREEN.
- ADVISORY: full-tree `pnpm audit` is informational. One known high below. No new highs may be added without owner approval.

## The exception

- Finding: semver ReDoS (GHSA-c2qf-rxjj-qqgw) via `imap-simple > imap > utf7 > semver@5.3.0`.
- Exposure: NIL for the shipped product. The chain serves exactly one file, `scripts/mail-agent.js` (ops inbox reader, server-side, never bundled into the Next.js app, never reachable by visitors). No `src/` file imports it (verified by grep).
- Remediation attempts (all logged): 3 override shapes in `pnpm-workspace.yaml`, hand-written patch + `patchedDependencies`, official `pnpm patch` (refuses: ERR_PNPM_PATCH_NO_LOCKFILE on pnpm 9.12). Resolver does not honor overrides on this exact-pin edge.
- Containment: `imap-simple` moved from dependencies to devDependencies (app runtime no longer declares it). Mail inbox reading fully preserved.
- Removal condition: replace IMAP inbox reading with a library outside the utf7 chain, or pnpm fixes override/patch behavior. Revisit quarterly.
