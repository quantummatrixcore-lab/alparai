const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  const contexts = browser.contexts();
  const page = contexts[0].pages()[0];

  console.log("Current URL:", page.url());

  // Navigate to LinkedIn
  await page.goto("https://www.linkedin.com/login", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(3000);

  console.log("URL after nav:", page.url());
  await page.screenshot({ path: "D:/Alparai/ops/linkedin-assets/login-page.png" });
  console.log("Screenshot saved");

  // Check if already logged in
  if (!page.url().includes("/login")) {
    console.log("ALREADY LOGGED IN!");
    return;
  }

  // Get page text
  const text = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log("Page text:", text);

  // Look for email field
  const emailField = await page.$("#username");
  if (emailField) {
    console.log("Found email field, filling...");
    await emailField.fill("quantum.matrix.core@gmail.com");
    await page.waitForTimeout(500);

    // Look for password field
    const passField = await page.$("#password");
    if (passField) {
      console.log("Found password field");
      // Don't fill password - need user to provide it
      console.log("NEED_PASSWORD");
    }
  }
})();
