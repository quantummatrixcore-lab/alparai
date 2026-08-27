const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  try {
    const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
    const contexts = browser.contexts();
    let targetPage = null;

    for (const context of contexts) {
      const pages = context.pages();
      for (const p of pages) {
        if (p.url().includes("turkiye.gov.tr") || p.url().includes("kvkk.gov.tr")) {
          targetPage = p;
          break;
        }
      }
      if (targetPage) break;
    }

    if (!targetPage) {
      // Fallback: pick the first page that isn't empty or internal
      const allPages = contexts[0].pages();
      targetPage = allPages[allPages.length - 1]; // pick last active
    }

    console.log("Current URL: " + targetPage.url());
    await targetPage.goto("https://sikayet.kvkk.gov.tr/");
    await targetPage.waitForLoadState("networkidle");
    await targetPage.waitForTimeout(2000);

    await targetPage.screenshot({ path: "kvkk_step1.png" });
    console.log("Current URL after goto: " + targetPage.url());

    // disconnect
    browser.disconnect();
  } catch (e) {
    console.error(e);
  }
})();
