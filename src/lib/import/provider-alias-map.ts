let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try {
  vault = require("@/lib/security/vault").vault;
} catch {
  /* stub bicimi korunur */
}
import fs from "fs";
import path from "path";
import defaultAliases from "./provider-aliases.json";
import ambiguityConfig from "./provider-alias-ambiguity.json";

export interface AttributionInput {
  affectedProvider?: string | null;
  title: string;
  description: string;
  sourceUrl?: string | null;
}

export interface AttributionResult {
  matched: boolean;
  providerSlug: string | null;
  providerId: string | null;
  attributionMethod: "alias" | "model" | "human" | null;
  attributionKeyword: string | null;
  attributionConfidence: number | null;
  needsProviderReview: boolean;
}

export type AliasDictionary = Record<string, string[]>;

interface AmbiguityConfig {
  ambiguous: string[];
  context_hints: string[];
}

const AMBIGUITY: AmbiguityConfig = {
  ambiguous: (ambiguityConfig.ambiguous ?? []).map((t) => t.toLowerCase()),
  context_hints: (ambiguityConfig.context_hints ?? []).map((t) => t.toLowerCase()),
};

const AMBIGUOUS_TOKEN_SET = new Set(AMBIGUITY.ambiguous);

let inMemoryAliases: AliasDictionary | null = null;

/**
 * An alias is "ambiguous" when the token is a common English word or a name
 * shared by unrelated entities ("pi", "quora", "command", "nova", "titan").
 * Such an alias is only accepted when the same text carries an explicit
 * AI/model context hint. This prevents silent mis-attribution of the
 * actuarial data moat.
 */
export function isAmbiguousAlias(keyword: string): boolean {
  return AMBIGUOUS_TOKEN_SET.has(keyword.trim().toLowerCase());
}

/**
 * Returns true when the text contains at least one AI/model context hint.
 */
export function hasContextHint(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return AMBIGUITY.context_hints.some((hint) =>
    hint.includes(" ") ? lower.includes(hint) : new RegExp(`\\b${hint}\\b`, "i").test(lower),
  );
}

/**
 * Test-only: clears the in-memory cache so test files sharing a worker
 * process cannot leak learning-loop tokens into each other.
 */
export function resetAliasCache(): void {
  inMemoryAliases = null;
}

function getAliasesPath(): string {
  // Test isolation: vitest redirects writes to a temp copy so the
  // committed dictionary is never polluted by test runs.
  const override = vault.read("PROVIDER_ALIASES_PATH") ?? process.env.PROVIDER_ALIASES_PATH;
  if (override && override.trim().length > 0) return override;
  return path.join(process.cwd(), "src", "lib", "import", "provider-aliases.json");
}

/**
 * Loads the active alias dictionary.
 * Prefers file on disk (to support the learning loop), falls back to static import.
 */
export function getAliasMap(): AliasDictionary {
  if (inMemoryAliases) return inMemoryAliases;

  try {
    const filePath = getAliasesPath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      inMemoryAliases = JSON.parse(content) as AliasDictionary;
      return inMemoryAliases;
    }
  } catch {
    // Fall back to imported json in bundled environments
  }

  inMemoryAliases = { ...defaultAliases };
  return inMemoryAliases;
}

/**
 * Checks whether a single keyword exists inside a target text using word boundaries.
 */
function testKeywordMatch(text: string, keyword: string): boolean {
  if (!text || !keyword) return false;
  const escaped = keyword.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "i");
  return regex.test(text);
}

/**
 * Extracts the hostname domain from a URL safely.
 */
function extractHostname(urlStr?: string | null): string {
  if (!urlStr) return "";
  try {
    const url = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
    return url.hostname.toLowerCase();
  } catch {
    return urlStr.toLowerCase();
  }
}

