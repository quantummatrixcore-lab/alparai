# 🛠️ TOOLS-NEXUS — Full Third-Party Capability Registry

> **[CORE DIRECTIVE]** This is the SINGLE SOURCE OF TRUTH for all third-party tools, CLIs, MCP servers, and platforms available in the Sovereign Zenith V42.0.0 ecosystem.
> **RULE:** Every agent MUST read this file before starting any task. Failure to use an available tool when it would serve the task = -20 IQ penalty, no exceptions.
> **RULE:** If a tool is listed as STATUS: DEGRADED or STATUS: BLOCKED, agents must acknowledge this and use the fallback method.

---

## 🔴 STATUS LEGEND
| Status | Meaning |
|:---|:---|
| ✅ ACTIVE | Tool is fully operational. Use it. |
| ⚠️ DEGRADED | Partial functionality. Use with fallback. |
| 🔴 BLOCKED | Credential/network failure. Use fallback only. |
| 🔧 SETUP_REQUIRED | Tool is installed but not configured. |

---

## 1. 🐙 GITHUB MCP SERVER
**Package:** `@modelcontextprotocol/server-github`
**Status:** 🔴 BLOCKED — "Bad credentials" (GITHUB_TOKEN env var is not correctly mapped)
**Fallback:** GitHub CLI (`gh`) via terminal. This MUST be used until MCP is restored.

### Full Capability Map:
| Tool | Description | Agent Access |
|:---|:---|:---|
| `mcp_github_get_file_contents` | Read any file from any repo/branch | ALL |
| `mcp_github_create_or_update_file` | Create or update single file with commit | ALL |
| `mcp_github_push_files` | Push multiple files in one atomic commit | ALL |
| `mcp_github_create_branch` | Create new branch from any source | ALL |
| `mcp_github_create_pull_request` | Open a PR with title, body, head→base | ALL |
| `mcp_github_get_pull_request` | Get PR details (title, status, checks) | ALL |
| `mcp_github_get_pull_request_files` | List files changed in a PR | ALL |
| `mcp_github_get_pull_request_reviews` | Get review status of a PR | ALL |
| `mcp_github_get_pull_request_comments` | Get inline/review comments | ALL |
| `mcp_github_create_pull_request_review` | Submit APPROVE/REQUEST_CHANGES/COMMENT | ALL |
| `mcp_github_get_pull_request_status` | Get CI check statuses on a PR | ALL |
| `mcp_github_merge_pull_request` | Merge a PR (merge/squash/rebase) | MB-PRIME ONLY |
| `mcp_github_update_pull_request_branch` | Sync PR branch with base | ALL |
| `mcp_github_list_issues` | List issues with filters (state, labels) | ALL |
| `mcp_github_get_issue` | Get single issue details | ALL |
| `mcp_github_create_issue` | Create a new issue with labels/assignees | ALL |
| `mcp_github_update_issue` | Update issue (close, label, assign) | ALL |
| `mcp_github_add_issue_comment` | Add comment to issue | ALL |
| `mcp_github_list_pull_requests` | List PRs with state/sort filters | ALL |
| `mcp_github_list_commits` | Get commit history for a branch | ALL |
| `mcp_github_search_code` | Full-text search across repos | ALL |
| `mcp_github_search_issues` | Search issues across all repos | ALL |
| `mcp_github_search_repositories` | Discover repos | ALL |
| `mcp_github_search_users` | Find GitHub users | ALL |
| `mcp_github_create_repository` | Create new GitHub repository | MB-PRIME ONLY |
| `mcp_github_fork_repository` | Fork a repository | MB-PRIME ONLY |

### 🔴 FALLBACK (While BLOCKED): GitHub CLI (`gh`)
```bash
# Check CI/CD status
gh run watch
gh run list --repo quantummatrixcore-lab/<repo>

# Issues
gh issue list --repo quantummatrixcore-lab/<repo>
gh issue create --title "..." --body "..." --repo quantummatrixcore-lab/<repo>

# PRs
gh pr list --repo quantummatrixcore-lab/<repo>
gh pr create --base main --head <branch> --title "..." --body "..."
gh pr status

# Code
gh api repos/quantummatrixcore-lab/<repo>/contents/<path>
```

---

