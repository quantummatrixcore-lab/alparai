# L11 — Advisory Board Rotation Policy

**Date**: 2026-07-12  
**Status**: Adopted

## Rules

- **Term limit**: 2 years per member.
- **Rotation**: 50% of the board rotates out each year.
- **Re-appointment**: Eligible after 1-year cool-down period.
- **Maximum consecutive terms**: 2 (4 years total), then mandatory 2-year break.

## Implementation

| Field      | Column       | Type                     |
| ---------- | ------------ | ------------------------ |
| Term start | `term_start` | `timestamptz`            |
| Term end   | `term_end`   | `timestamptz`            |
| Active     | `is_active`  | `boolean` (default true) |

Migration: `20260727000017_advisory_terms.sql`

## Enforcement

- `is_active` is set to `false` automatically when `term_end < now()` via application logic.
- The admin panel displays remaining term for each advisor.
- Rotation notifications sent 60 days before term end.

## Exception

Founding members may serve an initial 3-year term to ensure continuity. All subsequent terms follow the 2-year limit.
