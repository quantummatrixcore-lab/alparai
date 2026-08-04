const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("URL:", page.url());

  // 1. GO TO SAYFA BİLGİSİ TAB
  console.log("=== 1. SWITCH TO INFO TAB ===");
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button, [role="tab"]'));
    const infoTab = tabs.find((b) => (b.textContent || "").includes("Sayfa bilgisi"));
    if (infoTab) infoTab.click();
  });
  await page.waitForTimeout(3000);

  // Check tagline
  const tagline = await page.evaluate(() => {
    const el = document.getElementById("organization-tagline-field");
    return { value: el?.value, visible: el?.offsetParent !== null };
  });
  console.log("Tagline:", JSON.stringify(tagline));

  // Fix tagline
  if (tagline.visible) {
    const field = await page.$("#organization-tagline-field");
    await field.click({ clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.waitForTimeout(200);
    await page.keyboard.type("Trust infrastructure for AI accountability", { delay: 15 });
    console.log("Tagline fixed:", await field.inputValue());
  } else {
    console.log("Tagline not visible, forcing via JS...");
    await page.evaluate(() => {
      const el = document.getElementById("organization-tagline-field");
      if (el) {
        el.scrollIntoView({ block: "center" });
      }
    });
    await page.waitForTimeout(500);

    const field = await page.$("#organization-tagline-field");
    if (field) {
      const vis = await field.evaluate((el) => el.offsetParent !== null);
      console.log("After scroll, visible:", vis);
      if (vis) {
        await field.click({ clickCount: 3 });
        await page.keyboard.press("Backspace");
        await page.keyboard.type("Trust infrastructure for AI accountability", { delay: 15 });
      }
    }
  }

  // Check company type select
  console.log("\n=== 2. COMPANY TYPE ===");
  const typeSelect = await page.$("#organization-type-select");
  if (typeSelect) {
    const currentType = await typeSelect.evaluate((el) => el.value);
    console.log("Current type:", currentType);
    // Select "Özel Şirket" (Private Company)
    await page.selectOption("#organization-type-select", "PRIVATE");
    console.log("Type set to PRIVATE");
  }

  // Check call to action
  console.log("\n=== 3. CALL TO ACTION ===");
  const ctaSelect = await page.$("#org-edit-call-to-action-select");
  if (ctaSelect) {
    const vis = await ctaSelect.evaluate((el) => el.offsetParent !== null);
    console.log("CTA visible:", vis);
  }

  // 4. SAVE INFO TAB
  console.log("\n=== 4. SAVE INFO TAB ===");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const saveBtn = btns.find((b) => b.textContent?.trim() === "Kaydet" && b.offsetParent !== null);
    if (saveBtn) saveBtn.click();
  });
  await page.waitForTimeout(5000);

  // Check for confirmation
  const confirm = await page.evaluate(() => {
    const modals = document.querySelectorAll('.artdeco-modal, [role="dialog"]');
    for (const m of modals) {
      const btns = Array.from(m.querySelectorAll("button"));
      const yesBtn = btns.find(
        (b) => b.textContent?.includes("Evet") || b.textContent?.includes("Emin"),
      );
      if (yesBtn) {
        yesBtn.click();
        return "confirmed";
      }
    }
    return "no dialog";
  });
  console.log("Confirm:", confirm);
  await page.waitForTimeout(3000);

  console.log("\nURL:", page.url());

  // 5. NOW GO TO DETAILS TAB FOR SPECIALTIES
  console.log("\n=== 5. SPECIALTIES ===");
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button, [role="tab"]'));
    const detailsTab = tabs.find((b) => (b.textContent || "").includes("Ayrıntılar"));
    if (detailsTab) detailsTab.click();
  });
  await page.waitForTimeout(3000);

  // Try to add specialties using the pill input
  const pillInput = await page.$('input[id*="artdeco-pill"]');
  if (pillInput) {
    const vis = await pillInput.evaluate((el) => el.offsetParent !== null);
    console.log("Pill input visible:", vis);
    if (vis) {
      const specialties = ["Artificial Intelligence", "AI Safety", "AI Accountability"];
      for (const spec of specialties) {
        await pillInput.click();
        await pillInput.fill("");
        await pillInput.type(spec, { delay: 30 });
        await page.waitForTimeout(1500);

        // Check for dropdown suggestions
        const suggestions = await page.evaluate(() => {
          const items = document.querySelectorAll(
            '[role="option"], .artdeco-typeahead__result, .search-reusables__typeahead-option',
          );
          return Array.from(items).map((i) => i.textContent?.trim().substring(0, 40));
        });
        console.log('Suggestions for "' + spec + '":', suggestions);

        if (suggestions.length > 0) {
          // Click first suggestion
          await page.evaluate(() => {
            const item = document.querySelector('[role="option"], .artdeco-typeahead__result');
            if (item) item.click();
          });
          console.log("Selected suggestion for:", spec);
        } else {
          await page.keyboard.press("Enter");
          console.log("Pressed Enter for:", spec);
        }
        await page.waitForTimeout(500);
      }
    }
  } else {
    console.log("No pill input found");
    // Try alternative: find all inputs in specialties section
    const allInputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("input")).map((i) => ({
        id: i.id,
        type: i.type,
        visible: i.offsetParent !== null,
        placeholder: i.placeholder,
      }));
    });
    console.log("All inputs:", JSON.stringify(allInputs));
  }

  // 6. FINAL SAVE
  console.log("\n=== 6. FINAL SAVE ===");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const saveBtn = btns.find((b) => b.textContent?.trim() === "Kaydet" && b.offsetParent !== null);
    if (saveBtn) saveBtn.click();
  });
  await page.waitForTimeout(5000);

  console.log("DONE! URL:", page.url());
})();
