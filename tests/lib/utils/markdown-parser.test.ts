import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { parseMasterPlan } from "@/lib/utils/markdown-parser";

const PLAN_PATH = path.join(process.cwd(), "docs", "MASTER_PLAN.md");
const originalRead = fs.readFileSync;

const files = new Map<string, string>();

const BACKLOG_START = "<!-- FOUNDER_BACKLOG_START -->";
const BACKLOG_END = "<!-- FOUNDER_BACKLOG_END -->";

const validTable = [
  "| #   | Priority | Item          | Description                | Status        |",
  "| --- | -------- | ------------- | -------------------------- | ------------- |",
  "| 1   | P0       | [Antigravity] Fix login bug | Fix the login flow in `src/actions/x`. | ✅ completed  |",
  "| 2   | P1       | [Founder] Sign the contract | Sign the partnership deed. | pending       |",
  "| 3   | P2       | [Antigravity] Pause feature | Feature is paused.         | ⏸ paused      |",
].join("\n");

function validDocument(): string {
  return `# Plan\n\n${BACKLOG_START}\n\n${validTable}\n\n${BACKLOG_END}\n`;
}

beforeEach(() => {
  files.clear();
  vi.spyOn(fs, "readFileSync").mockImplementation(((p: unknown, ...rest: unknown[]) => {
    if (typeof p === "string" && p.includes("MASTER_PLAN.md")) {
      const content = files.get(p);
      if (content === undefined) throw new Error("ENOENT: no such file or directory");
      return content;
    }
    return originalRead.apply(fs, [p, ...rest] as never);
  }) as typeof fs.readFileSync);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("parseMasterPlan", () => {
  it("returns a read error when the file is missing or unreadable", () => {
    const result = parseMasterPlan();
    expect(result.error).toBe("read");
    expect(result.items).toEqual([]);
  });

  it("returns a markers error when the backlog markers are absent", () => {
    files.set(PLAN_PATH, "# Plan\n\nNo backlog section here.\n");
    const result = parseMasterPlan();
    expect(result.error).toBe("markers");
    expect(result.items).toEqual([]);
  });

  it("returns an empty list without error when the backlog is genuinely empty", () => {
    files.set(PLAN_PATH, `# Plan\n\n${BACKLOG_START}\n\n${BACKLOG_END}\n`);
    const result = parseMasterPlan();
    expect(result.error).toBeNull();
    expect(result.items).toEqual([]);
  });

  it("parses rows, extracting title, description, owner, priority and status", () => {
    files.set(PLAN_PATH, validDocument());
    const result = parseMasterPlan();

    expect(result.error).toBeNull();
    expect(result.items).toHaveLength(3);

    const [item1, item2, item3] = result.items;

    expect(item1!.id).toBe("1");
    expect(item1!.priority).toBe("P0");
    expect(item1!.owner).toBe("Antigravity");
    expect(item1!.status).toBe("completed");
    expect(item1!.description).toContain("Fix the login flow");

    expect(item2!.status).toBe("pending");
    expect(item2!.owner).toBe("Founder");

    expect(item3!.status).toBe("paused");
  });

  it("strips markdown noise from descriptions", () => {
    files.set(PLAN_PATH, validDocument());
    const result = parseMasterPlan();
    expect(result.items[0]!.description).toBe("Fix the login flow in src/actions/x.");
  });

  it("parses Depends: #XX notation into depends number array", () => {
    const tableWithDeps = [
      "| #   | Priority | Item          | Description                | Status        |",
      "| --- | -------- | ------------- | -------------------------- | ------------- |",
      "| 10  | P0       | [Antigravity] Task A | Base task | ✅ completed  |",
      "| 11  | P1       | [Antigravity] Task B | Depends: #10 | pending       |",
      "| 12  | P1       | [Antigravity] Task C | Depends: #10, #11 | pending       |",
    ].join("\n");
    files.set(PLAN_PATH, `# Plan\n\n${BACKLOG_START}\n\n${tableWithDeps}\n\n${BACKLOG_END}\n`);
    const result = parseMasterPlan();

    expect(result.error).toBeNull();
    expect(result.items).toHaveLength(3);
    expect(result.items[1]!.depends).toEqual([10]);
    expect(result.items[2]!.depends).toEqual([10, 11]);
  });
});
