# ST1 — Streisand Transparency Report

**Date**: 2026-07-12

## Purpose

Log every legal threat, C&D, or DMCA received by ALPAR AI in a public, append-only report. Named after the "Streisand Effect" — the transparency principle that attempts to suppress information often amplify it.

## Implementation

| Layer     | Detail                                    |
| --------- | ----------------------------------------- |
| Migration | `20260727000023_transparency_reports.sql` |
| Page      | `/transparency/legal-threats` (EN+TR)     |
| Namespace | `transparency` namespace keys             |

## Accept Criteria

- Migration ships with RLS (public read for published, admin write)
- Page renders a table of published reports
- Initially empty (name/details withheld until founder approval)
- `docs/METHODOLOGY_AUDITS/st1-design.md` exists
