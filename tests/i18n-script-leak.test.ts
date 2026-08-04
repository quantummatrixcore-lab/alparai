import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

const messagesDir = path.join(process.cwd(), "messages");
const cyrillicRegex = /[\u0400-\u04FF]/;

function loadLocale(locale: string): Record<string, unknown> {
  const filePath = path.join(messagesDir, `${locale}.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Record<string, unknown>;
}

function* iterateStrings(
  obj: Record<string, unknown>,
  prefix = "",
): Generator<{ key: string; value: string }> {
  for (const [key, value] of Object.entries(obj)) {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      yield { key: currentKey, value };
    } else if (typeof value === "object" && value !== null) {
      yield* iterateStrings(value as Record<string, unknown>, currentKey);
    }
  }
}

describe("i18n script leak prevention", () => {
  const nonCyrillicLocales = ["en", "tr"];

  it("should not contain Cyrillic characters in non-Russian locale files", () => {
    const leakedKeys: string[] = [];

    for (const locale of nonCyrillicLocales) {
      if (!fs.existsSync(path.join(messagesDir, `${locale}.json`))) continue;

      for (const { key, value } of iterateStrings(loadLocale(locale))) {
        if (cyrillicRegex.test(value)) {
          leakedKeys.push(`[${locale}] ${key}: "${value}"`);
        }
      }
    }

    expect(leakedKeys).toEqual([]);
  });
});
