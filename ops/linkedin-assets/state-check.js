const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("URL:", page.url());

  // Scroll to top first
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  // Get all visible text
  const text = await page.evaluate(() => document.body.innerText.substring(0, 6000));
  console.log("Text:", text);

  // Check all input values
  const fields = await page.evaluate(() => {
    const ids = [
      "organization-logo-field",
      "organization-name-field",
      "organization-tagline-field",
      "organization-description-field",
      "organization-website-field",
      "organization-industry-typeahead",
      "organization-founded-on-input",
    ];
    return ids.map((id) => {
      const el = document.getElementById(id);
      return {
        id,
        exists: !!el,
        value: el ? (el.value || "").substring(0, 100) : null,
        visible: el ? el.offsetParent !== null : false,
      };
    });
  });
  console.log("\nField states:", JSON.stringify(fields, null, 2));

  // Check for modal/dialog
  const modals = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll('[role="dialog"], .artdeco-modal, .artdeco-modal-overlay'),
    ).map((m) => ({
      class: m.className?.substring(0, 80),
      text: m.textContent?.substring(0, 200),
    }));
  });
  console.log("\nModals:", JSON.stringify(modals, null, 2));

  // Check for buttons in modal
  const btns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button"))
      .map((b) => ({
        text: (b.textContent || "").trim().substring(0, 50),
        visible: b.offsetParent !== null,
        aria: b.getAttribute("aria-label"),
      }))
      .filter((b) => b.visible && b.text);
  });
  console.log("\nVisible buttons:", JSON.stringify(btns, null, 2));
})();
