const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];

  console.log("URL:", page.url());
  await page.screenshot({ path: "D:/Alparai/ops/linkedin-assets/current.png" });

  const text = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log("Text:", text);
})();
