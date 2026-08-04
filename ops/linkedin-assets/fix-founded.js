const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  // Navigate to details tab where founded year is
  console.log("=== NAVIGATE TO DETAILS ===");
  await page.goto(
    "https://www.linkedin.com/company/135125061/admin/edit/?anchor=organization-founded-on-input&editPageActiveTab=details",
    {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    },
  );
  await page.waitForTimeout(4000);

  // Fix founded year
  console.log("=== FIX FOUNDED YEAR ===");
  const foundedField = await page.$("#organization-founded-on-input");
  if (foundedField) {
    const vis = await foundedField.evaluate((el) => el.offsetParent !== null);
    console.log("Founded visible:", vis, "current:", await foundedField.inputValue());

    await foundedField.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await foundedField.click({ clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.keyboard.type("2026", { delay: 50 });
    console.log("Founded now:", await foundedField.inputValue());
  }

  // Save
  console.log("\n=== SAVING ===");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const saveBtn = btns.find((b) => b.textContent?.trim() === "Kaydet" && b.offsetParent !== null);
    if (saveBtn) saveBtn.click();
  });
  await page.waitForTimeout(5000);

  // Handle confirmation dialog
  await page.evaluate(() => {
    const modals = document.querySelectorAll('[role="dialog"]');
    for (const m of modals) {
      const btns = Array.from(m.querySelectorAll("button"));
      const confirm = btns.find(
        (b) =>
          b.textContent?.includes("Evet") ||
          b.textContent?.includes("Emin") ||
          b.textContent?.includes("Confirm"),
      );
      if (confirm) confirm.click();
    }
  });
  await page.waitForTimeout(3000);

  console.log("URL:", page.url());
  console.log("DONE — Founded year updated to 2026");
})();
