const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("URL:", page.url());

  // 1. SELECT COMPANY SIZE - find the dropdown
  console.log("=== 1. COMPANY SIZE ===");
  // Find all elements containing company size options
  const sizeResult = await page.evaluate(() => {
    // Find the size section label
    const labels = Array.from(document.querySelectorAll("*"));
    const sizeLabel = labels.find((el) => el.textContent?.trim() === "Şirket büyüklüğü");
    if (!sizeLabel) return "size label not found";

    // Find the nearest select or dropdown
    const parent = sizeLabel.closest("div");
    const allParents = [];
    let p = parent;
    while (p && allParents.length < 5) {
      allParents.push(p);
      p = p.parentElement;
    }

    // Look for select element in parents
    for (const container of allParents) {
      const select = container.querySelector("select");
      if (select) {
        return "found select: " + select.id + " options: " + select.options.length;
      }
      // Look for button/dropdown trigger
      const btn = container.querySelector(
        'button[aria-haspopup], [role="combobox"], [role="listbox"]',
      );
      if (btn) {
        return "found dropdown: " + btn.tagName + " " + btn.className?.substring(0, 50);
      }
    }

    return "no dropdown found in parents";
  });
  console.log("Size result:", sizeResult);

  // Try clicking on company size dropdown area
  const sizeClicked = await page.evaluate(() => {
    // Find the section with company size
    const allDivs = Array.from(document.querySelectorAll("div"));
    for (const div of allDivs) {
      const text = div.textContent?.trim();
      if (
        text?.startsWith("Şirket büyüklüğü") &&
        div.querySelector('select, [role="combobox"], button')
      ) {
        const trigger = div.querySelector('select, [role="combobox"], button');
        if (trigger) {
          trigger.click();
          return "clicked trigger in div";
        }
      }
    }
    return "not found";
  });
  console.log("Size clicked:", sizeClicked);
  await page.waitForTimeout(1000);

  // Try to find and interact with select element
  const selectOptions = await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll("select"));
    return selects.map((s) => ({
      id: s.id,
      name: s.name,
      options: Array.from(s.options)
        .map((o) => ({ value: o.value, text: o.text }))
        .slice(0, 5),
      visible: s.offsetParent !== null,
    }));
  });
  console.log("All selects:", JSON.stringify(selectOptions, null, 2));

  // Select company size "2-10 çalışan"
  if (selectOptions.length > 0) {
    for (const sel of selectOptions) {
      if (sel.options.some((o) => o.text.includes("çalışan"))) {
        console.log("Found company size select:", sel.id);
        await page.selectOption(`#${sel.id}`, { label: "2-10 çalışan" }).catch(async () => {
          // Try by value
          const val = "2-10";
          await page.selectOption(`#${sel.id}`, val).catch(() => {});
        });
        console.log("Selected 2-10 çalışan");
        break;
      }
    }
  }

  // 2. ADD SPECIALTIES
  console.log("\n=== 2. ADD SPECIALTIES ===");

  // First check what pill inputs exist
  const pillInputs = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll('input[id*="artdeco-pill"], input[name*="pill"]'),
    ).map((i) => ({
      id: i.id,
      visible: i.offsetParent !== null,
      placeholder: i.placeholder,
    }));
  });
  console.log("Pill inputs:", JSON.stringify(pillInputs));

  // Find the specialty add button more carefully
  const addSpecBtns = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    return btns
      .filter((b) => {
        const text = (b.textContent || "").trim();
        return text.includes("Uzmanlık ekle") || text.includes("Add specialty");
      })
      .map((b) => ({
        text: b.textContent?.trim().substring(0, 30),
        visible: b.offsetParent !== null,
        aria: b.getAttribute("aria-label"),
        class: b.className?.substring(0, 60),
        parent: b.parentElement?.className?.substring(0, 60),
      }));
  });
  console.log("Add specialty buttons:", JSON.stringify(addSpecBtns, null, 2));

  // Click the first visible "Uzmanlık ekle" button
  const specialties = ["Artificial Intelligence", "AI Safety", "AI Accountability"];

  for (const spec of specialties) {
    // Click add button
    const btnClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const addBtn = btns.find(
        (b) => (b.textContent || "").includes("Uzmanlık ekle") && b.offsetParent !== null,
      );
      if (addBtn) {
        addBtn.click();
        return true;
      }
      return false;
    });

    if (btnClicked) {
      await page.waitForTimeout(1000);

      // Find the newly appeared pill input
      const input = await page.$(
        'input[id*="artdeco-pill"]:not([value]), input[placeholder*="ekle"], input[placeholder*="add"]',
      );
      if (input) {
        const visible = await input.evaluate((el) => el.offsetParent !== null);
        if (visible) {
          await input.click();
          await input.type(spec, { delay: 30 });
          await page.waitForTimeout(1500);
          await page.keyboard.press("Enter");
          await page.waitForTimeout(500);
          console.log("Added:", spec);
          continue;
        }
      }

      // Fallback: try any visible pill input
      const pillInputs2 = await page.$$('input[id*="artdeco-pill"]');
      for (const pi of pillInputs2) {
        const vis = await pi.evaluate((el) => el.offsetParent !== null && !el.value);
        if (vis) {
          await pi.click();
          await pi.type(spec, { delay: 30 });
          await page.waitForTimeout(1500);
          await page.keyboard.press("Enter");
          await page.waitForTimeout(500);
          console.log("Added (fallback):", spec);
          break;
        }
      }
    }
  }

  // 3. SAVE
  console.log("\n=== 3. SAVING ===");
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const saveBtn = btns.find((b) => b.textContent?.trim() === "Kaydet" && b.offsetParent !== null);
    if (saveBtn) saveBtn.click();
  });
  await page.waitForTimeout(5000);

  console.log("URL:", page.url());

  // 4. NOW FIX TAGLINE on Sayfa bilgisi tab
  console.log("\n=== 4. FIX TAGLINE ===");
  // Click Sayfa bilgisi tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll("button"));
    const infoTab = tabs.find(
      (b) => b.textContent?.includes("Sayfa bilgisi") && b.offsetParent !== null,
    );
    if (infoTab) infoTab.click();
  });
  await page.waitForTimeout(2000);

  const taglineState = await page.evaluate(() => {
    const el = document.getElementById("organization-tagline-field");
    return { value: el?.value, visible: el?.offsetParent !== null };
  });
  console.log("Tagline state:", JSON.stringify(taglineState));

  if (taglineState.visible) {
    const taglineField = await page.$("#organization-tagline-field");
    await taglineField.click({ clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.keyboard.type("Trust infrastructure for AI accountability", { delay: 20 });
    const val = await taglineField.inputValue();
    console.log("Tagline now:", val);
  }

  // Final save
  console.log("\n=== 5. FINAL SAVE ===");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const saveBtn = btns.find((b) => b.textContent?.trim() === "Kaydet" && b.offsetParent !== null);
    if (saveBtn) saveBtn.click();
  });
  await page.waitForTimeout(5000);

  console.log("DONE! URL:", page.url());
})();
