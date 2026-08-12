import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import tr from "../../messages/tr.json";

function flattenKeys(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([key, val]) =>
    flattenKeys(val, prefix ? `${prefix}.${key}` : key),
  );
}

describe("i18n key parity", () => {
  const enKeys = new Set(flattenKeys(en));
  const trKeys = new Set(flattenKeys(tr));

  it("tr.json contains every key present in en.json", () => {
    const missing = [...enKeys].filter((k) => !trKeys.has(k));
    expect(missing, `Missing in tr.json:\n${missing.join("\n")}`).toHaveLength(0);
  });

  it("en.json contains every key present in tr.json", () => {
    const missing = [...trKeys].filter((k) => !enKeys.has(k));
    expect(missing, `Missing in en.json:\n${missing.join("\n")}`).toHaveLength(0);
  });
});
