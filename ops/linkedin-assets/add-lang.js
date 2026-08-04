const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("URL:", page.url());

  // Click "Dil ekle" button
  console.log("=== CLICK DİL EKLE ===");
  await page.click("#ember104");
  await page.waitForTimeout(3000);

  // Check what appeared
  const text = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log("After click:", text);

  // Find all inputs and selects
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("input, textarea, select")).map((el) => ({
      tag: el.tagName,
      id: el.id,
      type: el.type,
      name: el.name,
      placeholder: el.placeholder,
      visible: el.offsetParent !== null,
      value: (el.value || "").substring(0, 50),
      aria: el.getAttribute("aria-label"),
    }));
  });
  console.log("\nInputs:", JSON.stringify(inputs, null, 2));

  // Check for modals/dialogs
  const modals = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[role="dialog"], .artdeco-modal')).map((m) => ({
      text: m.textContent?.substring(0, 300),
      visible: m.offsetParent !== null,
    }));
  });
  console.log("\nModals:", JSON.stringify(modals, null, 2));

  // Check buttons
  const btns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button"))
      .filter((b) => b.offsetParent !== null)
      .map((b) => ({
        text: (b.textContent || "").trim().substring(0, 50),
        aria: b.getAttribute("aria-label"),
        id: b.id,
      }));
  });
  console.log("\nButtons:", JSON.stringify(btns.filter((b) => b.text).slice(0, 20)));
})();
