const fs = require("fs");
const path = require("path");

// The Anti-Leak Protocol for Outbound Text
// This script MUST be run by AI agents before posting text to any public platform (Reddit, Twitter, etc)
// Usage: node scripts/outbound_guardian.js <path_to_text_file>

const RESTRICTED_TERMS = [
  { term: "alparai-platform", reason: 'Private repository name. Use "alparai" instead.' },
  { term: "DEHOST_SERVICE_ROLE_KEY", reason: "Service role key environment variable name." },
  { term: "127.0.0.1:9222", reason: "Local debugging port." },
  { term: "localhost:9222", reason: "Local debugging port." },
];

function checkText(text) {
  let violations = [];

  for (const restriction of RESTRICTED_TERMS) {
    // Case-insensitive check
    const regex = new RegExp(restriction.term.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "gi");
    if (regex.test(text)) {
      violations.push(`- "${restriction.term}" detected. Reason: ${restriction.reason}`);
    }
  }

  return violations;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("❌ ERROR: Outbound Guardian requires a file path argument.");
    console.error("Usage: node scripts/outbound_guardian.js <path_to_text_file>");
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), args[0]);

  try {
    const textContent = fs.readFileSync(filePath, "utf8");
    const violations = checkText(textContent);

    if (violations.length > 0) {
      console.error("🚨 OUTBOUND GUARDIAN ALERT: LEAK DETECTED 🚨");
      console.error(
        "The text you are trying to post contains restricted terms that violate the Anti-Leak Protocol.",
      );
      console.error("\nViolations found:");
      violations.forEach((v) => console.error(v));
      console.error(
        "\nAction Required: You MUST edit the text to remove these terms before proceeding.",
      );
      process.exit(1);
    } else {
      console.log("✅ Outbound Guardian: Text passed the security check. Safe to post.");
      process.exit(0);
    }
  } catch (err) {
    console.error(`❌ ERROR: Failed to read file at ${filePath}`);
    console.error(err.message);
    process.exit(1);
  }
}

main();