## 2. 🔧 GIT CLI (Local — ALWAYS ACTIVE)
**Status:** ✅ ACTIVE — Always available in any workspace directory.
**Doctrine:** MUST be used for all commit/push operations. Never leave changes uncommitted.

### Full Capability Map:
| Command | Use Case |
|:---|:---|
| `git status` | Check modified/staged files before any commit |
| `git diff` | Review exact code changes before committing |
| `git add <file>` | Stage specific files (prefer over `git add .`) |
| `git commit -m "<type>(<scope>): <desc>"` | Commit with Conventional Commits format |
| `git push` | Push to remote |
| `git pull` | Sync with remote before starting work |
| `git log --oneline -10` | Review recent commit history |
| `git branch -a` | List all branches |
| `git checkout -b <branch>` | Create and switch to new branch |
| `git stash` | Temporarily save uncommitted changes |
| `git diff HEAD~1` | Compare with last commit |

### Commit Message Convention (MANDATORY):
```
<type>(<scope>): <short description>

Types: feat | fix | docs | chore | refactor | test | security | perf
Scopes: backend | frontend | llm | ortak | gateway | infra | governance
Examples:
  feat(backend): add HMAC timestamp validation to webhook endpoint
  fix(security): remove hardcoded API secrets from middleware.rs
  docs(governance): update SESSION-CHECKPOINT with Phase E status
```

---

## 3. 🐳 DOCKER CLI (Hetzner/Coolify — Via SSH)
**Status:** ✅ ACTIVE (Requires SSH into Hetzner first)
**SSH Command:** `ssh -i C:\Users\ercum\.ssh\id_ed25519 root@<HETZNER_IP>`

### Full Capability Map:
| Command | Use Case |
|:---|:---|
| `docker ps` | List running containers |
| `docker ps -a` | List all containers including stopped |
| `docker logs -f <id> --tail 50` | Read live container logs |
| `docker exec -it <id> /bin/bash` | Enter container shell |
| `docker pull ghcr.io/quantummatrixcore-lab/<image>` | Pull pre-built image from GHCR |
| `docker stop <id>` | Stop a container |
| `docker rm <id>` | Remove a stopped container |
| `docker images` | List local images |
| `docker stats` | Live resource usage (RAM/CPU) |
| `docker inspect <id>` | Full container config/state |
| `docker network ls` | List Docker networks |
| `docker volume ls` | List Docker volumes |

---

## 4. ▲ VERCEL CLI
**Status:** ✅ ACTIVE (via `npx vercel`)
**Doctrine:** NEVER use browser to check Vercel. Use CLI only.

### Full Capability Map:
| Command | Use Case |
|:---|:---|
| `npx vercel ls` | List deployments and their status |
| `npx vercel inspect <url>` | Check if deployment is READY |
| `npx vercel logs <url>` | Read deployment build/runtime logs |
| `npx vercel env ls` | List environment variables |
| `npx vercel env add <name>` | Add environment variable |
| `npx vercel --prod` | Force production deployment |
| `npx vercel rollback` | Rollback to previous deployment |

---

## 5. 🤖 NEXUS-DECA-CORE MCP (Custom Internal)
**Package:** `node dist/mcp/nexus-mcp-server.js`
**Status:** ⚠️ DEGRADED — Requires `OPENROUTER_API_KEY` env var to be set.

### Full Capability Map (17 Tools):
| Tool | Description |
|:---|:---|
| `nexus_trigger_pipeline` | Run full TCSFL pipeline (Test→Commit→Sync→Format→Log) |
| `atlas_check_budget` | Daily/monthly spend, limits, utilization |
| `atlas_get_forecast` | Project end-of-month spend from 7-day burn rate |
| `sentinel_scan_repo` | Scan for secrets/vulnerabilities (scope: all/frontend/backend/uplink) |
| `tom_optimize_prompt` | Token optimizer for prompts or batch arrays |
| `monorepo_read_file` | Read any file under REPO_ROOT |
| `monorepo_write_file` | Write to allowed paths (frontend/, src/, scripts/, tasks/) |
| `monorepo_list_dir` | List directory with optional recursion |
| `get_engine_iq_scores` | DECA-IQ leaderboard for all 17 engines |
| `lighthouse_get_data` | Full LIGHTHOUSE consolidated payload |
| `lighthouse_snapshot` | Unified V17 snapshot: all engines + ATLAS + SENTINEL |
| `nexus_get_stats` | NEXUS event bus stats + last 50 events |
| `nexus_event_log` | Ring buffer: last N events with channel filter |
| `omega_command_review` | OMEGA operator panel: approve/reject pending commands |
| `prometheus_scan_tech` | Scan AI providers for new/cheaper models |
| `chronos_check_deps` | Dependency quarantine list via npm scan |
| `system_health_check` | Live health for all registered engines |

