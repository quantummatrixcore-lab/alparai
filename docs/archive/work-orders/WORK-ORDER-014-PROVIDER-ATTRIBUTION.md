# WORK-ORDER-014 — PROVIDER ATTRIBUTION ENGINE (system finds the provider)

## Why (Auditor-verified)

- `incident-importer.ts:126-151` matches feed text against `providerKeywords` and gives up → null. LB-3 rule ("never invent a provider") is correct and STAYS — the answer is not guessing, it is a confidence-gated pipeline: deterministic match → model judge → human review. "Unknown" remains only as a last resort WITH a review flag, never silent.

## Phase A — Do now (no prod writes)

1. **Alias map expansion** (`providerKeywords` source): every known model/product name → provider slug (gpt/chatgpt/dall-e→openai, claude→anthropic, gemini/bard→google, llama→meta, copilot→microsoft, grok→xai, mistral→mistral, midjourney→stability, deepseek→deepseek, qwen→alibaba, ernie→baidu, nova/titan→amazon, jina→jina, cohere/command→cohere, perplexity→perplexity, character-ai→character-ai, runway/pika→their vendors). Match order: affectedProvider field → title → description → sourceUrl domain. First confident hit wins; record `attribution_method='alias'` + matched keyword.
2. **Model-judge fallback** (async, non-blocking): rows still unmatched go through ONE cheap classification call via the existing model-router (sovereign tier first) asking ONLY "which known AI provider does this incident concern? answer slug or UNKNOWN" + confidence. Threshold ≥0.8 auto-assigns (`attribution_method='model'`, store confidence); below → `needs_provider_review=true`, provider stays null FOR NOW (honest, flaggable).
3. **Review queue + learning loop**: admin triage shows `needs_provider_review` rows; each human decision appends the decisive keyword to the alias map (file-backed, committed). Attribution rate (% auto-resolved) exposed for the dashboard.
4. `pnpm typecheck` + importer tests green. `## WO-014` entry FIRST. TREE_LOCK_LAW.md applies.

## Phase B — GATED (forbidden until owner says "prod-yaz")

5. Backfill run over the 2497 unattributed prod rows: alias pass first (writes only confident hits), model-judge pass second, remainder flagged for review. Full counts reported before/after.

Reply in Turkish, then start with Phase A.
