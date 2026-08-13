import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const checks = [
  {
    name: "check-master-plan-length.mjs",
    setup: () => fs.writeFileSync(path.join(ROOT, "scripts", ".mock-master-plan-length"), "\n".repeat(650)),
    cleanup: () => fs.unlinkSync(path.join(ROOT, "scripts", ".mock-master-plan-length"))
  },
  {
    name: "check-closure-evidence.mjs",
    setup: () => fs.writeFileSync(path.join(ROOT, ".mock-closure-evidence"), "| ✅ completed | closed-by:invalid@master |"),
    cleanup: () => fs.unlinkSync(path.join(ROOT, ".mock-closure-evidence"))
  },
  {
    name: "check-masterplan-consistency.mjs",
    setup: () => fs.writeFileSync(path.join(ROOT, ".mock-masterplan-consistency"), "[Mock](plan/items/NON-EXISTENT.md)"),
    cleanup: () => fs.unlinkSync(path.join(ROOT, ".mock-masterplan-consistency"))
  },
  {
    name: "check-model-routing-consistency.mjs",
    setup: () => {
      fs.writeFileSync(path.join(ROOT, ".mock-model-router"), 'id: "valid-model"');
      fs.mkdirSync(path.join(ROOT, ".mock-migrations"), { recursive: true });
      fs.writeFileSync(path.join(ROOT, ".mock-migrations", "test.sql"), "('test', '[{\"id\":\"invalid-model\"}]'::jsonb)");
    },
    cleanup: () => {
      fs.unlinkSync(path.join(ROOT, ".mock-model-router"));
      fs.unlinkSync(path.join(ROOT, ".mock-migrations", "test.sql"));
      fs.rmdirSync(path.join(ROOT, ".mock-migrations"));
    }
  },
  {
    name: "check-repo-language.mjs",
    setup: () => fs.writeFileSync(path.join(ROOT, "src/app/[locale]/admin/.mock-negative-test.tsx"), "â€"), // mojibake
    cleanup: () => fs.unlinkSync(path.join(ROOT, "src/app/[locale]/admin/.mock-negative-test.tsx"))
  },
  {
    name: "check-admin-links.mjs",
    setup: () => fs.writeFileSync(path.join(ROOT, "src/app/[locale]/admin/.mock-negative-test.tsx"), "href=\"/admin/non-existent-route-123\""),
    cleanup: () => fs.unlinkSync(path.join(ROOT, "src/app/[locale]/admin/.mock-negative-test.tsx"))
  },
  {
    name: "check-admin-metrics.mjs",
    setup: () => fs.writeFileSync(path.join(ROOT, "src/app/[locale]/admin/.mock-negative-test.tsx"), "> 92.4% <"),
    cleanup: () => fs.unlinkSync(path.join(ROOT, "src/app/[locale]/admin/.mock-negative-test.tsx"))
  },
  {
    name: "check-admin-data-binding.mjs",
    setup: () => {
      fs.mkdirSync(path.join(ROOT, "src/app/[locale]/admin/.mock-negative-test"));
      fs.writeFileSync(path.join(ROOT, "src/app/[locale]/admin/.mock-negative-test/page.tsx"), "const mockData = {}");
    },
    cleanup: () => {
      fs.unlinkSync(path.join(ROOT, "src/app/[locale]/admin/.mock-negative-test/page.tsx"));
      fs.rmdirSync(path.join(ROOT, "src/app/[locale]/admin/.mock-negative-test"));
    }
  }
];

let allPassed = true;

console.log("Running negative tests for checkers (ensuring they FAIL on bad input)...");

for (const check of checks) {
  process.stdout.write(`Testing ${check.name}... `);
  try {
    check.setup();
  } catch (err) {
    console.error(`\nSetup failed for ${check.name}:`, err);
    allPassed = false;
    continue;
  }

  let failedAsExpected = false;
  try {
    execSync(`node scripts/${check.name}`, { 
      env: { ...process.env, NEGATIVE_TEST_MODE: "1" },
      stdio: 'ignore'
    });
  } catch (error) {
    // If it throws an error (exit 1), then the negative test PASSES.
    failedAsExpected = true;
  }

  try {
    check.cleanup();
  } catch(err) {
    // ignore cleanup errors
  }

  if (failedAsExpected) {
    console.log("✅ Passed (it failed as expected)");
  } else {
    console.log("❌ Failed (script did NOT return exit code 1)");
    allPassed = false;
  }
}

if (!allPassed) {
  console.error("Some negative tests failed.");
  process.exit(1);
} else {
  console.log("All negative tests passed successfully!");
}
