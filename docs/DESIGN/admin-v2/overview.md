# Screen 1: Admin Overview Dashboard (`/admin`)

## 1. Overview

The primary landing dashboard for system operators, presenting a 360-degree overview of platform telemetry, security alerts, moderation SLA status, and recent audits.

- **English Title:** Control Center / Admin Dashboard
- **Turkish Title:** Kontrol Merkezi / Yönetim Paneli

---

## 2. Page Layout (12-Column Grid)

- **Header Section (Span 12):** `AdminPageHeader` component with page title, current timezone timestamp, and refresh trigger.
- **Top Row (Span 3 each — 4 columns total):** 4 `StatCard` indicators.
  1. Incident Volume (Total + trend sparkline)
  2. Moderation Queue Load (Pending items + amber/red warning indicator)
  3. API Costs (Current month spend + % of threshold)
  4. Autopilot Status (Status LED + active jobs)
- **Middle Row (Span 8 / Span 4):**
  - **Left (Span 8):** Incident Volume & Triage Timeline Chart (Recharts AreaChart, Emerald gradient).
  - **Right (Span 4):** Active Autopilot Status & System Logs Feed (Dense monospaced listing).
- **Bottom Row (Span 12):** Urgent Action items list (moderation flags, redaction alerts).

---

## 3. UI Specifications & Styling

- **Background Fill:** `#060A0F`
- **Cards Fill:** `#0E1622` (frosted glass) with border `1px solid rgba(255, 255, 255, 0.05)`.
- **Chart Accent:** Area fill uses gradient from `#00FF88` (opacity 0.3) fading to transparent. Stroke is `#00FF88` with width `1.5px`.
- **Typography:**
  - Header Title: Display Bold (Size 28px, Color `#F3F4F6`).
  - Stat Values: Mono Data (Size 24px, Color `#00FF88` / `#F3F4F6`).
  - Logs Feed: Mono Data (Size 12px, Color `#9CA3AF`).
