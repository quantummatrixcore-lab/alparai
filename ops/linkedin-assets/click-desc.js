const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("URL:", page.url());

  // Click "Açıklama ekle" using JS click
  console.log("=== CLICK AÇIKLAMA EKLE ===");
  const clicked = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll("*"));
    for (const el of all) {
      if (el.children.length === 0 && el.textContent?.trim() === "Açıklama ekle") {
        // Find closest clickable parent
        let target = el;
        while (
          target &&
          target.tagName !== "A" &&
          target.tagName !== "BUTTON" &&
          !target.getAttribute("role")?.includes("button")
        ) {
          target = target.parentElement;
        }
        if (target) {
          target.click();
          return "clicked parent: " + target.tagName;
        }
        el.click();
        return "clicked span directly";
      }
    }
    return "not found";
  });
  console.log("Click result:", clicked);
  await page.waitForTimeout(4000);

  console.log("URL after click:", page.url());

  // Check what's on the page now
  const text = await page.evaluate(() => document.body.innerText.substring(0, 5000));
  console.log("Page text:", text);

  // Check for description field
  const descState = await page.evaluate(() => {
    const el = document.getElementById("organization-description-field");
    return {
      exists: !!el,
      visible: el ? el.offsetParent !== null : false,
      value: el?.value?.substring(0, 80),
    };
  });
  console.log("Description state:", JSON.stringify(descState));

  // Check all inputs
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("input, textarea"))
      .map((el) => ({
        id: el.id,
        type: el.type,
        visible: el.offsetParent !== null,
        value: (el.value || "").substring(0, 60),
      }))
      .filter((el) => el.id && !el.id.includes("recaptcha"));
  });
  console.log("Inputs:", JSON.stringify(inputs, null, 2));

  // Check for buttons
  const btns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button"))
      .map((b) => ({
        text: (b.textContent || "").trim().substring(0, 50),
        visible: b.offsetParent !== null,
      }))
      .filter((b) => b.visible && b.text);
  });
  console.log("Buttons:", JSON.stringify(btns));
})();
