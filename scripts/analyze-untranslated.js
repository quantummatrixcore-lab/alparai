import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enPath = path.join(__dirname, "../messages/en.json");
const trPath = path.join(__dirname, "../messages/tr.json");

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const tr = JSON.parse(fs.readFileSync(trPath, "utf8"));

function getLeaves(obj, prefix = "") {
  const leaves = {};
  for (const k in obj) {
    const full = prefix ? `${prefix}.${k}` : k;
    const val = obj[k];
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      Object.assign(leaves, getLeaves(val, full));
    } else {
      leaves[full] = val;
    }
  }
  return leaves;
}

const enLeaves = getLeaves(en);
const trLeaves = getLeaves(tr);

const identical = [];
for (const [key, val] of Object.entries(enLeaves)) {
  if (trLeaves[key] === val && typeof val === "string") {
    // Ignore pure technical terms / numbers / urls
    if (/^(https?:\/\/|\$|\d|[A-Z0-9_-]+$)/.test(val.trim())) continue;
    if (["ALPAR AI", "Alparai", "OpenAI", "Anthropic", "Google", "DeHost", "PostgreSQL", "GitHub", "Stripe", "Next.js"].includes(val.trim())) continue;
    identical.push({ key, val });
  }
}

fs.writeFileSync(
  path.join(__dirname, "untranslated-candidates.json"),
  JSON.stringify(identical, null, 2),
  "utf8"
);

console.log(`Identical non-trivial count: ${identical.length}`);
