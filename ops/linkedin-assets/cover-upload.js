const { chromium } = require("playwright");

const COVER = "D:/Alparai/ops/linkedin-assets/cover.png";

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  console.log("=== CLICK BANNER EDIT ===");
  await page.click('button[aria-label="Arka planı düzenle"]');
  await page.waitForTimeout(2000);

  // Check what appeared
  const text = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log("After click:", text);

  // Look for file input or upload option
  const fileInputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="file"]')).map((i) => ({
      id: i.id,
      accept: i.accept,
      aria: i.getAttribute("aria-label"),
      visible: i.offsetParent !== null,
    }));
  });
  console.log("File inputs:", JSON.stringify(fileInputs));

  // Check for dropdown/menu items
  const menuItems = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        '.artdeco-dropdown__content-inner li, [role="menuitem"], .artdeco-dropdown__item',
      ),
    ).map((el) => ({
      text: el.textContent?.trim().substring(0, 50),
      visible: el.offsetParent !== null,
    }));
  });
  console.log("Menu items:", JSON.stringify(menuItems));

  // Click "Yükle" or "Upload" option
  const uploadClicked = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('li, [role="menuitem"], button, a'));
    const uploadItem = items.find((el) => {
      const text = (el.textContent || "").trim();
      return (
        (text === "Yükle" ||
          text === "Upload" ||
          text.includes("Yükle") ||
          text.includes("Dosya")) &&
        el.offsetParent !== null
      );
    });
    if (uploadItem) {
      uploadItem.click();
      return "clicked: " + uploadItem.textContent?.trim();
    }
    return "not found";
  });
  console.log("Upload click:", uploadClicked);
  await page.waitForTimeout(2000);

  // Now check for file input again
  const fileInputs2 = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="file"]')).map((i) => ({
      id: i.id,
      accept: i.accept,
      aria: i.getAttribute("aria-label"),
      visible: i.offsetParent !== null,
      name: i.name,
    }));
  });
  console.log("File inputs after upload click:", JSON.stringify(fileInputs2));

  // Try to find the banner file input
  if (fileInputs2.length > 0) {
    for (const fi of fileInputs2) {
      if (
        fi.aria?.includes("Banner") ||
        fi.aria?.includes("banner") ||
        fi.aria?.includes("arka plan") ||
        fi.aria?.includes("Arka plan") ||
        fi.id.includes("banner") ||
        fi.id.includes("cover")
      ) {
        console.log(`Setting file for: ${fi.id || fi.aria}`);
        const input =
          (await page.$(`#${fi.id}`)) ||
          (fi.aria ? await page.$(`input[aria-label="${fi.aria}"]`) : null);
        if (input) {
          await input.setInputFiles(COVER);
          console.log("Cover file set!");
          await page.waitForTimeout(3000);
        }
        break;
      }
    }
  }

  // Take screenshot
  try {
    await page.screenshot({
      path: "D:/Alparai/ops/linkedin-assets/banner-edit.png",
      timeout: 8000,
    });
    console.log("Screenshot saved");
  } catch (e) {}

  // Check for crop/save dialog
  const btns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button"))
      .map((b) => ({
        text: (b.textContent || "").trim().substring(0, 40),
        visible: b.offsetParent !== null,
        aria: b.getAttribute("aria-label"),
      }))
      .filter((b) => b.visible && b.text);
  });
  console.log("Buttons:", JSON.stringify(btns.slice(0, 15)));
})();
