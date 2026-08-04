const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("URL:", page.url());

  // 1. FILL DESCRIPTION (Genel Bakış)
  console.log("=== 1. FILL DESCRIPTION ===");
  const descField = await page.$("#organization-description-field");
  if (descField) {
    await descField.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await descField.click();
    await page.keyboard.type(
      "ALPAR AI is an independent public AI incident registry and evaluator. We track, rate, and verify AI incidents with public cryptographic proof — the Moody's for artificial intelligence. Our platform provides EU AI Act Article 73-ready public incident tracking, real-time AI risk scoring, and machine-learning safety evaluations. Founded in Istanbul, Turkey, ALPAR AI operates as a trust infrastructure for AI accountability worldwide.",
      { delay: 3 },
    );
    const val = await descField.inputValue();
    console.log("Description filled (" + val.length + " chars):", val.substring(0, 80));
  }

  // 2. FILL WEBSITE
  console.log("\n=== 2. CHECK WEBSITE ===");
  const websiteField = await page.$("#organization-website-field");
  if (websiteField) {
    const websiteVal = await websiteField.inputValue();
    console.log("Website:", websiteVal);
    if (!websiteVal) {
      await websiteField.click();
      await websiteField.type("https://alparai.com");
      console.log("Website filled");
    }
  }

  // 3. FILL INDUSTRY
  console.log("\n=== 3. CHECK INDUSTRY ===");
  const industryField = await page.$("#organization-industry-typeahead");
  if (industryField) {
    const industryVal = await industryField.inputValue();
    console.log("Industry:", industryVal);
    // Industry is already "Yazılım Geliştirme" which is fine
  }

  // 4. SELECT COMPANY SIZE
  console.log("\n=== 4. SELECT COMPANY SIZE ===");
  const sizeClicked = await page.evaluate(() => {
    const sizeSection = Array.from(document.querySelectorAll("*")).find(
      (el) => el.textContent?.includes("Şirket büyüklüğü") && el.children.length < 3,
    );
    if (sizeSection) {
      // Find nearby dropdown/select
      const parent = sizeSection.closest(".org-page-edit__form-group, .organization-field, div");
      if (parent) {
        const select = parent.querySelector('select, [role="listbox"], button');
        if (select) {
          select.click();
          return "clicked select";
        }
      }
    }
    return "not found";
  });
  console.log("Company size:", sizeClicked);

  // 5. FILL FOUNDED YEAR
  console.log("\n=== 5. FILL FOUNDED YEAR ===");
  const foundedField = await page.$("#organization-founded-on-input");
  if (foundedField) {
    await foundedField.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await foundedField.click();
    await page.keyboard.type("2024");
    const val = await foundedField.inputValue();
    console.log("Founded year:", val);
  }

  // 6. ADD SPECIALTIES
  console.log("\n=== 6. ADD SPECIALTIES ===");
  const specialties = [
    "Artificial Intelligence",
    "AI Safety",
    "AI Incident Reporting",
    "EU AI Act",
    "Machine Learning",
    "AI Risk Assessment",
    "AI Transparency",
    "AI Accountability",
  ];

  for (const spec of specialties) {
    // Find and click "Uzmanlık ekle"
    const addBtn = await page.evaluate((specText) => {
      const btns = Array.from(document.querySelectorAll("button"));
      const addBtn = btns.find(
        (b) => b.textContent?.includes("Uzmanlık ekle") && b.offsetParent !== null,
      );
      if (addBtn) {
        addBtn.click();
        return "clicked";
      }
      return "not found";
    }, spec);

    if (addBtn === "clicked") {
      await page.waitForTimeout(500);

      // Find the pill input and type
      const pillInput = await page.$('input[id*="artdeco-pill"]');
      if (pillInput) {
        await pillInput.click();
        await pillInput.type(spec, { delay: 20 });
        await page.waitForTimeout(1000);

        // Press Enter or click first suggestion
        await page.keyboard.press("Enter");
        await page.waitForTimeout(500);
        console.log("Added specialty:", spec);
      }
    } else {
      console.log("Could not add:", spec);
    }
  }

  // 7. SAVE
  console.log("\n=== 7. SAVING ===");
  await page.waitForTimeout(1000);
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

  // Check for confirmation
  const confirmResult = await page.evaluate(() => {
    const modals = document.querySelectorAll('.artdeco-modal, [role="dialog"]');
    for (const modal of modals) {
      const btns = Array.from(modal.querySelectorAll("button"));
      const confirmBtn = btns.find((b) => {
        const text = b.textContent?.trim();
        return (
          text?.includes("Evet") ||
          text?.includes("Devam") ||
          text?.includes("Confirm") ||
          text?.includes("OK")
        );
      });
      if (confirmBtn) {
        confirmBtn.click();
        return "confirmed";
      }
    }
    return "no dialog";
  });
  console.log("Confirm:", confirmResult);
  await page.waitForTimeout(3000);

  // Final state
  console.log("\n=== FINAL STATE ===");
  console.log("URL:", page.url());
  const finalText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log("Page:", finalText);

  console.log("\nDONE!");
})();
