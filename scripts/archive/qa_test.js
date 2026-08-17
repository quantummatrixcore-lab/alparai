const { chromium } = require("playwright");
const fs = require("fs");

const urls = [
  "https://alparai.com/en/pricing",
  "https://alparai.com/en/about",
  "https://alparai.com/en/team",
  "https://alparai.com/en/documentation",
  "https://alparai.com/en/compliance-checklist",
  "https://alparai.com/en/auth/signin",
  "https://alparai.com/en/auth/forgot-password",
];

(async () => {
  try {
    console.log("Connecting to browser...");
    const browser = await chromium.connectOverCDP("http://localhost:9222");
    const contexts = browser.contexts();
    const context = contexts[0];

    let page = context.pages().find((p) => p.url().includes("alparai.com"));
    if (!page) {
      page = context.pages()[0];
    }

    console.log("Setting viewport size...");
    await page.setViewportSize({ width: 393, height: 852 });

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`Testing: ${url}`);
      await page.goto(url, { waitUntil: "networkidle" });

      // Allow some time for layout
      await page.waitForTimeout(2000);

      const isOverflowing = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth > window.innerWidth ||
          document.body.scrollWidth > window.innerWidth
        );
      });

      const filename = `screenshot_${i}.png`;
      await page.screenshot({ path: filename, fullPage: true });

      if (isOverflowing) {
        console.log(`[FAIL] ${url} - Overflow detected! Horizontal scrolling is active.`);
      } else {
        console.log(`[PASS] ${url} - No overflow.`);
      }
    }

    console.log("Done.");
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
})();
