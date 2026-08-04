const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  // 1. Navigate directly to tagline edit
  console.log("=== 1. TAGLINE EDIT ===");
  await page.goto(
    "https://www.linkedin.com/company/135125061/admin/edit/?anchor=organization-tagline-field&editPageActiveTab=info",
    {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    },
  );
  await page.waitForTimeout(4000);

  const tagline = await page.$("#organization-tagline-field");
  if (tagline) {
    const vis = await tagline.evaluate((el) => el.offsetParent !== null);
    console.log("Tagline visible:", vis);

    if (vis) {
      await tagline.click({ clickCount: 3 });
      await page.keyboard.press("Backspace");
      await page.keyboard.type("Trust infrastructure for AI accountability", { delay: 15 });
      console.log("Tagline:", await tagline.inputValue());
    } else {
      console.log("Tagline hidden, using JS + native setter");
      await page.evaluate(() => {
        const el = document.getElementById("organization-tagline-field");
        if (el) {
          const setter = Object.getOwnPropertyDescriptor(
            HTMLTextAreaElement.prototype,
            "value",
          ).set;
          setter.call(el, "Trust infrastructure for AI accountability");
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    }
  }

  // Save
  console.log("Saving tagline...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const saveBtn = btns.find((b) => b.textContent?.trim() === "Kaydet" && b.offsetParent !== null);
    if (saveBtn) saveBtn.click();
  });
  await page.waitForTimeout(5000);

  // Handle dialog
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

  console.log("Tagline saved. URL:", page.url());

  // 2. Now go to details for specialties
  console.log("\n=== 2. SPECIALTIES ===");
  await page.goto(
    "https://www.linkedin.com/company/135125061/admin/edit/?anchor=organization-founded-on-input&editPageActiveTab=details",
    {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    },
  );
  await page.waitForTimeout(4000);

  // Scroll down to find specialty section
  await page.evaluate(() => {
    const pill = document.querySelector('input[id*="artdeco-pill"]');
    if (pill) pill.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(1000);

  // Find all pill inputs
  const pills = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[id*="artdeco-pill"]')).map((i) => ({
      id: i.id,
      visible: i.offsetParent !== null,
    }));
  });
  console.log("Pill inputs:", JSON.stringify(pills));

  // Add specialties
  const specs = ["Artificial Intelligence", "AI Safety", "AI Accountability"];
  for (const spec of specs) {
    const pill = await page.$(`#${pills[0]?.id}`);
    if (pill) {
      await pill.click();
      await pill.fill("");
      await pill.type(spec, { delay: 30 });
      await page.waitForTimeout(2000);

      // Try to select from autocomplete or just press Enter
      const suggestion = await page.evaluate(() => {
        const items = document.querySelectorAll('[role="option"]');
        if (items.length > 0) {
          items[0].click();
          return "clicked option";
        }
        return "no options";
      });

      if (suggestion === "no options") {
        await page.keyboard.press("Enter");
      }
      console.log("Added:", spec, "(" + suggestion + ")");
      await page.waitForTimeout(1000);
    }
  }

  // 3. Final save
  console.log("\n=== 3. FINAL SAVE ===");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const saveBtn = btns.find((b) => b.textContent?.trim() === "Kaydet" && b.offsetParent !== null);
    if (saveBtn) saveBtn.click();
  });
  await page.waitForTimeout(5000);

  // Handle dialog
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

  console.log("\nDONE! URL:", page.url());
})();
