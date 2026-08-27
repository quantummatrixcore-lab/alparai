const puppeteer = require("puppeteer-core");
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
    console.log("Connecting to browser via CDP...");
    const browser = await puppeteer.connect({ browserURL: "http://localhost:9222" });

    let pages = await browser.pages();
    let page = pages.find((p) => p.url().includes("alparai.com"));
    if (!page) {
      page = pages[0]; // fallback
    }

    console.log("Setting viewport size to 393x852 (iPhone 14 Pro)...");
    await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`\nTesting: ${url}`);
      await page.goto(url, { waitUntil: "networkidle2" });

      await new Promise((r) => setTimeout(r, 2000));

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

    console.log("\nDone.");
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
})();
