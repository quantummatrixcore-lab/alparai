#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const BASELINE_PATH = join(ROOT, ".i18n-key-coverage-baseline");
const MESSAGES_PATH = join(ROOT, "messages", "en.json");

function loadMessages() {
  try {
    const raw = readFileSync(MESSAGES_PATH, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${MESSAGES_PATH}: ${e.message}`);
    process.exit(1);
  }
}

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) return new Set();
  return new Set(
    readFileSync(BASELINE_PATH, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#")),
  );
}

function getTrackedFiles() {
  try {
    return execSync("git ls-files -z", { encoding: "utf8", cwd: ROOT, maxBuffer: 64 * 1024 * 1024 })
      .split("\0")
      .filter((f) => (f.endsWith(".ts") || f.endsWith(".tsx")) && f.startsWith("src/"));
  } catch {
    return [];
  }
}

function extractNamespaceVariableMappings(content) {
  const mappings = new Map();

  const useTranslationsPattern = /const\s+(\w+)\s*=\s*useTranslations\s*\(\s*["']([^"']+)["']\s*\)/g;
  let match;
  while ((match = useTranslationsPattern.exec(content)) !== null) {
    const [, varName, namespace] = match;
    mappings.set(varName, namespace);
  }

  const getTranslationsPattern =
    /(?:const|let|var)\s+(\w+)\s*=\s*(?:await\s+)?getTranslations\s*\(\s*\{[^}]*namespace\s*:\s*["']([^"']+)["'][^}]*\}\s*\)/g;
  while ((match = getTranslationsPattern.exec(content)) !== null) {
    const [, varName, namespace] = match;
    mappings.set(varName, namespace);
  }

  return mappings;
}

function isValidTranslationKey(key) {
  return /^[a-zA-Z0-9_][a-zA-Z0-9_.]*(\.?[a-zA-Z0-9_]+)*$/.test(key);
}

function extractKeyUsages(content, filePath, mappings) {
  const usages = [];
  const lines = content.split("\n");

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];

    for (const [varName, namespace] of mappings) {
      const keyPattern = new RegExp(varName + String.raw`\s*\(\s*["']([^"']+)["']`, "g");
      let match;
      keyPattern.lastIndex = 0;
      while ((match = keyPattern.exec(line)) !== null) {
        const [, key] = match;
        if (isValidTranslationKey(key)) {
          usages.push({
            namespace,
            key,
            fullKey: `${namespace}.${key}`,
            file: filePath,
            line: lineIdx + 1,
          });
        }
      }
    }
  }

  return usages;
}

function keyExists(messages, namespace, key) {
  const ns = messages[namespace];
  if (!ns || typeof ns !== "object") return false;

  const parts = key.split(".");
  let current = ns;
  for (const part of parts) {
    if (typeof current !== "object" || current === null) return false;
    current = current[part];
  }
  return current !== undefined;
}

function main() {
  const messages = loadMessages();
  const baseline = loadBaseline();

  const trackedFiles = getTrackedFiles();
  const allUsages = [];
  let filesScanned = 0;

  for (const filePath of trackedFiles) {
    const fullPath = join(ROOT, filePath);
    let content;
    try {
      content = readFileSync(fullPath, "utf8");
    } catch {
      continue;
    }

    const mappings = extractNamespaceVariableMappings(content);
    if (mappings.size === 0) continue;

    filesScanned++;
    const usages = extractKeyUsages(content, filePath, mappings);
    allUsages.push(...usages);
  }

  if (process.argv.includes("--write-baseline")) {
    const header = [
      "# i18n key coverage baseline — ensures all keys used in client code exist in messages/en.json.",
      "# Each entry is a full dotted key path (namespace.key) that is missing from translations.",
      "# This list is a RATCHET: entries may only be removed once the key is added to all locale files,",
      "# never added. A newly missing key fails CI.",
      "",
    ].join("\n");

    const missing = allUsages
      .filter((u) => !keyExists(messages, u.namespace, u.key))
      .map((u) => u.fullKey);

    const unique = [...new Set(missing)].sort();
    let output = header + unique.join("\n");
    if (unique.length > 0) {
      output += "\n";
    }
    process.stdout.write(output);
    process.exit(0);
  }

  const missingUsages = allUsages.filter((u) => !keyExists(messages, u.namespace, u.key));
  const unlisted = missingUsages.filter((u) => !baseline.has(u.fullKey));

  if (unlisted.length > 0) {
    console.error(
      "i18n key coverage check FAILED — the following keys are used in code but missing from messages/en.json:",
    );
    console.error("");
    for (const { file, line, fullKey } of unlisted) {
      console.error(`  ${file}:${line}: ${fullKey}`);
    }
    console.error("");
    console.error("Add the key to messages/en.json for ALL locales, or add it to .i18n-key-coverage-baseline.");
    console.error("Do NOT add keys to the baseline — that list only shrinks as keys are added.");
    process.exit(1);
  }

  const missingKeys = new Set(missingUsages.map((u) => u.fullKey));
  const stale = [...baseline].filter((key) => !missingKeys.has(key));

  const totalKeysChecked = new Set(allUsages.map((u) => u.fullKey)).size;
  console.log(
    `i18n key coverage check passed. ${filesScanned} file(s) scanned, ${totalKeysChecked} unique key(s) checked, ` +
      `${missingKeys.size} key(s) still grandfathered.`,
  );

  if (stale.length > 0) {
    console.log("");
    console.log(`${stale.length} baseline entry/entries are now fixed and can be removed:`);
    for (const key of stale) console.log(`  ${key}`);
  }
}

main();
