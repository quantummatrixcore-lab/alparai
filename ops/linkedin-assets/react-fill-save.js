const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("URL:", page.url());

  // Use React's internal fiber to set values properly
  const result = await page.evaluate(() => {
    const output = [];

    function setReactValue(element, value) {
      if (!element) return false;

      // Get React fiber
      const key = Object.keys(element).find(
        (k) => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$"),
      );
      if (!key) {
        // Fallback to native setter
        const tag = element.tagName;
        const proto =
          tag === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
        if (setter) {
          setter.call(element, value);
          element.dispatchEvent(new Event("input", { bubbles: true }));
          element.dispatchEvent(new Event("change", { bubbles: true }));
        }
        return true;
      }

      // Use React's onChange handler
      const fiber = element[key];
      let props = fiber?.memoizedProps || fiber?.pendingProps;
      if (props && props.onChange) {
        props.onChange({ target: { value } });
        return true;
      }

      return false;
    }

    // 1. Set description
    const desc = document.getElementById("organization-description-field");
    if (desc) {
      setReactValue(
        desc,
        "ALPAR AI is an independent public AI incident registry and evaluator. We track, rate, and verify AI incidents with public cryptographic proof — the Moody's for artificial intelligence. EU AI Act Article 73-ready platform for public incident tracking, real-time AI risk scoring, and ML safety evaluations.",
      );
      output.push("description: " + desc.value?.substring(0, 80));
    } else {
      output.push("description: NOT FOUND");
    }

    // 2. Set founded year
    const founded = document.getElementById("organization-founded-on-input");
    if (founded) {
      setReactValue(founded, "2024");
      output.push("founded: " + founded.value);
    } else {
      output.push("founded: NOT FOUND");
    }

    // 3. Verify other fields
    const name = document.getElementById("organization-name-field");
    const tagline = document.getElementById("organization-tagline-field");
    const website = document.getElementById("organization-website-field");
    const industry = document.getElementById("organization-industry-typeahead");

    output.push("name: " + name?.value);
    output.push("tagline: " + tagline?.value);
    output.push("website: " + website?.value);
    output.push("industry: " + industry?.value);

    return output;
  });

  console.log("Field values:", result);

  // Now try to save by finding the save button
  console.log("\n=== SAVING ===");
  const saved = await page.evaluate(() => {
    // Find the Kaydet button
    const buttons = Array.from(document.querySelectorAll("button"));
    const saveBtn = buttons.find((b) => {
      const text = (b.textContent || "").trim();
      return text === "Kaydet" && b.offsetParent !== null;
    });
    if (saveBtn) {
      saveBtn.click();
      return "clicked Kaydet";
    }
    return "Kaydet button not found";
  });
  console.log("Save result:", saved);

  await page.waitForTimeout(5000);

  // Check for confirmation dialog
  const dialogResult = await page.evaluate(() => {
    const modals = document.querySelectorAll('.artdeco-modal, [role="dialog"]');
    if (modals.length > 0) {
      const btns = modals[0].querySelectorAll("button");
      for (const btn of btns) {
        const text = (btn.textContent || "").trim();
        if (
          text.includes("Evet") ||
          text.includes("Emin") ||
          text.includes("Devam") ||
          text.includes("Confirm") ||
          text.includes("OK")
        ) {
          btn.click();
          return "dialog confirmed: " + text;
        }
      }
      return (
        "dialog found but no confirm button: " +
        Array.from(btns)
          .map((b) => b.textContent?.trim())
          .join(", ")
      );
    }
    return "no dialog";
  });
  console.log("Dialog:", dialogResult);

  await page.waitForTimeout(3000);

  console.log("Post-save URL:", page.url());

  // Final check
  const finalText = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log("\nFinal page:", finalText);
})();
