const { chromium } = require("playwright");

const COVER = "D:/Alparai/ops/linkedin-assets/cover.png";

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  // Go to edit page info tab
  console.log("=== NAVIGATE TO EDIT INFO ===");
  await page.goto("https://www.linkedin.com/company/135125061/admin/edit/?editPageActiveTab=info", {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });
  await page.waitForTimeout(4000);

  // Check for banner/cover image upload
  console.log("=== LOOKING FOR BANNER UPLOAD ===");
  const bannerInfo = await page.evaluate(() => {
    // Look for banner/cover related elements
    const allElements = Array.from(document.querySelectorAll("*"));
    const bannerEls = allElements.filter((el) => {
      const text = (el.textContent || "").toLowerCase();
      const aria = (el.getAttribute("aria-label") || "").toLowerCase();
      return (
        text.includes("banner") ||
        text.includes("kapak") ||
        aria.includes("banner") ||
        aria.includes("cover")
      );
    });
    return bannerEls
      .map((el) => ({
        tag: el.tagName,
        text: el.textContent?.trim().substring(0, 40),
        aria: el.getAttribute("aria-label"),
        class: el.className?.toString().substring(0, 60),
      }))
      .slice(0, 10);
  });
  console.log("Banner elements:", JSON.stringify(bannerInfo, null, 2));

  // Find all file inputs
  const fileInputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="file"]')).map((i) => ({
      id: i.id,
      accept: i.accept,
      aria: i.getAttribute("aria-label"),
      visible: i.offsetParent !== null,
    }));
  });
  console.log("File inputs:", JSON.stringify(fileInputs));

  // Look for cover image button/link
  const coverBtns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a, [role="button"]'))
      .filter((el) => {
        const text = (el.textContent || "").toLowerCase();
        const aria = (el.getAttribute("aria-label") || "").toLowerCase();
        return (
          text.includes("banner") ||
          text.includes("kapak") ||
          text.includes("cover") ||
          aria.includes("banner") ||
          aria.includes("cover")
        );
      })
      .map((el) => ({
        tag: el.tagName,
        text: el.textContent?.trim().substring(0, 40),
        aria: el.getAttribute("aria-label"),
        visible: el.offsetParent !== null,
      }));
  });
  console.log("Cover buttons:", JSON.stringify(coverBtns));

  // Try clicking on the banner area
  const bannerClick = await page.evaluate(() => {
    // Look for banner/cover section - usually near the top of the edit page
    const bannerArea = document.querySelector(
      '.org-page-edit__banner, [data-test-id="banner"], .cover-image-container, .org-top-card__cover-image',
    );
    if (bannerArea) {
      bannerArea.click();
      return "clicked banner area";
    }

    // Try finding by looking at images or placeholder areas near the top
    const imgs = Array.from(document.querySelectorAll("img"));
    const coverImgs = imgs.filter((i) => {
      const w = i.naturalWidth || i.width;
      return w > 400; // Cover images are usually wide
    });
    if (coverImgs.length > 0) {
      coverImgs[0].click();
      return "clicked wide image";
    }

    return "banner area not found";
  });
  console.log("Banner click:", bannerClick);

  // Look for edit pencil/icon near banner
  const pencilIcons = await page.evaluate(() => {
    const icons = Array.from(
      document.querySelectorAll(
        '[aria-label*="düzenle"], [aria-label*="edit"], [aria-label*="Banner"], [aria-label*="cover"]',
      ),
    );
    return icons.map((i) => ({
      tag: i.tagName,
      aria: i.getAttribute("aria-label"),
      visible: i.offsetParent !== null,
      class: i.className?.toString().substring(0, 50),
    }));
  });
  console.log("Edit icons:", JSON.stringify(pencilIcons));

  // Take screenshot
  try {
    await page.screenshot({
      path: "D:/Alparai/ops/linkedin-assets/edit-info-tab.png",
      timeout: 10000,
    });
    console.log("Screenshot saved");
  } catch (e) {}
})();
