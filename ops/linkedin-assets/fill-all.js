const { chromium } = require("playwright");

const LOGO = "D:/Alparai/ops/linkedin-assets/logo.png";

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("URL:", page.url());

  // === 1. UPLOAD LOGO ===
  console.log("\n=== 1. UPLOADING LOGO ===");
  const logoInput = await page.$("#organization-logo-field");
  if (logoInput) {
    await logoInput.setInputFiles(LOGO);
    console.log("Logo file set!");
    await page.waitForTimeout(3000);

    // Check if there's a crop/save modal
    const saveBtn = await page.$(
      'button:has-text("Uygula"), button:has-text("Kaydet"), button:has-text("Apply"), button:has-text("Save")',
    );
    if (saveBtn) {
      console.log("Found save/apply button, clicking...");
      await saveBtn.click();
      await page.waitForTimeout(2000);
    }
  } else {
    console.log("Logo input not found!");
  }

  // === 2. FILL NAME ===
  console.log("\n=== 2. FILLING NAME ===");
  const nameField = await page.$("#organization-name-field");
  if (nameField) {
    const currentName = await nameField.inputValue();
    console.log("Current name:", currentName);
    if (!currentName || currentName !== "ALPAR AI") {
      await nameField.fill("");
      await nameField.fill("ALPAR AI");
      console.log("Name set to ALPAR AI");
    }
  }

  // === 3. FILL TAGLINE ===
  console.log("\n=== 3. FILLING TAGLINE ===");
  const taglineField = await page.$("#organization-tagline-field");
  if (taglineField) {
    await taglineField.fill("");
    await taglineField.fill("Trust infrastructure for AI accountability — The Moody's for AI");
    console.log("Tagline filled");
  }

  // === 4. FILL DESCRIPTION ===
  console.log("\n=== 4. FILLING DESCRIPTION ===");
  const descField = await page.$("#organization-description-field");
  if (descField) {
    await descField.fill("");
    await descField.fill(
      "ALPAR AI is an independent public AI incident registry and evaluator. We track, rate, and verify AI incidents with public cryptographic proof — the Moody's for artificial intelligence. Our platform provides EU AI Act Article 73-ready public incident tracking, real-time AI risk scoring, and machine-learning safety evaluations. Founded in Istanbul, ALPAR AI operates as a trust infrastructure for AI accountability worldwide.",
    );
    console.log("Description filled");
  }

  // === 5. FILL WEBSITE ===
  console.log("\n=== 5. FILLING WEBSITE ===");
  const websiteField = await page.$("#organization-website-field");
  if (websiteField) {
    await websiteField.fill("");
    await websiteField.fill("https://alparai.com");
    console.log("Website filled");
  }

  // === 6. FILL INDUSTRY ===
  console.log("\n=== 6. FILLING INDUSTRY ===");
  const industryField = await page.$("#organization-industry-typeahead");
  if (industryField) {
    await industryField.fill("");
    await industryField.click();
    await industryField.type("Information Technology", { delay: 100 });
    await page.waitForTimeout(2000);

    // Click the first dropdown option
    const option = await page.$(
      '.artdeco-typeahead__result, [role="option"], .search-reusables__typeahead-result',
    );
    if (option) {
      await option.click();
      console.log("Industry selected");
    } else {
      console.log("No industry dropdown option found");
    }
  }

  // === 7. FILL FOUNDED YEAR ===
  console.log("\n=== 7. FILLING FOUNDED YEAR ===");
  const foundedField = await page.$("#organization-founded-on-input");
  if (foundedField) {
    await foundedField.fill("");
    await foundedField.fill("2024");
    console.log("Founded year set to 2024");
  }

  await page.waitForTimeout(1000);

  // === 8. SAVE ===
  console.log("\n=== 8. SAVING ===");
  const buttons = await page.$$("button");
  for (const btn of buttons) {
    const text = await btn.textContent().catch(() => "");
    if (
      text.includes("Kaydet") ||
      text.includes("Save") ||
      text.includes("Uygula") ||
      text.includes("Apply")
    ) {
      console.log(`Found save button: "${text.trim()}"`);
      await btn.click();
      await page.waitForTimeout(3000);
      break;
    }
  }

  // Check for confirmation
  const pageText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log("\nAfter save text:", pageText);

  console.log("\nDONE!");
})();
