const { chromium } = require("playwright");

(async () => {
  console.log("Connecting to Chrome on 127.0.0.1:9222...");
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");

  // Find the right page
  const contexts = browser.contexts();
  let page = null;
  for (const ctx of contexts) {
    for (const p of ctx.pages()) {
      if (p.url().includes("linkedin.com/company/135125061")) {
        page = p;
        break;
      }
    }
  }

  if (!page) {
    console.log("LinkedIn page not found. Looking for any active page...");
    page = browser.contexts()[0].pages()[0];
  }

  console.log("Using URL:", page.url());

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

    // Tagline
    const tagline = document.getElementById("organization-tagline-field");
    if (tagline) {
      setReactValue(
        tagline,
        "The Trust Infrastructure for AI | Community-Governed AI Accountability & Registry",
      );
      output.push("tagline updated.");
    }

    // Description
    const desc = document.getElementById("organization-description-field");
    if (desc) {
      const newDesc =
        'ALPAR AI is the accountability layer and public registry for artificial intelligence. We are building the "Stripe for AI Safety"—a permanent, verified ledger of AI failures, hallucinations, and biases.\n\nAs AI integrates into every sector, the lack of transparency creates a massive trust deficit. ALPAR AI bridges this gap by providing an open infrastructure where security researchers, developers, and the public can document, verify, and track AI incidents.\n\nOur platform features:\n- Community-Governed AI Incident Registry\n- EU AI Act Article 73 Ready Compliance Tools\n- Anonymous Reporting & Zero-Knowledge Systems\n- Real-Time AI Provider Trust Scores\n\nALPAR AI empowers organizations to deploy AI with confidence through verifiable safety metrics and continuous accountability.';
      setReactValue(desc, newDesc);
      output.push("description updated.");
    }

    // Founded
    const founded = document.getElementById("organization-founded-on-input");
    if (founded) {
      setReactValue(founded, "2024");
      output.push("founded updated.");
    }

    // Website
    const website = document.getElementById("organization-website-field");
    if (website) {
      setReactValue(website, "https://alparai.com");
      output.push("website updated.");
    }

    return output;
  });

  console.log("Field values:", result);

  console.log("\n=== SAVING ===");
  const saved = await page.evaluate(() => {
    // LinkedIn buttons have different text based on language (Save, Kaydet)
    const buttons = Array.from(document.querySelectorAll("button"));
    const saveBtn = buttons.find((b) => {
      const text = (b.textContent || "").trim();
      return (
        (text === "Kaydet" ||
          text === "Save" ||
          text === "Değişiklikleri kaydet" ||
          text === "Save changes") &&
        b.offsetParent !== null &&
        !b.disabled
      );
    });

    if (saveBtn) {
      saveBtn.click();
      return "clicked Save (" + saveBtn.textContent.trim() + ")";
    }
    return "Save button not found or disabled";
  });

  console.log("Save result:", saved);

  await page.waitForTimeout(3000);

  // Close modals if any
  await page.evaluate(() => {
    const modals = document.querySelectorAll('.artdeco-modal, [role="dialog"]');
    if (modals.length > 0) {
      const btns = modals[0].querySelectorAll("button");
      for (const btn of btns) {
        const text = (btn.textContent || "").trim();
        if (
          text.includes("Evet") ||
          text.includes("Devam") ||
          text.includes("Confirm") ||
          text.includes("OK") ||
          text.includes("Yes")
        ) {
          btn.click();
        }
      }
    }
  });

  console.log("Done. Check Chrome window.");
  process.exit(0);
})();
