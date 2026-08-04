const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("URL:", page.url());

  // 1. FIX TAGLINE - clear it and set correct value
  console.log("=== 1. FIX TAGLINE ===");
  const tagline = await page.$("#organization-tagline-field");
  if (tagline) {
    await tagline.scrollIntoViewIfNeeded();
    await tagline.click({ clickCount: 3 });
    await page.waitForTimeout(200);
    await page.keyboard.press("Backspace");
    await page.waitForTimeout(200);
    await page.keyboard.type("Trust infrastructure for AI accountability", { delay: 20 });
    const val = await tagline.inputValue();
    console.log("Tagline now:", val, "(" + val.length + "/120)");
  }

  await page.waitForTimeout(500);

  // 2. CHECK CURRENT LOGO STATE
  console.log("\n=== 2. CHECK LOGO ===");
  const logoState = await page.evaluate(() => {
    const logoInput = document.getElementById("organization-logo-field");
    const logoImg = document.querySelector(
      '.org-page-edit__logo-display img, [data-test-id="org-logo"] img, .org-company-logo img',
    );
    return {
      inputValue: logoInput?.files?.length || 0,
      imgSrc: logoImg?.src?.substring(0, 100) || "none",
    };
  });
  console.log("Logo state:", JSON.stringify(logoState));

  // 3. SAVE TAGLINE FIX FIRST
  console.log("\n=== 3. SAVE TAGLINE ===");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const saveBtn = btns.find((b) => b.textContent?.trim() === "Kaydet" && b.offsetParent !== null);
    if (saveBtn) saveBtn.click();
  });
  await page.waitForTimeout(5000);

  console.log("Post-save URL:", page.url());

  // 4. CHECK IF SAVE SUCCEEDED
  const afterSave = await page.evaluate(() => ({
    url: window.location.href,
    tagline: document.getElementById("organization-tagline-field")?.value,
    name: document.getElementById("organization-name-field")?.value,
    hasSaveBtn: !!Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === "Kaydet" && b.offsetParent !== null,
    ),
  }));
  console.log("After save:", JSON.stringify(afterSave));

  // 5. Now go back to edit and handle description
  if (!afterSave.hasSaveBtn) {
    console.log("\n=== 5. SUCCEEDED - Going back to edit for description ===");
    // Navigate back to edit
    const editBtn = await page.$("text=Sayfayı Düzenleyin");
    if (editBtn) {
      await editBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  // 6. Handle description via the "Açıklama ekle" link on dashboard
  console.log("\n=== 6. ADD DESCRIPTION ===");
  // First navigate to dashboard
  await page.goto("https://www.linkedin.com/company/135125061/admin/dashboard/", {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });
  await page.waitForTimeout(3000);

  // Find all clickable elements with "Açıklama" text
  const descLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button, [role="button"], span'))
      .filter((el) => {
        return el.textContent?.includes("Açıklama") && el.offsetParent !== null;
      })
      .map((el) => ({
        tag: el.tagName,
        text: el.textContent?.trim().substring(0, 50),
        class: el.className?.toString().substring(0, 80),
      }));
  });
  console.log("Description links:", JSON.stringify(descLinks, null, 2));

  // Click on "Açıklama ekle"
  const addDesc = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("a, button, span"));
    const el = els.find(
      (e) => e.textContent?.trim() === "Açıklama ekle" && e.offsetParent !== null,
    );
    if (el) {
      el.click();
      return "clicked";
    }
    return "not found";
  });
  console.log("Add description click:", addDesc);
  await page.waitForTimeout(3000);

  console.log("URL after desc click:", page.url());

  // Check if we're now in edit mode with description visible
  const descState2 = await page.evaluate(() => {
    const el = document.getElementById("organization-description-field");
    return { exists: !!el, visible: el ? el.offsetParent !== null : false };
  });
  console.log("Description state:", JSON.stringify(descState2));

  if (descState2.visible) {
    const descField = await page.$("#organization-description-field");
    await descField.scrollIntoViewIfNeeded();
    await descField.click();
    await page.keyboard.type(
      "ALPAR AI is an independent public AI incident registry and evaluator. We track, rate, and verify AI incidents with public cryptographic proof. EU AI Act Article 73-ready platform.",
      { delay: 5 },
    );
    console.log("Description typed via keyboard");
  }

  // Fill founded year too
  const foundedField = await page.$("#organization-founded-on-input");
  if (foundedField) {
    const vis = await foundedField.evaluate((el) => el.offsetParent !== null);
    if (vis) {
      await foundedField.click();
      await foundedField.type("2024");
      console.log("Founded: 2024");
    }
  }

  // Save everything
  console.log("\n=== FINAL SAVE ===");
  const saveResult = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const saveBtn = btns.find((b) => b.textContent?.trim() === "Kaydet" && b.offsetParent !== null);
    if (saveBtn) {
      saveBtn.click();
      return "clicked";
    }
    return "not found";
  });
  console.log("Save:", saveResult);
  await page.waitForTimeout(5000);

  console.log("\nFinal URL:", page.url());
  console.log("DONE");
})();
