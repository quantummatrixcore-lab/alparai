const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];

  console.log("URL:", page.url());

  // Skip screenshot, just get page content
  const text = await page.evaluate(() => document.body.innerText.substring(0, 4000));
  console.log("Page text:", text);

  // Find all images
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("img")).map((i) => ({
      src: i.src?.substring(0, 100),
      alt: i.alt,
      w: i.naturalWidth,
      h: i.naturalHeight,
      class: i.className?.substring(0, 60),
    }));
  });
  console.log("\nImages:", JSON.stringify(imgs.slice(0, 10), null, 2));

  // Find all buttons with useful info
  const btns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, [role="button"]'))
      .map((b) => ({
        text: (b.textContent || "").trim().substring(0, 60),
        aria: b.getAttribute("aria-label"),
        class: b.className?.substring(0, 80),
      }))
      .filter((b) => b.text || b.aria);
  });
  console.log("\nButtons:", JSON.stringify(btns.slice(0, 30), null, 2));
})();
