const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  const contexts = browser.contexts();
  const page = contexts[0].pages()[0];

  const url = page.url();
  console.log("URL:", url);

  await page.screenshot({ path: "D:/Alparai/ops/linkedin-assets/current-state.png" });
  console.log("Screenshot saved");

  const title = await page.title();
  console.log("Title:", title);

  // Get all text
  const text = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log("Text:", text);
})();
