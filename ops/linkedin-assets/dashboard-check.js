const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  // Navigate to dashboard
  console.log("=== NAVIGATE TO DASHBOARD ===");
  await page.goto("https://www.linkedin.com/company/135125061/admin/dashboard/", {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });
  await page.waitForTimeout(4000);
  console.log("URL:", page.url());

  // Take screenshot
  try {
    await page.screenshot({
      path: "D:/Alparai/ops/linkedin-assets/dashboard-now.png",
      timeout: 8000,
    });
    console.log("Screenshot saved");
  } catch (e) {
    console.log("Screenshot failed:", e.message);
  }

  // Check dashboard text
  const text = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log("Dashboard text:", text);

  // Check if logo is now showing
  const logoState = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img"));
    const logoImgs = imgs.filter((i) => i.src && !i.src.includes("data:") && i.naturalWidth > 50);
    return logoImgs.map((i) => ({ src: i.src.substring(0, 100), alt: i.alt, w: i.naturalWidth }));
  });
  console.log("Logo images:", JSON.stringify(logoState));

  // Check if there are "Logo ekle" or "Açıklama ekle" buttons
  const actions = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll("a, button, span"));
    return all
      .filter((el) => {
        const text = el.textContent?.trim() || "";
        return (
          (text.includes("Logo") || text.includes("Açıklama") || text.includes("ekle")) &&
          el.offsetParent !== null
        );
      })
      .map((el) => ({
        tag: el.tagName,
        text: el.textContent?.trim().substring(0, 50),
        class: el.className?.toString().substring(0, 60),
      }));
  });
  console.log("Action links:", JSON.stringify(actions));
})();
