const { chromium } = require("playwright");
const path = require("path");

const LOGO = "D:/Alparai/ops/linkedin-assets/logo.png";
const COVER = "D:/Alparai/ops/linkedin-assets/cover.png";

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];

  console.log("1. Navigating to company admin...");
  await page.goto("https://www.linkedin.com/company/135125061/admin/dashboard/", {
    waitUntil: "load",
    timeout: 30000,
  });
  await page.waitForTimeout(5000);

  console.log("URL:", page.url());
  await page.screenshot({ path: "D:/Alparai/ops/linkedin-assets/step1.png" });

  const text = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log("Page text:", text);

  // Find all interactive elements
  const elements = await page.evaluate(() => {
    const els = [];
    document.querySelectorAll('button, a, [role="button"], input, [data-test-id]').forEach((el) => {
      els.push({
        tag: el.tagName,
        text: (el.textContent || "").trim().substring(0, 60),
        aria: el.getAttribute("aria-label"),
        testId: el.getAttribute("data-test-id"),
        href: el.getAttribute("href"),
        class: el.className.toString().substring(0, 80),
      });
    });
    return els.filter((e) => e.text || e.aria || e.testId);
  });

  console.log("\nInteractive elements:");
  elements.forEach((e, i) => {
    console.log(
      `  ${i}: <${e.tag}> text="${e.text}" aria="${e.aria}" testId="${e.testId}" href="${e.href}"`,
    );
  });
})();
