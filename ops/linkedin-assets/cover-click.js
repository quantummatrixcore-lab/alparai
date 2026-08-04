const { chromium } = require("playwright");
const COVER = "D:/Alparai/ops/linkedin-assets/cover.png";

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("=== CLICK KAPAK RESMİ EKLE ===");
  // Click the "Kapak resmi ekle" menu item
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('li, [role="menuitem"]'));
    const coverItem = items.find((el) => el.textContent?.trim() === "Kapak resmi ekle");
    if (coverItem) coverItem.click();
  });
  await page.waitForTimeout(3000);

  // Check for file input
  const fileInputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="file"]')).map((i) => ({
      id: i.id,
      accept: i.accept,
      aria: i.getAttribute("aria-label"),
      visible: i.offsetParent !== null,
    }));
  });
  console.log("File inputs:", JSON.stringify(fileInputs, null, 2));

  // Look for cover-specific file input
  let coverInput = null;
  for (const fi of fileInputs) {
    if (
      fi.aria?.includes("Kapak") ||
      fi.aria?.includes("kapak") ||
      fi.aria?.includes("cover") ||
      fi.aria?.includes("Banner") ||
      fi.id.includes("cover") ||
      fi.id.includes("banner")
    ) {
      coverInput = fi;
      break;
    }
  }

  if (!coverInput && fileInputs.length > 0) {
    // Use any new file input (not the logo one)
    coverInput = fileInputs.find((f) => f.id !== "organization-logo-field");
  }

  if (coverInput) {
    console.log("Setting cover file for:", coverInput.id || coverInput.aria);
    const selector = coverInput.id ? `#${coverInput.id}` : `input[aria-label="${coverInput.aria}"]`;
    const input = await page.$(selector);
    if (input) {
      await input.setInputFiles(COVER);
      console.log("Cover file set!");
      await page.waitForTimeout(3000);
    }
  } else {
    console.log("No cover file input found. Trying direct approach...");
    // Maybe clicking "Kapak resmi ekle" triggers a file dialog
    // Let me try with the logo input selector but for cover
    const allInputs = await page.$$('input[type="file"]');
    console.log("Total file inputs:", allInputs.length);
    for (const inp of allInputs) {
      const id = await inp.evaluate((el) => el.id);
      const aria = await inp.evaluate((el) => el.getAttribute("aria-label"));
      console.log(`  Input: id=${id} aria=${aria}`);
    }
  }

  // Check for save/apply buttons
  const btns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button"))
      .map((b) => ({
        text: (b.textContent || "").trim().substring(0, 40),
        visible: b.offsetParent !== null,
      }))
      .filter(
        (b) =>
          b.visible &&
          (b.text.includes("Kaydet") ||
            b.text.includes("Save") ||
            b.text.includes("Uygula") ||
            b.text.includes("Apply") ||
            b.text.includes("Kırp")),
      );
  });
  console.log("Action buttons:", JSON.stringify(btns));

  // If there's a crop/save dialog
  if (btns.length > 0) {
    for (const btn of btns) {
      if (btn.text.includes("Kaydet") || btn.text.includes("Save") || btn.text.includes("Uygula")) {
        const btnEl = await page.$(`button:has-text("${btn.text}")`);
        if (btnEl) {
          await btnEl.click();
          console.log("Clicked:", btn.text);
        }
        await page.waitForTimeout(3000);
        break;
      }
    }
  }

  // Final check
  console.log("\nURL:", page.url());
  const text = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log("Page:", text);
})();
