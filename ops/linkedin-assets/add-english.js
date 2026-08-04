const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("=== 1. SELECT ENGLISH ===");
  // Select English from dropdown
  await page.selectOption("#org-edit-language-language-select", { label: "English" });
  await page.waitForTimeout(1000);

  const langVal = await page.evaluate(
    () => document.getElementById("org-edit-language-language-select")?.value,
  );
  console.log("Selected language value:", langVal);

  // 2. FILL NAME
  console.log("\n=== 2. FILL NAME ===");
  const nameField = await page.$("#org-edit-language-name-field");
  if (nameField) {
    await nameField.click({ clickCount: 3 });
    await page.keyboard.press("Backspace");
    await nameField.type("ALPAR AI", { delay: 20 });
    console.log("Name:", await nameField.inputValue());
  }

  // 3. FILL TAGLINE
  console.log("\n=== 3. FILL TAGLINE ===");
  const taglineField = await page.$("#org-edit-language-tagline-field");
  if (taglineField) {
    await taglineField.click();
    await page.keyboard.type(
      "The Moody's for Artificial Intelligence — Trust Infrastructure for AI Accountability",
      { delay: 5 },
    );
    console.log("Tagline:", await taglineField.inputValue());
  }

  // 4. FILL DESCRIPTION - Professional social media strategist content
  console.log("\n=== 4. FILL DESCRIPTION ===");
  const descField = await page.$("#org-edit-language-description-field");
  if (descField) {
    await descField.click();
    await page.keyboard.type(
      "ALPAR AI is the world's first independent public AI incident registry and evaluator — the Moody's for artificial intelligence.\n\n" +
        "We provide:\n" +
        "• Public AI incident tracking with cryptographic proof\n" +
        "• Real-time AI risk scoring and safety evaluations\n" +
        "• EU AI Act Article 73-ready compliance infrastructure\n" +
        "• Machine learning safety benchmarks and transparency reports\n\n" +
        "Our mission: Make AI accountability measurable, verifiable, and publicly accessible.\n\n" +
        "Founded in Istanbul, Turkey in 2026, ALPAR AI operates as a trust infrastructure serving researchers, regulators, and the public interest.\n\n" +
        "Follow us for AI safety insights, incident reports, and accountability updates.",
      { delay: 2 },
    );
    console.log("Description filled");
  }

  // 5. SAVE
  console.log("\n=== 5. SAVE ===");
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

  // Verify saved
  const savedState = await page.evaluate(() => {
    const table = document.querySelector("table, .org-language-table");
    return document.body.innerText.substring(0, 3000);
  });
  console.log("After save:", savedState);

  console.log("\nDONE!");
})();
