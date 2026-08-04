# ACP-2 Sidebar Navigation Inventory Audit (v10.43 — Item 156)

## Overview

This document provides the mandatory ACP-2 BEFORE vs AFTER route inventory for the 18 admin page exceptions listed in `tests/e2e/admin-sidebar-integrity.spec.ts`.

## Inventory Matrix

| Route                          | Pre-38dbe2b Status | Post-38dbe2b Status | Classification & Justification                         |
| ------------------------------ | ------------------ | ------------------- | ------------------------------------------------------ |
| `/admin/ai-pulse`              | Absent in sidebar  | Absent in sidebar   | Sub-dashboard under `/admin/analysis`                  |
| `/admin/api-keys`              | Absent in sidebar  | Absent in sidebar   | Sub-route under `/admin/integrations`                  |
| `/admin/api-metrics`           | Absent in sidebar  | Absent in sidebar   | Sub-route under `/admin/billing`                       |
| `/admin/autopilot/analytics`   | Absent in sidebar  | Absent in sidebar   | Nested sub-route under `/admin/autopilot`              |
| `/admin/crons`                 | Absent in sidebar  | Absent in sidebar   | System utility page under `/admin/health`              |
| `/admin/cross-audit-dashboard` | Absent in sidebar  | Absent in sidebar   | Legacy alias route for `/admin/analysis`               |
| `/admin/experts`               | Absent in sidebar  | Absent in sidebar   | Sub-route under `/admin/advisory-board`                |
| `/admin/finance`               | Absent in sidebar  | Absent in sidebar   | Sub-route under `/admin/billing`                       |
| `/admin/import`                | Absent in sidebar  | Absent in sidebar   | Sub-route under `/admin/ecosystem`                     |
| `/admin/investors`             | Absent in sidebar  | Absent in sidebar   | Sub-route under `/admin/strategy/valuation`            |
| `/admin/master-plan`           | Absent in sidebar  | Absent in sidebar   | Admin documentation viewer sub-route                   |
| `/admin/outreach`              | Absent in sidebar  | Absent in sidebar   | Sub-route under `/admin/marketing`                     |
| `/admin/providers`             | Absent in sidebar  | Absent in sidebar   | Sub-route under `/admin/resources`                     |
| `/admin/redaction-queue`       | Absent in sidebar  | Absent in sidebar   | Sub-route under `/admin/moderation`                    |
| `/admin/settings`              | Absent in sidebar  | Absent in sidebar   | Utility settings page accessible via user profile menu |
| `/admin/signals`               | Absent in sidebar  | Absent in sidebar   | Sub-route under `/admin/launch-signal`                 |
| `/admin/slo-dashboard`         | Absent in sidebar  | Absent in sidebar   | Sub-route under `/admin/health`                        |
| `/admin/takedown`              | Absent in sidebar  | Absent in sidebar   | Sub-route under `/admin/moderation`                    |

## Verification

- `git show 38dbe2b^:src/components/admin/sidebar.tsx` confirms ZERO of these 18 routes were in `sidebar.tsx` before commit `38dbe2b`.
- All 18 routes are legitimate sub-routes, modal views, or utility endpoints that are accessed contextually from parent pages rather than primary sidebar navigation.
- No top-level navigation routes were dropped or regressed.
