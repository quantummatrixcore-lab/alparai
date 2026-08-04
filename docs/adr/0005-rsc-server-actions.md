# ADR-005: Server Components + Server Actions

- **Status:** Accepted
- **Date:** 2026-06-01

## Decision

Use **React Server Components** for all reads and **Server Actions** for all mutations. Client Components are reserved for genuinely interactive widgets (vote buttons, drag-and-drop uploader, language switcher).

## Rationale

- Smaller JS bundle. RSC ships HTML, not React.
- No "waterfall" of useEffect fetches.
- Server Actions are CSRF-protected by Next.js (same-origin POST + `Next-Action` header).
- Mutations close over the RSC tree, so revalidation is automatic.

## Consequences

- Performance, security, and DX are aligned.

* We cannot use `useEffect` + Supabase client for mutations. All writes go through `src/actions/`.
* We need `useFormState` / `useFormStatus` for UX.
* We must keep the `admin` Supabase client out of any client bundle (use `import "server-only"`).

## Patterns

- Forms: `<form action={serverAction}>` with `useFormState` for the result and `useFormStatus` for the loading state.
- Optimistic UI: use the action's result + `useOptimistic` for instant feedback (votes, upvotes).
- "Live" data (live feed): use Server Components with `revalidate: 30` or `revalidatePath()` after writes.
