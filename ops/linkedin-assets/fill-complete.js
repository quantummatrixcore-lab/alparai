const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("URL:", page.url());

  // Re-upload logo first
  console.log("=== RE-UPLOAD LOGO ===");
  const logoInput = await page.$("#organization-logo-field");
  if (logoInput) {
    const fs = require("fs");
    await logoInput.setInputFiles("D:/Alparai/ops/linkedin-assets/logo.png");
    console.log("Logo file set again");
    await page.waitForTimeout(3000);

    // Check for crop dialog
    const cropBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      return btns
        .map((b) => ({ text: (b.textContent || "").trim(), visible: b.offsetParent !== null }))
        .filter((b) => b.visible);
    });
    console.log("Visible buttons after logo:", JSON.stringify(cropBtn));

    // Click "Uygula" or any save/apply button
    for (const btnInfo of cropBtn) {
      if (
        btnInfo.text.includes("Uygula") ||
        btnInfo.text.includes("Apply") ||
        btnInfo.text.includes("Kaydet") ||
        btnInfo.text.includes("Save")
      ) {
        console.log(`Clicking: ${btnInfo.text}`);
        const btn = await page.$(`button:has-text("${btnInfo.text}")`);
        if (btn) {
          await btn.click();
          await page.waitForTimeout(2000);
        }
        break;
      }
    }
  }

  // Scroll the edit panel (right side) to reveal description
  console.log("\n=== SCROLLING EDIT PANEL ===");
  await page.evaluate(() => {
    // Find the scrollable edit panel container
    const editPanel = document.querySelector(
      '.scaffold-layout__detail, [class*="edit"], [class*="form"]',
    );
    if (editPanel) {
      editPanel.scrollTop = editPanel.scrollHeight;
      console.log("Scrolled edit panel");
    }
    // Also try scrolling the whole page
    window.scrollBy(0, 800);
  });
  await page.waitForTimeout(1000);

  // Check visibility again
  const fields = await page.evaluate(() => {
    const ids = [
      "organization-logo-field",
      "organization-name-field",
      "organization-tagline-field",
      "organization-description-field",
      "organization-website-field",
      "organization-industry-typeahead",
      "organization-founded-on-input",
    ];
    return ids.map((id) => {
      const el = document.getElementById(id);
      return {
        id,
        exists: !!el,
        value: el ? (el.value || "").substring(0, 100) : null,
        visible: el ? el.offsetParent !== null : false,
      };
    });
  });
  console.log("Fields after scroll:", JSON.stringify(fields, null, 2));

  // Fill description if visible, otherwise use JS to set value
  console.log("\n=== FILL DESCRIPTION ===");
  await page.evaluate(() => {
    const desc = document.getElementById("organization-description-field");
    if (desc) {
      // Make visible first
      desc.style.display = "block";
      desc.style.visibility = "visible";
      desc.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
  await page.waitForTimeout(500);

  const descField = await page.$("#organization-description-field");
  if (descField) {
    const visible = await descField.evaluate((el) => el.offsetParent !== null);
    console.log("Description visible now:", visible);

    if (visible) {
      await descField.click();
      await descField.fill(
        "ALPAR AI is an independent public AI incident registry and evaluator. We track, rate, and verify AI incidents with public cryptographic proof — the Moody's for artificial intelligence. Our platform provides EU AI Act Article 73-ready public incident tracking, real-time AI risk scoring, and machine-learning safety evaluations. Founded in Istanbul, Turkey.",
      );
      console.log("Description filled!");
    } else {
      // Force set via JS
      await page.evaluate(() => {
        const desc = document.getElementById("organization-description-field");
        if (desc) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype,
            "value",
          ).set;
          nativeInputValueSetter.call(
            desc,
            "ALPAR AI is an independent public AI incident registry and evaluator. We track, rate, and verify AI incidents with public cryptographic proof — the Moody's for artificial intelligence. Our platform provides EU AI Act Article 73-ready public incident tracking, real-time AI risk scoring, and machine-learning safety evaluations. Founded in Istanbul, Turkey.",
          );
          desc.dispatchEvent(new Event("input", { bubbles: true }));
          desc.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
      console.log("Description set via JS!");
    }
  }

  // Fill founded year
  console.log("\n=== FILL FOUNDED YEAR ===");
  const foundedField = await page.$("#organization-founded-on-input");
  if (foundedField) {
    await page.evaluate(() => {
      const f = document.getElementById("organization-founded-on-input");
      if (f) f.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(500);

    const visible = await foundedField.evaluate((el) => el.offsetParent !== null);
    console.log("Founded visible:", visible);

    if (visible) {
      await foundedField.click();
      await foundedField.fill("2024");
      console.log("Founded year set");
    } else {
      await page.evaluate(() => {
        const f = document.getElementById("organization-founded-on-input");
        if (f) {
          const setter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value",
          ).set;
          setter.call(f, "2024");
          f.dispatchEvent(new Event("input", { bubbles: true }));
          f.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
      console.log("Founded year set via JS");
    }
  }

  await page.waitForTimeout(1000);

  // Check tagline value
  const taglineVal = await page.evaluate(
    () => document.getElementById("organization-tagline-field")?.value,
  );
  console.log("\nTagline value:", taglineVal);

  // Update tagline to English
  console.log("\n=== UPDATE TAGLINE ===");
  const taglineField = await page.$("#organization-tagline-field");
  if (taglineField) {
    await taglineField.click({ clickCount: 3 });
    await taglineField.fill("Trust infrastructure for AI accountability");
    console.log("Tagline updated");
  }

  // Final field check
  console.log("\n=== FINAL FIELD CHECK ===");
  const finalFields = await page.evaluate(() => {
    const ids = [
      "organization-name-field",
      "organization-tagline-field",
      "organization-description-field",
      "organization-website-field",
      "organization-industry-typeahead",
      "organization-founded-on-input",
    ];
    return ids.map((id) => {
      const el = document.getElementById(id);
      return { id, value: el ? (el.value || "").substring(0, 120) : null };
    });
  });
  console.log(JSON.stringify(finalFields, null, 2));

  // Now look for Save button
  console.log("\n=== LOOKING FOR SAVE ===");
  const allBtns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button"))
      .map((b) => ({
        text: (b.textContent || "").trim().substring(0, 60),
        visible: b.offsetParent !== null,
        class: (b.className || "").substring(0, 80),
      }))
      .filter((b) => b.visible && b.text);
  });
  console.log(JSON.stringify(allBtns, null, 2));
})();
