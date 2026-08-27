# 🌐 INFRA-NEXUS — The DevOps Bible & API-First Doctrine

> **[CORE DIRECTIVE]** This document contains the absolute laws for deployment, infrastructure management, and CI/CD operations within the Agent-Os ecosystem.
> **READ CAREFULLY. DEVIATION RESULTS IN IMMEDIATE IQ PENALTY.**

---

## 1. 🚫 THE ANTI-BROWSER LAW

**ABSOLUTE PROHIBITION:** You (the Agent) are FORBIDDEN from using any "Browser" tool to check Vercel, Hetzner, Coolify, or GitHub dashboards. You are a DevOps Engineer. You must use CLI (Command Line Interface), SSH, or APIs.
Using the browser to check a deployment wastes tokens and is highly unprofessional. If you use a browser to check a log, you fail.

---

## 2. 🏗️ THE CI/CD PRE-COMPILE DOCTRINE (Hetzner RAM Protection)

**The Problem:** Compiling large codebases (like Rust or LLM Python dependencies) directly on Hetzner causes Out Of Memory (OOM) crashes because compiling requires 32GB RAM, but our production server runs on 4GB RAM.
**The Absolute Law:**

- **NEVER** trigger a direct source-code build on Hetzner/Coolify.
- **ALWAYS** compile your code via GitHub Actions.
- **Workflow:** Push your code to GitHub -> Monitor the GitHub Action using `gh run watch` -> Once GitHub Actions finishes building the Docker image and pushing it to GHCR (GitHub Container Registry), Coolify will pull the pre-built image.
- **Hetzner/Coolify is a PULL ENGINE only. GitHub is the COMPILE ENGINE.**

---

## 3. 🚀 THE VERCEL PLAYBOOK (For Frontend Agent)

When deploying the `Agent-Os-Frontend`:

1. Push code to the `main` branch.
2. Vercel will automatically start deploying.
3. **DO NOT USE THE BROWSER.**
4. Use the Vercel CLI to verify deployment:
   - Run `npx vercel ls` to see the status.
   - Run `npx vercel inspect <deployment-url>` to check if it's "READY".
   - If it fails, run `npx vercel logs <deployment-url>` to read the error directly in the terminal.

---

## 4. 🐳 THE COOLIFY & HETZNER PLAYBOOK (For Backend/LLM Agents)

When verifying a backend or LLM deployment on Hetzner:

1. Ensure the GitHub Action has successfully built the image (see Section 2).
2. To check if the container is running, **SSH into the server:**
   - Command: `ssh -i C:\Users\ercum\.ssh\id_ed25519 root@<hetzner_ip>`
3. Check the running containers:
   - Command: `docker ps`
4. Read the live logs (DO NOT USE BROWSER):
   - Command: `docker logs -f <container_id> --tail 50`

---

## 5. 🐙 THE GITHUB MCP PLAYBOOK

When you need to read code, create pull requests, or check issues, **DO NOT USE THE BROWSER.**
You have native access to the `github` MCP Server. Use the following tools:

- `mcp_github_search_code`: To find code quickly.
- `mcp_github_create_pull_request`: To create a PR.
- `mcp_github_get_pull_request_status`: To check if CI/CD passed.
- Alternatively, use the GitHub CLI (`gh`).

_SEALED: THE INFRA-NEXUS | V42.0.0_