/**
 * Deterministically resolves provider attribution using the 4-step hierarchy:
 * 1. affectedProvider field
 * 2. title
 * 3. description
 * 4. sourceUrl domain
 *
 * First confident hit wins, recording attribution_method = 'alias' + matched keyword.
 */
export function matchProviderAlias(
  input: AttributionInput,
  providerMap?: Map<string, { id: string; slug: string; name?: string }>,
): AttributionResult {
  const aliases = getAliasMap();
  const providerEntries = Object.entries(aliases);

  const scanText = (text: string): { slug: string; keyword: string } | null => {
    if (!text) return null;
    for (const [slug, keywords] of providerEntries) {
      for (const kw of keywords) {
        if (!testKeywordMatch(text, kw)) continue;
        // Ambiguity gate: a generic token ("pi", "nova", "command") is only
        // accepted when the same text carries an explicit AI/model context.
        if (isAmbiguousAlias(kw) && !hasContextHint(text)) continue;
        return { slug, keyword: kw };
      }
    }
    return null;
  };

  // 1. Priority: affectedProvider field
  if (input.affectedProvider && input.affectedProvider.trim().length > 0) {
    const match = scanText(input.affectedProvider);
    if (match) {
      const provider = providerMap?.get(match.slug);
      return {
        matched: true,
        providerSlug: match.slug,
        providerId: provider?.id ?? null,
        attributionMethod: "alias",
        attributionKeyword: match.keyword,
        attributionConfidence: 1.0,
        needsProviderReview: false,
      };
    }
  }

  // 2. Priority: title
  if (input.title && input.title.trim().length > 0) {
    const match = scanText(input.title);
    if (match) {
      const provider = providerMap?.get(match.slug);
      return {
        matched: true,
        providerSlug: match.slug,
        providerId: provider?.id ?? null,
        attributionMethod: "alias",
        attributionKeyword: match.keyword,
        attributionConfidence: 0.95,
        needsProviderReview: false,
      };
    }
  }

  // 3. Priority: description
  if (input.description && input.description.trim().length > 0) {
    const match = scanText(input.description);
    if (match) {
      const provider = providerMap?.get(match.slug);
      return {
        matched: true,
        providerSlug: match.slug,
        providerId: provider?.id ?? null,
        attributionMethod: "alias",
        attributionKeyword: match.keyword,
        attributionConfidence: 0.9,
        needsProviderReview: false,
      };
    }
  }

  // 4. Priority: sourceUrl domain
  if (input.sourceUrl) {
    const hostname = extractHostname(input.sourceUrl);
    if (hostname) {
      const match = scanText(hostname);
      if (match) {
        const provider = providerMap?.get(match.slug);
        return {
          matched: true,
          providerSlug: match.slug,
          providerId: provider?.id ?? null,
          attributionMethod: "alias",
          attributionKeyword: match.keyword,
          attributionConfidence: 0.85,
          needsProviderReview: false,
        };
      }
    }
  }

  // No confident match found
  return {
    matched: false,
    providerSlug: null,
    providerId: null,
    attributionMethod: null,
    attributionKeyword: null,
    attributionConfidence: null,
    needsProviderReview: true,
  };
}

/**
 * Appends a new decisive keyword to the committed file-backed alias map (Learning Loop).
 */
export async function appendAliasMapping(keyword: string, providerSlug: string): Promise<boolean> {
  const cleanKeyword = keyword.trim().toLowerCase();
  const cleanSlug = providerSlug.trim().toLowerCase();

  if (!cleanKeyword || !cleanSlug) return false;

  const currentAliases = getAliasMap();
  const existingList = currentAliases[cleanSlug] || [];

  if (existingList.includes(cleanKeyword)) {
    return true; // already mapped
  }

  const updatedList = [...existingList, cleanKeyword];
  currentAliases[cleanSlug] = updatedList;
  inMemoryAliases = currentAliases;

  try {
    const filePath = getAliasesPath();
    fs.writeFileSync(filePath, JSON.stringify(currentAliases, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}
