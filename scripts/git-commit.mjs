import { execSync } from "child_process";

try {
  console.log("Staging all changes...");
  execSync("git add -A", { stdio: "inherit" });
  
  console.log("Committing changes...");
  const commitMsg = "feat(i18n): add completeness script and fill de/fr/ru translations (#120) [deploy]";
  execSync(`git commit -m "${commitMsg}"`, { stdio: "inherit" });

  console.log("Pushing to origin master...");
  execSync("git push origin master", { stdio: "inherit" });

  console.log("SUCCESS: Pushed to origin/master successfully!");
} catch (err) {
  console.error("Git operation failed:", err.message);
  process.exit(1);
}
