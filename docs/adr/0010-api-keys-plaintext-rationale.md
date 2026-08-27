# ADR 0010: LLM Provider API Keys Plaintext Storage Rationale

## Status

Accepted

## Context

The "api_keys" table currently stores secrets in plaintext in the "api_key" column ("20260623000200_create_api_keys_table.sql"). A security audit (CRYPT-1) flagged this for either application-layer encryption or architectural documentation.

As of the Q3 2026 Update Plan (v1.3), client API keys have been migrated out of "api_keys" into a dedicated "client_api_keys" table which implements SHA-256 hashing. This leaves the "api_keys" table strictly for internal LLM provider secrets (e.g., OpenRouter, OpenAI, Anthropic).

## Decision

We accept storing internal LLM provider secrets in plaintext within the "api_keys" table.

## Rationale

1. **Usage Context**: These keys are read by the application to authenticate outbound requests to third-party LLM providers. They must be sent in plaintext over the wire (via HTTPS/TLS). Application-layer encryption would require managing a master encryption key, adding complexity without significantly mitigating the risk model (if the database is compromised, the application secrets managing the master key are likely compromised as well).
2. **Restricted Scope**: The "api_keys" table now exclusively stores a small number of internal service keys, not thousands of client credentials. Client credentials (which we receive but do not use outbound) are securely hashed in "client_api_keys".
3. **Database Security**: The database leverages Row Level Security (RLS) restricting read access to these keys strictly to the service roles necessary for execution.
4. **Environment Fallback**: These keys are often also provisioned via environment variables, which exist in plaintext in memory/process environments anyway.

## Consequences

- The risk of a database leak exposing LLM provider keys remains, but is mitigated by the limited scope of the keys (only internal provider keys, not client-owned keys).
- If a leak occurs, these provider keys must be rotated at the provider level immediately.
- The system avoids the complexity and performance overhead of symmetric encryption/decryption on every model generation request.
