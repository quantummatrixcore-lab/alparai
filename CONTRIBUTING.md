# Contributing

Thanks for your interest in ALPAR AI. We welcome PRs, bug reports, and feature ideas.

## Setup

1. Fork the repo.
2. Clone locally: `git clone https://github.com/your-fork/Alparai.com`
3. Install: `pnpm install`
4. Copy env: `cp .env.example .env.local` and fill in.
5. Reset database: `pnpm db:reset`
6. Run: `pnpm dev` → http://localhost:3000

## Code style

- TypeScript strict.
- Tailwind v4 (CSS-first `@theme`).
- Prefer Server Components; Client Components only when necessary.
- Server Actions for mutations; never `supabase.from().insert()` from the client.
- All copy goes in `messages/{en,tr}.json`.

## Branching

- `main` is always deployable.
- Feature branches: `feat/<short-name>`
- Bug fixes: `fix/<short-name>`
- Hotfixes: `hotfix/<short-name>`

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/). Examples:

- `feat(incidents): add PII banner to detail view`
- `fix(auth): rotate supabase anon key in env example`
- `docs(adr): add ADR-006 PII Guardian`

## Pull requests

- One concern per PR.
- Run `pnpm lint && pnpm typecheck && pnpm test` locally.
- Update `messages/en.json` and `messages/tr.json` together.
- Reference the issue in the PR body (`Closes #123`).

## Testing

- Unit: `pnpm test` (Vitest) — must pass.
- E2E: `pnpm test:e2e` (Playwright) — for user flows.
- Manual: sign in with Google, submit an incident, vote, moderate, submit a takedown.

## Security

- Do not commit `.env.local`.
- Do not log raw PII or IP addresses.
- New tables must have RLS policies.
- New server actions must validate with Zod and check rate limits.

## License

By contributing, you agree that your contributions are licensed under [AGPL-3.0](./LICENSE).
