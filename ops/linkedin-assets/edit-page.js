const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  // Try company edit/info page directly
  console.log("Navigating to company edit page...");
  await page.goto("https://www.linkedin.com/company/135125061/admin/info/", {
    waitUntil: "domcontentloaded",
    timeout: 20000,
  });
  await page.waitForTimeout(4000);

  console.log("URL:", page.url());
  const text = await page.evaluate(() => document.body.innerText.substring(0, 5000));
  console.log("Text:", text);

  // Find all inputs, textareas, file inputs
  const inputs = await page.evaluate(() => {
    const result = [];
    document.querySelectorAll("input, textarea, select").forEach((el) => {
      result.push({
        tag: el.tagName,
        type: el.type,
        name: el.name,
        id: el.id,
        placeholder: el.placeholder,
        value: (el.value || "").substring(0, 50),
        ariaLabel: el.getAttribute("aria-label"),
        class: (el.className || "").substring(0, 80),
      });
    });
    return result;
  });
  console.log("\nInputs:", JSON.stringify(inputs, null, 2));

  // Find file inputs
  const fileInputs = await page.$$('input[type="file"]');
  console.log("\nFile inputs found:", fileInputs.length);
})();
