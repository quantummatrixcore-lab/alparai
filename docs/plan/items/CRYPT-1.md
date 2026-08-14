# CRYPT-1

**CRYPT-1** — Encrypt `api_keys.api_key` at the application layer, or document why plaintext is accepted. `20260623000200_create_api_keys_table.sql:2-5` currently stores plaintext; RLS authorises on role only. Owner: Implementer (v13.40).

## Still open

Unchanged. `api_keys.api_key` remains plaintext. PLAY-1 closing narrows the blast radius —
the synthetic admin can no longer appear in production — but the column is still readable in
clear by anyone holding an admin session or a database backup.
