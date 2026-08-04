const { chromium } = require("playwright");

(async () => {
  console.log("Connecting to Chrome CDP...");
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const contexts = browser.contexts();
  const page = contexts[0].pages()[0];

  console.log("Navigating to LinkedIn...");
  await page.goto("https://www.linkedin.com/login", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(3000);

  console.log("URL:", page.url());
  await page.screenshot({ path: "D:/Alparai/ops/linkedin-assets/state1.png" });

  // Check if on login page
  const emailField = await page.$("#username");
  if (emailField) {
    console.log("On login page. Filling email...");
    await emailField.fill("quantum.matrix.core@gmail.com");
    console.log("Email filled. NEED_PASSWORD from user.");
    await page.screenshot({ path: "D:/Alparai/ops/linkedin-assets/state-email-filled.png" });
  } else {
    console.log("Not on login page. Current URL:", page.url());
  }
})();
