# Proposal 002: Continuous Benchmark Pipeline (Event-Driven Measurement)

## Context

Alpar AI's database currently contains thousands of documented AI failures (1113 incidents and growing). The system needs an automated way to continuously convert these passive incidents into active Benchmark Questions (Question Bank) and evaluate target AI models without manual intervention.

## Objective

Implement an automated pipeline that continuously processes newly ingested incidents into the benchmark dataset and runs evaluation cycles across active AI models.

## Proposed Architecture

1. **DeHost Cron Trigger:**
   - Create `src/app/api/cron/benchmark/route.ts`.
   - Update `dehost.json` to trigger this endpoint periodically (e.g., daily at 00:00 UTC).
   - This endpoint must be secured using `Authorization: Bearer process.env.CRON_SECRET`.

2. **Pipeline Logic (`src/actions/admin-question-bank.ts` modifications):**
   - **Phase 1 (Ingestion):** Fetch unprocessed incidents (e.g., those not yet linked in `k_benchmark_question_bank`). For each incident, invoke a Free-tier LLM to generate 1 test prompt, 1 expected behavior, and difficulty level.
   - **Phase 2 (Evaluation):** Fetch the new questions, dispatch them to active free-tier models (DeepSeek, MiMo, Nemotron) via parallel requests.
   - **Phase 3 (Scoring):** Insert results into `k_benchmark_evaluations`.

3. **Cost & Token Constraints:**
   - The cron job will process a maximum of 10-50 incidents per run to stay within Free-tier token limits and DeHost Pro Max Duration limits (300s).
   - OpenCode Free Tier models will be used for both generation and evaluation phases.

## Rationale

- **Decoupled & Serverless:** DeHost Cron natively integrates with Next.js App Router, requiring zero DB-level triggers (avoiding DeHost pg_cron limitations on Free tier).
- **Scalable:** By chunking processing (batch size 50), we avoid timeouts and token exhaustion.

## Action Requested from Architect (Opus)

Please review this continuous benchmark pipeline strategy.
Provide approval or architectural corrections. Once approved, Antigravity will proceed with the implementation on the `master` branch.
