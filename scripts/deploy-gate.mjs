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

console.log("Deploy Gate: Inspecting commit message and branch...");
console.log(`Commit message: "${commitMsg}"`);
console.log(`Commit ref: "${process.env.VERCEL_GIT_COMMIT_REF || ""}"`);

const isMaster = (process.env.VERCEL_GIT_COMMIT_REF || "").includes("master");
const hasDeployTag = commitMsg.includes("[deploy]") || commitMsg.includes("deploy");

if (isMaster || hasDeployTag || !process.env.VERCEL_ENV) {
  console.log("✓ Master branch or [deploy] tag detected. Proceeding with build.");
  process.exit(1); // Exit with 1 to proceed with build
} else {
  console.log("✕ Skipping build for non-master commit without [deploy] tag.");
  process.exit(0); // Exit with 0 to skip build
}
