const { chromium } = require("playwright");
const path = require("path");

const LOGO = "D:/Alparai/ops/linkedin-assets/logo.png";
const COVER = "D:/Alparai/ops/linkedin-assets/cover.png";

async function screenshot(page, name) {
  try {
    await page.screenshot({ path: `D:/Alparai/ops/linkedin-assets/${name}.png`, timeout: 10000 });
    console.log(`Screenshot: ${name}.png`);
  } catch (e) {
    console.log(`Screenshot ${name} failed: ${e.message}`);
  }
}

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];

  console.log("URL:", page.url());

  // STEP 1: Click "Sayfayı Düzenleyin" (Edit Page)
  console.log("\n=== STEP 1: Click Edit Page ===");
  const editBtn = await page.$("text=Sayfayı Düzenleyin");
  if (editBtn) {
    console.log('Found "Sayfayı Düzenleyin" button, clicking...');
    await editBtn.click();
    await page.waitForTimeout(3000);
    console.log("URL after click:", page.url());
    await screenshot(page, "step1-edit-page");

    const text = await page.evaluate(() => document.body.innerText.substring(0, 4000));
    console.log("Page text:", text);
  } else {
    console.log("Button not found, trying alternative...");
    // Try to find edit link
    const links = await page.$$eval("a", (els) =>
      els.map((e) => ({ text: (e.textContent || "").trim().substring(0, 50), href: e.href })),
    );
    const editLinks = links.filter(
      (l) => l.text.toLowerCase().includes("düzenle") || l.text.toLowerCase().includes("edit"),
    );
    console.log("Edit links found:", JSON.stringify(editLinks));
  }
})();
