const { chromium } = require("playwright");
const fs = require("fs");

const LOGO = "D:/Alparai/ops/linkedin-assets/logo.png";
const COVER = "D:/Alparai/ops/linkedin-assets/cover.png";

async function dump(page) {
  const text = await page.evaluate(() => document.body.innerText.substring(0, 5000));
  console.log("--- PAGE TEXT ---");
  console.log(text);
  console.log("--- END ---");

  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("input, textarea")).map((el) => ({
      tag: el.tagName,
      type: el.type,
      id: el.id,
      name: el.name,
      placeholder: el.placeholder,
      aria: el.getAttribute("aria-label"),
    }));
  });
  console.log("Inputs:", JSON.stringify(inputs, null, 2));

  const fileInputs = await page.$$('input[type="file"]');
  console.log("File inputs:", fileInputs.length);
}

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("URL:", page.url());

  // Click "Logo ekle" directly
  console.log('\n=== Clicking "Logo ekle" ===');
  const logoLink = await page.$("text=Logo ekle");
  if (logoLink) {
    await logoLink.click();
    await page.waitForTimeout(3000);
    console.log("Clicked Logo ekle!");
    await dump(page);
  } else {
    console.log("Logo ekle not found. Trying aria/alt approach...");

    // Try clicking the edit pencil icon near the company name area
    const editIcons = await page.$$(
      '[aria-label*="logo" i], [aria-label*="Logo" i], [aria-label*="düzenle" i], [aria-label*="edit" i]',
    );
    console.log("Edit icons found:", editIcons.length);
    for (const icon of editIcons) {
      const label = await icon.getAttribute("aria-label");
      console.log(`  Icon: ${label}`);
    }

    // Try "Sayfayı Düzenleyin"
    console.log('\n=== Clicking "Sayfayı Düzenleyin" ===');
    const editPageBtn = await page.$("text=Sayfayı Düzenleyin");
    if (editPageBtn) {
      await editPageBtn.click();
      await page.waitForTimeout(3000);
      console.log("Clicked Sayfayı Düzenleyin!");

      // Check if a modal opened
      const modals = await page.$$('.artdeco-modal, [role="dialog"], .modal');
      console.log("Modals found:", modals.length);

      await dump(page);
    }
  }
})();
