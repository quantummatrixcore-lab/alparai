# Deploy Gate Audit Report (v10)

This document provides evidence and validation for **Item 116: Deploy Gate**. The deploy gate restricts Vercel production and preview builds to trigger _only_ when the triggering commit message contains the `[deploy]` marker. This conserves Vercel build time and guarantees that intermediate development commits do not deploy automatically.

## Implementation Details

The deploy gate is implemented via the `ignoreCommand` hook in `vercel.json` pointing to a unified Node.js script `scripts/deploy-gate.mjs` for cross-platform compatibility:

### vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "ignoreCommand": "node scripts/deploy-gate.mjs",
  "framework": "nextjs",
  ...
}
```

### scripts/deploy-gate.mjs

```javascript
import { execSync } from "child_process";

// Vercel Ignore Build Step Script
// Proceeds with the build ONLY if the commit message contains "[deploy]"

let commitMsg = process.env.VERCEL_GIT_COMMIT_MESSAGE || "";

if (!commitMsg) {
  try {
    commitMsg = execSync("git log -1 --pretty=%B").toString().trim();
  } catch (err) {
    console.error("Failed to get commit message from git:", err.message);
  }
}

console.log("Deploy Gate: Inspecting commit message...");
console.log(`Commit message: "${commitMsg}"`);

if (commitMsg.includes("[deploy]")) {
  console.log("✓ Commit message contains '[deploy]'. Proceeding with build.");
  process.exit(1); // Exit with 1 to proceed with build
} else {
  console.log("✕ Commit message does not contain '[deploy]'. Ignoring build.");
  process.exit(0); // Exit with 0 to skip build
}
```

## Local Verification Output

### 1. Skipped Build Simulation (No `[deploy]` in message)

```powershell
$env:VERCEL_GIT_COMMIT_MESSAGE="docs: add Claude Opus 4.6 responses to strategic questionnaire"
node scripts/deploy-gate.mjs
echo "Exit code: $LASTEXITCODE"
```

**Output:**

```
Deploy Gate: Inspecting commit message...
Commit message: "docs: add Claude Opus 4.6 responses to strategic questionnaire"
✕ Commit message does not contain '[deploy]'. Ignoring build.
Exit code: 0
```

_(Exit code `0` tells Vercel to cancel/ignore the build step)._

### 2. Allowed Build Simulation (`[deploy]` present in message)

```powershell
$env:VERCEL_GIT_COMMIT_MESSAGE="docs: add [deploy] flag"
node scripts/deploy-gate.mjs
echo "Exit code: $LASTEXITCODE"
```

**Output:**

```
Deploy Gate: Inspecting commit message...
Commit message: "docs: add [deploy] flag"
✓ Commit message contains '[deploy]'. Proceeding with build.
Exit code: 1
```

_(Exit code `1` tells Vercel to proceed with the build step)._

---

## Live Vercel Verification Output

A commit (`890550db15c3ceb893c5c93c4df021b017b2b62d`) without the `[deploy]` marker was pushed to the `master` branch. The Vercel CLI inspection results verify that the build was ignored/canceled automatically:

```
> npx vercel inspect alparai-com-8kngp0f82-quantumatrixcore-lab.vercel.app

  🚀  https://alparai-com-8kngp0f82-quantumatrixcore-lab.vercel.app (Preview)

  Project:      quantumatrixcore-lab/alparai-com
  Git:          github:quantummatrixcore-lab/Alparai.com/commit/890550db15c3ceb893c5c93c4df021b017b2b62d
  Created by:   quantum.matrix.core@gmail.com
  Env vars:     95 production, 95 preview, 95 development
  Status:       Canceled
  Target:       Preview
  Creator:      quantumatrixcore-lab
  Created:      2026-07-17 22:27:18 GMT+3 (6m ago)

  Log:          https://vercel.com/quantumatrixcore-lab/alparai-com/8kngp0f82/logs
```

**Status:** ✅ VERIFIED PASSED
**Date:** 2026-07-17
**Executor:** Antigravity (Gemini 3.5 Flash)
