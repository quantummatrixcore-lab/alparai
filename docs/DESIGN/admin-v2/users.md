# Screen 5: User Roles & RBAC Management (`/admin/users`)

## 1. Overview

User directory and access control panel, enabling administrators to search users, modify system roles, assign advisor badges, and audit user permissions.

- **English Title:** User Directory & Roles
- **Turkish Title:** Kullanıcı Rehberi ve Yetkiler

---

## 2. Page Layout (12-Column Grid)

- **Header Section (Span 12):** `AdminPageHeader` with an integrated email search input.
- **Top Row (Span 4 each):** 3 metrics:
  1. Total Registered Users (Total count)
  2. Verified Advisors (Badged user count in tech blue)
  3. Active Moderators (Count)
- **Main Section (Span 12):** Grid table listing users.
  - Column 1: Email (hashed if GDPR/KVKK anonymized, otherwise readable).
  - Column 2: Created Date (Timestamp).
  - Column 3: Role (Select dropdown: `user`, `moderator`, `advisor`, `admin`, `ceo`).
  - Column 4: Badges (Visual chips like `Pioneer`, `Ethics Advocate`).
  - Column 5: Status (Active / Deleted).

---

## 3. UI Specifications & Styling

- **Role Dropdown:** Custom styled `<select>` element with a dark background (`#060A0F`), emerald border on hover, and custom arrow icon.
- **Badge Chips:** Small pills with low opacity fills:
  - `Pioneer`: background `rgba(0, 210, 255, 0.1)`, text `#00D2FF`.
  - `Advisor`: background `rgba(0, 255, 136, 0.1)`, text `#00FF88`.
- **Typography:**
  - Hashed Emails / IDs: Mono Data (Size 12px, Color `#6B7280`).
  - Dates: Mono Data (Size 12px, Color `#9CA3AF`).
