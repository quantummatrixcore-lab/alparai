const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("URL:", page.url());

  // Check if we're on edit page
  const text = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log("Text:", text);
})();
