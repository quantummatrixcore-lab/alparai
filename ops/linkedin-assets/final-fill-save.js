const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("URL:", page.url());

  // Find the scrollable edit panel container
  console.log("=== FINDING SCROLLABLE CONTAINER ===");
  const scrollInfo = await page.evaluate(() => {
    const containers = [];
    document.querySelectorAll("*").forEach((el) => {
      const style = getComputedStyle(el);
      if (
        (style.overflow === "auto" ||
          style.overflow === "scroll" ||
          style.overflowY === "auto" ||
          style.overflowY === "scroll") &&
        el.scrollHeight > el.clientHeight + 50
      ) {
        containers.push({
          tag: el.tagName,
          class: el.className?.toString().substring(0, 80),
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          id: el.id,
        });
      }
    });
    return containers;
  });
  console.log("Scrollable containers:", JSON.stringify(scrollInfo, null, 2));

  // Scroll the main content area
  console.log("\n=== SCROLLING ===");
  await page.evaluate(() => {
    // Try to find the edit form container
    const editForm = document.querySelector(".org-page-edit__content, .scaffold-layout__detail");
    if (editForm) {
      editForm.scrollTop = editForm.scrollHeight;
      console.log("Scrolled edit form");
    }
    // Scroll within the main scrollable area
    const scrollables = document.querySelectorAll('[style*="overflow"], [class*="scroll"]');
    scrollables.forEach((el) => {
      el.scrollTop = 500;
    });
    // Also scroll window
    window.scrollTo(0, 500);
  });
  await page.waitForTimeout(1000);

  // Re-check visibility
  const descVisible = await page.evaluate(() => {
    const el = document.getElementById("organization-description-field");
    return el ? el.offsetParent !== null : false;
  });
  console.log("Description visible after scroll:", descVisible);

  // If still not visible, try scrolling the right panel specifically
  if (!descVisible) {
    console.log("Trying more aggressive scroll...");
    await page.evaluate(() => {
      // LinkedIn edit panel is typically in scaffold-layout__detail
      const panels = document.querySelectorAll(
        '.scaffold-layout__detail, .org-page-edit, [class*="edit-panel"], [class*="detail"]',
      );
      panels.forEach((p) => {
        p.scrollTop = 1000;
        console.log("Scrolled panel:", p.className?.substring(0, 50));
      });
      // Also try scrolling specific scrollable parents of the description field
      const desc = document.getElementById("organization-description-field");
      if (desc) {
        let parent = desc.parentElement;
        while (parent) {
          if (parent.scrollHeight > parent.clientHeight + 20) {
            parent.scrollTop = parent.scrollHeight;
            console.log("Scrolled parent:", parent.className?.substring(0, 50));
          }
          parent = parent.parentElement;
        }
      }
    });
    await page.waitForTimeout(1000);

    const descVisible2 = await page.evaluate(() => {
      const el = document.getElementById("organization-description-field");
      return el ? el.offsetParent !== null : false;
    });
    console.log("Description visible after aggressive scroll:", descVisible2);
  }

  // Now fill description properly with Playwright
  console.log("\n=== FILL DESCRIPTION ===");
  const descField = await page.$("#organization-description-field");
  if (descField) {
    const vis = await descField.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { visible: el.offsetParent !== null, rect: { top: rect.top, height: rect.height } };
    });
    console.log("Description field state:", JSON.stringify(vis));

    // Force scroll to it
    await descField.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(500);

    // Clear and type
    await descField.click({ clickCount: 3 }).catch(() => {});
    await page.waitForTimeout(200);
    await descField.fill("").catch(async () => {
      // Fallback: select all and delete
      await page.keyboard.down("Control");
      await page.keyboard.press("a");
      await page.keyboard.up("Control");
      await page.keyboard.press("Backspace");
    });
    await page.waitForTimeout(200);

    await descField.type(
      "ALPAR AI is an independent public AI incident registry and evaluator. We track, rate, and verify AI incidents with public cryptographic proof — the Moody's for artificial intelligence. Our platform provides EU AI Act Article 73-ready public incident tracking, real-time AI risk scoring, and machine-learning safety evaluations. Founded in Istanbul, Turkey.",
      { delay: 5 },
    );
    console.log("Description typed");
  }

  // Fill founded year
  console.log("\n=== FILL FOUNDED YEAR ===");
  const foundedField = await page.$("#organization-founded-on-input");
  if (foundedField) {
    await foundedField.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(500);
    await foundedField.click();
    await foundedField.fill("2024");
    console.log("Founded year filled");
  }

  // Update tagline if needed
  console.log("\n=== CHECK TAGLINE ===");
  const taglineVal = await page.evaluate(
    () => document.getElementById("organization-tagline-field")?.value,
  );
  console.log("Current tagline:", taglineVal);
  if (taglineVal !== "Trust infrastructure for AI accountability") {
    const taglineField = await page.$("#organization-tagline-field");
    if (taglineField) {
      await taglineField.click({ clickCount: 3 });
      await page.keyboard.press("Backspace");
      await taglineField.type("Trust infrastructure for AI accountability", { delay: 10 });
      console.log("Tagline updated");
    }
  }

  // Final values check
  console.log("\n=== FINAL VALUES ===");
  const vals = await page.evaluate(() => {
    return {
      name: document.getElementById("organization-name-field")?.value,
      tagline: document.getElementById("organization-tagline-field")?.value,
      description: document
        .getElementById("organization-description-field")
        ?.value?.substring(0, 100),
      website: document.getElementById("organization-website-field")?.value,
      industry: document.getElementById("organization-industry-typeahead")?.value,
      founded: document.getElementById("organization-founded-on-input")?.value,
    };
  });
  console.log(JSON.stringify(vals, null, 2));

  // Click Save
  console.log("\n=== CLICKING SAVE ===");
  const saveBtn = await page.$('button:has-text("Kaydet")');
  if (saveBtn) {
    await saveBtn.click();
    console.log("Save clicked!");
    await page.waitForTimeout(5000);

    // Check if there's a confirmation dialog
    const confirmBtn = await page.$(
      'button:has-text("Devam"), button:has-text("Confirm"), button:has-text("Yes")',
    );
    if (confirmBtn) {
      await confirmBtn.click();
      await page.waitForTimeout(3000);
      console.log("Confirmed");
    }

    console.log("URL after save:", page.url());
    const postText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    console.log("Post-save text:", postText);
  } else {
    console.log("Save button not found!");
  }
})();
