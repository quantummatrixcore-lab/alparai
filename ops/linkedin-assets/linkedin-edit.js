const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const LOGO_PATH = "D:/Alparai/ops/linkedin-assets/logo.png";
const COVER_PATH = "D:/Alparai/ops/linkedin-assets/cover.png";

(async () => {
  console.log("Connecting to Chrome CDP on port 9222...");
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  const contexts = browser.contexts();
  console.log(`Found ${contexts.length} browser contexts`);

  let page;
  if (contexts.length > 0) {
    const pages = contexts[0].pages();
    console.log(`Found ${pages.length} pages`);
    page = pages[0] || (await contexts[0].newPage());
  } else {
    const context = await browser.newContext();
    page = await context.newPage();
  }

  // Navigate to LinkedIn login first to check auth status
  console.log("Navigating to LinkedIn...");
  await page
    .goto("https://www.linkedin.com/feed/", { waitUntil: "networkidle", timeout: 30000 })
    .catch(() => {});
  await page.waitForTimeout(3000);

  const url = page.url();
  console.log("Current URL:", url);

  // Check if logged in
  if (url.includes("/login") || url.includes("/checkpoint")) {
    console.log("NOT LOGGED IN - Need manual login");
    console.log("Please log in to LinkedIn manually in the Chrome window.");
    console.log("After logging in, press Enter in this terminal to continue...");
    process.stdin.resume();
    await new Promise((resolve) => process.stdin.once("data", resolve));
  }

  console.log("Logged in! Navigating to company admin...");
  await page
    .goto("https://www.linkedin.com/company/135125061/admin/dashboard/", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    .catch(() => {});
  await page.waitForTimeout(3000);

  const adminUrl = page.url();
  console.log("Admin URL:", adminUrl);

  // Take screenshot of current state
  await page.screenshot({ path: "D:/Alparai/ops/linkedin-assets/admin-state.png" });
  console.log("Screenshot saved: admin-state.png");

  // Get page content to understand the layout
  const pageTitle = await page.title();
  console.log("Page title:", pageTitle);

  // Try to find and click logo edit area
  console.log("Looking for logo upload area...");

  // Look for the logo element (usually a circular element with company logo)
  const logoSelectors = [
    '[data-test-id="company-logo"]',
    ".org-top-card__image",
    ".org-company-logo",
    'img[alt*="logo"]',
    'button[aria-label*="logo"]',
    'button[aria-label*="Logo"]',
    ".org-top-card-primary-cover-image__logo",
    ".artdeco-entity-image",
  ];

  let logoFound = false;
  for (const sel of logoSelectors) {
    const el = await page.$(sel);
    if (el) {
      console.log(`Found logo element: ${sel}`);
      logoFound = true;

      // Click to edit logo
      await el.click();
      await page.waitForTimeout(2000);

      // Look for upload button
      const uploadSelectors = [
        'input[type="file"]',
        'button:has-text("Upload")',
        'button:has-text("upload")',
        '.artdeco-button:has-text("Upload")',
      ];

      for (const uploadSel of uploadSelectors) {
        const uploadEl = await page.$(uploadSel);
        if (uploadEl) {
          console.log(`Found upload element: ${uploadSel}`);

          if (uploadSel === 'input[type="file"]') {
            await uploadEl.setInputFiles(LOGO_PATH);
            console.log("Logo file set!");
          } else {
            await uploadEl.click();
            await page.waitForTimeout(1000);
            const fileInput = await page.$('input[type="file"]');
            if (fileInput) {
              await fileInput.setInputFiles(LOGO_PATH);
              console.log("Logo file set via dialog!");
            }
          }
          await page.waitForTimeout(3000);
          break;
        }
      }
      break;
    }
  }

  if (!logoFound) {
    console.log(
      "Logo element not found with standard selectors. Taking screenshot for analysis...",
    );
    await page.screenshot({
      path: "D:/Alparai/ops/linkedin-assets/page-analysis.png",
      fullPage: true,
    });

    // Try clicking the area where logo usually is (top-left circular element)
    console.log("Trying to find logo by text/aria...");
    const allButtons = await page.$$("button");
    for (const btn of allButtons) {
      const text = await btn.textContent().catch(() => "");
      const aria = await btn.getAttribute("aria-label").catch(() => "");
      if (
        (text + aria).toLowerCase().includes("logo") ||
        (text + aria).toLowerCase().includes("photo") ||
        (text + aria).toLowerCase().includes("image")
      ) {
        console.log(`Found button: text="${text}", aria="${aria}"`);
        await btn.click();
        await page.waitForTimeout(2000);
        break;
      }
    }
  }

  // Now look for cover photo / banner area
  console.log("\nLooking for cover photo area...");
  const coverSelectors = [
    '[data-test-id="cover-image"]',
    ".org-top-card__cover-image",
    ".org-top-card-primary-cover-image",
    'button[aria-label*="cover"]',
    'button[aria-label*="banner"]',
    ".cover-image",
  ];

  for (const sel of coverSelectors) {
    const el = await page.$(sel);
    if (el) {
      console.log(`Found cover element: ${sel}`);
      await el.click();
      await page.waitForTimeout(2000);

      // Look for upload
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles(COVER_PATH);
        console.log("Cover file set!");
        await page.waitForTimeout(3000);
      }
      break;
    }
  }

  // Fill About section
  console.log("\nLooking for About section edit...");
  const aboutSelectors = [
    'button:has-text("Edit")',
    'button:has-text("About")',
    'a:has-text("About")',
    '.artdeco-dropdown__trigger:has-text("Edit")',
  ];

  for (const sel of aboutSelectors) {
    const el = await page.$(sel);
    if (el) {
      console.log(`Found about element: ${sel}`);
      await el.click();
      await page.waitForTimeout(2000);
      break;
    }
  }

  // Take final screenshot
  await page.screenshot({ path: "D:/Alparai/ops/linkedin-assets/final-state.png" });
  console.log("\nFinal screenshot saved: final-state.png");

  // Get all visible text for analysis
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log("\n--- Page text (first 3000 chars) ---");
  console.log(bodyText);

  // Don't disconnect - leave browser open
  console.log("\nDone! Browser left open.");
})();
