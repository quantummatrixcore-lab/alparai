const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.connectOverCDP("http://localhost:9223");
  const ctx = browser.contexts()[0];
  const pages = ctx.pages();
  const loginPage = pages.find((p) => p.url().includes("login"));
  if (!loginPage) {
    console.log("No login page");
    return;
  }

  await loginPage.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  await loginPage.screenshot({ path: "D:/Alparai/ops/linkedin-assets/login-page.png" });

  const content = await loginPage.textContent("body");
  console.log("Page content (first 800 chars):", content.substring(0, 800));
})().catch((e) => console.error(e.message));
