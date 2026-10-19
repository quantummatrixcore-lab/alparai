import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..", "..");
const PRICING_PAGE = path.join(ROOT, "src", "app", "[locale]", "pricing", "page.tsx");
const PRICING_SECTION = path.join(ROOT, "src", "components", "marketing", "pricing-section.tsx");
const LEMON_BUTTON = path.join(ROOT, "src", "components", "pricing", "lemon-checkout-button.tsx");

function read(file: string): string {
  return fs.readFileSync(file, "utf8");
}

describe("Pricing & checkout integrity", () => {
  it("no source file ships a placeholder LemonSqueezy product id", () => {
    const files = [
      PRICING_PAGE,
      PRICING_SECTION,
      LEMON_BUTTON,
      path.join(ROOT, "src", "app", "[locale]", "pricing", "enterprise", "page.tsx"),
    ];

    for (const file of files) {
      const content = read(file);
      // A placeholder id only survives inside an explanatory comment.
      const withoutComments = content
        .split("\n")
        .filter((line) => !line.trim().startsWith("*") && !line.trim().startsWith("//"))
        .join("\n");
      expect(
        withoutComments,
        `${path.basename(file)} must not contain a placeholder product id`,
      ).not.toMatch(/['"](starter-id|pro-id|ent-id)['"]/);
      expect(
        withoutComments,
        `${path.basename(file)} must not contain a raw lemonsqueezy buy link`,
      ).not.toMatch(/lemonsqueezy\.com\/checkout\/buy\//);
    }
  });

  it("the purchasable plan is wired to the real checkout API", () => {
    const section = read(PRICING_SECTION);
    expect(section).toContain("LemonCheckoutButton");
    expect(section).toContain('tier="developer"');

    const button = read(LEMON_BUTTON);
    expect(button).toContain("/api/checkout/lemonsqueezy");
    expect(button).toContain('method: "POST"');
  });

  it("the pricing page is localized and advertises no fabricated prices", () => {
    const page = read(PRICING_PAGE);
    expect(page).toContain("getTranslations");
    expect(page).toContain('namespace: "pricing"');
    expect(page).toContain("setRequestLocale");

    // The old implementation published $49 / $199 / $999 offers.
    expect(page).not.toContain('"49.00"');
    expect(page).not.toContain('"199.00"');
    expect(page).not.toContain('"999.00"');
  });

  it("every key used by the pricing section exists in both locales", () => {
    const section = read(PRICING_SECTION);
    const usedKeys = Array.from(section.matchAll(/t\("([a-z0-9_]+)"\)/g)).map((m) => m[1]);
    expect(usedKeys.length).toBeGreaterThan(0);

    const en = JSON.parse(read(path.join(ROOT, "messages", "en.json"))) as Record<
      string,
      Record<string, string>
    >;
    const tr = JSON.parse(read(path.join(ROOT, "messages", "tr.json"))) as Record<
      string,
      Record<string, string>
    >;

    for (const key of usedKeys) {
      expect(en.pricing?.[key], `messages/en.json is missing pricing.${key}`).toBeDefined();
      expect(tr.pricing?.[key], `messages/tr.json is missing pricing.${key}`).toBeDefined();
    }
  });
});
