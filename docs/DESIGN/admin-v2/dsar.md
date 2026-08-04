# Screen 10: DSAR Requests & Privacy Logs (`/admin/dsar`)

## 1. Overview

The privacy, GDPR, and KVKK compliance dashboard. It lists all Data Subject Access Requests (DSARs), data deletions, account cancellations, and audit trails.

- **English Title:** Privacy & DSAR Logs
- **Turkish Title:** Gizlilik ve DSAR Kayıtları

---

## 2. Page Layout (12-Column Grid)

- **Header Section (Span 12):** `AdminPageHeader` showing compliance status badges (`GDPR Compliant`, `KVKK Compliant` in emerald).
- **Top Row (Span 4 each):** 3 metrics:
  1. Open DSAR Requests (Count, amber warning color)
  2. Data Deletions (Total processed count)
  3. Average Resolution SLA (Days/hours)
- **Main Section (Span 12):** Interactive request queue table:
  - User Identifier (hashed, clickable to view details).
  - Request Type (`Data Access`, `Data Erasure / Deletion`).
  - Request Date (Timestamp).
  - Time Remaining (SLA progress bar or countdown).
  - Actions: `Process Deletion Trigger`, `Download Data Package`, `Mark Resolved`.

---

## 3. UI Specifications & Styling

- **SLA Countdown Timer:** Displays remaining time (e.g. `24d 12h left` in amber, or `OVERDUE` in blinking Crimson `#FF3B30`).
- **Trigger Deletion Button:** Crimson background (`#FF3B30`) with white text. Emits a red glow on hover. Requires double-click confirmation.
- **Typography:**
  - Timer: Mono Data (Size 13px).
  - Request Types: Display Bold (Size 12px, capitalized).
  - User Hashes: Mono Data (Size 12px, Color `#9CA3AF`).
