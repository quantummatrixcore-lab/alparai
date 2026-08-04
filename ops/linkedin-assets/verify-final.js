const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  // Navigate to public view
  console.log("=== CHECKING PUBLIC VIEW ===");
  await page.goto("https://www.linkedin.com/company/135125061/", {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });
  await page.waitForTimeout(4000);

  console.log("URL:", page.url());
  const text = await page.evaluate(() => document.body.innerText.substring(0, 5000));
  console.log("Public page text:", text);

  // Check what's visible
  const state = await page.evaluate(() => {
    const result = {};

    // Logo
    const logo = document.querySelector(
      '.org-top-card__image img, [data-test-id="org-logo"] img, .org-company-logo img',
    );
    result.logo = logo ? { src: logo.src.substring(0, 100), alt: logo.alt } : "no logo";

    // Tagline
    const tagline = document.querySelector(
      ".org-top-card__headline, .org-top-card-secondary-content",
    );
    result.tagline = tagline?.textContent?.trim()?.substring(0, 100) || "no tagline";

    // About/Description
    const about = document.querySelector(
      '.org-about-module, .org-page-details__module, [data-test-id="about"]',
    );
    result.about = about?.textContent?.trim()?.substring(0, 200) || "no about";

    // Website
    const website = document.querySelector('a[href*="alparai.com"]');
    result.website = website?.href || "no website link";

    // Industry
    const industry = document.querySelector(".org-top-card__specialities, .org-about__industry");
    result.industry = industry?.textContent?.trim()?.substring(0, 50) || "no industry";

    return result;
  });
  console.log("\nPublic page state:", JSON.stringify(state, null, 2));

  // Also check admin view
  console.log("\n=== CHECKING ADMIN VIEW ===");
  await page.goto("https://www.linkedin.com/company/135125061/admin/dashboard/", {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });
  await page.waitForTimeout(4000);

  const dashText = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log("Dashboard:", dashText);
})();
