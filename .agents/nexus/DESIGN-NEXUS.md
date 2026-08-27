# 🎨 DESIGN-NEXUS — The Visual Constitution

> **[CORE DIRECTIVE]** This document is the Single Source of Truth for all UI/UX styling within the Agent-Os ecosystem.
> **RESTRICTED COMPLIANCE:** The Frontend Agent MUST use these exact design tokens. Guessing colors, margins, or animations is strictly banned to ensure absolute visual cohesion.

---

## 1. 🌈 COLOR PALETTE (Tailwind Tokens)

Always use the established Tailwind classes. Never use arbitrary colors (e.g., `bg-[#123456]`) unless defined here.

- **Background (Dark Mode Only):** `bg-neutral-950`
- **Surface / Cards:** `bg-neutral-900` with `border border-neutral-800`
- **Primary Accent:** `text-emerald-500` and `bg-emerald-500/10`
- **Secondary Accent:** `text-blue-500`
- **Text Primary:** `text-neutral-100`
- **Text Secondary:** `text-neutral-400`
- **Error/Danger:** `text-red-500`

---

## 2. 📐 TYPOGRAPHY & SHAPE

- **Font:** Always use the default sans font (Inter).
- **Border Radius:** Use `rounded-xl` for cards, `rounded-lg` for inputs/buttons. Sharp corners are forbidden.
- **Shadows:** Use `shadow-2xl shadow-emerald-500/5` for elevated surfaces.

---

## 3. ✨ GLASSMORPHISM & ANIMATIONS

- **Glass Effect:** For floating headers or modals, use `bg-neutral-900/50 backdrop-blur-md`.
- **Interactivity:** ALL clickable elements MUST have a hover state (e.g., `hover:bg-neutral-800 transition-all duration-200`).
- **Micro-animations:** Use `active:scale-95` on buttons for physical feedback.

_SEALED: DESIGN-NEXUS | V42.0.0_
