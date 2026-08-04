# A1 — Anonymous Email Hash (Anon-Legal Copy Patch)

## Status

**COMPLETED** — 2026-07-12

## Rationale

Under **DSA Art. 14** (Due diligence obligations for intermediary services), anonymous reporters must be able to submit reports of illegal content without being required to identify themselves. However, the platform may need a **secure, non-reversible contact channel** for follow-up clarifications.

Under **Law No. 5651 Art. 9** (Turkey), content providers must facilitate notice-and-action for unlawful content while protecting whistleblower identity.

### Design Decision

- The email is **never stored in plaintext** — only a `sha256` hash is kept.
- The hash is **not used as a lookup key** (no login, no identity resolution). It exists solely for:
  - **De-duplication** — prevent spam bursts from the same person
  - **Future optional feature** — "check status of your report via hash" (no PII exposure)
- The field is **optional** — a reporter can submit with zero identifying information if desired.

## Changes

| File                                                          | Change                                                                                                         |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `messages/en.json`                                            | Added `anonymous_email_label`, `anonymous_email_hint`                                                          |
| `messages/tr.json`                                            | Added `anonymous_email_label`, `anonymous_email_hint`                                                          |
| `src/types/database.ts`                                       | Added `anonymous_email_hash: string \| null` to `incidents` Row/Insert/Update                                  |
| `supabase/migrations/20260712000001_anonymous_email_hash.sql` | New migration adding the column                                                                                |
| `src/actions/incidents.ts`                                    | `SubmitWorkInput.raw` gains `anonymous_email` field; `runSubmitWork` sha256-hashes it → `anonymous_email_hash` |
| `src/components/incidents/incident-form.tsx`                  | Optional email `Input` shown when `isAnonymous` is checked, stored in draft state                              |

## Verification

- `pnpm typecheck` — PASS
- `pnpm lint` — clean (ops/ pre-existing issues unrelated)
- `pnpm test` — 78 files / 596 tests PASS
