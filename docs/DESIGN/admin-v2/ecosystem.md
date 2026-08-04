# Screen 2: Ecosystem News Queue (`/admin/ecosystem`)

## 1. Overview

A moderation console to approve, edit, or reject crawled external news articles and feed incidents before they are promoted to the public timeline.

- **English Title:** Ecosystem Feed Queue
- **Turkish Title:** Ekosistem Haber Kuyruğu

---

## 2. Page Layout (12-Column Grid)

- **Header Section (Span 12):** `AdminPageHeader` with count badges showing `Pending Verification`, `Approved Today`, and `Rejected Today`.
- **Top Row (Span 4 each):** 3 metric widgets:
  1. Queue size (Total count, color-coded amber if >20)
  2. Average feed score (Luminous blue line)
  3. Last fetch status (Timestamp + green/red status indicator)
- **Main Section (Span 12):** The feed queue table/list. Each item is represented as a glassmorphic Bento tile:
  - Source badge (e.g. OECD, TechCrunch, ArXiv)
  - Raw Title and link to the source url
  - Snippet/body (collapsible)
  - Quick action buttons (Approve & Publish, Edit draft, Reject)

---

## 3. UI Specifications & Styling

- **Queue Item Card:** Background `#0E1622` with a `1px` left border colored `#00D2FF` (indicating raw feed import status).
- **Approved State:** Clicking approve flashes the card border to `#00FF88` before fade-out.
- **Rejected State:** Clicking reject flashes the card border to `#FF3B30` before fade-out.
- **Typography:**
  - Source Badge: uppercase Mono Data (Size 10px, spacing `0.1em`).
  - Snippet: Text Secondary (Size 13px, leading `1.5`).