---

## 6. 🦀 CARGO CLI (Backend — Rust)
**Status:** ✅ ACTIVE (in `d:\Agent-Os-backend\`)
**Doctrine:** Agent-B MUST run `cargo check` before every commit.

| Command | Use Case |
|:---|:---|
| `cargo check` | Fast syntax/type check (no binary produced) |
| `cargo build` | Debug build (use in local dev only) |
| `cargo test` | Run all unit + integration tests |
| `cargo clippy` | Lint with suggestions (enforce zero warnings) |
| `cargo fmt` | Format code to rustfmt standard |
| `cargo doc` | Generate API documentation |

---

## 7. 🐍 PYTHON / UVICORN (LLM Gateway)
**Status:** ✅ ACTIVE (in `d:\Agent-Os-LLM\`)

| Command | Use Case |
|:---|:---|
| `uvicorn main:app --reload` | Start LLM gateway in dev mode |
| `python -m pytest` | Run test suite |
| `python -m ruff check .` | Lint Python code |
| `pip install -r requirements.txt` | Install dependencies |

---

## 8. ⚡ NEXT.JS / NODE CLI (Frontend)
**Status:** ✅ ACTIVE (in `d:\Agent-Os-Frontend\`)

| Command | Use Case |
|:---|:---|
| `npm run dev` | Start dev server on :3000 |
| `npm run build` | Production build (validate before deploy) |
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript type validation |
| `npx tsc --noEmit` | TypeScript check without build |

---

## 9. 🔑 ENVIRONMENT VARIABLES (Critical — Current Status)
| Variable | Service | Status |
|:---|:---|:---|
| `OMNI_API_KEY` | Backend HMAC | ⚠️ Must be set in production env |
| `OMNI_API_SECRET` | Backend HMAC | ⚠️ Must be set in production env |
| `GITHUB_TOKEN` / `GITHUB_PAT` | GitHub MCP | 🔴 BLOCKED — credentials invalid |
| `OPENROUTER_API_KEY` | LLM Gateway / Nexus MCP | ⚠️ Check if active |
| `DATABASE_URL` | Backend PostgreSQL | ✅ Active |
| `LITELLM_GATEWAY_URL` | Backend→LLM routing | ✅ Active |

---

## 10. 📐 STITCH MCP (Google — UI Design)
**Status:** ✅ ACTIVE (via Antigravity MCP server)

| Tool | Description |
|:---|:---|
| `mcp_StitchMCP_generate_screen_from_text` | Generate full UI screen from text prompt |
| `mcp_StitchMCP_edit_screens` | Edit existing screens with prompt |
| `mcp_StitchMCP_generate_variants` | Generate design variants |
| `mcp_StitchMCP_create_design_system` | Create token-based design system |
| `mcp_StitchMCP_update_design_system` | Update design system |
| `mcp_StitchMCP_apply_design_system` | Apply design system to screens |
| `mcp_StitchMCP_get_project` | Get project details |
| `mcp_StitchMCP_list_screens` | List all screens in a project |
| `mcp_StitchMCP_get_screen` | Get single screen details |
| `mcp_StitchMCP_list_projects` | List all Stitch projects |
| `mcp_StitchMCP_create_project` | Create new design project |

---

## ⚠️ MANDATORY RULES FOR ALL AGENTS

1. **Before any task:** Check this file. If a 3rd party tool can do it, USE IT.
2. **GitHub MCP is BLOCKED:** Use `gh` CLI or local `git` CLI instead.
3. **Never use browser** for anything a CLI can do (per INFRA-NEXUS Anti-Browser Law).
4. **Always commit** changes using `git` CLI with conventional commit messages.
5. **After any tool produces output:** Check if it can be verified with another tool.
6. **Tool capability violation:** -20 IQ. No exceptions. The General has spoken.

*SEALED: TOOLS-NEXUS | V42.0.0 | Last Updated: 2026-05-09*
