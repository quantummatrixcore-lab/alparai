# PROFESSIONAL UI/UX & DESIGN RECOMMENDATIONS

> **AI Model:** deepseek v4 flash  
> **Date:** 2026-06-16  
> **Context:** ALPAR AI — AI accountability platform, www.alparai.com

---

## Current State: UI ~60/100

The infrastructure is robust (88/100, DORA Elite), but the visual layer is weak:

- Minimalist but _austere_ — lacks character and warmth
- The hero section is text-heavy with poor visual hierarchy
- Lacks a premium icon/illustration set
- The color palette is flat, missing gradient/glow/depth effects
- Provider logos are SVG wordmarks instead of vector brand marks
- Incident cards are plain text boxes

---

## IMMEDIATE ACTIONS (This Week)

### 1. Security: `.env.local` Removal + Token Rotation

- `.env.local` is tracked in git; tokens are exposed
- Rotate the Vercel token (`vcp_502...`) and Supabase token (`sbp_1b9...`)
- Run `git rm --cached .env.local` and update `.gitignore`

### 2. Hero Section Visualization

- AI failure live counter (63 → current)
- 22 provider graph (bar chart race)
- Timeline animation of milestone AI incidents
- Add a team photo or brand illustration

### 3. Upgrade Provider Logos

- Current: SVG wordmark (text-based)
- Target: Vector logo (colored, recognizable, consistent dimensions)
- Fallback: Placeholder + provider name

### 4. Relax Login Requirements

- Dilemma voting can be made anonymous
- Incident viewing is public (already configured)
- Enable delayed registration for submission (anonymous report → email verification)

---

## SHORT TERM (1-2 Weeks)

### 5. Premium Icon Set

- Add Lucide or Phosphor icon sets
- Use Heroicons outline + solid (aligning with shadcn/ui)
- Implement gradient icons for a premium feel

### 6. Introduce Depth to the Color System

- Subtle shadows on cards (lift on hover)
- Ambient glow in the hero (gradient background)
- Gradient borders based on incident severity
- Dark mode transition animations

### 7. Visualize Incident Cards

- Color-coded severity badge with icons
- Timeline indicator (occurrence → detection → resolution)
- Provider avatar + name
- Vote count (up/down vote animations)
- Pill-shaped, color-coded category tags

### 8. Animation Layer

- Framer Motion is present but underutilized
- Add page transitions (soft fade + slide)
- Implement scroll-triggered reveals (Intersection Observer)
- Add counter animations for votes and provider counts
- Add loading skeletons with shimmer effects

---

## 1 MONTH OUT

### 9. Brand Illustration Set

- Custom illustrations themed around AI accountability
- Playful illustration for the 404 page
- Empty state illustrations ("No incidents reported yet")
- Subtle background patterns in the brand color for the hero

### 10. Live Feed (Homepage)

- Live stream of recent incidents
- Make social proof immediately visible
- Auto-scroll carousel
- "Just reported" badge on new incidents

### 11. Leaderboard → Data Visualization

- Bar chart race showing provider ranking over time
- Trend lines (last 30 days)
- Heatmap highlighting who leads in which category
- Exportable charts (PNG/SVG)

### 12. Public API v1 + API Docs UI

- Swagger/OpenAPI UI
- Interactive playground to test endpoints
- Rate limit indicator
- Code snippets (curl, Python, JS)

---

## TECHNICAL NOTES

### Current Stack (Applicable to UI)

| Technology    | Status                |
| ------------- | --------------------- |
| Tailwind v4   | Active                |
| Framer Motion | Active, underutilized |
| shadcn/ui     | Active                |
| Lucide React  | Recommended           |
| next/font     | Active (Inter)        |
| next/image    | Active                |

### Atomic Design System Approach

```
Atoms:    Badge, Button, Icon, Input, Tag
Molecules: Card, Table, FormGroup, NavItem
Organisms: Hero, IncidentCard, Leaderboard, Footer
Templates: PageLayout, AuthLayout, DashboardLayout
Pages:    Home, Incidents, Leaderboard, Models, About
```

---

## COMPARISON WITH EXTERNAL AUDIT

| Claim                     | Accuracy      | Comment                                             |
| ------------------------- | ------------- | --------------------------------------------------- |
| "Zero incidents"          | ❌ False      | 50 incidents live, 22 providers, 2,680 votes        |
| "Login wall drops 60-80%" | ⚠️ Partial    | View is public, submit requires login — intentional |
| "i18n raw keys visible"   | ❌ False      | Full translations present                           |
| "Founder story missing"   | ❌ False      | Present but lacks visual emphasis                   |
| "Tech score 65/100"       | ❌ Incomplete | 88/100 — live verification was not run              |

---

**AI Model:** deepseek v4 flash  
**Last Updated:** 2026-06-16
