const { chromium } = require("playwright");

(async () => {
  console.log("Connecting...");
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];

  console.log("Current URL:", page.url());
  await page.screenshot({ path: "D:/Alparai/ops/linkedin-assets/state2.png" });

  // Try going directly to company admin
  console.log("Going to company admin...");
  await page.goto("https://www.linkedin.com/company/135125061/admin/dashboard/", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(5000);

  const url = page.url();
  console.log("Admin URL:", url);
  await page.screenshot({ path: "D:/Alparai/ops/linkedin-assets/admin-page.png" });

  // Get page text
  const text = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log("Page text:", text);

  // List all clickable elements
  const buttons = await page.$$eval("button", (els) =>
    els.map((e) => ({
      text: e.textContent?.trim().substring(0, 50),
      aria: e.getAttribute("aria-label"),
    })),
  );
  console.log(
    "\nButtons:",
    JSON.stringify(buttons.filter((b) => b.text || b.aria).slice(0, 20), null, 2),
  );
})();
