const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Screenshot logo
  await page.setViewportSize({ width: 400, height: 400 });
  await page.goto(
    "file:///" + path.resolve("D:/Alparai/ops/linkedin-assets/logo.html").replace(/\\/g, "/"),
  );
  await page.screenshot({ path: "D:/Alparai/ops/linkedin-assets/logo.png", omitBackground: false });
  console.log("Logo saved: logo.png");

  // Screenshot cover
  await page.setViewportSize({ width: 1128, height: 191 });
  await page.goto(
    "file:///" + path.resolve("D:/Alparai/ops/linkedin-assets/cover.html").replace(/\\/g, "/"),
  );
  await page.screenshot({
    path: "D:/Alparai/ops/linkedin-assets/cover.png",
    omitBackground: false,
  });
  console.log("Cover saved: cover.png");

  await browser.close();
  console.log("Done!");
})();
