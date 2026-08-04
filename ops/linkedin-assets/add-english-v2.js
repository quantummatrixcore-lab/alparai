const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("URL:", page.url());

  // Check if we're still on language edit page
  const isLangPage = page.url().includes("manageLanguages");
  if (!isLangPage) {
    console.log("Navigating to language settings...");
    await page.goto(
      "https://www.linkedin.com/company/135125061/admin/edit/?editPageActiveTab=manageLanguages",
      {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      },
    );
    await page.waitForTimeout(4000);
  }

  // Check if "Dil ekle" form is open or we need to click it
  const langSelect = await page.$("#org-edit-language-language-select");
  if (!langSelect) {
    console.log('Language form not open, clicking "Dil ekle"...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const addBtn = btns.find(
        (b) => b.textContent?.includes("Dil ekle") && b.offsetParent !== null,
      );
      if (addBtn) addBtn.click();
    });
    await page.waitForTimeout(3000);
  }

  // 1. Select English
  console.log("=== SELECT ENGLISH ===");
  const langSelect2 = await page.$("#org-edit-language-language-select");
  if (langSelect2) {
    const currentVal = await langSelect2.inputValue();
    console.log("Current language:", currentVal);

    if (!currentVal) {
      await page.selectOption("#org-edit-language-language-select", { label: "English" });
      await page.waitForTimeout(1000);
      console.log("Selected English");
    } else {
      console.log("Language already selected");
    }
  }

  // 2. Fill Name
  console.log("\n=== FILL NAME ===");
  const nameField = await page.$("#org-edit-language-name-field");
  if (nameField) {
    await nameField.click({ clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.keyboard.type("ALPAR AI", { delay: 20 });
    console.log("Name:", await nameField.inputValue());
  }

  // 3. Fill Tagline
  console.log("\n=== FILL TAGLINE ===");
  const taglineField = await page.$("#org-edit-language-tagline-field");
  if (taglineField) {
    await taglineField.click();
    await page.waitForTimeout(200);
    await page.keyboard.type(
      "The Moody's for Artificial Intelligence — Trust Infrastructure for AI Accountability",
      { delay: 5 },
    );
    console.log("Tagline:", (await taglineField.inputValue()).substring(0, 80));
  }

  // 4. Fill Description
  console.log("\n=== FILL DESCRIPTION ===");
  const descField = await page.$("#org-edit-language-description-field");
  if (descField) {
    await descField.click();
    await page.waitForTimeout(200);
    const desc =
      "ALPAR AI is the world's first independent public AI incident registry and evaluator — the Moody's for artificial intelligence.\n\n" +
      "We provide:\n" +
      "• Public AI incident tracking with cryptographic proof\n" +
      "• Real-time AI risk scoring and safety evaluations\n" +
      "• EU AI Act Article 73-ready compliance infrastructure\n" +
      "• Machine learning safety benchmarks and transparency reports\n\n" +
      "Our mission: Make AI accountability measurable, verifiable, and publicly accessible.\n\n" +
      "Founded in Istanbul, Turkey in 2026, ALPAR AI operates as a trust infrastructure serving researchers, regulators, and the public interest.\n\n" +
      "Follow us for AI safety insights, incident reports, and accountability updates.";
    await page.keyboard.type(desc, { delay: 1 });
    console.log("Description filled");
  }

  // 5. SAVE
  console.log("\n=== SAVE ===");
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const saveBtn = btns.find((b) => b.textContent?.trim() === "Kaydet" && b.offsetParent !== null);
    if (saveBtn) saveBtn.click();
  });
  await page.waitForTimeout(5000);

  // Handle confirmation
  await page.evaluate(() => {
    const modals = document.querySelectorAll('[role="dialog"]');
    for (const m of modals) {
      const btns = Array.from(m.querySelectorAll("button"));
      const confirm = btns.find(
        (b) => b.textContent?.includes("Evet") || b.textContent?.includes("Emin"),
      );
      if (confirm) confirm.click();
    }
  });
  await page.waitForTimeout(3000);

  console.log("URL:", page.url());

  // Verify
  const tableText = await page.evaluate(() => {
    const rows = document.querySelectorAll("table tr, .org-language-row");
    return Array.from(rows)
      .map((r) => r.textContent?.trim().substring(0, 100))
      .join("\n");
  });
  console.log("Language table:", tableText);

  console.log("\nDONE!");
})();
