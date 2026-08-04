# Screen 7: Third-Party Catalog & Capacity (`/admin/resources`)

## 1. Overview

The primary vendor index and database health console. It contains the live capacity gauges (limits vs current usage %) and the static 15-entry vendor catalog.

- **English Title:** Platform Resources & Vendors
- **Turkish Title:** Platform Kaynakları ve Sağlayıcılar

---

## 2. Page Layout (12-Column Grid)

- **Header Section (Span 12):** `AdminPageHeader` showing system health status (operational/warning/degraded).
- **Top Row (Span 12 Bento Grid):** Live Capacity Dashboard Gauges (one bar per resource):
  - **Supabase DB size:** used MB / 500 MB (Free limit)
  - **Upstash Redis commands:** daily count / 10k limit
  - **Resend emails:** monthly count / 3k limit
  - **AI Gateway daily spend:** USD / $10.00 cap
- **Bottom Section (Span 12):** The 15 Handover Vendors Catalog Table:
  - Column 1: Vendor Name (e.g. GitHub, Supabase, Hugging Face, Resend)
  - Column 2: Plan/Tier (e.g. Free, Pro)
  - Column 3: Monthly Cost (e.g. $0.00, $20.00)
  - Column 4: Pros/Cons
  - Column 5: Switch Alternatives & Switch-cost notes

---

## 3. UI Specifications & Styling

- **Capacity Gauges:** Linear progress bars (`h-2 rounded-fullbg-bg-tertiary`):
  - Fill color is `#00FF88` (Emerald) if <60%.
  - Fill color is `#FFD000` (Amber) if 60% - 80%.
  - Fill color is `#FF3B30` (Crimson) if >80%.
- **Vendor Table Fills:** Background `#0E1622` with a `1px` border of `rgba(255, 255, 255, 0.05)`. Alternating row background.
- **Typography:**
  - Cost metrics: Mono Data (Size 14px, Color `#F3F4F6`).
  - Gauge labels: Display Bold (Size 12px, Color `#9CA3AF`).
