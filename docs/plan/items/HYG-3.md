# HYG-3

**HYG-3 (new, v13.33) — a 1.8MB debug capture landed in the repo.** `c1463309` added `scan-output.txt` (1,843,948 bytes): a UTF-16LE, CRLF console-log capture of the sync script's own stdout — the same PowerShell-redirect corruption pattern already named twice this cycle, this time as a stray artifact rather than a data file. Checked for content, not just format: no email addresses or secrets inside, so this is hygiene, not PII. **Acceptance:** remove the file from the tree; add the pattern the sync script writes to `.gitignore` so redirected debug output stops landing in commits
