# 🔌 API-NEXUS — The Master API Contract

> **[CORE DIRECTIVE]** This document is the Single Source of Truth for all API communications within the Agent-Os ecosystem.
> **RESTRICTED COMPLIANCE:** Only MBP (Master Brain Prime) is allowed to write and update this file in `Ortak`. Worker agents (Backend, Frontend, LLM) MUST read their local mirrored copy from their `.nexus/` directory. MBP will delegate these contracts via tasks.

---

## 1. 🚦 PORT & GATEWAY DOCTRINE

To eliminate CORS issues and routing chaos, all agents must adhere to these strict ports:

- **Frontend (Next.js):** `http://localhost:3000` (Production URL dynamically set via Vercel).
- **Backend (Rust/Axum):** `http://localhost:8000` (The Main Gateway. Handles all Auth and DB queries. Exposes `/api/v1/*`).
- **LLM Gateway (Python):** `http://localhost:8080` (Strictly internal. Only the Backend can talk to the LLM Gateway. Frontend NEVER talks to LLM directly).

---

## 2. 📨 THE DELEGATED CONTRACT PROTOCOL

When MBP decides a new API endpoint is required, MBP MUST:

1. Document the exact endpoint, HTTP method, Request JSON, and Response JSON in this file.
2. Create a task for the **Backend Agent** dictating the exact Rust implementation needed to serve this contract.
3. Create a task for the **Frontend Agent** dictating the exact React/TypeScript interface needed to consume this contract.

---

## 3. 📖 ACTIVE API CONTRACTS

### 3.1. Authentication (Example)

- **Endpoint:** `POST /api/v1/auth/login`
- **Gateway:** Backend (Rust)
- **Request Payload:**
  ```json
  {
    "email": "string",
    "password_hash": "string"
  }
  ```
- **Response Payload (Success 200):**
  ```json
  {
    "token": "string",
    "user_id": "string",
    "iq_level": "number"
  }
  ```

### 3.2. LLM Prompt Execution (Example)

- **Endpoint (Frontend to Backend):** `POST /api/v1/agent/prompt`
- **Endpoint (Backend to LLM):** `POST http://localhost:8080/v1/chat/completions`
- **Flow:** Frontend -> Backend (Auth Check) -> LLM Gateway -> Backend -> Frontend.

_SEALED: API-NEXUS | V42.0.0_
