const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("URL:", page.url());

  // 1. Click "Açıklama ekle" to reveal description field
  console.log("=== 1. EXPAND DESCRIPTION ===");
  const addDescBtn = await page.$("text=Açıklama ekle");
  if (addDescBtn) {
    await addDescBtn.click();
    await page.waitForTimeout(2000);
    console.log('Clicked "Açıklama ekle"');
  } else {
    console.log('No "Açıklama ekle" found on edit page - trying sidebar');
    // Go back to dashboard and click it from there
    await page.goto("https://www.linkedin.com/company/135125061/admin/dashboard/", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(3000);

    const addDescDashboard = await page.$("text=Açıklama ekle");
    if (addDescDashboard) {
      await addDescDashboard.click();
      await page.waitForTimeout(3000);
      console.log('Clicked "Açıklama ekle" from dashboard');
    }
  }

  console.log("URL:", page.url());

  // Check for description field now
  const descState = await page.evaluate(() => {
    const el = document.getElementById("organization-description-field");
    return {
      exists: !!el,
      visible: el ? el.offsetParent !== null : false,
      rect: el ? el.getBoundingClientRect() : null,
    };
  });
  console.log("Description state:", JSON.stringify(descState));

  // 2. Fill description if visible
  if (descState.visible) {
    console.log("=== 2. FILLING DESCRIPTION ===");
    const descField = await page.$("#organization-description-field");
    await descField.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await descField.click({ clickCount: 3 });
    await page.keyboard.press("Backspace");
    await descField.type(
      "ALPAR AI is an independent public AI incident registry and evaluator. We track, rate, and verify AI incidents with public cryptographic proof — the Moody's for artificial intelligence. EU AI Act Article 73-ready platform.",
      { delay: 3 },
    );
    console.log("Description filled");
  } else {
    console.log("Description still not visible, filling via JS + native setter");
    await page.evaluate(() => {
      const el = document.getElementById("organization-description-field");
      if (el) {
        // React-compatible value setting
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value",
        ).set;
        nativeSetter.call(
          el,
          "ALPAR AI is an independent public AI incident registry and evaluator. We track, rate, and verify AI incidents with public cryptographic proof — the Moody's for artificial intelligence. EU AI Act Article 73-ready platform.",
        );
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.dispatchEvent(new Event("blur", { bubbles: true }));
      }
    });
    console.log("Description set via JS");
  }

  // 3. Fill founded year
  console.log("\n=== 3. FILLING FOUNDED YEAR ===");
  const foundedField = await page.$("#organization-founded-on-input");
  if (foundedField) {
    await foundedField.evaluate((el) => {
      el.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(300);
    await foundedField.click();
    await foundedField.fill("");
    await foundedField.type("2024", { delay: 50 });
    console.log("Founded year: 2024");
  }

  // 4. Final verification
  console.log("\n=== 4. FINAL VALUES ===");
  const vals = await page.evaluate(() => ({
    name: document.getElementById("organization-name-field")?.value,
    tagline: document.getElementById("organization-tagline-field")?.value,
    desc: document.getElementById("organization-description-field")?.value?.substring(0, 150),
    website: document.getElementById("organization-website-field")?.value,
    industry: document.getElementById("organization-industry-typeahead")?.value,
    founded: document.getElementById("organization-founded-on-input")?.value,
  }));
  console.log(JSON.stringify(vals, null, 2));

  // 5. SAVE
  console.log("\n=== 5. SAVING ===");
  const saveBtn = await page.$('button:has-text("Kaydet")');
  if (saveBtn) {
    await saveBtn.click();
    console.log("Save clicked!");
    await page.waitForTimeout(5000);

    // Handle any confirmation dialogs
    const dialogs = await page.$$('.artdeco-modal__actionbar button, [role="dialog"] button');
    for (const d of dialogs) {
      const text = await d.textContent();
      if (
        text.includes("Evet") ||
        text.includes("Emin") ||
        text.includes("Devam") ||
        text.includes("Confirm")
      ) {
        await d.click();
        await page.waitForTimeout(2000);
        console.log("Dialog confirmed");
        break;
      }
    }

    console.log("Post-save URL:", page.url());
  }

  console.log("\nDONE!");
})();
