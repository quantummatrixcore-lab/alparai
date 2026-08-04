const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("=== NAVIGATE TO LANGUAGES ===");
  await page.goto(
    "https://www.linkedin.com/company/135125061/admin/edit/?editPageActiveTab=manageLanguages",
    {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    },
  );
  await page.waitForTimeout(5000);

  console.log("URL:", page.url());

  // Get page text
  const text = await page.evaluate(() => document.body.innerText.substring(0, 5000));
  console.log("Page text:", text);

  // Find all interactive elements
  const elements = await page.evaluate(() => {
    const els = [];
    document
      .querySelectorAll('button, a, input, select, [role="button"], [role="combobox"]')
      .forEach((el) => {
        const text = (el.textContent || "").trim();
        const aria = el.getAttribute("aria-label");
        if ((text || aria) && el.offsetParent !== null) {
          els.push({
            tag: el.tagName,
            text: text.substring(0, 60),
            aria: aria,
            type: el.type,
            id: el.id,
            class: el.className?.toString().substring(0, 60),
          });
        }
      });
    return els;
  });
  console.log("\nInteractive elements:");
  elements.forEach((e, i) => {
    console.log(`  ${i}: <${e.tag}> text="${e.text}" aria="${e.aria}" id="${e.id}"`);
  });

  // Check for dropdowns
  const selects = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("select")).map((s) => ({
      id: s.id,
      name: s.name,
      options: Array.from(s.options)
        .map((o) => ({ value: o.value, text: o.text }))
        .slice(0, 10),
      visible: s.offsetParent !== null,
    }));
  });
  console.log("\nSelects:", JSON.stringify(selects, null, 2));
})();
