# Admin Information Architecture Specification (v111-design)

**Status:** APPROVED & READY FOR OPENCODE IMPLEMENTATION  
**Author:** Antigravity (Backend & Data Tier Executor)  
**Target:** Admin Console v2 Overhaul

---

## 1. Five Core Navigation Groups

All admin navigation entries MUST be grouped strictly into the following 5 nav groups in `src/components/admin/sidebar.tsx`:

### Group 1: Operations (`operations`)

- **Moderation Queue** (`/admin/incidents`) — Icon: `ShieldAlert`
- **Incidents Data** (`/admin/incidents/all`) — Icon: `Database`
- **Import Feeds** (`/admin/ecosystem/approval-queue`) — Icon: `Import`

### Group 2: Intelligence (`intelligence`)

- **K-BENCHMARK** (`/admin/k-benchmark`) — Icon: `BarChart3`
- **Cross Audit Engine** (`/admin/analysis`) — Icon: `BrainCircuit`
- **Autopilot Operations** (`/admin/autopilot`) — Icon: `Cpu`
- **AI Lab & Innovations** (`/admin/innovations`) — Icon: `Sparkles`
- **GEO Engine Dashboard** (`/admin/geo`) — Icon: `Globe`

### Group 3: Governance (`governance`)

- **Users & Roles** (`/admin/users`) — Icon: `Users`
- **DSAR & Privacy Queue** (`/admin/dsar`) — Icon: `Lock`
- **Audit Logs** (`/admin/audit`) — Icon: `FileText`
- **Advisory Board** (`/admin/advisory-board`) — Icon: `Award`

### Group 4: Growth (`growth`)

- **Social Publisher** (`/admin/social`) — Icon: `Share2`
- **Marketing Pipeline** (`/admin/marketing`) — Icon: `TrendingUp`
- **Launch Signal** (`/admin/launch-signal`) — Icon: `Radio`

### Group 5: System (`system`)

- **Unified System Health** (`/admin/health`) — Icon: `Activity`
- **Cost & Rate Limits** (`/admin/billing`) — Icon: `DollarSign`
- **Capacity & Vendors** (`/admin/resources`) — Icon: `Server`
- **Integrations & APIs** (`/admin/integrations`) — Icon: `Plug`
- **Feature Flags** (`/admin/feature-flags`) — Icon: `ToggleRight`

---

## 2. Icon Assignment Matrix (lucide-react)

Every navigation menu entry and every stat card MUST feature a semantically appropriate icon from `lucide-react`:

| Surface / Menu    | Lucide Icon     | Color Token / Intent     |
| ----------------- | --------------- | ------------------------ |
| Active Status     | `CheckCircle2`  | Emerald (`#00FF88`)      |
| Warning / Pending | `AlertTriangle` | Amber (`#FFD000`)        |
| Critical Failure  | `XCircle`       | Crimson (`#FF3B30`)      |
| System Health     | `Activity`      | Tech Blue (`#00D2FF`)    |
| Total Incidents   | `ShieldAlert`   | Text Primary (`#F3F4F6`) |
| Token / Cost      | `Coins`         | Amber (`#FFD000`)        |
| Latency           | `Zap`           | Emerald (`#00FF88`)      |

---

## 3. Data Visualization & Chart Standards

Recharts components across all admin dashboards MUST adhere strictly to brand tokens:

- **Primary Line / Bar:** `#00FF88` (Emerald Neon)
- **Secondary Data Series:** `#00D2FF` (Tech Blue)
- **Grid Lines:** `rgba(255, 255, 255, 0.05)`
- **Tooltip Background:** `#0E1622` (Slate Gray) with `1px` border `rgba(255, 255, 255, 0.1)`
- **Empty State:** Centered `SkeletonLoader` or `EmptyStateIllustration` primitive with muted gray `#6B7280` text.
