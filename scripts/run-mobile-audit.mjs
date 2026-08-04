import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const VIEWPORTS = [
  { name: "iPhone_SE", width: 375, height: 667 },
  { name: "iPhone_14", width: 390, height: 844 },
  { name: "Pixel_7", width: 412, height: 915 }
];

const PAGES = [
  { name: "home", path: "/en" },
  { name: "incidents", path: "/en/incidents" },
  { name: "incident_detail", path: "/en/incidents/seed-001" },
  { name: "submit", path: "/en/submit" },
  { name: "ai-act", path: "/en/ai-act" },
  { name: "transparency", path: "/en/transparency" },
  { name: "leaderboard", path: "/en/leaderboard" },
  { name: "academy", path: "/en/academy" },
  { name: "blog", path: "/en/blog" },
  { name: "unsubscribe", path: "/en/unsubscribe" }
];

const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = path.resolve(process.cwd(), "docs/mobile-audit");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runAudit() {
  console.log("Starting Mobile Quality Audit...");
  const browser = await chromium.launch();

  const auditResults = [];

  for (const vp of VIEWPORTS) {
    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})`);

    for (const pageInfo of PAGES) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
      });

      const page = await context.newPage();

      // Pre-inject cookie consent to avoid banner cluttering the viewports
      await page.addInitScript(() => {
        window.localStorage.setItem(
          "alpar_cookie_consent",
          JSON.stringify({ level: "all", at: Date.now() })
        );
      });

      const url = `${BASE_URL}${pageInfo.path}`;
      try {
        await page.goto(url, { waitUntil: "networkidle" });
      } catch (err) {
        console.error(`Failed to navigate to ${url}:`, err.message);
        await context.close();
        continue;
      }

      // Check horizontal overflow
      const overflowData = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const bodyWidth = document.body.clientWidth;

        const maxScrollWidth = Math.max(scrollWidth, bodyScrollWidth);
        const maxInnerWidth = Math.max(innerWidth, bodyWidth);

        const hasOverflow = maxScrollWidth > maxInnerWidth + 1; // 1px tolerance
        return {
          scrollWidth: maxScrollWidth,
          innerWidth: maxInnerWidth,
          hasOverflow
        };
      });

      // Find overflowing elements if any
      let overflowingElements = [];
      if (overflowData.hasOverflow) {
        overflowingElements = await page.evaluate(() => {
          const els = Array.from(document.querySelectorAll("*"));
          return els
            .map(el => {
              const rect = el.getBoundingClientRect();
              return {
                tagName: el.tagName,
                id: el.id,
                className: el.className,
                right: rect.right,
                width: rect.width,
                windowWidth: window.innerWidth
              };
            })
            .filter(info => info.right > info.windowWidth + 1 && info.width > 0)
            .slice(0, 3);
        });
      }

      // Check touch target sizes
      const touchTargetViolations = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll("a, button, select, input"));
        const violations = els
          .map(el => {
            const rect = el.getBoundingClientRect();
            return {
              tagName: el.tagName,
              id: el.id,
              text: el.innerText || el.placeholder || el.value || "",
              width: rect.width,
              height: rect.height
            };
          })
          .filter(v => v.width > 0 && v.height > 0 && (v.width < 44 || v.height < 44));
        return violations;
      });

      const screenshotFilename = `${pageInfo.name}-${vp.name}.png`;
      const screenshotPath = path.join(OUTPUT_DIR, screenshotFilename);
      await page.screenshot({ path: screenshotPath });

      // Determine severity & issues
      const issues = [];
      if (overflowData.hasOverflow) {
        const elDetails = overflowingElements.map(e => `${e.tagName.toLowerCase()}${e.id ? `#${e.id}` : ""}${e.className ? `.${e.className.split(" ")[0]}` : ""}`).join(", ");
        issues.push(`Horizontal Overflow (scrollWidth: ${overflowData.scrollWidth}px vs viewport: ${overflowData.innerWidth}px) [Elements: ${elDetails}]`);
      }
      if (touchTargetViolations.length > 0) {
        issues.push(`Small Touch Targets (${touchTargetViolations.length} elements < 44px)`);
      }

      const hasIssue = issues.length > 0;
      auditResults.push({
        page: pageInfo.name,
        viewport: `${vp.width}x${vp.height} (${vp.name})`,
        issue: hasIssue ? issues.join(" | ") : "None",
        severity: hasIssue ? (overflowData.hasOverflow ? "High" : "Low") : "Clean",
        screenshot: `./mobile-audit/${screenshotFilename}`
      });

      console.log(`Page: ${pageInfo.name} - ${vp.name}: ${hasIssue ? "ISSUES FOUND" : "CLEAN"}`);
      if (hasIssue) {
        console.log(`  - Issues: ${issues.join("\n  - ")}`);
      }

      await context.close();
    }
  }

  await browser.close();

  // Generate docs/MOBILE_AUDIT.md markdown content
  let markdown = `# Mobile Quality Audit Report\n\n`;
  markdown += `*Generated on: ${new Date().toISOString()}*\n\n`;
  markdown += `| Page | Viewport | Issue(s) | Severity | Screenshot |\n`;
  markdown += `|------|----------|----------|----------|------------|\n`;

  for (const r of auditResults) {
    markdown += `| ${r.page} | ${r.viewport} | ${r.issue} | ${r.severity} | ![${r.page} ${r.viewport}](${r.screenshot}) |\n`;
  }

  fs.writeFileSync(path.resolve(process.cwd(), "docs/MOBILE_AUDIT.md"), markdown);
  console.log(`\nMobile audit complete! Rapor written to docs/MOBILE_AUDIT.md`);
}

runAudit().catch(err => {
  console.error("Audit failed:", err);
  process.exit(1);
});
