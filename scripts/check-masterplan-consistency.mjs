// Guard: every relative *.md link inside docs/MASTER_PLAN.md must resolve
// to an existing file (anchors and http(s) links are skipped).
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const planPath = resolve(here, "../docs/MASTER_PLAN.md");
const base = resolve(here, "../docs");
const text = readFileSync(planPath, "utf8");
const links = new Set([...text.matchAll(/\]\(([^)#\s][^)\s]*\.md[^)\s]*)\)/gi)].map((m) => m[1]));
let broken = 0;
for (const l of links) {
  if (!existsSync(resolve(base, l))) {
    broken++;
    console.error(`BROKEN: ${l}`);
  }
}
console.log(`links=${links.size} broken=${broken}`);
process.exit(broken > 0 ? 1 : 0);
